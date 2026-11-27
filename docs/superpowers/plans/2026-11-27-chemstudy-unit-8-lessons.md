# ChemStudy Unit 8 Lessons and Diagrams Implementation Plan

**Goal:** Put Unit 8 (Acids and Bases) on chem-study.com:
- eleven lessons, 8.1 to 8.11, every Check with a message for each wrong answer;
- three interactive diagrams on one shared solver: a weak-acid explorer (8.3), a titration-curve explorer (8.5, placed again in 8.7) and a buffer explorer (8.10);
- the drawn figures the lessons need.

**Architecture:** as for Units 4 and 6.
- **Lessons** are MDX files built from the existing lesson blocks.
- **Interactive diagrams** are Svelte components drawn in SVG, wrapped in Astro blocks and loaded when they scroll into view.
- **Every number a diagram shows** comes from a plain TypeScript module with unit tests: `src/lib/acid-base.ts` (the solver all three use), `src/lib/weak-acid.ts`, `src/lib/titration-curve.ts` and `src/lib/buffer-capacity.ts`.

**Tech Stack:** Astro 7, MDX, Svelte 5, KaTeX 0.16 + mhchem, Vitest, Playwright + axe. No new package.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-8-lessons-design.md`.

**Builds on:** the Unit 6 lessons plan (`2026-11-27-chemstudy-unit-6-lessons.md`) and, through it, the Unit 4 lessons plan (`2026-11-16-chemstudy-unit-4-lessons.md`), whose "Rules for writing a lesson" and "How every lesson task ends" hold here except where this plan says otherwise, and the check feedback plans of 2026-11-26 and 2026-11-27.

**How this plan was made.**

1. **The framework summary** was written from the controller's knowledge of the 2024 framework, not from its pages: the College Board's site is blocked in the building session. The design's sections 1 and 3 ask the teacher to verify it, and list what its writer was not sure of.
2. **Two inventories** were made before any brief: every example, substance set, number set and scene of the teacher's Unit 8 materials and of chapters 14, 15 and the pH part of 16 in `AP_Chem_Prep`, with what the notes stress; and everything the site's Units 1 to 7 already say about acids, bases, titration and equilibrium. No textbook could be reached, so no list of any textbook's examples exists.
3. **A lesson table** (`scratchpad/unit8/lesson-table.md`) gave each lesson its framework statements, its substances and its numbers before any brief was written, so that no two lessons share a number set.
4. **The briefs** below were written by three agents on Fable 5.2, one per group of lessons, each with a number-check script (`scratchpad/unit8/checks/8-N.py`) that recomputes every number in its brief.
5. **Each group of briefs was fact-checked** by a fresh agent on Fable 5.2 that solved every Check and worked example before reading the answer and judged every reference value from memory, **and checked for originality** on Sonnet against both inventories and the other groups' briefs. The findings are fixed in the briefs; the note under each group says what changed.
6. **"(verify)" in a brief** is the brief-writer's own mark on a value or fact it was not sure of. No agent in this session can look a value up. Every $K_a$, $K_b$, p$K_a$, $K_w$, $K_{sp}$ and indicator range is judged twice from memory, by the fact-checker of the brief and by the fact-checker of the finished lesson, who do not see each other's work. The values they could not both confirm are listed here when the briefs are done: **(the controller fills this in)**.

## Facts verified before writing (do not rediscover)

Established on 2026-11-27 against `main` at `cacefcf`.

1. **Unit 8 exists in `src/data/units.ts`** (lines 119 to 132) with the eleven topic titles; its slug is `unit-8-acids-and-bases`, and its colors are in `src/styles/tokens.css`. `src/content/lessons/unit-8/` does not exist yet. The file names are `8-1-introduction-to-acids-and-bases.mdx`, `8-2-ph-and-poh-of-strong-acids-and-bases.mdx`, `8-3-weak-acid-and-base-equilibria.mdx`, `8-4-acid-base-reactions-and-buffers.mdx`, `8-5-acid-base-titrations.mdx`, `8-6-molecular-structure-of-acids-and-bases.mdx`, `8-7-ph-and-pka.mdx`, `8-8-properties-of-buffers.mdx`, `8-9-henderson-hasselbalch-equation.mdx`, `8-10-buffer-capacity.mdx` and `8-11-ph-and-solubility.mdx` (the en dash of a title becomes a hyphen, as in `4-8-introduction-to-acid-base-reactions.mdx`).
2. **The shared tests pick up a new unit by themselves** (`all-lessons.spec.ts`, `home.spec.ts`).
3. **`tests/unit/check-dist.test.ts` builds its sample lessons in topic 8.2**, on the assumption that Unit 8 has no lessons and is not on `FEEDBACK_UNITS`. Before Unit 8 joins the list, the samples move to topic 9.2: the comment and `data-topic` (lines 12 and 13), `inUnit(8, …)`, the expected string "lesson 8.2" and `FEEDBACK_UNITS.has('8')` (lines 30 to 43), and the expected strings "lesson 8.2" (lines 134 to 189). `checkPage` reads the topic as text and does not look it up, so any code works. Unit 9 is the last unit: its own work will have to use a unit number that no unit has.
4. **A unit on `FEEDBACK_UNITS` needs a data file** for `tests/e2e/check-feedback.spec.ts`: exactly one file in `docs/superpowers/plans/` ending `-chemstudy-unit-8-check-feedback.json`, listing every Check of every Unit 8 lesson on the site. The messages are written with the lessons, so the file is **derived from the lessons** by `scratchpad/unit8/extract-feedback.py` (the script Unit 6 used). It is regenerated in every pull request that adds or changes a Unit 8 lesson.
5. **`tests/unit/check-balance.test.ts` needs at least 12 Checks with options in a unit**, so Unit 8 joins `BALANCED_UNITS` (line 9) in the last pull request, when all eleven lessons are in.
6. **A `<Check>` takes** `answer` or `numeric` (+ `unit`), and `misses`, `slips`, `tolerance`. The build refuses a message that is empty, over 180 characters, holds `$`, `<`, `>` or a backslash, starts "Not quite", or does not end with a period or question mark; a message for the answer's own option; and a slip inside the tolerance. A typed minus sign is read. **The tolerance is a fraction of the answer** (2 percent unless the Check sets its own), which is far too wide for a pH: 2 percent of 11.13 is 0.22. Every Check whose answer is a pH or a pOH sets `tolerance` (see "Rules for writing a lesson").
7. **A typed answer may be** a plain decimal, e-notation (`2.5e-3`), `2.5 x 10^-3`, or `2.5 × 10⁻³` (`parseNumber` in `src/lib/check.ts`). A small `numeric` is written in e-notation and shown as a power of ten.
8. **The equation sheet** gives, for this unit: the $K_a$ and $K_b$ expressions; $K_w$ and its value at 25 °C; $K_w = K_a \times K_b$; pH, pOH, 14 = pH + pOH; the Henderson–Hasselbalch equation; p$K_a$ and p$K_b$. It writes H⁺. It gives no percent ionization, no half-equivalence relation, no list of strong acids and bases and no value of any constant.
9. **The stated exclusions of Unit 8** (as the controller knows the framework): the concentrations of the species along a polyprotic titration curve (8.5), and a solubility computed from a pH (8.11). The teacher's materials name two more under 8.9, which the summary's writer does not remember; the design's section 3 says how the lessons are safe under either reading.
10. **Anatomy of an interactive diagram**, with line counts and the shared CSS classes: `scratchpad/unit8/tech-facts.md`, section "Interactive diagrams". The models are the Unit 6 explorers and the Unit 4 titration diagram.
11. **No tool in the repository renders an SVG.** `scratchpad/unit8/svg-shot.cjs` does (Playwright with the container's Chromium).
12. **Running the browser tests in a Claude Code cloud session:** unset `AI_AGENT`, `CLAUDECODE` and `CLAUDE_CODE_ENTRYPOINT` for the run (Astro's preview otherwise starts in the background and Playwright's web server "exits early"), and point `launchOptions.executablePath` at `/opt/pw-browsers/chromium` in a config kept outside the repository.
13. **What the site already says that Unit 8 must agree with** is in `scratchpad/unit8/site-inventory.md`, sections 2 to 6 and 11, and in the design's table of promises (section 2): the lists of strong acids and bases (lesson 4.2, line 191); H⁺(aq) as a stand-in for H₃O⁺ (lesson 4.8, line 28); equivalence point and endpoint, and bromothymol blue as yellow in acid and blue in base (lesson 4.6, lines 51 to 59); the ICE table and the 5 percent check (lesson 7.7, lines 95 to 113 and 297 to 304); the $K_{sp}$ table (lesson 7.11, lines 55 to 63); the equation page (`src/pages/tools/equations.mdx`, lines 183 to 241).
14. **The Unit 4 titration diagram** (`src/lib/titration.ts`, `Titration.svelte`) titrates 20.0 mL of 0.150 M lactic or tartaric acid with 0.200 M NaOH and plots the acidic protons left, with no pH. It is not changed. The new block is `TitrationCurve`, a different name.

## Conventions for every task

- Work in `/home/user/chem-study`. The teacher's `AP_Chem_Prep` checkout is read-only and writers never read it.
- **American English** in every file (`CLAUDE.md`); `npm test` checks the site's sources.
- Conventional commits, made by the controller only.
- Tests first for code: write the test, run it, watch it fail, then implement. Never swallow an error.
- **Only the controller builds, runs browser tests and commits.** Writers and builders working at the same time write files and run unit tests only: concurrent builds collide.
- **One pull request per group, stacked, each targeting `main`. Claude merges each when "Build and test" passes** (the design's section 1), with a merge commit, in order.
- **Every pull request says** that the framework was not read from its pages, that no textbook was read, and which reference values rest on memory, with those the two checkers could not both confirm listed for the teacher.

## Models

| Task | Model |
|---|---|
| Briefs; lesson writers; fact-checks; second checks | Fable 5.2 |
| The solver and the three diagrams (module, tests, component, browser tests) | Opus |
| Code reviews; originality checks; applying decided fixes | Sonnet |
| Inventories | Haiku |

Never both the writer and the checker of a lesson on a cheaper model.

## How a group is carried out

1. Code first where a lesson uses a new block: one builder per diagram (the two shared files, `diagram.css` and `[topic].astro`, are edited by the controller from what the builder reports). Group B's builder writes the solver, `src/lib/acid-base.ts`, with its tests, before the weak-acid explorer. The builders of groups C and D import the solver and do not change it.
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

The Unit 4 plan's "Rules for writing a lesson" hold (the file, the seven parts, the markup, the voice, phone width, static figures), with `unit-8` and `8-N-<slug>.mdx` for the file. Models to read first: `src/content/lessons/unit-7/7-7-calculating-equilibrium-concentrations.mdx` (an ICE table as a Markdown table, the small-x approximation and its check, typed-number Checks), `src/content/lessons/unit-4/4-8-introduction-to-acid-base-reactions.mdx` (hydronium, long equations split with `aligned`, the voice for acids and bases) and `src/content/lessons/unit-6/6-4-heat-capacity-and-calorimetry.mdx` (a lesson with messages on every Check and an explorer placed in it).

**One Unit 4 rule changes.** From lesson 8.2 on, a student is expected to know the strong acids and strong bases (the lists of lesson 4.2, line 191), because the exam expects it. A question still says that a weak acid or base is weak, and gives its $K_a$, $K_b$ or p$K_a$.

**Added for Unit 8:**

- **Every Check carries its messages**, exactly as the brief gives them: `misses` for each wrong option, `slips` for a typed number, formatted as Unit 1's lessons format them (`answer` first in the tag). A writer who must reword a message keeps the rules of the check feedback design's section 4.4 and reports it.
- **H₃O⁺, never a bare H⁺**, in every equation, expression and sentence, with water in the equation: `\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}`. The one exception is the sentence of lesson 8.1 that says what the equation sheet prints, and the one of lesson 8.4 that ties $\ce{H3O+ + OH- -> 2H2O}$ to lesson 4.2's $\ce{H+ + OH- -> H2O}$. Prose and messages write H₃O⁺, OH⁻, A⁻ in plain characters.
- **The arrow is a claim.** A weak acid or weak base reacting with water takes the double arrow (`<=>`). A strong acid ionizing, and any reaction in which a strong acid or strong base is a reactant, takes the single arrow (`->`). Every equation carries state symbols on every term; water is `(l)` and is never in a $K$ expression.
- **pH decimal places.** The digits after the decimal point of a pH are its significant figures. This unit's pH and pOH values have two decimal places (its constants have two figures), and a concentration found from one has two figures. Never a pH with one decimal place or three, except where the brief gives a measured pH that way.
- **Logarithms.** Write "p" quantities as `\text{pH}`, `\text{pOH}`, `\text{p}K_a`, as the equation page does. $[\ce{H3O+}] = 10^{-\text{pH}}$ is shown with the number substituted, on its own line. Keep unrounded values through a calculation and round once, at the end; the brief's numbers were made that way.
- **At 25 °C.** $K_w = 1.0 \times 10^{-14}$ and pH + pOH = 14.00 are stated as facts about 25 °C wherever they are used for the first time in a lesson. "Neutral" means $[\ce{H3O+}] = [\ce{OH-}]$, never "pH 7" without the temperature.
- **For a base, pOH first.** $x$ from a weak base's table is $[\ce{OH-}]$; the lesson writes the pOH, then the pH, on separate lines, every time.
- **The ICE table** is a Markdown table laid out as in lesson 7.7: an empty first header cell, one column for each species in the $K$ expression (formulas in plain characters, such as H₃O⁺), rows I, C and E, and a sentence above it that says every value is in M. No column for water. Where the brief's table uses HA and A⁻, or B and HB⁺, for a long formula, the sentence above it says what they stand for.
- **The table of moles** for a reaction that goes to completion has rows Before, Change and After, in millimoles, and no $x$. Never call it an ICE table and never put a strong acid or strong base into an ICE table.
- **Checking the approximation.** Every time $x$ is left out, the next line divides $x$ by the starting concentration and gives the percentage, and the sentence says whether it is under 5 percent. The 5 percent line is "the check from topic 7.7", never a rule of the exam.
- **$K_a \times K_b = K_w$** is used only for an acid and its own conjugate base, and the sentence names both.
- **Titration amounts go through moles**, as millimoles = milliliters × molarity, and the balanced equation. Never $M_aV_a = M_bV_b$. A concentration after mixing is divided by the total volume, and the line shows the two volumes added.
- **Values** are the brief's, each from its "Values" table. Do not swap in a remembered value. A lesson never prints both a $K_a$ and a p$K_a$ for one acid unless it calculates one from the other on the page.
- **Words.** "Ionization" and "percent ionization", not "dissociation"; "equivalence point", "endpoint" and "half-equivalence point"; "acid form" and "base form" for the two members of a conjugate pair; no "hydrolysis" and no "ICF table". The Henderson–Hasselbalch equation, the quadratic formula, polyprotic acids and Lewis acids appear only where the brief puts them.

**Static figures:** as in the Unit 4 plan. **A curve is drawn through the points the brief lists**, each computed by the brief's script, never sketched. Render every figure and look at it: `node <scratchpad>/unit8/svg-shot.cjs <out folder> 390 <file.svg>`.

## How every lesson task ends

As in the Unit 4 plan ("Build and test", "Look at it", "Fact-check, independently", "Originality check, once per group", "Fix", "Commit"), run by the controller as "How a group is carried out" says, with these changes:

- **The fact-checker** gets the lesson file, its figures and `scratchpad/ced/unit8-framework.md`. Beside the Unit 4 list, it:
  - judges every reference value ($K_a$, $K_b$, p$K_a$, $K_w$ at any temperature, $K_{sp}$, an indicator's range and colors, a solubility) against what it knows of standard tables, says how sure it is, and lists every value it cannot confirm;
  - checks that a $K_a$ and a p$K_a$ given for one acid agree, and that a $K_b$ is that of the conjugate base named;
  - checks every pH's decimal places, every use of pH + pOH = 14.00 for its temperature, and every logarithm;
  - checks every arrow (single or double), every state symbol, and that no bare H⁺ is written;
  - checks every use of the approximation: is the check shown, and does it pass?
  - checks that no strong acid or base sits in an ICE table, and that every dilution uses the total volume;
  - for each typed-number Check, recomputes every slip from its mistake, confirms it lies outside the tolerance, and says what the tolerance accepts in pH units;
  - judges every wrong-answer message by the check feedback design's section 4.4, above all whether it leaves one option standing.
- **The originality check** compares with the teacher's Unit 8 and chapter 14 to 16 materials (`/home/user/sahangh/ap_chem_prep`, read-only, not the `exam` folders or the `*-exam.md` files), the site's other lessons and practice, and the unit's other lessons. No textbook is available; the pull request says so. A replacement it proposes must be a true example of the idea, and gets the same search.

## File structure

```
src/
  lib/acid-base.ts                                  [H3O+] of a mixture of a weak acid, its conjugate base, a strong acid and a strong base, with Kw (Task 3)
  lib/weak-acid.ts                                  a weak acid at a chosen concentration: pH, percent ionization, the shortcut and its check, readouts (Task 3)
  lib/titration-curve.ts                            20.0 mL of 0.150 M acid with 0.200 M NaOH: amounts, pH at every volume, an indicator's volumes, readouts (Group C)
  lib/buffer-capacity.ts                            1.00 L of a propanoate buffer and of water, with strong acid or base added: amounts, pH, readouts (Group D)
  components/diagrams/WeakAcid.svelte TitrationCurve.svelte BufferCapacity.svelte
  components/lesson/WeakAcid.astro TitrationCurve.astro BufferCapacity.astro     <WeakAcid />  <TitrationCurve />  <BufferCapacity />
  styles/diagram.css                                + rules the three diagrams need
  pages/[unit]/[topic].astro                        + BufferCapacity, TitrationCurve, WeakAcid in `blocks`
  content/lessons/unit-8/                           eleven new .mdx files
public/figures/                                     8-1-... to 8-11-... static figures
scripts/check-dist.mjs                              Unit 8 on FEEDBACK_UNITS (Group B)
tests/unit/acid-base.test.ts weak-acid.test.ts titration-curve.test.ts buffer-capacity.test.ts
tests/unit/check-dist.test.ts                       sample lessons move to topic 9.2 (Group B)
tests/unit/check-balance.test.ts                    Unit 8 on BALANCED_UNITS (Group D)
tests/e2e/diagram-weak-acid.spec.ts diagram-titration-curve.spec.ts diagram-buffer-capacity.spec.ts
docs/superpowers/plans/2026-11-27-chemstudy-unit-8-check-feedback.json   derived from the lessons, in every group
```

## The groups

| Group | Pull request | Branch | Lessons | Code |
|---|---|---|---|---|
| A | design and plan | `topic/unit-8-lessons-design` | none | none |
| B | "feat(lessons): Unit 8 lessons 8.1-8.3 and the weak-acid explorer" | `topic/unit-8-ph-and-weak-acids`, from A's branch | 8.1, 8.2, 8.3 | `acid-base.ts`, the weak-acid explorer; the sample lessons to 9.2; `FEEDBACK_UNITS` |
| C | "feat(lessons): Unit 8 lessons 8.4-8.7 and the titration-curve explorer" | `topic/unit-8-reactions-and-titrations`, from B's | 8.4, 8.5, 8.6, 8.7 | the titration-curve explorer |
| D | "feat(lessons): Unit 8 lessons 8.8-8.11 and the buffer explorer" | `topic/unit-8-buffers-and-solubility`, from C's | 8.8, 8.9, 8.10, 8.11 | the buffer explorer; `BALANCED_UNITS`; the close-out |

The last task of group D closes the unit: an "As built" section in the design, "As carried out" notes under each group here, and in the last pull request, for the teacher, what to verify against the framework, every value the checkers could not both confirm, and Claude's calls from the design's section 1.

---

## Group B: pH, strong and weak (pull request B)

Branch: `topic/unit-8-ph-and-weak-acids`, from this plan's branch (`topic/unit-8-lessons-design`).

> **As carried out.** The solver and the weak-acid explorer were built on Opus while three writers on Fable wrote the lessons; a fact-check of each lesson on Fable, an originality check of the prose on Sonnet (nine passages reworded) and a code review on Sonnet followed. The review found no bug; a root outside the solver's bracket now throws, and the solver gained a builder for weak-base mixtures with the base-buffer case among its tests. Two key points of lesson 8.3 carried inline equations too wide for a phone and were put in words. Merged as pull request 88.

Lesson 8.3's brief holds the "Diagram data" of the weak-acid explorer and of the solver all three explorers share. The builder (on Opus) writes `src/lib/acid-base.ts` first, test-first, then the explorer; three writers write the lessons at the same time.

> **How these briefs were checked.** The first fact-check confirmed every value and reproduced all thirty states of the explorer with its own solver. It found four things that had to change, all in lesson 8.3: a displayed step that did not compute, two wrong-answer messages that gave the answer, and **the solver's description for a weak base mixed with a salt of its conjugate acid, which would have given pH 5.10 where the answer is 9.50**; a test row now holds that case. The originality check had lesson 8.3's opening rewritten (it set a weak acid beside a strong acid of the same molarity, the teacher's stock scene). A second check found nothing that had to change, and had phenol's Ka taken out of the lesson's table, where it gave away the Check that asks for it.

### Task 1: Lesson 8.1, Introduction to Acids and Bases

**Files:**
- Create: `src/content/lessons/unit-8/8-1-introduction-to-acids-and-bases.mdx`
- Create: `public/figures/8-1-ph-rulers.svg`, `public/figures/8-1-neutral-at-three-temperatures.svg`

**Brief**

- **Front matter:** `topic: "8.1"`, `minutes: 15`, summary: "What pH and pOH measure, how water's reaction with itself ties the hydronium and hydroxide concentrations together through Kw, and why neutral water has a pH of 7.00 only at 25 °C." (No colon in the summary.)
- **Framework (8.1, five statements):** (1) the concentrations of hydronium and hydroxide ions are usually reported as pH and pOH, the negative logarithms of the two concentrations. (2) H⁺(aq) and H₃O⁺(aq) name one species; H₃O⁺ is preferred and H⁺ is accepted. (3) Water reacts with itself, and the constant of that reaction is $K_w = [\ce{H3O+}][\ce{OH-}]$ = 1.0 × 10⁻¹⁴ at 25 °C. (4) In pure water the two concentrations are equal, which is what neutral means; at 25 °C that is pH 7.00, and pH + pOH = 14.00. (5) $K_w$ changes with temperature, so neutral water is not at pH 7 at another temperature. The objective is to find pH and pOH from $K_w$ and the concentrations in water. **What this lesson does not do:** proton transfer, hydronium and conjugate pairs are topic 4.8's (three sentences of recall, no more); the pH of a strong acid or base from its concentration is topic 8.2's (no acid or base is named in this lesson: every sample is given by its $[\ce{H3O+}]$, its $[\ce{OH-}]$ or its pH); $K_a$ is topic 8.3's. **Equation sheet:** $K_w$ with its value at 25 °C, pH, pOH and 14 = pH + pOH are on it, printed with H⁺ where this site writes H₃O⁺. No value of $K_w$ at another temperature is on it: a question gives one.
- **Opening:** pure water conducts electricity. Only barely, so that it takes a sensitive meter to see it, but the current is there, and a current through a liquid is carried by ions. The only thing in pure water is water. So the ions must come from water molecules themselves, and they are the reason every solution in this unit has a pH. Note for the writer: this is real (the purest laboratory water still has a small, known conductivity). Give no number for it, and do not mention tap water, salt or a light bulb.
- **Section "Water reacts with itself":**
  - Recall, in three sentences and naming topic 4.8: an acid gives a proton and a base takes one; a water molecule can do either; when it takes a proton it becomes the hydronium ion, H₃O⁺, and when it gives one up, what is left is the hydroxide ion, OH⁻.
  - So one water molecule can give a proton to another. Display, split after the arrow:

    $$\ce{H2O(l) + H2O(l) <=> H3O+(aq) + OH-(aq)}$$

    This is the **autoionization of water**: water forming ions from itself by passing a proton from one molecule to another.
  - It is an equilibrium, so it has a constant. Water is a pure liquid and is left out of the expression (topic 7.3). Display: $K_w = [\ce{H3O+}][\ce{OH-}]$. At 25 °C, $K_w = 1.0 \times 10^{-14}$. That is a very small $K$, so the equilibrium lies far toward the reactants (topic 7.5): nearly all of the water stays as molecules.
  - Pure water. Each proton transfer makes one H₃O⁺ and one OH⁻, so in pure water the two concentrations are equal. Call each $x$. Display, two lines: $x^2 = 1.0 \times 10^{-14}$, then $x = 1.0 \times 10^{-7}\ \text{M}$. For scale, one sentence: a liter of water holds about 55 mol of water molecules, so there is roughly one hydronium ion for every 550 million water molecules. (997 g ÷ 18.02 g/mol = 55.3 mol; 55.3 ÷ 1.0 × 10⁻⁷ = 5.5 × 10⁸.)
  - **Two names, one ion.** The exam's equation sheet writes this same constant with H⁺(aq) where this lesson writes H₃O⁺(aq). They are the same ion: a proton in water is always attached to a water molecule (topic 4.8). The exam accepts either. This site writes H₃O⁺. Note for the writer: this is the unit's one place where a bare H⁺ is printed, in prose and in this sentence only. No equation in the lesson uses it.
  - **Not only pure water.** The equilibrium is there in every solution made with water, so in any dilute water solution at 25 °C the product of the two concentrations is 1.0 × 10⁻¹⁴. Add something that raises $[\ce{H3O+}]$ and the equilibrium shifts back toward water (Le Châtelier's principle, topic 7.9), using up OH⁻ until the product is 1.0 × 10⁻¹⁴ again. One line of example in the text: raise $[\ce{H3O+}]$ to 5.0 × 10⁻⁶ M, fifty times its value in pure water, and $[\ce{OH-}]$ falls to 2.0 × 10⁻⁹ M, one-fiftieth of its value in pure water. Neither concentration is ever zero: an acidic solution still holds some OH⁻, and a basic one still holds some H₃O⁺.
  - Three definitions, each in bold at first use, as a short list: a solution is **neutral** when $[\ce{H3O+}] = [\ce{OH-}]$, **acidic** when $[\ce{H3O+}]$ is the larger and **basic** when $[\ce{OH-}]$ is the larger.
  - `<KeyIdea>`: in water at 25 °C, $[\ce{H3O+}] \times [\ce{OH-}] = 1.0 \times 10^{-14}$, whatever is dissolved. Raise one and the other falls. Which of the two is larger decides whether a solution is acidic or basic, and when they are equal it is neutral.
- **Section "pH: counting in powers of ten":**
  - The values of $[\ce{H3O+}]$ met in the lab run from more than 1 M down to less than 10⁻¹⁴ M. To handle a range like that, chemists report the exponent. Display: $\text{pH} = -\log[\ce{H3O+}]$. And the same for hydroxide: $\text{pOH} = -\log[\ce{OH-}]$. Both are on the equation sheet. A "p" in front of any quantity means "the negative logarithm of": this unit also uses p$K_w$, and later p$K_a$.
  - The minus sign is there so that the usual values come out positive. Its cost is that the scale runs backward: **the higher $[\ce{H3O+}]$, the lower the pH** (topic 7.9 said this in passing).
  - Three facts about logarithms, as a numbered list. These are all the unit needs.
    1. **The logarithm of a product is a sum.** For $[\ce{H3O+}] = 4.7 \times 10^{-6}$ M: display, split, $-\log(4.7 \times 10^{-6}) = -\log 4.7 - \log 10^{-6} = -0.67 + 6 = 5.33$. So the pH of a concentration $a \times 10^{-b}$ M, with $a$ between 1 and 10, lies between $b - 1$ and $b$. That is a check you can do with no calculator: 4.7 × 10⁻⁶ M must have a pH between 5 and 6.
    2. **Going back undoes the logarithm.** Display: $[\ce{H3O+}] = 10^{-\text{pH}}$, and $[\ce{OH-}] = 10^{-\text{pOH}}$.
    3. **One pH unit is a factor of ten.** A solution at pH 4 has ten times the hydronium concentration of a solution at pH 5, and 1,000 times that of a solution at pH 7.
  - Place the figure `8-1-ph-rulers.svg` here, with one sentence: read across a row to see one solution three ways, and read down to see each step change both concentrations by a factor of ten, in opposite directions.
  - **How many digits.** In pH 5.33, the 5 only says which power of ten, as the exponent does in 4.7 × 10⁻⁶. The digits after the decimal point carry the 4.7. So the digits after the decimal point are a pH's significant figures: a concentration with two significant figures gives a pH with two decimal places. Going back, a pH with two decimal places gives a concentration with two significant figures. Nearly every constant in this unit has two significant figures, so nearly every pH in it has two decimal places.
- **Check 1**, `<Check numeric="3.8e-4" unit="M">`: "A sports drink has a pH of 3.42. What is its hydronium ion concentration, in M?" Why: undo the logarithm. Display: $[\ce{H3O+}] = 10^{-3.42} = 3.8 \times 10^{-4}\ \text{M}$. The pH has two decimal places, so the concentration has two significant figures. A quick check: a pH between 3 and 4 means a concentration between 10⁻⁴ and 10⁻³ M, and 3.8 × 10⁻⁴ M is. Slips:
  - `2.6e-11` (the hydroxide ion concentration, 1.0 × 10⁻¹⁴ ÷ 3.8 × 10⁻⁴): "That is the hydroxide ion concentration of this drink. The question asks for the hydronium ion concentration."
  - `2.63e-11` (the same mistake, typed to three figures): "That is the hydroxide ion concentration of this drink. The question asks for the hydronium ion concentration."
  - `2630` (10 raised to +3.42, the minus sign left out): "Did you leave the minus sign out of the exponent? A pH between 3 and 4 goes with a concentration between 10⁻⁴ and 10⁻³ M."
  - `2600` (the same mistake, typed to two figures): "Did you leave the minus sign out of the exponent? A pH between 3 and 4 goes with a concentration between 10⁻⁴ and 10⁻³ M."
  - `0.534` (the logarithm of 3.42 taken): "That is the logarithm of 3.42. Going from a pH to a concentration undoes a logarithm. It does not take another one."
  - `3.42e-4` (the pH's digits written in front of a power of ten): "The digits of a pH are not the digits of the concentration. The whole pH, 3.42, is an exponent."

  Tolerance: the page's 2 percent, which accepts 3.72 × 10⁻⁴ to 3.88 × 10⁻⁴ M, so 3.8 × 10⁻⁴ and 3.80 × 10⁻⁴ are both accepted (the unrounded value is 3.802 × 10⁻⁴). Note for the writer: sports drinks are acidic, with a pH between about 3 and 3.5. Name no brand and no acid.
- **Check 2**, `<Check answer={4}>`: "A solution has $[\ce{H3O+}]$ = 0.0072 M. A calculator shows 2.142668 for −log(0.0072). How should the pH be reported?" Options:
  1. 2.1, because 0.0072 has two significant figures
  2. 2.143, because extra digits make an answer more exact
  3. 2, because the zeros in 0.0072 are not significant
  4. 2.14, because 0.0072 has two significant figures

  Why: 0.0072 is 7.2 × 10⁻³, with two significant figures. In a pH, the digit before the decimal point only locates the power of ten, so the two significant figures are the two digits after the decimal point: 2.14. Writing 2.1 keeps one significant figure and throws away part of what was measured. Writing 2.143 claims a digit the measurement does not support. Writing 2 says only that the concentration is near 10⁻² M. Misses:
  - 1: "Ask which digits of a pH are significant. The digit before the decimal point only tells you the power of ten."
  - 2: "The concentration is known to two figures, and the pH cannot be known better than that. Which digits of a pH count as significant figures?"
  - 3: "A whole-number pH says only that the concentration is near 10⁻² M. The digits 7.2 have to leave their mark on the pH too."
- **Check 3**, `<Check answer={3}>`: "Each spring, melting snow carries acid into a mountain pond, and the pH of the pond's water falls from 6.8 to 5.3 within a few days. By what factor does $[\ce{H3O+}]$ rise?" Options:
  1. About 1.3 times, the ratio of 6.8 to 5.3
  2. About 15 times, ten for a whole unit times 1.5 units
  3. About 32 times, 10 raised to the power 1.5
  4. About 1.5 times, the difference between the two readings

  Why: the pH fell by 6.8 − 5.3 = 1.5 units. A pH is an exponent, so a difference of 1.5 in pH is a factor of 10 raised to the power 1.5 in concentration. Display: $10^{1.5} = 31.6$, about 32. One whole unit is a factor of 10, and the extra half unit is another factor of 3.2. Dividing one pH by the other, or reading the difference itself as the factor, treats pH as a plain amount. Multiplying 10 by 1.5 adds the factors up, and factors of ten multiply. Misses:
  - 1: "Dividing one pH by the other treats a pH as a plain amount. A pH is an exponent. What does a difference between two exponents mean?"
  - 2: "Each unit does stand for a factor of ten, but factors of ten are not added up. Think about what part of a unit means for a power of ten."
  - 4: "1.5 is how far the pH moved, in pH units. The question asks about the concentration, and each pH unit stands for a factor of ten in it."

  Note for the writer: this is real (the spring "acid pulse" of snowmelt in poorly buffered mountain waters). The two readings have one decimal place because that is what a field meter gives; do not add a second. Do not name what the acid is.
- **Section "pH and pOH add to 14.00":**
  - Take the negative logarithm of both sides of $[\ce{H3O+}][\ce{OH-}] = 1.0 \times 10^{-14}$. The logarithm of a product is a sum (fact 1), so: display, $\text{pH} + \text{pOH} = 14.00$, at 25 °C. The 14.00 is p$K_w$, the negative logarithm of $K_w$. This line is on the equation sheet, as 14 = pH + pOH.
  - So there are two ways from an $[\ce{OH-}]$ to a pH: through $[\ce{H3O+}]$ with $K_w$, or through the pOH. Both give the same answer.
  - At 25 °C: pure water has pH 7.00 and pOH 7.00; an acidic solution has a pH below 7.00 and a pOH above it; a basic solution has a pH above 7.00.
- **Worked example "A soil extract":** blueberry bushes grow well only in acidic soil. A grower shakes a soil sample with pure water and filters it. At 25 °C the clear extract has $[\ce{H3O+}] = 4.7 \times 10^{-6}$ M. Find the pH, $[\ce{OH-}]$ and the pOH of the extract.
  1. **pH from the hydronium concentration.** Display: $\text{pH} = -\log(4.7 \times 10^{-6}) = 5.33$. Two significant figures in, two decimal places out. It lies between 5 and 6, as 4.7 × 10⁻⁶ must.
  2. **$[\ce{OH-}]$ from $K_w$.** Display, split: $[\ce{OH-}] = \dfrac{K_w}{[\ce{H3O+}]} = \dfrac{1.0 \times 10^{-14}}{4.7 \times 10^{-6}} = 2.1 \times 10^{-9}\ \text{M}$.
  3. **pOH, two ways.** From the concentration, keeping the unrounded 2.13 × 10⁻⁹: $\text{pOH} = -\log(2.13 \times 10^{-9}) = 8.67$. From the pH: $14.00 - 5.33 = 8.67$. They agree.
  4. **Say what it means.** $[\ce{H3O+}]$ is larger than $[\ce{OH-}]$, by a factor of about 2,200, so the extract is acidic: right for blueberries.

  Note for the writer: blueberries prefer soil of about pH 4.5 to 5.5. Say "acidic soil" and give no range. Lesson 4.2 has soil bacteria making soil acidic; do not bring in bacteria, fertilizer or any reaction.
- **Check 4**, `<Check numeric="8.15" tolerance={0.25}>`: "The water in a freshwater aquarium at 25 °C has $[\ce{OH-}] = 1.4 \times 10^{-6}$ M. What is the pH of the water?" Why: the concentration given is hydroxide, so its negative logarithm is the pOH. Display: $\text{pOH} = -\log(1.4 \times 10^{-6}) = 5.85$, then $\text{pH} = 14.00 - 5.85 = 8.15$. The other route gives the same: $[\ce{H3O+}]$ = 1.0 × 10⁻¹⁴ ÷ 1.4 × 10⁻⁶ = 7.1 × 10⁻⁹ M, and −log of that is 8.15. The water holds more OH⁻ than H₃O⁺, so it is basic, and its pH must come out above 7. Slips:
  - `5.85` (the pOH given as the pH): "That is the pOH: the concentration you were given is hydroxide. One more step takes a pOH to a pH at 25 °C."
  - `8.1` (one decimal place where two are due): "Did you round to one decimal place? The concentration has two significant figures, so the pH takes two digits after the decimal point."
  - `8.2` (one decimal place where two are due, from 8.15): "Did you round to one decimal place? The concentration has two significant figures, so the pH takes two digits after the decimal point."
  - `7.1e-9` (the hydronium ion concentration, not the pH): "That is the hydronium ion concentration. The question asks for the pH, which is its negative logarithm."

  Tolerance: 0.25 percent of 8.15 is 0.020, so the page accepts 8.13 to 8.17. Both routes give 8.15 (8.146 unrounded); a student who rounds $[\ce{H3O+}]$ to 7.1 × 10⁻⁹ first gets 8.149, which is accepted. The slips 8.1 and 8.2 are 0.05 below and above the answer, outside the tolerance, and 0.10 from each other. Note for the writer: many aquarium fish are kept in slightly basic water, so the scene is real. Name no fish and no additive.
- **Check 5**, `<Check answer={1}>`: "Four water samples are at 25 °C. Which sample has the highest concentration of hydroxide ions?" Options:
  1. The sample with a pOH of 4.30
  2. The sample with [H₃O⁺] = 2.5 × 10⁻¹⁰ M
  3. The sample with [OH⁻] = 2.0 × 10⁻⁵ M
  4. The sample with a pH of 9.20

  Why: put all four in the same form. Option 1: $10^{-4.30}$ = 5.0 × 10⁻⁵ M. Option 2: $[\ce{OH-}]$ = 1.0 × 10⁻¹⁴ ÷ 2.5 × 10⁻¹⁰ = 4.0 × 10⁻⁵ M. Option 3 is 2.0 × 10⁻⁵ M as given. Option 4: the pOH is 14.00 − 9.20 = 4.80, so $[\ce{OH-}]$ = 1.6 × 10⁻⁵ M. The first sample has the most hydroxide. All four are basic, so "which one is basic" does not settle it. (Put the four conversions in a short Markdown table of two columns, "Sample" and "[OH⁻] in M", not in one line of math.) Misses:
  - 2: "Dividing Kw by this hydronium concentration gives a hydroxide concentration of 4.0 × 10⁻⁵ M. Put the other three samples in the same form before you compare."
  - 3: "This sample is the easy one to read, because it is already a hydroxide concentration. Convert the other three to the same form and compare."
  - 4: "A pH of 9.20 is basic, but the other three samples are basic too. Find the hydroxide concentration of each before you compare."
- **Section "Neutral is not always 7":**
  - $K_w$ is an equilibrium constant, and like any $K$ it changes with temperature (topic 7.9). Pulling a proton off one water molecule and putting it on another takes energy: the autoionization of water is endothermic. So $K_w$ rises when water is warmed and falls when it is cooled. Short table, two columns, with one sentence saying these are measured values:

    | Temperature | $K_w$ |
    |---|---|
    | 10 °C | 2.9 × 10⁻¹⁵ |
    | 25 °C | 1.0 × 10⁻¹⁴ |
    | 40 °C | 2.9 × 10⁻¹⁴ |

    One sentence for the reader who wonders about the two 2.9s: the matching digits at 10 °C and 40 °C are a coincidence; the two values differ by a factor of ten.
  - What does not change with temperature is the meaning of neutral: $[\ce{H3O+}] = [\ce{OH-}]$. What changes is the pH at which that happens.
- **Worked example "Cold water":** a bottle of pure water is cooled to 10 °C, where $K_w = 2.9 \times 10^{-15}$. Find $[\ce{H3O+}]$, $[\ce{OH-}]$ and the pH. Is the water still neutral?
  1. **It is still pure water**, so every H₃O⁺ was made together with one OH⁻, and the two concentrations are equal. Call each $x$.
  2. **Use $K_w$ for this temperature.** Display: $x^2 = 2.9 \times 10^{-15}$, so $x = 5.4 \times 10^{-8}\ \text{M}$. That is both $[\ce{H3O+}]$ and $[\ce{OH-}]$.
  3. **Take the pH**, from the unrounded 5.39 × 10⁻⁸. Display: $\text{pH} = -\log(5.39 \times 10^{-8}) = 7.27$.
  4. **Answer the question.** The water is neutral, because the two concentrations are equal. Its pH is 7.27, not 7.00, because cold water has ionized less. Its pOH is 7.27 too, and the two add to 14.54, which is p$K_w$ at 10 °C. The sum is 14.00 only at 25 °C.
- Place the figure `8-1-neutral-at-three-temperatures.svg` after the worked example, with one sentence: at each temperature the two bars are the same height, which is what neutral means, and the pH under them is different. (At 40 °C: $x^2 = 2.9 \times 10^{-14}$, $x = 1.7 \times 10^{-7}$ M, pH 6.77.)
- `<KeyIdea>` (after the figure): neutral means $[\ce{H3O+}] = [\ce{OH-}]$, at every temperature. A pH of 7.00 means neutral only at 25 °C. At another temperature, use the $K_w$ the question gives.
- **Check 6**, `<Check answer={2}>`: "A water solution at 40 °C has a pH of 7.00. At 40 °C, $K_w = 2.9 \times 10^{-14}$. Is the solution acidic, basic or neutral?" Options:
  1. Neutral, because its pH is exactly 7.00
  2. Basic, because [OH⁻] is larger than [H₃O⁺]
  3. Acidic, because warm water holds more H₃O⁺ than cold water does
  4. Neutral, because [H₃O⁺] × [OH⁻] still equals Kw

  Why: a pH of 7.00 means $[\ce{H3O+}] = 1.0 \times 10^{-7}$ M. Then, with the $K_w$ for 40 °C, display: $[\ce{OH-}] = \dfrac{2.9 \times 10^{-14}}{1.0 \times 10^{-7}} = 2.9 \times 10^{-7}\ \text{M}$. There is almost three times as much OH⁻ as H₃O⁺, so the solution is basic. At 40 °C a neutral solution has pH 6.77, so 7.00 is on the basic side. The product of the two concentrations equals $K_w$ in every water solution, acidic, basic or neutral, so that says nothing about which this one is. Warm water does hold more H₃O⁺ than cold water, and more OH⁻ as well. Misses:
  - 1: "A pH of 7.00 marks neutral only at 25 °C. Use the Kw given for 40 °C to find the hydroxide concentration, then compare the two."
  - 3: "Warm water does hold more H₃O⁺ than cold water, and more OH⁻ too. What decides acidic or basic is which of the two is larger in this solution."
  - 4: "The product equals Kw in every water solution, whether acidic, basic or neutral. Neutral needs the two concentrations to be equal. Are they?"

  Note for the writer: this Check must stay a solution at pH 7.00, not pure water at 40 °C: the figure above it already shows that pure water at 40 °C has pH 6.77, and the Check asks the student to use that, not to repeat it.
- **Trap:** **Calling pH 7 neutral at every temperature** (neutral means the two concentrations are equal; that is pH 7.00 only at 25 °C). **Reporting the pOH as the pH** (the negative logarithm of a hydroxide concentration is the pOH; a basic solution at 25 °C must come out above 7). **Reading a pH difference as a plain ratio** (a solution at pH 4 has 1,000 times the hydronium concentration of one at pH 7, not about twice). **Using 1.0 × 10⁻¹⁴, or 14.00, at a temperature other than 25 °C** (use the $K_w$ the question gives). **Thinking an acidic solution has no OH⁻** (both ions are in every water solution; only their sizes differ). **Giving a pH the wrong number of digits** (two significant figures in the concentration, two decimal places in the pH).
- **Key points:** water passes protons between its own molecules, $\ce{2H2O(l) <=> H3O+(aq) + OH-(aq)}$, and at 25 °C $K_w = [\ce{H3O+}][\ce{OH-}] = 1.0 \times 10^{-14}$ in every dilute water solution; H⁺(aq) and H₃O⁺(aq) are two ways to write one ion, and the exam accepts both; $\text{pH} = -\log[\ce{H3O+}]$ and $\text{pOH} = -\log[\ce{OH-}]$, so $[\ce{H3O+}] = 10^{-\text{pH}}$, a lower pH means more hydronium, and each pH unit is a factor of ten; at 25 °C, pH + pOH = 14.00; the digits after the decimal point are a pH's significant figures, so a two-figure concentration gives a pH with two decimal places; neutral means $[\ce{H3O+}] = [\ce{OH-}]$, which is pH 7.00 at 25 °C only, because $K_w$ rises with temperature.

**Figures**

- **`8-1-ph-rulers.svg`** (viewBox 0 0 480 590, font-size 18). Three vertical rulers side by side, each a straight ink line from y = 70 to y = 490 with 15 short tick marks 30 units apart. Ruler 1 at x = 110, ruler 2 at x = 250, ruler 3 at x = 390.
  - Headings above the rulers, centered on them at y = 36: "pH", "[H₃O⁺] in M", "[OH⁻] in M".
  - Tick labels, one at every tick, to the right of each ruler. Ruler 1, top to bottom: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14. Ruler 2, top to bottom: 1, 10⁻¹, 10⁻², 10⁻³, 10⁻⁴, 10⁻⁵, 10⁻⁶, 10⁻⁷, 10⁻⁸, 10⁻⁹, 10⁻¹⁰, 10⁻¹¹, 10⁻¹², 10⁻¹³, 10⁻¹⁴. Ruler 3, top to bottom: the same fifteen labels in the opposite order, 10⁻¹⁴ at the top and 1 at the bottom. (Exponents as raised `tspan`s, not as small Unicode characters, so that they stay 12 px or more at 320 px.)
  - The row at pH 7 (y = 280) has a band of the light accent color behind it, 28 units tall, from x = 30 to x = 450: it holds 7, 10⁻⁷ and 10⁻⁷.
  - Two lines of text under the rulers, centered: at y = 530, "Shaded row: neutral at 25 °C"; at y = 564, "One step down: [H₃O⁺] ÷ 10, [OH⁻] × 10".
  - Text in the figure: 3 headings, 45 tick labels and 2 lines under the rulers. Each row multiplies to 10⁻¹⁴: check all fifteen as you place them.
  - Alt: "Three vertical rulers side by side, each with fifteen marks. The first is pH, from 0 at the top to 14 at the bottom. The second is the hydronium ion concentration, from 1 M at the top down to 10 to the minus 14 M at the bottom. The third is the hydroxide ion concentration, running the other way, from 10 to the minus 14 M at the top to 1 M at the bottom. The row at pH 7, where both concentrations are 10 to the minus 7 M, is shaded and marked as neutral at 25 °C. A note says that one step down divides the hydronium concentration by 10 and multiplies the hydroxide concentration by 10."
  - Caption: "pH and the two concentrations at 25 °C. In every row the two concentrations multiply to 10⁻¹⁴."
- **`8-1-neutral-at-three-temperatures.svg`** (viewBox 0 0 480 360, font-size 18). A bar chart with a linear vertical scale, drawn from computed heights.
  - Vertical axis: an ink line at x = 80 from y = 290 (zero) up to y = 50 (20), 12 units for each 1 × 10⁻⁸ M. Tick marks and numbers at 0, 5, 10, 15 and 20 (y = 290, 230, 170, 110, 50), the numbers to the left of the axis. Axis title, horizontal, above the axis at y = 28, starting at x = 20: "Concentration (10⁻⁸ M)". A baseline in ink along y = 290 from x = 80 to x = 460.
  - Three pairs of bars, each bar 36 wide, the two bars of a pair touching. Pair centers at x = 160, 280 and 400. In each pair the left bar is H₃O⁺ (filled with the light accent color, ink outline) and the right bar is OH⁻ (diagonal hatching in the secondary color, ink outline). Heights: at 10 °C both bars are 65 units (5.39 × 12); at 25 °C both are 120 units (10.0 × 12); at 40 °C both are 204 units (17.0 × 12).
  - Under each pair, two lines centered on it: at y = 314, "10 °C", "25 °C", "40 °C"; at y = 340, "pH 7.27", "pH 7.00", "pH 6.77".
  - A key at the top right, above the tallest bars (y = 14 to 40): a small square with the plain fill and "H₃O⁺", then a small hatched square and "OH⁻".
  - Text in the figure: the axis title, 5 scale numbers, 6 labels under the pairs and 2 key labels.
  - Alt: "A bar chart of the hydronium and hydroxide ion concentrations in pure water at three temperatures. At 10 °C the two bars are equal, each about 5.4 times 10 to the minus 8 M, and the pH is 7.27. At 25 °C the two bars are equal at 10 times 10 to the minus 8 M, and the pH is 7.00. At 40 °C the two bars are equal at about 17 times 10 to the minus 8 M, and the pH is 6.77. Hydronium bars are plain and hydroxide bars are hatched."
  - Caption: "Pure water is neutral at every temperature: the two concentrations are equal. Only the pH at which that happens changes."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; the equation sheet's value; sure |
| $K_w$ at 10 °C | 2.9 × 10⁻¹⁵ | the design; standard tables give p$K_w$ = 14.53 to 14.54 (2.92 × 10⁻¹⁵); fairly sure |
| $K_w$ at 40 °C | 2.9 × 10⁻¹⁴ | the design; standard tables give p$K_w$ = 13.53 to 13.54 (2.92 × 10⁻¹⁴); fairly sure |
| Molar concentration of water in water | about 55 mol/L | 997 g/L ÷ 18.02 g/mol = 55.3; sure |
| Atomic masses | H 1.008, O 16.00 | the site's `src/data/elements.ts` (used only for the 55 mol/L above) |
| pH of sports drinks | about 3 to 3.5 | from memory of published surveys of beverage acidity; fairly sure **(verify)** |
| Soil pH that blueberries prefer | about 4.5 to 5.5 | gardening references; fairly sure (not printed; it sets the worked example's 5.33) |
| Autoionization of water is endothermic | about +56 kJ/mol | the reverse of the neutralization of a strong acid by a strong base; sure of the sign (no number is printed) |

**Check script:** `scratchpad/unit8/checks/8-1.py`.

**Notes for the writer**

- No acid and no base is named in this lesson. Every sample is described by a concentration or a pH. Do not add hydrochloric acid, sodium hydroxide or any household liquid, and do not line a pH scale with everyday substances: the rulers figure carries numbers only.
- Write H₃O⁺ in every equation and expression. H⁺ appears in the "Two names, one ion" paragraph and in the matching key point, and nowhere else.
- Say "at 25 °C" every time 1.0 × 10⁻¹⁴, 14.00 or 7.00 is used as a rule. The two worked examples and Checks 4 and 5 each state the temperature in the question.
- "In every dilute water solution" is the hedge for $K_w$: keep the word "dilute" where the brief has it.
- Do not explain the two-decimal rule with the words "mantissa" or "characteristic".
- The second logarithm fact prints $[\ce{H3O+}] = 10^{-\text{pH}}$; Check 1 follows the rulers figure and the "How many digits" paragraph, not that line directly.
- The sentence about one hydronium ion in 550 million molecules is for scale only. Do not turn it into a percent ionization: that term is topic 8.3's.
- Do not say that warming water "makes it acidic". Warm pure water has more H₃O⁺ and more OH⁻, in equal amounts.

**Reactions, substances and scenarios used:** one equation, the autoionization of water. Scenarios: pure water's small conductivity (opening); a solution with $[\ce{H3O+}]$ = 5.0 × 10⁻⁶ M and $[\ce{OH-}]$ = 2.0 × 10⁻⁹ M (one line of text); 4.7 × 10⁻⁶ M used to show the logarithm of a product; a sports drink at pH 3.42, 3.8 × 10⁻⁴ M (Check 1); a solution with $[\ce{H3O+}]$ = 0.0072 M, pH 2.14 (Check 2); a mountain pond whose pH falls from 6.8 to 5.3 with the spring snowmelt, a factor of about 32 (Check 3); a blueberry grower's soil extract with $[\ce{H3O+}]$ = 4.7 × 10⁻⁶ M, pH 5.33, $[\ce{OH-}]$ = 2.1 × 10⁻⁹ M, pOH 8.67 (worked example 1); freshwater aquarium water with $[\ce{OH-}]$ = 1.4 × 10⁻⁶ M, pH 8.15 (Check 4); four samples given as pOH 4.30, $[\ce{H3O+}]$ = 2.5 × 10⁻¹⁰ M, $[\ce{OH-}]$ = 2.0 × 10⁻⁵ M and pH 9.20 (Check 5); pure water at 10 °C, $K_w$ = 2.9 × 10⁻¹⁵, 5.4 × 10⁻⁸ M, pH 7.27 (worked example 2); pure water at 40 °C, 1.7 × 10⁻⁷ M, pH 6.77 (figure); a solution at 40 °C with pH 7.00 and $[\ce{OH-}]$ = 2.9 × 10⁻⁷ M (Check 6). Figures: the two the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.1 Introduction to Acids and Bases`).

**Check script:** `scratchpad/unit8/checks/8-1.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.1 Introduction to Acids and Bases`).

### Task 2: Lesson 8.2, pH and pOH of Strong Acids and Bases

**Files:**
- Create: `src/content/lessons/unit-8/8-2-ph-and-poh-of-strong-acids-and-bases.mdx`
- Create: `public/figures/8-2-two-hydroxides.svg`, `public/figures/8-2-four-quantities.svg`

**Brief**

- **Front matter:** `topic: "8.2"`, `minutes: 15`, summary: "How to find the pH of a strong acid or a strong base straight from its concentration, why a group 2 hydroxide counts twice, and how to go from a pH back to a concentration." (No colon in the summary.)
- **Framework (8.2, two statements):** (1) a strong acid ionizes completely in water, so $[\ce{H3O+}]$ equals the starting concentration of the acid and the pH follows directly; the strong acids are HCl, HBr, HI, HClO₄, H₂SO₄ and HNO₃. (2) A strong base separates completely into ions, so $[\ce{OH-}]$ follows from its starting concentration, and the pOH and the pH from that; the strong bases are the hydroxides of groups 1 and 2. The exam expects two hydroxide ions for each formula unit of a group 2 hydroxide; the framework does not spell that out, and it is taught here with no "Beyond the exam" label. The objective is to calculate pH and pOH from the concentrations in a solution of a strong acid or a strong base. **What this lesson does not do:** an acid mixed with a base is topic 8.4's; weak acids and $K_a$ are topic 8.3's (one Check gives a weak acid's percent ionized as data, and calculates nothing from a $K_a$); the pH of sulfuric acid is not calculated (the lesson says, as lesson 4.2 does, that only its first proton is strong, and leaves it there). **Equation sheet:** pH, pOH, $K_w$ and 14 = pH + pOH are on it. The lists of strong acids and strong bases are not: they have to be known.
- **Opening:** stir slaked lime, which is calcium hydroxide, into water, let the cloudiness settle and pour off the clear liquid. That liquid is limewater, and cooks have soaked corn in it for thousands of years to make the dough for tortillas. Very little of the solid dissolves, less than 2 grams in a liter, so limewater is a dilute solution. Yet its pH is above 12. Calcium hydroxide is a strong base, and this lesson is about what "strong" does to a pH, and what it has nothing to do with. Note for the writer: this is real (nixtamalization; a saturated solution of Ca(OH)₂ at 25 °C is about 0.02 M with a pH near 12.4 to 12.6). Print "less than 2 grams in a liter" and "above 12" and no other number here. Lesson 4.2 (lines 548 to 576) uses limewater with carbon dioxide; do not bring that reaction in.
- **Section "Strong means all of it":**
  - Recall, naming topics 4.2 and 4.8: in a **strong acid**, essentially every molecule gives its proton to water. The equation has a single arrow. Display, split after the arrow, the equation lesson 4.8 used:

    $$\ce{HClO4(aq) + H2O(l) -> H3O+(aq) + ClO4-(aq)}$$

  - The strong acids, as lesson 4.2 listed them: HCl, HBr, HI, HNO₃, H₂SO₄ (its first proton) and HClO₄. This list is not on the equation sheet. Any other acid in this course is weak unless a question says otherwise.
  - What that does to a calculation: nothing is left to solve. If every molecule of a strong acid with one proton ionizes, then $[\ce{H3O+}]$ is the concentration of the acid that was dissolved. There is no equilibrium table, because there is no acid left at equilibrium to put in it.
  - Two things set aside, one sentence each. Water's own ions (1.0 × 10⁻⁷ M at 25 °C, topic 8.1) are far too few to matter beside the acid's. And sulfuric acid is a special case: its first proton is strong and its second is not, so its pH is not found this way, and this course does not ask for it.
- **Worked example "Perchloric acid":** a solution is 0.0062 M in perchloric acid, HClO₄, a strong acid. Find its pH.
  1. **Strong, so all of it ionizes.** Each HClO₄ gives one H₃O⁺: $[\ce{H3O+}] = 0.0062$ M.
  2. **Take the pH.** Display: $\text{pH} = -\log(0.0062) = 2.21$.
  3. **Check it.** 0.0062 is 6.2 × 10⁻³, so the pH must lie between 2 and 3 (topic 8.1). Two significant figures in the concentration, two decimal places in the pH.
- **Paragraph "Strong is not the same as concentrated"** (inside the same section, after the worked example): **strong** and **weak** say what fraction of an acid's molecules ionize: essentially all, or only some. **Concentrated** and **dilute** say how much of the acid is dissolved in each liter. The two are separate. The perchloric acid above is a dilute solution of a strong acid. A solution can equally be a concentrated solution of a weak acid, and which of two solutions has the lower pH depends on both things at once: how much acid there is, and what fraction of it has ionized.
  - `<KeyIdea>`: for a strong acid with one proton, $[\ce{H3O+}]$ is the acid's concentration, and the pH is its negative logarithm. Strong describes the fraction that ionizes, not the amount dissolved.
- **Check 1**, `<Check answer={4}>`: "Hydroiodic acid, nitric acid and perchloric acid are strong acids. Formic acid is a weak acid: in a 0.50 M solution, about 1.9 percent of its molecules are ionized. Which of these four solutions has the lowest pH?" Options:
  1. 0.50 M formic acid, HCHO₂
  2. 0.0080 M hydroiodic acid, HI
  3. 0.015 M perchloric acid, HClO₄
  4. 0.030 M nitric acid, HNO₃

  Why: the lowest pH goes with the highest $[\ce{H3O+}]$. The three strong acids ionize completely, so their hydronium concentrations are 0.0080 M, 0.015 M and 0.030 M. The formic acid is by far the most concentrated solution, but only 1.9 percent of it is ionized: 0.019 × 0.50 M = 0.0095 M. The largest of the four is the nitric acid's 0.030 M. The pH values are 1.52 for the nitric acid, 1.82 for the perchloric acid, about 2.0 for the formic acid and 2.10 for the hydroiodic acid. (Put the four in a short Markdown table of three columns: solution, [H₃O⁺] in M, pH.) Misses:
  - 1: "This is the most concentrated of the four, but only about 1.9 percent of it is ionized. Work out its hydronium concentration before you compare."
  - 2: "The lowest pH goes with the highest hydronium concentration, not the lowest. Find the hydronium concentration of all four solutions."
  - 3: "Perchloric acid is strong, so its hydronium concentration is 0.015 M. Is that the highest of the four? Find the other three."

  Note for the writer: formic acid's 1.9 percent at 0.50 M is the value lesson 8.3's explorer shows (1.88 percent, from $K_a$ = 1.8 × 10⁻⁴). Give no $K_a$ here. Print the formic acid's pH as "about 2.0", as its percent is "about 1.9": the rounded 1.9 percent gives 2.02, and the explorer of lesson 8.3 shows 2.03 for this solution, so neither is printed.
- **Section "Strong bases: count the hydroxide ions":**
  - A **strong base** is fully separated into ions in water, and OH⁻ is one of them (topic 4.2). The strong bases, as lesson 4.2 listed them: the hydroxides of the group 1 metals (LiOH, NaOH, KOH and the rest) and Ca(OH)₂, Sr(OH)₂ and Ba(OH)₂. Not on the equation sheet either.
  - Two equations, each on its own line, single arrows:

    $$\ce{LiOH(s) -> Li+(aq) + OH-(aq)}$$

    $$\ce{Sr(OH)2(s) -> Sr^2+(aq) + 2OH-(aq)}$$

    The second is the one to look at. Each formula unit of strontium hydroxide puts two hydroxide ions into the solution. So $[\ce{OH-}]$ is twice the concentration of the strontium hydroxide that dissolved.
  - Place the figure `8-2-two-hydroxides.svg` here.
  - The route for a base, as a numbered list: (1) from the formula, find $[\ce{OH-}]$: the concentration of the base times the number of OH in its formula; (2) take the pOH, $-\log[\ce{OH-}]$; (3) at 25 °C, pH = 14.00 − pOH. And a check that costs nothing: at 25 °C a solution of a base must have a pH above 7. If yours came out below 7, you have reported the pOH.
- **Worked example "Strontium hydroxide":** a solution at 25 °C is 0.0037 M in strontium hydroxide, Sr(OH)₂, a strong base. Find its pH.
  1. **Count the hydroxide ions.** One Sr(OH)₂ gives two OH⁻. Display: $[\ce{OH-}] = 2 \times 0.0037 = 0.0074\ \text{M}$.
  2. **pOH first.** Display: $\text{pOH} = -\log(0.0074) = 2.13$.
  3. **Then pH.** Display: $\text{pH} = 14.00 - 2.13 = 11.87$.
  4. **Check it.** A base, and the pH is above 7. Leaving out the factor of two would have given 11.57, too low by 0.30, which is the logarithm of 2.
- **Check 2**, `<Check numeric="12.65" tolerance={0.18}>`: "Lithium hydroxide, LiOH, is a strong base. What is the pH of a 0.045 M solution of lithium hydroxide at 25 °C?" Why: one LiOH gives one OH⁻, so $[\ce{OH-}] = 0.045$ M. Display: $\text{pOH} = -\log(0.045) = 1.35$, then $\text{pH} = 14.00 - 1.35 = 12.65$. Slips:
  - `1.35` (the pOH given as the pH): "That is the pOH. A solution of a base has a pH above 7 at 25 °C, so one more step is needed."
  - `12.95` (the hydroxide concentration doubled, as for a group 2 hydroxide): "Did you double the hydroxide concentration? Look at the formula: how many OH does one formula unit of this base hold?"
  - `12.7` (one decimal place where two are due): "Did you round to one decimal place? The concentration has two significant figures, so the pH takes two digits after the decimal point."

  Tolerance: 0.18 percent of 12.65 is 0.023, so the page accepts 12.63 to 12.67. There is one honest answer, 12.65 (12.653 unrounded). The slip 12.7 is 0.05 above the answer and outside the tolerance; the three slips are 0.25 or more apart.
- **Section "From a pH back to a concentration":**
  - Every step so far can be run backward. From a pH, $[\ce{H3O+}] = 10^{-\text{pH}}$ (topic 8.1), and for a strong acid with one proton that is the concentration of the acid. For a strong base, go from the pH to the pOH, from the pOH to $[\ce{OH-}]$, and then divide by the number of OH in the formula to get the concentration of the base.
  - Place the figure `8-2-four-quantities.svg` here, with one sentence: any one of the four quantities gives the other three, and no side of the square needs more than one step.
- **Check 3**, `<Check numeric="0.014" unit="M">`: "A solution of hydroiodic acid, HI, a strong acid, has a pH of 1.85. What is the concentration of the hydroiodic acid, in M?" Why: undo the logarithm. Display: $[\ce{H3O+}] = 10^{-1.85} = 0.014\ \text{M}$. Hydroiodic acid is strong and has one proton, so every HI that dissolved made one H₃O⁺, and the acid's concentration is the same 0.014 M. Two decimal places in the pH, two significant figures in the concentration. Slips:
  - `7.1e-13` (the hydroxide ion concentration, 1.0 × 10⁻¹⁴ ÷ 0.0141): "That is the hydroxide ion concentration of this solution. The acid's concentration equals the hydronium ion concentration."
  - `71` (10 raised to +1.85, the minus sign left out): "Did you leave the minus sign out of the exponent? A pH between 1 and 2 goes with a concentration between 0.01 M and 0.1 M."
  - `0.27` (the logarithm of 1.85 taken): "That is the logarithm of 1.85. Going from a pH to a concentration undoes a logarithm. It does not take another one."
  - `0.267` (the same mistake, typed to three figures): "That is the logarithm of 1.85. Going from a pH to a concentration undoes a logarithm. It does not take another one."

  Tolerance: the page's 2 percent, which accepts 0.0137 to 0.0143 M; 0.014 and 0.0141 are both accepted (0.01413 unrounded).
- **Check 4**, `<Check numeric="0.0079" unit="M">`: "A sample of limewater, a solution of the strong base calcium hydroxide, Ca(OH)₂, has a pH of 12.20 at 25 °C. What is the concentration of calcium hydroxide in the sample, in M?" Why: work backward along the base's route. Display, three lines: $\text{pOH} = 14.00 - 12.20 = 1.80$; $[\ce{OH-}] = 10^{-1.80} = 0.0158\ \text{M}$; and, because each Ca(OH)₂ supplied two of those hydroxide ions, $[\ce{Ca(OH)2}] = \dfrac{0.0158}{2} = 0.0079\ \text{M}$. Slips:
  - `0.016` (the hydroxide concentration given, not halved): "That is the hydroxide ion concentration. How many hydroxide ions does each formula unit of calcium hydroxide supply?"
  - `0.0158` (the same mistake, typed to three figures): "That is the hydroxide ion concentration. How many hydroxide ions does each formula unit of calcium hydroxide supply?"
  - `0.032` (the hydroxide concentration doubled where it should be halved): "Did you multiply by 2? Each calcium hydroxide gives two OH⁻, so there is less calcium hydroxide than hydroxide, not more."
  - `0.0316` (the same mistake, typed to three figures): "Did you multiply by 2? Each calcium hydroxide gives two OH⁻, so there is less calcium hydroxide than hydroxide, not more."
  - `6.3e-13` (10 raised to −12.20: the hydronium ion concentration): "That is the hydronium ion concentration. For a base, go from the pH to the pOH first, then to the hydroxide concentration."
  - `3.175e-13` (the hydronium ion concentration, halved; the key stands midway between the two forms a student types, 3.2 × 10⁻¹³ and 3.15 × 10⁻¹³, and is within 1 percent of both, because a Check takes six slips at most): "That starts from the hydronium ion concentration. For a base, go from the pH to the pOH first, then to the hydroxide concentration."

  Tolerance: the page's 2 percent, which accepts 0.00774 to 0.00806 M; 0.0079 and 0.00792 are both accepted (0.007924 unrounded). A student who rounds $[\ce{OH-}]$ to 0.016 before halving types 0.0080, which is 1.3 percent above 0.0079 and is accepted. Note for the writer: 0.0079 M is below what dissolves (about 0.02 M), so the sample is a real, unsaturated limewater.
- **Section "Comparing and diluting":**
  - To compare solutions of strong acids and bases, turn each into the one quantity they share: $[\ce{H3O+}]$ for acids, $[\ce{OH-}]$ for bases. The number on the label is not always that quantity.
- **Check 5**, `<Check answer={2}>`: "Four solutions are at 25 °C. Solution A is 0.011 M rubidium hydroxide, RbOH. Solution B is 0.0060 M strontium hydroxide, Sr(OH)₂. Solution C is 0.0090 M sodium hydroxide, NaOH. Solution D is 0.018 M hydrobromic acid, HBr. The three hydroxides are strong bases, and hydrobromic acid is a strong acid. Which solution has the highest pH?" (Set the four solutions as a short list lettered A to D inside the question.) Options:
  1. Solution A
  2. Solution B
  3. Solution C
  4. Solution D

  Why: the highest pH goes with the highest $[\ce{OH-}]$. Rubidium hydroxide and sodium hydroxide each give one OH⁻ per formula unit: 0.011 M and 0.0090 M. Strontium hydroxide gives two: 2 × 0.0060 M = 0.012 M, the highest of the three, though its own concentration is the lowest. The pH values are 12.08 for the strontium hydroxide, 12.04 for the rubidium hydroxide and 11.95 for the sodium hydroxide. The hydrobromic acid has the largest number on its label, but it is an acid, with a pH of 1.74. Misses:
  - 1: "Rubidium hydroxide gives one OH⁻ for each formula unit, so its hydroxide concentration is 0.011 M. Find the hydroxide concentration of the other bases too."
  - 3: "Sodium hydroxide gives one OH⁻ for each formula unit, so its hydroxide concentration is 0.0090 M. Is that the highest of the four?"
  - 4: "This solution has the largest concentration of the four, but it is an acid. A high pH needs a high hydroxide concentration."
- **Paragraph "Diluting"** (inside the same section, after Check 5): add water to a solution of a strong acid until its volume is ten times what it was, and the same moles of H₃O⁺ are spread through ten times the volume. $[\ce{H3O+}]$ falls to one-tenth, and the pH rises by 1. For a strong base the same dilution cuts $[\ce{OH-}]$ to one-tenth, so the pOH rises by 1 and the pH falls by 1. Either way, at 25 °C dilution moves the pH toward 7 and never across it. The next sentence begins "**Beyond the exam:**" and says: in a solution as dilute as 10⁻⁸ M, the ions from water itself outnumber the acid's, and the simple rule no longer holds: the pH is just under 7, not 8.
- **Check 6**, `<Check answer={1}>`: "A technician pipets 10.0 mL of a hydrobromic acid solution that has a pH of 2.40 into a 1.00 L flask and fills the flask to the mark with water. Hydrobromic acid is a strong acid. What is the pH of the solution in the flask?" Options:
  1. 4.40, because [H₃O⁺] falls to one-hundredth
  2. 0.40, because a hundredfold dilution takes 2 off the pH
  3. 3.40, because one dilution adds 1 to the pH
  4. 0.024, because the pH falls to one-hundredth

  Why: 10.0 mL becomes 1.00 L, which is 1,000 mL: the volume is 100 times larger, so $[\ce{H3O+}]$ is one-hundredth of what it was. That is two tenfold steps, and each raises the pH by 1: 2.40 + 2 = 4.40. In numbers, $[\ce{H3O+}]$ goes from 4.0 × 10⁻³ M to 4.0 × 10⁻⁵ M. The pH goes up, not down, because there is less hydronium in each liter. It is the concentration that is divided by 100, not the pH. Misses:
  - 2: "Diluting an acid lowers its hydronium concentration. Which way does the pH move when the hydronium concentration goes down?"
  - 3: "Compare the two volumes: 10.0 mL becomes 1.00 L. By what factor is the acid diluted, and how many tenfold steps is that?"
  - 4: "It is the hydronium concentration that is divided by the dilution factor, not the pH. Find the new concentration, then take its pH."
- **Trap:** **Forgetting the second hydroxide ion** (Ca(OH)₂, Sr(OH)₂ and Ba(OH)₂ give two OH⁻ each: double the concentration going forward, halve it going back). **Reporting the pOH of a base as its pH** (at 25 °C a base's pH is above 7). **Taking "strong" to mean "concentrated"** (strong is the fraction ionized; a strong acid can be very dilute). **Building an equilibrium table for a strong acid** (it ionizes completely; the concentration is the answer). **Doubling for a group 1 hydroxide** (LiOH, NaOH and KOH give one OH⁻ each). **Dividing the pH by the dilution factor** (dilution divides the concentration; each tenfold step moves the pH by 1, toward 7).
- **Key points:** a strong acid ionizes completely, so for one with a single proton $[\ce{H3O+}]$ equals the acid's concentration and the pH is its negative logarithm; the strong acids are HCl, HBr, HI, HNO₃, H₂SO₄ (first proton) and HClO₄, and the strong bases are the group 1 hydroxides and Ca(OH)₂, Sr(OH)₂ and Ba(OH)₂, and neither list is on the equation sheet; for a strong base, $[\ce{OH-}]$ is the base's concentration times the number of OH in its formula, then pOH, then pH = 14.00 − pOH at 25 °C; working backward, $[\ce{H3O+}] = 10^{-\text{pH}}$ and $[\ce{OH-}] = 10^{-\text{pOH}}$, and a group 2 hydroxide's concentration is half its $[\ce{OH-}]$; strong is about the fraction ionized and concentrated is about the amount dissolved; a tenfold dilution of a strong acid raises its pH by 1, and of a strong base lowers it by 1.

**Figures**

- **`8-2-two-hydroxides.svg`** (viewBox 0 0 480 330, font-size 18). One box of particles, in the style of `3-8-concentration-boxes.svg`.
  - A title above the box, centered at y = 28: "Sr(OH)₂ dissolved in water".
  - The box: a rectangle from (40, 44) to (440, 250), ink outline, filled with the light accent color at low strength (or the background color), standing for the solution.
  - Twelve particles on a grid of four columns (x = 90, 190, 290, 390) and three rows (y = 82, 147, 212), each moved off its grid point by up to 6 units so that the box does not look like a crystal; no two particles touch.
    - 4 Sr²⁺ ions: dark circles (ink fill), radius 20, each with "2+" in white inside. At grid points (190, 82), (90, 147), (390, 147) and (290, 212).
    - 8 OH⁻ ions: pale circles (light accent fill, ink outline), radius 16, each with a smaller pale circle of radius 8 touching it at its left or its right, never above or below (the hydrogen atom), and a "−" beside it. With the hydrogen at the side and an offset of 6 at most, two neighbors in a column are at least 53 apart and need 36, and nothing reaches the edge of the box. At the other eight grid points.
  - A key under the box, on one line centered at y = 292: a dark circle and "Sr²⁺ (4)", then a pale pair and "OH⁻ (8)".
  - Charge is balanced: 4 × (+2) and 8 × (−1). Water molecules are left out.
  - Text in the figure: the title, "2+" four times, "−" eight times, and the two key labels.
  - Alt: "A box of particles for strontium hydroxide dissolved in water. It holds 4 strontium ions, drawn as dark circles marked 2 plus, and 8 hydroxide ions, drawn as pale pairs of circles marked minus, all separate from one another. There are two hydroxide ions for every strontium ion."
  - Caption: "Four formula units of strontium hydroxide in solution: 4 Sr²⁺ ions and 8 OH⁻ ions. The hydroxide concentration is twice the concentration of the base. Water molecules are left out."
- **`8-2-four-quantities.svg`** (viewBox 0 0 480 360, font-size 18). A square with a quantity at each corner and a relation on each side.
  - Four rounded boxes, 130 wide and 50 tall, ink outline, light accent fill, each with its label centered: top left "[H₃O⁺]", from (40, 80) to (170, 130); top right "[OH⁻]", from (310, 80) to (440, 130); bottom left "pH", from (40, 240) to (170, 290); bottom right "pOH", from (310, 240) to (440, 290).
  - Four connectors, each a line in the accent color with an arrowhead at both ends: top, from (170, 105) to (310, 105); bottom, from (170, 265) to (310, 265); left, from (105, 130) to (105, 240); right, from (375, 130) to (375, 240).
  - Labels on the sides: above the top connector, centered at (240, 44): "[H₃O⁺][OH⁻] = 1.0 × 10⁻¹⁴ (25 °C)". Below the bottom connector, centered at (240, 330): "pH + pOH = 14.00 (25 °C)". Beside the left connector, starting at x = 117, y = 178: "pH = −log[H₃O⁺]". Beside the right connector, ending at x = 363, y = 208: "pOH = −log[OH⁻]". The two side labels sit at different heights so that they cannot run into each other.
  - Text in the figure: four corner labels and four side labels.
  - Alt: "A square with a quantity at each corner: the hydronium ion concentration at the top left, the hydroxide ion concentration at the top right, pH at the bottom left and pOH at the bottom right. Double-headed arrows join the corners along the four sides. The top side is labeled with the product of the two concentrations, 1.0 times 10 to the minus 14 at 25 °C. The bottom side is labeled pH plus pOH equals 14.00 at 25 °C. The left side is labeled pH equals the negative logarithm of the hydronium concentration, and the right side is labeled pOH equals the negative logarithm of the hydroxide concentration."
  - Caption: "Four ways to describe one solution. Each side of the square is one step, and each step can be run in either direction."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; sure |
| The strong acids | HCl, HBr, HI, HNO₃, H₂SO₄ (first proton), HClO₄ | lesson 4.2, line 191; the framework's list; sure |
| The strong bases | group 1 hydroxides; Ca(OH)₂, Sr(OH)₂, Ba(OH)₂ | lesson 4.2, line 191; sure |
| Solubility of Ca(OH)₂ at 25 °C | about 0.02 M (about 1.5 g/L; 0.020 mol × 74.10 g/mol) | the lesson table; handbooks give 1.5 to 1.7 g/L near room temperature; fairly sure |
| pH of saturated limewater at 25 °C | about 12.4 to 12.6 | from 0.02 M, 2 OH⁻ each; the measured value is a little lower than the simple calculation; fairly sure (only "above 12" is printed) |
| Solubility of Sr(OH)₂ at 25 °C | about 0.04 M or more | handbooks list the octahydrate at roughly 1 to 2 g per 100 mL **(verify)**; the lesson needs only that 0.0037 M and 0.0060 M dissolve |
| Formic acid, percent ionized at 0.50 M | about 1.9 percent | from $K_a$ = 1.8 × 10⁻⁴ (the design; sure): 1.88 percent by the full equation, as lesson 8.3's explorer shows |
| Limewater used to soak corn (nixtamalization) | real | sure |

Atomic masses (the site's `src/data/elements.ts`: Ca 40.08, O 16.00, H 1.008) are used only for the 1.5 g/L above; no molar mass is printed in the lesson.

**Check script:** `scratchpad/unit8/checks/8-2.py`.

**Notes for the writer**

- Every equation of a strong acid or a strong base has a single arrow and state symbols. The two hydroxide equations start from the solid, (s), because that is what dissolves.
- Say "at 25 °C" wherever 14.00 or "above 7" is used.
- Do not calculate the pH of any sulfuric acid solution, and do not give a concentration for it.
- Check 1 comes before weak acids are taught. It gives the percent ionized as data and needs no $K_a$. Do not add an equilibrium table, a $K_a$ or the words "percent ionization" as a defined term: say "about 1.9 percent of its molecules are ionized".
- Limewater appears twice: in the opening, with no concentration, and in Check 4. The opening must not print a pH to two decimal places or a concentration, or it would hand Check 4 its method with numbers.
- Do not write that calcium hydroxide is "a weak base because it barely dissolves". It is a strong base that is only slightly soluble: what dissolves is fully separated into ions. The opening and the trap box say this in other words.
- The "Beyond the exam" sentence is the only mention of very dilute solutions. Do not add a calculation for it.
- No Check here mixes an acid with a base. Check 5 compares four separate solutions.

**Reactions, substances and scenarios used:** equations: perchloric acid ionizing in water (as lesson 4.8 wrote it); lithium hydroxide and strontium hydroxide dissolving. Scenarios: limewater from slaked lime, used to soak corn (opening); 0.0062 M perchloric acid, pH 2.21 (worked example 1); four acid solutions, 0.50 M formic acid at 1.9 percent ionized, 0.0080 M HI, 0.015 M HClO₄ and 0.030 M HNO₃ (Check 1); 0.0037 M strontium hydroxide, pOH 2.13, pH 11.87 (worked example 2); 0.045 M lithium hydroxide, pH 12.65 (Check 2); hydroiodic acid at pH 1.85, 0.014 M (Check 3); limewater at pH 12.20, 0.0079 M Ca(OH)₂ (Check 4); 0.011 M RbOH, 0.0060 M Sr(OH)₂, 0.0090 M NaOH and 0.018 M HBr compared (Check 5); 10.0 mL of hydrobromic acid at pH 2.40 diluted to 1.00 L, pH 4.40 (Check 6); a 10⁻⁸ M solution, named once. Figures: 4 Sr²⁺ and 8 OH⁻ in a box; the square of four quantities.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.2 pH and pOH of Strong Acids and Bases`).

**Check script:** `scratchpad/unit8/checks/8-2.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.2 pH and pOH of Strong Acids and Bases`).

### Task 3: Lesson 8.3, Weak Acid and Base Equilibria

**Files:**
- Create: `src/content/lessons/unit-8/8-3-weak-acid-and-base-equilibria.mdx`
- Create: `public/figures/8-3-weak-base-particles.svg`, `public/figures/8-3-conjugate-pair-equations.svg`
- Places the interactive block `<WeakAcid />` (built in its own task from "Diagram data" below, on top of the shared solver `src/lib/acid-base.ts`, whose "Diagram data" is also below; the lesson only places the block, and no Check depends on it).

**Brief**

- **Front matter:** `topic: "8.3"`, `minutes: 22`, summary: "How to find the pH of a weak acid or a weak base from its Ka or Kb with the equilibrium table of topic 7.7, what percent ionization means, and how Ka and Kb of a conjugate pair are tied together." (No colon in the summary.)
- **Framework (8.3, five statements):** (1) a weak acid gives protons to water, but only a small fraction of its molecules ionize, so $[\ce{H3O+}]$ is far below the starting concentration and most of the acid stays un-ionized. (2) A solution of a weak acid is an equilibrium between the acid and its conjugate base, with the constant $K_a$, often reported as p$K_a$; the pH comes from the starting concentration and the $K_a$. (3) A weak base takes protons from water, again only in a small fraction. (4) Its equilibrium has the constant $K_b$, or p$K_b$, and the pH comes from the starting concentration and the $K_b$. (5) The percent ionization comes from the constant and the starting concentration. The objective is to explain how pH, pOH and the concentrations of all species are related in a solution of a monoprotic weak acid or weak base. **What this lesson does not do:** the pH of a solution of a conjugate base alone, such as a salt, is topic 8.4's (this lesson finds a conjugate base's $K_b$ and stops); why one acid is stronger than another is topic 8.6's; comparing a pH with a p$K_a$ is topic 8.7's; acids with more than one proton are left out. **Equation sheet:** the $K_a$ and $K_b$ expressions, p$K_a$, p$K_b$ and $K_w = K_a \times K_b$ are on it. Percent ionization is not, and neither is the quadratic formula. No value of any $K_a$ or $K_b$ is on it: a question gives the one it needs. The framework names no 5 percent rule; the check used here is this site's own, from topic 7.7, and the lesson never calls it a rule of the exam.
- **Opening:** glycolic acid is the acid in many skin-care peels. Make a 0.30 M solution of it, put a pH meter in, and the meter reads close to 2.2. If every molecule of the acid had given its proton to water, the hydronium concentration would be 0.30 M and the meter would read 0.52. A reading near 2.2 says that only about 2 molecules in every 100 have done so. Topic 4.8 said that a weak acid gives up "only some" of its protons, and promised numbers. This lesson finds them. Note for the writer: glycolic acid in cosmetic peels is real. 0.30 M is about 2.3 percent by mass, weaker than a peel; do not call the 0.30 M solution a peel. The opening measures one solution against its own arithmetic. Do not set a strong acid beside it: no second bottle, no perchloric or hydrochloric acid at the same molarity, and no "times as much hydronium". (−log 0.30 = 0.52; 6.7 × 10⁻³ ÷ 0.30 is 2.2 percent.)
- **Section "A weak acid's equilibrium has its own constant":**
  - A weak acid in water is a reaction that runs both ways and settles with most of the acid still whole (topic 4.8). Write a weak acid as HA and its conjugate base as A⁻. Display, split after the arrow:

    $$\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}$$

  - It is an equilibrium, so it has a $K$ (topic 7.3), with water, a pure liquid, left out. Display: $K_a = \dfrac{[\ce{H3O+}][\ce{A-}]}{[\ce{HA}]}$. This is the **acid ionization constant**, $K_a$: the equilibrium constant for a weak acid giving its proton to water. The expression is on the equation sheet. The values are not: a question gives the $K_a$ it needs.
  - A table of the acids this lesson uses, three columns, with one sentence before it saying that the values are for 25 °C:

    | Acid | Formula | $K_a$ |
    |---|---|---|
    | Iodic acid | HIO₃ | 0.17 |
    | Chloroacetic acid | HC₂H₂ClO₂ | 1.4 × 10⁻³ |
    | Formic acid | HCHO₂ | 1.8 × 10⁻⁴ |
    | Glycolic acid | HC₂H₃O₃ | 1.5 × 10⁻⁴ |
    | Butanoic acid | HC₄H₇O₂ | 1.5 × 10⁻⁵ |

    Reading it: the larger the $K_a$, the further the ionization goes and the stronger the acid. Most of the values are very small, so the equilibrium lies far toward the un-ionized acid (topic 7.5). Iodic acid, at the top, is the exception, and a Check below shows how far it goes. A strong acid has no place in such a table: its ionization is essentially complete, and there is no equilibrium to describe.
  - **p$K_a$.** Because $K_a$ values spread over so many powers of ten, they are often given as logarithms, as $[\ce{H3O+}]$ is. Display: $\text{p}K_a = -\log K_a$. For butanoic acid, display: $\text{p}K_a = -\log(1.5 \times 10^{-5}) = 4.82$. The minus sign turns the order around, as it does for pH: **the stronger the acid, the larger its $K_a$ and the smaller its p$K_a$**. One unit of p$K_a$ is a factor of ten in $K_a$.
- **Section "From Ka to pH":**
  - Nothing here is new. Finding the pH of a weak acid is the problem of topic 7.7: start with reactant alone, let $x$ react, put the equilibrium row into the $K$ expression. The only change is that $K$ is now called $K_a$, and that the $x$ you find is $[\ce{H3O+}]$.
  - One sentence on the table's starting row: the starting $[\ce{H3O+}]$ is written as 0. Water's own 1.0 × 10⁻⁷ M (topic 8.1) is there, but it is too small to matter beside what the acid makes.
- **Worked example "Glycolic acid":** find the pH of 0.30 M glycolic acid, HC₂H₃O₃, at 25 °C, and the concentration of every species in the solution. $K_a = 1.5 \times 10^{-4}$.
  1. **Write the equilibrium.** HA stands for glycolic acid and A⁻ for its conjugate base, the glycolate ion, C₂H₃O₃⁻. Display, split after the arrow: $\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}$.
  2. **Set up the table.** Every value is in M. Water has no column.

     | | HA | H₃O⁺ | A⁻ |
     |---|---|---|---|
     | I | 0.30 | 0 | 0 |
     | C | −x | +x | +x |
     | E | 0.30 − x | x | x |

  3. **Put the equilibrium row into $K_a$.** Display: $K_a = \dfrac{x^2}{0.30 - x} = 1.5 \times 10^{-4}$.
  4. **Leave $x$ out beside 0.30.** $K_a$ is small, so $0.30 - x$ is very nearly 0.30. Display, split: $x^2 = (1.5 \times 10^{-4})(0.30) = 4.5 \times 10^{-5}$, then $x = 6.7 \times 10^{-3}$.
  5. **Check the approximation.** Display: $\dfrac{6.7 \times 10^{-3}}{0.30} \times 100\% = 2.2\%$. That is under 5 percent, so leaving $x$ out was justified.
  6. **Take the pH.** $x$ is $[\ce{H3O+}]$. Display: $\text{pH} = -\log(6.7 \times 10^{-3}) = 2.17$.
  7. **List every species.** $[\ce{H3O+}] = [\ce{A-}] = 6.7 \times 10^{-3}$ M. $[\ce{HA}] = 0.30 - 0.0067 = 0.29$ M. And from $K_w$, $[\ce{OH-}] = \dfrac{1.0 \times 10^{-14}}{6.7 \times 10^{-3}} = 1.5 \times 10^{-12}$ M.
  8. **Check.** Display: $\dfrac{(6.7 \times 10^{-3})^2}{0.29} = 1.5 \times 10^{-4}$. The answers give $K_a$ back.

  After the example, two sentences: solving the equation without the shortcut gives $x = 6.6 \times 10^{-3}$ M and a pH of 2.18. The shortcut's 2.17 is off by less than 0.01 of a pH unit, which is what passing the check buys.

  Note for the writer: keep unrounded values through the steps (x = 6.708 × 10⁻³; 2.236 percent; pH 2.1734; [HA] = 0.2933; [OH⁻] = 1.49 × 10⁻¹²; the full equation gives x = 6.634 × 10⁻³ and pH 2.1782). The printed answer of the worked example is the shortcut's, 2.17.
- **Check 1**, `<Check numeric="2.61" tolerance={0.6}>`: "Butanoic acid, HC₄H₇O₂, is the weak acid that gives rancid butter its smell. Its $K_a$ is 1.5 × 10⁻⁵. What is the pH of a 0.40 M solution of butanoic acid at 25 °C?" Why: the table has 0.40 − x, x and x in its equilibrium row. Display, split: $\dfrac{x^2}{0.40 - x} = 1.5 \times 10^{-5}$; leave $x$ out beside 0.40: $x^2 = (1.5 \times 10^{-5})(0.40) = 6.0 \times 10^{-6}$, so $x = 2.45 \times 10^{-3}$, kept to three figures for the two steps that use it. The check: $\dfrac{2.45 \times 10^{-3}}{0.40} \times 100\% = 0.61\%$, under 5 percent. Then $\text{pH} = -\log(2.45 \times 10^{-3}) = 2.61$. Slips:
  - `0.40` (the acid treated as strong: −log 0.40): "That is the pH if every molecule ionized, which is true of a strong acid. Butanoic acid is weak: set up the table and use Ka."
  - `5.22` (the pH taken from x², the square root not taken): "Did you take the pH from x²? Ka times 0.40 gives x². Take the square root to get x, which is the hydronium concentration."
  - `11.39` (14.00 minus the pH): "That is 14.00 minus the pH, which is the pOH. For an acid, x is the hydronium concentration, so its negative logarithm is already the pH."
  - `4.82` (the pKa, −log Ka): "That is the pKa, the negative logarithm of Ka itself. The pH comes from the hydronium concentration, which the table gives you."

  Tolerance: 0.6 percent of 2.61 is 0.016, so the page accepts 2.60 to 2.62 (2.5943 to 2.6257). The shortcut gives 2.611 and the full equation 2.612, both 2.61. A student who rounds $x$ to 2.4 × 10⁻³ before taking the logarithm gets 2.62, and one who gives one decimal place types 2.6; both are accepted. The four slips are 0.40 or more apart.
- **Section "How much of the acid ionizes":**
  - The **percent ionization** of a weak acid is the share of its molecules that have given up their proton: $[\ce{H3O+}]$ at equilibrium divided by the starting concentration of the acid, times 100 percent. Display, split: $\text{percent ionization} = \dfrac{[\ce{H3O+}]_\text{eq}}{[\ce{HA}]_\text{start}} \times 100\%$. It is not on the equation sheet.
  - For the 0.30 M glycolic acid: 6.7 × 10⁻³ ÷ 0.30 × 100% = 2.2 percent. You have already calculated it: for a weak acid alone in water, the check of the approximation and the percent ionization are the same division. About 2 molecules in 100 are ionized, which is the opening's number.
  - **What does adding water do?** Reason with $Q$ (topic 7.9). Double the volume of a weak acid solution and, for an instant, every concentration is halved. $Q$ has two concentrations on top and one underneath, so $Q$ falls to half of $K_a$. With $Q$ below $K$ the reaction runs forward: more of the acid ionizes. Dilution raises the percent ionization. $K_a$ itself has not changed: diluting leaves a $K$ exactly as it was (topic 7.9).
- **Check 2**, `<Check answer={1}>`, placed before the explorer: "A 0.30 M solution of glycolic acid is diluted with water to 0.030 M, and the equilibrium settles again. Compared with the 0.30 M solution, what is true of the 0.030 M solution?" Options:
  1. Its percent ionization goes up and its pH goes up
  2. Its percent ionization goes up and its pH goes down
  3. Its percent ionization and its pH both stay the same
  4. Its percent ionization goes down and its pH goes up

  Why: just after the water goes in, $Q$ is below $K_a$, so more of the acid ionizes and the percent ionization rises: from 2.2 percent to 6.8 percent. But those ions are now spread through ten times the volume, and the extra ionization does not make up for that. $[\ce{H3O+}]$ falls, from 6.6 × 10⁻³ M to 2.0 × 10⁻³ M, so the pH rises, from 2.18 to 2.69. Both things are true at once: a larger share ionized, and a less acidic solution. $K_a$ is the same in both. (These four numbers are from the full equation, because at 0.030 M the shortcut does not pass its check; say so in one clause.) Misses:
  - 2: "A pH follows the hydronium concentration, not the share of the acid that is ionized. The solution now has ten times the volume. What does that do to the concentration?"
  - 3: "Ka is unchanged, but Ka is not the percent ionization. Compare Q with Ka at the instant the water is added."
  - 4: "Compare Q with Ka at the instant the water is added: two concentrations are on top and one is underneath. Which way must the reaction run?"
- **The interactive diagram:** place `<WeakAcid />` here, after Check 2, under a sentence that says what it is: a weak acid in water, where you choose the acid and its starting concentration. The box shows 100 particles of the acid, each drawn whole or as a pair of ions. The graph shows the percent ionization of all three acids against the starting concentration, with a dashed line at 5 percent. The text then asks the student to do four things, as a numbered list, predicting before each move:
  1. **Read the starting state.** Formic acid at 0.10 M: 4 of the 100 particles are drawn as ions, 4.2 percent of the acid is ionized, and the pH is 2.38. The readout also gives the pH the shortcut would give, 2.37, and says that the shortcut passes its check here. The check uses the shortcut's $x$, so it comes out a little above the true percent ionized (here both round to 4.2), and the gap widens as the solution is diluted. A strong acid at 0.10 M would have a pH of 1.00.
  2. **Dilute it.** Before you slide the concentration down to 0.0010 M, predict two things: will the percent ionization go up or down, and will the pH go up or down? (You should see 34 percent ionized and a pH of 3.46. The solution is 100 times more dilute, yet $[\ce{H3O+}]$ fell only about 12-fold, from 4.2 × 10⁻³ M to 3.4 × 10⁻⁴ M, because so much more of the acid ionized. Here the shortcut gives 3.37 and fails its check, at 42 percent.)
  3. **Change the acid.** Go back to 0.10 M. Butanoic acid's $K_a$ is 12 times smaller than formic acid's. Predict the percent ionization and the pH, then choose it. (1.2 percent and a pH of 2.91. Chloroacetic acid, with the largest $K_a$ of the three, gives 11 percent and a pH of 1.95.)
  4. **Find where the shortcut stops working.** For each acid, find the highest concentration at which the shortcut fails its check. (0.50 M for chloroacetic acid, 0.050 M for formic acid, 0.0050 M for butanoic acid.) Each acid's $K_a$ is about a tenth of the one before, and so is the concentration at which its shortcut gives out.

  The numbers in parentheses are for the writer to phrase as "you should see". They are the module's values (see "Diagram data"), which come from the full equation.
- After the explorer, still in the same section:
  - `<KeyIdea>`: diluting a weak acid raises its percent ionization and lowers its $[\ce{H3O+}]$, so the pH rises. $K_a$ does not change. At one concentration, the acid with the larger $K_a$ is more ionized and has the lower pH, and a weak acid's pH is always above that of a strong acid at the same concentration.
  - **When is the shortcut allowed?** What step 4 showed is what topic 7.7 said: what decides is how large the starting concentration is beside $K$. A concentrated solution of an acid with a small $K_a$ passes easily; a dilute solution, or an acid with a large $K_a$, may not. There is no cutoff worth memorizing, so always do the check, and write the percentage down as part of the answer. If the check fails, the equation has to be solved with $x$ left in: $x^2 + K_a x - K_a(\text{starting concentration}) = 0$ (display, with $C$ defined in words as the starting concentration: $x^2 + K_a x - K_a C = 0$). The next sentence begins "**Beyond the exam:**" and says: that takes the quadratic formula, which topic 7.7 uses once. Exam questions are written so that $x$ is small, and a question that asks you to justify the shortcut wants to see the percentage.
- **Check 3**, `<Check answer={3}>`: "Iodic acid, HIO₃, has $K_a$ = 0.17, large for a weak acid. A student uses the shortcut for a 0.10 M solution of iodic acid and gets $x$ = 0.13 M. What should the student conclude?" Options:
  1. The pH is 0.89, because x is the hydronium concentration
  2. The acid is 130 percent ionized, so it must be a strong acid
  3. The shortcut has failed, because x is more than the 0.10 M of acid
  4. The Ka was misread, because no weak acid has a Ka as large as 0.17

  Why: do the check. Display: $\dfrac{0.13}{0.10} \times 100\% = 130\%$. That is far over 5 percent, and it is impossible besides: the acid cannot make more hydronium than there is acid. The shortcut assumed that 0.10 − x is nearly 0.10, and with a $K_a$ this large it is not. The 0.13 M is not a concentration of anything, so no pH can be taken from it. Solving the full equation gives $x$ = 0.071 M: iodic acid at 0.10 M is 71 percent ionized, with a pH of 1.15. That is what topic 4.8 meant by saying that iodic acid gives up most of its protons, though not essentially all of them. Misses:
  - 1: "x would be the hydronium concentration if the shortcut held. Do the check before you use x: divide it by the starting concentration."
  - 2: "No acid can be more than 100 percent ionized, so 130 percent cannot describe this solution. Where could a number like that have come from?"
  - 4: "A Ka of 0.17 is large for a weak acid, but it is the measured value. Divide x by the starting concentration and see what the check says."
- **Section "Ka from a measured pH":**
  - The same table runs the other way. A pH meter gives the pH of a weak acid solution of known concentration, and the pH gives $x$: $[\ce{H3O+}] = 10^{-\text{pH}}$ (topic 8.1). The table's equilibrium row then holds three known numbers: $[\ce{H3O+}] = x$, $[\ce{A-}] = x$ and $[\ce{HA}]$ = the starting concentration minus $x$. Put them into the $K_a$ expression. Nothing has to be left out and nothing has to be checked, because $x$ was measured, not solved for.
- **Check 4**, `<Check numeric="1.0e-10">`: "Phenol, C₆H₅OH, is a very weak acid that hospitals once used as an antiseptic. A 0.040 M solution of phenol has a pH of 5.70 at 25 °C. What is $K_a$ for phenol?" Why: the pH gives $x$. Display: $x = 10^{-5.70} = 2.0 \times 10^{-6}\ \text{M}$. That is $[\ce{H3O+}]$ and also $[\ce{A-}]$. The phenol left is 0.040 − 0.0000020, which is still 0.040 M. Display, split: $K_a = \dfrac{x^2}{0.040} = \dfrac{(2.0 \times 10^{-6})^2}{0.040} = 1.0 \times 10^{-10}$. Slips:
  - `5.0e-5` (x divided by the starting concentration: the fraction ionized): "That is x divided by the starting concentration, the fraction ionized. Ka has two concentrations on top: the hydronium ion's and the conjugate base's."
  - `4.0e-12` (x² not divided by the concentration of the acid): "That is x². The Ka expression also has the concentration of the un-ionized acid underneath."
  - `2.0e-6` (the hydronium ion concentration itself): "That is the hydronium ion concentration. It goes into the Ka expression, together with the other two equilibrium concentrations."

  Tolerance: the page's 2 percent, which accepts 9.8 × 10⁻¹¹ to 1.02 × 10⁻¹⁰. With $x$ as 2.0 × 10⁻⁶, two figures from a pH with two decimal places, the answer is 1.0 × 10⁻¹⁰ exactly; with $x$ unrounded (1.995 × 10⁻⁶) it is 9.95 × 10⁻¹¹; both are accepted, so no honest rounding is refused. Each slip also catches its three-figure form (4.99 × 10⁻⁵, 3.98 × 10⁻¹² and 2.00 × 10⁻⁶ are each within 1 percent of the key). The full equation gives a pH of 5.70 for 0.040 M phenol with this $K_a$ (5.698), so the data agree with the table. Note for the writer: phenol as an antiseptic is real (Joseph Lister's "carbolic acid"); do not name Lister or tell the story. Phenol dissolves in water to well above 0.040 M.
- **Section "Weak bases: x is the hydroxide":**
  - A weak base takes a proton from water, and only a small fraction of its molecules do (topic 4.8). Write a weak base as B and its conjugate acid as HB⁺. Display, split after the arrow:

    $$\ce{B(aq) + H2O(l) <=> HB+(aq) + OH-(aq)}$$

  - Its constant is the **base ionization constant**, $K_b$: the equilibrium constant for a weak base taking a proton from water. Display: $K_b = \dfrac{[\ce{HB+}][\ce{OH-}]}{[\ce{B}]}$. It is on the equation sheet, and so is $\text{p}K_b = -\log K_b$.
  - Many weak bases are compounds of nitrogen, and take the proton onto the nitrogen atom (topic 8.6 says why). One sentence, no more.
  - Place the figure `8-3-weak-base-particles.svg` here.
  - The table is the same table. **The one difference decides the answer: what the base makes is OH⁻, so $x$ is $[\ce{OH-}]$.** Its negative logarithm is the pOH. The pH takes one more step, pH = 14.00 − pOH at 25 °C. A solution of a base must end up with a pH above 7 at 25 °C: if yours does not, you stopped at the pOH.
- **Worked example "Ethanolamine":** ethanolamine, HOC₂H₄NH₂, is a weak base that gas plants use to take carbon dioxide out of natural gas. Its $K_b$ is 3.2 × 10⁻⁵. Find the pH of 0.25 M ethanolamine at 25 °C.
  1. **Write the equilibrium.** B stands for ethanolamine and HB⁺ for its conjugate acid, HOC₂H₄NH₃⁺. Display, split after the arrow: $\ce{B(aq) + H2O(l) <=> HB+(aq) + OH-(aq)}$.
  2. **Set up the table.** Every value is in M.

     | | B | HB⁺ | OH⁻ |
     |---|---|---|---|
     | I | 0.25 | 0 | 0 |
     | C | −x | +x | +x |
     | E | 0.25 − x | x | x |

  3. **Put the equilibrium row into $K_b$.** Display: $K_b = \dfrac{x^2}{0.25 - x} = 3.2 \times 10^{-5}$.
  4. **Leave $x$ out beside 0.25.** Display, split: $x^2 = (3.2 \times 10^{-5})(0.25) = 8.0 \times 10^{-6}$, then $x = 2.8 \times 10^{-3}$.
  5. **Check the approximation.** Display: $\dfrac{2.8 \times 10^{-3}}{0.25} \times 100\% = 1.1\%$. Under 5 percent: justified. It is also the percent of the base that has ionized.
  6. **$x$ is $[\ce{OH-}]$, so take the pOH.** Display: $\text{pOH} = -\log(2.8 \times 10^{-3}) = 2.55$.
  7. **Then the pH.** Display: $\text{pH} = 14.00 - 2.55 = 11.45$.
  8. **Check.** A base, and the pH is above 7.

  Note for the writer: unrounded, x = 2.828 × 10⁻³, the check is 1.13 percent, the pOH is 2.5485 and the pH 11.4515; the full equation gives 11.449, the same to two decimal places. Removing CO₂ and other acidic gases from natural gas with ethanolamine is real ("amine treating"); say no more about it than the one clause.
- **Check 5**, `<Check numeric="11.55" tolerance={0.18}>`: "Trimethylamine, (CH₃)₃N, is a weak base with $K_b$ = 6.3 × 10⁻⁵. What is the pH of a 0.20 M solution of trimethylamine at 25 °C?" Why: the table has 0.20 − x, x and x, and $x$ is $[\ce{OH-}]$. Display, split: $x^2 = (6.3 \times 10^{-5})(0.20) = 1.26 \times 10^{-5}$, so $x = 3.55 \times 10^{-3}$, kept to three figures for the two steps that use it. The check: $\dfrac{3.55 \times 10^{-3}}{0.20} \times 100\% = 1.8\%$, under 5 percent. Then, on separate lines, $\text{pOH} = -\log(3.55 \times 10^{-3}) = 2.45$ and $\text{pH} = 14.00 - 2.45 = 11.55$. Slips:
  - `2.45` (the pOH given as the pH): "That is the pOH: for a base, x is the hydroxide concentration. One more step takes a pOH to a pH at 25 °C."
  - `13.30` (the base treated as strong: 14.00 + log 0.20): "That is the pH if every molecule took a proton, as for a strong base. Trimethylamine is weak: set up the table and use Kb."
  - `5.25` (Kb turned into a Ka, Kw ÷ Kb, and the base treated as that acid): "A base cannot have a pH below 7 at 25 °C. Did you turn Kb into a Ka first? Use Kb as given, with x as the hydroxide concentration."
  - `9.10` (the pOH taken from x², the square root not taken): "Did you take the pOH from x²? Kb times 0.20 gives x². Take the square root to get x, which is the hydroxide concentration."
  - `11.5` (one decimal place where two are due, from 11.54 or 11.546): "Did you round to one decimal place? The concentration has two significant figures, so the pH takes two digits after the decimal point."
  - `11.6` (one decimal place where two are due, from 11.55): "Did you round to one decimal place? The concentration has two significant figures, so the pH takes two digits after the decimal point."

  Tolerance: 0.18 percent of 11.55 is 0.021, so the page accepts 11.53 to 11.57. The shortcut gives 11.550 and the full equation 11.546, both 11.55. A student who rounds $x$ to 3.5 × 10⁻³ before taking the logarithm gets 11.54, which is accepted. The one-decimal slips 11.5 and 11.6 are 0.05 from the answer, outside the tolerance, and 0.10 from each other; the other four slips are 1.7 or more from every other slip. Note for the writer: lesson 4.2 already calls trimethylamine a weak base. Do not mention fish here: lesson 8.7 uses that scene.
- **Section "An acid and its conjugate base":**
  - The conjugate base of a weak acid is itself a weak base: A⁻ can take a proton back from water. So one conjugate pair has two equilibria, the acid's with $K_a$ and the base's with $K_b$. Display them one under the other, each split after the arrow if needed:

    $$\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}$$

    $$\ce{A-(aq) + H2O(l) <=> HA(aq) + OH-(aq)}$$

  - Add the two equations. HA is on both sides and cancels, and so does A⁻. What is left is water's own equilibrium, $\ce{2H2O(l) <=> H3O+(aq) + OH-(aq)}$. When equations are added, their constants multiply (topic 7.6). Display: $K_a \times K_b = K_w$. On the equation sheet, and at 25 °C the product is 1.0 × 10⁻¹⁴.
  - Place the figure `8-3-conjugate-pair-equations.svg` here.
  - Two uses, each one line of display math. The conjugate base of butanoic acid, the butanoate ion: $K_b = \dfrac{1.0 \times 10^{-14}}{1.5 \times 10^{-5}} = 6.7 \times 10^{-10}$. The conjugate acid of ethanolamine: $K_a = \dfrac{1.0 \times 10^{-14}}{3.2 \times 10^{-5}} = 3.1 \times 10^{-10}$.
  - This puts a number on topic 4.8's rule that the stronger acid has the weaker conjugate base: the two constants of a pair multiply to a fixed number, so the larger one is, the smaller the other must be. In logarithms, p$K_a$ + p$K_b$ = 14.00 at 25 °C.
  - **Only for a conjugate pair.** The equations cancel to water's only when the base is the acid's own conjugate. The $K_a$ of butanoic acid and the $K_b$ of ethanolamine are two unrelated numbers; their product, 4.8 × 10⁻¹⁰, means nothing.
  - One sentence pointing ahead: what the pH is when a conjugate base is dissolved by itself, as a salt, is topic 8.4's.
  - `<KeyIdea>`: for an acid and its own conjugate base, $K_a \times K_b = K_w$, which is 1.0 × 10⁻¹⁴ at 25 °C. The stronger the acid, the weaker its conjugate base.
- **Check 6**, `<Check answer={2}>`: "Which pair of constants multiplies to give $K_w$?" Options:
  1. Ka of HCHO₂ and Kb of C₂H₃O₃⁻
  2. Ka of C₆H₅OH and Kb of C₆H₅O⁻
  3. Ka of (CH₃)₃NH⁺ and Kb of HOC₂H₄NH₂
  4. Ka of HOC₂H₄NH₃⁺ and Kb of (CH₃)₃N

  Why: the two species must be an acid and its own conjugate base, which differ by exactly one proton (topic 4.8). Take one proton off phenol, C₆H₅OH, and what is left is C₆H₅O⁻: that is a pair. Take one proton off formic acid, HCHO₂, and what is left is CHO₂⁻, not the glycolate ion C₂H₃O₃⁻. Take one proton off (CH₃)₃NH⁺ and what is left is trimethylamine, (CH₃)₃N, not ethanolamine; and the conjugate acid of trimethylamine is (CH₃)₃NH⁺, not HOC₂H₄NH₃⁺. Options 3 and 4 each pair an acid with a base, and each uses the right kind of species, but the two belong to different pairs. Misses:
  - 1: "Take one proton off HCHO₂. Is what is left the ion in this option? The two species must be an acid and its own conjugate base."
  - 3: "Take one proton off (CH₃)₃NH⁺. Is what is left the base in this option? The two species must differ by exactly one proton."
  - 4: "Add one proton to (CH₃)₃N. Is the result the acid in this option? The two species must be an acid and its own conjugate base."
- **Trap:** **Treating a weak acid as strong** (its $[\ce{H3O+}]$ is not the number on the label; it comes from the table and $K_a$). **Reporting the pOH of a weak base as its pH** (for a base, $x$ is $[\ce{OH-}]$; take the pOH, then subtract from 14.00 at 25 °C). **Saying the shortcut is fine without showing it** (divide $x$ by the starting concentration and write the percentage). **Using an $x$ that failed its check** (an $x$ larger than the starting concentration is a sign, not an answer). **Thinking that dilution lowers a weak acid's pH because more of it ionizes** (the percent ionization rises, $[\ce{H3O+}]$ falls, and the pH rises). **Thinking that a larger percent ionization means a larger $K_a$** (dilution changes the percent ionization; only temperature changes $K_a$). **Multiplying a $K_a$ and a $K_b$ that do not belong to one conjugate pair.** **Forgetting the square root** ($K_a$ times the concentration is $x^2$, not $x$).
- **Key points:** a weak acid's ionization is an equilibrium, $\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}$, with $K_a = [\ce{H3O+}][\ce{A-}]/[\ce{HA}]$, and the stronger the acid the larger its $K_a$ and the smaller its p$K_a$; the pH of a weak acid comes from the table of topic 7.7, where $x$ is $[\ce{H3O+}]$, and leaving $x$ out beside the starting concentration is allowed only if $x$ turns out under 5 percent of it, with the percentage written down; percent ionization is $[\ce{H3O+}]$ at equilibrium over the starting concentration, times 100 percent, and dilution raises it while it lowers $[\ce{H3O+}]$ and raises the pH, with $K_a$ unchanged; a measured pH gives $x$, and $x$ in the table gives $K_a$; for a weak base, $\ce{B(aq) + H2O(l) <=> HB+(aq) + OH-(aq)}$ with $K_b$, $x$ is $[\ce{OH-}]$, so find the pOH first and then the pH; for an acid and its own conjugate base, $K_a \times K_b = K_w$.

**Figures**

- **`8-3-weak-base-particles.svg`** (viewBox 0 0 480 340, font-size 18). One box of particles, in the style of `3-8-concentration-boxes.svg`.
  - The box: a rectangle from (40, 30) to (440, 250), ink outline.
  - 22 particles on a grid of six columns (x = 73, 140, 207, 273, 340, 407) and four rows (y = 58, 113, 168, 223), each moved off its grid point by up to 8 units; two grid points are left empty, at (407, 58) and (207, 223). No two particles touch.
    - 18 molecules of B: circles of radius 15, light accent fill, ink outline, no mark inside.
    - 2 HB⁺ ions, at (140, 113) and (340, 168): circles of radius 15 with ink fill, each with a small circle of radius 6 (ink outline, background fill) touching its upper right, for the proton it took, and a white "+" inside the large circle.
    - 2 OH⁻ ions, at (273, 58) and (73, 223): squares 22 on a side with diagonal hatching in the secondary color and an ink outline, each with a "−" beside it.
  - A key under the box on one line, centered at y = 296: a plain circle and "B (18)", a dark circle with its small circle and "HB⁺ (2)", a hatched square and "OH⁻ (2)".
  - The three kinds differ in shape or fill as well as color: plain circle, dark circle with a bump, hatched square. Charge is balanced: 2 plus and 2 minus. The 20 units of base that were dissolved are all there: 18 as B and 2 as HB⁺.
  - Text in the figure: "+" twice, "−" twice, and the three key labels.
  - Alt: "A box of particles for a weak base, B, dissolved in water. It holds 18 whole molecules of B, drawn as plain circles, 2 HB plus ions, drawn as dark circles each with a small circle attached, and 2 hydroxide ions, drawn as hatched squares marked minus. Most of the base has not reacted."
  - Caption: "A weak base in water. Of 20 molecules of B, 2 have taken a proton from water, making 2 HB⁺ and 2 OH⁻. Water molecules are left out, and the drawing shows a larger share ionized than most real solutions have."
- **`8-3-conjugate-pair-equations.svg`** (viewBox 0 0 480 300, font-size 18). Three equations stacked, set as text with their terms in aligned columns, and the constant of each at the right.
  - Line 1, baseline y = 60, starting at x = 30: "HA(aq) + H₂O(l) ⇌ H₃O⁺(aq) + A⁻(aq)"; at the right, starting at x = 425, "Kₐ" (K in italics with a lowered a, as a `tspan`).
  - Line 2, baseline y = 120, starting at x = 30: "A⁻(aq) + H₂O(l) ⇌ HA(aq) + OH⁻(aq)"; at the right, "K_b" set the same way.
  - A "+" at x = 12, y = 120, and a rule in ink under line 2, from x = 12 to x = 468 at y = 146, as in a sum on paper.
  - Line 3, baseline y = 190, starting at x = 30: "2 H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq)"; at the right, "K_w".
  - Strokes through what cancels, each a short diagonal line in the accent color across the term: a solid stroke through "HA(aq)" in line 1 and through "HA(aq)" in line 2; a dashed stroke through "A⁻(aq)" in line 1 and through "A⁻(aq)" in line 2. The solid pair and the dashed pair show which term cancels which.
  - Under line 3, centered at (240, 258), in the accent color: "Kₐ × K_b = K_w".
  - Text in the figure: three equations, three constants at the right, the plus sign and the last line. Four strokes.
  - Alt: "Two equations written one under the other and added. The first is HA plus water giving hydronium plus A minus, with the constant K a. The second is A minus plus water giving HA plus hydroxide, with the constant K b. HA is struck through in both equations with a solid stroke and A minus is struck through in both with a dashed stroke. Under a rule, the sum is two water molecules giving hydronium plus hydroxide, with the constant K w. The last line reads K a times K b equals K w."
  - Caption: "Add the equation of an acid to the equation of its own conjugate base, and the acid and the base cancel. What is left is water's equilibrium, so the two constants multiply to Kw."

**Diagram data: the shared solver** (for the builder of `src/lib/acid-base.ts`; the design's section 6.1 fixes what it is for)

- **What it solves.** One solution holding any of: a monoprotic weak acid in both its forms, with total concentration $C$ (acid form plus base form) and constant $K_a$; spectator cations with total charge concentration $c_+$ (the cation of a strong base, and the cation that came with a salt of the conjugate base); spectator anions with total charge concentration $c_-$ (the anion of a strong acid, and the anion that came with a salt of a conjugate acid HB⁺). All in mol/L. The charges must balance:

  $$[\ce{H3O+}] + c_+ = [\ce{OH-}] + c_- + [\ce{A-}]$$

  with $[\ce{OH-}] = K_w/[\ce{H3O+}]$ and $[\ce{A-}] = C\,K_a/(K_a + [\ce{H3O+}])$. Writing $h$ for $[\ce{H3O+}]$, the module finds the one positive root of

  $$f(h) = h + c_+ - c_- - \frac{K_w}{h} - \frac{C\,K_a}{K_a + h}$$

  $f$ rises steadily with $h$ (each term that depends on $h$ rises), so there is exactly one root.
- **How.** Bisection on the pH, not on $h$: start with the interval pH −2 to pH 16; at each step take the midpoint $m$, evaluate $f(10^{-m})$, and keep the half that holds the root ($f > 0$ means $h$ is too large, so the root lies at higher pH). **Exactly 60 halvings**, a fixed number, so the result is the same on every machine. Return $10^{-m}$ for the last midpoint. The interval is then 18 ÷ 2⁶⁰ wide, far below the precision of a double; **the stated precision is 1 × 10⁻⁹ in pH**, which is what the tests hold it to.
- **Inputs and errors.** $C \geq 0$, $c_+ \geq 0$, $c_- \geq 0$, $K_a > 0$ (ignored when $C = 0$), $K_w > 0$ with the default 1.0 × 10⁻¹⁴ (25 °C). A negative concentration, a $K_a$ or $K_w$ that is not positive, or a value that is not finite throws a `RangeError` that names the value. Concentrations of 10 M or more are refused (the interval would no longer be sure to hold the root with room to spare).
- **What else it returns,** from the root, with no further solving: $[\ce{OH-}] = K_w/h$; $[\ce{A-}] = C K_a/(K_a + h)$; $[\ce{HA}] = C h/(K_a + h)$.
- **The shortcut is a separate exported function**, for the weak-acid explorer's "the shortcut gives" line: $x = \sqrt{K_a C}$, nothing else.
- **A weak base and its conjugate acid** use the same function. For the pair HB⁺ and B, give $C$ = the total of both forms, $K_a$ = that of HB⁺ ($K_w/K_b$), and add the whole of $C$ to $c_+$; the anion that came with any salt of HB⁺ goes into $c_-$, as every spectator anion does. (The charge balance $h + [\ce{HB+}] + c_+ = K_w/h + c_-$ becomes the same $f$ with $c_+ + C$ in place of $c_+$, because $[\ce{HB+}] = C - C K_a/(K_a + h)$.) What the function returns as $[\ce{A-}]$ is then $[\ce{B}]$, and what it returns as $[\ce{HA}]$ is $[\ce{HB+}]$. So a weak base alone at concentration $C$ is $C$, $K_a = K_w/K_b$, $c_+ = C$, $c_- = 0$: the same inputs as a salt of a weak acid alone. A buffer of B at $c_b$ with the chloride of HB⁺ at $c_a$ is $C = c_a + c_b$, $c_+ = C$, $c_- = c_a$; the last worked row holds a test to it, and with $c_+ = c_b$ in its place that row comes out acidic, near pH 5.10.
- **Rounding for display is not the solver's job.** Each explorer's module rounds, half up, from the unrounded value: a pH to two decimal places, a concentration to two significant figures.
- **Worked values** for unit tests. $K_w$ = 1.0 × 10⁻¹⁴ unless the row says otherwise. Each pH is the root of the full equation to six decimal places, found by this brief's script with its own bisection. Where a closed form exists, the last column gives it; it agrees with the root to better than 1 × 10⁻⁸ in pH unless the row says "by hand" (a closed form for a weak acid or a buffer leaves out water's own ions, which moves the pH by about 1 × 10⁻⁹ at most in these rows).

  | Case | $C$ (M) | $K_a$ | $c_+$ (M) | $c_-$ (M) | pH | Closed form |
  |---|---|---|---|---|---|---|
  | Pure water | 0 | none | 0 | 0 | 7.000000 | $h = \sqrt{K_w}$ |
  | Strong acid, 0.010 M | 0 | none | 0 | 0.010 | 2.000000 | $h = \tfrac{1}{2}(c + \sqrt{c^2 + 4K_w})$ |
  | Strong acid, 1.0 × 10⁻⁸ M | 0 | none | 0 | 1.0 × 10⁻⁸ | 6.978294 | the same form |
  | Strong base, 0.010 M | 0 | none | 0.010 | 0 | 12.000000 | $K_w/h = \tfrac{1}{2}(c + \sqrt{c^2 + 4K_w})$ |
  | 0.0037 M Sr(OH)₂ (lesson 8.2) | 0 | none | 0.0074 | 0 | 11.869232 | the same form |
  | Pure water at 10 °C, $K_w$ = 2.9 × 10⁻¹⁵ | 0 | none | 0 | 0 | 7.268801 | $h = \sqrt{K_w}$ |
  | Weak acid: 0.10 M formic acid | 0.10 | 1.8 × 10⁻⁴ | 0 | 0 | 2.381576 | $h = \tfrac{1}{2}(-K_a + \sqrt{K_a^2 + 4K_aC})$, 4.153595 × 10⁻³ M |
  | Weak acid: 0.30 M glycolic acid | 0.30 | 1.5 × 10⁻⁴ | 0 | 0 | 2.178249 | the same form, 6.633623 × 10⁻³ M |
  | Weak acid: 0.10 M iodic acid | 0.10 | 0.17 | 0 | 0 | 1.150926 | the same form, 7.064382 × 10⁻² M |
  | Buffer: 0.10 M formic acid with 0.10 M sodium formate | 0.20 | 1.8 × 10⁻⁴ | 0.10 | 0 | 3.746285 | $h^2 + (c_b + K_a)h - K_a c_a = 0$ with $c_a = c_b = 0.10$ |
  | Half-equivalence: 1.50 mmol each of lactic acid and lactate in 27.5 mL | 3.00/27.5 | 10⁻³·⁸⁶ | 1.50/27.5 | 0 | 3.862187 | the same quadratic |
  | Equivalence point: 3.00 mmol of sodium lactate in 35.0 mL | 3.00/35.0 | 10⁻³·⁸⁶ | 3.00/35.0 | 0 | 8.396870 | none exact; by hand, 8.3965 |
  | Excess base: 3.00 mmol of lactate and 0.60 mmol of OH⁻ in 38.0 mL | 3.00/38.0 | 10⁻³·⁸⁶ | 3.60/38.0 | 0 | 12.198368 | none exact; by hand, from the hydroxide alone, 12.1984 |
  | Weak base: 0.25 M ethanolamine, $K_b$ = 3.2 × 10⁻⁵ | 0.25 | 3.125 × 10⁻¹⁰ | 0.25 | 0 | 11.449088 | $[\ce{OH-}] = \tfrac{1}{2}(-K_b + \sqrt{K_b^2 + 4K_bC})$ |
  | Base buffer: 0.10 M ethanolamine with 0.10 M of its chloride salt | 0.20 | 3.125 × 10⁻¹⁰ | 0.20 | 0.10 | 9.504872 | $[\ce{OH-}]^2 + (c_a + K_b)[\ce{OH-}] - K_b c_b = 0$ with $c_a = c_b = 0.10$ |

  $10^{-3.86}$ is 1.380384 × 10⁻⁴ (lactic acid, whose p$K_a$ is lesson 8.5's). The three lactic acid rows are the titration-curve explorer's flask at 7.5, 15.0 and 18.0 mL; lesson 8.5's own "Diagram data" is the authority for that explorer, and these rows only test the solver.

**Diagram data: the weak-acid explorer** (for the builder of `src/lib/weak-acid.ts` and `<WeakAcid />`; the design's section 6.1 fixes what the diagram shows)

- **Acids** (the choice control, in this order), each with the $K_a$ the module uses, at 25 °C:

  | Acid | Formula | $K_a$ | Source |
  |---|---|---|---|
  | Chloroacetic acid | HC₂H₂ClO₂ | 1.4 × 10⁻³ | the design; standard tables give p$K_a$ 2.85 to 2.87 |
  | Formic acid | HCHO₂ | 1.8 × 10⁻⁴ | the design; standard tables give 1.77 to 1.8 × 10⁻⁴ |
  | Butanoic acid | HC₄H₇O₂ | 1.5 × 10⁻⁵ | the design; standard tables give 1.5 × 10⁻⁵ (p$K_a$ 4.82) |

  The three values stand as about 93 : 12 : 1. All three acids mix with water at every concentration the slider offers.
- **Starting concentration** (the slider): ten positions, from the most concentrated on the left to the most dilute on the right: 1.0, 0.50, 0.20, 0.10, 0.050, 0.020, 0.010, 0.0050, 0.0020 and 0.0010 M. It starts at 0.10 M (the fourth position), with formic acid chosen. That is 3 × 10 = 30 states. Keep each concentration as a whole number of ten-thousandths of a mole per liter (10,000 down to 10) and divide only when calling the solver. The slider's `aria-valuetext` is the concentration in words, for example "0.10 molar".
- **The model.** For the chosen $K_a$ and concentration $C$, the solver is called with $C$, $K_a$, $c_+ = 0$, $c_- = 0$ and gives $h$. Then:
  - $[\ce{H3O+}] = h$, shown to two significant figures in the form 4.2 × 10⁻³ M;
  - pH = −log $h$, to two decimal places;
  - percent ionized = 100 × $[\ce{A-}]/C$ = 100 × $K_a/(K_a + h)$;
  - particles drawn as ions = the percent ionized rounded half up to a whole number (of 100);
  - the shortcut: $x = \sqrt{K_a C}$; the shortcut's pH = −log $x$, to two decimal places; the shortcut's check = 100 × $x/C$ percent; it **passes** when the unrounded check is under 5, and **fails** otherwise;
  - the strong acid's pH: the solver called with $C = 0$ and $c_- = C$, to two decimal places. At 1.0 M this is 0.00; guard against printing "-0.00".
  - **Every shown number is rounded half up from its unrounded value**, never from another shown number. A percentage is shown to two significant figures when it is under 10 (0.39, 4.2) and as a whole number when it is 10 or more (34, 118).
- **Limits, checked over all 30 states:**
  - The percent ionized runs from 0.39 (butanoic acid, 1.0 M) to 67 (chloroacetic acid, 0.0010 M). It never reaches 100, and in exactly one state it rounds to no particle at all (butanoic acid at 1.0 M: 0 of 100 drawn as ions).
  - The pH runs from 1.44 (chloroacetic acid, 1.0 M) to 3.94 (butanoic acid, 0.0010 M).
  - For each acid, each step toward a more dilute solution raises the percent ionized, lowers $[\ce{H3O+}]$ and raises the pH.
  - At each concentration, the acid with the larger $K_a$ has the larger percent ionized and the lower pH.
  - The weak acid's pH is above the strong acid's in every state; the smallest gap, as shown, is 0.17 (chloroacetic acid at 0.0010 M: 3.17 against 3.00).
  - The shortcut's pH is never above the full pH, as shown. In the 12 states where the shortcut passes, the two shown values differ by 0.01 at most; in the 18 where it fails they differ by 0.01 to 0.24.
  - The shortcut passes in 12 states: chloroacetic acid at 1.0 M only; formic acid at 1.0, 0.50, 0.20 and 0.10 M; butanoic acid from 1.0 M down to 0.010 M. The highest concentration at which it fails is 0.50 M, 0.050 M and 0.0050 M for the three acids in order. No state's unrounded check lies between 4.3 and 5.2, so "passes" and "fails" never sit beside a shown "5.0 percent".
  - No shown number lies within 1 × 10⁻⁹ of a rounding boundary. The nearest is the pH of chloroacetic acid at 1.0 M, 1.43506, which is 0.00006 above the boundary and is shown as 1.44; pin it with a test. The starting state's percent ionized, 4.1536, is 0.004 above a boundary and is shown as 4.2.
  - In two states the shown numbers do not divide, and both are right, because each is rounded from its own unrounded value: chloroacetic acid at 0.0050 M shows 2.0 × 10⁻³ M and 41 percent (2.0368 × 10⁻³ M; 40.74 percent), and at 0.0020 M it shows 1.1 × 10⁻³ M and 56 percent (1.1138 × 10⁻³ M; 55.69 percent). Pin both with a test, so that no one "fixes" them.
- **The box of particles.** 100 particles in ten rows of ten. A whole acid molecule and an ion pair differ in shape, not only in color (a whole molecule as one filled circle; an ionized one as a small circle marked "+" beside a hollow circle marked "−", or the builder's equivalent). The ionized ones are spread through the box in a fixed order, so that moving the slider adds or removes ions without rearranging the rest. Under the box, a line of text: "4 of 100 ionized" (the count in the state); when the count is zero, "fewer than 1 of 100 ionized".
- **The graph.** Percent ionized (vertical, 0 to 70, with marks at 0, 10, 20, 30, 40, 50, 60 and 70) against starting concentration (horizontal, a logarithmic axis from 0.001 M at the right to 1 M at the left, so that sliding right dilutes, with marks at 1, 0.1, 0.01 and 0.001). One curve for each acid, through the module's own values at every 0.05 in log $C$ and at the ten slider concentrations; the chosen acid's curve heavy, the other two faint and dashed, each named at its end. A marker on the chosen curve at the setting. A dashed horizontal line at 5 percent, labeled "5 percent". (The line is a guide for the eye: it is the percent ionized that is plotted, and the shortcut's check is a larger number, slightly so where it passes; the readout says which passes.)
- **Readout sentences.** Three kinds of state. The starting state, where the shortcut passes:

  "Formic acid at 0.10 M: [H₃O⁺] = 4.2 × 10⁻³ M and the pH is 2.38. Of the acid, 4.2 percent is ionized. The shortcut gives a pH of 2.37, and its check comes to 4.2 percent, under 5, so it passes. A strong acid at 0.10 M would have a pH of 1.00."

  A state where the shortcut fails (formic acid at 0.0010 M):

  "Formic acid at 0.0010 M: [H₃O⁺] = 3.4 × 10⁻⁴ M and the pH is 3.46. Of the acid, 34 percent is ionized. The shortcut gives a pH of 3.37, but its check comes to 42 percent, over 5, so it fails here. A strong acid at 0.0010 M would have a pH of 3.00."

  The state with no particle drawn as ions (butanoic acid at 1.0 M), which never says "0 percent":

  "Butanoic acid at 1.0 M: [H₃O⁺] = 3.9 × 10⁻³ M and the pH is 2.41. Of the acid, 0.39 percent is ionized, fewer than 1 molecule in 100. The shortcut gives a pH of 2.41, and its check comes to 0.39 percent, under 5, so it passes. A strong acid at 1.0 M would have a pH of 0.00."

  In one state (chloroacetic acid at 0.0010 M) the shortcut's check is over 100 percent, and there the middle of the sentence changes to "but its check comes to 118 percent, more acid than there is, so it fails here". (In that state the shortcut's pH, 2.93, is below the strong acid's 3.00.)
- **Worked states** for unit tests: all 30, with the four the lesson's text walks through marked. Columns: the acid; $C$ in M; $[\ce{H3O+}]$ in M; the pH; the percent ionized, as shown; the particles drawn as ions; the shortcut's pH; the shortcut's check in percent, as shown; whether it passes; the strong acid's pH.

  | Acid | $C$ | $[\ce{H3O+}]$ | pH | Percent | Ions | Shortcut pH | Check | Shortcut | Strong pH |
  |---|---|---|---|---|---|---|---|---|---|
  | Formic | 0.10 | 4.2 × 10⁻³ | 2.38 | 4.2 | 4 | 2.37 | 4.2 | passes | 1.00 |
  | Formic | 0.0010 | 3.4 × 10⁻⁴ | 3.46 | 34 | 34 | 3.37 | 42 | fails | 3.00 |
  | Butanoic | 0.10 | 1.2 × 10⁻³ | 2.91 | 1.2 | 1 | 2.91 | 1.2 | passes | 1.00 |
  | Chloroacetic | 0.10 | 1.1 × 10⁻² | 1.95 | 11 | 11 | 1.93 | 12 | fails | 1.00 |
  | Chloroacetic | 1.0 | 3.7 × 10⁻² | 1.44 | 3.7 | 4 | 1.43 | 3.7 | passes | 0.00 |
  | Chloroacetic | 0.50 | 2.6 × 10⁻² | 1.59 | 5.2 | 5 | 1.58 | 5.3 | fails | 0.30 |
  | Chloroacetic | 0.20 | 1.6 × 10⁻² | 1.79 | 8.0 | 8 | 1.78 | 8.4 | fails | 0.70 |
  | Chloroacetic | 0.050 | 7.7 × 10⁻³ | 2.11 | 15 | 15 | 2.08 | 17 | fails | 1.30 |
  | Chloroacetic | 0.020 | 4.6 × 10⁻³ | 2.33 | 23 | 23 | 2.28 | 26 | fails | 1.70 |
  | Chloroacetic | 0.010 | 3.1 × 10⁻³ | 2.51 | 31 | 31 | 2.43 | 37 | fails | 2.00 |
  | Chloroacetic | 0.0050 | 2.0 × 10⁻³ | 2.69 | 41 | 41 | 2.58 | 53 | fails | 2.30 |
  | Chloroacetic | 0.0020 | 1.1 × 10⁻³ | 2.95 | 56 | 56 | 2.78 | 84 | fails | 2.70 |
  | Chloroacetic | 0.0010 | 6.7 × 10⁻⁴ | 3.17 | 67 | 67 | 2.93 | 118 | fails | 3.00 |
  | Formic | 1.0 | 1.3 × 10⁻² | 1.88 | 1.3 | 1 | 1.87 | 1.3 | passes | 0.00 |
  | Formic | 0.50 | 9.4 × 10⁻³ | 2.03 | 1.9 | 2 | 2.02 | 1.9 | passes | 0.30 |
  | Formic | 0.20 | 5.9 × 10⁻³ | 2.23 | 3.0 | 3 | 2.22 | 3.0 | passes | 0.70 |
  | Formic | 0.050 | 2.9 × 10⁻³ | 2.54 | 5.8 | 6 | 2.52 | 6.0 | fails | 1.30 |
  | Formic | 0.020 | 1.8 × 10⁻³ | 2.74 | 9.0 | 9 | 2.72 | 9.5 | fails | 1.70 |
  | Formic | 0.010 | 1.3 × 10⁻³ | 2.90 | 13 | 13 | 2.87 | 13 | fails | 2.00 |
  | Formic | 0.0050 | 8.6 × 10⁻⁴ | 3.06 | 17 | 17 | 3.02 | 19 | fails | 2.30 |
  | Formic | 0.0020 | 5.2 × 10⁻⁴ | 3.29 | 26 | 26 | 3.22 | 30 | fails | 2.70 |
  | Butanoic | 1.0 | 3.9 × 10⁻³ | 2.41 | 0.39 | 0 | 2.41 | 0.39 | passes | 0.00 |
  | Butanoic | 0.50 | 2.7 × 10⁻³ | 2.56 | 0.55 | 1 | 2.56 | 0.55 | passes | 0.30 |
  | Butanoic | 0.20 | 1.7 × 10⁻³ | 2.76 | 0.86 | 1 | 2.76 | 0.87 | passes | 0.70 |
  | Butanoic | 0.050 | 8.6 × 10⁻⁴ | 3.07 | 1.7 | 2 | 3.06 | 1.7 | passes | 1.30 |
  | Butanoic | 0.020 | 5.4 × 10⁻⁴ | 3.27 | 2.7 | 3 | 3.26 | 2.7 | passes | 1.70 |
  | Butanoic | 0.010 | 3.8 × 10⁻⁴ | 3.42 | 3.8 | 4 | 3.41 | 3.9 | passes | 2.00 |
  | Butanoic | 0.0050 | 2.7 × 10⁻⁴ | 3.57 | 5.3 | 5 | 3.56 | 5.5 | fails | 2.30 |
  | Butanoic | 0.0020 | 1.7 × 10⁻⁴ | 3.78 | 8.3 | 8 | 3.76 | 8.7 | fails | 2.70 |
  | Butanoic | 0.0010 | 1.2 × 10⁻⁴ | 3.94 | 12 | 12 | 3.91 | 12 | fails | 3.00 |

  The first four rows are the states the lesson's text walks through. The fifth is the state nearest a rounding boundary.
- **The caption** of the block says what is fixed: three weak acids at 25 °C with the $K_a$ values above; that every number comes from the full equilibrium, so the pH can differ in the last place from a calculation by hand; and that the box draws 100 particles, with the count rounded to the nearest whole particle.

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; sure |
| Glycolic acid, HC₂H₃O₃, $K_a$ | 1.5 × 10⁻⁴ | the design; standard tables give p$K_a$ 3.83 (1.48 × 10⁻⁴); fairly sure. Lesson 8.9 prints p$K_a$ 3.83; −log(1.5 × 10⁻⁴) = 3.82, within 0.02 |
| Butanoic acid, HC₄H₇O₂, $K_a$ | 1.5 × 10⁻⁵ (p$K_a$ 4.82, calculated on the page) | the design; standard tables give 1.5 × 10⁻⁵; fairly sure |
| Formic acid, HCHO₂, $K_a$ | 1.8 × 10⁻⁴ | the design; sure. Lessons 8.9 and 8.10 print p$K_a$ 3.75; −log(1.8 × 10⁻⁴) = 3.74, within 0.02 |
| Chloroacetic acid, HC₂H₂ClO₂, $K_a$ | 1.4 × 10⁻³ | the design; sure. Lesson 8.6 prints p$K_a$ 2.85, which is −log(1.4 × 10⁻³) |
| Iodic acid, HIO₃, $K_a$ | 0.17 | the design; tables give 0.16 to 0.17 (p$K_a$ 0.77 to 0.80); fairly sure |
| Phenol, C₆H₅OH, $K_a$ | 1.0 × 10⁻¹⁰ | the design; tables give 1.0 to 1.3 × 10⁻¹⁰ (p$K_a$ 9.89 to 10.00); fairly sure **(verify)**. Lesson 8.5's table of p$K_a$ values gives phenol as 9.99; −log(1.0 × 10⁻¹⁰) = 10.00, within 0.02. This lesson never prints phenol's p$K_a$ |
| Ethanolamine, HOC₂H₄NH₂, $K_b$ | 3.2 × 10⁻⁵ | the design; p$K_a$ of the conjugate acid 9.50; sure |
| Conjugate acid of ethanolamine, $K_a$ | 3.1 × 10⁻¹⁰ | calculated on the page: 1.0 × 10⁻¹⁴ ÷ 3.2 × 10⁻⁵ |
| Trimethylamine, (CH₃)₃N, $K_b$ | 6.3 × 10⁻⁵ | the design; p$K_a$ of (CH₃)₃NH⁺ 9.80 (lesson 8.7); fairly sure **(verify)**: tables give $K_b$ from 6.3 to 6.5 × 10⁻⁵ |
| Butanoate ion, $K_b$ | 6.7 × 10⁻¹⁰ | calculated on the page: 1.0 × 10⁻¹⁴ ÷ 1.5 × 10⁻⁵ |
| Butanoic acid is the smell of rancid butter | real | sure |
| Glycolic acid in skin-care peels | real | sure |
| Ethanolamine removes CO₂ from natural gas | real | sure |
| Phenol once used as a hospital antiseptic | real | sure |
| Phenol's solubility in water | about 8 g per 100 mL (about 0.9 M) | fairly sure; the lesson needs only 0.040 M |

No atomic mass is used in this lesson.

**Check script:** `scratchpad/unit8/checks/8-3.py`. It recomputes every number above, each slip, both figures' counts, every worked value of the solver and all 30 states of the explorer by its own bisection, the explorer's limits and the nearest rounding boundary, and checks each message and option against this file.

**Notes for the writer**

- A weak acid or a weak base with water takes the double arrow, with state symbols on every term and water written in. Water is never in a $K_a$ or $K_b$ expression.
- Say "ionization", "percent ionization" and "ionized". Do not write "dissociation" or "dissociated" for a weak acid or base.
- The tables inside the two worked examples use HA and A⁻, and B and HB⁺, because the full formulas are too wide for a phone. The sentence before each table says what the letters stand for.
- **The 5 percent line is "the check this site uses (topic 7.7)".** Never write "the 5 percent rule", "the exam requires" or "AP allows". The percentage is written down every time the shortcut is used: in both worked examples and in the Why of Checks 1 and 5.
- Check 2 sits before the explorer so that the student predicts first, and the section's key idea sits after the explorer. Do not move either: the text before Check 2 says only that more of the acid ionizes, and must not say what happens to the pH.
- The worked example prints the shortcut's pH for glycolic acid, 2.17, and then says what the full equation gives, 2.18. The explorer's numbers are all from the full equation. Where the text quotes the explorer, quote the explorer's number.
- The explorer's step 4 must not print a cutoff such as "400 times $K_a$". Topic 7.7 says there is no cutoff worth memorizing, and this lesson says the same.
- Formic acid appears in this lesson only in the $K_a$ table and the explorer. Lesson 8.2's Check 1 quotes its 1.9 percent at 0.50 M, which is the explorer's value.
- Phenol's Ka is not printed anywhere before Check 4, whose answer it is.
- Phenol's formula is written C₆H₅OH, with the acidic hydrogen last, as chemists write it; its conjugate base is C₆H₅O⁻. Do not rewrite it as HC₆H₅O.
- Do not calculate the pH of a solution of sodium butanoate or of any other salt: topic 8.4 does that. The $K_b$ of the butanoate ion is found and left.
- The "Beyond the exam" sentence is the only mention of the quadratic formula. Do not show the formula or solve with it. The numbers "from the full equation" in Check 2's and Check 3's explanations are given as results.
- Iodic acid must keep its place from lesson 4.8's table: the strongest of the weak acids there, below H₃O⁺.

**Reactions, substances and scenarios used:** equations: a weak acid HA with water; a weak base B with water; a conjugate base A⁻ with water; the autoionization of water as their sum. Scenarios: 0.30 M glycolic acid, the acid of skin-care peels, whose pH meter reading near 2.2 is set against the 0.52 it would show if every molecule had ionized (opening); a table of five $K_a$ values (iodic, chloroacetic, formic, glycolic and butanoic acid); butanoic acid's p$K_a$, 4.82; 0.30 M glycolic acid, $x$ = 6.7 × 10⁻³ M, 2.2 percent, pH 2.17 (worked example 1); 0.40 M butanoic acid, the smell of rancid butter, pH 2.61 (Check 1); 0.30 M glycolic acid diluted to 0.030 M (Check 2); the explorer's chloroacetic, formic and butanoic acid at ten concentrations from 1.0 M to 0.0010 M; 0.10 M iodic acid, shortcut $x$ = 0.13 M, in truth 71 percent ionized and pH 1.15 (Check 3); 0.040 M phenol, once a hospital antiseptic, at pH 5.70, $K_a$ = 1.0 × 10⁻¹⁰ (Check 4); 0.25 M ethanolamine, which takes carbon dioxide out of natural gas, pOH 2.55, pH 11.45 (worked example 2); 0.20 M trimethylamine, pH 11.55 (Check 5); $K_b$ of the butanoate ion, 6.7 × 10⁻¹⁰, and $K_a$ of the conjugate acid of ethanolamine, 3.1 × 10⁻¹⁰; four pairs of constants (Check 6). Figures: 18 B, 2 HB⁺ and 2 OH⁻ in a box; the two equations of a conjugate pair added.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.3 Weak Acid and Base Equilibria`).

**Check script:** `scratchpad/unit8/checks/8-3.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.3 Weak Acid and Base Equilibria`).

---

## Group C: reactions, titrations, structure and indicators (pull request C)

Branch: `topic/unit-8-reactions-and-titrations`, from `topic/unit-8-ph-and-weak-acids`.

> **As carried out.** The titration-curve explorer on Opus, four writers on Fable, then the same checks. No fact-check found a wrong number. A figure of lesson 8.6 was redrawn, a message of lesson 8.7 that gave its answer was replaced, and the originality check had 18 passages reworded, among them the key idea of lesson 8.4, which opened with a section title of the teacher's notes. The code review found no bug and added an independent charge-balance test of the pH at all 61 settings of both acids. Merged as pull request 89.

Lesson 8.5's brief holds the "Diagram data" of the titration-curve explorer, which lesson 8.7 places a second time. The builder imports the solver and does not change it.

> **How these briefs were checked.** The first fact-checks reproduced all 122 states of the explorer and found no wrong answer key. They found two worked steps of lesson 8.4 whose printed rounding did not follow, one false sentence about how far the explorer can differ from a pH found by hand, a fuller list of states that sit near a rounding tie, a rule in lesson 8.6 that failed on the lesson's own acids (bond polarity alone does not explain why H₂S, H₂Se and H₂Te are acids) and three messages that gave the answer. The originality check had lesson 8.4's scenes changed (lesson 4.2 already had benzoic acid with sodium hydroxide and pyridine with hydrobromic acid), lesson 8.6 moved from lactic acid to gluconic acid, and its first Check moved to hypophosphorous acid. Lesson 8.4 was then rebuilt a second time: its first replacement acid, phenylacetic acid, is a controlled precursor chemical in the United States, so the lesson uses hexanoic acid. The curve with two rises in lesson 8.5 is for a made-up acid, H₂A, since phosphorous acid's first pKa was the unit's least certain value. Lesson 8.4's brief had three checks in all; the last found one rule that was false in general ("when neither is strong, nothing drives the reaction to completion") and it was reworded.

### Task 4: Lesson 8.4, Acid–Base Reactions and Buffers

**Files:**
- Create: `src/content/lessons/unit-8/8-4-acid-base-reactions-and-buffers.mdx`
- Create: `public/figures/8-4-what-is-left.svg`, `public/figures/8-4-partial-neutralization-particles.svg`
- No interactive diagram.

**Brief**

- **Front matter:** `topic: "8.4"`, `minutes: 21`, summary: "How to find what a flask holds after an acid meets a base, by reacting them in moles first, and how what is left over sets the pH of the mixture." (No colon in the summary.)
- **Framework (8.4, four statements):** (1) a strong acid and a strong base react completely, and the pH of the mixture comes from whichever is left over; (2) a weak acid and a strong base react completely, HA + OH⁻ → A⁻ + H₂O, with three outcomes: acid left over gives a buffer, hydroxide left over gives the pH from the leftover hydroxide and the total volume, equal moles give a slightly basic solution of the conjugate base alone; (3) a weak base with a strong acid is the mirror image, and equal moles give a slightly acidic solution; (4) a weak acid and a weak base react to an equilibrium. The objective is to explain how the concentrations of the species present in large amounts in such a mixture are related. **What this lesson does not do:** the whole titration curve is topic 8.5's; why a buffer holds its pH is topic 8.8's (here a buffer is only named and its pH found); the Henderson–Hasselbalch equation is topic 8.9's (this lesson finds a buffer's pH from the $K_a$ expression, as $[\ce{H3O+}] = K_a \times$ moles of acid ÷ moles of base, and never writes the equation in logarithms); the pH of a weak acid mixed with a weak base is not calculated anywhere in the unit. Brønsted–Lowry terms, conjugate pairs and "the stronger acid has the weaker conjugate base" are topic 4.8's; strong against weak and net ionic equations are topic 4.2's; millimoles are topic 4.6's; $K_w$, pH and pOH are topics 8.1 and 8.2's; the ICE table with $K_a$ or $K_b$, the small-x check and $K_a \times K_b = K_w$ are topic 8.3's. Use them and name the topic; do not teach them again. **Equation sheet:** the $K_a$ and $K_b$ expressions, $K_w = K_a \times K_b$, pH and pOH, and 14 = pH + pOH are on it. Nothing on it says "react first" or what is left over: that is this lesson.
- **Opening:** hexanoic acid is one of the acids behind the sharp smell of goat cheese, and its old name, caproic acid, comes from the Latin word for a goat. A chemist who dissolves a little of it in water and runs in sodium hydroxide solution finds that the smell fades, because the base turns the acid's molecules into ions, which stay in the water. The smell is slow to go: it is nearly gone only when nearly all of the acid is in its ion form. Where the base is stopped decides what is in the flask. Stop when two fifths of the base the acid needs is in and the mixture sits near pH 4.7. Stop exactly on time and the pH is about 8.7. Let it run a little long and the pH is above 11.5. The same two chemicals and one reaction give three very different solutions, and this lesson is about telling which one you have. Note for the writer: these are the three flasks of the worked examples below (4.71, 8.68 and 11.66, with 10.0, 25.0 and 29.0 mL of the base, where 25.0 mL is what the acid needs); give no numbers beyond "near 4.7", "about 8.7" and "above 11.5" in the opening. The smell and the origin of the name are real (sure of the name; fairly sure that hexanoic acid is among the acids that give goat cheese its smell **(verify)**). That the smell fades as the acid is neutralized follows from the chemistry: only the un-ionized molecule can leave the water, and the hexanoate ion cannot. Do not let the smell fade steadily. In the first flask, at pH 4.71, 60 percent of the acid is still molecules, so the smell is hardly weaker there; at pH 8.68 about one unit of the acid in six thousand is still a molecule. How plain the change is to the nose at this dilution is from reasoning, not from a source **(verify)**; if in doubt, cut the two sentences about the smell fading and keep the rest. Keep "a chemist who": the acid is corrosive, and the opening does not invite the student to handle it. Topic 3.10 names hexanoic acid once, as C₅H₁₁COOH in a Check about solubility, with no number; this lesson writes it HC₆H₁₁O₂, as the unit writes every acid with one acidic proton. Lesson 4.2's food chemist and sodium benzoate are not used here.
- **Section "React first, then see what is left":**
  - You already have two tools. Unit 4 treats a reaction that goes to completion with moles and a limiting reactant. Unit 7 treats a reaction that stops short with an ICE table. A flask in which an acid has met a base may need both, and the order matters.
  - Why the reaction with a strong acid or a strong base is treated as complete. The reaction of H₃O⁺ with OH⁻ is the reverse of water's reaction with itself (topic 8.1), so its constant is $1/K_w$, which is 1.0 × 10¹⁴ at 25 °C. Display:

    $$\ce{H3O+(aq) + OH-(aq) -> 2H2O(l)}$$

    One sentence: this is the $\ce{H+(aq) + OH-(aq) -> H2O(l)}$ of topic 4.2 with the water molecule that carries the proton written in, one reaction written two ways (topic 4.8).
  - A hydroxide ion also takes the proton straight off a weak acid's molecules (topic 4.8). For hexanoic acid, HC₆H₁₁O₂, the acid of the opening, display, split after the arrow:

    $$\ce{HC6H11O2(aq) + OH-(aq) -> C6H11O2-(aq) + H2O(l)}$$

    One sentence, the lesson's only look back at that scene: topic 4.2 wrote the same kind of equation for benzoic acid on its way to sodium benzoate. This equation is the acid's ionization ($K_a$ = 1.3 × 10⁻⁵) added to the equation above, so its constant is the product of the two (topic 7.6): $K_a / K_w$ = 1.3 × 10⁹. A constant that large means essentially nothing of the limiting reactant is left (topic 7.5). That is why these equations carry a single arrow, and why you can treat them the way Unit 4 treats any reaction: the reactant with fewer moles is used up.
  - **The table of moles.** Keep the books in millimoles (milliliters times molarity, topic 4.6) in a table with three rows: Before, Change, After. It looks like an ICE table and it is not one: it has no $x$ in it, and nothing in it is at equilibrium yet. It records a reaction that ran until something ran out. If an equilibrium is still to come, it comes second and gets its own table.
  - The routine, as a numbered list of three: (1) if a strong acid or a strong base is among the things mixed, let it react to completion, in moles; (2) read the After row and say what the flask now holds in large amounts; (3) only then choose how to find the pH.
  - `<KeyIdea>`: stoichiometry first, then equilibrium. A strong acid or a strong base reacts until one reactant is gone. What is left in the flask afterward decides how the pH is found.
  - Note for the writer: the teacher's notes build this unit on one habit, saying what is in the solution before choosing a method. Carry the habit in these words ("what the flask holds", "what is left"). Do not write "major species", "ICF table", "the F row" or "method selection".
- **Section "A strong acid with a strong base":**
  - Both are fully ionized before they meet (topic 8.2), so the only reaction is H₃O⁺ with OH⁻. The other ions, such as ClO₄⁻ and K⁺, are spectators (topic 4.2) and stay spectators: they neither give a proton to water nor take one from it.
  - Whichever of H₃O⁺ and OH⁻ is left over sets the pH, exactly as in topic 8.2, with one thing to watch: the leftover ions are now spread through both solutions, so the concentration is the leftover moles divided by the **total volume**.
  - If the moles are equal, neither is left over. The flask holds water and spectator ions, and the solution is neutral: pH 7.00 at 25 °C.
- **Worked example "Perchloric acid meets potassium hydroxide":** 25.0 mL of 0.120 M perchloric acid, HClO₄, a strong acid, is mixed with 15.0 mL of 0.130 M potassium hydroxide, KOH, a strong base. What is the pH of the mixture at 25 °C?
  1. **Count the moles.** H₃O⁺: (25.0)(0.120) = 3.00 mmol. OH⁻: (15.0)(0.130) = 1.95 mmol.
  2. **React to completion.** The equation is 1 to 1, so the OH⁻ runs out first. Every value in the table is in mmol:

     | | H₃O⁺ | OH⁻ |
     |---|---|---|
     | Before | 3.00 | 1.95 |
     | Change | −1.95 | −1.95 |
     | After | 1.05 | 0 |

  3. **Say what is left.** 1.05 mmol of H₃O⁺, with the spectators ClO₄⁻ and K⁺. A strong acid is left over.
  4. **Find its concentration in the total volume.** 25.0 + 15.0 = 40.0 mL. Display: $[\ce{H3O+}] = \dfrac{1.05}{40.0} = 0.02625\ \text{M}$.
  5. **Take the pH.** $\text{pH} = -\log(0.02625) = 1.58$.
  6. **Does it make sense?** The acid started at pH 0.92 (−log 0.120). Part of it was neutralized and the rest was diluted, so the pH should be higher than 0.92 and still well below 7. It is.

  Note for the writer: the "0" for OH⁻ in the After row stands for "essentially none"; do not explain it further. 0.02625 is shown unrounded on purpose (round once, at the pH; 0.026 M gives 1.59). The amounts were changed at the second revision: the first set gave 1.727, on a rounding tie.
- **Check 1**, `<Check numeric="12.37" tolerance={0.18}>` (no `unit`: a pH has none): "25.0 mL of 0.100 M hydrobromic acid, HBr, a strong acid, is mixed with 32.0 mL of 0.120 M rubidium hydroxide, RbOH, a strong base. What is the pH of the mixture at 25 °C? Give two decimal places." Why: H₃O⁺: (25.0)(0.100) = 2.50 mmol. OH⁻: (32.0)(0.120) = 3.84 mmol. The acid runs out and 3.84 − 2.50 = 1.34 mmol of OH⁻ is left, in 25.0 + 32.0 = 57.0 mL. $[\ce{OH-}]$ = 1.34 ÷ 57.0 = 0.0235 M, so pOH = 1.63 and pH = 14.00 − 1.63 = 12.37. Put the lines of arithmetic in display math, numbers only. The tolerance of 0.18 percent accepts 12.35 to 12.39, which takes in 12.38 (from a hydroxide concentration rounded to 0.024 M) and refuses 12.4. Slips:
  - `1.63` (the pOH given as the pH): "That is the pOH. The ion left over is OH⁻, so one more step takes the pOH to the pH at 25 °C."
  - `12.62` (the leftover divided by the base's 32.0 mL): "Did you divide by 32.0 mL? The leftover OH⁻ is spread through both solutions, so divide by the total volume."
  - `12.73` (the leftover divided by the acid's 25.0 mL): "Did you divide by 25.0 mL? The leftover OH⁻ is spread through both solutions, so divide by the total volume."
  - `12.83` (all 3.84 mmol of OH⁻ in 57.0 mL, with no reaction): "Did you count all 3.84 mmol of OH⁻? Part of it reacted with the acid. Only what is left over sets the pH."
  - `12.4` (one decimal place): "Did you round to one decimal place? The question asks for two decimal places."

  Note for the writer: rubidium hydroxide is a group 1 hydroxide and a strong base, and the question says so. Base in excess on purpose: the worked example had acid in excess. The amounts were changed at the second revision: the first set gave 12.436, within 0.001 of a rounding tie. The two solutions differ in both volume and concentration, so the student has to find the moles of each.
- **Section "A weak acid with a strong base: three outcomes":**
  - In water alone, a weak acid keeps most of its protons (topic 8.3). A hydroxide ion does not wait for them: it takes the proton off each acid molecule it meets. Writing HA for the acid and A⁻ for its conjugate base, display:

    $$\ce{HA(aq) + OH-(aq) -> A-(aq) + H2O(l)}$$

  - Place the figure `8-4-partial-neutralization-particles.svg` here, with one sentence before it: eight acid molecules meet three hydroxide ions.
  - What the flask holds afterward depends on one comparison only: the moles of OH⁻ added against the moles of HA that were there. Place the figure `8-4-what-is-left.svg` here. Then the three outcomes, as a list:
    - **Fewer moles of OH⁻ than of HA.** Some HA is left, and A⁻ has been formed. The flask holds large amounts of both members of a conjugate acid–base pair. A solution like that is called a **buffer**. (Topic 8.8 explains what a buffer is good for. Here it is one of three things a flask can turn out to hold.)
    - **Equal moles.** All of the HA has become A⁻ and no OH⁻ is left. The flask holds the conjugate base alone, and a conjugate base of a weak acid is a weak base (topic 4.8).
    - **More moles of OH⁻ than of HA.** All of the HA has become A⁻, and OH⁻ is left over. A strong base is left over, and it sets the pH.
  - **The pH of the buffer, from the $K_a$ expression.** Both HA and A⁻ are in the flask, so the acid's ionization equilibrium (topic 8.3) holds, with one difference from a solution of the acid alone: there is already plenty of A⁻. Display the expression and then the same line solved for hydronium:

    $$K_a = \frac{[\ce{H3O+}][\ce{A-}]}{[\ce{HA}]}$$

    $$[\ce{H3O+}] = K_a \times \frac{[\ce{HA}]}{[\ce{A-}]}$$

  - HA and A⁻ share one flask, so both concentrations are moles over the same volume, and the volume cancels: the ratio of the concentrations is the ratio of the moles. Display:

    $$[\ce{H3O+}] = K_a \times \frac{\text{moles of HA}}{\text{moles of A}^-}$$

  - Why the After row's amounts can go straight in: the A⁻ already present pushes the acid's ionization back toward HA (Le Châtelier's principle, topic 7.9; the common-ion effect of topic 7.12 is the same push). So the $x$ of the ICE table is even smaller than it would be for the acid alone. It is still checked, as always (topic 7.7). One sentence: topic 8.9 writes this same line in logarithms; nothing new will be in it.
- **Worked example "Hexanoic acid with less base than it needs":** 50.0 mL of 0.0450 M hexanoic acid, HC₆H₁₁O₂, is mixed with 10.0 mL of 0.0900 M NaOH. For hexanoic acid, $K_a$ = 1.3 × 10⁻⁵. What is the pH of the mixture at 25 °C? (One sentence before the steps: write HA for hexanoic acid and A⁻ for the hexanoate ion, C₆H₁₁O₂⁻.)
  1. **Count the moles.** HA: (50.0)(0.0450) = 2.25 mmol. OH⁻: (10.0)(0.0900) = 0.90 mmol.
  2. **React to completion.** Every value is in mmol:

     | | HA | OH⁻ | A⁻ |
     |---|---|---|---|
     | Before | 2.25 | 0.90 | 0 |
     | Change | −0.90 | −0.90 | +0.90 |
     | After | 1.35 | 0 | 0.90 |

  3. **Say what is left.** 1.35 mmol of HA and 0.90 mmol of A⁻: both members of the pair. The flask holds a buffer.
  4. **Now the equilibrium, in its own table.** The total volume is 60.0 mL, so $[\ce{HA}]$ = 1.35 ÷ 60.0 = 0.0225 M and $[\ce{A-}]$ = 0.90 ÷ 60.0 = 0.0150 M. Every value is in M:

     | | HA | H₃O⁺ | A⁻ |
     |---|---|---|---|
     | I | 0.0225 | 0 | 0.0150 |
     | C | −x | +x | +x |
     | E | 0.0225 − x | x | 0.0150 + x |

  5. **Leave $x$ out where it is added to or subtracted from a larger number, and solve.** Display, split over lines:

     $$[\ce{H3O+}] = x = (1.3 \times 10^{-5}) \times \frac{0.0225}{0.0150} = 1.95 \times 10^{-5}\ \text{M}$$

     The ratio 0.0225 ÷ 0.0150 is the ratio of the moles, 1.35 ÷ 0.90: the 60.0 mL cancels. Print the result as 1.95 × 10⁻⁵ M.
  6. **Check the approximation.** $x$ was left out beside two numbers; test it against the smaller. 1.95 × 10⁻⁵ ÷ 0.0150 × 100% = 0.13%, under 5 percent. (Against the larger it is 0.09%.)
  7. **Take the pH.** $\text{pH} = -\log(1.95 \times 10^{-5}) = 4.71$.
  8. **Does it make sense?** There is more HA than A⁻, so the ratio is above 1 and $[\ce{H3O+}]$ comes out a little above $K_a$.

  Note for the writer: step 4's table is a true ICE table and step 2's is not; say so in one clause at step 4 ("now something is at equilibrium"). The full equation gives 4.71 as well (4.7109 against the shortcut's 4.7100). Keep three figures in $x$: it is an intermediate value, and 2.0 × 10⁻⁵ would give 4.70. Hexanoic acid dissolves to about 1.0 g per 100 mL of water, about 0.09 M **(verify)**, so 0.0450 M (5.2 g/L) can be made; do not raise the concentration.
- **Worked example "The same flask with more base":** the same 50.0 mL of 0.0450 M hexanoic acid (2.25 mmol), now with (a) 25.0 mL and (b) 29.0 mL of the 0.0900 M NaOH. Find the pH of each mixture at 25 °C.
  1. **(a) Count and react.** 25.0 mL brings (25.0)(0.0900) = 2.25 mmol of OH⁻, exactly the moles of HA. After: no HA, no OH⁻, 2.25 mmol of A⁻. (Show the table of moles: Before 2.25, 2.25, 0; Change −2.25, −2.25, +2.25; After 0, 0, 2.25.)
  2. **Say what is left.** The hexanoate ion alone, with Na⁺: this is a solution of sodium hexanoate. The hexanoate ion is a weak base, so it takes protons from water. Display, split after the arrow:

     $$\ce{C6H11O2-(aq) + H2O(l) <=> HC6H11O2(aq) + OH-(aq)}$$

  3. **Get its $K_b$ and its concentration.** $K_b = K_w / K_a$ = (1.0 × 10⁻¹⁴) ÷ (1.3 × 10⁻⁵) = 7.69 × 10⁻¹⁰ (topic 8.3: the pair's two constants multiply to $K_w$). The total volume is 75.0 mL, so $[\ce{A-}]$ = 2.25 ÷ 75.0 = 0.0300 M.
  4. **ICE table, in M, with $x$ as $[\ce{OH-}]$:**

     | | A⁻ | HA | OH⁻ |
     |---|---|---|---|
     | I | 0.0300 | 0 | 0 |
     | C | −x | +x | +x |
     | E | 0.0300 − x | x | x |

     Display: $\dfrac{x^2}{0.0300} = 7.69 \times 10^{-10}$, so $x$ = 4.80 × 10⁻⁶ M.
  5. **Check.** 4.80 × 10⁻⁶ ÷ 0.0300 × 100% = 0.016%, far under 5 percent.
  6. **pOH first, then pH.** pOH = 5.32, so pH = 14.00 − 5.32 = 8.68. The acid has been exactly neutralized, and the solution is not neutral.
  7. **(b) Count and react.** 29.0 mL brings (29.0)(0.0900) = 2.61 mmol of OH⁻. After: no HA, 2.25 mmol of A⁻, and 2.61 − 2.25 = 0.36 mmol of OH⁻ left over. (Show the table of moles.)
  8. **Say what is left.** A strong base, left over. The total volume is 79.0 mL, so $[\ce{OH-}]$ = 0.36 ÷ 79.0 = 0.00456 M. pOH = 2.34 and pH = 11.66.
  9. **What about the hexanoate ion?** It is still a base, but in part (a), with the flask to itself, it made only 4.80 × 10⁻⁶ M of OH⁻. Beside 0.00456 M that is nothing, so it is left out.

  Close the example with a three-row table (two columns, "NaOH added" and "pH"): 10.0 mL, 4.71; 25.0 mL, 8.68; 29.0 mL, 11.66. One sentence after it: one acid, one base, one reaction, and three methods, chosen each time by the After row.

  Note for the writer: keep unrounded values through each part (pOH 5.318 from $x$ = 4.8038 × 10⁻⁶; pOH 2.341 from 0.004557 M). $K_b$, $x$ and the leftover $[\ce{OH-}]$ are printed with three figures because they are intermediate values. The full equation gives the same three pH values (4.71, 8.68 and 11.66; unrounded 4.7109, 8.6816 and 11.6587, against 4.7100, 8.6816 and 11.6587 by the steps above).
- **Check 2**, `<Check answer={3}>`: "24.0 mL of 0.150 M lactic acid, HC₃H₅O₃, a weak acid with one acidic proton, is mixed with 20.0 mL of 0.250 M potassium hydroxide, KOH. What sets the pH of the mixture?" Options:
  1. Lactic acid and lactate ion together, because the mixture is a buffer
  2. Lactate ion alone, acting as a weak base in water
  3. Hydroxide ion left over after all of the lactic acid has reacted
  4. Lactic acid left over after all of the hydroxide ion has reacted

  Why: lactic acid: (24.0)(0.150) = 3.60 mmol. OH⁻: (20.0)(0.250) = 5.00 mmol. The base has the smaller volume and the larger number of moles. All of the acid reacts, and 5.00 − 3.60 = 1.40 mmol of OH⁻ is left in 44.0 mL, with 3.60 mmol of lactate ion. A leftover strong base sets the pH: $[\ce{OH-}]$ = 1.40 ÷ 44.0 = 0.0318 M, pOH = 1.50, pH = 12.50. The lactate ion is a weak base too, but what it adds is far too small to show beside that. A buffer would need acid left over, and lactate alone would need equal moles. Misses:
  - 1: "A buffer needs lactic acid left over. Milliliters times molarity gives the millimoles of each reactant: compare them."
  - 2: "Lactate alone needs equal moles of acid and base. Milliliters times molarity gives the millimoles of each: compare them."
  - 4: "The acid has the larger volume, but volume does not count particles. Find the millimoles of each reactant and compare them."

  Note for the writer: the lesson table suggested "2.00 mmol of a weak acid and 2.50 mmol of NaOH"; this Check has its own amounts and makes the student find the moles. The amounts are not those of lesson 4.6's Check (2.40 mmol) or of lesson 8.5's flask (3.00 mmol).
- **Section "A weak base with a strong acid: the mirror image":**
  - Turn everything around. In water alone, only a small share of a weak base's molecules have taken a proton (topic 8.3). But H₃O⁺ is a far stronger acid than water, and a molecule of the base, B, takes its proton essentially every time. Display:

    $$\ce{B(aq) + H3O+(aq) -> HB+(aq) + H2O(l)}$$

    One sentence: topic 4.2 wrote an equation of this kind for pyridine, as $\ce{C5H5N(aq) + H+(aq) -> C5H5NH+(aq)}$; it is the same reaction with another base. The example here is hydroxylamine, NH₂OH, a weak base whose conjugate acid is the hydroxylammonium ion, NH₃OH⁺. For hydroxylamine the constant of the reaction with H₃O⁺ is $K_b / K_w$ = 1.1 × 10⁶ (from $K_b$ = 1.1 × 10⁻⁸), large enough to treat as complete.
  - The three outcomes, as a table (three columns):

    | H₃O⁺ added, against B | Left in the flask | Which is |
    |---|---|---|
    | Fewer moles | B and HB⁺ | a buffer |
    | Equal moles | HB⁺ alone | a weak acid |
    | More moles | H₃O⁺ left over | a strong acid |

  - For the buffer, the acid of the pair is HB⁺, so the constant to use is the $K_a$ of HB⁺, which is $K_w / K_b$: $[\ce{H3O+}] = K_a \times$ moles of HB⁺ ÷ moles of B. For equal moles, HB⁺ gives protons to water, display:

    $$\ce{HB+(aq) + H2O(l) <=> B(aq) + H3O+(aq)}$$

    and the solution is acidic. Here $x$ is $[\ce{H3O+}]$, so its negative logarithm is the pH itself.
- **Check 3**, `<Check answer={2}>`: "A flask holds 3.00 mmol of hydroxylamine, NH₂OH, a weak base, dissolved in water. Then 1.20 mmol of hydrochloric acid, HCl, a strong acid, is added. Once the reaction is over, what does the flask hold in large amounts, besides water?" Options:
  1. Hydroxylamine, H₃O⁺ and Cl⁻: a weak base leaves the ions of the acid untouched
  2. Hydroxylamine, NH₃OH⁺ and Cl⁻: part of the base is now its conjugate acid
  3. NH₃OH⁺ and Cl⁻ only: all of the hydroxylamine is now its conjugate acid
  4. Hydroxylamine and Cl⁻ only: the H₃O⁺ is used up and leaves nothing behind

  Why: the reaction is 1 to 1 and goes to completion. All 1.20 mmol of H₃O⁺ reacts with 1.20 mmol of hydroxylamine and makes 1.20 mmol of NH₃OH⁺. That leaves 3.00 − 1.20 = 1.80 mmol of hydroxylamine. The Cl⁻ ions, 1.20 mmol of them, are spectators. So the flask holds a weak base and its conjugate acid together: a buffer. "Weak" says how hydroxylamine acts on water, not on H₃O⁺. There is not enough acid to reach every hydroxylamine molecule. And a proton that leaves H₃O⁺ ends up on a hydroxylamine molecule; it does not vanish. Misses:
  - 1: "Weak describes how hydroxylamine acts on water. H₃O⁺ is a far stronger acid than water. What happens when it meets a hydroxylamine molecule?"
  - 3: "Compare the millimoles of the two reactants. Is there enough H₃O⁺ to reach every hydroxylamine molecule?"
  - 4: "A proton that leaves H₃O⁺ has to end up somewhere. Write the equation for the reaction and look at what it forms."

  Note for the writer: do not calculate this buffer's pH in the Why (the question gives no volume, so the small-x check could not be shown).
- **Check 4**, `<Check numeric="3.69" tolerance={0.6}>` (no `unit`): "64.0 mL of 0.0750 M hydroxylamine, NH₂OH, a weak base, is mixed with 40.0 mL of 0.120 M hydrochloric acid, HCl, a strong acid. For hydroxylamine, $K_b$ = 1.1 × 10⁻⁸. What is the pH of the mixture at 25 °C? Give two decimal places." Why: hydroxylamine: (64.0)(0.0750) = 4.80 mmol. H₃O⁺: (40.0)(0.120) = 4.80 mmol. Equal moles: both are used up, and the flask holds 4.80 mmol of NH₃OH⁺ (with Cl⁻) in 104.0 mL, which is 0.0462 M. That ion is a weak acid, with $K_a = K_w / K_b$ = 9.1 × 10⁻⁷. With $x$ as $[\ce{H3O+}]$, $x^2 / 0.0462$ = 9.1 × 10⁻⁷ gives $x$ = 2.05 × 10⁻⁴ M. Check: 2.05 × 10⁻⁴ ÷ 0.0462 is 0.44%, under 5 percent. pH = 3.69. Show the table of moles (Before 4.80, 4.80, 0; After 0, 0, 4.80) and the ICE table (columns HB⁺, B, H₃O⁺, with HB⁺ defined as NH₃OH⁺ in the sentence above it), and put the arithmetic in display math. The tolerance of 0.6 percent accepts 3.67 to 3.71: the shortcut's 3.69, the full equation's 3.69 and an answer rounded to 3.7 are all accepted. Slips:
  - `7.00` (equal moles taken as neutral): "Did you take equal moles to mean neutral? Neither reactant is left over, but the flask still holds an ion that acts on water. Which ion, and how?"
  - `4.65` ($K_b$ used where $K_a$ belongs): "Did you use the Kb of hydroxylamine? The flask holds its conjugate acid, NH₃OH⁺, so the constant needed is the Ka of that ion, found from Kw."
  - `9.35` (the flask treated as a solution of hydroxylamine: $K_b$, then pOH to pH): "Did you treat the flask as a solution of hydroxylamine? The hydroxylamine has all reacted. What is left is its conjugate acid, which needs a Ka."
  - `3.58` (0.0750 M used: the starting volume where the total volume belongs): "Did you use 0.0750 M for the ion? The mixture has a larger volume than the hydroxylamine solution had. Divide the millimoles by the total volume."
  - `3.48` (the 4.80 mmol divided by the acid's 40.0 mL): "Did you divide by 40.0 mL? The ion is spread through both solutions, so divide the millimoles by the total volume."
  - `1.34` (the hydroxylammonium ion treated as a strong acid): "That is the pH if every NH₃OH⁺ ion gave up its proton. The ion is a weak acid, so set up its equilibrium with its Ka."

  Note for the writer: six slips is the most a Check carries, so the slip for 14.00 minus the right answer (10.31) is left out to make room for the one at 3.48. The two volumes differ enough (64.0 mL against 40.0 mL) that the slips at 3.58 and 3.48 stand 0.10 apart. Hydroxylamine is written NH₂OH and its conjugate acid NH₃OH⁺ throughout; the salt is hydroxylammonium chloride, NH₃OHCl, the form in which hydroxylamine is usually sold.
- **Section "Why a salt solution can be acidic or basic":**
  - The two equal-moles flasks above are nothing more than salt solutions: sodium hexanoate in water, and hydroxylammonium chloride in water. Dissolve either solid salt in water to the same concentration and you get the same solution, with the same pH, as by neutralizing. So a salt solution does not have to be neutral.
  - To judge a salt, split it into its ions (topic 4.2) and ask of each one: is it the conjugate of something weak?
    - The conjugate base of a weak acid (the hexanoate ion) takes protons from water and makes the solution basic.
    - The conjugate acid of a weak base (NH₃OH⁺) gives protons to water and makes the solution acidic.
    - The anion of a strong acid (Cl⁻, Br⁻, I⁻, NO₃⁻, ClO₄⁻) and the cation of a strong base (the group 1 ions, Ca²⁺, Sr²⁺, Ba²⁺) do neither. Topic 4.8 gave the reason for the anions: a strong acid's conjugate base is so weak that it essentially never takes a proton from water.
  - A salt whose ions are all of the third kind gives a neutral solution. If both of its ions react with water, compare the cation's $K_a$ with the anion's $K_b$: the larger one decides.
  - The calculation, when a question asks for it, is the one in the worked example and in Check 4: an ICE table for the ion that reacts, with the constant found from $K_w$.
  - Note for the writer: do not write "hydrolysis", "parent acid", "trace each ion to its parent" or "the weak parent decides". Do not use NaCl, NH₄Cl, sodium acetate, NaCN, KNO₃, NH₄NO₃, KF or NaF as examples.
- **Check 5**, `<Check answer={4}>`: "Four salts are each dissolved in water to make a 0.050 M solution at 25 °C. Lactic acid is a weak acid and methylamine is a weak base. HClO₄, HNO₃ and HI are strong acids, and NaOH, KOH and Sr(OH)₂ are strong bases. Which solution has a pH above 7?" Options:
  1. Sodium perchlorate, NaClO₄
  2. Methylammonium nitrate, CH₃NH₃NO₃
  3. Strontium iodide, SrI₂
  4. Potassium lactate, KC₃H₅O₃

  Why: split each salt into its ions. Na⁺ and ClO₄⁻, and Sr²⁺ and I⁻, all come from strong partners, so none of them reacts with water and both solutions are neutral. In methylammonium nitrate, NO₃⁻ does nothing and CH₃NH₃⁺ is the conjugate acid of a weak base, so it gives protons to water: that solution is acidic (pH 5.97 at this concentration). In potassium lactate, K⁺ does nothing and the lactate ion is the conjugate base of a weak acid, so it takes protons from water and makes OH⁻: that solution is basic (pH 8.28). Misses:
  - 1: "Na⁺ comes from a strong base and ClO₄⁻ from a strong acid. Does either ion give a proton to water or take one from it?"
  - 2: "One of its ions does react with water. Decide whether CH₃NH₃⁺ gives a proton to water or takes one from it."
  - 3: "Sr²⁺ comes from a strong base and I⁻ from a strong acid. Does either ion give a proton to water or take one from it?"

  Note for the writer: the two ions that decide the Check, CH₃NH₃⁺ and the lactate ion, are not sorted in the section, so it cannot be answered by reading the bullets above. The two pH values in the Why come from $x$ = √(K × 0.050) with lesson 8.5's values, p$K_a$ = 10.64 for CH₃NH₃⁺ ($K_a$ = 2.29 × 10⁻¹¹) and p$K_a$ = 3.86 for lactic acid ($K_b$ of the lactate ion 7.24 × 10⁻¹¹); their checks are 0.002% and 0.004%. Give them as 5.97 and 8.28, or leave them out; do not round them to one decimal place. No constant is printed in the question. All four salts dissolve easily at 0.050 M.
- **Section "A weak acid with a weak base":**
  - When neither is strong, the reaction is not sure to go to completion. A weak acid and a weak base pass a proton back and forth until the mixture settles at an equilibrium, with all four species present. How far it goes depends on the two acids. Display:

    $$\ce{HA(aq) + B(aq) <=> A-(aq) + HB+(aq)}$$

  - Which side is favored is topic 4.8's question, and it has topic 4.8's answer: there is an acid on each side (HA and HB⁺), and the side with the weaker acid is favored. Now you can compare the two acids by their $K_a$ values.
  - One example in the text. Hexanoic acid and hydroxylamine, display, split after the arrow:

    $$\ce{HC6H11O2(aq) + NH2OH(aq) <=> C6H11O2-(aq) + NH3OH+(aq)}$$

    The acids are hexanoic acid ($K_a$ = 1.3 × 10⁻⁵) on the left and NH₃OH⁺ ($K_a$ = 9.1 × 10⁻⁷) on the right. The weaker acid is on the right, so the products are favored. The constant is the first $K_a$ divided by the second, about 14: the equation is hexanoic acid's ionization added to the reverse of the hydroxylammonium ion's (topic 7.6). That is nothing like 10⁹. With equal amounts mixed, about a fifth of each reactant is still there when the mixture has settled.
  - One closing sentence: this unit stops at the equilibrium and its direction, and does not calculate the pH of such a mixture.
  - Note for the writer: "about a fifth" is 21 percent, from 1 ÷ (1 + √K) with K = 14.3; state it and do not show the working.
- **Check 6**, `<Check answer={1}>`: "Equal volumes of 0.050 M sodium hexanoate, NaC₆H₁₁O₂, and 0.050 M hydroxylammonium chloride, NH₃OHCl, are mixed. $K_a$ is 1.3 × 10⁻⁵ for hexanoic acid and 9.1 × 10⁻⁷ for the hydroxylammonium ion, NH₃OH⁺. What happens in the mixture?" Options:
  1. A minor share of the NH₃OH⁺ ions pass a proton to hexanoate ions; most do not
  2. Most of the NH₃OH⁺ ions pass a proton to hexanoate ions; a minor share do not
  3. Essentially every NH₃OH⁺ ion passes a proton to a hexanoate ion, as each would to an OH⁻ ion
  4. No proton passes at all, because the ions of two dissolved salts are spectators

  Why: the mixture holds a weak acid, NH₃OH⁺, and a weak base, the hexanoate ion, so they react to an equilibrium (display, split after the arrow):

  $$\ce{NH3OH+(aq) + C6H11O2-(aq) <=> NH2OH(aq) + HC6H11O2(aq)}$$

  The acid on the left is NH₃OH⁺ and the acid on the right is hexanoic acid. Hexanoic acid has the larger $K_a$, so it is the stronger acid, and the weaker acid is on the left: the reactants are favored. The constant is 9.1 × 10⁻⁷ divided by 1.3 × 10⁻⁵, which is 0.070, and about a fifth of the ions react. Neither ion is strong, so nothing makes the reaction go to completion, and with a constant of 0.070 it stops far short. And these two ions are not spectators: Na⁺ and Cl⁻ are. Misses:
  - 2: "Find the acid on each side of the equation and compare the two Ka values. Which side holds the weaker acid?"
  - 3: "OH⁻ takes essentially every proton because it is a strong base. Is the hexanoate ion a strong base? Compare the two Ka values."
  - 4: "A spectator ion neither gives nor takes a proton. NH₃OH⁺ is a weak acid and the hexanoate ion is a weak base."

  Note for the writer: this is the text's example run backward, with the two salts as the starting materials, so the answer is the opposite of the text's "products are favored". The hexanoic acid formed (about 0.005 M, far below the 0.09 M that dissolves) stays dissolved. "About a fifth" is 21 percent, from √K ÷ (1 + √K) with K = 0.070. Answer positions: 3, 2, 4, 1 for Checks 2, 3, 5 and 6.
- **Closing paragraph, then a second `<KeyIdea>`:** every flask in this lesson was sorted by one question, asked after the complete reaction was over: what is left? A strong acid or strong base left over: its concentration in the total volume gives the pH. A weak acid alone or a weak base alone, an ion included: an ICE table with $K_a$ or $K_b$. Both members of a pair: $K_a$ times the ratio of moles. Only ions from strong partners: neutral. `<KeyIdea>`: before any pH calculation, name what the flask holds once every complete reaction is over. The numbers come after the name.
- **Trap:** **Putting a strong base or a strong acid into an equilibrium table** (it reacts to completion first, in a table of moles; only what is left goes into an ICE table). **Comparing volumes when the moles decide** (milliliters times molarity, every time). **Dividing by the volume of one solution** (after mixing, every concentration uses the total volume). **Calling equal moles "neutral"** (a weak acid exactly neutralized by a strong base leaves a weak base, and the pH is above 7 at 25 °C; a weak base exactly neutralized leaves a weak acid). **Using the acid's $K_a$ for its conjugate base** (the hexanoate ion needs $K_b = K_w / K_a$; the hydroxylammonium ion needs $K_a = K_w / K_b$). **Stopping at the pOH** (when $x$ is $[\ce{OH-}]$, the pH is 14.00 minus the pOH at 25 °C). **Treating Cl⁻, ClO₄⁻ or Na⁺ as an acid or a base** (ions from strong acids and strong bases do not react with water).
- **Key points:** a strong acid or a strong base reacts to completion, so do the stoichiometry first, in a table of moles, and the equilibrium second; a strong acid with a strong base leaves whichever was in excess, and its concentration in the total volume gives the pH (equal moles give pH 7.00 at 25 °C); a weak acid with a strong base, $\ce{HA + OH- -> A- + H2O}$, leaves one of three things: HA and A⁻ together (a buffer), A⁻ alone (a weak base, pH above 7 at 25 °C) or leftover OH⁻; a buffer holds large amounts of both members of a conjugate pair, and its $[\ce{H3O+}]$ is $K_a$ times the moles of the acid form over the moles of the base form; a weak base with a strong acid is the mirror image, and equal moles leave the conjugate acid alone, so the pH is below 7 at 25 °C; a salt solution is acidic or basic when one of its ions is the conjugate of a weak acid or a weak base, and neutral when every ion comes from a strong one; a weak acid and a weak base react to an equilibrium that favors the side with the weaker acid.

**Figures**

- **`8-4-partial-neutralization-particles.svg`** (viewBox 0 0 480 340, font-size 18). Two boxes side by side, each 200 wide and 210 tall, at x = 15 and x = 265, top at y = 40, with the titles "Before" and "After" centered above them. Between the boxes, at mid-height, a short arrow in the accent color points from the first box to the second. Under the boxes, one line of direct labels (a key drawn with the same shapes): "HA", "A⁻", "OH⁻", "Na⁺".
  - Shapes, so that the four kinds differ in shape and shading and not in color alone: **HA** is a large circle (radius 13, filled with the light accent, ink outline) with a small circle (radius 5, white fill, ink outline) touching its edge, the acidic hydrogen. **A⁻** is the same large circle with no small circle and a "−" drawn inside it. **OH⁻** is a small circle (radius 8, white fill, dashed ink outline) with a "−" inside. **Na⁺** is a small filled ink circle (radius 7) with a white "+" inside.
  - Before box, exact counts: 8 HA, 3 OH⁻, 3 Na⁺. After box, exact counts: 5 HA, 3 A⁻, 3 Na⁺, and no OH⁻. Particles are placed from computed coordinates on a loose grid (four columns by four rows of cells about 50 units square, each particle offset a few units from its cell center), none touching another or the box, the three A⁻ ions spread among the HA molecules.
  - Conservation: the large circles number 8 before and 5 + 3 = 8 after; Na⁺ is 3 and 3; each box is neutral (3 − 3 = 0); the three hydrogens that left the acid and the three OH⁻ ions are the three water molecules formed, which are not drawn.
  - Text in the figure, six pieces: "Before", "After", and the four labels of the key.
  - Alt: "Two boxes of particles. The box labeled Before holds eight whole acid molecules, HA, three hydroxide ions and three sodium ions. The box labeled After holds five whole acid molecules, three A⁻ ions and three sodium ions, and no hydroxide ions. Water molecules are not drawn."
  - Caption: "Three OH⁻ ions take the protons of three HA molecules. What is left is both members of the pair, HA and A⁻. Water molecules, including the three that form, are left out."
- **`8-4-what-is-left.svg`** (viewBox 0 0 480 300, font-size 18). One horizontal axis and three labeled stretches above it.
  - The axis: an ink arrow from (30, 200) to (460, 200), with the label "Moles of OH⁻ added" centered under it at y = 285. One tall tick at x = 240, from y = 60 to y = 210, drawn dashed in the secondary color, with the label "= moles of HA" centered under it at y = 232, and "at the start" centered at y = 254.
  - Left stretch (x from 30 to 232, y from 110 to 190): a rectangle filled with the light accent, ink outline. Inside it, two lines centered: "HA and A⁻" and "a buffer".
  - At the tick: a filled ink circle of radius 7 at (240, 150). Above the tick, centered at x = 240: "A⁻ alone" at y = 28 and "a weak base" at y = 50.
  - Right stretch (x from 248 to 450, y from 110 to 190): a rectangle with diagonal hatching in the secondary color, ink outline, and a plain background-colored panel behind its text. Inside it, two lines centered: "OH⁻ left over" and "a strong base".
  - The three stretches differ in shading (plain tint, a point, hatching), not in color alone.
  - Text in the figure, nine pieces: "Moles of OH⁻ added", "= moles of HA", "at the start", "HA and A⁻", "a buffer", "A⁻ alone", "a weak base", "OH⁻ left over", "a strong base".
  - Alt: "A line showing the moles of hydroxide ion added to a weak acid, HA, with a mark where they equal the moles of HA at the start. To the left of the mark, a shaded stretch is labeled HA and A⁻, a buffer. At the mark, a point is labeled A⁻ alone, a weak base. To the right, a hatched stretch is labeled OH⁻ left over, a strong base."
  - Caption: "Add a strong base to a weak acid and the flask ends up as one of three things. Which one depends only on the moles of OH⁻ added against the moles of HA that were there."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; sure |
| $K_a$ of hexanoic acid (caproic acid), HC₆H₁₁O₂, CH₃(CH₂)₄COOH | 1.3 × 10⁻⁵ (p$K_a$ 4.89 from this $K_a$; tables give 4.88) | from memory (p$K_a$ 4.88 at 25 °C in the reference tables; 4.85 in some); fairly sure **(verify)**. Not the butanoic acid of lesson 8.3, whose $K_a$ is 1.5 × 10⁻⁵ |
| Solubility of hexanoic acid in water near room temperature | about 1.0 g per 100 mL, about 0.09 M (molar mass 116.16 g/mol) | from memory; fairly sure **(verify)**; not printed, it caps the concentration (0.0450 M, 5.2 g/L, is used) |
| Hexanoic acid has a strong, rank smell, is among the acids behind the smell of goat cheese, and is named caproic acid from the Latin for a goat | no number | sure of the smell and the name; fairly sure of the goat cheese **(verify)** |
| A solution of sodium hexanoate does not carry the acid's smell into the air | no number | the controller's statement, and it follows from the ion not being volatile; fairly sure **(verify)** |
| $K_b$ of the hexanoate ion | 7.69 × 10⁻¹⁰ (7.7 × 10⁻¹⁰ to two figures) | calculated on the page from $K_w / K_a$ |
| $K_b$ of hydroxylamine, NH₂OH | 1.1 × 10⁻⁸ | from memory: the value of the common general chemistry tables; fairly sure **(verify)**: a p$K_a$ of 5.94 to 5.96 for NH₃OH⁺ is also tabulated, which would make $K_b$ 8.7 × 10⁻⁹ to 9.1 × 10⁻⁹, against the p$K_a$ of 6.04 that 1.1 × 10⁻⁸ implies. The lesson prints $K_b$ = 1.1 × 10⁻⁸ and the $K_a$ calculated from it, and never a p$K_a$ for NH₃OH⁺ |
| $K_a$ of the hydroxylammonium ion, NH₃OH⁺ | 9.1 × 10⁻⁷ | calculated on the page from $K_w / K_b$ (9.09 × 10⁻⁷); given as a value in Check 6 and in the weak-acid-with-weak-base example |
| Constant of H₃O⁺ + OH⁻ → 2 H₂O | 1.0 × 10¹⁴ | $1/K_w$ |
| Constant of hexanoic acid + OH⁻ | 1.3 × 10⁹ | $K_a / K_w$ |
| Constant of hydroxylamine + H₃O⁺ | 1.1 × 10⁶ | $K_b / K_w$ |
| Constant of hexanoic acid + hydroxylamine | about 14 | 1.3 × 10⁻⁵ ÷ 9.1 × 10⁻⁷ = 14.3 |
| Constant of NH₃OH⁺ + hexanoate ion (Check 6) | 0.070 | 9.1 × 10⁻⁷ ÷ 1.3 × 10⁻⁵ = 0.070 |
| Strong acids named | HClO₄, HBr, HCl, HNO₃, HI | lesson 4.2's list |
| Strong bases named | NaOH, KOH, RbOH, Sr(OH)₂ | lesson 4.2's list (the group 1 hydroxides and Sr(OH)₂) |
| Lactic acid | a weak acid with one acidic proton; no constant is printed here (p$K_a$ 3.86 stands behind Check 5's 8.28) | lesson 4.6; the design; sure |
| Methylamine | a weak base; no constant is printed here (p$K_a$ of CH₃NH₃⁺ 10.64 stands behind Check 5's 5.97) | the design; fairly sure |
| Benzoic acid, pyridine | named once each, as a look back at topic 4.2; no value | lesson 4.2 |

No atomic mass is used. The two salts of Check 5 that react, at 0.050 M: methylammonium nitrate pH 5.97, potassium lactate pH 8.28.

**Check script:** `scratchpad/unit8/checks/8-4.py`. It recomputes every number above, checks each equation's balance, each use of the approximation, each slip's value and distance, each message and option against this file, the particle figure's counts, the summary and the answer positions.

**Notes for the writer**

- H₃O⁺ in every equation and every expression, with water in the equation. The two places where H⁺ appears are quotations of topic 4.2's net ionic equations, each followed at once by "the same reaction". Those two sentences are the lesson's only look back at topic 4.2's scenes: benzoic acid, sodium benzoate, pyridine and hydrobromic acid with pyridine appear nowhere else.
- A single arrow for every reaction that has a strong acid or a strong base as a reactant; a double arrow for an ion or a molecule reacting with water, and for the weak acid with the weak base. State symbols on every term.
- Two kinds of table, never confused: the table of moles (Before, Change, After; mmol; no $x$) and the ICE table (I, C, E; M; with $x$). Never call the first an ICE table, and never write "ICF".
- Every use of the small-x approximation shows its percentage. Call 5 percent "the check from topic 7.7", never a rule of the exam.
- The lesson never writes pH = p$K_a$ + log(…), never uses the words "half-equivalence point" (topic 8.5) and never gives hexanoic acid's p$K_a$.
- Never give a p$K_a$ for the hydroxylammonium ion: tables that list one (5.94 to 5.96) do not agree with the $K_b$ this lesson uses.
- The smell of hexanoic acid appears in the opening only. Do not say that the smell fades steadily, and do not use the smell in any Check: lesson 8.7 has a Check about a smell and an ion that cannot evaporate (trimethylamine).
- A buffer is defined here in one sentence and used as a name. Do not explain how it resists a change in pH: that is topic 8.8. Do not say "buffer capacity".
- Do not frame any question as "a student puts the base into the ICE table"; the Trap names the mistake and that is enough.
- For a base, $x$ is $[\ce{OH-}]$: pOH first, then pH. For the hydroxylammonium ion, $x$ is $[\ce{H3O+}]$.
- "Essentially" stays in "essentially nothing of the limiting reactant is left" and "essentially never takes a proton".

**Reactions, substances and scenarios used:** H₃O⁺ + OH⁻ → 2 H₂O; hexanoic acid + OH⁻ → hexanoate + H₂O; the ionization of hexanoic acid and the reaction of the hexanoate ion with water; hydroxylamine + H₃O⁺ → NH₃OH⁺ + H₂O and the ionization of NH₃OH⁺; lactic acid + OH⁻ (named, not written); hexanoic acid + hydroxylamine ⇌ hexanoate + NH₃OH⁺ and its reverse. Scenarios: the goat-cheese smell of hexanoic acid fading as sodium hydroxide is run in, stopped early, on time or late (opening); 25.0 mL of 0.120 M HClO₄ with 15.0 mL of 0.130 M KOH, pH 1.58 (worked example 1); 25.0 mL of 0.100 M HBr with 32.0 mL of 0.120 M RbOH, pH 12.37 (Check 1); 50.0 mL of 0.0450 M hexanoic acid with 10.0, 25.0 and 29.0 mL of 0.0900 M NaOH, pH 4.71, 8.68 and 11.66 (worked examples 2 and 3); 24.0 mL of 0.150 M lactic acid with 20.0 mL of 0.250 M KOH, 1.40 mmol of OH⁻ left (Check 2); 3.00 mmol of hydroxylamine with 1.20 mmol of HCl (Check 3); 64.0 mL of 0.0750 M hydroxylamine with 40.0 mL of 0.120 M HCl, pH 3.69 (Check 4); 0.050 M solutions of NaClO₄, CH₃NH₃NO₃, SrI₂ and KC₃H₅O₃ (Check 5); hexanoic acid with hydroxylamine, K about 14 (text); equal volumes of 0.050 M sodium hexanoate and 0.050 M hydroxylammonium chloride (Check 6). One-sentence look backs at topic 4.2: benzoic acid with OH⁻, and pyridine with H⁺. Figures: eight HA and three OH⁻ becoming five HA and three A⁻; the line of moles of OH⁻ added with its three stretches.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps: the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.4 Acid–Base Reactions and Buffers`).

**Check script:** `scratchpad/unit8/checks/8-4.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.4 Acid–Base Reactions and Buffers`).

### Task 5: Lesson 8.5, Acid–Base Titrations

**Files:**
- Create: `src/content/lessons/unit-8/8-5-acid-base-titrations.mdx`
- Create: `public/figures/8-5-weak-base-curve.svg`, `public/figures/8-5-two-rises.svg`
- Places the interactive block `<TitrationCurve />` (built in its own task from "Diagram data" below; the lesson only places it, and no Check can be answered by reading it). Lesson 8.7 places the same block again and quotes numbers from this brief's "Diagram data".

**Brief**

- **Front matter:** `topic: "8.5"`, `minutes: 22`, summary: "How the pH changes through a titration, what each stretch of a weak acid's curve shows, why pH equals pKa halfway to the equivalence point, and how to read the curve of a weak base." (No colon in the summary.)
- **Framework (8.5, four statements):** (1) a titration is an acid–base reaction run under control, and a titration curve, pH against volume of titrant added, sums it up; (2) at the equivalence point the moles of titrant added match the moles of analyte by the balanced equation, which gives the analyte's concentration, for strong and weak acids and bases alike; (3) for a weak acid or a weak base, at the half-equivalence point the two members of the conjugate pair are present in equal concentrations, so pH = p$K_a$, and the p$K_a$ can be read from the curve; (4) for an acid with more than one acidic proton, the curve shows the number of acidic protons, and the forms of the acid present at each point and the p$K_a$ that belongs to each proton can be picked out. **Not assessed:** calculating the concentration of each species along the curve of a polyprotic acid. **What this lesson does not do:** titrant, analyte, equivalence point, endpoint and millimoles are topic 4.6's (use them exactly as defined there); the method for each flask along the curve is topics 8.2, 8.3 and 8.4's (name the topic, use the method); why an indicator changes color where it does, and how one is chosen, is topic 8.7's (here the explorer only lays an indicator's range over the curve); why a buffer holds its pH is topic 8.8's; the Henderson–Hasselbalch equation is topic 8.9's (this lesson uses 8.4's $[\ce{H3O+}] = K_a \times$ moles of acid ÷ moles of base). **Equation sheet:** the $K_a$ and $K_b$ expressions, $K_w = K_a \times K_b$, pH, pOH and 14 = pH + pOH are on it. Nothing on it gives the equivalence volume, and nothing on it says that pH = p$K_a$ at the half-equivalence point.
- **Opening:** in topic 4.6 a flask of lactic acid stayed yellow while 15 mL of sodium hydroxide ran in, and then turned blue within a couple of drops. The color reports one moment. Put a pH probe in the same flask, write down the reading after every addition, and the whole run shows: a quick climb at the start, a long stretch where the pH hardly moves, and then a leap of more than six pH units between 14.5 mL and 15.5 mL. Note for the writer: the leap is the explorer's 5.32 to 11.45, a rise of 6.13. A pH probe (a glass electrode on a meter) is the real instrument; say no more about how it works.
- **Section "The titration curve":**
  - A **titration curve** is a graph of the pH of the flask (up the side) against the volume of titrant added (along the bottom). It is the titration of topic 4.6 with every moment recorded, not only the last.
  - Each portion of titrant reacts to completion with what is in the flask (topic 8.4), so every point on the curve is one of topic 8.4's flasks: count the moles, react, see what is left, find the pH.
  - Where the equivalence point lies along the bottom is a matter of moles and the balanced equation, as in topic 4.6, and of nothing else. For the flask of topic 4.6's diagram: 20.0 mL of 0.150 M lactic acid is 3.00 mmol, and 3.00 mmol of OH⁻ from 0.200 M NaOH is 15.0 mL. On the curve, the equivalence point is in the middle of the steepest part of the rise.
- **Check 1**, `<Check numeric="18.0" unit="mL">`: "25.0 mL of 0.108 M propanoic acid, HC₃H₅O₂, a weak acid with one acidic proton, is titrated with 0.150 M potassium hydroxide, KOH. What volume of the KOH solution, in mL, brings the titration to its equivalence point?" Why: the acid: (25.0)(0.108) = 2.70 mmol. The reaction is 1 to 1, so the equivalence point needs 2.70 mmol of OH⁻, and 2.70 mmol ÷ 0.150 mmol/mL = 18.0 mL. That the acid is weak changes nothing here: the moles decide. (Display the two lines, numbers only.) Slips:
  - `34.7` (the two molarities exchanged: 25.0 × 0.150 ÷ 0.108): "Did you divide by 0.108 and multiply by 0.150? Find the millimoles of acid first, then divide by the molarity of the base."
  - `9.0` (the half-equivalence volume): "Did you stop at half of the acid? At the equivalence point the moles of OH⁻ added equal all of the moles of acid in the flask."
  - `2.70` (the millimoles of acid): "That is the millimoles of acid in the flask. One more step turns it into a volume of the 0.150 M base."
  - `0.0180` (liters): "That is the volume in liters. The question asks for milliliters."

  Note for the writer: Checks 1, 2 and 4 follow this one titration. Do not print "18.0 mL" as the equivalence volume anywhere outside this Check's own answer: Check 2 depends on the student finding it.
- **Section "Four stretches of a weak acid's curve":**
  - One sentence before the table: write HA for the weak acid and A⁻ for its conjugate base; the titrant is a strong base.
  - The table (three columns):

    | Stretch | The flask holds | What sets the pH |
    |---|---|---|
    | Before any base | HA alone | the weak acid's equilibrium (topic 8.3) |
    | Before the equivalence point | HA and A⁻ | $K_a$ × moles of HA ÷ moles of A⁻ (topic 8.4) |
    | At the equivalence point | A⁻ alone | the weak base's equilibrium, with $K_b$ (topic 8.4) |
    | After it | A⁻ and leftover OH⁻ | the leftover OH⁻ in the total volume |

  - One paragraph: the curve is four methods joined end to end. Nothing in it is new. What is new is seeing where one hands over to the next.
  - Note for the writer: this four-row table is the content of the topic and cannot be avoided. Keep these column headings and these words; do not write "region", "ICF" or "major species", and give no pH values in the table.
- **Section "Halfway there: pH = pKa":**
  - The **half-equivalence point** is the point at half of the equivalence volume. Half of the acid's moles have been turned into A⁻ and half are still HA, so the moles of HA and of A⁻ are equal. Topic 8.4's line then reads $[\ce{H3O+}] = K_a \times 1$. Display:

    $$[\ce{H3O+}] = K_a \quad\text{so}\quad \text{pH} = \text{p}K_a$$

  - This is not on the equation sheet, and it is worth knowing by heart, because it works backward: read the pH at half of the equivalence volume and you have the acid's p$K_a$, and $K_a = 10^{-\text{p}K_a}$. This is how a $K_a$ is measured.
  - Around the half-equivalence point the curve is nearly level. The flask holds comparable amounts of HA and A⁻, which makes it a buffer (topic 8.4), and this stretch of the curve is called the **buffer region**. Topic 8.8 explains why the pH moves so little there.
  - "Half" means half of the equivalence volume. It is not half of the volume of acid in the flask, and not half of the total volume.
  - One sentence as a hedge to keep: the result leans on topic 8.4's approximation, that the amounts in the flask are far larger than the $[\ce{H3O+}]$, which holds for lactic acid and propanoic acid here. For the made-up acid of the last section, whose first proton is a stronger acid than either, the reading halfway to its first rise comes out two hundredths of a pH unit above the p$K_a$.
  - `<KeyIdea>`: at the half-equivalence point of a weak acid, half of the acid has become its conjugate base, the two are equal in amount, and pH = p$K_a$. The volume there is half of the equivalence volume.
- **Check 2**, `<Check answer={2}>`: "25.0 mL of 0.108 M propanoic acid is titrated with 0.150 M KOH (the titration of the Check above), with a pH probe in the flask. Four of the readings: 2.92 before any base is added, 4.87 at 9.0 mL, 5.23 at 12.5 mL and 8.83 at 18.0 mL. What is the p$K_a$ of propanoic acid?" (Set the four readings as a two-column table, "KOH added (mL)" and "pH", inside the question.) Options:
  1. 2.92, the reading before any base is added
  2. 4.87, the reading at 9.0 mL
  3. 5.23, the reading at 12.5 mL
  4. 8.83, the reading at 18.0 mL

  Why: the flask holds (25.0)(0.108) = 2.70 mmol of acid, so the equivalence point is at 2.70 ÷ 0.150 = 18.0 mL and the half-equivalence point is at 9.0 mL. There, 1.35 mmol of propanoic acid and 1.35 mmol of propanoate ion are in the flask, and pH = p$K_a$ = 4.87. Before any base the flask holds the acid alone, and 2.92 is the pH of a weak acid solution, not a p$K_a$. 12.5 mL is half of the 25.0 mL of acid, which has nothing to do with the moles. At 18.0 mL all of the acid has reacted, and 8.83 is the pH of a solution of the propanoate ion. Misses:
  - 1: "Before any base, the flask holds the acid alone, nearly all of it un-ionized. A pKa is read where the acid and its conjugate base are equal in amount."
  - 3: "12.5 mL is half of the volume of acid in the flask. Which volume of base has turned half of the moles of acid into its conjugate base?"
  - 4: "Find the volume of base that reacts with all of the acid, and ask what the flask holds there. A pKa is read where half of the acid has reacted."

  Note for the writer: the four readings are the full equation's (2.92, 4.87, 5.23, 8.83); the shortcut gives the same four. The question must not say which reading is the equivalence point.
- **Section "At the equivalence point: not pH 7":**
  - The equivalence point is a statement about moles (topic 4.6). It says nothing about the pH. The pH there depends on what the flask holds, and for a weak acid titrated with a strong base it holds the conjugate base alone, a weak base. So the pH is above 7 at 25 °C.
  - For a strong acid titrated with a strong base, the flask at the equivalence point holds water and spectator ions, and of the titrations in this unit, only then is the pH 7.00 at 25 °C.
- **Worked example "The equivalence point of lactic acid, by hand":** 20.0 mL of 0.150 M lactic acid, HC₃H₅O₃, is titrated with 0.200 M NaOH. The p$K_a$ of lactic acid is 3.86. What is the pH at the equivalence point, at 25 °C? (One sentence: write HA for lactic acid and A⁻ for the lactate ion, C₃H₅O₃⁻.)
  1. **Find the equivalence volume.** (20.0)(0.150) = 3.00 mmol of HA, which needs 3.00 mmol of OH⁻: 3.00 ÷ 0.200 = 15.0 mL.
  2. **React to completion.** Every value is in mmol:

     | | HA | OH⁻ | A⁻ |
     |---|---|---|---|
     | Before | 3.00 | 3.00 | 0 |
     | Change | −3.00 | −3.00 | +3.00 |
     | After | 0 | 0 | 3.00 |

  3. **Say what is left.** The lactate ion alone, a weak base. It takes protons from water. Display, split after the arrow:

     $$\ce{C3H5O3-(aq) + H2O(l) <=> HC3H5O3(aq) + OH-(aq)}$$

  4. **Find its concentration in the total volume.** 20.0 + 15.0 = 35.0 mL, so $[\ce{A-}]$ = 3.00 ÷ 35.0 = 0.0857 M.
  5. **Find $K_b$.** $K_a = 10^{-3.86}$ = 1.38 × 10⁻⁴, and $K_b = K_w / K_a$ = 7.24 × 10⁻¹¹.
  6. **ICE table, in M, with $x$ as $[\ce{OH-}]$** (columns A⁻, HA, OH⁻; I: 0.0857, 0, 0; C: −x, +x, +x; E: 0.0857 − x, x, x). Display: $\dfrac{x^2}{0.0857} = 7.24 \times 10^{-11}$, so $x$ = 2.49 × 10⁻⁶ M.
  7. **Check.** 2.49 × 10⁻⁶ ÷ 0.0857 × 100% = 0.0029%, far under 5 percent.
  8. **pOH first, then pH.** pOH = 5.60 and pH = 14.00 − 5.60 = 8.40.

  After the steps, two sentences: no sodium hydroxide is left over and no lactic acid is left over, and the flask is still basic, because of what the acid left behind. The explorer below shows the same 8.40.

  Note for the writer: keep three figures in $K_a$, $K_b$ and $x$ as shown. They are intermediate values, and with $K_a$ cut to 1.4 × 10⁻⁴ the answer comes out as 8.39.
- **The interactive diagram:** place `<TitrationCurve />` here, under a sentence that says what it is: the flask of topic 4.6's diagram, 20.0 mL of a 0.150 M acid titrated with 0.200 M sodium hydroxide, this time with its pH. The text then asks the student to do six things, as a numbered list, predicting before each move:
  1. **Read the start.** Lactic acid, 0.0 mL: the flask holds 3.00 mmol of lactic acid and the pH is 2.35. (One sentence for the careful reader: topic 8.3's shortcut gives $x$ = 4.55 × 10⁻³ M and pH 2.34, with a check of 3.0 percent. The explorer solves the equilibrium without any shortcut, so its pH can differ from one found by hand: by a hundredth here and at some settings in the buffer region, and by more in the first 2.5 mL, where little lactate ion has formed yet.)
  2. **Predict the pH at the half-equivalence point, then go there.** At 7.5 mL the two bars are equal, 1.50 mmol each, and the pH is 3.86, the p$K_a$.
  3. **Cross the buffer region.** From 5.0 mL to 10.0 mL, a third of all the base the acid can take, the pH only goes from 3.56 to 4.16: a change of 0.60.
  4. **Predict the pH at the equivalence point, then go there.** At 15.0 mL the acid's bar is gone and the pH is 8.40, as the worked example found. One step before, at 14.5 mL, it was 5.32; one step after, at 15.5 mL, it is 11.45.
  5. **Switch to hydrobromic acid, a strong acid, and predict first what will stay the same.** The equivalence point is still at 15.0 mL, because the moles of acid are the same. Everything before it sits lower: 0.82 at the start, 1.26 at 7.5 mL, 2.54 at 14.5 mL, and 7.00 at the equivalence point. Past it, the two curves are one curve: 11.45 at 15.5 mL for both acids, because by then the leftover OH⁻ sets the pH and the acid's strength no longer matters.
  6. **Lay an indicator over the curve.** Choose bromocresol green with lactic acid: its color starts to change at 6.96 mL and is not done until 14.58 mL, a change smeared over 7.6 mL of base and finished before the equivalence point. With hydrobromic acid the same indicator changes between 14.97 mL and 15.00 mL. Now try thymol blue: between 15.00 mL and 15.01 mL on both curves. (One sentence: thymol blue changes color twice, and the band on the graph is its second change, from yellow to blue.) An indicator is useful only if its color change falls on the steep part of the curve. Why each indicator changes where it does is topic 8.7.

  The numbers are for the writer to phrase as "you should see". They are the module's values (see "Diagram data"). The by-hand values agree: 3.56 and 4.16 from $K_a$ × ratio, 0.82, 1.26 and 2.54 from the leftover H₃O⁺, and 11.45 from the leftover OH⁻.
- **Paragraph "Strong against weak"** (after the list): same moles of acid, same equivalence volume, whatever the strength (topic 4.8 showed why: OH⁻ takes the proton off a weak acid's molecules too). Strength shows in three other places: where the curve starts, how high it runs before the equivalence point, and the pH at the equivalence point (8.40 against 7.00 here). And a strong acid's curve has no half-equivalence reading to give a p$K_a$: at 7.5 mL the hydrobromic acid flask holds no conjugate pair, only leftover H₃O⁺.
- **Check 3**, `<Check answer={3}>`: "Suppose the explorer's flask held 20.0 mL of 0.150 M propanoic acid (p$K_a$ = 4.87) in place of the lactic acid (p$K_a$ = 3.86), titrated with the same 0.200 M NaOH. Both titrations reach the equivalence point at 15.0 mL. How do the pH values at the two equivalence points compare?" Options:
  1. The same, and above 7, because both flasks hold 3.00 mmol of a weak base in 35.0 mL
  2. Both 7.00, because the acid and the base have exactly used each other up
  3. Higher for propanoic acid, because the propanoate ion is the stronger base
  4. Higher for lactic acid, because lactic acid is the stronger of the two acids

  Why: at each equivalence point the flask holds 3.00 mmol of the acid's conjugate base in 35.0 mL, and nothing else that matters. The two ions are not equally strong bases. Propanoic acid has the higher p$K_a$, so it is the weaker acid, and the weaker acid has the stronger conjugate base (topic 4.8). In numbers: $K_b$ is 7.2 × 10⁻¹¹ for the lactate ion and 7.4 × 10⁻¹⁰ for the propanoate ion, about ten times larger, and the pH at the equivalence point is 8.90 for propanoic acid against 8.40 for lactic acid. Misses:
  - 1: "Equal concentrations do not make equal pH values. The two ions differ in Kb, and each Kb comes from the Ka of its own acid."
  - 2: "Used up does not mean neutral. Ask what each flask holds at the equivalence point and how that ion acts on water."
  - 4: "At the equivalence point the acid itself is gone. What does the flask hold there, and what decides how basic that ion is?"

  Note for the writer: the explorer does not offer propanoic acid, so this cannot be read off it. 8.90 comes from the worked example's method with $K_b$ = 7.4 × 10⁻¹⁰.
- **Check 4**, `<Check numeric="12.11" tolerance={0.18}>` (no `unit`): "In the titration of 25.0 mL of 0.108 M propanoic acid with 0.150 M KOH, what is the pH of the flask after 22.0 mL of the KOH solution has been added, at 25 °C? Give two decimal places." Why: OH⁻ added: (22.0)(0.150) = 3.30 mmol. The acid was 2.70 mmol, so all of it has reacted and 3.30 − 2.70 = 0.60 mmol of OH⁻ is left over. The total volume is 25.0 + 22.0 = 47.0 mL, so $[\ce{OH-}]$ = 0.60 ÷ 47.0 = 0.0128 M. pOH = 1.89 and pH = 14.00 − 1.89 = 12.11. The propanoate ion is a weak base too, but what it adds is far too small to show beside the leftover OH⁻. (Show the table of moles and put the arithmetic in display math.) The tolerance of 0.18 percent accepts 12.09 to 12.13, which takes in 12.1 and an answer from a hydroxide concentration rounded to 0.013 M. Slips:
  - `1.89` (the pOH given as the pH): "That is the pOH. The ion left over is OH⁻, so one more step takes the pOH to the pH at 25 °C."
  - `12.38` (the leftover divided by the flask's 25.0 mL): "Did you divide by 25.0 mL? The leftover OH⁻ is spread through the acid solution and all of the base added. Use the total volume."
  - `12.44` (the leftover divided by the 22.0 mL of base): "Did you divide by 22.0 mL? The leftover OH⁻ is spread through the acid solution and all of the base added. Use the total volume."
  - `12.85` (all 3.30 mmol of OH⁻ in 47.0 mL): "Did you count all of the OH⁻ that was added? Most of it reacted with the acid. Only what is left over sets the pH."
  - `13.18` (the pH of the 0.150 M titrant itself): "That is the pH of the KOH solution in the buret. In the flask, the leftover OH⁻ is diluted by everything else there."
  - `8.81` (the propanoate ion's $K_b$ used, as at the equivalence point): "Did you use the Kb of the propanoate ion? Past the equivalence point OH⁻ is left over, and it swamps what the weak base adds."
- **Section "A weak base titrated with a strong acid":**
  - Turn the titration around: a weak base, B, in the flask and a strong acid in the buret. The flask starts basic, each portion of acid turns some B into HB⁺ (topic 8.4: $\ce{B(aq) + H3O+(aq) -> HB+(aq) + H2O(l)}$, displayed), and the curve falls.
  - The same four stretches, mirrored: B alone; B and HB⁺ together, a buffer region; HB⁺ alone at the equivalence point; leftover H₃O⁺ after it.
  - At the half-equivalence point the moles of B and HB⁺ are equal, so $[\ce{H3O+}] = K_a$ of HB⁺ and the pH equals the p$K_a$ of the conjugate acid, HB⁺. It is the conjugate acid's p$K_a$ that is read from the curve, never a p$K_b$.
  - At the equivalence point the flask holds HB⁺ alone, a weak acid, so the pH is below 7 at 25 °C.
- **Worked example "Methylamine with nitric acid":** 30.0 mL of 0.100 M methylamine, CH₃NH₂, a weak base, is titrated with 0.150 M nitric acid, HNO₃, a strong acid. The p$K_a$ of the methylammonium ion, CH₃NH₃⁺, is 10.64. Find (a) the equivalence volume, (b) the pH at the half-equivalence point and (c) the pH at the equivalence point, at 25 °C.
  1. **(a) Moles decide the volume.** (30.0)(0.100) = 3.00 mmol of CH₃NH₂ needs 3.00 mmol of H₃O⁺: 3.00 ÷ 0.150 = 20.0 mL.
  2. **(b) Halfway is 10.0 mL.** By then 1.50 mmol of CH₃NH₂ has become CH₃NH₃⁺ and 1.50 mmol is left. Equal amounts of the pair, so pH = p$K_a$ of CH₃NH₃⁺ = 10.64.
  3. **(c) React to completion.** At 20.0 mL the table of moles ends with no CH₃NH₂, no H₃O⁺ and 3.00 mmol of CH₃NH₃⁺ (show the table; NO₃⁻ is a spectator).
  4. **Say what is left.** The methylammonium ion alone, a weak acid. Display, split after the arrow:

     $$\ce{CH3NH3+(aq) + H2O(l) <=> CH3NH2(aq) + H3O+(aq)}$$

  5. **Concentration and constant.** The total volume is 50.0 mL, so $[\ce{CH3NH3+}]$ = 3.00 ÷ 50.0 = 0.0600 M. $K_a = 10^{-10.64}$ = 2.29 × 10⁻¹¹.
  6. **ICE table, in M, with $x$ as $[\ce{H3O+}]$** (write HB⁺ for CH₃NH₃⁺ and B for CH₃NH₂; columns HB⁺, B, H₃O⁺; I: 0.0600, 0, 0; C: −x, +x, +x; E: 0.0600 − x, x, x). Display: $\dfrac{x^2}{0.0600} = 2.29 \times 10^{-11}$, so $x$ = 1.17 × 10⁻⁶ M.
  7. **Check.** 1.17 × 10⁻⁶ ÷ 0.0600 × 100% = 0.0020%, far under 5 percent.
  8. **pH.** Here $x$ is $[\ce{H3O+}]$, so pH = −log(1.17 × 10⁻⁶) = 5.93. Below 7, with no nitric acid left over: the conjugate acid did it.

  Place the figure `8-5-weak-base-curve.svg` after the example, with one sentence: here is the whole curve of that titration.

  Note for the writer: do not ask for or state the pH of the methylamine solution before any acid is added as a hand calculation: 0.100 M methylamine fails the small-x check (6.6 percent). The figure's curve starts at 11.81, from the full equation, and the alt text may say "near pH 11.8". At 10.0 mL the full equation gives 10.63, a hundredth under the p$K_a$, because the base's own ionization is not quite negligible there (1.2 percent); the lesson says 10.64, which is what the method gives and what the exam expects, and the figure's label says 10.64.
- **Check 5**, `<Check answer={4}>`: "A pH probe follows a titration at 25 °C. The flask holds 40.0 mL of a 0.0900 M solution of one substance, and the buret holds a 0.150 M solution of another. The reading starts at 10.93, is 8.90 after 12.0 mL, falls steeply through 5.07 at 24.0 mL, and levels off near 1.9 by 30.0 mL. Which statement fits these readings?" Options:
  1. The flask held a weak acid, because the curve has a gently sloping stretch before its steep part
  2. The equivalence point is at 12.0 mL, because the reading there equals a pKa
  3. The pH is below 7 at the equivalence point because strong acid is left over there
  4. The flask held a weak base, and the pKa of its conjugate acid is 8.90

  Why: the pH falls as the titrant goes in, so an acid is being added to a base. The steep fall at 24.0 mL is the equivalence point: the flask held (40.0)(0.0900) = 3.60 mmol, and 24.0 mL of the 0.150 M acid brings 3.60 mmol of H₃O⁺. Half of that volume is 12.0 mL, where the base and its conjugate acid are equal in amount, so the reading there, 8.90, is the p$K_a$ of the conjugate acid. At the equivalence point nothing is left over: the flask holds the conjugate acid alone, a weak acid, and that is why the reading is 5.07 and not 7.00. A strong base at 0.0900 M would have started at pH 12.95 and passed through 7.00 at its equivalence point. The leveling near 1.9 is leftover H₃O⁺. Misses:
  - 1: "A gently sloping stretch shows that something weak is in the flask. Look at which way the pH moves as the titrant goes in."
  - 2: "A pKa is read where half of the substance in the flask has reacted. Is that the point where all of it has reacted?"
  - 3: "At the equivalence point neither reactant is left over. Ask what the flask does hold there and how that ion acts on water."

  Note for the writer: the base is not named, on purpose: it is a weak base whose conjugate acid has p$K_a$ = 8.90, and the readings are computed from that value (10.93, 8.90, 5.07 and 1.89 by the full equation; the by-hand methods give the same). Do not name a real base for it.
- **Section "A curve with two rises":**
  - Some acids have two acidic protons, and a strong base takes them one after the other. To see the pattern at its plainest, this section uses an acid made up for the purpose. Call it H₂A, and give it p$K_{a1}$ = 3.00 and p$K_{a2}$ = 8.00. The lesson says in so many words that H₂A is not a real substance: real acids with two acidic protons behave in the same way, with less tidy numbers. Two displayed equations, each split after the arrow:

    $$\ce{H2A(aq) + OH-(aq) -> HA-(aq) + H2O(l)}$$

    $$\ce{HA-(aq) + OH-(aq) -> A^2-(aq) + H2O(l)}$$

  - The first proton is far more acidic than the second (the two p$K_a$ values are five units apart), so essentially every molecule has lost its first proton before the second ones start to go. The curve shows it: two steep rises, one for each proton. Place the figure `8-5-two-rises.svg` here, with one sentence before it: 20.0 mL of 0.120 M H₂A, titrated with 0.200 M NaOH.
  - How to read such a curve, as a list:
    - **Count the rises.** Each rise marks one proton removed from every molecule. Two rises: two acidic protons.
    - **Read the volumes.** Each proton takes the same moles of OH⁻. The flask holds (20.0)(0.120) = 2.40 mmol of acid, so the first rise is at 2.40 ÷ 0.200 = 12.0 mL and the second at twice that, 24.0 mL.
    - **Name what the flask holds.** Before the first rise: H₂A and HA⁻. At the first rise: nearly all HA⁻. Between the rises: HA⁻ and A²⁻. At the second rise: nearly all A²⁻. After it: A²⁻ and leftover OH⁻. Within a stretch the main form changes at the halfway point: before the first rise it is H₂A until 6.0 mL and HA⁻ after that, and between the rises it is HA⁻ until 18.0 mL and A²⁻ after that.
    - **Find a p$K_a$ at each halfway point.** Halfway to the first rise, at 6.0 mL, H₂A and HA⁻ are very nearly equal in amount, and the pH there is very nearly p$K_{a1}$: the curve reads 3.02. Halfway between the two rises, at 18.0 mL, HA⁻ and A²⁻ are equal in amount, and the pH there is p$K_{a2}$: the curve reads 8.00. So each halfway reading gives one p$K_a$, the first reading the first proton's and the second reading the second proton's. (One clause: the first reading is two hundredths above 3.00 for the reason given in "Halfway there".)
  - "**Beyond the exam:** the concentration of each form of the acid at a point on a curve like this can be calculated, but the exam asks you only to read the curve: how many protons, which forms, which p$K_a$."
  - Note for the writer: every number in this section is read from the figure's curve, which the check script computes from the charge balance with water's ionization included; none is calculated in the lesson, and no concentration appears. The forms: before any base 91 percent of the acid is H₂A; at 6.0 mL it is 49 percent H₂A and 51 percent HA⁻ (which is why the reading there is 3.02 and not 3.00); at each rise more than 99 percent is the one form named; at 18.0 mL the two forms are equal to four figures. None of these percentages goes on the page. Say "nearly all" at the two rises. Do not name a real acid as an example of H₂A, and do not give H₂A a structure. The flask is 20.0 mL of 0.120 M and not the 30.0 mL of 0.0800 M of an earlier draft, because with those amounts the curve's point at 7.0 mL sat on a rounding tie (3.16502); the rises are at 12.0 and 24.0 mL either way.
- **Check 6**, `<Check answer={1}>`: "The acid H₂A of the figure (p$K_{a1}$ = 3.00, p$K_{a2}$ = 8.00) is titrated again. This time the flask holds 1.60 mmol of it, and the buret holds 0.100 M NaOH. Which statement about this titration is right?" Options:
  1. The pH equals pKa2 at 24.0 mL, where HA⁻ and A²⁻ are equal in amount
  2. The pH equals pKa2 at 32.0 mL, where the second proton has left every molecule
  3. At 20.0 mL the main form of the acid is A²⁻, because the first rise is already past
  4. The curve has a single rise, at 16.0 mL, because 1.60 mmol of acid takes 1.60 mmol of OH⁻

  Why: H₂A has two acidic protons, so its curve has two rises. Each proton takes 1.60 mmol of OH⁻, which is 16.0 mL of the 0.100 M base, so the rises are at 16.0 mL and 32.0 mL. Between them the flask holds HA⁻ and A²⁻. Halfway between them, at 24.0 mL, the two are equal in amount, and the reading there is p$K_{a2}$, 8.00. At 32.0 mL the second proton has left every molecule: the flask holds nearly all A²⁻, and the curve is in the middle of its second rise, far above 8. At 20.0 mL, (20.0)(0.100) = 2.00 mmol of OH⁻ has gone in: 1.60 mmol took the first proton and only 0.40 mmol has gone to the second, so 1.20 mmol of HA⁻ is left beside 0.40 mmol of A²⁻, and HA⁻ is still the main form. (The reading that gives p$K_{a1}$ is the one halfway to the first rise, at 8.0 mL.) Misses:
  - 2: "At 32.0 mL the second proton has left every molecule, so the flask holds nearly all one form. What must the flask hold for the pH to equal a pKa?"
  - 3: "Find the millimoles of OH⁻ that each proton takes. By 20.0 mL, how much of the second proton has been removed, and how much HA⁻ is left?"
  - 4: "H₂A has two acidic protons, and OH⁻ takes them one after the other. How much OH⁻ does each of them need?"

  Note for the writer: different amounts from the figure's, on purpose, so that the figure's labels do not answer it; the student has to place the rises and the halfway points first. The Check reads the curve in words: how many acidic protons, which form is the main one at a named volume, which reading gives which p$K_a$. The millimoles in the Why come from the stoichiometry alone; no concentration and no pH is calculated. The question gives no flask volume, and none is needed: the reading at 24.0 mL is 8.00 for any starting volume from 16 mL to 100 mL (the check script tries seven). Answer positions: 2, 3, 4, 1 for Checks 2, 3, 5 and 6.
- **Trap:** **Taking pH 7 for every equivalence point** (of the titrations in this unit, it is 7.00 at 25 °C only for a strong acid with a strong base; a weak acid ends above 7 and a weak base below). **Halving the wrong volume** (the half-equivalence point is at half of the equivalence volume, not half of the flask's volume or of the total). **Letting the acid's strength move the equivalence point** (moles and the balanced equation set the volume; strength sets the pH). **Dividing by the volume of the flask alone** (every concentration after mixing uses the total volume). **Reading a p$K_a$ off a strong acid's curve** (there is no conjugate pair in the flask to be equal). **Using a p$K_b$ at a weak base's half-equivalence point** (the reading there is the p$K_a$ of the conjugate acid). **Reading a p$K_a$ at a rise** (on a curve with two rises, each p$K_a$ is read halfway to its rise, where two forms are equal in amount; at a rise the flask holds nearly all one form). **Stopping at the pOH** past the equivalence point of an acid.
- **Key points:** a titration curve is pH against volume of titrant added, and every point on it is a flask of topic 8.4: react in moles, see what is left, find the pH; the equivalence volume comes from moles and the balanced equation, the same for a strong acid and a weak one; a weak acid's curve has four stretches, set in turn by the weak acid alone, by both members of the pair, by the conjugate base alone and by leftover OH⁻; at the half-equivalence point, at half of the equivalence volume, the two members of the pair are equal in amount and pH = p$K_a$, which is how a p$K_a$ is read from a curve; at the equivalence point the pH is above 7 for a weak acid titrated with a strong base, below 7 for a weak base titrated with a strong acid, and, of the titrations in this unit, 7.00 at 25 °C only when both are strong; a curve with two rises belongs to an acid with two acidic protons, the second rise comes at twice the volume of the first, the pH halfway to the first rise is the first p$K_a$, and the pH halfway between the rises is the second.

**Figures**

Both graphs share one frame: viewBox 0 0 480 400, font-size 18, a plot area from x = 70 to x = 450 and from y = 30 (pH 14) to y = 330 (pH 0), so that y = 330 − pH × 300 ÷ 14. The axes are two ink lines, at x = 70 and at y = 330. The pH axis has ticks and numbers at 0, 7 and 14 (numbers right-aligned at x = 60) and the title "pH" at about (28, 186). The curve is a polyline in ink, 3 units wide, with round joins, through the listed points and no others. Nothing is sketched.

- **`8-5-weak-base-curve.svg`**: 30.0 mL of 0.100 M methylamine titrated with 0.150 M HNO₃. The volume axis runs from 0 to 30 mL, x = 70 + volume × 380 ÷ 30, with ticks and numbers at 0, 10, 20 and 30 and the title "HNO₃ added (mL)" centered under it at y = 388.
  - The curve passes through these points (volume in mL, then pH; every 1 mL, and every 0.1 mL from 19.0 to 21.0), computed from the full equation with the p$K_a$ of CH₃NH₃⁺ = 10.64:

    ```
    0.0 11.81, 1.0 11.63, 2.0 11.46, 3.0 11.32, 4.0 11.20, 5.0 11.08, 6.0 10.98, 7.0 10.89, 8.0 10.80, 9.0 10.72, 10.0 10.63, 11.0 10.54, 12.0 10.46, 13.0 10.36, 14.0 10.27, 15.0 10.16, 16.0 10.03, 17.0 9.88, 18.0 9.68, 19.0 9.36, 19.1 9.31, 19.2 9.26, 19.3 9.20, 19.4 9.13, 19.5 9.05, 19.6 8.95, 19.7 8.82, 19.8 8.64, 19.9 8.34, 20.0 5.93, 20.1 3.52, 20.2 3.22, 20.3 3.05, 20.4 2.92, 20.5 2.83, 20.6 2.75, 20.7 2.68, 20.8 2.63, 20.9 2.58, 21.0 2.53, 22.0 2.24, 23.0 2.07, 24.0 1.95, 25.0 1.87, 26.0 1.79, 27.0 1.73, 28.0 1.68, 29.0 1.64, 30.0 1.60
    ```

    The same points in the figure's coordinates, for the polyline's `points` attribute:

    ```
    70.0,77.0 82.7,80.9 95.3,84.4 108.0,87.4 120.7,90.1 133.3,92.5 146.0,94.6 158.7,96.6 171.3,98.5 184.0,100.4 196.7,102.2 209.3,104.0 222.0,105.9 234.7,107.9 247.3,110.0 260.0,112.3 272.7,115.0 285.3,118.2 298.0,122.5 310.7,129.5 311.9,130.5 313.2,131.6 314.5,132.9 315.7,134.4 317.0,136.2 318.3,138.3 319.5,141.0 320.8,144.8 322.1,151.3 323.3,202.9 324.6,254.5 325.9,260.9 327.1,264.7 328.4,267.3 329.7,269.4 330.9,271.1 332.2,272.5 333.5,273.7 334.7,274.8 336.0,275.8 348.7,282.0 361.3,285.6 374.0,288.1 386.7,290.0 399.3,291.6 412.0,292.8 424.7,293.9 437.3,294.8 450.0,295.7
    ```

  - A dashed line in the secondary color across the plot at pH 7 (y = 180.0).
  - The half-equivalence point: a hollow circle (radius 7, background fill, ink outline) on the curve at 10.0 mL, (196.7, 102.2), with a dashed vertical guide in the secondary color from it down to the axis. Its label, two lines starting at x = 206: "Halfway" at y = 44 and "pH = pKa = 10.64" at y = 66. (The curve itself is at 10.63 there; the difference is a fifth of a unit on the drawing.)
  - The equivalence point: a filled ink diamond (half-diagonal 8) on the curve at 20.0 mL, (323.3, 202.9), with a dashed vertical guide down to the axis. Its label, two lines starting at x = 338: "Equivalence" at y = 216 and "pH 5.93" at y = 238.
  - The two marked points differ in shape (hollow circle, filled diamond). No label touches the curve: check it in the rendering, and move a label a few units if it does.
  - Text in the figure, thirteen pieces: "pH", "0", "7", "14"; "0", "10", "20", "30"; "HNO₃ added (mL)"; "Halfway", "pH = pKa = 10.64", "Equivalence", "pH 5.93".
  - Alt: "A titration curve: pH from 0 to 14 against the volume of nitric acid added, from 0 to 30 mL, for a methylamine solution. The curve starts near pH 11.8 and falls gently. A hollow circle at 10 mL is labeled halfway, pH equals pKa equals 10.64. The curve drops steeply at 20 mL, where a diamond is labeled equivalence, pH 5.93, below a dashed line at pH 7. After that it levels off near pH 2."
  - Caption: "A weak base titrated with a strong acid. The curve falls, the pH halfway to the equivalence point is the pKa of the conjugate acid, and the equivalence point is below pH 7."
- **`8-5-two-rises.svg`**: 20.0 mL of 0.120 M H₂A, the made-up acid with p$K_{a1}$ = 3.00 and p$K_{a2}$ = 8.00, titrated with 0.200 M NaOH. The volume axis runs from 0 to 36 mL, x = 70 + volume × 380 ÷ 36, with ticks and numbers at 0, 12, 24 and 36 and the title "NaOH added (mL)" centered under it at y = 388.
  - The curve passes through these points (every 1 mL, and every 0.1 mL from 11.0 to 13.0 and from 23.0 to 25.0), computed from the charge balance of an acid with two protons, water's ionization included, with $K_{a1}$ = 10⁻³·⁰⁰ and $K_{a2}$ = 10⁻⁸·⁰⁰:

    ```
    0.0 1.98, 1.0 2.20, 2.0 2.41, 3.0 2.58, 4.0 2.73, 5.0 2.88, 6.0 3.02, 7.0 3.16, 8.0 3.31, 9.0 3.49, 10.0 3.71, 11.0 4.05, 11.1 4.10, 11.2 4.15, 11.3 4.21, 11.4 4.28, 11.5 4.37, 11.6 4.46, 11.7 4.59, 11.8 4.76, 11.9 5.03, 12.0 5.50, 12.1 5.98, 12.2 6.24, 12.3 6.42, 12.4 6.54, 12.5 6.64, 12.6 6.72, 12.7 6.79, 12.8 6.85, 12.9 6.91, 13.0 6.96, 14.0 7.30, 15.0 7.52, 16.0 7.70, 17.0 7.85, 18.0 8.00, 19.0 8.15, 20.0 8.30, 21.0 8.48, 22.0 8.70, 23.0 9.04, 23.1 9.09, 23.2 9.14, 23.3 9.21, 23.4 9.28, 23.5 9.36, 23.6 9.46, 23.7 9.58, 23.8 9.74, 23.9 9.99, 24.0 10.37, 24.1 10.74, 24.2 10.98, 24.3 11.14, 24.4 11.26, 24.5 11.36, 24.6 11.43, 24.7 11.50, 24.8 11.55, 24.9 11.60, 25.0 11.65, 26.0 11.94, 27.0 12.11, 28.0 12.22, 29.0 12.31, 30.0 12.38, 31.0 12.44, 32.0 12.49, 33.0 12.53, 34.0 12.57, 35.0 12.60, 36.0 12.63
    ```

    The same points in the figure's coordinates:

    ```
    70.0,287.6 80.6,282.8 91.1,278.5 101.7,274.7 112.2,271.4 122.8,268.3 133.3,265.3 143.9,262.3 154.4,259.0 165.0,255.3 175.6,250.6 186.1,243.3 187.2,242.2 188.2,241.0 189.3,239.7 190.3,238.2 191.4,236.5 192.4,234.3 193.5,231.6 194.6,228.0 195.6,222.2 196.7,212.1 197.7,201.9 198.8,196.2 199.8,192.5 200.9,189.8 201.9,187.7 203.0,185.9 204.1,184.4 205.1,183.1 206.2,181.9 207.2,180.9 217.8,173.5 228.3,168.8 238.9,165.0 249.4,161.7 260.0,158.6 270.6,155.4 281.1,152.1 291.7,148.3 302.2,143.6 312.8,136.3 313.8,135.2 314.9,134.0 315.9,132.7 317.0,131.2 318.1,129.5 319.1,127.4 320.2,124.7 321.2,121.2 322.3,115.9 323.3,107.8 324.4,99.8 325.4,94.7 326.5,91.2 327.6,88.7 328.6,86.7 329.7,85.0 330.7,83.6 331.8,82.4 332.8,81.3 333.9,80.4 344.4,74.2 355.0,70.6 365.6,68.1 376.1,66.2 386.7,64.7 397.2,63.5 407.8,62.4 418.3,61.5 428.9,60.7 439.4,60.0 450.0,59.3
    ```

  - Landmarks on that curve: 1.98 at the start, 3.02 halfway to the first rise (6.0 mL), 5.50 at the first rise (12.0 mL), 8.00 halfway between the rises (18.0 mL), 10.37 at the second rise (24.0 mL) and 12.63 at 36.0 mL. Within 1 mL either side of each rise the curve goes from 4.05 to 6.96 and from 9.04 to 11.65. No point is within 0.0001 of a rounding tie; the nearest is 12.8 mL (6.85485, shown as 6.85).
  - Two dashed vertical guides in the secondary color, from y = 30 to y = 330, at 12.0 mL (x = 196.7) and 24.0 mL (x = 323.3): they cut the plot into three stretches.
  - A label in each stretch, three centered lines each, placed where the curve is not. First stretch, centered at x = 133: "H₂A" at y = 60, "and" at y = 82, "HA⁻" at y = 104 (the curve is near the bottom there). Second stretch, centered at x = 260: "HA⁻" at y = 60, "and" at y = 82, "A²⁻" at y = 104. Third stretch, centered at x = 387: "A²⁻" at y = 200, "and" at y = 222, "OH⁻" at y = 244 (the curve is near the top there).
  - The two halfway points, each a hollow circle (radius 7, background fill, ink outline) on the curve with its label below the curve: at 6.0 mL, (133.3, 265.3), the label "pH 3.02" centered at x = 133, y = 310; at 18.0 mL, (260.0, 158.6), the label "pH 8.00" centered at x = 260, y = 204. No label touches the curve: check it in the rendering, and move a label a few units if it does.
  - No concentration appears anywhere on the figure.
  - Text in the figure, twenty pieces: "pH", "0", "7", "14"; "0", "12", "24", "36"; "NaOH added (mL)"; the nine label lines; "pH 3.02", "pH 8.00".
  - Alt: "A titration curve for H₂A, an acid with two acidic protons, titrated with sodium hydroxide: pH from 0 to 14 against volume added, from 0 to 36 mL. The curve starts near pH 2 and has two steep rises, at 12 mL and at 24 mL, each marked by a dashed line. The stretch before the first rise is labeled H₂A and HA⁻, the stretch between the rises HA⁻ and A²⁻, and the stretch after the second rise A²⁻ and OH⁻. A circle on the curve halfway to the first rise, at 6 mL, is labeled pH 3.02, and a circle halfway between the rises, at 18 mL, is labeled pH 8.00."
  - Caption: "Two rises, so two acidic protons. Each stretch is labeled with the forms of the acid that the flask holds there, and the pH at each halfway point gives one of the acid's two pKa values, 3.00 and 8.00 (the first to within 0.02)."

**Diagram data** (for the builder of `src/lib/titration-curve.ts` and `<TitrationCurve />`, and for lesson 8.7, which places the block again; the design's section 6.1 fixes what the diagram shows)

- **Constants:**

  | Constant | Value in the module | Source |
  |---|---|---|
  | The flask | 20.0 mL of 0.150 M acid: 3,000 micromoles | `src/lib/titration.ts`, `FLASK` (lesson 4.6's diagram) |
  | The titrant | 0.200 M NaOH: 200 micromoles of OH⁻ per mL | `src/lib/titration.ts`, `BASE_MICROMOLES_PER_ML` |
  | Lactic acid | weak, p$K_a$ = 3.86. In the module $K_a$ is 10⁻³·⁸⁶ exactly, that is `10 ** -3.86` = 1.3804 × 10⁻⁴, computed from the p$K_a$; the module never holds 1.38 × 10⁻⁴ or 1.4 × 10⁻⁴ as a constant. Every explorer number in this brief follows from that value: 8.40 at the equivalence point and bromocresol green from 6.96 mL to 14.58 mL (with 1.4 × 10⁻⁴ they would show as 8.39 and 7.01 mL) | the p$K_a$ is the design's (its values table, "8.5 explorer"), the value of standard tables at 25 °C; sure |
  | Hydrobromic acid | strong: fully ionized, no $K_a$ | lesson 4.2's list |
  | $K_w$ | 1.0 × 10⁻¹⁴ (25 °C) | the design |
  | Bromocresol green | yellow below pH 3.8, blue above 5.4 | the design; sure of the range |
  | Bromothymol blue | yellow below pH 6.0, blue above 7.6 | lesson 4.6 and the design; sure |
  | Thymol blue | second change: yellow below pH 8.0, blue above 9.6. First change: red below pH 1.2, yellow above 2.8 | the design for the second change (sure); the first change is from memory, sure of the range, **(verify)** since the design does not list it |

- **Controls:**

  | Control | Choices or range | Step | Starts at |
  |---|---|---|---|
  | Acid in the flask (radios) | lactic acid (weak); hydrobromic acid (strong) | | lactic acid |
  | Volume of NaOH added (slider) | 0.0 mL to 30.0 mL | 0.5 mL | 0.0 mL |
  | Indicator (radios) | none; bromocresol green; bromothymol blue; thymol blue | | none |

  That is 61 × 2 × 4 = 488 states. The equivalence point is at 15.0 mL for either acid and the half-equivalence point at 7.5 mL; both are slider settings.
- **The model.**
  - **Amounts** are kept in whole micromoles, as in `titration.ts`: OH⁻ added = 200 × volume; acid left = the larger of 3,000 − added and 0; acid reacted = the smaller of added and 3,000; OH⁻ in excess = the larger of added − 3,000 and 0. They are shown in mmol to two decimal places and are exact.
  - **pH** comes from the shared solver, `src/lib/acid-base.ts` (lesson 8.3's brief), given concentrations in the total volume, 20.0 mL + volume added. With $h = [\ce{H3O+}]$, $C$ = 3,000 micromoles ÷ total volume (the acid in all its forms) and $[\ce{Na+}]$ = OH⁻ added ÷ total volume, the one equation is the balance of charge:
    - lactic acid: $h + [\ce{Na+}] = \dfrac{K_w}{h} + \dfrac{C\,K_a}{K_a + h}$
    - hydrobromic acid: $h + [\ce{Na+}] = \dfrac{K_w}{h} + C$ (here $C$ is $[\ce{Br-}]$)

    No stretch of the curve has its own formula, so there is no seam at the equivalence point. pH = −log $h$, shown to two decimal places, rounded half up from the unrounded value.
  - **The curve drawn** is the same function at every 0.1 mL from 0.0 to 30.0 mL and at every 0.01 mL from 14.5 to 15.5 mL (the slider's 61 settings are among them). The other acid's curve is drawn faint and dashed. Axes: pH 0 to 14, volume 0 to 30 mL. Guides: a vertical line at 15.0 mL for either acid; for lactic acid one more at 7.5 mL, and the buffer region marked along the curve from 1.36 mL to 13.64 mL (15 ÷ 11 and 150 ÷ 11 mL, where the two forms stand at 1 to 10 and 10 to 1).
  - **The bars, "What is in the flask"**, in mmol. For lactic acid, three: "Lactic acid left", "Lactate ion formed" (the acid reacted) and "OH⁻ left over". For hydrobromic acid, two: "H₃O⁺ left" and "OH⁻ left over"; the middle place carries the words "Br⁻ and Na⁺ are spectators" and no bar, because Br⁻ is not formed by the titration: all 3.00 mmol of it is there from the start.
  - **An indicator's band** is a hatched band across the graph over its pH range (for thymol blue, its second range, 8.0 to 9.6), labeled with its two colors in words ("yellow below, blue above"). The band is told from the buffer-region mark by its hatching, not by color.
  - **An indicator's color** at a setting comes from the unrounded pH: below a range, the acid color; from the lower end to the upper end, both included, the changing color; above it, the base color. Bromocresol green and bromothymol blue: yellow, green, blue. Thymol blue: red below 1.2, orange from 1.2 to 2.8, yellow above 2.8 and below 8.0, green from 8.0 to 9.6, blue above 9.6. (Without the first change the readout would call thymol blue yellow in hydrobromic acid at pH 0.82, where it is red.)
  - **The volumes between which an indicator changes on a curve** are the two volumes at which that curve's pH equals the lower and the upper end of the range (for thymol blue, of its second range), found by bisection on the volume, as a continuous quantity, to better than 0.001 mL, and shown to 0.01 mL.
- **Readout sentences.** Amounts and pH are filled in from the state. The starting state reads: "No base yet. The flask holds 3.00 mmol of lactic acid, a weak acid, and nothing else that matters. pH 2.35."

  | Kind of state | Settings | Sentence |
  |---|---|---|
  | lactic, start | 0.0 mL | "No base yet. The flask holds 3.00 mmol of lactic acid, a weak acid, and nothing else that matters. pH 2.35." |
  | lactic, early | 0.5, 1.0 mL | "2.90 mmol of lactic acid and 0.10 mmol of lactate ion. The acid still outweighs the lactate by more than ten to one. pH 2.59." |
  | lactic, buffer | 1.5 to 13.5 mL, except 7.5 | "Buffer region: 2.00 mmol of lactic acid and 1.00 mmol of lactate ion, both members of the pair. pH 3.56." |
  | lactic, half | 7.5 mL | "Half-equivalence point: 1.50 mmol of lactic acid and 1.50 mmol of lactate ion. Equal amounts, so pH = pKa = 3.86." |
  | lactic, late | 14.0, 14.5 mL | "0.10 mmol of lactic acid and 2.90 mmol of lactate ion. The lactate now outweighs the acid by more than ten to one. pH 5.32." |
  | lactic, equivalence | 15.0 mL | "Equivalence point: all 3.00 mmol of the acid has reacted. The flask holds lactate ion alone, a weak base, so the pH is above 7: 8.40." |
  | hydrobromic, start | 0.0 mL | "No base yet. The flask holds 3.00 mmol of H₃O⁺ from hydrobromic acid, a strong acid. pH 0.82." |
  | hydrobromic, before | 0.5 to 14.5 mL | "1.50 mmol of H₃O⁺ is left, and it sets the pH: 1.26." |
  | hydrobromic, equivalence | 15.0 mL | "Equivalence point: neither H₃O⁺ nor OH⁻ is left over. The flask holds Na⁺, Br⁻ and water. pH 7.00 at 25 °C." |
  | either acid, past | 15.5 to 30.0 mL | "Past the equivalence point: 0.10 mmol of OH⁻ is left over, and it sets the pH: 11.45." |

  With an indicator chosen, one more sentence follows, in one of these forms:
  - a plain color: "Bromocresol green is yellow here. On this curve its color changes between 6.96 mL and 14.58 mL."
  - a changing color: "Bromocresol green is green here, partway from yellow to blue. On this curve its color changes between 6.96 mL and 14.58 mL."
  - the two volumes equal when shown to 0.01 mL (bromothymol blue on hydrobromic acid): "On this curve its color changes within 0.01 mL of 15.00 mL."
  - thymol blue: "Thymol blue is red here. On this curve its second change, from yellow to blue, comes between 15.00 mL and 15.01 mL." (orange is "partway from red to yellow").

  The "early", "buffer" and "late" kinds are told apart on the whole micromoles: "early" when ten times the lactate is less than the acid, "late" when ten times the acid is less than the lactate. The half-equivalence sentence prints the p$K_a$, and the solver's pH there is 3.86 too (3.8622), so the sentence agrees with the graph.
- **Every state's pH** (the module's values, each also found by a second method in the check script):

| Base added (mL) | pH, lactic acid | pH, hydrobromic acid |
|---|---|---|
| 0.0 | 2.35 | 0.82 |
| 0.5 | 2.59 | 0.85 |
| 1.0 | 2.79 | 0.88 |
| 1.5 | 2.94 | 0.90 |
| 2.0 | 3.07 | 0.93 |
| 2.5 | 3.18 | 0.95 |
| 3.0 | 3.27 | 0.98 |
| 3.5 | 3.35 | 1.01 |
| 4.0 | 3.43 | 1.04 |
| 4.5 | 3.50 | 1.07 |
| 5.0 | 3.56 | 1.10 |
| 5.5 | 3.63 | 1.13 |
| 6.0 | 3.69 | 1.16 |
| 6.5 | 3.75 | 1.19 |
| 7.0 | 3.80 | 1.23 |
| 7.5 | 3.86 | 1.26 |
| 8.0 | 3.92 | 1.30 |
| 8.5 | 3.98 | 1.34 |
| 9.0 | 4.04 | 1.38 |
| 9.5 | 4.10 | 1.43 |
| 10.0 | 4.16 | 1.48 |
| 10.5 | 4.23 | 1.53 |
| 11.0 | 4.30 | 1.59 |
| 11.5 | 4.38 | 1.65 |
| 12.0 | 4.46 | 1.73 |
| 12.5 | 4.56 | 1.81 |
| 13.0 | 4.67 | 1.92 |
| 13.5 | 4.82 | 2.05 |
| 14.0 | 5.01 | 2.23 |
| 14.5 | 5.32 | 2.54 |
| 15.0 | 8.40 | 7.00 |
| 15.5 | 11.45 | 11.45 |
| 16.0 | 11.74 | 11.74 |
| 16.5 | 11.91 | 11.91 |
| 17.0 | 12.03 | 12.03 |
| 17.5 | 12.12 | 12.12 |
| 18.0 | 12.20 | 12.20 |
| 18.5 | 12.26 | 12.26 |
| 19.0 | 12.31 | 12.31 |
| 19.5 | 12.36 | 12.36 |
| 20.0 | 12.40 | 12.40 |
| 20.5 | 12.43 | 12.43 |
| 21.0 | 12.47 | 12.47 |
| 21.5 | 12.50 | 12.50 |
| 22.0 | 12.52 | 12.52 |
| 22.5 | 12.55 | 12.55 |
| 23.0 | 12.57 | 12.57 |
| 23.5 | 12.59 | 12.59 |
| 24.0 | 12.61 | 12.61 |
| 24.5 | 12.63 | 12.63 |
| 25.0 | 12.65 | 12.65 |
| 25.5 | 12.66 | 12.66 |
| 26.0 | 12.68 | 12.68 |
| 26.5 | 12.69 | 12.69 |
| 27.0 | 12.71 | 12.71 |
| 27.5 | 12.72 | 12.72 |
| 28.0 | 12.73 | 12.73 |
| 28.5 | 12.75 | 12.75 |
| 29.0 | 12.76 | 12.76 |
| 29.5 | 12.77 | 12.77 |
| 30.0 | 12.78 | 12.78 |

- **Indicators over the two curves** (colors at the slider's settings, and the volumes between which the color changes, shown to 0.01 mL; for thymol blue the volumes are those of its second change):

| Indicator | Acid | Color at each setting | Changes between |
|---|---|---|---|
| Bromocresol green | lactic acid | yellow 0.0 to 6.5 mL; green 7.0 to 14.5 mL; blue 15.0 to 30.0 mL | 6.96 and 14.58 mL |
| Bromocresol green | hydrobromic acid | yellow 0.0 to 14.5 mL; blue 15.0 to 30.0 mL | 14.97 and 15.00 mL |
| Bromothymol blue | lactic acid | yellow 0.0 to 14.5 mL; blue 15.0 to 30.0 mL | 14.89 and 15.00 mL |
| Bromothymol blue | hydrobromic acid | yellow 0.0 to 14.5 mL; green 15.0 mL; blue 15.5 to 30.0 mL | 15.00 and 15.00 mL |
| Thymol blue | lactic acid | orange 0.0 to 1.0 mL; yellow 1.5 to 14.5 mL; green 15.0 mL; blue 15.5 to 30.0 mL | 15.00 and 15.01 mL |
| Thymol blue | hydrobromic acid | red 0.0 to 6.5 mL; orange 7.0 to 14.5 mL; yellow 15.0 mL; blue 15.5 to 30.0 mL | 15.00 and 15.01 mL |

  Unrounded, the pairs of volumes are 6.9614 and 14.5788; 14.9723 and 14.9993; 14.8919 and 14.9973; 14.9998 and 15.0001; 14.9991 and 15.0069; 15.0002 and 15.0070 mL. Thymol blue's first change (not drawn as a band) spans 6.61 mL to 14.72 mL on the hydrobromic acid curve, and ends at 1.04 mL on the lactic acid curve, which starts inside it.
- **Limits, checked over all states:**
  - The pH rises at every step of the slider, for both acids. The lowest pH is 0.82 (hydrobromic acid, 0.0 mL) and the highest is 12.78 (30.0 mL, either acid), so an axis from 0 to 14 holds every state. Lactic acid starts at 2.35.
  - The lactic acid curve lies above the hydrobromic acid curve at every setting up to 15.0 mL. From 15.5 mL on, the two agree to two decimal places at every setting (they differ by less than 0.000001), so "the two curves are one curve" is true as shown.
  - The largest change in one step of the slider is at the equivalence point. From 14.5 mL to 15.5 mL the pH rises by 6.13 for lactic acid and by 8.91 for hydrobromic acid.
  - Acid left plus acid reacted is 3.00 mmol in every state, and acid left and OH⁻ in excess are never both above zero.
  - The buffer-region sentence is used for 1.5 mL to 13.5 mL (without 7.5 mL), where the two forms stand between 1 to 9 and 9 to 1. The settings 0.5, 1.0, 14.0 and 14.5 mL lie outside 1 to 10 and 10 to 1 and get the "early" and "late" sentences.
  - No state's pH lies on an end of an indicator's range, and in every state the pH as shown (two decimal places) is on the same side of each end as the unrounded pH, so a readout never names a color that its own pH contradicts. The nearest case is lactic acid at 7.0 mL with bromocresol green: pH 3.8045, shown as 3.80, at the lower end of the range, and green.
  - **Three states sit next to a rounding tie**, each 0.00006 to 0.00007 from it: 17.5 mL for either acid (0.50 mmol of OH⁻ in 37.5 mL, pH 12.12494, shows 12.12); hydrobromic acid at 1.0 mL (2.80 mmol of H₃O⁺ in 21.0 mL, pH 0.87506, shows 0.88); lactic acid at 13.5 mL (pH 4.81507, shows 4.82). The solver must be accurate to better than 0.00005 of a pH unit there, and unit tests should pin 12.12, 0.88 and 4.82. No other state is within 0.0001 of a tie; 16.0 and 16.5 mL (11.74473, 11.91483) are within 0.0003.
  - No crossing volume is on a rounding tie at 0.01 mL.
- **Worked states** for unit tests. The first twelve are the states the lesson's text walks through. The three states next to a rounding tie are all here: 17.5 mL (both acids), lactic acid at 13.5 mL and hydrobromic acid at 1.0 mL. "Reacted" is the lactate ion formed, or for hydrobromic acid the H₃O⁺ neutralized.

| Acid | Base (mL) | Indicator | pH | Acid left (mmol) | Reacted (mmol) | OH⁻ in excess (mmol) | Kind of state | Indicator's color |
|---|---|---|---|---|---|---|---|---|
| lactic | 0.0 | none | 2.35 | 3.00 | 0.00 | 0.00 | start | — |
| lactic | 7.5 | none | 3.86 | 1.50 | 1.50 | 0.00 | half | — |
| lactic | 5.0 | none | 3.56 | 2.00 | 1.00 | 0.00 | buffer | — |
| lactic | 10.0 | none | 4.16 | 1.00 | 2.00 | 0.00 | buffer | — |
| lactic | 14.5 | none | 5.32 | 0.10 | 2.90 | 0.00 | late | — |
| lactic | 15.0 | none | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | — |
| lactic | 15.5 | none | 11.45 | 0.00 | 3.00 | 0.10 | past | — |
| hydrobromic | 0.0 | none | 0.82 | 3.00 | 0.00 | 0.00 | start | — |
| hydrobromic | 7.5 | none | 1.26 | 1.50 | 1.50 | 0.00 | before | — |
| hydrobromic | 14.5 | none | 2.54 | 0.10 | 2.90 | 0.00 | before | — |
| hydrobromic | 15.0 | none | 7.00 | 0.00 | 3.00 | 0.00 | equivalence | — |
| hydrobromic | 15.5 | none | 11.45 | 0.00 | 3.00 | 0.10 | past | — |
| lactic | 7.0 | bromocresol green | 3.80 | 1.60 | 1.40 | 0.00 | buffer | green |
| lactic | 6.5 | bromocresol green | 3.75 | 1.70 | 1.30 | 0.00 | buffer | yellow |
| lactic | 15.0 | bromocresol green | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | blue |
| lactic | 15.0 | thymol blue | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | green |
| lactic | 0.0 | thymol blue | 2.35 | 3.00 | 0.00 | 0.00 | start | orange |
| hydrobromic | 0.0 | thymol blue | 0.82 | 3.00 | 0.00 | 0.00 | start | red |
| hydrobromic | 15.0 | bromothymol blue | 7.00 | 0.00 | 3.00 | 0.00 | equivalence | green |
| lactic | 15.0 | bromothymol blue | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | blue |
| lactic | 0.5 | none | 2.59 | 2.90 | 0.10 | 0.00 | early | — |
| lactic | 1.5 | none | 2.94 | 2.70 | 0.30 | 0.00 | buffer | — |
| lactic | 13.5 | none | 4.82 | 0.30 | 2.70 | 0.00 | buffer | — |
| lactic | 14.0 | none | 5.01 | 0.20 | 2.80 | 0.00 | late | — |
| lactic | 18.0 | none | 12.20 | 0.00 | 3.00 | 0.60 | past | — |
| lactic | 17.5 | none | 12.12 | 0.00 | 3.00 | 0.50 | past | — |
| hydrobromic | 17.5 | none | 12.12 | 0.00 | 3.00 | 0.50 | past | — |
| hydrobromic | 30.0 | none | 12.78 | 0.00 | 3.00 | 3.00 | past | — |
| lactic | 30.0 | none | 12.78 | 0.00 | 3.00 | 3.00 | past | — |
| hydrobromic | 1.0 | none | 0.88 | 2.80 | 0.20 | 0.00 | before | — |

- **Numbers the lessons quote from the explorer** (lesson 8.5's list above, and lesson 8.7): 2.35, 3.86, 3.56, 4.16, 5.32, 8.40 and 11.45 for lactic acid; 0.82, 1.26, 2.54, 7.00 and 11.45 for hydrobromic acid; bromocresol green from 6.96 mL to 14.58 mL (a span of 7.6 mL) on the lactic acid curve and from 14.97 mL to 15.00 mL on the hydrobromic acid curve; bromothymol blue from 14.89 mL to 15.00 mL on the lactic acid curve; thymol blue from 15.00 mL to 15.01 mL on both. After the code review, compare each of these sentences with the module again.
- **How it differs from the Unit 4 diagram:** `Titration.svelte` plots the acidic protons still to be neutralized, a straight line, and shows no pH; `titration.ts` and `Titration.svelte` are not changed. This explorer's slider stops at 30.0 mL (the Unit 4 one runs to 40 mL) and starts at 0.0 mL.

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; sure |
| p$K_a$ of lactic acid, HC₃H₅O₃ | 3.86 ($K_a$ = 1.38 × 10⁻⁴) | the design; sure |
| $K_b$ of the lactate ion | 7.24 × 10⁻¹¹ (7.2 × 10⁻¹¹ to two figures) | calculated on the page |
| p$K_a$ of propanoic acid, HC₃H₅O₂ | 4.87 | the design; sure (tables give 4.87 or 4.88) |
| $K_b$ of the propanoate ion | 7.4 × 10⁻¹⁰ | calculated, in Check 3's explanation |
| p$K_a$ of the methylammonium ion, CH₃NH₃⁺ | 10.64 ($K_a$ = 2.29 × 10⁻¹¹; $K_b$ of methylamine 4.4 × 10⁻⁴, not printed) | the design; fairly sure: tables give 10.62 to 10.66 **(verify)** |
| p$K_a$ of the conjugate acid of Check 5's unnamed base | 8.90 | made up for the Check and said to be so in its note; no real base is named |
| p$K_{a1}$ and p$K_{a2}$ of H₂A, the acid of the last section | 3.00 and 8.00 | made up for the purpose, and said to be so on the page; not a reference value. No real acid is named for it |

| Bromocresol green | pH 3.8 to 5.4, yellow to blue | the design; sure |
| Bromothymol blue | pH 6.0 to 7.6, yellow to blue | lesson 4.6 and the design; sure |
| Thymol blue, second change | pH 8.0 to 9.6, yellow to blue | the design; sure |
| Thymol blue, first change | pH 1.2 to 2.8, red to yellow | from memory; sure of the range **(verify, since the design does not list it)** |
| Hydrobromic acid, nitric acid | strong acids | lesson 4.2's list |
| NaOH, KOH | strong bases | lesson 4.2's list |

No atomic mass is used. Propanoic acid's p$K_a$ is given as 4.87 here and in lesson 8.10; no lesson of this group gives its $K_a$.

**Check script:** `scratchpad/unit8/checks/8-5.py`. It recomputes every number above; solves all 122 pH states of the explorer by bisection on the charge balance and again by a second method (bisection on the pH for lactic acid, the quadratic formula for hydrobromic acid); checks the limits over all states, the indicator colors and crossing volumes, the worked states, the three near ties (17.5 mL, hydrobromic acid at 1.0 mL, lactic acid at 13.5 mL), where the by-hand pH and the explorer's differ, and every explorer number the lesson quotes; computes every point of the two figures' curves and their coordinates (the H₂A curve by two methods, with the share of each form at each landmark); and checks each slip, message and option against this file. `python3 8-5.py --emit` prints the generated tables and point lists.

**Notes for the writer**

- H₃O⁺ everywhere, with water in the equation; a single arrow for each reaction with OH⁻ or H₃O⁺ from a strong base or strong acid; a double arrow for an ion reacting with water. State symbols on every term.
- "Equivalence point" and "endpoint" exactly as lesson 4.6 defines them. This lesson says "equivalence point" throughout and uses "endpoint" only if it speaks of an indicator's color change. "Half-equivalence point" and "buffer region" are this lesson's two new terms. Do not write "midpoint", "halfway point" as a term, "region" for a stretch of the curve, or "inflection".
- Every by-hand pH goes through moles first: the table of moles (Before, Change, After, in mmol), then the method for what is left. Never $M_aV_a = M_bV_b$.
- Where the lesson quotes the explorer, it quotes the explorer's number. Of the numbers the lesson quotes, the only one that differs from the by-hand value is the start of the lactic acid curve (2.35 against the shortcut's 2.34), and the list says so. Do not quote any other buffer-region setting as "the same by hand": at 13.5 mL and at most settings below 7.0 mL (5.0 mL is an exception) the by-hand value is lower by 0.01 or more (2.91 against 2.94 at 1.5 mL).
- For a weak base, the half-equivalence reading is the p$K_a$ of the conjugate acid. The lesson never writes p$K_b$.
- The lesson does not explain an indicator (a weak acid with two colored forms, a range of about two pH units): that is topic 8.7. It says only that a useful indicator changes color on the steep part of the curve.
- Bromothymol blue is the indicator of lesson 4.6: yellow in acid, blue in base, green on the way. Thymol blue changes twice; the lesson says so in one sentence and gives no numbers for the first change.
- The polyprotic section reads the curve in words, on an acid the lesson calls H₂A and says is made up. No pH on it is calculated in the lesson, and no Check asks for a concentration or a pH along it. No real acid with two acidic protons is named anywhere in the lesson.
- Do not use acetic acid, ammonia, HCl with NaOH, phenolphthalein, methyl orange or methyl red anywhere, and do not use the numbers of the teacher's titrations (equivalence at 25.0, 22.40, 18.50 or 50.0 mL; "pH 5.20 at 10.0 mL").

**Reactions, substances and scenarios used:** lactic acid + OH⁻ → lactate + H₂O and the lactate ion's reaction with water; H₃O⁺ + OH⁻ → 2 H₂O (hydrobromic acid with NaOH); propanoic acid with KOH (named, not written); methylamine + H₃O⁺ → CH₃NH₃⁺ + H₂O and the ionization of CH₃NH₃⁺; an unnamed weak base with a strong acid; H₂A + OH⁻ → HA⁻ + H₂O and HA⁻ + OH⁻ → A²⁻ + H₂O for a made-up acid H₂A (p$K_a$ values 3.00 and 8.00). Scenarios: a pH probe in the lactic acid flask of lesson 4.6 (opening); 25.0 mL of 0.108 M propanoic acid titrated with 0.150 M KOH: equivalence at 18.0 mL (Check 1), readings 2.92, 4.87 at 9.0 mL, 5.23 at 12.5 mL and 8.83 (Check 2), pH 12.11 after 22.0 mL (Check 4); 20.0 mL of 0.150 M lactic acid with 0.200 M NaOH, pH 8.40 at the equivalence point (worked example 1 and the explorer, with hydrobromic acid as the strong acid and bromocresol green, bromothymol blue and thymol blue as indicators); the same flask with propanoic acid, 8.90 at the equivalence point (Check 3); 30.0 mL of 0.100 M methylamine with 0.150 M HNO₃: 20.0 mL, 10.64 and 5.93 (worked example 2 and its figure); 40.0 mL of a 0.0900 M weak base with a 0.150 M strong acid, readings 10.93, 8.90, 5.07 and 1.9 (Check 5); 20.0 mL of 0.120 M H₂A with 0.200 M NaOH, rises at 12.0 and 24.0 mL, readings 3.02 at 6.0 mL and 8.00 at 18.0 mL (figure); 1.60 mmol of H₂A with 0.100 M NaOH, rises at 16.0 and 32.0 mL (Check 6).

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps: the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.5 Acid–Base Titrations`).

**Check script:** `scratchpad/unit8/checks/8-5.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.5 Acid–Base Titrations`).

### Task 6: Lesson 8.6, Molecular Structure of Acids and Bases

**Files:**
- Create: `src/content/lessons/unit-8/8-6-molecular-structure-of-acids-and-bases.mdx`
- Create: `public/figures/8-6-acidic-hydrogen.svg`, `public/figures/8-6-electron-pull.svg`
- No interactive diagram.

**Brief**

- **Front matter:** `topic: "8.6"`, `minutes: 17`, summary: "How the structure of a molecule decides which of its hydrogen atoms is acidic and how strong the acid is, through bond strength, electronegative atoms and resonance in the conjugate base." (No colon in the summary.)
- **Framework (8.6, one statement in five parts):** (1) which protons of a molecule take part in acid–base reactions, and how readily, can be worked out from its structure; (2) the strong acids have very weak conjugate bases, which are stabilized by electronegativity, by inductive effects, by resonance, or by several of these together; (3) carboxylic acids are a common kind of weak acid; (4) the strong bases, the group 1 and group 2 hydroxides, have very weak conjugate acids; (5) common weak bases include nitrogen bases and carboxylate ions; and electronegative elements stabilize the conjugate base and so raise the strength of the acid. The objective is to explain how the strength of an acid or a base relates to structure. **What this lesson does not do:** no pH is calculated and no ICE table appears (topic 8.3); $K_a$ and p$K_a$ are used as topic 8.3 defined them (a lower p$K_a$ is a stronger acid, and one unit is a factor of ten) and are not taught again; conjugate pairs and "the stronger acid has the weaker conjugate base" are topic 4.8's (use them, one sentence); resonance is topic 2.6's, electronegativity topic 1.7's, bond length and bond energy topic 2.2's (name each topic, do not teach it again); the pH of a solution of a carboxylate salt is topic 8.4's. No Lewis acids, no oxides. **Equation sheet:** nothing on it for this topic. Every p$K_a$ and every electronegativity a question needs is given in the question.
- **Opening:** honey is acidic, and most of its acid is gluconic acid, which an enzyme from the bees makes from the sugar glucose. One molecule of gluconic acid, C₆H₁₂O₇, has twelve hydrogen atoms, and six of them are bonded to oxygen atoms. Yet a base takes only one of the twelve. This lesson is about how to tell, from a drawing of a molecule, which hydrogen comes off and how easily. Note for the writer: do not answer the question in the opening: the first worked example does. Do not bring lactic acid into the opening or the worked example: lessons 4.6, 8.4, 8.5 and 8.7 run on it, and this lesson has its own molecule.
- **Section "Look at what is left behind":**
  - An acid's strength is how readily it gives a proton to water (topic 4.8), and topic 8.3 put a number on it: the larger the $K_a$, and so the lower the p$K_a$, the stronger the acid. Write the ionization once, split after the arrow: $\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}$.
  - What decides how far this goes is mostly the anion on the right. When the proton leaves, it leaves its bonding electrons behind, and A⁻ has to carry a negative charge. If A⁻ carries that charge easily, it is low in energy, or **stable**, and the ionization goes further. If the charge sits badly on A⁻, the ion takes its proton back and the acid is weak. This is topic 4.8's rule seen from the inside: the stronger acid has the weaker conjugate base, because a stable anion has little pull on a proton.
  - Three things help an anion to carry a negative charge, and this lesson takes them in turn: the charge sits on an **electronegative atom**; other electronegative atoms nearby pull some of the charge toward themselves; the charge is shared by several atoms through **resonance**. A fourth thing belongs to the acid itself and not to the anion: how strong the bond to the hydrogen is.
  - `<KeyIdea>`: to judge an acid, look at its conjugate base. The better the conjugate base carries its negative charge, the more stable it is and the stronger the acid.
- **Section "Which hydrogen comes off":**
  - Not every hydrogen in a molecule is acidic. Look at what each one is bonded to. Carbon and hydrogen attract shared electrons almost equally (electronegativities 2.6 and 2.2, topic 1.7), so a C–H bond is barely polar, and if the proton left, the charge would sit on a carbon atom, which carries it badly. The hydrogen atoms of a CH₃ or CH₂ group do not come off in water. Oxygen is far more electronegative (3.4). An O–H bond is polar, with the hydrogen at its positive end, and an oxygen atom carries a negative charge much better.
  - So in the molecules of this unit, look for hydrogen on oxygen first. That is why chemists often write an acid's formula with its acidic hydrogen in front: HC₃H₅O₃ for lactic acid says one hydrogen is acidic and five are not. The polarity of the bond is the first thing to look at, and it is not the only one: a later section meets acids whose bond to hydrogen is no more polar than a C–H bond.
  - But an O–H group alone does not make much of an acid. Ethanol, C₂H₅OH, has one, and a solution of ethanol in water is not acidic: its p$K_a$ is about 16. Acetic acid, CH₃COOH, also has one O–H, and its p$K_a$ is 4.76. Those eleven units mean a $K_a$ roughly a hundred billion times larger.
  - The difference is the second oxygen atom. A **carboxylic acid** is a molecule with the group –COOH: a carbon atom with a double bond to one oxygen atom and a single bond to an O–H group. When the proton leaves, what remains is a **carboxylate ion**, –COO⁻. Two Lewis diagrams can be drawn for it, with the double bond to one oxygen or to the other, and the real ion is the blend of the two (topic 2.6): each oxygen atom carries half of the negative charge, and the two carbon–oxygen bonds are alike. A charge shared by two atoms is carried more easily than a charge on one. In the ethoxide ion, C₂H₅O⁻, there is no second oxygen, and one oxygen atom carries all of it.
  - Carboxylic acids are the most common weak acids you will meet: acetic acid, lactic acid, and most of the weak acids in the calculations of this unit. Those with no halogen atom in them mostly have a p$K_a$ between about 3 and 5.
  - Place the figure `8-6-acidic-hydrogen.svg` here.
- **Worked example "The one acidic hydrogen of gluconic acid":** gluconic acid is HOCH₂(CHOH)₄COOH: a chain of six carbon atoms with a –COOH group at one end. Which of its twelve hydrogen atoms does it give to a base, and why that one?
  1. **Sort the hydrogen atoms by what they are bonded to.** The carbon atom at the far end holds two hydrogen atoms, and each of the next four holds one: 2 + 4 = 6 C–H hydrogens. Each of those five carbon atoms also holds an O–H group: five O–H hydrogens. One more is in the –COOH group. That is 6 + 5 + 1 = 12.
  2. **Rule out the six on carbon.** A C–H bond is barely polar, and a carbon atom carries a negative charge badly.
  3. **Compare the six on oxygen by the anions they would leave.** Take the proton from any of the five O–H groups along the chain, and the negative charge sits on that one oxygen atom, as in ethoxide. Take it from the –COOH group, and the charge is shared by two oxygen atoms through resonance.
  4. **Choose the most stable anion.** The –COOH hydrogen is the acidic one. The ion left is the gluconate ion, HOCH₂(CHOH)₄COO⁻, or C₆H₁₁O₇⁻.
  5. **Check against what is known.** The p$K_a$ of gluconic acid is 3.86, in the usual range for a carboxylic acid. And calcium gluconate, a calcium supplement, is Ca(C₆H₁₁O₇)₂: two gluconate ions, each with a charge of 1−, for one Ca²⁺ ion. Each acid molecule gave up one proton and kept the other eleven hydrogen atoms.

  Note for the writer: the gluconate ion still has its five O–H groups, and those hydrogens stay on. Do not call those groups "hydroxide" and do not write them as OH⁻. Say nothing about the ring forms (lactones) that some gluconic acid molecules close into in water, about the molecule's shape, or about how glucose becomes gluconic acid.
- **Check 1**, `<Check answer={2}>`: "Hypophosphorous acid, H₃PO₂, has an unusual structure: two of its hydrogen atoms are bonded directly to the phosphorus atom, and the third is bonded to an oxygen atom; the other oxygen atom is bonded to phosphorus alone. The electronegativities are 2.2 for hydrogen, 2.2 for phosphorus and 3.4 for oxygen. In an acid–base reaction in water, with how many moles of OH⁻ does 1 mol of hypophosphorous acid react?" Options:
  1. 3 mol, one for each hydrogen atom in the formula of the acid
  2. 1 mol, for the one hydrogen atom bonded to oxygen
  3. 2 mol, one for each hydrogen atom bonded to the central atom
  4. 2 mol, one for each oxygen atom in the formula of the acid

  Why: sort the hydrogen atoms by what they are bonded to. Each P–H bond joins two atoms of equal electronegativity, so it is not polar, and phosphorus, like carbon, carries a negative charge badly: those two hydrogens stay on. The third hydrogen is on oxygen, and the other oxygen atom on phosphorus helps the ion left behind to carry its charge, much as the second oxygen atom of a –COOH group does. That hydrogen is acidic, and hydroxide, a strong base, takes it. So 1 mol of the acid reacts with 1 mol of OH⁻, though its formula shows three hydrogen atoms. The sodium salt bears this out: sodium hypophosphite is NaH₂PO₂, with two hydrogen atoms still in its anion. A formula counts the atoms; the structure says which of them are acidic. And an oxygen atom with no hydrogen on it has no proton to give, so counting oxygen atoms does not work either. Misses:
  - 1: "A formula counts atoms. It does not say what each hydrogen is bonded to. Sort the three by their bonds and compare the electronegativities."
  - 3: "Compare the two atoms in a P–H bond: 2.2 and 2.2. Is that bond more like an O–H bond or more like a C–H bond?"
  - 4: "An oxygen atom gives a proton only if a hydrogen atom is bonded to it. Look at where each of the three hydrogen atoms sits."

  Note for the writer: hypophosphorous acid, H₃PO₂ (two P–H and one O–H), is not phosphorous acid, H₃PO₃ (one P–H and two O–H), and it is not phosphoric acid, H₃PO₄. Spell the name with care, do not mention the other two acids in this Check, and give no p$K_a$ for it. This Check was rebuilt after the originality check. Lesson 8.5's curve with two rises now belongs to a made-up acid, H₂A, so no lesson of the unit names phosphorous acid. Do not name PH₃ in this Check: phosphine is introduced two sections later.
- **Section "A neighbor that pulls":**
  - An electronegative atom does not have to carry the charge itself to help. Put one near the –COO⁻ group and it pulls electron density toward itself through the bonds between them. That draws a little of the negative charge off the two oxygen atoms and spreads it over more of the ion. This pull through bonds is the **inductive effect**.
  - Place the figure `8-6-electron-pull.svg` here, after the worked example below (or directly before it; the worked example refers to it).
  - Two more facts about the pull, one sentence each: it adds up, so trichloroacetic acid, with three chlorine atoms on that carbon, is a stronger acid than chloroacetic acid, with one; and it fades with distance, so a halogen farther along a carbon chain from the –COOH group does less.
- **Worked example "Ranking four acids from their structures":** acetic acid is CH₃COOH. In fluoroacetic acid, bromoacetic acid and iodoacetic acid, one hydrogen atom of the CH₃ group is replaced by a halogen atom: FCH₂COOH, BrCH₂COOH and ICH₂COOH. The electronegativities are 2.2 for hydrogen, 2.7 for iodine, 3.0 for bromine and 4.0 for fluorine. Rank the four acids from weakest to strongest, then compare with their p$K_a$ values.
  1. **Find what is the same and what differs.** All four have the same –COOH group, and all four leave a carboxylate ion that shares its charge between two oxygen atoms. Only the atom on the neighboring carbon differs.
  2. **Say what that atom does to the anion.** It pulls electron density toward itself and away from the –COO⁻ end. The stronger the pull, the more the charge is spread and the more stable the anion.
  3. **Rank the pull.** By electronegativity: hydrogen (2.2), then iodine (2.7), then bromine (3.0), then fluorine (4.0).
  4. **Turn that into a ranking of the acids.** Weakest to strongest: acetic acid, iodoacetic acid, bromoacetic acid, fluoroacetic acid.
  5. **Compare with measurement.** The p$K_a$ values are 4.76, 3.18, 2.90 and 2.59, in that order: each lower than the one before, so each acid is stronger than the one before. Even iodine, the weakest puller of the three halogens, lowers the p$K_a$ by more than one and a half units (4.76 − 3.18 = 1.58).

  Note for the writer: do not turn any of these differences into a factor here ("about 40 times"): Check 2 asks for that step with another acid. Acetic acid appears in this lesson as a structure and a p$K_a$ only, never with a concentration or a pH.
- **Check 2**, `<Check numeric="81.3">` (no unit; the page's 2 percent, which accepts 79.67 to 82.93, so 81, 81.3, the three-figure route's 81.0 and the two-figure route's 82.4 and 82 are all accepted. The p$K_a$ of chloroacetic acid is given as 2.85, the p$K_a$ of lesson 8.3's $K_a$ of 1.4 × 10⁻³, so that no honest rounding falls outside the window): "Chloroacetic acid, ClCH₂COOH, has a p$K_a$ of 2.85. Acetic acid has a p$K_a$ of 4.76. How many times as large as the $K_a$ of acetic acid is the $K_a$ of chloroacetic acid?" Why: a p$K_a$ is minus the logarithm of a $K_a$, so a difference between two p$K_a$ values is a ratio of the two $K_a$ values. The difference is 4.76 − 2.85 = 1.91, and $10^{1.91} = 81.3$, about 81. One chlorine atom on the next carbon makes the acid about 81 times as strong. The long way gives the same answer: $K_a = 10^{-2.85} = 1.413 \times 10^{-3}$ and $10^{-4.76} = 1.738 \times 10^{-5}$, and their quotient is 81.3. (Put each line of arithmetic in display math. Keep four figures in the two $K_a$ values: with three, 1.41 ÷ 1.74 is 81.0. With both rounded to two figures first, 1.4 × 10⁻³ and 1.7 × 10⁻⁵, the quotient is 82.4, which the page accepts; do not print that route in the lesson.) Slips:
  - `1.91` (the difference in p$K_a$ given): "That is the difference between the two pKa values. A pKa is a logarithm, so a difference in pKa is a power of ten in Ka."
  - `1.67` (one p$K_a$ divided by the other): "Did you divide one pKa by the other? They are logarithms. Subtract them, then raise ten to that power."
  - `0.0123` (the ratio upside down): "That is the ratio the other way up. Which of the two acids has the lower pKa, and so the larger Ka?"
  - `19.1` (the difference multiplied by ten): "Did you multiply the difference by ten? One whole pKa unit is a factor of ten, two units a factor of a hundred. Use a power of ten."
- **Section "Down a group, the bond decides":**
  - Now a family in which the acidic hydrogen is bonded to a different atom each time: hydrogen sulfide, H₂S, hydrogen selenide, H₂Se, and hydrogen telluride, H₂Te, the hydrogen compounds of three elements of group 16. In water each is a weak acid, and the p$K_a$ of the first proton is about 7.0, about 3.9 and about 2.6: stronger going down the group, by a factor of more than ten thousand from top to bottom.
  - Electronegativity cannot be the reason. On topic 1.7's scale sulfur and selenium are both 2.6 and tellurium is 2.1. If electronegativity decided, hydrogen telluride would be the weakest of the three.
  - What changes most going down a group is the size of the atom. A larger atom makes a longer bond to hydrogen, and a longer bond is usually a weaker one (topic 2.2). The H–Te bond is the longest and weakest of the three, so its proton comes away most easily. The larger anion helps as well: the same 1− charge is spread over a bigger ion.
  - That settles something else. Sulfur and selenium have the same electronegativity as carbon, 2.6, so an S–H or an Se–H bond is no more polar than a C–H bond, and an H–Te bond (2.2 and 2.1) is less polar still. Yet H₂S, H₂Se and H₂Te are all acids in water, and the hydrogen atoms of a CH₃ group are not acidic. The polarity of the bond is the first thing to look at, not the only one: sulfur, selenium and tellurium are larger atoms than carbon, so each holds hydrogen with a longer, weaker bond and carries the charge on a larger ion.
  - Across a period it is the other way around. Phosphine, PH₃, hydrogen sulfide, H₂S, and hydrogen chloride, HCl, are the hydrogen compounds of three neighbors in period 3. The three atoms are close in size. The bond to hydrogen even gets stronger from P–H to H–Cl, and still the acid strength climbs: PH₃ is not measurably acidic in water, H₂S is a weak acid, and HCl is a strong one. Here electronegativity decides (2.2 for phosphorus, 2.6 for sulfur, 3.2 for chlorine): the more electronegative atom carries the negative charge better.
  - `<KeyIdea>`: for hydrogen bonded to different atoms, across a period the more electronegative atom gives the stronger acid, and down a group the larger atom, with its longer and weaker bond, gives the stronger acid.

  Note for the writer: do not use the hydrogen halides (HF to HI) or the set CH₄, NH₃, H₂O, HF as examples anywhere in this lesson, and give no bond energy in kJ/mol. Do not mention water in this section: Check 3 asks the student to place it.
- **Check 3**, `<Check answer={4}>`: "Water, H₂O, is the hydrogen compound of oxygen, the element at the top of group 16. Oxygen is the smallest atom of the group and the most electronegative (3.4, against 2.6 for sulfur). Where does water belong among H₂S, H₂Se and H₂Te as an acid?" Options:
  1. It is the strongest of the four, because oxygen carries a negative charge best
  2. It cannot be placed among them, because water is neutral and so is not an acid
  3. It lies between H₂S and H₂Se, because the trend down a group has an exception at the top
  4. It is the weakest of the four, because its bond to hydrogen is the shortest

  Why: down a group the bond to hydrogen decides. Oxygen is the smallest atom of the group, so the O–H bond is the shortest and strongest of the four, and water holds its protons most tightly. Water is by far the weakest acid of the four: in pure water at 25 °C only 1.0 × 10⁻⁷ mol of H₃O⁺ forms in each liter (topic 8.1), which is about two water molecules in a billion, and lesson 4.8's table has H₂O at the very bottom. Oxygen's high electronegativity would matter in a comparison across a period, not down a group. And neutral does not mean "not an acid": water gives a proton whenever it meets a strong enough base (topic 4.8). Misses:
  - 1: "That is the rule for atoms in one period, which are close in size. These four atoms are in one group. What changes most down a group?"
  - 2: "Neutral describes pure water, where H₃O⁺ and OH⁻ are equal. Water still gives up a proton to a strong enough base, as topic 4.8 showed."
  - 3: "Nothing in the reasoning makes the top of the group a special case. What did the trend from H₂S to H₂Te depend on?"

  Note for the writer: "about two molecules in a billion" is 1.0 × 10⁻⁷ M of H₃O⁺ in water that is 55.5 M (1.8 in a billion). Give no p$K_a$ for water: tables disagree on how to define it.
- **Check 4**, `<Check answer={1}>`: "Germane, GeH₄, arsine, AsH₃, and hydrogen selenide, H₂Se, are the hydrogen compounds of three neighbors in period 4. The electronegativities are 2.0 for germanium, 2.2 for arsenic and 2.6 for selenium. Which of the three is the strongest acid in water, and why?" Options:
  1. H₂Se, whose central atom is the most electronegative of the three
  2. GeH₄, which has the most hydrogen atoms to give to water
  3. GeH₄, whose central atom pulls least on the electrons it shares with hydrogen
  4. All three are alike, because atoms in one period are close in size

  Why: the three atoms are in one period, so they are close in size and the bond to hydrogen is not what separates them. Electronegativity is: selenium, at 2.6, carries a negative charge better than arsenic or germanium, so HSe⁻ is the most stable of the three anions and H₂Se is the strongest acid (p$K_a$ about 3.9; the other two are not measurably acidic in water). The number of hydrogen atoms in a formula says nothing about how readily one of them leaves. A weak pull on the shared electrons does not release a proton: the proton leaves without the electrons, so the atom left behind has to hold them, and the charge, well. Similar size is the reason the bond does not decide; it does not make the acids equal. Misses:
  - 2: "The number of hydrogen atoms is not the ease with which one leaves. Think about the ion that is left when one proton has gone."
  - 3: "The proton leaves without its bonding electrons, so the atom left behind has to hold them, and a negative charge. Does a weak pull help with that?"
  - 4: "Similar size means the bond to hydrogen does not separate them. Something else still differs from one atom to the next. What is given?"
- **Section "Oxygen atoms on the central atom":**
  - In an **oxyacid** the acidic hydrogen is on an oxygen atom, and that oxygen is bonded to a central atom: H–O–Z. Nitric acid, HNO₃, is HO–NO₂: an O–H group and two more oxygen atoms on nitrogen. Nitrous acid, HNO₂, is HO–NO: an O–H group and one more oxygen atom. The acidic hydrogen is in the same place in both, bonded to the same kind of atom, and yet nitric acid is a strong acid and nitrous acid is a weak one (lesson 4.8's table).
  - Each oxygen atom on the central atom does two things, and they are the two effects already met. It is electronegative, so it pulls electron density toward itself, through the nitrogen atom, away from the O–H bond: the inductive effect, which makes the bond more polar and the proton easier to remove. And it gives the anion one more atom to share the negative charge by resonance: in the nitrate ion, NO₃⁻, three oxygen atoms share one negative charge (topic 2.6 drew its three diagrams); in the nitrite ion, NO₂⁻, only two do.
  - So do not say "it has more oxygen atoms" and stop. Say what the oxygen atoms do.
  - This is what the strong acids have in common. Every strong acid of topic 4.2's list leaves behind a conjugate base that carries its charge very well, so well that it essentially never takes a proton back from H₃O⁺: an ion with its charge shared by several oxygen atoms, such as nitrate, or a large halide ion.

  Note for the writer: do not use the chlorine oxyacids, sulfurous and sulfuric acid, or the bromine oxyacids as examples. Write nitric acid's structure in words or as HO–NO₂, with no drawing: lesson 2.6 has the nitrate ion's diagrams.
- **Check 5**, `<Check answer={3}>`: "Selenic acid is (HO)₂SeO₂: two O–H groups and two more oxygen atoms on a selenium atom. Selenous acid is (HO)₂SeO: two O–H groups and one more oxygen atom. In water, selenic acid gives up its first proton essentially completely, and selenous acid is a weak acid. Which explanation is best?" Options:
  1. Selenic acid has more hydrogen atoms that can leave as protons than selenous acid has
  2. The added oxygen atom makes the O–H bonds longer and weaker, as a larger atom does down a group
  3. The added oxygen atom pulls electron density from the O–H bonds and shares the anion's charge
  4. With more oxygen atoms, selenic acid attracts water more strongly, so more of it dissolves

  Why: both acids have two O–H groups on the same central atom, so the count of acidic hydrogens is the same, and so is the atom the hydrogens are bonded to. The difference is one oxygen atom on selenium. It is electronegative and pulls electron density toward itself, away from the O–H bonds, and when a proton has left, it is one more atom for the negative charge to be shared with: three oxygen atoms share the charge of HSeO₄⁻ and two share the charge of HSeO₃⁻. Bond length is the reason down a group, where the atom bonded to hydrogen changes; here the hydrogen is on oxygen in both acids. And how much of an acid dissolves is a different question from how much of the dissolved acid ionizes. Misses:
  - 1: "Count the O–H groups in the two structures the question gives. Is the number of acidic hydrogen atoms different?"
  - 2: "Bond length matters when the atom bonded to hydrogen changes down a group. In both of these acids the hydrogen is on an oxygen atom."
  - 4: "Dissolving and ionizing are two different things. Strength is about how much of the dissolved acid gives its proton to water."

  Note for the writer: in HSeO₄⁻ one oxygen atom still carries a hydrogen; the three that share the charge are the other three. Do not mention sulfuric or sulfurous acid, though the two pairs are alike.
- **Key idea of the section "Oxygen atoms on the central atom", placed after Check 5:** `<KeyIdea>`: in an oxyacid, each additional oxygen atom on the central atom pulls electron density away from the O–H bond and gives the conjugate base another atom to share its charge. Both make the acid stronger. Note for the writer: keep it here, after Check 5 and before the section on bases. Placed before the Check, it would answer it in nearly its own words.
- **Section "What makes a base":**
  - A base takes a proton (topic 4.8), and to bond to that proton it needs a pair of electrons that is not already in a bond. Two kinds of weak base turn up again and again.
  - **Nitrogen bases.** A nitrogen atom with three bonds has one unshared pair of electrons, and that pair can bond to a proton. Trimethylamine, (CH₃)₃N, is one (topic 4.2 called it a weak base): its nitrogen atom takes a proton from water and becomes (CH₃)₃NH⁺, leaving OH⁻ behind. Write the equation, split after the arrow: $\ce{(CH3)3N(aq) + H2O(l) <=> (CH3)3NH+(aq) + OH-(aq)}$. Its nine C–H hydrogens play no part. Ammonia and methylamine work the same way. The molecule has no OH in it: the hydroxide ion comes from the water.
  - **Carboxylate ions.** The conjugate base of a carboxylic acid is a weak base. It is stable, because of its shared charge, but not so stable that it never takes a proton: a carboxylic acid is a weak acid, so its conjugate base has some pull (topic 4.8). That is why a solution of a salt such as sodium lactate is slightly basic (topic 8.4).
  - **The strong bases** are different in kind. The hydroxides of group 1, and calcium, strontium and barium hydroxide, are ionic compounds that release OH⁻ itself into the water (topic 8.2). The conjugate acid of OH⁻ is H₂O, a very weak acid: the same rule as before, read from the other end. A strong base has a very weak conjugate acid, as a strong acid has a very weak conjugate base.
- **Check 6**, `<Check answer={1}>`: "Sodium ethoxide, NaOC₂H₅, is the sodium salt of ethanol. When it dissolves in water, essentially every ethoxide ion, C₂H₅O⁻, takes a proton from a water molecule. In a solution of sodium acetate, only a very small fraction of the acetate ions, CH₃COO⁻, do. What accounts for the difference?" Options:
  1. Acetate shares its charge between two oxygen atoms, so it pulls less on a proton
  2. Ethoxide carries a larger negative charge than acetate, so it attracts protons more strongly
  3. Acetate has two oxygen atoms that can each take a proton, so it takes more protons than ethoxide
  4. Ethanol is a stronger acid than acetic acid, and the stronger acid has the stronger conjugate base

  Why: both ions have a charge of 1−. In ethoxide the whole of it sits on one oxygen atom. In acetate, resonance shares it between two, so acetate is the more stable ion and has much less to gain by bonding to a proton. Ethoxide is a far stronger base than acetate, which is the other face of a fact from earlier in the lesson: ethanol (p$K_a$ about 16) is a far weaker acid than acetic acid (p$K_a$ 4.76), and the weaker acid has the stronger conjugate base. A second oxygen atom does not make acetate take more protons; the question itself says that it takes fewer. Misses:
  - 2: "Read the two formulas again: C₂H₅O⁻ and CH₃COO⁻. Compare the sizes of the two charges before you compare anything else."
  - 3: "The question says that acetate takes far fewer protons than ethoxide, not more. What does a second oxygen atom do to the charge?"
  - 4: "Compare the pKa values given earlier in the lesson, about 16 for ethanol and 4.76 for acetic acid. Then check topic 4.8's rule."

  Note for the writer: sodium ethoxide does react essentially completely with water (to ethanol and sodium hydroxide), which is why it is made and kept dry. Give no number for acetate's "very small fraction": this lesson uses acetic acid with no concentration.
- **Check 7**, `<Check answer={4}>`: "Glycine, the simplest amino acid, is H₂N–CH₂–COOH: a nitrogen atom with two hydrogen atoms on it, then a CH₂ group, then a –COOH group. Which statement about glycine is supported by its structure?" Options:
  1. It can only give protons: nothing in its formula is an OH⁻ ion that it could release
  2. Its CH₂ hydrogen atoms are the acidic ones, because they sit between two groups
  3. It can only take protons: the nitrogen atom makes the whole molecule a base
  4. It can give a proton from its –COOH group and take one at its nitrogen atom

  Why: read the molecule one group at a time. The –COOH group is a carboxylic acid: its O–H hydrogen can leave, and the –COO⁻ group left behind shares the charge between two oxygen atoms. The nitrogen atom has three bonds and one unshared pair, like the nitrogen of trimethylamine, so it can bond to a proton. Glycine is an acid at one end and a base at the other. The CH₂ hydrogens are on carbon and stay on. And a base does not need OH in its formula: a nitrogen base takes a proton, and no hydroxide ion leaves the molecule. Misses:
  - 1: "A base takes a proton. It does not have to release OH⁻. Look for an atom in the molecule with an unshared pair of electrons."
  - 2: "Those two hydrogen atoms are bonded to carbon. How polar is a C–H bond, and how well does a carbon atom carry a negative charge?"
  - 3: "One group does not decide for the whole molecule. Go through it one group at a time, the –COOH group included."

  Note for the writer: say nothing about the form glycine takes in water or in a crystal (the ion with both charges), and do not use the word "amphoteric" or "zwitterion".
- **Trap:** **Counting every hydrogen in the formula as acidic** (look at what each hydrogen is bonded to: the six hydrogen atoms on the carbon chain of gluconic acid, and the two on phosphorus in H₃PO₂, stay on). **Reaching for electronegativity down a group** (down a group the atoms change size, and the longer, weaker bond to hydrogen decides; electronegativity decides across a period). **Saying "it has more oxygen atoms" and stopping** (say what they do: they pull electron density from the O–H bond, and they share the anion's charge). **Taking a stable conjugate base for a strong base** (it is the reverse: an anion that carries its charge well has little pull on a proton, so its acid is strong). **Looking for OH in the formula of a base** (a nitrogen base has none; it takes a proton with its unshared pair, and the OH⁻ comes from water). **Calling any molecule with an O–H group an acid** (ethanol's O–H is not acidic in water; a –COOH group is, because of the second oxygen atom).
- **Key points:** the strength of an acid follows the stability of its conjugate base: the better the anion carries its negative charge, the stronger the acid, and the weaker the anion is as a base; the first place to look for an acidic hydrogen is on an electronegative atom such as oxygen, and the hydrogen atoms of CH₃ and CH₂ groups are not acidic; a carboxylic acid, with the group –COOH, is a weak acid because its conjugate base, a carboxylate ion, shares its negative charge between two oxygen atoms by resonance; an electronegative atom near the acidic group pulls electron density toward itself (the inductive effect) and makes the acid stronger, the more so the more electronegative it is; for hydrogen bonded to different atoms, electronegativity decides across a period and the length and strength of the bond decide down a group, so H₂Te is a stronger acid than H₂S; common weak bases are nitrogen bases, which take a proton with the unshared pair on nitrogen, and carboxylate ions, while a strong base, a hydroxide of group 1 or of calcium, strontium or barium, releases OH⁻, whose conjugate acid is water.

**Figures**

- **`8-6-acidic-hydrogen.svg`** (viewBox 0 0 480 400, font-size 18). Two drawings, one above the other. Atoms are letters; bonds are ink lines 2 units wide that stop 12 units short of each letter's center; a double bond is two parallel lines 6 units apart. (The molecule changed from lactic acid to gluconic acid after the originality check, and the layout was computed again.)
  - Top drawing, gluconic acid with every bond. The six carbon atoms are in a row at y = 110, 50 units apart: C6 at (60, 110), C5 at (110, 110), C4 at (160, 110), C3 at (210, 110), C2 at (260, 110) and C1 at (310, 110), with single bonds C6–C5, C5–C4, C4–C3, C3–C2 and C2–C1. Each of C6, C5, C4, C3 and C2 has an H 50 units above it (y = 60), an O 50 units below it (y = 160) and an H 50 units below that O (y = 210), each joined by a single bond. C6 has one more H, at (10, 110), to its left. C1 has an O at (310, 55) above it, joined by a double bond, and an O at (360, 110) to its right, joined by a single bond, and an H at (410, 110) to the right of that O.
  - The H at (410, 110) has a ring around it: a circle of radius 15, stroke in the accent color, 3 units wide, no fill. The bond from the O at (360, 110) to this H is the one exception to the 12-unit rule: it runs from x = 372 to x = 393 and stops at the outer edge of the ring. Under it, centered at x = 402, baseline y = 152, the label "acidic hydrogen" (at most 152 units wide, so it runs from x = 326 to x = 478 at the widest; its left end is 59 units to the right of the O–H group under C2, whose letters end at x = 267). No other hydrogen is marked.
  - Extent of the top drawing: from x = 3 (the left edge of the H at x = 10) to x = 425 (the ring) and to x = 478 (the label); from y = 48 (the top of the O at y = 55) to y = 217 (the bottom of the H letters at y = 210). Letters are taken as 14 units wide and 14 tall.
  - Bottom drawing, the –COO⁻ end of the gluconate ion, twice, with a double-headed arrow between. The rest of the ion is written as "C₅H₁₁O₅". Left form: the text "C₅H₁₁O₅" right-aligned to end at x = 104, baseline y = 336; a single bond from x = 108 to x = 124 at y = 330; C at (136, 330); O at (136, 275) above it, joined by a double bond; O at (196, 330) to its right, joined by a single bond, with a "−" at (214, 318). Right form, 240 units to the right of the left form: "C₅H₁₁O₅" right-aligned to end at x = 344, on the same baseline, y = 336; a single bond from x = 348 to x = 364 at y = 330; C at (376, 330); O at (376, 275) above it, joined by a single bond, with a "−" at (394, 263); O at (436, 330) to its right, joined by a double bond. Between the two forms a horizontal double-headed arrow from x = 229 to x = 258 at y = 330, in the secondary color.
  - Clearances in the bottom drawing, with "C₅H₁₁O₅" taken as at most 76 units wide (72.5 by the script's count): the left form's text begins no farther left than x = 28; the left form's "−" ends near x = 219, 10 units before the arrow begins; the right form's text begins no farther left than x = 268, 10 units after the arrow ends; the right-hand O ends near x = 443, inside the viewBox. The top of the upper O letters (y = 268) is 51 units below the lowest letters of the top drawing (y = 217). If the text is wider on the drawing, keep the arrow at least 6 units clear of both forms by shortening it, not by moving the forms.
  - Text in the figure: twenty-five atom letters in the top drawing (6 C, 12 H, 7 O), "acidic hydrogen", and in the bottom drawing "C₅H₁₁O₅" twice, C twice, O four times and "−" twice.
  - Atoms and charge: the top drawing is C₆H₁₂O₇, neutral. Each bottom form is C₅H₁₁O₅ with one more carbon atom and two more oxygen atoms, C₆H₁₁O₇, with one negative charge, on a different oxygen atom in each.
  - Alt: "Two drawings. Above, a gluconic acid molecule with every bond drawn: six carbon atoms in a row. The first carbon atom holds two hydrogen atoms and an O–H group. Each of the next four holds one hydrogen atom and an O–H group. The sixth holds an oxygen atom joined by a double bond and an O–H group. The hydrogen atom of that last O–H group is ringed and labeled acidic hydrogen. The other eleven hydrogen atoms are not marked. Below, the –COO⁻ end of the gluconate ion drawn twice, with the rest of the ion written as C₅H₁₁O₅ and a double-headed arrow between. In the first drawing the upper oxygen atom has the double bond and the right-hand oxygen atom has the negative charge. In the second the two have changed places."
  - Caption: "Gluconic acid gives up one of its twelve hydrogen atoms, the one in its –COOH group. The ion left behind shares its negative charge between two oxygen atoms. The drawing shows which atoms are bonded, not the shape of the molecule. Unshared pairs of electrons are not drawn."
- **`8-6-electron-pull.svg`** (viewBox 0 0 480 290, font-size 18). Four rows, one under another, for acetic, iodoacetic, bromoacetic and fluoroacetic acid, in that order from the top down. (The four acids do not fit side by side: each drawn group is about 123 units wide, and four of them with gaps of 6 need 510 units. The fact-check found the overlap; the viewBox stays 480 wide so that the text keeps its size on the page.)
  - Baselines of the four rows: y = 48, 110, 172 and 234 (62 apart).
  - In each row, on its baseline: the swapped atom's symbol (H, I, Br, F) centered at x = 40, inside a ring of radius 14 (accent stroke, 2 units wide, no fill; the ring's center is 6 units above the baseline, at y = 42, 104, 166 and 228, so the ring runs from x = 26 to x = 54); a bond line 8 units long from x = 54 to x = 62 at the height of the ring's center; then the text "CH₂COOH" left-aligned at x = 64 (it ends near x = 151, and no farther right than x = 153).
  - To the right, on the same baseline: the name left-aligned at x = 176 ("acetic", "iodoacetic", "bromoacetic", "fluoroacetic"; the longest ends before x = 302) and the p$K_a$ left-aligned at x = 314 ("pKa 4.76", "pKa 3.18", "pKa 2.90", "pKa 2.59"; each ends before x = 396), in ink.
  - Above each of the three halogen rows, 36 units above the row's baseline (y = 74, 136 and 198), a horizontal arrow 56 units long, from x = 96 to x = 40, pointing left, its tip above the ring's center: it shows electron density pulled toward the halogen. Stroke widths 2 for iodine, 4 for bromine and 8 for fluorine, in the accent color, with arrowheads in proportion, none more than 20 units tall. The acetic acid row has no arrow. Each arrow lies at least 6 units above its own ring (the ring's top is 20 units above the baseline, the arrowhead's lower edge at most 26) at least 12 units below the text of the row above (which reaches 4 units below its baseline, 58 units above this one), and at least 7 units below the ring of the row above (whose lower edge, with its stroke, is 53 units above this baseline).
  - At the right, a long vertical arrow in the secondary color at x = 412 from y = 30 to y = 250, pointing down, with the label "stronger acid" centered at x = 412 on the baseline y = 272 (it runs from about x = 359 to x = 465, and stays inside x = 346 to x = 478).
  - The three pull arrows differ in thickness, not in color.
  - Text in the figure, seventeen pieces: four ringed symbols, "CH₂COOH" four times, four names, four p$K_a$ labels and "stronger acid".
  - Alt: "Four acids, one under another, each drawn as one ringed atom joined to CH₂COOH. From the top down, the ringed atom is H in acetic acid, I in iodoacetic acid, Br in bromoacetic acid and F in fluoroacetic acid. Above each of the last three, an arrow points left, toward the ringed atom, and the arrow gets thicker from iodine to bromine to fluorine. Acetic acid has no arrow. Beside the acids are their names and the pKa values 4.76, 3.18, 2.90 and 2.59. A long arrow at the right points down and is labeled stronger acid."
  - Caption: "The more strongly the ringed atom pulls electron density toward itself, the more stable the ion the acid leaves and the lower its pKa."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| p$K_a$ of acetic acid | 4.76 | the design; standard tables (4.756); sure |
| p$K_a$ of fluoroacetic acid | 2.59 | the design; tables give 2.59 (some 2.58 or 2.66); fairly sure **(verify)** |
| p$K_a$ of chloroacetic acid | 2.85 | tables give 2.85 to 2.87; 2.85 is the p$K_a$ of the $K_a$ of 1.4 × 10⁻³ in lesson 8.3's explorer (−log 1.4 × 10⁻³ = 2.854), chosen so that Check 2 has no answer near the edge of its window; sure |
| p$K_a$ of bromoacetic acid | 2.90 | the design; tables give 2.86 to 2.90; fairly sure **(verify)** |
| p$K_a$ of iodoacetic acid | 3.18 | the design; tables give 3.12 to 3.18; fairly sure **(verify)** |
| p$K_a$ of gluconic acid | 3.86 | memory: tables give 3.86 (some give 3.6 to 3.7); fairly sure **(verify)**. It happens to equal the design's value for lactic acid; it is not copied from it |
| Gluconic acid, HOCH₂(CHOH)₄COOH, C₆H₁₂O₇: six C–H, five O–H on the chain, one –COOH; one acidic hydrogen | no number printed beyond the counts | sure of the structure and that it is monoprotic in water |
| Gluconic acid is the main acid of honey, made from glucose by an enzyme from the bees (glucose oxidase) | no number printed | sure it is the main acid; fairly sure of the wording "most of its acid" **(verify)** |
| Calcium gluconate is Ca(C₆H₁₁O₇)₂ and is used as a calcium supplement | no number printed | sure |
| p$K_a$ of ethanol | about 16 | tables give 15.9 (some 16.0); fairly sure **(verify)**; printed as "about 16" |
| p$K_{a1}$ of H₂S, H₂Se, H₂Te | about 7.0, about 3.9, about 2.6 | the design; tables give 7.0 to 7.05, 3.89, 2.6 to 2.64; fairly sure **(verify)** |
| Electronegativities | H 2.2, C 2.6, O 3.4, F 4.0, P 2.2, S 2.6, Cl 3.2, Ge 2.0, As 2.2, Se 2.6, Br 3.0, Te 2.1 | the site's own scale: `src/lib/periodic-trends.ts` and lesson 1.7, lines 278 and 279 (Te) |
| Electronegativity of iodine | 2.7 | the site's own scale (`src/lib/periodic-trends.ts`); Pauling's 2.66; sure |
| Trichloroacetic acid stronger than chloroacetic acid | no number printed | p$K_a$ about 0.7 against 2.85; sure of the order |
| PH₃, GeH₄ and AsH₃ not measurably acidic in water | no number printed | p$K_a$ values above 20; sure of the statement |
| Nitric acid strong, nitrous acid weak | no number printed | lessons 4.2 and 4.8 |
| Selenic acid: first proton essentially complete; selenous acid weak | no number printed | selenic acid is as strong as sulfuric acid; selenous acid p$K_{a1}$ about 2.6; sure of the statement |
| Hypophosphorous acid, H₃PO₂, gives one proton | no number printed | two P–H and one O–H, one oxygen on phosphorus alone; monoprotic (p$K_a$ about 1.2, not printed); sure of the structure and of the count |
| Sodium hypophosphite is NaH₂PO₂ | no number printed | sure |
| Fraction of water ionized at 25 °C | about 2 in a billion | 1.0 × 10⁻⁷ M ÷ 55.5 M = 1.8 × 10⁻⁹ |

**Check script:** `scratchpad/unit8/checks/8-6.py`.

**Notes for the writer**

- **Never write that a hydrogen on carbon is never acidic.** HCN is in lesson 4.8's table as a weak acid, with its hydrogen on carbon. The lesson's claim is about the hydrogen atoms of CH₃ and CH₂ groups.
- **Polarity is the first test for an acidic hydrogen, not the only one.** On the site's scale S–H and Se–H (2.6 and 2.2) are no more polar than C–H, and H–Te (2.1 and 2.2) is less polar, yet H₂S, H₂Se and H₂Te are acids. Never write that a bond that is not polar cannot give up its hydrogen; the reason given for C–H and for P–H always includes how badly carbon or phosphorus carries a negative charge.
- **This lesson applies the rule of the electronegative neighbor to halogen atoms, and to oxygen atoms on a central atom, and to nothing else.** Do not apply it to a carbon atom or a CH₃ group: carbon (2.6) is above hydrogen (2.2) on the site's scale, and yet propanoic acid (p$K_a$ 4.87, lesson 8.7) is a weaker acid than acetic acid. Do not compare the two acids here.
- **Do not compare hypophosphorous acid with phosphorous acid or phosphoric acid.** The oxygen-count rule does not predict their order, and no lesson of the unit names phosphorous acid.
- "Stable" here means low in energy. Do not write that a stable anion "does not react": write that it has little pull on a proton.
- Electronegativities are the site's (lesson 1.7): sulfur and selenium are both 2.6, so do not write that sulfur is the more electronegative of the two.
- Bond strength down a group is the main reason the design gives; the size of the anion is one supporting sentence. Do not give a third reason.
- The words "inductive effect", "carboxylic acid", "carboxylate ion", "oxyacid" and "stable" are the lesson's new terms, each in bold once with its definition. "Resonance" and "electronegative" were defined in Units 1 and 2.
- No pH, no concentration and no ICE table anywhere in this lesson. The only calculation is Check 2's.
- Lesson 4.8's table orders HClO₄, H₃O⁺, HIO₃, HNO₂, HOCl, HCN, CH₃NH₃⁺ and H₂O. Nothing here may contradict it: nitrous acid is weak, and water is the weakest acid in it.
- Do not mention Lewis acids and bases. Lesson 4.8 has the one sentence the site allows.
- Check 6 sits in the section on bases, after carboxylate ions have been called weak bases. Its answer is not stated there: the section says that a carboxylate ion is stable and a weak base, and the Check compares it with an ion the section does not mention.

**Reactions, substances and scenarios used:** the general ionization HA(aq) + H₂O(l) ⇌ H₃O⁺(aq) + A⁻(aq); (CH₃)₃N(aq) + H₂O(l) ⇌ (CH₃)₃NH⁺(aq) + OH⁻(aq). Gluconic acid, HOCH₂(CHOH)₄COOH, the main acid of honey, with twelve hydrogen atoms and one acidic, and calcium gluconate, Ca(C₆H₁₁O₇)₂ (opening, worked example 1, figure 1; p$K_a$ 3.86); lactic acid named twice, as the formula HC₃H₅O₃ of topic 4.6 and in a list of carboxylic acids; ethanol and the ethoxide ion against acetic acid and the acetate ion (text and Check 6; p$K_a$ about 16 and 4.76; sodium ethoxide in water); hypophosphorous acid, H₃PO₂, with two P–H and one O–H, and sodium hypophosphite, NaH₂PO₂ (Check 1); acetic, iodoacetic, bromoacetic and fluoroacetic acid, p$K_a$ 4.76, 3.18, 2.90 and 2.59 (worked example 2, figure 2); trichloroacetic acid, one sentence; chloroacetic acid against acetic acid, p$K_a$ 2.85 and 4.76, a factor of 81 (Check 2); H₂S, H₂Se and H₂Te, p$K_a$ about 7.0, 3.9 and 2.6 (text); PH₃, H₂S and HCl across period 3 (text); water placed in group 16 (Check 3); GeH₄, AsH₃ and H₂Se across period 4 (Check 4); nitric acid, HO–NO₂, against nitrous acid, HO–NO, with the nitrate and nitrite ions (text); selenic acid, (HO)₂SeO₂, against selenous acid, (HO)₂SeO (Check 5); trimethylamine as a nitrogen base, with ammonia and methylamine named (text); sodium lactate named once as a slightly basic salt; the group 1 hydroxides and calcium, strontium and barium hydroxide as the strong bases (text); glycine, H₂N–CH₂–COOH (Check 7). Figures: the two the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.6 Molecular Structure of Acids and Bases`).

**Check script:** `scratchpad/unit8/checks/8-6.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.6 Molecular Structure of Acids and Bases`).

### Task 7: Lesson 8.7, pH and pKa

**Files:**
- Create: `src/content/lessons/unit-8/8-7-ph-and-pka.mdx`
- Create: `public/figures/8-7-form-against-ph.svg`, `public/figures/8-7-indicator-ranges.svg`
- Places the interactive block `<TitrationCurve />` a second time. The block is built from the "Diagram data" in lesson 8.5's brief; this lesson only places it and quotes its numbers (see "The explorer's numbers this lesson quotes", below). No Check depends on the block: Check 4 gives the three pH values it needs.

**Brief**

- **Front matter:** `topic: "8.7"`, `minutes: 16`, summary: "How comparing the pH of a solution with the pKa of an acid tells you which form of the acid has the higher concentration, and how that explains indicators and the choice of one for a titration." (No colon in the summary.)
- **Framework (8.7, two statements):** (1) whether an acid or a base in a solution is mostly in its protonated or its deprotonated form is predicted by comparing the pH of the solution with the p$K_a$ of the acid: when the pH is below the p$K_a$ the acid form has the higher concentration, and when it is above, the base form has; (2) an acid–base indicator is a substance whose protonated and deprotonated forms differ in a property such as color, so that the property follows the pH, and a suitable indicator for a titration has a p$K_a$ close to the pH at the equivalence point. The objective is to explain how the main form at a given pH relates to the p$K_a$. **What this lesson does not do:** the Henderson–Hasselbalch equation is topic 8.9's (here the ratio of the two forms comes straight from the $K_a$ expression, and no logarithm of a ratio is taken); the titration curve, the equivalence point's pH and the half-equivalence point are topic 8.5's (quote them, do not derive them again); what makes a buffer is topic 8.8's; the pH of a salt solution is topic 8.4's. For a base, the lesson uses the p$K_a$ of the conjugate acid and never a p$K_b$. **Equation sheet:** the $K_a$ expression and p$K_a = -\log K_a$ are on it. No indicator table is on it, and no indicator's range or p$K_a$ need be memorized: a question gives them.
- **Opening:** potassium sorbate is on the label of many fruit drinks, where it keeps mold and yeast from growing. Stir the same amount into a food that is not acidic and it does very little. Nothing about the sorbate has changed, only the pH around it, and this lesson is about what the pH of a solution does to a weak acid dissolved in it. Note for the writer: potassium sorbate is the potassium salt of sorbic acid, a weak acid. The opening gives no number; the first worked example does.
- **Section "Two forms of one acid":**
  - A weak acid in solution is always present in two forms: the acid itself, HA, which this unit calls the **acid form**, and its conjugate base, A⁻, the **base form**. (The words are topic 8.4's; say "as before" if the earlier lesson has used them.) The two forms differ by one proton, and they can differ in much else: in color, in smell, in how they act on a living cell.
  - So far in this unit the acid set the pH. Now turn it around. Suppose something else fixes the pH of the solution, such as a strong acid, a buffer, or a food full of other acids, and a small amount of a weak acid is dissolved in it. Which form does the weak acid take?
  - The $K_a$ expression answers at once. Display it, then divide both sides by $[\ce{H3O+}]$. First: $K_a = \dfrac{[\ce{H3O+}][\ce{A-}]}{[\ce{HA}]}$. Then: $\dfrac{[\ce{A-}]}{[\ce{HA}]} = \dfrac{K_a}{[\ce{H3O+}]}$. The ratio of base form to acid form depends on one thing only: how $[\ce{H3O+}]$ compares with $K_a$.
  - Three cases, each one sentence. When $[\ce{H3O+}]$ equals $K_a$, the ratio is 1: the two forms are equal. Taking minus the logarithm of both sides, that is when pH = p$K_a$. When the solution is more acidic than that, $[\ce{H3O+}]$ is larger than $K_a$, the ratio is less than 1, and the acid form has the higher concentration. When it is less acidic, the base form has.
  - Each pH unit is a factor of ten in $[\ce{H3O+}]$ (topic 8.1), so each pH unit away from the p$K_a$ is a factor of ten in the ratio. The table, with one sentence before it:

    | pH of the solution | [H₃O⁺] is | A⁻ : HA |
    |---|---|---|
    | p$K_a$ − 2 | 100 × $K_a$ | 1 : 100 |
    | p$K_a$ − 1 | 10 × $K_a$ | 1 : 10 |
    | p$K_a$ | $K_a$ | 1 : 1 |
    | p$K_a$ + 1 | $K_a$ ÷ 10 | 10 : 1 |
    | p$K_a$ + 2 | $K_a$ ÷ 100 | 100 : 1 |

  - It makes sense without the algebra. A solution with a low pH is crowded with H₃O⁺ ions that give protons away, so the acid keeps its proton. A solution with a high pH has few, and the acid loses its proton.
  - One sentence tying this to topic 8.3: a weak acid alone in water, at a concentration many times its $K_a$, makes a solution whose pH is well below its own p$K_a$, which is the same fact as "only a small part of it is ionized". (Note for the writer: do not write "always" or "in this unit" here. In lesson 8.3's explorer, 0.0010 M and 0.0020 M chloroacetic acid are more than half ionized, and their pH is above the p$K_a$.)
  - `<KeyIdea>`: compare the pH of the solution with the p$K_a$ of the acid. Below the p$K_a$, the acid form has the higher concentration. Above it, the base form has. At pH = p$K_a$ the two are equal, and each pH unit away is a factor of ten.
  - Place the figure `8-7-form-against-ph.svg` here.
- **Worked example "Why a preservative needs an acidic food":** sorbic acid, HC₆H₇O₂, has a p$K_a$ of 4.76. Nearly all of its effect on mold and yeast comes from its acid form. The same small amount of potassium sorbate is dissolved in a fruit drink at pH 2.76 and in a milk pudding at pH 6.76. In each, what is the ratio of the two forms, and what percent of the sorbate ends up in the acid form?
  1. **Compare the pH with the p$K_a$, for the drink.** 2.76 is 2.00 below 4.76. The pH is below the p$K_a$, so the acid form has the higher concentration.
  2. **Turn the difference into a ratio.** Two pH units below the p$K_a$ means $[\ce{H3O+}]$ is 100 times $K_a$. Display: $\dfrac{[\ce{A-}]}{[\ce{HA}]} = \dfrac{K_a}{[\ce{H3O+}]} = \dfrac{10^{-4.76}}{10^{-2.76}} = 10^{-2.00}$. That is 1 sorbate ion for every 100 sorbic acid molecules.
  3. **Turn the ratio into a percent.** Out of every 101 particles, 100 are in the acid form: 100 ÷ 101 = 0.990, or 99.0 percent.
  4. **Do the same for the pudding.** 6.76 is 2.00 above 4.76, so the base form has the higher concentration, by 100 to 1. The acid form is 1 particle in 101: 0.99 percent.
  5. **Say what it means.** The same amount of preservative gives 100 times as much of the working form in the drink as in the pudding (99.0 ÷ 0.99 = 100). That is why sorbate is used in acidic foods. It made no difference that the sorbate went in as the potassium salt, which is the base form: the pH of the food decides how it is shared between the two forms.

  Note for the writer: step 3 must show that a ratio of 100 : 1 is 100 parts in 101, not 100 in 100. Do not work a case one unit from the p$K_a$ here: Check 1 asks for it. Sorbic acid's formula appears once; after that write "sorbic acid" and "sorbate ion". The foods' pH values are chosen to sit a whole number of units from the p$K_a$; say "a fruit drink at pH 2.76", not which drink.
- **Check 1**, `<Check numeric="91" unit="%" tolerance={0.5}>` (accepts 90.55 to 91.45, so 90.9, 90.91 and 91 are all accepted, and 90 is not): "A cider maker adds potassium sorbate to sweet cider at pH 3.76 to keep it from fermenting. The p$K_a$ of sorbic acid is 4.76. What percent of the sorbate is in the acid form, sorbic acid, in the cider?" Why: 3.76 is 1.00 below the p$K_a$, so $[\ce{H3O+}]$ is 10 times $K_a$ and the ratio of base form to acid form is 1 to 10. Out of every 11 particles, 10 are sorbic acid: 10 ÷ 11 = 0.909, or 91 percent. (Display the division.) Slips:
  - `90` (ten to one read as 90 to 10): "A ratio of 10 to 1 is 10 parts out of 11, not out of 10. Count both forms in the total."
  - `10` (the ratio, or the base form of the 90-to-10 split): "Is that the ratio, or the share of the other form? The question asks for the acid form, as a percent of both forms together."
  - `9.1` (the base form's share): "That is the share of the sorbate ion, the base form. Is the pH above or below the pKa, and which form wins there?"
  - `99` (two units used, as in the worked example): "That is the split two pH units below the pKa. How far below 4.76 is 3.76?"

  Note for the writer: sweet cider treated with potassium sorbate is real, and cider is commonly between pH 3.3 and 4.0. Give no volume and no mass.
- **Paragraph "A base follows the same rule"** (still in the first section, after Check 1): a weak base, B, and its conjugate acid, HB⁺, are a pair in the same way. HB⁺ is the acid form and B is the base form, so compare the pH with the p$K_a$ of HB⁺. Below it, the form with the extra proton, HB⁺, has the higher concentration; above it, B has. One number serves: no p$K_b$ is needed.
- **Check 2**, `<Check answer={3}>`: "Fish that is no longer fresh smells of trimethylamine, (CH₃)₃N, a weak base that evaporates easily. Its conjugate acid, (CH₃)₃NH⁺, is an ion and does not evaporate. The p$K_a$ of (CH₃)₃NH⁺ is 9.80. A cook squeezes lemon juice, with a pH of about 2.3, over the fish. Which describes the amine in the juice?" Options:
  1. Nearly all of it is (CH₃)₃N, because a weak base stays mostly un-ionized in water
  2. Nearly all of it is (CH₃)₃N, because below the pKa the base form has the higher concentration
  3. Nearly all of it is (CH₃)₃NH⁺, because the pH is far below the pKa of the acid form
  4. About half of it is each form, because the acid in the juice and the base cancel each other

  Why: the juice sets the pH, at about 2.3. That is about 7.5 units below 9.80, so the acid form, (CH₃)₃NH⁺, has the higher concentration, by a factor of about $10^{7.5}$, which is more than ten million to one. The ion does not evaporate, so the smell fades. A weak base is mostly un-ionized when it is alone in water, where it sets a pH above its conjugate acid's p$K_a$; here something else sets the pH. Below the p$K_a$ it is the acid form that wins, not the base form. And the two forms are equal at one pH only, 9.80. Misses:
  - 1: "That is true of the amine alone in water, where the amine itself sets the pH. Here the juice sets it. Compare that pH with the pKa."
  - 2: "Test that rule on a case you know. The fruit drink at pH 2.76 was two units below sorbic acid's pKa. Which form was 99 percent of the acid there?"
  - 4: "The two forms are equal at one pH only. Compare the pH of the juice with 9.80, and count the units between them."

  Note for the writer: the chemistry is real: citric acid in the juice turns the amine into its salt. Do not name citric acid or write the reaction. "About 2.3" is the juice's pH; the Why says "about 7.5 units" for that reason.
- **Check 3**, `<Check answer={2}>`: "A solution is held at pH 4.40. Small amounts of lactic acid (p$K_a$ 3.86) and propanoic acid (p$K_a$ 4.87) are dissolved in it. Which statement about the two acids is correct?" Options:
  1. Both are mostly in the acid form, because a solution at pH 4.40 is acidic
  2. Lactic acid is mostly lactate ion, and propanoic acid is mostly un-ionized
  3. Lactic acid is mostly un-ionized, and propanoic acid is mostly propanoate ion
  4. Each is half in each form, because 4.40 lies about midway between the two pKa values

  Why: take the acids one at a time, each against its own p$K_a$. For lactic acid, 4.40 is above 3.86, so the base form, lactate, has the higher concentration (about 3.5 to 1, from $K_a/[\ce{H3O+}] = 10^{-3.86}/10^{-4.40}$). For propanoic acid, 4.40 is below 4.87, so the acid form has the higher concentration (about 3 to 1). One solution, one pH, and two different answers, because the two acids have different p$K_a$ values. Whether the solution is acidic compares its pH with 7, which says nothing about either acid's form. And an acid is half in each form only at its own p$K_a$. Misses:
  - 1: "Acidic or basic compares the pH with 7. The form of a weak acid depends on a different comparison. Take each acid with its own pKa."
  - 3: "Take one acid at a time. Is 4.40 above or below 3.86? Then recall which form has the higher concentration on that side of a pKa."
  - 4: "An acid is half in each form only at its own pKa. Midway between two pKa values is the pKa of neither acid."
- **Section "An indicator is a weak acid with two colors":**
  - Topic 4.6 called an indicator a dye that has one color in acid and another in base. Now the reason: an **indicator** is a weak acid whose acid form and base form have different colors. Call the two forms HIn and In⁻. Only a few drops go into the flask, far too little to change the pH. The indicator does not set the pH; it reports it.
  - Bromothymol blue is the indicator of lesson 4.6. Its acid form is yellow and its base form is blue, and its p$K_a$ is about 7.1. More than about a pH unit below 7.1, the yellow form outnumbers the blue by more than ten to one, and all you see is yellow. More than about a unit above, all you see is blue. In between you see both at once, which the eye mixes to green, and at pH 7.1, with the two forms equal, the solution is green.
  - So an indicator does not change at one pH. It changes over a range of roughly two pH units centered near its p$K_a$: about p$K_a$ ± 1. The ranges in tables are the ones people actually see, and they are not exactly symmetric, because the eye picks up one color more easily than the other.
  - The table, with one sentence before it saying that the exam gives a table like this whenever it is needed:

    | Indicator | Acid form to base form | Changes over pH | p$K_a$ |
    |---|---|---|---|
    | Bromocresol green | yellow to blue | 3.8 to 5.4 | about 4.7 |
    | Bromothymol blue | yellow to blue | 6.0 to 7.6 | about 7.1 |
    | Thymol blue | yellow to blue | 8.0 to 9.6 | about 8.9 |

    One sentence after it: all three happen to go from yellow to blue, through green; what separates them is where on the pH scale they do it. And one more: thymol blue has an earlier color change as well, near pH 2, which this lesson does not use.
  - `<KeyIdea>`: an indicator is a weak acid whose two forms differ in color. Its color tells you whether the pH is below its range, inside it or above it, and nothing more.
- **Check 4**, `<Check answer={3}>`: "Two samples are taken from one colorless solution. A few drops of bromothymol blue turn the first sample blue. A few drops of thymol blue turn the second sample yellow. Use the table of indicators above. What do the two tests together show about the pH of the solution?" Options:
  1. It is above 9.6, because a blue indicator means a strongly basic solution
  2. Nothing certain: the two indicators disagree, so one of them must have failed
  3. It is between 7.6 and 8.0: above one indicator's range and below the other's
  4. It is 7.1, the pKa of bromothymol blue, because that indicator has changed color

  Why: each indicator compares the pH with its own range. Bromothymol blue is fully blue above pH 7.6, so the pH is above 7.6. Thymol blue is still fully yellow below pH 8.0, so the pH is below 8.0. Both are true of the same solution, so its pH lies between 7.6 and 8.0. The two indicators do not disagree: they have different p$K_a$ values, so at one pH one of them can be in its base form and the other in its acid form. A single indicator's color gives a limit, not a value; and at pH 7.1 bromothymol blue would be green, not blue. Misses:
  - 1: "Blue says only that bromothymol blue is in its base form. What does the yellow of thymol blue say about the same solution?"
  - 2: "Each indicator compares the pH with its own pKa, so two of them can show different forms in one solution. Use each result as a limit."
  - 4: "At its pKa an indicator is an equal mix of its two forms. What color would bromothymol blue show there?"

  Note for the writer: the sentence in the section above says bromothymol blue is green at pH 7.1. That is what the fourth message relies on. The Check's answer, a pH between two ranges, is stated nowhere above it.
- **Section "Choosing an indicator for a titration":**
  - In a titration the endpoint, the color change you watch for, should come at the equivalence point, to within a drop (topic 4.6). A drop from a buret is about 0.05 mL. Topic 8.5 showed what makes that possible: near the equivalence point the pH leaps by several units for a fraction of a milliliter of titrant.
  - The rule: choose an indicator whose p$K_a$ is close to the pH at the equivalence point. Then its range holds that pH, the whole range lies on the steep part of the curve, and the color goes all the way from one form's to the other's within a drop or two. An indicator whose range lies on a flat part of the curve changes slowly, over many milliliters, and at the wrong volume.
  - Naming an indicator is never the whole answer to a question. The reason is: the pH at the equivalence point, and the range that holds it.
  - Place the figure `8-7-indicator-ranges.svg` here.
- **Worked example "The right indicator and the wrong one":** topic 8.5's flask holds 20.0 mL of 0.150 M lactic acid (3.00 mmol; p$K_a$ 3.86), titrated with 0.200 M NaOH. The equivalence point is at 15.0 mL, where the pH is 8.40. Which of the three indicators in the table marks it, and how far off would bromocresol green be?
  1. **Start from the pH at the equivalence point.** It is 8.40 (topic 8.5), above 7, because the flask then holds the lactate ion, a weak base.
  2. **Find the range that holds it.** Thymol blue changes from pH 8.0 to pH 9.6, and 8.40 lies inside. Its p$K_a$, about 8.9, is the closest of the three to 8.40. Thymol blue is the choice.
  3. **Ask where bromocresol green would finish changing.** It is fully blue at pH 5.4. Use the first section's ratio for lactic acid at that pH. Display, on separate lines: $[\ce{H3O+}] = 10^{-5.4} = 4.0 \times 10^{-6}$ M; $K_a = 10^{-3.86} = 1.4 \times 10^{-4}$; $\dfrac{[\ce{A-}]}{[\ce{HA}]} = \dfrac{1.4 \times 10^{-4}}{4.0 \times 10^{-6}} = 35$.
  4. **Turn the ratio into a volume.** With 35 lactate ions for each lactic acid molecule, 35 parts in 36 of the acid have reacted: 35 ÷ 36 = 0.972. Each lactate ion was made by one OH⁻ ion, and 15.0 mL of the base reacts with all of the acid, so the base added is 0.972 × 15.0 mL = 14.58 mL.
  5. **Compare.** With bromocresol green the flask is fully blue at 14.58 mL, 0.42 mL before the equivalence point, and it began to turn long before that. A student who stopped there would report 2.8 percent too little lactic acid (0.42 ÷ 15.0).

  Note for the writer: the unrounded values are a ratio of 34.7, a fraction of 0.9720 and 14.58 mL; the rounded ones shown (35, then 35 ÷ 36 = 0.972) give the same 14.58 mL. Step 3 is the $K_a$ expression rearranged, as in the first section; do not write it with a logarithm of the ratio (that is topic 8.9's equation). Do not work out where bromocresol green begins to change: the explorer shows it (6.96 mL), and the hand method gives 6.98 there, because near pH 3.8 the acid's own ionization is no longer negligible.
- **Check 5**, `<Check answer={2}>`, placed before the explorer: "Topic 8.5's other flask holds hydrobromic acid, a strong acid, at the same concentration, titrated with the same base. On its curve the pH is 2.54 at 14.5 mL, 7.00 at 15.0 mL and 11.45 at 15.5 mL. Which of the three indicators in the table would change color between 14.5 mL and 15.5 mL?" Options:
  1. Bromothymol blue only, because its range is the one that holds pH 7.00
  2. All three, because each range lies between pH 2.54 and pH 11.45
  3. Thymol blue only, because an endpoint has to come in a basic solution, after the acid is gone
  4. None, because a strong acid's pH changes too suddenly for an indicator to follow

  Why: an indicator changes color when the pH of the flask passes through its range. Between 14.5 mL and 15.5 mL the pH climbs from 2.54 to 11.45, and on the way it passes through 3.8 to 5.4, through 6.0 to 7.6 and through 8.0 to 9.6. All three indicators change within that one milliliter, and the explorer below shows that each does so within a drop of 15.0 mL. Bromothymol blue's p$K_a$ is the closest to 7.00, but the steep part of a strong acid's curve is so tall that the choice hardly matters. A sudden change in pH is what an indicator needs, and a color change does not have to wait for a basic solution: it has to happen at the equivalence point. Misses:
  - 1: "Does a range have to hold the equivalence pH for the curve to pass through it? Check all three ranges against the pH values the question gives."
  - 3: "The endpoint should come at the equivalence point, where the acid has just run out. Check each range against 2.54 and 11.45."
  - 4: "A sudden change in pH is what makes an endpoint sharp. Check which of the three ranges the pH passes through on the way."
- **The interactive diagram:** place `<TitrationCurve />` here, after Check 5, under one sentence that says what it is: topic 8.5's explorer again, 20.0 mL of a 0.150 M acid titrated with 0.200 M sodium hydroxide, with the equivalence point at 15.0 mL; this time, use the control that lays an indicator's range across the graph. The text then asks the student to do four things, as a numbered list, predicting before each move:
  1. **Lactic acid with thymol blue.** Before you choose thymol blue, predict where its band will meet the curve. (The band lies across the steep part. The readout says that the color changes between 15.00 mL and 15.01 mL. Slide to 15.0 mL: the pH is 8.40.)
  2. **Lactic acid with bromocresol green.** Predict from the worked example where the change ends, then look for where it begins. (The band lies across the buffer region. The color changes between 6.96 mL and 14.58 mL: it starts before the half-equivalence point and takes more than 7 mL to finish.)
  3. **Lactic acid with bromothymol blue.** Its range, 6.0 to 7.6, does not hold 8.40. Predict whether it fails as badly as bromocresol green. (It does not. Its band lies on the lower part of the steep rise, and the color changes between 14.89 mL and 15.00 mL: green shows about two drops early, and the full blue arrives at 15.00 mL. That is why lesson 4.6, which used bromothymol blue for this same acid and base, told you to wait for the turn to blue and not to stop at the first tinge of green.)
  4. **Hydrobromic acid with each indicator in turn.** Check 5 was your prediction. (Bromocresol green changes between 14.97 mL and 15.00 mL, bromothymol blue between 15.00 mL and 15.00 mL, thymol blue between 15.00 mL and 15.01 mL. Any of the three marks this equivalence point within a drop.)

  The numbers in parentheses are for the writer to phrase as "you should see". They are the explorer's values (see "The explorer's numbers this lesson quotes").
  - A closing paragraph after the list: the rule "a p$K_a$ close to the pH at the equivalence point" is the one to state in an answer. The explorer shows what lies behind it: an indicator works when its whole range lies on the steep part of the curve. A weak acid's steep part is shorter than a strong acid's and starts higher, so fewer indicators fit, and none whose range lies in the buffer region can.
- **Check 6**, `<Check answer={1}>`: "A weak base is titrated with a strong acid. The pH is 4.70 at the equivalence point. In the last 0.1 mL before it the pH falls from 5.7, and in the first 0.1 mL after it the pH reaches 3.7. Which indicator marks this equivalence point best?" Options:
  1. Bromocresol green (3.8 to 5.4), because its range holds the pH there
  2. Bromothymol blue (6.0 to 7.6), because at an equivalence point the solution is neutral
  3. Thymol blue (8.0 to 9.6), because the flask holds a base, and it changes in basic solution
  4. Any of the three, because every indicator changes when the titrant has used up the analyte

  Why: the pH at the equivalence point is 4.70, and bromocresol green's range, 3.8 to 5.4, holds it; its p$K_a$, about 4.7, could hardly be closer. The curve falls through that whole range within 0.1 mL either side of the equivalence point. This equivalence point is below 7 because the flask then holds the conjugate acid of a weak base (topic 8.5), so "neutral" is the wrong idea, and bromothymol blue's range lies above the steep fall: it would turn yellow too early. Thymol blue would change earlier still, in the buffer region, while much of the base was still there. And an indicator responds to the pH, not to the amounts: each changes where the curve crosses its own range. Misses:
  - 2: "An equivalence point is about amounts, not about pH 7. What does the flask hold at this one, and is that an acid or a base?"
  - 3: "The flask starts out basic, but the endpoint has to come where the base runs out. What does the question say the pH is there?"
  - 4: "An indicator responds to pH, not to amounts. Each one changes where the curve crosses its own range, wherever that is."

  Note for the writer: the three pH values come from a model curve (see "Values"). Name no base and give no volumes or concentrations.
- **Trap:** **Comparing the pH with 7** (whether a solution is acidic says nothing about which form a weak acid is in; compare the pH with that acid's own p$K_a$). **Turning the rule around** (below the p$K_a$ the acid form wins: a low pH means plenty of H₃O⁺, so the acid keeps its proton). **Reading 10 to 1 as 90 percent** (10 to 1 is 10 parts in 11, about 91 percent). **Using a p$K_b$ for a base** (compare the pH with the p$K_a$ of the base's conjugate acid). **Choosing bromothymol blue because "the equivalence point is at pH 7"** (that is true only of a strong acid with a strong base, at 25 °C; find the pH at this equivalence point first). **Naming an indicator with no reason** (give the pH at the equivalence point and the range that holds it). **Thinking an indicator changes at the equivalence point by its nature** (it changes when the pH crosses its range, wherever on the curve that happens).
- **Key points:** a weak acid in solution is shared between its acid form, HA, and its base form, A⁻, and the $K_a$ expression gives their ratio as $K_a$ divided by $[\ce{H3O+}]$; when the pH of a solution is below the p$K_a$ of an acid the acid form has the higher concentration, when it is above the base form has, and at pH = p$K_a$ the two are equal; each pH unit away from the p$K_a$ is a factor of ten in the ratio, so one unit below it the acid is 10 parts in 11 in its acid form, about 91 percent; for a weak base, compare the pH with the p$K_a$ of its conjugate acid; an indicator is a weak acid whose two forms differ in color, and it changes color over a range of about two pH units around its own p$K_a$; a good indicator for a titration has a p$K_a$ close to the pH at the equivalence point, so that its whole range lies on the steep part of the curve.

**Figures**

- **`8-7-form-against-ph.svg`** (viewBox 0 0 480 330, font-size 18). Five horizontal bars, one under another, each split in two.
  - Each bar runs from x = 106 to x = 386 (280 wide) and is 30 tall. Their top edges are at y = 70, 118, 166, 214 and 262. The left part of each bar is the acid form, filled with diagonal hatching in the accent color on the light accent; the right part is the base form, filled with the plain background color. Each bar has an ink outline 1.5 units wide, and an ink line where the two parts meet.
  - Widths of the hatched part, from the ratio at each pH (280 × the fraction in the acid form): 277.2 (100 parts in 101), 254.5 (10 in 11), 140.0 (1 in 2), 25.5 (1 in 11) and 2.8 (1 in 101), from the top bar down.
  - To the left of each bar, right-aligned at x = 96 and centered on the bar: "pKa − 2", "pKa − 1", "pKa", "pKa + 1", "pKa + 2", from the top down. Above them, right-aligned at x = 96 on the baseline y = 52: "pH =".
  - To the right of each bar, left-aligned at x = 396 and centered on the bar: "1 : 100", "1 : 10", "1 : 1", "10 : 1", "100 : 1". Above them, left-aligned at x = 396 on the baseline y = 52: "A⁻ : HA".
  - Two direct labels: "acid form, HA" left-aligned at x = 106 on the baseline y = 52, above the hatched part of the top bar; "base form, A⁻" right-aligned at x = 386 on the baseline y = 316, under the plain part of the bottom bar.
  - No percent appears anywhere in the figure (Check 1 asks for one).
  - Text in the figure, fourteen pieces: "pH =", five pH labels, "A⁻ : HA", five ratios, "acid form, HA" and "base form, A⁻".
  - Alt: "Five bars, one under another, for a weak acid in solutions at five pH values: two units below its pKa, one unit below, at the pKa, one unit above and two units above. Each bar is split into a hatched part for the acid form, HA, and a plain part for the base form, A⁻. Two units below the pKa the bar is almost all hatched, with a ratio of base form to acid form of 1 to 100. One unit below, the ratio is 1 to 10. At the pKa the bar is half and half, 1 to 1. One unit above, the ratio is 10 to 1, and two units above the bar is almost all plain, 100 to 1."
  - Caption: "How a weak acid is shared between its two forms. Below its pKa the acid form has the higher concentration, above it the base form has, and each pH unit is a factor of ten."
- **`8-7-indicator-ranges.svg`** (viewBox 0 0 480 440, font-size 18). A vertical pH axis with three upright bands, one for each indicator, and two dashed horizontal lines.
  - The axis: a vertical ink line at x = 40 from y = 400 (pH 3) up to y = 92 (pH 10), 44 units for each pH unit, so y = 400 − 44 × (pH − 3). A short tick and a number at every whole pH from 3 to 10, the numbers right-aligned at x = 34. The axis title "pH" right-aligned at x = 34 on the baseline y = 72.
  - Three columns centered at x = 106, 218 and 330. Each has a two-line heading centered on the column, on the baselines y = 28 and y = 50: "bromocresol" and "green"; "bromothymol" and "blue"; "thymol" and "blue".
  - Each band is a rectangle 56 wide, centered on its column, with an ink outline and diagonal hatching in the accent color on the light accent. Bromocresol green: x = 78 to 134, y = 294.4 (pH 5.4) to y = 364.8 (pH 3.8). Bromothymol blue: x = 190 to 246, y = 197.6 (pH 7.6) to y = 268.0 (pH 6.0). Thymol blue: x = 302 to 358, y = 109.6 (pH 9.6) to y = 180.0 (pH 8.0). All three bands are the same height, 70.4, because each range is 1.6 pH units.
  - Color words, centered on each column: "blue" on a baseline 6 units above the band's top edge (y = 288.4, 191.6 and 103.6), and "yellow" on a baseline 20 units below the band's bottom edge (y = 384.8, 288.0 and 200.0).
  - Two dashed horizontal lines in the secondary color from x = 40 to x = 388: one at y = 224.0 (pH 7.00) and one at y = 162.4 (pH 8.40). At the right end of each, left-aligned at x = 394: "7.00" on the baseline y = 230 and "8.40" on the baseline y = 168. In the first column, where nothing else is drawn at that height, centered at x = 106: "HBr" on the baseline y = 218, just above the lower line, and "lactic acid" on the baseline y = 156, just above the upper line.
  - What must be true of the drawing: the line at 7.00 passes through the bromothymol blue band and through no other band; the line at 8.40 passes through the thymol blue band, a quarter of the way up it, and through no other band; neither line touches a word.
  - Text in the figure, twenty-five pieces: "pH", eight axis numbers, six heading words, "blue" three times, "yellow" three times, "7.00", "8.40", "HBr" and "lactic acid".
  - Alt: "A vertical pH axis from 3 to 10 with three hatched bands, one for each indicator. Bromocresol green's band runs from pH 3.8 to 5.4, bromothymol blue's from 6.0 to 7.6 and thymol blue's from 8.0 to 9.6. Each band is labeled yellow below its lower end and blue above its upper end. Two dashed lines cross the picture: one at pH 7.00, labeled HBr, which passes through bromothymol blue's band, and one at pH 8.40, labeled lactic acid, which passes through thymol blue's band."
  - Caption: "The ranges of three indicators, with the pH at the equivalence point of topic 8.5's two titrations: 7.00 for hydrobromic acid and 8.40 for lactic acid, each titrated with sodium hydroxide."

**The explorer's numbers this lesson quotes**

`<TitrationCurve />` is specified in the design's section 6.1 and in the "Diagram data" of lesson 8.5's brief, which governs: if a number below differs from that brief's, lesson 8.5's stands and this lesson's sentence is changed to match. The check script computes each one independently, by bisection on the charge balance with $K_w$ included, with lactic acid's $K_a$ equal to $10^{-3.86}$ exactly (the controller's decision; not 1.4 × 10⁻⁴), 3.00 mmol of acid in 20.0 mL and 0.200 M NaOH.

| What the lesson quotes | Value | Unrounded |
|---|---|---|
| Lactic acid, pH at 15.0 mL | 8.40 | 8.397 |
| Hydrobromic acid, pH at 14.5 mL | 2.54 | 2.538 |
| Hydrobromic acid, pH at 15.0 mL | 7.00 | 7.000 |
| Hydrobromic acid, pH at 15.5 mL | 11.45 | 11.450 |
| Lactic acid, bromocresol green changes between | 6.96 mL and 14.58 mL | 6.961 and 14.579 |
| Lactic acid, bromothymol blue changes between | 14.89 mL and 15.00 mL | 14.892 and 14.997 |
| Lactic acid, thymol blue changes between | 15.00 mL and 15.01 mL | 14.999 and 15.007 |
| Hydrobromic acid, bromocresol green changes between | 14.97 mL and 15.00 mL | 14.972 and 14.999 |
| Hydrobromic acid, bromothymol blue changes between | 15.00 mL and 15.00 mL | 15.000 and 15.000 |
| Hydrobromic acid, thymol blue changes between | 15.00 mL and 15.01 mL | 15.000 and 15.007 |

- **The design's indicator values this lesson relies on** (design, section 3, "Values", and section 6.1): bromocresol green, yellow to blue over pH 3.8 to 5.4; bromothymol blue, yellow to blue over pH 6.0 to 7.6; thymol blue's second change, yellow to blue over pH 8.0 to 9.6. Each "changes between" volume is where the chosen curve crosses the lower and the upper end of a range. The lesson also relies on the explorer's flask (20.0 mL of 0.150 M acid, 0.200 M NaOH, equivalence at 15.0 mL), its two acids (lactic acid, p$K_a$ 3.86, and hydrobromic acid), its slider step of 0.5 mL (14.5, 15.0 and 15.5 mL are slider positions) and its readout of the two volumes to 0.01 mL.
- **Lactic acid's $K_a$ in the explorer is $10^{-3.86}$ exactly** (decided by the controller). So the pH at the equivalence point is 8.40, and bromocresol green changes between 6.96 mL and 14.58 mL. Every place where this lesson quotes the explorer uses these values: the worked example (8.40 and 14.58 mL), explorer steps 1 and 2, figure `8-7-indicator-ranges.svg` with its alt text and caption, and the tables above and below.
- **Note for the controller: lesson 8.5's "Diagram data" must use the same constant,** $K_a = 10^{-3.86}$ for lactic acid, not the rounded 1.4 × 10⁻⁴. With 1.4 × 10⁻⁴ the module would show 8.39 at 15.0 mL and 7.01 mL for the start of bromocresol green's change, against this lesson's 8.40 and 6.96 mL, and the end of that change, 14.5846 mL, would lie 0.0004 from a rounding tie (14.58 or 14.59). No other number in the table moves.
- The worked example prints $K_a$ rounded, as $10^{-3.86} = 1.4 \times 10^{-4}$, with $[\ce{H3O+}]$ rounded to 4.0 × 10⁻⁶ M beside it; those two rounded values, and the unrounded ones, both give 14.58 mL. Do not mix a rounded $K_a$ with an unrounded $[\ce{H3O+}]$: that gives 14.59.
- None of the quoted values sits on a rounding tie. The nearest are the pH 8.397 (0.002 above 8.395) and the volume 15.007 (0.002 above 15.005).

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| p$K_a$ of sorbic acid, HC₆H₇O₂ | 4.76 | the design; standard tables; fairly sure **(verify)**. It happens to equal acetic acid's p$K_a$ in lesson 8.6; they are two acids |
| Sorbic acid acts in its acid form, and sorbates are used in acidic foods | no number printed | food chemistry; sure of the statement; the lesson says "nearly all of its effect" |
| pH of sweet cider | 3.76 in Check 1 | cider is commonly pH 3.3 to 4.0; the value is chosen one unit below the p$K_a$ |
| p$K_a$ of (CH₃)₃NH⁺ | 9.80 | the design; tables give 9.80 (some 9.76 to 9.81); fairly sure **(verify)**. It agrees with the $K_b$ of trimethylamine in lesson 8.3, 6.3 × 10⁻⁵ (14.00 + log 6.3 × 10⁻⁵ = 9.799) |
| pH of lemon juice | about 2.3 | the lesson table; 2.0 to 2.6; fairly sure |
| p$K_a$ of lactic acid | 3.86 | the design; sure. The explorer's $K_a$ is $10^{-3.86}$ exactly |
| p$K_a$ of propanoic acid | 4.87 | the design; sure |
| Bromocresol green | yellow to blue over pH 3.8 to 5.4; p$K_a$ about 4.7 | the design (range, sure); the p$K_a$ is fairly sure to 0.2 **(verify)** |
| Bromothymol blue | yellow to blue over pH 6.0 to 7.6; p$K_a$ about 7.1 | the design and lesson 4.6 (range and colors, sure); the p$K_a$ is fairly sure to 0.2 **(verify)** |
| Thymol blue, second change | yellow to blue over pH 8.0 to 9.6; p$K_a$ about 8.9 | the design (range, sure); the p$K_a$ is fairly sure to 0.2 **(verify)**; its first change, red to yellow near pH 2, is mentioned and not used |
| Volume of a drop from a buret | about 0.05 mL | about 20 drops in a milliliter; sure |
| pH at the equivalence point of the lactic acid titration | 8.40 | lesson 8.5 and its explorer, with $K_a = 10^{-3.86}$ exactly (8.397) |
| Check 6's curve | pH 5.7, 4.70 and 3.7 at 0.1 mL before, at, and 0.1 mL after the equivalence point | a model, not printed: 25.0 mL of a 0.100 M weak base whose conjugate acid has p$K_a$ 8.10, titrated with a 0.100 M strong acid (5.71, 4.70, 3.70 by the full charge balance). On it bromothymol blue would change between 18.99 mL and 24.80 mL, and thymol blue between 0.76 mL and 13.93 mL, against an equivalence point at 25.00 mL |
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | used by the check script only |

**Check script:** `scratchpad/unit8/checks/8-7.py`.

**Notes for the writer**

- This lesson has no ICE table and no table of moles. Its only calculations are powers of ten and the worked example's four lines.
- **Never write the Henderson–Hasselbalch equation here**, and never take the logarithm of a ratio. Topic 8.9 writes it. The ratio is always $K_a$ divided by $[\ce{H3O+}]$.
- Use "acid form" and "base form" throughout, and "un-ionized" for the acid form of a neutral acid where an option does. Do not use "protonated" and "deprotonated".
- The pH of a solution is "held" or "set by" something else in every example. Do not suggest that adding a little of the weak acid changes it.
- An indicator "changes over a range", never "at a pH". Its range is "about p$K_a$ ± 1", and the lesson says that the tabulated ranges are what is seen.
- Bromothymol blue must agree with lesson 4.6: yellow in acid, blue in base, green between, and the endpoint is the full turn to blue. Step 3 of the explorer list is where this lesson pays that sentence back. Keep it.
- Do not name phenolphthalein, methyl orange, methyl red, litmus or red cabbage, and do not use aspirin, blood or the stomach as an example of two forms.
- The explorer's caption and controls belong to lesson 8.5's builder. Write only the tag `<TitrationCurve />` on its own line.
- Check 5 sits before the explorer so that the student predicts first. Do not move it.
- Sorbic acid's p$K_a$, 4.76, equals acetic acid's in lesson 8.6 by coincidence. Say nothing about it.

**Reactions, substances and scenarios used:** no chemical equation is written in this lesson; the $K_a$ expression and its rearrangement to $[\ce{A-}]/[\ce{HA}] = K_a/[\ce{H3O+}]$ are its only displayed relations besides arithmetic. Potassium sorbate and sorbic acid, p$K_a$ 4.76: in a fruit drink at pH 2.76 and a milk pudding at pH 6.76, 100 to 1 each way, 99.0 and 0.99 percent in the acid form (opening and worked example 1); in sweet cider at pH 3.76, 91 percent (Check 1). Trimethylamine on fish with lemon juice at pH about 2.3, p$K_a$ of (CH₃)₃NH⁺ 9.80 (Check 2). Lactic acid, p$K_a$ 3.86, and propanoic acid, p$K_a$ 4.87, in a solution held at pH 4.40 (Check 3). Bromocresol green, bromothymol blue and thymol blue, with their ranges and approximate p$K_a$ values (table, figure 2); one solution tested with bromothymol blue (blue) and thymol blue (yellow), pH between 7.6 and 8.0 (Check 4). The explorer's lactic acid titration, 20.0 mL of 0.150 M with 0.200 M NaOH, equivalence at 15.0 mL and pH 8.40: thymol blue chosen, bromocresol green fully blue at 14.58 mL, 2.8 percent early (worked example 2, explorer steps 1 to 3). The explorer's hydrobromic acid titration, pH 2.54, 7.00 and 11.45 at 14.5, 15.0 and 15.5 mL (Check 5, explorer step 4). An unnamed weak base titrated with a strong acid, pH 5.7, 4.70 and 3.7 around the equivalence point (Check 6). Figures: the two the design lists for this lesson.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.7 pH and pKa`).

**Check script:** `scratchpad/unit8/checks/8-7.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.7 pH and pKa`).

---

## Group D: buffers, capacity and solubility (pull request D)

Branch: `topic/unit-8-buffers-and-solubility`, from `topic/unit-8-reactions-and-titrations`.

> **As carried out.** The buffer explorer on Opus, four writers on Fable, then the same checks. One sentence of lesson 8.9 was true only for a rise in the ratio and was changed; no other fact-check found an error. The originality check of the prose had 15 passages reworded, and two headings changed with them (lesson 8.10's first, now "One pH, two sizes of buffer", and lesson 8.11's "Which anions react with acid"). With all eleven lessons in, the check-feedback data file holds 67 Checks, the sweep tried 238 wrong answers and every one showed its message, and Unit 8 went on `BALANCED_UNITS`. Task 12's list for the teacher is the "As built" section of the design.

Lesson 8.10's brief holds the "Diagram data" of the buffer explorer. With all eleven lessons in, Unit 8 goes on `BALANCED_UNITS`, and the last task closes the unit out.

> **How these briefs were checked.** The first fact-checks confirmed every value and all 8,400 states of the buffer explorer's model. They found one false sentence (lesson 8.9, about unequal dilution), messages that gave too much away, and two Checks in lessons 8.8 and 8.9 that tested the same fact; one was replaced. The originality check had lesson 8.8's "Buffer or not?" cases, lesson 8.10's worked addition and its first Check, and lesson 8.11's salts changed (strontium fluoride and thallium(I) chloride are lesson 7.11's and 7.12's own worked examples). A second check found one message to replace and four wording points.

### Task 8: Lesson 8.8, Properties of Buffers

**Files:**
- Create: `src/content/lessons/unit-8/8-8-properties-of-buffers.mdx`
- Create: `public/figures/8-8-buffer-three-boxes.svg`, `public/figures/8-8-buffer-or-not.svg`
- No interactive diagram.

**Brief**

- **Front matter:** `topic: "8.8"`, `minutes: 14`, summary: "What a buffer is made of, the two reactions that use up added acid and added base, why they leave the pH almost unchanged, and how to tell a buffer from a mixture that is not one." (No colon in the summary.)
- **Framework (8.8, one statement):** a buffer holds large concentrations of both members of a conjugate acid–base pair. The acid member reacts with base that is added and the base member reacts with acid that is added, and those two reactions are the reason the pH holds. The objective is an explanation: tie the buffer's hold on the pH to the reactions that happen when acid or base goes in. **What this lesson does not do:** the pH of a buffer as a number, and the Henderson–Hasselbalch equation, are topic 8.9's (this lesson uses only the relation of topic 8.4, $[\ce{H3O+}] = K_a \times$ moles of acid form ÷ moles of base form, and never takes a logarithm of a ratio); how much acid or base a buffer can take, and the words "buffer capacity", are topic 8.10's (this lesson says only that a buffer works until one member runs out); the titration curve is topic 8.5's (one sentence points back to it). No pH after an addition is calculated. **Equation sheet:** nothing on it is needed here. It has no definition of a buffer and no buffer reaction.
- **Opening:** a school laboratory sets its pH meter with a bottle of calibration solution marked pH 7. Put one drop of 1.0 M hydrochloric acid into a liter of pure water at 25 °C and the pH falls from 7.00 to 4.30. Put the same drop into a liter of the calibration solution and the meter's reading does not change in its second decimal place. The solution is a buffer, and what it holds is two ions you met in topic 4.8: H₂PO₄⁻ and HPO₄²⁻, the pair that helps to hold the acidity inside your cells steady. Notes for the writer: a drop is taken as 0.05 mL, so it carries 5.0 × 10⁻⁵ mol of H₃O⁺ and gives 5.0 × 10⁻⁵ M in 1.00 L, pH 4.30 (topic 8.2). Give the drop's size in the sentence ("about 0.05 mL"). Do not give the calibration solution's concentrations or say its two ions are equal in amount (a pH 7.00 phosphate buffer is not an equal mixture). Say "a liter of the calibration solution" and "does not change in the second decimal place", nothing stronger.
- **Section "Two members of one pair":**
  - A **buffer** is a solution that holds large amounts of both members of a conjugate acid–base pair (topic 4.8), and so resists a change in its pH when a little strong acid or strong base is added. Call the member that has the proton the acid form and the member without it the base form. (Topic 8.7 used these two names. Do not put them in bold again if lesson 8.7 already has.)
  - In the calibration solution the acid form is the dihydrogen phosphate ion, H₂PO₄⁻, and the base form is the hydrogen phosphate ion, HPO₄²⁻. They differ by one proton. They are put in as two salts, potassium dihydrogen phosphate, KH₂PO₄, and sodium hydrogen phosphate, Na₂HPO₄, and the K⁺ and Na⁺ ions are spectators.
  - The pair must be a weak one: a weak acid with its conjugate base, or a weak base with its conjugate acid. The acid form has to keep its proton until a base arrives, which a weak acid does. The base form has to be able to take a proton, which the conjugate base of a weak acid can.
  - "Large amounts" means two things. Each member is present in an amount much larger than the acid or base the solution is meant to take. And neither member is tiny beside the other. A weak acid alone in water is not a buffer: in most solutions of a weak acid only a few percent of it, or less, is in the base form (topic 8.3), so it has almost nothing that can take up added acid.
  - Topic 8.4 met a buffer once already, without dwelling on it: it is what is left in the flask when a weak acid has reacted with less than enough strong base. So there are two ways to make one. Dissolve both members, the weak acid and a salt of its conjugate base. Or start with one member and turn part of it into the other with a strong base or a strong acid.
- **Section "What happens to added acid, and to added base":**
  - One paragraph before the worked example: a strong acid arrives in the buffer as H₃O⁺ ions, and a strong base as OH⁻ ions (topic 8.2). The buffer has something ready for each.
  - **Worked example "The two reactions of the phosphate buffer":** a buffer holds H₂PO₄⁻ and HPO₄²⁻ in large amounts. Write the reaction that uses up added strong acid and the reaction that uses up added strong base, and say what each does to the amounts of the two members.
    1. **Name the two forms.** H₂PO₄⁻ has the extra proton: it is the acid form. HPO₄²⁻ is the base form.
    2. **Added acid meets the base form.** H₃O⁺ is an acid, so it reacts with the member that can take a proton, HPO₄²⁻. Display, split after the arrow:
       `\ce{H3O+(aq) + HPO4^2-(aq) -> H2PO4-(aq) + H2O(l)}`
       The arrow is single: H₃O⁺ is a strong acid, and the reaction goes essentially to completion (topic 8.4).
    3. **Added base meets the acid form.** OH⁻ is a base, so it reacts with the member that has a proton to give, H₂PO₄⁻. Display, split after the arrow:
       `\ce{OH-(aq) + H2PO4-(aq) -> HPO4^2-(aq) + H2O(l)}`
       Single arrow again, for a strong base.
    4. **Say what each reaction does to the amounts.** Each H₃O⁺ ion that reacts turns one HPO₄²⁻ ion into one H₂PO₄⁻ ion: the base form goes down by the amount of acid added and the acid form goes up by the same amount. Each OH⁻ ion does the reverse. Either way the total of the two members stays the same.
    5. **Say what became of the strong acid or base.** The H₃O⁺ is gone, and in its place there is a little more H₂PO₄⁻, a weak acid. The OH⁻ is gone, and in its place there is a little more HPO₄²⁻, a weak base. Each reaction trades a strong acid or base for a weak one.

    Notes for the writer: write the equations exactly as given, with H₃O⁺ and with water as a product. Both are balanced in atoms and in charge (the script checks). Do not write H₃PO₄ or PO₄³⁻ anywhere in this lesson, and do not say that H₂PO₄⁻ can also take a proton or that HPO₄²⁻ can also give one: near pH 7 fewer than one phosphate in ten thousand is in either of those other forms, and the lesson is about one pair. Do not print a p$K_a$ for H₂PO₄⁻; if a number is wanted, say the pair buffers "near pH 7".
  - `<KeyIdea>`: a buffer holds both members of a weak conjugate pair. Its base form uses up added H₃O⁺ and its acid form uses up added OH⁻. An explanation of a buffer needs both reactions.
  - **Check 1** goes here (below).
  - Place the figure `8-8-buffer-three-boxes.svg` here, with two sentences: the drawing counts particles for a buffer of a weak acid HA and its conjugate base A⁻. Two H₃O⁺ ions turn two A⁻ into two HA; starting again from the first box, two OH⁻ ions turn two HA into two A⁻.
  - **Check 3** goes here (below). (Checks are numbered in the order of the suggestions in the lesson table; on the page the order is 1, 3, 2, 4, 5, 6. The data file numbers them by position on the page.)
- **Check 1**, `<Check answer={3}>`: "Pyridine, C₅H₅N, is a weak base, and its conjugate acid is the pyridinium ion, C₅H₅NH⁺ (topic 4.2). A buffer holds large amounts of both, the second from the salt pyridinium bromide. A little sodium hydroxide solution is added. Which equation shows how the buffer uses up the added hydroxide ions?" The four equations are lettered blocks in the question, each split after the arrow where it is long:
  - A: `\ce{C5H5N(aq) + H2O(l) <=> C5H5NH+(aq) + OH-(aq)}`
  - B: `\ce{H3O+(aq) + OH-(aq) -> 2H2O(l)}`
  - C: `\ce{C5H5NH+(aq) + OH-(aq) -> C5H5N(aq) + H2O(l)}`
  - D: `\ce{C5H5N(aq) + OH-(aq) -> C5H4N-(aq) + H2O(l)}`

  Options:
  1. Equation A
  2. Equation B
  3. Equation C
  4. Equation D

  Why: added OH⁻ is a base, so it reacts with the member of the pair that has a proton to give. In this buffer that is the pyridinium ion, the acid form, although it is the conjugate acid of a base and carries a positive charge. Equation C turns the strong base OH⁻ into water and a little more of the weak base pyridine. Equation A is pyridine reacting with water: it makes hydroxide ions and uses none up. Equation B does happen, but a buffer of this pair holds far too few H₃O⁺ ions for it to take up more than a trace of what is added. Equation D asks pyridine, the base form, to give a proton to a base, which it does not do. Misses:
  - 1: "That is pyridine reacting with water, which makes OH⁻. The question asks for the reaction that uses up OH⁻ that was added."
  - 2: "This buffer holds only a trace of H₃O⁺, far too little to take up the added base. Look for a reaction of one of the buffer's two members."
  - 4: "Pyridine is the base form of this pair. Would a base give a proton to OH⁻?"

  Notes for the writer: all four equations are balanced in atoms and charge, so balance does not give the answer away. Equation D is not a real reaction and is offered only as an option; do not write it anywhere else. Bromide ions are spectators and are in none of the equations.
- **Check 3**, `<Check numeric="6" unit="HA molecules">`: "A particle drawing of a buffer shows 9 HA molecules and 5 A⁻ ions. Three OH⁻ ions are added, and all three react. How many HA molecules does the drawing show afterward?" Why: OH⁻ is a base, so it takes a proton from the acid form: HA + OH⁻ → A⁻ + H₂O. Each OH⁻ ion uses up one HA molecule and makes one A⁻ ion. So 9 − 3 = 6 HA molecules are left, and there are 5 + 3 = 8 A⁻ ions. The total is still 14. Slips:
  - `12` (the three added to HA): "Did you add the 3 to the HA molecules? OH⁻ takes a proton from HA, so each OH⁻ ion uses up one HA molecule."
  - `8` (the A⁻ count afterward): "That is the number of A⁻ ions afterward. The question asks for the HA molecules."
  - `9` (no reaction): "That is the count before the reaction. Each OH⁻ ion reacts with one member of the pair. Which one has a proton to give?"
  - `2` (the three taken from A⁻): "Did you take the 3 from the A⁻ ions? A⁻ is the base form, and OH⁻ does not react with it."
  - `3` (the number that reacted): "That is how many HA molecules reacted. The question asks how many are left."

  Note for the writer: the equation in the Why is set as display math, `\ce{HA(aq) + OH-(aq) -> A-(aq) + H2O(l)}`. The numbers 9, 5 and 3 are not those of the figure (6, 6 and 2), on purpose.
- **Section "What is not a buffer":**
  - Three things can go wrong. The pair may not be a weak one. The two substances may not be the two members of one pair. Or one member may be missing once the mixture has finished reacting. So judge a mixture in two steps: let any reaction with a strong acid or strong base go to completion, in moles (topic 8.4), then look at what is left and ask whether both members of one weak pair are there in large amounts.
  - **Worked example "Buffer or not?":** four solutions are made up, each in a liter of water. Which are buffers? (a) 100 mmol of formic acid, HCHO₂, a weak acid, with 40 mmol of sodium hydroxide. (b) Formic acid with pyridinium bromide, the salt that supplies the pyridinium ion, C₅H₅NH⁺, the conjugate acid of the weak base pyridine. (c) 50 mmol of sodium formate with 50 mmol of hydrobromic acid, a strong acid. (d) Tris, a weak base used in biology laboratories, with its salt Tris hydrochloride, which supplies the conjugate acid of Tris.
    1. **(a) React first.** HCHO₂ + OH⁻ → CHO₂⁻ + H₂O goes to completion, and the hydroxide runs out first. A table of moles, in mmol (three columns, as topic 8.4 lays it out):

       | | HCHO₂ | OH⁻ | CHO₂⁻ |
       |---|---|---|---|
       | Before | 100 | 40 | 0 |
       | Change | −40 | −40 | +40 |
       | After | 60 | 0 | 40 |

       What is left is 60 mmol of formic acid and 40 mmol of formate ion: both members of a weak pair, in large amounts. **A buffer**, though no formate was put in.
    2. **(b) Look for the pair.** Formic acid is the acid form of one pair, and its base form, the formate ion, was not put in. The pyridinium ion is an acid form too, of another pair, and its base form, pyridine, was not put in either. Both are acids, so they do not react with each other, and nothing here makes more than a trace of either base form. Added OH⁻ would be used up, by either acid. Added H₃O⁺ would find almost nothing to take its proton. **Not a buffer.** Two weak members are not enough: they must be an acid form and its own base form.
    3. **(c) React first.** The H₃O⁺ of the hydrobromic acid reacts with formate ion, the base form: H₃O⁺ + CHO₂⁻ → HCHO₂ + H₂O, to completion. A table of moles, in mmol:

       | | H₃O⁺ | CHO₂⁻ | HCHO₂ |
       |---|---|---|---|
       | Before | 50 | 50 | 0 |
       | Change | −50 | −50 | +50 |
       | After | 0 | 0 | 50 |

       What is left is 50 mmol of formic acid, with Na⁺ and Br⁻ as spectators. All of the base form went into making the acid form, and a weak acid alone is not a buffer. **Not a buffer.**
    4. **(d) Look for the pair.** Tris is a weak base, so its conjugate acid is a weak acid. Both members of one pair are present, and nothing reacts to completion. **A buffer**: the conjugate acid uses up added OH⁻ and Tris uses up added H₃O⁺.

    Notes for the writer: the equations in steps 1 and 3 are display math with state symbols, `\ce{HCHO2(aq) + OH-(aq) -> CHO2-(aq) + H2O(l)}` and `\ce{H3O+(aq) + CHO2-(aq) -> HCHO2(aq) + H2O(l)}` (each split after the arrow). Each table is a table of moles, never called an ICE table. Give no formula for Tris here (lesson 8.9 gives it); "Tris" and "its conjugate acid" are enough. Tris hydrochloride is a real reagent, the salt of the conjugate acid of Tris with chloride, and pyridinium bromide is a real salt, the one in Check 1. Give no amounts for (b) or (d). In (b), do not print a p$K_a$ for either acid (3.75 and about 5.2), and do not say which is the stronger. Formic acid is written HCHO₂ and formate CHO₂⁻, as the design's table writes them. Cases (b) and (c) replaced a strong acid with its salt and a strong acid with a strong base after the originality check; do not bring those two mixtures back as cases.
  - The first of the three things, a pair that is not weak, is the case of a strong acid, HX, with a salt of its anion, X⁻. In water all of the acid is H₃O⁺ and X⁻, and X⁻ essentially never takes a proton (topic 4.8). Place the figure `8-8-buffer-or-not.svg` here, with one sentence: the same added H₃O⁺ ion meets a buffer on the left and a strong acid with its salt on the right.
  - **Check 2** goes here (below).
- **Check 2**, `<Check answer={4}>`: "Formic acid, HCHO₂, is a weak acid, and sodium formate is a soluble salt of its conjugate base. Hydrobromic acid is a strong acid and potassium hydroxide is a strong base. Each mixture below is made up in a liter of water. Which one is a buffer?" Options:
  1. 0.20 mol of formic acid with 0.20 mol of KOH
  2. 0.20 mol of sodium formate with 0.050 mol of KOH
  3. 0.20 mol of formic acid with 0.050 mol of HBr
  4. 0.20 mol of sodium formate with 0.050 mol of HBr

  Why: let each mixture react first. In the fourth, H₃O⁺ from the HBr reacts with formate ion, the base form, and runs out: 0.050 mol of formic acid forms and 0.15 mol of formate is left. Both members of a weak pair are there in large amounts, so it is a buffer, made this time from the base form and a strong acid. In the first, equal moles of formic acid and OH⁻ leave formate ions and no formic acid to speak of: one member only. In the second, formate and OH⁻ are both bases and do not react, so there is no acid form. In the third, formic acid and HBr are both acids and do not react, so there is no base form beyond a trace. Misses:
  - 1: "React them first. With equal moles of formic acid and a strong base, how much formic acid is left afterward?"
  - 2: "Formate ion is the base form, and OH⁻ is a base too. Do they react? Then ask which member of the pair is missing."
  - 3: "Formic acid and HBr are both acids, so nothing here turns formic acid into formate. Which member of the pair is missing?"

  Note for the writer: none of these four is a mixture of the worked example. Do not add a table to the question; the Why may show the one line 0.20 − 0.050 = 0.15.
- **Section "Why the pH barely moves":**
  - Topic 8.4 found the hydronium concentration of a mixture of a weak acid and its conjugate base from the $K_a$ expression. Display: $[\ce{H3O+}] = K_a \times \dfrac{\text{moles of acid form}}{\text{moles of base form}}$. $K_a$ is fixed at a given temperature. So $[\ce{H3O+}]$ moves only as far as the ratio of the two amounts moves.
  - Give the ratio numbers. Take a liter of a phosphate buffer that holds 40 mmol of H₂PO₄⁻ and 40 mmol of HPO₄²⁻, and add 1 mmol of H₃O⁺. The reaction of the worked example turns 1 mmol of the base form into the acid form: 41 mmol and 39 mmol. The ratio of acid form to base form goes from 1.00 to 1.05, so $[\ce{H3O+}]$ rises by 5 percent. A 5 percent change in $[\ce{H3O+}]$ is about 0.02 of a pH unit.
  - Now put the same 1 mmol of H₃O⁺ into a liter of pure water, where nothing reacts with it. $[\ce{H3O+}]$ goes from 1.0 × 10⁻⁷ M to 1.0 × 10⁻³ M: ten thousand times as large, and the pH falls from 7.00 to 3.00 (at 25 °C).
  - The difference is the two things the buffer does. It removes the strong acid by reaction. And it has so much of both members that the reaction hardly changes their ratio.
  - A buffer does not keep the pH constant. The ratio did change, a little, and so did the pH. A buffer resists a change in pH.
  - `<KeyIdea>`: in a buffer, $[\ce{H3O+}]$ is $K_a$ times the ratio of acid form to base form. Added acid or base changes the two amounts by a little of each, the ratio by a few percent, and the pH by a few hundredths.
  - Note for the writer: this is the lesson's only arithmetic. It stops at the ratio and the percent, and at "about 0.02". Do not print a pH for the phosphate buffer before or after, do not take a logarithm on the page, and do not write the Henderson–Hasselbalch equation or its name (topic 8.9). The numbers: 41 ÷ 39 = 1.051; log of 1.051 is 0.022.
- **Check 4**, `<Check answer={1}>`: "A liter of a buffer holds 80 mmol of formic acid and 80 mmol of sodium formate. A student adds 4 mmol of sodium hydroxide, and the pH meter's reading rises by only 0.04. Which statement explains why the change is so small?" Options:
  1. The OH⁻ reacted with formic acid, and the two amounts are still nearly equal
  2. The OH⁻ reacted with formate ions, which are present in a large amount
  3. The OH⁻ stayed in solution, but a liter of buffer diluted it too far to matter
  4. The buffer replaced the formic acid that reacted, so neither amount changed

  Why: OH⁻ is a base, so it reacts with the acid form: 4 mmol of formic acid becomes 4 mmol of formate. The buffer now holds 76 mmol of formic acid and 84 mmol of formate. The ratio of acid form to base form went from 1.00 to 0.90, and $[\ce{H3O+}]$ fell with it, by about 10 percent, which is 0.04 of a pH unit. Formate is the base form and has no proton to give to OH⁻. If the 4 mmol of OH⁻ had stayed free in a liter, the pH would be 11.60 (at 25 °C). And nothing replaces what reacts: the amounts do change, only not by much beside 80 mmol. Misses:
  - 2: "Formate ion is the base form of the pair. A base does not use up another base. Which member has a proton to give to OH⁻?"
  - 3: "If 4 mmol of OH⁻ stayed free in a liter, the pH would be near 11.6. The OH⁻ did not stay as OH⁻. What did it react with?"
  - 4: "Nothing replaces what reacts: 4 mmol of one member became 4 mmol of the other. Work out the two new amounts."

  Notes for the writer: 76 ÷ 84 = 0.905; the rise is log(84 ÷ 76) = 0.043, given in the question as 0.04 so that no student has to compute it. In the Why, say "which is 0.04 of a pH unit" without showing a logarithm. 4 mmol of OH⁻ in 1.00 L is 4.0 × 10⁻³ M, pOH 2.40, pH 11.60 at 25 °C.
- **Check 5**, `<Check answer={2}>`: "A buffer made from a weak acid and its sodium salt has a pH of 4.45. A technician pours 100 mL of it into a flask and adds 100 mL of pure water. What is the pH of the diluted buffer?" Options:
  1. About 4.75, because every concentration has been cut in half
  2. Still about 4.45, because both members were diluted alike
  3. About 5.7, halfway to 7, because half of the liquid is now water
  4. About 4.15, because the added water brings in more H₃O⁺

  Why: in a buffer, $[\ce{H3O+}]$ is $K_a$ times the moles of acid form over the moles of base form. The water changed neither amount. Both concentrations were halved, and their ratio is what it was, so $[\ce{H3O+}]$ and the pH are almost unchanged. Halving $[\ce{H3O+}]$ would raise the pH by 0.30, and that is what the same dilution does to a strong acid alone, which has nothing to keep its $[\ce{H3O+}]$ up. Water does not pull a pH toward 7 in proportion to its volume. And pure water holds far less H₃O⁺ than this buffer, so it cannot make it more acidic. The word "almost" matters: dilute a buffer many thousands of times and it stops being one, because the amounts are no longer large. Misses:
  - 1: "That is what this dilution does to a strong acid alone. In a buffer, [H₃O⁺] is set by Ka and the two amounts. Which of those did the water change?"
  - 3: "Water does not pull a buffer toward 7 in proportion to its volume. [H₃O⁺] is set by Ka and the two amounts. Which of those did the water change?"
  - 4: "Pure water holds far less H₃O⁺ than this buffer does, so it cannot make it more acidic. Ask what sets [H₃O⁺] in a buffer."

  Notes for the writer: this Check comes right after the key idea of "Why the pH barely moves", and the text before it must not say what dilution does to a buffer: the Check is where the student works it out, and the key points state it afterward. log 2 = 0.30; (4.45 + 7.00) ÷ 2 = 5.7.
- **Section "A buffer has a limit":**
  - Open with one sentence and then the Check: each of the two reactions takes from one member of the pair and adds to the other.
  - **Check 6** goes here (below), before the rest of the section.
  - After the Check: in the Check the hydrobromic acid used up an eighth of the Tris, and each further addition uses up more. A buffer works only while both members are left. Add strong base and the acid form goes down. When it is used up, the next hydroxide ions have nothing to react with, they stay in the solution as OH⁻, and the pH jumps. Add strong acid and the same thing happens at the other end, when the base form is used up.
  - You have seen this before. On the titration curve of a weak acid (topic 8.5), the nearly flat stretch is the buffer at work, and the steep rise at the equivalence point is the acid form running out.
  - One sentence: how much strong acid or base a buffer can take before that happens depends on how much of each member it holds, and topic 8.10 takes that up.
- **Check 6**, `<Check answer={4}>`: "A liter of a buffer holds 80 mmol of Tris, a weak base, and 40 mmol of its conjugate acid. A technician adds 10 mmol of hydrobromic acid, a strong acid. What does the buffer hold when the reaction is over, and which way has its pH moved?" Options:
  1. 90 mmol of Tris and 30 mmol of its conjugate acid, and the pH is a little higher
  2. 70 mmol of Tris and 40 mmol of its conjugate acid, and the pH is a little lower
  3. 80 mmol of Tris and 40 mmol of its conjugate acid, as before, and the pH has not moved
  4. 70 mmol of Tris and 50 mmol of its conjugate acid, and the pH is a little lower

  Why: the H₃O⁺ of the hydrobromic acid is an acid, so it reacts with the base form, which in this buffer is Tris itself. Each H₃O⁺ ion turns one Tris molecule into one ion of the conjugate acid. Tris goes down by 10 mmol, to 70 mmol, and the conjugate acid goes up by 10 mmol, to 50 mmol. The total is still 120 mmol. The ratio of acid form to base form rose from 0.50 to 0.71, and $[\ce{H3O+}]$ rose with it, so the pH is lower, though only a little. The Tris that reacted did not vanish: it became the other member. And a buffer does not stop the reaction or pin the pH: the reaction is how it holds the pH nearly steady. Misses:
  - 1: "H₃O⁺ is an acid, so it reacts with the member that can take a proton. Is that Tris or its conjugate acid? That member goes down."
  - 2: "Add up this answer's two amounts. Each H₃O⁺ that reacts turns one particle of one member into one of the other. Can the total of 120 mmol change?"
  - 3: "A buffer does not stop the reaction. Its hold on the pH comes from the reaction: 10 mmol of H₃O⁺ reacted with one member. Which one?"

  Notes for the writer: give no pH here, before or after, and no size for the change: "a little lower" is all. (40 ÷ 80 = 0.50 and 50 ÷ 70 = 0.714; the fall would be log(0.714 ÷ 0.50) = 0.15, which is not printed.) Write the reaction in words, with no formula for Tris. This Check was changed after the originality check: it no longer asks what happens when a member is used up, which the text below states and lesson 8.10's Check 4 asks. Do not turn it back into a question about the limit.
- **Trap:** **Giving one reaction when the question asks how a buffer works** (an explanation needs both: the base form uses up added acid and the acid form uses up added base). **Having the wrong member react** (added OH⁻ reacts with the acid form, added H₃O⁺ with the base form; a base does not use up a base). **Saying a buffer keeps the pH constant** (the pH does change, by a little; a buffer resists a change). **Calling a strong acid with its salt a buffer** (the anion of a strong acid takes up nothing; the pair must be a weak one). **Taking any two weak acids or bases for a buffer** (the two members must be an acid form and its own base form, one proton apart). **Judging a mixture before it has reacted** (a weak acid with less than enough strong base becomes a buffer; with an equal amount it does not, and a base form with an equal amount of strong acid does not either). **Expecting water to change a buffer's pH the way it changes a strong acid's** (water changes both amounts' concentrations alike and leaves their ratio alone).
- **Key points:** a buffer is a solution that holds large amounts of both members of a weak conjugate acid–base pair, the acid form and the base form; the base form uses up added H₃O⁺ and the acid form uses up added OH⁻, each by a reaction that goes to completion and turns a strong acid or base into a weak one; in a buffer $[\ce{H3O+}]$ equals $K_a$ times the ratio of acid form to base form, and a small addition changes that ratio, and so the pH, only a little; a buffer resists a change in pH and does not hold it constant; a strong acid with its salt, two acid forms from different pairs and a weak acid alone are not buffers, and a mixture is judged after any reaction with a strong acid or base has gone to completion; diluting a buffer with water leaves its pH almost unchanged, because both members are diluted alike; a buffer works until one of its two members is used up, and then the pH changes sharply.

**Figures**

- **`8-8-buffer-three-boxes.svg`** (viewBox 0 0 480 470, font-size 18). Three boxes of particles, one above and two below, joined by two arrows.
  - Particle shapes, the same in both of this lesson's figures. **HA** (the acid form): a circle of radius 13 filled with the light accent, ink outline, with a small solid ink dot of radius 5 touching its upper right edge (the proton). **A⁻** (the base form): the same circle with no dot and a short ink bar (a minus sign, drawn as a line 10 units long) at its center. The two differ in shape (the dot), not in color.
  - Top box: a rounded rectangle about 200 wide and 130 tall, centered (x from 140 to 340, y from 44 to 174), ink outline, no fill beyond the background. Above it, centered, the text "Buffer: 6 HA, 6 A⁻". Inside, **6 HA and 6 A⁻**, on a grid of four columns and three rows, the two kinds mixed and not sorted into halves.
  - Two arrows in the accent color leave the bottom edge of the top box, one down and to the left to the top of the lower left box, one down and to the right to the top of the lower right box. Beside the left arrow, on its outer side, the text "+ 2 H₃O⁺". Beside the right arrow, on its outer side, "+ 2 OH⁻".
  - Lower left box (x from 20 to 220, y from 270 to 400): **8 HA and 4 A⁻**, same grid. Under it, centered: "8 HA, 4 A⁻".
  - Lower right box (x from 260 to 460, y from 270 to 400): **4 HA and 8 A⁻**. Under it: "4 HA, 8 A⁻".
  - A key along the bottom (y about 452): an HA particle followed by "HA, acid form", then an A⁻ particle followed by "A⁻, base form".
  - Counts conserved: every box holds 12 particles of the pair. From the top box to the lower left, 2 A⁻ have become 2 HA (two protons arrived on H₃O⁺). From the top box to the lower right, 2 HA have become 2 A⁻ (two protons left on water molecules). Water molecules, the added H₃O⁺ and OH⁻ ions themselves, and every spectator ion are left out of the boxes.
  - Text in the figure, seven pieces: "Buffer: 6 HA, 6 A⁻", "+ 2 H₃O⁺", "+ 2 OH⁻", "8 HA, 4 A⁻", "4 HA, 8 A⁻", "HA, acid form", "A⁻, base form".
  - Alt: "Three boxes of particles. The top box, labeled buffer, holds 6 HA molecules and 6 A minus ions. An arrow labeled plus 2 H3O plus leads to a lower left box holding 8 HA and 4 A minus. A second arrow, labeled plus 2 OH minus, leads from the top box to a lower right box holding 4 HA and 8 A minus. A key shows that HA, the acid form, is drawn as a circle with a small dot attached and A minus, the base form, as a circle with a minus sign."
  - Caption: "Added acid turns base form into acid form, and added base does the reverse. Both members are still there afterward. Water molecules and spectator ions are left out."
- **`8-8-buffer-or-not.svg`** (viewBox 0 0 480 400, font-size 18). Two panels side by side, each 220 wide (x from 10 to 230 and from 250 to 470).
  - Particle shapes: HA and A⁻ as in the first figure. **H₃O⁺**: a solid ink circle of radius 9 with a white plus sign drawn as two crossed lines. **X⁻** (the anion of a strong acid): a square of side 20, filled with diagonal hatching in the secondary color, ink outline, with a short ink bar (minus sign) at its center. X⁻ and A⁻ differ in shape (square against circle) and in fill (hatched against plain).
  - Left panel. Title at the top, centered: "A buffer". Under the title, a box (x from 20 to 220, y from 90 to 250). Inside the box, **5 HA and 5 A⁻**, mixed. Above the box, between the title and the box's top edge, **one H₃O⁺** with an arrow in the accent color that enters the box and ends at one A⁻ ion, touching no other particle. Under the box, two lines of text: "HA and A⁻" and then "A⁻ takes the proton".
  - Right panel. Title: "Not a buffer". A box of the same size (x from 260 to 460). Inside, **5 H₃O⁺ and 10 X⁻**, mixed, the ions apart from one another. Above the box, **one H₃O⁺** with an arrow that enters the box and ends in an empty space, pointing at no particle. Under the box: "H₃O⁺ and X⁻" and then "Nothing takes it".
  - Counts: the left box stands for a weak acid with a salt of its conjugate base (5 HA from the acid, 5 A⁻ from the salt; the weak acid is drawn wholly un-ionized, since in a buffer far fewer than one in five of its molecules is ionized). The right box stands for the same amounts of a strong acid and its salt: the 5 units of strong acid are 5 H₃O⁺ and 5 X⁻, and the salt adds 5 more X⁻, 10 in all. The cations of the two salts, the anion that came with the arriving H₃O⁺, and water are left out, and the caption says so.
  - Text in the figure, six pieces: "A buffer", "Not a buffer", "HA and A⁻", "A⁻ takes the proton", "H₃O⁺ and X⁻", "Nothing takes it".
  - Alt: "Two panels. On the left, labeled a buffer, a box holds 5 HA molecules and 5 A minus ions, and an arrow from one arriving H3O plus ion ends at an A minus ion; the text below says A minus takes the proton. On the right, labeled not a buffer, a box holds 5 H3O plus ions and 10 X minus ions, drawn as hatched squares, and the arrow from one arriving H3O plus ion ends in empty space; the text below says nothing takes it."
  - Caption: "One more H₃O⁺ ion arrives. The buffer's base form takes its proton. The anion of a strong acid does not, so the ion stays as H₃O⁺. Water and the salts' cations are left out."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; sure. Used for "7.00" for pure water and for the 11.60 of Check 4's Why |
| p$K_a$ of H₂PO₄⁻ | 7.21 ($K_{a2}$ of phosphoric acid 6.2 × 10⁻⁸) | the design; sure. **Not printed**: the lesson says "near pH 7" |
| p$K_{a1}$ and p$K_{a3}$ of phosphoric acid | about 2.15 and 12.3 | memory; fairly sure. Not printed; they stand behind the note that fewer than one phosphate in ten thousand is H₃PO₄ or PO₄³⁻ at pH 7 |
| Volume of one drop | about 0.05 mL | the usual laboratory figure of 20 drops to the milliliter; fairly sure **(verify)** |
| The pH 7 calibration solution of a pH meter | a phosphate buffer, made from KH₂PO₄ and Na₂HPO₄ | memory; sure of the composition, and that such a solution is not an equal mixture of the two |
| Formic acid, pyridine, Tris, hydrobromic acid | no value printed | each is called weak or strong in the question that uses it |

No $K_a$, $K_b$ or p$K_a$ is printed in this lesson, so there is no pair of forms to compare. The script still checks that 6.2 × 10⁻⁸ and 7.21 agree.

**Check script:** `scratchpad/unit8/checks/8-8.py`. It recomputes every number above (the opening's 4.30, the ratios 1.05 and 0.90, the 5 and 10 percent, the 0.02 and 0.04, the 11.60, the 0.30 and 5.7 of Check 5, each table of moles, Check 6's amounts and ratios, Check 3 and its slips, the figures' counts), checks the balance of all nine equations in atoms and charge, and checks each message, the summary and the answer positions against this file.

**Notes for the writer**

- This is an explanation lesson. The exam's question here is "explain how this buffer resists a change in pH", and the points are for both reactions and for the ratio. Write the Why of each Check as a model of that explanation.
- Never write "neutralizes the buffer", "absorbs" or "soaks up" for what a buffer does. The members "react with" or "use up" the added acid or base.
- Never write that a buffer "keeps the pH constant" or "prevents" a change, except as the mistake in the trap box.
- "Acid form" and "base form" are the unit's words for the two members. For a buffer made from a weak base, the base itself is the base form and its conjugate acid is the acid form. Say so once, at Check 1's Why.
- The lesson's pair is H₂PO₄⁻ with HPO₄²⁻. Do not bring in the carbonic acid buffer of blood, acetic acid with sodium acetate, ammonia with ammonium chloride, or hydrofluoric acid with sodium fluoride, and do not use hydrochloric acid with sodium chloride, or any other named strong acid with its salt, as a mixture that is not a buffer: the strong acid with its salt appears only as the unnamed HX and X⁻ of the second figure and the sentence that places it.
- Hydrochloric acid appears once, as the drop in the opening. Everywhere else the strong acid is hydrobromic acid.
- Do not write the Henderson–Hasselbalch equation, "buffer capacity", or any pH of a buffer other than the "4.45" that Check 5 is given.
- Check 5 comes before the sentence that would answer it. Check 6 comes before the text on the limit and does not ask about the limit. Keep that order.
- Topic 4.8's sentence about HPO₄²⁻ and the fluid inside cells may be picked up in the opening as written above. Add nothing more about cells or blood.
- For the writer and the controller: the ratio example in "Why the pH barely moves" uses 40 mmol and 40 mmol of the phosphate pair with 1 mmol of H₃O⁺ (41 and 39, about 0.02 of a pH unit). Lesson 8.10's worked addition must use other numbers: another pair, other amounts and another size of addition. It should say that it now gives the pH itself, which this lesson does not.

**Reactions, substances and scenarios used:** H₃O⁺ + HPO₄²⁻ → H₂PO₄⁻ + H₂O and OH⁻ + H₂PO₄⁻ → HPO₄²⁻ + H₂O (worked example 1); C₅H₅NH⁺ + OH⁻ → C₅H₅N + H₂O, with pyridine's reaction with water, H₃O⁺ + OH⁻ → 2H₂O and a made-up wrong equation as the other options (Check 1); HA + OH⁻ → A⁻ + H₂O (Check 3); HCHO₂ + OH⁻ → CHO₂⁻ + H₂O and H₃O⁺ + CHO₂⁻ → HCHO₂ + H₂O (worked example 2); Tris with H₃O⁺, in words (Check 6). Scenarios: one drop (0.05 mL) of 1.0 M hydrochloric acid in a liter of water, pH 7.00 to 4.30, against the pH 7 calibration solution of a school's pH meter, a phosphate buffer of KH₂PO₄ and Na₂HPO₄ (opening); a pyridine and pyridinium bromide buffer taking up NaOH (Check 1); a particle drawing with 9 HA and 5 A⁻ taking 3 OH⁻, leaving 6 HA (Check 3); four mixtures: 100 mmol of formic acid with 40 mmol of NaOH, formic acid with pyridinium bromide (two acid forms of different pairs), 50 mmol of sodium formate with 50 mmol of HBr, Tris with Tris hydrochloride (worked example 2); a strong acid HX with its salt, unnamed (text and figure 2); 0.20 mol of formic acid or of sodium formate with 0.20 mol or 0.050 mol of KOH or HBr (Check 2); a liter of phosphate buffer with 40 mmol of each member taking 1 mmol of H₃O⁺, ratio 1.00 to 1.05, against a liter of water going from pH 7.00 to 3.00; a liter of buffer with 80 mmol each of formic acid and sodium formate taking 4 mmol of NaOH, the pH rising by 0.04 (Check 4); 100 mL of a pH 4.45 buffer diluted with 100 mL of water (Check 5); a liter of buffer with 80 mmol of Tris and 40 mmol of its conjugate acid taking 10 mmol of HBr, leaving 70 mmol and 50 mmol, the pH a little lower (Check 6). Figures: three boxes with 6 and 6, 8 and 4, 4 and 8; a buffer box with 5 HA and 5 A⁻ beside a box with 5 H₃O⁺ and 10 X⁻.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps: the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.8 Properties of Buffers`).

**Check script:** `scratchpad/unit8/checks/8-8.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.8 Properties of Buffers`).

### Task 9: Lesson 8.9, Henderson–Hasselbalch Equation

**Files:**
- Create: `src/content/lessons/unit-8/8-9-henderson-hasselbalch-equation.mdx`
- Create: `public/figures/8-9-ratio-ladder.svg`
- No interactive diagram.

**Brief**

- **Front matter:** `topic: "8.9"`, `minutes: 16`, summary: "How the Henderson–Hasselbalch equation gives the pH of a buffer from the pKa of its acid form and the ratio of base form to acid form, and how to turn a wanted pH into a ratio." (No colon in the summary.)
- **Framework (8.9, one statement):** the pH of a buffer is tied to the p$K_a$ of its acid and to the ratio of the concentrations of the two members of the pair, by pH = p$K_a$ + log of base form over acid form; the relation comes from the $K_a$ expression. A small addition of acid or base changes that ratio little, so it changes the pH little, far less than it would with no buffer there. The objective is to find the pH of a buffer from which pair it is made of and how much of each member it holds. **What this lesson does not do:** the two reactions of a buffer are topic 8.8's (use them, do not teach them again); the pH of a mixture made by reacting a weak acid with a strong base, by a table of moles, is topic 8.4's (one sentence says the same table comes first here too); how much acid or base a buffer can take, and the pH after an addition as a calculation, are topic 8.10's. No Check asks for a pH after an addition, and none asks for the derivation. **Equation sheet:** the Henderson–Hasselbalch equation is on it, written with $[\ce{A-}]$ over $[\ce{HA}]$, and so is p$K_a = -\log K_a$. The sheet does not say which member is which for a buffer made from a weak base, gives no p$K_a$ values, and says nothing about when the equation can be trusted.
- **Opening:** a biology laboratory keeps two white powders on one shelf: Tris, a weak base, and Tris hydrochloride, the salt of its conjugate acid. Dissolve one mole of the first for every five moles of the second and the solution's pH is near 7.4. Turn the proportions around, five to one, and it is near 8.8. The same two substances, in whatever proportion, and a pH you can choose in advance: this lesson is the one equation that tells you which proportion gives which pH. Notes for the writer: these are 8.07 − 0.70 = 7.37 and 8.07 + 0.70 = 8.77, at 25 °C (log 5 = 0.70). Give them as "near 7.4" and "near 8.8", with no p$K_a$ yet. Laboratories do make Tris buffers by mixing these two solids in proportions read from a table.
- **Section "The same relation, in logarithms":**
  - A weak acid and its conjugate base in water are tied together by the acid's ionization (topic 8.3). Display, split after the arrow: `\ce{HA(aq) + H2O(l) <=> H3O+(aq) + A-(aq)}`. Topic 8.4 solved the $K_a$ expression for the hydronium concentration. Display: $[\ce{H3O+}] = K_a \times \dfrac{[\ce{HA}]}{[\ce{A-}]}$.
  - Chemists report pH, not $[\ce{H3O+}]$, and tabulate p$K_a$, not $K_a$. Take the negative logarithm of both sides and the relation becomes the **Henderson–Hasselbalch equation**, which gives the pH of a buffer from the p$K_a$ of its acid form and the ratio of base form to acid form. Display: $\text{pH} = \text{p}K_a + \log\dfrac{[\ce{A-}]}{[\ce{HA}]}$. It is on the exam's equation sheet in this form.
  - "**Beyond the exam:**" paragraph, the derivation in two lines. The exam asks you to use the equation, not to derive it. Taking the negative logarithm of each side of the relation above gives (display, numbers of lines as shown, split so that each fits a phone):
    - $-\log[\ce{H3O+}] = -\log K_a - \log\dfrac{[\ce{HA}]}{[\ce{A-}]}$
    - $\text{pH} = \text{p}K_a + \log\dfrac{[\ce{A-}]}{[\ce{HA}]}$

    The first line uses the fact that the logarithm of a product is a sum (topic 8.1). The second uses "p" for "minus the logarithm of", and the fact that minus the logarithm of a fraction is the logarithm of the fraction turned upside down. That last step is why the acid form, which was on top, ends up underneath.
  - Three things go into it, and each has one place.
    - The p$K_a$ is that of the acid form of the pair.
    - The base form goes on top of the ratio.
    - The acid form goes underneath.
  - **Which concentrations?** The ones the buffer was made with. Strictly the equation wants the concentrations at equilibrium. In a buffer both members are present in large amounts, and with the base form already there, only a tiny part of the acid form ionizes, so the concentrations at equilibrium are the ones you put in, to the figures you can measure. That is true while both amounts are large and neither is more than about ten times the other. Outside those limits the solution is hardly a buffer, and the equation should not be trusted.
  - **A buffer made from a weak base.** The equation is built on an acid's p$K_a$, and it stays that way. Take Tris, (HOCH₂)₃CNH₂. Write B for Tris and HB⁺ for its conjugate acid, (HOCH₂)₃CNH₃⁺. The acid form of this pair is HB⁺ and the base form is B, so the equation reads (display) $\text{pH} = \text{p}K_a + \log\dfrac{[\ce{B}]}{[\ce{HB+}]}$, with the p$K_a$ of HB⁺. If a question gives the $K_b$ of the base, first find the $K_a$ of its conjugate acid from $K_a \times K_b = K_w$ (topic 8.3), then the p$K_a$. Do not put a p$K_b$ into this equation.
  - `<KeyIdea>`: pH = p$K_a$ + log of (base form over acid form). The p$K_a$ belongs to the acid form of the pair, whether the buffer was made from a weak acid or from a weak base. Say which member is which before you divide.
  - Notes for the writer: give the formula of Tris once, as above, and write B and HB⁺ after that. Do not give the full chemical name. The "Beyond the exam" label is needed whether or not the framework excludes the derivation (the design's section 3), and no Check refers to it. Keep "about ten times" and "hardly a buffer": both are hedged on purpose.
- **Section "Read it before you calculate":**
  - The logarithm of 1 is 0. So when the two members are present in equal amounts, the pH equals the p$K_a$. (Topic 8.5 found this at the half-equivalence point of a titration, and topic 8.7 used it to say which form has the higher concentration.)
  - More base form than acid form: the ratio is above 1, its logarithm is positive, and the pH is above the p$K_a$. More acid form than base form: the ratio is below 1, its logarithm is negative, and the pH is below the p$K_a$.
  - Ten of one for each one of the other is a whole pH unit, as topic 8.7 found: log 10 = 1.00. Three to one is about half a unit: log 3 = 0.48.
  - Place the figure `8-9-ratio-ladder.svg` here.
  - So a working buffer has a pH within about one unit of the p$K_a$ of its acid form. This is the check to make on every answer in this lesson: on the right side of the p$K_a$, and less than a unit from it.
  - **Check 1** goes here.
- **Check 1**, `<Check answer={1}>`: "A buffer holds 0.025 mol of Tris and 0.070 mol of its conjugate acid in a liter of solution. The pKa of the conjugate acid is 8.07 at 25 °C. Without calculating, where does the pH lie?" Options:
  1. Between 7.07 and 8.07, below the pKa
  2. Between 8.07 and 9.07, above the pKa
  3. Exactly 8.07, equal to the pKa
  4. Between 5.93 and 6.93, near 14.00 − 8.07

  Why: name the two forms first. Tris is the base, so Tris is the base form and its conjugate acid is the acid form. There is more acid form (0.070 mol) than base form (0.025 mol), so the ratio of base form to acid form is below 1, its logarithm is negative, and the pH is below 8.07. The ratio, about 1 to 3, is nowhere near 1 to 10, so the pH is less than one unit below: the equation gives 7.62. The pH would equal the p$K_a$ only for equal amounts. And 14.00 − 8.07 = 5.93 is the p$K_b$ of Tris, which this equation does not use. Misses:
  - 2: "Decide which member is the acid form before you compare. Tris is the base, so its conjugate acid is the acid form. Which is there more of?"
  - 3: "The pH equals the pKa only when the two amounts are equal. Here they are 0.025 mol and 0.070 mol."
  - 4: "14.00 − 8.07 is the pKb of Tris. The equation takes the pKa of the acid form as it is, with nothing subtracted from 14."

  Note for the writer: 8.07 + log(0.025 ÷ 0.070) = 8.07 − 0.45 = 7.62.
- **Worked example "A Tris buffer":** a laboratory makes a buffer by dissolving 0.060 mol of Tris and 0.025 mol of Tris hydrochloride in water and making the solution up to 500 mL. The p$K_a$ of the conjugate acid of Tris is 8.07 at 25 °C. What is the pH of the buffer?
  1. **Name the two forms.** Tris, B, is the base form: 0.060 mol. Tris hydrochloride supplies the conjugate acid, HB⁺, the acid form: 0.025 mol. Its chloride ions are spectators.
  2. **Find the two concentrations.** The volume is 0.500 L. [B] = 0.060 ÷ 0.500 = 0.12 M. [HB⁺] = 0.025 ÷ 0.500 = 0.050 M.
  3. **Form the ratio, base form on top.** 0.12 ÷ 0.050 = 2.4.
  4. **Use the equation.** Display: pH = 8.07 + log(2.4) = 8.07 + 0.38 = 8.45.
  5. **Check it.** There is more base form than acid form, so the pH should be above 8.07, and it is. The ratio is well under 10, so it should be less than a unit above, and it is.

  Notes for the writer: log 2.4 = 0.380. The pH has two decimal places because the p$K_a$ has two (topic 8.1). Do not name a use for this buffer beyond "a laboratory".
- **Check 2**, `<Check numeric="3.35" tolerance={0.6}>` (no unit): "A buffer is made by dissolving 0.15 mol of formic acid, HCHO₂, and 0.060 mol of sodium formate, NaCHO₂, in water and making the solution up to 1.00 L. The pKa of formic acid is 3.75. What is the pH of the buffer?" Why: the acid form is formic acid, 0.15 M, and the base form is the formate ion, 0.060 M. The ratio of base form to acid form is 0.060 ÷ 0.15 = 0.40, and log(0.40) = −0.40. So pH = 3.75 + (−0.40) = 3.35 (display). There is more acid form than base form, so a pH below the p$K_a$ is what to expect. **Tolerance:** 0.6 percent of 3.35 is 0.020, so the page accepts 3.33 to 3.37. The equation gives 3.35 (3.352 before rounding); the full equilibrium, without the shortcut, gives 3.36 (3.357). Both are accepted. Slips:
  - `4.15` (the ratio upside down): "Is the ratio upside down? The base form, formate ion, goes on top, and formic acid goes underneath."
  - `3.75` (the pKa alone): "That is the pKa alone. The pH equals the pKa only when the two amounts are equal. Add the logarithm of the ratio."
  - `2.29` (0.15 M formic acid treated as a weak acid alone): "That is the pH of 0.15 M formic acid with no formate present. The formate ion is there in a large amount, so this is a buffer."
  - `2.83` (the natural logarithm): "Did you use the natural logarithm? The equation takes the logarithm to base 10, the log key."
  - `-0.40` (the logarithm alone, or Ka put where the pKa belongs): "That is the logarithm of the ratio alone. Add it to the pKa, 3.75."
  - `3.4` (one decimal place): "Did you round to one decimal place? The pKa has two, so give the pH to two decimal places."

  Notes for the writer: the six slips lie at least 0.05 apart and all are outside the tolerance. The lesson prints the p$K_a$ of formic acid and never its $K_a$ (lesson 8.3's explorer has the $K_a$, 1.8 × 10⁻⁴; the two agree to 0.01 in the p$K_a$).
- **Check 3**, `<Check answer={3}>`: "Pyridine, C₅H₅N, is a weak base with Kb = 1.7 × 10⁻⁹ at 25 °C, which makes the pKa of its conjugate acid, the pyridinium ion, 5.23. A buffer holds 0.24 mol of pyridine and 0.080 mol of pyridinium bromide in a liter. Which expression gives its pH?" Options:
  1. 5.23 + log(0.080 ÷ 0.24), with the pyridinium ion on top
  2. 8.77 + log(0.24 ÷ 0.080), with 8.77 from −log Kb
  3. 5.23 + log(0.24 ÷ 0.080), with pyridine on top
  4. 1.7 × 10⁻⁹ + log(0.24 ÷ 0.080), with Kb as the first term

  Why: the pair is pyridine and the pyridinium ion. The pyridinium ion has the extra proton, so it is the acid form, and pyridine is the base form. The equation takes the p$K_a$ of the acid form, 5.23, and puts the base form on top: pH = 5.23 + log(0.24 ÷ 0.080) = 5.23 + log(3.0) = 5.23 + 0.48 = 5.71 (display, split over two lines). More base form than acid form, and a pH above the p$K_a$: it fits. With the ion on top, the first option would give a pH below 5.23 for a buffer that holds more base than acid. 8.77 is −log $K_b$, the p$K_b$ of pyridine, which the equation does not use. And a $K$ cannot stand where a p$K$ belongs: the equation is written in logarithms throughout. The 5.23 came from $K_a = K_w \div K_b$ = (1.0 × 10⁻¹⁴) ÷ (1.7 × 10⁻⁹) = 5.9 × 10⁻⁶ (display). Misses:
  - 1: "Which of the two is the base form? The equation puts the base form over the acid form, whatever charge each one carries."
  - 2: "−log Kb is the pKb of pyridine. The equation is built on the acid form of the pair. Whose pK does it need?"
  - 4: "A K and a logarithm cannot be added. The equation needs a pK, and it must be the pK of the pair's acid form."

  Notes for the writer: −log(1.7 × 10⁻⁹) = 8.77 and 14.00 − 8.77 = 5.23. Lesson 8.4 names pyridine once and gives no constant for it, so this $K_b$ and the $K_a$ of the pyridinium ion, 5.9 × 10⁻⁶, are this lesson's alone. Bromide is a spectator. The options hold a little arithmetic in plain characters with words beside it, which is allowed; do not turn them into math.
- **Section "Do you need the volume?":**
  - Open with one sentence: the worked example divided each amount by 0.500 L before forming the ratio. Was that needed?
  - No: both members of a buffer are in the same solution, so they share one volume. Write the ratio of concentrations as moles over volume, top and bottom, and the volume cancels. Display: $\dfrac{[\ce{A-}]}{[\ce{HA}]} = \dfrac{n_{\ce{A-}} / V}{n_{\ce{HA}} / V} = \dfrac{n_{\ce{A-}}}{n_{\ce{HA}}}$. So moles, or millimoles, can go straight into the equation. In the worked example, 0.060 ÷ 0.025 = 2.4 at once.
  - One sentence to lead into the Check: many buffers are made by pouring two solutions together, each holding one member of the pair.
  - **Check 4** goes here, before the two cautions.
  - Two cautions. The moles must be the moles of each member in the final mixture. When a buffer is made by pouring two solutions together, find the millimoles of each (milliliters times molarity, topic 4.6); the two concentrations printed on the bottles are not the concentrations in the mixture, because each solution dilutes the other, and their ratio is the mixture's ratio only when the two volumes are equal. And when a strong acid or a strong base has been added, let it react to completion first, in a table of moles (topic 8.4), and put the amounts that are left into the equation.
  - **Check 5** goes here.
- **Check 4**, `<Check answer={2}>`: "Two bottles hold solutions of the two members of a buffer pair: the acid form at 0.40 M and the base form at 0.60 M. One student mixes 40.0 mL of each and, without finding moles, puts 0.60 ÷ 0.40 = 1.5 into the equation as the ratio of base form to acid form. A second student mixes 40.0 mL of the acid form's solution with 80.0 mL of the base form's and uses 1.5 too. Whose ratio is right?" Options:
  1. Both. Each mixture is made from the same two bottles, so the ratio is 1.5 in each
  2. Only the first. Equal volumes dilute the two solutions alike
  3. Only the second. In 120.0 mL each solution is diluted less than in 80.0 mL
  4. Neither. Mixing dilutes both solutions, so the bottles' numbers cannot give the ratio

  Why: find the millimoles in each mixture (milliliters times molarity). First mixture: 40.0 mL × 0.40 M = 16 mmol of acid form and 40.0 mL × 0.60 M = 24 mmol of base form, and 24 ÷ 16 = 1.5, the same as the ratio of the bottles' concentrations. Each solution went from 40.0 mL into 80.0 mL, so each was diluted to half its concentration: both concentrations fell, and their ratio stayed where it was. Second mixture: 16 mmol of acid form again, and 80.0 mL × 0.60 M = 48 mmol of base form. The ratio is 48 ÷ 16 = 3.0, not 1.5. Here the acid form's solution went from 40.0 mL into 120.0 mL, to one-third of its concentration, and the base form's from 80.0 mL into 120.0 mL, to two-thirds: the two were diluted unequally, so the bottles' ratio is no longer the mixture's. The same two bottles do not make the same buffer when the volumes poured differ. And the larger total volume does not dilute each solution less: it dilutes the acid form's solution more. The ratio of the bottles' concentrations is the mixture's ratio only when the two volumes are equal. Finding the moles is right every time. Misses:
  - 1: "The bottles are the same, but the volumes poured are not. Find the millimoles of each form in each mixture, milliliters times molarity, and compare the two ratios."
  - 3: "Follow each solution into the second mixture: 40.0 mL goes into 120.0 mL, and 80.0 mL goes into 120.0 mL. Are the two diluted alike?"
  - 4: "Mixing does lower both concentrations. The equation takes their ratio. Can two concentrations both fall while their ratio stays where it was?"

  Notes for the writer: this Check comes after the paragraph that says the volume cancels and before the two cautions, the first of which states its answer. The pair is not named and no p$K_a$ is given: the question is about the ratio alone. Do not print the concentrations in the two mixtures; say "to half", "to one-third" and "to two-thirds". Check 5 then asks for a pH from unequal volumes. (This Check replaces one on whether the volume is needed, which lesson 8.8's Check on diluting a buffer already tested.)
- **Check 5**, `<Check numeric="4.03" tolerance={0.4}>` (no unit): "A chemist makes a buffer by mixing 50.0 mL of 0.500 M glycolic acid, a weak acid, with 200.0 mL of 0.200 M sodium glycolate, a soluble salt of its conjugate base. The pKa of glycolic acid is 3.83. What is the pH of the mixture?" Why: find the millimoles of each member in the mixture. Acid form: 50.0 mL × 0.500 M = 25.0 mmol of glycolic acid. Base form: 200.0 mL × 0.200 M = 40.0 mmol of glycolate ion. The two do not react with each other, and they share the 250.0 mL, so the ratio of base form to acid form is 40.0 ÷ 25.0 = 1.60. Then pH = 3.83 + log(1.60) = 3.83 + 0.20 = 4.03 (display). More base form than acid form, and a pH above the p$K_a$. The concentrations on the two bottles, 0.500 M and 0.200 M, would give the wrong ratio, because the mixing diluted the two solutions unequally: the acid to one-fifth of its concentration, the salt only to four-fifths. **Tolerance:** 0.4 percent of 4.03 is 0.016, so the page accepts 4.02 to 4.04. The equation gives 4.03 (4.034 before rounding) and the full equilibrium gives 4.03 (4.035). Slips:
  - `3.63` (the ratio upside down): "Is the ratio upside down? Glycolate ion, the base form, goes on top."
  - `3.43` (the two concentrations before mixing, 0.200 over 0.500): "Did you use 0.200 and 0.500, the concentrations before mixing? Each solution dilutes the other. Find the moles of each member in the mixture."
  - `4.23` (the concentrations before mixing, upside down): "Did you use the concentrations before mixing, with the acid's on top? Find the moles of each member in the mixture, and put the base form on top."
  - `4.43` (the two volumes as the ratio): "Did you use the two volumes as the ratio? The ratio is of amounts. Multiply each volume by its molarity to get millimoles."
  - `3.83` (the pKa alone): "That is the pKa alone. The two amounts are not equal here, so the logarithm of the ratio is not zero."
  - `4.0` (one decimal place): "Did you round to one decimal place? The pKa has two, so give the pH to two decimal places."

  Notes for the writer: the six slips lie 0.17 or more apart and all are outside the tolerance. The lesson prints the p$K_a$ of glycolic acid and never its $K_a$ (lesson 8.3 has the $K_a$, 1.5 × 10⁻⁴, whose negative logarithm is 3.82; each is the tabulated value rounded, and the design allows the 0.01). Both solutions can be made: glycolic acid and sodium glycolate are very soluble in water. Give no scene beyond "a chemist".
- **Section "From a wanted pH to a ratio":**
  - A buffer is usually made to order: the pH is chosen first, and the question is how much of each member to use. The equation runs backward. Subtract the p$K_a$ from the wanted pH to get the logarithm of the ratio, then raise 10 to that power. Display: $\dfrac{[\ce{A-}]}{[\ce{HA}]} = 10^{\,\text{pH} - \text{p}K_a}$.
  - **Worked example "A formate buffer at pH 4.10":** a laboratory needs a buffer of pH 4.10 and has formic acid, whose p$K_a$ is 3.75, and sodium formate. What ratio of formate ion to formic acid is needed, and how many moles of sodium formate go with 0.10 mol of formic acid?
    1. **Find the logarithm of the ratio.** pH − p$K_a$ = 4.10 − 3.75 = 0.35.
    2. **Undo the logarithm.** Ratio of base form to acid form = 10^0.35 = 2.2 (set as display math).
    3. **Turn the ratio into an amount.** The base form is the formate ion: 2.2 × 0.10 mol = 0.22 mol of sodium formate.
    4. **Check it.** The wanted pH is above the p$K_a$, so the buffer should hold more base form than acid form, and it does. Put the amounts back: 3.75 + log(0.22 ÷ 0.10) = 3.75 + 0.34 = 4.09, which is 4.10 within the rounding of the ratio to two figures.

    Notes for the writer: 10^0.35 = 2.24 before rounding; the difference 0.35 has two decimal places, so the ratio has two figures. Keep step 4's "4.09 … within the rounding": do not change it to 4.10. Sodium formate is a soluble salt and its sodium ion is a spectator.
  - **Check 6** goes here.
- **Check 6**, `<Check numeric="0.25">` (no unit; the page's 2 percent): "What ratio of Tris to its conjugate acid, in moles, gives a buffer of pH 7.47 at 25 °C? The pKa of the conjugate acid of Tris is 8.07." Why: pH − p$K_a$ = 7.47 − 8.07 = −0.60. The ratio of base form to acid form is 10^(−0.60) = 0.25 (display). Tris is the base form, so the buffer needs 0.25 mol of Tris for each mole of its conjugate acid: one part Tris to four parts conjugate acid. The wanted pH is below the p$K_a$, so there has to be less base form than acid form, and a ratio below 1 says so. Slips:
  - `3.98` (the ratio upside down, 4.0): "Is the ratio upside down? The wanted pH is below the pKa. Should there be more Tris than conjugate acid, or less?"
  - `-0.60` (the logarithm itself): "That is the logarithm of the ratio. Raise 10 to that power to get the ratio itself."
  - `0.926` (the pH divided by the pKa): "Did you divide the pH by the pKa? Subtract the pKa from the pH first, then raise 10 to that power."
  - `0.60` (the logarithm without its sign): "Is that pH − pKa without its sign? The wanted pH is below the pKa, so the logarithm is negative. Then raise 10 to that power."

  Notes for the writer: 10^(−0.60) = 0.2512, so 0.25 is accepted (0.5 percent low) and so is 0.251. A typed 4.0 is within 1 percent of the slip 3.98 and gets its message.
- **Section "Why a small addition changes the pH so little":**
  - Topic 8.8 gave the reason in words: added acid or base is used up by one member of the pair, and the ratio of the two members changes only a little. The equation shows how little that means for the pH, because the pH follows the logarithm of the ratio, and a logarithm changes slowly.
  - Three sizes to remember, each true for every buffer. A change of 10 percent in the ratio moves the pH by 0.04. Doubling the ratio moves it by 0.30. Only a tenfold change in the ratio moves it by a whole unit.
  - Without a buffer there is nothing to use up the added acid or base, and the same addition changes $[\ce{H3O+}]$ itself many times over (topic 8.8 compared the two).
  - One sentence: the equation goes on working only while both members are present in large amounts. How much a buffer can take before one of them runs out is topic 8.10, which also works one addition through from start to finish.
  - `<KeyIdea>`: the pH of a buffer follows the logarithm of the ratio of base form to acid form. A small addition changes the ratio by a few percent and the pH by a few hundredths.
  - Note for the writer: log 1.1 = 0.04 and log 2 = 0.30. Give no amounts, no buffer and no pH in this section: it is about the ratio alone. Lesson 8.10 has the one worked addition.
- **Trap:** **Turning the ratio upside down** (base form on top; the answer then lands the same distance from the p$K_a$ on the wrong side, so check which side it should be on). **Putting $K_a$ where the p$K_a$ belongs** (the equation is in logarithms throughout). **Using a p$K_b$ for a buffer made from a weak base** (use the p$K_a$ of the base's conjugate acid, with the base itself on top). **Using the concentrations printed on two bottles after mixing them** (find the moles of each member in the mixture). **Using the equation when one member is missing** (a weak acid alone, or a weak acid that has reacted with an equal amount of strong base, is not a buffer: topics 8.3 and 8.4 have those). **Reporting a pH more than about a unit from the p$K_a$ without asking why** (a working buffer cannot be there).
- **Key points:** the Henderson–Hasselbalch equation, pH = p$K_a$ + log of the ratio of base form to acid form, gives the pH of a buffer, and it is on the equation sheet; the p$K_a$ is that of the acid form, and for a buffer made from a weak base the acid form is the base's conjugate acid; equal amounts of the two members give pH = p$K_a$, more base form gives a pH above it and more acid form a pH below it, and a tenfold ratio is one pH unit; moles can be used in place of concentrations, because both members share one volume, but they must be the moles in the final mixture; the ratio needed for a wanted pH is 10 raised to the power pH − p$K_a$; a small addition of acid or base changes the ratio only a little, and the pH follows the logarithm of the ratio, so the pH of a buffer changes far less than that of a solution with no buffer.

**Figures**

- **`8-9-ratio-ladder.svg`** (viewBox 0 0 480 400, font-size 18). A ladder standing upright, with the ratio beside each rung on the left and the pH on the right. The rungs are placed to scale: the height of a rung above the middle one is proportional to the logarithm of its ratio, at 130 units for each pH unit.
  - Two rails: vertical ink lines at x = 190 and x = 290, from y = 50 to y = 350.
  - Five rungs: horizontal lines from x = 190 to x = 290, at these heights (from the script):

    | Ratio, base form to acid form | log of the ratio | y of the rung | Text on the left | Text on the right |
    |---|---|---|---|---|
    | 10 to 1 | +1.00 | 70 | 10 : 1 | pKa + 1.00 |
    | 3 to 1 | +0.48 | 138 | 3 : 1 | pKa + 0.48 |
    | 1 to 1 | 0 | 200 | 1 : 1 | pKa |
    | 1 to 3 | −0.48 | 262 | 1 : 3 | pKa − 0.48 |
    | 1 to 10 | −1.00 | 330 | 1 : 10 | pKa − 1.00 |

  - The middle rung (1 : 1) is drawn in the accent color at twice the stroke width of the others, which are ink. It differs from them in weight as well as color.
  - Left texts are right-aligned, ending at x = 175, each centered on its rung's height. Right texts are left-aligned, starting at x = 305. "pKa" is written in plain characters, as the Checks' options write it.
  - Two headings at y = 30: "base : acid" right-aligned ending at x = 175, and "pH" left-aligned starting at x = 305, both in the secondary color.
  - Nothing else: no arrows, no legend. The true minus sign (−) in the two lower labels.
  - Text in the figure, twelve pieces: the two headings and the ten labels of the table.
  - Alt: "A ladder with five rungs. On the left of each rung is the ratio of base form to acid form, and on the right the pH. From the top: 10 to 1, pKa plus 1.00; 3 to 1, pKa plus 0.48; 1 to 1, pKa, on a heavier rung; 1 to 3, pKa minus 0.48; 1 to 10, pKa minus 1.00. The rungs for 3 to 1 and 1 to 3 lie about halfway between the middle rung and the two ends."
  - Caption: "The ratio of base form to acid form sets how far the pH of a buffer lies from the pKa. Equal amounts put it at the pKa, and each tenfold change in the ratio moves it one unit."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| p$K_a$ of the conjugate acid of Tris, 25 °C | 8.07 | the design; sure (tables give 8.06 to 8.08; it falls by about 0.03 for each degree of warming, which the lesson does not mention) |
| Formula of Tris | (HOCH₂)₃CNH₂; conjugate acid (HOCH₂)₃CNH₃⁺ | memory; sure |
| p$K_a$ of formic acid | 3.75 | the design; sure. Lesson 8.3's explorer has $K_a$ = 1.8 × 10⁻⁴, −log = 3.74: within 0.02 |
| p$K_a$ of glycolic acid | 3.83 | the design; fairly sure. Lesson 8.3 has $K_a$ = 1.5 × 10⁻⁴, −log = 3.82: within 0.02 |
| $K_b$ of pyridine | 1.7 × 10⁻⁹ | the design; sure |
| p$K_a$ of the pyridinium ion | 5.23 ($K_a$ = 5.9 × 10⁻⁶) | the design; sure. Calculated on the page from $K_b$ in Check 3's Why |
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; sure |
| log 2, log 3, log 2.4, log 1.6, log 1.1 | 0.30, 0.48, 0.38, 0.20, 0.04 | computed by the script |

No atomic mass, indicator or $K_{sp}$ is used.

**Check script:** `scratchpad/unit8/checks/8-9.py`. It recomputes every number above (the opening's two pH values, each step of both worked examples, every Check's answer and every slip, the full-equilibrium pH of the three buffers by bisection, the ladder's five heights), checks that every slip lies outside its Check's tolerance and 0.05 or more from the other slips of a pH Check, that each $K_a$ and p$K_a$ of one acid agree within 0.02, and checks each message, option, the summary and the answer positions against this file.

**Notes for the writer**

- "Acid form" and "base form" throughout, as in lessons 8.7 and 8.8. Where the equation is displayed it uses $[\ce{A-}]$ and $[\ce{HA}]$, as the site's equation page does, or $[\ce{B}]$ and $[\ce{HB+}]$ for a base's buffer.
- The logarithm is always to base 10. Say once, at the first worked example, that this is the "log" key and not "ln".
- Every pH in this lesson has two decimal places and every ratio two figures.
- The lesson's pairs are Tris with its conjugate acid, formic acid with formate, glycolic acid with glycolate, and pyridine with the pyridinium ion. Do not bring in acetic acid, ammonia, hydrofluoric acid, hypochlorous acid, hydrocyanic acid or the carbonic acid buffer of blood, and do not use the numbers "ratio 1.8 for pH 5.00".
- Never write p$K_b$ into the Henderson–Hasselbalch equation, and do not give the "pOH = p$K_b$ + log" form anywhere.
- No Check and no example computes a pH after acid or base is added to a ready-made buffer. The last section speaks of the ratio alone.
- Do not say "the exam requires" of the ten-to-one limit or of the one-unit check. They are this lesson's checks on an answer.
- Check 4 comes after the paragraph on the volume that cancels and before the two cautions, whose first sentence would answer it. Keep that order.
- The opening's "near 7.4" and "near 8.8" are for 1 : 5 and 5 : 1. Do not change the proportions to 1 : 4 and 4 : 1 (Check 6 asks for that ratio) or to 1 : 2 and 2 : 1.

**Reactions, substances and scenarios used:** one equation, HA + H₂O ⇌ H₃O⁺ + A⁻, written in general terms. Scenarios: Tris and Tris hydrochloride mixed 1 to 5 and 5 to 1 in moles, pH near 7.4 and near 8.8 (opening); a buffer of 0.025 mol of Tris and 0.070 mol of its conjugate acid, pH below the p$K_a$ of 8.07, in fact 7.62 (Check 1); 0.060 mol of Tris and 0.025 mol of Tris hydrochloride in 500 mL, 0.12 M and 0.050 M, ratio 2.4, pH 8.45 (worked example 1); 0.15 mol of formic acid and 0.060 mol of sodium formate in 1.00 L, p$K_a$ 3.75, pH 3.35 (Check 2); 0.24 mol of pyridine and 0.080 mol of pyridinium bromide, $K_b$ 1.7 × 10⁻⁹, p$K_a$ 5.23, pH 5.71 (Check 3); two bottles of an unnamed pair, acid form 0.40 M and base form 0.60 M, mixed 40.0 mL with 40.0 mL (16 mmol and 24 mmol, ratio 1.5) and 40.0 mL with 80.0 mL (16 mmol and 48 mmol, ratio 3.0) (Check 4); 50.0 mL of 0.500 M glycolic acid mixed with 200.0 mL of 0.200 M sodium glycolate, 25.0 mmol and 40.0 mmol, p$K_a$ 3.83, pH 4.03 (Check 5); a formate buffer at pH 4.10, ratio 2.2, 0.22 mol of sodium formate for 0.10 mol of formic acid (worked example 2); the ratio of Tris to its conjugate acid for pH 7.47, 0.25 (Check 6); a 10 percent change, a doubling and a tenfold change in a ratio, 0.04, 0.30 and 1.00 of a pH unit (last section). Figure: a ladder of five ratios, 10 : 1 to 1 : 10, against p$K_a$ + 1.00 to p$K_a$ − 1.00.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps: the data file, build and tests, the sweep and a look at the figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.9 Henderson–Hasselbalch Equation`).

**Check script:** `scratchpad/unit8/checks/8-9.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.9 Henderson–Hasselbalch Equation`).

### Task 10: Lesson 8.10, Buffer Capacity

**Files:**
- Create: `src/content/lessons/unit-8/8-10-buffer-capacity.mdx`
- Create: `public/figures/8-10-room-for-acid-or-base.svg`
- Places the interactive block `<BufferCapacity />` (built in its own task from "Diagram data" below; the lesson only places it. Check 5 asks for a prediction that the explorer then shows, and can be answered without it).

**Brief**

- **Front matter:** `topic: "8.10"`, `minutes: 18`, summary: "Why two buffers with the same pH can take very different amounts of acid or base, what happens when one member runs out, and how to choose a conjugate pair for a wanted pH." (No colon in the summary.)
- **Framework (8.10, two statements):** (1) raising the concentrations of both members of a buffer, with their ratio kept the same, leaves the pH where it was and raises the buffer's capacity to neutralize added acid or base. (2) A buffer with more of its acid form than of its base form has more capacity for added base than for added acid, and a buffer with more base form has more capacity for added acid. The objective is to explain how a buffer's capacity depends on the relative concentrations of its two members. **Taught without a "Beyond the exam" label, though the framework does not name it:** a buffer works best within about one pH unit of its p$K_a$, which is the reason for choosing the pair whose p$K_a$ is nearest the wanted pH. **What this lesson does not do:** the two reactions of a buffer are topic 8.8's and the Henderson–Hasselbalch equation is topic 8.9's (use both, name the topic, do not teach them again); the pH of a mixture made from a weak acid and a strong base is topic 8.4's. The pH after an addition to a ready-made buffer is calculated once, in worked example 1, and the sentence after it begins "**Beyond the exam:**". No Check asks for that pH. No quantitative measure of capacity is defined (no "buffer index", no moles per pH unit). **Equation sheet:** the Henderson–Hasselbalch equation is on it. Nothing about capacity is, and no p$K_a$ is: a question gives each one it needs.
- **Opening:** bacteria growing in a flask of sugary broth give off acids as they feed. Microbiologists put a buffer in the broth to hold its pH, and for a while it does. Then, if the buffer was made too weak, the pH falls quickly and the culture stops growing. The buffer did not stop being a buffer by accident: it ran out. This lesson is about how much acid or base a buffer can take, and what decides that. Note for the writer: this is real and general (growth media are buffered, commonly with phosphate, because cells release acids). Do not name a species of bacteria, do not give a pH for the broth, and do not mention blood.
- **Section "Same pH, different staying power":**
  - Recall, in two sentences, with the topics named: the acid form of a buffer reacts with added OH⁻ and the base form with added H₃O⁺ (topic 8.8), and the pH follows the ratio of the two forms (topic 8.9). Display the equation as topic 8.9 wrote it: $\text{pH} = \text{p}K_a + \log\dfrac{[\ce{A-}]}{[\ce{HA}]}$. Both forms are in the same solution, so the ratio of concentrations is the ratio of moles (topic 8.9).
  - Only the ratio is in that equation. A liter holding 0.20 mol of each form and a liter holding 0.020 mol of each have the same ratio, 1, and the same pH, which is the p$K_a$. A pH meter cannot tell them apart.
  - An addition can. Each mole of OH⁻ that goes in turns one mole of acid form into base form (topic 8.8). Take 0.015 mol of OH⁻: from 0.20 mol of acid form it removes less than a tenth, and the ratio barely moves. From 0.020 mol it removes three-quarters, and the ratio moves a long way. (0.015 ÷ 0.20 = 7.5 percent; 0.015 ÷ 0.020 = 75 percent.)
  - The term: the **buffer capacity** of a buffer is the amount of strong acid or strong base it can take before its pH changes sharply. More moles of both forms means more capacity.
  - One sentence on dilution: add water to a buffer and its pH hardly changes, because both forms are diluted alike (topic 8.8), and the moles of each form in the flask are unchanged. What falls is the amount in each liter you pour from it.
  - `<KeyIdea>`: the ratio of base form to acid form sets a buffer's pH. The amounts of the two forms set its capacity. More of both at the same ratio means the same pH, and more acid or base taken up before the pH changes much.
- **Worked example 1, "Thirty-five millimoles of base, into a buffer and into water":** a liter of buffer holds 140 mmol of propanoic acid, HC₃H₅O₂, and 60 mmol of sodium propanoate, NaC₃H₅O₂. The p$K_a$ of propanoic acid is 4.87. A chemist dissolves 35 mmol of solid sodium hydroxide (1.40 g) in it, so the volume stays 1.00 L. Find the pH before and after, and compare with what the same 35 mmol does to 1.00 L of pure water at 25 °C. Write HA for propanoic acid and A⁻ for the propanoate ion.
  1. **Before.** The ratio of base form to acid form is 60 ÷ 140 = 0.429, and log 0.429 = −0.37, so pH = 4.87 − 0.37 = 4.50 (4.502 before rounding). The buffer holds more acid form than base form, and its pH is below the p$K_a$ (topic 8.9).
  2. **React first, in moles.** Sodium hydroxide is a strong base, so its OH⁻ reacts to completion with the acid form (topic 8.8):

     $\ce{HC3H5O2(aq) + OH-(aq) -> C3H5O2-(aq) + H2O(l)}$ (split over two lines, breaking after the arrow)

     A table of moles, every value in mmol. It is not an ICE table: nothing in it is at equilibrium yet (topic 8.4).

     | | HA | OH⁻ | A⁻ |
     |---|---|---|---|
     | Before | 140 | 35 | 60 |
     | Change | −35 | −35 | +35 |
     | After | 105 | 0 | 95 |

  3. **Then the new ratio gives the pH.** The ratio is 95 ÷ 105 = 0.905 (0.9048 before rounding). pH = 4.87 + log 0.905 = 4.87 − 0.04 = 4.83 (4.827 before rounding).
  4. **The same 35 mmol in water.** In 1.00 L of water, [OH⁻] = 0.035 M, so pOH = −log 0.035 = 1.46 and pH = 14.00 − 1.46 = 12.54.
  5. **Compare.** The buffer went from 4.50 to 4.83, a change of 0.33. The water went from 7.00 to 12.54, a change of 5.54. The buffer's ratio went from 0.429 to 0.905, a little more than double; the water's [OH⁻] went up 350,000 times (from 1.0 × 10⁻⁷ M to 0.035 M).

  After the example, one paragraph: "**Beyond the exam:** the exam rarely asks you to calculate the pH of a ready-made buffer after an addition, as steps 2 and 3 did. It asks which reaction happens, which way the pH moves, and which of two buffers moves less. The numbers are here because 'the ratio barely changes' is easier to believe once you have seen it." Then one sentence that is not beyond the exam: the order of the steps is what matters everywhere in this unit. The strong base reacts completely first, in moles; only then does an equilibrium expression come in (topic 8.4).

  Notes for the writer: the hedge in the "Beyond the exam" sentence is the design's (its section 3); do not strengthen it to "never". Do not put the 35 mmol of OH⁻ into an ICE table anywhere, even as a wrong example. The mass 1.40 g is 35 mmol × 40.00 g/mol; it may be left out if the sentence is crowded, but the word "solid" stays, because it is why the volume does not change. The buffer starts with unequal amounts on purpose (equal amounts with sodium hydroxide, set beside water, is the scene of every textbook): do not change the amounts to equal ones, and do not use 100 mmol of each, which is the explorer's starting state. The explorer can be set to this state (140, 60, 35 mmol of OH⁻) and shows 4.50, 4.83 and 12.54, as the example does, but the lesson's three tasks at the explorer do not go there, and the text does not send the student to it.
- **Check 1**, `<Check answer={3}>`: "Two formate buffers are made from formic acid and sodium formate. Buffer P holds 0.32 mol of formic acid and 0.40 mol of formate ion in 1.00 L. Buffer Q holds 0.45 mol of formic acid and 0.12 mol of formate ion in 1.00 L. Which buffer can take more strong acid before one of its members runs out, and which can take more strong base?" Options:
  1. P can take more of both, because it holds more moles in all
  2. P can take more base, and Q can take more acid
  3. P can take more acid, and Q can take more base
  4. It cannot be decided without the pKa of formic acid

  Why: count the member that each addition reacts with (topic 8.8). Added H₃O⁺ reacts with the base form, the formate ion: P holds 0.40 mol of it and Q holds 0.12 mol, so P can take more strong acid. Added OH⁻ reacts with the acid form, formic acid: Q holds 0.45 mol of it and P holds 0.32 mol, so Q can take more strong base. P does hold more moles in all (0.72 mol against 0.57 mol), but a total is not what an addition meets: each addition meets one member only. The second option has the two members the wrong way around: formic acid is what uses up a base, not an acid. And no p$K_a$ is needed. A p$K_a$ would give each buffer's pH, and the two are different, because the ratios are (0.40 ÷ 0.32 = 1.25 in P and 0.12 ÷ 0.45 = 0.27 in Q). The question is about amounts. Misses:
  - 1: "A total is not what an addition meets. Added OH⁻ reacts with one member of the pair only, and added H₃O⁺ with the other. Count each member on its own."
  - 2: "Added OH⁻ is a base. Which member of a buffer does a base react with, the acid form or the base form? Then compare the moles of that member."
  - 4: "A pKa would give each buffer's pH. This question is about amounts: how many moles does each buffer hold of the member that the addition uses up?"

  Notes for the writer: this Check stands after the first section and leads into the next one. It needs only what the first section recalls from topic 8.8 (which form reacts with which addition) and says about amounts, so do not move the sentences of "Room for base, room for acid" up to stand before it. Do not print either buffer's pH in the question (they are 3.85 and 3.18, from the p$K_a$ of 3.75 in the table further on); the question gives no p$K_a$ on purpose. The two buffers differ in ratio on purpose: two buffers with one ratio and different amounts is the comparison every textbook makes, and the first section's text has already made it with 0.20 mol and 0.020 mol.
- **Section "Room for base, room for acid":**
  - A buffer does not have to hold equal amounts of its two forms, and when it does not, its capacity is lopsided. The reason is in the two reactions (topic 8.8): added OH⁻ is met by the acid form and by nothing else, and added H₃O⁺ is met by the base form and by nothing else.
  - Place the figure `8-10-room-for-acid-or-base.svg` here, with these sentences: both buffers are propanoic acid with propanoate ion, and both hold 200 mmol in all. The first holds 150 mmol of acid form and 50 mmol of base form. It could use up 150 mmol of OH⁻ before its acid form was gone, and only 50 mmol of H₃O⁺ before its base form was gone. The second, with 50 mmol of acid form and 150 mmol of base form, is the reverse.
  - The two do not have the same pH: the first is below the p$K_a$ and the second above it (topic 8.9). Give the numbers in one sentence: 4.87 + log(50 ÷ 150) = 4.39 and 4.87 + log(150 ÷ 50) = 5.35.
  - A buffer with equal amounts, at pH = p$K_a$, has the same room on both sides, and for a given total amount of the two forms that is also where a small addition moves the pH least. So when a buffer must guard against both acid and base, it is made with a ratio near 1.
  - `<KeyIdea>`: the acid form is what meets added base, and the base form is what meets added acid. A buffer with more acid form than base form has more capacity for added base than for added acid. With more base form, it is the other way around.
- **Check 2**, `<Check answer={1}>`: "Tris is a weak base that biology labs use in buffers (topic 8.9). A Tris buffer holds 30 mmol of Tris and 90 mmol of its conjugate acid. Of which can it take more before one of its members runs out: strong acid or strong base?" Options:
  1. Strong base: it holds more of the member that reacts with OH⁻
  2. Strong acid: Tris is a base, and a base is what reacts with an acid
  3. The same of either: a buffer holds both members, so it guards both ways alike
  4. Strong base: the solution is already basic, so more OH⁻ changes it little

  Why: write B for Tris and HB⁺ for its conjugate acid. HB⁺ is the acid form here, and there is 90 mmol of it; B is the base form, and there is 30 mmol. Added OH⁻ reacts with the acid form, $\ce{HB+(aq) + OH-(aq) -> B(aq) + H2O(l)}$, so the buffer can use up as much as 90 mmol of OH⁻. Added H₃O⁺ reacts with the base form, so it can use up only 30 mmol of H₃O⁺. Tris does react with acid, but there is little of it. A buffer guards both ways, but not equally unless its two amounts are equal. The last option names the right direction for a wrong reason: capacity is counted in moles of a member, not read from the pH. Misses:
  - 2: "Tris does react with acid, but count it: 30 mmol. How much is there of the other member, and what does that one react with?"
  - 3: "Both ways, yes, but not alike. Each member can use up only as many moles as there are of it. Compare 30 mmol with 90 mmol."
  - 4: "Capacity is not read from the pH. It is counted in moles: how much of each member is there, and what does each one react with?"

  Note for the writer: the buffer's pH is 8.07 + log(30 ÷ 90) = 7.59, so "already basic" in option 4 is true as a fact. Do not print the 7.59 in the question; it may go in the Why. Tris is named as in lesson 8.9; give no formula here.
- **Check 3**, `<Check numeric="65" unit="mmol">`: "Now 25 mmol of solid sodium hydroxide dissolves in the Tris buffer of the last question (30 mmol of Tris, 90 mmol of its conjugate acid). When the reaction is over, how many millimoles of the acid form are left?" Why: the acid form is the conjugate acid of Tris, HB⁺. OH⁻ reacts with it to completion, mole for mole. A table of moles, in mmol:

  | | HB⁺ | OH⁻ | B |
  |---|---|---|---|
  | Before | 90 | 25 | 30 |
  | Change | −25 | −25 | +25 |
  | After | 65 | 0 | 55 |

  65 mmol of the acid form is left, with 55 mmol of Tris. Both members are still there in large amounts, so the solution is still a buffer: the ratio of base form to acid form has gone from 30 ÷ 90 = 0.33 to 55 ÷ 65 = 0.85. Slips:
  - `115` (the 25 mmol added to the acid form): "OH⁻ uses up the acid form. It does not make more of it. Which member grows when OH⁻ is added?"
  - `55` (the base form after the reaction): "That is the Tris after the reaction, which is the base form. The question asks for the acid form."
  - `5` (the 25 mmol taken from the base form): "Did you take the 25 mmol from the Tris? OH⁻ reacts with the acid form, which here is the conjugate acid of Tris."
  - `90` (no reaction): "That is the acid form before the reaction. The OH⁻ reacts with it, mole for mole."
  - `0.065` (given in moles): "That is in moles. The question asks for millimoles."

  The page's 2 percent accepts 63.7 to 66.3. Every slip lies outside it.
- **Section "When one member runs out":**
  - A buffer works only while both members are there. Keep adding strong base and the acid form is used up, mole for mole, until none is left. From then on, added OH⁻ has nothing to react with, and it stays in the solution as OH⁻.
  - What the solution is at each stage, as a short list (this is the list of topic 8.4, met again):
    - less OH⁻ than acid form: both members remain, the solution is a buffer, and the ratio sets the pH;
    - exactly as much OH⁻ as acid form: only the base form is left. The solution is a weak base in water, and its pH is above 7 (topic 8.4);
    - more OH⁻ than acid form: the OH⁻ left over sets the pH, and the weak base beside it hardly counts.
  - The same happens on the other side: add more H₃O⁺ than there is base form, and the H₃O⁺ left over sets the pH.
  - The pH does not wait for the last mole. As a member gets scarce, the ratio runs away from 1. Once there is ten times as much base form as acid form, the pH is already a full unit above the p$K_a$ (topic 8.7), and each further millimole of base moves it more than the one before. That is why capacity is defined by a sharp change in pH, and not by the last mole.
  - Two sentences against a common belief: a buffer does not keep the pH constant. It resists a change, by an amount that depends on how much of each member it holds, and then it is used up.
- **Check 4**, `<Check answer={4}>`: "A buffer holds 30 mmol of a weak acid, HA, and 90 mmol of its conjugate base, A⁻, in 250 mL. Then 42 mmol of solid sodium hydroxide dissolves in it. What sets the pH of the solution now?" Options:
  1. The buffer's ratio of base form to acid form, which the addition has made larger
  2. The 120 mmol of A⁻ alone, a weak base reacting with water
  3. The 42 mmol of OH⁻ that was added, all of which is still in the solution
  4. The 12 mmol of OH⁻ left over once the HA has run out

  Why: react first, in moles. The table of moles, in mmol:

  | | HA | OH⁻ | A⁻ |
  |---|---|---|---|
  | Before | 30 | 42 | 90 |
  | Change | −30 | −30 | +30 |
  | After | 0 | 12 | 120 |

  The HA runs out first, and 12 mmol of OH⁻ is left with nothing to react with. That is [OH⁻] = 12 mmol ÷ 250 mL = 0.048 M, a pOH of 1.32 and a pH of 12.68 at 25 °C. There is no ratio any more, because there is no acid form. The 120 mmol of A⁻ is there, but it is a weak base: the OH⁻ it would make by reacting with water is tiny beside 0.048 M. And 30 of the 42 mmol of OH⁻ were used up. The buffer has been used up. Misses:
  - 1: "A ratio needs both members. Make the table of moles: how much HA is left after the OH⁻ has reacted?"
  - 2: "A⁻ is there, but it is a weak base. Look at the table of moles again for anything stronger that is left."
  - 3: "Not all of it is still there. OH⁻ reacts with HA until one of them runs out. Which runs out, and how much of the other is left?"

  Note for the writer: the acid is left unnamed on purpose, so no p$K_a$ is needed. The pH 12.68 is in the Why only.
- **Check 5**, `<Check answer={2}>`, placed directly before the explorer: "The explorer below starts with 1.00 L of a buffer of propanoic acid (pKa 4.87) and propanoate ion. Suppose you set both sliders to 20 mmol and then add 20 mmol of OH⁻. What is in the liter after the reaction, and where does that put its pH?" Options:
  1. Close to 4.87, because a buffer holds its pH
  2. Between 8 and 9, because a weak base alone is left
  3. Exactly 7, because the acid has been exactly neutralized
  4. Above 12, because the water beside it goes above 12

  Why: the table of moles has 20 mmol of propanoic acid and 20 mmol of OH⁻ before, and none of either after. All the propanoic acid has become propanoate ion: 40 mmol of it in 1.00 L, and nothing else that matters. That is a solution of a weak base alone, the "equal moles" case of topic 8.4, so its pH is above 7 but far below what free OH⁻ would give. The explorer shows 8.74. It is not near 4.87, because a buffer needs both members and one is gone. It is not 7: "neutralized" says the acid and the base were matched in moles, not that the solution is neutral. And it is not above 12 as the water is, because here every OH⁻ found an acid molecule to react with. Misses:
  - 1: "A buffer needs both members. Make the table of moles: how much propanoic acid is left after 20 mmol of OH⁻ has reacted?"
  - 3: "Matched in moles does not mean neutral. Look at what is in the solution after the reaction, and ask whether that ion reacts with water."
  - 4: "The water goes that high because its OH⁻ has nothing to react with. Here all 20 mmol of OH⁻ reacted. What is left to set the pH?"

  Note for the writer: for the fact-checker, the hand calculation behind 8.74 (not printed in the lesson, which gives only the p$K_a$): $K_a = 10^{-4.87} = 1.35 \times 10^{-5}$; $K_b = K_w/K_a = 7.41 \times 10^{-10}$; $[\ce{OH-}] = \sqrt{(7.41 \times 10^{-10})(0.040)} = 5.45 \times 10^{-6}$ M (the check: 0.014 percent of 0.040 M); pOH 5.26; pH 8.74. The explorer's full equation gives 8.736.
- **The interactive diagram:** place `<BufferCapacity />` here, after Check 5, under two sentences that say what it is: a liter of propanoic acid and propanoate buffer stands beside a liter of pure water, and whatever you add goes into both. You choose how much of each form the buffer starts with, and how much strong acid or strong base to add. Then one sentence: the pH values come from solving the full equilibrium, so now and then one differs in the second decimal place from what the Henderson–Hasselbalch equation gives, most when one form is nearly used up. The text then asks the student to do three things, as a numbered list, predicting before each move:
  1. **Start with equal amounts.** The buffer starts with 100 mmol of each form at pH 4.87, and the water at 7.00. Predict which of the two will move further, then add 15 mmol of OH⁻. (The ratio goes from 1.00 to 1.35, the buffer to 5.00, a change of 0.13, and the water to 12.18.) Before you move the slider to 15 mmol of H₃O⁺, predict where each will go. (The buffer goes to 4.74, the same 0.13 on the other side, and the water to 1.82.)
  2. **Make the buffer small, then run it out.** Set both forms to 20 mmol. The starting pH is still 4.87. Add 15 mmol of OH⁻: the buffer goes to 5.72, where the larger one went to 5.00. Add 20 mmol, as in the last question: 8.74, with the acid form gone. Add 25 mmol: 11.70, set by the 5 mmol of OH⁻ left over. Now set both forms to 200 mmol and add the same 15 mmol. Predict first. (The buffer goes to 4.94. Even 50 mmol, the most the slider gives, takes it only to 5.09.)
  3. **Make it lopsided.** Set the acid form to 150 mmol and the base form to 50 mmol, the first buffer of the figure. The pH is 4.39. Which will move it more: 40 mmol of OH⁻ or 40 mmol of H₃O⁺? Predict, then try both. (40 mmol of OH⁻ takes it to 4.78, a change of 0.39. 40 mmol of H₃O⁺ takes it to 3.60, a change of 0.79, about twice as far, and 50 mmol uses up the base form and drops it to 2.79.)

  The numbers in parentheses are for the writer to phrase as "you should see". They are the module's values (see "Diagram data"). Note for the writer: quote 3.60 for the last buffer after 40 mmol of H₃O⁺, which is the explorer's value. The Henderson–Hasselbalch equation gives 3.59 there (4.87 + log(10 ÷ 190) = 3.591), because with so little base form left the amounts at equilibrium are no longer quite the amounts in the table of moles. Do not work that state by hand in the text.
- **Section "Choosing a buffer for a wanted pH":**
  - Any conjugate pair can be pushed to almost any pH on paper by choosing the ratio. But a ratio far from 1 means one member is scarce, and a scarce member is no capacity on that side. So a buffer is useful only when both forms are present in comparable amounts: a ratio between about 1 to 10 and 10 to 1, which is a pH within about one unit of the p$K_a$ (topic 8.7).
  - The method, two steps: (1) choose the pair whose p$K_a$ is nearest the wanted pH; (2) find the ratio from the Henderson–Hasselbalch equation (topic 8.9), then make the amounts as large as the job needs.
  - The table (two columns), with one sentence before it saying these are the pairs this lesson chooses from, all at 25 °C:

    | Acid form, with its base form | p$K_a$ |
    |---|---|
    | Formic acid, with formate ion | 3.75 |
    | Propanoic acid, with propanoate ion | 4.87 |
    | H₂PO₄⁻, with HPO₄²⁻ | 7.21 |
    | Conjugate acid of Tris, with Tris | 8.07 |

    One sentence after it: the p$K_a$ in the last row belongs to the conjugate acid of Tris. A buffer made from a weak base is worked with the p$K_a$ of its conjugate acid (topic 8.9).
- **Worked example 2, "A buffer for pH 8.60":** a biochemist needs a buffer at pH 8.60. Choose a pair from the table and find the ratio of its two forms.
  1. **Find the nearest p$K_a$.** The wanted pH is 4.85 above formic acid's p$K_a$, 3.73 above propanoic acid's, 1.39 above that of H₂PO₄⁻ and 0.53 above that of the conjugate acid of Tris. Tris is the only pair within one unit.
  2. **Find the ratio.** Write B for Tris and HB⁺ for its conjugate acid. log of the ratio of B to HB⁺ = 8.60 − 8.07 = 0.53, so the ratio is $10^{0.53} = 3.4$ (3.39 before rounding). (Display the two lines.)
  3. **Turn the ratio into amounts.** For every 0.050 mol of the conjugate acid, 3.4 × 0.050 = 0.17 mol of Tris.
  4. **Check the answer against what you know.** The wanted pH is above the p$K_a$, so there should be more base form than acid form, and there is.
  5. **Why not the phosphate pair?** It would need a ratio of $10^{1.39}$, about 25 to 1 (24.5). Only 1 part in 26 of the phosphate would be in the acid form, about 4 percent, so the buffer would have almost nothing to meet added base with.

  One sentence after the example: with 3.4 times as much base form as acid form, this buffer has more room for added acid than for added base. If the experiment is going to make base, use larger amounts of both.

  Note for the writer: lesson 8.9's worked example is a Tris buffer too, with other numbers (0.060 mol of Tris and 0.025 mol of Tris hydrochloride in 500 mL, pH 8.45). Do not repeat or refer to those numbers. Do not give a use for the pH 8.60 buffer beyond "a biochemist needs".
- **Check 6**, `<Check answer={1}>`: "A lab needs a buffer at pH 6.90. Use the table of pairs above. Which recipe is the best choice?" Options:
  1. H₂PO₄⁻ with HPO₄²⁻, with somewhat more of the acid form
  2. H₂PO₄⁻ with HPO₄²⁻, with somewhat more of the base form
  3. Tris with its conjugate acid, with about fifteen times as much acid form
  4. Propanoic acid with propanoate ion, with about a hundred times as much base form

  Why: the nearest p$K_a$ is 7.21, which is 0.31 above the wanted pH, so the phosphate pair is the one to use. The wanted pH is below that p$K_a$, so the acid form must be in excess: the ratio of HPO₄²⁻ to H₂PO₄⁻ is $10^{-0.31} = 0.49$, about twice as much acid form as base form. With more base form the pH would be above 7.21, not below it. Tris could reach pH 6.90 only at a ratio of $10^{-1.17} = 0.068$, about 15 parts of acid form to 1 of Tris, and propanoic acid only at $10^{2.03}$, about 107 parts of base form to 1 of acid. Each would have one member so scarce that a small addition would use it up. Misses:
  - 2: "More base form than acid form puts a buffer's pH above its pKa. Where would this recipe land, and where is 6.90?"
  - 3: "The ratio could reach pH 6.90, but with so little Tris a small addition of acid would use the base form up. Look for a pKa nearer 6.90."
  - 4: "A hundred to one leaves almost no acid form to meet added base. A buffer works best within about one pH unit of its pKa."
- **Trap:** **Reading capacity from the pH** (two buffers with the same pH can differ tenfold in capacity; count the moles of each form). **Saying that extra acid form helps against added acid** (the acid form meets added base; the base form meets added acid). **Putting the added strong base into an ICE table** (it reacts to completion first, in a table of moles; the equilibrium comes after). **Using the Henderson–Hasselbalch equation after a member has run out** (with no acid form left there is no ratio; what is left over sets the pH). **Believing a buffer holds its pH constant** (it resists a change until one member is nearly used up). **Choosing a pair by its name and not by its p$K_a$** (the p$K_a$ must be within about one unit of the wanted pH, or one member will be scarce).
- **Key points:** the ratio of base form to acid form sets a buffer's pH, and the amounts of the two forms set its buffer capacity, the amount of strong acid or strong base it can take before its pH changes sharply; two buffers with the same ratio have the same pH, and the one holding more moles of both forms has the larger capacity; added base is met by the acid form and added acid by the base form, so a buffer with more acid form has more capacity for base, and one with more base form has more capacity for acid; an added strong acid or base reacts completely first, in moles, and when it is more than the member it reacts with, that member runs out and the strong acid or base left over sets the pH; a buffer is useful within about one pH unit of its p$K_a$, so choose the pair whose p$K_a$ is nearest the wanted pH and then set the ratio; for a buffer made from a weak base, the p$K_a$ is that of its conjugate acid.

**Figure**

- **`8-10-room-for-acid-or-base.svg`** (viewBox 0 0 480 300, font-size 18). Two panels side by side, the left from x = 20 to 220 and the right from x = 260 to 460.
  - Each panel is a bar chart with a baseline at y = 222 (a line in ink across the panel) and a scale of 1 unit for each millimole. Each has two bars 60 wide, the first from x = panel left + 30 and the second from x = panel left + 110.
  - Left panel. Title at the top (y = 26, centered at x = 120): "More acid form". First bar: 150 tall (from y = 72 to y = 222), filled with diagonal hatching in the secondary color, ink outline, with "150" above it and "HA" below the baseline. Second bar: 50 tall (from y = 172 to y = 222), filled with the light accent and no hatching, ink outline, with "50" above it and "A⁻" below the baseline. Under the panel (y = 284, centered): "Room for more OH⁻".
  - Right panel. Title (centered at x = 360): "More base form". First bar: 50 tall, hatched, "50" above and "HA" below. Second bar: 150 tall, plain light accent, "150" above and "A⁻" below. Under the panel: "Room for more H₃O⁺".
  - The acid form and the base form differ in fill (hatched against plain) as well as in label, and each keeps its fill in both panels.
  - Text in the figure, twelve pieces: "More acid form", "More base form", "150" twice, "50" twice, "HA" twice, "A⁻" twice, "Room for more OH⁻", "Room for more H₃O⁺".
  - Alt: "Two bar charts side by side. On the left, under the title more acid form, a tall hatched bar labeled HA stands at 150 and a short plain bar labeled A minus stands at 50, and under them it says room for more OH minus. On the right, under the title more base form, a short hatched bar labeled HA stands at 50 and a tall plain bar labeled A minus stands at 150, and under them it says room for more H3O plus."
  - Caption: "Two buffers of propanoic acid, HA, and propanoate ion, A⁻, with the amounts in millimoles. The one with more acid form can take more added base. The one with more base form can take more added acid."

**Diagram data** (for the builder of `src/lib/buffer-capacity.ts` and `<BufferCapacity />`; the design's section 6.1 fixes what the diagram shows)

- **Constants.**

  | Constant | Value | Source |
  |---|---|---|
  | p$K_a$ of propanoic acid at 25 °C | 4.87 | CRC Handbook, 4.87 (sure) |
  | $K_a$ the module uses | $10^{-4.87}$ (1.3490 × 10⁻⁵), computed from the p$K_a$, never typed in as a rounded number | so that equal amounts give pH 4.87 |
  | $K_w$ | 1.0 × 10⁻¹⁴ | the design; 25 °C |
  | Volume of the buffer, and of the water | 1.00 L, fixed, before and after an addition | the design; the caption says so |

- **Controls.**

  | Control | Range | Step | Starts at |
  |---|---|---|---|
  | Propanoic acid in the buffer (the acid form) | 10 mmol to 200 mmol | 10 mmol | 100 mmol |
  | Propanoate ion in the buffer (the base form) | 10 mmol to 200 mmol | 10 mmol | 100 mmol |
  | What is added, to the buffer and to the water | 50 mmol of H₃O⁺, through nothing, to 50 mmol of OH⁻ | 5 mmol | nothing |

  That is 20 × 20 × 21 = 8,400 states. The block is `<BufferCapacity />`, with `data-diagram="buffer-capacity"`; the module's functions throw a RangeError for a value that is not on a slider's steps, as the other diagrams' modules do. In the module the addition is one signed whole number, `added`, from −50 to +50: negative for H₃O⁺, positive for OH⁻. The slider's `aria-valuetext` says "15 mmol of OH⁻", "15 mmol of H₃O⁺" or "nothing added", never a signed number.
- **The model, step 1: the reaction, in whole millimoles (exact).** With `acid` and `base` the two sliders and $n$ the size of `added`:
  - OH⁻ added: reacted = min($n$, acid); acid form after = acid − reacted; base form after = base + reacted; OH⁻ left over = $n$ − reacted.
  - H₃O⁺ added: reacted = min($n$, base); base form after = base − reacted; acid form after = acid + reacted; H₃O⁺ left over = $n$ − reacted.
  - These are whole numbers, and the bars and the readout show them as they are. The acid form and the base form after always add up to acid + base.
- **The model, step 2: the pH, from the shared solver** (`src/lib/acid-base.ts`; lesson 8.3's brief has its "Diagram data"). The solver finds $[\ce{H3O+}]$ from the charge balance by bisection, with $K_w$ included. In mol/L, with the volume 1.00 L:
  - total of the weak pair, $C$ = (acid + base) ÷ 1,000. It does not change when something is added;
  - sodium ion, from the sodium propanoate and from any sodium hydroxide added: (base + OH⁻ added) ÷ 1,000;
  - the anion of the strong acid added: (H₃O⁺ added) ÷ 1,000;
  - the equation solved for $h = [\ce{H3O+}]$: $h + [\ce{Na+}] = \dfrac{K_w}{h} + \dfrac{C K_a}{K_a + h} + [\text{strong-acid anion}]$;
  - the buffer's pH before the addition is the same call with nothing added. The water's pH is the same call with $C$ = 0: 7.00 before, and after an addition $-\log$ of the root of $h + [\ce{Na+}] = K_w/h + [\text{anion}]$.
  - No shortcut is used in any state, so there is no seam where the buffer runs out.
- **Rounding.** Each pH is shown to two decimal places, rounded half up from the solver's unrounded value (`Math.floor(pH * 100 + 0.5) / 100`), and the solver must be run until $h$ is good to at least ten significant figures: the 43 states listed under "Rounding ties" come within 0.00002 of a tie, the nearest within 0.000002. Millimoles are whole numbers. The ratio of base form to acid form is shown to three significant figures (1.00, 1.35, 0.333, 20.0, 0.0500, 49.0), rounded half up, **computed from the two whole numbers by whole-number arithmetic and not from a floating-point quotient**: 133 states have a ratio after an addition that is an exact tie at three figures, such as 90 ÷ 80 = 1.125, which is shown as 1.13 (two are in the table below), and so have 14 starting buffers. When a member has run out there is no ratio, and the readout does not show one.
- **States, and the readout sentence for each kind.** Seven kinds:

  | Kind | Condition | States |
  |---|---|---|
  | Nothing added | `added` = 0 | 400 |
  | OH⁻ added, both members remain | 0 < $n$ < acid | 3,500 |
  | OH⁻ added, the acid form exactly used up | $n$ = acid | 100 |
  | OH⁻ added, more than the acid form | $n$ > acid | 400 |
  | H₃O⁺ added, both members remain | 0 < $n$ < base | 3,500 |
  | H₃O⁺ added, the base form exactly used up | $n$ = base | 100 |
  | H₃O⁺ added, more than the base form | $n$ > base | 400 |

  The readout (`p.diagram-readout[role=status]`), written out for one state of each kind:
  - Nothing added (the starting state, 100 and 100): "The buffer holds 100 mmol of propanoic acid and 100 mmol of propanoate ion: a ratio of base form to acid form of 1.00. Its pH is 4.87. The water's pH is 7.00. Nothing has been added yet."
  - OH⁻, both remain (100, 100, 15 mmol of OH⁻): "15 mmol of OH⁻ reacted with 15 mmol of propanoic acid and made 15 mmol of propanoate ion. The ratio of base form to acid form went from 1.00 to 1.35, and the buffer's pH from 4.87 to 5.00. The same 15 mmol took the water from pH 7.00 to 12.18."
  - H₃O⁺, both remain (100, 100, 15 mmol of H₃O⁺): "15 mmol of H₃O⁺ reacted with 15 mmol of propanoate ion and made 15 mmol of propanoic acid. The ratio of base form to acid form went from 1.00 to 0.739, and the buffer's pH from 4.87 to 4.74. The same 15 mmol took the water from pH 7.00 to 1.82."
  - OH⁻, acid form exactly used up (20, 20, 20 mmol of OH⁻): "20 mmol of OH⁻ reacted with all 20 mmol of the propanoic acid. The acid form is used up, so this is no longer a buffer. What is left is propanoate ion, a weak base, and the pH has jumped from 4.87 to 8.74. The same 20 mmol took the water from pH 7.00 to 12.30."
  - OH⁻, more than the acid form (20, 20, 25 mmol of OH⁻): "Only 20 mmol of the 25 mmol of OH⁻ found propanoic acid to react with. The acid form is used up, and the 5 mmol of OH⁻ left over now sets the pH, which has jumped from 4.87 to 11.70. The same 25 mmol took the water from pH 7.00 to 12.40."
  - H₃O⁺, base form exactly used up (150, 50, 50 mmol of H₃O⁺): "50 mmol of H₃O⁺ reacted with all 50 mmol of the propanoate ion. The base form is used up, so this is no longer a buffer. What is left is propanoic acid, a weak acid, and the pH has dropped from 4.39 to 2.79. The same 50 mmol took the water from pH 7.00 to 1.30."
  - H₃O⁺, more than the base form (200, 10, 50 mmol of H₃O⁺): "Only 10 mmol of the 50 mmol of H₃O⁺ found propanoate ion to react with. The base form is used up, and the 40 mmol of H₃O⁺ left over now sets the pH, which has dropped from 3.58 to 1.40. The same 50 mmol took the water from pH 7.00 to 1.30."

  The readout never says that the buffer "moved less than the water" in so many words: in the 800 states where a member is overrun, the buffer can move further than the water does (10, 10 and 50 mmol of OH⁻: the buffer from 4.87 to 12.60, the water from 7.00 to 12.70). It gives the two pairs of numbers and lets the student compare.
- **What is drawn.** Two pH scales side by side, from 0 to 14, one titled "Buffer" and one "Water", each with a hollow marker at the pH before the addition and a filled marker at the pH after (one marker, hollow, when nothing is added). Three bars in millimoles: "Acid form" and "Base form" after the reaction, each with a dashed outline at its height before, and a third bar, "Left over", for the OH⁻ or H₃O⁺ that found nothing to react with (labeled with which it is; empty in the 7,400 states where none is left). The bar scale must hold 250 mmol (200 + 50). The hollow and filled markers, and the solid and dashed outlines, differ in shape or dash pattern and not in color alone.
- **Descriptions for screen readers** (each SVG's `aria-label`, from `describe*` functions), for the state 100, 100, 15 mmol of OH⁻: scales, "Two pH scales from 0 to 14. Buffer: 4.87 before, 5.00 after. Water: 7.00 before, 12.18 after."; bars, "Bars in millimoles. Acid form: 85, down from 100. Base form: 115, up from 100. Left over: none." With something left over: "Left over: 5 of OH⁻."
- **Caption** (in `src/components/lesson/BufferCapacity.astro`): "One liter of a buffer of propanoic acid and propanoate ion beside one liter of pure water, at 25 °C. The volume is taken as 1.00 L before and after each addition. The pH values come from the full equilibrium."
- **Limits, checked over all 8,400 states** by the check script, each by its own bisection:
  - The counts of the seven kinds are those of the table above.
  - With nothing added, the buffer's pH runs from 3.58 (200 mmol of acid form, 10 mmol of base form) to 6.17 (10 and 200), and every one of the 20 buffers with equal amounts shows 4.87.
  - In the 7,000 states where something is added and both members remain: the buffer's pH always moves the right way (up for OH⁻, down for H₃O⁺); the shown values before and after are never equal; the smallest change is 0.02 (200, 200, 5 mmol of either: 4.87 to 4.89 or to 4.85) and the largest is 1.74 (50 mmol of acid form, 10 mmol of base form, 45 mmol of OH⁻: 4.17 to 5.91); and the water's change is never smaller than 4.70, so in these states the buffer always moves less than the water.
  - In the 200 states where a member is exactly used up, the buffer's pH after is between 8.59 and 9.13 (acid form used up) or between 2.74 and 3.29 (base form used up).
  - In the 800 states where a member is overrun, the left-over amount is between 5 and 40 mmol and the buffer's pH after is between 11.70 and 12.60, or between 1.40 and 2.30.
  - In every state with an addition, the buffer ends nearer its starting pH side than the water does: below the water's final pH when OH⁻ is added, above it when H₃O⁺ is added.
  - Over all states the buffer's pH lies between 1.40 and 12.60 and the water's between 1.30 and 12.70, so a scale from 0 to 14 holds every marker.
  - Among the 7,400 states with both members present, the shown pH differs from the Henderson–Hasselbalch value, rounded the same way, in 385 states: by 0.01 in 298 of them, and by up to 0.05 in the rest, each of which has one member down to 5 or 10 mmol. This is why the caption says where the numbers come from.
  - Starting buffers with the same ratio show the same pH, with six exceptions among the 255 different ratios, where the most dilute or the most concentrated buffer of the ratio shows a value 0.01 away: 30 mmol of acid form with 10 mmol of base form shows 4.40 where 150 with 50 shows 4.39, and 120 with 160 shows 5.00 where 150 with 200 shows 4.99. Of these, the lesson's text uses only 150 with 50, which shows 4.39 as the Henderson–Hasselbalch equation gives; it never sets 30 with 10.
- **Rounding ties.** 43 states have a buffer pH within 0.00002 of a tie in the second decimal place. A solver good to ten figures rounds all of them as shown here:

  | Unrounded pH | Shown | States | They end with (acid form, base form) |
  |---|---|---|---|
  | 5.0250015 | 5.03 | 11 | 70 and 100 mmol |
  | 4.9850027 | 4.99 | 3 | 165 and 215 mmol |
  | 4.9950028 | 5.00 | 10 | 120 and 160 mmol |
  | 6.0650028 | 6.07 | 2 | 15 and 235 mmol |
  | 4.9949900 | 4.99 | 6 | 150 and 200 mmol |
  | 8.9350106 | 8.94 | 5 | 0 and 100 mmol |
  | 5.2850149 | 5.29 | 6 | 75 and 195 mmol |

  The eleven at 5.0250015 run from (20, 150, 50 mmol of H₃O⁺) through (70, 100, nothing) to (120, 50, 50 mmol of OH⁻); the Henderson–Hasselbalch equation gives 5.0249 there, which would be shown as 5.02. The exact ties in the ratio all have 80 or 160 mmol of acid form after the reaction (90 ÷ 80 = 1.125, shown as 1.13; 30 ÷ 160 = 0.1875, shown as 0.188; 250 ÷ 80 = 3.125, shown as 3.13).
- **Worked states** for unit tests (inputs, then the exact outputs expected). "Added" is in mmol, with the ion. The first eleven rows are the states the lesson's text walks through.

  | Acid | Base | Added | Acid after | Base after | Left over | Ratio before | Ratio after | Buffer pH before | Buffer pH after | Water pH after |
  |---|---|---|---|---|---|---|---|---|---|---|
  | 100 | 100 | nothing | 100 | 100 | 0 | 1.00 | 1.00 | 4.87 | 4.87 | 7.00 |
  | 100 | 100 | 15 OH⁻ | 85 | 115 | 0 | 1.00 | 1.35 | 4.87 | 5.00 | 12.18 |
  | 100 | 100 | 15 H₃O⁺ | 115 | 85 | 0 | 1.00 | 0.739 | 4.87 | 4.74 | 1.82 |
  | 20 | 20 | 15 OH⁻ | 5 | 35 | 0 | 1.00 | 7.00 | 4.87 | 5.72 | 12.18 |
  | 20 | 20 | 20 OH⁻ | 0 | 40 | 0 | 1.00 | none | 4.87 | 8.74 | 12.30 |
  | 20 | 20 | 25 OH⁻ | 0 | 40 | 5 OH⁻ | 1.00 | none | 4.87 | 11.70 | 12.40 |
  | 200 | 200 | 15 OH⁻ | 185 | 215 | 0 | 1.00 | 1.16 | 4.87 | 4.94 | 12.18 |
  | 200 | 200 | 50 OH⁻ | 150 | 250 | 0 | 1.00 | 1.67 | 4.87 | 5.09 | 12.70 |
  | 150 | 50 | 40 OH⁻ | 110 | 90 | 0 | 0.333 | 0.818 | 4.39 | 4.78 | 12.60 |
  | 150 | 50 | 40 H₃O⁺ | 190 | 10 | 0 | 0.333 | 0.0526 | 4.39 | 3.60 | 1.40 |
  | 150 | 50 | 50 H₃O⁺ | 200 | 0 | 0 | 0.333 | none | 4.39 | 2.79 | 1.30 |
  | 50 | 150 | nothing | 50 | 150 | 0 | 3.00 | 3.00 | 5.35 | 5.35 | 7.00 |
  | 200 | 10 | 50 H₃O⁺ | 210 | 0 | 40 H₃O⁺ | 0.0500 | none | 3.58 | 1.40 | 1.30 |
  | 10 | 200 | 50 OH⁻ | 0 | 210 | 40 OH⁻ | 20.0 | none | 6.17 | 12.60 | 12.70 |
  | 10 | 200 | 10 OH⁻ | 0 | 210 | 0 | 20.0 | none | 6.17 | 9.10 | 12.00 |
  | 200 | 10 | 10 H₃O⁺ | 210 | 0 | 0 | 0.0500 | none | 3.58 | 2.78 | 2.00 |
  | 50 | 10 | 45 OH⁻ | 5 | 55 | 0 | 0.200 | 11.0 | 4.17 | 5.91 | 12.65 |
  | 200 | 200 | 5 H₃O⁺ | 205 | 195 | 0 | 1.00 | 0.951 | 4.87 | 4.85 | 2.30 |
  | 70 | 100 | nothing | 70 | 100 | 0 | 1.43 | 1.43 | 5.03 (5.0250015) | 5.03 | 7.00 |
  | 120 | 50 | 50 OH⁻ | 70 | 100 | 0 | 0.417 | 1.43 | 4.49 | 5.03 (5.0250015) | 12.70 |
  | 100 | 70 | 10 H₃O⁺ | 110 | 60 | 0 | 0.700 | 0.545 | 4.72 | 4.61 | 2.00 |
  | 70 | 100 | 10 H₃O⁺ | 80 | 90 | 0 | 1.43 | 1.13 (exactly 1.125) | 5.03 | 4.92 | 2.00 |
  | 150 | 190 | 10 H₃O⁺ | 160 | 180 | 0 | 1.27 | 1.13 (exactly 1.125) | 4.97 | 4.92 | 2.00 |

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| p$K_a$ of propanoic acid, HC₃H₅O₂ | 4.87 | CRC Handbook; the design's table. Sure |
| p$K_a$ of formic acid, HCHO₂ | 3.75 | CRC Handbook; the design's table. Sure. Lesson 8.3's explorer has $K_a$ = 1.8 × 10⁻⁴, whose negative logarithm is 3.74: within the 0.02 allowed |
| p$K_a$ of H₂PO₄⁻ | 7.21 | the second p$K_a$ of phosphoric acid; tables give 7.20 or 7.21. Sure |
| p$K_a$ of the conjugate acid of Tris | 8.07 | tables give 8.06 to 8.08 at 25 °C. Sure |
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design |
| Molar mass of NaOH | 40.00 g/mol (22.99 + 16.00 + 1.008) | the site's `src/data/elements.ts`; it gives the 1.40 g of worked example 1 |

No $K_a$ is printed in this lesson. The $K_a$ and $K_b$ in the note under Check 5 are for the fact-checker.

**Check script:** `scratchpad/unit8/checks/8-10.py`. It recomputes every number above, the figure's numbers, each slip, the 23 worked states and every limit over all 8,400 states of the explorer by its own bisection, and reads this file for the messages, the summary and the answer positions.

**Notes for the writer**

- The words are "acid form" and "base form" for the two members of a pair, and "buffer capacity" as defined in the first section (the design's section 3). Do not write "conjugate acid" for the acid form of propanoic acid.
- A table of moles (rows Before, Change, After, in mmol) is never called an ICE table, and no strong acid or strong base ever goes into an ICE table.
- Never say that a buffer "keeps the pH constant" or "absorbs" acid without limit.
- "Only the ratio is in that equation" is literally true of the Henderson–Hasselbalch equation. Do not go on to say that the pH depends "only" on the ratio in every case: the explorer shows small departures, and the lesson says so once, above the explorer.
- No Check asks for the pH of a ready-made buffer after an addition. Check 5 asks for a range and a reason, in a state where the buffer has been used up, which is topic 8.4's equal-moles case.
- The opening's broth and the phosphate pair of the table and of Check 6 are not tied together in the text: the opening names no buffer.
- Do not mention blood, or an acetate buffer, anywhere.
- The explorer's starting buffer (100 mmol of each form in 1.00 L) is fixed by the design. The lesson's text never adds 10 mmol to it: the additions the text uses at the explorer are 15 mmol, and 40 and 50 mmol for the lopsided buffer. Worked example 1 has its own buffer (140 and 60 mmol, with 35 mmol of OH⁻), which is not one of the states the three tasks walk through and is not lesson 8.8's (40 and 40 mmol of the phosphate pair, with 1 mmol of acid).

**Reactions, substances and scenarios used:** reactions: propanoic acid with OH⁻ giving propanoate ion and water; the conjugate acid of Tris with OH⁻ giving Tris and water; a generic HA with OH⁻. Substances: propanoic acid and sodium propanoate (p$K_a$ 4.87), formic acid and sodium formate (p$K_a$ 3.75), H₂PO₄⁻ with HPO₄²⁻ (p$K_a$ 7.21), Tris and its conjugate acid (p$K_a$ 8.07), sodium hydroxide, an unnamed weak acid HA. Scenarios: bacteria in a flask of buffered broth making acid until the buffer runs out (opening, no numbers); liters holding 0.20 mol and 0.020 mol of each form, with 0.015 mol of OH⁻ (text); 1.00 L with 140 mmol of propanoic acid and 60 mmol of sodium propanoate taking 35 mmol of solid NaOH, 105 and 95 mmol, ratio 0.429 to 0.905, pH 4.50 to 4.83, against water 7.00 to 12.54 (worked example 1); formate buffers P (0.32 mol of formic acid and 0.40 mol of formate ion in 1.00 L) and Q (0.45 mol and 0.12 mol), P taking more strong acid and Q more strong base (Check 1); two propanoate buffers of 150 and 50 mmol, and 50 and 150 mmol, pH 4.39 and 5.35 (figure and text); a Tris buffer of 30 mmol of Tris and 90 mmol of its conjugate acid (Check 2) taking 25 mmol of NaOH, 65 mmol of acid form left (Check 3); 30 mmol of HA and 90 mmol of A⁻ in 250 mL taking 42 mmol of NaOH, 12 mmol of OH⁻ left over, pH 12.68 (Check 4); the explorer's propanoate buffer, 10 to 200 mmol of each form in 1.00 L with up to 50 mmol of H₃O⁺ or OH⁻, and the states 100 and 100 with 15 mmol of OH⁻ and of H₃O⁺ (5.00, 4.74), 20 and 20 with 15, 20 and 25 mmol of OH⁻ (5.72, 8.74, 11.70), 200 and 200 with 15 and 50 mmol (4.94, 5.09), 150 and 50 with 40 mmol of OH⁻ (4.78) and 40 and 50 mmol of H₃O⁺ (3.60, 2.79) (Check 5 and the three tasks); a table of four pairs; a Tris buffer for pH 8.60 at a ratio of 3.4, with 0.17 mol of Tris for 0.050 mol of its conjugate acid, and the phosphate pair refused at 25 to 1 (worked example 2); a phosphate buffer for pH 6.90 at a ratio of 0.49 (Check 6). Figure: the one the design lists for this lesson.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at the figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.10 Buffer Capacity`).

**Check script:** `scratchpad/unit8/checks/8-10.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.10 Buffer Capacity`).

### Task 11: Lesson 8.11, pH and Solubility

**Files:**
- Create: `src/content/lessons/unit-8/8-11-ph-and-solubility.mdx`
- Create: `public/figures/8-11-acid-pulls-the-anion.svg`
- No interactive block.

**Brief**

- **Front matter:** `topic: "8.11"`, `minutes: 13`, summary: "How a change in pH changes the solubility of a salt whose anion is a weak base or a hydroxide ion, explained with Le Châtelier's principle, and why other salts are not affected." (No colon in the summary.)
- **Framework (8.11, one statement):** the solubility of a salt depends on the pH when one of its ions is a weak acid or a weak base, and the effect is understood in words, with Le Châtelier's principle. The objective is to say which way a change in pH moves the solubility of a salt, and why. **Not assessed, by the framework's own statement:** calculating a solubility as a function of pH. The lesson calculates none, and one "Beyond the exam" sentence says so. **What this lesson does not do:** $K_{sp}$, molar solubility and $Q$ against $K_{sp}$ are topic 7.11's and the common-ion effect is topic 7.12's (use them, name the topic, do not teach them again); why the conjugate base of a weak acid is a base is topic 4.8's and topic 8.4's. Complex ions and hydroxides that dissolve again in excess base are left out and not mentioned. The lesson's cases are an anion that is a weak base and the hydroxide ion; a salt whose cation is a weak acid is not treated. **Equation sheet:** nothing for this topic. $K_{sp}$ is not on it (topic 7.11 said so), and no $K_{sp}$ is needed here.
- **Opening:** the steel tanks of a brewery slowly grow a hard, chalky crust that brewers call beerstone. Hot water and scrubbing barely touch it, and an acid cleaner takes it off. Beerstone is mostly calcium oxalate, a salt that hardly dissolves in water. Why should acid help? And why does acid do almost nothing for some other salts that hardly dissolve? Note for the writer: beerstone is real, is mostly calcium oxalate, and is removed with acid cleaners **(verify)**. Do not name the acid in the cleaner, give no formula in the opening, and do not answer the question there: Check 2 does.
- **Section "Taking an ion away":**
  - Recall, with the topics named. A saturated solution with solid in it is an equilibrium (topic 7.11). For strontium fluoride:

    $\ce{SrF2(s) <=> Sr^2+(aq) + 2F-(aq)}$

    $K_{sp} = [\ce{Sr^2+}][\ce{F-}]^2$, which is 4.33 × 10⁻⁹ at 25 °C (the value of topic 7.11's table).
  - Topic 7.12 put more of one ion into such a solution, and less solid dissolved. This lesson does the opposite: it takes an ion away.
  - Acid can take an ion away if that ion is a base. The fluoride ion is the conjugate base of hydrofluoric acid, HF, which is a weak acid. The conjugate base of a weak acid is itself a weak base (topics 4.8 and 8.4), so F⁻ takes a proton from H₃O⁺:

    $\ce{F-(aq) + H3O+(aq) -> HF(aq) + H2O(l)}$
  - What follows, told with $Q$ (topics 7.10 and 7.11). Some F⁻ has become HF, so [F⁻] is lower, and $Q = [\ce{Sr^2+}][\ce{F-}]^2$ is now less than $K_{sp}$. The solution is no longer saturated. More solid dissolves, and it goes on dissolving until $Q$ is back up to $K_{sp}$.
  - The same thing, told with Le Châtelier's principle (topic 7.9). F⁻ is a product of the dissolving equation. Take away a product and the equilibrium shifts toward products: more solid becomes ions.
  - Where it ends: more strontium is in solution than before, so strontium fluoride is **more soluble in the acidic solution** than in pure water. With enough acid, most of the fluorine that has dissolved is in HF molecules.
  - Place the figure `8-11-acid-pulls-the-anion.svg` here, with one sentence saying that it shows the same saturated solution before and after some acid.
  - `<KeyIdea>`: when the anion of a slightly soluble salt is a weak base, acid makes the salt more soluble. H₃O⁺ turns the anion into its conjugate acid, the concentration of the anion falls, and more solid dissolves to replace it.
- **Section "The question that decides":**
  - H₃O⁺ can take away only an ion that it reacts with. So one question decides whether acid changes a salt's solubility: **is the anion a base?**
  - An anion that is the conjugate base of a weak acid is a base, and acid raises the solubility of its salts. Fluoride and oxalate are two such anions, and so are carbonate, phosphate and sulfide. (Names only for the last three: no formula, no salt, no reaction.)
  - An anion that is the conjugate base of a strong acid is not a base to any degree that matters: Cl⁻, Br⁻, I⁻, NO₃⁻ and ClO₄⁻ essentially never take a proton in water (topic 4.8). H₃O⁺ has nothing to react with, no ion is taken away, $Q$ stays at $K_{sp}$, and the solubility is essentially the same in acid as in water.
  - It is the anion in the solid that decides, not how strong the acid in the bottle is. Any strong acid supplies the H₃O⁺. This lesson uses nitric acid, because its nitrate ion takes no part (an acid that brought one of the salt's own ions would also act as a common ion, topic 7.12).
  - What a full answer says, as a numbered list of three: (1) name the anion and say that it is a base, the conjugate base of a weak acid; (2) say what H₃O⁺ does to it; (3) say how the dissolving equilibrium responds: $Q$ falls below $K_{sp}$, or the equilibrium shifts toward the ions, so more solid dissolves. Naming the anion alone is a third of an answer.
- **Worked example 1, "Two lead salts and a little nitric acid":** two beakers hold saturated solutions at 25 °C, each with solid on the bottom: lead(II) fluoride, PbF₂, in one and lead(II) bromide, PbBr₂, in the other. A few drops of nitric acid, a strong acid, go into each, so the volume hardly changes. HF is a weak acid and HBr is a strong acid. In which beaker does the acid make more of the solid dissolve?
  1. **Write each dissolving equation and find the anion.** $\ce{PbF2(s) <=> Pb^2+(aq) + 2F-(aq)}$ and $\ce{PbBr2(s) <=> Pb^2+(aq) + 2Br-(aq)}$. The cation is the same in both, so whatever differs between the beakers is the anion's doing. The anions are F⁻ and Br⁻.
  2. **Ask whether each anion is a base.** F⁻ is the conjugate base of a weak acid, HF, so it is a weak base. Br⁻ is the conjugate base of a strong acid, HBr, so it is not.
  3. **Lead(II) fluoride.** H₃O⁺ turns F⁻ into HF, by the equation of the first section. [F⁻] falls, $Q = [\ce{Pb^2+}][\ce{F-}]^2$ drops below $K_{sp}$, and more PbF₂ dissolves until $Q$ equals $K_{sp}$ again.
  4. **Lead(II) bromide.** H₃O⁺ does not react with Br⁻, and it does not react with Pb²⁺. Nothing is taken away, $Q$ still equals $K_{sp}$, and essentially no more PbBr₂ dissolves.
  5. **The nitrate ions** that came with the acid take no part in either beaker: lead(II) nitrate is soluble (topic 4.7's rule).
  6. **$K_{sp}$.** Each solid has its own, and each is the same after the acid as before. The temperature has not changed.

  Notes for the writer: the two salts share their cation on purpose, so that the anion is the only thing that differs. Print no $K_{sp}$ for either. The acid is nitric acid on purpose. Hydrobromic acid would add bromide, a common ion for PbBr₂. A few drops of nitric acid in a beaker of solution make a cold, dilute acid, which does not oxidize bromide; do not write "concentrated" or "hot". Keep "essentially": a real solution of ions changes solubilities a very little even when nothing reacts, and the lesson does not go into that. Lead compounds are poisonous; the lesson says nothing about handling them, as lessons 7.11 and 7.12 say nothing for theirs. Do not bring strontium fluoride into this example, and do not use thallium(I) chloride: both were worked in topic 7.11.
- **Check 1**, `<Check answer={3}>`: "Each of these three solids is only slightly soluble in water. HBr and HI are strong acids. The hydrogen oxalate ion, HC₂O₄⁻, is a weak acid. Which solid is more soluble in dilute nitric acid than in pure water?" Options:
  1. Thallium(I) bromide, TlBr
  2. Silver iodide, AgI
  3. Calcium oxalate, CaC₂O₄
  4. All three, because nitric acid is a strong acid

  Why: the test is the anion. The oxalate ion, C₂O₄²⁻, is the conjugate base of the weak acid HC₂O₄⁻, so it takes a proton from H₃O⁺:

  $\ce{C2O4^2-(aq) + H3O+(aq) -> HC2O4-(aq) + H2O(l)}$

  That lowers [C₂O₄²⁻], $Q$ falls below $K_{sp}$, and more calcium oxalate dissolves. Br⁻ and I⁻ are the conjugate bases of strong acids, so they do not take protons from H₃O⁺, and thallium(I) bromide and silver iodide are essentially no more soluble in the acid than in water. How strong the added acid is does not decide anything: what decides is whether the solid's anion is a base. Misses:
  - 1: "Bromide is the conjugate base of HBr, a strong acid. Would Br⁻ take a proton from H₃O⁺?"
  - 2: "Iodide is the conjugate base of HI, a strong acid. Would I⁻ take a proton from H₃O⁺?"
  - 4: "The strength of the acid added is not the test. For each solid, ask whether its anion is a base that H₃O⁺ can react with."
- **Check 2**, `<Check answer={2}>`: "Back to the brewery. Beerstone is mostly calcium oxalate, CaC₂O₄, and the hydrogen oxalate ion, HC₂O₄⁻, is a weak acid. Which of these is a complete explanation of why an acid cleaner takes the crust off?" Options:
  1. Oxalate is the conjugate base of a weak acid, and acids react with bases
  2. H₃O⁺ turns oxalate ions into HC₂O₄⁻, so Q falls below Ksp and more solid dissolves
  3. The acid raises the Ksp of calcium oxalate, so the water can hold a larger product of ion concentrations than before
  4. H₃O⁺ reacts with the calcium ions and removes them, so more solid dissolves

  Why: the crust is in equilibrium with a little dissolved calcium and oxalate:

  $\ce{CaC2O4(s) <=> Ca^2+(aq) + C2O4^2-(aq)}$

  The oxalate ion is a weak base, so H₃O⁺ from the cleaner turns it into HC₂O₄⁻. With less oxalate ion in the solution, $Q$ is below $K_{sp}$, and more of the crust dissolves. As long as fresh acid keeps arriving, the oxalate ion keeps being taken away and the crust keeps dissolving. The first option is true and names the right ion, but it stops before saying what happens to the equilibrium. $K_{sp}$ does not change: it is a constant at a given temperature. And a calcium ion is not a base, so H₃O⁺ does nothing to it. Misses:
  - 1: "That statement stops before the solid comes into it. A complete explanation goes on to say what changes in the solution and why more solid dissolves."
  - 3: "Ksp is a constant at a given temperature, whatever else is in the water. The acid changes a concentration. Which one?"
  - 4: "A calcium ion does not take a proton, so H₃O⁺ leaves it alone. Which ion of the solid is a base?"

  Note for the writer: with enough strong acid the hydrogen oxalate ion takes a second proton and becomes oxalic acid, H₂C₂O₄, a weak acid too (lesson 4.5 called it one). The Why may say so in one sentence; the equation with one proton is enough. Lesson 4.5's neodymium oxalate comes out of an acidic solution as a solid, so never write that oxalates "dissolve in acid" without "better" or "more": more soluble is not the same as soluble.
- **Section "Hydroxides: the pH works both ways":**
  - In a slightly soluble hydroxide the anion is the hydroxide ion itself, a strong base. H₃O⁺ reacts with it essentially completely:

    $\ce{H3O+(aq) + OH-(aq) -> 2H2O(l)}$
  - And for a hydroxide the pH is more than a way of adding acid. The pH is itself a measure of [OH⁻] (topic 8.1): a higher pH means more OH⁻ in the solution, and OH⁻ is one of the ions the solid gives. So raising the pH works on a hydroxide as a common ion does (topic 7.12), and lowers its solubility.
  - In one line each, for a hydroxide such as nickel(II) hydroxide: lower the pH, and it is more soluble; raise the pH, and it is less soluble.
- **Worked example 2, "Nickel out of a spent battery, and back":** the positive plate of a nickel–metal hydride cell, the common rechargeable AA battery, holds nickel(II) hydroxide, Ni(OH)₂, once the cell has run down. It is a pale green solid that is very slightly soluble in water. A recycler wants the nickel in solution, away from the rest of the cell, and later wants it back as a solid. Explain how a change in pH does each.
  1. **Write the equilibrium.** $\ce{Ni(OH)2(s) <=> Ni^2+(aq) + 2OH-(aq)}$, with $K_{sp} = [\ce{Ni^2+}][\ce{OH-}]^2$.
  2. **Lower the pH to dissolve it.** Added acid supplies H₃O⁺, which reacts with OH⁻ to make water. [OH⁻] falls, $Q$ drops below $K_{sp}$, and more solid dissolves. With enough acid all of it dissolves:

     $\ce{Ni(OH)2(s) + 2H3O+(aq) -> Ni^2+(aq) + 4H2O(l)}$ (split over two lines, breaking after the arrow)
  3. **Raise the pH to bring it back.** Adding a strong base to the nickel solution raises [OH⁻]. Now $Q$ is above $K_{sp}$, and Ni(OH)₂ precipitates until $Q$ has fallen to $K_{sp}$ (topic 7.11). The more OH⁻ in the solution, the less Ni²⁺ can stay in it.
  4. **One equilibrium did both.** Acid takes OH⁻ away and the solid dissolves. Base adds OH⁻ and the solid forms. $K_{sp}$ is the same throughout.

  Notes for the writer: the positive plate of a discharged nickel–metal hydride cell is nickel(II) hydroxide, and recyclers do dissolve such material in acid **(verify)**. Say "one way to get the nickel back is to raise the pH"; do not claim it is how every recycler does it. Do not name the acid, and do not set the scene in a plating shop or its rinse water: lesson 4.5 takes zinc out of a plating shop's rinse water with sodium hydroxide. Print no $K_{sp}$ for nickel(II) hydroxide.
- **Check 3**, `<Check answer={1}>`: "A saturated solution of nickel(II) hydroxide has solid Ni(OH)₂ on the bottom. A little nitric acid is added at constant temperature, and some solid is still there when equilibrium returns. Compared with before the acid went in, what is true of the solution?" Options:
  1. [Ni²⁺] is higher, [OH⁻] is lower and Ksp is the same
  2. [Ni²⁺] is higher, [OH⁻] is higher and Ksp is larger
  3. [Ni²⁺] and [OH⁻] are both back where they started, and Ksp is the same
  4. [Ni²⁺] is higher, [OH⁻] is the same and Ksp is larger

  Why: the acid used up OH⁻, and more solid dissolved to replace some of it. Every formula unit that dissolved put a nickel ion into the solution, so [Ni²⁺] is higher than before. $K_{sp} = [\ce{Ni^2+}][\ce{OH-}]^2$ is a constant at a given temperature, and the temperature did not change. If the product is the same and [Ni²⁺] is higher, [OH⁻] must be lower than before, which is to say the pH is lower. Solid is still there, so the solution is saturated again, at a new pair of concentrations. Misses:
  - 2: "The acid used up OH⁻, and Ksp is fixed at a given temperature. With those two facts, can both concentrations be higher?"
  - 3: "If both concentrations were unchanged, no extra solid would have dissolved. What does each formula unit that dissolves put into the solution?"
  - 4: "Look again at Ksp: what would have to change for it to change? Then ask whether [OH⁻] can stay put while acid is using OH⁻ up."
- **Check 4**, `<Check answer={2}>`: "Solid cobalt(II) hydroxide, Co(OH)₂, is stirred into three buffers, at pH 8.0, pH 9.0 and pH 10.0, until no more dissolves. Each buffer holds its pH, and nothing in the buffers reacts with Co²⁺. In which buffer is the concentration of dissolved Co²⁺ highest?" Options:
  1. At pH 10.0, because a hydroxide is most at home in a basic solution
  2. At pH 8.0, because that buffer holds the least OH⁻
  3. The same in all three, because Ksp is the same in all three
  4. None dissolves in any of them, because all three buffers are basic

  Why: the equilibrium is

  $\ce{Co(OH)2(s) <=> Co^2+(aq) + 2OH-(aq)}$

  with $K_{sp} = [\ce{Co^2+}][\ce{OH-}]^2$. Each buffer fixes [OH⁻]: at 25 °C it is 1.0 × 10⁻⁶ M at pH 8.0, 1.0 × 10⁻⁵ M at pH 9.0 and 1.0 × 10⁻⁴ M at pH 10.0. $K_{sp}$ is the same in all three, so where [OH⁻] is smallest, [Co²⁺] must be largest: at pH 8.0. OH⁻ is a common ion for a hydroxide (topic 7.12), and the more of it there is, the less solid dissolves. Some solid dissolves in each buffer, because a basic solution is not a saturated one. Misses:
  - 1: "OH⁻ is one of the ions this solid gives when it dissolves. What does an ion already in the solution do to a salt's solubility (topic 7.12)?"
  - 3: "Ksp is the same in all three, but Ksp is a product of two concentrations. If [OH⁻] differs from buffer to buffer, can [Co²⁺] be the same?"
  - 4: "Basic does not mean saturated. Solid dissolves until the product of the ion concentrations reaches Ksp, and each buffer fixes a different [OH⁻]."

  Note for the writer: do not name the buffers. A buffer made with ammonia would react with cobalt ions, which is why the question says that nothing in the buffers does. Give no value of [Co²⁺] anywhere: the three values of [OH⁻] in the Why are topic 8.1's arithmetic, and the lesson stops there.
- **Section "What does not change, and what is not true":**
  - $K_{sp}$ does not change when the pH does. It is a constant for the solid at a given temperature, whatever else is in the water (topic 7.12 said the same of a common ion). A change in pH changes a concentration, so it changes $Q$, and the solid dissolves or forms until $Q$ equals the same $K_{sp}$ again. What changes is the solubility: how much solid a liter of that solution can dissolve.
  - "Acid dissolves things" is not a rule. Acid raises the solubility of a solid whose anion H₃O⁺ reacts with, and leaves the others essentially alone.
  - "**Beyond the exam:** how much more soluble a salt becomes at a given pH can be calculated, by combining $K_{sp}$ with the $K_a$ of the anion's conjugate acid. The exam does not ask for that. It asks which way the solubility moves, and why."
- **Check 5**, `<Check answer={4}>`: "A classmate says: 'The pH is about H₃O⁺ and OH⁻, so the only solids whose solubility depends on the pH are hydroxides.' HF is a weak acid and HI is a strong acid. Which fact shows that the claim is false?" Options:
  1. Nickel(II) hydroxide, Ni(OH)₂, is more soluble in dilute nitric acid than in water
  2. Cobalt(II) hydroxide, Co(OH)₂, is less soluble in a buffer at pH 10 than in one at pH 8
  3. Silver iodide, AgI, is essentially no more soluble in dilute nitric acid than in water
  4. Strontium fluoride, SrF₂, is more soluble in dilute nitric acid than in water

  Why: one case that goes against a claim is enough to show it false, and the case must be a solid that is not a hydroxide and whose solubility still depends on the pH. Strontium fluoride is one: F⁻ is a weak base, so H₃O⁺ turns it into HF, [F⁻] falls, and more solid dissolves. The two hydroxides do just what the claim says hydroxides do, so they cannot go against it. Silver iodide is not a hydroxide, and its solubility does not depend on the pH, because I⁻ is the conjugate base of a strong acid. That agrees with the claim too. All four statements are true; only one of them is a case the claim says cannot happen. Misses:
  - 1: "That is true, and it is a hydroxide whose solubility depends on the pH, just as the claim says. Look for a case the claim says cannot happen."
  - 2: "True, and it is again a hydroxide answering to the pH, as the claim allows. What kind of solid would the claim be wrong about?"
  - 3: "True, but a solid that is not a hydroxide and ignores the pH is just what the claim expects. Which of these facts would surprise the classmate?"

  Note for the writer: all four options are true statements, and the question asks which one goes against the claim. Do not change the claim back to "any salt dissolves better in acid". The classmate's words are in single quotation marks inside the question's double ones.
- **Check 6**, `<Check answer={3}>`: "Solid lead(II) fluoride, PbF₂, sits at the bottom of its saturated solution. A little nitric acid is stirred in at constant temperature. When equilibrium returns, some solid is still there, and [Pb²⁺] is four times what it was before the acid. HF is a weak acid. What is true of the fluoride ion concentration now?" Options:
  1. [F⁻] is four times what it was, because each PbF₂ that dissolves gives two F⁻
  2. [F⁻] is what it was, because more solid dissolved to replace what the acid took
  3. [F⁻] is half what it was, because Ksp has not changed
  4. [F⁻] is a quarter of what it was, because [Pb²⁺] times [F⁻] is fixed

  Why: the acid does not change $K_{sp}$, which is fixed at a given temperature, and solid is still there, so the solution is saturated again and $[\ce{Pb^2+}][\ce{F-}]^2$ has the value it had before. If [Pb²⁺] is 4 times as large, $[\ce{F-}]^2$ must be one-quarter as large, and [F⁻] itself one-half: 4 × (1 ÷ 2)² = 1. What the acid did change is where the fluorine is. Every PbF₂ that dissolved did give two fluoride ions, but H₃O⁺ turned most of them into HF, so [F⁻] did not rise with [Pb²⁺]. Nor is [F⁻] unchanged: with four times the [Pb²⁺], that would make the product four times $K_{sp}$. And a quarter forgets that the fluoride concentration is squared in the expression. Misses:
  - 1: "Each formula unit does give two fluoride ions, but do they all stay as F⁻ in an acidic solution? Then try your answer in the Ksp expression."
  - 2: "If [F⁻] were unchanged while [Pb²⁺] went up four times, the product in the Ksp expression would be four times as large. Can it be, at one temperature?"
  - 4: "Write the Ksp expression for PbF₂ and look at the power on [F⁻]. Then try your answer in it: does the product come out unchanged?"

  Note for the writer: this is the figure's bookkeeping (1 × 2² = 4 and 4 × 1² = 4) asked of another fluoride, in concentrations. It uses $K_{sp}$ as a fixed product and nothing else: no pH is given, no $K_{sp}$ and no $K_a$, and no solubility is calculated. Do not add the pH of the solution or the amount of acid. (For the fact-checker, with values that are not printed: with $K_{sp}$ about 3.3 × 10⁻⁸ and a $K_a$ of HF near 6.8 × 10⁻⁴, the solution starts near 0.0020 M Pb²⁺ and 0.0040 M F⁻ and ends near 0.0081 M Pb²⁺, 0.0020 M F⁻ and 0.014 M HF, at a pH near 2.3: a real state that a little nitric acid reaches.)
- **Trap:** **Judging by the acid and not by the anion** (the question is whether the solid's anion is a base; if it is the conjugate base of a strong acid, acid changes essentially nothing). **Saying that $K_{sp}$ changes** (the pH changes a concentration and so changes $Q$; $K_{sp}$ is fixed at a given temperature). **Stopping at "the anion is a base"** (a full answer also says that H₃O⁺ takes the anion away and that more solid dissolves to restore the equilibrium). **Having H₃O⁺ react with the metal ion** (Sr²⁺, Ca²⁺ and Ni²⁺ are not bases; the anion is what reacts). **Getting a hydroxide backward** (a higher pH means more OH⁻, a common ion, so less of a hydroxide dissolves). **Calculating a solubility from a pH** (the question asks for a direction and a reason).
- **Key points:** a saturated solution with solid in it is an equilibrium, and anything that takes one of its ions away makes more solid dissolve; a slightly soluble salt whose anion is a weak base, the conjugate base of a weak acid, is more soluble in acid than in water, because H₃O⁺ turns the anion into its conjugate acid; a salt whose anion is the conjugate base of a strong acid, such as Cl⁻, Br⁻, I⁻ or NO₃⁻, is essentially no more soluble in acid; a slightly soluble hydroxide such as Ni(OH)₂ or Co(OH)₂ is more soluble at a lower pH and less soluble at a higher pH, where OH⁻ acts as a common ion; a change in pH changes $Q$ and never $K_{sp}$, which is fixed at a given temperature; a full explanation names the ion that is a base, says what H₃O⁺ or OH⁻ does to its concentration, and says which way the dissolving equilibrium shifts.

**Figure**

- **`8-11-acid-pulls-the-anion.svg`** (viewBox 0 0 480 370, font-size 18). Two boxes side by side: the left from x = 20 to 220 and the right from x = 260 to 460, each from y = 44 to y = 264, outlined in ink and filled with the light accent (the solution). Water molecules and nitrate ions are not drawn.
  - **Particles.** A strontium ion, Sr²⁺, is a dark circle of radius 8 (ink fill). A fluoride ion, F⁻, is a larger pale circle of radius 11 (card-colored fill `#FDFCF9`, ink outline). An HF molecule is a fluoride-sized pale circle with a small circle of radius 5 (white fill, ink outline) touching it at the upper right, its center 13 to the right of and 8 above the large circle's center. The three differ in size and shape as well as in shade.
  - **Left box, title "In water"** (y = 30, centered at x = 120). The solid: 15 touching circles in three rows of five on the bottom of the box, at x = 76, 98, 120, 142, 164 and y = 207, 229, 251. Strontium ions at (98, 207), (164, 207), (120, 229), (76, 251) and (142, 251); the other ten places are fluoride ions. That is 5 Sr²⁺ and 10 F⁻. Dissolved, apart from one another: one Sr²⁺ at (70, 100) and two F⁻ at (150, 80) and (170, 150).
  - **Right box, title "After 7 H₃O⁺"** (centered at x = 360). The solid, smaller: 6 touching circles in two rows of three, at x = 338, 360, 382 and y = 229, 251. Strontium ions at (360, 229) and (338, 251); the other four places are fluoride ions. That is 2 Sr²⁺ and 4 F⁻. Dissolved, apart from one another, twelve particles: four Sr²⁺ at (335, 64), (292, 118), (336, 174) and (432, 172); one F⁻ at (385, 118); seven HF with their large circles at (290, 72), (385, 74), (432, 66), (337, 124), (430, 122), (288, 168) and (384, 166).
  - **Under the boxes** (y = 292): "1 × 2² = 4" centered at x = 120 and "4 × 1² = 4" centered at x = 360.
  - **A key** along the bottom (y = 340): a strontium ion at (86, 334) with "Sr²⁺" beside it, a fluoride ion at (206, 334) with "F⁻" beside it, and an HF molecule at (318, 334) with "HF" beside it.
  - **Counts, which must be kept exactly.** Strontium: 5 + 1 = 6 on the left and 2 + 4 = 6 on the right. Fluorine: 10 + 2 = 12 on the left and 4 + 1 + 7 = 12 on the right. Three formula units have dissolved (the solid went from 5 to 2), giving 3 Sr²⁺ and 6 F⁻; with the 2 F⁻ already there that is 8, of which 7 met an H₃O⁺ and became HF and 1 is left. Charge: the left solution holds +2 and −2. The right holds +8 and −1, and the 7 nitrate ions that came with the 7 H₃O⁺, which are not drawn, make up the other −7. Strontium ions times fluoride ions squared, in solution: 1 × 2² = 4 on the left and 4 × 1² = 4 on the right.
  - Text in the figure, seven pieces: "In water", "After 7 H₃O⁺", "1 × 2² = 4", "4 × 1² = 4", "Sr²⁺", "F⁻", "HF".
  - Alt: "Two boxes, each a saturated solution of strontium fluoride with a block of solid on the bottom. Strontium ions are small dark circles and fluoride ions are larger pale circles. In the left box, labeled in water, the solid is made of 5 strontium ions and 10 fluoride ions, and 1 strontium ion and 2 fluoride ions are dissolved above it. In the right box, labeled after 7 H3O plus, the solid is smaller, 2 strontium ions and 4 fluoride ions, and above it are 4 strontium ions, 1 fluoride ion and 7 HF molecules, each drawn as a fluoride-sized circle with a small circle attached. Under the left box it says 1 times 2 squared equals 4, and under the right box 4 times 1 squared equals 4."
  - Caption: "Acid turns fluoride ions into HF, and more solid dissolves to replace them. The number of strontium ions times the square of the number of fluoride ions is the same in both boxes, because the solubility-product constant has not changed. Water molecules and nitrate ions are not drawn, and far more ions are drawn than really dissolve."

**Values**

| Quantity | Value | Source, and how sure |
|---|---|---|
| $K_{sp}$ of strontium fluoride, SrF₂ | 4.33 × 10⁻⁹ at 25 °C | lesson 7.11's table (CRC Handbook). Sure. The only $K_{sp}$ printed in this lesson |
| $K_{sp}$ of silver iodide, AgI | 8.52 × 10⁻¹⁷ | lesson 7.11's table. Sure. Not printed here |
| $K_{sp}$ of lead(II) fluoride, PbF₂ | 3.3 × 10⁻⁸ | CRC Handbook, as remembered; other tables give 2.7 × 10⁻⁸ to 4 × 10⁻⁸. Fairly sure **(verify)**. Not printed; it makes PbF₂ "slightly soluble" (about 0.0020 M) |
| $K_{sp}$ of thallium(I) bromide, TlBr | 3.7 × 10⁻⁶ | CRC Handbook, as remembered. Fairly sure **(verify)**. Not printed; it only makes TlBr "slightly soluble" |
| $K_{sp}$ of lead(II) bromide, PbBr₂ | 6.6 × 10⁻⁶ | CRC Handbook, as remembered; some textbook tables give values several times larger or smaller. Fairly sure **(verify)**. Not printed; it makes PbBr₂ "slightly soluble" (about 0.012 M), and it is more soluble in water than PbF₂ |
| $K_{sp}$ of calcium oxalate, CaC₂O₄ | 2.3 × 10⁻⁹ | the design's table (the monohydrate). Fairly sure. Not printed |
| $K_{sp}$ of nickel(II) hydroxide, Ni(OH)₂ | 5.5 × 10⁻¹⁶ | the design's table. Fairly sure. Not printed |
| $K_{sp}$ of cobalt(II) hydroxide, Co(OH)₂ | 5.9 × 10⁻¹⁵ | CRC Handbook, as remembered. Fairly sure **(verify)**. Not printed |
| HF | a weak acid; p$K_a$ about 3.2 ($K_a$ near 6.8 × 10⁻⁴) | sure that it is weak. No value is printed (the teacher's value is on the avoid list) |
| Lead(II) nitrate | soluble | sure (every nitrate is, by topic 4.7's rule) |
| HC₂O₄⁻ and H₂C₂O₄ | both weak acids; the p$K_a$ of HC₂O₄⁻ is about 4.2 (tables give 3.8 to 4.3) | sure that both are weak; unsure of the second decimal. No value is printed |
| HCl, HBr, HI, HNO₃, HClO₄ | strong acids | lesson 4.2's list |
| $K_w$ at 25 °C | 1.0 × 10⁻¹⁴ | the design; it gives the three values of [OH⁻] in Check 4 |
| Ionic radii, for the drawing only | Sr²⁺ 118 pm, F⁻ 133 pm | as remembered (six-coordinate radii). Fairly sure; they only decide which circle is drawn larger |
| Color of nickel(II) hydroxide | pale green | sure |

No number is calculated in this lesson except the three hydroxide concentrations in the Why of Check 4 and the factor of one-half in Check 6, which comes from $K_{sp}$ being a fixed product.

**Check script:** `scratchpad/unit8/checks/8-11.py`. It checks every equation's balance in atoms and charge, the figure's counts, conservation, charge and the two products, that no two drawn particles overlap and none leaves its box, the hydroxide concentrations of Check 4, the sizes of the equilibrium constants that justify the arrows, the factor of Check 6 and each wrong option's product, and reads this file for the messages, the options, the summary and the answer positions.

**Notes for the writer**

- No solubility is calculated anywhere in the lesson, at any pH. The only $K_{sp}$ printed is strontium fluoride's, from topic 7.11. Strontium fluoride is the salt of the first section, the figure and one option of Check 5, and of nothing else: worked example 1 and Check 6 use lead(II) fluoride.
- Sulfates are left out altogether. Do not offer barium sulfate or any sulfate as a salt that acid does not affect: the sulfate ion is a very weak base, and its case is a matter of degree.
- Do not use calcium carbonate, magnesium hydroxide, silver chloride or calcium fluoride as an example, and do not mention caves, marble, antacids, tooth enamel or acid rain.
- The reaction of an anion with H₃O⁺ takes a single arrow, as every reaction with a strong acid as a reactant does in this unit. Do not write one overall equation for strontium fluoride or lead(II) fluoride with acid: that overall reaction does not go to completion, and a single arrow would say that it does. The two steps are enough. The overall equation for nickel(II) hydroxide with acid does go to completion and is written with a single arrow.
- "Essentially" stays wherever the brief has it ("essentially never take a proton", "essentially the same", "essentially no more").
- The dilute nitric acid of the Checks is dilute on purpose: hot concentrated nitric acid would oxidize bromide and iodide, which is another reaction and not this lesson's.
- "Only" appears once as a claim, in "H₃O⁺ can take away only an ion that it reacts with", and it is true of H₃O⁺.

**Reactions, substances and scenarios used:** reactions: SrF₂ dissolving; F⁻ with H₃O⁺ giving HF; PbF₂ dissolving; PbBr₂ dissolving; C₂O₄²⁻ with H₃O⁺ giving HC₂O₄⁻; CaC₂O₄ dissolving; H₃O⁺ with OH⁻; Ni(OH)₂ dissolving, Ni(OH)₂ with 2 H₃O⁺ giving Ni²⁺, and Ni(OH)₂ precipitating when strong base is added; Co(OH)₂ dissolving. Substances: strontium fluoride, lead(II) fluoride, lead(II) bromide, thallium(I) bromide, silver iodide, calcium oxalate, nickel(II) hydroxide, cobalt(II) hydroxide, nitric acid; carbonate, phosphate and sulfide ions by name only. Scenarios: beerstone, a crust of calcium oxalate in a brewery's tanks, taken off with an acid cleaner (opening and Check 2); a saturated SrF₂ solution given acid (the first section and the figure); saturated solutions of PbF₂ and PbBr₂, one cation with two anions, each given a few drops of nitric acid (worked example 1); TlBr, AgI and calcium oxalate in dilute nitric acid (Check 1); nickel(II) hydroxide from the positive plate of a nickel–metal hydride cell dissolved by lowering the pH and precipitated by raising it (worked example 2); a saturated Ni(OH)₂ solution given a little nitric acid (Check 3); Co(OH)₂ stirred into buffers at pH 8.0, 9.0 and 10.0 (Check 4); a classmate's claim that only hydroxides have a solubility that depends on the pH, refuted by SrF₂ in dilute nitric acid, with Ni(OH)₂, Co(OH)₂ and AgI as true statements that fit the claim (Check 5); a saturated PbF₂ solution given a little nitric acid, [Pb²⁺] four times as large and [F⁻] half, with K_sp unchanged (Check 6). Figure: the one the design lists for this lesson, as a before box and an after box.

**Steps**

- [ ] Draw the figure and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at the figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.11 pH and Solubility`).

**Check script:** `scratchpad/unit8/checks/8-11.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 8.11 pH and Solubility`).

---

### Task 12: Close out Unit 8's lessons

- [ ] Add an "As built" section to the design and "As carried out" notes to this plan under each group.
- [ ] In the last pull request, list for the teacher: what to verify against the framework, every value the checkers could not both confirm, and Claude's calls from the design's section 1.
