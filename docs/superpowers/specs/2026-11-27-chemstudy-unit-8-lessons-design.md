# ChemStudy: Unit 8 lessons

Written on 2026-11-27, against `main` at `aa87fd8` (the merge of pull request
#86, with which Unit 6 is complete). It adds to the main design, `2026-11-12-chemstudy-redesign-design.md`,
and changes nothing in it. It follows the Unit 6 lessons
(`2026-11-27-chemstudy-unit-6-lessons-design.md`), whose pipeline it repeats
and whose "As built" section it builds in, the Unit 4 lessons
(`2026-11-16-chemstudy-unit-4-lessons-design.md`) and the check feedback
design (`2026-11-26-chemstudy-us-english-and-unit-1-check-feedback-design.md`).

## 1. What the teacher decided

| Question | Decision |
|---|---|
| Unit 8 | Acids and Bases, topics 8.1 to 8.11, asked for on 2026-11-27 "the same as was done for Unit 6, end to end" |
| Scope | This design covers the eleven lessons and their diagrams. The practice converted from the teacher's materials and a comprehensive test each get their own design and plan, as for Unit 6. |
| Merging | **Claude merges.** The teacher said to merge every Unit 8 pull request when its check passes. Each pull request is merged when "Build and test" passes, and lists Claude's calls for the teacher to change afterward. |
| The old course | The teacher's Unit 8 materials are read from the teacher's `AP_Chem_Prep` repository (the unit folder and chapters 14, 15 and the pH part of 16), as a reference for coverage and emphasis and as a list of what not to repeat. The unit exam and the chapter exams were not opened. |
| Models | Several, by task (section 7), as for Unit 6. |

**Three things the building session cannot do**, and what stands in their
place:

- **Read the framework's printed pages.** The College Board's site is blocked
  in the session, and `AP_Chem_Prep` does not hold the PDF. Section 3 is
  written from Claude's knowledge of the 2024 framework
  (`scratchpad/ced/unit8-framework.md`), checked against what the teacher's
  unit map and question-set headers say about scope. **The teacher is asked
  to compare section 3 with the framework**, above all the table "What is
  not sure" there. If a statement is wrong, the lesson that rests on it is
  corrected in a follow-up pull request.
- **Read a textbook.** No list of any textbook's examples could be made.
  Originality is checked against the teacher's Unit 8 and chapter materials
  and against the site's own lessons and practice, and against nothing
  else. The stock examples of textbooks in general are listed from knowledge
  and kept out (section 4).
- **Look up a reference value.** Every $K_a$, $K_b$, p$K_a$, $K_w$ and
  $K_{sp}$ in this unit, and every indicator's range, is written from
  memory. Each is judged by two independent checkers (the fact-check of the
  briefs and the fact-check of the finished lesson), neither of which sees
  the other's work. A value both confirm to the figures printed stands. A
  value on which they differ, or which neither can confirm, is listed for
  the teacher in the pull request that uses it and again in "As built".

**Claude's calls, for the teacher to confirm or change:**

- **H₃O⁺ in every equation and expression.** The framework prefers H₃O⁺(aq)
  and accepts H⁺(aq); the equation sheet prints H⁺. Every Unit 8 lesson
  writes H₃O⁺, with water in the equation, as lesson 4.8 does and as the
  site's own equation page does. Lesson 8.1 says once that the exam's sheet
  writes H⁺ for the same ion and that either is accepted (section 3).
- **Brønsted–Lowry is not taught again.** Lesson 4.8 has the definitions,
  conjugate pairs and water acting as both. Lesson 8.1 starts from them in
  three sentences and goes to $K_w$, pH and pOH, which is what the
  framework's topic 8.1 holds.
- **Salt solutions are in lesson 8.4**, as the "equal moles" case of a weak
  acid with a strong base, with the pH calculated. The teacher's notes put
  salts under 8.7; the framework's 8.7 is the comparison of pH with p$K_a$
  and the indicators.
- **Lesson 8.4 finds a buffer's pH from the $K_a$ expression**, as
  $[\ce{H3O+}] = K_a \times$ (moles of acid ÷ moles of base). The
  Henderson–Hasselbalch equation is first written in lesson 8.9, as the
  same statement in logarithms.
- **The small-x check is the site's own, from topic 7.7:** leave $x$ out,
  then divide $x$ by the starting concentration and compare with 5 percent.
  The framework sets no number, and the lessons say so (section 3).
- **The pH after an addition to a buffer is calculated once, in a worked
  example of lesson 8.10**, and no Check asks for it (section 3 says why).
- **The derivation of the Henderson–Hasselbalch equation is two lines under
  a "Beyond the exam" label** in lesson 8.9.
- **Three interactive diagrams** (section 6): a weak-acid explorer in lesson
  8.3, a titration-curve explorer in lesson 8.5 (placed a second time in
  lesson 8.7, for the indicators) and a buffer explorer in lesson 8.10. All
  three take their pH from one shared, tested solver.
- **The titration-curve explorer titrates the flask of lesson 4.6's
  diagram**: 20.0 mL of 0.150 M lactic acid with 0.200 M NaOH. Lesson 4.6
  showed where the acid runs out; lesson 8.5 shows the pH on the way.
- **The explorers solve the full equilibrium.** Their pH can differ in the
  second decimal place from the shortcut a student uses by hand. Where a
  lesson quotes an explorer's number, it quotes the explorer's, and the
  weak-acid explorer shows both and says which is which.
- **The acids and bases** (section 3, "Values") are real, and none of the
  teacher's most-used number sets is among them: no calculation uses
  acetic acid, ammonia, or hydrofluoric, hydrocyanic, nitrous or
  hypochlorous acid. Of the four indicators of the teacher's table only
  bromothymol blue appears, because lesson 4.6 already uses it.
- **Polyprotic acids appear once**, as a titration curve read in words in
  lesson 8.5. No pH of a polyprotic acid is calculated.
- **A typed pH is accepted within about 0.02 of a pH unit**, not within the
  page's usual 2 percent (section 5).

## 2. What students get

Eleven lessons, one per topic of the 2024 framework. The file names follow
the topic titles in `src/data/units.ts`; the folder is
`src/content/lessons/unit-8/`.

| Topic | Lesson and file | What it carries | What it leaves to another lesson | Minutes |
|---|---|---|---|---|
| 8.1 | Introduction to Acids and Bases, `8-1-introduction-to-acids-and-bases.mdx` | H₃O⁺ and H⁺ as two names for one ion; water's reaction with itself and $K_w$; pH and pOH as logarithms, with each unit a factor of ten; pH + pOH = 14.00 at 25 °C; neutral as $[\ce{H3O+}] = [\ce{OH-}]$; why neutral is not pH 7 at another temperature | Proton transfer and conjugate pairs (4.8, already taught); the pH of an acid from its concentration (8.2, 8.3) | 14 |
| 8.2 | pH and pOH of Strong Acids and Bases, `8-2-ph-and-poh-of-strong-acids-and-bases.mdx` | Complete ionization; the strong acids and strong bases, as lesson 4.2 lists them; $[\ce{H3O+}]$ straight from the concentration; counting the hydroxide ions in a formula unit; pOH first for a base, then pH; from a pH back to a concentration; what a tenfold dilution does | An acid mixed with a base (8.4); weak acids (8.3) | 14 |
| 8.3 | Weak Acid and Base Equilibria, `8-3-weak-acid-and-base-equilibria.mdx` | $K_a$ and p$K_a$; the ICE table of topic 7.7 with $K_a$; leaving $x$ out and checking it; percent ionization and what dilution does to it; $K_a$ from a measured pH; a weak base, $K_b$, and pOH before pH; $K_a \times K_b = K_w$ for a conjugate pair | The pH of a solution of a conjugate base alone (8.4); why one acid is stronger than another (8.6); comparing a pH with a p$K_a$ (8.7) | 20 |
| 8.4 | Acid–Base Reactions and Buffers, `8-4-acid-base-reactions-and-buffers.mdx` | React first, in moles, then see what is left: a strong acid with a strong base; a weak acid with a strong base and its three outcomes; a weak base with a strong acid; a weak acid with a weak base as an equilibrium; the first meeting with a buffer; why a solution of a salt can be acidic or basic | The whole curve (8.5); why a buffer holds its pH (8.8); the equation in logarithms (8.9) | 20 |
| 8.5 | Acid–Base Titrations, `8-5-acid-base-titrations.mdx` | The titration curve; the equivalence volume from moles (4.6); the four stretches of a weak acid's curve; pH = p$K_a$ at the half-equivalence point; why the equivalence point of a weak acid is above pH 7; strong against weak on one graph; a weak base titrated with a strong acid; a curve with two rises, read in words | Why an indicator changes where it does (8.7) | 20 |
| 8.6 | Molecular Structure of Acids and Bases, `8-6-molecular-structure-of-acids-and-bases.mdx` | Which hydrogen of a molecule is acidic; a stable conjugate base means a stronger acid; what stabilizes it: an electronegative atom, electron-withdrawing neighbors, charge spread by resonance; carboxylic acids; binary acids down a group; oxyacids; why a nitrogen atom or a carboxylate ion is a base | Numbers for these acids beyond a p$K_a$ to compare (8.3) | 15 |
| 8.7 | pH and pKa, `8-7-ph-and-pka.mdx` | Comparing the pH of a solution with the p$K_a$ of an acid to say which form has the higher concentration; equal at pH = p$K_a$, ten to one a unit away; an indicator as a weak acid whose two forms differ in color; choosing an indicator for a titration | The equation that gives the ratio exactly (8.9) | 15 |
| 8.8 | Properties of Buffers, `8-8-properties-of-buffers.mdx` | What a buffer is made of; the two reactions that use up added acid and added base; why the pH barely moves; what is not a buffer; that a buffer works until one of its two members runs out | The pH of a buffer as a number (8.9); how much it can take (8.10) | 13 |
| 8.9 | Henderson–Hasselbalch Equation, `8-9-henderson-hasselbalch-equation.mdx` | pH from p$K_a$ and the ratio of base form to acid form; moles in place of concentrations; the ratio for a wanted pH; a buffer made from a weak base, using the p$K_a$ of its conjugate acid; why a small addition changes the pH little | How much acid or base a buffer can take (8.10) | 15 |
| 8.10 | Buffer Capacity, `8-10-buffer-capacity.mdx` | The ratio sets the pH and the amounts set the capacity; two buffers with the same pH and different capacities; more acid form than base form means more room for added base, and the reverse; what happens when a member is used up; choosing a conjugate pair for a wanted pH | Nothing: the unit's last calculation | 17 |
| 8.11 | pH and Solubility, `8-11-ph-and-solubility.mdx` | A salt whose anion is a weak base dissolves better in acid, by Le Châtelier's principle; a salt whose anion comes from a strong acid does not; a hydroxide and pH, both ways; $K_{sp}$ does not change | $K_{sp}$ and the common-ion effect (7.11, 7.12, already taught) | 12 |

The minutes are targets for the briefs. Each lesson's `minutes` is set from
its real length when it is written, between 9 and 22 (Unit 6's lessons came
out at 15 to 20, longer than their briefs guessed).

Each lesson is built like the lessons of the other units, with the same
blocks and the same voice, and ends with `PracticeNext`.

**As in Unit 6, from the first draft:** every Check with options carries a
message for each wrong option, and every typed-number Check carries its
slips (`misses`, `slips`), under the rules of the check feedback design.
Unit 8 goes on the build's feedback list with its first lessons, and on the
balance test when all eleven are in.

**What the lessons can lean on.** Proton transfer, hydronium, conjugate
pairs, and the rule that the stronger acid has the weaker conjugate base
(4.8); strong and weak acids and bases and net ionic equations (4.2);
titrant, analyte, equivalence point, endpoint and millimoles (4.6); the
equilibrium constant, $Q$ against $K$, and adding equations (7.3, 7.6, 7.10);
the ICE table and the small-x approximation with its check (7.4, 7.7);
Le Châtelier's principle (7.9); $K_{sp}$ and the common-ion effect (7.11,
7.12); electronegativity (1.7), resonance (2.6) and particle drawings of
solutions (3.8). A lesson names such a topic in plain text. Unit 9 is not on
the site and nothing in Unit 8 needs it.

**Promises the site has already made, which these lessons keep:**

| Where | What it says | Kept by |
|---|---|---|
| Lesson 4.2, line 191 | The strong acids and strong bases; "Topic 8.2 returns to them" | Lesson 8.2 uses the same two lists |
| Lesson 4.6, line 34 | Lactic acid is weak, with only a small part as ions (topic 8.3) | Lesson 8.3 puts a number on "a small part"; lesson 8.5 titrates lactic acid |
| Lesson 4.6, the paragraph before its key idea | How the acidity of the flask changes, and how an indicator is chosen, "belong to topics 8.5 and 8.7" | The titration-curve explorer in 8.5 and again in 8.7 |
| Lesson 4.8, line 41 | "Topics 8.2 and 8.3 put numbers on this" | Lessons 8.2 and 8.3 |
| Lesson 4.8, line 176 | HPO₄²⁻ helps to hold the acidity inside a cell steady | Lesson 8.8's buffer is H₂PO₄⁻ with HPO₄²⁻ |
| Lesson 7.9, line 287 | The higher the concentration of H⁺, the lower the pH (Unit 8) | Lesson 8.1 |
| `src/lib/titration.ts`, lines 15 to 17 | pH and the titration curve belong to topic 8.5 | The new explorer; the Unit 4 diagram is not changed |
| The equation page, lines 183 to 241 | $K_w$, pH and pOH point to 8.1; $K_a$, $K_b$, p$K_a$, p$K_b$ and $K_w = K_a \times K_b$ to 8.3; Henderson–Hasselbalch to 8.9 | Each is taught in the lesson its pointer names |

## 3. Staying inside the framework

**Read section 1 first: this section is written from knowledge of the 2024
framework, not from its pages** (`scratchpad/ced/unit8-framework.md` holds
the full summary the briefs are written from).

Lessons are written fresh from the framework's learning objectives and
essential knowledge. **No textbook is used.**

**The teacher's materials** are read by an inventory agent, not by the
writers. Each brief carries what the notes stress, in other words than the
notes', and the unit map's list of where students lose points:

- the pOH of a weak base reported as its pH;
- the hydroxide ions of Ba(OH)₂, Ca(OH)₂ or Sr(OH)₂ counted once;
- the small-x check asserted and not shown;
- a strong base put into an ICE table when it should first react to
  completion, in moles;
- the ratio of the Henderson–Hasselbalch equation turned upside down;
- the equivalence point of a weak acid taken to be at pH 7;
- a solubility calculated from a pH, which topic 8.11 does not ask for.

The notes' one organizing idea, that the first job in any problem is to say
what is in the solution before choosing a method, is carried by lesson 8.4
in the site's own words and its own picture.

**What the framework leaves out of Unit 8** (two statements, as Claude knows
it):

| Topic | Not assessed | In the lessons |
|---|---|---|
| 8.5 | Computing the concentration of each species along the titration curve of a polyprotic acid | Lesson 8.5 reads such a curve in words: how many rises, which form is the main one in each stretch, which p$K_a$ belongs to which proton. One "Beyond the exam" sentence says that the concentrations are not asked for. |
| 8.11 | Computing a solubility as a function of pH | Lesson 8.11 predicts the direction and gives the reason. No number is calculated, and a "Beyond the exam" sentence says so. |

**What is not sure, and how each lesson is built so that either reading is
safe.** The framework summary lists what its writer could not vouch for.
The teacher is asked to check each row against the printed pages.

| What is unsure | How the lessons handle it |
|---|---|
| Whether deriving the Henderson–Hasselbalch equation is a stated exclusion. The teacher's question-set headers say it is; the summary's writer does not remember it. | Lesson 8.9 gives the two lines that turn the $K_a$ expression into the equation under a "Beyond the exam" label, and no Check asks for them. Right under either reading. |
| Whether computing the change in pH when acid or base is added to a buffer is a stated exclusion (the teacher's headers say so, and say that the pH of a mixture made from a weak acid and a strong base is assessed under 8.4). | The pH of such a mixture is taught and asked in lesson 8.4. Lesson 8.10 works one addition to a ready-made buffer, because "the ratio barely changes" needs a number to be believed, and says in a "Beyond the exam" sentence that the exam does not ask for this as a calculation. The Checks of 8.8 to 8.10 ask for the reactions, the direction, a comparison of two buffers, the ratio and the pH of a buffer as made. The buffer explorer shows the pH after an addition and asks for no arithmetic. |
| Whether the framework says anything about a 5 percent rule or the quadratic formula. The summary says it does not. | The lessons call the 5 percent line "the check this site uses (topic 7.7)", never a rule of the exam. They say that exam questions are written so that $x$ is small, and that a question asking to justify the shortcut wants the percentage shown. Every calculation a student is asked to do passes the check. One Check asks the student to see that it fails; the quadratic formula is named in a "Beyond the exam" sentence that points back to topic 7.7, where the site already shows it once. |
| Whether the calculation of the pH of a salt solution is in scope. The summary says it is, as the equal-moles case of 8.4. | Taught in lesson 8.4 and used at the equivalence point in lesson 8.5. |
| Whether topic 8.11 is in Unit 8 (it was 7.13 before 2024). | `src/data/units.ts` already has it as 8.11 and Unit 7 as twelve topics, and the lesson is built as 8.11. If the printed framework differs, the lesson moves in a follow-up. |
| Whether the statement about indicators sits in 8.7 or in 8.5. | Both lessons touch it: the explorer in 8.5 lays an indicator's range over the curve, and lesson 8.7 explains why the range is where it is. |
| Whether the framework sorts out the slightly soluble group 2 hydroxides. | The strong bases are the list of lesson 4.2: the group 1 hydroxides and Ca(OH)₂, Sr(OH)₂ and Ba(OH)₂. Calcium hydroxide's concentrations stay below what dissolves (about 0.02 M). |
| The exact layout of the equation sheet. | The lessons say what the sheet gives in substance (below) and print no picture of it. |
| The Lewis exclusion (believed to sit under 4.8). | Unit 8 is Brønsted–Lowry throughout and does not mention Lewis acids. Lesson 4.8 already has the sentence. |
| Statement codes, statement counts and the science practices paired with each topic. | No lesson cites a code or a practice. |

**Things the framework does not name but the exam uses**, taught without a
"Beyond the exam" label:

- the factor of two for the hydroxide ions of a group 2 hydroxide (8.2);
- the ICE table and the small-x approximation for a weak acid (8.3), which
  the framework's Unit 7 gives the lessons;
- percent ionization as $[\ce{H3O+}]$ at equilibrium over the starting
  concentration (8.3): the framework asks for it and the sheet has no
  formula;
- "react first, in moles, then let what is left come to equilibrium" (8.4),
  with a table of moles before and after;
- the words "half-equivalence point" and "buffer region" (8.5);
- an indicator's range as roughly its p$K_a$ plus or minus one (8.7);
- bond strength as the reason the binary acids strengthen down a group
  (8.6), which the framework's list of stabilizing effects does not name;
- that a buffer works best within about one pH unit of its p$K_a$ (8.9,
  8.10).

**Left out of the lessons:** Lewis acids and bases; the Arrhenius
definition by name; the leveling effect; activity and ionic strength; the
pH of a polyprotic acid, of an amphiprotic salt, or of a weak acid mixed
with a weak base, as calculations; the pH of sulfuric acid; very dilute
solutions where water's own ions count, beyond one sentence in lesson 8.2;
titrations of a weak acid with a weak base; back-titration and indicator
error; complex ions and amphoteric hydroxides; oxides as acids and bases;
precipitation by $Q$ against $K_{sp}$ (topic 7.11 has it); a list of
indicators to memorize.

**The equation sheet** gives, for this unit: the $K_a$ and $K_b$
expressions; $K_w = [\ce{H+}][\ce{OH-}] = 1.0 \times 10^{-14}$ at 25 °C and
$K_w = K_a \times K_b$; pH and pOH as negative logarithms; 14 = pH + pOH;
the Henderson–Hasselbalch equation; p$K_a$ and p$K_b$. It writes H⁺ where
the lessons write H₃O⁺. It gives no formula for percent ionization, no
statement that pH = p$K_a$ at the half-equivalence point, no relation for
the equivalence point, no list of strong acids and bases, no value of any
$K_a$, $K_b$ or p$K_a$, no indicator table and no quadratic formula.
Lessons say so where it matters.

**The conventions of the unit.**

- **H₃O⁺.** Every ionization is written with water and hydronium:
  $\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}$. Expressions use
  $[\ce{H3O+}]$. A strong acid with a strong base is
  $\ce{H3O+(aq) + OH-(aq) -> 2H2O(l)}$, and lesson 8.4 says that this is
  the $\ce{H+(aq) + OH-(aq) -> H2O(l)}$ of lesson 4.2, "one reaction,
  written two ways" as lesson 4.8 put it. Prose and Check messages write
  H₃O⁺ in plain characters.
- **Arrows and state symbols.** Every equation carries state symbols. A
  weak acid or base with water takes the double arrow. A strong acid in
  water, and any reaction with a strong acid or a strong base as a
  reactant, takes the single arrow. Water is (l) and is left out of every
  $K$ expression, as topic 7.3 leaves out a pure liquid.
- **$K_w$ and neutral.** $K_w = 1.0 \times 10^{-14}$ and pH + pOH = 14.00
  hold at 25 °C, and every question is at 25 °C unless it gives another
  $K_w$. Neutral means $[\ce{H3O+}] = [\ce{OH-}]$. Lesson 8.1 works one
  other temperature and its Checks use a second, so that "pH 7" is learned
  as a fact about 25 °C.
- **The figures of a pH.** The digits after the decimal point of a pH are
  its significant figures: a concentration with two significant figures
  gives a pH with two decimal places. The unit's $K_a$ values have two
  figures, so its pH values are written to two decimal places, and a
  concentration found from such a pH has two figures. Lesson 8.1 teaches
  this once; every lesson follows it.
- **Logarithms.** Lesson 8.1 gives the three facts the unit uses: the
  logarithm of a product is a sum, so $-\log(a \times 10^{-b})$ lies
  between $b - 1$ and $b$; $[\ce{H3O+}] = 10^{-\text{pH}}$; one pH unit is a
  factor of ten. "p" in front of anything means "minus the logarithm of".
- **The ICE table on a phone** follows topic 7.7: a Markdown table with an
  empty first header cell, one column for each species in the $K$
  expression (three for a weak acid: HA, H₃O⁺, A⁻), rows I, C and E, every
  value in M, said in the sentence above the table. Water has no column.
  The starting $[\ce{H3O+}]$ is written as 0, and lesson 8.3 says once that
  water's own $1.0 \times 10^{-7}$ M is too small to matter there. Where a
  formula is too long for a cell, the sentence above the table defines HA
  and A⁻, or B and HB⁺, and the table uses those.
- **The table of moles** for a reaction that goes to completion (8.4, 8.5,
  8.10) is a second, different table: rows Before, Change and After, values
  in millimoles, no $x$ in it. The lessons never call it an ICE table, and
  say why: nothing in it is at equilibrium yet.
- **The small-x approximation** is worded as topic 7.7 worded it: leave $x$
  out only where it is subtracted from a much larger number, then check it
  every time by dividing $x$ by the starting concentration; under 5 percent
  is good, and the percentage is written down as part of the answer. Lesson
  8.3 adds what is special to a weak acid alone: the check and the percent
  ionization are the same number. On "when is it allowed", the lessons say
  what topic 7.7 says: what decides is how large the starting concentration
  is beside $K$, there is no cutoff worth memorizing, so always check.
- **Never $M_aV_a = M_bV_b$.** Titration amounts go through moles and the
  balanced equation, with millimoles as milliliters times molarity, as in
  lesson 4.6.
- **$K_a \times K_b = K_w$ is for a conjugate pair only**: the $K_b$ is that
  of the acid's own conjugate base. Lesson 8.3 shows why by adding the two
  equations (topic 7.6).
- **Terms.** "Ionization" for a weak acid or base reacting with water, not
  "dissociation"; "percent ionization"; "conjugate acid–base pair" as in
  lesson 4.8; "equivalence point" and "endpoint" (one word) exactly as
  lesson 4.6 defines them; "half-equivalence point" for the point at half
  the equivalence volume; "buffer" for a solution holding large amounts of
  both members of a conjugate pair; "buffer capacity" for the amount of
  strong acid or base a buffer can take before its pH changes sharply;
  "acid form" and "base form" for the two members of a pair. The lessons
  do not use "hydrolysis" or "ICF table".
- **A base's buffer and a base's indicator use the p$K_a$ of the conjugate
  acid.** The lessons never ask a student to put a p$K_b$ into the
  Henderson–Hasselbalch equation.

**Values.** A question gives every $K_a$, $K_b$ or p$K_a$ it needs, as the
exam does. All are for 25 °C and all are written from memory (section 1).
One value per quantity across the unit. Where a lesson gives a $K_a$ and
another gives the p$K_a$ of the same acid, each is the tabulated value, rounded, the
briefs' scripts check that the two agree within 0.02 in the p$K_a$, and a
lesson never prints both for one acid unless one is calculated from the
other on the page.

| Substance | Value the unit uses | Where | How sure |
|---|---|---|---|
| Water | $K_w$ = 1.0 × 10⁻¹⁴ at 25 °C; 2.9 × 10⁻¹⁵ at 10 °C; 2.9 × 10⁻¹⁴ at 40 °C | 8.1 | sure; fairly sure of the other two |
| Chloroacetic acid, HC₂H₂ClO₂ | $K_a$ = 1.4 × 10⁻³ (p$K_a$ 2.85) | 8.3 explorer, 8.6 | sure |
| Formic acid, HCHO₂ | $K_a$ = 1.8 × 10⁻⁴; p$K_a$ 3.75 | 8.3 explorer; 8.9, 8.10 | sure |
| Glycolic acid, HC₂H₃O₃ | $K_a$ = 1.5 × 10⁻⁴; p$K_a$ 3.83 | 8.3; 8.9 | fairly sure |
| Lactic acid, HC₃H₅O₃ | p$K_a$ 3.86 | 8.5 explorer | sure |
| Hexanoic acid, HC₆H₁₁O₂ | $K_a$ = 1.3 × 10⁻⁵ (p$K_a$ 4.88); dissolves to about 0.09 M | 8.4 | fairly sure |
| Hydroxylamine, NH₂OH | $K_b$ = 1.1 × 10⁻⁸ (tables give the p$K_a$ of NH₃OH⁺ as 5.94 to 5.96) | 8.4 | fairly sure |
| Sorbic acid, HC₆H₇O₂ | p$K_a$ 4.76 | 8.7 | fairly sure |
| Butanoic acid, HC₄H₇O₂ | $K_a$ = 1.5 × 10⁻⁵ | 8.3 explorer | fairly sure |
| Propanoic acid, HC₃H₅O₂ | p$K_a$ 4.87 | 8.5, 8.10 explorer | sure |
| Acetic acid and its fluoro-, bromo- and iodo- relatives | p$K_a$ 4.76; 2.59; 2.90; 3.18 | 8.6 only, as a series | sure of acetic; fairly sure of the rest |
| Iodic acid, HIO₃ | $K_a$ = 0.17 | 8.3 | fairly sure |
| Phenol, C₆H₅OH | $K_a$ = 1.0 × 10⁻¹⁰ | 8.3 | fairly sure |
| Dihydrogen phosphate ion, H₂PO₄⁻ | p$K_a$ 7.21 | 8.8, 8.10 | sure |
| An acid the lesson calls H₂A and says is made up | p$K_{a1}$ 3.00, p$K_{a2}$ 8.00 | 8.5 figure | chosen, not measured (section 11) |
| H₂S, H₂Se, H₂Te | p$K_{a1}$ 7.0, 3.9, 2.6 | 8.6 | fairly sure |
| Pyridine, C₅H₅N | $K_b$ = 1.7 × 10⁻⁹ (p$K_a$ of C₅H₅NH⁺ 5.23) | 8.8, 8.9 | sure |
| Ethanolamine, HOC₂H₄NH₂ | $K_b$ = 3.2 × 10⁻⁵ (p$K_a$ of its conjugate acid 9.50) | 8.3 | sure |
| Methylamine, CH₃NH₂ | p$K_a$ of CH₃NH₃⁺ 10.64 | 8.5 | fairly sure |
| Trimethylamine, (CH₃)₃N | $K_b$ = 6.3 × 10⁻⁵; p$K_a$ of (CH₃)₃NH⁺ 9.80 | 8.3; 8.7 | fairly sure |
| Tris, the laboratory buffer base | p$K_a$ of its conjugate acid 8.07 | 8.9, 8.10 | sure |
| Bromocresol green | yellow to blue over pH 3.8 to 5.4 | 8.5 and 8.7 explorer | sure of the range |
| Bromothymol blue | yellow to blue over pH 6.0 to 7.6, as in lesson 4.6 | 8.5 and 8.7 explorer | sure |
| Thymol blue, its second change | yellow to blue over pH 8.0 to 9.6 | 8.5 and 8.7 explorer | sure of the range |
| SrF₂, AgI, TlCl | the $K_{sp}$ values of lesson 7.11's table | 8.11 | as lesson 7.11 |
| Nickel(II) hydroxide; calcium oxalate | $K_{sp}$ 5.5 × 10⁻¹⁶; 2.3 × 10⁻⁹ (neither is calculated with) | 8.11 | fairly sure |

Atomic masses are the AP exam table's (`src/data/elements.ts`). The six
p$K_a$ values of the teacher's data strip (3.14, 3.40, 4.74, 7.46, 9.21,
9.25) do not appear.

## 4. Keeping the lessons original

- **Avoid lists before any brief is written** (`scratchpad/unit8/`): every
  example, substance set, number set and scene of the teacher's Unit 8 and
  chapter materials, and every acid, base, titration and equilibrium
  example the site's Units 1 to 7 already use. The brief-writers get the
  lists, never the sources.
- **The lesson table** (`scratchpad/unit8/lesson-table.md`) gives each
  lesson its own substances and numbers before any brief is written, so
  that no two lessons share a number set. In Unit 6 this was found
  afterward, by the originality checks, which replaced about twenty scenes.
- **The stock examples of textbooks are out**, among them: 0.10 M acetic
  acid at pH 2.87 and 0.10 M ammonia at pH 11.13; hydrofluoric acid with
  sodium fluoride; hydrocyanic, nitrous and hypochlorous acid as the
  weak-acid set; an acetate buffer taking 0.010 mol of HCl or NaOH against
  the same in pure water; the carbonic acid buffer of blood; aspirin in the
  stomach; vinegar titrated with NaOH to a phenolphthalein endpoint; HCl
  with NaOH as the strong-acid curve; phenolphthalein, methyl orange and
  methyl red as the indicators; red cabbage juice and litmus; a pH scale
  lined with lemon juice, vinegar, milk, baking soda and bleach; pure water
  at 37 °C, 50 °C or 60 °C; antacids and stomach acid; acid rain on marble,
  limestone caves and stalactites; tooth enamel and fluoride; calcium
  carbonate, magnesium hydroxide, silver chloride and calcium fluoride for
  pH and solubility; HF as "the weak one" among the hydrogen halides, and
  the chlorine oxyacids from HClO to HClO₄.
- **Every scenario is searched for** in both lists before it is used, and
  every replacement gets the same search. **A replacement must be a true
  example of the idea**: Unit 6 refused one that was not.
- **The finished prose is checked again** for originality, per group.
- After each round the unit's lessons are compared with one another for a
  scene used twice and for a Check that another lesson answers.

Some things cannot be new. $K_w$, the definitions of pH and pOH, the $K_a$
expression, the four stretches of a titration curve and the two reactions
of a buffer are what they are, and so are the trends of acid strength. The
lessons state them in their own words, with their own substances around
them: the hydrides of group 16 where the teacher's notes use the hydrogen
halides, the haloacetic acids where they use the chlorine oxyacids. Sodium
hydroxide is the titrant because it is the titrant.

## 5. Checks that test something

As for Unit 6:

- A Check is an application. It is never answered by the sentence, caption
  or key idea just above it.
- The answer sits at each of the four positions in 15 to 35 percent of the
  unit's Checks with options, and is not the longest option.
- Every wrong option has a message, and every typed-number Check has its
  slips. A message names the likely mistake or the thing to check. **With
  that option crossed off, it must not leave one option standing or confirm
  half of the right one.**
- An answer option is never math alone.
- "Only" and "every" are checked by name.

And for this unit's numbers:

- **A typed pH sets its own `tolerance`.** The page accepts 2 percent of
  the answer, which for a pH of 11 is 0.22 of a pH unit: far too wide. A
  Check whose answer is a pH or a pOH sets `tolerance` so that the page
  accepts about 0.02 either side (1 percent for an answer near 2, 0.5 near
  4, 0.3 near 7, 0.2 near 11), enough for an honest difference in the last
  decimal place and no more.
- **The slips of a pH** are the answers the unit's known mistakes give, and
  each must lie outside the tolerance: the pOH typed as the pH; the
  hydroxide ions counted once; the acid treated as strong; $K_a$ used where
  $K_b$ belongs; the ratio upside down; the volume of the flask used where
  the total volume belongs; a pH of 7 at a weak acid's equivalence point;
  the answer given to one decimal place, where that falls outside the
  tolerance.
- **A typed concentration from a pH** keeps the page's 2 percent, and the
  data are chosen so that the answer rounded to two figures is accepted.
- Where the mistake is only "acidic or basic" or "above or below the
  p$K_a$", the question is a choice, not a typed number.

## 6. Diagrams

### 6.1 Interactive diagrams (Svelte, like the other units)

All three take their pH from one module, `src/lib/acid-base.ts`: for a
solution of known amounts of a weak acid, its conjugate base, a strong acid
and a strong base, it finds $[\ce{H3O+}]$ from the one equation that says
the charges balance, by bisection, with $K_w$ included. It uses no
shortcut, so there is no seam where one stretch of a titration curve meets
the next, and it is tested against every case with a simple exact answer.
Each explorer has its own module on top of it for its states, its readout
and its descriptions, and a Svelte component that computes nothing.

**Weak-acid explorer (lesson 8.3).** Module `src/lib/weak-acid.ts`, block
`<WeakAcid />`.

- A weak acid in water at a chosen starting concentration.
- **Controls.** A choice of three acids whose $K_a$ values stand about ten
  to one to one-tenth: chloroacetic acid (1.4 × 10⁻³), formic acid
  (1.8 × 10⁻⁴) and butanoic acid (1.5 × 10⁻⁵). A slider of the starting
  concentration, in ten steps from 1.0 M down to 0.0010 M (1.0, 0.50, 0.20,
  0.10 and so on). It starts at formic acid, 0.10 M. Thirty states.
- **A box of 100 acid particles**, ten rows of ten. Each is drawn whole
  (un-ionized) or as a pair of ions, in the proportion of the percent
  ionization at that setting, to the nearest particle. When fewer than one
  in 200 is ionized the box shows none and the readout says "fewer than 1
  in 100", never "0 percent".
- **A graph** of percent ionization against starting concentration, on a
  logarithmic concentration axis, for all three acids, with the chosen one
  drawn heavy, a marker at the setting and a dashed line at 5 percent.
- **A readout:** $[\ce{H3O+}]$, the pH and the percent ionization from the
  full equation; the pH the shortcut gives and whether the shortcut passes
  the 5 percent check there; and the pH a strong acid would have at the
  same concentration.
- **What it shows:** dilution lowers $[\ce{H3O+}]$ and raises the pH while
  the fraction ionized goes up; at one concentration a larger $K_a$ means
  more ionized and a lower pH; a weak acid's pH is always above a strong
  acid's at the same concentration; and where the shortcut stops passing
  its check (below 1.0 M for chloroacetic acid, below 0.10 M for formic
  acid, below 0.010 M for butanoic acid), which is the lesson's answer to
  "when is it allowed".

**Titration-curve explorer (lesson 8.5, placed again in lesson 8.7).**
Module `src/lib/titration-curve.ts`, block `<TitrationCurve />`.

- 20.0 mL of a 0.150 M acid, titrated with 0.200 M sodium hydroxide: the
  flask of lesson 4.6's diagram. The equivalence point is at 15.0 mL for
  either acid.
- **Controls.** A choice of acid: lactic acid (weak, p$K_a$ 3.86) or
  hydrobromic acid (strong). A slider of the volume of base added, 0.0 to
  30.0 mL in steps of 0.5 mL, starting at 0.0 mL. A choice of indicator:
  none, bromocresol green, bromothymol blue or thymol blue.
- **A graph** of pH against volume added: the chosen acid's curve drawn
  heavy and the other acid's faint and dashed, a marker at the chosen
  volume, a vertical guide at the equivalence point and, for lactic acid,
  one at the half-equivalence point (7.5 mL) with the buffer region marked.
  When an indicator is chosen, a hatched band lies across the graph over
  its pH range, labeled with its two colors in words.
- **A panel "What is in the flask"**: bars, in millimoles, of the acid not
  yet reacted, the conjugate base formed, and the hydroxide ion in excess,
  after the reaction with the base added has gone to completion. These are
  exact, kept in whole micromoles as in `titration.ts`.
- **A readout** that names the stretch of the curve and what sets the pH
  there (the weak acid alone; both members of the pair, so a buffer; equal
  amounts, so pH = p$K_a$; the conjugate base alone, so above 7; excess
  hydroxide), with the pH. With an indicator chosen, it adds the
  indicator's color at that point and the two volumes between which its
  color changes on this curve, to 0.01 mL.
- **What it shows:** the same moles of acid need the same volume of base,
  strong or weak; the weak acid starts higher, has a flat buffer region
  centered on its p$K_a$ and reaches its equivalence point above pH 7; the
  two curves are one curve after the equivalence point; and an indicator
  whose range lies on the steep part changes within a drop of the
  equivalence point, while one whose range lies in the buffer region
  (bromocresol green with lactic acid: from about 7 mL to about 14.6 mL)
  changes early and slowly.
- **How it differs from the Unit 4 diagram.** `Titration.svelte` plots the
  acidic protons still to be neutralized, a straight line falling to zero,
  for lactic acid and for tartaric acid, and shows no pH. The new explorer
  plots pH, compares a weak acid with a strong one, and adds the
  indicators. `titration.ts` and `Titration.svelte` are not changed.

**Buffer explorer (lesson 8.10).** Module `src/lib/buffer-capacity.ts`,
block `<BufferCapacity />` (not `Buffer`, a name Node already uses).

- 1.00 L of a buffer of propanoic acid (p$K_a$ 4.87) and sodium propanoate,
  beside 1.00 L of pure water. The same amount of strong acid or strong
  base goes into both. The volume is taken as 1.00 L throughout, and the
  caption says so.
- **Controls.** A slider of the propanoic acid in the buffer and one of the
  propanoate ion, each 10 to 200 mmol in steps of 10 mmol, starting at 100.
  A slider of what is added, from 50 mmol of H₃O⁺ through nothing to
  50 mmol of OH⁻, in steps of 5 mmol, starting at nothing. 8,400 states.
- **Two pH scales side by side**, one for the buffer and one for the water,
  each with a hollow marker at the pH before the addition and a filled one
  at the pH after.
- **Bars of the buffer's two members**, in millimoles, after the added acid
  or base has reacted to completion, each with a dashed outline at its
  height before; and a third bar for strong acid or base left over when a
  member has run out.
- **A readout:** what reacted with what, the ratio of base form to acid
  form before and after, the buffer's pH before and after, and the water's.
  When a member is used up it says so, and says that the leftover strong
  acid or base now sets the pH.
- **What it shows:** the buffer moves by hundredths or tenths of a pH unit
  where water moves by five; two buffers with the same ratio start at the
  same pH, and the one with more of both moves less; a buffer with more
  acid form than base form can take more base than acid, and the reverse;
  and a buffer has a limit, past which its pH jumps.

All three follow the rules of the existing diagrams: drawn in their
starting state when the site is built; readable without JavaScript and in
print; usable by keyboard; a text description for screen readers; drawn
text of 12 px or more from a 412 px phone up; controls directly under the
drawing; every number shown comes from a module with unit tests. And what
Unit 6's explorers taught:

- the ids inside each SVG are made with `$props.id()`, since
  `<TitrationCurve />` stands on two pages and two explorers may share one;
- a readout never contradicts itself by rounding: the pH is shown to two
  decimal places, a concentration to two figures, and each from the
  unrounded value;
- a readout never says 0 or 100 percent for nearly none or nearly all;
- after the code review, every sentence of a lesson that quotes an
  explorer's number is compared with the module again.

### 6.2 Drawn figures

Static SVG files in `public/figures/`, in the style of Units 3, 4 and 6.
Nineteen; the briefs settle the list. **A curve in a figure is plotted from
points computed in the brief's script**, never sketched: Unit 6's one
redrawn figure was a graph with its slopes out of proportion.

| Lesson | Figure |
|---|---|
| 8.1 | Two rulers side by side, pH and $[\ce{H3O+}]$, with $[\ce{OH-}]$ running the other way: each step a factor of ten |
| 8.1 | Neutral water at 10 °C, 25 °C and 40 °C: equal bars of H₃O⁺ and OH⁻ at each, and a different pH |
| 8.2 | One formula unit of a group 2 hydroxide in water as particles: one cation and two hydroxide ions |
| 8.2 | The four quantities $[\ce{H3O+}]$, $[\ce{OH-}]$, pH and pOH as a square, with what joins each side |
| 8.3 | A weak base in water as particles: mostly whole molecules, a few HB⁺ and OH⁻ |
| 8.3 | The two equations of a conjugate pair added to give water's own, with what cancels marked |
| 8.4 | A line of "moles of OH⁻ added" against the moles of weak acid at the start, cut into three stretches by what is left afterward |
| 8.4 | Two boxes of particles: a weak acid before and after less than enough strong base |
| 8.5 | A weak base titrated with a strong acid: the curve, falling, with its half-equivalence and equivalence points |
| 8.5 | A titration curve with two rises, with the main form of the acid named in each stretch |
| 8.6 | A carboxylic acid drawn with every bond: the O–H hydrogen marked, the C–H hydrogens not; beside it the carboxylate ion with its charge shared by two oxygen atoms |
| 8.6 | Four acids in a row with one atom changed, and an arrow of electron pull growing with the acid strength |
| 8.7 | A bar along a pH axis, split between acid form and base form, at the p$K_a$ and one and two units either side |
| 8.7 | Three indicators' ranges as bands on one pH axis, with the equivalence pH of a strong and a weak acid marked |
| 8.8 | Three boxes of particles: a buffer, the same after a little strong acid, the same after a little strong base |
| 8.8 | A buffer beside a strong acid with its salt: which has something to take up an added acid |
| 8.9 | A ladder: the ratio of base form to acid form from 1 : 10 to 10 : 1 against pH from p$K_a$ − 1 to p$K_a$ + 1 |
| 8.10 | Two pairs of bars for buffers with unequal members: which has room for base and which for acid |
| 8.11 | A saturated solution of a salt as particles, with added H₃O⁺ taking the anion away and the solid dissolving to replace it |

## 7. How it is made

The Unit 6 pipeline, with the model for each task:

| Step | Model |
|---|---|
| 1. The framework summary (from knowledge; section 1) | the controller, Fable 5.2 |
| 2. Inventories: the teacher's materials; the site | Haiku |
| 3. This design, the lesson table and the instructions for each kind of agent | Fable 5.2 |
| 4. Briefs, one per lesson, each with a number-check script, in three groups | Fable 5.2 |
| 5. A fact-check of the briefs, by fresh agents that solve before they read and judge every value from memory | Fable 5.2 |
| 6. An originality check of the briefs against both inventories and one another | Sonnet |
| 7. Decided fixes to the briefs, and a second check of what changed | Sonnet applies; Fable 5.2 checks |
| 8. The plan, with this design, in one pull request | the controller |
| 9. The shared solver and the three explorers, test-first, one builder each | Opus |
| 10. A TypeScript review and a code review of each explorer | Sonnet |
| 11. Writers, one per lesson, files only, with figures and the Checks' messages | Fable 5.2 |
| 12. One build and one test run; each lesson swept in the browser at 412, 390, 360 and 320 px; each figure looked at | the controller |
| 13. A fact-check per lesson, by a fresh agent that has not seen the brief, judging every value again | Fable 5.2 |
| 14. An originality check per group | Sonnet |
| 15. Decided fixes applied; build and tests again; a second check of what changed | Sonnet applies; Fable 5.2 checks |
| 16. The pull request, merged when "Build and test" passes | the controller |

Never both the writer and the checker on a cheaper model: the fact-check is
the safety net. Steps 5 and 13 are the two independent checks of every
reference value that section 1 promises.

## 8. Pull requests

| Pull request | Contents |
|---|---|
| A | This design and its plan, with the eleven briefs |
| B | The solver `acid-base.ts`, the weak-acid explorer, lessons 8.1–8.3; Unit 8 on the build's feedback list |
| C | The titration-curve explorer, lessons 8.4–8.7 |
| D | The buffer explorer, lessons 8.8–8.11; Unit 8 on the balance test; the close-out notes |

Each is stacked on the one before, targets `main`, and is merged when its
checks pass.

- **`FEEDBACK_UNITS`** (`scripts/check-dist.mjs`) gains `'8'` in pull
  request B. Before that, the sample lessons of
  `tests/unit/check-dist.test.ts`, which the Unit 6 work moved to topic
  8.2 because Unit 8 had no lessons, move to topic 9.2: the comment and
  `data-topic` (lines 12 and 13), `inUnit(8, …)`, "lesson 8.2" and
  `FEEDBACK_UNITS.has('8')` (lines 30 to 43), and the expected strings
  "lesson 8.2" (lines 134 to 189). Unit 9 is the last unit, so its own work
  will have to give these samples a unit number that no unit has.
- **The data file** `docs/superpowers/plans/2026-11-27-chemstudy-unit-8-check-feedback.json`,
  which `tests/e2e/check-feedback.spec.ts` needs for a unit on the list, is
  derived from the lessons in each of pull requests B, C and D.
- **`BALANCED_UNITS`** (`tests/unit/check-balance.test.ts`) gains `8` in
  pull request D, when all eleven lessons are in.

## 9. Not in this design

- The Unit 8 practice: the teacher's worksheets, self-study ladders and
  free-response sets, converted under the rules of the other units. The
  unit exam stays closed.
- A Unit 8 comprehensive test, after the practice.
- Any change to the Unit 4 titration diagram or to lessons 4.2, 4.6 and
  4.8.

## 10. Done when

- All eleven lessons are built, pass the browser and accessibility tests,
  and are merged.
- Every lesson has been fact-checked independently and checked for
  originality, twice where it changed, and every accepted finding is fixed.
- Every reference value has been judged by two checkers, and each one they
  could not both confirm is listed for the teacher.
- Every Check says something for each wrong answer, and each option is the
  answer in 15 to 35 percent of the unit's Checks with options.
- No lesson scrolls sideways at 320 px with every answer open.
- All three interactive diagrams work by keyboard, and all three show a
  drawn picture without JavaScript and in print.
- The teacher has been told, in each pull request, what to verify against
  the framework, that no textbook was read, and which values rest on memory.

Section 11, "As built", is added when the last pull request is opened, as
for Unit 6.

## 11. Changed while the briefs were checked

Written on 2026-11-27, before any lesson was written. Each brief had a
fact-check, an originality check and a second check; these are the places
where they changed what the sections above say. The briefs in the plan are
the final word.

- **Chloroacetic acid's p$K_a$ is 2.85**, not 2.87: it is the logarithm of
  the 1.4 × 10⁻³ that lesson 8.3 uses, it is inside the spread of the tables
  (2.85 to 2.87), and with it lesson 8.6's typed Check accepts every honest
  rounding.
- **Lactic acid's $K_a$ in the titration-curve explorer is 10⁻³·⁸⁶
  exactly**, so that lessons 8.5 and 8.7 quote the same numbers (equivalence
  pH 8.40; bromocresol green changes from 6.96 mL to 14.58 mL).
- **The curve with two rises in lesson 8.5 is for an acid the lesson calls
  H₂A and says is made up** (p$K_a$ 3.00 and 8.00), not phosphorous acid.
  Phosphorous acid's first p$K_a$ was the least certain value of the unit,
  and with it the reading halfway to the first rise misses the p$K_a$ by
  half a unit.
- **Lesson 8.6 opens with gluconic acid**, not lactic acid, which four other
  lessons already use, and its first Check is about hypophosphorous acid,
  H₃PO₂, since lesson 8.5 already asked the same question of phosphorous
  acid.
- **Lesson 8.6 says that bond polarity is the first test for an acidic
  hydrogen and not the only one.** On the site's electronegativity scale the
  S–H and Se–H bonds are no more polar than C–H, and H₂S, H₂Se and H₂Te are
  acids.
- **Lesson 8.11's worked example uses lead(II) fluoride and lead(II)
  bromide.** Strontium fluoride and thallium(I) chloride are the salts of
  lesson 7.11's and 7.12's own worked examples.
- **Lesson 8.3's opening has no strong-acid twin**, lesson 8.4 is built on
  hexanoic acid and hydroxylamine (lesson 4.2 already had benzoic acid with
  sodium hydroxide and pyridine with hydrobromic acid; the first replacement
  acid, phenylacetic acid, is a controlled precursor chemical in the United
  States and was taken out), and lessons 8.8 and 8.10 have new cases
  and a worked addition with unequal amounts (140 and 60 mmol with 35 mmol
  of base).
- **The shared solver's description was wrong for a weak base mixed with a
  salt of its conjugate acid** (it would have given pH 5.10 where the answer
  is 9.50). The first fact-check of lesson 8.3's brief caught it, and the
  solver's tests now hold that case.
- **Kept, though the originality check flagged it:** the titration-curve
  explorer's flask is lesson 4.6's, as section 1 decides.

## 12. As built

Written November 27, 2026, when the last pull request of the unit was opened.

**What went in.** Eleven lessons (8.1 to 8.11) with 67 Checks, each with a message for every wrong option or a slip for every likely wrong method; 19 drawn figures; three interactive diagrams on one shared solver (`src/lib/acid-base.ts`): the weak-acid explorer in lesson 8.3, the titration-curve explorer in lessons 8.5 and 8.7, and the buffer explorer in lesson 8.10. Unit 8 is on `FEEDBACK_UNITS` and on `BALANCED_UNITS`; the right answer sits at options 1 to 4 in 13, 13, 12 and 10 of the choice Checks. Reading times are 20, 18, 22, 21, 22, 22, 22, 22, 22, 22 and 22 minutes.

**Pull requests.** A (this design and the plan, 87), B (lessons 8.1 to 8.3, the solver and the weak-acid explorer, 88), C (lessons 8.4 to 8.7 and the titration-curve explorer, 89) and D (lessons 8.8 to 8.11, the buffer explorer and this section), each merged by Claude when "Build and test" passed, as the teacher said.

**What differs from the design.**

- The framework could not be read. This session's network does not reach the College Board's site, so section 3 rests on a summary written from memory. The teacher should read section 3 against the framework itself, above all the exclusions under topics 8.8 to 8.10 and the numbering of 8.11.
- The textbooks could not be read either. Originality was checked against the teacher's materials in the AP Chem repository and against the rest of this site, and not against any published textbook.
- The lessons are longer than the design's lesson table planned. Nine of the eleven are at 22 minutes, the ceiling the site sets, and several would come out higher by the rule that sets a reading time from a lesson's length. Nothing was cut, since each part answers a framework statement; the teacher may want lessons 8.4 and 8.5 split or trimmed.
- The solver gained a builder for weak-base mixtures (`weakBaseSolution`) after the code review of pull request B, so that no explorer writes that mapping by hand.
- Section 11 lists what changed in the briefs. In the finished lessons the originality checks of the prose had 45 more passages reworded (9 in lessons 8.1 to 8.3, 18 in 8.4 to 8.7, and those of 8.8 to 8.11), mostly headings, key ideas and items of a Trap list that followed the wording or the order of the teacher's notes.
- One figure of lesson 8.6 (the pull of a halogen atom) was redrawn after its fact-check: each arrow sat halfway between two rows and could be read one row off.

**Values no checker could confirm without a reference.** Each is the value a standard table gives as far as two independent checkers knew, and none could be looked up from this session.

| Value | Used | Doubt |
|---|---|---|
| $K_a$ of hexanoic acid; its solubility | 1.3 × 10⁻⁵; about 0.09 M | fairly sure |
| $K_b$ of hydroxylamine | 1.1 × 10⁻⁸ | tables give the p$K_a$ of NH₃OH⁺ as 5.94 to 5.96 |
| p$K_a$ of gluconic acid | 3.86 | fairly sure |
| p$K_a$ of the methylammonium ion | 10.64 | tables give 10.62 to 10.66 |
| p$K_a$ of glycolic acid | 3.83 | fairly sure |
| p$K_a$ values of the haloacetic acids (lesson 8.6) | 2.59, 2.85, 2.90, 3.18 | tables differ in the second decimal place |
| Indicator p$K_a$ values (lesson 8.7) | 4.7, 7.1, 8.9 | tables differ by about 0.2 |
| $K_w$ at 10 °C and 40 °C (lesson 8.1) | as in the lesson | fairly sure |
| $K_{sp}$ of PbF₂, PbBr₂, TlBr and Co(OH)₂ (lesson 8.11) | as in the lesson | tables differ |
| That hexanoic acid's smell fades only near the equivalence point (lesson 8.4's opening) | two sentences | from reasoning, not from a source |

**Claude's calls, for the teacher to change.** Hydronium, H₃O⁺, is written everywhere and a bare H⁺ nowhere. A typed pH is accepted within about 0.02. The pH of a salt solution is taught in lesson 8.4. Lesson 8.5's curve with two rises is for a made-up acid, H₂A. The titration-curve explorer titrates the flask of topic 4.6. Lesson 8.10 works one addition to a buffer and says in a "Beyond the exam" line that the exam rarely asks for it as a calculation; one checker recalled released questions that do ask for that pH, so the teacher may want the label removed. Lesson 8.4 uses hexanoic acid because its first replacement, phenylacetic acid, is a controlled precursor chemical in the United States. Dilution of a buffer is taught in lesson 8.8, ahead of topic 8.10, where the framework states it.

