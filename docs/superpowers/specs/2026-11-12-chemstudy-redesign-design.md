# ChemStudy — redesign of the AP Chemistry site

Design agreed 2026-11-12. This document covers the whole project and
specifies **Stage 1** in detail; Stages 2–4 each get their own spec when
they start.

## 1. Goal

Replace the current lessons site (`apchem.rionature.com`, a styled dump of
converted LaTeX) with **ChemStudy**: a public, self-contained AP®
Chemistry resource that a student who has never met the author can learn
from. The old look and feel is dropped entirely. A new **theory layer** —
lessons written for the web — is added on top of the practice material
that already exists.

## 2. Decisions

| Question | Decision |
|---|---|
| Audience | Any AP Chemistry student, anywhere. Not tied to the co-op class. |
| Accounts | None at launch. Progress is stored on the student's device. Built so accounts can be added later without a rebuild. |
| Theory | A full lesson per AP topic (about 90, 1.1–9.11), each ending in a one-screen key-points summary. Written fresh from the AP course framework, not from the textbook. |
| Organization | One spine: the 9 AP units. Zumdahl-chapter material is folded in, re-labeled by AP topic as extra practice. No chapter track on the public site. |
| Name and address | **ChemStudy**, at **chem-study.com** (hosted on the existing SiteGround GrowBig plan). "AP® Chemistry" appears in the tagline, never as the brand. |
| Look and feel | Calm, book-like: warm paper, serif headings, one muted color per unit. Home page quiet; lesson pages carry slightly more color. |
| Technology | Astro static site. |
| License | Creative Commons BY-NC-SA 4.0, the same license as AP_Chem_Prep. |
| Repository | A **new repository**, `chem-study`, separate from AP_Chem_Prep, in the local folder `Downloads\Chemistry_Resources\chem-study`. |
| LaTeX | None. ChemStudy contains no LaTeX documents and needs no LaTeX software to build. Equations are typed in standard math notation, which the web renderer reads. |
| Existing practice | **Converted once** into ChemStudy's own format, checked, and from then on edited only in ChemStudy. No ongoing import. AP_Chem_Prep stays as it is for printed class packets; the two diverge. |

## 3. Stages

Each stage ends with something live.

1. **Foundation and brand.** Brand kit, site skeleton, Unit 5 (Kinetics)
   complete end to end, automatic build and deploy. The old site stays up
   at the old address.
2. **Practice layer.** Convert worksheets, self-study ladders, exams and
   comprehensive tests for all 9 units into ChemStudy (once); chapter
   material as extra practice; periodic table and equation sheet; old
   address redirects.
3. **Theory, unit by unit.** Lessons for the remaining 8 units, each unit
   published when it is ready.
4. **Later features.** Accounts, timed mock exams, flashcards, a teacher
   area — each its own project.

Unit 5 goes first because it has the most verified material and good
candidates for interactive diagrams.

## 4. Brand

**Mark.** A periodic-table tile reading **Cs** (ChemStudy; also cesium,
element 55, shown as the tile's atomic number), set beside the wordmark
"ChemStudy" in Fraunces. The tile alone is the favicon and app icon.

**Color.** Paper `#FDFCF9`, card `#FFFFFF`, line `#EBE6DC`, ink
`#26231F`, secondary text `#6B655D`. One muted color per unit:

| Unit | Name | Color |
|---|---|---|
| 1 | Clay | `#B9736B` |
| 2 | Amber | `#C08A5A` |
| 3 | Ochre | `#A8924C` |
| 4 | Sage | `#7F9C70` |
| 5 | Teal | `#6F9A94` |
| 6 | Slate | `#7590B3` |
| 7 | Lavender | `#8E86B5` |
| 8 | Mauve | `#A97F9E` |
| 9 | Rose | `#B97A88` |

Each unit color has a darker text variant and a pale tint, derived so
that text on paper and on the tint meets WCAG AA (4.5:1). The values
above are for fills and markers only. A dark theme uses the same hues on
a near-black warm background; the theme follows the device setting and
can be switched by hand.

**Type.** Fraunces for headings, Newsreader for lesson text, Inter for
buttons, labels and menus. All three are served from the site itself,
not from a font CDN.

**Voice.** A teacher talking, not a textbook. Start from something
concrete; short sentences; no "in this section we will". Example:
"Double a reactant and the reaction usually speeds up. The surprise is by
how much."

**Use of color by page.** Home page: units as a plain list, each with a
single color dot. Lesson pages: the unit color appears in the kicker,
the active topic in the sidebar, the Key idea box (tinted background with
a colored left edge) and the answer state of Check yourself questions.

## 5. Site structure

| Page | Address | Contents |
|---|---|---|
| Home | `/` | Headline, the nine units, "continue where you left off" |
| Unit | `/unit-5-kinetics/` | Overview, topic list with done-marks, unit practice |
| Lesson | `/unit-5-kinetics/5-2-rate-law/` | One lesson (section 6) |
| Practice | `/unit-5-kinetics/practice/<name>/` | Worksheet, ladder, exam or comprehensive test |
| Tools | `/tools/periodic-table/`, `/tools/equations/` | Reference (Stage 2) |
| About | `/about/` | Author, how content is checked, license, AP® note |
| Not found | any bad address | A helpful 404 with search |

Search is available from every page. On desktop a lesson shows the
unit's topics on the left and the current lesson's sections on the
right; on a phone both fold into a menu and previous/next links sit at
the bottom.

## 6. Lesson format

Every lesson has the same seven parts, in order:

1. **Opening** — two or three sentences on why the topic matters.
2. **Explanation** — short sections, one idea each, with diagrams.
3. **Worked examples** — full step-by-step solutions.
4. **Check yourself** — 3–5 questions spread through the lesson, with
   instant feedback and a reason for the right answer.
5. **Common mistakes** — the specific traps for the topic.
6. **Key points** — a one-screen summary; also the review sheet.
7. **Practice next** — links to matching practice.

A topic is marked done on the student's device when its checks have all
been answered. Lessons print cleanly from the browser. Content the AP
framework excludes from the exam is labeled as beyond the exam, as the
comprehensive tests already do.

## 7. Architecture

**Location.** Its own repository, `SahanGH/chem-study`, cloned to
`Downloads\Chemistry_Resources\chem-study`. The site is the repository
root. It builds on its own: no LaTeX, and no access to AP_Chem_Prep.
AP_Chem_Prep is not changed by this project.

The parent folder `Chemistry_Resources` also holds copyrighted textbooks,
slides and `Tro_Reference\` (chapter-by-chapter text of two Tro
textbooks, kept for fact-checking). All of it sits **beside** the
repository, never inside it; a CI step refuses any PDF or slide deck
committed by mistake. Reference books are for checking facts — lesson
wording is always original.

**Framework.** Astro, static output, TypeScript.

**Content.** Lessons are MDX files, one per topic, in
`src/content/lessons/unit-N/`. A schema validates each file's
header: unit, topic code, title, reading time, summary. An invalid or
missing header fails the build. Units are described in one data file
(number, title, slug, color, topic order) that the home page, unit
pages and navigation all read.

**Components.** Each has one job and is used identically in every lesson:

| Component | Purpose |
|---|---|
| `KeyIdea` | The one sentence to remember from a section |
| `Worked` | A worked example with numbered steps |
| `Check` | A multiple-choice or numeric question with feedback |
| `Trap` | A common mistake |
| `KeyPoints` | The end-of-lesson summary |
| `PracticeNext` | Links to matching practice |
| `Figure` | An image or diagram with a caption and alt text |

**Interactive diagrams.** Svelte components, loaded only on pages that
use them, drawn in SVG. Stage 1 ships three for Unit 5: concentration
against time for zero, first and second order (choose the order, see the
three linear plots); an energy profile with and without a catalyst; a
rate-law explorer (change a concentration, see the rate respond). Each
works by keyboard and has a text description.

**Math and chemistry.** KaTeX with its mhchem extension, rendered during
the build. No math runs in the browser.

**Search.** Pagefind, generated at build time, covering lessons and
practice.

**Progress.** One module, `progress`, with a small interface
(`markDone`, `isDone`, `lastVisited`, `unitProgress`) backed by browser
storage. Pages use only that interface, so an account-backed version can
replace the storage later. If storage is unavailable the site works
without progress and says nothing about it.

**Practice (Stage 1: Unit 5 only).** Practice documents are MDX files in
`src/content/practice/unit-N/`, built from the same kind of components
as lessons: `Question` (prompt, points, topic), `Answer` (the worked
solution behind "Show explanation") and `Figure`.

The existing material gets there by a **one-time conversion**. The
converter in AP_Chem_Prep (`tools/tex2html.py`) is given an export mode
that writes each Unit 5 practice document as MDX, with its figures as
image files, into a folder outside both repositories. Each converted
document is then checked against its PDF — every question present, every
answer present, every equation rendering — before it is committed to
`chem-study`. After that the MDX is the master copy: corrections are
made in ChemStudy, and AP_Chem_Prep is not consulted again. The export
mode is a migration tool, not part of ChemStudy.

Printable copies come from the site's own print layout; ChemStudy does
not link to the LaTeX PDFs.

**Styling.** Plain CSS with design tokens as custom properties; fluid
type and spacing with `clamp()`; layout by grid and container queries.
No CSS framework.

**Without JavaScript** lessons are fully readable; Check questions fall
back to a "show answer" disclosure. Search, progress and interactive
diagrams need JavaScript.

## 8. Quality

- **Chemistry.** Every lesson passes an independent fact-check before
  publication — numbers recomputed, claims checked against the AP course
  framework — the same standard as the comprehensive tests.
- **Build.** Schema validation, broken internal links and missing lesson
  parts fail the build.
- **Unit tests** (Vitest) for quiz logic and the progress module.
- **Browser tests** (Playwright) open the home page, a unit page, a
  lesson and a practice page at phone and desktop widths, exercise a
  Check question and an interactive diagram by keyboard, and run an
  accessibility scan (axe). Target: WCAG 2.1 AA.
- **Converted practice.** Each converted document is compared with its
  PDF before commit (question count, answer count, point totals), and a
  build check fails on any math that does not render.

## 9. Build and deploy

`chem-study` gets its own pipeline, set up the way AP_Chem_Prep and
gbv-signups are: a `Test and deploy` workflow, a main-only `production`
environment holding the SSH secrets, its own deploy key, and a `Protect
main` ruleset (pull request required, checks required, no force-push or
deletion, no bypass).

- A pull request installs dependencies, builds the site and runs the
  unit and browser tests. This check is required to merge.
- A push to `main` builds and deploys `dist/` to the chem-study.com
  document root over SSH, then verifies by checksum over SSH and flushes
  the cache.
- The old site at its old address is not touched until Stage 2.
- Changes are previewed on the build machine (`npm run dev`) before a
  pull request is opened.

## 10. Privacy and legal

No accounts, no advertising, no tracking cookies, no third-party font or
script requests. The footer and About page state the license (CC
BY-NC-SA 4.0) and that AP® is a trademark of the College Board, which
was not involved in and does not endorse the site.

## 11. Stage 1 is done when

1. chem-study.com serves the new site over HTTPS.
2. The home page, Unit 5 page, all 11 Unit 5 lessons (5.1–5.11), Unit 5
   practice, About and 404 pages exist in the agreed design, in light
   and dark themes, from phone to desktop width.
3. Every Unit 5 lesson has all seven parts and has passed fact-check.
4. Three interactive diagrams work by mouse, touch and keyboard.
5. Search finds Unit 5 lessons and practice.
6. Progress is remembered across visits on the same device.
7. A merge to `main` builds, tests and deploys with no manual step.
8. Units 1–4 and 6–9 appear on the home page marked "coming soon", so
   the site is honest about what exists.

## 12. Outside Stage 1

Converting Units 1–4 and 6–9 practice, the periodic table and equation
sheet, redirecting the old address, lessons for the other 8 units,
accounts, mock exams, flashcards and the teacher area.

## 13. Depends on

- chem-study.com registered and added as a site on the GrowBig plan.
- A deploy key for `chem-study` imported in SiteGround Site Tools.
- This document moves into `chem-study` (`docs/`) when that repository
  is created.
