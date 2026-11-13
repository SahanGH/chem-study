# ChemStudy Unit 5 Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the teacher's Unit 5 practice on chem-study.com: four worksheets, the twelve skill ladders and the free-response set, each question with a "Show answer" that reveals the worked solution, and the scoring rubric on every scored question.

**Architecture:** A practice document is an MDX file in `src/content/practice/unit-5/`, built from four small blocks (`Question`, `Part`, `Answer`, `Rubric`) and served at `/unit-5-kinetics/practice/<name>/`. The six documents are converted once from the LaTeX in `D:\AP_Chem_Prep` by hand, following the written guide in this plan, and each is then compared with its source by a script that reads every number, formula and part on both sides. After that the MDX is the master copy.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem, Vitest, Playwright + axe, `node-html-parser` (already used by the build check).

**Spec:** `docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md` (sections 5, 7, 8 and 11).

**This is Plan 3 of 3 for Stage 1.** Plans 1 and 2 are finished and live: the site, all eleven Unit 5 lessons and three diagrams. When this plan is done, Stage 1 of the design is done.

**Start after pull request #10 (`topic/small-fixes`) is merged.** This plan's tests build on the 320 px test that pull request adds.

## What the teacher decided (2026-11-13)

| Question | Decision |
|---|---|
| Which documents | Worksheets 1 to 4, the self-study ladders, the free-response set |
| The unit exam (`exam/u05-exam.tex`) | Not published. It stays a closed test |
| The comprehensive test (`exam/u05-test-full.tex`) | Not converted. Its 57 questions are reworded from a textbook; new, original questions will be written later, as separate work |
| Arrhenius calculations | Kept, labeled "Beyond the exam" |
| Answers | A "Show answer" on every question, with the worked solution. Scored questions also show the rubric. Nothing is typed or graded |
| Left out as class-specific | The unit map, guided notes and review sheet. The Chapter 12 track |

## Three places this plan departs from the design, and why

1. **There is no converter program.** The design (section 7) gave the old converter, `tools/tex2html.py`, an export mode. That repository is now a frozen archive, so the mode cannot be added there, and a new converter for six files would be about as much code as the practice pages themselves, with output that must be reworded by hand anyway (class references, textbook mentions, British spelling, long equations that do not fit a phone). So each document is converted by hand, following the guide below, and **a script checks the result against the LaTeX source**: every number with its sign and power of ten, every chemical formula, the count of parts and rubric lines in each question, and how much of the wording survived. The trial run on Worksheet 1 ended with no differences. The script is kept in the repository because the other eight units' practice uses the same LaTeX and will need it.
2. **The source of truth for the check is the LaTeX file, not the PDF.** The design compares each document with its PDF. The inventory found that the PDF is not safe everywhere: siunitx changes some numbers on the way to the page (drops a plus sign, groups digits). The script reads the `.tex`; the fact-checker still reads the key PDF as a second witness.
3. **A printed practice page shows the answers that are open and leaves out the closed ones.** A lesson prints every answer. A worksheet is more useful the other way round: print it untouched for a blank worksheet, or open the answers first for a key. The page says so in one line.

## Facts verified before writing (do not rediscover)

Established on 2026-11-13 in a throwaway copy of the repository at commit `630c3a5` (the tip of `topic/small-fixes`). Everything in Tasks 1 to 4 was built there: **311 unit tests and 338 browser tests passed**, the build ended `check-dist: 16 pages, 0 problem(s)`, and the audit of Worksheet 1 printed `0 difference(s)`.

1. **Blocks nest in MDX** as `<Question>` > `<Part>` > `<Answer>`, with Markdown, tables and display math inside, provided there is a blank line after every opening tag and before every closing tag.
2. **A block written on one line keeps its text inline.** `<RubricLine part="a" points={2}>text with $math$</RubricLine>` renders as one `<li>` with no paragraph inside. Written over several lines it would gain a `<p>`.
3. **`Astro.url.pathname` inside a block is the address of the page being built.** `PracticeNext` uses it to learn which lesson it is in, so the eleven lesson files stay as they are (`<PracticeNext />`).
4. **`src/pages/[unit]/practice/[name].astro` and `src/pages/[unit]/[topic].astro` do not collide.**
5. **A native `<details>` needs no script**: it opens with JavaScript off and from the keyboard.
6. **What fits a phone, measured.** On a 320 px screen the text column of a question card is about 246 px, and inside a part about 216 px. On Worksheet 1 a one-line calculation written inside a sentence was 280 px wide and pushed the page sideways at 360 px; a reaction equation with state symbols was 292 px wide and did the same at 320 px. Both went onto their own lines. A three-step mechanism written as one aligned equation scrolled by 77 px even at 412 px; as a table it does not.
7. **The 2024 framework and the half-life.** Topic 5.3 gives the half-life equation for first order only ($t_{1/2} = 0.693/k$, 5.3.A.5). The zero-order and second-order half-life formulas on Worksheet 2 are not in the framework and not on the equation sheet. The Arrhenius exclusion is in topic 5.6. The framework uses both "rate-limiting step" and "rate-determining step"; the lessons use the first.
8. **The framework** is `D:\AP_Chem_Prep\Reference\ap-chemistry-course-and-exam-description.pdf`. Read it with `pdftotext -layout <pdf> <scratch>/ced/ced.txt` (it prints one harmless "Unknown filter 'Crypt'" warning). Unit 5 starts near line 4,100 of that text. It is copyrighted: never copy it, or its wording, into the repository.
9. **The sources** (read-only): `D:\AP_Chem_Prep\Units\unit05-kinetics\worksheets\u05-ws1.tex` to `u05-ws4.tex`, `...\unit05-kinetics\u05-selfstudy.tex`, `...\unit05-kinetics\u05-frq.tex`. **The key PDFs:** `D:\AP_Chem_Prep\build\Units\unit05-kinetics\worksheets\u05-ws1-key-print.pdf` to `u05-ws4-key-print.pdf`, and `...\unit05-kinetics\u05-selfstudy-key-print.pdf`, `...\u05-frq-key-print.pdf`. Turn pages into pictures with `pdftoppm -png -r 100 <pdf> <scratch>/pdf/<name>`.
10. **Git Bash rewrites an argument that starts with `/`** into a Windows path, so the screenshot script below takes page paths without the leading slash.
11. **The audit cannot run in the pull-request check.** It needs the LaTeX files, which are not in this repository. Its own unit tests run there; the audit of each document is run by hand and its output goes in the pull request.

## Conventions for every task

- Work in `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study`. Start every shell command with `cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"` (capital `C:`; Vitest fails from a lowercase drive).
- `<scratch>` in a command is the session's scratch folder, outside the repository. Screenshots, PDF pages, the framework text, the audit's `expected` files and pull-request bodies go there, never into the repository.
- `D:\AP_Chem_Prep` is a read-only archive. Read its files; never write, commit or push there. Never copy from `Tro_Reference`, `ChemistrySlides` or the textbook PDFs.
- Create and change files with the editor's Write and Edit tools. Shell heredocs, `sed` and `node -e "..."` eat backslashes on this machine, which silently ruins TeX and regular expressions. (It happened twice while this plan was being written.)
- Conventional commits. **No AI-attribution trailer.**
- US spelling.
- Tests first: write the test, run it, watch it fail, then implement.
- Never swallow an error.
- Browser tests run against the built site: `npm run test:e2e` builds first. Stop any preview server of your own before running it: Astro refuses to start a second one.
- **One pull request per group of tasks. Never merge a pull request yourself: a merge deploys to chem-study.com. When the "Build and test" check passes, stop and ask the teacher to merge or to say "merge".**

## Models

The teacher asked on 2026-11-13 whether the project can use more than one model. This is the arrangement proposed then; use it unless the teacher has said otherwise.

- **This session and the conversion writers:** the strongest model. A writer that drops a zero or an explanation costs more than it saves.
- **Fact-checkers:** a different model from the writer (Opus), so the check is not the writer agreeing with itself. **Task 5 runs the fact-check of Worksheet 1 on both models once** and compares what each found; if Opus misses something that matters, fact-checks stay on the strongest model.
- **Fixers** (they apply a decided list of edits) **and searches:** Sonnet.
- The named reviewers run on the model their own definitions give them.
- Never move both the writer and the checker to cheaper models. The fact-check is the safety net.

## File structure

```
scripts/
  check-dist.mjs                     gains the rules for practice pages
  practice-audit.mjs                 compares a converted document with its LaTeX source
src/
  content.config.ts                  gains the "practice" collection
  content/practice/unit-5/           six .mdx files, one per document
  lib/practice-id.ts                 naming rules: ids, topic lists, labels (no Astro, unit-tested)
  lib/practice.ts                    reading the collection: order, addresses, practice for a topic
  components/practice/
    Question.astro                   a numbered question: heading, topics, points
    Part.astro                       one lettered part of a question
    Answer.astro                     "Show answer": a closed <details>
    Rubric.astro  RubricLine.astro   "Show scoring rubric", one line per award of points
    Blank.astro                      the gap in a fill-in sentence
    Beyond.astro                     the "Beyond the exam" label
  components/lesson/PracticeNext.astro   now lists the practice for the lesson's topic
  layouts/PracticeLayout.astro       the page around a practice document
  pages/[unit]/practice/[name].astro the route
  pages/[unit]/index.astro           gains the unit's list of practice
  styles/practice.css                styles for all of the above
  styles/print.css                   gains the rule for printed answers
tests/unit/practice-id.test.ts  check-dist-practice.test.ts  practice-audit.test.ts
tests/e2e/practice.spec.ts           checks that hold for every practice document
```

`Worked` and `Figure` are the lesson's own blocks, reused as they are.

## The six documents

| Order | File in `src/content/practice/unit-5/` | Title | Kind | Topics | Source |
|---|---|---|---|---|---|
| 1 | `skill-ladders.mdx` | Skill ladders | `ladders` | 5.1 to 5.11 | `u05-selfstudy.tex` |
| 2 | `worksheet-1-rates-and-rate-laws.mdx` | Worksheet 1: Rates and rate laws | `worksheet` | 5.1, 5.2 | `worksheets/u05-ws1.tex` |
| 3 | `worksheet-2-concentration-over-time.mdx` | Worksheet 2: Concentration over time | `worksheet` | 5.3 | `worksheets/u05-ws2.tex` |
| 4 | `worksheet-3-mechanisms-and-energy-profiles.mdx` | Worksheet 3: Mechanisms and energy profiles | `worksheet` | 5.4 to 5.8 | `worksheets/u05-ws3.tex` |
| 5 | `worksheet-4-pre-equilibrium-and-catalysis.mdx` | Worksheet 4: Pre-equilibrium and catalysis | `worksheet` | 5.9 to 5.11 | `worksheets/u05-ws4.tex` |
| 6 | `free-response-set.mdx` | Free-response set | `free-response` | 5.1 to 5.11 | `u05-frq.tex` |

The ladders come first because that is how they are meant to be used: a worked example and four questions for each skill, then the worksheets, then the free-response set. A lesson's "Practice next" lists every document whose topics include the lesson's topic, in this order.

---

## The conversion guide (Tasks 4, 6 and 7)

Give this whole section to every conversion writer, with the source file, and with Worksheet 1's source and its finished MDX (Task 4, Step 10) as the worked example of every rule.

### What a writer does and does not do

- Reads one `.tex` file (read-only) and writes one `.mdx` file. Nothing else: no build, no tests, no git. The controller builds once for the whole group.
- **Copies the chemistry. Never corrects it.** Every number goes across with its sign, its trailing zeros and its power of ten. Every formula inside `\ce{...}` goes across character for character (spaces do not matter): no state symbols added or removed. If something in the source looks wrong, leave it as it is and say so in the handoff report. The fact-check decides.
- **Keeps every answer whole.** No summarizing, and nothing added: no extra numbers, no extra formulas, no extra steps. The audit reports both.
- Ends with a handoff report: the file written; anything in the source that looks wrong, quoted; anything this guide did not cover and what was done about it.

### Structure

| In the LaTeX | In the MDX |
|---|---|
| `\apcdoctitle`, `\apcsubtitle` | The frontmatter given in the task. The subtitle's idea becomes a sentence of the introduction |
| `\wsheader[...]` (the strip of formulas) | The introduction: "You will need these relationships." and each formula as display math. Keep every formula |
| `\problem[]{\ced{5.1} text}` and the table and `parts` that follow it | `<Question number={n} topic="5.1">`, numbered 1, 2, 3 in order. The text, the table, then the parts |
| `\ced{5.7}--\ced{5.8}` (a range) or several `\ced` | Every code, written out: `topic="5.7, 5.8"` |
| each `\item` of a `parts` list | `<Part label="a">`, lettered a, b, c in order |
| `\answerblank[w]{answer}` | The answer goes in the part's `<Answer>`. Where the prompt is a label with the gap at its end ("The order in B: ___"), end it with `<Blank />`. Where it is a question ("Find the half-life."), no blank. Two blanks in one part: both answers in one `<Answer>`, in order, each saying what it answers ("The plot: … The slope: …") |
| `\answerlines[n]{answer}` | `<Answer>` holding the whole text |
| `\workspace[h]` followed by `\keyonly{\begin{apcanswer}...}` | `<Answer>` holding the worked solution |
| a problem with no parts | One `<Answer>` directly inside the `<Question>` |
| `spiralstrip` (the review strip that ends a worksheet) | A section `## Quick review`, one sentence with no numbers in it ("Five short items from earlier in this unit."), then one `<Question>` numbered after the last, with no topic, and a `<Part>` for each item |
| `\frq{long}{10}{\ced{5.1} ... \textbullet\ description}` | `<Question number={n} title="Description" topic="..." points={10}>` |
| `rubric` with `\rpoint{4}{(a) ...}` | `<Rubric>` as the last thing in the question, with one `<RubricLine part="a" points={4}>...</RubricLine>` per `\rpoint`, **each on one line**. Drop the leading "(a)" from the text and write "pts" as "points" (or "point") |
| `\section*{Ladder N \textbullet\ Title}`, its `\ced` tags and the paragraph under it | `## Ladder N: Title` and the paragraph. The topics go on the ladder's question |
| `workedexample[I do: title]` | `<Worked title="Title">` (drop "I do:", capitalize) |
| `yourturn`: four `\item`s, a `\selfcheck{(a) .. (b) .. (c) .. (d) ..}` and a key `apcanswer` with (a) to (d) | `<Question number={N} label="Your turn" topic="...">` with four parts, a to d. Each part's `<Answer>` holds that letter's short answer from `\selfcheck` as its first paragraph, then that letter's explanation from the key. Split both at the running markers (a), (b), (c), (d); a mention such as "in (a)" inside a sentence is a cross-reference, not a marker |
| `apcnote` (a boxed note) | Plain paragraphs, reworded for a student anywhere |
| `align*` holding the steps of a mechanism | A two-column table, the step and its equation, as lesson 5.8 writes them: `\| Step 1 (slow) \| $\ce{N2O5 -> NO2 + NO3}$ \|` |
| `tabular` | A Markdown table. Column heads: "Experiment", `$[\ce{A}]_0$ (M)`, "Rate (M/s)" or "Initial rate (M/s)" |
| blank widths, line counts, workspace heights, `\needspace`, "Name:", the title block | Nothing. They are layout for paper |

### Notation

| In the LaTeX | In the MDX |
|---|---|
| `\SI{0.030}{\Molar\per\second}` in a sentence | `0.030 M/s` as plain text |
| `\SI{2.0e-3}{\Molar\per\second}` | `$2.0 \times 10^{-3}\ \text{M/s}$` (a power of ten is always math) |
| a number and unit inside math | `= \mathbf{0.112}\ \text{M}`: a backslash-space, then the unit in `\text{}` |
| units that divide once | `M/s`, `kJ/mol`, `J/mol` |
| every other compound unit | Powers, with a thin space between: `\text{s}^{-1}`, `\text{min}^{-1}`, `\text{M}^{-1}\,\text{s}^{-1}`, `\text{M}^{-2}\,\text{s}^{-1}`, `\text{J}\,\text{mol}^{-1}\,\text{K}^{-1}`. A unit with a power is always math: `$0.0250\ \text{s}^{-1}$` |
| plain units in a sentence | `s`, `min`, `days`, `M`, `mol`, `mL`, `mg`, `kJ`, `K`, `°C`, `%`: "25.0 mL", "8.0 days", "10 °C", "7%" |
| `M\textsuperscript{-2}\,s\textsuperscript{-1}` (a unit typed by hand) | `$\text{M}^{-2}\,\text{s}^{-1}$` |
| a negative number in a sentence | Math, so the minus sign is a real one: `$-40\ \text{kJ}$` |
| `\ce{...}` in a sentence | `$\ce{...}$` |
| `\mathbf{...}` around a final answer | Kept |
| `\emph{x}`, `\textbf{x}` | `*x*`, `**x**` |
| `~` | A space |
| `---` | Not carried over. Recast the sentence: a comma, a colon, or two sentences |
| TeX's typed quotation marks (two backticks to open, two apostrophes to close) | `"quoted"` |
| `\%`, `\checkmark`, `\ldots` | `%`, `✓`, `…` |
| `\[ ... \]` | Display math: `$$` on its own line, the math, `$$` on its own line, a blank line before and after |

### What fits a phone

1. **These always go on their own line as display math**, also inside an `<Answer>`: a calculation (anything with an equals sign and numbers); a chain such as `0.80 \to 0.40 \to 0.20`; a reaction equation that has state symbols or is longer than about fifteen characters; a rate law longer than `\text{rate} = k[\ce{A}]^2[\ce{B}]`. Math inside a sentence cannot wrap or scroll.
2. **Split display math longer than about thirty characters** over lines with `aligned`, breaking at an equals sign (Worksheet 1, question 4, part e).
3. **Never begin a paragraph with a number and a period.** Markdown turns "2. Comparing…" into a list. Write "The order in A is 2. Comparing…".
4. **Blank line after every opening tag and before every closing tag**, except `<RubricLine>` (one line) and `<Blank />` (inside its sentence).
5. **No `{`, `}` or `<` outside math.** MDX reads them as code.

### Wording

1. US spelling: behavior, favorable, canceling. "Gasoline" for "petrol". "Points" or "credit" for "marks".
2. Nothing that points at a class, a book or a sheet of paper: no "Zumdahl", "blocks 1–2", "data strip", "WS 4", "the notes", "from memory", "TEACHER KEY", "Name:". Say the thing itself ("The decomposition … is found by experiment to be first order").
3. "Rate-limiting step", as the lessons say, where the source says "rate-determining step".
4. No em dashes.
5. Speak to the student. Short sentences. Do not decorate.

### Beyond the exam

The teacher keeps these, always under the label. `beyond` on a `<Question>` labels the whole question; on a `<Part>`, that part.

| Where | What | Label on |
|---|---|---|
| Worksheet 3, question 6 | Arrhenius calculations (the framework's exclusion, topic 5.6) | The question |
| Worksheet 2, question 3, parts b and c | The second-order half-life formula (not in the framework) | Each part |
| Worksheet 2, question 4, part a | The zero-order half-life formula (not in the framework) | The part |
| Worksheet 3, quick review, the zero-order half-life item | The same | The part |

The fact-checker confirms each against the framework and looks for others. The list, as it ends up, goes in the pull request for the teacher to see.

---

## How every conversion task ends (Tasks 5, 6 and 7)

- [ ] **Build and test once, for the whole group.**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npm run build
npm test
npm run test:e2e
```

Expected: `check-dist: N pages, 0 problem(s)`; every unit and browser test passes. `tests/e2e/practice.spec.ts` makes its tests from the files in `src/content/practice/unit-5/`, so each new document is tested without anyone adding a test. The usual first failures are a page that scrolls sideways at 320 px (move the equation it names onto its own line) and `LaTeX left in the page text`.

- [ ] **Audit each document against its source.** For each one:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit05-kinetics/<source>.tex" src/content/practice/unit-5/<name>.mdx "<scratch>/plan3/expected/<name>.json"
```

Every line it prints is a number, formula or part that is on one side and not the other, or a question that kept less than 70% of its wording. For each line, decide: **a mistake in the conversion** (fix the MDX) or **a deliberate edit** (add the line, exactly as printed, to the document's `expected` file with the reason). The differences this plan already knows about are listed in each task. Done when the script ends `0 unexplained, 0 stale`. Keep the output: it goes in the pull request.

An `expected` file looks like this:

```json
{
  "expected": [
    {
      "line": "question 2: number only on the site: 5.8",
      "reason": "The source writes the range 5.7--5.10; the site lists each topic."
    }
  ]
}
```

- [ ] **Look at each page.** Start a preview (`npx astro preview --port 4400`, in the background), then run the script from Appendix A:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
NODE_PATH="$PWD/node_modules" node "<scratch>/practice-shots.cjs" http://localhost:4400 "<scratch>/plan3/shots" unit-5-kinetics/practice/<name>/
```

Read both screenshots of each page from top to bottom: every equation rendered, every table whole, nothing run together, the answers legible in the dark theme. Read the four width lines: `page overflow 0` at 412, 390, 360 and 320 px is required; a `scrolling boxes` entry is a table or a display equation that scrolls inside its own box, which is allowed but worth one attempt to split. **Stop the preview before any `npm run test:e2e`**: find it with `netstat -ano | grep ":4400 "` and end it with `taskkill //PID <pid> //F`.

- [ ] **Fact-check each document, independently.** One checker per document, in parallel, read-only, on the model the Models section gives. Each gets: the MDX file; the source `.tex`; the key PDF as page pictures; the framework text; the lessons for the document's topics (`src/content/lessons/unit-5/`). Its brief:

  1. Solve every question from the question alone, then compare with the answer shown. Recompute every number, to the significant figures given.
  2. Check every unit by dimensional analysis. (The audit does not read units.)
  3. Check every statement against the framework, and against the site's lessons: the same terms, the same limits on a rule. Lessons 5.8 and 5.10 state when "the slow step is the one with the highest barrier" holds; an answer here must not say more than they do.
  4. Compare with the key PDF, page by page: every question, part and answer is on the site and says the same thing.
  5. Confirm each "Beyond the exam" label, and name anything else the framework does not ask for.
  6. Report findings, each with the text quoted, what is wrong, the correction, and the evidence. Say plainly when there are none.

- [ ] **Decide each finding.** A finding is input, not an order: accept it, or reject it and write down why. A real error in the source's chemistry is corrected on the site, since the MDX is now the master copy; the correction then shows up in the audit and is recorded in the `expected` file as "corrected: …".

- [ ] **Apply the accepted findings.** One fixer per document, given the decided list of edits and nothing else to decide. Then build, test and audit again.

- [ ] **Open the pull request and stop.** The body gives: what each document holds (questions, parts, points); the audit's last line for each document and every expected difference with its reason; the fact-check's findings and what was done with each; the "Beyond the exam" list; corrections to the original, if any; the test and build output. Then wait for the teacher.

---

## Group A: the practice pages and Worksheet 1 (pull request 1)

Branch `topic/practice-foundation`, from an up-to-date `main`.

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
git checkout main
git pull --ff-only
git checkout -b topic/practice-foundation
```

### Task 1: The naming rules for practice

**Files:**
- Create: `src/lib/practice-id.ts`
- Test: `tests/unit/practice-id.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/practice-id.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { kindLabel, parseTopics, practiceIdParts, topicFromLessonPath, topicsLabel } from '../../src/lib/practice-id';

describe('practiceIdParts', () => {
  it('reads the unit and the slug from a file in a unit folder', () => {
    expect(practiceIdParts('unit-5/worksheet-1-rates-and-rate-laws')).toEqual({
      unit: 5,
      slug: 'worksheet-1-rates-and-rate-laws',
    });
  });

  it.each([
    ['a file outside a unit folder', 'worksheet-1'],
    ['a folder that is not a unit', 'kinetics/worksheet-1'],
    ['a deeper folder', 'unit-5/extra/worksheet-1'],
    ['capital letters', 'unit-5/Worksheet-1'],
    ['a space', 'unit-5/worksheet 1'],
    ['a doubled hyphen', 'unit-5/worksheet--1'],
    ['an empty name', 'unit-5/'],
  ])('returns null for %s', (_name, id) => {
    expect(practiceIdParts(id)).toBeNull();
  });
});

describe('topicFromLessonPath', () => {
  it('reads the topic from a lesson address', () => {
    expect(topicFromLessonPath('/unit-5-kinetics/5-2-rate-law/')).toBe('5.2');
  });

  it('reads a two-digit topic number', () => {
    expect(topicFromLessonPath('/unit-5-kinetics/5-11-catalysis/')).toBe('5.11');
  });

  it.each([
    ['the home page', '/'],
    ['a unit page', '/unit-5-kinetics/'],
    ['a practice page', '/unit-5-kinetics/practice/worksheet-1-rates-and-rate-laws/'],
    ['a lesson address without its closing slash', '/unit-5-kinetics/5-2-rate-law'],
    ['the about page', '/about/'],
  ])('returns null for %s', (_name, path) => {
    expect(topicFromLessonPath(path)).toBeNull();
  });
});

describe('parseTopics', () => {
  it('reads one code', () => {
    expect(parseTopics('5.2')).toEqual(['5.2']);
  });

  it('reads several codes separated by commas, with or without spaces', () => {
    expect(parseTopics('5.7, 5.8,5.10')).toEqual(['5.7', '5.8', '5.10']);
  });

  it.each([
    ['an empty text', ''],
    ['a range', '5.7-5.10'],
    ['a word', 'kinetics'],
    ['a code with no topic number', '5.'],
    ['a topic numbered zero', '5.0'],
    ['a trailing comma', '5.1,'],
  ])('throws on %s', (_name, text) => {
    expect(() => parseTopics(text)).toThrow(/not a list of topic codes/);
  });

  it('throws when a topic is named twice', () => {
    expect(() => parseTopics('5.1, 5.1')).toThrow(/twice/);
  });
});

describe('topicsLabel', () => {
  it('names one topic', () => {
    expect(topicsLabel(['5.3'])).toBe('Topic 5.3');
  });

  it('writes neighbors as a range', () => {
    expect(topicsLabel(['5.1', '5.2'])).toBe('Topics 5.1–5.2');
    expect(topicsLabel(['5.9', '5.10', '5.11'])).toBe('Topics 5.9–5.11');
  });

  it('lists topics that are not neighbors', () => {
    expect(topicsLabel(['5.1', '5.3'])).toBe('Topics 5.1, 5.3');
  });

  it('does not write topics from two units as a range', () => {
    expect(topicsLabel(['4.9', '5.10'])).toBe('Topics 4.9, 5.10');
  });

  it('throws when there is no topic', () => {
    expect(() => topicsLabel([])).toThrow(/at least one topic/);
  });
});

describe('kindLabel', () => {
  it('names each kind of practice', () => {
    expect(kindLabel('worksheet')).toBe('Worksheet');
    expect(kindLabel('ladders')).toBe('Skill ladders');
    expect(kindLabel('free-response')).toBe('Free response');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/practice-id.test.ts
```

Expected: the file fails to load, because `src/lib/practice-id.ts` does not exist.

- [ ] **Step 3: Write the module**

Create `src/lib/practice-id.ts`:

```ts
// The naming rules for practice documents, kept free of astro:content so they
// can be unit-tested.

const PRACTICE_ID = /^unit-(\d+)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const LESSON_PATH = /^\/unit-\d+-[a-z0-9-]+\/(\d+)-(\d+)-[a-z0-9-]+\/$/;
const TOPIC_CODE = /^[1-9]\.[1-9]\d?$/;

export const PRACTICE_KINDS = ['worksheet', 'ladders', 'free-response'] as const;
export type PracticeKind = (typeof PRACTICE_KINDS)[number];

const KIND_LABEL: Record<PracticeKind, string> = {
  worksheet: 'Worksheet',
  ladders: 'Skill ladders',
  'free-response': 'Free response',
};

export function kindLabel(kind: PracticeKind): string {
  return KIND_LABEL[kind];
}

/**
 * Splits a practice document's collection id ("unit-5/worksheet-1-rates": its
 * path without the extension) into its unit number and the last URL segment.
 * Null when the file is not filed as unit-<number>/<slug>.
 */
export function practiceIdParts(id: string): { unit: number; slug: string } | null {
  const match = PRACTICE_ID.exec(id);
  if (!match) return null;
  const [, unit = '', slug = ''] = match;
  return { unit: Number(unit), slug };
}

/**
 * The topic a lesson's address names: "/unit-5-kinetics/5-2-rate-law/" gives
 * "5.2". Null for any address that is not a lesson's.
 */
export function topicFromLessonPath(path: string): string | null {
  const match = LESSON_PATH.exec(path);
  if (!match) return null;
  const [, unit = '', number = ''] = match;
  return `${unit}.${number}`;
}

/** "5.7, 5.8" gives ["5.7", "5.8"]. Throws on anything that is not a list of topic codes. */
export function parseTopics(text: string): string[] {
  const codes = text.split(',').map((code) => code.trim());
  for (const code of codes) {
    if (!TOPIC_CODE.test(code)) {
      throw new Error(
        `"${text}" is not a list of topic codes. Write one code such as "5.2", or several separated by commas: "5.7, 5.8".`,
      );
    }
  }
  if (new Set(codes).size !== codes.length) throw new Error(`"${text}" names a topic twice.`);
  return codes;
}

/**
 * How a document's topics read in a list: "Topic 5.3", "Topics 5.1–5.2" for a
 * run of neighbors, "Topics 5.1, 5.3" otherwise.
 */
export function topicsLabel(codes: readonly string[]): string {
  const [first, ...rest] = codes;
  if (first === undefined) throw new Error('A practice document must cover at least one topic.');
  const last = rest.at(-1);
  if (last === undefined) return `Topic ${first}`;
  const numbers = codes.map((code) => Number(code.split('.')[1]));
  const sameUnit = codes.every((code) => code.split('.')[0] === first.split('.')[0]);
  const isRun = sameUnit && numbers.every((n, i) => i === 0 || n === (numbers[i - 1] ?? NaN) + 1);
  return isRun ? `Topics ${first}–${last}` : `Topics ${codes.join(', ')}`;
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/practice-id.test.ts
```

Expected: every test in the file passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/practice-id.ts tests/unit/practice-id.test.ts
git commit -m "feat(practice): add the naming rules for practice documents"
```

### Task 2: The build check learns what a practice page must have

A practice page can be wrong in ways the build does not notice: a question with no answer, a rubric that no longer adds up to the question's points after an edit, a `\SI{...}` or a `---` that came across from the LaTeX. `check-dist` already runs after every build; it gains these rules.

**Files:**
- Modify: `scripts/check-dist.mjs`
- Test: `tests/unit/check-dist-practice.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/check-dist-practice.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { checkPage } from '../../scripts/check-dist.mjs';

const everythingExists = () => true;

const answer = (text = 'first order') =>
  `<details data-part="answer"><summary>Show answer</summary><div class="answer-body">${text}</div></details>`;
const part = (inner: string) => `<div data-part="part"><p>(a)</p><div>${inner}</div></div>`;
const rubric = (...points: number[]) =>
  `<details data-part="rubric"><ul>${points.map((p) => `<li data-rubric-points="${p}">credit</li>`).join('')}</ul></details>`;
const question = (inner: string, attributes = '') =>
  `<section data-part="question"${attributes}><h3>Question 1</h3>${inner}</section>`;
const practice = (inner: string) => `<main><article data-practice="worksheet">${inner}</article></main>`;

describe('checkPage, practice', () => {
  it('passes a question answered as a whole', () => {
    expect(checkPage(practice(question(`<p>Why?</p>${answer()}`)), everythingExists)).toEqual([]);
  });

  it('passes a question whose every part has an answer', () => {
    const html = practice(question(part(answer()) + part(answer())));

    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('passes a scored question whose rubric adds up to its points', () => {
    const html = practice(question(part(answer()) + rubric(4, 2, 2, 2), ' data-points="10"'));

    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('reports a practice page with no questions', () => {
    expect(checkPage(practice('<p>Soon.</p>'), everythingExists)).toEqual(['practice page has no questions']);
  });

  it('reports a question with no answer', () => {
    expect(checkPage(practice(question('<p>Why?</p>')), everythingExists)).toEqual(['Question 1 has no answer']);
  });

  it('reports the part that has no answer, even when another part has one', () => {
    const html = practice(question(part(answer()) + part('<p>Why?</p>')));

    expect(checkPage(html, everythingExists)).toEqual(['Question 1, part 2, has no answer']);
  });

  it('reports an answer with nothing in it', () => {
    expect(checkPage(practice(question(answer('  '))), everythingExists)).toEqual(['Question 1 has an empty answer']);
  });

  it('reports a scored question with no rubric', () => {
    const html = practice(question(answer(), ' data-points="4"'));

    expect(checkPage(html, everythingExists)).toEqual(['Question 1 is worth 4 points but has no rubric']);
  });

  it('reports a rubric that does not add up to the points', () => {
    const html = practice(question(answer() + rubric(2, 1), ' data-points="4"'));

    expect(checkPage(html, everythingExists)).toEqual(['Question 1 is worth 4 points but its rubric adds up to 3']);
  });

  it('reports a rubric on a question that is not given points', () => {
    const html = practice(question(answer() + rubric(2)));

    expect(checkPage(html, everythingExists)).toEqual(['Question 1 has a rubric but is not given any points']);
  });

  it.each([
    ['a command', 'the rate is \\SI{2.0e-3}{\\Molar}', '\\SI'],
    ['a math delimiter', 'so $k$ is large', '$'],
    ['a typed dash', 'one value --- the rate', '---'],
    ['an opening quote', '``the graph was linear', '``'],
    ['a closing quote', "the graph was linear''", "''"],
    ['a tie', '0.060~M/s', '~'],
  ])('reports LaTeX left in view: %s', (_name, text, leftover) => {
    const html = practice(question(answer(text)));

    expect(checkPage(html, everythingExists)).toContain(`LaTeX left in the page text: "${leftover}"`);
  });

  it('does not look for LaTeX in the source KaTeX keeps for screen readers', () => {
    const math = '<span class="katex"><annotation encoding="application/x-tex">k~\\si{x}</annotation>k</span>';

    expect(checkPage(practice(question(answer(math))), everythingExists)).toEqual([]);
  });

  it('does not apply the practice rules to a page that is not practice', () => {
    expect(checkPage('<main><p>A cost of $5 --- roughly.</p></main>', everythingExists)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/check-dist-practice.test.ts
```

Expected: `13 failed | 5 passed (18)`. Every `reports …` test fails, because the build check has no rules for practice yet. The `passes …` and `does not …` tests pass already.

- [ ] **Step 3: Add the rules**

In `scripts/check-dist.mjs`, add two lines to the list in the comment at the top of the file, after the line about words run together:

```js
//   - practice questions with no answer, rubrics that do not add up to a
//     question's points, and LaTeX left in view on a practice page
```

In `checkPage`, replace the last three lines of the function:

```js
  if (RAW_MATH.test(root.text)) problems.push('unrendered math is visible in the page text');

  return problems;
}
```

with:

```js
  if (RAW_MATH.test(root.text)) problems.push('unrendered math is visible in the page text');

  const practice = root.querySelector('[data-practice]');
  if (practice) problems.push(...practiceProblems(practice));

  return problems;
}

// Practice was converted from LaTeX, so its marks could survive into a page:
// a command, a math delimiter, a typed dash or quote, a tie.
const LEFTOVER_LATEX = /\\[a-zA-Z]+|\$|---|``|''|~/;

/**
 * What must hold for a practice page: it has questions, every question (or,
 * when it has parts, every part) shows an answer with something in it, a
 * scored question has a rubric that adds up to its points, and nothing of the
 * LaTeX it was converted from is left in view.
 * @param {import('node-html-parser').HTMLElement} practice the page's article,
 *   with MathML annotations already removed
 * @returns {string[]} problems, empty when the page is fine
 */
function practiceProblems(practice) {
  const problems = [];
  const questions = practice.querySelectorAll('[data-part="question"]');
  if (questions.length === 0) problems.push('practice page has no questions');

  questions.forEach((question, index) => {
    const name = question.querySelector('h3')?.text.trim() || `question ${index + 1}`;
    const parts = question.querySelectorAll('[data-part="part"]');
    // A question without parts is answered as a whole.
    const answered = parts.length > 0 ? parts : [question];
    answered.forEach((holder, position) => {
      const where = parts.length > 0 ? `${name}, part ${position + 1},` : name;
      const answers = holder.querySelectorAll('[data-part="answer"]');
      if (answers.length === 0) problems.push(`${where} has no answer`);
      if (answers.some((answer) => !answer.querySelector('.answer-body')?.text.trim())) {
        problems.push(`${where} has an empty answer`);
      }
    });

    const lines = question.querySelectorAll('[data-rubric-points]');
    const total = lines.reduce((sum, line) => sum + Number(line.getAttribute('data-rubric-points')), 0);
    const points = question.getAttribute('data-points');
    if (points === undefined) {
      if (lines.length > 0) problems.push(`${name} has a rubric but is not given any points`);
    } else if (lines.length === 0) {
      problems.push(`${name} is worth ${points} points but has no rubric`);
    } else if (total !== Number(points)) {
      problems.push(`${name} is worth ${points} points but its rubric adds up to ${total}`);
    }
  });

  const leftover = LEFTOVER_LATEX.exec(practice.text)?.[0];
  if (leftover) problems.push(`LaTeX left in the page text: "${leftover}"`);

  return problems;
}
```

The call sits after the line that removes `annotation`, `script` and `style` nodes, on purpose: KaTeX keeps each equation's TeX source in an `<annotation>`, and that source is not "left in view".

- [ ] **Step 4: Run the tests and watch them pass**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/check-dist-practice.test.ts tests/unit/check-dist.test.ts
```

Expected: both files pass. The second is the existing one; it must be untouched and still green.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-dist.mjs tests/unit/check-dist-practice.test.ts
git commit -m "feat(build): check practice pages for answers, rubric totals and leftover LaTeX"
```

### Task 3: The conversion audit

> **As carried out (2026-11-13).** The code printed below is what was first committed. The code review then changed it; read `scripts/practice-audit.mjs` for the current version. What changed: a sign is now dropped only when the character directly before it is a digit, a letter or a closing bracket, so "is -92 kJ" keeps its minus (as printed here, a minus sign lost in a sentence went unreported); exponents typed `E` or `e+` are read; a quoted `kind: "ladders"` is recognized.

**Files:**
- Create: `scripts/practice-audit.mjs`
- Test: `tests/unit/practice-audit.test.ts`

What it does, and how it decides:

- It cuts both documents into pieces: what comes before question 1, then one piece per question. On the LaTeX side a question starts at `\problem`, `\frq{` or `\begin{spiralstrip}`; on the site, at `<Question`. **The ladders are cut at each section instead** (`\section*{` and `## `), chosen from `kind: ladders` in the MDX frontmatter, because a ladder's worked example belongs with its questions.
- In each piece it lists every number, written one way (`2.0\times10^{-3}`, `2.0 \times 10^{-3}` and siunitx's `2.0e-3` all become `2.0e-3`), with its sign when the sign is part of the number and not a subtraction. Layout numbers (blank widths, line counts) and the powers on units are left out. From a block's attributes it reads only `points` and `topic`.
- It lists every `\ce{...}`, counts parts and rubric lines, and works out what share of the source's longer words are on the site. Below 70% it says so: that is how a truncated explanation shows up. The introduction's wording is not compared, since it is written fresh.
- A difference listed in the `expected` file, with a reason, is accepted. A listed difference that no longer occurs is reported as stale, so the list cannot rot.
- It does not compare units. The fact-check does.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/practice-audit.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  differences,
  numberTokens,
  pieceOf,
  siteFacts,
  sortDifferences,
  sourceFacts,
  takeFormulas,
} from '../../scripts/practice-audit.mjs';

// String.raw keeps the backslashes of LaTeX and KaTeX as they are written.
const tex = (body: string) => String.raw`\documentclass{apchem-worksheet}
\apcunit{5}
\begin{document}
${body}
\end{document}`;
const mdx = (body: string) => `---\ntitle: "A worksheet"\norder: 1\n---\n\n${body}\n`;

const SOURCE_QUESTION = String.raw`\problem[]{\ced{5.2} For $\ce{2NO + O2 -> 2NO2}$ the rate is
\SI{2.0e-3}{\Molar\per\second}.}
\begin{parts}
  \item Find $k$. \workspace[2cm]
        \keyonly{\begin{apcanswer}$k = 2.5\times10^{-5}/(0.010)^2 =
        \mathbf{0.25}~\si{\per\Molar\per\second}$\end{apcanswer}}
  \item Order in \ce{NO}: \answerblank[1.8cm]{2}
\end{parts}`;
const SITE_QUESTION = String.raw`<Question number={1} topic="5.2">

For $\ce{2NO + O2 -> 2NO2}$ the rate is $2.0 \times 10^{-3}\ \text{M/s}$.

<Part label="a">

Find $k$.

<Answer>

$$
k = \frac{2.5 \times 10^{-5}}{(0.010)^2} = \mathbf{0.25}\ \text{M}^{-1}\,\text{s}^{-1}
$$

</Answer>

</Part>

<Part label="b">

Order in $\ce{NO}$: <Blank />

<Answer>

2

</Answer>

</Part>

</Question>`;

describe('numberTokens', () => {
  it('reads plain numbers and keeps trailing zeros', () => {
    expect(numberTokens('0.0250 and 60.0 and 3')).toEqual(['0.0250', '60.0', '3']);
  });

  it('writes a power of ten one way, however it was typed', () => {
    expect(numberTokens(String.raw`2.0\times10^{-3}`)).toEqual(['2.0e-3']);
    expect(numberTokens(String.raw`2.0 \times 10^{-3}`)).toEqual(['2.0e-3']);
    expect(numberTokens('2.0e-3')).toEqual(['2.0e-3']);
    expect(numberTokens(String.raw`5.5\times10^{4}`)).toEqual(['5.5e4']);
    expect(numberTokens(String.raw`5.5 \times 10^4`)).toEqual(['5.5e4']);
  });

  it('keeps the sign of a signed number', () => {
    expect(numberTokens('= -40 kJ')).toEqual(['-40']);
    expect(numberTokens('$+6$')).toEqual(['+6']);
    expect(numberTokens(String.raw`e^{-2.193}`)).toEqual(['-2.193']);
  });

  it('reads a typographic minus as a minus', () => {
    expect(numberTokens('= −40 kJ')).toEqual(['-40']);
  });

  it('does not take a subtraction for a sign', () => {
    expect(numberTokens('170 - 50')).toEqual(['170', '50']);
    expect(numberTokens('170-50')).toEqual(['170', '50']);
    expect(numberTokens('(0.500)-1.50')).toEqual(['0.500', '1.50']);
  });

  it('reads a range of topics as two numbers', () => {
    expect(numberTokens('5.1-5.11')).toEqual(['5.1', '5.11']);
  });
});

describe('takeFormulas', () => {
  it('takes each formula out and leaves the rest', () => {
    const { formulas, rest } = takeFormulas(String.raw`For \ce{2N2O5 -> 4NO2 + O2} and \ce{O2}.`);

    expect(formulas).toEqual(['2N2O5 -> 4NO2 + O2', 'O2']);
    expect(rest).not.toContain('N2O5');
  });

  it('follows braces inside a formula', () => {
    expect(takeFormulas(String.raw`\ce{A ->[{k_1}] B} then 3`)).toEqual({ formulas: ['A ->[{k_1}] B'], rest: '  then 3' });
  });

  it('treats line breaks and runs of spaces in a formula as one space', () => {
    expect(takeFormulas('\\ce{A +\n   B}').formulas).toEqual(['A + B']);
  });

  it('throws on a formula that is never closed', () => {
    expect(() => takeFormulas(String.raw`\ce{A + B`)).toThrow(/never closed/);
  });
});

describe('sourceFacts', () => {
  it('cuts the document into the part before question 1 and one piece per question', () => {
    const facts = sourceFacts(tex(`Intro 7.\n${SOURCE_QUESTION}\n${SOURCE_QUESTION}`));

    expect(facts).toHaveLength(3);
    expect(facts[0]?.numbers).toEqual(['7']);
  });

  it('reads the numbers of a question and leaves out units and layout', () => {
    const [, question] = sourceFacts(tex(SOURCE_QUESTION));

    expect(question?.numbers).toEqual(['5.2', '2.0e-3', '2.5e-5', '0.010', '2', '0.25', '2']);
  });

  it('reads formulas, parts and rubric lines', () => {
    const rubric = String.raw`\begin{rubric}\rpoint{2}{(a) both} \rpoint{1}{(b) one}\end{rubric}`;
    const [, question] = sourceFacts(tex(`${SOURCE_QUESTION}\n${rubric}`));

    expect(question?.formulas).toEqual(['2NO + O2 -> 2NO2', 'NO']);
    expect(question?.parts).toBe(2);
    expect(question?.rubricLines).toBe(2);
  });

  it('ignores a comment but not a percent sign written as \\%', () => {
    const [intro] = sourceFacts(tex('Worth 7\\% % not 99\n'));

    expect(intro?.numbers).toEqual(['7']);
  });

  it('starts a new question at a free-response question and at a review strip', () => {
    const body = String.raw`\frq{long}{10}{\ced{5.1} one}
\begin{spiralstrip}{Units 1--4} \item b \end{spiralstrip}`;

    const facts = sourceFacts(tex(body));

    expect(facts).toHaveLength(3);
    expect(facts[1]?.numbers).toEqual(['10', '5.1']);
    expect(facts[2]?.numbers).toEqual([]);
  });

  it('cuts the ladders at each section, keeping a worked example with its questions', () => {
    const ladder = String.raw`\section*{\sffamily Ladder 1 \textbullet\ Rates}
\ced{5.1}
\begin{workedexample}[I do: one] Oxygen appears at \SI{0.0125}{\Molar\per\second}. \end{workedexample}
\begin{yourturn}[YOUR TURN 1 --- four questions]
\begin{enumerate}[leftmargin=*,itemsep=0.5em]
  \item How fast? \workspace[1.4cm]
\end{enumerate}
\selfcheck{(a) \SI{0.060}{\Molar\per\second}}
\end{yourturn}`;

    const facts = sourceFacts(tex(`${ladder}\n${ladder}`), 'section');

    expect(facts).toHaveLength(3);
    expect(facts[1]?.numbers).toEqual(['1', '5.1', '0.0125', '0.060']);
    expect(facts[1]?.parts).toBe(1);
  });

  it('leaves out the column rules of a table, braces and all', () => {
    const table = String.raw`\begin{tabular}{@{}c p{6.0cm} c >{\raggedright\arraybackslash}p{4.9cm}@{}} 1 & 0.10 \\ \end{tabular}`;

    expect(sourceFacts(tex(table))[0]?.numbers).toEqual(['1', '0.10']);
  });

  it('throws when the file is not a whole document', () => {
    expect(() => sourceFacts('just text')).toThrow(/begin\{document\}/);
  });

  it('throws on a number range it cannot read', () => {
    expect(() => sourceFacts(tex(String.raw`\SIrange{1}{2}{\second}`))).toThrow(/SIrange/);
  });
});

describe('siteFacts', () => {
  it('leaves out the frontmatter and cuts at each question', () => {
    const facts = siteFacts(mdx(`Intro 7.\n\n${SITE_QUESTION}\n\n${SITE_QUESTION}`));

    expect(facts).toHaveLength(3);
    expect(facts[0]?.numbers).toEqual(['7']);
  });

  it('reads topics and points from a component and nothing else from it', () => {
    const [, question] = siteFacts(mdx('<Question number={3} title="Step 2" topic="5.7, 5.8" points={10}>\n\nText.\n\n</Question>'));

    expect(question?.numbers).toEqual(['10', '5.7', '5.8']);
  });

  it('reads the numbers of a question and leaves out the powers on units', () => {
    const [, question] = siteFacts(mdx(SITE_QUESTION));

    expect(question?.numbers).toEqual(['5.2', '2.0e-3', '2.5e-5', '0.010', '2', '0.25', '2']);
  });

  it('counts parts and rubric lines', () => {
    const rubric = '<Rubric>\n<RubricLine part="a" points={2}>both</RubricLine>\n<RubricLine part="b" points={1}>one</RubricLine>\n</Rubric>';
    const [, question] = siteFacts(mdx(SITE_QUESTION.replace('</Question>', `${rubric}\n\n</Question>`)));

    expect(question?.parts).toBe(2);
    expect(question?.rubricLines).toBe(2);
  });

  it('cuts the ladders at each section heading, not at each question', () => {
    const ladder = '## Ladder 1: Rates\n\nIntro.\n\n<Worked title="One">\n\nOxygen appears at 0.0125 M/s.\n\n</Worked>\n\n<Question number={1} label="Your turn" topic="5.1">\n\n<Part label="a">\n\nHow fast?\n\n<Answer>\n\n0.060 M/s\n\n</Answer>\n\n</Part>\n\n</Question>';

    const facts = siteFacts(mdx(`${ladder}\n\n${ladder}`), 'section');

    expect(facts).toHaveLength(3);
    expect(facts[1]?.numbers).toEqual(['1', '0.0125', '5.1', '0.060']);
    expect(facts[1]?.parts).toBe(1);
  });
});

describe('pieceOf', () => {
  it('cuts a ladders document by section', () => {
    expect(pieceOf('---\ntitle: "Skill ladders"\nkind: ladders\norder: 1\n---\n\nText.\n')).toBe('section');
  });

  it('cuts every other document by question', () => {
    expect(pieceOf('---\ntitle: "Worksheet 1"\nkind: worksheet\norder: 2\n---\n\nText.\n')).toBe('question');
    expect(pieceOf('No frontmatter at all, and the word kind: ladders in the text.\n')).toBe('question');
  });
});

describe('differences', () => {
  it('finds none when the site says what the source says', () => {
    expect(differences(tex(SOURCE_QUESTION), mdx(SITE_QUESTION))).toEqual([]);
  });

  it('reports a number that changed', () => {
    const changed = SITE_QUESTION.replace(String.raw`\mathbf{0.25}`, String.raw`\mathbf{0.52}`);

    expect(differences(tex(SOURCE_QUESTION), mdx(changed))).toEqual([
      'question 1: number only in the source: 0.25',
      'question 1: number only on the site: 0.52',
    ]);
  });

  it('reports a lost trailing zero', () => {
    const changed = SITE_QUESTION.replace('(0.010)', '(0.01)');

    expect(differences(tex(SOURCE_QUESTION), mdx(changed))).toContain('question 1: number only in the source: 0.010');
  });

  it('reports a lost minus sign in a power of ten', () => {
    const changed = SITE_QUESTION.replace(String.raw`2.0 \times 10^{-3}`, String.raw`2.0 \times 10^{3}`);

    expect(differences(tex(SOURCE_QUESTION), mdx(changed))).toContain('question 1: number only in the source: 2.0e-3');
  });

  it('reports a formula that changed', () => {
    const changed = SITE_QUESTION.replace(String.raw`\ce{2NO + O2 -> 2NO2}`, String.raw`\ce{2NO + O2 -> NO2}`);

    expect(differences(tex(SOURCE_QUESTION), mdx(changed))).toEqual([
      'question 1: formula only in the source: 2NO + O2 -> 2NO2',
      'question 1: formula only on the site: 2NO + O2 -> NO2',
    ]);
  });

  it('reports a missing part', () => {
    const shorter = SITE_QUESTION.replace(/<Part label="b">[\s\S]*?<\/Part>/, '');

    expect(differences(tex(SOURCE_QUESTION), mdx(shorter))).toContain('question 1: the source has 2 part(s) and the site has 1');
  });

  it('reports a missing question', () => {
    const lines = differences(tex(`${SOURCE_QUESTION}\n${SOURCE_QUESTION}`), mdx(SITE_QUESTION));

    expect(lines).toContain('the source has 2 question(s) and the site has 1');
  });

  it('reports a question whose explanation was cut short', () => {
    const source = String.raw`\problem[]{Explain. \answerlines[3]{Orders are experimental quantities set
by the mechanism, in particular by the slowest elementary step, never by the overall stoichiometry.}}`;
    const site = '<Question number={1}>\n\nExplain.\n\n<Answer>\n\nOrders are experimental.\n\n</Answer>\n\n</Question>';

    expect(differences(tex(source), mdx(site))).toEqual([
      "question 1: only 27% of the source's wording is on the site",
    ]);
  });

  it('compares a ladders document section by section', () => {
    const source = String.raw`\section*{\sffamily Ladder 1 \textbullet\ Rates}
\begin{yourturn}[YOUR TURN 1 --- four questions]
\begin{enumerate}
  \item How fast is hydrogen consumed? \workspace[1.4cm]
\end{enumerate}
\selfcheck{(a) \SI{0.060}{\Molar\per\second}}
\end{yourturn}`;
    const site = '---\nkind: ladders\n---\n\n## Ladder 1: Rates\n\n<Question number={1} label="Your turn">\n\n<Part label="a">\n\nHow fast is hydrogen consumed?\n\n<Answer>\n\n0.600 M/s\n\n</Answer>\n\n</Part>\n\n</Question>\n';

    expect(differences(tex(source), site)).toEqual([
      'section 1: number only in the source: 0.060',
      'section 1: number only on the site: 0.600',
    ]);
  });

  it('does not compare the wording of the introduction', () => {
    const source = `A long introduction written for a printed classroom worksheet.\n${SOURCE_QUESTION}`;

    expect(differences(tex(source), mdx(`Fresh words.\n\n${SITE_QUESTION}`))).toEqual([]);
  });
});

describe('sortDifferences', () => {
  const reason = 'the range is written out';

  it('separates the listed differences from the rest', () => {
    const lines = ['question 2: number only on the site: 5.8', 'question 3: number only in the source: 4'];

    const sorted = sortDifferences(lines, [{ line: 'question 2: number only on the site: 5.8', reason }]);

    expect(sorted.explained).toEqual([{ line: 'question 2: number only on the site: 5.8', reason }]);
    expect(sorted.unexplained).toEqual(['question 3: number only in the source: 4']);
    expect(sorted.unused).toEqual([]);
  });

  it('lets one listed line explain one difference, not two', () => {
    const line = 'question 2: number only on the site: 10';

    expect(sortDifferences([line, line], [{ line, reason }]).unexplained).toEqual([line]);
  });

  it('reports a listed difference that no longer occurs', () => {
    const line = 'question 2: number only on the site: 10';

    expect(sortDifferences([], [{ line, reason }]).unused).toEqual([line]);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/practice-audit.test.ts
```

Expected: the file fails to load, because `scripts/practice-audit.mjs` does not exist.

- [ ] **Step 3: Write the script**

Create `scripts/practice-audit.mjs`:

```js
// Compares a practice document on the site (MDX) with the LaTeX file it was
// converted from, question by question (the ladders: section by section):
//   - every number, with its sign and power of ten
//   - every chemical formula (\ce{...})
//   - how many parts and rubric lines each question has
//   - how much of the source's wording is still there
// It reads both files and changes neither. A difference is either a mistake in
// the conversion or a deliberate edit; deliberate ones are listed, with a
// reason each, in a JSON file given as the third argument.
//
//   node scripts/practice-audit.mjs <source.tex> <site.mdx> [expected.json]
//
// expected.json: { "expected": [ { "line": "<a line this script printed>", "reason": "..." } ] }
//
// Units are not compared: the source writes them three ways and the site a
// fourth. The fact-check reads every unit.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Below this share of the source's words, a question is reported. */
export const WORDING_FLOOR = 0.7;

const NUMBER = /[+-]?\d+(?:\.\d+)?(?:e-?\d+)?/g;
const POWER_OF_TEN = /\s*\\times\s*10\^\{?([+-]?)(\d+)\}?/g;
// A sign belongs to the number unless something it could be subtracted from
// or added to comes just before it.
const ENDS_A_VALUE = /[0-9A-Za-z)\]}]/;

/**
 * @param {string} text with units, formulas and markup already removed
 * @returns {string[]} every number, written one way: "2.0e-3", "-40", "+6"
 */
export function numberTokens(text) {
  const plain = text
    .replaceAll('−', '-')
    .replace(POWER_OF_TEN, (_match, sign, digits) => `e${sign === '-' ? '-' : ''}${digits}`);
  const tokens = [];
  for (const match of plain.matchAll(NUMBER)) {
    let token = match[0];
    if (token.startsWith('+') || token.startsWith('-')) {
      const before = plain.slice(0, match.index).trimEnd().at(-1);
      if (before !== undefined && ENDS_A_VALUE.test(before)) token = token.slice(1);
    }
    tokens.push(token);
  }
  return tokens;
}

/**
 * Takes every \ce{...} out of a text.
 * @param {string} text
 * @returns {{ formulas: string[], rest: string }}
 */
export function takeFormulas(text) {
  const formulas = [];
  let rest = '';
  let position = 0;
  for (;;) {
    const start = text.indexOf('\\ce{', position);
    if (start === -1) break;
    let depth = 0;
    let end = start + 3;
    for (; end < text.length; end += 1) {
      if (text[end] === '{') depth += 1;
      else if (text[end] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    if (end >= text.length) throw new Error(`A \\ce{ is never closed: ${text.slice(start, start + 40)}`);
    formulas.push(text.slice(start + 4, end).replace(/\s+/g, ' ').trim());
    rest += `${text.slice(position, start)} `;
    position = end + 1;
  }
  return { formulas, rest: rest + text.slice(position) };
}

/**
 * @param {string} text with markup already removed
 * @returns {Set<string>} its longer words, lowercase
 */
function longWords(text) {
  return new Set(text.toLowerCase().match(/[a-z]{5,}/g) ?? []);
}

/**
 * @param {string} text
 * @param {RegExp} startOfSegment global; each match starts a new segment
 * @returns {string[]} the text before the first match, then one piece per match
 */
function cut(text, startOfSegment) {
  const starts = [0, ...Array.from(text.matchAll(startOfSegment), (match) => match.index)];
  return starts.map((start, index) => text.slice(start, starts[index + 1]));
}

/**
 * @typedef {{ numbers: string[], formulas: string[], parts: number, rubricLines: number, words: Set<string> }} Facts
 */

/**
 * How a document is cut into pieces for comparison. Worksheets and the
 * free-response set are cut at each question. The ladders are cut at each
 * section, because a ladder's worked example belongs with its questions.
 * @typedef {'question' | 'section'} Piece
 */

/** @type {Record<Piece, { source: RegExp, site: RegExp }>} */
const STARTS = {
  question: {
    source: /\\problem(?![a-zA-Z])|\\frq\{|\\begin\{spiralstrip\}/g,
    site: /<Question\b/g,
  },
  section: {
    source: /\\section\*?\{/g,
    site: /^## /gm,
  },
};

/**
 * @param {string} mdx a practice document on the site
 * @returns {Piece} how to cut it, from the kind in its frontmatter
 */
export function pieceOf(mdx) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(mdx)?.[1] ?? '';
  return /^kind:\s*ladders\s*$/m.test(frontmatter) ? 'section' : 'question';
}

/**
 * A LaTeX practice document as one set of facts per piece. The first is
 * whatever comes before piece 1.
 * @param {string} tex
 * @param {Piece} [piece]
 * @returns {Facts[]}
 */
export function sourceFacts(tex, piece = 'question') {
  const start = tex.indexOf('\\begin{document}');
  const end = tex.indexOf('\\end{document}');
  if (start === -1 || end === -1) throw new Error('The source has no \\begin{document} ... \\end{document}.');
  if (/\\SIrange|\\numrange/.test(tex)) throw new Error('The source uses \\SIrange or \\numrange, which this audit does not read.');
  const body = tex.slice(start, end).replace(/(?<!\\)%.*$/gm, '');
  return cut(body, STARTS[piece].source).map((segment) => {
    const { formulas, rest } = takeFormulas(segment);
    const text = rest
      // Layout only: blank widths, line counts, heights, column rules and
      // headings the site words differently.
      .replace(/\\(answerblank|answerlines|workspace)\[[^\]]*\]/g, '\\$1')
      .replace(/\\begin\{(enumerate|yourturn|workedexample|apcnote)\}\[[^\]]*\]/g, ' ')
      .replace(/\\begin\{(tabular|spiralstrip)\}\{(?:[^{}]|\{[^{}]*\})*\}/g, ' ')
      .replace(/\\(vspace|needspace)\*?\{[^}]*\}/g, ' ')
      .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, ' ')
      // Units go; the numbers beside them stay.
      .replace(/\\SI\s*\{([^{}]*)\}\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, ' $1 ')
      .replace(/\\si\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, ' ')
      .replace(/\\num\s*\{([^{}]*)\}/g, ' $1 ')
      .replace(/\\textsuperscript\{[^}]*\}/g, ' ')
      .replace(/\\ced\{([^}]*)\}/g, ' $1 ')
      .replace(/---/g, ' ')
      .replace(/--/g, ' to ');
    return {
      numbers: numberTokens(text),
      formulas,
      parts: (segment.match(/\\item(?![a-zA-Z])/g) ?? []).length,
      rubricLines: (segment.match(/\\rpoint(?![a-zA-Z])/g) ?? []).length,
      // Environment and command names are markup, not wording.
      words: longWords(text.replace(/\\(?:begin|end)\{[^}]*\}/g, ' ').replace(/\\[a-zA-Z]+\*?/g, ' ')),
    };
  });
}

/**
 * A practice document on the site as one set of facts per piece. The first is
 * whatever comes before piece 1.
 * @param {string} mdx
 * @param {Piece} [piece]
 * @returns {Facts[]}
 */
export function siteFacts(mdx, piece = 'question') {
  const body = mdx.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  return cut(body, STARTS[piece].site).map((segment) => {
    const { formulas, rest } = takeFormulas(segment);
    const text = rest
      // Of a component's attributes, points and topics are content. The rest
      // (numbers, labels, titles) is the site's own.
      .replace(/<\/?[A-Z][A-Za-z]*\b[^>]*>/g, (tag) => {
        const points = /\bpoints=\{(\d+)\}/.exec(tag)?.[1] ?? '';
        const topics = /\btopic="([^"]*)"/.exec(tag)?.[1] ?? '';
        return ` ${points} ${topics.replaceAll(',', ' ')} `;
      })
      // Units go; the numbers beside them stay.
      .replace(/(\\text\{[^}]*\})\^(?:\{[^}]*\}|-?\d)/g, '$1');
    return {
      numbers: numberTokens(text),
      formulas,
      parts: (segment.match(/<Part\b/g) ?? []).length,
      rubricLines: (segment.match(/<RubricLine\b/g) ?? []).length,
      words: longWords(text.replace(/\\[a-zA-Z]+/g, ' ')),
    };
  });
}

/**
 * @param {string[]} left
 * @param {string[]} right
 * @returns {string[]} what is in left but not in right, counting repeats
 */
function missingFrom(left, right) {
  const spare = new Map();
  for (const item of right) spare.set(item, (spare.get(item) ?? 0) + 1);
  return left.filter((item) => {
    const count = spare.get(item) ?? 0;
    if (count === 0) return true;
    spare.set(item, count - 1);
    return false;
  });
}

/**
 * @param {string} tex the LaTeX source
 * @param {string} mdx the document on the site
 * @returns {string[]} one line per difference; empty when the two agree
 */
export function differences(tex, mdx) {
  const piece = pieceOf(mdx);
  const source = sourceFacts(tex, piece);
  const site = siteFacts(mdx, piece);
  const lines = [];
  if (source.length !== site.length) {
    lines.push(`the source has ${source.length - 1} ${piece}(s) and the site has ${site.length - 1}`);
  }
  for (let index = 0; index < Math.min(source.length, site.length); index += 1) {
    const from = source[index];
    const to = site[index];
    if (!from || !to) throw new Error(`Segment ${index} is missing on one side.`);
    const where = index === 0 ? `before ${piece} 1` : `${piece} ${index}`;
    for (const number of missingFrom(from.numbers, to.numbers)) lines.push(`${where}: number only in the source: ${number}`);
    for (const number of missingFrom(to.numbers, from.numbers)) lines.push(`${where}: number only on the site: ${number}`);
    for (const formula of missingFrom(from.formulas, to.formulas)) lines.push(`${where}: formula only in the source: ${formula}`);
    for (const formula of missingFrom(to.formulas, from.formulas)) lines.push(`${where}: formula only on the site: ${formula}`);
    if (from.parts !== to.parts) lines.push(`${where}: the source has ${from.parts} part(s) and the site has ${to.parts}`);
    if (from.rubricLines !== to.rubricLines) {
      lines.push(`${where}: the source has ${from.rubricLines} rubric line(s) and the site has ${to.rubricLines}`);
    }
    // The introduction is written fresh for the site, so its wording is not compared.
    if (index > 0 && from.words.size > 0) {
      const kept = [...from.words].filter((word) => to.words.has(word)).length / from.words.size;
      if (kept < WORDING_FLOOR) {
        lines.push(`${where}: only ${Math.round(kept * 100)}% of the source's wording is on the site`);
      }
    }
  }
  return lines;
}

/**
 * Sorts the differences into those listed as deliberate and those that are not.
 * @param {string[]} lines what differences() found
 * @param {{ line: string, reason: string }[]} expected the deliberate ones
 * @returns {{ unexplained: string[], explained: { line: string, reason: string }[], unused: string[] }}
 *   unused: expected lines that did not occur, which means the list is out of date
 */
export function sortDifferences(lines, expected) {
  const waiting = [...expected];
  const unexplained = [];
  const explained = [];
  for (const line of lines) {
    const found = waiting.findIndex((entry) => entry.line === line);
    if (found === -1) {
      unexplained.push(line);
    } else {
      explained.push(...waiting.splice(found, 1));
    }
  }
  return { unexplained, explained, unused: waiting.map((entry) => entry.line) };
}

/**
 * @param {string} file
 * @returns {{ line: string, reason: string }[]}
 */
function readExpected(file) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = parsed?.expected;
  if (!Array.isArray(entries)) throw new Error(`${file} must hold { "expected": [ ... ] }.`);
  for (const entry of entries) {
    const ok = typeof entry?.line === 'string' && typeof entry?.reason === 'string' && entry.reason.trim() !== '';
    if (!ok) throw new Error(`${file}: every expected difference needs a "line" and a "reason". Got ${JSON.stringify(entry)}.`);
  }
  return entries;
}

function main() {
  const [texFile, mdxFile, expectedFile] = process.argv.slice(2);
  if (!texFile || !mdxFile) {
    console.error('Usage: node scripts/practice-audit.mjs <source.tex> <site.mdx> [expected.json]');
    process.exit(2);
  }
  const lines = differences(fs.readFileSync(texFile, 'utf8'), fs.readFileSync(mdxFile, 'utf8'));
  const { unexplained, explained, unused } = sortDifferences(lines, expectedFile ? readExpected(expectedFile) : []);
  for (const { line, reason } of explained) console.log(`expected   ${line}\n           (${reason})`);
  for (const line of unexplained) console.error(`DIFFERENT  ${line}`);
  for (const line of unused) console.error(`STALE      listed as expected but not found: ${line}`);
  console.log(
    `practice-audit: ${lines.length} difference(s), ${explained.length} expected, ${unexplained.length} unexplained, ${unused.length} stale`,
  );
  if (unexplained.length > 0 || unused.length > 0) process.exit(1);
}

// Real paths on both sides, as in check-dist.mjs: a plain comparison fails when
// the script is reached through a link, and it would then do nothing and succeed.
const entryPoint = process.argv[1];
if (entryPoint && fs.realpathSync(entryPoint) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
```

- [ ] **Step 4: Run it and watch it pass**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx vitest run tests/unit/practice-audit.test.ts
```

Expected: every test in the file passes.

- [ ] **Step 5: Commit**

```bash
git add scripts/practice-audit.mjs tests/unit/practice-audit.test.ts
git commit -m "feat(tools): add an audit that compares converted practice with its LaTeX source"
```

### Task 4: The practice pages, with Worksheet 1 as the first document

> **As carried out (2026-11-13).** The files printed below are what was first committed. Two reviews and two fact-checks then changed them; read the repository for the current versions. What changed:
> - **Search:** answers and rubrics carry `data-pagefind-ignore`, so a search excerpt cannot show a worked answer.
> - **Unit page:** a practice document's topics sit under its title (`.practice-list .topic-meta`).
> - **Build check:** a page's stated total (`points` in the frontmatter) must equal the sum of its questions' points; an empty answer is reported wherever it sits. (Task 2's code changed with this.)
> - **`orderedPractice`** in `src/lib/practice-id.ts` now holds the ordering and validation of a unit's practice, with unit tests; `practiceForUnit` calls it. One pattern, `TOPIC_CODE`, says what a topic code looks like for lessons and practice alike.
> - **A practice file in a unit with no lesson** stops the build with a message that says why.
> - **Smaller:** the question heading has no `id`; `Figure` is not supplied to practice documents (none has a figure); the print rule is scoped to `.practice`; part letters line up by `align-items: baseline`.
> - **Worksheet 1:** eight wording points from the fact-check (listed in pull request 12), and "Five short items" above the quick review, since it is one question with five parts. Write "items" in Worksheets 2 to 4 as well.
> - **Totals after this group:** 325 unit tests and 342 browser tests.

The Astro pieces cannot be unit-tested; they are tested in the browser against the built site, and a page needs a document to show. So this task adds the browser test, then everything it needs, ending with Worksheet 1.

**Files:**
- Test: `tests/e2e/practice.spec.ts`
- Modify: `src/content.config.ts`, `src/layouts/Base.astro`, `src/styles/print.css`, `src/pages/[unit]/index.astro`, `src/components/lesson/PracticeNext.astro`
- Create: `src/lib/practice.ts`, the seven files in `src/components/practice/`, `src/layouts/PracticeLayout.astro`, `src/pages/[unit]/practice/[name].astro`, `src/styles/practice.css`, `src/content/practice/unit-5/worksheet-1-rates-and-rate-laws.mdx`

- [ ] **Step 1: Write the failing browser test**

Create `tests/e2e/practice.spec.ts`:

```ts
import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Checks that hold for every practice document, whatever it asks. The list
// comes from the files, so a new document gets its own tests the day it is added.
const UNIT = '/unit-5-kinetics/';
const PRACTICE_FILES = new URL('../../src/content/practice/unit-5/', import.meta.url);
const paths = fs
  .readdirSync(PRACTICE_FILES)
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => `${UNIT}practice/${name.replace(/\.mdx$/, '')}/`)
  .sort();
const WORKSHEET_1 = `${UNIT}practice/worksheet-1-rates-and-rate-laws/`;

test('the unit page links to every practice document that has a file, and to no other', async ({ page }) => {
  await page.goto(UNIT);

  const linked = await page.locator('.practice-list a').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );

  expect(paths.length).toBeGreaterThanOrEqual(1);
  expect([...linked].sort()).toEqual(paths);
});

for (const path of paths) {
  test(`${path} renders its math, keeps its answers closed, fits the screen and is accessible`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('.katex-error').count(), 'math that failed to render').toBe(0);
    expect(await page.locator('[data-part="question"]').count(), 'questions').toBeGreaterThanOrEqual(1);
    expect(await page.locator('details[open]').count(), 'answers open before the student asks').toBe(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'sideways scrolling').toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

for (const path of paths) {
  // A long equation written inside a sentence cannot wrap or scroll, so it
  // pushes the whole page sideways. Answers are opened first: a closed one
  // takes no space, so its math would not be measured.
  test(`${path} does not scroll sideways on the narrowest phones with every answer open`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      for (const details of document.querySelectorAll('details')) details.open = true;
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(0);
  });

  test(`${path} is accessible with every answer open`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => {
      for (const details of document.querySelectorAll('details')) details.open = true;
    });

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

test('an answer stays hidden until "Show answer" is chosen', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const first = page.locator('[data-part="answer"]').first();
  await expect(first.locator('.answer-body')).toBeHidden();

  await first.locator('summary').click();

  await expect(first.locator('.answer-body')).toBeVisible();
  await expect(first.locator('.answer-body')).toContainText('M/s');
});

test('an answer opens from the keyboard', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const first = page.locator('[data-part="answer"]').first();

  await first.locator('summary').focus();
  await page.keyboard.press('Enter');

  await expect(first.locator('.answer-body')).toBeVisible();
});

test('a question names its topic and links to that lesson', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const link = page.locator('[data-part="question"]').first().getByRole('link', { name: '5.1 Reaction Rates' });

  await link.click();

  await expect(page).toHaveURL(/\/unit-5-kinetics\/5-1-reaction-rates\/$/);
});

test('a lesson ends with a link to the practice for its topic', async ({ page }) => {
  await page.goto(`${UNIT}5-1-reaction-rates/`);

  await page.locator('[data-part="practice-next"]').getByRole('link', { name: 'Worksheet 1: Rates and rate laws' }).click();

  await expect(page).toHaveURL(new RegExp(`${WORKSHEET_1}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Worksheet 1: Rates and rate laws');
});

test('a practice page lists the unit\'s practice and marks the one being read', async ({ page }) => {
  await page.goto(WORKSHEET_1);

  const current = page.getByRole('navigation', { name: 'Unit 5 practice' }).locator('[aria-current="page"]');

  await expect(current).toHaveText('Worksheet 1: Rates and rate laws');
});

// Playwright's print emulation applies the @media print CSS, which is all a
// practice page relies on.
test('a printed practice page carries the answers that are open and leaves out the closed ones', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const answers = page.locator('[data-part="answer"]');
  await answers.nth(0).locator('summary').click();

  await page.emulateMedia({ media: 'print' });

  await expect(answers.nth(0).locator('.answer-body')).toBeVisible();
  await expect(answers.nth(0).locator('summary')).toBeHidden();
  await expect(answers.nth(1)).toBeHidden();
  await expect(page.locator('.print-note')).toBeHidden();
});

test('search finds every practice document by its title', async ({ page }) => {
  test.slow();
  await page.goto(UNIT);
  const documents = await page.locator('.practice-list a').evaluateAll((links) =>
    links.map((link) => ({ path: link.getAttribute('href'), title: link.textContent?.trim() ?? '' })),
  );
  expect(documents.length).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Search' }).click();
  const input = page.locator('.pagefind-ui__search-input');
  const more = page.locator('.pagefind-ui__button');

  for (const { path, title } of documents) {
    if (!path || !title) throw new Error(`A practice link has no address or no text: ${JSON.stringify({ path, title })}`);
    await input.fill(title);
    // Wait for this query's results: the last query's are still on screen
    // until Pagefind answers, and could satisfy the check below.
    await expect(page.locator('.pagefind-ui__message')).toContainText(`for ${title}`);
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const result = page.locator(`.pagefind-ui__result-link[href*="${path}"]`).first();
    while (!(await result.isVisible()) && (await more.isVisible())) await more.click();

    await expect(result, title).toBeVisible();
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a practice page is readable and its answers can be opened', async ({ page }) => {
    await page.goto(WORKSHEET_1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Worksheet 1: Rates and rate laws');
    const first = page.locator('[data-part="answer"]').first();

    await first.locator('summary').click();

    await expect(first.locator('.answer-body')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npx playwright test tests/e2e/practice.spec.ts
```

Expected: the file fails to load with `ENOENT: no such file or directory, scandir` for `src/content/practice/unit-5/`. There is no practice yet.

- [ ] **Step 3: Add the collection**

Replace `src/content.config.ts` with:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { topicByCode } from './data/units';
import { PRACTICE_KINDS } from './lib/practice-id';

const topicCode = z
  .string()
  .regex(/^[1-9]\.\d{1,2}$/, 'topic must look like "5.2"')
  .refine((code) => topicByCode(code) !== undefined, {
    message: 'topic is not one of the AP topics in src/data/units.ts',
  });

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    // The title and unit come from src/data/units.ts, looked up by this code.
    topic: topicCode,
    minutes: z.number().int().min(1).max(60),
    summary: z.string().min(20).max(200),
  }),
});

const practice = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/practice' }),
  schema: z.object({
    // The unit comes from the folder the file sits in (unit-5/).
    title: z.string().min(3).max(80),
    kind: z.enum(PRACTICE_KINDS),
    /** Where the document sits in its unit's list of practice, counting from 1. */
    order: z.number().int().min(1),
    topics: z.array(topicCode).min(1),
    summary: z.string().min(20).max(200),
    /** Total points, for a document that is scored. */
    points: z.number().int().min(1).optional(),
    /** Suggested time, for a document meant to be timed. */
    minutes: z.number().int().min(1).max(180).optional(),
  }),
});

export const collections = { lessons, practice };
```

The only change to the lessons collection is that its topic rule now has a name, `topicCode`, so the practice collection can use it too.

- [ ] **Step 4: Read the collection**

Create `src/lib/practice.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { topicByCode, type Unit } from '../data/units';
import { practiceIdParts } from './practice-id';

export type Practice = CollectionEntry<'practice'>;

function idParts(doc: Practice): { unit: number; slug: string } {
  const parts = practiceIdParts(doc.id);
  if (!parts) {
    throw new Error(
      `Practice file ${doc.filePath ?? doc.id} is filed as ${doc.id}. ` +
        'Name it unit-<number>/<slug>.mdx, where <slug> is lowercase letters, digits and hyphens.',
    );
  }
  return parts;
}

/** The number of the unit whose folder a practice document sits in. */
export function practiceUnitNumber(doc: Practice): number {
  return idParts(doc).unit;
}

/** "unit-5/worksheet-1-rates" -> "worksheet-1-rates": the last URL segment. */
export function practiceSlug(doc: Practice): string {
  return idParts(doc).slug;
}

export function practicePath(unitSlug: string, doc: Practice): string {
  return `/${unitSlug}/practice/${practiceSlug(doc)}/`;
}

/**
 * A unit's practice documents in the order they are listed. A document that
 * names a topic outside its unit, or shares its place in the list with
 * another, is an error: both would otherwise show up as a quietly wrong page.
 */
export async function practiceForUnit(unit: Unit): Promise<Practice[]> {
  const docs = (await getCollection('practice')).filter((doc) => practiceUnitNumber(doc) === unit.number);
  const codes = new Set(unit.topics.map((topic) => topic.code));
  const byOrder = new Map<number, Practice>();
  for (const doc of docs) {
    const stray = doc.data.topics.find((code) => !codes.has(code));
    if (stray) {
      throw new Error(`Practice file ${doc.id} lists topic ${stray}, which is not a topic of Unit ${unit.number}.`);
    }
    const clash = byOrder.get(doc.data.order);
    if (clash) {
      throw new Error(
        `Two practice files in Unit ${unit.number} have order ${doc.data.order}: ${clash.id} and ${doc.id}. Give each its own number.`,
      );
    }
    byOrder.set(doc.data.order, doc);
  }
  return [...docs].sort((a, b) => a.data.order - b.data.order);
}

/** The practice that covers one topic, as links for the end of its lesson. */
export async function practiceForTopic(code: string): Promise<{ title: string; href: string }[]> {
  const found = topicByCode(code);
  if (!found) throw new Error(`Topic ${code} is not one of the AP topics in src/data/units.ts.`);
  const docs = await practiceForUnit(found.unit);
  return docs
    .filter((doc) => doc.data.topics.includes(code))
    .map((doc) => ({ title: doc.data.title, href: practicePath(found.unit.slug, doc) }));
}
```

- [ ] **Step 5: Add the blocks**

Create `src/components/practice/Beyond.astro`:

```astro
---
// Marks a question, or one part of it, that the AP framework leaves off the
// exam. The teacher keeps such items on the site, always under this label.
---

<p class="beyond" data-part="beyond">
  <strong>Beyond the exam.</strong>{' '}The AP exam does not ask for this. It is here if you want to go further.
</p>
```

Create `src/components/practice/Question.astro`:

```astro
---
import Beyond from './Beyond.astro';
import { topicByCode } from '../../data/units';
import { lessonPath, lessonsByTopic } from '../../lib/lessons';
import { parseTopics } from '../../lib/practice-id';

interface Props {
  number: number;
  /** The heading word: "Question" unless the document names its questions differently. */
  label?: string;
  /** A few words after the number, for example "Rate law from initial rates". */
  title?: string;
  /** AP topic codes: "5.1", or "5.7, 5.8" for more than one. */
  topic?: string;
  /** What the question is worth, when it is scored. Its rubric must add up to this. */
  points?: number;
  /** True when the AP exam does not ask for this. */
  beyond?: boolean;
}
const { number, label = 'Question', title, topic, points, beyond = false } = Astro.props;
const name = `${label} ${number}`;
const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

if (!(Number.isInteger(number) && number >= 1)) {
  throw new Error(`A question's number must be a whole number from 1 up. Got ${JSON.stringify(number)}.`);
}
if (points !== undefined && !(Number.isInteger(points) && points >= 1)) {
  throw new Error(`${name}: points must be a whole number from 1 up. Got ${JSON.stringify(points)}.`);
}

const lessons = await lessonsByTopic();
const topics = (topic === undefined ? [] : parseTopics(topic)).map((code) => {
  const found = topicByCode(code);
  if (!found) throw new Error(`${name} names topic ${code}, which is not one of the AP topics in src/data/units.ts.`);
  const lesson = lessons.get(code);
  return {
    code,
    // The visible text is only the code, so the link's name adds the title.
    name: `${code} ${found.topic.title}`,
    href: lesson ? lessonPath(found.unit.slug, lesson) : undefined,
  };
});
---

<section class="question" data-part="question" data-points={points}>
  <h3 id={id}>{title ? `${name}: ${title}` : name}</h3>
  {
    (topics.length > 0 || points !== undefined) && (
      <p class="question-meta">
        {topics.length > 0 && (
          <span>
            {topics.length === 1 ? 'Topic ' : 'Topics '}
            {topics.map((t, index) => (
              <>
                {index > 0 && ', '}
                {t.href ? (
                  <a href={t.href} aria-label={t.name}>{t.code}</a>
                ) : (
                  t.code
                )}
              </>
            ))}
          </span>
        )}
        {points !== undefined && <span>{points === 1 ? '1 point' : `${points} points`}</span>}
      </p>
    )
  }
  {beyond && <Beyond />}
  <slot />
</section>
```

Create `src/components/practice/Part.astro`:

```astro
---
import Beyond from './Beyond.astro';

interface Props {
  /** One lowercase letter: "a" shows as (a). */
  label: string;
  /** True when the AP exam does not ask for this part. */
  beyond?: boolean;
}
const { label, beyond = false } = Astro.props;
if (!/^[a-z]$/.test(label)) {
  throw new Error(`A part's label must be one lowercase letter, for example "a". Got ${JSON.stringify(label)}.`);
}
---

<div class="part" data-part="part">
  <p class="part-label">({label})</p>
  <div class="part-body">
    {beyond && <Beyond />}
    <slot />
  </div>
</div>
```

Create `src/components/practice/Answer.astro`:

```astro
---
// The answer and worked solution, closed until the student asks for it. A
// native <details>, so it opens without JavaScript.
---

<details class="answer" data-part="answer">
  <summary>Show answer</summary>
  <div class="answer-body"><slot /></div>
</details>
```

Create `src/components/practice/Rubric.astro`:

```astro
---
// How a scored question earns its points: one RubricLine per line. The build
// check fails when the lines do not add up to the question's points.
---

<details class="answer rubric" data-part="rubric">
  <summary>Show scoring rubric</summary>
  <ul class="answer-body"><slot /></ul>
</details>
```

Create `src/components/practice/RubricLine.astro`:

```astro
---
interface Props {
  /** The part this line scores, as its letter. Left out when a question has no parts. */
  part?: string;
  points: number;
}
const { part, points } = Astro.props;
if (!(Number.isInteger(points) && points >= 1)) {
  throw new Error(`A rubric line's points must be a whole number from 1 up. Got ${JSON.stringify(points)}.`);
}
if (part !== undefined && !/^[a-z]$/.test(part)) {
  throw new Error(`A rubric line's part must be one lowercase letter, for example "a". Got ${JSON.stringify(part)}.`);
}
const worth = points === 1 ? '1 point' : `${points} points`;
---

<li data-rubric-points={points}><strong>{part ? `(${part}) ${worth}.` : `${worth}.`}</strong>{' '}<slot /></li>
```

Create `src/components/practice/Blank.astro`:

```astro
---
// The gap in a fill-in sentence. Drawn as a line; read aloud as "blank".
---

<span class="blank"><span class="visually-hidden">blank</span></span>
```

In `Question.astro`, `'Topic '` and `'Topics '` carry their own space, and in `Beyond.astro` and `RubricLine.astro` the space after `</strong>` is written `{' '}`: Astro drops a space between text and an element on the next line, and `check-dist` then fails the build on "words run together".

- [ ] **Step 6: Add the page around a document, and the route**

Create `src/layouts/PracticeLayout.astro`:

```astro
---
import type { MarkdownHeading } from 'astro';
import Base from './Base.astro';
import type { Unit } from '../data/units';
import { practiceForUnit, practicePath, type Practice } from '../lib/practice';
import { kindLabel, topicsLabel } from '../lib/practice-id';

interface Props {
  unit: Unit;
  doc: Practice;
  headings: MarkdownHeading[];
}
const { unit, doc, headings } = Astro.props;

const docs = await practiceForUnit(unit);
const position = docs.findIndex((other) => other.id === doc.id);
if (position === -1) throw new Error(`Practice file ${doc.id} is not among Unit ${unit.number}'s practice.`);
const prev = docs[position - 1];
const next = docs[position + 1];
const sections = headings.filter((h) => h.depth === 2);
const facts = [
  topicsLabel(doc.data.topics),
  doc.data.points === undefined ? undefined : `${doc.data.points} points`,
  doc.data.minutes === undefined ? undefined : `about ${doc.data.minutes} min`,
].filter((fact) => fact !== undefined);
---

<Base
  title={`${doc.data.title} | Unit ${unit.number} practice | ChemStudy`}
  description={doc.data.summary}
  unit={unit.number}
>
  <div class="lesson-grid">
    <article class="lesson prose practice" data-practice={doc.data.kind} data-pagefind-body>
      <p class="kicker">Unit {unit.number} practice · {kindLabel(doc.data.kind)}</p>
      <h1>{doc.data.title}</h1>
      <p class="practice-facts">{facts.join(' · ')}</p>
      <slot />
      <p class="print-note" data-pagefind-ignore>
        Printing this page? Answers you have opened are printed. Closed ones are left out.
      </p>
      <nav class="prev-next" aria-label="Previous and next practice" data-pagefind-ignore>
        {prev ? <a rel="prev" href={practicePath(unit.slug, prev)}>← {prev.data.title}</a> : <span />}
        {
          next ? (
            <a rel="next" href={practicePath(unit.slug, next)}>{next.data.title} →</a>
          ) : (
            <a href={`/${unit.slug}/`}>Back to Unit {unit.number} →</a>
          )
        }
      </nav>
    </article>

    <nav class="topic-nav" aria-label={`Unit ${unit.number} practice`}>
      <p class="eyebrow"><a href={`/${unit.slug}/`}>Unit {unit.number} · {unit.title}</a></p>
      <ol>
        {
          docs.map((other) => (
            <li class:list={{ current: other.id === doc.id }}>
              <a href={practicePath(unit.slug, other)} aria-current={other.id === doc.id ? 'page' : undefined}>
                {other.data.title}
              </a>
            </li>
          ))
        }
      </ol>
    </nav>

    {
      sections.length > 0 && (
        <nav class="section-nav" aria-label="On this page">
          <p class="eyebrow">On this page</p>
          <ul>
            {sections.map((h) => (
              <li>
                <a href={`#${h.slug}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )
    }
  </div>
</Base>
```

Create `src/pages/[unit]/practice/[name].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import PracticeLayout from '../../../layouts/PracticeLayout.astro';
import Figure from '../../../components/lesson/Figure.astro';
import Worked from '../../../components/lesson/Worked.astro';
import Answer from '../../../components/practice/Answer.astro';
import Blank from '../../../components/practice/Blank.astro';
import Part from '../../../components/practice/Part.astro';
import Question from '../../../components/practice/Question.astro';
import Rubric from '../../../components/practice/Rubric.astro';
import RubricLine from '../../../components/practice/RubricLine.astro';
import { units, type Unit } from '../../../data/units';
import { practiceSlug, practiceUnitNumber, type Practice } from '../../../lib/practice';

export async function getStaticPaths() {
  const docs = await getCollection('practice');
  return docs.map((doc) => {
    const number = practiceUnitNumber(doc);
    const unit = units.find((candidate) => candidate.number === number);
    if (!unit) throw new Error(`Practice file ${doc.id} sits in a folder for Unit ${number}, which is not in src/data/units.ts.`);
    return { params: { unit: unit.slug, name: practiceSlug(doc) }, props: { unit, doc } };
  });
}

interface Props {
  unit: Unit;
  doc: Practice;
}
const { unit, doc } = Astro.props;
const { Content, headings } = await render(doc);
// Supplied to every practice document, so the files need no imports.
const blocks = { Answer, Blank, Figure, Part, Question, Rubric, RubricLine, Worked };
---

<PracticeLayout unit={unit} doc={doc} headings={headings}>
  <Content components={blocks} />
</PracticeLayout>
```

The layout reuses the lesson page's grid (`lesson-grid`, `topic-nav`, `section-nav`, `prev-next`), so a practice page sits on the screen exactly as a lesson does. It does not pass a topic to `Base`, so a practice page records no progress and the build check does not ask it for a lesson's parts.

- [ ] **Step 7: Add the styles**

Create `src/styles/practice.css`:

```css
/* Practice pages. A question is a card, like a worked example. Its parts sit
   in two columns: the letter, then the work. */
.practice-facts,
.question-meta,
.part-label,
.print-note {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
}
.prose .practice-facts {
  margin-top: 0.5rem;
}

.question {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.1rem 1.25rem 1.25rem;
}
.question > * + * {
  margin-top: 0.8em;
}
.prose .question h3 {
  margin-top: 0;
}
.question > .question-meta {
  margin-top: 0.2rem;
}
.question-meta span + span::before {
  content: ' · ';
}

.part {
  display: grid;
  grid-template-columns: 1.9rem minmax(0, 1fr);
}
.part + .part {
  margin-top: 1.1em;
  padding-top: 1.1em;
  border-top: 1px solid var(--line);
}
/* The letter lines up with the first line of the part, which is set larger. */
.part-label {
  line-height: calc(1em * 1.65 / 0.82);
}
.part-body > * + * {
  margin-top: 0.6em;
}

.blank {
  display: inline-block;
  width: 4.5rem;
  border-bottom: 1px solid currentColor;
}

.answer > summary {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
  cursor: pointer;
}
.answer-body {
  margin-top: 0.5rem;
  padding-left: 0.9rem;
  border-left: 3px solid var(--u);
}
.answer-body > * + * {
  margin-top: 0.6em;
}
.prose ul.answer-body {
  list-style: none;
  padding-left: 0.9rem;
}

.beyond {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  background: var(--u-tint);
  border-radius: var(--radius);
  padding: 0.5rem 0.8rem;
}

.prose .print-note {
  margin-top: 2.5em;
}

/* The unit page's list of practice. */
.unit-practice {
  margin-top: 3rem;
}
.practice-list {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
}
.practice-list > li {
  display: grid;
  gap: 0.2rem;
  padding-block: 1rem;
  border-top: 1px solid var(--line);
}
.practice-list > li:last-child {
  border-bottom: 1px solid var(--line);
}
.practice-list a {
  font-family: var(--font-head);
  font-size: var(--step-1);
  text-decoration: none;
}
.practice-list a:hover {
  text-decoration: underline;
}
```

In `src/layouts/Base.astro`, add one import after the line `import '../styles/diagram.css';`:

```astro
import '../styles/practice.css';
```

In `src/styles/print.css`, add this rule just before the last rule in the file (`[data-part] { break-inside: avoid; }`), inside the `@media print` block:

```css
  /* A practice page prints as it stands: an answer the student has opened is
     on the paper and a closed one is left off, so the same page prints as a
     blank worksheet or as a key. */
  .answer:not([open]),
  .answer[open] > summary,
  .print-note {
    display: none;
  }
```

- [ ] **Step 8: List a unit's practice on its page**

Replace `src/pages/[unit]/index.astro` with:

```astro
---
import Base from '../../layouts/Base.astro';
import { units, type Unit } from '../../data/units';
import { lessonPath, lessonsByTopic } from '../../lib/lessons';
import { practiceForUnit, practicePath } from '../../lib/practice';
import { topicsLabel } from '../../lib/practice-id';

export async function getStaticPaths() {
  const lessons = await lessonsByTopic();
  // A unit gets a page once it has at least one lesson.
  return units
    .filter((unit) => unit.topics.some((t) => lessons.has(t.code)))
    .map((unit) => ({ params: { unit: unit.slug }, props: { unit } }));
}

interface Props {
  unit: Unit;
}
const { unit } = Astro.props;
const lessons = await lessonsByTopic();
const practice = await practiceForUnit(unit);
---

<Base
  title={`Unit ${unit.number}: ${unit.title} | ChemStudy`}
  description={unit.blurb}
  unit={unit.number}
>
  <article class="unit-page">
    <p class="kicker">Unit {unit.number}</p>
    <h1>{unit.title}</h1>
    <p class="lede">{unit.blurb}</p>
    <ol class="topic-list">
      {
        unit.topics.map((topic) => {
          const lesson = lessons.get(topic.code);
          return (
            <li data-topic-link={topic.code}>
              <span class="topic-code">{topic.code}</span>
              {lesson ? (
                <a href={lessonPath(unit.slug, lesson)}>{topic.title}</a>
              ) : (
                <span>{topic.title}</span>
              )}
              <span class="topic-meta">
                {lesson ? `${lesson.data.minutes} min` : 'Coming soon'}
                <span class="done-mark"> · Done</span>
              </span>
            </li>
          );
        })
      }
    </ol>
    {
      practice.length > 0 && (
        <section class="unit-practice">
          <h2>Practice</h2>
          <ul class="practice-list">
            {practice.map((doc) => (
              <li>
                <a href={practicePath(unit.slug, doc)}>{doc.data.title}</a>
                <span class="topic-meta">{topicsLabel(doc.data.topics)}</span>
              </li>
            ))}
          </ul>
        </section>
      )
    }
  </article>
</Base>
```

The list has its own class, `practice-list`. `all-lessons.spec.ts` counts the links in `.topic-list` and expects lessons only.

- [ ] **Step 9: Make "Practice next" list the practice for its lesson**

Replace `src/components/lesson/PracticeNext.astro` with:

```astro
---
import { practiceForTopic } from '../../lib/practice';
import { topicFromLessonPath } from '../../lib/practice-id';

// A lesson file writes <PracticeNext /> with nothing else, so the topic comes
// from the address of the page being built.
const topic = topicFromLessonPath(Astro.url.pathname);
if (!topic) {
  throw new Error(`PracticeNext belongs at the end of a lesson. ${Astro.url.pathname} is not a lesson's address.`);
}
const items = await practiceForTopic(topic);
---

<section class="practice-next" data-part="practice-next">
  <h2 id="practice-next">Practice next</h2>
  {
    items.length > 0 ? (
      <ul>
        {items.map((item) => (
          <li>
            <a href={item.href}>{item.title}</a>
          </li>
        ))}
      </ul>
    ) : (
      <p>Practice questions for this topic are on their way.</p>
    )
  }
</section>
```

- [ ] **Step 10: Add Worksheet 1**

Create `src/content/practice/unit-5/worksheet-1-rates-and-rate-laws.mdx`. It was converted from `worksheets/u05-ws1.tex` while this plan was written, to try the guide; read the two side by side before converting anything else. Its `order` is 2 because the ladders, which arrive in Group C, are first.

```mdx
---
title: "Worksheet 1: Rates and rate laws"
kind: worksheet
order: 2
topics: ["5.1", "5.2"]
summary: Eight questions on relating the rates of the substances in a reaction and finding a rate law from initial-rate data, with a short review at the end.
---

Work each question on paper before you open its answer. One idea runs through all of them: reaction orders come from data, never from the coefficients of the balanced equation.

You will need these two relationships.

$$
\text{rate} = -\tfrac{1}{a}\frac{\Delta[\ce{A}]}{\Delta t} = +\tfrac{1}{c}\frac{\Delta[\ce{C}]}{\Delta t}
$$

$$
\text{rate} = k[\ce{A}]^m[\ce{B}]^n
$$

## Questions

<Question number={1} topic="5.1">

Dinitrogen pentoxide decomposes:

$$
\ce{2N2O5(g) -> 4NO2(g) + O2(g)}
$$

Oxygen forms at $2.0 \times 10^{-3}\ \text{M/s}$.

<Part label="a">

The rate of the reaction: <Blank />

<Answer>

$2.0 \times 10^{-3}\ \text{M/s}$

</Answer>

</Part>

<Part label="b">

The rate of disappearance of $\ce{N2O5}$: <Blank />

<Answer>

$4.0 \times 10^{-3}\ \text{M/s}$

</Answer>

</Part>

<Part label="c">

The rate of appearance of $\ce{NO2}$: <Blank />

<Answer>

$8.0 \times 10^{-3}\ \text{M/s}$

</Answer>

</Part>

<Part label="d">

Why do the three numbers differ?

<Answer>

Each species is consumed or formed at a rate set by its coefficient. Dividing each rate by its coefficient gives one common value, the reaction rate. That is why the convention exists.

</Answer>

</Part>

</Question>

<Question number={2} topic="5.1">

For $\ce{N2 + 3H2 -> 2NH3}$, $\ce{H2}$ is consumed at 0.030 M/s. Find the reaction rate and the rate of formation of $\ce{NH3}$.

<Answer>

The reaction rate:

$$
(1/3)(0.030) = \mathbf{0.010}\ \text{M/s}
$$

The rate at which $\ce{NH3}$ forms:

$$
2(0.010) = \mathbf{0.020}\ \text{M/s}
$$

</Answer>

</Question>

<Question number={3} topic="5.1">

A plot of $[\ce{A}]$ against time is steep at first and then flattens.

<Part label="a">

The average rate is the slope of: <Blank />

<Answer>

a straight line between two points

</Answer>

</Part>

<Part label="b">

The instantaneous rate is the slope of: <Blank />

<Answer>

the tangent at that point

</Answer>

</Part>

<Part label="c">

Why does the curve flatten?

<Answer>

Reactant is being consumed, so its concentration decreases with time. The frequency of reactive collisions decreases with it.

</Answer>

</Part>

<Part label="d">

Why are rate laws determined from *initial* rates?

<Answer>

At $t=0$ no product has built up, so there is no reverse reaction and no interference from products to complicate the measurement.

</Answer>

</Part>

</Question>

<Question number={4} topic="5.2">

Use the data to find the rate law and $k$.

| Experiment | $[\ce{A}]_0$ (M) | $[\ce{B}]_0$ (M) | Rate (M/s) |
|---|---|---|---|
| 1 | 0.10 | 0.10 | $2.0 \times 10^{-3}$ |
| 2 | 0.20 | 0.10 | $8.0 \times 10^{-3}$ |
| 3 | 0.10 | 0.20 | $4.0 \times 10^{-3}$ |

<Part label="a">

The order in A, with the comparison you used.

<Answer>

The order in A is 2. Comparing experiments 1 and 2, only $[\ce{A}]$ changed: doubling it multiplied the rate by 4, and $4 = 2^2$.

</Answer>

</Part>

<Part label="b">

The order in B: <Blank />

<Answer>

1

</Answer>

</Part>

<Part label="c">

The overall order: <Blank />

<Answer>

3

</Answer>

</Part>

<Part label="d">

The rate law: <Blank />

<Answer>

$\text{rate} = k[\ce{A}]^2[\ce{B}]$

</Answer>

</Part>

<Part label="e">

Calculate $k$, with units.

<Answer>

$$
\begin{aligned}
k &= \frac{2.0 \times 10^{-3}}{(0.10)^2(0.10)} = \frac{2.0 \times 10^{-3}}{1.0 \times 10^{-3}} \\
&= \mathbf{2.0}\ \text{M}^{-2}\,\text{s}^{-1}
\end{aligned}
$$

</Answer>

</Part>

</Question>

<Question number={5} topic="5.2">

Here are the data for a second reaction.

| Experiment | $[\ce{X}]_0$ (M) | $[\ce{Y}]_0$ (M) | Rate (M/s) |
|---|---|---|---|
| 1 | 0.20 | 0.10 | $1.5 \times 10^{-2}$ |
| 2 | 0.40 | 0.10 | $3.0 \times 10^{-2}$ |
| 3 | 0.20 | 0.20 | $1.5 \times 10^{-2}$ |

<Part label="a">

The rate law: <Blank />

<Answer>

$\text{rate} = k[\ce{X}]$

</Answer>

</Part>

<Part label="b">

The value of $k$, with units: <Blank />

<Answer>

$0.075\ \text{s}^{-1}$

</Answer>

</Part>

<Part label="c">

Y is a reactant, yet it does not appear in the rate law. Explain what that tells you.

<Answer>

Y is zero order: changing its concentration does not change the rate. In terms of the mechanism, Y does not take part in the rate-limiting step, even though it is consumed somewhere in the overall reaction.

</Answer>

</Part>

</Question>

<Question number={6} topic="5.2">

Units are a check on your work. Give the units of $k$ for each overall order.

<Part label="a">

Zero order: <Blank />

<Answer>

M/s

</Answer>

</Part>

<Part label="b">

First order: <Blank />

<Answer>

$\text{s}^{-1}$

</Answer>

</Part>

<Part label="c">

Second order: <Blank />

<Answer>

$\text{M}^{-1}\,\text{s}^{-1}$

</Answer>

</Part>

<Part label="d">

Why are the units a useful check?

<Answer>

Rate always has units of M/s, so the units of $k$ are fixed by the overall order. If your $k$ carries the wrong units, your orders must be wrong.

</Answer>

</Part>

</Question>

<Question number={7} topic="5.2">

A reaction has $\text{rate} = k[\ce{A}]^2[\ce{B}]$ with $k = 2.0\ \text{M}^{-2}\,\text{s}^{-1}$.

<Part label="a">

Find the rate when $[\ce{A}] = 0.30$ and $[\ce{B}] = 0.20$.

<Answer>

$$
(2.0)(0.30)^2(0.20) = \mathbf{0.036}\ \text{M/s}
$$

</Answer>

</Part>

<Part label="b">

Predict the factor by which the rate changes if $[\ce{A}]$ is tripled and $[\ce{B}]$ is halved.

<Answer>

$\times 4.5$

</Answer>

</Part>

</Question>

<Question number={8} topic="5.2">

The decomposition $\ce{2N2O5 -> 4NO2 + O2}$ is found by experiment to be *first* order in $\ce{N2O5}$. Explain why this one fact rules out the idea that coefficients give orders.

<Answer>

If coefficients gave orders, this reaction would be second order in $\ce{N2O5}$. It is measured to be first order. The overall equation only summarizes the stoichiometry, while the rate law reflects the slowest elementary step, so there is no reason for the two to agree. Here they plainly do not.

</Answer>

</Question>

## Quick review

Five short questions from earlier units.

<Question number={9}>

<Part label="a">

The net ionic equation for $\ce{Ag+}$ with $\ce{Cl-}$: <Blank />

<Answer>

$\ce{Ag+ + Cl- -> AgCl(s)}$

</Answer>

</Part>

<Part label="b">

The oxidation state of S in $\ce{SO4^2-}$: <Blank />

<Answer>

$+6$

</Answer>

</Part>

<Part label="c">

The strongest intermolecular force in $\ce{H2O}$: <Blank />

<Answer>

hydrogen bonding

</Answer>

</Part>

<Part label="d">

The moles of solute in 25.0 mL of a 0.200 M solution: <Blank />

<Answer>

0.00500 mol

</Answer>

</Part>

<Part label="e">

The electron configuration of $\ce{Ca}$: <Blank />

<Answer>

[Ar]$4s^2$

</Answer>

</Part>

</Question>
```

- [ ] **Step 11: Build**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npm run build
```

Expected: the last line is `check-dist: 16 pages, 0 problem(s)` (15 pages before, and the worksheet).

- [ ] **Step 12: Run every test**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
npm test
npm run test:e2e
```

Expected: `Tests  311 passed (311)` and `338 passed`. (224 and 314 before this plan.)

- [ ] **Step 13: Look at the page**

Save the script in Appendix A as `<scratch>/practice-shots.cjs`. Start a preview in the background (`npx astro preview --port 4400`), then:

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
mkdir -p "<scratch>/plan3/shots"
NODE_PATH="$PWD/node_modules" node "<scratch>/practice-shots.cjs" http://localhost:4400 "<scratch>/plan3/shots" unit-5-kinetics/practice/worksheet-1-rates-and-rate-laws/ unit-5-kinetics/
```

Expected, as measured in the trial:

```
worksheet-1-rates-and-rate-laws desktop-light-closed: errors: none
worksheet-1-rates-and-rate-laws phone-dark-open: errors: none
unit-5-kinetics desktop-light-closed: errors: none
unit-5-kinetics phone-dark-open: errors: none
412px worksheet-1-rates-and-rate-laws: page overflow 0; scrolling boxes: none
412px unit-5-kinetics: page overflow 0; scrolling boxes: none
390px worksheet-1-rates-and-rate-laws: page overflow 0; scrolling boxes: none
390px unit-5-kinetics: page overflow 0; scrolling boxes: none
360px worksheet-1-rates-and-rate-laws: page overflow 0; scrolling boxes: none
360px unit-5-kinetics: page overflow 0; scrolling boxes: none
320px worksheet-1-rates-and-rate-laws: page overflow 0; scrolling boxes: table +15, eq +8, table +16, eq +5
320px unit-5-kinetics: page overflow 0; scrolling boxes: none
```

Read the four screenshots. On the worksheet: nine question cards; each part's letter beside its first line; a blank drawn as a short line; "Show answer" under every part, closed on the desktop picture and open, with a colored rule down its left edge, on the phone picture. On the unit page: a "Practice" heading under the topic list with one entry. Stop the preview afterwards.

- [ ] **Step 14: Review the code**

Dispatch `typescript-reviewer` and `code-reviewer` together, read-only, on the branch's diff against `main` (Tasks 1 to 4). Decide each finding, apply the accepted ones, and run Steps 11 and 12 again.

- [ ] **Step 15: Commit**

```bash
git add src tests/e2e/practice.spec.ts
git commit -m "feat(practice): add practice pages with Worksheet 1"
```

### Task 5: Check Worksheet 1, and open the pull request

> **As carried out (2026-11-13).** The two fact-checks agreed: no wrong number, unit or answer, nothing lost in conversion, and the same eight wording points. The strongest model alone raised one minor point, about a sentence added in conversion. Opus missed nothing that matters, so **the fact-checks in Tasks 6 and 7 run on Opus**. The accepted points were few and exact, so the controller applied them directly instead of dispatching a fixer.

- [ ] **Step 1: Audit it against its source**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
node scripts/practice-audit.mjs "D:/AP_Chem_Prep/Units/unit05-kinetics/worksheets/u05-ws1.tex" src/content/practice/unit-5/worksheet-1-rates-and-rate-laws.mdx
```

Expected: `practice-audit: 0 difference(s), 0 expected, 0 unexplained, 0 stale`.

- [ ] **Step 2: Fact-check it twice, once on each model**

Two checkers, in parallel, with the same brief ("How every conversion task ends"): one on the strongest model, one on Opus. Neither sees the other's report.

- [ ] **Step 3: Compare the two reports**

For each finding, note which checker made it and whether it is right. Write the comparison down for the pull request: what both found, what only one found, anything either got wrong. Then settle the model for the remaining fact-checks: Opus, unless it missed something that matters. Record the outcome in the local `CLAUDE.md`, under "Models".

- [ ] **Step 4: Decide and apply the findings**

As in "How every conversion task ends". If the worksheet changes, run the build, the tests and the audit again.

- [ ] **Step 5: Open the pull request**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"
git push -u origin topic/practice-foundation
gh pr create --title "feat(practice): practice pages and Worksheet 1" --body-file "<scratch>/plan3/pr-a-body.md"
```

The body follows "How every conversion task ends", and adds: the three departures from the design at the top of this plan; the comparison of the two fact-checks; that lessons 5.1 and 5.2 now end with a link to the worksheet while the other nine still say practice is on its way.

- [ ] **Step 6: Stop.** When the "Build and test" check passes, ask the teacher to merge. After the merge: watch the deploy finish, then `git checkout main && git pull --ff-only && git branch -d topic/practice-foundation`.

---

## Group B: Worksheets 2 to 4 (pull request 2)

Branch `topic/practice-worksheets`, from an up-to-date `main`.

### Task 6: Convert Worksheets 2, 3 and 4

**Files:**
- Create: `src/content/practice/unit-5/worksheet-2-concentration-over-time.mdx`
- Create: `src/content/practice/unit-5/worksheet-3-mechanisms-and-energy-profiles.mdx`
- Create: `src/content/practice/unit-5/worksheet-4-pre-equilibrium-and-catalysis.mdx`

- [ ] **Step 1: Convert the three worksheets, one writer each, in parallel**

Each writer gets the conversion guide, Worksheet 1's source and MDX, its own source file, and its brief below. Files only.

**Worksheet 2** (`worksheets/u05-ws2.tex`). Frontmatter:

```yaml
---
title: "Worksheet 2: Concentration over time"
kind: worksheet
order: 3
topics: ["5.3"]
summary: Eight questions on the three integrated rate laws, which plot is a straight line for each order, and half-life, with a short review at the end.
---
```

- Eight questions, all `topic="5.3"`, then the quick review as question 9.
- The strip of formulas has six: an integrated rate law and a half-life for each order. Keep all six. After them, tell the student that the half-life formulas for zero order and second order are not on the AP equation sheet and that the parts which need them are marked.
- Question 1 says "Complete the table from memory, then check it against the data strip". Write what it asks: for each order, name the plot that is a straight line and give its slope. Each part has two blanks.
- `beyond` on question 3, parts b and c, and on question 4, part a.
- Question 5, part c, gives the answer "second order, $k = 0.42$" with units of per molar per second, though the question gives the slope no units. Copy it; name it in the handoff report.

**Worksheet 3** (`worksheets/u05-ws3.tex`). Frontmatter:

```yaml
---
title: "Worksheet 3: Mechanisms and energy profiles"
kind: worksheet
order: 4
topics: ["5.4", "5.5", "5.6", "5.7", "5.8"]
summary: Seven questions on elementary steps, testing a mechanism against a measured rate law, the collision model and energy profiles, with a short review at the end.
---
```

- Seven questions with topics 5.4, 5.4, "5.7, 5.8", 5.8, 5.5, 5.5 and 5.6, then the quick review as question 8.
- The strip has five items. Keep all five, and say that the Arrhenius equation, its two-temperature form and the value of $R$ are for question 6 only.
- Questions 3 and 4 give a mechanism inside a sentence. Write each as a table of steps.
- `beyond` on question 6 (all four parts are Arrhenius work, the last three included).
- `beyond` on the quick review's zero-order half-life item.

**Worksheet 4** (`worksheets/u05-ws4.tex`). Frontmatter:

```yaml
---
title: "Worksheet 4: Pre-equilibrium and catalysis"
kind: worksheet
order: 5
topics: ["5.9", "5.10", "5.11"]
summary: Five questions on the pre-equilibrium approximation, multistep energy profiles and catalysis, then a 10-point free-response question with its scoring rubric.
---
```

- Five questions with topics 5.9, 5.9, 5.10, 5.11 and 5.11. Question 6 is the free-response question: `<Question number={6} title="Free response" topic="5.2, 5.3, 5.8" points={10}>`. The quick review is question 7.
- The source writes question 6's rubric as one paragraph in a boxed note. Write it as a `<Rubric>` with five lines worth 3, 2, 2, 1 and 2 points, parts a to e, keeping every condition ("stating orders with no comparison earns 1 of 3", "a final answer still containing $\ce{N2O2}$ earns 0 for the second point"). Write each award inside a line with its digit ("1 point for the rate law, 1 for the value of $k$ with units"), so the audit finds the same numbers on both sides.
- Questions 1 and 5, and parts d and e of question 6, give mechanisms inside sentences. Tables of steps where a mechanism is being set out; a sentence where a single step is only mentioned.

- [ ] **Step 2: Finish as "How every conversion task ends" describes**

Differences the audit is expected to print, to be listed in the `expected` files:

| Document | Line | Reason |
|---|---|---|
| Worksheet 4 | `question 6: the source has 0 rubric line(s) and the site has 5` | The source writes this rubric as a paragraph; the site as five lines |

Anything else it prints is a mistake until shown to be a deliberate edit.

- [ ] **Step 3: Commit, open the pull request, stop**

```bash
git add src/content/practice/unit-5
git commit -m "feat(practice): add Worksheets 2, 3 and 4"
git push -u origin topic/practice-worksheets
gh pr create --title "feat(practice): Worksheets 2, 3 and 4" --body-file "<scratch>/plan3/pr-b-body.md"
```

When the check passes, ask the teacher to merge. After the merge: watch the deploy, return to `main`, delete the branch.

---

## Group C: the skill ladders and the free-response set (pull request 3)

Branch `topic/practice-ladders-frq`, from an up-to-date `main`.

### Task 7: Convert the skill ladders and the free-response set

**Files:**
- Create: `src/content/practice/unit-5/skill-ladders.mdx`
- Create: `src/content/practice/unit-5/free-response-set.mdx`

- [ ] **Step 1: Convert the two documents, one writer each, in parallel**

**Skill ladders** (`u05-selfstudy.tex`). Frontmatter:

```yaml
---
title: "Skill ladders"
kind: ladders
order: 1
topics: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10", "5.11"]
summary: Twelve skills, one at a time. Each has a worked example, then four questions of the same kind to try on your own. Start here, before the worksheets.
---
```

- The introduction comes from the note "How to use these notes": how a ladder works (a worked example, then four questions of the same kind, all four before checking any); the one idea the unit turns on (how fast is not how far); the habit that decides it (orders come from experiment); and the scope note on Arrhenius calculations. Reword it for a student anywhere. Keep the scope note's phrase about a plot of $\ln k$ against $1/T$ and add no other number, so the audit finds the same numbers on both sides.
- Twelve sections, `## Ladder 1: Expressing reaction rate` to `## Ladder 12: Kinetics versus thermodynamics`. Ladder 4's title becomes "Which plot is straight?". Each section: the paragraph, the `<Worked>`, then `<Question number={N} label="Your turn" topic="...">` with parts a to d.
- Topics, ladder by ladder: 5.1; 5.2; 5.2; 5.3; 5.3; 5.4; 5.5; "5.6, 5.10"; "5.7, 5.8, 5.9"; "5.7, 5.11"; 5.11; "5.5, 5.6".
- The source prints its questions as 1 to 4 and its answers as (a) to (d). On the site both are a to d.
- The mechanisms in ladders 9 and 10 become tables of steps.
- Ladder 12 says "petrol" and "favourable". Gasoline, favorable.
- **Leave out** the table "Where you stand" (boxes to tick on paper). **Keep** the note under it as a last section, `## If you missed some`, with its numbers as digits ("12 of 12", "9 to 11", "8 or fewer") and its three root causes numbered (1), (2), (3).

**Free-response set** (`u05-frq.tex`). Frontmatter:

```yaml
---
title: "Free-response set"
kind: free-response
order: 6
topics: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10", "5.11"]
summary: Five free-response questions on all of Unit 5, two long and three short, each with a worked answer and its scoring rubric.
points: 32
minutes: 50
---
```

- The introduction comes from the scope note and the section heading. It keeps these facts, with their numbers: it covers topics 5.1 through 5.11; Unit 5 is 7% to 9% of the exam; topic 5.6 leaves Arrhenius calculations off the exam, so nothing here asks for an activation energy from two rate constants or from a plot of $\ln k$ against $1/T$; 5 questions, 32 points, about 50 minutes, calculator allowed.
- One section, `## Questions`, with five questions:

| Number | `title` | `topic` | `points` | Rubric lines |
|---|---|---|---|---|
| 1 | Rate law from initial rates | 5.1, 5.2, 5.3 | 10 | 4, 2, 2, 2 |
| 2 | Mechanism, profile and catalysis | 5.4, 5.5, 5.7, 5.8, 5.9, 5.10, 5.11 | 10 | 2, 3, 3, 2 |
| 3 | First-order half-life | 5.3 | 4 | 2, 2 |
| 4 | Relating the rates of different species | 5.1 | 4 | 2, 2 |
| 5 | The collision model | 5.5, 5.6 | 4 | 2, 2 |

- Question 2's mechanism (three steps in an `align*`) becomes a table of steps.
- Question 5's last rubric line ends with a note to the teacher ("Per the 5.6 exclusion, no Arrhenius calculation may be required"). Leave that sentence out.

- [ ] **Step 2: Finish as "How every conversion task ends" describes**

Differences the audit is expected to print:

| Document | Line | Reason |
|---|---|---|
| Free-response set | `question 2: number only on the site: 5.8` and `... 5.9` | The source writes the range 5.7--5.10; the site lists each topic |
| Free-response set | `question 5: number only in the source: 5.6` | A note to the teacher at the end of the rubric, left out |
| Skill ladders | in section 13: the numbers `1` to `12`, one more `1`, and the formula `A`, each `only in the source`; perhaps a wording line for section 13 as well | The table "Where you stand" is left out, and its words with it |

With all six documents in place, also check by hand: every lesson's "Practice next" lists the ladders, its worksheet and the free-response set; the unit page lists six documents in the order of the table "The six documents".

- [ ] **Step 3: Commit**

```bash
git add src/content/practice/unit-5
git commit -m "feat(practice): add the skill ladders and the free-response set"
```

### Task 8: Close out

**Files:**
- Modify: `docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md`
- Modify: this plan
- Modify (local, not committed): `CLAUDE.md`

- [ ] **Step 1: Record in the design what was built**

In section 7 of the design, under "Practice (Stage 1: Unit 5 only)", add a dated note after the existing text. Do not rewrite the original decision.

```markdown
> **As built (Plan 3, 2026-11).** The blocks are `Question`, `Part`, `Answer`,
> `Rubric` with `RubricLine`, and `Blank`. There is no converter: AP_Chem_Prep
> was frozen before an export mode could be added to `tools/tex2html.py`, so
> each document was converted by hand from a written guide and then compared
> with its LaTeX source by `scripts/practice-audit.mjs` (numbers, formulas,
> parts, rubric lines, wording), fact-checked, and compared with its key PDF.
> Published: four worksheets, the skill ladders and the free-response set. Not
> published: the unit exam (kept closed) and the comprehensive test (to be
> replaced by new, original questions).
```

- [ ] **Step 2: Note in this plan anything that was done differently**, under the task it concerns, as Plans 1 and 2 did.

- [ ] **Step 3: Check Stage 1 against section 11 of the design**, item by item, against the built site, and put the list in the pull request. Item 5 (search finds lessons and practice) is covered by `practice.spec.ts`.

- [ ] **Step 4: Commit, open the pull request, stop**

```bash
git add docs
git commit -m "docs: record how Unit 5 practice was built"
git push -u origin topic/practice-ladders-frq
gh pr create --title "feat(practice): skill ladders and free-response set" --body-file "<scratch>/plan3/pr-c-body.md"
```

When the check passes, ask the teacher to merge. After the merge: watch the deploy, return to `main`, delete the branch, and update the local `CLAUDE.md`: Plan 3 finished, Stage 1 finished, what is next (the teacher's choice: new questions to replace the comprehensive test, the contact for error reports, or Stage 2).

---

## What this plan delivers against the spec

| Spec | Delivered by |
|---|---|
| §5: practice at `/unit-5-kinetics/practice/<name>/`; the unit page lists unit practice | Task 4 |
| §6: "Practice next" links to matching practice | Task 4 (the links fill in as documents arrive) |
| §6: content the framework excludes is labeled beyond the exam | The `beyond` label, Tasks 6 and 7 |
| §7: practice documents are MDX in `src/content/practice/unit-N/`, built from `Question`, `Answer` and `Figure` | Task 4 (`Part`, `Rubric` and `Blank` added; no practice document has a figure) |
| §7: a one-time conversion, checked before commit, after which the MDX is the master | Tasks 5, 6, 7; the method differs, see the top of this plan |
| §7: printable copies come from the site's own print layout | Task 4 |
| §7: without JavaScript, answers still open | Task 4 (native `<details>`, tested) |
| §8: browser tests open a practice page at phone and desktop widths, with an accessibility scan | Task 4 |
| §8: converted practice compared for question count, answer count and point totals; a build check fails on math that does not render | Tasks 2 and 3 |
| §11 item 2: Unit 5 practice exists, in both themes, phone to desktop | Tasks 4 to 7 |
| §11 item 5: search finds Unit 5 practice | Task 4 |

Not in this plan, by the teacher's decision: the unit exam, the comprehensive test, the class-specific documents.

---

## Appendix A: the screenshot and width script

Save as `<scratch>/practice-shots.cjs`. It is a tool for looking, not part of the site, so it stays out of the repository.

```js
// Looks at practice pages the way a student will: full-page screenshots on a
// desktop (light, answers closed) and on a phone (dark, every answer open),
// then, with every answer open, what scrolls sideways at four phone widths.
//
//   node practice-shots.cjs <base url> <out dir> <page path> [<page path> ...]
// Give page paths without the leading slash (unit-5-kinetics/practice/x/): Git
// Bash turns an argument that starts with "/" into a Windows path.
const { chromium, devices } = require('@playwright/test');
const path = require('node:path');

const [base, out, ...given] = process.argv.slice(2);
const pages = given.map((pagePath) => (pagePath.startsWith('/') ? pagePath : `/${pagePath}`));
const WIDTHS = [412, 390, 360, 320];
const openAll = () => {
  for (const details of document.querySelectorAll('details')) details.open = true;
};
const name = (pagePath) => pagePath.split('/').filter(Boolean).pop();

(async () => {
  const browser = await chromium.launch();

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await desktop.addInitScript(() => localStorage.setItem('chemstudy:theme', 'light'));
  const phone = await browser.newContext({ ...devices['Pixel 7'] });
  await phone.addInitScript(() => localStorage.setItem('chemstudy:theme', 'dark'));
  for (const pagePath of pages) {
    for (const [label, context, open] of [['desktop-light-closed', desktop, false], ['phone-dark-open', phone, true]]) {
      const page = await context.newPage();
      const problems = [];
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(message.text());
      });
      page.on('pageerror', (error) => problems.push(error.message));
      await page.goto(base + pagePath);
      await page.evaluate(() => document.fonts.ready);
      if (open) await page.evaluate(openAll);
      await page.screenshot({ path: path.join(out, `${name(pagePath)}-${label}.png`), fullPage: true });
      console.log(`${name(pagePath)} ${label}: errors: ${problems.length ? problems.join(' | ') : 'none'}`);
      await page.close();
    }
  }
  await desktop.close();
  await phone.close();

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    for (const pagePath of pages) {
      await page.goto(base + pagePath);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(openAll);
      const wide = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.katex-display, .prose table'))
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => `${element.tagName === 'TABLE' ? 'table' : 'eq'} +${element.scrollWidth - element.clientWidth}`),
      );
      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      console.log(`${width}px ${name(pagePath)}: page overflow ${pageOverflow}; scrolling boxes: ${wide.length ? wide.join(', ') : 'none'}`);
    }
    await context.close();
  }
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
```
