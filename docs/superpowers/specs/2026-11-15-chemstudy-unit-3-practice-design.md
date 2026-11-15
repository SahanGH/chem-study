# ChemStudy: Unit 3 practice

Written on 2026-11-15. It follows the Unit 3 lessons design
(`2026-11-14-chemstudy-unit-3-lessons-design.md`) and adds to the main
design, `2026-11-12-chemstudy-redesign-design.md`, changing nothing in it.

When Unit 7 was finished, Claude asked the teacher what came next and named
Unit 3's practice and comprehensive test as the earlier assumption. The
teacher answered "Merge and proceed" (2026-11-15). Claude reads that as the
Unit 7 arrangement applied to Unit 3's practice and test: pull requests that
Claude merges itself once the "Build and test" check passes and the content
has been fact-checked. Every decision below is one the teacher already made
for the practice of Units 5, 2 and 7 (Plans 3, 6 and 10), applied to Unit 3.
What is new is in section 4.

## 1. What is converted

| Order | Document | Source in `D:\AP_Chem_Prep\Units\unit03-properties-substances\` | Topics |
|---|---|---|---|
| 1 | Skill ladders (14 ladders, 56 questions) | `u03-selfstudy.tex` | 3.1 to 3.13 |
| 2 | Worksheet 1: Forces, solids and phases | `worksheets\u03-ws1.tex` | 3.1 to 3.3 |
| 3 | Worksheet 2: Gases | `worksheets\u03-ws2.tex` | 3.4 to 3.6 |
| 4 | Worksheet 3: Solutions and concentration | `worksheets\u03-ws3.tex` | 3.7, 3.8 |
| 5 | Worksheet 4: Solubility and separation | `worksheets\u03-ws4.tex` | 3.9, 3.10 |
| 6 | Worksheet 5: Spectroscopy, and a free-response question | `worksheets\u03-ws5.tex` | 3.11 to 3.13 |
| 7 | Free-response set (5 questions, 32 points, 50 minutes) | `u03-frq.tex` | 3.1 to 3.13 |

The worksheets hold 29 questions between them, one of them scored (Worksheet
5's last, 10 points). Each document lives in `src/content/practice/unit-3/`
and is served at `/unit-3-substances-and-mixtures/practice/<name>/`.

## 2. What is not converted

- **The unit exam** (`exam\u03-exam.tex`). It stays a closed test.
- **The unit map, the guided notes and the review sheet.** They belong to one
  class.
- **The "Quick review" strip** that ends each worksheet (the teacher's
  decision of 2026-11-13, for all units).
- **The ladders' tick table** ("Where you stand"). The advice under it is
  kept, as in Units 5, 2 and 7.
- **Notes to the teacher or to a question writer**: the comments at the top
  of the ladders and the free-response set, "Grade it hardest", and the
  rubric note in free-response question 5 that says what not to ask.

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
- **The audit** (`scripts/practice-audit.mjs`) compares each document with its
  source: numbers, formulas, parts, rubric lines and wording. Each difference
  is fixed or recorded with its reason.
- **An independent fact-check** of each document by a fresh agent that
  solves every question before it reads the answer, checks every claim
  against the framework and the Unit 3 lessons, and compares the document
  with its key PDF in `D:\AP_Chem_Prep\build\Units\unit03-properties-substances\`.
- **Corrections to the old chemistry are made on the site**, since the MDX
  becomes the master copy. Each pull request lists them for the teacher to
  accept or reverse.
- **Answers use the lessons' terms**: "London dispersion forces",
  "dipole–dipole" and "ion–dipole" as lesson 3.1 names them, "dissolving", never "dissolution"; $R_f$ as lesson 3.9 writes it.

**Models.** The teacher's choice for this repository is Fable 5.2 for
writers and fact-checkers. Fable's usage limit was reached on 2026-11-15 and
resets on 2026-11-17; the teacher then switched the session to Opus and said
"resume". Until the limit resets, writers and fact-checkers run on Opus, as
the Unit 7 test's did, and each pull request says so. Fixers stay on Sonnet.

## 4. New for Unit 3

### 4.1 Sketches and drawings stay as questions to answer on paper

Three questions ask for a picture: Worksheet 2, 5(c) (two speed
distributions on one set of axes), Worksheet 3, question 4 (a particle
picture of 0.10 M MgBr₂) and Worksheet 5, 4(a) (absorbance against
concentration, with the line of best fit). The source prints an empty box
and its key describes the right picture in words. Each stays a question: the
student draws on paper, and the answer describes what the drawing must show,
as Unit 2's Worksheet 1 did for its sketched energy wells. Worksheet 5's
data become a Markdown table. No source has a figure, so **no code changes**.

### 4.2 Constants: the site's values

The site and the AP equation sheet give $c = 2.998 \times 10^{8}$ m/s;
Worksheet 5 and Ladder 13 use $3.00 \times 10^{8}$. They move to
$2.998 \times 10^{8}$. A script
(`scratchpad/unit3-practice/site-values.py`) shows that **no answer
changes** at the figures given (7.50 × 10¹⁴ s⁻¹, 4.97 × 10⁻¹⁹ J, 299 kJ/mol,
2.84 × 10⁻¹⁹ J, 471 kJ/mol). $h = 6.626 \times 10^{-34}$ J·s,
$R = 0.08206$ L·atm/(mol·K) and water's vapor pressure at 25 °C, 23.8 torr,
already agree with the lessons.

Worksheet 5's header says the equation sheet gives $E = h\nu$ "but not"
$\nu = c/\lambda$. The 2024 sheet lists $c = \lambda\nu$, so the sentence
goes and the introduction gives both relationships.

### 4.3 Ladder 6: one CO₂ for each NaHCO₃

Ladder 6's worked example says 5.00 g of sodium hydrogen carbonate
"decomposes" and that "each NaHCO₃ releases one CO₂". Heated, it gives one
CO₂ for every **two** NaHCO₃ (2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂). The document
never writes the equation. With an acid, one NaHCO₃ does give one CO₂:

$$
\ce{NaHCO3 + HCl -> NaCl + H2O + CO2}
$$

So the example says the sample **reacts with excess hydrochloric acid** and
writes this equation. Every number of the ladder stays (0.0595 mol, 1.46 L,
1.33 L at STP), except the check "9 percent low", which the script gives as
8.4 percent: it becomes "about 8 percent". The pull request lists this for
the teacher.

### 4.4 Beyond the exam

The 2024 framework does not include effusion, the root-mean-square speed or
the photoelectric effect, and the Unit 3 lessons teach none of them (lesson
3.5 labels the root-mean-square speed "Beyond the exam"). So:

- **Ladder 8**: the effusion step of the worked example opens with
  "**Beyond the exam:**", and Your turn (a) and (b), effusion-rate ratios,
  carry `beyond`.
- **Worksheet 2, 5(b)**: the question (which gas moves faster, and why) is
  on the exam; the answer's formula $u_{rms} = \sqrt{3RT/M}$ is set apart as
  a "Beyond the exam" sentence.
- **Ladder 13, (d)** (light of double intensity and electrons leaving a
  metal) carries `beyond`.

Not labeled, because the framework and the lessons include them: mole
fraction and $P_A = P_{\text{total}} \times X_A$ (lesson 3.4, on the equation
sheet), $R_f$ (lesson 3.9), the molar volume of 22.4 L at STP (lesson 3.4).

The three exclusions of Unit 3 (reading phase diagrams; colligative
properties; molality, percent by mass and percent by volume) are asked
nowhere. The ladders' and the free-response set's scope notes become one
sentence each.

The fact-check confirms each label and looks for anything else the
framework leaves out.

### 4.5 Material from other units

Units 4, 6 and 8 are not on the site.

- **Ladder 4** (heating curves; 2260 J/g and 334 J/g for water) is energy of
  phase changes, topic 6.5. The ladder stays, tagged 3.3 as in the source,
  and its opening says that the energy side of phase changes is topic 6.5.
- **Ladder 12** contrasts a weak acid (HF, mostly molecules) with a strong
  one (HCl, all ions), which Unit 8 teaches. It stays, and says so in words.
- **Free-response question 1** starts from zinc and hydrochloric acid (the
  stoichiometry of Unit 4), as gas stoichiometry in topic 3.4 does. No
  change.

### 4.6 Wording particular to Unit 3

- "Zumdahl reports these boiling points" (Worksheet 1, question 3) becomes
  "These are the measured boiling points".
- "Assembled from seven different places in the textbook" goes. "This unit
  is worth 18 to 22 percent of the AP exam" stays: it is true, and it is the
  heaviest unit.
- The ladders print their questions as 1 to 4 and key them as (a) to (d):
  on the site they are parts a to d, as in every unit's ladders.

## 5. Code

None is expected. The practice route, the audit and the browser tests
already cover every unit that has practice. A rubric line without a part,
needed for Worksheet 5's point for units and significant figures, is already
allowed (`RubricLine`'s `part` is optional). The Unit 3 lessons' "Practice
next" lists the new documents by their topics with no change.

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
- Every constant agrees with the lessons.
- No page scrolls sideways at 412, 390, 360 or 320 px with every answer open.

## As built (Plan 12, 2026-11-15)

Seven documents in three pull requests:
- #44: the design and plan.
- #45: the worksheets. Five worksheets, 29 questions, one of them scored (10 points).
- The third: the ladders and the free-response set. Fourteen ladders with 56 parts; a free-response set of 5 questions, 16 parts and 32 points.

- **Models.** Every document was fact-checked twice on Opus, not Fable: Fable's usage limit ran until 2026-11-17. Each check was by a fresh agent that solved every question before reading its answer. Fixers ran on Sonnet.
- **Few final answers were wrong.** Worksheet 3's 15.96 g was 16.0 g, and Ladder 14(b)'s 0.300 needed a three-figure concentration. Most of what the checks found was in the originals' data and explanations. Each pull request lists them for the teacher:
  - **Data:** ammonia's boiling point; the molar mass and mass of CuSO₄; significant figures in Ladders 7 and 14.
  - **Explanations:** absorbance defined as transmittance; Ladder 2's "compare force type first", which lesson 3.1 calls a trap; "only" claims that left out a force.
- **Section 4 went as designed**, with three additions:
  - Worksheet 1's question 6 uses pentane for hexane, since real hexane breaks the vapor-pressure rule.
  - The free-response set tests 3.2 and not 3.7, so its topics say so.
  - Ladder 13(b)'s intermediate value moved from 7.83 to 7.82 with the new c. The design said no answer changes, which holds for every final answer.
- **"Only" is a word to check.** Five findings across the documents were a list called complete that was not, or a rule stated as "only". Fact-check briefs for later units should ask for this by name.
- **No code changed** (section 5).
