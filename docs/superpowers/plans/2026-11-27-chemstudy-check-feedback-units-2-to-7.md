# ChemStudy Check Feedback for Units 2, 3, 4, 5 and 7: Implementation Plan

**Goal:** Every Check in Units 2, 3, 4, 5 and 7 says something useful when a student gets it wrong, as Unit 1's do, and in each of those units every option is the answer for 15 to 35 percent of the Checks with options.

**Asked for:** by the teacher on 2026-11-27 ("We need to do C and D for all completed units"), after pull requests #69 to #71 were merged.

**Design:** `docs/superpowers/specs/2026-11-26-chemstudy-us-english-and-unit-1-check-feedback-design.md`. Its section 8 provides for this: each unit is one more data file and one more pull request, with the unit added to the two lists. Its "As built" section lists what the next unit should do differently; every brief carries those points. Nothing in the design changes.

**Builds on:** `2026-11-26-chemstudy-us-english-and-unit-1-check-feedback.md`, Group D (Tasks 6 to 10). The code of Group C needs no change: `Check` already takes `misses`, `slips` and `tolerance` in every unit.

## The units

Counted on `main` at `bd4b62e` (the merge of #71).

| Unit | Lessons | Choice Checks | Wrong options | Typed-number Checks | Answers at options 1 to 4 |
|---|---|---|---|---|---|
| 2 | 7 | 27 | 81 | 2 | 6, 12, 9, 0 |
| 3 | 13 | 40 | 120 | 18 | 10, 15, 11, 4 |
| 4 | 9 | 30 | 90 | 9 | 7, 6, 11, 6 |
| 5 | 11 | 27 | 81 | 9 | 3, 12, 11, 1 |
| 7 | 12 | 33 | 99 | 16 | 6, 9, 11, 7 |

Every Check with options has four options. 18 typed-number Checks have no `unit`.

## What is the same as Unit 1

- The data file is the master copy: `docs/superpowers/plans/2026-11-27-chemstudy-unit-<n>-check-feedback.json`, in Unit 1's format.
- The messages follow section 4.4 and 4.5 of the design.
- Writers and fact-checkers run on Fable 5.2, each with a fresh context. A first fact-check solves every Check before reading its messages. A second check reads every message that changed. A browser check clicks every wrong option and types every slip.
- The data file is written into the lessons by the apply tool of the Unit 1 plan (Task 7), never by hand. A second run must change nothing.
- The unit goes on `FEEDBACK_UNITS` (`scripts/check-dist.mjs`) and `BALANCED_UNITS` (`tests/unit/check-balance.test.ts`).

## What is different

1. **One pull request per unit, stacked in the order 2, 3, 4, 5, 7**, so that each adds its unit to the two lists without a conflict. Each waits for the teacher.
2. **A skeleton data file per unit is made from the lessons by a script:** every Check, its options word for word, its answer, its numeric answer and unit. A writer fills in the messages and slips and does not retype an option.
3. **A validator** (session scratch folder, not part of the site) checks a data file before it is applied:
   - every rule the build enforces;
   - slips outside the tolerance;
   - the 15 to 35 percent balance;
   - British spellings;
   - a dry run of the apply tool on a copy of the lessons.

   A writer runs it until it reports no problems.
4. **The apply tool leaves `unit` off a Check that has none.** The plan's version would have written `unit=undefined`.
5. **Balance by reordering.** Units 2 and 5 need several Checks moved (Unit 2 has no answer at option 4); Units 3 and 4 need one or two; Unit 7 needs none. A Check is reordered only when neither its question nor its explanation refers to an option by position, and its options are not in a natural order (numbers in sequence, estimates). The fewest moves that reach the range are made.
6. **Unit 5's browser tests change.** The tests in `tests/e2e/lesson.spec.ts`, `a11y.spec.ts` and `csp.spec.ts` that click lesson 5.2's Checks expect "Not quite. Try another."; with Unit 5 on the list, they expect that option's message. If one of those Checks is reordered, the option a test clicks is updated with it.
7. **One browser test reads every data file**, instead of handwritten tests per unit. For each unit on `FEEDBACK_UNITS`, it clicks one wrong option of each choice Check and types one slip of each typed-number Check, and expects the message from the data file. It runs on the desktop project.
8. **Tolerances.** A slip that lies within 2 percent of the answer gets the widest tolerance, at most 2, that still refuses it. Before it is chosen, the writer lists the roundings a student gives to one figure fewer and with three-figure intermediates. If the explanation says the page marks that slip correct, the sentence changes (`explanation_edit`), as in lesson 1.1.

## Tasks, for each unit in turn

- [ ] Writer fills the skeleton; the validator reports no problems.
- [ ] First fact-check; decided fixes applied to the data file by script; second check of every changed message.
- [ ] The unit goes on the two lists: the balance test and the build fail first, for the right reason.
- [ ] Apply, then compare; read the diff: only Check tags, reordered options and any `explanation_edit` sentence change.
- [ ] `npm test`, `npm run build`, the browser tests; a look at each lesson at 412, 390, 360 and 320 px with a wrong answer showing; a browser check by a fresh agent.
- [ ] An "As carried out" note here; the pull request, listing reorders, tolerances, changed sentences, messages changed in the checks and anything a checker was unsure of.
