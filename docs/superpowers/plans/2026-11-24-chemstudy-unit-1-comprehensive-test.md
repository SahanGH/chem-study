# ChemStudy Unit 1 Comprehensive Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a new Unit 1 comprehensive test on chem-study.com: two pages, one per sitting, 38 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-1/` of the kind `test`, built from the existing practice blocks. The avoid list is made; a pool per part comes next. Then one writer per part drafts its questions and a number-check script; the controller runs the scripts, has the figures drawn, compares the parts, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe, Python 3 (number checks, standard library only), Node (the figure script).

**Spec:** `docs/superpowers/specs/2026-11-24-chemstudy-unit-1-comprehensive-test-design.md`.

**Builds on:** Plan 4 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`), whose sections **"The writer's guide"** and **"How every session is checked"** apply, with the general rules of Plan 11 (`2026-11-15-chemstudy-unit-7-comprehensive-test.md`, "What changes for Unit 7": systems from a pool; honest values; rubric lines that score every sound route; the number check) and the changes in this plan's "What changes for Unit 1". Read the "As carried out" notes of Plan 13 (`2026-11-15-chemstudy-unit-3-comprehensive-test.md`) and of the Unit 1 practice plan (`2026-11-17-chemstudy-unit-1-practice.md`).

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists.** Unit 1's six practice documents take orders 1 to 6, so the two sessions are 7 and 8. A frontmatter `summary` is at most 200 characters.
2. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions.
3. **A practice page can show a figure** (`Figure`, added in pull request #60, on which this work is stacked). Inside a question's card a figure is drawn 236 px wide on a 320 px phone and 328 px at 412 px, so the script draws on a 400-unit canvas with 18-unit text. The script, `scratchpad/unit1-practice/figures.cjs`, draws a mass spectrum (sticks at given masses with given relative heights) and a photoelectron spectrum (peaks at given energies on a logarithmic axis, larger at the left, with given relative heights), each from a list of values, and throws if two labels would touch; `figures-verify.cjs` recovers every peak from the file.
4. **A calculation inside a part's answer has room for about 25 characters** on a 320 px phone. The audit of the practice pages does not apply to a test (there is no source to compare with).
5. **The site's values:** atomic masses from the exam's table (`src/data/elements.ts`), every molar mass their sum to two decimal places; Avogadro's number 6.022 × 10²³ mol⁻¹; first ionization energies, radii and electronegativities for 34 main-group elements in `src/lib/periodic-trends.ts` (no radius or electronegativity for a noble gas); binding energies for hydrogen to calcium in `src/lib/pes.ts`. The mass unit is amu. Configurations are written as text with superscript characters ([Ar] 4s² 3d¹⁰ 4p¹), in the order of filling.
6. **The avoid list** is `scratchpad/unit1-test/avoid-list.md` (made 2026-11-24 by an agent that read all fourteen Unit 1 lesson and practice files in full, both textbooks' chapters behind Unit 1 by search, and the teacher's notes, review sheet, worksheets, ladders and free-response set; **nothing under `exam\`**). For each topic it has: A, what the sources already use, with numbers; B, the kinds of question the site already sets, with a count of each; C, what is still free (tasks, and elements, isotope sets and compounds that no source uses for the topic). It ends with the ten things used most across the sources and every real-world setting the site already uses for a Unit 1 idea. Its isotope masses and abundances are from memory and marked "look up".
7. **The sources for the originality check only** (writers never read them): both Tro books in `C:\Users\sahan\Downloads\Chemistry_Resources\Tro_Reference\` (the chapters on atoms and isotopes, the mole and composition, electron configurations and periodic properties); the teacher's `D:\AP_Chem_Prep\Units\unit01-atomic-structure\` files `u01-notes.tex`, `u01-review.tex`, `u01-selfstudy.tex`, `u01-frq.tex` and `worksheets\u01-ws1.tex` to `u01-ws4.tex`, **named one by one, never the `exam\` folder**; the site's `src/content/lessons/unit-1/` and `src/content/practice/unit-1/`.
8. **The framework for Unit 1:** `scratchpad/ced/unit1-framework.md` (read from page pictures and paraphrased). Three exclusions: spectra of samples with several elements, and peaks from species other than singly charged single atoms (1.2); quantum numbers (1.5); configurations of elements that are exceptions to the filling order (1.7). Never copy its wording.
9. **What the Unit 1 lessons' and practice's fact-checks kept finding:**
   - an answer with no reason, or with a reason that says more than is true (the tallest peak deciding the average of five peaks; "summing the heights gives the atomic number" for an ion; a trend stated with no "generally" or for every period);
   - a rule that fails on one of the page's own examples (the jump rule on gallium; "name charge, distance and shielding" where the model answer named two);
   - a stem that gives a part's answer away, and a question with a false premise;
   - a scoring note a grader could read two ways ("earns 0": for the part, or for one point?);
   - significant figures: a sum keeps decimal places, not figures; a tie at the last figure;
   - "wants", "likes", "stable octet", "half-filled stability" offered as a reason.

## Conventions, models

Plan 4's conventions apply: the capital-`C:` working directory; Write and Edit for files with backslashes; conventional commits with **no AI-attribution trailer**; US spelling; never swallowing an error.

**Browser tests under the lock.** Before any `npm run test:e2e` or `npx playwright test`: if `scratchpad/e2e.lock` exists or anything listens on port 4321, wait; otherwise write `unit1` into the lock, run, and delete it in the same command. A preview by hand uses port 4400.

**Models:** writers and fact-checkers on Fable 5.2; the originality checks and fixers on Sonnet.

**Merging:** nothing is merged without the teacher's word. Each pull request is opened, its check is watched on GitHub until it passes, and it is left for the teacher.

**A correction to a number** proposed by any agent is recomputed by the controller in Python before it is applied.

## What changes for Unit 1

Give this section to every writer with Plan 4's writer's guide and Plan 11's general rules (its equilibrium-only rules do not apply).

- **What a writer reads:** the framework notes for its topic (Fact 8); `src/content/lessons/unit-1/` for its topic and the ones it leans on; `src/content/practice/unit-1/` (what students have already practiced, and the model of the format: `free-response-set.mdx`); the avoid list (its topic's three sections and the two closing lists) and its own pool. It never reads `D:\AP_Chem_Prep`, `Tro_Reference`, any textbook or slides.
- **A lookup is allowed for one purpose:** a measured value of a real element or substance, from a reference table (NIST's atomic weights and isotopic compositions; NIST's ionization energies; a handbook for a density or a melting point). Never a search for lessons, questions or worked examples. Every value taken this way is listed in the number check with its source.
- **Where it writes:** `scratchpad/unit1-test/drafts/part-<x>.mdx` and `scratchpad/unit1-test/checks/part-<x>.py`; for Parts B and F, also `scratchpad/unit1-test/figures/part-<x>.json` (see "Figures").
- **Kinds of question:** the ones its brief names (Tasks 2 and 4), each of which the site has not set. **Never one of the kinds the avoid list's section B counts for its topic, with a new element.** A familiar skill appears inside a new task, not as the task.
- **Substances:** from the part's own pool, or one the question calls made up ("element X", "compound Z", "a metal M"). Never one of the ten things used most across the sources, and never a real-world setting on the avoid list's closing list.
- **Values** (Fact 5): the exam table's atomic masses and two-decimal molar masses; reference values for isotopes and successive ionization energies; the site's own data for first ionization energies, radii, electronegativities and binding energies, copied digit for digit. No photoelectron spectrum of an ion with values; no electron affinity; no value invented for a real element. Significant figures follow the data, and a sum keeps the decimal places its terms share.
- **The terms of the lessons:** amu; subshell; "first ionization energy" spelled out on first use in each answer; nuclear charge, distance and shielding; "an s electron spends more of its time close to the nucleus"; a cation loses its highest-shell electrons first; the jump is "the first rise that is several times the size of the rises before it", judged by the rise in kJ/mol; Coulomb's law named, with force proportional to q₁q₂/r²; "generally" on every trend. Never "wants", "likes", "stable octet", "half-filled stability", "penetrates" or "sublevel" as the page's own words (a question may quote a student who says one).
- **Fact 9 is a checklist for every answer and every rubric line.** In particular, a scoring note says what it applies to ("earns 0 for the part"; "does not earn the second point").
- **Rubrics:** a point is for something a student's answer shows. Where there are two sound routes, the line says both earn the point. No point can be earned by a blank answer.
- **Figures** (Parts B and F only, at most two each): a spectrum the student must read from a drawing. The writer writes the `<Figure>` block in the question's stem with `src="/figures/1-test-<x>-<n>.svg"`, an `alt` that gives every peak and gives no answer away, a one-sentence `caption`, and a table of the same values under it; and lists the figure's data in `figures/part-<x>.json` as `{ "file": "1-test-b-1.svg", "kind": "mass" | "pes", "peaks": [[position, relativeHeight], …], "labelPeaks": true | false }`. Neither `alt` nor `caption` may contain `>`. Every other spectrum is a table in the stem.
- **Beyond the exam:** nothing should need the label (design, section 5): no molecular peaks, no quantum numbers, no chromium or copper atom or an ion that rests on such an exception, no lattice energy, no separation of mixtures, no combustion analysis, no electron affinity.
- **The number check** recomputes, from the question's own data, every number the answer and rubric show (every mass, amount and count; every average, percent and ratio; every difference between two energies; every electron count), to the figures given, asserts each against the MDX, and ends `part <x>: N values checked, all match`. Reference and site values a question states are listed in the script with their source, for the fact-checker.
- **What fits a phone:** every calculation on its own line as display math, split with `aligned` beyond about 25 characters; no spacing argument such as `[0.6em]`.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-1-test-design`, from `topic/unit-1-practice-ladders-frq` (pull request #61). The design and this plan, committed and opened as a pull request with base `main`. It waits for the teacher.

---

## Group B: the pools and session 1 (pull request B)

Branch `topic/unit-1-test-session-1`, from `topic/unit-1-test-design`.

### Task 1: The pools

- [ ] The controller writes `scratchpad/unit1-test/pools.md`: an opening section "Avoid for every part" (the avoid list's ten most-used things and its settings), then one section per part with the elements, isotope sets and compounds that part may use, taken from the avoid list's "what is still free" for its topic, none shared between two parts. Each isotope set and each list of successive ionization energies is looked up in a reference table and recomputed (the average against the exam table's mass) before it goes in; each compound has its formula and its two-decimal molar mass from the exam table. Parts A, C and D all use compounds: the pools give each its own.

### Task 2: Write session 1

Four writers in parallel, one per part. Each gets `scratchpad/unit1-test/writer-brief.md` (Unit 3's brief with Unit 1's paths and rules), Plan 4's writer's guide, this plan's "Facts" and "What changes for Unit 1", the avoid list, its pool, and its row:

| Part | Title | Topic | Questions | Points | The tasks (one question each, in any order) |
|---|---|---|---|---|---|
| A | Moles and counting particles | 1.1 | 5 (questions 1–5) | about 23 | (1) From a count of molecules or formula units to a mass, and from the mass of one particle in grams to a molar mass and an identity. (2) Two students' written setups for one conversion, one skipping moles and one with the molar mass upside down: name each slip and say by what factor each answer is off, with no new arithmetic beyond that. (3) In a given mass of an ionic compound with a polyatomic ion: moles of cations, of anions, and the total number of atoms of every kind. (4) Four samples given in different units (grams, moles, milligrams, molecules), one of them a diatomic element: rank by number of atoms and justify. (5) A mass and a count of formula units of an unknown ionic solid: its molar mass, then a choice among three candidate formulas |
| B | Mass spectra and isotopes | 1.2 | 5 (questions 6–10) | about 23 | (1) A drawn five-peak spectrum of one element: the number of isotopes, an estimate of the average from the drawing with its reasoning from the balance point, then the average from the table, the element, and the neutrons in two named isotopes. (2) An element with two isotopes: from the average and the two masses, the two abundances. (3) A sample enriched in the heavier isotope: what changes and what does not in the spectrum and in the average; then the molar mass of a compound made with one isotope only, against the ordinary compound. (4) Three students' claims about one data table (an unweighted average; "four peaks means four elements"; "the small peak can be left out"): weigh each with numbers. (5) A drawn three-peak spectrum with heights relative to the tallest as 100: the percent of each, the average, the element |
| C | Composition and formulas | 1.3 | 5 (questions 11–15) | about 23 | (1) A table of the composition by mass of four samples: which could be one pure compound, which cannot, and what further measurement would settle the rest. (2) A metal heated in air: masses before and after, to the empirical formula of the oxide. (3) Two compounds of the same two elements: grams of one element per gram of the other in each, the simple ratio between them, and the two formulas. (4) An empirical formula and the mass percent of one element given for a compound: is the percent enough to find the molecular formula? What else is needed, and the formula once it is given. (5) A claimed formula and a measured mass percent: does the measurement support the claim, to the figures the data allow, and what percent would rule it out |
| D | Mixtures and purity | 1.4 | 4 (questions 16–19) | about 20 | (1) A mixture of two compounds that share an element: of three possible measurements, which one alone gives the composition, and why the others do not; then a second pair whose shared element is present in nearly the same percent in both, so that it cannot tell them apart. (2) A mixture of two compounds of one metal: from the measured percent of the metal, the fraction of each, first estimated from where the percent falls and then calculated. (3) A sample whose analysis matches a formula to three figures: why that does not prove it pure (an impurity that would match); and a table of one element's percent in samples drawn from one container: one substance or a mixture? (4) An alloy: from the mass of one metal in a weighed piece to the atom ratio, and whether the piece could be a compound |

Session 1 frontmatter (the controller writes it):

```yaml
---
title: "Comprehensive test, session 1: counting atoms and finding formulas"
kind: test
order: 7
topics: ["1.1", "1.2", "1.3", "1.4"]
summary: Nineteen scored free-response questions on moles, mass spectra and isotopes, composition and formulas, and mixtures, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 95
---
```

The introduction says: this is the first of two sittings that together test all of Unit 1; it covers topics 1.1 to 1.4; session 2 covers electrons and the periodic table; how many questions and points, about 95 minutes, a calculator allowed; the periodic table and Avogadro's number, with links (`/tools/periodic-table/`, `/tools/equations/`); write each answer in full before opening the answer and the rubric. Then the four parts, `## Part A: Moles and counting particles` and so on. The summary's count is corrected to the count as built.

### Task 3: Check session 1, and open the pull request

Plan 4's "How every session is checked", with Unit 1's paths:

- [ ] **Number checks:** run `scratchpad/unit1-test/checks/part-[abcd].py`; each ends "all match".
- [ ] **Figures:** for each entry of `figures/part-b.json`, draw the file with the figure script into `scratchpad/unit1-test/figures/`, run the verify script, render at 236 and 328 px and look; copy the files into `public/figures/`.
- [ ] **Compare the parts:** list every element, isotope set and compound in the four drafts; send a repeat back to one of its writers.
- [ ] **Assemble** `src/content/practice/unit-1/comprehensive-test-session-1.mdx` from the heading and the drafts with `scratchpad/unit3-test/assemble.cjs` (fixes go to the drafts, never to the session file); build; unit and browser tests under the lock; measure the page at 412, 390, 360 and 320 px with every answer open, and name any equation or table that scrolls (`scratchpad/unit7-practice/wide-eq.cjs`, `scratchpad/unit7-test/wide-table.cjs`).
- [ ] **Fact-checks,** one per part, by fresh agents (`scratchpad/unit1-test/factcheck-brief.md`): solve every question before reading its answer; score your own answer with the rubric and say where a sound answer by another route could not be scored, and where a blank or a wrong answer could earn a point; apply each rule the page states to every example on it; check every item of Fact 9; confirm every reference value against a second source and every site value against the data files; recover each figure's peaks from its file.
- [ ] **The originality check** (Sonnet), with Fact 7's sources and the avoid list: any repeated scenario, substance with its numbers, setting, or kind of question the site already sets.
- [ ] **Fixes** by the part's writer (a list decided by the controller, with any corrected number recomputed first); the number checks again; assemble, build, test and **measure again**; **a second fact-check** of the whole session; last fixes; measure again.
- [ ] **Commit** (`feat(practice): add the Unit 1 comprehensive test, session 1`), push, open the pull request with base `main`, and watch its check on GitHub until it passes. The body gives the questions and points by part, what the checks found, the weak originality matches left, the models used, and what is put to the teacher.

> **As carried out (2026-11-24), Tasks 1 to 3.** Pull request #66: 19 questions, 91 points (A 23, B 24, C 24, D 20), two drawn mass spectra.
>
> - **Task 1.** A Sonnet agent built the pools with a script (`scratchpad/unit1-test/pools.md`, `pools-check.py`: 635 checks); the controller recomputed all eleven isotope averages and every ionization-energy rise independently before use. One correction: the pool's valence and core counts for d-block atoms were removed, since lesson 1.5 counts them for main-group elements only.
> - **The figure script** was generalized by an agent to draw from a JSON list (`scratchpad/unit1-test/figures.cjs`, `figures-verify.cjs`). Its regression test was seen to fail first, then to reproduce the two published practice figures byte for byte.
> - **Three rows of the table above asked for the site's own questions,** and the writers wrote them: question 6 (Worksheet 2's zirconium question: the isotope count, the balance-point estimate, the neutron counts), question 17 (lesson 1.4's quicklime Check) and question 19 (lesson 1.4's bronze paragraph). The first originality check found all three; each was rebuilt with a different task:
>   - question 6 keeps its figure, the calculated average and the element, and asks what the peak positions alone can and cannot decide, and why whole-number masses give another average;
>   - question 17 starts from the oxygen atoms for every lead atom (given in the stem) and asks for the share of formula units, against the share by mass;
>   - question 19 goes from an atom ratio to a mass percent, and weighs a student's claim that a ratio near 3 to 1 makes a compound.
> - **Other changes of setting** after that check: question 1 (no peppermint oil), question 9 (no labeled bottle), question 15 (a chemist proposes the formula; no supplier's label, which question 18's labeled drum and lesson 1.4's labeled jar already had).
> - **Fact-checks** (one per part, then two agents for the session): no wrong answer, number or reference value in either round. A writer corrected one item of a decided list (a ranking "from amounts of molecules" was untrue of zinc metal).
> - **A general statement that failed on another question of the page:** question 19's test of "small whole numbers" (multipliers 2 to 6) would have ruled out toluene, C₇H₈, of question 11; it now goes to 7 and says "weak evidence".
> - **Phones:** six tables were too wide at 320 px after the first build and were narrowed; nothing scrolls now.
> - **Tests:** 1,247 unit and 1,530 browser tests (four new: each test figure is drawn with a text alternative that names every peak and fits a 320 px phone; the build check itself refuses the page when a figure file is missing); 102 pages.

---

## Group C: session 2 (pull request C)

Branch `topic/unit-1-test-session-2`, from `topic/unit-1-test-session-1`.

### Task 4: Write session 2

Four writers in parallel, as in Task 2:

| Part | Title | Topic | Questions | Points | The tasks (one question each, in any order) |
|---|---|---|---|---|---|
| E | The atom and its configuration | 1.5 | 5 (questions 20–24) | about 23 | (1) Three species given only as a configuration and a charge: name each; and one element from its electrons counted shell by shell, with its valence electrons. (2) From a list of seven atoms and ions, choose the ones with the same electrons as a given one, and rank those by size with the reason. (3) Two students' configurations for one ion of a d-block metal, one of whom took the electrons from the wrong subshell: say which is right and why, and classify a third configuration as ground state, excited or impossible. (4) Coulomb's law as a ratio: the force when the charge doubles, when the distance triples, and when both change; then the energy to remove an electron from two atoms that differ in shell and in nuclear charge, weighed in a sentence and checked against values given. (5) An element just after the d block: its core and valence electrons, and why the full d subshell counts as core; and a student's claim about which electrons a d-block atom loses first |
| F | Photoelectron spectra | 1.6 | 5 (questions 25–29) | about 23 | (1) Three unlabeled spectra, as tables, matched to three of four named elements, with the evidence for each match and why the fourth fits none. (2) A drawn spectrum said to be a named element's, with two things wrong in it: name each and say what the right spectrum would show. (3) A spectrum whose heights are given on another scale (the tallest as 6, or heights that add up to 100): the electron counts, the configuration and the element. (4) The peak of the outermost electrons in three elements of one group and in the elements of one period, from a table: what changes generally, and the one step that goes the other way, explained by two electrons sharing an orbital. (5) Without values: what the spectrum of a 2+ or 3+ ion shares with its atom's and with that of the neutral atom with the same electrons (peaks, heights, positions); and which of positions alone or heights alone can name an element |
| G | Periodic trends | 1.7 | 5 (questions 30–34) | about 23 | (1) Two tables of one property along a row or down a column: in one a value is a misprint, in the other a break is real: tell which is which and explain the real one. (2) Three pairs of elements in which nuclear charge and distance pull opposite ways: for each, which has the larger first ionization energy (or radius, or electronegativity), weighed in a sentence, and say for which pair the data cannot be predicted with confidence. (3) Radii across period 4: the large fall across the d block and the near-level values after it, explained. (4) First ionization energies across period 4: find the two steps that fall, say why each is small, and rewrite a student's explanation that names no force. (5) Electronegativities that tie, and a missing value estimated from the column and from the row, with which to trust; then three ions that do not have the same electrons, ranked by size with the reason |
| H | Valence electrons and ionic compounds | 1.8 | 4 (questions 35–38) | about 20 | (1) Four unnamed lists of successive ionization energies, matched to groups 1, 2, 13 and 17, with the rises that decide each, and why the group 13 list is the hardest to read. (2) A metal's successive ionization energies and a nonmetal's group: the two ions, the formula and the reason for each charge; then a formula of the pattern M₂X₃ and the metal's data: which group is X in. (3) Two students explain why an element forms a 2+ ion, one from "wanting" a noble-gas configuration and one from the data: weigh both; and a claim that a jump after the third ionization energy proves that an element's compounds hold a 3+ ion: what the data show and what they do not. (4) Three written formulas for compounds of given elements, one with the subscripts on the wrong ions, one balanced but not in lowest terms, one right; then the moles of electrons that change hands in making a given mass of an ionic compound from its elements |

Session 2 frontmatter:

```yaml
---
title: "Comprehensive test, session 2: electrons and the periodic table"
kind: test
order: 8
topics: ["1.5", "1.6", "1.7", "1.8"]
summary: Nineteen scored free-response questions on electron configurations, photoelectron spectra, periodic trends and ionic compounds, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 95
---
```

The introduction as session 1's, for topics 1.5 to 1.8, and it says that session 1 covers moles, isotopes, formulas and mixtures.

### Task 5: Check session 2, and open the pull request

- [ ] **As Task 3**, with `part-[efgh]`, `figures/part-f.json`, `comprehensive-test-session-2.mdx`. Before the fact-checks the controller compares session 2's parts with one another **and with session 1's**.
- [ ] With both sessions in place, check by hand: each Unit 1 lesson's "Practice next" lists the session that covers its topic; the unit page lists the eight documents in order; no value has two values under `src/content/practice/unit-1` and the lessons.
- [ ] **Commit** (`feat(practice): add the Unit 1 comprehensive test, session 2`).

> **As carried out (2026-11-24), Tasks 4 to 6.** 18 questions, 85 points (E 24, F 22, G 19, H 20), one drawn photoelectron spectrum. **The table of Task 4 above was not used.**
>
> - **The table was pre-cleared before any writer started.** After session 1, the originality checker compared each of its 19 tasks with the lessons and practice themselves: 7 would have rebuilt an existing lesson passage, Check or practice question with another element, and 9 shared a part with one. The avoid list had indexed the lessons' questions but not their text: lesson 1.5 already works the d-block cation error and counts core electrons after the d block; lesson 1.6 already says the outermost peak slips back twice and compares a cation with its atom and with argon; lesson 1.7 already explains both slips, the fade of the breaks in period 4, and estimates a value from its column and row; lesson 1.8 already has the noble-gas-configuration Trap, the Check on what a jump shows, and the route from a metal's data to a formula.
> - **The tasks the writers were given** (`scratchpad/unit1-test/session-2-tasks.md`), as they ended:
>   - **E:** species named from a configuration and a charge, and an ion from its electrons shell by shell; from seven ions, the ones with the same electrons, then a missing radius bounded and estimated; a cation's written configuration classified (the right count, 4s kept, 3d short), and the neutral atom that the same configuration is the ground state of; an attraction against a repulsion by Coulomb's law; two shells of a krypton atom and where the next element's electron goes.
>   - **F:** three printouts on three scales matched to three of four names; a sketched spectrum with mistakes (drawn); positions without heights; a spectrum with no numbers on its axis; an inner peak and the lowest peak in two elements of period 3, against a student's prediction.
>   - **G:** one copied radius that is wrong, told from a step that is level and real; a rough estimate along a diagonal, checked against data, and where it fails; a claim that first ionization energy depends only on nuclear charge, tested on six pairs; two ties in a table to one decimal, and three anions ranked.
>   - **H:** four unnamed lists of ionization energies matched to four groups, and which further value would show the jump that is missing; a formula M₂X₃ read back to the group of X; two group 1 metals and selenium (two students' statements about a prediction, and an experiment); three written formulas and the electrons that change hands.
> - **Even so, the first originality check found parts of seven questions too close to the lessons,** and they were rebuilt: question 22 (it no longer asks for the cation's ground state as a part of its own), 24 (it no longer recites the capacity table), 27 (boron from positions, not sodium from heights, which a ladder sets), 28 (built around the lost axis, not the lesson's sentences on F⁻), 29 (not the group 1 peaks, which are printed first ionization energies), and the question on two group 1 metals (now question 36, whose middle parts had repeated the skill ladders and lesson 1.8).
> - **One question was dropped.** Part G's fifth question was first a missing value estimated two ways (lesson 1.7's potassium-radius Check in kind), then a run of ten unnamed elements (the lesson's own text on periods, with radii that other questions on the page name). Topic 1.7's lesson leaves no fifth task that is not its own, so Part G has four questions and the session eighteen.
> - **Fact-checks** (one per part, then two agents for the session): no wrong answer, number or reference value in either round. Every successive ionization energy was confirmed against NIST by a checker's own lookup.
> - **One question handing over another's answer** was the commonest finding of the second round, across parts as well as inside them: question 29's first tables named values that questions 25 to 27 gave unnamed; question 25's printouts bracketed the 1s peak of question 27's element; rubidium's 403 kJ/mol, named in question 32, was the first value of an unnamed list in Part H. The group 1 list is sodium's for that reason (potassium's first two values are the data of lesson 1.8's Check).
> - **Left as they are:** barium's first two ionization energies open an unnamed list and are named in lesson 1.8's Check (no group 2 element is free of the site); question 26 names fluorine with a lowest binding energy of 1.68 MJ/mol, which is the first value of the group 17 list in other units (the rubric gives no point for a list recognized without its rises).
> - **Phones:** eight tables were too wide at 320 px after the first build (three of them at 360 px, one at 390 px) and were narrowed; nothing scrolls now.
> - **The hand checks:** each Unit 1 lesson's "Practice next" lists the session that covers its topic; the unit page lists the eight documents in order.
> - **Tests:** 1,247 unit and 1,540 browser tests; 103 pages.

### Task 6: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Update the local `CLAUDE.md` (not committed).
- [ ] Commit (`docs: record how the Unit 1 comprehensive test was built`), push, open pull request C with base `main`, watch its check on GitHub until it passes, and leave it for the teacher.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3. Two pages, eight parts, drawn spectra | 2, 3, 4, 5 |
| 4. What each part asks | The part tables of Tasks 2 and 4 |
| 5. Beyond the exam | "What changes for Unit 1"; the fact-check |
| 6. Original questions, honest values | Facts 5 to 7; Task 1; "What changes for Unit 1"; the originality check |
| 7. How each session is made | Tasks 1 to 5 |
| 8. Pull requests | A, 3, 6 |
| 9. Code | None |
| 10. Done when | 3, 5, 6 |
