# ChemStudy: American English everywhere, and feedback on Unit 1's Checks

Written on 2026-11-26, against `main` at `4cb0029` (the merge of pull request
#67, with all of Unit 1 in: eight lessons, six practice documents and the
two sessions of the comprehensive test). It adds to the main design,
`2026-11-12-chemstudy-redesign-design.md`, and changes two things in it: the
`Check` block gains three attributes (section 4), and the repository gains a
rules file, `CLAUDE.md` (section 2).

## 1. What the teacher decided

| Question | Decision |
|---|---|
| The language | "We need a global rule for american english" (2026-11-26). One rule for the whole repository, with a check that fails the build |
| The Education Skills Library | Apply it to Unit 1 first (2026-11-26: "we will apply skill to unit one and write specs and instructions in docs") |
| Who does what | This design, its plan and the data file were written in a chat session that has the library. A Claude Code session carries the plan out ("Claude code side can code and deploy") |
| Merging | **Each pull request waits for the teacher.** The site deploys when a pull request is merged into `main`, so "deploy" is the teacher's merge. If the teacher's message to the building session says to merge, that session merges |
| Models | Writers and fact-checkers on Fable 5.2; fixers on Sonnet, as for Unit 1's lessons |

**Claude's calls, for the teacher to confirm or change in the pull request:**

- Which of the library's findings are acted on now (sections 4 to 6) and
  which wait for their own design (section 8).
- The 116 messages. They are in the plan, Check by Check, for the teacher to
  read.
- Two Checks have their options reordered (section 5).
- Two numeric Checks accept a narrower range than 2 percent (section 6).
- The spelling check does not read `docs/superpowers/` (section 2.2).

## 2. American English

### 2.1 The rule

`CLAUDE.md`, at the top of the repository, is read by Claude Code at the
start of every session. Its first section is the rule: everything in the
repository is in American English, lessons and code alike, with a table of
spellings, a list of usages, and what to do with a source that is not
American. Until now the rule lived in single lines of the plans ("US
spelling") and in the conversion notes for each unit's practice, which listed
the British spellings found in the teacher's sources.

The second section of `CLAUDE.md` points to the main design, to the designs
and plans, to `docs/DEPLOY.md`, and repeats that the teacher merges. Nothing
else goes into the file in this work.

### 2.2 The check

`scripts/us-spelling.mjs` holds a list of British spellings and usages and a
function that finds them. `tests/unit/us-spelling.test.ts` runs it over
`src/`, `public/figures/`, `tests/`, `scripts/`, `README.md` and
`docs/DEPLOY.md`, so `npm test` and the "Build and test" check on GitHub fail
on a British spelling.

- **The list is of whole words and stems, not a general pattern.** A pattern
  for "-ise" would stop on rise, precise, exercise and otherwise. Verbs are
  listed by stem, about fifty of them (ion-, neutral-, crystall-).
- **"Analyses" is not on the list.** It is the plural of "analysis" in
  American English, and the Unit 7 test uses it three times.
- **"Burnt" is not on the list.** Lesson 4.1 names the pigment burnt sienna.
- **A word that must stand** goes into the script's allow list with its
  reason. The list is empty today.
- **Not read: `docs/superpowers/` and `CLAUDE.md`.** The practice plans of
  Units 3 and 7 quote the British spellings they changed, and `CLAUDE.md`
  lists them. The designs and plans are a record, and the check does not
  rewrite a record.

**The site is clean today.** Run on `main` at `4cb0029`, the script reads 344
files and finds nothing.

### 2.3 The library writes British English

The Education Skills Library's own text is British ("analyse", "programme",
"marks", "Year 8"). Whatever comes out of it is recast before it goes into a
file. This design, its plan and the data file were checked with the script.

## 3. What the library found in Unit 1

Four skills were run on Unit 1's 36 Checks (28 with options, 8 with a typed
number) and on its skill ladders: the hinge question designer, the error
analysis protocol, the assessment validity checker and the worked example
fading designer.

1. **A wrong answer is told nothing.** A hinge question is one in which each
   wrong option is the answer a particular mistake gives. Unit 1's Checks are
   built that way already: every explanation says what each wrong option
   comes from. But the student sees that only after the right answer or after
   "Show answer". On a wrong option the page says "Not quite. Try another."
   and on a wrong number "Not quite. Check your setup and try again."
2. **Two numeric Checks mark a known wrong method correct.** Lesson 1.1,
   Check 5: counting the hydrogen once gives 9.35 × 10²¹, which is 0.97
   percent from the answer and inside the 2 percent the page accepts. The
   explanation says so. Lesson 1.2, Check 3: leaving out the smallest peak
   gives 64.95 (0.66 percent away) and averaging four peaks as equals gives
   66.18 (1.22 percent away).
3. **The answer is seldom the first option.** In Unit 1 the answer is option
   1, 2, 3 and 4 in 4, 9, 8 and 7 of the 28. Across the site it is worse (see
   the table), and a student who guesses the middle options is right more
   often than chance.
4. **A topic is marked done when every Check has been answered**, however
   many tries each took. Nothing records whether the first try was right.
5. **The skill ladders go from a full worked example to four questions with
   no help.** The library's fading sequence would put a part-worked question
   between them.

| Unit | Option 1 | Option 2 | Option 3 | Option 4 | Typed number |
|---|---|---|---|---|---|
| 1 | 4 | 9 | 8 | 7 | 8 |
| 2 | 6 | 12 | 9 | 0 | 2 |
| 3 | 10 | 15 | 11 | 4 | 18 |
| 4 | 7 | 6 | 11 | 6 | 9 |
| 5 | 3 | 12 | 11 | 1 | 9 |
| 7 | 6 | 9 | 11 | 7 | 16 |
| All | 36 | 63 | 61 | 25 | 62 |

This design acts on findings 1, 2 and 3, for Unit 1. Findings 4 and 5 are in
section 8.

## 4. Feedback on a wrong answer

### 4.1 A Check with options

`Check` takes `misses`: a message for each wrong option, by option number.

```mdx
<Check
  answer={2}
  misses={{
    1: "The distance is squared in Coulomb's law. Twice the distance does more than undo twice the charge.",
    3: "That looks at charge alone. The second electron is also twice as far from its nucleus.",
    4: "That looks at distance alone. The second nucleus also has twice the charge.",
  }}
>
```

A student who picks option 3 reads "Not quite. That looks at charge alone.
The second electron is also twice as far from its nucleus." The option is
crossed off as before, and the student tries again. An option with no message
keeps "Not quite. Try another."

### 4.2 A Check with a typed number

`Check` takes `slips`: the numbers that known mistakes give, each with a
message.

```mdx
<Check
  numeric="18.78"
  unit="%"
  slips={{
    "9.39": "The formula has two lithium atoms. Count both.",
    "0.1878": "That is the fraction. Multiply by 100 for a percent.",
  }}
>
```

The page grades the typed number first. If it is not correct, the page looks
for the slip it is nearest to, and gives that slip's message when the number
is within 1 percent of the slip. So 9.4 and 9.392 both get the message for
9.39. A number near no slip keeps "Not quite. Check your setup and try
again."

**A slip can never be marked correct.** The build stops when a slip lies
inside the range the Check accepts. That turns the rule of the Unit 1 lessons
design ("the answer a common wrong method gives lies outside the grader's 2
percent") into something the build checks.

### 4.3 A Check's own tolerance

`Check` takes `tolerance`, in percent: `tolerance={0.5}`. It may be smaller
than the page's 2 percent, never larger. It is for a Check whose known slip
lands close to the answer (section 6).

### 4.4 What a message is

Written into every brief, and checked by the build where a build can check
it:

- **One or two short sentences, at most 180 characters.** The longest of
  Unit 1's is 128.
- **Plain text.** No math, no markup. Formulas are written as the lessons'
  prose writes them: I₂, Cu(OH)₂, 10²¹.
- **It names the likely mistake, or the thing to check. It never gives the
  answer** and never says which option is right.
- **It does not begin "Not quite"**: the page adds that. It ends with a
  period or a question mark.
- **It uses the lesson's terms and rules** and says nothing the lesson's own
  explanation does not support.
- **A message for a typed number is worded as a likelihood** ("Did you…",
  "That is what … gives"), because a number near a slip may have come from
  somewhere else.
- **"Only" and "every" are checked by name**, as in every brief since Unit 3.

### 4.5 The wording follows the kind of mistake

The error analysis protocol sorts mistakes into three kinds and answers each
differently. The messages follow it:

| Kind of mistake | What the message does | Example |
|---|---|---|
| A wrong idea (a peak's height read as an energy; a nucleus's pull "shared out") | Names the idea that is wrong, and what to compare | "Height counts electrons. It says nothing about how strongly they are held." |
| A wrong step in a right method (the molar mass upside down; a ratio rounded when it should be multiplied) | Names the step, and the test that catches it | "Follow the units. Here the molar mass is upside down, so the grams do not cancel." |
| A slip, or a method stopped early (the moles given where atoms were asked for; a fraction left as a fraction) | Says what the number is | "That is the moles of germanium. One more step takes moles to atoms." |

### 4.6 What does not change

- **Without JavaScript**, and in print, a Check is what it is today: the
  question, its options and "Show answer". The messages are attributes the
  page's script reads.
- **"Show answer" stays in reach** at every moment, and the explanation under
  it is not shortened: the messages point, the explanation teaches.
- **The feedback line is still a status region**, so a screen reader speaks
  the message.
- **Progress** is recorded as before (finding 4 is not in this design).
- **Units 2, 3, 4, 5 and 7** behave as today until each has its own messages.

## 5. Where the answer sits

Two Checks have their options reordered, which brings Unit 1 to 6, 7, 8 and 7
answers at options 1 to 4:

| Check | Now | After |
|---|---|---|
| Lesson 1.3, Check 2 (silicon nitride) | SiN; **Si₃N₄**; Si₂N₃; Si₃N₂ | **Si₃N₄**; SiN; Si₂N₃; Si₃N₂ |
| Lesson 1.4, Check 3 (chalcopyrite) | rock and iron; **rock and copper**; copper alone; rock and sulfur | **rock and copper**; rock and iron; copper alone; rock and sulfur |

They were chosen because their explanations name the options by what they
say, never by position ("the first option"), so the explanations do not
change. Checks whose options are in numerical order (the estimates in lessons
1.2 and 1.7) are left alone.

A unit test keeps it so: in each unit on its list, each of the four options
is the answer for between 15 and 35 percent of the Checks with options. Unit
1 is the only unit on the list. Today the test would fail for it (option 1
has 14 percent), which is how the test is seen to work.

## 6. Two narrower tolerances

| Check | Answer | Tolerance | Now refused | Still accepted |
|---|---|---|---|---|
| Lesson 1.1, Check 5 | 9.26 × 10²¹ atoms | 0.5 percent | 9.35 × 10²¹ (hydrogen counted once in the molar mass) | 9.3 × 10²¹, and 9.25 to 9.26 × 10²¹ from rounding along the way |
| Lesson 1.2, Check 3 | 65.38 amu | 0.5 percent | 64.95 (a peak left out), 66.18 (four peaks as equals) | 65.3 to 65.4 from rounding along the way, and 65.45 |

- **Lesson 1.1's explanation changes by one sentence.** It says the slip is
  "close enough that this page marks it correct". It will not be.
- **65.45 stays accepted in lesson 1.2.** It is what whole-number masses
  give, 0.11 percent from the answer. A range that refused it would also
  refuse 65.3, which a student who rounds each product to three figures
  gets. The explanation already warns that a close answer does not prove the
  method, and that sentence stays.

## 7. Code

Each change is made test-first.

| File | Change |
|---|---|
| `CLAUDE.md` | New: the rule, and where the other rules are |
| `scripts/us-spelling.mjs`, `tests/unit/us-spelling.test.ts` | New: the spelling check |
| `src/lib/check.ts`, `tests/unit/check.test.ts` | `gradeNumeric` takes a tolerance. New: reading and checking `misses`, `slips` and `tolerance`; finding the nearest slip |
| `src/components/lesson/Check.astro` | Takes the three attributes, checks them at build time, hands them to the page as data attributes; the page's script shows the message |
| `scripts/check-dist.mjs`, `tests/unit/check-dist.test.ts` | A message must belong to an option the Check has. In a unit on the list, every wrong option has a message and every typed-number Check has a slip |
| `tests/unit/check-balance.test.ts` | New: section 5's test |
| `tests/e2e/lesson.spec.ts`, `tests/e2e/a11y.spec.ts` | A wrong option and a slip show their messages; the two tolerances; no sideways scroll at 320 px with the longest message showing |
| Eight lessons in `src/content/lessons/unit-1/` | The messages, the two reorders, the two tolerances, one sentence |

No new package. No change to the styles: the feedback line already wraps.

## 8. Not in this design

- **Messages for Units 2, 3, 4, 5 and 7.** Each unit is one more data file
  and one more pull request, with the unit added to the two lists. The
  answer positions of Units 2 and 5 (section 3's table) want the same care.
- **A record of first tries** (finding 4), and anything shown from it. It
  belongs with the review features of the main design's Stage 4
  (flashcards), where it would decide what comes back for review. It needs
  its own design: what is stored, under which key, and what the student
  sees.
- **Part-worked questions in the skill ladders** (finding 5). The ladders
  are the teacher's own material, converted as it stands and audited against
  its source. Changing how a ladder is built is the teacher's decision, and
  the audit would need to know about it.
- **The library's skills for an AI tutor.** The site has no AI and the main
  design asks for none.

## 9. How it is made

1. **The data file**
   (`docs/superpowers/plans/2026-11-26-chemstudy-unit-1-check-feedback.json`)
   holds every message with the Check and option, or slip, it belongs to. It
   was written from the lessons' own explanations. Every slip's value was
   recomputed with the exam table's atomic masses.
2. **A fact-check of the data file** on Fable 5.2, by a fresh agent that
   solves each Check, works out each slip from the mistake named, and only
   then reads the message. It checks each message against section 4.4 and
   against the lesson. The findings are fixed in the data file.
3. **The code, test-first**, with a TypeScript review and a code review.
4. **The data file is applied by a tool**, not by hand: it stops if a lesson
   is not what the file expects, and a second run compares without changing
   anything. The tool is in the plan.
5. **One build and one test run**, then a look at each of the eight lessons
   at 412, 390, 360 and 320 px with a wrong answer showing its message.
6. **A second check** of the built lessons by a fresh agent: every wrong
   option clicked, every slip typed, each message read beside its question.
7. **The pull requests**, left for the teacher.

## 10. Pull requests

Each is stacked on the one before and targets `main`.

| Pull request | Contents |
|---|---|
| A | This design, its plan, the data file and `CLAUDE.md` |
| B | The spelling check |
| C | `Check`'s three attributes, the grading code and the build check. No lesson changes, so no page changes |
| D | Unit 1's messages, reorders and tolerances; Unit 1 on the two lists; the browser tests; the close-out notes |

## 11. Done when

- `npm test` fails on a British spelling in the site's sources, and passes on
  `main`.
- All 28 Checks with options in Unit 1 say something for each wrong option,
  and all 8 with a typed number name at least one slip. The build fails if a
  later edit leaves one out.
- No slip in Unit 1 is marked correct.
- Each of the four options is the answer in 6 to 8 of Unit 1's 28 Checks.
- The data file has been fact-checked, the built lessons checked a second
  time, and every accepted finding fixed.
- No lesson of Unit 1 scrolls sideways at 320 px with a message showing.
- The pull requests wait for the teacher, each with "Build and test" passing
  on GitHub.

## As built

Carried out on 2026-11-26 in a Claude Code session, as pull requests B
(#69), C (#70) and D. The plan's "As carried out" notes give the detail.

**What changed from this design**

- **The spelling check reads 346 files**, with `.js` and `.json` added, and
  also catches plurals and "-er" forms and a phrase split by a line break.
- **A slip is matched only when the typed value is nearer the slip than the
  answer.** With a 0.5 percent tolerance a slip's 1 percent window reached
  past the answer: in lesson 1.2, 65.72 would have been told it averaged the
  peaks as equals. Section 4.2's rule ("within 1 percent of the slip") now
  has that condition too.
- **Fourteen of the 116 messages were rewritten** after two fact-checks; the
  data file has them. Three were errors: one gave the answer away (lesson
  1.8, In₃O₂), two confirmed half of it (lesson 1.5, Check 5). One sent the
  student to a figure that does not show what it said (lesson 1.7, Check 3).

**Unit 1 after the change** (section 3's table)

| Unit | Option 1 | Option 2 | Option 3 | Option 4 | Typed number |
|---|---|---|---|---|---|
| 1 | 6 | 7 | 8 | 7 | 8 |

All 28 Checks with options say something for each wrong option (84
messages) and all 8 with a typed number name at least one slip (32). No slip
is marked correct.

**Left for the teacher.** The 0.5 percent tolerances refuse some answers
rounded to two figures: 9.2 × 10²¹ and 9.21 × 10²¹ in lesson 1.1 (0.65 and
0.54 percent low), and 65 or 65.0 in lesson 1.2. A tolerance of 0.8 percent
in lesson 1.1 would accept them and still refuse the slip, 9.35 × 10²¹. In
lesson 1.2, 65.0 is nearer the slip 64.95 than the answer, so it gets that
slip's message, which now mentions rounding.

**What the next unit should do differently**

- **Ask of every message whether it leaves one option standing.** The first
  fact-check found three messages that gave or nearly gave the answer; a
  message for a wrong option on a four-option Check easily confirms half of
  the right one. Put the question in the brief.
- **A message that points at a figure or a table must be checked against
  that figure.** The figure in lesson 1.7 shows Rb⁺ beside Br⁻; the
  comparison with F⁻ is only in the explanation.
- **Use the lesson's own terms for rounding.** Lesson 1.2 speaks of decimal
  places, not significant figures.
- **Before narrowing a tolerance, list the roundings a student gives to one
  figure fewer and with three-figure intermediates**, and choose the widest
  tolerance that still refuses the slip.
- **Two numbers in one Check's slips can coincide with other values on the
  page** (lesson 1.2's 66.93 is also the third peak's mass). Search the
  question for each slip's value before writing its message.
