# ChemStudy: Unit 9 lessons

Written on 2026-11-27, against `main` at `ce2dcca` ("docs: record how the
Unit 6 comprehensive test was built"), with the Unit 8 lessons in progress
on their own branches. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it. It
follows the Unit 8 lessons (`2026-11-27-chemstudy-unit-8-lessons-design.md`)
and the Unit 6 lessons (`2026-11-27-chemstudy-unit-6-lessons-design.md`),
whose pipeline it repeats and whose "As built" section it builds in, the
Unit 4 lessons (`2026-11-16-chemstudy-unit-4-lessons-design.md`) and the
check feedback design
(`2026-11-26-chemstudy-us-english-and-unit-1-check-feedback-design.md`).

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Unit 9 | Thermodynamics and Electrochemistry, topics 9.1 to 9.11, asked for on 2026-11-27 "the same as was done for Unit 6, end to end" |
| Scope | This design covers the eleven lessons and their diagrams. The practice converted from the teacher's materials and a comprehensive test each get their own design and plan, as for Unit 6. |
| Merging | **Claude merges.** The teacher said to merge every pull request when its check passes. Each pull request is merged when "Build and test" passes, and lists Claude's calls for the teacher to change afterward. |
| The old course | The teacher's Unit 9 materials are read from the teacher's `AP_Chem_Prep` repository (the unit folder and chapters 17 and 18), as a reference for coverage and emphasis and as a list of what not to repeat. The unit exam and the chapter exams were not opened. |
| Models | Several, by task (section 7), as for Units 6 and 8. |

**Three things the building session cannot do**, and what stands in their
place:

- **Read the framework's printed pages.** The College Board's site is blocked
  in the session, and `AP_Chem_Prep` does not hold the PDF. Section 3 is
  written from Claude's knowledge of the 2024 framework
  (`scratchpad/ced/unit9-framework.md`), checked against what the teacher's
  unit map and question-set headers say about scope. **The teacher is asked
  to compare section 3 with the framework**, above all the table "What is
  not sure" there. If a statement is wrong, the lesson that rests on it is
  corrected in a follow-up pull request.
- **Read a textbook.** No list of any textbook's examples could be made.
  Originality is checked against the teacher's Unit 9 and chapter materials
  and against the site's own lessons and practice, and against nothing
  else. The stock examples of textbooks in general are listed from knowledge
  and kept out (section 4).
- **Look up a reference value.** Every $\Delta H_f^\circ$, $S^\circ$,
  $\Delta G_f^\circ$ and $E^\circ$ in this unit, every $K$ that is not
  already on the site, and every activation energy and decomposition
  temperature in a scene, is written from memory. Each is judged by two
  independent checkers (the fact-check of the briefs and the fact-check of
  the finished lesson), neither of which sees the other's work. A value
  both confirm to the figures printed stands. A value on which they differ,
  or which neither can confirm, is listed for the teacher in the pull
  request that uses it and again in "As built". This unit has one more
  safeguard than Unit 8: its numbers check one another. Every reaction with
  all three kinds of value must give the same $\Delta G^\circ$ from
  $\Delta H^\circ - T\Delta S^\circ$ as from the formation values, within
  0.3 kJ, and every cell whose reaction has formation values must give the
  same $\Delta G^\circ$ from $-nFE^\circ$. The briefs' scripts test both.

**Claude's calls, for the teacher to confirm or change:**

- **"Thermodynamically favored", never "spontaneous".** The lessons use the
  framework's term. Lesson 9.3 says once that older books say
  "spontaneous" for the same thing and why the word misleads (it sounds
  like "fast"). No Check uses it.
- **Entropy is taught as dispersal**, of matter and of energy. The word
  "disorder" is not used. No sentence on the site uses it today (section 3,
  "The conventions of the unit").
- **No entropy of the surroundings or of the universe, and no named laws.**
  The framework does not name them. Lesson 9.3 has two "Beyond the exam"
  sentences that say where $-T\Delta S^\circ$ comes from.
- **The temperature at which $\Delta G^\circ$ changes sign is taught
  without a label and without a coined name**, as $T = \Delta H^\circ /
  \Delta S^\circ$ read off $\Delta G^\circ = 0$. The framework does not
  name it and the exam asks for it.
- **$\Delta G = \Delta G^\circ + RT \ln Q$ is one "Beyond the exam"
  paragraph** in lesson 9.5. The idea the teacher's notes stress with it
  (that $\Delta G^\circ$ is not zero at equilibrium, and that a positive
  $\Delta G^\circ$ does not mean "nothing happens") is taught in full,
  through $K$.
- **The Nernst equation is shown in lesson 9.10 as the equation sheet
  gives it, and read for direction.** One worked example puts numbers into
  it. No Check asks for a number from it (section 3 says why).
- **Cells are reasoned about with $Q$ against $K$, never with "the
  equilibrium shifts".** Lesson 9.10 says in one sentence why.
- **Cell notation** (the line that writes a cell as symbols) is one
  "Beyond the exam" paragraph in lesson 9.8. The framework does not name
  it.
- **No electrode is ever labeled positive or negative**, in text, in a
  figure or in an explorer. Lesson 9.8 says once that the exam does not ask
  for it.
- **$E^\circ_\text{cell} = E^\circ_\text{cathode} - E^\circ_\text{anode}$**,
  with both values taken from the table as reduction potentials. The
  lessons never "flip and add".
- **Charge is $q$, as the equation sheet prints it.** Lesson 9.11 says at
  first use that this $q$ is charge in coulombs and that Unit 6's $q$ was
  heat in joules. No Unit 9 lesson uses $q$ for heat.
- **Three interactive diagrams** (section 6): a free-energy explorer in
  lesson 9.3, an explorer of $\Delta G^\circ$ and $K$ in lesson 9.5, and a
  galvanic cell explorer in lesson 9.9, placed a second time in lesson
  9.10.
- **The galvanic cell explorer has no zinc.** Its six metals are silver,
  copper, tin, cobalt, cadmium and chromium, so the zinc–copper cell at
  1.10 V cannot be built in it. Choosing the same metal twice makes a
  concentration cell.
- **The systems** (section 3, "Values") are real, and none of the teacher's
  most-used ones is among them: no zinc–copper cell, no silver or copper
  plating, no calcium carbonate, no Haber process, no ATP with glucose, no
  diamond, no NO₂ with N₂O₄, no boiling water, no ammonium nitrate, no
  sodium chloride dissolving, no hydrogen with oxygen.
- **Three sentences of the Unit 5 and Unit 7 practice are corrected** in
  pull request C, because lesson 9.5 would otherwise contradict them
  (section 3, "A conflict on the site").
- **The sample lessons of `tests/unit/check-dist.test.ts` move to a unit
  number that no unit has, 0** (section 8).

## 2. What students get

Eleven lessons, one per topic of the 2024 framework. The file names follow
the topic titles in `src/data/units.ts`; the folder is
`src/content/lessons/unit-9/`, and the unit's slug is
`unit-9-thermodynamics`.

| Topic | Lesson and file | What it carries | What it leaves to another lesson | Minutes |
|---|---|---|---|---|
| 9.1 | Introduction to Entropy, `9-1-introduction-to-entropy.mdx` | Energy released is not the whole story (the promise of lesson 6.1); entropy as how widely matter and energy are spread; solid, liquid, gas; a gas given more room; more or fewer moles of gas in a reaction; warming; predicting the sign of $\Delta S$ and which of two changes is larger; when counting gas moles cannot settle it | Numbers for $S^\circ$ (9.2); whether a change is favored (9.3); the entropy of dissolving a salt (9.6) | 13 |
| 9.2 | Absolute Entropy and Entropy Change, `9-2-absolute-entropy-and-entropy-change.mdx` | Entropy has a true zero, so tables list $S^\circ$ itself; an element's $S^\circ$ is not zero; $\Delta S^\circ$ from products minus reactants, with coefficients; J, not kJ; checking the sign against lesson 9.1's prediction | Using $\Delta S^\circ$ to decide anything (9.3) | 13 |
| 9.3 | Gibbs Free Energy and Thermodynamic Favorability, `9-3-gibbs-free-energy-and-thermodynamic-favorability.mdx` | $\Delta G^\circ$ and what "standard" means; favored when $\Delta G^\circ < 0$; $\Delta G^\circ$ from formation values; $\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$ and the unit trap; the four combinations of signs, read off the equation; the temperature where $\Delta G^\circ$ changes sign | Why a favored reaction may not go (9.4); how far it goes (9.5) | 20 |
| 9.4 | Thermodynamic and Kinetic Control, `9-4-thermodynamic-and-kinetic-control.mdx` | Favored is not fast; activation energy as the reason; "nothing is happening" is not "at equilibrium", and how to tell them apart; what a catalyst and heating change and do not change | The size of $K$ (9.5) | 12 |
| 9.5 | Free Energy and Equilibrium, `9-5-free-energy-and-equilibrium.mdx` | $\Delta G^\circ < 0$ means $K > 1$; $\Delta G^\circ = -RT \ln K$ both ways, with $R$ in joules; which $K$; estimating: $\Delta G^\circ$ beside $RT$, and 5.7 kJ for each factor of ten at 298 K; a positive $\Delta G^\circ$ still gives some product; $K$ at another temperature from $\Delta H^\circ$ and $\Delta S^\circ$ | $K$ for dissolving (9.6); $K$ from a cell potential (9.9) | 18 |
| 9.6 | Free Energy of Dissolution, `9-6-free-energy-of-dissolution.mdx` | Dissolving a salt as three changes, each with a sign for its enthalpy and its entropy; why water around an ion can lose entropy; why the total is hard to predict and what a question asks instead; $K_{sp}$ and $\Delta G^\circ$ as one statement; an endothermic dissolving that goes on its own | $K_{sp}$ itself (7.11, already taught); pH and solubility (8.11) | 14 |
| 9.7 | Coupled Reactions, `9-7-coupled-reactions.mdx` | Making an unfavored change happen: energy from outside (electricity, light) or a favored reaction that shares an intermediate with it; $\Delta G^\circ$ values add when equations add; ATP as the cell's favored partner | How an electrolytic cell is built (9.8) | 13 |
| 9.8 | Galvanic (Voltaic) and Electrolytic Cells, `9-8-galvanic-voltaic-and-electrolytic-cells.mdx` | Why separating the two half-reactions makes a current (the watch battery of lesson 4.7); electrodes, solutions, wire, salt bridge and meter, and what each does; oxidation at the anode and reduction at the cathode in every cell; which way electrons and ions move; what you would see: a mass change, a gas, a color; the two surfaces at the level of particles; an electrolytic cell, driven from outside (the smelter of lesson 4.5) | Which half-reaction goes which way, and by how many volts (9.9) | 18 |
| 9.9 | Cell Potential and Free Energy, `9-9-cell-potential-and-free-energy.mdx` | Standard reduction potentials and what the table's order means; choosing the cathode; $E^\circ_\text{cell}$ as a difference; why a potential is never multiplied; $\Delta G^\circ = -nFE^\circ$, with $n$ from the balanced equation and joules turned into kilojoules; positive $E^\circ$, negative $\Delta G^\circ$, $K > 1$: one fact three ways; a negative $E^\circ$ and the electrolytic cell | What happens away from 1 M (9.10) | 18 |
| 9.10 | Cell Potential Under Nonstandard Conditions, `9-10-cell-potential-under-nonstandard-conditions.mdx` | $E^\circ$ belongs to $Q = 1$; the potential as a measure of how far the cell is from equilibrium; raising or lowering a concentration, argued through $Q$; a run-down cell has $Q = K$ and $E = 0$; the concentration cell; the Nernst equation read for direction | Amounts deposited (9.11) | 15 |
| 9.11 | Electrolysis and Faraday's Law, `9-11-electrolysis-and-faradays-law.mdx` | Current as charge per second; from current and time to charge, to moles of electrons, to moles of substance, to mass; the half-reaction as the source of the electron count; the same chain run backward for a time, a current or the charge on an ion | Nothing: the unit's last calculation | 16 |

The minutes are targets for the briefs. Each lesson's `minutes` is set from
its real length when it is written, between 9 and 22 (Unit 6's lessons came
out at 15 to 20, longer than their briefs guessed).

Each lesson is built like the lessons of the other units, with the same
blocks and the same voice, and ends with `PracticeNext`.

**As in Units 6 and 8, from the first draft:** every Check with options
carries a message for each wrong option, and every typed-number Check
carries its slips (`misses`, `slips`), under the rules of the check
feedback design. Unit 9 goes on the build's feedback list with its first
lessons, and on the balance test when all eleven are in.

**What the lessons can lean on.** Particles in solids, liquids and gases
(3.3); the spread of kinetic energies in a gas and what warming does to it
(3.5, 5.5); dissolving as a trade of attractions, and ion–dipole forces
(3.10); oxidation numbers, oxidized and reduced (4.7); half-reactions and
making the electrons cancel (4.9); activation energy, energy profiles and
catalysts (5.5, 5.6, 5.11); system and surroundings, the sign of
$\Delta H$, kJ/mol_rxn, standard states and formation values (6.1, 6.6,
6.8); adding equations (6.9, 7.6); $K_c$, $K_p$, $Q$ against $K$, and what
a large or small $K$ means (7.3, 7.5, 7.10); what heating does to $K$
(7.9); $K_{sp}$ (7.11). A lesson names such a topic in plain text. Unit 8
is being written now; Unit 9 names nothing from it except, once in lesson
9.6, that topic 8.11 is the other half of the story of solubility.

**Promises the site has already made, which these lessons keep:**

| Where | What it says | Kept by |
|---|---|---|
| Lesson 4.5, line 20 | Electricity drives the smelter's reaction, "a matter for topic 9.8" | Lesson 9.7 shows that the same equation has $\Delta G^\circ$ near +1,980 kJ at 25 °C, carbon and all; lesson 9.8 names it as an electrolytic cell and says where the aluminum forms |
| Lesson 4.7, line 249 | In the watch battery the zinc and the silver oxide are kept apart, so the electrons travel through a wire. "Unit 9 is about that." | Lesson 9.8 opens with it; lesson 9.9 finds its 1.60 V and its $\Delta G^\circ$ two ways |
| Lesson 6.1, line 175 | An endothermic dissolving happens by itself; "Energy is not the only thing that decides whether a change happens, and Unit 9 takes that up" | Lesson 9.1 opens with it; lesson 9.3 gives the rule; a Check of lesson 9.6 returns to the xylitol |
| Lesson 7.1, line 34 | One particle passes electrons to another (Units 4 and 9) | Lesson 9.8 |
| Lesson 7.5, the Check at lines 218 to 235 | Ethene and hydrogen with $K > 10^{17}$ and no ethane after a year | Lesson 9.4 gives it its name, kinetic control; lesson 9.5 gets $K = 4 \times 10^{17}$ from $\Delta G^\circ$ |
| Lesson 7.5, lines 19 to 27 | $K_p$ about 10⁹⁰ for carbon monoxide burning | A Check of lesson 9.5: $\Delta G^\circ = -514.4$ kJ gives that power of ten |
| Lesson 5.11, line 190 | A catalyst is used in one step and made again in full in a later one, so it is not consumed | Lesson 9.4: hopcalite and the iridium of a satellite thruster are not used up, and neither changes $\Delta G^\circ$ or $K$ |
| Unit 5 practice, skill ladders, line 1060; worksheet 4, line 257 | $\Delta G^\circ$, "met in Unit 9, says whether a reaction is thermodynamically favored" | Lesson 9.3 |
| Unit 6 practice, worksheet 1, line 280 | "The other factor is called entropy, and here dissolving spreads the ions out through the water. Unit 9 takes that up." | Lessons 9.1 and 9.6 |
| Unit 7 practice, worksheet 2, line 98 | "(Unit 9 calls this kinetic control.)" | Lesson 9.4 |
| Unit 7 practice, worksheet 2, line 178 | $\Delta G^\circ$ adds when reactions are combined and is proportional to $\ln K$ at a fixed temperature | Lessons 9.5 and 9.7 |
| The equation page, lines 260 to 317 | $\Delta S^\circ$ points to 9.2; $\Delta G^\circ$ from formation values and $\Delta H^\circ - T\Delta S^\circ$ to 9.3; $-RT \ln K$ to 9.5; $-nFE^\circ$ to 9.9; the cell potential away from standard conditions to 9.10; $I = q/t$ and $F$ to 9.11 | Each is taught in the lesson its pointer names |
| The equation page, line 350 | "The letter $q$ is charge in some places and heat in another." | Lesson 9.11 |

## 3. Staying inside the framework

**Read section 1 first: this section is written from knowledge of the 2024
framework, not from its pages** (`scratchpad/ced/unit9-framework.md` holds
the full summary the briefs are written from).

Lessons are written fresh from the framework's learning objectives and
essential knowledge. **No textbook is used.**

**The teacher's materials** are read by an inventory agent, not by the
writers. Each brief carries what the notes stress, in other words than the
notes', and the unit map's list of where students lose points:

- joules and kilojoules mixed in $\Delta H^\circ - T\Delta S^\circ$, and
  again in $-RT \ln K$ and $-nFE^\circ$;
- the $S^\circ$ of an element taken as zero;
- "$\Delta G^\circ = 0$ at equilibrium";
- a favored reaction called fast;
- a potential multiplied when its half-reaction is;
- $n$ read from one half-reaction instead of the balanced equation;
- the time left in minutes, or the division by the electrons per ion
  forgotten, in Faraday's law.

The notes' organizing idea, that $\Delta G^\circ$, $K$ and $E^\circ$ say
one thing in three ways, is carried by lesson 9.9 in the site's own words
and its own picture. Where the notes disagree with themselves (the Nernst
equation required or not; Le Châtelier's principle allowed for a cell or
not; two values for nickel's potential), this design decides, and
`scratchpad/unit9/teacher-notes-stress.md` lists the places for the
teacher.

**What the framework leaves out of Unit 9** (one statement, as Claude knows
it):

| Topic | Not assessed | In the lessons |
|---|---|---|
| 9.8 | Labeling an electrode as positive or negative | No lesson, figure or explorer gives an electrode a sign. Electrodes are named by what happens at them. One "Beyond the exam" sentence in lesson 9.8 says that the signs exist, that they differ between the two kinds of cell, and that the exam does not ask for them. |

**What is not sure, and how each lesson is built so that either reading is
safe.** The framework summary lists what its writer could not vouch for.
The teacher is asked to check each row against the printed pages.

| What is unsure | How the lessons handle it |
|---|---|
| Whether the limit on the Nernst equation in 9.10 is a statement of what students should know (the summary's reading: used qualitatively, routine calculation not the point) or a stated exclusion, and whether the equation is on the equation sheet (the summary and the site's equation page say it is; some of the teacher's files say it is not). | Lesson 9.10 teaches the reasoning that needs no equation first: a change that raises $Q$ takes the cell nearer equilibrium and lowers $E$. It then shows the equation as the sheet prints it and reads the same result off it. One worked example puts numbers in, because "the change is small" needs a number to be believed. **No Check asks for a number from the Nernst equation**: every Check of 9.10 is a direction with a reason, a $Q$ expression, or which electrode is the anode. The explorer shows $E$ as a number and asks for no arithmetic. Right under either reading. |
| Whether the framework's sentence on Le Châtelier's principle and cells is as the summary remembers it (such arguments do not apply, because a working cell is not at equilibrium). The teacher's files quote it and also use the principle. | The lessons never use the principle for a cell and never write "the equilibrium shifts" in 9.8 to 9.11. Lesson 9.10 says once that a working cell is not at equilibrium, so the argument is made with $Q$. An answer argued through $Q$ earns its point under either reading. |
| Whether another exclusion exists that the summary's writer forgot, most likely under 9.1 or 9.11. | Lesson 9.1 has no calculation at all. Lesson 9.11 keeps to the five quantities the summary lists (electrons transferred, mass, current, time, charge on the ion) and to one electrode reaction at a time, which the question gives. |
| The topic numbers after 9.5, which rest on Free Energy of Dissolution having moved in from Unit 7. | `src/data/units.ts` already has the eleven titles in this order and Unit 7 as twelve topics. If the printed framework differs, the lessons are renumbered in a follow-up. |
| The standard state: 1 atm, 1 bar, or both. | Lesson 6.8 already says "1 bar (very nearly 1 atm)". Lesson 9.3 repeats that in one clause and uses $K_p$ in atm, as topic 7.3 does. At the unit's precision nothing changes. |
| Whether the estimation statement of 9.5 compares $\Delta G^\circ$ with $RT$ in those terms. | Lesson 9.5 teaches both the comparison with $RT$ and the plainer rule of 5.7 kJ for each factor of ten at 298 K. Checks that estimate are choices among powers of ten. |
| The wording of 9.11's list, above all "the charge of the ionic species". | Lesson 9.11 has one Check that finds the charge on an ion from a mass, a current and a time, and others that find a mass, a time and a current. |
| The equation sheet: its layout, the figures printed for $F$, the exact form of "1 volt = 1 joule per coulomb". | The lessons use the values of the site's own equation page (96,485 C per mole of electrons; 8.314 J/(mol·K)) and print no picture of the sheet. A typed answer worked with 96,500 is accepted (it differs by 0.02 percent). |
| The framework's exact term: "favored", "favorable", or both (the topic title says "Favorability"). | "Thermodynamically favored" and "thermodynamically unfavored" for a process. "Favorable" and "unfavorable" are not used for a process; the two terms of the equation are said to "work for" or "work against" it. |
| Statement codes, statement counts and the science practices paired with each topic. | No lesson cites a code or a practice. |

**Things the framework does not name but the exam uses**, taught without a
"Beyond the exam" label:

- the temperature at which $\Delta G^\circ = 0$, as $\Delta H^\circ /
  \Delta S^\circ$, and that it means something only when the two have the
  same sign (9.3);
- the conversion between joules and kilojoules as a step of its own (9.3,
  9.5, 9.9);
- that $\Delta H^\circ$ and $\Delta S^\circ$ are treated as the same at
  every temperature (9.3, said once as an approximation);
- $E^\circ_\text{cell} = E^\circ_\text{cathode} - E^\circ_\text{anode}$,
  which is not on the sheet, and the rule that the half-reaction with the
  higher reduction potential is the reduction in a galvanic cell (9.9);
- that the hydrogen half-reaction is the zero of the table (9.9, one
  sentence; the electrode itself is not described);
- $K$ from $E^\circ$, as two steps through $\Delta G^\circ$ (9.9);
- which way the ions of a salt bridge move, and what happens to the mass
  of each electrode (9.8);
- that solids are left out of a cell's $Q$, as topic 7.3 leaves them out
  of any $Q$ (9.10).

**Left out of the lessons:** the entropy of the surroundings and of the
universe, and the laws of thermodynamics by name, beyond two labeled
sentences in 9.3; microstates and $S = k \ln W$; $\Delta S = q/T$ and the
entropy of a phase change from its enthalpy; the dependence of
$\Delta H^\circ$ and $\Delta S^\circ$ on temperature; the pressure
dependence of free energy; $\Delta G$ under nonstandard conditions as a
calculation; the van 't Hoff equation; activities; lattice energies as
numbers; the standard hydrogen electrode as an apparatus; named batteries,
fuel cells and corrosion as content to know; overpotential and predicting
the products of electrolysis in water; balancing redox equations in base;
the names "oxidizing agent" and "reducing agent" (lesson 4.7 already says
the exam does not test them); the sign of an electrode; a Nernst
calculation as a task; ampere-hours.

**The equation sheet** gives, for this unit: $\Delta S^\circ$,
$\Delta H^\circ$ and $\Delta G^\circ$ as products minus reactants;
$\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ = -RT \ln K =
-nFE^\circ$; $I = q/t$; the cell potential away from standard conditions
(section 3's table says how sure this is); Faraday's constant; $R$; a volt
as a joule per coulomb. It gives no rule for combining two half-cell
potentials, no $K = e^{-\Delta G^\circ/RT}$, no $\Delta G = \Delta G^\circ
+ RT \ln Q$, no table of signs against temperature, no reminder that
$\Delta S^\circ$ is in joules, no "oxidation at the anode", and no value of
any $S^\circ$, $\Delta G_f^\circ$ or $E^\circ$: a question supplies them.
It writes sums without coefficients, as lesson 6.8 already says of the
enthalpy sum. Lessons say so where it matters.

**The conventions of the unit.**

- **Favored.** A process is **thermodynamically favored** when
  $\Delta G^\circ < 0$ and **thermodynamically unfavored** when
  $\Delta G^\circ > 0$; then its reverse is favored. After its first use in
  a lesson the word may stand alone ("favored above 569 K"). "Favored"
  never means fast and never means complete; lessons 9.4 and 9.5 are about
  those two gaps.
- **Entropy as dispersal.** Lesson 9.1 defines entropy, $S$, as a measure
  of how widely the matter and the energy of a system are spread out: the
  more ways the particles can be arranged and the more ways their energy
  can be shared among them, the higher the entropy. Every later sentence
  argues from room (volume, phase, moles of gas) or from the sharing of
  energy (temperature). **"Disorder" is not used.** A search of the site
  on 2026-11-27 finds the word in no lesson and no practice page: the two
  sentences that name the idea (lesson 6.1, line 175, and Unit 6 practice
  worksheet 1, line 280, "dissolving spreads the ions out through the
  water") already speak of spreading, so nothing has to be changed.
  Lesson 9.1 says in one sentence that a student may have met the word
  "disorder" elsewhere, and that the question to ask is how many ways, not
  how untidy.
- **Count the gas first.** Where the moles of gas change, that settles the
  sign of $\Delta S^\circ$. Where they do not, the lessons say that
  $\Delta S^\circ$ is small and that its sign needs the table.
- **Units.** $S^\circ$ in J/(mol·K). $\Delta H_f^\circ$ and
  $\Delta G_f^\circ$ in kJ/mol. For a reaction, $\Delta H^\circ$ and
  $\Delta G^\circ$ in kJ/mol_rxn, written $\text{kJ/mol}_\text{rxn}$ as
  lesson 6.6 writes it, and $\Delta S^\circ$ in J/(mol_rxn·K). Tables,
  options and messages shorten these to kJ/mol and J/(mol·K), as lesson
  6.6 says tables do. **The entropy term is turned into kilojoules before
  it is subtracted**, on a line of its own, every time.
- **Signs.** Every $\Delta$ carries its sign, plus included, in data
  tables and in answers. $E^\circ$ values carry theirs.
- **Temperature** is in kelvins in every equation. 25 °C is 298 K
  throughout the unit, three figures, which is as many as its other data
  carry. $RT$ at 298 K is 2.48 kJ/mol.
- **Standard.** The little circle means every substance in its standard
  state, as lesson 6.8 defines it: a pure substance at 1 bar, and, added
  here, a solute at 1 M. An element in its standard state has
  $\Delta H_f^\circ = 0$ and $\Delta G_f^\circ = 0$ and an $S^\circ$ that
  is not zero.
- **The four combinations of signs** are never given as a table to
  memorize first. Lesson 9.3 reads each off $\Delta G^\circ = \Delta H^\circ
  - T\Delta S^\circ$: temperature multiplies only the entropy term, so
  heating strengthens whichever way entropy points. The table comes after,
  as a summary.
- **Two routes to $\Delta G^\circ$.** Formation values give it at 25 °C
  only. $\Delta H^\circ - T\Delta S^\circ$ gives it at any temperature,
  taking $\Delta H^\circ$ and $\Delta S^\circ$ as constant. At 298 K the
  two can differ in the last figure, and the lessons say so.
- **$\Delta G^\circ = -RT \ln K$.** $R = 8.314$ J/(mol·K), so the equation
  gives joules per mole of reaction; $\Delta G^\circ$ goes in as joules and
  comes out as joules, with the conversion on its own line. $K$ is the
  equilibrium constant with pressures in atm for gases ($K_p$) and
  molarities for solutes ($K_c$), as topic 7.3 writes them; a question
  says which. $K$ has no unit. **No $K$ is found from $\Delta G^\circ$ for
  a reaction among pure solids and liquids only**: such a reaction has
  nothing in its $K$ expression (see "A conflict on the site" below).
- **Kinetic control** is worded as Unit 5 worded activation energy: "the
  minimum energy a collision needs for the bonds to start rearranging"
  (lesson 5.5, line 13). A favored reaction that is not seen to go has a
  high activation energy, so almost no collisions have enough energy at
  that temperature. A catalyst lowers the activation energy and changes
  neither $\Delta G^\circ$ nor $K$ (lesson 5.11). Heating does two things,
  and the lessons keep them apart: it raises the share of collisions with
  enough energy (5.5), and it changes $K$ (7.9).
- **Half-reactions** are written as lesson 4.9 writes them, with e⁻ and
  with H⁺(aq) where acid takes part. The exam's tables of reduction
  potentials print H⁺, which lesson 4.8 (line 28) already says stands for
  the hydronium ion. A half-reaction in base is given by the
  question, never balanced by the student.
- **Anode and cathode by what happens there.** Oxidation at the anode,
  reduction at the cathode, in every cell. Electrons go from anode to
  cathode through the wire. In a salt bridge, anions move toward the anode
  and cations toward the cathode. No electrode has a sign.
- **A cell is described in words and drawn.** Cell notation is one
  "Beyond the exam" paragraph in lesson 9.8.
- **Reduction potentials** are given by each question, as the exam gives
  them, written as reductions. One value per half-reaction across the unit
  (the table below). $E^\circ_\text{cell} = E^\circ_\text{cathode} -
  E^\circ_\text{anode}$, both read from the table unchanged. **A potential
  is never multiplied by a coefficient**: it is energy per unit of charge,
  and the lessons say so with the unit, joules per coulomb.
- **$\Delta G^\circ = -nFE^\circ$.** $F = 96{,}485$ C per mole of
  electrons, as the equation sheet gives it. $n$ is the moles of electrons
  that pass in one mole of reaction of the balanced overall equation.
  Volts times coulombs are joules; the conversion to kilojoules is a line
  of its own. $\Delta G^\circ$ from a potential is rounded to the nearest
  kilojoule.
- **Away from standard conditions.** $E$ without the circle is the
  potential now; $E^\circ$ is the potential at $Q = 1$ and does not change
  as the cell runs. $Q$ is written as in topics 7.3 and 7.10, with solids
  left out. The letters $Q$ (reaction quotient) and $q$ (charge) never
  meet in one lesson: 9.10 has $Q$ and 9.11 has $q$.
- **Faraday's law** is a chain, not a formula: charge from current and
  time, in seconds; moles of electrons from charge and $F$; moles of
  substance from the half-reaction; mass from molar mass. The lessons do
  not write $m = ItM/nF$.
- **Terms.** "Thermodynamically favored" and "unfavored"; "entropy";
  "Gibbs free energy" at first use and "free energy" after; "kinetic
  control"; "galvanic cell" (with "voltaic" once, as the same thing) and
  "electrolytic cell"; "half-cell"; "salt bridge"; "standard reduction
  potential"; "cell potential". The lessons do not use "spontaneous"
  (beyond lesson 9.3's one sentence), "disorder", "crossover
  temperature", "driving force" as a quantity, "oxidizing agent",
  "reducing agent", "emf" or "electromotive force".

**A conflict on the site, which Unit 9 settles.** Two practice pages speak
of diamond turning into graphite, and lesson 9.5 would show that they do
not agree.

- `src/content/practice/unit-5/skill-ladders.mdx`, line 1058, gives the
  change $\Delta G^\circ = -2.9$ kJ/mol. That value is right (it is the
  free energy of formation of diamond, +2.9 kJ/mol, turned round).
- `src/content/practice/unit-7/skill-ladders.mdx`, line 328, says "A
  reaction with $K = 10^{10}$ may be immeasurably slow if its activation
  energy is large. Diamond turning into graphite is the classic case".
  That ties diamond to a $K$ of 10¹⁰. From $\Delta G^\circ = -RT \ln K$,
  $-2.9$ kJ/mol at 298 K gives $e^{1.17}$, about 3.2, and a $K$ of 10¹⁰
  would need $-57$ kJ/mol. **The Unit 7 sentence is the wrong one**, twice
  over: the number does not fit, and a change from one pure solid to
  another has no $K$ expression at all, so no mixture of diamond and
  graphite "at equilibrium" exists at 25 °C and 1 bar for $K$ to describe.
- The same Unit 5 page, line 11, calls a reaction "enormously favorable"
  and gives diamond as its example. At $-2.9$ kJ/mol it is favored, not
  enormously.

**Pull request C**, which adds lesson 9.5, corrects two sentences and
leaves the $-2.9$ kJ/mol alone:

1. `src/content/practice/unit-7/skill-ladders.mdx`, line 328. Replace

   > Diamond turning into graphite is the classic case: graphite is the favored form of carbon at room temperature and pressure, yet the change is far too slow to see.

   with

   > Ethene and hydrogen are such a case: for ethene gas and hydrogen gas forming ethane gas, $K$ is greater than 10¹⁷ at 25 °C, yet with no catalyst a bulb of the two gases holds no detectable ethane a year later (topic 7.5).

   (As first written the sentence carried the equation as inline math, which cannot wrap and ran 5 px past a narrow phone's screen; it is in words.)

   The sentences before and after it stay. The replacement is the site's
   own example, from the Check of lesson 7.5 (lines 218 to 235), and
   lesson 9.5 confirms its $K$: $\Delta G^\circ = -100.4$ kJ/mol_rxn gives
   $4 \times 10^{17}$.
2. `src/content/practice/unit-5/skill-ladders.mdx`, line 11. Replace

   > A reaction can be enormously favorable and still take centuries; diamond turning to graphite is the standard example.

   with

   > A reaction can be thermodynamically favored and still take longer than anyone can wait; diamond turning to graphite is the standard example.

3. Line 1058 of the same page keeps its value. Its closing sentence at
   line 1064 ("A large negative $\Delta G$ with a large $E_a$ describes a
   reaction that is strongly favorable and completely stuck, which is why
   fuels can sit safely in a tank in air") is about fuels and is true of
   them; it stays.

No Unit 9 lesson uses diamond: it is among the teacher's most-used scenes
(section 4). Lesson 9.4's allotropes are white and gray tin.

**Values.** A question gives every value it needs, as the exam does. All
are for 25 °C and all are written from memory (section 1). One value per
quantity across the unit. Each row was computed once for this design
(`scratchpad/unit9/draft-calc/values.py`); the briefs' scripts compute
them again.

*Reactions, with $\Delta H^\circ$ (kJ/mol_rxn), $\Delta S^\circ$
(J/(mol_rxn·K)) and $\Delta G^\circ$ at 298 K (kJ/mol_rxn):*

| Reaction | $\Delta H^\circ$ | $\Delta S^\circ$ | $\Delta G^\circ$ | Where | How sure |
|---|---|---|---|---|---|
| 4Fe(s) + 3O₂(g) → 2Fe₂O₃(s) | −1,648.4 | −550.0 | −1,484.4 | 9.2 | sure |
| 2H₂S(g) + SO₂(g) → 3S(s) + 2H₂O(g) | −145.6 | −185.9 | −90.3 | 9.2 | fairly sure ($S^\circ$ of sulfur) |
| N₂H₄(l) + O₂(g) → N₂(g) + 2H₂O(g) | −534.2 | +242.8 | −606.5 | 9.2, 9.3 | fairly sure |
| 2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s) | −851.5 | −38.5 | −840.1 | 9.2, 9.4 | sure |
| MgH₂(s) → Mg(s) + H₂(g) | +75.3 | +132.3 | +35.9; zero at 569 K | 9.3 | fairly sure |
| NH₃(g) + HCl(g) → NH₄Cl(s) | −176.2 | −285.1 | −91.2; zero at 618 K | 9.3 | sure |
| Mg(OH)₂(s) → MgO(s) + H₂O(g) | +81.1 | +152.6 | +35.6; zero at 531 K | 9.3 | fairly sure |
| 2N₂O(g) → 2N₂(g) + O₂(g) | −164.1 | +148.4 | −208.4 | 9.3 explorer, 9.4 | fairly sure (lesson 6.6 has −164) |
| 3O₂(g) → 2O₃(g) | +285.4 | −137.8 | +326.4 | 9.3 explorer, 9.7 | sure |
| CH₄(g) + H₂O(g) → CO(g) + 3H₂(g) | +205.9 | +214.7 | +141.9; zero at 959 K | 9.3 explorer | sure; tables give CH₄ as −74.6 or −74.8 |
| CO(g) + 2H₂(g) → CH₃OH(g) | −90.5 | −219.2 | −25.1; zero at 413 K | 9.3 explorer | fairly sure |
| C₂H₄(g) + H₂(g) → C₂H₆(g) | −136.4 | −120.8 | −100.4 | 9.2 ($\Delta S^\circ$), 9.4, 9.5 | fairly sure (tables differ by 0.5 kJ) |
| PCl₃(g) + Cl₂(g) → PCl₅(g) | −87.9 | −170.3 | −37.2 | 9.5 | fairly sure |
| I₂(s) → I₂(g) | +62.4 | +144.6 | +19.3 | 9.5 | sure |
| 2CO(g) + O₂(g) → 2CO₂(g) | | | −514.4 | 9.5 ($K_p$ of about 10⁹⁰ and of 10⁻⁹⁰ for the reverse also in 9.4, from lesson 7.5) | sure |
| N₂H₄(l) → N₂(g) + 2H₂(g) | | | −149.3 | 9.4 | fairly sure |
| AgI(s) → Ag⁺(aq) + I⁻(aq) | +112.2 | +68.5 | +91.7 | 9.6 | fairly sure; agrees with lesson 7.11's $K_{sp}$ |
| BaSO₄(s) → Ba²⁺(aq) + SO₄²⁻(aq) | +26.3 | −102.5 | +56.9 | 9.6 | fairly sure; agrees with lesson 7.11's $K_{sp}$ |
| MgSO₄(s) → Mg²⁺(aq) + SO₄²⁻(aq) | −91.3 | −209.6 | −28.7 | 9.6 | fairly sure |
| KNO₃(s) → K⁺(aq) + NO₃⁻(aq) | +34.8 | +115.8 | | 9.6 (signs and $\Delta H^\circ$ only) | fairly sure |
| LiCl(s) → Li⁺(aq) + Cl⁻(aq) | −37.1 | | | 9.6 (sign only; lesson 6.1 has the scene) | sure |
| HgS(s) → Hg(l) + S(s); S(s) + O₂(g) → SO₂(g) | | | +50.6; −300.1 | 9.7 | sure; sure |
| TiCl₄(l) → Ti(s) + 2Cl₂(g); 4Na(s) + 2Cl₂(g) → 4NaCl(s); 2H₂(g) + 2Cl₂(g) → 4HCl(g); 4Al(s) + 3O₂(g) → 2Al₂O₃(s) | | | +737.2; −1,536.4; −381.2; −3,164.6 | 9.7 | fairly sure; sure; sure; sure |
| CH₄(g) + Cl₂(g) → CH₃Cl(g) + HCl(g) | | +12.1 | | 9.1 (sign and size only) | fairly sure ($S^\circ$ of CH₃Cl) |
| Cu₂S(s) → 2Cu(s) + S(s); S(s) + O₂(g) → SO₂(g); their sum | | | +86.2; −300.1; −213.9 | 9.7 | fairly sure; sure |
| 2Al₂O₃(s) + 3C(s) → 4Al(s) + 3CO₂(g) | | | +1,981.4 | 9.7 | sure |
| ATP + H₂O → ADP + phosphate; phosphocreatine + H₂O → creatine + phosphate (both at pH 7); phosphocreatine + ADP → creatine + ATP | | | −30.5; −43.0; −12.5 | 9.7 | sure; fairly sure; fairly sure |
| Zn(s) + Ag₂O(s) → ZnO(s) + 2Ag(s) | | | −309.3 | 9.9 | fairly sure (ZnO −320.5 or −318.3) |
| CH₃OH(l) + 3/2 O₂(g) → CO₂(g) + 2H₂O(l) | | | −702.0 | 9.9 | fairly sure |

The $S^\circ$, $\Delta H_f^\circ$ and $\Delta G_f^\circ$ values behind each
row are in the lesson table. The enthalpies of formation that lesson 6.8
already prints (H₂O(l) −285.8, H₂O(g) −241.8, CO(g) −110.5, CO₂(g) −393.5,
MgO(s) −601.6, ZnO(s) −350.5, SO₂(g) −296.8) are used unchanged.

*Other values:*

| Quantity | Value the unit uses | Where | How sure |
|---|---|---|---|
| $R$; $F$ | 8.314 J/(mol·K); 96,485 C/mol of electrons | 9.5, 9.9 to 9.11 | the equation page's |
| Vapor pressure of iodine at 25 °C | 4.1 × 10⁻⁴ atm (0.31 torr) | 9.5 | fairly sure |
| $K_c$ for Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ | 140, as lesson 7.10 has it "at a certain temperature"; lesson 9.5 takes it at 25 °C | 9.5 | lesson 7.10's |
| $K_{sp}$ of AgI, BaSO₄, TlCl | lesson 7.11's table | 9.6 | as lesson 7.11 |
| Activation energy of 2N₂O → 2N₂ + O₂ with no catalyst | about 250 kJ/mol | 9.4 | fairly sure |
| White tin to gray tin | favored below 13 °C; $\Delta H^\circ$ and $\Delta S^\circ$ both negative; no numbers used | 9.4 | sure of the temperature |
| Ag⁺ + e⁻ → Ag | +0.80 V | 9.8 to 9.10, explorer | sure |
| Cu²⁺ + 2e⁻ → Cu | +0.34 V | explorer, 9.9 | sure |
| Sn²⁺ + 2e⁻ → Sn | −0.14 V | explorer, 9.9, 9.10 | sure |
| Co²⁺ + 2e⁻ → Co | −0.28 V | explorer, 9.8 to 9.10 | sure |
| Cd²⁺ + 2e⁻ → Cd | −0.40 V | explorer, 9.9 | sure |
| Cr³⁺ + 3e⁻ → Cr | −0.74 V | explorer, 9.9 | sure (one common table has −0.73) |
| Mn²⁺ + 2e⁻ → Mn | −1.18 V | 9.9 | sure |
| Ag₂O + H₂O + 2e⁻ → 2Ag + 2OH⁻ | +0.34 V | 9.9 | fairly sure |
| ZnO + H₂O + 2e⁻ → Zn + 2OH⁻ | −1.26 V | 9.9 | fairly sure |
| 2H⁺ + 2e⁻ → H₂ | 0.00 V, by definition | 9.9 | sure |

Nickel is not used: the teacher's materials give its potential as −0.23 V
in some places and −0.25 V in others, and tables differ too. Atomic masses
are the AP exam table's (`src/data/elements.ts`). None of the teacher's
number sets appears: not their $S^\circ$ strips as a set, not their
$\Delta H^\circ$ and $\Delta S^\circ$ pairs, not their $\Delta G^\circ$
and $K$ pairs, not their currents and times.

## 4. Keeping the lessons original

- **Avoid lists before any brief is written** (`scratchpad/unit9/`): every
  example, substance set, number set and scene of the teacher's Unit 9 and
  chapter materials, and everything the site's Units 1 to 7 already say
  about enthalpy, equilibrium, redox, kinetics and dissolving. The
  brief-writers get the lists, never the sources.
- **The lesson table** (`scratchpad/unit9/lesson-table.md`) gives each
  lesson its own substances and numbers before any brief is written, so
  that no two lessons share a number set. In Unit 6 this was found
  afterward, by the originality checks, which replaced about twenty scenes.
- **The stock examples of textbooks are out**, among them: the zinc–copper
  cell at 1.10 V, its $\Delta G^\circ$ of −212 kJ and its $K$ of 10³⁷;
  copper with silver ion at 0.46 V; silver plated at 2.00 A for 30.0
  minutes and copper at 1.50 A for an hour; a kilogram of aluminum from a
  smelter; calcium carbonate in a lime kiln, +178 kJ and 1,110 K; the
  Haber process, −92 kJ, −199 J/K and 462 K; ATP paying for glucose to
  take a phosphate, +13.8 and −30.5; diamond and graphite at −2.9 kJ; NO₂
  and N₂O₄; water boiling at the temperature where $\Delta G^\circ = 0$;
  ice melting above and below 0 °C; hydrogen and oxygen waiting for a
  spark; gasoline in a tank; ammonium nitrate in a cold pack and sodium
  chloride with its $\Delta H$ near zero; a messy room; a gas let into a
  second flask and the chance of its going back; a "dead battery"; a
  copper concentration cell at 0.010 M and 1.0 M; made-up pairs such as
  +25 with −40 for coupled reactions.
- **Every scenario is searched for** in both lists before it is used, and
  every replacement gets the same search. **A replacement must be a true
  example of the idea**: Unit 6 refused one that was not.
- **The finished prose is checked again** for originality, per group.
- After each round the unit's lessons are compared with one another for a
  scene used twice and for a Check that another lesson answers.

Some things cannot be new. The sign rules for entropy, the equation
$\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$ and its four cases,
the three steps of dissolving, the parts of a cell and the chain of
Faraday's law are what they are, and ATP is the framework's own example of
a coupled reaction. The lessons state them in their own words, with their
own substances around them: magnesium hydride where the teacher's notes use
calcium carbonate, methanol from carbon monoxide where they use ammonia,
tin where they use diamond, nitrous oxide in its cylinder where they use
gasoline, glutamine where they use glucose, cobalt and silver where they
use zinc and copper, zinc and tin plated where they plate silver and
copper. A few systems come back from earlier lessons on purpose, because a
promise was made about them: the watch battery (4.7), the smelter (4.5),
the bulb of ethene and hydrogen (7.5), the xylitol (6.1), nitrous oxide (6.6) and silver iodide (7.11).

## 5. Checks that test something

As for Units 6 and 8:

- A Check is an application. It is never answered by the sentence, caption
  or key idea just above it.
- The answer sits at each of the four positions in 15 to 35 percent of the
  unit's Checks with options, and is not the longest option.
- Every wrong option has a message, and every typed-number Check has its
  slips. A message names the likely mistake or the thing to check. **With
  that option crossed off, it must not leave one option standing or confirm
  half of the right one.**
- An answer option is never math alone.
- "Only" and "every" are checked by name.

And for this unit's numbers:

- **A typed answer carries its sign.** Where the answer is negative, the
  Check's `numeric` is negative, the question says "with its sign", and
  the answer with the sign dropped or reversed is a slip.
- **The slips of this unit** are the answers its known mistakes give: the
  entropy term left in joules (wrong by a factor of about a thousand, and
  often in sign); $\Delta G^\circ$ left in kilojoules inside $-RT \ln K$;
  a temperature in degrees Celsius; coefficients left out of a sum;
  reactants minus products; an element's $S^\circ$ entered as zero;
  $n$ taken from one half-reaction; a potential multiplied by a
  coefficient; "flip and add" done twice; joules reported as kilojoules;
  minutes not turned into seconds; the electrons per ion left out, or
  multiplied where they divide.
- **A $K$ is typed only when it is safe.** $K = e^{-\Delta G^\circ/RT}$
  multiplies every rounding in the exponent, so the page's 2 percent can
  refuse an honest answer. A Check asks for a typed $K$ only when
  $|\ln K|$ is under 12 and the brief's script shows that the answer from
  298 K and from 298.15 K, and from $\ln K$ kept to three figures, are all
  accepted. Otherwise the Check is a choice among powers of ten. A typed
  $\Delta G^\circ$ from a $K$ has no such trouble.
- **A typed potential** keeps the page's 2 percent, and every slip must
  lie outside it. A typed $\Delta G^\circ$ from a potential accepts the
  answer rounded to two or to three figures, and the script shows it.
- **No typed answer lies near zero**: 2 percent of a small number refuses
  honest rounding.
- **No Check asks for a number from the Nernst equation** (section 3).
- Where the mistake is only a direction (the sign of $\Delta S$, favored
  at high or low temperature, $K$ above or below 1, which electrode is the
  anode, $E$ above or below $E^\circ$), the question is a choice, not a
  typed number.

## 6. Diagrams

### 6.1 Interactive diagrams (Svelte, like the other units)

Three, each with its own tested module in `src/lib/` and a Svelte
component that computes nothing. They share no code: each one's arithmetic
is short.

**Free-energy explorer (lesson 9.3).** Module `src/lib/free-energy.ts`,
block `<FreeEnergy />`.

- $\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$ for four real
  reactions, one for each combination of signs, over a range of
  temperatures.
- **Controls.** A choice of reaction: nitrous oxide breaking down,
  2N₂O(g) → 2N₂(g) + O₂(g) (−164.1 kJ, +148.4 J/K); ozone forming,
  3O₂(g) → 2O₃(g) (+285.4, −137.8); methane with steam, CH₄(g) + H₂O(g) →
  CO(g) + 3H₂(g) (+205.9, +214.7); methanol from carbon monoxide,
  CO(g) + 2H₂(g) → CH₃OH(g) (−90.5, −219.2). A slider of temperature, 200 K
  to 1,400 K in steps of 25 K. It starts at methane with steam, 300 K. 196
  states.
- **A graph** of $\Delta G^\circ$ against temperature, from −400 to +500
  kJ/mol_rxn: the chosen reaction's line drawn heavy and the other three
  faint and dashed, a marker at the chosen temperature, the zero line
  drawn firmly, the half below it hatched and labeled "favored", and,
  where the line crosses zero, a guide at that temperature with its value
  (959 K; 413 K).
- **Three bars**, in kJ/mol_rxn, rising or falling from a zero line:
  $\Delta H^\circ$, which does not move; $-T\Delta S^\circ$, which grows
  with the temperature; and $\Delta G^\circ$, their sum.
- **A readout:** the equation, the temperature, the three numbers each to
  0.1 kJ, the verdict (thermodynamically favored or unfavored at this
  temperature), and the range of temperatures over which the reaction is
  favored: every one, none, above 959 K, below 413 K.
- **What it shows:** the line's height at the left is set by
  $\Delta H^\circ$ and its slope by $\Delta S^\circ$; temperature changes
  only the entropy bar; two of the four reactions never change their
  verdict, and the two that do are the two whose $\Delta H^\circ$ and
  $\Delta S^\circ$ have the same sign; the same pair of gases (carbon
  monoxide and hydrogen) is made at high temperature and used at low.
- **Arithmetic** is exact, in whole tenths of a joule; only the shown
  numbers are rounded. The caption says that $\Delta H^\circ$ and
  $\Delta S^\circ$ are taken as the same at every temperature and that
  each substance is in the state the equation gives it. The slider's
  nearest stop to 25 °C is 300 K, and the lesson says so where it compares
  a hand calculation at 298 K with the explorer.

**Explorer of $\Delta G^\circ$ and $K$ (lesson 9.5).** Module
`src/lib/gibbs-and-k.ts`, block `<GibbsAndK />`.

- A made-up reaction A(g) ⇌ B(g), for which $K$ is simply the ratio of B to
  A at equilibrium, so that the mixture can be drawn.
- **Controls.** A slider of $\Delta G^\circ$, −40 to +40 kJ/mol_rxn in
  steps of 1. A choice of temperature: 298 K, 500 K or 1,000 K. It starts
  at −5 kJ/mol_rxn and 298 K. 243 states.
- **A graph** of $\log K$ against $\Delta G^\circ$: a straight line for
  each temperature, the chosen one heavy and the other two faint and
  dashed, a marker at the setting, and a firm line at $K = 1$.
- **A box of 100 particles** at equilibrium, ten rows of ten, A as open
  circles and B as filled squares, in the proportion $K/(1 + K)$ to the
  nearest particle.
- **A readout:** $\Delta G^\circ$; $RT$ at the chosen temperature and how
  many times $RT$ the free energy change is; $K$ to two figures; and the
  mixture in words ("about 88 of every 100 particles are B"). Where
  rounding would give none or all, it says "fewer than 1 in 100 is A",
  never 0 or 100 percent.
- **What it shows:** zero gives $K = 1$ and a half-and-half mixture; the
  sign of $\Delta G^\circ$ says which side has more, and its size says by
  how much; a few kilojoules either side of zero leave plenty of both; at
  298 K every 5.7 kJ is a factor of ten; +5 kJ still gives 12 particles of
  B in 100; $-\Delta G^\circ$ gives $1/K$; and at a higher temperature the
  same $\Delta G^\circ$ gives a $K$ nearer 1, because it is $\Delta G^\circ$
  beside $RT$ that counts.
- The caption says that the reaction is made up, that for a real reaction
  $\Delta G^\circ$ itself changes with temperature (topic 9.3), and that
  the box shows proportions, not a real count.

**Galvanic cell explorer (lesson 9.9, placed again in lesson 9.10).**
Module `src/lib/galvanic-cell.ts`, block `<GalvanicCell />`.

- Two half-cells, each a metal in a solution of its own ion, joined by a
  wire with a meter and by a salt bridge of potassium nitrate, at 25 °C.
- **Controls.** For each half-cell, a choice of metal from a table of six
  (Ag⁺/Ag +0.80 V; Cu²⁺/Cu +0.34; Sn²⁺/Sn −0.14; Co²⁺/Co −0.28; Cd²⁺/Cd
  −0.40; Cr³⁺/Cr −0.74) and a slider of the concentration of its ion, in
  four steps: 0.0010 M, 0.010 M, 0.10 M, 1.0 M. It starts with tin on the
  left and silver on the right, both at 1.0 M. 576 states.
- **A drawing of the cell.** Under each beaker, "anode: oxidation" or
  "cathode: reduction", with the half-reaction as it runs there; on each
  electrode, "loses mass" or "gains mass"; an arrow on the wire for the
  electrons; arrows in the salt bridge for NO₃⁻ toward the anode and K⁺
  toward the cathode. When the left and right choices are swapped the
  labels change sides and the numbers do not. No electrode has a sign.
- **A ladder of the six reduction potentials**, the two chosen rungs
  marked, with the gap between them labeled as $E^\circ_\text{cell}$.
- **A line for $Q$**, on a logarithmic scale from 10⁻⁹ to 10⁹, with a mark
  at $Q = 1$ ("$Q = 1$: $E = E^\circ$") and a marker at the cell's $Q$.
- **A readout:** the balanced overall equation and $n$; $E^\circ_\text{cell}$;
  $\Delta G^\circ$ to the nearest kJ/mol_rxn; the expression for $Q$ and
  its value; whether $Q$ is below, at or above 1 and so whether $E$ is
  above, at or below $E^\circ$; and $E$ at 25 °C to 0.001 V. (The
  potentials are tabulated to 0.01 V; the third decimal place is shown so
  that a small change can be seen, and the caption says so.)
- **The same metal on both sides** is a concentration cell:
  $E^\circ_\text{cell} = 0$, the half-cell with the lower concentration is
  the anode, and with equal concentrations the readout says that $Q = K =
  1$, $E = 0$ and nothing flows.
- **What it shows, in lesson 9.9:** the half-cell higher on the ladder is
  always the cathode; the cell potential is the gap; silver's coefficient
  of 2 doubles nothing; cobalt with silver and chromium with copper both
  read 1.08 V, yet their $\Delta G^\circ$ values are −208 and −625
  kJ/mol_rxn, because 2 and 6 moles of electrons pass. **In lesson 9.10:**
  diluting the ion that is a reactant raises $Q$ and lowers $E$; diluting
  the ion that is a product lowers $Q$ and raises $E$; the change is small
  beside $E^\circ$ (0.03 V for a factor of ten when $n = 2$); and two
  half-cells of one metal give a potential only while their
  concentrations differ.
- **The model.** $E = E^\circ - (RT/nF) \ln Q$ at 298.15 K with the
  equation page's $R$ and $F$. The concentrations are powers of ten, so
  $\log Q$ is a whole number and the module keeps it as one. The direction
  the cell runs is the direction with $E > 0$; for two different metals
  of this table that is always the direction $E^\circ$ gives: for every
  pair the largest shift these concentrations can cause is smaller than
  the gap (cadmium with cobalt has the smallest gap, 0.12 V, and its
  largest shift is 0.09 V), and the module's tests check all fifteen pairs.

All three follow the rules of the existing diagrams: drawn in their
starting state when the site is built; readable without JavaScript and in
print; usable by keyboard; a text description for screen readers; drawn
text of 12 px or more from a 412 px phone up; controls directly under the
drawing; every number shown comes from a module with unit tests. And what
Unit 6's explorers taught:

- the ids inside each SVG are made with `$props.id()`, since
  `<GalvanicCell />` stands on two pages;
- a readout never contradicts itself by rounding: each shown number comes
  from the unrounded value, and $E$ is shown as $E^\circ$ plus a shift
  rounded once;
- a readout never says 0 or 100 percent for nearly none or nearly all;
- two things that must be told apart differ in shape, pattern or position
  as well as color: the favored half of the graph is hatched, A and B
  differ in shape, anode and cathode are named in words;
- after the code review, every sentence of a lesson that quotes an
  explorer's number is compared with the module again.

### 6.2 Drawn figures

Static SVG files in `public/figures/`, in the style of Units 3, 4 and 6.
Nineteen; the briefs settle the list. **A curve or a line in a figure is
plotted from points computed in the brief's script**, never sketched:
Unit 6's one redrawn figure was a graph with its slopes out of proportion.

| Lesson | Figure |
|---|---|
| 9.1 | One substance as a solid, a liquid and a gas in three boxes of the same size, with the room each particle has |
| 9.1 | The same 10 particles of gas in a cylinder with its piston pushed in, then in twice the volume with the piston pulled out: the same particles, twice the room |
| 9.1 | The spread of kinetic energies in a gas at a low and a high temperature: the same area, a lower and wider curve |
| 9.2 | Rusting as a tally: bars of $S^\circ$ times coefficient for the reactants and for the product, and the gap between the totals |
| 9.3 | Four small graphs of $\Delta G^\circ$ against temperature, one for each combination of signs, each with its favored stretch marked |
| 9.3 | Magnesium hydride at 298 K and at 700 K (`9-3-magnesium-hydride-bars.svg`): a bar for $\Delta H^\circ$ and a bar for $T\Delta S^\circ$ at each temperature |
| 9.4 | An energy profile with a high hill and a lower finish, with "which way" pointing at the two ends and "how fast" at the hill |
| 9.5 | Two rulers side by side at 298 K: $\Delta G^\circ$ from −30 to +30 kJ and $K$ from 10⁵ to 10⁻⁵, each 5.7 kJ a factor of ten |
| 9.6 | Dissolving a salt as three changes, each box marked with the sign of its enthalpy and of its entropy |
| 9.6 | Water molecules around a small ion with a 2+ charge, turned and held, beside water molecules free to move |
| 9.7 | Two equations stacked with the shared sulfur crossed out (`9-7-shared-sulfur.svg`: Cu₂S giving copper and sulfur, sulfur burning to SO₂), and below them bars of +86.2 and −300.1 adding to −213.9 |
| 9.8 | A galvanic cell of cobalt and silver with every part named and the directions of electrons and ions shown |
| 9.8 | The two electrode surfaces at the level of particles: a cobalt atom leaving as an ion, a silver ion arriving and joining the metal |
| 9.8 | An electrolytic cell for molten magnesium chloride: one pot, two electrodes, a power supply, and where each product forms |
| 9.9 | Three rulers side by side for a reaction with $n = 2$ at 298 K: $E^\circ$, $\Delta G^\circ$ and $K$, with zero, zero and 1 on one line |
| 9.10 | The tin and silver cell's potential against $\log Q$: a straight line through $E^\circ$ at $Q = 1$, falling to zero at $Q = K$ |
| 9.10 | A concentration cell of cobalt: a dilute and a concentrated half-cell, told apart by hatching and label, with the electron flow |
| 9.11 | The chain from current and time to mass, with what joins each link to the next |
| 9.11 | A plating bath: the object as the cathode, where the metal ions gain electrons |

## 7. How it is made

The Unit 6 pipeline, with the model for each task:

| Step | Model |
|---|---|
| 1. The framework summary (from knowledge; section 1) | the controller, Fable 5.2 |
| 2. Inventories: the teacher's materials; the site | Haiku |
| 3. This design, the lesson table and the instructions for each kind of agent | Fable 5.2 |
| 4. Briefs, one per lesson, each with a number-check script, in three groups | Fable 5.2 |
| 5. A fact-check of the briefs, by fresh agents that solve before they read and judge every value from memory | Fable 5.2 |
| 6. An originality check of the briefs against both inventories and one another | Sonnet |
| 7. Decided fixes to the briefs, and a second check of what changed | Sonnet applies; Fable 5.2 checks |
| 8. The plan, with this design, in one pull request | the controller |
| 9. The three explorers, test-first, one builder each | Opus |
| 10. A TypeScript review and a code review of each explorer | Sonnet |
| 11. Writers, one per lesson, files only, with figures and the Checks' messages | Fable 5.2 |
| 12. One build and one test run; each lesson swept in the browser at 412, 390, 360 and 320 px; each figure looked at | the controller |
| 13. A fact-check per lesson, by a fresh agent that has not seen the brief, judging every value again | Fable 5.2 |
| 14. An originality check per group | Sonnet |
| 15. Decided fixes applied; build and tests again; a second check of what changed | Sonnet applies; Fable 5.2 checks |
| 16. The pull request, merged when "Build and test" passes | the controller |

Never both the writer and the checker on a cheaper model: the fact-check is
the safety net. Steps 5 and 13 are the two independent checks of every
reference value that section 1 promises.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan, with the eleven briefs |
| B | The free-energy explorer, lessons 9.1–9.4; the sample lessons of `check-dist.test.ts` moved to unit 0; Unit 9 on the build's feedback list |
| C | The explorer of $\Delta G^\circ$ and $K$, lessons 9.5–9.7; the two corrected sentences of the Unit 5 and Unit 7 practice |
| D | The galvanic cell explorer, lessons 9.8–9.11; Unit 9 on the balance test; the close-out notes |

Each is stacked on the one before, targets `main`, and is merged when its
checks pass. If the Unit 8 pull requests are still open when a Unit 9 one
is ready, the Unit 9 branch is rebased on `main` after each Unit 8 merge:
the two units touch the same three shared files (`[topic].astro`,
`diagram.css`, `check-dist.test.ts`) and `FEEDBACK_UNITS`.

- **`FEEDBACK_UNITS`** (`scripts/check-dist.mjs`, line 30) gains `'9'` in
  pull request B.
- **The sample lessons of `tests/unit/check-dist.test.ts`** stand in a
  unit that is not on the list, so that the rules for other things can be
  tested without messages. The Unit 6 work put them in topic 8.2 and the
  Unit 8 work moves them to 9.2. Unit 9 is the last unit, so pull request
  B moves them, before `'9'` joins the list, **to topic 0.2, in a unit 0
  that does not exist and never will**: `checkPage` reads the topic as
  text, takes what stands before the period and looks it up in
  `FEEDBACK_UNITS`, and asks nothing else of it. The changes: the comment
  and `data-topic` of `lesson` (lines 12 and 13; the comment becomes "Unit
  0 does not exist, so it is never on FEEDBACK_UNITS: these lessons test
  the other rules."), `inUnit(0, …)`, the expected string "lesson 0.2" and
  `FEEDBACK_UNITS.has('0')` (lines 30 to 43), and the expected strings
  "lesson 0.2" (lines 134 to 189). After this the samples never have to
  move again.
- **The data file**
  `docs/superpowers/plans/2026-11-27-chemstudy-unit-9-check-feedback.json`,
  which `tests/e2e/check-feedback.spec.ts` needs for a unit on the list, is
  derived from the lessons in each of pull requests B, C and D.
- **`BALANCED_UNITS`** (`tests/unit/check-balance.test.ts`, line 9) gains
  `9` in pull request D, when all eleven lessons are in.

## 9. Not in this design

- The Unit 9 practice: the teacher's worksheets, self-study ladders and
  free-response sets, converted under the rules of the other units. The
  unit exam stays closed.
- A Unit 9 comprehensive test, after the practice.
- Any change to lessons 4.5, 4.7, 4.9, 5.5, 5.6, 5.11, 6.1, 6.6, 6.8, 7.3,
  7.5, 7.10 and 7.11, or to the equation page. The only pages outside
  Unit 9 that change are the two practice pages named in section 3.
- An electrolytic mode for the cell explorer, and any explorer for
  Faraday's law: lesson 9.11's chain is arithmetic that a drawn figure
  shows as well.

## 10. Done when

- All eleven lessons are built, pass the browser and accessibility tests,
  and are merged.
- Every lesson has been fact-checked independently and checked for
  originality, twice where it changed, and every accepted finding is fixed.
- Every reference value has been judged by two checkers, and each one they
  could not both confirm is listed for the teacher.
- Every reaction with formation values gives one $\Delta G^\circ$ by both
  routes, and every cell with them gives the same $\Delta G^\circ$ from
  its potential, in the briefs' scripts.
- Every Check says something for each wrong answer, and each option is the
  answer in 15 to 35 percent of the unit's Checks with options.
- No lesson scrolls sideways at 320 px with every answer open.
- All three interactive diagrams work by keyboard, and all three show a
  drawn picture without JavaScript and in print.
- No page of the site says or implies a $K$ for diamond and graphite.
- The teacher has been told, in each pull request, what to verify against
  the framework, that no textbook was read, and which values rest on memory.

Section 11, "As built", is added when the last pull request is opened, as
for Unit 6.

## 11. Changed while the briefs were checked

Each brief had a fact-check, an originality check against the teacher's AP Chem repository and this site, a revision, and a second check of what the revision changed. Every number in every brief is recomputed by a script.

- **No reference value was found wrong.** The first fact-checks found shown steps that did not give their printed result (lesson 9.5's 2.303 × RT, a row of its explorer's table), one piece of wrong reasoning in lesson 9.6 (whether a salt dissolves better in hot water follows the sign of ΔH°, as topic 7.9 says, and not the sign of ΔS°), and messages that gave their answers.
- **The originality check found three scenes that had to go and eighteen that were too close.** What changed:
  - Lesson 9.1 draws a cylinder and piston, not two bulbs joined by a valve, and its third Check uses methane with chlorine.
  - Lesson 9.3's worked example is magnesium hydride giving up its hydrogen (zero ΔG° at 569 K). Silver oxide, the first choice, is a reaction of the site's Unit 7 test.
  - Lesson 9.4 no longer retells topic 7.5's bulb of ethene and hydrogen or topic 5.11's bottle of hydrogen peroxide. Its scenes are a satellite's hydrazine tank over an iridium catalyst, and hopcalite turning carbon monoxide to carbon dioxide in an escape mask.
  - Lesson 9.5's table of ΔG° against K is recast around the mixture with Q = 1.
  - Lesson 9.7 was largely rebuilt. Its first plan, a metal oxide coupled to carbon through oxygen, is a free-response question of the teacher's. The centerpiece is now copper from Cu₂S with air, sharing sulfur; the typed Check is mercury from cinnabar; the second worked example is ATP remade from phosphocreatine.
  - Lesson 9.9 has no table of "one fact, three ways"; the rulers figure carries it. Its explorer walk-through ranks two cells by potential and by ΔG° and no longer sets two cells of equal potential side by side.
  - Lesson 9.10's Checks 2, 3 and 6 are new questions: four mixtures of one cell ranked through Q, a table of concentrations at four moments, and a classmate who puts a working cell's concentrations into the K expression.
  - Wording that followed the teacher's notes was rewritten in lessons 9.2, 9.6, 9.8 and 9.11.
- **The second checks found three Checks answered by the text above them or by their own options** (lesson 9.4's third, lesson 9.7's fourth, lesson 9.10's third); each was changed.
- **New reference values, from memory, each judged by a second checker:** MgH₂(s) ΔH°f −75.3 kJ/mol, S° 31.1 J/(mol·K), ΔG°f −35.9 kJ/mol; Mg(s) S° 32.7; CH₃Cl(g) S° 234.6; HgS(red) ΔG°f −50.6 kJ/mol; hydrolysis of phosphocreatine −43.0 kJ/mol.
- **For the teacher to decide:** in lesson 9.6 the entropy change of the step that separates the solvent's molecules is given as negative, with a sentence that says sources differ; many AP sources give it as positive.
