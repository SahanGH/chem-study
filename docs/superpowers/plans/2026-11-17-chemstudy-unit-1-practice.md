# ChemStudy Unit 1 Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the teacher's Unit 1 practice on chem-study.com: four worksheets, the ten skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: six MDX files in `src/content/practice/unit-1/`, converted by hand from the LaTeX in `D:\AP_Chem_Prep` and checked by `scripts/practice-audit.mjs`. One code change: practice pages gain the lessons' `Figure` block, for two drawn spectra.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-17-chemstudy-unit-1-practice-design.md`.

**Builds on:** Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`) and Plan 12 (`docs/superpowers/plans/2026-11-15-chemstudy-unit-3-practice.md`). Plan 3's sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise. Plan 12's "As carried out" notes record what the Unit 3 fact-checks kept finding; read them.

## Facts verified before writing (do not rediscover)

Established on 2026-11-17. The research behind them is in the session scratch folder: `scratchpad/unit1-practice/research.md` (nine sections, with file and line for each fact), `recompute.py` and its output, and the earlier inventory `scratchpad/unit1/practice-inventory.md`.

1. **The sources** (read-only), in `D:\AP_Chem_Prep\Units\unit01-atomic-structure\`: `worksheets\u01-ws1.tex` to `u01-ws4.tex`, and **one level up** `u01-selfstudy.tex` and `u01-frq.tex`. **Never open `exam\`.** **The key PDFs** are in `D:\AP_Chem_Prep\build\Units\unit01-atomic-structure\` (and its `worksheets\`), already turned into page pictures in `scratchpad/unit1-practice/pdf/` (`ws1-1.png` … `ws4-2.png`, `ladders-01.png` … `ladders-15.png`, `frq-1.png` … `frq-6.png`).
2. **Counts.** Worksheet 1: 7 questions (the inventory's 8 is wrong); Worksheet 2: 5; Worksheet 3: 5; Worksheet 4: 2 scored questions, 4 points each, three parts each; the ladders: 10 worked examples and 40 questions; the free-response set: 5 questions, 14 parts, 32 points (10, 10, 4, 4, 4).
3. **`\problem[1.N]` carries the topic** in its optional argument; the free-response set carries `\ced{1.N}` tags in its `\frq{...}` lines.
4. **Two sources have a figure**, both drawn with pgfplots: Worksheet 2, question 1 (the mass spectrum of zirconium; peaks at 90, 91, 92, 94 and 96 with heights 51.5, 11.2, 17.1, 17.4 and 2.8; no ticks on the vertical axis) and Worksheet 3, question 4 (a photoelectron spectrum on a reversed logarithmic axis; ticks at 126, 9.07, 5.31 and 0.74 MJ/mol; heights 2, 2, 6 and 2). Two questions ask the student to draw (Worksheet 2, question 3; Worksheet 3, question 3). Every other spectrum is given as numbers in the text.
5. **Every worksheet ends with a `spiralstrip`**, the "Quick review" left out of every practice document.
6. **In the ladders, `\selfcheck` holds the one-line answers** and the key-only `apcanswer` the explanations, as in the other units. The questions print as 1 to 4 and are keyed (a) to (d).
7. **Worksheet 4's rubrics** are boxed notes, not `\rpoint` lines. Question 1: four 1-point lines, for (a), (a), (b) and (c). Question 2: three 1-point lines for (a), (b) and (c), and one overall point with no part (no octet-stability language used as an explanation anywhere). `RubricLine`'s `part` is optional.
8. **What a practice page can hold.** `src/pages/[unit]/practice/[name].astro` (line 43) supplies `Answer`, `Blank`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`: **not `Figure`**. `Question` and `Part` take `beyond`. A document's `topics` may name only topics of its own unit; a `<Question topic="…">` is checked only against `src/data/units.ts`. The build check (`scripts/check-dist.mjs`) needs a non-empty `<Answer>` in every question or part, rubric lines that sum to the question's `points`, and document `points` equal to the sum of its questions'.
9. **The audit** drops every attribute of a block except `points` and `topic`, so it cannot see a figure's values: print them in a table as well. An `alt` or `caption` must not contain `>`. It counts source rubric lines by `\rpoint` only.
10. **Atomic masses.** The sources agree with the exam table (`src/data/elements.ts`) except Mg (24.31; table 24.30), C (12.011; table 12.01) and He (4.003; table 4.00). With the table's masses and unrounded intermediates, two answers change: Ladder 1(b) is 5.58 × 10²² atoms and Ladder 2(a) is 95.20 g/mol (used again in Ladder 4(a), whose 74.5 percent does not change). Avogadro's number is 6.022 × 10²³ everywhere.
11. **Data against the site's.** Every first ionization energy in the sources matches `src/lib/periodic-trends.ts`. Worksheet 3's spectrum is magnesium's and Worksheet 4's is sulfur's, exactly as in `src/lib/pes.ts`. One value differs: Worksheet 3, question 5 gives oxygen's 1s energy as 54.4 MJ/mol; `pes.ts` has 52.6. The zirconium abundances are real and sum to 100.0.
12. **The framework's Unit 1** (`scratchpad/ced/unit1-framework.md`) has three exclusions: peaks from species other than singly charged single atoms, and spectra of samples with several elements (1.2); quantum numbers (1.5); the configurations of elements that are exceptions to the filling order (1.7). It does not name orbital diagrams, Hund's rule, combustion analysis, lattice energy or the separation of mixtures.
13. **The lessons' rules and terms** (`src/content/lessons/unit-1/`): amu; subshell; valence electrons as the last digit of the group number for groups 1, 2 and 13 to 17, hydrogen and boron left out of the charge rules (1.8); the jump is the first rise that is several times the rises before it (1.8); "half-filled subshells are stable" and "wants a full shell" are not explanations (1.5, 1.7); a cation loses its highest-shell electrons first (1.5); an s electron spends more of its time close to the nucleus, inside the shielding of the other electrons (1.5: the lessons do not say "penetrates"); every peak of an anion's photoelectron spectrum is at a lower binding energy than the atom's (1.6); force proportional to q₁q₂/r² (1.5).

## Conventions for every task

Plan 3's "Conventions for every task" apply: the capital-`C:` working directory, the scratch folder for everything that is not the site, `D:\AP_Chem_Prep` read-only, Write and Edit for files with backslashes (never heredocs), conventional commits with **no AI-attribution trailer**, US spelling, tests first, no swallowed errors.

**Merging.** Nothing is merged without the teacher's word. Each pull request is opened, its "Build and test" check is watched on GitHub until it passes (`gh pr checks <n>`; a pass on this machine is not a pass there), and it is left for the teacher.

**Browser tests under the lock.** Another unit is being built in a second folder on this machine. Before any `npm run test:e2e` or `npx playwright test`: if `scratchpad/e2e.lock` exists or anything listens on port 4321, wait; otherwise write `unit1` into the lock, run, and delete it in the same command. A preview by hand uses port 4400.

**Models.** Writers and fact-checkers on Fable 5.2; fixers on Sonnet. The fact-checker's independence rests on a fresh context and on solving before reading.

**No originality check.** The practice is the teacher's own material, converted as it stands.

## What Unit 1 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Masses and units.** Every molar mass comes from the exam table's atomic masses as printed (the site's periodic table, `src/data/elements.ts`): Mg 24.30, C 12.01, He 4.00. Carry unrounded values and round at the end, as lesson 1.1 teaches. Ladder 1(b) becomes 5.58 × 10²² atoms and Ladder 2(a) 95.20 g/mol; printed intermediates follow. Every other answer stays as the source prints it; if your arithmetic gives something else, report it and do not change it. The mass unit is "amu" wherever the source has "u". Each document's introduction has one sentence that links the site's periodic table: `[periodic table](/tools/periodic-table/)`.

**The two spectra** (Worksheets 2 and 3). The figure files are made before the worksheets are written (Task 1): `/figures/1-practice-zirconium-spectrum.svg` and `/figures/1-practice-unknown-photoelectron-spectrum.svg`. Put the `<Figure>` in the question's stem, before its first part, followed by a Markdown table of the same values (mass in amu and relative abundance in percent; binding energy in MJ/mol and relative number of electrons). The alt text gives every peak; neither `alt` nor `caption` may contain `>`. The photoelectron spectrum's caption and alt do not name the element.

**Drawings.**
- Worksheet 2, question 3 stays a drawing on paper: keep the instruction ("On paper, draw …"), and the `<Answer>` gives the key's description of what the drawing must show, whole.
- Worksheet 3, question 3: the question asks how many unpaired electrons a ground-state nitrogen atom has, with a clause saying that an unpaired electron is one alone in its orbital, and adds that a sketch of three boxes for the three 2p orbitals may help. The `<Answer>` gives the count from lesson 1.5's rule (each electron of a subshell takes an empty orbital before any two share one) and describes the sketch in a sentence. Do not write "orbital diagram" as a thing the student must know.

**Corrections decided in the design (section 4.4).** Apply each and record it in your report:
- Worksheet 1, 5(c): 0.2002 g.
- Worksheet 2, question 1: the estimate from mass numbers and the table's 91.22 amu are named as such.
- Worksheet 2, question 2: keep the estimate of 38 and 62 percent as an estimate from the mass numbers; add that the measured abundances are near 43 and 57 percent, because the isotopes' masses are not whole numbers.
- Worksheet 3, question 5: oxygen's 1s binding energy is 52.6 MJ/mol.
- Worksheet 4, 1(b): the peak at 1.00 MJ/mol gains two electrons, and every peak of the ion is at a lower binding energy than in the atom.
- Ladder 3, the copper example: carry the two products unrounded; the answer is 63.54 amu, with a sentence that the table's 63.55 comes from more precise isotope data.
- Ladder 5: drop the stray "= 2"; reword part (d)'s question from its key.
- Ladder 10 and free-response question 5: "the attraction grows as the distance between the ions shrinks", never "varies as 1/d".
- Free-response question 1(a): the answer is 10.8 amu; the rubric line accepts 10.8 or 10.81.
- Free-response question 3: recompute the three mole amounts unrounded and print them to four figures; add to the stem that all of the sample's carbon ends up in the carbon dioxide and all of its hydrogen in the water.

**The lessons' rules and terms.**
- Ladder 10's opening: the number of valence electrons is the last digit of the group number, for groups 1, 2 and 13 to 17.
- Ladder 7's opening: keep the order of filling, and say that the periodic table is laid out in that order, so it can be read off the table (lesson 1.5).
- Where the source says an electron "penetrates", say that an s electron spends more of its time close to the nucleus, inside the shielding of the other electrons, so it feels more of the nuclear charge.
- "Subshell" for "sublevel". "First ionization energy" spelled out on first use in each answer, then "ionization energy". "Coulomb's law", and "attraction" for "Coulombic attraction" where the adjective adds nothing.
- Never "wants", "likes", "stable octet" or "half-filled stability" as an explanation; the sources already reject them, so keep their rejections.

**"Beyond the exam".** Worksheet 2, question 5 (the molecular peaks of Cl₂) carries `beyond` on its `<Question>`. Nothing else is labeled. Free-response question 3 is not labeled.

**Other units.** Do not add a topic number you are not sure of; say the idea in words and report it.
- Ladder 10, parts (c) and (d), and free-response question 5(b): add one sentence that how the attraction between ions sets a solid's properties is taken further in topic 2.2.
- Ladder 6 and free-response question 4 (dissolving, filtering, distilling): add one sentence that separating mixtures is topic 3.9.

**Scope notes.** The free-response set's note on the framework's exclusions becomes one sentence of its introduction: "Quantum numbers, the configurations of elements that break the filling order (chromium and copper are the usual examples), and mass-spectrum peaks from molecules are not on the AP exam, and nothing here asks for them." "Unit 1 is worth 7 to 9 percent of the AP exam" stays.

**Wording to recast.**
- Worksheet subtitles that name a type of sheet or a class routine go ("Type A skill drill", "front = class, back = homework", "configurations cold, spectra warm").
- Worksheet 1: "No calculator on problems 1 to 4" becomes advice that the first four are chosen so that no calculator is needed.
- Worksheet 2: "Answers without reasoning earn no credit here" becomes a sentence saying that every answer needs its reason, as a free-response answer does. Question 1(d)'s "in one column … in the other" becomes two blanks: what is identical for the isotopes, and what differs.
- Worksheet 3: "from memory, no periodic-table peeking" becomes: write each from the shape of the periodic table, then check it.
- Worksheet 4: "scoring boxes" becomes "the scoring rubric"; keep the advice to answer first and then score as a reader would.
- "YOUR TURN" is the `label="Your turn"` of the question. "I do:" is dropped from worked example titles. "Ladder 9: Periodic trends, explained Coulombically" becomes "Periodic trends, explained with Coulomb's law".
- "CED" becomes "the AP framework" or goes.

**Left out, as in the other units:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`, with the three root causes numbered (1), (2), (3), and "tomorrow", "the tracker" and "from a blank page" recast for a student anywhere).

## File structure

```
src/pages/[unit]/practice/[name].astro            gains Figure
tests/e2e/practice.spec.ts                        one test of a figure on a practice page
public/figures/1-practice-zirconium-spectrum.svg
public/figures/1-practice-unknown-photoelectron-spectrum.svg
src/content/practice/unit-1/                      six .mdx files
```

## The six documents

| Order | File in `src/content/practice/unit-1/` | Title | Kind | Source |
|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | `u01-selfstudy.tex` |
| 2 | `worksheet-1-moles-and-formulas.mdx` | Worksheet 1: Moles and formulas | `worksheet` | `worksheets/u01-ws1.tex` |
| 3 | `worksheet-2-mass-spectra-and-mixtures.mdx` | Worksheet 2: Mass spectra and mixtures | `worksheet` | `worksheets/u01-ws2.tex` |
| 4 | `worksheet-3-configurations-and-photoelectron-spectra.mdx` | Worksheet 3: Configurations and photoelectron spectra | `worksheet` | `worksheets/u01-ws3.tex` |
| 5 | `worksheet-4-two-free-response-questions.mdx` | Worksheet 4: Two free-response questions | `worksheet` | `worksheets/u01-ws4.tex` |
| 6 | `free-response-set.mdx` | Free-response set | `free-response` | `u01-frq.tex` |

---

## Group A: design and plan (pull request A)

Branch `topic/unit-1-practice-design`, from `topic/unit-1-trends-and-ions` (pull request #57). This plan and the design, committed and opened as a pull request with base `main`. It waits for the teacher.

---

## Group B: figures on practice pages, and Worksheets 1 to 4 (pull request B)

Branch `topic/unit-1-practice-worksheets`, from `topic/unit-1-practice-design`.

### Task 1: `Figure` on practice pages, and the two spectra

**Files:**
- Modify: `src/pages/[unit]/practice/[name].astro`
- Modify: `tests/e2e/practice.spec.ts`
- Create: `public/figures/1-practice-zirconium-spectrum.svg`, `public/figures/1-practice-unknown-photoelectron-spectrum.svg`

- [ ] **Step 1: Draw the two figures.** A script in the scratch folder (`scratchpad/unit1-practice/figures.cjs`, modeled on `scratchpad/unit1/tools/pes-figures.cjs` and on the generator of `public/figures/1-2-strontium-spectrum.svg`) writes both, with every coordinate computed from the data:
  - Zirconium: sticks at 90, 91, 92, 94 and 96 amu with heights in proportion to 51.5, 11.2, 17.1, 17.4 and 2.8; the horizontal axis labeled "mass (amu)" with a tick at every whole number from 89 to 97; the vertical axis labeled "relative abundance" with no numbers, as in the source. Same colors, fonts and sizes as `1-2-strontium-spectrum.svg`.
  - The photoelectron spectrum: four peaks at 126, 9.07, 5.31 and 0.74 MJ/mol on a logarithmic axis with the larger energy at the left, heights 2, 2, 6 and 2, each peak labeled with its energy, no subshell labels and no element's name; drawn as lesson 1.6's `1-6-unknown-spectrum.svg` is.
  - Render each at 320, 390 and 960 px (`scratchpad/unit1/svg-shot.cjs`) and look: no label under 12 px at 412 px, nothing clipped, no two labels touching. Recover the heights and positions from the SVG by script and compare them with the data.

- [ ] **Step 2: Write the failing test.** In `tests/e2e/practice.spec.ts`, beside the generic tests:

```ts
test.describe('a figure on a practice page', () => {
  const path = '/unit-1-atomic-structure/practice/worksheet-2-mass-spectra-and-mixtures/';

  test('shows the drawn spectrum with a text alternative that names every peak', async ({ page }) => {
    await page.goto(path);
    const image = page.locator('main figure img[src="/figures/1-practice-zirconium-spectrum.svg"]');

    await expect(image).toHaveCount(1);
    const alt = (await image.getAttribute('alt')) ?? '';
    for (const mass of ['90', '91', '92', '94', '96']) {
      expect(alt).toContain(mass);
    }
    expect(await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  });

  test('keeps the figure inside the page at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const image = page.locator('main figure img[src="/figures/1-practice-zirconium-spectrum.svg"]');
    const box = await image.boundingBox();
    if (!box) throw new Error('The zirconium spectrum has no box: it is not rendered.');

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  });
});
```

- [ ] **Step 3: Run it and watch it fail.** With Worksheet 2 not yet written, write a two-question stand-in of Worksheet 2 in the working tree (its real frontmatter, question 1's stem with the `<Figure>` and its table, one part and its answer), build, and run the two tests under the lock. Expected: the build fails, or the page lacks the image, because MDX has no `Figure` to render on a practice page. Record the message.

- [ ] **Step 4: Add `Figure` to the route.** In `src/pages/[unit]/practice/[name].astro`:

```astro
import Figure from '../../../components/lesson/Figure.astro';
```

  beside the other imports, and

```ts
const blocks = { Answer, Blank, Figure, Lewis, Part, Question, Resonance, Rubric, RubricLine, Worked };
```

- [ ] **Step 5: Build, run the two tests, see them pass.** Then `typescript-reviewer` and `code-reviewer` on the diff.

- [ ] **Step 6: Commit** the route, the test and the two figures (the stand-in worksheet is replaced in Task 2 and is not committed here):

```bash
git add "src/pages/[unit]/practice/[name].astro" tests/e2e/practice.spec.ts public/figures/1-practice-*.svg
git commit -m "feat(practice): let a practice page show a figure"
```

  The test needs Worksheet 2 to pass on GitHub, so this commit and Task 2's are pushed together.

### Task 2: Convert Worksheets 1 to 4

One writer per worksheet, in parallel, writing files only, into `scratchpad/unit1-practice/staging/`. Each gets: Plan 3's conversion guide; this plan's "What Unit 1 adds to the conversion guide"; its source `.tex`; a finished worksheet as the model, with its source (`src/content/practice/unit-3/worksheet-3-solutions-and-concentration.mdx` and `D:\AP_Chem_Prep\Units\unit03-properties-substances\worksheets\u03-ws3.tex`; for Worksheet 4's scored questions, `src/content/practice/unit-3/worksheet-5-spectroscopy-and-a-free-response-question.mdx`, question 4); and the Unit 1 lessons for the terms (`src/content/lessons/unit-1/`).

**Worksheet 1** (`u01-ws1.tex`):

```yaml
---
title: "Worksheet 1: Moles and formulas"
kind: worksheet
order: 2
topics: ["1.1", "1.3"]
summary: Seven questions on moles, mass and counts of particles, the mass of one element in a sample, and formulas from composition by mass.
---
```

Seven questions, topics 1.1 (questions 1 to 5) and 1.3 (questions 6 and 7). Question 5 has parts a to c and question 7 parts a and b. The header's advice (show the setup of every calculation; the first four need no calculator) becomes the introduction.

**Worksheet 2** (`u01-ws2.tex`):

```yaml
---
title: "Worksheet 2: Mass spectra and mixtures"
kind: worksheet
order: 3
topics: ["1.2", "1.4"]
summary: Five questions on reading a mass spectrum, estimating an average atomic mass, and telling a mixture from a pure substance particle by particle.
---
```

Five questions, topics 1.2, 1.2, 1.4, 1.4, 1.2. Question 1 has the zirconium figure and its table, then parts a to d. Question 3 is a drawing. Question 5 carries `beyond`.

**Worksheet 3** (`u01-ws3.tex`):

```yaml
---
title: "Worksheet 3: Configurations and photoelectron spectra"
kind: worksheet
order: 4
topics: ["1.5", "1.6"]
summary: Five questions on writing electron configurations, telling ground states from excited and impossible ones, and reading a photoelectron spectrum.
---
```

Five questions, topics 1.5, 1.5, 1.5, 1.6, 1.6. Question 1 has parts a to d, question 2 parts a to c, question 4 the figure and its table and parts a to d. Question 1(d): give selenium's configuration as lesson 1.5 writes one, and say that the other order of 4s and 3d is also accepted, as the key does.

**Worksheet 4** (`u01-ws4.tex`):

```yaml
---
title: "Worksheet 4: Two free-response questions"
kind: worksheet
order: 5
topics: ["1.6", "1.8"]
summary: Two short free-response questions, on a photoelectron spectrum and on successive ionization energies, each with its scoring rubric.
points: 8
---
```

`<Question number={1} title="The photoelectron spectrum of element Q" topic="1.6" points={4}>` with parts a to c and a `<Rubric>` of four 1-point lines: (a) the configuration; (a) sulfur, tied to 16 electrons; (b); (c). `<Question number={2} title="Successive ionization energies of element Z" topic="1.8" points={4}>` with parts a to c and a `<Rubric>` of four 1-point lines: (a), (b), (c), and one with no `part` for the overall point. The source tags question 2 as 1.7; successive ionization energies are lesson 1.8's, and the fact-check confirms the tag.

### Task 3: Finish the conversion of Group B

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 1's paths, up to and including the fact-check: copy the four files in; build and test once under the lock; audit each worksheet (`node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit01-atomic-structure/worksheets/u01-wsN.tex" src/content/practice/unit-1/<name>.mdx "<scratch>/unit1-practice/expected/<name>.json"`) to `0 unexplained, 0 stale`; look at each page at 412, 390, 360 and 320 px with every answer open; one fact-check per worksheet.

The fact-check brief adds to Plan 3's:

- **The Unit 1 lessons are the reference** for terms and for the limits on a rule (`src/content/lessons/unit-1/`). An answer must not say more than the lesson does. Ask by name for every "only", "always", "every", "never" and "all".
- **Solve before reading**, for every question and part, and recompute every number from the exam table's masses, unrounded, to the figures given.
- **The two figures:** recover every peak's position and height from the SVG and from the picture, and compare them with the table under the figure and with the answers.
- **Points to look at** (noticed while this plan was written; the checker decides):
  - Worksheet 1, question 4: what "total atoms" counts in an ionic compound, and whether the answer says ions.
  - Worksheet 1, 5(c): 0.2002 g, and the figures of each step.
  - Worksheet 1, question 7: the multiplier from the ratio of phosphorus to oxygen, and the molecular formula from a molar mass of about 284.
  - Worksheet 2, question 1: which peak is the tallest, the estimate against 91.22, and what is identical and what differs for the isotopes.
  - Worksheet 2, question 2: the estimate against the measured abundances, and whether the reasoning is the balance-point reasoning of lesson 1.2.
  - Worksheet 2, question 5: the three peaks, their masses, and whether the answer needs their heights (57.5, 36.7 and 5.9 percent).
  - Worksheet 3, question 2: each classification by lesson 1.5's three questions.
  - Worksheet 3, question 4(c) and (d): the reason for the gap between the 2s and 2p peaks; what changes for the next element (every shared peak at a higher energy, a new peak at the right).
  - Worksheet 3, question 5: 52.6 against 28.6, and the reason in terms of protons, with the same shell and no added shielding.
  - Worksheet 4, 1(b): the premise (the "most common ion" gains electrons), and what the ion's spectrum looks like.
  - Worksheet 4, question 2: the jump by lesson 1.8's rule, with the rises in kJ/mol (555, 3767, 1579), and the tag 1.8.

Differences the audit is expected to print:

| Document | Line | Reason |
|---|---|---|
| Every worksheet | numbers and formulas only in the source, in the last question's segment | The Quick review is left out |
| Worksheets 2 and 3 | the axis numbers of the source's plot | The spectrum is a figure with a table |
| Worksheet 1 | `0.2003` only in the source, `0.2002` only on the site | A correction |
| Worksheet 2 | `43`, `57`, `91.22` only on the site | Corrections |
| Worksheet 3 | `54.4` only in the source, `52.6` only on the site | The site's value |
| Worksheet 4 | `rubric lines`: 0 in the source, 4 on the site, for each question | The source's rubrics are boxed notes |
| Every worksheet | the link to the periodic table | Added |

### Task 4: Open pull request B

- [ ] **Decide each fact-check finding; one fixer per worksheet for the accepted ones, each bringing its audit back to clean; build, test and audit again; a second fact-check of what changed.**
- [ ] **Commit** (`feat(practice): add Unit 1 worksheets 1 to 4`), push, open the pull request with base `main`, and watch its check on GitHub until it passes.

```bash
git push -u origin topic/unit-1-practice-worksheets
gh pr create --base main --title "feat(practice): Unit 1 worksheets 1 to 4" --body-file "<scratch>/unit1-practice/pr-b-body.md"
gh pr checks <number> --watch
```

The body gives each document's questions and points, each audit's last line and expected differences, the fact-check's findings and what was done, the label, the models used, test and build output, and, set apart, **every correction to the originals**, for the teacher to accept or reverse.

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-1-practice-ladders-frq`, from `topic/unit-1-practice-worksheets`. The two drafts may be written in the scratch folder while Group B is checked, then copied in.

### Task 5: Convert the skill ladders and the free-response set

**Skill ladders** (`u01-selfstudy.tex`), modeled on `src/content/practice/unit-3/skill-ladders.mdx` and its source `D:\AP_Chem_Prep\Units\unit03-properties-substances\u03-selfstudy.tex`:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"]
summary: Ten skills, one at a time. Each has a worked example, then four questions of the same kind to try on your own. Start here, before the worksheets.
---
```

- The introduction comes from "How to use these notes": how a ladder works; the two habits (convert to moles first; explain a trend with nuclear charge, distance and shielding, never with what an atom "wants"); the link to the periodic table.
- Ten sections, `## Ladder 1: Moles, mass and particles` to `## Ladder 10: Valence electrons and ionic compounds`, titles as in the source in sentence case (Ladder 9: "Periodic trends, explained with Coulomb's law"). Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder: 1.1; 1.1; 1.2; 1.3; 1.3; 1.4; 1.5; 1.6; 1.7; 1.8.
- Ladders 1, 2, 3, 5, 7 and 10 as "What Unit 1 adds" says; Ladders 6 and 10 carry their sentences on topics 3.9 and 2.2.
- **Leave out** "Where you stand"; keep its advice as `## If you missed some`.

**Free-response set** (`u01-frq.tex`), modeled on `src/content/practice/unit-3/free-response-set.mdx`:

```yaml
---
title: "Free-response set"
kind: free-response
order: 6
topics: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"]
summary: Five free-response questions on all of Unit 1, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

- The introduction keeps: topics 1.1 through 1.8; Unit 1's weight on the exam; the one-sentence scope note; 5 questions, 32 points, about 50 minutes, calculator allowed; the link to the periodic table; that answers resting on "stability" or "wants a full octet" earn nothing.

| Number | `topic` | `points` | Rubric lines |
|---|---|---|---|
| 1 | 1.1, 1.2 | 10 | 2, 2, 3, 2, 1 |
| 2 | 1.5, 1.6, 1.7, 1.8 | 10 | 3, 3, 2, 2 |
| 3 | 1.3 | 4 | 4 |
| 4 | 1.4 | 4 | 2, 2 |
| 5 | 1.8 | 4 | 2, 2 |

- Each question's `title` is the description in its `\frq{...}` line, in sentence case, without "Coulombic" (question 5: "Ionic compounds and the attraction between ions").
- Question 3's single 4-point rubric line: look at how the key divides it; if the key names what earns each point, write one `RubricLine` per point and say so in the report.

**Points to look at in the fact-check:** Ladder 1(b) and 2(a) with magnesium's 24.30; Ladder 1(d) (helium against iron, by moles); Ladder 3's copper (63.54) and part (d) (no atom has the average mass); Ladder 5's worked example (the printed moles of carbon with 12.01) and part (d) as reworded; Ladder 6's percent of sodium in a mixture of two salts, and the sentence on topic 3.9; Ladder 7(d) (Al³⁺ against Mg²⁺: same electrons, more protons); Ladder 8(d) (the 1s peak for a larger nuclear charge); Ladder 9(c) (sulfur below phosphorus: the paired electron, not "half-filled stability") and 9(d) (sodium's second ionization energy); Ladder 10's opening rule, its formulas, the melting points 2852 and 993 °C and the distances 212 and 235 pm, and the sentence on topic 2.2; free-response 1(a) (10.8 or 10.81) and 1(e); 2(c) (magnesium 738 against aluminum 578, in the lesson's words); question 3's mole amounts and the added sentence in its stem; 4(b) (why the separation works) against lesson 3.9; 5(b) (CaO against KCl: charges first, then distance, with no formula).

### Task 6: Finish Group C

- [ ] **Finish as Tasks 3 and 4 do**, with these expected audit differences:

| Document | Line | Reason |
|---|---|---|
| Skill ladders | numbers of the tick table, only in the source; perhaps a wording line | "Where you stand" is left out |
| Skill ladders | `24.31`, `95.21`, `5.57`, `12.011`, `4.003`, `63.55` only in the source; `24.30`, `95.20`, `5.58`, `12.01`, `4.00`, `63.54` only on the site | The exam table's masses; the copper correction |
| Skill ladders, free-response set | the scope note's wording; the sentences on topics 2.2 and 3.9; the link to the periodic table | Section 4 of the design |
| Free-response set | fourth figures of question 3's mole amounts; `10.8` only on the site | Corrections |

With all six documents in place, check by hand: each Unit 1 lesson's "Practice next" lists the documents that have a question on its topic; the unit page lists the six in the order of the table "The six documents"; no molar mass has two values under `src/content/practice/unit-1` (`grep` for `24.31`, `12.011`, `4.003`); "amu" everywhere and no bare "u" as a unit.

- [ ] **Commit**

```bash
git add src/content/practice/unit-1
git commit -m "feat(practice): add the Unit 1 skill ladders and free-response set"
```

### Task 7: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Update the local `CLAUDE.md` (not committed).
- [ ] Commit (`docs: record how the Unit 1 practice was built`), push, open pull request C with base `main`, watch its check on GitHub until it passes, and leave it for the teacher.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The six documents | 2, 5 |
| 2. What is left out | Guide additions; 2, 5 |
| 3. Conversion, audit, fact-check, corrections, models | 3, 4, 6 |
| 4.1 The two spectra, `Figure` on practice pages | 1, 2 |
| 4.2 The two drawings | Guide additions; 2 |
| 4.3 The exam table's masses, amu, the link | Guide additions; 3, 6 |
| 4.4 Corrections | Guide additions; the fact-check briefs; the pull requests |
| 4.5 The lessons' rules and terms | Guide additions; 2, 5 |
| 4.6 Beyond the exam, other units | Guide additions; 2, 5 |
| 4.7 Wording | Guide additions |
| 5. Code | 1 |
| 6. Pull requests | A, 4, 7 |
| 7. Done when | 3, 4, 6, 7 |
