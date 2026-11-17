# ChemStudy: Unit 1 lessons and the reference pages

Written on 2026-11-16. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it. It
follows the Unit 7 lessons (`2026-11-15-chemstudy-unit-7-lessons-design.md`)
and keeps what that work and the Unit 3 test taught.

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Next unit | Unit 1, Atomic Structure and Properties (2026-11-16: "we will do unit 1; end to end fully"), answering Claude's recommendation of Unit 1 with the periodic table and equation sheet pages first |
| Scope | The whole unit: lessons, then the practice converted from the teacher's materials, then a comprehensive test. This design covers the eight lessons, their diagrams and the two reference pages. The practice and the test each get their own design and plan. |
| Merging | **The teacher merges.** The message did not say to merge, so every pull request waits for the teacher's word. Pull requests are stacked, each on the one before. |
| The old course | The teacher's Unit 1 guided notes are a reference for coverage and emphasis, as for Units 2, 3 and 7. |
| Models | Writers and fact-checkers on Fable 5.2; fixers and originality checks on Sonnet (2026-11-14). If Fable's usage limit stops an agent, it runs on Opus and the pull request says so. |

**Claude's calls, for the teacher to confirm or change in the pull request:**

- The two reference pages are built in this work, before the lessons, as
  recommended. The main design places them in Stage 2.
- The periodic table page carries the masses of the AP exam's own table, not
  the Zumdahl masses of the teacher's printable table: a student's molar mass
  then matches the exam's to the last digit, and the site already uses the
  exam's values (S 32.06).
- No new link in the header: on a 360 px phone the header has 4 px to spare.
  The reference pages are linked from the footer of every page, from the home
  page and from the lessons that use them.

## 2. What students get

### 2.1 Eight lessons

One per topic of the 2024 framework:

| Topic | Lesson | What it carries |
|---|---|---|
| 1.1 | Moles and Molar Mass | Counting by weighing; Avogadro's number; why the mass of one particle in amu equals the molar mass in grams; $n = m/M$; from grams to particles and back through moles; atoms inside a formula unit |
| 1.2 | Mass Spectra of Elements | Isotopes; reading the spectrum of one element; the weighted average, estimated before it is calculated; naming the element from its spectrum |
| 1.3 | Elemental Composition of Pure Substances | Molecules and formula units; the law of definite proportions; composition by mass; the empirical formula from masses or percents; the molecular formula from it and the molar mass |
| 1.4 | Composition of Mixtures | A pure substance and a mixture at the particle level; a mixture's composition is measured, not fixed; the makeup of a mixture, and the purity of a sample, from elemental analysis |
| 1.5 | Atomic Structure and Electron Configuration | The atom's parts; Coulomb's law, used qualitatively; shells and subshells; the configuration of an atom or ion read from the periodic table; core and valence electrons; ionization energy explained by distance and effective nuclear charge |
| 1.6 | Photoelectron Spectroscopy | What the experiment measures; position is the energy to remove an electron, height is how many electrons; from spectrum to configuration to element, and back; why every peak moves as the nucleus gains protons |
| 1.7 | Periodic Trends | Ionization energy, atomic and ionic radius, electron affinity and electronegativity: each trend, and its exceptions, explained from nuclear charge, distance and shielding; estimating a missing value |
| 1.8 | Valence Electrons and Ionic Compounds | Successive ionization energies as the evidence for valence electrons; typical charges from the column; formulas by balancing charge; elements of one column form like compounds |

Each lesson is built like the lessons of Units 2, 3, 5 and 7, with the same
blocks and the same voice. Each ends with `PracticeNext`, which says practice
is on its way until the Unit 1 practice is published.

Topics 1.4 and 1.8 have little essential knowledge. Their lessons are short,
not padded.

**Unit 1 is where a student starts**, so its lessons assume nothing from the
rest of the site. Where a later topic takes an idea further (photons in 3.12,
bonding in 2.1, ionic solids in 2.3, separating a mixture in 3.9), the lesson
says so in a sentence and names the topic.

### 2.2 Two reference pages

- **The periodic table**, `/tools/periodic-table/`: all 118 elements with
  atomic number, symbol and atomic mass as the AP exam's table gives them,
  and under it a list of the elements by name.
- **Equations and constants**, `/tools/equations/`: every equation and
  constant the AP exam's equation sheet gives, in the site's own order and
  words, with what each symbol stands for.

Section 7 describes them.

## 3. Staying inside the framework

**The framework was read from page pictures**, not from extracted text,
before anything else was written (`scratchpad/ced/unit1-framework.md`). The
extracted text loses the proportional sign in Coulomb's law, the whole
"Atomic Structure" block of the equation sheet, and every exponent.

Lessons are written fresh from the framework's learning objectives and
essential knowledge. **No textbook is used.**

**The teacher's guided notes**
(`D:\AP_Chem_Prep\Units\unit01-atomic-structure\u01-notes.tex`) are read by
the controller, not by the writers: the notes follow the Zumdahl textbook.
Each brief carries what the notes stress:

- count by weighing, and go from grams to particles through moles;
- an average atomic mass is a weighted average, never the plain average of
  the peak masses, and the answer is estimated first (it is pulled toward
  the most abundant isotope);
- from percents to a formula: take 100 g, convert to moles, divide by the
  smallest, and multiply when a ratio ends near .33, .5 or .67 (never round
  those away);
- an empirical and a molecular formula are tied by the molar mass, and can
  be the same;
- a mixture's composition is measured, where a compound's is fixed;
- for an ion, remove or add the electrons first, then write the
  configuration; a configuration can be ground-state, excited or impossible;
- every explanation is a claim followed by a Coulomb's-law sentence that
  names nuclear charge, distance or shielding;
- on a photoelectron spectrum, height is the number of electrons and
  position is the energy to remove one: students carry "height is abundance"
  over from mass spectra;
- "it wants a full octet" explains nothing and earns nothing;
- oxygen's first ionization energy is below nitrogen's because of the
  repulsion between two electrons paired in one orbital, not because a
  half-filled subshell is "stable";
- the first big jump in successive ionization energies marks the end of
  the valence electrons.

These are the notes' points, not their words. Where a point as the notes
put it is not literally true ("every conversion runs through moles", "the
average lies nearest the tallest peak", "the largest jump"), the lessons
state the true version.

The notes barely cover topics 1.4 and 1.8 and leave out electron affinity.
Those parts rest on the framework alone.

**What the framework leaves out of Unit 1** (three statements):

| Topic | Not assessed | In the lessons |
|---|---|---|
| 1.2 | Mass spectra of samples with more than one element, and peaks from anything other than singly charged ions of single atoms | Lesson 1.2 uses spectra of single elements only. One paragraph that begins "**Beyond the exam:**" says that molecules and doubly charged ions add peaks to a real spectrum. |
| 1.5 | Assigning quantum numbers to electrons | Not taught. One "Beyond the exam" sentence in lesson 1.5 names them. |
| 1.7 | Writing the configuration of an element that is an exception to the Aufbau principle | Lesson 1.5 writes no such configuration and says in a sentence that a few elements, chromium and copper among them, depart from the pattern and are not asked for. |

**Things the framework does not name but the exam uses**, taught without a
"Beyond the exam" label:

- percent composition by mass as a named quantity, and the molecular formula
  found from the empirical formula and the molar mass (1.3);
- noble-gas shorthand for a configuration (1.5);
- the direction of each periodic trend, and the two dips in first ionization
  energy across a period (1.7);
- successive ionization energies (1.8);
- "binding energy" as the name of a photoelectron spectrum's energy axis,
  in MJ/mol, which may run either way: the lesson says to read the axis
  (1.6).

**Orbitals.** The framework's Unit 1 never uses the word, and names neither
Hund's rule nor the Pauli principle. Lesson 1.5 still says, in one short
section, that a subshell is made of orbitals holding two electrons each (one
in s, three in p, five in d) and that electrons of a subshell occupy separate
orbitals before they pair: the oxygen dip in lesson 1.7 cannot be explained
without it. No Check asks for an orbital diagram, and no rule is drilled by
name.

**Left out of the lessons:** hydrates and combustion analysis (the teacher's
notes and practice have both; the framework has neither), the photoelectric
equation as a calculation, the Bohr model, how a mass spectrometer works
beyond one sentence, the naming of ionic compounds, polyatomic ions and
lattice energy. What the practice does with the hydrate and combustion
questions is decided in the practice design.

**The equation sheet** gives, for this unit, $n = m/M$, Avogadro's number and
Coulomb's law as a proportionality with no constant. It gives no equation for
particles from moles, no weighted-average formula, nothing on percent
composition and nothing on photoelectron spectra. Lessons say so where it
matters.

**Values.**

- Atomic masses are the AP exam's table's, to the figures it prints (H 1.008,
  C 12.01, Cl 35.45, Pb 207.2).
- Isotope masses and abundances are real, from the IUPAC tables, and a
  weighted average worked from them agrees with the table's mass to the
  figures shown. A made-up element is called element X.
- Ionization energies (NIST), covalent radii (Cordero and others, 2008) and
  Pauling electronegativities are published values, one value per element
  across the site. Electronegativities equal lesson 2.1's. Lesson 2.4 gives
  carbon's radius as "about 77 pm"; this set gives 76 pm, and the lesson is
  changed to match.
- Binding energies in a photoelectron spectrum of a real element are the
  values of the table used in teaching photoelectron spectroscopy, whose
  valence values equal the first ionization energies. A spectrum of an "unknown" may be schematic, and
  the lesson then says so.
- Constants are the site's: $N_A = 6.022 \times 10^{23}$ mol⁻¹.

## 4. Keeping the lessons original

What Units 3 and 7 taught, applied from the start:

- **Avoid lists before any brief is written.** Two were made
  (`scratchpad/unit1/`): every worked example, practice item and exercise of
  both Tro books in the chapters that cover Unit 1 (about 340 entries), with
  the stock choices of textbooks in general; and the 75 examples of the
  teacher's notes with the values used in the teacher's practice. The
  brief-writers get the lists, never the sources.
- **The stock examples are out**, among them: chlorine, copper, boron,
  magnesium and neon for isotopes; a copper penny, a diamond and a helium
  balloon for the mole; water, carbon dioxide, glucose, vitamin C, aspirin
  and caffeine for composition; brass for a mixture; the neon spectrum for
  photoelectron spectroscopy; sodium against its ion for radius.
- **Tro has no photoelectron spectroscopy and no section on mixtures**, so
  lessons 1.4 and 1.6 have little to collide with. The check still runs.
- **Every scenario is searched for before it is used**: the briefs are
  checked for originality against both Tro books, the teacher's notes and
  the site's own lessons before the plan is committed, and every replacement
  is searched for before it goes in.
- **The finished prose is checked again**, since sentences drift toward a
  textbook's wording even when the scenario is new.

Some things cannot be new: the two dips in ionization energy are beryllium
to boron and nitrogen to oxygen in every course, and the trend explorer
shows real data. The lessons explain those in their own words, with their
own examples around them, and the originality check rates such a shared fact
as weak.

## 5. Checks that test something

Written into every brief:

- A Check is an application: a new substance, new numbers or a new
  situation. It is never answered by the sentence, caption or key idea just
  above it.
- The correct option is not always first, and is not the longest.
- For a numeric Check, the answer a common wrong method gives lies outside
  the grader's 2 percent, so the mistake is caught: the plain average of
  isotope masses, grams taken straight to particles, a forgotten subscript,
  a ratio rounded when it should be multiplied.
- An answer option is never math alone. Expressions are lettered A to D in
  the question.
- An answer that needs a power of ten is written in e-notation and shows as
  a power of ten.
- **"Only" and "every" are checked by name.** They were the most common
  error in Unit 3's practice.

## 6. Diagrams

### 6.1 Interactive diagrams (Svelte, like Units 2, 3, 5 and 7)

**Photoelectron spectrum explorer (lesson 1.6).**

- The student picks an element from hydrogen to calcium.
- One graph: binding energy in MJ/mol on a logarithmic axis, larger at the
  left, with one peak per subshell. A peak's height is the number of
  electrons in the subshell, and each peak is labeled with its subshell.
- "Compare with" adds a second element's peaks in outline, so that the shift
  of every peak with nuclear charge can be seen.
- Under the graph: the configuration, and a table of subshell, electrons and
  binding energy.
- Every binding energy is the element's measured value, from a tested
  module, `src/lib/pes.ts`.

**Periodic trends explorer (lesson 1.7).**

- A small periodic table of the 34 main-group elements of periods 1 to 5,
  eight columns wide, so it fits a phone.
- The student picks a property: atomic radius, first ionization energy or
  electronegativity. Each cell shows its value and is shaded by it; the
  number carries the information, the shading only helps.
- Picking an element draws the property across its period or down its group
  as a line graph, and the readout gives the element's three values.
- What it shows: the trends, and the dips at boron and oxygen.
- No radius and no electronegativity is shown for a noble gas: both describe
  an atom in a bond, and the radii listed for neon and argon are larger than
  fluorine's and chlorine's, which would only mislead here.
- Electronegativity is shown to one decimal place, as lesson 2.1 states it.
- Electron affinity is not in the explorer: several elements form no stable
  anion, and the lesson handles it with a small table.
- Every value comes from a tested module, `src/lib/periodic-trends.ts`.

Both follow the rules of the existing diagrams: drawn in their starting
state when the site is built; readable without JavaScript and in print;
usable by keyboard; a text description for screen readers; drawn text of
12 px or more from a 412 px phone up; every number shown comes from a module
with unit tests, compared with values compiled and checked independently.

### 6.2 Drawn figures

Static SVG files in `public/figures/`, in the style of Units 3 and 7. About
fifteen; the briefs settle the list.

| Lesson | Figure |
|---|---|
| 1.1 | The three quantities and the two conversions between them: mass, moles, number of particles |
| 1.2 | The mass spectrum of an element with two isotopes |
| 1.2 | The mass spectrum of an element with four or five isotopes |
| 1.3 | A molecular substance and an ionic one at the particle level: molecules, and a formula unit in a lattice |
| 1.4 | Three boxes of particles: an element, a compound, a mixture |
| 1.5 | An atom as nucleus and shells, core and valence electrons marked |
| 1.5 | The periodic table as a map of the subshell being filled |
| 1.5 | The subshells in order of energy, with how many electrons each holds |
| 1.6 | A photoelectron spectrum with its parts named |
| 1.6 | The spectra of two neighboring elements, one above the other |
| 1.7 | First ionization energy against atomic number across two periods |
| 1.7 | An atom beside its cation and an atom beside its anion, to scale |
| 1.7 | The outline of the periodic table with the direction each property grows |
| 1.8 | Successive ionization energies of one element as bars, with the jump |
| 1.8 | One column of the periodic table and the like compounds its elements form |

Graphs of real data plot the values the modules hold. Particle drawings keep
exact counts.

## 7. The reference pages

### 7.1 The periodic table

- **What a cell shows:** atomic number, symbol and atomic mass, as the exam's
  table does. The 34 elements for which the exam prints no mass show none.
- **Layout:** the usual eighteen columns, groups numbered 1 to 18, with the
  fifteen lanthanoids and fifteen actinoids set below, as on the exam.
- **What the exam's table lacks, added quietly:** each cell's accessible name
  is the element's name; the s, p, d and f blocks carry a faint tint with a
  key (lesson 1.5 reads configurations from them); and a list of all 118
  elements by name follows the table, with symbol, atomic number and mass.
  The list is what the site's search finds, and what a phone shows best.
- **On a phone** the table is wider than the screen and scrolls inside its
  own box, which can be reached and scrolled by keyboard. The page itself
  never scrolls sideways.
- **No JavaScript.** The page is plain HTML built from one data file,
  `src/data/elements.ts`, which the trend explorer's table also reads.
- **Print:** the table fits the width of a page.
- It says where its values come from, and that the exam's table has no
  names.

### 7.2 Equations and constants

- Every equation and constant of the exam's sheet ("AP Chemistry Equations
  and Constants", effective 2025), transcribed from page pictures and checked
  by a second reader.
- **The site's own arrangement:** grouped by the site's units, each equation
  with what its symbols stand for and the topic that teaches it, in plain
  words. The sheet's layout and wording are not reproduced.
- A short list of **what the sheet does not give** and students must know:
  particles from moles, the weighted average, $Q$, $K_{sp}$, the 5 percent
  check.
- An MDX page, so its math is rendered by the same KaTeX pipeline as the
  lessons. Long equations sit on their own lines and split, as in lessons.

### 7.3 Finding them

- A line in the footer of every page: "Periodic table · Equations".
- A short "Reference" section on the home page, under the units.
- Lessons 1.1, 1.2, 1.5 and 1.7 link to the periodic table where they first
  use it.

## 8. How it is made

The Unit 7 pipeline:

1. **The framework, from page pictures.** Done.
2. **The data**: the 118 elements, the binding energies and the trend values
   are compiled by one agent with their sources, and checked value by value
   by a second. The equation sheet is transcribed by one and checked by
   another.
3. **Briefs**, one per lesson, each with a number-check script.
4. **A fact-check of the briefs** on Fable 5.2, and **an originality check**
   on Sonnet. Replacements are searched for before they are used.
5. **The plan**, with this design, in one pull request.
6. **The code, test-first**: the reference pages by one builder, each diagram
   by one builder that runs unit tests only; then a TypeScript review and a
   code review.
7. **Writers, in parallel**, one per lesson, files only.
8. **One build and one test run**, and a look at each lesson and page at 412,
   390, 360 and 320 px with every answer open, and at each figure.
9. **A fact-check per lesson** on Fable 5.2, by a fresh agent that solves
   before it reads, and **an originality check** per group on Sonnet.
10. **Fixes** by the lesson's own writer, then the build and tests again,
    then **a second check** of what changed.
11. **The pull request**, left for the teacher to merge.

## 9. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | The reference pages: the element data, the periodic table, the equations page, the links to them |
| C | Lessons 1.1–1.4 |
| D | The photoelectron spectrum explorer, lessons 1.5 and 1.6 |
| E | The periodic trends explorer, lessons 1.7 and 1.8, the close-out notes |

Each is stacked on the one before and targets `main`, so they merge cleanly
in order with merge commits, as Unit 2's did.

## 10. Not in this design

- The Unit 1 practice: Worksheets 1–4, the self-study ladders and the
  free-response set, converted from the teacher's materials under the rules
  of the other units. The unit exam (`exam/u01-exam.tex`) stays closed.
- A Unit 1 comprehensive test, after the practice.
- A link to the reference pages in the header, an element's own page, and
  any interactive periodic table beyond the trend explorer.

## 11. Done when

- All eight lessons and both reference pages are built, pass the browser and
  accessibility tests, and wait in pull requests for the teacher.
- Every lesson has been fact-checked independently and checked for
  originality, twice where it changed, and every accepted finding is fixed.
- Every element's mass, every binding energy, every trend value and every
  equation has been checked against its source by a second reader.
- No lesson or page scrolls sideways at 320 px with every answer open.
- Both interactive diagrams work by keyboard, and both show a drawn picture
  without JavaScript and in print.
