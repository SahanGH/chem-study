# ChemStudy: Unit 2 practice

Written on 2026-11-14. It follows the Unit 2 lessons design
(`2026-11-13-chemstudy-unit-2-lessons-design.md`), which said a second design
would convert the Unit 2 practice. It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes nothing in it.

The teacher chose "lessons, then practice" for Unit 2 on 2026-11-13, asked
for the work to go ahead without check-ins, and said "proceed" on
2026-11-14. Every decision below is one the teacher already made for Unit 5's
practice (Plan 3), applied to Unit 2. The one new piece is in section 4.

## 1. What is converted

| Order | Document | Source in `D:\AP_Chem_Prep\Units\unit02-compound-structure\` | Topics |
|---|---|---|---|
| 1 | Skill ladders (11 ladders, 44 questions) | `u02-selfstudy.tex` | 2.1 to 2.7 |
| 2 | Worksheet 1: Bonds, wells and lattices | `worksheets/u02-ws1.tex` | 2.1 to 2.4 |
| 3 | Worksheet 2: Lewis diagrams, formal charge and resonance | `worksheets/u02-ws2.tex` | 2.5, 2.6 |
| 4 | Worksheet 3: Shapes, angles and polarity | `worksheets/u02-ws3.tex` | 2.7 |
| 5 | Worksheet 4: One long free-response question | `worksheets/u02-ws4.tex` | 2.5 to 2.7 |
| 6 | Free-response set (5 questions, 32 points, 50 minutes) | `u02-frq.tex` | 2.1 to 2.7 |

The worksheet titles are the old ones in the site's sentence case. Each
document lives in `src/content/practice/unit-2/` and is served at
`/unit-2-compound-structure/practice/<name>/`.

## 2. What is not converted

- **The unit exam** (`exam/u02-exam.tex`). It stays a closed test, as Unit 5's
  does.
- **The unit map, the guided notes and the review sheet.** They belong to one
  class.
- **The "Quick review" strip** that ends each worksheet (`spiralstrip`). The
  teacher left it out of every practice document on 2026-11-13, for all units.
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept, as in Unit 5.

Unit 2 has no comprehensive test in the old course, so there is nothing to
replace.

## 3. How a document is made

Exactly as in Plan 3, whose conversion guide applies unchanged
(`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, "The
conversion guide"):

- **By hand, from the guide.** One writer per document reads the `.tex`
  (read-only) and writes the `.mdx`. It copies the chemistry and never
  corrects it. Wording is recast for a student anywhere: US spelling, no
  em dashes, nothing that points at a class or a sheet of paper.
- **Every question gets a "Show answer"** with the worked solution. Scored
  questions also get "Show scoring rubric". Nothing is typed or graded.
- **The audit** (`scripts/practice-audit.mjs`) compares each document with its
  source: numbers, formulas, parts, rubric lines and wording. Each difference
  is fixed or recorded with its reason.
- **An independent fact-check** of each document on Opus. It solves every
  question, checks every claim against the framework and the Unit 2 lessons,
  and compares the document with the key PDF in
  `D:\AP_Chem_Prep\build\Units\unit02-compound-structure\`.
- **Corrections to the old chemistry are made on the site**, since the MDX
  becomes the master copy. Each pull request lists them for the teacher to
  accept or reverse.
- **Answers use the lessons' terms.** For example, formal charge subtracts
  "nonbonding electrons", as lesson 2.6 says, where the old ladders say
  "lone-pair electrons".
- **"Beyond the exam"** labels anything the framework leaves out. The fact-check
  confirms each one. None is expected: the old material already keeps clear of
  the three Unit 2 exclusions (specific crystal structures, hybrid orbitals and
  d-orbital hybridization, molecular orbital diagrams).

## 4. New for Unit 2: drawn Lewis structures in the answers

The old keys describe a Lewis structure in words ("F–O–F; 2 lone pairs on O,
3 on each F"), because the paper key had no room for a drawing. The lessons
now have the Lewis block, which draws a structure at build time, checks its
electron count and works out formal charges.

- **Practice pages get the Lewis and Resonance blocks**, the same ones the
  lessons use.
- **Every answer to a "draw" question shows the drawn structure** under the
  source's words. That covers Worksheet 2 questions 1 and 4(a), Worksheet 4
  parts (b) and (c), and free-response question 1(a). The worked example of
  Ladder 6 (drawing $\ce{CO2}$ and $\ce{CO3^2-}$) gets its drawings too.
- **The drawings are the one deliberate addition** to the old answers. The
  audit is checked to ignore them, and the fact-check confirms each drawing:
  electron count, lone pairs, formal charges, brackets and charge.

## 5. Code

Small, and test-first:

1. The practice route's block list gains `Lewis` and `Resonance`.
2. The practice browser tests, written when only Unit 5 had practice, cover
   every unit that has practice, as `all-lessons.spec.ts` already does for
   lessons.
3. The audit gets a unit test proving a Lewis block adds no numbers or
   formulas. If that test fails, the audit learns to skip the block.

The Unit 2 lessons' "Practice next" lists the new documents with no change,
since it reads the practice collection.

## 6. Pull requests

Each stops for the teacher's merge, because a merge deploys.

| Pull request | Contents |
|---|---|
| A | This design and its plan |
| B | The code in section 5, and Worksheets 1 to 4 |
| C | The skill ladders, the free-response set and the close-out notes |

## 7. Done when

- The six documents are live, and each passes the browser and accessibility
  tests.
- Each audit ends with nothing unexplained.
- Each document has been fact-checked and every accepted finding fixed.
- Every drawn structure has been checked.
- No page scrolls sideways at 412, 390, 360 or 320 px with every answer open.
