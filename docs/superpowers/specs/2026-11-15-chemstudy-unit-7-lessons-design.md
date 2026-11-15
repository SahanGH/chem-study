# ChemStudy: Unit 7 lessons

Written on 2026-11-15. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it. It
follows the Unit 3 lessons (`2026-11-14-chemstudy-unit-3-lessons-design.md`)
and keeps what that work taught.

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Next unit | Unit 7, Equilibrium (2026-11-14: "proceed Unit 7 end-to-end autonomously and pr and merge as well") |
| Scope | The whole unit: lessons, then the practice converted from the teacher's materials, then a comprehensive test. This design covers the twelve lessons and their diagrams. The practice and the test each get their own design and plan. |
| Merging | Claude merges each Unit 7 pull request itself once its "Build and test" check passes and its content has been fact-checked and checked for originality. This holds for Unit 7 only. |
| The old course | The teacher's Unit 7 guided notes are a reference for coverage and emphasis, as for Units 2 and 3. |
| Models | Writers and fact-checkers on Fable 5.2; fixers and originality checks on Sonnet (2026-11-14). |

## 2. What students get

Twelve lessons, one per topic of the 2024 framework:

| Topic | Lesson |
|---|---|
| 7.1 | Introduction to Equilibrium |
| 7.2 | Direction of Reversible Reactions |
| 7.3 | Reaction Quotient and Equilibrium Constant |
| 7.4 | Calculating the Equilibrium Constant |
| 7.5 | Magnitude of the Equilibrium Constant |
| 7.6 | Properties of the Equilibrium Constant |
| 7.7 | Calculating Equilibrium Concentrations |
| 7.8 | Representations of Equilibrium |
| 7.9 | Introduction to Le Châtelier's Principle |
| 7.10 | Reaction Quotient and Le Châtelier's Principle |
| 7.11 | Introduction to Solubility Equilibria |
| 7.12 | Common-Ion Effect |

Each lesson is built like the Unit 3 lessons, with the same blocks and the
same voice. Each ends with `PracticeNext`, which says practice is on its way
until the Unit 7 practice is published.

Topics 7.2, 7.4, 7.5 and 7.8 each have one piece of essential knowledge.
Their lessons are short, not padded.

**What the lessons can lean on.** Unit 5 is on the site: rates, rate laws and
the collision model, which topics 7.1 and 7.2 build on. Unit 3 is on the
site: molarity (3.7), partial pressure (3.4) and particle drawings (3.8).
Units 4, 6 and 8 are not, so a lesson that needs exothermic and endothermic
(7.9), a precipitate (7.11) or pH (7.9) says what it needs in a sentence and
names the topic it belongs to.

## 3. Staying inside the framework

**The framework was read from page pictures**, not from extracted text,
before anything else was written (`scratchpad/ced/unit7-framework.md`). The
extracted text loses the equilibrium arrow, the fractions in the K
expressions and every subscript.

Lessons are written fresh from the framework's learning objectives and
essential knowledge. **No textbook is used.**

**The teacher's guided notes**
(`D:\AP_Chem_Prep\Units\unit07-equilibrium\u07-notes.tex`) are read by the
controller, not by the writers: the notes follow the Zumdahl textbook. Each
brief carries what the notes stress:
- equilibrium means equal rates, not equal amounts, and nothing has stopped;
- Q has the same form as K but takes the concentrations at any moment;
- pure solids and pure liquids are left out, and the state symbol decides
  whether water appears;
- the exponent is where marks are lost when K is calculated;
- K says how far, never how fast;
- reversing, scaling and adding reactions multiply and invert K, where
  enthalpies add;
- an ICE table is the before-and-after table of stoichiometry with an
  unknown, and its change row follows the coefficients;
- the 5 percent check is part of the answer, and it is the ratio of the
  starting concentration to K that decides whether it passes;
- a perfect square needs no quadratic formula;
- only temperature changes K; an inert gas at constant volume and a catalyst
  shift nothing;
- treat energy as a reactant or a product;
- Q answers "which way?" for any mixture, while Le Châtelier's principle
  applies only to a system that was at equilibrium;
- K_sp is a constant and solubility is a position;
- K_sp values can be compared directly only for salts that give the same
  number of ions;
- a common ion lowers solubility and leaves K_sp alone.

**What the framework leaves out of Unit 7** (both statements sit in topic
7.3):
- conversion between K_c and K_p;
- calculations where a dissolved species is in equilibrium with the same
  species as a gas.

The notes teach K_p = K_c(RT)^Δn with a worked example. Lesson 7.3 may name
the conversion in a paragraph that begins "**Beyond the exam:**", with no
calculation. The framework asks students to know the conceptual difference
between K_c and K_p and to notice which one a question uses, and the lesson
teaches that.

**Things the framework does not name but the exam uses**, taught without a
"Beyond the exam" label: the ICE table as a routine (7.7); the small-x
approximation with its 5 percent check (7.7); that a catalyst and an inert
gas at constant volume cause no shift (7.9). The quadratic formula appears
once in 7.7, for the case where neither shortcut works, marked as rare on
the exam.

**The equation sheet** gives the K_c and K_p expressions and nothing else
for this unit. It gives no expression for Q, no K_sp, and none of the rules
of topic 7.6. Lessons say so where it matters.

**Values.** K_sp values and equilibrium constants for real substances are
real values at 25 °C, with the temperature stated, and each brief says where
a value varies between tables. Where a value is made up, the lesson says so
or speaks of substance X.

## 4. Keeping the lessons original

What Unit 3 taught, applied from the start:

- **Every scenario is searched for before it is used.** The briefs are
  checked for originality against both Tro books and the teacher's notes
  before the plan is committed, and every replacement is searched for
  before it goes in. A replacement can match too.
- **Avoid lists from the start.** Each brief-writer is given the worked
  examples and numbers of the teacher's notes, and the stock examples of
  every textbook, as things not to use: the Haber reaction with
  0.50, 0.30 and 0.20 M; hydrogen and iodine with K = 50.0 from 1.00 M;
  A ⇌ B + C with K = 1.0 × 10⁻⁵ from 0.100 M; silver chloride in 0.10 M
  sodium chloride; calcium fluoride with K_sp = 4.0 × 10⁻¹¹.
- **The finished prose is checked again**, since sentences drift toward a
  textbook's wording even when the scenario is new.

## 5. Checks that test something

Also from Unit 3, written into every brief:

- A Check is an application. It is never answered by the sentence, caption
  or key idea just above it.
- The correct option is not always first, and is not the longest.
- For a numeric Check, the answer a common wrong method gives lies outside
  the grader's 2 percent, so the mistake is caught.
- An answer that needs a power of ten is written in e-notation and shows as
  a power of ten.

## 6. Diagrams

### 6.1 Interactive diagrams (Svelte, like Units 2, 3 and 5)

**Approach to equilibrium (lesson 7.1; lesson 7.2 refers back to it).**
- A reversible reaction A ⇌ B, each direction first order, with 1.00 M of
  material in all.
- The student chooses the starting mixture (all A, all B, or half of each)
  and a pair of rate constants (forward 0.8 and reverse 0.2 per second, 0.5
  and 0.5, or 0.2 and 0.8). Rate constants, not K: students know them from
  topic 5.2, and K is not defined until topic 7.3.
- Two graphs, one above the other: the concentrations of A and B against
  time, and the forward and reverse rates against time.
- A time slider moves a marker along both graphs. The readout gives the two
  concentrations, the two rates and which way the net change runs at that
  moment.
- What it shows: the concentrations level off at unequal heights; the rates
  become equal; the same mixture is reached from either side.
- Every number in the readout is exact for what is shown: the two
  concentrations add to 1.00 M, and each rate is its rate constant times the
  concentration shown.
- The curves are the exact solution for this model, computed in a tested
  module, `src/lib/equilibrium.ts`.

**Disturbing an equilibrium (lesson 7.10).**
- The gas-phase system N₂O₄(g) ⇌ 2 NO₂(g) at a temperature where K = 0.490,
  at equilibrium to begin with ([N₂O₄] = 0.0625 M, [NO₂] = 0.175 M). These
  are lesson 7.10's numbers, chosen so that every new equilibrium is exact.
- The student applies one disturbance: add NO₂, add N₂O₄, halve the volume,
  double the volume, or warm the mixture.
- One graph of both concentrations against time: flat, a jump at the
  disturbance, then a move to the new equilibrium.
- Under it, a table of the concentrations, Q and K before, just after the
  disturbance, and at the new equilibrium. For the first four disturbances K
  does not change; warming changes K and leaves Q where it was.
- The new equilibrium concentrations are computed exactly. The shape of the
  path between is illustrative, and the caption says so.
- **N₂O₄ and NO₂ are the system every course uses** for these ideas, both
  Tro books included: one colorless gas, one brown, and an endothermic
  forward reaction. The lessons use it too, with their own numbers and with Q
  calculated at every stage. The originality check rated the shared system
  a moderate match and found none of the lessons' numbers in a source.
- The readout says which way the reaction runs and why, in the words of
  topic 7.10: the disturbance makes Q differ from K.

Both follow the rules of the existing diagrams: drawn in their starting
state when the site is built; readable without JavaScript and in print;
usable by keyboard; a text description for screen readers; stacked panels
with drawn text of 12 px or more from a 412 px phone up; every number shown
comes from a module with unit tests, compared with values computed
independently; values shown together multiply out as shown.

### 6.2 Drawn figures

Static SVG files in `public/figures/`, in the style of Unit 3's. Fourteen,
as the briefs settled them:

| Lesson | Figure |
|---|---|
| 7.1 | A sealed bottle where evaporation and condensation come into balance, particle level |
| 7.1 | Concentrations against time for a reaction reaching equilibrium |
| 7.1 | The same reaction started from the other side, reaching the same mixture |
| 7.2 | Forward and reverse rates against time, meeting |
| 7.3 | Which species appear in Q: a gas and a dissolved species are in, a solid and a liquid are out |
| 7.5 | Three equilibrium mixtures of three made-up reactions: K far below 1, near 1, far above 1 |
| 7.6 | Two reactions added, with their K values multiplied |
| 7.7 | Q on a number line beside K, and the direction each side runs |
| 7.7 | An ICE table laid out as a picture, with the change row tied to the coefficients |
| 7.8 | One reaction before equilibrium and at equilibrium, with K read from the counts |
| 7.8 | A reaction with unequal particle numbers, where each particle stands for a concentration |
| 7.9 | A concentration–time graph with one disturbance |
| 7.11 | A saturated solution with solid at the bottom: dissolving and crystallizing in balance |
| 7.12 | The same salt in pure water and in a solution of a common ion, particle level |

Lessons 7.4 and 7.10 have no drawn figure: 7.4's tables are ordinary tables,
and 7.10 has the second diagram. Particle drawings keep exact counts, and K
is computed from the counts drawn.

## 7. How it is made

The Unit 3 pipeline, with its lessons learned built in:

1. **The framework, from page pictures.** Done.
2. **Briefs**, one per lesson, each with a number-check script.
3. **A fact-check of the briefs** on Fable 5.2, and **an originality check**
   on Sonnet. Replacements are searched for before they are used.
4. **The plan**, with this design, in one pull request.
5. **The code, test-first**, each diagram by one builder that runs unit
   tests only; then a TypeScript review and a code review.
6. **Writers, in parallel**, one per lesson, files only.
7. **One build and one test run**, and a look at each lesson at 412, 390,
   360 and 320 px with every answer open, and at each figure.
8. **A fact-check per lesson** on Fable 5.2, by a fresh agent that solves
   before it reads, and **an originality check** per group on Sonnet.
9. **Fixes** by the lesson's own writer, then the build and tests again,
   then **a second check** of what changed.
10. **The pull request**, merged by Claude once its check passes, with the
    deploy watched.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | The approach-to-equilibrium diagram, lessons 7.1–7.4 |
| C | Lessons 7.5–7.8 |
| D | The disturbance diagram, lessons 7.9–7.12, the close-out notes |

## 9. Not in this design

- The Unit 7 practice: Worksheets 1–5, the self-study ladders and the
  free-response set, converted from the teacher's materials under the rules
  of Units 2 and 5. The unit exam (`exam/u07-exam.tex`) stays closed.
- A Unit 7 comprehensive test, after the practice.
- Unit 3's practice and comprehensive test, which wait until Unit 7 is done.

## 10. Done when

- All twelve lessons are live and pass the browser and accessibility tests.
- Every lesson has been fact-checked independently and checked for
  originality, twice where it changed, and every accepted finding is fixed.
- No lesson scrolls sideways at 320 px with every answer open.
- Both interactive diagrams work by keyboard, and both show a drawn picture
  without JavaScript and in print.

## As built (Plan 9, 2026-11-15)

Twelve lessons, 49 Checks (16 of them numeric), 19 worked examples, 14 drawn
figures and two interactive diagrams, in four pull requests (#34 to #37).

- **Every lesson was fact-checked twice on Fable 5.2** by fresh agents that
  solved each Check before reading its answer. No round found a wrong
  answer, number, particle count or plotted value. Their findings were about
  wording: a rule stated without its condition, a Check that could be
  answered without thinking, a K_c set beside a K_p.
- **Every group was checked for originality twice on Sonnet.** No lesson
  shares a scenario's numbers with a source. The briefs had two strong
  matches, both solubility examples, and they were replaced before the plan
  was committed. `salt-clearance.md` in the session scratch folder records
  which salts appear in a source's solubility calculations.
- **What changed from this design:**
  - The first diagram lets the student pick rate constants, not K, because
    K is not defined until lesson 7.3.
  - The second diagram uses lesson 7.10's own numbers (K = 0.490, starting
    at 0.0625 M and 0.175 M), chosen so that all five new equilibria are
    exact decimals. It shows a table under the graph, not beside it.
  - Fourteen figures, not ten: lesson 7.1 gained two concentration graphs,
    lesson 7.7 a number line for Q against K, and lesson 7.8 a second
    particle drawing.
- **Two rules for writing lessons came out of the work**, and they hold for
  the units to come:
  - An answer option is never math alone. A rendered fraction's visible
    text is not its accessible name, and the accessibility test fails.
    Expressions are lettered A to D in the question.
  - The rows of a table of initial, change and equilibrium values are
    labeled I, C and E, with a sentence saying what they stand for. With
    the words in the first column the table is too wide for a phone.
- **Left for a change of its own:** the diagram modules now repeat their
  range and finite-number guards, and the diagram components repeat a few
  drawing helpers. Both reviews said to extract them separately.
