# ChemStudy Unit 7 Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the teacher's Unit 7 practice on chem-study.com: five worksheets, the twelve skill ladders and the free-response set, each question with a "Show answer", scored questions with their rubric, and one K_sp for each salt across the site.

**Architecture:** The practice pages built in Plan 3 take the new documents as they are: seven MDX files in `src/content/practice/unit-7/`, converted by hand from the LaTeX in `D:\AP_Chem_Prep` and checked by `scripts/practice-audit.mjs`. No code changes are expected.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-15-chemstudy-unit-7-practice-design.md`.

**Builds on:** Plan 3, `docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`, and Plan 6, `docs/superpowers/plans/2026-11-14-chemstudy-unit-2-practice.md`. Plan 3's sections "The conversion guide" and "How every conversion task ends" apply here unchanged, except where this plan says otherwise. Read both before starting.

## Facts verified before writing (do not rediscover)

Established on 2026-11-15. The full inventory of the sources is in the session scratch folder (`scratchpad/unit7-practice/inventory-report.md`).

1. **The sources** (read-only), in `D:\AP_Chem_Prep\Units\unit07-equilibrium\`: `worksheets\u07-ws1.tex` to `u07-ws5.tex`, `u07-selfstudy.tex`, `u07-frq.tex`. **The key PDFs:** `D:\AP_Chem_Prep\build\Units\unit07-equilibrium\worksheets\u07-ws1-key-print.pdf` to `u07-ws5-key-print.pdf`, `...\unit07-equilibrium\u07-selfstudy-key-print.pdf` and `u07-frq-key-print.pdf`. They are already turned into page pictures in `scratchpad/unit7-practice/pdf/` (`ws1-1.png` ..., `ladders-01.png` ..., `frq-1.png` ...).
2. **No source has a figure.** The only tables are the ladders' ICE table (Ladder 6's worked example) and the tick table, which is left out. Worksheet 4, question 8 describes three drawings of a flask in words and needs no picture.
3. **Every worksheet ends with a `spiralstrip`**, the "Quick review" the teacher left out of every practice document.
4. **Worksheet `\problem[]` tags are empty.** The topic comes from `\ced{7.N}` inside the question's text. Only Worksheet 5's question 7 is scored (10 points); its rubric is a boxed note (`apcnote`), as Unit 2's Worksheet 4's was.
5. **In the ladders, `\selfcheck` holds the one-line answers** and the key-only `apcanswer` holds the explanations, as in Units 5 and 2.
6. **The practice route, the audit and the browser tests need no change.** `src/pages/[unit]/practice/[name].astro` supplies `Answer`, `Blank`, `Lewis`, `Part`, `Question`, `Resonance`, `Rubric`, `RubricLine` and `Worked`. `Question` and `Part` take `beyond` for the "Beyond the exam" label. `tests/e2e/practice.spec.ts` makes its tests from every `src/content/practice/unit-N/` folder.
7. **A table of initial, change and equilibrium values** is written as lessons 7.4 and 7.7 write it: rows labeled I, C and E, a sentence before the table saying what they stand for and that every value is in M (or atm), a label column and at most three species columns, a true minus sign.
8. **An answer option is never math alone** (found in the Unit 7 lessons). Practice documents have no options, so this does not arise.
9. **The framework's Unit 7** is summarized from page pictures in `scratchpad/ced/unit7-framework.md`. Its two exclusions, both in topic 7.3: converting between K_c and K_p; calculations where a dissolved species is in equilibrium with the same species as a gas. The quadratic formula is neither named nor excluded.
10. **The site's K_sp values** and every practice answer that follows from them are computed by `scratchpad/unit7-practice/ksp-site-values.py`.

## Conventions for every task

Plan 3's "Conventions for every task" apply: the capital-`C:` working directory, the scratch folder for everything that is not the site, `D:\AP_Chem_Prep` read-only, Write and Edit for files (never heredocs), conventional commits with **no AI-attribution trailer**, US spelling, tests first, no swallowed errors, no preview server running during `npm run test:e2e`.

**Merging.** The teacher authorized Claude, for Unit 7 only (2026-11-14), to merge each pull request itself once its "Build and test" check passes and its content has been fact-checked. A merge deploys: wait for the deploy to succeed before the next group starts.

**Models,** as the teacher settled for this repository on 2026-11-14: writers and fact-checkers on Fable 5.2 (`model: "fable"`); fixers on Sonnet; the named reviewers on their own models. The fact-checker's independence rests on a fresh context and on solving before reading.

**No originality check.** The practice is the teacher's own material, converted as it stands by the teacher's decision of 2026-11-13. The comprehensive test, which comes after, is the part written fresh.

## What Unit 7 adds to the conversion guide

Give every writer this section with Plan 3's guide.

**Tables of initial, change and equilibrium values.** Where an answer sets one out, write it as a Markdown table in the form of lesson 7.7 (`src/content/lessons/unit-7/7-7-calculating-equilibrium-concentrations.mdx`): rows labeled I, C and E, the sentence before the table saying what the letters stand for and the unit, at most three species columns, a true minus sign (−), short cells such as `0.500 − x`. Where the source gives the rows in a sentence ("Initial: 0.500, 0, 0. Change: ..."), keep the sentence's numbers and set them in the table.

**Long calculations.** Equilibrium answers run to several lines. Every equation and substitution goes on its own line as display math, split with `aligned`, each line about 28 characters at most, with a blank line before and after. A quadratic is shown as the source shows it, one step per line.

**"Beyond the exam".** Worksheet 1, question 8 carries `beyond` on the `<Question>`. The formula K_p = K_c(RT)^Δn and the value of R leave the worksheet's opening list of relationships; they stay inside question 8, where the source's answers use them. Nothing else is labeled. Do not label the quadratic formula.

**Scope notes.** The ladders' and the free-response set's notes that the K_c to K_p conversion is excluded become one sentence of the introduction: "Converting between K_c and K_p is not on the AP exam, and nothing here asks for it." (Worksheet 1's question 8 is the one place the site shows it, under its label.)

**Other units.** Units 4, 6 and 9 are not on the site.
- Worksheet 2, question 4: "In Unit 6 you learned that combining reactions adds their ΔH values" becomes "Combining reactions adds their ΔH values (Hess's law, topic 6.9)". Keep the answer whole, including its sentence about ΔG°.
- Worksheet 3, question 1: "BCA tables from Unit 4" becomes "the before, change, after table of stoichiometry (topic 4.5)". Keep the rest.
- Do not add a topic number you are not sure of; say the idea in words and report it.

**K_sp values: copy the source's.** The source documents disagree with each other and with lesson 7.11 on several K_sp values. **Convert each document with its own numbers**, exactly as the guide says. A second pass, after the audit, moves every document to the site's values (Task 3 and Task 5). Do not anticipate it.

**Terms.** "Shifts right" and "shifts left" stay: lesson 7.9 teaches "toward products, or to the right". "Rate-limiting step" where a source says "rate-determining". "5 percent" in sentences, "5%" only inside math. K has no unit.

**Wording to recast.** British spellings (colour, behaviour, labelled, vapour, favoured, maximise, favours). "On this exam" (Ladder 3) becomes "on the AP exam". "Zumdahl §16.1", "Section II" and "candidate" (free-response set) go: say "student" for candidate. "YOUR TURN" is the `label="Your turn"` of the question. "I do:" is dropped from worked example titles, as the guide says.

**Left out, as in Units 5 and 2:** each worksheet's `spiralstrip`; the ladders' "Where you stand" table (its advice stays, as `## If you missed some`, with "tomorrow", "from a blank page" and "the unit worksheets" recast for a student anywhere).

## File structure

```
src/content/practice/unit-7/             seven .mdx files
```

## The seven documents

| Order | File in `src/content/practice/unit-7/` | Title | Kind | Topics | Source |
|---|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | 7.1 to 7.12 | `u07-selfstudy.tex` |
| 2 | `worksheet-1-dynamic-equilibrium-q-and-k.mdx` | Worksheet 1: Dynamic equilibrium, Q and K | `worksheet` | 7.1 to 7.4 | `worksheets/u07-ws1.tex` |
| 3 | `worksheet-2-magnitude-and-properties-of-k.mdx` | Worksheet 2: Magnitude and properties of K | `worksheet` | 7.5, 7.6 | `worksheets/u07-ws2.tex` |
| 4 | `worksheet-3-ice-tables.mdx` | Worksheet 3: ICE tables | `worksheet` | 7.7 | `worksheets/u07-ws3.tex` |
| 5 | `worksheet-4-le-chateliers-principle-and-q-against-k.mdx` | Worksheet 4: Le Châtelier's principle, and Q against K | `worksheet` | 7.8 to 7.10 | `worksheets/u07-ws4.tex` |
| 6 | `worksheet-5-solubility-equilibria-and-a-free-response-question.mdx` | Worksheet 5: Solubility equilibria, and a free-response question | `worksheet` | 7.11, 7.12 | `worksheets/u07-ws5.tex` |
| 7 | `free-response-set.mdx` | Free-response set | `free-response` | 7.1 to 7.12 | `u07-frq.tex` |

---

## Group A: design and plan (pull request A)

Branch `topic/unit-7-practice-design`, from an up-to-date `main`. This plan and the design, committed and opened as a pull request, merged when its check passes. Group B starts on a branch stacked on it.

---

## Group B: Worksheets 1 to 5 (pull request B)

Branch `topic/unit-7-practice-worksheets`.

### Task 1: Convert Worksheets 1 to 5

One writer per worksheet, in parallel, writing files only. Each gets: Plan 3's conversion guide; this plan's "What Unit 7 adds to the conversion guide"; its source `.tex`; a finished worksheet as the model, with its source (`src/content/practice/unit-5/worksheet-1-rates-and-rate-laws.mdx` and `D:\AP_Chem_Prep\Units\unit05-kinetics\worksheets\u05-ws1.tex`; for Worksheet 1's label, `unit-5/worksheet-3-mechanisms-and-energy-profiles.mdx`, question 6; for Worksheet 5's scored question, `unit-2/worksheet-4-a-long-free-response-question.mdx`).

**Worksheet 1** (`u07-ws1.tex`):

```yaml
---
title: "Worksheet 1: Dynamic equilibrium, Q and K"
kind: worksheet
order: 2
topics: ["7.1", "7.2", "7.3", "7.4"]
summary: Eight questions on what equilibrium is, writing K and Q, calculating K, and telling which way a mixture will go.
---
```

Eight questions, topics 7.1, 7.1, 7.1, 7.3, 7.3, 7.4, 7.3, 7.4. The subtitle's idea (equal rates, not equal amounts) becomes a sentence of the introduction. The header's relationships become the introduction's display math, without the K_p = K_c(RT)^Δn line and R. Question 2(c) has two blanks. Question 8 is `<Question number={8} title="K_p and K_c" topic="7.4" beyond>`; write its title in words, "Converting between the two constants", since a title is plain text.

**Worksheet 2** (`u07-ws2.tex`):

```yaml
---
title: "Worksheet 2: Magnitude and properties of K"
kind: worksheet
order: 3
topics: ["7.5", "7.6"]
summary: Seven questions on what the size of K says and how K changes when an equation is reversed, scaled or added to another.
---
```

Seven questions, topics 7.5, 7.5, 7.6, 7.6, 7.6, 7.6, 7.5. The subtitle's idea (equilibrium constants multiply where enthalpies add) becomes a sentence of the introduction, with the header's four rules as a short list. Question 4 is recast as "What Unit 7 adds" says.

**Worksheet 3** (`u07-ws3.tex`):

```yaml
---
title: "Worksheet 3: ICE tables"
kind: worksheet
order: 4
topics: ["7.7"]
summary: Eight questions on tables of initial, change and equilibrium values, the small-x shortcut and its 5 percent check.
---
```

Eight questions, all 7.7. The subtitle's idea (the 5 percent check is part of the answer) and the header's routine become the introduction, which adds one sentence: questions 4, 7 and 8 use the quadratic formula, which the AP exam seldom needs. Question 2(a) has two blanks. Answers that the source gives as a bare number (4(a), 4(d)) stay as they are.

**Worksheet 4** (`u07-ws4.tex`):

```yaml
---
title: "Worksheet 4: Le Châtelier's principle, and Q against K"
kind: worksheet
order: 5
topics: ["7.8", "7.9", "7.10"]
summary: Nine questions on predicting a shift, explaining it with Q and K, and reading particle drawings of an equilibrium.
---
```

Nine questions, topics 7.9, 7.9, 7.9, 7.9, 7.10, 7.10, 7.10, 7.8, 7.9. The subtitle's idea (only temperature changes K) and the header's rules become the introduction. Question 1's six parts each have one blank holding a direction and whether K changes. Question 8 is converted as written: the three drawings are described in words.

**Worksheet 5** (`u07-ws5.tex`):

```yaml
---
title: "Worksheet 5: Solubility equilibria, and a free-response question"
kind: worksheet
order: 6
topics: ["7.11", "7.12"]
summary: Six questions on K_sp, molar solubility and the common-ion effect, then one 10-point free-response question with its scoring rubric.
---
```

Seven questions. Questions 1 to 6: topics 7.11, 7.11, 7.11, 7.12, 7.12, 7.12. The header's three relationships and its table of six K_sp values become the introduction: the relationships as display math, the values as a two-column table (Salt, K_sp). Question 1 asks for the dissolving equation and the expression; the source's answers give the expressions only: copy them as they are and report it. Question 7 is `<Question number={7} title="Hydrogen and iodine" topic="7.3, 7.7, 7.10, 7.12" points={10}>` with parts a to f; give it the topics its `\ced` tags list. The boxed rubric note becomes a `<Rubric>` with six `<RubricLine>`s, parts a to f, points 1, 3, 1, 1, 2, 2; keep the sentence about a bare "shifts right" in line (e) word for word.

### Task 2: Finish the conversion of Group B

- [ ] **Everything in Plan 3's "How every conversion task ends"**, with Unit 7's paths, up to and including the fact-check: build and test once; audit each worksheet (`node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit07-equilibrium/worksheets/u07-wsN.tex" src/content/practice/unit-7/<name>.mdx "<scratch>/unit7-practice/expected/<name>.json"`) to `0 unexplained, 0 stale`; look at each page at 412, 390, 360 and 320 px with every answer open; one fact-check per worksheet.

The fact-check brief adds to Plan 3's:

- **The Unit 7 lessons are the reference** for terms and for the limits on a rule (`src/content/lessons/unit-7/`). An answer must not say more than the lesson does. In particular: what the 5 percent check compares; that Le Châtelier's principle speaks of a system that was at equilibrium; that a temperature change leaves Q_c where it was in a rigid container; that a shift undoes only part of a change; lesson 7.9's rule for pH.
- **Solve before reading**, for every question and part, and recompute every number to the figures given.
- **Points to look at** (noticed while this plan was written; the checker decides):
  - Worksheet 1, question 8: is the label right, and is the calculation right?
  - Worksheet 2, question 4: can a student of Unit 7 alone follow the answer, with its sentence on ΔG°? Is the topic named right?
  - Worksheet 3, question 5(c): the answer speaks of a "rough threshold of a few hundred" for the starting concentration over K. Lesson 7.7 gives no cutoff and says the check decides.
  - Worksheet 3, questions 4 and 7: the quadratic solutions, put back into K.
  - Worksheet 4, question 1: each direction, and the note on whether K changes.
  - Worksheet 4, question 8(c): "about 4" for 8 product particles and 2 reactant particles.
  - Worksheet 5, question 1: the source's answers leave out the dissolving equations the question asks for.
  - Worksheet 5, question 7(e): the rubric line's sentence about a bare "shifts right".

Differences the audit is expected to print:

| Document | Line | Reason |
|---|---|---|
| Every worksheet | numbers and formulas only in the source, in the last question's segment | The Quick review is left out |
| Worksheet 1 | the header's K_p formula and R, if the audit reads the header | They stay with question 8 only |
| Worksheet 2, question 4; Worksheet 3, question 1 | a topic number only on the site | The source names a unit of the old course; the site names the topic |
| Worksheet 5 | `rubric lines`: 0 in the source, 6 on the site | The source's rubric is a boxed note; the site uses `RubricLine` |

### Task 3: One K_sp for each salt (Worksheet 5)

After Worksheet 5's audit is clean and its fact-check has reported.

- [ ] **Step 1:** Run `python -I <scratch>/unit7-practice/ksp-site-values.py`. It prints the site's six values and every answer of Worksheet 5 that follows from them.
- [ ] **Step 2:** Give one fixer (Sonnet) the decided list and nothing else to decide:

| Where | Source | Site |
|---|---|---|
| Introduction's table | AgCl 1.6 × 10⁻¹⁰; BaSO₄ 1.5 × 10⁻⁹; CaF₂ 4.0 × 10⁻¹¹; PbI₂ 1.4 × 10⁻⁸; Ag₂CrO₄ 9.0 × 10⁻¹²; BaCrO₄ 8.5 × 10⁻¹¹ | 1.8 × 10⁻¹⁰; 1.1 × 10⁻¹⁰; 3.5 × 10⁻¹¹; 9.8 × 10⁻⁹; 1.1 × 10⁻¹²; 1.2 × 10⁻¹⁰ |
| Question 2 | 1.3 × 10⁻⁵; 3.9 × 10⁻⁵; 2.2 × 10⁻⁴; 1.5 × 10⁻³ M | 1.3 × 10⁻⁵; 1.0 × 10⁻⁵; 2.1 × 10⁻⁴; 1.3 × 10⁻³ M |
| Question 3 | 2.2 × 10⁻⁴ and 9.2 × 10⁻⁶ M; "about 24 times" | 2.1 × 10⁻⁴ and 1.1 × 10⁻⁵ M; "about 19 times" |
| Question 4 | 1.6 × 10⁻⁹ M; "about 7900" | 1.8 × 10⁻⁹ M; "about 7200" (from the rounded values, as the ladders compute theirs) |
| Question 5 | 6.4 × 10⁻⁸ M; "about 3400 times" | 5.6 × 10⁻⁸ M; "about 3700 times" |

Every intermediate line of each worked answer changes with its value; the fixer recomputes each line and reports each number it wrote. Question 3's point (the salt with the smaller K_sp is the more soluble) still holds.

- [ ] **Step 3:** A fresh fact-checker (Fable) recomputes every changed answer from the question alone.
- [ ] **Step 4:** Audit again. Record each changed number in `expected/worksheet-5-....json` with the reason "corrected: K_sp moved to the site's value, <old> to <new>".

> **As carried out (2026-11-15), Tasks 1 to 4.** Five Fable writers converted the worksheets in parallel; the first audits needed only the entries this plan foresaw, plus one for a reaction split over two lines. Then:
>
> - **The first fact-checks** found no wrong final answer. Worksheets 1, 2 and 4 had no error; Worksheet 3 had two wrong clauses (5(c) "smaller still", and question 8's sentence on a negative root); Worksheet 5 had 50.2 printed for 50.3. All three were in the source. The accuracy findings were of a few kinds: "shifts" said of a mixture that was never at equilibrium; a rule stated without its condition; a stem that never said the products start at zero; a unit missing.
> - **Fixes were applied by one Sonnet fixer per worksheet** from a decided list, each fixer also bringing its `expected` file back to `0 unexplained, 0 stale`. Worksheet 5's fixer applied the K_sp pass (Task 3) in the same run, with every number given to it: the script's values, not its own arithmetic.
> - **The table in Task 3 changed in three places.** Ratios are given to the figures that rounded and unrounded values agree on: "about 19" (as planned), "about 7000" (7200 from the rounded values, 7500 unrounded) and "nearly 4000" (3750 and 3680). 3(c) and 4(b) show the division. s³ for CaF₂ is printed as 8.8 × 10⁻¹².
> - **A second check on Fable** recomputed every answer of Worksheet 5 from its own table and re-read every changed passage on the other four: no error, five accuracy points, three of them in wording the first fixes had introduced (1(d) of Worksheet 2, 8(c) of Worksheet 4, the ratio above).
> - **Phones:** the dissolving equations added to Worksheet 5's question 1 scrolled inside their boxes from 412 px down, so each is split over two lines, as lesson 7.11 splits silver chromate's.
> - **Labels:** Worksheet 1's question 8 is tagged 7.3 (where the framework and the lesson put the conversion), not 7.4, and its stem gives R, which had left the introduction with the formula.
> - **A shell lesson:** a multi-line script passed to the shell in a heredoc was refused by a safety check before it ran. Fix scripts go in a file made with the Write tool.

### Task 4: Open pull request B

- [ ] **Decide each fact-check finding; one fixer per worksheet for the accepted ones; build, test and audit again; a second fact-check of what changed.**
- [ ] **Commit, push, open the pull request, merge when its check passes, wait for the deploy.**

```bash
git add src/content/practice/unit-7
git commit -m "feat(practice): add Unit 7 worksheets 1 to 5"
git push -u origin topic/unit-7-practice-worksheets
gh pr create --base main --title "feat(practice): Unit 7 worksheets 1 to 5" --body-file "<scratch>/unit7-practice/pr-b-body.md"
```

The body gives what Plan 3's does (each document's questions and points, each audit's last line and expected differences, the fact-check's findings and what was done, the "Beyond the exam" label, test and build output), and, set apart, **every correction to the originals**, with the K_sp changes as one table, for the teacher to accept or reverse.

---

## Group C: the skill ladders and the free-response set (pull request C)

Branch `topic/unit-7-practice-ladders-frq`, from `topic/unit-7-practice-worksheets`. The two drafts may be written in the scratch folder while Group B is checked, then copied in.

### Task 5: Convert the skill ladders and the free-response set

**Skill ladders** (`u07-selfstudy.tex`):

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11", "7.12"]
summary: Twelve skills, one at a time. Each has a worked example, then four questions of the same kind to try on your own. Start here, before the worksheets.
---
```

- The introduction comes from "How to use these notes": how a ladder works; K is a constant and Q is the same expression evaluated now; only temperature changes K; the one-sentence scope note.
- Twelve sections, `## Ladder 1: What equilibrium is` to `## Ladder 12: The common-ion effect`, titles as in the source in sentence case. Each: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder: "7.1, 7.2"; 7.3; 7.4; 7.5; "7.3, 7.8"; 7.7; 7.7; "7.9, 7.10"; "7.9, 7.10"; 7.9; 7.11; 7.12.
- Ladder 6's worked example has the one table: write it as lesson 7.7 writes its tables.
- Ladder 11's worked example says lead(II) iodide "has the smaller K_sp": copy it as it is and report it.
- **Leave out** "Where you stand"; keep its note as `## If you missed some`, with "12 of 12", "9 to 11", "8 or fewer" and the three root causes numbered (1), (2), (3).

**Free-response set** (`u07-frq.tex`):

```yaml
---
title: "Free-response set"
kind: free-response
order: 7
topics: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11", "7.12"]
summary: Five free-response questions on all of Unit 7, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

- The introduction comes from the scope note and the section heading, keeping: topics 7.1 through 7.12; Unit 7 is 7% to 9% of the exam; the one-sentence scope note; 5 questions, 32 points, about 50 minutes, calculator allowed.

| Number | `topic` | `points` | Rubric lines |
|---|---|---|---|
| 1 | 7.4, 7.7 | 10 | 2, 3, 3, 2 |
| 2 | 7.5, 7.9, 7.10, 7.11, 7.12 | 10 | 2, 2, 2, 4 |
| 3 | 7.6 | 4 | 2, 2 |
| 4 | 7.1, 7.2, 7.8 | 4 | 2, 2 |
| 5 | 7.9, 7.10 | 4 | 3, 1 |

- Each question's `title` is the description after the bullet in its `\frq{...}` line, in sentence case.
- "A candidate who never tests the approximation earns 0 here even if (c) is right" (question 1's rubric) is kept, with "student" for "candidate".

**Points to look at in the fact-check:** free-response question 1 (the quadratic, put back into K; whether 20.5 percent is what the check gives); question 1(d), the shift when the volume is doubled; question 3's topic tag (7.6, for a question on a solid left out of K: lesson 7.3 teaches that); question 4, the isotope argument; Ladder 3's "K has no units"; Ladder 5's topic tags; Ladder 7's worked example against lesson 7.7; Ladder 11's sentence about the smaller K_sp; Ladder 12's "about 7000 times".

### Task 6: One K_sp for each salt (ladders and free-response set)

As Task 3, for these two documents:

| Where | Source | Site |
|---|---|---|
| Ladder 11, worked example | PbI₂ 7.1 × 10⁻⁹, s = 1.2 × 10⁻³ M, "nearly a hundred times more soluble than AgCl" | 9.8 × 10⁻⁹, s = 1.3 × 10⁻³ M, "about a hundred times" |
| Ladder 11, worked example | PbI₂ "has the smaller K_sp" | PbI₂ has the larger K_sp, about 50 times AgCl's, and is about 100 times as soluble: the two cannot be compared directly, because the salts give different numbers of ions (the fact-checker settles the wording) |
| Free-response set, question 2(d) | CaF₂ 3.9 × 10⁻¹¹, s = 2.1 × 10⁻⁴ M | 3.5 × 10⁻¹¹, s = 2.1 × 10⁻⁴ M (the answer is the same to two figures; the working changes) |

AgCl (1.8 × 10⁻¹⁰) and Ag₂CrO₄ (1.1 × 10⁻¹²) in the ladders are already the site's values.

- [ ] **Finish as Tasks 2 to 4 do**, with these expected audit differences:

| Document | Line | Reason |
|---|---|---|
| Skill ladders | in the last section: `1` to `12` and other numbers of the tick table, only in the source; perhaps a wording line | "Where you stand" is left out |
| Skill ladders, free-response set | the scope note's wording | It becomes one sentence |

With all seven documents in place, check by hand: each Unit 7 lesson's "Practice next" lists the ladders, its worksheets and the free-response set; the unit page lists the seven in the order of the table "The seven documents"; no salt has two K_sp values anywhere under `src/content` (`grep` for each salt's formula).

- [ ] **Commit**

```bash
git add src/content/practice/unit-7
git commit -m "feat(practice): add the Unit 7 skill ladders and free-response set"
```

> **As carried out (2026-11-15), Tasks 5 and 6.** Both documents were written as drafts in the scratch folder while the worksheets were checked, and were fact-checked, fixed and checked a second time there before they were copied in.
>
> - **Skill ladders:** no "Your turn" answer was wrong. Four statements in the source's text were: Ladder 11's "has the smaller K_sp" and the key to 11(d), which leaned on the same pair (it now uses silver chromate against silver chloride, both already on the page); Ladder 4's diamond to graphite as a reaction "with K = 10¹⁰"; and Ladder 2(b)'s K written with a concentration called "the vapor pressure". Ladder 12's ratio is "about 7000", as Worksheet 5's.
> - **Free-response set:** no wrong answer or number. Question 3's tag (7.6) became "7.3, 7.9". The 5 percent line carries one more digit (0.1027) so that it computes to the 20.5 percent it prints. Question 4(b) now asks for what its rubric scores.
> - **Topics lists** name only what a document tests: the free-response set leaves out 7.4, 7.6 and 7.8, and the ladders leave out 7.8. So the hand check below reads "each lesson's Practice next lists the documents that have a question on its topic".
> - **Rubrics** in the free-response set say how an answer by another valid route scores (1(b), 1(d), 2(d), 3(b), 5(a)); the points are unchanged. They are listed in the pull request for the teacher.
> - **The word "dissolution"** is on no page of the site; the ladders used it five times and now say "dissolving", as the lessons do.

### Task 7: Close out

- [ ] Add an "As built" note at the end of the design, and "As carried out" notes in this plan under the tasks that went differently.
- [ ] Update the local `CLAUDE.md` (not committed).
- [ ] Commit (`docs: record how the Unit 7 practice was built`), push, open pull request C, merge it when its check passes, wait for the deploy, return to `main` and delete the branches.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 1. The seven documents | 1, 5 |
| 2. What is left out | Guide additions; 1, 5 |
| 3. Conversion, audit, fact-check, corrections, the lessons' terms | 2, 4, 5 |
| 4.1 One K_sp for each salt | 3, 6 |
| 4.2 Beyond the exam | Guide additions; 1; the fact-check brief |
| 4.3 Material from other units | Guide additions; 1 |
| 4.4 No pictures | Facts verified, 2 |
| 5. Code | None |
| 6. Pull requests | A, 4, 7 |
| 7. Done when | 2, 4, 6, 7 |
