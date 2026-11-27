# ChemStudy: Unit 6 practice

Written on 2026-11-27. It follows the Unit 6 lessons design
(`2026-11-27-chemstudy-unit-6-lessons-design.md`) and adds to the main
design, `2026-11-12-chemstudy-redesign-design.md`, changing nothing in it.

The teacher asked for it on 2026-11-27 ("Start Unit 6 practice, merge
everything"). **Claude merges each pull request when its "Build and test"
check passes**, and lists its decisions for the teacher to change afterward.

Every decision below is one the teacher already made for the practice of
Units 5, 2, 7, 3, 1 and 4, applied to Unit 6. What is new is in section 4,
and those are Claude's calls.

## 1. What is converted

| Order | Document | Source in `AP_Chem_Prep/Units/unit06-thermochemistry/` | Topics |
|---|---|---|---|
| 1 | Skill ladders (10 ladders, 40 questions) | `u06-selfstudy.tex` | 6.1 to 6.9 |
| 2 | Worksheet 1: Signs, energy diagrams and heat transfer | `worksheets/u06-ws1.tex` | 6.1, 6.2, 6.3, 6.4 |
| 3 | Worksheet 2: Calorimetry and phase changes | `worksheets/u06-ws2.tex` | 6.4, 6.5, 6.6 |
| 4 | Worksheet 3: Enthalpy of reaction and Hess's law | `worksheets/u06-ws3.tex` | 6.6, 6.8, 6.9 |
| 5 | Worksheet 4: Bond and formation enthalpies, and a long free-response question | `worksheets/u06-ws4.tex` | 6.4, 6.6, 6.7, 6.8 |
| 6 | Free-response set (5 questions, 32 points, 50 minutes) | `u06-frq.tex` | 6.1 to 6.5, 6.7 to 6.9 |

The four worksheets hold 28 questions between them; one is scored
(Worksheet 4's last, 10 points). Each document lives in
`src/content/practice/unit-6/` and is served at
`/unit-6-thermochemistry/practice/<name>/`. A document's topics list names
only what it tests; the fact-check settles each list, and each question's
topic is the lesson that teaches it. No source has a figure, and none is
added.

## 2. What is not converted

- **The unit exam** and **the old comprehensive test** (`exam/`): never
  opened. A new comprehensive test is written later.
- **The unit map, the guided notes and the review sheet.**
- **The "Quick review" strip** that ends each worksheet.
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept.
- **Notes to the teacher, to a grader or to a question writer.**

## 3. How a document is made

As in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"), and as Unit 4's practice was made:

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it, beyond what this design names. Wording is recast for a
  student anywhere.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric".
- **The audit** (`scripts/practice-audit.mjs`) compares each document with
  its source. Each difference is fixed or recorded with its reason.
- **Two independent fact-checks** of each document by fresh agents that
  solve every question before reading its answer, recompute every number
  unrounded, check every sign, unit and state symbol, and apply each rule
  the page states to every example on it.
- **Corrections to the old chemistry are made on the site** and listed in
  each pull request. A correction to one of the teacher's numbers is
  recomputed by the controller, in a script, before it is written into a
  list.
- **Scoring notes that a grader could read two ways** are kept as the source
  has them and listed in the pull request.

**No key PDFs.** The built keys are not in the repository this session can
read, so a page is compared with its `.tex`, which holds every answer.

**Models.** Writers and fact-checkers on Fable; fixers that apply a decided
list on Sonnet. No originality check: the practice is the teacher's own
material.

## 4. New for Unit 6

### 4.1 Values a question uses

The lessons say that a question gives the values it wants used (water's
specific heat capacity, molar enthalpies, bond enthalpies, enthalpies of
formation). The sources give them in a strip at the top of each sheet. On
the site the strip becomes the introduction's list, "Use these values", and
these gaps are filled:

- **Worksheet 4** gains water's 4.18 J/(g·°C), which question 8 needs.
- **Ladder 5's worked example** says in its stem that the solution's density
  is taken as 1.00 g/mL and its specific heat capacity as 4.18 J/(g·°C).
- **Ladder 4(d)** repeats copper's 0.385 J/(g·°C).
- **Ladder 9(b)** asks whether ozone's enthalpy of formation is zero, and no
  longer asks for a value the question never gives. The answer keeps the
  source's "about +143 kJ/mol".
- **Worksheet 3, question 5** says that it is about question 4.
- **Worksheet 2, question 2** says that the limiting reactant's coefficient
  is 1 and that the solution's mass is taken as 100.0 g.

**The sources' values stay**, though some differ from the lessons' tables:
five bond enthalpies in Worksheet 4 (H–H 432, Cl–Cl 239, H–Cl 427, O–H 467,
C=O 799 in CO₂; lesson 6.7 has 436, 243, 431, 463 and 745) and two
enthalpies of formation (water −286 and −242; lesson 6.8 has −285.8 and
−241.8). With the lessons' values Worksheet 4's question 3 would be −700 kJ
and not −824 kJ, and questions 5 and 8 are built on the sources' answers.
Worksheet 4's introduction says that every table rounds a little
differently and that a question's own values are the ones to use.

### 4.2 Phase changes by the gram

The ladders and the free-response set give water's enthalpies of fusion and
vaporization per gram (334 and 2,260 J/g); Worksheet 2 and lesson 6.5 work
in moles (6.02 and 40.7 kJ/mol). The two sets agree, and both stay: a
question may give either. Where a document uses the per-gram values, its
introduction says that they are the molar values divided by water's molar
mass. The free-response rubric line that asks for "mass only" accepts either
route (grams times a per-gram value, or moles times a molar value) with no
ΔT.

### 4.3 Outside Unit 6's framework

- **"State function."** Worksheet 3, question 3 asks for the property that
  makes Hess's law valid. Lesson 6.9 gives the reason as the conservation of
  energy and names "state function" only in a "Beyond the exam" sentence. The
  question becomes two parts: (a) state the law and say why it holds; (b)
  name the property, with `beyond`.
- **Entropy.** Worksheet 1, 5(c) asks whether a spontaneous endothermic
  change contradicts anything. It is Unit 9's material, not outside the
  exam, so it carries no label. The answer says what lesson 6.1 says (energy
  is not the only thing that decides whether a change happens) and that the
  other factor, entropy, is Unit 9's.
- **Activation energy and catalysts** (Worksheet 1, 3(c) and 3(d); Ladder
  2) are Unit 5's. They stay under topic 6.2, and the picture with a hill is
  called an energy profile, as lesson 6.2 calls it, with a clause that the
  hill is topic 5.6's.
- **A fuel burned in a calorimeter** (Worksheet 4, question 8) is a bomb
  calorimeter in all but name, which lesson 6.4 marks "Beyond the exam". The
  question never names it and its arithmetic is the coffee cup's. The stem
  gains one sentence: the energy the water gains is taken as equal in size to
  the enthalpy change of the reaction.
- **The scope notes** of the ladders and the free-response set become one
  sentence: the difference between enthalpy and the energy of the system is
  not on the AP exam, and nothing here asks for it.

### 4.4 The lessons' terms and rules

- "Specific heat capacity" for "specific heat"; "standard enthalpy of
  formation" for "formation enthalpy"; C(s, graphite) for C(gr) and C(s).
- **Kinetic energy, not speed.** Hot particles have more average kinetic
  energy and need not be faster (lesson 6.3). Worksheet 1, 4(b), Worksheet
  2, 1(c), and Ladders 4 and 6 are reworded.
- **Heat is not held.** "The energy released" for "the heat released" where
  a source has heat sitting somewhere; "energy" for "internal energy".
- **Signs.** An amount released is a size with no minus sign in words, and
  $q$ carries the sign (Worksheet 2, 1(b): 15.7 kJ released, $q = -15.7$
  kJ). ΔT is final minus initial everywhere (free-response 1(c) shows −73.4
  °C; its rubric still names the fall of 73.4 °C).
- **ΔH beside an equation** stays in kJ as the sources have it; each
  document's introduction says it is read as "for the equation as written",
  which is lesson 6.6's kJ/mol of reaction.
- **"Broken minus formed"** (Worksheet 4, 1(c)) gives lesson 6.7's reason: a
  bond enthalpy is the energy to take something apart.
- **State symbols.** Every thermochemical equation on a page carries a state
  symbol on every species, as the lessons' do. Eight in the sources do not;
  each one added is reported.

### 4.5 Statements changed

Each is listed in its pull request for the teacher to accept or reverse.

- **"ΔH is an intensive property of the reaction"** (Worksheet 2, 2(d);
  Ladder 5(b)). ΔH for an equation doubles when the equation is doubled, as
  Worksheet 3 shows. The answers say what lesson 6.6 says: the energy per
  mole of reaction does not depend on how much was run.
- **"Averages" as the reason for the gap in H₂ + Cl₂** (Ladder 8's worked
  example). Each of its three bonds exists in one molecule only, so none is
  an average (lesson 6.7). The example says so, and the general statement
  about averages stays in 8(c).
- **"Averages" for NO** (free-response 2(d), with a rubric point). N≡N and
  O=O are exact for their molecules; the value given for the bond in NO is
  the one that does not fit. The answer says that, the stem's "N=O" becomes
  "the bond in NO", and the rubric point is given for saying that a table
  value is an average or does not fit this molecule, so the result is an
  estimate.
- **Photosynthesis** (Worksheet 1, 1(e)) is endothermic, but its energy
  comes in as light and not as heat. The answer says so.
- **"Break the hydrogen bonds"** for melting ice (Ladder 1(d)) becomes
  "overcome some of the hydrogen bonds", as Worksheet 2 and lesson 6.5 have
  it.
- **"About 14 times"** (Worksheet 2, 3(c)) is 14.5: "more than 14 times".
- **"Three routes"** (Ladder 10) lists four: "four".
- **"About 50 °C"** for two identical blocks (Worksheet 1, question 6) says
  its condition (the same mass and the same substance), since lesson 6.3
  lists "halfway" as a trap.

### 4.6 Numbers

A script (`scratchpad/unit6-practice/recompute.py`) finds no final answer
that changes, and no molar mass that differs from the exam table. Five
displays print steps that do not give the printed answer, and three values
are exact ties. Each answer shows the carried, unrounded value so that the
printed result follows:

| Where | Printed | Shown on the site |
|---|---|---|
| Worksheet 2, 2(c) | −2174/0.0250 = −86.9 kJ/mol | 2,173.6 J carried |
| Worksheet 2, 4(c) | n = 4.99 mol, 30.1 kJ | 4.994 mol carried |
| Worksheet 2, 6(c) | n = 1.39 mol; 8.35 and 56.47 kJ; 76.3 kJ | 1.387 mol carried |
| Worksheet 4, 8(c) | −35.6/0.0400 = −891 kJ/mol | 35.63 kJ carried |
| Ladder 6, worked example | 13.4 + 16.7 + 90.4 = 120 kJ | 120.5, given as 120 kJ |
| Worksheet 3, 1(b) | 445.3 kJ | 445.25 kJ, a tie; either neighbor |
| Worksheet 4, 8(b) | 35,635 J | 35,634.5 J; 35.6 kJ |
| Worksheet 2, 6(c), first step | 522 J | 522.5 J; 0.52 kJ |

Left as the sources have them and listed for the teacher: a temperature
change of two figures carried to three or four (Worksheet 2, question 3;
free-response 1(b); Ladder 5's example), and Ladder 5's invented
neutralization, which gives −60.2 kJ/mol where the measured value is nearer
−57.

### 4.7 Wording particular to Unit 6

- "Sketch, in words" (Worksheet 1, 3(d)) stays a description in words.
- Worksheet 4's "FRQ (10 points)" becomes a sentence about the AP exam's
  long free-response questions.
- "(Unit 9 makes this precise.)" becomes "Unit 9 takes that up."
- British usage is recast: favorable, canceling, points, backward, "the most
  common error", "on the exam".
- The ladders print their questions as 1 to 4 and key them as (a) to (d): on
  the site they are parts a to d.

## 5. Code

None. The practice route, the audit and the browser tests already cover
every unit that has practice.

## 6. Pull requests

Each targets `main` and is merged by Claude when its check passes.

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Worksheets 1 to 4 |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The six documents are built, pass the browser and accessibility tests,
  and are merged, each pull request's "Build and test" check passing on
  GitHub, and the deploy run succeeds.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked twice and every accepted finding
  fixed.
- Every thermochemical equation carries its state symbols.
- No page scrolls sideways, and no equation scrolls in its box, at 412, 390,
  360 or 320 px with every answer open.
