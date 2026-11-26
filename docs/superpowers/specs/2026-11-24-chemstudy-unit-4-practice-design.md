# ChemStudy: Unit 4 practice

Written on 2026-11-24. It follows the Unit 4 lessons design
(`2026-11-16-chemstudy-unit-4-lessons-design.md`) and adds to the main
design, `2026-11-12-chemstudy-redesign-design.md`, changing nothing in it.

The teacher asked for Unit 4 "end-to-end" (2026-11-16): lessons, then the
practice, then a comprehensive test. The lessons wait in pull requests #54,
#56 and #59. This is the practice. **Nothing here is merged without the
teacher's word.**

Every decision below is one the teacher already made for the practice of
Units 5, 2, 7 and 3, applied to Unit 4, or one made for Unit 1's practice
(pull request #58) a week earlier. What is new is in section 4.

## 1. What is converted

| Order | Document | Source in `D:\AP_Chem_Prep\Units\unit04-chemical-reactions\` | Topics |
|---|---|---|---|
| 1 | Skill ladders (12 ladders, 48 questions) | `u04-selfstudy.tex` | 4.2 to 4.9 |
| 2 | Worksheet 1: Change, evidence and particle drawings | `worksheets\u04-ws1.tex` | 4.1, 4.3, 4.4 |
| 3 | Worksheet 2: Kinds of reaction and net ionic equations | `worksheets\u04-ws2.tex` | 4.2, 4.7, 4.8 |
| 4 | Worksheet 3: Oxidation numbers, stoichiometry and titration | `worksheets\u04-ws3.tex` | 4.5, 4.6, 4.7 |
| 5 | Worksheet 4: A long free-response question, and redox practice | `worksheets\u04-ws4.tex` | 4.2, 4.3, 4.5, 4.7 |
| 6 | Free-response set (5 questions, 32 points, 50 minutes) | `u04-frq.tex` | 4.1 to 4.9 |

The four worksheets hold 21 questions between them; one is scored
(Worksheet 4's first, 10 points). Each document lives in
`src/content/practice/unit-4/` and is served at
`/unit-4-chemical-reactions/practice/<name>/`. A document's topics list
names only what it tests; the fact-check settles each list, and each
question's topic is the lesson that teaches it (the sources tag questions on
oxidation numbers 4.9; lesson 4.7 teaches them).

## 2. What is not converted

- **The unit exam** (`exam\u04-exam.tex`) stays a closed test, and **the old
  comprehensive test** (`exam\u04-test-full.tex`) is not converted: part of
  it is reworded from a textbook, and a new one is written later.
- **The unit map, the guided notes and the review sheet.**
- **The "Quick review" strip** that ends each worksheet.
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept.
- **Notes to the teacher or to a question writer.**

## 3. How a document is made

Exactly as in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"), and as Unit 1's practice was made:

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it, beyond what this design names. Wording is recast for a
  student anywhere.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric".
- **The audit** (`scripts/practice-audit.mjs`) compares each document with
  its source. Each difference is fixed or recorded with its reason.
- **Two independent fact-checks** of each document by fresh agents that
  solve every question before reading its answer, balance every equation in
  atoms and in charge, recompute every number from the exam table's masses,
  apply each rule the page states to every example on it, and compare the
  page with its key PDF.
- **Corrections to the old chemistry are made on the site** and listed in
  each pull request for the teacher to accept or reverse. **A correction to
  one of the teacher's numbers is recomputed by the controller, in a script,
  before it is written into a list**: two such corrections proposed for Unit
  1's practice were themselves wrong.
- **Scoring notes that a grader could read two ways** are kept as the source
  has them and listed in the pull request for the teacher.

**Models.** Writers and fact-checkers on Fable 5.2; fixers that apply a
decided list on Sonnet. No originality check: the practice is the teacher's
own material.

## 4. New for Unit 4

### 4.1 What a question must supply

The lessons, following the framework, expect one solubility rule from memory
(sodium, potassium, ammonium and nitrate salts are soluble) and say that a
question gives any other solubility, and says whether an acid or a base is
strong or weak. The sources assume more. So each of these stems gains the
fact it needs, in words:

- **A solubility:** Worksheet 2, 3(a) (zinc sulfide), 5(a) (silver chromate)
  and 5(b) (magnesium chloride is soluble); Ladder 9's worked example and
  part (a) (silver chloride, lead(II) iodide).
- **The strength of an acid or a base:** Worksheet 2, 3(b) to 3(d) and
  question 4 (hydrobromic acid is strong; acetic acid and ammonia are weak);
  Ladders 9(c) and 10; free-response question 4.

Worksheet 2, 6(b) asks the student to name the strong acids from memory.
Lesson 4.2 lists them, so it stays.

### 4.2 Excluded by the framework

- **"Oxidizing agent" and "reducing agent."** The framework says the meaning
  of the two terms is not assessed, and lesson 4.7 names them once, in a
  "Beyond the exam" sentence. Three places ask for them: Worksheet 3,
  question 2 (where "both agents" is one of several things asked) and
  question 3 (the whole question); Worksheet 4, 2(c). By the teacher's rule
  for material outside the framework (2026-11-13), they stay and carry
  `beyond`. Each says what the two words mean where it first uses them.
  Worksheet 3, question 2's request for the agents becomes a part of its
  own, so that only that part carries the label.
- **Lewis acids and bases** appear only in the sources' scope notes, and
  nothing asks for them. The free-response set's scope note becomes one
  sentence naming all three exclusions.

Not excluded and not labeled, because lessons teach them: percent yield
(Ladder 6; lesson 4.5 says the framework does not name it) and balancing a
redox equation in acidic solution (Ladder 12, free-response 2(b); lesson 4.9
calls it less common on the exam). Nothing in the sources is balanced in
basic solution.

- **An Arrhenius base** (Worksheet 2, 6(a): is ammonia an Arrhenius base, a
  Brønsted–Lowry base?) is in no lesson and is not named by the framework's
  Unit 4. The part stays, says in a clause what the older definition is (a
  base is a substance that gives hydroxide ions in water), and carries
  `beyond`.

### 4.3 Is dissolving a salt physical or chemical?

The framework leaves it open, and so does lesson 4.4: the change can be
argued either way, by whether bonds are broken or formed. Three places in the
sources settle it as physical: Worksheet 1, question 2; Ladder 3's worked
example; free-response question 3. On the site:

- each answer gives the argument for each side, as lesson 4.4 does, and says
  that either classification is accepted with its reason;
- free-response 3(a)'s rubric gives the point for either classification of
  dissolving, with a reason from bonds or attractions; 3(b), which asks for
  the strongest argument that it is physical, stays as it is, since it asks
  for an argument and not a ruling.

The pull request lists this for the teacher.

### 4.4 The lessons' rules and terms

Where a source states a rule differently from the lesson that teaches it,
the practice states it as the lesson does:

- **What is written whole in an ionic equation** (Ladder 2): lesson 4.2's
  table. The word "electrolyte" is in no lesson: "a dissolved ionic compound,
  a strong acid or a strong base is written as ions; everything else is
  written whole". "Molecular equation" for the sources' "formula equation".
- **"Any strong acid with any strong base gives the same net ionic
  equation"** (Ladder 2(d)) gains lesson 4.2's condition: when the salt they
  leave is soluble.
- **The three kinds of reaction** (Ladder 9; Worksheet 2, question 1): a
  reaction can be more than one kind, and it can be none (lesson 4.7).
  Ladder 9(d)'s "no element is oxidized in a precipitation" becomes a
  statement about the reactions in hand.
- **Oxidation numbers** (Ladder 11; Worksheet 3): lesson 4.7's six rules, in
  its order (the sum third, fluorine fourth), and "oxidation number" for
  "oxidation state". The species named as oxidized or reduced is the
  reactant that holds the atom.
- **Balancing in acidic solution** (Ladder 12, free-response 2(b)): the
  sources balance by counting electrons from oxidation numbers and never
  write a half-reaction. The answers keep the sources' equations and results
  and show the two half-reactions, in the order of lesson 4.9's steps. A
  rubric line still gives its points for a correctly balanced equation
  reached either way.
- **Equivalence point and endpoint** (Ladder 8, free-response questions 2
  and 4): the sources use the two words for one thing, which lesson 4.6
  lists as a trap. A calculation uses the volume at the equivalence point; a
  stem that says the indicator changed at a volume says that the endpoint
  is taken as the equivalence point.
- **Terms:** "an acid with two protons to give" for "diprotic"; "the volume
  of titrant" for "titre"; "surrounded by water molecules" for "hydrated".

### 4.5 Two volumes, two situations

Ladder 7 and free-response 1(d) find the concentration of an ion left in
solution after two solutions are mixed, and rightly divide by the combined
volume. Lesson 4.6 calls dividing by the two volumes added together a slip,
for a different question: the concentration of the analyte in the sample.
Each of those answers gains a sentence saying which situation it is (the
ions are now spread through all of the mixture), and Ladder 7 says, as the
free-response question already does, that the volumes are taken to add.

### 4.6 Numbers

No atomic or molar mass in the sources differs from the exam table's, and a
script (`scratchpad/unit4-practice/recompute.py`) finds no numeric answer
that changes. Four displays are tidied, each recomputed by the controller:

- **Ladder 4's worked example** prints "2.00 × 17.03 = 34.0 g"; 2.00 × 17.03
  is 34.06. The answer, 34.0 g, is right (28.0 g ÷ 28.02 g/mol × 2 × 17.03
  g/mol = 34.04 g); the step shows the carried 1.999 mol.
- **Three values are exact ties at the last figure kept:** free-response
  1(c), 0.00500 mol × 461.0 g/mol = 2.305 g; Ladder 7(a), 0.0450 L × 0.250 M
  = 0.01125 mol; free-response 4(a), whose unrounded concentration is
  exactly 0.115 M. Each answer shows the unrounded value, and where a rubric
  names the rounded one it accepts either neighbor (2.30 g or 2.31 g).
- **Ladder 4(d)** calls 4 g of hydrogen with 32 g of oxygen "a 1:8 mass
  ratio"; with the table's masses it is 1 to 7.94, so "about 1 to 8".

### 4.7 Drawings

- **Worksheet 1, question 4** prints a box of particles (6 atoms of A and 3
  molecules of B₂) whose counts are given only in the picture. The stem
  states the counts in words, and no figure is needed: parts (a) and (b) ask
  for numbers. Unit 4's branch has no figure block for practice pages until
  Unit 1's pull request #60 is merged, and nothing here waits for it.
- **Three questions ask for a drawing** (Worksheet 1, 4(c) and question 5;
  Worksheet 4, 1(e)). Each stays a drawing on paper, and the answer says
  what the drawing must show, with the counts of each particle, in the terms
  of lesson 4.3 (water left out; a polyatomic ion one particle; a
  precipitate a cluster in which unlike ions touch). Worksheet 4, 1(e) fixes
  no counts; its answer gives one correct set (from 4 Pb²⁺, 8 NO₃⁻, 4 K⁺ and
  4 I⁻: a cluster of 2 Pb²⁺ and 4 I⁻, with 2 Pb²⁺, 8 NO₃⁻ and 4 K⁺ still
  dissolved) and says what any correct drawing shares with it.

### 4.8 Wording particular to Unit 4

- Worksheet 4's header ("the unit exam's free-response question is this
  shape and length") becomes a sentence about the AP exam's long
  free-response questions.
- "An unlabelled diagram earns nothing" (Worksheet 1) becomes advice to
  label every particle.
- The ladders print their questions as 1 to 4 and key them as (a) to (d): on
  the site they are parts a to d.
- Many equations in the sources carry no state symbols. An equation given as
  an answer carries a state symbol on every species, as the lessons' do.

## 5. Code

None. The practice route, the audit and the browser tests already cover
every unit that has practice.

## 6. Pull requests

Each is stacked on the one before and targets `main`; the first is stacked
on #59. **Each waits for the teacher's word.**

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Worksheets 1 to 4 |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The six documents are built, pass the browser and accessibility tests, and
  wait in pull requests for the teacher, each pull request's "Build and
  test" check passing on GitHub.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked twice and every accepted finding
  fixed.
- Every equation balances in atoms and in charge, and every equation given
  as an answer carries its state symbols.
- No page scrolls sideways, and no equation scrolls in its box, at 412, 390,
  360 or 320 px with every answer open.
