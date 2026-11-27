# ChemStudy: a Unit 8 comprehensive test

Written on 2026-11-27. It follows the comprehensive tests of Units 5, 2, 7,
3, 1 and 6 and changes nothing in them, or in the main design. Its model is
the Unit 6 test (`2026-11-27-chemstudy-unit-6-comprehensive-test-design.md`),
whose "As built" section it builds in.

## 1. Why

Unit 8 has its eleven lessons and its seven practice documents. The teacher
asked on 2026-11-27 for Units 8 and 9 to get what Unit 6 got, end to end,
with everything merged, and with the work shared among several models. For
Unit 6 "end to end" ended with a comprehensive test, so this is Unit 8's.
The teacher's old Unit 8 test is not converted, as for every unit, and the
unit exam stays closed.

## 2. What is decided

| Question | Decision | Whose |
|---|---|---|
| Fresh questions from the AP framework; free response only; every question scored; a "Show answer" with the worked solution and the rubric; one page per sitting | As Units 5, 2, 7, 3, 1 and 6 | The teacher's, for Unit 5 (2026-11-13) |
| A Unit 8 test, made the way Unit 6's was | Yes | The teacher's (2026-11-27) |
| Merging | Claude merges each pull request when its "Build and test" check passes | The teacher's (2026-11-27: merge everything) |
| Several models | Writers, fact-checks, second checks and revisers on the strongest model; originality checks, and fixers applying a decided list, on Sonnet; only the controller builds, commits and merges | The teacher's choice of approach; Claude's assignment of the roles, as for Unit 6 |
| The closed unit exam and the old test | Read by no one. No folder named `exam` and no file with "exam" or "test" in its name is opened in the teacher's repository | The teacher's rule |

**Claude's calls, for the teacher to confirm or change:**

- **Size: two sittings, 39 questions, about 193 points.** Unit 8 is 11 to 15
  percent of the exam, the second-largest unit, and has eleven topics. Unit
  6 (7 to 9 percent, nine topics) has 37 questions and 179 points; Unit 7
  (7 to 9 percent, twelve topics) has 41 and 209.
- **Every question is a scored free-response question of 3 to 7 points.**
  There are no multiple-choice questions, as in every test on the site. The
  short questions do a multiple-choice question's work.
- **The split.** Session 1 is topics 8.1 to 8.5 (water and pH, strong and
  weak acids and bases, acid–base reactions, titrations). Session 2 is
  topics 8.6 to 8.11 (structure, pH and pK_a, buffers, capacity, pH and
  solubility).
- **Eight parts for eleven topics**: 8.1 with 8.2, 8.8 with 8.9, and 8.10
  with 8.11 share a part (section 3 says why).
- **No figures.** A titration curve is a table of readings, a particle
  drawing a table of counts, a structure a condensed formula with a sentence.
- **One part of one question carries "Beyond the exam"**: the pH of a
  ready-made buffer after an addition (section 5). The teacher may want the
  label removed, as for lesson 8.10.
- **Fresh substances, about forty new reference values, all from memory**
  (section 6). Each stem gives the values it uses. The unit's own table is
  used where its values are the surest and the kind of question is new.
- **H₃O⁺ everywhere and never a bare H⁺**, as in the lessons.
- **The task table was changed in three places after its first draft** to
  keep a number honest: a wanted pH in Part C was chosen so that the ratio
  is exactly 3.0; salt solutions in Part C are 0.20 M, because at 0.10 M one
  reading falls on a tie at its last figure; a pair in Part E was changed so
  that the two measured pairs do not both point the same way.

## 3. What students get

Two practice pages in Unit 8, listed after the free-response set:

| Order | Page | Parts | Topics | Size |
|---|---|---|---|---|
| 8 | Comprehensive test, session 1: acids, bases and their reactions | A: Water, pH, and strong acids and bases (5 questions)<br>B: Weak acids and weak bases (5)<br>C: Acid–base reactions (5)<br>D: Titrations (5) | 8.1–8.5 | 20 questions, about 102 points, about 105 minutes |
| 9 | Comprehensive test, session 2: structure, buffers and solubility | E: Molecular structure (4)<br>F: pH, pK_a and indicators (4)<br>G: Buffers and the Henderson–Hasselbalch equation (5)<br>H: Buffer capacity, and pH and solubility (6) | 8.6–8.11 | 19 questions, about 91 points, about 95 minutes |

Counts and points are targets; a part may end a question or a few points
either way if that makes better questions. The minutes follow the points, at
about a minute a point, as in Units 6 and 7.

**Why three pairs of topics share a part.** Topics 8.1 and 8.2 are short,
and the lessons and worksheets have already set the plain conversion and the
plain strong-acid pH more than thirty times: two and three new questions are
what is left that is new. Topics 8.8 and 8.9 are one idea, the ratio of a
buffer's two members, told in words and then in logarithms. Topics 8.10 and
8.11 are the unit's two shortest. The three calculation topics the exam
leans on, 8.3, 8.4 and 8.5, each have a part and five questions.

**Coverage by topic.**

| Topic | Questions | Where | Points (about) |
|---|---|---|---|
| 8.1 Introduction to acids and bases | 2 | A1, A2 | 10 |
| 8.2 pH and pOH of strong acids and bases | 3 | A3, A4, A5 | 13 |
| 8.3 Weak acid and base equilibria | 5 | B1 to B5 | 26 |
| 8.4 Acid–base reactions and buffers | 5 (and B2) | C1 to C5 | 25 |
| 8.5 Acid–base titrations | 5 | D1 to D5 | 28 |
| 8.6 Molecular structure of acids and bases | 4 | E1 to E4 | 18 |
| 8.7 pH and pK_a | 4 (and D1's last part, H5) | F1 to F4 | 19 |
| 8.8 Properties of buffers | 2 | G1, G2 | 10 |
| 8.9 Henderson–Hasselbalch equation | 3 | G3, G4, G5 | 15 |
| 8.10 Buffer capacity | 3 | H1, H2, H3 | 15 |
| 8.11 pH and solubility | 3 | H4, H5, H6 | 14 |

Topics 8.3 to 8.5 hold 79 of the 193 points, about two fifths, which is
their share of the unit's calculations on the exam. Every topic has at least
two questions and at least 10 points.

**Coverage by skill.** Each question is listed once, under what most of its
points are for.

| Skill | Questions | Count |
|---|---|---|
| A calculation run forward (a pH from amounts and a constant), with every step shown | A4, B2, C5, D4, G4 | 5 |
| A quantity found backward (a constant, a molarity, a volume or a recipe from a pH) | A1, A3, A5, B1, B5, C1, D3, F2, F4, G3, H1 | 11 |
| A table or a record read (a curve, a set of readings, a particle table) | A2, C3, D5, G1, G2, G5, H2, H4 | 8 |
| Data tested against one another (a reading that cannot be right; which measurement settles it) | D2, F3 | 2 |
| A substance or a solution identified from measurements | B3, B4, D1 | 3 |
| A claim weighed against data or a calculation | E1, E4, H6 | 3 |
| An explanation from structure or particles | E2, E3, F1, H5 | 4 |
| A choice or a design justified (which reagent reacts, which recipe, which buffer) | C2, C4, H3 | 3 |

Many questions do two of these: D2, F3, G2 and G5 also contain an entry that
cannot be right; A2 does too.

## 4. What each part asks

The task table was made after an avoid list that indexes the pages' text as
well as their questions, and **every task was compared with the pages
themselves before any writer starts** (`scratchpad/unit8-test/avoid-list.md`
and `task-table.md`; twenty-two first drafts were dropped in that
comparison). Each task is a kind of question the site has not set for its
topic: a quantity found backward; a table read backward; data that cannot be
right; which measurement is enough; a ranking that changes with its basis; a
claim weighed against data; a substance named from two readings.

**Part A: Water, pH, and strong acids and bases (8.1, 8.2)**

- **A1.** Pure water in a cold room reads pH 7.08. Find K_w there, read the temperature from a table of K_w, and use that K_w for the same water after a trace of acid.
- **A2.** A log sheet gives two of the four quantities for each of four samples. One row does not fit 25 °C. Find it, rank the samples, and say what would make the row right (a warm, neutral sample).
- **A3.** Two baths of nitric acid at pH 1.00 and pH 3.00 are mixed in equal volumes. Show that the result is not pH 2.00, and find the proportion that does give it.
- **A4.** One gram each of three strong bases in a liter, then the same three at one molarity: two rankings by pH, and why barium hydroxide changes place.
- **A5.** The water that takes an acid, and a barium hydroxide solution, to a wanted pH; and why dilution cannot take the acid to pH 7.50.

**Part B: Weak acids and weak bases (8.3)**

- **B1.** A weak acid and a strong acid at the same pH: the molarity of each, the base each takes, and the claim "same pH, same amount of base".
- **B2.** A weak acid alone and then in a strong acid's solution: its percent ionization in each, and which acid sets the pH.
- **B3.** The pH of an amine's solution gives its K_b, with no approximation, and the K_b names the amine among three; then the pH of another candidate, forward.
- **B4.** Two bottles of equal molarity, one strong acid and one weak: which is which, the weak acid's K_a, and both readings after a fourfold dilution.
- **B5.** A percent ionization gives K_a; K_a gives the percent and the pH at another molarity; and whether a third would pass the small-x check.

**Part C: Acid–base reactions (8.4)**

- **C1.** The volume of sodium hydroxide that brings benzoic acid to a wanted pH, then what the flask holds, and its pH, at two larger volumes.
- **C2.** Four recipes from four stock solutions: three give the same amounts of acid and conjugate base, one gives the conjugate base alone.
- **C3.** Four salt solutions matched to four pH readings, and a K_a found from one of them.
- **C4.** Two bases in one solution and a limited amount of strong acid: which base takes the protons, and the K that says so.
- **C5.** Three solutions in one flask, a strong acid and a strong base among them: the bookkeeping, then the pH.

**Part D: Titrations (8.5)**

- **D1.** A weighed sample of an unlabeled acid is titrated. Its molar mass and its pK_a together name it among four; then the pH at the equivalence point, and an indicator.
- **D2.** Three readings from one curve, one of them copied wrong: why two cannot say which, and how the third does.
- **D3.** A weak base titrated with a strong acid: its conjugate acid's pK_a from two readings that are not at the halfway point, then the start and the equivalence point.
- **D4.** Water is added to the flask before a titration: which of four landmarks move, which do not, and by how much.
- **D5.** Sodium carbonate titrated with a strong acid: a curve with two falls, read in words.

**Part E: Molecular structure (8.6)**

- **E1.** Peracetic acid has one more oxygen atom than acetic acid and is far weaker: where the charge sits, a claim weighed, and the two conjugate bases compared.
- **E2.** Four pK_a values matched to butanoic acid with a chlorine atom on each of three carbons, and two predictions.
- **E3.** Pairs of binary acids: where the unit's two rules agree, where they pull apart, and what two measurements show.
- **E4.** Five oxyacids of five elements counted two ways: a claim about the number of oxygen atoms fails, another count works, and two predictions.

**Part F: pH, pK_a and indicators (8.7)**

- **F1.** Alanine's two groups at three pH values: the form of each group and the net charge.
- **F2.** A measured share of a dye in its colored form gives its pK_a, and the pK_a gives the share at another pH.
- **F3.** Two indicator tests bracket a pH. Which third test would narrow it, which would add nothing, and a report that cannot be right.
- **F4.** The window of pH in which one acid is nearly all ions and another nearly all uncharged.

**Part G: Buffers and the Henderson–Hasselbalch equation (8.8, 8.9)**

- **G1.** Four unlabeled bottles identified from their pH before and after a little acid and a little base, and why the two that are half a buffer fail on one side.
- **G2.** A particle table read backward: what was added, shown by the spectator ions, and a table that cannot be right.
- **G3.** The two volumes of two stock solutions for a buffer of a wanted pH, and what swapping them does.
- **G4.** A buffer made from a weak base and a strong acid, and the further acid that brings it to pH = pK_a.
- **G5.** A notebook of buffers of one unknown acid: its pK_a, the missing readings, and the entry that cannot be right.

**Part H: Buffer capacity, and pH and solubility (8.10, 8.11)**

- **H1.** Two buffers of equal total: the amount of acid and of base that takes each to a stated limit. One part, labeled "Beyond the exam", finds a pH after an addition.
- **H2.** A record of pH against time while a reaction releases acid: when the buffer gave out, how fast the acid came, and how much more base form a longer run needs.
- **H3.** Two conjugate pairs both within a unit of the wanted pH: which recipe has more room for acid, which for base.
- **H4.** Three solids in water and in dilute acid: sorted by their anions, and a claim about the metal ion weighed with two solids of one metal.
- **H5.** Three salts of one metal whose anions' conjugate acids differ widely in pK_a: between which pH values each one's solubility rises.
- **H6.** A hydroxide's own saturated solution is basic; a buffer that is less basic dissolves more of it, and one that is more basic dissolves less.

Thirteen tasks sit near lesson text or a kind the site has counted and are
marked for the originality check: A5, B4, C1, C2, C4, D3, D5, E1, E4, G1,
H2, H3 and H4.

## 5. In and out of the framework

The framework could not be read from this session. This section follows the
summary the lessons were written from (`scratchpad/ced/unit8-framework.md`)
and the way the Unit 8 lessons and practice already treat each unsure point,
so that the test is right under either reading. **No question may need a
skill the framework leaves out unless the part is labeled "Beyond the
exam".**

| Point | In the lessons and practice | In the test |
|---|---|---|
| The pH of a ready-made buffer after a strong acid or base is added (the teacher's headers call it excluded; the summary does not remember the exclusion) | Worked once in lesson 8.10 with a "Beyond the exam" sentence; no Check asks it; the practice marks such parts `beyond` | One part (H1, part d), marked `beyond`. Everything else about an addition is asked without a label: the reaction, the new amounts, the ratio, the direction, a comparison, the amount that reaches a stated limit |
| The pH of a mixture made from a weak acid and a strong base, or a weak base and a strong acid (topic 8.4) | Taught and asked in lesson 8.4 | Asked without a label (C1, C5, G4) |
| The quadratic formula | Named once under "Beyond the exam"; every calculation a student does passes the 5 percent check | Needed nowhere. Every calculation passes the check, and the check with its percentage is in the answer and the rubric. Where the shortcut would fail, the question works backward from a reading |
| The 5 percent line | "The check this site uses (topic 7.7)", never a rule of the exam | The same words |
| Polyprotic acids and bases | One curve read in words; no pH calculated; "Beyond the exam" for the concentrations | One curve read in words (D5), for a base. No concentration along it; the reading at the first equivalence point is given |
| A solubility calculated at a stated pH (left out of topic 8.11) | Directions and reasons only | Directions and reasons only (H4 to H6). H6 finds the pH of a hydroxide's saturated solution in pure water from K_sp (topics 7.11 and 8.1) and then compares directions |
| The derivation of the Henderson–Hasselbalch equation | Two lines under "Beyond the exam" | Not asked |
| The pH of a weak acid mixed with a weak base | The equilibrium, its K and its direction only | The same (C4) |
| The pH of a salt solution | Calculated in lesson 8.4 | Calculated (C1, C2, D1, D2, D4) |
| Lewis acids and bases; the pH of sulfuric acid; very dilute strong acids; activity; complex ions and amphoteric hydroxides; back-titration; a list of indicators to memorize | Left out | Left out. Every indicator's range is given |

The test follows the lessons' conventions: H₃O⁺ with water in every
ionization; a state symbol on every species; the double arrow for a weak
acid or base with water and the single arrow for any reaction with a strong
acid or strong base; water left out of every K; K_w = 1.0 × 10⁻¹⁴ and pH +
pOH = 14.00 at 25 °C, and every question at 25 °C unless it gives another
K_w; a pH to two decimal places; a table of moles (Before, Change, After, in
millimoles, no x) before any ICE table when a strong acid or base is added;
pOH first and then pH, on its own line, for any base; the pK_a of the
conjugate acid, never a pK_b, for a base's buffer, curve or indicator; never
M_aV_a = M_bV_b; the terms "ionization", "acid form" and "base form",
"half-equivalence point", "buffer capacity", and never "hydrolysis" or "ICF
table".

## 6. Keeping the questions original, and the values honest

- Every question is written fresh from the framework's learning objectives,
  with its own substances, numbers and setting.
- **The writers read no textbook and none of the old course.** They read the
  framework notes, the site's Unit 8 lessons and practice, the avoid list,
  the task table and their part's pool.
- **The avoid list** (`scratchpad/unit8-test/avoid-list.md`) holds, for each
  topic, every substance with its numbers and every scene that the lessons,
  the practice and the teacher's notes, review sheet, self-study ladders,
  worksheets and free-response sheet use; the kinds of question already set,
  with a count of each; what is still free; the number sets and settings the
  test must use nowhere. Nothing under `exam/` was read to make it.
- **One pool per part** (`scratchpad/unit8-test/pools.md`), so that no two
  parts use the same weak acid, weak base or solid as the subject of a
  question.
- **An independent originality check**, one per session, compares every new
  question with the teacher's notes, map, review sheet, self-study ladders,
  worksheets and free-response sheet (each file named, never the exam) and
  with the site's own lessons and practice. No textbook can be read from
  this session; the checker names any question it knows as a stock exercise.
- **Values are honest, and none could be looked up.** This session reaches
  no reference table, so every published value in the pools is from memory,
  graded A, B or C by how sure its author was. So:
  - **a question draws only on the values of the Unit 8 lessons' table
    (lessons design, section 3), or on a new value that the pool lists with
    its grade**;
  - a stem gives every value its question uses ("use these values", or
    "take" for a value graded C), as the exam does;
  - a "measured" pH in a stem is generated by the writer's script from the
    pool's constant, and working backward from it returns that constant to
    two figures;
  - the number check recomputes every answer from the stem's own values, so
    an answer is right for the question as printed;
  - each fact-checker judges every value against what it knows and says how
    sure it is; a value two checkers doubt is replaced or the question says
    "take";
  - one value per quantity across the test, and a K_a and the pK_a of the
    same acid agree within 0.02;
  - every value the checkers could not confirm is listed for the teacher.
- **The new values**, with the author's grade (A sure, B fairly sure, C not
  sure to the figures given): K_w at 20 °C and 30 °C (B); acrylic acid's
  K_a (B); mandelic acid's K_a as an answer (B); K_b of piperidine (A),
  dimethylamine and benzylamine (B); benzoic acid's K_a (A) and solubility
  (B); the pK_a of the triethylammonium, imidazolium, diethanolammonium and
  triethanolammonium ions (B); of crotonic and pivalic acid (B); of carbonic
  acid, both (A); of peracetic acid and the three chlorobutanoic acids (B);
  of HF (B); of telluric and periodic acid (B), phosphoric acid (A) and
  arsenic acid (B); of alanine's two groups (B and C); of 4-nitrophenol (A),
  cinnamic acid and vanillin (B); of HSO₃⁻ (B); five indicator ranges (three
  A, two B); K_sp of manganese(II) hydroxide (C, with "take").
- Made-up data (the unnamed acids of B4, D2, G2 and G5; the amounts
  dissolved in H4) say that they are made up, and are consistent with one
  another.
- **What the Unit 6 test's checks kept finding**, so that this test does not
  repeat it: a part that asks "why" or "what does this show" and lands on a
  sentence the lessons already say (end a question on something its own data
  decide); a rubric line a sound answer could not earn, or a wrong one
  could; a question with a second defensible answer; a statement with
  "always" or "only" that fails on the page's own example; a printed step
  that does not give the printed answer.
- **What Unit 8's own checks kept finding**: a pOH given as a pH; the factor
  of two of a group 2 hydroxide; a concentration without its unit; a small-x
  shortcut with no check, or a check with no percentage; the volume of one
  solution used where the total belongs; a ratio upside down; an equation
  with a species that has no state symbol; a bare H⁺.

## 7. How each session is made

1. **The avoid list, the task table and the pools** (done).
2. **Writers, in parallel**, one per part, files only.
3. **A number check.** Each writer leaves a script that recomputes every
   number in its part from the question's own data and asserts each against
   the page; the controller runs every script.
4. **The parts' substances and values compared across both sessions.**
5. **An independent fact-check** per part, by a fresh agent that solves
   every question before reading its answer, scores its own answer with the
   rubric, and applies each rule the page states to every example on it.
6. **The originality check**, one agent per session.
7. **Fixes** (any correction to a number recomputed by the controller),
   **rewrites** of the parts the originality check names, by a reviser per
   part, **a second check** of two parts at a time that treats every
   sentence as new, a build, the unit and browser tests, and each page
   measured at 412, 390, 360 and 320 px with every answer open, after every
   round of fixes.
8. **A pull request**, merged when its check passes on GitHub.

**Models.** Writers, fact-checkers, second checkers and revisers on the
strongest model (Fable). The originality checks, and the fixers that apply a
list the controller has decided, on Sonnet. Only the controller builds,
commits, opens pull requests and merges.

**Layout rules every writer and fixer is given** (learned in the practice
and the tests since Unit 6): about 25 rendered characters to a display line
at 320 px; `aligned` with `&` on every row; inline math cannot wrap, so an
equation in a rubric line or a list item is written in words or as a
display; a table inside a part has at most three short columns; each
`<RubricLine>` on one line, agreeing with its part's answer, the lines
summing to the question's points.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Session 1 |
| C | Session 2, and the close-out notes ("As built" here; "As carried out" in the plan; the list for the teacher of every value no checker could confirm) |

## 9. Code

None. The practice kind `test`, the blocks (with `beyond` on a part) and the
build check already exist.

## 10. Done when

- Both pages are built and merged, each check passing on GitHub, and the
  deploy run succeeds. Every question is answered, every rubric adds up,
  and the topics are covered as section 3 says.
- Every number has been recomputed by a script, and every part has been
  fact-checked twice.
- The originality check found no repeated scenario, substance with its
  numbers, or kind of question the site already sets.
- No question needs a skill the framework leaves out, except the one part
  labeled "Beyond the exam".
- Both pages fit a phone at 320 px with every answer open, no equation
  scrolls in its box, and both pass the browser tests' accessibility checks.
- `npm test` passes, the American-English check among it.
