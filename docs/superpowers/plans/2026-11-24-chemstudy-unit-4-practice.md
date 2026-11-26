# ChemStudy Unit 4 Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the teacher's Unit 4 practice on chem-study.com: four worksheets, the twelve skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: six MDX files in `src/content/practice/unit-4/`, converted by hand from the LaTeX in `D:\AP_Chem_Prep` and checked by `scripts/practice-audit.mjs`. No code changes.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-24-chemstudy-unit-4-practice-design.md`.

**Builds on:** Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`), whose sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise; and on Unit 1's practice, made the week before (pull requests #58, #60 and #61, not yet merged), whose lessons are written into this plan.

## Facts verified before writing (do not rediscover)

Established on 2026-11-24. The research behind them is in the session scratch folder: `scratchpad/unit4-practice/research.md` (nine sections, with file and line for each fact), `recompute.py`, `balance.py` and `overlap.py` with their outputs, and the earlier inventory `scratchpad/unit4/practice-inventory.md`.

1. **The sources** (read-only), in `D:\AP_Chem_Prep\Units\unit04-chemical-reactions\`: `worksheets\u04-ws1.tex` to `u04-ws4.tex`, and **one level up** `u04-selfstudy.tex` and `u04-frq.tex`. **Never open `exam\`.** **The key PDFs** are in `D:\AP_Chem_Prep\build\Units\unit04-chemical-reactions\` (and its `worksheets\`), already turned into page pictures in `scratchpad/unit4-practice/pdf/` (`ws1-1.png` … `ws4-3.png`, `ladders-01.png` … `ladders-15.png`, `frq-1.png` … `frq-6.png`).
2. **Counts.** Worksheet 1: 6 questions; Worksheet 2: 7; Worksheet 3: 6; Worksheet 4: 2 (the first scored, 10 points, with parts a to f; the second unscored, parts a to c). The ladders: 12 worked examples and 48 questions. The free-response set: 5 questions, 15 parts, 32 points (10, 10, 4, 4, 4).
3. **`\problem[4.N]` carries the topic**; the free-response set carries `\ced{4.N}` tags in its `\frq{...}` lines.
4. **One figure, in Worksheet 1, question 4** (a tikz box: 6 filled circles, atoms of A, and 3 pairs of open circles, molecules of B₂; the counts are in the picture's caption only). Three questions ask for a drawing: Worksheet 1, 4(c) and question 5 (three formula units of K₂SO₄ dissolved: 6 K⁺ and 3 SO₄²⁻); Worksheet 4, 1(e) (the mixture after lead(II) nitrate meets potassium iodide; no counts fixed). Free-response 5(b) is already a question about counts (4 ethanol and 9 oxygen molecules in; 6 CO₂, 9 H₂O and 1 ethanol out).
5. **Rubrics.** Worksheet 4, question 1: a boxed note of six items, (a) 1, (b) 2, (c) 2, (d) 2, (e) 2, (f) 1. The free-response set: 15 `\rpoint` lines; question 1: 2, 3, 2, 2, 1; question 2: 2, 3, 3, 2; question 3: 3 (one point for each of three classifications, each needing its reason) and 1; question 4: 2, 2; question 5: 2, 2.
6. **Every worksheet ends with a `spiralstrip`** (the Quick review, left out). In the ladders `\selfcheck` holds the one-line answers and the key-only `apcanswer` the explanations; the questions print as 1 to 4 and are keyed (a) to (d).
7. **What a practice page can hold.** `src/pages/[unit]/practice/[name].astro` supplies `Answer`, `Blank`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked` (no `Figure` on this branch). `Question` and `Part` take `beyond`. A document's `topics` may name only topics of its own unit. The build check needs a non-empty `<Answer>` in every question or part, rubric lines that sum to the question's `points`, and document `points` equal to the sum of its questions'.
8. **Numbers.** No atomic or molar mass in the sources differs from the exam table (`src/data/elements.ts` is on Unit 1's branches; the masses are also on the live periodic table of the AP exam: N₂ 28.02, NH₃ 17.03, Fe₂O₃ 159.7, AgCl 143.32, BaSO₄ 233.39, PbI₂ 461.0). No numeric answer changes. Recomputed by the controller: Ladder 4's worked example is 34.04 g unrounded (1.99857 mol × 17.03 g/mol); free-response 1(c) is exactly 2.305 g; Ladder 7(a) is exactly 0.01125 mol; free-response 4(a) is exactly 0.115 M unrounded; hydrogen to oxygen in Ladder 4(d) is 1 to 7.94 by mass; Worksheet 4, 1(e) at 4 Pb²⁺, 8 NO₃⁻, 4 K⁺ and 4 I⁻ leaves 14 ions dissolved.
9. **Equations.** All 52 equations in the sources balance in atoms and in charge. Many carry no state symbols (Ladders 1, 9, 10 and 12, and some net ionic answers).
10. **The framework's Unit 4** (`scratchpad/ced/unit4-framework.md`) has three exclusions: the meaning of "oxidizing agent" and "reducing agent"; solubility rules to memorize beyond sodium, potassium, ammonium and nitrate salts; Lewis acids and bases. It leaves open whether dissolving a salt is a physical or a chemical change. It does not name percent yield.
11. **The lessons' rules and terms** (`src/content/lessons/unit-4/`):
    - 4.2: a dissolved ionic compound, a strong acid and a strong base are written as ions, everything else whole; "molecular equation", "complete ionic equation", "net ionic equation", "spectator ion"; the strong acids and bases are listed, and "a question tells you whether an acid or a base is strong or weak"; a strong acid with a strong base gives H⁺ + OH⁻ → H₂O when the salt left is soluble.
    - 4.3: water left out of every box; a polyatomic ion is one particle; a precipitate is a cluster in which unlike ions touch; the excess reactant is still shown.
    - 4.4: a change is chemical if bonds are broken or formed; dissolving a salt is argued both ways.
    - 4.5: the limiting-reactant routine (suppose all of one reactant reacts; how much of the other does that need; is there that much); percent yield.
    - 4.6: the equivalence point is set by amounts and the endpoint is what is seen; four steps; no formula of the form M_aV_a = M_bV_b; "an acid with two protons to give".
    - 4.7: three kinds of reaction, sorted by what moves; a reaction can be more than one kind, or none; one solubility rule, and any other solubility is given; six oxidation-number rules in order (element 0; one-atom ion its charge; the sum equals the charge; fluorine −1; hydrogen +1 with a nonmetal and −1 with a metal; oxygen −2 except in peroxides), "oxidation number", and the agents only in a "Beyond the exam" sentence.
    - 4.8: an acid gives a proton and a base takes one; conjugate pairs; strong and weak; what "favors" means.
    - 4.9: half-reactions; multiply by the smallest whole numbers that match the electrons; in acidic solution: other elements first, then oxygen with H₂O, hydrogen with H⁺, the charge with electrons.

## Conventions for every task

Plan 3's "Conventions for every task" apply: the capital-`C:` working directory (this unit's folder is `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study-unit4`), the scratch folder for everything that is not the site, `D:\AP_Chem_Prep` read-only, Write and Edit for files with backslashes, conventional commits with **no AI-attribution trailer**, US spelling, tests first, no swallowed errors.

**Merging.** Nothing is merged without the teacher's word. Each pull request is opened, its "Build and test" check is watched on GitHub until it passes (`gh pr checks <n>`; a pass on this machine is not a pass there), and it is left for the teacher.

**Browser tests under the lock.** Another unit is being built in a second folder on this machine. Before any `npm run test:e2e` or `npx playwright test`: if `scratchpad/e2e.lock` exists or anything listens on port 4321, wait; otherwise write `unit4` into the lock, run, and delete it in the same command. A preview by hand uses port 4400.

**Models.** Writers and fact-checkers on Fable 5.2; fixers on Sonnet (brief: `scratchpad/unit7-practice/fixer-brief.md`). No originality check.

**Learned on Unit 1's practice, and binding here:**
- A correction to one of the teacher's numbers is recomputed by the controller in Python before it goes into a decided list or a pull request. A writer or fixer that believes an item is wrong does not apply it and says why.
- A calculation inside a part's answer has room for about 25 characters on a 320 px phone. Every display longer than that is split with `aligned`. **Measure every page after every round of fixes**, not only the first: `scratchpad/unit2/lesson-check.cjs` for the page, `scratchpad/unit7-practice/wide-eq.cjs` to name an equation that scrolls in its box.
- The audit reads any number in the page as a number, a spacing argument such as `[0.6em]` included: do not use one.
- A scoring note copied from a source that a grader could read two ways is kept as the source has it and listed in the pull request.
- The second fact-check is told to treat every sentence as new and to apply each rule the page states, exactly as worded, to every example on the page.

## What Unit 4 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Equations.** Every equation is `\ce{...}` in display math, split at the arrow with `aligned` when it is longer than about 25 characters. An equation given as an answer carries a state symbol on every species, as the lessons' equations do; where the source's has none, add them, and report each one you add. Balance every equation yourself, in atoms and in charge, before you write it. An ionic equation writes a dissolved ionic compound, a strong acid and a strong base as ions and everything else whole (lesson 4.2).

**What a question must supply** (design, 4.1). Add to the stem, in words, the solubility or the strength the question needs and does not give: zinc sulfide is insoluble (Worksheet 2, 3(a)); silver chromate is insoluble (5(a)); magnesium chloride is soluble (5(b)); silver chloride and lead(II) iodide are insoluble (Ladder 9, worked example and part (a)); hydrobromic acid is a strong acid, acetic acid a weak acid and ammonia a weak base (Worksheet 2, 3(b) to 3(d) and question 4; Ladders 9(c) and 10; free-response question 4, where the source's "monoprotic" becomes "with one proton to give"). Add nothing a question already gives.

**"Beyond the exam".**
- Worksheet 3, question 2: the request for "both agents" becomes a last part of its own, with `beyond`, which first says what the words mean (the species that is reduced is called the oxidizing agent, and the species that is oxidized the reducing agent). The other parts keep what else the question asks.
- Worksheet 3, question 3 (the whole question) and Worksheet 4, 2(c) carry `beyond` and the same sentence.
- Worksheet 2, 6(a): the part says that by an older definition a base is a substance that gives hydroxide ions in water (an Arrhenius base), and carries `beyond`.
- Nothing else is labeled: not percent yield (Ladder 6), not balancing in acidic solution (Ladder 12, free-response 2(b)).

**Dissolving a salt** (design, 4.3). Worksheet 1, question 2, Ladder 3's worked example and free-response question 3: the answer gives both arguments in lesson 4.4's terms (nothing new is made and the salt comes back when the water is evaporated; the ionic bonds of the crystal are broken and ion–dipole attractions form) and says that either classification is accepted with its reason. Free-response 3(a)'s rubric line gives the point for dissolving to either classification with a reason from bonds or attractions; 3(b) stays as the source has it.

**The lessons' rules and terms** (design, 4.4).
- "Molecular equation" for "formula equation". No "electrolyte": use lesson 4.2's rule for what is written as ions.
- Ladder 2(d): "…when the salt they leave is soluble".
- Ladder 9's opening and part (d), and Worksheet 2, question 1: a reaction can be more than one kind, or none; say of the reactions in hand what the source says of all.
- Ladder 11's opening: lesson 4.7's six rules, in its order and close to its wording. "Oxidation number", never "oxidation state". The species oxidized or reduced is named as the reactant that holds the atom (in Worksheet 3, 2(a): the silver ion, or silver nitrate, is reduced).
- Ladder 12 and free-response 2(b): keep the source's equations and final balanced equations. Show the two half-reactions and build the answer by lesson 4.9's steps (every element but oxygen and hydrogen; oxygen with H₂O; hydrogen with H⁺; the charge with electrons; multiply by the smallest whole numbers that match the electrons; add; check atoms and charge). A rubric line keeps its points and its notes.
- Ladder 8 and free-response questions 2 and 4: "equivalence point" where an amount is meant; where a stem says the indicator changed at a volume, add that the endpoint is taken as the equivalence point. "An acid with two protons to give" for "diprotic"; "the volume of titrant" for "titre".
- "Surrounded by water molecules" for "hydrated".

**Two volumes** (design, 4.5). Ladder 7 (its opening or worked example) says that the volumes are taken to add. Each answer that divides by the combined volume (Ladder 7's worked example, 7(c), 7(d); free-response 1(d)) says in a sentence that the ion is now spread through all of the mixture, and that this is not a titration's question, where the analyte's concentration is its moles divided by the volume of the sample.

**Numbers** (design, 4.6). Keep every answer as the source prints it; recompute each as you go and report any you cannot reproduce, without changing it. Four displays change: Ladder 4's worked example shows the carried 1.999 mol before multiplying by 17.03 g/mol; free-response 1(c) shows 2.305 g and gives 2.31 g, and its rubric line accepts 2.30 g or 2.31 g; Ladder 7(a) shows 0.01125 mol and gives 0.0113 mol; free-response 4(a) carries the unrounded moles so that the printed 0.115 M follows; Ladder 4(d)'s "1:8 mass ratio" becomes "about 1 to 8 by mass".

**Drawings** (design, 4.7).
- Worksheet 1, question 4: the stem says in words that the box holds 6 atoms of A and 3 molecules of B₂ (no figure). Part (c) stays a drawing on paper; its answer says what the drawing shows (6 AB units, nothing left over; 6 A and 6 B before and after).
- Worksheet 1, question 5 and Worksheet 4, 1(e) stay drawings on paper, each answered in words with the counts, in lesson 4.3's terms. For 1(e) give the set of the design (from 4 Pb²⁺, 8 NO₃⁻, 4 K⁺ and 4 I⁻: a cluster of 2 Pb²⁺ and 4 I⁻; 2 Pb²⁺, 8 NO₃⁻ and 4 K⁺ still dissolved) and say what every correct drawing shares with it.
- "An unlabelled diagram earns nothing" becomes advice to label every particle.

**Scope notes.** The free-response set's and the ladders' notes on the framework's exclusions become one sentence of each introduction: "The names 'oxidizing agent' and 'reducing agent', solubility rules beyond the one for sodium, potassium, ammonium and nitrate salts, and Lewis acids and bases are not on the AP exam, and nothing here asks for them." If the document does ask for one under a "Beyond the exam" label, the sentence says so.

**Wording to recast.** Worksheet subtitles that name a type of sheet or a class routine go. Worksheet 4's header becomes a sentence about the AP exam's long free-response questions. "YOUR TURN" is the `label="Your turn"` of the question; "I do:" is dropped. "CED" becomes "the AP framework" or goes. "Brønsted–Lowry" with its accent and an en dash.

**Left out:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`).

## File structure

```
src/content/practice/unit-4/             six .mdx files
```

## The six documents

| Order | File in `src/content/practice/unit-4/` | Title | Kind | Source |
|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | `u04-selfstudy.tex` |
| 2 | `worksheet-1-change-evidence-and-particle-drawings.mdx` | Worksheet 1: Change, evidence and particle drawings | `worksheet` | `worksheets/u04-ws1.tex` |
| 3 | `worksheet-2-kinds-of-reaction-and-net-ionic-equations.mdx` | Worksheet 2: Kinds of reaction and net ionic equations | `worksheet` | `worksheets/u04-ws2.tex` |
| 4 | `worksheet-3-oxidation-numbers-stoichiometry-and-titration.mdx` | Worksheet 3: Oxidation numbers, stoichiometry and titration | `worksheet` | `worksheets/u04-ws3.tex` |
| 5 | `worksheet-4-a-long-free-response-question-and-redox-practice.mdx` | Worksheet 4: A long free-response question, and redox practice | `worksheet` | `worksheets/u04-ws4.tex` |
| 6 | `free-response-set.mdx` | Free-response set | `free-response` | `u04-frq.tex` |

---

## Group A: design and plan (pull request A)

Branch `topic/unit-4-practice-design`, from `topic/unit-4-kinds-of-reaction` (pull request #59). This plan and the design, committed and opened as a pull request with base `main`. It waits for the teacher.

---

## Group B: Worksheets 1 to 4 (pull request B)

Branch `topic/unit-4-practice-worksheets`, from `topic/unit-4-practice-design`.

### Task 1: Convert Worksheets 1 to 4

One writer per worksheet, in parallel, writing files only, into `scratchpad/unit4-practice/staging/`, with its audit's expected file in `scratchpad/unit4-practice/expected/`. Each gets: `scratchpad/unit4-practice/writer-brief.md` (Unit 1's brief with Unit 4's paths); Plan 3's conversion guide; this plan's "Facts" and "What Unit 4 adds"; its source `.tex` and key pictures; a finished worksheet as the model (`src/content/practice/unit-3/worksheet-3-solutions-and-concentration.mdx` with `D:\AP_Chem_Prep\Units\unit03-properties-substances\worksheets\u03-ws3.tex`; for Worksheet 4's scored question, `unit-3/worksheet-5-spectroscopy-and-a-free-response-question.mdx`, question 4); and the Unit 4 lessons for the terms.

**Worksheet 1** (`u04-ws1.tex`):

```yaml
---
title: "Worksheet 1: Change, evidence and particle drawings"
kind: worksheet
order: 2
topics: ["4.1", "4.3", "4.4"]
summary: Six questions on telling a physical change from a chemical one, what counts as evidence of a reaction, and drawing a reaction particle by particle.
---
```

Six questions, topics 4.4, 4.4, 4.1, 4.3, 4.3, 4.3. Question 1 has parts a to d, question 3 parts a to c, question 4 parts a to c. Question 2 as "Dissolving a salt" says; question 4 and question 5 as "Drawings" says; question 6 (two errors in a described diagram) is text only.

**Worksheet 2** (`u04-ws2.tex`):

```yaml
---
title: "Worksheet 2: Kinds of reaction and net ionic equations"
kind: worksheet
order: 3
topics: ["4.2", "4.7", "4.8"]
summary: Seven questions on naming the kind of reaction, writing complete and net ionic equations, and telling strong acids and bases from weak ones.
---
```

Seven questions, topics 4.7, 4.2, 4.2, 4.2, 4.7, 4.8, 4.2. Questions 3 and 5 gain the solubilities and strengths of "What a question must supply"; 6(a) carries `beyond`.

**Worksheet 3** (`u04-ws3.tex`):

```yaml
---
title: "Worksheet 3: Oxidation numbers, stoichiometry and titration"
kind: worksheet
order: 4
topics: ["4.5", "4.6", "4.7"]
summary: Six questions on assigning oxidation numbers, saying what is oxidized and reduced, and calculations with solutions, a limiting reactant and a titration.
---
```

Six questions, topics 4.7, 4.7, 4.7, 4.5, 4.5, 4.6 (the source tags the first three 4.9; lesson 4.7 teaches oxidation numbers and what is oxidized and reduced). Question 2's agents become its last part, with `beyond`; question 3 carries `beyond`.

**Worksheet 4** (`u04-ws4.tex`):

```yaml
---
title: "Worksheet 4: A long free-response question, and redox practice"
kind: worksheet
order: 5
topics: ["4.2", "4.3", "4.5", "4.7"]
summary: One 10-point free-response question on a precipitation, from net ionic equation to particle drawing, with its scoring rubric, then a short question on a redox reaction.
points: 10
---
```

`<Question number={1} title="Lead(II) nitrate and potassium iodide" topic="4.2, 4.3, 4.5" points={10}>` with parts a to f and a `<Rubric>` of six lines, (a) 1, (b) 2, (c) 2, (d) 2, (e) 2, (f) 1, keeping "comparing raw moles earns 0" for (c). `<Question number={2} title="A redox reaction" topic="4.7">` with parts a to c and no points; 2(c) carries `beyond`. Take each question's title from what it is about if these do not fit.

### Task 2: Finish the conversion of Group B

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 4's paths: copy the four files in; build and test once under the lock; audit each worksheet (`node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit04-chemical-reactions/worksheets/u04-wsN.tex" src/content/practice/unit-4/<name>.mdx "<scratch>/unit4-practice/expected/<name>.json"`) to `0 unexplained, 0 stale`; measure each page at 412, 390, 360 and 320 px with every answer open, and name any equation that scrolls in its box; one fact-check per worksheet (`scratchpad/unit4-practice/factcheck-brief.md`).

The fact-check brief is Unit 1's with Unit 4's paths and these additions:

- **Balance every equation on the page**, in atoms and in charge, including each wrong option and each unfinished step; check every state symbol and that the spectator ions are exactly the ones that cancel; say for each reaction whether it is real and goes as written (a lookup is allowed for that).
- **The one solubility rule:** report any question that needs a solubility or an acid's strength it does not give.
- **No ruling on dissolving.** Report any sentence, answer or rubric line that settles whether dissolving a salt is physical or chemical.
- **Every oxidation number** by lesson 4.7's six rules in order; every count of electrons lost and gained.
- **Recompute every number** from the exam table's masses, unrounded; for a titration, the route through moles and the ratio of the balanced equation.
- **Points to look at** (the checker decides):
  - Worksheet 1, question 1: each classification by lesson 4.4's test (bonds broken or formed); question 2 and the two arguments; question 3: which observations are evidence and why each alone can mislead (lesson 4.1); questions 4 and 5: the counts; question 6: the two errors.
  - Worksheet 2, question 1: whether any of the three reactions is more than one kind; questions 2 and 3: what is written whole, with the added solubilities and strengths; question 4: why two acids give different net ionic equations; question 5: the products, and "no reaction" for a pairing the rule clears only because the stem says so; 6(a)'s label; 6(b)'s list against lesson 4.2's; question 7.
  - Worksheet 3, question 1: all six oxidation numbers; question 2: what is oxidized and reduced, named as the reactant that holds the atom; question 3 and its label; questions 4 and 5: every amount, the limiting reactant found by the lesson's routine; question 6: both titrations by moles, and the acid with two protons.
  - Worksheet 4, question 1: every part, the rubric's six lines against the answers, the note "comparing raw moles earns 0", and the drawing's counts (14 ions still dissolved at the scale given); question 2 and its label.

Differences the audit is expected to print: the Quick review left out of each worksheet; the figure's drawing code in Worksheet 1; added solubilities, strengths and state symbols; "oxidation number" for "oxidation state"; Worksheet 3, question 2's new part; Worksheet 4's rubric (0 rubric lines in the source, 6 on the site).

### Task 3: Open pull request B

- [ ] **Decide each fact-check finding** (recomputing any correction to a number); one fixer per worksheet for the accepted ones, each bringing its audit back to clean; build, test, audit and **measure again**; a second fact-check of all four pages; last fixes; measure again.
- [ ] **Commit** (`feat(practice): add Unit 4 worksheets 1 to 4`), push, open the pull request with base `main` (`feat(practice): Unit 4 worksheets 1 to 4`), and watch its check on GitHub until it passes.

The body gives each document's questions and points, each audit's last line, what the fact-checks found, the labels, the models used, test and build output, and, set apart, **every change to the originals**, for the teacher to accept or reverse.

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-4-practice-ladders-frq`, from `topic/unit-4-practice-worksheets`. The two drafts may be written in the scratch folder while Group B is checked, then copied in.

### Task 4: Convert the skill ladders and the free-response set

**Skill ladders** (`u04-selfstudy.tex`), modeled on `src/content/practice/unit-3/skill-ladders.mdx` and its source:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["4.2", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9"]
summary: Twelve skills, one at a time. Each has a worked example, then four questions of the same kind to try on your own. Start here, before the worksheets.
---
```

- The introduction comes from "How to use these notes": how a ladder works; the unit's habits; the one-sentence scope note.
- Twelve sections, `## Ladder 1: Balancing equations` to `## Ladder 12: Balancing redox in acid`, titles as in the source in sentence case ("Physical versus chemical change" becomes "Physical and chemical change"; "Acid--base reactions" takes an en dash). Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder, from each ladder's `\ced` tag, corrected to the lesson that teaches it: balancing 4.2; net ionic 4.2; physical and chemical 4.4; mole-to-mole 4.5; limiting reactant 4.5; percent yield 4.5; solution stoichiometry 4.5; titration 4.6; reaction types 4.7; acid–base 4.8; oxidation numbers 4.7; balancing redox in acid 4.9. The `topics` list above follows; add 4.1 or 4.3 only if a ladder tests it.
- Ladders 2, 3, 4, 7, 8, 9, 10, 11 and 12 as "What Unit 4 adds" says.
- **Leave out** "Where you stand"; keep its advice as `## If you missed some`.

**Free-response set** (`u04-frq.tex`), modeled on `src/content/practice/unit-3/free-response-set.mdx`:

```yaml
---
title: "Free-response set"
kind: free-response
order: 6
topics: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9"]
summary: Five free-response questions on all of Unit 4, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

| Number | `topic` | `points` | Rubric lines |
|---|---|---|---|
| 1 | 4.2, 4.3, 4.5, 4.7 | 10 | 2, 3, 2, 2, 1 |
| 2 | 4.6, 4.9 | 10 | 2, 3, 3, 2 |
| 3 | 4.4 | 4 | 3, 1 |
| 4 | 4.6, 4.8 | 4 | 2, 2 |
| 5 | 4.1, 4.3 | 4 | 2, 2 |

- Each question's `title` is the description in its `\frq{...}` line, in sentence case.
- Question 3's 3-point line may become three 1-point lines if the key names what earns each; the line for dissolving follows "Dissolving a salt".
- Scoring notes ("earns 1", "caps this at 2", "earns 0 for the second point") are copied as the source has them.

**Points to look at in the fact-check:** every equation balanced, with state symbols; Ladder 2(d)'s condition; Ladder 3 and the two arguments on dissolving; Ladder 4's carried 1.999 mol and "about 1 to 8"; Ladder 5's routine; Ladder 6's 80.0 percent from the stated 22.5 g; Ladder 7's combined volume and its sentence; Ladder 8's equivalence point and the acid with two protons; Ladder 9's added solubilities and "more than one kind"; Ladder 10's strengths and conjugate pairs; Ladder 11's six rules in order and every oxidation number; Ladder 12's half-reactions against the source's balanced equations; free-response 1(c) (2.305 g) and 1(d); 2(b)'s half-reactions and its rubric note; 2(c) and the ratio; 3 and its rubric; 4(a) (0.115 M) and 4(b); 5(b)'s counts (6 CO₂, 9 H₂O and 1 ethanol left).

### Task 5: Finish Group C

- [ ] **Finish as Tasks 2 and 3 do** (the ladders' first fact-check may be split between two checkers, six ladders each). Expected audit differences: the tick table left out; added state symbols, solubilities and strengths; the half-reactions of Ladder 12 and free-response 2(b); the scope notes' wording; 2.305 and 0.01125.

With all six documents in place, check by hand: each Unit 4 lesson's "Practice next" lists the documents that have a question on its topic; the unit page lists the six in the order of the table "The six documents"; "oxidation state", "electrolyte", "titre", "diprotic" and "formula equation" occur nowhere under `src/content/practice/unit-4`; no equation given as an answer lacks a state symbol.

- [ ] **Commit** (`feat(practice): add the Unit 4 skill ladders and free-response set`).

### Task 6: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Update the local `CLAUDE.md` (not committed).
- [ ] Commit (`docs: record how the Unit 4 practice was built`), push, open pull request C with base `main` (`feat(practice): Unit 4 skill ladders and free-response set`), watch its check on GitHub until it passes, and leave it for the teacher.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The six documents | 1, 4 |
| 2. What is left out | Guide additions; 1, 4 |
| 3. Conversion, audit, two fact-checks, corrections recomputed, scoring notes | 2, 3, 5 |
| 4.1 What a question must supply | Guide additions; 1, 4 |
| 4.2 Excluded by the framework | Guide additions; 1 |
| 4.3 Dissolving a salt | Guide additions; 1, 4 |
| 4.4 The lessons' rules and terms | Guide additions; 1, 4 |
| 4.5 Two volumes | Guide additions; 4 |
| 4.6 Numbers | Facts, 8; Guide additions |
| 4.7 Drawings | Guide additions; 1 |
| 4.8 Wording | Guide additions |
| 5. Code | None |
| 6. Pull requests | A, 3, 6 |
| 7. Done when | 2, 3, 5, 6 |
