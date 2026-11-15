# ChemStudy: a new Unit 2 comprehensive test

Written on 2026-11-14. It follows the Unit 5 comprehensive test
(`2026-11-13-chemstudy-unit-5-comprehensive-test-design.md`) and changes
nothing in it, or in the main design.

## 1. Why

Unit 2's practice is complete except for a comprehensive test. Unit 5 has one,
written fresh for the site. The teacher's old Unit 2 material has no
comprehensive test to convert, and its unit exam stays closed. On 2026-11-14
the teacher asked for one ("We need a comprehensive test").

## 2. What the teacher decided

| Question | Decision |
|---|---|
| Size | Two sittings, about 40 questions, as Unit 5 (2026-11-14) |

Everything else repeats a decision the teacher made for Unit 5's test:
- fresh questions from the AP framework;
- free response only, every question scored;
- a "Show answer" with the worked solution and the rubric;
- one page per sitting.

## 3. What students get

Two practice pages in Unit 2, listed after the free-response set:

| Order | Page | Parts | Topics | Size |
|---|---|---|---|---|
| 7 | Comprehensive test, session 1: bonds and solids | A: Types of bonds (5 questions)<br>B: Bond energy and Coulomb's law (6)<br>C: Ionic solids (4)<br>D: Metals and alloys (4) | 2.1–2.4 | 19 questions, about 90 points, about 100 minutes |
| 8 | Comprehensive test, session 2: Lewis diagrams and shapes | E: Lewis diagrams (6)<br>F: Resonance and formal charge (6)<br>G: Shapes, polarity and hybridization (10) | 2.5–2.7 | 22 questions, about 110 points, about 120 minutes |

The pages work as Unit 5's comprehensive test does: the same blocks, a
"Show answer" on every part, and a rubric that adds up to each question's
points. Each lesson's "Practice next" links to the session that covers its
topic. Counts and points are targets; a part may end a question or a few
points either way if that makes better questions.

**Drawn structures.** Where a question asks for a Lewis diagram, its answer
draws the structure with the Lewis block, as the Unit 2 practice does. A
question may also show a drawn structure for the student to work from (for
example, "find the formal charges in this structure").

## 4. Weight per topic

There is no old test to take weights from, so they come from the framework's
learning objectives and from what the AP exam asks most often in this unit.
Topic 2.7 has the most to practice: shapes with and without lone pairs,
angles, polarity, hybridization, and sigma and pi bonds.

| Part | Topic | Questions | What they practice |
|---|---|---|---|
| A | 2.1 | 5 | Bond type from electronegativity difference and from metal and nonmetal; the continuum; partial charges; ranking bond polarity; electronegativity trends explained |
| B | 2.2 | 6 | Reading bond length and bond energy off a potential-energy curve; what happens on each side of the minimum; bond order and atom size against length and energy; Coulomb's law to rank attractions (charge, then distance) |
| C | 2.3 | 4 | Lattice-energy rankings and melting points; brittleness; conductivity solid, molten and dissolved; a particle picture of an ionic solid in words |
| D | 2.4 | 4 | The electron-sea model and the properties it explains; interstitial and substitutional alloys from atom sizes; how an alloy's properties change |
| E | 2.5 | 6 | Electron counts for molecules and ions; complete Lewis diagrams with multiple bonds; the octet exceptions (fewer than eight, more than eight, an odd electron); finding an error in a diagram |
| F | 2.6 | 6 | Resonance structures and the hybrid; bond order and bond length from resonance; formal charges; choosing between diagrams by formal charge; the limits of the Lewis model |
| G | 2.7 | 10 | Domains, electron geometry and shape, including five and six domains; bond angles and the lone-pair effect; molecular polarity; sp, sp² and sp³; counting sigma and pi bonds; the three-part answer for an angle |

Every topic has at least four questions. A question may name more than one
topic.

## 5. Beyond the exam

The framework leaves out, in Unit 2: specific crystal structures (2.3);
deriving and drawing hybrid orbitals, and hybridization involving d orbitals
(2.7); molecular orbital diagrams (2.7). No question asks for any of them.
For five or six domains a question asks for the shape only, never a
hybridization. If a question needs anything else the framework does not ask
for, that part is labeled "Beyond the exam".

## 6. Keeping the questions original

- Every question is written fresh from the framework's learning objectives,
  with its own substances, numbers and context.
- **The writers read no textbook and none of the old course.** They read the
  framework, the site's Unit 2 lessons and the site's Unit 2 practice.
- **An independent originality check** compares every new question with:
  - the bonding chapters of both Tro books in `Tro_Reference`;
  - the teacher's closed Unit 2 exam (`exam/u02-exam.tex`), so it stays
    useful as a closed test;
  - the site's six Unit 2 practice documents and seven lessons.

  A question that repeats a scenario, or a substance together with the same
  numbers, is rewritten. A shared substance alone is fine: there are only so
  many molecules a Unit 2 question can use.
- **Values are real.** Bond lengths, bond energies, radii, angles and
  electronegativities match the site's lessons wherever a lesson quotes them
  (Cl–Cl 243 kJ/mol, lesson 2.1's electronegativities). Where a value is made
  up, the question says so, or speaks of an element X.

## 7. How each session is made

The pipeline that made Unit 5's test:

1. **Writers, in parallel**, one per part, files only.
2. **A number check.** Each writer leaves a script that recomputes every
   number in its part: electron counts, formal charges, electronegativity
   differences, Coulomb ratios. The controller runs every script. The build
   checks each drawn structure's electron count.
3. **An independent fact-check** per part on Opus.
4. **The originality check**, one agent per session.
5. **A build, the unit and browser tests**, and a look at both pages at 412,
   390, 360 and 320 px with every answer open.
6. **A pull request**, which stops for the teacher's merge.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Session 1 |
| C | Session 2, and the close-out notes |

## 9. Code

None expected. The practice kind `test`, the blocks, the Lewis drawings in
practice answers and the build check (every part answered, every rubric
adding up) already exist.

## 10. Done when

- Both pages are live. Every question is answered, every rubric adds up, and
  every topic from 2.1 to 2.7 has at least four questions.
- Every number has been recomputed by a script, and every part has been
  fact-checked independently.
- The originality check found no repeated scenario, or substance with its
  numbers.
- Both pages fit a phone at 320 px with every answer open, and pass the
  browser tests' accessibility checks.

> **As built (Plan 7, 2026-11-14).**
>
> - **Session 1:** 19 questions, 90 points (A 22, B 28, C 20, D 20).
>   Topics: 2.1 ×5, 2.2 ×8, 2.3 ×4, 2.4 ×4. Two Part C questions use
>   Coulomb's law from 2.2.
> - **Session 2:** 22 questions, 113 points (E 32, F 30, G 51). Topics:
>   2.5 ×6, 2.6 ×7, 2.7 ×10.
> - **Checks:**
>   - The number checks match: A 113 values, B 110, C 57, D 39, E 241,
>     F 199, G 350.
>   - No fact-check found a wrong answer, number or rubric total.
> - **Originality:**
>   - Session 1 had nothing from a textbook or the closed exam. One
>     question that reused lesson 2.2's own table was rewritten.
>   - Session 2's first check found that the writers, without reading a
>     textbook, had picked several of its worked examples and exercises:
>     nitromethane, the azide ion, diazomethane, ICl₄⁻ and I₃⁻, NO, and
>     the phosgene chain. Two items also repeated lesson 2.7: the cis and
>     trans dichloroethene pattern, and 614 against 2 × 347.
>   - Those were replaced (N₂O₄, the cyanamide ion, an enolate ion, SeF₄,
>     ClF₂⁻, IF₅, the hydroxyl radical, urea, the three C₂H₂F₂ compounds),
>     then fact-checked and checked for originality again: no strong
>     match. One sentence describing urea was reworded.
> - **Repeats within a session** were removed: molten MgCl₂ in session 1;
>   BCl₃, H₃O⁺, PF₅ and NH₂⁻ in session 2.
> - **No "Beyond the exam" labels** were needed.
