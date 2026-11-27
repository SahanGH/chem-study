# ChemStudy American English and Unit 1 Check Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make American English a rule of the repository that the build checks, and make every Check in Unit 1 say something useful when a student gets it wrong.

**Architecture:** A rules file (`CLAUDE.md`) and a word-list script run by a unit test. `Check` gains three attributes (`misses`, `slips`, `tolerance`), checked when the page is built and read by the page's script. Unit 1's 116 messages live in a data file and are written into the eight lessons by a tool.

**Tech Stack:** Astro 7, MDX, Vitest, Playwright + axe. No new package.

**Spec:** `docs/superpowers/specs/2026-11-26-chemstudy-us-english-and-unit-1-check-feedback-design.md`.

**Data:** `docs/superpowers/plans/2026-11-26-chemstudy-unit-1-check-feedback.json`. It is the master copy of the messages. The tables at the end of this plan are a picture of it as written on 2026-11-26, for the teacher to read; if a message changes, change the data file.

**Builds on:** the Unit 1 lessons plan (`2026-11-16-chemstudy-unit-1-lessons.md`) for the rules a Check follows, and Plan 3 (`2026-11-13-chemstudy-unit-5-practice.md`) for "Conventions for every task".

## Facts verified before writing (do not rediscover)

Established on 2026-11-26 against `main` at `4cb0029` (the merge of pull request #67).

1. **Counts.** The site has 247 Checks: 185 with options and 62 with a typed number. Unit 1 has 36 (28 and 8), in eight lessons: 5, 4, 4, 4, 5, 5, 5 and 4. Every Unit 1 Check with options has four options. The answers sit at options 1 to 4 in 4, 9, 8 and 7 of the 28.
2. **`Check` today** (`src/components/lesson/Check.astro`) takes `answer` or `numeric`, and `unit`. Its script says "Not quite. Try another." for a wrong option and "Not quite. Check your setup and try again." for a wrong number. `gradeNumeric` (`src/lib/check.ts`) accepts 2 percent either way; the constant is `TOLERANCE`.
3. **The existing browser tests click Checks in lesson 5.2** and expect those two sentences (`tests/e2e/lesson.spec.ts`, `a11y.spec.ts`, `csp.spec.ts`). Unit 5 gets no messages here, so they pass unchanged. **Do not change them.**
4. **Nothing in `scripts/` or `tests/` reads a `<Check …>` tag from a lesson file**, so a tag may run over several lines.
5. **No message holds a double quotation mark, a brace, `<`, `>`, `$` or a backslash.** Each can be written as a double-quoted string in MDX.
6. **Every slip's value was recomputed** with the exam table's masses (`src/data/elements.ts`: I 126.90, Li 6.94, Na 22.99, Ge 72.63, Cu 63.55, O 16.00, H 1.008, C 12.01, Ti 47.87) and Avogadro's number 6.022 × 10²³. Every slip lies outside the range its Check accepts.
7. **The two tolerances.** Lesson 1.1, Check 5 (answer 9.26e21): at 0.5 percent the page accepts 9.214e21 to 9.306e21, so 9.3e21 passes and 9.35e21 does not. Lesson 1.2, Check 3 (answer 65.38): at 0.5 percent it accepts 65.05 to 65.71, so 65.33, 65.4 and 65.45 pass and 64.95, 65.0 and 66.18 do not.
8. **The two reordered Checks** (lesson 1.3, Check 2; lesson 1.4, Check 3) have explanations that name options by what they say, never by position. Explanations in lessons 1.5 and 1.7 do say "the first option" or "the last statement"; those Checks are not reordered.
9. **What was run while writing this plan** (Node 22.23.5, on a clone of `main`):
   - `scripts/us-spelling.mjs`, as given in Task 2: 344 files, 0 found.
   - The new functions of `src/lib/check.ts`, as given in Task 3, with the test cases of Task 3 run through Node's `assert` in place of Vitest: all 48 expectations pass.
   - The apply tool of Task 7: it changed the eight lessons (309 lines added, 39 removed), a second run changed nothing, and `--verify` passed. Afterward the answers sat at 6, 7, 8 and 7.
10. **What was not run:** `npm test`, the Astro build and the browser tests. The writing session could not install the packages. So the changes to `Check.astro` (Task 4), to `check-dist.mjs` (Task 5) and the browser tests (Task 8) are untested as written. Watch each test fail first, as always, and fix the code in this plan where it is wrong.
11. **`getAttribute` in `node-html-parser`**, which `check-dist.mjs` uses: Astro writes `"` inside an attribute as `&quot;`. Whether `getAttribute` hands it back decoded is not known. Task 5's first test settles it.

## Conventions for every task

Plan 3's "Conventions for every task" apply: tests first, no swallowed errors, conventional commits with no AI-attribution trailer, the scratch folder for everything that is not the site, the lock for browser tests if another folder is building.

**American English** in every file, by the rule this plan adds. The Education Skills Library writes British English; nothing of its wording goes into a file unchanged.

**Merging.** Nothing is merged without the teacher's word. Each pull request is opened, its "Build and test" check is watched until it passes (`gh pr checks <n>`), and it is left for the teacher. Merging to `main` deploys the site.

**Models.** Writers and fact-checkers on Fable 5.2; fixers on Sonnet.

---

## Group A: design, plan, data and the rules file (pull request A)

Branch `topic/us-english-and-unit-1-feedback-design`, from `main`. This plan, the design, the data file and `CLAUDE.md`, committed and opened as a pull request with base `main`. It waits for the teacher.

`CLAUDE.md` goes in with the design, not with the spelling check, so that the rule is in force for the session that builds the rest.

- [x] Put the four files in place and commit. Done on 2026-11-26 by the session that wrote them: `docs: design and plan American English and Unit 1 check feedback`, then `docs: add CLAUDE.md with the American English rule`.

---

## Group B: American English (pull request B)

### Task 1: `CLAUDE.md`

In pull request A (Group A). Nothing to do here.

- [x] Before Task 2, read `CLAUDE.md` at the top of the repository, and confirm that its paragraph "The check" names the two files Task 2 creates.

### Task 2: The spelling check

**Files:**
- Create: `scripts/us-spelling.mjs`
- Create: `tests/unit/us-spelling.test.ts`

- [x] **Step 1: Write the failing test.**

  ```ts
  import { fileURLToPath } from 'node:url';
  import { describe, expect, it } from 'vitest';
  import { britishSpellings, checkSpelling } from '../../scripts/us-spelling.mjs';

  const words = (text: string) => britishSpellings(text).map((found) => found.word);

  describe('britishSpellings', () => {
    it('finds British spellings of each kind the rule lists', () => {
      expect(words('The colour of vapourised caesium')).toEqual(['colour', 'vapourised', 'caesium']);
      expect(words('ionisation, analysed, a labelled centre, 5 litres')).toEqual([
        'ionisation',
        'analysed',
        'labelled',
        'centre',
        'litres',
      ]);
      expect(words('Maths: 50 per cent. Sulphuric acid on aluminium.')).toEqual([
        'maths',
        'per cent',
        'sulphuric',
        'aluminium',
      ]);
    });

    it('leaves American spellings and look-alikes alone', () => {
      expect(words('analyses made an hour apart; catalysis; synthesis; emphasis')).toEqual([]);
      expect(words('rise, precise, exercise, otherwise, galvanized, burnt sienna')).toEqual([]);
    });

    it('says which line a word is on', () => {
      expect(britishSpellings('one\ntwo colour\nthree')).toEqual([{ word: 'colour', line: 2 }]);
    });
  });

  describe('the site', () => {
    it('is written in American English', () => {
      const root = fileURLToPath(new URL('../../', import.meta.url));
      const { files, problems } = checkSpelling(root);

      // An empty or misplaced folder would otherwise pass.
      expect(files).toBeGreaterThan(100);
      expect(problems).toEqual([]);
    });
  });
  ```

- [x] **Step 2: Run it and watch it fail**: `npx vitest run tests/unit/us-spelling.test.ts`. Expected: the import fails, because the script does not exist.

- [x] **Step 3: Write the script.**

  ```js
  // Finds British spellings and usage in the site's sources. The rule is in
  // CLAUDE.md: everything in this repository is written in American English.
  //
  //   node scripts/us-spelling.mjs            reads the folders in SCANNED
  //   node scripts/us-spelling.mjs <file>...  reads only the files named
  //
  // It reads and changes nothing. It exits with 1 when it finds anything.
  import fs from 'node:fs';
  import path from 'node:path';
  import { fileURLToPath } from 'node:url';

  /** What is read, from the top of the repository. */
  export const SCANNED = ['src', 'public/figures', 'tests', 'scripts', 'README.md', 'docs/DEPLOY.md'];

  /** The file types that hold words a person wrote. */
  const EXTENSIONS = new Set(['.astro', '.css', '.md', '.mdx', '.mjs', '.svelte', '.svg', '.ts']);

  /**
   * Files that name British spellings on purpose: this list and its test. Paths
   * are from the top of the repository, with forward slashes. CLAUDE.md, which
   * states the rule, and docs/superpowers/, whose plans quote the spellings they
   * changed, are not read at all.
   */
  export const SKIPPED = new Set(['scripts/us-spelling.mjs', 'tests/unit/us-spelling.test.ts']);

  /**
   * A word that must stand, with its reason. Lowercase. Empty today: add to it
   * only when the American spelling would be wrong, never to quiet the check.
   * @type {Map<string, string>}
   */
  export const ALLOWED = new Map([]);

  // Verbs that end in -ize in American English, by their stem. A general
  // "-ise" pattern would catch rise, precise, exercise and otherwise.
  const IZE_STEMS = [
    'atom', 'author', 'capital', 'categor', 'central', 'character', 'critic', 'crystall', 'custom', 'delocal',
    'emphas', 'equal', 'familiar', 'final', 'galvan', 'general', 'harmon', 'hybrid', 'initial', 'ion', 'item',
    'local', 'magnet', 'maxim', 'memor', 'minim', 'modern', 'neutral', 'normal', 'optim', 'organ', 'oxid',
    'penal', 'polar', 'pressur', 'priorit', 'random', 'rational', 'real', 'recogn', 'solubil', 'special',
    'stabil', 'standard', 'steril', 'summar', 'symbol', 'synthes', 'util', 'vapor', 'vapour', 'visual',
  ];

  // Verbs that end in -yze in American English. "Analyses" is left out: it is
  // the plural of "analysis" on both sides of the Atlantic.
  const YZE = ['analyse', 'analysed', 'analysing', 'catalys(?:e|ed|es|ing)', 'electrolys(?:e|ed|es|ing)', 'hydrolys(?:e|ed|es|ing)', 'paralys(?:e|ed|es|ing)'];

  const OUR = ['behaviour', 'colour', 'favour', 'flavour', 'harbour', 'honour', 'humour', 'labour', 'neighbour', 'odour', 'rumour', 'tumour', 'vapour', 'vigour'];

  const RE = ['calibre', 'centimetre', 'centre', 'fibre', 'kilometre', 'litre', 'metre', 'millilitre', 'millimetre', 'nanometre', 'picometre', 'theatre'];

  const DOUBLED = ['cancell', 'channell', 'fuell', 'labell', 'levell', 'modell', 'signall', 'travell'];

  const WORDS = [
    'aeroplane', 'ageing', 'aluminium', 'amongst', 'anticlockwise', 'caesium', 'centring', 'cheque',
    'defence', 'dreamt', 'grey', 'judgement', 'learnt', 'licence', 'maths', 'mould', 'offence', 'practise',
    'practised', 'practises', 'practising', 'programme', 'programmes', 'skilful', 'spelt', 'towards', 'tyre',
    'tyres', 'whilst',
  ];

  const PHRASES = ['full stop', 'per cent'];

  const PATTERN = new RegExp(
    '\\b(?:' +
      [
        `(?:${IZE_STEMS.join('|')})is(?:e|ed|es|ing|ation|ations|able|ability)`,
        ...YZE,
        `(?:${OUR.join('|')})\\w*`,
        `(?:${RE.join('|')})(?:s|d)?`,
        `(?:${DOUBLED.join('|')})(?:ed|ing)`,
        'sulph\\w+',
        ...WORDS,
        ...PHRASES,
      ].join('|') +
      ')\\b',
    'gi',
  );

  /**
   * @param {string} text
   * @returns {{ word: string, line: number }[]} every British spelling, in order
   */
  export function britishSpellings(text) {
    const found = [];
    for (const match of text.matchAll(PATTERN)) {
      const word = match[0].toLowerCase();
      if (ALLOWED.has(word)) continue;
      const line = text.slice(0, match.index).split('\n').length;
      found.push({ word, line });
    }
    return found;
  }

  /** @param {string} target a file or a folder @returns {string[]} the files under it that are read */
  function filesUnder(target) {
    if (!fs.existsSync(target)) return [];
    if (fs.statSync(target).isFile()) return [target];
    return fs
      .readdirSync(target, { withFileTypes: true })
      .flatMap((entry) => {
        const full = path.join(target, entry.name);
        if (entry.isDirectory()) return filesUnder(full);
        return EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
      })
      .sort();
  }

  /**
   * @param {string} root the top of the repository
   * @param {string[]} [targets] files or folders under it; SCANNED when left out
   * @returns {{ files: number, problems: { file: string, line: number, word: string }[] }}
   */
  export function checkSpelling(root, targets = SCANNED) {
    const problems = [];
    let files = 0;
    for (const target of targets) {
      for (const file of filesUnder(path.resolve(root, target))) {
        const relative = path.relative(root, file).split(path.sep).join('/');
        if (SKIPPED.has(relative)) continue;
        files += 1;
        for (const { word, line } of britishSpellings(fs.readFileSync(file, 'utf8'))) {
          problems.push({ file: relative, line, word });
        }
      }
    }
    return { files, problems };
  }

  function main() {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const named = process.argv.slice(2);
    const { files, problems } = checkSpelling(root, named.length > 0 ? named : SCANNED);
    for (const { file, line, word } of problems) console.error(`${file}:${line}: ${word}`);
    console.log(`us-spelling: ${files} files, ${problems.length} British spelling(s)`);
    if (problems.length > 0) process.exit(1);
  }

  // Real paths on both sides, as in check-dist.mjs: a symlink must not make the
  // script check nothing and succeed.
  const entryPoint = process.argv[1];
  if (entryPoint && fs.realpathSync(entryPoint) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
  ```

- [x] **Step 4: Run the test and the script.** `npx vitest run tests/unit/us-spelling.test.ts` passes. `node scripts/us-spelling.mjs` prints `us-spelling: 344 files, 0 British spelling(s)`, or a larger count of files if lessons were added since. If it finds a word, fix the word in its file. Add a word to `ALLOWED` only when the American spelling would be wrong there, and say so in the pull request.

- [x] **Step 5: See it catch one.** Add "colour" to a sentence of any lesson, run the test, see it name the file and line, and take the word out again.

- [x] **Step 6: `typescript-reviewer` and `code-reviewer` on the diff. Commit.** `test: check the site's sources for British spellings`

- [x] **Step 7: Open pull request B**, stacked on A. Its text says what the check reads and what it does not (`docs/superpowers/`, `CLAUDE.md`), and that "analyses" and "burnt" are left off the list on purpose.

---

**As carried out (Group B), 2026-11-26.**

- **The named reviewers** (`typescript-reviewer`, `code-reviewer`) were not available in the Claude Code session that carried the plan out. One fresh general-purpose agent did both reviews, here and in Groups C and D.
- **The review found four gaps in the script, closed in a second commit with a test each:** "per cent" and "full stop" split by a line break or a double space; plurals and "-er" forms (offences, licences, judgements, moulds, travellers, organiser, analyser); `.js` and `.json` files, now read (two test fixtures today, both clean); a file named on the command line that is not there, which now stops with an error instead of checking nothing. The script reads 346 files, not 344.
- **Left as the plan has it:** "hydrolyses", "electrolyses" and "catalyses" are flagged, though they are also plurals of the "-lysis" nouns; the British verb is the likelier slip.
- Pull request B is #69.

## Group C: what a Check can say (pull request C)

No lesson changes in this group, so no page changes.

### Task 3: Grading with a tolerance, and reading the messages

**Files:**
- Modify: `src/lib/check.ts`
- Modify: `tests/unit/check.test.ts`

- [x] **Step 1: Write the failing tests.** In `tests/unit/check.test.ts`, extend the import to

```ts
import {
  gradeChoice,
  gradeNumeric,
  messagesFrom,
  nearestSlip,
  parseNumber,
  readMisses,
  readSlips,
  readTolerance,
  shownAnswer,
  slipsFrom,
  type CheckAnswer,
} from '../../src/lib/check';
```

  and add at the end of the file:

  ```ts
  describe('gradeNumeric with a tolerance of its own', () => {
    it('refuses a slip that the page-wide 2 percent would accept', () => {
      expect(gradeNumeric('9.35e21', 9.26e21)).toBe('correct');
      expect(gradeNumeric('9.35e21', 9.26e21, 0.005)).toBe('incorrect');
      expect(gradeNumeric('64.95', 65.38, 0.005)).toBe('incorrect');
      expect(gradeNumeric('66.18', 65.38, 0.005)).toBe('incorrect');
    });

    it('still accepts the answer as a student rounds it', () => {
      expect(gradeNumeric('9.3e21', 9.26e21, 0.005)).toBe('correct');
      expect(gradeNumeric('9.258e21', 9.26e21, 0.005)).toBe('correct');
      expect(gradeNumeric('65.33', 65.38, 0.005)).toBe('correct');
      expect(gradeNumeric('65.4', 65.38, 0.005)).toBe('correct');
    });
  });

  describe('readTolerance', () => {
    it('is the page-wide 2 percent when the Check sets none', () => {
      expect(readTolerance(undefined, '5')).toBe(0.02);
    });

    it('turns a percent into a fraction', () => {
      expect(readTolerance(0.5, '5')).toBe(0.005);
    });

    it.each([
      ['more than 2 percent', 5, /at most 2/],
      ['zero', 0, /above 0/],
      ['text', '0.5', /percent/],
    ])('refuses %s', (_name, percent, message) => {
      expect(() => readTolerance(percent, '5')).toThrow(message);
    });

    it('refuses a tolerance on a Check with options', () => {
      expect(() => readTolerance(0.5, undefined)).toThrow(/cannot have a `tolerance`/);
    });
  });

  describe('readMisses', () => {
    it('returns the messages keyed by option number', () => {
      expect(readMisses({ 1: 'Follow the units.', 3: 'Which way?' }, 2)).toEqual({
        '1': 'Follow the units.',
        '3': 'Which way?',
      });
      expect(readMisses(undefined, 2)).toBeUndefined();
    });

    it.each([
      ['a message for the answer itself', { 2: 'Follow the units.' }, /is the answer/],
      ['option 0', { 0: 'Follow the units.' }, /option number from 1/],
      ['a key that is not a number', { a: 'Follow the units.' }, /option number from 1/],
      ['an empty message', { 1: '' }, /is empty/],
      ['math in a message', { 1: 'Use $K_c$ here.' }, /math or markup/],
      ['a message that opens as the page does', { 1: 'Not quite. Try again.' }, /Not quite/],
      ['a message with no ending', { 1: 'No ending' }, /period or a question mark/],
      ['a message over the limit', { 1: `${'x'.repeat(180)}.` }, /181 characters/],
      ['a list', ['Follow the units.'], /option numbers and messages/],
    ])('refuses %s', (_name, misses, message) => {
      expect(() => readMisses(misses, 2)).toThrow(message);
    });

    it('refuses misses on a Check with a typed number', () => {
      expect(() => readMisses({ 1: 'Follow the units.' }, undefined)).toThrow(/takes `slips`/);
    });
  });

  describe('readSlips', () => {
    it('returns the messages keyed by the value as written', () => {
      expect(readSlips({ '0.0400': 'The particles are I₂ molecules.' }, '0.0200', 0.02)).toEqual({
        '0.0400': 'The particles are I₂ molecules.',
      });
      expect(readSlips(undefined, '0.0200', 0.02)).toBeUndefined();
    });

    it('refuses a slip the page would mark correct, until the tolerance is narrowed', () => {
      const slips = { '9.35e21': 'Check the molar mass.' };
      expect(() => readSlips(slips, '9.26e21', 0.02)).toThrow(/would mark it correct/);
      expect(readSlips(slips, '9.26e21', 0.005)).toEqual(slips);
    });

    it.each([
      ['a key that is not a number', { lots: 'Count again.' }, /keyed by a number/],
      ['one value written two ways', { '6': 'Count again.', '6.0': 'Count again.' }, /listed twice/],
      ['a message with no ending', { '6': 'Count again' }, /period or a question mark/],
    ])('refuses %s', (_name, slips, message) => {
      expect(() => readSlips(slips, '5', 0.02)).toThrow(message);
    });

    it('refuses slips on a Check with options', () => {
      expect(() => readSlips({ '6': 'Count again.' }, undefined, 0.02)).toThrow(/takes `misses`/);
    });
  });

  describe('nearestSlip', () => {
    const slips = [
      { value: 1.31e25, message: 'straight to atoms' },
      { value: 0.3, message: 'stopped at moles' },
    ];

    it('matches a typed value within 1 percent of a slip', () => {
      expect(nearestSlip(1.3e25, slips)?.message).toBe('straight to atoms');
      expect(nearestSlip(0.3002, slips)?.message).toBe('stopped at moles');
    });

    it('matches nothing when no slip is that near', () => {
      expect(nearestSlip(1.2e25, slips)).toBeNull();
      expect(nearestSlip(5, [])).toBeNull();
    });

    it('picks the nearer of two slips whose ranges overlap', () => {
      const close = [
        { value: 66.18, message: 'four peaks as equals' },
        { value: 66.93, message: 'five peaks as equals' },
      ];
      expect(nearestSlip(66.5, close)?.message).toBe('four peaks as equals');
      expect(nearestSlip(66.6, close)?.message).toBe('five peaks as equals');
    });

    it('matches a slip of zero only with zero', () => {
      const zero = [{ value: 0, message: 'nothing left' }];
      expect(nearestSlip(0, zero)?.message).toBe('nothing left');
      expect(nearestSlip(1e-6, zero)).toBeNull();
    });
  });

  describe('messagesFrom and slipsFrom', () => {
    it('read what Check.astro wrote into the page', () => {
      expect(messagesFrom(undefined)).toEqual({});
      expect(messagesFrom('{"1":"Follow the units."}')).toEqual({ '1': 'Follow the units.' });
      expect(slipsFrom('{"1.31e25":"a","0.300":"b"}')).toEqual([
        { value: 1.31e25, message: 'a' },
        { value: 0.3, message: 'b' },
      ]);
    });

    it('refuse anything that is not a set of messages', () => {
      expect(() => messagesFrom('[1]')).toThrow(/not a set of messages/);
      expect(() => messagesFrom('{"1":2}')).toThrow(/not a set of messages/);
      expect(() => slipsFrom('{"lots":"a"}')).toThrow(/not a number/);
    });
  });
  ```

- [x] **Step 2: Run them and watch them fail**: `npx vitest run tests/unit/check.test.ts`. Expected: the new names are not exported.

- [x] **Step 3: Give `gradeNumeric` its third argument.** Replace its first four lines:

```ts
/**
 * `tolerance` is the fraction of the answer a typed value may differ by. It
 * is the page's 2 percent unless the Check set its own (readTolerance).
 */
export function gradeNumeric(text: string, answer: number, tolerance: number = TOLERANCE): NumericGrade {
  const value = parseNumber(text);
  if (value === null) return 'invalid';
  const allowed = answer === 0 ? ZERO_ANSWER_TOLERANCE : Math.abs(answer) * tolerance;
```

  The rest of the function stays. Change the comment on `TOLERANCE` to "Fraction of the expected value a numeric answer may differ by, unless the Check sets its own."

- [x] **Step 4: Add the new functions** at the end of `src/lib/check.ts`:

  ```ts
  /** How near a typed answer must be to a slip's value, as a fraction of that value, to be given its message. */
  const SLIP_WINDOW = 0.01;

  /** The longest feedback message, in characters: about four lines on a 320 px phone. */
  export const FEEDBACK_LIMIT = 180;

  /** A wrong numeric answer a known mistake gives, and what to say about it. */
  export interface Slip {
    value: number;
    message: string;
  }

  /**
   * Why a feedback message cannot be used, or null when it can. A message is
   * plain text shown after "Not quite.", so it carries no math, no markup and
   * no opening of its own.
   */
  export function feedbackProblem(message: unknown): string | null {
    if (typeof message !== 'string' || message.trim() === '') return 'is empty';
    if (message !== message.trim()) return 'has a space at its start or end';
    if (message.length > FEEDBACK_LIMIT) return `is ${message.length} characters long; the limit is ${FEEDBACK_LIMIT}`;
    if (/[$<>\\]/.test(message)) return 'has math or markup in it; write formulas as the prose does (H₂, 10²³)';
    if (/^not quite/i.test(message)) return 'starts with "Not quite", which the page adds';
    if (!/[.?]$/.test(message)) return 'does not end with a period or a question mark';
    return null;
  }

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * A Check's own tolerance, written in percent (`tolerance={0.5}`), as a
   * fraction. A Check may tighten the page's 2 percent, never loosen it: a
   * looser one would mark wrong methods correct.
   */
  export function readTolerance(percent: unknown, numeric: string | undefined): number {
    if (percent === undefined) return TOLERANCE;
    if (numeric === undefined) throw new Error('A Check with `answer` (an option number) cannot have a `tolerance`.');
    if (typeof percent !== 'number' || !(percent > 0) || percent > TOLERANCE * 100) {
      throw new Error(
        `A Check's tolerance is a percent above 0 and at most ${TOLERANCE * 100}, such as tolerance={0.5}, ` +
          `not ${JSON.stringify(percent)}.`,
      );
    }
    return percent / 100;
  }

  /**
   * The messages for a choice Check's wrong options, keyed by option number
   * from 1. Throws when the lesson's `misses` cannot be used. Whether each
   * number names an option the Check has is checked on the built page
   * (scripts/check-dist.mjs), which is where the options are.
   */
  export function readMisses(misses: unknown, answer: number | undefined): Record<string, string> | undefined {
    if (misses === undefined) return undefined;
    if (answer === undefined) throw new Error('A Check with `numeric` takes `slips`, not `misses`.');
    if (!isPlainObject(misses)) throw new Error('Write misses as option numbers and messages: misses={{ 1: "…", 3: "…" }}.');
    const read: Record<string, string> = {};
    for (const [key, message] of Object.entries(misses)) {
      const option = Number(key);
      if (!Number.isInteger(option) || option < 1) throw new Error(`A miss is keyed by an option number from 1, not ${JSON.stringify(key)}.`);
      if (option === answer) throw new Error(`Option ${option} is the answer, so it cannot have a miss.`);
      const problem = feedbackProblem(message);
      if (problem) throw new Error(`The miss for option ${option} ${problem}.`);
      read[String(option)] = message as string;
    }
    return read;
  }

  /**
   * The messages for a numeric Check's known wrong answers, keyed by the value
   * as the lesson wrote it. Throws when a slip cannot be used, and when one lies
   * inside the tolerance: the page would mark that mistake correct.
   */
  export function readSlips(
    slips: unknown,
    numeric: string | undefined,
    tolerance: number,
  ): Record<string, string> | undefined {
    if (slips === undefined) return undefined;
    if (numeric === undefined) throw new Error('A Check with `answer` (an option number) takes `misses`, not `slips`.');
    if (!isPlainObject(slips)) throw new Error('Write slips as values and messages: slips={{ "0.0400": "…" }}.');
    const answer = parseNumber(numeric);
    if (answer === null) throw new Error(`A Check's numeric answer must be a number, not ${JSON.stringify(numeric)}.`);
    const seen = new Set<number>();
    const read: Record<string, string> = {};
    for (const [key, message] of Object.entries(slips)) {
      const value = parseNumber(key);
      if (value === null) throw new Error(`A slip is keyed by a number such as "0.0400" or "1.31e25", not ${JSON.stringify(key)}.`);
      if (seen.has(value)) throw new Error(`The slip ${key} is listed twice.`);
      seen.add(value);
      if (gradeNumeric(key, answer, tolerance) === 'correct') {
        throw new Error(
          `The slip ${key} is within ${tolerance * 100} percent of the answer ${numeric}, so the page would mark it correct. ` +
            'Give the Check a smaller `tolerance`, or drop the slip.',
        );
      }
      const problem = feedbackProblem(message);
      if (problem) throw new Error(`The message for the slip ${key} ${problem}.`);
      read[key] = message as string;
    }
    return read;
  }

  /**
   * The slip a typed value most likely is: the nearest one, when the value is
   * within 1 percent of it. Null when no slip is that near. A slip of exactly
   * zero is matched only by zero.
   */
  export function nearestSlip(value: number, slips: Slip[]): Slip | null {
    let nearest: Slip | null = null;
    let nearestDistance = Infinity;
    for (const slip of slips) {
      const distance = Math.abs(value - slip.value);
      const window = slip.value === 0 ? ZERO_ANSWER_TOLERANCE : Math.abs(slip.value) * SLIP_WINDOW;
      if (distance <= window * (1 + FLOAT_SLACK) && distance < nearestDistance) {
        nearest = slip;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  /**
   * The messages a Check carries in a data attribute, as written by
   * Check.astro. Throws when the attribute is not a set of messages: a page
   * built from a lesson cannot carry anything else.
   */
  export function messagesFrom(json: string | undefined): Record<string, string> {
    if (json === undefined) return {};
    const parsed: unknown = JSON.parse(json);
    if (!isPlainObject(parsed) || !Object.values(parsed).every((message) => typeof message === 'string')) {
      throw new Error('A Check carries feedback that is not a set of messages.');
    }
    return parsed as Record<string, string>;
  }

  /** The slips a Check carries, each value read the way a typed answer is. */
  export function slipsFrom(json: string | undefined): Slip[] {
    return Object.entries(messagesFrom(json)).map(([key, message]) => {
      const value = parseNumber(key);
      if (value === null) throw new Error(`A Check has a slip that is not a number: ${key}`);
      return { value, message };
    });
  }
  ```

- [x] **Step 5: Run the tests, see them pass.** Every older test in the file passes unchanged: `gradeNumeric` with two arguments behaves as before.

- [x] **Step 6: Commit.** `feat(check): grade with a Check's own tolerance and read its feedback`

### Task 4: `Check.astro` takes and shows the messages

**Files:**
- Modify: `src/components/lesson/Check.astro`

There is no unit test for an Astro component here; the build check (Task 5) and the browser tests (Task 8) cover it. In this task the proof is the build: every existing lesson still builds, and a stand-in shows the attributes arriving.

- [x] **Step 1: The frontmatter.** Replace the top of the file with:

```astro
---
import { readMisses, readSlips, readTolerance, shownAnswer, type CheckAnswer } from '../../lib/check';

interface Props extends CheckAnswer {
  /** With `answer`: what to say for each wrong option, by option number from 1. */
  misses?: Record<number, string>;
  /** With `numeric`: what to say for each known wrong answer, by its value written as text. */
  slips?: Record<string, string>;
  /** With `numeric`: the percent of the answer a typed value may differ by. 2 when left out. */
  tolerance?: number;
}

const { answer, numeric, unit, misses, slips, tolerance } = Astro.props;
const shown = shownAnswer({ answer, numeric, unit });
// Each of these throws, and stops the build, when a lesson wrote something unusable.
const allowed = readTolerance(tolerance, numeric);
const optionMessages = readMisses(misses, answer);
const slipMessages = readSlips(slips, numeric, allowed);
---

<cs-check
  data-part="check"
  data-answer={answer}
  data-numeric={numeric}
  data-unit={unit}
  data-tolerance={tolerance === undefined ? undefined : allowed}
  data-misses={optionMessages && JSON.stringify(optionMessages)}
  data-slips={slipMessages && JSON.stringify(slipMessages)}
>
```

  The markup inside `<cs-check>` does not change. An attribute whose value is `undefined` is left off the page, as `data-numeric` is today on a Check with options.

- [x] **Step 2: The page's script.** Extend its import:

```ts
import { gradeChoice, gradeNumeric, messagesFrom, nearestSlip, parseNumber, slipsFrom } from '../../lib/check';
```

  In `enhanceChoice`, read the messages once, before the buttons are made, beside the labels (so a failure leaves the page without JavaScript's version intact):

```ts
const misses = messagesFrom(this.dataset.misses);
```

  and replace the wrong-option line `say('Not quite. Try another.', 'no');` with

```ts
const miss = misses[String(index + 1)];
say(miss ? `Not quite. ${miss}` : 'Not quite. Try another.', 'no');
```

  In `enhanceNumeric`, before the form is built:

```ts
const slips = slipsFrom(this.dataset.slips);
// Absent on a Check that keeps the page-wide tolerance; gradeNumeric then uses its default.
const tolerance = this.dataset.tolerance === undefined ? undefined : Number(this.dataset.tolerance);
if (tolerance !== undefined && !(tolerance > 0)) {
  throw new Error(`cs-check has a tolerance that is not a positive number: ${this.dataset.tolerance}`);
}
```

  and in the submit handler, grade with it and look for a slip:

```ts
const grade = gradeNumeric(input.value, answer, tolerance);
if (grade === 'invalid') {
  say('Enter a number, for example 0.25 or 2.5e-3.', 'no');
} else if (grade === 'incorrect') {
  const typed = parseNumber(input.value);
  // gradeNumeric returned 'incorrect', so the text is a number; the test satisfies the type checker.
  const slip = typed === null ? null : nearestSlip(typed, slips);
  say(slip ? `Not quite. ${slip.message}` : 'Not quite. Check your setup and try again.', 'no');
} else {
```

  The `else` branch stays as it is.

- [x] **Step 3: Build.** `npm run build` passes with no lesson changed: no page carries the new attributes yet.

- [x] **Step 4: See the attributes arrive, and the build refuse a bad one.** In the working tree only, give the first Check of lesson 1.5 the `misses` shown in the design's section 4.1, build, and find `data-misses` on that page in `dist/`. Then change one message so it starts "Not quite", build, and see the build stop with the message from `readMisses`. Restore the lesson: `git checkout src/content/lessons`.

- [x] **Step 5: `typescript-reviewer` and `code-reviewer`. Commit.** `feat(check): show a message for a wrong option or a known slip`

### Task 5: The build check

**Files:**
- Modify: `scripts/check-dist.mjs`
- Modify: `tests/unit/check-dist.test.ts`

- [x] **Step 1: Write the failing tests.** In `tests/unit/check-dist.test.ts`, import `FEEDBACK_UNITS` beside `checkPage` and add, inside `describe('checkPage', …)`:

```ts
  describe('feedback on a check', () => {
    const withMisses = (answer: number, options: number, misses: Record<number, string>, quote = "'") =>
      `<cs-check data-part="check" data-answer="${answer}" data-misses=${quote}${
        quote === '"' ? JSON.stringify(misses).replaceAll('"', '&quot;') : JSON.stringify(misses)
      }${quote}><ul>${'<li>x</li>'.repeat(options)}</ul></cs-check>`;
    const numeric = (slips?: Record<string, string>) =>
      `<cs-check data-part="check" data-numeric="5"${slips ? ` data-slips='${JSON.stringify(slips)}'` : ''}></cs-check>`;
    const parts = part('worked') + part('trap') + part('key-points') + part('practice-next');
    const inUnit = (unit: number, checks: string) => `<main data-topic="${unit}.2">${parts}${checks}</main>`;
    const all = { 2: 'Follow the units.', 3: 'Follow the units.', 4: 'Follow the units.' };

    it('reads messages whose quotation marks the build escaped', () => {
      const html = inUnit(5, withMisses(1, 4, { 9: 'Follow the units.' }, '"').repeat(3));
      expect(checkPage(html, everythingExists)).toContainEqual(expect.stringContaining('feedback for option 9'));
    });

    it('reports a message for an option the check does not have, in any unit', () => {
      const html = inUnit(5, withMisses(1, 4, { 5: 'Follow the units.' }).repeat(3));
      expect(checkPage(html, everythingExists)).toContainEqual(
        'lesson 5.2: a check has feedback for option 5 but has only 4 options',
      );
    });

    it('asks nothing of a unit that is not on the list', () => {
      expect(FEEDBACK_UNITS.has('5')).toBe(false);
      expect(checkPage(inUnit(5, choice(1, 4).repeat(3)), everythingExists)).toEqual([]);
    });

    it('in a unit on the list, reports a wrong option with no message', () => {
      const [unit] = [...FEEDBACK_UNITS];
      if (unit === undefined) return; // The list is empty until Unit 1's messages are written (Task 8).
      const html = inUnit(Number(unit), withMisses(1, 4, { 2: 'Follow the units.', 3: 'Follow the units.' }).repeat(3));
      expect(checkPage(html, everythingExists)).toContainEqual(`lesson ${unit}.2: a check says nothing for wrong option 4`);
    });

    it('in a unit on the list, reports a typed-number check that names no slip', () => {
      const [unit] = [...FEEDBACK_UNITS];
      if (unit === undefined) return;
      const html = inUnit(Number(unit), withMisses(1, 4, all).repeat(2) + numeric());
      expect(checkPage(html, everythingExists)).toContainEqual(`lesson ${unit}.2: a typed-number check names no slip`);
    });

    it('in a unit on the list, passes checks that are complete', () => {
      const [unit] = [...FEEDBACK_UNITS];
      if (unit === undefined) return;
      const html = inUnit(Number(unit), withMisses(1, 4, all).repeat(2) + numeric({ '6': 'Count again.' }));
      expect(checkPage(html, everythingExists)).toEqual([]);
    });
  });
```

  The three "on the list" tests do nothing while the list is empty. That is deliberate and lasts one pull request: Task 8 puts Unit 1 on the list, and from then on they run. Do not leave an early `return` in a test anywhere else.

- [x] **Step 2: Run them and watch them fail.** Expected: `FEEDBACK_UNITS` is not exported.

- [x] **Step 3: Write the check.** In `scripts/check-dist.mjs`, after `REQUIRED_PARTS`:

```js
/**
 * Units whose lessons must say something for every wrong answer: a message
 * for each wrong option, and at least one slip for each typed number. A unit
 * is added when its messages are written. Unit numbers as text.
 * @type {Set<string>}
 */
export const FEEDBACK_UNITS = new Set([]);

/** @param {string | undefined} json a data attribute written by Check.astro @returns {string[]} its keys */
function feedbackKeys(json) {
  return json === undefined ? [] : Object.keys(JSON.parse(json));
}
```

  In `checkPage`, inside `if (main) { … }`, the loop over `cs-check[data-answer]` gains, after the existing test of the answer:

```js
      const misses = feedbackKeys(check.getAttribute('data-misses')).map(Number);
      for (const option of misses) {
        if (option > options) {
          problems.push(`lesson ${topic}: a check has feedback for option ${option} but has only ${options} options`);
        }
      }
      if (needsFeedback) {
        for (let option = 1; option <= options; option += 1) {
          if (option !== answer && !misses.includes(option)) {
            problems.push(`lesson ${topic}: a check says nothing for wrong option ${option}`);
          }
        }
      }
```

  with, before that loop,

```js
    const needsFeedback = FEEDBACK_UNITS.has((topic ?? '').split('.')[0]);
```

  and, after it,

```js
    if (needsFeedback) {
      for (const check of main.querySelectorAll('cs-check[data-numeric]')) {
        if (feedbackKeys(check.getAttribute('data-slips')).length === 0) {
          problems.push(`lesson ${topic}: a typed-number check names no slip`);
        }
      }
    }
```

  If the first test of Step 1 fails because `getAttribute` returns the text with `&quot;` still in it, decode in `feedbackKeys` (`json.replaceAll('&quot;', '"').replaceAll('&amp;', '&')`, the ampersand last) and say in a comment why.

- [x] **Step 4: Run the tests, then the whole build.** `npx vitest run tests/unit/check-dist.test.ts`, then `npm run build`: the site builds, and `check-dist` reports the same number of pages as before with no problems.

- [x] **Step 5: Reviews. Commit.** `feat(check-dist): check a Check's feedback against its options`

- [x] **Step 6: Open pull request C**, stacked on B. Its text says that no page changes.

---

**As carried out (Group C), 2026-11-26.**

- **Fact 11 is settled:** `node-html-parser`'s `getAttribute` hands `&quot;` back decoded. `feedbackKeys` needs no decoding.
- **The review found one problem that mattered, fixed with tests:** with a 0.5 percent tolerance, a slip's 1 percent window can reach past the answer. In lesson 1.2, 65.72 is nearer the answer, 65.38, than the slip 66.18, and was told it averaged the peaks as equals. `nearestSlip` takes the answer as an optional third argument and matches a slip only when the typed value is nearer the slip; `Check.astro` passes it.
- **Two smaller fixes from the same review:** an option key must be written "1", "2", … (`{ 1: "…", "01": "…" }` kept one message silently); a tolerance on an answer of zero is refused, since that answer is graded by a fixed window.
- The browser tests that click lesson 5.2's Checks (lesson, accessibility and content-security specs) pass unchanged.
- Pull request C is #70.

## Group D: Unit 1's messages (pull request D)

### Task 6: Fact-check the data file

No file of the site changes in this task.

- [x] **Step 1: One fact-checker on Fable 5.2, with a fresh context.** It is given the eight lessons of `src/content/lessons/unit-1/`, the data file, and section 4.4 of the design. For each of the 36 Checks, in this order:
  1. Solve the Check from its question alone.
  2. For a Check with options: for each wrong option, write down the mistake that leads to it, before reading the message.
  3. For a typed number: work out each slip's value from the mistake named in its `from`, with the exam table's masses (`src/data/elements.ts`) and unrounded intermediates. Report any value that differs in its last digit.
  4. Then read each message and judge it: Is it true? Does it fit the mistake? Does it give the answer away, or say which option is right? Does it say anything the lesson's explanation does not support? Does it use a term the lesson does not? Is an "only", "every", "always" or "never" true as worded? Is it American English?
  5. For the two reordered Checks: does the explanation still read correctly with the options in the new order?
  6. For the two tolerances: compute the range accepted, and name any honest way of rounding that falls outside it.

- [x] **Step 2: Fix the data file** (a fixer on Sonnet applies the decided list; a message it believes is right is left and reported, with the reason). Each message must still pass `feedbackProblem`.

- [x] **Step 3: A second check** of every message that changed, by a fresh agent.

- [x] **Step 4: Commit the data file** if it changed: `docs: fact-check Unit 1's check feedback`.

### Task 7: Write the messages into the lessons

**Files:**
- Modify: the eight lessons of `src/content/lessons/unit-1/`

- [x] **Step 1: Save the apply tool** in the scratch folder as `scratchpad/unit1-feedback/apply-check-feedback.mjs`. It is not part of the site.

  ```js
  // Writes the feedback in a data file into the lessons it names, and checks it.
  // A tool for the session scratch folder; it is not part of the site.
  //
  //   node apply-check-feedback.mjs <feedback.json> <repository>           apply
  //   node apply-check-feedback.mjs <feedback.json> <repository> --verify  compare only, change nothing
  //
  // It stops, changing nothing, when a lesson does not hold what the data file
  // expects: a different number of Checks, an option whose text differs, or an
  // explanation sentence that is not there exactly once.
  import fs from 'node:fs';
  import path from 'node:path';

  const [dataPath, root, flag] = process.argv.slice(2);
  if (!dataPath || !root) throw new Error('Usage: node apply-check-feedback.mjs <feedback.json> <repository> [--verify]');
  const verifyOnly = flag === '--verify';
  const { checks } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const OPENING_TAG = /<Check\b[^>]*>/g;
  const text = (value) => JSON.stringify(value);

  function choiceTag(check) {
    const lines = check.options
      .map((option, index) => (option.message ? `    ${index + 1}: ${text(option.message)},` : null))
      .filter(Boolean);
    return ['<Check', `  answer={${check.answer}}`, '  misses={{', ...lines, '  }}', '>'].join('\n');
  }

  function numericTag(check) {
    const lines = check.slips.map((slip) => `    ${text(slip.value)}: ${text(slip.message)},`);
    return [
      '<Check',
      `  numeric=${text(check.answer)}`,
      `  unit=${text(check.unit)}`,
      ...(check.tolerance === 2 ? [] : [`  tolerance={${check.tolerance}}`]),
      '  slips={{',
      ...lines,
      '  }}',
      '>',
    ].join('\n');
  }

  /** The first run of "- " lines after a Check's opening tag: its options. */
  function optionBlock(source, from) {
    const end = source.indexOf('<div slot="why">', from);
    if (end === -1) throw new Error('a Check has no explanation');
    const match = /(?:^- .*\n)+/m.exec(source.slice(from, end));
    if (!match) throw new Error('a choice Check has no list of options');
    const start = from + match.index;
    return { start, end: start + match[0].length, options: match[0].trimEnd().split('\n').map((line) => line.slice(2)) };
  }

  const byFile = Map.groupBy(checks, (check) => check.file);
  let changed = 0;
  for (const [file, fileChecks] of byFile) {
    const full = path.join(root, file);
    let source = fs.readFileSync(full, 'utf8');
    const tags = [...source.matchAll(OPENING_TAG)];
    if (tags.length !== fileChecks.length) {
      throw new Error(`${file} has ${tags.length} Checks; the data file has ${fileChecks.length}.`);
    }
    // Last Check first, so the positions of the ones before it stay good.
    for (const check of [...fileChecks].sort((a, b) => b.check - a.check)) {
      const tag = tags[check.check - 1];
      const where = `${file}, Check ${check.check}`;
      const tagEnd = tag.index + tag[0].length;
      if (check.kind === 'choice') {
        const block = optionBlock(source, tagEnd);
        const wanted = check.options.map((option) => option.text);
        if ([...block.options].sort().join('\n') !== [...wanted].sort().join('\n')) {
          throw new Error(`${where}: the options are not the ones the data file lists.`);
        }
        if (!check.moved && block.options.join('\n') !== wanted.join('\n')) {
          throw new Error(`${where}: the options are in another order, and the data file does not say to move them.`);
        }
        source =
          source.slice(0, tag.index) +
          choiceTag(check) +
          source.slice(tagEnd, block.start) +
          wanted.map((option) => `- ${option}\n`).join('') +
          source.slice(block.end);
      } else {
        let rest = source.slice(tagEnd);
        const edit = check.explanation_edit;
        if (edit && !rest.includes(edit.new)) {
          if (rest.split(edit.old).length !== 2) throw new Error(`${where}: the sentence to replace is not there exactly once.`);
          rest = rest.replace(edit.old, () => edit.new);
        }
        source = source.slice(0, tag.index) + numericTag(check) + rest;
      }
    }
    if (source !== fs.readFileSync(full, 'utf8')) {
      changed += 1;
      if (verifyOnly) console.error(`${file}: differs from the data file`);
      else fs.writeFileSync(full, source);
    }
  }
  console.log(`${verifyOnly ? 'verified' : 'applied'}: ${checks.length} Checks in ${byFile.size} lessons, ${changed} file(s) ${verifyOnly ? 'differ' : 'changed'}`);
  if (verifyOnly && changed > 0) process.exit(1);
  ```

- [x] **Step 2: Compare first.** From the top of the repository:

```bash
node scratchpad/unit1-feedback/apply-check-feedback.mjs docs/superpowers/plans/2026-11-26-chemstudy-unit-1-check-feedback.json . --verify
```

  Expected: all eight lessons "differ", and the command exits with 1. If it stops with an error instead, a lesson changed after 2026-11-26: read the error, look at the lesson, and bring the data file in line before going on.

- [x] **Step 3: Apply**, with the same command without `--verify`. Expected: `applied: 36 Checks in 8 lessons, 8 file(s) changed`. Run it with `--verify` again: 0 files differ.

- [x] **Step 4: Read the diff.** Every `<Check` tag of Unit 1 is now several lines long. Two Checks have their options in a new order and `answer={1}`. Lesson 1.1's last Check has `tolerance={0.5}` and one changed sentence; lesson 1.2's third has `tolerance={0.5}`. Nothing else changed: no question, no option's wording, no explanation but that sentence.

- [x] **Step 5: Build.** `npm run build`. If the build stops on a message, the message breaks a rule of section 4.4: fix it in the data file, run the tool again.

- [x] **Step 6: Commit.** `feat(unit-1): say what went wrong on each wrong answer`

### Task 8: Put Unit 1 on the lists, and test in the browser

**Files:**
- Modify: `scripts/check-dist.mjs`
- Create: `tests/unit/check-balance.test.ts`
- Modify: `tests/e2e/lesson.spec.ts`, `tests/e2e/a11y.spec.ts`

Do Steps 1 and 2 **before** Task 7's Step 3 if the tasks are run by one worker in order: the two tests then fail first, for the right reason, and Task 7 makes them pass.

- [x] **Step 1: The balance test.** Create `tests/unit/check-balance.test.ts`:

```ts
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Units whose answers have been spread over the four options. Add a unit when
 * its Checks are balanced; the other units are listed, with their counts, in
 * the design of 2026-11-26.
 */
const BALANCED_UNITS = [1];
const LOWEST_SHARE = 0.15;
const HIGHEST_SHARE = 0.35;

/** The option number of the answer of every Check with options, in a unit's lessons. */
function answerPositions(unit: number): number[] {
  const folder = new URL(`../../src/content/lessons/unit-${unit}/`, import.meta.url);
  return fs
    .readdirSync(folder)
    .filter((name) => name.endsWith('.mdx'))
    .flatMap((name) => {
      const lesson = fs.readFileSync(new URL(name, folder), 'utf8');
      // The answer comes first in a Check's tag, and no message holds ">".
      return [...lesson.matchAll(/<Check\b[^>]*?\banswer=\{(\d+)\}/g)].map((match) => Number(match[1]));
    });
}

describe.each(BALANCED_UNITS)('where the answers of unit %i sit', (unit) => {
  const positions = answerPositions(unit);

  it('has enough Checks with options for shares to mean something', () => {
    expect(positions.length).toBeGreaterThanOrEqual(12);
  });

  it.each([1, 2, 3, 4])('option %i is the answer for 15 to 35 percent of them', (option) => {
    const share = positions.filter((position) => position === option).length / positions.length;
    expect(share, `${Math.round(share * 100)} percent`).toBeGreaterThanOrEqual(LOWEST_SHARE);
    expect(share, `${Math.round(share * 100)} percent`).toBeLessThanOrEqual(HIGHEST_SHARE);
  });
});
```

  Before Task 7 is applied it fails for option 1 (4 of 28, 14 percent). After, the shares are 21, 25, 29 and 25 percent.

- [x] **Step 2: The list.** In `scripts/check-dist.mjs`: `export const FEEDBACK_UNITS = new Set(['1']);`. Before Task 7 is applied the build then fails with 84 "says nothing for wrong option" lines and 8 "names no slip" lines. After, it passes. The three tests of Task 5 that waited for a unit on the list now run.

- [x] **Step 3: Browser tests.** In `tests/e2e/lesson.spec.ts`:

```ts
test.describe('feedback on a wrong answer', () => {
  const UNIT_1 = '/unit-1-atomic-structure/';

  test('a wrong option says what went wrong, and the right one still explains itself', async ({ page }) => {
    await page.goto(`${UNIT_1}1-3-elemental-composition-of-pure-substances/`);
    const check = page.locator('cs-check').nth(1);
    const feedback = check.locator('.check-feedback');
    const options = check.locator('.check-option');

    await options.nth(1).click();
    await expect(feedback).toHaveText(
      'Not quite. Check the mole ratio before you round. A ratio near 1.33 is not 1: multiply both numbers until both are whole.',
    );
    await expect(check.locator('.check-why')).not.toHaveAttribute('open', '');

    await options.nth(3).click();
    await expect(feedback).toHaveText(
      'Not quite. That reads the masses, 3.00 g to 2.00 g, as a ratio of atoms. Compare moles, not grams.',
    );

    await options.nth(0).click();
    await expect(feedback).toHaveText('Correct.');
    await expect(check.locator('.check-why')).toHaveAttribute('open', '');
  });

  test('a typed number that a known slip gives gets the message of that slip', async ({ page }) => {
    await page.goto(`${UNIT_1}1-3-elemental-composition-of-pure-substances/`);
    const check = page.locator('cs-check').first();
    const input = check.locator('input');
    const feedback = check.locator('.check-feedback');

    await input.fill('9.39');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. The formula has two lithium atoms. Count both.');

    // Within 1 percent of the slip, so the same message.
    await input.fill('9.4');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. The formula has two lithium atoms. Count both.');

    // Near no slip.
    await input.fill('12');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. Check your setup and try again.');

    await input.fill('18.78');
    await input.press('Enter');
    await expect(feedback).toHaveText('Correct.');
  });

  test('a slip that 2 percent would have accepted is refused, and a rounded answer is not', async ({ page }) => {
    await page.goto(`${UNIT_1}1-1-moles-and-molar-mass/`);
    const check = page.locator('cs-check').nth(4);
    const input = check.locator('input');
    const feedback = check.locator('.check-feedback');

    await input.fill('9.35e21');
    await input.press('Enter');
    await expect(feedback).toHaveText(
      'Not quite. Close, but check the molar mass. The 2 outside the parentheses doubles the H as well as the O.',
    );

    await input.fill('9.3e21');
    await input.press('Enter');
    await expect(feedback).toHaveText('Correct.');
  });

  test('leaving out a peak is refused in lesson 1.2, and whole-number masses are still accepted', async ({ page }) => {
    await page.goto(`${UNIT_1}1-2-mass-spectra-of-elements/`);
    const check = page.locator('cs-check').nth(2);
    const input = check.locator('input');
    const feedback = check.locator('.check-feedback');

    await input.fill('64.95');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. Did you leave out a small peak? The fractions you use should add up to 1.');

    await input.fill('65.45');
    await input.press('Enter');
    await expect(feedback).toHaveText('Correct.');
  });

  test('the longest message does not make a 320px page scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`${UNIT_1}1-7-periodic-trends/`);
    const check = page.locator('cs-check').nth(2);

    await check.locator('.check-option').nth(1).click();
    await expect(check.locator('.check-feedback')).toContainText('the rubidium ion in the figure');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
});
```

  In `tests/e2e/a11y.spec.ts`, beside the test that runs axe on a Check after a wrong and a right answer in lesson 5.2, add the same test on the second Check of lesson 1.3, so axe sees a Check with a message showing.

- [x] **Step 4: Run everything.** `npm test`, `npm run build`, `npm run test:e2e` (under the lock if another folder is building). All pass, the old tests in lesson 5.2 included.

- [x] **Step 5: Reviews. Commit.** `test(unit-1): cover check feedback, tolerances and answer positions`

### Task 9: Look, and check a second time

- [x] **Step 1: Look at each of the eight lessons** at 412, 390, 360 and 320 px with one wrong option clicked in each Check, and one slip typed in each typed-number Check. The message wraps inside the Check's card, nothing is clipped, and the "Show answer" line stays where it was.

- [x] **Step 2: A second check on Fable 5.2, with a fresh context, in the browser.** For every Check of Unit 1: click each wrong option and read the message beside the question; type each slip and one number near no slip; then the answer. It reports any message that does not fit what is on the page, any slip that is marked correct, and any right answer that is refused (try the answer rounded to one figure fewer, and with each intermediate rounded to three figures).

- [x] **Step 3: Fix** in the data file, apply with the tool, build, test; a second look at what changed.

### Task 10: Close out

- [x] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [x] In the "As built" note, say what the unit that comes next should do differently, and give the counts section 3 of the design gives, for Unit 1, after the change.
- [x] Open pull request D, stacked on C. Its text lists, for the teacher: the two reordered Checks, the two tolerances, the one changed sentence, every message that changed in the fact-checks and why, and anything in the 116 messages the checkers were unsure of.

**As carried out (Group D), 2026-11-26.**

- **Task 6.** The fact-checker (Fable 5.2) agreed with all 36 answers and every slip value to its last digit, and found the two reorders sound. It found 3 errors and 7 points of wording, all accepted. The session applied them to the data file itself, by a script that matched each old message exactly, rather than by a fixer on Sonnet. A second checker (Fable 5.2) passed ten of the twelve new messages and reworded two; both taken. **Fourteen messages differ from the tables under "The messages" below**, which stay as the picture of 2026-11-26; the data file is the master copy:
  - Lesson 1.2, Check 1, "mixture of two elements": "two peaks this close are isotopes" is not a rule the lesson states, and not true in general.
  - Lesson 1.2, Check 3, slips 64.95, 66.93 and 63.93: worded as a likelihood. 64.95 also catches a student who typed 65, and now says so; it asks for two decimal places, the lesson's own term.
  - Lesson 1.3, Check 2, SiN and Si₂N₃: no longer hand over the ratios 1.33 and 2.67.
  - Lesson 1.4, Check 3, "copper alone": no longer names the missing mass.
  - Lesson 1.5, Check 5, options 2 and 3: each confirmed half of the answer ("Right shell"; "A 2p electron is closer").
  - Lesson 1.7, Check 3, "always smaller": the figure shows Rb⁺ beside Br⁻, not F⁻. The message now gives the explanation's numbers, 152 and 133 pm, and names the question's ions.
  - Lesson 1.8, Check 3, In₃O₂: "the numbers are right, but on the wrong ions" gave the answer. It now adds up the charges, as the other two do.
  - Lesson 1.8, Check 4, Mg and S: the lesson does not say "sulfide ion".
- **Task 7** ran after the fact-check: 309 lines added and 39 removed, as before, and a second run changed nothing.
- **Task 8.** The balance test and Unit 1 on `FEEDBACK_UNITS` were committed first and failed as the plan says (option 1 at 14 percent; 92 problems). The browser tests follow the data file: the SiN and 64.95 messages are the new ones; the 320 px test uses the longest message, which is now lesson 1.3 Check 2's SiN (139 characters), not lesson 1.7's; lesson 1.2's test also types 65.72 and expects the general line. All 1,788 browser tests pass.
- **Running the browser tests in a Claude Code cloud session** needs two things this plan did not say. Astro 7's `astro preview` starts in the background when it detects an AI agent (the `AI_AGENT` and `CLAUDECODE` variables), so Playwright's web server "exits early": unset them for the run. And the container's Chromium may not be the build the project's Playwright expects: point `launchOptions.executablePath` at it in a config kept outside the repository.
- **Task 9.** A script looked at every Unit 1 Check at 412, 390, 360 and 320 px with a wrong answer showing: each message is the right one, stays inside its card, "Show answer" stays where it was, and no page scrolls sideways. The browser check (Fable 5.2) found no defect in the 36 Checks. What it was unsure of is listed in pull request D for the teacher; nothing was changed for it.
- **Answers now sit at options 1 to 4 in 6, 7, 8 and 7** of the 28 Checks with options; 8 Checks take a typed number.

## What this plan delivers against the design

| Design | Plan |
|---|---|
| 2.1 The rule | Group A |
| 2.2 The check | Task 2 |
| 4.1 to 4.3 `misses`, `slips`, `tolerance` | Tasks 3 and 4 |
| 4.4 What a message is | `feedbackProblem` (Task 3) for what a build can check; Task 6 for the rest |
| 5 Where the answer sits | Tasks 7 and 8 |
| 6 Two narrower tolerances | Tasks 7 and 8 |
| 7 The build check | Tasks 5 and 8 |
| 9 How it is made | Tasks 6, 7 and 9 |

---

## The messages

A picture of the data file as written on 2026-11-26. In a table for a Check with options, the options are in the order they are to have on the page. A slip's "It comes from" is for the writer and the checker; the student sees the message.

### Lesson 1.1 (`src/content/lessons/unit-1/1-1-moles-and-molar-mass.mdx`)

**Check 1**, numeric, answer 0.0200 mol

| Slip | It comes from | Message |
|---|---|---|
| `0.0400` | molar mass of I atoms, 126.90 g/mol | That is what the molar mass of iodine atoms gives. The particles here are I₂ molecules. |
| `1290` | grams multiplied by 253.80 g/mol | Did you multiply by the molar mass? Going from grams to moles, the grams have to cancel. |
| `645` | grams multiplied by 126.90 g/mol | Two things to check: the particles are I₂ molecules, and the grams have to cancel. |

**Check 2**, numeric, answer 41.4 g

| Slip | It comes from | Message |
|---|---|---|
| `3.77` | the two molar masses swapped | The two molar masses look swapped. A sodium atom is heavier than a lithium atom, so the same number of atoms has more mass. |
| `12.5` | the given mass typed back | The same number of atoms is not the same mass. Go through moles. |
| `1.80` | stopped at moles of lithium | That is the moles of lithium. The question asks for grams of sodium. |

**Check 3**, numeric, answer 1.81e23 atoms

| Slip | It comes from | Message |
|---|---|---|
| `1.31e25` | grams taken straight to atoms | That takes grams straight to atoms. Change grams to moles first. |
| `0.300` | stopped at moles | That is the moles of germanium. One more step takes moles to atoms. |
| `9.53e26` | multiplied by the molar mass | Check the molar mass step. The grams have to cancel, so the molar mass goes underneath. |

**Check 4**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | Setup A | Follow the units. This setup never changes grams to moles, so the grams do not cancel. |
| 2 | Setup B | Follow the units. Here the molar mass is upside down, so the grams do not cancel. |
| 3 | Setup C | *the answer* |
| 4 | Setup D | Follow the units of the last factor. Moles should cancel there and leave molecules. |

**Check 5**, numeric, answer 9.26e21 atoms, **`tolerance={0.5}`**

| Slip | It comes from | Message |
|---|---|---|
| `4.63e21` | one O in each formula unit | That counts one oxygen atom in each formula unit. Look at the subscript outside the parentheses. |
| `9.35e21` | H counted once in the molar mass | Close, but check the molar mass. The 2 outside the parentheses doubles the H as well as the O. |
| `7.69e-3` | stopped at moles | That is the moles of copper(II) hydroxide. Go on to formula units, then to oxygen atoms. |

The explanation changes, because the page no longer marks this slip correct. Replace

> One slip lands within about 1 percent of the answer, close enough that this page marks it correct. Counting the H only once gives a molar mass of 96.56 g/mol and $9.35 \times 10^{21}$ O atoms. That molar mass is still wrong: the 2 doubles the H as well as the O.

with

> One slip lands within about 1 percent of the answer. Counting the H only once gives a molar mass of 96.56 g/mol and $9.35 \times 10^{21}$ O atoms. That molar mass is wrong: the 2 doubles the H as well as the O.


### Lesson 1.2 (`src/content/lessons/unit-1/1-2-mass-spectra-of-elements.mdx`)

**Check 1**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | Every rhenium atom has the same mass, 186.21 amu. | Look for a peak at 186.21 amu. There is none: that number is an average over the atoms. |
| 2 | About 60 percent of rhenium atoms are the lighter isotope. | 59.7 is a height on a scale where the tallest peak is 100. Turn the two heights into shares of the total. |
| 3 | The sample must be a mixture of two elements. | Two peaks this close in mass are isotopes: atoms of one element with different numbers of neutrons. |
| 4 | About 63 percent of rhenium atoms are the heavier isotope. | *the answer* |

**Check 2**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | 113.0 amu | That would need most of the atoms to be the lighter isotope. Which peak holds nearly all of them? |
| 2 | 113.9 amu | That is halfway between the two masses, which fits isotopes that are equally common. These are not. |
| 3 | 114.8 amu | *the answer* |
| 4 | 115.9 amu | An average cannot lie outside the values being averaged. It has to fall between the two masses. |

**Check 3**, numeric, answer 65.38 amu, **`tolerance={0.5}`**

| Slip | It comes from | Message |
|---|---|---|
| `64.95` | smallest peak left out, not rescaled | Did you leave out a small peak? The fractions you use should add up to 1. |
| `66.18` | four largest peaks averaged as equals | Did you treat the peaks as equally common? Each mass counts in proportion to its percent of the atoms. |
| `66.93` | five masses averaged as equals | That treats the peaks as equally common. Weight each mass by its percent of the atoms. |
| `63.93` | mass of the tallest peak | That is the mass of the tallest peak. The other four peaks pull the average up. |
| `6538` | percents not divided by 100 | Divide each percent by 100 before you multiply, or divide the total by 100 at the end. |
| `49.72` | two tallest peaks, not rescaled | An average has to lie between the lightest and heaviest masses. Did you use all five peaks? |

**Check 4**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | Iron (Fe) | Iron's 55.85 is below the lightest peak. An average cannot lie outside the masses being averaged. |
| 2 | Nickel (Ni) | *the answer* |
| 3 | Copper (Cu) | Copper's 63.55 would need nearly all the atoms to be near 64 amu. Where are most of the atoms here? |
| 4 | Zinc (Zn) | Zinc's 65.38 is above the heaviest peak, so it cannot be the average of these five. |


### Lesson 1.3 (`src/content/lessons/unit-1/1-3-elemental-composition-of-pure-substances.mdx`)

**Check 1**, numeric, answer 18.78 %

| Slip | It comes from | Message |
|---|---|---|
| `9.39` | one Li counted in the share | The formula has two lithium atoms. Count both. |
| `10.37` | one Li in the share and in the molar mass | The formula is Li₂CO₃, with two lithium atoms. Use both in the molar mass and in lithium's share. |
| `0.1878` | left as a fraction | That is the fraction. Multiply by 100 for a percent. |
| `16.25` | percent of carbon | That is the percent of carbon. The question asks for lithium. |
| `64.96` | percent of oxygen | That is the percent of oxygen. The question asks for lithium. |
| `33.13` | subscript 3 left off the oxygen | Check the molar mass. The formula has three oxygen atoms. |

**Check 2**, choice, `answer={1}` **(options reordered: write them in this order and change `answer`)**

| Option | Text | Message |
|---|---|---|
| 1 | Si₃N₄ | *the answer* |
| 2 | SiN | Check the mole ratio before you round. A ratio near 1.33 is not 1: multiply both numbers until both are whole. |
| 3 | Si₂N₃ | Doubling gives 2 to about 2.67, which is still not whole. Try another multiplier. |
| 4 | Si₃N₂ | That reads the masses, 3.00 g to 2.00 g, as a ratio of atoms. Compare moles, not grams. |

**Check 3**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | C₆H₁₆O₂ | That formula's molar mass would be twice the empirical formula's. Compare it with the measured 60.1 g/mol. |
| 2 | C₉H₂₄O₃ | That formula's molar mass would be three times the empirical formula's. Compare it with the measured 60.1 g/mol. |
| 3 | C₃H₈O | *the answer* |
| 4 | It cannot be found from these data | An empirical formula and a molar mass together are enough. Divide the molar mass by the mass of one empirical formula. |

**Check 4**, choice, `answer={1}`

| Option | Text | Message |
|---|---|---|
| 1 | What is the empirical formula of each liquid? | *the answer* |
| 2 | Are the two liquids the same compound? | Different compounds can have the same percent composition. Matching percents cannot show that two liquids are the same. |
| 3 | What is the molar mass of each liquid? | Percent composition gives the ratio of atoms. A molar mass needs a separate measurement. |
| 4 | How many carbon atoms are in one molecule of each liquid? | Percent composition gives the ratio of atoms, not how many of them are in one molecule. |


### Lesson 1.4 (`src/content/lessons/unit-1/1-4-composition-of-mixtures.mdx`)

**Check 1**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | Dry air: nitrogen molecules, oxygen molecules and argon atoms | Sort the sample into piles of like units. Dry air needs at least three piles. |
| 2 | Bronze: copper atoms with tin atoms scattered among them, in amounts that differ from one casting to the next | The amounts of copper and tin differ from one casting to the next. A pure substance has one fixed composition. |
| 3 | A quartz crystal: silicon and oxygen atoms bonded in a 1 to 2 ratio throughout | *the answer* |
| 4 | Seawater: water molecules with sodium ions, chloride ions and other ions among them | The ions are not joined to the water in a fixed ratio, and one sea is saltier than another. |

**Check 2**, numeric, answer 90.1 %

| Slip | It comes from | Message |
|---|---|---|
| `54.0` | percent of titanium in the sample | That is the percent of titanium in the ore. The question asks for the percent that is TiO₂. |
| `135` | oxygen's share of TiO₂ used | No sample can be more than 100 percent of anything. Use titanium's share of TiO₂, not oxygen's. |
| `0.901` | left as a fraction | That is the fraction. Multiply by 100 for a percent. |
| `72.0` | subscript 2 left off the oxygen | Check the molar mass of TiO₂. It has two oxygen atoms. |
| `9.9` | percent that is not TiO₂ | That is the percent of the ore that is not TiO₂. |
| `94.1` | shortfall in percent titanium taken off 100 | A gap in percent titanium is not the percent of impurity. Find the mass of TiO₂ from the mass of titanium. |

**Check 3**, choice, `answer={1}` **(options reordered: write them in this order and change `answer`)**

| Option | Text | Message |
|---|---|---|
| 1 | The mass of the rock sample and the mass of copper in it | *the answer* |
| 2 | The mass of the rock sample and the mass of iron in it | Pyrite contains iron too. Follow an element that the chalcopyrite alone contains. |
| 3 | The mass of copper in the sample, and nothing else | A percent of the rock needs the mass of the rock sample as well. |
| 4 | The mass of the rock sample and the mass of sulfur in it | Pyrite contains sulfur too. Follow an element that the chalcopyrite alone contains. |

**Check 4**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | The bag is still pure CaO | Pure CaO is 71.47 percent calcium. The sample's 67.1 percent does not match it. |
| 2 | All of the CaO has turned into Ca(OH)₂ | Pure Ca(OH)₂ is 54.09 percent calcium. The sample's 67.1 percent does not match it. |
| 3 | The bag is a mixture, and more than half of it is Ca(OH)₂ | Is 67.1 nearer 71.47 or 54.09? The mixture holds more of the compound whose value it is nearer. |
| 4 | The bag is a mixture, and more than half of it is CaO | *the answer* |


### Lesson 1.5 (`src/content/lessons/unit-1/1-5-atomic-structure-and-electron-configuration.mdx`)

**Check 1**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | They are equal, because the two effects cancel | The distance is squared in Coulomb's law. Twice the distance does more than undo twice the charge. |
| 2 | The force on the first electron is twice as strong | *the answer* |
| 3 | The force on the second electron is twice as strong | That looks at charge alone. The second electron is also twice as far from its nucleus. |
| 4 | The force on the first electron is four times as strong | That looks at distance alone. The second nucleus also has twice the charge. |

**Check 2**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | [Kr] 5s² 5p² | Count the electrons: this has 40, and tin has 50. Row 5 has a d block between its s block and its p block. |
| 2 | [Kr] 5s² 5d¹⁰ 5p² | The d block runs one shell behind its row. Which d subshell fills in row 5? |
| 3 | [Kr] 5s² 4d¹⁰ 5p² | *the answer* |
| 4 | [Xe] 5s² 4d¹⁰ 5p² | Count the electrons: xenon alone has 54, and tin has 50. Start from the noble gas that ends the row above tin's. |

**Check 3**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | [Ar] 4s² 3d¹⁰ 4p¹ | That is the neutral atom, with 31 electrons. Ga³⁺ has three fewer. |
| 2 | [Ar] 4s² 3d¹⁰ | Count the electrons: this has 30, which is Ga⁺. Two more have to leave. |
| 3 | [Ar] 4s² 3d⁸ | The count is right, 28, but electrons leave the highest shell first. Which shell is 3d in? |
| 4 | [Ar] 3d¹⁰ | *the answer* |

**Check 4**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | The ground state of a potassium atom | Compare it with the filling order. Is there a subshell with room while a later one holds electrons? |
| 2 | An excited state of a potassium atom | *the answer* |
| 3 | The ground state of a calcium atom | Count the electrons. A neutral atom has as many protons as electrons. |
| 4 | An impossible configuration for any atom | Check each subshell against its limit: s holds 2 and p holds 6. Is any one over? |

**Check 5**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | A 3p electron in an atom of aluminum | Compare the shells first. A 3p electron is farther out and has ten electrons inside it. |
| 2 | A 2p electron in an atom of aluminum | Right shell. Now compare the two nuclei: which has more protons pulling on its 2p electrons? |
| 3 | A 3p electron in an atom of chlorine | Chlorine has the larger charge, but compare the shells too. A 2p electron is closer, with two electrons inside it and no more. |
| 4 | A 2p electron in an atom of chlorine | *the answer* |


### Lesson 1.6 (`src/content/lessons/unit-1/1-6-photoelectron-spectroscopy.mdx`)

**Check 1**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | The electrons at 1.31 MJ/mol are held twice as strongly, because their peak is twice as tall. | Height counts electrons. It says nothing about how strongly they are held. |
| 2 | The electrons at 1.31 MJ/mol are the easier ones to remove, and there are twice as many of them. | *the answer* |
| 3 | The electrons at 3.12 MJ/mol are the easier ones to remove, because their peak is the shorter one. | Position gives the energy, not height. Which peak is at the lower binding energy? |
| 4 | The sample is a mixture of two elements, one for each peak. | One element gives a peak for each of its occupied subshells, so two peaks do not mean two elements. |

**Check 2**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | Lithium | Three peaks are three subshells, not three electrons. Use the heights to count the electrons in each. |
| 2 | Phosphorus | Phosphorus has five occupied subshells, so its spectrum has five peaks. This one has three. |
| 3 | Sodium | Each peak is a subshell, not a shell. Use the heights to count the electrons in each. |
| 4 | Nitrogen | *the answer* |

**Check 3**, choice, `answer={1}`

| Option | Text | Message |
|---|---|---|
| 1 | It has six peaks, and the new one, for 1 electron, has the lowest binding energy of all. | *the answer* |
| 2 | It has six peaks, and the new one, for 1 electron, has the highest binding energy of all. | Where does potassium's nineteenth electron go? Think about its distance from the nucleus and its shielding. |
| 3 | It has five peaks, and the last one now stands for 7 electrons. | A p subshell holds 6 electrons at most. The nineteenth electron has to start a new subshell. |
| 4 | It has five peaks with the same heights as argon's, each at a higher binding energy. | The five peaks do shift, but this leaves out potassium's nineteenth electron. |

**Check 4**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | Twice as many 4s electrons, each held twice as tightly, because the peak is twice as tall. | Height counts electrons. To see how tightly they are held, compare the two positions, 0.59 and 0.42 MJ/mol. |
| 2 | Twice as many 4s electrons, each easier to remove, because two electrons in a subshell repel. | Compare the positions: 0.59 MJ/mol is more than 0.42 MJ/mol. Does that mean easier or harder to remove? |
| 3 | Twice as many 4s electrons, each held more tightly: one more proton and the same shielding. | *the answer* |
| 4 | More tightly held 4s electrons, shown by the height, and more of them, shown by the position. | This has the two readings swapped. Which one is a count, and which one is an energy? |

**Check 5**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | The peak at the highest binding energy is gone, because the electrons nearest the nucleus are removed first. | An atom loses electrons from its highest shell first. Which peak do those electrons make? |
| 2 | The peak at the lowest binding energy is gone, and the other five keep their heights. | *the answer* |
| 3 | All six peaks are still there, and the two tallest now stand for 5 electrons each. | The two electrons come from one subshell, the one in the highest shell. Which is that? |
| 4 | All six peaks are still there with the same heights, each at a lower binding energy. | Two electrons are gone, so the heights cannot all stay the same. Which subshell did they leave? |


### Lesson 1.7 (`src/content/lessons/unit-1/1-7-periodic-trends.mdx`)

**Check 1**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | Tin, because its nucleus has the most protons of the four | Most of tin's protons are offset by the electrons in the shells inside. Estimate the charge its valence electrons feel. |
| 2 | Germanium, because its valence shell is nearer than tin's and it has one more proton than gallium for that shell | *the answer* |
| 3 | Gallium, because it has fewer valence electrons than germanium, so each one gets a larger share of the nucleus's pull | A nucleus's pull is not shared out among the electrons. Compare the charge each valence electron feels. |
| 4 | Indium, because its outer electrons are the farthest out and the best shielded | An electron that is far out and well shielded is easier to remove, not harder. |

**Check 2**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | Tellurium's fourth 5p electron shares an orbital, and the repulsion outweighs the pull of the extra proton. | If the repulsion outweighed the extra proton, the value would fall. Does it fall or rise from antimony to tellurium? |
| 2 | Tellurium's 5p electrons are shielded by the ten 4d electrons more than antimony's are, which cancels most of the extra proton's pull. | Antimony and tellurium have the same full 4d subshell, so the shielding is the same in both. |
| 3 | The fifth shell is so far from the nucleus that one added proton makes little difference to how tightly its electrons are held. | The steps on either side, in the same shell, are 122 and 139 kJ/mol. Distance cannot single out one step. |
| 4 | Tellurium's fourth 5p electron shares an orbital, and the repulsion offsets part of the extra proton's pull, not all of it. | *the answer* |

**Check 3**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | The aluminum atom has more electrons than the oxygen atom, so it has more to lose and shrinks further when it forms an ion. | A count of electrons names no force. Compare the two ions: how many electrons does each have, and how many protons? |
| 2 | A cation is always smaller than an anion. | Not always: the rubidium ion in the figure is larger than the fluoride ion. Compare the electrons and protons of these two ions. |
| 3 | Al³⁺ has lost its whole outer shell, and the two ions have the same 10 electrons, held by 13 protons against 8. | *the answer* |
| 4 | Aluminum's nucleus is farther from its electrons. | This has it backward. A stronger pull holds electrons closer in. Compare the protons in the two ions. |

**Check 4**, choice, `answer={1}`

| Option | Text | Message |
|---|---|---|
| 1 | Nitrogen's valence electrons are in the second shell, closer to the nucleus, and the shorter distance outweighs sulfur's larger charge. | *the answer* |
| 2 | Electronegativity falls down the table, so an element in period 3 attracts shared electrons less strongly than any element in period 2. | The trend down a group compares the elements of one group. Boron is in period 2, and its 2.0 is below sulfur's 2.6. |
| 3 | A sulfur atom has 16 electrons to nitrogen's 7, and the extra electrons repel shared electrons more strongly than the extra protons attract them. | The rough charge already counts the core electrons: about +6 for sulfur. Weigh that against the distance. |
| 4 | Nitrogen is three electrons short of a full octet and sulfur only two, so nitrogen pulls harder on the electrons it needs. | Being short of an octet names no force. Use Coulomb's law: compare the charge and the distance. |

**Check 5**, choice, `answer={3}`

| Option | Text | Message |
|---|---|---|
| 1 | About 150 pm | Radius generally grows down a group, so potassium should be larger than sodium, 166 pm. |
| 2 | About 170 pm | That fits the column, but check the row. Potassium should be larger than calcium, 176 pm, to its right. |
| 3 | About 200 pm | *the answer* |
| 4 | About 240 pm | Radius generally grows down a group, so potassium should be smaller than rubidium, 220 pm. |


### Lesson 1.8 (`src/content/lessons/unit-1/1-8-valence-electrons-and-ionic-compounds.mdx`)

**Check 1**, numeric, answer 5 electrons

| Slip | It comes from | Message |
|---|---|---|
| `6` | number of the ionization energy where the jump lands | That is the number of the ionization energy where the jump lands. Count the electrons removed before it. |
| `3` | the somewhat larger third increase taken as the jump | The third increase is somewhat larger than its neighbors. Look for the rise that is many times the ones before it. |

**Check 2**, choice, `answer={4}`

| Option | Text | Message |
|---|---|---|
| 1 | Barium | Subtract the first from the second for each element. Barium's rise is the smallest of the four. |
| 2 | Beryllium | Beryllium has the largest values of the three group 2 elements, but compare the rises: second minus first. |
| 3 | Strontium | Subtract the first from the second for each element. Then ask where each second electron comes from. |
| 4 | Potassium | *the answer* |

**Check 3**, choice, `answer={2}`

| Option | Text | Message |
|---|---|---|
| 1 | InO | Add up the charges. One In³⁺ and one O²⁻ leave 1+ over. |
| 2 | In₂O₃ | *the answer* |
| 3 | In₃O₂ | The numbers are right, but they are on the wrong ions. Add up the charges to check. |
| 4 | InO₃ | Add up the charges. One In³⁺ and three O²⁻ leave 3− over. |

**Check 4**, choice, `answer={1}`

| Option | Text | Message |
|---|---|---|
| 1 | Barium and phosphorus | *the answer* |
| 2 | Sodium and phosphorus | Sodium is not in strontium's group. What charge does a sodium ion have? |
| 3 | Magnesium and sulfur | Magnesium matches strontium, but sulfur is not in phosphorus's group. What charge does a sulfide ion have? |
| 4 | Aluminum and fluorine | Neither element is in the group of strontium or of phosphorus. Find each ion's charge from its group. |
