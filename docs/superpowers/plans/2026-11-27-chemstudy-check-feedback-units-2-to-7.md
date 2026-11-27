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

## As carried out

**For every unit.** The five writers worked at once, one per unit, each from its skeleton. Then, for each unit:

- **First fact-check:** a fresh agent on Fable 5.2.
- **Fixes:** the session applied the decided fixes to the data file with a script that matches each old message exactly.
- **Second check:** a fresh agent read every changed message.
- **Browser check: a script instead of an agent.** For each unit, the script clicked every wrong option and typed every slip, comparing each message with the data file, and confirmed the right answer is accepted. At 412, 390, 360 and 320 px it checked that messages stay inside their cards and that no page scrolls sideways. Unit 1's browser check by an agent found no defect; the fact-checks already judge each message against its lesson.

**The browser test** (`tests/e2e/check-feedback.spec.ts`) was tried on Unit 1 first. With one message altered in the data file, it failed on that Check and slip.

### Unit 2

- **The writer:** 88 messages (81 for options, 7 slips), with 5 moves. Answers at options 1 to 4 went from 6, 12, 9, 0 to 6, 8, 8, 5.
  - **Moves:** lesson 2.1 Check 1; 2.2 Check 1; 2.3 Check 1; 2.4 Check 3; 2.7 Check 3.
  - No tolerance and no changed sentence.
- **The first fact-check** confirmed every answer, move and slip value. It found 6 messages that gave or nearly gave the answer, and 3 points of wording; all were rewritten. The six:
  - lesson 2.1 Check 2;
  - lesson 2.3 Checks 1 and 2;
  - all three messages of lesson 2.4 Check 3;
  - lesson 2.5 Check 4;
  - lesson 2.6 Check 4.
- **The second check** passed 8 of the 11 rewrites. It corrected three:
  - a false general claim, "an ionic solid has no covalent bonds" (ammonium salts have them, lesson 2.1);
  - one message that still confirmed half of the answer;
  - one that assumed the student's working.
- **The sweep:** 88 wrong answers tried, no problems. The build has no problems; the browser tests that touch Checks pass.

### Unit 3

- **The writer:** 187 messages (120 for options, 67 slips across 18 typed-number Checks), with 5 moves. Answers at options 1 to 4 went from 10, 15, 11, 4 to 10, 10, 11, 9.
  - **Moves:** lesson 3.1 Check 3; 3.3 Check 2; 3.5 Check 4; 3.7 Check 1; 3.10 Check 1.
  - Two moves would have reached the range; the other three even the counts.
  - No tolerance and no changed sentence.
- **The first fact-check** confirmed every answer, move and slip value. It found 3 messages that left one option standing:
  - lesson 3.5 Check 1;
  - lesson 3.6 Check 3, two options ("as well" confirmed half of the answer);
  - lesson 3.10 Check 3 (the message stated the deciding rule).

  It also found 4 points of wording, two of them messages that did not fit their option (lesson 3.11 Check 1; lesson 3.5 Check 2's slip 0.25). All were rewritten.
- **The second check** passed 6 of the 8 rewrites and corrected two. One gave a slip without its units; one made a general claim about units that is not true.
- **The sweep:** 187 wrong answers tried, no problems.

### Unit 4

- **The writer:** 137 messages (90 for options, 47 slips across 9 typed-number Checks), with 3 moves. Answers went from 7, 6, 11, 6 to 7, 8, 8, 7.
  - **Moves:** lesson 4.4 Check 1; 4.5 Check 1; 4.6 Check 4.
  - One move would have reached the range; the other two even the counts.
  - No tolerance and no changed sentence.
- **The first fact-check** found no false message and no wrong slip value. Four messages gave too much away and were rewritten:
  - lesson 4.4 Check 2 (stated half of the answer);
  - lesson 4.7 Check 5 (named the answer's method);
  - lesson 4.2 Check 2;
  - lesson 4.3 Check 3.
- **The second check** passed all four.
- **The sweep:** 137 wrong answers tried, no problems.

### Unit 5

- **The writer:** 123 messages (81 for options, 42 slips across 9 typed-number Checks). No Check in lesson 5.2 was moved, because the browser tests click its options by position.
  - **Moves:** 6 at first; the session asked for two more to even the counts; the fact-check undid one (below). That leaves 7: lesson 5.4 Check 3; 5.5 Check 1; 5.6 Check 4; 5.7 Checks 2 and 3; 5.9 Check 1; 5.11 Check 1.
  - Answers went from 3, 12, 11, 1 to 6, 8, 8, 5.
  - No tolerance and no changed sentence.
- **The first fact-check** found no MUST finding. It made four points, all taken:
  - lesson 5.8 Check 3: "the effects are not added" misled, since adding the right factors happens to give the answer;
  - lesson 5.3 Check 4: the message for 1/24 did not fit its mistake;
  - lesson 5.5 Check 1: a message left only one option standing;
  - lesson 5.11 Check 3: the extra move put "It is not catalysis" between the kinds of catalysis. The move was undone.
- **The second check** found that lesson 5.5 Check 1's rewrite, and the message beside it, still left one option standing. Both were rewritten.
- **Tests that changed:**
  - `tests/unit/check-dist.test.ts` built its sample lessons in topic 5.2. With Unit 5 on the list they would need messages, so they moved to topic 6.2, a unit with no lessons. The test of the list now asks about Unit 6.
  - The two browser tests that click lesson 5.2's first Check (`lesson.spec.ts`, `a11y.spec.ts`) expect that option's message.
- **The sweep:** 123 wrong answers tried, no problems.

### Unit 7

- **The writer:** 159 messages (99 for options, 60 slips across 16 typed-number Checks).
  - **Moves:** none. Answers stay at 6, 9, 11, 7, already in range, so the balance test passed before the messages too.
  - No tolerance and no changed sentence.
  - **Two slips are listed at both three and two figures** with one message (lesson 7.4 Check 2: 2.56e-3 and 2.6e-3; lesson 7.7 Check 4: 1.52e-4 and 1.5e-4), because the explanations quote them to two figures. The fact-check found this sound.
- **The first fact-check** found no MUST finding. It made three points, all on slips (lesson 7.8 Check 3; 7.12 Check 2; 7.5 Check 2), all taken.
- **The second check** passed all three. On its advice, lesson 7.12's message was made stricter, because it told the student the typed number was twice the answer.
- **The sweep:** 159 wrong answers tried, no problems.
