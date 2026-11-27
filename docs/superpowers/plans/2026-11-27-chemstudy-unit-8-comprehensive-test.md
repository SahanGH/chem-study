# ChemStudy Unit 8 Comprehensive Test Implementation Plan

**Goal:** Put a new Unit 8 comprehensive test on chem-study.com: two pages, one per sitting, 39 scored free-response questions written fresh from the AP framework, each with a worked answer and a rubric.

**Architecture:** Two MDX files in `src/content/practice/unit-8/` of the kind `test`, built from the existing practice blocks. The avoid list, the task table and a pool per part are made. One writer per part drafts its questions and a number-check script; the controller runs the scripts, compares the parts, assembles each session, builds and tests; independent fact-checks and an originality check follow. No code changes.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-8-comprehensive-test-design.md`.

**Builds on:** Plan 4 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-comprehensive-test.md`), whose sections **"The writer's guide"** and **"How every session is checked"** apply, with the general rules of Plan 11 (`2026-11-15-chemstudy-unit-7-comprehensive-test.md`, "What changes for Unit 7": systems from a pool; honest values; rubric lines that score every sound route; the number check), the Unit 6 test's plan (`2026-11-27-chemstudy-unit-6-comprehensive-test.md`) and the end of its design ("For the tests to come"), and the changes in this plan's "What changes for Unit 8".

## Facts verified before writing (do not rediscover)

1. **The kind `test` exists.** Unit 8's seven practice documents (skill ladders, five worksheets, the free-response set) take orders 1 to 7, so the two sessions are 8 and 9. **The Unit 8 practice must be merged before pull request B**, so that `src/content/practice/unit-8/` exists and the orders follow. A frontmatter `summary` is at most 200 characters, a `title` at most 80, `minutes` at most 180.
2. **The build check** (`scripts/check-dist.mjs`) fails a practice page where a part has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions. A `<Part label="d" beyond>` prints "Beyond the exam" over the part; its points count like any other part's.
3. **Room on a phone.** A calculation inside a part's answer has room for about 25 rendered characters at 320 px. A table inside a part has about 190 px (236 px in a stem): three short columns at most inside a part, four in a stem. Inline math cannot wrap.
4. **The site's values.** Atomic masses from the exam's table (`src/data/elements.ts`), every molar mass their sum to two decimal places. K_w = 1.0 × 10⁻¹⁴ at 25 °C; 2.9 × 10⁻¹⁵ at 10 °C and 2.9 × 10⁻¹⁴ at 40 °C (lesson 8.1). The unit's own table of K_a, K_b and pK_a values is in the lessons' design, section 3 ("Values"), with how sure each is; the electronegativities are lesson 8.6's (copy from the lesson, not from a list).
5. **The groundwork** is in `scratchpad/unit8-test/`: `avoid-list.md` (for each topic, what the lessons' text, worked examples, Checks, Traps and explorers, the practice and the teacher's materials already use, the kinds of question already set with a count of each, and what is free; **nothing under `exam/` was read**); `task-table.md` (the 39 tasks, each compared with the pages themselves, with the nearest existing passage, why the task is not a rebuild and what to watch; dropped tasks and spares at its end; every number in it multiplied out by `work/numbers*.py`); `pools.md` (a pool of substances and values per part, **every value from memory**, graded A, B or C by how sure its author was, or marked as the unit's own).
6. **The sources for the originality check only** (writers never read them): the teacher's `u08-notes.tex`, `u08-review.tex`, `u08-map.tex`, `u08-selfstudy.tex`, `u08-frq.tex` and `worksheets/u08-ws1.tex` to `u08-ws5.tex` in `/home/user/sahangh/ap_chem_prep/Units/unit08-acids-bases/`, **named one by one, never the `exam/` folder and never a file with "exam" or "test" in its name**; the site's `src/content/lessons/unit-8/` and `src/content/practice/unit-8/`. No textbook can be read from this session. `scratchpad/unit6/teacher-avoid-list.md` is read by no one.
7. **The framework for Unit 8:** `scratchpad/ced/unit8-framework.md`, written from memory; the College Board's site cannot be reached. The design's section 5 says how each unsure point is handled.
8. **What the checks of Units 6 and 8 kept finding** (design, section 6, last two items).

## Conventions, models, roles

Conventional commits, with the attribution lines the session's own rules give and no others; American English (`CLAUDE.md`); never swallowing an error; everything that is not the site in the scratch folder.

| Role | Model | What it may touch |
|---|---|---|
| Writer, one per part | The strongest model (Fable) | Its own draft and check script |
| Fact-checker, one per part | Fable | Nothing: it reports |
| Originality checker, one per session | Sonnet | Nothing: it reports |
| Fixer, applying a list the controller has decided | Sonnet | One part's draft and check script |
| Reviser, rewriting the parts the originality check names | Fable | One part's draft and check script |
| Second checker, two parts at a time | Fable | Nothing: it reports |
| Controller | This session | **Only the controller builds, runs the site's tests, commits, opens pull requests and merges** |

**Merging:** Claude merges each pull request when its "Build and test" check passes on GitHub (the teacher's word, 2026-11-27).

**A correction to a number** proposed by any agent is recomputed by the controller in a script before it is applied.

## What changes for Unit 8

Give this section to every writer with Plan 4's writer's guide and Plan 11's general rules.

- **What a writer reads:** the framework notes for its topics (Fact 7); `src/content/lessons/unit-8/` for its topics and the ones they lean on; `src/content/practice/unit-8/` (what students have already practiced; the model of the format is `src/content/practice/unit-6/comprehensive-test-session-1.mdx`); the avoid list (its topics' sections and the closing lists), its part of the task table, and its own pool. It never reads the AP Chem repository, any textbook, or `scratchpad/unit6/` or `scratchpad/unit8/`.
- **Where it writes:** `scratchpad/unit8-test/drafts/part-<x>.mdx` (the part's `## Part X: Title` heading, its opening sentence and its questions, numbered as its brief says) and `scratchpad/unit8-test/checks/part-<x>.py`.
- **Tasks:** the ones the task table gives its part, each with the change its "Risk" cell asks for. Never one of the kinds the avoid list counts for its topic with a new substance. If a task cannot be made to work, use a spare from the table's last section and say so.
- **Substances and settings:** from the part's own pool. Never one of the things the avoid list says the test must use nowhere, and never a setting on its closing list.
- **Values.** No lookup is possible. A stem gives every value its question uses, introduced by "use these values" or, for a value the pool grades C, "take", and the answer uses exactly those. Only the pool's values: the unit's own, or a new one with its grade. A value graded C is listed in the handoff report. Molar masses are the exam table's sums to two decimal places. Made-up data say they are made up. **A "measured" pH is generated by the check script** from the pool's constant (from the full equilibrium where the shortcut would fail or where the answer works backward), and the script asserts that working backward from the printed reading returns the constant to two figures.
- **The conventions of the unit** (lessons design, section 3):
  - **H₃O⁺, and never a bare H⁺**, in every equation, expression and sentence. Every ionization is written with water.
  - **A state symbol on every species** of every equation. A weak acid or base with water takes the double arrow; any reaction with a strong acid or a strong base takes the single arrow. Water is left out of every K.
  - **The unit M on every concentration**, in a sentence, a table heading or a display.
  - **A pH or a pOH to two decimal places**; a concentration found from one to two figures. Where a printed result is rounded, the step shows the carried value, and a tie at the last figure kept is avoided by choosing other data.
  - **The small-x check with its percentage wherever the shortcut is used**: x divided by the starting concentration (by the smaller one where x is left out beside two), times 100 percent, written out, with "under 5 percent" said. It is "the check this site uses", never a rule of the exam. No question needs the quadratic formula.
  - **A base's x is [OH⁻]: the pOH on one line, then the pH on its own line** (14.00 minus the pOH, at 25 °C).
  - **A table of moles before any ICE table when a strong acid or a strong base is added:** rows Before, Change, After, values in millimoles, no x, never called an ICE table. The ICE table, if one is needed, comes after and has an empty first header cell, one column for each species in the K expression, rows I, C and E, values in M (said in the sentence above it).
  - Titration amounts go through moles and the equation; never M_aV_a = M_bV_b. Every concentration after mixing uses the total volume.
  - A base's buffer, curve or indicator uses the pK_a of its conjugate acid, never a pK_b.
  - Every solution is at 25 °C unless the question gives another K_w.
- **The terms of the lessons:** "ionization", not "dissociation", for a weak acid or base with water; "percent ionization"; "acid form" and "base form"; "conjugate acid–base pair"; "equivalence point", "endpoint", "half-equivalence point", "buffer region"; "buffer capacity"; "table of moles"; "solubility-product constant". Never "hydrolysis", "ICF table", "zwitterion", "Lewis acid", "leveling" or "amphoteric". "Size", not "magnitude".
- **Fact 8 is a checklist for every answer and every rubric line.** Test each "only", "always", "never" and "most" on another example before writing it. **A part that asks "why" or "what does this show" is the likeliest to restate a lesson: end a question on something its own data decide.**
- **Rubrics:** each `<RubricLine>` on one line; one line for each part, agreeing with that part's answer; the lines sum to the question's `points`. A point is for something a student's answer shows. Where there are two sound routes (the K_a expression or the Henderson–Hasselbalch equation; [H₃O⁺] through K_w or through the pOH), the line says both earn the point. A line that names a number accepts the neighbors that honest rounding gives (a pH within 0.02). A scoring note says what it applies to. No point can be earned by a blank answer. A point for a small-x calculation names the check: "without the percentage the point is not earned" where the part asks to justify the shortcut, and "expected but earns no separate point" elsewhere; the line says which.
- **Layout:** about 25 rendered characters to a display line at 320 px; anything longer is split with `aligned`, **with `&` on every row**, and never with a spacing argument such as `[0.6em]`. **Inline math cannot wrap: an equation in a rubric line, a list item or a table cell is written in words or as a display.** A table inside a part has at most three short columns; four in a stem. An ICE table or a table of moles has four columns (the label and three species) and belongs in an answer only where each cell is short; if a formula is too long for a cell, the sentence above defines HA and A⁻, or B and HB⁺.
- **Beyond the exam:** one part only, H1's part d, written `<Part label="d" beyond>` (design, section 5). Nothing else may need the label.
- **The number check** recomputes, from the question's own data, every number the answer and rubric show, to the figures given, asserts each against the MDX, checks that each question's rubric lines sum to its points and that every part has an answer and a rubric line, and ends `part <x>: N values checked, all match`. Every published value a question states is listed in the script with the pool's grade, for the fact-checker. `scratchpad/unit6-test/checks/part-a.py` shows how.

## The two pages

```yaml
---
title: "Comprehensive test, session 1: acids, bases and their reactions"
kind: test
order: 8
topics: ["8.1", "8.2", "8.3", "8.4", "8.5"]
summary: Twenty scored free-response questions on water and pH, strong and weak acids and bases, acid–base reactions and titrations, each with a worked answer and its scoring rubric.
points: (the sum)
minutes: 105
---
```

```yaml
---
title: "Comprehensive test, session 2: structure, buffers and solubility"
kind: test
order: 9
topics: ["8.6", "8.7", "8.8", "8.9", "8.10", "8.11"]
summary: Nineteen scored free-response questions on molecular structure, pH and pKa, indicators, buffers, buffer capacity, and pH and solubility, each with a worked answer and its scoring rubric.
points: (the sum)
minutes: 95
---
```

| Part | Topics | Questions | Numbers | Points (about) |
|---|---|---|---|---|
| A: Water, pH, and strong acids and bases | 8.1, 8.2 | 5 | 1 to 5 | 23 |
| B: Weak acids and weak bases | 8.3 | 5 | 6 to 10 | 26 |
| C: Acid–base reactions | 8.4 | 5 | 11 to 15 | 25 |
| D: Titrations | 8.5 | 5 | 16 to 20 | 28 |
| E: Molecular structure | 8.6 | 4 | 1 to 4 | 18 |
| F: pH, pK_a and indicators | 8.7 | 4 | 5 to 8 | 19 |
| G: Buffers and the Henderson–Hasselbalch equation | 8.8, 8.9 | 5 | 9 to 13 | 25 |
| H: Buffer capacity, and pH and solubility | 8.10, 8.11 | 6 | 14 to 19 | 29 |

Each page's `minutes` is fixed in `assemble.py` (105 and 95, about a minute
a point), which stops if either is more than 10 from the page's points, and
its opening paragraphs follow the Unit 6 pages', with one sentence on 25 °C
and one on H₃O⁺. `assemble.py` also refuses a draft with a rubric that does
not add up, a `<RubricLine>` over more than one line, an `aligned` row with
no `&`, a bare H⁺, or the wrong number of parts marked `beyond`.

**Shared things settled:** benzoic acid, triethylamine and imidazole belong
to Part C; acrylic acid, mandelic acid and the three amines to Part B;
crotonic acid, pivalic acid, diethanolamine and carbonate to Part D;
triethanolamine to Part G; lactic acid as a buffer pair, Tris and the
phosphate pair to Part H (lactic acid is also one of four candidates in
D1's table, with the lessons' pK_a). Part D's question 16 quotes two rows of
Part F's indicator table, with the same ranges. Iodic acid's K_a (the
lessons' 0.17) is a datum in E4 and H5. HF's pK_a (3.17) is a datum in E3
and H5. No value of one question is asked for in another question of the
same session: session 1 never prints mandelic acid's K_a or imidazole's
constant outside the questions that find them.

---

## Group A: design and plan (pull request A)

Branch `topic/unit-8-test-design`, from `main`.

- [ ] Copy `scratchpad/unit8-test/design.md` and `plan.md` to `docs/superpowers/specs/2026-11-27-chemstudy-unit-8-comprehensive-test-design.md` and `docs/superpowers/plans/2026-11-27-chemstudy-unit-8-comprehensive-test.md`. Run `node scripts/us-spelling.mjs` on both (the check does not read `docs/superpowers/`, so the rule there is kept by hand).
- [ ] Commit (`docs: design and plan for the Unit 8 comprehensive test`), push, open the pull request, merge when its check passes.

## Group B: session 1 (pull request B)

Branch `topic/unit-8-test-session-1`, from `main` after pull request A and the Unit 8 practice are merged.

### Task 1: Write both sessions

- [ ] Eight writers in parallel on Fable, one per part, each with `scratchpad/unit8-test/writer-brief.md` and its part's letter and question numbers. Both sessions are written at once; session 2's drafts wait in the scratch folder.

### Task 2: Check session 1, and open the pull request

- [ ] Run every number check (`python3 scratchpad/unit8-test/checks/part-<x>.py`). Compare the parts' substances and values across all eight drafts: one value per quantity; no substance in two parts beyond what "Shared things settled" allows; no value asked for in one question and printed in another of the same session.
- [ ] Assemble session 1 (`python3 scratchpad/unit8-test/assemble.py 1`: front matter, the introduction, Parts A to D), build, test, measure at 412, 390, 360 and 320 px with every answer open.
- [ ] One fact-check per part on Fable (`factcheck-brief.md`); the originality check for the session on Sonnet (`originality-brief.md`); the controller decides each finding and recomputes every proposed number; fixers on Sonnet (`fixer-brief.md`) apply the decided lists; revisers on Fable (`reviser-brief.md`) rewrite the parts the originality check names; a second check on Fable of parts A with B and C with D, told to treat every sentence as new; last fixes; assemble, build, test and measure again.
- [ ] Commit (`feat(practice): add the Unit 8 comprehensive test, session 1`), push, open the pull request with base `main`, merge when its check passes.

## Group C: session 2 (pull request C)

Branch `topic/unit-8-test-session-2`, from `main` after pull request B is merged.

### Task 3: Check session 2

- [ ] As Task 2, with Parts E to H (`assemble.py 2`; second checks of E with F and G with H). Confirm that exactly one part of the page carries `beyond`.

### Task 4: Close out

- [ ] "As built" in the design (counts and points as built; how many values each script checked; what the checks found; what the parts ask where it differs from the design's section 4; the table of every value no checker could confirm; devices used more than once; lessons for the Unit 9 test); "As carried out" notes here; the list for the teacher in the pull request's text.
- [ ] Commit (`feat(practice): add the Unit 8 comprehensive test, session 2`), push, open pull request C, merge when its check passes, confirm the deploy.

## What this plan delivers against the design

| Design | Task |
|---|---|
| 3, 4: two pages, eight parts, 39 tasks, the coverage by topic and by skill | 1, 2, 3 |
| 5: nothing outside the framework but one labeled part | "What changes for Unit 8"; the fact-checks; Task 3's count of `beyond` |
| 6: original questions, honest values | Facts 5 and 6; the pools; the originality checks; the generated readings |
| 7: how a session is made, and the roles | "Conventions, models, roles"; 1 to 3 |
| 8: pull requests | A, 2, 4 |
| 10: done when | 2, 3, 4 |

## As carried out (2026-11-27)

- Groups A to C were done as planned, with one change of order: both
  sessions were written, checked and corrected together, and the two
  pull requests for the sessions were opened one after the other.
- Writers, fact-checkers, second checkers and revisers ran on the
  strongest model; the originality checkers and the fixers on Sonnet. The
  controller ran every number check after every change, assembled, built,
  measured at four widths and ran the browser tests.
- The originality check was told to class a finding STRONG or MODERATE
  only where a student who did the existing passage would answer with no
  new thought. It returned three STRONG and six MODERATE findings; all
  were revised except where the reviser showed the part asks for new work.
- The findings, scripts and reports are in `scratchpad/unit8-test/`
  (`fc/`, `notes/`), which is not kept.
