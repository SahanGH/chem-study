# ChemStudy: a new Unit 7 comprehensive test

Written on 2026-11-15. It follows the Unit 5 and Unit 2 comprehensive tests
(`2026-11-13-chemstudy-unit-5-comprehensive-test-design.md`,
`2026-11-14-chemstudy-unit-2-comprehensive-test-design.md`) and changes
nothing in them, or in the main design.

## 1. Why

Unit 7 has its twelve lessons and its seven practice documents. The teacher's
old Unit 7 material has no comprehensive test to convert, and its unit exam
stays closed. On 2026-11-14 the teacher asked for Unit 7 "end-to-end", and
Units 5 and 2 each end with a comprehensive test written fresh for the site.

## 2. What is decided

| Question | Decision | Whose |
|---|---|---|
| Fresh questions from the AP framework; free response only; every question scored; a "Show answer" with the worked solution and the rubric; one page per sitting | As Units 5 and 2 | The teacher's, for Unit 5 (2026-11-13) |
| Size | Two sittings, about 41 questions | Claude's, following the teacher's choice for Unit 2 (2026-11-14); the pull request asks the teacher to confirm or change it |
| Merging | Claude merges each pull request once its check passes and the content has been fact-checked and checked for originality | The teacher's, for Unit 7 (2026-11-14) |

## 3. What students get

Two practice pages in Unit 7, listed after the free-response set:

| Order | Page | Parts | Topics | Size |
|---|---|---|---|---|
| 8 | Comprehensive test, session 1: equilibrium and its constant | A: Reversible reactions and equilibrium (5 questions)<br>B: The reaction quotient and the equilibrium constant (5)<br>C: Calculating the equilibrium constant (5)<br>D: The size of K and the rules for K (5) | 7.1–7.6 | 20 questions, about 95 points, about 100 minutes |
| 9 | Comprehensive test, session 2: using the equilibrium constant | E: Calculating equilibrium concentrations (6)<br>F: Particle pictures of equilibrium (3)<br>G: Le Châtelier's principle and Q (6)<br>H: Solubility and the common-ion effect (6) | 7.7–7.12 | 21 questions, about 105 points, about 110 minutes |

The pages work as the other comprehensive tests do: the same blocks, a "Show
answer" on every part, and a rubric that adds up to each question's points.
Each lesson's "Practice next" links to the session that covers its topic.
Counts and points are targets; a part may end a question or a few points
either way if that makes better questions.

**No pictures.** A practice page has no figures. A graph is given as a table
of values or described in a sentence. A particle picture (Part F) is given as
a table of particle counts in a stated volume, and the question says what each
count stands for.

## 4. Weight per topic

There is no old test to take weights from, so they come from the framework's
learning objectives and from what the AP exam asks most often in this unit:
calculations with K (7.4, 7.7), Le Châtelier's principle with Q (7.9, 7.10)
and solubility (7.11, 7.12).

| Part | Topics | Questions | What they practice |
|---|---|---|---|
| A | 7.1, 7.2 | 5 | What is equal at equilibrium and what is not; reading a table of concentrations or rates against time for when equilibrium is reached; how the two rates change on the way; reaching the same equilibrium from either side; a claim to correct |
| B | 7.3 | 5 | Writing K_c and K_p, with solids and liquids left out; Q for a mixture as it stands; what K depends on; K_c and K_p told apart (never converted) |
| C | 7.4 | 5 | K from equilibrium concentrations or partial pressures; K from a starting mixture and one measured equilibrium value, with a table of initial, change and equilibrium rows; K from the fraction that reacted |
| D | 7.5, 7.6 | 5 | What a very large, very small or middling K says, and what it does not say (speed); K for a reversed, a scaled and a summed equation; a K built from two given ones |
| E | 7.7 | 6 | Which way a mixture runs, from Q; equilibrium concentrations by a perfect square, by the small-x shortcut with its 5 percent check, and from partial pressures; one case where the check fails and the quadratic formula is needed |
| F | 7.8 | 3 | K or Q from particle counts; deciding from counts whether a mixture is at equilibrium; why the volume matters when the two sides have different numbers of particles |
| G | 7.9, 7.10 | 6 | The direction of a shift for an added or removed substance, a volume change, a temperature change, an unreactive gas and a catalyst; the same shifts explained with Q and K; what happens to K; Q just after a disturbance, from numbers |
| H | 7.11, 7.12 | 6 | K_sp expressions; molar solubility from K_sp and K_sp from a solubility; comparing salts that give different numbers of ions; solubility with a common ion, with its check; the common-ion effect explained with Q and with Le Châtelier's principle |

Every topic has at least two questions and every pair of neighboring topics
at least five. A question may name more than one topic.

## 5. Beyond the exam

The framework leaves out two things in Unit 7, both in topic 7.3: converting
between K_c and K_p, and a dissolved species in equilibrium with the same
species as a gas. No question asks for either. The effect of pH on solubility
is Unit 8 and is not asked. The quadratic formula is not excluded; the test
uses it once, in Part E, and the session's introduction says the exam seldom
needs it. If a question needs anything else the framework does not ask for,
that part is labeled "Beyond the exam".

## 6. Keeping the questions original

- Every question is written fresh from the framework's learning objectives,
  with its own substances, numbers and context.
- **The writers read no textbook and none of the old course.** They read the
  framework notes, the site's Unit 7 lessons and the site's Unit 7 practice.
- **An avoid list from the start.** Unit 2's test showed that writers who
  never read a textbook still pick its standard examples. Before any writer
  starts, one agent lists every reaction or salt, with its numbers, that a
  source uses in a calculation: the equilibrium chapters of both Tro books,
  the teacher's closed Unit 7 exam, and the site's own lessons and practice.
  Writers get the list of what to avoid, never the sources.
- **One pool of systems per part.** From what the avoid list leaves, each
  part is given its own real reactions or salts, so that two parts do not
  pick the same one. The controller compares the parts' systems again before
  the fact-checks.
- **An independent originality check** then compares every new question with
  the same sources. A question that repeats a scenario, or a system together
  with the same numbers, is rewritten. A shared system alone is not a
  finding.
- **Values are honest.**
  - A K_sp is a handbook value at 25 °C, and the same value the site already
    uses wherever it uses one.
  - An equilibrium constant is given with a temperature only where the value
    is real for that temperature. Otherwise the question says "at a certain
    temperature", or uses letters (A, B, X₂), or says the data are made up.
  - A calculated solubility is never called measured.

## 7. How each session is made

The pipeline that made the other two tests, with the two additions of
section 6:

1. **The avoid list and the pools**, once, before session 1.
2. **Writers, in parallel**, one per part, files only.
3. **A number check.** Each writer leaves a script that recomputes every
   number in its part from the question's own data: every K and Q, every
   solved x put back into its K expression, every 5 percent check, every
   solubility. The controller runs every script.
4. **The systems compared across the session's parts.**
5. **An independent fact-check** per part on Fable 5.2, by a fresh agent that
   solves every question before reading its answer and scores its own answer
   with the rubric.
6. **The originality check**, one agent per session, on Sonnet.
7. **Fixes, a second check of what changed, a build, the unit and browser
   tests**, and a look at each page at 412, 390, 360 and 320 px with every
   answer open.
8. **A pull request**, merged by Claude when its check passes.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Session 1 |
| C | Session 2, and the close-out notes |

## 9. Code

None expected. The practice kind `test`, the blocks and the build check
(every part answered, every rubric adding up) already exist.

## 10. Done when

- Both pages are live. Every question is answered, every rubric adds up, and
  the topics are covered as section 4 says.
- Every number has been recomputed by a script, and every part has been
  fact-checked independently.
- The originality check found no repeated scenario, or system with its
  numbers.
- No salt has two K_sp values anywhere on the site.
- Both pages fit a phone at 320 px with every answer open, and pass the
  browser tests' accessibility checks.
