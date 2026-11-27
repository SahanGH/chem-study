# ChemStudy: Unit 9 practice

Written on 2026-11-27. It follows the Unit 9 lessons design
(`2026-11-27-chemstudy-unit-9-lessons-design.md`) and adds to the main
design, `2026-11-12-chemstudy-redesign-design.md`, changing nothing in it.

The teacher asked for Unit 9 "the same as was done for Unit 6, end to end",
and said to merge everything. **Claude merges each pull request when its
"Build and test" check passes**, and lists its decisions for the teacher to
change afterward.

Most decisions below are ones the teacher already made for the practice of
Units 5, 2, 7, 3, 1, 4 and 6, applied to Unit 9. Unit 9's sources raise more
questions than Unit 6's did: two of their answers are wrong, they disagree
with one another in places, and they use words the Unit 9 lessons avoid.
Section 4 lists what Claude decided on each, for the teacher to change.

## 1. What is converted

| Order | Document | Source in `AP_Chem_Prep/Units/unit09-thermodynamics-electrochemistry/` | Topics |
|---|---|---|---|
| 1 | Skill ladders (12 ladders, 48 questions) | `u09-selfstudy.tex` | 9.1 to 9.11 |
| 2 | Worksheet 1: Entropy | `worksheets/u09-ws1.tex` | 9.1, 9.2, 9.3 |
| 3 | Worksheet 2: Gibbs free energy | `worksheets/u09-ws2.tex` | 9.3, 9.4 |
| 4 | Worksheet 3: Free energy, K and coupled reactions | `worksheets/u09-ws3.tex` | 9.5, 9.6, 9.7 |
| 5 | Worksheet 4: Cells and cell potential | `worksheets/u09-ws4.tex` | 9.8, 9.9, 9.10 |
| 6 | Worksheet 5: Nonstandard conditions, electrolysis, and a free-response question | `worksheets/u09-ws5.tex` | 9.8, 9.9, 9.10, 9.11 |
| 7 | Free-response set (5 questions, 32 points, 50 minutes) | `u09-frq.tex` | 9.3 to 9.11 |

The five worksheets hold 45 questions and 117 parts between them; one
question is scored (Worksheet 5's last, 10 points, six parts). Each document
lives in `src/content/practice/unit-9/` and is served at
`/unit-9-thermodynamics/practice/<name>/`. No source has a figure, no
question depends on one, and none is added.

## 2. What is not converted

- **The unit exam and everything in `exam/`**, and any file with "exam" or
  "test" in its name: never opened. A comprehensive test is written later,
  under its own design.
- **The unit map, the guided notes and the review sheet.**
- **The "Quick review" strip** that ends each worksheet.
- **The ladders' check-off table** ("Where you stand"). The advice under it
  is kept.
- **Notes to the teacher, to a grader or to a question writer**, among them
  the ladders' opening comment that they share nothing with the
  free-response set. (They share a good deal; section 4.8.)

## 3. How a document is made

As in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"), and as Unit 6's practice was made:

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it, beyond what this design and its plan name. Wording is recast
  for a student anywhere.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric".
- **The audit** (`scripts/practice-audit.mjs`) compares each document with
  its source. Each difference is fixed or recorded with its reason.
- **Two independent fact-checks** of each document by fresh agents that
  solve every question before reading its answer, recompute every number
  unrounded, check every sign, unit and state symbol, and apply each rule
  the page states to every example on it.
- **Corrections to the old chemistry are made on the site** and listed in
  each pull request. A correction to one of the teacher's numbers, and every
  carried value a display shows, is multiplied out by the controller, in a
  script, before it is written into a list. The plan holds each one.

**No key PDFs.** The built keys are not on the machine this session can
read, so a page is compared with its `.tex`, which holds every answer.

**No printed framework.** What is and is not on the exam rests on the
summary the lessons design was written from
(`scratchpad/ced/unit9-framework.md`), which was written from memory.

**Models.** Writers and fact-checkers on the strongest model (Fable). Fixers
that apply a decided list, and the review of the one code change, on Sonnet.
Inventories and searches on Haiku. Only the controller builds, commits,
opens pull requests and merges. No originality check of the pages: the
practice is the teacher's own material.

## 4. What the teacher decided, and Claude's calls

**The teacher decided:** convert the Unit 9 practice as Unit 6's was
converted; merge every pull request when its check passes; American English
everywhere (`CLAUDE.md`).

**Claude's calls**, each for the teacher to change. The numbers match the
twelve open questions of the research
(`scratchpad/unit9-practice/research.md`).

1. **Calculations with the Nernst equation are kept and marked "Beyond the
   exam".** The framework asks for the direction of the change only, and
   Worksheet 5's own subtitle says the equation is not required. Ladder 11's
   worked example and its part c, and part c of free-response question 2,
   carry the label. The 3 points of that part and its rubric line stay as
   the teacher wrote them, so the set is still out of 32.
2. **ΔG = ΔG° + RT ln Q is kept and marked "Beyond the exam"** (Worksheet 3,
   question 3, parts a to d; the equation in the answers of 3(e) and of
   question 4; part 5(d)). Where a ladder writes ΔG for ΔG° loosely, the
   symbol is corrected to ΔG°.
3. **The second law, with the entropy of the universe, is kept and marked
   "Beyond the exam"** (Worksheet 1, question 4, parts a and b). The third
   law is not named: question 5 keeps its content, which lesson 9.2 teaches,
   under the title "Entropy's true zero".
4. **"Oxidizing agent", "reducing agent" and the signs of the electrodes are
   kept as the teacher wrote them** (Worksheet 4, question 7 and part 1(d)).
   They carry no label. Worksheet 4's introduction says in one sentence that
   the exam tests neither the two names nor the signs.
5. **Nickel has one value throughout: −0.25 V.** Worksheet 4's strip has
   −0.23 V and the ladders −0.25 V; both are found in tables, and the
   lessons use no nickel. The site takes −0.25 V. One answer changes:
   Worksheet 4, 4(c), from +0.53 V to +0.51 V. Ladders 9(a) and 10(a)
   already use −0.25 V and keep +1.05 V and −203 kJ.
6. **The lessons' words.** "Favourable" becomes "thermodynamically favored"
   (then "favored"), never "favorable" and never "spontaneous", which no
   converted question is about. "Disorder" and "ordered" go, as in lesson
   9.1. Charge is $q$, not $Q$, since $Q$ is the reaction quotient. The other
   terms follow the lessons (section 4.3).
7. **Data a question needs and does not give are added to its stem**: the
   two equations of glucose and ATP (Worksheet 3, question 10), silver's
   molar mass (free-response 2(d)) and copper's (Ladder 12's worked
   example). Section 4.1 lists these and the smaller ones.
8. **Where a source's data differ from the lessons' values, the source's
   stay**, since each question states its own data: the whole-number
   standard entropies of Worksheet 1, and two sets of data each for calcium
   carbonate and for ammonia (section 4.1). Nickel is the one exception.
9. **Each page's `topics` are what it really tests** (section 1). The
   free-response set starts at 9.3: its first question gives ΔS° and asks
   for no sign and no standard entropy, though the source tags it 9.1 and
   9.2. Worksheet 1 gains 9.3 and Worksheet 4 gains 9.10, for a question
   each.
10. **Repeats between pages, and with the lessons' cell explorer, are kept
    and listed** (section 4.8).
11. **"jewellery" is added to the list in `scripts/us-spelling.mjs`**, with a
    row in its test, in the first pull request that holds a page (B).
12. **Each of the twenty scoring lines gets one definite wording**, written
    out in the plan (section 4.7). This departs from Unit 6, which kept such
    notes as the sources had them.

Also Claude's calls: every correction of sections 4.4 and 4.5.

### 4.1 Values a question uses

The lessons say that a question gives every value it needs. The sources give
theirs in a strip at the top of each sheet. On the site the strip becomes the
introduction's "Use these values": Worksheet 1's eleven standard entropies,
each formula with its state; Worksheet 4's eight standard reduction
potentials, written as reductions, highest first; Worksheet 5's three
potentials, three molar masses and the Faraday constant. Each introduction
says once that a ΔH° or ΔS° beside an equation is for the equation as
written, and Worksheets 1 and 2 and the ladders say that tables round a
little differently, so a question's own values are the ones to use.

**Added to a stem, because the question cannot be answered without it:**

| Where | Added |
|---|---|
| Worksheet 3, question 10 | The two equations: glucose + phosphate → glucose 6-phosphate + H₂O, and ATP + H₂O → ADP + phosphate. Part b asks for the substance the two share, which nobody can find from the reactions' names |
| Free-response 2(d) | Silver's molar mass, 107.87 g/mol (in the introduction's list and in the stem) |
| Ladder 12, worked example | Copper's molar mass, 63.55 g/mol |

**Added so that a question reads on its own:** the equation
N₂(g) + 3H₂(g) → 2NH₃(g) where a source says "the Haber process" or "the
ammonia synthesis" (Worksheet 1, question 7; Worksheet 2, question 3; Ladder
3's worked example); the reaction and data of question 2 in Worksheet 2,
question 5; the cell meant in Ladder 10(a) (the nickel and silver cell of
Ladder 9) and in Ladder 10's worked example; the equation of the zinc and
copper cell, and 25 °C, in Ladder 11's worked example; the two reduction
potentials in the stem of free-response question 2; and, once in Worksheet
2's introduction and in Ladder 4's worked example, that ΔH° and ΔS° are
taken as the same at every temperature.

**The sources' values stay** where they differ from the lessons' or from one
another, and the plan lists each so that a fact-checker does not "correct"
it:

| Quantity | Where, and the value kept | Elsewhere |
|---|---|---|
| S° of H₂, O₂, N₂, H₂O(l), H₂O(g), NH₃, CO₂ | Worksheet 1: 131, 205, 192, 70, 189, 193, 214 J/(mol·K) | The lessons: 130.7, 205.2, 191.6, 70.0, 188.8, 192.8, 213.8. Ladder 2: O₂ 205.0, CO₂ 213.7 |
| ΔG°f of H₂O(l) | Worksheet 2: −237 kJ/mol | The lessons: −237.1 |
| N₂ + 3H₂ → 2NH₃ | Worksheet 2: −92 kJ and −199 J/K (−33 kJ; zero at 462 K). Ladder 3: −92.2 and −198.7 (−33.0 kJ) | No lesson uses the reaction |
| CaCO₃ → CaO + CO₂ | Worksheet 2: +178.5 kJ and +161 J/K (+131 kJ; zero at 1,109 K). Ladder 4: +178.3 and +160.6 (+130 kJ; 1,110 K) | No lesson uses the reaction |
| H₂O(l) → H₂O(g) | Worksheet 2: +44 kJ and +119 J/K, the values at 25 °C | Unit 6's practice: 40.7 kJ/mol, the value at 100 °C. Both are right |

### 4.2 Outside Unit 9's framework

A label goes on the smallest piece that is outside the exam, so that the
parts the lessons do teach are not labeled with it.

- **Nernst calculations** (call 1). Ladder 11 is retitled "Cell potential
  away from standard conditions". Its formula, E = E° − (0.0592/n) log Q at
  25 °C, stays, with a sentence that the equation sheet prints the same
  thing as (RT/nF) ln Q. Parts a, b and d, which ask for a direction and a
  reason, are unlabeled.
- **ΔG without the circle** (call 2). Worksheet 3, question 3: parts a to d
  are labeled. Part e ("at equilibrium ΔG° = 0": correct the student) is
  what lesson 9.5 teaches, so it is unlabeled: its answer gives the lesson's
  reason through K first and then the source's, in a sentence that begins
  "Beyond the exam". Question 4 (a positive ΔG° "can never proceed") is
  answered the same way: first through K, which for +20 kJ at 298 K is
  3.1 × 10⁻⁴, small and not zero; then the source's reason with RT ln Q as
  the labeled sentence. Part 5(d) is labeled.
- **The second law** (call 3). Worksheet 1, 4(a) and 4(b) are labeled. The
  answer of 4(b) also gives the reason the exam accepts: freezing has
  ΔH° < 0 and ΔS° < 0, so it is favored at low temperature, below 0 °C.
  Part 4(c) is unlabeled and is answered with ΔG° = ΔH° − TΔS°, not with
  "see part b".
- **"State function"** (Ladder 8(d)). As in Unit 6: the answer gives the
  lessons' reason (ΔG° values add when equations add, as ΔH° values do in
  topic 6.9) and names "state function" in one "Beyond the exam" sentence.
- **Electrode signs.** The scope notes of the ladders and the free-response
  set become one sentence of each introduction: which electrode is positive
  and which is negative is not on the AP exam, and nothing here asks for it.
  Ladder 9(d)'s bracket says the same.
- **In scope, and unlabeled:** the concentration cell; glucose and ATP;
  why ammonia is made at 700 K and why aluminum smelters use so much
  electricity (reasoning from topics 9.3, 9.4 and 9.11).

### 4.3 The lessons' terms and rules

- **Favored.** "Thermodynamically favored" at first use in an answer, then
  "favored"; "unfavored" or "not favored". For a term of the equation, "works
  for" and "works against". No "favorable", no "spontaneous".
- **Entropy as dispersal.** No "disorder", "disordered" or "ordered": ions
  "leave fixed places in the crystal and spread through the solution".
- **$q$ for charge**; "moles of electrons" and "mol Cu" in words, not n(e⁻)
  and n(Cu), since $n$ is the electrons of −nFE°.
- **No coined name for the temperature at which ΔG° = 0.** "Crossover
  temperature" becomes "the temperature at which ΔG° changes sign".
- **No "driving force" as a quantity, and no "dead" cell.** A potential says
  how far the cell is from equilibrium; a cell that has stopped has "run
  down".
- **A potential is never multiplied**, because it is energy per unit of
  charge (1 V = 1 J/C). The word "intensive" goes; the reason stays.
- **"Under kinetic control"** for "kinetically stable" and "kinetically
  blocked".
- **The higher reduction potential is the reduction** in a galvanic cell,
  for "the more positive potential is reduced" and "preferentially reduced".
- **ΔG° with its circle** wherever a standard value is meant (Ladders 3, 4,
  5, 7 and 10; free-response 3 and 4). ΔS° sums carry their coefficients
  (Ladder 2's formula has none).
- **Named things get a description**: "the Daniell cell" is "the zinc and
  copper cell of question 3"; "the Haber process" is the equation.
- **State symbols.** Every equation carries a state symbol on every species.
  Twelve in the sources have none; each one added is reported. Graphite is
  C(s, graphite).
- **Thousands carry a comma, and "size" stands for "magnitude"**, from the
  first draft.

### 4.4 Answers and displays corrected

**Two answers in the sources are wrong.** Each was recomputed by the
research's script and again for this design.

| Where | Source | Site | Why |
|---|---|---|---|
| Worksheet 5, question 5 (silver from 2.00 A for 30.0 min) | 4.03 g | **4.02 g** | 3,600 C ÷ 96,485 C/mol = 0.03731 mol; × 107.87 g/mol = 4.0246 g. The source's own step, 0.0373 × 107.87, is 4.0236. No route gives 4.03 |
| Ladder 6(a) (K for ΔG° = +15.0 kJ/mol at 298 K) | 2.4 × 10⁻³ | **2.3 × 10⁻³** | ln K = −6.054; e^−6.054 = 2.348 × 10⁻³ |

**One answer changes with nickel's value** (call 5): Worksheet 4, 4(c),
+0.53 V becomes **+0.51 V**.

**Four displays print steps that do not give the printed result, and one
shows a value wrong in its last place.** No final answer changes:

| Where | Source | Site |
|---|---|---|
| Worksheet 2, 2(b) | 178.5 − 48.0 = +131 kJ (that difference is 130.5) | 178.5 − 47.98 = 130.52, given as +131 kJ |
| Worksheet 5, question 7 | (0.157)(96,485) = 15,183 C (that product is 15,148) | 0.07868 mol Cu; 0.15736 mol of electrons; 15,183 C; 7,591.5 s; 2.11 h |
| Ladder 10, worked example | −1.5 × 10⁵ J = −151 kJ | −150,517 J = −151 kJ |
| Ladder 12, worked example | 0.0933 mol, then 0.09328 on the next line | 0.09328 mol on both |
| Ladder 6, worked example | ln K = 8.073 | ln K = 8.072; K is still 3.2 × 10³ |

### 4.5 Statements changed

Each is listed in its pull request for the teacher to accept or reverse. The
plan gives the wording.

- **"E° = 0: the cell is dead"** (Worksheet 4, 9(b)). A cell stops at E = 0,
  whatever its E°; the ladders say so in bold, and a concentration cell has
  E° = 0 and runs. The answer: with E° = 0 the cell gives no voltage when
  every concentration is 1 M.
- **"E° < 0: the cell is electrolytic"** (9(c)): it runs only if driven from
  outside.
- **A "dead" battery is at equilibrium** (9(d); Ladder 11): said of a cell
  that has run down completely.
- **"Rounding in the table"** as the reason 44/0.119 gives 370 K and not
  373 K (Worksheet 2, question 4). Unrounded values still give 370 K. The
  gap comes from using the 25 °C values of ΔH° and ΔS° at 100 °C.
- **"ΔG = 0 … and K = 1"** (Ladder 3(d)), which joins two different
  statements. With the ladder's symbol corrected to ΔG°, the answer is
  K = 1, and it adds that this is not the same as being at equilibrium.
- **"The same charge"** (Worksheet 5, question 6): 5,400 C against question
  5's 3,600 C. The words go.
- **The entropy of dissolving "positive", "almost always"** (Ladder 7 and
  7(a)). Lesson 9.6 shows that water held around small or highly charged
  ions loses entropy and that the total can be negative (magnesium sulfate,
  −209.6 J/(mol·K)). **The ladder follows the lesson**: "usually positive,
  not always".
- **Why ammonium nitrate is less soluble in cold water** (Ladder 7(d)). The
  source argues from the TΔS term alone and ends "eventually positive". The
  answer gives topic 7.9's reason first, which holds for any salt (the
  dissolving is endothermic, so K falls as the temperature falls), then
  lesson 9.6's for this case (ΔH° and ΔS° both positive, so cooling weakens
  the term that works for dissolving). "Eventually positive" goes.
- **"A few J/K either way"** for H₂ + Cl₂ → 2HCl (Worksheet 1, question 3
  and 2(e); Ladder 1(d)): the value is about +20 J/K. "Small beside the
  others, about +20 J/K."
- **"Every calculated sign matches"** (Worksheet 1, question 8), where only
  one reaction is in both of the questions it compares. The question now
  asks for a prediction for each of question 6's five reactions; all five
  agree.
- **"No-calculator multiple-choice questions"** (the same answer): a
  calculator is allowed on the whole exam. "A question can ask for the sign
  and give no data."
- **"Ag⁺ oxidizes all"** the metals of the table (Worksheet 4, 7(c)): all
  six others; the table lists silver too.
- **"Copper is preferentially reduced"** (Worksheet 4, 3(a)): the ion Cu²⁺
  is.
- **"A large rise in disorder"** for sodium chloride (free-response 4(a)):
  the entropy change is modest and is enough because ΔH° is near zero.
- **Phosphate as the shared substance** (Worksheet 3, 10(b)) is true of the
  two equations; the answer adds lesson 9.7's point that in the cell the
  group passes straight from ATP to glucose.
- **Aluminum at −1.66 V** (Worksheet 5, question 8) is the value in water,
  and a smelter works in a melt. The answer leads with the three moles of
  electrons for each 26.98 g and says so.
- **Ammonia at 700 K** (Worksheet 2, 3(d)) gains a clause: K below 1 means
  less product, not none.
- Smaller: "the disorder was already there in the O₂" (Ladder 2); "zero only
  at 0 K" gains "for a perfect crystal"; "metal extraction" gains "of many
  metals"; "chemistry that thermodynamics would otherwise forbid" becomes
  "reactions that are unfavored on their own" (Ladder 8); "the three
  contributions" after a question that names four (Worksheet 3, question 8).

### 4.6 Numbers

A script (`scratchpad/unit9-practice/recompute.py`, 117 values) and a second
one written for this design (`carried.py`) agree. Apart from section 4.4, no
answer changes, and the three molar masses stated (Ag 107.87, Cu 63.55, Al
26.98) are the exam table's. With F = 96,500 no printed answer changes. One
value is an exact tie: Worksheet 5, question 7's 15,183 C ÷ 2.00 A =
7,591.5 s. It is printed as 7,591.5 s (a whole number would be 7,591 or
7,592; the unrounded time is 7,591.3 s), and the answer, 2.11 h, is the same
either way.

Left as the sources have them and listed for the teacher: ΔS° values written
"+150", "+100", "−50" and "+80" with no decimal point and used to two or
three figures; a two-figure potential carried to a three-figure ΔG° in
Ladder 10's example (−151 kJ, which is also the lessons' rule of rounding to
the kilojoule); and "about +20 J/K" for HCl, which rests on standard
entropies written from memory (Cl₂ 223.1, HCl 186.9).

### 4.7 Scoring lines

The twenty scoring lines (six for Worksheet 5's question, fourteen in the
free-response set) are each written with one meaning: what earns each point,
whether a value carried from an earlier part earns the next, and which point
survives a cap. No point value changes. The plan gives all twenty. Three
follow from calls above: free-response 2(c) accepts either form of the
Nernst equation; 4(a) asks for ions leaving fixed places and spreading out,
not for "ordered"; 3(b) accepts a catalyst as well as a high temperature,
since the question asks what would have to change.

### 4.8 Repeats, kept

- **With the lessons' cell explorer:** copper with silver ion (+0.46 V,
  −89 kJ) is free-response 2(a) and 2(b) and Worksheet 4, questions 5 and
  8(b), and the explorer of lessons 9.9 and 9.10 can build it. The copper
  concentration cell of Worksheet 5, question 3 can be built there too.
- **Between pages:** silver plated with 1,800 C for 2.01 g twice (Ladder
  12(c); free-response 2(d)), and with twice that charge in Worksheet 5,
  question 5; zinc with silver ion in Worksheet 4, 4(a) and again as
  Worksheet 5's scored question; iron with copper in Worksheet 4, 4(d) and
  Ladders 9 and 10; zinc with copper four times; calcium carbonate and
  ammonia with two sets of data each; diamond three times (Worksheet 2,
  7(b); Ladder 5(c); free-response 3); "if a salt is insoluble although its
  entropy change is positive" twice (Ladder 7(c); free-response 4(b)); a
  coupled pair summed four times; the four combinations of signs three
  times.
- **With pages already on the site:** the diamond question and the sentence
  about fuel waiting in a tank are in the Unit 5 skill ladders
  (`unit-5/skill-ladders.mdx`, lines 1058 to 1064).

### 4.9 Wording particular to Unit 9

- Worksheet subtitles go. Worksheet 5's "no Nernst equation required"
  becomes a sentence of its introduction.
- "The CED" inside a question becomes "the AP exam" or "topic 9.7's".
- Worksheet 5's "FRQ (10 points)" becomes a sentence about the AP exam's
  long free-response questions.
- British usage is recast: jewelry, aluminum, gasoline vapor, labeling,
  behaviors, points for "marks", "7% to 9%", a comma in 10,000.
- The ladders print their questions as 1 to 4 and key them (a) to (d): on
  the site they are parts a to d.

## 5. Code

One word. `scripts/us-spelling.mjs` gains "jewellery" in its word list, and
`tests/unit/us-spelling.test.ts` gains it in a row. Nothing else: the
practice route, the audit and the browser tests already cover every unit
that has practice.

## 6. Pull requests

Each targets `main` and is merged by Claude when its check passes.

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Worksheets 1 to 5, and the spelling word |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The seven documents are built, pass the browser and accessibility tests,
  and are merged, each pull request's "Build and test" check passing on
  GitHub, and the deploy run succeeds.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked twice and every accepted finding
  fixed.
- Every equation carries its state symbols.
- "favorable", "spontaneous", "disorder", "crossover", "driving force" and
  "dead" occur nowhere under `src/content/practice/unit-9`.
- No page scrolls sideways, and no equation scrolls in its box, at 412, 390,
  360 or 320 px with every answer open.
