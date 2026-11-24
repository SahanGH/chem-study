# ChemStudy: Unit 1 practice

Written on 2026-11-17. It follows the Unit 1 lessons design
(`2026-11-16-chemstudy-unit-1-lessons-design.md`) and adds to the main
design, `2026-11-12-chemstudy-redesign-design.md`, changing nothing in it.

The teacher asked for Unit 1 "end to end fully" (2026-11-16): lessons, then
the practice, then a comprehensive test. The lessons wait in pull requests
#52, #53, #55 and #57. This is the practice. **Nothing here is merged
without the teacher's word**: the request did not say to merge.

Every decision below is one the teacher already made for the practice of
Units 5, 2, 7 and 3 (Plans 3, 6, 10 and 12), applied to Unit 1. What is new
is in section 4.

## 1. What is converted

| Order | Document | Source in `D:\AP_Chem_Prep\Units\unit01-atomic-structure\` | Topics |
|---|---|---|---|
| 1 | Skill ladders (10 ladders, 40 questions) | `u01-selfstudy.tex` | 1.1 to 1.8 |
| 2 | Worksheet 1: Moles and formulas | `worksheets\u01-ws1.tex` | 1.1, 1.3 |
| 3 | Worksheet 2: Mass spectra and mixtures | `worksheets\u01-ws2.tex` | 1.2, 1.4 |
| 4 | Worksheet 3: Configurations and photoelectron spectra | `worksheets\u01-ws3.tex` | 1.5, 1.6 |
| 5 | Worksheet 4: Two free-response questions | `worksheets\u01-ws4.tex` | 1.6, 1.8 |
| 6 | Free-response set (5 questions, 32 points, 50 minutes) | `u01-frq.tex` | 1.1 to 1.8 |

The four worksheets hold 19 questions between them; Worksheet 4's two are
scored, 4 points each. Each document lives in `src/content/practice/unit-1/`
and is served at `/unit-1-atomic-structure/practice/<name>/`. The lessons'
"Practice next" then lists them by topic with no change.

A document's topics list names only what it tests. The fact-check settles
each list; the table above is the starting point (Worksheet 4's second
question is tagged 1.7 in the source, and it asks about successive
ionization energies, which lesson 1.8 teaches).

## 2. What is not converted

- **The unit exam** (`exam\u01-exam.tex`). It stays a closed test.
- **The unit map, the guided notes and the review sheet.** They belong to
  one class.
- **The "Quick review" strip** that ends each worksheet (the teacher's
  decision of 2026-11-13, for all units).
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept, as in the other units.
- **Notes to the teacher or to a question writer**: the comments at the top
  of the ladders and the free-response set, and the worksheets' subtitles
  that name a type of sheet or a class routine.

## 3. How a document is made

Exactly as in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"):

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it. Wording is recast for a student anywhere: US spelling, no em
  dashes, nothing that points at a class, a textbook or a sheet of paper.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric". Nothing is typed or graded.
- **The audit** (`scripts/practice-audit.mjs`) compares each document with
  its source: numbers, formulas, parts, rubric lines and wording. Each
  difference is fixed or recorded with its reason.
- **An independent fact-check** of each document by a fresh agent that
  solves every question before it reads the answer, checks every claim
  against the framework and the Unit 1 lessons, and compares the document
  with its key PDF in `D:\AP_Chem_Prep\build\Units\unit01-atomic-structure\`.
- **Corrections to the old chemistry are made on the site**, since the MDX
  becomes the master copy. Each pull request lists them for the teacher to
  accept or reverse.
- **Answers use the lessons' terms and rules** (section 4.5).

**Models.** Writers and fact-checkers on Fable 5.2, by the teacher's choice
for this repository; fixers that apply a decided list on Sonnet. There is no
originality check: the practice is the teacher's own material.

## 4. New for Unit 1

### 4.1 Two spectra are drawn, and practice pages gain the lessons' figure block

Two questions print a spectrum: Worksheet 2, question 1 (the mass spectrum
of zirconium, five peaks) and Worksheet 3, question 4 (a photoelectron
spectrum with four peaks, which is magnesium's). Reading a drawn spectrum is
the skill lessons 1.2 and 1.6 teach, and the exam prints spectra as
pictures. So both are drawn, as static SVG files in `public/figures/` in the
style of the lessons' own spectra (`1-2-…`, `1-6-…`), from the values the
source plots:

- zirconium: masses 90, 91, 92, 94 and 96 amu with relative abundances 51.5,
  11.2, 17.1, 17.4 and 2.8 percent;
- the photoelectron spectrum: binding energies 126, 9.07, 5.31 and 0.74
  MJ/mol with relative heights 2, 2, 6 and 2, the larger energy at the left,
  as in lesson 1.6.

Each figure is followed by a small table of the same values, as lesson 1.6
does: the audit reads the table (it cannot read a figure), and a student who
cannot see the picture has the numbers.

**One code change.** The practice route supplies `Answer`, `Blank`, `Lewis`,
`Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`. It
gains the lessons' `Figure`. Nothing else changes: the styles, the audit and
the browser tests already cover it (a figure's `alt` and `caption` must not
contain a `>` character, which the audit's tag pattern would stop at).

The other spectra in the sources (Worksheet 4's question 1, Ladders 3 and 8,
the free-response set's questions 1 and 2) are given as numbers in the text,
and stay as text.

### 4.2 Two questions that ask for a drawing

- **Worksheet 2, question 3** asks for a particle drawing of a mixture of a
  diatomic element and a compound. It stays a question to answer on paper,
  and the answer says what the drawing must show, as in Units 2 and 3.
- **Worksheet 3, question 3** asks how many unpaired electrons a nitrogen
  atom has and asks for the 2p orbital diagram. The lessons draw no orbital
  diagrams with arrows, and the framework does not name them; lesson 1.5
  gives the rule in words (each electron of a subshell takes an empty
  orbital before any two share one). The question keeps its count and says
  what "unpaired" means in a clause. The drawing becomes optional ("three
  boxes for the three 2p orbitals, if a sketch helps"), and the answer gives
  the count from the lesson's rule and describes the sketch.

### 4.3 The exam table's atomic masses

The site computes every molar mass from the atomic masses the AP exam's
table prints (`/tools/periodic-table/`). The sources agree with it except
for magnesium (24.31 against the table's 24.30), carbon (12.011 against
12.01) and helium (4.003 against 4.00). A script
(`scratchpad/unit1-practice/recompute.py`) recomputes every numeric answer
with the table's masses and unrounded intermediates. **Two answers change:**

| Where | Source | With the exam table's masses |
|---|---|---|
| Ladder 1, part (b): atoms in 2.25 g of magnesium | 5.57 × 10²² | 5.58 × 10²² |
| Ladder 2, part (a): molar mass of MgCl₂ (used again in Ladder 4) | 95.21 g/mol | 95.20 g/mol |

Printed intermediate values follow the table's masses too (moles of carbon
in Ladder 5). Avogadro's number is 6.022 × 10²³ in the sources and on the
site.

The mass unit is written **amu**, as the lessons and the exam's table write
it; the sources write "u".

Each document's introduction links to the site's periodic table, since every
calculation in the unit starts from it.

### 4.4 Corrections to the originals

Found while the sources were read; each is made on the site, checked by the
fact-check, and listed in its pull request for the teacher to accept or
reverse.

- **Worksheet 1, question 5(c):** the key gives 0.2003 g of calcium in the
  tablet; the data give 0.2002 g.
- **Worksheet 3, question 5:** the 1s binding energy of oxygen is printed as
  54.4 MJ/mol. The site's data (`src/lib/pes.ts`, the explorer of lesson
  1.6) have 52.6, and the question's reasoning needs only that it is far
  above carbon's 28.6. It becomes 52.6.
- **Worksheet 2, question 1:** the key calls 91.2 the "actual" mass beside
  an expression that, with whole-number masses, gives 91.3. The answer says
  which is which (the estimate from mass numbers; the table's 91.22).
- **Worksheet 2, question 2 (antimony):** the estimate "38 percent and 62
  percent" comes from the mass numbers 121 and 123 and is kept as an
  estimate; the answer adds that the measured abundances are near 43 and 57
  percent, because the isotopes' masses are not whole numbers.
- **Worksheet 4, question 1(b):** the key says one peak of the sulfide ion's
  spectrum "grows". Lesson 1.6 teaches that every peak of an anion also
  moves to a lower binding energy; the answer says both.
- **Free-response question 1(a):** the rubric asks for 10.81 from abundances
  given to three figures. The answer gives 10.8 amu and the rubric line
  accepts 10.8 or 10.81.
- **Free-response question 3:** the fourth figures of three mole amounts in
  the key are loose (0.01665 for 0.01666, and so on). The formulas do not
  change.
- **Ladder 5:** a stray "= 2" in the worked example ("180.2/30.03 = 2 … in
  fact 6.00") goes; part (d)'s question, which is garbled in the source, is
  reworded from its key.
- **"The attraction varies as 1/d"** (Ladder 10, free-response question 5).
  Lesson 1.5 gives the force as proportional to q₁q₂/r². The answers say
  that the attraction grows as the distance between the ions shrinks, with
  no formula.

### 4.5 The lessons' rules and terms

Where a source states a rule more loosely than the lesson that teaches it,
the practice states it as the lesson does:

- **Valence electrons from the group** (Ladder 10's opening): the last digit
  of the group number, for groups 1, 2 and 13 to 17 (lesson 1.8).
- **The order of filling** (Ladder 7's opening): the source lists it to be
  memorized. The list stays, with lesson 1.5's sentence that the periodic
  table is laid out in that order.
- **Why an s electron is held more tightly than a p electron of the same
  shell** (Worksheet 3, question 4(c); free-response question 2(c)): in
  lesson 1.5's words (it spends more of its time close to the nucleus,
  inside the shielding of the other electrons), not "penetrates".
- **Terms:** subshell (the sources' "sublevel"); amu; "first ionization
  energy" spelled out on first use in each answer; Coulomb's law named as
  the lessons name it.
- **What the sources already do as the lessons do**, and so stays: octet and
  "stability" answers are rejected by name (Ladder 9, the free-response
  rubrics); the drop from phosphorus to sulfur is explained by two electrons
  sharing one orbital; a cation loses its highest-shell electrons first.

### 4.6 Beyond the exam, and other units

- **Worksheet 2, question 5** (the three molecular peaks of Cl₂) carries
  `beyond`. The framework's one exclusion for topic 1.2 is the interpreting
  of peaks from anything but singly charged single atoms, and lesson 1.2
  says so in a "Beyond the exam" sentence.
- **Free-response question 3** finds a formula from the carbon dioxide and
  water a compound gives when burned. The framework does not name combustion
  analysis and no lesson teaches it, but nothing in it is outside topic 1.3
  once the question says where the atoms go. So the question's stem gains one
  sentence (all of the sample's carbon ends up in the CO₂ and all of its
  hydrogen in the H₂O), and the answer shows each step. It is **not**
  labeled "Beyond the exam". The pull request puts this to the teacher.
- **Lattice energy, charge and distance, and melting points** (Ladder 10,
  parts (c) and (d); free-response question 5(b)) are Unit 2's, taught in
  lesson 2.2, which is live. The parts stay, and each says in words that the
  idea is taken further in topic 2.2. Ladder 10's parts use the same pair
  as lesson 2.2's worked example (MgO and NaF, with their melting points);
  the practice is the teacher's own and is converted as it stands.
- **Separating a mixture** by dissolving, filtering and distilling (Ladder
  6; free-response question 4) is taught in lesson 3.9. The parts stay, with
  a pointer in words.
- **The two framework exclusions the free-response set's note names**
  (quantum numbers; the configurations of chromium and copper) become one
  sentence of its introduction, with the third (peaks from molecules).

### 4.7 Wording particular to Unit 1

- "No calculator on problems 1 to 4" (Worksheet 1) becomes advice: the
  numbers of the first four are chosen so that no calculator is needed.
- "Configurations from memory, no periodic-table peeking" (Worksheet 3)
  becomes: try each from the table's shape first, then check it against the
  table.
- "Answers without reasoning earn no credit" (Worksheet 2) becomes a
  sentence about what a free-response answer must contain.
- Worksheet 4's instructions on scoring boxes become: answer first, then
  open the scoring rubric and score yourself as a reader would.
- Worksheet 2, question 1(d) speaks of two columns that are not printed. It
  becomes two blanks: what is identical for the isotopes, and what differs.
- The ladders print their questions as 1 to 4 and key them as (a) to (d):
  on the site they are parts a to d, as in every unit's ladders.
- "Unit 1 is worth 7 to 9 percent of the AP exam" stays: it is true.

## 5. Code

One change, test-first: `Figure` is added to the blocks of
`src/pages/[unit]/practice/[name].astro`, with a browser test that
Worksheet 2's page shows the zirconium spectrum with its text alternative
and does not scroll sideways at 320 px. Two SVG figures are added to
`public/figures/`, drawn by a script kept in the session scratch folder, as
the lessons' figures are. The audit and the build check need no change.

## 6. Pull requests

Each is stacked on the one before and targets `main`; the first is stacked
on #57. **Each waits for the teacher's word.**

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | `Figure` on practice pages, the two spectra, and Worksheets 1 to 4 |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The six documents are built, pass the browser and accessibility tests, and
  wait in pull requests for the teacher, each pull request's "Build and
  test" check passing on GitHub.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked twice and every accepted finding
  fixed.
- Every molar mass agrees with the exam table's masses, and every value
  agrees with the lessons' data.
- No page scrolls sideways at 412, 390, 360 or 320 px with every answer
  open.
