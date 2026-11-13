import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

// Apache is not available to the tests, so these only guard the rules that
// have gone wrong before. What the live server sends was measured after the
// first deploy and is recorded in docs/DEPLOY.md.
const lines = fs
  .readFileSync(new URL('../../public/.htaccess', import.meta.url), 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const headersNamed = (name: string) => lines.filter((line) => new RegExp(`^Header\\b.*\\b${name}\\b`).test(line));

describe('public/.htaccess', () => {
  it('gives the one-year cache only to files under /_astro/, whose names carry a hash', () => {
    const longLived = lines.filter((line) => line.includes('immutable'));

    expect(longLived).toHaveLength(1);
    expect(longLived[0]).toMatch(/env=hashed$/);
    expect(lines).toContain('SetEnvIf Request_URI "^/_astro/" hashed');
  });

  it('does not choose a cache lifetime by file extension', () => {
    // Pagefind's scripts and stylesheet keep the same name from build to
    // build, so a rule keyed on ".js" would pin a stale copy for a year.
    expect(lines.filter((line) => line.startsWith('<FilesMatch'))).toEqual([]);
  });

  it('makes everything else revalidate', () => {
    expect(lines).toContain('Header set Cache-Control "no-cache"');
  });

  it('sets the one-year cache after the general rule, so it is the one that wins', () => {
    // Apache applies Header lines in order: the other way round, "no-cache"
    // would overwrite the long cache on every hashed file.
    const general = lines.indexOf('Header set Cache-Control "no-cache"');
    const longLived = lines.findIndex((line) => line.includes('immutable'));

    expect(general).toBeGreaterThanOrEqual(0);
    expect(longLived).toBeGreaterThan(general);
  });

  it.each([
    ['X-Content-Type-Options', '"nosniff"'],
    ['X-Frame-Options', '"DENY"'],
    ['Referrer-Policy', '"strict-origin-when-cross-origin"'],
    ['Strict-Transport-Security', '"max-age=31536000"'],
  ])('sends %s', (name, value) => {
    const matching = headersNamed(name);

    expect(matching).toHaveLength(1);
    expect(matching[0]).toContain(value);
  });

  it('does not redirect to HTTPS itself', () => {
    // SiteGround's "HTTPS Enforce" does that at the server, in front of
    // Apache. A second redirect here could loop behind its proxy.
    expect(lines.filter((line) => /^Rewrite/.test(line))).toEqual([]);
  });
});
