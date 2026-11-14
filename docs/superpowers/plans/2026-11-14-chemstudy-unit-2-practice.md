# ChemStudy Unit 2 Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the teacher's Unit 2 practice on chem-study.com: four worksheets, the eleven skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric, and every "draw" answer with a drawn Lewis structure.

**Architecture:** The practice pages built in Plan 3 for Unit 5 take the new documents as they are: six MDX files in `src/content/practice/unit-2/`, converted by hand from the LaTeX in `D:\AP_Chem_Prep` and checked by `scripts/practice-audit.mjs`. The practice route gains the lessons' `Lewis` and `Resonance` blocks, and the practice browser tests learn to cover every unit.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-14-chemstudy-unit-2-practice-design.md`.

**Builds on:** Plan 3, `docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`. Its sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise. Read both before starting.

## Facts verified before writing (do not rediscover)

1. **The sources** (read-only), in `D:\AP_Chem_Prep\Units\unit02-compound-structure\`: `worksheets\u02-ws1.tex` to `u02-ws4.tex`, `u02-selfstudy.tex`, `u02-frq.tex`. **The key PDFs:** `D:\AP_Chem_Prep\build\Units\unit02-compound-structure\worksheets\u02-ws1-key-print.pdf` to `u02-ws4-key-print.pdf`, `...\unit02-compound-structure\u02-selfstudy-key-print.pdf` and `u02-frq-key-print.pdf`.
2. **Every worksheet ends with a `spiralstrip`**, the "Quick review" the teacher left out of every practice document. Unit 2 has no comprehensive test in the old course.
3. **The practice route** (`src/pages/[unit]/practice/[name].astro`) supplies `Answer`, `Blank`, `Part`, `Question`, `Rubric`, `RubricLine` and `Worked`. Not `Lewis` or `Resonance`: an MDX file that uses them fails the build until Task 1 adds them. `src/styles/lewis.css` is already loaded on every page by `Base.astro`.
4. **The audit reads a component tag as its `points` and `topic` only** (`siteFacts` in `scripts/practice-audit.mjs` replaces each `<Capitalized ...>` tag with those two). A multi-line `<Lewis ... />` should therefore add no numbers; Task 1 proves it with a test, since a `>` inside an attribute would break that.
5. **`tests/e2e/practice.spec.ts` is tied to Unit 5** (`UNIT` and `PRACTICE_FILES` at the top). `tests/e2e/all-lessons.spec.ts` shows how to loop over unit folders instead.
6. **Unit 5's Worksheet 4 already ends with a scored free-response question** (`points={10}` and a `<Rubric>`), so Unit 2's Worksheet 4 follows it.
7. **Lattice energy is taught in lesson 2.2**, which matches the old ladder's 2.2 tag.
8. **The framework text** is in the session scratch folder (`<scratch>/ced/`), or made again with `pdftotext -layout D:\AP_Chem_Prep\Reference\ap-chemistry-course-and-exam-description.pdf <scratch>/ced/ced.txt`. Never copy it, or its wording, into the repository.

## Conventions for every task

Plan 3's "Conventions for every task" apply: the capital-`C:` working directory, the scratch folder for everything that is not the site, `D:\AP_Chem_Prep` read-only, Write and Edit for files (never heredocs, `sed` or `node -e`), conventional commits with **no AI-attribution trailer**, US spelling, tests first, no swallowed errors, no preview server running during `npm run test:e2e`, and **never merging a pull request: a merge deploys**.

Models, as settled on 2026-11-13: writers on the strongest model; fact-checks on Opus (`model: "opus"`); fixers on Sonnet; the named reviewers on their own models.

## What Unit 2 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Drawn structures.** Where a question asks the student to draw a Lewis structure, the `<Answer>` keeps the source's words, then shows the structure with the `<Lewis>` block (or several in a `<Resonance>` group). This is the one thing a writer adds. Write the block as the Unit 2 lessons plan says (`docs/superpowers/plans/2026-11-13-chemstudy-unit-2-lessons.md`, "Rules for writing a lesson", the paragraph "Lewis diagrams"), and copy the layout of a matching drawing in the lessons where one exists (`grep -n "<Lewis" src/content/lessons/unit-2/*.mdx`):

- atoms on a grid, neighbors 90° apart, `y` growing downward;
- `lonePairs` as a count, or a list of sides when the automatic choice looks wrong;
- `ion={-1}` for brackets and charge, `formalCharges` to show the charges the block computes;
- `alt` describing atoms, bonds, lone pairs and charges in words.

The build checks the electron count. A failure is a chemistry error: recount, and report it.

**The questions that get drawings:**

| Document | Where | Drawing |
|---|---|---|
| Worksheet 2 | question 1, parts a to d | $\ce{OF2}$; $\ce{C2H4}$; $\ce{NO2-}$ as two resonance structures; $\ce{XeF2}$ |
| Worksheet 2 | question 4, part a | $\ce{O3}$, two resonance structures (lesson 2.6 has them) |
| Worksheet 4 | parts b and c | $\ce{NO2+}$; $\ce{NO2-}$, two resonance structures |
| Free-response set | question 1, part a | $\ce{SCN-}$ as $\ce{[S=C=N]-}$ |
| Skill ladders | Ladder 6, the worked example | $\ce{CO2}$; $\ce{CO3^2-}$ (one structure, as the text describes) |

Formal charges are shown (`formalCharges`) where the question or its neighbors are about formal charge: Worksheet 2 question 4, Worksheet 4, free-response question 1. Elsewhere, leave them off.

**Terms.** The answers use the lessons' words. Formal charge is "valence electrons − nonbonding electrons − ½ (bonding electrons)", as lesson 2.6 writes it. A bond between identical atoms is "nonpolar covalent".

> **As carried out.** That sentence misquotes lesson 2.6, which writes "valence electrons − nonbonding electrons − bonds" and calls half the bonding electrons the same thing. The ladders keep the source's ½ form with the lesson's "nonbonding electrons"; the free-response set, after its fact-check, uses the lesson's form, which is also the Lewis block's.

**Wording to recast.** "grader answer" (Worksheet 3, question 2) becomes the three-part answer that lesson 2.7 teaches. "The diagram police" (Worksheet 2, question 5) becomes plain: "Each structure below has one error. Find it." British spellings in the ladders and the free-response set: centre, neighbour, favourable, hybridisation.

**Left out, as in Unit 5:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`); notes to the teacher inside a rubric line (free-response questions 3 and 5 each end with one).

## File structure

```
src/pages/[unit]/practice/[name].astro   gains Lewis and Resonance in its block list
src/content/practice/unit-2/             six .mdx files
tests/e2e/practice.spec.ts               loops over every unit with practice; Unit 2 tests added
tests/unit/practice-audit.test.ts        a Lewis block adds no numbers or formulas
```

## The six documents

| Order | File in `src/content/practice/unit-2/` | Title | Kind | Topics | Source |
|---|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | 2.1 to 2.7 | `u02-selfstudy.tex` |
| 2 | `worksheet-1-bonds-wells-and-lattices.mdx` | Worksheet 1: Bonds, wells and lattices | `worksheet` | 2.1 to 2.4 | `worksheets/u02-ws1.tex` |
| 3 | `worksheet-2-lewis-formal-charge-and-resonance.mdx` | Worksheet 2: Lewis diagrams, formal charge and resonance | `worksheet` | 2.5, 2.6 | `worksheets/u02-ws2.tex` |
| 4 | `worksheet-3-shapes-angles-and-polarity.mdx` | Worksheet 3: Shapes, angles and polarity | `worksheet` | 2.7 | `worksheets/u02-ws3.tex` |
| 5 | `worksheet-4-a-long-free-response-question.mdx` | Worksheet 4: A long free-response question | `worksheet` | 2.5 to 2.7 | `worksheets/u02-ws4.tex` |
| 6 | `free-response-set.mdx` | Free-response set | `free-response` | 2.1 to 2.7 | `u02-frq.tex` |

---

## Group A: design and plan (pull request A)

Branch `topic/unit-2-practice-design`. This plan and the design, committed and opened as a pull request. Then Group B starts on a branch stacked on it, as the Unit 2 lessons did: every branch targets `main`, because the check runs only on pull requests into `main`.

---

## Group B: Lewis in practice, and Worksheets 1 to 4 (pull request B)

Branch `topic/unit-2-practice-worksheets`, from `topic/unit-2-practice-design`.

### Task 1: The practice pages take Unit 2

> **As carried out (2026-11-14).** The audit test passed at once, so it was given a `>` in the drawing's description and seen to fail; the audit now removes each `<Lewis ... />` block whole (ending at a `/>` on its own line) instead of relying on descriptions never holding `>`. The build failed on Worksheet 2 with "Expected component `Lewis` to be defined" before the route gained the blocks, as Step 4 expected. The Worksheet 1 fact-check found the site disagreeing with itself on Cl–Cl (242 in lesson 2.2 and the diagram, 243 in the practice), so `src/lib/bonding.ts`, the lesson table and their two tests moved to 243, test first.

**Files:**
- Modify: `tests/unit/practice-audit.test.ts`
- Modify: `tests/e2e/practice.spec.ts`
- Modify: `src/pages/[unit]/practice/[name].astro`

- [ ] **Step 1: Write the audit test**

Add to `tests/unit/practice-audit.test.ts`, beside the existing `siteFacts` tests (it uses the file's `mdx()` helper, which adds frontmatter):

```ts
it('reads no numbers or formulas from a Lewis drawing', () => {
  const body = [
    '<Question number={1} topic="2.5">',
    '',
    'Draw water.',
    '',
    '<Answer>',
    '',
    'Two lone pairs on O.',
    '',
    '<Lewis',
    '  alt="Lewis diagram of water: oxygen in the middle with 2 lone pairs, formal charge 0 on every atom."',
    '  atoms={[',
    "    { id: 'O', symbol: 'O', x: 0, y: 0, lonePairs: 2 },",
    "    { id: 'H1', symbol: 'H', x: -1, y: 0 },",
    "    { id: 'H2', symbol: 'H', x: 1, y: 0 },",
    '  ]}',
    "  bonds={[['O', 'H1', 1], ['O', 'H2', 1]]}",
    '/>',
    '',
    '</Answer>',
    '',
    '</Question>',
  ].join('\n');

  const [, question] = siteFacts(mdx(body));

  expect(question?.numbers).toEqual(['2.5']);
  expect(question?.formulas).toEqual([]);
});
```

- [ ] **Step 2: Run it**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/practice-audit.test.ts
```

Expected: PASS, if Fact 4 holds. **If it passes at once, prove it can fail:** change the test's `alt` to contain `>` (for example `"... 2 > 1 ..."`), run it, watch it fail, and decide whether the audit should handle that case. The simplest rule is the one the Lewis block already follows: `alt` never contains `<` or `>`. Make `siteFacts` throw a clear error on a `<Lewis` tag it cannot close, test that error, and restore the test's `alt`. If the test fails as first written, make `siteFacts` remove `<Lewis ... />` tags whole before the numbers are read, and run it again.

- [ ] **Step 3: Make the practice browser tests cover every unit**

In `tests/e2e/practice.spec.ts`, replace the top (the `UNIT`, `PRACTICE_FILES` and `paths` constants) with a loop over `src/content/practice/<unit-N>/` folders, built like `lessonUnits` in `tests/e2e/all-lessons.spec.ts`:

```ts
import { units } from '../../src/data/units';

const PRACTICE_FILES = new URL('../../src/content/practice/', import.meta.url);
const practiceUnits = fs
  .readdirSync(PRACTICE_FILES, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((folder) => {
    const unit = units.find((u) => folder.name === `unit-${u.number}`);
    if (!unit) {
      throw new Error(`The practice folder ${folder.name} is not named unit-<number> after a unit in src/data/units.ts.`);
    }
    const unitPage = `/${unit.slug}/`;
    const unitPaths = fs
      .readdirSync(new URL(`${folder.name}/`, PRACTICE_FILES))
      .filter((name) => name.endsWith('.mdx'))
      .map((name) => `${unitPage}practice/${name.replace(/\.mdx$/, '')}/`)
      .sort();
    return { unit, unitPage, unitPaths };
  });
const paths = practiceUnits.flatMap(({ unitPaths }) => unitPaths);
const UNIT = '/unit-5-kinetics/';
const WORKSHEET_1 = `${UNIT}practice/worksheet-1-rates-and-rate-laws/`;
```

Then:
- "the unit page links to every practice document that has a file, and to no other" runs once per entry of `practiceUnits`, named `the Unit ${unit.number} page links to every practice document that has a file, and to no other`.
- "search finds every practice document by its title" runs once per entry, named `search finds every Unit ${unit.number} practice document by its title`.
- The three `for (const path of paths)` loops stay as they are; `paths` now holds every unit's documents.
- The tests that name Worksheet 1 or lesson 5.1 stay on Unit 5.

Add two Unit 2 tests at the end:

```ts
const WORKSHEET_2_UNIT_2 = '/unit-2-compound-structure/practice/worksheet-2-lewis-formal-charge-and-resonance/';

test('an answer to a "draw" question shows the drawn structure', async ({ page }) => {
  await page.goto(WORKSHEET_2_UNIT_2);
  const first = page.locator('[data-part="answer"]').first();

  await first.locator('summary').click();

  await expect(first.locator('.lewis svg[role="img"]').first()).toBeVisible();
});

test('a Unit 2 lesson ends with a link to the practice for its topic', async ({ page }) => {
  await page.goto('/unit-2-compound-structure/2-5-lewis-diagrams/');

  await page
    .locator('[data-part="practice-next"]')
    .getByRole('link', { name: 'Worksheet 2: Lewis diagrams, formal charge and resonance' })
    .click();

  await expect(page).toHaveURL(new RegExp(`${WORKSHEET_2_UNIT_2}$`));
});
```

The first answer on Worksheet 2 is question 1(a)'s, which shows $\ce{OF2}$ drawn. Check that against the converted file; if the first answer changes, point the test at the right one.

- [ ] **Step 4: Watch the new tests fail**

They need Worksheet 2 (Task 2) and the blocks. Run them after Task 2's writers have written the four files, **before** Step 5:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npm run build
```

Expected: the build fails on Worksheet 2, naming `Lewis` as a component that was not provided. That is the RED for Step 5. (If the writers' files are not ready, write Worksheet 2's question 1(a) alone first and run the build on that.)

- [ ] **Step 5: Give practice pages the Lewis blocks**

In `src/pages/[unit]/practice/[name].astro`, import the two lesson blocks and add them to the list, and update the comment:

```astro
import Lewis from '../../../components/lesson/Lewis.astro';
import Resonance from '../../../components/lesson/Resonance.astro';
```

```astro
// Supplied to every practice document, so the files need no imports. Worked,
// Lewis and Resonance are the lessons' blocks: the skill ladders use Worked,
// and Unit 2's answers draw Lewis structures.
const blocks = { Answer, Blank, Lewis, Part, Question, Resonance, Rubric, RubricLine, Worked };
```

- [ ] **Step 6: Build and run the tests** as "How every conversion task ends" says. The two new tests, and every Unit 2 document's own tests, pass.

- [ ] **Step 7: Commit** (the files from Task 2 are committed in Task 3)

```bash
git add "src/pages/[unit]/practice/[name].astro" tests/e2e/practice.spec.ts tests/unit/practice-audit.test.ts
git commit -m "feat(practice): draw Lewis structures in practice answers"
```

### Task 2: Convert Worksheets 1 to 4

One writer per worksheet, in parallel, writing files only. Each gets: Plan 3's conversion guide; this plan's "What Unit 2 adds to the conversion guide"; its source `.tex`; a finished Unit 5 worksheet as the model (`src/content/practice/unit-5/worksheet-1-rates-and-rate-laws.mdx`, and for Worksheet 4 also `worksheet-4-pre-equilibrium-and-catalysis.mdx`, question 6, for the rubric).

**Worksheet 1** (`u02-ws1.tex`):

```yaml
---
title: "Worksheet 1: Bonds, wells and lattices"
kind: worksheet
order: 2
topics: ["2.1", "2.2", "2.3", "2.4"]
summary: Six questions on classifying bonds, reading a potential-energy curve, ranking lattice energies and explaining alloys.
---
```

Six questions, topics 2.1, 2.1, 2.2, 2.3, 2.3, 2.4. The header's advice (every ranking needs its reason) becomes the introduction. Question 3(c) asks for a sketch: its answer is the source's description in words.

**Worksheet 2** (`u02-ws2.tex`):

```yaml
---
title: "Worksheet 2: Lewis diagrams, formal charge and resonance"
kind: worksheet
order: 3
topics: ["2.5", "2.6"]
summary: Five questions on counting electrons, drawing Lewis diagrams, computing formal charges and explaining resonance.
---
```

Five questions, topics 2.5, 2.6, 2.6, 2.6, 2.5. The header (write the electron count down first) becomes the introduction. Drawings as the table above says. Question 3's opening sentence is garbled in the source ("with the lone pair on C or on N shifted variants"); recast it plainly without changing what it claims, and report it.

**Worksheet 3** (`u02-ws3.tex`):

```yaml
---
title: "Worksheet 3: Shapes, angles and polarity"
kind: worksheet
order: 4
topics: ["2.7"]
summary: Five questions on the full chain from Lewis diagram to electron domains, shape, bond angle, hybridization and polarity.
---
```

Five questions, all 2.7. The header (show the domain count; name the lone-pair effect) becomes the introduction. In question 1 each part has several blanks: one `<Answer>` per part, each blank's answer named ("Domains: 4. Shape: tetrahedral. …").

**Worksheet 4** (`u02-ws4.tex`):

```yaml
---
title: "Worksheet 4: A long free-response question"
kind: worksheet
order: 5
topics: ["2.5", "2.6", "2.7"]
summary: One 10-point free-response question on two nitrogen oxide ions, in the exam's long format, with its scoring rubric.
---
```

One question: `<Question number={1} title="Two nitrogen oxide ions" topic="2.5, 2.6, 2.7" points={10}>`, parts a to f. The header (write everything first; score like a reader) becomes the introduction, without "the unit exam" (that exam is closed). The boxed rubric note becomes a `<Rubric>` with six `<RubricLine>`s, parts a to f, points 1, 2, 2, 2, 1, 2.

### Task 3: Finish Group B

- [ ] **Steps 4 to 7 of Task 1**, now that the files exist.

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 2's paths: audit each worksheet (`node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit02-compound-structure/worksheets/u02-wsN.tex" src/content/practice/unit-2/<name>.mdx "<scratch>/unit2-practice/expected/<name>.json"`); look at each page at 412, 390, 360 and 320 px with every answer open, and in both themes; one Opus fact-check per worksheet; decide each finding; one fixer per worksheet; build, test and audit again.

The fact-check brief adds to Plan 3's:

- **Every drawing:** count the electrons, place every lone pair, check each formal charge the block shows, the brackets and the charge, and that `alt` says the same as the picture.
- **The lessons are the reference** for numbers and terms (`src/content/lessons/unit-2/`). Where a worksheet quotes a value the lessons also quote, they must agree.
- **Points to look at** (noticed while this plan was written; the checker decides): Worksheet 2 question 3 (the cyanide argument, and the recast first sentence); Worksheet 3 question 1(b) ($\ce{H2S}$, "less than 109.5°", while the real angle is near 92°); Worksheet 4 part d ($\ce{NO2-}$ "about 115°").

Differences the audit is expected to print:

| Document | Line | Reason |
|---|---|---|
| Every worksheet | numbers and formulas only in the source, in the last question's segment | The Quick review is left out |
| Worksheet 4 | `rubric lines`: 0 in the source, 6 on the site | The source's rubric is a boxed note; the site uses `RubricLine` |
| Worksheet 4 | the rubric's numbers, if the audit counts them differently | The same |

- [ ] **Code review.** `typescript-reviewer` on the changes to the test files and the route.

- [ ] **Commit, push, open the pull request, stop.**

```bash
git add src/content/practice/unit-2
git commit -m "feat(practice): add Unit 2 worksheets 1 to 4"
git push -u origin topic/unit-2-practice-worksheets
gh pr create --base main --title "feat(practice): Unit 2 worksheets 1 to 4, with drawn Lewis structures" --body-file "<scratch>/unit2-practice/pr-b-body.md"
```

The body gives what Plan 3's does (each document's questions and points, each audit's last line and expected differences, the fact-check's findings and what was done, corrections to the originals, test and build output), and the merge order: A, then this one.

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-2-practice-ladders-frq`, from `topic/unit-2-practice-worksheets`. The two drafts may be written in the scratch folder while Group B is checked, then copied in.

### Task 4: Convert the skill ladders and the free-response set

> **As carried out (2026-11-14).** Both drafts were written in the scratch folder alongside the worksheets and fact-checked there. The ladders' check found three errors in the original (11(b)'s CH₃Cl, and MgO's and CaO's ions called "smaller"), and the ladders moved to lesson 2.1's electronegativities and lesson 2.2's F–F (159). Question 5(c), which compared interstitial and substitutional alloys (nothing in the lessons or the framework does), now asks why carbon hardens iron; 4(d) asks about "a substance", since HCl is not a solid. The free-response 1(b) formula scrolled inside its box at every phone width; "formal charge" went onto its own line.

**Skill ladders** (`u02-selfstudy.tex`):

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"]
summary: Eleven skills, one at a time. Each has a worked example, then four questions of the same kind to try on your own. Start here, before the worksheets.
---
```

- The introduction comes from "How to use these notes": how a ladder works; the habit that decides the unit (count the electrons, then reason about the attraction with Coulomb's law); why "wants a full octet" earns nothing; the scope note (more than four domains: shape only, no hybridization label).
- Eleven sections, `## Ladder 1: Bond type from electronegativity` to `## Ladder 11: Molecular polarity`, titles as in the source with "sigma/pi" written "sigma and pi". Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder: 2.1; 2.2; 2.2; 2.3; 2.4; 2.5; 2.6; 2.6; 2.7; 2.7; "2.1, 2.7".
- Ladder 6's worked example gets its two drawings. Ladder 7's formula uses lesson 2.6's terms.
- **Leave out** "Where you stand"; keep its note as `## If you missed some`, with "11 of 11", "8 to 10", "7 or fewer" and the three root causes numbered (1), (2), (3).

**Free-response set** (`u02-frq.tex`):

```yaml
---
title: "Free-response set"
kind: free-response
order: 6
topics: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"]
summary: Five free-response questions on all of Unit 2, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

- The introduction comes from the scope note and the section heading, keeping: topics 2.1 through 2.7; Unit 2 is 7% to 9% of the exam; the exclusions (specific crystal structures in 2.3; hybridization involving d orbitals, and molecular orbital theory, in 2.7), so nothing here asks for them; explanations must reach Coulomb's law, and "it wants a full octet" earns nothing; 5 questions, 32 points, about 50 minutes, calculator allowed.

| Number | `title` | `topic` | `points` | Rubric lines |
|---|---|---|---|---|
| 1 | Lewis structure, formal charge and shape | 2.5, 2.6, 2.7 | 10 | 3, 3, 2, 2 |
| 2 | The bonding continuum and potential energy | 2.1, 2.2 | 10 | 3, 3, 2, 2 |
| 3 | Ionic solids | 2.3 | 4 | 4 |
| 4 | Metals and alloys | 2.4 | 4 | 2, 2 |
| 5 | Hybridization and bond counting | 2.7 | 4 | 2, 2 |

- Question 1's source title adds "and polarity", but no part asks about polarity; the site's title leaves it out.
- Questions 3 and 5 end their last rubric line with a note to the teacher about the framework's exclusions. Leave those sentences out.
- Question 2(a)'s "pure covalent" becomes "nonpolar covalent".

Points to look at in the fact-check: the lattice energies and radii in Ladder 2 and the bond energies in Ladder 3, against lesson 2.2 and 2.3's values; free-response question 1(c), the argument for $\ce{[S=C=N]-}$ over $\ce{[S-C#N]-}$; Ladder 10's opening sentence on hybrid orbitals (the framework excludes deriving them).

- [ ] **Finish as Task 3 does**, with these expected differences:

| Document | Line | Reason |
|---|---|---|
| Free-response set | `question 3` and `question 5`: the numbers `2.3`, `2.7` only in the source | The notes to the teacher, left out |
| Skill ladders | in the last section: `1` to `11` and other numbers of the tick table, only in the source; perhaps a wording line | "Where you stand" is left out |

With all six documents in place, check by hand: each Unit 2 lesson's "Practice next" lists the ladders, its worksheets and the free-response set; the unit page lists the six in the order of the table "The six documents".

- [ ] **Commit**

```bash
git add src/content/practice/unit-2
git commit -m "feat(practice): add the Unit 2 skill ladders and free-response set"
```

### Task 5: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Update the local `CLAUDE.md` (not committed).
- [ ] Commit (`docs: record how the Unit 2 practice was built`), push, open pull request C with the merge order A, B, C, and stop for the teacher.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The six documents | 2, 4 |
| 2. What is left out | Guide additions; 2, 4 |
| 3. Conversion, audit, fact-check, corrections, the lessons' terms, Beyond the exam | 3, 4 |
| 4. Drawn Lewis structures | 1, 2, 3, 4 |
| 5. Code | 1 |
| 6. Pull requests | A, 3, 5 |
| 7. Done when | 3, 4, 5 |
