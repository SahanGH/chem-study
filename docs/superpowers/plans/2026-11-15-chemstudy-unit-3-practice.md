# ChemStudy Unit 3 Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the teacher's Unit 3 practice on chem-study.com: five worksheets, the fourteen skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: seven MDX files in `src/content/practice/unit-3/`, converted by hand from the LaTeX in `D:\AP_Chem_Prep` and checked by `scripts/practice-audit.mjs`. No code changes are expected.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-15-chemstudy-unit-3-practice-design.md`.

**Builds on:** Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`) and Plan 10 (`docs/superpowers/plans/2026-11-15-chemstudy-unit-7-practice.md`). Plan 3's sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise. Plan 10's "As carried out" notes record what the Unit 7 fact-checks kept finding; read them.

## Facts verified before writing (do not rediscover)

Established on 2026-11-15. The full inventory of the sources is in the session scratch folder (`scratchpad/unit3-practice/inventory-report.md`).

1. **The sources** (read-only), in `D:\AP_Chem_Prep\Units\unit03-properties-substances\`: `worksheets\u03-ws1.tex` to `u03-ws5.tex`, and **one level up** `u03-selfstudy.tex` and `u03-frq.tex`. **The key PDFs** are in `D:\AP_Chem_Prep\build\Units\unit03-properties-substances\` (and its `worksheets\`), already turned into page pictures in `scratchpad/unit3-practice/pdf/` (`ws1-1.png` ..., `ladders-01.png` ... `ladders-20.png`, `frq-1.png` ... `frq-7.png`).
2. **`\problem[3.N]` carries the topic** in its optional argument (in Unit 7 it was empty).
3. **No source has a figure.** Three questions ask the student to draw (Worksheet 2, 5(c); Worksheet 3, question 4; Worksheet 5, 4(a)); the source prints an empty box and the key describes the picture in words. Worksheet 5's question 4 has a data table. Worksheet 4's chromatogram is given as numbers only.
4. **Every worksheet ends with a `spiralstrip`**, the "Quick review" left out of every practice document.
5. **In the ladders, `\selfcheck` holds the one-line answers** and the key-only `apcanswer` the explanations, as in the other units. The questions print as 1 to 4 and are keyed (a) to (d).
6. **Worksheet 5's rubric** is a boxed note with six part lines (2, 2, 1, 2, 1, 1) and one overall point for units and significant figures: 10 in all. `RubricLine`'s `part` is optional, so the overall point is a line with no part.
7. **The practice route, the audit and the browser tests need no change.** `src/pages/[unit]/practice/[name].astro` supplies `Answer`, `Blank`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`. `Question` and `Part` take `beyond`. `tests/e2e/practice.spec.ts` makes its tests from every `src/content/practice/unit-N/` folder.
8. **Constants:** the lessons use $R = 0.08206$ L·atm/(mol·K), $h = 6.626 \times 10^{-34}$ J·s, $c = 2.998 \times 10^{8}$ m/s (as the equation sheet does) and 22.4 L at STP. `scratchpad/unit3-practice/site-values.py` shows that moving the sources' $c = 3.00 \times 10^{8}$ to $2.998 \times 10^{8}$ changes no answer, and gives Ladder 6's values with the acid reaction (0.0595 mol, 1.455 L, 1.333 L, 8.4 percent).
9. **The framework's Unit 3** has three exclusions: reading phase diagrams (3.3); colligative properties, and calculations of molality, percent by mass and percent by volume (3.7). Effusion, the root-mean-square speed and the photoelectric effect are not in it. Its text loses items and Greek letters (`scratchpad/ced/unit3-missing.md`); page pictures are in `scratchpad/ced/unit3-pages/`.
10. **The lessons' terms:** London dispersion forces, dipole–dipole forces, hydrogen bonding, ion–dipole forces (lesson 3.1, with an en dash); $R_f$ (lesson 3.9); "dissolving".

## Conventions for every task

Plan 3's "Conventions for every task" apply: the capital-`C:` working directory, the scratch folder for everything that is not the site, `D:\AP_Chem_Prep` read-only, Write and Edit for files (never heredocs), conventional commits with **no AI-attribution trailer**, US spelling, tests first, no swallowed errors, no preview server running during `npm run test:e2e`.

**Merging.** The teacher's "Merge and proceed" (2026-11-15) is read as authorizing Claude to merge each pull request of Unit 3's practice and test itself once its "Build and test" check passes and its content has been fact-checked. A merge deploys: wait for the deploy to succeed before the next group starts.

**Models.** Writers and fact-checkers on Fable 5.2 by the teacher's choice; until its usage limit resets (2026-11-17) they run on Opus, and the pull request says so. Fixers on Sonnet. The fact-checker's independence rests on a fresh context and on solving before reading.

**No originality check.** The practice is the teacher's own material, converted as it stands.

## What Unit 3 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Drawings.** A question that asks for a sketch or a drawing stays one: keep the instruction ("On paper, sketch ..."), and the `<Answer>` gives the key's description of what the drawing must show, whole. Do not draw anything. Worksheet 5's data table becomes a Markdown table with a header row (c in M, A) and the four pairs as rows.

**Constants.** Write $c = 2.998 \times 10^{8}\ \text{m/s}$ wherever the source gives $3.00 \times 10^{8}$; keep every answer as the source prints it (they do not change). Record each such line in your report. $h$, $R$ and 23.8 torr stay. Worksheet 5's sentence that the equation sheet does not give $\nu = c/\lambda$ goes; the introduction gives $c = \lambda\nu$ and $E = h\nu$ as display math.

**Ladder 6.** The worked example says the sample "reacts with excess hydrochloric acid", gives the equation on its own line, `\ce{NaHCO3 + HCl -> NaCl + H2O + CO2}`, and says one CO₂ forms for each NaHCO₃. Keep 0.0595 mol, 1.46 L and 1.33 L. The check "9 percent low" becomes "about 8 percent low".

**"Beyond the exam".** Ladder 8: the effusion step of the worked example opens with `**Beyond the exam:**` and Your turn (a) and (b) carry `beyond` on their `<Part>`. Worksheet 2, 5(b): the answer's sentence with $u_{rms} = \sqrt{3RT/M}$ starts with `**Beyond the exam:**`. Ladder 13, part (d), carries `beyond`. Nothing else is labeled.

**Scope notes.** The ladders' and the free-response set's notes on the framework's exclusions become one sentence of the introduction: "Reading phase diagrams, colligative properties, and calculations of molality or percent by mass are not on the AP exam, and nothing here asks for them. Concentration here always means molarity."

**Other units.** Units 4, 6 and 8 are not on the site.
- Ladder 4's opening adds one sentence: the energy taken in or given out in a phase change is topic 6.5.
- Ladder 12: where the worked example and part (b) speak of weak and strong acids, say in words that acids are a later unit's subject; do not add a topic number.
- Do not add a topic number you are not sure of; say the idea in words and report it.

**Terms.** "London dispersion forces" (the source's "LDF" spelled out), "dipole–dipole" and "ion–dipole" with an en dash, and "IMF" spelled out as "intermolecular forces" on first use in each answer. "Dissolving", never "dissolution". $R_f$ in math. "5 percent" in sentences. A unit after every number that has one. ε is `\varepsilon` everywhere.

**Wording to recast.** British spellings (behaviour, vapour, litre(s), metres, neighbouring, coloured). "Zumdahl reports these boiling points" becomes "These are the measured boiling points". "Assembled from seven different places in the textbook" and "Grade it hardest" go. "Heaviest unit on the exam" becomes "Unit 3 is worth 18 to 22 percent of the AP exam, more than any other unit". "Section II" and "candidate" go (say "student"). "YOUR TURN" is the `label="Your turn"` of the question. "I do:" is dropped from worked example titles. The free-response rubric note "do not ask for them" goes.

**Left out, as in the other units:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`, with "14 of 14", "10 to 13", "9 or fewer", the three root causes numbered (1), (2), (3), and "tomorrow" and "from a blank page" recast for a student anywhere).

## File structure

```
src/content/practice/unit-3/             seven .mdx files
```

## The seven documents

| Order | File in `src/content/practice/unit-3/` | Title | Kind | Source |
|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | `u03-selfstudy.tex` |
| 2 | `worksheet-1-forces-solids-and-phases.mdx` | Worksheet 1: Forces, solids and phases | `worksheet` | `worksheets/u03-ws1.tex` |
| 3 | `worksheet-2-gases.mdx` | Worksheet 2: Gases | `worksheet` | `worksheets/u03-ws2.tex` |
| 4 | `worksheet-3-solutions-and-concentration.mdx` | Worksheet 3: Solutions and concentration | `worksheet` | `worksheets/u03-ws3.tex` |
| 5 | `worksheet-4-solubility-and-separation.mdx` | Worksheet 4: Solubility and separation | `worksheet` | `worksheets/u03-ws4.tex` |
| 6 | `worksheet-5-spectroscopy-and-a-free-response-question.mdx` | Worksheet 5: Spectroscopy, and a free-response question | `worksheet` | `worksheets/u03-ws5.tex` |
| 7 | `free-response-set.mdx` | Free-response set | `free-response` | `u03-frq.tex` |

---

## Group A: design and plan (pull request A)

Branch `topic/unit-3-practice-design`, from an up-to-date `main`. This plan and the design, committed and opened as a pull request, merged when its check passes.

---

## Group B: Worksheets 1 to 5 (pull request B)

Branch `topic/unit-3-practice-worksheets`, from `main` after A is merged.

### Task 1: Convert Worksheets 1 to 5

One writer per worksheet, in parallel, writing files only. Each gets: Plan 3's conversion guide; this plan's "What Unit 3 adds to the conversion guide"; its source `.tex`; a finished worksheet as the model, with its source (`src/content/practice/unit-7/worksheet-3-ice-tables.mdx` and `D:\AP_Chem_Prep\Units\unit07-equilibrium\worksheets\u07-ws3.tex`; for Worksheet 5's scored question, `unit-7/worksheet-5-solubility-equilibria-and-a-free-response-question.mdx`, question 7).

**Worksheet 1** (`u03-ws1.tex`):

```yaml
---
title: "Worksheet 1: Forces, solids and phases"
kind: worksheet
order: 2
topics: ["3.1", "3.2", "3.3"]
summary: Six questions on naming the forces between particles, ranking boiling points and vapor pressures, and classifying solids.
---
```

Six questions, topics 3.1, 3.1, 3.1, 3.2, 3.3, 3.3. The subtitle's idea (every ranking needs its reason) and the header's advice become the introduction. Question 1's four parts and question 4's four parts each have one blank.

**Worksheet 2** (`u03-ws2.tex`):

```yaml
---
title: "Worksheet 2: Gases"
kind: worksheet
order: 3
topics: ["3.4", "3.5", "3.6"]
summary: Seven questions on the ideal gas law, changing conditions, partial pressures, kinetic molecular theory and real gases.
---
```

Seven questions, topics 3.4, 3.4, 3.4, 3.5, 3.5, 3.6, 3.6. The subtitle (kelvin every time) and the header's advice become the introduction, with $R$ as the source gives it. 5(c) is a sketch (see "Drawings"); 5(b)'s formula sentence is "Beyond the exam".

**Worksheet 3** (`u03-ws3.tex`):

```yaml
---
title: "Worksheet 3: Solutions and concentration"
kind: worksheet
order: 4
topics: ["3.7", "3.8"]
summary: Six questions on molarity, dilution, the concentrations of ions, and drawing a solution of an ionic compound particle by particle.
---
```

Six questions, topics 3.7, 3.7, 3.7, 3.8, 3.8, 3.7. The subtitle (ionic solutes are drawn as separated ions) and the header's advice become the introduction. Question 4 is a drawing (see "Drawings").

**Worksheet 4** (`u03-ws4.tex`):

```yaml
---
title: "Worksheet 4: Solubility and separation"
kind: worksheet
order: 5
topics: ["3.9", "3.10"]
summary: Six questions on what dissolves in what and why, choosing a way to separate a mixture, and reading a paper chromatogram.
---
```

Six questions, topics 3.10, 3.10, 3.10, 3.9, 3.9, 3.9. Question 4's four parts each have one blank holding a technique and the property it uses.

**Worksheet 5** (`u03-ws5.tex`):

```yaml
---
title: "Worksheet 5: Spectroscopy, and a free-response question"
kind: worksheet
order: 6
topics: ["3.11", "3.12", "3.13"]
summary: Three questions on the regions of the spectrum, photon energy and Beer's law, then one 10-point free-response question with its scoring rubric.
---
```

Four questions, topics 3.11, 3.12, 3.13, and question 4 `<Question number={4} title="A copper(II) calibration curve" topic="3.13" points={10}>` with parts a to f. Its rubric becomes a `<Rubric>` with seven `<RubricLine>`s: parts a to f with points 2, 2, 1, 2, 1, 1, then one line with no `part` and 1 point for units and significant figures. The table of standards goes in the question's stem, before part (a).

### Task 2: Finish the conversion of Group B

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 3's paths, up to and including the fact-check: build and test once; audit each worksheet (`node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit03-properties-substances/worksheets/u03-wsN.tex" src/content/practice/unit-3/<name>.mdx "<scratch>/unit3-practice/expected/<name>.json"`) to `0 unexplained, 0 stale`; look at each page at 412, 390, 360 and 320 px with every answer open; one fact-check per worksheet.

The fact-check brief adds to Plan 3's:

- **The Unit 3 lessons are the reference** for terms and for the limits on a rule (`src/content/lessons/unit-3/`). An answer must not say more than the lesson does.
- **Solve before reading**, for every question and part, and recompute every number to the figures given.
- **Points to look at** (noticed while this plan was written; the checker decides):
  - Worksheet 1, question 3: boiling points of BI₃, PCl₃ and NH₃, and the rule drawn from them.
  - Worksheet 1, question 6: the vapor-pressure order and its reason.
  - Worksheet 2, 2(c): "a 22-fold volume change instead of doubling" for a student who uses 27 instead of 300 K. Which error gives 22, and does the answer say which?
  - Worksheet 2, 5(b): "11 times smaller" for the molar masses of He and CO₂, and the label on the formula.
  - Worksheet 2, question 7: why CH₄ at 200 K dips below 1, and whether He dips more or less.
  - Worksheet 3, question 6: 15.96 g of CuSO₄ and the glassware.
  - Worksheet 4, question 5: which dye is more polar, both $R_f$ values, and the change with a polar mobile phase.
  - Worksheet 5, 3(c): absorbance "is a ratio": it is the logarithm of one.
  - Worksheet 5, question 4: every value, and the rubric's line with no part.

Differences the audit is expected to print:

| Document | Line | Reason |
|---|---|---|
| Every worksheet | numbers and formulas only in the source, in the last question's segment | The Quick review is left out |
| Worksheet 5 | `3.00` only in the source, `2.998` only on the site | The site's value of c |
| Worksheet 5 | `rubric lines`: 0 in the source, 7 on the site | The source's rubric is a boxed note |

### Task 3: Open pull request B

- [ ] **Decide each fact-check finding; one fixer per worksheet for the accepted ones, each bringing its audit back to clean; build, test and audit again; a second fact-check of what changed.**
- [ ] **Commit, push, open the pull request, merge when its check passes, wait for the deploy.**

```bash
git add src/content/practice/unit-3
git commit -m "feat(practice): add Unit 3 worksheets 1 to 5"
git push -u origin topic/unit-3-practice-worksheets
gh pr create --base main --title "feat(practice): Unit 3 worksheets 1 to 5" --body-file "<scratch>/unit3-practice/pr-b-body.md"
```

The body gives each document's questions and points, each audit's last line and expected differences, the fact-check's findings and what was done, the labels, the models used, test and build output, and, set apart, **every correction to the originals**, for the teacher to accept or reverse.

> **As carried out (2026-11-15), Tasks 1 to 3.** Five Opus writers converted the worksheets in parallel (Fable's limit had been reached). The first audits needed only the entries this plan foresaw, plus one for the source's unit `s$^{-1}$`, which the audit reads as a number. Then:
>
> - **The first fact-checks** (Opus) found four errors, all in the source. Ammonia boils at −33.3 °C, not −33.0. CuSO₄ is 159.61 g/mol with the AP table's S = 32.06, and the mass is 16.0 g to three significant figures, not 15.96 g. Worksheet 5's 3(c) called absorbance "a ratio of transmitted to incident light", which is transmittance, upside down. The accuracy findings were of a few kinds:
>   - a list of forces that left some out where the question asks for "every" force;
>   - a rule that lesson 3.1 lists as a trap;
>   - answers that said more than the lessons (melting "overcomes" hydrogen bonds; ionic compounds "dissociate completely");
>   - steps and terms that were not the lessons'.
> - **Worksheet 1, question 6 changed substance:** pentane for hexane. Real hexane boils above methanol yet has the higher vapor pressure, against lesson 3.2's rule.
> - **One Sonnet fixer per worksheet** applied the decided list and brought its audit back to clean. **A second Opus check** of every changed passage found one error the fixes had introduced: Worksheet 1's new rule said force type decides "only" among molecules of similar size, which the worksheet's own question 2 disproves. It also found one significant-figure slip and two places where the reasoning was missing. Those four were fixed by hand.
> - **Phones:** nothing scrolled at any width, before or after the fixes.

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-3-practice-ladders-frq`, from `main` after B is merged. The two drafts may be written in the scratch folder while Group B is checked, then copied in.

### Task 4: Convert the skill ladders and the free-response set

**Skill ladders** (`u03-selfstudy.tex`), modeled on `src/content/practice/unit-7/skill-ladders.mdx` and its source `D:\AP_Chem_Prep\Units\unit07-equilibrium\u07-selfstudy.tex`:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"]
summary: Fourteen skills, one at a time. Each has a worked example, then four questions of the same kind to try on your own. Start here, before the worksheets.
---
```

- The introduction comes from "How to use these notes": how a ladder works; the unit's weight on the exam; work a few ladders at a time; the two habits (kelvin always; name the force and why it is stronger); the one-sentence scope note.
- Fourteen sections, `## Ladder 1: Identifying intermolecular forces` to `## Ladder 14: The Beer–Lambert law`, titles as in the source in sentence case. Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder: 3.1; "3.1, 3.3"; 3.2; 3.3; 3.4; 3.4; 3.4; 3.5; 3.6; 3.7; 3.10; "3.8, 3.9"; "3.11, 3.12"; 3.13.
- Ladder 6 as "What Unit 3 adds" says; Ladders 8 and 13 carry their labels; Ladder 4 and 12 as "Other units" says.
- **Leave out** "Where you stand"; keep its advice as `## If you missed some`.

**Free-response set** (`u03-frq.tex`), modeled on `src/content/practice/unit-7/free-response-set.mdx`:

```yaml
---
title: "Free-response set"
kind: free-response
order: 7
topics: ["3.1", "3.3", "3.4", "3.5", "3.6", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"]
summary: Five free-response questions on all of Unit 3, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

- The introduction keeps: topics 3.1 through 3.13; Unit 3's weight on the exam; the one-sentence scope note; $R$ and water's vapor pressure at 25 °C; 5 questions, 32 points, about 50 minutes, calculator allowed.
- The topics list leaves out 3.2 and 3.7: question 2's tag names them, but no part asks about solids or concentration (the fact-check confirms).

| Number | `topic` | `points` | Rubric lines |
|---|---|---|---|
| 1 | 3.4, 3.5 | 10 | 2, 2, 3, 2, 1 |
| 2 | 3.1, 3.3, 3.10 | 10 | 3, 3, 2, 2 |
| 3 | 3.6 | 4 | 2, 2 |
| 4 | 3.11, 3.12, 3.13 | 4 | 2, 1, 1 |
| 5 | 3.8, 3.9 | 4 | 2, 2 |

- Each question's `title` is the description in its `\frq{...}` line, in sentence case.
- Keep "Using 745 torr caps this at 2" (1(c)) and "arguing from electronegativity alone ... earns 0" (2(b)) as they are.

**Points to look at in the fact-check:** Ladder 1(c)'s garbled sentence about HCl's hydrogen; Ladder 2(d) (HF's stronger hydrogen bonds, water's higher boiling point); Ladder 3's solids; Ladder 4 against what lesson 3.3 teaches; Ladder 6's corrected example (the reaction, 1.46 L, 1.33 L, about 8 percent); Ladder 8's labels and ratios (3.16, 3.98, 2.00); Ladder 9(b)'s one-line answer, which gives only part of the reason; Ladder 12's acids; Ladder 13's values with c = 2.998 × 10⁸ and the label on (d); free-response question 1 (0.0500 mol, 721 torr, 0.949 atm, 1.29 L, the 1.25 L cap); question 2's tags; question 3(b), both regimes; question 4(b), 0.2175 printed as 0.218.

### Task 5: Finish Group C

- [ ] **Finish as Tasks 2 and 3 do**, with these expected audit differences:

| Document | Line | Reason |
|---|---|---|
| Skill ladders | numbers of the tick table, only in the source; perhaps a wording line | "Where you stand" is left out |
| Skill ladders, free-response set | the scope note's wording | It becomes one sentence |
| Skill ladders | `3.00` only in the source, `2.998` only on the site; `9` only in the source, `8` only on the site; the reaction with HCl only on the site | The site's value of c; Ladder 6's correction |

With all seven documents in place, check by hand: each Unit 3 lesson's "Practice next" lists the documents that have a question on its topic; the unit page lists the seven in the order of the table "The seven documents"; no constant has two values under `src/content` (`grep` for `3.00 \times 10^{8}`, `0.0821`, `8.31 `).

- [ ] **Commit**

```bash
git add src/content/practice/unit-3
git commit -m "feat(practice): add the Unit 3 skill ladders and free-response set"
```

> **As carried out (2026-11-15), Tasks 4 and 5.** Both documents were written, fact-checked, fixed and checked a second time as drafts in the scratch folder while the worksheets were checked, then copied in.
>
> - **Skill ladders:** five errors, four of them from the source.
>   - Ladder 2 taught "compare force type first; only if the types match does size decide", which lesson 3.1 lists as a trap. The introduction, the method and 2(b) now count electrons first.
>   - Ladder 2(c) said the ether has "both" hydrogens on carbon (it has six).
>   - Ladder 7 printed 0.60 atm among three-figure values.
>   - Ladder 14(b) gave 0.300 from a concentration with two figures; the concentration is now 1.50 × 10⁻⁴ M.
>   - The one error from the conversion: Ladder 13(b)'s 7.83 × 10⁻¹⁹ J is 7.82 with c = 2.998 × 10⁸. The 471 kJ/mol stands.
>   - **Accuracy findings:**
>     - Ladder 2's order is now written out.
>     - "Effusion" is defined under its label, and the label covers the warning about the ratio's direction.
>     - Ladder 4 says that heating curves are topic 6.5.
>     - Ladder 14's paragraph on transmittance went, since lesson 3.13 does not teach it.
>     - Ladder 12 names Unit 8 for acids.
>     - "The hardest unit in AP Chemistry" became "covers more of the exam than any other".
> - **Free-response set:** two errors from the source. Both were "only" claims that left out a force: London forces in 2(b), and dipole–induced dipole forces in 2(c).
>   - **Topic 3.2 is tested** (2(a) and 2(b) rank boiling points) and 3.7 is not. So the topics list and question 2's tag include 3.2, and the introduction says "most of Unit 3: topics 3.1 to 3.6 and 3.8 to 3.13".
>   - Rubric lines say how another route scores: 1(c)'s use of 745 torr loses only the dry-pressure point; 0.2175 earns 4(b). The points are unchanged.
> - **Second check:** no errors. Seven wording points and one accuracy point (3(b)'s "more compressed than the law assumes", the same wording Ladder 9 had lost) were fixed by hand.
> - **Phones:** two calculations in the ladders' answers (13(a), 14(b)) scrolled inside their boxes from 412 px down and are split over more lines.
> - **The hand checks:** each lesson's "Practice next" lists the documents with a question on its topic. The unit page lists the seven in order. No constant has two values under `src/content`.

### Task 6: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Update the local `CLAUDE.md` (not committed).
- [ ] Commit (`docs: record how the Unit 3 practice was built`), push, open pull request C, merge it when its check passes, wait for the deploy, return to `main` and delete the branches.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The seven documents | 1, 4 |
| 2. What is left out | Guide additions; 1, 4 |
| 3. Conversion, audit, fact-check, corrections, the lessons' terms, models | 2, 3, 5 |
| 4.1 Drawings | Guide additions; 1 |
| 4.2 Constants | Guide additions; 2, 5 |
| 4.3 Ladder 6 | Guide additions; 4 |
| 4.4 Beyond the exam | Guide additions; 1, 4; the fact-check briefs |
| 4.5 Other units | Guide additions; 4 |
| 4.6 Wording | Guide additions |
| 5. Code | None |
| 6. Pull requests | A, 3, 6 |
| 7. Done when | 2, 3, 5, 6 |
