# ChemStudy Unit 3 Comprehensive Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a new Unit 3 comprehensive test on chem-study.com: two pages, one per sitting, about 43 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-3/` of the kind `test`, built from the existing practice blocks. An avoid list and a pool per part come first. Then one writer per part drafts its questions and a number-check script; the controller runs the scripts, compares the parts, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes are expected.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe, Python 3 (number checks, standard library only).

**Spec:** `docs/superpowers/specs/2026-11-15-chemstudy-unit-3-comprehensive-test-design.md`.

**Builds on:** Plan 11 (`docs/superpowers/plans/2026-11-15-chemstudy-unit-7-comprehensive-test.md`), which builds on Plan 4 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`). Plan 4's **"The writer's guide"** and **"How every session is checked"** apply, with Plan 11's general rules (systems from a pool; honest values; rubric lines that score every sound route; no pictures; the number check) and the changes in this plan's "What changes for Unit 3". Read Plan 11's "As carried out" notes too.

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists**; a page of that kind shows "Comprehensive test" above its title. Unit 3's seven practice documents take orders 1 to 7, so the two sessions are 8 and 9.
2. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions. A frontmatter `summary` is at most 200 characters (content schema).
3. **The site's constants:** $R = 0.08206$ L·atm/(mol·K) (8.314 J/(mol·K) only for energy), $h = 6.626 \times 10^{-34}$ J·s, $c = 2.998 \times 10^{8}$ m/s, $N_A = 6.022 \times 10^{23}$ mol⁻¹, 22.4 L/mol at STP (273.15 K, 1.0 atm), water's vapor pressure 23.8 torr at 25 °C. Atomic masses from the AP periodic table (S = 32.06, Cu = 63.55).
4. **The sources for the avoid list and the originality check only** (writers never read them):
   - `C:\Users\sahan\Downloads\Chemistry_Resources\Tro_Reference\molecular-approach-6e\`: `ch05-introduction-to-solutions-and-aqueous-reactions.md` (molarity and dilution sections only), `ch06-gases.md`, `ch08-the-quantum-mechanical-model-of-the-atom.md` (the nature of light only), `ch12-liquids-solids-and-intermolecular-forces.md`, `ch13-solids-and-modern-materials.md`, `ch14-solutions.md`;
   - `...\Tro_Reference\structure-and-properties-3e\`: `ch02-the-quantum-mechanical-model-of-the-atom.md` (light only), `ch08-introduction-to-solutions-and-aqueous-reactions.md` (molarity and dilution only), `ch10-gases.md`, `ch11-liquids-solids-and-intermolecular-forces.md`, `ch12-crystalline-solids-and-modern-materials.md`, `ch13-solutions.md`;
   - the teacher's closed exam, `D:\AP_Chem_Prep\Units\unit03-properties-substances\exam\u03-exam.tex`;
   - the site's `src/content/practice/unit-3/*.mdx` and `src/content/lessons/unit-3/*.mdx`.
   `Tro_Reference` is reliable for prose and unreliable for numbers (superscripts are flattened); a number that decides a finding is confirmed against the rendered PDF page (printed page = PDF page − 32).
5. **The framework for Unit 3:** `<scratch>/ced/ced.txt` lines 2671 to 3430, with `<scratch>/ced/unit3-missing.md` for what the extraction lost and the page pictures `<scratch>/ced/unit3-pages/p-065.png` to `p-079.png`. Three exclusions: reading phase diagrams (3.3); colligative properties; calculations of molality, percent by mass and percent by volume (3.7). Never copy its wording.
6. **What the Unit 3 practice's fact-checks kept finding** (Plan 12's "As carried out" notes):
   - a list of forces called complete that is not ("every force present"; "only London dispersion forces" between a nonpolar solute and water, where dipole–induced dipole forces act too);
   - a rule stated as "only", or "compare the kind of force first", which lesson 3.1 calls a trap;
   - a ranking that holds by the rule of thumb but not by the data (hexane against methanol);
   - an answer that says more than the lessons (melting "breaks" the hydrogen bonds; absorbance "is a ratio"; transmittance);
   - significant figures carried past the data.

## Conventions, models

Plan 4's conventions apply: the capital-`C:` working directory; Write and Edit for files (never a heredoc; a multi-line script passed to the shell is refused before it runs); conventional commits with **no AI-attribution trailer**; US spelling; never swallowing an error; no preview server during `npm run test:e2e`.

**Models:** writers and fact-checkers on Fable 5.2 by the teacher's choice; until its usage limit resets (2026-11-17) on Opus, said in each pull request. The avoid list, the originality check and fixers on Sonnet.

**Merging:** under the teacher's "Merge and proceed" (2026-11-15), Claude merges each pull request once its "Build and test" check passes and its content has been fact-checked and checked for originality, waits for the deploy, and only then merges the next.

## What changes for Unit 3

Give this section to every writer with Plan 4's writer's guide and Plan 11's "What changes for Unit 7" (whose equilibrium-only rules do not apply: K, Q, ICE tables, shifts, K_sp).

- **What a writer reads:** the framework notes for its topics (Fact 5); `src/content/lessons/unit-3/` for its topics; `src/content/practice/unit-3/` (what students have already practiced, and the model of the format: `free-response-set.mdx`); the avoid list and its own pool (Task 1). It never reads `D:\AP_Chem_Prep`, `Tro_Reference`, any textbook or slides.
- **Where it writes:** `<scratch>/unit3-test/drafts/part-<x>.mdx` and `<scratch>/unit3-test/checks/part-<x>.py`.
- **Substances:** from the part's own pool, or a substance the question calls made up ("a dye", "compound X"). Never a substance set on the avoid list with the numbers or ranking the list gives for it, and never a lesson's kind of question with a new substance (the list names the kinds).
- **Values:** handbook values only, and the site's constants (Fact 3). Every boiling point, melting point, vapor pressure and molar mass the question states is real; a ranking asked for is true by the data. A molar absorptivity is real or belongs to "a dye". Significant figures follow the data.
- **The terms of the lessons:** London dispersion forces, dipole–dipole forces, dipole–induced dipole forces, hydrogen bonding (hydrogen-bond as a verb), ion–dipole forces; "average kinetic energy" and "kelvin temperature"; "dissolving", never "dissolution"; $R_f$; "molar absorptivity", $\varepsilon$ as `\varepsilon`.
- **Fact 6 is a checklist for every answer:** a list of forces is complete; no "only" that the data break; sizes are compared before kinds of force; nothing beyond the lessons.
- **Rubrics:** a point is for something a student's answer shows. Where there are two sound routes (the combined gas law or $PV = nRT$ twice; mole fraction or partial pressures; reading a slope or using one point), the line says both earn the point.
- **No pictures:** a particle picture is described in words or as counts; a sketch is asked for on paper, and the answer says what it must show.
- **Beyond the exam:** nothing should need the label (design, section 5). No phase diagram, no colligative property, no molality or percent by mass, no effusion, no root-mean-square speed, no van der Waals equation, no photoelectric effect, no heats of phase change.
- **The number check** recomputes, from the question's own data, every number the answer and rubric show (every gas quantity, molarity, ion concentration, dilution, $R_f$, frequency, photon energy per photon and per mole, absorbance, slope, concentration from a calibration), to the figures given. It asserts each against the MDX and ends `part <x>: N values checked, all match`. Handbook values a question states are listed in the script with their source, for the fact-checker.
- **Contexts:** vary them across a part (a weather balloon, a scuba tank, a lab synthesis, a food dye, a water sample). A claim about a real substance or use must be true.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-3-test-design`: the design and this plan, in one pull request, merged when its check passes.

---

## Group B: the avoid list, the pools and session 1 (pull request B)

Branch `topic/unit-3-test-session-1`, from `main` after A is merged.

### Task 1: The avoid list and the pools

- [ ] **Step 1: the avoid list.** One agent on Sonnet, read-only apart from its one output file, reads Fact 4's sources and writes `<scratch>/unit3-test/avoid-list.md`. For each source it lists every substance, set of substances or system used in a **calculation, a ranking or a worked scenario**: what is done with it (a ranking of boiling points, a gas calculation, a dilution, a chromatogram, a photon energy, a Beer's-law calculation) and its numbers. For the site's lessons and practice it also names the **kind of question** (worked example, Check, practice question). It marks Tro numbers confirmed against a PDF page. It also lists, separately, every substance that appears in the sources at all, by name only. No wording is copied.
- [ ] **Step 2: the pools.** The controller gives each part its own substances, none shared between parts, none on the avoid list with its numbers or ranking, each with the handbook values the part may need and their source. The pools are written to `<scratch>/unit3-test/pools.md`, one section per part.

### Task 2: Write session 1

Four writers in parallel, one per part. Each gets Plan 4's writer's guide, Plan 11's "What changes for Unit 7" (general rules only), this plan's "What changes for Unit 3", the avoid list, its pool, and its brief:

| Part | Title | Topics | Questions | Points | Practice |
|---|---|---|---|---|---|
| A | Intermolecular forces | 3.1 | 6 (questions 1–6) | about 26 | Every force between particles of a substance and in a mixture; ranking boiling points by electron count first, then the kind of force; a larger molecule that out-boils one that hydrogen-bonds; shape and contact area; polarizability; ion–dipole forces in a solution |
| B | Solids, liquids and vapor pressure | 3.2, 3.3 | 5 (questions 7–11) | about 22 | A solid classified from its properties and each property explained by its particles and forces; what melting and boiling break and what they leave; vapor pressure and boiling point against the forces, with real data; the particle picture of the three phases, described |
| C | The ideal gas law | 3.4 | 6 (questions 12–17) | about 28 | One unknown from $PV = nRT$; changing conditions; molar mass from a gas's density or mass and volume; gas stoichiometry; Dalton's law with mole fractions; a gas collected over water |
| D | Kinetic molecular theory and real gases | 3.5, 3.6 | 5 (questions 18–22) | about 24 | The model's assumptions and what follows; pressure from collisions, at the particle level; two gases at one temperature and one gas at two temperatures, as Maxwell–Boltzmann distributions sketched on paper and described; when and why a real gas deviates from $PV = nRT$, below and above |

Session 1 frontmatter (the controller writes it):

```yaml
---
title: "Comprehensive test, session 1: forces, solids and gases"
kind: test
order: 8
topics: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"]
summary: Twenty-two scored free-response questions on intermolecular forces, solids and liquids, the gas laws and real gases, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 105
---
```

The introduction says: this is the first of two sittings that together test all of Unit 3; it covers topics 3.1 to 3.6; session 2 covers solutions, separation, solubility and light; how many questions and points, about 105 minutes, a calculator allowed; the constants (R, and water's vapor pressure if a question needs it); write each answer in full before opening the answer and the rubric. Then the four parts, `## Part A: Intermolecular forces` and so on. The summary's count is corrected to the count as built.

### Task 3: Check session 1, and open the pull request

Plan 11's Task 3, with Unit 3's paths:

- number checks: `<scratch>/unit3-test/checks/part-[abcd].py`;
- the session file: `src/content/practice/unit-3/comprehensive-test-session-1.mdx`, rebuilt with `<scratch>/unit3-test/assemble.cjs` from a heading and the drafts (fixes go to the drafts, never the session file);
- the page: `unit-3-substances-and-mixtures/practice/comprehensive-test-session-1/`;
- before the fact-checks, the controller lists every substance in the four drafts and sends a repeat back to one of its writers;
- fact-checks, one per part, with Plan 4's seven points plus: score your own answer with the rubric and say where a sound answer by another route could not be scored; check every item of Fact 6; confirm every handbook value against a second source;
- the originality check (Sonnet), with Fact 4's sources and the avoid list;
- phone measurements with `<scratch>/unit7-practice/wide-eq.cjs` and `<scratch>/unit7-test/wide-table.cjs`;
- after the fixes, a second check of every changed passage.

- [ ] Commit (`feat(practice): add the Unit 3 comprehensive test, session 1`), push, open the pull request, merge it when its check passes, wait for the deploy.

---

## Group C: session 2 (pull request C)

Branch `topic/unit-3-test-session-2`, from `main` after B is merged. The drafts may be written while Group B is checked.

### Task 4: Write session 2

Four writers in parallel:

| Part | Title | Topics | Questions | Points | Practice |
|---|---|---|---|---|---|
| E | Solutions and how to picture them | 3.7, 3.8 | 6 (questions 1–6) | about 26 | Molarity from mass and volume; dilution; the concentration of each ion and of all ions; preparing a solution, with the glassware; the particle picture of an ionic and of a molecular solute, described; what a wrong particle picture gets wrong |
| F | Separation and solubility | 3.9, 3.10 | 5 (questions 7–11) | about 22 | A separation chosen for a mixture, and the property it uses; a chromatogram read from distances ($R_f$, which component is more polar, a change of solvent); distillation of two liquids; solubility predicted and explained by the forces broken and formed, with the forces named in full |
| G | Spectroscopy and photons | 3.11, 3.12 | 5 (questions 12–16) | about 22 | Which region of the spectrum changes rotation, vibration or the electrons; frequency and energy from a wavelength, per photon and per mole; comparing two photons without a calculator; why a substance absorbs only certain wavelengths |
| H | The Beer–Lambert law | 3.13 | 5 (questions 17–21) | about 24 | $A = \varepsilon b c$ for each unknown; a calibration table, its slope, and an unknown read from it; the effect of a longer cell or a dilution; choosing the wavelength; what each kind of error in a measurement does to the result |

Session 2 frontmatter:

```yaml
---
title: "Comprehensive test, session 2: solutions and light"
kind: test
order: 9
topics: ["3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"]
summary: Twenty-one scored free-response questions on solutions and their particle pictures, separation and solubility, spectroscopy and photons, and Beer's law, each with a worked answer and its scoring rubric.
points: <the sum>
minutes: 100
---
```

The introduction mirrors session 1's, naming topics 3.7 to 3.13, and gives $h$, $c$ and $N_A$.

### Task 5: Check session 2, and open the pull request

As Task 3, with `part-[efgh].py` and `comprehensive-test-session-2`. In addition: `grep` under `src/content` for every handbook value the session states, and confirm it has one value site-wide. Commit (`feat(practice): add the Unit 3 comprehensive test, session 2`).

### Task 6: Close out

- [ ] An "As built" note at the end of the design: questions and points per part, the topic count, the findings and what was done.
- [ ] "As carried out" notes in this plan where the work went differently.
- [ ] Update the local `CLAUDE.md`.
- [ ] Commit (`docs: record how the Unit 3 comprehensive test was built`), push, open pull request C, merge it when its check passes, wait for the deploy, return to `main` and delete the branches.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3. Two pages, no pictures | 2, 4; "What changes for Unit 3" |
| 4. Weight per topic | 2, 4 (the part tables); 3, 5 (the topic count) |
| 5. Beyond the exam | "What changes for Unit 3"; the fact-checks in 3, 5 |
| 6. Originality: the avoid list, the pools, honest values | 1; Facts 3, 4, 6; the originality checks in 3, 5 |
| 7. The pipeline | 1, 3, 5 |
| 8. Pull requests | A, 3, 6 |
| 9. No code | Facts 1, 2 |
| 10. Done when | 3, 5, 6 |
