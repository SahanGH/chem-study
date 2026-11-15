# ChemStudy: a new Unit 3 comprehensive test

Written on 2026-11-15. It follows the Unit 5, 2 and 7 comprehensive tests
(`2026-11-13-chemstudy-unit-5-comprehensive-test-design.md`,
`2026-11-14-chemstudy-unit-2-comprehensive-test-design.md`,
`2026-11-15-chemstudy-unit-7-comprehensive-test-design.md`) and changes
nothing in them, or in the main design.

## 1. Why

Unit 3 has its thirteen lessons and its seven practice documents. The
teacher's old Unit 3 material has no comprehensive test to convert, and its
unit exam stays closed. When Unit 7 was finished, Claude named Unit 3's
practice and comprehensive test as the next work, and the teacher answered
"Merge and proceed" (2026-11-15).

## 2. What is decided

| Question | Decision | Whose |
|---|---|---|
| Fresh questions from the AP framework; free response only; every question scored; a "Show answer" with the worked solution and the rubric; one page per sitting | As Units 5, 2 and 7 | The teacher's, for Unit 5 (2026-11-13) |
| Size | Two sittings, about 43 questions | Claude's, following the teacher's choice for Unit 2 (2026-11-14). Unit 3 is 18 to 22 percent of the exam, the heaviest unit, so the test has two more questions than Unit 7's. The pull request asks the teacher to confirm or change it |
| Merging | Claude merges each pull request once its check passes and the content has been fact-checked and checked for originality | The teacher's "Merge and proceed" (2026-11-15), read as the Unit 7 arrangement applied to Unit 3's practice and test |

## 3. What students get

Two practice pages in Unit 3, listed after the free-response set:

| Order | Page | Parts | Topics | Size |
|---|---|---|---|---|
| 8 | Comprehensive test, session 1: forces, solids and gases | A: Intermolecular forces (6 questions)<br>B: Solids, liquids and vapor pressure (5)<br>C: The ideal gas law (6)<br>D: Kinetic molecular theory and real gases (5) | 3.1–3.6 | 22 questions, about 100 points, about 105 minutes |
| 9 | Comprehensive test, session 2: solutions and light | E: Solutions and how to picture them (6)<br>F: Separation and solubility (5)<br>G: Spectroscopy and photons (5)<br>H: The Beer–Lambert law (5) | 3.7–3.13 | 21 questions, about 95 points, about 100 minutes |

The pages work as the other comprehensive tests do: the same blocks, a "Show
answer" on every part, and a rubric that adds up to each question's points.
Each lesson's "Practice next" links to the session that covers its topic.
Counts and points are targets; a part may end a question or a few points
either way if that makes better questions.

**No pictures.** A practice page has no figures. A graph is given as a table
of values or described in a sentence. A particle picture is described in
words or given as a table of particle counts. A question may ask the student
to sketch or draw on paper; the answer then says in words what the drawing
must show, as the practice does.

## 4. Weight per topic

There is no old test to take weights from, so they come from the framework's
learning objectives and from what the AP exam asks most often in this unit:
intermolecular forces behind a property (3.1, 3.2, 3.10), gas calculations
(3.4), particle pictures (3.3, 3.8), and Beer's law (3.13).

| Part | Topics | Questions | What they practice |
|---|---|---|---|
| A | 3.1 | 6 | Naming every force between particles of a substance, and in a mixture; ranking boiling points by electron count first and then the kind of force; a case where the larger molecule out-boils one that hydrogen-bonds; polarizability and contact area; ion–dipole forces in a solution |
| B | 3.2, 3.3 | 5 | Classifying a solid from its properties (ionic, covalent network, metallic, molecular) and explaining each property from its particles and forces; what melting and boiling do and do not break; vapor pressure and boiling point from the forces; the particle picture of a solid, a liquid and a gas |
| C | 3.4 | 6 | $PV = nRT$ for one unknown; changing conditions; molar mass or density of a gas; gas stoichiometry; Dalton's law with mole fractions; a gas collected over water |
| D | 3.5, 3.6 | 5 | What the kinetic molecular theory says and what follows from it (pressure from collisions, average kinetic energy and temperature); speeds of two gases at one temperature, and one gas at two temperatures, described as Maxwell–Boltzmann distributions in words; when and why a real gas deviates, in both directions |
| E | 3.7, 3.8 | 6 | Molarity, dilution and the concentration of each ion; preparing a solution; the particle picture of a solution of an ionic and of a molecular solute; what a wrong particle picture gets wrong |
| F | 3.9, 3.10 | 5 | Choosing a separation and the property it uses; reading a chromatogram ($R_f$, which component is more polar); distillation; predicting and explaining solubility from the forces broken and formed |
| G | 3.11, 3.12 | 5 | Which region of the spectrum changes which motion of a molecule (rotation, vibration, electrons); $c = \lambda\nu$ and $E = h\nu$, per photon and per mole; comparing photons; why a substance absorbs only certain wavelengths |
| H | 3.13 | 5 | $A = \varepsilon b c$ for one unknown; a calibration table and its slope; the effect of a change in path length or concentration; choosing the wavelength; what goes wrong in a measurement (a scratched or wet cell, a wrong blank, a solution too concentrated) |

Every topic has at least two questions. A question may name more than one
topic.

## 5. Beyond the exam

The framework leaves out three things in Unit 3: reading phase diagrams
(3.3), colligative properties, and calculations of molality, percent by mass
and percent by volume (3.7). No question asks for any of them. Effusion, the
root-mean-square speed, the van der Waals equation and the photoelectric
effect are not in the framework either, and none is asked. The energy of a
phase change (heats of fusion and vaporization) is topic 6.5 and is not
asked. If a question needs anything else the framework does not ask for,
that part is labeled "Beyond the exam".

## 6. Keeping the questions original

As for Unit 7's test, with the two lessons it taught:

- Every question is written fresh from the framework's learning objectives,
  with its own substances, numbers and context.
- **The writers read no textbook and none of the old course.** They read the
  framework notes, the site's Unit 3 lessons and the site's Unit 3 practice.
- **An avoid list from the start.** Before any writer starts, one agent
  lists every substance, set of substances or system, with its numbers, that
  a source uses in a calculation, a ranking or a worked scenario: Tro's
  chapters on solutions, gases, light, liquids and solids, and solutions in
  both books; the teacher's closed Unit 3 exam; the site's own Unit 3 lessons
  and practice. **For the site's lessons it also names the kind of question**
  (a worked example ranking these three boiling points; a Check on this
  chromatogram), since Unit 7's test repeated a lesson's kind of example with
  a different salt. Writers get the list, never the sources.
- **One pool per part.** From what the avoid list leaves, each part is given
  its own substances, gases, solutes, separations and wavelengths, so that two
  parts do not pick the same one. The controller compares the parts again
  before the fact-checks.
- **An independent originality check** then compares every new question with
  the same sources. A question that repeats a scenario, or a substance set
  together with the same numbers or the same ranking, is rewritten. A shared
  substance alone is not a finding.
- **Values are honest.**
  - A boiling point, a melting point, a vapor pressure, a molar mass or a
    wavelength of a real substance is a handbook value, and the same value the
    site already uses wherever it uses one.
  - Constants are the site's: $R = 0.08206$ L·atm/(mol·K),
    $h = 6.626 \times 10^{-34}$ J·s, $c = 2.998 \times 10^{8}$ m/s,
    $N_A = 6.022 \times 10^{23}$ mol⁻¹, 22.4 L/mol at STP.
  - A molar absorptivity belongs to a real compound at a stated wavelength
    only if it is the real value; otherwise the question names "a dye" or "a
    colored compound" and gives its value.
  - A ranking a question asks for must be true for the real substances, by
    data, not only by the rule of thumb.
- **What the practice's fact-checks kept finding**, so that the test does not
  repeat it: a list of forces called complete that is not; a rule stated as
  "only" that the data break; "compare the kind of force first"; an answer
  that says more than the lessons (melting "breaks" hydrogen bonds;
  absorbance "is a ratio").

## 7. How each session is made

The pipeline that made the other tests:

1. **The avoid list and the pools**, once, before session 1.
2. **Writers, in parallel**, one per part, files only.
3. **A number check.** Each writer leaves a script that recomputes every
   number in its part from the question's own data: every gas calculation,
   concentration, $R_f$, photon energy and absorbance. The controller runs
   every script.
4. **The parts' substances compared across the session.**
5. **An independent fact-check** per part, by a fresh agent that solves
   every question before reading its answer and scores its own answer with
   the rubric. It confirms every handbook value against a second source.
6. **The originality check**, one agent per session, on Sonnet.
7. **Fixes, a second check of what changed, a build, the unit and browser
   tests**, and a look at each page at 412, 390, 360 and 320 px with every
   answer open.
8. **A pull request**, merged by Claude when its check passes.

**Models.** Writers and fact-checkers on Fable 5.2 by the teacher's choice;
until Fable's usage limit resets (2026-11-17) they run on Opus, and each pull
request says so. The avoid list, the originality checks and fixers on Sonnet.

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
- The originality check found no repeated scenario, or substance set with its
  numbers.
- No constant or handbook value has two values anywhere on the site.
- Both pages fit a phone at 320 px with every answer open, and pass the
  browser tests' accessibility checks.

## As built (Plan 13, 2026-11-15)

Two pages, 43 questions, 200 points, in three pull requests (#47 the design and plan, #48 session 1, then session 2 with these notes).

- **Session 1:** 22 questions, 103 points (A 27, B 23, C 28, D 25), topics 3.1 to 3.6.
- **Session 2:** 21 questions, 97 points (E 27, F 23, G 22, H 25), topics 3.7 to 3.13.
- **Every number was recomputed by a script per part**, and every part was fact-checked twice by fresh agents that solved before reading. **No fact-check found an error.** The findings were rubric lines a sound route could not earn, stems that gave a part away, an "only" the facts break, and two places where checkers disagreed with a handbook's rounding (neon's boiling point is now given in kelvin, where the handbooks agree).
- **The originality checks found ten strong matches, nine of them with the site's own lessons and practice**:
  - lesson 3.1's worked example and Checks (four questions of Part A);
  - lesson 3.2's unknown-solid Check and its tin trap;
  - lesson 3.9's chromatogram worked example;
  - lesson 3.10's density trap;
  - lesson 3.13's calibration worked example.

  The tenth was a textbook problem (KO₂ in a breathing set). All were rewritten with a different task, and a re-check found no strong match. The weak matches left are listed in #48 and the session 2 pull request.
- **Why so many:** the plan's part tables asked for kinds of question the lessons already teach (for example "a larger molecule that out-boils one that hydrogen-bonds"), and the avoid list named those kinds but the part tables pointed straight at them. A later test's plan should name tasks the lessons do not already set, and clear each part's list against the lessons' worked examples and Checks before writing.
- **Writers and fact-checkers ran on Opus**, not Fable (Fable's usage limit, 2026-11-15 to 17).
- **Phones:** two lines split; tables scroll inside their boxes at 320 px only, as lesson 7.4's does. No page scrolls sideways.
- No "Beyond the exam" label was needed, and no constant or handbook value has a second value on the site.
