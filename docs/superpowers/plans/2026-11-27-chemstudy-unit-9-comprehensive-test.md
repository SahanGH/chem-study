# ChemStudy Unit 9 Comprehensive Test Implementation Plan

**Goal:** Put a new Unit 9 comprehensive test on chem-study.com: two pages, one per sitting, 37 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-9/` of the kind `test`, built from the existing practice blocks. The avoid list, the task table and a pool per part are made. One writer per part drafts its questions and a number-check script; the controller runs the scripts, compares the parts, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-9-comprehensive-test-design.md`.

**Builds on:** Plan 4 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`), whose sections **"The writer's guide"** and **"How every session is checked"** apply, with the general rules of Plan 11 (`2026-11-15-chemstudy-unit-7-comprehensive-test.md`, "What changes for Unit 7"), the Unit 6 test's plan (`2026-11-27-chemstudy-unit-6-comprehensive-test.md`, "What changes for Unit 6" and its "As carried out" note), the lessons at the end of the Unit 1 and Unit 6 tests' designs ("For the tests to come"), and the changes in this plan's "What changes for Unit 9".

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists.** Unit 9's seven practice documents take orders 1 to 7 (skill ladders 1, worksheets 2 to 6, free-response set 7), so the two sessions are 8 and 9. A frontmatter `summary` is at most 200 characters, a `title` at most 80.
2. **Unit 9's practice must be on `main` first.** On 2026-11-27 this checkout had no `src/content/practice/unit-9/`; the seven documents were staged in `scratchpad/unit9-practice/staging/`. The test's branches start from `main` after the practice is merged, and writers read the staged texts or the merged ones, whichever exist.
3. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions.
4. **Room on a phone.** A calculation inside a part's answer has room for about 25 rendered characters at 320 px. A table inside a part has about 190 px (236 px in a stem): three short columns at most in a part, four in a stem.
5. **The unit's values.** R = 8.314 J/(mol·K); F = 96,485 C per mole of electrons; 25 °C is 298 K; RT at 298 K is 2.48 kJ/mol. The lessons' formation values, entropies and eight reduction potentials are in the lessons' design (section 3, "Values") and in `scratchpad/unit9/lesson-table.md`. Atomic masses are the exam table's (`src/data/elements.ts`), every molar mass their sum to two decimal places.
6. **The groundwork** is in `scratchpad/unit9-test/`: `avoid-list.md` (for each topic, what the lessons, the practice and the teacher's non-exam materials already use, the kinds of question already set with a count of each, and what is free; **nothing under `exam/` was read**, and the teacher's side comes from `scratchpad/unit9/teacher-avoid-list.md`, which was made under the same rule); `task-table.md` (the 37 tasks with their reactions, values and worked numbers, each compared with the pages, with the nearest existing passage; dropped tasks and spares at its end); `pools.md` (a pool per part, **every value from memory**, graded S, F or T by how sure its author was); `values.py` (every number of the task table, multiplied out).
7. **The sources for the originality check only** (writers never read them): in `/home/user/sahangh/ap_chem_prep/Units/unit09-thermodynamics-electrochemistry/`, the files `u09-notes.tex`, `u09-review.tex`, `u09-map.tex`, `u09-selfstudy.tex`, `u09-frq.tex` and `worksheets/u09-ws1.tex` to `u09-ws5.tex`; and the chapter notes, worksheets, self-study and free-response sets on entropy, free energy and electrochemistry in `Lessons-md/chapter17-thermodynamics/` and `Lessons-md/chapter18-electrochemistry/`. **Each file is named one by one after listing the folder; never an `exam` folder, never a file with "exam" or "test" in its name, never a recursive search that would read one.** The site's `src/content/lessons/unit-9/` and `src/content/practice/unit-9/`. No textbook can be read from this session.
8. **The framework for Unit 9:** `scratchpad/ced/unit9-framework.md`, written from memory. The College Board's site cannot be reached.
9. **What Unit 6's and Unit 9's fact-checks kept finding** (design, section 6, last item).

## Conventions, models, roles

Conventional commits with **no AI-attribution trailer**; American English (`CLAUDE.md`); never swallowing an error; everything that is not the site in the scratch folder.

| Role | Model | Does | Never does |
|---|---|---|---|
| Writer, one per part | Fable (the strongest) | Writes its part's draft and its number check | Builds, commits, reads the teacher's repository |
| Fact-checker, one per part | Fable | Solves every part before reading its answer; reports | Edits anything |
| Second checker, two parts at a time | Fable | Treats every sentence as new; reports | Edits anything |
| Reviser, one per part that needs it | Fable | Rewrites the parts the originality check named | Touches any other question |
| Originality checker, one per session | Sonnet | Compares every part with the site and the teacher's non-exam files; reports | Edits anything; opens an `exam` folder or an "exam" or "test" file |
| Fixer, one per part | Sonnet | Applies the list the controller decided, exactly | Decides any chemistry |
| Controller | this session | Runs every number check; decides every finding; recomputes every corrected number; assembles, builds, tests, measures, commits, opens and merges pull requests | Delegates a build, a commit or a merge |

**Merging:** Claude merges each pull request when its "Build and test" check passes on GitHub.

**A correction to a number** proposed by any agent is recomputed by the controller in a script before it is applied.

## What changes for Unit 9

Give this section to every writer with Plan 4's writer's guide, Plan 11's general rules and the Unit 6 plan's section.

- **What a writer reads:** the framework summary for its topics (Fact 8); `src/content/lessons/unit-9/` for its topics and the ones they lean on, in full; the Unit 9 practice (Fact 2); the model of the format, `src/content/practice/unit-6/comprehensive-test-session-1.mdx` and `-session-2.mdx`; the avoid list (its topics' sections and the closing lists), its part of the task table, and its own pool. It never reads the AP Chem repository, any textbook, or `scratchpad/unit9/` apart from `lesson-table.md`.
- **Where it writes:** `scratchpad/unit9-test/drafts/part-<x>.mdx` (the part's `## Part X: Title` heading, its opening sentence and its questions, numbered as the table below says) and `scratchpad/unit9-test/checks/part-<x>.py`.
- **Tasks:** the ones the task table gives its part, with the reactions, cells and values named there, each with the care its "Risk" cell asks for. Never one of the kinds the avoid list counts for its topic with a new substance. If a task cannot be made to work, use a spare from the table's last section and say so.
- **Substances, cells and settings:** from the part's own pool. Never one of the fourteen things the avoid list says to use nowhere, never a cell on its list of cells already made, never a setting on its closing list.
- **Values.** No lookup is possible. A stem gives every value its question uses, introduced by "use these values" or "take", and the answer uses exactly those. Only values in the unit's table or in the pool. A value graded T, or F where the pool says so, is used with "take" and listed in the report. Made-up data say they are made up.
- **Inside the framework** (design, section 5). No number from the cell-potential (Nernst) equation. No ΔG away from standard conditions as a calculation. No Le Châtelier argument for a working cell, and never "the equilibrium shifts" in Parts E to H: argue through Q. No electrode with a plus or minus sign. No "oxidizing agent" or "reducing agent". No cell notation. No entropy of the surroundings.
- **The terms of the lessons:** "thermodynamically favored" and "thermodynamically unfavored" (after the first use in a question, "favored" may stand alone); never "spontaneous", "favorable" or "unfavorable" for a process: the two terms of ΔG° "work for" or "work against" a change. Entropy as how widely matter and energy are spread; never "disorder". "Standard entropy"; "free energy" after "Gibbs free energy" once; "kinetic control"; "galvanic cell", "electrolytic cell", "half-cell", "salt bridge", "standard reduction potential", "cell potential". Charge is $q$; the reaction quotient is $Q$; the two never meet in one question.
- **Units and steps.**
  - $S^\circ$ in J/(mol·K); $\Delta H^\circ$ and $\Delta G^\circ$ of a reaction in $\text{kJ/mol}_\text{rxn}$; $\Delta S^\circ$ in $\text{J/(mol}_\text{rxn}\text{·K)}$. Every quantity carries its unit, and every Δ and every potential its sign, plus included.
  - **J/K is turned to kJ/K on a line of its own before any subtraction.**
  - **In $\Delta G^\circ = -RT\ln K$ and $\Delta G^\circ = -nFE^\circ$ the answer is shown in joules first, then in kilojoules on its own line.**
  - **A potential is never multiplied by a coefficient.** $E^\circ_\text{cell}$ is cathode minus anode, both read from the table unchanged. $n$ comes from the balanced overall equation.
  - Faraday's law is a chain of four steps (seconds; coulombs; moles of electrons; moles and mass through the half-reaction), never one formula.
  - Temperature in kelvins in every equation. Thousands carry a comma: 96,485 in text and `96{,}485` in math.
  - A state symbol on every species of every equation. A half-reaction in base is given, never balanced by the student.
  - Significant figures follow the data; where a printed result is rounded, the step shows the carried value, and a tie at the last figure kept is avoided by choosing other data. $\Delta G^\circ$ from a potential is rounded to the nearest kilojoule.
- **Layout and markup** (in full in `writer-brief.md`): about 25 rendered characters to a display line; `aligned` with `&` on every row; no inline equation in a rubric line or a list item that must wrap; three short columns at most in a table inside a part.
- **Fact 9 is a checklist for every answer and every rubric line.** Test each "only", "always", "never" and "most" on another example before writing it. End a question on something its own data decide: a part that asks "why" or "what does this show" is the likeliest to restate a lesson.
- **Rubrics:** each `<RubricLine>` on one line; one line for each part, agreeing with that part's answer; the lines sum to the question's `points`. A point is for something a student's answer shows. Where there are two sound routes, the line says both earn the point. A line that names a number accepts the neighbors that honest rounding gives, and an answer worked with 96,500 C/mol. A scoring note says what it applies to. No point can be earned by a blank answer.
- **The number check** recomputes, from the question's own data, every number the answer and rubric show, to the figures given, asserts each against the MDX, checks every rubric's sum, and ends `part <x>: N values checked, all match`. Every published value a question states is listed in the script with the pool's grade, for the fact-checker. `scratchpad/unit6-test/checks/` shows how.

## The two pages

```yaml
---
title: "Comprehensive test, session 1: entropy and free energy"
kind: test
order: 8
topics: ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7"]
summary: Nineteen scored free-response questions on entropy, free energy and favorability, kinetic control, equilibrium, dissolving and coupled reactions, each with a worked answer and its scoring rubric.
points: (the sum)
minutes: 95
---
```

```yaml
---
title: "Comprehensive test, session 2: electrochemistry"
kind: test
order: 9
topics: ["9.8", "9.9", "9.10", "9.11"]
summary: Eighteen scored free-response questions on galvanic and electrolytic cells, cell potential and free energy, nonstandard conditions and Faraday's law, each with a worked answer and its scoring rubric.
points: (the sum)
minutes: 95
---
```

| Part | Topics | Questions | Numbers | Points (about) |
|---|---|---|---|---|
| A: Entropy | 9.1, 9.2 | 5 | 1 to 5 | 20 |
| B: Gibbs free energy and favorability | 9.3 | 5 | 6 to 10 | 25 |
| C: Kinetic control, and free energy and equilibrium | 9.4, 9.5 | 5 | 11 to 15 | 25 |
| D: Dissolving, and coupled reactions | 9.6, 9.7 | 4 | 16 to 19 | 18 |
| E: Galvanic and electrolytic cells | 9.8 | 4 | 1 to 4 | 18 |
| F: Cell potential and free energy | 9.9 | 5 | 5 to 9 | 26 |
| G: Cells away from standard conditions | 9.10 | 4 | 10 to 13 | 18 |
| H: Electrolysis and Faraday's law | 9.11 | 5 | 14 to 18 | 26 |

**Shared values settled.** Tin's half-cell serves F2 (the cathode for three anodes), F4 (found from an equilibrium) and G4 (a concentration cell); lead's serves E2, F1, F4 and G1, in four different cells; cadmium's serves E2, G2 and H4, in three; zinc's serves F1, F2 and H4; manganese's serves G3 (with acid) and H5 (a plating bath). Sulfur dioxide is a product in A3 and the reactant of C1, with different reactions. Carbon monoxide belongs to B5 (with soot) and C4 (with steam); A4 has it once in a sum. Magnesium sulfate belongs to D2 only, magnesium hydroxide to D4 only. ATP at −30.5 kJ/mol belongs to D3 only.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-9-test-design`, from `main` (after Unit 9's practice is merged: Fact 2).

- [ ] Copy `scratchpad/unit9-test/design.md` and `plan.md` to `docs/superpowers/specs/2026-11-27-chemstudy-unit-9-comprehensive-test-design.md` and `docs/superpowers/plans/2026-11-27-chemstudy-unit-9-comprehensive-test.md`. Read both once more for American English (the spelling check does not read `docs/superpowers/`).
- [ ] Commit (`docs: design and plan for the Unit 9 comprehensive test`), push, open the pull request, merge when its check passes.

## Group B: session 1 (pull request B)

Branch `topic/unit-9-test-session-1`, from `topic/unit-9-test-design`.

### Task 1: Write both sessions

- [ ] Eight writers in parallel on Fable, one per part, each with `scratchpad/unit9-test/writer-brief.md` and its part's letter and question numbers. Both sessions are written at once; session 2's drafts wait in the scratch folder.

### Task 2: Check session 1, and open the pull request

- [ ] Run every number check (`python3 scratchpad/unit9-test/checks/part-<x>.py`). Compare the parts' substances, cells and values across all eight drafts.
- [ ] One fact-check per part on Fable (`factcheck-brief.md`); decide each finding; recompute every corrected number; fixers on Sonnet (`fixer-brief.md`); run the number checks again.
- [ ] The originality check for the session on Sonnet (`originality-brief.md`); decide each finding; a reviser on Fable for each part with a STRONG or MODERATE finding (`reviser-brief.md`).
- [ ] A second check on Fable, two parts at a time, told to treat every sentence as new; last fixes.
- [ ] Assemble session 1 (`python3 scratchpad/unit9-test/assemble.py 1`), build, run `npm test` and the browser tests, measure at 412, 390, 360 and 320 px with every answer open. Repeat after any fix.
- [ ] Commit (`feat(practice): add the Unit 9 comprehensive test, session 1`), push, open the pull request with base `main`, merge when its check passes.

## Group C: session 2 (pull request C)

Branch `topic/unit-9-test-session-2`, from `topic/unit-9-test-session-1`.

### Task 3: Check session 2

- [ ] As Task 2, with Parts E to H and `assemble.py 2`. The fact-checkers and the second checkers of Parts E to H are told again: no number from the cell-potential equation, no Le Châtelier argument, no electrode sign, no potential multiplied.

### Task 4: Close out

- [ ] "As built" in the design; "As carried out" notes here; the list for the teacher of every value no checker could confirm, and of the three tasks at the framework's edge (design, section 2) with what the checkers said of each.
- [ ] Commit, push, open pull request C, merge when its check passes, confirm the deploy.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3, 4: two pages, eight parts, 37 tasks, eleven topics | 1, 2, 3 |
| 5: nothing beyond the exam | "What changes for Unit 9"; the fact-checks |
| 6: original questions, honest values | Facts 6 and 7; the pools; the originality checks |
| 7: how a session is made; the roles | "Conventions, models, roles"; 1 to 3 |
| 8: pull requests | A, 2, 4 |
| 10: done when | 2, 3, 4 |
