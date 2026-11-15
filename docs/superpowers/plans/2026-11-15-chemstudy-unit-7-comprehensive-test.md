# ChemStudy Unit 7 Comprehensive Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a new Unit 7 comprehensive test on chem-study.com: two pages, one per sitting, about 41 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-7/` of the kind `test`, built from the existing practice blocks. An avoid list and a pool of systems per part come first. Then one writer per part drafts its questions and a number-check script; the controller runs the scripts, compares the parts' systems, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes are expected.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe, Python 3 (number checks, standard library only).

**Spec:** `docs/superpowers/specs/2026-11-15-chemstudy-unit-7-comprehensive-test-design.md`.

**Builds on:** Plan 4, `docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`. Its sections **"The writer's guide"** (lines 93–232) and **"How every session is checked"** (lines 234–291) apply, with the changes in this plan's "What changes for Unit 7". Read both before starting. Plan 7 (Unit 2's test) is the nearest example of a test with no old test behind it.

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists** (`src/lib/practice-id.ts`); a page of that kind shows "Comprehensive test" above its title. Unit 7's seven practice documents take orders 1 to 7, so the two sessions are 8 and 9.
2. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions.
3. **K_sp values the site already states** (at 25 °C), which a question must not contradict:
   - lesson 7.11's table: AgI 8.52 × 10⁻¹⁷, BaSO₄ 1.08 × 10⁻¹⁰, SrF₂ 4.33 × 10⁻⁹, SrSO₄ 3.44 × 10⁻⁷, Ca(IO₃)₂ 6.47 × 10⁻⁶, TlCl 1.86 × 10⁻⁴;
   - the practice, to two figures: AgCl 1.8 × 10⁻¹⁰, BaSO₄ 1.1 × 10⁻¹⁰, CaF₂ 3.5 × 10⁻¹¹, PbI₂ 9.8 × 10⁻⁹, Ag₂CrO₄ 1.1 × 10⁻¹², BaCrO₄ 1.2 × 10⁻¹⁰.
4. **More handbook K_sp values** (at 25 °C; each salt was clear of the textbook and the teacher's notes when the lessons were written, `<scratch>/unit7/salt-clearance.md`):
   - used by lesson 7.12 with a common ion: AgIO₃ 3.17 × 10⁻⁸, PbSO₄ 2.53 × 10⁻⁸;
   - not yet on the site: CuBr 6.27 × 10⁻⁹, CuCl 1.72 × 10⁻⁷, CuI 1.27 × 10⁻¹², Ba(IO₃)₂ 4.01 × 10⁻⁹.

   Part H takes its salts from Facts 3 and 4 only, or uses a salt MX₂ whose K_sp the question calls made up. The Part H fact-checker confirms each value it uses against a second source.
5. **The systems the site already uses**, which a question must not repeat with the same numbers or scenario. The avoid list (Task 1) gives the full list with numbers; the main ones:
   - lessons: A ⇌ B (7.1); I₂ ⇌ 2 I, I₂ + Br₂ ⇌ 2 IBr and I₂ + Cl₂ ⇌ 2 ICl; 2 NOCl ⇌ 2 NO + Cl₂; 2 NO₂ ⇌ 2 NO + O₂; 2 CO + O₂ ⇌ 2 CO₂; 2 NO + Br₂ ⇌ 2 NOBr; CS₂ + CO₂ ⇌ 2 COS; C₂H₄ + H₂ ⇌ C₂H₆; P₄ ⇌ 2 P₂; SO₂ + 2 H₂ ⇌ S + 2 H₂O (7.6); N₂O₄ ⇌ 2 NO₂ with K = 0.490 (7.9, 7.10); chromate and dichromate, iron(III) thiocyanate, the cobalt(II) chloride complex (7.9); NH₄Cl ⇌ NH₃ + HCl; the salts of Facts 3 and 4 as marked (7.11, 7.12).
   - practice: H₂ + I₂ ⇌ 2 HI (K = 50.0 and 4.5); N₂ + 3 H₂ ⇌ 2 NH₃; PCl₅ ⇌ PCl₃ + Cl₂ (K_c = 0.0211); 2 SO₂ + O₂ ⇌ 2 SO₃; CaCO₃ ⇌ CaO + CO₂; NH₄HS ⇌ NH₃ + H₂S; CO + H₂O ⇌ CO₂ + H₂; Fe₃O₄ + 4 H₂ ⇌ 3 Fe + 4 H₂O.
6. **The sources for the avoid list and the originality check only** (writers never read them):
   - `C:\Users\sahan\Downloads\Chemistry_Resources\Tro_Reference\molecular-approach-6e\ch16-chemical-equilibrium.md` and `ch18-aqueous-ionic-equilibrium.md` (its solubility sections only);
   - `...\Tro_Reference\structure-and-properties-3e\ch15-chemical-equilibrium.md` and `ch17-aqueous-ionic-equilibrium.md` (its solubility sections only);
   - the teacher's closed exam, `D:\AP_Chem_Prep\Units\unit07-equilibrium\exam\u07-exam.tex`;
   - the site's `src/content/practice/unit-7/*.mdx` and `src/content/lessons/unit-7/*.mdx`.
   `Tro_Reference` is reliable for prose and unreliable for numbers (superscripts are flattened); a number that decides a finding is confirmed against the rendered PDF page.
7. **The framework for Unit 7** is `<scratch>/ced/unit7-framework.md`, read from page pictures (the extracted text loses the equilibrium arrow, the fractions and every subscript). Two exclusions, both in 7.3: converting between K_c and K_p, and a dissolved species in equilibrium with the same species as a gas. Never copy its wording.
8. **What the practice's fact-checks kept finding**, so that the test does not repeat it:
   - "shifts" said of a mixture that was never at equilibrium;
   - a rule stated without its condition (a K compared across reactions of different form; "adding a product" for a solid; "pressure" without saying how it changed);
   - a 5 percent check that does not say what was divided by what, or gives no percentage;
   - a ratio quoted to two figures that changes when unrounded values are used;
   - a K given with a temperature it does not have;
   - a rubric line that only the answer's own route can earn.

## Conventions, models

Plan 4's conventions apply: the capital-`C:` working directory; Write and Edit for files (never a heredoc; a multi-line script passed to the shell is refused before it runs); conventional commits with **no AI-attribution trailer**; US spelling; never swallowing an error; no preview server during `npm run test:e2e`.

Models, by the teacher's decision of 2026-11-14: writers and fact-checkers on Fable 5.2; the avoid list, the originality check and fixers on Sonnet. A fact-checker's independence comes from its fresh context and from solving before reading.

Merging: under the teacher's instruction for Unit 7 (2026-11-14), Claude merges each pull request once its "Build and test" check passes and its content has been fact-checked and checked for originality, waits for the deploy, and only then merges the next.

## What changes for Unit 7

Give this section to every writer with Plan 4's writer's guide.

- **What a writer reads:** the framework notes for its topics (Fact 7); `src/content/lessons/unit-7/` for its topics; `src/content/practice/unit-7/` (what students have already practiced, and the model of the format: `free-response-set.mdx`); the avoid list and its own pool (Task 1). It never reads `D:\AP_Chem_Prep`, `Tro_Reference`, any textbook or slides.
- **Where it writes:** `<scratch>/unit7-test/drafts/part-<x>.mdx` and `<scratch>/unit7-test/checks/part-<x>.py`.
- **Rows of Plan 4's guide that are kinetics-only do not apply:** rate data, order fits, rate laws, mechanisms, half-lives, Arrhenius, and the least-squares functions. The rules on honest data, significant figures, every question with lettered parts and a rubric line per part, phone fit and wording all apply.
- **Systems:** use the part's own pool, letters (A, B, X₂) or a system the question calls made up. Never a system on the avoid list with the numbers the list gives for it. Do not use one system in two questions of a part.
- **Values:**
  - An equilibrium constant goes with a temperature only when the pool gives that value for that temperature. Otherwise write "at a certain temperature" or "at a fixed temperature". Its size must not contradict what the reaction is known to do.
  - Say which constant every value is: K_c with concentrations, K_p with partial pressures. Never set a K_c beside a K_p as if they could be compared. Never ask for one from the other.
  - K has no unit. Concentrations carry M, pressures atm.
  - A K_sp comes from Facts 3 and 4 only, as written there, "at 25 °C". A calculated solubility is called calculated, never measured.
- **Notation:**
  - the equilibrium arrow is `<=>` inside `\ce{}`; a general reaction needs `\;` around it;
  - `$K_c$`, `$K_p$`, `$K_{sp}$`, `$Q$` in math; a title is plain text, so "K" there is written in words or as "K";
  - a table of initial, change and equilibrium values has rows labeled I, C and E, the sentence "Every value is in M. The rows are labeled I, C and E, for Initial, Change and Equilibrium:" before it (atm for pressures), and at most four columns. A species named C clashes with the row label: do not name one C.
- **Wording the lessons use:**
  - a mixture that was never at equilibrium "runs" or "proceeds" toward products or reactants; "shift" is for a system that was at equilibrium and was disturbed;
  - a shift undoes only part of a change; say what the disturbance was (a smaller volume, not "more pressure");
  - "where equilibrium lies", "dissolving equation", "less soluble"; never "dissolution" or "position";
  - the 5 percent check divides what was left out (x, or 2x) by the starting concentration it was left out of, and the answer states the percentage;
  - a ratio ("how many times as soluble") is given to the figures that the rounded and the unrounded values agree on, with the division shown.
- **Rubrics:** a point is for something a student's answer shows. Where there are two sound routes (counting moles of gas or using Q; Le Châtelier's principle or Q; K_c or K_p where either is fair), the line says both earn the point.
- **No pictures:** a graph is a table of values or a sentence; a particle picture is a table of counts in a stated volume, with a sentence saying what the counts stand for. Counts stand in for concentrations only when the volume cancels (the same number of particles on each side) or the volume is given.
- **Beyond the exam:** nothing in this test should need the label (design, section 5). No K_c to K_p conversion, no dissolved gas in equilibrium with the gas, no effect of pH on solubility. The quadratic formula is used in one question of Part E and nowhere else; it is not labeled.
- **The number check** recomputes, from the question's own data, every number the answer and rubric show: every K, Q and K_sp; every solved x, **put back into its K expression** to the figures given; every 5 percent check; every manipulated K (reversed, scaled, summed); every solubility and ratio, both from rounded and from unrounded values. It asserts each against the MDX and ends `part <x>: N values checked, all match`.
- **Contexts:** vary them across a part: gases in a rigid container, a solution, a solid decomposing in a sealed vessel, a mineral in water. A claim about a real substance must be true.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-7-test-design`: the design and this plan, in one pull request, merged when its check passes. Groups B and C stack on it; every branch targets `main`.

---

## Group B: the avoid list, the pools and session 1 (pull request B)

Branch `topic/unit-7-test-session-1`, from `topic/unit-7-test-design`.

### Task 1: The avoid list and the pools

- [ ] **Step 1: the avoid list.** One agent on Sonnet, read-only apart from its one output file, reads Fact 6's sources and writes `<scratch>/unit7-test/avoid-list.md`. For each source it lists every system used in a **calculation or a worked scenario**: the reaction or salt; what is done with it (K from data, concentrations from K, a shift, a solubility, a common ion); and its numbers (K or K_sp, temperature, concentrations, answers). It marks which numbers were confirmed against a PDF page. It also lists, separately, every system that appears in the sources at all, by name only. No wording is copied.
- [ ] **Step 2: the pools.** The controller gives each part its own real systems, none shared between parts, none on the avoid list with numbers:
  - parts A to G: three to five gas-phase or heterogeneous reactions each, by equation only. Where a real K at a real temperature is wanted, the controller supplies it with its source, and a fact-checker confirms it; otherwise the part uses "at a certain temperature".
  - Part H: its salts from Facts 3 and 4, each with the kind of calculation it may be used for (a salt the lessons or practice already use in pure water may appear only in a different kind of question).
  - The pools are written to `<scratch>/unit7-test/pools.md`, one section per part.

### Task 2: Write session 1

Four writers in parallel, one per part. Each gets Plan 4's writer's guide, this plan's "What changes for Unit 7", the avoid list, its pool, and its brief:

| Part | Title | Topics | Questions | Points | Practice |
|---|---|---|---|---|---|
| A | Reversible reactions and equilibrium | 7.1, 7.2 | 5 (questions 1–5) | about 22 | What is equal at equilibrium (the two rates) and what need not be (the amounts); a table of concentrations against time, to say when equilibrium is reached and what is still happening; how the forward and reverse rates change from the start, from a table of rates; the same equilibrium reached from products alone; a student's claim to correct ("the reaction has stopped", "the concentrations are equal") |
| B | The reaction quotient and the equilibrium constant | 7.3 | 5 (questions 6–10) | about 22 | Writing K_c for a gas-phase and a solution reaction; writing K_p; leaving out a pure solid and a pure liquid, with the reason; Q for a mixture as it stands, and what Q equal to K means; what changes K and what does not; telling a K_c from a K_p by what goes into it |
| C | Calculating the equilibrium constant | 7.4 | 5 (questions 11–15) | about 26 | K_c from a set of equilibrium concentrations; K_p from equilibrium partial pressures; K from a starting mixture and one equilibrium concentration, with the I, C, E table; K from the fraction of a reactant that has reacted; one question where a coefficient of 2 must be used in both the change row and the exponent, with a system for which the two mistakes do not cancel |
| D | The size of K and the rules for K | 7.5, 7.6 | 5 (questions 16–20) | about 25 | What a very large and a very small K say about the mixture at equilibrium; a middling K; why K says nothing about speed; K for the reversed equation and for the equation multiplied through; K for a sum of two equations; one question that needs two rules in a row |

Session 1 frontmatter (the controller writes it):

```yaml
---
title: "Comprehensive test, session 1: equilibrium and its constant"
kind: test
order: 8
topics: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"]
summary: Twenty scored free-response questions on reversible reactions, Q and K, calculating K, and the size and rules of K, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 100
---
```

The introduction says: this is the first of two sittings that together test all of Unit 7; it covers topics 7.1 to 7.6; session 2 covers calculating equilibrium concentrations, particle pictures, Le Châtelier's principle and solubility; how many questions and points, about 100 minutes, a calculator allowed; write each answer in full before opening the answer and the rubric. Then the four parts, `## Part A: Reversible reactions and equilibrium` and so on. The summary's count is corrected to the count as built.

### Task 3: Check session 1, and open the pull request

Plan 4's "How every session is checked", with Unit 7's paths and these changes:

- number checks: `<scratch>/unit7-test/checks/part-[abcd].py`;
- the session file: `src/content/practice/unit-7/comprehensive-test-session-1.mdx`;
- the page: `unit-7-equilibrium/practice/comprehensive-test-session-1/`;
- **before the fact-checks, the controller lists every system in the four drafts** and sends a repeat back to one of its writers;
- **fact-checks run on Fable 5.2**, one per part. Their brief is Plan 4's seven points, and adds: score your own answer with the rubric, and say where a sound answer by another route could not be scored; check every item of Fact 8; confirm any K given with a temperature;
- **the originality check** (Sonnet) uses Fact 6's sources and the avoid list. Its brief is Plan 4's, with "reaction and data" read as "system and its numbers, or the same scenario";
- phone measurements with `<scratch>/unit2/lesson-check.cjs` and `<scratch>/unit7-practice/wide-eq.cjs` (which names every equation that scrolls inside its box);
- after the fixes, **a second check on Fable 5.2** of every changed passage.

- [ ] Commit (`feat(practice): add the Unit 7 comprehensive test, session 1`), push, open the pull request, merge it when its check passes, wait for the deploy.

---

## Group C: session 2 (pull request C)

Branch `topic/unit-7-test-session-2`, from `topic/unit-7-test-session-1`. The drafts may be written while Group B is checked.

### Task 4: Write session 2

Four writers in parallel:

| Part | Title | Topics | Questions | Points | Practice |
|---|---|---|---|---|---|
| E | Calculating equilibrium concentrations | 7.7 | 6 (questions 1–6) | about 34 | Which way a mixture runs, from Q against K; equilibrium concentrations where the expression is a perfect square; the small-x shortcut with its 5 percent check stated; equilibrium partial pressures from K_p; one mixture that starts with product present; one question where the check fails and the quadratic formula is used, with the rejected root explained |
| F | Particle pictures of equilibrium | 7.8 | 3 (questions 7–9) | about 14 | K from a table of particle counts where the volume cancels; from counts at three times, which of them show equilibrium, and what is still happening; a reaction with different numbers of particles on its two sides, where the counts alone give the wrong K and the volume must be used |
| G | Le Châtelier's principle and Q | 7.9, 7.10 | 6 (questions 10–15) | about 30 | The direction of a shift for an added or removed gas, a smaller or larger volume, heating or cooling, an unreactive gas at constant volume, a catalyst, more of a solid; which of them change K, and which way; the same shift explained with Q; Q just after a disturbance, calculated, and the direction it gives; choosing conditions for the best yield and saying what is given up |
| H | Solubility and the common-ion effect | 7.11, 7.12 | 6 (questions 16–21) | about 30 | The dissolving equation and the K_sp expression; molar solubility from K_sp for a 1:1 and a 1:2 salt; K_sp from a solubility; two salts whose K_sp values rank them the wrong way; solubility in a solution of a common ion, with the check stated; why the salt is less soluble, with Q and with Le Châtelier's principle; what happens to K_sp |

Session 2 frontmatter:

```yaml
---
title: "Comprehensive test, session 2: using the equilibrium constant"
kind: test
order: 9
topics: ["7.7", "7.8", "7.9", "7.10", "7.11", "7.12"]
summary: Twenty-one scored free-response questions on equilibrium concentrations, particle pictures, Le Châtelier's principle and Q, and solubility, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 110
---
```

The introduction mirrors session 1's, naming topics 7.7 to 7.12, and adds two scope notes: one question uses the quadratic formula, which the AP exam seldom needs; no question asks for K_p from K_c.

### Task 5: Check session 2, and open the pull request

As Task 3, with `part-[efgh].py` and `comprehensive-test-session-2`. In addition: `grep` every salt's formula under `src/content` and confirm one K_sp per salt. Commit (`feat(practice): add the Unit 7 comprehensive test, session 2`).

### Task 6: Close out

- [ ] An "As built" note at the end of the design: questions and points per part, the topic count, the findings and what was done.
- [ ] "As carried out" notes in this plan where the work went differently.
- [ ] Update the local `CLAUDE.md`.
- [ ] Commit (`docs: record how the Unit 7 comprehensive test was built`), push, open pull request C, merge it when its check passes, wait for the deploy, return to `main` and delete the branches.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3. Two pages, no pictures | 2, 4; "What changes for Unit 7" |
| 4. Weight per topic | 2, 4 (the part tables); 3, 5 (the topic count) |
| 5. Beyond the exam | "What changes for Unit 7"; the fact-checks in 3, 5 |
| 6. Originality: the avoid list, the pools, honest values | 1; Facts 3 to 6; the originality checks in 3, 5 |
| 7. The pipeline | 1, 3, 5 |
| 8. Pull requests | A, 3, 6 |
| 9. No code | Facts 1, 2 |
| 10. Done when | 3, 5, 6 |
