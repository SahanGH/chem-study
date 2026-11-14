# ChemStudy Unit 2 Lessons and Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put Unit 2 (Compound Structure and Properties) on chem-study.com:
- seven lessons, 2.1 to 2.7;
- a Lewis diagram block drawn when the site is built;
- two interactive diagrams.

**Architecture:**
- **Lessons** are MDX files built from the existing lesson blocks.
- **Lewis diagrams** come from a new Astro block, `<Lewis>`, which turns a short description into inline SVG at build time. It checks the electron count and computes formal charges itself. `<Resonance>` groups several diagrams.
- **Interactive diagrams** are Svelte components drawn in SVG, wrapped in Astro blocks and loaded when they scroll into view, as in Unit 5: the bond-energy curve for 2.2 and the 3D shape viewer for 2.7.
- **Every number a diagram shows** comes from a plain TypeScript module with unit tests.

**Tech Stack:** Astro 7, MDX, Svelte 5, KaTeX 0.16 + mhchem, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-13-chemstudy-unit-2-lessons-design.md`.

**This is the first Stage 3 plan** (theory, unit by unit). The Unit 2 practice is converted under a later plan, so every lesson's "Practice next" says practice is on its way.

**How this plan differs from the Unit 5 plans.**

1. **Lesson prose is not in this plan.** Each lesson task carries a brief that fixes all the chemistry:
   - what the framework requires;
   - the sections;
   - the worked examples with their numbers;
   - every Check with its answer and explanation;
   - the traps, the key points and the figures.

   The writer supplies only the sentences.
2. **The code is not printed here either.** All three code pieces were built test-first in a throwaway copy of the repository on 2026-11-13. That copy is the local branch `proto/unit-2`, commits `8f302a5` and `3e81941`, against `main` at `69ffc68`.
   - Results: 469 unit tests and 480 browser tests passed, with check-dist reporting 26 pages and 0 problems. A TypeScript review found nothing above MEDIUM, and every finding was fixed.
   - About 3,200 lines would have made this plan unreadable for the teacher, who reviews lessons, not code. So each code task gives the contract instead: files, inputs, behavior, and what the tests check.
   - The code itself is reviewed in the pull request that carries it.
3. **The briefs were checked independently before this plan was committed.** A checker on Opus solved every Check and worked example from the question alone, recomputed every number, and verified every Lewis structure against the 2024 framework. It found no wrong answer key or number. Its 20 findings, on wording, two over-broad rules, a few missing details and one coverage gap, are applied.
4. **The teacher's old Unit 2 guided notes** (`D:\AP_Chem_Prep\Units\unit02-compound-structure\u02-notes.tex`) were read at the teacher's request. The briefs reflect what they stress:
   - the minimum of the energy curve is a balance between attraction and repulsion;
   - charges first, then sizes;
   - a three-part answer for a bond angle;
   - the two conditions for a polar molecule;
   - SO₂ against SO₃.

   Nothing was copied from them, because the notes follow the Zumdahl textbook.

---

## Facts verified before writing (do not rediscover)

Established on 2026-11-13 in the prototype.

1. **No new dependency** and no change to the content security policy. The Lewis block makes plain inline SVG at build time; the two diagrams use Svelte as Unit 5's do.
2. **`tests/e2e/all-lessons.spec.ts` was hard-wired to `unit-5`.** The prototype made it build its list from every `src/content/lessons/unit-N/` folder, with slugs from `src/data/units.ts`. The unit-page link test and the search test now run once per unit. Without this, no Unit 2 lesson gets the phone-width or accessibility checks.
3. **`tests/e2e/home.spec.ts`** expected 8 units "Coming soon" and marked only Unit 5's topics done. The prototype changed both:
   - "Coming soon" is now 9 minus the number of unit folders that hold an `.mdx` file;
   - "nothing left to offer" now marks every topic listed in the page's `data-unit-topics`.
4. **Lewis layout advice for writers:** put diagonal neighbors at ±1 grid units, not ±0.71. At ±0.71 the bonds of XeF₄ crowded the lone pairs.
5. **A lone pair cannot sit on a side within 45° of a bond.** With a count, the block chooses only sides that are clear; if none is left, the build fails and says so. With a list, a listed side that points along a bond fails the build.
6. **No single starting view of the 3D viewer keeps every geometry's atoms apart**, so each geometry has its own, checked by a unit test for every molecule.
7. **`svelte-check` is not installed**, so `.svelte` files are exercised only by the build and the browser tests. Do not add it in this plan.
8. **The AP framework** is `D:\AP_Chem_Prep\Reference\ap-chemistry-course-and-exam-description.pdf` (2024; Unit 2 starts on the page numbered 39). Read it with `pdftotext -layout` into a scratch folder. Never copy it, or its wording, into the repository.

## Conventions for every task

- Work in `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study`. Start every shell command with `cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study"` (capital `C:`; Vitest fails from a lowercase drive).
- `D:\AP_Chem_Prep` is a read-only archive. Never write there. The teacher's Unit 2 guided notes (`D:\AP_Chem_Prep\Units\unit02-compound-structure\u02-notes.tex`) were read when this plan was written, and the briefs reflect what they stress. Writers do not need them, and never copy from them: they follow the Zumdahl textbook. Never copy from `Tro_Reference`, `ChemistrySlides` or the textbook PDFs, and never reuse a textbook's wording or one of its worked examples.
- Create files with the editor's Write tool. Shell heredocs and `node -e "..."` eat backslashes on this machine, which silently ruins TeX and regular expressions.
- Conventional commits. **No AI-attribution trailer.** US spelling.
- Tests first: write the test, run it, watch it fail, then implement.
- Never swallow an error.
- Browser tests run against the built site: `npm run test:e2e` builds first. Stop any preview server before running it; Astro refuses to start a second one.
- **One pull request per group, as listed under each group. Never merge a pull request yourself: a merge deploys to chem-study.com. When the "Build and test" check passes, stop and ask the teacher to merge.**

## How a group is carried out

As for Unit 5. Within a group, one writer agent per lesson, in parallel, writing files only: no build, no git, because concurrent builds collide. Then the controller does the rest, in order:
1. one build and test run;
2. a look at each lesson on a phone;
3. one independent fact-checker per lesson, on Opus (`model: "opus"`);
4. one fixer per lesson for the accepted findings (Sonnet);
5. a code review of any code;
6. the commits;
7. the pull request.

A code task (Tasks 1, 3 and 8) is done by the controller or a single implementer before the group's writers start, because their lessons use its blocks.

## Rules for writing a lesson (Tasks 2–8)

Read `src/content/lessons/unit-5/5-2-rate-law.mdx` first. It is the model for length, tone and markup.

**The file.** `src/content/lessons/unit-2/<file name in the task>`. The name must be `<unit>-<number>-<slug>.mdx` matching the topic, or the build fails. Front matter is exactly three fields:

```mdx
---
topic: "2.1"
minutes: 12
summary: One sentence, 20 to 200 characters, saying what the lesson teaches.
---
```

The title comes from `src/data/units.ts`. Do not write an `# H1`.

**The seven parts, in order.** The build fails if a lesson lacks a worked example, a trap box, key points, practice-next or three checks.

1. Opening: two or three sentences, no heading, starting from something concrete.
2. Explanation: `##` sections, one idea each. At least one `<KeyIdea>`.
3. `<Worked title="...">` with numbered steps.
4. `<Check>` questions spread through the lesson, each placed right after the idea it tests. Never all at the end.
5. `<Trap>`: the specific mistakes for this topic, as a short list with the mistake in bold.
6. `<KeyPoints>`: four to six bullets. This is the review sheet, so each bullet must stand on its own.
7. `<PracticeNext />` as the last line, with no attributes. Until the Unit 2 practice exists it says practice is on its way; that is expected.

**Markup.**

- Math is KaTeX inside `$...$` or a `$$` block. Formulas and equations use `\ce{...}`: `$\ce{CO3^2-}$`, `$\ce{NH4+}$`. Units in math are upright: `$\text{kJ/mol}$`, `$\text{pm}$`. In prose, plain Unicode is fine for a simple formula (H₂O, SO₄²⁻) when it needs no math.
- A choice check: `<Check answer={2}>`, the question, a blank line, a `-` list of options, a blank line, then `<div slot="why">...</div>`. `answer` is the 1-based number of the correct option.
- A numeric check: `<Check numeric="32">` (add `unit="..."` when there is one). **The number is text in quotes.** The student's answer is accepted within 2 percent.
- A figure: `<Figure src="/figures/<name>.svg" alt="..." caption="..." />`.
- Inside a block (`<Worked>`, `<Trap>`, `<KeyPoints>`, `<KeyIdea>`, `<Beyond>`), leave a blank line after the opening tag and before the closing tag.
- Refer to another lesson by topic number in plain text ("topic 2.5"). Do not link to a lesson that is not published yet: a broken link fails the build.
- **Phone width.** A long equation goes on its own line (`$$ ... $$`), split with `aligned` if needed; math inside a sentence cannot wrap. Tables have at most five columns. No lesson may scroll sideways at 320 px with every answer open.

**Lewis diagrams** use the `<Lewis>` block from Task 1. A diagram is described, not drawn:

```mdx
<Lewis
  alt="Lewis diagram of water: oxygen in the middle, single bonds to two hydrogen atoms, two lone pairs on oxygen."
  atoms={[
    { id: 'O', symbol: 'O', x: 0, y: 0, lonePairs: 2 },
    { id: 'H1', symbol: 'H', x: -1, y: 0 },
    { id: 'H2', symbol: 'H', x: 1, y: 0 },
  ]}
  bonds={[['O', 'H1', 1], ['O', 'H2', 1]]}
/>
```

- `x` and `y` are on a grid where 1 is one bond length and `y` grows downward. A Lewis diagram is drawn flat: put neighbors left, right, above and below (90° apart). Never try to show the real shape in a Lewis diagram; topic 2.7 shows shapes. With five or six neighbors, use the diagonals too, at ±1 (`x: 1, y: -1`); at ±0.7 the bonds crowd the lone pairs (Fact 4).
- `lonePairs` is a count (the block places the pairs on free sides) or a list of sides (`['top', 'bottom']`) when the automatic choice looks wrong. `unpaired: 'top'` draws a single electron.
- `ion={-1}` draws brackets and the charge. `formalCharges` (no value) shows every non-zero formal charge; the block computes them, so never type a charge on an atom.
- **The build checks the electron count**: if the electrons drawn do not equal the valence electrons (adjusted for `ion`), the build fails and names the diagram. Treat that error as a chemistry error, not a typo: recount.
- Resonance structures go inside `<Resonance>` ... `</Resonance>`, one `<Lewis>` per structure. The block draws the arrows between them.
- `alt` says what the diagram shows in words, including the lone pairs and any charges, for someone who cannot see it.

**Voice.** A teacher talking, not a textbook. Start from something concrete. Short sentences. No "in this section we will". Say "you". Explain why before how. One new term at a time, in bold the first time, defined in the same sentence.

**Chemistry.**

- Teach what the brief's "Framework" line lists, and nothing the exam excludes unless the brief says to label it. Excluded material goes in a `<Beyond>` block so a student can skip it.
- Use the brief's numbers exactly. They were checked when this plan was written. If you think one is wrong, stop and say so; do not quietly change it.
- Do not add a worked example or a check that the brief does not list. Do not drop one.
- Never take an example, a data table or a sentence from a textbook.

**Static figures.** Hand-written SVG in `public/figures/`, in the style of `public/figures/5-2-order-and-rate.svg`: a `viewBox` about `0 0 480 300` (wider or taller where a figure needs it), a `#FDFCF9` background rectangle, `font-family="system-ui, sans-serif" font-size="14"`, ink `#26231F`, secondary `#6B655D`, accent `#4F706C`. Two things in one figure that must be told apart differ in shape, shading or dash pattern as well as color. Label directly; do not rely on a legend alone. Text in a figure stays at least 12 px when the figure is shown 320 px wide, so a figure meant for phones keeps its text short and large.

## How every lesson task ends (Tasks 2–8)

**Build and test.**

```bash
cd "C:/Users/sahan/Downloads/Chemistry_Resources/chem-study" && npm test && npm run test:e2e
```

Expected: every unit test and every browser test passes, and the build prints `check-dist: N pages, 0 problem(s)` with N one higher for each new lesson. `all-lessons.spec.ts` finds a new lesson by itself and checks its math, its checks, its width on a phone and its accessibility.

**Look at it.** Run `npm run build && npx astro preview --port 4400`. Measure the lesson at 412, 390, 360 and 320 px with every "Show answer" open: the page must not scroll sideways, and no equation or Lewis diagram may be cut off. Read it at 1280 px and at 390 px, in the light and the dark theme. Tests do not see a formula that rendered but is wrong, a lone pair on the wrong side, a figure that is illegible in the dark theme, or a table that is too wide. Fix what you find. Stop the preview server afterward and confirm nothing still listens on port 4400.

**Fact-check, independently.** Dispatch a fresh agent on Opus that has not seen this plan's brief. Give it the lesson file, the built page, and the path of the AP framework text. It must:

1. Solve every check and every worked example itself **before** reading the lesson's answer, then compare.
2. Recompute every number in the lesson, including the ones in prose and in tables.
3. For every Lewis diagram, count the electrons, check every octet and every allowed exception, and confirm the formal charges and any resonance set.
4. Check every statement of fact against the framework's Unit 2 pages, and list anything the framework excludes that the lesson teaches outside a `<Beyond>` block.
5. Report anything a student could misread, and any sentence that reads like a textbook's.

It reports; it does not edit. Fix what is right, say why for what is wrong, and re-run **Build and test**.

**Commit.**

```bash
git add src/content/lessons/unit-2/<file>.mdx public/figures/<figures>
git commit -m "feat(lessons): add <topic number> <title>" -m "<one sentence: what the fact-check confirmed or changed>"
```

**Do not merge.** The group's last task opens the pull request.
## File structure

```
src/
  lib/lewis.ts                      Lewis input checks, layout, formal charges (Task 1)
  lib/bonding.ts                    energy curve, bond data, readout sentences (Task 3)
  lib/vsepr.ts                      domain geometry, rotation, molecules, readouts (Task 8)
  styles/lewis.css                  Lewis and resonance styles, loaded by Base.astro (Task 1)
  styles/diagram.css                + curve, marker and viewer styles (Tasks 3, 8)
  components/lesson/Lewis.astro      <Lewis ... />                (Task 1)
  components/lesson/Resonance.astro  <Resonance>...</Resonance>   (Task 1)
  components/lesson/BondEnergyCurve.astro  <BondEnergyCurve />    (Task 3)
  components/lesson/ShapeViewer.astro      <ShapeViewer />        (Task 8)
  components/diagrams/BondEnergyCurve.svelte, ShapeViewer.svelte
  pages/[unit]/[topic].astro        + Lewis, Resonance, BondEnergyCurve, ShapeViewer in `blocks`
  content/lessons/unit-2/           seven new .mdx files (Tasks 2-8)
public/figures/                     nine new static figures (2-1 to 2-7)
tests/unit/lewis.test.ts bonding.test.ts vsepr.test.ts
tests/e2e/lewis.spec.ts diagram-bond-energy-curve.spec.ts diagram-shape-viewer.spec.ts
tests/e2e/all-lessons.spec.ts home.spec.ts   (changed: every unit with lessons, Facts 2-3)
```

---

## Group A: bonds, energy and solids (pull request A)

> **As carried out (2026-11-13), all three groups.** The repository is newer than this plan. What changed and why:
>
> - **`<Resonance>` moved from Task 1 to Task 7.**
>   - Group A had no lesson that used it, so the code review called it untested code.
>   - It came back with lesson 2.6, together with its browser tests.
>   - Each group now takes a `label` prop ("Resonance structures of ozone"), so a screen reader can tell lesson 2.6's three groups apart.
>   - The diagrams inside a group are counted by a tested function, `countLewisStructures`, built from one shared marker, `LEWIS_MARKER`.
> - **The Lewis code is split.**
>   - Input checks are in `src/lib/lewis-parse.ts`, as small functions, and every failure branch has a test.
>   - Layout stays in `src/lib/lewis.ts`.
>   - The block now also refuses a bond line drawn through a third atom.
>   - Writers find the props at the top of `lewis-parse.ts`.
> - **The bond-energy diagram:**
>   - the drawing is wide enough for the largest atom at the slider's far end;
>   - the slider's name no longer carries its value, which now goes in `aria-valuetext`;
>   - the readout inside the bond length says repulsion outweighs attraction.
> - **There is no `<Beyond>` block for lessons.** The rules above were wrong to name one: the only `Beyond` block belongs to practice pages. Lessons mark excluded material as Unit 5's do, with a paragraph that starts "**Beyond the exam:**".
> - **Figures use font-size 18 on a 480-wide viewBox**, so their text stays about 12 px on a 320 px phone. The Unit 5 figures' 14 would come out at about 9 px.
> - **The shape viewer's readouts give the real squeezed angles** for SF₄ (about 102°), ClF₃ (about 87.5°) and BrF₅ (about 85°), instead of saying "slightly".
> - **Writers moved some Checks** next to the idea each one tests, as the rules require, where the brief had placed them later.

Branch: `topic/unit-2-bonds-and-solids`, from an up-to-date `main` after this plan's pull request merges. Tasks 1 to 5. The pull request title is "feat(lessons): Unit 2 lessons 2.1-2.4, Lewis diagrams and the bond-energy diagram".

### Task 1: The Lewis block, and every unit's lessons in the shared tests

**Files:**
- Create: `src/lib/lewis.ts`, `src/components/lesson/Lewis.astro`, `src/components/lesson/Resonance.astro`, `src/styles/lewis.css`
- Modify: `src/layouts/Base.astro` (load `lewis.css` beside `diagram.css`), `src/pages/[unit]/[topic].astro` (`Lewis`, `Resonance` in `blocks`)
- Modify: `tests/e2e/all-lessons.spec.ts`, `tests/e2e/home.spec.ts` (Facts 2 and 3)
- Test: `tests/unit/lewis.test.ts`; `tests/e2e/lewis.spec.ts` (run once lessons 2.2 and 2.3 exist, Tasks 3 and 4)

**Contract.** A lesson writes the markup shown under "Lewis diagrams" in the rules above.

- **Input.** `alt` (required, not blank); `atoms`; `bonds`; optional `ion` and `formalCharges`.
  - Each atom has `id`, `symbol`, `x` and `y` (grid units, `y` downward). It may also have `lonePairs`: a count from 0 to 4, or a list of `'top' | 'right' | 'bottom' | 'left'`. And it may have `unpaired`: one side.
  - Each bond is a tuple `[fromId, toId, order]`, with order 1 to 3.
- **Checks at build time.** Each failure throws, naming the diagram by the start of its alt text:
  - blank alt;
  - an unknown prop or atom field, or a misspelling of one;
  - `formalCharges` given anything but a bare flag or a boolean;
  - duplicate ids, or two atoms at the same spot;
  - a bond to an unknown atom, or an order outside 1 to 3;
  - more than 4 lone pairs, or a lone pair on a side that points along a bond (within 45°);
  - an unknown element (the valence table covers H, He, Li, Be, B, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, K, Ca, Se, Br, Kr, I, Xe and As);
  - **the electron count.** The electrons drawn (2 per unit of bond order, 2 per lone pair, 1 per unpaired electron) must equal the sum of the valence electrons minus `ion`.
- **Lone pairs given as a count.** They go on the four sides, ranked by angular distance from the nearest bond, farthest first. Ties break in the order top, bottom, left, right.
- **Formal charge** is computed as valence minus lone-pair electrons minus bonds. Every non-zero one is shown as `+1` or `−1` (U+2212) at the corner of the letter farthest from its bonds.
- **Drawing.** One inline `<svg role="img" aria-label={alt}>` in `currentColor`, kept out of the search index:
  - bond lines are shortened clear of the letters, with double bonds offset ±3 and triple bonds −5/0/+5;
  - lone pairs are two dots on their side, and an unpaired electron is one dot;
  - an ion gets square brackets with its charge (`+`, `2−`) at the upper right;
  - the viewBox is fitted with a margin, and the drawing scales down to its column.
- **`<Resonance>`** is a `role="group"` labeled "Resonance structures". Between neighboring structures it draws a resonance arrow, hidden from screen readers, and on a narrow screen the structures wrap to new rows. The build fails if it holds fewer than two `<Lewis>`.

**What the unit tests check** (50 in the prototype):
- formal charges: O₃ central +1 and single-bonded O −1; CO₂ all zero; NH₄⁺ N +1;
- the electron count passes for H₂O, CO₂, NH₄⁺, NO₃⁻ and NO₂ (unpaired), and fails with a clear message when a pair is missing;
- every other build-time failure listed above;
- lone-pair side choice and ties;
- bond offsets for each order;
- the viewBox fit;
- an ion's brackets and charge.

**What the browser tests check** (`lewis.spec.ts`):
- every Lewis diagram has an accessible name;
- formal charges and ion charges show;
- a standalone diagram has no resonance arrow, and a resonance group has one arrow fewer than it has structures;
- the arrow is hidden from screen readers;
- a resonance group wraps on a phone.

In Group A it runs on lessons 2.2 and 2.3. The resonance tests move onto lesson 2.6 in Task 7.

**Steps**

- [ ] **Step 1:** Change `all-lessons.spec.ts` and `home.spec.ts` as Facts 2 and 3 describe. Run `npm run test:e2e`: everything still passes, since only Unit 5 has lessons.
- [ ] **Step 2:** Bring in `tests/unit/lewis.test.ts` from the prototype. Run `npx vitest run tests/unit/lewis.test.ts` and watch it fail: the module does not exist.
- [ ] **Step 3:** Bring in `src/lib/lewis.ts`. Run the test again: it passes.
- [ ] **Step 4:** Bring in the two blocks and `lewis.css`, load the stylesheet in `Base.astro`, and add `Lewis` and `Resonance` to `blocks`. `npm test && npm run build`: both pass, and the page count is unchanged.
- [ ] **Step 5:** Dispatch `typescript-reviewer` on the diff. Fix what is right; say why for what is not.
- [ ] **Step 6:** Commit (`feat(lessons): add the Lewis diagram block`, and `test(e2e): run the lesson checks for every unit with lessons` as its own commit).

### Task 2: Lesson 2.1, Types of Chemical Bonds

**Files:**
- Create: `src/content/lessons/unit-2/2-1-types-of-chemical-bonds.mdx`
- Create: `public/figures/2-1-bond-continuum.svg`

**Brief**

- **Front matter:** `topic: "2.1"`, `minutes: 12`, summary: "What electronegativity is, why it changes across the periodic table, and how it sorts bonds into nonpolar covalent, polar covalent, ionic and metallic."
- **Framework (2.1.A):** electronegativity rises across a period and falls down a group, explained by the shell model and Coulomb's law; electrons shared between atoms of similar electronegativity make a nonpolar covalent bond (C–H counts as nonpolar); unequal sharing makes a polar covalent bond, with the more electronegative atom partly negative; in single bonds a bigger difference gives a bigger bond dipole; every polar bond has some ionic character and the line between ionic and covalent is a continuum; a metal with a nonmetal is generally ionic and two nonmetals covalent, but a compound's properties are the best evidence; in a metal the valence electrons are delocalized.
- **Opening:** three white or shiny things on a kitchen counter behave differently. Table salt does not melt in the hottest pan, and conducts electricity once it is melted. Sugar melts and chars in a pan at about 185 °C and never conducts. A copper pot bends without breaking and conducts as a solid. Three kinds of bonding sit behind those three behaviors.
- **Section "Electronegativity":** **electronegativity** is how strongly an atom in a bond pulls the shared electrons toward itself. It rises across a period and falls down a group; fluorine is the highest. Explain both trends with Coulomb's law (the attraction grows with the charge pulling and shrinks with distance): across a period the nucleus gains protons while the valence electrons stay in the same shell, so they are held more tightly; down a group the valence electrons sit in a shell farther from the nucleus, so the pull weakens. A small table of values (Pauling scale, one decimal): H 2.2, Li 1.0, C 2.6, N 3.0, O 3.4, F 4.0, Na 0.9, Mg 1.3, S 2.6, Cl 3.2, K 0.8, Br 3.0. Say the exam does not ask for the numbers, only the trend and what it explains. `<KeyIdea>`: electronegativity is Coulomb's law at work: more nuclear charge pulling, or less distance, means a stronger pull on shared electrons.
- **Check 1**, `<Check answer={2}>`: "Which atom is the most electronegative?" Options: S; Cl; Se; Br. Why: chlorine is to the right of sulfur in the same period, and above bromine in the same group. Selenium is below sulfur, so it is lower than both.
- **Section "Sharing evenly, sharing unevenly":** when two atoms have the same or nearly the same electronegativity they share the bonding electrons evenly: a **nonpolar covalent bond** (Cl–Cl). C–H is treated as nonpolar too: carbon is only slightly more electronegative than hydrogen. Do not state a numerical cutoff. When the atoms differ, the shared pair sits nearer the more electronegative atom: a **polar covalent bond**. That atom carries a partial negative charge, written δ−, and the other δ+. In H–Cl the chlorine is δ−. The two partial charges make a **bond dipole**, and among single bonds, the bigger the difference, the bigger the dipole: H–F (difference 1.8) is more polar than H–Cl (1.0), which is more polar than H–Br (0.8). Mention the dipole arrow: it points toward the δ− end, with a cross at the δ+ end.
- **Worked example "Ranking four bonds to hydrogen":** rank C–H, N–H, O–H and F–H from least to most polar and name the δ− atom in each. (1) Differences from the table: C–H 2.6 − 2.2 = 0.4; N–H 3.0 − 2.2 = 0.8; O–H 3.4 − 2.2 = 1.2; F–H 4.0 − 2.2 = 1.8. (2) Order: C–H < N–H < O–H < F–H. (3) In every one the atom bonded to hydrogen is the more electronegative, so it is δ− and hydrogen is δ+. (4) C–H is the one treated as nonpolar.
- **Check 2**, `<Check answer={2}>`: "Which statement about a C–O bond is true?" Options: the carbon atom is partly negative; the oxygen atom is partly negative; neither atom carries a partial charge; the oxygen atom carries a full −1 charge. Why: oxygen (3.4) is more electronegative than carbon (2.6), so the shared pair sits nearer oxygen. The charge is partial: the electrons are still shared.
- **Section "Not three boxes but a continuum":** at the far end of the scale the difference is so large that the electron is, in effect, transferred: Na (0.9) and Cl (3.2) differ by 2.3, and sodium chloride is made of Na⁺ and Cl⁻ ions held by **ionic bonding**. Every polar bond has some ionic character; there is no sharp line between polar covalent and ionic. Two working rules: a metal with a nonmetal is generally ionic, and two nonmetals are generally covalent (ammonium salts such as NH₄Cl are an exception: they are ionic). The best evidence is the compound's properties: an ionic solid has a high melting point and conducts electricity when melted or dissolved but not as a solid; a solid made of molecules usually melts lower and does not conduct. Place the figure here.
- **Figure** `2-1-bond-continuum.svg`: a horizontal axis labeled "electronegativity difference", ticks at 0, 1, 2 and 3. A band above it shaded from light at the left to dark at the right, with three labels spread along it, not boxed: "nonpolar covalent" near 0, "polar covalent" in the middle, "mostly ionic" toward the right. Example bonds marked as dots on the axis with labels: Cl–Cl at 0, C–H at 0.4, H–Cl at 1.0, H–F at 1.8, Na–Cl at 2.3. Alt: "A horizontal scale of electronegativity difference from 0 to 3, shaded from light to dark with no sharp borders. Nonpolar covalent bonds sit near zero, polar covalent bonds in the middle and mostly ionic bonds toward the right. Marked on it: chlorine to chlorine at 0, carbon to hydrogen at 0.4, hydrogen to chlorine at 1.0, hydrogen to fluorine at 1.8 and sodium to chlorine at 2.3." Caption: "Bond types shade into one another. The larger the difference, the more ionic the bond."
- **Check 3**, `<Check answer={2}>`: "An unknown white solid melts at 770 °C. It does not conduct electricity as a solid, but it does when melted. What kind of bonding holds it together?" Options: metallic; ionic; covalent bonds within molecules, with the molecules held by weak attractions; there is not enough information. Why: a high melting point and conduction only once melted are the signs of an ionic solid. The ions carry the current, and they can move only in the liquid.
- **Section "Metallic bonding":** in a metal the atoms give up their valence electrons to the whole solid. The electrons are **delocalized**: they belong to no single atom and move through a lattice of positive ions. This is why a metal conducts as a solid. Say that topic 2.4 builds the model and uses it to explain why metals bend.
- **Check 4**, `<Check answer={3}>`: "Which pair of atoms forms the bond with the most ionic character?" Options: C and H; N and O; Li and F; Cl and Cl. Why: lithium (1.0) and fluorine (4.0) differ by 3.0, the largest difference of the four; Cl–Cl differs by 0.
- **Trap:** **Calling C–H polar** (carbon and hydrogen are close enough in electronegativity that C–H is treated as nonpolar). **Putting δ− on the wrong atom** (the more electronegative atom is the partly negative one). **Treating ionic and covalent as separate boxes** (they are ends of one continuum, and properties are the best evidence). **Explaining electronegativity with "the atom wants electrons"** (explain it with nuclear charge and distance: Coulomb's law).
- **Key points:** electronegativity is an atom's pull on shared electrons; it rises across a period and falls down a group, because of nuclear charge and distance; equal sharing is nonpolar covalent, unequal sharing is polar covalent with δ− on the more electronegative atom; a bigger difference means a bigger bond dipole, shading into ionic bonding; a metal with a nonmetal is generally ionic, and properties are the best evidence; in a metal the valence electrons are delocalized.

**Steps**

- [ ] **Step 1:** Draw `public/figures/2-1-bond-continuum.svg` as the brief describes, following "Static figures" above.
- [ ] **Step 2:** Write `src/content/lessons/unit-2/2-1-types-of-chemical-bonds.mdx` from the brief, following "Rules for writing a lesson".
- [ ] **Step 3:** **Build and test.**
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** **Commit** (`feat(lessons): add 2.1 Types of Chemical Bonds`).

### Task 3: Lesson 2.2, Intramolecular Force and Potential Energy, with the bond-energy diagram

**Files:**
- Create: `src/lib/bonding.ts`, `src/components/diagrams/BondEnergyCurve.svelte`, `src/components/lesson/BondEnergyCurve.astro`
- Modify: `src/styles/diagram.css` (faint curves, dash patterns, zero line, guide line, marker, atom circles), `src/pages/[unit]/[topic].astro` (`BondEnergyCurve` in `blocks`)
- Create: `src/content/lessons/unit-2/2-2-intramolecular-force-and-potential-energy.mdx`, `public/figures/2-2-hydrogen-curve.svg`
- Test: `tests/unit/bonding.test.ts`, `tests/e2e/diagram-bond-energy-curve.spec.ts`

**Diagram contract.**

- **`bonding.ts`** holds:
  - the curve $E(r) = D[(1 - e^{-a(r - r_0)})^2 - 1]$, in kJ/mol with $r$ in pm;
  - the bond data: C–C 154/347, C=C 134/614, C≡C 120/839, Cl–Cl 199/242, Br–Br 228/193, I–I 267/151;
  - a width $a = \sqrt{k/2D}$ per bond, so each shape is plausible. The shapes are illustrative, and the caption says so;
  - each family's axes: carbon 0–300 pm and −960 to +200 kJ/mol; halogens 0–500 pm and −300 to +150 kJ/mol;
  - the slider range, whose minimum is where the curve enters the top of the graph;
  - the readout sentences.
- **Controls:**
  - "Compare": "Bond order (carbon–carbon)", the default, or "Atom size (halogens)";
  - "Bond": the three bonds of that family;
  - the slider "Distance between the nuclei", 1 pm a step.
  - Switching family goes to that family's first bond at its bond length. Switching bond keeps the distance, clamped to the new range.
- **Drawing:**
  - labeled axes and a zero line "0: separate atoms";
  - the family's three curves, the chosen one emphasized and the others faint, told apart by dash pattern as well as color, each labeled by hand where no curve touches the label;
  - a dot on the chosen curve at the slider's distance, with a dashed guide;
  - above the graph, two atoms (circles of radius 0.2 × the bond length) whose centers sit over 0 pm and over the slider's distance.
- **The readout** has four states:
  - *at the bond length:* "The nuclei are 154 pm apart, the bond length of C–C. The energy is at its lowest: 347 kJ/mol below that of the separate atoms."
  - *within 3 pm of it:* "close to the bond length ...";
  - *closer:* "... The nuclei repel each other, and the energy climbs steeply.";
  - *farther:* "... The atoms pull back toward each other; far enough apart they no longer interact and the energy is zero."

  Bond names carry word joiners, so "C–C" never breaks across lines. The starting state is C–C at 154 pm.

**What the tests check:**
- **Unit tests (34):** each curve's minimum is at $r_0$ with depth $-D$; the curve rises steeply below $r_0$ and approaches 0 far away; the inverse that finds the repulsive wall; the slider range; every readout state.
- **Browser tests:**
  - the starting state;
  - the slider moves the dot and changes the readout from the keyboard;
  - switching family or bond redraws and keeps the readout right;
  - the chosen curve's minimum is drawn at its bond length;
  - no curve label touches a curve;
  - with JavaScript off, the drawing and the starting readout show without controls.

**Steps**

- [ ] **Step 1:** Bring in `tests/unit/bonding.test.ts`; watch it fail (no module). Bring in `bonding.ts`; watch it pass.
- [ ] **Step 2:** Draw `public/figures/2-2-hydrogen-curve.svg` and write the lesson from the brief, with `<BondEnergyCurve />` where the brief places it.
- [ ] **Step 3:** Bring in `tests/e2e/diagram-bond-energy-curve.spec.ts`. Run it: it fails, because the block does not exist yet and the build stops on the unknown `<BondEnergyCurve />`.
- [ ] **Step 4:** Bring in the Svelte diagram, its Astro block and its `diagram.css` rules; add it to `blocks`. Run it again: it passes.
- [ ] **Step 5:** **Build and test**, **Look at it** (the diagram at 412, 390, 360 and 320 px, light and dark, with each family chosen), **Fact-check, independently**.
- [ ] **Step 6:** Dispatch `typescript-reviewer` on the code. Commit the diagram (`feat(diagrams): add the bond-energy curve`) and the lesson (`feat(lessons): add 2.2 Intramolecular Force and Potential Energy`).

**Brief**

- **Front matter:** `topic: "2.2"`, `minutes: 12`, summary: "How a graph of energy against the distance between two nuclei shows a bond's length and strength, and how bond order, atom size and ion charge change them."
- **Framework (2.2.A):** a graph of potential energy against internuclear distance shows the bond length (the distance where the energy is lowest) and the bond energy (the energy needed to separate the atoms); covalent bond length depends on the size of the atoms' cores and on bond order; higher-order bonds are shorter and have larger bond energies; Coulomb's law explains the strength of attraction between cations and anions: larger charges attract more strongly, and smaller ions, whose centers can get closer, attract more strongly.
- **Opening:** two hydrogen atoms far apart do not notice each other. Bring them closer and each nucleus starts to pull on the other atom's electron: the energy falls. Push them too close and the two nuclei repel: the energy shoots up. Somewhere in between is the most comfortable distance. That distance is a bond.
- **Section "The energy of two atoms":** describe the graph for two hydrogen atoms. Far apart, the energy is zero. As they approach, attraction lowers it. At 74 pm it is lowest: that distance is the **bond length**. Closer still, the repulsion between the nuclei wins and the energy climbs steeply. How deep the valley is gives the **bond energy**: the energy needed to pull a mole of bonds apart into separate atoms, 436 kJ/mol for H₂. Show the Lewis diagram of H₂ (two H atoms, one single bond) beside the text. Place the figure here.
- **Figure** `2-2-hydrogen-curve.svg`: axes "potential energy (kJ/mol)" (y, with a dashed zero line labeled "0: atoms far apart") and "distance between nuclei (pm)" (x). One curve that falls from high at short distance to a minimum and rises gently toward zero at long distance. A dashed vertical line from the minimum down to the x-axis labeled "bond length, 74 pm"; a two-headed arrow from the zero line down to the minimum labeled "bond energy, 436 kJ/mol". Short labels on the curve: "nuclei repel" on the steep left side, "atoms attract" on the gentle right side. Alt: "Graph of potential energy against the distance between two hydrogen nuclei. The curve is high at very short distances, where the nuclei repel, falls to a lowest point at 74 picometers, then rises gently toward zero as the atoms move apart. The distance of the lowest point is the bond length, 74 picometers. The depth of the lowest point below zero is the bond energy, 436 kilojoules per mole." Caption: "The bottom of the valley gives the bond length across and the bond energy down."
- `<KeyIdea>`: read across to the bottom of the valley for the bond length; read down from zero to the bottom for the bond energy. Breaking a bond always takes energy; forming one releases it.
- **Check 1**, `<Check answer={2}>`: "On a graph of potential energy against distance between two nuclei, where do you read the bond length?" Options: where the curve crosses zero; at the lowest point of the curve; at the far right, where the curve levels off; where the curve is steepest. Why: the bond length is the distance at which the energy is lowest. That is where the atoms settle.
- **Section "Order and size":** two things set a covalent bond's length and energy. Bond order: a double bond is shorter and stronger than a single bond between the same atoms, and a triple bond more so: C–C 154 pm and 347 kJ/mol, C=C 134 pm and 614 kJ/mol, C≡C 120 pm and 839 kJ/mol. Atom size: bigger atoms keep their nuclei farther apart, so the bond is longer and weaker: Cl–Cl 199 pm and 242 kJ/mol, Br–Br 228 pm and 193 kJ/mol, I–I 267 pm and 151 kJ/mol. Say these are typical values; a bond's exact energy varies a little from compound to compound. Introduce the diagram with one sentence ("Choose a bond and move the nuclei."), then place `<BondEnergyCurve />`.
- **Check 2**, `<Check answer={3}>`: "Carbon and oxygen can be joined by a single, a double or a triple bond. Which is the shortest?" Options: the single bond; the double bond; the triple bond; all three are the same length. Why: the more electron pairs shared between the same two atoms, the shorter and stronger the bond.
- **Section "Ions and Coulomb's law":** between ions the attraction follows Coulomb's law: it is proportional to the product of the charges and grows as the distance between the ions' centers shrinks. So larger charges attract more strongly, and smaller ions, whose centers get closer, attract more strongly. The energy needed to pull the ions of a mole of an ionic solid apart is often called its lattice energy (not in bold: the framework does not use the term); the stronger the attraction, the larger it is. Compare charges first: a change in charge usually matters more than a change in size. Only when the charges tie, compare the sizes.
- **Worked example "Ranking three ionic compounds":** rank MgO, NaF and NaCl by the strength of attraction between their ions. (1) Charges: MgO is made of Mg²⁺ and O²⁻, so the sizes of the charges multiply to 2 × 2 = 4; NaF and NaCl are made of 1+ and 1− ions, 1 × 1 = 1. MgO is strongest. (2) Between NaF and NaCl the charges are the same, so compare size: F⁻ is smaller than Cl⁻, so the ions in NaF get closer and attract more strongly. (3) Order: MgO > NaF > NaCl. (4) The melting points agree: about 2800 °C, about 990 °C and 801 °C.
- **Check 3**, `<Check answer={3}>`: "Which compound has the strongest attraction between its ions?" Options: KBr; KCl; CaO; NaCl. Why: CaO is made of 2+ and 2− ions; the other three are made of 1+ and 1− ions. The larger charges win.
- **Check 4**, `<Check answer={1}>`: "NaF and NaCl have ions of the same charges. Which has the stronger attraction between its ions, and why?" Options: NaF, because F⁻ is smaller than Cl⁻; NaCl, because Cl⁻ is larger than F⁻; NaF, because fluorine has a larger charge than chlorine; they are the same, because the charges are the same. Why: with the charges equal, size decides. The smaller F⁻ lets the ions' centers get closer.
- **Trap:** **Reading the bond length where the curve crosses zero** (read it at the lowest point). **Saying the bottom of the valley is "where the attraction stops"** (it is where attraction and repulsion balance). **Saying that breaking a bond releases energy** (breaking a bond always takes energy; making one releases it). **Mixing up the order trend** (a higher-order bond is both shorter and stronger). **Comparing ion sizes before charges** (look at the charges first).
- **Key points:** the lowest point of the energy curve gives the bond length; its depth below zero gives the bond energy; breaking a bond takes energy; higher bond order means shorter and stronger; bigger atoms make longer, weaker bonds; between ions, larger charges and smaller ions mean stronger attraction.

### Task 4: Lesson 2.3, Structure of Ionic Solids

**Files:**
- Create: `src/content/lessons/unit-2/2-3-structure-of-ionic-solids.mdx`
- Create: `public/figures/2-3-ionic-lattice.svg`, `public/figures/2-3-brittle.svg`

**Brief**

- **Front matter:** `topic: "2.3"`, `minutes: 10`, summary: "How cations and anions pack into a regular three-dimensional pattern, how to draw that pattern, and why it makes ionic solids hard, brittle and high-melting."
- **Framework (2.3.A):** in an ionic crystal the cations and anions are arranged in a systematic, repeating three-dimensional array that maximizes attractions between opposite charges and minimizes repulsions between like charges; a particulate model should be consistent with Coulomb's law and with the ions' properties. Knowledge of specific crystal structures is not assessed.
- **Opening:** look at grains of table salt under a magnifying glass: tiny cubes with flat faces and square corners. The outside of the crystal shows the order of the ions inside.
- **Section "Every ion surrounded by opposites":** in an ionic solid each cation is surrounded by anions and each anion by cations, in a pattern that repeats in three dimensions. Opposite charges are as close as they can get, and like charges are kept apart: that is the arrangement Coulomb's law favors. There are no molecules: the formula NaCl gives the ratio of ions, one Na⁺ for each Cl⁻, and a crystal of MgCl₂ has two Cl⁻ for each Mg²⁺. Show the Lewis diagrams of the two ions in sodium chloride side by side: Na⁺ (no dots, in brackets with "+") and Cl⁻ (four lone pairs, in brackets with "−"). Place the figure here.
- **Figure** `2-3-ionic-lattice.svg`: a flat slice through an ionic solid: a 6 × 5 grid of circles alternating between larger anions (lightly shaded, marked "−") and smaller cations (darker, marked "+"), so that every neighbor of a cation, up, down, left and right, is an anion. Label one cation and one anion. Alt: "A flat grid of circles representing a slice of an ionic solid. Large circles marked with a minus sign alternate with small circles marked with a plus sign, so every circle's neighbors above, below, left and right carry the opposite charge." Caption: "A slice through sodium chloride. The real pattern repeats in three dimensions." Label the larger circles "Cl⁻" and the smaller "Na⁺" rather than only − and +.
- `<KeyIdea>`: a good particulate model shows opposite charges side by side, like charges apart, the ratio given by the formula, and each ion drawn at its relative size.
- **Section "Drawing the ions to size":** ions are not all the same size, and a model should show it. A cation is smaller than the atom it came from, and an anion larger. In sodium chloride the chloride ion (radius 181 pm) is much bigger than the sodium ion (radius 102 pm). In most common salts the anion is the larger ion, but not in all: K⁺ (138 pm) is larger than F⁻ (133 pm).
- **Worked example "Fixing a model of lithium fluoride":** a student drew lithium fluoride as a grid in which the Li⁺ circles are bigger than the F⁻ circles and two Li⁺ ions sit side by side. (1) Sizes: Li⁺ has a radius of about 76 pm and F⁻ about 133 pm, so the F⁻ circles must be the larger ones. (2) Neighbors: two Li⁺ ions side by side would repel; every Li⁺ must be surrounded by F⁻ ions. (3) Ratio: LiF has one Li⁺ for each F⁻, so the grid must have equal numbers of each. (4) The corrected model alternates small Li⁺ and large F⁻ circles.
- **Check 1**, `<Check answer={2}>`: "Why do ionic solids generally have high melting points?" Options: their molecules are very heavy; melting requires overcoming strong attractions between many oppositely charged ions; their covalent bonds must be broken to melt them; ions cannot move even in a liquid. Why: in the solid every ion is held by attractions to all its oppositely charged neighbors. Melting means pulling them free of that arrangement, which takes a lot of energy. The same attractions, pulling in every direction, make the solid hard.
- **Section "Brittle, and a conductor only when melted":** strike an ionic crystal and a layer shifts by one ion. Now cations sit next to cations and anions next to anions; the like charges repel and the crystal splits along that plane. Place the second figure here. The ions carry electric charge, but in the solid they are locked in place, so the solid does not conduct; melted or dissolved in water, the ions can move and carry a current.
- **Figure** `2-3-brittle.svg`: two panels side by side, each a 4 × 3 grid of alternating + and − circles. Left panel, "before": the regular alternating pattern, with an arrow pushing the top row sideways. Right panel, "after the shift": the top row moved by one ion, so each ion in the top row sits directly above an ion of the same charge, with small outward arrows between them marked "repel". Alt: "Two grids of alternating positive and negative ions. In the first the top row is about to be pushed sideways. In the second the top row has moved by one ion, so each ion sits above an ion with the same charge, and arrows show the like charges repelling." Caption: "Shift one layer and like charges meet. The crystal cracks instead of bending."
- **Check 2**, `<Check answer={3}>`: "A crystal of potassium chloride shatters when struck with a hammer. Why?" Options: the hammer breaks the covalent bonds inside the crystal; the ions are pushed so close together that they turn into atoms; a shifted layer puts ions of the same charge next to each other, and they repel; the delocalized electrons are knocked out of the crystal. Why: the blow moves one layer against the next. Like charges end up side by side and push the layers apart.
- **Check 3**, `<Check answer={2}>`: "When does sodium chloride conduct electricity?" Options: only as a solid; only when melted or dissolved in water; in every state; never, because it contains no free electrons. Why: the current is carried by moving ions. They are fixed in the solid and free to move in the melt or in solution.
- **Trap:** **Drawing NaCl as separate molecules** (an ionic solid is one continuous array; the formula is a ratio). **Drawing every ion the same size** (show the relative sizes). **Saying an ionic solid conducts** (only when its ions can move). **Learning crystal structures by name** (the exam does not ask for specific structures; what matters is opposite charges together and like charges apart).
- **Key points:** an ionic solid is a repeating 3-D array of cations and anions; each ion is surrounded by ions of the opposite charge, maximizing attraction and minimizing repulsion; the formula gives the ratio of ions, not a molecule; a model should show the ratio and the relative sizes; ionic solids melt high, are brittle, and conduct only when melted or dissolved.

**Steps**

- [ ] **Step 1:** Draw both figures as the brief describes, following "Static figures" above.
- [ ] **Step 2:** Write `src/content/lessons/unit-2/2-3-structure-of-ionic-solids.mdx` from the brief, following "Rules for writing a lesson".
- [ ] **Step 3:** **Build and test.**
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** Bring in `tests/e2e/lewis.spec.ts`, pointed at lessons 2.2 and 2.3 (the resonance tests wait for Task 7). Run it: it passes, because Task 1's block exists. Then break the block on purpose (comment out the `aria-label`), watch the accessible-name test fail, and restore it.
- [ ] **Step 7:** **Commit** (`feat(lessons): add 2.3 Structure of Ionic Solids`; `test(e2e): check Lewis diagrams on the lesson pages` as its own commit).

### Task 5: Lesson 2.4, Structure of Metals and Alloys

**Files:**
- Create: `src/content/lessons/unit-2/2-4-structure-of-metals-and-alloys.mdx`
- Create: `public/figures/2-4-metallic-bonding.svg`, `public/figures/2-4-alloys.svg`

**Brief**

- **Front matter:** `topic: "2.4"`, `minutes: 10`, summary: "The sea-of-electrons model of a metal, what it explains, and how substitutional and interstitial alloys differ."
- **Framework (2.4.A):** metallic bonding is modeled as an array of positive metal ions surrounded by delocalized valence electrons, a "sea of electrons"; interstitial alloys form between atoms of very different radii, the smaller atoms filling the spaces between the larger ones (carbon in iron, in steel); substitutional alloys form between atoms of similar radii, one replacing the other in the lattice (zinc for copper, in brass).
- **Opening:** bend a paper clip and it stays bent. Hit a salt crystal and it shatters. Both are solids held together by electric attraction, so why does one bend and the other break?
- **Section "A sea of electrons":** a metal is a regular array of positive ions, the atoms minus their valence electrons. The valence electrons are **delocalized**: they are shared by the whole solid, not by pairs of atoms, and move freely among the ions. The attraction between the ions and the electron sea is the **metallic bond**. Place the figure here.
- **Figure** `2-4-metallic-bonding.svg`: a 6 × 4 grid of equal circles marked "+", packed close, with small dots marked "e⁻" scattered in the spaces between them, unevenly, as if moving. Alt: "A grid of positive metal ions, all the same size, with many small electron dots scattered in the spaces between them." Caption: "Positive ions in a sea of electrons that belong to the whole metal."
- **Section "What the model explains":** **conductivity**: the delocalized electrons move when a voltage is applied, so a metal conducts as a solid. **Malleability and ductility**: when a layer of ions slides past the next, the electron sea moves with it; after the slide each ion is still surrounded by the electron sea, so no new repulsion appears and the metal bends instead of breaking. Contrast with an ionic crystal in topic 2.3. The same mobile electrons carry heat through a metal and give it its shine. `<KeyIdea>`: in an ionic solid a shift puts like charges side by side; in a metal the electron sea flows along with the ions and keeps holding them, so the metal deforms instead.
- **Check 1**, `<Check answer={3}>`: "Why does a copper wire conduct electricity as a solid, while solid sodium chloride does not?" Options: copper atoms are smaller than sodium ions; copper has stronger bonds than sodium chloride; copper's valence electrons are delocalized and free to move, while the ions in solid sodium chloride are fixed in place; sodium chloride contains no charged particles. Why: a current needs moving charges. Copper has its electron sea; sodium chloride's ions cannot move until the solid melts or dissolves.
- **Section "Alloys":** an **alloy** is a metal mixed with one or more other elements. Most alloys are solid solutions, a kind of mixture: their composition can vary. Atom size decides how the second element fits in. In a **substitutional alloy** the atoms are of similar size, and atoms of one element take the places of atoms of the other in the lattice: in brass, zinc atoms (radius about 134 pm) replace some of the copper atoms (about 128 pm). In an **interstitial alloy** the second element's atoms are much smaller and fit into the holes between the larger atoms: in steel, carbon atoms (about 77 pm) sit in the spaces between iron atoms (about 126 pm). Place the figure here.
- **Figure** `2-4-alloys.svg`: two panels side by side, each a 5 × 4 grid of large circles. Left, "substitutional": a few of the large circles replaced by circles of nearly the same size but a different shade. Right, "interstitial": all large circles the same, with small circles placed in some of the gaps between them. Alt: "Two grids of metal atoms. In the first, some atoms have been replaced by atoms of another element of about the same size. In the second, small atoms of another element sit in the gaps between the larger metal atoms." Caption: "Similar sizes swap places. A much smaller atom fits into the gaps."
- **Worked example "Which kind of alloy?":** (1) Nickel (radius about 124 pm) mixed into copper (about 128 pm): the radii are within a few percent of each other, so nickel atoms replace copper atoms: substitutional. (2) Carbon (about 77 pm) mixed into iron (about 126 pm): carbon is much smaller and fits into the gaps: interstitial. (3) The rule: compare the radii. Similar sizes swap places; a much smaller atom goes between.
- **Section "Why alloys are harder":** atoms of a different size in the lattice make it harder for layers to slide. Steel is harder and stronger, and less malleable and ductile, than pure iron, because carbon atoms in the gaps lock the iron layers in place. Brass is harder than pure copper.
- **Check 2**, `<Check answer={1}>`: "A metal's atoms have a radius of 140 pm. Atoms of a second element, with a radius of 60 pm, are added. What kind of alloy forms?" Options: interstitial; substitutional; ionic; no alloy can form. Why: the added atoms are less than half the size of the metal's atoms, small enough to fit into the gaps between them.
- **Check 3**, `<Check answer={2}>`: "Compared with pure iron, how does steel behave when you try to bend it?" Options: it bends more easily, because carbon adds electrons to the sea; it is harder to bend, because carbon atoms in the gaps keep the iron layers from sliding; it shatters, because carbon makes it ionic; it behaves the same, because carbon atoms are so small. Why: the interstitial carbon atoms get in the way when layers try to slide, so steel is stiffer and stronger.
- **Trap:** **Describing metal atoms as sharing electrons in pairs** (the electrons are delocalized over the whole solid). **Explaining malleability by calling metals "soft"** (explain it with layers sliding while the electron sea holds them). **Mixing up the two alloys** (substitutional: similar size, replaced; interstitial: much smaller, in the gaps). **Calling an alloy a compound** (most alloys are solid solutions whose composition can vary).
- **Key points:** a metal is an array of positive ions in a sea of delocalized electrons; moving electrons make metals conduct as solids; the electron sea lets layers slide, so metals bend; a substitutional alloy forms from atoms of similar size, one replacing the other (brass); an interstitial alloy forms when much smaller atoms fill the gaps (steel); both kinds are usually harder than the pure metal.

**Steps**

- [ ] **Step 1:** Draw both figures as the brief describes, following "Static figures" above.
- [ ] **Step 2:** Write `src/content/lessons/unit-2/2-4-structure-of-metals-and-alloys.mdx` from the brief, following "Rules for writing a lesson".
- [ ] **Step 3:** **Build and test.**
- [ ] **Step 4:** **Look at it.**
- [ ] **Step 5:** **Fact-check, independently.**
- [ ] **Step 6:** **Commit** (`feat(lessons): add 2.4 Structure of Metals and Alloys`).
- [ ] **Step 7:** Push the branch and open pull request A. Its body lists the four lessons, the two code pieces, what the fact-checks changed, the phone measurements and the test counts. Wait for "Build and test" to pass, then stop for the teacher's merge.

---

## Group B: Lewis diagrams, resonance and formal charge (pull request B)

Branch: `topic/unit-2-lewis`, from `main` after pull request A merges. Tasks 6 and 7. Title: "feat(lessons): Unit 2 lessons 2.5 and 2.6".

### Task 6: Lesson 2.5, Lewis Diagrams

**Files:**
- Create: `src/content/lessons/unit-2/2-5-lewis-diagrams.mdx`

**Brief**

- **Front matter:** `topic: "2.5"`, `minutes: 15`, summary: "How to draw a Lewis diagram for a molecule or ion, step by step, and the atoms that do not end up with an octet."
- **Framework (2.5.A):** Lewis diagrams are built according to an established set of principles.
- **Opening:** a Lewis diagram is bookkeeping. Every valence electron in the molecule is accounted for: either shared in a bond between two atoms, or sitting on one atom as a lone pair. If the books do not balance, the diagram is wrong.
- **Section "Counting the electrons":** for a main-group element the number of valence electrons is the last digit of its group number (carbon is in group 14, so 4): 1 for H, 4 for C, 5 for N, 6 for O, 7 for F and Cl. Add them up for every atom. For a negative ion add one electron per unit of charge; for a positive ion take one away. Examples: CH₄ has 4 + 4 × 1 = 8; NH₄⁺ has 5 + 4 − 1 = 8; CO₃²⁻ has 4 + 3 × 6 + 2 = 24. A **bonding pair** is shared; a **lone pair** belongs to one atom.
- **Check 1**, `<Check numeric="32">`: "How many valence electrons does the sulfate ion, $\ce{SO4^2-}$, have?" Why: $6 + 4 \times 6 + 2 = 32$. Sulfur and each oxygen bring 6, and the 2− charge adds two more.
- **Section "Five steps":** (1) Count the valence electrons. (2) Write the skeleton: the central atom is usually the least electronegative one; hydrogen is never central, because it forms only one bond. (3) Join each outer atom to the center with a single bond (two electrons each). (4) Give each outer atom lone pairs until it has eight electrons around it (hydrogen: two). (5) Put any electrons left over on the central atom. If the central atom still has fewer than eight, move a lone pair from an outer atom into a double bond (or two, into a triple bond) until it has eight (boron is the exception; see below). `<KeyIdea>`: check twice at the end: the number of electrons drawn must equal the count, and every C, N, O and F should have eight (hydrogen two). Boron may stop at six, and a molecule with an odd number of electrons must leave one atom short.
- **Worked example "Water":** (1) $2 \times 1 + 6 = 8$ electrons. (2) O is central. (3) Two O–H bonds use 4. (4) Each H already has its two. (5) The 4 left go on O as two lone pairs; O has eight. Show `<Lewis>` of H₂O drawn flat: H, O, H in a row, two lone pairs on O (top and bottom).
- **Worked example "Carbon dioxide":** (1) $4 + 2 \times 6 = 16$. (2) C is central (less electronegative than O). (3) Two C–O bonds use 4, leaving 12. (4) Each O gets three lone pairs: 12 used, none left. (5) C has only four electrons. Move one lone pair from each O into a bond: O=C=O, each O with two lone pairs, every atom with eight. Show `<Lewis>` of CO₂ in a row.
- **Check 2**, `<Check answer={1}>`: "Which is the correct Lewis diagram for HCN, with carbon in the middle?" Options: H–C≡N, with one lone pair on N; H–C=N, with two lone pairs on N; H–C≡N, with no lone pairs; H–C–N, with three lone pairs on N. Why: HCN has $1 + 4 + 5 = 10$ valence electrons. H–C≡N with one lone pair on N uses all ten and gives C and N eight each. With the double bond, carbon has only six. With no lone pair, only eight electrons are drawn. With single bonds, carbon has only four.
- **Section "Ions":** draw the ion's diagram with the adjusted count, put it in square brackets and write the charge outside at the upper right. Show `<Lewis>` of NH₄⁺: N in the center with four H around it (top, bottom, left, right), no lone pairs, in brackets with "+".
- **Section "When eight is not the number":** hydrogen holds two. Boron is often satisfied with six, as in BF₃ (show `<Lewis>`: B central, three F each with three lone pairs; B has six). A central atom from the third period or below can be drawn with more than eight electrons around it in a Lewis diagram: SF₆ has twelve around sulfur, PCl₅ ten around phosphorus. Show `<Lewis>` of SF₆: S at the center, F atoms left, right, above and below, and two more on diagonals (upper right and lower left, at `x: 1, y: -1` and `x: -1, y: 1`); every F with three lone pairs, S with none. Do not explain why expansion is possible (the usual d-orbital story is excluded and disputed). Atoms of the second period (C, N, O, F) never hold more than eight. A molecule with an odd number of electrons, such as NO or NO₂, must leave one electron unpaired; topic 2.6 takes this up.
- **Check 3**, `<Check answer={2}>`: "How many lone pairs are on the nitrogen atom in ammonia, NH₃?" Options: 0; 1; 2; 3. Why: NH₃ has $5 + 3 = 8$ electrons. Three N–H bonds use six, and the remaining two sit on N as one lone pair.
- **Check 4**, `<Check answer={1}>`: "In which molecule does the central atom have fewer than eight electrons around it?" Options: BF₃; NF₃; CF₄; OF₂. Why: boron has only three valence electrons and forms three bonds, so it has six around it. N, C and O each reach eight.
- **Check 5**, `<Check answer={1}>`: "A student's Lewis diagram of the carbonate ion, $\ce{CO3^2-}$, shows 22 electrons. What went wrong?" Options: the 2− charge was not counted, and it adds two electrons; oxygen was counted with 5 valence electrons instead of 6; carbon should have been given an expanded octet; a carbonate ion has 22 electrons, so nothing went wrong. Why: $4 + 3 \times 6 = 22$ is the count for the neutral atoms. The 2− charge means two extra electrons: 24.
- **Trap:** **Forgetting the charge of an ion** (add electrons for a negative charge, remove them for a positive one). **Putting hydrogen in the middle** (it forms only one bond). **Counting a bond as one electron** (every bond line is two electrons). **Leaving the central atom short** (make a multiple bond from an outer atom's lone pair). **Giving C, N, O or F more than eight** (only atoms from the third period down are drawn with more).
- **Key points:** count the valence electrons and adjust for charge; least electronegative atom in the middle, never hydrogen; single bonds first, then outer atoms' octets, then the center; fix a short central atom with multiple bonds; second-period atoms never exceed eight, hydrogen holds two, boron is often content with six, and atoms from the third period down can hold more than eight.

**Steps**

- [ ] **Step 1:** Write `src/content/lessons/unit-2/2-5-lewis-diagrams.mdx` from the brief, following "Rules for writing a lesson".
- [ ] **Step 2:** **Build and test.**
- [ ] **Step 3:** **Look at it.**
- [ ] **Step 4:** **Fact-check, independently.**
- [ ] **Step 5:** **Commit** (`feat(lessons): add 2.5 Lewis Diagrams`).

### Task 7: Lesson 2.6, Resonance and Formal Charge

**Files:**
- Create: `src/content/lessons/unit-2/2-6-resonance-and-formal-charge.mdx`

**Brief**

- **Front matter:** `topic: "2.6"`, `minutes: 15`, summary: "Why some molecules need more than one Lewis diagram, how formal charge picks the best diagram, and where the Lewis model breaks down."
- **Framework (2.6.A):** where more than one equivalent Lewis structure can be drawn, resonance must be included as a refinement, often needed for accurate predictions of structure and properties; the octet rule and formal charge are criteria for choosing which of several valid Lewis diagrams is the best model; the Lewis model has limits, especially for molecules with an odd number of valence electrons.
- **Opening:** draw ozone, O₃, by the five steps of topic 2.5 and you get one double bond and one single bond. But measurements show both O–O bonds in ozone are the same length, 128 pm: between an O–O single bond (148 pm) and an O=O double bond (121 pm). One diagram cannot show that.
- **Section "Resonance":** when two or more equivalent Lewis diagrams can be drawn that differ only in where the electron pairs go, no single one is right. The real molecule is a blend of them, a **resonance hybrid**, and the diagrams are joined by a double-headed arrow. The molecule does not switch between them. In ozone each O–O bond is "one and a half" bonds: a bond order of 1.5. Show `<Resonance>` of the two ozone diagrams (with `formalCharges`, so the +1 on the central O and the −1 on the singly bonded O show).
- **Worked example "Nitrate ion":** (1) $5 + 3 \times 6 + 1 = 24$ electrons. (2) N is central, with three O. (3) Single bonds and octets on the oxygens use all 24, and N has six. (4) A double bond to one O gives N eight. Any of the three O atoms could take the double bond: three equivalent diagrams. (5) The real ion has three identical N–O bonds, each with a bond order of $4/3$: four bonding pairs shared over three bonds. Show `<Resonance>` of the three nitrate diagrams, each in brackets with "−".
- **Check 1**, `<Check answer={3}>`: "How many equivalent resonance structures does the carbonate ion, $\ce{CO3^2-}$, have?" Options: 1; 2; 3; 4. Why: the double bond can go to any one of the three oxygen atoms.
- **Check 2**, `<Check answer={2}>`: "What is the average bond order of the C–O bonds in the carbonate ion?" Options: 1; $4/3$; $3/2$; 2. Why: four bonding pairs (one double bond and two single bonds) are spread over three equal bonds: $4/3$.
- **Section "Formal charge":** sometimes the diagrams you can draw are not equivalent, and one is a better model than the others. **Formal charge** is a bookkeeping charge for each atom: $\text{formal charge} = \text{valence electrons} - \text{lone-pair electrons} - \text{bonds}$, counting each bond (each line) once. The formal charges in a diagram add up to the charge of the molecule or ion. The best diagram has formal charges as close to zero as possible, and puts any negative formal charge on the more electronegative atom. Second-period atoms still never go beyond eight. One line of caution: for a third-period central atom, such as sulfur in sulfate, the octet rule and formal charge can point to different diagrams, and both are seen. Do not use sulfate or phosphate as a formal-charge example.
- **Worked example "Two diagrams for carbon dioxide":** compare O=C=O with O≡C–O (the triple-bonded O with one lone pair, the single-bonded O with three). (1) In O=C=O: C has $4 - 0 - 4 = 0$; each O has $6 - 4 - 2 = 0$. (2) In O≡C–O: C has $4 - 0 - 4 = 0$; the triple-bonded O has $6 - 2 - 3 = +1$; the single-bonded O has $6 - 6 - 1 = -1$. (3) Both add up to zero, but O=C=O has no formal charges at all, so it is the better model. Show both `<Lewis>` diagrams with `formalCharges`.
- **Check 3**, `<Check answer={1}>`: "Which arrangement gives every atom a formal charge of zero?" Options: H–C≡N, with one lone pair on N; H–N≡C, with one lone pair on C; both; neither. Why: in H–C≡N, carbon has $4 - 0 - 4 = 0$ and nitrogen $5 - 2 - 3 = 0$. In H–N≡C, nitrogen has $5 - 0 - 4 = +1$ and carbon $4 - 2 - 3 = -1$.
- **Check 4**, `<Check answer={2}>`: "What is the formal charge on nitrogen in the ammonium ion, $\ce{NH4+}$?" Options: 0; +1; −1; +4. Why: nitrogen has 5 valence electrons, no lone pairs and four bonds: $5 - 0 - 4 = +1$. It equals the ion's charge, since every H is 0.
- **Section "Where the Lewis model breaks down":** a molecule with an odd number of valence electrons cannot give every atom eight. Nitrogen dioxide, NO₂, has $5 + 2 \times 6 = 17$. The usual diagram leaves nitrogen with seven, one electron unpaired. Show `<Resonance>` of the two NO₂ diagrams with `formalCharges` (one double bond, one single bond, the unpaired electron on N; the block shows N +1 and the singly bonded O −1). Here the rules disagree with the evidence: formal charge alone would put the odd electron on an oxygen, which gives every atom a formal charge of zero. But two NO₂ molecules readily pair up into N₂O₄ through a bond between the two nitrogen atoms, which shows the unpaired electron sits mostly on nitrogen. Molecules with an unpaired electron tend to be reactive in this way. Resonance itself is a sign of the model's limits: one diagram is not enough to describe the molecule. And NO₂ shows that the rules for picking a diagram are guides, not laws.
- **Check 5**, `<Check answer={3}>`: "Why can't every atom in NO₂ be given an octet?" Options: nitrogen is in the second period; oxygen is more electronegative than nitrogen; the molecule has an odd number of valence electrons, 17; NO₂ has resonance structures. Why: electrons in a Lewis diagram come in pairs. With 17 one must be left unpaired, so some atom has fewer than eight.
- **Trap:** **Thinking a molecule flips between resonance structures** (it is one blend all the time). **Moving atoms between resonance structures** (only electron pairs move; atoms stay put). **Treating formal charge as a real charge** (it is bookkeeping; the real charge distribution follows electronegativity). **Picking a diagram that gives C, N or O more than eight** (formal charge never justifies that). **Formal charges that do not add up to the ion's charge** (check the sum).
- **Key points:** when equivalent diagrams exist, the molecule is a resonance hybrid of them, with averaged bonds; resonance structures differ only in where electrons go; formal charge = valence electrons − lone-pair electrons − bonds, and the charges add up to the overall charge; the best diagram keeps formal charges near zero with any negative one on the more electronegative atom; odd-electron molecules cannot satisfy the octet rule.

**Steps**

- [ ] **Step 1:** Write `src/content/lessons/unit-2/2-6-resonance-and-formal-charge.mdx` from the brief, following "Rules for writing a lesson".
- [ ] **Step 2:** **Build and test.**
- [ ] **Step 3:** **Look at it.**
- [ ] **Step 4:** **Fact-check, independently.**
- [ ] **Step 5:** Point the resonance tests in `tests/e2e/lewis.spec.ts` at this lesson's ozone `<Resonance>` and run them: they pass.
- [ ] **Step 6:** **Commit** (`feat(lessons): add 2.6 Resonance and Formal Charge`).
- [ ] **Step 7:** Push and open pull request B; wait for the check; stop for the teacher's merge.

---

## Group C: shapes (pull request C)

Branch: `topic/unit-2-shapes`, from `main` after pull request B merges. Tasks 8 and 9. Title: "feat(lessons): Unit 2 lesson 2.7 and the shape viewer".

### Task 8: Lesson 2.7, VSEPR and Hybridization, with the shape viewer

**Files:**
- Create: `src/lib/vsepr.ts`, `src/components/diagrams/ShapeViewer.svelte`, `src/components/lesson/ShapeViewer.astro`
- Modify: `src/styles/diagram.css` (select box, button, viewer), `src/pages/[unit]/[topic].astro` (`ShapeViewer` in `blocks`)
- Create: `src/content/lessons/unit-2/2-7-vsepr-and-hybridization.mdx`, `public/figures/2-7-electron-geometries.svg`
- Test: `tests/unit/vsepr.test.ts`, `tests/e2e/diagram-shape-viewer.spec.ts`

**Viewer contract.**

- **`vsepr.ts`** holds:
  - the ideal domain directions for 2–6 domains as unit vectors: linear; trigonal planar; tetrahedral; trigonal bipyramidal, with 2 axial and 3 equatorial; octahedral;
  - where lone pairs go: equatorial first for five domains, opposite each other for six;
  - yaw and pitch rotation, orthographic projection and depth order;
  - the 13 molecules: CO₂, BF₃, SO₂, CH₄, NH₃, H₂O, PCl₅, SF₄, ClF₃, XeF₂, SF₆, BrF₅ and XeF₄;
  - their readouts and descriptions;
  - a starting view for each geometry, since no single view keeps every geometry's atoms apart (Fact 6).
- **Readout.** "SF₄: 5 electron domains around S (4 bonds, 1 lone pair). Electron geometry: trigonal bipyramidal. Molecular shape: seesaw. Angles: ..."
  - For CO₂ and SO₂ it adds that a double bond counts as one domain.
  - NH₃ is about 107°, H₂O about 104.5°, and SO₂ a little less than 120°.
  - **Change from the prototype:** for SF₄, ClF₃ and BrF₅ the readout says the lone pairs squeeze the angles, without "slightly". The squeeze is large: SF₄'s equatorial angle closes to about 102°. Fix the text, and the unit test that pins it, test first.
- **Controls:**
  - a `<select>` labeled "Molecule";
  - the drawing turns by dragging, or by the arrow keys at 15° a press when it has focus. Its focus label is "Turn the molecule: drag, or use the arrow keys", and a key's default scrolling is canceled;
  - a "Reset view" button.
  - `touch-action: pan-y`, so a vertical swipe still scrolls the page.
  - No animation.
- **Drawing:**
  - atoms are circles with their symbols, the central atom in the unit accent;
  - bonds are lines, and lone pairs are muted lobes;
  - farther objects are drawn first, with a fainter outline and letter;
  - the drawing is `role="img"`, with a description of the molecule shown;
  - the server draws CH₄ at its starting view, and without JavaScript the drawing has no tabindex.

**What the tests check:**
- **Unit tests (56):**
  - domain vectors are unit length and the right angles apart;
  - the lone-pair placements;
  - depth order;
  - every molecule's counts (bonds + lone pairs = domains);
  - every molecule's starting view keeps its drawn atoms apart.
- **Browser tests:**
  - the starting state;
  - choosing a molecule changes the readout and the number of atoms and lone pairs;
  - arrow keys move an atom without changing the readout, and their default action is canceled;
  - Reset restores the starting drawing;
  - with JavaScript off, the drawing and readout show without controls.

**Steps**

- [ ] **Step 1:** Bring in `tests/unit/vsepr.test.ts` with the readout change above; watch it fail (no module). Bring in `vsepr.ts` with the text fixed; watch it pass.
- [ ] **Step 2:** Draw `public/figures/2-7-electron-geometries.svg` and write the lesson from the brief, with `<ShapeViewer />` where the brief places it.
- [ ] **Step 3:** Bring in `tests/e2e/diagram-shape-viewer.spec.ts`; run it and watch it fail (no block). Bring in the Svelte viewer, its block and its styles; add it to `blocks`; run it again: it passes.
- [ ] **Step 4:** **Build and test**, **Look at it** (the viewer for several molecules at 412 and 360 px, light and dark), **Fact-check, independently** (the checker also confirms every molecule's readout).
- [ ] **Step 5:** Dispatch `typescript-reviewer` on the code. Commit the viewer (`feat(diagrams): add the 3D shape viewer`) and the lesson (`feat(lessons): add 2.7 VSEPR and Hybridization`).

**Brief**

- **Front matter:** `topic: "2.7"`, `minutes: 20`, summary: "How electron pairs push each other apart to give a molecule its shape, how to tell whether a molecule is polar, and what sp, sp² and sp³, sigma and pi mean."
- **Framework (2.7.A):** VSEPR uses the repulsion between electron pairs to predict how they are arranged around a central atom; Lewis diagrams and VSEPR together predict the molecular geometry (linear, trigonal planar, tetrahedral, trigonal pyramidal, bent, trigonal bipyramidal, seesaw, T-shaped, octahedral, square pyramidal, square planar), bond angles, relative bond energies and lengths from bond order and atomic radius, whether the molecule has a dipole moment, and the hybridization of atoms; sp, sp² and sp³ atoms have ideal angles of 180°, 120° and 109.5°; bonds form by overlap of atomic orbitals; a multiple bond is one sigma bond plus pi bonds; sigma overlap is stronger than pi overlap, so a sigma bond has the greater bond energy; a pi bond prevents rotation and leads to geometric isomers. **Excluded from the exam:** the derivation and drawing of hybrid orbitals; hybridization involving d orbitals (for more than four electron pairs only the shape is needed); molecular orbital diagrams.
- **Opening:** the Lewis diagram of water from topic 2.5 is drawn in a straight line, H–O–H. Real water is bent. A Lewis diagram counts electrons; it does not say where they are in space. This lesson does.
- **Section "Electron domains":** around a central atom, count **electron domains**: each lone pair is one domain and each bond is one domain, whether it is single, double or triple. The domains repel each other (they are all negative charge) and spread as far apart as they can. Table with columns Domains / Electron geometry / Ideal angles: 2, linear, 180°; 3, trigonal planar, 120°; 4, tetrahedral, 109.5°; 5, trigonal bipyramidal, 90°, 120° and 180°; 6, octahedral, 90° and 180°. Place the figure here, then introduce the viewer with one sentence ("Turn each shape to see it from every side.") and place `<ShapeViewer />`.
- **Figure** `2-7-electron-geometries.svg`: five small wedge-and-dash drawings in a row that wraps (two rows of three and two are fine), each a central atom "A" with its domains drawn as bonds to "X": linear, trigonal planar, tetrahedral (two bonds in the plane, one wedge, one dash), trigonal bipyramidal (two axial bonds up and down in the plane, one equatorial in the plane, one wedge, one dash), octahedral (four in the plane as a square drawn in perspective, plus up and down). Each labeled with its name and angles. Use a solid tapered wedge for a bond toward you and a dashed wedge for a bond away from you. Alt: "Five drawings of a central atom with its electron domains. Linear: two bonds in a straight line, 180 degrees apart. Trigonal planar: three bonds in a flat triangle, 120 degrees apart. Tetrahedral: four bonds, 109.5 degrees apart, one coming toward you and one going away. Trigonal bipyramidal: three bonds around the middle, 120 degrees apart, and one straight up and one straight down. Octahedral: six bonds, 90 degrees apart, four around the middle and one up and one down." Caption: "The five arrangements. A wedge comes toward you; a dashed wedge goes away."
- `<KeyIdea>`: count the domains to get the electron geometry. Then look only at where the atoms are to name the molecular shape.
- **Section "Lone pairs and the shape":** the **molecular shape** is named from the positions of the atoms only; lone pairs are there but invisible in the name. Table with columns Domains / Bonds / Lone pairs / Shape / Example: 3, 3, 0, trigonal planar, BF₃; 3, 2, 1, bent, SO₂; 4, 4, 0, tetrahedral, CH₄; 4, 3, 1, trigonal pyramidal, NH₃; 4, 2, 2, bent, H₂O; 5, 5, 0, trigonal bipyramidal, PCl₅; 5, 4, 1, seesaw, SF₄; 5, 3, 2, T-shaped, ClF₃; 5, 2, 3, linear, XeF₂; 6, 6, 0, octahedral, SF₆; 6, 5, 1, square pyramidal, BrF₅; 6, 4, 2, square planar, XeF₄. A table this wide may scroll inside its own box on a narrow phone; keep it to these five columns. A lone pair is held by one nucleus only, so its cloud is fatter and repels more strongly than a bonding pair: it pushes the bonds together a little, to about 107° in NH₃ and about 104.5° in H₂O instead of 109.5°. With five domains, lone pairs take the positions around the middle (equatorial) first, where they have more room. The same rules work for polyatomic ions: NH₄⁺ is tetrahedral and NO₃⁻ is trigonal planar. Lessons 2.2 and 2.6 already showed that bond order and atom size set how long and strong each bond is; that holds inside every shape here. `<KeyIdea>`: a full answer about a bond angle has three parts: count the domains, say what differs (the lone pairs), and conclude with the angle and the reason: "Water and methane both have four domains, but water's two are lone pairs, which repel more strongly than bonding pairs, so the H–O–H angle closes from 109.5° to about 104.5°."
- **Worked example "The shape of ammonia":** (1) Lewis diagram: N with three single bonds to H and one lone pair (show `<Lewis>`). (2) Four domains: tetrahedral electron geometry. (3) Three are bonds and one is a lone pair: the shape is trigonal pyramidal. (4) The lone pair pushes the bonds together: the H–N–H angle is a little less than 109.5°, about 107°.
- **Worked example "The shape of sulfur tetrafluoride":** (1) $6 + 4 \times 7 = 34$ electrons; S is central with four S–F bonds (8 electrons); the fluorines take 24 as lone pairs; $34 - 8 - 24 = 2$ are left, one lone pair on S. (2) Five domains: trigonal bipyramidal. (3) The lone pair takes an equatorial position: the shape is a seesaw. (4) The ideal angles are 90°, 120° and 180°, and the lone pair squeezes them. With more than four domains you name the shape only; no hybridization is asked for.
- **Check 1**, `<Check answer={2}>`: "The Lewis diagram of H₂S has two S–H bonds and two lone pairs on sulfur. What is the molecular shape?" Options: linear; bent; trigonal pyramidal; tetrahedral. Why: four domains give a tetrahedral electron geometry, but only two are bonds, so the three atoms form a bent shape, like water.
- **Check 2**, `<Check answer={3}>`: "XeF₄ has six electron domains around xenon: four bonds and two lone pairs. What is its shape?" Options: tetrahedral; seesaw; square planar; octahedral. Why: the two lone pairs sit opposite each other, above and below, leaving the four F atoms in a square around Xe.
- **Section "Is the molecule polar?":** a molecule has a **dipole moment** (it is polar) when, as a rule, two things are both true: it has polar bonds, and its shape does not make their dipoles cancel. CO₂ has two polar C=O bonds, but they point in opposite directions along a straight line and cancel: CO₂ is nonpolar. H₂O is bent, so its two O–H dipoles add: water is polar. A molecule is nonpolar when its shape is symmetrical and every outer atom is the same, as in CH₄, BF₃, SF₆, XeF₂ and XeF₄; replace one outer atom, as in CH₃Cl, and the symmetry breaks. Compare SO₂ and SO₃: SO₃ is trigonal planar and its three equal S–O dipoles cancel, so it is nonpolar; SO₂ is bent by its lone pair, so its dipoles do not cancel and it is polar.
- **Check 3**, `<Check answer={3}>`: "Which molecule is polar?" Options: CO₂; BF₃; NH₃; CH₄. Why: NH₃ is trigonal pyramidal, so its three N–H dipoles all point partly the same way and do not cancel. The other three are symmetrical with identical outer atoms.
- **Section "Hybridization":** the course describes the arrangement of domains with **hybridization** names: two domains, **sp** (180°); three, **sp²** (120°); four, **sp³** (109.5°). In CH₄ carbon is sp³; in CO₂ carbon is sp; in formaldehyde, H₂C=O, carbon has three domains and is sp²; in water oxygen has four domains and is sp³; in the nitrate ion nitrogen has three domains and is sp². `<Beyond>`: how hybrid orbitals are built from s and p orbitals, and the names used for five and six domains, are beyond the exam. (Use the existing `Beyond` block; keep it to two sentences.)
- **Section "Sigma and pi bonds":** a bond forms where orbitals on two atoms overlap. A single bond is one **sigma (σ) bond**, with the overlap directly between the nuclei. A double bond is one sigma and one **pi (π) bond**, whose overlap lies above and below the line between the nuclei; a triple bond is one sigma and two pi. Sigma overlap is stronger than pi overlap, so a sigma bond has the greater bond energy: for carbon, that is why C=C (614 kJ/mol) is less than twice C–C (347 kJ/mol). Keep this sentence about carbon only; do not generalize it to other elements. A pi bond also stops the atoms from rotating about the bond. That makes **geometric isomers** possible: in 1,2-dichloroethene the two Cl atoms can be on the same side of the C=C (cis) or on opposite sides (trans), and the two are different compounds: cis boils at about 60 °C and trans at about 48 °C. The polarity section explains why: cis is polar and trans is not. Show the two isomers as `<Lewis>` diagrams side by side (each C with one H and one Cl; Cl with three lone pairs).
- **Worked example "Counting sigma and pi bonds in HCN":** H–C is a single bond: one σ. C≡N is a triple bond: one σ and two π. Total: two σ and two π. Carbon has two domains, so it is sp, and the molecule is linear.
- **Check 4**, `<Check numeric="2">`: "How many pi bonds are there in a molecule of CO₂?" Why: O=C=O has two double bonds, each made of one σ and one π bond.
- **Check 5**, `<Check answer={2}>`: "What is the hybridization of each carbon atom in ethene, H₂C=CH₂?" Options: sp; sp²; sp³; it cannot be told without the shape. Why: each carbon has three domains (two C–H bonds and the double bond, which counts once), so each is sp², with angles near 120°. The molecule has five σ bonds (four C–H and one in the C=C) and one π bond.
- **Trap:** **Naming the shape from the electron geometry** (water has a tetrahedral electron geometry but a bent shape). **Counting a double bond as two domains** (any bond is one domain). **Trusting the angles in a Lewis diagram** (it is drawn flat; use VSEPR). **Calling a molecule polar because it has polar bonds** (CO₂ has polar bonds and no dipole). **Assigning a hybridization to an atom with five or six domains** (name the shape; the exam asks for no more).
- **Key points:** bonds and lone pairs are electron domains, and they spread as far apart as possible; 2, 3, 4, 5 and 6 domains give linear, trigonal planar, tetrahedral, trigonal bipyramidal and octahedral arrangements; the shape is named from the atoms only, and lone pairs squeeze the angles; a molecule is polar when its bond dipoles do not cancel; two, three and four domains are sp, sp² and sp³; a double bond is σ + π, a triple σ + 2π; a pi bond prevents rotation, which allows geometric isomers.
- **Do not include:** drawings of hybrid orbitals, sp³d or sp³d² hybridization, or molecular orbital diagrams.

### Task 9: Close out Unit 2's lessons

**Files:**
- Modify: `docs/superpowers/specs/2026-11-13-chemstudy-unit-2-lessons-design.md` (an "As built" note at the end)
- Modify: this plan (an "As carried out" note under any task whose code or brief changed in execution)

- [ ] **Step 1:** Write the "As built" note in the design:
  - the seven lessons and the three code pieces;
  - anything that differs from the design;
  - what the fact-checks changed, in summary.
- [ ] **Step 2:** Add "As carried out" notes to this plan where the repository is newer than the plan.
- [ ] **Step 3:** **Build and test** once more, then commit (`docs: record how the Unit 2 lessons were built`).
- [ ] **Step 4:** Push and open pull request C. Wait for "Build and test" to pass, then stop for the teacher's merge. After it merges, delete the branch and the local prototype worktree (`git worktree remove` on `scratchpad/unit2/proto`, then `git branch -D proto/unit-2`).

---

## What this plan delivers against the design

| Design section | Where |
|---|---|
| 2. Seven lessons, built like Unit 5's, ending with `PracticeNext` | Tasks 2–8, "Rules for writing a lesson" |
| 3. Inside the framework; exclusions labeled; shapes only for five and six domains | Every brief's "Framework" line; Task 8's `<Beyond>` and "Do not include"; the fact-check step |
| 3. The teacher's notes as a reference, nothing copied | "How this plan differs", item 4; Conventions |
| 4.1 The Lewis block: no JavaScript, checked electron count, computed formal charges, accessible, fits a phone | Task 1 |
| 4.2 The bond-energy diagram | Task 3 |
| 4.2 The 3D shape viewer, with a drawn picture beside it | Task 8 (`2-7-electron-geometries.svg`) |
| 4.3 Drawn figures | Tasks 2, 3, 4, 5 and 8 |
| 5. The pipeline: writers in parallel, build, phone look, Opus fact-check, fixers, code review | "How a group is carried out", "How every lesson task ends" |
| 6. Three pull requests, each stopping for the teacher | Groups A, B and C |
| 8. Done when | Task 9, after pull request C merges |
