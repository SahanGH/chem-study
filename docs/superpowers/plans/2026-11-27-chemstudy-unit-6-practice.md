# ChemStudy Unit 6 Practice Implementation Plan

**Goal:** Put the teacher's Unit 6 practice on chem-study.com: four worksheets, the ten skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: six MDX files in `src/content/practice/unit-6/`, converted by hand from the LaTeX in the AP Chem repository and checked by `scripts/practice-audit.mjs`. No code changes.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-6-practice-design.md`.

**Builds on:** Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`), whose sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise; and on Unit 4's practice (`2026-11-24-chemstudy-unit-4-practice.md`), whose lessons are written into this plan.

## Facts verified before writing (do not rediscover)

Established on 2026-11-27. The research behind them is in the session scratch folder: `scratchpad/unit6-practice/research.md` (eleven sections, with file and line for each fact), `recompute.py`, `balance.py` and their outputs.

1. **The sources** (read-only), in `/home/user/sahangh/ap_chem_prep/Units/unit06-thermochemistry/`: `worksheets/u06-ws1.tex` to `u06-ws4.tex`, and one level up `u06-selfstudy.tex` and `u06-frq.tex`. **Never open `exam/`.** There are no key PDFs on this machine; each `.tex` holds its answers.
2. **Counts.** Worksheet 1: 6 questions, 20 parts; Worksheet 2: 7 and 18; Worksheet 3: 7 and 14; Worksheet 4: 8 and 20 (the last question scored, 10 points, parts a to e). The ladders: 10 worked examples and 40 questions. The free-response set: 5 questions, 15 parts, 32 points (10, 10, 4, 4, 4), 50 minutes.
3. **`\ced{6.N}` inside the `\problem[]{…}` text carries the topic**; the free-response set carries the tags in its `\frq{...}` lines. Worksheet 4's question 5 has none.
4. **No figure in any source.** One question asks for a sketch "in words" (Worksheet 1, 3(d)).
5. **Rubrics.** Worksheet 4, question 8: a boxed note of five items, (a) 1, (b) 2, (c) 3, (d) 2, (e) 2. The free-response set: 15 `\rpoint` lines; question 1: 2, 2, 3, 2, 1; question 2: 2, 3, 2, 3; question 3: 2, 2; question 4: 3, 1; question 5: 2, 2.
6. **Every worksheet ends with a `spiralstrip`** (left out). **Each worksheet's `\wsheader` strip holds data its questions need** (Worksheet 2: water 4.18, ice 2.09, steam 2.03 J/(g·°C), 6.02 and 40.7 kJ/mol, 18.02 g/mol; Worksheet 4: eleven bond enthalpies and eight enthalpies of formation). In the ladders `\selfcheck` holds the one-line answers and the key-only `apcanswer` the explanations; the questions print as 1 to 4 and are keyed (a) to (d).
7. **What a practice page can hold.** `src/pages/[unit]/practice/[name].astro` supplies `Answer`, `Blank`, `Figure`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`. `Question` and `Part` take `beyond`. A document's `topics` may name only topics of its own unit. The build check needs a non-empty `<Answer>` in every question or part, rubric lines that sum to the question's `points`, and document `points` equal to the sum of its questions'.
8. **Numbers.** The one molar mass stated (water, 18.02 g/mol) agrees with the exam table. No final answer changes. Recomputed by the controller's script: Worksheet 2, 2(c): 2,173.6 J ÷ 0.0250 mol = 86,944 J/mol, −86.9 kJ/mol; 4(c): 4.99445 mol × 6.02 = 30.07, 30.1 kJ; 6(c): n = 1.38735 mol, the steps 0.5225, 8.352, 10.45, 56.465 and 0.5075 kJ, total 76.297, 76.3 kJ, and boiling is 74.0 percent of it; 3(c): 4.18 ÷ 0.2883 = 14.5. Worksheet 3, 1(b): exactly 445.25 kJ. Worksheet 4, 8(b): exactly 35,634.5 J; 8(c): 35.6345 ÷ 0.0400 = 890.86, −891 kJ/mol. Ladder 6's worked example: 13.36 + 16.72 + 90.4 = 120.48 kJ.
9. **Equations.** All 31 equations that name substances balance. Eight lack state symbols on some or all species (Worksheet 3: the doubled methane equation, the reversed CO₂ equation of 4(b) and the three of question 6; Worksheet 4, 6(d); Ladder 7's summed equation; free-response 2(d)). Graphite is written C(gr) and C(s).
10. **The lessons' rules and terms** (`src/content/lessons/unit-6/`):
    - 6.1: signs from the system's point of view; for a change in solution the water whose temperature is read is surroundings; "energy is not the only thing that decides whether a change happens, and Unit 9 takes that up".
    - 6.2: an energy diagram is two levels and an arrow; the picture with a hill is an energy profile, its top the transition state, and the hill is topic 5.6's.
    - 6.3: temperature measures average kinetic energy; the same average kinetic energy does not mean the same speed; heat is energy being passed, and a body does not "have heat"; "halfway" is a trap unless the two bodies are alike.
    - 6.4: "specific heat capacity", J/(g·°C); ΔT is final minus initial; a question gives c; an amount released is typed without a minus sign; the calorimeter constant.
    - 6.5: molar enthalpies of fusion and vaporization, q = nΔH; no ΔT during a phase change; a value in kJ/mol needs moles.
    - 6.6: ΔH in kJ/mol of reaction, "for the equation as written"; divide by the moles of reaction; the mass of the whole solution; the energy per mole is a property of the reaction.
    - 6.7: bond enthalpy; "broken minus formed" because a bond enthalpy is the energy to take something apart; an estimate, with "≈"; a bond that exists in one molecule alone is exact for it; a question gives its values.
    - 6.8: standard enthalpy of formation; C(s, graphite); products minus reactants with the coefficients; zero for an element in its standard state.
    - 6.9: reverse, multiply, add; the law holds because energy is conserved; "state function" in a "Beyond the exam" sentence only; every equation carries states.

## Conventions for every task

Plan 3's "Conventions for every task" apply, with this session's paths: the site is `/home/user/chem-study`; the sources are read-only; everything that is not the site goes in the scratch folder; conventional commits with **no AI-attribution trailer**; American English (`CLAUDE.md`); no swallowed errors.

**Merging.** Claude merges each pull request when its "Build and test" check passes on GitHub.

**Models.** Writers and fact-checkers on Fable; fixers on Sonnet. No originality check.

**Learned on earlier units, and binding here:**
- A correction to one of the teacher's numbers is recomputed by the controller in a script before it goes into a decided list or a pull request. A writer or fixer that believes an item is wrong does not apply it and says why.
- A calculation inside a part's answer has room for about 25 characters on a 320 px phone. Every display longer than that is split with `aligned`. Measure every page after every round of fixes.
- The audit reads any number in the page as a number, a spacing argument such as `[0.6em]` included: do not use one.
- A scoring note copied from a source that a grader could read two ways is kept as the source has it and listed in the pull request.
- The second fact-check is told to treat every sentence as new and to apply each rule the page states, exactly as worded, to every example on the page.
- A replacement sentence with "only", "always" or "never" in it gets the same test as the original before it goes into a decided list.

## What Unit 6 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Equations.** Every equation is `\ce{...}` in display math, split at the arrow with `aligned` when it is longer than about 25 characters. Every thermochemical equation carries a state symbol on every species; where the source's has none, add them, and report each one you add. Graphite is `C(s, graphite)`. A ΔH beside an equation stays in kJ, as the source has it.

**Values a question uses** (design, 4.1). The `\wsheader` strip becomes the introduction: a sentence and then "Use these values" as a list or a table of at most five columns, every value kept as the source has it. Do not change a value to match a lesson. Also:
- Worksheet 4's list gains the specific heat capacity of water, 4.18 J/(g·°C), and its introduction says that tables round a little differently, so a question's own values are the ones to use.
- Ladder 5's worked example says in its stem that the solution's density is taken as 1.00 g/mL and its specific heat capacity as 4.18 J/(g·°C). Ladder 4(d) repeats copper's 0.385 J/(g·°C).
- Ladder 9(b) asks: "Is the standard enthalpy of formation of O₃(g) zero? Explain." Its answer keeps "about +143 kJ/mol".
- Worksheet 3, question 5 says that the problem is question 4's.
- Worksheet 2, question 2 says that the limiting reactant has a coefficient of 1 in the balanced equation and that the mass of the solution is taken as 100.0 g.

**Phase changes by the gram** (design, 4.2). The ladders and the free-response set keep 334 J/g and 2,260 J/g, and each introduction says that these are water's molar values, 6.02 and 40.7 kJ/mol, divided by its molar mass. Free-response 4(a)'s rubric line: "…with each phase-change term as grams times a per-gram value, or moles times a molar value, and no ΔT".

**Outside Unit 6's framework** (design, 4.3).
- Worksheet 3, question 3 becomes two parts. Part a: state Hess's law and say why it holds; the answer keeps the source's statement and gives the reason as lesson 6.9 does (energy is conserved, so the enthalpy change between a start and an end cannot depend on the route). Part b, with `beyond`: "A quantity whose change depends only on the start and the end has a name. What is it?" Answer: a state function.
- Worksheet 1, 5(c): no label. The answer: no; energy is not the only thing that decides whether a change happens; the other factor is called entropy, and Unit 9 takes that up. Keep the source's point that dissolving spreads the ions out, without "disorder is large enough to carry it" as a ruling.
- Worksheet 1, 3(c), 3(d) and Ladder 2: the picture with a hill is an "energy profile" and its top the "transition state"; where the hill is first used, add a clause that it is topic 5.6's. Keep the questions and answers.
- Worksheet 4, question 8: the stem gains "Take the energy the water gains as equal in size to the enthalpy change of the reaction." Do not name the calorimeter's kind.
- The scope notes of the ladders and the free-response set become one sentence of each introduction: "The difference between enthalpy and the energy of the system is not on the AP exam, and nothing here asks for it."

**The lessons' terms and rules** (design, 4.4).
- "Specific heat capacity", never "specific heat" alone (Ladder 4's title too). Units as J/(g·°C). "Standard enthalpy of formation" for "formation enthalpy" and "formation data" where a noun is needed. "Bond enthalpy" for "bond energy".
- Kinetic energy, not speed: Worksheet 1, 4(b) (the metal's atoms have more average kinetic energy and pass some to the water molecules in collisions; the metal's average kinetic energy falls and the water's rises); Worksheet 2, 1(c) and Ladder 4 (energy goes into the hydrogen-bond network instead of into the molecules' kinetic energy); Ladder 6.
- "The energy released" where a source has heat sitting somewhere; "energy" for "internal energy" (Worksheet 1, 4(d): "What the block has is energy, and a temperature").
- Worksheet 1, 5(b): the energy came from the water, which is the surroundings here.
- Signs: Worksheet 2, 1(b): "15.7 kJ is released; $q = -15.7$ kJ". Free-response 1(c): the substitution shows ΔT = 26.6 − 100.0 = −73.4 °C and the metal's negative q; the rubric line keeps its three points and names "the metal's own temperature change, a fall of 73.4 °C".
- Each introduction that has a ΔH beside an equation says once: "A ΔH written beside an equation is for the equation as written."
- Worksheet 4, 1(c): the reason is lesson 6.7's (a bond enthalpy is the energy to take something apart, so the bonds broken are counted as energy in and the bonds formed as energy out).
- The header formula ΔH = ΣD(broken) − ΣD(formed) is written in words with "≈".

**Statements changed** (design, 4.5). Apply exactly these and report each:
- Worksheet 2, 2(d) and Ladder 5(b): no "intensive property". The energy per mole of reaction is a property of the reaction: it does not depend on how much was run, while the energy of one experiment does.
- Ladder 8's worked example, "why only an estimate": here each bond belongs to one molecule only, so these three values are not averages and the estimate is close; for most bonds the table value is an average over many compounds. Part 8(c) keeps the general statement.
- Free-response 2(d): the stem gives "the bond in NO, 607 kJ/mol" (not "N=O"). The answer keeps +222 kJ and the comparison with +180.5 kJ, and says the gap comes from the value used for the bond in NO, an average that does not fit this molecule well, while the values for N₂ and O₂ are those molecules' own. Rubric line, third point: "noting that a table value is an average, or does not fit this molecule, so the result is an estimate".
- Worksheet 1, 1(e): photosynthesis is endothermic; the energy enters as light, not as heat, and the system's energy change is positive.
- Ladder 1(d): "overcome some of the hydrogen bonds that hold the molecules in place".
- Worksheet 2, 3(c): "more than 14 times". Ladder 10: "four routes"; "the other three" stays where it means the three that are not calorimetry.
- Worksheet 1, question 6: the answer opens with its condition (the same mass and the same substance).
- Worksheet 3, 1(e): name the three changes it means (taking half a mole, doubling, reversing).

**Numbers** (design, 4.6). Keep every answer as the source prints it; recompute each as you go and report any you cannot reproduce, without changing it. These displays change so that the printed answer follows from what is shown: Worksheet 2, 2(c) carries 2,173.6 J; 4(c) carries 4.994 mol; 6(c) carries n = 1.387 mol and shows the steps as 0.52, 8.35, 10.45, 56.47 and 0.51 kJ; Worksheet 4, 8(b) shows 35,634.5 J and gives 35.6 kJ, and 8(c) carries 35.63 kJ; Worksheet 3, 1(b) shows 445.25 kJ and gives 445 kJ; Ladder 6's worked example shows the sum as 120.5 kJ and gives 120 kJ.

**Wording to recast.** Worksheet subtitles that name a type of sheet or a class routine go. Worksheet 4's "FRQ (10 points)" becomes a sentence about the AP exam's long free-response questions. "YOUR TURN" is the `label="Your turn"` of the question; "I do:" is dropped. "CED" becomes "the AP framework" or goes. "(Unit 9 makes this precise.)" becomes "Unit 9 takes that up." "Points" for "marks", "backward", "favorable", "canceling", "the most common error", "on the exam". Notes to a grader ("Accept also: …") become a sentence of the answer ("Another sound answer: …").

**Left out:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`).

## The six documents

| Order | File in `src/content/practice/unit-6/` | Title | Kind | Source |
|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | `u06-selfstudy.tex` |
| 2 | `worksheet-1-signs-energy-diagrams-and-heat-transfer.mdx` | Worksheet 1: Signs, energy diagrams and heat transfer | `worksheet` | `worksheets/u06-ws1.tex` |
| 3 | `worksheet-2-calorimetry-and-phase-changes.mdx` | Worksheet 2: Calorimetry and phase changes | `worksheet` | `worksheets/u06-ws2.tex` |
| 4 | `worksheet-3-enthalpy-of-reaction-and-hesss-law.mdx` | Worksheet 3: Enthalpy of reaction and Hess's law | `worksheet` | `worksheets/u06-ws3.tex` |
| 5 | `worksheet-4-bond-and-formation-enthalpies-and-a-long-free-response-question.mdx` | Worksheet 4: Bond and formation enthalpies, and a long free-response question | `worksheet` | `worksheets/u06-ws4.tex` |
| 6 | `free-response-set.mdx` | Free-response set | `free-response` | `u06-frq.tex` |

---

## Group A: design and plan (pull request A)

Branch `topic/unit-6-practice-design`, from `main`. This plan and the design.

---

## Group B: Worksheets 1 to 4 (pull request B)

Branch `topic/unit-6-practice-worksheets`, from `topic/unit-6-practice-design`.

### Task 1: Convert Worksheets 1 to 4

One writer per worksheet, in parallel, writing files only, into `scratchpad/unit6-practice/staging/`, with its audit's expected file in `scratchpad/unit6-practice/expected/`. Each gets: `scratchpad/unit6-practice/writer-brief.md`; Plan 3's conversion guide; this plan's "Facts" and "What Unit 6 adds"; its source `.tex`; a finished worksheet as the model (`src/content/practice/unit-4/worksheet-3-oxidation-numbers-stoichiometry-and-titration.mdx`; for Worksheet 4's scored question, `unit-4/worksheet-4-a-long-free-response-question-and-redox-practice.mdx`, question 1); and the Unit 6 lessons for the terms.

**Worksheet 1** (`u06-ws1.tex`):

```yaml
---
title: "Worksheet 1: Signs, energy diagrams and heat transfer"
kind: worksheet
order: 2
topics: ["6.1", "6.2", "6.3", "6.4"]
summary: Six questions on telling exothermic from endothermic, whose temperature a thermometer shows, energy diagrams, and how energy passes from a warm body to a cool one.
---
```

Six questions, topics 6.1, 6.1, 6.2, 6.3, 6.1 and "6.3, 6.4". Titles: Five changes and their signs; A thermometer in a reacting solution; Energy diagrams; A hot metal block in cool water; An ammonium nitrate cold pack; Two identical blocks.

**Worksheet 2** (`u06-ws2.tex`):

```yaml
---
title: "Worksheet 2: Calorimetry and phase changes"
kind: worksheet
order: 3
topics: ["6.4", "6.5", "6.6"]
summary: Seven questions on the energy to warm a substance, a coffee-cup calorimeter, the energy of melting and boiling water, and a heating curve taken one step at a time.
---
```

Seven questions, topics 6.4, "6.4, 6.6", 6.4, 6.5, 6.5, 6.5, 6.5. Titles: Warming and cooling water; A reaction in a coffee-cup calorimeter; The specific heat capacity of a metal; Melting and vaporizing water; Why q = mcΔT fails during melting; Ice to steam; A steam burn.

**Worksheet 3** (`u06-ws3.tex`):

```yaml
---
title: "Worksheet 3: Enthalpy of reaction and Hess's law"
kind: worksheet
order: 4
topics: ["6.6", "6.8", "6.9"]
summary: Seven questions on what an enthalpy change means for an equation as written, what reversing and scaling an equation do to it, and adding equations by Hess's law.
---
```

Seven questions, topics "6.6, 6.9", "6.6, 6.9", 6.9, "6.8, 6.9", 6.9, 6.9, "6.6, 6.8". Titles: Burning methane; Burning carbon monoxide; Hess's law in words; Carbon to carbon monoxide; A sign that was not changed; Nitrogen to nitrogen dioxide; Fractions as coefficients. Question 3 is two parts, the second with `beyond`.

**Worksheet 4** (`u06-ws4.tex`):

```yaml
---
title: "Worksheet 4: Bond and formation enthalpies, and a long free-response question"
kind: worksheet
order: 5
topics: ["6.4", "6.6", "6.7", "6.8"]
summary: Seven questions on estimating an enthalpy change from bond enthalpies and calculating it from enthalpies of formation, then one 10-point free-response question on burning methane, with its scoring rubric.
points: 10
---
```

Eight questions, topics 6.7, 6.7, 6.7, 6.8, "6.7, 6.8", "6.7, 6.8", 6.8 and "6.4, 6.6, 6.8". Titles: Breaking and forming bonds; Hydrogen and chlorine; Burning methane, from bond enthalpies; Burning methane, from enthalpies of formation; Two routes, two answers; Elements, and making ammonia; Adding hydrogen to ethene; Methane in a calorimeter. Question 8: `points={10}`, parts a to e, and a `<Rubric>` of five lines, (a) 1, (b) 2, (c) 3, (d) 2, (e) 2, with the source's notes.

### Task 2: Finish the conversion of Group B

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 6's paths: copy the four files in; build and test; audit each worksheet (`node scripts/practice-audit.mjs /home/user/sahangh/ap_chem_prep/Units/unit06-thermochemistry/worksheets/u06-wsN.tex src/content/practice/unit-6/<name>.mdx <scratch>/unit6-practice/expected/<name>.json`) to `0 unexplained, 0 stale`; measure each page at 412, 390, 360 and 320 px with every answer open; one fact-check per worksheet (`scratchpad/unit6-practice/factcheck-brief.md`).

The fact-check brief is Unit 4's with these additions:

- **Every sign, from the system's point of view**, and whose temperature a thermometer shows; every "released" a size and every q or ΔH signed.
- **Recompute every number** unrounded; check that each printed result follows from the step shown.
- **Every unit:** J against kJ, per gram against per mole, kJ against kJ/mol.
- **Every thermochemical equation** balanced, with a state symbol on every species.
- **Kinetic energy, not speed;** no body "has heat".
- **Nothing a question needs is missing** from its stem or the introduction's list, and no value was changed from the source.
- **Report any sentence that settles more than the lessons do** ("only", "always", "never").

Differences the audit is expected to print: the Quick review left out of each worksheet; added state symbols; the carried values of "Numbers"; Worksheet 3, question 3's new part; Worksheet 4's rubric (0 rubric lines in the source, 5 on the site) and its added 4.18.

### Task 3: Open pull request B

- [ ] **Decide each fact-check finding** (recomputing any correction to a number); one fixer per worksheet for the accepted ones, each bringing its audit back to clean; build, test, audit and measure again; a second fact-check of all four pages; last fixes; measure again.
- [ ] **Commit** (`feat(practice): add Unit 6 worksheets 1 to 4`), push, open the pull request with base `main` (`feat(practice): Unit 6 worksheets 1 to 4`), and merge it when its check passes.

The body gives each document's questions and points, each audit's last line, what the fact-checks found, the labels, the models used, test and build output, and, set apart, **every change to the originals**.

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-6-practice-ladders-frq`, from `topic/unit-6-practice-worksheets`. The two drafts are written in the scratch folder at the same time as the worksheets.

### Task 4: Convert the skill ladders and the free-response set

**Skill ladders** (`u06-selfstudy.tex`), modeled on `src/content/practice/unit-4/skill-ladders.mdx`:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9"]
summary: Ten skills, one at a time. Each has a worked example, then four questions on the same skill to try on your own. Start here, before the worksheets.
---
```

- The introduction: how a ladder works; the unit's habit (track the sign, every time); the values; the scope sentence.
- Ten sections, `## Ladder 1: Endothermic and exothermic` to `## Ladder 10: Choosing the right method`: Energy diagrams; Heat transfer and thermal equilibrium; Specific heat capacity; Calorimetry; Energy of phase changes; Hess's law; Bond enthalpies; Enthalpy of formation. Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder: 6.1; 6.2; 6.3; 6.4; "6.4, 6.6"; 6.5; 6.9; 6.7; 6.8; "6.4, 6.6, 6.7, 6.8, 6.9".
- **Leave out** "Where you stand"; keep its advice as `## If you missed some`.

**Free-response set** (`u06-frq.tex`), modeled on `src/content/practice/unit-4/free-response-set.mdx`:

```yaml
---
title: "Free-response set"
kind: free-response
order: 6
topics: ["6.1", "6.2", "6.3", "6.4", "6.5", "6.7", "6.8", "6.9"]
summary: Five free-response questions on Unit 6, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

| Number | Title | `topic` | `points` | Rubric lines |
|---|---|---|---|---|
| 1 | Calorimetry | 6.3, 6.4 | 10 | 2, 2, 3, 2, 1 |
| 2 | Hess's law, formation and bond enthalpies | 6.7, 6.8, 6.9 | 10 | 2, 3, 2, 3 |
| 3 | An endothermic process and its energy diagram | 6.1, 6.2 | 4 | 2, 2 |
| 4 | Energy of phase changes | 6.5 | 4 | 3, 1 |
| 5 | Heat transfer and thermal equilibrium | 6.3 | 4 | 2, 2 |

Scoring notes ("caps this part at 1", "earns 0") are copied as the source has them, apart from the two lines "What Unit 6 adds" names.

### Task 5: Finish Group C

- [ ] **Finish as Tasks 2 and 3 do** (the ladders' first fact-check is split between two checkers, five ladders each).

With all six documents in place, check by hand: each Unit 6 lesson's "Practice next" lists the documents that have a question on its topic; the unit page lists the six in the order of the table "The six documents"; "specific heat" without "capacity", "internal energy", "intensive" and "C(gr)" occur nowhere under `src/content/practice/unit-6`; no thermochemical equation lacks a state symbol.

- [ ] **Commit** (`feat(practice): add the Unit 6 skill ladders and free-response set`).

### Task 6: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Commit (`docs: record how the Unit 6 practice was built`), push, open pull request C with base `main` (`feat(practice): Unit 6 skill ladders and free-response set`), merge it when its check passes, and confirm the deploy.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The six documents | 1, 4 |
| 2. What is left out | Guide additions; 1, 4 |
| 3. Conversion, audit, two fact-checks, corrections recomputed, scoring notes | 2, 3, 5 |
| 4.1 Values a question uses | Guide additions; 1, 4 |
| 4.2 Phase changes by the gram | Guide additions; 4 |
| 4.3 Outside Unit 6's framework | Guide additions; 1, 4 |
| 4.4 The lessons' terms and rules | Guide additions; 1, 4 |
| 4.5 Statements changed | Guide additions; 1, 4 |
| 4.6 Numbers | Facts, 8; Guide additions |
| 4.7 Wording | Guide additions |
| 5. Code | None |
| 6. Pull requests | A, 3, 6 |
| 7. Done when | 2, 3, 5, 6 |
