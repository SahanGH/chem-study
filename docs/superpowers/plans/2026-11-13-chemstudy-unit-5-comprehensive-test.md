# ChemStudy Unit 5 Comprehensive Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a new, original Unit 5 comprehensive test on chem-study.com: two scored free-response pages (session 1: topics 5.1–5.3; session 2: topics 5.4–5.11), about 44 questions, each with a worked answer and a scoring rubric behind "Show answer".

**Architecture:** Each session is one MDX file in `src/content/practice/unit-5/`, built from the practice blocks that Plan 3 made (`Question`, `Part`, `Answer`, `Rubric`, `RubricLine`, `Beyond`). The only code change is a new practice kind, `test`. The questions are written fresh from the AP framework by one writer agent per part, every number is recomputed by a script, and every part is fact-checked and checked for originality before its pull request.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe, Python 3 (standard library only) for the number checks.

**Spec:** `docs/superpowers/specs/2026-11-13-chemstudy-unit-5-comprehensive-test-design.md`.

**This is Plan 4.** Plans 1 to 3 (Stage 1) are finished and live: the site, the eleven Unit 5 lessons, three diagrams and six practice documents.

## What the teacher decided (2026-11-13)

| Question | Decision |
|---|---|
| How much | The old Parts A–E only, about 44 questions. The old Part F (challenge set, all beyond the exam) is left out for now |
| How original | Written fresh from the framework. The old test sets only the weight per topic and the size of the points. No question follows a textbook exercise |
| Pages | Two, one per sitting |
| Answers | As in the free-response set: "Show answer" with the worked solution, and the rubric. Nothing typed or graded |
| Arrhenius calculations | At most two, labeled "Beyond the exam" (the rule from Plan 3) |

## Facts verified before writing (do not rediscover)

1. **The practice blocks need nothing new.** `Question` takes `number`, `title`, `topic` ("5.1, 5.2"), `points` and `beyond`; `Part` takes `label` (one lowercase letter) and `beyond`; `RubricLine` takes `part` and `points`. Read `src/components/practice/` for the details.
2. **The build check already enforces the scoring.** `scripts/check-dist.mjs` fails a page where a part or question has no answer, a rubric does not add up to its question's points, or the page's `points` is not the sum of its questions' points. It also fails on leftover LaTeX outside math (`\cmd`, a stray `$`, `---`, typed quotation marks, `~`).
3. **Nothing reads the `## Questions` heading.** A practice document may use any `##` headings, so the parts are `## Part A: …`.
4. **The browser tests make their tests from the files.** `tests/e2e/practice.spec.ts` reads `src/content/practice/unit-5/` and tests every document: math rendered, answers closed, no sideways scroll at 320 px with every answer open, accessibility with every answer open, found by search. A new file is tested without anyone adding a test.
5. **The kind is shown in one place**: the line above the title, `Unit 5 practice · {kindLabel(kind)}` in `src/layouts/PracticeLayout.astro`. The unit page lists titles and topics, not kinds.
6. **The frontmatter's limits** (`src/content.config.ts`): `title` 3–80 characters, `summary` 20–200, `minutes` at most 180, `order` unique within the unit (`orderedPractice` throws on a clash). Orders 1 to 6 are taken; the sessions are 7 and 8.
7. **The framework text** is in the session scratch folder at `<scratch>/ced/ced.txt` (made with `pdftotext -layout` from `D:\AP_Chem_Prep\Reference\ap-chemistry-course-and-exam-description.pdf`; recreate it that way if the scratch folder is gone). Unit 5 runs from about line 4,246 (TOPIC 5.1) to line 4,808 (UNIT 6). It is copyrighted: never copy it, or its wording, into the repository.
8. **The old test**, for the originality check only: `D:\AP_Chem_Prep\Units\unit05-kinetics\exam\u05-test-full.tex` (read-only archive). Parts A–E are lines 58 to 1,810. **Writers do not read it.**
9. **The Tro kinetics chapters**, for the originality check only: `C:\Users\sahan\Downloads\Chemistry_Resources\Tro_Reference\molecular-approach-6e\ch14-chemical-kinetics.md` and `...\structure-and-properties-3e\ch15-chemical-kinetics.md`. Their numbers are unreliable (flattened superscripts); for originality, the scenario and the reaction are what matter.
10. **Python 3.14** is installed (`python`). The number checks use the standard library only. Run them with `python -I`.
11. **The screenshot and width script** is Appendix A of Plan 3 (`docs/superpowers/plans/2026-11-13-chemstudy-unit-5-practice.md`). Save it as `<scratch>/practice-shots.cjs` if it is not already there.

## Conventions for every task

- Work in `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study`. Start every shell command with `cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"` (capital `C:`; Vitest fails from a lowercase drive).
- `<scratch>` is the session's scratch folder, outside the repository. Drafts, number checks, screenshots and pull-request bodies go there.
- `D:\AP_Chem_Prep` is a read-only archive. Never copy from it, from `Tro_Reference`, from `ChemistrySlides` or from the textbook PDFs into the repository, and never reuse their wording.
- Create and change files with the editor's Write and Edit tools. Shell heredocs, `sed` and `node -e "..."` eat backslashes on this machine.
- Conventional commits. **No AI-attribution trailer.** US spelling. Tests first. Never swallow an error.
- Browser tests run against the built site: `npm run test:e2e` builds first. Stop any preview server first: Astro refuses a second one.
- **One pull request per group. Never merge a pull request yourself: a merge deploys to chem-study.com. When the "Build and test" check passes, stop and ask the teacher.**

## Models

- **This session and the question writers:** the strongest model. Writing an original question with a correct worked answer is the hard part of this plan.
- **Fact-checkers:** Opus (`model: "opus"` on a general-purpose agent), a different model from the writer. The Worksheet 1 comparison in Plan 3 showed Opus misses nothing that matters.
- **The originality check, fixers and searches:** Sonnet.
- Never move both the writer and the checker to cheaper models.

## File structure

```
src/lib/practice-id.ts                                   gains the kind "test"
tests/unit/practice-id.test.ts                           its test
src/content/practice/unit-5/
  comprehensive-test-session-1.mdx                       Parts A and B (order 7)
  comprehensive-test-session-2.mdx                       Parts C, D and E (order 8)
<scratch>/plan4/
  drafts/part-a.mdx … part-e.mdx                         each writer's part
  checks/part-a.py … part-e.py                           each writer's number check
  reports/                                               fact-checks, originality, decisions
  pr-*-body.md                                           pull-request bodies
```

## The questions, part by part

The weights come from the design, section 4. Points per question: 3 to 10. Question numbers run through each session.

| Part | Numbers | Topic | Questions | What they practice |
|---|---|---|---|---|
| A | 1–10 | 5.1 | 3 | Rates of different species from the coefficients; average rate over an interval; reading a rate from a concentration–time graph described in a table |
| A | | 5.2 | 7 | Orders from initial rates (two reactants; three reactants; a factor other than 2, such as tripling); the rate law and overall order; $k$ with units; a predicted rate for new concentrations; the units of $k$ for zero, first and second order |
| B | 11–25 | 5.3 | 15 | The order from which plot is straight (at least one data set each of zero, first and second order); $k$ from a slope, with units; concentration after a time and the time to reach a concentration, for first order and at least once each for zero and second order; first-order half-life both ways; the fraction left after whole half-lives; the order from successive half-lives |
| C | 1–8 | 5.4 | 2 | Molecularity; the rate law of an elementary step; why three-body steps are rare |
| C | | 5.7 | 2 | Steps that add up to the overall equation; finding intermediates and catalysts in a mechanism |
| C | | 5.8 | 2 | The rate law from a slow first step; whether a mechanism fits a measured rate law |
| C | | 5.9 | 2 | A fast equilibrium before a slow step; writing the rate law without the intermediate |
| D | 9–15 | 5.5 | 2 | The two conditions for a reacting collision; the distribution of molecular energies and how temperature changes it |
| D | | 5.6 | 3 | Reading $E_a$ forward and reverse and $\Delta H$ from a profile; temperature and rate in words; at most two Arrhenius calculations, labeled `beyond` |
| D | | 5.10 | 2 | A multistep profile: intermediates in the valleys, the rate-limiting step, the overall $\Delta H$ |
| E | 16–19 | 5.11 | 4 | A catalyst against an intermediate in a mechanism; a profile with and without a catalyst; the kinds of catalysis the framework names; what a catalyst changes ($k$, the path, the rate) and what it does not ($\Delta H$, the equilibrium position) |

A question may name more than one topic. Profiles are described in words or in a table of energies (for example "reactants 0 kJ/mol, transition state 85 kJ/mol, products −40 kJ/mol"): practice pages have no figures.

---

## The writer's guide (Tasks 2 and 5)

Give this whole section to every writer, with the brief for its part from Task 2 or Task 5.

### What a writer reads

- The framework text for its topics: `<scratch>/ced/ced.txt`, Unit 5 (lines about 4,246 to 4,808). The learning objectives and essential knowledge statements say what may be asked. Use them for **what** to ask, never for wording.
- The site's lessons for its topics, `src/content/lessons/unit-5/`: the terms, symbols and limits on a rule that students have been taught. An answer must not claim more than a lesson does. In particular, lessons 5.8 and 5.10 say when "the slow step has the highest barrier" holds.
- The six practice documents in `src/content/practice/unit-5/`: what students have already practiced (do not repeat a reaction **with** its data, or a scenario), and `free-response-set.mdx` as the model of the format.

### What a writer does not read

- The old comprehensive test, or anything else in `D:\AP_Chem_Prep`.
- Any textbook, `Tro_Reference`, or slides. The questions must not grow from a textbook exercise.

### What a writer writes

1. **The part**, as MDX, to `<scratch>/plan4/drafts/part-<x>.mdx`: a `## Part X: Title` heading, one or two sentences on what the part covers, then the questions. Nothing else: no frontmatter, no build, no tests, no git.
2. **The number check**, to `<scratch>/plan4/checks/part-<x>.py`, described below.
3. **A handoff report**: the files written; each question's number, title, topics and points; the part's total points; every place where the guide did not decide something and what was done.

### Each question

```mdx
<Question number={11} title="Order from a straight-line plot" topic="5.3" points={6}>

The question text, any table, then the parts.

<Part label="a">

What to do in this part.

<Answer>

The worked solution: every step a student needs, with the final answer in bold.

</Answer>

</Part>

<Rubric>
<RubricLine part="a" points={3}>1 point for …; 2 points for ….</RubricLine>
</Rubric>

</Question>
```

- Every question has `title`, `topic` and `points`, 3 to 10, and a rubric whose lines add up to its points exactly. One `RubricLine` per part, **each written on one line**. A line may describe several awards ("1 point for the rate law; 1 point for the overall order").
- A rubric line says what earns each point, as a reader of a student's answer would apply it: the setup point for the relationship shown, the answer point for the value with its units and significant figures. Where a common wrong answer earns nothing or partial credit, say so ("A bare number earns 1 point"; "'It lowers the energy of the reactants' earns 0 points").
- Every question in this test has lettered parts, even when there is only (a), so that every rubric line names its part.
- The worked answer is complete: a student who got it wrong can find where. Show the substitution, then the result. For an order from data, name the two experiments compared and what was held constant.
- Use real reactions only where every number given is plausible for that reaction; otherwise use $\ce{A -> B}$, $\ce{2X + Y -> Z}$ and the like, or say "The data below are for a reaction $\ce{A -> products}$." Never present an invented rate constant as a measured fact about a named substance.
- Vary the contexts across the part: gas-phase reactions, solutions, decomposition, a dye fading, a drug cleared from the blood (first order), a surface reaction (zero order). Do not use the same reaction twice in a session.
- Make the data honest: a data set meant to be first order must be straight only for $\ln[\ce{A}]$ against $t$ (the number check proves it). Round given data the way a measurement would be (three significant figures), and work the answer from the rounded data.
- Answers carry the right significant figures and units.

### Notation

| Write | Like this |
|---|---|
| a number with a plain unit in a sentence | `0.030 M/s`, `25.0 mL`, `8.0 days`, `10 °C` |
| a power of ten | math: `$2.0 \times 10^{-3}\ \text{M/s}$` |
| a unit with a power | math, with thin spaces: `$0.0250\ \text{s}^{-1}$`, `$\text{M}^{-1}\,\text{s}^{-1}$`, `$\text{M}^{-2}\,\text{s}^{-1}$` |
| units that divide once | `M/s`, `kJ/mol`, `J/mol` |
| a number and unit inside math | `= \mathbf{0.112}\ \text{M}` |
| a negative number in a sentence | math: `$-40\ \text{kJ/mol}$` |
| a formula | `$\ce{N2O5}$`; a concentration `$[\ce{N2O5}]$`; initial `$[\ce{A}]_0$` |
| a final answer | `\mathbf{...}` in math, `**...**` in text |
| a data table | Markdown. Column heads: "Experiment", `$[\ce{A}]_0$ (M)`, "Initial rate (M/s)", "Time (s)", `$[\ce{A}]$ (M)` |
| a mechanism | a two-column table: `\| Step 1 (slow) \| $\ce{NO2 + NO2 -> NO3 + NO}$ \|` |
| an energy profile | a sentence or a two-column table of species and energies |

### What fits a phone

1. **These always go on their own line as display math** (`$$` on its own line, the math, `$$` on its own line, a blank line before and after), also inside an `<Answer>`: a calculation (anything with an equals sign and numbers); a chain such as `0.80 \to 0.40 \to 0.20`; a reaction equation with state symbols or longer than about fifteen characters; a rate law longer than `\text{rate} = k[\ce{A}]^2[\ce{B}]`. Math inside a sentence cannot wrap or scroll.
2. **Split display math longer than about thirty characters** with `aligned`, breaking at an equals sign:

```mdx
$$
\begin{aligned}
k &= \frac{2.5 \times 10^{-5}}{(0.020)^2(0.010)} \\
&= \mathbf{6.3}\ \text{M}^{-2}\,\text{s}^{-1}
\end{aligned}
$$
```

3. **A table has at most four columns.** Five columns do not fit 320 px.
4. **Never begin a paragraph with a number and a period**: Markdown makes it a list.
5. **A blank line after every opening tag and before every closing tag**, except `<RubricLine>` (one line).
6. **No `{`, `}` or `<` outside math.** MDX reads them as code.

### Wording

1. US spelling. "Points", not "marks".
2. Speak to the student. Short sentences. No em dashes. No decoration.
3. Nothing that points at a class, a book or paper: no "the notes", "the textbook", "the attached sheet".
4. "Rate-limiting step", as the lessons say.
5. Say what a part wants with a verb the AP exam uses: calculate, determine, explain, identify, justify, state, write.

### Beyond the exam

- `beyond` on a `<Question>` labels the whole question; on a `<Part>`, that part.
- Label an Arrhenius calculation (finding $E_a$, $A$ or $k$ from $k = Ae^{-E_a/RT}$ or its two-temperature form). Part D only, at most two in the whole test.
- Label a part that can only be done with the zero-order or second-order half-life formula. A part that can be done with the integrated rate laws is not labeled; the worked answer uses the integrated law.
- Nothing else goes beyond the framework. If a question seems to need something the framework does not list, change the question.

### The number check

`<scratch>/plan4/checks/part-<x>.py`, standard library only (`math`, `fractions`, `statistics`). For each question it:

1. Holds the question's given data, copied from the MDX.
2. Recomputes every number that appears in the worked answer and the rubric, and prints it next to the value the MDX shows, rounded as shown.
3. Fails (`assert`) when the two differ after rounding to the significant figures the MDX gives.
4. For every data set from which a student is to find an order: fits $[\ce{A}]$, $\ln[\ce{A}]$ and $1/[\ce{A}]$ against $t$ by least squares, prints the three $R^2$ values, and asserts that the intended one is the largest and above 0.999 and that the others are below 0.99.
5. For every initial-rates table: computes the factor between each pair of experiments used in the answer and asserts that the order it gives is the whole number claimed (within 2%).
6. Ends by printing `part <x>: N values checked, all match`.

The least-squares fit, to copy into each script:

```python
def r_squared(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    syy = sum((y - my) ** 2 for y in ys)
    slope = sxy / sxx
    return slope, (sxy * sxy) / (sxx * syy)


def order_fits(times, concs):
    import math
    return {
        "zero": r_squared(times, concs),
        "first": r_squared(times, [math.log(c) for c in concs]),
        "second": r_squared(times, [1 / c for c in concs]),
    }
```

---

## How every session is checked (Tasks 3 and 6)

- [ ] **Run every number check.**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
for f in "<scratch>/plan4/checks/part-"[ab].py; do python -I "$f" || echo "FAILED: $f"; done
```

Expected: each ends `part <x>: N values checked, all match`, and no `FAILED`. A failure goes back to the part's writer (SendMessage to the same agent) with the output.

- [ ] **Assemble the session file** from its frontmatter and introduction (given in the task) and the drafts, in order. Then build and test:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npm run build
npm test
npm run test:e2e
```

Expected: `check-dist: N pages, 0 problem(s)`; every unit and browser test passes. The usual first failures are a page that scrolls sideways at 320 px (put the equation it names on its own line, or split it) and `LaTeX left in the page text`.

- [ ] **Count the topics.** Every topic of the session has at least the number of questions the table above gives:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
grep -oE 'topic="[^"]*"' src/content/practice/unit-5/comprehensive-test-session-<n>.mdx | sed 's/topic=//; s/"//g' | tr ',' '\n' | tr -d ' ' | sort -V | uniq -c
```

- [ ] **Look at the page.** Start a preview (`npx astro preview --port 4400`, in the background), then:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
NODE_PATH="$PWD/node_modules" node "<scratch>/practice-shots.cjs" http://localhost:4400 "<scratch>/plan4/shots" unit-5-kinetics/practice/comprehensive-test-session-<n>/
```

Read both screenshots top to bottom: every equation rendered, every table whole, nothing run together, the answers legible in the dark theme. `page overflow 0` at 412, 390, 360 and 320 px is required. Stop the preview afterwards (`netstat -ano | grep ":4400 "`, then `taskkill //PID <pid> //F`).

- [ ] **Fact-check each part, independently.** One checker per part, in parallel, read-only, on Opus. Each gets: its part's text (point it at the session file and the question numbers); the number check and its output; the framework text; the lessons for its topics. Its brief:

  1. Solve every question from the question alone, before reading the answer. Then compare. Recompute every number to the significant figures given.
  2. Check every unit by dimensional analysis.
  3. Check every statement against the framework and the site's lessons: the same terms, the same limits on a rule.
  4. Check that each question can be answered as posed: the data are enough, there is one answer, and the wording cannot reasonably be read another way.
  5. Check each rubric: its lines add up, each point is for something a student's answer shows, and it is fair to a correct answer reached another way.
  6. Check each "Beyond the exam" label, and name anything else the framework does not ask for. Check that a named real reaction's data are plausible, or the question says they are for illustration.
  7. Report findings, each with the text quoted, what is wrong, the correction and the evidence. Say plainly when there are none.

- [ ] **Check originality, once per session.** One agent, read-only, on Sonnet. It gets the session file and these sources: the old test's Parts A–E (`D:\AP_Chem_Prep\Units\unit05-kinetics\exam\u05-test-full.tex`, lines 58–1,810), the two Tro kinetics chapters (paths in the facts above), and the six other files in `src/content/practice/unit-5/`. Its brief: for each new question, name any source question that shares (1) its reaction **and** its data (the same concentrations, rates, times or energies, or the same numbers scaled), or (2) its exact scenario or the order of its parts so closely that it reads as a rewording; quote both. A shared reaction alone is not a finding. Say plainly when a question has no match.

- [ ] **Decide each finding.** Input, not orders: accept it, or reject it and write down why, in `<scratch>/plan4/reports/decisions-session-<n>.md`. An originality finding that is accepted means the question is rewritten by its writer, then fact-checked again.

- [ ] **Apply the accepted findings.** One fixer (Sonnet) per part, given the decided list of edits and nothing to decide. A change to a number goes into the number check too, and the check is run again. Then build and test again.

- [ ] **Open the pull request and stop.** The body gives: each part's questions with titles, topics and points; the topic count; the number checks' last lines; every fact-check and originality finding and what was done with it; the "Beyond the exam" list; the decisions made for the teacher, to accept or reverse; the build and test output. Then wait for the teacher.

---

## Group A: the kind and session 1 (pull request 1)

Branch `topic/comprehensive-test-session-1`, from `main` after this plan is merged.

### Task 1: The practice kind "test"

**Files:**
- Modify: `src/lib/practice-id.ts:8-15`
- Test: `tests/unit/practice-id.test.ts`

- [ ] **Step 1: Write the failing test**

In `tests/unit/practice-id.test.ts`, add inside `describe('kindLabel', …)`, after the existing test:

```ts
  it('names a comprehensive test', () => {
    expect(kindLabel('test')).toBe('Comprehensive test');
  });
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/practice-id.test.ts
```

Expected: FAIL in `names a comprehensive test`: `expected undefined to be 'Comprehensive test'`. (Vitest does not type-check, so the unknown kind reaches the lookup and returns `undefined`.)

- [ ] **Step 3: Add the kind**

In `src/lib/practice-id.ts`:

```ts
export const PRACTICE_KINDS = ['worksheet', 'ladders', 'free-response', 'test'] as const;
export type PracticeKind = (typeof PRACTICE_KINDS)[number];

const KIND_LABEL: Record<PracticeKind, string> = {
  worksheet: 'Worksheet',
  ladders: 'Skill ladders',
  'free-response': 'Free response',
  test: 'Comprehensive test',
};
```

The content schema reads `PRACTICE_KINDS`, so `kind: test` becomes valid in a practice file's frontmatter with no other change.

- [ ] **Step 4: Run all the unit tests**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npm test
```

Expected: all pass, one more than before (328 became 329 at the time of writing).

- [ ] **Step 5: Commit**

```bash
git add src/lib/practice-id.ts tests/unit/practice-id.test.ts
git commit -m "feat(practice): add the comprehensive test kind"
```

### Task 2: Write session 1

**Files:**
- Create: `<scratch>/plan4/drafts/part-a.mdx`, `part-b.mdx` and `<scratch>/plan4/checks/part-a.py`, `part-b.py` (by the writers)
- Create: `src/content/practice/unit-5/comprehensive-test-session-1.mdx` (by the controller)

- [ ] **Step 1: Dispatch two writers in parallel**, each with the whole writer's guide and its brief:

**Part A brief.** `## Part A: Rates and rate laws from data`. Questions 1 to 10, about 50 points. Topics: three questions on 5.1 and seven on 5.2, as the table above lists. At least one initial-rates table with three reactants, one where a concentration is tripled or halved rather than doubled, one where the rate does not change when a concentration changes (zero order), and one question that asks for the units of $k$ for several orders. At least one question asks for a rate predicted for new concentrations.

**Part B brief.** `## Part B: Concentration over time and half-life`. Questions 11 to 25, about 80 points. Topic 5.3, as the table above lists. Order-from-a-plot data sets: at least one each of zero, first and second order, and at least one where the obvious guess from the first two points is wrong (the number check proves which plot is straight). First-order calculations in both directions (concentration after a time; time to reach a concentration), half-life to $k$ and $k$ to half-life, and the fraction left after whole half-lives. At least one second-order and one zero-order integrated-law calculation. One question finds the order from successive half-lives (constant for first order, doubling for second order); if it needs the zero- or second-order half-life formula, label that part `beyond`.

- [ ] **Step 2: Run both number checks** (see "How every session is checked"). Send any failure back to its writer.

- [ ] **Step 3: Assemble the session file.** Write `src/content/practice/unit-5/comprehensive-test-session-1.mdx`: the frontmatter and introduction below, then Part A's draft, then Part B's draft. Fill in `points` and the two numbers in the introduction from the drafts.

```mdx
---
title: "Comprehensive test, session 1: rates and rate laws"
kind: test
order: 7
topics: ["5.1", "5.2", "5.3"]
summary: Twenty-five scored free-response questions on reaction rates, rate laws and concentration over time, each with a worked answer and its scoring rubric.
points: <the sum of the questions' points>
minutes: 140
---

This is the first of two sittings that together test all of Unit 5. It covers topics 5.1 to 5.3: reaction rates, rate laws, and how concentration changes over time. Session 2 covers mechanisms, energy profiles and catalysis.

There are 25 questions worth <points> points. Give yourself about 140 minutes; a break between Part A and Part B is fine. You may use a calculator. Show every step: the rubrics give points for the setup as well as the answer. Write each answer out in full before you open the worked answer and its rubric.
```

- [ ] **Step 4: Commit the draft session**

```bash
git add src/content/practice/unit-5/comprehensive-test-session-1.mdx
git commit -m "feat(practice): add the comprehensive test, session 1"
```

### Task 3: Check session 1, and open the pull request

- [ ] Carry out "How every session is checked" for session 1 (parts A and B).
- [ ] Commit the accepted corrections: `fix(practice): apply the fact-checks to session 1`.
- [ ] Push and open the pull request:

```bash
git push -u origin topic/comprehensive-test-session-1
gh pr create --title "feat(practice): comprehensive test, session 1" --body-file "<scratch>/plan4/pr-a-body.md"
```

Stop. When the check passes, ask the teacher to merge.

---

## Group B: session 2 (pull request 2)

Branch `topic/comprehensive-test-session-2`, from `main` after pull request 1 is merged. The writers may write their drafts in the scratch folder while pull request 1 waits.

### Task 4: Write session 2

**Files:**
- Create: `<scratch>/plan4/drafts/part-c.mdx`, `part-d.mdx`, `part-e.mdx` and their checks (by the writers)
- Create: `src/content/practice/unit-5/comprehensive-test-session-2.mdx` (by the controller)

- [ ] **Step 1: Dispatch three writers in parallel**, each with the whole writer's guide, its brief, and session 1's file so that no reaction repeats:

**Part C brief.** `## Part C: Mechanisms`. Questions 1 to 8, about 40 points. Two questions each on 5.4, 5.7, 5.8 and 5.9. Mechanisms as two-column tables. At least one mechanism whose slow step is not the first, solved with a fast pre-equilibrium (5.9), and at least one mechanism that does **not** fit the measured rate law, where the student says why. Use lesson 5.9's way of eliminating the intermediate.

**Part D brief.** `## Part D: Collisions and energy profiles`. Questions 9 to 15, about 35 points. Two on 5.5, three on 5.6, two on 5.10. Profiles given as tables of energies or in words. At most two Arrhenius calculations, each labeled `beyond`; every other temperature question is answered in words. One question reads both the forward and the reverse activation energy from the same profile.

**Part E brief.** `## Part E: Catalysis`. Questions 16 to 19, about 20 points. Four on 5.11 (with 5.7 or 5.10 alongside where it fits). One mechanism in which the student tells a catalyst from an intermediate; one profile with and without a catalyst; the kinds of catalysis the framework names (read topic 5.11 in the framework for which); what a catalyst does and does not change.

- [ ] **Step 2: Run the three number checks.** Part C may have few numbers; its script still checks every one there is, and every rate law it derives by substituting numbers into both the mechanism and the derived law.

- [ ] **Step 3: Assemble the session file.**

```mdx
---
title: "Comprehensive test, session 2: mechanisms, energy and catalysis"
kind: test
order: 8
topics: ["5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10", "5.11"]
summary: Nineteen scored free-response questions on mechanisms, collisions, energy profiles and catalysis, each with a worked answer and its scoring rubric.
points: <the sum of the questions' points>
minutes: 100
---

This is the second of two sittings that together test all of Unit 5. It covers topics 5.4 to 5.11: elementary steps and mechanisms, the collision model, energy profiles and catalysis. Session 1 covers rates and rate laws.

There are 19 questions worth <points> points. Give yourself about 100 minutes. You may use a calculator. Show every step, and write each answer out in full before you open the worked answer and its rubric.

One limit applies. Topic 5.6 leaves calculations with the Arrhenius equation off the exam. The questions that ask for one are labeled "Beyond the exam"; reading an energy profile and reasoning in words about temperature and catalysts are on the exam, and most of Part D asks for exactly that.
```

If the final test has no Arrhenius calculation, drop the last paragraph's second sentence and say instead that none is asked for.

- [ ] **Step 4: Commit:** `feat(practice): add the comprehensive test, session 2`.

### Task 5: Check session 2, and open the pull request

- [ ] Carry out "How every session is checked" for session 2 (parts C, D and E), with the number-check loop over `part-[cde].py`.
- [ ] Commit the accepted corrections: `fix(practice): apply the fact-checks to session 2`.
- [ ] Do Task 6 on this branch, then push and open the pull request with `--body-file "<scratch>/plan4/pr-b-body.md"`. Stop.

### Task 6: Close out

**Files:**
- Modify: `docs/superpowers/specs/2026-11-13-chemstudy-unit-5-comprehensive-test-design.md`
- Modify: this plan
- Modify (local, not committed): `CLAUDE.md`

- [ ] **Step 1:** Add a dated "As built" note at the end of the design: the final question count and points of each session, the "Beyond the exam" list, and anything decided differently from the design.
- [ ] **Step 2:** Add "As carried out" notes in this plan, under the tasks they concern.
- [ ] **Step 3:** Commit: `docs: record how the comprehensive test was built`.
- [ ] **Step 4:** After the teacher merges: watch the deploy (`gh run list --limit 1`, then `gh run watch <id>`; if it fails at "Confirm the target is the ChemStudy site root", read the log: an SSH timeout needs only `gh run rerun <id> --failed`), return to `main` with `git pull --ff-only`, delete the branch, and update the local `CLAUDE.md`: Plan 4 finished, what is next.

---

## What this plan delivers against the spec

| Spec | Delivered by |
|---|---|
| §3: two pages, orders 7 and 8, scored, worked answers and rubrics | Tasks 2 and 4 |
| §4: weight per topic | The part briefs; the topic count in each check |
| §5: Beyond the exam | The writer's guide; the fact-check's item 6 |
| §6: originality | Writers do not read the sources; the originality check |
| §7: the pipeline | "How every session is checked" |
| §8: the kind `test` | Task 1 |
| §10: done when | The pull requests' bodies |
