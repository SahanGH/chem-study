# Deploying ChemStudy

`chem-study.com` is served by SiteGround. A merge to `main` builds the site
on GitHub and uploads `dist/` over SSH. Nothing is deployed by hand.

## How it flows

1. Work on `topic/<name>`. Preview with `npm run dev`.
2. Before pushing: `npm test` and `npm run test:e2e`.
3. Open a pull request into `main`. The **Build and test** check must pass.
4. Merge. The push to `main` reruns the check, then **Deploy to SiteGround**
   builds, uploads with `rsync --delete`, verifies three files by checksum
   over SSH and flushes the cache.

`main` is protected by the **Protect main** ruleset: pull request required,
check required, no force-push or deletion, no bypass.

## GitHub settings

Secrets, in the **production** environment (deployment branches: `main`
only):

| Secret | Value |
|---|---|
| `SG_HOST` | SSH hostname from Site Tools → Devs → SSH Keys Manager → SSH Credentials |
| `SG_USER` | SSH username from the same panel |
| `SG_PATH` | Absolute path of the site's `public_html` |
| `SG_SSH_KEY` | Private half of the deploy key |
| `SG_KNOWN_HOSTS` | The server's host-key lines |

Variable, in the same environment:

| Variable | Value |
|---|---|
| `SG_SITE_ID` | The `id=` of chem-study.com from `site-tools-client domain-all list`. If unset, the cache flush is skipped. |

Setting a secret from Git Bash on Windows: pipe the value in. Git Bash
rewrites an argument that starts with `/` into a Windows path, so
`--body "/home/..."` stores the wrong `SG_PATH`.

    printf '%s' '/home/customer/www/chem-study.com/public_html' | gh secret set SG_PATH --env production

Keep them out of **Settings → Secrets and variables → Actions**: a secret
there can be read by a workflow run from any branch. This repository is
public, so the environment is what keeps a pull request from a fork away
from the SSH key.

## The deploy key

CI has its own RSA key, used for nothing else, imported in Site Tools →
Devs → SSH Keys Manager with the name `github-actions-chemstudy-deploy`.
Import it there rather than editing `~/.ssh/authorized_keys2` by hand: Site
Tools rewrites that file. Leave the IP restriction empty: GitHub's
addresses change.

To rotate: generate a new key, import it, update `SG_SSH_KEY`, delete the
old key in Site Tools.

## One-time server setup

The deploy refuses to write into a folder that is not marked as this site's
root, because `rsync --delete` removes everything else there. Once, over
SSH:

    touch <SG_PATH>/.chemstudy-site

## HTTPS

SiteGround's **HTTPS Enforce** (Site Tools → Security) redirects `http://`
to `https://` at its own server, in front of Apache. On 2026-11-13, before
the first deploy, `http://chem-study.com/` answered `301` from `nginx` with
`Location: https://chem-study.com/`. `public/.htaccess` therefore has no
redirect of its own, and must not get one: behind SiteGround's proxy a
rewrite keyed on `%{HTTPS}` can loop.

## NGINX Direct Delivery stays off

In Site Tools → Speed → Caching, **NGINX Direct Delivery** is turned
**off** for chem-study.com, and must stay off.

With it on, SiteGround serves stylesheets, scripts and images straight
from NGINX, which does not read `public/.htaccess`. Measured on
2026-11-13, right after the first deploy: pages came through Apache with
our headers, but `/pagefind/pagefind-ui.js` came back with NGINX's own
`Cache-Control: max-age=31536000` and none of the security headers. Files
whose names do not change between builds (the search scripts, everything
in `/figures/`, the favicon) would then stay stale in a returning
student's browser for up to a year: a corrected diagram would not reach
them.

With it off, every response goes through Apache. Measured the same day:

| Request | `Cache-Control` | Security headers |
|---|---|---|
| `/` | `no-cache` | all four |
| `/pagefind/pagefind-ui.js` | `no-cache` | all four |
| `/_astro/<hashed file>` | `public, max-age=31536000, immutable` | all four |

The four are `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy` and `Strict-Transport-Security`.

To check again, for example after SiteGround changes its caching or the
site moves: three requests, not a loop. SiteGround's bot protection
blocks an address after a burst of automated requests.

    curl.exe -sI https://chem-study.com/
    curl.exe -sI https://chem-study.com/pagefind/pagefind-ui.js
    curl.exe -sI https://chem-study.com/_astro/<any file named in the page source>

If a one-year cache shows up on `pagefind-ui.js` again, Direct Delivery
has been switched back on.

## When a deploy fails

- **Missing secrets** — the "Check the deploy settings" step names them.
- **No `.chemstudy-site` marker** — `SG_PATH` is wrong, or the one-time
  setup above was not done.
- **Host key mismatch** — SiteGround moved the server. Read the new key
  over a connection you trust and update `SG_KNOWN_HOSTS`. Do not disable
  the check.
- **Verify step fails** — the upload was interrupted. Re-run the job.
