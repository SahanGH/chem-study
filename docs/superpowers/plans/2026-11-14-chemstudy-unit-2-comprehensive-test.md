# ChemStudy Unit 2 Comprehensive Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a new Unit 2 comprehensive test on chem-study.com: two pages, one per sitting, about 40 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-2/` of the kind `test`, built from the existing practice blocks and the Lewis block. One writer per part drafts its questions and a number-check script; the controller runs the scripts, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes are expected.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe, Python 3 (number checks, standard library only).

**Spec:** `docs/superpowers/specs/2026-11-14-chemstudy-unit-2-comprehensive-test-design.md`.

**Builds on:** Plan 4, `docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`. Its sections **"The writer's guide"** (lines 93–232) and **"How every session is checked"** (lines 234–291) apply, with the changes in this plan's "What changes for Unit 2". Read both before starting.

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists** (`src/lib/practice-id.ts`); a page of that kind shows "Comprehensive test" above its title. Unit 5's sessions are `order` 7 and 8; Unit 2's six practice documents take orders 1 to 6, so the two sessions are 7 and 8.
2. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions.
3. **Practice pages supply `Lewis` and `Resonance`** (Plan 6). The build fails a drawing whose electrons do not match the valence count. The Lewis rules: `docs/superpowers/plans/2026-11-13-chemstudy-unit-2-lessons.md`, lines 123–142.
4. **Values the site already states**, which a question must not contradict:
   - Cl–Cl 199 pm and 243 kJ/mol, Br–Br 228 pm and 193 kJ/mol, I–I 267 pm and 151 kJ/mol, F–F 159 kJ/mol;
   - C–C 154 pm and 347 kJ/mol, C=C 134 pm and 614 kJ/mol, C≡C 120 pm and 839 kJ/mol;
   - lesson 2.1's electronegativities (H 2.2, C 2.6, N 3.0, O 3.4, F 4.0, Cl 3.2, Br 3.0, Na 0.9, K 0.8; read the full table there);
   - lesson 2.3's ionic radii;
   - the bond angles in `src/lib/vsepr.ts` (NH₃ about 107°, H₂O about 104.5°).
5. **The sources for the originality check only** (writers never read them):
   - `C:\Users\sahan\Downloads\Chemistry_Resources\Tro_Reference\molecular-approach-6e\ch10-chemical-bonding-i-the-lewis-model.md`, `ch11-chemical-bonding-ii-molecular-shapes-valence-bond-theory-and.md`, `ch13-solids-and-modern-materials.md`;
   - `...\Tro_Reference\structure-and-properties-3e\ch05-chemical-bonding-i.md`, `ch06-chemical-bonding-ii.md`, `ch12-crystalline-solids-and-modern-materials.md`;
   - the teacher's closed exam, `D:\AP_Chem_Prep\Units\unit02-compound-structure\exam\u02-exam.tex`;
   - the site's `src/content/practice/unit-2/*.mdx` and `src/content/lessons/unit-2/*.mdx`.
6. **The framework text** is `<scratch>/ced/ced.txt`; Unit 2 runs from about line 2,400 to 3,320. Never copy its wording.

## Conventions, models

Plan 4's conventions and models apply: the capital-`C:` working directory; Write and Edit for files; conventional commits with **no AI-attribution trailer**; US spelling; never swallowing an error; no preview server during `npm run test:e2e`; writers on the strongest model, fact-checks on Opus, the originality check and fixers on Sonnet; **never merging a pull request**.

## What changes for Unit 2

Give this section to every writer with Plan 4's writer's guide.

- **What a writer reads:** the framework text for its topics; `src/content/lessons/unit-2/` for its topics; `src/content/practice/unit-2/` (what students have already practiced, and the model of the format: `free-response-set.mdx`). It never reads `D:\AP_Chem_Prep`, `Tro_Reference`, any textbook or slides.
- **Where it writes:** `<scratch>/unit2-test/drafts/part-<x>.mdx` and `<scratch>/unit2-test/checks/part-<x>.py`.
- **Rows of Plan 4's guide that are kinetics-only do not apply:** reactions and rate data, order fits, rate laws, mechanisms, half-lives, Arrhenius. The rules on honest data, significant figures, every question with lettered parts and a rubric line per part, notation, phone fit and wording all apply.
- **Values:** use Fact 4's values wherever the site states one. Any other bond length, bond energy, lattice energy or melting point must be a real, well-established value. Where a value is made up to illustrate a trend, say so, or use an element X.
- **Drawn structures:** an answer that asks for a Lewis diagram draws it with `<Lewis>` (Fact 3) under the worked words; `formalCharges` where the question is about formal charge. A question may show a drawn structure for the student to work from.
- **Beyond the exam:** nothing in this test should need the label (design, section 5). For five or six domains, ask for the shape only, never a hybridization. Never ask for a crystal structure, a hybrid-orbital drawing or a molecular orbital diagram.
- **Terms:** the lessons' words: "electron domains", "electron geometry" and "molecular shape", "nonpolar covalent", "resonance structures" and "resonance hybrid", formal charge as "valence electrons − nonbonding electrons − bonds", "can hold more than eight" (not "expanded octet").
- **The number check** recomputes, from the question's own data, every number the answer and rubric show: electron counts, formal charges and their sums, electronegativity differences, Coulomb ratios ($q_1 q_2 / d$), sigma and pi counts, domain counts. It asserts each against the MDX and ends `part <x>: N values checked, all match`.
- **Contexts:** vary them across a part. Real materials and uses are welcome (an alloy's job, a salt's melting point, a molecule's polarity and what it dissolves), but each claim about one must be true.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-2-test-design`: the design and this plan, in one pull request. Groups B and C stack on it; every branch targets `main`.

---

## Group B: session 1 (pull request B)

Branch `topic/unit-2-test-session-1`, from `topic/unit-2-test-design`.

### Task 1: Write session 1

Four writers in parallel, one per part. Each gets Plan 4's writer's guide, this plan's "What changes for Unit 2", and its brief:

| Part | Title | Topic | Questions | Points | Practice |
|---|---|---|---|---|---|
| A | Types of bonds | 2.1 | 5 (questions 1–5) | about 22 | Bond type from electronegativity difference and from metal and nonmetal; the continuum, with a borderline case; partial charges on a polar bond; ranking bonds by polarity; explaining an electronegativity trend across a period or down a group with protons, distance and shielding |
| B | Bond energy and Coulomb's law | 2.2 | 6 (questions 6–11) | about 28 | Reading bond length and bond energy off a described potential-energy curve; what dominates on each side of the minimum; bond order against length and energy; atom size against length and energy; Coulomb's law to rank attractions, charge first and then distance; two curves compared in words |
| C | Ionic solids | 2.3 | 4 (questions 12–15) | about 20 | Ranking lattice energy and melting point by Coulomb's law; brittleness; conductivity as a solid, molten and dissolved; a particle picture of an ionic solid described in words |
| D | Metals and alloys | 2.4 | 4 (questions 16–19) | about 20 | The electron-sea model and the properties it explains; interstitial against substitutional alloys from atom sizes; how an alloy's hardness, malleability and conductivity compare with the pure metal's |

Session 1 frontmatter (the controller writes it):

```yaml
---
title: "Comprehensive test, session 1: bonds and solids"
kind: test
order: 7
topics: ["2.1", "2.2", "2.3", "2.4"]
summary: Nineteen scored free-response questions on bond types, bond energy and Coulomb's law, ionic solids, and metals and alloys, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 100
---
```

The introduction says: this is the first of two sittings that together test all of Unit 2; it covers topics 2.1 to 2.4; session 2 covers Lewis diagrams, resonance and formal charge, and shapes; how many questions and points, about 100 minutes, a calculator allowed; write each answer in full before opening the answer and the rubric. Then the four parts, `## Part A: Types of bonds` and so on.

### Task 2: Check session 1, and open the pull request

Plan 4's "How every session is checked", with Unit 2's paths:
- number checks: `<scratch>/unit2-test/checks/part-[abcd].py`;
- the session file: `src/content/practice/unit-2/comprehensive-test-session-1.mdx`;
- the page: `unit-2-compound-structure/practice/comprehensive-test-session-1/`.

The originality check uses Fact 5's sources. Its brief is Plan 4's, with "reaction and data" read as "substance and its numbers, or the same scenario". The fact-checkers also confirm every value against Fact 4 and every drawn structure.

Commit (`feat(practice): add the Unit 2 comprehensive test, session 1`), push, open the pull request with the merge order (A, then this one), and stop.

---

## Group C: session 2 (pull request C)

Branch `topic/unit-2-test-session-2`, from `topic/unit-2-test-session-1`. The drafts may be written while Group B is checked.

### Task 3: Write session 2

Three writers in parallel:

| Part | Title | Topic | Questions | Points | Practice |
|---|---|---|---|---|---|
| E | Lewis diagrams | 2.5 | 6 (questions 1–6) | about 30 | Electron counts for neutral molecules, cations and anions; complete diagrams with double and triple bonds; fewer than eight around the central atom; more than eight (period 3 and below); an odd electron; finding and fixing the error in a given diagram |
| F | Resonance and formal charge | 2.6 | 6 (questions 7–12) | about 30 | Drawing resonance structures and describing the hybrid; bond order and relative bond length from resonance; formal charges and their sum; choosing between diagrams by formal charge (closest to zero, then negative on the more electronegative atom), with the octet first; what the Lewis model cannot show |
| G | Shapes, polarity and hybridization | 2.7 | 10 (questions 13–22) | about 50 | Domains, electron geometry and shape for two to six domains, with and without lone pairs; bond angles and the lone-pair effect, with the three-part answer; molecular polarity from shape and bond dipoles, including a molecule with polar bonds that is nonpolar; sp, sp² and sp³ from the domain count (two to four domains only); sigma and pi counts in a larger molecule; why a double bond fixes cis and trans isomers |

Session 2 frontmatter:

```yaml
---
title: "Comprehensive test, session 2: Lewis diagrams and shapes"
kind: test
order: 8
topics: ["2.5", "2.6", "2.7"]
summary: Twenty-two scored free-response questions on Lewis diagrams, resonance and formal charge, and molecular shape, polarity and hybridization, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 120
---
```

The introduction mirrors session 1's, naming topics 2.5 to 2.7, and adds the one scope note: for five or six electron domains, only the shape is asked.

### Task 4: Check session 2, and open the pull request

As Task 2, with `part-[efg].py` and `comprehensive-test-session-2`. Commit (`feat(practice): add the Unit 2 comprehensive test, session 2`).

### Task 5: Close out

- [ ] An "As built" note at the end of the design: questions and points per part, the topic count, the findings and what was done.
- [ ] "As carried out" notes in this plan where the work went differently.
- [ ] Update the local `CLAUDE.md`.
- [ ] Commit (`docs: record how the Unit 2 comprehensive test was built`), push, open pull request C with the merge order A, B, C, and stop.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3. Two pages, the drawn structures | 1, 3 |
| 4. Weight per topic | 1, 3 (the part tables); 2, 4 (the topic count) |
| 5. Beyond the exam | "What changes for Unit 2"; the fact-checks in 2, 4 |
| 6. Originality, real values | "What changes for Unit 2"; the originality checks in 2, 4 |
| 7. The pipeline | 2, 4 |
| 8. Pull requests | A, 2, 5 |
| 9. No code | Facts 1–3 |
| 10. Done when | 2, 4, 5 |
