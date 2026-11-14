# ChemStudy: a new Unit 5 comprehensive test

Design agreed with the teacher on 2026-11-13. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it.

## 1. Why

The teacher's old comprehensive test for Unit 5
(`D:\AP_Chem_Prep\Units\unit05-kinetics\exam\u05-test-full.tex`) was left
out of Plan 3. Its 57 free-response questions are reworded from textbook
exercises (Zumdahl, chapter 12), so publishing them would publish a
publisher's problems in new words. The teacher decided to replace it with
new, original questions.

## 2. What the teacher decided

| Question | Decision |
|---|---|
| How much | The old Parts A–E only: about 44 questions. The old Part F, a 13-question challenge set entirely beyond the AP exam, is left out for now and may be decided later |
| How original | Fresh questions, written from the AP framework's learning objectives. The old test is used only to set how much weight each topic gets and the size of the point values. No question follows a textbook exercise |
| Pages | Two pages, one per sitting |

## 3. What students get

Two practice pages in Unit 5, listed after the free-response set:

| Order | Page | Parts | Topics | Size |
|---|---|---|---|---|
| 7 | Comprehensive test, session 1: rates and rate laws | A: Rates and rate laws from data (10 questions)<br>B: Concentration over time and half-life (15) | 5.1–5.3 | 25 questions, about 130 points, about 140 minutes |
| 8 | Comprehensive test, session 2: mechanisms, energy and catalysis | C: Mechanisms (8)<br>D: Collisions and energy profiles (7)<br>E: Catalysis (4) | 5.4–5.11 | 19 questions, about 95 points, about 100 minutes |

Every question is free response and scored, and has a "Show answer" that
reveals the worked solution and the scoring rubric, as the free-response set
does. Nothing is typed or graded. Each lesson's "Practice next" links to the
session that covers its topic. A printed page carries only the answers that
are open, as every practice page does.

The counts and points are targets. A part may end a question or a few
points either way if that makes better questions; the pull request says so.

## 4. Weight per topic

Taken from the old test's Parts A–E, trimmed where the old test repeated
itself. The old test had 19 questions on topic 5.3, many of them the same
"find the order from these data" task with new numbers.

| Part | Topic | Questions | What they practice |
|---|---|---|---|
| A | 5.1 | 3 | Rates of different species from the coefficients; average rate over an interval; reading a rate from a concentration–time graph |
| A | 5.2 | 7 | Orders from initial rates (two and three reactants, a factor other than 2); the rate law and its overall order; $k$ with units; a predicted rate; the units of $k$ for each order |
| B | 5.3 | 15 | Finding the order from which plot is straight (data sets of each order); $k$ from a slope, with units; concentration after a time and time to reach a concentration (first, second and zero order); first-order half-life both ways; fraction left after whole half-lives; finding the order from successive half-lives |
| C | 5.4 | 2 | Molecularity; the rate law of an elementary step; why three-body steps are rare |
| C | 5.7 | 2 | Steps that add to the overall equation; intermediates and catalysts in a mechanism |
| C | 5.8 | 2 | The rate law from a slow first step; whether a mechanism fits a measured rate law |
| C | 5.9 | 2 | A fast equilibrium before a slow step; removing the intermediate from the rate law |
| D | 5.5 | 2 | The two conditions for a reacting collision; the distribution of energies and temperature |
| D | 5.6 | 3 | Reading $E_a$ (forward and reverse) and $\Delta H$ from a profile; temperature and rate in words. At most two Arrhenius calculations, labeled "Beyond the exam" |
| D | 5.10 | 2 | A multistep profile: intermediates in the valleys, the rate-limiting step |
| E | 5.11 | 4 | A catalyst against an intermediate in a mechanism; a profile with and without a catalyst; the kinds of catalysis the framework names; what a catalyst changes and what it does not |

Every topic from 5.1 to 5.11 has at least two questions. A question may
name more than one topic.

## 5. Beyond the exam

This follows the rule the teacher set in Plan 3:

- At most two Arrhenius calculations, both in Part D, each labeled
  "Beyond the exam" (the framework leaves them out in topic 5.6).
- Wherever a question needs the zero-order or second-order half-life
  formula, that part is labeled the same way. A part that can be solved
  from the integrated rate laws is not labeled, as Plan 3 found for
  Worksheet 2.
- Nothing else goes beyond the 2024 framework.

## 6. Keeping the questions original

- Every question is written fresh from the framework's learning
  objectives (`D:\AP_Chem_Prep\Reference\ap-chemistry-course-and-exam-description.pdf`,
  Unit 5), with its own reaction, data and context.
- The writers do not read the old test's questions, only the weights in
  section 4, which come from it.
- **An independent originality check** compares every new question with:
  the old test, which stands in for the Zumdahl exercises behind it; the
  kinetics chapters of both Tro books in `Tro_Reference`; and the six
  practice documents already on the site, so that no question repeats one
  a student has already seen. A question that shares its reaction **and**
  its data, or its exact scenario, with any of them is rewritten. A shared
  reaction alone is acceptable: there are only so many well-studied
  reactions.
- The sample reactions should be real where the question says so. Where
  the data are made up, the question speaks of a reaction such as
  $\ce{A -> B}$, or says the data are for illustration, so that no
  invented rate constant is presented as a measured fact about a real
  substance.

## 7. How each session is made

The same pipeline that made Plans 2 and 3 work:

1. **Writers, in parallel**, one per part, files only (no build, no git).
   Each gets the topic targets, the style guide in the plan, the framework
   text and the list of questions already on the site.
2. **A number check.** Each writer leaves a Python script in the scratch
   folder that recomputes every number in its part from the question's own
   data. For every "find the order" data set the script fits all three
   orders and shows that only the intended one is straight, as the old
   test's author did. The controller runs every script.
3. **An independent fact-check** per part on Opus, read-only: solve from
   the question alone, check units and significant figures, check every
   statement against the framework and the site's lessons, confirm every
   "Beyond the exam" label.
4. **The originality check** (section 6), one agent per session.
5. **A build, the unit and browser tests**, and a look at both pages at
   412, 390, 360 and 320 px with every answer open.
6. **A pull request**, which stops for the teacher's merge.

Session 1 is one pull request and session 2 another.

## 8. Code

One change. A new practice kind, `test`, which shows as "Comprehensive
test" in the line above the page's title. It is added test-first
in `src/lib/practice-id.ts`. Everything else exists already: the
`Question`, `Part`, `Answer`, `Rubric`, `RubricLine` and `Beyond` blocks,
part headings as `##` sections, and the build check
(`scripts/check-dist.mjs`) that requires every part to have an answer,
every rubric to add up to its question's points and the page's points to
add up to its questions.

## 9. Not in this design

- The old Part F (challenge set). The teacher may decide it later.
- Multiple-choice questions. Practice has no multiple-choice block, and
  this design does not add one.
- New tests for the other units. They come with Stage 2.

## 10. Done when

- Both pages are live, with every question answered, every rubric adding
  up and every topic from 5.1 to 5.11 practiced at least twice.
- Every number has been recomputed by a script and every part
  fact-checked independently.
- The originality check found no question that shares its reaction and
  data, or its exact scenario, with the old test, the Tro books or the
  site's other practice.
- Both pages fit a phone at 320 px with every answer open, and pass the
  accessibility checks the browser tests run.
