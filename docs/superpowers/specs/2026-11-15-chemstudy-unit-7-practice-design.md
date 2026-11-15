# ChemStudy: Unit 7 practice

Written on 2026-11-15. It follows the Unit 7 lessons design
(`2026-11-15-chemstudy-unit-7-lessons-design.md`), which said the practice
would get a design of its own. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it.

The teacher asked for Unit 7 "end-to-end" on 2026-11-14: lessons, practice
and a comprehensive test, each as pull requests that Claude merges itself
once the "Build and test" check passes and the content has been fact-checked.
Every decision below is one the teacher already made for the practice of
Units 5 and 2 (Plans 3 and 6), applied to Unit 7. What is new is in
section 4.

## 1. What is converted

| Order | Document | Source in `D:\AP_Chem_Prep\Units\unit07-equilibrium\` | Topics |
|---|---|---|---|
| 1 | Skill ladders (12 ladders, 48 questions) | `u07-selfstudy.tex` | 7.1 to 7.12 |
| 2 | Worksheet 1: Dynamic equilibrium, Q and K | `worksheets/u07-ws1.tex` | 7.1 to 7.4 |
| 3 | Worksheet 2: Magnitude and properties of K | `worksheets/u07-ws2.tex` | 7.5, 7.6 |
| 4 | Worksheet 3: ICE tables | `worksheets/u07-ws3.tex` | 7.7 |
| 5 | Worksheet 4: Le Châtelier's principle, and Q against K | `worksheets/u07-ws4.tex` | 7.8 to 7.10 |
| 6 | Worksheet 5: Solubility equilibria, and a free-response question | `worksheets/u07-ws5.tex` | 7.11, 7.12 |
| 7 | Free-response set (5 questions, 32 points, 50 minutes) | `u07-frq.tex` | 7.1 to 7.12 |

The worksheets hold 39 questions between them, one of them scored (Worksheet
5's last, 10 points). Each document lives in `src/content/practice/unit-7/`
and is served at `/unit-7-equilibrium/practice/<name>/`.

## 2. What is not converted

- **The unit exam** (`exam/u07-exam.tex`). It stays a closed test.
- **The unit map, the guided notes and the review sheet.** They belong to one
  class.
- **The "Quick review" strip** that ends each worksheet. The teacher left it
  out of every practice document on 2026-11-13, for all units.
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept, as in Units 5 and 2.

## 3. How a document is made

Exactly as in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"):

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it. Wording is recast for a student anywhere: US spelling, no
  em dashes, nothing that points at a class, a textbook or a sheet of paper.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric". Nothing is typed or graded.
- **The audit** (`scripts/practice-audit.mjs`) compares each document with its
  source: numbers, formulas, parts, rubric lines and wording. Each difference
  is fixed or recorded with its reason.
- **An independent fact-check** of each document, on Fable 5.2 (the
  teacher's decision of 2026-11-14 for this repository), by a fresh agent
  that solves every question before it reads the answer. It checks every
  claim against the framework and the Unit 7 lessons, and compares the
  document with the key PDF in
  `D:\AP_Chem_Prep\build\Units\unit07-equilibrium\`.
- **Corrections to the old chemistry are made on the site**, since the MDX
  becomes the master copy. Each pull request lists them for the teacher to
  accept or reverse.
- **Answers use the lessons' terms.** A table of initial, change and
  equilibrium values has rows labeled I, C and E, as lessons 7.4 and 7.7
  have them. A shift is "toward products" or "to the right": lesson 7.9
  teaches both phrases, so the source's "right" and "left" stay.

## 4. New for Unit 7

### 4.1 One K_sp for each salt, across the site

The old documents do not agree with each other on four salts, and two of
their values differ from the ones lesson 7.11 uses:

| Salt | Worksheet 5 | Skill ladders | Free-response set | Lesson 7.11 | The site's value |
|---|---|---|---|---|---|
| AgCl | 1.6 × 10⁻¹⁰ | 1.8 × 10⁻¹⁰ | | | 1.8 × 10⁻¹⁰ |
| BaSO₄ | 1.5 × 10⁻⁹ | | | 1.08 × 10⁻¹⁰ | 1.1 × 10⁻¹⁰ |
| CaF₂ | 4.0 × 10⁻¹¹ | | 3.9 × 10⁻¹¹ | | 3.5 × 10⁻¹¹ |
| PbI₂ | 1.4 × 10⁻⁸ | 7.1 × 10⁻⁹ | | 9.8 × 10⁻⁹ | 9.8 × 10⁻⁹ |
| Ag₂CrO₄ | 9.0 × 10⁻¹² | 1.1 × 10⁻¹² | | | 1.1 × 10⁻¹² |
| BaCrO₄ | 8.5 × 10⁻¹¹ | | | | 1.2 × 10⁻¹⁰ |

A student who meets silver chromate at 9.0 × 10⁻¹² on one page and
1.1 × 10⁻¹² on the next, or barium sulfate at 1.5 × 10⁻⁹ in a worksheet and
1.08 × 10⁻¹⁰ in the lesson, cannot tell which to trust. Lesson 7.11 says
that tables differ a little; these differ by up to a factor of fourteen.

**So each salt has one value on the site**: the handbook value at 25 °C that
the lessons were written from, to two significant figures, as the old
questions give theirs. Every answer that depends on a changed value is
recomputed. This is done in two steps, so that the audit keeps its meaning:

1. The writer converts the document with the source's own numbers, and the
   audit is brought to "0 unexplained".
2. A second pass changes the K_sp values and the answers that follow from
   them, from a list worked out by script. Each change is recorded in the
   audit's `expected` file as a correction, the fact-check recomputes every
   one, and the pull request lists them all.

This is the same kind of change as Unit 2's, where the practice moved to
the lessons' electronegativities and bond energies. It is larger, and the
pull request says so plainly.

### 4.2 Beyond the exam

- **Worksheet 1, question 8** (K_p = K_c(RT)^Δn, four parts) is labeled
  "Beyond the exam": the framework says this conversion will not be
  assessed. The formula leaves the worksheet's list of relationships and
  stays with its question.
- The scope notes in the ladders and the free-response set, which say the
  conversion is not asked, become one plain sentence each.
- **The quadratic formula is not labeled.** The framework does not exclude
  it, and lesson 7.7 says it is rare on the exam. It is needed in Worksheet
  3 (questions 4, 7 and 8), in Ladder 7's worked example and in question 1
  of the free-response set. Worksheet 3's introduction says where the
  formula is needed and that the exam seldom asks for it.

The fact-check confirms the one label and looks for anything else the
framework leaves out.

### 4.3 Material from other units

Units 4, 6 and 9 are not on the site.

- Worksheet 2, question 4 ("In Unit 6 you learned ...") asks why enthalpies
  add where equilibrium constants multiply. It is recast without the class
  wording and names the topic. Its answer mentions that ΔG° is proportional
  to ln K; that sentence stays, with its topic named, and the fact-check
  decides whether a student of Unit 7 alone can follow the answer without it.
- Worksheet 3, question 1 compares the table of initial, change and
  equilibrium values with the "before, change, after" table of stoichiometry
  from Unit 4. It is recast to stand without that unit.

### 4.4 No pictures

No source document has a figure. Worksheet 4, question 8 describes three
drawings of a flask in words ("the first two pictures differ; the second and
third are identical") and is converted as written. The practice pages need
no new block.

## 5. Code

None is expected. The practice route, the audit and the browser tests
already cover every unit that has practice (Plan 6). The Unit 7 lessons'
"Practice next" lists the new documents by their topics with no change.

## 6. Pull requests

Each is merged by Claude once its check passes and its documents have been
fact-checked, with the deploy watched.

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | Worksheets 1 to 5 |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The seven documents are live, and each passes the browser and
  accessibility tests.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked and every accepted finding fixed.
- Every salt has one K_sp across the lessons and the practice.
- No page scrolls sideways at 412, 390, 360 or 320 px with every answer open.
