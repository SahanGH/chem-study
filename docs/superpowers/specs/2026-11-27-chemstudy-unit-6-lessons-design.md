# ChemStudy: Unit 6 lessons

Written on 2026-11-27, against `main` at `8b4472e` (the merge of pull request
#76). It adds to the main design, `2026-11-12-chemstudy-redesign-design.md`,
and changes nothing in it. It follows the Unit 4 lessons
(`2026-11-16-chemstudy-unit-4-lessons-design.md`) and the rules that design's
"As built" section sets for the units to come, and the check feedback design
(`2026-11-26-chemstudy-us-english-and-unit-1-check-feedback-design.md`).

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Unit 6 | Thermochemistry, started on 2026-11-27: "Start the Unit 6 design, code and deploy. Use multi model for different tasks" |
| Scope | This design covers the nine lessons and their diagrams. The practice converted from the teacher's materials and a comprehensive test each get their own design and plan, as for Unit 4. |
| Merging | **Claude merges.** Asked on 2026-11-27 whether to merge each Unit 6 pull request once its checks pass, the teacher chose "Merge everything". Each pull request is merged when "Build and test" passes, and lists Claude's calls for the teacher to change afterward. |
| The old course | The teacher's Unit 6 materials are read from the teacher's `AP_Chem_Prep` repository ("You can use AP Chem repo"), as a reference for coverage and emphasis and as a list of what not to repeat. |
| Models | Several, by task (section 7). |

**Two sources the building session could not reach**, and what stands in
their place:

- **The framework's printed pages.** The College Board's site is blocked in
  the session, and `AP_Chem_Prep` does not hold the PDF. Section 3 is
  written from Claude's knowledge of the 2024 framework, checked against the
  teacher's unit map. **The teacher is asked to compare section 3 with the
  framework.** If a statement is wrong, the lesson that rests on it is
  corrected in a follow-up pull request.
- **The two Tro textbooks.** No list of their examples could be made.
  Originality is checked against the teacher's Unit 6 and Chapter 6
  materials and against the site's own lessons and practice. The stock
  examples of textbooks in general are listed from knowledge and kept out
  (section 4).

**Claude's calls, for the teacher to confirm or change:**

- **Work is named and not calculated.** The framework says energy leaves or
  enters a system as heat or as work. Lesson 6.1 says so in a sentence, and
  no lesson computes $w = -P\Delta V$ or $\Delta E = q + w$. The teacher's
  notes may go further; section 3 lists what is left out.
- **Calorimetry is at constant pressure**, in an insulated cup. A bomb
  calorimeter is named once, in a "Beyond the exam" sentence in lesson 6.4.
- **The heat the calorimeter itself absorbs** is neglected unless a question
  gives a calorimeter constant; lesson 6.4 shows one such question.
- **Heating curves are taught in lesson 6.5**, though no statement names
  them: the two statements of topic 6.5 describe one, and the exam uses them.
- **The unit kJ/mol of reaction** is written "kJ/mol$_\text{rxn}$" where the
  framework's convention matters (lesson 6.6 onward) and explained once.
- **Bond enthalpies give an estimate.** Lesson 6.7 says why the result
  differs from the measured value, and uses only molecules in the gas phase.
- **"State function" is named once**, in a "Beyond the exam" sentence in
  lesson 6.9.
- **Water's specific heat capacity is 4.18 J/(g·°C)**, given in every
  question that needs it, as the exam gives it.
- **Two interactive diagrams** (section 6), in lessons 6.4 and 6.5.

## 2. What students get

Nine lessons, one per topic of the 2024 framework:

| Topic | Lesson | What it carries |
|---|---|---|
| 6.1 | Endothermic and Exothermic Processes | System and surroundings; a temperature change as the sign of an energy change; exothermic and endothermic, for heating and cooling, phase changes and reactions; why the surroundings warm when the system loses energy; dissolving as either, decided by the attractions before and after |
| 6.2 | Energy Diagrams | Reading and drawing a diagram of the energy of a system before and after a change; which way is exothermic; the diagram for a physical change; how it relates to the energy profiles of Unit 5 |
| 6.3 | Heat Transfer and Thermal Equilibrium | Temperature as average kinetic energy; energy passed in collisions from the warmer body to the cooler; thermal equilibrium as equal average kinetic energy, not equal energy |
| 6.4 | Heat Capacity and Calorimetry | $q = mc\Delta T$; specific and molar heat capacity; why equal energy warms equal masses differently; energy conserved between a hot body and a cold one; the coffee-cup calorimeter, for a hot metal and for dissolving |
| 6.5 | Energy of Phase Changes | Energy in to melt and boil, out to freeze and condense, with no temperature change; molar enthalpies of fusion and vaporization and their signs; the heating curve, segment by segment |
| 6.6 | Introduction to Enthalpy of Reaction | $\Delta H$ as the heat at constant pressure, with its sign; the enthalpy change belongs to the equation as written and scales with the amount that reacts; from calorimeter data to $\Delta H$ per mole; where the energy comes from |
| 6.7 | Bond Enthalpies | Breaking bonds takes energy and forming them releases it; estimating $\Delta H$ as bonds broken minus bonds formed; counting bonds from Lewis diagrams; why it is an estimate |
| 6.8 | Enthalpy of Formation | The formation reaction and the standard state; an element's value is zero; $\Delta H^\circ$ of a reaction as products minus reactants, with coefficients |
| 6.9 | Hess's Law | A process as a sequence of steps; the enthalpy change of the whole as the sum of the steps; reversing, scaling and adding equations |

Each lesson is built like the lessons of the other units, with the same
blocks and the same voice, and ends with `PracticeNext`.

**New in this unit, from the first draft:** every Check with options carries
a message for each wrong option, and every typed-number Check carries its
slips (`misses`, `slips`), under the rules of the check feedback design.
Unit 6 goes on the build's feedback list with its first lessons, and on the
balance test when all nine are in.

**What the lessons can lean on.** Bond energy and the potential-energy curve
(2.2); attractions between particles and what dissolving breaks and makes
(3.1, 3.7, 3.10); kinetic energy and temperature for a gas (3.5); phases
(3.2, 3.3); the mole and stoichiometry (1.1, 4.5); net ionic equations
(4.2); energy profiles and activation energy (5.6, 5.10). A lesson names
such a topic in plain text. Units 8 and 9 are not on the site: entropy and
Gibbs energy are named, where a sentence needs them, as topics of Unit 9.

## 3. Staying inside the framework

**Read section 1 first: this section is written from knowledge of the 2024
framework, not from its pages** (`scratchpad/ced/unit6-framework.md` holds
the full summary the briefs were written from).

Lessons are written fresh from the framework's learning objectives and
essential knowledge. **No textbook is used.**

**The teacher's materials** (`Units/unit06-thermochemistry` and
`Chapters/chapter06-thermochemistry` in `AP_Chem_Prep`) are read by an
inventory agent, not by the writers. Each brief carries what the notes
stress, in other words than the notes', and the unit map's list of where
students lose points:

- the sign of $q$ when the point of view moves between system and
  surroundings;
- $q = mc\Delta T$ used during a phase change, where the temperature does
  not change;
- kJ reported where kJ/mol was asked for;
- a reaction reversed in Hess's law without its sign changed;
- "formed minus broken" for bond enthalpies;
- an element's enthalpy of formation taken as anything but zero.

**What the framework leaves out of Unit 6** (one statement):

| Topic | Not assessed | In the lessons |
|---|---|---|
| 6.6 | The technical distinction between enthalpy and internal energy | One "Beyond the exam" sentence in lesson 6.6. Lessons speak of enthalpy change as the heat at constant pressure. |

**Things the framework does not name but the exam uses**, taught without a
"Beyond the exam" label:

- system and surroundings as terms (6.1);
- the heating curve (6.5);
- $q$ for a phase change as moles times the molar enthalpy, and $q$ for a
  reaction as moles of reaction times $\Delta H$ (6.5, 6.6): neither is on
  the equation sheet;
- $q_\text{lost} = -q_\text{gained}$ as the working form of conservation of
  energy in a calorimeter (6.4);
- the standard state, and that the enthalpy of formation of an element in
  its standard state is zero (6.8);
- that a bond-enthalpy calculation is for gases and is an estimate (6.7).

**Left out of the lessons:** $w = -P\Delta V$ and $\Delta E = q + w$ as
calculations; bomb calorimetry beyond its one sentence; heat capacity of a
gas at constant volume and constant pressure; lattice energy and Born–Haber
cycles; enthalpy of solution as a three-step cycle with numbers (lesson 6.1
gives the argument in words); cooling curves with supercooling; phase
diagrams; entropy and Gibbs energy (Unit 9); fuel values and food calories
as a topic of their own.

**The equation sheet** gives, for this unit, $q = mc\Delta T$ and
$\Delta H^\circ_\text{reaction} = \sum \Delta H_f^\circ\,\text{products} -
\sum \Delta H_f^\circ\,\text{reactants}$. It gives no formula for bond
enthalpies, none for a phase change, no statement of Hess's law and no value
for water's specific heat capacity. Lessons say so where it matters.

**Values.**

- Atomic masses are the AP exam's table's, to the figures it prints.
- Specific heat capacities, enthalpies of fusion and vaporization, average
  bond enthalpies and enthalpies of formation are published values, looked
  up by the fact-checker, and one value per quantity across the unit. Where
  the site already prints a bond energy (lessons 2.2 and 4.4), Unit 6 uses
  the same number.
- A temperature change is the same number in °C and in K; lessons say so
  once (6.4) and write $\Delta T$ in °C.
- Signs: $q$ and $\Delta H$ are negative when the system releases energy.
  A sentence in words never says "negative heat": it says "releases 250 kJ".

## 4. Keeping the lessons original

- **Avoid lists before any brief is written** (`scratchpad/unit6/`): every
  example, reaction, number and scene of the teacher's Unit 6 and Chapter 6
  materials (Sonnet), and every scene and substance the site's lessons and
  practice already use (Haiku). The brief-writers get the lists, never the
  sources.
- **The stock examples of textbooks are out**, among them: burning methane,
  propane, octane, ethanol, glucose or hydrogen; the thermite reaction;
  hydrochloric acid with sodium hydroxide in a coffee cup; ammonium nitrate
  cold packs and calcium chloride hot packs; a block of iron, copper,
  aluminum or lead dropped into water; ice melting in a drink and steam
  burns; the heating curve of water; ammonia from nitrogen and hydrogen,
  and the formation of water, carbon dioxide, nitrogen dioxide or sulfur
  trioxide, for Hess's law and formation; diamond to graphite; a bank
  balance or a mountain's height for a state function.
- **Every scenario is searched for** in both lists before it is used, and
  every replacement gets the same search.
- **The finished prose is checked again** for originality, per group.
- After each round the unit's lessons are compared with one another for a
  scene used twice and for a Check that another lesson answers.

Some things cannot be new: $q = mc\Delta T$, the signs, and the three rules
of Hess's law are what they are. The lessons state them in their own words,
with their own examples around them. Water appears as the calorimeter's
liquid because it is what a calorimeter holds.

## 5. Checks that test something

As for Unit 4, with the check feedback design's rules added:

- A Check is an application. It is never answered by the sentence, caption
  or key idea just above it.
- The answer sits at each of the four positions in 15 to 35 percent of the
  unit's Checks with options, and is not the longest option.
- Every wrong option has a message, and every typed-number Check has its
  slips. A message names the likely mistake or the thing to check. **With
  that option crossed off, it must not leave one option standing or confirm
  half of the right one.**
- For a typed number, the answer a common wrong method gives lies outside
  the 2 percent the page accepts: a sign lost, grams where moles were
  needed, the calorimeter's water left out or the metal's mass used for the
  solution's, kJ for J. Where the mistake is only a sign, the question asks
  for the sign in words or as a choice, since the grader reads −250 and 250
  as different numbers and both must be handled on purpose.
- An answer option is never math alone.
- "Only" and "every" are checked by name.

## 6. Diagrams

### 6.1 Interactive diagrams (Svelte, like the other units)

**Calorimetry explorer (lesson 6.4).**

- A hot piece of metal goes into cooler water in an insulated cup. The
  student chooses the metal (three, with clearly different specific heat
  capacities, none of them the stock four), and sets the metal's mass and
  starting temperature and the water's mass. The water starts at one fixed
  temperature.
- A drawing of the cup with two thermometer readouts, before and at thermal
  equilibrium.
- Two bars: the energy the metal loses and the energy the water gains,
  always equal in size, in joules.
- A readout sentence: the final temperature, and why it lies nearer the
  water's starting temperature (the water's larger heat capacity).
- What it shows: the same energy leaves one body and enters the other; the
  temperature changes are not equal; a larger specific heat capacity means
  a smaller temperature change.
- Limits are set so the water never reaches 100 °C.
- Every number comes from a tested module, `src/lib/calorimetry.ts`.

**Heating curve explorer (lesson 6.5).**

- One mole of a substance, heated at a steady rate from a solid below its
  melting point to a gas above its boiling point. The student chooses one
  of two substances whose melting and boiling points and enthalpies differ
  clearly, neither of them water.
- A slider adds energy. A graph of temperature against energy added, with
  the five segments, and a marker at the chosen point.
- A small box of particles drawn for the phase or the mixture of phases at
  that point.
- A readout: the phase present, the temperature, and what the energy being
  added is doing (raising the average kinetic energy, or separating
  particles at constant temperature), with the energy each segment takes.
- What it shows: the flat parts, why the boiling flat is longer than the
  melting flat, and that the slopes of the three rising parts differ with
  the heat capacity of each phase.
- Every number comes from a tested module, `src/lib/heating-curve.ts`.

Both follow the rules of the existing diagrams: drawn in their starting
state when the site is built; readable without JavaScript and in print;
usable by keyboard; a text description for screen readers; drawn text of
12 px or more from a 412 px phone up; controls directly under the drawing;
every number shown comes from a module with unit tests.

### 6.2 Drawn figures

Static SVG files in `public/figures/`, in the style of Units 3 and 4. About
fourteen; the briefs settle the list.

| Lesson | Figure |
|---|---|
| 6.1 | A system and its surroundings, with the arrow of energy for an exothermic and an endothermic change |
| 6.1 | Dissolving in three parts: attractions overcome, attractions made, and which side is larger |
| 6.2 | Two energy diagrams side by side: exothermic and endothermic |
| 6.2 | An energy diagram for a phase change |
| 6.3 | Two bodies in contact as particles, before and at thermal equilibrium |
| 6.4 | A coffee-cup calorimeter, labeled |
| 6.4 | Equal energy into equal masses of two substances: unequal temperature rises |
| 6.5 | A heating curve with its five segments labeled |
| 6.6 | From a temperature change in a calorimeter to $\Delta H$ per mole, as a route |
| 6.7 | Bonds broken and bonds formed on one energy diagram |
| 6.7 | A reaction drawn with every bond shown, for counting |
| 6.8 | Elements, reactants and products on one energy ladder |
| 6.9 | Two routes from the same start to the same end |
| 6.9 | Three equations combined, with what cancels marked |

## 7. How it is made

The Unit 4 pipeline, with the model for each task:

| Step | Model |
|---|---|
| 1. The framework summary (from knowledge; section 1) | the controller, Fable 5.2 |
| 2. Inventories: the teacher's materials; the site | Sonnet; Haiku |
| 3. Briefs, one per lesson, each with a number-check script, in three groups | Fable 5.2 |
| 4. A fact-check of the briefs, by fresh agents that solve before they read | Fable 5.2 |
| 5. An originality check of the briefs against both inventories | Sonnet |
| 6. The plan, with this design, in one pull request | the controller |
| 7. The two diagrams, test-first, one builder each | Opus |
| 8. A TypeScript review and a code review of the diagrams | Sonnet |
| 9. Writers, one per lesson, files only, with figures and the Checks' messages | Fable 5.2 |
| 10. One build and one test run; each lesson swept in the browser at 412, 390, 360 and 320 px; each figure looked at | the controller |
| 11. A fact-check per lesson, by a fresh agent, with reference lookups for every value | Fable 5.2 |
| 12. An originality check per group | Sonnet |
| 13. Decided fixes applied; build and tests again; a second check of what changed | Sonnet applies; Fable 5.2 checks |
| 14. The pull request, merged when "Build and test" passes | the controller |

Never both the writer and the checker on a cheaper model: the fact-check is
the safety net.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Lessons 6.1–6.3; Unit 6 on the build's feedback list |
| C | The calorimetry explorer, the heating curve explorer, lessons 6.4 and 6.5 |
| D | Lessons 6.6–6.9; Unit 6 on the balance test; the close-out notes |

Each is stacked on the one before, targets `main`, and is merged when its
checks pass.

## 9. Not in this design

- The Unit 6 practice: the teacher's worksheets, self-study ladders and
  free-response set, converted under the rules of the other units. The unit
  exam stays closed.
- A Unit 6 comprehensive test, after the practice.

## 10. Done when

- All nine lessons are built, pass the browser and accessibility tests, and
  are merged.
- Every lesson has been fact-checked independently and checked for
  originality, twice where it changed, and every accepted finding is fixed.
- Every Check says something for each wrong answer, and each option is the
  answer in 15 to 35 percent of the unit's Checks with options.
- No lesson scrolls sideways at 320 px with every answer open.
- Both interactive diagrams work by keyboard, and both show a drawn picture
  without JavaScript and in print.
- The teacher has been told, in each pull request, what to verify against
  the framework.
