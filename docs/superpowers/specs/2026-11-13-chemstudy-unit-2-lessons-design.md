# ChemStudy: Unit 2 lessons

Design agreed with the teacher on 2026-11-13. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it. It
starts Stage 3 of the main design, theory unit by unit, with Unit 2.

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Scope | Lessons first, then practice, as Unit 5 was done. This design covers the seven lessons and their diagrams. A second design and plan will convert the Unit 2 practice. |
| Molecular shapes | A rotatable 3D viewer in lesson 2.7, written for the site without a 3D library, with a drawn wedge-and-dash picture beside it |

## 2. What students get

Seven lessons, one per topic of the 2024 framework:

| Topic | Lesson |
|---|---|
| 2.1 | Types of Chemical Bonds |
| 2.2 | Intramolecular Force and Potential Energy |
| 2.3 | Structure of Ionic Solids |
| 2.4 | Structure of Metals and Alloys |
| 2.5 | Lewis Diagrams |
| 2.6 | Resonance and Formal Charge |
| 2.7 | VSEPR and Hybridization |

Each lesson is built like the Unit 5 lessons. It uses the same blocks:
- worked examples (`Worked`);
- Checks with answers (`Check`);
- key ideas (`KeyIdea`);
- traps (`Trap`);
- a closing list of key points (`KeyPoints`).

The voice is the same too: a teacher talking, starting from something
concrete. The unit page lists the lessons as they are published. Each
lesson ends with `PracticeNext`. Until the Unit 2 practice exists, it
says that practice for the topic is on its way. It lists the practice by
itself once the practice is published.

## 3. Staying inside the framework

Lessons are written fresh from the framework's learning objectives and
essential knowledge. The teacher's Unit 2 guided notes, from the old site
(`D:\AP_Chem_Prep\Units\unit02-compound-structure\u02-notes.tex`), are a
reference for coverage and emphasis, at the teacher's request on
2026-11-13. Those notes follow the Zumdahl textbook, so their wording,
examples and problems are not copied. No textbook is used.
The framework excludes three things from the exam in Unit 2:
- specific crystal structures (2.3);
- the derivation and drawing of hybrid orbitals, and hybridization that
  involves d orbitals (2.7);
- molecular orbital diagrams (2.7).

A lesson may mention one of these only where it helps understanding. When
it does, the passage is marked "Beyond the exam" with the existing `Beyond`
block.

For more than four electron pairs around the central atom, the framework
asks only for the shape. Lesson 2.7 covers those shapes (trigonal
bipyramidal, octahedral and the shapes derived from them) without assigning
a hybridization.

## 4. Diagrams

### 4.1 Lewis diagrams: one component, drawn at build time

Lessons 2.5 to 2.7 need dozens of Lewis diagrams. Lessons 2.1 and 2.3 need
some too, and the Unit 2 practice will need them in its answers. One Astro
component draws them all, so they look the same everywhere.

- The writer describes a structure in a few lines:
  - each atom's symbol and position on a small grid;
  - the bonds and their order (1, 2 or 3);
  - lone pairs on each atom;
  - formal charges;
  - brackets and a charge for an ion.
- The writer places the atoms. The component does not lay out a molecule
  itself, which keeps it small and predictable.
- The component also draws a resonance arrow between two structures, as
  2.6 needs.
- **No JavaScript.** The component draws inline SVG when the site is built.
  The SVG uses the page's text color, so it works in dark mode and in
  print.
- **Accessible.** Every diagram needs a text description. The build fails
  without one, as it does for `Figure`.
- **Fits a phone.** A diagram scales down to the column width. A row of
  resonance structures wraps instead of scrolling.

The component is written test-first: unit tests for the geometry (where
the lone pairs and bond lines go) and browser tests for how it renders.

### 4.2 Interactive diagrams (Svelte, like Unit 5's)

- **Potential energy against internuclear distance (2.2).** The student
  drags the distance between two nuclei and sees the energy. The diagram
  marks the bond length and the bond energy at the minimum. Students can
  compare single, double and triple bonds between the same atoms, and a
  bond between small atoms with one between large atoms. Its curves are
  illustrative shapes, and a caption says so. The real bond lengths and
  energies quoted in the lesson come from reliable data and are fact-checked.
- **3D shape viewer (2.7).**
  - The student picks a molecule from a short list covering each shape the
    framework expects, including ones with lone pairs. Examples: CH₄, NH₃,
    H₂O, CO₂, BF₃, SF₄, ClF₃, XeF₄, SF₆, PCl₅.
  - The molecule turns by dragging, or with the arrow keys.
  - The viewer shows the lone pairs and names the electron geometry, the
    molecular shape and the ideal bond angle.
  - It is drawn in SVG from the ideal geometries, with the atoms nearest
    the viewer drawn on top. No 3D library is used, so the security policy
    stays as it is.
  - Screen readers get a text description of the molecule shown.
  - It respects reduced motion.
  - A drawn wedge-and-dash picture sits beside it for print and for
    students who do not interact with it.

Like Unit 5's diagrams, each one is drawn in its starting state when the
site is built (`client:visible`). It shows without JavaScript and in print,
and it becomes interactive when it scrolls into view. The lesson's text
never relies on the interaction.

### 4.3 Drawn figures

These are static SVG files in `public/figures/`, used with `Figure`, as in
Unit 5:
- bond type against electronegativity difference (2.1);
- an ionic lattice, two-dimensional and generic (2.3), because the
  framework excludes specific crystal structures;
- substitutional and interstitial alloys (2.4).

## 5. How it is made

This is the pipeline that worked for Unit 5's lessons:

1. **The plan**, reviewed by the teacher.
2. **The Lewis component**, test-first, with a code review.
3. **Writers, in parallel**, one per lesson. They write files only: no
   build and no git.
4. **One build and one test run**, by the controller.
5. **A look at each lesson on a phone** at 412, 390, 360 and 320 px, with
   every answer open.
6. **An independent fact-check** per lesson on Opus. It recomputes every
   number, checks every claim against the framework, and confirms every
   Lewis diagram:
   - the electron count;
   - the formal charges;
   - octets, and the allowed exceptions;
   - the shape and the angle.
7. **A fixer per lesson** for the accepted findings.
8. **A code review** of any code, then the pull request.

## 6. Pull requests

Each pull request stops for the teacher's merge, because a merge deploys.

| Pull request | Contents |
|---|---|
| A | The Lewis component, the potential-energy diagram, lessons 2.1–2.4 |
| B | Lessons 2.5 and 2.6 |
| C | The 3D shape viewer and lesson 2.7 |

## 7. Not in this design

- Converting the Unit 2 practice: Worksheets 1–4, the skill ladders and
  the free-response set. It comes next, in its own design and plan, under
  Unit 5's rules:
  - no Quick review;
  - a "Show answer" on every question;
  - the unit exam stays closed.
- Lessons for the other units.
- The periodic table and the equation sheet.

## 8. Done when

- All seven lessons are live and pass the browser and accessibility tests.
- Every lesson has been fact-checked independently and every accepted
  finding fixed.
- Every Lewis diagram has been checked for electrons, formal charges and
  shape.
- No lesson scrolls sideways at 320 px with every answer open.
- Both interactive diagrams work by keyboard, and both show a drawn
  picture without JavaScript and in print.
