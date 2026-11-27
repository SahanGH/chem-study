# ChemStudy Unit 8 Practice Implementation Plan

**Goal:** Put the teacher's Unit 8 practice on chem-study.com: five worksheets, the twelve skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: seven MDX files in `src/content/practice/unit-8/`, converted by hand from the LaTeX in the AP Chem repository and checked by `scripts/practice-audit.mjs`. No code changes.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-8-practice-design.md`.

**Builds on:** Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`), whose sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise; and on Unit 6's practice (`2026-11-27-chemstudy-unit-6-practice.md`), whose lessons are written into this plan.

## Facts verified before writing (do not rediscover)

Established on 2026-11-27. The research behind them is in the session scratch folder: `scratchpad/unit8-practice/research.md` (thirteen sections, with file and line for each fact), `recompute.py`, `balance.py`, `overlap.py` and their outputs, and `carried.py`, in which the controller multiplied out every value this plan names.

1. **The sources** (read-only), in `/home/user/sahangh/ap_chem_prep/Units/unit08-acids-bases/`: `worksheets/u08-ws1.tex` to `u08-ws5.tex`, and one level up `u08-selfstudy.tex` and `u08-frq.tex`. **Never open `exam/`, or any file with "exam" or "test" in its name.** There are no key PDFs on this machine; each `.tex` holds its answers. Line numbers below are of these files: `WS2:62` is line 62 of `u08-ws2.tex`, `L` is the ladders, `FRQ` the free-response set.
2. **Counts.** Worksheet 1: 9 questions, 19 parts; Worksheet 2: 8 and 15; Worksheet 3: 8 and 23; Worksheet 4: 9 and 20; Worksheet 5: 8 and 36 (the last question scored, 10 points, parts a to f). The ladders: 12 worked examples and 48 questions. The free-response set: 5 questions, 16 parts, 15 rubric lines, 32 points (10, 10, 4, 4, 4), 50 minutes.
3. **`\ced{8.N}` inside the `\problem[]{…}` text carries the source's topic**; the ladders carry it under each heading and the free-response set in its `\frq{...}` lines. **The sources' tags follow an older numbering** (8.7 as "p$K_a$ and salts", pH conversions as 8.2). This plan gives each question its topic on the site; do not copy a tag.
4. **No figure, no titration curve and no table in any source** (the ladders' tick table apart, which is left out). No ICE table is printed either: Worksheet 2, question 1 asks for one and its answer gives the last row in a line.
5. **Rubrics.** Worksheet 5, question 8: a boxed note of six items, (a) 1, (b) 2, (c) 2, (d) 2, (e) 2, (f) 1. The free-response set: 15 `\rpoint` lines; question 1: 2, 3, 3, 2; question 2: 3, 2, 2, 2, 1; question 3: 3, 1; question 4: 2, 2; question 5: 3, 1, and its two lines are not keyed to its three parts.
6. **Every worksheet ends with a `spiralstrip`** (left out). **Each worksheet's `\wsheader` strip holds data its questions need** (Worksheet 2: four $K_a$, one $K_b$, $K_w$; Worksheet 3: three $K_a$, one $K_b$ and no $K_w$; Worksheet 4: six p$K_a$, one $K_a$, $K_w$; Worksheet 5: two $K_a$ with p$K_a$, $K_b$ and $K_a$ for the ammonia pair, $K_w$, three indicator ranges). Worksheet 1's strip is formulas and the list of strong acids. In the ladders `\selfcheck` holds the one-line answers and the key-only `apcanswer` the explanations; the questions print as 1 to 4 and are keyed (a) to (d).
7. **What a practice page can hold.** `src/pages/[unit]/practice/[name].astro` supplies `Answer`, `Blank`, `Figure`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`. `Question` and `Part` take `beyond`. `RubricLine`'s `part` is optional. A document's `topics` may name only topics of its own unit. The build check needs a non-empty `<Answer>` in every question or part, rubric lines that sum to the question's `points`, and document `points` equal to the sum of its questions'. The schema (`src/content.config.ts`): `title` 3 to 80 characters, `summary` 20 to 200, `order` from 1, `points` and `minutes` optional.
8. **Numbers.** No source states a molar mass. Of 186 printed values, two final answers do not recompute (Worksheet 2, 5(b) and 5(c)); five displays print a step that does not give the printed answer; nothing is an exact tie at its last figure except "about 37" in Worksheet 3, 7(c). Every value is in "Numbers" below, multiplied out. **These are right as printed, though they look like slips:** 12.00 for 0.0050 M Ca(OH)₂ (Worksheet 1, 7(e)); 11.70 for 0.0025 M Ca(OH)₂ (Ladder 4(c)); 5.4 percent in free-response 1(b) beside 5.2 percent in 1(d) (the first is the check, from the shortcut's $x$; the second is the percent ionization, from the quadratic's).
9. **Answers that differ in the last place when $x$ is kept** (the shortcut is the method taught, each passes its check, and none changes): 0.100 M acetic acid, 2.87 against 2.88 (Worksheet 2, 2(a) and question 3; Worksheet 5, 3(b); Ladder 12's example); 0.150 M NH₃, 11.22 against 11.21 (Worksheet 2, 6(a) and question 7); 0.100 M NH₃, 11.13 against 11.12 (6(c)); the given $[\ce{H3O+}]$ of Worksheet 2, 4(b), 4.24 × 10⁻⁴ against 4.15 × 10⁻⁴; the given 2.7 × 10⁻² of Worksheet 3, question 7 against 2.6 × 10⁻²; Worksheet 4, 2(c), 2.84 against 2.85; Ladder 5's $x$, 1.90 × 10⁻³ against 1.89 × 10⁻³.
10. **Equations.** All 21 equations balance in atoms and in charge. 17 carry no state symbol (Worksheet 4: one; the ladders: thirteen; the free-response set: three). 5 are written with a bare H⁺ (L:109, L:114, L:259, L:523, FRQ:101). Worksheets 2 and 5 print no equation at all. The arrows follow the lessons' rule everywhere.
11. **Unit 8's lessons** (`src/content/lessons/unit-8/`), and what each gives the practice:
    - 8.1: "This site writes H₃O⁺"; the equation sheet writes H⁺ and the exam accepts either; $K_w = 1.0 \times 10^{-14}$ and pH + pOH = 14.00 at 25 °C; neutral means $[\ce{H3O+}] = [\ce{OH-}]$; two significant figures in a concentration give two decimal places in a pH.
    - 8.2: the strong acids, with "H₂SO₄ (its first proton)"; the strong bases are the group 1 hydroxides and Ca(OH)₂, Sr(OH)₂ and Ba(OH)₂, which "come apart into ions completely"; pOH first for a base.
    - 8.3: the ionization equation with water and hydronium, split at the arrow; the ICE table with an empty first header cell and one column for each species of the $K$ expression, rows I, C and E, values in M, HA and A⁻ where a formula is too long for a cell; the check ("Do the division every time and put the percentage in your answer"; "Under 5 percent, so it holds"); the quadratic formula "Beyond the exam"; percent ionization; $K_a \times K_b = K_w$ for a conjugate pair only.
    - 8.4: react first, in moles, in a **table of moles** (Before, Change, After, in millimoles, never called an ICE table); an ion that is "the conjugate of something weak" reacts with water; a buffer's pH from the $K_a$ expression.
    - 8.5: the four stretches of a weak acid's curve; "half-equivalence point"; equivalence at pH 7 for a strong acid with a strong base at 25 °C.
    - 8.6: a stable conjugate base means a stronger acid; bond strength down a group; an oxyacid's extra oxygen atoms make the O–H bond "more polar and the proton easier to remove"; acetic acid's p$K_a$ as 4.76.
    - 8.7: an indicator is a weak acid whose two forms differ in color; its range is about p$K_a$ ± 1; "endpoint", one word; choose the indicator whose p$K_a$ is close to the pH at the equivalence point, so that its range holds that pH. Its table: bromocresol green, yellow to blue, 3.8 to 5.4; bromothymol blue, yellow to blue, 6.0 to 7.6; thymol blue, yellow to blue, 8.0 to 9.6. "The exam gives a table like this one whenever it is needed."
    - 8.8 to 8.10: "acid form" and "base form"; the ratio sets the pH and the amounts set the capacity; "buffer capacity"; a buffer works within about one unit of its p$K_a$; the derivation of the Henderson–Hasselbalch equation and the pH after an addition are each "Beyond the exam".
    - 8.11: in words only; AgCl-like salts dissolve "essentially the same" in acid.
    - Nowhere in the lessons: "hydrolysis", "dissociate", "amphiprotic", "polyprotic", a bare H⁺.
12. **Unit 8's lessons must be on `main` before Task 5's hand checks**, which read each lesson's "Practice next".

## Conventions for every task

Plan 3's "Conventions for every task" apply as Unit 6's plan applied them, with this session's paths: the site is `/home/user/chem-study`; the sources are read-only; everything that is not the site goes in the scratch folder (`scratchpad/unit8-practice/`, with `staging/`, `expected/`, `fc/` and `notes/` in it); American English (`CLAUDE.md`), which the spelling check does not read in `docs/superpowers/`, so it is kept by hand there; no swallowed errors.

**Merging.** Claude merges each pull request when its "Build and test" check passes on GitHub.

**Models.** Writers and fact-checkers on the strongest model (Fable 5.2); fixers that apply a decided list on Sonnet; inventories on Haiku. Only the controller builds, tests, commits and merges. No originality check.

**Briefs.** The three briefs of Unit 6 (`scratchpad/unit6-practice/writer-brief.md`, `factcheck-brief.md`, `fixer-brief.md`) are copied to `scratchpad/unit8-practice/` with "Unit 8", this plan's name, `unit-8` lesson paths, `scratchpad/ced/unit8-framework.md` and Unit 6's finished pages as the models. The fact-check brief takes the additions of Task 2.

**Learned on earlier units, and binding here:**
- A correction to one of the teacher's numbers, and every carried value, is recomputed by the controller in a script before it goes into a decided list or a pull request. A writer or fixer that believes an item is wrong does not apply it and says why.
- The audit reads any number in the page as a number, a spacing argument such as `[0.6em]` included: do not use one. It reads "1,000" as two numbers; each is listed.
- A scoring note copied from a source that a grader could read two ways is kept as the source has it and listed in the pull request.
- The second fact-check is told to treat every sentence as new and to apply each rule the page states, exactly as worded, to every example on the page.
- A replacement sentence with "only", "always" or "never" in it gets the same test as the original before it goes into a decided list.
- Every writer has the thousands rule and "size" for "magnitude" from the start.
- A summary is counted against the schema's 200 characters. The seven below were counted.

**Layout, measured on earlier units:**
- **About 25 characters of rendered math fit on one display line at 320 px.** Every display longer than that is split with `aligned`, at an equals sign or at the arrow.
- **`aligned` needs an `&` on every row.** A row without one is centered against the others and can overflow.
- **Inline math cannot wrap.** An equation or a calculation in a rubric line (which is one line of text) or in a sentence is written in words ("the equation in which F⁻ takes a proton from H₃O⁺"), or moved to a display in the answer. Short inline math, such as $[\ce{HA}] = [\ce{A-}]$ or $x = 0.0131$, is fine.
- **A table inside a part has at most three short columns.** An ICE table with four columns (the label and three species) is checked at 320 px and split if it scrolls.
- Measure every page at 412, 390, 360 and 320 px with every answer open, after every round of fixes.

## What Unit 8 adds to the conversion guide

Give every writer this section with Plan 3's guide. Each page's own list is under its task; this section holds the rules that cross pages.

**H₃O⁺ everywhere** (design, 4.1).
- Write `\ce{H3O+}` wherever the source writes `\ce{H+}`: $[\ce{H3O+}]$ in every expression, "added H₃O⁺" for "added H⁺". Never write `\ce{H+}`. "Proton" stays where a sentence is about what one species passes to another ("accepts a proton").
- An equation the source writes with a bare H⁺ gains water, as lesson 8.3 writes an ionization (hydronium first among the products). An equation the source already writes with H₃O⁺ keeps its order of species.
- Each introduction says once: "This site writes H₃O⁺. The exam's equation sheet writes H⁺ for the same ion, and either is accepted."

**Equations.** Every equation is `\ce{...}` in display math, split at the arrow with `aligned` when it is longer than about 25 characters (nearly all are, once they have state symbols). **Every species of every equation carries a state symbol:** (aq) for ions and dissolved molecules, (l) for water. Report each equation you add them to. Keep the source's arrow. **Add no equation the source does not print**, except where your task names one.

**Values a question uses** (design, 4.3). The `\wsheader` strip becomes the introduction: a sentence and then "Use these values" as one or two tables of at most three columns (for example: acid, $K_a$, p$K_a$). Keep every value as the source has it; do not change one to match a lesson (acetic acid's p$K_a$ stays 4.74). Every introduction also says: "Every solution here is at 25 °C unless a question says otherwise", with $K_w = 1.0 \times 10^{-14}$.

**Indicators** (design, 4.3). Worksheet 5 keeps its own three (methyl red, 4.4 to 6.2; bromothymol blue, 6.0 to 7.6; phenolphthalein, 8.2 to 10.0). Ladder 12's example and free-response 2(d) use lesson 8.7's (bromocresol green, 3.8 to 5.4; bromothymol blue, 6.0 to 7.6; thymol blue, 8.0 to 9.6). "Bromothymol", never "bromthymol". Phenolphthalein appears on Worksheet 5 only, and methyl orange nowhere.

**The check** (design, 4.6). Wherever an answer leaves $x$ out, it shows $x$, then the check as a display, then a verdict in the lessons' words:

```
$$
\frac{1.34 \times 10^{-3}}{0.100} \times 100\% = 1.3\%
$$

Under 5 percent, so the shortcut holds.
```

"The 5 percent check" or "the check", never "the 5% rule", "threshold" or "test". "5 percent" in a sentence; a percent sign against its number in math and for a result (1.3%). The percentages your page gains are in its task.

**Carried values** (design, 4.6). Where your task names a carried value, show that value in the line above the answer so that the printed answer follows from it, and keep the source's final answer. Recompute each number as you go and report any you cannot reproduce, without changing it.

**The lessons' terms** (design, 4.4). Use the right-hand column everywhere, in questions and answers alike:

| The source says | Write |
|---|---|
| hydrolysis, hydrolyses, "hydrolyses water" | "reacts with water"; "takes a proton from water" (a base); "gives a proton to water" (an acid) |
| dissociation, "complete dissociation", "fully dissociated" | "comes apart into its ions completely" (a strong base); "ionized" (an acid) |
| the halfway point | the half-equivalence point |
| end point | endpoint |
| oxoacids | oxyacids |
| H–H | the Henderson–Hasselbalch equation |
| major species | what the flask holds |
| weak-acid ICE; weak-base ICE with $K_b$ | an ICE table with $K_a$; an ICE table with $K_b$ |
| stoichiometry step; mmol bookkeeping | the table of moles |
| buffering capacity | buffer capacity |
| a weak parent; a strong parent; "where each ion came from" | the conjugate of something weak; the conjugate of something strong |
| inert (of an ion) | a spectator; "does not react with water" |
| a negligible base | "so weak a base that it essentially never takes a proton from water" |
| the 5% rule, threshold, test | the 5 percent check |
| base component; acid component (of a buffer) | base form; acid form |
| useful range p$K_a$ ± 1 | "within about one unit of the p$K_a$" |
| orders of magnitude; magnitude | a factor; size |
| candidate | student |
| colour; centred; litre; marks; commonest; "got wrong" | color; centered; liter (prints as L); points; "most common"; "missed" |
| bromthymol blue | bromothymol blue |
| sanity check | "a quick check of the direction" |
| problem 2 | question 2 |
| the data strip | "the table at the top of this page" |
| CED | "the AP framework", or nothing |

**One spelling for one acid.** Keep the formulas of your source: HC₂H₃O₂ and NaC₂H₃O₂ on the worksheets, CH₃COOH and NaCH₃COO in the ladders. The first use on a page says "acetic acid, HC₂H₃O₂ (also written CH₃COOH)", or the reverse. Where one page writes hypochlorous acid as both HClO and HOCl, the second says "the HClO of part c, written to show that its hydrogen is bonded to oxygen".

**Thousands and percent.** 1,000 in text and `1{,}000` in math. "Percent" is one word.

**Wording to recast.** Worksheet subtitles that name a routine go; the idea in each becomes a sentence of the introduction. "YOUR TURN" is the `label="Your turn"` of the question; "I do:" is dropped. A note to a grader becomes a sentence of the rubric line. A long ruled blank whose key is a phrase (`\answerblank[7cm]{…}`) becomes an `<Answer>` holding a sentence; a short one keeps `<Blank />`. No em dashes: recast each " --- ".

**Left out:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`); every comment at the head of a source.

### Corrections (design, 4.5): seven statements that are wrong as written

Apply exactly these and report each. Points never change.

| # | Source line | Old | New |
|---|---|---|---|
| W1 | WS5:62–63, question 4's stem | "Compare the two titrations in problems 2 and 3, which use the same volumes and concentrations." | "Compare the two titrations in questions 2 and 3, which use the same concentrations of acid and of base." |
| W1 | WS5:66–68, 4(a) | "Yes — 25.0 and 50.0 mL respectively for the amounts given, each set purely by stoichiometry and concentration, not by acid strength." | "No: 25.0 mL and 50.0 mL. The difference has nothing to do with one acid being weak. Each flask needs as many moles of OH⁻ as it holds of acid, and question 3's flask holds twice as many. In each titration the acid and the base have the same concentration, so the volume of base equals the volume of acid. Acid strength plays no part." |
| W2 | WS5:157–159, 8(f) | "Phenolphthalein (8.2–10.0) — its range brackets the equivalence pH of 10.08 most closely. Methyl red and bromthymol blue would both change colour while acid still remained." | "Phenolphthalein. Of the three, its range (8.2 to 10.0) lies nearest the equivalence pH of 10.08, which is just above its top, so its color change is complete just before the equivalence point. Methyl red and bromothymol blue would both have changed completely while a good deal of the acid was still left. Even phenolphthalein is not ideal here: it starts to change at pH 8.2, when about 21 mL of the 25.00 mL have gone in, so the titration has to run to the full color. An indicator whose range held 10.08 would be better." The rubric item (f) stands as the source has it. |
| W3 | FRQ:167–170, 3(b) | "They computed pOH and reported it as pH — or treated Ba(OH)₂ as an acid. A hydroxide of a group 2 metal must give a basic solution, so any pH below 7 is immediately wrong." | "Two slips together. The student took $[\ce{OH-}]$ as 0.0050 M, missing the second hydroxide ion, and then reported the pOH, −log(0.0050) = 2.30, as the pH. (Treating the solute as an acid with $[\ce{H3O+}]$ = 0.0050 M gives the same number.) Barium hydroxide is a strong base, so its solution must be basic, and any pH below 7 is wrong at once." The stem's 2.30 stays. |
| W3 | FRQ:177, rubric (b), 1 point | "recognizing pH and pOH have been interchanged" | "1 point for recognizing that a pOH has been reported as the pH. (2.30 is the pOH found without the factor of 2; the solution's own pOH is 2.00.)" |
| W4 | WS5:118, 7(b) | "yes — H₂CO₃ is weak" | "Yes: its conjugate acid, HCO₃⁻, is a weak acid." |
| W4 | FRQ:216–219, 5(a) | "Carbonate is the conjugate base of the weak acid H₂CO₃, so added H⁺ removes it from solution and the dissolution equilibrium shifts right." | "Carbonate is the conjugate base of the weak acid HCO₃⁻, so added H₃O⁺ turns it into HCO₃⁻ (and, with more acid, into H₂CO₃). That takes carbonate out of the solution, and the dissolving equilibrium shifts right." |
| W5 | WS4:80–84, question 6 | "Strong base does not sit at equilibrium with a weak acid — it consumes it completely, so OH⁻ never appears in an ICE table. The correct first move is a stoichiometry step subtracting 0.010 mol from the weak acid and adding it to the conjugate base, after which Henderson–Hasselbalch uses the new amounts." | "A strong base does not sit at equilibrium with a weak acid: it reacts with it completely. So the added OH⁻ is not put into an ICE table as a starting concentration. It is used up first, in a table of moles: subtract 0.010 mol from the acid form and add it to the base form. The Henderson–Hasselbalch equation then takes the new amounts." |
| W6 | WS4:112–115, 8(d) | "…Essentially no CN⁻ would be present, leaving nothing to neutralize added acid — the solution would sit near pH 3.50 with no capacity at all." | "…Essentially no CN⁻ would be present, leaving nothing to take up added acid. The pair could not even bring a solution to pH 3.50: a solution of HCN alone is no more acidic than about pH 5." (0.10 M HCN is at pH 5.10 and 1.0 M at 4.60.) |
| W7 | WS2:61–62, 5(b) | "$K_a \approx (7.9\times10^{-4})^2/0.20 = \mathbf{3.1\times10^{-6}}$" | $K_a \approx (7.94 \times 10^{-4})^2 / 0.20 = \mathbf{3.2 \times 10^{-6}}$, in two lines. Part (a) keeps its answer of $7.9 \times 10^{-4}$ and adds "(7.94 × 10⁻⁴ before rounding; carry it)". |
| W7 | WS2:63, 5(c) | "p$K_a$ = 5.51" | "p$K_a$ = −log(3.15 × 10⁻⁶) = **5.50**", with a sentence: "Carry the unrounded $K_a$, 3.15 × 10⁻⁶." |

Multiplied out: 10⁻³·¹⁰ = 7.943 × 10⁻⁴; (7.94 × 10⁻⁴)² ÷ 0.20 = 3.152 × 10⁻⁶; −log(3.15 × 10⁻⁶) = 5.502; exactly, 2(3.10) + log 0.20 = 5.501. The source's route: (7.9 × 10⁻⁴)² ÷ 0.20 = 3.12 × 10⁻⁶, and −log(3.1 × 10⁻⁶) = 5.509. The rounded 3.2 × 10⁻⁶ would give 5.495, so 5(c) carries 3.15 × 10⁻⁶.

For W2: with p$K_a$ = 7.46, the ratio of OCl⁻ to HOCl is 5.50 at pH 8.2 (21.15 mL of base in) and 347 at pH 10.0 (24.93 mL). Methyl red has changed completely at pH 6.2, after 1.3 mL; bromothymol blue at pH 7.6, after 14.5 mL.

### Statements reworded (design, 4.5): the 26 weighed

Apply the nineteen marked "Change" exactly, and report each. Leave the seven marked "Keep" as the source has them (recast only for the terms above).

| # | Source line | The source says | On the site |
|---|---|---|---|
| H1 | WS2:39–40, question 3 | "…differ enormously in strength — strength is the fraction that ionizes." | **Change.** "…differ enormously in strength. Strength is how far the ionization goes, which $K_a$ measures; at one concentration, the stronger acid is the more ionized." |
| H2 | FRQ:127–129, 2(d); rubric FRQ:148–149 | "Phenolphthalein, changing colour around pH 8.3–10.0, brackets a weak-acid equivalence point well. Methyl orange would change far too early." | **Change.** See the free-response set's task: thymol blue, from the table added to the part. |
| H3 | L:642–643, Ladder 12's example | "phenolphthalein (8.3–10.0) brackets 8.72; methyl orange (3.1–4.4) would change far too early." | **Change.** "Of lesson 8.7's indicators, thymol blue (8.0 to 9.6) holds 8.72; bromocresol green (3.8 to 5.4) would change far too early, in the buffer region." |
| H4 | WS1:91–92, question 9 | "it is a weak acid, because the H–F bond is exceptionally strong" | **Change.** "mainly because". WS3:33–35, 2(b) already compares ("matters more than") and stays. |
| H5 | WS3:38–40, 2(c); L:416–417; FRQ:186–188, 4(a) | an added oxygen "withdraws electron density from the O–H bond, weakening it" | **Change.** "pulls electron density away from the O–H bond, which makes the bond more polar and the proton easier to remove". Rubric FRQ:202: "1 point for electron withdrawal from the O–H bond that makes the proton easier to remove (the bond more polar, or weakened)". |
| H6 | L:499–500, 9(d) | "HF is weak, so F⁻ is a strong enough base to remove a proton from water appreciably." | **Change.** "HF is weak, so F⁻ is a base, weak but real: it takes a proton from a few of the water molecules, enough to make the solution slightly basic." |
| H7 | WS3:59–60, question 4 | CN⁻ "readily accepts a proton from water and generates OH⁻" | **Change.** "takes protons from some of the water molecules and makes OH⁻" |
| H8 | WS5:122–124, 7(e) | "its solubility in 1 M HNO₃ equals that in pure water" | **Change.** "is essentially the same as that in pure water" |
| H9 | L:219–220, Ladder 4's example; FRQ:168–169, 3(b) | "a group 2 hydroxide is a strong base, so the pH must be well above 7" | **Change.** "Barium hydroxide is a strong base, so the pH must be well above 7." (In FRQ 3(b) it is part of W3's text.) |
| H10 | L:118–119, Ladder 2's example | "Same concentration, hundred-fold difference in [H⁺] — and about two pH units between them." | **Change.** "Same concentration, about 75 times the $[\ce{H3O+}]$, and nearly two pH units between them." (0.10 ÷ 1.34 × 10⁻³ = 74.5; 2.87 − 1.00 = 1.87.) |
| H11 | L:167–168, Ladder 3's example | "It does, by five orders of magnitude." | **Change.** "It does, by a factor of more than 60,000." (2.5 × 10⁻⁵ ÷ 4.0 × 10⁻¹⁰ = 62,500.) |
| H12 | L:66–68, Ladder 1's example | "they differ by more than one proton and are not related as conjugates" | **Change.** "they are not the same species with and without a proton, so they are not a pair" |
| H13 | WS4:95–97, 7(c) | "A. Its ratio changed 2.0% against B's 50.5% — about 25 times better — even though both received the same quantity of acid." | **Change.** "A. Its ratio changed by 2.0%, and B's by 50.5%, more than 25 times as much, though both received the same amount of acid. B was hardly a buffer to begin with: its pH, 6.74, is two units above the p$K_a$." |
| H14 | WS4:109, 8(c) | "HCN, ratio 0.62" | **Change.** Add: "NH₄⁺ with NH₃ (p$K_a$ 9.25, ratio 0.56) is nearly as good." |
| H15 | WS2:96, 8(c) | "Which polyprotic acid is the exception, and why?" | **Change.** "For which common acid with more than one proton does the reasoning of part b fail, and why?" The answer stays. |
| H16 | WS2:93 | "about 10⁵ times smaller" | Keep (1.2 × 10⁵). |
| H17 | FRQ:67–70, 1(c) | "(The approximation would have given 0.01342 and pH 1.87. The difference is small here, which is exactly why the 5% test must be run rather than guessed.)" | **Change.** "(The shortcut would have given 0.01342 M and pH 1.87. The two answers differ by 0.01 here. The check is what tells you whether they would.)" |
| H18 | WS1:65–68 | "$K_w$ increases with temperature…" | Keep. |
| H19 | WS1:30–32 | water's two unshared pairs | Keep. |
| H20 | WS5:39–40, 2(d); L:662, 12(b); L:636–637 | "7.00 — only Na⁺ and Cl⁻ remain"; "At 7."; "equivalence does not mean pH 7 unless both acid and base were strong" | **Change.** "7.00 at 25 °C"; "At 7, at 25 °C."; the third stays, since the page says once that every solution is at 25 °C. |
| H21 | L:443–445, 8(c) | "HClO₃. With the same number of oxygens, the more electronegative central atom withdraws more density" | **Change.** "HClO₃ is expected to be the stronger. With the same number of oxygen atoms…" |
| H22 | L:24–25; FRQ:19–21 | "second only to Unit 3"; "the second-heaviest unit" | Keep: "11 to 15 percent of the AP exam, second only to Unit 3". |
| H23 | L:40–43; FRQ:18–27 | "three CED exclusions apply… None is asked" | **Change.** One sentence of each introduction: "The concentrations along the titration curve of an acid with more than one proton, and a solubility calculated from a pH, are not on the AP exam, and nothing here asks for them." |
| H24 | WS2:89–91 | "pulled away from an increasingly negative anion" | Keep. |
| H25 | L:145–148 | 5 M acetic acid against 0.0001 M HCl | Keep (9.5 × 10⁻³ M against 1.0 × 10⁻⁴ M). |
| H26 | L:552–556 | acetic acid alone does not buffer | Keep. |

For H2, multiplied out: with 0.050 M fluoride at the equivalence point the pH is 7.92, and with 0.10 M, 8.07. With p$K_a$ = 3.14, the acid is 82.0 percent titrated at pH 3.8, 99.45 percent at pH 5.4, 99.86 percent at pH 6.0 and 99.997 percent at pH 7.6; pH 9.6 is reached 0.08 percent past the equivalence point. So thymol blue and bromothymol blue each change within a drop of it, and bromocresol green starts with 18 percent of the acid left.

Also kept, with "about" where the source has none: "about two units higher" (L:272, 2.02); "about three times the fraction" (L:319, 3.16); "forty times" (L:369, exactly 40); "a ratio near 80 to 1" (L:608, 79.4).

### Numbers (design, 4.6): every carried value and every percentage

Multiplied out by the controller (`carried.py`). "Rival" is the answer the source's printed step gives.

| Where | Source prints | The site shows | Multiplied out | Rival |
|---|---|---|---|---|
| Worksheet 2, 5(b), 5(c) | 3.1 × 10⁻⁶; 5.51 | 3.2 × 10⁻⁶; 5.50 (W7) | above | 3.1 × 10⁻⁶; 5.51; and 5.49 from the rounded 3.2 × 10⁻⁶ |
| Worksheet 2, 6(a) | $x$ = 1.64 × 10⁻³; pOH 2.78; pH 11.22 | $x$ = 1.643 × 10⁻³; pOH 2.78; pH 11.22 | √(1.8 × 10⁻⁵ × 0.150) = √(2.7 × 10⁻⁶) = 1.6432 × 10⁻³; −log(1.643 × 10⁻³) = 2.784; 14.00 − 2.78 = 11.22 | −log(1.64 × 10⁻³) = 2.785: 2.79 and 11.21 |
| Worksheet 2, question 7, stem | "$x = 1.64 \times 10^{-3}$… reports pH = 2.78" | "$x = 1.643 \times 10^{-3}$… reports pH = 2.78" | as 6(a) | 2.79 |
| Worksheet 3, 5(c) | $x$ = 1.06 × 10⁻⁵; pOH 4.98; pH 9.02 | $K_b$ = 5.556 × 10⁻¹⁰ carried from (b), whose answer stays 5.6 × 10⁻¹⁰; $x$ = 1.054 × 10⁻⁵; pOH 4.98; pH 9.02 | 5.556 × 10⁻¹⁰ × 0.20 = 1.1112 × 10⁻¹⁰; its root, 1.0541 × 10⁻⁵; −log(1.054 × 10⁻⁵) = 4.977; 14.00 − 4.98 = 9.02 | −log(1.06 × 10⁻⁵) = 4.975: 4.97 and 9.03 |
| Worksheet 3, question 6 | $K_b$ = 1.4 × 10⁻¹¹; $x$ = 2.0 × 10⁻⁶; pOH 5.69; pH 8.31 | $K_b$ = 1.4 × 10⁻¹¹ (1.389 × 10⁻¹¹ carried); $x$ = 2.04 × 10⁻⁶; pOH 5.69; pH 8.31 | 1.0 × 10⁻¹⁴ ÷ 7.2 × 10⁻⁴ = 1.3889 × 10⁻¹¹; × 0.30 = 4.167 × 10⁻¹²; its root, 2.0413 × 10⁻⁶; −log(2.04 × 10⁻⁶) = 5.690; 14.00 − 5.69 = 8.31 | −log(2.0 × 10⁻⁶) = 5.699: 5.70 and 8.30 |
| Worksheet 3, 7(c) | "by a factor of about 37" | "by a factor of about 37" | **A tie:** 2.7 × 10⁻² ÷ 7.2 × 10⁻⁴ = 37.5 exactly, from the two values on the page; unrounded, 0.02683 ÷ 7.2 × 10⁻⁴ = 37.3 | 38 |
| Worksheet 4, 4(d) | 4.72 | 4.72, shown as 4.74 + log(0.49/0.51) = 4.74 − 0.02 | log(0.49/0.51) = −0.0174; 4.7226 | 4.73, from $K_a$ = 1.8 × 10⁻⁵ (p$K_a$ 4.7447), which the page no longer gives |
| Worksheet 4, 7(c) | "2.0% against B's 50.5% — about 25 times better" | "by 2.0%, and B's by 50.5%, more than 25 times as much" | A: 0.99/1.01 = 0.9802, a change of 1.98%. B: 0.99/0.02 = 49.5, from 100, a change of 50.5%. 50.5 ÷ 1.98 = 25.5 (**near a tie** at two figures) | 25, or 26 |
| Worksheet 5, 5(b) | 9.25 | 9.25, the p$K_a$ the page gives | −log(5.6 × 10⁻¹⁰) = 9.252 | 9.26, from 1.0 × 10⁻¹⁴ ÷ 1.8 × 10⁻⁵ = 5.556 × 10⁻¹⁰ |
| Worksheet 5, 5(c) | $x$ = 4.3 × 10⁻⁶; pH 5.36 | $x$ = 4.32 × 10⁻⁶; pH 5.36, with the $K_a$ of NH₄⁺ the page gives, 5.6 × 10⁻¹⁰ | 5.0 ÷ 150.0 = 0.0333; 5.6 × 10⁻¹⁰ × 0.0333 = 1.8648 × 10⁻¹¹; its root, 4.318 × 10⁻⁶; −log(4.32 × 10⁻⁶) = 5.3645 (**near a tie**) | 5.37, from −log(4.3 × 10⁻⁶) = 5.367, and from $K_w/K_b$ unrounded (5.366) |

**The twelve percentages added, and one more.** Each is $x$ over the starting concentration, with the $x$ the answer shows:

| Where | Solution | $x$ shown | Check |
|---|---|---|---|
| Worksheet 2, 2(c) | 0.0500 M HCN | √(6.2 × 10⁻¹⁰ × 0.0500) = √(3.1 × 10⁻¹¹) = 5.57 × 10⁻⁶; pH = 5.25 | 0.011% |
| Worksheet 2, 6(a) | 0.150 M NH₃ | 1.643 × 10⁻³ | 1.1% |
| Worksheet 2, 6(b) | 0.400 M NH₃ | √(7.2 × 10⁻⁶) = 2.68 × 10⁻³; pOH 2.57; pH 11.43 | 0.67% |
| Worksheet 2, 6(c) | 0.100 M NH₃ | √(1.8 × 10⁻⁶) = 1.34 × 10⁻³; pOH 2.87; pH 11.13 | 1.3% |
| Worksheet 3, 5(c) | 0.20 M acetate | 1.054 × 10⁻⁵ | 0.0053% |
| Worksheet 3, question 6 | 0.30 M fluoride | 2.04 × 10⁻⁶ | 0.00068% |
| Worksheet 5, 3(b) | 0.10 M acetic acid | √(1.8 × 10⁻⁶) = 1.34 × 10⁻³; pH 2.87 | 1.3% |
| Worksheet 5, 3(d) | 0.050 M acetate | 5.3 × 10⁻⁶ (the source's) | 0.011% |
| Worksheet 5, 5(c) | 0.0333 M NH₄⁺ | 4.32 × 10⁻⁶ | 0.013% |
| Worksheet 5, 8(b) | 0.100 M HOCl | 5.9 × 10⁻⁵ (the source's) | 0.059% |
| Worksheet 5, 8(e) | 0.0500 M OCl⁻ | 1.2 × 10⁻⁴ (the source's) | 0.24% |
| Ladder 12's example, equivalence | 0.0500 M acetate | 2.500 mmol ÷ 50.00 mL = 0.0500 M; $K_b$ = 5.6 × 10⁻¹⁰; $x$ = 5.3 × 10⁻⁶; pOH 5.28; pH 8.72 | 0.011% |
| Ladder 12's example, start (the thirteenth) | 0.100 M acetic acid | 1.34 × 10⁻³; pH 2.87 | 1.3% |

Already shown by the sources and kept: Worksheet 2, 2(a) (1.3%) and 2(b) (0.026%); Ladder 5's example (0.95%) and 5(c) (0.63%); free-response 1(b) (5.4%, the check that fails).

**Free-response 1(c), the quadratic, split for a phone** (each line multiplied out):

```
x² + (7.2 × 10⁻⁴)x − 1.8 × 10⁻⁴ = 0
(7.2 × 10⁻⁴)² + 4(1.8 × 10⁻⁴) = 5.2 × 10⁻⁷ + 7.2 × 10⁻⁴ = 7.205 × 10⁻⁴
√(7.205 × 10⁻⁴) = 0.02684
x = (−0.00072 + 0.02684) ÷ 2 = 0.01306 M
pH = −log(0.01306) = 1.88
```

(7.2 × 10⁻⁴ × 0.250 = 1.8 × 10⁻⁴; (7.2 × 10⁻⁴)² = 5.184 × 10⁻⁷; the sum, 7.20518 × 10⁻⁴; its root, 0.026842; $x$ = 0.013061; pH 1.884.)

## The seven documents

| Order | File in `src/content/practice/unit-8/` | Title | Kind | Source |
|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | `u08-selfstudy.tex` |
| 2 | `worksheet-1-conjugate-pairs-ph-and-strong-acids.mdx` | Worksheet 1: Conjugate pairs, pH and strong acids | `worksheet` | `worksheets/u08-ws1.tex` |
| 3 | `worksheet-2-weak-acids-and-weak-bases.mdx` | Worksheet 2: Weak acids and weak bases | `worksheet` | `worksheets/u08-ws2.tex` |
| 4 | `worksheet-3-structure-pka-and-salts.mdx` | Worksheet 3: Structure, pKa and salts | `worksheet` | `worksheets/u08-ws3.tex` |
| 5 | `worksheet-4-buffers-and-the-henderson-hasselbalch-equation.mdx` | Worksheet 4: Buffers and the Henderson–Hasselbalch equation | `worksheet` | `worksheets/u08-ws4.tex` |
| 6 | `worksheet-5-titrations-indicators-and-a-long-free-response-question.mdx` | Worksheet 5: Titrations, indicators and a long free-response question | `worksheet` | `worksheets/u08-ws5.tex` |
| 7 | `free-response-set.mdx` | Free-response set | `free-response` | `u08-frq.tex` |

A `title` and a question's `title` are plain strings: "pKa" and "K_w", not math.

**Starting expected files.** `scratchpad/unit8-practice/expected/<name>.json` holds, for each page, the audit lines this plan makes certain (made by `seed-expected.mjs` from the sources with the audit's own reader): the Quick review left out, every `H+` of the source, every equation that gains state symbols, every topic label that changes, the numbers the corrections and carried values remove, and Worksheet 5's six rubric lines. Each writer completes its file as the audit asks (every number and formula the page adds), and removes any starting line the audit reports as stale.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-8-practice-design`, from `main`. This plan and the design. Commit `docs: add the Unit 8 practice design and plan`; merge when the check passes.

---

## Group B: Worksheets 1 to 5 (pull request B)

Branch `topic/unit-8-practice-worksheets`, from `topic/unit-8-practice-design`.

### Task 1: Convert Worksheets 1 to 5

> **As carried out (2026-11-27), Tasks 1 to 3.** Five writers converted the worksheets in parallel into the scratch folder; each audit was clean on the first pass. Each page then had a fact-check, a fixer, and one second check of all five that built the pages and measured them. Pull request 97.

One writer per worksheet, in parallel, writing files only, into `scratchpad/unit8-practice/staging/`, completing its audit's expected file in `scratchpad/unit8-practice/expected/`. Each gets: `scratchpad/unit8-practice/writer-brief.md`; Plan 3's conversion guide; this plan's "Facts", "Conventions" (the layout rules) and "What Unit 8 adds"; its own entry below; its source `.tex`; a finished worksheet as the model (`src/content/practice/unit-6/worksheet-2-calorimetry-and-phase-changes.mdx`; for an ICE table on a practice page, `unit-7/worksheet-3-ice-tables.mdx`; for Worksheet 5's scored question, `unit-6/worksheet-4-bond-and-formation-enthalpies-and-a-long-free-response-question.mdx`, question 8); and the Unit 8 lessons for the terms.

**Worksheet 1** (`u08-ws1.tex`):

```yaml
---
title: "Worksheet 1: Conjugate pairs, pH and strong acids"
kind: worksheet
order: 2
topics: ["8.1", "8.2", "8.3", "8.6"]
summary: Nine questions on conjugate acid–base pairs, converting among pH, pOH and concentrations, neutral water at another temperature, and the pH of strong acids and strong bases.
---
```

| Q | Title | `topic` | Source's tag | Parts |
|---|---|---|---|---|
| 1 | Four conjugates | 8.1 | 8.1 | a to d |
| 2 | Labeling an equilibrium | 8.1 | 8.1 | none |
| 3 | Water as a base | 8.1 | 8.1 | none |
| 4 | The strength of a conjugate | 8.1, 8.3 | 8.1 | a to e |
| 5 | pH and pOH conversions | 8.1 | 8.2 | a to e |
| 6 | Neutral water at 50 °C | 8.1 | 8.2 | none |
| 7 | Strong acids and strong bases | 8.2 | 8.2 | a to e |
| 8 | A missing factor of two | 8.2 | 8.2 | none |
| 9 | The six strong acids | 8.2, 8.6 | 8.2 | none |

On this page:
- **Introduction.** The strip's three relationships as displays, with $[\ce{H3O+}]$: pH = −log[H₃O⁺]; pH + pOH = 14.00; $K_a \times K_b = K_w = 1.0 \times 10^{-14}$ (for a conjugate pair). **Leave out the strip's list of the six strong acids**: it is the answer to question 9. The subtitle's idea as a sentence: neutral means $[\ce{H3O+}] = [\ce{OH-}]$, not pH 7. One sentence that topic 4.8 taught conjugate pairs and questions 1 to 4 use them. The H₃O⁺ sentence; the 25 °C sentence (question 6 is the one at another temperature).
- **Question 2.** The equation has its state symbols already; split it at the arrow.
- **Question 3.** "…which is exactly what accepting a proton means."
- **Question 4(e).** "Cl⁻ is the conjugate base of a strong acid, so it is so weak a base that it essentially never takes a proton from water; among the rest…"
- **Question 5.** $[\ce{H3O+}]$ in parts a and b. Part e's answer is "1,000".
- **Question 6.** $[\ce{H3O+}]$ twice. No number is given or asked.
- **Question 7(e).** 12.00 is right (Facts, 8). Part d's working as three displays.
- **Question 9.** "H₂SO₄ (its first proton)" in the list, as lesson 8.2 has it. H4: "mainly because".
- No equation gains state symbols on this page. No correction, carried value or percentage.

**Worksheet 2** (`u08-ws2.tex`):

```yaml
---
title: "Worksheet 2: Weak acids and weak bases"
kind: worksheet
order: 3
topics: ["8.2", "8.3"]
summary: Eight questions on the pH of a weak acid or a weak base from its ionization constant, the 5 percent check, percent ionization, and finding a constant from a measured pH.
---
```

| Q | Title | `topic` | Source's tag | Parts |
|---|---|---|---|---|
| 1 | Setting up the table | 8.3 | 8.3 | none |
| 2 | Three weak acids | 8.3 | 8.3 | a to c |
| 3 | Strong is not concentrated | 8.2, 8.3 | 8.3 | none |
| 4 | Percent ionization | 8.3 | 8.3 | a to c |
| 5 | An ionization constant from a pH | 8.3 | 8.3 | a to c |
| 6 | Ammonia at three concentrations | 8.3 | 8.3 | a to c |
| 7 | A pOH reported as a pH | 8.3 | 8.3 | none |
| 8 | Acids with more than one proton | 8.3 | 8.3 | a to c; **b and c `beyond`** |

On this page:
- **Introduction.** "Use these values" as a table (acid or base, constant): HF, $K_a$ 7.2 × 10⁻⁴; HC₂H₃O₂, 1.8 × 10⁻⁵; HOCl, 3.5 × 10⁻⁸; HCN, 6.2 × 10⁻¹⁰; NH₃, $K_b$ 1.8 × 10⁻⁵; then $K_w$. The strip's "Always run the 5% check" becomes: "Whenever you leave $x$ out, do the check and write its percentage in your answer." The subtitle's idea: for a base, $x$ is $[\ce{OH-}]$, so find the pOH first.
- **Question 1** is the one place an equation and a table are added. Its answer: the ionization equation, `\ce{HOCl(aq) + H2O(l) <=> H3O+(aq) + OCl-(aq)}`, split at the arrow; the sentence "Every value is in M"; the ICE table as lesson 8.3 lays it out (empty first header cell; columns HOCl, H₃O⁺, OCl⁻; rows I: 0.250, 0, 0; C: −x, +x, +x; E: 0.250 − x, x, x); then $K_a = x^2/(0.250 - x)$ as a display. **Check the table at 320 px.** If it scrolls, merge the two ion columns into one headed "H₃O⁺ and OCl⁻ (each)".
- **Question 2.** The stem ends "…and show the check." Parts a and b: the source's working, then the check as in "The check" above (1.3%; 0.026%). Part c gains its working and its check (the table of percentages).
- **Question 3.** $[\ce{H3O+}] = 0.10$ M. H1.
- **Question 4(b).** The given $[\ce{H3O+}] = 4.24 \times 10^{-4}$ M stays (Facts, 9). Part c: $x \approx \sqrt{K_a C_0}$ stays inline; it is short.
- **Question 5.** W7, in all three parts.
- **Question 6.** Carried value in part a; a check in every part (the two tables under "Numbers"). Each answer says that $x$ is $[\ce{OH-}]$.
- **Question 7.** The stem's $x$ becomes $1.643 \times 10^{-3}$. Answer: "For a base, $x$ is $[\ce{OH-}]$, not $[\ce{H3O+}]$. Taking −log $x$ gives the pOH, so pH = 14.00 − 2.78 = 11.22. They reported a basic solution as an acidic one; a quick check of the direction would have caught it."
- **Question 8.** Stem: "Phosphoric acid, H₃PO₄, can give up three protons, one at a time. Its three ionization constants are…". Part a keeps its answer and has no label. Parts b and c carry `beyond`. Part b: "…contributes a negligible amount of H₃O⁺ beside the first." Part c: H15. No "polyprotic".
- Equations that gain state symbols: none (the page's one equation is the one added).

**Worksheet 3** (`u08-ws3.tex`):

```yaml
---
title: "Worksheet 3: Structure, pKa and salts"
kind: worksheet
order: 4
topics: ["8.3", "8.4", "8.6", "8.8"]
summary: Eight questions on pKa, how a molecule's structure sets its acid strength, whether a salt solution is acidic, basic or neutral, the common-ion effect, and what makes a buffer.
---
```

| Q | Title | `topic` | Source's tag | Parts |
|---|---|---|---|---|
| 1 | Three values of pKa | 8.3 | 8.7 | a to d |
| 2 | Structure and acid strength | 8.6 | 8.6 | a to d |
| 3 | Five salt solutions | 8.4 | 8.7 | a to e |
| 4 | Sodium chloride and sodium cyanide | 8.4 | 8.7 | none |
| 5 | The pH of a sodium acetate solution | 8.4 | 8.7 | a to c |
| 6 | The pH of a sodium fluoride solution | 8.4 | 8.7 | none |
| 7 | The common-ion effect | 8.4 | 8.4 | a to c |
| 8 | Buffer or not? | 8.8 | 8.4 | a to d |

On this page:
- **Introduction.** p$K_a = -\log K_a$, and a lower p$K_a$ means a stronger acid; $K_b = K_w/K_a$ for a conjugate pair; the table: HF 7.2 × 10⁻⁴, HC₂H₃O₂ 1.8 × 10⁻⁵, HCN 6.2 × 10⁻¹⁰, NH₃ ($K_b$) 1.8 × 10⁻⁵. **Add $K_w = 1.0 \times 10^{-14}$ at 25 °C**, which the strip leaves out and questions 5 and 6 need. The subtitle's idea: for each ion of a salt, ask whether it is the conjugate of something weak.
- **Question 2.** Part c: H5. Part d: the ranking stays as the whole answer, with one sentence that HOCl is the HClO of part c.
- **Question 3(a).** "neutral: neither ion reacts with water".
- **Question 4.** "Both hold Na⁺, the cation of the strong base NaOH, which does not react with water. Cl⁻ is the conjugate base of the strong acid HCl, so it is so weak a base that it essentially never takes a proton from water. CN⁻ is the conjugate base of the very weak acid HCN, so it takes protons from some of the water molecules and makes OH⁻." (H7)
- **Question 5.** Part a's prompt: "Write the equation for the reaction of the acetate ion with water." Its equation has every state symbol already; split it at the arrow. Part b keeps 5.6 × 10⁻¹⁰. Part c: carried values and the check.
- **Question 6.** Carried values and the check.
- **Question 7.** $[\ce{H3O+}]$ in the stem and in part a. Part c's prompt: "Use Le Châtelier's principle to explain why less of the acid ionizes." Its answer keeps "by a factor of about 37" (a tie, under "Numbers"; do not show the division).
- **Question 8.** Part b: "not a buffer: HCl is strong, and Cl⁻ is a spectator". Part d: "not a buffer: no weak conjugate pair is present".
- Equations that gain state symbols: none.

**Worksheet 4** (`u08-ws4.tex`):

```yaml
---
title: "Worksheet 4: Buffers and the Henderson–Hasselbalch equation"
kind: worksheet
order: 5
topics: ["8.4", "8.8", "8.9", "8.10"]
summary: Nine questions on the pH of a buffer, what a buffer does with added acid or base, buffer capacity, and choosing a conjugate pair for a wanted pH.
---
```

| Q | Title | `topic` | Source's tag | Parts |
|---|---|---|---|---|
| 1 | Where the equation comes from | 8.9 | 8.9 | none; **the question `beyond`** |
| 2 | Four buffers | 8.9 | 8.9 | a to d |
| 3 | Above or below the pKa | 8.9 | 8.9 | none |
| 4 | A buffer meets a strong base | 8.8, 8.10 | 8.10 | a to f; **the question `beyond`** |
| 5 | Two steps, in order | 8.4, 8.10 | 8.10 | none |
| 6 | Hydroxide in the wrong table | 8.4, 8.10 | 8.10 | none |
| 7 | Two buffers and the same acid | 8.10 | 8.10 | a to d |
| 8 | A buffer for a wanted pH | 8.9, 8.10 | 8.10 | a to d |
| 9 | One pH, two capacities | 8.10 | 8.8 | a, b |

On this page:
- **Introduction.** The six p$K_a$ values as a table (acid, p$K_a$): HF 3.14; HNO₂ 3.40; HC₂H₃O₂ 4.74; HOCl 7.46; HCN 9.21; NH₄⁺ 9.25; then $K_w$. **Leave out the strip's $K_a$ of acetic acid**: no question uses it, and it gives 4.73 where the p$K_a$ gives 4.72 in 4(d). One sentence: "Tables round a little differently (lesson 8.6 gives acetic acid's p$K_a$ as 4.76). Use the values a question gives." The subtitle's idea: react first, in a table of moles; then the Henderson–Hasselbalch equation.
- **Question 1** (`beyond`). The derivation with $[\ce{H3O+}]$, as five short displays, each split at its equals sign: $K_a = [\ce{H3O+}][\ce{A-}]/[\ce{HA}]$; $[\ce{H3O+}] = K_a[\ce{HA}]/[\ce{A-}]$; the negative logarithm of both sides; pH = p$K_a$ − log([HA]/[A⁻]); pH = p$K_a$ + log([A⁻]/[HA]), with the source's sentence that turning the fraction over changes the sign of its logarithm.
- **Question 2.** Each Henderson–Hasselbalch line in three rows with `aligned`. Part c: 3.14 + log(0.25/0.50) = 3.14 − 0.30 = 2.84 (Facts, 9).
- **Question 3.** "question 2"; "more base form than acid form".
- **Question 4** (`beyond`). Part b's equation gains state symbols: `\ce{OH-(aq) + HC2H3O2(aq) -> C2H3O2-(aq) + H2O(l)}`. Part d shows its line (under "Numbers"). Part f: "…The buffer turns the added OH⁻ into its own base form, a weak base, instead of letting $[\ce{OH-}]$ build up."
- **Question 5.** "Step 1, the table of moles: the strong acid or base reacts to completion, turning one member of the conjugate pair into the other. Work in moles; no equilibrium constant appears. Step 2, equilibrium: put the new amounts into the Henderson–Hasselbalch equation. The first is a limiting-reactant calculation and the second an equilibrium calculation, and they must not be combined."
- **Question 6.** W5.
- **Question 7.** Stem: "Buffer capacity. Two acetate buffers, 1.00 L of each, each receive 0.01 mol of H₃O⁺ from a strong acid. In each part the ratio is $[\ce{C2H3O2-}]$ over $[\ce{HC2H3O2}]$." Part c: H13. Part d: "equal amounts, so pH = p$K_a$; within about one unit of the p$K_a$".
- **Question 8.** "…choose the best acid from the table at the top of this page and give the ratio of base form to acid form it needs". Part c: H14. Part d: W6.
- **Question 9.** Part b: "…X holds 100 times as much of each form in the same volume…".
- Equations that gain state symbols: one (4(b)).

**Worksheet 5** (`u08-ws5.tex`):

```yaml
---
title: "Worksheet 5: Titrations, indicators and a long free-response question"
kind: worksheet
order: 6
topics: ["8.3", "8.4", "8.5", "8.7", "8.9", "8.11"]
summary: Seven questions on titration curves, indicators, and pH and solubility, then one 10-point free-response question on a weak acid titrated with a strong base, with its scoring rubric.
points: 10
---
```

| Q | Title | `topic` | Source's tag | Parts |
|---|---|---|---|---|
| 1 | Four stretches of one curve | 8.5 | 8.5 | a to d |
| 2 | A strong acid with a strong base | 8.4, 8.5 | 8.5 | a to d |
| 3 | Acetic acid with sodium hydroxide | 8.5 | 8.5 | a to e |
| 4 | Two curves compared | 8.5 | 8.5 | a to c |
| 5 | Ammonia with hydrochloric acid | 8.5 | 8.5 | a to d |
| 6 | Indicators | 8.7 | 8.5 | a to e |
| 7 | pH and solubility | 8.11 | 8.11 | a to e |
| 8 | Hypochlorous acid titrated | 8.3, 8.4, 8.5, 8.7, 8.9 | 8.3, 8.5, 8.9 | a to f; `points={10}` |

On this page:
- **Introduction.** Two tables. Constants (substance, constant, p$K_a$): HC₂H₃O₂, $K_a$ 1.8 × 10⁻⁵, 4.74; HOCl, $K_a$ 3.5 × 10⁻⁸, 7.46; NH₃, $K_b$ 1.8 × 10⁻⁵, none; NH₄⁺, $K_a$ 5.6 × 10⁻¹⁰, 9.25; then $K_w$. Indicators (indicator, changes over pH): methyl red, 4.4 to 6.2; bromothymol blue, 6.0 to 7.6; phenolphthalein, 8.2 to 10.0. One sentence that a question gives the indicator table it wants, and that this one is not lesson 8.7's. The subtitle's idea: say what the flask holds before you choose a method. "FRQ (10 points)" becomes a sentence: the last question is written like one of the AP exam's long free-response questions and has a scoring rubric.
- **Question 1.** Stem: "For a weak acid titrated with a strong base, say what the flask holds and how the pH is found in each stretch." Answers: "HA only: an ICE table with $K_a$"; "HA and A⁻, a buffer: the Henderson–Hasselbalch equation"; "A⁻ only: an ICE table with $K_b$"; "excess OH⁻: a strong base alone".
- **Question 2.** Part c with H₃O⁺: 2.50 − 1.00 = 1.50 mmol in 35.0 mL; $[\ce{H3O+}]$ = 0.0429 M; pH 1.37. Part d: H20.
- **Question 3.** Part b gains its $x$ and its check. Part c: "The half-equivalence point: $[\ce{HA}] = [\ce{A-}]$, so the log term is zero and pH = p$K_a$ = 4.74." Part d: the source's working as four displays, then the check (0.011%). Part e: "…acetate, the conjugate base of a weak acid, which takes protons from water and makes OH⁻."
- **Question 4.** W1, in the stem and in part a. Part b: "No: 7.00 for HCl and 8.72 for acetic acid. The acetic acid titration leaves acetate, a weak base that reacts with water; the HCl titration leaves only Cl⁻, a spectator."
- **Question 5.** Part b: "the half-equivalence point"; 9.25 stays. Part c: carried $x$ and the check. Part d: "only NH₄⁺, a weak acid, is left (with Cl⁻, a spectator)".
- **Question 6.** Part a has two blanks in one sentence: both answers in one `<Answer>` ("a weak acid"; "color"). Part c: "endpoint". Parts d and e: "question 3", "question 5".
- **Question 7.** Stem: "pH and solubility, in words only." Part a: "…Only then does added H₃O⁺ take the anion out of solution." Part b: W4. Part c: "No: its conjugate acid, HCl, is strong." Part d: "Yes: its conjugate acid, H₂O, is a very weak acid." Part e: H8, and "…Cl⁻ is the conjugate base of a strong acid and essentially never takes a proton. What matters is how strong a base the anion is, not how strong the acid is."
- **Question 8.** The stem gives its own data after the source's sentence: "$K_a$ of HOCl is 3.5 × 10⁻⁸ (p$K_a$ 7.46)", $K_w$, and the indicator table again (three rows, two columns). Parts b and e gain their checks. Part c: "half the equivalence volume… the log term is zero". Part d: the millimoles and the Henderson–Hasselbalch line in three rows. Part f: W2. Then the `<Rubric>`, six lines, each on one line, points 1, 2, 2, 2, 2, 1:
  - a: "25.00 mL."
  - b: "1 point for a correct setup, with $x$ as the square root of $K_a$ times the starting concentration; 1 point for pH = 4.23."
  - c: "1 point for pH = 7.46; 1 point for reasoning that identifies the half-equivalence point and states that $[\ce{HA}] = [\ce{A-}]$. Naming the value with no reasoning earns 1."
  - d: "1 point for a correct table of moles, in millimoles; 1 point for pH = 8.06."
  - e: "1 point for the dilution to 50.00 mL and $K_b$ from $K_w$ divided by $K_a$; 1 point for pH = 10.08 by way of the pOH. Reporting −log $x$ as the pH earns 0 for that point."
  - f: "1 point for phenolphthalein with a justification tied to the equivalence pH. Naming it alone earns 0."
- Equations that gain state symbols: none. The page prints no equation, as its source prints none.

### Task 2: Finish the conversion of Group B

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 8's paths: copy the five files in; build and test; audit each worksheet (`node scripts/practice-audit.mjs /home/user/sahangh/ap_chem_prep/Units/unit08-acids-bases/worksheets/u08-wsN.tex src/content/practice/unit-8/<name>.mdx <scratch>/unit8-practice/expected/<name>.json`) to `0 unexplained, 0 stale`; run `node scripts/us-spelling.mjs` on each; measure each page at 412, 390, 360 and 320 px with every answer open; one fact-check per worksheet (`scratchpad/unit8-practice/factcheck-brief.md`).

The fact-check brief is Unit 6's with these in place of its Unit 6 items:

- **Solve first; then recompute every number** unrounded and check that each printed result follows from the step shown. **Do not report an answer because the full equation, with $x$ kept, gives a neighbor** (Facts, 9): the shortcut is the method, and the question is whether its check passes and is shown.
- **Every check:** wherever $x$ is left out, the percentage is there, follows from the $x$ shown, and has its verdict.
- **Every base:** pOH first; the hydroxide ions of a formula unit counted; no pOH reported as a pH.
- **Every equation** balanced in atoms and charge, with a state symbol on every species, the right arrow (double for a weak acid or base with water; single for a strong acid in water and for any reaction with a strong acid or strong base as a reactant), and H₃O⁺, never a bare H⁺.
- **Every conjugate** one proton away from its partner.
- **Every $K_a$, $K_b$, p$K_a$ and indicator range a question uses is given** on the page, in the stem or the introduction's tables, and none differs from the source without this plan naming it. Report a value only if it is wrong for chemistry, not for differing from a lesson.
- **Each term against the lessons:** no "hydrolysis", "dissociate", "halfway point", "major species", "inert", "5 percent rule"; "table of moles" against "ICE table".
- **Each "Beyond the exam" label**, and anything else the framework does not ask for.
- **Report any sentence that settles more than the lessons do** ("only", "always", "never", "every").

Differences the audit is expected to print, beyond the starting files: the numbers and formulas each introduction adds; every `H3O+`; every carried value and percentage; Worksheet 2, question 1's table; Worksheet 4, question 7's "1.00"; Worksheet 5, question 8's repeated data; "1,000" on Worksheet 1.

### Task 3: Open pull request B

- [ ] **Decide each fact-check finding** (recomputing any correction to a number); one fixer per worksheet for the accepted ones, each bringing its audit back to clean; build, test, audit and measure again; a second fact-check of all five pages; last fixes; measure again.
- [ ] **Commit** (`feat(practice): add Unit 8 worksheets 1 to 5`), push, open the pull request with base `main` (`feat(practice): Unit 8 worksheets 1 to 5`), and merge it when its check passes.

The body gives each document's questions and points, each audit's last line, what the fact-checks found, the labels, the models used, test and build output, and, set apart, **every change to the originals**: the seven corrections with old and new, the nineteen rewordings, the two answers that changed, the carried values, the percentages added, the data added to stems, the 19 topic labels that changed on these five pages, the state symbols added, and the scoring notes kept that a grader could read two ways (design, 4.10).

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-8-practice-ladders-frq`, from `topic/unit-8-practice-worksheets`. The two drafts are written in the scratch folder at the same time as the worksheets.

### Task 4: Convert the skill ladders and the free-response set

> **As carried out (2026-11-27), Tasks 4 to 6.** Both documents were written in the scratch folder after the worksheets had been checked, so their writers began with what those checks had found (the unit M, the check with its percentage, the pOH step). The ladders were fact-checked in two halves; the design's "As built" note lists what was found.

**Skill ladders** (`u08-selfstudy.tex`), modeled on `src/content/practice/unit-6/skill-ladders.mdx`:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10"]
summary: Twelve skills, one at a time. Each has a worked example, then four questions on the same skill to try on your own. Start here, before the worksheets.
---
```

The page has exactly thirteen `## ` headings (twelve ladders and `## If you missed some`), because the audit cuts it at each one.

| # | `## Ladder N: …` | Worked example's title | `topic` | Source's tag |
|---|---|---|---|---|
| 1 | Brønsted–Lowry pairs | Finding both pairs | 8.1 | 8.1 |
| 2 | Strong versus weak | What is in the beaker | 8.2, 8.3 | 8.1 |
| 3 | pH, pOH and K_w | All four quantities from one | 8.1 | 8.2 |
| 4 | pH of strong acids and bases | Watch the subscript | 8.2 | 8.2 |
| 5 | pH of a weak acid | The full routine | 8.3 | 8.3 |
| 6 | Percent ionization | The result that looks backward | 8.3 | 8.3 |
| 7 | pKa and acid strength | Converting and comparing | 8.3 | 8.7 |
| 8 | Structure and acid strength | The two trends | 8.6 | 8.6 |
| 9 | Acid–base properties of salts | Three salts, three verdicts | 8.4 | 8.7 |
| 10 | Buffers | pH and how it holds | 8.8, 8.9 | 8.4, 8.8, 8.9 |
| 11 | Buffer capacity | Same pH, different capacity | 8.10 | 8.10 |
| 12 | Titration curves | Reading the four regions | 8.5, 8.7 | 8.5 |

(A heading may hold math: `## Ladder 3: pH, pOH and $K_w$`, `## Ladder 7: p$K_a$ and acid strength`.) Each ladder: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.

On this page:
- **Introduction.** How a ladder works. "Unit 8 is worth 11 to 15 percent of the AP exam, second only to Unit 3." "**The distinction that costs the most points**": strength is how far an acid ionizes, concentration is how much was dissolved, and the two are independent. "**The habit that decides this unit**": before calculating any pH, ask "strong or weak?"; a strong acid's $[\ce{H3O+}]$ is its concentration, a weak one needs an equilibrium calculation with $K_a$, and treating a weak acid as strong is the most common error here. $K_w$ and the 25 °C sentence. The H₃O⁺ sentence. "Acetic acid is written CH₃COOH here (the worksheets write HC₂H₃O₂)." The scope sentence (H23).
- **Ladder 1.** "A conjugate pair differs by exactly one proton." One clause that topic 4.8 taught this. The example's equation gains state symbols: `\ce{HCO3-(aq) + H2O(l) <=> H2CO3(aq) + OH-(aq)}`. H12. "A species such as HCO₃⁻ can take a proton or give one up (the word for this is amphiprotic): here it is a base, but with a stronger acid present it would give a proton instead." Part c's equation gains states and keeps its order: `\ce{CH3COOH(aq) + H2O(l) <=> CH3COO-(aq) + H3O+(aq)}`. Part d's answer is the key's equation, which has its states, and the key's sentence ("which is what makes it amphiprotic") stays.
- **Ladder 2.** The example's two equations are rewritten with water: `\ce{HCl(aq) + H2O(l) -> H3O+(aq) + Cl-(aq)}` and `\ce{CH3COOH(aq) + H2O(l) <=> H3O+(aq) + CH3COO-(aq)}`. "0.10 M H₃O⁺, 0.10 M Cl⁻ and almost no intact HCl." H10. "On a particle drawing, the weak acid must show mostly whole molecules. Drawing it fully ionized is the standard mistake." Part d: "…5 M acetic acid has a higher $[\ce{H3O+}]$ than 0.0001 M HCl, though it is the weaker acid."
- **Ladder 3.** The two definitions with $[\ce{H3O+}]$. H11. The paragraph on significant figures stays.
- **Ladder 4.** The example is free-response 3(a), word for word; keep it (design, 4.8). "…assuming that it comes apart into its ions completely." H9. Part d: "…the concentration on the label is $[\ce{H3O+}]$… A weak acid ionizes only slightly, so $[\ce{H3O+}]$ is far smaller than the concentration on the label and must be found from the $K_a$ equilibrium."
- **Ladder 5.** The example's equation is rewritten with water (as Ladder 2's), "with $x = [\ce{H3O+}]$ formed". "**Check it:**" then the display $1.90 \times 10^{-3} / 0.200 \times 100\% = 0.95\%$ and "Well under 5 percent, so the shortcut holds." The source's "no quadratic needed" goes. pH = −log(1.897 × 10⁻³) = 2.72 stays as printed. "The weak acid sits about two units higher." Part c: "0.63%, far below 5 percent, so it holds."
- **Ladder 6.** The definition as a display with $[\ce{H3O+}]_\text{eq}$, split over two lines. The example's stem: "For the 0.200 M acetic acid of Ladder 5's example, where $x = 1.90 \times 10^{-3}$ M, …". "about three times the fraction".
- **Ladder 7.** "forty times". No other change.
- **Ladder 8.** The example is free-response question 4 in nearly the same sentences; keep it. "Across the oxyacids". H5. Part c: H21.
- **Ladder 9.** The paragraph: "For each ion, ask whether it is the conjugate of something weak. If it is, it reacts with water; the conjugate of something strong does not." The example's two equations gain states: `\ce{NH4+(aq) + H2O(l) <=> NH3(aq) + H3O+(aq)}` and `\ce{CH3COO-(aq) + H2O(l) <=> CH3COOH(aq) + OH-(aq)}`. "Cl⁻ is a spectator." "Na⁺ is a spectator." "The rule in one line: the conjugate of something weak reacts with water; the conjugate of something strong does not." Part d's prompt: "Why does Cl⁻ not react with water while F⁻ does?"; its answer, H6.
- **Ladder 10.** The Henderson–Hasselbalch equation as a display with "base form" and "acid form" in `\text{}`, split over two lines. The example: "Added H₃O⁺ is used up by the base form", with `\ce{CH3COO-(aq) + H3O+(aq) -> CH3COOH(aq) + H2O(l)}`; "Strong acid becomes weak acid, so $[\ce{H3O+}]$ barely rises." "Added OH⁻ is used up by the acid form", with `\ce{CH3COOH(aq) + OH-(aq) -> CH3COO-(aq) + H2O(l)}`. Part c's answer is that second equation, once (the `\selfcheck` and the key repeat it).
- **Ladder 11.** The example is Worksheet 4, question 9 and free-response 2(e); keep it. Its stem gains the volume: "Two buffers, 1.00 L of each, both have pH 4.74." "Useful range: within about one unit of the p$K_a$." Part a: "…0.50 M or 0.05 M of each form, in equal volumes?" Part d: "a ratio near 80 to 1".
- **Ladder 12.** The example's stem gains the $K_a$: "…acetic acid ($K_a = 1.8 \times 10^{-5}$, p$K_a$ = 4.74)…". Start: "pH 2.87 from the $K_a$ calculation ($x = 1.34 \times 10^{-3}$ M; the check gives 1.3%), not 1.00, because the acid is weak." Equivalence: "all the acid is now acetate, a weak base. It takes protons from water, so the pH is above 7", then the working and the check from the table of percentages, ending at 8.72. "This is the landmark most often missed; equivalence does not mean pH 7 unless both acid and base were strong." H3 for the indicators. Part b: H20. Part c: "the conjugate base reacts with water", with `\ce{A-(aq) + H2O(l) <=> HA(aq) + OH-(aq)}`. Part d: "centered".
- **Leave out** "Where you stand". Keep its advice as `## If you missed some`: all twelve right, move on to the worksheets and the free-response set; nine to eleven, redo the missed ladders tomorrow from a blank page; eight or fewer, the three root causes (treating a weak acid as strong and taking $[\ce{H3O+}]$ as its concentration; assuming that every equivalence point is at pH 7; confusing strength with concentration).
- Equations that gain state symbols: thirteen (Ladder 1: two, and the one-line form of 1(d), which the key's replaces; Ladder 2: two; Ladder 5: one; Ladder 9: two; Ladder 10: four, of which three are one equation; Ladder 12: one).

**Free-response set** (`u08-frq.tex`), modeled on `src/content/practice/unit-6/free-response-set.mdx`:

```yaml
---
title: "Free-response set"
kind: free-response
order: 7
topics: ["8.2", "8.3", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10", "8.11"]
summary: Five free-response questions on most of Unit 8, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

| Number | Title | `topic` | Source's tags | `points` | Rubric lines |
|---|---|---|---|---|---|
| 1 | A weak acid where the shortcut fails | 8.3 | 8.1, 8.3, 8.7 | 10 | 2, 3, 3, 2 |
| 2 | Buffers and a titration | 8.5, 8.7, 8.8, 8.9, 8.10 | 8.4, 8.5, 8.8, 8.10 | 10 | 3, 2, 2, 2, 1 |
| 3 | Strong acids and bases | 8.2 | 8.2 | 4 | 3, 1 |
| 4 | Molecular structure and acid strength | 8.6 | 8.6 | 4 | 2, 2 |
| 5 | pH and solubility, in words | 8.11 | 8.11 | 4 | 3, 1 (no `part`) |

On this page:
- **Introduction.** "This set covers most of Unit 8. Unit 8 is worth 11 to 15 percent of the AP exam, second only to Unit 3." "There are 5 questions worth 32 points. Give yourself about 50 minutes. You may use a calculator. Write out each answer in full before you open the worked answer and the scoring rubric." $K_w$ and the 25 °C sentence. The H₃O⁺ sentence. The scope sentence (H23), and: "Part c of question 1 is marked 'Beyond the exam': it needs the quadratic formula."
- **Question 1.** Part a: the equation as the source has it (every state symbol is there; split at the arrow), the $K_a$ expression as a display, and "water is the solvent, a pure liquid, and is left out". Part b: $x \approx 0.0134$ M; the check as a display, 0.0134 ÷ 0.250 = 5.4%; "Just above 5 percent, so the check fails, and the equation has to be solved with $x$ left in." Part c carries `beyond`: the five lines under "Numbers", then H17. Part d: 5.2% and 3.14, each a display. Rubric: a (2): "1 point for the equilibrium with a double arrow; 1 point for the expression with water left out." b (3): "1 point for the approximate $x$; 1 point for expressing it as a percentage; 1 point for concluding that the approximation fails." c (3): "1 point for the quadratic set up; 1 point for $x = 0.0131$; 1 point for pH 1.88. Accept 1.87 to 1.88; a student who approximated but showed the test of part b still earns full credit here." d (2): "1 point for 5.2%; 1 point for p$K_a$ = 3.14."
- **Question 2.** Part a: "The buffer holds appreciable amounts of both members of a conjugate pair." "Added H₃O⁺ is used up by the base form", with `\ce{F-(aq) + H3O+(aq) -> HF(aq) + H2O(l)}`; "Strong acid is turned into weak acid, so $[\ce{H3O+}]$ barely rises." "Added OH⁻ is used up by the acid form", with `\ce{HF(aq) + OH-(aq) -> F-(aq) + H2O(l)}`; "Strong base is turned into the weak base F⁻, so $[\ce{OH-}]$ barely rises." The closing sentence stays. Part b: the line in three rows. Part c: "…the log term is zero and pH = p$K_a$ = 3.14." **Part d** (H2) gains a table after its prompt, "Choose from these indicators" (indicator, changes over pH): bromocresol green, 3.8 to 5.4; bromothymol blue, 6.0 to 7.6; thymol blue, 8.0 to 9.6. Its answer: "At the equivalence point all the HF has become F⁻, the conjugate base of a weak acid. It takes protons from water," with `\ce{F-(aq) + H2O(l) <=> HF(aq) + OH-(aq)}`, "which makes OH⁻ and a basic solution. Thymol blue: its range (8.0 to 9.6) is the one that lies above pH 7, on the steep part of the rise. Bromocresol green (3.8 to 5.4) would start to change with about a fifth of the acid still left. Bromothymol blue (6.0 to 7.6) would also serve here: HF is one of the stronger weak acids, so its curve is already steep at pH 6." Part e is Ladder 11's example again; keep it, with "before either form runs out". Rubric: a (3): "1 point for both members of the pair being present; 1 point for the equation that uses up added H₃O⁺ (or H⁺); 1 point for the equation that uses up added OH⁻. A calculation of the change in pH is not required." b (2): "1 point for correct use of the Henderson–Hasselbalch equation; 1 point for 3.32." c (2): "1 point for pH = p$K_a$; 1 point because the pair is present in equal amounts." d (2): "1 point for saying that the fluoride ion reacts with water to give OH⁻; 1 point for thymol blue, or bromothymol blue, with a reason that ties its range to the steep rise around an equivalence point above pH 7." e (1): "The 1.0 M buffer, justified by the amounts of the pair."
- **Question 3.** Part a is Ladder 4's example again; keep it, with "assuming that it comes apart into its ions completely". Part b: W3. Rubric: a (3) as the source has it: "1 point for the factor of 2 on hydroxide; 1 point for pOH 2.00; 1 point for pH 12.00. Leaving out the factor of 2 gives 11.70 and earns at most 2." b (1): W3's line.
- **Question 4.** Part a: H5 ("Each additional oxygen atom is strongly electronegative and pulls electron density away from the O–H bond, which makes the bond more polar and the proton easier to remove. The extra oxygen atoms also spread the negative charge of the anion over more atoms, so the anion is more stable and the ionization goes further."). Part b as the source has it. Rubric: a (2): H5's first point, then "1 point for the charge spread over more oxygen atoms in the anion." b (2): "1 point for bond strength as the deciding factor; 1 point for longer, weaker H–X bonds down the group."
- **Question 5.** The stem keeps "Do not calculate." Part a: W4. Part b: "Barely changes. Chloride is the conjugate base of the strong acid HCl and is so weak a base that it essentially never takes a proton, so it does not react with H₃O⁺ to any real extent." Part c: "Increases. Hydroxide reacts with H₃O⁺ to form water, which removes a product and shifts the equilibrium right." Rubric, two lines with no `part`: (3) "1 point for each correct prediction." (1) "Justifications that consistently turn on whether the anion is the conjugate base of a weak acid. No calculation is required, and none earns credit: topic 8.11 is assessed in words only."
- Equations that gain state symbols: three (2(a), twice; 2(d)).

Scoring notes ("earns at most 2", "still earns full credit here", "consistently") are copied as the source has them, apart from the lines this task rewords.

### Task 5: Finish Group C

- [ ] **Finish as Tasks 2 and 3 do** (the ladders' first fact-check is split between two checkers, six ladders each). The second fact-check also compares Ladder 4, Ladder 8 and Ladder 11 with free-response 3(a), question 4 and 2(e), and Worksheet 5's question 7 with free-response question 5: the same chemistry must read the same in both places.

With all seven documents in place, check by hand:
- each Unit 8 lesson's "Practice next" lists the documents that have a question on its topic (lesson 8.11: Worksheet 5 and the free-response set only; lesson 8.7: Worksheet 5, the ladders and the free-response set);
- the unit page lists the seven in the order of the table "The seven documents";
- these occur nowhere under `src/content/practice/unit-8`: `\ce{H+}`, "hydrolys", "dissociat", "halfway point", "end point", "oxoacid", "bromthymol", "methyl orange", "major species", "inert", "parent", "5% rule", "5 percent rule", "threshold", "magnitude", "candidate", "polyprotic", "CED";
- no equation lacks a state symbol;
- phenolphthalein has one range (8.2 to 10.0) and appears on Worksheet 5 only.

- [ ] **Commit** (`feat(practice): add the Unit 8 skill ladders and free-response set`).

### Task 6: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Commit (`docs: record how the Unit 8 practice was built`), push, open pull request C with base `main` (`feat(practice): Unit 8 skill ladders and free-response set`), merge it when its check passes, and confirm the deploy.

Pull request C's body lists, as B's does, every change to the originals on its two pages (the 8 topic labels that changed among them), the three repeats kept (design, 4.8), and what could not be checked (design, section 8).

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The seven documents | 1, 4 |
| 2. What is left out | Guide additions; 1, 4 |
| 3. Conversion, audit, two fact-checks, corrections recomputed, scoring notes | 2, 3, 5 |
| 4.1 H₃O⁺ | Guide additions; 1, 4 |
| 4.2 Topics | The tables of Tasks 1 and 4 |
| 4.3 Values, and what a question supplies | Guide additions; 1, 4 |
| 4.4 The lessons' terms, arrows and state symbols | Guide additions; 1, 4; the hand checks of 5 |
| 4.5 Statements changed | "Corrections" and "Statements reworded"; 1, 4 |
| 4.6 Numbers | Facts, 8 and 9; "Numbers"; 1, 4 |
| 4.7 Outside Unit 8's framework | The `beyond` entries of Tasks 1 and 4 |
| 4.8 Repeats | 4, 5 |
| 4.9 Wording | Guide additions |
| 4.10 Scoring notes kept | 3, 6 |
| 5. Code | None |
| 6. Pull requests | A, 3, 6 |
| 7. Done when | 2, 3, 5, 6 |
