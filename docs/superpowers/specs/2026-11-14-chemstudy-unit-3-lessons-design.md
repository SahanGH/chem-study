# ChemStudy: Unit 3 lessons

Written on 2026-11-14. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it. It
follows the Unit 2 lessons (`2026-11-13-chemstudy-unit-2-lessons-design.md`)
and reuses everything they built.

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Next unit | Unit 3 (2026-11-14: "We will do Unit 3") |
| Order | Lessons, then practice, then a comprehensive test, as Unit 2 was done. This design covers the thirteen lessons and their diagrams. |
| The old course | The teacher's Unit 3 guided notes are a reference for coverage and emphasis, as for Unit 2. Asked on 2026-11-14 whether the lessons should follow the notes more closely, the teacher said "proceed". |
| Working mode | Fully autonomous, as for Units 2 and 5: Claude carries on without checking in, but never merges. |

## 2. What students get

Thirteen lessons, one per topic of the 2024 framework:

| Topic | Lesson |
|---|---|
| 3.1 | Intermolecular and Interparticle Forces |
| 3.2 | Properties of Solids |
| 3.3 | Solids, Liquids, and Gases |
| 3.4 | Ideal Gas Law |
| 3.5 | Kinetic Molecular Theory |
| 3.6 | Deviation from Ideal Gas Law |
| 3.7 | Solutions and Mixtures |
| 3.8 | Representations of Solutions |
| 3.9 | Separation of Solutions and Mixtures |
| 3.10 | Solubility |
| 3.11 | Spectroscopy and the Electromagnetic Spectrum |
| 3.12 | Properties of Photons |
| 3.13 | Beer–Lambert Law |

Each lesson is built like the Unit 2 lessons, with the same blocks:
- worked examples (`Worked`);
- Checks with answers (`Check`);
- key ideas (`KeyIdea`);
- traps (`Trap`);
- a closing list of key points (`KeyPoints`).

The voice is the same: a teacher talking, starting from something concrete.
Each lesson ends with `PracticeNext`, which says the practice for the topic is
on its way until the Unit 3 practice is published.

Some topics are small (3.6, 3.9, 3.10 and 3.12 each have one or two pieces of
essential knowledge). Their lessons are shorter, not padded.

**Unit 2 already covers part of 3.2.** Lessons 2.3 and 2.4 explain ionic
solids, metals and alloys. Lesson 3.2 summarizes those in a few lines and
links back, and spends its length on covalent network and molecular solids
and on comparing all four kinds.

## 3. Staying inside the framework

Lessons are written fresh from the framework's learning objectives and
essential knowledge. **No textbook is used.**

**The teacher's guided notes**
(`D:\AP_Chem_Prep\Units\unit03-properties-substances\u03-notes.tex`) are read
by the controller, not by the writers. The notes follow the Zumdahl
textbook, so the writers never see them. Each writer's brief carries what the
notes stress for the topic:
- every interparticle force is present in some amount, so rank by strength,
  never by the name of the force alone;
- vapor pressure runs opposite to boiling point;
- melting a molecular solid breaks forces between molecules, never covalent
  bonds;
- temperature in kelvin, always;
- at the same temperature, every gas has the same average kinetic energy,
  but not the same speed;
- the peak of a Maxwell–Boltzmann curve is the most probable speed, and the
  area stays the same as the curve changes;
- the conditions for ideal behavior: high temperature, low pressure;
- molarity uses liters of solution;
- draw ionic solutes as separate ions in the right ratio;
- solubility of alcohols falls as the carbon chain grows;
- the slope of a calibration line is εb, not a concentration.

**Avoid list.** Writers who never read a textbook still pick its worked
examples (found in Unit 2's test). Each brief names examples that writers
must not use, starting with the ones the notes take from Zumdahl: BI₃, PCl₃
and NH₃ compared by boiling point, and vitamins A and C compared by
solubility. An originality check (section 5) catches the rest.

**Values** come from the equation sheet the framework prints (effective
2025): R = 0.08206 L·atm/(mol·K) and 8.314 J/(mol·K), STP = 273.15 K and
1.0 atm, 22.4 L/mol at STP, h = 6.626 × 10⁻³⁴ J·s, c = 2.998 × 10⁸ m/s. The
notes' 3.00 × 10⁸ m/s is not used. Electronegativities and radii match the
Unit 2 lessons.

**What the framework leaves out of Unit 3:**
- phase diagrams (3.3);
- colligative properties (3.8);
- calculations of molality, percent by mass and percent by volume (3.8).

The equation sheet does not give the root-mean-square speed or the van der
Waals equation. The notes teach both. A lesson may mention one where it
helps understanding, in a paragraph that begins "**Beyond the exam:**", the
form the Unit 2 lessons use:
- 3.5 may name the root-mean-square speed. It never asks for a calculation
  with it.
- 3.6 may show the van der Waals equation, to say which term corrects which
  failure. It never asks for a calculation with it.

Heating curves belong to topic 6.5. Lesson 3.3 may say that the temperature
holds steady during a phase change, and leaves the rest to Unit 6.

## 4. Diagrams

### 4.1 Interactive diagrams (Svelte, like Units 2 and 5)

**Maxwell–Boltzmann explorer (3.5).**
- Plots the distribution of molecular speeds for a gas chosen from a short
  list (He, N₂, CO₂) at a temperature set with a slider (100 K to 1000 K).
- A reference curve (N₂ at 300 K) stays drawn, so a change is always seen
  against something.
- A marker shows the most probable speed.
- A threshold speed, set by the student, shades the area beyond it and states
  the fraction of molecules faster than it.
- A switch shows kinetic energy instead of speed. With it on, the three gases
  at the same temperature draw the same curve: the lesson's key idea, seen.
- The curves are computed from the real distribution. The numbers come from
  a small library module (`src/lib/gases.ts`), written test-first: the
  areas, the most probable speed and the fractions are checked against
  values computed independently.

**Absorbance explorer (3.13).**
- Left: the absorption spectrum of a colored solution, absorbance against
  wavelength, with a wavelength the student moves.
- Right: the calibration line, absorbance against concentration, at that
  wavelength. A concentration slider moves a point along it.
- A switch sets the path length to 1 cm or 2 cm.
- The student sees why the wavelength of maximum absorbance is chosen: the
  line is steepest there, so a small change in concentration gives the
  largest change in absorbance.
- The spectrum is an illustrative shape for a made-up dye, and a caption
  says so. The arithmetic A = εbc is exact, and the module that computes it
  is tested.

Both diagrams follow the existing rules:
- drawn in their starting state when the site is built (`client:visible`);
- readable without JavaScript and in print;
- usable by keyboard;
- a text description for screen readers;
- reduced motion respected;
- the lesson's text never relies on the interaction.

No new library and no change to the security policy.

### 4.2 Drawn figures

Static SVG files in `public/figures/`, used with `Figure`, as before. They
use the page's text color, so they work in dark mode and print. Planned, one
or two per lesson where a picture teaches more than a sentence:

| Lesson | Figure |
|---|---|
| 3.1 | Hydrogen bonds between water molecules; ion–dipole attraction around a cation and an anion |
| 3.2 | The four kinds of solid side by side, particle level; graphite's layers against diamond's network |
| 3.3 | The same substance as solid, liquid and gas; crystalline against amorphous |
| 3.4 | Pressure against volume, and volume against kelvin temperature |
| 3.6 | PV/nRT against pressure for a real gas, against the ideal line |
| 3.8 | A particle drawing of a salt solution, ions in the right ratio, water molecules turned to the ions |
| 3.9 | A paper chromatogram; a distillation setup |
| 3.10 | Like dissolves like, particle level |
| 3.11 | The electromagnetic spectrum, with the transition each region causes |
| 3.12 | A photon absorbed and emitted, as energy levels |

The writer of each lesson may drop a figure the lesson does not need, or add
one, and says so.

Molecules drawn as Lewis structures use the existing `Lewis` block.

## 5. How it is made

The pipeline that made the Unit 2 lessons, with one step added:

1. **The plan**, in the same pull request as this design.
2. **The code first, test-first:** the gas module and the Maxwell–Boltzmann
   explorer; the absorbance module and its explorer. A code review of each.
3. **Writers, in parallel**, one per lesson. They write files only: no build
   and no git.
4. **One build and one test run**, by the controller.
5. **A look at each lesson on a phone** at 412, 390, 360 and 320 px, with
   every answer open, and at each figure in the dark theme.
6. **An independent fact-check** per lesson on Fable 5.2 (the teacher's
   decision, 2026-11-14; the briefs had been checked on Opus). It recomputes
   every number and checks every claim against the framework.
7. **An originality check** per group of lessons (Sonnet). It compares the
   worked examples and Checks with the matching chapters of both Tro books
   in `Tro_Reference`, and with the teacher's notes. A scenario that repeats
   one of them, or a substance with the same numbers, is rewritten. A shared
   substance alone is fine. *(New for Unit 3: Unit 2's test showed it is
   needed.)* The lesson briefs in the plan get the same check before the
   plan is committed, so most repeats are caught before a lesson is
   written.
8. **A fixer per lesson** for the accepted findings, then a re-check.
9. **The pull request.**

## 6. Pull requests

Each pull request stops for the teacher's merge, because a merge deploys.

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Lessons 3.1–3.3: forces and solids |
| C | The Maxwell–Boltzmann explorer, lessons 3.4–3.6: gases |
| D | Lessons 3.7–3.10: solutions |
| E | The absorbance explorer, lessons 3.11–3.13: light |

## 7. Not in this design

- The Unit 3 practice: Worksheets 1–5, the self-study ladders and the
  free-response set. It comes next, in its own design and plan, under the
  same rules as Units 2 and 5:
  - no Quick review;
  - a "Show answer" on every question;
  - the unit exam (`exam/u03-exam.tex`) stays closed.
- A Unit 3 comprehensive test, after the practice.
- Lessons for the other units; the periodic table and the equation sheet.

## 8. Done when

- All thirteen lessons are live and pass the browser and accessibility tests.
- Every lesson has been fact-checked independently, and checked for
  originality, and every accepted finding is fixed.
- No lesson scrolls sideways at 320 px with every answer open.
- Both interactive diagrams work by keyboard, and both show a drawn picture
  without JavaScript and in print.
