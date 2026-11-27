# ChemStudy Unit 9 Lessons and Diagrams Implementation Plan

**Goal:** Put Unit 9 (Thermodynamics and Electrochemistry) on chem-study.com:
- eleven lessons, 9.1 to 9.11, every Check with a message for each wrong answer;
- three interactive diagrams: a free-energy explorer (9.3), an explorer of ΔG° and K (9.5) and a galvanic cell explorer (9.9, placed again in 9.10);
- the drawn figures the lessons need;
- two corrected sentences in the Unit 5 and Unit 7 practice, which tie diamond and graphite to numbers that do not agree.

**Architecture:** as for Units 4, 6 and 8.
- **Lessons** are MDX files built from the existing lesson blocks.
- **Interactive diagrams** are Svelte components drawn in SVG, wrapped in Astro blocks and loaded when they scroll into view.
- **Every number a diagram shows** comes from a plain TypeScript module with unit tests: `src/lib/free-energy.ts`, `src/lib/gibbs-and-k.ts` and `src/lib/galvanic-cell.ts`. They share no code.

**Tech Stack:** Astro 7, MDX, Svelte 5, KaTeX 0.16 + mhchem, Vitest, Playwright + axe. No new package.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-9-lessons-design.md`.

**Builds on:** the Unit 8 lessons plan (`2026-11-27-chemstudy-unit-8-lessons.md`), the Unit 6 lessons plan (`2026-11-27-chemstudy-unit-6-lessons.md`) and, through them, the Unit 4 lessons plan (`2026-11-16-chemstudy-unit-4-lessons.md`), whose "Rules for writing a lesson" and "How every lesson task ends" hold here except where this plan says otherwise, and the check feedback plans of 2026-11-26 and 2026-11-27.

**How this plan was made.**

1. **The framework summary** was written from the controller's knowledge of the 2024 framework, not from its pages: the College Board's site is blocked in the building session. The design's sections 1 and 3 ask the teacher to verify it, and list what its writer was not sure of.
2. **Two inventories** were made before any brief: every example, substance set, number set and scene of the teacher's Unit 9 materials and of chapters 17 and 18 in `AP_Chem_Prep`, with what the notes stress and where they disagree with themselves; and everything the site's Units 1 to 7 already say about enthalpy, equilibrium, redox, kinetics and dissolving, with the sentences that promise Unit 9 will take something up. No textbook could be reached, so no list of any textbook's examples exists.
3. **A lesson table** (`scratchpad/unit9/lesson-table.md`) gave each lesson its framework statements, its substances and its numbers before any brief was written, so that no two lessons share a number set, and one table of formation values, entropies and reduction potentials for the whole unit.
4. **The briefs** below were written by three agents on Fable 5.2, one per group of lessons, each with a number-check script (`scratchpad/unit9/checks/9-N.py`) that recomputes every number in its brief and tests that ΔG° comes out the same by every route the brief's data allow.
5. **Each group of briefs was fact-checked** by a fresh agent on Fable 5.2 that solved every Check and worked example before reading the answer and judged every reference value from memory, **and checked for originality** on Sonnet against both inventories and the other groups' briefs. The findings are fixed in the briefs; the note under each group says what changed.
6. **"(verify)" in a brief** is the brief-writer's own mark on a value or fact it was not sure of. No agent in this session can look a value up. Every ΔH°f, S°, ΔG°f, E°, K and scene temperature is judged twice from memory, by the fact-checker of the brief and by the fact-checker of the finished lesson, who do not see each other's work. The values they could not both confirm are listed here when the briefs are done: **(the controller fills this in)**.

## Facts verified before writing (do not rediscover)

Established on 2026-11-27 against `main` at `ce2dcca`, with the Unit 8 lessons in progress on their own branches.

1. **Unit 9 exists in `src/data/units.ts`** (lines 133 to 146) with the eleven topic titles; its slug is `unit-9-thermodynamics`, and its colors are in `src/styles/tokens.css`. `src/content/lessons/unit-9/` does not exist yet. The file names are `9-1-introduction-to-entropy.mdx`, `9-2-absolute-entropy-and-entropy-change.mdx`, `9-3-gibbs-free-energy-and-thermodynamic-favorability.mdx`, `9-4-thermodynamic-and-kinetic-control.mdx`, `9-5-free-energy-and-equilibrium.mdx`, `9-6-free-energy-of-dissolution.mdx`, `9-7-coupled-reactions.mdx`, `9-8-galvanic-voltaic-and-electrolytic-cells.mdx`, `9-9-cell-potential-and-free-energy.mdx`, `9-10-cell-potential-under-nonstandard-conditions.mdx` and `9-11-electrolysis-and-faradays-law.mdx` (parentheses and the apostrophe of a title are dropped, as in `6-9-hesss-law.mdx`).
2. **The shared tests pick up a new unit by themselves** (`all-lessons.spec.ts`, `home.spec.ts`).
3. **`tests/unit/check-dist.test.ts` builds its sample lessons in a unit that is not on `FEEDBACK_UNITS`**: topic 8.2 on `main`, topic 9.2 once the Unit 8 work has merged. Unit 9 is the last unit, so before `'9'` joins the list the samples move to **topic 0.2, in a unit 0 that does not exist**: the comment and `data-topic` (lines 12 and 13), `inUnit(0, …)`, the expected string "lesson 0.2" and `FEEDBACK_UNITS.has('0')` (lines 30 to 43), and the expected strings "lesson 0.2" (lines 134 to 189). `checkPage` (`scripts/check-dist.mjs`, lines 92 to 101) reads the topic as text, takes what stands before the period and looks only that up in `FEEDBACK_UNITS`, so any code works, and unit 0 will never be on the list.
4. **A unit on `FEEDBACK_UNITS` needs a data file** for `tests/e2e/check-feedback.spec.ts`: exactly one file in `docs/superpowers/plans/` ending `-chemstudy-unit-9-check-feedback.json`, listing every Check of every Unit 9 lesson on the site. The messages are written with the lessons, so the file is **derived from the lessons** by `scratchpad/unit9/extract-feedback.py` (the script Units 6 and 8 used). It is regenerated in every pull request that adds or changes a Unit 9 lesson.
5. **`tests/unit/check-balance.test.ts` needs at least 12 Checks with options in a unit**, so Unit 9 joins `BALANCED_UNITS` (line 9) in the last pull request, when all eleven lessons are in.
6. **A `<Check>` takes** `answer` or `numeric` (+ `unit`), and `misses`, `slips`, `tolerance`. The build refuses a message that is empty, over 180 characters, holds `$`, `<`, `>` or a backslash, starts "Not quite", or does not end with a period or question mark; a message for the answer's own option; and a slip inside the tolerance. **A typed minus sign is read**, so an answer with a sign is written `numeric="-91.2"`, as lesson 6.6 does. **The tolerance is a fraction of the answer** (2 percent unless the Check sets its own).
7. **A typed answer may be** a plain decimal, e-notation (`2.5e-3`), `2.5 x 10^-3`, or `2.5 × 10⁻³` (`parseNumber` in `src/lib/check.ts`). A small or large `numeric` is written in e-notation and shown as a power of ten.
8. **The equation sheet** gives, for this unit (as the site's own equation page has it, `src/pages/tools/equations.mdx`, lines 243 to 317): the three sums of products minus reactants; ΔG° = ΔH° − TΔS°; ΔG° = −RT ln K with R = 8.314 J/(mol·K); ΔG° = −nFE°; E_cell = E°_cell − (RT/nF) ln Q; I = q/t; F = 96,485 C per mole of electrons; 1 V = 1 J/C; 1 A = 1 C/s. It gives no rule for combining half-cell potentials, no table of signs against temperature and no value of any S°, ΔG°f or E°. Its line 350 says that q is charge in some places and heat in another.
9. **The one stated exclusion of Unit 9** (as the controller knows the framework): labeling an electrode positive or negative (9.8). The limit on the Nernst equation (9.10) is believed to be a statement of what to know, not an exclusion; the design's section 3 says how the lessons are safe under either reading.
10. **Anatomy of an interactive diagram**, with line counts and the shared CSS classes: `scratchpad/unit9/tech-facts.md`, section "Interactive diagrams". The models are the Unit 6 explorers and the Unit 4 titration diagram.
11. **No tool in the repository renders an SVG.** `scratchpad/unit9/svg-shot.cjs` does (Playwright with the container's Chromium).
12. **Running the browser tests in a Claude Code cloud session:** unset `AI_AGENT`, `CLAUDECODE` and `CLAUDE_CODE_ENTRYPOINT` for the run (Astro's preview otherwise starts in the background and Playwright's web server "exits early"), and point `launchOptions.executablePath` at `/opt/pw-browsers/chromium` in a config kept outside the repository.
13. **What the site already says that Unit 9 must agree with** is in `scratchpad/unit9/site-inventory.md`, sections 1 to 7 and 11, and in the design's table of promises (section 2): kJ/mol_rxn and the sign of ΔH (lesson 6.6, lines 13 and 31 to 43); standard states, and an element's ΔH°f of zero (lesson 6.8, lines 88 to 108); the formation values lesson 6.8 prints (lines 118 to 123, 258, 305); activation energy (lesson 5.5, line 13) and what a catalyst changes (lesson 5.11, lines 189 to 193); K_c, K_p in atm, and Q (lesson 7.3, lines 118 to 162); the sizes of K (lesson 7.5, lines 19 to 33) and the bulb of ethene and hydrogen (lines 218 to 235); the K_sp table (lesson 7.11, lines 56 to 63); oxidation and reduction (lesson 4.7, lines 108 to 125) and half-reactions (lesson 4.9, lines 9 to 43); the watch battery (lesson 4.7, lines 212 to 249) and the smelter (lesson 4.5, lines 14 to 20).
14. **No lesson or practice page of Units 1 to 7 uses** "spontaneous", "disorder", "anode", "cathode", "salt bridge", "electrode", "half-cell" or any E° value, and none has a drawing of a cell (the site inventory's section 0, checked again by a search on 2026-11-27). Unit 9 introduces all of them.
15. **Diamond and graphite.** `src/content/practice/unit-5/skill-ladders.mdx`, line 1058, gives ΔG° = −2.9 kJ/mol (right). `src/content/practice/unit-7/skill-ladders.mdx`, line 328, ties the same change to K = 10¹⁰ (wrong: −2.9 kJ/mol gives about 3.2 at 298 K, and a change between two pure solids has no K expression). Line 11 of the Unit 5 page calls the change "enormously favorable". The design's section 3 gives the two replacement sentences; group C makes them.

## Conventions for every task

- Work in `/home/user/chem-study`. The teacher's `AP_Chem_Prep` checkout is read-only and writers never read it.
- **American English** in every file (`CLAUDE.md`); `npm test` checks the site's sources.
- Conventional commits, made by the controller only.
- Tests first for code: write the test, run it, watch it fail, then implement. Never swallow an error.
- **Only the controller builds, runs browser tests and commits.** Writers and builders working at the same time write files and run unit tests only: concurrent builds collide.
- **One pull request per group, stacked, each targeting `main`. Claude merges each when "Build and test" passes** (the design's section 1), with a merge commit, in order. While Unit 8's pull requests are open, a Unit 9 branch is rebased on `main` after each Unit 8 merge: both units edit `src/pages/[unit]/[topic].astro`, `src/styles/diagram.css`, `tests/unit/check-dist.test.ts` and `FEEDBACK_UNITS`.
- **Every pull request says** that the framework was not read from its pages, that no textbook was read, and which reference values rest on memory, with those the two checkers could not both confirm listed for the teacher.

## Models

| Task | Model |
|---|---|
| Briefs; lesson writers; fact-checks; second checks | Fable 5.2 |
| The three diagrams (module, tests, component, browser tests) | Opus |
| Code reviews; originality checks; applying decided fixes | Sonnet |
| Inventories | Haiku |

Never both the writer and the checker of a lesson on a cheaper model.

## How a group is carried out

1. Code first where a lesson uses a new block: one builder per diagram (the two shared files, `diagram.css` and `[topic].astro`, are edited by the controller from what the builder reports). The three diagrams are independent: no builder waits for another.
2. One writer per lesson, at the same time, files only: the lesson, its figures.
3. The controller, in order:
   1. regenerates the unit's check-feedback data file from the lessons;
   2. `npm test`, `npm run build`, the browser tests;
   3. the sweep (`scratchpad/feedback/sweep.mjs`): every wrong option and slip shows its message, every answer is accepted, and at 412, 390, 360 and 320 px no message leaves its card and no page scrolls sideways; and a look at every figure (`svg-shot.cjs`);
   4. one independent fact-checker per lesson, on Fable 5.2;
   5. one originality check for the group, on Sonnet;
   6. decided fixes applied (Sonnet), the build and tests again, and a second check of what changed (Fable 5.2);
   7. a code review of any code (Sonnet);
   8. **after the code review, every sentence of a lesson that quotes an explorer's number is compared with the module's output again** (in Unit 6 a review changed a readout after the lesson had quoted it);
   9. the commits, the pull request, and the merge when "Build and test" passes.

## Rules for writing a lesson

The Unit 4 plan's "Rules for writing a lesson" hold (the file, the seven parts, the markup, the voice, phone width, static figures), with `unit-9` and `9-N-<slug>.mdx` for the file. Models to read first: `src/content/lessons/unit-6/6-8-enthalpy-of-formation.mdx` (a table of formation values, the sum of products minus reactants laid out for a phone, typed-number Checks with signs), `src/content/lessons/unit-6/6-6-introduction-to-enthalpy-of-reaction.mdx` (kJ/mol_rxn, negative typed answers with `slips`), `src/content/lessons/unit-4/4-9-oxidation-reduction-redox-reactions.mdx` (half-reactions, electrons, long equations split with `aligned`) and `src/content/lessons/unit-6/6-4-heat-capacity-and-calorimetry.mdx` (a lesson with messages on every Check and an explorer placed in it).

**One Unit 4 rule stays as it is.** A question gives every value it needs: each S°, ΔH°f, ΔG°f, E° and K. A student is expected to know only what the exam expects: the equations of the sheet, that an element in its standard state has ΔH°f and ΔG°f of zero, and that oxidation is at the anode.

**Added for Unit 9:**

- **Every Check carries its messages**, exactly as the brief gives them: `misses` for each wrong option, `slips` for a typed number, formatted as Unit 1's lessons format them (`answer` first in the tag). A writer who must reword a message keeps the rules of the check feedback design's section 4.4 and reports it.
- **"Thermodynamically favored" and "thermodynamically unfavored".** Never "spontaneous" (except the one sentence of lesson 9.3 that the brief gives), never "favorable" for a process, never "disorder". "Favored" never stands for "fast" or for "goes to completion".
- **Signs on every Δ.** A positive ΔH°, ΔS°, ΔG° or E° is written with its plus sign in data and in answers: `+62.2`, `+0.34`. The true minus sign (−) in prose and tables; a hyphen-minus only inside math and inside `numeric` and slip keys.
- **Units.** S° in J/(mol·K). ΔH° and ΔG° of a reaction in `\text{kJ/mol}_\text{rxn}` and ΔS° in `\text{J/(mol}_\text{rxn}\text{·K)}` in display math, as lesson 6.6 writes the first; "kJ/mol" and "J/(mol·K)" in tables, options and messages. A temperature in an equation is in kelvins; 25 °C is 298 K.
- **The conversion is a line of its own.** Wherever joules meet kilojoules (the entropy term of ΔG° = ΔH° − TΔS°; ΔG° going into or coming out of −RT ln K; the answer of −nFE°), the lesson shows the conversion on its own line, never folded into another step.
- **Sums of products minus reactants** are laid out as lesson 6.8 lays out its enthalpy sum: one line for the products, one for the reactants, each term "coefficient(value)", numbers only, the unit in the sentence beside it.
- **Exponentials and logarithms.** `\ln K`, and `e^{...}` with the exponent worked out on the line before; never an exponent holding a fraction with units. A K is given to two figures.
- **Half-reactions** as lesson 4.9 writes them: `\ce{Co(s) -> Co^2+(aq) + 2e^-}`, with state symbols, and H⁺(aq) where the brief has it. An overall cell equation has no electrons in it.
- **Electrodes have no sign.** Never "positive electrode", "negative electrode", "+" or "−" beside an electrode, in text, alt text, caption or figure. Anode and cathode are named by oxidation and reduction.
- **A potential is never multiplied.** Where a half-reaction is doubled, the lesson writes its potential unchanged on the next line, as the brief does. E°cell is always "cathode minus anode" with both values as the table prints them.
- **Cells are argued with Q.** Lessons 9.8 to 9.11 never write "shift", "Le Châtelier" or "the equilibrium moves" about a cell, except lesson 9.10's one sentence that says why.
- **q and Q.** In lesson 9.11, `q` is charge, and the brief's sentence saying so comes at its first use. Lesson 9.10 uses `Q` for the reaction quotient. Neither lesson uses the other letter.
- **Faraday's law is a chain of steps**, each on its own line with its unit in words. Never one combined formula.
- **Values** are the brief's, each from its "Values" table. Do not swap in a remembered value: the brief's set was tested for agreement between routes, and a single changed figure breaks it.
- **Words.** "Galvanic cell" ("voltaic" once, in 9.8); "electrolytic cell"; "half-cell"; "salt bridge"; "standard reduction potential"; "cell potential"; "kinetic control". No "oxidizing agent", "reducing agent", "emf", "crossover temperature" or "driving force" as a quantity. The Nernst equation, cell notation, ΔG = ΔG° + RT ln Q and the entropy of the surroundings appear only where the brief puts them.

**Static figures:** as in the Unit 4 plan. **A curve or line is drawn through the points the brief lists**, each computed by the brief's script, never sketched. Render every figure and look at it: `node <scratchpad>/unit9/svg-shot.cjs <out folder> 390 <file.svg>`.

## How every lesson task ends

As in the Unit 4 plan ("Build and test", "Look at it", "Fact-check, independently", "Originality check, once per group", "Fix", "Commit"), run by the controller as "How a group is carried out" says, with these changes:

- **The fact-checker** gets the lesson file, its figures and `scratchpad/ced/unit9-framework.md`. Beside the Unit 4 list, it:
  - judges every reference value (S°, ΔH°f, ΔG°f, E°, K, a vapor pressure, an activation energy, a temperature in a scene) against what it knows of standard tables, says how sure it is, and lists every value it cannot confirm;
  - checks that every reaction's ΔG° agrees by every route the lesson's data allow (formation values; ΔH° − TΔS°; −RT ln K; −nFE°), and says by how much they differ;
  - checks every unit and every conversion between joules and kilojoules, every temperature in kelvins, and every sign;
  - checks every sum for its coefficients and for elements entered correctly (zero for ΔH°f and ΔG°f, not zero for S°);
  - checks every cell: which half-reaction is the reduction, E°cell as cathode minus anode, no potential multiplied, n from the balanced equation, the equation balanced in atoms and charge, and Q written without solids;
  - checks that no electrode has a sign and that no cell is argued with Le Châtelier's principle;
  - for each typed-number Check, recomputes every slip from its mistake, confirms it lies outside the tolerance, and names any honest rounding of the right answer that would be refused (above all for a typed K);
  - judges every wrong-answer message by the check feedback design's section 4.4, above all whether it leaves one option standing.
- **The originality check** compares with the teacher's Unit 9 and chapter 17 and 18 materials (`/home/user/sahangh/ap_chem_prep`, read-only, not the `exam` folders or the `*-exam.md` files), the site's other lessons and practice, and the unit's other lessons. No textbook is available; the pull request says so. A replacement it proposes must be a true example of the idea, and gets the same search.

## File structure

```
src/
  lib/free-energy.ts                                ΔG° = ΔH° − TΔS° for four reactions from 200 K to 1,400 K: the three terms, the verdict, the temperature of zero, readouts (Group B)
  lib/gibbs-and-k.ts                                K from ΔG° at 298 K, 500 K and 1,000 K for A ⇌ B: K, the mixture out of 100, readouts (Group C)
  lib/galvanic-cell.ts                              two half-cells from six couples at four concentrations: anode and cathode, the equation, n, E°cell, ΔG°, Q, E, readouts (Group D)
  components/diagrams/FreeEnergy.svelte GibbsAndK.svelte GalvanicCell.svelte
  components/lesson/FreeEnergy.astro GibbsAndK.astro GalvanicCell.astro     <FreeEnergy />  <GibbsAndK />  <GalvanicCell />
  styles/diagram.css                                + rules the three diagrams need
  pages/[unit]/[topic].astro                        + FreeEnergy, GalvanicCell, GibbsAndK in `blocks`
  content/lessons/unit-9/                           eleven new .mdx files
  content/practice/unit-5/skill-ladders.mdx         one sentence (line 11) (Group C)
  content/practice/unit-7/skill-ladders.mdx         one sentence (line 328) (Group C)
public/figures/                                     9-1-... to 9-11-... static figures
scripts/check-dist.mjs                              Unit 9 on FEEDBACK_UNITS (Group B)
tests/unit/free-energy.test.ts gibbs-and-k.test.ts galvanic-cell.test.ts
tests/unit/check-dist.test.ts                       sample lessons move to topic 0.2 (Group B)
tests/unit/check-balance.test.ts                    Unit 9 on BALANCED_UNITS (Group D)
tests/e2e/diagram-free-energy.spec.ts diagram-gibbs-and-k.spec.ts diagram-galvanic-cell.spec.ts
docs/superpowers/plans/2026-11-27-chemstudy-unit-9-check-feedback.json   derived from the lessons, in every group
```

## The groups

| Group | Pull request | Branch | Lessons | Code |
|---|---|---|---|---|
| A | design and plan | `topic/unit-9-lessons-design` | none | none |
| B | "feat(lessons): Unit 9 lessons 9.1-9.4 and the free-energy explorer" | `topic/unit-9-entropy-and-free-energy`, from A's branch | 9.1, 9.2, 9.3, 9.4 | the free-energy explorer; the sample lessons to 0.2; `FEEDBACK_UNITS` |
| C | "feat(lessons): Unit 9 lessons 9.5-9.7 and the explorer of free energy and K" | `topic/unit-9-equilibrium-and-coupling`, from B's | 9.5, 9.6, 9.7 | the explorer of ΔG° and K; the two practice sentences about diamond |
| D | "feat(lessons): Unit 9 lessons 9.8-9.11 and the galvanic cell explorer" | `topic/unit-9-electrochemistry`, from C's | 9.8, 9.9, 9.10, 9.11 | the galvanic cell explorer; `BALANCED_UNITS`; the close-out |

**Group C's two practice sentences** are changed exactly as the design's section 3 gives them ("A conflict on the site"), in a commit of their own ("fix(practice): stop tying diamond and graphite to a K of 10¹⁰"), after lesson 9.5's fact-check has confirmed that −2.9 kJ/mol gives a K of about 3.2 and that −100.4 kJ/mol gives 4 × 10¹⁷ for ethene with hydrogen. The practice pages' own tests (`check-dist` on the built page) are run with the group's build.

The last task of group D closes the unit: an "As built" section in the design, "As carried out" notes under each group here, and in the last pull request, for the teacher, what to verify against the framework, every value the checkers could not both confirm, and Claude's calls from the design's section 1.

---

## Group B: entropy and free energy (pull request B)

Branch: `topic/unit-9-entropy-and-free-energy`, from this plan's branch (`topic/unit-9-lessons-design`).

Lesson 9.3's brief holds the "Diagram data" of the free-energy explorer. Before the lessons: the sample lessons of `tests/unit/check-dist.test.ts` move to topic 0.2, and Unit 9 goes on `FEEDBACK_UNITS`.

> **How these briefs were checked.** See section 11 of the design. The first fact-check found no wrong value. The originality check had lesson 9.1's figure and third Check, lesson 9.3's worked example (now magnesium hydride) and most of lesson 9.4's scenes changed. The second check found lesson 9.4's third Check saying something false about how hopcalite works; it was reworded.

### Task 1: Lesson 9.1, Introduction to Entropy

**Files:**
- Create: `src/content/lessons/unit-9/9-1-introduction-to-entropy.mdx`
- Create: `public/figures/9-1-three-states.svg`, `public/figures/9-1-gas-given-room.svg`, `public/figures/9-1-energy-spread.svg`
- No interactive diagram.

**Brief**

- **Front matter:** `topic: "9.1"`, `minutes: 14`, summary: "What entropy measures, and how to tell whether a change raises or lowers it from the room its particles have and the ways their energy can be shared." (No colon in the summary.)
- **Framework (9.1, two statements):** (1) Entropy rises when matter becomes more spread out. The cases named: a solid melting and a liquid vaporizing, where each particle gains room to move; a gas given a larger volume at the same temperature; and a reaction that ends with more moles of gas than it began with. (2) Entropy rises when energy becomes more spread out: by the kinetic molecular theory, the kinetic energies of a gas's particles range more widely at a higher temperature, so entropy rises with temperature. The objective is to give the sign of the entropy change of a physical or chemical process and to say which of two changes is the larger. **What this lesson does not do:** no value of $S^\circ$ and no calculation of any kind (topic 9.2); nothing about whether a change is thermodynamically favored, and the words "favored" and "unfavored" are not used (topic 9.3); the entropy of dissolving a salt, beyond one sentence that it has a twist and belongs to topic 9.6; no entropy of the surroundings or of the universe and no named law; no microstates, no probability of a gas "going back", no $S = k \ln W$. **Equation sheet:** nothing for this topic.
- **Opening:** go back to the mint of topic 6.1. A sugar-free mint sweetened with xylitol feels cool as it dissolves on your tongue: the dissolving takes energy in, and it happens by itself all the same. Topic 6.1 left that as a puzzle and said that energy is not the only thing that decides whether a change happens. The other thing is called entropy, and this lesson is about what it measures and how to tell whether it goes up or down. Note for the writer: three sentences at most; say "happens by itself", not "spontaneous" and not "favored". Do not explain the xylitol yet: the first section does it in one sentence.
- **Section "What entropy measures":**
  - **Entropy**, $S$, is a measure of how widely the matter and the energy of a system are spread out. The more ways the particles can be arranged, and the more ways their energy can be shared among them, the higher the entropy. (Bold "entropy" here, its first use, with the definition in the same sentence.)
  - The system is what topic 6.1 said it is: the particles you are watching. The change in its entropy is written $\Delta S$, final minus initial, like every $\Delta$: positive when the system's entropy rises, negative when it falls. Display: $\Delta S = S_\text{final} - S_\text{initial}$.
  - The xylitol, in one sentence: in the crystal each xylitol molecule is held in one place; dissolved, the same molecules are scattered through the liquid, with far more places to be, so the entropy of the xylitol goes up. Then one sentence, and no more: dissolving a salt has a twist, because water molecules are held around each ion, and topic 9.6 deals with it.
  - One sentence on the word the student may have met: you may have seen entropy described as "disorder"; the question to ask is never how untidy something looks but how many ways its particles and their energy can be arranged. (This is the only place the word appears. No messy room, no deck of cards.)
  - One sentence of plan: there are two things to watch, the room the particles have and the way their energy is shared, and this lesson takes them in that order. Numbers wait for topic 9.2: here you find only the sign of $\Delta S$ and which of two changes is larger.
  - `<KeyIdea>`: Entropy, $S$, measures how widely the matter and the energy of a system are spread out. More ways to arrange the particles, or more ways to share the energy among them, means more entropy. $\Delta S$ is positive when the entropy of the system rises and negative when it falls.
- **Section "Solid, liquid, gas":**
  - Topic 3.3 drew one substance three ways. In a solid each particle has a fixed place and only vibrates there. In a liquid the particles still touch but slide past one another, so each has many more places it can be. In a gas the particles are far apart and each one can be anywhere in the container. Place the figure `9-1-three-states.svg` here.
  - So for one substance the entropy runs solid, then liquid, then gas, from lowest to highest. Melting raises it ($\Delta S > 0$). Vaporizing raises it. So does subliming, solid straight to gas. Each of the reverse changes, freezing, condensing and depositing, lowers it ($\Delta S < 0$).
  - The two steps are not the same size. Topic 3.3 showed that a mole of liquid takes up nearly the same volume as a mole of the solid, while a mole of gas near room conditions takes up more than a thousand times as much. So the step from liquid to gas is far larger than the step from solid to liquid. (The lesson may quote topic 3.3's figure as "more than a thousand times" and nothing else from its worked example.)
- **Section "A gas given more room":**
  - A gas does not have to change phase to gain room. Place the figure `9-1-gas-given-room.svg` here, with three sentences: a gas is trapped in a cylinder by a piston that can slide. Pull the piston out until the gas has twice the volume, and wait for the gas to come back to the temperature of the room. Nothing about the particles has changed and the temperature is what it was, but each particle can now be found anywhere in a space twice as large, so there are more ways to arrange them: $\Delta S > 0$.
  - The reverse holds too: push the piston back in, let the gas return to the same temperature, and its entropy falls.
  - `<KeyIdea>`: Matter that gains room gains entropy. For one substance, entropy rises from solid to liquid and rises much more from liquid to gas. A gas that expands at a constant temperature gains entropy, and a gas that is compressed loses it.
  - Note for the writer: say nothing about probability, about a gas let into an empty space, about the gas "never going back", or about mixing two gases. The figure shows one gas in one cylinder. "Wait for the gas to come back to the temperature of the room" matters: a gas cools a little as it pushes a piston out, and the comparison is between two states at one temperature. Say that much and no more; do not mention work or heat.
- **Check 1**, `<Check answer={2}>`, after the key idea: "Which of these changes lowers the entropy of the substance named?" Options:
  1. Helium leaving a pressurized cylinder to fill a party balloon
  2. Water vapor in a cloud condensing into raindrops
  3. A puddle on a sidewalk drying up on a sunny afternoon
  4. Wax beside a candle's wick melting into a clear pool

  Why: rain forming is a gas turning into a liquid. Each water molecule goes from having the open air to move in to being held against its neighbors in a drop, so the water's entropy falls. The other three raise the entropy of the substance: the helium atoms get more room when they leave the crowded cylinder, the water of the puddle goes from liquid to gas, and the wax goes from solid to liquid. Misses:
  - 1: "In the cylinder the helium atoms were squeezed into a small volume. Do they have more room in the balloon, or less?"
  - 3: "Drying is the liquid turning into vapor. Compare the room a water molecule has in the puddle with the room it has in the air."
  - 4: "Melting frees the wax molecules from their fixed places. Does that give them more ways to be arranged, or fewer?"
- **Section "Counting moles of gas in a reaction":**
  - A reaction can make gas or use it up. Because a mole of gas has so much more room than a mole of any solid or liquid, the gas decides the matter. As a rule, a reaction that ends with more moles of gas than it started with has $\Delta S > 0$, and a reaction that ends with fewer has $\Delta S < 0$.
  - The method, as three short steps in the text: find the substances marked (g); add up their coefficients on each side; compare. Solids and liquids are left out of the count: beside a change in the moles of gas, what they add is small. (Note for the writer: say nothing here about dissolved ions. Water held around an ion can outweigh a mole of gas, as in a metal dissolving in acid; that is topic 9.6. Every reaction in this lesson is among pure solids, liquids and gases.)
  - `<KeyIdea>`: To find the sign of $\Delta S$ for a reaction, count the moles of gas on each side first. More moles of gas among the products means the entropy rises. Fewer means it falls.
- **Worked example "Four changes, four signs":** find the sign of $\Delta S$ for each change. Each equation on its own line.
  1. **A block of camphor shrinking in a closet.** Camphor is a white, waxy solid that people hang in closets to keep moths away, and a block of it slowly disappears without ever melting: it sublimes. $\ce{C10H16O(s) -> C10H16O(g)}$. No gas before, 1 mol of gas after: $\Delta S$ is positive. Each molecule leaves a fixed place for the whole closet.
  2. **White smoke.** Hold the open mouths of a bottle of ammonia solution and a bottle of concentrated hydrochloric acid near each other and a white smoke forms where the two gases meet. The smoke is tiny crystals of ammonium chloride. $\ce{NH3(g) + HCl(g) -> NH4Cl(s)}$. Gas before: 1 + 1 = 2 mol. Gas after: none. $\Delta S$ is negative.
  3. **Iron rusting.** Taking rust as iron(III) oxide: $\ce{4Fe(s) + 3O2(g) -> 2Fe2O3(s)}$. Gas before: 3 mol. Gas after: none. $\Delta S$ is negative. The 4 mol of solid iron and the 2 mol of solid oxide are not counted.
  4. **Nitrous oxide breaking down** (the reaction of topic 6.6). $\ce{2N2O(g) -> 2N2(g) + O2(g)}$. Gas before: 2 mol. Gas after: 2 + 1 = 3 mol. $\Delta S$ is positive.

  Closing sentence: each time, the reason fits in a phrase: "a solid becomes a gas", "2 mol of gas become a solid", "3 mol of gas are used up", "2 mol of gas become 3". An exam answer needs the sign and that phrase.

  Note for the writer: rust is really a hydrated oxide, so keep "taking rust as iron(III) oxide". Do not say where or how fast nitrous oxide breaks down (topic 9.4 has that), and do not say that any of the four "is favored". Do not give the camphor a melting point or a vapor pressure.
- **Check 2**, `<Check answer={4}>`, after the worked example: "A drawing shows a sealed box that holds 8 molecules of a gas, far apart, each made of 2 atoms. A second drawing shows the same box at the same temperature after a reaction: it holds 4 molecules, far apart, each made of 4 atoms. What is the sign of $\Delta S$ for the reaction, and why?" Options:
  1. Positive, because each molecule in the second drawing is larger
  2. Zero, because the atoms, the volume and the temperature are unchanged
  3. Negative, because some of the atoms have left the sealed box
  4. Negative, because the same atoms now make up fewer gas particles

  Why: both drawings hold 16 atoms (8 × 2 and 4 × 4), so nothing has left. What has changed is the number of separate gas particles, from 8 to 4. That is the particle picture of "fewer moles of gas": half as many particles to place in the same box, so fewer ways to arrange them, and the entropy falls. A larger molecule is still one particle. Misses:
  - 1: "A larger molecule is still one particle. Count the separately moving particles in each drawing."
  - 2: "The atoms are the same, but are they grouped into the same number of separately moving particles?"
  - 3: "Count the atoms in each drawing: 8 × 2 and 4 × 4. The box is sealed."

  Note for the writer: the two drawings are described in words; there is no figure for this Check. Do not name the gas.
- **Section "When the count comes out even":** this section **opens with Check 3**, under one lead-in sentence ("Now try a reaction where counting does not finish the job."). The rule is stated after the Check, not before it. Do not move the Check.
- **Check 3**, `<Check answer={3}>`: "In bright light, methane and chlorine react. The first products are chloromethane and hydrogen chloride. The equation is on its own line:" $\ce{CH4(g) + Cl2(g) -> CH3Cl(g) + HCl(g)}$ "Without a table of data, what can you say about $\Delta S$ for this reaction?" Options:
  1. It is large and positive, because two new substances are formed
  2. It is exactly zero, because 2 moles of gas become 2 moles of gas
  3. It is small, and counting moles of gas cannot give its sign
  4. Nothing can be said about its size or its sign without a table

  Why: there are 2 mol of gas on each side, so the particles end with about as much room as they started with, and no large change in entropy is expected. But the four gases are four different substances, and a mole of one does not hold exactly the same entropy as a mole of another, so the change is not exactly zero either. Which side comes out a little higher cannot be seen from the equation. A table settles it (topic 9.2): for this reaction $\Delta S$ turns out to be small and positive. Misses:
  - 1: "New substances form in every reaction. What sets the size of ΔS is the room the particles gain or lose. Count the moles of gas."
  - 2: "The count is right: 2 moles of gas on each side. But are the four gases the same substance, with the same entropy for each mole?"
  - 4: "Start with what you can count. How many moles of gas are on each side, and what does that say about the size of the change?"

  Note for the writer: methane and chlorine do react this way in ultraviolet or bright light (and on heating), and chloromethane is a gas at room temperature. Some of the chloromethane goes on to react with more chlorine, which is why the question says "the first products"; do not go into it, and do not explain how light starts the reaction.
- **After Check 3**, two sentences that state the rule: when a reaction has the same number of moles of gas on both sides, or is among solids and liquids only, $\Delta S$ is small, and its sign cannot be found by counting; it takes the values of topic 9.2. On the exam, say exactly that: "the moles of gas do not change, so $\Delta S$ is small and its sign cannot be predicted without data."
- **Worked example "Which change is larger?":** two comparisons.
  1. **Melting or vaporizing.** Mercury melts at −39 °C and boils at 357 °C. Which has the larger $\Delta S$: melting 1 mol of solid mercury, or vaporizing 1 mol of liquid mercury? Equations: $\ce{Hg(s) -> Hg(l)}$ and $\ce{Hg(l) -> Hg(g)}$. Both are positive. In melting, the atoms go from touching in fixed places to touching and moving: a little more room. In vaporizing, they go from touching to far apart: more than a thousand times the volume. Vaporizing has the larger $\Delta S$, by a wide margin. The same holds for other substances: the step that makes the gas is the big one.
  2. **Two reactions that make gas.** Nitrous oxide breaking down, $\ce{2N2O(g) -> 2N2(g) + O2(g)}$, and liquid hydrazine burning, $\ce{N2H4(l) + O2(g) -> N2(g) + 2H2O(g)}$. Count the gas. Nitrous oxide: 2 mol before, 3 mol after, a gain of 1 mol. Hydrazine: 1 mol before (the oxygen; the hydrazine is a liquid), 3 mol after, a gain of 2 mol. Both have $\Delta S > 0$, and the hydrazine reaction has the larger increase, because it gains more moles of gas. Closing sentence, with its hedge: as a rule, the larger the change in the moles of gas, the larger the change in entropy; tables bear this pair out.

  Note for the writer: give no number for either $\Delta S$ (the values are +148.4 and +242.8 J/(mol·K), in topics 9.3 and 9.2). Keep "as a rule". Hydrazine has no scene here: no rocket, no thruster.
- **Check 4**, `<Check answer={4}>`: "Each equation below is for one mole of reaction. Which reaction has the largest increase in entropy?" The four equations are set as lettered blocks in the question, each with a few words:
  - A, barium peroxide giving off oxygen when it is heated strongly: $\ce{2BaO2(s) -> 2BaO(s) + O2(g)}$
  - B, quicklime taking up water: $\ce{CaO(s) + H2O(l) -> Ca(OH)2(s)}$
  - C, ammonia burning over hot platinum: $\ce{4NH3(g) + 5O2(g) -> 4NO(g) + 6H2O(g)}$ (split after the arrow)
  - D, baker's ammonia breaking down in a hot oven: $\ce{NH4HCO3(s) -> NH3(g) + H2O(g) + CO2(g)}$ (split after the arrow)

  Options: Equation A; Equation B; Equation C; Equation D.

  Why: count the change in the moles of gas. A: none before, 1 after, a gain of 1. B: no gas on either side, so a small change. C: 4 + 5 = 9 before and 4 + 6 = 10 after, a gain of 1. D: none before and 1 + 1 + 1 = 3 after, a gain of 3. D gains the most gas, so it has the largest increase in entropy. C makes the most gas, 10 mol, but it began with 9. Misses:
  - 1: "This one makes 1 mole of gas from none. Find the change in the moles of gas for each of the other equations too."
  - 2: "No gas appears on either side here, so the entropy changes little. Find the change in the moles of gas for each equation."
  - 3: "It makes 10 moles of gas, but it starts with 9. What counts is the change in the moles of gas."

  Note for the writer: "baker's ammonia" as sold today is mostly ammonium hydrogen carbonate, a leavening for thin, crisp cookies; give the name once in the question as "baker's ammonia (here ammonium hydrogen carbonate)". All four reactions are real. Give no temperatures.
- **Section "Energy with more ways to be shared":**
  - So far only the matter has spread out. Energy spreads too. Topic 3.5 said that the kelvin temperature of a sample measures the average kinetic energy of its particles, and topic 5.5 showed that the particles do not all have the average: their kinetic energies are spread over a range. Place the figure `9-1-energy-spread.svg` here.
  - Read the figure: at 300 K most of the particles have kinetic energies in a narrow band near the low end. At 600 K the curve is half as tall and twice as wide. The area under each curve is the same, because the number of particles is the same, but at the higher temperature the particles are spread over a wider range of kinetic energies. There is more energy to share and there are more ways to share it. That is a rise in entropy.
  - So warming a substance raises its entropy and cooling lowers it, even when its volume and its phase do not change. The framework states this for a gas; it is true of liquids and solids as well.
  - `<KeyIdea>`: Energy that is shared in more ways means more entropy. Warming a sample gives its particles more energy to share and more ways to share it, so its entropy rises with temperature.
  - Note for the writer: the Check below must not be answered word for word by the sentence before it. End the section's text with the key idea as worded here ("shared in more ways"); the Check's correct option speaks of kinetic energies ranging more widely, and its work is in the rigid cylinder.
- **Check 5**, `<Check answer={1}>`: "A sealed, rigid steel cylinder of neon is carried from a storeroom at 5 °C into a workshop at 30 °C and left to warm. What happens to the entropy of the neon, and why?" Options:
  1. It rises, because the atoms' kinetic energies range more widely
  2. It rises, because each neon atom now has more room to move in
  3. It stays the same, because neither the volume nor the amount changes
  4. It falls, because the pressure of the gas goes up as it warms

  Why: the cylinder is rigid and sealed, so the atoms have exactly the room they had before, and there are just as many of them. Nothing about the spread of matter has changed. The spread of energy has: at the higher temperature the atoms' kinetic energies cover a wider range, so the entropy of the neon rises. The pressure does go up, because the atoms hit the walls harder and more often, but a higher pressure at a fixed volume is not a loss of room. Misses:
  - 2: "The cylinder is rigid. Has the volume open to the atoms changed at all?"
  - 3: "Volume and amount are the matter side of entropy. What does warming do to the energies of the atoms (topic 3.5)?"
  - 4: "The pressure rises because the atoms move faster. Ask how warming changes the way the energy is shared among the atoms."
- **Section "A fall in entropy does not forbid a change":**
  - Look back at the iron. Rusting lowers the entropy of the iron and the oxygen, and iron rusts by itself all the same. So a change whose $\Delta S$ is negative can happen. The xylitol showed the other half: a change that takes energy in can happen too.
  - Neither the energy alone nor the entropy alone decides. Rusting releases a great deal of energy, and the xylitol's dissolving raises its entropy. Topic 9.3 puts the two together in one quantity and shows how each is weighed. Until then, an entropy change tells you one thing only: whether the matter and energy of the system end up more spread out or less.
  - Note for the writer: do not say why rusting happens beyond "it releases a great deal of energy", do not mention the surroundings' entropy, and do not use "favored" or "spontaneous".
- **Check 6**, `<Check answer={2}>`: "A student writes: 'If a change lowers the entropy of the system, it cannot happen by itself.' Which observation shows that the claim is wrong?" Options:
  1. A block of camphor left in a closet slowly shrinks until none is left
  2. Ammonia gas and hydrogen chloride gas meet and form a white solid
  3. Camphor vapor in a warm closet does not gather back into a solid block
  4. A heap of rust on a shelf does not turn back into iron and oxygen gas

  Why: to show the claim is wrong you need a change that lowers the system's entropy and happens anyway. Two moles of gas turning into a solid is a fall in entropy, and the white smoke forms the moment the gases meet. The camphor block subliming happens by itself, but it raises the entropy, so it says nothing against the claim. Camphor vapor gathering back into a block would lower the entropy, and it does not happen: that agrees with the claim. Rust turning into iron and oxygen would raise the entropy, and it does not happen either, which shows that a rise in entropy is no guarantee; but it is not a case of entropy falling. Misses:
  - 1: "This change happens by itself, but which way does the entropy of the camphor go when a solid becomes a gas?"
  - 3: "This change would lower the entropy, and it does not happen. Does that argue against the claim, or agree with it?"
  - 4: "Rust turning into iron and oxygen would make a gas from a solid. Is that a fall in entropy? And does it happen?"

  Note for the writer: in the MDX the student's claim sits inside the question in single quotation marks within the sentence, or in double quotation marks if the sentence itself is not quoted (CLAUDE.md: double first). The section above uses rusting as its example; the Check's answer is the white smoke of the first worked example, on purpose.
- **Trap:** **Calling entropy "messiness"** (ask how many ways the particles and their energy can be arranged, not how untidy something looks). **Counting every mole instead of the moles of gas** (4 mol of solid iron becoming 2 mol of solid oxide is not what makes rusting's $\Delta S$ negative; the 3 mol of oxygen gas are). **Looking at how much gas is made instead of the change** (10 mol of gas made from 9 mol is a gain of 1). **Writing $\Delta S = 0$ when the moles of gas are equal** (it is small, not zero, and its sign needs data). **Saying a gas in a rigid container cannot change its entropy** (warming it spreads its energy more widely). **Saying a change with a negative $\Delta S$ cannot happen** (iron rusts; ammonia and hydrogen chloride make smoke).
- **Key points:** entropy, $S$, measures how widely the matter and the energy of a system are spread out, and $\Delta S$ is positive when it rises and negative when it falls; for one substance, entropy rises from solid to liquid and rises far more from liquid to gas, so vaporizing has a larger $\Delta S$ than melting, and a gas that expands at constant temperature gains entropy; for a reaction, count the moles of gas on each side first: more moles of gas among the products means $\Delta S > 0$, fewer means $\Delta S < 0$, and as a rule the larger the change in the moles of gas, the larger $\Delta S$; when the moles of gas in a reaction do not change, $\Delta S$ is small and its sign cannot be predicted without data; warming a sample spreads its particles over a wider range of kinetic energies, so entropy rises with temperature; a change that lowers the entropy of the system can still happen, and topic 9.3 shows how entropy and energy are weighed together. (Six bullets, each standing on its own.)

**Figures**

- **`9-1-three-states.svg`** (viewBox 0 0 480 228, font-size 18). Three boxes of the same size side by side, each 148 by 148 with rounded corners (stroke in the secondary color, no fill), at x = 8, 166 and 324, all with their top at y = 44 (bottom at y = 192). The same 12 particles are in each: circles of radius 8, filled with the accent color, with a thin ink outline. Counts are exact: 12, 12 and 12.
  - Titles above the boxes, centered at x = 82, 240 and 398, baseline y = 30, weight 600: "Solid", "Liquid", "Gas".
  - Solid, a block of 4 by 3 touching particles resting on the floor of the box, centers: (58.0, 182.0) (74.0, 182.0) (90.0, 182.0) (106.0, 182.0) (58.0, 166.0) (74.0, 166.0) (90.0, 166.0) (106.0, 166.0) (58.0, 150.0) (74.0, 150.0) (90.0, 150.0) (106.0, 150.0)
  - Liquid, a pile of touching particles that are not in rows, a little wider than the solid's block, centers: (203.0, 182.0) (219.0, 182.0) (237.0, 182.0) (253.0, 182.0) (271.0, 182.0) (211.0, 168.1) (229.0, 168.1) (245.0, 168.1) (262.0, 168.8) (221.0, 154.3) (238.0, 153.8) (254.0, 154.9)
  - Gas, particles through the whole box, none touching, centers: (346.0, 64.0) (394.0, 58.0) (442.0, 72.0) (364.0, 96.0) (416.0, 92.0) (454.0, 114.0) (342.0, 132.0) (388.0, 128.0) (432.0, 144.0) (358.0, 168.0) (404.0, 172.0) (450.0, 176.0)
  - Under the boxes, centered at the same x, baseline y = 216: "least room", "a little more", "far more room".
  - Text in the figure, six pieces. No arrows and no other marks. The script checks that no two particles overlap, that every liquid particle touches another, that the rectangle around the liquid's pile is 1.2 times the area of the solid's block and the one around the gas 5.6 times, and that every particle is inside its box.
  - Alt: "Three boxes of the same size, each holding the same 12 particles. In the box labeled solid, the particles sit touching in a neat block of three rows of four on the floor of the box, with the words least room. In the box labeled liquid, they still touch but lie in a looser pile that is not in rows, with the words a little more. In the box labeled gas, they are scattered far apart through the whole box, with the words far more room."
  - Caption: "The same 12 particles as a solid, a liquid and a gas. The more room each particle has, the more ways there are to arrange them, and the higher the entropy. A real gas is far more spread out than a drawing can show."
- **`9-1-gas-given-room.svg`** (viewBox 0 0 480 310, font-size 18). Two panels, one above the other. Each shows the same cylinder lying on its side, closed at the left and open at the right, with a piston in it. The cylinder is drawn as three walls in the secondary color (stroke 3, no fill): its closed end at x = 30 and its top and bottom walls running from x = 30 to x = 286, 100 units apart. The piston is a solid ink bar 12 wide that fills the cylinder from wall to wall. A rod, an ink bar 6 tall and 130 long, runs from the middle of the piston's right face out through the open end to a handle, an ink bar 8 wide and 40 tall centered on the rod. Particles are circles of radius 7 in the accent color with a thin ink outline.
  - Upper panel, walls at y = 38 and y = 138. Title "Piston pushed in", centered at x = 240, baseline y = 22, weight 600. The piston's left face is at x = 150 (the piston covers x = 150 to 162), the rod runs from x = 162 to x = 292, and the handle covers x = 292 to 300. The gas has the space from x = 30 to x = 150, 120 units long. It holds 10 particles, centers: (48, 54) (78, 50) (108, 58) (134, 52) (60, 84) (92, 88) (124, 86) (50, 118) (84, 122) (118, 118). The cylinder between the piston and the open end is empty.
  - Lower panel, walls at y = 190 and y = 290. Title "Piston pulled out", centered at x = 240, baseline y = 174, weight 600. The piston's left face is at x = 270 (the piston covers x = 270 to 282), the rod runs from x = 282 to x = 412, and the handle covers x = 412 to 420. The gas has the space from x = 30 to x = 270, 240 units long: twice the length, and so twice the volume. It holds the same 10 particles, spread through all of it, centers: (52, 208) (104, 214) (150, 204) (204, 212) (250, 206) (70, 258) (122, 264) (172, 254) (220, 270) (254, 256).
  - The two panels differ in where the piston stands, not in color. Counts: 10 particles above and 10 below. Text in the figure, two pieces.
  - Alt: "Two drawings of a cylinder closed at its left end, with a sliding piston. In the upper drawing, labeled piston pushed in, 10 gas particles fill the space between the closed end and the piston. In the lower drawing, labeled piston pulled out, the piston stands twice as far from the closed end, and the same 10 particles are spread through twice the volume."
  - Caption: "Pull the piston out and the gas spreads through all the space it is given. The particles and the temperature are the same, but the volume has doubled, so the entropy of the gas is higher."
- **`9-1-energy-spread.svg`** (viewBox 0 0 480 300, font-size 18). A graph of the fraction of particles against kinetic energy for one gas at 300 K and at 600 K: the Maxwell–Boltzmann distribution of kinetic energy, $f(E) = \dfrac{2}{\sqrt{\pi}}\,(RT)^{-3/2}\sqrt{E}\,e^{-E/RT}$ with $R = 8.314 \times 10^{-3}$ kJ/(mol·K), the same for every gas.
  - Axes in ink: a vertical axis at x = 60 from y = 30 to y = 250 and a horizontal axis at y = 250 from x = 60 to x = 466. No tick marks and no numbers. The horizontal axis runs from 0 to 24 kJ/mol (16.67 units for each kJ/mol) and the vertical from 0 to 0.20 per kJ/mol (1,050 units for each 1 per kJ/mol): the scale is for the drawing only and is not printed.
  - Axis titles: "Kinetic energy", centered under the horizontal axis at x = 263, baseline y = 284; "Fraction of particles", turned to read upward beside the vertical axis, centered at (28, 140).
  - The 300 K curve is a solid line in the accent color, 2.5 wide; the 600 K curve is the same color and width, dashed (7 on, 5 off). Each is a smooth path through these points, computed by the script (energy in kJ/mol, the two fractions, then x and the two y values in the drawing's units). Do not sketch either curve; more points from the same formula may be added.

    | E | f at 300 K | f at 600 K | x | y at 300 K | y at 600 K |
    |---|---|---|---|---|---|
    | 0 | 0.0000 | 0.0000 | 60.0 | 250.0 | 250.0 |
    | 0.05 | 0.0628 | 0.0224 | 60.8 | 184.1 | 226.5 |
    | 0.1 | 0.0870 | 0.0314 | 61.7 | 158.6 | 217.0 |
    | 0.25 | 0.1296 | 0.0482 | 64.2 | 114.0 | 199.4 |
    | 0.5 | 0.1658 | 0.0648 | 68.3 | 76.0 | 182.0 |
    | 0.75 | 0.1837 | 0.0755 | 72.5 | 57.2 | 170.8 |
    | 1 | 0.1918 | 0.0829 | 76.7 | 48.6 | 163.0 |
    | 1.25 | 0.1940 | 0.0881 | 80.8 | 46.3 | 157.5 |
    | 1.5 | 0.1923 | 0.0918 | 85.0 | 48.1 | 153.6 |
    | 2 | 0.1817 | 0.0959 | 93.3 | 59.2 | 149.3 |
    | 2.5 | 0.1662 | 0.0970 | 101.7 | 75.5 | 148.1 |
    | 3 | 0.1490 | 0.0961 | 110.0 | 93.5 | 149.1 |
    | 3.5 | 0.1317 | 0.0939 | 118.3 | 111.7 | 151.4 |
    | 4 | 0.1152 | 0.0908 | 126.7 | 129.0 | 154.6 |
    | 5 | 0.0863 | 0.0831 | 143.3 | 159.4 | 162.7 |
    | 6 | 0.0633 | 0.0745 | 160.0 | 183.5 | 171.8 |
    | 7 | 0.0458 | 0.0659 | 176.7 | 201.9 | 180.8 |
    | 8 | 0.0328 | 0.0576 | 193.3 | 215.6 | 189.5 |
    | 9 | 0.0233 | 0.0500 | 210.0 | 225.6 | 197.5 |
    | 10 | 0.0164 | 0.0431 | 226.7 | 232.7 | 204.7 |
    | 12 | 0.0081 | 0.0316 | 260.0 | 241.5 | 216.8 |
    | 14 | 0.0039 | 0.0229 | 293.3 | 245.9 | 226.0 |
    | 16 | 0.0019 | 0.0164 | 326.7 | 248.0 | 232.8 |
    | 18 | 0.0009 | 0.0116 | 360.0 | 249.1 | 237.8 |
    | 20 | 0.0004 | 0.0082 | 393.3 | 249.6 | 241.4 |
    | 22 | 0.0002 | 0.0058 | 426.7 | 249.8 | 243.9 |
    | 24 | 0.0001 | 0.0040 | 460.0 | 249.9 | 245.8 |

  - What the script confirms about the curves: each has an area of 1, so the two areas are equal; the 300 K curve peaks at 1.25 kJ/mol with a height of 0.194 and the 600 K curve at 2.49 kJ/mol with a height of 0.097, exactly half as tall; the widths at half height are 4.5 and 9.0 kJ/mol, exactly twice as wide; the curves cross once to the right of the first peak, at 5.2 kJ/mol; 2.2 percent of the 600 K curve's area lies beyond the right end of the axis, so its line is still a little above the axis there (4 units).
  - Labels, in ink, each beside its curve: "300 K: narrower", starting at x = 150, baseline y = 72; "600 K: wider", starting at x = 262, baseline y = 170. A thin leader line in the secondary color joins each label to its own curve and crosses nothing else: from (148, 68) to the 300 K curve at (112, 97), and from (300, 176) to the 600 K curve at (293, 224). (The script checks that both labels stand clear of both curves.)
  - The two curves differ in dash pattern as well as in their labels. Text in the figure, four pieces.
  - Alt: "A graph of the fraction of particles against kinetic energy for a gas at two temperatures. The solid curve, labeled 300 K: narrower, rises steeply to a tall peak at low energy and falls away quickly. The dashed curve, labeled 600 K: wider, has a peak half as tall, a little farther to the right, and a long tail that stretches about twice as far along the energy axis. The two curves cross once."
  - Caption: "The same gas at 300 K and at 600 K. The areas under the two curves are equal, because the number of particles is the same. At the higher temperature the particles are spread over a wider range of kinetic energies."

**Values**

No value is printed in this lesson except two temperatures of mercury and the temperatures in Check 5. The rest are behind the brief's claims and are for the checkers.

| Quantity | Value | Source and how sure |
|---|---|---|
| Melting and boiling points of mercury | −39 °C (−38.8) and 357 °C (356.7) | handbook values, from memory; sure. Lesson 3.2 already has "melts at −39 °C" |
| Enthalpy of fusion and of vaporization of mercury (not printed) | 2.29 and 59.1 kJ/mol, which give about 10 and 94 J/(mol·K) | from memory; fairly sure; they only confirm "by a wide margin" |
| $S^\circ$ behind worked example 2 (not printed) | N₂O(g) 220.0, N₂(g) 191.6, O₂(g) 205.2, N₂H₄(l) 121.2, H₂O(g) 188.8: $\Delta S^\circ$ = +148.4 and +242.8 J/(mol·K) | the unit's table |
| $S^\circ$ behind worked example 1 (not printed) | NH₃(g) 192.8, HCl(g) 186.9, NH₄Cl(s) 94.6: −285.1; Fe(s) 27.3, Fe₂O₃(s) 87.4: −550.0 | the unit's table |
| $\Delta S^\circ$ of CH₄(g) + Cl₂(g) → CH₃Cl(g) + HCl(g) (not printed; "small and positive") | +12.1 J/(mol·K), from CH₄ 186.3, Cl₂ 223.1, HCl 186.9 (the unit's table) and CH₃Cl(g) 234.6 | CH₃Cl(g) is **new, not in the unit's table**: memory of standard tables, fairly sure **(verify)**; the sign holds for any value above 222.5 |
| $\Delta S^\circ$ behind Check 4 (not printed) | D: +474.5, with NH₄HCO₃(s) 120.9; C: +178.8, with NO(g) 210.8; B: −24.7, with CaO(s) 38.1 **(verify: 39.8 in older tables)**, H₂O(l) 70.0, Ca(OH)₂(s) 83.4; A: positive, about the size of one mole of oxygen's entropy less the difference between the two solids (no value remembered for BaO₂) **(verify)** | from memory; D and C fairly sure; they only confirm that D is the largest by far |
| Camphor | C₁₀H₁₆O; sublimes slowly at room temperature | sure |
| Ammonium hydrogen carbonate breaks down to NH₃, H₂O and CO₂ on warming | above about 36 °C; used as a leavening | sure of the reaction; the name "baking ammonia" **(verify)** |
| Barium peroxide gives BaO and O₂ | on strong heating, about 800 °C (not printed) | fairly sure **(verify)** |
| Ammonia with oxygen over hot platinum gives NO and H₂O | the first step of making nitric acid | sure |
| Methane with chlorine gives CH₃Cl and HCl | in ultraviolet or bright light, or on heating; further chlorination follows | sure |
| $R$ in the figure's formula | 8.314 J/(mol·K) | the equation page |
| Temperatures of the figure and of Check 5 | 300 K and 600 K; 5 °C and 30 °C | chosen |

**Check script:** `scratchpad/unit9/checks/9-1.py`. It checks the balance and the gas count of all ten equations, the sign each count gives, the hidden values above, the coordinates and counts of the three figures (every listed coordinate and every row of the table is compared with this file), the areas, peaks, widths and crossing of the two curves, each message's length and characters, the option lengths, the summary and the answer positions.

**Notes for the writer**

- This lesson has no calculation and prints no entropy value and no unit of entropy. If a sentence seems to need a number, it belongs to topic 9.2.
- Never "spontaneous", never "favored" or "unfavored" (topic 9.3 defines them), never "favorable". "Disorder" appears once, in the sentence the brief gives, and nowhere else. A change "happens by itself" or "does not happen by itself".
- Argue only from room (phase, volume, moles of gas) or from the sharing of energy (temperature). Do not argue from the size or complexity of a molecule, from the number of products, or from how tidy something is.
- "As a rule" stays in the statement that a larger change in the moles of gas means a larger $\Delta S$.
- The cylinder and piston took the place of the design's two bulbs after the originality check (the file name is unchanged). Say nothing about probability, about a gas let into an empty space, about the gas "never going back", or about a second gas mixing in.
- Check 3 comes before the statement of the rule for equal moles of gas. Check 5's work is in the rigid cylinder.
- Rust is "taken as iron(III) oxide". The white smoke is ammonium chloride. Nitrous oxide and hydrazine come back in later lessons with numbers; here they have none and no scene.
- Topics named in plain text: 3.3, 3.5, 5.5, 6.1, 6.6, 9.2, 9.3, 9.6.

**Reactions, substances and scenarios used:** a xylitol mint dissolving (opening and first section; the promise of lesson 6.1); camphor subliming in a closet, C₁₀H₁₆O(s) → C₁₀H₁₆O(g); the white smoke of NH₃(g) + HCl(g) → NH₄Cl(s) from two open bottles; iron rusting, 4Fe(s) + 3O₂(g) → 2Fe₂O₃(s); nitrous oxide breaking down, 2N₂O(g) → 2N₂(g) + O₂(g) (the last three borrowed for their signs alone, as the lesson table says); helium from a cylinder into a party balloon, rain forming in a cloud, a puddle drying, candle wax melting (Check 1); a sealed box of 8 two-atom gas molecules that become 4 four-atom molecules, in words (Check 2); methane with chlorine in bright light, CH₄(g) + Cl₂(g) → CH₃Cl(g) + HCl(g) (Check 3); mercury melting and vaporizing, with −39 °C and 357 °C; liquid hydrazine burning, N₂H₄(l) + O₂(g) → N₂(g) + 2H₂O(g) (worked example 2); 2BaO₂(s) → 2BaO(s) + O₂(g), CaO(s) + H₂O(l) → Ca(OH)₂(s), 4NH₃(g) + 5O₂(g) → 4NO(g) + 6H₂O(g), NH₄HCO₃(s) → NH₃(g) + H₂O(g) + CO₂(g) (Check 4); a rigid steel cylinder of neon carried from 5 °C to 30 °C (Check 5); camphor vapor not re-forming a block, rust not turning back into iron and oxygen (Check 6). Figures: 12 particles as solid, liquid and gas; 10 particles of gas in a cylinder with its piston pushed in, then the same 10 in twice the volume with the piston pulled out; kinetic-energy curves at 300 K and 600 K.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps: the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.1 Introduction to Entropy`).

**Check script:** `scratchpad/unit9/checks/9-1.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.1 Introduction to Entropy`).

### Task 2: Lesson 9.2, Absolute Entropy and Entropy Change

**Files:**
- Create: `src/content/lessons/unit-9/9-2-absolute-entropy-and-entropy-change.mdx`
- Create: `public/figures/9-2-rusting-tally.svg`
- No interactive diagram.

**Brief**

- **Front matter:** `topic: "9.2"`, `minutes: 13`, summary: "Why tables list the entropy itself for every substance, elements included, and how to find the entropy change of a reaction from those values." (No colon in the summary.)
- **Framework (9.2, one statement):** the entropy change of a process is found from standard entropies: the total for the products minus the total for the reactants, each value multiplied by its coefficient in the balanced equation. The objective is to calculate the entropy change of a chemical or physical process from the absolute entropies of the substances in it. **What this lesson does not do:** it decides nothing with $\Delta S^\circ$ (topic 9.3 does; the words "favored" and "unfavored" are not used here); it teaches no pattern among $S^\circ$ values beyond what topic 9.1 gave (solid below liquid below gas; a gas far above the rest); it does not find the entropy of a phase change from its enthalpy; it does not name the third law or any other law; no entropy of the surroundings. **Equation sheet:** the sum is on it, printed without coefficients, as the enthalpy sum of topic 6.8 is. No $S^\circ$ value is on it: a question gives every one it needs. Nothing on the sheet says that $S^\circ$ is in joules.
- **Opening:** topic 9.1 said that when iron rusts the entropy falls, because three moles of oxygen gas end up locked in a solid. How far does it fall? Answering takes numbers, and the numbers for entropy differ from Unit 6's numbers for enthalpy in one way that costs students points every year. (Three sentences. No new scene: the rusting iron is the lesson's thread.)
- **Section "A scale that starts at the bottom":**
  - Start from topic 9.1: cooling a substance leaves its particles fewer ways to share their energy, so its entropy falls. Follow that all the way down. At absolute zero, 0 K, in a perfect crystal, every particle sits in its one place and there is only one way to arrange things. The entropy of that crystal is zero. Not zero by agreement: zero because there is nothing left to spread.
  - That gives entropy a bottom to count up from. The **standard molar entropy** of a substance, $S^\circ$, is the entropy of one mole of it in its standard state (topic 6.8). Tables give it at 25 °C, in joules per mole per kelvin, J/(mol·K). It is also called the **absolute entropy**, because it is an amount of entropy, counted up from that bottom, and not a change. (Two terms, each bold at first use, each defined in its own sentence. After this the lesson says "standard entropy" or $S^\circ$.)
  - Compare the two temperature scales of topic 3.4. Zero on the Celsius scale is a mark that people chose, the freezing point of water, and plenty of things are colder. Zero on the kelvin scale is the bottom, and nothing is colder. The two columns of numbers in this unit differ in the same way. $S^\circ$ is the kelvin kind: its zero is the bottom. Topic 6.8's $\Delta H_f^\circ$ is the Celsius kind: nobody can drain a substance of all its enthalpy to find a bottom, so chemists agreed on a mark, the elements in their standard states, and every $\Delta H_f^\circ$ is a change counted from that mark. A zero in the $\Delta H_f^\circ$ column says "this is the mark". It does not say "nothing here".
  - The table, with one sentence before it: here are both kinds of value, at 25 °C, for the three substances in rusting.

    | Substance | ΔH°f (kJ/mol) | S° (J/(mol·K)) |
    |---|---|---|
    | Fe(s) | 0 | 27.3 |
    | O₂(g) | 0 | 205.2 |
    | Fe₂O₃(s) | −824.2 | 87.4 |

  - Three things to read off it, as a short list:
    1. **Read iron's row across.** It says 0, then 27.3. The 0 is the agreed mark: iron is an element in its standard state. The 27.3 is an amount: at 25 °C the atoms in a piece of iron are vibrating, and that energy is shared among them in a great many ways. Being an element earns no zero in the entropy column. The same goes for oxygen, the other element in the table.
    2. **The unit is joules, not kilojoules.** $S^\circ$ is in J/(mol·K), while $\Delta H_f^\circ$ is in kJ/mol. Topic 9.3 has to bring the two together, and that is where the trouble starts. For now, keep entropies in joules.
    3. **The gas stands far above the solids**, as topic 9.1 said it would: a mole of oxygen has 7.5 times the entropy of a mole of iron.
  - One sentence: 25 °C is 298 K above the bottom of the scale, so no pure substance at 25 °C has an $S^\circ$ of zero or less.
  - `<KeyIdea>`: The standard entropy, $S^\circ$, is the entropy of one mole of a substance in its standard state, counted up from the zero of a perfect crystal at 0 K. Its unit is J/(mol·K). Every pure substance at 25 °C has an $S^\circ$ above zero, and an element is no exception: the zero in an element's row is its $\Delta H_f^\circ$, an agreed mark.
  - Notes for the writer: say "pure substance" in the sentence about positive values and in the key idea, because the $S^\circ$ of a dissolved ion can be negative (topic 9.6 meets one); do not mention ions here. Do not name the third law. Do not say how $S^\circ$ is measured. The comparison with the two temperature scales is this section's one analogy; it leans on topic 3.4's sentence that zero on the Celsius scale is only where water freezes, and it must not be stretched (do not say that entropy "is" a temperature, and do not say that enthalpy "cannot be measured": changes in it are measured all the time). Iron's row is the row the text reads aloud; oxygen is named after it and its value is not quoted in this item. Do not add a second substance in two phases to show the pattern: the table of three rows is all the data in this section. The value −824.2 is printed for the contrast only and is not used in any calculation of this lesson.
- **Section "From the table to a reaction":**
  - The entropy change of a reaction is the entropy of everything it ends with minus the entropy of everything it starts with.
  - `<KeyIdea>` with the formula, laid out exactly as topic 6.8 lays out its sum (two lines in `aligned`):

    $$
    \begin{aligned}
    \Delta S^\circ ={} & \textstyle\sum n\,S^\circ(\text{products}) \\
    & - \textstyle\sum n\,S^\circ(\text{reactants})
    \end{aligned}
    $$

    Here $n$ is each substance's coefficient in the balanced equation.
  - After the key idea: this formula is on the equation sheet, printed without the $n$, just as the enthalpy sum is: the coefficients are yours to put in. The order is the order of topic 6.8, products minus reactants. The answer is for the equation as written, in $\text{J/(mol}_\text{rxn}\text{·K)}$; tables and questions shorten that to J/(mol·K) or J/K, as they shorten $\text{kJ/mol}_\text{rxn}$ (topic 6.6).
  - One difference from topic 6.8: there, an element went in as zero. Here every substance, element or compound, brings a value of its own.
  - **Predict the sign first.** Before any arithmetic, count the moles of gas on each side (topic 9.1) and write down the sign you expect. If the arithmetic then gives the other sign, the arithmetic is what to distrust. (Two or three sentences in the text; the worked examples carry it out.)
- **Worked example "How far does entropy fall when iron rusts?":** find $\Delta S^\circ$ for $\ce{4Fe(s) + 3O2(g) -> 2Fe2O3(s)}$ from the table above.
  1. **Predict the sign.** Gas before: 3 mol of O₂. Gas after: none. Expect a negative $\Delta S^\circ$, and a large one.
  2. **Write a value under every substance.** All in J/(mol·K). Fe(s): 27.3. O₂(g): 205.2. Fe₂O₃(s): 87.4. No zeros: the two elements have entropies like anything else.
  3. **Add up the products, with coefficients.** Display: $2(87.4) = 174.8$ J/K.
  4. **Add up the reactants, with coefficients.** Display: $4(27.3) + 3(205.2) = 109.2 + 615.6 = 724.8$ J/K.
  5. **Products minus reactants.** Display, two lines in `aligned`: $\Delta S^\circ = 174.8 - 724.8 = -550.0\ \text{J/(mol}_\text{rxn}\text{·K)}$.
  6. **Check it against the prediction.** Negative, as expected, and large. Look where the entropy was: 615.6 of the reactants' 724.8 J/K, 85 percent, belonged to the three moles of oxygen gas. The product has no gas at all.

  Substitutions carry numbers only, each term as coefficient(value), with the unit said in words beside the line.
- **Figure** `9-2-rusting-tally.svg`, placed right after the worked example, under one sentence: the figure draws the same tally to scale.
- **Check 1**, `<Check numeric="-120.8" unit="J/(mol·K)">`, after the figure: "Ethene gas takes up hydrogen to become ethane, the reaction of topic 7.5:" $\ce{C2H4(g) + H2(g) -> C2H6(g)}$ "Standard entropies at 25 °C:" then the table

  | Substance | S° (J/(mol·K)) |
  |---|---|
  | C₂H₄(g) | 219.3 |
  | H₂(g) | 130.7 |
  | C₂H₆(g) | 229.2 |

  "Calculate $\Delta S^\circ$ for the reaction, in J/(mol·K), with its sign." Why: predict first: 2 mol of gas become 1 mol, so expect a negative answer. Products: 1(229.2) = 229.2. Reactants: 1(219.3) + 1(130.7) = 350.0. $\Delta S^\circ$ = 229.2 − 350.0 = −120.8 J/(mol·K), negative as predicted. Hydrogen is an element, and its 130.7 goes in like any other value. (Arithmetic in display math, numbers only.) Slips:
  - `120.8` (reactants minus products, or the sign dropped): "The size is right, but check the sign. ΔS° is the products' total minus the reactants' total."
  - `9.9` (hydrogen entered as zero): "Did you enter hydrogen as zero? An element's ΔH°f is zero, but its S° is not. Use 130.7 for H₂."
  - `579.2` (all three values added): "That is all three entropies added together. Subtract the reactants' total from the product's value."

  Note for the writer: the question gives the reaction and nothing of its scene (the bulb of ethene and hydrogen with no ethane in it belongs to topics 7.5 and 9.4). Do not mention a catalyst.
- **Check 2**, `<Check answer={3}>`, directly after Check 1: "A student calculates $\Delta S^\circ$ for the rusting of iron, from the table at the top of this lesson, and reports +174.8 J/(mol·K). What did the student most likely do?" Options:
  1. Left out the coefficients 4, 3 and 2
  2. Subtracted the products from the reactants
  3. Entered S° of both elements as zero
  4. Gave the answer in kJ/(mol·K) by mistake

  Why: 174.8 is the products' total, 2(87.4), with nothing subtracted from it. That happens when the reactants' total comes to zero, and here both reactants are elements: the student gave iron and oxygen the zero that belongs to $\Delta H_f^\circ$. Leaving out the coefficients gives 87.4 − (27.3 + 205.2) = −145.1. Subtracting the wrong way round gives +550.0. Kilojoules would give −0.5500. The prediction would have caught the mistake at once: three moles of gas disappear, so a positive answer cannot be right. Misses:
  - 1: "Try it: 87.4 − (27.3 + 205.2). Does that come to +174.8?"
  - 2: "Reactants minus products gives the right size with the wrong sign. Is 174.8 the size of the right answer?"
  - 4: "Changing joules to kilojoules moves the decimal point three places and cannot change a sign. Where could 174.8 come from?"

  Note for the writer: in the worked example 174.8 is called "the products" and never "the product total with the reactants as zero". The Check asks the student to see that for themselves.
- **Section "An element among the products":** two sentences of lead-in, then the worked example. Elements turn up on the product side too, and a reaction can keep some gas and lose some. The method does not change.
- **Worked example "Sulfur at a volcano's vent":** around the vents of a volcano, hydrogen sulfide and sulfur dioxide in the escaping gases react with each other, and this is one way the crusts of yellow sulfur on the rock are made. Find $\Delta S^\circ$.

  $$
  \begin{aligned}
  &\ce{2H2S(g) + SO2(g) ->} \\
  &\quad \ce{3S(s) + 2H2O(g)}
  \end{aligned}
  $$

  | Substance | S° (J/(mol·K)) |
  |---|---|
  | H₂S(g) | 205.8 |
  | SO₂(g) | 248.2 |
  | S(s) | 32.1 |
  | H₂O(g) | 188.8 |

  1. **Predict the sign.** Gas before: 2 + 1 = 3 mol. Gas after: 2 mol of water vapor. One mole of gas fewer: expect a negative $\Delta S^\circ$, smaller in size than rusting's, where three moles were lost.
  2. **Add up the products.** Display: $3(32.1) + 2(188.8) = 96.3 + 377.6 = 473.9$ J/K. Sulfur is an element, and it goes in at 32.1, not at zero.
  3. **Add up the reactants.** Display: $2(205.8) + 1(248.2) = 411.6 + 248.2 = 659.8$ J/K.
  4. **Products minus reactants.** Display, two lines: $\Delta S^\circ = 473.9 - 659.8 = -185.9\ \text{J/(mol}_\text{rxn}\text{·K)}$.
  5. **Check it.** Negative, as predicted. Notice what a zero for sulfur would have done: 377.6 − 659.8 = −282.2, a wrong answer with the right sign. The sign check catches a reversed subtraction; it cannot catch every slip, so write a value under every substance.

  Notes for the writer: the water is a gas, as the equation says, and its value is the vapor's. Do not print a value for liquid water anywhere in this lesson. The sulfur is the ordinary yellow solid (rhombic sulfur); write S(s). Lesson 4.5 has this reaction in an oil refinery, with liquid sulfur and a stoichiometry question: this lesson's scene is the volcano, with solid sulfur, and it does not mention a refinery.
- **Check 3**, `<Check numeric="242.8" unit="J/(mol·K)">`: "Liquid hydrazine burns in oxygen:" $\ce{N2H4(l) + O2(g) -> N2(g) + 2H2O(g)}$ "Standard entropies at 25 °C:" then the table

  | Substance | S° (J/(mol·K)) |
  |---|---|
  | N₂H₄(l) | 121.2 |
  | O₂(g) | 205.2 |
  | N₂(g) | 191.6 |
  | H₂O(g) | 188.8 |

  "Calculate $\Delta S^\circ$ for the reaction, in J/(mol·K), with its sign." Why: predict first: 1 mol of gas before (the hydrazine is a liquid) and 1 + 2 = 3 mol after, so expect a positive answer. Products: 1(191.6) + 2(188.8) = 569.2. Reactants: 1(121.2) + 1(205.2) = 326.4. $\Delta S^\circ$ = 569.2 − 326.4 = +242.8 J/(mol·K). Oxygen and nitrogen are both elements, and both go in at their table values. Slips:
  - `54.0` (the coefficient 2 of water left out): "Did you leave out the coefficient of water? The equation makes 2 moles of H₂O(g), so its S° counts twice."
  - `256.4` (oxygen and nitrogen entered as zero): "Did you enter O₂ and N₂ as zero? An element's S° is not zero. Use 205.2 and 191.6."
  - `-242.8` (reactants minus products): "That is the reactants' total minus the products' total. ΔS° is products minus reactants."
  - `895.6` (every value added): "That is every entropy added together. Subtract the reactants' total from the products' total."

  Note for the writer: the answer is positive; the page accepts 242.8 and +242.8. No scene for the hydrazine (no rocket, no thruster).
- **Section "When no gas is gained or lost":**
  - Topic 9.1 could not finish one kind of problem: when the moles of gas do not change, it could say only that $\Delta S^\circ$ is small and that its sign needs data. Now you have the data. (Two sentences, then Check 4. Do not give an example with numbers before the Check.)
- **Check 4**, `<Check numeric="-38.5" unit="J/(mol·K)">`: "Aluminum powder reacts with iron(III) oxide. This is the thermite reaction, and here every substance is taken as the solid at 25 °C:" $\ce{2Al(s) + Fe2O3(s) -> Al2O3(s) + 2Fe(s)}$ "Standard entropies at 25 °C:" then the table

  | Substance | S° (J/(mol·K)) |
  |---|---|
  | Al(s) | 28.3 |
  | Fe₂O₃(s) | 87.4 |
  | Al₂O₃(s) | 50.9 |
  | Fe(s) | 27.3 |

  "Calculate $\Delta S^\circ$ for the reaction, in J/(mol·K), to one decimal place, with its sign." Why: no gas on either side, so the gas count predicts only that the change is small. Products: 1(50.9) + 2(27.3) = 105.5. Reactants: 2(28.3) + 1(87.4) = 144.0. $\Delta S^\circ$ = 105.5 − 144.0 = −38.5 J/(mol·K). It is small: less than a tenth of the size of rusting's −550.0, where three moles of gas were lost. Its sign had to come from the table. The three ways of going wrong land close by here (−37.5 without the coefficients, −36.5 with the elements as zero), so a nearly right number is not proof of a right method. Slips:
  - `38.5` (reactants minus products, or the sign dropped): "The size is right, but check the sign. ΔS° is the products' total minus the reactants' total."
  - `-36.5` (aluminum and iron entered as zero): "Did you enter aluminum and iron as zero? An element's S° is not zero. Use 28.3 and 27.3."
  - `-37.5` (the coefficients left out): "Did you leave out the coefficients? The equation has 2 Al and 2 Fe, so each of those entropies counts twice."
  - `249.5` (every value added): "That is every entropy added together. Subtract the reactants' total from the products' total."

  Notes for the writer: the Check keeps the page's 2 percent, which accepts −37.7 to −39.3. The slip −37.5 lies 2.6 percent from the answer and the slip −36.5 lies 5.2 percent from it; the two slips are 2.7 percent apart. Do not narrow or widen the tolerance. No scene for the thermite (topic 9.4 has one): the question is the equation and the table.
- **After Check 4**, one short paragraph: the same subtraction serves for a physical change. For a liquid evaporating, $\Delta S^\circ$ is the $S^\circ$ of the vapor minus the $S^\circ$ of the liquid, with each state looked up as its own entry, the way topic 6.8 keeps two entries for water. (No numbers.)
- **Check 5**, `<Check answer={1}>`: "Without a table, decide which of these reactions has the $\Delta S^\circ$ nearest to zero." The four equations are set as lettered blocks in the question, each with a few words:
  - A, nitrogen and oxygen combining in the hot cylinder of an engine: $\ce{N2(g) + O2(g) -> 2NO(g)}$
  - B, magnesium ribbon burning: $\ce{2Mg(s) + O2(g) -> 2MgO(s)}$
  - C, propane burning in a gas grill: $\ce{C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)}$ (split after the arrow)
  - D, orange ammonium dichromate breaking down once it is lit: $\ce{(NH4)2Cr2O7(s) -> Cr2O3(s) + N2(g) + 4H2O(g)}$ (split after the arrow)

  Options: Equation A; Equation B; Equation C; Equation D.

  Why: count the moles of gas. A: 2 before and 2 after, no change. B: 1 before and none after. C: 1 + 5 = 6 before and 3 + 4 = 7 after. D: none before and 1 + 4 = 5 after. Only A keeps its moles of gas, so its $\Delta S^\circ$ is the small one. Tables agree: +24.8 J/(mol·K) for A, against about −217 for B and about +100 for C, and D, with five moles of gas made from a solid, is far larger still. Misses:
  - 2: "One mole of gas goes into a solid here. Compare the change in the moles of gas in all four equations."
  - 3: "Count the moles of gas: 6 before and 7 after. Compare that change with the change in each of the other equations."
  - 4: "A solid turns into 5 moles of gas here. Is that a small change in entropy or a large one?"

  Note for the writer: all four reactions are real. Give no data and no temperatures in the question. The numbers in the Why are from the values table below; print "+24.8", "about −217" and "about +100" and no value for D.
- **Trap:** **Giving an element a zero in an entropy sum** (an element's zero is its $\Delta H_f^\circ$, an agreed mark; its $S^\circ$ is an amount, 27.3 J/(mol·K) for iron). **Leaving out the coefficients** (the equation sheet prints the sum without them; each $S^\circ$ is multiplied by its coefficient). **Subtracting the wrong way round** (products minus reactants; predict the sign from the moles of gas first and distrust arithmetic that disagrees). **Writing the answer in kilojoules** (entropies are in joules: J/(mol·K); enthalpies of formation are in kJ/mol). **Using the value for the wrong state** (the vapor and the liquid of one substance have different entropies; use the state the equation shows). **Trusting a right sign too far** (a zero for an element among the products can leave the sign right and the number wrong).
- **Key points:** entropy is counted up from zero for a perfect crystal at 0 K, so tables list the standard entropy $S^\circ$ itself, in J/(mol·K), and no pure substance at 25 °C has a value of zero or less; an element in its standard state has $\Delta H_f^\circ = 0$ but its $S^\circ$ is not zero, and it goes into the sum at its table value; $\Delta S^\circ$ of a reaction is the sum of $n\,S^\circ$ for the products minus the sum of $n\,S^\circ$ for the reactants, where $n$ is each coefficient, which the equation sheet leaves out; the answer is in joules per kelvin for the equation as written, J/(mol_rxn·K), not kilojoules; predict the sign from the moles of gas before calculating, and check the answer against it; when no gas is gained or lost $\Delta S^\circ$ is small, and the table gives its sign. (Six bullets, each standing on its own.)

**Figures**

- **`9-2-rusting-tally.svg`** (viewBox 0 0 480 340, font-size 18). Two stacked bars on one baseline at y = 300, drawn **to scale: 1 unit of height for every 3 J/K**.
  - Title, top left, starting at x = 8, baseline y = 26, in the secondary color: "Entropy in J/K".
  - Reactants' bar, x = 160 to 250. From the baseline up: four iron blocks, each 9.1 units tall (27.3 J/K), filled with diagonal hatching in the secondary color with an ink outline, reaching y = 263.6; then three oxygen blocks, each 68.4 units tall (205.2 J/K), filled with the light accent with an ink outline, their edges at y = 195.2 and y = 126.8, the top of the bar at y = 58.4. The bar is 241.6 units tall (724.8 J/K). In each oxygen block, centered: "O₂".
  - Labels to the left of the bar, right-aligned at x = 152: "Fe: 4 × 27.3", baseline y = 288, beside the iron blocks; "O₂: 3 × 205.2", baseline y = 167, beside the middle oxygen block.
  - Above the bar, centered at x = 205, baseline y = 50, weight 600: "724.8". Under the bar, centered at x = 205, baseline y = 324: "4 Fe(s) + 3 O₂(g)".
  - Product's bar, x = 300 to 390. Two iron(III) oxide blocks, each 29.1 units tall (87.4 J/K), filled with the accent color with an ink outline, the edge between them at y = 270.9, the top at y = 241.7. The bar is 58.3 units tall (174.8 J/K). In each block, centered, in the background color: "Fe₂O₃".
  - Label to the right of the bar, starting at x = 396, baseline y = 277: "2 × 87.4". Above the bar, centered at x = 345, baseline y = 234, weight 600: "174.8". Under the bar, centered at x = 345, baseline y = 324: "2 Fe₂O₃(s)".
  - The gap: a dashed line in the secondary color from (250, 58.4) to (284, 58.4), level with the top of the reactants' bar, and another from (266, 241.7) to (300, 241.7), level with the top of the product's bar. Between them, at x = 275, a heavy arrow in ink pointing down from y = 62 to y = 238 (183.3 units for 550.0 J/K). To the right of the arrow, starting at x = 288, baseline y = 150, weight 600: "ΔS° = −550.0".
  - The three kinds of block differ in fill (hatched, pale, solid) and carry their names. Text in the figure, fourteen pieces: the title; "O₂" three times; "Fe₂O₃" twice; "Fe: 4 × 27.3"; "O₂: 3 × 205.2"; "2 × 87.4"; "724.8"; "174.8"; "4 Fe(s) + 3 O₂(g)"; "2 Fe₂O₃(s)"; "ΔS° = −550.0". Subscripts are drawn as in the site's other figures (a smaller, lowered `tspan`).
  - Alt: "A bar chart of entropy for the rusting of iron, drawn to scale. The reactants' bar is a stack of four thin hatched blocks for iron, 4 times 27.3, under three tall blocks for oxygen gas, 3 times 205.2, and it reaches 724.8 joules per kelvin. The product's bar is two blocks for iron(III) oxide, 2 times 87.4, and reaches only 174.8. A heavy arrow falls from the level of the first bar to the level of the second, labeled delta S standard equals minus 550.0."
  - Caption: "Rusting as a tally, drawn to scale. Most of the reactants' entropy is in the three moles of oxygen gas, and the product has no gas, so the total falls by 550.0 J/K for each mole of reaction."

**Values**

All for 25 °C, from memory. "The unit's table" is the table of formation values and entropies in the lesson table.

| Quantity | Value | Source and how sure |
|---|---|---|
| $S^\circ$ of Fe(s); O₂(g); Fe₂O₃(s) | 27.3; 205.2; 87.4 J/(mol·K) | the unit's table; sure (O₂ is 205.1 in some tables) |
| $\Delta H_f^\circ$ of Fe₂O₃(s) (printed once, for the contrast) | −824.2 kJ/mol | the unit's table; sure |
| $S^\circ$ of H₂S(g); SO₂(g); H₂O(g) | 205.8; 248.2; 188.8 | the unit's table; sure |
| $S^\circ$ of S(s, rhombic) | 32.1 **(verify: 31.8 in older tables, which would give −186.8 for the worked example)** | the unit's table; fairly sure |
| $S^\circ$ of C₂H₄(g); H₂(g); C₂H₆(g) | 219.3 **(verify: 219.6 elsewhere)**; 130.7; 229.2 **(verify: 229.6 elsewhere)** | the unit's table; hydrogen sure, the two hydrocarbons fairly sure. With the other pair the answer is −120.7 |
| $S^\circ$ of N₂H₄(l); N₂(g) | 121.2; 191.6 | the unit's table; sure |
| $S^\circ$ of Al(s); Al₂O₃(s) | 28.3; 50.9 | the unit's table; sure |
| $S^\circ$ behind Check 5's explanation | NO(g) 210.8 (sure), giving +24.8; Mg(s) 32.7 and MgO(s) 27.0 (sure), giving −216.6; C₃H₈(g) 270.3 **(verify: 269.9 elsewhere)** and CO₂(g) 213.8, giving +100.3 | from memory; B and C are printed as "about" |
| $\Delta S^\circ$ of each reaction | rusting −550.0; sulfur −185.9; ethene with hydrogen −120.8; hydrazine burning +242.8; thermite −38.5 | computed; the first four are the design's and the lesson table's values |
| Agreement with the unit's table (not printed) | for all five reactions, $\Delta H^\circ - T\Delta S^\circ$ at 298 K is within 0.1 kJ of $\Delta G^\circ$ from formation values (−1,484.4; −90.3; −100.4; −606.5; −840.1 kJ) | the script |
| Hydrogen sulfide and sulfur dioxide deposit sulfur at volcanic vents | 2H₂S + SO₂ → 3S + 2H₂O | fairly sure of the scene **(verify)**; the reaction itself is sure |
| Ammonium dichromate, once lit, gives Cr₂O₃, N₂ and H₂O | as written | sure |
| N₂ and O₂ give NO at the temperature of an engine's cylinder | as written | sure |

**Check script:** `scratchpad/unit9/checks/9-2.py`. It checks the balance and the gas count of all nine equations, every step of both worked examples, each Check's answer and every slip (its value, its distance from the answer and from the other slips), the wrong routes of Check 2, the values behind Check 5, the agreement of the five reactions with the unit's formation values, the figure's heights and levels, each message's length and characters, the option lengths, the summary and the answer positions.

**Notes for the writer**

- Entropies stay in joules throughout. This lesson never converts to kilojoules and never puts an entropy beside an enthalpy in one calculation: that is topic 9.3. The one $\Delta H_f^\circ$ value in the lesson is in the first table, for the contrast.
- Never "favored", "unfavored", "favorable" or "spontaneous" in this lesson, and never "disorder". Do not name the third law.
- Every sum is laid out as topic 6.8's: products with coefficients, reactants with coefficients, then the subtraction, each on its own line, numbers only, split with `aligned` where long.
- "With its sign" is in each typed question. Check 3's answer is positive.
- $\Delta S^\circ$ carries its sign everywhere, the plus included (+242.8, +174.8).
- The unit in running text is J/(mol·K) for $S^\circ$ and $\text{J/(mol}_\text{rxn}\text{·K)}$ for a reaction at first use, shortened to J/(mol·K) after the sentence that says tables shorten it. The `unit` of the three typed Checks is "J/(mol·K)".
- Every question gives every value it needs in its own table. A value is never to be looked up from another question's table, except in Check 2, which says where to look.
- Topics named in plain text: 3.4, 6.6, 6.8, 7.5, 9.1, 9.3.

**Reactions, substances and scenarios used:** iron rusting, 4Fe(s) + 3O₂(g) → 2Fe₂O₃(s), with $S^\circ$ 27.3, 205.2 and 87.4 and the answer −550.0 (opening, first table, worked example 1, figure, Check 2 with the student's +174.8); ethene with hydrogen, C₂H₄(g) + H₂(g) → C₂H₆(g), 219.3, 130.7, 229.2, −120.8 (Check 1); sulfur left at a volcano's vent, 2H₂S(g) + SO₂(g) → 3S(s) + 2H₂O(g), 205.8, 248.2, 32.1, 188.8, −185.9 (worked example 2); liquid hydrazine burning, N₂H₄(l) + O₂(g) → N₂(g) + 2H₂O(g), 121.2, 205.2, 191.6, 188.8, +242.8 (Check 3); the thermite reaction with every substance solid, 2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s), 28.3, 87.4, 50.9, 27.3, −38.5 (Check 4); a liquid evaporating, in words; N₂(g) + O₂(g) → 2NO(g) in an engine, magnesium ribbon burning, propane burning in a grill, ammonium dichromate breaking down (Check 5, no data in the question). Figure: the rusting tally.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps: the data file, build and tests, the sweep and a look at the figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.2 Absolute Entropy and Entropy Change`).

**Check script:** `scratchpad/unit9/checks/9-2.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.2 Absolute Entropy and Entropy Change`).

### Task 3: Lesson 9.3, Gibbs Free Energy and Thermodynamic Favorability

**Files:**
- Create: `src/content/lessons/unit-9/9-3-gibbs-free-energy-and-thermodynamic-favorability.mdx`
- Create: `public/figures/9-3-magnesium-hydride-bars.svg`, `public/figures/9-3-four-cases.svg`
- Places the interactive block `<FreeEnergy />` (built in its own task from "Diagram data" below; the lesson only places it, and no Check depends on it).

**Brief**

- **Front matter:** `topic: "9.3"`, `minutes: 21`, summary: "How the Gibbs free energy change puts enthalpy and entropy into one number, two ways to calculate it, and how its sign depends on the temperature." (No colon in the summary.)
- **Framework (9.3, five statements):** (1) ΔG° is the free energy change of a process in which every reactant and product is in its standard state: pure substances, solutes at 1 M, gases at 1 bar (very nearly 1 atm). (2) Its sign says whether the process is thermodynamically favored: favored when ΔG° < 0. (3) ΔG° of a reaction can be found from standard free energies of formation, products minus reactants. (4) Often enthalpy and entropy both have to be weighed, and ΔG° = ΔH° − TΔS° weighs them. (5) The signs of ΔH° and ΔS° say how the verdict depends on temperature: favored at every temperature, at none, at high temperature or at low temperature. The objective is to explain, from ΔG°, whether a process is thermodynamically favored. **What this lesson does not do:** whether a favored reaction is fast is topic 9.4's (one pointing sentence here); how far it goes, and K, are topic 9.5's (one pointing sentence; the letter K does not appear in this lesson); ΔH° from enthalpies of formation is topic 6.8's and ΔS° from standard entropies is topic 9.2's (both are used, neither is taught again); the entropy of the surroundings appears only in two "Beyond the exam" sentences. Not named by the framework but asked on the exam, and taught here without a label: the temperature at which ΔG° = 0, the conversion of the entropy term to kilojoules as a step of its own, and the approximation that ΔH° and ΔS° are the same at every temperature. **Equation sheet:** both routes are on it (the sum printed without coefficients, as topic 6.8 said of the enthalpy sum). The table of signs is not, and neither is any reminder that ΔS° is in joules while ΔH° is in kilojoules. No value of ΔG°f is on it: a question gives each one.
- **Opening:** magnesium hydride is a light gray powder, a solid that is part hydrogen, and engineers study it as a way to carry hydrogen without a high-pressure tank. Sealed in a dry can at room temperature, it stays magnesium hydride. Heat it enough and the hydrogen comes back out as a gas, leaving magnesium metal behind. Nothing was added. The reaction takes in the same energy hot or cold. This lesson builds the one number that says which way a change is favored, and shows why that number can change its sign when the temperature does. Note for the writer: do not say in the opening how hot "enough" is; worked example 3 finds it. Say nothing about how the powder is made, about water (it reacts with water, which is why the can is dry), or about cars. The formula MgH₂ first appears in worked example 1; do not discuss the charge on hydrogen in it.
- **Section "One number for two tendencies":**
  - Two things work for a change. One is releasing energy: a negative ΔH° (Unit 6). The other is an increase in entropy: a positive ΔS° (topics 9.1 and 9.2). When both point the same way the verdict is easy. Often they disagree. The xylitol of topic 6.1 takes energy in as it dissolves and dissolves anyway. Magnesium hydride giving up its hydrogen takes energy in and gains entropy (a solid gives a gas). Something has to weigh the two.
  - The **Gibbs free energy**, $G$, is a property of a system that combines its enthalpy and its entropy, and what matters is its change. The **standard free energy change**, $\Delta G^\circ$, is the change in free energy when the reactants turn into the products with every substance in its standard state. After this first use the lesson says "free energy".
  - The circle means what it meant in topic 6.8: each substance pure and at 1 bar (very nearly 1 atm). One thing is added here: for a dissolved substance, the standard state is a concentration of 1 M. Tables give values for 25 °C.
  - The rule. A process is **thermodynamically favored** when $\Delta G^\circ < 0$. It is **thermodynamically unfavored** when $\Delta G^\circ > 0$, and then the reverse process is the favored one, because reversing a process reverses the sign of its $\Delta G^\circ$ (as it does for ΔH°, topic 6.9).
  - What "favored" means: starting from everything in its standard state, the change can go forward by itself, with nothing driving it from outside. What it does not mean, in two sentences that point ahead: it does not mean fast (topic 9.4), and it does not mean that the reactants are all used up (topic 9.5).
  - The one sentence on the older word, and the only place it appears: older books call a thermodynamically favored process "spontaneous". The word means the same thing, but it sounds like "sudden", and ΔG° says nothing about speed, so this course and the exam say "thermodynamically favored". Some exam questions write "thermodynamically favorable", which means exactly the same.
  - Units: ΔG° goes with the equation as written, like ΔH°: $\text{kJ/mol}_\text{rxn}$ (topic 6.6). Its sign is part of it, plus sign included.
  - `<KeyIdea>`: $\Delta G^\circ < 0$: thermodynamically favored. $\Delta G^\circ > 0$: thermodynamically unfavored, and the reverse is favored. The sign tells you the direction. It does not tell you the speed.
- **Section "ΔG° from a table":**
  - The first way to get ΔG° is the way topic 6.8 got ΔH°. The **standard free energy of formation**, $\Delta G_f^\circ$, of a compound is the free energy change for forming one mole of it from its elements in their standard states. Tables list it in kJ/mol at 25 °C.
  - An element in its standard state has $\Delta G_f^\circ = 0$, for the reason its $\Delta H_f^\circ$ is zero: forming it from itself changes nothing. It goes into the sum as zero. Contrast in one sentence: this is not true of its $S^\circ$, which is never zero at 25 °C (topic 9.2).
  - `<KeyIdea>`: the sum, laid out as topic 6.8's:

    $$
    \begin{aligned}
    \Delta G^\circ ={} & \textstyle\sum n\,\Delta G_f^\circ(\text{products}) \\
    & - \textstyle\sum n\,\Delta G_f^\circ(\text{reactants})
    \end{aligned}
    $$

    with $n$ each substance's coefficient. One sentence after the box: the equation sheet prints this sum without the $n$, as it does the enthalpy sum, and the coefficients are yours to put in.
  - One limit, stated plainly: tables of $\Delta G_f^\circ$ are for 25 °C, so this route gives ΔG° at 25 °C and at no other temperature.
- **Worked example 1, "Magnesium hydride from the table":** is this reaction thermodynamically favored at 25 °C?

  $$
  \ce{MgH2(s) -> Mg(s) + H2(g)}
  $$

  $\Delta G_f^\circ$ of MgH₂(s) is −35.9 kJ/mol.
  1. **Write a value under every substance.** MgH₂(s): −35.9. Mg(s): 0, an element in its standard state. H₂(g): 0, the same. All in kJ/mol.
  2. **Add up the products, with coefficients.** $1(0) + 1(0) = 0\ \text{kJ}$.
  3. **Add up the reactants, with coefficients.** $1(-35.9) = -35.9\ \text{kJ}$. (The brief's figures: products 0, reactants −35.9.)
  4. **Products minus reactants.** $\Delta G^\circ = 0 - (-35.9) = +35.9\ \text{kJ/mol}_\text{rxn}$, in `aligned` over two lines.
  5. **Read the sign.** Positive: at 25 °C magnesium hydride giving up its hydrogen is thermodynamically unfavored. The reverse, magnesium taking up hydrogen to make the hydride, is the favored direction at this temperature, with ΔG° = −35.9 kJ/mol_rxn.

  Notes for the writer: stop step 5 there. Do not say that a piece of magnesium left in hydrogen turns into the hydride at room temperature: how fast it goes is a question for topic 9.4 (in practice the metal has to be heated under hydrogen at pressure). Every coefficient in this equation is 1; write the 1s in steps 2 and 3 all the same, so that the layout is the one Check 1 needs, where water's coefficient is 2.
- **Check 1**, `<Check numeric="-606.5" unit="kJ/mol">`: "Hydrazine, N₂H₄, is a liquid fuel. It burns in oxygen to give nitrogen and water vapor:

  $$
  \ce{N2H4(l) + O2(g) -> N2(g) + 2H2O(g)}
  $$

  The standard free energies of formation at 25 °C are +149.3 kJ/mol for N₂H₄(l) and −228.6 kJ/mol for H₂O(g). Find ΔG° for the reaction as written, in kJ/mol, with its sign." Why: the two elements, O₂(g) and N₂(g), go in as zero. Products: 1(0) + 2(−228.6) = −457.2 kJ. Reactants: 1(+149.3) + 1(0) = +149.3 kJ. ΔG° = −457.2 − (+149.3) = −606.5 kJ/mol_rxn (display math, two lines). The reaction is strongly favored at 25 °C. Slips:
  - `-377.9` (the coefficient 2 on water left out): "Did you count the water once? The equation makes 2 mol of H₂O(g), so its value goes in twice."
  - `606.5` (reactants minus products, or the sign dropped): "Check the order of the subtraction: products minus reactants. The sign is part of the answer."
  - `-307.9` (hydrazine's value added where it is subtracted): "Did you add hydrazine's +149.3? It is a reactant, so its total is subtracted."
  - `-457.2` (hydrazine entered as zero): "That is the products' total alone. Hydrazine is a compound, not an element, so its value is not zero."

  Note for the writer: call hydrazine "a liquid fuel" and no more. Spacecraft thrusters do not burn it in oxygen gas, so do not bring them in. The same reaction gives lesson 9.2 a ΔS° Check (+242.8 J/(mol_rxn·K)) on purpose; do not print that number here.
- **Section "ΔG° from ΔH° and ΔS°":**
  - The second way shows where free energy comes from. Display:

    $$
    \Delta G^\circ = \Delta H^\circ - T\Delta S^\circ
    $$

    $T$ is the temperature in kelvins. This equation is on the equation sheet.
  - Read it as two terms. $\Delta H^\circ$ is the enthalpy term: negative when the reaction releases energy, and a negative value pulls ΔG° down. $-T\Delta S^\circ$ is the entropy term: when ΔS° is positive this term is negative, and it too pulls ΔG° down. So the equation says what the section above said in words: releasing energy works for a change, and so does gaining entropy. When the two disagree, the larger term wins. (Use "works for" and "works against" for the two terms. Do not write "favorable" or "unfavorable" of a term or of a process.)
  - "Exothermic" is not "favored". A reaction can release energy and still be unfavored, if it loses enough entropy and the temperature is high enough. One can take energy in and still be favored. The sign that decides is the sign of ΔG°.
  - The trap in the units, as its own paragraph. Tables give ΔH° in kilojoules and S° in joules per kelvin, so ΔS° comes out in J/(mol_rxn·K). The two terms cannot be subtracted until they are in the same unit. **Turn ΔS° into kJ/K first, on a line of its own, every time:** divide by 1,000.
  - `<KeyIdea>`: $\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$, with $T$ in kelvins and both terms in kilojoules. Convert ΔS° from J/K to kJ/K before you multiply by $T$.
- **Worked example 2, "The same reaction from ΔH° and ΔS°":** for magnesium hydride giving up its hydrogen, $\ce{MgH2(s) -> Mg(s) + H2(g)}$, topic 6.8's sum gives ΔH° = +75.3 kJ/mol_rxn and topic 9.2's sum gives ΔS° = +132.3 J/(mol_rxn·K). Find ΔG° at 25 °C.
  1. **Put the temperature in kelvins.** 25 °C is 298 K.
  2. **Put ΔS° in kilojoules.** 132.3 J/K ÷ 1,000 = 0.1323 kJ/K.
  3. **Find the entropy term.** $T\Delta S^\circ = (298)(0.1323) = 39.4\ \text{kJ}$.
  4. **Subtract.** $\Delta G^\circ = 75.3 - 39.4 = +35.9\ \text{kJ/mol}_\text{rxn}$.
  5. **Compare the two routes.** The table of free energies of formation gave +35.9, and so does this route. The two do not have to match to the last figure: every table value is rounded to one decimal place, so for other reactions the routes can come out a tenth or two apart. Both say the same thing here: unfavored at 25 °C. The enthalpy term, +75.3, works against the reaction; the entropy term, −39.4, works for it; at 25 °C the enthalpy term is the larger.
  6. **Look at the size.** Skip step 2 and the arithmetic reads 75.3 − (298)(132.3) = −39,350.1, with the wrong sign and so the wrong verdict. No reaction in this course has a ΔG° in the tens of thousands of kilojoules. If yours does, go back to step 2.

  Notes for the writer: where the two inputs come from, for your own check and for the fact-checker, not for the page: ΔH° = 0 − (−75.3) = +75.3 kJ; ΔS° = [32.7 + 130.7] − 31.1 = 163.4 − 31.1 = +132.3 J/K. The lesson reports +35.9 kJ/mol_rxn for both routes (this one is 35.87 before rounding); later sentences and the figure use +35.9.
- **Check 2**, `<Check numeric="-91.2" unit="kJ/mol">`: "Hold the open mouths of a bottle of concentrated ammonia solution and a bottle of concentrated hydrochloric acid near each other, and a white smoke of solid ammonium chloride forms where the two gases meet:

  $$
  \ce{NH3(g) + HCl(g) -> NH4Cl(s)}
  $$

  For this reaction ΔH° = −176.2 kJ/mol and ΔS° = −285.1 J/(mol·K). Find ΔG° at 298 K, in kJ/mol, with its sign." Why: ΔS° in kilojoules is −0.2851 kJ/K. The entropy term: TΔS° = (298)(−0.2851) = −84.96 kJ. Then ΔG° = −176.2 − (−84.96) = −176.2 + 84.96 = −91.2 kJ/mol_rxn (display math, one line for each step). The reaction loses entropy, two gases becoming a solid, so the entropy term works against it, but at 298 K the enthalpy term is twice as large, and the smoke forms. Slips:
  - `84784` (ΔS° left in joules): "Did you leave ΔS° in joules? ΔH° is in kilojoules, so turn ΔS° into kJ/K before you multiply by T."
  - `-261.2` (the double negative lost: 84.96 subtracted): "Check the signs in the entropy term. ΔS° is negative here, so subtracting TΔS° adds a positive amount."
  - `-169.1` (25 used for T): "Did you use 25 for the temperature? T in this equation is in kelvins."
  - `91.2` (the sign reversed or dropped): "The size is right and the sign is not. Follow each minus sign through the subtraction once more."
  - `6951` (25 for T and ΔS° in joules): "Two things to check: T must be in kelvins, and ΔS° must be in kJ/K before it meets ΔH°."

  Note for the writer: the question gives T as 298 K, not as 25 °C, on purpose: Check 3's question is where a Celsius temperature has to be handled. The two bottles are the laboratory's concentrated solutions, which give off NH₃ and HCl gas. Free energies of formation give the same answer exactly: −202.9 − (−16.4 − 95.3) = −91.2 (not printed on the page).
- **Section "Heat it, and only one term moves":**
  - Look at the equation again. $T$ multiplies ΔS° and nothing else. Over the temperatures of a problem, ΔH° and ΔS° themselves change very little, and this course treats them as constant (say this once, here, as an approximation). So when the temperature goes up, the enthalpy term stays where it is and the entropy term grows.
  - For magnesium hydride that is the whole story of the opening. Its entropy term works for the reaction. Cold, that term is too small to beat the +75.3 kJ of the enthalpy term. Hot enough, it is not.
  - The route by formation values cannot follow this: its table is for 25 °C. $\Delta H^\circ - T\Delta S^\circ$ works at any temperature.
  - The temperature at which the verdict changes is the temperature at which $\Delta G^\circ = 0$. Set the equation to zero and solve: $0 = \Delta H^\circ - T\Delta S^\circ$ gives

    $$
    T = \frac{\Delta H^\circ}{\Delta S^\circ}
    $$

    with both in the same energy unit, so that the answer is in kelvins. (Give this temperature no name of its own.)
- **Worked example 3, "How hot for magnesium hydride?":** above what temperature is $\ce{MgH2(s) -> Mg(s) + H2(g)}$ thermodynamically favored? Use ΔH° = +75.3 kJ/mol_rxn and ΔS° = +132.3 J/(mol_rxn·K), and take them as constant.
  1. **Match the units.** ΔS° = 0.1323 kJ/K.
  2. **Set ΔG° to zero and solve for T.** $T = \dfrac{75.3}{0.1323} = 569\ \text{K}$ (569.2 before rounding). That is 296 °C.
  3. **Decide which side is the favored one.** ΔS° is positive, so the entropy term grows more negative as T rises: the reaction is favored above 569 K and unfavored below it.
  4. **Test a temperature on each side.** At 400 K: 75.3 − (400)(0.1323) = +22.4 kJ, unfavored. At 700 K: the entropy term is (700)(0.1323) = 92.6 kJ, and 75.3 − 92.6 = −17.3 kJ, favored.
  5. **Check the unit.** Dividing 75.3 by 132.3, kilojoules by joules, gives 0.569, a temperature a fraction of a degree above absolute zero. An answer like that means the units were not matched.

  Then place the figure `9-3-magnesium-hydride-bars.svg`, with one sentence: at 298 K the bar for ΔH° is the taller one; at 700 K (427 °C) the bar for TΔS° has passed it, and ΔH° has not moved.

  Notes for the writer: magnesium hydride does give up its hydrogen when it is heated, and the temperature usually quoted for hydrogen at 1 bar above it is close to 300 °C **(verify: reports run from about 280 °C to 300 °C)**. Say "the calculation puts the change of sign at 296 °C, and in the laboratory magnesium hydride does release its hydrogen when it is heated to about 300 °C." Do not say the powder starts to change at exactly 569 K: how fast it goes is another question (topic 9.4), and the hydrogen above a real sample is not at exactly 1 bar.
- **Check 3**, `<Check numeric="531" unit="K">`: "Magnesium hydroxide is mixed into the plastic insulation of some electric cables as a flame retardant. When a fire heats it, it breaks down, taking in energy and giving off water vapor:

  $$
  \ce{Mg(OH)2(s) -> MgO(s) + H2O(g)}
  $$

  For this reaction ΔH° = +81.1 kJ/mol and ΔS° = +152.6 J/(mol·K). Taking both as constant, above what temperature, in K, is ΔG° negative?" Why: ΔS° = 0.1526 kJ/K. Setting ΔG° to zero, T = 81.1 ÷ 0.1526 = 531 K (531.5 before rounding; display math). ΔS° is positive, so the entropy term works for the reaction and grows with T: ΔG° is negative above 531 K and positive below it. That is 258 °C: the filler sits unchanged in the cable at ordinary temperatures and takes in energy only in a fire. Slips:
  - `0.531` (kilojoules over joules): "Did you divide kilojoules by joules? Put ΔH° and ΔS° in the same energy unit before you divide."
  - `258` (the answer in °C): "That is the temperature in °C. The question asks for kelvins."
  - `1882` (upside down, and multiplied by 1,000): "That is ΔS° divided by ΔH°. Set ΔG° equal to zero and solve for T again."
  - `1.88` (upside down, units not matched): "That is ΔS° over ΔH°, with joules and kilojoules mixed as well. Set ΔG° to zero and solve for T."
  - `35.6` (ΔG° at 298 K given): "That is ΔG° at 298 K, in kJ. The question asks for the temperature at which ΔG° reaches zero."

  Notes for the writer: magnesium hydroxide is a real flame-retardant filler, and it breaks down in this way. In practice the breakdown is seen from about 300 to 330 °C **(verify)**, hotter than the 258 °C at which ΔG° changes sign; the Why says only what the equation says and does not claim the filler starts to react at 258 °C. Free energies of formation give ΔG° = +35.6 kJ/mol_rxn at 298 K, the same as 81.1 − (298)(0.1526), which is where the last slip comes from.
- **Section "Four combinations of signs":**
  - ΔH° can be negative or positive, and so can ΔS°. That makes four combinations, and the equation settles each one. Do not hand the student a table to memorize first: reason each out from "temperature multiplies only the entropy term", then give the table as a summary.
  - Both terms negative (ΔH° < 0, ΔS° > 0): the reaction releases energy and gains entropy. Nothing works against it. ΔG° is negative at every temperature.
  - Both terms positive (ΔH° > 0, ΔS° < 0): it takes in energy and loses entropy. Nothing works for it. ΔG° is positive at every temperature, and the reverse reaction is the favored one at every temperature.
  - ΔH° > 0 and ΔS° > 0: the enthalpy term works against, the entropy term works for, and heating strengthens the entropy term. Favored at high temperature, above ΔH°/ΔS°. Magnesium hydride is this case.
  - ΔH° < 0 and ΔS° < 0: the enthalpy term works for, the entropy term works against, and heating strengthens the entropy term. Favored at low temperature, below ΔH°/ΔS°. The white smoke of Check 2 is this case.
  - One sentence of care, said once: "at every temperature" is a statement about the equation, with ΔH° and ΔS° taken as constant and each substance in the state the equation gives it.
  - The ratio ΔH°/ΔS° means something only when the two signs match. With unlike signs it comes out negative, and no temperature in kelvins is negative: that is the equation's way of saying that the sign of ΔG° never changes.
  - `<KeyIdea>`: temperature multiplies only the entropy term, so heating strengthens whichever way entropy points. If ΔS° is positive, heating helps the reaction. If ΔS° is negative, heating hurts it.
- **The interactive diagram:** place `<FreeEnergy />` here, under a sentence that says what it is: four real reactions, one for each combination of signs, with a slider for the temperature. The graph shows ΔG° against temperature for all four, the chosen one drawn heavy; the three bars show ΔH°, −TΔS° and their sum, ΔG°. One sentence: the slider moves in steps of 25 K, so its nearest stop to 25 °C is 300 K, and the numbers there differ a little from a table's values for 298 K. Then a numbered list of four things to do, predicting before each move:
  1. **Read the starting state.** Methane with steam, the reaction that makes most of the world's hydrogen, at 300 K: ΔH° = +205.9, −TΔS° = −64.4, ΔG° = +141.5 kJ/mol_rxn. Unfavored. Before you touch the slider, predict which of the three bars will move when you do.
  2. **Heat it.** Slide up. The ΔH° bar stays; the entropy bar grows downward and drags ΔG° with it. At 950 K the entropy bar reads −204.0 and ΔG° is +1.9; one stop on, at 975 K, ΔG° is −3.4. The guide on the graph marks where the line meets zero: 959 K. Hydrogen plants run this reaction in tubes heated to more than 1,000 K **(verify)**.
  3. **Now predict a whole line.** Choose methanol from carbon monoxide, CO(g) + 2H₂(g) → CH₃OH(g). Three moles of gas become one, so ΔS° is negative, and the reaction releases energy. Before you slide: at which end of the slider is it favored? (At 300 K the entropy bar points up, +65.8, and ΔG° is −24.7. Heating makes that bar grow: −2.8 at 400 K, +2.7 at 425 K. The line meets zero at 413 K, and this time the favored side is the cold side.)
  4. **The two that never change their verdict.** Nitrous oxide breaking down has both bars pointing down: −208.6 at 300 K (the entropy bar is −44.5) and −371.9 at 1,400 K. Ozone forming from oxygen has both pointing up: +326.7 at 300 K (the entropy bar is +41.3) and +478.3 at 1,400 K. Look at the four lines together: where a line starts depends mostly on ΔH°, and whether it slopes down or up depends on the sign of ΔS°. A line that slopes down has a positive ΔS°.

  The numbers in parentheses and in the steps are the module's values (see "Diagram data"); the writer phrases them as "you should see". After the list, two sentences: nitrous oxide's ΔH° of −164.1 kJ/mol_rxn is the −164 of topic 6.6 with one more figure. Ozone is unfavored at every temperature and is made all the same, with energy from outside: topic 9.7.
- Then place the figure `9-3-four-cases.svg`, and after it the summary table (four columns):

  | ΔH° | ΔS° | Thermodynamically favored | In the explorer |
  |---|---|---|---|
  | − | + | at every temperature | nitrous oxide breaking down |
  | + | − | at no temperature | ozone forming |
  | + | + | at high temperature, above ΔH°/ΔS° | methane with steam, above 959 K |
  | − | − | at low temperature, below ΔH°/ΔS° | methanol forming, below 413 K |

  One sentence under it: this table is not on the equation sheet, and you do not need it there, because each row can be read off $\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$ in a few seconds.
- **Check 4**, `<Check answer={1}>`: "Hydrazine burning releases energy, and it turns one mole of gas into three:

  $$
  \ce{N2H4(l) + O2(g) -> N2(g) + 2H2O(g)}
  $$

  Take ΔH° and ΔS° as constant. Over which temperatures is the reaction thermodynamically favored?" Options:
  1. At every temperature, because both terms of ΔG° are negative
  2. Only above some temperature, where the entropy term outgrows ΔH°
  3. Only below some temperature, because heating works against it
  4. At no temperature, because both terms of ΔG° are positive

  Why: the reaction releases energy, so ΔH° is negative. One mole of gas becomes three, so ΔS° is positive, and −TΔS° is negative at every temperature. Two negative terms add to a negative ΔG° whatever T is. The second option is the pattern for a reaction that takes energy in and gains entropy; the third is for one that releases energy and loses entropy; the fourth is for one that takes energy in and loses entropy. (The statement holds for as long as the substances are in the states the equation gives them.) Misses:
  - 2: "That is the pattern when ΔH° is positive. This reaction releases energy, so which way does ΔH° point?"
  - 3: "Heating strengthens the entropy term. One mole of gas becomes three: does that term work for the reaction or against it?"
  - 4: "Both terms positive would mean a reaction that takes in energy and loses entropy. Check each sign against the question."

  Note for the writer: the question gives no numbers on purpose. Do not add ΔH° = −534.2 or ΔS° = +242.8 to it.
- **Check 5**, `<Check answer={4}>`: "The white smoke of ammonium chloride forms when ammonia and hydrogen chloride meet at room temperature:

  $$
  \ce{NH3(g) + HCl(g) -> NH4Cl(s)}
  $$

  Pass the same two gases together through a glass tube kept at 700 K, and no smoke forms in the tube. Which explanation fits?" Options:
  1. ΔH° turns positive in a hot tube, so the reaction now takes in energy
  2. Molecules in a hot tube move too fast to react, so the smoke forms too slowly
  3. ΔS° is positive, and heating strengthens whichever way entropy points
  4. The entropy term works against the smoke, and at 700 K it outweighs ΔH°

  Why: two moles of gas become a solid, so ΔS° is negative and the entropy term, −TΔS°, is positive: it works against the reaction, and it grows with the temperature. ΔH° is negative, works for the reaction, and stays where it is. With Check 2's values, TΔS° at 700 K is (700)(−0.2851) = −199.6 kJ, so ΔG° = −176.2 + 199.6 = +23.4 kJ/mol_rxn (display math): unfavored. The sign changes at 176.2 ÷ 0.2851 = 618 K. ΔH° does not change sign: it is taken as constant. Heating makes reactions faster, never too fast to happen. The third option has the sign of ΔS° backward. It would be right for the reverse reaction, a solid turning into two gases, which is why ammonium chloride comes apart into ammonia and hydrogen chloride when it is heated strongly. Misses:
  - 1: "This lesson takes ΔH° as the same at every temperature. Which term of the equation has T in it?"
  - 2: "Heating makes collisions more energetic and reactions faster. This is a question of which direction is favored, not of rate."
  - 3: "Count the moles of gas on each side of the equation as written. What sign does that give ΔS°?"

  Note for the writer: the lesson table suggested "which pair of signs fits?" for this Check. Check 2 prints both values, signs and all, so the question asks for the explanation and not for the signs. Keep it that way. Ammonium chloride really is all ammonia and hydrogen chloride as a vapor at 700 K; solid ammonium chloride turns to vapor at about 338 °C (611 K) at 1 atm, close to the 618 K the equation gives. Do not print 338 °C.
- **Section "Two routes, one answer":**
  - A short closing section. Which route to use: if the question gives free energies of formation and asks about 25 °C, use the sum. If it gives ΔH° and ΔS°, or enthalpies of formation and standard entropies, or asks about any other temperature, use $\Delta H^\circ - T\Delta S^\circ$. At 25 °C the two agree to within the rounding of the tables: for magnesium hydride both gave +35.9, and for other reactions they can differ by a tenth or two.
  - A positive ΔG° does not mean that nothing can be done. The reverse is favored, a different temperature may change the sign, and topic 9.7 shows how an unfavored reaction can be driven.
  - "**Beyond the exam:** the energy a reaction releases spreads out into the surroundings and raises their entropy, by −ΔH°/T. Add the system's own ΔS° to that and you get −ΔG°/T, so a negative ΔG° is another way of saying that the entropy of the system and its surroundings together goes up." (These two sentences are the lesson's only mention of the entropy of the surroundings. Name no law.)
- **Check 6**, `<Check answer={2}>`: "A classmate finds ΔG° at 298 K for

  $$
  \ce{NH3(g) + HCl(g) -> NH4Cl(s)}
  $$

  from ΔH° = −176.2 kJ/mol and ΔS° = −285.1 J/(mol·K). The work has four lines:" then the four lines, each numbered in plain text with its math after it (lines 2 and 3 as display math, split where shown):

  - Line 1: $\Delta S^\circ = -0.2851\ \text{kJ/K}$
  - Line 2: $-T\Delta S^\circ = -(298)(-0.2851)$, then on the next display line $= -84.96\ \text{kJ}$
  - Line 3: $\Delta G^\circ = -176.2 + (-84.96)$, then on the next display line $= -261.2\ \text{kJ/mol}$
  - Line 4: ΔG° is negative, so the white smoke is favored at 298 K.

  "Which is the first line that has a mistake in it?" Options:
  1. Line 1, where ΔS° is put into kJ/K
  2. Line 2, where the entropy term is found
  3. Line 3, where the two terms are combined
  4. Line 4, where the sign of ΔG° is read

  Why: line 1 is right: −285.1 J/K is −0.2851 kJ/K. Line 2 is where it goes wrong. The entropy term is −TΔS°, and ΔS° is negative, so the term is a negative times a negative: −(298)(−0.2851) = +84.96 kJ, not −84.96. You can see that it must be positive without any arithmetic: two moles of gas become a solid, entropy is lost, and a loss of entropy works against a reaction. Line 3 adds the two terms it was given without a slip, and line 4 reads a negative number correctly, so neither is the first mistake. With line 2 put right, ΔG° = −176.2 + 84.96 = −91.2 kJ/mol_rxn. Notice that the classmate's verdict came out right all the same, since −261.2 and −91.2 are both negative. A right verdict does not show that the number behind it is right. Misses:
  - 1: "Line 1 divides −285.1 J/K by 1,000. Work that out and compare it with what the classmate wrote."
  - 3: "Line 3 adds the two terms it was handed, and the sum is done correctly. Look at where those terms came from."
  - 4: "A negative ΔG° does mean favored, so line 4 reads its number correctly. Find the first line where a number goes wrong."

  Note for the writer: this Check stands at the end of the lesson, well away from Check 2, whose Why works the same numbers correctly. Do not move it up. Line 4 is deliberately a true statement: the Check asks for the first wrong line, and the Why's last two sentences are the point of it. Lines 2 and 3 are too long for one line of math on a phone; split each after its first expression, as shown. Do not turn this into the classmate reporting a ΔG° in the tens of thousands: the size check has its one line in worked example 2 and its slip in Check 2, and that is enough.
- **Trap:** **Subtracting joules from kilojoules** (ΔS° comes out of the tables in J/K; turn it into kJ/K on its own line, and go back to that line if a ΔG° comes out in the tens of thousands). **Putting T in °C** (the equation needs kelvins: 25 °C is 298 K). **Losing the double negative** (when ΔS° is negative, −TΔS° is positive and works against the reaction). **Reading "exothermic" as "favored"** (the sign of ΔG° decides, and the entropy term can outweigh ΔH°). **Entering an element's ΔG°f as anything but zero, or leaving out a coefficient** (elements in their standard states go in as zero; every value is multiplied by its coefficient). **Using a table of ΔG°f at another temperature** (those values are for 25 °C; use ΔH° − TΔS° elsewhere). **Dividing ΔH° by ΔS° when their signs differ** (the answer is negative and means nothing: the sign of ΔG° never changes). **Reading "favored" as "fast"** (ΔG° says nothing about speed; topic 9.4).
- **Key points:** (1) the standard free energy change, ΔG°, is the free energy change with every substance in its standard state (pure at 1 bar, solutes at 1 M); a process is thermodynamically favored when ΔG° < 0 and thermodynamically unfavored when ΔG° > 0, in which case its reverse is favored; (2) at 25 °C, ΔG° is the sum of n ΔG°f for the products minus the sum for the reactants, with every element in its standard state entered as zero; (3) at any temperature, ΔG° = ΔH° − TΔS°, with T in kelvins and ΔS° turned from J/K into kJ/K before it is multiplied by T; (4) temperature multiplies only the entropy term, so heating helps a reaction whose ΔS° is positive and hurts one whose ΔS° is negative; (5) a reaction with ΔH° < 0 and ΔS° > 0 is favored at every temperature and one with ΔH° > 0 and ΔS° < 0 at none, when ΔH° and ΔS° are taken as constant; (6) when ΔH° and ΔS° have the same sign, ΔG° changes sign at T = ΔH°/ΔS°: favored above that temperature if both are positive, and below it if both are negative.

**Figures**

- **`9-3-magnesium-hydride-bars.svg`** (viewBox 0 0 480 336, font-size 18). Two panels side by side, centered at x = 120 and x = 360, sharing a baseline at y = 250. The scale is 2 units for each kJ.
  - Each panel: a title at y = 28, centered on the panel: "298 K" on the left, "700 K" on the right. A thin baseline in ink from 85 units left of the panel's center to 85 units right of it, at y = 250.
  - Each panel has two bars, each 60 wide, standing on the baseline. The left bar runs from 70 to 10 units left of the panel's center, the right bar from 10 to 70 units right of it.
  - The left bar is ΔH°: 75.3 kJ, so 150.6 units tall (top at y = 99.4) in both panels. Fill: diagonal hatching in the secondary color, ink outline.
  - The right bar is TΔS°: at 298 K it is 39.4 kJ (39.43 before rounding), 78.9 units tall (top at y = 171.1); at 700 K it is 92.6 kJ (92.61 before rounding), 185.2 units tall (top at y = 64.8). Fill: plain light accent, ink outline. The two kinds of bar differ in fill pattern as well as in color.
  - Above each bar, centered, its value: "75.3" and "39.4" on the left panel, "75.3" and "92.6" on the right. Under each bar, at y = 272: "ΔH°" and "TΔS°".
  - Under each panel, centered, two lines at y = 304 and y = 328: "ΔG° = +35.9 kJ" then "unfavored" on the left; "ΔG° = −17.3 kJ" then "favored" on the right.
  - Text in the figure, fourteen pieces: "298 K", "700 K", "75.3" twice, "39.4", "92.6", "ΔH°" twice, "TΔS°" twice, "ΔG° = +35.9 kJ", "ΔG° = −17.3 kJ", "unfavored", "favored", and nothing else: no axis and no numbers on a scale.
  - Alt: "Two pairs of bars for magnesium hydride giving up its hydrogen. At 298 K a hatched bar labeled ΔH°, 75.3, stands taller than a plain bar labeled TΔS°, 39.4, and the words under them read ΔG° = +35.9 kJ, unfavored. At 700 K the hatched bar is the same height, 75.3, and the plain bar has grown taller than it, to 92.6; the words read ΔG° = −17.3 kJ, favored."
  - Caption: "ΔG° is the first bar minus the second, in kJ for each mole of reaction. Heating leaves ΔH° where it is and makes TΔS° grow. Above 569 K the second bar is the taller one."
  - Note for the writer: the figure's second bar is TΔS°, the amount that is subtracted, so that the two bars can be compared by height. The explorer's second bar is −TΔS°, which is added. Keep both as they are, and let the caption's first sentence carry the difference. The value above the tallest bar (its top is at y = 64.8) sits with its baseline near y = 58, clear of the panel's title at y = 28; render the figure and look.
- **`9-3-four-cases.svg`** (viewBox 0 0 480 640, font-size 18). Four small graphs of ΔG° against temperature in a 2 by 2 grid, one for each combination of signs. Each is a straight line for one of the explorer's reactions, on the same scales: temperature from 200 K to 1,400 K, and ΔG° from −400 to +500 kJ/mol_rxn.
  - Panel origins (x0, y0): top left (14, 8), top right (250, 8), bottom left (14, 326), bottom right (250, 326). Each panel is 216 wide and 306 tall.
  - In each panel: line 1 of the title centered at (x0 + 108, y0 + 22), the signs; line 2 centered at (x0 + 108, y0 + 46), the reaction. The plot runs from x = x0 + 44 (200 K) to x = x0 + 204 (1,400 K), so 160 units for 1,200 K, and from y = y0 + 62 (+500 kJ) to y = y0 + 242 (−400 kJ), so 0.2 unit for each kJ. Zero is at y = y0 + 162.
  - Axes: a thin vertical axis in ink at x = x0 + 44 from y0 + 62 to y0 + 242, and the zero line, drawn firmly (stroke 1.5, ink), from x0 + 44 to x0 + 204 at y = y0 + 162. No other grid.
  - Axis text: "ΔG°" ending at x = x0 + 38, baseline y0 + 78; "0" ending at x = x0 + 38, baseline y0 + 168. Under the plot, baseline y0 + 278: "200" centered at x0 + 44, "T (K)" centered at x0 + 124, "1,400" ending at x0 + 212.
  - The line: a straight stroke (width 3, ink) through the three points in the table below, each computed by the brief's script.
  - The favored stretch: a band 10 units tall directly under the plot, from y = y0 + 246 to y0 + 256, covering the temperatures at which ΔG° is negative, filled with diagonal hatching in the accent color with an ink outline. Where the line crosses zero, a thin dashed guide in the secondary color drops from the crossing point to the end of the band.
  - The verdict, centered at (x0 + 108, y0 + 300).

  | Panel | Line 1 | Line 2 | Verdict |
  |---|---|---|---|
  | top left | ΔH° < 0, ΔS° > 0 | N₂O breaking down | favored at every T |
  | top right | ΔH° > 0, ΔS° < 0 | ozone forming | favored at no T |
  | bottom left | ΔH° > 0, ΔS° > 0 | methane with steam | favored above 959 K |
  | bottom right | ΔH° < 0, ΔS° < 0 | methanol forming | favored below 413 K |

  The points of each line, and its band, in the figure's own coordinates:

  | Reaction | The line passes through | Favored stretch |
  |---|---|---|
  | Nitrous oxide breaking down | 200 K, −193.78 kJ at (58.0, 208.8); 800 K, −282.82 kJ at (138.0, 226.6); 1400 K, −371.86 kJ at (218.0, 244.4) | band from x = 58 to 218 |
  | Ozone forming | 200 K, +312.96 kJ at (294.0, 107.4); 800 K, +395.64 kJ at (374.0, 90.9); 1400 K, +478.32 kJ at (454.0, 74.3) | no band |
  | Methane with steam | 200 K, +162.96 kJ at (58.0, 455.4); 800 K, +34.14 kJ at (138.0, 481.2); 1400 K, −94.68 kJ at (218.0, 506.9) | band from x = 159.2 to 218; the line meets zero at (159.2, 488) |
  | Methanol from carbon monoxide | 200 K, −46.66 kJ at (294.0, 497.3); 800 K, +84.86 kJ at (374.0, 471.0); 1400 K, +216.38 kJ at (454.0, 444.7) | band from x = 294 to 322.4; the line meets zero at (322.4, 488) |

  - Text in the figure: in each panel two title lines, "ΔG°", "0", "200", "T (K)", "1,400" and the verdict, eight pieces, so thirty-two in all. Every piece is 22 characters or fewer.
  - Alt: "Four small graphs of ΔG° against temperature, from 200 K to 1,400 K, each with one straight line and a zero line. Top left, ΔH° below zero and ΔS° above zero, N₂O breaking down: the line lies below zero all the way and slopes down, a hatched band runs under the whole graph, and the label reads favored at every T. Top right, ΔH° above zero and ΔS° below zero, ozone forming: the line lies above zero all the way and slopes up, there is no band, and the label reads favored at no T. Bottom left, both above zero, methane with steam: the line starts above zero, slopes down and crosses zero, a hatched band runs under the right-hand part, and the label reads favored above 959 K. Bottom right, both below zero, methanol forming: the line starts below zero, slopes up and crosses zero, a hatched band runs under the left-hand end, and the label reads favored below 413 K."
  - Caption: "The four combinations of signs, each shown by one of the explorer's reactions. The hatched band marks the temperatures at which ΔG° is negative. All four graphs share one scale, from −400 to +500 kJ for each mole of reaction, and ΔH° and ΔS° are taken as constant."
  - Note for the writer: the band for methanol is short (28 units) and the band for nitrous oxide runs the whole width; that is the point. Do not rescale a panel to make its band easier to see. The verdicts "favored at every T" and "favored at no T" are true of the equation with ΔH° and ΔS° constant, which the caption says.

**Diagram data** (for the builder of `src/lib/free-energy.ts` and `<FreeEnergy />`; the design's section 6.1 fixes what the diagram shows)

- **Reactions** (the choice control, in this order; the diagram starts on the third). ΔH° is kept in whole joules and ΔS° in whole tenths of a joule per kelvin, for one mole of reaction:

  | Id | Name on the control | Equation shown | ΔH° (J) | ΔS° (tenths of J/K) | ΔH° (kJ) and ΔS° (J/K), as the lesson writes them |
  |---|---|---|---|---|---|
  | `nitrous-oxide` | Nitrous oxide breaking down | 2N₂O(g) → 2N₂(g) + O₂(g) | −164,100 | 1,484 | −164.1; +148.4 |
  | `ozone` | Ozone forming | 3O₂(g) → 2O₃(g) | +285,400 | −1,378 | +285.4; −137.8 |
  | `methane-steam` | Methane with steam | CH₄(g) + H₂O(g) → CO(g) + 3H₂(g) | +205,900 | 2,147 | +205.9; +214.7 |
  | `methanol` | Methanol from carbon monoxide | CO(g) + 2H₂(g) → CH₃OH(g) | −90,500 | −2,192 | −90.5; −219.2 |

  Source of each constant: the unit's table of enthalpies of formation and standard entropies at 25 °C (the "Values" table below), products minus reactants with coefficients. The script recomputes all eight from the table. Free energies of formation give ΔG° at 298 K as −208.4, +326.4, +141.9 and −25.1 kJ/mol_rxn, each within 0.1 kJ of ΔH° − (298)ΔS°; the module does not use them.
- **Temperature slider:**

  | Control | Range | Step | Starts at |
  |---|---|---|---|
  | Temperature | 200 K to 1,400 K | 25 K | 300 K |

  49 stops, and 4 × 49 = 196 states. The slider's value text is the temperature with its unit and a thousands comma: "300 K", "1,400 K".
- **The model.** With ΔH° in joules, ΔS° in tenths of a joule per kelvin and T in whole kelvins, the module works in whole tenths of a joule so that the arithmetic is exact:
  - enthalpy term: $10 \times \Delta H^\circ$;
  - entropy term, $-T\Delta S^\circ$: $-T \times (\Delta S^\circ\text{ in tenths})$;
  - $\Delta G^\circ$: their sum.
  - Each of the three is shown to 0.1 kJ, **rounded half up from the exact value, a tie going to the more positive number** (in whole tenths of a joule: add 500, then divide by 1,000 and round down). So −219.75 is shown as −219.7 and +98.55 as +98.6. Every ΔH° is a whole number of tenths of a kilojoule, so with this rule the shown ΔH° plus the shown −TΔS° equals the shown ΔG° in every state, and the readout can never contradict itself. (Rounding ties away from zero would break that sum in one state; the script reports it.) Nine of the 196 states are exact ties: nitrous oxide at 375, 625, 875, 1,125 and 1,375 K, ozone at 250, 750 and 1,250 K, and methane with steam at 500 K. Three are in the table below.
  - Each shown number carries its sign, plus included, a true minus sign, and a thousands comma where it needs one (none does: every shown number is between −400 and +500).
  - The verdict comes from the sign of the exact ΔG°: "thermodynamically favored" when it is negative, "thermodynamically unfavored" when it is positive. It is never zero (see the limits).
  - The temperature at which ΔG° = 0 exists only for the two reactions whose ΔH° and ΔS° have the same sign. It is $10 \times \Delta H^\circ \div (\Delta S^\circ\text{ in tenths})$, shown to the nearest kelvin: 959 K for methane with steam (959.01) and 413 K for methanol (412.86). Neither is a stop of the slider.
- **The graph.** ΔG° against temperature, the horizontal axis from 200 K to 1,400 K and the vertical axis from −400 to +500 kJ/mol_rxn. Each reaction is a straight line between its values at 200 K and 1,400 K (rows eight, ten and fourteen to nineteen of the table of worked states give those ends). The chosen line is heavy; the other three are faint and dashed. A marker sits on the chosen line at the chosen temperature. The zero line is drawn firmly; the half below it is hatched and labeled "favored". For methane with steam and for methanol, a guide at the temperature of zero carries its value, "959 K" or "413 K".
- **The bars.** Three bars rising or falling from a zero line, on the same vertical scale as the graph (−400 to +500): ΔH°, −TΔS° and ΔG°, each labeled with its name and its shown value.
- **Limits, checked over all 196 states:** the lowest ΔG° is −371.9 (nitrous oxide at 1,400 K) and the highest is +478.3 (ozone at 1,400 K); the entropy bar runs from −300.6 (methane with steam at 1,400 K) to +306.9 (methanol at 1,400 K); so every shown number lies inside the axis. No state has ΔG° equal to zero, and none shows a ΔG° or an entropy term of 0.0: the state nearest zero is methane with steam at 950 K, +1.9. In every state the sign of the shown ΔG° is the sign of the exact one. The numbers of favored states for the four reactions, in the order of the control, are 49, 0, 18 and 9: nitrous oxide at every stop, ozone at none, methane with steam from 975 K up, methanol up to 400 K. For methane with steam the sign changes between the stops at 950 K and 975 K, and for methanol between 400 K and 425 K, which agrees with 959 K and 413 K.
- **Readout sentences.** For the starting state: "Methane with steam at 300 K: ΔH° = +205.9 kJ/mol, −TΔS° = −64.4 kJ/mol, so ΔG° = +141.5 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative above 959 K." The first two sentences have the same form in every state, with "favored" or "unfavored". The last sentence depends on the reaction:
  - nitrous oxide: "With these values, ΔG° is negative at every temperature."
  - ozone: "With these values, ΔG° is positive at every temperature."
  - methane with steam: "ΔG° is negative above 959 K."
  - methanol: "ΔG° is negative below 413 K."

  The readout shortens kJ/mol_rxn to kJ/mol, as tables do (topic 6.6). The text description of the graph for screen readers says, for the chosen reaction, where its line starts and ends (its values at 200 K and 1,400 K), whether it crosses zero and where, and the marker's temperature and value.
- **Caption of the diagram:** "ΔH° and ΔS° are taken as the same at every temperature, and each substance is in the state its equation gives. The slider moves in steps of 25 K."
- **Worked states** for unit tests (inputs, then the outputs expected; the three shown numbers in kJ/mol_rxn, then the exact ΔG°):

  | Reaction | T (K) | ΔH° shown | −TΔS° shown | ΔG° shown | ΔG° exact | Verdict |
  |---|---|---|---|---|---|---|
  | Methane with steam | 300 | +205.9 | −64.4 | +141.5 | +141.49 | unfavored |
  | Methane with steam | 950 | +205.9 | −204.0 | +1.9 | +1.935 | unfavored |
  | Methane with steam | 975 | +205.9 | −209.3 | −3.4 | −3.4325 | favored |
  | Methanol from carbon monoxide | 300 | −90.5 | +65.8 | −24.7 | −24.74 | favored |
  | Methanol from carbon monoxide | 400 | −90.5 | +87.7 | −2.8 | −2.82 | favored |
  | Methanol from carbon monoxide | 425 | −90.5 | +93.2 | +2.7 | +2.66 | unfavored |
  | Nitrous oxide breaking down | 300 | −164.1 | −44.5 | −208.6 | −208.62 | favored |
  | Nitrous oxide breaking down | 1,400 | −164.1 | −207.8 | −371.9 | −371.86 | favored |
  | Ozone forming | 300 | +285.4 | +41.3 | +326.7 | +326.74 | unfavored |
  | Ozone forming | 1,400 | +285.4 | +192.9 | +478.3 | +478.32 | unfavored |
  | Nitrous oxide breaking down | 375 | −164.1 | −55.6 | −219.7 | −219.75 | favored |
  | Ozone forming | 250 | +285.4 | +34.5 | +319.9 | +319.85 | unfavored |
  | Methane with steam | 500 | +205.9 | −107.3 | +98.6 | +98.55 | unfavored |
  | Methane with steam | 200 | +205.9 | −42.9 | +163.0 | +162.96 | unfavored |
  | Methane with steam | 1,400 | +205.9 | −300.6 | −94.7 | −94.68 | favored |
  | Methanol from carbon monoxide | 200 | −90.5 | +43.8 | −46.7 | −46.66 | favored |
  | Methanol from carbon monoxide | 1,400 | −90.5 | +306.9 | +216.4 | +216.38 | unfavored |
  | Nitrous oxide breaking down | 200 | −164.1 | −29.7 | −193.8 | −193.78 | favored |
  | Ozone forming | 200 | +285.4 | +27.6 | +313.0 | +312.96 | unfavored |

  The first ten rows are the states the lesson's text walks through, in its order. Rows eleven to thirteen are rounding ties (−219.75, +319.85 and +98.55 exactly). In each the entropy term is a tie as well (−55.65, +34.45 and −107.35), as it is in all nine tie states, because every ΔH° is a whole number of tenths of a kilojoule. The third row is the one state in which the two ties have opposite signs, so it is the state that rounding away from zero would break (−107.4 + 205.9 = +98.5 against a shown +98.6). The last six, with rows eight and ten, are the ends of the four lines.

**Values**

All for 25 °C, all written from memory. ΔH°f and ΔG°f in kJ/mol, S° in J/(mol·K).

| Substance | ΔH°f | S° | ΔG°f | Source, and how sure |
|---|---|---|---|---|
| Mg(s) | 0 | 32.7 | 0 | **new, not in the unit's table**; memory of standard tables (32.68); sure |
| MgH₂(s) | −75.3 | 31.1 | −35.9 | **new, not in the unit's table**; memory of standard tables **(verify all three)**; fairly sure: the three agree with one another (75.3 − (298)(0.1323) = 35.87) |
| O₂(g) | 0 | 205.2 | 0 | the unit's table; sure (205.1 in some tables) |
| N₂(g) | 0 | 191.6 | 0 | the unit's table; sure |
| H₂(g) | 0 | 130.7 | 0 | the unit's table; sure |
| N₂H₄(l) | +50.6 | 121.2 | +149.3 | the unit's table; fairly sure |
| H₂O(g) | −241.8 | 188.8 | −228.6 | the unit's table, and lesson 6.8 for ΔH°f; sure |
| NH₃(g) | −45.9 | 192.8 | −16.4 | the unit's table; sure (−46.1 and 192.5 in older tables) |
| HCl(g) | −92.3 | 186.9 | −95.3 | the unit's table; sure |
| NH₄Cl(s) | −314.4 | 94.6 | −202.9 | the unit's table; sure |
| Mg(OH)₂(s) | −924.5 | 63.2 | −833.5 | the unit's table; fairly sure |
| MgO(s) | −601.6 | 27.0 | −569.3 | the unit's table, and lesson 6.8 for ΔH°f; sure |
| N₂O(g) | +82.05 | 220.0 | +104.2 | the unit's table; fairly sure (newer tables give +81.6 and +103.7; lesson 6.6 has ΔH = −164 for 2 mol, which +82.05 matches) |
| O₃(g) | +142.7 | 238.9 | +163.2 | the unit's table; sure |
| CH₄(g) | −74.6 | 186.3 | −50.5 | the unit's table; sure (older tables −74.8 and −50.7) |
| CO(g) | −110.5 | 197.7 | −137.2 | the unit's table, and lesson 6.8 for ΔH°f; sure |
| CH₃OH(g) | −201.0 | 239.9 | −162.3 | the unit's table; fairly sure |

| Reaction | ΔH° (kJ/mol_rxn) | ΔS° (J/(mol_rxn·K)) | ΔG° at 298 K (kJ/mol_rxn): formation values; ΔH° − TΔS° | Used in |
|---|---|---|---|---|
| MgH₂(s) → Mg(s) + H₂(g) | +75.3 | +132.3 | +35.9; +35.9 (35.87 before rounding) | worked examples 1 to 3, the bars figure |
| N₂H₄(l) + O₂(g) → N₂(g) + 2H₂O(g) | −534.2 | +242.8 | −606.5; −606.6 (only −606.5 is printed) | Checks 1 and 4 |
| NH₃(g) + HCl(g) → NH₄Cl(s) | −176.2 | −285.1 | −91.2; −91.2 | Checks 2, 5 and 6 |
| Mg(OH)₂(s) → MgO(s) + H₂O(g) | +81.1 | +152.6 | +35.6; +35.6 | Check 3 |
| The explorer's four | see "Diagram data" | | −208.4, +326.4, +141.9, −25.1; each within 0.1 of the other route | the explorer, the four-cases figure |

| Other quantity | Value | Source, and how sure |
|---|---|---|
| Temperature at which ΔG° = 0, magnesium hydride | 569 K (296 °C) | computed from the two values above |
| The same, ammonia with hydrogen chloride | 618 K | computed |
| The same, magnesium hydroxide | 531 K (258 °C) | computed |
| The same, methane with steam; methanol | 959 K; 413 K | computed |
| Magnesium hydride releases hydrogen at 1 bar | "heated to about 300 °C" | memory: reports of about 280 °C to 300 °C **(verify)** |
| Magnesium hydride: a light gray powder, studied for storing hydrogen as a solid, kept dry because it reacts with water | | memory; sure of the use and of the reaction with water; the color of the commercial powder (pure crystals are white) **(verify)** |
| Magnesium hydroxide breaks down in practice | about 300 to 330 °C; a note only, not printed | memory **(verify)** |
| Steam reforming of methane in industry | tubes heated to more than 1,000 K; "makes most of the world's hydrogen" | memory: reformer outlets run at about 1,100 K, and most hydrogen is made from natural gas this way **(verify both)** |
| Ammonium chloride turns to vapor | about 338 °C at 1 atm; a note only, not printed | memory; fairly sure |
| 25 °C | 298 K | the unit's convention |

**Check script:** `scratchpad/unit9/checks/9-3.py`. It recomputes every number above from the table of formation values and entropies, balances the eight equations, tests the two routes against each other for all eight reactions, recomputes each slip and tests it against the tolerance and against the other slips, checks each message and option against this file, computes the nineteen worked states by two methods, the limits over all 196 states and every explorer number the text quotes, and the points of both figures.

**Notes for the writer**

- Say "thermodynamically favored" and "thermodynamically unfavored" at first use and "favored" and "unfavored" after it. "Spontaneous" appears in the one sentence the brief gives and nowhere else, not in a Check, an alt text or a caption. "Favorable" appears in that one sentence as the exam's word and nowhere else. Never "favorable" or "unfavorable" of a process or of a term, never "disorder", never "driving force", and give the temperature of ΔG° = 0 no name.
- Every Δ carries its sign, plus included, in text, tables and answers. Options, messages and tables shorten kJ/mol_rxn to kJ/mol and J/(mol_rxn·K) to J/(mol·K); say once, near the first table or Check that does so, that this is the shortening topic 6.6 described.
- The letter K for an equilibrium constant does not appear in this lesson. "K" here is only the kelvin.
- The entropy term is converted on a line of its own in every worked step and every Why. Never write 298(132.3) and divide afterward.
- "At every temperature" and "at no temperature" are true of the equation with ΔH° and ΔS° constant. The brief says so once in the section on the four combinations, once in the caption of the figure and once in the caption of the diagram. Do not add "always" or "never" anywhere else.
- Do not say that real methanol plants work below 413 K: they do not. The lesson says only what the equation says about each gas at 1 bar. Do not add a sentence about methanol plants at all.
- Do not explain why the two routes agree (it would need the entropies of the elements). "The tables are consistent with each other, to their last figure" is as far as the lesson goes.
- The "Beyond the exam" sentences are the only place where the surroundings' entropy appears. Do not write ΔS with a subscript for the universe, and name no law of thermodynamics.
- After the originality check, magnesium hydride took the place of silver oxide in the opening, the three worked examples and the bars figure, because silver oxide's decomposition is a question of the Unit 7 comprehensive test. Silver oxide is not mentioned in this lesson. The explorer and its "Diagram data" are unchanged. Heated ammonium chloride is in lesson 7.3 as an equation only.
- Magnesium appears twice in this lesson, as the hydride of the worked examples and as the hydroxide of Check 3. They are different compounds with different numbers (569 K and 531 K); do not link them in the text.

**Reactions, substances and scenarios used:** magnesium hydride, a light gray powder studied for storing hydrogen, unchanged in a dry sealed can and giving hydrogen and magnesium metal when heated, MgH₂(s) → Mg(s) + H₂(g), ΔG° +35.9 from its formation value and +35.9 from +75.3 kJ and +132.3 J/K at 298 K, zero at 569 K, +22.4 at 400 K and −17.3 at 700 K (opening, worked examples 1 to 3, the bars figure); the xylitol of topic 6.1, named in one clause; hydrazine, a liquid fuel, burning in oxygen, N₂H₄(l) + O₂(g) → N₂(g) + 2H₂O(g), ΔG° −606.5 from +149.3 and −228.6 (Check 1), and the same reaction with its signs only (Check 4); the white smoke where the fumes of ammonia solution and hydrochloric acid meet, NH₃(g) + HCl(g) → NH₄Cl(s), −176.2 kJ and −285.1 J/K, −91.2 at 298 K (Check 2), the same gases in a glass tube at 700 K with no smoke, +23.4 (Check 5), and a classmate's four lines of work for it at 298 K, with the sign of the entropy term lost in the second line, −261.2 in place of −91.2 (Check 6); magnesium hydroxide as a flame retardant in cable insulation, Mg(OH)₂(s) → MgO(s) + H₂O(g), +81.1 kJ and +152.6 J/K, 531 K (Check 3); the explorer's four reactions, 200 K to 1,400 K: nitrous oxide breaking down, ozone forming from oxygen, methane with steam ("the reaction that makes most of the world's hydrogen", in tubes above 1,000 K) and methanol from carbon monoxide and hydrogen. Figures: the four-cases figure the design lists, and the bars figure with magnesium hydride at 298 K and 700 K in place of the design's silver oxide.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.3 Gibbs Free Energy and Thermodynamic Favorability`).

**Check script:** `scratchpad/unit9/checks/9-3.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.3 Gibbs Free Energy and Thermodynamic Favorability`).

### Task 4: Lesson 9.4, Thermodynamic and Kinetic Control

**Files:**
- Create: `src/content/lessons/unit-9/9-4-thermodynamic-and-kinetic-control.mdx`
- Create: `public/figures/9-4-two-questions.svg`

**Brief**

- **Front matter:** `topic: "9.4"`, `minutes: 13`, summary: "Why a thermodynamically favored reaction can be too slow to see, how to tell a slow mixture from one at equilibrium, and what a catalyst and heating change." (No colon in the summary.)
- **Framework (9.4, two statements):** (1) many thermodynamically favored processes do not go to any measurable extent, or go only very slowly. (2) Such a process is under kinetic control, and a high activation energy is a common reason; that nothing is seen to happen does not mean the system is at equilibrium, and when a process is known to be favored and is not observed, kinetic control is the conclusion to draw. The objective is to explain, through kinetics, why a favored reaction may not occur at a measurable rate. **What this lesson does not do:** no calculation of a rate, a rate constant or an activation energy (Unit 5 has the ideas, and the exam does not calculate with the Arrhenius equation); no value of K is found from ΔG° (topic 9.5), though K itself is used as Unit 7 left it; whether a reaction is favored, and at which temperatures, is topic 9.3's and is used, not taught again. **Equation sheet:** nothing new, and nothing on it helps here: this topic is answered in sentences.
- **Opening:** a hospital's nitrous oxide comes in steel cylinders, and a cylinder can stand in a storeroom for years. Topic 9.3's explorer said that nitrous oxide breaking down into nitrogen and oxygen is thermodynamically favored at every temperature. Yet what comes out of an old cylinder is still nitrous oxide. Nothing is wrong with the thermodynamics. It answers one question, and the cylinder is asking another. Note for the writer: the cylinder holds nitrous oxide under pressure, much of it as a liquid. Say "nitrous oxide in its cylinder", never "the gas at 1 atm in the cylinder", and do not describe the cylinder's contents as being in a standard state.
- **Section "Two questions, two answers":**
  - Ask two things about any change. Which direction is favored? And how fast does it go? Topic 9.3 answered the first with ΔG°, and ΔG° is worked out from tables of the reactants and the products alone: only the two ends of the reaction go into it. Nothing about the route between them does.
  - The second question is about the route. Topic 5.5 called the height of the climb the **activation energy**, $E_a$: the minimum energy a collision needs for the bonds to start rearranging. At a given temperature, the higher it is, the smaller the share of collisions that have enough energy, and the slower the reaction (topic 5.6).
  - Place the figure `9-4-two-questions.svg` here. One sentence: the drop from one end to the other belongs to thermodynamics, and the height of the hill belongs to kinetics, and you cannot read either one from the other.
  - So four kinds of reaction are possible: favored and fast, favored and slow, unfavored and (in the reverse direction) fast or slow. The second kind is the subject of this lesson, and it has a name. A thermodynamically favored process that does not go at a measurable rate, or goes only very slowly, is under **kinetic control**: what you observe is decided by its rate, not by its ΔG°.
  - The size of ΔG° does not help. A very negative ΔG° does not mean a fast reaction, and a small one does not mean a slow reaction.
  - `<KeyIdea>`: On an energy profile, thermodynamics reads the two ends and kinetics reads the hill between them. The ends give the favored direction, through ΔG°. The hill gives the rate, through the activation energy. Neither reading can be worked out from the other. A change that the two ends favor and a high hill holds back is under kinetic control.
- **Worked example 1, "The cylinder that keeps":** for nitrous oxide breaking down,

  $$
  \ce{2N2O(g) -> 2N2(g) + O2(g)}
  $$

  ΔG° is about −208 kJ/mol_rxn at 25 °C, and with no catalyst the activation energy is about 250 kJ/mol. Explain why nitrous oxide keeps for years in its cylinder.
  1. **The thermodynamics.** ΔG° is negative, so the breakdown is thermodynamically favored. (Topic 9.3: taking ΔH° and ΔS° as constant, it is favored at every temperature, because it releases energy and gains entropy.) The favored contents of the cylinder are nitrogen and oxygen. The cylinder is far from that.
  2. **The kinetics.** For the reaction to start, a collision has to supply about 250 kJ/mol, enough to begin pulling an oxygen atom off a nitrogen atom. Compare that with the energies of collisions at room temperature. A yardstick for them is $RT$, the same $RT$ that sits in the Arrhenius equation of topic 5.6: (8.314)(298) = 2,478 J/mol, or 2.48 kJ/mol. The activation energy is about 101 times that, a hundred times the yardstick.
  3. **What that does to the rate.** With a hill that high, the share of collisions with enough energy is of the order of one in 10⁴⁴. Each molecule collides billions of times a second (topic 5.5), and still, for practical purposes, none of the collisions succeeds. The rate is far too small to measure.
  4. **Both halves, in order.** The breakdown is thermodynamically favored (ΔG° < 0), but it is under kinetic control: its activation energy is so high that at 25 °C almost no collisions have enough energy, so it does not go at a measurable rate.

  Notes for the writer: the exam's full answer has both halves, and step 4 is the model sentence; keep it whole. The −208 is topic 9.3's reaction at 25 °C (−208.4 from free energies of formation; the explorer's stop at 300 K shows −208.6). The activation energy is from memory, "about 250 kJ/mol" **(verify)**; with 240 or 260 the share would be about one in 10⁴² or one in 10⁴⁶, so say "of the order of one in 10⁴⁴" and no more exactly than that. The lesson does not ask the student to compute this share and shows no exponential: it states the figure. Do not write an Arrhenius calculation.
- **Check 1**, `<Check answer={3}>`: "Thermite is a mixture of aluminum powder and iron(III) oxide powder. For its reaction,

  $$
  \ce{2Al(s) + Fe2O3(s) -> Al2O3(s) + 2Fe(s)}
  $$

  ΔG° = −840 kJ/mol at 25 °C. A jar of the mixture has stood on a shelf for years with no change. Which further fact do you need in order to explain why it has not reacted?" Options:
  1. The exact value of ΔG°, because a more negative ΔG° means a faster reaction
  2. The value of ΔH°, because a reaction that releases energy needs none to begin
  3. The activation energy, because the change needs that much energy to start
  4. Nothing more, because years with no change show the mixture is at equilibrium

  Why: ΔG° of −840 kJ/mol_rxn says that aluminum oxide and iron are favored, and by a great deal. It says nothing about the rate, however many figures it is given to. ΔH° compares the same two ends and says nothing about the rate either. What sets the rate is the activation energy: before any atoms can rearrange, bonds in the solids have to begin to break, and at room temperature almost none of the particles has the energy for that. The mixture is under kinetic control. It is not at equilibrium: a mixture that had gone as far as it could would be aluminum oxide and iron. (Lit with a strip of burning magnesium, thermite does react, and the energy it then releases keeps it going.) Misses:
  - 1: "ΔG° compares the two ends of the reaction. Does anything in it describe the path between them?"
  - 2: "ΔH° also compares only the two ends. Does the energy a reaction releases overall say anything about how it begins?"
  - 4: "No change can mean two things. With ΔG° this negative, what would the jar hold if the reaction had gone as far as it can?"

  Notes for the writer: the Check gives −840 (the unit's value is −840.1); do not print ΔH° (−851.5). Thermite's reactants and products are all solids at 25 °C, so write no K for it anywhere, and speak of "particles" and "atoms", not of "collisions between molecules", in its Why. The burning magnesium strip is the usual way to light thermite; keep it to that one sentence.
- **Check 2**, `<Check answer={1}>`: "Tin has two solid forms. Ordinary white tin is the metal you know. Gray tin is a crumbly gray powder. Above 13 °C white tin is the favored form, and below 13 °C ΔG° for the change from white tin to gray tin is negative. Bars of pure white tin have been kept all winter in an unheated storeroom at about 5 °C and have come out as sound as they went in. Which explanation fits?" Options:
  1. Gray tin is favored at 5 °C, but the change has a high activation energy
  2. At 5 °C the two forms are at equilibrium, so neither one turns into the other
  3. ΔG° must really be positive at 5 °C, or the bars would have crumbled by now
  4. The change must be endothermic, and a cold storeroom has too little energy to give

  Why: the question gives the thermodynamics: below 13 °C, ΔG° for white tin turning into gray tin is negative, so at 5 °C gray tin is the favored form. The bars have not changed because the change is slow. To become gray tin, every atom in the solid has to take up a new position among its neighbors, and at 5 °C very few atoms have the energy to begin. That is kinetic control. The two forms are in balance, with no tendency either way, at 13 °C and at no other temperature, so the second option is wrong at 5 °C. An unchanged bar is no evidence about the sign of ΔG°: slow and unfavored look alike until you know ΔG°. And whether the change takes energy in or gives it out is already counted inside ΔG° (this one in fact gives energy out). Misses:
  - 2: "The two forms can sit in balance at one temperature only. What does the question say about ΔG° at 5 °C?"
  - 3: "The question gives the sign of ΔG° at 5 °C as negative. A bar that has not changed does not overturn it."
  - 4: "The energy a change takes in or gives out is already counted in ΔG°. What sign does the question give ΔG° at 5 °C?"

  Notes for the writer: give no ΔH°, ΔS° or ΔG° value for tin (tables put the change of sign anywhere from 282 K to 297 K, and the measured temperature is 13 °C). Given long enough in deep cold, tin does turn to gray powder; one sentence after the Why may say so ("in a much colder place, over years, it does crumble"), and no story about organ pipes, buttons or armies. "Pure" matters: the small amounts of other metals in ordinary tin alloys slow the change further, which the lesson does not go into.
- **Section "Not changing is not the same as at equilibrium":**
  - A mixture whose composition is not changing may be at equilibrium. Or it may be far from equilibrium and getting there too slowly to notice. From the outside the two look the same.
  - One sentence back to Unit 7, and no more than one: topic 7.5 met such a mixture before it had a name, a bulb of ethene and hydrogen that had made no ethane after a year, and the name is kinetic control.
  - How can the two be told apart? One sentence leads into the Check: the next question gives you one piece of evidence and asks what it proves. (Do not describe either test in this section before Check 3. The comparison of Q with K comes after the Check, and worked example 2 then uses the catalyst test again.)
- **Check 3**, `<Check answer={3}>`: "A faulty furnace has left carbon monoxide in the air of a closed boiler room. Hours later a meter still reads the same level of it. The escape masks that miners carry hold hopcalite, a catalyst. When air from the room is drawn through hopcalite at room temperature, it comes out with carbon dioxide in place of the carbon monoxide. What does that show about the air in the room?" Options:
  1. It was at equilibrium, and the catalyst moved the equilibrium toward carbon dioxide
  2. The change was unfavored there, and the catalyst made it favored
  3. It was far from equilibrium, and only a slow reaction kept it there
  4. It was at equilibrium, and the hopcalite was used up changing the gas

  Why: a catalyst gives a reaction a quicker route and is still there at the end (topic 5.11). It quickens the forward and the reverse reaction alike, so a mixture in which the two already balance stays as it is: a catalyst cannot move a mixture that is at equilibrium. The hopcalite did change the air, so the air was not at equilibrium. Carbon monoxide and oxygen turning into carbon dioxide was the favored direction all along, and the only thing holding it back was its rate. That is kinetic control. The catalyst did not make the change favored: it is not a reactant or a product, and which direction is favored depends on those alone. And the hopcalite was not used up. It takes part in one step and is made again in a later one (topic 5.11), so the extra oxygen atom in each molecule of carbon dioxide came, in the end, from the oxygen of the air. Misses:
  - 1: "A catalyst speeds up the forward and the reverse reaction alike. Could it change a mixture in which the two already balance?"
  - 2: "Hopcalite is not a reactant or a product. Can something outside the equation change which direction is favored?"
  - 4: "A catalyst is still there, unchanged, at the end (topic 5.11). Which gas in the air supplied the extra oxygen atoms?"

  Notes for the writer: carbon monoxide does stay in still air; it has no reaction with oxygen at room temperature that can be measured in hours or days. Hopcalite is a mixture of manganese and copper oxides that catalyzes this reaction at room temperature when it is dry, and it is the working part of the filter in a miner's escape mask **(verify)**. Give its composition in half a sentence of the Why at most. Do not print ΔG° for this reaction: topic 9.5 asks for it in a Check. Do not use the words "poison" or "poisoning" for the gas more than once; the scene is the meter and the mask.
- **After Check 3, "The other test":** a second way to tell needs no catalyst, only K. Compare the mixture with what K demands (topics 7.3 and 7.10). For

  $$
  \ce{2CO(g) + O2(g) <=> 2CO2(g)}
  $$

  topic 7.5 gave $K_p$ of about 10⁹⁰ at 25 °C. Suppose the room's air has carbon monoxide at 0.00010 atm, enough to set off an alarm, with oxygen at 0.21 atm and carbon dioxide at 0.00040 atm. Then (display, as one fraction)

  $$
  Q = \frac{(0.00040)^2}{(0.00010)^2(0.21)} = 76
  $$

  Q is 76 and K is about 10⁹⁰. Q is nowhere near K, so the air is nowhere near equilibrium, and the reaction that would close the gap runs forward, toward carbon dioxide (topic 7.10). The meter's steady reading says only that it runs too slowly to see. Note for the writer: 76 is 76.2 before rounding. The three pressures are chosen: 0.00010 atm of carbon monoxide is 100 parts per million, a level at which household alarms sound within hours **(verify)**; 0.00040 atm is about the carbon dioxide of outdoor air; 0.21 atm is the oxygen of air. Do not call 0.00010 atm "safe" or "deadly"; say only that it is enough to set off an alarm.
- **Worked example 2, "The tank that waits fifteen years":** a communications satellite steers with small thrusters that run on liquid hydrazine, N₂H₄. The hydrazine sits in its tank for the whole life of the satellite, fifteen years or more. When a thruster fires, a valve lets a little hydrazine onto a bed of catalyst, grains coated with the metal iridium, and with no oxygen and no spark it turns at once into hot gas that pushes the satellite. Overall,

  $$
  \ce{N2H4(l) -> N2(g) + 2H2(g)}
  $$

  ΔG° = −149.3 kJ/mol_rxn at 25 °C (in a real thruster part of the hydrazine ends up as ammonia instead, by a route that is favored too). Is the hydrazine in the tank at equilibrium? What did the iridium change, and what did it leave alone?
  1. **What ΔG° says.** Negative: the breakdown to nitrogen and hydrogen is thermodynamically favored. A tank that still holds liquid hydrazine is far from where the favored direction leads.
  2. **Two ways to read "nothing is happening".** Either the hydrazine is at equilibrium with its products, or it is far from equilibrium and slow.
  3. **The test.** It is the one Check 3 used, and the thruster runs it every time it fires: bring in a catalyst. On the iridium the hydrazine breaks down in a fraction of a second. A system at equilibrium would not have answered, because a catalyst leaves a balanced mixture as it is. So the hydrazine in the tank was not at equilibrium. It was under kinetic control.
  4. **What the iridium changed.** The route. On the metal's surface the bonds of a hydrazine molecule come apart in steps, and the highest point on that route is lower than on the route with no catalyst (topic 5.11). At the same temperature a far larger share of the molecules has enough energy to react.
  5. **What it did not change.** ΔG° is −149.3 kJ/mol_rxn with the iridium or without it, because iridium is not in the equation. The products are the same, and each mole that reacts releases the same energy. The iridium changed how long the reaction takes. It changed nothing about where the reaction ends.
  6. **The answer in one sentence.** The breakdown of hydrazine is thermodynamically favored, but without a catalyst its activation energy is high enough that at the temperature of the tank it goes far too slowly to matter, even in fifteen years.

  Notes for the writer: the value −149.3 is topic 9.3's ΔG°f of N₂H₄(l), +149.3 kJ/mol, with its sign changed, since both products are elements; the lesson need not say so. Hydrazine in a clean tank does break down, immeasurably slowly for practical purposes: say "far too slowly to matter", not "not at all". The real exhaust is a mixture of ammonia, nitrogen and hydrogen: the hydrazine first gives ammonia and nitrogen (3N₂H₄ → 4NH₃ + N₂, ΔG° = −513.5 kJ for the three moles), and part of the ammonia then breaks down further. The clause in parentheses covers this; do not write the ammonia equation or its number on the page. The catalyst is iridium on grains of aluminum oxide **(verify)**; say "grains coated with the metal iridium". Topic 9.3's Check burned hydrazine in oxygen. This is a different reaction of the same liquid, with no oxygen in it: say "breaks down", never "burns", here. Do not give the activation energy of this reaction, the temperature of the gas or any K. Call hydrazine a liquid or a propellant here, not a fuel: nothing burns.
- **Section "The hill and the two ends":**
  - Go back to the figure. It has three things on it: the level of the reactants, the level of the products, and the hill between them. The two levels belong to the substances at the two ends, and ΔG°, ΔH° and K depend on those substances alone. The rate depends on the hill, and on how much energy the collisions have.
  - **A catalyst** redraws the hill. It gives the reaction another route whose highest point is lower (topic 5.11). The substances at the two ends are what they were. So the rate changes, and ΔG°, ΔH° and K do not.
  - Now read the figure from right to left. That is the reverse reaction. The catalyst has lowered its hill too, by the same amount, and speeds it up as well. But the two ends have not moved, so whichever direction was unfavored before is unfavored still. (Do not give an example here: Check 4 is the example.)
  - **Heating** leaves the drawing as it is. The hill is as high as before. What changes is the collisions: at a higher temperature a larger share of them has at least the activation energy (topic 5.5), so more of them get over the same hill. That is why heating speeds up nearly every reaction.
  - Heating also does something a catalyst never does: it changes K (topic 7.9) and ΔG° (topic 9.3). Whether that change helps depends on the reaction: for an exothermic reaction K gets smaller as the temperature rises.
  - So a catalyzed reaction is faster, with the same ΔG° and the same K as before. A hot reaction is faster, and its K may be larger or smaller than before.
  - `<KeyIdea>`: if a process is known to be thermodynamically favored and you do not see it happen, conclude that it is under kinetic control, not that it is at equilibrium. A lower hill (a catalyst) or more energetic collisions (heating) can set it going. What makes it favored was there all along, in the two ends.
- **Check 4**, `<Check answer={2}>`: "One plan for making oxygen on Mars starts from the carbon dioxide of its air:

  $$
  \ce{2CO2(g) -> 2CO(g) + O2(g)}
  $$

  Topic 7.5 gave $K_p$ of about 10⁻⁹⁰ for this reaction at 25 °C. A student suggests passing carbon dioxide through hopcalite at 25 °C, because hopcalite is a catalyst for the reaction among these three gases. What would come out of the hopcalite?" Options:
  1. Mostly carbon monoxide and oxygen, since the catalyst can run the reaction either way
  2. Carbon dioxide, as good as unchanged, since K is still about 10⁻⁹⁰
  3. Carbon monoxide and oxygen, slowly, since a catalyst cannot speed up a reverse reaction
  4. It cannot be said until the activation energy on hopcalite is known

  Why: this is the reaction of Check 3 written backward, and hopcalite does speed it up, by the same factor as the forward one. But speed is not what holds carbon dioxide together. K of 10⁻⁹⁰ says that a mixture at equilibrium at 25 °C is carbon dioxide with no carbon monoxide to speak of, and the catalyst leaves K exactly as it was, because the substances at the two ends are the same. So the gas arrives at the hopcalite already at equilibrium for every practical purpose, and comes out as it went in. The activation energy would tell you how fast a favored change goes; it cannot make an unfavored one go. (A rover on Mars has made oxygen from carbon dioxide. It drove the reaction with electricity, and topic 9.7 comes back to driving an unfavored reaction.) Misses:
  - 1: "A catalyst does speed up both directions. Does speeding up both tell you which way a mixture moves?"
  - 3: "A catalyst speeds up the reverse reaction by the same factor as the forward one. What else, besides speed, decides what comes out?"
  - 4: "The activation energy sets how fast a change goes. Is speed the only thing that decides what comes out?"

  Notes for the writer: the rover is Perseverance, whose experiment made oxygen from carbon dioxide by electrolysis in 2021 **(verify)**; the Why may name it or not, and gives no detail. The air of Mars is mostly carbon dioxide (about 95 percent); the question need not say so. Keep "at 25 °C" in the question, because the K is for 25 °C.
- **Check 5**, `<Check answer={4}>`: "Nitrous oxide from the cylinder is passed through a tube kept at 900 K. Now it breaks down into nitrogen and oxygen at a rate that is easy to measure. No catalyst is in the tube. The reaction is exothermic, with ΔH° = −164 kJ/mol. Which of these is the same in the hot tube as it was in the cylinder at 298 K?" Options:
  1. The share of collisions with enough energy to react
  2. The equilibrium constant of the breakdown
  3. The value of ΔG° for the breakdown
  4. The activation energy of the breakdown

  Why: the activation energy belongs to the reaction and its route, and with no catalyst the route is the same one, so the hill is as high at 900 K as at 298 K. Everything else on the list moved. At 900 K (627 °C) the molecules have far more energy, and the share of collisions with at least 250 kJ/mol is larger by many powers of ten: that is what made the reaction fast. K changed too: for an exothermic reaction it gets smaller on heating (topic 7.9), though here it stays very large. And ΔG° = ΔH° − TΔS° changes whenever T does: topic 9.3's equation gives −297.7 kJ/mol_rxn at 900 K, against −208 at 298 K. Misses:
  - 1: "Warming a gas moves its collisions toward higher energies (topic 5.5). Would the share above a fixed energy stay where it was?"
  - 2: "This reaction is exothermic. Topic 7.9 says what heating does to K for an exothermic reaction."
  - 3: "ΔG° = ΔH° − TΔS°, and T has gone from 298 K to 900 K. This reaction makes 3 moles of gas from 2. Is ΔS° zero?"

  Notes for the writer: lesson 6.6 says nitrous oxide breaks down "when heated strongly"; 900 K is a temperature at which the breakdown of the gas is easily measured **(verify)**. The Check gives ΔH° as −164, lesson 6.6's figure (−164.1 in topic 9.3). The Why's −297.7 is −164.1 − (900)(0.1484), from topic 9.3's values; the entropy change, +148.4 J/(mol_rxn·K), need not be printed. "The same" is true of the activation energy as Unit 5 treats it, a fixed property of a reaction's route. Do not say that ΔG° being more negative at 900 K makes the reaction "more favored": K is smaller there, and comparing ΔG° at two temperatures is topic 9.5's business.
- **Trap:** **"ΔG° is negative, so the reaction is fast"** (ΔG° comes from the two ends of the reaction and says nothing about its rate, however negative it is). **"Nothing is happening, so it must be at equilibrium"** (a favored reaction that is not seen to go is under kinetic control; at equilibrium the mixture would fit K). **Giving half the answer** (say both halves: thermodynamically favored, and slow because the activation energy is high at this temperature). **"A catalyst makes the reaction favored"** (a catalyst changes the route, not the reactants or the products, so ΔG°, ΔH° and K are what they were, and an unfavored direction is unfavored still). **"Heating lowers the activation energy"** (heating gives more collisions enough energy to get over the same hill). **"Heating always raises K"** (it raises the rate; what it does to K depends on the sign of ΔH°).
- **Key points:** (1) the favored direction of a change comes from its two ends, through ΔG°, and its rate comes from the hill between them, through the activation energy, and neither can be worked out from the other; (2) a thermodynamically favored process that goes too slowly to measure is under kinetic control, usually because its activation energy is high, so that almost no collisions have enough energy at that temperature; (3) a mixture that is not changing is not necessarily at equilibrium: if the process is known to be favored and is not observed, the conclusion is kinetic control; (4) a catalyst gives a reaction a route with a lower activation energy, between the same reactants and the same products, so the rate changes while ΔG° and K do not, and a direction that was unfavored stays unfavored; (5) heating raises the share of collisions with at least the activation energy, which raises the rate, and separately it changes K and ΔG°; (6) a full explanation has two halves: the process is thermodynamically favored, and it is slow because its activation energy is high.

**Figures**

- **`9-4-two-questions.svg`** (viewBox 0 0 480 300, font-size 18). One energy profile, drawn like lesson 5.6's (`5-6-energy-profile.svg`), with two labeled arrows.
  - Axes: an ink path from (30, 12) down to (30, 262) and right to (466, 262). "energy" rotated, centered at (16, 137). "reaction progress" centered at (248, 290). No numbers on either axis: the vertical axis is "energy", as in lesson 5.6, not free energy.
  - The curve (ink, stroke 3): level at y = 150 from x = 36 to x = 130 (the reactants); then a hill through the 33 points below; then level at y = 215 from x = 290 to x = 456 (the products). The points of the hill, each computed by the brief's script from y = 150 + 65(3u² − 2u³) − 137 sin²(πu) with u = (x − 130)/160:

    (130, 150.0); (135, 148.9); (140, 145.5); (145, 140.1); (150, 132.7); (155, 123.8); (160, 113.7); (165, 102.8); (170, 91.7); (175, 80.7); (180, 70.4); (185, 61.2); (190, 53.6); (195, 48.0); (200, 44.7); (205, 43.8); (210, 45.5); (215, 49.9); (220, 56.8); (225, 66.1); (230, 77.5); (235, 90.7); (240, 105.2); (245, 120.6); (250, 136.3); (255, 151.9); (260, 166.7); (265, 180.3); (270, 192.1); (275, 201.8); (280, 209.1); (285, 213.5); (290, 215.0)

    The top of the hill is at (204.2, 43.7): 106.3 units above the reactants, while the products are 65 units below them. Draw the hill as a polyline or a smooth path through all 33 points.
  - Level guides (secondary color, thin, dashed 4 4): the top of the hill, from (110, 43.7) to (204.2, 43.7); and the reactants' level, from (130, 150) to (430, 150). The second guide crosses the falling side of the curve once, at x = 254.4, as lesson 5.6's guide does.
  - "How fast" arrow: a vertical double-headed arrow in the accent color at x = 110, from y = 150 (the reactants' level, where it touches the curve's level stretch) up to y = 43.7. Its label, "how fast: kinetics", starts at x = 60 with its baseline at y = 28, above the top of the hill.
  - "Which way" arrow: a vertical double-headed arrow in the accent color at x = 430, from y = 150 down to y = 215 (the products' level). Its label, "which way: thermodynamics", ends at x = 456 with its baseline at y = 243, under the products' level.
  - Labels on the curve: "reactants" starting at x = 36, baseline y = 174 (under the reactants' level); "products" starting at x = 310, baseline y = 205 (above the products' level, below the dashed guide).
  - Text in the figure, six pieces: "energy", "reaction progress", "reactants", "products", "how fast: kinetics", "which way: thermodynamics". The two arrows differ in position and in label; nothing is told apart by color alone.
  - Alt: "An energy profile. The curve starts level at the left, labeled reactants, climbs a high hill and comes down to a lower level at the right, labeled products. A vertical arrow from the reactants' level up to the top of the hill is labeled how fast: kinetics. A second vertical arrow, between the reactants' level and the lower level of the products, is labeled which way: thermodynamics."
  - Caption: "Two questions about one reaction. Thermodynamics compares the two ends. Kinetics looks at the hill between them, and a high hill can hold back a reaction that the two ends favor."
  - Notes for the writer: render the figure and check that "products" (about 80 units wide, from x = 310) clears the "which way" arrow at x = 430 and the dashed guide above it, and that "how fast: kinetics" (about 170 units wide) ends before x = 240 and clears the top of the hill by more than 10 units. The caption does not say that the drop on this graph is ΔG°: the axis is energy, as in Unit 5, and the lesson's text says in words that ΔG° is what decides the direction. The figure is of no particular reaction and carries no numbers.

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| ΔG°f of N₂O(g) | +104.2 kJ/mol | the unit's table; fairly sure (newer tables give +103.7) |
| ΔG° of 2N₂O(g) → 2N₂(g) + O₂(g) at 25 °C | −208.4 kJ/mol_rxn, printed as "about −208" | −2(+104.2); ΔH° − TΔS° gives −208.3; fairly sure |
| ΔH° and ΔS° of the same reaction | −164.1 kJ/mol_rxn (printed as −164, lesson 6.6's figure); +148.4 J/(mol_rxn·K) (not printed) | topic 9.3's values |
| ΔG° of the same reaction at 900 K | −297.7 kJ/mol_rxn | −164.1 − (900)(0.1484) |
| Activation energy of 2N₂O → 2N₂ + O₂ with no catalyst | about 250 kJ/mol | memory: measured values lie near 250 to 260 kJ/mol **(verify)** |
| R; RT at 298 K | 8.314 J/(mol·K); 2,478 J/mol = 2.48 kJ/mol | the equation page; computed |
| Share of collisions with 250 kJ/mol at 298 K | of the order of one in 10⁴⁴ | computed, e^(−250,000 ÷ 2,478) = 1.5 × 10⁻⁴⁴; depends strongly on the activation energy |
| Nitrous oxide breaks down at a measurable rate | at 900 K (627 °C) | memory **(verify)** |
| ΔG°f of N₂H₄(l); NH₃(g) | +149.3; −16.4 kJ/mol | the unit's table; fairly sure; sure |
| ΔG° of N₂H₄(l) → N₂(g) + 2H₂(g) | −149.3 kJ/mol_rxn | −(+149.3); ΔH° − TΔS° gives −149.5 (from −50.6 kJ and +331.8 J/K, with S° 121.2, 191.6 and 130.7); fairly sure |
| ΔG° of 3N₂H₄(l) → 4NH₃(g) + N₂(g) (not printed; "favored too") | −513.5 kJ for the three moles | 4(−16.4) − 3(+149.3) |
| Hydrazine thrusters | liquid hydrazine kept in a satellite's tank for fifteen years or more; broken down on a bed of iridium on aluminum oxide grains, with no oxygen, in a fraction of a second; exhaust of ammonia, nitrogen and hydrogen | memory; sure of the practice, the catalyst **(verify)** |
| K_p of 2CO(g) + O₂(g) ⇌ 2CO₂(g) at 25 °C, and of the reverse | about 10⁹⁰; about 10⁻⁹⁰ | lesson 7.5's own figures (its lines 19 and 27). The unit's ΔG°f values, −137.2 and −394.4, give ΔG° = −514.4 kJ and K = 1.5 × 10⁹⁰ (not printed) |
| Pressures in the boiler room's air | CO 0.00010 atm; O₂ 0.21 atm; CO₂ 0.00040 atm | chosen: 100 parts per million of CO sets off a household alarm within hours **(verify)**; the others are those of ordinary air |
| Q for that air | 76 (76.2 before rounding) | computed, (0.00040)² ÷ [(0.00010)²(0.21)] |
| Hopcalite | a mixture of manganese and copper oxides; catalyzes CO with O₂ at room temperature when dry; used in miners' escape masks | memory; fairly sure **(verify)** |
| Oxygen made on Mars from carbon dioxide | by electrolysis, on the rover Perseverance, 2021 | memory; sure **(verify the year)** |
| ΔG°f of Al₂O₃(s); Fe₂O₃(s) | −1,582.3; −742.2 kJ/mol | the unit's table; sure |
| ΔG° of 2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s) | −840.1 kJ/mol_rxn, printed as −840 | computed; sure. ΔH° is −851.5 (not printed) |
| White tin and gray tin | gray tin favored below 13 °C | sure of the temperature (13.2 °C); no other number is used |
| The bulb of ethene and hydrogen | one sentence, no numbers | lesson 7.5 |

**Check script:** `scratchpad/unit9/checks/9-4.py`. It recomputes every number above, balances the five equations, tests the two routes to ΔG° against each other for nitrous oxide and for hydrazine, checks that the unit's formation values give a K for carbon monoxide with oxygen that agrees with lesson 7.5's 10⁹⁰, computes Q for the boiler room's air, checks that K for nitrous oxide falls on heating and stays large, computes the 33 points of the figure's curve, its top and the clearances of its labels, checks each message and option against this file, and checks the answer positions of this lesson and of lessons 9.3 and 9.4 together.

**Notes for the writer**

- The full answer to a question on this topic has two halves, and every worked example and every Why that explains a slow favored reaction gives both: thermodynamically favored (ΔG° < 0), and slow because the activation energy is high at that temperature.
- Activation energy is worded as lesson 5.5 worded it: "the minimum energy a collision needs for the bonds to start rearranging". Do not call a favored, slow substance "metastable" and do not call a reaction "stuck" in the lesson's own voice ("slow", "too slow to measure", "under kinetic control").
- Not here, because the teacher's materials or the site's practice pages use them: diamond and graphite, gasoline or any fuel waiting in a tank to burn in air, hydrogen with oxygen and a spark, any made-up ΔG° value. Not here either, because lessons 7.5 and 5.11 already tell them: the bulb of ethene and hydrogen with platinum (one pointing sentence only) and the bottle of hydrogen peroxide with iodide (not mentioned). The lesson's examples are the nitrous oxide cylinder, thermite, tin, the carbon monoxide in the boiler room with the hopcalite of an escape mask, the satellite's hydrazine with its iridium, and carbon dioxide on Mars, and no other.
- K appears as Unit 7 left it (a large K means mostly products at equilibrium). Do not write ΔG° = −RT ln K or state how ΔG° and K are related; "favored" and "K far above 1" are tied together in topic 9.5. Write no K for thermite or for tin, which are reactions among pure solids.
- "Thermodynamically favored" at first use, "favored" after. Never "spontaneous", never "favorable".
- "A catalyst cannot move a mixture that is at equilibrium" and "heating also does something a catalyst never does" are literally true of a catalyst. "Heating speeds up nearly every reaction" keeps its "nearly".
- The section "The hill and the two ends" is written from the figure: a catalyst redraws the hill, heating leaves the drawing alone and changes the collisions, and neither moves the two ends. Keep it in those terms. Do not recast it as a list of "ways to speed a reaction up" with the effect of each on K.
- The figure's vertical axis is energy, not free energy. The text says that ΔG°, ΔH° and K "depend on the substances at the two ends"; it does not say that the drop on the figure is ΔG°.
- Worked example 1 states the share of collisions as a figure. It is the only number of its kind in the lesson. Do not add the share at 900 K (Check 5 says "larger by many powers of ten").
- The opening's hospital cylinder is the only setting for nitrous oxide. Do not bring in engines, whipped-cream chargers or dentistry.

**Reactions, substances and scenarios used:** a hospital's steel cylinder of nitrous oxide that keeps for years, 2N₂O(g) → 2N₂(g) + O₂(g), ΔG° about −208 kJ/mol_rxn, activation energy about 250 kJ/mol, RT = 2.48 kJ/mol, one collision in 10⁴⁴ (opening, worked example 1), and the same gas in a tube at 900 K, where the activation energy is the one thing unchanged (Check 5); a jar of thermite on a shelf, 2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s), −840 kJ/mol_rxn, lit with a magnesium strip (Check 1); bars of pure white tin in an unheated storeroom at about 5 °C, gray tin favored below 13 °C (Check 2); the bulb of ethene and hydrogen of topic 7.5, in one pointing sentence with no numbers; carbon monoxide from a faulty furnace in the air of a closed boiler room, unchanged for hours, turned to carbon dioxide by the hopcalite of a miner's escape mask (Check 3), and the same air compared with K, 2CO(g) + O₂(g) ⇌ 2CO₂(g), K_p about 10⁹⁰ from topic 7.5, Q = 76 from 0.00010, 0.21 and 0.00040 atm (after Check 3); a satellite's liquid hydrazine, fifteen years in its tank, broken down on iridium when a thruster fires, N₂H₄(l) → N₂(g) + 2H₂(g), −149.3 kJ/mol_rxn (worked example 2); carbon dioxide passed through hopcalite at 25 °C in a plan for oxygen on Mars, 2CO₂(g) → 2CO(g) + O₂(g), K_p about 10⁻⁹⁰ (Check 4). Figure: the one the design lists for this lesson, an energy profile of no particular reaction.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at the figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.4 Thermodynamic and Kinetic Control`).

**Check script:** `scratchpad/unit9/checks/9-4.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.4 Thermodynamic and Kinetic Control`).

---

## Group C: free energy, equilibrium and coupling (pull request C)

Branch: `topic/unit-9-equilibrium-and-coupling`, from `topic/unit-9-entropy-and-free-energy`.

Lesson 9.5's brief holds the "Diagram data" of the explorer of ΔG° and K. This pull request also corrects the two sentences about diamond and graphite in the Unit 5 and Unit 7 practice pages (the design's section 1).

> **How these briefs were checked.** See section 11 of the design. The first fact-check found two shown steps that did not give their printed results and one piece of wrong reasoning about salts in hot water. Lesson 9.7 was rebuilt after the originality check, and its second check found one Check answered by the section above it.

### Task 5: Lesson 9.5, Free Energy and Equilibrium

**Files:**
- Create: `src/content/lessons/unit-9/9-5-free-energy-and-equilibrium.mdx`
- Create: `public/figures/9-5-two-rulers.svg`
- Places the interactive block `<GibbsAndK />` (built in its own task from "Diagram data" below; the lesson only places it, and no Check depends on it).

**Brief**

- **Front matter:** `topic: "9.5"`, `minutes: 20`, summary: "How the standard free energy change of a reaction fixes its equilibrium constant, how to turn one into the other, and why a positive value still leaves some product." (No colon in the summary.)
- **Framework (9.5, four statements):** (1) "thermodynamically favored" (ΔG° < 0) means that products are favored at equilibrium (K > 1). (2) K and ΔG° are tied by ΔG° = −RT ln K, which is the same as K = e^(−ΔG°/RT). (3) The tie can be estimated: when ΔG° is near zero, K is near 1; when the size of ΔG° is large beside RT, K is far from 1. (4) A negative ΔG° favors products and a positive ΔG° favors reactants. The objective is to explain favorability through K, ΔG° and T. **What this lesson does not do:** where ΔG° comes from (formation values, ΔH° − TΔS°, the four combinations of signs) is topic 9.3's, used here and not taught again; why a favored reaction may not go is topic 9.4's (one sentence in the Why of Check 2); K for a salt dissolving is topic 9.6's; K from a cell potential is topic 9.9's; ΔG = ΔG° + RT ln Q is one "Beyond the exam" paragraph and nothing more. No van 't Hoff equation: K at a second temperature is always found by way of a new ΔG°. **Equation sheet:** ΔG° = −RT ln K and R = 8.314 J/(mol·K) are on it. The exponential form K = e^(−ΔG°/RT) is not, and neither is any reminder that ΔG° must be in joules.
- **Opening:** topic 7.5 said that at 25 °C the equilibrium constant for carbon dioxide falling apart into carbon monoxide and oxygen is about 10⁻⁹⁰, so small that tens of millions of liters of the gas would be needed to expect one CO molecule. Nobody found that number by counting molecules. It was worked out from a table of free energies, with one equation, and this lesson is about that equation. Note for the writer: give no ΔG° for this reaction in the opening; Check 3 asks for it.
- **Section "Which side of 1":**
  - Topic 9.3: a reaction is thermodynamically favored when ΔG° is below zero. The little circle matters here. ΔG° is about one particular mixture: every substance in its standard state, which means every gas at 1 atm and every solute at 1 M (topic 9.3). Put those numbers into the reaction quotient of topic 7.3 and every term is 1, so that mixture has Q = 1.
  - "Favored" says that this mixture, the one with Q = 1, reacts in the forward direction. Topic 7.3: a mixture reacts until Q equals K, and it runs forward when Q is below K. So a favored reaction has K above 1. In the same way, ΔG° above zero means the standard mixture runs backward, so K is below 1, and ΔG° of exactly zero means the standard mixture is already at equilibrium, so K = 1.
  - A three-row table (three columns) that sets the argument out, with the standard mixture in the middle because it is the link between the other two:

    | ΔG° | The mixture with Q = 1 | So K is |
    |---|---|---|
    | below zero | runs forward | above 1 |
    | zero | is at equilibrium | exactly 1 |
    | above zero | runs backward | below 1 |

  - One sentence in topic 7.5's terms: with K above 1 the top of the K fraction, the products, is the larger at equilibrium, and with K below 1 the bottom is. Note for the writer: the table's middle column is the reasoning and must stay; do not replace it with a column of "products favored" and "reactants favored".
  - One sentence: so "thermodynamically favored" and "K is greater than 1" are one statement, and this is the first thing to check in any calculation: the sign of ΔG° tells you the side of 1 that K must land on.
  - `<KeyIdea>`: the sign of ΔG° tells which way the standard mixture, which has Q = 1, has to go to reach equilibrium, and so it fixes the side of 1 on which K lies. ΔG° below zero puts K above 1, ΔG° above zero puts K below 1, and ΔG° = 0 puts K at exactly 1.
- **Section "From one to the other":**
  - The sign gives the side. One equation gives the size. Display: $\Delta G^\circ = -RT\ln K$. It is on the equation sheet. $R$ is the gas constant in its energy form, 8.314 J/(mol·K), $T$ is in kelvins, and $\ln$ is the natural logarithm, the "ln" key of a calculator.
  - Read the signs off it: R and T are positive, and ln K is positive when K is above 1 and negative when K is below 1. So the minus sign in front makes ΔG° negative exactly when K is above 1, as the table says.
  - Solved for K (not on the sheet; get it by dividing by −RT and using the eˣ key). Display: $K = e^{-\Delta G^\circ/RT}$.
  - **The unit trap of this topic.** R is in joules, so RT is in joules per mole, and ΔG° must be in joules per mole too. Tables and topic 9.3 give ΔG° in kilojoules. Convert on a line of its own, every time: into joules before it goes into the exponent, and back into kilojoules after it comes out of −RT ln K.
  - **Which K.** The K of this equation is the one written with pressures in atm for gases (K_p) and molarities for solutes (K_c), as topic 7.3 writes them, because those are the standard states that ΔG° is defined for. A question says which one it is. K has no unit.
  - One paragraph: a reaction in which every substance is a pure solid or a pure liquid has nothing in its K expression (topic 7.3 leaves pure solids and liquids out), so there is no K to compute for it. Its ΔG° still tells which direction is favored. Never report a K for such a reaction. Note for the writer: give no example with numbers here. Do not use diamond and graphite anywhere in the lesson.
- **Worked example 1, "K from ΔG°":** phosphorus trichloride and chlorine combine to make phosphorus pentachloride, all three as gases:

  $\ce{PCl3(g) + Cl2(g) <=> PCl5(g)}$

  At 298 K, ΔG° = −37.2 kJ/mol_rxn. What is K_p at 298 K?
  1. **Check the sign first.** ΔG° is negative, so K must come out above 1.
  2. **Convert to joules.** −37.2 kJ/mol_rxn = −37,200 J/mol_rxn (a line of its own).
  3. **Find the exponent.** Display, numbers only: −ΔG°/RT = 37,200 ÷ (8.314 × 298) = 37,200 ÷ 2,477.6 = 15.01. The minus sign of the equation and the minus sign of ΔG° make a plus. The units cancel: J/mol over J/mol.
  4. **Take e to that power.** K_p = e^15.01 = 3.3 × 10⁶.
  5. **Check it.** Above 1, as predicted, and large: at equilibrium the pressure of PCl₅ is far greater than the product of the other two pressures.

  Note for the writer: at 25 °C phosphorus pentachloride in bulk is a solid and phosphorus trichloride a liquid. The equation and its K_p are for the three gases, which is what "(g)" says, and such a mixture exists at low pressures. Say "all three as gases" and do not describe a flask holding 1 atm of each. Give the unrounded exponent as 15.01 and the answer to two figures: a student who rounds the exponent to 15.0 gets 3.3 × 10⁶ too.
- **Check 1**, `<Check answer={4}>`, placed after worked example 1: "Topic 7.5 met a bulb of ethene and hydrogen that could make ethane: (display) $\ce{C2H4(g) + H2(g) <=> C2H6(g)}$. For this reaction at 25 °C (298 K), ΔG° = −100.4 kJ/mol_rxn. Which value of K_p goes with it?" Options:
  1. About 2.5 × 10⁻¹⁸, so almost no ethane at equilibrium
  2. About 1.04, so nearly equal amounts of each side
  3. About 3 × 10⁴⁰, so essentially all ethane at equilibrium
  4. About 4 × 10¹⁷, so almost all ethane at equilibrium

  Why: the sign first: ΔG° is negative, so K is above 1. Then −ΔG°/RT = 100,400 ÷ (8.314 × 298) = 40.52 (display), and K = e^40.52 = 4 × 10¹⁷. Topic 7.5 said this K is "greater than 10¹⁷", and this is where that came from. The first option has the sign of the exponent reversed, which gives 1/K. The second leaves ΔG° in kilojoules, so the exponent is 0.0405 and K comes out next to 1. The third takes 40.5 as the power of ten: it is the power of e. And a K this large still says nothing about speed: with no catalyst the bulb holds no ethane a year later, which topic 9.4 called kinetic control. Misses:
  - 1: "ΔG° is negative here. Decide which side of 1 the K must lie on before you do any arithmetic."
  - 2: "R is in joules, so ΔG° must go in as joules. With kilojoules the exponent comes out a thousand times too small."
  - 3: "Check which key you used on the exponent. ln K is a power of e, not a power of ten."

  Note for the writer: the corrected sentence of the Unit 7 skill ladders (line 328) says "K is greater than 10¹⁷ at 25 °C"; this Check's 4 × 10¹⁷ must stay. The option texts carry a few words each so that none is math alone.
- **Worked example 2, "ΔG° from K":** topic 7.3 had a sealed jar holding iodine crystals and violet iodine vapor at equilibrium:

  $\ce{I2(s) <=> I2(g)}$

  The solid is left out, so K_p is the pressure of the vapor. At 25 °C that pressure is 4.1 × 10⁻⁴ atm. What is ΔG° for the change at 298 K?
  1. **Write K.** K_p = 4.1 × 10⁻⁴.
  2. **Predict the sign.** K is below 1, so ΔG° must come out positive.
  3. **Substitute.** Display, split over two lines, numbers only: ΔG° = −(8.314)(298) ln(4.1 × 10⁻⁴) = −(2,477.6)(−7.799) = +19,320 J/mol_rxn.
  4. **Convert.** +19,320 J/mol_rxn = +19.3 kJ/mol_rxn (a line of its own).
  5. **Read it.** ΔG° is positive: turning solid iodine into vapor at 1 atm is not favored at 25 °C. And yet the jar is violet. A positive ΔG° does not say that nothing forms. It says that K is below 1: the vapor stops at 4.1 × 10⁻⁴ atm, far short of 1 atm.

  Note for the writer: the table value of ΔG°f for I₂(g) is +19.3 kJ/mol, which is this same number; do not print the table value, and do not say "sublimes" unless the word is glossed (topic 6.5 uses it). ln(4.1 × 10⁻⁴) = −7.799.
- **Check 2**, `<Check numeric="-12.2" unit="kJ/mol">`: "Topic 7.10 used the blood-red ion that forms when iron(III) ions meet thiocyanate ions in water: (display, split) $\ce{Fe^3+(aq) + SCN^-(aq) <=> FeSCN^2+(aq)}$. Take K_c = 140 at 25 °C (298 K). What is ΔG° for the reaction, in kJ/mol, with its sign?" Why: K is above 1, so ΔG° must be negative. ΔG° = −(8.314)(298) ln(140) = −(2,477.6)(4.942) = −12,240 J/mol_rxn (display, split, numbers only), which is −12.2 kJ/mol_rxn. A K in the hundreds takes only about 12 kJ/mol. Slips:
  - `12.2` (the sign reversed or left off): "K is above 1 here, so products are favored. Which sign of ΔG° goes with that?"
  - `-5.32` (log in place of ln): "Did you use the log key? The equation needs ln, the natural logarithm."
  - `-12243` (the answer in joules): "That is ΔG° in joules per mole. The question asks for kilojoules."
  - `-1.03` (25 used for T): "Did you use 25 for the temperature? T in this equation is in kelvins."

  Note for the writer: lesson 7.10 gives 140 "at a certain temperature"; this Check takes it at 25 °C and says so. Its answer is K_c's ΔG°: the standard state of each ion is 1 M.
- **Section "How far from 1":**
  - The equation has ΔG° divided by RT, so what counts is the size of ΔG° beside RT. At 298 K, RT = (8.314)(298) = 2,478 J/mol, about 2.5 kJ/mol. That is a small energy: a ΔG° of a few kilojoules is "about RT", and a ΔG° of a hundred kilojoules is "forty times RT".
  - Two cases to keep: when ΔG° is within a kilojoule or two of zero, the exponent is a small number and K is near 1. When the size of ΔG° is many times RT, K is far from 1: enormous if ΔG° is negative, tiny if it is positive.
  - The tie is exponential. Each time ΔG° falls by another 5.70 kJ/mol at 298 K, K is multiplied by ten. (Where 5.70 comes from, in one line: a factor of ten in K adds ln 10 = 2.3026 to ln K, and 2.3026 × RT = 2.3026 × 2.4776 = 5.70 kJ/mol.) So ΔG° of −5.7 kJ gives a K of 10, −11.4 kJ gives 100, −17.1 kJ gives 1,000, and +5.7 kJ gives 0.1.
  - Place the figure `9-5-two-rulers.svg` here.
  - One sentence on what this means for the rule of thumb of topic 7.5 ("above about 10³, mostly products"): at 25 °C a K of 10³ is only −17 kJ/mol. Many reactions have a ΔG° far larger in size than that, which is why so many reactions go, for practical purposes, all the way or not at all.
  - This is the way to estimate without a calculator: divide ΔG° in kJ by 5.7 for the power of ten of K at 298 K, with the sign reversed.
  - `<KeyIdea>`: what matters is the size of ΔG° beside RT, which is about 2.5 kJ/mol at 298 K. Near zero, K is near 1. At 298 K every 5.7 kJ/mol multiplies or divides K by ten.
- **Check 3**, `<Check answer={1}>`: "Topic 7.5 gave K_p of about 10⁹⁰ at 25 °C for carbon monoxide burning: (display) $\ce{2CO(g) + O2(g) <=> 2CO2(g)}$. Without a calculator, which ΔG° goes with that K?" Options:
  1. About −514 kJ for each mole of reaction
  2. About −223 kJ for each mole of reaction
  3. About −90 kJ for each mole of reaction
  4. About +514 kJ for each mole of reaction

  Why: K is far above 1, so ΔG° is negative. Ninety factors of ten at 5.70 kJ each is 513 kJ (display: 90 × 5.70 = 513), so ΔG° is about −513 kJ/mol_rxn. The table value, from the free energies of formation of CO and CO₂, is −514.4 kJ/mol_rxn, which is the first option. Multiplying 90 by RT (2.478 kJ) gives 223: that treats 90 as ln K when it is the power of ten. The power of ten is not itself a number of kilojoules. And a positive ΔG° would mean K below 1. Misses:
  - 2: "That is 90 × RT. But 90 is the power of ten of K, not ln K. How many kJ go with each factor of ten at 298 K?"
  - 3: "The power of ten in K is not a number of kilojoules. How many kJ go with each factor of ten at 298 K?"
  - 4: "This K is far above 1, so products are favored. Settle the sign of ΔG° first, then estimate its size."

  Note for the writer: the Why may show the exact check in one display: log K = 514,400 ÷ (5,704.8) = 90.2.
- **The interactive diagram:** place `<GibbsAndK />` here, after Check 3, under two sentences that say what it is: a made-up reaction A(g) ⇌ B(g), in which one particle of A turns into one particle of B, so that K is simply the number of B particles divided by the number of A particles at equilibrium (as in the boxes of topic 7.5). You choose ΔG° and the temperature; the graph shows K on a scale of powers of ten, and the box shows 100 particles at equilibrium, A as open circles and B as filled squares. The text then asks the student to do five things, as a numbered list, predicting before each move:
  1. **Read the starting state.** ΔG° = −5 kJ/mol_rxn at 298 K, which is 2.0 times RT. K = 7.5, and about 88 of every 100 particles are B. Favored, and still 12 particles in 100 are A.
  2. **Slide to zero.** Predict K and the mixture first. (K = 1.0: about 50 of every 100 particles are B.)
  3. **Slide to +5.** Predict first: will the box hold any B? (K = 0.13, and about 12 of every 100 particles are B. The mixtures at −5 and +5 mirror each other, 88 and 12: reversing the sign of ΔG° turns K into 1/K.)
  4. **Go down in steps: −6, −11, −17.** Predict how K changes from each to the next. (K = 11, then 85, then 950: the slider's stops nearest 5.7, 11.4 and 17.1 kJ give K near 10, 100 and 1,000. At −11 about 99 of every 100 particles are B, and at −17 the readout says that fewer than 1 in 100 particles is A.)
  5. **Hold −40 and change the temperature.** Predict whether K rises or falls when the temperature goes up. (At 298 K, RT is 2.48 kJ/mol and K = 1.0 × 10⁷. At 500 K, RT is 4.16 kJ/mol and K = 1.5 × 10⁴. At 1,000 K, RT is 8.31 kJ/mol and K = 120. The same ΔG° is 16 times RT, then 9.6 times, then 4.8 times: a smaller multiple of RT, a K nearer 1.)

  The numbers in parentheses are for the writer to phrase as "you should see". They are the module's values (see "Diagram data"). After the list, two sentences that the explorer's caption also carries: the reaction is made up, and for a real reaction ΔG° itself changes with temperature (topic 9.3), which the last section of this lesson takes up; the box shows proportions, not a count of real molecules, and with only 100 particles it is rough: the number of B divided by the number of A matches K only approximately, and when fewer than 1 particle in 100 is of one kind the box cannot show it, though it is there.
- **Section "A positive ΔG° is not a zero":**
  - The explorer at +5 kJ/mol held 12 particles of B in every 100, and the iodine jar holds vapor. "Thermodynamically unfavored" does not mean that no product forms. It means that K is below 1: starting from reactants alone, the reaction runs forward until Q reaches K, and the net change ends there, with the top of the K fraction smaller than the bottom. How much less depends on the size of ΔG° beside RT: at +5 kJ/mol about an eighth of the mixture, at +60 kJ/mol a trace too small to find (K near 10⁻¹¹: 60 ÷ 5.7 is between 10 and 11 factors of ten).
  - The mirror statement, in one sentence: "thermodynamically favored" does not mean "goes to completion" either. At −5 kJ/mol, 12 particles in 100 stayed A. Topic 7.5: K is never infinite and never zero.
- **Check 4**, `<Check answer={3}>`: "A made-up gas X can rearrange into a gas Y: X(g) ⇌ Y(g). At 298 K, ΔG° = +3.0 kJ/mol_rxn. A flask is filled with pure X at 298 K and left until it reaches equilibrium. About what share of the particles in the flask are Y?" Options:
  1. None: with ΔG° above zero, X does not react
  2. About half, since 3.0 kJ is close to zero
  3. About a quarter of them
  4. About three quarters of them

  Why: −ΔG°/RT = −3,000 ÷ 2,477.6 = −1.211, and K = e^(−1.211) = 0.30 (display). K is the number of Y for each X: 0.30 Y for every 1 X, so Y is 0.30 out of 1.30, which is 23 percent (display: 0.30 ÷ 1.30 = 0.23). The reaction is unfavored and still goes forward from pure X, because pure X has Q = 0, which is below K. Half and half would need K = 1 and ΔG° = 0; 3.0 kJ is more than RT. Three quarters is what −3.0 kJ would give. Misses:
  - 1: "A positive ΔG° puts K below 1. It does not make K zero. Work out K and see what mixture it describes."
  - 2: "Half and half needs K = 1, and that needs ΔG° = 0. Compare 3.0 kJ with RT at 298 K, then work out K."
  - 4: "A mixture that is mostly product goes with K above 1. Check the sign of the exponent you used."

  Note for the writer: X and Y are made up on purpose and the question says so. Do not swap in a real pair of isomers.
- **Section "ΔG° does not change as the reaction runs":**
  - ΔG° is a property of the equation and the temperature, exactly as K is. It compares reactants and products in their standard states. Nothing that happens in the flask changes it: not the starting amounts, not how far the reaction has run, not reaching equilibrium.
  - So at equilibrium ΔG° is not zero, unless K happens to be 1. The PCl₅ mixture of worked example 1 has ΔG° = −37.2 kJ/mol_rxn before it starts, halfway, and at equilibrium.
  - "**Beyond the exam:** the quantity that does change as a reaction runs is written ΔG, without the circle. For a mixture with reaction quotient Q it is ΔG = ΔG° + RT ln Q. It is negative while Q is below K, and it reaches zero at equilibrium, where Q = K. Setting it to zero there gives ΔG° = −RT ln K. This equation is not on the equation sheet." Display the equation on its own line. Nothing else in the lesson uses ΔG without the circle.
- **Check 5**, `<Check answer={2}>`: "Two flasks are kept at 298 K. Flask 1 is filled with PCl₃ and Cl₂ gases. Flask 2 is filled with PCl₅ gas alone. Each is left until it is at equilibrium. The equation is the one in worked example 1, PCl₃(g) + Cl₂(g) ⇌ PCl₅(g), with ΔG° = −37.2 kJ/mol_rxn at 298 K. Which statement is right once both flasks are at equilibrium?" Options:
  1. ΔG° is −37.2 kJ/mol in flask 1 and +37.2 kJ/mol in flask 2, which ran backward
  2. ΔG° for this equation is −37.2 kJ/mol in both flasks, as it was at the start
  3. ΔG° was −37.2 kJ/mol at the start and is now zero in both flasks
  4. ΔG° is zero in flask 1 only, because flask 2 never ran forward

  Why: ΔG° belongs to the equation as written and to the temperature. Both are the same for the two flasks, so both have ΔG° = −37.2 kJ/mol_rxn and K_p = 3.3 × 10⁶, whichever side they started from (topic 7.3: K does not depend on the starting amounts or the starting side). Flask 2 did run backward, because its Q began far above K, but that does not rewrite the equation. And ΔG° does not move toward zero as a mixture nears equilibrium: only K = 1 goes with ΔG° = 0. Misses:
  - 1: "ΔG° goes with the equation as it is written, not with the direction a flask happened to run. Is the equation different for flask 2?"
  - 3: "ΔG° compares substances in their standard states. Does a mixture changing in a flask alter that comparison?"
  - 4: "Both flasks end at equilibrium for the same equation at the same temperature. Can ΔG° differ between them?"
- **Section "K at another temperature":**
  - K changes with temperature (topic 7.9), and now you can say by how much. ΔG° = −RT ln K holds at any temperature, as long as the ΔG° is the one for that temperature. Formation values give ΔG° at 25 °C only. For any other temperature, topic 9.3's second route gives it: ΔG° = ΔH° − TΔS°, with ΔH° and ΔS° taken as the same at every temperature.
  - Two steps, then: ΔG° at the new temperature, then K from it, with the new T in RT as well.
- **Worked example 3, "The same reaction at 600 K":** for PCl₃(g) + Cl₂(g) ⇌ PCl₅(g), ΔH° = −87.9 kJ/mol_rxn and ΔS° = −170.3 J/(mol_rxn·K). Find K_p at 600 K.
  1. **Convert the entropy change.** −170.3 J/(mol_rxn·K) = −0.1703 kJ/(mol_rxn·K) (a line of its own).
  2. **Find the entropy term.** TΔS° = (600)(−0.1703) = −102.2 kJ/mol_rxn.
  3. **Find ΔG° at 600 K.** ΔG° = −87.9 − (−102.2) = +14.3 kJ/mol_rxn. (Unrounded, +14.28.)
  4. **Predict.** ΔG° is now positive, so K must come out below 1.
  5. **Convert to joules.** +14.28 kJ/mol_rxn = +14,280 J/mol_rxn (a line of its own).
  6. **Find K.** −ΔG°/RT = −14,280 ÷ (8.314 × 600) = −14,280 ÷ 4,988.4 = −2.863, and K_p = e^(−2.863) = 0.057.
  7. **Read it.** From 3.3 × 10⁶ at 298 K to 0.057 at 600 K. The reaction is exothermic, and topic 7.9 said that the K of an exothermic reaction falls on heating. Now the reason has two parts you can point at: ΔS° is negative, so the term −TΔS° is positive and grows with T, and ΔG° climbs from −37.2 to +14.3 kJ/mol_rxn. It passes through zero at ΔH° ÷ ΔS° = 87.9 ÷ 0.1703 = 516 K (topic 9.3), and that is the temperature at which K = 1.

  Note for the writer: step 3 at 298 K gives −37.15, which agrees with the −37.2 from formation values within rounding; the lesson reports −37.2 at 298 K. In step 6 the T in RT is 600, not 298: say so in the step. Do not write "the equilibrium shifts" in this example; say K falls.
- **Check 6**, `<Check numeric="6.5">` (no unit): "Back to ethene and hydrogen, C₂H₄(g) + H₂(g) ⇌ C₂H₆(g). For this reaction ΔH° = −136.4 kJ/mol_rxn and ΔS° = −120.8 J/(mol_rxn·K). Chemical plants make ethene from ethane at temperatures near 1,000 K. What is K_p for the reaction as written at 1,000 K?" Why: the entropy term first, in kilojoules: TΔS° = (1,000)(−0.1208) = −120.8 kJ/mol_rxn. Then ΔG° = −136.4 − (−120.8) = −15.6 kJ/mol_rxn = −15,600 J/mol_rxn. Negative, so K is above 1. −ΔG°/RT = 15,600 ÷ (8.314 × 1,000) = 1.876, and K_p = e^1.876 = 6.5 (each line in display math, numbers only). At 298 K this K was 4 × 10¹⁷. At 1,000 K it is 6.5, small enough that a good share of ethane's reverse reaction, to ethene and hydrogen, can be had, which is why the plants run hot. Slips:
  - `0.153` (the sign of the exponent reversed): "ΔG° is negative at 1,000 K, so K must be above 1. Check the sign of the exponent."
  - `1.00` (ΔG° left in kilojoules in the exponent): "Did ΔG° go into the exponent in kilojoules? R is in joules, so ΔG° must be in joules."
  - `543` (298 K used in RT): "Did you use 298 K in RT? The T in RT is the temperature the K is for: 1,000 K."
  - `75.2` (10 raised to the exponent): "Did you use the 10ˣ key? The exponent 1.876 is a power of e."
  - `1.76e5` (ΔG° for 298 K used at 1,000 K): "That is what the ΔG° for 298 K gives. Find ΔG° at 1,000 K from ΔH° and ΔS° first."
  - `5.0e-7` (the entropy term left in joules): "Did TΔS° stay in joules? Change ΔS° to kJ/(mol·K) before it is subtracted from ΔH°."

  Note for the writer: this is the unit's one typed K outside lesson 9.9, and it passes the rule for a typed K: |ln K| = 1.88, and every honest route lands inside 6.37 to 6.63 (R = 8.314 gives 6.53; R = 8.31 gives 6.54; ln K rounded to 1.88 gives 6.55; ΔG° rounded to 0.1 kJ is −15.6 exactly; the temperature is given as 1,000 K, so 298 against 298.15 does not arise). "Near 1,000 K" for the making of ethene from ethane is true of steam cracking, which runs at about 1,050 to 1,150 K **(verify)**; the lesson says "near 1,000 K" and names no process.
- **Trap:** **Leaving ΔG° in kilojoules inside e^(−ΔG°/RT)** (R is in joules; the exponent comes out a thousand times too small and K lands next to 1, whatever the reaction). **Reporting the joules that −RT ln K gives as kilojoules** (convert on a line of its own). **Losing the sign** (decide from the sign of ΔG° which side of 1 the K must be on before computing, and from K which sign ΔG° must have). **Using the log key for ln**, or reading ln K as the power of ten. **Saying ΔG° = 0 at equilibrium** (ΔG° is fixed for an equation at a temperature; it is zero only if K = 1). **Reading a positive ΔG° as "no reaction"** (it means K below 1: some product forms, and how much depends on the size of ΔG° beside RT). **Reading a negative ΔG° as "goes to completion"** or as "fast" (K is never infinite, and speed is topic 9.4's). **Using the 298 K value of ΔG° at another temperature**, or 298 in RT when K is wanted at another temperature.
- **Key points:** a thermodynamically favored reaction (ΔG° < 0) has K > 1, an unfavored one (ΔG° > 0) has K < 1, and ΔG° = 0 goes with K = 1; ΔG° = −RT ln K, or K = e^(−ΔG°/RT), with R = 8.314 J/(mol·K), T in kelvins and ΔG° in joules per mole, where K is K_p (pressures in atm) for gases and K_c for solutes; what counts is the size of ΔG° beside RT, about 2.5 kJ/mol at 298 K: near zero, K is near 1, and at 298 K every 5.7 kJ/mol is a factor of ten in K; a positive ΔG° means a small K, not zero, so some product still forms, and a negative ΔG° means a large K, not an infinite one; ΔG° belongs to the equation and the temperature and does not change as the mixture reacts, so it is not zero at equilibrium unless K = 1; for K at another temperature, find ΔG° there from ΔH° − TΔS° and use that temperature in RT.

**Figures**

- **`9-5-two-rulers.svg`** (viewBox 0 0 480 300, font-size 18). Two horizontal rulers, one above the other, joined by vertical guide lines. Both use one mapping of ΔG° to x: **x = 240 + (20/3) × ΔG°**, with ΔG° in kJ/mol, so −30 kJ is at x = 40 and +30 kJ at x = 440 (400 units for 60 kJ).
  - Title, centered at x = 240, y = 28, weight 600: "At 298 K".
  - The name of the upper ruler, centered at x = 240, y = 54: "ΔG° in kJ/mol".
  - **Upper ruler:** a horizontal ink line at y = 100 from x = 40 to x = 440. Seven ticks, 10 units tall, standing on the line (y = 90 to 100), at ΔG° = −30, −20, −10, 0, +10, +20, +30: x = 40.0, 106.7, 173.3, 240.0, 306.7, 373.3, 440.0. Labels centered above the ticks at y = 82: "−30", "−20", "−10", "0", "+10", "+20", "+30".
  - **Lower ruler:** a horizontal ink line at y = 200 from x = 40 to x = 440. Eleven ticks, 10 units tall, hanging from the line (y = 200 to 210), one for each power of ten from 10⁵ to 10⁻⁵. The tick for 10ⁿ is at ΔG° = −5.7048n kJ (5.7048 = 2.3026 × 8.314 × 298 ÷ 1,000), so at x = 240 − 38.03n:

    | K | 10⁵ | 10⁴ | 10³ | 10² | 10 | 1 | 10⁻¹ | 10⁻² | 10⁻³ | 10⁻⁴ | 10⁻⁵ |
    |---|---|---|---|---|---|---|---|---|---|---|---|
    | ΔG° (kJ) | −28.52 | −22.82 | −17.11 | −11.41 | −5.70 | 0 | +5.70 | +11.41 | +17.11 | +22.82 | +28.52 |
    | x | 49.8 | 87.9 | 125.9 | 163.9 | 202.0 | 240.0 | 278.0 | 316.1 | 354.1 | 392.1 | 430.2 |

    (A table for the writer, not for the page.) Labels centered under five of the ticks at y = 232: "10⁴" at x = 87.9, "10²" at 163.9, "1" at 240.0, "10⁻²" at 316.1, "10⁻⁴" at 392.1. The other six ticks carry no label: at 38 units apart, eleven labels would touch.
  - The name of the lower ruler, centered at x = 240, y = 258: "K".
  - **Guides:** eleven vertical lines from y = 100 to y = 200 at the eleven x values of the table. Ten are thin and dashed, in the secondary color. The one at x = 240, joining ΔG° = 0 to K = 1, is solid, in ink, 2 units wide.
  - A label on a backing rectangle of the background color (x = 282 to 426, y = 136 to 164), so that it covers the three dashed guides behind it: "×10 every 5.7 kJ", centered at x = 354, y = 156.
  - Bottom line, y = 288: "products favored" centered at x = 140 and "reactants favored" centered at x = 340.
  - Text in the figure, eighteen pieces: "At 298 K"; "ΔG° in kJ/mol"; the seven numbers of the upper ruler; the five labels of the lower ruler; "K"; "×10 every 5.7 kJ"; "products favored"; "reactants favored" (2 + 7 + 5 + 1 + 1 + 2 = 18).
  - Alt: "Two horizontal rulers at 298 K, one above the other. The upper ruler is ΔG° from −30 to +30 kJ/mol, with a tick every 10 kJ. The lower ruler is K, with eleven ticks from 10⁵ at the left to 10⁻⁵ at the right, one for each factor of ten. Eleven vertical lines join each K tick to the ΔG° ruler above it, 5.7 kJ apart. The solid line in the middle joins ΔG° = 0 to K = 1. The left half is labeled products favored and the right half reactants favored."
  - Caption: "ΔG° and K side by side at 298 K. Zero sits opposite 1, and every 5.7 kJ/mol to the left or right is one more factor of ten."

**Diagram data** (for the builder of `src/lib/gibbs-and-k.ts` and `<GibbsAndK />`; the design's section 6.1 fixes what the diagram shows)

- **The reaction:** made up, A(g) ⇌ B(g). K is the number of B particles divided by the number of A particles at equilibrium.
- **Constants:** R = 8.314 J/(mol·K) (the site's equation page). No other constant.
- **Controls:**

  | Control | Values | Step | Starts at |
  |---|---|---|---|
  | ΔG° (slider) | −40 to +40 kJ/mol_rxn | 1 | −5 |
  | Temperature (choice) | 298 K, 500 K, 1,000 K | | 298 K |

  That is 81 × 3 = 243 states.
- **The model.** With g = ΔG° in whole kilojoules and T in kelvins:
  - RT in kJ/mol = 8.314 × T ÷ 1,000: exactly 2.477572, 4.157 and 8.314.
  - x = −1,000g ÷ (8.314T) (this is ln K); K = eˣ; log K = x ÷ ln 10.
  - share of B in percent = 100K ÷ (1 + K) = 100 ÷ (1 + e⁻ˣ).
  - Nothing here is exact arithmetic except RT: the module computes K in floating point and rounds only for display. The tests pin every state's shown K and shown count (the script lists all 243) and prove that no state sits within 10⁻⁹ of a rounding boundary.
- **How each shown number is rounded** (every one from the unrounded value, half up):
  - **ΔG°:** the slider's whole number with its sign: "−5", "0", "+5".
  - **RT:** three significant figures: 2.48, 4.16, 8.31 kJ/mol.
  - **The multiple of RT:** |g| ÷ RT, from the unrounded RT, to two significant figures: 5 ÷ 2.477572 = 2.018 shows "2.0"; 40 ÷ 2.477572 = 16.14 shows "16"; 1 ÷ 8.314 = 0.1203 shows "0.12". Not shown when g = 0.
  - **K:** two significant figures. If the rounded value is from 0.010 to 9,900 it is a plain number with a thousands comma ("0.012", "0.13", "1.0", "7.5", "85", "950", "7,200"); outside that range it is a power of ten ("1.1 × 10⁴", "1.0 × 10⁷", "7.9 × 10⁻³", "9.7 × 10⁻⁸").
  - **Particles of B out of 100:** n_B = the share of B rounded to the nearest whole number, half up; n_A = 100 − n_B. The box draws exactly n_B filled squares and n_A open circles.
- **Which cells are B.** The box is ten rows of ten cells, numbered i = 0 to 99 in reading order. Cell i has rank (37i + 11) mod 100, and it is a filled square (B) when its rank is below n_B. Because 37 and 100 share no factor, the ranks are the numbers 0 to 99 each once: the B particles are scattered through the box, and moving the slider by one step changes at most a few cells and never rearranges the rest.
- **The graph:** log K (vertical, from −8 to +8, with gridline labels "10⁻⁶", "10⁻³", "1", "10³", "10⁶") against ΔG° (horizontal, −40 to +40 kJ/mol_rxn, labels every 20). Three straight lines through the origin, one for each temperature; each passes through these points (ΔG°, log K):

  | T | at −40 | at −20 | at 0 | at +20 | at +40 |
  |---|---|---|---|---|---|
  | 298 K | +7.012 | +3.506 | 0 | −3.506 | −7.012 |
  | 500 K | +4.179 | +2.089 | 0 | −2.089 | −4.179 |
  | 1,000 K | +2.089 | +1.045 | 0 | −1.045 | −2.089 |

  The chosen temperature's line is heavy; the other two are faint and dashed. A marker sits at the setting. The line log K = 0 is drawn firmly and labeled "K = 1".
- **Readout sentences** (the builder may break them over lines; the words and numbers are fixed):
  - Starting state: "ΔG° = −5 kJ/mol_rxn at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.0 times RT below zero. K = 7.5. At equilibrium about 88 of every 100 particles are B."
  - ΔG° above zero, for example +5 at 298 K: "ΔG° = +5 kJ/mol_rxn at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.0 times RT above zero. K = 0.13. At equilibrium about 12 of every 100 particles are B."
  - ΔG° of zero, at any temperature (here 298 K): "ΔG° = 0 kJ/mol_rxn at 298 K. RT is 2.48 kJ/mol. K = 1.0. At equilibrium about 50 of every 100 particles are B."
  - n_B = 100 (for example −40 at 298 K): "ΔG° = −40 kJ/mol_rxn at 298 K. RT is 2.48 kJ/mol, so ΔG° is 16 times RT below zero. K = 1.0 × 10⁷. At equilibrium fewer than 1 in 100 particles is A."
  - n_B = 0 (for example +40 at 298 K): "… K = 9.7 × 10⁻⁸. At equilibrium fewer than 1 in 100 particles is B."
  - n_B = 1: "about 1 of every 100 particles is B" (singular verb). n_B = 99: "about 99 of every 100 particles are B". The readout never says 0 or 100.
- **Limits, checked over all 243 states by the script:**
  - K runs from 9.7 × 10⁻⁸ (+40 at 298 K) to 1.0 × 10⁷ (−40 at 298 K); log K stays between −7.02 and +7.02, inside the graph.
  - K(−g, T) × K(g, T) = 1 for every g and T, and n_B(−g, T) + n_B(g, T) = 100 for every g and T (no state is a rounding tie, so the mirror is exact).
  - K falls as g rises at each temperature; for g below zero, K falls as T rises, and for g above zero it rises.
  - n_B is 0 in 45 states (at 298 K for g from +14 to +40; at 500 K for g from +23 to +40; never at 1,000 K, where the lowest n_B is 1) and 100 in the 45 mirror states. In those 90 states the readout uses the "fewer than 1 in 100" sentence.
  - No shown number is within 10⁻⁹ (relative) of a rounding boundary. The nearest calls: the share of B at +22 kJ and 500 K is 0.5005 (shown as 1), and at −22 kJ and 500 K it is 99.4995 (shown as 99).
- **Worked states** for unit tests (inputs, then the outputs expected; the first nine are the states the lesson's text walks through):

  | ΔG° (kJ) | T (K) | Multiple of RT | K shown | Share of B (%) | n_B | Readout's last sentence |
  |---|---|---|---|---|---|---|
  | −5 | 298 | 2.0 | 7.5 | 88.27 | 88 | about 88 of every 100 particles are B |
  | 0 | 298 | | 1.0 | 50.00 | 50 | about 50 of every 100 particles are B |
  | +5 | 298 | 2.0 | 0.13 | 11.73 | 12 | about 12 of every 100 particles are B |
  | −6 | 298 | 2.4 | 11 | 91.85 | 92 | about 92 of every 100 particles are B |
  | −11 | 298 | 4.4 | 85 | 98.83 | 99 | about 99 of every 100 particles are B |
  | −17 | 298 | 6.9 | 950 | 99.90 | 100 | fewer than 1 in 100 particles is A |
  | −40 | 298 | 16 | 1.0 × 10⁷ | 100.00 | 100 | fewer than 1 in 100 particles is A |
  | −40 | 500 | 9.6 | 1.5 × 10⁴ | 99.99 | 100 | fewer than 1 in 100 particles is A |
  | −40 | 1,000 | 4.8 | 120 | 99.19 | 99 | about 99 of every 100 particles are B |
  | +40 | 298 | 16 | 9.7 × 10⁻⁸ | 0.00 | 0 | fewer than 1 in 100 particles is B |
  | +13 | 298 | 5.2 | 5.3 × 10⁻³ | 0.52 | 1 | about 1 of every 100 particles is B |
  | +14 | 298 | 5.7 | 3.5 × 10⁻³ | 0.35 | 0 | fewer than 1 in 100 particles is B |
  | +22 | 500 | 5.3 | 5.0 × 10⁻³ | 0.50 | 1 | about 1 of every 100 particles is B |
  | +23 | 500 | 5.5 | 4.0 × 10⁻³ | 0.39 | 0 | fewer than 1 in 100 particles is B |
  | +11 | 298 | 4.4 | 0.012 | 1.17 | 1 | about 1 of every 100 particles is B |
  | +12 | 298 | 4.8 | 7.9 × 10⁻³ | 0.78 | 1 | about 1 of every 100 particles is B |
  | −22 | 298 | 8.9 | 7,200 | 99.99 | 100 | fewer than 1 in 100 particles is A |
  | −23 | 298 | 9.3 | 1.1 × 10⁴ | 99.99 | 100 | fewer than 1 in 100 particles is A |
  | −1 | 298 | 0.40 | 1.5 | 59.96 | 60 | about 60 of every 100 particles are B |
  | +1 | 1,000 | 0.12 | 0.89 | 47.00 | 47 | about 47 of every 100 particles are B |
  | +40 | 1,000 | 4.8 | 8.1 × 10⁻³ | 0.81 | 1 | about 1 of every 100 particles is B |

  The share of B is listed to two decimal places for the tests; the page shows only n_B.
- **The caption** (the design fixes its content): the reaction is made up; for a real reaction ΔG° itself changes with temperature (topic 9.3); the box shows proportions, not a real count of molecules, and with only 100 particles it is rough: the number of B divided by the number of A matches K only approximately, and when fewer than 1 particle in 100 is of one kind the box cannot show it, though it is there.

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| R | 8.314 J/(mol·K) | the site's equation page |
| RT at 298 K; RT ln 10 at 298 K | 2,477.6 J/mol; 5,704.8 J/mol (5.70 kJ/mol) | computed |
| ΔG°f of PCl₃(g); PCl₅(g); Cl₂(g) | −267.8; −305.0; 0 kJ/mol | the unit's table, from memory of standard tables; fairly sure |
| ΔH°f of PCl₃(g); PCl₅(g) | −287.0; −374.9 kJ/mol | the unit's table; fairly sure |
| S° of PCl₃(g); PCl₅(g); Cl₂(g) | 311.8; 364.6; 223.1 J/(mol·K) | the unit's table; fairly sure (Cl₂ sure) |
| PCl₃(g) + Cl₂(g) → PCl₅(g): ΔH°; ΔS°; ΔG° at 298 K | −87.9 kJ; −170.3 J/K; −37.2 kJ (−37.15 by ΔH° − TΔS°) | computed from the rows above; the lesson reports −37.2 |
| The same: K_p at 298 K; ΔG° and K_p at 600 K; T where ΔG° = 0 | 3.3 × 10⁶; +14.3 kJ and 0.057; 516 K | computed |
| Vapor pressure of solid iodine at 25 °C | 4.1 × 10⁻⁴ atm (0.31 torr) | from memory; fairly sure **(verify)** |
| I₂(s) → I₂(g): ΔG° at 298 K | +19.3 kJ/mol from the vapor pressure; +19.3 from ΔG°f of I₂(g); +19.3 from ΔH° = +62.4 kJ and ΔS° = +144.6 J/K | the three agree; sure of the table value |
| K_c for Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ | 140, taken at 25 °C | lesson 7.10's value ("at a certain temperature"); measured values depend on the other ions in the solution |
| ΔG°f of C₂H₄(g); C₂H₆(g) | +68.4; −32.0 kJ/mol | the unit's table; fairly sure (tables differ by up to 0.8 kJ) |
| C₂H₄ + H₂ → C₂H₆: ΔH°; ΔS°; ΔG° at 298 K | −136.4 kJ; −120.8 J/K; −100.4 kJ | the unit's table (ΔH°f +52.4, −84.0; S° 219.3, 130.7, 229.2); fairly sure |
| The same: K_p at 298 K; ΔG° and K_p at 1,000 K | 4 × 10¹⁷; −15.6 kJ and 6.5 | computed, with ΔH° and ΔS° taken as constant up to 1,000 K, which is an approximation the Check does not test |
| ΔG°f of CO(g); CO₂(g) | −137.2; −394.4 kJ/mol | the unit's table; sure |
| 2CO + O₂ → 2CO₂: ΔG° at 298 K; log K | −514.4 kJ; 90.2 | computed; agrees with lesson 7.5's "about 10⁹⁰" |
| X(g) ⇌ Y(g), ΔG° = +3.0 kJ at 298 K | K = 0.30; 23 percent Y | made up, and said to be |
| The explorer's A(g) ⇌ B(g) | every number in "Diagram data" | made up, and said to be |
| The temperature at which ethene is made from ethane | "near 1,000 K" | steam cracking runs at about 1,050 to 1,150 K **(verify)** |

No atomic mass is used in this lesson.

**Check script:** `scratchpad/unit9/checks/9-5.py`. It recomputes every number above, the figure's coordinates, each slip, every worked state and the limits over all 243 states of the explorer (with an independent high-precision method for K), and checks each message, each option's length and the summary against this file.

**Notes for the writer**

- Never "spontaneous", never "favorable" for a process, never "disorder". "Favored" does not mean fast (topic 9.4) and does not mean complete (this lesson).
- Every conversion between joules and kilojoules is a line of its own, in the worked examples and in each Why.
- Say which K each time one is computed: K_p for the three gas reactions, K_c for the thiocyanate Check.
- ΔG without the circle appears only in the "Beyond the exam" paragraph. Everywhere else the symbol is ΔG°.
- Do not give a K for any reaction among pure solids and liquids, and do not use diamond and graphite.
- The words "shift" and "Le Châtelier" are not needed in this lesson: say that K rises or falls.
- Check 4 sits after the explorer and after the section it tests; Check 3 sits before the explorer so that the student has estimated once by hand first. Do not move them.
- The Checks are numbered here in the order they stand on the page: 1 (choice, ethene), 2 (typed, thiocyanate), 3 (choice, carbon monoxide), 4 (choice, X and Y), 5 (choice, two flasks), 6 (typed, ethene at 1,000 K).

**Reactions, substances and scenarios used:** carbon dioxide falling apart, K about 10⁻⁹⁰, as topic 7.5 told it (opening, no ΔG°); PCl₃(g) + Cl₂(g) ⇌ PCl₅(g) at 298 K, ΔG° = −37.2 kJ, K_p = 3.3 × 10⁶ (worked example 1), again at 600 K with ΔH° = −87.9 kJ and ΔS° = −170.3 J/K, ΔG° = +14.3 kJ, K_p = 0.057, and 516 K where K = 1 (worked example 3), and as two flasks approaching equilibrium from opposite sides (Check 5); the bulb of ethene and hydrogen of topic 7.5, ΔG° = −100.4 kJ, K_p = 4 × 10¹⁷ (Check 1), and the same reaction at 1,000 K, ΔG° = −15.6 kJ, K_p = 6.5, with ethene plants named in a clause (Check 6); the jar of iodine of topic 7.3, vapor pressure 4.1 × 10⁻⁴ atm, ΔG° = +19.3 kJ (worked example 2); the iron(III) thiocyanate ion of topic 7.10, K_c = 140, ΔG° = −12.2 kJ (Check 2); carbon monoxide burning, K_p about 10⁹⁰ as topic 7.5 has it, ΔG° about −514 kJ (Check 3); a made-up X(g) ⇌ Y(g) with ΔG° = +3.0 kJ, 23 percent Y (Check 4); the explorer's made-up A(g) ⇌ B(g), ΔG° from −40 to +40 kJ at 298, 500 and 1,000 K. Figure: the one the design lists for this lesson.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out".
- [ ] Commit (`feat(lessons): add 9.5 Free Energy and Equilibrium`).

**Check script:** `scratchpad/unit9/checks/9-5.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.5 Free Energy and Equilibrium`).

### Task 6: Lesson 9.6, Free Energy of Dissolution

**Files:**
- Create: `src/content/lessons/unit-9/9-6-free-energy-of-dissolution.mdx`
- Create: `public/figures/9-6-three-changes.svg`, `public/figures/9-6-water-around-an-ion.svg`

**Brief**

- **Front matter:** `topic: "9.6"`, `minutes: 16`, summary: "Why dissolving a salt is three changes at once, what each does to the enthalpy and the entropy, and how the free energy of dissolving and the solubility-product constant say one thing." (No colon in the summary.)
- **Framework (9.6, one statement):** the free energy change of dissolving a salt reflects three things: breaking the attractions that hold the solid together, reorganizing the solvent around the dissolved particles, and the attraction between those particles and the solvent. The sign and the relative size of the enthalpy and the entropy change of each can be estimated. The total is hard to predict, because the parts partly cancel. The objective is to explain how a salt's solubility is related to the enthalpy and entropy changes of its dissolving. **What this lesson does not do:** it does not predict from nothing whether a salt dissolves (the framework says that is hard, and a question gives data or asks about one part); it gives no lattice energy or hydration energy as a number; K_sp itself, molar solubility and the common ion are topics 7.11 and 7.12 (used, not taught again); ΔG° = −RT ln K is topic 9.5's (used); the effect of pH on solubility is topic 8.11's (named once). **Equation sheet:** nothing new. ΔG° = ΔH° − TΔS° and ΔG° = −RT ln K are on it; K_sp is not.
- **Opening:** in Rome in the 1500s, long before anyone could make ice to order, a host chilled wine by standing the flask in a tub of water and stirring saltpeter into the water. The water turned cold as the salt dissolved. Saltpeter is potassium nitrate, and it does today what it did then: it dissolves freely, and it takes energy in from the water as it goes. Topic 6.1 promised an explanation for a change that takes energy in and happens anyway. For a salt, here it is. Note for the writer: the practice is described in a book printed in Rome in 1550 **(verify)**; say "in the 1500s" and name no author. No cold pack, no ammonium nitrate, no sodium chloride anywhere in the lesson.
- **Section "Three changes, each with two signs":**
  - Topics 3.10 and 6.1 took dissolving apart into three parts and followed the energy. Now each part gets two signs: one for its enthalpy change (energy taken in is +, released is −, as in Unit 6) and one for its entropy change (more ways for the particles and their energy to be arranged is +, fewer is −, as in topic 9.1). For a salt in water:
    1. **The ions leave the crystal.** The attractions between cations and anions are overcome, which takes a great deal of energy in: enthalpy +, large. The ions go from fixed places in a crystal to the whole volume of the solution: entropy +.
    2. **Water molecules move apart and rearrange to make room for each ion.** Some attractions between water molecules are overcome: enthalpy +, small beside part 1. The water molecules around the space rearrange to fit it and have fewer ways to be arranged: entropy −, a sign that is hard to separate from part 3's.
    3. **Ions and water molecules attract.** Each ion ends up held in a shell of water molecules turned toward it, by the ion–dipole attractions of topic 3.1. Forming attractions releases energy: enthalpy −, large. An ion and the water molecules holding one another move less freely than they would apart: entropy −.
  - The table (three columns), after the list:

    | Part | Enthalpy | Entropy |
    |---|---|---|
    | 1. Ions leave the crystal | +, large | + |
    | 2. Water makes room | +, small | − |
    | 3. Ions and water attract | −, large | − |

  - One sentence, as a hedge to keep: the entropy lost in parts 2 and 3 is one loss seen from two sides, water molecules and ions holding one another in place; an experiment measures only the total.
  - Place the figure `9-6-three-changes.svg` here.
  - `<KeyIdea>`: dissolving a salt is three changes at once. Pulling the ions out of the crystal takes energy in and raises the entropy. Making room in the water takes a little energy in. The attraction between ions and water releases energy, and the water held around each ion lowers the entropy.
- **Check 1**, `<Check answer={3}>`: "Barium sulfate is made of Ba²⁺ and SO₄²⁻ ions, and potassium nitrate of K⁺ and NO₃⁻ ions. A Ba²⁺ ion and a K⁺ ion are nearly the same size. By Coulomb's law, the attraction between two charges is stronger when the charges are larger. Compared with potassium nitrate, what do you expect of the enthalpy changes of part 1 and part 3 for barium sulfate?" Options:
  1. Part 1 takes in more energy, and part 3 releases about the same
  2. Part 1 takes in about the same energy, and part 3 releases more
  3. Part 1 takes in more energy, and part 3 releases more as well
  4. Both parts are about the same, because both solids are ionic

  Why: ions with charges of 2+ and 2− attract each other more strongly than ions of 1+ and 1− at about the same distance, so pulling them out of the crystal takes more energy (part 1). The same larger charges attract the partial charges on water molecules more strongly, so more energy is released when the ions and the water come together (part 3). Both parts grow, and they have opposite signs. That is why the charges alone cannot tell you which salt has the larger total: for barium sulfate the total is +26.3 kJ/mol and for potassium nitrate +34.8 kJ/mol, close together, although each part is several times larger for barium sulfate. Misses:
  - 1: "Part 3 is an attraction between charges too: the ion and the partial charges on water molecules. What does a 2+ charge do to it?"
  - 2: "Part 1 overcomes the attraction between the cations and the anions. What do charges of 2+ and 2− do to that attraction?"
  - 4: "Ionic solids are not all held together equally strongly. Compare the charges on the ions of the two salts."

  Note for the writer: Coulomb's law is in topic 2.3 for distance; the question itself supplies what the law says about the size of the charges, so nothing rests on memory. "Several times larger" is true of the two salts' lattice and hydration enthalpies (roughly 2,500 against 700 kJ/mol **(verify)**); print no such number.
- **Section "What is left when the parts nearly cancel":**
  - For a typical salt, part 1 takes in many hundreds of kilojoules per mole, sometimes thousands, and part 3 gives nearly all of it back. The enthalpy change of dissolving that a calorimeter measures (topic 6.4) is what is left over: usually a few tens of kilojoules per mole, with either sign. The entropy changes behave the same way: a gain from part 1, a loss from the held water, and a total that can have either sign.
  - This is why the topic stops short of prediction. Part 1 and part 3 each run to hundreds of kilojoules per mole, so an estimate of either that is off by a few percent is off by as much as the whole total, and the total could come out with the wrong sign. A salt's formula does not settle whether it dissolves. A question on this topic gives data (a temperature change, a ΔH°, a ΔS°, a K_sp) or asks about the sign and the size of one part.
  - What you can always do is put the pieces into topic 9.3's equation. Display: $\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$, where each quantity is now the total for the dissolving, per mole of salt. The more negative ΔG° is, the further the dissolving goes.
- **Worked example 1, "What 380 grams in a kilogram of water says":** at 25 °C a kilogram of water dissolves about 380 g of potassium nitrate, which is close to 3.8 mol:

  $\ce{KNO3(s) -> K^+(aq) + NO3^-(aq)}$

  For this dissolving ΔH° = +34.8 kJ/mol. How much potassium nitrate would dissolve if the enthalpy change were the whole of ΔG°? What does the measured solubility then say about the entropy change, and which of the three parts accounts for it?
  1. **Read the enthalpy.** ΔH° is positive: parts 1 and 2 take in more energy than part 3 releases. The enthalpy term raises ΔG° and works against the dissolving.
  2. **Test the enthalpy by itself.** If the entropy did not change at all, ΔG° would equal ΔH°: +34.8 kJ/mol, which is +34,800 J/mol (a line of its own). Topic 9.5 turns that into a K. Display, numbers only: −ΔG°/RT = −34,800 ÷ (8.314 × 298) = −14.05, and K = e^(−14.05) = 7.9 × 10⁻⁷.
  3. **Turn that K into a concentration.** For this equation K is [K⁺][NO₃⁻], the K_sp of topic 7.11, and each ion's concentration would be the square root: √(7.9 × 10⁻⁷) = 8.9 × 10⁻⁴ M. Less than a thousandth of a mole in a liter.
  4. **Compare with the measurement.** The real solution holds several moles per liter, thousands of times more. So the entropy change cannot be zero, and it cannot be negative, which would make things worse. The term −TΔS° must be negative, and about as large in size as +34.8 kJ/mol.
  5. **Check against the measured value.** ΔS° = +115.8 J/(mol·K), which is +0.1158 kJ/(mol·K) (a line of its own). TΔS° = (298)(0.1158) = 34.5 kJ/mol. The entropy term cancels almost the whole of the enthalpy term. That leaves ΔG° close to zero and K near 1, and for a salt a K near 1 means a saturated solution with something like a mole of each ion in a liter, not a thousandth of a mole.
  6. **Find the part responsible.** In the table, part 1 is the one that raises the entropy: the ions leave their fixed places for the whole solution. K⁺ and NO₃⁻ are large ions with single charges, and they hold the water around them weakly, so the loss in parts 2 and 3 is small and the gain wins.

  Note for the writer: do not print a ΔG° for potassium nitrate or a K_sp for it. At several moles per liter the simple K expression is only rough, and step 5 says "close to zero" and "near 1" on purpose. Do not set this at a lab bench with a beaker (lesson 4.4 has potassium nitrate stirred into a beaker); the example starts from a measured solubility and needs no scene. Do not frame it as "it gets cold and dissolves anyway".
- **A paragraph after the example, "Warmer water":** in ΔG° = ΔH° − TΔS°, the temperature multiplies only the entropy term (topic 9.3). For potassium nitrate ΔH° and ΔS° are both positive, the case topic 9.3 found favored at high temperature: the hotter the water, the more the entropy term outweighs the enthalpy cost. 100 g of water dissolves about 13 g of potassium nitrate at 0 °C, about 38 g at 25 °C and about 246 g at 100 °C. Many salts are like it: they take energy in as they dissolve, have a positive ΔS°, and dissolve better in hot water. Not all do, as the next section shows. Note for the writer: say "many", not "all".
- **Check 2**, `<Check answer={4}>`: "Topic 6.1 left a question open. Xylitol, the sweetener in a sugar-free mint, dissolves readily in water, and the water cools as it dissolves, so ΔH° of its dissolving is positive. What must be true of ΔS° of its dissolving?" Options:
  1. It is negative, because water molecules gather around each xylitol molecule
  2. It is close to zero, because no gas is made or used up
  3. Nothing can be said: whether a solid dissolves depends on ΔH° alone
  4. It is positive, and TΔS° is larger than ΔH° at this temperature

  Why: a change that goes this far has ΔG° below zero. With ΔH° positive, ΔG° = ΔH° − TΔS° can be negative only if TΔS° is positive and larger than ΔH°. So the entropy change is positive: xylitol molecules leave fixed places in a crystal and spread through the solution, and that gain is larger than the loss from the water they hold. Xylitol is a molecular solid, not a salt, and the reasoning is the same. A negative or zero ΔS° would leave ΔG° positive. And ΔH° alone does not decide: that was topic 6.1's point. Misses:
  - 1: "Water held around a solute does lower the entropy. But with ΔH° positive too, what sign would ΔG° then have?"
  - 2: "Counting gas is only the first test for a sign. If ΔS° were zero, ΔG° would equal ΔH°. What sign is that here?"
  - 3: "Topic 6.1 showed an endothermic dissolving that happens anyway. Which equation of topic 9.3 holds the other term?"

  Note for the writer: xylitol's solubility is well above 1 mol per liter, so "ΔG° below zero" is true of it. Give no number for xylitol.
- **Section "When the water loses more than the ions gain":**
  - Part 1 always raises the entropy. Whether the total is positive depends on how much water each ion holds in place, and how firmly. Place the figure `9-6-water-around-an-ion.svg` here. A small ion, or an ion with a charge of 2+ or 3+, has a strong pull on the water molecules near it. They turn one end toward the ion and stay. Each one has lost most of the ways it could be arranged, and the effect can reach a second layer of water.
  - For salts of such ions, the entropy change of dissolving can be negative: the water loses more than the ions gain. Two examples, with their measured values:

    | Dissolving | ΔH° (kJ/mol) | ΔS° (J/(mol·K)) |
    |---|---|---|
    | KNO₃(s) → K⁺(aq) + NO₃⁻(aq) | +34.8 | +115.8 |
    | MgSO₄(s) → Mg²⁺(aq) + SO₄²⁻(aq) | −91.3 | −209.6 |

  - One sentence on lithium chloride, as the contrast inside one charge: Li⁺ is much smaller than K⁺, so it holds water more strongly, and lithium chloride warms the water as it dissolves (ΔH° = −37.1 kJ/mol; topic 6.1 had it warming an insulated cup).
- **Check 3**, `<Check answer={1}>`: "Look at the table above. Each salt gives two ions for each formula unit. Which explanation fits the negative ΔS° of magnesium sulfate?" Options:
  1. Mg²⁺ and SO₄²⁻ hold much more water in place than K⁺ and NO₃⁻ do
  2. Magnesium sulfate gives fewer ions than potassium nitrate, so they gain less room
  3. Its dissolving releases energy, and a change that releases energy loses entropy
  4. Its ions stay lined up in the water in the pattern they had in the crystal

  Why: both salts give two ions per formula unit, and in both the ions leave a crystal for the whole solution, so part 1 raises the entropy for both. The difference is in the water. Mg²⁺ is small and doubly charged, and SO₄²⁻ is doubly charged too: they hold many water molecules turned toward them, and those water molecules lose most of their freedom. For magnesium sulfate that loss is larger than the ions' gain. Releasing energy and losing entropy are separate things: topic 9.3 met reactions with every combination of the two signs. And dissolved ions do not keep the crystal's pattern: topic 3.8 draws them apart and scattered. Misses:
  - 2: "Count the ions each formula unit gives. Is the number different for the two salts?"
  - 3: "The signs of ΔH° and ΔS° are separate questions: topic 9.3 had all four combinations of the two."
  - 4: "Dissolved ions are spread through the water, apart from one another (topic 3.8). They do not keep the pattern of the crystal."
- **Check 4**, `<Check answer={2}>`: "Anhydrous magnesium sulfate warms water as it dissolves: ΔH° = −91.3 kJ/mol and ΔS° = −209.6 J/(mol·K). At 298 K, which describes the two terms of ΔG° = ΔH° − TΔS°?" Options:
  1. Both work for the dissolving: ΔH° and −TΔS° are both negative
  2. ΔH° works for the dissolving, and −TΔS° is positive and works against it
  3. ΔH° works against the dissolving, and −TΔS° is negative and works for it
  4. Both work against the dissolving: ΔH° and −TΔS° are both positive

  Why: ΔH° is negative, so the enthalpy term pulls ΔG° down: it works for the dissolving. ΔS° is negative, so −TΔS° is minus a negative number, which is positive: −(298)(−0.2096) = +62.5 kJ/mol (the entropy converted to kilojoules first, on its own line). The entropy term works against the dissolving. Here enthalpy wins: ΔG° = −91.3 + 62.5 = −28.8 kJ/mol. This is potassium nitrate turned around: there the entropy term outweighed a positive ΔH°. Misses:
  - 1: "ΔS° is negative here. Write −TΔS° with the minus signs showing and work out the sign of the whole term."
  - 3: "A negative ΔH° lowers ΔG°. Does lowering ΔG° work for a change or against it?"
  - 4: "The water warms, so the dissolving releases energy. What sign does that give ΔH°, and what does that do to ΔG°?"

  Note for the writer: keep "anhydrous". The hydrated crystals sold as Epsom salt cool the water instead. With both signs negative, topic 9.3 says the change is favored at low temperature; the lesson may say in one clause that heating works against this dissolving, but gives no solubility figures for magnesium sulfate (its real curve is complicated by hydrates).
- **Section "K_sp and ΔG° are one statement":**
  - The dissolving equation of a salt has an equilibrium constant, and topic 7.11 named it: K_sp. Topic 9.5 ties any K to a ΔG°. So for a salt, ΔG° of dissolving = −RT ln K_sp. A sparingly soluble salt has a K_sp far below 1 and therefore a large positive ΔG° of dissolving: the two are the same fact. The more positive ΔG° is, the smaller K_sp is.
  - This lets you take a K_sp apart. K_sp gives ΔG°; a calorimeter or a table gives ΔH°; the difference is TΔS°.
- **Worked example 2, "What keeps silver iodide out of solution":** topic 7.11 gave K_sp = 8.52 × 10⁻¹⁷ for silver iodide at 25 °C:

  $\ce{AgI(s) <=> Ag^+(aq) + I^-(aq)}$

  ΔH° for this dissolving is +112.2 kJ/mol. Find ΔG° at 298 K, then TΔS° and ΔS°, and say which term keeps silver iodide from dissolving.
  1. **Predict the sign.** K_sp is far below 1, so ΔG° is positive and large.
  2. **Find ΔG°.** Display, split, numbers only: ΔG° = −(8.314)(298) ln(8.52 × 10⁻¹⁷) = −(2,477.6)(−37.00) = +91,670 J/mol.
  3. **Convert.** +91,670 J/mol = +91.7 kJ/mol (a line of its own).
  4. **Find the entropy term.** Rearranged, TΔS° = ΔH° − ΔG° = 112.2 − 91.7 = +20.5 kJ/mol.
  5. **Find ΔS°.** ΔS° = 20.5 ÷ 298 = +0.0688 kJ/(mol·K), which is +69 J/(mol·K) (the conversion on a line of its own).
  6. **Read it.** The entropy change is positive: entropy works for this dissolving, to the amount of 20.5 kJ/mol. The enthalpy change works against it, and at +112.2 kJ/mol it is more than five times as large. Silver iodide stays out of solution because pulling Ag⁺ and I⁻ apart costs far more energy than their attraction to water gives back, not because of entropy.

  Note for the writer: the table values give ΔS° = +68.5 J/(mol·K) and, by ΔH° − TΔS°, ΔG° = +91.8; from free energies of formation ΔG° = +91.7; from K_sp +91.7. The lesson reports +91.7 and +69. Do not print the formation values.
- **Check 5**, `<Check numeric="56.8" unit="kJ/mol">`: "For barium sulfate dissolving, BaSO₄(s) ⇌ Ba²⁺(aq) + SO₄²⁻(aq) (display), ΔH° = +26.3 kJ/mol and ΔS° = −102.5 J/(mol·K). What is ΔG° of the dissolving at 298 K, in kJ/mol, with its sign?" Why: convert the entropy change first: −102.5 J/(mol·K) = −0.1025 kJ/(mol·K). The entropy term is TΔS° = (298)(−0.1025) = −30.5 kJ/mol. Then ΔG° = 26.3 − (−30.5) = +56.8 kJ/mol (each line in display math, numbers only). Both terms work against this dissolving. Topic 7.11's K_sp for barium sulfate, 1.08 × 10⁻¹⁰, gives the same thing by the other route: −RT ln K_sp = +56.9 kJ/mol. The two agree to the last figure of the data. Slips:
  - `-56.8` (the sign reversed): "Look at the sign of each term: ΔH° as given, and −TΔS° when ΔS° is negative. What sign must their sum have?"
  - `-4.24` (the entropy term subtracted as if ΔS° were positive): "Did the minus sign of ΔS° get lost? Subtracting a negative TΔS° adds to ΔH°."
  - `30570` (the entropy term left in joules): "Did the entropy term stay in joules? Change ΔS° to kJ/(mol·K) before you multiply by T."
  - `-30520` (the entropy term in joules, and its sign lost): "Two things to check: ΔS° must be in kJ/(mol·K) before it meets ΔH°, and it is negative."
  - `28.9` (25 used for T): "Did you use 25 for the temperature? T in this equation is in kelvins."

  Note for the writer: the answer is positive, so `numeric` carries no sign; the grader accepts "+56.8" and "56.8". The question still says "with its sign", and −56.8 is a slip.
- **Check 6**, `<Check answer={3}>`: "Thallium(I) chloride and silver iodide each give one cation and one anion. At 25 °C, ΔG° of dissolving is +21.3 kJ/mol for thallium(I) chloride and +91.7 kJ/mol for silver iodide. Without a calculator, how do their K_sp values compare?" Options:
  1. Silver iodide's is larger, by about 12 factors of ten
  2. Thallium(I) chloride's is larger, by about 4 times
  3. Thallium(I) chloride's is larger, by about 12 factors of ten
  4. Thallium(I) chloride's is larger, by about 70 factors of ten

  Why: the more positive ΔG° is, the smaller K_sp is, so thallium(I) chloride has the larger K_sp. The two values of ΔG° differ by 91.7 − 21.3 = 70.4 kJ/mol, and at 298 K each 5.70 kJ/mol is a factor of ten (topic 9.5): 70.4 ÷ 5.70 = 12.4 (display). Topic 7.11's table agrees: 1.86 × 10⁻⁴ against 8.52 × 10⁻¹⁷ is a ratio of about 2 × 10¹². Dividing one ΔG° by the other (91.7 ÷ 21.3 = 4.3) means nothing, because ΔG° goes with ln K: differences in ΔG° become ratios of K. And 70 is the number of kilojoules, not the number of factors of ten. Misses:
  - 1: "The more positive ΔG° is, the further below 1 the K lies. Which of the two salts has the more positive ΔG°?"
  - 2: "ΔG° goes with ln K, so a difference in ΔG° becomes a ratio of K values. Dividing one ΔG° by the other tells you nothing."
  - 4: "70.4 kJ/mol is the difference in ΔG°. How many kilojoules go with each factor of ten in K at 298 K?"
- **A closing paragraph of the section, "What a negative ΔG° means for a salt":** for a salt that gives one cation and one anion, K_sp = 1 would mean a saturated solution that is 1 M in each ion. So ΔG° of dissolving below zero does not mean "dissolves" and above zero "does not dissolve": every salt dissolves until Q reaches K_sp (topic 7.11), and ΔG° tells how far that is. Thallium(I) chloride, at +21.3 kJ/mol, still puts about 0.014 mol into a liter. One more sentence, the only mention of Unit 8: how the acidity of the water changes a salt's solubility is topic 8.11, the other half of the story of solubility.
- **Trap:** **"It takes energy in, so it should not dissolve"** (the entropy term can outweigh a positive ΔH°: potassium nitrate, xylitol). **"Dissolving always raises the entropy"** (the ions gain room, but water held around small or highly charged ions loses freedom, and the total can be negative: magnesium sulfate, barium sulfate). **Losing the double minus in −TΔS°** when ΔS° is negative (the term is then positive and works against the change). **Leaving ΔS° in joules** beside a ΔH° in kilojoules. **Predicting solubility from part 1 alone**, or from the charges alone (parts 1 and 3 grow together and nearly cancel). **Dividing two ΔG° values to compare two K_sp values** (differences in ΔG° become ratios of K: 5.7 kJ/mol for each factor of ten at 298 K). **Reading a positive ΔG° of dissolving as "nothing dissolves"** (it means K_sp is below 1).
- **Key points:** dissolving a salt is three changes: the ions leave the crystal (enthalpy +, entropy +), the water makes room (enthalpy +, small; entropy −), and ions and water attract (enthalpy −; entropy −, from the water held around each ion); the totals are what is left when large parts of opposite sign nearly cancel, so a salt's formula does not settle whether it dissolves, and a question gives data or asks about one part; an endothermic dissolving goes when ΔS° is positive and TΔS° is larger than ΔH°, as for potassium nitrate; small or highly charged ions hold water firmly, which can make ΔS° of dissolving negative, as for magnesium sulfate and barium sulfate; ΔG° of dissolving = ΔH° − TΔS° = −RT ln K_sp, so a small K_sp and a large positive ΔG° are one statement; with K_sp and ΔH° known, TΔS° = ΔH° − ΔG° shows which term keeps a salt out of solution.

**Figures**

- **`9-6-three-changes.svg`** (viewBox 0 0 480 270, font-size 18). Three boxes in a row, each 140 wide and 150 tall, with ink outlines and no fill: x = 15 to 155, 170 to 310 and 325 to 465; y = 44 to 194. Cations are small dark circles (ink fill); anions are larger pale circles (light accent fill, ink outline), as in lesson 3.8. A water molecule is one shaded circle for oxygen (radius 8, glass fill `#E6E1D8`, ink outline) with two small open circles for hydrogen (radius 4.5, background fill, ink outline). **For a water molecule with its oxygen at (x, y) and direction φ, the two hydrogens are centered at (x + 11 cos(φ + 52°), y + 11 sin(φ + 52°)) and (x + 11 cos(φ − 52°), y + 11 sin(φ − 52°))**, with y measured downward as in SVG. The hydrogens are drawn first and the oxygen over them.
  - Titles, centered above the boxes at y = 30 (x = 85, 240, 395): "1. Ions part", "2. Water moves", "3. Both attract".
  - **Box 1:** a block of six touching ions in two rows of three, cations (radius 9) and anions (radius 13) alternating: top row at y = 142, anion at x = 45, cation at x = 67, anion at x = 89; bottom row at y = 164, cation at x = 45, anion at x = 67, cation at x = 89. Two ions that have left the block: an anion at (52, 84) and a cation at (122, 76). Two short arrows in the accent color, each from near the block to near a freed ion: from (48, 124) to (51, 102), and from (96, 126) to (114, 88). Counts: 4 cations and 4 anions (3 and 3 in the block, 1 and 1 free).
  - **Box 2:** a dashed circle (radius 14, secondary color, no fill) at the center (240, 119), marking the room being made for an ion. Six water molecules around it, pointing in mixed directions:

    | Oxygen at | (284.0, 119.0) | (262.0, 157.1) | (218.0, 157.1) | (196.0, 119.0) | (218.0, 80.9) | (262.0, 80.9) |
    |---|---|---|---|---|---|---|
    | φ | 200° | 100° | 350° | 250° | 130° | 30° |

  - **Box 3:** a cation (radius 12) at the center (395, 119). Six water molecules around it, each with its oxygen toward the ion and its hydrogens away (φ equal to the angle of the oxygen's position as seen from the ion):

    | Oxygen at | (429.6, 139.0) | (395.0, 159.0) | (360.4, 139.0) | (360.4, 99.0) | (395.0, 79.0) | (429.6, 99.0) |
    |---|---|---|---|---|---|---|
    | φ | 30° | 90° | 150° | 210° | 270° | 330° |

    A dotted line in the secondary color from the edge of the ion to the edge of each oxygen (six lines, each 20 units long).
  - Under the boxes, two lines each, centered: at y = 220 "enthalpy: +", "enthalpy: +", "enthalpy: −"; at y = 248 "entropy: +", "entropy: −", "entropy: −".
  - Text in the figure, nine pieces: the three titles and the six lines of signs.
  - Alt: "Three boxes in a row. Box 1, titled Ions part: a block of six touching ions, three small dark cations and three larger pale anions alternating, with one more cation and one more anion moving away from it. Under it: enthalpy plus, entropy plus. Box 2, titled Water moves: six water molecules pointing in different directions around an empty dashed circle. Under it: enthalpy plus, entropy minus. Box 3, titled Both attract: one cation with six water molecules around it, each with its oxygen atom turned toward the ion. Under it: enthalpy minus, entropy minus."
  - Caption: "The three changes in dissolving a salt, each with the sign of its enthalpy change and of its entropy change. Boxes 2 and 3 show a cation; around an anion the water molecules turn their hydrogen atoms inward. Shaded circles are oxygen atoms and small open circles are hydrogen atoms."
- **`9-6-water-around-an-ion.svg`** (viewBox 0 0 480 290, font-size 18). Two panels, each 220 wide, with no outline. Water molecules are drawn by the same rule as in the first figure.
  - Titles at y = 30: "around a 2+ ion" centered at x = 120, "on their own" centered at x = 360.
  - **Left panel:** a cation (radius 15, ink fill) at (120, 140) with "2+" in the background color centered on it. Six water molecules, oxygen toward the ion:

    | Oxygen at | (163.3, 165.0) | (120.0, 190.0) | (76.7, 165.0) | (76.7, 115.0) | (120.0, 90.0) | (163.3, 115.0) |
    |---|---|---|---|---|---|---|
    | φ | 30° | 90° | 150° | 210° | 270° | 330° |

    A dotted line from the edge of the ion to the edge of each oxygen (six lines, each 27 units long).
  - **Right panel:** six water molecules with no ion, at uneven places and pointing every way:

    | Oxygen at | (318, 96) | (372, 84) | (408, 124) | (392, 186) | (334, 192) | (310, 146) |
    |---|---|---|---|---|---|---|
    | φ | 40° | 200° | 300° | 120° | 250° | 170° |

  - Under the panels at y = 268: "held in place" centered at x = 120, "free to turn and move" centered at x = 360.
  - Text in the figure, five pieces: the two titles, "2+", and the two lines beneath.
  - Alt: "Two groups of six water molecules. On the left, the six surround an ion labeled 2+, and every one has its oxygen atom turned toward the ion; a dotted line joins each to the ion. The words beneath read held in place. On the right, six water molecules with no ion lie at uneven distances and point in six different directions. The words beneath read free to turn and move."
  - Caption: "Six water molecules next to a small ion with a charge of 2+, and six on their own. The ion holds its neighbors turned toward it, which leaves them far fewer ways to be arranged. Shaded circles are oxygen atoms and small open circles are hydrogen atoms."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| R; RT at 298 K; RT ln 10 | 8.314 J/(mol·K); 2,477.6 J/mol; 5.70 kJ/mol | the equation page; computed |
| KNO₃(s) → K⁺(aq) + NO₃⁻(aq): ΔH°; ΔS° | +34.8 kJ/mol; +115.8 J/(mol·K) | the unit's table (ΔH°f −494.6, −252.4, −207.4; S° 133.1, 102.5, 146.4); fairly sure (measured ΔH° runs from 34.8 to 34.9) |
| The same: ΔG° at 298 K | +0.3 kJ/mol by both routes (ΔG°f −394.9, −283.3, −111.3) | computed; **not printed in the lesson** |
| Solubility of KNO₃ in 100 g of water | about 13 g at 0 °C; about 38 g at 25 °C; about 246 g at 100 °C | from memory of the standard solubility curve; sure of 38, fairly sure of the others **(verify)** |
| Molar mass of KNO₃ | 101.11 g/mol (K 39.10, N 14.01, O 16.00) | `src/data/elements.ts`; used for "close to 3.8 mol" |
| AgI(s) → Ag⁺(aq) + I⁻(aq): K_sp; ΔH°; ΔS°; ΔG° | 8.52 × 10⁻¹⁷ (lesson 7.11); +112.2 kJ/mol; +68.5 J/(mol·K); +91.7 kJ/mol | the unit's table (ΔH°f −61.8, +105.6, −55.2; S° 115.5, 72.7, 111.3; ΔG°f −66.2, +77.1, −51.6); sure. K_sp gives +91.7, formation values +91.7, ΔH° − TΔS° +91.8 |
| BaSO₄(s) → Ba²⁺(aq) + SO₄²⁻(aq): K_sp; ΔH°; ΔS°; ΔG° | 1.08 × 10⁻¹⁰ (lesson 7.11); +26.3 kJ/mol; −102.5 J/(mol·K); +56.8 kJ/mol | the unit's table (ΔH°f −1,473.2, −537.6, −909.3; S° 132.2, 9.6, 20.1; ΔG°f −1,362.2, −560.8, −744.5); fairly sure. ΔH° − TΔS° gives +56.8 (the Check's answer), formation values +56.9, K_sp +56.9 |
| MgSO₄(s) → Mg²⁺(aq) + SO₄²⁻(aq): ΔH°; ΔS°; ΔG° | −91.3 kJ/mol; −209.6 J/(mol·K); −28.8 kJ/mol | the unit's table (ΔH°f −1,284.9, −466.9, −909.3; S° 91.6, −138.1, 20.1; ΔG°f −1,170.6, −454.8, −744.5); fairly sure, and the lesson table asks for the entropy to be checked **(verify)**. ΔH° − TΔS° gives −28.8 (reported), formation values −28.7 |
| LiCl(s) → Li⁺(aq) + Cl⁻(aq): ΔH° | −37.1 kJ/mol | the unit's table (ΔH°f −408.6, −278.5, −167.2); sure |
| TlCl: K_sp; ΔG° of dissolving; molar solubility | 1.86 × 10⁻⁴ (lesson 7.11); +21.3 kJ/mol; 0.014 M | computed from K_sp (lesson 7.11 has 3.27 g/L, which is 0.0136 M) |
| Ionic radii of Ba²⁺ and K⁺ | about 135 pm and 138 pm | from memory; sure that they are nearly equal; **not printed** |
| Xylitol | dissolving is endothermic; no number | lesson 6.1 |
| Saltpeter used to chill wine in Rome in the 1500s | described in a book printed in Rome in 1550 | from memory **(verify)** |

**Check script:** `scratchpad/unit9/checks/9-6.py`.

**Notes for the writer**

- Never "spontaneous", never "favorable" or "unfavorable" for a process, never "disorder" or "ordered". Water held around an ion "has fewer ways to be arranged" or "loses freedom to turn and move". The two terms of the equation "work for" or "work against" the dissolving.
- Do not print the S° of any dissolved ion. (The table value for Mg²⁺(aq) is negative, because ions are measured against H⁺(aq), and explaining that is outside the lesson.) Print only ΔH° and ΔS° of each dissolving.
- Do not print a ΔG° or a K for potassium nitrate, lithium chloride or xylitol. The only ΔG° values of dissolving in the lesson are silver iodide's (+91.7), barium sulfate's (+56.8, with +56.9 from K_sp), thallium(I) chloride's (+21.3) and magnesium sulfate's (−28.8, in a Why).
- Do not rule on whether dissolving a salt is a physical or a chemical change.
- No lattice energy and no hydration energy as a number. "Many hundreds of kilojoules per mole, sometimes thousands" is as far as the lesson goes.
- Unit 8 is named once, in the closing paragraph, as topic 8.11. Do not use the word pH.
- The Checks are numbered in page order: 1 (choice, charges), 2 (choice, xylitol), 3 (choice, the negative ΔS°), 4 (choice, the two terms), 5 (typed, barium sulfate), 6 (choice, two K_sp values).

**Reactions, substances and scenarios used:** saltpeter (potassium nitrate) stirred into a tub of water to chill wine in Rome in the 1500s (opening); the three parts of dissolving a salt, with a table of signs; barium sulfate against potassium nitrate, charges 2+ and 2− against 1+ and 1− (Check 1); potassium nitrate dissolving, ΔH° = +34.8 kJ/mol, about 380 g per kilogram of water at 25 °C, the K of 7.9 × 10⁻⁷ and 8.9 × 10⁻⁴ M it would have with no entropy change, ΔS° = +115.8 J/(mol·K), TΔS° = 34.5 kJ/mol (worked example 1), and its solubility at 0, 25 and 100 °C; the xylitol of topic 6.1 (Check 2); water held around Mg²⁺; magnesium sulfate, anhydrous, ΔH° = −91.3 kJ/mol and ΔS° = −209.6 J/(mol·K), ΔG° = −28.8 kJ/mol (table, Checks 3 and 4); lithium chloride, ΔH° = −37.1 kJ/mol (one sentence); silver iodide, K_sp = 8.52 × 10⁻¹⁷, ΔG° = +91.7, ΔH° = +112.2, TΔS° = +20.5 kJ/mol, ΔS° = +69 J/(mol·K) (worked example 2); barium sulfate, ΔH° = +26.3 kJ/mol, ΔS° = −102.5 J/(mol·K), ΔG° = +56.8 kJ/mol (Check 5); thallium(I) chloride at +21.3 kJ/mol against silver iodide at +91.7 (Check 6). Figures: the two the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out".
- [ ] Commit (`feat(lessons): add 9.6 Free Energy of Dissolution`).

**Check script:** `scratchpad/unit9/checks/9-6.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.6 Free Energy of Dissolution`).

### Task 7: Lesson 9.7, Coupled Reactions

**Files:**
- Create: `src/content/lessons/unit-9/9-7-coupled-reactions.mdx`
- Create: `public/figures/9-7-shared-sulfur.svg`

**Brief**

- **Front matter:** `topic: "9.7"`, `minutes: 14`, summary: "How an unfavored reaction is made to happen, by energy from outside or by a favored reaction that shares a substance with it, and why free energies add when equations add." (No colon in the summary.)
- **Framework (9.7, two statements):** (1) an outside source of energy can make a thermodynamically unfavored process happen: electrical energy driving an electrolytic cell or charging a battery, and light driving the making of glucose from carbon dioxide in photosynthesis. (2) A wanted product can also be made by coupling an unfavored reaction to a favored one, as living things do with the change of ATP to ADP. The coupled reactions share one or more intermediates, and their sum is an overall reaction that gives the wanted product and has ΔG° < 0. The objective is to explain how an outside source of energy or a coupled reaction drives an unfavored process. **What this lesson does not do:** how an electrolytic cell is built and where each product forms is topic 9.8's (named, not explained); the structure of ATP and the concentrations inside a cell are left out; ΔG° from formation values is topic 9.3's and K from ΔG° is topic 9.5's (both used); adding equations is topic 6.9's and multiplying their K values topic 7.6's (both named). **Equation sheet:** nothing new. No line of the sheet says that ΔG° values add when equations add.
- **Opening:** most of the copper in the wiring of a house was, at one stage of its making, a dark gray solid: copper(I) sulfide, Cu₂S. Sealed in a vessel and left to itself, copper(I) sulfide stays copper(I) sulfide. In a smelter, air is blown through it, and copper metal collects at the bottom of the furnace. This lesson is about what the air does. Note for the writer: this is the "converting" step of a copper smelter, run at about 1,200 °C with the sulfide molten **(verify)**; in the opening give no temperature and no ΔG°, and do not say "ore" (most copper ore is a copper iron sulfide, and Cu₂S is what the smelter has made of it by this stage).
- **Section "Unfavored, on its own":**
  - The change the smelter wants (display):

    $\ce{Cu2S(s) -> 2Cu(s) + S(s)}$

    At 25 °C, ΔG° = +86.2 kJ/mol_rxn: thermodynamically unfavored (topic 9.3). All three substances are pure solids, so there is no K to write (topic 9.5), and the sign says it all: it is the reverse change that is favored. Copper and sulfur combine, and copper(I) sulfide does not come apart.
  - There are two ways to get the copper anyway. One brings in energy from outside. The other brings in a second reaction.
- **Section "Energy from outside":**
  - **Electricity.** A current from a power supply can push a reaction in its unfavored direction. The device is an electrolytic cell, and topic 9.8 builds one. Charging a battery is the same thing: the charger runs the battery's own favored reaction backward.
  - **Light.** A green leaf makes glucose and oxygen from carbon dioxide and water, a change that is unfavored by a wide margin. It goes only while light falls on the leaf: this is photosynthesis.
  - What these have in common: the energy comes from a source that is not one of the reacting substances, and the change goes only while the source is on. The reaction's ΔG° is not altered. It is still unfavored, which is why a charged battery can give the energy back.
  - Note for the writer: give no ΔG° for photosynthesis and no equation for it. Do not use the electrolysis of water as an example. The words "electrolytic cell" are defined in topic 9.8; here one clause is enough ("a device that uses a current to drive an unfavored reaction").
- **Section "A favored partner":**
  - Back to the furnace. The oxygen of the air reacts with sulfur in a strongly favored reaction (display):

    $\ce{S(s) + O2(g) -> SO2(g)}$

    with ΔG° = −300.1 kJ/mol_rxn at 25 °C.
  - Topic 6.9 added equations and their ΔH° values; topic 7.6 added equations and multiplied their K values. Free energy behaves like enthalpy: **when equations are added, their ΔG° values are added.** (Topic 9.5 shows that the two rules are one: ΔG° goes with ln K, and adding logarithms is multiplying the numbers.)
- **Worked example 1, "Copper, with air":** find ΔG° at 25 °C for the reaction that takes place when air meets copper(I) sulfide, and say whether it is favored.
  1. **Write the two equations with their values.** Cu₂S(s) → 2Cu(s) + S(s), ΔG° = +86.2 kJ/mol_rxn. S(s) + O₂(g) → SO₂(g), ΔG° = −300.1 kJ/mol_rxn. (Each as a display with its value on a second line, as lesson 6.9 sets out its steps.)
  2. **Find what they share.** Sulfur is a product of the first and a reactant of the second, one mole in each.
  3. **Add the equations.** The sulfur cancels. Display: Cu₂S(s) + O₂(g) → 2Cu(s) + SO₂(g). Check the atoms: 2 Cu, 1 S and 2 O on each side.
  4. **Add the values, signs included.** Display: +86.2 + (−300.1) = −213.9 kJ/mol_rxn.
  5. **Read it.** The sum is below zero: the overall reaction is thermodynamically favored. Unlike the first reaction, it has gases in it, so it has a K_p, and topic 9.5 gives its size. Each 5.7 kJ/mol is a factor of ten, and 213.9 ÷ 5.7 = 37.5 factors of ten: K_p is between 10³⁷ and 10³⁸. At equilibrium the gas over the solids would be sulfur dioxide with almost no oxygen left in it.

  Then place the figure `9-7-shared-sulfur.svg`.
- **After the example, three short paragraphs:**
  - **What "share" means.** In the furnace no heap of sulfur forms and then burns. The sulfur atoms pass from copper to oxygen, and the two changes happen as one reaction. That is what **coupling** means: an unfavored reaction and a favored one joined through a substance that one of them makes and the other uses, so that they go as a single overall reaction. (Bold "coupling" or "coupled reactions" here, at first use, with this definition in the same sentence.)
  - **Why the shared substance is needed.** Burning a pile of sulfur in the next room would do nothing for the copper(I) sulfide, however favored the burning is. Two reactions with no substance in common are two separate reactions, and adding their ΔG° values is arithmetic with no chemistry behind it. Only when the sulfur that leaves the copper is the same sulfur that the oxygen takes does the sum describe something that happens.
  - **Nothing is cheated.** The overall reaction, the one that really takes place, has ΔG° below zero. The unfavored step did not become favored: the total did.
  - One sentence, as a hedge to keep: these values are for 25 °C; the smelter runs its furnace hot because at 25 °C the favored overall reaction would be far too slow (topic 9.4), and the overall reaction is favored at both temperatures.
  - `<KeyIdea>`: an unfavored reaction can be driven by a favored one when two things are true: the two share a substance that one makes and the other uses, and their ΔG° values add up to less than zero.
- **Check 1**, `<Check numeric="-249.5" unit="kJ/mol">`: "Mercury is made by heating the red mineral cinnabar, mercury(II) sulfide, in a stream of air. Think of it as two reactions, with their values at 25 °C: (display) $\ce{HgS(s) -> Hg(l) + S(s)}$, ΔG° = +50.6 kJ/mol_rxn; (display) $\ce{S(s) + O2(g) -> SO2(g)}$, ΔG° = −300.1 kJ/mol_rxn. What is ΔG° for the overall reaction, HgS(s) + O₂(g) → Hg(l) + SO₂(g), in kJ/mol, with its sign?" Why: sulfur is made by the first equation and used by the second, so it cancels when they are added, and the sum is the overall equation. Add the values with their signs: +50.6 + (−300.1) = −249.5 kJ/mol_rxn (display). The overall reaction is favored: the oxygen takes the sulfur, and the mercury is left as the metal. Slips:
  - `249.5` (the sign reversed or left off): "Check the sign of the sum. Add +50.6 and −300.1 with their signs."
  - `-350.7` (both values taken as negative): "Did both values go in as negative? The first reaction is unfavored: its ΔG° is +50.6 kJ/mol."
  - `350.7` (the second value subtracted): "Did you subtract the second value? When equations are added, their ΔG° values are added, signs included."

  Note for the writer: this is how mercury is really made from cinnabar (roasted in air at several hundred degrees Celsius, the mercury leaving as vapor **(verify)**); the question gives no temperature and values for 25 °C, where mercury is a liquid. The question does not name the shared substance: finding it is part of the work. The first equation has only pure solids and a pure liquid, so it has no K: do not give one for it.
- **Check 2**, `<Check answer={1}>`: "Titanium metal is made from titanium(IV) chloride, TiCl₄, a liquid. On its own, at 25 °C: (display) $\ce{TiCl4(l) -> Ti(s) + 2Cl2(g)}$, ΔG° = +737.2 kJ/mol_rxn. Here are four favored reactions, each with its ΔG° at 25 °C in kJ/mol_rxn (a lettered list of four displays, each with its value): A. 4Na(s) + 2Cl₂(g) → 4NaCl(s), −1,536.4. B. S(s) + O₂(g) → SO₂(g), −300.1. C. 2H₂(g) + 2Cl₂(g) → 4HCl(g), −381.2. D. 4Al(s) + 3O₂(g) → 2Al₂O₃(s), −3,164.6. Which one, run in the same vessel, could drive the making of titanium?" Options:
  1. Reaction A
  2. Reaction B
  3. Reaction C
  4. Reaction D

  Why: test each for the two conditions. A uses the chlorine that the first reaction makes, two moles for two moles, and the sum is +737.2 + (−1,536.4) = −799.2 kJ/mol_rxn: favored. This is a real process: TiCl₄ + 4Na → Ti + 4NaCl made titanium for decades. B is the reaction that freed the copper, and here it is no use: it shares nothing with the first reaction, and its ΔG° is too small anyway. C does use chlorine, but the sum is +737.2 + (−381.2) = +356.0 kJ/mol_rxn, still above zero. D is by far the most favored of the four, and it is no help at all: nothing the first reaction makes is used by it. Misses:
  - 2: "Try both tests on B: does it use something the first reaction makes, and is the sum of the two ΔG° values below zero?"
  - 3: "Reaction C does use up chlorine. Now add the two ΔG° values, signs included. What sign has the sum?"
  - 4: "With D the sum is far below zero. But which product of the first reaction would D use up?"

  Note for the writer: sodium with TiCl₄ is the Hunter process **(verify the name; do not print it)**; most titanium today is made with magnesium in its place, which the lesson does not mention. The four options are "Reaction A" to "Reaction D" because an option may not be an equation alone.
- **Section "Coupling in a living cell":**
  - Cells have to build molecules whose formation is unfavored, at one temperature, with no furnace. They do it by coupling, and the favored partner is nearly always the same one: the reaction of **ATP** (adenosine triphosphate) with water, which gives ADP (adenosine diphosphate) and a phosphate ion. Its ΔG° is −30.5 kJ/mol.
  - ATP is not "energy stored in a bond". Breaking any bond takes energy in (topic 6.7). What counts is ATP's whole reaction with water, the bonds broken and the bonds made together. Its ΔG° of −30.5 kJ/mol is large enough to bring the sum below zero for any reaction that is unfavored by less than 30.5 kJ/mol, as long as the two can be made to share a substance.
  - A cell holds very little ATP, and a sprinting muscle would use all of its own within a few seconds **(verify)**. So the ADP has to be turned back into ATP all the time, and that reaction is the reverse of the one above. Reversing an equation changes the sign of its ΔG°, as it does for ΔH° (topic 6.9): making ATP from ADP and phosphate has ΔG° = +30.5 kJ/mol. It is unfavored, and it needs a favored partner of its own.
- **Worked example 2, "ATP for a sprint":** in the first seconds of a sprint, muscle remakes its ATP with the help of a compound it keeps in store, phosphocreatine. In words (display, as text):

  ADP + phosphate → ATP + H₂O, ΔG° = +30.5 kJ/mol

  phosphocreatine + H₂O → creatine + phosphate, ΔG° = −43.0 kJ/mol

  Both values are for a neutral solution at 25 °C, the conditions biochemists' tables use. Show that the two can be coupled, and find what they share.
  1. **Find what they share.** Phosphate is made by the second reaction and used by the first. (Water goes the other way: made by the first, used by the second.)
  2. **Add the equations.** Phosphate and water cancel: phosphocreatine + ADP → creatine + ATP.
  3. **Add the values, signs included.** Display: +30.5 + (−43.0) = −12.5 kJ/mol. Below zero: the overall reaction is favored.
  4. **Look at how the cell does it.** If the two reactions simply ran side by side in the same water, the phosphocreatine would react with water, its phosphate would drift away, and the ADP would stay ADP. An enzyme (topic 5.11) holds phosphocreatine and ADP together, and the phosphate group passes straight from one to the other. No free phosphate ion appears along the way. The phosphate group is what the two reactions share.
  5. **Read it.** In topic 9.5's terms, K for making ATP goes from about 4.5 × 10⁻⁶ alone (30.5 ÷ 5.7 = 5.35 factors of ten below 1) to about 160 when it is coupled (12.5 ÷ 5.7 = 2.2 factors of ten above 1).

  Note for the writer: write the equations in words, as text displays; give no structural formulas and no charges on ATP, ADP, phosphate, creatine or phosphocreatine. The enzyme is not named. Say "a neutral solution", not "pH 7" (pH is Unit 8's). Do not give a number of seconds for the sprint.
- **After the example, one short paragraph:** the ATP made this way is spent the way it was made. It does not react with water in the open, where its favored reaction would drive nothing. An enzyme joins it to the reaction it is to drive, through something the two share.
- **Check 3**, `<Check answer={4}>`: "Cells make the amino acid glutamine from glutamate and ammonia, a reaction that is unfavored when it is taken alone. ATP is used up as it goes, and along the way glutamate is found carrying a phosphate group. A classmate says: ATP powers the making of glutamine because energy is released when ATP's phosphate bond breaks. Which statement describes ATP's part correctly?" Options:
  1. Breaking ATP's bond releases energy, and glutamate takes that energy in
  2. ATP is a catalyst, and it brings ΔG° for making glutamine below zero
  3. ATP's reaction warms the cell until the unfavored reaction becomes favored
  4. ATP gives glutamate a phosphate group, so two reactions go as one

  Why: bond breaking never releases energy (topic 6.7), so the classmate's picture cannot be right, and neither can the first option. ATP is used up, so it is a reactant, not a catalyst; and a catalyst cannot change ΔG° (topic 9.4). A cell stays at one temperature, and nothing here depends on warming. What happens is a transfer in two steps. First ATP passes a phosphate group to glutamate. Then ammonia takes the place of the phosphate, and glutamine is left. The glutamate that carries the phosphate group is an intermediate (topic 5.7's word): it is made in the first step and used in the second, and it is the substance that ATP's favored reaction and the unfavored one share. The two go as a single route whose overall ΔG° is below zero. Misses:
  - 1: "Breaking a bond always takes energy in (topic 6.7). What makes the overall change favored must be something else."
  - 2: "A catalyst is not used up, and it changes how fast a reaction goes. Can it change ΔG° (topic 9.4)?"
  - 3: "A living cell stays at one temperature, so nothing here depends on warming. Notice that ATP is used up in the reaction."

  Note for the writer: glutamine appears only in this Check, with no ΔG°, so that the Check is not answered by the text above it. The glutamate carrying a phosphate group is glutamyl phosphate; the Why may name it once, with that gloss. "Intermediate" was defined in topic 5.7 for mechanisms; it is the framework's word here too.
- **Section "The smelter of topic 4.5":**
  - Two reactions that share a substance have passed one of the two tests. The other is the sum, and it has to be worked out each time. Topic 4.5 left a pair to try.
- **Check 4**, `<Check answer={2}>`: "Topic 4.5's smelter makes aluminum from aluminum oxide and carbon. Written for 25 °C, with solid aluminum, the overall equation is (display, split) $\ce{2Al2O3(s) + 3C(s) -> 4Al(s) + 3CO2(g)}$. It is the sum of two reactions that share oxygen: (display) $\ce{2Al2O3(s) -> 4Al(s) + 3O2(g)}$, ΔG° = +3,164.6 kJ/mol_rxn, and (display) $\ce{3C(s) + 3O2(g) -> 3CO2(g)}$, ΔG° = −1,183.2 kJ/mol_rxn. What follows?" Options:
  1. Burning carbon is favored, so with carbon present the overall reaction is favored
  2. Carbon cuts the energy that must come from outside, but not to zero
  3. The sum is above zero, so aluminum cannot be made from its oxide by any means
  4. A gas forms and the entropy rises, so the overall reaction must be favored

  Why: add the values: +3,164.6 + (−1,183.2) = +1,981.4 kJ/mol_rxn (display). The two reactions share oxygen, but the sum is far above zero, so the carbon cannot drive the reaction by itself. That is why topic 4.5 said that electricity drives the smelter: the energy comes from outside, through an electrolytic cell (topic 9.8). The carbon still earns its place: it lowers the least energy that must be supplied, at 25 °C, from 3,164.6 to 1,981.4 kJ for every 4 mol of aluminum. A positive ΔS° is real here, since a gas forms, but ΔG° already includes it, and ΔG° is positive. Misses:
  - 1: "A favored partner is one of two conditions. Add the two ΔG° values, signs included, and look at the sign of the sum."
  - 3: "Look at the words by any means. How many ways of making an unfavored change happen has this lesson described?"
  - 4: "A rise in entropy is one term of ΔG°, and ΔG° already includes it. Add the two ΔG° values given."

  Note for the writer: lesson 4.5 writes Al(l), because the smelter runs near 960 °C; this Check says "written for 25 °C, with solid aluminum" so that the formation values apply. The design promises that lesson 9.7 shows this equation's ΔG° to be "near +1,980 kJ at 25 °C, carbon and all": the Why does.
- **After Check 4, one sentence:** for some reactions no affordable partner brings the sum below zero. Then the energy has to come from outside after all, and a partner can still cut the amount.
- **Check 5**, `<Check answer={3}>`: "Each of these changes is thermodynamically unfavored when it is taken alone. Which one is made to happen by a source of energy from outside, and not by a coupled reaction?" Options:
  1. A cell links amino acids into a protein, with ATP reacting at each step
  2. Sodium takes the chlorine from TiCl₄ and leaves titanium metal
  3. Oxygen high in the atmosphere becomes ozone in ultraviolet light
  4. The sulfur of Cu₂S burns to SO₂ in a stream of air and leaves copper

  Why: for 3O₂(g) → 2O₃(g), ΔG° = +326.4 kJ/mol_rxn, and topic 9.3 showed it unfavored at every temperature (taking ΔH° and ΔS° as constant). No second reaction is involved: the energy arrives as ultraviolet light from the sun, a source outside the reacting substances. In each of the other three, a favored chemical reaction (ATP with water, sodium with chlorine, sulfur with oxygen) uses a substance that the unfavored change makes or hands on. Those are coupled reactions. Misses:
  - 1: "ATP reacting is a favored chemical reaction. Is that a partner reaction, or a source of energy outside the chemistry?"
  - 2: "Sodium combining with chlorine is itself a favored reaction, and it uses the chlorine. What is that arrangement called?"
  - 4: "Sulfur burning is a favored reaction, and it uses up a product of the first. What is that arrangement called?"

  Note for the writer: ozone does form from oxygen under ultraviolet light in the stratosphere. This is the only place ozone appears in the lesson, so that the Check is not answered by the text above it. Proteins are built with ATP used for each amino acid added; the option says no more than that.
- **Trap:** **Adding two ΔG° values for reactions that share nothing** (without a substance that one makes and the other uses, the sum describes no reaction). **Stopping at "the favored one is bigger"** (a full answer gives the sum, with its sign, and names the shared substance). **Calling a pair coupled when the sum is still positive** (the aluminum smelter: sharing oxygen was not enough). **Subtracting the values, or dropping a sign**, when the equations are added. **Saying the unfavored reaction "became favored"** (its own ΔG° is unchanged; the overall reaction is the favored one). **"ATP stores energy in a bond that releases it when broken"** (breaking a bond takes energy in; ATP's whole reaction with water is favored). **Confusing a coupled reaction with a catalyst** (the partner is used up and changes the overall ΔG°; a catalyst is not and does not). **Forgetting that favored is not fast** (the coupled reactions of industry are run hot for speed).
- **Key points:** an unfavored reaction (ΔG° > 0) does not go far toward its products on its own (with a large positive ΔG° it makes at most a trace), and there are two ways to make it happen: energy from outside, or a coupled reaction; outside sources are electricity (an electrolytic cell, charging a battery) and light (photosynthesis), and the change goes only while the source is on; when equations are added their ΔG° values are added, as ΔH° values are, while their K values multiply; two reactions are coupled when they share a substance that one makes and the other uses, and the coupling drives the unfavored one only if the sum of the ΔG° values is below zero; in living cells the favored partner is usually ATP reacting with water (ΔG° = −30.5 kJ/mol), which hands a phosphate group to the molecule being changed, and ATP is itself remade by coupling; the overall reaction always has ΔG° < 0, so nothing is cheated, and where no partner makes the sum negative, as in the aluminum smelter, energy must come from outside.

**Figures**

- **`9-7-shared-sulfur.svg`** (viewBox 0 0 480 440, font-size 18). The top third holds the two equations and their sum; below them, three bars to one scale.
  - **Equations.** A header, right-aligned at x = 450, y = 24, in the secondary color: "ΔG°, kJ/mol". Three lines of text, each starting at x = 30, with its value right-aligned at x = 450:
    - y = 56: "Cu₂S → 2Cu + S" and "+86.2";
    - y = 88: "S + O₂ → SO₂" and "−300.1";
    - a horizontal ink rule at y = 102 from x = 30 to x = 450;
    - y = 130: "Cu₂S + O₂ → 2Cu + SO₂" and "−213.9", both weight 600.

    The lone "S" at the end of the first line and the lone "S" at the start of the second line are each their own text element, so that a strike line in the accent color, 2 units thick, can be drawn through each from its left edge to its right edge at mid-height. Two strike lines in all. The S of "Cu₂S" and the S of "SO₂" are not struck. State symbols are left out of the figure for width; the caption gives them.
  - **Bars.** A zero line in ink at y = 250 from x = 70 to x = 430, with "0" at its left end (x = 56, y = 256). **Scale: 0.5 unit for each kJ.** Three bars, each 70 wide:

    | Bar | x | Value (kJ) | Length | Runs from y | to y | Fill |
    |---|---|---|---|---|---|---|
    | Cu₂S alone | 100 to 170 | +86.2 | 43.1 up | 250 | 206.9 | diagonal hatching, secondary color |
    | S + O₂ | 215 to 285 | −300.1 | 150.05 down | 250 | 400.05 | light accent, plain |
    | together | 330 to 400 | −213.9 | 106.95 down | 250 | 356.95 | accent, plain |

    All three have ink outlines. The value of each bar is written at its far end: "+86.2" centered at x = 135, y = 199; "−300.1" centered at x = 250, y = 422; "−213.9" centered at x = 365, y = 379. The name of each bar is written on the other side of the zero line from the bar: "Cu₂S alone" centered at x = 135, y = 274; "S + O₂" centered at x = 250, y = 240; "together" centered at x = 365, y = 240.
  - The three bars differ in fill pattern and in direction, not in color alone: the unfavored one is hatched and points up; the two favored ones point down.
  - Text in the figure, fourteen pieces: the header; three equations (the two struck "S" are parts of their lines); three values beside the equations; "0"; three values at the bars; three bar names.
  - Alt: "Two equations stacked, with the free energy change of each at the right. Cu₂S gives 2 Cu plus S, plus 86.2 kilojoules per mole. S plus O₂ gives SO₂, minus 300.1. The S is struck through in both. Under a line, their sum: Cu₂S plus O₂ gives 2 Cu plus SO₂, minus 213.9. Below, three bars drawn to one scale from a zero line: a short hatched bar rising to plus 86.2, a long bar falling to minus 300.1, and a shorter bar falling to minus 213.9, labeled together."
  - Caption: "Cu₂S(s) → 2Cu(s) + S(s) is unfavored, and S(s) + O₂(g) → SO₂(g) is favored by more. The sulfur that one makes the other uses, so the equations add, and so do their free energy changes. Values are for 25 °C."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| ΔG°f of Cu₂S(s) | −86.2 kJ/mol | the unit's table; fairly sure |
| ΔG°f of SO₂(g); CO₂(g) | −300.1; −394.4 kJ/mol | the unit's table; sure |
| ΔG°f of HgS(s, red, cinnabar) | −50.6 kJ/mol | **not in the unit's table**; from memory of standard tables (with ΔH°f −58.2); fairly sure **(verify)** |
| ΔG°f of TiCl₄(l) | −737.2 kJ/mol | the unit's table; fairly sure |
| ΔG°f of Al₂O₃(s) | −1,582.3 kJ/mol | the unit's table; sure |
| ΔG°f of NaCl(s) | −384.1 kJ/mol | **not in the unit's table**; from memory of standard tables; sure (the first fact-check confirmed it) |
| ΔG°f of HCl(g) | −95.3 kJ/mol | the unit's table (lesson 9.3's substance, same value); sure |
| ΔG°f of O₃(g) | +163.2 kJ/mol, so 3O₂ → 2O₃ is +326.4 | the unit's table and the design; sure |
| ΔG°f of every element in its standard state (Hg as the liquid) | 0 | by definition (topic 9.3) |
| Cu₂S → 2Cu + S; S + O₂ → SO₂; their sum | +86.2; −300.1; −213.9 kJ/mol_rxn | computed |
| The sum, Cu₂S + O₂ → 2Cu + SO₂: log K_p at 298 K | +37.5 (K_p between 10³⁷ and 10³⁸) | computed |
| HgS → Hg(l) + S; with S + O₂ → SO₂ | +50.6; a sum of −249.5 kJ/mol_rxn | computed |
| TiCl₄(l) → Ti + 2Cl₂; with 4Na + 2Cl₂ → 4NaCl; with 2H₂ + 2Cl₂ → 4HCl | +737.2; −1,536.4 and a sum of −799.2; −381.2 and a sum of +356.0 kJ/mol_rxn | computed |
| 2Al₂O₃ → 4Al + 3O₂; 3C + 3O₂ → 3CO₂; their sum | +3,164.6; −1,183.2; +1,981.4 kJ/mol_rxn | computed |
| ATP + H₂O → ADP + phosphate | −30.5 kJ/mol, neutral solution, 25 °C (so +30.5 reversed) | the value every source gives; sure |
| Phosphocreatine + H₂O → creatine + phosphate | −43.0 kJ/mol, neutral solution, 25 °C | from memory of biochemistry tables, which give −43.0 or −43.1; fairly sure **(verify)** |
| Phosphocreatine + ADP → creatine + ATP; K for making ATP alone and coupled, at 298 K | −12.5 kJ/mol; about 4.5 × 10⁻⁶ and about 160 | computed; biochemistry texts give −12.5 for this reaction |
| A muscle's own ATP lasts a few seconds of a sprint | no number printed | from memory **(verify)** |
| Temperatures of the real processes (none printed) | copper converting about 1,200 °C; cinnabar roasting several hundred °C; aluminum smelter near 960 °C | from memory **(verify)**; the lesson prints none of them |

No atomic mass is used in this lesson.

**Check script:** `scratchpad/unit9/checks/9-7.py`.

**Notes for the writer**

- Never "spontaneous", never "favorable" or "unfavorable" for a process: "thermodynamically favored" and "unfavored". The framework's own sentence uses another form of the word; the lesson does not.
- Do not write "energy currency", "high-energy bond" or "bookkeeping", and do not say that one reaction "pays for" another. Do not use glucose with phosphate as an example, or any made-up pair of reactions with round numbers.
- Do not bring in a metal oxide reduced with carbon as an example of coupling (a blast furnace, titanium dioxide with chlorine and carbon). The one oxide with carbon in the lesson is the aluminum smelter of Check 4, which is there because topic 4.5 promised it, and its point is that the coupling is not enough.
- Every value is for 25 °C, and the lesson says so where a real furnace is hot. Do not give a ΔG° at a furnace's temperature.
- No K for Cu₂S(s) → 2Cu(s) + S(s), for HgS(s) → Hg(l) + S(s), for the smelter's first reaction taken with solids only, or for any other reaction among pure solids and liquids alone. The K values in the lesson are for copper(I) sulfide with oxygen (gases take part) and for making ATP (solutes).
- The smelter stays a Check. Topic 9.8 says where the aluminum forms; this lesson says only that electricity must supply the energy.
- The Checks are numbered in page order: 1 (typed, mercury), 2 (choice, four partners), 3 (choice, ATP and glutamine), 4 (choice, the smelter), 5 (choice, outside energy).

**Reactions, substances and scenarios used:** copper(I) sulfide in a smelter's furnace with air blown through it (opening); Cu₂S(s) → 2Cu(s) + S(s), +86.2 kJ, no K; an electrolytic cell and the charging of a battery, named; photosynthesis, named with no number; S(s) + O₂(g) → SO₂(g), −300.1 kJ; their sum, −213.9 kJ, K_p between 10³⁷ and 10³⁸ (worked example 1 and the figure); mercury from cinnabar roasted in air, +50.6 and −300.1, sum −249.5 kJ (Check 1); TiCl₄(l) → Ti(s) + 2Cl₂(g), +737.2 kJ, with four candidate partners: sodium with chlorine (−1,536.4, sum −799.2), sulfur with oxygen (−300.1), hydrogen with chlorine (−381.2, sum +356.0), aluminum with oxygen (−3,164.6) (Check 2); ATP with water, −30.5 kJ; ATP remade from ADP and phosphate, +30.5 kJ, coupled to phosphocreatine with water, −43.0 kJ, sum −12.5 kJ, in a sprinting muscle (worked example 2); glutamine from glutamate and ammonia with ATP, by way of glutamate carrying a phosphate group, with no numbers (Check 3); the smelter of topic 4.5, +3,164.6 and −1,183.2, sum +1,981.4 kJ (Check 4); ozone from oxygen under ultraviolet light, +326.4 kJ, beside protein building with ATP (Check 5). Figure: the design's figure for this lesson, redrawn for copper(I) sulfide and sulfur and renamed `9-7-shared-sulfur.svg`.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out".
- [ ] Commit (`feat(lessons): add 9.7 Coupled Reactions`).

**Check script:** `scratchpad/unit9/checks/9-7.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.7 Coupled Reactions`).

---

## Group D: electrochemistry (pull request D)

Branch: `topic/unit-9-electrochemistry`, from `topic/unit-9-equilibrium-and-coupling`.

Lesson 9.9's brief holds the "Diagram data" of the galvanic cell explorer, which lesson 9.10 uses again. With all eleven lessons in, Unit 9 goes on `BALANCED_UNITS`, and the last task closes the unit out.

> **How these briefs were checked.** See section 11 of the design. The originality check had three Checks of lesson 9.10 replaced and wording changed in lessons 9.8, 9.9 and 9.11. The second check found no wrong number; one Check was answered by its own option and was changed, and six more worked states were added to the explorer's data so that every state lesson 9.10 quotes is a unit test.

### Task 8: Lesson 9.8, Galvanic (Voltaic) and Electrolytic Cells

**Files:**
- Create: `src/content/lessons/unit-9/9-8-galvanic-voltaic-and-electrolytic-cells.mdx`
- Create: `public/figures/9-8-galvanic-cell.svg`, `public/figures/9-8-two-surfaces.svg`, `public/figures/9-8-electrolytic-cell.svg`
- No interactive diagram. (The galvanic cell explorer belongs to lesson 9.9.)

**Brief**

- **Front matter:** `topic: "9.8"`, `minutes: 19`, summary: "How a galvanic cell makes a favored redox reaction push electrons through a wire, what each part of the cell does, and how an electrolytic cell uses a power supply to drive an unfavored reaction." (No colon in the summary.)
- **Framework (9.8, three statements and one exclusion):** (1) each part of an electrochemical cell (the electrodes, the solutions of the half-cells, the salt bridge, the device that measures voltage or current) has a job, and how a cell works (galvanic or electrolytic, the direction of the electrons, the reaction in each half-cell, an electrode's change in mass, a gas forming at an electrode, ions moving through the salt bridge) can be told at the level you see and at the level of particles. (2) A galvanic (voltaic) cell runs a thermodynamically favored reaction and an electrolytic cell a thermodynamically unfavored one, and a drawing of either is read for where each half-reaction happens and which way the current runs. (3) In every electrochemical cell, oxidation happens at the anode and reduction at the cathode. **Not assessed:** labeling an electrode as positive or negative. The objective is to explain how the parts of a cell relate to how it works. **What this lesson does not do:** no potentials and no volts as numbers (topic 9.9): every question here says which metal is oxidized or gives an observation that shows it. No concentrations (topic 9.10). No amounts from current and time (topic 9.11). Oxidation numbers and half-reactions are topics 4.7 and 4.9 (use them, do not teach them again). ΔG° and "thermodynamically favored" are topic 9.3's. **Equation sheet:** nothing for this topic. "Oxidation at the anode, reduction at the cathode" is not on it.
- **Opening:** topic 4.7 left a promise. Inside a watch battery, zinc gives electrons to silver oxide, but the two are kept apart, "so the electrons have to travel from one to the other through a wire, and they run the watch on the way." This lesson is about that arrangement: why keeping two reactants apart turns a reaction into an electric current, what each part of such a cell is for, and how the same parts, run backward by a power supply, make reactions go that would never go by themselves. Note for the writer: three sentences at most, and do not quote lesson 4.7 word for word: say it again in new words.
- **Section "From a collision to a current":**
  - Start with the two reactants together. Lower a strip of cobalt metal into a colorless solution of silver nitrate. Gray crystals of silver grow on the cobalt, and the solution slowly turns pink, the color of Co²⁺ ions in water. Display (split after the arrow): Co(s) + 2Ag⁺(aq) → Co²⁺(aq) + 2Ag(s). The nitrate ions are spectators.
  - This is a redox reaction (topic 4.7): each cobalt atom loses 2 electrons and each silver ion gains 1. It is thermodynamically favored (topic 9.3). Follow one silver ion. It wanders through the water until it strikes the surface of the strip, and in that collision an electron hops from the metal onto the ion. The ion is now a silver atom, and it stays where it landed. After two such collisions a cobalt atom at the surface has given up 2 electrons, and it slips into the water as a Co²⁺ ion. The hop itself is about the width of an atom, and the electron never leaves the strip and the silver growing on it, so there is no place to put anything in its path. The energy the reaction releases ends up in faster-moving particles: the solution gets a little warmer, and that is all.
  - Now make that collision impossible. Stand the cobalt strip in a beaker that holds no silver ions, put the silver ions in another beaker with a strip of silver for them to land on, and join the two strips with a wire. A silver ion that strikes the silver strip can still take an electron from the metal, and a cobalt atom can still leave its strip as an ion. But every electron taken from the silver strip has to be made good by one released at the cobalt strip, and the wire is the only link between the two. Electrons moving along a wire are an electric current (topic 2.4), and whatever is wired into their path is run by them: a lamp, a motor, a watch. (Two beakers and a wire are not quite the whole cell. The next section adds the one part still missing.)
  - An **electrochemical cell** is a device in which a redox reaction and an electric current are tied together like this. A **galvanic cell** is an electrochemical cell in which a thermodynamically favored reaction pushes electrons through a wire. (It is also called a voltaic cell: the two names mean the same thing.) A battery is one or more galvanic cells in a package.
  - `<KeyIdea>`: a galvanic cell keeps the two half-reactions of a favored redox reaction in separate places, so that the electrons must pass through a wire to get from one to the other. The reaction is the same as in the beaker. What changes is the path of the electrons, and with it what the energy can do.
  - Note for the writer: cobalt does displace silver from silver nitrate solution (fairly sure of what is seen: silver crystals on the metal, a pink tint that deepens slowly) **(verify)**. Say "slowly". Do not give a temperature rise.
- **Section "The parts of a galvanic cell":**
  - Place the figure `9-8-galvanic-cell.svg` at the start of the section, then take the parts one at a time. Each is a new term, in bold, defined in its own sentence:
    - A **half-cell** is one of the two places: here, a strip of cobalt standing in a solution of cobalt(II) nitrate, and a strip of silver standing in a solution of silver nitrate. One half-reaction happens in each.
    - An **electrode** is the solid conductor in a half-cell, where electrons pass between the wire and the chemicals. Here the electrodes are the two metal strips.
    - The **wire** joins the two electrodes and carries the electrons. Somewhere along it sits a meter, which measures the push on the electrons in volts (topic 9.9), or the device the cell is running.
    - The **salt bridge** joins the two solutions. It is a tube filled with a solution of a salt whose ions react with nothing in the cell, here potassium nitrate, and plugged so that the liquids do not pour through. Ions can move through it, and that is its whole job (below).
  - The two electrodes get their names from what happens at them. **The anode is the electrode where oxidation happens. The cathode is the electrode where reduction happens.** Those definitions hold in every electrochemical cell there is. Nothing else about an electrode decides its name: not its metal, not its side of the drawing.
  - Electrons are released at the anode, by the oxidation, and used up at the cathode, by the reduction. So in the wire, **electrons travel from the anode to the cathode.**
  - **What the salt bridge is for.** Set up the two half-cells and the wire but leave the bridge out, and the meter reads nothing. Count the ions to see why. The cobalt solution began with exactly two nitrate ions for every Co²⁺ ion. The first few cobalt atoms to be oxidized add Co²⁺ ions that have no nitrate ions to match them, so that beaker is left with a little extra positive charge. In the other beaker the first few Ag⁺ ions to be reduced leave their nitrate ions unmatched: a little extra negative charge. Extra positive charge around the cobalt strip holds back the electrons that should leave it, and extra negative charge around the silver strip pushes back the ones that should arrive. A very small imbalance is enough to hold both half-reactions still. Now lower the bridge into the two solutions, and the meter comes to life. For every 2 electrons that go through the wire, 2 nitrate ions move out of the bridge into the cobalt half-cell and 2 potassium ions move out of it into the silver half-cell. Neither solution ever builds up a charge, so the cell keeps running. In general: **anions move toward the anode, and cations move toward the cathode.**
  - Two kinds of charge carrier are at work (topics 2.3 and 2.4): electrons in the metal parts, ions in the solutions and the bridge. Electrons do not travel through the solutions, and ions do not travel through the wire. Together they make one complete loop.
  - `<KeyIdea>`: in every electrochemical cell, oxidation happens at the anode and reduction at the cathode. Electrons go from the anode to the cathode through the wire. In the solutions, anions move toward the anode and cations toward the cathode.
  - Note for the writer: the bridge is potassium nitrate on purpose. A chloride would form solid silver chloride in the silver half-cell: do not change the salt, and do not mention chloride. Do not use any memory phrase for "oxidation at the anode".
- **Worked example "Reading a cell from what you see":** a student builds the cell of the figure: a cobalt strip in pink cobalt(II) nitrate solution, a silver strip in colorless silver nitrate solution, and a salt bridge of potassium nitrate. She reads the meter, then takes it out and joins the two strips directly with the wire. After the cell has run for a day, the cobalt strip weighs 0.295 g less than it did and the silver strip weighs 1.080 g more. Write the half-reaction at each strip, name the anode and the cathode, give the direction of the electrons and of the ions in the salt bridge, and write the overall equation. Then show that the two changes in mass agree with it.
  1. **Turn each observation into a half-reaction.** The cobalt strip got lighter: cobalt atoms left it for the solution, as ions. Display: Co(s) → Co²⁺(aq) + 2e⁻. The silver strip got heavier: silver ions came out of the solution onto it, as atoms. Display: Ag⁺(aq) + e⁻ → Ag(s).
  2. **Name the electrodes by the process.** Cobalt loses electrons, which is oxidation, so the cobalt strip is the anode. Silver ions gain electrons, which is reduction, so the silver strip is the cathode.
  3. **Send the electrons.** From the anode to the cathode through the wire: from the cobalt strip to the silver strip.
  4. **Send the ions.** The cobalt solution is gaining Co²⁺ ions, so nitrate ions move into it from the bridge. The silver solution is losing Ag⁺ ions, so potassium ions move into it from the bridge. Anions toward the anode, cations toward the cathode.
  5. **Write the overall equation.** Each cobalt atom gives up 2 electrons and each silver ion takes 1, so the silver half-reaction is doubled (topic 4.9) and the electrons cancel. Display (split after the arrow): Co(s) + 2Ag⁺(aq) → Co²⁺(aq) + 2Ag(s). It is the reaction of the beaker, unchanged.
  6. **Check it against the masses.** Cobalt lost: 0.295 ÷ 58.93 = 0.00501 mol. Silver gained: 1.080 ÷ 107.87 = 0.01001 mol. (Two lines of display math, numbers only.) Twice as many moles of silver as of cobalt, as the equation says. The two strips do not change by equal masses: they change by amounts set by the electrons, 2 for each cobalt atom and 1 for each silver atom.

  After the worked example, one short paragraph: you would also see the cobalt solution's pink deepen as Co²⁺ ions are added to it, while the silver solution, whose ions are colorless, shows nothing.

  Note for the writer: the atomic masses are the exam table's, Co 58.93 and Ag 107.87. The masses were chosen so that the cell's average current is about 11 mA, which a cell with a salt bridge can deliver when its strips are joined by a plain wire; give no current and no charge (topic 9.11). Do not have the student "predict" which metal is oxidized: without potentials that cannot be done, and the observations settle it.
- **Check 1**, `<Check answer={2}>`: "A galvanic cell has a cadmium strip in colorless cadmium nitrate solution and a cobalt strip in pink cobalt(II) nitrate solution. A wire joins the strips, and a salt bridge of potassium nitrate joins the solutions. As the cell runs, the pink color slowly fades. Which ion moves out of the salt bridge into the cobalt half-cell, and why?" Options:
  1. NO₃⁻, because the cobalt strip is the anode and anions move toward the anode
  2. K⁺, because Co²⁺ ions are leaving that solution and positive charge must replace them
  3. K⁺, because potassium ions are reduced at the cobalt strip along with the Co²⁺ ions
  4. NO₃⁻, because nitrate ions carry the electrons across the bridge from the cadmium half-cell

  Why: the pink ion is Co²⁺, and its color is fading, so Co²⁺ ions are being used up: Co²⁺(aq) + 2e⁻ → Co(s) (display). That is reduction, so in this cell the cobalt strip is the cathode, and cadmium is oxidized at the anode. Every Co²⁺ ion that leaves the solution leaves two nitrate ions with nothing to balance them, so cations, K⁺, move in from the bridge. Cobalt was the anode in the worked example and is the cathode here: a metal has no fixed role. The potassium ions take no part in either half-reaction; they only carry charge. And nothing carries electrons through a solution: electrons take the wire. Misses:
  - 1: "The pink ion is Co²⁺. If its color is fading, is Co²⁺ being made or used up at the cobalt strip? Decide from that which electrode cobalt is in this cell."
  - 3: "The ions of a salt bridge take no part in either half-reaction. Ask what charge is building up in the cobalt half-cell, and what could cancel it."
  - 4: "Electrons travel through the wire, never through a solution. Ask what charge is building up in the cobalt half-cell, and which ion could cancel it."

  Note for the writer: cadmium does reduce cobalt(II) ions (lesson 9.9's table puts cadmium below cobalt), but give no potentials here. The fading of the pink is slow; keep "slowly".
- **Check 2**, `<Check answer={4}>`: "Another galvanic cell has a chromium strip in a solution of Cr³⁺ ions and a tin strip in a solution of Sn²⁺ ions. As the cell runs, the chromium strip loses mass and the tin strip gains mass. Which statement about this cell is correct?" Options:
  1. Tin is the anode, because the anode is the electrode where metal builds up
  2. Electrons travel through the salt bridge from the chromium solution to the tin solution
  3. Chromium is the cathode, and Cr³⁺ ions are reduced at its surface
  4. Electrons travel through the wire from the chromium strip to the tin strip

  Why: a strip that loses mass is losing atoms to the solution as ions: Cr(s) → Cr³⁺(aq) + 3e⁻, oxidation, so chromium is the anode. A strip that gains mass is collecting atoms from ions: Sn²⁺(aq) + 2e⁻ → Sn(s), reduction, so tin is the cathode. (Two lines of display math.) Electrons go from the anode to the cathode through the wire, so from chromium to tin. Metal builds up where ions are reduced, which is the cathode. Electrons do not pass through the salt bridge: ions do. Misses:
  - 1: "An electrode is named for the process at it. Metal building up on a strip means ions are gaining electrons there. Is that oxidation or reduction?"
  - 2: "A salt bridge is a tube of dissolved ions, with no metal in it. Which particles can carry charge through a solution, and which cannot?"
  - 3: "A strip that loses mass is losing atoms to the solution as ions. Does a chromium atom gain electrons or lose them to become Cr³⁺?"
- **Section "At the two surfaces":**
  - Everything that matters in a cell happens at the surface of an electrode, where metal meets solution. Place the figure `9-8-two-surfaces.svg` here.
  - At the anode's surface, a cobalt atom leaves the metal and goes into the solution as a Co²⁺ ion. Its 2 electrons stay behind in the strip, and electrons already in the metal are pushed along the wire. The strip has one atom fewer: this is why an anode made of the metal being oxidized loses mass.
  - At the cathode's surface, a silver ion arrives from the solution, takes 1 electron from the strip, and stays on the surface as a silver atom, part of the metal now. The strip has one atom more: this is why a cathode gains mass when a metal is formed on it. For the 2 electrons one cobalt atom leaves behind, 2 silver ions are reduced.
  - Electrons never enter the solution. They cross from the metal to an ion, or from an atom to the metal, only at the surface.
  - **Not every electrode takes part.** An electrode can be a conductor that only hands electrons over and is not itself changed, such as a rod of graphite or a strip of platinum. Then the species oxidized or reduced at it comes from the solution, and the product may be a gas that bubbles away or a dissolved ion. The names do not change: the electrode where oxidation happens is the anode.
  - **What you can see, and what it tells you** (a table of two columns, four rows):

    | What you see | What it tells you |
    |---|---|
    | A metal electrode gets lighter | Its atoms are being oxidized to ions: it is the anode |
    | An electrode gets heavier as a coating of metal grows on it | Metal ions are being reduced to atoms there: it is the cathode |
    | Bubbles of gas at an electrode | A gas is the product of the half-reaction there: write the half-reaction to see whether electrons are lost or gained |
    | A solution's color deepens or fades | A colored ion is being made or used up in that half-cell |

  - One sentence after the table, as the example of the third row: hydrogen gas forms where H⁺ ions gain electrons, 2H⁺(aq) + 2e⁻ → H₂(g) (display), which is a reduction, so those bubbles mark a cathode; a gas formed by a loss of electrons marks an anode, and the next section has one.
  - One paragraph that keeps topic 4.7's promise: in the watch battery, the zinc is the anode and the silver oxide is the cathode. They are pressed into one small steel can with a layer between them soaked in potassium hydroxide solution, whose ions do the job of the salt bridge. The watch is the device on the wire. Note for the writer: this is the build of a silver oxide button cell (fairly sure) **(verify)**. Say no more about it; lesson 9.9 finds its voltage.
- **Check 3**, `<Check answer={1}>`: "A student's particle sketch shows the surface of a copper electrode in a working cell. Copper atoms at the surface are leaving as Cu²⁺ ions, and for each ion 2 electrons stay behind in the metal and move off toward the wire. The sketch does not say whether the cell is galvanic or electrolytic. What can be said about this electrode?" Options:
  1. It is the anode, and it is losing mass
  2. It is the anode, and it is gaining mass
  3. It is the cathode, and it is losing mass
  4. Nothing, until the kind of cell is known

  Why: copper atoms are losing electrons, Cu(s) → Cu²⁺(aq) + 2e⁻ (display), and a loss of electrons is oxidation. The electrode where oxidation happens is the anode, in every cell, so the kind of cell does not have to be known. Each atom that becomes an ion leaves the strip, so the strip is losing mass. Misses:
  - 2: "Each copper atom that becomes an ion leaves the strip for the solution. What does that do to the mass of the strip?"
  - 3: "The copper atoms are losing electrons. Which process is that, and which electrode is named for it?"
  - 4: "The names anode and cathode come from the process at the electrode. Does that definition depend on the kind of cell?"

  Note for the writer: this Check is placed before the electrolytic cell is taught, on purpose: the definition of the anode, two sections back, is "in every electrochemical cell". Its Why may say that the next section shows the other kind of cell.
- **Check 4**, `<Check answer={2}>`: "Cobalt metal reacts with copper(II) ions in a thermodynamically favored reaction: Co(s) + Cu²⁺(aq) → Co²⁺(aq) + Cu(s). An engineer wants this reaction to push a current through a small device. Which arrangement can do it?" (Set the equation as display math.) Options:
  1. A cobalt strip in copper(II) nitrate solution, with the device wired between the two ends of the strip
  2. Cobalt in cobalt(II) nitrate and copper in copper(II) nitrate, joined by a salt bridge, with the device wired between the strips
  3. The same two half-cells with the device wired between the strips, but no salt bridge, so that no Cu²⁺ ion can ever reach the cobalt strip
  4. Cobalt powder stirred into copper(II) nitrate solution, with both of the device's wires dipped into the mixture

  Why: the electrons have to be made to go through the device, and that takes all four parts. With the cobalt in the copper(II) solution, as a strip or as a powder, Cu²⁺ ions take electrons straight from the cobalt atoms they touch, and no electron has any reason to go through the device. Two half-cells and a wire give the electrons one path, through the device. Leave out the bridge, and after only a handful of ions have reacted the cobalt solution holds unmatched positive charge and the copper solution unmatched negative charge. That imbalance holds the electrons where they are, and the device gets nothing. Only the second arrangement has the two half-reactions apart, a wire for the electrons and a bridge for the ions. Misses:
  - 1: "Where cobalt touches Cu²⁺ ions, electrons pass straight from atom to ion. Does any electron have to go through the device?"
  - 3: "Follow the charge. Co²⁺ ions build up in one beaker and Cu²⁺ ions leave the other. What happens if no ions can move between the two?"
  - 4: "In a stirred mixture every grain of cobalt touches Cu²⁺ ions. What path do the electrons take, and does it pass through the wires?"
- **Section "The electrolytic cell":**
  - A galvanic cell lets a favored reaction push electrons through a wire. Turn that around: push electrons through a cell from outside, and a reaction can be made to go that is thermodynamically unfavored. An **electrolytic cell** is an electrochemical cell in which a power supply drives an unfavored redox reaction. Doing so is called **electrolysis**. This is one of the two ways of topic 9.7 to make an unfavored change happen: energy from outside.
  - The supply does one thing: it pulls electrons out of one electrode and pushes them into the other. At the electrode it pushes electrons into, something in the cell has to take them: a reduction happens there, so that electrode is the cathode. At the electrode it pulls electrons out of, something has to give them up: an oxidation happens there, so that electrode is the anode. The definitions have not changed, and in the wire the electrons still go from the anode to the cathode, now through the supply.
  - Often an electrolytic cell is one container with no salt bridge. If the two products do not have to be kept in separate solutions, the liquid itself carries the ions between the electrodes.
  - A short comparison (a table of three columns, four rows):

    | | Galvanic cell | Electrolytic cell |
    |---|---|---|
    | The overall reaction is | thermodynamically favored | thermodynamically unfavored |
    | Electrons move because | the reaction pushes them | a power supply pushes them |
    | Oxidation happens at | the anode | the anode |
    | Electrons in the wire go | from anode to cathode | from anode to cathode |

    One sentence after it: the top two rows are the difference between the cells, and the bottom two are what never changes.
- **Worked example "Magnesium from a molten salt":** one industrial way of making magnesium metal is the electrolysis of molten magnesium chloride. The salt melts at 714 °C, and the cell is run at about 750 °C. A steel electrode and a graphite electrode dip into the melt and are joined to a power supply. Silvery liquid magnesium collects at the steel electrode, and a yellow-green gas, chlorine, bubbles off the graphite. Write the half-reaction at each electrode, name the anode and the cathode, say which way the ions and the electrons move, and write the overall reaction.
  1. **Say what is in the cell.** A molten ionic compound is ions that are free to move (topic 2.3): Mg²⁺ ions and Cl⁻ ions, and nothing else. There is no water.
  2. **Write the half-reaction that makes each product.** Magnesium metal comes from magnesium ions. Display: Mg²⁺ + 2e⁻ → Mg(l). Chlorine gas comes from chloride ions. Display: 2Cl⁻ → Cl₂(g) + 2e⁻.
  3. **Name the electrodes by the process.** Mg²⁺ gains electrons: reduction, so the steel electrode is the cathode. Cl⁻ loses electrons: oxidation, so the graphite electrode is the anode. Neither electrode is itself used up: each only hands electrons over.
  4. **Send the ions and the electrons.** Cations, Mg²⁺, move through the melt toward the cathode, and anions, Cl⁻, toward the anode: the same rule as in a salt bridge. The supply pulls electrons from the graphite anode and pushes them into the steel cathode.
  5. **Add the halves.** Each has 2 electrons, so they cancel as they stand. Display: MgCl₂(l) → Mg(l) + Cl₂(g).
  6. **Say why it needs the supply.** Magnesium burns in chlorine to give magnesium chloride: that direction is the thermodynamically favored one. The cell runs the reverse, which is unfavored, and it goes only while the supply keeps pushing electrons. For the same reason the cell is built to keep the two products apart: where liquid magnesium and chlorine meet, they react and undo the work.

  Place the figure `9-8-electrolytic-cell.svg` after step 4 or after the worked example.

  Note for the writer: the temperatures (melting point of MgCl₂ 714 °C; magnesium melts at 650 °C, so it forms as a liquid; cells run at roughly 700 to 750 °C) are fairly sure **(verify)**. Industrial melts also hold other chloride salts that lower the melting point; the lesson says "molten magnesium chloride" and "about 750 °C" and nothing more. Say "one industrial way": most magnesium today is made by another route. The ions in the melt carry no "(aq)", and in the lesson they carry no state symbol at all. Do not say which electrode the supply's positive or negative terminal is joined to.
- **Check 5**, `<Check answer={3}>`: "The aluminum smelter of topic 4.5 is an electrolytic cell. Aluminum oxide is dissolved in a molten salt, where in the simplest picture it gives Al³⁺ ions and O²⁻ ions, and a power supply drives a current between carbon electrodes. Liquid aluminum collects at one electrode. Carbon dioxide bubbles off the other, which is slowly eaten away. At which electrode does each product form?" Options:
  1. Aluminum at the anode and CO₂ at the cathode, because a metal forms where electrons leave the cell
  2. Both at the cathode, because that is where the power supply delivers its electrons
  3. Aluminum at the cathode, where Al³⁺ ions gain electrons, and CO₂ at the anode
  4. Aluminum throughout the melt, wherever Al³⁺ meets O²⁻, and CO₂ at both electrodes

  Why: aluminum metal comes from Al³⁺ + 3e⁻ → Al(l), a gain of electrons. Reduction happens at the cathode. The oxide ions give up electrons at the other carbon electrode, and the oxygen leaves joined to carbon from the electrode itself: C(s) + 2O²⁻ → CO₂(g) + 4e⁻. That is oxidation, so that electrode is the anode, and it is eaten away because its carbon is a reactant. (Two lines of display math.) Multiply the first half-reaction by 4 and the second by 3, so that 12 electrons cancel, and the sum is the smelter's equation from topic 4.5: 2Al₂O₃ + 3C → 4Al + 3CO₂. Topic 4.5 said that electricity drives this reaction; this is how. Misses:
  - 1: "Write the half-reaction that turns Al³⁺ into Al. Are electrons gained or lost in it, and which electrode is named for that process?"
  - 2: "Electrons delivered to an electrode are gained by something there. Carbon dioxide forms from O²⁻ ions and carbon: do the oxide ions gain electrons or lose them?"
  - 4: "Al³⁺ meeting O²⁻ only gives aluminum oxide again. To become metal, Al³⁺ needs electrons. Where in the cell can it get them?"

  Note for the writer: "in the simplest picture" must stay: in the real melt (molten cryolite) the ions are more complicated. The carbon anodes of a smelter are consumed and give carbon dioxide (sure). Give no temperature and no voltage for the smelter.
- **Check 6**, `<Check answer={4}>`: "The cobalt and silver cell of the first worked example is taken apart at the wire, and the two strips are joined to a power supply instead. The supply pushes electrons through the wire the other way, from the silver strip to the cobalt strip, and both half-reactions run backward. Which statement is now true?" Options:
  1. Cobalt is still the anode, because the anode of a cell is fixed by its metals
  2. Oxidation now happens at the cathode, because the supply has reversed the cell
  3. Silver is now the cathode, because the supply is sending the electrons to it
  4. Silver is now the anode, and the silver strip loses mass

  Why: electrons that leave the silver strip come from silver atoms: Ag(s) → Ag⁺(aq) + e⁻. That is oxidation, so the silver strip is now the anode, and it loses mass. Electrons arriving at the cobalt strip are taken by cobalt(II) ions: Co²⁺(aq) + 2e⁻ → Co(s). That is reduction, so the cobalt strip is now the cathode, and it gains mass. (Two lines of display math.) The names moved because the processes moved. The rule did not: oxidation at the anode, electrons from anode to cathode. The cell is now electrolytic, running the unfavored reverse reaction, and this is what happens inside a rechargeable battery while it is being charged. Misses:
  - 1: "An electrode is named for the process at it, and both processes have just been reversed. What happens at the cobalt strip now?"
  - 2: "Oxidation happens at the anode in every cell, by definition. A power supply can change where oxidation happens. Can it change what the word anode means?"
  - 3: "The supply is taking electrons away from the silver strip. Where do those electrons come from, and what is that process called?"

  Note for the writer: the stem says that both half-reactions run backward, so that the student is not asked to predict the products of an electrolysis in water (the framework leaves that out). Do not add a voltage.
- **Closing, two "Beyond the exam" paragraphs:**
  - "**Beyond the exam:** chemists have a shorthand for a galvanic cell, called cell notation. The cobalt and silver cell is written Co(s) | Co²⁺(aq) || Ag⁺(aq) | Ag(s): the anode's half-cell on the left, the cathode's on the right, a single line wherever a solid meets a solution, and a double line for the salt bridge. The exam describes a cell in words or draws it."
  - "**Beyond the exam:** the two electrodes of a cell are also marked positive and negative, as on any battery. Which is which is not the same in a galvanic cell as in an electrolytic cell, so the signs are a poor way to tell electrodes apart, and the exam does not ask for them. Name an electrode by what happens at it." Note for the writer: this is the only place in the unit where electrode signs are mentioned. Do not say which electrode carries which sign.
- **Trap:** **Naming an electrode by its metal or by its place in the drawing** (the anode is wherever oxidation happens: cobalt was the anode in one cell of this lesson and the cathode in another). **Sending electrons through the salt bridge or the solution** (electrons take the wire; ions carry the charge through the liquids). **Sending the bridge's ions the wrong way** (anions toward the anode, where positive ions are building up; cations toward the cathode). **Thinking an electrolytic cell reverses the definitions** (oxidation is at the anode in both kinds of cell; what differs is whether the reaction pushes the electrons or a supply does). **Expecting the two electrodes to change by equal masses** (the electrons are equal; the moles and the masses follow the half-reactions). **Taking bubbles of gas as the mark of one kind of electrode** (write the half-reaction: hydrogen forms by reduction, at a cathode, and chlorine by oxidation, at an anode).
- **Key points:** a galvanic (voltaic) cell keeps the two half-reactions of a thermodynamically favored redox reaction apart, so that the electrons pass through a wire, where their energy can do work; each half-cell has an electrode, and in every electrochemical cell oxidation happens at the anode and reduction at the cathode; electrons travel through the wire from the anode to the cathode, and in the salt bridge and the solutions anions move toward the anode and cations toward the cathode, which keeps each solution neutral; an anode made of the metal being oxidized loses mass, a cathode on which a metal forms gains mass, and a gas or a change of color at an electrode also shows which half-reaction is happening there; an electrolytic cell uses a power supply to push electrons through a cell and drive a thermodynamically unfavored reaction, as in making magnesium from molten magnesium chloride; in an electrolytic cell the names and the direction of the electrons follow the same rules, and only the source of the push is different.

**Figures**

- **`9-8-galvanic-cell.svg`** (viewBox 0 0 480 430, font-size 18). The cobalt and silver cell of the worked example, with the anode's half-cell on the left.
  - **Two beakers.** Left beaker: an open-topped outline in ink from x = 40 to x = 200, y = 200 to y = 340. Right beaker: the same from x = 280 to x = 440. Each holds liquid from y = 240 down to the bottom. The left liquid (the pink cobalt solution) is filled with the light accent color and a pattern of small dots in the accent color. The right liquid (the colorless silver solution) is filled with the light accent color alone. The two liquids differ by the dot pattern, not by color.
  - **Two electrodes.** Left: a tall rectangle from x = 80 to x = 104, y = 150 to y = 320, filled with diagonal hatching in the secondary color, ink outline, labeled "Co" centered at (58, 176), to the left of the strip and above the beaker's rim. Right: a rectangle from x = 376 to x = 400, y = 150 to y = 320, filled with the glass color, ink outline, labeled "Ag" centered at (422, 176). The two strips differ by hatching against plain fill.
  - **Wire and meter.** A line in ink from the top of the left strip (92, 150) up to y = 60, across to x = 388, and down to the top of the right strip (388, 150). A circle of radius 22 centered at (240, 60), filled with the background color, ink outline, with "V" centered in it. The word "meter" centered at (240, 26).
  - **Electron arrows.** Two arrows in the accent color just above the wire, both pointing right: from x = 110 to x = 170 at y = 46, and from x = 310 to x = 370 at y = 46. Each carries the label "e⁻" above it, centered at (140, 36) and (340, 36).
  - **Salt bridge.** An inverted U-shaped tube, 18 units wide, filled with the glass color, ink outline: its left leg from y = 300 up to y = 130 centered at x = 160, its top from x = 160 to x = 320 at y = 130, its right leg down to y = 300 centered at x = 320. Under the top of the tube, centered at x = 240: "salt bridge" at y = 166 and "KNO₃(aq)" at y = 188.
  - **Ion arrows.** Above the top of the tube: an arrow from x = 228 to x = 178 at y = 112, pointing left, with the label "NO₃⁻" centered at (203, 102); and an arrow from x = 252 to x = 302 at y = 112, pointing right, with the label "K⁺" centered at (277, 102). (The wire is at y = 60 and the meter's circle ends at y = 82, so these labels clear both.)
  - **Under the beakers,** three lines of text each, centered at x = 120 (left) and x = 360 (right): at y = 364, "Co(NO₃)₂(aq)" and "AgNO₃(aq)"; at y = 388, "anode: oxidation" and "cathode: reduction"; at y = 412, "Co → Co²⁺ + 2e⁻" and "Ag⁺ + e⁻ → Ag".
  - Text in the figure, sixteen pieces: "meter", "V", "e⁻" twice, "NO₃⁻", "K⁺", "salt bridge", "KNO₃(aq)", "Co", "Ag", and the six lines under the beakers. **No "+" or "−" stands beside either electrode**: the only plus and minus signs in the figure are the charges of ions and of the electron.
  - Alt: "A galvanic cell. On the left, a hatched cobalt strip stands in a beaker of cobalt nitrate solution, labeled anode, oxidation, with the half-reaction cobalt gives a cobalt 2 plus ion and 2 electrons. On the right, a plain silver strip stands in a beaker of silver nitrate solution, labeled cathode, reduction, with the half-reaction a silver ion and 1 electron give silver. A wire with a meter joins the tops of the two strips, and two arrows on it show electrons going from the cobalt strip to the silver strip. A salt bridge of potassium nitrate solution joins the two beakers. Above it, one arrow shows nitrate ions moving toward the cobalt beaker and another shows potassium ions moving toward the silver beaker."
  - Caption: "A galvanic cell of cobalt and silver. Electrons go through the wire from the anode to the cathode, and the ions of the salt bridge keep both solutions neutral."
- **`9-8-two-surfaces.svg`** (viewBox 0 0 480 340, font-size 18). Two panels, each 220 wide, with a 40-unit gap: the left panel from x = 0 to x = 220 and the right panel from x = 260 to x = 480. Each shows a slab of metal meeting a solution. Water molecules and nitrate ions are left out.
  - **Left panel, "Cobalt strip: anode"** (title centered at x = 110, y = 26). The metal: a rectangle from x = 10 to x = 100, y = 50 to y = 290, filled with the glass color, with diagonal hatching in the secondary color, as the cobalt strip has in the cell figure. The solution: a rectangle from x = 100 to x = 210, y = 50 to y = 290, filled with the light accent color. In the metal, a grid of cobalt atoms, 3 columns by 5 rows, drawn as open circles of radius 12 with ink outlines, at x = 26, 54, 82 and y = 80, 124, 168, 212, 256. **One place is empty:** the surface place at (82, 168) is drawn as a dashed circle in the secondary color. So the metal holds 14 atoms and 1 empty place. In the solution, **1 Co²⁺ ion**: a filled dark circle (ink) of radius 12 at (160, 168), with a straight arrow in the accent color from (98, 168) to (144, 168), and the label "Co²⁺" centered at (160, 144). In the metal, **2 electrons**: two small filled circles of radius 4 in the accent color at (54, 146) and (54, 190), between the rows, and an arrow in the accent color from (22, 62) up to (22, 40), which crosses the top edge of the slab at its left corner and points out of it, with the label "2e⁻ to the wire" centered at x = 110, y = 316, under the panel.
  - **Right panel, "Silver strip: cathode"** (title centered at x = 370, y = 26). Mirror arrangement: the solution from x = 270 to x = 380 (light accent color) and the metal from x = 380 to x = 470 (glass color, plain, as the silver strip is in the cell figure, so that the two metals differ in pattern). In the metal, a grid of silver atoms, 3 columns by 5 rows, open circles of radius 12 at x = 398, 426, 454 and y = 80, 124, 168, 212, 256: **15 atoms**, none missing. In the solution, **2 Ag⁺ ions**: filled dark circles of radius 12 at (320, 124) and (320, 212), each with an arrow in the accent color pointing right, from (336, 124) to (378, 124) and from (336, 212) to (378, 212), and the label "Ag⁺" centered above each, at (320, 100) and (320, 188). In the metal, **2 electrons**: small filled circles of radius 4 at (412, 102) and (412, 190), and an arrow in the accent color from (458, 40) down to (458, 62), which crosses the top edge of the slab at its right corner and points into it. Under the panel, "2e⁻ from the wire" centered at x = 370, y = 316.
  - Counts, for the alt text and for conservation: left, 14 cobalt atoms in the strip, 1 empty place, 1 Co²⁺ ion in the solution, 2 electrons; right, 15 silver atoms in the strip, 2 Ag⁺ ions in the solution, 2 electrons. Charge: one ion of 2+ and 2 electrons on the left; two ions of 1+ and 2 electrons on the right. The 2 electrons released on the left are the 2 used on the right. Ions are dark and filled; atoms are open circles.
  - Text in the figure, seven pieces: the two titles, "Co²⁺", "Ag⁺" twice, "2e⁻ to the wire", "2e⁻ from the wire".
  - Alt: "Two panels showing the surfaces of the two electrodes as particles. In the left panel, labeled cobalt strip, anode, a block of 14 cobalt atoms has one empty place at its surface, and an arrow leads from that place to 1 cobalt 2 plus ion in the solution; 2 electrons are left in the metal, labeled 2 electrons to the wire. In the right panel, labeled silver strip, cathode, 2 silver ions in the solution each have an arrow pointing to the surface of a block of 15 silver atoms; 2 electrons are in the metal, labeled 2 electrons from the wire."
  - Caption: "At the anode a cobalt atom goes into the solution as an ion and leaves 2 electrons in the strip. At the cathode those 2 electrons turn 2 silver ions into silver atoms. Water molecules and nitrate ions are not shown."
- **`9-8-electrolytic-cell.svg`** (viewBox 0 0 480 400, font-size 18). The molten magnesium chloride cell, with the cathode on the left. (The galvanic figure has its anode on the left. The difference is deliberate: the side of a drawing decides nothing.)
  - **Power supply.** A rectangle from x = 165 to x = 315, y = 20 to y = 60, filled with the glass color, ink outline, with "power supply" centered in it at (240, 46). No terminal is marked.
  - **The pot.** An open-topped outline in ink from x = 60 to x = 420, y = 150 to y = 320. The melt fills it from y = 180 down, in the light accent color. The label "molten MgCl₂" centered at (240, 312), inside the melt near the bottom.
  - **Electrodes.** Left (steel, the cathode): a rectangle from x = 120 to x = 144, y = 110 to y = 280, filled with the glass color, ink outline. Right (graphite, the anode): a rectangle from x = 336 to x = 360, y = 110 to y = 280, filled with diagonal hatching in the secondary color, ink outline. Labels "steel" centered at (88, 136) and "graphite" centered at (410, 136), each outside the pot's wall, above the rim.
  - **Wires.** From the left side of the supply (165, 40) left to x = 132, then down to the top of the left electrode (132, 110). From the right side of the supply (315, 40) right to x = 348, then down to (348, 110).
  - **Electron arrows,** in the accent color, beside the vertical wires: on the left, an arrow pointing down from (110, 60) to (110, 100), with "e⁻" centered at (90, 86); on the right, an arrow pointing up from (370, 100) to (370, 60), with "e⁻" centered at (392, 86). Electrons go into the cathode and come out of the anode.
  - **Products.** At the left electrode, 3 drops of liquid magnesium: filled ellipses in the secondary color, 14 wide and 10 tall, touching the electrode's right face, centered at (152, 200), (152, 228) and (152, 256). The label "Mg(l)" centered at (196, 206), to the right of the top drop, with no leader line. At the right electrode, 4 bubbles of chlorine: open circles with ink outlines, radius 6, beside the electrode's left face, centered at (326, 250), (322, 222), (328, 198) and (323, 168), the top one above the surface of the melt. The label "Cl₂(g)" centered at (276, 170), above the melt's surface and to the left of the top bubble.
  - **Ions in the melt.** "Mg²⁺" centered at (240, 244), with an arrow in the accent color under it from (268, 254) to (212, 254), pointing left, toward the cathode. "Cl⁻" centered at (240, 280), with an arrow under it from (212, 290) to (268, 290), pointing right, toward the anode.
  - **Under the pot,** two lines of text each, centered at x = 132 (left) and x = 348 (right): at y = 350, "cathode: reduction" and "anode: oxidation"; at y = 376, "Mg²⁺ + 2e⁻ → Mg" and "2Cl⁻ → Cl₂ + 2e⁻".
  - Text in the figure, fourteen pieces: "power supply", "steel", "graphite", "e⁻" twice, "Mg(l)", "Cl₂(g)", "Mg²⁺", "Cl⁻", "molten MgCl₂", and the four lines under the pot. **No "+" or "−" stands beside either electrode or on the power supply.**
  - Alt: "An electrolytic cell: one pot of molten magnesium chloride with two electrodes dipping into it, joined by wires to a box labeled power supply. Arrows show electrons going from the supply into the steel electrode on the left and from the graphite electrode on the right back to the supply. At the steel electrode, labeled cathode, reduction, 3 drops of liquid magnesium form, with the half-reaction a magnesium 2 plus ion and 2 electrons give magnesium. At the graphite electrode, labeled anode, oxidation, 4 bubbles of chlorine gas rise, with the half-reaction 2 chloride ions give chlorine and 2 electrons. In the melt, an arrow shows magnesium ions moving toward the cathode and another shows chloride ions moving toward the anode."
  - Caption: "An electrolytic cell for making magnesium. The power supply pushes electrons into the cathode, where magnesium ions take them, and pulls them from the anode, where chloride ions give them up."
  - Note for the writer: the coordinates give the arrangement; render the figure and move a label where two pieces of text touch. The counts (3 drops, 4 bubbles) and every arrow's direction are fixed.

**Values**

| Quantity | Value | Source and how sure |
|---|---|---|
| Atomic mass of cobalt | 58.93 | the site's `src/data/elements.ts` |
| Atomic mass of silver | 107.87 | the site's `src/data/elements.ts` |
| Mass lost by the cobalt strip; mass gained by the silver strip | 0.295 g; 1.080 g | made-up data, chosen to fit the equation: 0.00501 mol and 0.01001 mol |
| Average current those masses mean over a day | about 11 mA (966 C in 86,400 s) | not printed; a check that the scene is real |
| Color of Co²⁺ in water | pink | lesson 7.9 (line 210) has the pink ion; sure |
| Color of Ag⁺, Cd²⁺ and K⁺ in water | colorless | sure |
| Melting point of magnesium chloride | 714 °C | handbook value; sure |
| Melting point of magnesium | 650 °C | handbook value; sure (not printed in the lesson; a note only) |
| Temperature of a magnesium cell | about 750 °C | industrial cells run at roughly 700 to 750 °C; fairly sure **(verify)** |
| Electrodes of a magnesium cell | steel cathode, graphite anode | fairly sure **(verify)** |
| Liquid magnesium "silvery"; chlorine "yellow-green" | | sure |
| Carbon anodes of an aluminum smelter are consumed and give CO₂ | | sure; agrees with lesson 4.5's equation |
| Build of a silver oxide button cell | zinc anode, silver oxide cathode, a separator soaked in potassium hydroxide solution | fairly sure **(verify)** |
| Cobalt displaces silver from silver nitrate solution; cadmium reduces Co²⁺; cobalt reduces Cu²⁺; chromium reduces Sn²⁺ | | each follows from the unit's reduction potentials (Ag⁺/Ag +0.80, Cu²⁺/Cu +0.34, Sn²⁺/Sn −0.14, Co²⁺/Co −0.28, Cd²⁺/Cd −0.40, Cr³⁺/Cr −0.74 V); sure of the direction; no potential is printed in this lesson |

No ΔH°f, S°, ΔG°f, E° or K is printed in this lesson.

**Check script:** `scratchpad/unit9/checks/9-8.py`. It checks the balance in atoms and charge of every half-reaction and equation above (with the electrons counted), the directions the brief's cells run against the unit's reduction potentials, the mole arithmetic of the worked example, the counts and coordinates of the particle figure, and each message and option against this file, with the answer positions.

**Notes for the writer**

- **No electrode has a sign**, anywhere: not in text, not in a figure, not in alt text, not in a caption. The second "Beyond the exam" paragraph is the only mention that signs exist.
- Name an electrode by its process every time it is introduced: "the cobalt strip, the anode".
- Never write "the equilibrium shifts", and do not use Le Châtelier's principle for anything in a cell.
- No potentials, no volts as numbers, no ΔG° values. "Thermodynamically favored" and "thermodynamically unfavored" are used as topic 9.3 defined them (after first use, "favored" and "unfavored" may stand alone). Never "spontaneous", never "favorable" for a reaction.
- Do not use "oxidizing agent" or "reducing agent".
- Say "galvanic cell" throughout; "voltaic" appears once, as the same thing.
- The first section is told from the particles: one ion, one collision, one electron hopping the width of an atom. Do not recast it as a general statement that the energy is wasted as heat or that separating the reactants lets the current do work. The salt bridge paragraph starts from the meter's reading with the bridge left out; keep that order.
- A salt bridge is described by what it does. Do not make "what happens if the salt bridge is removed" a question of its own: it is one sentence of the explanation and one wrong option of Check 4.
- Electrons are never said to "flow through the solution" or to "swim" across the salt bridge.
- The observation table's third row must not say that a gas always marks one kind of electrode: hydrogen forms at a cathode and chlorine at an anode.
- Zinc appears only in the watch battery. No zinc half-cell in a beaker, and no cell of zinc with copper, copper with silver, magnesium, iron, nickel or lead.
- Check 3 comes before the electrolytic cell, and Check 6 after it. Do not move them.

**Reactions, substances and scenarios used:** the watch battery of lesson 4.7 (opening; one paragraph that names its anode, its cathode and its potassium hydroxide layer; the system comes back on purpose); a cobalt strip in silver nitrate solution, silver crystals and a pink solution, told as one silver ion striking the strip (first section); the cobalt and silver galvanic cell with a potassium nitrate salt bridge, the strips joined by a plain wire, the cobalt strip 0.295 g lighter and the silver strip 1.080 g heavier after a day (worked example 1, two figures; the cell comes back in lessons 9.9 and 9.10 on purpose); a cadmium and cobalt cell whose pink color fades (Check 1); a chromium and tin cell read from its changes in mass (Check 2); a copper electrode losing atoms as Cu²⁺ in a particle sketch (Check 3); cobalt with copper(II) ions in four arrangements (Check 4); hydrogen bubbles where H⁺ is reduced (one sentence); the electrolysis of molten magnesium chloride at about 750 °C with a steel cathode and a graphite anode (worked example 2 and a figure; the cell comes back in lesson 9.11 on purpose); the aluminum smelter of lesson 4.5 with Al³⁺ + 3e⁻ → Al(l) and C(s) + 2O²⁻ → CO₂(g) + 4e⁻ (Check 5; the system comes back on purpose); the cobalt and silver cell run backward by a power supply (Check 6); cell notation and the signs of electrodes, once each under "Beyond the exam". Figures: the three the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.8 Galvanic (Voltaic) and Electrolytic Cells`).

**Check script:** `scratchpad/unit9/checks/9-8.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.8 Galvanic (Voltaic) and Electrolytic Cells`).

### Task 9: Lesson 9.9, Cell Potential and Free Energy

**Files:**
- Create: `src/content/lessons/unit-9/9-9-cell-potential-and-free-energy.mdx`
- Create: `public/figures/9-9-three-rulers.svg`
- Places the interactive block `<GalvanicCell />` (built in its own task from "Diagram data" below; the lesson only places it, and no Check depends on it). Lesson 9.10 places the same block again and quotes numbers from "Diagram data".

**Brief**

- **Front matter:** `topic: "9.9"`, `minutes: 20`, summary: "How standard reduction potentials give the potential of a cell, why a potential is never multiplied, and how the potential, the free energy change and the equilibrium constant are tied together." (No colon in the summary.)
- **Framework (9.9, three statements):** (1) electrochemistry studies redox reactions in electrochemical cells, and those reactions are either thermodynamically favored (galvanic cells) or thermodynamically unfavored (electrolytic cells). (2) The standard cell potential is found by picking out the oxidation and the reduction half-reactions and their standard reduction potentials. (3) ΔG° is proportional to the negative of the cell potential, ΔG° = −nFE°: a positive E° goes with a favored reaction and a negative E° with an unfavored one. The objective is to explain whether a cell is thermodynamically favored from its standard cell potential and its half-reactions. **What this lesson does not do:** the parts of a cell, anode and cathode, and the directions of electrons and ions are topic 9.8's (use them, do not teach them again); concentrations other than 1 M and the potential of a cell as it runs are topic 9.10's (the explorer's concentration sliders are left alone here, and the text says so); amounts deposited are topic 9.11's; ΔG° = −RT ln K is topic 9.5's (use it, name the topic). The hydrogen half-reaction is the table's zero in one sentence, and the hydrogen electrode is not described. No "oxidizing agent" or "reducing agent", no "emf", no sign on any electrode. **Equation sheet:** ΔG° = −nFE°, F = 96,485 C per mole of electrons and "1 volt = 1 joule per coulomb" are on it. The rule E°cell = E°cathode − E°anode is not, and neither is any table of reduction potentials: a question gives the values it needs.
- **Opening:** turn over the button cell from a watch and you will often find a number stamped into the steel: 1.55 V. Topic 9.8 showed where the cell's current comes from: zinc gives up electrons, silver oxide takes them, and the two are kept apart so that the electrons must go through the watch. This lesson is about the number: what a volt measures, why this pair of substances gives about one and a half of them, and what that has to do with ΔG°. Note for the writer: silver oxide button cells are stamped 1.55 V (sure). Do not explain the stamp yet; worked example 2 comes back to it.
- **Section "What a volt measures":**
  - Electrons in the wire of a galvanic cell go from the anode to the cathode (topic 9.8) because the cell's reaction is thermodynamically favored. The **cell potential**, $E_\text{cell}$, measures how hard the reaction pushes them: it is the energy that each coulomb of charge gives up on its way through the wire from the anode to the cathode. Its unit is the volt, and one volt is one joule per coulomb. (The equation sheet prints that line.) A meter joined to the two electrodes reads the cell potential.
  - The potential depends on the concentrations (topic 9.10), so chemists agree on one set of conditions for the tables. The **standard cell potential**, $E^\circ_\text{cell}$, is the cell potential when every substance is in its standard state: every solute at 1 M, every gas at 1 bar (very nearly 1 atm), every solid and liquid pure. The values in this lesson are for 25 °C. The little circle means what it meant on ΔH° and ΔG° (topics 6.8 and 9.3).
- **Section "A table of reductions":**
  - A meter can only compare two half-cells: no half-reaction runs alone (topic 4.9), so no half-cell has a potential that can be measured alone. Chemists therefore chose one half-reaction as the zero of the scale, the reduction of hydrogen ions to hydrogen gas, and gave every other half-reaction the potential it shows against that one. The result is the **standard reduction potential**, $E^\circ$, of a half-reaction: a number in volts that says how strongly the half-reaction pulls toward reduction, on a scale where hydrogen's is 0.00 V by definition.
  - Tables write the half-reaction as a reduction, electrons on the left, whichever way it will run in your cell. The table (two columns), with one sentence before it saying that these are the values this lesson uses and that an exam question gives the ones it needs:

    | Half-reaction, written as a reduction | $E^\circ$ (V) |
    |---|---|
    | Ag⁺(aq) + e⁻ → Ag(s) | +0.80 |
    | Cu²⁺(aq) + 2e⁻ → Cu(s) | +0.34 |
    | 2H⁺(aq) + 2e⁻ → H₂(g) | 0.00 |
    | Sn²⁺(aq) + 2e⁻ → Sn(s) | −0.14 |
    | Co²⁺(aq) + 2e⁻ → Co(s) | −0.28 |
    | Cd²⁺(aq) + 2e⁻ → Cd(s) | −0.40 |
    | Cr³⁺(aq) + 3e⁻ → Cr(s) | −0.74 |

    (In the lesson the half-reactions are in math with `\ce{}`; the table has two columns.)
  - What the order means. The higher a half-reaction stands, the more strongly it pulls toward reduction. Ag⁺ at the top takes electrons more readily than any other ion in this table. Chromium metal at the bottom is the one whose half-reaction is most easily pushed backward: of these metals it gives up electrons most readily. A negative value is not a verdict on the half-reaction. It only says the half-reaction stands below hydrogen's.
  - Put two half-cells together and they compete for the electrons. **The half-reaction with the higher reduction potential wins: it runs as written, as the reduction, at the cathode. The other is forced to run backward, as the oxidation, at the anode.** That is the rule for a galvanic cell at standard conditions.
  - The standard cell potential is the gap between the two. Display:

    $$E^\circ_\text{cell} = E^\circ_\text{cathode} - E^\circ_\text{anode}$$

    Both values go in exactly as the table prints them, as reduction potentials, signs included. Do not change the sign of the anode's value before you subtract: the minus sign in the equation already accounts for that half-reaction running backward. This equation is not on the equation sheet.
  - One line of example in the text, not a worked example: for cobalt and tin, tin's half-reaction is the higher of the two (−0.14 V against −0.28 V), so Sn²⁺ is reduced and cobalt is oxidized, and E°cell = −0.14 − (−0.28) = +0.14 V. Two negative potentials still make a cell with a positive one. Set the subtraction as display math.
  - `<KeyIdea>`: in a galvanic cell at standard conditions, the half-reaction with the higher standard reduction potential is the reduction, at the cathode. The standard cell potential is the cathode's value minus the anode's, both taken from the table as they stand.
- **Check 1**, `<Check numeric="0.90" unit="V">`: "A galvanic cell is made from a manganese strip in a 1 M solution of Mn²⁺ ions and a cobalt strip in a 1 M solution of Co²⁺ ions, at 25 °C. The standard reduction potentials are −1.18 V for Mn²⁺(aq) + 2e⁻ → Mn(s) and −0.28 V for Co²⁺(aq) + 2e⁻ → Co(s). What is the standard cell potential, in V?" (Set the two half-reactions as display math, each with its value.) Why: cobalt's half-reaction has the higher reduction potential, so Co²⁺ is reduced at the cobalt strip, the cathode, and manganese is oxidized at the anode. E°cell = −0.28 − (−1.18) = +0.90 V (display math). A galvanic cell's potential comes out positive: if yours is negative, the two values are the wrong way around. Slips:
  - `1.46` (the two sizes added, 1.18 + 0.28): "That is what adding the two sizes gives. E°cell is a difference: the cathode's value minus the anode's, each with the sign the table gives it."
  - `-0.90` (anode minus cathode): "Did you subtract the wrong way around? The half-reaction with the higher reduction potential is the cathode's, and its value comes first."
  - `-1.46` (the two potentials added with their signs): "Did you add the two potentials? E°cell is the cathode's value minus the anode's, each with the sign the table gives it."

  Note for the writer: manganese is not in the lesson's table on purpose, so the question's own values are the only ones to hand. Give no equation for the cell here.
- **Check 2**, `<Check answer={1}>`: "A strip of cobalt is lowered into a solution that holds Sn²⁺, Cd²⁺ and Cr³⁺ ions, each at 1 M. The standard reduction potentials are −0.14 V for Sn²⁺/Sn, −0.28 V for Co²⁺/Co, −0.40 V for Cd²⁺/Cd and −0.74 V for Cr³⁺/Cr. For which of the three ions is its reduction by cobalt metal thermodynamically favored?" Options:
  1. Sn²⁺ only
  2. Cd²⁺ and Cr³⁺, but not Sn²⁺
  3. All three: Sn²⁺, Cd²⁺ and Cr³⁺
  4. None of the three

  Why: cobalt is the only metal there, so in any reaction it is the one oxidized, and its half-reaction is the anode's: −0.28 V. For each ion, take cathode minus anode. Sn²⁺: −0.14 − (−0.28) = +0.14 V. Cd²⁺: −0.40 − (−0.28) = −0.12 V. Cr³⁺: −0.74 − (−0.28) = −0.46 V. (Three lines of display math.) Only the first is positive, so only tin(II) ions are reduced by cobalt in a favored reaction, and tin can form on the strip. A metal reduces the ions that stand above it in the table, not the ones below it. Having a negative potential does not stop an ion from being reduced: Sn²⁺ has one. Misses:
  - 2: "Those two stand below cobalt in the table. For a favored reaction, must the half-reaction that is reduced stand above or below the one that is oxidized?"
  - 3: "Cobalt is the anode in each case. Work out cathode minus anode for each ion separately, and look at the sign of each answer."
  - 4: "A negative reduction potential does not rule an ion out. Work out cathode minus anode for each ion, with cobalt as the anode."

  Note for the writer: the question asks what is favored, not what is seen, because favored does not mean fast (topic 9.4). Do not add a sentence about the strip's appearance beyond "tin can form on the strip".
- **Section "From volts to free energy":**
  - A volt is a joule per coulomb, so a cell potential times the charge that passes is an energy. For one mole of reaction the charge is $n$ moles of electrons, and each mole of electrons carries 96,485 C. That number is **Faraday's constant**, $F$: the charge of one mole of electrons, 96,485 C/mol. So $nF$ is the charge in coulombs, and $nFE^\circ$ is the electrical energy the reaction can deliver, in joules. The free energy of the chemicals falls by that much. Display:

    $$\Delta G^\circ = -nFE^\circ$$

    This equation is on the equation sheet, and so is the value of $F$.
  - The three things to get right, as a short list:
    - **$n$ comes from the balanced overall equation.** It is the number of moles of electrons that pass from the anode to the cathode for one mole of reaction: the number that canceled when the two half-reactions were added (topic 4.9). It is not read off whichever half-reaction you happen to look at.
    - **The answer is in joules.** Volts times coulombs are joules. ΔG° values are quoted in kJ/mol_rxn, so the conversion is a line of its own.
    - **The minus sign.** A positive E° gives a negative ΔG°: a cell that runs by itself runs a thermodynamically favored reaction. A negative E° gives a positive ΔG°.
  - **A potential is never multiplied.** To make the electrons cancel you often multiply a half-reaction by 2 or 3. Its $E^\circ$ stays as the table printed it. A potential is energy per coulomb. Doubling a half-reaction doubles the coulombs and doubles the joules, and the joules per coulomb do not change, just as the price per kilogram does not change when you buy two kilograms. The amount of reaction does matter to the energy, and it comes in through $n$: that is what $n$ is for.
  - `<KeyIdea>`: $\Delta G^\circ = -nFE^\circ$. Multiply a half-reaction as you must to balance the electrons, but never its potential. The size of the reaction enters once, through $n$, the moles of electrons in the balanced overall equation.
- **Worked example "Cadmium and silver":** a galvanic cell has a cadmium strip in 1.0 M cadmium nitrate solution and a silver strip in 1.0 M silver nitrate solution, at 25 °C. The standard reduction potentials are −0.40 V for Cd²⁺(aq) + 2e⁻ → Cd(s) and +0.80 V for Ag⁺(aq) + e⁻ → Ag(s). Which strip is the cathode? Find the standard cell potential, the balanced equation and ΔG°.
  1. **Find the cathode.** Silver's half-reaction has the higher reduction potential, so it runs as written: Ag⁺ ions are reduced at the silver strip, the cathode. Cadmium's runs backward: Cd(s) → Cd²⁺(aq) + 2e⁻, at the cadmium strip, the anode.
  2. **Subtract, cathode minus anode.** Display: $E^\circ_\text{cell} = 0.80 - (-0.40) = 1.20\ \text{V}$.
  3. **Balance the electrons.** Each cadmium atom gives up 2 electrons and each silver ion takes 1, so the silver half-reaction is doubled: 2Ag⁺(aq) + 2e⁻ → 2Ag(s). The half-reaction was doubled and its potential was not: step 2 used the table's value as it stands, and that value is not touched again. Add the two halves (display, split after the arrow): Cd(s) + 2Ag⁺(aq) → Cd²⁺(aq) + 2Ag(s). Check: charge +2 on each side.
  4. **Count the electrons.** Two electrons canceled, so $n = 2$.
  5. **Find ΔG°, in joules first.** Display, numbers only: $\Delta G^\circ = -(2)(96{,}485)(1.20) = -231{,}564$, in J/mol_rxn.
  6. **Convert, and check the sign.** −231,564 J is −232 kJ/mol_rxn (its own line). The potential is positive and ΔG° is negative, as they must be for a cell that runs by itself.

  Note for the writer: step 3 says once, in words, that the potential is not multiplied, and gives no wrong number: do not write what a doubled silver potential would come to, here or anywhere in the lesson. The one wrong value the lesson names is in step 5 of the explorer's list, for chromium with copper, where the explorer's own reading sits beside it. This cell is worked state 3 of the explorer (1.20 V, −232 kJ/mol_rxn): step 4 of the explorer's list has the student build it and compare.
- **Check 3**, `<Check numeric="-347" unit="kJ/mol">`: "Chromium metal reduces tin(II) ions: 2Cr(s) + 3Sn²⁺(aq) → 2Cr³⁺(aq) + 3Sn(s). The standard reduction potentials are −0.74 V for Cr³⁺(aq) + 3e⁻ → Cr(s) and −0.14 V for Sn²⁺(aq) + 2e⁻ → Sn(s). What is ΔG° for the reaction as written, in kJ/mol_rxn? Give the answer with its sign. (F = 96,485 C per mole of electrons.)" (Set the equation as display math, split after the arrow.) Why: tin's half-reaction is the reduction, so E°cell = −0.14 − (−0.74) = +0.60 V. To balance the electrons, chromium's half-reaction is multiplied by 2 and tin's by 3, so 6 electrons cancel: n = 6. Neither potential is multiplied. ΔG° = −(6)(96,485)(0.60) = −347,346 J/mol_rxn, which is −347 kJ/mol_rxn. (Display math, numbers only, then the conversion on its own line.) Slips:
  - `347` (the sign dropped): "A positive E° means a favored reaction. What sign must ΔG° have, and what does the minus sign in ΔG° = −nFE° do?"
  - `-347346` (left in joules): "That is ΔG° in joules, which is what volts times coulombs gives. The question asks for kilojoules."
  - `-116` (n = 2, from tin's half-reaction): "That is what n = 2 gives. n is the number of electrons that cancel when the two half-reactions are multiplied and added."
  - `-174` (n = 3, from chromium's half-reaction): "That is what n = 3 gives. n is the number of electrons that cancel when the two half-reactions are multiplied and added."
  - `-614` (each potential multiplied by its coefficient: 3(−0.14) − 2(−0.74) = 1.06 V): "Did you multiply each potential by its coefficient? A potential is energy per coulomb. It does not change when a half-reaction is multiplied."
  - `-509` (the two sizes added: 0.88 V): "Did you add the two potentials? E°cell is the cathode's value minus the anode's, each with the sign the table gives it."
  - `-289` (n = 5, the electrons of the two half-reactions added): "That is what n = 5 gives. The electrons of the two half-reactions are not added: each half is multiplied until both have the same number."

  Accepted answers (2 percent of 347): −340.1 to −353.9, so −347, −347.4 (from F = 96,500) and the two-figure −350 all pass.
- **The interactive diagram:** place `<GalvanicCell />` here, after Check 3, under a sentence that says what it is: two half-cells, each a metal in a solution of its own ion, joined by a wire with a meter and by a salt bridge of potassium nitrate, at 25 °C. You choose the metal on each side. (Each side also has a slider for the concentration of its ion. Leave both at 1.0 M in this lesson: topic 9.10 is about what they do.) The ladder beside the cell is the table of this lesson stood on end. The text then asks the student to do these things, as a numbered list, predicting before each move:
  1. **Read the starting cell.** Tin is on the left and silver on the right. Before you look at the labels, find the two rungs on the ladder and say which metal is the cathode. (Silver, the higher rung. The gap between the rungs is E°cell, 0.94 V. The equation is Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s), 2 mol of electrons pass for each mole of reaction, and ΔG° is −181 kJ/mol_rxn.)
  2. **Trade the two sides.** Choose silver on the left and tin on the right. Predict what changes. (The labels "anode" and "cathode", the electron arrow and the arrows in the salt bridge all change sides. No number changes: still 0.94 V and −181 kJ/mol_rxn. Which beaker stands on the left has nothing to do with which is the anode.)
  3. **Put cobalt in place of tin.** Cobalt with silver. Predict the potential from the table first. (0.80 − (−0.28) = 1.08 V; n = 2; −208 kJ/mol_rxn. Silver's coefficient of 2 in the equation has doubled nothing.)
  4. **Build the worked example.** Cadmium with silver: 1.20 V and −232 kJ/mol_rxn, as calculated above. Keep those two numbers in mind for the next step.
  5. **Rank two cells twice.** The next cell is chromium with copper. Before you build it, predict from the table whether its potential is higher or lower than the cadmium and silver cell's, and then whether its ΔG° is more negative or less. (0.34 − (−0.74) = 1.08 V, which is lower than 1.20 V. But the equation is 2Cr(s) + 3Cu²⁺(aq) → 2Cr³⁺(aq) + 3Cu(s), 6 mol of electrons pass for each mole of reaction, and ΔG° is −625 kJ/mol_rxn, about 2.7 times the cadmium and silver cell's −232. Ranked by potential, cadmium with silver comes first. Ranked by free energy for each mole of reaction, chromium with copper does. Each coulomb gives up less energy in the chromium cell, and three times as many coulombs pass. And if you predicted 2.50 V, you multiplied each potential by its coefficient, 3 for copper's and 2 for chromium's: the explorer's meter shows 1.08 V.)

  The numbers in parentheses are for the writer to phrase as "you should see". They are the module's values (see "Diagram data", worked states 1 to 5; the list builds state 3 before state 5). Note for the writer: step 5 compares chromium with copper against cadmium with silver only. Cobalt with silver (step 3) happens to have the same 1.08 V as chromium with copper: do not point that out, and do not set two cells of equal potential side by side anywhere in the lesson. The wrong value in step 5 (2.50 V) is given in words, never as a line of math. The explorer can also pair copper with silver. The lesson's text never names that pairing or its numbers: it is the cell most used in the teacher's own materials.
- **Worked example "The watch battery, two ways":** the silver oxide cell of topic 4.7 runs on Zn(s) + Ag₂O(s) → ZnO(s) + 2Ag(s). Inside the cell the solids sit in a paste of potassium hydroxide, a strong base, so its two half-reactions are written with hydroxide ions. A table gives them as reductions (display math, each with its value):

  Ag₂O(s) + H₂O(l) + 2e⁻ → 2Ag(s) + 2OH⁻(aq), E° = +0.34 V

  ZnO(s) + H₂O(l) + 2e⁻ → Zn(s) + 2OH⁻(aq), E° = −1.26 V

  The standard free energies of formation are −320.5 kJ/mol for ZnO(s) and −11.2 kJ/mol for Ag₂O(s). Find E°cell, then find ΔG° twice: from the potential, and from the formation values.
  1. **Find the cathode.** The silver oxide half-reaction has the higher potential, so it is the reduction: Ag₂O is reduced at the cathode. The zinc half-reaction runs backward: zinc is oxidized at the anode. That agrees with the oxidation numbers of topic 4.7.
  2. **Subtract.** Display: $E^\circ_\text{cell} = 0.34 - (-1.26) = 1.60\ \text{V}$.
  3. **Add the halves and count the electrons.** Each half-reaction has 2 electrons, so neither is multiplied, and $n = 2$. The water and the hydroxide ions appear once on each side and cancel, which leaves the equation of topic 4.7.
  4. **ΔG° from the potential.** Display: $\Delta G^\circ = -(2)(96{,}485)(1.60) = -308{,}752$, in J/mol_rxn, which is −309 kJ/mol_rxn (own line).
  5. **ΔG° from formation values** (topic 9.3). Zinc and silver are elements in their standard states, so each has ΔG°f = 0. Display, two lines in `aligned`, numbers only, each term as coefficient(value): $\Delta G^\circ = [1(-320.5) + 2(0)] - [1(0) + 1(-11.2)] = -309.3$, in kJ/mol_rxn.
  6. **Compare.** −309 kJ/mol_rxn from a meter reading and −309.3 kJ/mol_rxn from a table of free energies: two roads to one number. A potential is a free energy change, counted per coulomb.

  After the worked example, two sentences: the cell's standard potential, 1.60 V, is close to the 1.55 V often stamped on it. The stamp is the voltage the maker promises while the cell is delivering current, which is a little below what a meter reads on a fresh cell that is delivering almost none. Note for the writer: a fresh silver oxide cell reads about 1.6 V on a meter and is rated 1.55 V (fairly sure) **(verify)**. Say no more than those two sentences about it. A half-reaction in base is always given by the question in this unit: do not show how to balance one.
- **Section "Potential, free energy and K on one scale":**
  - Topic 9.5 tied ΔG° to the equilibrium constant: ΔG° = −RT ln K. This lesson ties ΔG° to the cell potential. So for a redox reaction the three numbers cannot be chosen separately: fix one and the other two follow.
  - Place the figure `9-9-three-rulers.svg` here, with one sentence: the three rulers are drawn for a reaction in which 2 mol of electrons pass, at 298 K, and any vertical line across them picks out a matching E°cell, ΔG° and K.
  - Read the figure outward from its dashed line, in one paragraph and not as a list or a table. To the right of the line, the half-reaction written as the reduction has the higher reduction potential, so cathode minus anode is positive. Then $nFE^\circ$ is a positive number of joules, energy the reaction can deliver, so ΔG° is negative, and topic 9.5 puts K above 1. To the left, the half-reaction written as the reduction has the lower potential. Cathode minus anode is negative, $nFE^\circ$ is energy that would have to be supplied, ΔG° is positive and K is below 1. On the line itself the two half-reactions pull equally hard, as two identical half-cells would: nothing is gained in either direction, and K is 1.
  - **K from a cell potential** takes the two steps you already have, and no new equation: E°cell gives ΔG°, and ΔG° gives K. For the cadmium and silver cell, ΔG° is −231,564 J/mol_rxn (keep the joules, because R is in joules). Display, two lines: $\ln K = \dfrac{-\Delta G^\circ}{RT} = \dfrac{231{,}564}{(8.314)(298)} = 93.46$, so $K = e^{93.46} = 4 \times 10^{40}$. That is far off the right-hand end of the figure's bottom ruler: a potential of little more than a volt belongs to a reaction that goes, for every practical purpose, to completion. This K is K_c, written with the molarities of the two ions (topic 7.3 leaves the solid metals out).
  - Two sentences to keep: a large E°cell says the reaction is strongly favored. It says nothing about how fast the reaction goes (topic 9.4).
- **Check 4**, `<Check answer={4}>`: "For 2Cr(s) + 3Cd²⁺(aq) → 2Cr³⁺(aq) + 3Cd(s), the standard cell potential is 0.34 V at 25 °C. (F = 96,485 C per mole of electrons, and R = 8.314 J/(mol·K).) About how large is the equilibrium constant K at 298 K?" (Set the equation as display math, split after the arrow.) Options:
  1. About 3 × 10⁻³⁵, so almost no products at equilibrium
  2. About 3 × 10¹¹, so products are strongly favored
  3. About 2 × 10¹⁷, so products are very strongly favored
  4. About 3 × 10³⁴, so almost no reactants are left

  Why: chromium's half-reaction has 3 electrons and cadmium's has 2, so the balanced equation exchanges 6: n = 6. ΔG° = −(6)(96,485)(0.34) = −196,829 J/mol_rxn. Then ln K = 196,829 ÷ ((8.314)(298)) = 79.44, and K = e^79.44 = 3 × 10³⁴. (Display math for each line.) Taking n as 2, from cadmium's half-reaction, gives 3 × 10¹¹, and taking it as 3, from chromium's, gives 2 × 10¹⁷: n sits in the exponent of K, so a wrong n is not a small error. A positive potential cannot give a K below 1. Misses:
  - 1: "A positive E° gives a negative ΔG°. On which side of 1 does K lie when ΔG° is negative?"
  - 2: "That is what n = 2 gives. Count the electrons that cancel when both half-reactions have been multiplied so that they match."
  - 3: "That is what n = 3 gives. Count the electrons that cancel when both half-reactions have been multiplied so that they match."

  Note for the writer: this is a choice because K = e^79.44 cannot be typed safely (the design's section 5): at 298.15 K the same arithmetic gives 3.1 × 10³⁴ against 3.2 × 10³⁴ at 298 K, and both are "about 3 × 10³⁴". The figure above is for n = 2 and stops at 0.30 V, so it does not answer this Check.
- **Section "When the potential is negative":**
  - Write a cell reaction in the direction that is not favored and the subtraction says so. Take the explorer's first cell, tin with silver, and write its equation backward: 2Ag(s) + Sn²⁺(aq) → 2Ag⁺(aq) + Sn(s) (display). As written, silver is oxidized, so now silver's half-reaction is the anode's and tin's is the cathode's. Display: $E^\circ_\text{cell} = -0.14 - 0.80 = -0.94\ \text{V}$. Then ΔG° = −(2)(96,485)(−0.94) = +181,392 J/mol_rxn, which is +181 kJ/mol_rxn (display, with the conversion on its own line): thermodynamically unfavored. Compare the explorer's readout for the forward cell, 0.94 V and −181 kJ/mol_rxn. Writing a reaction backward changes the sign of E°cell and the sign of ΔG°, and it changes nothing else.
  - A reaction with a negative E°cell cannot run a galvanic cell at standard conditions. It can be made to go in an electrolytic cell (topic 9.8), where a power supply pushes the electrons the way the reaction will not send them. The supply must provide more than the size of the negative potential: here, more than 0.94 V at standard conditions. (Keep "more than": real cells need extra voltage, and the lesson does not say how much.)
  - `<KeyIdea>`: a positive E°cell means a negative ΔG° and a K greater than 1: a favored reaction, which can run a galvanic cell. A negative E°cell means a positive ΔG° and a K less than 1: an unfavored reaction, which cannot run a galvanic cell at standard conditions. A power supply can drive it in an electrolytic cell.
- **Check 5**, `<Check answer={3}>`: "A student writes this equation for a cell: Sn(s) + Cd²⁺(aq) → Sn²⁺(aq) + Cd(s). The standard reduction potentials are −0.14 V for Sn²⁺/Sn and −0.40 V for Cd²⁺/Cd. Which statement about the reaction as written, at standard conditions, is correct?" (Set the equation as display math.) Options:
  1. E° is +0.26 V: favored, so it could run a galvanic cell as written
  2. E° is −0.26 V, so ΔG° is negative and K is greater than 1
  3. E° is −0.26 V: unfavored, but a power supply could drive it
  4. E° is −0.26 V: favored, but too slow to give a measurable current

  Why: as written, tin is oxidized and Cd²⁺ is reduced, so cadmium's half-reaction is the cathode's: E° = −0.40 − (−0.14) = −0.26 V (display math). A negative potential means a positive ΔG° (here +50 kJ/mol_rxn, from −(2)(96,485)(−0.26) = +50,172 J) and a K below 1: the reaction is unfavored as written. An electrolytic cell with a supply of more than 0.26 V could force it. The first option subtracts the wrong way around: it is the potential of the reverse reaction. The second forgets the minus sign in ΔG° = −nFE°. The fourth mixes up favored with fast: a potential says nothing about rate. Misses:
  - 1: "Which metal is oxidized in the equation as written? Its half-reaction is the anode's, and E°cell is the cathode's value minus the anode's."
  - 2: "Look at the minus sign in ΔG° = −nFE°. With n and F both positive, what sign of ΔG° goes with a negative E°?"
  - 4: "A potential says nothing about speed. What does the sign of E° tell you about the sign of ΔG°?"
- **Check 6**, `<Check numeric="1.21" unit="V">`, the last Check, after one linking sentence (the equation runs backward too: a ΔG° from a table of formation values gives the potential a cell could have): "A fuel cell makes electricity from methanol and oxygen: CH₃OH(l) + 3/2 O₂(g) → CO₂(g) + 2H₂O(l). For this reaction ΔG° = −702.0 kJ/mol_rxn at 25 °C. In it the oxidation number of carbon goes from −2 to +4. What is the standard cell potential, in V? (F = 96,485 C per mole of electrons.)" (Set the equation as display math, split after the arrow, with the fraction written $\tfrac{3}{2}$.) Why: one carbon atom reacts in each mole of reaction and its oxidation number rises by 6, so 6 mol of electrons pass: n = 6. (The oxygen agrees: three oxygen atoms each go from 0 to −2.) ΔG° must be in joules: −702,000 J/mol_rxn. Rearranged, E° = −ΔG° ÷ (nF) = 702,000 ÷ ((6)(96,485)) = 1.21 V (display math, numbers only; 1.2126 before rounding). A favored reaction, a negative ΔG°, a positive potential. Slips:
  - `1.82` (n = 4, the electrons one O₂ molecule takes): "That is what n = 4 gives. Carbon's oxidation number rises by 6, and one carbon atom reacts in each mole of reaction."
  - `3.64` (n = 2): "That is what n = 2 gives. Carbon's oxidation number rises by 6, and one carbon atom reacts in each mole of reaction."
  - `7.28` (n left out): "Did you leave out n? In ΔG° = −nFE°, n is the moles of electrons that pass for each mole of reaction."
  - `1.21e-3` (ΔG° left in kilojoules): "Did ΔG° go in as kilojoules? A volt is a joule per coulomb, so ΔG° must be in joules before you divide."
  - `-1.21` (the sign carried over): "A favored reaction has a negative ΔG° and a positive E°. Check what the minus sign in ΔG° = −nFE° does."
  - `0.606` (n = 12, from doubling the equation to clear the fraction but keeping −702.0 kJ): "That is what n = 12 gives. The equation as written has one CH₃OH, and ΔG° is for that equation. How many electrons does one carbon atom give up?"
  - `2.43` (n = 3, one electron per oxygen atom): "That is what n = 3 gives. The equation as written has one CH₃OH. How many electrons does its carbon atom give up when its oxidation number changes?"

  Note for the writer: methanol fuel cells are real, and 1.21 V is their standard potential. A working cell gives well under that, which the lesson does not go into. Say "a fuel cell" and nothing about how one is built: fuel cells are not content to know.
- **Trap:** **Multiplying a potential by a coefficient** (multiply the half-reaction, never its E°: a potential is energy per coulomb). **Changing the sign of the anode's value and then subtracting it as well** (both values go into cathode minus anode exactly as the table prints them). **Taking n from one half-reaction** (n is the number of electrons that cancel in the balanced overall equation: 6 for chromium with tin(II), not 2 or 3). **Leaving −nFE° in joules** and calling it kilojoules, or putting kilojoules into −RT ln K. **Reading a positive E° as a positive ΔG°** (the signs are opposite: a positive potential is a favored reaction). **Taking the beaker on the left for the anode** (the anode is where oxidation happens, wherever it stands). **Reading a large potential as a fast reaction.**
- **Key points:** a standard reduction potential, E°, says how strongly a half-reaction pulls toward reduction, on a scale where 2H⁺(aq) + 2e⁻ → H₂(g) is 0.00 V, and tables write every half-reaction as a reduction; in a galvanic cell at standard conditions the half-reaction with the higher E° is the reduction at the cathode, and E°cell = E°cathode − E°anode with both values as the table prints them; multiplying a half-reaction to balance the electrons never changes its potential, because a volt is a joule per coulomb; ΔG° = −nFE°, where n is the moles of electrons in the balanced overall equation and F = 96,485 C per mole of electrons, and the answer is in joules; E°cell, ΔG° and K of a redox reaction fix one another: when the cathode's reduction potential is the higher one, E°cell is positive, ΔG° is negative and K is greater than 1, and K comes from E°cell in two steps, through ΔG°; a reaction with a negative E°cell is thermodynamically unfavored: it cannot run a galvanic cell at standard conditions, and a power supply can drive it in an electrolytic cell.

**Figures**

- **`9-9-three-rulers.svg`** (viewBox 0 0 480 330, font-size 18). Three horizontal rulers, one above another, sharing one horizontal scale: a point's distance from the center line is proportional to E°cell, with x = 250 + 600 × E°cell (E°cell in volts). Every tick below is placed by the brief's script.
  - **Shading.** The right half (x from 250 to 440, y from 44 to 286) is filled with the light accent color and hatched with thin diagonal lines in the accent color. The left half is the plain background. A dashed vertical line in ink at x = 250, from y = 44 to y = 286, crosses all three rulers.
  - **Top line of text** (y = 26, centered at x = 250): "2 mol of electrons, 298 K".
  - **Ruler 1, E°cell.** Its name "E°cell (V)" at x = 70, y = 70, left-aligned. A horizontal line in ink at y = 96 from x = 70 to x = 430. Ticks (10 units tall, upward from the line) every 0.05 V, thirteen in all, at x = 70, 100, 130, 160, 190, 220, 250, 280, 310, 340, 370, 400, 430. Labels under the line (y = 120), centered on their ticks: "−0.30" at x = 70, "−0.15" at x = 160, "0" at x = 250, "+0.15" at x = 340, "+0.30" at x = 430.
  - **Ruler 2, ΔG°.** Its name "ΔG° (kJ/mol)" at x = 70, y = 150. A line at y = 176 from x = 70 to x = 430. ΔG° = −nFE° with n = 2, so x = 250 − 3.1093 × ΔG° (ΔG° in kJ/mol): positive values lie to the left. Ticks every 10 kJ/mol, eleven in all, at x = 94.5 (+50), 125.6 (+40), 156.7 (+30), 187.8 (+20), 218.9 (+10), 250.0 (0), 281.1 (−10), 312.2 (−20), 343.3 (−30), 374.4 (−40), 405.5 (−50). Labels under the line (y = 200): "+40" at x = 125.6, "+20" at x = 187.8, "0" at x = 250, "−20" at x = 312.2, "−40" at x = 374.4. The ruler's ends, at x = 70 and x = 430, are +57.9 and −57.9 kJ/mol and carry no label.
  - **Ruler 3, K.** Its name "K" at x = 70, y = 230. A line at y = 256 from x = 70 to x = 430. K = e^(nFE°/RT) with n = 2 and T = 298 K, so x = 250 + 17.738 × log K. Ticks at every whole power of ten from 10⁻¹⁰ to 10¹⁰, twenty-one in all, 17.74 units apart: the ones for 10⁻¹⁰, 10⁻⁵, 1, 10⁵ and 10¹⁰ are at x = 72.6, 161.3, 250.0, 338.7 and 427.4 and are 10 units tall; the others are 6 units tall. Labels under the line (y = 280): "10⁻¹⁰" at x = 72.6, "10⁻⁵" at x = 161.3, "1" at x = 250, "10⁵" at x = 338.7, "10¹⁰" at x = 427.4. The ruler's ends, at x = 70 and x = 430, are K = 10⁻¹⁰·¹⁵ and 10¹⁰·¹⁵ and carry no label.
  - **Bottom line of text** (y = 314): "unfavored" centered at x = 160, and "favored" centered at x = 340.
  - Text in the figure, twenty-one pieces: the top line; three ruler names; five labels on each of the three rulers; "unfavored" and "favored".
  - The favored half differs from the unfavored half by its hatching as well as its tint.
  - Alt: "Three horizontal rulers stacked on one scale, for a reaction in which 2 moles of electrons pass, at 298 kelvins. The top ruler is the standard cell potential, from negative 0.30 volts at the left to positive 0.30 volts at the right. The middle ruler is delta G standard, from about positive 58 kilojoules per mole at the left to about negative 58 at the right. The bottom ruler is K on a logarithmic scale, from about 10 to the negative 10 at the left to about 10 to the 10 at the right. One dashed vertical line passes through zero volts, zero kilojoules and K equal to 1. The half to the right of it is hatched and labeled favored, and the half to the left is labeled unfavored."
  - Caption: "Three scales with one line across them. A positive cell potential, a negative ΔG° and a K greater than 1 lie on the same side of the line. Each tenth of a volt here is 19.3 kJ/mol and a factor of about 2,400 in K."
  - Note for the writer: the caption's two numbers are (2)(96,485)(0.10) = 19,297 J and 10^3.38 = 2,400 (2,413 before rounding). Do not turn them into a rule of volts per power of ten.

**Diagram data** (for the builder of `src/lib/galvanic-cell.ts` and `<GalvanicCell />`; the design's section 6.1 fixes what the diagram shows)

- **Constants,** all from the site's equation page: R = 8.314 J/(mol·K); F = 96,485 C per mole of electrons; T = 298.15 K (25 °C; the equation page's K = °C + 273.15). From them the module's one irrational number: RT ln 10 ÷ F = 0.0591563 V (to six figures), the change in E for a factor of ten in Q when n = 1.
- **The half-cells** (the choice control on each side, in this order, top of the ladder first). The module keeps E° in whole hundredths of a volt.

  | Metal | Ion | Electrons | Half-reaction, as a reduction | E° (V) | E° in hundredths | Source and how sure |
  |---|---|---|---|---|---|---|
  | Silver | Ag⁺ | 1 | Ag⁺(aq) + e⁻ → Ag(s) | +0.80 | 80 | standard tables, +0.7996; sure |
  | Copper | Cu²⁺ | 2 | Cu²⁺(aq) + 2e⁻ → Cu(s) | +0.34 | 34 | standard tables, +0.342; sure |
  | Tin | Sn²⁺ | 2 | Sn²⁺(aq) + 2e⁻ → Sn(s) | −0.14 | −14 | standard tables, −0.138; sure |
  | Cobalt | Co²⁺ | 2 | Co²⁺(aq) + 2e⁻ → Co(s) | −0.28 | −28 | standard tables, −0.28; sure |
  | Cadmium | Cd²⁺ | 2 | Cd²⁺(aq) + 2e⁻ → Cd(s) | −0.40 | −40 | standard tables, −0.403; sure |
  | Chromium | Cr³⁺ | 3 | Cr³⁺(aq) + 3e⁻ → Cr(s) | −0.74 | −74 | standard tables, −0.744; sure (one common table prints −0.73) |

- **Controls.**

  | Control | Values | Starts at |
  |---|---|---|
  | Metal of the left half-cell | the six metals above | tin |
  | Concentration of the left ion | 0.0010 M, 0.010 M, 0.10 M, 1.0 M (a slider of four stops; the module keeps the exponent −3, −2, −1 or 0) | 1.0 M |
  | Metal of the right half-cell | the six metals above | silver |
  | Concentration of the right ion | the same four stops | 1.0 M |

  That is 6 × 4 × 6 × 4 = 576 states.
- **The model, two different metals.** Call the metal with the lower E° A (ion charge a) and the one with the higher E° C (ion charge c).
  - C's half-cell is the cathode and A's is the anode, in every one of these states (see "Limits").
  - n is the least common multiple of a and c: 2, 3 or 6. The overall equation, in lowest whole numbers, is (n/a) A(s) + (n/c) C^c+(aq) → (n/a) A^a+(aq) + (n/c) C(s), with a coefficient of 1 not written.
  - E°cell = E°(C) − E°(A), exact in hundredths of a volt and shown to 0.01 V.
  - ΔG° = −nFE°cell, in joules, exact (n × 96,485 × hundredths ÷ 100), shown in kJ/mol_rxn to the nearest whole number. No pair sits on a rounding tie (the nearest is cadmium with silver, 231.56).
  - Q = [A^a+]^(n/a) ÷ [C^c+]^(n/c), solids left out. The concentrations are powers of ten, so log Q = (n/a)(exponent of A's ion) − (n/c)(exponent of C's ion), a whole number from −6 to 9 over all states. Q is shown as "1.0" when log Q = 0 and otherwise as "1.0 × 10" with log Q as the exponent.
  - The shift is −(RT ln 10 ÷ (nF)) × log Q, in volts, rounded once to 0.001 V. E is shown as E°cell plus that rounded shift, to 0.001 V. The shown E, the shown E°cell and the shown shift therefore always add up.
- **The model, the same metal on both sides** (a concentration cell; ion charge z).
  - E°cell = 0 and ΔG° = 0. n = z.
  - With unequal concentrations, the half-cell with the lower concentration is the anode: metal is oxidized there, and the ion is reduced in the other. Q = [ion in the dilute half-cell] ÷ [ion in the concentrated half-cell], so log Q is the lower exponent minus the higher one: −1, −2 or −3. E = −(RT ln 10 ÷ (zF)) × log Q, which is positive, rounded to 0.001 V.
  - With equal concentrations, Q = 1 and K = 1, so E = 0: nothing flows, neither electrode is an anode or a cathode, and the drawing shows no electron arrow, no ion arrows and no "loses mass" or "gains mass".
- **The direction rule,** stated once for both kinds: the cell runs in the direction for which E is positive, and with E = 0 it has no direction.
- **The drawing's labels** (the design fixes the drawing): under each beaker "anode: oxidation" or "cathode: reduction" and the half-reaction as it runs there, for one atom or ion (for example "Sn(s) → Sn²⁺(aq) + 2e⁻" and "Ag⁺(aq) + e⁻ → Ag(s)"); on each electrode "loses mass" (anode) or "gains mass" (cathode); an arrow on the wire from the anode to the cathode labeled "e⁻"; in the salt bridge "NO₃⁻" with an arrow toward the anode's beaker and "K⁺" with an arrow toward the cathode's. On the ladder the two chosen rungs are marked and the gap is labeled with E°cell. On the Q line, a mark at Q = 1 labeled "Q = 1: E = E°" and a marker at the cell's log Q. **No electrode carries a "+" or a "−".**
- **Readout sentences.** The starting state (tin, 1.0 M; silver, 1.0 M):

  > Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s). For each mole of reaction, 2 mol of electrons pass through the wire. E°cell = 0.80 − (−0.14) = 0.94 V, and ΔG° = −181 kJ/mol_rxn. Q = [Sn²⁺]/[Ag⁺]² = 1.0. Both solutions are 1.0 M, the standard condition, so E = E°cell: 0.940 V.

  The first three sentences have the same form for every pair of different metals (the cathode's E° first in the subtraction; a negative anode value in parentheses). The last part depends on the state:
  - Q = 1 with both solutions at 1.0 M: as above.
  - Q = 1 with other concentrations (tin 0.010 M, silver 0.10 M): "Q = [Sn²⁺]/[Ag⁺]² = 1.0. Q is 1, so E is equal to E°cell: 0.940 V." (The cell is not at standard conditions here, and the readout must not say that it is.)
  - Q below 1 (tin 0.0010 M, silver 1.0 M): "Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10⁻³. Q is below 1, so E is above E°cell: 1.029 V."
  - Q above 1 (tin 1.0 M, silver 0.010 M): "Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10⁴. Q is above 1, so E is below E°cell: 0.822 V."
  - A concentration cell with unequal concentrations (cobalt 0.0010 M on the left, cobalt 1.0 M on the right): "Both half-cells are cobalt, so E°cell = 0 V and ΔG° = 0. The half-cell with the lower concentration, the left one, is the anode. For each mole of Co²⁺ made there, 2 mol of electrons pass through the wire. Q = [Co²⁺, dilute]/[Co²⁺, concentrated] = 1.0 × 10⁻³. Q is below 1, so E is above zero: 0.089 V."
  - Number agreement and the state's own values: the verb follows n, so "1 mol of electrons passes" for silver (n = 1) and "2 mol of electrons pass" for n = 2 or more; the equal-concentration sentence takes the metal and the concentration from the state (chromium at 0.0010 M in worked state 21, so "Both half-cells are chromium at 0.0010 M"). The sentence below is the form for cobalt at 1.0 M.
  - A concentration cell with equal concentrations (cobalt 1.0 M on both sides): "Both half-cells are cobalt at 1.0 M, so nothing sets them apart. Q = 1 and K = 1: the cell is at equilibrium, E = 0 V and no electrons flow."
- **Every pairing of two different metals** (fifteen; each can stand either way round, which changes the sides of the labels and no number). ΔG° is in kJ/mol_rxn. "Largest shift" is the largest change in E, up or down, that the four concentrations can cause.

  | Anode | Cathode | Overall equation | n | E°cell (V) | ΔG° | Q | log Q, lowest to highest | Largest shift (V) |
  |---|---|---|---|---|---|---|---|---|
  | Copper | Silver | Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s) | 2 | 0.46 | −89 | [Cu²⁺]/[Ag⁺]² | −3 to 6 | 0.177 |
  | Tin | Silver | Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s) | 2 | 0.94 | −181 | [Sn²⁺]/[Ag⁺]² | −3 to 6 | 0.177 |
  | Tin | Copper | Sn(s) + Cu²⁺(aq) → Sn²⁺(aq) + Cu(s) | 2 | 0.48 | −93 | [Sn²⁺]/[Cu²⁺] | −3 to 3 | 0.089 |
  | Cobalt | Silver | Co(s) + 2Ag⁺(aq) → Co²⁺(aq) + 2Ag(s) | 2 | 1.08 | −208 | [Co²⁺]/[Ag⁺]² | −3 to 6 | 0.177 |
  | Cobalt | Copper | Co(s) + Cu²⁺(aq) → Co²⁺(aq) + Cu(s) | 2 | 0.62 | −120 | [Co²⁺]/[Cu²⁺] | −3 to 3 | 0.089 |
  | Cobalt | Tin | Co(s) + Sn²⁺(aq) → Co²⁺(aq) + Sn(s) | 2 | 0.14 | −27 | [Co²⁺]/[Sn²⁺] | −3 to 3 | 0.089 |
  | Cadmium | Silver | Cd(s) + 2Ag⁺(aq) → Cd²⁺(aq) + 2Ag(s) | 2 | 1.20 | −232 | [Cd²⁺]/[Ag⁺]² | −3 to 6 | 0.177 |
  | Cadmium | Copper | Cd(s) + Cu²⁺(aq) → Cd²⁺(aq) + Cu(s) | 2 | 0.74 | −143 | [Cd²⁺]/[Cu²⁺] | −3 to 3 | 0.089 |
  | Cadmium | Tin | Cd(s) + Sn²⁺(aq) → Cd²⁺(aq) + Sn(s) | 2 | 0.26 | −50 | [Cd²⁺]/[Sn²⁺] | −3 to 3 | 0.089 |
  | Cadmium | Cobalt | Cd(s) + Co²⁺(aq) → Cd²⁺(aq) + Co(s) | 2 | 0.12 | −23 | [Cd²⁺]/[Co²⁺] | −3 to 3 | 0.089 |
  | Chromium | Silver | Cr(s) + 3Ag⁺(aq) → Cr³⁺(aq) + 3Ag(s) | 3 | 1.54 | −446 | [Cr³⁺]/[Ag⁺]³ | −3 to 9 | 0.177 |
  | Chromium | Copper | 2Cr(s) + 3Cu²⁺(aq) → 2Cr³⁺(aq) + 3Cu(s) | 6 | 1.08 | −625 | [Cr³⁺]²/[Cu²⁺]³ | −6 to 9 | 0.089 |
  | Chromium | Tin | 2Cr(s) + 3Sn²⁺(aq) → 2Cr³⁺(aq) + 3Sn(s) | 6 | 0.60 | −347 | [Cr³⁺]²/[Sn²⁺]³ | −6 to 9 | 0.089 |
  | Chromium | Cobalt | 2Cr(s) + 3Co²⁺(aq) → 2Cr³⁺(aq) + 3Co(s) | 6 | 0.46 | −266 | [Cr³⁺]²/[Co²⁺]³ | −6 to 9 | 0.089 |
  | Chromium | Cadmium | 2Cr(s) + 3Cd²⁺(aq) → 2Cr³⁺(aq) + 3Cd(s) | 6 | 0.34 | −197 | [Cr³⁺]²/[Cd²⁺]³ | −6 to 9 | 0.089 |

- **The six concentration cells.** E for a ratio of 10, 100 and 1,000 between the two concentrations: silver (n = 1) 0.059, 0.118 and 0.177 V; copper, tin, cobalt and cadmium (n = 2) 0.030, 0.059 and 0.089 V; chromium (n = 3) 0.020, 0.039 and 0.059 V.
- **Limits, checked over all 576 states.**
  - **No pair of different metals reverses.** In all 480 states with two different metals, E in the direction E° gives is positive. The lowest is 0.031 V (cadmium 1.0 M with cobalt 0.0010 M: a gap of 0.12 V and a shift of −0.089 V). So the half-cell higher on the ladder is the cathode in every state, as the lesson says.
  - The 96 states with one metal: 24 have equal concentrations (E = 0, no direction) and 72 have E from 0.020 V to 0.177 V.
  - The highest E is 1.599 V (chromium 0.0010 M with silver 1.0 M) and log Q runs from −6 to 9, inside the Q line's 10⁻⁹ to 10⁹.
  - **No shown number sits on a rounding tie.** The shift nearest a tie is 0.17747 V (chromium with silver at log Q = 9, and a silver concentration cell with a ratio of 1,000), which is 0.00003 V from the boundary at 0.1775; every other shift is farther. No ΔG° is within 0.06 kJ of a half (cadmium with silver, 231.56, is the nearest).
- **Worked states** for unit tests. "Anode" and "cathode" say which side. The first five are the states lesson 9.9's text walks through; states 6 to 13 and 26 to 31 are the ones lesson 9.10 uses.

  | # | Left metal | Left (M) | Right metal | Right (M) | Anode | Cathode | n | E°cell (V) | ΔG° (kJ/mol_rxn) | log Q | Shift (V) | E (V) |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | 1 | tin | 1.0 | silver | 1.0 | left | right | 2 | 0.94 | −181 | 0 | 0.000 | 0.940 |
  | 2 | silver | 1.0 | tin | 1.0 | right | left | 2 | 0.94 | −181 | 0 | 0.000 | 0.940 |
  | 3 | cadmium | 1.0 | silver | 1.0 | left | right | 2 | 1.20 | −232 | 0 | 0.000 | 1.200 |
  | 4 | cobalt | 1.0 | silver | 1.0 | left | right | 2 | 1.08 | −208 | 0 | 0.000 | 1.080 |
  | 5 | chromium | 1.0 | copper | 1.0 | left | right | 6 | 1.08 | −625 | 0 | 0.000 | 1.080 |
  | 6 | tin | 1.0 | silver | 0.10 | left | right | 2 | 0.94 | −181 | 2 | −0.059 | 0.881 |
  | 7 | tin | 1.0 | silver | 0.010 | left | right | 2 | 0.94 | −181 | 4 | −0.118 | 0.822 |
  | 8 | tin | 0.10 | silver | 1.0 | left | right | 2 | 0.94 | −181 | −1 | +0.030 | 0.970 |
  | 9 | tin | 0.0010 | silver | 1.0 | left | right | 2 | 0.94 | −181 | −3 | +0.089 | 1.029 |
  | 10 | tin | 0.010 | silver | 0.10 | left | right | 2 | 0.94 | −181 | 0 | 0.000 | 0.940 |
  | 11 | cobalt | 1.0 | cobalt | 1.0 | none | none | 2 | 0.00 | 0 | 0 | 0.000 | 0.000 |
  | 12 | cobalt | 0.0010 | cobalt | 1.0 | left | right | 2 | 0.00 | 0 | −3 | +0.089 | 0.089 |
  | 13 | cobalt | 1.0 | cobalt | 0.0010 | right | left | 2 | 0.00 | 0 | −3 | +0.089 | 0.089 |
  | 14 | cadmium | 1.0 | cobalt | 0.0010 | left | right | 2 | 0.12 | −23 | 3 | −0.089 | 0.031 |
  | 15 | chromium | 1.0 | silver | 0.0010 | left | right | 3 | 1.54 | −446 | 9 | −0.177 | 1.363 |
  | 16 | chromium | 0.0010 | copper | 1.0 | left | right | 6 | 1.08 | −625 | −6 | +0.059 | 1.139 |
  | 17 | silver | 0.10 | silver | 0.0010 | right | left | 1 | 0.00 | 0 | −2 | +0.118 | 0.118 |
  | 18 | chromium | 0.010 | chromium | 1.0 | left | right | 3 | 0.00 | 0 | −2 | +0.039 | 0.039 |
  | 19 | copper | 0.010 | tin | 0.10 | right | left | 2 | 0.48 | −93 | 1 | −0.030 | 0.450 |
  | 20 | cadmium | 1.0 | copper | 1.0 | left | right | 2 | 0.74 | −143 | 0 | 0.000 | 0.740 |
  | 21 | chromium | 0.0010 | chromium | 0.0010 | none | none | 3 | 0.00 | 0 | 0 | 0.000 | 0.000 |
  | 22 | silver | 0.0010 | chromium | 1.0 | right | left | 3 | 1.54 | −446 | 9 | −0.177 | 1.363 |
  | 23 | chromium | 0.0010 | silver | 1.0 | left | right | 3 | 1.54 | −446 | −3 | +0.059 | 1.599 |
  | 24 | silver | 1.0 | silver | 0.0010 | right | left | 1 | 0.00 | 0 | −3 | +0.177 | 0.177 |
  | 25 | cadmium | 1.0 | silver | 0.0010 | left | right | 2 | 1.20 | −232 | 6 | −0.177 | 1.023 |
  | 26 | chromium | 0.10 | copper | 0.10 | left | right | 6 | 1.08 | −625 | 1 | −0.010 | 1.070 |
  | 27 | cadmium | 1.0 | silver | 0.10 | left | right | 2 | 1.20 | −232 | 2 | −0.059 | 1.141 |
  | 28 | tin | 1.0 | silver | 0.0010 | left | right | 2 | 0.94 | −181 | 6 | −0.177 | 0.763 |
  | 29 | cobalt | 0.10 | silver | 1.0 | left | right | 2 | 1.08 | −208 | −1 | +0.030 | 1.110 |
  | 30 | cobalt | 0.0010 | silver | 0.010 | left | right | 2 | 1.08 | −208 | 1 | −0.030 | 1.050 |
  | 31 | cobalt | 0.010 | silver | 0.10 | left | right | 2 | 1.08 | −208 | 0 | 0.000 | 1.080 |

  States 15, 22, 24 and 25 are the ones nearest a rounding tie (a shift of 0.17747 V, shown as 0.177: chromium with silver at log Q = 9, the silver concentration cell, and the four pairs of a 2+ metal with silver at log Q = 6, that is, copper, tin, cobalt or cadmium at 1.0 M with silver at 0.0010 M). State 10 has Q = 1 away from standard conditions. State 14 is the lowest E of any pair of different metals.
- **What lesson 9.10 may quote from here:** states 6 to 13 and 26 to 31; that a tenfold change in one concentration moves E by 0.030 V or 0.059 V when n = 2, depending on that ion's power in Q; and that for tin with silver log K = 31.8 (from ΔG° = −181,392 J and T = 298 K), so E reaches zero only at a Q near 10³², far outside what the sliders can reach.

**Values**

| Quantity | Value | Source and how sure |
|---|---|---|
| E°, Ag⁺(aq) + e⁻ → Ag(s) | +0.80 V | standard tables (+0.7996); sure |
| E°, Cu²⁺(aq) + 2e⁻ → Cu(s) | +0.34 V | standard tables (+0.342); sure |
| E°, 2H⁺(aq) + 2e⁻ → H₂(g) | 0.00 V | by definition |
| E°, Sn²⁺(aq) + 2e⁻ → Sn(s) | −0.14 V | standard tables (−0.138); sure |
| E°, Co²⁺(aq) + 2e⁻ → Co(s) | −0.28 V | standard tables; sure |
| E°, Cd²⁺(aq) + 2e⁻ → Cd(s) | −0.40 V | standard tables (−0.403); sure |
| E°, Cr³⁺(aq) + 3e⁻ → Cr(s) | −0.74 V | standard tables (−0.744); sure; one common table prints −0.73 |
| E°, Mn²⁺(aq) + 2e⁻ → Mn(s) | −1.18 V | standard tables (−1.185); sure |
| E°, Ag₂O(s) + H₂O(l) + 2e⁻ → 2Ag(s) + 2OH⁻(aq) | +0.34 V | standard tables (+0.342); fairly sure **(verify)** |
| E°, ZnO(s) + H₂O(l) + 2e⁻ → Zn(s) + 2OH⁻(aq) | −1.26 V | standard tables (−1.260); fairly sure **(verify)** |
| ΔG°f of ZnO(s) | −320.5 kJ/mol | the lesson table; newer tables −320.5, older ones −318.3; fairly sure **(verify)** |
| ΔG°f of Ag₂O(s) | −11.2 kJ/mol | the lesson table; sure |
| ΔG° of Zn(s) + Ag₂O(s) → ZnO(s) + 2Ag(s) | −309.3 kJ/mol_rxn | from the two values above; it gives 1.603 V, against 1.60 V from the two half-reactions |
| ΔG°f of CH₃OH(l), CO₂(g), H₂O(l) | −166.6, −394.4, −237.1 kJ/mol | the lesson table; not printed in the lesson; they give the −702.0 of Check 6; CH₃OH(l) fairly sure (−166.3 in some tables) |
| ΔG° of CH₃OH(l) + 3/2 O₂(g) → CO₂(g) + 2H₂O(l) | −702.0 kJ/mol_rxn | from the three values above; fairly sure |
| Stamped voltage of a silver oxide button cell | 1.55 V | sure |
| Reading of a fresh silver oxide cell with almost no current | about 1.6 V | fairly sure **(verify)**; the lesson says only "a little" above the stamp |
| F | 96,485 C per mole of electrons | the site's equation page |
| R | 8.314 J/(mol·K) | the site's equation page |
| Temperature | 25 °C: 298 K in the lesson's arithmetic, 298.15 K inside the explorer | the design |

No atomic mass is used in this lesson.

**Check script:** `scratchpad/unit9/checks/9-9.py`. It recomputes every number above, every slip, the balance of every equation and half-reaction, the two agreement tests the data allow (the watch battery's ΔG° from −nFE° against its formation values, within 0.01 V, and each E°cell against its two half-cell values), the figure's tick positions, the table of fifteen pairings, the thirty-one worked states and the limits over all 576 states by a second, independent method, and checks each message and option against this file.

**Notes for the writer**

- Never write "flip the sign" or "flip and add". The lesson has one rule: cathode minus anode, both as the table prints them.
- Never multiply a potential, and never write a line that does, even as a wrong example in display math.
- Say "thermodynamically favored" and "thermodynamically unfavored" (after first use, "favored" and "unfavored" may stand alone). Never "spontaneous", never "favorable" for a reaction.
- No electrode has a sign. Do not write "positive electrode", "negative terminal" or the like, and do not explain the direction of the electrons by the attraction of a charged electrode.
- Do not call any species an oxidizing agent or a reducing agent, and do not rank "strengths". The table's order is described by how strongly a half-reaction pulls toward reduction.
- K in this lesson is always found in two steps through ΔG°. Do not write a single equation that joins E° to K, and no number of volts per power of ten.
- ΔG° from a potential is rounded to the nearest kilojoule; the joule line is written in full first.
- Hydrogen appears once, as the zero of the table. No hydrogen electrode, no metal in acid.
- The lesson's half-cells are at 1 M throughout. The words "at standard conditions" belong in the rule for choosing the cathode, because topic 9.10 shows what concentrations do.
- Checks 2 and 5 ask what is thermodynamically favored. Do not reword them to ask what "happens" or what "will react".
- The explorer's caption (in `GalvanicCell.astro`, written by the builder) says that the potentials are tabulated to 0.01 V and that E is shown to a third decimal place only so that small changes can be seen.

**Reactions, substances and scenarios used:** a silver oxide watch battery stamped 1.55 V (opening; worked example 2: Zn(s) + Ag₂O(s) → ZnO(s) + 2Ag(s), its two half-reactions in base at +0.34 V and −1.26 V, 1.60 V, −309 kJ/mol_rxn from the potential and −309.3 from ΔG°f values of −320.5 and −11.2; the system comes back from lesson 4.7 on purpose); the table of seven half-reactions (silver, copper, hydrogen, tin, cobalt, cadmium, chromium); cobalt with tin(II), +0.14 V (one line of text); manganese with cobalt(II), −1.18 V and −0.28 V, 0.90 V (Check 1); a cobalt strip in a solution of Sn²⁺, Cd²⁺ and Cr³⁺ (Check 2); cadmium with silver ion, 1.20 V, n = 2, −232 kJ/mol_rxn, K = 4 × 10⁴⁰ (worked example 1 and the section on K); chromium with tin(II), 0.60 V, n = 6, −347 kJ/mol_rxn (Check 3); the explorer's states: tin with silver (0.94 V, −181), the two sides traded, cobalt with silver (1.08 V, −208), cadmium with silver, then chromium with copper (1.08 V, n = 6, −625) ranked against cadmium with silver by potential and by ΔG°, with 2.50 V named as what multiplying the potentials would give; chromium with cadmium ion, 0.34 V, n = 6, K = 3 × 10³⁴ (Check 4); the tin and silver cell written backward, 2Ag(s) + Sn²⁺(aq) → 2Ag⁺(aq) + Sn(s), −0.94 V, +181 kJ/mol_rxn (text); tin with cadmium ion, −0.26 V (Check 5); a methanol fuel cell, CH₃OH(l) + 3/2 O₂(g) → CO₂(g) + 2H₂O(l), −702.0 kJ/mol_rxn, n = 6, 1.21 V (Check 6). Figure: the one the design lists for this lesson. Not used: zinc with copper, copper with silver (it exists among the explorer's pairings and is never named), nickel, lead, iron, magnesium or aluminum as a half-cell, any metal in acid.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at the figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.9 Cell Potential and Free Energy`).

**Check script:** `scratchpad/unit9/checks/9-9.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.9 Cell Potential and Free Energy`).

### Task 10: Lesson 9.10, Cell Potential Under Nonstandard Conditions

**Files:**
- Create: `src/content/lessons/unit-9/9-10-cell-potential-under-nonstandard-conditions.mdx`
- Create: `public/figures/9-10-potential-against-q.svg`, `public/figures/9-10-concentration-cell.svg`
- Places the interactive block `<GalvanicCell />` a second time (its home is lesson 9.9, whose brief holds its "Diagram data"; this lesson only places it, and no Check depends on it).

**Brief**

- **Front matter:** `topic: "9.10"`, `minutes: 16`, summary: "How a cell's potential changes when its solutions are not 1 M, argued by comparing Q with K, and why two half-cells of one metal can still give a voltage." (No colon in the summary.)
- **Framework (9.10, four statements):** (1) in a real cell the potential depends on the concentrations of the species that react, and the potential says how far the cell's reaction is from equilibrium: the farther, the larger. (2) Arguments made for systems at equilibrium, Le Châtelier's principle among them, do not apply to a working cell, because it is not at equilibrium. (3) $E^\circ$ is the potential at standard conditions, where $Q = 1$; as a cell nears equilibrium its potential falls and is zero at $Q = K$; a change that takes the cell farther from equilibrium than $Q = 1$ puts the potential above $E^\circ$, and one that brings it nearer puts it below; in a concentration cell the electrons go the way that brings the cell toward equilibrium. (4) The equation for the cell potential away from standard conditions is used to reason about direction and size; routine calculation with it is not the point. The objective is to explain how leaving standard conditions changes the cell potential. **What this lesson does not do:** finding $E^\circ_\text{cell}$, $n$ and $K$ from $E^\circ$ is topic 9.9's (use them, do not teach them again); the parts of a cell and the directions of electrons and ions are topic 9.8's; amounts deposited are topic 9.11's. No pH meter, no "the equilibrium shifts" anywhere, and **no Check asks for a number from the Nernst equation**. The letter $q$ for charge does not appear in this lesson. **Equation sheet:** $E_\text{cell} = E^\circ_\text{cell} - \dfrac{RT}{nF}\ln Q$ is on it, as the site's equation page prints it. How to write $Q$ is not (topic 7.3 teaches it).
- **Opening:** build the tin and silver cell of topic 9.9 with both solutions at 1.0 M and the meter reads 0.94 V, as the table of reduction potentials says it should. Build it again with the same two strips but a silver solution of 0.010 M, and the meter reads about 0.82 V. Nothing about the metals or the reaction has changed. This lesson is about where the missing 0.12 V went, and what a cell's reading says about the mixture inside it. Note for the writer: do not name the tin salt (see "Notes for the writer"); say "a solution of tin(II) ions". The silver solution is silver nitrate.
- **Section "$E^\circ$ is the reading at $Q = 1$":**
  - The cell's reaction, as topic 9.9 found it, on its own line:

    $$\ce{Sn(s) + 2Ag^+(aq) -> Sn^2+(aq) + 2Ag(s)}$$

    with $E^\circ_\text{cell} = 0.80 - (-0.14) = 0.94$ V and $n = 2$.
  - A reaction has a reaction quotient, $Q$ (topics 7.3 and 7.10): products over reactants, each concentration raised to its coefficient, with solids left out. For this cell, displayed:

    $$Q = \frac{[\ce{Sn^2+}]}{[\ce{Ag+}]^2}$$

    The two metal strips are solids, so they are not in it. The equation sheet does not say how to write $Q$; write it as topic 7.3 writes $K$.
  - Standard conditions mean every solute at 1 M. Put 1.0 in for both: $Q = 1.0/(1.0)^2 = 1$. So $E^\circ$ is the potential of the cell at one particular mixture, the one with $Q = 1$.
  - A new symbol, defined in the same sentence: the **cell potential**, $E$ or $E_\text{cell}$, written without the little circle, is the potential of the cell as it is now, whatever its concentrations. $E^\circ$ is one value of $E$: the value at $Q = 1$. At 25 °C a reaction has one $E^\circ$; a cell running that reaction can have many values of $E$.
  - `<KeyIdea>`: $E^\circ$ is the cell potential when $Q = 1$. $E$, with no circle, is the cell potential at whatever $Q$ the cell has now.
- **Check 1**, `<Check answer={3}>`, placed here: "A cell runs on the reaction below. Which expression is its reaction quotient?" Then the equation on its own line,

  $$\ce{2Cr(s) + 3Cu^2+(aq) -> 2Cr^3+(aq) + 3Cu(s)}$$

  and four expressions as display blocks lettered A to D:
  - A: $Q = \dfrac{[\ce{Cr^3+}]^2[\ce{Cu}]^3}{[\ce{Cr}]^2[\ce{Cu^2+}]^3}$
  - B: $Q = \dfrac{[\ce{Cu^2+}]^3}{[\ce{Cr^3+}]^2}$
  - C: $Q = \dfrac{[\ce{Cr^3+}]^2}{[\ce{Cu^2+}]^3}$
  - D: $Q = \dfrac{[\ce{Cr^3+}]^3}{[\ce{Cu^2+}]^2}$

  Options:
  1. Expression A
  2. Expression B
  3. Expression C
  4. Expression D

  Why: $Q$ is products over reactants, each raised to its coefficient in the balanced equation, with solids left out. The product in solution is Cr³⁺, with coefficient 2, and the reactant in solution is Cu²⁺, with coefficient 3. Expression A puts the two solid metals in. Expression B is upside down. Expression D takes its exponents from the charges on the ions, 3+ and 2+, which only happen to be the same two numbers the other way around. Misses:
  - 1: "Check the state symbols. Topic 7.3 leaves one kind of substance out of every Q and K."
  - 2: "Q is built like K, with products over reactants. Which ion is made as this cell runs?"
  - 4: "An exponent in Q is a coefficient from the balanced equation, not the charge on an ion."
- **Section "The potential says how far there is to go":**
  - Every reaction has an equilibrium constant. For the tin and silver cell, topic 9.9's two steps ($\Delta G^\circ = -nFE^\circ = -181$ kJ/mol_rxn, then $\Delta G^\circ = -RT\ln K$) give $K$ of about 6 × 10³¹ at 25 °C, close to 10³². A mixture with $Q = 1$ is about 32 powers of ten short of equilibrium.
  - Topic 7.10's rule: a mixture with $Q$ less than $K$ reacts forward, and $Q$ rises until it equals $K$. A cell is that same reaction with its electrons sent through a wire. The meter reads how strongly the reaction is pushing toward equilibrium at this moment: the farther $Q$ is from $K$, the larger $E$; the nearer, the smaller.
  - So every question about a changed concentration becomes one question: does the change move $Q$ toward $K$ or away from it? For a galvanic cell, $Q$ is below $K$, so a change that raises $Q$ takes the cell nearer equilibrium and lowers $E$, and a change that lowers $Q$ takes it farther from equilibrium and raises $E$.
  - One paragraph, said once: you may want to reach for Le Châtelier's principle here (topic 7.9). It does not fit. That principle is about a system that is at equilibrium and is then disturbed. A cell that shows a potential is not at equilibrium: it is on its way there. The argument that works for a mixture on its way is the one topic 7.10 gave, through $Q$.
  - `<KeyIdea>`: a cell's potential measures how far its reaction is from equilibrium. A change that raises $Q$ toward $K$ lowers the potential. A change that lowers $Q$ away from $K$ raises it.
- **Worked example "Three changes to the tin and silver cell":** the cell starts at standard conditions, 1.0 M Sn²⁺ and 1.0 M Ag⁺, reading 0.94 V. Predict what each change does to the reading, taking each one separately from that start: (a) the silver solution is diluted to 0.10 M; (b) the tin solution is diluted to 0.10 M; (c) the tin strip is replaced by a larger one.
  1. **Write $Q$ and its starting value.** $Q = [\ce{Sn^2+}]/[\ce{Ag+}]^2$, and at the start $Q = 1$.
  2. **(a) Find where the changed species sits in $Q$, and what happens to $Q$.** Ag⁺ is a reactant, on the bottom, squared. With 0.10 M, the bottom is $(0.10)^2 = 0.010$ and $Q = 1.0/0.010 = 100$ (set as display math). $Q$ rose a hundredfold, toward $K$.
  3. **Say what that does to $E$.** The cell is nearer equilibrium than it was at $Q = 1$, so $E$ is below 0.94 V.
  4. **(b) The same three questions.** Sn²⁺ is a product, on the top. With 0.10 M, $Q = 0.10/(1.0)^2 = 0.10$. $Q$ fell, away from $K$: the cell is farther from equilibrium than at standard conditions, so $E$ is above 0.94 V. A cell can read more than its $E^\circ$.
  5. **(c)** Tin metal is a solid and is not in $Q$. $Q$ is still 1 and the reading is still 0.94 V. A larger strip is more tin to use, not a different mixture.

  Close with one sentence outside the steps: a full answer to a question like these has three parts: where the species sits in $Q$, what the change does to $Q$, and so what happens to $E$. Note for the writer: give no value of $E$ in this worked example. The explorer gives the numbers later, and the student should predict first.
- **Check 2**, `<Check answer={1}>`: "Four cobalt and silver cells are set up at 25 °C. Each has a cobalt strip in cobalt(II) nitrate solution and a silver strip in silver nitrate solution, and each runs on the reaction below. Only the concentrations differ. Which cell has the highest potential?" Equation on its own line:

  $$\ce{Co(s) + 2Ag^+(aq) -> Co^2+(aq) + 2Ag(s)}$$

  Options:
  1. 0.10 M Co²⁺ with 1.0 M Ag⁺
  2. 1.0 M Co²⁺ with 1.0 M Ag⁺
  3. 0.0010 M Co²⁺ with 0.010 M Ag⁺
  4. 0.010 M Co²⁺ with 0.10 M Ag⁺

  Why: $Q = [\ce{Co^2+}]/[\ce{Ag+}]^2$ (display). Work it out for each cell, four short lines of display math: $0.10/(1.0)^2 = 0.10$; $1.0/(1.0)^2 = 1.0$; $0.0010/(0.010)^2 = 10$; $0.010/(0.10)^2 = 1.0$. The cell with the lowest $Q$ is the farthest from equilibrium, so it has the highest potential: the first, the only one with $Q$ below 1 and so the only one that reads above $E^\circ$. The third cell has the least Co²⁺, the product, but its Ag⁺ is so dilute, and counts twice, that its $Q$ is the highest of the four and its potential the lowest. The second and fourth cells have the same $Q$ and so the same potential, although only the second is at standard conditions. Misses:
  - 2: "Both solutions at 1.0 M give Q = 1, the standard reading. Work out Q for each of the other three mixtures and compare them with 1."
  - 3: "This mixture has the least Co²⁺, but [Ag⁺] is squared in Q. Work out Q for it and compare the result with 1."
  - 4: "Put both concentrations into Q, with [Ag⁺] squared. How does the result compare with Q for the cell whose solutions are both 1.0 M?"

  Note for the writer: all four mixtures are states of the explorer, which shows 1.110 V, 1.080 V, 1.050 V and 1.080 V for them, against an $E^\circ_\text{cell}$ of 1.08 V. Do not print those readings in the Check or its explanation: the student has not met the explorer's sliders yet, and the argument is through $Q$ alone. Set the options as plain text, not math.
- **Section "As the cell runs":**
  - Leave the tin and silver cell joined through its meter. Every second, tin atoms become Sn²⁺ and Ag⁺ ions become silver. The top of $Q$ grows and the bottom shrinks, so $Q$ climbs toward $K$ all the time the cell runs, and $E$ falls.
  - Place the figure `9-10-potential-against-q.svg` here. One sentence on reading it: the horizontal scale counts powers of ten of $Q$, and against that scale the potential falls along a straight line, from 0.94 V at $Q = 1$ to zero at $Q = K$.
  - The fall is slow at first. If the cell starts with equal volumes of the two 1.0 M solutions, then when 99 percent of the silver ions have reacted, [Ag⁺] is 0.010 M and [Sn²⁺] is 1.495 M, $Q$ is about 1.5 × 10⁴, and the reading is still about 0.82 V. Nearly all of the fall comes at the very end, as the last traces of Ag⁺ go.
  - At $Q = K$ the reaction is at equilibrium. Nothing pushes it either way, no electrons flow, and $E = 0$. That is what a run-down cell is: a mixture that has reached equilibrium.
  - $E^\circ$ has not changed. It belongs to the reaction, at $Q = 1$, and it is 0.94 V for this reaction at 25 °C whatever the cell in front of you is doing. Build the cell afresh from 1.0 M solutions and it reads 0.94 V again. What ran down is $E$.
  - Note for the writer: do not use the phrase "dead battery". Say "run-down cell" or "a cell that has stopped".
- **Check 3**, `<Check answer={4}>`: "A cell runs on the reaction below, for which E° = 0.14 V and K = 5 × 10⁴ at 25 °C. It is built from equal volumes of two 1.0 M solutions and left running, and samples of both solutions are analyzed from time to time. The table has four of the results. Which row was measured when the meter read zero?" Equation on its own line:

  $$\ce{Co(s) + Sn^2+(aq) -> Co^2+(aq) + Sn(s)}$$

  The table (three columns):

  | Row | [Co²⁺] (M) | [Sn²⁺] (M) |
  |---|---|---|
  | A | 1.0 | 1.0 |
  | B | 1.5 | 0.50 |
  | C | 1.99 | 0.010 |
  | D | 2.0 | 4.0 × 10⁻⁵ |

  Options:
  1. Row A
  2. Row B
  3. Row C
  4. Row D

  Why: a reading of zero means that nothing pushes the reaction either way: it is at equilibrium, and $Q = K$. Here $Q = [\ce{Co^2+}]/[\ce{Sn^2+}]$ (display). Row by row, $Q$ is 1.0, 3.0, about 200 (199) and $2.0 \div (4.0 \times 10^{-5}) = 5.0 \times 10^{4}$ (the last as display math). Only row D has reached $K$. Row A is the start, where the meter read $E^\circ$, 0.14 V. In rows B and C, $Q$ is above 1, so the reading is below 0.14 V, but $Q$ is still far below $K$ and the cell is still running, even in row C, where 99 percent of the Sn²⁺ has reacted. What stops a cell is $Q$ reaching $K$, not a share of reactant used up. And in row D, $E^\circ$ is still 0.14 V and $K$ is still 5 × 10⁴: the potential that fell to zero is $E$. Misses:
  - 1: "Equal concentrations give Q = 1, which is where this cell started. What did the meter read at the start?"
  - 2: "Q is 3 in this row. Above Q = 1 the reading is below E°, and below E° is not zero. What value must Q reach before nothing pushes the reaction on?"
  - 3: "Work out Q for that row and set it beside K. Is the mixture at equilibrium yet?"

  Note for the writer: the rows follow from equal volumes, so [Co²⁺] + [Sn²⁺] is 2.0 M in every row (row D's [Co²⁺] is 1.99996 M, printed as 2.0). Keep the table to its three columns and give no reading of the meter for rows B and C.
- **Section "One metal, two concentrations":**
  - Now a cell that standard potentials say should do nothing. Put a cobalt strip into each of two beakers of cobalt(II) nitrate solution, one 1.0 M and deep pink, the other 0.0010 M and so pale it looks almost colorless (topic 7.9 met the pink ion). Join the strips through a meter and the solutions with a salt bridge. Both half-cells have the same half-reaction, so $E^\circ_\text{cell} = -0.28 - (-0.28) = 0$ V. The meter still shows a small potential. Such a cell is a **concentration cell**: a cell whose two half-cells differ only in concentration.
  - Why, through $Q$. With $E^\circ = 0$, $\Delta G^\circ = 0$ and $K = 1$ (topic 9.9). The only change this cell can make is to move Co²⁺ from one solution to the other, in effect:

    $$\ce{Co^2+}(\text{concentrated}) \ce{->} \ce{Co^2+}(\text{dilute})$$

    so $Q = \dfrac{[\ce{Co^2+}]_\text{dilute}}{[\ce{Co^2+}]_\text{concentrated}} = \dfrac{0.0010}{1.0} = 1.0 \times 10^{-3}$ (display, split over two lines). $Q$ is less than $K$, so the reaction runs forward until the two concentrations are equal.
  - What that means at each strip. No cobalt ion crosses from one beaker to the other. In the dilute half-cell, cobalt atoms of the strip become ions, $\ce{Co(s) -> Co^2+(aq) + 2e^-}$: oxidation, so this strip is the anode, it loses mass, and its solution becomes more concentrated. The electrons go through the wire to the other strip, where $\ce{Co^2+(aq) + 2e^- -> Co(s)}$: reduction, so that strip is the cathode, it gains mass, and its solution becomes more dilute. In the salt bridge, NO₃⁻ moves toward the anode and K⁺ toward the cathode, as in every cell (topic 9.8).
  - Place the figure `9-10-concentration-cell.svg` here.
  - The cell stops when the two concentrations are equal: $Q = 1 = K$ and $E = 0$. The potential is small throughout, 0.089 V at the start for these two solutions, because a thousandfold difference in concentration is only three powers of ten in $Q$.
  - `<KeyIdea>`: in a concentration cell the electrons flow in the direction that brings the two concentrations together. The half-cell with the lower concentration is the anode.
- **Check 4**, `<Check answer={2}>`: "A concentration cell has a cobalt strip in 0.050 M cobalt(II) nitrate and another cobalt strip in 1.0 M cobalt(II) nitrate. It runs for an hour. What has changed?" Options:
  1. The 1.0 M solution has become more concentrated, and its strip has lost mass
  2. The 1.0 M solution has become more dilute, and its strip is heavier
  3. The 0.050 M solution has become more dilute, and its strip has gained mass
  4. The 1.0 M solution has become more dilute, and its strip has lost mass

  Why: the cell runs in the direction that takes $Q$ toward $K = 1$, which is the direction that brings the two concentrations together. So the 0.050 M solution must gain Co²⁺, and the only source is its strip: cobalt atoms are oxidized there, the strip loses mass and the solution becomes more concentrated. The 1.0 M solution loses Co²⁺ to its strip, so it becomes more dilute and the strip gains mass. The first and third options would move the concentrations apart. The fourth has the right change for the 1.0 M solution and the wrong one for its strip: ions leaving a solution become metal on the strip. Misses:
  - 1: "That would move the two concentrations farther apart. Which way must each one go for Q to approach K?"
  - 3: "A strip gets heavier where Co²⁺ is reduced, and that takes ions out of its solution. Would this cell widen the gap between the solutions?"
  - 4: "Compare the two halves of this statement. When Co²⁺ ions leave a solution at a strip, does that strip get lighter or heavier?"
- **The interactive diagram:** place `<GalvanicCell />` here, after Check 4, under a heading "See it in numbers" and a sentence that says what it is: the cell explorer of topic 9.9, where the two concentration sliders were left at 1.0 M. Now they are the point. The text asks the student to do five things, as a numbered list, predicting before each move:
  1. **Read the starting state.** Tin on the left, silver on the right, both 1.0 M. $Q = 1$ and the readout gives $E$ as 0.940 V, the same as $E^\circ_\text{cell}$, 0.94 V.
  2. **Dilute the silver ion.** Before you move the silver slider to 0.10 M, predict: up or down? (Down: $Q$ = 100 and $E$ = 0.881 V. At 0.010 M, $Q$ = 10⁴ and $E$ = 0.822 V, the cell of this lesson's opening. At 0.0010 M, $Q$ = 10⁶ and $E$ = 0.763 V. Each tenfold dilution of Ag⁺ costs 0.059 V.)
  3. **Dilute the tin ion instead.** Put silver back at 1.0 M. Predict, then move the tin slider to 0.10 M. ($Q$ = 0.1 and $E$ = 0.970 V, above $E^\circ$. At 0.0010 M, $Q$ = 10⁻³ and $E$ = 1.029 V. Each tenfold dilution of Sn²⁺ adds only about 0.030 V, half as much as silver's step, because Sn²⁺ is in $Q$ to the first power and Ag⁺ is squared.)
  4. **Look at the size.** The lowest reading these sliders can give this cell is 0.763 V and the highest is 1.029 V. A change of a billion in $Q$, from 10⁻³ to 10⁶, moves the potential by about a quarter of a volt (0.266 V). Concentrations adjust a cell's potential. The choice of metals sets it.
  5. **Make a concentration cell.** Choose cobalt on both sides, both 1.0 M: the readout says $E^\circ_\text{cell}$ = 0, $Q = K = 1$, $E$ = 0 and nothing flows. Predict which side becomes the anode, then set the left solution to 0.0010 M. (The left half-cell is labeled the anode, $Q$ = 10⁻³ and $E$ = 0.089 V. Now exchange the two concentrations, 1.0 M on the left and 0.0010 M on the right: the labels change sides and the number does not.)

  The numbers in parentheses are for the writer to phrase as "you should see". They are the module's values: see "Explorer values this lesson relies on" below. Note for the writer: the explorer shows $E$ to three decimal places and $E^\circ_\text{cell}$ to two; quote each as shown.
- **Section "The same story as an equation":**
  - Everything above fits in one line, which the equation sheet prints. Display:

    $$E_\text{cell} = E^\circ_\text{cell} - \dfrac{RT}{nF}\ln Q$$

    $R$ is 8.314 J/(mol·K), $T$ is in kelvins, $n$ is the moles of electrons in the balanced equation, and $F$ is 96,485 C per mole of electrons (topic 9.9). It is called the **Nernst equation**. On the exam it is mostly a tool for reasoning: which way $E$ moves, and why. (Note for the writer: keep "mostly"; see "Notes for the writer".)
  - Read it without a calculator, three cases, as a short list. When $Q = 1$, $\ln Q = 0$ and $E = E^\circ$. When $Q$ is greater than 1, $\ln Q$ is positive, something is subtracted, and $E$ is below $E^\circ$. When $Q$ is less than 1, $\ln Q$ is negative, subtracting a negative adds, and $E$ is above $E^\circ$. These are the three results of the worked example above.
  - Why changes are small: the logarithm grows slowly, and it is multiplied by a small number. At 298 K, $RT/F$ is 0.0257 V, and it is divided by $n$.
  - What it says at equilibrium: put in $E = 0$ and $Q = K$, and the equation becomes $E^\circ = \dfrac{RT}{nF}\ln K$ (display), which is topic 9.9's link between $E^\circ$ and $K$, arrived at from the other side.
- **Worked example "The opening cell, in numbers":** the tin and silver cell has [Sn²⁺] = 1.0 M and [Ag⁺] = 0.010 M at 25 °C. $E^\circ_\text{cell}$ = 0.94 V and $n$ = 2. What is the cell potential?
  1. **Find $Q$.** $Q = \dfrac{1.0}{(0.010)^2} = 1.0 \times 10^{4}$ (display).
  2. **Find $RT/nF$.** $\dfrac{(8.314)(298)}{(2)(96{,}485)} = 0.01284$ V (display, numbers only). Joules per coulomb are volts.
  3. **Multiply by $\ln Q$.** $\ln(1.0 \times 10^{4}) = 9.210$, and $(0.01284)(9.210) = 0.118$ V, which is 0.12 V to the two decimal places $E^\circ$ has.
  4. **Subtract.** $E = 0.94 - 0.12 = 0.82$ V.
  5. **Check the direction and the size.** $Q$ is greater than 1, so $E$ should be below $E^\circ$, and it is. A change of ten thousand in $Q$ moved the potential by about 0.12 V. The explorer showed this state as 0.822 V: it keeps a third decimal place so that small changes can be seen.

  Note for the writer: this is the lesson's only calculation with the equation. Say before it, in one sentence, that it is here so that "the change is small" has a number behind it.
- **Check 5**, `<Check answer={4}>`: "The chromium and copper cell of the first Check runs on 2Cr(s) + 3Cu²⁺(aq) → 2Cr³⁺(aq) + 3Cu(s). Both solutions start at 1.0 M. Then enough water is added to each half-cell to make both solutions 0.10 M. What happens to the cell potential?" (Write the equation on its own line in math.) Options:
  1. It stays the same, because both solutions were diluted by the same factor
  2. It rises, because every ion in the cell is now farther from its 1 M value
  3. It stays the same, because E° depends only on the two half-reactions
  4. It falls, because Q rises from 1 to 10

  Why: put the new concentrations into $Q$ (display): $Q = \dfrac{(0.10)^2}{(0.10)^3} = 10$. The bottom shrank by a factor of 1,000 and the top by only 100, so $Q$ rose from 1 to 10, toward $K$, and $E$ falls. In the equation, $\ln Q$ is now positive, so something is subtracted from $E^\circ$. The fall is slight: the explorer, set to chromium and copper with both solutions at 0.10 M, shows 1.070 V against an $E^\circ_\text{cell}$ of 1.08 V. Equal dilution leaves $Q$ alone only when the exponents on top and bottom are equal. $E^\circ$ does stay the same, but the meter reads $E$. Misses:
  - 1: "The two ions do not enter Q in the same way. Put 0.10 M into the expression for Q and compare the result with Q at 1.0 M."
  - 2: "Dilution by itself does not say which way Q moves. Put 0.10 M into the expression for Q and compare the result with 1."
  - 3: "E° does stay the same. The meter reads E, which depends on Q. What is Q once both solutions are 0.10 M?"
- **Check 6**, `<Check answer={1}>`: "A cadmium and silver cell runs on the reaction below, for which E° = 1.20 V and K = 4 × 10⁴⁰ at 25 °C. Its cadmium solution is 1.0 M, and its meter reads 1.14 V. To find the concentration of silver ions, a classmate writes K = [Cd²⁺]/[Ag⁺]², puts in the values of K and [Cd²⁺], and gets [Ag⁺] = 5 × 10⁻²¹ M. What is wrong with this?" Equation on its own line:

  $$\ce{Cd(s) + 2Ag^+(aq) -> Cd^2+(aq) + 2Ag(s)}$$

  Options:
  1. The cell has a reading, so it is not at equilibrium and its mixture gives Q, not K
  2. K does not count the electrons, so it cannot be used for a reaction that moves charge
  3. The exponent on [Ag⁺] should be 1, because each silver ion takes only one electron
  4. Nothing is wrong: with a K this large, a cell holds almost no Ag⁺ from the moment it is built

  Why: the expression for $K$ holds for one mixture only, the one at equilibrium, and a cell at equilibrium reads zero. This cell reads 1.14 V, so it is a long way from equilibrium, and the ratio of its concentrations is its $Q$, which is nowhere near $K$. The classmate's arithmetic is right, $\sqrt{1.0 \div (4 \times 10^{40})} = 5 \times 10^{-21}$, and so is the form of the expression: the exponent on [Ag⁺] is its coefficient, 2, and $K$ for a redox reaction is written like any other. But 5 × 10⁻²¹ M is about the silver ion concentration this cell would have once it had run down, not the one it has now. A reading only a little below $E^\circ$ belongs to a $Q$ that is still close to 1 on the scale of this $K$: the explorer, set to cadmium at 1.0 M and silver at 0.10 M, where $Q$ = 100, shows 1.141 V. Misses:
  - 2: "K for a redox reaction is written like any other K. Ask instead when the concentrations in a mixture fit the expression for K."
  - 3: "Exponents come from the balanced equation, where Ag⁺ has a coefficient of 2. Ask instead what state a mixture must be in to fit K."
  - 4: "At 5 × 10⁻²¹ M the reaction would be all but finished. What would the meter read then, and what does this one read?"

  Note for the writer: write the classmate's expression in plain text inside the question, with no quotation marks around it. The Check does not ask for the real concentration, and the lesson does not work it out: the explorer's 1.141 V in the explanation is enough. $K$ = 4 × 10⁴⁰ is the value lesson 9.9 found for this cell.
- **Trap:** **Saying that $E^\circ$ falls as a cell runs** (it is $E$ that falls; $E^\circ$ belongs to the reaction at $Q = 1$ and stays put). **Explaining a change with "the equilibrium shifts"** (a working cell is not at equilibrium; say where the species sits in $Q$, what happens to $Q$, and so what happens to $E$). **Putting a working cell's concentrations into the expression for $K$** (they give $Q$; they fit $K$ only when the meter reads zero). **Putting an electrode into $Q$** (the metals are solids; a larger strip changes nothing). **Forgetting the exponents in $Q$** (diluting Ag⁺ tenfold changes the tin and silver cell's $Q$ a hundredfold). **Making the concentrated half-cell the anode of a concentration cell** (the dilute side is where ions must be made, so oxidation happens there). **Judging when a cell will stop by the share of reactant used** (it stops when $Q$ reaches $K$; with a large $K$ that is long after 99 percent has reacted).
- **Key points** (six):
  - $E^\circ$ is the cell potential at standard conditions, where $Q = 1$. $E$ is the cell potential at whatever $Q$ the cell has now. $Q$ is written as in topic 7.3, with the solid electrodes left out.
  - A cell's potential measures how far its reaction is from equilibrium. A change that raises $Q$ toward $K$ lowers $E$. A change that lowers $Q$ raises $E$, above $E^\circ$ when $Q$ is below 1.
  - As a cell runs, $Q$ rises and $E$ falls. At $Q = K$ the cell is at equilibrium and $E = 0$. $E^\circ$ has not changed.
  - A working cell is not at equilibrium, so reason through $Q$, not through Le Châtelier's principle: where the species sits in $Q$, what happens to $Q$, and so what happens to $E$.
  - In a concentration cell $E^\circ = 0$ and $K = 1$. The half-cell with the lower concentration is the anode, and the cell stops when the two concentrations are equal.
  - $E_\text{cell} = E^\circ_\text{cell} - \dfrac{RT}{nF}\ln Q$ says all of this in one line. The changes it gives are small beside $E^\circ$.

**Figures**

- **`9-10-potential-against-q.svg`** (viewBox 0 0 480 340, font-size 18). A graph of $E$ against $Q$ on a logarithmic scale, for the tin and silver cell at 298 K.
  - Plot area: x from 70 to 450, y from 40 to 270. The horizontal scale is $\log Q$ from −5 (x = 70) to 35 (x = 450), 9.5 units for each power of ten. The vertical scale is $E$ from 0 V (y = 270) to 1.2 V (y = 40), 191.67 units per volt.
  - Axes in ink along the left and bottom of the plot area. Vertical ticks and numbers at 0, 0.4, 0.8 and 1.2 (y = 270, 193.3, 116.7, 40). Horizontal ticks at $\log Q$ = 0, 10, 20 and 30 (x = 117.5, 212.5, 307.5, 402.5), labeled "1", "10¹⁰", "10²⁰", "10³⁰". Axis titles: "E (V)" above the vertical axis and "Q" at the right end under the horizontal axis.
  - The line, in the accent color, stroke 3, straight through these points from the script ($E = 0.94 - 0.029563\,\log Q$):

    | $\log Q$ | $E$ (V) | x | y |
    |---|---|---|---|
    | −5 | 1.088 | 70.0 | 61.5 |
    | 0 | 0.940 | 117.5 | 89.8 |
    | 10 | 0.644 | 212.5 | 146.5 |
    | 20 | 0.349 | 307.5 | 203.2 |
    | 31.80 | 0.000 | 419.6 | 270.0 |

    The line stops at (419.6, 270); it is not drawn below the axis.
  - Two marked points that differ in shape: a filled circle (radius 6, ink) at (117.5, 89.8), and an open square (12 on a side, ink outline, background fill) centered at (419.6, 270). A thin dashed guide in the secondary color runs from the filled circle left to the vertical axis, where a small label "0.94" sits just right of the axis and above the guide.
  - Labels: "Standard: Q = 1" above and to the right of the filled circle; "Equilibrium: Q = K" above and to the left of the open square, set on two lines ("Equilibrium:" over "Q = K") as one text element, right-aligned so that it ends at about x = 448, with baselines at about y = 200 and y = 222, which keeps it clear of the line; an arrow in the secondary color drawn parallel to the line, just above it, from about $\log Q$ = 12 to 20, pointing down the line, with "as the cell runs" above it.
  - Text in the figure, fourteen pieces: "E (V)", "Q", "0", "0.4", "0.8", "1.2", "1", "10¹⁰", "10²⁰", "10³⁰", "0.94", "Standard: Q = 1", "Equilibrium: Q = K", "as the cell runs".
  - Alt: "A graph of cell potential E, in volts, against the reaction quotient Q on a scale of powers of ten, for the tin and silver cell. A straight line slopes down from left to right. It passes through a filled circle at Q = 1 and E = 0.94 V, labeled Standard, and ends at an open square on the axis, where E = 0 and Q is near 10 to the power 32, labeled Equilibrium. To the left of the filled circle the line lies above 0.94 V. An arrow along the line, pointing down it, is labeled as the cell runs."
  - Caption: "The tin and silver cell at 25 °C. Its potential is E° at Q = 1, higher where Q is below 1, and falls to zero as Q climbs to K, which is about 10³²."
- **`9-10-concentration-cell.svg`** (viewBox 0 0 480 360, font-size 18). Two half-cells side by side.
  - Two beakers (ink outline, open top), each 150 wide and 130 tall: the left from x = 50 to 200, the right from x = 280 to 430, both from y = 150 to 280. Each is filled with solution to y = 180. The left solution is filled with the light accent and **sparse** diagonal hatching (lines 16 apart, secondary color); the right with the light accent and **dense** diagonal hatching (lines 5 apart). The two differ in pattern, not in color.
  - A cobalt strip in each beaker: a rectangle 22 wide (ink outline, glass color `#E6E1D8` fill) from y = 110 to y = 260, centered at x = 100 on the left and x = 380 on the right, so that each stands in the outer half of its beaker and rises above the rim.
  - A salt bridge: an inverted U tube (two ink outlines 14 apart, background fill) from inside the left beaker at x = 170 up to y = 130, across, and down into the right beaker at x = 310, its ends below the liquid level.
  - A wire in ink from the top of the left strip up to y = 60, across to above the right strip and down to it, with a circle of radius 16 in the middle of the top run (x = 240, y = 60) holding the letter "V". On the wire between the left strip and the meter, an arrowhead pointing right, with "e⁻" above it. A second arrowhead pointing right between the meter and the right strip, with no second label.
  - Labels: "0.0010 M Co²⁺" centered under the left beaker at y = 304; "1.0 M Co²⁺" centered under the right beaker at y = 304; "Anode: loses mass" centered under the left beaker at y = 330; "Cathode: gains mass" centered under the right beaker at y = 330; "Salt bridge" centered at x = 240, y = 120, above the bridge. No label names a strip "Co" inside the drawing; the caption says what the strips are.
  - Text in the figure, seven pieces: "V", "e⁻", "Salt bridge", "0.0010 M Co²⁺", "1.0 M Co²⁺", "Anode: loses mass", "Cathode: gains mass". **No "+" or "−" stands beside either strip.** (The superscripts in "Co²⁺" and "e⁻" are part of formulas.)
  - Alt: "Two beakers, each holding a metal strip in solution, joined by a salt bridge and by a wire through a meter. The left solution is sparsely hatched and labeled 0.0010 M Co²⁺; the strip in it is labeled Anode: loses mass. The right solution is densely hatched and labeled 1.0 M Co²⁺; the strip in it is labeled Cathode: gains mass. Two arrowheads on the wire, one of them labeled e⁻, point from the left strip toward the right strip."
  - Caption: "A concentration cell: two cobalt strips in cobalt(II) nitrate solutions of different concentration. Cobalt is oxidized in the dilute half-cell and Co²⁺ is reduced in the concentrated one, until the two concentrations are equal."

**Explorer values this lesson relies on** (the builder works from lesson 9.9's "Diagram data"; these rows are for comparing with it, and for the review that checks every sentence quoting the explorer)

The design's section 6.1 fixes the model: $E = E^\circ - \dfrac{RT}{nF}\ln Q$ at 298.15 K with $R$ = 8.314 J/(mol·K) and $F$ = 96,485 C/mol; concentrations of 0.0010, 0.010, 0.10 and 1.0 M, so $\log Q$ is a whole number; the shift from $E^\circ$ is rounded once to 0.001 V and added to the two-decimal $E^\circ$; the cell runs in the direction with $E > 0$. One factor of ten in $Q$ is 0.059156 V ÷ $n$. This brief's script computes each row below from that model and nothing else.

| Left | Right | [left] (M) | [right] (M) | $n$ | $E^\circ_\text{cell}$ (V) | $\log Q$ | Shift (V), unrounded | $E$ shown (V) | Anode | Quoted in |
|---|---|---|---|---|---|---|---|---|---|---|
| Sn | Ag | 1.0 | 1.0 | 2 | 0.94 | 0 | 0 | 0.940 | left | explorer step 1 |
| Sn | Ag | 1.0 | 0.10 | 2 | 0.94 | 2 | −0.059156 | 0.881 | left | step 2 |
| Sn | Ag | 1.0 | 0.010 | 2 | 0.94 | 4 | −0.118313 | 0.822 | left | step 2; opening; worked example 2 |
| Sn | Ag | 1.0 | 0.0010 | 2 | 0.94 | 6 | −0.177469 | 0.763 | left | steps 2 and 4 |
| Sn | Ag | 0.10 | 1.0 | 2 | 0.94 | −1 | +0.029578 | 0.970 | left | step 3 |
| Sn | Ag | 0.0010 | 1.0 | 2 | 0.94 | −3 | +0.088734 | 1.029 | left | steps 3 and 4 |
| Co | Co | 1.0 | 1.0 | 2 | 0.00 | 0 | 0 | 0.000 | none | step 5 |
| Co | Co | 0.0010 | 1.0 | 2 | 0.00 | −3 | +0.088734 | 0.089 | left | step 5; concentration cell section; figure 2 |
| Co | Co | 1.0 | 0.0010 | 2 | 0.00 | −3 | +0.088734 | 0.089 | right | step 5 |
| Cr | Cu | 0.10 | 0.10 | 6 | 1.08 | 1 | −0.009859 | 1.070 | left | Check 5's explanation |
| Co | Ag | 0.10 | 1.0 | 2 | 1.08 | −1 | +0.029578 | 1.110 | left | Check 2's note (not printed in the lesson) |
| Co | Ag | 1.0 | 1.0 | 2 | 1.08 | 0 | 0 | 1.080 | left | Check 2's note |
| Co | Ag | 0.0010 | 0.010 | 2 | 1.08 | 1 | −0.029578 | 1.050 | left | Check 2's note |
| Co | Ag | 0.010 | 0.10 | 2 | 1.08 | 0 | 0 | 1.080 | left | Check 2's note |
| Cd | Ag | 1.0 | 0.10 | 2 | 1.20 | 2 | −0.059156 | 1.141 | left | Check 6's explanation |

Also from the model: for tin with silver, $\Delta G^\circ$ = −181 kJ/mol_rxn (−181,392 J). Step 2's "0.059 V" and step 3's "0.030 V" are the rounded shifts for one power of ten in [Ag⁺] ($\log Q$ changes by 2, with $n$ = 2) and in [Sn²⁺] ($\log Q$ changes by 1). Step 4's 0.266 V is 1.029 − 0.763. The script also runs all 576 states of the design's model: no pair of different metals reverses (the smallest $E$ is 0.031 V, for cadmium with cobalt), and no shift lies within 10⁻⁹ of a rounding boundary.

Where the lesson's hand calculation (298 K, two decimal places: 0.82 V) and the explorer (298.15 K, three decimal places: 0.822 V) meet, the lesson says that the explorer keeps a third decimal place. The 0.15 K changes nothing in the figures shown: 0.8217 V against 0.8217 V.

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $E^\circ$, Ag⁺ + e⁻ → Ag | +0.80 V | the design's table; standard tables give +0.80; sure |
| $E^\circ$, Cu²⁺ + 2e⁻ → Cu | +0.34 V | the design's table; sure |
| $E^\circ$, Sn²⁺ + 2e⁻ → Sn | −0.14 V | the design's table; sure |
| $E^\circ$, Co²⁺ + 2e⁻ → Co | −0.28 V | the design's table; sure |
| $E^\circ$, Cd²⁺ + 2e⁻ → Cd | −0.40 V | the design's table; sure |
| $E^\circ$, Cr³⁺ + 3e⁻ → Cr | −0.74 V | the design's table; sure (one common table has −0.73) |
| $E^\circ_\text{cell}$, tin with silver | 0.94 V, $n$ = 2 | 0.80 − (−0.14); lesson 9.9 |
| $E^\circ_\text{cell}$, chromium with copper | 1.08 V, $n$ = 6 | 0.34 − (−0.74); the explorer |
| $E^\circ_\text{cell}$, cobalt with tin | 0.14 V, $n$ = 2 | −0.14 − (−0.28); lesson 9.9's one-line example and its Check 2 |
| $E^\circ_\text{cell}$, cobalt with silver | 1.08 V, $n$ = 2 | 0.80 − (−0.28); lesson 9.9; not printed in the lesson (Check 2's note only) |
| $E^\circ_\text{cell}$, cadmium with silver | 1.20 V, $n$ = 2 | 0.80 − (−0.40); lesson 9.9's worked example |
| $K$, cadmium with silver, 25 °C | 4 × 10⁴⁰ | computed from 1.20 V (3.9 × 10⁴⁰); lesson 9.9 has the same |
| $K$, tin with silver, 25 °C | 6 × 10³¹ ("about 10³²"); $\log K$ = 31.80 at 298 K, 31.78 at 298.15 K | computed from 0.94 V |
| $K$, cobalt with tin, 25 °C | 5 × 10⁴ | computed from 0.14 V (5.4 × 10⁴); lesson 9.9 does not print it |
| $R$; $F$ | 8.314 J/(mol·K); 96,485 C/mol of electrons | the equation page |
| $RT/F$ at 298 K | 0.0257 V | computed (0.025678) |
| Color of Co²⁺(aq) | pink; 1.0 M deep pink, 0.0010 M almost colorless | lesson 7.9 has the pink ion; the shades are from memory, fairly sure **(verify)** |

**Check script:** `scratchpad/unit9/checks/9-10.py`. It recomputes every number above, the figure's points, the fifteen explorer rows and the limits over all 576 states, balances every equation in atoms and charge, and checks each message and option against this file.

**Notes for the writer**

- **Never write "the equilibrium shifts" or "shifts toward products" for a cell**, anywhere, not even as a wrong answer or a classmate's words. A cell "runs", $Q$ "rises" or "falls", the cell is "nearer" or "farther from" equilibrium.
- **No electrode has a sign**, in text or figure. Electrodes are "the anode" and "the cathode", or "the tin strip".
- Do not write "driving force" as a quantity, "dead battery", "spontaneous", "oxidizing agent" or "reducing agent". The potential "measures how far the reaction is from equilibrium".
- **The tin half-cell's salt is not named.** Tin(II) nitrate does not keep in solution, and real tin(II) solutions are made from the chloride or the sulfate and kept acidic **(verify)**. The lesson says "a solution of tin(II) ions" or "the tin solution", as the explorer does. The silver, cobalt, cadmium and copper solutions are nitrates, which are soluble (topic 4.7's rule).
- The Nernst equation is named once and shown once. "On the exam it is mostly a tool for reasoning" keeps the hedge the design asks for: whether the framework excludes the calculation or only plays it down is not sure. Do not write "the exam never asks for a number", and do not teach 0.0592 V as a formula.
- A cobalt electrode in a real laboratory responds slowly, and a measured cobalt concentration cell may read a little differently from 0.089 V **(verify)**. The lesson gives the model's value and says "0.089 V at the start for these two solutions" without claiming a measurement.
- The worked example of three changes gives directions only. Do not add the explorer's numbers to it.
- $K$ for tin with silver is "about 6 × 10³¹" once and "about 10³²" after; both are in the text above.
- The sentence about 99 percent of the silver ions assumes equal volumes of the two solutions: say so, as the brief does. [Sn²⁺] rises by half of what [Ag⁺] falls: 1.0 + 0.495 = 1.495 M.
- Check 3's question says "equal volumes" for the same reason: [Co²⁺] + [Sn²⁺] is 2.0 M in every row of its table.
- Check 6 is about a classmate who puts a working cell's concentrations into the expression for $K$. Do not turn it into a question about Le Châtelier's principle: that principle has its one paragraph in the second section.
- The letter $q$ does not appear in this lesson (the design keeps $Q$ and $q$ apart).

**Reactions, substances and scenarios used:** Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s), the tin and silver cell of lesson 9.9 and the explorer, at 1.0 M and 1.0 M (0.94 V), with Ag⁺ at 0.10, 0.010 and 0.0010 M (0.881, 0.822, 0.763 V) and Sn²⁺ at 0.10 and 0.0010 M (0.970, 1.029 V), a larger tin strip, its $K$ of about 6 × 10³¹, the same cell run until 99 percent of its Ag⁺ is used (0.010 M and 1.495 M, about 0.82 V) and run to $Q = K$ (opening, both worked examples, the explorer, figure 1); 2Cr(s) + 3Cu²⁺(aq) → 2Cr³⁺(aq) + 3Cu(s), its $Q$ (Check 1) and both solutions diluted from 1.0 M to 0.10 M, 1.070 V (Check 5); Co(s) + 2Ag⁺(aq) → Co²⁺(aq) + 2Ag(s), the cobalt and silver cell of lesson 9.8, as four mixtures (0.10 M with 1.0 M, 1.0 M with 1.0 M, 0.0010 M with 0.010 M, 0.010 M with 0.10 M) ranked by potential through $Q$ (Check 2); Co(s) + Sn²⁺(aq) → Co²⁺(aq) + Sn(s), $E^\circ$ = 0.14 V, $K$ = 5 × 10⁴, a table of the two concentrations at four moments (1.0 and 1.0, 1.5 and 0.50, 1.99 and 0.010, 2.0 and 4.0 × 10⁻⁵ M) and the row at which the meter reads zero (Check 3); Cd(s) + 2Ag⁺(aq) → Cd²⁺(aq) + 2Ag(s), $E^\circ$ = 1.20 V, $K$ = 4 × 10⁴⁰, reading 1.14 V with 1.0 M Cd²⁺, and a classmate who puts its concentrations into the expression for $K$ and gets 5 × 10⁻²¹ M (Check 6); a cobalt concentration cell in cobalt(II) nitrate, 0.0010 M against 1.0 M, 0.089 V (section, figure 2, the explorer), and 0.050 M against 1.0 M after an hour (Check 4); the salt bridge of potassium nitrate. Figures: the two the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.10 Cell Potential Under Nonstandard Conditions`).

**Check script:** `scratchpad/unit9/checks/9-10.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.10 Cell Potential Under Nonstandard Conditions`).

### Task 11: Lesson 9.11, Electrolysis and Faraday's Law

**Files:**
- Create: `src/content/lessons/unit-9/9-11-electrolysis-and-faradays-law.mdx`
- Create: `public/figures/9-11-the-chain.svg`, `public/figures/9-11-plating-bath.svg`
- No interactive diagram (the design's section 9: the chain is arithmetic that a drawn figure shows as well).

**Brief**

- **Front matter:** `topic: "9.11"`, `minutes: 16`, summary: "How a current and a time fix the amount of substance made or used at an electrode, through charge, moles of electrons and the half-reaction, and how to run that chain backward." (No colon in the summary.)
- **Framework (9.11, one statement):** Faraday's laws give the amounts in the redox reaction of an electrochemical cell in terms of five things: the number of electrons transferred, the mass deposited on or removed from an electrode, the current, the time, and the charge of the ion. $I = q/t$. The objective is to calculate the charge that has flowed from the changes in the amounts of substances in a cell. **What this lesson does not do:** how an electrolytic cell is built, and that the object being plated is the cathode, are topic 9.8's (use them, do not teach them again); cell potentials are topic 9.9's and are not used here; which product forms when several could, efficiency and ampere-hours are left out. One electrode reaction at a time, and the question gives it. The reaction quotient does not appear in this lesson, so the capital letter $Q$ is never written. **Equation sheet:** $I = q/t$ and Faraday's constant, 96,485 C per mole of electrons, are on it, and so is "1 ampere = 1 coulomb per second" in the site's list of units. Nothing on the sheet says to go through the half-reaction.
- **Opening:** a steel bolt comes out of a plating bath with a thin gray coat of zinc on it. Nobody weighed the zinc. The plater set a current and a time, and those two numbers fixed how many grams went on. This lesson is about how a current and a clock count atoms. Note for the writer: say "zinc-plated", not "galvanized" (galvanizing is usually done by dipping in molten zinc). The plating shop is topic 4.5's, with its bath of zinc sulfate.
- **Section "Charge, counted in coulombs":**
  - In an electrolytic cell a power supply pushes electrons through a wire into the cathode (topic 9.8). To count them you need the unit of electric charge, the **coulomb**, C. Charge has the symbol $q$. Say at once, in one or two sentences: this $q$ is charge, in coulombs. In Unit 6 the same letter was heat, in joules. The equation sheet uses it for both, so read what an equation is about before you use it.
  - A **current**, $I$, is the charge that passes a point in a wire each second. Display: $I = \dfrac{q}{t}$. Its unit is the ampere, A, and 1 A is 1 coulomb per second. The equation is on the equation sheet. Turned around, display: $q = It$, with the time in seconds, because an ampere is a coulomb per second.
  - One mole of electrons carries a charge of 96,485 C. This is **Faraday's constant**, $F$ (topic 9.9 used it in $\Delta G^\circ = -nFE^\circ$), and it is on the equation sheet. So a charge in coulombs, divided by 96,485 C/mol, is an amount of electrons in moles. Display: $\text{moles of electrons} = \dfrac{q}{F}$, with the words set as text.
  - A sense of size, two sentences: one coulomb is a tiny share of a mole of electrons, about a hundred-thousandth (1 ÷ 96,485 is 1.04 × 10⁻⁵). So the charges in this lesson run to thousands of coulombs and more: a tenth of a mole of electrons is about 9,650 C.
  - `<KeyIdea>`: current times time, in seconds, is charge in coulombs. Charge divided by 96,485 C/mol is moles of electrons. A current and a clock together count electrons.
- **Section "From electrons to atoms":**
  - Place the figure `9-11-plating-bath.svg` here. The bolt hangs in a solution of zinc sulfate and is wired so that the supply pushes electrons into it. The bolt is the cathode: reduction happens at its surface (topic 9.8).

    $$\ce{Zn^2+(aq) + 2e^- -> Zn(s)}$$

    A bar of zinc is the anode, where $\ce{Zn(s) -> Zn^2+(aq) + 2e^-}$ puts zinc ions back into the bath as fast as the bolt takes them out.
  - The half-reaction is a recipe with the electron as one of its reactants. It says that 2 moles of electrons deposit 1 mole of zinc. That ratio is used exactly as topic 4.5 used the ratio of two coefficients.
  - The half-reaction is the one place in the whole calculation where the charge of the ion comes in: an ion of charge 1+ needs one electron to become an atom, and an ion of charge 2+ needs two. So read the electron count from the half-reaction in front of you every time, and do not carry it over from the last problem. A short table (three columns):

    | Half-reaction at the cathode | Electrons for each atom | Metal from 1 mol of electrons |
    |---|---|---|
    | Ag⁺ + e⁻ → Ag | 1 | 1 mol |
    | Zn²⁺ + 2e⁻ → Zn | 2 | 1/2 mol |

    One sentence after it: an ion with a larger charge takes more electrons for each atom, so the same charge deposits fewer atoms of it.
  - A stated assumption, one sentence, to keep: these problems take every electron that passes as used by the one half-reaction the question gives.
- **Check 1**, `<Check answer={2}>`: "The same charge is passed through two plating baths. In one, zinc deposits by Zn²⁺ + 2e⁻ → Zn. In the other, chromium deposits by Cr³⁺ + 3e⁻ → Cr. Which statement about the metal deposited is right?" (Write the two half-reactions on their own lines in math.) Options:
  1. Equal moles of the two metals, because the same charge passed through both baths
  2. Three moles of zinc for every two moles of chromium
  3. Three moles of chromium for every two moles of zinc
  4. Equal masses of the two metals, because equal numbers of electrons arrived

  Why: the same charge is the same number of moles of electrons. Take 6 mol of electrons, a number that both 2 and 3 divide. Zinc takes 2 electrons for each atom, so 6 mol of electrons deposit 3 mol of zinc. Chromium takes 3, so they deposit 2 mol of chromium. Equal charge gives equal moles of electrons, not of metal, and the ion with the larger charge gives fewer atoms, not more. The masses are not equal either: 3 mol of zinc is 196.1 g and 2 mol of chromium is 104.0 g. Misses:
  - 1: "The same charge means the same moles of electrons, not of metal. How many electrons does one atom of each metal take?"
  - 3: "Check which ion takes more electrons for each atom. From the same charge, does that give more atoms of it or fewer?"
  - 4: "Equal electrons do not give equal masses. Each metal has its own electrons per atom and its own molar mass. Start with the moles."
- **Section "The chain":**
  - Four steps take a current and a time to a mass. Numbered list: (1) charge from current and time, $q = It$, with $t$ in seconds; (2) moles of electrons from charge, dividing by 96,485 C/mol; (3) moles of substance from moles of electrons, by the ratio in the half-reaction; (4) mass from moles, by the molar mass. One sentence: together these are what chemists call Faraday's law of electrolysis.
  - Place the figure `9-11-the-chain.svg` here.
  - Two sentences: steps 1, 2 and 4 use only numbers the question hands you and constants you can look up. Step 3 is the one that asks you to look at the chemistry, and nothing in $I = q/t$ or in the value of $F$ reminds you that it is there.
  - `<KeyIdea>`: current and time give charge; charge gives moles of electrons; the half-reaction turns moles of electrons into moles of substance; the molar mass turns moles into grams.
- **Worked example "Zinc on a batch of bolts":** the plating shop of topic 4.5 passes a steady 8.00 A through its zinc bath for 25.0 min. What mass of zinc is deposited on the bolts? The half-reaction is $\ce{Zn^2+(aq) + 2e^- -> Zn(s)}$, and the molar mass of zinc is 65.38 g/mol.
  1. **Put the time in seconds.** 25.0 min × 60 s/min = 1,500 s.
  2. **Find the charge.** $q = It = (8.00)(1{,}500) = 12{,}000$ C (display, numbers only).
  3. **Find the moles of electrons.** $\dfrac{12{,}000}{96{,}485} = 0.1244$ mol of electrons (display).
  4. **Use the half-reaction.** Two electrons for each zinc atom: $\dfrac{0.1244}{2} = 0.06219$ mol of zinc (display).
  5. **Find the mass.** $(0.06219)(65.38) = 4.07$ g (display).
  6. **Check the size.** 12,000 C is about an eighth of a mole of electrons, so about a sixteenth of a mole of zinc, and a sixteenth of 65 g is about 4 g.

  Note for the writer: carry unrounded values between steps (0.124372, 0.062186, 4.0657); the figures shown are rounded for display. Do not write one combined formula for the mass (the design: the lessons do not write $m = ItM/nF$).
- **Check 2**, `<Check numeric="54.4" unit="kg">`: "Magnesium metal is made in the cell of topic 9.8, where molten magnesium chloride is electrolyzed and Mg²⁺ + 2e⁻ → Mg(l) at the cathode. An industrial cell carries a current of 1.20 × 10⁵ A. What mass of magnesium, in kg, does it make in 1.00 h? The molar mass of magnesium is 24.30 g/mol." (Half-reaction on its own line in math.) Why: 1.00 h is 3,600 s. $q = (1.20 \times 10^{5})(3{,}600) = 4.32 \times 10^{8}$ C. Moles of electrons: $4.32 \times 10^{8} \div 96{,}485 = 4{,}477$ mol. Two electrons for each magnesium atom: 2,239 mol of magnesium. Mass: $(2{,}239)(24.30) = 54{,}400$ g, which is 54.4 kg. Put the lines of arithmetic in display math, numbers only. Slips:
  - `109` (the 2 of the half-reaction left out): "Did you leave out the half-reaction? Each magnesium atom takes two electrons, so the moles of magnesium are not the moles of electrons."
  - `218` (multiplied by 2 where it divides): "Did you multiply by 2? Going from moles of electrons to moles of magnesium, the 2 of the half-reaction divides."
  - `0.907` (the hour used as 60): "Did you use 60 for the time? An hour is 60 minutes, and the charge needs the time in seconds."
  - `0.0151` (the hour used as 1.00): "Did you use 1.00 for the time? An ampere is a coulomb per second, so the hour must be turned into seconds."
  - `54400` (left in grams): "That is the mass in grams. The question asks for kilograms."
- **Check 3**, `<Check numeric="0.140" unit="mol">`: "In a small laboratory cell, a current of 2.50 A passes through molten magnesium chloride for 3.00 h. At the anode, chloride ions are oxidized: 2Cl⁻ → Cl₂(g) + 2e⁻. How many moles of chlorine gas, Cl₂, form?" (Half-reaction on its own line in math.) Why: the product does not have to be a metal, and it does not have to form at the cathode: the chain is the same. 3.00 h is 10,800 s. $q = (2.50)(10{,}800) = 27{,}000$ C. Moles of electrons: $27{,}000 \div 96{,}485 = 0.2798$ mol. The half-reaction releases 2 electrons for each Cl₂, so $0.2798 \div 2 = 0.140$ mol of Cl₂. Slips:
  - `0.280` (moles of electrons given): "That is the moles of electrons. The half-reaction has two electrons for every Cl₂."
  - `0.560` (multiplied by 2 where it divides): "Did you multiply by 2? Two electrons leave for each Cl₂ made, so there are fewer moles of Cl₂ than of electrons."
  - `3.89e-5` (the hours used as 3.00): "Did you use 3.00 for the time? An ampere is a coulomb per second, so the hours must be turned into seconds."
  - `2.33e-3` (the time left in minutes, 180): "Did you use 180 for the time? That is the time in minutes. The charge needs it in seconds."
  - `0.0700` (divided by 2 twice): "Did you divide by 2 twice? The half-reaction already counts whole Cl₂ molecules: two electrons for each one."
  - `9.92` (the mass in grams given): "That is the mass of the chlorine in grams. The question asks for moles."
- **Section "Running the chain backward":**
  - The same four links answer other questions. If you know the mass and want the time or the current, start at the mass and undo each step in turn: divide by the molar mass, use the half-reaction's ratio the other way (now it multiplies: each atom needs its electrons), multiply by 96,485 C/mol to get the charge, and last use $I = q/t$ for whichever of the two is missing.
  - One sentence: which way the electron count goes is the thing to think about each time. From electrons to atoms there are fewer atoms than electrons. From atoms to electrons there are more electrons than atoms.
- **Worked example "How long for the tin?":** the steel for food cans is coated with a thin layer of tin from a bath that holds Sn²⁺ ions: $\ce{Sn^2+(aq) + 2e^- -> Sn(s)}$. A test strip of steel is to receive 1.50 g of tin at a steady 3.20 A. How long must the current run? The molar mass of tin is 118.71 g/mol.
  1. **Mass to moles of tin.** $\dfrac{1.50}{118.71} = 0.01264$ mol (display).
  2. **Moles of tin to moles of electrons.** Each tin atom needs 2 electrons: $(0.01264)(2) = 0.02527$ mol of electrons.
  3. **Moles of electrons to charge.** $(0.02527)(96{,}485) = 2{,}438$ C.
  4. **Charge to time.** From $I = q/t$, $t = \dfrac{q}{I} = \dfrac{2{,}438}{3.20} = 762$ s (display, split over two lines).
  5. **Report it sensibly.** 762 s is 12.7 min.

  Note for the writer: unrounded values are 0.012636, 0.025272, 2,438.3 and 761.98. Tinplate for cans is made this way, from an acid bath of tin(II) **(verify)**; say no more about the bath than "holds Sn²⁺ ions".
- **Check 4**, `<Check numeric="1.72" unit="A">`: "Steel fasteners for aircraft have long been plated with cadmium, which protects the steel from corrosion: Cd²⁺ + 2e⁻ → Cd. In one run, 0.900 g of cadmium is deposited in 15.0 min. What steady current, in A, was used? The molar mass of cadmium is 112.41 g/mol." (Half-reaction on its own line in math.) Why: moles of cadmium: $0.900 \div 112.41 = 0.008006$ mol. Each atom took 2 electrons: 0.01601 mol of electrons. Charge: $(0.01601)(96{,}485) = 1{,}545$ C. The time is $15.0 \times 60 = 900$ s, so $I = 1{,}545 \div 900 = 1.72$ A. Slips:
  - `0.858` (the 2 of the half-reaction left out): "Did you leave out the half-reaction? Each cadmium atom takes two electrons, so the moles of electrons are not the moles of cadmium."
  - `0.429` (divided by 2 where it multiplies): "Did you divide by 2? Going from moles of cadmium to moles of electrons, the 2 of the half-reaction multiplies."
  - `103` (the time left in minutes): "Did you divide the charge by 15.0? Current is charge per second, so the time must be in seconds."
  - `51.5` (the 2 left out and the time in minutes): "Two things to check: the electrons for each cadmium atom, and the time, which must be in seconds."
- **Check 5**, `<Check answer={3}>`: "A second tin bath holds its tin in a different form. Run at the same 3.20 A for the same 762 s as in the worked example, it deposits only 0.750 g of tin. Every electron that passes is used to deposit tin. How many electrons does each tin atom take in the second bath?" Options:
  1. One, because half the mass of tin means half as many electrons for each atom
  2. Two, because the metal is still tin and its electron count cannot differ
  3. Four, because the same charge deposited half as many moles of tin
  4. It cannot be told without the formula of the tin compound in the bath

  Why: the charge is the same, $(3.20)(762) = 2{,}438$ C, so the moles of electrons are the same, 0.02527 mol. The tin deposited is $0.750 \div 118.71 = 0.006318$ mol. Electrons for each atom: $0.02527 \div 0.006318 = 4.00$. The tin in the second bath is in the +4 oxidation state, where the first bath's was +2. Half as many atoms from the same electrons means each atom took twice as many, not half. One metal can form ions of more than one charge: topic 4.9 met tin as Sn²⁺ and as Sn⁴⁺. And no formula is needed: a mass, a current and a time are enough to find the charge on an ion, because for a simple ion the number of electrons each atom takes is that charge. Misses:
  - 1: "Fewer atoms were deposited by the same number of electrons. Does that mean each atom took fewer electrons, or more?"
  - 2: "One metal can form ions of different charge: topic 4.9 met tin as Sn²⁺ and as Sn⁴⁺. Compare the moles of electrons with the moles of tin."
  - 4: "No formula is needed. The current and the time give the moles of electrons, and the mass gives the moles of tin. Compare the two."
- **Section "In any cell":**
  - Nothing in the chain depends on what pushes the electrons. It holds at the anode as well as the cathode, for a mass removed as well as a mass deposited, and in a galvanic cell as well as an electrolytic one. Wherever electrons pass through a wire, the charge that passed and the amounts that changed at each electrode are tied together by the half-reactions.
- **Check 6**, `<Check numeric="3.86e3" unit="C">`: "In the cobalt and silver galvanic cell of topic 9.8, the cobalt strip is the anode: Co(s) → Co²⁺(aq) + 2e⁻. After the cell has run for a while, the cobalt strip weighs 1.18 g less than at the start. How much charge, in C, passed through the wire? The molar mass of cobalt is 58.93 g/mol." (Half-reaction on its own line in math.) Why: moles of cobalt lost: $1.18 \div 58.93 = 0.02002$ mol. Each atom gave up 2 electrons: 0.04005 mol of electrons. Charge: $(0.04005)(96{,}485) = 3{,}864$ C, which is 3.86 × 10³ C. The same 0.04005 mol of electrons arrived at the silver strip, where Ag⁺ + e⁻ → Ag deposited 0.04005 mol of silver, 4.32 g (silver's molar mass is 107.87 g/mol): one charge, two electrodes, two different masses. Slips:
  - `1.93e3` (the 2 of the half-reaction left out): "Did you leave out the half-reaction? Each cobalt atom that leaves the strip gives up two electrons."
  - `966` (divided by 2 where it multiplies): "Did you divide by 2? Each cobalt atom gives up two electrons, so there are more moles of electrons than of cobalt."
  - `0.0400` (moles of electrons given): "That is the moles of electrons. One more step, with Faraday's constant, turns it into coulombs."
- **Trap:** **Leaving the time in minutes or hours** (an ampere is a coulomb per second, so a time entered in minutes makes the charge, and every amount after it, 60 times too small). **Taking moles of electrons as moles of metal** (the half-reaction stands between them). **Multiplying by the electron count where it divides, or the reverse** (from electrons to atoms there are fewer atoms; from atoms to electrons there are more electrons). **Assuming two electrons for each atom** (read the count from the half-reaction: one for Ag⁺, three for Cr³⁺). **Reading $q$ as heat** (in this lesson $q$ is charge, in coulombs). **Stopping one unit short** (grams where kilograms were asked for, or moles of electrons where coulombs were asked for).
- **Key points** (five):
  - Current is charge per second: $I = q/t$, so $q = It$ with the time in seconds. Here $q$ is charge, in coulombs.
  - One mole of electrons carries 96,485 C, Faraday's constant, so charge divided by 96,485 C/mol is moles of electrons.
  - The half-reaction gives the ratio between moles of electrons and moles of substance: 2 electrons for each atom from Zn²⁺, 3 from Cr³⁺, 2 for each Cl₂ from Cl⁻.
  - From current and time to mass is a chain of four steps: charge, moles of electrons, moles of substance, mass. Run backward, the same chain gives a time, a current, a charge or the charge on an ion.
  - The chain holds at either electrode and in a galvanic cell as well as an electrolytic one: the charge that passed fixes the amount that changed.

**Figures**

- **`9-11-the-chain.svg`** (viewBox 0 0 480 500, font-size 18). Five boxes in one column, joined by four arrows that point down, each arrow with its operation written to its right.
  - Boxes: each 230 wide and 52 tall, rounded corners (radius 6), ink outline, light accent fill, from x = 20 to x = 250. Their tops are at y = 20, 126, 232, 338 and 444, so each gap is 54 units. The box text is centered in the box, in ink. From the top: "Current and time", "Charge (C)", "Moles of electrons", "Moles of substance", "Mass (g)".
  - Arrows: a vertical line in ink at x = 135 from the bottom of each box (y = 72, 178, 284, 390) to 6 units above the top of the next (y = 120, 226, 332, 438), with a filled arrowhead at the lower end.
  - Arrow labels, in the secondary color, left-aligned at x = 152, with their baselines level with the middle of each arrow (y = 102, 208, 314, 420): "× time, in seconds"; "÷ 96,485 C/mol"; "ratio from the half-reaction"; "× molar mass".
  - Text in the figure, nine pieces: the five box texts and the four arrow labels.
  - Alt: "Five boxes in a column, joined by four arrows that point down. The boxes read, from the top: Current and time; Charge (C); Moles of electrons; Moles of substance; Mass (g). Beside the four arrows, from the top: times time, in seconds; divided by 96,485 C/mol; ratio from the half-reaction; times molar mass."
  - Caption: "The chain from a current and a time to a mass. To find a time, a current or a charge from a mass, follow it upward and undo each step."
- **`9-11-plating-bath.svg`** (viewBox 0 0 480 380, font-size 18). A plating tank in cross-section with its power supply above it.
  - Tank: an open-topped rectangle in ink from x = 60 to x = 420 and from y = 170 to y = 330, filled with the light accent up to a liquid level at y = 195.
  - Anode, on the left: a zinc bar, a rectangle 30 wide from x = 110 to x = 140 and from y = 130 to y = 300, filled with diagonal hatching in the secondary color, ink outline. Cathode, on the right: the bolt, drawn as a hexagonal head (about 44 wide and 26 tall, top at y = 215) on a shank 20 wide that runs down to y = 300, centered at x = 350, plain glass-color fill `#E6E1D8`, ink outline, hanging from a wire that comes down through the liquid surface. The bar and the bolt differ in shape and in fill.
  - Power supply: a rectangle from x = 180 to x = 300 and from y = 30 to y = 74, ink outline, background fill, with the words "Power supply" centered in it. A wire in ink runs from the top of the zinc bar up to y = 52 and right to the left side of the box; another runs from the right side of the box to x = 350 and down to the bolt.
  - Electron arrows: an arrowhead on the left wire's vertical part pointing up (from the bar toward the supply) and an arrowhead on the right wire's vertical part pointing down (from the supply toward the bolt), each with "e⁻" beside it on the outer side.
  - Ions: three zinc ions in the liquid between the bar and the bolt, each a filled circle of radius 9 in ink (cations dark, as in lesson 3.8), at about (200, 250), (250, 280) and (290, 240), not touching each other, the bar or the bolt. One thin arrow in the accent color from the middle ion toward the bolt. One label "Zn²⁺" with a short leader line to the leftmost ion.
  - Labels under the tank, at y = 358: "Zinc bar: anode" centered at x = 125 and "Bolt: cathode" centered at x = 350. **No "+" or "−" stands beside either electrode or on the power supply.** (The superscripts in "Zn²⁺" and "e⁻" are part of formulas.)
  - Text in the figure, six pieces: "Power supply", "e⁻" twice, "Zn²⁺", "Zinc bar: anode", "Bolt: cathode".
  - Alt: "A plating tank with a power supply above it. On the left a hatched zinc bar, labeled Zinc bar: anode, dips into the solution. On the right a bolt, labeled Bolt: cathode, hangs in the solution. Wires join each to the power supply, and arrowheads labeled e⁻ show electrons going up from the zinc bar to the supply and down from the supply to the bolt. Three dark circles in the solution stand for zinc ions, one of them labeled Zn²⁺, and an arrow points from one of them toward the bolt."
  - Caption: "Zinc plating. The supply pushes electrons into the bolt, where each Zn²⁺ ion that arrives takes two of them and becomes zinc metal. The sulfate ions and the water are not drawn."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| Faraday's constant, $F$ | 96,485 C per mole of electrons | the equation page; sure |
| 1 A | 1 C/s | the equation page's list of units |
| Atomic masses | Mg 24.30, Cl 35.45, Cr 52.00, Co 58.93, Zn 65.38, Ag 107.87, Cd 112.41, Sn 118.71 | `src/data/elements.ts` (the AP exam table's) |
| Molar mass of Cl₂ | 70.90 g/mol | 2 × 35.45; used for one slip only |
| One coulomb as a share of a mole of electrons; the charge of 0.1 mol of electrons | 1.04 × 10⁻⁵ mol; about 9,650 C (9,648.5) | computed |
| Current of an industrial magnesium cell | 1.20 × 10⁵ A | made-up data of a real size: such cells carry on the order of 10⁵ A; fairly sure **(verify)** |
| Zinc is plated on steel from a zinc sulfate bath with zinc anodes | | lesson 4.5 has the bath; sure of the anodes |
| Tinplate is made from an acid bath of tin(II) | | fairly sure **(verify)** |
| Alkaline tin baths hold tin in the +4 state (as stannate) | | fairly sure **(verify)** |
| Cadmium is plated on steel aircraft fasteners against corrosion, from Cd(II) | | fairly sure **(verify)** |
| Chromium can be plated from Cr³⁺ baths | | fairly sure; most decorative chromium was long plated from chromium(VI), which this lesson does not mention |

**Check script:** `scratchpad/unit9/checks/9-11.py`. It recomputes every number above with unrounded intermediates, each slip, the figure's coordinates, the acceptance of answers worked with $F$ = 96,500 and with three-figure intermediates, balances every half-reaction in atoms and charge, and checks each message and option against this file.

**Notes for the writer**

- **Never write the capital letter $Q$ in this lesson**, and never use $q$ for heat. Charge is $q$, said to be charge at first use.
- **No electrode has a sign**, in text or figure, and the power supply's terminals are not marked. The bolt is "the cathode" because reduction happens there.
- **Do not write a single formula for the mass** ($m = ItM/nF$ or the like). Every calculation is the chain, one step to a line.
- The lesson's own symbol $n$ is not needed: say "electrons for each atom" or "the ratio in the half-reaction". (Topic 9.9's $n$ is moles of electrons per mole of reaction, which is a different count from the $n$ some books put in a Faraday formula.)
- Check 5: alkaline tin baths hold tin(IV) as the stannate ion, not as free Sn⁴⁺ **(verify)**. The lesson says "a different form" in the question and "the +4 oxidation state" in the explanation, and writes no formula and no half-reaction for the second bath (the design: a half-reaction in base is given, never balanced, and this one is not needed).
- "Every electron that passes is used" is an assumption and is said to be one. Real plating baths lose some charge to making hydrogen at the cathode; do not mention efficiency or hydrogen.
- Check 2 and Check 3 both use molten magnesium chloride, at two scales, on purpose: one product at each electrode. Check 2's cell is industrial; Check 3's is "a small laboratory cell". Keep the two apart, and give no temperature (lesson 9.8 has it).
- Check 6 takes Faraday's law into a galvanic cell. Do not give the cell's potential there, and do not ask for the silver's mass as a second question: the 4.32 g is in the explanation.
- Do not name silver plating, copper plating or aluminum smelting with numbers. Silver appears in the two-row table and in Check 6's explanation only.
- The table in "From electrons to atoms" has two rows on purpose. Do not add a row for Cr³⁺: Check 1 asks the student to extend the pattern.
- "Faraday's law of electrolysis" is named once, in "The chain".

**Reactions, substances and scenarios used:** Zn²⁺(aq) + 2e⁻ → Zn(s) on steel bolts in the zinc sulfate bath of lesson 4.5's plating shop, with a zinc bar anode, 8.00 A for 25.0 min, 12,000 C, 4.07 g (opening, figure, worked example 1); Ag⁺ + e⁻ → Ag as a row of a table and as the cathode of Check 6's cell; the same charge through a zinc bath and a chromium(III) bath, 3 mol to 2 mol (Check 1); molten magnesium chloride, Mg²⁺ + 2e⁻ → Mg(l), 1.20 × 10⁵ A for 1.00 h, 54.4 kg (Check 2), and 2Cl⁻ → Cl₂(g) + 2e⁻, 2.50 A for 3.00 h, 0.140 mol (Check 3); Sn²⁺(aq) + 2e⁻ → Sn(s) on steel for food cans, 1.50 g at 3.20 A, 762 s (worked example 2); Cd²⁺ + 2e⁻ → Cd on aircraft fasteners, 0.900 g in 15.0 min, 1.72 A (Check 4); a second tin bath with tin in the +4 state, 0.750 g from the same 2,438 C (Check 5); the cobalt and silver galvanic cell of lesson 9.8, Co(s) → Co²⁺(aq) + 2e⁻, 1.18 g lost, 3.86 × 10³ C, 4.32 g of silver gained (Check 6). Figures: the two the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.11 Electrolysis and Faraday's Law`).

**Check script:** `scratchpad/unit9/checks/9-11.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 9.11 Electrolysis and Faraday's Law`).

---

### Task 12: Close out Unit 9's lessons

- [ ] Add an "As built" section to the design and "As carried out" notes to this plan under each group.
- [ ] In the last pull request, list for the teacher: what to verify against the framework, every value the checkers could not both confirm, and Claude's calls from the design's section 1.
