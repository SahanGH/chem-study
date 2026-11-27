# ChemStudy: Unit 8 practice

Written on 2026-11-27. It follows the Unit 8 lessons design
(`2026-11-27-chemstudy-unit-8-lessons-design.md`) and adds to the main
design, `2026-11-12-chemstudy-redesign-design.md`, changing nothing in it.

The teacher asked for Unit 8 "the same as was done for Unit 6, end to end",
and said to merge everything. **Claude merges each pull request when its
"Build and test" check passes**, and lists its decisions for the teacher to
change afterward.

Most decisions below are ones the teacher already made for the practice of
Units 5, 2, 7, 3, 1, 4 and 6, applied to Unit 8. What is new is in section
4. This unit needed more of Claude's own calls than any before it, because
the sources and the lessons differ in how they write the hydrogen ion, in
how they number the topics and in which words they use. **Section 4 opens
with the ten calls, each for the teacher to change.**

## 1. What is converted

| Order | Document | Source in `AP_Chem_Prep/Units/unit08-acids-bases/` | Topics, as the site numbers them |
|---|---|---|---|
| 1 | Skill ladders (12 ladders, 48 questions) | `u08-selfstudy.tex` | 8.1 to 8.10 |
| 2 | Worksheet 1: Conjugate pairs, pH and strong acids | `worksheets/u08-ws1.tex` | 8.1, 8.2, 8.3, 8.6 |
| 3 | Worksheet 2: Weak acids and weak bases | `worksheets/u08-ws2.tex` | 8.2, 8.3 |
| 4 | Worksheet 3: Structure, pKa and salts | `worksheets/u08-ws3.tex` | 8.3, 8.4, 8.6, 8.8 |
| 5 | Worksheet 4: Buffers and the Henderson–Hasselbalch equation | `worksheets/u08-ws4.tex` | 8.4, 8.8, 8.9, 8.10 |
| 6 | Worksheet 5: Titrations, indicators and a long free-response question | `worksheets/u08-ws5.tex` | 8.3, 8.4, 8.5, 8.7, 8.9, 8.11 |
| 7 | Free-response set (5 questions, 32 points, 50 minutes) | `u08-frq.tex` | 8.2, 8.3, 8.5 to 8.11 |

The five worksheets hold 42 questions and 113 parts between them; one
question is scored (Worksheet 5's last, 10 points). The free-response set
has 16 parts and 15 rubric lines. Each document lives in
`src/content/practice/unit-8/` and is served at
`/unit-8-acids-and-bases/practice/<name>/`. A document's topics list names
only what it tests; the fact-check settles each list. No source has a
figure, a titration curve or a printed table, and no figure is added: every
question can be answered from its words.

## 2. What is not converted

- **The unit exam** and **the old comprehensive test** (`exam/`): never
  opened. A new comprehensive test is written later.
- **The unit map, the guided notes and the review sheet.**
- **The "Quick review" strip** that ends each worksheet.
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept.
- **Notes to the teacher, to a grader or to a question writer**, among them
  the comment that the ladders share nothing with the free-response set
  (section 4.8 lists what they share).

## 3. How a document is made

As in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"), and as Unit 6's practice was made:

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it, beyond what this design names. Wording is recast for a
  student anywhere.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric".
- **The audit** (`scripts/practice-audit.mjs`) compares each document with
  its source. Each difference is fixed or recorded with its reason. This
  unit's expected files are long, because every H₃O⁺ written for an H⁺,
  every state symbol added and every topic label changed is a difference.
  A starting file for each page, holding the differences this design makes
  certain, is written with the plan.
- **Two independent fact-checks** of each document by fresh agents that
  solve every question before reading its answer, recompute every number
  unrounded, check every equation, state symbol and unit, and apply each
  rule the page states to every example on it.
- **Corrections to the old chemistry are made on the site** and listed in
  each pull request. A correction to one of the teacher's numbers, and
  every carried value, is recomputed by the controller, in a script, before
  it is written into a list.
- **Scoring notes that a grader could read two ways** are kept as the source
  has them and listed in the pull request (section 4.10).

**No key PDFs.** The built keys are not in the repository this session can
read, so a page is compared with its `.tex`, which holds every answer.

**Models.** Writers and fact-checkers on the strongest model; fixers that
apply a decided list on Sonnet; inventories on Haiku. Only the controller
builds, commits and merges. No originality check: the practice is the
teacher's own material.

## 4. New for Unit 8

**Claude's ten calls, for the teacher to change.** Each is carried out in
the subsection named.

| # | The call | Where |
|---|---|---|
| 1 | **H₃O⁺ is written everywhere**, as the lessons write it. Every H⁺ of the sources is recast, in $K_a$ expressions and in equations too. | 4.1 |
| 2 | **Five places carry "Beyond the exam" and are kept**, with the points and rubric lines the teacher wrote: Worksheet 4, question 1 (the derivation) and question 4 (the pH after an addition to a buffer); free-response 1(c) (the quadratic); Worksheet 2, 8(b) and 8(c) (acids with more than one proton). | 4.7 |
| 3 | **The small-x test is "the check", with its percentage shown**, as the lessons word it. The percentage is added to the twelve answers that print none. | 4.6 |
| 4 | **Topics follow the site's numbering** and what each question really tests. The labels of 27 questions and ladders change. | 4.2 |
| 5 | **All seven wrong statements are corrected.** Where a correction touches a rubric line, the points do not change. | 4.5 |
| 6 | **Where two fair routes differ in the last place, the page prints the answer the unrounded route gives** and shows the carried value that leads to it. | 4.6 |
| 7 | **Each question's own given data stay**, acetic acid's p$K_a$ of 4.74 among them. Where a question names an indicator but gives no table, the names and ranges are those of lesson 8.7's table. | 4.3 |
| 8 | **Data a stem lacks are added.** | 4.3 |
| 9 | **The lessons' terms are used**, state symbols are added to every equation, and each of 26 statements that say a little more than is true was weighed. | 4.4, 4.5 |
| 10 | **Questions that repeat a ladder's worked example word for word are kept** and listed. | 4.8 |

### 4.1 H₃O⁺, not H⁺

The sources write $[\ce{H+}]$ in every expression and almost every sentence,
and five equations with a bare H⁺. The lessons write H₃O⁺ everywhere and a
bare H⁺ nowhere. On the site:

- Every $[\ce{H+}]$ becomes $[\ce{H3O+}]$, in the $K_a$ expression of
  Worksheet 4's derivation too. "Added H⁺" becomes "added H₃O⁺". A
  "proton" stays a proton where the sentence is about what is passed from
  one species to another.
- The five equations with a bare H⁺ are rewritten with water as a reactant,
  as lesson 8.3 writes an ionization and lesson 8.11 writes a base taking a
  proton:
  $\ce{HCl(aq) + H2O(l) -> H3O+(aq) + Cl-(aq)}$;
  $\ce{CH3COOH(aq) + H2O(l) <=> H3O+(aq) + CH3COO-(aq)}$ (twice);
  $\ce{CH3COO-(aq) + H3O+(aq) -> CH3COOH(aq) + H2O(l)}$;
  $\ce{F-(aq) + H3O+(aq) -> HF(aq) + H2O(l)}$.
- Each introduction says once what lesson 8.1 says: the exam's equation
  sheet writes H⁺ for the same ion, and either is accepted.
- The rubric points that name an equation do not depend on which is
  written. Free-response 2(a)'s line reads "the equation that uses up added
  H₃O⁺ (or H⁺)".

### 4.2 Topics

The sources tag their questions by an older reading of the topics, in which
8.7 is "p$K_a$ and salts" and pH conversions are 8.2. The site teaches p$K_a$
in lesson 8.3, salt solutions in lesson 8.4, pH and pOH in lesson 8.1, what
makes a buffer in lesson 8.8, capacity in lesson 8.10 and indicators in
lesson 8.7. Each question's label is the lesson that teaches it, so that a
lesson's "Practice next" sends a student to questions on that lesson.

- **27 labels change**: 4 on Worksheet 1, 1 on Worksheet 2, 6 on Worksheet
  3, 5 on Worksheet 4, 3 on Worksheet 5, 6 ladders and 2 free-response
  questions. The plan lists each.
- **Conjugate pairs are topic 4.8's**, and a Unit 8 document can name only
  Unit 8's topics. Worksheet 1's questions 1 to 3 and Ladder 1 stay under
  8.1, as the sources tag them, and each page says once that topic 4.8
  taught the idea. Unit 6 did the same with Unit 5's activation energy.
- **No ladder is on topic 8.11**, and nothing but one sentence of Ladder 12
  touches 8.7. The ladders' list is 8.1 to 8.10.
- **The free-response set does not test 8.1 or 8.4** as the site divides the
  topics. Its introduction says "most of Unit 8", as Unit 6's and Unit 7's
  do.
- **Nothing in the practice asks which form of an acid has the higher
  concentration at a given pH** (the first half of lesson 8.7), or about a
  buffer with unequal members (lesson 8.10). That is for the comprehensive
  test's design.

### 4.3 Values, and what a question supplies

The lessons say that a question gives every $K_a$, $K_b$, p$K_a$ and
indicator range it needs. The sources give them in a strip at the top of
each sheet, or nowhere. On the site the strip becomes the introduction's
"Use these values", as tables of at most three columns.

**The sources' values stay.** No calculation in any lesson uses one of the
sources' acids or bases, so there is one true collision: acetic acid's
p$K_a$ is 4.74 in the sources (the logarithm of the rounded
$K_a = 1.8 \times 10^{-5}$) and 4.76 in lesson 8.6 (the handbook value).
Changing it would move every acetate answer in five documents. Worksheet
4's introduction says that tables round a little differently and that a
question's own values are the ones to use, as Unit 6's did.

**Added, because a question cannot be answered without it:**

- **Worksheet 3** gains $K_w = 1.0 \times 10^{-14}$, which questions 5 and 6
  need and its strip leaves out.
- **Worksheet 4, question 7** says that each buffer is 1.00 L, and which way
  round its ratio is (base form over acid form). **Ladder 11's worked
  example** says the same 1.00 L: "half of Y's base" is true of one liter
  only.
- **Worksheet 5, question 8**, the scored question, repeats in its stem the
  constants and the three indicator ranges it uses, which the source keeps
  in the strip.
- **Free-response 2(d)** gains a table of three indicators, and **Ladder
  12's worked example** names two of them with their ranges (below).
- **Ladder 12's worked example** gives the $K_a$ behind its "pH 2.87", and
  **Ladder 6's** repeats the $x$ it takes from Ladder 5.
- **Every introduction says that the solutions are at 25 °C** unless a
  question says otherwise, so that each "pH 7" and each "14.00" is true as
  written.

**Taken out of an introduction:**

- **Worksheet 1's list of the six strong acids**, which is the answer to the
  first half of its question 9.
- **Worksheet 4's spare $K_a$ of acetic acid**, which no question on the
  sheet uses and which gives 4.73 where the sheet's p$K_a$ gives 4.72 in
  4(d).

**Indicators.** Worksheet 5 gives its own table (methyl red, 4.4 to 6.2;
bromothymol blue, 6.0 to 7.6; phenolphthalein, 8.2 to 10.0), and it stays,
with "bromthymol" spelled as the site spells it. Ladder 12's example and
free-response 2(d) name phenolphthalein with a second range, 8.3 to 10.0,
and methyl orange, and give no table. They take lesson 8.7's table instead:
bromocresol green (3.8 to 5.4), bromothymol blue (6.0 to 7.6) and thymol
blue (8.0 to 9.6). So phenolphthalein has one range on the site, and a
student meets the lesson's indicators again.

- Ladder 12's example: thymol blue holds its equivalence pH of 8.72, and
  bromocresol green would change far too early.
- Free-response 2(d): thymol blue. This changes the indicator the rubric
  line names; the points stay (section 4.5).

**One spelling for one acid.** The worksheets write acetic acid as
HC₂H₃O₂ and the ladders as CH₃COOH; Worksheet 3 writes hypochlorous acid as
HClO in one part and HOCl in the next. Each source's formulas stay, and the
page says once that the two are one acid.

**Left as the sources have them and listed for the teacher:**

- p$K_a$ of NH₄⁺ as 9.25 beside a $K_b$ of ammonia that gives 9.26;
- $K_a$ values that tables give a little differently (HF, HOCl, HCN, HNO₂);
- Worksheet 5's question 8, which carries "25.00 mL" and "2.500 mmol" from a
  three-figure molarity;
- amounts given to one figure ("0.01 mol") beside ratios given to three.

### 4.4 The lessons' terms, arrows and state symbols

- **No "hydrolysis".** The lessons never use the word. An ion "reacts with
  water" or "takes a proton from water". Worksheet 3, 5(a) asks for "the
  equation for the reaction of the acetate ion with water".
- **"Ionize" for an acid or a weak base in water;** a strong base "comes
  apart into its ions completely". No "dissociate".
- "Half-equivalence point" for "the halfway point"; "endpoint", one word;
  "oxyacids" for "oxoacids"; "buffer capacity" for "buffering capacity";
  "the Henderson–Hasselbalch equation" for "H–H", which on a page with H–F
  bonds reads as a bond.
- **"The table of moles"** for "the stoichiometry step" and "mmol
  bookkeeping", and "an ICE table with $K_a$" for "weak-acid ICE". The
  lessons keep the two tables apart and say why.
- "What the flask holds" for "the major species"; "a spectator" for an
  "inert" ion; "the conjugate of something weak" for "a weak parent"; "so
  weak a base that it essentially never takes a proton from water" for "a
  negligible base".
- **"Amphiprotic"** is in no lesson. Ladder 1 says what lesson 4.8 says, that
  such a species can take a proton or give one up, and gives the word once
  as its name.
- **"The 5 percent check"** for "the 5% rule", "threshold" and "test"
  (section 4.6).
- "Size" for "magnitude" and a comma in thousands, as Unit 6's close-out
  asked for from the start.
- **State symbols.** Every equation carries a state symbol on every species,
  as the lessons' do. 17 of the sources' 21 equations carry none; each one
  added is reported. The arrows already follow the lessons' rule and do not
  change.
- **No equation is added** where the source prints none, with one
  exception: Worksheet 2, question 1 asks for an ICE table, so its answer
  shows the ionization equation and the table, as lesson 8.3 lays them out.
- British usage is recast: color, centered, liter, points, "the most common
  error", "most often missed", "a student" for "a candidate".

### 4.5 Statements changed

Each is listed in its pull request for the teacher to accept or reverse.
The plan gives the source line, the old text and the new for every one.

**Seven that are wrong as written:**

1. **Worksheet 5, question 4.** The stem says that questions 2 and 3 "use
   the same volumes and concentrations", and 4(a) answers "Yes" to "Are the
   equivalence volumes the same?" and then gives 25.0 mL and 50.0 mL. The
   stem now says "the same concentrations of acid and of base", and the
   answer is "No", with the point the teacher was making kept: the volume is
   set by the moles of acid, and acid strength plays no part.
2. **Worksheet 5, 8(f).** Phenolphthalein's range does not "bracket" 10.08,
   which is above its top. It is still the best of the three, and the answer
   says why, and that it is not ideal. The rubric line stands as written.
3. **Free-response 3(b).** A reported pH of 2.30 is not this solution's pOH,
   which is 2.00. It is the pOH found without the factor of 2. The answer
   names both slips; the rubric's one point is for seeing that a pOH was
   reported as the pH. (The other repair, a stem of 2.00, would change the
   teacher's question and is not made.)
4. **Carbonate** (Worksheet 5, 7(b); free-response 5(a)) is the conjugate
   base of HCO₃⁻, not of H₂CO₃, as Worksheet 1 and Ladder 1 themselves
   teach.
5. **Worksheet 4, question 6.** "OH⁻ never appears in an ICE table" is false
   of every weak base on Worksheet 2. The answer says that the added OH⁻ is
   not a starting concentration in an ICE table: it is used up first, in a
   table of moles.
6. **Worksheet 4, 8(d).** A solution of HCN with almost no CN⁻ would not
   "sit near pH 3.50": HCN alone is no more acidic than about pH 5 (pH 5.10
   at 0.10 M, 4.60 at 1.0 M).
7. **Worksheet 2, 5(b) and 5(c).** $K_a$ is $3.2 \times 10^{-6}$ and p$K_a$
   is 5.50; the source's $3.1 \times 10^{-6}$ and 5.51 come from squaring a
   rounded value (section 4.6).

**Nineteen that say more than is true, reworded:**

- "Strength is the fraction that ionizes" (Worksheet 2, question 3): the
  fraction changes with concentration, as the next question shows. Strength
  is how far the ionization goes, which $K_a$ measures.
- Phenolphthalein "brackets" a weak-acid equivalence point (free-response
  2(d)): replaced with lesson 8.7's indicators (section 4.3). The answer
  names thymol blue and says that bromothymol blue would also serve, since
  HF's curve is already steep at pH 6. The rubric point is for thymol blue,
  or bromothymol blue, with a reason tied to the steep rise around an
  equivalence point above pH 7.
- The same for Ladder 12's example.
- HF is weak "because the H–F bond is exceptionally strong" (Worksheet 1,
  question 9): "mainly because".
- An added oxygen atom "weakens" the O–H bond (Worksheet 3, 2(c); Ladder 8;
  free-response 4(a) and its rubric line): the lesson's wording, "makes the
  bond more polar and the proton easier to remove". The rubric line accepts
  either.
- F⁻ removes protons from water "appreciably" (Ladder 9(d)) and CN⁻
  "readily" (Worksheet 3, question 4): each is a weak base that takes
  protons from a few of the water molecules.
- AgCl's solubility in acid "equals" that in water (Worksheet 5, 7(e)): "is
  essentially the same as".
- "A group 2 hydroxide is a strong base" (Ladder 4's example;
  free-response 3(b)): "barium hydroxide is a strong base". Magnesium
  hydroxide is a slightly soluble solid on Worksheet 5.
- "Hundred-fold" (Ladder 2's example) is 75-fold, and "five orders of
  magnitude" (Ladder 3's example) is a factor of 62,500.
- HCO₃⁻ and OH⁻ "differ by more than one proton" (Ladder 1's example): they
  are not one species with and without a proton.
- Buffer B of Worksheet 4, question 7 is two pH units above its p$K_a$: the
  answer says that it was hardly a buffer to begin with.
- HCN as "the best acid" for pH 9.00 (Worksheet 4, 8(c)): the answer adds
  that NH₄⁺ with NH₃ is nearly as good.
- "The exception" (Worksheet 2, 8(c)) says what it is an exception to.
- The closing sentence of free-response 1(c), which does not follow.
- "pH 7" at a strong acid's equivalence point (Worksheet 5, 2(d); Ladder 12)
  gains "at 25 °C".
- HClO₃ against HBrO₃ (Ladder 8(c)): "is expected to be" the stronger. No
  measured value could be checked.
- The sources' scope notes (section 4.7).

**Seven weighed and kept as written:** "about 10⁵ times smaller" (it is
1.2 × 10⁵); $K_w$ rising with temperature; water's two unshared pairs;
"second only to Unit 3"; "pulled away from an increasingly negative anion";
5 M acetic acid against 0.0001 M HCl; acetic acid alone as no buffer.

### 4.6 Numbers

A script (`scratchpad/unit8-practice/recompute.py`) recomputes 186 printed
values. No source states a molar mass. A second script
(`scratchpad/unit8-practice/carried.py`) multiplies out every value in this
section.

**Two final answers change**, both in Worksheet 2, question 5:

| Where | Source | Site | Why |
|---|---|---|---|
| 5(b) | $K_a = 3.1 \times 10^{-6}$ | $3.2 \times 10^{-6}$ | Unrounded, $3.155 \times 10^{-6}$. The source squared the rounded $7.9 \times 10^{-4}$ |
| 5(c) | p$K_a$ = 5.51 | 5.50 | Unrounded, 5.501. (The rounded $3.2 \times 10^{-6}$ would give 5.49, so the answer carries $3.15 \times 10^{-6}$.) |

**Where two routes differ in the last place**, the page prints what the
unrounded route gives from the question's own data, and shows a carried
value so that the printed answer follows from the line above it:

| Where | Printed on the site | The other candidate | Carried on the site |
|---|---|---|---|
| Worksheet 2, 6(a) | pOH 2.78, pH 11.22 | 2.79 and 11.21, from the source's $x = 1.64 \times 10^{-3}$ | $x = 1.643 \times 10^{-3}$ |
| Worksheet 2, question 7 | 2.78 and 11.22 | the same | The stem gives $x = 1.643 \times 10^{-3}$ |
| Worksheet 3, 5(c) | pOH 4.98, pH 9.02 | 4.97 and 9.03, from the source's $x = 1.06 \times 10^{-5}$ | $K_b = 5.556 \times 10^{-10}$, $x = 1.054 \times 10^{-5}$ |
| Worksheet 3, question 6 | pOH 5.69, pH 8.31 | 5.70 and 8.30, from the source's $x = 2.0 \times 10^{-6}$ | $K_b = 1.389 \times 10^{-11}$, $x = 2.04 \times 10^{-6}$ |
| Worksheet 5, 5(c) | pH 5.36 | 5.37, from the source's $x = 4.3 \times 10^{-6}$ or from $K_w/K_b$ unrounded | $x = 4.32 \times 10^{-6}$. **Near a tie:** 5.3645 |
| Worksheet 5, 5(b) | pH 9.25, the p$K_a$ given | 9.26, from $K_w/K_b$ | Nothing; the given value is used |
| Worksheet 4, 4(d) | pH 4.72, from the p$K_a$ given | 4.73, from the $K_a$ the source's strip also gives | Nothing; the spare $K_a$ is left out (section 4.3) |
| Worksheet 4, 7(c) | "more than 25 times" | "about 25 times"; unrounded, 25.5 | 1.98 percent against 50.5 percent |
| Worksheet 3, 7(c) | "about 37" | 38. **A tie:** the two values on the page give exactly 37.5; unrounded, 37.3 | Nothing |

**No answer changes because $x$ was left out.** Seven printed values differ
in the last place from the full solution (0.100 M acetic acid is 2.87 by
the shortcut and 2.88 with $x$ kept, for one). The shortcut is the method
the lessons teach, each of them passes its check, and they stay. The
fact-checkers are told so.

**The check.** The lessons' rule is to do the division every time and put
the percentage in the answer. Worksheet 2 says "always", and then twelve of
the sources' own answers show none. Each gains its percentage: Worksheet 2,
2(c) (0.011%), 6(a) (1.1%), 6(b) (0.67%) and 6(c) (1.3%); Worksheet 3, 5(c)
(0.0053%) and question 6 (0.00068%); Worksheet 5, 3(b) (1.3%), 3(d)
(0.011%), 5(c) (0.013%), 8(b) (0.059%) and 8(e) (0.24%); and the
equivalence point of Ladder 12's example (0.011%). The starting pH of that
example gains one too (1.3%). Where the source gives a bare answer, the
answer on the site shows the $x$ the percentage is taken from.

"The 5% rule" and "the 5% threshold" become "the check" and "5 percent",
which the lessons call this site's own line and not a rule of the exam.
Free-response question 1 is the case where the check fails, at 5.4%, and it
keeps its purpose and its points.

### 4.7 Outside Unit 8's framework

The sources' scope notes name three exclusions and say that none is asked.
Two of the three could not be confirmed from the framework summary this
session has, and the worksheets ask for both. The lessons mark both "Beyond
the exam", and the practice follows the lessons:

| Where | What | Label on |
|---|---|---|
| Worksheet 4, question 1 | Deriving the Henderson–Hasselbalch equation | The question |
| Worksheet 4, question 4 | The pH of a ready-made buffer after an addition | The question |
| Free-response 1(c), 3 of the question's 10 points | The quadratic formula | The part |
| Worksheet 2, 8(b) and 8(c) | The pH of an acid with more than one proton; sulfuric acid's second proton | Each part |

- **Points and rubric lines stay as the teacher wrote them.** Free-response
  1(c)'s line already gives full credit to a student who used the shortcut
  after showing the check.
- **Worksheet 4's questions 5 to 7** (the two steps; the hydroxide in the
  wrong table; two buffers and their ratios) are lesson 8.4's method and
  lesson 8.10's comparison, and carry no label.
- **Question 4's parts (a), (b) and (e) are in scope by themselves.** The
  label is on the question because the question is the addition. The
  teacher may prefer it on parts (c) and (d) only, or off: one fact-checker
  of the lessons recalled released questions that ask for this pH.
- **The scope notes become one sentence of each introduction**, which claims
  only what the framework summary is sure of: the concentrations along the
  titration curve of an acid with more than one proton, and a solubility
  calculated from a pH, are not on the AP exam, and nothing here asks for
  them.
- **Two rubric notes that rest on an exclusion** say what they mean without
  it: free-response 2(a), "a calculation of the change in pH is not
  required"; free-response question 5, "no calculation is required, and
  none earns credit".

### 4.8 Repeats

Unit 6 listed its repeats and kept them. Unit 8's are closer: a student who
does the ladders first, as the site asks, meets three free-response parts
already answered. They are kept, since the ladders are where a skill is
shown and the free-response set is where it is scored.

| Worked example | Repeated in | How closely |
|---|---|---|
| Ladder 4 (0.0050 M Ba(OH)₂) | Free-response 3(a) | Word for word, with the same working |
| Ladder 8 (the hydrogen halides; HClO to HClO₄) | Free-response question 4; Worksheet 3, 2(a) to 2(c) | The same two trends in nearly the same sentences |
| Ladder 11 (buffers X and Y, 1.0 M and 0.010 M) | Worksheet 4, question 9; free-response 2(e) | The same two buffers three times |

Also the same in two places: Worksheet 5, question 7 and free-response
question 5 (CaCO₃, AgCl and Mg(OH)₂, with the same verdicts); Ladder 12's
example and Worksheet 5, question 3 (acetic acid with NaOH: 2.87, 4.74 and
8.72); 0.100 M acetic acid at pH 2.87 in four places.

### 4.9 Wording particular to Unit 8

- Worksheet 5's "FRQ (10 points)" becomes a sentence about the AP exam's
  long free-response questions.
- "Problem 2" becomes "question 2". "From the data strip" becomes "from the
  table at the top of this page".
- "A sanity check on the direction" becomes "a quick check of the
  direction".
- Ladder 6's "the counter-intuitive result" becomes "The result that looks
  backward", and Ladder 10's "pH and mechanism" becomes "pH and how it
  holds": "mechanism" is Unit 5's word on the site.
- The ladders print their questions as 1 to 4 and key them as (a) to (d):
  on the site they are parts a to d.
- Long ruled blanks whose key is a phrase become answers, not blanks.

### 4.10 Scoring notes kept as written

Listed in the pull requests, not changed: Worksheet 5, question 8's six
items (whether 25.0 mL is accepted for 25.00 mL; whether an ICE table that
keeps $x$ earns the setup point; the two conditions joined by "AND" in (c)
and (e)); free-response 1(b), where 5.4 percent is barely over; 1(c), whose
line gives the points for a quadratic to a student who set none up; 1(d),
5.2 against 5.4 percent; 2(b) and 2(c), what earns the first point; 2(e)
and 4(b), one point for two things; question 5, two lines for three parts,
and "consistently".

## 5. Code

None. The practice route, the audit and the browser tests already cover
every unit that has practice.

## 6. Pull requests

Each targets `main` and is merged by Claude when its check passes.

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Worksheets 1 to 5 |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The seven documents are built, pass the browser and accessibility tests,
  and are merged, each pull request's "Build and test" check passing on
  GitHub, and the deploy run succeeds.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked twice and every accepted finding
  fixed.
- Every equation carries its state symbols, and no page writes a bare H⁺.
- Every answer that leaves $x$ out shows its check as a percentage.
- No page scrolls sideways, and no equation scrolls in its box, at 412, 390,
  360 or 320 px with every answer open.

## 8. What could not be checked

- **The key PDFs.** None is on this machine. Every answer was read from the
  `.tex`.
- **The framework's pages.** Whether deriving the Henderson–Hasselbalch
  equation, and the pH after an addition to a buffer, are stated exclusions
  rests on a summary written from memory. Section 4.7 is safe under either
  reading.
- **Every reference value**: the $K_a$ values, the indicator ranges, and
  whether HClO₃ is a stronger acid than HBrO₃. Each question is worked from
  its own givens, so none of these moves an answer.
- **How these pages render.** Nothing is built until the worksheets are
  written; the plan's layout rules come from the sources and from the
  earlier units.
