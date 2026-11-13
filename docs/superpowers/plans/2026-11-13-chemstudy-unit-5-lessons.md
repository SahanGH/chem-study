# ChemStudy Unit 5 Lessons and Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Unit 5 (Kinetics) on chem-study.com: the ten lessons that do not exist yet (5.1 and 5.3–5.11) and the three interactive diagrams the design calls for.

**Architecture:** Lessons are MDX files built from the existing lesson blocks. An interactive diagram is a Svelte component drawn in SVG, wrapped in an Astro block so a lesson can use it with no import, and loaded only when it scrolls into view. Every formula a diagram uses lives in a plain TypeScript module with unit tests; the diagram itself is tested in the browser, by keyboard, against the built site.

**Tech Stack:** Astro 7, MDX, Svelte 5 (`@astrojs/svelte` 9), KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md` (sections 6, 7, 8 and 11).

**This is Plan 2 of 3 for Stage 1.** Plan 1 (finished, deployed 2026-11-13) built the site and lesson 5.2. Plan 3 converts Unit 5 practice and is not started here, so every lesson's "Practice next" stays on its placeholder.

**Two deliberate differences from how Plan 1 was written:**

1. **Lesson prose is not in this plan.** Each lesson task carries a brief that fixes every piece of chemistry: what the AP framework requires, the sections, the worked example with its numbers, every check with its answer and explanation, the traps, the key points and the figure. The writer supplies only the sentences. Plan 1 printed lesson 5.2 in full and the implementer copied it; ten lessons printed here could not be rendered, tested or fact-checked until they were copied out anyway. Written at execution, each lesson is built, screenshotted and fact-checked the moment it exists.
2. **All code in this plan has already run.** It was built in a throwaway copy of the repository on 2026-11-13 with all three diagrams on the 5.2 page: 195 unit tests and 228 browser tests passed, including the accessibility scan. Copy it as printed.

**The chemistry in the lesson briefs was checked independently before this plan was committed.** A checker solved every check and worked example from the question alone, recomputed every number, added up every mechanism, redid both pre-equilibrium derivations and compared each brief with the 2024 framework. It found no wrong answer key, number, equation or derivation; its thirteen findings on wording and coverage are applied. Each lesson is still fact-checked again once it is written, because prose can introduce errors a brief does not have.

---

## Facts verified before writing (do not rediscover)

Established on 2026-11-13 in a throwaway copy of the repository at commit `0fe5eeb`.

1. **`npm install @astrojs/svelte svelte`** gives `@astrojs/svelte@9.1.5` and `svelte@5.57.3` beside Astro 7.4.11, and `npm ls katex` still shows one copy.
2. **A lesson cannot hydrate a Svelte component directly.** Lessons get their blocks through `<Content components={...} />`, and a `client:` directive only works where the component is imported. So each diagram has an Astro block (`src/components/lesson/<Name>.astro`) that imports the Svelte component and puts `client:visible` on it. The lesson writes `<RateLawExplorer />` and nothing else.
3. **Svelte 5 runes work in `<script lang="ts">`** (`$state`, `$derived`, `$props`) with no `svelte.config.js`.
4. **The server draws the diagram's starting state into the page.** With JavaScript off the drawing and its first readout are there; only the controls are dead. The controls are therefore hidden until the script sets `data-hydrated`.
5. **`client:visible` loads the script only when the diagram scrolls into view.** A browser test must scroll to the diagram and wait for `data-hydrated="true"` before it presses a key. `tests/e2e/diagram.ts` does this.
6. **The content security policy needs no change.** A page with a diagram gains two inline scripts and one inline style block from Astro; `'unsafe-inline'` already allows them, and the browser reported no violations.
7. **`check-dist` passes** with a diagram on a lesson page, and the diagram is kept out of the search index with `data-pagefind-ignore`.
8. **Five existing browser tests assume lesson 5.2 is the only lesson** (four in `search.spec.ts`, one pattern in `home.spec.ts`). Task 1 changes them before any lesson is added.
9. **The AP framework** is `D:\AP_Chem_Prep\Reference\ap-chemistry-course-and-exam-description.pdf` (2024 edition; Unit 5 is on the pages numbered 94–105). Read it with `pdftotext -layout <pdf> <scratch>/ced.txt` into a scratch folder. It is copyrighted: never copy it, or its wording, into the repository.

## Conventions for every task

- Work in `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study`. Start every shell command with `cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"` (capital `C:`; Vitest fails from a lowercase drive).
- `D:\AP_Chem_Prep` is a read-only archive. Never write there. Never copy from `Tro_Reference`, `ChemistrySlides` or the textbook PDFs, and never reuse a textbook's wording or one of its worked examples.
- Create files with the editor's Write tool. Shell heredocs and `node -e "..."` eat backslashes on this machine, which silently ruins TeX and regular expressions.
- Conventional commits. **No AI-attribution trailer.**
- US spelling.
- Tests first: write the test, run it, watch it fail, then implement.
- Never swallow an error.
- Browser tests run against the built site: `npm run test:e2e` builds first.
- **One pull request per group of tasks, as listed under each group. Never merge a pull request yourself: a merge deploys to chem-study.com. When the "Build and test" check passes, stop and ask the teacher to merge or to say "merge".**

## File structure

```
src/
  lib/kinetics.ts                    rate law, integrated rate laws, which plot is linear
  lib/format.ts                      numbers the way a lesson writes them (3.2 × 10⁻³)
  styles/diagram.css                 one stylesheet for every diagram
  components/diagrams/               Svelte, SVG, no styles of their own
    RateLawExplorer.svelte           Task 1, used by lesson 5.2
    ConcentrationPlots.svelte        Task 3, used by lesson 5.3
    CatalystProfile.svelte           Task 11, used by lesson 5.11
  components/lesson/
    Diagram.astro                    the shell: caption, no-JavaScript note
    RateLawExplorer.astro            block a lesson uses: <RateLawExplorer />
    ConcentrationPlots.astro         <ConcentrationPlots />
    CatalystProfile.astro            <CatalystProfile />
  content/lessons/unit-5/            ten new .mdx files, one per task
public/figures/                      five new static figures (.svg)
tests/unit/kinetics.test.ts format.test.ts
tests/e2e/diagram.ts                 helpers shared by the three diagram specs
tests/e2e/diagram-rate-law.spec.ts diagram-concentration-plots.spec.ts
          diagram-catalyst-profile.spec.ts
tests/e2e/all-lessons.spec.ts        checks that hold for every lesson
```

A diagram's arithmetic is never inside the Svelte file. If a number on the screen can be wrong, the function that produced it is in `src/lib/` with a unit test.

## Rules for writing a lesson (Tasks 2–11)

Read `src/content/lessons/unit-5/5-2-rate-law.mdx` first. It is the model for length, tone and markup.

**The file.** `src/content/lessons/unit-5/<file name in the brief>`. The name must be `<unit>-<number>-<slug>.mdx` matching the topic, or the build fails. Front matter is exactly three fields:

```mdx
---
topic: "5.1"
minutes: 10
summary: One sentence, 20 to 200 characters, saying what the lesson teaches.
---
```

The title comes from `src/data/units.ts`. Do not write an `# H1`.

**The seven parts, in order** (spec section 6). The build fails if a lesson lacks a worked example, a trap box, key points, practice-next or three checks.

1. Opening: two or three sentences, no heading, starting from something concrete.
2. Explanation: `##` sections, one idea each. At least one `<KeyIdea>`.
3. `<Worked title="...">` with numbered steps.
4. `<Check>` questions spread through the lesson, each placed right after the idea it tests. Never all at the end.
5. `<Trap>`: the specific mistakes for this topic, as a short list with the mistake in bold.
6. `<KeyPoints>`: four to six bullets. This is the review sheet, so each bullet must stand on its own.
7. `<PracticeNext />` as the last line, with no attributes.

**Markup.**

- Math is KaTeX inside `$...$` or a `$$` block. Chemical formulas and equations use `\ce{...}`: `$\ce{2NO2(g) -> NO3(g) + NO(g)}$`, `$[\ce{NO2}]$`. A reversible step is `\ce{<=>}`.
- Units in math are upright: `$4.0 \times 10^{-5}\ \text{M/s}$`, `$\text{M}^{-1}\,\text{s}^{-1}$`, `$\text{kJ/mol}$`.
- A choice check: `<Check answer={2}>`, the question, a blank line, a `-` list of options, a blank line, then `<div slot="why">...</div>`. `answer` is the 1-based number of the correct option.
- A numeric check: `<Check numeric="0.0050" unit="M/s">`. **The number is text in quotes**, so its trailing zeros are shown; `numeric={0.0050}` fails the build. The student's answer is accepted within 2 percent.
- A figure: `<Figure src="/figures/<name>.svg" alt="..." caption="..." />`. The alt text describes what the figure shows to someone who cannot see it.
- Inside a block (`<Worked>`, `<Trap>`, `<KeyPoints>`, `<KeyIdea>`), leave a blank line after the opening tag and before the closing tag so the contents are read as Markdown.
- Refer to another lesson by topic number in plain text ("topic 5.2"). Do not link to a lesson that is not published yet: a broken link fails the build.

**Voice** (spec section 4). A teacher talking, not a textbook. Start from something concrete. Short sentences. No "in this section we will". Say "you". Explain why before how. One new term at a time, in bold the first time, defined in the same sentence.

**Chemistry.**

- Teach what the brief's "Framework" line lists, and nothing the exam excludes unless the brief says to label it. Excluded material is introduced with the words **Beyond the exam:** so a student can skip it.
- Use the brief's numbers exactly. They were chosen to come out clean and were recomputed when this plan was written. If you think one is wrong, stop and say so; do not quietly change it.
- Do not add a worked example or a check that the brief does not list. Do not drop one.
- Never take an example, a data table or a sentence from a textbook.

**Static figures.** Draw the figure the brief describes as a hand-written SVG in `public/figures/`, in the style of `public/figures/5-2-order-and-rate.svg`: `viewBox="0 0 480 300"`, a `#FDFCF9` background rectangle, `font-family="system-ui, sans-serif" font-size="14"`, ink `#26231F`, secondary `#6B655D`, accent `#4F706C`. Two curves in one figure must differ in dash pattern as well as color. Label curves directly; do not rely on a legend alone.

## How every lesson task ends (Tasks 2–11)

Each lesson task finishes with the same five steps. They are written out once here and referred to by name in each task; the commands differ only in the file names, which each task gives.

**Build and test.**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study" && npm test && npm run test:e2e
```

Expected: every unit test and every browser test passes, and the build prints `check-dist: N pages, 0 problem(s)` with N one higher than before. `all-lessons.spec.ts` finds the new lesson by itself and checks its math, its checks, its width on a phone and its accessibility.

**Look at it.** Run `npm run build && npx astro preview --port 4400`, open the lesson at 1280 px and at 390 px wide, in the light and the dark theme, and read it top to bottom. Tests do not see a formula that rendered but is wrong, a figure that is illegible in the dark theme, or a table that is too wide. Fix what you find. Stop the preview server afterward and confirm nothing still listens on port 4400.

**Fact-check, independently.** Dispatch a fresh agent that has not seen this plan's brief. Give it the lesson file, the built page, and the path of the AP framework (fact 9). It must:

1. Solve every check and every worked example itself **before** reading the lesson's answer, then compare.
2. Recompute every number in the lesson, including the ones in prose and in tables.
3. Check every statement of fact against the framework's Unit 5 pages, and list anything the framework excludes that the lesson teaches without the **Beyond the exam** label.
4. Confirm each chemical equation is balanced and each mechanism adds up to its overall equation.
5. Report anything a student could misread, and any sentence that reads like a textbook's.

It reports; it does not edit. Fix what is right, say why for what is wrong, and re-run **Build and test**.

**Commit.**

```bash
git add src/content/lessons/unit-5/<file>.mdx public/figures/<figure>.svg
git commit -m "feat(lessons): add <topic number> <title>" -m "<one sentence: what the fact-check confirmed or changed>"
```

**Do not merge.** The group's last task opens the pull request.

---

## Group A: the diagram foundation (pull request 1)

Branch: `topic/diagrams`.

### Task 1: Svelte, the diagram shell, and the rate-law explorer in lesson 5.2

> **Done 2026-11-13, with changes after review.** The code below is as first written; the repository is the record of what shipped. What differs, and matters to later tasks:
>
> - **The explorer** starts at [A] = 0.50 M and [B] = 0.40 M (rate 0.010 M/s), its bar has no minimum length, and its track has an outline.
> - **`src/styles/diagram.css`** keeps the controls' space while a diagram's script loads, so the lesson below does not jump. Tasks 3 and 11 get this for free.
> - **`concentrationAt` and `plotValue`** now throw for values that are not physical (a starting concentration of zero or less, a negative rate constant or time, anything not finite). The diagrams of Tasks 3 and 11 pass only valid constants, so their code is unaffected.
> - **`tests/e2e/all-lessons.spec.ts`** makes one test per lesson file instead of one test that loops, checks that the unit page links to exactly those lessons, and its search test waits for each query's own results and presses "Load more" when the lesson is further down. A new lesson is still covered the day its file is added.
> - **Counts:** 209 unit tests and 212 browser tests after this task. Each new lesson adds two browser tests (one per project) on top of what its task lists.

**Files:**
- Modify: `package.json`, `package-lock.json`, `astro.config.mjs`
- Create: `src/lib/kinetics.ts`, `src/lib/format.ts`
- Create: `src/styles/diagram.css`, `src/components/lesson/Diagram.astro`
- Create: `src/components/diagrams/RateLawExplorer.svelte`, `src/components/lesson/RateLawExplorer.astro`
- Modify: `src/layouts/Base.astro`, `src/pages/[unit]/[topic].astro`, `src/content/lessons/unit-5/5-2-rate-law.mdx`
- Modify: `tests/e2e/search.spec.ts`, `tests/e2e/home.spec.ts`
- Test: `tests/unit/kinetics.test.ts`, `tests/unit/format.test.ts`, `tests/e2e/diagram.ts`, `tests/e2e/diagram-rate-law.spec.ts`, `tests/e2e/all-lessons.spec.ts`

- [ ] **Step 1: Branch and install**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study" && git checkout main && git pull --ff-only && git checkout -b topic/diagrams
npm install @astrojs/svelte svelte
npm ls katex
```

Expected: `@astrojs/svelte` 9.x and `svelte` 5.x are added, and `npm ls katex` lists `katex@0.16.47` once with the others marked `deduped`.

- [ ] **Step 2: Turn the integration on**

In `astro.config.mjs`, add the import after the `mdx` import and add `svelte()` to the integrations:

```js
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
```

```js
  integrations: [mdx(), svelte()],
```

- [ ] **Step 3: Make the existing tests ready for more than one lesson**

These five places assume 5.2 is the only lesson. Change them now, while there is still one lesson and they can be seen to pass.

In `tests/e2e/search.spec.ts`, in `search finds a lesson by words in it`, replace

```ts
  const result = page.locator('.pagefind-ui__result-link').first();
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute('href', /\/unit-5-kinetics\/5-2-rate-law\//);
```

with

```ts
  // Other lessons may match too, so look for this one among the results.
  const result = page.locator('.pagefind-ui__result-link[href*="/unit-5-kinetics/5-2-rate-law/"]').first();
  await expect(result).toBeVisible();
```

In the same file, in **both** tests that pick a result on the current page, replace

```ts
  const subResult = page.locator('.pagefind-ui__result-nested .pagefind-ui__result-link').first();
```

with

```ts
  const subResult = page.locator('.pagefind-ui__result-nested .pagefind-ui__result-link[href*="/5-2-rate-law/"]').first();
```

In `ordinary words around an equation still find the lesson`, replace

```ts
    await expect(page.locator('.pagefind-ui__result-link').first()).toHaveText('Introduction to Rate Law');
```

with

```ts
    await expect(
      page.locator('.pagefind-ui__result-link', { hasText: 'Introduction to Rate Law' }).first(),
    ).toBeVisible();
```

In `no excerpt shows a backslash`, replace

```ts
      await expect(page.locator('.pagefind-ui__message')).toHaveText(`1 result for ${query}`);
```

with

```ts
      await expect(page.locator('.pagefind-ui__message')).toHaveText(new RegExp(`^[1-9]\\d* results? for ${query}$`));
```

In `tests/e2e/home.spec.ts`, replace the first two pattern constants

```ts
const UNIT_5_READY = /\d+ of 11 lessons ready/;
const UNIT_5_READY_ONE_DONE = /\d+ of 11 lessons ready · 1 done/;
```

with

```ts
// Once all eleven are published the row reads "11 lessons".
const UNIT_5_READY = /\d+ of 11 lessons ready|11 lessons/;
const UNIT_5_READY_ONE_DONE = /(?:\d+ of 11 lessons ready|11 lessons) · 1 done/;
```

Run `npm run test:e2e`. Expected: all 190 pass, as before.

- [ ] **Step 4: Write the failing unit tests**

`tests/unit/kinetics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LINEAR_PLOT, concentrationAt, plotValue, rateLawRate } from '../../src/lib/kinetics';

describe('rateLawRate', () => {
  it('multiplies k by each concentration raised to its order', () => {
    expect(rateLawRate(0.1, 0.4, 2, 0.2, 1)).toBeCloseTo(0.0032, 10);
  });

  it('ignores a reactant that is zero order', () => {
    expect(rateLawRate(0.1, 0.4, 0, 0.2, 0)).toBe(0.1);
  });

  it('quadruples when a second-order concentration doubles', () => {
    const before = rateLawRate(0.1, 0.2, 2, 0.5, 1);

    const after = rateLawRate(0.1, 0.4, 2, 0.5, 1);

    expect(after / before).toBeCloseTo(4, 10);
  });
});

describe('concentrationAt', () => {
  it('starts at the initial concentration for every order', () => {
    expect(concentrationAt(0, 1, 0.008, 0)).toBe(1);
    expect(concentrationAt(1, 1, 0.02, 0)).toBe(1);
    expect(concentrationAt(2, 1, 0.04, 0)).toBe(1);
  });

  it('falls in a straight line for zero order', () => {
    expect(concentrationAt(0, 1, 0.008, 50)).toBeCloseTo(0.6, 10);
    expect(concentrationAt(0, 1, 0.008, 100)).toBeCloseTo(0.2, 10);
  });

  it('never goes below zero for zero order', () => {
    expect(concentrationAt(0, 1, 0.008, 1000)).toBe(0);
  });

  it('halves every half-life for first order', () => {
    const halfLife = Math.LN2 / 0.02;

    expect(concentrationAt(1, 1, 0.02, halfLife)).toBeCloseTo(0.5, 10);
    expect(concentrationAt(1, 1, 0.02, 2 * halfLife)).toBeCloseTo(0.25, 10);
  });

  it('follows 1/[A] = 1/[A]0 + kt for second order', () => {
    expect(concentrationAt(2, 0.5, 0.04, 50)).toBeCloseTo(0.25, 10);
  });
});

describe('plotValue', () => {
  it('gives the concentration, its natural log, or its reciprocal', () => {
    expect(plotValue('concentration', 0.5)).toBe(0.5);
    expect(plotValue('ln', 0.5)).toBeCloseTo(-0.6931, 4);
    expect(plotValue('reciprocal', 0.5)).toBe(2);
  });

  it.each(['ln', 'reciprocal'] as const)('throws for %s of a concentration of zero', (kind) => {
    expect(() => plotValue(kind, 0)).toThrow('greater than zero');
  });

  it('allows a concentration of zero on the plain plot', () => {
    expect(plotValue('concentration', 0)).toBe(0);
  });
});

describe('LINEAR_PLOT', () => {
  it.each([
    [0, 'concentration'],
    [1, 'ln'],
    [2, 'reciprocal'],
  ] as const)('order %i is a straight line on the %s plot', (order, kind) => {
    const k = { 0: 0.008, 1: 0.02, 2: 0.04 }[order];
    const at = (time: number) => plotValue(kind, concentrationAt(order, 1, k, time));

    const firstStep = at(10) - at(0);
    const laterStep = at(90) - at(80);

    expect(LINEAR_PLOT[order]).toBe(kind);
    expect(laterStep).toBeCloseTo(firstStep, 10);
  });
});
```

`tests/unit/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatQuantity } from '../../src/lib/format';

describe('formatQuantity', () => {
  it('writes an everyday number with two significant figures', () => {
    expect(formatQuantity(0.1)).toBe('0.10');
    expect(formatQuantity(0.032)).toBe('0.032');
    expect(formatQuantity(1.5)).toBe('1.5');
  });

  it('writes a small number as a power of ten', () => {
    expect(formatQuantity(0.0032)).toBe('3.2 × 10⁻³');
    expect(formatQuantity(0.00001)).toBe('1.0 × 10⁻⁵');
  });

  it('writes a large number as a power of ten', () => {
    expect(formatQuantity(120)).toBe('1.2 × 10²');
    expect(formatQuantity(6.02e23)).toBe('6.0 × 10²³');
  });

  it('absorbs floating-point noise', () => {
    expect(formatQuantity(0.1 * 0.25 * 0.2)).toBe('5.0 × 10⁻³');
  });

  it('writes zero as 0', () => {
    expect(formatQuantity(0)).toBe('0');
  });

  it('keeps the sign of a negative number', () => {
    expect(formatQuantity(-0.02)).toBe('−0.020');
    expect(formatQuantity(-0.0032)).toBe('−3.2 × 10⁻³');
  });

  it('throws for a value that is not a finite number', () => {
    expect(() => formatQuantity(Number.NaN)).toThrow('finite');
    expect(() => formatQuantity(Number.POSITIVE_INFINITY)).toThrow('finite');
  });
});
```

- [ ] **Step 5: Run them and watch them fail**

Run: `npm test`
Expected: two files fail with `Cannot find module '../../src/lib/kinetics'` and `'../../src/lib/format'`. The other 173 tests pass.

- [ ] **Step 6: Write the two modules**

`src/lib/kinetics.ts`:

```ts
/** Kinetics formulas for the interactive diagrams. No DOM here, so it is testable directly. */

export type Order = 0 | 1 | 2;

/** rate = k[A]^m[B]^n */
export function rateLawRate(k: number, a: number, orderA: Order, b: number, orderB: Order): number {
  return k * a ** orderA * b ** orderB;
}

/**
 * [A] at a given time, from the integrated rate law of a reaction that is
 * zero, first or second order in A. A zero-order reaction stops when A runs
 * out, so its concentration never goes below zero.
 */
export function concentrationAt(order: Order, initial: number, k: number, time: number): number {
  if (order === 0) return Math.max(0, initial - k * time);
  if (order === 1) return initial * Math.exp(-k * time);
  return 1 / (1 / initial + k * time);
}

export type PlotKind = 'concentration' | 'ln' | 'reciprocal';

/** What each of the three plots puts on its vertical axis: [A], ln[A] or 1/[A]. */
export function plotValue(kind: PlotKind, concentration: number): number {
  if (kind === 'concentration') return concentration;
  if (concentration <= 0) {
    throw new RangeError(`ln[A] and 1/[A] need a concentration greater than zero, not ${concentration}.`);
  }
  return kind === 'ln' ? Math.log(concentration) : 1 / concentration;
}

/** The plot that is a straight line for each order. */
export const LINEAR_PLOT: Record<Order, PlotKind> = { 0: 'concentration', 1: 'ln', 2: 'reciprocal' };
```

`src/lib/format.ts`:

```ts
/** Number formatting for the interactive diagrams. */

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/** The typographic minus sign, which lines up with the digits; a hyphen does not. */
const MINUS = '−';

/**
 * A quantity with two significant figures, the way a lesson writes it:
 * 0.032 stays "0.032", and 0.0032 becomes "3.2 × 10⁻³". Numbers below 0.01
 * or from 10 up are written as a power of ten.
 */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`Cannot format ${value}: it is not a finite number.`);
  if (value === 0) return '0';
  const sign = value < 0 ? MINUS : '';
  const size = Math.abs(value);
  // Rounding first keeps 0.00999 from being written as "0.010" by one rule
  // and "1.0 × 10⁻²" by the other.
  const rounded = Number(size.toPrecision(2));
  if (rounded >= 0.01 && rounded < 10) return sign + rounded.toPrecision(2);
  const [mantissa = '', exponent = ''] = rounded.toExponential(1).split('e');
  const power = Array.from(exponent.replace('+', ''), (character) => SUPERSCRIPT[character] ?? character).join('');
  return `${sign}${mantissa} × 10${power}`;
}
```

- [ ] **Step 7: Run the unit tests**

Run: `npm test`
Expected: 8 files, 195 tests, all pass.

- [ ] **Step 8: Write the failing browser tests**

`tests/e2e/diagram.ts` (helpers; not a spec, so Playwright does not run it by itself):

```ts
import { expect, type Locator, type Page } from '@playwright/test';

/** Opens a lesson and returns one of its diagrams once its script has taken over. */
export async function openDiagram(page: Page, path: string, name: string): Promise<Locator> {
  await page.goto(path);
  const diagram = page.locator(`[data-diagram="${name}"]`);
  // A diagram's script loads only when the diagram scrolls into view.
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toHaveAttribute('data-hydrated', 'true');
  return diagram;
}

/** With JavaScript off: the drawing and its starting values show, the controls do not. */
export async function expectStaticDiagram(page: Page, path: string, name: string, readout: string) {
  await page.goto(path);
  const diagram = page.locator(`[data-diagram="${name}"]`);
  await expect(diagram.locator('svg').first()).toBeVisible();
  await expect(diagram.getByRole('status')).toHaveText(readout);
  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('.diagram-note')).toBeVisible();
}
```

`tests/e2e/diagram-rate-law.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-2-rate-law/';
const NAME = 'rate-law-explorer';
const START = 'rate = k[A]²[B] = 3.2 × 10⁻³ M/s';

test('the rate-law explorer starts second order in A and first order in B', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
});

test('raising a concentration from the keyboard raises the rate and the bar', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const bar = diagram.locator('.diagram-bar');
  const widthBefore = Number(await bar.getAttribute('width'));

  await diagram.getByRole('slider', { name: /^\[A\]/ }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A]²[B] = 5.0 × 10⁻³ M/s');
  expect(Number(await bar.getAttribute('width'))).toBeGreaterThan(widthBefore);
});

test('changing an order from the keyboard rewrites the rate law', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Order in A' }).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowLeft');

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A][B] = 8.0 × 10⁻³ M/s');
});

test('a reactant that is zero order drops out of the rate law', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Order in A' }).getByRole('radio', { name: '0' }).check();
  await diagram.getByRole('group', { name: 'Order in B' }).getByRole('radio', { name: '0' }).check();

  await expect(diagram.getByRole('status')).toHaveText('rate = k = 0.10 M/s');
});

test('the explorer says what doubling each concentration does', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.locator('.diagram-detail')).toContainText('Doubling [A] multiplies the rate by 4.');
  await expect(diagram.locator('.diagram-detail')).toContainText('Doubling [B] doubles the rate.');
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the rate-law explorer shows its starting values and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
```

- [ ] **Step 9: Run them and watch them fail**

Run: `npx playwright test diagram-rate-law`
Expected: all twelve fail (six tests in two projects), because no element has `data-diagram="rate-law-explorer"`.

- [ ] **Step 10: Write the shell and the stylesheet**

`src/components/lesson/Diagram.astro`:

```astro
---
interface Props {
  /** One line under the diagram saying what it shows. Required. */
  caption: string;
}
const { caption } = Astro.props;
if (!caption.trim()) throw new Error('A diagram needs a caption.');
---

{/* Kept out of the search index: its labels and numbers are not lesson text. */}
<figure class="figure diagram" data-part="diagram" data-pagefind-ignore>
  <slot />
  <noscript>
    <p class="diagram-note">This diagram shows its starting values. It can be changed when JavaScript is on.</p>
  </noscript>
  <figcaption>{caption}</figcaption>
</figure>
```

`src/styles/diagram.css` (it already carries the classes the diagrams of Tasks 3 and 11 use, so that all three draw alike):

```css
/* Interactive diagrams. One stylesheet for all of them, so every diagram
   draws its axes, curves and controls the same way, and none ships a style
   block of its own. Colors are the page's tokens, so a diagram follows the
   theme and the unit accent. */
.diagram {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.1rem 1.25rem 1.25rem;
}
.diagram-body > * + * {
  margin-top: 0.8rem;
}
.diagram svg {
  display: block;
  width: 100%;
  height: auto;
}
.diagram-plots {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
}
.diagram-plot {
  margin: 0;
}
.diagram-plot-note {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
  text-align: center;
  margin: 0.2rem 0 0;
}
.diagram-plot.is-linear .diagram-plot-note {
  color: var(--u-ink);
  font-weight: 600;
}

.diagram-axis {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1;
}
.diagram-track {
  fill: var(--u-tint);
}
.diagram-bar {
  fill: var(--u-ink);
}
.diagram-curve {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2;
  stroke-linejoin: round;
}
.diagram-curve.is-accent {
  stroke: var(--u-ink);
  stroke-width: 3;
}
/* Dashes as well as color: the second curve must be told apart without color. */
.diagram-curve.is-dashed {
  stroke: var(--u-ink);
  stroke-width: 3;
  stroke-dasharray: 9 6;
}
.diagram-label {
  font-family: var(--font-ui);
  font-size: 11px;
  fill: var(--muted);
}

.diagram-readout {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  font-weight: 500;
  margin-bottom: 0;
}
.diagram-detail,
.diagram-note {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
}

.diagram-controls {
  display: grid;
  gap: 0.6rem 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  font-family: var(--font-ui);
  font-size: var(--step--1);
}
/* The server draws the diagram at its starting values. Until the script has
   taken over, the controls would do nothing, so they are not shown. */
.diagram-body:not([data-hydrated]) .diagram-controls {
  display: none;
}
.diagram-slider {
  display: grid;
  gap: 0.2rem;
}
.diagram-slider input {
  width: 100%;
  min-height: 2.75rem;
  margin: 0;
  accent-color: var(--u-ink);
}
.diagram-choice {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 1rem;
}
.diagram-choice legend {
  padding: 0;
  float: left;
  margin-right: 1rem;
}
.diagram-choice label,
.diagram-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  cursor: pointer;
}
.diagram-choice input,
.diagram-toggle input {
  width: 1.1rem;
  height: 1.1rem;
  margin: 0;
  accent-color: var(--u-ink);
}

@media print {
  .diagram-controls {
    display: none;
  }
}
```

In `src/layouts/Base.astro`, add the stylesheet after `prose.css`:

```astro
import '../styles/prose.css';
import '../styles/diagram.css';
```

- [ ] **Step 11: Write the explorer and its block**

`src/components/diagrams/RateLawExplorer.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { formatQuantity } from '../../lib/format';
  import { rateLawRate, type Order } from '../../lib/kinetics';

  // The units of k depend on the overall order, so the diagram gives k as a
  // bare number and reports only the rate, which is always in M/s.
  const K = 0.1;
  const ORDERS: Order[] = [0, 1, 2];
  // Every concentration tops out at 1.0 M, where the rate is k whatever the orders.
  const LARGEST_RATE = K;
  const TRACK = { x: 0, y: 4, width: 300, height: 22 };

  let a = $state(0.4);
  let b = $state(0.2);
  let orderA = $state<Order>(2);
  let orderB = $state<Order>(1);
  let hydrated = $state(false);

  const rate = $derived(rateLawRate(K, a, orderA, b, orderB));
  const law = $derived(`rate = k${term('A', orderA)}${term('B', orderB)}`);
  const barWidth = $derived(Math.max(1, (rate / LARGEST_RATE) * TRACK.width));

  function term(name: string, order: Order): string {
    if (order === 0) return '';
    return order === 1 ? `[${name}]` : `[${name}]²`;
  }

  function effectOfDoubling(order: Order): string {
    if (order === 0) return 'leaves the rate unchanged';
    return order === 1 ? 'doubles the rate' : 'multiplies the rate by 4';
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="rate-law-explorer" data-hydrated={hydrated ? 'true' : undefined}>
  <p class="diagram-readout" role="status">{law} = {formatQuantity(rate)} M/s</p>
  <svg
    viewBox="0 0 300 30"
    role="img"
    aria-label={`Bar showing the rate, ${formatQuantity(rate)} M/s, against the largest rate this diagram can reach, ${formatQuantity(LARGEST_RATE)} M/s.`}
  >
    <rect class="diagram-track" x={TRACK.x} y={TRACK.y} width={TRACK.width} height={TRACK.height} rx="4" />
    <rect class="diagram-bar" x={TRACK.x} y={TRACK.y} width={barWidth} height={TRACK.height} rx="4" />
  </svg>
  <p class="diagram-detail">
    Here k = {formatQuantity(K)}. Doubling [A] {effectOfDoubling(orderA)}. Doubling [B] {effectOfDoubling(orderB)}.
  </p>
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span>[A] = {a.toFixed(2)} M</span>
      <input type="range" min="0.1" max="1" step="0.1" bind:value={a} />
    </label>
    <label class="diagram-slider">
      <span>[B] = {b.toFixed(2)} M</span>
      <input type="range" min="0.1" max="1" step="0.1" bind:value={b} />
    </label>
    <fieldset class="diagram-choice">
      <legend>Order in A</legend>
      {#each ORDERS as option}
        <label><input type="radio" name="rate-law-order-a" value={option} bind:group={orderA} />{option}</label>
      {/each}
    </fieldset>
    <fieldset class="diagram-choice">
      <legend>Order in B</legend>
      {#each ORDERS as option}
        <label><input type="radio" name="rate-law-order-b" value={option} bind:group={orderB} />{option}</label>
      {/each}
    </fieldset>
  </div>
</div>
```

`src/components/lesson/RateLawExplorer.astro`:

```astro
---
import Explorer from '../diagrams/RateLawExplorer.svelte';
import Diagram from './Diagram.astro';
---

<Diagram caption="Change a concentration or an order and watch the rate respond.">
  <Explorer client:visible />
</Diagram>
```

- [ ] **Step 12: Offer the block to lessons and use it in 5.2**

In `src/pages/[unit]/[topic].astro`, add the import in alphabetical place and add the name to `blocks`:

```astro
import PracticeNext from '../../components/lesson/PracticeNext.astro';
import RateLawExplorer from '../../components/lesson/RateLawExplorer.astro';
import Trap from '../../components/lesson/Trap.astro';
```

```astro
const blocks = { Check, Figure, KeyIdea, KeyPoints, PracticeNext, RateLawExplorer, Trap, Worked };
```

In `src/content/lessons/unit-5/5-2-rate-law.mdx`, after the `<Figure ... />` block that ends the section "What each order does to the rate" and before the first `<Check answer={3}>`, add:

```mdx
Try it. Set an order, then move a concentration and see what the rate does.

<RateLawExplorer />
```

- [ ] **Step 13: Run everything**

Run: `npm test && npm run test:e2e`
Expected: 195 unit tests pass. 202 browser tests pass (190 + 12). The build ends `check-dist: 5 pages, 0 problem(s)`.

- [ ] **Step 14: Add the checks that hold for every lesson**

`tests/e2e/all-lessons.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Checks that hold for every lesson, whatever it teaches. The lessons are
// found from the unit page, so a new lesson is covered the day it is added.
const UNIT = '/unit-5-kinetics/';

test('every published Unit 5 lesson renders its math, has its checks, fits the screen and is accessible', async ({
  page,
}) => {
  test.slow();
  await page.goto(UNIT);
  const paths = await page
    .locator('.topic-list a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(paths.length).toBeGreaterThanOrEqual(1);

  for (const path of paths) {
    await test.step(path, async () => {
      await page.goto(path);

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.locator('.katex-error').count(), 'math that failed to render').toBe(0);
      expect(await page.locator('cs-check.is-enhanced').count(), 'check-yourself questions').toBeGreaterThanOrEqual(3);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, 'sideways scrolling').toBeLessThanOrEqual(0);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
    });
  }
});

test('search finds every published Unit 5 lesson by its title', async ({ page }) => {
  test.slow();
  await page.goto(UNIT);
  const lessons = await page.locator('.topic-list a').evaluateAll((links) =>
    links.map((link) => ({ path: link.getAttribute('href') ?? '', title: link.textContent?.trim() ?? '' })),
  );
  expect(lessons.length).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Search' }).click();
  const input = page.locator('.pagefind-ui__search-input');

  for (const { path, title } of lessons) {
    await input.fill(title);

    await expect(page.locator(`.pagefind-ui__result-link[href*="${path}"]`).first(), title).toBeVisible();
  }
});
```

Lesson 5.2 already meets both tests, so they pass as written. Prove the first can fail: change `toBeGreaterThanOrEqual(3)` to `toBeGreaterThanOrEqual(4)`, run `npx playwright test all-lessons`, see it fail on `/unit-5-kinetics/5-2-rate-law/` with "check-yourself questions", then put the 3 back.

Run: `npx playwright test all-lessons`
Expected: 4 pass (two tests in two projects).

- [ ] **Step 15: Look at it**

Run `npm run build && npx astro preview --port 4400` and open `/unit-5-kinetics/5-2-rate-law/` at 1280 px and 390 px wide, light and dark. Check: the bar and the readout change as a slider moves; the radio buttons change the rate law; the bar is the unit's teal; nothing overflows on the phone. Print preview: the diagram prints without its controls. Stop the server.

- [ ] **Step 16: Commit and open the pull request**

```bash
git add package.json package-lock.json astro.config.mjs tests/e2e/search.spec.ts tests/e2e/home.spec.ts
git commit -m "build: add Svelte for interactive diagrams" -m "The design calls for three interactive diagrams in Unit 5. The search and home tests no longer assume lesson 5.2 is the only lesson."
git add src/lib/kinetics.ts src/lib/format.ts tests/unit/kinetics.test.ts tests/unit/format.test.ts
git commit -m "feat(diagrams): add the kinetics formulas and number formatting"
git add src/styles/diagram.css src/components/lesson/Diagram.astro src/components/diagrams/RateLawExplorer.svelte src/components/lesson/RateLawExplorer.astro src/layouts/Base.astro "src/pages/[unit]/[topic].astro" src/content/lessons/unit-5/5-2-rate-law.mdx tests/e2e/diagram.ts tests/e2e/diagram-rate-law.spec.ts
git commit -m "feat(diagrams): add the rate-law explorer to lesson 5.2"
git add tests/e2e/all-lessons.spec.ts
git commit -m "test(lessons): check every published lesson, found from the unit page"
git push -u origin topic/diagrams
gh pr create --base main --title "feat: interactive diagrams, starting with the rate-law explorer" --body-file <scratch>/pr-body.md
gh pr checks --watch --interval 20
```

Write the pull request body with the Write tool first: what was added, the test counts, and that merging deploys. No attribution line. When the check passes, **stop and ask the teacher to merge.** After the merge: `git checkout main && git pull --ff-only && git branch -d topic/diagrams`.

---

## Group B: rates and rate laws over time (pull request 2)

Branch: `topic/unit-5-rates`, from an up-to-date `main` after pull request 1 is merged. Tasks 2, 3 and 4.

### Task 2: Lesson 5.1, Reaction Rates

**Files:**
- Create: `src/content/lessons/unit-5/5-1-reaction-rates.mdx`
- Create: `public/figures/5-1-concentration-time.svg`

**Brief**

- **Front matter:** `topic: "5.1"`, `minutes: 10`, summary: "What a reaction rate measures, how the rates of the reactants and products are tied together, and what makes a reaction faster or slower."
- **Framework (5.1.A):** a rate is an amount of reactant converted to product per unit of time; the rates of change of the reactants and products are fixed by the coefficients in the balanced equation; concentration, temperature, surface area and catalysts change the rate.
- **Opening:** an antacid tablet fizzes for a minute in cold water and for seconds in hot water, and faster still if crushed first. Same reaction, same amount, different speed. Kinetics is the study of that speed.
- **Section "What a rate measures":** rate = change in concentration divided by the time it took, in M/s. A reactant's concentration falls, so its change is negative; a rate is reported as a positive number, which is why a reactant's rate carries a minus sign: $-\Delta[\text{reactant}]/\Delta t$. Over an interval this is the **average rate**.
- **Section "One reaction, several rates":** in $\ce{2N2O5(g) -> 4NO2(g) + O2(g)}$, four $\ce{NO2}$ appear for every two $\ce{N2O5}$ used, so $\ce{NO2}$ forms twice as fast as $\ce{N2O5}$ disappears, and $\ce{O2}$ forms half as fast. Dividing each by its coefficient gives one rate for the whole reaction: $\text{rate} = -\frac{1}{2}\frac{\Delta[\ce{N2O5}]}{\Delta t} = \frac{1}{4}\frac{\Delta[\ce{NO2}]}{\Delta t} = \frac{\Delta[\ce{O2}]}{\Delta t}$. `<KeyIdea>`: the coefficients tell you how the rates of the different substances compare.
- **Worked example "Three rates from one measurement":** in $\ce{2N2O5(g) -> 4NO2(g) + O2(g)}$, $[\ce{N2O5}]$ falls from 0.0200 M to 0.0160 M in 100 s. (1) $\ce{N2O5}$ disappears at $(0.0200 - 0.0160)\ \text{M} / 100\ \text{s} = 4.0 \times 10^{-5}\ \text{M/s}$. (2) $\ce{NO2}$ forms at $\frac{4}{2} \times 4.0 \times 10^{-5} = 8.0 \times 10^{-5}\ \text{M/s}$. (3) $\ce{O2}$ forms at $\frac{1}{2} \times 4.0 \times 10^{-5} = 2.0 \times 10^{-5}\ \text{M/s}$. Close by noting that all three describe the same reaction.
- **Check 1** (after the worked example), `<Check answer={2}>`: "In $\ce{N2(g) + 3H2(g) -> 2NH3(g)}$, $\ce{H2}$ is used up at 0.090 M/s. How fast does $\ce{NH3}$ form?" Options: 0.030 M/s; 0.060 M/s; 0.090 M/s; 0.135 M/s. Why: two $\ce{NH3}$ form for every three $\ce{H2}$ used, so $\frac{2}{3} \times 0.090 = 0.060\ \text{M/s}$.
- **Section "The rate changes as the reaction runs":** as the reactant is used up the reaction usually slows, so a graph of concentration against time is a curve that flattens. The rate at one moment (the **instantaneous rate**) is the steepness of the curve at that moment; the **initial rate** is the steepness at the very start, and it is the one topic 5.2 uses. Place the figure here.
- **Figure** `5-1-concentration-time.svg`: axes "time" (x) and "concentration" (y). A reactant curve falling from high on the y-axis and flattening (solid, ink), a product curve rising from zero and flattening (dashed, accent), each labeled on the curve ("reactant", "product"). A short straight tangent line touching the reactant curve at time zero, labeled "initial rate: steepest". Alt: "Graph of concentration against time. The reactant's curve starts high and falls, steeply at first and then more gently. The product's curve starts at zero and rises, steeply at first and then more gently. A straight line touching the reactant's curve at the start shows the initial rate, where the curve is steepest." Caption: "Both curves are steepest at the start. The reaction is fastest when it has the most reactant."
- **Check 2**, `<Check numeric="0.0050" unit="M/s">`: "The concentration of a reactant falls from 0.50 M to 0.35 M in 30 s. What is the average rate at which it is used up?" Why: $(0.50 - 0.35)\ \text{M} / 30\ \text{s} = 0.0050\ \text{M/s}$.
- **Section "What changes the rate":** four short paragraphs, each with its everyday example and a one-line reason at the particle level. Concentration: more particles in the same space meet more often. Temperature: particles move faster and hit harder. Surface area: only the particles on the outside of a solid can be reached, so crushing it exposes more (the crushed antacid tablet). Catalyst: a substance that speeds the reaction up and is not used up. Add one sentence that other conditions can matter too (light, for some reactions), but these four are the ones the course returns to. Say that topics 5.5 and 5.11 explain the temperature and catalyst effects properly.
- **Check 3**, `<Check answer={4}>`: "A piece of zinc reacts with hydrochloric acid. Which change does **not** make the reaction faster?" Options: grinding the zinc into powder; warming the acid; using more concentrated acid; using a wider beaker. Why: the first three raise the surface area, the temperature and the concentration. The shape of the container changes none of them.
- **Trap:** **Forgetting the coefficients** (the substances in one reaction do not all change at the same rate). **Reporting a negative rate** (a reactant's concentration falls, but the rate is given as a positive number). **Mixing up average and instantaneous rate** (an average is over an interval; the instantaneous rate is the steepness at one moment). **Confusing rate with amount** (a reaction can be fast and still make very little product).
- **Key points:** a rate is a change in concentration per unit of time, in M/s; dividing each substance's rate by its coefficient gives the same number; the rate usually falls as the reactant is used up, and is steepest at the start; concentration, temperature, surface area and catalysts change the rate.

**Steps**

- [ ] **Step 1:** Draw `public/figures/5-1-concentration-time.svg` as the brief describes, following "Static figures" above.
- [ ] **Step 2:** Write `src/content/lessons/unit-5/5-1-reaction-rates.mdx` from the brief, following "Rules for writing a lesson".
- [ ] **Step 3:** **Build and test.** Expected: `check-dist: 6 pages, 0 problem(s)`.
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** **Commit** (`feat(lessons): add 5.1 Reaction Rates`).

### Task 3: Lesson 5.3, Concentration Changes over Time, with the three-plot diagram

**Files:**
- Create: `src/components/diagrams/ConcentrationPlots.svelte`, `src/components/lesson/ConcentrationPlots.astro`
- Modify: `src/pages/[unit]/[topic].astro`
- Create: `src/content/lessons/unit-5/5-3-concentration-changes-over-time.mdx`
- Test: `tests/e2e/diagram-concentration-plots.spec.ts`

**Brief**

- **Front matter:** `topic: "5.3"`, `minutes: 15`, summary: "How to read the order of a reaction from the way a concentration falls over time, and what half-life means for a first-order reaction."
- **Framework (5.3.A):** the order can be inferred from a graph of concentration against time; ln[A] against time is linear for first order and 1/[A] against time is linear for second order; the slopes give k; the three equations $[\ce{A}]_t - [\ce{A}]_0 = -kt$, $\ln[\ce{A}]_t - \ln[\ce{A}]_0 = -kt$ and $1/[\ce{A}]_t - 1/[\ce{A}]_0 = kt$; half-life is constant for first order, with $t_{1/2} = 0.693/k$; radioactive decay is first order.
- **Opening:** topic 5.2 found the order by running the reaction several times. There is a second way that needs only one run: watch one concentration fall and look at the shape of the fall.
- **Section "Three orders, three shapes":** A is the reactant being followed. Say in one sentence that if the reaction has a second reactant, it is kept in large excess so that its concentration hardly changes and only A's fall shows. Then a table with columns Order / What falls steadily / Equation / Straight-line plot / Slope: zero, [A] itself, $[\ce{A}]_t = [\ce{A}]_0 - kt$, $[\ce{A}]$ against $t$, $-k$; first, $\ln[\ce{A}]$, $\ln[\ce{A}]_t = \ln[\ce{A}]_0 - kt$, $\ln[\ce{A}]$ against $t$, $-k$; second, nothing falls steadily but $1/[\ce{A}]$ rises steadily, $\frac{1}{[\ce{A}]_t} = \frac{1}{[\ce{A}]_0} + kt$, $1/[\ce{A}]$ against $t$, $+k$. Say that these equations are on the AP equation sheet. `<KeyIdea>`: make all three plots; the one that comes out straight tells you the order, and its slope gives k.
- **Diagram:** `<ConcentrationPlots />` directly after that table, introduced with one sentence ("Choose an order and see which plot straightens out.").
- **Check 1**, `<Check answer={3}>`: "For a reaction, a plot of $1/[\ce{A}]$ against time is a straight line. What is the order in A?" Options: 0; 1; 2; it cannot be told from one plot. Why: only a second-order reaction gives a straight line when $1/[\ce{A}]$ is plotted against time.
- **Section "Half-life":** the **half-life** is the time for the concentration to fall to half. For a first-order reaction it is the same no matter how much is left, and $t_{1/2} = 0.693/k$. After $n$ half-lives the fraction left is $(1/2)^n$. For zero and second order the half-life changes as the reaction runs, so a constant half-life is itself a sign of first order.
- **Worked example "Order and k from one run":** data for $\ce{A -> products}$: at 0, 100, 200 and 300 s, $[\ce{A}]$ is 0.800, 0.400, 0.200 and 0.100 M. (1) The concentration halves every 100 s, whatever it starts from: a constant half-life, so the reaction is first order. (2) Confirm with the plot: $\ln[\ce{A}]$ is $-0.223$, $-0.916$, $-1.609$, $-2.303$, falling by 0.693 each 100 s, a straight line. (3) $k = 0.693 / t_{1/2} = 0.693 / 100\ \text{s} = 6.93 \times 10^{-3}\ \text{s}^{-1}$, which is also minus the slope of that line.
- **Check 2**, `<Check numeric="30.0" unit="min">`: "A first-order reaction has $k = 0.0231\ \text{min}^{-1}$. What is its half-life?" Why: $t_{1/2} = 0.693 / 0.0231\ \text{min}^{-1} = 30.0\ \text{min}$.
- **Worked example "A concentration at a later time":** a second-order reaction has $k = 0.040\ \text{M}^{-1}\,\text{s}^{-1}$ and starts at $[\ce{A}]_0 = 0.50\ \text{M}$. Find $[\ce{A}]$ after 50 s. $\frac{1}{[\ce{A}]} = \frac{1}{0.50\ \text{M}} + (0.040\ \text{M}^{-1}\,\text{s}^{-1})(50\ \text{s}) = 2.0 + 2.0 = 4.0\ \text{M}^{-1}$, so $[\ce{A}] = 0.25\ \text{M}$.
- **Check 3**, `<Check numeric="0.40" unit="M">`: "A zero-order reaction starts at $[\ce{A}]_0 = 0.60\ \text{M}$ with $k = 0.020\ \text{M/s}$. What is $[\ce{A}]$ after 10 s?" Why: $[\ce{A}] = 0.60\ \text{M} - (0.020\ \text{M/s})(10\ \text{s}) = 0.40\ \text{M}$.
- **Section "Radioactive decay":** every radioactive decay is first order, so each isotope has one fixed half-life, and that is why half-life is the number quoted for it. Two sentences, then the check.
- **Check 4**, `<Check answer={3}>`: "A radioactive isotope has a half-life of 8.0 days. What fraction of a sample is left after 24 days?" Options: 1/2; 1/3; 1/8; 1/24. Why: 24 days is three half-lives, and $(1/2)^3 = 1/8$.
- **Trap:** **Using $t_{1/2} = 0.693/k$ for any order** (it holds for first order only). **Getting the sign of the slope wrong** (the first two plots slope down with slope $-k$; the $1/[\ce{A}]$ plot slopes up with slope $+k$). **Judging straightness by eye from the concentration curve** (first- and second-order curves look alike; make the plots). **Using log base 10** (the equation uses the natural log, ln).
- **Key points:** the three straight-line plots and their slopes; the three equations; first-order half-life is constant and equals $0.693/k$; after $n$ half-lives $(1/2)^n$ is left; radioactive decay is first order.
- **Do not include:** half-life formulas for zero or second order. The framework gives only the first-order one.

**Steps**

- [ ] **Step 1: Write the failing browser test**

`tests/e2e/diagram-concentration-plots.spec.ts`:

```ts
import { expect, test, type Locator } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-3-concentration-changes-over-time/';
const NAME = 'concentration-plots';
const START = 'For a first-order reaction, ln[A] against time is the straight line. Its slope is −k = −0.020 s⁻¹.';

/** How far the middle of a plotted curve sits from the straight line joining its two ends, in drawing units. */
async function bend(plot: Locator): Promise<number> {
  const points = (await plot.locator('polyline').getAttribute('points')) ?? '';
  const coordinates = points.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(`The plot has a point that is not "x,y": "${pair}"`);
    }
    return { x, y };
  });
  const first = coordinates[0];
  const middle = coordinates[Math.floor(coordinates.length / 2)];
  const last = coordinates[coordinates.length - 1];
  if (!first || !middle || !last) throw new Error(`The plot has too few points: "${points}"`);
  const onTheLine = first.y + ((last.y - first.y) * (middle.x - first.x)) / (last.x - first.x);
  return Math.abs(middle.y - onTheLine);
}

test('the plots start on first order, where ln[A] is the straight line', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(diagram.locator('.diagram-plot.is-linear')).toHaveCount(1);
  await expect(diagram.locator('[data-plot="ln"]')).toHaveClass(/is-linear/);
});

test('choosing second order from the keyboard makes 1/[A] the straight line', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(diagram.getByRole('status')).toHaveText(
    'For a second-order reaction, 1/[A] against time is the straight line. Its slope is k = 0.040 M⁻¹ s⁻¹.',
  );
  await expect(diagram.locator('.diagram-plot.is-linear')).toHaveCount(1);
  await expect(diagram.locator('[data-plot="reciprocal"]')).toHaveClass(/is-linear/);
});

test('choosing zero order makes [A] the straight line', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('radio', { name: 'zero' }).check();

  await expect(diagram.getByRole('status')).toHaveText(
    'For a zero-order reaction, [A] against time is the straight line. Its slope is −k = −0.0080 M/s.',
  );
  await expect(diagram.locator('[data-plot="concentration"]')).toHaveClass(/is-linear/);
});

for (const [order, straight] of [
  ['zero', 'concentration'],
  ['first', 'ln'],
  ['second', 'reciprocal'],
] as const) {
  test(`for ${order} order the plot marked straight is drawn straight and the other two are bent`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('radio', { name: order }).check();
    await expect(diagram.locator(`[data-plot="${straight}"]`)).toHaveClass(/is-linear/);

    for (const kind of ['concentration', 'ln', 'reciprocal']) {
      const offLine = await bend(diagram.locator(`[data-plot="${kind}"]`));
      if (kind === straight) expect(offLine, `${kind} plot`).toBeLessThan(0.5);
      else expect(offLine, `${kind} plot`).toBeGreaterThan(3);
    }
  });
}

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the plots show first order and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
```

- [ ] **Step 2: Write the diagram and its block**

`src/components/diagrams/ConcentrationPlots.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { LINEAR_PLOT, concentrationAt, plotValue, type Order, type PlotKind } from '../../lib/kinetics';

  const INITIAL = 1;
  const END_TIME = 100;
  const SAMPLES = 50;
  // Chosen so each order uses up most of A, and none of it runs out, by the
  // end of the plot: [A] finishes at 0.20 M, 0.14 M and 0.20 M.
  const RATE_CONSTANT: Record<Order, number> = { 0: 0.008, 1: 0.02, 2: 0.04 };
  const ORDERS: Order[] = [0, 1, 2];
  const ORDER_INFO: Record<Order, { name: string; slope: string }> = {
    0: { name: 'zero', slope: '−k = −0.0080 M/s' },
    1: { name: 'first', slope: '−k = −0.020 s⁻¹' },
    2: { name: 'second', slope: 'k = 0.040 M⁻¹ s⁻¹' },
  };
  const PLOTS: PlotKind[] = ['concentration', 'ln', 'reciprocal'];
  const PLOT_INFO: Record<PlotKind, { axis: string; spoken: string }> = {
    concentration: { axis: '[A]', spoken: 'the concentration of A' },
    ln: { axis: 'ln[A]', spoken: 'the natural log of the concentration of A' },
    reciprocal: { axis: '1/[A]', spoken: 'one over the concentration of A' },
  };
  const BOX = { left: 16, right: 196, top: 26, bottom: 140 };

  let order = $state<Order>(1);
  let hydrated = $state(false);

  const chosen = $derived(ORDER_INFO[order]);
  const linear = $derived(PLOT_INFO[LINEAR_PLOT[order]]);

  /** The curve for one plot, scaled to fill its box. */
  function pointsFor(kind: PlotKind, forOrder: Order): string {
    const values = Array.from({ length: SAMPLES + 1 }, (_, index) => {
      const time = (index / SAMPLES) * END_TIME;
      return plotValue(kind, concentrationAt(forOrder, INITIAL, RATE_CONSTANT[forOrder], time));
    });
    const lowest = Math.min(...values);
    const span = Math.max(...values) - lowest;
    return values
      .map((value, index) => {
        const x = BOX.left + (index / SAMPLES) * (BOX.right - BOX.left);
        const y = BOX.bottom - ((value - lowest) / span) * (BOX.bottom - BOX.top);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="concentration-plots" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-plots">
    {#each PLOTS as kind}
      {@const isLinear = kind === LINEAR_PLOT[order]}
      <figure class="diagram-plot" class:is-linear={isLinear} data-plot={kind}>
        <svg
          viewBox="0 0 210 165"
          role="img"
          aria-label={`Graph of ${PLOT_INFO[kind].spoken} against time for a ${chosen.name}-order reaction: a ${isLinear ? 'straight line' : 'curve'}.`}
        >
          <path class="diagram-axis" d={`M${BOX.left} ${BOX.top - 8}V${BOX.bottom}H${BOX.right + 6}`} />
          <polyline class="diagram-curve" class:is-accent={isLinear} points={pointsFor(kind, order)} />
          <text class="diagram-label" x={BOX.left} y="12">{PLOT_INFO[kind].axis}</text>
          <text class="diagram-label" x={BOX.right + 6} y="157" text-anchor="end">time</text>
        </svg>
        <p class="diagram-plot-note">{isLinear ? 'straight line' : 'curve'}</p>
      </figure>
    {/each}
  </div>
  <p class="diagram-readout" role="status">
    For a {chosen.name}-order reaction, {linear.axis} against time is the straight line. Its slope is {chosen.slope}.
  </p>
  <div class="diagram-controls">
    <fieldset class="diagram-choice">
      <legend>Order in A</legend>
      {#each ORDERS as option}
        <label>
          <input type="radio" name="concentration-plots-order" value={option} bind:group={order} />{ORDER_INFO[option].name}
        </label>
      {/each}
    </fieldset>
  </div>
</div>
```

`src/components/lesson/ConcentrationPlots.astro`:

```astro
---
import Plots from '../diagrams/ConcentrationPlots.svelte';
import Diagram from './Diagram.astro';
---

<Diagram caption="Choose an order. Only one of the three plots comes out as a straight line.">
  <Plots client:visible />
</Diagram>
```

In `src/pages/[unit]/[topic].astro`, add the import in alphabetical place and the name to `blocks`:

```astro
import Check from '../../components/lesson/Check.astro';
import ConcentrationPlots from '../../components/lesson/ConcentrationPlots.astro';
import Figure from '../../components/lesson/Figure.astro';
```

```astro
const blocks = { Check, ConcentrationPlots, Figure, KeyIdea, KeyPoints, PracticeNext, RateLawExplorer, Trap, Worked };
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npx playwright test diagram-concentration-plots`
Expected: every test fails, because the page `/unit-5-kinetics/5-3-concentration-changes-over-time/` does not exist yet.

- [ ] **Step 4:** Write `src/content/lessons/unit-5/5-3-concentration-changes-over-time.mdx` from the brief.
- [ ] **Step 5:** **Build and test.** Expected: the 14 diagram tests (seven in two projects) now pass, and `check-dist: 7 pages, 0 problem(s)`.
- [ ] **Step 6:** **Look at it.** Also choose each order in the diagram and confirm that exactly one plot is marked "straight line" and looks straight.
- [ ] **Step 7:** **Fact-check, independently.**
- [ ] **Step 8:** **Commit**, as one commit:

```bash
git add src/components/diagrams/ConcentrationPlots.svelte src/components/lesson/ConcentrationPlots.astro "src/pages/[unit]/[topic].astro" tests/e2e/diagram-concentration-plots.spec.ts src/content/lessons/unit-5/5-3-concentration-changes-over-time.mdx
git commit -m "feat(lessons): add 5.3 Concentration Changes over Time" -m "Includes the three-plot diagram: choose an order and see which of [A], ln[A] and 1/[A] against time is the straight line."
```

(One commit: the diagram's test cannot pass without the lesson that hosts it.)

### Task 4: Lesson 5.4, Elementary Reactions

**Files:**
- Create: `src/content/lessons/unit-5/5-4-elementary-reactions.mdx`
- Create: `public/figures/5-4-molecularity.svg`

**Brief**

- **Front matter:** `topic: "5.4"`, `minutes: 8`, summary: "What an elementary reaction is, and why its rate law, unlike most, can be written straight from its equation."
- **Framework (5.4.A):** the rate law of an elementary reaction can be inferred from the stoichiometry of the particles that collide; elementary reactions in which three or more particles collide at once are rare.
- **Opening:** topic 5.2 insisted that you cannot read a rate law off a balanced equation. There is one kind of reaction where you can, and the reason is simple: its equation is not a summary, it is a description of a single event.
- **Section "One event":** an **elementary reaction** happens in a single step, exactly as written: these particles meet, and those come out. The number of reactant particles in the step is its **molecularity**: one is unimolecular, two is bimolecular, three is termolecular.
- **Figure** `5-4-molecularity.svg`: three panels side by side, each with a heading and circles for particles. "Unimolecular": one particle with a small "breaks apart" arrow to two fragments. "Bimolecular": two particles with arrows pointing toward each other. "Termolecular": three particles with arrows converging on one point, and the note "rare". Alt: "Three drawings. In the unimolecular step a single particle breaks apart. In the bimolecular step two particles collide. In the termolecular step three particles collide at the same instant, which is rare." Caption: "The molecularity of a step is the number of particles that take part in it."
- **Section "Here the coefficients do count":** the rate of a step is proportional to how often its particles meet, and that is proportional to each one's concentration. So for an elementary step the orders equal the coefficients. Table with columns Elementary step / Molecularity / Rate law: $\ce{A -> products}$, unimolecular, $k[\ce{A}]$; $\ce{A + B -> products}$, bimolecular, $k[\ce{A}][\ce{B}]$; $\ce{2A -> products}$, bimolecular, $k[\ce{A}]^2$; $\ce{2A + B -> products}$, termolecular, $k[\ce{A}]^2[\ce{B}]$. `<KeyIdea>`: for an elementary step, and only for an elementary step, the exponents in the rate law are the coefficients in the equation.
- **Worked example "Rate laws for three elementary steps":** (1) $\ce{O3(g) -> O2(g) + O(g)}$: one particle, unimolecular, $\text{rate} = k[\ce{O3}]$. (2) $\ce{NO2(g) + F2(g) -> NO2F(g) + F(g)}$: two particles, bimolecular, $\text{rate} = k[\ce{NO2}][\ce{F2}]$. (3) $\ce{2NO2(g) -> NO3(g) + NO(g)}$: two particles of the same kind, bimolecular, $\text{rate} = k[\ce{NO2}]^2$.
- **Check 1**, `<Check answer={3}>`: "The elementary step $\ce{Cl(g) + O3(g) -> ClO(g) + O2(g)}$ has which rate law?" Options: $\text{rate} = k[\ce{Cl}]$; $\text{rate} = k[\ce{O3}]$; $\text{rate} = k[\ce{Cl}][\ce{O3}]$; $\text{rate} = k[\ce{ClO}][\ce{O2}]$. Why: one Cl and one $\ce{O3}$ collide, so each concentration appears once. Products never appear in the rate law of a step.
- **Check 2**, `<Check answer={2}>`: "What is the molecularity of the elementary step $\ce{2NO2(g) -> NO3(g) + NO(g)}$?" Options: unimolecular; bimolecular; termolecular; it depends on the temperature. Why: two reactant particles collide. That they are the same substance does not matter.
- **Section "Why three at once is rare":** two particles meeting is common. A third arriving at the same spot in the same instant, with enough energy and facing the right way, is far less likely. So termolecular steps are rare, and steps with four or more particles are not seen. A reaction whose balanced equation has many particles on the left must happen in several steps, which is where topic 5.7 picks up.
- **Check 3**, `<Check answer={2}>`: "Which statement is true?" Options: the rate law of any balanced equation can be written from its coefficients; the rate law of an elementary step can be written from its coefficients; termolecular steps cannot happen; the molecularity of a step can be a fraction. Why: only an elementary step describes a single collision, so only there do the coefficients give the orders. Termolecular steps are rare, not impossible, and a molecularity counts particles, so it is a whole number.
- **Trap:** **Using this rule on an overall equation** (most balanced equations are summaries of several steps; their orders come from experiment, as in topic 5.2). **Calling a termolecular step impossible** (it is rare). **Counting products** (molecularity counts the reactant particles of the step only).
- **Key points:** an elementary reaction is one step, as written; molecularity is the number of reactant particles in the step; for an elementary step the orders equal the coefficients; steps involving three particles at once are rare.

**Steps**

- [ ] **Step 1:** Draw `public/figures/5-4-molecularity.svg`.
- [ ] **Step 2:** Write `src/content/lessons/unit-5/5-4-elementary-reactions.mdx` from the brief.
- [ ] **Step 3:** **Build and test.** Expected: `check-dist: 8 pages, 0 problem(s)`.
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** **Commit** (`feat(lessons): add 5.4 Elementary Reactions`).
- [ ] **Step 7: Open pull request 2**

```bash
git push -u origin topic/unit-5-rates
gh pr create --base main --title "feat(lessons): add 5.1, 5.3 and 5.4" --body-file <scratch>/pr-body.md
gh pr checks --watch --interval 20
```

The body lists the three lessons, the new diagram, and what each fact-check confirmed or changed. When the check passes, **stop and ask the teacher to merge.** Then `git checkout main && git pull --ff-only && git branch -d topic/unit-5-rates`.

---

## Group C: collisions and energy (pull request 3)

Branch: `topic/unit-5-energy`. Tasks 5 and 6.

### Task 5: Lesson 5.5, Collision Model

**Files:**
- Create: `src/content/lessons/unit-5/5-5-collision-model.mdx`
- Create: `public/figures/5-5-energy-distribution.svg`

**Brief**

- **Front matter:** `topic: "5.5"`, `minutes: 10`, summary: "Why most collisions between molecules lead nowhere, and how energy, orientation and temperature decide which ones count."
- **Framework (5.5.A):** for an elementary reaction to give products the reactants must collide; only a small fraction of collisions succeed, those with enough energy to get over the activation energy and an orientation that lets the bonds rearrange; the Maxwell–Boltzmann distribution shows, qualitatively, what fraction of collisions have enough energy and how that fraction depends on temperature.
- **Opening:** in a flask of gas at room temperature each molecule collides billions of times a second. If every collision led to reaction, almost every gas reaction would be over in an instant. Most are not. Nearly all collisions fail, and this lesson is about why.
- **Section "Two conditions":** a collision leads to products only if (1) the particles hit with at least a minimum energy, the **activation energy** $E_a$, enough to start breaking bonds, and (2) they meet in an **orientation** that brings the right atoms together. Example for orientation, an elementary step: in $\ce{NO(g) + O3(g) -> NO2(g) + O2(g)}$ the nitrogen atom of NO has to meet an oxygen atom at one end of $\ce{O3}$, so a collision in which the oxygen end of NO strikes the ozone does nothing, however hard it is. (Do not use $\ce{NO2 + CO}$ here: topics 5.7 and 5.8 show it does not happen in one collision.) `<KeyIdea>`: a collision counts only if it is hard enough and aimed right.
- **Check 1**, `<Check answer={2}>`: "Two molecules collide with more than the activation energy but do not react. What is the most likely reason?" Options: the temperature is too low; they met in the wrong orientation; the activation energy rose during the collision; the collision was too slow. Why: energy was not the problem, so the other condition failed: the atoms that needed to meet were not facing each other.
- **Section "How many collisions have enough energy":** at any temperature the particles have a spread of energies: a few slow, most in the middle, a few fast. The curve of "how many particles have each energy" is the **Maxwell–Boltzmann distribution**. Mark the activation energy on the energy axis: only the particles to the right of it can react, and that is the area under the curve beyond $E_a$. At a higher temperature the curve is lower and stretched to the right. The total area is the same, since the number of particles has not changed, but the area beyond $E_a$ is much larger. Place the figure here.
- **Figure** `5-5-energy-distribution.svg`: x-axis "energy of the particles", y-axis "number of particles". Two curves starting at the origin: "lower temperature" (solid, ink), tall with its peak to the left; "higher temperature" (dashed, accent), lower and broader with its peak further right and a longer tail. A vertical line labeled "$E_a$" (write it as plain text "Ea" with the a as a subscript `<tspan>`), well to the right of both peaks. Shade the area under each curve to the right of that line; the shaded area under the higher-temperature curve is clearly the larger. Label the shaded region "enough energy to react". Alt: "Two curves of number of particles against energy. At the lower temperature the curve is tall with its peak at low energy. At the higher temperature the curve is lower and wider, with its peak at higher energy. A vertical line marks the activation energy. The area under each curve beyond that line is shaded, and it is much larger for the higher temperature." Caption: "Only the particles beyond the activation energy can react. Warming the sample puts many more of them there."
- **Check 2**, `<Check answer={3}>`: "A sample is warmed. What happens to its Maxwell–Boltzmann curve?" Options: the whole curve moves up; the area under the curve grows; the peak gets lower and moves to higher energy; the activation energy moves to the left. Why: the same particles are spread over a wider range of energies, so the peak is lower and further right while the total area stays the same. The activation energy belongs to the reaction and does not move.
- **Worked example "Why ten degrees matters so much":** warming many reactions from 25 °C to 35 °C roughly doubles their rate. Is that because the particles collide more often? (1) The average speed of the particles is proportional to the square root of the kelvin temperature: $\sqrt{308\ \text{K} / 298\ \text{K}} = 1.017$, so they move, and collide, about 1.7 percent more. (2) A 1.7 percent rise in collisions cannot double a rate. (3) What changes is the fraction of collisions beyond $E_a$: that part of the curve is a thin tail, and a small shift of the curve to the right can double it. Conclusion: temperature speeds reactions up mainly by making more collisions energetic enough, not by making more collisions. State plainly that "roughly doubles" is a rule of thumb for many reactions near room temperature, not a law.
- **Section "Putting it together":** a three-row table, Change / What it does to collisions: raise a concentration, more collisions per second; raise the temperature, a much larger fraction of collisions with enough energy (and slightly more collisions); the orientation requirement, a fixed fraction of collisions aimed right, set by the shapes of the particles.
- **Check 3**, `<Check answer={1}>`: "Doubling the concentration of a gas reactant speeds a reaction up mainly because:" Options: its particles collide more often; a larger fraction of collisions have enough energy; the activation energy falls; the particles line up better. Why: concentration changes how often particles meet. It does not change how hard they hit, the activation energy, or their shapes.
- **Trap:** **"Hotter means more collisions"** as the whole explanation (the rise in collisions is small; the rise in energetic collisions is large). **Thinking the activation energy changes with temperature** (it does not; the particles change, not the barrier). **Thinking the area under the curve grows** (same particles, same area). **Forgetting orientation** (enough energy is necessary but not sufficient).
- **Key points:** particles must collide to react; a collision succeeds only with at least the activation energy and a workable orientation; the Maxwell–Boltzmann curve shows the spread of energies, and the share of its area that lies beyond $E_a$ is the fraction that can react; raising the temperature enlarges that fraction greatly; raising a concentration raises the number of collisions.

**Steps**

- [ ] **Step 1:** Draw `public/figures/5-5-energy-distribution.svg`.
- [ ] **Step 2:** Write `src/content/lessons/unit-5/5-5-collision-model.mdx` from the brief.
- [ ] **Step 3:** **Build and test.** Expected: `check-dist: 9 pages, 0 problem(s)`.
- [ ] **Step 4:** **Look at it.** In the dark theme, check that both curves and both shaded areas of the figure can be told apart.
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** **Commit** (`feat(lessons): add 5.5 Collision Model`).

### Task 6: Lesson 5.6, Reaction Energy Profile

**Files:**
- Create: `src/content/lessons/unit-5/5-6-reaction-energy-profile.mdx`
- Create: `public/figures/5-6-energy-profile.svg`

**Brief**

- **Front matter:** `topic: "5.6"`, `minutes: 10`, summary: "How to read an energy profile: the reactants, the transition state, the products, the activation energy and the overall energy change."
- **Framework (5.6.A):** elementary reactions typically break some bonds and form new ones; the reaction coordinate is the axis along which the rearrangement is plotted; the profile runs from reactants through a transition state to products, and the energy difference between reactants and transition state is the activation energy of the forward reaction; the rate depends on temperature because the proportion of collisions energetic enough to reach the transition state varies with temperature; the Arrhenius equation relates that temperature dependence to the activation energy. **Exclusion: calculations with the Arrhenius equation are not assessed.**
- **Opening:** a ball at the top of a slope will not roll into the next valley if a ridge stands in the way, however deep that valley is. It first has to be pushed over the ridge. A reaction is the same: products may be lower in energy, and the reactants still have to climb first. An energy profile is a picture of that climb.
- **Section "The path over the hill":** during a step, old bonds stretch and break while new ones start to form. Partway through, the atoms are in an awkward, high-energy arrangement that is neither reactants nor products: the **transition state**. The horizontal axis of a profile, the **reaction coordinate** (or reaction progress), measures how far along that rearrangement the particles are; it is not time. The vertical axis is energy.
- **Figure** `5-6-energy-profile.svg`: one smooth hill from a "reactants" plateau up to a peak labeled "transition state" and down to a lower "products" plateau. x-axis "reaction progress", y-axis "energy". A vertical double-headed arrow from the reactants' level to the peak labeled "Ea (forward)"; a second from the products' level to the peak labeled "Ea (reverse)"; a third between the reactants' and products' levels labeled "energy change, ΔE", with thin dashed horizontal guide lines so the arrows' ends are clear. Alt: "Energy profile of an exothermic step. The curve starts at the reactants, rises to a peak marked transition state and falls to the products, which are lower than the reactants. Arrows show the forward activation energy from the reactants up to the peak, the reverse activation energy from the products up to the peak, and the overall energy change between reactants and products." Caption: "The activation energy is the climb from where you start to the top of the hill."
- **Section "Reading a profile":** three numbers can be read off. Forward activation energy $E_a$: transition state minus reactants. Reverse activation energy: transition state minus products. Overall energy change $\Delta E$: products minus reactants, negative when energy is released (exothermic) and positive when it is absorbed (endothermic). They are linked: $\Delta E = E_a(\text{forward}) - E_a(\text{reverse})$. `<KeyIdea>`: the activation energy decides how fast; the overall energy change decides how much energy is released or absorbed. Neither tells you the other.
- **Worked example "Three numbers from one profile":** on a profile the reactants are at 40 kJ/mol, the transition state at 165 kJ/mol and the products at 15 kJ/mol. (1) $E_a(\text{forward}) = 165 - 40 = 125\ \text{kJ/mol}$. (2) $\Delta E = 15 - 40 = -25\ \text{kJ/mol}$: the products are lower, so the step is exothermic. (3) $E_a(\text{reverse}) = 165 - 15 = 150\ \text{kJ/mol}$. Check: $125 - 150 = -25$.
- **Check 1**, `<Check numeric="110" unit="kJ/mol">`: "A step has a forward activation energy of 80 kJ/mol and releases 30 kJ/mol overall. What is the activation energy of the reverse step?" Why: the products are 30 kJ/mol below the reactants, so the climb back to the transition state is $80 + 30 = 110\ \text{kJ/mol}$.
- **Check 2**, `<Check answer={1}>`: "Which describes a transition state?" Options: the highest-energy arrangement of atoms along the path, which cannot be isolated; a substance that forms in one step and is used up in a later one; the reactants at the moment they are mixed; the products just after they form. Why: it is the top of the hill, where bonds are partly broken and partly formed. It lasts for an instant and cannot be collected. The second option describes an intermediate, which topic 5.7 covers.
- **Section "Why the height of the hill matters":** from topic 5.5, only collisions with at least $E_a$ can reach the top. A higher hill leaves fewer collisions able to climb it, so the reaction is slower; a higher temperature gives more collisions the energy to climb it, so the reaction is faster. That is why the rate constant $k$ depends on temperature. It does not depend on the concentrations. (A catalyst changes it too, by changing the hill itself: topic 5.11.) Then, still in the main text because the framework requires it: the **Arrhenius equation**, $k = Ae^{-E_a/RT}$, ties the three together. Say in words what it shows: $k$ falls as $E_a$ rises, and $k$ rises as $T$ rises.
- **Beyond the exam:** one sentence, starting with those bold words: calculating with the Arrhenius equation is not assessed on the AP Exam. Only the calculation carries this label; what the equation says is required.
- **Check 3**, `<Check answer={1}>`: "Two reactions run at the same temperature and are alike except for their activation energies: 50 kJ/mol for X and 90 kJ/mol for Y. Which is faster?" Options: X, because more collisions can get over its lower barrier; Y, because it has more energy; they are equally fast, because the temperature is the same; it depends on which releases more energy. Why: at one temperature the spread of collision energies is the same for both, so the lower barrier is crossed by a larger fraction of collisions.
- **Trap:** **Measuring $E_a$ from zero** (it is measured from the reactants, not from the bottom of the axis). **Reading speed from $\Delta E$** (a very exothermic reaction can be very slow). **Calling the transition state an intermediate** (a peak is not a substance you can find in the flask). **Reading the horizontal axis as time** (it is progress along the rearrangement).
- **Key points:** a profile plots energy against reaction progress, from reactants over a transition state to products; $E_a$ is transition state minus reactants; $\Delta E$ is products minus reactants, and $\Delta E = E_a(\text{forward}) - E_a(\text{reverse})$; a larger $E_a$ means a slower reaction at a given temperature; raising the temperature raises $k$.

**Steps**

- [ ] **Step 1:** Draw `public/figures/5-6-energy-profile.svg`.
- [ ] **Step 2:** Write `src/content/lessons/unit-5/5-6-reaction-energy-profile.mdx` from the brief.
- [ ] **Step 3:** **Build and test.** Expected: `check-dist: 10 pages, 0 problem(s)`.
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.** Tell the checker to confirm that the lesson states what the Arrhenius equation shows in its main text, labels only calculating with it as **Beyond the exam**, and asks for no calculation.
- [ ] **Step 6:** **Commit** (`feat(lessons): add 5.6 Reaction Energy Profile`).
- [ ] **Step 7: Open pull request 3** (`git push -u origin topic/unit-5-energy`, title `feat(lessons): add 5.5 and 5.6`). When the check passes, **stop and ask the teacher to merge.** Then return to an up-to-date `main` and delete the branch.

---

## Group D: mechanisms (pull request 4)

Branch: `topic/unit-5-mechanisms`. Tasks 7, 8 and 9. These three lessons build on one another and reuse the same reactions on purpose, so write them in order.

### Task 7: Lesson 5.7, Introduction to Reaction Mechanisms

**Files:**
- Create: `src/content/lessons/unit-5/5-7-introduction-to-reaction-mechanisms.mdx`

**Brief**

- **Front matter:** `topic: "5.7"`, `minutes: 10`, summary: "How a reaction is broken into elementary steps, and how to tell the reactants, products, intermediates and catalysts of a mechanism apart."
- **Framework (5.7.A):** a mechanism is a series of elementary steps in sequence; its components may include reactants, intermediates, products and catalysts; the steps combined must match the overall balanced equation; an intermediate is produced by some steps and consumed by others, so it is present only while the reaction runs; detecting an intermediate by experiment is evidence for one mechanism over another. **Exclusion: collecting data on the detection of an intermediate is not assessed.**
- **Opening:** the balanced equation for a reaction says what you start with and what you end with. It says nothing about the route. Most reactions do not happen in one collision; they happen in a short series of them. That series is the **reaction mechanism**.
- **Section "A reaction in steps":** a mechanism is a list of elementary steps (topic 5.4) that happen one after another. Introduce with $\ce{NO2(g) + CO(g) -> NO(g) + CO2(g)}$, the reaction from topic 5.2 whose rate does not depend on CO. Its mechanism: Step 1, $\ce{NO2 + NO2 -> NO3 + NO}$; Step 2, $\ce{NO3 + CO -> NO2 + CO2}$.
- **Section "The steps must add up":** add the steps as you would add equations, then cancel whatever appears on both sides. Worked below. `<KeyIdea>`: a proposed mechanism has to add up to the overall equation. If it does not, it is wrong.
- **Worked example "Adding up a mechanism":** (1) Write both steps. (2) Add them: $\ce{NO2 + NO2 + NO3 + CO -> NO3 + NO + NO2 + CO2}$. (3) Cancel $\ce{NO3}$ and one $\ce{NO2}$ from both sides: $\ce{NO2 + CO -> NO + CO2}$, the overall equation. (4) $\ce{NO3}$ was made in step 1 and used in step 2 and is gone from the total: it is an intermediate. (5) $\ce{NO2}$ is used in step 1 and one comes back in step 2. That does not make it a catalyst: two went in and only one came back, so one $\ce{NO2}$ is consumed overall, and it is a reactant.
- **Section "Intermediates":** an **intermediate** is made in one step and used up in a later one. It never appears in the overall equation, and it exists only while the reaction is running. It is a real substance, though usually short-lived and present in tiny amounts, which is what separates it from a transition state.
- **Check 1**, `<Check answer={3}>`: "A reaction has this mechanism. Step 1: $\ce{Cl2 -> 2Cl}$. Step 2: $\ce{Cl + CHCl3 -> HCl + CCl3}$. Step 3: $\ce{CCl3 + Cl -> CCl4}$. Which of these is an intermediate?" Options: $\ce{Cl2}$; $\ce{CHCl3}$; $\ce{CCl3}$; $\ce{HCl}$. Why: $\ce{CCl3}$ is made in step 2 and used up in step 3, so it cancels out of the overall equation, $\ce{Cl2 + CHCl3 -> HCl + CCl4}$. (Cl atoms are an intermediate too.)
- **Section "Catalysts in a mechanism":** a **catalyst** shows up the other way round: it is used in an early step and made again in a later one, so it also cancels out of the overall equation. Example: hydrogen peroxide decomposing with iodide ion. Step 1: $\ce{H2O2 + I- -> H2O + IO-}$. Step 2: $\ce{H2O2 + IO- -> H2O + O2 + I-}$. Overall: $\ce{2H2O2 -> 2H2O + O2}$. $\ce{I-}$ goes in first and comes back: catalyst. $\ce{IO-}$ is made first and then used: intermediate. Give the rule as a two-row table: Intermediate, made then used up, so none is left at the end; Catalyst, used then made again in full, so none is consumed overall.
- **Check 2**, `<Check answer={3}>`: "Step 1: $\ce{O3 + Cl -> ClO + O2}$. Step 2: $\ce{ClO + O -> Cl + O2}$. What is the role of Cl?" Options: reactant; intermediate; catalyst; product. Why: Cl is used in step 1 and made again in step 2, so it is not consumed overall. ClO, made and then used, is the intermediate.
- **Check 3**, `<Check answer={2}>`: "Step 1: $\ce{A + B -> C}$. Step 2: $\ce{C + A -> D}$. What is the overall equation?" Options: $\ce{A + B -> D}$; $\ce{2A + B -> D}$; $\ce{A + B + C -> D}$; $\ce{2A + B -> C + D}$. Why: adding the steps gives $\ce{2A + B + C -> C + D}$, and C cancels.
- **Section "Evidence for a mechanism":** a mechanism is a proposal. Two things can be checked: it must add up to the overall equation, and (topic 5.8) it must predict the rate law that is measured. Finding one of its intermediates in the reacting mixture is strong evidence for it. Even then a mechanism is supported, never proven: a different mechanism might fit the same facts.
- **Trap:** **Mixing up intermediate and catalyst** (look at the order: made then used, or used then made). **Leaving an intermediate in the overall equation** (it must cancel). **Treating a mechanism as proven** (it can only be consistent with the evidence). **Confusing an intermediate with a transition state** (an intermediate sits in a valley of the profile and can in principle be detected; a transition state is a peak and cannot).
- **Key points:** a mechanism is a sequence of elementary steps; the steps add up to the overall equation; an intermediate is made and then used; a catalyst is used and then made again; neither appears in the overall equation; a mechanism can be supported by evidence but not proven.

**Steps**

- [ ] **Step 1:** Write `src/content/lessons/unit-5/5-7-introduction-to-reaction-mechanisms.mdx` from the brief. It has no figure.
- [ ] **Step 2:** **Build and test.** Expected: `check-dist: 11 pages, 0 problem(s)`.
- [ ] **Step 3:** **Look at it.**
- [ ] **Step 4:** **Fact-check, independently.** Tell the checker to add up every mechanism in the lesson itself.
- [ ] **Step 5:** **Commit** (`feat(lessons): add 5.7 Introduction to Reaction Mechanisms`).

### Task 8: Lesson 5.8, Reaction Mechanism and Rate Law

**Files:**
- Create: `src/content/lessons/unit-5/5-8-reaction-mechanism-and-rate-law.mdx`

**Brief**

- **Front matter:** `topic: "5.8"`, `minutes: 10`, summary: "How the slowest step of a mechanism sets the rate law, and how to test a proposed mechanism against the rate law that was measured."
- **Framework (5.8.A):** when each elementary step is irreversible, or when the first step is rate limiting, the rate law of the reaction is set by the molecularity of the slowest step, the rate-limiting step.
- **Opening:** a class leaves a room through one narrow door. It does not matter how fast everyone walks down the corridor afterward: the class gets out at the rate the door allows. A mechanism has a door too.
- **Section "The slow step sets the pace":** in most mechanisms one step is much slower than the rest: the **rate-limiting step** (also called the rate-determining step). The overall reaction can go no faster than that step, so the rate of the reaction is the rate of that step.
- **Section "When the first step is the slow one":** the slow step is elementary, so its rate law comes straight from its equation (topic 5.4). If it is the first step, everything in that rate law is a reactant of the overall reaction, and the job is done: the rate law of the reaction is the rate law of step 1. Anything that only enters in later, fast steps does not appear. `<KeyIdea>`: when the first step is slow, the rate law of the reaction is the rate law of that step.
- **Worked example "A mechanism that explains a strange rate law":** experiment gives $\text{rate} = k[\ce{NO2}]^2$ for $\ce{NO2(g) + CO(g) -> NO(g) + CO2(g)}$, with no CO in it. (1) Try the obvious one-step mechanism, $\ce{NO2 + CO -> NO + CO2}$: it predicts $\text{rate} = k[\ce{NO2}][\ce{CO}]$. That is not what is measured, so the reaction does not happen in one step. (2) Try the two-step mechanism of topic 5.7 with step 1 slow: $\ce{NO2 + NO2 -> NO3 + NO}$ (slow), $\ce{NO3 + CO -> NO2 + CO2}$ (fast). (3) The slow step is bimolecular in $\ce{NO2}$, so it predicts $\text{rate} = k[\ce{NO2}]^2$. (4) That matches, and the steps add up, so this mechanism is consistent with the evidence. CO enters only after the slow step, which is why changing its concentration does nothing.
- **Check 1**, `<Check answer={1}>`: "Step 1 (slow): $\ce{A + B -> C}$. Step 2 (fast): $\ce{C + B -> D}$. What rate law does this mechanism predict?" Options: $\text{rate} = k[\ce{A}][\ce{B}]$; $\text{rate} = k[\ce{A}][\ce{B}]^2$; $\text{rate} = k[\ce{C}][\ce{B}]$; $\text{rate} = k[\ce{A}]$. Why: the slow step is the first one, and one A and one B collide in it. The second B enters after the slow step, so it does not affect the rate.
- **Section "Testing a mechanism":** two tests, both needed. (1) The steps add up to the overall equation. (2) The rate law the mechanism predicts is the one that is measured. Passing both does not prove the mechanism; failing either rules it out.
- **Worked example "Checking a proposal":** for $\ce{2NO2(g) + F2(g) -> 2NO2F(g)}$ the measured rate law is $\text{rate} = k[\ce{NO2}][\ce{F2}]$. Proposed: $\ce{NO2 + F2 -> NO2F + F}$ (slow), then $\ce{NO2 + F -> NO2F}$ (fast). (1) Sum: $\ce{2NO2 + F2 -> 2NO2F}$ after F cancels. It adds up. (2) The slow first step predicts $\text{rate} = k[\ce{NO2}][\ce{F2}]$. It matches. The proposal is consistent. Note that the overall equation alone, with its 2 in front of $\ce{NO2}$, would have suggested second order in $\ce{NO2}$, and been wrong.
- **Check 2**, `<Check answer={2}>`: "A reaction has the measured rate law $\text{rate} = k[\ce{X}]^2$. Which slow first step is consistent with it?" Options: $\ce{X + Y -> products}$; $\ce{2X -> products}$; $\ce{X -> products}$; $\ce{X + 2Y -> products}$. Why: a step in which two X particles collide has the rate law $k[\ce{X}]^2$. The others predict $k[\ce{X}][\ce{Y}]$, $k[\ce{X}]$ and $k[\ce{X}][\ce{Y}]^2$.
- **Check 3**, `<Check answer={3}>`: "For the mechanism of $\ce{2NO2 + F2 -> 2NO2F}$ above, both $[\ce{NO2}]$ and $[\ce{F2}]$ are doubled. By what factor does the rate change?" Options: 2; 3; 4; 8. Why: the rate law is $k[\ce{NO2}][\ce{F2}]$, first order in each, so the rate is multiplied by $2 \times 2 = 4$. Using the coefficients of the overall equation would have given 8.
- **Trap:** **Writing the rate law from the overall equation** (use the slow step). **Putting an intermediate in the rate law** (a rate law contains only substances you can measure out: reactants, and sometimes a catalyst or a product, as topic 5.9 shows). **Saying a mechanism is proven** (consistent is the strongest word available). **Assuming the slow step is always first** (when it is not, see topic 5.9).
- **Key points:** the rate-limiting step is the slowest step, and the reaction goes at its rate; when the first step is slow, the reaction's rate law is that step's rate law; reactants that enter only after the slow step do not appear in the rate law; a mechanism must add up to the overall equation and predict the measured rate law.

**Steps**

- [ ] **Step 1:** Write `src/content/lessons/unit-5/5-8-reaction-mechanism-and-rate-law.mdx` from the brief. It has no figure.
- [ ] **Step 2:** **Build and test.** Expected: `check-dist: 12 pages, 0 problem(s)`.
- [ ] **Step 3:** **Look at it.**
- [ ] **Step 4:** **Fact-check, independently.**
- [ ] **Step 5:** **Commit** (`feat(lessons): add 5.8 Reaction Mechanism and Rate Law`).

### Task 9: Lesson 5.9, Pre-Equilibrium Approximation

**Files:**
- Create: `src/content/lessons/unit-5/5-9-pre-equilibrium-approximation.mdx`

**Brief**

- **Front matter:** `topic: "5.9"`, `minutes: 12`, summary: "How to find the rate law when the slow step is not the first one, by treating the fast step before it as an equilibrium."
- **Framework (5.9.A):** if the first elementary step is not rate limiting, an approximation such as pre-equilibrium must be made to find the rate law.
- **Opening:** topic 5.8 was easy because the slow step came first. Put the slow step second and a problem appears: its rate law contains an intermediate, and you cannot measure out an intermediate. This lesson is one trick for getting rid of it.
- **Section "The problem":** take $\ce{2NO(g) + O2(g) -> 2NO2(g)}$, measured rate law $\text{rate} = k[\ce{NO}]^2[\ce{O2}]$ (topic 5.2). A single termolecular step would fit but is unlikely (topic 5.4). Proposed instead: Step 1 (fast, reversible): $\ce{NO + NO <=> N2O2}$. Step 2 (slow): $\ce{N2O2 + O2 -> 2NO2}$. The slow step gives $\text{rate} = k_2[\ce{N2O2}][\ce{O2}]$, and $\ce{N2O2}$ is an intermediate.
- **Section "A fast step that goes both ways":** step 1 is fast in both directions and step 2 drains $\ce{N2O2}$ only slowly, so step 1 has time to reach equilibrium: $\ce{N2O2}$ forms and falls apart at the same rate. Write that as an equation: forward rate = reverse rate, $k_1[\ce{NO}]^2 = k_{-1}[\ce{N2O2}]$. Explain the notation once: $k_1$ and $k_{-1}$ are the rate constants of step 1 forward and backward. This is the **pre-equilibrium approximation**. `<KeyIdea>`: a fast reversible step before the slow step is at equilibrium, so its forward and reverse rates are equal. Use that to replace the intermediate.
- **Worked example "Removing the intermediate":** (1) Rate law of the slow step: $\text{rate} = k_2[\ce{N2O2}][\ce{O2}]$. (2) Set the forward and reverse rates of step 1 equal: $k_1[\ce{NO}]^2 = k_{-1}[\ce{N2O2}]$. (3) Solve for the intermediate: $[\ce{N2O2}] = \frac{k_1}{k_{-1}}[\ce{NO}]^2$. (4) Substitute: $\text{rate} = k_2\frac{k_1}{k_{-1}}[\ce{NO}]^2[\ce{O2}]$. (5) The three constants multiply to one constant, $k$: $\text{rate} = k[\ce{NO}]^2[\ce{O2}]$. That is the measured rate law, so the mechanism is consistent.
- **Check 1**, `<Check answer={2}>`: "In the pre-equilibrium approximation, what is assumed about the fast first step?" Options: it has stopped; its forward and reverse rates are equal; it is slower than the second step; it has used up all of its reactants. Why: fast in both directions, it reaches equilibrium, which means the two directions go at the same rate, not that anything has stopped.
- **Section "The recipe":** four numbered steps a student can follow: write the rate law of the slow step; set forward rate = reverse rate for the fast step before it; solve that for the intermediate; substitute and combine the constants.
- **Check 2**, `<Check answer={2}>`: "Step 1 (fast, reversible): $\ce{A + B <=> C}$. Step 2 (slow): $\ce{C + A -> D}$. Step 3 (fast): $\ce{D + B -> E}$. The overall reaction is $\ce{2A + 2B -> E}$. What is the rate law?" Options: $\text{rate} = k[\ce{C}][\ce{A}]$; $\text{rate} = k[\ce{A}]^2[\ce{B}]$; $\text{rate} = k[\ce{A}]^2[\ce{B}]^2$; $\text{rate} = k[\ce{A}][\ce{B}]$. Why: the slow step gives $k_2[\ce{C}][\ce{A}]$. From step 1, $[\ce{C}] = \frac{k_1}{k_{-1}}[\ce{A}][\ce{B}]$. Substituting gives $k[\ce{A}]^2[\ce{B}]$. The first option still contains the intermediate. The third copies the coefficients of the overall equation: the second B enters after the slow step, so it does not count. (The third step is there so that reading the orders off the overall equation gives a wrong answer.)
- **Section "When a product slows the reaction down":** the same recipe can put a product in the rate law. Ozone decomposes by $\ce{2O3(g) -> 3O2(g)}$. Step 1 (fast, reversible): $\ce{O3 <=> O2 + O}$. Step 2 (slow): $\ce{O + O3 -> 2O2}$. Slow step: $\text{rate} = k_2[\ce{O}][\ce{O3}]$. Step 1 at equilibrium: $k_1[\ce{O3}] = k_{-1}[\ce{O2}][\ce{O}]$, so $[\ce{O}] = \frac{k_1[\ce{O3}]}{k_{-1}[\ce{O2}]}$. Substituting: $\text{rate} = k\frac{[\ce{O3}]^2}{[\ce{O2}]}$. Oxygen is in the denominator: the more $\ce{O2}$ there is, the more it pushes step 1 backward and the fewer O atoms are left for the slow step. Present this as the second worked example, "A product in the rate law".
- **Check 3**, `<Check answer={3}>`: "For the ozone mechanism above, what happens to the rate if $[\ce{O2}]$ is doubled while $[\ce{O3}]$ is held the same?" Options: it doubles; it does not change; it halves; it falls to a quarter. Why: the rate is proportional to $1/[\ce{O2}]$, so doubling $[\ce{O2}]$ halves it.
- **Trap:** **Leaving the intermediate in the answer** (a rate law may contain only reactants, products and catalysts of the overall reaction). **Using this when the first step is slow** (then topic 5.8 applies, and no approximation is needed). **Writing the reverse rate of step 1 with the wrong substances** (the reverse rate uses what is on the right-hand side of step 1). **Keeping three constants** (combine them into one $k$).
- **Key points:** when the slow step is not first, its rate law contains an intermediate; a fast reversible step before the slow step is at equilibrium, so forward rate = reverse rate; solve that for the intermediate and substitute; the result contains only measurable substances, and more than one mechanism can lead to the same rate law.
- **Do not include:** the steady-state approximation. The 2024 framework names only pre-equilibrium.

**Steps**

- [ ] **Step 1:** Write `src/content/lessons/unit-5/5-9-pre-equilibrium-approximation.mdx` from the brief. It has no figure. The fractions make long display equations: after building, check on a phone that each one scrolls sideways inside its own box and the page does not.
- [ ] **Step 2:** **Build and test.** Expected: `check-dist: 13 pages, 0 problem(s)`.
- [ ] **Step 3:** **Look at it.**
- [ ] **Step 4:** **Fact-check, independently.** Tell the checker to redo both derivations from the mechanisms alone.
- [ ] **Step 5:** **Commit** (`feat(lessons): add 5.9 Pre-Equilibrium Approximation`).
- [ ] **Step 6: Open pull request 4** (`git push -u origin topic/unit-5-mechanisms`, title `feat(lessons): add 5.7, 5.8 and 5.9`). When the check passes, **stop and ask the teacher to merge.** Then return to an up-to-date `main` and delete the branch.

---

## Group E: multistep profiles and catalysis (pull request 5)

Branch: `topic/unit-5-catalysis`. Tasks 10, 11 and 12.

### Task 10: Lesson 5.10, Multistep Reaction Energy Profile

**Files:**
- Create: `src/content/lessons/unit-5/5-10-multistep-reaction-energy-profile.mdx`
- Create: `public/figures/5-10-two-step-profile.svg`

**Brief**

- **Front matter:** `topic: "5.10"`, `minutes: 8`, summary: "How to read the energy profile of a reaction with more than one step: its transition states, its intermediates and its slowest step."
- **Framework (5.10.A):** knowing the energetics of each elementary step in a mechanism allows the energy profile of a multistep reaction to be constructed.
- **Opening:** topic 5.6 drew one hill for one step. A mechanism has several steps, so its profile has several hills, one after another, like a road over a range of mountains. Everything you learned about one hill still holds for each.
- **Section "One hill per step":** each step has its own transition state (a peak) and ends in a valley. The valleys between the first reactants and the final products are the **intermediates**: real substances, lower in energy than the peaks on either side. A mechanism with $n$ steps has $n$ peaks and $n - 1$ valleys between them, each one an intermediate stage. Place the figure here.
- **Figure** `5-10-two-step-profile.svg`: a two-hill profile. Levels, in kJ/mol with the reactants at 0: first peak at 80, valley at 30, second peak at 55, products at −40. Label the plateaus "reactants" and "products", the valley "intermediate", and the peaks "transition state 1" and "transition state 2". Two vertical double-headed arrows: from the reactants' level to the first peak, labeled "Ea of step 1"; from the valley to the second peak, labeled "Ea of step 2". Axes "reaction progress" and "energy". Draw the first arrow visibly longer than the second. Alt: "Energy profile with two hills. The curve rises from the reactants to a first, taller peak, falls into a valley marked intermediate, rises to a second, lower peak and falls to the products, which are lower than the reactants. Arrows mark the activation energy of step 1, from the reactants to the first peak, and of step 2, from the intermediate to the second peak." Caption: "Two steps, two transition states, one intermediate. Each activation energy is measured from the valley before its hill."
- **Section "Reading each step":** each step's activation energy is measured from where that step starts: the valley before its peak, not the original reactants. The overall energy change is still final products minus first reactants, whatever happens in between. `<KeyIdea>`: peaks are transition states, valleys are intermediates, and each activation energy is the climb out of the valley before it.
- **Worked example "Reading a two-step profile":** use the figure's values: reactants 0, first peak 80, intermediate 30, second peak 55, products −40 kJ/mol. (1) Two peaks, so two steps and one intermediate. (2) $E_a$ of step 1 $= 80 - 0 = 80\ \text{kJ/mol}$. (3) $E_a$ of step 2 $= 55 - 30 = 25\ \text{kJ/mol}$. (4) Overall $\Delta E = -40 - 0 = -40\ \text{kJ/mol}$: exothermic. (5) Step 1 on its own is endothermic ($+30$) and step 2 is exothermic ($-70$); together they give $-40$.
- **Check 1**, `<Check answer={2}>`: "An energy profile has three peaks. How many valleys, each an intermediate stage, lie between the reactants and the products?" Options: one; two; three; four. Why: three peaks mean three steps, and there is one valley between each pair of neighboring peaks: two.
- **Section "Finding the slow step":** the step with the largest activation energy is the hardest to get over, so it is the slowest: the rate-limiting step of topic 5.8. In the worked example that is step 1 (80 against 25 kJ/mol). The profile and the rate law are two views of the same thing: a mechanism whose slow step is first has its biggest climb first.
- **Check 2**, `<Check numeric="85" unit="kJ/mol">`: "On a two-step profile the reactants are at 20 kJ/mol, the first peak at 70, the intermediate at 45, the second peak at 130 and the products at 5. What is the activation energy of step 2?" Why: step 2 starts from the intermediate, so $E_a = 130 - 45 = 85\ \text{kJ/mol}$.
- **Check 3**, `<Check answer={2}>`: "For the profile in the last question, which step is rate limiting?" Options: step 1, because it comes first; step 2, because its activation energy is larger; neither, because the reaction is exothermic; both equally. Why: step 1 needs $70 - 20 = 50\ \text{kJ/mol}$ and step 2 needs 85 kJ/mol. The bigger climb is the slower step.
- **Trap:** **Measuring every $E_a$ from the first reactants** (measure from the valley before each peak). **Calling a valley a transition state** (a valley is an intermediate). **Assuming the first step is the slow one** (compare the climbs). **Thinking more steps change $\Delta E$** (the overall energy change depends only on where you start and finish).
- **Key points:** a profile has one peak per step; valleys between the ends are intermediates; each $E_a$ is measured from the valley before its peak; the step with the largest $E_a$ is rate limiting; $\Delta E$ is final products minus first reactants.
- **Note for the writer and the fact-checker:** both example profiles are built so that the step with the larger activation energy also has the higher peak. Keep it that way. When those two disagree the question of which step limits the rate is beyond this course.

**Steps**

- [ ] **Step 1:** Draw `public/figures/5-10-two-step-profile.svg` with the levels to scale.
- [ ] **Step 2:** Write `src/content/lessons/unit-5/5-10-multistep-reaction-energy-profile.mdx` from the brief.
- [ ] **Step 3:** **Build and test.** Expected: `check-dist: 14 pages, 0 problem(s)`.
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** **Commit** (`feat(lessons): add 5.10 Multistep Reaction Energy Profile`).

### Task 11: Lesson 5.11, Catalysis, with the catalyst diagram

**Files:**
- Create: `src/components/diagrams/CatalystProfile.svelte`, `src/components/lesson/CatalystProfile.astro`
- Modify: `src/pages/[unit]/[topic].astro`
- Create: `src/content/lessons/unit-5/5-11-catalysis.mdx`
- Test: `tests/e2e/diagram-catalyst-profile.spec.ts`

**Brief**

- **Front matter:** `topic: "5.11"`, `minutes: 12`, summary: "How a catalyst speeds a reaction up by opening a route with a lower activation energy, and the three main ways catalysts do it."
- **Framework (5.11.A):** a catalyst raises the rate by increasing the number of effective collisions or by providing a path with a lower activation energy; in a mechanism the net concentration of the catalyst is constant, though it is often consumed in the rate-determining step and regenerated later; some catalysts bind the reactants, orienting them better or lowering the activation energy, with a new intermediate in which catalyst and reactant are bound, as many enzymes do; some involve covalent bonding to the reactant, as in acid–base catalysis, where a reactant or intermediate gains or loses a proton, creating new intermediates and new steps; in surface catalysis a reactant or intermediate binds to a surface, creating new steps involving the bound species.
- **Opening:** a bottle of hydrogen peroxide sits in a cupboard for a year, slowly losing its strength. Drop in a pinch of the right substance and it froths at once. Nothing was heated and nothing was added that ends up in the products. The reaction was given a different route.
- **Section "A different route":** a **catalyst** speeds a reaction up without being used up. It does not push the reactants over the hill; it opens another path with a lower activation energy, so at the same temperature a far larger fraction of collisions can get through (topic 5.5). The reactants and products are the same substances at the same energies, so the overall energy change is unchanged. The reverse reaction uses the same lower path, so it is sped up too.
- **Diagram:** `<CatalystProfile />` here, introduced with "Add a catalyst and compare the two hills." Add one sentence after it: the diagram draws the catalyzed route as a single hill to keep the comparison simple; a real catalyzed route has new steps, so its profile usually has more than one hill, all of them lower than the original. Follow that with a table, Does a catalyst change it?: activation energy, yes, lowers it; rate, yes, raises it; energy of the reactants and products, no; overall energy change, no; amounts present at equilibrium, no (say only "that is a topic for Unit 7").
- `<KeyIdea>`: a catalyst lowers the activation energy by providing a different mechanism. It does not change where the reaction starts or ends.
- **Check 1**, `<Check answer={2}>`: "Which of these does a catalyst change?" Options: the overall energy change of the reaction; the activation energy; the energy of the products; how much product there is in the end. Why: the catalyst opens a path with a lower barrier. The reactants and products, and so the energy difference between them and the final amounts, are the same.
- **Worked example "Both directions get the same help":** without a catalyst a reaction has a forward activation energy of 120 kJ/mol and releases 50 kJ/mol. A catalyst lowers the forward activation energy to 80 kJ/mol. (1) Uncatalyzed reverse activation energy: $120 + 50 = 170\ \text{kJ/mol}$. (2) The catalyzed path has the same reactants and products, so it still releases 50 kJ/mol. (3) Catalyzed reverse activation energy: $80 + 50 = 130\ \text{kJ/mol}$. (4) Both barriers fell by the same 40 kJ/mol: $120 - 80$ and $170 - 130$.
- **Check 2**, `<Check numeric="105" unit="kJ/mol">`: "A catalyst lowers a reaction's forward activation energy from 95 kJ/mol to 60 kJ/mol. Without the catalyst the reverse activation energy is 140 kJ/mol. What is it with the catalyst?" Why: the catalyst lowers the top of the hill by $95 - 60 = 35\ \text{kJ/mol}$ for both directions, so the reverse barrier is $140 - 35 = 105\ \text{kJ/mol}$.
- **Section "Used, then returned":** a catalyst does take part. In the peroxide mechanism of topic 5.7, $\ce{I-}$ is used in the first, slow step and made again in the second, so the amount of it at the end is the amount at the start. Because it is used in the slow step, its concentration can appear in the rate law: here $\text{rate} = k[\ce{H2O2}][\ce{I-}]$.
- **Section "Three ways catalysts work":** three short subsections under `###` headings. **Binding the reactants (enzymes):** an enzyme is a protein with a pocket, the active site, shaped to hold its reactant. Held there, the reactant is oriented correctly and strained toward the transition state. The enzyme with its reactant bound is a new intermediate. **Acid–base catalysis:** an acid gives a proton to a reactant, or a base takes one away. The proton forms a covalent bond to the reactant, making a new intermediate that reacts more easily; the proton is handed back in a later step. **Surface catalysis:** reactant molecules bind to the surface of a solid, usually a metal, which weakens their bonds and holds them close together; the products then leave the surface. Example: hydrogen and ethene on platinum giving ethane, and the catalytic converter of a car. In each case the catalyst creates new intermediates and new elementary steps, which is to say a new mechanism.
- **Check 3**, `<Check answer={3}>`: "Hydrogen and ethene react quickly on a piece of platinum, where both gases first stick to the metal. What kind of catalysis is this?" Options: enzyme catalysis; acid–base catalysis; surface catalysis; it is not catalysis, because platinum is a solid. Why: the reactants bind to the surface of a solid, react there and leave. The platinum is not used up.
- **Trap:** **"A catalyst adds energy"** (it lowers the barrier; it supplies nothing). **"A catalyst is not involved"** (it is used in one step and made again in another). **"A catalyst gives more product"** (it gets to the same end faster). **"A catalyst only helps the forward reaction"** (it lowers the barrier for both directions equally). **Mixing up catalyst and intermediate** (topic 5.7: used then made, against made then used).
- **Key points:** a catalyst provides a mechanism with a lower activation energy; it is used in one step and regenerated in a later one, so it is not consumed; it changes neither the energies of reactants and products nor the overall energy change; it speeds the forward and reverse reactions alike; enzymes, acid–base catalysts and surfaces each work by creating new intermediates.

**Steps**

- [ ] **Step 1: Write the failing browser test**

`tests/e2e/diagram-catalyst-profile.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-11-catalysis/';
const NAME = 'catalyst-profile';
const START = 'Without a catalyst the activation energy is 120 kJ/mol. The reaction releases 50 kJ/mol.';

/** Where a profile starts and ends, read from its path: "M34 150H90 ... 240 195H306". */
function endsOf(path: string | null) {
  const match = /^M([\d.]+) ([\d.]+)H.* ([\d.]+)H([\d.]+)$/.exec(path ?? '');
  if (!match) throw new Error(`Not an energy profile path: ${path}`);
  return { startX: match[1], startY: match[2], endY: match[3], endX: match[4] };
}

test('the profile starts with no catalyst', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(diagram.locator('[data-curve="catalyzed"]')).toHaveCount(0);
  await expect(diagram.getByRole('slider')).toBeDisabled();
});

test('adding a catalyst from the keyboard draws a lower hill between the same two ends', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('checkbox', { name: 'Add a catalyst' }).focus();
  await page.keyboard.press('Space');

  await expect(diagram.getByRole('status')).toHaveText(
    'With the catalyst the activation energy is 80 kJ/mol instead of 120 kJ/mol. The reaction still releases 50 kJ/mol.',
  );
  const plain = endsOf(await diagram.locator('.diagram-curve').first().getAttribute('d'));
  const catalyzed = endsOf(await diagram.locator('[data-curve="catalyzed"]').getAttribute('d'));
  expect(catalyzed).toEqual(plain);
});

test('the catalyzed activation energy can be changed from the keyboard', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await diagram.getByRole('checkbox', { name: 'Add a catalyst' }).check();

  await diagram.getByRole('slider').focus();
  await page.keyboard.press('ArrowLeft');

  await expect(diagram.getByRole('status')).toContainText('the activation energy is 70 kJ/mol instead of 120 kJ/mol');
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the profile shows the uncatalyzed reaction and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
```

- [ ] **Step 2: Write the diagram and its block**

`src/components/diagrams/CatalystProfile.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  // Energies in kJ/mol, measured from the reactants.
  const UNCATALYZED_EA = 120;
  const ENERGY_RELEASED = 50;
  const REACTANTS_Y = 150;
  const Y_PER_KJ = 0.9;

  let catalyzed = $state(false);
  let catalyzedEa = $state(80);
  let hydrated = $state(false);

  const yFor = (energy: number) => REACTANTS_Y - energy * Y_PER_KJ;
  const productsY = yFor(-ENERGY_RELEASED);

  /** Reactants on a flat stretch, one smooth hill of the given height, products on a flat stretch. */
  function profile(activationEnergy: number): string {
    const peakY = yFor(activationEnergy);
    return `M34 ${REACTANTS_Y}H90C128 ${REACTANTS_Y} 132 ${peakY} 165 ${peakY}S202 ${productsY} 240 ${productsY}H306`;
  }

  const readout = $derived(
    catalyzed
      ? `With the catalyst the activation energy is ${catalyzedEa} kJ/mol instead of ${UNCATALYZED_EA} kJ/mol. The reaction still releases ${ENERGY_RELEASED} kJ/mol.`
      : `Without a catalyst the activation energy is ${UNCATALYZED_EA} kJ/mol. The reaction releases ${ENERGY_RELEASED} kJ/mol.`,
  );

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="catalyst-profile" data-hydrated={hydrated ? 'true' : undefined}>
  <svg
    viewBox="0 0 320 225"
    role="img"
    aria-label={`Energy profile. ${readout} The reactants and the products sit at the same energies with or without the catalyst.`}
  >
    <path class="diagram-axis" d="M24 14V208H312" />
    <text class="diagram-label" x="30" y="20">energy</text>
    <text class="diagram-label" x="312" y="221" text-anchor="end">reaction progress</text>
    <path class="diagram-curve" d={profile(UNCATALYZED_EA)} />
    {#if catalyzed}
      <path class="diagram-curve is-dashed" data-curve="catalyzed" d={profile(catalyzedEa)} />
    {/if}
    <text class="diagram-label" x="36" y={REACTANTS_Y - 8}>reactants</text>
    <text class="diagram-label" x="306" y={productsY - 8} text-anchor="end">products</text>
  </svg>
  <p class="diagram-readout" role="status">{readout}</p>
  <div class="diagram-controls">
    <label class="diagram-toggle">
      <input type="checkbox" bind:checked={catalyzed} />Add a catalyst
    </label>
    <label class="diagram-slider">
      <span>Activation energy with the catalyst: {catalyzedEa} kJ/mol</span>
      <input type="range" min="40" max="100" step="10" bind:value={catalyzedEa} disabled={!catalyzed} />
    </label>
  </div>
</div>
```

`src/components/lesson/CatalystProfile.astro`:

```astro
---
import Profile from '../diagrams/CatalystProfile.svelte';
import Diagram from './Diagram.astro';
---

<Diagram caption="A catalyst lowers the hill. It does not move the reactants or the products.">
  <Profile client:visible />
</Diagram>
```

In `src/pages/[unit]/[topic].astro`, add the import as the first lesson-block import and the name to `blocks`:

```astro
import CatalystProfile from '../../components/lesson/CatalystProfile.astro';
import Check from '../../components/lesson/Check.astro';
```

```astro
const blocks = {
  CatalystProfile,
  Check,
  ConcentrationPlots,
  Figure,
  KeyIdea,
  KeyPoints,
  PracticeNext,
  RateLawExplorer,
  Trap,
  Worked,
};
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npx playwright test diagram-catalyst-profile`
Expected: every test fails, because the page `/unit-5-kinetics/5-11-catalysis/` does not exist yet.

- [ ] **Step 4:** Write `src/content/lessons/unit-5/5-11-catalysis.mdx` from the brief. The diagram's starting numbers (120, 80 and 50 kJ/mol) are the worked example's numbers on purpose.
- [ ] **Step 5:** **Build and test.** Expected: the 8 diagram tests (four in two projects) pass, and `check-dist: 15 pages, 0 problem(s)`.
- [ ] **Step 6:** **Look at it.** Add the catalyst in the diagram and confirm the dashed curve starts and ends exactly on the solid one.
- [ ] **Step 7:** **Fact-check, independently.**
- [ ] **Step 8:** **Commit** (`feat(lessons): add 5.11 Catalysis`, one commit including the diagram, its block, its test and the `[topic].astro` change).

### Task 12: Close out Unit 5

**Files:**
- Modify: `CLAUDE.md` (local, untracked)

- [ ] **Step 1: Confirm the unit is complete**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study" && ls src/content/lessons/unit-5 && npm test && npm run test:e2e
```

Expected: eleven `.mdx` files, 5-1 through 5-11. All tests pass. `check-dist: 15 pages, 0 problem(s)`. `all-lessons.spec.ts` visits all eleven lessons and finds each by its title in search.

- [ ] **Step 2: Read the home and unit pages**

Build, preview, and look at `/` and `/unit-5-kinetics/`. Expected: the Unit 5 row reads "11 lessons"; the hero note reads "11 of 91 lessons are ready so far."; every topic on the unit page is a link with its reading time; previous and next links at the foot of each lesson run 5.1 through 5.11 in order.

- [ ] **Step 3: Check the plan against the design**

Spec section 11, "Stage 1 is done when": items 2 and 3 (all eleven lessons, seven parts each, fact-checked) and 4 (three diagrams by mouse, touch and keyboard) are now met except for Unit 5 practice, which is Plan 3. Touch is not covered by an automated test: try each diagram once on a phone, or in the browser's device mode with touch on.

- [ ] **Step 4: Open pull request 5** (`git push -u origin topic/unit-5-catalysis`, title `feat(lessons): add 5.10 and 5.11, completing Unit 5`). When the check passes, **stop and ask the teacher to merge.**

- [ ] **Step 5: After the merge**

Return to an up-to-date `main` and delete the branch. Update "Where things stand" in the local `CLAUDE.md`: Plan 2 finished, with the date; Plan 3 (Unit 5 practice) is next and is not written.

---

## What this plan delivers against the spec

| Stage 1 "done when" item | Where |
|---|---|
| 2. All eleven Unit 5 lessons | Tasks 2–11 (5.2 from Plan 1) |
| 2. Unit 5 practice | **Not here.** Plan 3. |
| 3. Every lesson has all seven parts and passed fact-check | Enforced by `check-dist` and `all-lessons.spec.ts`; fact-check is a step of every lesson task |
| 4. Three interactive diagrams, by mouse, touch and keyboard | Tasks 1, 3 and 11; keyboard and no-JavaScript tested; touch tried by hand in Task 12 |
| 5. Search finds Unit 5 lessons | `all-lessons.spec.ts`, second test |
| Spec section 7: each diagram "works by keyboard and has a text description" | Native range, radio and checkbox inputs; every diagram has a readout that states its state in words, an `aria-label` on its drawing, and a caption |
| Spec section 6: excluded content labeled as beyond the exam | Task 6 (Arrhenius). Tasks 3 and 9 leave out what the framework does not name. |
