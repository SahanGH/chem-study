# ChemStudy Unit 6 Comprehensive Test Implementation Plan

**Goal:** Put a new Unit 6 comprehensive test on chem-study.com: two pages, one per sitting, 37 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-6/` of the kind `test`, built from the existing practice blocks. The avoid list, the task table and a pool per part are made. One writer per part drafts its questions and a number-check script; the controller runs the scripts, compares the parts, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-6-comprehensive-test-design.md`.

**Builds on:** Plan 4 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`), whose sections **"The writer's guide"** and **"How every session is checked"** apply, with the general rules of Plan 11 (`2026-11-15-chemstudy-unit-7-comprehensive-test.md`, "What changes for Unit 7": systems from a pool; honest values; rubric lines that score every sound route; the number check), the lessons at the end of the Unit 1 test's design ("For the tests to come"), and the changes in this plan's "What changes for Unit 6".

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists.** Unit 6's six practice documents take orders 1 to 6, so the two sessions are 7 and 8. A frontmatter `summary` is at most 200 characters, a `title` at most 80.
2. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions.
3. **Room on a phone.** A calculation inside a part's answer has room for about 25 characters at 320 px. A table inside a part has about 190 px (236 px in a stem): three short columns at most.
4. **The site's values.** Atomic masses from the exam's table (`src/data/elements.ts`), every molar mass their sum to two decimal places. Water's specific heat capacity is 4.18 J/(g·°C). Lesson 6.7's bond enthalpies (kJ/mol): H–H 436, C–H 413, C–C 347, C=C 614, C≡C 839, C–O 358, C=O 745, O–H 463, O=O 495, N–H 391, N≡N 941, Cl–Cl 243, H–Cl 431, as its table has them (copy from the lesson, not from this list). Lesson 6.8's formation values are in its tables.
5. **The groundwork** is in `scratchpad/unit6-test/`: `avoid-list.md` (for each topic, what the lessons' text, worked examples, Checks and Traps, the practice and the teacher's notes and review sheet already use, the kinds of question already set with a count of each, and what is free; **nothing under `exam/` was read**); `task-table.md` (the 37 tasks, each compared with the pages themselves, with the nearest existing passage and what to change; spare tasks at its end); `pools.md` (a pool of substances and values per part, **every value from memory**, graded A, B or C by how sure its author was).
6. **The sources for the originality check only** (writers never read them): the teacher's `u06-notes.tex`, `u06-review.tex`, `u06-map.tex`, `u06-selfstudy.tex`, `u06-frq.tex` and `worksheets/u06-ws1.tex` to `u06-ws4.tex` in `/home/user/sahangh/ap_chem_prep/Units/unit06-thermochemistry/`, **named one by one, never the `exam/` folder**; the site's `src/content/lessons/unit-6/` and `src/content/practice/unit-6/`. No textbook can be read from this session. `scratchpad/unit6/teacher-avoid-list.md`, an older file, is read by no one: it has lines taken from the unit exam.
7. **The framework for Unit 6:** `scratchpad/ced/unit6-framework.md`, written from memory.
8. **What Unit 6's fact-checks kept finding** (design, section 6, last item).

## Conventions, models

Conventional commits with **no AI-attribution trailer**; American English (`CLAUDE.md`); never swallowing an error; everything that is not the site in the scratch folder.

**Models:** writers and fact-checkers on Fable; the originality checks and fixers on Sonnet.

**Merging:** Claude merges each pull request when its "Build and test" check passes on GitHub.

**A correction to a number** proposed by any agent is recomputed by the controller in a script before it is applied.

## What changes for Unit 6

Give this section to every writer with Plan 4's writer's guide and Plan 11's general rules.

- **What a writer reads:** the framework notes for its topic (Fact 7); `src/content/lessons/unit-6/` for its topic and the ones it leans on; `src/content/practice/unit-6/` (what students have already practiced; the model of the format is `src/content/practice/unit-7/comprehensive-test-session-1.mdx`); the avoid list (its topic's sections and the closing lists), its part of the task table, and its own pool. It never reads the AP Chem repository, any textbook, or `scratchpad/unit6/`.
- **Where it writes:** `scratchpad/unit6-test/drafts/part-<x>.mdx` (the part's `## Part X: Title` heading, its opening sentence and its questions, numbered as its brief says) and `scratchpad/unit6-test/checks/part-<x>.py`.
- **Tasks:** the ones the task table gives its part, each with the change its "Risk" cell asks for. Never one of the kinds the avoid list counts for its topic with a new substance. If a task cannot be made to work, use a spare from the table's last section and say so.
- **Substances and settings:** from the part's own pool. Never one of the things the avoid list says the test must use nowhere, and never a setting on its closing list.
- **Values.** No lookup is possible. A stem gives every value its question uses, introduced by "use these values" or "take", and the answer uses exactly those. Take values from the pool; prefer grade A. A value graded C is used only with "take" and is listed in the handoff report. Bond enthalpies are lesson 6.7's where its table has the bond. Molar masses are the exam table's sums to two decimal places. Made-up data say they are made up.
- **Signs, units, figures.** $q$ and $\Delta H$ carry signs from the system's point of view; an amount "released" or "absorbed" is a size. $\Delta T$ is final minus initial. Joules and kilojoules are never set equal: show the conversion. A $\Delta H$ for an equation is in kJ/mol of reaction, written $\text{kJ/mol}_\text{rxn}$ as lesson 6.6 does. Every thermochemical equation carries a state symbol on every species. Thousands carry a comma (`1{,}234` in math). Significant figures follow the data; where a printed result is rounded, the step shows the carried value, and a tie at the last figure kept is avoided by choosing other data.
- **The terms of the lessons:** specific heat capacity; "size", not "magnitude"; kinetic energy, not speed; energy diagram (two levels and an arrow) for topic 6.2, and never a hill, a peak or activation energy; "standard enthalpy of formation"; "bond enthalpy"; "broken minus formed" with ≈; "energy" where a body holds something, "heat" only for energy passing. Never "state function", "intensive" or "extensive".
- **Fact 8 is a checklist for every answer and every rubric line.** Test each "only", "always", "never" and "most" on another example before writing it.
- **Rubrics:** a point is for something a student's answer shows. Where there are two sound routes, the line says both earn the point. A line that names a number accepts the neighbors that honest rounding gives. A scoring note says what it applies to ("earns 0 for the part"; "does not earn the second point"). No point can be earned by a blank answer.
- **Tables:** three short columns at most inside a part, and no table that names a value another question on the same session gives unnamed.
- **Beyond the exam:** nothing should need the label (design, section 5).
- **The number check** recomputes, from the question's own data, every number the answer and rubric show, to the figures given, asserts each against the MDX, and ends `part <x>: N values checked, all match`. Every published value a question states is listed in the script with the pool's grade, for the fact-checker.

## The two pages

```yaml
---
title: "Comprehensive test, session 1: energy on the move"
kind: test
order: 7
topics: ["6.1", "6.2", "6.3", "6.4", "6.5"]
summary: Nineteen scored free-response questions on systems and signs, energy diagrams, heat transfer, calorimetry and phase changes, each with a worked answer and its scoring rubric.
points: (the sum)
minutes: 95
---
```

```yaml
---
title: "Comprehensive test, session 2: the enthalpy of a reaction"
kind: test
order: 8
topics: ["6.6", "6.7", "6.8", "6.9"]
summary: Eighteen scored free-response questions on enthalpy of reaction, bond enthalpies, enthalpies of formation and Hess's law, each with a worked answer and its scoring rubric.
points: (the sum)
minutes: 95
---
```

| Part | Topics | Questions | Numbers | Points (about) |
|---|---|---|---|---|
| A: Systems, signs and dissolving | 6.1 | 4 | 1 to 4 | 17 |
| B: Energy diagrams, and heat transfer | 6.2, 6.3 | 6 | 5 to 10 | 23 |
| C: Heat capacity and calorimetry | 6.4 | 5 | 11 to 15 | 26 |
| D: Energy of phase changes | 6.5 | 4 | 16 to 19 | 22 |
| E: Enthalpy of reaction | 6.6 | 5 | 1 to 5 | 26 |
| F: Bond enthalpies | 6.7 | 4 | 6 to 9 | 20 |
| G: Enthalpy of formation | 6.8 | 5 | 10 to 14 | 23 |
| H: Hess's law | 6.9 | 4 | 15 to 18 | 19 |

**Shared substances settled:** sulfur dioxide and the sulfur oxides belong to Part H (H2); Part G's carbon disulfide question (G2) keeps SO₂ only as a product whose value its own stem gives. Magnesium hydroxide belongs to Part E (E5); Part G's G5 uses ammonium chloride and one other salt from its pool that is not a magnesium compound.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-6-test-design`, from `main`.

## Group B: session 1 (pull request B)

Branch `topic/unit-6-test-session-1`, from `topic/unit-6-test-design`.

### Task 1: Write both sessions

- [ ] Eight writers in parallel, one per part, each with `scratchpad/unit6-test/writer-brief.md`. Both sessions are written at once; session 2's drafts wait in the scratch folder.

### Task 2: Check session 1, and open the pull request

- [ ] Run every number check. Compare the parts' substances and values across all eight drafts.
- [ ] Assemble session 1 (front matter, an introduction on the model of Unit 7's, Parts A to D), build, test, measure at 412, 390, 360 and 320 px with every answer open.
- [ ] One fact-check per part; the originality check for the session; decide each finding; fixers; a second check of the whole page; measure again.
- [ ] Commit (`feat(practice): add the Unit 6 comprehensive test, session 1`), push, open the pull request with base `main`, merge when its check passes.

## Group C: session 2 (pull request C)

Branch `topic/unit-6-test-session-2`, from `topic/unit-6-test-session-1`.

### Task 3: Check session 2

- [ ] As Task 2, with Parts E to H.

### Task 4: Close out

- [ ] "As built" in the design; "As carried out" notes here; the list for the teacher of every value no checker could confirm.
- [ ] Commit, push, open pull request C, merge when its check passes, confirm the deploy.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3, 4: two pages, eight parts, 37 tasks | 1, 2, 3 |
| 5: nothing beyond the exam | "What changes for Unit 6"; the fact-checks |
| 6: original questions, honest values | Facts 5 and 6; the pools; the originality checks |
| 7: how a session is made | 1 to 3 |
| 8: pull requests | A, 2, 4 |
| 10: done when | 2, 3, 4 |
