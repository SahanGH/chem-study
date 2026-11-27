# ChemStudy Unit 9 Practice Implementation Plan

**Goal:** Put the teacher's Unit 9 practice on chem-study.com: five worksheets, the twelve skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: seven MDX files in `src/content/practice/unit-9/`, converted by hand from the LaTeX in the AP Chem repository and checked by `scripts/practice-audit.mjs`. One code change: a word in the spelling list.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-9-practice-design.md`.

**Builds on:** Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`), whose sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise; and on Unit 6's practice (`2026-11-27-chemstudy-unit-6-practice.md`), whose lessons are written into this plan.

## Facts verified before writing (do not rediscover)

Established on 2026-11-27. The research behind them is in the session scratch folder: `scratchpad/unit9-practice/research.md` (twelve sections, with file and line for each fact), `recompute.py`, `balance.py`, `counts.py`, `overlap.py` and their outputs, and `carried.py`, which multiplies out every value this plan names.

1. **The sources** (read-only), in `/home/user/sahangh/ap_chem_prep/Units/unit09-thermodynamics-electrochemistry/`: `worksheets/u09-ws1.tex` to `u09-ws5.tex`, and one level up `u09-selfstudy.tex` and `u09-frq.tex`. **Never open `exam/`, nor any file with "exam" or "test" in its name.** There are no key PDFs on this machine; each `.tex` holds its answers.
2. **Counts.** Worksheet 1: 8 questions, 18 parts; Worksheet 2: 8 and 21; Worksheet 3: 11 and 24; Worksheet 4: 9 and 31; Worksheet 5: 9 and 23 (the last question scored, 10 points, parts a to f). The ladders: 12 worked examples and 48 questions. The free-response set: 5 questions, 14 parts, 32 points (10, 10, 4, 4, 4), 50 minutes, calculator allowed.
3. **`\ced{9.N}` inside the `\problem[]{…}` text carries the topic**; the free-response set carries the tags in its `\frq{...}` lines. Every worksheet question has a tag.
4. **No figure in any source**, and no question asks for a drawing. Two questions are lines of blanks that a source calls a table (Worksheet 2, question 1; Worksheet 4, question 9).
5. **Rubrics.** Worksheet 5, question 9: a boxed note of six items, (a) 2, (b) 2, (c) 1, (d) 2, (e) 2, (f) 1. The free-response set: 14 `\rpoint` lines; question 1: 3, 2, 3, 2; question 2: 3, 2, 3, 2; questions 3, 4 and 5: 2, 2 each.
6. **Every worksheet ends with a `spiralstrip`** (left out; the audit counts it as a question, so each worksheet's source has one more than its page). **Three `\wsheader` strips hold data the questions need**: Worksheet 1 (eleven S° values), Worksheet 4 (eight E° values, written as couples) and Worksheet 5 (three E° values, three molar masses, F). In the ladders `\selfcheck` holds the one-line answers and the key-only `apcanswer` the explanations; the questions print as 1 to 4 and are keyed (a) to (d).
7. **What a practice page can hold.** `src/pages/[unit]/practice/[name].astro` supplies `Answer`, `Blank`, `Figure`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`. `Question` and `Part` take `beyond`; `Worked` does not, so inside a worked example or an answer the label is a sentence that begins `**Beyond the exam:**`. A document's `topics` may name only topics of its own unit. The build check needs a non-empty `<Answer>` in every question or part, rubric lines that sum to the question's `points`, and document `points` equal to the sum of its questions'.
8. **The unit on the site.** Unit 9's slug is `unit-9-thermodynamics`. The practice route needs a lesson in the unit: on 2026-11-27 `main` holds none (lessons 9.1 to 9.7 are on topic branches), so pull request B waits for the first Unit 9 lessons to be merged. A question's `topic` links to its lesson only once that lesson exists; a page builds without the link.
9. **Numbers** (recomputed by `carried.py`; F = 96,485 C/mol, R = 8.314 J/(mol·K), T = 298 K).
   - *Wrong in the sources:* Worksheet 5, question 5: 3,600 ÷ 96,485 = 0.037311 mol; × 107.87 = 4.0248 g, **4.02 g** (source 4.03). Ladder 6(a): −15,000 ÷ (8.314 × 298) = −6.0543; e^−6.054 = 2.348 × 10⁻³, **2.3 × 10⁻³** (source 2.4 × 10⁻³).
   - *Nickel at −0.25 V:* Worksheet 4, 4(c): −0.25 − (−0.76) = **+0.51 V** (source +0.53 with −0.23). Ladder 9(a): 0.80 − (−0.25) = +1.05 V and Ladder 10(a): −(2)(96,485)(1.05) = −202,618.5 J, −203 kJ: both unchanged.
   - *Carried values:* Worksheet 2, 2(b): 298 × 0.161 = 47.978; 178.5 − 47.98 = 130.52, +131 kJ. Worksheet 5, question 7: 5.00 ÷ 63.55 = 0.078678, shown 0.07868 mol; × 2 = 0.15736 mol; × 96,485 = 15,182.9, shown 15,183 C; ÷ 2.00 = **7,591.5 s exactly, a tie** (a whole number would be 7,591 or 7,592; unrounded 7,591.3 s): print 7,591.5 s; ÷ 3,600 = 2.1088, 2.11 h. Ladder 10's example: −(2)(96,485)(0.78) = −150,516.6, shown −150,517 J, −151 kJ. Ladder 12's example: 9,000 ÷ 96,485 = 0.093279, shown 0.09328 mol; ÷ 2 = 0.04664 mol; × 63.55 = 2.9640, 2.96 g. Ladder 6's example: 20,000 ÷ (8.314 × 298) = 8.0724, shown 8.072; e^8.072 = 3,203.5, 3.2 × 10³.
   - *Added values:* Worksheet 3, question 4: K = e^−8.072 = 3.1 × 10⁻⁴. Free-response 2(b)'s rubric: −(2)(96,485)(1.26) = −243,142 J, −243 kJ. Free-response 2(c) with the silver ion not squared: Q = 10 and E = 0.46 − 0.0296 = 0.43 V.
   - *Unchanged, and each follows from its printed step:* Worksheet 1, question 6: +161, −199, +119, −176, −327 J/K; question 7: −130 and −199. Worksheet 2: 3(a) −92 + 59 = −33 kJ (unrounded −32.7); 2(c) 1,108.7, 1,109 K, 836 °C; 3(b) 462.3, 462 K; question 4: 369.7, 370 K, 97 °C; question 5: 178.5 − 47,978 = −47,799.5, "−47,800"; 6(b) −474 kJ; 6(c) −572 + 97.4 = −474.6, −475 kJ. Worksheet 3: −16.7 and +7 kJ. Worksheet 4: +1.10, +1.56, +2.71, +0.78, +0.93, +0.46, −0.34 V; 8(a) −212,267 J, −212 kJ; 8(b) −88,766.2 J, shown −88,766 J, −89 kJ. Worksheet 5: 6(a) 0.0560 and 0.0280 mol, 1.78 g; 6(b) 3.56 g; 9(c) +1.56 V; 9(d) −301,033.2 J, shown −301,033 J, −301 kJ. Ladders: +3.0 J/(mol·K); −160; −33.0 kJ (298 × 0.1987 = 59.2) and "about +59,100"; −79.8 kJ; 1,110 K and +130 kJ (130.44); 500 K; 0.0081 and 1.008; −35, −25, +25 kJ; +0.78 V; 1.16, 1.04 and 0.74 V; 1,800 C, 0.0187 mol, 2.01 g. Free response: 44.7 and +50.3 kJ/mol; "about −44,600" (−44,605); 633 K; −10.0 kJ/mol; ln K = 1.718, K = 5.6; +0.46 V, −8.9 × 10⁴ J, −89 kJ; Q = 1.0 × 10³, 0.0888, 0.37 V (0.3713 V by the equation sheet's form); 0.01866 mol, 2.01 g; −33 kJ/mol.
   - *In prose, for the fact-checkers:* Worksheet 3, question 2: K is 7.5 for −5 kJ and 5.8 × 10⁸ for −50 kJ. Worksheet 2, 3(d): ΔG° at 700 K is +47 kJ with the question's values. H₂ + Cl₂ → 2HCl: 2(186.9) − (130.7 + 223.1) = +20.0 J/K, from standard entropies written from memory.
10. **Equations.** All 42 that hold an arrow balance in atoms and charge; three are inside review strips. **Twelve have no state symbols**: Worksheet 4, lines 59, 78, 94 and 119; Worksheet 5, lines 82 and 90; the ladders, lines 212, 665, 671, 690 and 693; the free-response set, line 137. Graphite is written C(s) in Ladder 2. Worksheet 1's strip gives no state for nine of its eleven formulas.
11. **Values that differ between sources or from the lessons, and stay** (design, 4.1). Do not "correct" any of them: Worksheet 1's whole-number S° values; Ladder 2's O₂ 205.0 and CO₂ 213.7 beside Worksheet 1's 205 and 214; −237 kJ/mol; ammonia as −92 and −199 (Worksheet 2) and as −92.2 and −198.7 (Ladder 3); calcium carbonate as +178.5 and +161 (Worksheet 2: +131 kJ, 1,109 K) and as +178.3 and +160.6 (Ladder 4: +130 kJ, 1,110 K); water's +44 kJ and +119 J/K at 25 °C beside Unit 6's 40.7 kJ/mol at 100 °C. **Nickel is the one value that changes** (−0.23 to −0.25 V in Worksheet 4).
12. **British spellings.** `scripts/us-spelling.mjs` finds 63 in the seven sources (favourable and its family 54, labelling 4, aluminium 3, behaviours 1, vapour 1) and misses "jewellery" (Worksheet 2, line 113).
13. **The lessons' rules and terms** (`docs/superpowers/specs/2026-11-27-chemstudy-unit-9-lessons-design.md`, section 3; the lessons in `src/content/lessons/unit-9/` as they are merged):
    - "Thermodynamically favored" and "unfavored"; a term of the equation "works for" or "works against"; no "favorable" and no "spontaneous" (lesson 9.3 has the one sentence).
    - 9.1: entropy as how widely matter and energy are spread; no "disorder"; count the gas first, and where the moles of gas do not change ΔS° is small and its sign needs the table.
    - 9.2: entropy has a true zero; an element's S° is not zero; products minus reactants with coefficients; the law is not named.
    - 9.3: the entropy term is turned into kilojoules on a line of its own; the four combinations are read off the equation; the temperature where ΔG° = 0 has no name; ΔH° and ΔS° are taken as constant; no entropy of the surroundings beyond two labeled sentences.
    - 9.4: favored is not fast; a catalyst changes neither ΔG° nor K; heating raises the share of collisions with enough energy and also changes K.
    - 9.5: ΔG° = −RT ln K in joules; a positive ΔG° still gives some product; ΔG without the circle is one "Beyond the exam" paragraph; no K for a change among pure solids (diamond).
    - 9.6: dissolving as three changes, each with two signs; water held around an ion loses entropy; the total ΔS° can be negative (MgSO₄, −209.6 J/(mol·K)); the total is not predicted from scratch.
    - 9.7: energy from outside, or a favored reaction that shares a substance; ΔG° values add; ATP is not "energy stored in a bond", and the phosphate group is handed over directly.
    - 9.8: oxidation at the anode in every cell; anions toward the anode; no electrode has a sign.
    - 9.9: E°cell = E°cathode − E°anode, both read unchanged; a potential is energy per unit of charge and is never multiplied; ΔG° = −nFE°, rounded to the kilojoule; the names "oxidizing agent" and "reducing agent" are not used.
    - 9.10: argue through Q, never "the equilibrium shifts"; a run-down cell has Q = K and E = 0; no "dead battery"; no "driving force" as a quantity; the Nernst equation as the sheet prints it, read for direction.
    - 9.11: charge is $q$; a chain of four steps, not a formula.

## Conventions for every task

Plan 3's "Conventions for every task" apply, with this session's paths: the site is `/home/user/chem-study`; the sources are read-only; everything that is not the site goes in the scratch folder `scratchpad/unit9-practice/`; conventional commits, with the trailers the session's instructions give; American English (`CLAUDE.md`; the spelling check does not read `docs/superpowers/`, so the writer of a design or plan keeps the rule); no swallowed errors.

**Merging.** Claude merges each pull request when its "Build and test" check passes on GitHub. The teacher said to merge everything.

**Models.** Writers and fact-checkers on the strongest model (Fable). Fixers that apply a decided list, and the review of the spelling change, on Sonnet. Inventories and searches on Haiku. No originality check of the pages. **Only the controller builds, tests, commits, opens pull requests and merges**; every other agent writes files in the scratch folder.

**Learned on earlier units, and binding here:**
- A correction to one of the teacher's numbers, and every carried value, is multiplied out by the controller in a script before it goes into a decided list or a pull request. Fact 9 holds the ones known today. A writer or fixer that believes an item is wrong does not apply it and says why.
- A calculation inside a part's answer has room for about 25 characters on a 320 px phone. Every display longer than that is split with `aligned`. Measure every page after every round of fixes.
- The audit reads any number in the page as a number, a spacing argument such as `[0.6em]` included: do not use one.
- Thousands carry a comma (`96{,}485` in math, 96,485 in text) and "size" stands for "magnitude", from the first draft.
- The second fact-check is told to treat every sentence as new and to apply each rule the page states, exactly as worded, to every example on the page.
- A replacement sentence with "only", "always" or "never" in it gets the same test as the original before it goes into a decided list.
- A summary is counted against the schema's 200 characters and a title against its 80. Those below were counted.

**The briefs** are Unit 6's (`scratchpad/unit6-practice/writer-brief.md`, `factcheck-brief.md`, `fixer-brief.md`), copied to `scratchpad/unit9-practice/` with Unit 9's paths, this plan's sections in place of Unit 6's, `scratchpad/ced/unit9-framework.md` as the framework summary, and the additions under Task 2.

## What Unit 9 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Equations.** Every equation is `\ce{...}` in display math, split at the arrow with `aligned` when it is longer than about 25 characters. Every equation, half-reactions included, carries a state symbol on every species; where the source's has none, add them, and report each one you add. Graphite is `C(s, graphite)`. Two half-reactions never share a line. A ΔH° or ΔS° beside an equation stays in kJ or J/K where the source has it so, and each introduction that has one says once: "A ΔH° or ΔS° written beside an equation is for the equation as written."

**Values a question uses** (design, 4.1). A `\wsheader` strip becomes the introduction: the relationships as display math, then "Use these values" as a two-column table, every value kept as the source has it apart from nickel. Do not change a value to match a lesson or another page.
- Worksheet 1: eleven rows, formula with its state and S° in J/(mol·K): H₂(g) 131, O₂(g) 205, N₂(g) 192, H₂O(l) 70, H₂O(g) 189, NH₃(g) 193, NO₂(g) 240, N₂O₄(g) 304, CaCO₃(s) 93, CaO(s) 40, CO₂(g) 214.
- Worksheet 4: eight rows, each a half-reaction written as a reduction with states, highest potential first: Ag⁺ +0.80, Cu²⁺ +0.34, 2H⁺/H₂ 0.00, Pb²⁺ −0.13, **Ni²⁺ −0.25**, Fe²⁺ −0.44, Zn²⁺ −0.76, Mg²⁺ −2.37 V. Then F.
- Worksheet 5: the three potentials (Ag⁺ +0.80, Cu²⁺ +0.34, Zn²⁺ −0.76 V) as half-reactions, the molar masses of Ag (107.87), Cu (63.55) and Al (26.98 g/mol), and F.
- Worksheets 1 and 2 and the ladders say that tables round a little differently, so a question's own values are the ones to use. Worksheet 2's introduction keeps "take T = 298 K unless told otherwise" and adds that ΔH° and ΔS° are taken as the same at every temperature.
- The free-response set's introduction lists R, F, the two reduction potentials and the molar mass of silver, 107.87 g/mol.

**Outside the exam** (design, 4.2). The label goes on the smallest piece.
- Nernst calculations: `beyond` on Ladder 11(c) and on free-response 2(c); a `**Beyond the exam:**` sentence opening the calculation in Ladder 11's worked example ("the exam asks which way the potential moves, not for this number").
- ΔG without the circle: `beyond` on Worksheet 3, parts 3(a) to 3(d) and 5(d); `**Beyond the exam:**` sentences in the answers of 3(e) and of question 4.
- The second law: `beyond` on Worksheet 1, parts 4(a) and 4(b).
- "State function": one `**Beyond the exam:**` sentence in Ladder 8(d)'s answer.
- Electrode signs and the two "agent" names stay unlabeled (Worksheet 4, 1(d) and question 7); Worksheet 4's introduction says: "Part 1(d) is about the signs of the electrodes and question 7 uses the names 'oxidizing agent' and 'reducing agent'. The AP exam tests neither the signs nor the names."
- The scope notes of the ladders and the free-response set become one sentence of each introduction: "Which electrode is positive and which is negative is not on the AP exam, and nothing here asks for it."

**The lessons' terms** (design, 4.3). Apply everywhere, in stems, answers, titles and rubric lines:

| Source | Site |
|---|---|
| favourable, favorable, favourability, favours; unfavourable | "thermodynamically favored" at first use in an answer, then "favored"; "unfavored", "not favored". For a term of ΔG° = ΔH° − TΔS°: "works for", "works against" |
| spontaneous, spontaneity | favored |
| disorder, disordered, ordered | spread, dispersed, "fixed places in the crystal", "ways to be arranged" |
| crossover temperature | "the temperature at which ΔG° = 0", "where ΔG° changes sign" |
| driving force | "further from equilibrium, so the potential is larger" |
| a "dead" battery or cell; "the cell dies" | "a cell that has run down"; "the cell stops" |
| intensive | drop the word, keep the reason: a potential is energy per unit of charge, 1 V = 1 J/C |
| kinetically stable, kinetically blocked | under kinetic control |
| "the more positive potential is reduced"; "preferentially reduced" | "the half-reaction with the higher reduction potential is the reduction" |
| Q = It; n(e⁻), n(Cu), n(Ag) | $q = It$; "moles of electrons", "mol Cu", "mol Ag" |
| ΔG, ΔH, ΔS where a standard value is meant | ΔG°, ΔH°, ΔS° |
| the Daniell cell; the Haber process; the ammonia synthesis | "the zinc and copper cell of question 3"; the equation N₂(g) + 3H₂(g) → 2NH₃(g) |
| the CED | "the AP exam", or "topic 9.7's" |
| magnitude | size |
| jewellery, aluminium, petrol vapour, labelling, behaviours, marks | jewelry, aluminum, gasoline vapor, labeling, behaviors, points |
| `10\,000`, 7 %–9 % | 10,000; 7% to 9% |
| "X against Y" in a title; "in hardware"; "and hence K" | "X and Y"; recast; "and from it, K" |

**Wording to recast.** Worksheet subtitles go. "YOUR TURN" is the `label="Your turn"` of the question; "I do:" is dropped. A reference to "problem 2", "the strip" or "above" names the question or the table. Worksheet 5's "FRQ (10 points)" becomes a sentence about the AP exam's long free-response questions. Notes to a grader become rubric lines as "Scoring lines" below words them.

**Left out:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`); the comments at the top of each file.

## The seven documents

| Order | File in `src/content/practice/unit-9/` | Title | Kind | Source |
|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | `u09-selfstudy.tex` |
| 2 | `worksheet-1-entropy.mdx` | Worksheet 1: Entropy | `worksheet` | `worksheets/u09-ws1.tex` |
| 3 | `worksheet-2-gibbs-free-energy.mdx` | Worksheet 2: Gibbs free energy | `worksheet` | `worksheets/u09-ws2.tex` |
| 4 | `worksheet-3-free-energy-k-and-coupled-reactions.mdx` | Worksheet 3: Free energy, K and coupled reactions | `worksheet` | `worksheets/u09-ws3.tex` |
| 5 | `worksheet-4-cells-and-cell-potential.mdx` | Worksheet 4: Cells and cell potential | `worksheet` | `worksheets/u09-ws4.tex` |
| 6 | `worksheet-5-nonstandard-conditions-electrolysis-and-a-free-response-question.mdx` | Worksheet 5: Nonstandard conditions, electrolysis, and a free-response question | `worksheet` | `worksheets/u09-ws5.tex` |
| 7 | `free-response-set.mdx` | Free-response set | `free-response` | `u09-frq.tex` |

The longest title is 79 characters. Only Worksheet 5 (`points: 10`) and the free-response set (`points: 32`, `minutes: 50`) are scored.

**Topics.** A question's `topic` names each lesson that teaches one of its parts. A part that only names a neighboring topic's idea and is answered from the question's own lesson does not add a topic (Worksheet 1, 2(b), the dissolving salt; Worksheet 4, 2(d), topic 9.7's strategy); its answer names the neighbor in a clause. A document's `topics` is the union of its questions'. The fact-check settles each list.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-9-practice-design`, from `main`. This plan and the design. Commit `docs: add the Unit 9 practice design and plan`; merge when the check passes.

---

## Group B: Worksheets 1 to 5 (pull request B)

Branch `topic/unit-9-practice-worksheets`, from `main` once pull request A and the first Unit 9 lessons are merged (fact 8).

### Task 1: Convert Worksheets 1 to 5

One writer per worksheet, in parallel, writing files only, into `scratchpad/unit9-practice/staging/`, with its audit's expected file in `scratchpad/unit9-practice/expected/` (a seed for each page is there already: the differences this plan can foresee, in the audit's own wording; the writer runs the audit, adds what it prints and removes what it calls stale). Each writer gets: `scratchpad/unit9-practice/writer-brief.md`; Plan 3's conversion guide; this plan's "Facts", "What Unit 9 adds" and its own entry below; its source `.tex`; a finished worksheet as the model (`src/content/practice/unit-6/worksheet-2-calorimetry-and-phase-changes.mdx`; for Worksheet 5's scored question, `unit-6/worksheet-4-bond-and-formation-enthalpies-and-a-long-free-response-question.mdx`, question 8; for a part with `beyond`, `unit-6/worksheet-3-enthalpy-of-reaction-and-hesss-law.mdx`, question 3); and the Unit 9 lessons that exist, for the terms.

**Worksheet 1** (`u09-ws1.tex`):

```yaml
---
title: "Worksheet 1: Entropy"
kind: worksheet
order: 2
topics: ["9.1", "9.2", "9.3"]
summary: Eight questions on what entropy measures, predicting the sign of an entropy change from the moles of gas, and calculating ΔS° from standard entropies.
---
```

Eight questions, topics 9.1, 9.1, 9.1, "9.1, 9.3", 9.2, 9.2, 9.2 and "9.1, 9.2". Titles: What entropy measures; The sign of an entropy change; When the moles of gas do not change; Entropy of the system and of the surroundings; Entropy's true zero; Entropy changes from a table; A sum with two errors; Predictions and values.

Changes to the source, all of them:
- **2(b)** keeps "+; the crystal disperses" and adds a clause: topic 9.6 looks at what the water around the ions does.
- **2(e)**: "small; 2 mol of gas to 2 mol" for "≈ 0".
- **Question 3** names question 2's part e and its equation. In the answer, "a few J/K either way" becomes "small beside the other values on this page: about +20 J/K, from a table". The rest stays.
- **Question 4.** Parts a and b carry `beyond`. Part a: "The second law of thermodynamics says what every favored process does to the entropy of the universe. State it as an inequality." Part b keeps the source's answer and adds: "The exam's own reasoning gives the same result: freezing has ΔH° < 0 and ΔS° < 0, so ΔG° = ΔH° − TΔS° is negative at low temperature, here below 0 °C." Part c, unlabeled: "True or false: a process whose own entropy change is negative (ΔS° < 0) can never be thermodynamically favored." Answer: false; with ΔH° < 0, ΔG° is negative at a low enough temperature, and water freezing below 0 °C is one such process.
- **Question 5** names no law. In 5(b), "The third law gives entropy a true zero" becomes "Entropy has a true zero, a perfect crystal at 0 K".
- **Question 6**: each answer shows its sum; the two the source gives as a bare value are (c) 189 − 70 = +119 and (d) 304 − 2(240) = −176 J/K.
- **Question 7** gives the equation N₂(g) + 3H₂(g) → 2NH₃(g) in its stem and does not say "the Haber process".
- **Question 8** becomes: "For each of the five reactions of question 6, predict the sign of ΔS° from the change in the moles of gas. Then compare each prediction with the value you calculated. What does this confirm?" Answer: the moles of gas change by +1, −2, +1, −1 and −3, and the values are +161, −199, +119, −176 and −327 J/K, so all five signs agree; where the moles of gas change, that settles the sign with no table, "which is why a question can ask for the sign and give no data". "No-calculator multiple-choice" goes.

**Worksheet 2** (`u09-ws2.tex`):

```yaml
---
title: "Worksheet 2: Gibbs free energy"
kind: worksheet
order: 3
topics: ["9.3", "9.4"]
summary: Eight questions on ΔG° from ΔH° and ΔS°, the four combinations of signs, the temperature where ΔG° changes sign, and why a favored reaction can be too slow to see.
---
```

Eight questions, topics 9.3, 9.3, "9.3, 9.4", 9.3, 9.3, 9.3, 9.4, 9.4. Titles: The four combinations of signs; Calcium carbonate in a kiln; Making ammonia; Water and its vapor; An answer of −47,800 kJ; Two routes to ΔG°; Favored is not fast; A favored reaction with no rate.

Changes to the source, all of them:
- **Question 1**: "Complete each line without calculating." Part e: "For which two combinations is there a temperature at which ΔG° changes sign, and why?"
- **2(b)**: the display shows 298 × 0.161 = 47.98 kJ on a line of its own, then 178.5 − 47.98 = 130.52, given as +131 kJ, not favored. **2(c)** and **3(b)**: "the temperature at which ΔG° = 0"; 2(c) keeps 1,109 K and 836 °C.
- **Question 3** opens with the equation. **3(a)** keeps −92 + 59 = −33 kJ. **3(d)**: "Use what Unit 5 taught about rates." Its answer has "gives up some of how far the reaction goes in exchange for rate" for "sacrifices thermodynamic favorability for rate", and gains: "Above that temperature ΔG° is positive and K is less than 1, which means less product at equilibrium, not none (topic 9.5)."
- **Question 4**: "Calculate the temperature at which ΔG° = 0 and say what that temperature is." The answer keeps 370 K, 97 °C and "the normal boiling point", and its last sentence becomes: "The measured value is 373 K. The gap is not rounding: these values of ΔH° and ΔS° are for 25 °C, and both change a little by 100 °C (there the enthalpy of vaporization is 40.7 kJ/mol, the value topic 6.5 uses)."
- **Question 5** names the reaction and data of question 2. "The size is the giveaway."
- **Question 6**, part c: "ΔH° − TΔS° gives −475 kJ, from ΔH° = −572 kJ and ΔS° = −327 J/K." No "Route 1".
- **7(b)**: "jewelry". The answer says "under kinetic control". **7(d)**: "Can a catalyst make a thermodynamically unfavored reaction favored?"

**Worksheet 3** (`u09-ws3.tex`):

```yaml
---
title: "Worksheet 3: Free energy, K and coupled reactions"
kind: worksheet
order: 4
topics: ["9.5", "9.6", "9.7"]
summary: Eleven questions on what the sign and size of ΔG° say about K, the enthalpy and entropy changes of dissolving a salt, and driving an unfavored reaction by coupling.
---
```

Eleven questions, topics 9.5 for questions 1 to 5, 9.6 for 6 to 8, 9.7 for 9 to 11. Titles: ΔG° and K; Two reactions compared; ΔG and ΔG°; A positive ΔG°; Fixed, or set by the mixture; The parts of dissolving; Ammonium nitrate; Why the total is hard to predict; Driving an unfavored process; ATP and glucose; A coupling that fails.

The introduction gives ΔG° = −RT ln K and R, says that ΔG° goes in as joules, and says: "Question 3 and part 5(d) use ΔG without the circle, the free energy change of a mixture as it is now: ΔG = ΔG° + RT ln Q. It is not on the AP exam or its equation sheet, and those parts are labeled."

Changes to the source, all of them:
- **Question 3**: parts a to d carry `beyond`. Part e is unlabeled, and its answer is: "At equilibrium Q = K. ΔG° does not change as a reaction runs: it is fixed for the reaction at that temperature, and ΔG° = −RT ln K makes it zero only in the special case K = 1." Then: "**Beyond the exam:** what is zero at equilibrium is ΔG, without the circle. Setting ΔG = 0 and Q = K in ΔG = ΔG° + RT ln Q gives ΔG° = −RT ln K."
- **Question 4**: the answer is: "A positive ΔG° means K is less than 1, not zero. At 298 K, ΔG° = +20 kJ gives K = 3.1 × 10⁻⁴. A mixture with little or no product has Q below K, so the reaction runs forward until Q = K. It stops with mostly reactants, but it does proceed." Then: "**Beyond the exam:**" and the source's sentence about RT ln Q.
- **5(d)** carries `beyond`.
- **Question 7**: "ions fixed in a crystal become hydrated ions that move freely through the solution" for "an ordered crystal…"; "ΔS° is positive, and large enough that" for "strongly positive"; "the entropy term outweighs the enthalpy term here" for "Entropy is driving this one".
- **Question 8**: "The AP exam does not ask you to predict the overall ΔG° of dissolving from scratch." The answer says "the contributions largely cancel", not "the three contributions".
- **Question 9** and **question 11**: "unfavored" and "favored". 9(d)'s second blank keeps "common intermediate".
- **Question 10**: the stem gives both equations in words, each with its ΔG°: glucose + phosphate → glucose 6-phosphate + H₂O, +13.8 kJ/mol; ATP + H₂O → ADP + phosphate, −30.5 kJ/mol. Part a's answer shows the sum, glucose + ATP → glucose 6-phosphate + ADP, −16.7 kJ/mol. Part b's answer: "Phosphate: one equation makes it and the other uses it, so it cancels from the sum (water does too). In a cell no free phosphate is made: the group passes straight from ATP to glucose." Part c: "favored enough" for "favorable enough".

**Worksheet 4** (`u09-ws4.tex`):

```yaml
---
title: "Worksheet 4: Cells and cell potential"
kind: worksheet
order: 5
topics: ["9.8", "9.9", "9.10"]
summary: Nine questions on the parts of a galvanic cell, galvanic and electrolytic cells, standard cell potentials from a table, and ΔG° from a cell potential.
---
```

Nine questions, topics 9.8, "9.8, 9.9", "9.8, 9.9", 9.9, 9.9, 9.9, 9.9, 9.9 and "9.9, 9.10". Titles: Parts of a galvanic cell; Galvanic and electrolytic cells; Zinc and copper; Five cell potentials; Copper and silver ion; Copper in hydrochloric acid; The table as a ranking; ΔG° from a cell potential; One fact, three ways.

Changes to the source, all of them:
- **The table of values has nickel at −0.25 V** (source −0.23).
- **1(c)**: "the cell stops" for "the cell dies". **1(d)**: "The AP exam does not ask you to label an electrode positive or negative. Why not?" The answer stays.
- **2(d)**: "An electrolytic cell is which of topic 9.7's two strategies?"
- **Question 3**: "a zinc electrode in a solution of Zn²⁺ and a copper electrode in a solution of Cu²⁺". 3(a): "Zinc. Its reduction potential is the lower of the two, so Cu²⁺ is the ion that is reduced and zinc is oxidized." 3(b): Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s).
- **Question 4**: each answer shows the subtraction: (a) 0.80 − (−0.76) = +1.56 V; (b) 0.34 − (−2.37) = +2.71 V; **(c) −0.25 − (−0.76) = +0.51 V (source +0.53)**; (d) 0.34 − (−0.44) = +0.78 V; (e) 0.80 − (−0.13) = +0.93 V.
- **Question 5** and **8(b)**: Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s). 5(b): "A potential is energy per unit of charge (1 V = 1 J/C), so multiplying a half-reaction leaves E° unchanged."
- **Question 6**: Cu(s) + 2H⁺(aq) → Cu²⁺(aq) + H₂(g).
- **7(c)**: "Which metal in the table cannot be oxidized by Ag⁺?" Answer: "None of the other six. Ag⁺/Ag has the highest reduction potential in the table, so Ag⁺ can oxidize copper, lead, nickel, iron, zinc and magnesium."
- **8(a)**: "For the zinc and copper cell of question 3".
- **9(b)**: the third blank reads "and with every concentration at 1 M the cell gives ___". Answer: "no voltage. A cell with E° = 0 can still run when its concentrations differ (Worksheet 5's concentration cell does). A cell that has run down has E = 0, not E° = 0."
- **9(c)**: third blank: "runs only if driven from outside, as an electrolytic cell".
- **9(d)**: "A cell has run down and gives no voltage. Has it used up its reactants? Explain." Answer: "No. It is at equilibrium: Q has risen to K, so E = 0. The reactants are still there, in their equilibrium amounts, and nothing is left to push electrons through the wire." (No ΔG, no "driving force".)

**Worksheet 5** (`u09-ws5.tex`):

```yaml
---
title: "Worksheet 5: Nonstandard conditions, electrolysis, and a free-response question"
kind: worksheet
order: 6
topics: ["9.8", "9.9", "9.10", "9.11"]
summary: Eight questions on how concentration changes a cell's potential and on Faraday's law, then one 10-point free-response question on a zinc and silver cell, with its scoring rubric.
points: 10
---
```

Nine questions, topics 9.10, 9.10, 9.10, 9.11, 9.11, 9.11, 9.11, 9.11 and "9.8, 9.9, 9.10". Titles: A cell's potential as it runs; Changing a concentration; A concentration cell; The chain of Faraday's law; Plating silver; Plating copper; How long for 5.00 g of copper; Aluminum and electricity; A zinc and silver cell. The introduction says: "Nothing on this page needs the Nernst equation. Argue from Q and K."

Changes to the source, all of them:
- **1(b)**: "The cell has run down when ___". **1(c)**: "…the further from equilibrium, the larger the potential."
- **2(d)**: "as a free-response answer needs"; the answer ends "A smaller Q puts the cell further from equilibrium, so E increases." **9(e)** ends the same way round: "nearer equilibrium, so E decreases".
- **Question 5**: **4.02 g** (source 4.03). Four short displays: 1,800 s; 3,600 C; 3,600 ÷ 96,485 = 0.03731 mol of electrons; 0.03731 × 107.87 = 4.02 g. The half-reaction is Ag⁺(aq) + e⁻ → Ag(s).
- **Question 6**: "A current of 1.50 A is passed through a solution of CuSO₄ for 1.00 h." No "the same charge". Cu²⁺(aq) + 2e⁻ → Cu(s). The numbers stay: 5,400 C, 0.0560 mol, 0.0280 mol, 1.78 g; 6(b) 3.56 g.
- **Question 7**: 5.00 ÷ 63.55 = 0.07868 mol Cu; 2 × 0.07868 = 0.15736 mol of electrons; 0.15736 × 96,485 = 15,183 C; 15,183 ÷ 2.00 = 7,591.5 s; ÷ 3,600 = 2.11 h.
- **Question 8**: "aluminum". The answer: "Each mole of aluminum, only 26.98 g, takes three moles of electrons, and reducing Al³⁺ is strongly unfavored, so the supply must push hard. Both make the electrical energy for each kilogram very large. (−1.66 V is the value in water; a smelter works in a melt, because aluminum cannot be plated from water.) Recycling melts aluminum that is already reduced and skips the electrolysis."
- **Question 9**: `points={10}`, parts a to f, and a `<Rubric>` of six lines worded as below. "When the cell has run down" for "is exhausted".

**Scoring lines for Worksheet 5, question 9** (design, 4.7):

| Part | Points | Line |
|---|---|---|
| a | 2 | 1 point for zinc as the anode and silver as the cathode. 1 point for electrons moving through the wire from the zinc electrode to the silver electrode; "from anode to cathode" earns it only when zinc was named as the anode. |
| b | 2 | 1 point for the balanced equation, with Ag⁺ and Ag doubled; state symbols are not needed. 1 point for n = 2, earned only with a balanced equation. |
| c | 1 | +1.56 V. Using 2(0.80) earns 0. |
| d | 2 | 1 point for substituting into −nFE° with n = 2 and the potential from part c, right or wrong. 1 point for the answer in kilojoules: −301 kJ, or the value that follows from the potential used. An answer left in joules, or a joule value labeled kJ, does not earn it. |
| e | 2 | 1 point for saying that Q increases because Ag⁺ is a reactant. 1 point for concluding that the cell potential decreases, earned only with the first point: "decreases" with no reasoning through Q earns 0 of 2. |
| f | 1 | Both E = 0 and Q = K are needed. |

### Task 2: Finish the conversion of Group B

- [ ] **The spelling word.** In `scripts/us-spelling.mjs` add `'jewellery'` to `WORDS`, in its alphabetical place. In `tests/unit/us-spelling.test.ts`, in "finds British spellings of each kind the rule lists", add an expectation that `words('a shop that sells jewellery')` is `['jewellery']`. Run `npx vitest run tests/unit/us-spelling.test.ts`. A Sonnet reviewer reads the two-line diff.
- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 9's paths: copy the five files in; build and test; audit each worksheet (`node scripts/practice-audit.mjs /home/user/sahangh/ap_chem_prep/Units/unit09-thermodynamics-electrochemistry/worksheets/u09-wsN.tex src/content/practice/unit-9/<name>.mdx <scratch>/unit9-practice/expected/<name>.json`) to `0 unexplained, 0 stale`; measure each page at 412, 390, 360 and 320 px with every answer open; one fact-check per worksheet (`scratchpad/unit9-practice/factcheck-brief.md`).

The fact-check brief is Unit 6's with these additions:

- **Every sign**: of ΔS° from the moles of gas, of each term of ΔG° = ΔH° − TΔS°, of E° and of ΔG° from it.
- **Every unit:** J against kJ in ΔH° − TΔS°, in −RT ln K and in −nFE°; seconds in $q = It$; kJ against kJ/mol.
- **Every cell:** the half-reaction with the higher reduction potential is the reduction; E°cell is cathode minus anode with neither value multiplied; n is read from the balanced overall equation; solids are left out of Q; anions move toward the anode.
- **Every equation and half-reaction** balanced in atoms and charge, with a state symbol on every species.
- **The values of fact 11 stay.** Report a value only if it is wrong for chemistry, not for differing from a lesson or from another page. Nickel is −0.25 V everywhere.
- **The words of the terms table** occur nowhere, and $Q$ is never a charge.
- **Each `beyond` label** is on something the exam does not ask for, and nothing unlabeled needs ΔG without the circle, the entropy of the universe or a number from the Nernst equation.
- **Each scoring line** has one meaning and agrees with its part's answer.
- **Report any sentence that settles more than the lessons do** ("only", "always", "never", "every").

Differences the audit is expected to print: the Quick review left out of each worksheet (one question fewer on the site); the state symbols added to Worksheet 1's table and to six equations; thousands written with a comma; nickel's value and Worksheet 4, 4(c); Worksheet 5's 4.02 and its carried values; Worksheet 5's rubric (0 rubric lines in the source, 6 on the site); the topics added to four questions; Worksheet 3's 3.1 × 10⁻⁴ and its two equations; Worksheet 1, question 8's ten values; wording below 70 percent in the questions this plan rewrites (Worksheet 1, questions 4 and 8; Worksheet 4, question 9).

### Task 3: Open pull request B

- [ ] **Decide each fact-check finding** (multiplying out any correction to a number); one fixer per worksheet for the accepted ones, each bringing its audit back to clean; build, test, audit and measure again; a second fact-check of all five pages (two agents: Worksheets 1 to 3, and 4 and 5); last fixes; measure again.
- [ ] **Commit** (`feat(practice): add Unit 9 worksheets 1 to 5`; the spelling word as its own commit, `test(spelling): catch "jewellery"`), push, open the pull request with base `main` (`feat(practice): Unit 9 worksheets 1 to 5`), and merge it when its check passes.

The body gives each document's questions and points, each audit's last line, what the fact-checks found, the labels, the models used, test and build output, and, set apart, **every change to the originals**: the wrong answer (4.02 g), nickel and +0.51 V, the two displays, each statement changed, each datum added, each state symbol added, the six scoring lines, and the values kept though they differ (fact 11).

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-9-practice-ladders-frq`, from `main` once pull request B is merged. The two drafts are written in the scratch folder at the same time as the worksheets.

### Task 4: Convert the skill ladders and the free-response set

**Skill ladders** (`u09-selfstudy.tex`), modeled on `src/content/practice/unit-6/skill-ladders.mdx`:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11"]
summary: Twelve skills, one at a time. Each has a worked example, then four questions on the same skill to try on your own. Start here, before the worksheets.
---
```

- The introduction: how a ladder works; the unit's one idea (thermodynamics asks whether a reaction is thermodynamically favored, and electrochemistry measures the same thing as a voltage, joined by ΔG° = −nFE°); the unit trap (ΔH° in kilojoules and ΔS° in joules per kelvin, which "costs the most points"); R and F; that tables round differently; the scope sentence about electrode signs.
- Twelve sections, `## Ladder 1: Predicting the sign of ΔS` to `## Ladder 12: Electrolysis and Faraday's law`. Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d, each part's answer made of the `\selfcheck` line and the key's explanation.
- Topics, ladder by ladder: 9.1; 9.2; 9.3; 9.3; 9.4; 9.5; 9.6; 9.7; "9.8, 9.9"; 9.9; 9.10; 9.11.
- **Leave out** "Where you stand"; keep its advice as `## If you missed some`, with ΔG° = ΔH° − TΔS° and "check off" for "tick".

| Ladder | Title | Worked example | Changes to the source, all of them |
|---|---|---|---|
| 1 | Predicting the sign of ΔS | Three processes | (iii): "Ions leave fixed places in the crystal and spread through the solution." 1(c): "molecules that move past one another become fixed in a crystal, with fewer ways to be arranged". 1(d): "Small, and positive: about +20 J/(mol·K), from a table" for "close to zero, and slightly positive in practice" |
| 2 | Calculating ΔS° | Products minus reactants | The formula carries its coefficients, as Worksheet 1's does. C(s, graphite), three times. "One mole of gas is used and one is made" for "the disorder was already there in the O₂". "Zero only at 0 K, for a perfect crystal". 2(c): "thermal motion" for "real disorder" |
| 3 | Gibbs free energy | The conversion that decides the answer | ΔG° = ΔH° − TΔS° throughout, the questions included. The example gives N₂(g) + 3H₂(g) → 2NH₃(g). "The enthalpy term works for the reaction and carries it." "Wrong in both size and sign." **3(d)**: "What does ΔG° = 0 mean?" Answer: "K = 1: at equilibrium neither reactants nor products are favored. It does not mean that the reaction is at equilibrium; that is Q = K, whatever K is." |
| 4 | Temperature dependence | The four cases, and where ΔG° changes sign | CaCO₃(s) → CaO(s) + CO₂(g); "taking ΔH° and ΔS° as the same at every temperature". The four cases as a list. "The temperature at which ΔG° = 0" for "crossover". 1,110 K and +130 kJ stay |
| 5 | Thermodynamic and kinetic control | Favored and yet stuck | "Gasoline vapor". ΔG° throughout. "Under kinetic control" for "kinetically blocked" and "kinetically stable" |
| 6 | Free energy and the equilibrium constant | Both directions | **ln K = 8.072** (source 8.073), K = e^8.072 = 3.2 × 10³. The three-way correspondence as a three-row list. **6(a): K = e^−6.054 = 2.3 × 10⁻³** (source 2.4 × 10⁻³) |
| 7 | Free energy of dissolution | Endothermic and still favored | Opening: "…and the entropy change usually works for the dissolving, though not always." Example: "ions fixed in a crystal"; "The entropy term outweighs the enthalpy term"; "Favored is not the same as exothermic… and for many salts it is." **7(a)**: "Usually positive, as it is for ammonium nitrate: the ions leave fixed places and spread through the solution. Not always: small or highly charged ions hold water molecules around them, that water loses entropy, and for some salts the total is negative (topic 9.6: magnesium sulfate)." 7(c): "although its entropy change works for dissolving". **7(d)**: "Less soluble. Dissolving it is endothermic, and K for an endothermic change falls as the temperature falls (topic 7.9). In topic 9.6's terms, ΔH° and ΔS° are both positive here, so cooling weakens the entropy term that works for the dissolving." |
| 8 | Coupled reactions | Driving an unfavored step | "The extraction of many metals"; "reactions that are unfavored on their own" for "that thermodynamics would otherwise forbid". **8(d)**: "ΔG° values add when equations add, just as ΔH° values do in Hess's law (topic 6.9), so the steps of a combined process sum to the overall value. **Beyond the exam:** a quantity whose change depends only on the start and the end is called a state function; G and H are both state functions." |
| 9 | Galvanic cells | Assembling a cell | "The half-reaction with the higher reduction potential is the reduction." The two half-reactions on separate lines. 9(a) keeps nickel at −0.25 V and +1.05 V. 9(d)'s bracket: "What does differ between the two kinds of cell is which electrode is positive and which is negative, and the AP exam does not ask for that." |
| 10 | Cell potential and free energy | From volts to kilojoules | "E° is energy per unit of charge: never multiply it." "For the iron and copper cell of Ladder 9". **−150,517 J = −151 kJ** (source −1.5 × 10⁵ J). 10(a): "For the nickel and silver cell of Ladder 9 (E° = +1.05 V, n = 2)"; −2.03 × 10⁵ J = −203 kJ stays. 10(d): "the favored one" for "the spontaneous one" |
| 11 | Cell potential away from standard conditions | Which way does it move? | The formula stays, with: "The equation sheet prints it as E = E° − (RT/nF) ln Q; at 25 °C the two are the same." The example gives Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s) and opens its calculation with a `**Beyond the exam:**` sentence. "Change the potential" for "shift the potential"; "further from equilibrium" for "the driving force is greater"; "a cell that has run down" for "a 'dead' battery". 11(b): "What is E for a cell that has run down completely?" **11(c) carries `beyond`.** |
| 12 | Electrolysis and Faraday's law | The four-step chain | $q = It$. The stem gives copper's molar mass, 63.55 g/mol. **0.09328 mol on both lines** (source 0.0933, then 0.09328). Cu²⁺(aq) + 2e⁻ → Cu(s); Ag⁺(aq) + e⁻ → Ag(s); 12(d): Al³⁺(l) + 3e⁻ → Al(l), "in the melt of a smelter". "mol Cu", "mol Ag" |

**Free-response set** (`u09-frq.tex`), modeled on `src/content/practice/unit-7/free-response-set.mdx`:

```yaml
---
title: "Free-response set"
kind: free-response
order: 7
topics: ["9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11"]
summary: Five free-response questions on most of Unit 9, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

The introduction: "This set covers most of the unit: topics 9.3 to 9.11. The unit is 7% to 9% of the exam."; 5 questions, 32 points, about 50 minutes, a calculator; the values (R, F, the two potentials, silver's molar mass); the scope sentence; and "Part c of question 2 asks for a number from the Nernst equation, which is beyond the exam; it is labeled and keeps its 3 points."

| Number | Title | `topic` | `points` | Rubric lines |
|---|---|---|---|---|
| 1 | Free energy and temperature | 9.3, 9.5 | 10 | 3, 2, 3, 2 |
| 2 | A galvanic cell and an electrolysis | 9.8, 9.9, 9.10, 9.11 | 10 | 3, 2, 3, 2 |
| 3 | Thermodynamic and kinetic control | 9.4 | 4 | 2, 2 |
| 4 | Free energy of dissolution | 9.6 | 4 | 2, 2 |
| 5 | Coupled reactions | 9.7 | 4 | 2, 2 |

Changes to the source, all of them:
- **1(a)**: "thermodynamically favored there". **1(c)**: "and from it, K"; 10,000 with a comma. **1(d)**: "works against" for "opposes".
- **Question 2**: the stem gives the two reduction potentials. **2(b)**: "a potential is energy per unit of charge" for "potential is intensive". **2(c)** carries `beyond`; its answer keeps the source's form and numbers. **2(d)**: the stem gives silver's molar mass, 107.87 g/mol; $q = It$; "moles of electrons", "mol Ag"; Ag⁺(aq) + e⁻ → Ag(s).
- **3(a)**: ΔG°; "under kinetic control" stays. **3(b)**'s answer keeps the high temperature and adds: "A catalyst that lowered the barrier would do it too."
- **4(a)**: "The entropy increase. The ions leave fixed places in the crystal and spread through the solution. With ΔH° near zero, ΔG° = ΔH° − TΔS° is negative because of the −TΔS° term almost alone." ("Highly ordered" and "a large rise in disorder" go.) **4(b)**: "although the entropy change works for dissolving"; ΔH° and ΔG° with their circles.
- **Question 5**: "thermodynamically favored"; "shares a substance with it" stays as "a common species" where the source has it.

**Scoring lines for the free-response set** (design, 4.7):

| Part | Points | Line |
|---|---|---|
| 1(a) | 3 | 1 point for putting ΔH° and ΔS° in the same energy unit (ΔS° in kJ, or ΔH° in J). 1 point for +50.3 kJ/mol. 1 point for "not thermodynamically favored". An answer with the units left unconverted (about −44,600) earns 0 for the whole part, its conclusion included. |
| 1(b) | 2 | 1 point for setting ΔG° = 0, or for writing T = ΔH°/ΔS° directly. 1 point for 633 K. |
| 1(c) | 3 | 1 point for −10.0 kJ/mol. 1 point for ΔG° = −RT ln K with ΔG° and R in the same energy unit (joules with 8.314, or kilojoules with 0.008314). 1 point for K = 5.6, or for the K that follows correctly from the ΔG° found. |
| 1(d) | 2 | 1 point for saying that with ΔH° positive the enthalpy term works against the reaction at every temperature. 1 point for saying that −TΔS° is negative only when ΔS° is positive, so only then can a high temperature outweigh it. |
| 2(a) | 3 | 1 point for each half-reaction (2 points). 1 point for copper named as the anode together with the overall equation balanced for electrons; both are needed. |
| 2(b) | 2 | 1 point for +0.46 V; doubling E° with the half-reaction (1.26 V) earns 0 for this point. 1 point for −nFE° with n = 2: −89 kJ, or the value that follows from the potential found (−243 kJ from 1.26 V). |
| 2(c) | 3 | 1 point for Q = [Cu²⁺]/[Ag⁺]² = 1.0 × 10³. 1 point for the Nernst equation with n = 2, in either form: (0.0592/n) log Q, or the equation sheet's (RT/nF) ln Q. 1 point for 0.37 V. With [Ag⁺] not squared the part earns at most 1 point, the one for the equation. |
| 2(d) | 2 | 1 point for the charge, 1,800 C, and the moles of electrons, 0.01866 mol; both are needed. 1 point for 2.01 g, or for the mass that follows correctly from the moles of electrons found. |
| 3(a) | 2 | 1 point for saying that ΔG° tells whether and how far, not how fast. 1 point for a large activation energy, or for naming kinetic control; either earns it. |
| 3(b) | 2 | 1 point for a way past the barrier: a very high temperature, or a catalyst. 1 point for why it works: heating raises the fraction of atoms with enough energy, or a catalyst gives a path with a lower activation energy. |
| 4(a) | 2 | 1 point for naming entropy. 1 point for ions leaving fixed places in the crystal and spreading through the solution. |
| 4(b) | 2 | 1 point for a positive ΔH° of dissolving; "positive" is enough. 1 point for saying that it is larger than TΔS°, so ΔG° is positive. |
| 5(a) | 2 | 1 point for −33 kJ/mol. 1 point for "thermodynamically favored". |
| 5(b) | 2 | 1 point for saying that ΔG° values add when the equations add. 1 point for the condition: the two reactions share a substance, made by one and used by the other. "The negative one is bigger" alone earns the first point only. |

### Task 5: Finish Group C

- [ ] **Finish as Tasks 2 and 3 do** (the ladders' first fact-check is split between two checkers, six ladders each; the second fact-check is one agent for both pages). The audit's sources are `u09-selfstudy.tex` and `u09-frq.tex`.

Differences the audit is expected to print: the two corrected values in Ladder 6; Ladder 10's joules; Ladder 12's 0.0933 and the added 63.55; thousands with a comma; the state symbols added to six equations and C(s, graphite); Ladder 9's second topic; "Where you stand" against "If you missed some" (the table's numbers are only in the source); the free-response set's question 1 without 9.1 and 9.2; the added 107.87 and −243; wording below 70 percent in Ladder 7 and in the scope notes.

With all seven documents in place, check by hand: each Unit 9 lesson that exists lists in "Practice next" the documents that have a question on its topic; the unit page lists the seven in the order of the table "The seven documents"; "favorable", "spontaneous", "disorder", "crossover", "driving force", "dead", "intensive", "magnitude" and "C(s)" for graphite occur nowhere under `src/content/practice/unit-9`; `Q = It` occurs nowhere; nickel is −0.25 V wherever it occurs; no equation lacks a state symbol.

- [ ] **Commit** (`feat(practice): add the Unit 9 skill ladders and free-response set`).

### Task 6: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Commit (`docs: record how the Unit 9 practice was built`), push, open pull request C with base `main` (`feat(practice): Unit 9 skill ladders and free-response set`), merge it when its check passes, and confirm the deploy.

The body of pull request C lists, set apart, every change to the originals: the wrong answer (2.3 × 10⁻³), 8.072, the two displays, each statement changed (Ladder 7 follows lesson 9.6, and says so), each datum and state symbol added, the three `beyond` labels, the fourteen scoring lines, the repeats that were kept (design, 4.8), and what could not be checked: the key PDFs, the printed framework, and the reference values written from memory.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The seven documents | 1, 4 |
| 2. What is left out | Guide additions; 1, 4 |
| 3. Conversion, audit, two fact-checks, corrections multiplied out | 2, 3, 5 |
| 4, calls 1 to 3. "Beyond the exam" labels | Guide additions; 1 (Worksheets 1 and 3), 4 |
| 4, call 4. Agents and electrode signs kept | Guide additions; 1 (Worksheet 4) |
| 4, call 5. Nickel | Facts, 9; 1 (Worksheet 4) |
| 4, call 6 and 4.3. The lessons' terms | Guide additions; 1, 4 |
| 4, call 7 and 4.1. Values a question uses | Guide additions; 1, 4 |
| 4, call 8. Sources' values kept | Facts, 11; 2 |
| 4, call 9. Topics | "The seven documents"; 1, 4 |
| 4, call 10 and 4.8. Repeats | 6 |
| 4, call 11 and 5. The spelling word | 2 |
| 4, call 12 and 4.7. Scoring lines | 1 (Worksheet 5), 4 |
| 4.4 Answers and displays corrected | Facts, 9; 1, 4 |
| 4.5 Statements changed | 1, 4 |
| 4.6 Numbers | Facts, 9 |
| 4.9 Wording | Guide additions |
| 6. Pull requests | A, 3, 6 |
| 7. Done when | 2, 3, 5, 6 |
