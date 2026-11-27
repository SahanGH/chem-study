# ChemStudy Unit 6 Lessons and Diagrams Implementation Plan

**Goal:** Put Unit 6 (Thermochemistry) on chem-study.com:
- nine lessons, 6.1 to 6.9, every Check with a message for each wrong answer;
- two interactive diagrams: a calorimetry explorer (6.4) and a heating curve explorer (6.5);
- the drawn figures the lessons need.

**Architecture:** as for Unit 4.
- **Lessons** are MDX files built from the existing lesson blocks.
- **Interactive diagrams** are Svelte components drawn in SVG, wrapped in Astro blocks and loaded when they scroll into view.
- **Every number a diagram shows** comes from a plain TypeScript module with unit tests: `src/lib/calorimetry.ts` and `src/lib/heating-curve.ts`.

**Tech Stack:** Astro 7, MDX, Svelte 5, KaTeX 0.16 + mhchem, Vitest, Playwright + axe. No new package.

**Spec:** `docs/superpowers/specs/2026-11-27-chemstudy-unit-6-lessons-design.md`.

**Builds on:** the Unit 4 lessons plan (`2026-11-16-chemstudy-unit-4-lessons.md`), whose "Rules for writing a lesson" and "How every lesson task ends" hold here except where this plan says otherwise, and the check feedback plans of 2026-11-26 and 2026-11-27.

**How this plan was made.**

1. **The framework summary** was written from the controller's knowledge of the 2024 framework, not from its pages: the College Board's site is blocked in the building session. The design's section 1 asks the teacher to verify it.
2. **Two inventories** were made before any brief: every example, reaction, number and scene of the teacher's Unit 6 and Chapter 6 materials in `AP_Chem_Prep` (about 180 entries, with what the notes stress), on Sonnet; and every scene, substance and energy value the site's lessons and practice already use, on Haiku. The Tro textbooks could not be reached, so no list of their examples exists.
3. **The briefs** below were written by three agents on Fable 5.2, one per group of lessons, each with a number-check script (`scratchpad/unit6/checks/6-N.py`) that recomputes every number in its brief.
4. **Each group of briefs was fact-checked** by a fresh agent on Fable 5.2 that solved every Check and worked example before reading the answer and judged every published value, **and checked for originality** on Sonnet against both inventories and the other groups' briefs. The findings are fixed in the briefs; the note under each group says what changed.
5. **"(verify)" in a brief** is the brief-writer's own mark on a value or fact it was not sure of. The fact-checkers judged every one from their knowledge of standard references (they had no network) and confirmed all of them to the figures printed, except these, which no checker could confirm and the teacher is asked to check: **solid ethanol's molar heat capacity, 70 J/(mol·°C)** (used by the heating curve explorer, which calls it approximate); nitrogen's enthalpy of fusion (0.71 or 0.72 kJ/mol); the enthalpy of formation of N₂O (+82.05 or +81.6 kJ/mol; no calculation depends on it); and Zn²⁺(aq) (−153.9 or −153.4 kJ/mol; not printed in a lesson).

## Facts verified before writing (do not rediscover)

Established on 2026-11-27 against `main` at `8b4472e`.

1. **Unit 6 exists in `src/data/units.ts`** with the nine topic titles; its slug is `unit-6-thermochemistry`, and its colors are in `src/styles/tokens.css`. `src/content/lessons/unit-6/` does not exist yet.
2. **The shared tests pick up a new unit by themselves** (`all-lessons.spec.ts`, `home.spec.ts`).
3. **`tests/unit/check-dist.test.ts` builds its sample lessons in topic 6.2**, on the assumption that Unit 6 has no lessons and is not on `FEEDBACK_UNITS`. Before Unit 6 joins the list, the samples move to topic 8.2: the comment and `data-topic` (lines 12 and 13), `inUnit(6, …)` and the expected strings "lesson 6.2" (lines 30 to 43 and 134 to 189), and `FEEDBACK_UNITS.has('6')`.
4. **A unit on `FEEDBACK_UNITS` needs a data file** for `tests/e2e/check-feedback.spec.ts`: exactly one file in `docs/superpowers/plans/` ending `-chemstudy-unit-6-check-feedback.json`, listing every Check of every Unit 6 lesson on the site. For Unit 6 the messages are written with the lessons, so the file is **derived from the lessons** by `scratchpad/unit6/extract-feedback.py` (run on Unit 4, it reproduces that unit's file with no difference). It is regenerated in every pull request that adds or changes a Unit 6 lesson.
5. **`tests/unit/check-balance.test.ts` needs at least 12 Checks with options in a unit**, so Unit 6 joins `BALANCED_UNITS` in the last pull request, when all nine lessons are in.
6. **A `<Check>` takes** `answer` or `numeric` (+ `unit`), and `misses`, `slips`, `tolerance`. The build refuses a message that is empty, over 180 characters, holds `$`, `<`, `>` or a backslash, starts "Not quite", or does not end with a period or question mark; a message for the answer's own option; and a slip inside the tolerance. A typed minus sign is read: `-250` and `250` are different answers.
7. **The equation sheet** gives, for this unit, $q = mc\Delta T$ and the products-minus-reactants formula for $\Delta H^\circ$. Nothing else (the framework summary lists what is missing).
8. **The one stated exclusion of Unit 6** (as the controller knows the framework): the technical distinction between enthalpy and internal energy (6.6).
9. **Anatomy of an interactive diagram**, with line counts and the shared CSS classes: `scratchpad/unit6/tech-facts.md`, section "Interactive diagrams". The model is the titration explorer.
10. **No tool in the repository renders an SVG.** `scratchpad/unit6/svg-shot.cjs` does (Playwright with the container's Chromium).
11. **Running the browser tests in a Claude Code cloud session:** unset `AI_AGENT`, `CLAUDECODE` and `CLAUDE_CODE_ENTRYPOINT` for the run (Astro's preview otherwise starts in the background and Playwright's web server "exits early"), and point `launchOptions.executablePath` at `/opt/pw-browsers/chromium` in a config kept outside the repository.
12. **Site values Unit 6 must agree with** are in `scratchpad/unit6/site-inventory.md`, section 3 (bond energies in lessons 2.2 and 4.4, among others).

## Conventions for every task

- Work in `/home/user/chem-study`. The teacher's `AP_Chem_Prep` checkout is read-only and writers never read it.
- **American English** in every file (`CLAUDE.md`); `npm test` checks the site's sources.
- Conventional commits, **no AI-attribution trailer**.
- Tests first for code: write the test, run it, watch it fail, then implement. Never swallow an error.
- **Only the controller builds, runs browser tests and commits.** Writers and builders working at the same time write files and run unit tests only: concurrent builds collide.
- **One pull request per group, stacked, each targeting `main`. Claude merges each when "Build and test" passes** (the design's section 1), with a merge commit, in order.

## Models

| Task | Model |
|---|---|
| Briefs; lesson writers; fact-checks; second checks | Fable 5.2 |
| The two diagrams (module, tests, component, browser tests) | Opus |
| Code reviews; originality checks; applying decided fixes | Sonnet |
| Inventories | Sonnet, Haiku |

Never both the writer and the checker of a lesson on a cheaper model.

## How a group is carried out

1. Code first where a lesson uses a new block: one builder per diagram, at the same time, each in its own files (the two shared files, `diagram.css` and `[topic].astro`, are edited by the controller from what each builder reports).
2. One writer per lesson, at the same time, files only: the lesson, its figures.
3. The controller, in order:
   1. regenerates the unit's check-feedback data file from the lessons;
   2. `npm test`, `npm run build`, the browser tests;
   3. the sweep (`scratchpad/feedback/sweep.mjs`): every wrong option and slip shows its message, every answer is accepted, and at 412, 390, 360 and 320 px no message leaves its card and no page scrolls sideways; and a look at every figure (`svg-shot.cjs`);
   4. one independent fact-checker per lesson, on Fable 5.2;
   5. one originality check for the group, on Sonnet;
   6. decided fixes applied (Sonnet), the build and tests again, and a second check of what changed (Fable 5.2);
   7. a code review of any code (Sonnet);
   8. the commits, the pull request, and the merge when "Build and test" passes.

## Rules for writing a lesson

The Unit 4 plan's "Rules for writing a lesson" hold (the file, the seven parts, the markup, the voice, phone width, static figures), with `unit-6` and `6-N-<slug>.mdx` for the file. Models to read first: `src/content/lessons/unit-4/4-5-stoichiometry.mdx` (calculations, typed-number Checks with slips) and `src/content/lessons/unit-3/3-5-kinetic-molecular-theory.mdx` (a conceptual lesson).

**Added for Unit 6:**

- **Every Check carries its messages**, exactly as the brief gives them: `misses` for each wrong option, `slips` for a typed number, formatted as Unit 1's lessons format them (`answer` first in the tag). A writer who must reword a message keeps the rules of the check feedback design's section 4.4 and reports it.
- **Signs.** $q$ and $\Delta H$ are negative when the system releases energy. Prose never says "negative heat" or "releases −250 kJ": it says "releases 250 kJ", or "$\Delta H = -250$ kJ". A typed-number Check asks for a magnitude in words or says "with its sign".
- **System and surroundings are named** in every energy statement where the point of view matters.
- **Units.** Energy in J or kJ, never mixed inside one line of a calculation without the conversion shown. Specific heat capacity in J/(g·°C). The enthalpy change of a reaction as written is in kJ/mol$_\text{rxn}$ (`\text{kJ/mol}_\text{rxn}$`), explained once in lesson 6.6; a molar enthalpy of fusion or vaporization in kJ/mol.
- **$\Delta T$ is final minus initial**, always written out once in each calculation.
- **Values** are the brief's, each from its "Values" table. Do not swap in a remembered value.
- **Work, internal energy, bomb calorimetry and "state function"** appear only where the brief puts them.
- **Thermochemical equations carry state symbols** on every term: the enthalpy change depends on them.

**Static figures:** as in the Unit 4 plan. Render every figure and look at it: `node <scratchpad>/unit6/svg-shot.cjs <out folder> 390 <file.svg>`.

## How every lesson task ends

As in the Unit 4 plan ("Build and test", "Look at it", "Fact-check, independently", "Originality check, once per group", "Fix", "Commit"), run by the controller as "How a group is carried out" says, with these changes:

- **The fact-checker** gets the lesson file, its figures and `scratchpad/ced/unit6-framework.md`. Beside the Unit 4 list, it:
  - looks up every published value (specific heat capacity, melting and boiling point, enthalpy of fusion, vaporization, formation and reaction, bond enthalpy) and reports any that differs from a standard reference by more than rounding;
  - checks every sign, in symbols and in words, and the point of view (system or surroundings) of every energy statement;
  - checks every unit, and J against kJ, in every line of every calculation;
  - for each typed-number Check, recomputes every slip from its mistake and confirms it lies outside the tolerance;
  - judges every wrong-answer message by the check feedback design's section 4.4, above all whether it leaves one option standing.
- **The originality check** compares with the teacher's Unit 6 and Chapter 6 materials (`/home/user/sahangh/ap_chem_prep`, read-only, not the `exam` folders' questions), the site's other lessons and practice, and the unit's other lessons. The Tro books are not available; the pull request says so.

## File structure

```
src/
  lib/calorimetry.ts                                a hot metal into water: final temperature, energy lost and gained, readouts (Task 4)
  lib/heating-curve.ts                              one mole heated from solid to gas: temperature at every energy, segments, readouts (Task 5)
  components/diagrams/Calorimetry.svelte            (Task 4)
  components/diagrams/HeatingCurve.svelte           (Task 5)
  components/lesson/Calorimetry.astro               <Calorimetry />   (Task 4)
  components/lesson/HeatingCurve.astro              <HeatingCurve />  (Task 5)
  styles/diagram.css                                + rules the two diagrams need
  pages/[unit]/[topic].astro                        + Calorimetry, HeatingCurve in `blocks`
  content/lessons/unit-6/                           nine new .mdx files
public/figures/                                     6-1-... to 6-9-... static figures
scripts/check-dist.mjs                              Unit 6 on FEEDBACK_UNITS (Group B)
tests/unit/calorimetry.test.ts heating-curve.test.ts
tests/unit/check-dist.test.ts                       sample lessons move to topic 8.2 (Group B)
tests/unit/check-balance.test.ts                    Unit 6 on BALANCED_UNITS (Group D)
tests/e2e/diagram-calorimetry.spec.ts diagram-heating-curve.spec.ts
docs/superpowers/plans/2026-11-27-chemstudy-unit-6-check-feedback.json   derived from the lessons, in every group
```

---

## Group B: energy in and out, drawn and explained (pull request B)

Branch: `topic/unit-6-energy-and-heat`, from this plan's branch (`topic/unit-6-lessons-design`). The pull request title is "feat(lessons): Unit 6 lessons 6.1-6.3".

No new block. Before the lessons: move the sample lessons of `tests/unit/check-dist.test.ts` from topic 6.2 to topic 8.2 (fact 3), and put Unit 6 on `FEEDBACK_UNITS`; the build then fails until the lessons carry their messages. Three writers at the same time, then the controller's steps.

> **How these briefs were checked.** A fact-check confirmed every number, value, reaction and sign, and changed four wrong-answer messages that gave too much away, wording in lesson 6.3 that used speed where kinetic energy is meant, and several Checks answered by the text above them. The originality check found lesson 6.1's third Check to be a question of the teacher's first worksheet with the substance changed (rebuilt as a control experiment), lesson 6.3's worked example to be another (now an unplugged clothes iron cooling in a room), and a scene shared with lesson 6.5 (changed). A second check of the changes found three errors the revision had left, all fixed.

### Task 1: Lesson 6.1, Endothermic and Exothermic Processes

**Files:**
- Create: `src/content/lessons/unit-6/6-1-endothermic-and-exothermic-processes.mdx`
- Create: `public/figures/6-1-system-and-surroundings.svg`
- Create: `public/figures/6-1-dissolving-attractions.svg`

**Brief**

- **Front matter:** `topic: "6.1"`, `minutes: 13`, summary: "How a temperature change shows that energy is moving between a system and its surroundings, what exothermic and endothermic mean, and why dissolving can be either." (No colon in the summary.)
- **Framework (6.1, four statements):** (1) a temperature change in a system shows that its energy is changing; (2) energy changes are called endothermic or exothermic, and they come with heating or cooling a substance, with phase changes and with chemical reactions; (3) in a reaction the energy of the system falls (exothermic), rises (endothermic) or stays the same; the energy an exothermic system loses is gained by the surroundings, as heat transferred from the system or work done by it, and an endothermic system gains energy from the surroundings, as heat transferred to it or work done on it; (4) forming a solution can be exothermic or endothermic, and which it is depends on the strengths of the attractions between particles before dissolving compared with after. The objective is to explain what is observed in an experiment in terms of the energy change. "System" and "surroundings" are taught as terms (the design says so). **What this lesson does not do:** no energy diagram (topic 6.2); no particle account of how energy passes from one body to another (topic 6.3); no symbol q, no q = mcΔT and no amount of heat calculated (topic 6.4); no molar enthalpy of a phase change (topic 6.5); no ΔH, no enthalpy, no kJ/mol (topic 6.6); no bond-energy arithmetic (topic 6.7). Work is named in one paragraph and never calculated. Why an endothermic change can happen at all is named as a matter for Unit 9 and left there. Nothing in this lesson is on the equation sheet.
- **Opening:** squeeze the two parts of an epoxy glue into a paper cup and stir. Within a few minutes the cup is hot in your hand, and nobody heated it. An athletic trainer sprays ethyl chloride from a can onto a twisted ankle. The liquid is gone in seconds and the skin is left icy cold, though the can came from a bag at room temperature. In both, energy moved. This lesson is about saying where it went, and getting the direction right.
- **Section "System and surroundings":**
  - To follow energy you first draw a line around the thing you are studying. The **system** is the part of the world you are studying: here, the particles that are changing. The **surroundings** are everything else.
  - Apply it to the two openings. Epoxy: the system is the resin and hardener molecules that are reacting and the hard plastic they become. The surroundings are the cup, the stirring stick, the air and your hand. Spray: the system is the ethyl chloride. The surroundings are the skin and the air.
  - For a reaction between dissolved substances, the system is the particles that react. The water they are dissolved in is surroundings, and so are the container and the thermometer. (This is the convention the exam uses; say it plainly, since the worked example and Check 3 rest on it.)
  - Energy is never made or destroyed in a change, so whatever energy the system loses, the surroundings gain, and the other way around. One sentence: topic 6.4 turns this into calculations.
  - Place the figure `6-1-system-and-surroundings.svg` at the end of the next section, after the two words are defined, not here.
- **Section "A temperature change is the evidence":**
  - Topic 3.5: temperature measures the average kinetic energy of a sample's particles. So when the temperature of something changes, its energy is changing. A thermometer is how you see energy move.
  - The cup got warmer: the particles of the cup gained kinetic energy. That energy came from somewhere, and the one thing that was changing was the epoxy. The skin got colder: its particles lost kinetic energy. That energy went somewhere, and the one thing that was changing was the ethyl chloride, which evaporated.
  - Then the two words. A change is **exothermic** when the system releases energy to the surroundings: the system's energy falls. A change is **endothermic** when the system absorbs energy from the surroundings: the system's energy rises. The epoxy curing is exothermic. The ethyl chloride evaporating is endothermic. One sentence: topic 5.6 used these words for one step of a reaction, and topic 7.9 used them for heating an equilibrium; here they get their full meaning. One sentence: a change can also leave the energy of the system the same, and then it is neither.
  - The sign follows the system. The system's energy change is negative when the change is exothermic (the system ends with less) and positive when it is endothermic (the system ends with more), the same convention topic 5.6 used for the overall energy change. In words, never write "negative energy released": say "the system releases energy".
  - Figure `6-1-system-and-surroundings.svg` here.
- **Figure** `6-1-system-and-surroundings.svg` (viewBox `0 0 480 300`, font-size 18): two panels side by side, each 210 wide: left panel x 15 to 225, right panel x 255 to 465.
  - In each panel: a title centered above at y = 28 ("Exothermic" on the left, "Endothermic" on the right). An outer rounded rectangle from y = 42 to y = 232, fill light accent `#E3EAE9`, stroke secondary `#6B655D`, with the word "surroundings" centered inside near its top edge (baseline y = 66). An inner rectangle 90 wide and 56 tall, centered in the outer one (center y = 145), fill `#FDFCF9`, stroke ink `#26231F`, with the word "system" centered inside it.
  - Left panel: four arrows in accent `#4F706C`, each 30 long, pointing **outward** from the middle of each side of the inner rectangle (up, down, left, right), with a gap of 6 between the rectangle and each arrow's tail. The upward arrow must stop below the word "surroundings". Under the panel, two centered lines: "energy out" (y = 256) and "surroundings warm" (y = 280).
  - Right panel: the same four arrows pointing **inward**, heads 6 from the inner rectangle. Under the panel: "energy in" (y = 256) and "surroundings cool" (y = 280).
  - The two panels differ in the direction of the arrowheads and in their words, not in color. No other text.
  - Alt: "Two drawings, each a box labeled system inside a larger box labeled surroundings. In the first, titled exothermic, four arrows point out of the system into the surroundings, with the words energy out, surroundings warm. In the second, titled endothermic, four arrows point from the surroundings into the system, with the words energy in, surroundings cool."
  - Caption: "The words describe the system. The thermometer is usually in the surroundings."
- **Section "Three kinds of change":** energy changes of both kinds come with three kinds of change. Give the table (three columns, short cells), then the sentences after it.

  | Kind of change | Exothermic: the system loses energy | Endothermic: the system gains energy |
  |---|---|---|
  | Cooling or heating a substance | A cast-iron skillet cooling on the stove | A pizza stone heating in an oven |
  | Phase change | Freezing, condensing | Melting, vaporizing |
  | Chemical reaction | Epoxy curing | Citric acid reacting with baking soda |

  - After the table: for cooling and heating, the system is the substance itself, and its own temperature shows the change. For a phase change, the direction follows from the attractions between the particles (topics 3.1 and 3.3): to melt a solid or vaporize a liquid, particles have to be pulled away from their neighbors, and that takes energy in. Going the other way, particles settle back into those attractions and the energy is released. So ethyl chloride evaporating off the skin takes energy from the skin. Topic 6.5 puts numbers on phase changes.
  - For a reaction, the direction cannot be read off so easily. The energy a reaction releases or absorbs was stored in the way the atoms are bonded (topic 2.2), and topics 6.6 and 6.7 follow it. Until then you find the direction by experiment: by watching what happens to the temperature of the surroundings.
  - Note for the writer: a solid turning straight to a gas (sublimation) and the reverse (deposition, frost forming) follow the same rule; one clause may say so, because Check 1's fourth option uses frost. Do not give any melting or boiling point here.
- **Check 1**, `<Check answer={2}>`: "Which of these changes is endothermic for the system named?"
  - Option 1: Wet concrete (the system) warming the wooden forms around it as it cures
  - Option 2: A pat of butter (the system) melting in a warm pan
  - Option 3: A baked loaf of bread (the system) cooling on a rack
  - Option 4: Water vapor (the system) turning to frost on a cold windshield
  - Why: melting is a solid turning to liquid. The butter's molecules have to be pulled out of their fixed places, against their attractions, and the energy for that comes in from the pan, so the butter's energy rises: endothermic. The concrete is warming its surroundings, so it is losing energy: curing is an exothermic reaction. The loaf's own temperature is falling, so its energy is falling. Water vapor turning to frost is molecules settling into the attractions of a solid, which releases energy.
  - Miss 1: "The forms are surroundings, and they warm. Which way did energy go between them and the concrete?"
  - Miss 3: "As the loaf's temperature falls, is its own energy rising or falling? Endothermic means the system's energy rises."
  - Miss 4: "Compare the vapor with the frost. In which are the molecules held more firmly? Settling into attractions releases energy."
- **Section "The thermometer is in the surroundings":** two sentences, then the worked example, then the key idea. When a reaction runs in water, the thermometer sits in the water, and the water is surroundings. So the temperature you read goes the opposite way from the system's energy. Do not state the rule "temperature up means exothermic" before the worked example: the example reasons it out, and Check 3 tests it.
- **Worked example "Reading a thermometer the right way":** a bath bomb is mostly citric acid and baking soda, pressed together dry. A student crumbles a piece of one into a cup of water with a thermometer in it. Bubbles stream up through the water, and the reading falls from 21.5 °C to 17.0 °C. Is the reaction exothermic or endothermic, and what is the sign of the system's energy change?
  1. **Name the system.** The particles that react: the dissolved citric acid and baking soda, and the substances they turn into (one of them is the carbon dioxide in the bubbles).
  2. **Name the surroundings.** Everything else: the water, the cup, the thermometer and the air.
  3. **Say whose temperature changed.** The thermometer is in the water, so the reading belongs to the surroundings. It fell by 21.5 − 17.0 = 4.5 °C.
  4. **Turn the temperature change into an energy change.** A lower temperature means a lower average kinetic energy (topic 3.5). The water lost energy.
  5. **Follow the energy.** Energy is not destroyed, and nothing else in the cup changed. The energy the water lost went into the system.
  6. **Write the claim.** "The reaction is endothermic. The temperature of the water, which is part of the surroundings, fell, so the surroundings lost energy. The system gained that energy, so the system's energy change is positive."

  After the example, one sentence: the reasoning has the same six moves every time, and only the direction changes.

  Note for the writer: the reaction is real and is endothermic: H₃C₆H₅O₇(aq) + 3 NaHCO₃(aq) → Na₃C₆H₅O₇(aq) + 3 H₂O(l) + 3 CO₂(g). **Give no equation and no formula in the lesson.** The temperatures are an illustration for an unstated amount; do not add amounts, and do not say how much energy moved. Say "baking soda" and, once, "(sodium hydrogen carbonate)".
- `<KeyIdea>`: exothermic and endothermic describe the system. An exothermic change lowers the system's energy and warms the surroundings. An endothermic change raises the system's energy and cools the surroundings. Decide first which of the two your thermometer is in.
- **Paragraph "Heat or work"** (no heading of its own; it follows the key idea): energy crosses between a system and its surroundings in two ways. One is **heat**: energy passed from a warmer body to a cooler one, which topic 6.3 explains with particles. The other is **work**: a push that moves something. A reaction that makes a gas in an open cup has to push the air back to make room for the gas, and that push carries energy from the system to the surroundings without warming anything on the way. Work can also be done on a system, which adds to its energy. In this unit you will calculate with heat. For work, know that it is the other way energy can leave or enter.
  - Note for the writer: this is all the lesson says about work. No formula, no sign convention for work, no piston.
- **Check 2**, `<Check answer={4}>`: "A physical therapist dips a patient's hand into a bath of melted paraffin wax at about 52 °C and lifts it out. The wax hardens into a glove, and the hand goes on feeling warm for several minutes. Take the wax as the system. Which statement explains the lasting warmth?"
  - Option 1: The wax takes in energy from the hand as it hardens, so hardening is endothermic for the wax.
  - Option 2: The wax keeps getting hotter while it hardens, so it has more and more energy to pass on to the hand.
  - Option 3: The hand is warmer than the room, so it supplies the energy that turns the liquid wax into a solid.
  - Option 4: Hardening is exothermic for the wax: its energy falls, and the hand gains the energy it gives up.
  - Why: the hand feels warm, so the hand, which is surroundings, is gaining energy. The energy comes from the wax. As liquid wax turns solid, its molecules settle into stronger attractions and the wax's energy falls, so hardening is exothermic. The warmth lasts because the wax goes on releasing energy for as long as it is still hardening. The first option has the energy going the wrong way: the hand would feel cool. Nothing heats the wax after the hand leaves the bath, so it does not get hotter. And a change from liquid to solid releases energy; it does not need a supply.
  - Miss 1: "If the wax took energy from the hand, would the hand feel warm or cool? Check the direction against what the patient feels."
  - Miss 2: "Nothing is heating the wax once the hand leaves the bath. Ask what happens to a liquid's energy as it becomes a solid."
  - Miss 3: "The hand ends up warmer, not cooler, so it was not the supplier. Which way did energy cross between the wax and the hand?"
  - Note for the writer: paraffin wax is a mixture and hardens over a range of temperatures, so say "hardens", not "freezes at 52 °C". Skin is at about 33 °C, cooler than the melted wax.
- **Check 3**, `<Check answer={1}>`: "A student soaks a pad of steel wool in vinegar to strip its coating, squeezes it out, wraps it around the bulb of a thermometer and seals it in a jar filled with nitrogen. The room is at 21 °C, and the reading stays at 21 °C. Then the jar is opened to the air. The iron begins to rust, and over the next five minutes the reading climbs to 29 °C. The system is the iron and the oxygen that react. What do the two results show?"
  - Option 1: The iron and oxygen released energy as they reacted, and the thermometer gained it: exothermic.
  - Option 2: Oxygen gas is warmer than nitrogen gas, so letting the air in is what warmed the thermometer's bulb.
  - Option 3: Traces of vinegar on the steel wool warmed the thermometer, and the gas in the jar played no part.
  - Option 4: The reaction took energy in from the thermometer, and a thermometer shows that as a higher reading.
  - Why: in nitrogen there is no oxygen, so the iron cannot rust, and the reading does not move. In air the iron rusts and the reading rises by 8 °C. So the energy that warmed the thermometer came from the reaction. The thermometer is not iron and it is not oxygen: it is part of the surroundings, and it gained energy. The system lost that energy, so rusting is exothermic. The air and the nitrogen were both at the temperature of the room, so the air brought no warmth with it. The vinegar was on the wool the whole time, and in nitrogen nothing warmed. And a thermometer that gives up energy cools: its reading would fall.
  - Miss 2: "Both gases came from the same room at 21 °C. What can oxygen do with iron that nitrogen cannot?"
  - Miss 3: "The vinegar was on the wool the whole time. Did the reading move while the jar held only nitrogen?"
  - Miss 4: "A thermometer that loses energy cools, and its reading falls. Which way did this reading go?"
  - Note for the writer: the rusting is 4 Fe(s) + 3 O₂(g) → 2 Fe₂O₃(s), written without the water that real rust holds. Give no equation in the lesson. The vinegar only removes the coating that protects the steel; do not say the vinegar is a reactant. Iron does not react with nitrogen at room temperature, so the nitrogen jar is a fair control. The rise of 8 °C is typical of this classroom experiment (verify). This Check replaces one in which a classmate called the reaction endothermic because the temperature rose: do not bring that wording back into the question.
- **Section "Dissolving can go either way":**
  - A soap maker stirs solid sodium hydroxide into water, and the solution gets hot enough to scald. A sugar-free mint sweetened with xylitol feels cool on the tongue as it dissolves. One dissolving is exothermic and the other endothermic. The reason is in the attractions between the particles.
  - Topic 3.10 described dissolving as a trade of attractions with three parts. Give them as a numbered list, each with its energy:
    1. Solute particles are pulled away from one another. Overcoming those attractions takes energy in.
    2. Solvent molecules are pushed apart to make room. That takes energy in too.
    3. Solute and solvent particles attract each other. Forming those attractions releases energy.
  - Whether the whole change is exothermic or endothermic depends on which is larger: the energy taken in by parts 1 and 2, or the energy released by part 3.
  - The water plays two parts here. The attractions of its molecules belong to the change. Its temperature, which is the motion of its molecules, is what the thermometer reads, and that is what we count as surroundings.
  - Sodium hydroxide: the attractions between its ions and the water molecules are so strong that forming them releases more energy than parts 1 and 2 took. The extra goes to the surroundings, and the solution warms. Xylitol: pulling its molecules out of the crystal and making room in the water takes more energy than the new attractions release. The difference comes out of the surroundings, your tongue included.
  - Figure `6-1-dissolving-attractions.svg` here.
  - `<KeyIdea>`: dissolving overcomes some attractions, which takes energy, and forms others, which releases energy. If more is released than taken in, the dissolving is exothermic. If more is taken in than released, it is endothermic.
  - One closing sentence: an endothermic change like the xylitol's happens all by itself, which may seem odd; energy is not the only thing that decides whether a change happens, and Unit 9 takes that up.
  - Note for the writer: sodium hydroxide dissolving is strongly exothermic and xylitol dissolving is endothermic; both are certain, and no value is given. Do not rule on whether dissolving is a physical or a chemical change (lesson 4.4 argues it both ways). Do not use the words "lattice energy", "hydration" or "enthalpy of solution", and give no numbers for the three parts: the design keeps the three-part argument in words.
- **Figure** `6-1-dissolving-attractions.svg` (viewBox `0 0 480 350`, font-size 18): two bar charts side by side, left panel x 15 to 225, right panel x 255 to 465. All bars stand on a baseline at y = 220 (a line in ink across each panel from 20 inside its left edge to 20 inside its right edge). Bars are 60 wide.
  - Left panel, title "Exothermic dissolving" centered at y = 28. Bar A (energy in): x 45 to 105, total height 100, drawn as two stacked parts with a line between them: the lower part 70 tall with a "1" centered in it, the upper part 30 tall with a "2" centered in it. Both parts are filled with diagonal hatching in secondary `#6B655D` on `#FDFCF9`, stroke ink. Bar B (energy out): x 135 to 195, height 140, solid fill accent `#4F706C`, with a "3" centered in it in `#FDFCF9`. Under bar A the label "in" and under bar B the label "out", centered at y = 244. Under the panel, centered at y = 274: "more out: warms".
  - Right panel, title "Endothermic dissolving" centered at y = 28. Bar A: x 285 to 345, total height 140: lower part 110 tall with "1", upper part 30 tall with "2", hatched as before. Bar B: x 375 to 435, height 100, solid accent, with "3". Labels "in" and "out" at y = 244. Under the panel at y = 274: "more in: cools".
  - A key across the bottom, two lines starting at x = 60: at y = 308 a small hatched square (16 by 16) and the text "energy in: particles pulled apart"; at y = 334 a small solid accent square and the text "energy out: new attractions form".
  - The two kinds of bar differ in hatching against solid fill, not in color alone. The numbers 1, 2 and 3 match the numbered list in the text. The heights are for comparison within the figure; they are not data and carry no scale or unit.
  - Alt: "Two bar charts side by side. Each has a hatched bar labeled in, made of two parts numbered 1 and 2, and a solid bar labeled out, numbered 3. In the first chart, titled exothermic dissolving, the out bar is taller than the in bar, with the words more out: warms. In the second, titled endothermic dissolving, the in bar is taller than the out bar, with the words more in: cools. A key reads energy in: particles pulled apart, and energy out: new attractions form."
  - Caption: "Parts 1 and 2 take energy in. Part 3 releases energy. Which total is larger decides whether the solution warms or cools. The bars are sketches, not measurements."
- **Check 4**, `<Check answer={3}>`: "A cook stirs a spoonful of salt substitute, which is potassium chloride, into a glass of water at 22.0 °C. The solid dissolves, and the water's temperature falls to 20.5 °C. What does the fall show about the attractions between the particles?"
  - Option 1: The attractions between the ions in solid potassium chloride are too weak to matter.
  - Option 2: Forming attractions between ions and water released more energy than pulling particles apart took.
  - Option 3: Pulling the particles apart took more energy than the new ion–water attractions released.
  - Option 4: No attractions formed between the ions and the water molecules, so no energy was released at all.
  - Why: the water cooled by 1.5 °C, so the surroundings lost energy and the system gained it: this dissolving is endothermic. That happens when separating the ions from one another and making room in the water takes more energy than the new attractions between ions and water give back. If the new attractions had released more, the water would have warmed. The attractions in the solid are not weak: it is an ionic solid. And attractions between the ions and the water did form, or the solid would not have dissolved.
  - Miss 1: "Ions in a crystal attract one another strongly (topic 2.3). Compare the energy taken in with the energy released."
  - Miss 2: "If more energy were released than taken in, the extra would go into the water. Does that match the reading?"
  - Miss 4: "The salt dissolved, so ions and water molecules do attract (topic 3.10). How does what that released compare with what was needed?"
  - Note for the writer: potassium chloride dissolving in water is endothermic (certain); the fall of 1.5 °C is an illustration for an unstated amount.
- **Check 5**, `<Check answer={2}>`: "A sample of lithium chloride dissolves in water in an insulated cup. The water gains 950 J as it warms, and nothing else gains or loses energy. Which statement about the system, the dissolving lithium chloride, is right?"
  - Option 1: Its energy rose by 950 J, so the dissolving is endothermic.
  - Option 2: Its energy fell by 950 J, so the dissolving is exothermic.
  - Option 3: Its energy did not change, because energy is conserved.
  - Option 4: Its energy fell by more than 950 J, because warming the water used up extra energy on top of that.
  - Why: the water is surroundings, and it gained 950 J. Energy is conserved, so that 950 J came from the system: the system's energy fell by 950 J, and a change in which the system loses energy is exothermic. Conserved does not mean that neither part changes; it means the two changes are equal and opposite. With nothing else gaining or losing energy, there is nowhere for any extra to have gone.
  - Miss 1: "The water is surroundings, and it gained the 950 J. Can the system and the surroundings both gain energy?"
  - Miss 3: "Conserved means the total for system plus surroundings stays constant. Either part can change if the other changes the opposite way."
  - Miss 4: "Warming the water is where the 950 J went. With nothing else gaining or losing energy, where could any extra have gone?"
  - Note for the writer: lithium chloride dissolving is exothermic (certain). The 950 J is given, not calculated; do not show how it would be measured (topic 6.4).
- **Trap:** **Calling a change endothermic because the temperature went up** (the thermometer is nearly always in the surroundings; if they warmed, the system lost energy). **Switching point of view halfway** (exothermic, endothermic and the sign all describe the system; decide what the system is before anything else). **Treating a chill as something that arrives** (the ankle under the spray chills because energy leaves the skin and goes into the evaporating liquid; no "cold" passes from the liquid into the skin). **Counting the water as part of the system** (for a reaction or a dissolving in water, the water whose temperature you read is surroundings). **Thinking that pulling particles apart releases energy** (overcoming an attraction always takes energy in; forming one releases energy, as topic 2.2 said for bonds). **Assuming dissolving always cools, or always warms** (it depends on which is larger, the energy taken in or the energy released).
  - Note for the writer: "always" in the fifth item is literally true and matches lesson 2.2's key point. "Nearly always" in the first is deliberate: for a substance that is only being heated or cooled, the thermometer reads the system itself.
- **Key points:** the system is what you are studying and the surroundings are everything else, and for a change in water the water is surroundings; a temperature change shows that energy is changing, because temperature measures average kinetic energy; an exothermic change lowers the system's energy and the surroundings gain that energy, and an endothermic change raises the system's energy at the surroundings' expense; cooling, freezing and condensing are exothermic for the substance, and heating, melting and vaporizing are endothermic; energy enters or leaves a system as heat or as work; dissolving is exothermic when forming the new attractions releases more energy than overcoming the old ones takes, and endothermic when it releases less.

**Check script:** `scratchpad/unit6/checks/6-1.py`. It recomputes the three temperature changes (4.5, 8 and 1.5 °C), checks the bar heights of the second figure and that the taller bar is the one each panel says, checks the balance in atoms and charge of the equations in the notes for the writer (citric acid with sodium hydrogen carbonate, rusting, and the three dissolvings), the summary's length, every message's length and characters, every figure label's width, the answer positions and that no correct option is the longest.

**Values**

| Value | Used in | Source and certainty |
|---|---|---|
| Paraffin wax therapy bath, about 52 °C | Check 2 | Typical setting of clinical paraffin baths, 52 to 54 °C (verify) |
| Butter melts over a range, roughly 28 to 36 °C | Check 1 (no number printed) | General knowledge; butter is a mixture of fats, so the lesson says "melting" and gives no melting point |
| Ethyl chloride boils at 12.3 °C | Opening (not printed; explains why it evaporates off skin at once) | CRC Handbook (verify). Not printed in the lesson |
| Steel wool rusting: 21 °C to 29 °C | Check 3 | Illustration; typical of the classroom experiment (verify) |
| Bath bomb mixture: 21.5 °C to 17.0 °C | Worked example | Illustration for an unstated amount; the direction (endothermic) is certain |
| Potassium chloride: 22.0 °C to 20.5 °C | Check 4 | Illustration; the direction is certain (enthalpy of solution about +17 kJ/mol, CRC Handbook, not printed) |
| Lithium chloride: 950 J | Check 5 | Given in the question; the direction is certain (enthalpy of solution about −37 kJ/mol, CRC Handbook, not printed) |

**Reactions, substances and scenarios used:** two-part epoxy glue heating its cup as it cures, and ethyl chloride cold spray evaporating off an ankle (opening, and the running examples of the first three sections); a cast-iron skillet cooling and a pizza stone heating (table); citric acid with baking soda as a bath bomb crumbled into a cup of water with a thermometer, 21.5 °C to 17.0 °C (table and worked example); wet concrete curing against wooden forms, a pat of butter melting in a warm pan, a baked loaf cooling on a rack, water vapor turning to frost on a windshield (Check 1); a physical therapist's paraffin wax bath at about 52 °C (Check 2); steel wool soaked in vinegar around a thermometer bulb, holding at 21 °C in a jar of nitrogen and climbing to 29 °C as it rusts once the jar is opened to the air (Check 3); a soap maker dissolving solid sodium hydroxide, and a xylitol mint cooling the tongue (dissolving section); potassium chloride salt substitute in a glass of water, 22.0 °C to 20.5 °C (Check 4); lithium chloride dissolving in an insulated cup, the water gaining 950 J (Check 5); a reaction making a gas pushing the air back (work). No equation appears in the lesson. The two figures are the two the design lists for this lesson.

**Check script:** `scratchpad/unit6/checks/6-1.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.1 Endothermic and Exothermic Processes`).

### Task 2: Lesson 6.2, Energy Diagrams

**Files:**
- Create: `src/content/lessons/unit-6/6-2-energy-diagrams.mdx`
- Create: `public/figures/6-2-exothermic-endothermic.svg`
- Create: `public/figures/6-2-phase-change.svg`
- Create: `public/figures/6-2-profile-and-diagram.svg`

**Brief**

- **Front matter:** `topic: "6.2"`, `minutes: 10`, summary: "How to read and draw an energy diagram with two levels, tell exothermic from endothermic by the direction of the arrow, and see how it relates to the energy profiles of Unit 5." (No colon in the summary.)
- **Framework (6.2, one statement):** a physical or chemical process can be shown on an energy diagram that shows whether it is endothermic or exothermic. The objective is to represent a chemical or physical change with an energy diagram, so the student must both read one and draw one. Topic 6.2 asks only for the energy of the start and of the end and the direction of the change. **What this lesson does not do:** it does not re-teach the transition state, the activation energy, the reverse activation energy or the effect of a catalyst (topics 5.6, 5.10 and 5.11, already on the site): it says in one section how the two kinds of drawing relate, and sends the student back to those topics for the hill. It does not define enthalpy or use ΔH as a quantity (topic 6.6); it does not calculate an energy from a temperature change (topic 6.4), from a molar enthalpy of a phase change (topic 6.5), from bond energies (topic 6.7) or from enthalpies of formation (topic 6.8). The two published energies in the lesson (353 kJ and 25.2 kJ) are given, each for one mole, as numbers to put on an axis. Nothing in this lesson is on the equation sheet. A short lesson on one statement: do not pad it.
- **Opening:** a soldier's field ration comes with a heater that needs no flame. Pour a little water into the pouch, and the magnesium powder inside reacts with it. In about ten minutes the meal is steaming. That energy was in the magnesium and the water all along: together they held more energy than the magnesium hydroxide and hydrogen they turned into. An energy diagram is a drawing of exactly that: where the system's energy started, where it ended, and the drop between.
  - Note for the writer: the flameless ration heater is real (a magnesium–iron powder with salt, started by water). Mg(s) + 2 H₂O(l) → Mg(OH)₂(s) + H₂(g). The equation is given in the worked example, not here.
- **Section "Two levels and an arrow":**
  - An **energy diagram** shows the energy of a system before and after a change. Up the side is energy. There is one horizontal line, called a level, for the system at the start, and one for the system at the end. An arrow runs from the starting level to the final level.
  - Exam diagrams label the vertical axis "energy", "potential energy" or "enthalpy". Read them all the same way. (One sentence; do not define enthalpy: topic 6.6 does.)
  - Reading it uses the two words of topic 6.1. If the final level is lower, the arrow points down: the system ended with less energy than it started with, the difference went to the surroundings, and the change is exothermic. If the final level is higher, the arrow points up: the system took energy in from the surroundings, and the change is endothermic.
  - The start and the end are labeled with what the system is at each: "reactants" and "products" for a reaction, or the formulas with their state symbols.
  - Only the two levels and the gap between them carry information. Left to right there is no scale. Many diagrams draw the starting level on the left and the final level on the right, with "reaction progress" along the bottom, as the profiles of Unit 5 do.
  - Figure `6-2-exothermic-endothermic.svg` here.
  - `<KeyIdea>`: on an energy diagram, follow the arrow from the starting level to the final level. Down means the system released energy: exothermic. Up means the system absorbed energy: endothermic. The length of the arrow is the amount of energy.
- **Figure** `6-2-exothermic-endothermic.svg` (viewBox `0 0 480 300`, font-size 18): two diagrams side by side, left panel x 10 to 230, right panel x 250 to 470.
  - Each panel: a title centered at y = 28 ("Exothermic" on the left, "Endothermic" on the right). A vertical axis in ink with an arrowhead at the top, from y = 240 up to y = 50, at x = 45 (left panel) and x = 285 (right panel), with the word "energy" rotated to read upward, centered beside it at x = 28 (left) and x = 268 (right).
  - Left panel: the reactants' level is a thick ink line from x = 60 to x = 130 at y = 90, with "reactants" above it (baseline y = 80, starting at x = 60). The products' level is a thick ink line from x = 150 to x = 220 at y = 200, with "products" below it (baseline y = 224, starting at x = 150). A thin dashed guide in secondary continues the reactants' level from x = 130 to x = 145. A solid arrow in accent runs straight down at x = 140 from y = 94 to y = 196, arrowhead at the bottom. Under the panel, centered at y = 272: "energy released".
  - Right panel: the reactants' level from x = 300 to x = 370 at y = 200, with "reactants" below it (baseline y = 224). The products' level from x = 390 to x = 460 at y = 90, with "products" above it (baseline y = 80, starting at x = 390). A thin dashed guide continues the products' level from x = 375 to x = 390. A solid arrow in accent runs straight up at x = 380 from y = 196 to y = 94, arrowhead at the top. Under the panel, centered at y = 272: "energy absorbed".
  - The two panels differ in which level is higher and in the direction of the arrowhead, not in color. No numbers.
  - Alt: "Two energy diagrams side by side, each with a vertical axis labeled energy and two horizontal levels. In the first, titled exothermic, the reactants' level is higher than the products' level, and an arrow points down from the reactants' level to the products' level, with the words energy released. In the second, titled endothermic, the reactants' level is lower than the products' level, and an arrow points up from the reactants' level to the products' level, with the words energy absorbed."
  - Caption: "Follow the arrow from start to finish. Down: the system released energy. Up: the system absorbed energy."
- **Check 1**, `<Check answer={3}>`: "An energy diagram for a reaction between two dissolved substances shows the products' level 80 kJ above the reactants' level. The reaction is run in water in an insulated cup, with a thermometer in the water. What does the thermometer show?"
  - Option 1: A rise, because the products have 80 kJ more energy to pass on to the water.
  - Option 2: A rise, because a reaction releases the amount of energy shown by the gap.
  - Option 3: A fall, because the system takes the energy it gains from the water.
  - Option 4: No change, because energy is conserved and the two levels cancel out.
  - Why: the products' level is higher, so the arrow points up: the system ends with 80 kJ more energy than it started with, and the reaction is endothermic. That energy has to come from the surroundings, and here the surroundings are the water (topic 6.1). The water loses energy, so its temperature falls. A gap is not always energy released: its direction says whether energy went out or came in. And conservation means the water's loss equals the system's gain, not that nothing changes.
  - Miss 1: "Check which side ends with more energy. Can the system gain 80 kJ and also hand 80 kJ to the water?"
  - Miss 2: "A gap can be energy released or energy absorbed. Which way does the arrow run when the products' level is the higher one?"
  - Miss 4: "Conservation covers the system and the surroundings together. The system's own energy changes by the gap between the levels."
- **Section "Putting numbers on it":**
  - When the axis has numbers, the gap between the levels is the amount of energy the system released or absorbed. The system's energy change is the final level minus the starting level. For a drop the result is negative, which is the sign topic 6.1 gave an exothermic change. For a rise it is positive.
  - This is the same subtraction as topic 5.6's overall energy change, ΔE: products minus reactants. Topic 5.6 noted that the exam often labels that gap ΔH; topic 6.6 says what ΔH is. (Two sentences, no more.)
  - Only the gap matters. Where zero sits on the axis is a free choice, and it is often convenient to put the starting level at zero, as topic 5.10 did.
  - The amount of energy depends on how much reacts, so a diagram with numbers is drawn for a stated amount, here one mole. (One sentence; topic 6.6 treats this in full.)
- **Worked example "Drawing the diagram for a ration heater":** in a flameless ration heater, magnesium reacts with water:

  Mg(s) + 2 H₂O(l) → Mg(OH)₂(s) + H₂(g)

  For each mole of magnesium that reacts, the system releases 353 kJ. Draw the energy diagram for one mole of magnesium, and give the system's energy change.
  1. **Name the start and the end.** Start: Mg(s) and 2 H₂O(l), the reactants. End: Mg(OH)₂(s) and H₂(g), the products.
  2. **Decide which level is higher.** The system releases energy, so it ends with less than it started with. The reactants' level is the higher one.
  3. **Draw the axis and the two levels.** Draw a vertical axis labeled "energy (kJ)". Put the reactants' level at 0 and label it Mg(s) + 2 H₂O(l). The products are 353 kJ lower, so their level is at −353 kJ. Label it Mg(OH)₂(s) + H₂(g).
  4. **Draw the arrow from start to finish.** It points down, from 0 to −353 kJ. Label it "353 kJ released".
  5. **State the energy change.** Final minus starting: −353 − 0 = −353 kJ. The sign is negative, and the arrow points down: the reaction is exothermic.

  After the steps: that 353 kJ is what heats the meal. The diagram says how much energy there is to be had. It does not say how fast it comes, or what gets the reaction going: the last section of the lesson comes back to that.

  Note for the writer: the lesson shows no drawing of this diagram (the student draws it; the first figure shows the shape). Write the equation in a display block with `\ce`. 353 kJ is from standard enthalpies of formation, −924.5 − 2(−285.8) = −352.9 kJ, rounded to 353 (verify). Do not write "ΔH = −353 kJ/mol" and do not mention formation: say "releases 353 kJ" and "energy change".
- **Check 2**, `<Check numeric="-175" unit="kJ">`: "On an energy diagram, the starting level of a system is at 310 kJ and its final level is at 135 kJ. What is the system's energy change? Give it with its sign."
  - Why: the energy change is the final level minus the starting level: 135 − 310 = −175 kJ. The final level is lower, so the arrow points down, the sign is negative and the change is exothermic: the system releases 175 kJ.
  - Slip `175`, from: the sign left off (or starting minus final). Message: "Did you leave off the sign, or take starting minus final? A change is final minus starting."
  - Slip `445`, from: the two levels added. Message: "Did you add the two levels? A change is the final level minus the starting level."
  - Slip `-445`, from: the two levels added and a minus sign put on. Message: "Is that the two levels added? The gap between them is the final level minus the starting level."
  - Tolerance: the default 2 percent (−171.5 to −178.5). All three slips lie far outside it. The question asks for the sign in words, and the unsigned value is a slip.
  - Note for the writer: in the Why, put the subtraction on its own line.
- **Section "A physical change gets the same diagram":**
  - Nothing about the diagram needs a reaction. A change of phase has a start and an end too.
  - Dry ice is solid carbon dioxide. At −78.5 °C it turns straight from solid to gas, a change called sublimation, and it absorbs 25.2 kJ for each mole as it goes. That is where a dry-ice fog machine gets its chill: the energy comes out of the water and the air around the dry ice. On the diagram, CO₂(s) is the lower level, CO₂(g) is the upper level, and the arrow points up: endothermic.
  - Run the change backward and you get the same two levels with the arrow reversed. When carbon dioxide gas turns to solid, it releases the same 25.2 kJ per mole. The gap belongs to the pair of levels. The direction of travel decides whether it is absorbed or released. One sentence: topic 6.5 uses this for melting and boiling.
  - Figure `6-2-phase-change.svg` here.
  - Note for the writer: introduce "sublimation" in bold with its definition in the same sentence (lesson 6.1's brief allows it one clause without the bold; if the unit's finished 6.1 already defines it in bold, do not bold it again). "Deposition" appears in the figure; give it one clause ("the reverse, called deposition"). Do not explain the fog (water droplets condensed from the chilled air) beyond the sentence above.
- **Figure** `6-2-phase-change.svg` (viewBox `0 0 480 300`, font-size 18): one energy diagram.
  - A vertical axis in ink at x = 70 from y = 270 up to y = 30, arrowhead at the top, with "energy" rotated to read upward, centered beside it at x = 45.
  - The lower level: a thick ink line from x = 100 to x = 440 at y = 220, with the label "CO₂(s)" below it (baseline y = 246, starting at x = 100). The upper level: a thick ink line from x = 100 to x = 440 at y = 80, with the label "CO₂(g)" above it (baseline y = 68, starting at x = 100).
  - A **solid** arrow in accent at x = 150, from y = 216 up to y = 84, arrowhead at the top. To its right, two lines of text starting at x = 162: "sublimation" (baseline y = 142) and "25.2 kJ in" (baseline y = 166).
  - A **dashed** arrow in accent at x = 300, from y = 84 down to y = 216, arrowhead at the bottom, the same length as the solid one. To its right, two lines of text starting at x = 312: "deposition" (baseline y = 142) and "25.2 kJ out" (baseline y = 166).
  - The two arrows differ in dash pattern and direction, not in color alone.
  - Alt: "An energy diagram with a vertical axis labeled energy and two horizontal levels. The lower level is labeled CO₂(s) and the upper level CO₂(g). A solid arrow points up from the lower level to the upper level, labeled sublimation, 25.2 kJ in. A dashed arrow of the same length points down from the upper level to the lower level, labeled deposition, 25.2 kJ out."
  - Caption: "One mole of carbon dioxide as a solid and as a gas. Going up, the system absorbs 25.2 kJ. Coming back down, it releases the same 25.2 kJ."
- **Check 3**, `<Check answer={1}>`: "A hobbyist casts a toy figure by pouring molten tin into a mold, where the tin hardens at 232 °C and the mold grows hot. With the tin as the system, which energy diagram fits the hardening?"
  - Option 1: Liquid tin on the upper level, solid tin on the lower level, and the arrow pointing down
  - Option 2: Solid tin on the upper level, liquid tin on the lower level, and the arrow pointing down
  - Option 3: Liquid tin on the lower level, solid tin on the upper level, and the arrow pointing up
  - Option 4: Liquid tin and solid tin on one level, because the temperature stays at 232 °C throughout
  - Why: the change starts with liquid tin and ends with solid tin. The mold, which is surroundings, grows hot, so the tin is releasing energy: the change is exothermic, and the final level is the lower one. That puts liquid tin on the upper level, solid tin on the lower level and the arrow pointing down. The second option's arrow runs from solid to liquid, which is melting. The third has the tin gaining energy as it hardens, and the mold would cool. In the fourth, the temperature does stay at 232 °C, but energy still leaves the tin as it changes phase (topic 6.5 explains how), so the two levels cannot be the same.
  - Miss 2: "An arrow runs from the start to the finish. Follow this one: which form of tin does it start from?"
  - Miss 3: "This has the tin gaining energy as it hardens. Would the mold then grow hot?"
  - Miss 4: "A steady temperature does not mean a steady energy. The mold grows hot, so energy is crossing between it and the tin."
  - Note for the writer: tin melts at 232 °C, the value lesson 3.2 prints. Keep "and the mold grows hot" in the question: it is the observation the answer rests on.
- **Section "The same picture as Unit 5, without the hill":**
  - You have drawn something like this before. The energy profile of topic 5.6 starts at the reactants' level and ends at the products' level, and those are the same two levels as on an energy diagram. The profile adds the path between them: the climb to the transition state. The height of that climb, the activation energy, is what decides how fast the reaction goes. All of that is Unit 5's business, and nothing about it changes here.
  - An energy diagram leaves the path out, and can, because the system's energy change does not depend on it: topic 5.10 found the overall energy change from the first reactants and the final products, however many steps lay between.
  - So to turn a profile into an energy diagram, keep the first level and the last level and drop everything between. To read exothermic or endothermic from a profile, do the same with your eyes: compare the two ends. The peak has no say in it.
  - Figure `6-2-profile-and-diagram.svg` here.
  - The other way around, an energy diagram cannot tell you what a profile can. Two levels say nothing about the hill, so they say nothing about how fast the change goes or whether it needs a push to start. A match sits in its box for years until it is struck.
  - Note for the writer: use topic 5.6's terms exactly ("energy profile", "transition state", "activation energy", "overall energy change"). Do not define them again, give no formula for the activation energy and do not mention a catalyst.
- **Figure** `6-2-profile-and-diagram.svg` (viewBox `0 0 480 320`, font-size 18): the same exothermic reaction drawn two ways on one shared energy axis.
  - A vertical axis in ink at x = 45 from y = 270 up to y = 45, arrowhead at the top, with "energy" rotated to read upward, centered beside it at x = 26.
  - Two thin dashed guide lines in secondary run the full width from x = 45 to x = 465: one at y = 130 (the reactants' energy) and one at y = 215 (the products' energy).
  - Left drawing (x 55 to 265), title "Energy profile" centered at x = 160, y = 28. A smooth curve in ink: level at y = 130 from x = 60 to x = 100, rising to a rounded peak at (160, 65), falling to y = 215 at x = 220 and level to x = 260. "transition state" centered above the peak at x = 160, baseline y = 55. "reactants" below the first level stretch, starting at x = 58, baseline y = 152. "products" below the last level stretch, starting at x = 196, baseline y = 238. "reaction progress" centered at x = 160, baseline y = 300, under a thin horizontal axis line at y = 270 from x = 45 to x = 265.
  - Right drawing (x 290 to 465), title "Energy diagram" centered at x = 378, y = 28. The reactants' level: a thick ink line from x = 295 to x = 365 at y = 130, with "reactants" above it starting at x = 295, baseline y = 120. The products' level: a thick ink line from x = 390 to x = 460 at y = 215, with "products" below it starting at x = 390, baseline y = 238. A solid arrow in accent straight down at x = 378 from y = 134 to y = 211, arrowhead at the bottom.
  - The guide lines must not pass through any label: every label sits clear of y = 130 and y = 215. The title "Energy profile" and the label "transition state" must not touch.
  - Alt: "Two drawings of one exothermic reaction on a shared vertical axis labeled energy. On the left, titled energy profile, a curve starts at the reactants' level, rises over a peak labeled transition state and falls to the products' level, which is lower, with reaction progress along the bottom. On the right, titled energy diagram, there are only two levels, reactants above and products below, joined by an arrow pointing down. Two dashed lines run across both drawings, one at the reactants' energy and one at the products' energy, showing that the levels match."
  - Caption: "One reaction, drawn two ways. The energy diagram keeps the two ends of the profile and leaves out the hill between them."
- **Check 4**, `<Check answer={4}>`: "The energy profile of a reaction with one step has its reactants at 25 kJ/mol, its transition state at 140 kJ/mol and its products at 70 kJ/mol. You redraw it as a two-level energy diagram. What does your diagram show?"
  - Option 1: Levels at 25 and 140 kJ/mol, with the arrow pointing up: 115 kJ/mol absorbed
  - Option 2: Levels at 140 and 70 kJ/mol, with the arrow pointing down: 70 kJ/mol released
  - Option 3: Levels at 25 and 70 kJ/mol, with the arrow pointing down: 45 kJ/mol released
  - Option 4: Levels at 25 and 70 kJ/mol, with the arrow pointing up: 45 kJ/mol absorbed
  - Why: an energy diagram keeps the two ends of the profile: the reactants at 25 kJ/mol and the products at 70 kJ/mol. The arrow runs from the start to the finish, from 25 up to 70, so it points up, and the energy change is 70 − 25 = +45 kJ/mol: endothermic. The first option measures to the peak: 140 − 25 = 115 kJ/mol is the activation energy of topic 5.6, not the energy change. The second starts from the peak: 140 − 70 = 70 kJ/mol is the activation energy of the reverse reaction. The third has the right levels with the arrow run backward.
  - Miss 1: "140 kJ/mol is the top of the hill. An energy diagram keeps the start and the finish. Which two numbers are those?"
  - Miss 2: "A diagram of a change begins at the level where the change begins. Where do the reactants sit on this profile?"
  - Miss 3: "A change runs from its starting level to its final level. Which level of this profile is the start, and is the finish above it or below it?"
- **Check 5**, `<Check answer={2}>`: "A two-level energy diagram for a reaction shows the products 200 kJ below the reactants. Which conclusion can you draw from the diagram alone?"
  - Option 1: The reaction is fast, because the drop in energy is large.
  - Option 2: The system releases 200 kJ to its surroundings as the reaction happens.
  - Option 3: The reaction needs no energy to get it started, because it runs downhill.
  - Option 4: The products end up colder than the reactants were, because they have less energy.
  - Why: the final level is 200 kJ lower, so the system loses 200 kJ and the surroundings gain it. That is all two levels can say. How fast the reaction goes, and whether it needs energy to get started, depend on the hill between the levels, which this diagram does not draw (topic 5.6). And the levels are the system's energy, not a temperature: the energy released usually leaves everything warmer.
  - Miss 1: "The size of the drop is an amount of energy. What on a profile from topic 5.6 decides how fast a reaction goes?"
  - Miss 3: "Burning paper runs downhill too, yet a sheet can sit in air for years (topic 5.6). Is the hill drawn on this diagram?"
  - Miss 4: "The levels show the system's energy, not a temperature. A lower level does not say that the products are cold."
- **Trap:** **Reading the arrow backward** (it runs from the start to the finish; products below reactants means energy was released). **Deciding exothermic or endothermic from the peak of a profile** (compare the two ends; the peak is about speed, topic 5.6). **Dropping the sign** (the energy change is final minus starting, so a drop is negative). **Thinking a lower level means a lower temperature** (the levels are the system's energy; an exothermic change warms the surroundings). **Putting both phases on one level because the temperature did not change** (a phase change moves energy at a steady temperature). **Reading speed from the size of the drop** (two levels say nothing about how fast).
- **Key points:** an energy diagram shows the system's energy at the start and at the end of a change, with an arrow from the starting level to the final level; an arrow pointing down means the system released energy and the change is exothermic, and an arrow pointing up means it absorbed energy and the change is endothermic; the system's energy change is the final level minus the starting level, negative for a drop and positive for a rise; a physical change such as a change of phase gets the same kind of diagram, and reversing a change keeps the gap and reverses the arrow; an energy diagram is an energy profile with only its two ends kept, so it shows how much energy and which way but nothing about how fast.

**Check script:** `scratchpad/unit6/checks/6-2.py`. It checks the balance of the magnesium equation, recomputes 353 kJ from the two enthalpies of formation, the worked example's energy change, Check 2's answer and its three slips (each outside the 2 percent tolerance), Check 4's three subtractions, the equal lengths of the two arrows in the phase-change figure, that the guide lines of the third figure sit on the levels of both drawings, the summary's length, every message's length and characters, every figure label's width, the answer positions and that no correct option is the longest.

**Values**

| Value | Used in | Source and certainty |
|---|---|---|
| Mg(s) + 2 H₂O(l) → Mg(OH)₂(s) + H₂(g) releases 353 kJ per mole of Mg | Worked example | From standard enthalpies of formation: Mg(OH)₂(s) −924.5 kJ/mol and H₂O(l) −285.8 kJ/mol (CRC Handbook; NIST), giving −352.9 kJ (verify the −924.5) |
| CO₂ sublimes at −78.5 °C at 1 atm | Phase-change section | CRC Handbook |
| Enthalpy of sublimation of CO₂, 25.2 kJ/mol | Phase-change section and figure | CRC Handbook, at the sublimation point (verify to three figures; 26.1 kJ/mol is quoted in some tables for other conditions) |
| Tin melts at 232 °C | Check 3 | CRC Handbook 231.93 °C; lesson 3.2 prints 232 |
| Profile levels 25, 140 and 70 kJ/mol; diagram levels 310 and 135 kJ; gaps of 80 kJ and 200 kJ | Checks 1, 2, 4 and 5 | Made up for reading practice, as the profiles of lessons 5.6 and 5.10 are; none repeats a set of numbers in those lessons, in the Unit 5 practice or in the teacher's materials |

**Reactions, substances and scenarios used:** a flameless ration heater, magnesium with water giving magnesium hydroxide and hydrogen, 353 kJ released per mole of magnesium (opening, worked example); a match in its box (last section); an unnamed endothermic reaction between dissolved substances in an insulated cup, products 80 kJ above reactants (Check 1); a diagram with levels at 310 kJ and 135 kJ (Check 2); dry ice subliming at −78.5 °C, 25.2 kJ per mole, chilling a dry-ice fog machine, and the reverse (phase-change section and figure); molten tin hardening at 232 °C in a hobbyist's mold (Check 3); a one-step profile with levels 25, 140 and 70 kJ/mol (Check 4); a diagram with products 200 kJ below reactants (Check 5); burning paper, by reference to topic 5.6, in one wrong-answer message. Figures: the two the design lists and a third that sets a profile beside an energy diagram.

**Check script:** `scratchpad/unit6/checks/6-2.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.2 Energy Diagrams`).

### Task 3: Lesson 6.3, Heat Transfer and Thermal Equilibrium

**Files:**
- Create: `src/content/lessons/unit-6/6-3-heat-transfer-and-thermal-equilibrium.mdx`
- Create: `public/figures/6-3-thermal-equilibrium.svg`

**Brief**

- **Front matter:** `topic: "6.3"`, `minutes: 10`, summary: "How collisions between particles pass energy from a warmer body to a cooler one, and why thermal equilibrium means equal temperatures, not equal amounts of energy." (No colon in the summary.)
- **Framework (6.3, three statements):** (1) the particles of a warmer body have a greater average kinetic energy than those of a cooler body; (2) collisions between the particles of bodies in thermal contact can transfer energy, and this is called heat transfer, heat exchange, or the transfer of energy as heat; (3) in time the bodies reach thermal equilibrium as the particles go on colliding, and at thermal equilibrium the average kinetic energy of the particles of both bodies is the same, so their temperatures are the same. The objective is to explain the transfer of thermal energy in terms of collisions between particles, so the lesson's work is the particle-level explanation in words. **What this lesson does not do:** no q, no q = mcΔT, no specific heat capacity and no final temperature calculated (all topic 6.4): the lesson says only that the final temperature lies between the two starting temperatures and need not be halfway. No conduction, convection or radiation as named kinds of transfer. No Maxwell–Boltzmann curve (topic 3.5 has it). Nothing in this lesson is on the equation sheet. A short lesson on three statements: do not pad it.
- **Builds on topic 3.5,** which says that the kelvin temperature of a gas is proportional to the average kinetic energy of its particles, that every gas at one temperature has the same average kinetic energy, that lighter particles are then the faster ones, and that the particles of liquids and solids are moving too. This lesson extends "same temperature, same average kinetic energy" from gases to any two bodies, as the framework's statements do. Name topic 3.5 in plain text where it is used.
- **Opening:** push a probe thermometer into a chicken just out of the oven, and the number climbs for several seconds before it holds still. A thermometer can report only one temperature: its own. What you are waiting for is the probe coming to the temperature of the meat. This lesson is about what happens, particle by particle, during that wait, and what is true once the number stops.
  - Note for the writer: "only" is literal here: a thermometer's reading is set by its own sensor's temperature. Do not use the opening to state the answer to Check 3 (what is true once the number stops).
- **Section "Warmer means more kinetic energy, on average":**
  - Topic 3.5: the particles of a gas are in constant motion, and temperature measures their average kinetic energy. The same holds for a liquid, whose particles move past one another, and for a solid, whose particles vibrate about fixed positions. Whatever a body is made of, a higher temperature means its particles have a greater average kinetic energy.
  - Two consequences. A warmer body's particles have, on average, more kinetic energy than a cooler body's. And two bodies at the same temperature have the same average kinetic energy per particle, even if their particles are quite different.
  - "Average" matters, as in topic 3.5: in any body some particles have more kinetic energy than the average and some have less.
  - Same average kinetic energy does not mean same speed: topic 3.5 showed that lighter particles move faster at the same temperature. (One sentence; Check 3's fourth option rests on it.)
  - Note for the writer: Do not say before Check 1 that a solid and a liquid at one temperature have the same average kinetic energy. Check 1 tests it, and its Why says it.
- **Check 1**, `<Check answer={4}>`: "A glass bottle of olive oil has stood in a kitchen cupboard at 20 °C for days. How does the average kinetic energy of the particles in the oil compare with that of the particles in the glass?"
  - Option 1: The oil's is greater, because the particles of a liquid are free to move around.
  - Option 2: The glass's is zero, because particles that are held in place in a solid do not move.
  - Option 3: Whichever of the two has the greater mass, the oil or the bottle, has the greater average.
  - Option 4: They are equal, because the oil and the glass are at the same temperature.
  - Why: after days in the cupboard the oil and the glass are both at 20 °C, and bodies at the same temperature have the same average kinetic energy per particle. Being a liquid changes how the particles are arranged and how they can move, not how much kinetic energy they have on average. The particles of the glass are held in place but they vibrate, and vibration is motion. And an average is per particle, so it does not depend on how much oil or glass there is.
  - Miss 1: "Free to move around is about how the particles are arranged. What does the temperature of a body measure?"
  - Miss 2: "Particles in a solid vibrate about fixed positions (topic 3.5), and that motion is kinetic energy."
  - Miss 3: "An average is per particle. Would pouring more oil into the bottle change the temperature of the oil?"
- **Section "Collisions carry the energy across":**
  - Two bodies are in **thermal contact** when energy can pass between them, as it can when they touch.
  - Where a warm body touches a cool one, the particles at the two surfaces collide. The warm body's particles have more kinetic energy on average. When one of them strikes a particle of the cool body that has less kinetic energy, it usually comes away with less kinetic energy than it had, and the particle it struck comes away with more. Each particle then collides with its own neighbors, and the energy spreads inward.
  - Any one collision can go either way: now and then a particle of the cool body gives energy to a particle of the warm one. But collisions that carry energy from the warm body to the cool body outweigh the others, so on balance energy passes from the warmer body to the cooler one.
  - Energy that passes from one body to another because of a difference in temperature is called **heat**. "Heat transfer", "heat exchange" and "energy transferred as heat" all name this one process.
  - Two things follow from the picture. No particles need to cross from one body to the other: energy crosses, and matter stays where it was. And nothing called "cold" travels. A stone floor feels cold under bare feet because energy is leaving your skin.
  - Heat is a name for energy on its way from one body to another. Once it has arrived it is part of the energy of the body's particles. So a body does not "have heat": it has energy, and a temperature.
  - Figure `6-3-thermal-equilibrium.svg` here, with one sentence pointing at its top drawing. The last section of the lesson comes back to the bottom drawing to compare the totals; say nothing about the totals here or in the caption.
  - Note for the writer: keep "usually", "on balance" and "on average": a single collision can pass energy either way, and the brief's Checks depend on the net direction, not on every collision. Do not write that "every collision" passes energy from the warm body to the cool one.
- **Figure** `6-3-thermal-equilibrium.svg` (viewBox `0 0 480 420`, font-size 18): two drawings, one above the other, each of a small body touching a larger body along one shared wall.
  - **Particles.** The small body (left) holds **6** particles, drawn as filled ink circles of radius 6, in 3 columns and 2 rows. The large body (right) holds **10** particles, drawn as open circles of radius 6 (stroke ink, fill `#FDFCF9`), in 5 columns and 2 rows. Each particle has one straight streak in accent `#4F706C`, 3 wide, that starts at the particle's edge and points away from it; the streak's length stands for the particle's kinetic energy. Point the streaks in varied directions, and check that no streak touches another particle, another streak or a wall.
  - **Top drawing, "Before".** The label "Before" at x = 60, baseline y = 30. The small body is a rectangle from x = 60 to x = 210, y = 45 to y = 165, fill light accent `#E3EAE9`, stroke ink. The large body is a rectangle from x = 210 to x = 420, y = 45 to y = 165, fill `#FDFCF9`, stroke ink. They share the wall at x = 210. Particle centers: small body at x = 85, 135, 185 and y = 80, 130; large body at x = 235, 275, 315, 355, 395 and y = 80, 130. Streak lengths, small body, row by row: 24, 28, 32, then 32, 24, 28 (total 168, average 28). Streak lengths, large body, row by row: 8, 12, 16, 8, 12, then 16, 8, 12, 16, 12 (total 120, average 12). Under the small body, centered at x = 135, baseline y = 190: "warmer". Under the large body, centered at x = 315, baseline y = 190: "cooler". Between those two words, a solid ink arrow from x = 180 to x = 250 at y = 184, arrowhead at the right, and under it, centered at x = 215, baseline y = 214: "net energy transfer".
  - **Bottom drawing, "At thermal equilibrium".** The label at x = 60, baseline y = 250. The same two rectangles, 215 lower (y = 260 to y = 380), with the same fills, and particle centers at y = 295 and y = 345. Streak lengths, small body: 14, 18, 22, then 22, 14, 18 (total 108, average 18). Large body: 14, 18, 22, 14, 18, then 22, 14, 18, 22, 18 (total 180, average 18). Under both bodies, centered at x = 240, baseline y = 406: "same average kinetic energy". No arrow.
  - The streak lengths are chosen so that the total is the same in both drawings (168 + 120 = 288 and 108 + 180 = 288) and so that the two averages are equal at the end (18 and 18) while the two totals are not (108 and 180). The two bodies differ in fill and their particles differ in filled against open circles, not in color alone.
  - Alt: "Two drawings of a small body touching a larger one. The small body holds 6 filled particles and the large body holds 10 open particles, and each particle has a streak whose length stands for its kinetic energy. In the top drawing, labeled before, the streaks in the small body are long and those in the large body are short. The small body is labeled warmer and the large body cooler, and an arrow labeled net energy transfer points from the small body to the large one. In the bottom drawing, labeled at thermal equilibrium, the streaks in the two bodies have the same average length, and the label reads same average kinetic energy."
  - Caption: "A longer streak means more kinetic energy. Energy passes, on balance, from the warmer body to the cooler one until the averages match."
  - Note for the writer: the streaks stand for kinetic energy, not speed, so the drawing is true whatever the two bodies are made of. The lesson's text gives none of the streak numbers.
- **Check 2**, `<Check answer={2}>`: "You pick up an aluminum can of soda that has been in a refrigerator at 4 °C. Your palm is at about 33 °C. Which statement describes what happens where the skin meets the can?"
  - Option 1: Cold flows out of the can into the skin until the skin's particles have slowed down.
  - Option 2: Particles of the skin collide with particles of the can and, on balance, pass kinetic energy to them.
  - Option 3: Fast particles leave the skin and move into the can's wall, carrying their kinetic energy across with them.
  - Option 4: Collisions swap energy back and forth until the hand and the can each hold the same total amount of energy.
  - Why: the skin is warmer, so its particles have the greater average kinetic energy. Where skin and can touch, the particles collide, and on balance the collisions pass kinetic energy from the skin's particles to the can's. That net transfer of energy is heat. Nothing called cold moves: the skin feels cold because it is losing energy. No particles cross from the skin into the metal: energy crosses, not matter. And the transfer is driven by the difference in temperature, not by the totals: a hand and a can do not need to hold the same amount of energy, and they will not.
  - Miss 1: "Nothing called cold travels. Ask what the particles on each side of the surface are doing, and which have more kinetic energy."
  - Miss 3: "Skin does not move into aluminum. Energy can cross a surface without any particle crossing it. How?"
  - Miss 4: "Check the stopping point. Skin and a can of soda are different materials. What has to match for the net transfer to stop?"
- **Worked example "A cooling iron, particle by particle":** an electric clothes iron is unplugged with its steel soleplate at 150 °C and stood on its heel in a room where the air is at 20 °C. An hour later the plate is at the temperature of the room. Explain, in terms of particles, how the plate cooled and when the cooling stops. (A hot plate also sends out some energy as infrared light, topic 3.11. This example follows the collisions.)
  1. **Compare the average kinetic energies.** The plate is at the higher temperature, so its atoms have a greater average kinetic energy than the molecules of the air.
  2. **Find where the bodies touch.** The molecules of the air are in constant motion (topic 3.5), and every moment some of them strike the surface of the plate.
  3. **Describe the collisions.** On balance, a molecule of the air comes away from the plate with more kinetic energy than it arrived with, and the atoms at the plate's surface are left with less. That molecule then collides with other molecules of the air and passes energy on, out into the room. Inside the plate, atoms deeper in pass energy to the atoms at the surface in the same way.
  4. **Say what happens to each temperature.** The average kinetic energy of the plate's atoms falls, so the plate cools. The molecules of the air gain that energy. Energy has been transferred as heat from the plate to the air.
  5. **Say when it stops.** The net transfer goes on as long as the plate is warmer than the air that touches it. It ends when the plate and the air are at one temperature. Their particles then have the same average kinetic energy.
  6. **Write the explanation.** "The atoms of the plate have the greater average kinetic energy. In collisions at its surface they pass kinetic energy, on balance, to the molecules of the air, which pass it on to other molecules of the air. The plate cools until it is at the temperature of the air, when the particles of both have the same average kinetic energy."

  Do not add, after the example, what the particles are doing once the temperatures are equal: Check 3 asks, and the text after it says. Do not say how much the air warms or give a final temperature in degrees: a room holds so much air that the plate ends very close to 20 °C, but working that out is topic 6.4, and Check 4 asks about a body too large to warm measurably.

  Note for the writer: the soleplate of an iron is steel or aluminum; the brief says steel, so "atoms" is right for the plate and "molecules" for the air. About 150 °C is an iron's wool setting (verify). "Every moment some of them strike" is literal for a gas at room pressure. The one sentence about infrared light is true and is all the lesson says about it; do not name conduction, convection or radiation. This example replaces one about a cold bottle stood in warm water: do not bring a body standing in a liquid back into it.
- **Section "Thermal equilibrium":**
  - Two bodies in thermal contact are at **thermal equilibrium** when their temperatures are the same. Their particles then have the same average kinetic energy. The unplugged iron reached it with the air of the room.
  - Then Check 3, at once: it asks the student to reason out what the particles are doing at thermal equilibrium, from the collisions section and this definition. The explanation follows the Check.
  - Note for the writer: before Check 3 this section has the definition and nothing else. Do not say there that anything continues, stops or balances.
- **Check 3**, `<Check answer={1}>`: "A stainless steel probe thermometer at 22 °C is pushed into a roast chicken at 74 °C. After several seconds the reading holds steady at 74 °C. Which statement is true once the reading is steady?"
  - Option 1: Energy still passes both ways between probe and meat in collisions, in equal amounts.
  - Option 2: Collisions between the particles of the probe and the particles of the meat have stopped.
  - Option 3: The probe and the chicken now hold equal amounts of energy, which keeps the reading steady.
  - Option 4: The particles of the steel probe now move at the same average speed as the particles of the meat.
  - Why: a steady reading means the probe and the meat are at thermal equilibrium: the same temperature, and so the same average kinetic energy per particle. The particles are still moving at 74 °C, so they still collide, and energy still passes in both directions. The amounts are equal, so there is no net transfer and the reading does not change. A small probe has far fewer particles than a chicken, so it holds far less energy in total. And the same average kinetic energy does not mean the same speed: the probe's iron atoms are much heavier than the water molecules that make up most of the meat, so they move more slowly (topic 3.5).
  - Miss 2: "Particles at 74 °C are still moving, so they still collide. A steady reading needs something less drastic."
  - Miss 3: "A small probe and a whole chicken are at one temperature. Compare how many particles each has. Can their total energies match?"
  - Miss 4: "Equal temperatures mean equal average kinetic energies. Iron atoms and water molecules differ in mass, so what follows for speed?"
  - Note for the writer: the chicken is so much larger than the probe that its temperature barely changes; the question gives 74 °C before and after, and the Why need not discuss it. 74 °C is the safe temperature for cooked poultry (165 °F).
  - After Check 3, **what a steady reading tells you** (three or four sentences, starting from the probe): the number on the probe holds still, yet at 74 °C the probe's atoms are still vibrating and the meat's molecules are still striking them. A reading can hold still in that traffic only if the probe hands its neighbors as much energy as it takes from them. That is thermal equilibrium, seen from the inside: energy crossing in both directions, with no net transfer. The reading is the probe's own temperature, which is now the meat's as well. One sentence: topic 7.1 met the same kind of balance, two opposite processes going on at equal rates.
  - `<KeyIdea>`: energy passes as heat from the warmer body to the cooler one, through collisions between their particles, until the two are at the same temperature. At thermal equilibrium the particles of both bodies have the same average kinetic energy, and energy crosses between them in both directions in equal amounts.
  - Note for the writer: keep the pointer to topic 7.1 to one sentence, and do not call thermal equilibrium a chemical equilibrium. "Only" in the second sentence is literal: if the two amounts differed, the probe's energy, and so its reading, would change.
- **Section "Same temperature, not the same energy":**
  - Lift a ladle of stew out of a pot. The ladleful and the pot are at the same temperature, so their particles have the same average kinetic energy. But the pot holds many times as many particles, so it holds many times as much energy. Temperature is about the average for one particle. The energy of a whole body depends also on how much of it there is and on what it is made of.
  - So at thermal equilibrium two bodies share a temperature. They do not share out the energy equally. Look again at the bottom drawing of the figure: the streaks in the two bodies have the same average length, but the larger body has 10 particles to the smaller one's 6, so it holds more energy in total.
  - Note for the writer: "alone" is literal for two bodies in thermal contact exchanging energy as heat. Do not introduce "thermal energy" or "internal energy" as terms: say "the energy of the body's particles" or "the energy it holds". Check 4 comes before the sentence that says temperature alone decides the direction. The ladle paragraph and the collisions section give the student what the Check needs.
- **Check 4**, `<Check answer={3}>`: "A swimmer whose skin is at 33 °C dives into a lake at 18 °C. The lake holds enormously more energy in total than the swimmer does. Which way is energy transferred as heat, and why?"
  - Option 1: From the lake to the swimmer, because the lake holds far more energy in total.
  - Option 2: Neither way, because a lake is far too large for one swimmer to change its temperature.
  - Option 3: From the swimmer to the lake, because the skin's particles have the greater average kinetic energy.
  - Option 4: Both ways in equal amounts from the first moment, because collisions pass energy in both directions.
  - Why: the direction is set by temperature, not by the total. The swimmer's skin is warmer than the water, so its particles have the greater average kinetic energy, and collisions with water molecules pass energy, on balance, from the skin to the water. That is why the lake feels cold. The lake's huge total reflects its huge number of molecules, not how energetic each one is. The lake's temperature changes too little to measure, but energy is still transferred to it. And equal amounts both ways describes thermal equilibrium, which a 33 °C swimmer and an 18 °C lake have not reached.
  - Miss 1: "The total depends on how much water there is. Does a lake's size decide how hard each molecule hits the swimmer's skin?"
  - Miss 2: "A change too small to measure is still a transfer. Can 33 °C skin touch 18 °C water with no net flow of energy?"
  - Miss 4: "Equal amounts both ways describes thermal equilibrium. Are the swimmer and the lake at the same temperature yet?"
  - The direction of heat is decided by temperature alone. Energy passes from the body with the higher temperature to the body with the lower one, however much energy each holds in total.
  - The temperature they end at lies between the two starting temperatures, but not necessarily halfway. Where it falls depends on the amount of each body and on the substances. The room held so much air that the iron ended too close to 20 °C for a thermometer to show the difference. Topic 6.4 works it out.
- **Check 5**, `<Check answer={1}>`: "A glass tumbler comes out of a dishwasher at 60 °C and is filled at once with orange juice at 6 °C. Leave the air out of it. What happens to the two temperatures?"
  - Option 1: The glass cools and the juice warms until they share one temperature between 6 °C and 60 °C.
  - Option 2: The glass cools to 6 °C while the juice stays at 6 °C, because a cold liquid holds its temperature.
  - Option 3: Both end at exactly 33 °C, because thermal equilibrium is always halfway between the starting temperatures.
  - Option 4: The glass cools and the juice warms until each holds the same amount of energy, at two different temperatures.
  - Why: the glass's particles have the greater average kinetic energy, so on balance collisions pass energy from the glass to the juice. The glass cools and the juice warms, and the net transfer ends when the two are at the same temperature. That temperature lies between 6 °C and 60 °C. It is 33 °C only if the glass and the juice happen to change by the same number of degrees, which depends on how much of each there is and what each is made of (topic 6.4). The juice cannot stay at 6 °C: the energy the glass loses has to go somewhere. And what the two share at the end is a temperature, not an amount of energy.
  - Miss 2: "The energy the glass loses has to go somewhere. What happens to the juice's particles as more energetic ones keep striking them?"
  - Miss 3: "Halfway is a special case. A thin glass and a lot of juice need not change by the same number of degrees."
  - Miss 4: "What two bodies share at thermal equilibrium is the thing a thermometer reads. Is that their total energy?"
  - Note for the writer: 33 °C is the midpoint of 6 °C and 60 °C. "Only" in the Why is literal: the final temperature is the midpoint exactly when the two temperature changes are equal in size.
- **Trap:** **Saying a body "has heat"** (heat is energy passing between bodies; a body has energy and a temperature). **Saying cold flows into the warm body** (energy passes from warm to cool; nothing passes the other way on balance). **Saying the collisions stop at thermal equilibrium** (they go on; energy passes both ways in equal amounts). **Saying the two bodies end with equal energy** (they end with equal temperatures; the bigger body usually holds more energy). **Letting the body with more energy be the giver** (temperature decides the direction, not the total). **Assuming the final temperature is halfway** (it lies between the two, and topic 6.4 finds where). **Reading equal temperature as equal speed** (the average kinetic energies match; lighter particles are still faster).
  - Note for the writer: seven items is one more than usual; if the block runs long, fold the fifth into the fourth. Keep "usually" in the fourth.
- **Key points:** the particles of a warmer body have a greater average kinetic energy than the particles of a cooler body, whatever the bodies are made of; when two bodies are in thermal contact, collisions between their particles pass energy, on balance, from the warmer body to the cooler one, and this transfer of energy is called heat; no particles and no "cold" need to cross between the bodies, only energy; at thermal equilibrium the two bodies have the same temperature, and their particles have the same average kinetic energy; at thermal equilibrium the collisions continue and energy passes both ways in equal amounts, so there is no net transfer; equal temperatures do not mean equal energies, and the final temperature need not be halfway between the starting ones.

**Check script:** `scratchpad/unit6/checks/6-3.py`. It checks the figure's particle counts and streak lengths (totals, averages, the conserved total, equal averages and unequal totals at the end, and that every streak fits between its particle and the next), the midpoint 33 °C of Check 5, that each stated direction of transfer runs from the higher temperature to the lower, the molar-mass comparison behind Check 3's fourth option (iron against water), the summary's length, every message's length and characters, every figure label's width, the answer positions and that no correct option is the longest.

**Values**

| Value | Used in | Source and certainty |
|---|---|---|
| Safe temperature for cooked poultry, 74 °C | Check 3 | 165 °F, the USDA's figure; 73.9 °C rounded |
| Skin temperature of a palm, about 33 °C | Checks 2 and 4 | Typical skin temperature, 32 to 35 °C (verify) |
| Refrigerator 4 °C to 6 °C; dishwasher glass 60 °C; lake 18 °C; cupboard and room 20 °C | Checks and worked example | Everyday values, given in each question; nothing is calculated from them |
| Soleplate of an iron at about 150 °C | Worked example | An iron's wool setting, roughly 150 °C (verify) |
| Atomic mass of iron 55.85; molar mass of water 18.02 g/mol | Check 3's Why ("much heavier") | AP periodic table (`src/data/elements.ts`); not printed as numbers |

**Reactions, substances and scenarios used:** no reaction, no equation and no calculation appears in the lesson. Scenarios: a probe thermometer pushed into a roast chicken (opening, thermal-equilibrium section, Check 3); a glass bottle of olive oil in a cupboard at 20 °C (Check 1); an aluminum can of soda at 4 °C in a 33 °C palm (Check 2); a stone floor under bare feet (one sentence of the collisions section); an unplugged clothes iron with its steel soleplate at 150 °C cooling in the air of a room at 20 °C (worked example, and one sentence of the thermal-equilibrium section); a ladle of stew and the pot it came from (last section); a swimmer at 33 °C in a lake at 18 °C (Check 4); a glass tumbler at 60 °C from a dishwasher filled with orange juice at 6 °C (Check 5). The figure is the one the design lists for this lesson, drawn with a small body of 6 particles and a large body of 10.

**Check script:** `scratchpad/unit6/checks/6-3.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.3 Heat Transfer and Thermal Equilibrium`).

---

## Group C: measuring heat (pull request C)

Branch: `topic/unit-6-calorimetry-and-phase-changes`, from `topic/unit-6-energy-and-heat`. The pull request title is "feat(lessons): Unit 6 lessons 6.4 and 6.5, the calorimetry explorer and the heating curve explorer".

Tasks 4 and 5 build the two explorers (one builder each, on Opus, at the same time; each writes its new CSS rules to `scratchpad/unit6/css/` and the controller merges them into `src/styles/diagram.css` and registers both blocks in `src/pages/[unit]/[topic].astro`). Then two writers, then the controller's steps, with a code review of the explorers on Sonnet.

### Task 4: The calorimetry explorer

**Files:** `src/lib/calorimetry.ts`, `tests/unit/calorimetry.test.ts`, `src/components/diagrams/Calorimetry.svelte`, `src/components/lesson/Calorimetry.astro`, `tests/e2e/diagram-calorimetry.spec.ts`, rules in `src/styles/diagram.css`, an entry in `blocks`.

What it shows is the design's section 6.1. Its data (three metals with their specific heat capacities, the slider ranges, the water's fixed starting temperature, and worked states that become unit tests) is the section "Diagram data" of lesson 6.4's brief below. It is built and tested as Unit 4's explorers were (that plan's Tasks 5 and 6): the module first, test-first, with every number and sentence the diagram shows; the component computes nothing; the browser tests cover the keyboard, every control, the numbers in the page against the module, label collisions, text size at 320 px, layout, print and JavaScript off.

### Task 5: The heating curve explorer

**Files:** `src/lib/heating-curve.ts`, `tests/unit/heating-curve.test.ts`, `src/components/diagrams/HeatingCurve.svelte`, `src/components/lesson/HeatingCurve.astro`, `tests/e2e/diagram-heating-curve.spec.ts`, rules in `src/styles/diagram.css`, an entry in `blocks`.

As Task 4, with the data in the section "Diagram data" of lesson 6.5's brief below. Its caption says that solid ethanol's heat capacity is approximate.

> **How these briefs were checked** (with lesson 6.6's, below). A fact-check found no wrong number, value, sign or equation, reproduced every state of both explorers, and changed three messages that gave the answer, added three slips for wrong methods that had none, and made magnesium oxide's value agree across the unit. The originality check found lesson 6.6's first example (burning magnesium) to be a stock textbook exercise (now lithium burning to lithium oxide), its calorimeter Check too close to lesson 6.9's worked example (now zinc oxide in acid), lesson 6.4's salts the same as lesson 6.1's (now sodium carbonate and urea), and a metal in water used four times (now the explorer and one Check). A second check of the changes found no error.

### Task 6: Lesson 6.4, Heat Capacity and Calorimetry

**Files:**
- Create: `src/content/lessons/unit-6/6-4-heat-capacity-and-calorimetry.mdx`
- Create: `public/figures/6-4-equal-energy-unequal-rise.svg`, `public/figures/6-4-coffee-cup-calorimeter.svg`
- Places the interactive block `<Calorimetry />` (built in its own task from "Diagram data" below; the lesson only places it, and no Check depends on it).

**Brief**

- **Front matter:** `topic: "6.4"`, `minutes: 17`, summary: "How to find the heat a substance gains or loses from its mass, specific heat capacity and temperature change, and how a coffee-cup calorimeter measures an energy transfer." (No colon in the summary.)
- **Framework (6.4, seven statements):** (1) a warmer body heating a cooler one is a main way energy moves between two systems; the heat transferred is found with q = mcΔT; calorimetry experiments measure it. (2) The first law of thermodynamics: energy is conserved in chemical and physical processes. (3) The same energy does not give the same temperature change in equal masses of substances with different specific heat capacities. (4) Heating a system raises its energy and cooling lowers it. (5) Both the specific heat capacity and the molar heat capacity are used in calculations. (6) Chemical systems change their energy in three main ways: heating or cooling, phase changes, chemical reactions. (7) In a calorimetry experiment on dissolving, a mixture that warms shows the dissolving released energy, and one that cools shows it absorbed energy. The objective is to calculate q from the amount of substance, its heat capacity and its temperature change. **What this lesson does not do:** system, surroundings and the words exothermic and endothermic are topic 6.1's (use them, do not teach them again); the particle picture of energy passing in collisions and the meaning of thermal equilibrium are topic 6.3's (name the topic, one sentence); the energy of a phase change is topic 6.5's; turning a calorimeter's q into ΔH per mole is topic 6.6's (this lesson stops at q in joules and the direction). No work, no ΔE = q + w. **Equation sheet:** q = mcΔT is on it. The value 4.18 J/(g·°C) for water is not: every question here gives it. q lost = −q gained is not on the sheet either.
- **Opening:** pour 200 g of water into one small pan and 200 g of olive oil into another just like it, and set them on two burners turned to the same setting. A minute later the oil has climbed about twice as far above room temperature as the water. Both pans took in the same energy. This lesson is about why the same energy does such different things to different substances, and how chemists turn a thermometer reading into an amount of energy. Note for the writer: olive oil's specific heat capacity is about 2.0 J/(g·°C) against water's 4.18, which is where "about twice" comes from. Give no number for the oil in the opening. Do not say "holds heat" or "contains heat" anywhere in the lesson: a substance takes in or gives out energy, and "heat" names energy on the move.
- **Section "How much energy for one degree":**
  - Warming something takes energy, and how much depends on three things: how much of it there is, how far its temperature must rise, and what it is made of. The last of these has a name. The **specific heat capacity**, $c$, of a substance is the energy needed to raise the temperature of 1 gram of it by 1 °C. Its unit is J/(g·°C).
  - The table (two columns), with one sentence before it saying these are the values this lesson uses:

    | Substance | $c$ in J/(g·°C) |
    |---|---|
    | Water, liquid | 4.18 |
    | Olive oil | about 2.0 |
    | Sodium chloride | 0.864 |
    | Titanium | 0.523 |
    | Tin | 0.228 |
    | Tungsten | 0.132 |

    Water's value is unusually large: a gram of water takes more than thirty times the energy a gram of tungsten takes for the same one-degree rise (4.18 ÷ 0.132 = 31.7). Do not explain water's value by hydrogen bonding and do not mention climate or coolants.
  - The three things multiply. Display: $q = mc\Delta T$, with $q$ the heat in joules, $m$ the mass in grams, $c$ the specific heat capacity and $\Delta T$ the change in temperature. This equation is on the exam's equation sheet. The value of $c$ for water is not: a question gives it.
  - $\Delta T$ is always the final temperature minus the starting temperature. Display: $\Delta T = T_\text{final} - T_\text{initial}$. So a substance that warms has a positive $\Delta T$ and a positive $q$: it gained energy. A substance that cools has a negative $\Delta T$ and a negative $q$: it lost energy. The $q$ you calculate belongs to the substance whose $m$, $c$ and $\Delta T$ you put in. (This is topic 6.1's rule for signs, seen from the side of whatever you chose as the system.)
  - One sentence: a change of 1 °C is the same size as a change of 1 K, so $\Delta T$ is the same number in either unit, and this unit's lessons leave temperatures in °C.
  - One sentence, as a hedge to keep: $c$ changes a little with temperature, and these problems treat it as constant over the range.
  - `<KeyIdea>`: $q = mc\Delta T$ gives the energy a substance gains or loses when its temperature changes and its phase does not. $\Delta T$ is final minus initial, so the sign of $q$ comes out by itself: positive for energy gained, negative for energy lost.
- **Worked example "Heating a salt block":** some cooks sear food on a thick slab of pink rock salt that has been heated in an oven. Treat the slab as pure sodium chloride, $c = 0.864$ J/(g·°C). How much energy does a 2.50 kg slab take in as it warms from 22 °C to 205 °C?
  1. **List what is known, in the units of $c$.** The mass must be in grams: 2.50 kg = 2,500 g. $c = 0.864$ J/(g·°C).
  2. **Find $\Delta T$, final minus initial.** 205 °C − 22 °C = 183 °C.
  3. **Substitute.** $q = (2{,}500)(0.864)(183) = 395{,}280$ J. (Numbers only in the display; say the units in words beside it.)
  4. **Report it sensibly.** 395,280 J is 395 kJ to three figures. It is positive, as it should be: the slab gained energy.

  Note for the writer: culinary salt blocks are real and are heated slowly to about 200 °C. Pink rock salt is nearly all sodium chloride; the lesson says "treat the slab as pure sodium chloride" and nothing about its other minerals.
- **Check 1**, `<Check numeric="22.6" unit="kJ">`: "A 245 g titanium machine part comes out of a drying oven at 200.0 °C and cools to 24.0 °C on a workbench. The specific heat capacity of titanium is 0.523 J/(g·°C). How much energy, in kJ, does the part release as it cools?" Why: ΔT = 24.0 − 200.0 = −176.0 °C, so q = (245)(0.523)(−176.0) = −22,552 J. The minus sign says the titanium lost energy. The question asks how much it released, so the answer is the size: 22,552 J, which is 22.6 kJ. Slips:
  - `22550` (left in joules): "That is the energy in joules. The question asks for kilojoules."
  - `-22.6` (the signed q typed where a size was asked for): "The question asks how much energy is released, which is a size. Type it without the minus sign."
  - `25.6` (200.0 used as ΔT): "Did you use 200.0 °C as the temperature change? ΔT is the final temperature minus the starting temperature."
  - `3.08` (24.0 used as ΔT): "Did you use 24.0 °C as the temperature change? ΔT is the final temperature minus the starting temperature."
  - `180` (water's 4.18 used for titanium): "That is what the specific heat capacity of water gives. The part is titanium, so use the value for titanium."

  Note for the writer: no casting, no mold and no molten metal here (lesson 6.2 has a tin-casting scene). The part is solid throughout.
- **Section "The same energy, a different rise":**
  - Turn the equation around: $\Delta T = \dfrac{q}{mc}$. For a fixed energy and a fixed mass, a larger $c$ means a smaller temperature change. Equal energy does not mean equal warming.
  - Place the figure `6-4-equal-energy-unequal-rise.svg` here, with one sentence: 900 J goes into 40.0 g of water and into 40.0 g of titanium, both at 20.0 °C. The water rises 5.4 °C, to 25.4 °C. The titanium rises 43.0 °C, to 63.0 °C: eight times as far, because its specific heat capacity is one-eighth of water's.
  - **Counting in moles.** Chemists often count in moles, not grams. The **molar heat capacity** of a substance is the energy needed to raise the temperature of 1 mole of it by 1 °C, in J/(mol·°C). It is the specific heat capacity times the molar mass, and it is used the same way, with moles in place of grams. Display: $q = nC\Delta T$, where $n$ is the amount in moles and $C$ the molar heat capacity. One line of example in the text, not a worked example: liquid ethanol has $C = 112$ J/(mol·°C), so warming 0.250 mol of it by 12.0 °C takes (0.250)(112)(12.0) = 336 J. Both forms appear on the exam; look at the unit of the heat capacity you are given to see whether it wants grams or moles.
  - A short table (three columns), then two sentences:

    | Substance | $c$ in J/(g·°C) | $C$ in J/(mol·°C) |
    |---|---|---|
    | Water | 4.18 | 75.3 |
    | Titanium | 0.523 | 25.0 |
    | Tin | 0.228 | 27.1 |
    | Tungsten | 0.132 | 24.3 |

    Per gram, titanium needs about four times the energy tungsten needs. Per mole the three metals are nearly alike. A gram of tungsten simply holds about a quarter as many atoms as a gram of titanium, because each tungsten atom is about four times as heavy. Note for the writer: stop there. Do not name a law for this and do not explain water's larger molar value.
- **Check 2**, `<Check answer={3}>`: "Three metal samples, each 30.0 g and each at 20 °C, absorb 500 J apiece. The specific heat capacities are 0.523 J/(g·°C) for titanium, 0.228 J/(g·°C) for tin and 0.132 J/(g·°C) for tungsten. Which sample ends at the highest temperature, and why?" Options:
  1. Titanium, because it has the largest specific heat capacity of the three
  2. None: all three end at the same temperature, because each absorbed 500 J
  3. Tungsten, because a gram of it needs the least energy for each degree
  4. Tin, because its specific heat capacity lies between the other two

  Why: with the same energy and the same mass, ΔT = q/(mc) is largest where c is smallest. Tungsten rises to 146.3 °C, tin to 93.1 °C and titanium to 51.9 °C. A large specific heat capacity means a small rise, which is the opposite of the first option. Equal energy gives equal temperature changes only when m × c is equal too, and a middle value of c gives a middle rise. Misses:
  - 1: "A large specific heat capacity means each gram takes more energy for each degree. What does that do to the temperature rise?"
  - 2: "Equal energy does not mean an equal temperature change. Rearrange q = mcΔT for ΔT and see what else is in it."
  - 4: "A middle value of c gives a middle temperature rise. Rearrange q = mcΔT for ΔT and compare all three."
- **Section "Energy lost, energy gained":**
  - Put a hot object in contact with a cold one and energy passes from the hot one to the cold one until both are at one temperature: thermal equilibrium (topic 6.3 explains this with collisions between particles). The **first law of thermodynamics** says that energy is conserved: it is never made or destroyed in a chemical or physical process, only moved or changed in form. So if no energy escapes to anything else, every joule the hot object loses is a joule the cold object gains.
  - Display: $q_\text{lost} = -q_\text{gained}$. Say in words: the two heats are equal in size and opposite in sign, so they add to zero. This line is not on the equation sheet. It is the first law, written for two objects.
  - What is equal is the energy. The temperature changes are usually not equal: each object's change is its own $q/(mc)$, so the object with the larger $m \times c$ changes less.
  - `<KeyIdea>`: when a hot object and a cold one exchange energy only with each other, the energy one loses equals the energy the other gains. The energies match. The temperature changes do not have to.
- **Check 3**, `<Check answer={2}>`, placed before the explorer: "A student pours 75 g of tin shot at 90 °C into 75 g of water at 30 °C in an insulated cup. The specific heat capacity of tin is 0.228 J/(g·°C) and that of water is 4.18 J/(g·°C). Where does the final temperature lie?" Options:
  1. Exactly 60 °C, halfway between the two, because the two masses are equal
  2. Between 30 °C and 60 °C, because water needs more energy for each degree
  3. Between 60 °C and 90 °C, because the tin started at the higher temperature
  4. It cannot be predicted without knowing how much energy the tin holds at 90 °C

  Why: the tin loses exactly the energy the water gains. Gram for gram, water needs about 18 times as much energy for each degree as tin does, so with equal masses the water's temperature changes about one-eighteenth as much as the tin's. The final temperature is far nearer the water's start: 33.1 °C. Halfway would need equal values of m × c. Starting hotter does not give the tin more say. And nothing about the energy "in" the tin is needed: q = mcΔT gives the energy that moves. Misses:
  - 1: "Halfway would mean equal temperature changes. The energies are equal, not the changes. Compare mass × c for the two."
  - 3: "Starting hotter does not pull the result toward the tin. For the same energy, which of the two changes temperature less?"
  - 4: "Only the energy that moves matters, and q = mcΔT gives it for each body. Set the energy lost equal in size to the energy gained."
- **The interactive diagram:** place `<Calorimetry />` here, after Check 3, under a sentence that says what it is: a hot piece of metal goes into cooler water in an insulated cup, and you choose the metal, its mass, its starting temperature and the mass of water. The text then asks the student to do three things, as a numbered list, predicting before each move:
  1. **Read the starting state.** 100 g of titanium at 80 °C goes into 100 g of water at 20.0 °C. Both end at 26.7 °C. The two bars are the same height, 2,789 J: what the titanium lost and what the water gained. The titanium fell 53.3 °C and the water rose 6.7 °C.
  2. **Change only the metal.** Before you choose tungsten, predict: will the final temperature be higher or lower? (It is lower, 21.8 °C, and the bars shrink to 768 J: the same mass of tungsten, cooling over nearly the same range, has less energy to give because its specific heat capacity is smaller. Tin lands between, at 23.1 °C and 1,297 J.)
  3. **Add water.** Go back to titanium and slide the water up to 200 g. Predict both things: the final temperature and the height of the bars. (The final temperature falls to 23.5 °C, yet the bars grow to 2,953 J: the titanium ends cooler, so it gave up more energy, and twice the water still warmed less.)

  The numbers in parentheses are for the writer to phrase as "you should see". They are the module's values (see "Diagram data").
- **Section "The coffee-cup calorimeter":**
  - **Calorimetry** is the measurement of energy transferred as heat, made by watching a temperature change. The container it is done in is a **calorimeter**. The simplest is two foam cups, one inside the other, with a lid, a thermometer and a stirrer. Place the figure `6-4-coffee-cup-calorimeter.svg` here.
  - What the cup is for: foam is a poor conductor, so very little energy passes between the cup's contents and the room during the minute or two a measurement takes. The contents exchange energy with one another only, which is the condition for $q_\text{lost} = -q_\text{gained}$. The cup is open to the air through the lid's holes, so whatever happens in it happens at the pressure of the room (topic 6.6 needs that).
  - The two assumptions, stated as assumptions: no energy escapes from the cup, and the cup, lid and thermometer themselves take in so little that it is ignored, unless a question gives a number for it.
  - The method for a solid in water, in one sentence each: measure the water's temperature change and compute $q$ for the water; the solid's $q$ is the same size with the opposite sign; from the solid's $q$, mass and its own temperature change, find whatever is asked.
- **Worked example "Cold ceramic in warm water":** a lab technician checks the specific heat capacity of alumina, Al₂O₃, the hard white ceramic that some laboratory crucibles are made of. She keeps 85.0 g of alumina beads in a freezer at −18.00 °C, then tips them at once into 150.0 g of water at 24.00 °C in a coffee-cup calorimeter. The water is stirred, and the temperature settles at 20.01 °C. The specific heat capacity of water is 4.18 J/(g·°C). What specific heat capacity does the experiment give for alumina?
  1. **Start with the water, because everything about it is known.** ΔT = 20.01 − 24.00 = −3.99 °C. q for the water = (150.0)(4.18)(−3.99) = −2,502 J (set as display math). The water lost 2,502 J.
  2. **Use conservation of energy.** The beads gained what the water lost: $q_\text{beads} = +2{,}502$ J.
  3. **Find the beads' own temperature change.** They end at the same 20.01 °C: ΔT = 20.01 − (−18.00) = +38.01 °C.
  4. **Solve $q = mc\Delta T$ for $c$.** Display, split over two lines: $c = \dfrac{q}{m\,\Delta T} = \dfrac{2{,}502}{(85.0)(38.01)} = 0.774$ J/(g·°C).
  5. **Check it.** A specific heat capacity must be positive, and this one is: the beads' $q$ and their ΔT are both positive. The handbook value, measured at 25 °C, is 0.775 J/(g·°C). Notice the two temperature changes: about 4 °C for the water and about 38 °C for the beads, for the same 2,502 J.

  Note for the writer: here the solid is the cold body and the water the warm one, and the solid is a ceramic, on purpose: the explorer above and Check 3 are the lesson's only metal-in-water items. Do not turn this into a metal block dropped into water. Alumina beads are a real laboratory material (grinding media). The thermometer reads to 0.01 °C (a digital probe), which is what gives the water's ΔT three figures.
- **Check 4**, `<Check numeric="163" unit="g">`: "A baker wants water at 38.0 °C for a yeast dough. She has 250.0 g of hot water at 55.0 °C in an insulated jug and cools it by pouring in cold water at 12.0 °C. The specific heat capacity of water is 4.18 J/(g·°C), and the two portions of water exchange energy only with each other. What mass of cold water, in g, brings the mixture to 38.0 °C?" Why: the hot water's ΔT is 38.0 − 55.0 = −17.0 °C, so its q is (250.0)(4.18)(−17.0) = −17,765 J. The cold water gains that much: +17,765 J. Its own ΔT is 38.0 − 12.0 = +26.0 °C. Then m = q/(cΔT) = 17,765/((4.18)(26.0)) = 163 g. Less cold water than hot is needed, because each gram of the cold water changes by more degrees. Put the lines of arithmetic in display math, numbers only. Slips:
  - `382` (the two temperature changes exchanged): "Check which temperature change goes with which water: the hot water falls 17.0 °C and the cold water rises 26.0 °C."
  - `112` (38.0 used as the cold water's ΔT): "Did you use 38.0 °C as the temperature change of the cold water? ΔT is the final temperature minus the starting temperature."
  - `354` (12.0 used as the cold water's ΔT): "Did you use 12.0 °C as the temperature change of the cold water? ΔT is the final temperature minus the starting temperature."
  - `-163` (a sign carried into the mass): "A mass cannot be negative. The q of the hot water is negative and the q of the cold water is positive, so the signs cancel."
  - `250` (the hot water's mass given back): "That is the mass of the hot water. The two masses would be equal only if the two temperature changes were equal in size."

  Note for the writer: two portions of the same liquid, so no second specific heat capacity is needed and the 4.18 cancels; say so in the Why only after the arithmetic. No metal and no cup of unknown material.
- **Section "When something dissolves":**
  - A coffee-cup calorimeter also measures the energy change when a solid dissolves. Now there is no second object: the solid ends up spread through the water, and the thing whose temperature changes is the whole solution. If the solution warms, it gained energy, so the dissolving released energy: it is exothermic (topic 6.1). If the solution cools, it lost energy, so the dissolving absorbed energy: it is endothermic.
  - The size comes from the same equation, used for the solution: $q_\text{solution} = mc\Delta T$, where $m$ is the mass of everything in the cup that changed temperature, the water plus the dissolved solid. For a dilute solution, $c$ is taken as water's, 4.18 J/(g·°C), unless the question gives another value. Then $q_\text{dissolving} = -q_\text{solution}$.
  - One sentence: topic 6.6 takes the next step, from this energy to an energy per mole.
- **Check 5**, `<Check answer={1}>`: "Dyers add soda ash, which is anhydrous sodium carbonate, to a dye bath. A student dissolves 12.0 g of soda ash in 100.0 g of water in a coffee-cup calorimeter. The temperature of the mixture rises from 19.5 °C to 26.0 °C. Take the specific heat capacity of the solution as 4.18 J/(g·°C). Which statement do the data support?" Options:
  1. The dissolving released about 3.0 kJ, which the 112.0 g of solution gained
  2. The dissolving absorbed about 3.0 kJ, which is why the temperature went up
  3. The dissolving released about 2.7 kJ, the energy gained by the 100.0 g of water
  4. The dissolving released about 0.33 kJ, the energy gained by the 12.0 g of solid

  Why: everything in the cup warmed by 6.5 °C, and everything in the cup is 100.0 g of water plus 12.0 g of dissolved solid. q for the solution is (112.0)(4.18)(6.5) = 3,043 J, about 3.0 kJ, and it is positive: the solution gained energy. That energy came from the dissolving, which therefore released it. A process that absorbed energy would have cooled the mixture. Using the water alone or the solid alone leaves out part of what warmed. Misses:
  - 2: "The mixture warmed. If the dissolving had absorbed energy, where would that energy have come from?"
  - 3: "The dissolved solid is part of the liquid that warmed. What is the mass of everything that rose by 6.5 °C?"
  - 4: "The thermometer sits in the whole solution, not in 12.0 g of solid. What is the mass of everything that rose by 6.5 °C?"

  Note for the writer: anhydrous sodium carbonate warms water as it dissolves. The hydrated crystals sold as washing soda do the opposite, so keep the words "soda ash" and "anhydrous". Give no equation and no enthalpy of solution.
- **Paragraph "When the cup is counted too"** (inside the same section, after Check 5): a real cup, lid and thermometer take in or give up a little energy as well. Some questions give a number for it: the **calorimeter constant**, which is the heat capacity of the calorimeter itself: the energy needed to change its temperature by 1 °C, in J/°C. The calorimeter changes by the same ΔT as its contents, so its share is $q_\text{calorimeter} = C_\text{cal}\,\Delta T$, and it is added to the solution's $q$ before the sign is reversed. If a question gives no calorimeter constant, leave it out.
- **Check 6**, `<Check numeric="919" unit="J">`: "A coffee-cup calorimeter with a calorimeter constant of 12.5 J/°C holds 80.0 g of water at 22.40 °C. When 3.60 g of urea, a nitrogen fertilizer, dissolves in it, the temperature falls to 19.86 °C. Take the specific heat capacity of the solution as 4.18 J/(g·°C). How much energy, in J, did the dissolving absorb?" Why: ΔT = 19.86 − 22.40 = −2.54 °C. The solution is 80.0 + 3.60 = 83.6 g, so q for the solution is (83.6)(4.18)(−2.54) = −887.6 J. The calorimeter cooled by the same amount: (12.5)(−2.54) = −31.8 J. Together they lost 919 J (919.3 before rounding), and the dissolving absorbed what they lost: 919 J. Slips:
  - `888` (the calorimeter left out): "That leaves out the calorimeter. It cooled by the same 2.54 °C, and its heat capacity is 12.5 J/°C."
  - `881` (80.0 g used for the solution): "The mass of the solution is the water plus the dissolved urea, not the water alone."
  - `849` (80.0 g and no calorimeter): "Two things are missing: the 3.60 g of solid in the mass of the solution, and the energy the calorimeter itself gave up."
  - `856` (the calorimeter's share subtracted): "Did you subtract the calorimeter's share? The calorimeter cooled too, so its energy is added to the solution's."
  - `-919` (a minus sign typed): "The question asks how much energy the dissolving absorbed, which is a size. Type it without the minus sign."
  - `0.919` (given in kJ): "That is in kilojoules. The question asks for joules."

  Note for the writer: urea cools water as it dissolves; that is real. Call it "a nitrogen fertilizer" and nothing more: no cold pack. The first slip's message calls 12.5 J/°C the calorimeter's "heat capacity", which is how the paragraph above defines the calorimeter constant. Keep those words in the definition.
- **Closing paragraph of the section** (two sentences, then the "Beyond the exam" sentence): a chemical system changes its energy in three main ways: by being heated or cooled, by changing phase, and by reacting. This lesson measured the first; topic 6.5 takes the second and topic 6.6 the third, and the same cup measures all three. "**Beyond the exam:** fuels are burned in a sealed steel vessel called a bomb calorimeter, which works at constant volume. The exam's calorimeter is the open cup."
- **Trap:** **Pairing one substance's mass with another's $c$ or $\Delta T$** (each $q = mc\Delta T$ is about one substance: its mass, its specific heat capacity, its own temperature change). **Taking $\Delta T$ as the bigger number minus the smaller** (it is final minus initial, and its sign carries the direction of the energy). **Expecting equal temperature changes** (the energies are equal in size; each temperature change depends on that object's $m \times c$). **Leaving the dissolved solid out of the solution's mass** (everything that changed temperature counts). **Reading a rising thermometer as "absorbed"** (if the solution warmed, the dissolving released the energy the solution gained). **Giving joules where kilojoules were asked for**, or the reverse.
- **Key points:** the specific heat capacity $c$ is the energy that raises the temperature of 1 g of a substance by 1 °C, and the molar heat capacity is the same for 1 mol; $q = mc\Delta T$ (or $q = nC\Delta T$) gives the heat a substance gains or loses when only its temperature changes, with $\Delta T$ equal to final minus initial, so $q$ is positive for energy gained and negative for energy lost; the same energy gives a smaller temperature change to the substance with the larger specific heat capacity, for equal masses; energy is conserved (the first law of thermodynamics), so when two objects exchange energy only with each other, $q_\text{lost} = -q_\text{gained}$; a coffee-cup calorimeter keeps the exchange inside the cup, at constant pressure, and the water's or the solution's $q$ gives the size of the energy transferred; when a solid dissolves, a solution that warms shows the dissolving released energy and a solution that cools shows it absorbed energy, and the mass in $q = mc\Delta T$ is the mass of the whole solution.

**Figures**

- **`6-4-equal-energy-unequal-rise.svg`** (viewBox 0 0 480 330, font-size 18). Two panels side by side, each 220 wide, with a 40-unit gap.
  - Left panel: at the top, the title "40.0 g of water". Below it a beaker (outline in ink, liquid filled with the light accent, no hatching) about 100 wide and 90 tall, at the left of the panel. An arrow in the accent color points into the beaker from the left edge, labeled "900 J" above it. To the right of the beaker, a thermometer: a vertical tube 16 wide and 200 tall with a scale running from 20 °C at the bottom to 80 °C at the top (tick marks every 10 °C, the numbers "20" and "80" only). The filled column runs from the bottom of the scale (20 °C, where both samples start) up to 25.4 °C. Under the panel: "+5.4 °C".
  - Right panel: the title "40.0 g of titanium". A solid block (rectangle about 100 × 60, filled with diagonal hatching in the secondary color, ink outline) in the place of the beaker, the same arrow labeled "900 J", and the same thermometer with its column filled to 63.0 °C. Under the panel: "+43.0 °C".
  - The two columns' heights are computed from the same scale: 200 units for 60 °C, so 18 units for the water's 5.4 °C and 143 units for the titanium's 43.0 °C. The water and the titanium differ in shape (beaker against block) and in fill (plain against hatched).
  - Text in the figure, ten pieces: "40.0 g of water", "40.0 g of titanium", "900 J" twice, "+5.4 °C", "+43.0 °C", and the scale numbers "20" and "80" on each thermometer.
  - Alt: "Two panels. On the left, an arrow labeled 900 J points into a beaker labeled 40.0 g of water, and a thermometer beside it has risen a little, by 5.4 °C. On the right, an arrow labeled 900 J points into a hatched block labeled 40.0 g of titanium, and its thermometer has risen most of the way up the same scale, by 43.0 °C."
  - Caption: "The same 900 J goes into equal masses of water and titanium, both starting at 20.0 °C. The titanium warms eight times as far."
- **`6-4-coffee-cup-calorimeter.svg`** (viewBox 0 0 480 380, font-size 18). A cross-section, drawn in the left 260 units, with labels in a column on the right joined to their parts by thin leader lines in the secondary color.
  - Two nested cups: two trapezoid outlines (wider at the top), the outer about 8 units outside the inner, in ink, the gap between them filled with the glass color `#E6E1D8`. A flat lid across the top, a rectangle filled with the same color, with two small gaps in it.
  - Liquid: the inner cup filled to about two-thirds with the light accent color.
  - A thermometer: a thin vertical tube passing through one gap in the lid, its bulb in the liquid, its top well above the lid.
  - A stirrer: a thin ink line passing through the other gap, ending in a small horizontal loop in the liquid.
  - A sample: a small hatched rectangle resting on the bottom of the inner cup.
  - Labels, top to bottom, six: "Thermometer", "Stirrer", "Lid", "Two foam cups", "Water", "Sample". No leader line crosses another or passes behind a part it does not point to.
  - Alt: "A cross-section of a coffee-cup calorimeter with six labeled parts: a thermometer and a stirrer pass through a lid into water held in two foam cups, one inside the other, and a small solid sample rests on the bottom."
  - Caption: "A coffee-cup calorimeter. The foam keeps nearly all the energy inside the cup for the short time a measurement takes."

**Diagram data** (for the builder of `src/lib/calorimetry.ts` and `<Calorimetry />`; the design's section 6.1 fixes what the diagram shows)

- **Metals** (the choice control, in this order), with the specific heat capacity the module uses:

  | Metal | $c$ in J/(g·°C) | Source |
  |---|---|---|
  | Titanium | 0.523 | CRC Handbook: 25.06 J/(mol·K) ÷ 47.87 g/mol |
  | Tin | 0.228 | CRC Handbook, white tin: 27.11 J/(mol·K) ÷ 118.71 g/mol |
  | Tungsten | 0.132 | CRC Handbook: 24.27 J/(mol·K) ÷ 183.84 g/mol |

  All three are solids that do not react with water, none melts below 231.9 °C, and none is iron, copper, aluminum or lead. The three values stand roughly as 4 : 1.7 : 1.
- **Water:** 4.18 J/(g·°C); starting temperature fixed at 20.0 °C.
- **Sliders:**

  | Control | Range | Step | Starts at |
  |---|---|---|---|
  | Mass of metal | 50 g to 200 g | 10 g | 100 g |
  | Starting temperature of the metal | 50 °C to 100 °C | 5 °C | 80 °C |
  | Mass of water | 50 g to 200 g | 10 g | 100 g |

  The metal starts as titanium. That is 3 × 16 × 11 × 16 = 8,448 states.
- **The model.** With $C_m$ = (mass of metal)(its $c$) and $C_w$ = (mass of water)(4.18), both in J/°C:
  - final temperature $T_f = \dfrac{C_m T_m + C_w(20.0)}{C_m + C_w}$;
  - energy moved $q = \dfrac{C_m C_w (T_m - 20.0)}{C_m + C_w}$, which equals both $C_w(T_f - 20.0)$ and $C_m(T_m - T_f)$ exactly.
  - The module works in whole units so that the arithmetic is exact (specific heat capacities in mJ/(g·°C): 523, 228, 132 and 4,180; temperatures in tenths of a degree) and rounds only for display: the final temperature to 0.1 °C and the energy to the nearest joule, each **rounded half up**. The energy is computed from the exact expression, never from the rounded final temperature, so the two bars are always the same number. The two temperature changes in the readout are computed from the displayed final temperature (80.0 − 26.7 = 53.3 and 26.7 − 20.0 = 6.7), so that the drawing's thermometers and the readout agree. 62 of the 8,448 states are exact rounding ties in the temperature, the energy or both; two are in the table below.
- **Limits, checked over all 8,448 states:** the hottest final temperature is 46.7 °C (200 g of titanium at 100 °C into 50 g of water) and the coolest is 20.2 °C (50 g of tungsten at 50 °C into 200 g of water), so the water never comes near 100 °C. The largest heat capacity the metal can have is 104.6 J/°C (200 g of titanium) and the smallest the water can have is 209 J/°C (50 g), so the final temperature is nearer the water's starting temperature in every state, and the readout's reason ("the water's larger heat capacity") is true in every state.
- **Readout sentence,** for the starting state: "Both end at 26.7 °C. The titanium lost 2,789 J and the water gained 2,789 J. The water's temperature changed less, by 6.7 °C against 53.3 °C, because its heat capacity is larger: 418 J/°C against 52.3 J/°C." (Heat capacity here is mass × specific heat capacity, shown to three figures.)
- **Worked states** for unit tests (inputs, then the exact outputs expected):

  | Metal | Metal mass (g) | Metal start (°C) | Water (g) | Final (°C) | Energy (J) |
  |---|---|---|---|---|---|
  | titanium | 100 | 80 | 100 | 26.7 | 2,789 |
  | tungsten | 100 | 80 | 100 | 21.8 | 768 |
  | tin | 100 | 80 | 100 | 23.1 | 1,297 |
  | titanium | 100 | 80 | 200 | 23.5 | 2,953 |
  | titanium | 200 | 100 | 50 | 46.7 | 5,577 |
  | tungsten | 50 | 50 | 200 | 20.2 | 196 |
  | tin | 150 | 65 | 80 | 24.2 | 1,396 |
  | tungsten | 200 | 100 | 50 | 29.0 | 1,875 |
  | titanium | 50 | 50 | 200 | 20.9 | 761 |
  | tin | 50 | 100 | 150 | 21.4 | 896 |
  | tin | 50 | 80 | 70 | 22.3 (exactly 22.25) | 658 |
  | tin | 60 | 90 | 180 | 21.3 (exactly 21.25) | 941 (exactly 940.5) |

  The first four rows are the states the lesson's text walks through.

**Values**

| Quantity | Value | Source |
|---|---|---|
| Specific heat capacity of liquid water | 4.18 J/(g·°C) | the design; given in every question |
| Specific heat capacity of olive oil | about 2.0 J/(g·°C) | engineering tables give 1.97 to 2.0 near room temperature **(verify)** |
| Specific heat capacity of sodium chloride | 0.864 J/(g·°C) | CRC Handbook: 50.5 J/(mol·K) ÷ 58.44 g/mol |
| Specific heat capacity of titanium | 0.523 J/(g·°C) | CRC Handbook |
| Specific heat capacity of tin (white) | 0.228 J/(g·°C) | CRC Handbook |
| Specific heat capacity of tungsten | 0.132 J/(g·°C) | CRC Handbook |
| Molar heat capacity of liquid ethanol | 112 J/(mol·°C) | CRC Handbook, 112.3 at 25 °C; the same value as lesson 6.5 |
| Melting point of tin | 231.9 °C | CRC Handbook (not printed in the lesson; a note only) |
| Specific heat capacity of alumina, Al₂O₃ | 0.775 J/(g·°C) | CRC Handbook: 79.0 J/(mol·K) ÷ 101.96 g/mol **(verify)** |
| Enthalpy of solution of anhydrous sodium carbonate | −26.7 kJ/mol | CRC Handbook **(verify)**; not printed; it sets Check 5's 6.5 °C rise |
| Enthalpy of solution of urea | +15.4 kJ/mol | CRC Handbook **(verify; some tables give about +15.1)**; not printed; it sets Check 6's 2.54 °C fall |
| Atomic masses | H 1.008, C 12.01, N 14.01, O 16.00, Na 22.99, Al 26.98, Ti 47.87, Sn 118.71, W 183.84 | the site's `src/data/elements.ts` |
| Molar masses (not printed; they set the size of the made-up data) | Al₂O₃ 101.96; Na₂CO₃ 105.99; urea, CH₄N₂O, 60.06 g/mol | the site's `src/data/elements.ts` |

Molar heat capacities in the lesson's second table are the specific heat capacity times the molar mass: water (4.18)(18.02) = 75.3; titanium (0.523)(47.87) = 25.0; tin (0.228)(118.71) = 27.1; tungsten (0.132)(183.84) = 24.3 J/(mol·°C).

**Check script:** `scratchpad/unit6/checks/6-4.py`. It recomputes every number above, the figure's numbers, each slip, the twelve worked states and the limits over all 8,448 states of the explorer, and checks each message and option against this file.

**Notes for the writer**

- The explorer shows a hot metal in cool water, which the teacher's own materials use many times with other metals and other numbers. Besides the explorer, a metal goes into water once only, in Check 3, with no number to compute. Keep the three metals and the 20.0 °C water, and do not add a "find the unknown metal" question or any other metal-in-water item.
- Never write "the heat in the metal" or "holds heat". Write "energy transferred", "gained", "lost", "released", "absorbed".
- A sentence in words never says "negative heat": it says "the titanium released 22.6 kJ" or "q for the titanium is −22,552 J".
- Check 3 sits before the explorer so that the student predicts first. Do not move it.
- Do not explain why water's specific heat capacity is large, and do not bring in coastal climates, coolants or cooking pots of iron, copper or aluminum.
- The "Beyond the exam" sentence is the only mention of a bomb calorimeter.

**Reactions, substances and scenarios used:** no chemical equation appears in the lesson. Scenarios: equal masses of water and olive oil in two pans on equal burners (opening); a 2.50 kg cooking slab of pink rock salt, treated as sodium chloride, heated from 22 °C to 205 °C, 395 kJ (worked example 1); a 245 g titanium machine part cooling from 200.0 °C to 24.0 °C out of a drying oven, 22.6 kJ (Check 1); 900 J into 40.0 g of water and 40.0 g of titanium (figure); 0.250 mol of ethanol warmed 12.0 °C, 336 J (one line of text); 30.0 g samples of titanium, tin and tungsten each absorbing 500 J (Check 2); 75 g of tin shot at 90 °C into 75 g of water at 30 °C, final 33.1 °C (Check 3); the explorer's titanium, tin and tungsten, 50 to 200 g at 50 to 100 °C, into 50 to 200 g of water at 20.0 °C; 85.0 g of alumina beads from a freezer at −18.00 °C into 150.0 g of water at 24.00 °C, final 20.01 °C, c = 0.774 (worked example 2); a baker cooling 250.0 g of water at 55.0 °C to 38.0 °C with 163 g of water at 12.0 °C (Check 4); 12.0 g of soda ash (anhydrous sodium carbonate) dissolving in 100.0 g of water, 19.5 °C to 26.0 °C (Check 5); 3.60 g of urea dissolving in 80.0 g of water in a calorimeter with a constant of 12.5 J/°C, 22.40 °C to 19.86 °C, 919 J (Check 6); a bomb calorimeter, named once. Figures: the two the design lists for this lesson.

**Check script:** `scratchpad/unit6/checks/6-4.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.4 Heat Capacity and Calorimetry`).

### Task 7: Lesson 6.5, Energy of Phase Changes

**Files:**
- Create: `src/content/lessons/unit-6/6-5-energy-of-phase-changes.mdx`
- Create: `public/figures/6-5-heating-curve-segments.svg`
- Places the interactive block `<HeatingCurve />` (built in its own task from "Diagram data" below; the lesson only places it. Check 6 can be worked from the lesson's two tables without it).

**Brief**

- **Front matter:** `topic: "6.5"`, `minutes: 16`, summary: "Why melting and boiling take in energy at a constant temperature, how to find that energy from moles and a molar enthalpy, and how to read a heating curve segment by segment." (No colon in the summary.)
- **Framework (6.5, two statements):** (1) energy must be transferred to a system to melt or boil a substance, so the system's energy rises from solid to liquid and from liquid to gas; a system releases energy when it freezes or condenses, so its energy falls; the temperature of a pure substance stays constant during a phase change. (2) The energy absorbed in a phase change equals the energy released in the opposite change: the molar enthalpy of condensation is the negative of the molar enthalpy of vaporization, and the same holds for freezing and fusion. The objective is to explain, and calculate, the heat absorbed or released in a phase change from the moles of substance and the molar enthalpy of the change. The framework names no heating curve, but its two statements describe one and the exam uses them, so this lesson teaches it without a "Beyond the exam" label (the design's call). **What this lesson does not do:** q = mcΔT and molar heat capacity are topic 6.4's and are used here, not taught again; average kinetic energy as temperature is topic 6.3's; which attractions hold a liquid or solid together is topic 3.1's; the formal meaning of ΔH is topic 6.6's (one sentence here says how to read it). No sublimation, no phase diagrams, no vapor pressure, no supercooling. **Equation sheet:** q = mcΔT is on it. q = nΔH for a phase change is not, and no enthalpy of fusion or vaporization is: a question gives the values.
- **Opening:** hold a lump of gallium metal in your palm. It warms until it reaches 29.8 °C, and there it stops. Your hand goes on feeding it energy, and for minutes the only thing that changes is that the lump slumps into a silvery puddle. Only when the last of the solid is gone does the puddle start to warm toward the temperature of your hand. Energy went in the whole time. This lesson is about where it went. Note for the writer: gallium melts at 29.76 °C and this is a common demonstration; keep "29.8 °C".
- **Section "Energy in, temperature unchanged":**
  - Melting and boiling both need energy from outside. In a solid the particles sit in fixed places, held there by their attractions for one another. To melt it, particles must be moved out of those places; to boil the liquid, they must be pulled away from one another altogether. Both mean working against attractions, and that takes energy.
  - While a pure substance is changing phase at a steady pressure, its temperature does not change. Topic 6.3 gave the reason this is possible: temperature measures the average kinetic energy of the particles. During a phase change the energy coming in is not going into faster motion. It goes into separating the particles, which raises their potential energy. The system's energy rises, and the thermometer does not move.
  - What is overcome, for a molecular substance, is the attraction between molecules (topic 3.1). The bonds inside each molecule are not broken: the liquid and the gas are made of the same molecules as the solid (topic 4.4 made this point with numbers).
  - One sentence on the consequence for calculations: $q = mc\Delta T$ cannot be used during a phase change. With ΔT = 0 it would say that no energy is needed, which is false.
  - The reverse changes: when a gas condenses or a liquid freezes, the particles move back together, their potential energy falls, and the system releases energy, again at a constant temperature.
- **Check 1**, `<Check answer={3}>`: "A chemist checks the purity of benzoic acid, a white molecular solid, by heating a few crystals slowly and steadily. The thermometer climbs, holds at 122 °C for a while as the crystals turn to liquid, and then climbs again. While the temperature holds at 122 °C, what is the energy from the heater doing?" Options:
  1. None of it is absorbed, because a steady temperature means no energy is going in
  2. It raises the average kinetic energy of the molecules while they stay in place
  3. It moves molecules out of their places in the crystal, against their attractions
  4. It breaks the covalent bonds inside the molecules so that the pieces can flow as a liquid

  Why: the heater has not been turned off, so the crystals are still absorbing energy. If that energy were raising the average kinetic energy of the molecules, the temperature would rise, and it does not. It is going into potential energy: molecules are being moved out of their fixed places against the attractions between them. The molecules themselves are untouched. Liquid benzoic acid is made of the same molecules as the solid, and breaking the bonds inside them would take far more energy and would make different substances. Misses:
  - 1: "The heater is still on and the crystals are still taking energy in. Ask what that energy changes, if not the temperature."
  - 2: "A higher average kinetic energy would show as a higher temperature, and the thermometer is holding steady."
  - 4: "The liquid is made of the same molecules as the crystal. Could that be so if the bonds inside the molecules had broken (topic 4.4)?"

  Note for the writer: benzoic acid melts at 122.4 °C, and taking a melting point is a standard purity test. Give no formula.
- **Section "How much energy: the molar enthalpy":**
  - The energy a phase change takes depends on what the substance is and on how much of it there is, not on how fast it is heated. So it is tabulated per mole.
  - The **molar enthalpy of fusion**, $\Delta H_\text{fus}$, is the energy absorbed when 1 mole of a solid melts at its melting point. ("Fusion" is the old word for melting.) Then, as a separate sentence, the **molar enthalpy of vaporization**, $\Delta H_\text{vap}$, is the energy absorbed when 1 mole of a liquid boils at its boiling point. Both are in kJ/mol, and both are positive, because energy goes in.
  - One sentence on the symbol: for now, read an enthalpy change, ΔH, as the heat a change absorbs (a positive value) or releases (a negative value) at constant pressure; topic 6.6 looks at it properly.
  - The table (five columns, short cells), introduced as the values this lesson uses:

    | Substance | Melts at | $\Delta H_\text{fus}$ (kJ/mol) | Boils at | $\Delta H_\text{vap}$ (kJ/mol) |
    |---|---|---|---|---|
    | Nitrogen, N₂ | −210.0 °C | 0.71 | −195.8 °C | 5.57 |
    | Oxygen, O₂ | −218.8 °C | 0.44 | −183.0 °C | 6.82 |
    | Ethanol, C₂H₅OH | −114.1 °C | 4.93 | 78.3 °C | 38.6 |
    | Iodine, I₂ | 113.7 °C | 15.5 | 184.4 °C | 41.6 |

  - Two things to read from it. First, the numbers follow the strength of the attractions between the particles: nitrogen and oxygen, with weak attractions between small molecules, need little; ethanol, with hydrogen bonds, and iodine, with its many electrons, need much more (topic 3.1). Second, in every row vaporizing takes more than melting: 2.7 times as much for iodine, 7.8 times for nitrogen and for ethanol, 15.5 times for oxygen. Melting only frees the particles to move past one another, and they stay in contact, so most of the attractions are still there in the liquid. Boiling pulls the particles apart, and nearly all the attractions that were left must be overcome. Note for the writer: "in every row" is about this table. Do not write "always".
  - The calculation. Display: $q = n\,\Delta H_\text{fus}$ and $q = n\,\Delta H_\text{vap}$, where $n$ is the amount in moles. This equation is not on the equation sheet. A mass must be changed to moles first (topic 1.1).
- **Worked example "Boiling away liquid nitrogen":** a food laboratory freezes raspberries in seconds by pouring liquid nitrogen over them. The nitrogen is at its boiling point, −195.8 °C, and its molar enthalpy of vaporization is 5.57 kJ/mol. How much energy do 355 g of liquid nitrogen take from the fruit as they boil away?
  1. **Ask whether the temperature changes.** It does not: the liquid is at its boiling point and the question ends when it has all boiled. This is a phase change alone, so the equation is $q = n\,\Delta H_\text{vap}$, not $q = mc\Delta T$.
  2. **Change grams to moles.** The molar mass of N₂ is 28.02 g/mol. Display: $n = \dfrac{355}{28.02} = 12.67$ mol.
  3. **Multiply by the molar enthalpy.** Display: $q = (12.67)(5.57) = 70.6$ kJ.
  4. **Say which way it went.** The nitrogen absorbed 70.6 kJ, so $q$ for the nitrogen is positive. The raspberries lost that much, which is why they froze.

  After the example, one short paragraph and the key idea. Run the change the other way: to turn those 355 g of nitrogen gas back into liquid at −195.8 °C, the same 70.6 kJ must be taken out of it. The molar enthalpy of condensation is the negative of the molar enthalpy of vaporization, here −5.57 kJ/mol. In the same way the molar enthalpy of freezing is the negative of the molar enthalpy of fusion. Display the two lines: $\Delta H_\text{condensation} = -\Delta H_\text{vap}$ and $\Delta H_\text{freezing} = -\Delta H_\text{fus}$. Do not give a second worked calculation: Checks 2 and 3 ask for it.
  - `<KeyIdea>`: a phase change takes in or gives out energy with no change in temperature. Melting and boiling absorb energy; freezing and condensing release exactly as much. The amount is moles times the molar enthalpy of the change.

  Note for the writer: cryogenic freezing of soft fruit with liquid nitrogen is a real industrial and laboratory method. The 70.6 kJ uses the unrounded moles (12.669 mol), and (12.67)(5.57) gives the same three figures.
- **Check 2**, `<Check numeric="-1.96" unit="kJ">`: "A teacher casts a trick spoon by pouring 24.5 g of liquid gallium, at its melting point of 29.8 °C, into a mold, where it freezes. The molar enthalpy of fusion of gallium is 5.59 kJ/mol, and its molar mass is 69.72 g/mol. What is q for the gallium, in kJ? Give its sign." Why: the temperature does not change, so q = nΔH. The amount is 24.5 ÷ 69.72 = 0.351 mol. Freezing is fusion run backward, so the enthalpy change for each mole is −5.59 kJ. Then q = (0.351)(−5.59) = −1.96 kJ. The gallium releases 1.96 kJ to the mold and the air as it freezes. Slips:
  - `1.96` (the sign left off): "The gallium is freezing, so energy leaves it. What sign does q have when a system releases energy?"
  - `-137` (grams times kJ/mol): "Did you multiply grams by kJ/mol? Change 24.5 g to moles first."
  - `137` (grams times kJ/mol, and no sign): "Two things to check: grams were multiplied by kJ/mol, so change to moles first, and freezing releases energy, which sets the sign."
  - `-5.59` (the molar value given for the sample): "That is for one whole mole of gallium. This spoon is 24.5 g, which is less than a mole."
  - `-15.9` (molar mass divided by mass): "Check the moles: divide the mass by the molar mass, not the molar mass by the mass."

  Note for the writer: spoons cast from gallium, which melt in hot tea, are a real novelty. The question gives the molar mass because gallium has not appeared with one in this lesson.
- **Check 3**, `<Check answer={2}>`: "An air-separation plant cools oxygen gas to its boiling point, −183.0 °C, and then condenses 250.0 mol of it to liquid at that temperature. The molar enthalpy of vaporization of oxygen is 6.82 kJ/mol. Which statement describes the oxygen during the condensing?" Options:
  1. The oxygen absorbs 1,705 kJ, because its molecules must be pushed close together
  2. The oxygen releases 1,705 kJ, so its enthalpy change is −1,705 kJ
  3. The oxygen releases 6.82 kJ in all, because that is its enthalpy of vaporization
  4. No energy is transferred, because the temperature stays at −183.0 °C throughout

  Why: condensing is vaporizing run backward, so each mole releases the 6.82 kJ that vaporizing it would absorb. For 250.0 mol that is (250.0)(6.82) = 1,705 kJ released, and the enthalpy change of the oxygen is −1,705 kJ. The plant's refrigeration has to carry that energy away. Nothing has to push the molecules together: their own attractions draw them together, and their potential energy falls as they come. The temperature is steady because the energy leaving is potential energy, not kinetic energy. Misses:
  - 1: "Boiling the liquid takes energy in. Condensing is that change run backward, so which way does the energy go?"
  - 3: "The 6.82 kJ is for one mole. How many moles are condensing here?"
  - 4: "A steady temperature does not mean that no energy moves. In a phase change the energy changes how the molecules are arranged."
- **Section "The heating curve":**
  - Put the two kinds of step together. Take a solid well below its melting point and add energy steadily until it is a gas well above its boiling point. A graph of its temperature against the energy added is called a **heating curve**. Place the figure `6-5-heating-curve-segments.svg` here.
  - The five segments, as a numbered list, each one sentence:
    1. The solid warms. The line slopes up. $q = nC\Delta T$ with the solid's molar heat capacity (or $q = mc\Delta T$ with its specific heat capacity).
    2. The solid melts. The line is flat at the melting point. $q = n\,\Delta H_\text{fus}$.
    3. The liquid warms. The line slopes up. $q = nC\Delta T$ with the liquid's heat capacity.
    4. The liquid boils. The line is flat at the boiling point. $q = n\,\Delta H_\text{vap}$.
    5. The gas warms. The line slopes up. $q = nC\Delta T$ with the gas's heat capacity.
  - How to read the shape, two sentences: the length of a flat part is the energy that phase change takes, so the boiling flat is longer than the melting flat. The steepness of a sloped part depends on the heat capacity of that phase, which is why the three sloped parts of one curve are not parallel. (Do not say here which way the dependence runs: Check 4 asks.)
  - On a sloped part the energy raises the average kinetic energy of the particles; on a flat part it raises their potential energy. A heating curve read from right to left is a cooling curve: every step releases the energy the opposite step absorbed.
  - The second table, the molar heat capacities this lesson uses (four columns), with the sentence that each is treated as constant over its segment, and the sentence "The value for solid ethanol is approximate.":

    | Substance | Solid | Liquid | Gas |
    |---|---|---|---|
    | Ethanol | 70 | 112 | 76 |
    | Iodine | 54.4 | 80.7 | 36.9 |

    The table's caption line, in the text above it: molar heat capacities in J/(mol·°C).
- **The interactive diagram:** place `<HeatingCurve />` here, under a sentence saying what it is: one mole of a substance, starting as a solid, with a slider that adds energy up to 70 kJ. The text asks the student to do three things, as a numbered list:
  1. **Find the flats for ethanol.** Slide down to 0 kJ: solid ethanol at −150.0 °C. Now add energy slowly. The temperature climbs for the first 2.5 kJ, then stops at −114.1 °C while the next 4.9 kJ melts the solid.
  2. **Compare the two flats.** Keep going. Warming the liquid all the way to 78.3 °C takes 21.5 kJ. Boiling it takes 38.6 kJ, about 8 times what melting took, and the temperature does not move by a tenth of a degree.
  3. **Change the substance.** Choose iodine, which starts as a solid at 25.0 °C. Its flats are at 113.7 °C and 184.4 °C, and they take 15.5 kJ and 41.6 kJ. Look at the three sloped parts: the gas line is the steepest and the liquid line the gentlest. Find the reason in the table of heat capacities above.

  The numbers are the module's (see "Diagram data"). The diagram opens on ethanol at 5.0 kJ, half melted, which is why step 1 begins by sliding down.
- **Check 4**, `<Check answer={4}>`: "One mole of liquid X and one mole of liquid Y are warmed by the same steady heater, and neither reaches its boiling point. On a graph of temperature against energy added, the line for X is steeper than the line for Y. What follows?" Options:
  1. Liquid X has the larger molar enthalpy of vaporization
  2. Liquid X has the lower boiling point of the two
  3. Liquid X has the larger molar heat capacity
  4. Liquid X has the smaller molar heat capacity

  Why: on a sloped part, q = nCΔT, so the rise for each joule is 1/(nC). Both samples are one mole, so the steeper line belongs to the smaller molar heat capacity: X needs less energy for each degree. An enthalpy of vaporization would show as the length of a boiling flat, and a boiling point as the height at which a flat begins. Neither liquid boils here, so the graph says nothing about either. Misses:
  - 1: "The enthalpy of vaporization sets how long the boiling flat is. Neither liquid boils here, so ask what sets a slope."
  - 2: "A slope says how fast the temperature climbs, not where the climb ends. What does the same energy do to one mole of each liquid?"
  - 3: "A large molar heat capacity means a lot of energy for each degree. On a graph with energy along the bottom, would that line climb quickly or slowly?"
- **Worked example "From solid to hot liquid, step by step":** a 50.8 g sample of solid iodine at 25.0 °C is heated at 1 atm until it is liquid at 150.0 °C. Use the two tables. How much energy does the iodine absorb? (Ignore the small amount that turns to vapor on the way.)
  1. **Sketch the path on the heating curve.** The sample starts on the solid's slope, crosses the melting flat at 113.7 °C and stops partway up the liquid's slope, below the boiling point of 184.4 °C. That is three steps: warm the solid, melt it, warm the liquid.
  2. **Find the moles.** The molar mass of I₂ is 253.80 g/mol. Display: $n = \dfrac{50.8}{253.80} = 0.200$ mol.
  3. **Warm the solid from 25.0 °C to 113.7 °C.** ΔT = 88.7 °C. Display: $q_1 = (0.200)(54.4)(88.7) = 965$ J.
  4. **Melt it at 113.7 °C.** No ΔT in this step. Display: $q_2 = (0.200)(15.5) = 3.10$ kJ.
  5. **Warm the liquid from 113.7 °C to 150.0 °C.** ΔT = 36.3 °C. Display: $q_3 = (0.200)(80.7)(36.3) = 586$ J.
  6. **Add, in one unit.** Steps 1 and 3 are in joules and step 2 is in kilojoules. In kilojoules: 0.965 + 3.10 + 0.586 = 4.65 kJ.
  7. **Look at the answer.** Melting alone took 3.10 kJ, twice as much as the two warming steps together (0.965 + 0.586 = 1.55 kJ), though the thermometer did not move while it happened.

  Note for the writer: the sums use n = 0.200 mol as rounded; unrounded moles (0.20016) give the same 4.65 kJ. Solid iodine gives off some violet vapor well below its melting point; the sentence in parentheses in the question is the honest hedge, so keep it. Do not describe how the heating is done.
- **Check 5**, `<Check numeric="22.3" unit="kJ">`: "A 23.0 g sample of liquid ethanol at 25.0 °C is heated until it has all become vapor at its boiling point, 78.3 °C. Use the two tables, and 46.07 g/mol for the molar mass of ethanol. How much energy, in kJ, does the ethanol absorb?" Why: two steps. The sample is 23.0 ÷ 46.07 = 0.499 mol. Warming the liquid by 53.3 °C takes (0.499)(112)(53.3) = 2,980 J, which is 2.98 kJ. Vaporizing it at 78.3 °C takes (0.499)(38.6) = 19.3 kJ. Together, 22.3 kJ. Set the two products as display math, numbers only. Slips:
  - `19.3` (the warming step left out): "That is the energy to vaporize the ethanol. It has to be warmed from 25.0 °C to its boiling point first."
  - `2.98` (the vaporizing step left out): "That is the energy to warm the liquid to 78.3 °C. Boiling it takes more energy, with no change in temperature."
  - `3.00e3` (2,980 J added to 19.3 kJ as bare numbers): "Did you add joules to kilojoules? Put both steps in the same unit before you add them."
  - `891` (23.0 g multiplied by 38.6 kJ/mol): "Did you multiply grams by kJ/mol? Both steps need the amount in moles."
  - `157` (23.0 g used with the molar heat capacity): "Check the warming step. A molar heat capacity goes with moles, not grams."
  - `1030` (23.0 g used in both steps): "Did you use 23.0 g in both steps? The heat capacity and the enthalpy in the tables are for each mole."
- **Check 6**, `<Check answer={1}>`: "An insulated vessel at 1 atm holds 2.00 mol of solid ethanol at −150.0 °C. It absorbs 30.0 kJ. Using the two tables, what is in the vessel afterward?" Options:
  1. Liquid only, somewhere below its boiling point
  2. Liquid and vapor together, at the boiling point of 78.3 °C
  3. Solid and liquid together, at the melting point of −114.1 °C
  4. Solid only, still colder than its melting point of −114.1 °C

  Why: spend the energy one segment at a time. Warming 2.00 mol of solid through 35.9 °C takes (2.00)(70)(35.9) = 5.03 kJ. Melting it takes (2.00)(4.93) = 9.86 kJ. That is 14.89 kJ so far, with 15.11 kJ left. Warming the liquid all the way to its boiling point would take (2.00)(112)(192.4) = 43.1 kJ, far more than is left, so the ethanol ends as a liquid partway up that slope. (The 15.11 kJ raises it by 67.5 °C, to −46.6 °C.) For one mole the liquid segment would end at 29.0 kJ, which is why forgetting the 2.00 puts the sample on the boiling flat. Misses:
  - 2: "Check the amount. The energies read from the explorer are for 1 mol, and this sample is 2.00 mol, so every step takes twice as much."
  - 3: "Add up the first two steps for 2.00 mol: warming the solid to −114.1 °C, then melting all of it. Is 30.0 kJ more or less than that?"
  - 4: "Warming 2.00 mol of solid from −150.0 °C to −114.1 °C takes about 5 kJ. What does the rest of the 30.0 kJ do?"
- **Trap:** **Using $q = mc\Delta T$ on a flat part** (the temperature does not change during a phase change; use moles times the molar enthalpy). **Multiplying grams by a molar enthalpy** (kJ/mol needs moles). **Adding joules to kilojoules** (the sloped steps often come out in J and the flat steps in kJ). **Thinking no energy moves because the thermometer is steady** (the energy is changing the particles' potential energy). **Saying that boiling breaks the bonds inside molecules** (it separates whole molecules from one another). **Keeping the sign positive for freezing or condensing** (they release what melting or boiling absorbs). **Using one heat capacity for the whole curve** (the solid, the liquid and the gas each have their own).
- **Key points:** melting and boiling absorb energy, and freezing and condensing release it, and during each the temperature of a pure substance stays constant; in a phase change the energy changes the potential energy of the particles as they are separated or brought together, not their average kinetic energy; the energy of a phase change is $q = n\,\Delta H$, with $n$ in moles and the molar enthalpy of fusion or of vaporization in kJ/mol, an equation that is not on the equation sheet; the molar enthalpy of freezing is $-\Delta H_\text{fus}$ and that of condensation is $-\Delta H_\text{vap}$; a heating curve has three sloped parts, where $q = nC\Delta T$ or $q = mc\Delta T$ applies, and two flat parts, where $q = n\,\Delta H$ applies, and the energies of the steps add; vaporizing a substance takes more energy than melting it, because boiling separates the particles and melting only frees them to move past one another.

**Figure**

- **`6-5-heating-curve-segments.svg`** (viewBox 0 0 480 340, font-size 18). A graph with no numbers on either axis.
  - Axes in ink: the vertical axis from (70, 290) up to (70, 30), the horizontal from (70, 290) to (460, 290). Axis titles: "Temperature", rotated, beside the vertical axis, and "Energy added" under the horizontal axis, centered.
  - The curve, one polyline in the accent color, 3 units thick, through these points: (70, 265), (115, 215), (175, 215), (255, 115), (415, 115), (460, 65). That is five segments: a slope, a flat 60 units long, a slope, a flat 160 units long, a slope.
  - Two dashed guide lines in the secondary color, from the vertical axis across the plot at y = 215 and at y = 115. Label "Boiling point" on the upper guide at its left end, just above the line (the curve is far below there). Label "Melting point" on the lower guide at its right end, just above the line (the curve is far above there).
  - Segment labels in ink, each beside its own segment and clear of the curve and the guides: "Solid" to the right of the first slope and below it; "Melting" under the first flat; "Liquid" to the right of the second slope and below it; "Boiling" under the second flat; "Gas" below and to the right of the last slope, or to its left above the upper guide if that is clearer. Move a label rather than shrink it.
  - The two flats differ from the slopes in direction only; nothing in the figure depends on color.
  - Text in the figure, nine pieces: the two axis titles, "Melting point", "Boiling point", "Solid", "Melting", "Liquid", "Boiling", "Gas".
  - Alt: "A graph of temperature against energy added, with no numbers. The line has five parts: it slopes up, labeled solid; runs flat at a dashed line marked melting point, labeled melting; slopes up again, labeled liquid; runs flat for much longer at a higher dashed line marked boiling point, labeled boiling; and slopes up a last time, labeled gas."
  - Caption: "A heating curve. On the sloped parts the added energy raises the temperature. On the two flat parts it separates particles, and the temperature holds."

**Diagram data** (for the builder of `src/lib/heating-curve.ts` and `<HeatingCurve />`; the design's section 6.1 fixes what the diagram shows)

- **The two substances,** one mole of each, at a constant pressure of 1 atm:

  | | Ethanol, C₂H₅OH | Iodine, I₂ |
  |---|---|---|
  | Starting temperature (solid) | −150.0 °C | 25.0 °C |
  | Melting point | −114.1 °C | 113.7 °C |
  | Boiling point | 78.3 °C | 184.4 °C |
  | Molar enthalpy of fusion | 4.93 kJ/mol | 15.5 kJ/mol |
  | Molar enthalpy of vaporization | 38.6 kJ/mol | 41.6 kJ/mol |
  | Molar heat capacity, solid | 70 J/(mol·°C) | 54.4 J/(mol·°C) |
  | Molar heat capacity, liquid | 112 J/(mol·°C) | 80.7 J/(mol·°C) |
  | Molar heat capacity, gas | 76 J/(mol·°C) | 36.9 J/(mol·°C) |

  They differ clearly: ethanol's flats are 192.4 °C apart and iodine's 70.7 °C apart; ethanol's boiling flat is 7.8 times its melting flat and iodine's 2.7 times; in iodine the gas's line is the steepest. Note for the builder: the explorer's caption says solid ethanol's heat capacity is approximate, so the steepest line in ethanol is not claimed. Sources are in "Values"; three of ethanol's numbers are marked for checking.
- **The slider:** energy added, from 0 to 70.0 kJ in steps of 0.5 kJ (141 positions), the same for both substances. Both curves end as a gas inside that range, so no end temperature is set by hand. **The diagram opens on ethanol at 5.0 kJ.**
- **The model.** Each sloped segment is a straight line with slope 1/C; each flat is as long as the molar enthalpy. Energy of each segment and the running total at the end of each, in joules:

  | Segment | Ethanol | Ethanol, total so far | Iodine | Iodine, total so far |
  |---|---|---|---|---|
  | 1 Solid warms | 2,513 (35.9 °C × 70) | 2,513 | 4,825.28 (88.7 °C × 54.4) | 4,825.28 |
  | 2 Melting | 4,930 | 7,443 | 15,500 | 20,325.28 |
  | 3 Liquid warms | 21,548.8 (192.4 °C × 112) | 28,991.8 | 5,705.49 (70.7 °C × 80.7) | 26,030.77 |
  | 4 Boiling | 38,600 | 67,591.8 | 41,600 | 67,630.77 |
  | 5 Gas warms, to 70,000 J | 2,408.2 | 70,000 | 2,369.23 | 70,000 |

  At 70.0 kJ the ethanol is a gas at 110.0 °C and the iodine a gas at 248.6 °C. The readout gives the energy each segment takes in kJ to one decimal: ethanol 2.5, 4.9, 21.5, 38.6 and (to the end of the slider) 2.4; iodine 4.8, 15.5, 5.7, 41.6 and 2.4.
- **Slopes** of the sloped parts, in °C for each kJ, for tests of the drawing: ethanol 14.3 (solid), 8.9 (liquid), 13.2 (gas); iodine 18.4, 12.4, 27.1.
- **Rounding.** The module works in exact arithmetic (energies in joules, temperatures in tenths of a degree, heat capacities in tenths of J/(mol·°C)) and rounds for display only, half up: the temperature to 0.1 °C, and on a flat the percent of the sample that has changed phase to a whole number, held between 1 and 99 while both phases are present. One slider position is an exact tie (ethanol at 68.5 kJ, exactly 90.25 °C, shown as 90.3 °C). No slider position falls exactly on a boundary between segments except 0.
- **Readout sentences,** one per kind of segment, for the wording: on a slope, "Liquid ethanol at −73.4 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 21.5 kJ." On a flat, "Ethanol melting at −114.1 °C: 50 percent is liquid. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 4.9 kJ."
- **The box of particles** shows what the readout's phase names: fixed rows for the solid, a disordered touching cluster for the liquid, a few separated particles for the gas, and on a flat a share of each of the two phases in proportion to the percent.
- **Worked states** for unit tests (energy added, then the exact outputs expected):

  | Substance | Energy (kJ) | What is present | Temperature (°C) | Percent changed |
  |---|---|---|---|---|
  | ethanol | 0 | solid | −150.0 | |
  | ethanol | 1.0 | solid | −135.7 | |
  | ethanol | 5.0 | melting | −114.1 | 50 |
  | ethanol | 12.0 | liquid | −73.4 | |
  | ethanol | 26.0 | liquid | 51.6 | |
  | ethanol | 29.0 | boiling | 78.3 | 1 (exactly 0.02, held at 1) |
  | ethanol | 40.0 | boiling | 78.3 | 29 |
  | ethanol | 67.5 | boiling | 78.3 | 99 (exactly 99.76, held at 99) |
  | ethanol | 68.0 | gas | 83.7 | |
  | ethanol | 68.5 | gas | 90.3 (exactly 90.25) | |
  | ethanol | 70.0 | gas | 110.0 | |
  | iodine | 0 | solid | 25.0 | |
  | iodine | 2.5 | solid | 71.0 | |
  | iodine | 12.0 | melting | 113.7 | 46 |
  | iodine | 23.0 | liquid | 146.8 | |
  | iodine | 40.0 | boiling | 184.4 | 34 |
  | iodine | 68.0 | gas | 194.4 | |
  | iodine | 70.0 | gas | 248.6 | |

**Values**

| Quantity | Value | Source |
|---|---|---|
| Gallium: melting point; molar enthalpy of fusion | 29.76 °C (printed as 29.8 °C); 5.59 kJ/mol | CRC Handbook |
| Benzoic acid: melting point | 122.4 °C (printed as 122 °C) | CRC Handbook |
| Nitrogen: melting point; boiling point | −210.0 °C; −195.8 °C | CRC Handbook |
| Nitrogen: molar enthalpy of fusion; of vaporization | 0.71 kJ/mol; 5.57 kJ/mol | CRC Handbook (fusion is given as 0.71 or 0.72 by different tables: **(verify)**) |
| Oxygen: melting point; boiling point | −218.8 °C; −183.0 °C | CRC Handbook |
| Oxygen: molar enthalpy of fusion; of vaporization | 0.44 kJ/mol; 6.82 kJ/mol | CRC Handbook |
| Ethanol: melting point; boiling point | −114.1 °C; 78.3 °C | CRC Handbook (−114.14 °C; 78.29 °C) |
| Ethanol: molar enthalpy of fusion; of vaporization at the boiling point | 4.93 kJ/mol; 38.6 kJ/mol | CRC Handbook (4.931; 38.56) |
| Ethanol: molar heat capacity, liquid | 112 J/(mol·°C) | CRC Handbook, 112.3 at 25 °C; it is lower near the melting point and higher near the boiling point, and the model holds it constant |
| Ethanol: molar heat capacity, solid | 70 J/(mol·°C) | from memory of calorimetric data for the crystal near 150 K: **(verify; low confidence, could be 65 to 90)** |
| Ethanol: molar heat capacity, gas | 76 J/(mol·°C) | NIST Chemistry WebBook, ideal gas, interpolated between 65.5 at 300 K and 81.2 at 400 K for about 365 K: **(verify)** |
| Iodine: melting point; boiling point | 113.7 °C; 184.4 °C | CRC Handbook |
| Iodine: molar enthalpy of fusion; of vaporization | 15.5 kJ/mol; 41.6 kJ/mol | CRC Handbook (15.52; 41.57), per mole of I₂ |
| Iodine: molar heat capacity, solid | 54.4 J/(mol·°C) | CRC Handbook, 54.44 at 25 °C |
| Iodine: molar heat capacity, liquid | 80.7 J/(mol·°C) | NIST Chemistry WebBook, liquid-phase fit (80.67): **(verify)** |
| Iodine: molar heat capacity, gas | 36.9 J/(mol·°C) | CRC Handbook, 36.9 at 25 °C (it is about 37.4 near 200 °C) |
| Molar masses | N₂ 28.02; Ga 69.72; I₂ 253.80; C₂H₅OH 46.07 g/mol | the site's `src/data/elements.ts` |

If the fact-checker changes one of the three heat capacities marked for checking, the ethanol or iodine columns of "Diagram data", worked example 2 (iodine's liquid value), Check 5 (ethanol's liquid value is not one of the three) and Check 6 (ethanol's solid value: 5.03 kJ and all that follows) must be recomputed; the check script does it when the value is changed at its top.

**Check script:** `scratchpad/unit6/checks/6-5.py`. It recomputes every number above, each slip, every segment, boundary, slope and worked state of the explorer, and checks each message and option against this file.

**Notes for the writer**

- Water does not appear in this lesson at all: no ice in a drink, no steam, no heating curve of water. The explorer's ethanol and iodine carry the heating curve.
- Do not write that vaporization takes "seven times" the energy of fusion or give any one ratio as general. The table's ratios run from 2.7 to 15.5.
- "Fusion" needs its one-line gloss ("the old word for melting") because the symbol uses it.
- Say "attractions between molecules", and "intermolecular forces" where topic 3.1's term helps. Never say a phase change of a molecular substance breaks bonds. For gallium (a metal) say "attractions between its atoms".
- A sentence in words never says "negative heat". It says "the gallium releases 1.96 kJ" or "q for the gallium is −1.96 kJ".
- Check 2 is the only Check that asks for a sign with a typed number. Its question says "Give its sign", and the tag is `numeric="-1.96"` with a plain hyphen.
- The lesson uses molar heat capacities ($q = nC\Delta T$) because the framework's objective for this topic counts in moles. Say once that a question may give a specific heat capacity in J/(g·°C) instead, and then the sloped steps use grams.

**Reactions, substances and scenarios used:** no chemical equation appears in the lesson. Scenarios: a lump of gallium melting in the palm at 29.8 °C (opening); benzoic acid crystals holding at 122 °C in a melting-point test (Check 1); a table of melting and boiling points and molar enthalpies for nitrogen, oxygen, ethanol and iodine; 355 g of liquid nitrogen boiling away over raspberries in a food laboratory, 70.6 kJ (worked example 1); 24.5 g of liquid gallium freezing in the mold of a trick spoon, −1.96 kJ (Check 2); 250.0 mol of oxygen condensing at −183.0 °C in an air-separation plant, 1,705 kJ released (Check 3); the explorer's one mole of ethanol from −150.0 °C and one mole of iodine from 25.0 °C, each given up to 70 kJ; two unnamed liquids X and Y warmed by the same heater (Check 4); 50.8 g of solid iodine heated from 25.0 °C to liquid at 150.0 °C, 4.65 kJ (worked example 2); 23.0 g of liquid ethanol warmed from 25.0 °C and vaporized at 78.3 °C, 22.3 kJ (Check 5); 2.00 mol of solid ethanol at −150.0 °C given 30.0 kJ (Check 6). Figure: the one the design lists for this lesson, drawn without numbers.

**Check script:** `scratchpad/unit6/checks/6-5.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.5 Energy of Phase Changes`).

---

## Group D: enthalpy of reaction, three ways (pull request D)

Branch: `topic/unit-6-enthalpy-of-reaction`, from `topic/unit-6-calorimetry-and-phase-changes`. The pull request title is "feat(lessons): Unit 6 lessons 6.6-6.9".

No new block. Four writers at the same time, then the controller's steps. With all nine lessons in, Unit 6 goes on `BALANCED_UNITS` in `tests/unit/check-balance.test.ts`. Task 10 closes the unit out.

> **How these briefs were checked.** A fact-check of lessons 6.7 to 6.9 confirmed every published value and found one false general claim (that a bond-enthalpy estimate is usually within a few percent; the lesson's own table shows 10 percent) and eight smaller points. The originality check found lesson 6.7's first reaction already in the site's Unit 7 test (now acetylene and water to acetaldehyde), a Check that was an example of the teacher's notes (now benzene to cyclohexane), a smelter scene close to lesson 4.5's (now a copper sulfate hydrate), and a closing table in the order of the teacher's notes (dropped). A second check of the changes found no error and added one slip.

### Task 8: Lesson 6.6, Introduction to Enthalpy of Reaction

**Files:**
- Create: `src/content/lessons/unit-6/6-6-introduction-to-enthalpy-of-reaction.mdx`
- Create: `public/figures/6-6-calorimeter-to-delta-h.svg`

**Brief**

- **Front matter:** `topic: "6.6"`, `minutes: 15`, summary: "What the enthalpy change of a reaction means, why its value belongs to the equation as written, and how to find it per mole of reaction from a temperature change in a calorimeter." (No colon in the summary.)
- **Framework (6.6, three statements):** (1) the enthalpy change of a reaction is the heat released (negative values) or absorbed (positive values) by the reaction at constant pressure. (2) When the products of a reaction are at a different temperature from their surroundings, they exchange energy with the surroundings until thermal equilibrium: thermal energy passes to the surroundings from the products of an exothermic reaction, and from the surroundings to the products of an endothermic one. (3) The chemical potential energy of the products differs from that of the reactants because bonds are broken and formed; the difference appears as a change in the kinetic energy of the particles, which is seen as a temperature change. The objective is to calculate the heat absorbed or released by a reaction from the moles that react and the molar enthalpy of reaction. The framework's unit is kJ/mol of reaction: the value belongs to the equation as written. **Not assessed:** the technical distinction between enthalpy and internal energy (one "Beyond the exam" sentence). **What this lesson does not do:** system, surroundings and the signs are topic 6.1's and are used here; energy diagrams are topic 6.2's; q = mcΔT and the coffee-cup calorimeter are topic 6.4's and are used here; adding up bond enthalpies is topic 6.7's; enthalpies of formation are topic 6.8's; reversing, scaling and adding equations is topic 6.9's (this lesson says only that the value goes with the equation as written, and points ahead once). **Equation sheet:** q = mcΔT is on it. Nothing on it says q = (moles of reaction)(ΔH); a question gives ΔH or the data to find it.
- **Opening:** hold a small piece of lithium metal in a burner flame and it catches fire. It burns with a fierce white light edged in crimson and leaves a white powder, lithium oxide. The burner only started it: take the flame away and the lithium goes on burning. The energy comes out of the reaction itself, and a chemist can say exactly how much comes out for each gram of lithium burned. This lesson is about the number that makes that possible. Note for the writer: this is a real demonstration; in air the main product is lithium oxide (a little nitride forms too, which the lesson does not mention). Give no flame temperature. No magnesium anywhere in this lesson.
- **Section "Enthalpy change: heat at constant pressure":**
  - Most reactions you meet are run open to the air: in a flask, a beaker, a foam cup, a burner flame. The pressure on them is the pressure of the atmosphere, and it does not change while they react. The heat a reaction releases or absorbs under that condition has its own name and symbol: the **enthalpy change** of the reaction, $\Delta H$.
  - The sign follows topic 6.1's rule, taken from the side of the reacting substances, which are the system. If the reaction releases heat, $\Delta H$ is negative and the reaction is exothermic. If it absorbs heat, $\Delta H$ is positive and the reaction is endothermic.
  - The lithium, as a display, split at the arrow if the writer finds it long: $\ce{4Li(s) + O2(g) -> 2Li2O(s)}$, then $\Delta H = -1{,}195.8\ \text{kJ/mol}_\text{rxn}$. The minus sign says that energy leaves the reacting lithium and oxygen: 1,195.8 kJ of it. The next section explains the unit.
  - One sentence, exactly one: "**Beyond the exam:** enthalpy is not quite the same thing as the energy of the system, because a reaction that makes or uses up gas also pushes on the atmosphere, but the exam does not ask about the difference."
  - `<KeyIdea>`: the enthalpy change of a reaction, $\Delta H$, is the heat it releases or absorbs at constant pressure. Negative means released; positive means absorbed.
- **Section "ΔH belongs to the equation":**
  - The 1,195.8 kJ is not "per mole of lithium" and not "per mole of oxygen". It goes with the equation as it is written, read in moles: 4 mol of lithium reacting with 1 mol of oxygen to make 2 mol of lithium oxide. One such run of the equation is called a **mole of reaction**, and the unit kJ/mol$_\text{rxn}$ means kilojoules for each mole of reaction.
  - So the equation hands you ratios, just as it does for amounts of substance (topic 4.5). As a short list: 1,195.8 kJ released for every 4 mol of Li that burn; 1,195.8 kJ released for every 1 mol of O₂ used; 1,195.8 kJ released for every 2 mol of Li₂O formed.
  - The energy for any amount: find the moles of reaction, then multiply. Display: $q = n_\text{rxn} \times \Delta H$. To get the moles of reaction, divide the moles of a substance by its coefficient in the equation.
  - Because the value goes with the equation as written, the same reaction written another way has another value. Display: $\ce{2Li(s) + 1/2 O2(g) -> Li2O(s)}$, then $\Delta H = -597.9\ \text{kJ/mol}_\text{rxn}$. Half the amounts, half the energy. Topic 6.9 uses this. One sentence more: the state symbols are part of the equation too, and the same reaction written with a substance in a different state has a different $\Delta H$.
  - One sentence on the unit as the exam prints it: tables and questions often shorten kJ/mol$_\text{rxn}$ to kJ/mol, or give $\Delta H$ beside an equation in kJ alone; in each case read it as "for the equation as written".
- **Check 1**, `<Check answer={2}>`: "When nitrous oxide gas is heated strongly, it breaks down into the two main gases of the air. The equation and its enthalpy change are shown. Which statement reads them correctly?" Then the display $\ce{2N2O(g) -> 2N2(g) + O2(g)}$ and $\Delta H = -164\ \text{kJ/mol}_\text{rxn}$. Options:
  1. 164 kJ is released for each single mole of N₂O that breaks down
  2. 164 kJ is released when 2 mol of N₂O break down
  3. 164 kJ is absorbed for every 2 mol of N₂O that break down
  4. 164 kJ is released for every 2 mol of O₂ that form

  Why: one mole of reaction uses up 2 mol of N₂O and forms 2 mol of N₂ and 1 mol of O₂, and it releases 164 kJ, because ΔH is negative. So the 164 kJ goes with 2 mol of N₂O, or with 1 mol of O₂ formed. One mole of N₂O would release half as much, 82 kJ. Misses:
  - 1: "The value belongs to the equation as written. How many moles of N₂O does the equation use up?"
  - 3: "Check the sign. What does a negative ΔH say about the direction of the energy?"
  - 4: "Read the coefficient of O₂ in the equation. How many moles of O₂ form in one mole of reaction?"
- **Worked example "Energy from a sliver of lithium":** the piece of lithium in the flame has a mass of 0.694 g, and all of it burns to lithium oxide. How much energy is released? Use $\ce{4Li(s) + O2(g) -> 2Li2O(s)}$, $\Delta H = -1{,}195.8$ kJ/mol$_\text{rxn}$.
  1. **Plan the route.** Grams of lithium, to moles of lithium, to moles of reaction, to kilojoules. It is the route of topic 4.5 with energy at the end in place of a product.
  2. **Grams to moles.** Display: $n_{\ce{Li}} = \dfrac{0.694}{6.94} = 0.100$ mol.
  3. **Moles of lithium to moles of reaction.** The equation uses 4 mol of Li each time it runs. Display: $n_\text{rxn} = \dfrac{0.100}{4} = 0.0250$ mol.
  4. **Multiply by $\Delta H$.** Display: $q = (0.0250)(-1{,}195.8) = -29.9$ kJ.
  5. **Say it in words, and test it.** The burning lithium releases 29.9 kJ. That is sensible: 0.694 g is far less than the 4 mol (27.76 g) the equation is written for, so the answer should be far less than 1,195.8 kJ. Forgetting to divide by 4 would have given 120 kJ, four times too much.

  Note for the writer: 4 × 6.94 = 27.76 g. A sentence in words says "releases 29.9 kJ", never "−29.9 kJ of heat is released".
- **Check 2**, `<Check numeric="6.30" unit="kJ">`: "In 1774 Joseph Priestley made oxygen by heating red mercury(II) oxide with sunlight focused through a lens. The equation and its enthalpy change are shown. The molar mass of HgO is 216.59 g/mol. How much energy, in kJ, do 15.0 g of mercury(II) oxide absorb as they decompose?" Then the display $\ce{2HgO(s) -> 2Hg(l) + O2(g)}$ and $\Delta H = +182\ \text{kJ/mol}_\text{rxn}$. Why: 15.0 ÷ 216.59 = 0.0693 mol of HgO. The equation uses 2 mol of HgO each time it runs, so that is 0.0346 mol of reaction. Then (0.0346)(182) = 6.30 kJ. ΔH is positive, so this energy is absorbed: it is why the oxide must be heated the whole time. Slips:
  - `12.6` (not divided by the coefficient 2): "Did you use the moles of HgO as the moles of reaction? The equation uses up 2 mol of HgO each time it runs."
  - `182` (ΔH itself): "That is for 2 mol of HgO, about 433 g. This sample is far smaller."
  - `2730` (grams times ΔH): "Did you multiply grams by kJ/mol? Change 15.0 g to moles first."
  - `1365` (grams halved, then times ΔH): "Did you halve the grams? Change 15.0 g to moles first, then use the 2 in the equation."
  - `-6.30` (a minus sign typed): "The question asks how much energy is absorbed, which is a size. Type it without the minus sign."

  Note for the writer: the experiment is real, and mercury(II) oxide does decompose to liquid mercury and oxygen on strong heating. Say nothing about safety and do not suggest the student try it.
- **Section "Where the energy comes from":**
  - No energy is created in a reaction (the first law, topic 6.4). So where do the 1,195.8 kJ come from? They were stored in the reactants as chemical potential energy: the energy that atoms and ions have because of how they are bonded and attracted to one another.
  - In a reaction some bonds and attractions are broken and new ones are formed, so the products have a different chemical potential energy from the reactants. Breaking takes energy in and forming gives energy out (topic 2.2), and the two rarely balance. Topic 6.7 does that accounting with numbers; here only the outcome matters.
  - In an exothermic reaction the products have less chemical potential energy than the reactants. The difference does not vanish: it becomes kinetic energy of the particles, which move faster. Faster particles on average mean a higher temperature (topic 6.3). That is the warming you measure.
  - In an endothermic reaction the products have more chemical potential energy than the reactants. The difference is taken from the kinetic energy of the particles around them, which slow down, and the temperature falls.
  - Two sentences linking to topic 6.2: on an energy diagram the two levels are these two potential energies, and $\Delta H$ is the gap between them, products minus reactants.
- **Check 3**, `<Check answer={4}>`: "A student stirs copper powder into colorless silver nitrate solution in a foam cup. The solution turns blue, gray silver appears, and the mixture warms by several degrees, though nothing outside the cup heated it. Where did that thermal energy come from?" Options:
  1. From the water, which gave up some of its energy to the ions as they reacted
  2. From the foam cup, which trapped energy that was coming in from the room
  3. From bonds breaking in the reactants, since a breaking bond gives out energy
  4. From chemical potential energy, which is lower in the products

  Why: the mixture warmed with nothing outside heating it, so the energy came from the reacting substances. The copper ions and silver metal that form have less chemical potential energy than the copper metal and silver ions that reacted. The difference became kinetic energy of the particles in the cup, and the thermometer shows it as a rise in temperature. The water cannot be the source, because the water warmed too. The cup only keeps the energy in. And breaking a bond never gives out energy: it always takes energy in. Misses:
  - 1: "The water warmed too, so it gained energy. Something else must have lost it."
  - 2: "The cup is there to stop energy getting in or out. The warming began inside the liquid, where the reaction was."
  - 3: "Breaking a bond always takes energy in (topic 2.2). So breaking bonds cannot be the source of the warmth."
- **Section "Measuring ΔH in a calorimeter":**
  - Run a reaction in solution inside a coffee-cup calorimeter (topic 6.4) and the solution around the reacting particles takes up the energy an exothermic reaction releases, or supplies the energy an endothermic one absorbs. The reacting substances are the system. The rest of the solution is the part of the surroundings whose temperature you can measure.
  - $\Delta H$ is an energy divided by an amount, so two separate things have to be found, and they come from different measurements. Present them as two short headed lists, not as one numbered list, and then the figure `6-6-calorimeter-to-delta-h.svg`:
    - **The energy, from the thermometer.** The solution's temperature change and $q = mc\Delta T$, with the mass of the whole solution, give the energy the solution gained or lost. The reaction's energy is the same size with the opposite sign: $q_\text{reaction} = -q_\text{solution}$.
    - **The amount, from what was mixed.** For each reactant, divide its moles by its coefficient in the equation. The smaller result is the moles of reaction that took place, because that reactant is the limiting one (topic 4.5).
    - **Then divide.** $\Delta H = q_\text{reaction} \div n_\text{rxn}$, in kJ/mol$_\text{rxn}$.
  - Two sentences: the two halves can be done in either order, and neither needs the other. An answer that stops at the energy is the result of one experiment; only the division makes it a property of the reaction.
- **Worked example "From a temperature rise to ΔH":** a student adds 1.00 g of copper powder to 50.0 mL of 0.400 M silver nitrate solution in a coffee-cup calorimeter. The temperature rises from 21.30 °C to 28.10 °C. Take the mass of the solution as 50.0 g and its specific heat capacity as 4.18 J/(g·°C). Find $\Delta H$ for the reaction, shown as a display: $\ce{Cu(s) + 2Ag+(aq) -> Cu^2+(aq) + 2Ag(s)}$.
  1. **The amount: moles of reaction from each reactant.** Silver ions: (0.0500 L)(0.400 mol/L) = 0.0200 mol, and the equation uses 2 each time it runs, so they are enough for 0.0100 mol of reaction. Copper: 1.00 ÷ 63.55 = 0.0157 mol, with a coefficient of 1, enough for 0.0157 mol of reaction. The silver ions run out first, so 0.0100 mol of reaction takes place.
  2. **The energy: the solution first.** ΔT = 28.10 − 21.30 = 6.80 °C. Display: $q_\text{solution} = (50.0)(4.18)(6.80) = 1{,}421$ J. The solution gained 1,421 J.
  3. **The energy: now the reaction.** The reaction released what the solution gained: $q_\text{reaction} = -1{,}421$ J, which is −1.421 kJ. (Keep the extra figure until the end.)
  4. **Divide.** Display: $\Delta H = \dfrac{-1.421}{0.0100} = -142$ kJ/mol$_\text{rxn}$.
  5. **Check it.** The mixture warmed, so the reaction is exothermic and $\Delta H$ must be negative. It is. Dividing by the 0.0200 mol of silver ions would have given −71.1, the energy for each mole of silver, which is not what the equation as written asks for. A foam cup's answer comes out a little small in size, because a little of the energy warms the cup, the thermometer and the metal, and a little escapes.

  Note for the writer: the reaction is real (copper metal in silver nitrate solution gives silver metal and blue copper(II) ions); with powder it is over in a minute or two of stirring. The nitrate ion is a spectator, which is why the net ionic equation (topic 4.2) is the one used. The amount comes first here on purpose, so that the example does not read as a fixed four-step recipe. Do not print an accepted value and do not compare the result with one; tables give −146.4 (see "Values"), which the 6.80 °C rise was chosen to fall a little short of. The question says "take the mass of the solution as 50.0 g" so that nobody has to assume a density.
- **Check 4**, `<Check numeric="-87.6" unit="kJ/mol">`: "A student stirs 2.03 g of zinc oxide, a white powder (0.0250 mol), into 60.0 mL of 1.00 M hydrochloric acid in a coffee-cup calorimeter. The powder dissolves, and the temperature rises from 22.00 °C to 30.45 °C. Take the mass of the solution as 62.0 g and its specific heat capacity as 4.18 J/(g·°C). What is ΔH for the reaction shown, in kJ/mol of reaction? Give its sign." Then the display: $\ce{ZnO(s) + 2H+(aq) -> Zn^2+(aq) + H2O(l)}$. Why: the amount first. The zinc oxide is enough for 0.0250 mol of reaction. The acid holds (0.0600 L)(1.00 mol/L) = 0.0600 mol of H⁺, and the equation uses 2 each time it runs, so it is enough for 0.0300 mol of reaction. The zinc oxide runs out first: 0.0250 mol of reaction takes place. Now the energy. ΔT = 30.45 − 22.00 = 8.45 °C, so q for the solution is (62.0)(4.18)(8.45) = 2,190 J: it gained energy. The reaction released what the solution gained, so q for the reaction is −2.190 kJ. ΔH = −2.190 ÷ 0.0250 = −87.6 kJ/mol of reaction. The sign is negative: the mixture warmed, so the reaction is exothermic. Set the calculations as display math, numbers only. Slips:
  - `87.6` (the sign not reversed): "The mixture warmed, so the solution gained energy. The reaction lost what the solution gained. Check the sign."
  - `-2.19` (stopped before dividing by moles): "That is the energy in kJ for this one experiment. ΔH is for each mole of reaction, so divide by the moles of reaction."
  - `-36.5` (divided by the 0.0600 mol of acid): "Did you divide by the 0.0600 mol of acid? Not all of it reacted, and the equation uses 2 mol of H⁺ each time it runs."
  - `-73.0` (the acid taken as limiting, 0.0300 mol of reaction): "Did you take the acid as the limiting reactant? Work out the moles of reaction each reactant is enough for, and use the smaller."
  - `-84.8` (60.0 used as the mass): "Did you use 60.0 as the mass? The question gives the mass of the solution that warmed as 62.0 g."
  - `-8.76e4` (J/mol): "That is in J/mol. The question asks for kJ/mol."

  Note for the writer: zinc oxide is a base and dissolves readily in dilute hydrochloric acid, giving off energy; nothing fizzes and no gas leaves. The question gives the 0.0250 mol so that the Check tests the limiting reactant, the sign and the division, not a molar mass (2.03 ÷ 81.38 = 0.0249). Tables give about −89 kJ/mol for this reaction (see "Values"); do not print that. The answer is negative, so the tag is `numeric="-87.6"` with a plain hyphen, and the first slip catches an unsigned 87.6.
- **Section "Afterward: back to thermal equilibrium":**
  - Right after an exothermic reaction, the products are hotter than their surroundings. That cannot last. Thermal energy passes from the hot products to the cooler surroundings until everything is at one temperature: thermal equilibrium (topic 6.3).
  - This is why the lithium oxide powder is cold a few minutes after the flame, though the reaction released 29.9 kJ: that energy is now spread through the air of the room. It is also why a calorimeter measurement is made at once, in an insulated cup: the solution catches the energy before it can move on to the room.
  - Note for the writer: this section describes the exothermic case only. Do not add the endothermic case or a general rule here: Check 5 asks the student to work it out, and its Why and the key points state it.
- **Check 5**, `<Check answer={3}>`: "A student runs an endothermic reaction in an open beaker on a bench, in a room at 22 °C. When the reaction ends, the mixture is at 14 °C. What happens over the next hour?" Options:
  1. The mixture stays at 14 °C, because the reaction is no longer absorbing energy
  2. The mixture passes thermal energy to the room until both are at 14 °C
  3. The room passes thermal energy to the mixture until both are near 22 °C
  4. The mixture goes on cooling, because the products of an endothermic reaction keep absorbing energy

  Why: the products are colder than their surroundings, so thermal energy passes from the bench and the air into the mixture until they reach thermal equilibrium. The room is very large beside a beaker, so the shared temperature is close to the room's 22 °C. Thermal energy does not pass from the colder body to the warmer one by itself. And once the reaction has stopped, nothing is turning thermal energy into chemical potential energy any more. Misses:
  - 1: "The mixture is colder than the room around it. What does topic 6.3 say happens when two bodies at different temperatures are in contact?"
  - 2: "Compare the two temperatures. Can a mixture at 14 °C pass thermal energy to a room at 22 °C by itself?"
  - 4: "Once the reaction is over, nothing is turning thermal energy into chemical potential energy. Only the temperature difference with the room is left."
- **Trap:** **Stopping at the energy of one experiment** (that energy is not $\Delta H$ until it is divided by the moles of reaction, and the unit of the answer is then kJ/mol). **Leaving out the sign change** (the solution's $q$ and the reaction's $q$ are equal in size and opposite in sign: a solution that warms means a negative $\Delta H$). **Reading $\Delta H$ as "per mole of" whichever substance is in the question** (it is for the equation as written; divide the moles of a substance by its coefficient). **Dividing by the moles of the reactant in excess** (the limiting reactant sets how much reaction took place). **Saying the energy comes from breaking bonds** (breaking takes energy in; an exothermic reaction releases energy because the products have less chemical potential energy than the reactants). **Thinking the products stay hot or cold** (they exchange thermal energy with the surroundings until thermal equilibrium).
- **Key points:** the enthalpy change of a reaction, $\Delta H$, is the heat released or absorbed at constant pressure, negative when the reaction releases energy and positive when it absorbs energy; $\Delta H$ belongs to the equation as written, in kJ for each mole of reaction, so the energy for any amount is the moles of reaction times $\Delta H$, and the moles of reaction are the moles of a substance divided by its coefficient; in a calorimeter, $q = mc\Delta T$ for the solution gives the size of the reaction's energy and the opposite of its sign, and that energy divided by the moles of reaction is $\Delta H$; the energy of a reaction comes from a difference in chemical potential energy between reactants and products, made by the bonds broken and formed; that difference shows up as a change in the kinetic energy of the particles, which is the temperature change you measure; after a reaction the products exchange thermal energy with their surroundings until thermal equilibrium, giving energy out after an exothermic reaction and taking it in after an endothermic one.

**Figure**

- **`6-6-calorimeter-to-delta-h.svg`** (viewBox 0 0 480 400, font-size 18). Two branches that start side by side at the top and meet in one box at the bottom. It is not a single line of boxes.
  - Left branch, "the energy", three boxes in a column, each a rounded rectangle 200 wide and 52 tall with its left edge at x = 10, light accent fill, ink outline, one line of text centered: "ΔT of the solution" at y = 20; "q of the solution" at y = 120; "q of the reaction" at y = 220. Two vertical arrows in the accent color join them, drawn at x = 50, with the operation in ink to the right of each arrow: "× mass × c" beside the first, "opposite sign" beside the second.
  - Right branch, "the amount", two boxes 200 wide with their left edges at x = 270, filled with diagonal hatching in the secondary color at low opacity (or left white with a dashed outline) so that the branches differ in shading, not in color alone: a taller box (72 tall, at y = 100) with two lines of text, "Moles of the" and "limiting reactant"; and "Moles of reaction" (52 tall, at y = 220). One vertical arrow joins them, drawn at x = 310, with "÷ coefficient" to its right.
  - The meeting: from the bottom of "q of the reaction" and from the bottom of "Moles of reaction", two arrows slant inward and down to the top of one last box, 240 wide and 56 tall, centered at x = 240, at y = 330, with an ink outline 3 units thick and a white fill: "ΔH, in kJ/mol". Between the two slanting arrows, just above the last box, the word "divide".
  - Nothing else is drawn. The branch names, the energy and the amount, are not drawn. Text in the figure, ten labels (one of them on two lines): the five box labels, the last box's label, and "× mass × c", "opposite sign", "÷ coefficient", "divide". No arrow passes behind a label.
  - Alt: "Two branches that meet. On the left, the temperature change of the solution leads, by an arrow labeled times mass times c, to q of the solution, and then, by an arrow labeled opposite sign, to q of the reaction. On the right, the moles of the limiting reactant lead, by an arrow labeled divide by coefficient, to the moles of reaction. Arrows from q of the reaction and from the moles of reaction meet at the word divide and lead to the last box, ΔH in kilojoules per mole."
  - Caption: "An enthalpy change is an energy divided by an amount. The energy comes from the thermometer and the amount from what was mixed."

**Values**

| Quantity | Value | Source |
|---|---|---|
| ΔH for 4Li(s) + O₂(g) → 2Li₂O(s) | −1,195.8 kJ/mol of reaction | twice the standard enthalpy of formation of Li₂O(s), −597.9 kJ/mol (CRC Handbook) **(verify)** |
| ΔH for 2N₂O(g) → 2N₂(g) + O₂(g) | −164 kJ/mol of reaction | minus twice the standard enthalpy of formation of N₂O(g), +82.05 kJ/mol (NIST Chemistry WebBook); some tables give +81.6, which would make it −163: **(verify)** |
| ΔH for 2HgO(s) → 2Hg(l) + O₂(g) | +182 kJ/mol of reaction | minus twice the standard enthalpy of formation of red HgO(s), −90.8 kJ/mol (CRC Handbook) |
| ΔH for Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s) | −146.4 kJ/mol of reaction (not printed in the lesson) | standard enthalpies of formation of Cu²⁺(aq), +64.8, and Ag⁺(aq), +105.6 kJ/mol (CRC Handbook) **(verify)**. With no losses the worked example's rise would be 7.00 °C; the 6.80 °C given leaves the result, −142, about 3 percent small in size |
| ΔH for ZnO(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂O(l) | about −89 kJ/mol of reaction (tables give −88.8 to −91.4, depending on the source; not printed in the lesson) | from ZnO(s) −350.5 (the value brief 6-8 prints; older tables give −348.3), Zn²⁺(aq) −153.9, H₂O(l) −285.8 kJ/mol (CRC Handbook) **(verify)**. With no losses Check 4's rise would be 8.60 °C; the 8.45 °C given leaves the result, −87.6, about 2 percent small in size |
| Specific heat capacity of water and of dilute solutions | 4.18 J/(g·°C) | the design; given in each question |
| Atomic and molar masses | Li 6.94; Cu 63.55; Ag 107.87; HgO 216.59; ZnO 81.38 g/mol | the site's `src/data/elements.ts` |

The enthalpies of formation are the fact-checker's way to confirm the four printed values. The lesson itself does not mention enthalpies of formation: they are topic 6.8's.

**Check script:** `scratchpad/unit6/checks/6-6.py`. It balances the six equations in atoms and charge, recomputes each ΔH from the formation values, every worked step, each Check's answer and each slip, and checks each message and option against this file.

**Notes for the writer**

- Write the unit as kJ/mol$_\text{rxn}$ in math and say "kJ for each mole of reaction" the first time. In a Check's question, plain text "kJ/mol of reaction" is fine. A typed-number Check's `unit` attribute is plain `kJ/mol`.
- Reversing an equation and scaling it are topic 6.9's rules. This lesson gives the one halved equation for lithium as an illustration of "as written" and does not state a rule for reversing.
- The calorimeter section is built as two halves that meet, an energy and an amount, in the text, in the worked example (amount first) and in the figure. Do not turn it back into one numbered list of four steps, and do not call it a "chain".
- Never say "heat of reaction is contained in the bonds" or that "bonds release energy when they break". Energy is released when bonds form.
- The copper and silver nitrate reaction appears twice on purpose: Check 3 asks where its warmth comes from, and the worked example then measures it.
- A sentence in words never says "negative heat": "the reaction releases 1.421 kJ", or "q for the reaction is −1.421 kJ".
- The lesson has exactly one "Beyond the exam" sentence, the one given.

**Reactions, substances and scenarios used:** $\ce{4Li(s) + O2(g) -> 2Li2O(s)}$, ΔH = −1,195.8 kJ/mol of reaction, a piece of lithium burning in a burner flame (opening, the text, and worked example 1: 0.694 g, 0.0250 mol of reaction, 29.9 kJ released; also written halved, −597.9); $\ce{2N2O(g) -> 2N2(g) + O2(g)}$, −164 (Check 1, with no scene beyond "heated strongly"); $\ce{2HgO(s) -> 2Hg(l) + O2(g)}$, +182, Priestley's 1774 experiment with a lens (Check 2: 15.0 g, 6.30 kJ absorbed); $\ce{Cu(s) + 2Ag+(aq) -> Cu^2+(aq) + 2Ag(s)}$, copper powder in silver nitrate solution in a foam cup (Check 3, and worked example 2: 1.00 g of copper, 50.0 mL of 0.400 M, 21.30 °C to 28.10 °C, −142); $\ce{ZnO(s) + 2H+(aq) -> Zn^2+(aq) + H2O(l)}$, 2.03 g of zinc oxide in 60.0 mL of 1.00 M hydrochloric acid, 22.00 °C to 30.45 °C, −87.6 (Check 4); an unnamed endothermic reaction in an open beaker at 14 °C in a 22 °C room (Check 5); cold lithium oxide powder after the flame (one sentence). The bare equation of copper with silver nitrate is also in the site's Unit 4 practice (worksheet 3, as an oxidation-number exercise, with no energy). Figure: the design's route for this lesson, drawn as two branches that meet.

**Check script:** `scratchpad/unit6/checks/6-6.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.6 Introduction to Enthalpy of Reaction`).

### Task 9: Lesson 6.7, Bond Enthalpies

**Files:**
- Create: `src/content/lessons/unit-6/6-7-bond-enthalpies.mdx`
- Create: `public/figures/6-7-broken-and-formed.svg`, `public/figures/6-7-acetaldehyde-bonds.svg`

**Brief**

- **Front matter:** `topic: "6.7"`, `minutes: 15`, summary: "How to estimate the enthalpy change of a gas-phase reaction from average bond enthalpies, as bonds broken minus bonds formed, and why the result is an estimate." (No colon in the summary.)
- **Framework (topic 6.7):** two statements. (1) In a reaction bonds are broken, formed, or both, and that changes the potential energy of the system. (2) The energy needed to break all the bonds of the reactants is estimated by adding their average bond energies, and the energy released in forming the bonds of the products is estimated the same way; if more is released than is needed the reaction is exothermic, and if more is needed than is released it is endothermic. The objective is to calculate the enthalpy change of a reaction from the average bond energies of the bonds broken and formed. Taught without a "Beyond the exam" label, as the design says: the calculation is for gases, and it is an estimate. **What this lesson does not do:** it does not re-teach ΔH, its sign, kJ/mol_rxn or scaling with the amount that reacts (topic 6.6: name it and use it); it does not draw the potential-energy curve again (topic 2.2: name it); it does not teach how to draw a Lewis diagram (topic 2.5: name it); no enthalpies of formation (topic 6.8: the "measured values" quoted here are given as measured values, with no formation table); no Hess's law (topic 6.9); no lattice energy; no activation energy (topic 5.6). **The equation sheet gives no formula for bond enthalpies**: the lesson says so. No reaction in this lesson makes or uses CO₂, so the table needs one C=O value only.
- **Opening:** for much of the last century, chemical plants made acetaldehyde, a starting material for acetic acid, out of two simple substances: acetylene and water. Nothing burns, yet the reaction gives off a good deal of energy. Where does that energy come from? Not from any one substance: it is the difference between two large numbers, the energy it takes to pull the old bonds apart and the energy given back when the new bonds form. With a table of bond strengths and a Lewis diagram of each molecule you can estimate that difference without running the reaction.
- **Section "Breaking takes energy, forming gives it back":**
  - Recall topic 2.2 in two sentences: two bonded atoms sit at the bottom of a valley of potential energy, and the bond energy is the energy needed to pull a mole of those bonds apart into separate atoms. For H–H it is 436 kJ/mol.
  - New term: a **bond enthalpy** is that same quantity, measured as an enthalpy change for a substance in the gas phase: the energy taken in when one mole of a given bond is broken, in kJ/mol. (The exam says "bond energy" and "bond enthalpy" for the same table values; say so in one clause.)
  - Two facts, as a short list. Breaking a bond takes energy in, whatever the bond: the atoms must be lifted out of the valley. Forming the same bond releases exactly as much: the atoms fall back in. So a bond enthalpy read from the table is an amount taken in when that bond breaks and an amount released when it forms.
  - `<KeyIdea>`: breaking a bond takes energy in. Forming a bond releases energy. No bond releases energy by breaking.
  - Note for the writer: do not use an image of money, an account, a deposit or a price. Do not say here which stage of a welding torch releases energy: Check 1 asks.
- **Check 1**, `<Check answer={2}>`: "In atomic hydrogen welding, an electric arc splits hydrogen molecules into separate atoms. The atoms drift to the steel being welded and join into H₂ molecules again on its surface. The H–H bond enthalpy is 436 kJ/mol. Where is energy released, and how much for each mole of H₂?" Options, in order:
  1. In the arc, 436 kJ, as the H–H bonds break
  2. At the steel, 436 kJ, as H–H bonds form
  3. At the steel, 872 kJ, as two atoms each give 436 kJ
  4. In the arc and at the steel, 436 kJ each time

  Why: breaking bonds takes energy in, so the arc supplies 436 kJ for every mole of H₂ it splits. Forming the same bonds releases the same 436 kJ, and that happens on the steel: it is the energy that melts the metal. The first option has the bond breaking give energy out, which no bond does. The third counts 436 kJ for each atom, but 436 kJ belongs to a mole of bonds, and it takes two atoms to make one bond. The fourth has energy released twice: breaking and forming the same bond are opposite changes, so one takes in what the other gives out.

  Misses:
  - 1: "Pulling two bonded atoms apart is a climb out of the valley of topic 2.2. Does a climb take energy in or give it out?"
  - 3: "A bond enthalpy is counted for a mole of bonds. How many H atoms does it take to make one H–H bond?"
  - 4: "Breaking a bond and forming the same bond are opposite changes. Can both of them release energy?"
- **Section "A reaction as two totals":**
  - Picture the reaction done in two stages, even though no real reaction goes this way. Stage one: pull every reactant molecule apart into separate atoms. That takes in the sum of the bond enthalpies of all the bonds in the reactants. Stage two: let those atoms join up as the products. That releases the sum of the bond enthalpies of all the bonds in the products. The enthalpy change of the reaction is what is left over.
  - As a block, in words inside the math: ΔH ≈ (sum of bond enthalpies of bonds broken) − (sum of bond enthalpies of bonds formed). Use `\approx`, and write the two sums with `\text{}`; split over two lines with `aligned`.
  - Read the sign off the two totals. If forming the new bonds releases more than breaking the old ones took in, the difference is negative and the reaction is exothermic. If breaking took more than forming gave back, it is positive and the reaction is endothermic (topic 6.6 for the sign of ΔH).
  - One sentence: this formula is **not on the equation sheet**. One more: it is "broken minus formed", reactants' bonds first. That is the opposite order from "products minus reactants", which you will meet in topic 6.8, because a bond enthalpy is the energy to take something apart.
  - Why the detour through atoms is allowed, in one sentence and no more: the enthalpy change depends on where the reaction starts and ends, not on the route between (topic 6.9 makes this exact).
  - Place figure `6-7-broken-and-formed.svg` here. It uses the numbers of the first worked example; say "the numbers are worked out below".
- **Figure** `6-7-broken-and-formed.svg` (viewBox 480 × 380, font-size 18): an enthalpy diagram with three levels.
  - A vertical axis arrow at x = 40 from y = 350 up to y = 30, labeled "Enthalpy" (rotated, reading upward). No numbers on the axis.
  - Level A, a horizontal line from x = 70 to x = 200 at y = 290, labeled under it "C₂H₂ + H₂O".
  - Level B, a horizontal line from x = 170 to x = 330 at y = 60, labeled above it "2 C + 4 H + O atoms".
  - Level C, a horizontal line from x = 300 to x = 430 at y = 320, labeled under it "CH₃CHO".
  - A solid ink arrow pointing up at x = 130 from level A to level B, with two lines of text to its right: "bonds broken" and "+2,591 kJ".
  - A dashed accent arrow pointing down at x = 370 from level B to level C, with two lines of text to its left: "bonds formed" and "−2,744 kJ".
  - Between x = 215 and x = 285, two thin dotted guide lines continue levels A and C toward each other, and a short double-headed bracket spans the gap between y = 290 and y = 320. Its label, placed above the guides at about y = 250: "ΔH ≈ −153 kJ".
  - The up arrow and the down arrow differ in dash pattern as well as color. No label is longer than 19 characters.
  - Alt: "An enthalpy diagram with three levels. The reactants, acetylene and water, are on a level at the lower left. A solid arrow labeled bonds broken, plus 2,591 kilojoules, rises from them to the top level, the separate atoms: 2 carbon, 4 hydrogen and 1 oxygen. A dashed arrow labeled bonds formed, minus 2,744 kilojoules, falls from the atoms to the product, acetaldehyde, on a level at the lower right, a little below the reactants. The gap between the reactants and the product is labeled delta H is about minus 153 kilojoules."
  - Caption: "Up by the bonds broken, down by the bonds formed. What is left is the enthalpy change. The gap is drawn larger than its true size so that it can be seen."
- **Section "Counting bonds from Lewis diagrams":**
  - The arithmetic is easy. The counting is where points are lost. Draw the Lewis diagram of every reactant and product (topic 2.5), then list each kind of bond with how many there are. A double or a triple bond is one bond with its own value, not two or three single bonds: C=C is 614 kJ/mol, and two C–C would be 694 (topic 2.2).
  - The table for this lesson (four columns, short cells). Say that these are **average bond enthalpies**, and that a question on the exam gives the values it wants used.

    | Bond | kJ/mol | Bond | kJ/mol |
    |---|---|---|---|
    | H–H | 436 | C–H | 413 |
    | C–C | 347 | C=C | 614 |
    | C–O | 358 | C=O | 745 |
    | O–H | 463 | O=O | 495 |
    | N–H | 391 | N≡N | 941 |
    | H–Cl | 431 | Cl–Cl | 243 |
    | C≡C | 839 | | |

  - Place figure `6-7-acetaldehyde-bonds.svg` here, just before the worked example.
- **Figure** `6-7-acetaldehyde-bonds.svg` (viewBox 480 × 430, font-size 18): the reaction of the first worked example with every bond drawn as a line, atoms as letters, lone pairs left out.
  - Top row, centered on y = 90. Acetylene, drawn in a straight line: H at (40, 90), C at (95, 90), C at (165, 90), H at (220, 90); each H joined to its C by one line, and the two C joined by three parallel lines. A plus sign at (270, 90). Water centered at x = 355: O at (355, 75), H at (315, 120) and (395, 120), each bonded to O.
  - Under acetylene at y = 185: "1 C≡C, 2 C–H". Under water at y = 185: "2 O–H".
  - A down arrow at x = 240 from y = 205 to y = 245.
  - Bottom row, centered on y = 320. Acetaldehyde: C at (170, 320) and (250, 320) joined by one line. On the first C, three H: at (110, 320), (170, 262) and (170, 378). On the second C, one H at (250, 262), and an O at (330, 320) joined to it by two parallel lines.
  - Under acetaldehyde at y = 418: "1 C–C, 4 C–H, 1 C=O".
  - Every bond line stops short of the letters it joins. All bonds are drawn alike, in ink; nothing is distinguished by color.
  - Alt: "Structural drawings for counting bonds. In the top row are acetylene, two carbon atoms joined by a triple bond with one hydrogen atom on each carbon, labeled 1 C≡C, 2 C–H, then a plus sign, then water, an oxygen atom holding two hydrogen atoms, labeled 2 O–H. An arrow points down to acetaldehyde: two carbon atoms joined by a single bond, the first holding three hydrogen atoms and the second holding one hydrogen atom and an oxygen atom joined to it by a double bond. Acetaldehyde is labeled 1 C–C, 4 C–H, 1 C=O."
  - Caption: "Every bond in the reactants goes on the broken list and every bond in the product on the formed list. Lone pairs are left out of the drawing."
- **Worked example "Acetaldehyde from acetylene and water":** estimate ΔH for the reaction of the old acetaldehyde plants, with every substance taken as a gas. The equation as a block: $\ce{C2H2(g) + H2O(g) -> CH3CHO(g)}$.
  1. **Draw and count the reactants' bonds.** Acetylene, H–C≡C–H: 1 C≡C and 2 C–H. Water, H–O–H: 2 O–H.
  2. **Draw and count the product's bonds.** Acetaldehyde, CH₃–CH=O: 1 C–C, 4 C–H and 1 C=O.
  3. **Add up the bonds broken.** As a block, numbers only, split with `aligned`: 839 + 2(413) + 2(463) = 839 + 826 + 926 = 2,591 kJ.
  4. **Add up the bonds formed.** As a block, split with `aligned`: 347 + 4(413) + 745 = 347 + 1,652 + 745 = 2,744 kJ.
  5. **Broken minus formed.** As a block: ΔH ≈ 2,591 − 2,744 = −153 kJ/mol_rxn. Forming releases more than breaking takes in, so the reaction is exothermic.
  6. **A shortcut, and why it is safe.** Two C–H bonds are in both lists, and they cancel in the subtraction. Counting only what changes gives the same answer: broken, 1 C≡C and 2 O–H, 839 + 926 = 1,765 kJ; formed, 1 C–C, 2 C–H and 1 C=O, 347 + 826 + 745 = 1,918 kJ; 1,765 − 1,918 = −153 kJ. Use the shortcut only when you are sure which bonds are untouched. Counting everything always works.

  Notes for the writer: the reaction is real (the hydration of acetylene, the main route to acetaldehyde until the 1960s). The plants bubbled acetylene into hot water holding an acid and a mercury catalyst; say only "with a catalyst", name no catalyst, and keep "with every substance taken as a gas", because Check 5 turns on the water being a liquid. The measured value for all gases, −152 kJ/mol_rxn, comes in the last section: do not give it here. Acetaldehyde boils at 20 °C, so it is a gas at 25 °C.
- **Check 2**, `<Check numeric="53" unit="kJ/mol">`: "Acetone is made by passing the vapor of 2-propanol over a hot copper catalyst (as a block equation): $\ce{(CH3)2CHOH(g) -> (CH3)2CO(g) + H2(g)}$. In 2-propanol the middle carbon holds one H atom and an O–H group. In acetone that carbon is joined to the oxygen by a double bond. The two CH₃ groups are the same before and after. Use the table to estimate ΔH. Give it with its sign." Why, each sum as a block: three bonds are broken, the C–H on the middle carbon, the C–O and the O–H: 413 + 358 + 463 = 1,234 kJ. Two are formed, the C=O and the H–H of hydrogen gas: 745 + 436 = 1,181 kJ. ΔH ≈ 1,234 − 1,181 = +53 kJ/mol_rxn. Breaking takes in more than forming gives back, so the reaction is endothermic: the plant has to keep heating the catalyst. Counting every bond gives the same answer: 2 C–C, 7 C–H, 1 C–O and 1 O–H broken, 4,406 kJ; 2 C–C, 6 C–H, 1 C=O and 1 H–H formed, 4,353 kJ. The measured value is about +55 kJ/mol_rxn (verify).

  Slips (value, from, message):
  - `-53`, formed minus broken: "Did you subtract in the order formed minus broken? Breaking takes energy in, so the bonds broken come first."
  - `-305`, the C–O bond left off the broken list: "Did you leave the C–O single bond off the broken list? The C=O bond in acetone is a new bond that takes its place."
  - `440`, the C–O value used for acetone's C=O: "Did you use the C–O value for the carbon–oxygen bond in acetone? In acetone that bond is double."
  - `489`, the H–H bond left off the formed list: "Did you count the H–H bond? Hydrogen gas is a product, and its bond is formed too."
  - `1234`, the bonds broken only: "That is the energy taken in to break the three bonds. Now subtract the energy released as the new bonds form."
  - `1181`, the bonds formed only: "That is the energy released as the new bonds form. Compare it with the energy taken in to break the old ones."

  Notes for the writer: the reaction is real (dehydrogenation of 2-propanol over copper or zinc oxide catalysts, at 300 °C or more) and is endothermic. The answer is positive, so a typed 53 and a typed +53 are both the answer. The unit attribute is "kJ/mol", as in the brief for lesson 6.6; the question's words say that the value is for the equation as written.
- **Section "Coefficients multiply the count":** two multipliers, not one. The number of a bond in one molecule (water has two O–H bonds), times the coefficient of that molecule in the equation. 3 H₂O means six O–H bonds. Then say that the next Check is about the counting alone.
- **Check 3**, `<Check answer={4}>`: "Hydrogen cyanide is made by passing methane and ammonia over platinum at about 1,200 °C (as a block equation): $\ce{CH4(g) + NH3(g) -> HCN(g) + 3H2(g)}$. In HCN the carbon is bonded to the hydrogen by a single bond and to the nitrogen by a triple bond. Counting every bond in the products, which list of bonds formed is right?" Options, in order:
  1. One C≡N and three H–H, since methane already had a C–H
  2. One C–H, one C≡N and one H–H
  3. One C–H, one C≡N and six H–H
  4. One C–H, one C≡N and three H–H

  Why: HCN is H–C≡N: one C–H bond and one C≡N bond. The coefficient 3 on H₂ makes three H–H bonds. That is five bonds formed. The first option leaves out the C–H of HCN. When every bond is counted, every bond of every product goes on the formed list, and all four C–H bonds of methane go on the broken list, so nothing is lost. The second ignores the coefficient of H₂. The third counts six hydrogen atoms where it should count three H₂ molecules: each H–H bond joins two atoms.

  Misses:
  - 1: "That shortcut is safe only when the broken list skips the same bond. Here every bond is counted, so go through each product atom by atom."
  - 2: "Look at the coefficients. How many molecules of each product does the equation show?"
  - 3: "Each H–H bond joins two hydrogen atoms. Count molecules of H₂, not atoms of H."

  Note for the writer: no bond enthalpy for C≡N is given and no ΔH is asked for. The reaction is real (the BMA process) and strongly endothermic; do not give a value.
- **Worked example "Chlorine back from hydrogen chloride":** many chemical plants end up with hydrogen chloride gas they do not want. One way to use it is to turn it back into chlorine with oxygen over a hot catalyst. Estimate ΔH. The equation as a block: $\ce{4HCl(g) + O2(g) -> 2Cl2(g) + 2H2O(g)}$.
  1. **Count the bonds broken, with the coefficients.** HCl has one H–Cl bond, and there are 4 HCl: 4 H–Cl. O₂ has one O=O double bond: 1 O=O.
  2. **Count the bonds formed, with the coefficients.** Cl₂ has one Cl–Cl bond, and there are 2 Cl₂: 2 Cl–Cl. H₂O has two O–H bonds, and there are 2 H₂O: 4 O–H.
  3. **Bonds broken.** As a block: 4(431) + 495 = 1,724 + 495 = 2,219 kJ.
  4. **Bonds formed.** As a block: 2(243) + 4(463) = 486 + 1,852 = 2,338 kJ.
  5. **Broken minus formed.** As a block: ΔH ≈ 2,219 − 2,338 = −119 kJ/mol_rxn. Exothermic.
  6. **What the slips would give.** Formed minus broken gives +119 kJ, the right size with the wrong sign. One O–H for each water gives 2,219 − 1,412 = +807 kJ. No coefficients at all gives (431 + 495) − (243 + 926) = −243 kJ.

  Note for the writer: this is the Deacon reaction; do not name it. Say "over a hot catalyst" and give no temperature. The measured value, −114 kJ/mol_rxn, comes in the last section.
- **Check 4**, `<Check numeric="-452" unit="kJ/mol">`: "A chlorine plant checks its pipes for leaks with ammonia vapor. Where chlorine is escaping, the two gases react (as a block equation): $\ce{2NH3(g) + 3Cl2(g) -> N2(g) + 6HCl(g)}$. With ammonia to spare, the HCl goes on to make a white smoke of ammonium chloride, and the smoke shows where the leak is. Use the table to estimate ΔH for the equation as written. Give it with its sign." Why, each sum as a block: NH₃ has three N–H bonds, and there are 2 NH₃: 6 N–H. Three Cl₂ have 3 Cl–Cl. Broken: 6(391) + 3(243) = 2,346 + 729 = 3,075 kJ. N₂ has one N≡N triple bond, and 6 HCl have 6 H–Cl. Formed: 941 + 6(431) = 941 + 2,586 = 3,527 kJ. ΔH ≈ 3,075 − 3,527 = −452 kJ/mol_rxn. The measured value is −462 kJ/mol_rxn.

  Slips (value, from, message):
  - `452`, the sign lost or formed minus broken: "Is that formed minus broken, or a sign left off? Compare the two totals: which is larger, the energy taken in or the energy released?"
  - `-738`, no coefficients and one bond for each molecule: "That is what one N–H, one Cl–Cl and one H–Cl give. Multiply each bond by its number in the molecule and by the coefficient."
  - `-1625`, three N–H in place of six: "Did you count three N–H bonds? The equation has two NH₃ molecules."
  - `-2016`, one N–H for each NH₃: "Each NH₃ molecule has three N–H bonds, and the equation has two NH₃. Count the N–H bonds again."
  - `-938`, one Cl–Cl in place of three: "Did you count one Cl–Cl bond? Check the coefficient of Cl₂."
  - `1703`, one H–Cl in place of six: "Did you count one H–Cl bond? Check the coefficient of HCl."
  - `44`, coefficients left out: "Did the coefficients go in? Multiply the bonds in one molecule by the number of molecules the equation shows."

  Note for the writer: the leak test is real, and so is the gas-phase reaction. The estimate is for the equation shown, with HCl gas as the product; the smoke is a second reaction and is not part of the calculation.
- **Section "Why the answer is an estimate":**
  - **The table holds averages.** A C–H bond is not equally strong in every molecule, or even at every stage in one molecule. Pulling the four hydrogen atoms off methane one after another takes about 439, 462, 424 and 338 kJ/mol (verify). The table's 413 is an average over C–H bonds in many compounds. The same goes for C–C, C–O, O–H and N–H. A bond that exists in one molecule alone, such as H–H or Cl–Cl, is different: its value is exact for that molecule.
  - **The table is for gases.** A bond enthalpy covers the bonds inside molecules, each molecule on its own. In a liquid or a solid, the attractions between the particles (topic 3.1) change in a reaction as well, and the bond count knows nothing about them. So the method is used when every reactant and product is a gas. Do not say here which way a liquid reactant or product shifts the answer: Check 5 asks.
  - **How good is it?** A three-column table:

    | Reaction | Estimate (kJ/mol_rxn) | Measured (kJ/mol_rxn) |
    |---|---|---|
    | Acetylene + steam → acetaldehyde | −153 | −152 |
    | 4 HCl + O₂ → 2 Cl₂ + 2 H₂O | −119 | −114 |

    Close, and not exact. Part of the gap comes from the table itself, whose values are rounded. A difference of 5 or 10 kJ is ordinary, and it is not a sign of an arithmetic mistake. When a question gives measured data (topic 6.8 shows the usual kind), that is the better answer; bond enthalpies are for when there is nothing else, or when the question asks for them.
- **Check 5**, `<Check answer={1}>`: "The estimate of the first worked example, −153 kJ/mol_rxn, takes every substance as a gas. In the old acetaldehyde plants the water was a liquid, and the acetylene was bubbled into it. With liquid water as the reactant, and the acetylene and the acetaldehyde still gases, how does the measured enthalpy change compare with the estimate?" Options, in order:
  1. Less negative: separating water molecules takes energy in
  2. The same: the same bonds are broken and the same bonds are formed
  3. More negative: liquid water gives out energy as its molecules come apart
  4. Positive: turning liquid water into a gas breaks its O–H bonds first

  Why: the bond count covers the bonds inside the molecules, with everything a gas. In liquid water the molecules hold on to one another by hydrogen bonds (topic 3.1). Before a water molecule can react as the count supposes, those attractions have to be overcome, and that takes energy in: about 44 kJ for each mole of water at 25 °C. So less energy is released overall: about −108 kJ/mol_rxn measured with liquid water, against −152 with steam. The second option forgets the attractions between molecules. The third has separating the molecules of a liquid give energy out, when it takes energy in (topic 6.5). The fourth breaks bonds inside the molecules, but a change of phase leaves them as they are (topic 4.4).

  Misses:
  - 2: "The bonds inside the molecules are the same, yes. But is anything else different between liquid water and steam?"
  - 3: "Think of topic 6.5. When the molecules of a liquid are separated, does the substance take energy in or give it out?"
  - 4: "A change of phase changes the attractions between molecules. The bonds inside each molecule stay as they are."
- **Trap:** **Formed minus broken** (it is broken minus formed: the energy taken in comes first. Check with the totals: if forming releases more, the answer must be negative). **Forgetting a multiplier** (count the bonds in one molecule, then multiply by the coefficient: 2 H₂O is four O–H bonds). **Treating a double bond as two single bonds** (C=C is 614 kJ/mol, not 2 × 347). **Saying that breaking a bond releases energy** (breaking takes energy in for every bond; the energy of an exothermic reaction comes from the bonds that form). **Using the method where a liquid or a solid takes part** (the table is for gases; attractions between molecules are not in it). **Expecting the measured value** (averages give an estimate; in this lesson's reactions it lands within about 10 kJ of the measured value, and it can be further off).
- **Key points:** breaking a bond takes energy in and forming a bond releases energy, and a bond enthalpy is the amount for a mole of that bond, in kJ/mol; the enthalpy change of a reaction is estimated as the sum of the bond enthalpies of the bonds broken minus the sum for the bonds formed, a formula that is not on the equation sheet; if forming the new bonds releases more than breaking the old ones takes in, ΔH is negative and the reaction is exothermic, and the other way around it is endothermic; bonds are counted from Lewis diagrams, as the number of each bond in a molecule times the molecule's coefficient, and a double or triple bond has its own value; the result is an estimate because the table values are averages over many compounds; the method is for reactions in which every substance is a gas, since it leaves out the attractions between molecules.

**Check script:** `scratchpad/unit6/checks/6-7.py`.

**Values**

| Quantity | Value (kJ/mol) | Source |
|---|---|---|
| H–H | 436 | the site, lesson 2.2 (and 4.4) |
| C–C, C=C, C≡C | 347, 614, 839 | the site, lesson 2.2 |
| Cl–Cl | 243 | the site, lesson 2.2 (and 4.4) |
| C–H, C–O, O–H, O=O, N–H, N≡N, H–Cl | 413, 358, 463, 495, 391, 941, 431 | the table of average bond enthalpies printed in general chemistry texts (Brown, LeMay and Bursten's table has these seven) |
| C=O | 745 | general chemistry tables (Zumdahl, Chang) for C=O other than in CO₂; tables give 799 for CO₂, which this lesson does not use (verify that 745 is the value wanted for acetone) |
| C–H steps in methane | 439, 462, 424, 338 | bond dissociation enthalpies at 298 K, CRC Handbook (verify; their sum, 1,663, is the atomization enthalpy of methane) |
| ΔH, C₂H₂(g) + H₂O(g) → CH₃CHO(g) | −151.8 | from ΔHf° in the CRC Handbook: CH₃CHO(g) −166.2 (verify), C₂H₂(g) +227.4 (as in lesson 6.8), H₂O(g) −241.8 |
| ΔH, 4 HCl(g) + O₂(g) → 2 Cl₂(g) + 2 H₂O(g) | −114.4 | from ΔHf°: HCl(g) −92.3, H₂O(g) −241.8 |
| ΔH, (CH₃)₂CHOH(g) → (CH₃)₂CO(g) + H₂(g) | +55.5 | from ΔHf°: 2-propanol(g) −272.6, acetone(g) −217.1 (verify both) |
| ΔH, 2 NH₃(g) + 3 Cl₂(g) → N₂(g) + 6 HCl(g) | −462.0 | from ΔHf°: NH₃(g) −45.9, HCl(g) −92.3 |
| Water, liquid to gas, at 25 °C | 44.0 | −241.8 − (−285.8), as in lesson 6.8; with liquid water the reaction is −107.8 |

**Reactions, substances and scenarios used:** acetaldehyde made from acetylene and water in the plants of the last century (opening, both figures, first worked example with every substance a gas, the comparison table, and Check 5 with the water a liquid); atomic hydrogen welding, H₂ split in an arc and re-formed on steel (Check 1); 2-propanol vapor over hot copper giving acetone and hydrogen (Check 2); methane and ammonia over platinum giving hydrogen cyanide and hydrogen, bond lists only (Check 3); hydrogen chloride and oxygen over a hot catalyst giving chlorine and steam (second worked example and the comparison table); the ammonia test for a chlorine leak, 2 NH₃ + 3 Cl₂ → N₂ + 6 HCl, with the ammonium chloride smoke named (Check 4); the four C–H bond-breaking steps of methane (the estimate section, numbers only). No reaction burns anything, and none makes or uses CO₂. The bond energies H–H 436, C–C 347, C=C 614, C≡C 839 and Cl–Cl 243 are the site's own. Ethene, ethanol and steam-to-ethanol no longer appear.

**Check script:** `scratchpad/unit6/checks/6-7.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.7 Bond Enthalpies`).

### Task 10: Lesson 6.8, Enthalpy of Formation

**Files:**
- Create: `src/content/lessons/unit-6/6-8-enthalpy-of-formation.mdx`
- Create: `public/figures/6-8-formation-ladder.svg`

**Brief**

- **Front matter:** `topic: "6.8"`, `minutes: 16`, summary: "What a standard enthalpy of formation is, why an element in its standard state has a value of zero, and how a table of these values gives the enthalpy change of a reaction." (No colon in the summary.)
- **Framework (topic 6.8):** one statement. Tables of standard enthalpies of formation are used to calculate standard enthalpies of reaction: the sum for the products minus the sum for the reactants, each value multiplied by its coefficient. The objective is to calculate the enthalpy change of a chemical or physical process from standard enthalpies of formation. Taught without a "Beyond the exam" label, as the design says: the standard state, and that the enthalpy of formation of an element in its standard state is zero. **On the equation sheet:** ΔH°reaction = Σ ΔHf° products − Σ ΔHf° reactants, printed with no coefficients, so the lesson says that the coefficients are the student's to supply. **What this lesson does not do:** it does not re-teach ΔH, its sign, kJ/mol_rxn or scaling with amount (topic 6.6: name it and use it); it gives the reason the formula works in three sentences and leaves the rules for combining equations to topic 6.9; it does not use bond enthalpies (topic 6.7), and only contrasts the order of subtraction; no entropy or Gibbs energy (Unit 9); no fuel values. No combustion of a fuel appears in this lesson.
- **Opening:** a plant that makes silicon for solar cells and computer chips feeds quartz and carbon into an electric furnace, and the furnace runs day and night on a very large supply of electricity. How much energy does the reaction itself have to take in? Nobody needs to measure it in that furnace. For each compound there is one number in a table, and from those numbers the enthalpy change of any reaction among the substances in the table comes out by multiplying, adding and subtracting.
- **Section "One number for each compound":**
  - New term: the **standard enthalpy of formation** of a compound, ΔHf°, is the enthalpy change when one mole of the compound forms from its elements, with each element in its standard state (the next section says what that is). Its unit is kJ/mol, for a mole of the compound formed.
  - The reaction it belongs to is the compound's **formation reaction**. For quartz, as a block: $\ce{Si(s) + O2(g) -> SiO2(s)}$, ΔHf° = −910.7 kJ/mol. Forming a mole of quartz from silicon and oxygen releases 910.7 kJ.
  - A formation reaction does not have to be one that anyone can run. For baking soda, sodium hydrogen carbonate, as a block split after the arrow: $\ce{Na(s) + 1/2 H2(g) + C(s, graphite) + 3/2 O2(g) -> NaHCO3(s)}$, ΔHf° = −950.8 kJ/mol. Nobody makes baking soda by mixing sodium, hydrogen, graphite and oxygen. The value is worked out from reactions that can be measured (topic 6.9 shows how), and it is just as useful as if the reaction ran.
  - Three rules for writing a formation reaction, as a list: the compound is the only product, and there is exactly one mole of it; the reactants are elements, nothing else; fractions are allowed as coefficients, and are often needed to keep the product at one mole.
  - Note for the writer: write graphite as `C(s, graphite)` in the equation. Do not mention diamond anywhere in this lesson. Do not use carbon monoxide or water as the example of a formation reaction.
- **Check 1**, `<Check answer={3}>`: "Hydrogen bromide, HBr, is a gas at 25 °C. At 25 °C and 1 bar, bromine is a liquid and hydrogen is a gas. Which equation is the formation reaction of HBr(g), the one whose enthalpy change is its ΔHf°?" The four equations are listed in the question as blocks lettered A to D:
  - A: $\ce{H2(g) + Br2(l) -> 2HBr(g)}$
  - B: $\ce{1/2 H2(g) + 1/2 Br2(g) -> HBr(g)}$
  - C: $\ce{1/2 H2(g) + 1/2 Br2(l) -> HBr(g)}$
  - D: $\ce{H(g) + Br(g) -> HBr(g)}$

  Options, in order:
  1. Equation A
  2. Equation B
  3. Equation C
  4. Equation D

  Why: equation C makes one mole of HBr from its elements as they are found at 25 °C and 1 bar: hydrogen gas and liquid bromine. Equation A makes two moles, so its enthalpy change is twice ΔHf°. Equation B starts from bromine vapor, which is not the form bromine takes at 25 °C and 1 bar, so its enthalpy change differs from ΔHf° by the energy needed to vaporize half a mole of bromine. Equation D starts from separate atoms: its enthalpy change is the energy released when a mole of H–Br bonds forms (topic 6.7), a different quantity.

  Misses:
  - 1: "Count the moles of HBr this equation makes. A formation value is for how many moles of the compound?"
  - 2: "Check the state written for each element against the states the question gives for 25 °C and 1 bar."
  - 4: "Separate atoms are not the form in which hydrogen and bromine are found at 25 °C and 1 bar. What is?"

  Note for the writer: the four options are equally long, so none is the longest.
- **Section "The standard state, and why elements are zero":**
  - New term: the **standard state** of a substance is its pure form at a pressure of 1 bar (very nearly 1 atm). Tables give values at 25 °C, so for an element the standard state is normally the form that is most stable at 25 °C and 1 bar: O₂(g) for oxygen, not O₃ and not separate O atoms; Br₂(l) for bromine; N₂(g) for nitrogen; Na(s) for sodium; graphite for carbon. The little circle in ΔH° and ΔHf° says "everything in its standard state".
  - Note for the writer: keep "normally" (white phosphorus is the reference form of phosphorus though it is not the most stable one); do not explain the exception.
  - The zero. The formation reaction of an element in its standard state would be, for example, O₂(g) → O₂(g): nothing changes, so the enthalpy change is zero. **ΔHf° of an element in its standard state is 0**, exactly, by definition. It is not left out of a calculation; it goes in as zero.
  - The zero is only for that form. Bromine vapor, Br₂(g), has ΔHf° = +30.9 kJ/mol: at 25 °C it takes 30.9 kJ to turn a mole of liquid bromine into vapor. Separate hydrogen atoms, H(g), have ΔHf° = +218.0 kJ/mol, half of the H–H bond enthalpy (topic 6.7), because each mole of H₂ gives two moles of atoms.
  - The sign of a compound's value. Most compounds have a negative ΔHf°: forming them from their elements releases energy. A few are positive. Acetylene, C₂H₂(g), is +227.4 kJ/mol: forming it from graphite and hydrogen takes energy in.
  - `<KeyIdea>`: ΔHf° is the enthalpy change for forming one mole of a compound from its elements in their standard states. For an element in its standard state it is zero.
  - The lesson's table (four columns), placed here. Heading note: "ΔHf° at 25 °C, in kJ/mol".

    | Substance | ΔHf° | Substance | ΔHf° |
    |---|---|---|---|
    | SiO₂(s) | −910.7 | CO(g) | −110.5 |
    | H₂O(l) | −285.8 | H₂O(g) | −241.8 |
    | CaC₂(s) | −59.8 | Ca(OH)₂(s) | −985.2 |
    | C₂H₂(g) | +227.4 | NaHCO₃(s) | −950.8 |

    One sentence under it: water is in the table twice, because the liquid and the gas are different states with different values. Use the one the equation shows.
- **Check 2**, `<Check answer={1}>`: "At 25 °C and 1 bar, mercury is a liquid, and iodine and iron are solids. Which of these has a standard enthalpy of formation of exactly zero?" Options, in order:
  1. Hg(l), liquid mercury
  2. I₂(g), iodine as a vapor
  3. H₂O(l), water as a liquid
  4. Fe(l), iron when it is molten

  Why: the zero belongs to an element in its standard state, and liquid mercury is one. Iodine vapor is an element, but iodine's standard state is the solid, so the vapor's value is positive (+62.4 kJ/mol at 25 °C: energy is taken in to turn the solid into vapor). Water is a compound: its value is −285.8 kJ/mol. Molten iron is an element in a state that is not its standard state.

  Misses:
  - 2: "Iodine is an element, but in which state is it found at 25 °C and 1 bar? The zero belongs to that state."
  - 3: "The zero is for an element in its standard state. Is water an element?"
  - 4: "Iron is an element, but compare the state written here with the state the question gives for 25 °C and 1 bar."
- **Section "From the table to any reaction":**
  - The idea, in three sentences. Picture the reaction going by way of the elements. First the reactants are taken apart into their elements: for each reactant that is its formation reaction run backward, so it costs the opposite of its ΔHf°. Then the elements are put together as the products: each product brings in its ΔHf°. The route through the elements starts and ends where the direct reaction does, so it has the same enthalpy change (topic 6.9 gives the reason).
  - `<KeyIdea>`, with the formula as a block, split over two lines with `aligned`: ΔH° = Σ n ΔHf°(products) − Σ n ΔHf°(reactants), where n is each substance's coefficient in the balanced equation.
  - Three sentences after it. This formula is on the equation sheet, but printed without the n: the coefficients are yours to put in. The answer is the standard enthalpy change for the equation as written, in kJ/mol_rxn (topic 6.6). And notice the order: products minus reactants. For bond enthalpies (topic 6.7) it was the reactants' bonds first. The two orders are different because the two tables hold different things: a bond enthalpy is the energy to take a substance apart, and an enthalpy of formation is the enthalpy change of putting it together.
  - One more sentence: unlike a bond-enthalpy estimate, this is not an estimate, and it works for solids, liquids and gases alike, because each value belongs to that substance in that state.
  - Place figure `6-8-formation-ladder.svg` after the worked example's statement and before its steps, or directly after the worked example if that reads better.
- **Worked example "The silicon furnace":** find ΔH° for the furnace reaction. The equation as a block: $\ce{SiO2(s) + 2C(s, graphite) -> Si(s) + 2CO(g)}$.
  1. **Write a value under every substance.** SiO₂(s): −910.7. C(s, graphite): 0, an element in its standard state. Si(s): 0, the same. CO(g): −110.5.
  2. **Add up the products, with coefficients.** As a block: 1(0) + 2(−110.5) = −221.0 kJ.
  3. **Add up the reactants, with coefficients.** As a block: 1(−910.7) + 2(0) = −910.7 kJ.
  4. **Products minus reactants.** As a block: ΔH° = −221.0 − (−910.7) = +689.7 kJ/mol_rxn. Subtracting a negative number adds it.
  5. **Does it make sense?** The answer is positive: the reaction takes energy in, which is what the electricity is for. One mole of silicon is 28.09 g, so a kilogram is 1,000 ÷ 28.09 = 35.60 mol, and making it takes in 35.60 × 689.7 = 2.46 × 10⁴ kJ (topic 6.6). The real furnace uses more, because it also has to heat everything to about 2,000 °C.

  Notes for the writer: the reaction is the real one (carbothermic reduction of quartz in a submerged-arc furnace). ΔH° is for reactants and products at 25 °C; do not claim it is the furnace's whole energy use. Keep the zeros written out in steps 2 and 3.
- **Figure** `6-8-formation-ladder.svg` (viewBox 480 × 400, font-size 18): three enthalpy levels for the silicon furnace, to scale at 0.3 units for each kJ.
  - A vertical axis at x = 40 from y = 380 up to y = 30 with an arrowhead at the top, labeled "Enthalpy" (rotated).
  - Level E (0 kJ), a horizontal line from x = 70 to x = 440 at y = 70. Label above it, centered: "Elements: Si + 2 C + O₂". At its left end, on the axis side, the tick label "0".
  - Level P (−221.0 kJ), a horizontal line from x = 220 to x = 440 at y = 136. Label under it, centered at x = 345: "Si + 2 CO".
  - Level R (−910.7 kJ), a horizontal line from x = 70 to x = 290 at y = 343. Label under it, centered at x = 180: "SiO₂ + 2 C".
  - A dashed secondary-color arrow pointing down at x = 110 from level E to level R, labeled to its right "−910.7 kJ".
  - A dashed secondary-color arrow pointing down at x = 400 from level E to level P, labeled to its left "−221.0 kJ".
  - A solid heavy accent arrow pointing up at x = 255 from level R to level P (both lines reach x = 255). Its label, to the right of the arrow at about y = 250: "ΔH° = +689.7 kJ".
  - The two formation arrows are dashed and thin; the reaction arrow is solid and heavy. They differ in dash pattern and weight as well as color. No label is longer than 23 characters.
  - Alt: "An enthalpy diagram with three levels. At the top, at zero, are the elements: silicon, 2 carbon and oxygen. A dashed arrow labeled minus 910.7 kilojoules falls from the elements to the lowest level, the reactants, silicon dioxide and 2 carbon. A second dashed arrow labeled minus 221.0 kilojoules falls from the elements to a level in between, the products, silicon and 2 carbon monoxide. A heavy solid arrow rises from the reactants to the products, labeled delta H standard equals plus 689.7 kilojoules."
  - Caption: "Each side of the equation is placed below the elements by the sum of its formation values. The reaction is the step from one level to the other: products minus reactants."
- **Check 3**, `<Check numeric="-809.7" unit="kJ/mol">`: "A strip of burning magnesium lowered into a jar of carbon dioxide goes on burning. White magnesium oxide and black specks of carbon are left (as a block equation): $\ce{2Mg(s) + CO2(g) -> 2MgO(s) + C(s, graphite)}$. ΔHf° of MgO(s) is −601.6 kJ/mol, and of CO₂(g) −393.5 kJ/mol. Calculate ΔH° for the equation as written. Give it with its sign." Why, each line as a block: products, 2(−601.6) + 1(0) = −1,203.2 kJ. Reactants, 2(0) + 1(−393.5) = −393.5 kJ. ΔH° = −1,203.2 − (−393.5) = −809.7 kJ/mol_rxn. Magnesium and graphite are elements in their standard states, so they go in as zero. The reaction releases so much energy that carbon dioxide cannot put out a magnesium fire.

  Slips (value, from, message):
  - `809.7`, the sign lost, or reactants minus products: "Check the sign. Is your subtraction products minus reactants, with each value's own sign kept?"
  - `-208.1`, the coefficient of MgO left out: "Did you use the value of MgO once? Check its coefficient in the equation."
  - `-1596.7`, a negative value subtracted as if it were positive: "Subtracting a negative value adds it. Put the reactants' total in brackets, with its own sign, before you subtract."
  - `-995.1`, both of those: "Check two things: the coefficient of MgO, and what subtracting a negative value does."
  - `-1203.2`, the products' total alone: "That is the products' total. Carbon dioxide is a compound, so its value does not drop out. Subtract the reactants' total."
- **Check 4**, `<Check answer={4}>`: "Zinc ore is roasted in air before the metal is made from it (as a block equation, split after the arrow): $\ce{2ZnS(s) + 3O2(g) -> 2ZnO(s) + 2SO2(g)}$. The values of ΔHf° are ZnS(s) −206.0, ZnO(s) −350.5 and SO₂(g) −296.8 kJ/mol. A student writes (as a block, split): ΔH° = [−350.5 + (−296.8)] − [−206.0] = −441.3 kJ. What went wrong?" Options, in order:
  1. Oxygen was left out, and it needs its own value from a table
  2. The subtraction was done as reactants minus products
  3. Subtracting −206.0 should have lowered the total, not raised it
  4. Each value should have been multiplied by its coefficient

  Why, with the corrected line as a block: every substance here has a coefficient, and the student used each value once. The right line is ΔH° = [2(−350.5) + 2(−296.8)] − [2(−206.0) + 3(0)] = −1,294.6 − (−412.0) = −882.6 kJ/mol_rxn, twice the student's answer. Oxygen gas is an element in its standard state: its value is zero, so leaving it out did no harm here, though writing 3(0) is the safer habit. The order is right: ZnO and SO₂ are the products, and they come first. And the signs were handled correctly: subtracting −206.0 adds 206.0.

  Misses:
  - 1: "Oxygen gas is an element in its standard state. What value does that give it?"
  - 2: "Look at which bracket comes first. The values of ZnO and SO₂ are in it: are those the products or the reactants?"
  - 3: "Subtracting a negative number adds its size, which is what the student did. That step is sound."
- **Section "Signs, states and amounts":** three things to watch, in a short paragraph each, then the worked example.
  - A table value can be positive, and a positive value subtracted or a negative value subtracted behave differently. Keep every value in brackets with its own sign until the last line.
  - The state in the equation picks the value. H₂O(l) is −285.8 kJ/mol and H₂O(g) is −241.8 kJ/mol; the 44.0 kJ/mol between them is the energy that turns a mole of liquid water into vapor at 25 °C, a little more than the 41 kJ it takes at 100 °C (topic 3.1).
  - ΔH° is for the equation as written. For any other amount, scale it by the moles that react (topic 6.6).
- **Worked example "The gas in a carbide lamp":** cavers' and miners' lamps of a century ago, and some still in use, drip water onto lumps of calcium carbide. The gas that comes off, acetylene, burns at a jet with a bright white flame. The gas-making reaction, as a block split after the arrow: $\ce{CaC2(s) + 2H2O(l) -> Ca(OH)2(s) + C2H2(g)}$. (a) Find ΔH°. (b) How much energy is released when a 25.0 g lump of calcium carbide is used up?
  1. **Values, with the right state for water.** CaC₂(s) −59.8; H₂O(l) −285.8, the liquid; Ca(OH)₂(s) −985.2; C₂H₂(g) +227.4.
  2. **Products.** As a block: 1(−985.2) + 1(+227.4) = −757.8 kJ.
  3. **Reactants.** As a block: 1(−59.8) + 2(−285.8) = −59.8 − 571.6 = −631.4 kJ.
  4. **Products minus reactants.** As a block: ΔH° = −757.8 − (−631.4) = −126.4 kJ/mol_rxn. The gas-making reaction is exothermic: a carbide lamp's body gets warm.
  5. **Scale to the lump.** The molar mass of CaC₂ is 40.08 + 2(12.01) = 64.10 g/mol, so, as a block, n = 25.0 g ÷ 64.10 g/mol = 0.3900 mol. The equation uses 1 mol of CaC₂ for each mole of reaction, so the energy released is 0.3900 × 126.4 = 49.3 kJ.
  6. **What the slips would give.** The value for steam in place of liquid water gives −214.4 kJ/mol_rxn. Leaving out the coefficient 2 gives −412.2 kJ/mol_rxn. Reactants minus products gives +126.4 kJ/mol_rxn, an endothermic answer for a lamp that warms up.

  Note for the writer: the 49.3 kJ is for making the gas, not for burning it; do not mention the energy of the flame, and write no equation for the flame.
- **Check 5**, `<Check numeric="107" unit="kJ">`: "An airliner's emergency oxygen comes from a canister of sodium chlorate, NaClO₃, which gives off oxygen once it has been set going (as a block equation): $\ce{2NaClO3(s) -> 2NaCl(s) + 3O2(g)}$. ΔHf° of NaClO₃(s) is −365.8 kJ/mol, and of NaCl(s) −411.2 kJ/mol. The molar mass of NaClO₃ is 106.44 g/mol. How much energy, in kJ, is released when 250. g of NaClO₃ decomposes?" Why, each line as a block: ΔH° = [2(−411.2) + 3(0)] − [2(−365.8)] = −822.4 − (−731.6) = −90.8 kJ/mol_rxn, and the equation as written uses 2 mol of NaClO₃. The canister holds 250. g ÷ 106.44 g/mol = 2.349 mol, which is 2.349 ÷ 2 = 1.174 mol of reaction (topic 6.6). Energy released = 1.174 × 90.8 = 107 kJ. It is one reason these canisters get hot in use.

  Slips (value, from, message):
  - `213`, 90.8 kJ taken for each mole of NaClO₃: "Did you use 90.8 kJ for each mole of NaClO₃? Check how many moles of NaClO₃ the equation as written uses."
  - `53.3`, the coefficients left out of ΔH° and the moles then halved: "Did the coefficients go into ΔH°? Each value is multiplied by its coefficient before you subtract."
  - `90.8`, ΔH° itself: "That is the size of ΔH° for the equation as written. Now find the moles in 250. g and scale to them."
  - `1825`, the two totals added: "Were the two totals added? Products minus reactants: subtracting a negative value adds it."
  - `2.35`, the moles of NaClO₃: "That is the moles of NaClO₃. Go on to moles of reaction, and then to energy."
  - `11350`, grams multiplied by kJ for each mole: "Did you multiply grams by kJ for each mole? Change 250. g to moles first."

  Notes for the writer: the answer is a magnitude, so the numeric value has no sign. Honest roundings all fall inside the 2 percent the page accepts (104.9 to 109.1): 106.6 unrounded, 106.2 from 1.17 mol, 106.7 from 1.175 mol. Real canisters also hold a little iron powder whose burning keeps the reaction going; say nothing about it beyond "one reason".
- **Check 6**, `<Check numeric="21.7" unit="kJ/mol">`: "Older car airbags were filled by sodium azide, NaN₃, a solid that breaks down into its elements when a spark sets it off (as a block equation): $\ce{2NaN3(s) -> 2Na(s) + 3N2(g)}$, with ΔH° = −43.4 kJ/mol_rxn. What is ΔHf° of NaN₃(s), in kJ/mol? Give it with its sign." Why, as blocks: both products are elements in their standard states, so the products' total is zero. Then −43.4 = [2(0) + 3(0)] − [2 ΔHf°(NaN₃)], so 2 ΔHf°(NaN₃) = +43.4 and ΔHf°(NaN₃) = +21.7 kJ/mol. The value is positive: forming sodium azide from its elements takes energy in, which is the same as saying that it releases energy when it falls apart into them. Another way to see it: the equation shown is the formation reaction turned around and doubled.

  Slips (value, from, message):
  - `-21.7`, the sign not turned around: "Check the sign. The equation shown is the compound breaking down, and a formation reaction runs the other way."
  - `-43.4`, ΔH° taken as ΔHf°: "That is ΔH° of the equation shown. It runs the other way from a formation reaction, and it uses 2 mol of NaN₃."
  - `43.4`, not divided by 2: "The equation uses 2 mol of NaN₃. A formation value is for 1 mol of the compound."

  Note for the writer: the answer is positive, so a typed 21.7 and a typed +21.7 are both the answer.
- **Trap:** **Reactants minus products** (the order here is products minus reactants, the opposite of the bond-enthalpy order; an exothermic reaction that comes out positive is the warning). **Leaving out a coefficient** (the equation sheet's formula does not show them; multiply every value by its coefficient). **Giving an element a value, or dropping it** (an element in its standard state goes in as zero; write the zero). **Calling every form of an element zero** (Br₂(g), I₂(g) and H(g) are elements and are not zero). **Taking the value for the wrong state** (H₂O(l) −285.8 and H₂O(g) −241.8 are different numbers). **Losing a sign** (subtracting a negative value adds it; keep each value in brackets). **Writing a formation reaction for two moles** (the product is one mole of the compound, so fractions are allowed on the elements).
- **Key points:** the standard enthalpy of formation of a compound, ΔHf°, is the enthalpy change when one mole of it forms from its elements in their standard states; the standard state is the pure substance at 1 bar, and for an element it is normally the form most stable at 25 °C and 1 bar, such as O₂(g), Br₂(l) and graphite; ΔHf° of an element in its standard state is zero, and other forms of the element, such as Br₂(g), are not zero; the standard enthalpy change of a reaction is the sum of n ΔHf° for the products minus the sum of n ΔHf° for the reactants, where n is each coefficient, and the equation sheet prints this without the coefficients; the value used must match the state in the equation, and liquid water and steam have different values; the answer belongs to the equation as written, in kJ/mol_rxn, and scales with the amount that reacts.

**Check script:** `scratchpad/unit6/checks/6-8.py`.

**Values**

All ΔHf° at 25 °C in kJ/mol, from the CRC Handbook's table of standard thermodynamic properties, as remembered; the fact-checker looks each one up.

| Substance | ΔHf° | Note |
|---|---|---|
| SiO₂(s, quartz) | −910.7 | |
| CO(g) | −110.5 | |
| NaHCO₃(s) | −950.8 | |
| Br₂(g) | +30.9 | |
| H(g) | +218.0 | half of H–H 436 |
| I₂(g) | +62.4 | at 25 °C; lesson 6.5's fusion plus vaporization, 57.1, are at the melting and boiling points |
| C₂H₂(g) | +227.4 | NIST gives +226.7 (verify which the unit uses) |
| H₂O(l), H₂O(g) | −285.8, −241.8 | difference 44.0 at 25 °C; lesson 3.1 prints about 41 at 100 °C |
| CaC₂(s) | −59.8 | (verify) |
| Ca(OH)₂(s) | −985.2 | CRC; NIST gives −986.1 (verify) |
| MgO(s) | −601.6 | |
| CO₂(g) | −393.5 | |
| ZnS(s, sphalerite) | −206.0 | (verify) |
| ZnO(s) | −350.5 | (verify; older tables give −348.3) |
| SO₂(g) | −296.8 | |
| NaClO₃(s) | −365.8 | (verify) |
| NaCl(s) | −411.2 | |
| NaN₃(s) | +21.7 | (verify) |

Atomic masses from the exam's table: Si 28.09, Ca 40.08, C 12.01, Na 22.99, Cl 35.45, O 16.00. The silicon furnace's temperature, "about 2,000 °C" (verify). The standard-state pressure is written as 1 bar, "very nearly 1 atm" (a decision: see the report).

**Reactions, substances and scenarios used:** the silicon furnace, quartz and carbon giving silicon and carbon monoxide (opening, worked example, figure); the formation reactions of quartz and of baking soda, NaHCO₃, from sodium, hydrogen, graphite and oxygen (first section); four candidate equations for forming HBr(g), with bromine a liquid (Check 1); bromine vapor, hydrogen atoms and acetylene as values that are not zero or not negative (second section); mercury, iodine vapor, liquid water and molten iron (Check 2); burning magnesium lowered into a jar of carbon dioxide (Check 3); a student's faulty line for roasting zinc sulfide ore in air (Check 4); a carbide lamp, calcium carbide and water giving calcium hydroxide and acetylene, with a 25.0 g lump (second worked example); an airliner's sodium chlorate oxygen canister, 250. g (Check 5); sodium azide in an older car airbag breaking down into sodium and nitrogen (Check 6). No combustion of a fuel, no formation reaction of water, CO₂, NO₂, SO₃ or ammonia, no thermite, no diamond.

**Check script:** `scratchpad/unit6/checks/6-8.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.8 Enthalpy of Formation`).

### Task 11: Lesson 6.9, Hess's Law

**Files:**
- Create: `src/content/lessons/unit-6/6-9-hesss-law.mdx`
- Create: `public/figures/6-9-two-routes.svg`, `public/figures/6-9-equations-cancel.svg`

**Brief**

- **Front matter:** `topic: "6.9"`, `minutes: 16`, summary: "How the enthalpy change of a process equals the sum of the enthalpy changes of its steps, and how to reverse, scale and add equations to build the one you need." (No colon in the summary.)
- **Framework (topic 6.9):** two objectives. (A) Represent a chemical or physical process as a sequence of steps: many processes can be broken into a series of steps, each with its own energy change. (B) Explain how the enthalpy change of a process relates to the sum of the enthalpy changes of its steps: because energy is conserved, the sum of the energy changes of the steps equals the energy change of the process done directly. The three rules: when a reaction is reversed, its ΔH keeps its size and changes sign; when a reaction is multiplied by a factor, its ΔH is multiplied by the same factor; when reactions are added, their ΔH values are added. **Nothing of this is on the equation sheet**: the lesson says so. **"State function" appears once**, in the one "Beyond the exam" sentence the brief gives, and nowhere else. **What this lesson does not do:** it does not re-teach ΔH, its sign, kJ/mol_rxn or scaling with the amount that reacts (topic 6.6: name it); it does not re-teach enthalpies of formation (topic 6.8: one sentence says that its formula is Hess's law applied to formation reactions); no bond enthalpies (topic 6.7); no calorimetry calculation (topics 6.4 and 6.6 are named as where the given values come from); no lattice energy and no Born–Haber cycle. No image of a mountain, a height, a journey's distance, a bank balance or an account, and no talk of a perpetual-motion machine.
- **Opening:** heat a little potassium hydrogen carbonate, a white powder used in some fire extinguishers, and it breaks down, giving off carbon dioxide and water. How much energy does that take in? You cannot find out with a thermometer: the powder sits in a flame, and the flame's energy goes everywhere. The value can be had all the same, +96.1 kJ for the equation you will meet below, without ever heating the powder: it comes from two other reactions that are easy to run in a calorimeter. This lesson shows how one enthalpy change can be built out of others.
- **Section "A process in steps":**
  - Start from something the student has done: in topic 6.5 the energy to take a solid all the way to a gas was found by adding the energy of each segment of the heating curve. The process was broken into steps, each with its own energy change, and the steps were added. The same works for chemical reactions.
  - The example. Sodium peroxide, Na₂O₂, a bleach for paper pulp, can be made from sodium and oxygen in one go, as a block: $\ce{2Na(s) + O2(g) -> Na2O2(s)}$, ΔH° = −510.9 kJ/mol_rxn. In industry it is made in two steps. First sodium is burned in a limited supply of air to sodium oxide; then the oxide is heated in more oxygen. As two blocks:
    - Step 1: $\ce{2Na(s) + 1/2 O2(g) -> Na2O(s)}$, ΔH° = −414.2 kJ/mol_rxn
    - Step 2: $\ce{Na2O(s) + 1/2 O2(g) -> Na2O2(s)}$, ΔH° = −96.7 kJ/mol_rxn
  - Add the two steps: −414.2 + (−96.7) = −510.9 kJ. The same as the direct route, to the last digit. Place figure `6-9-two-routes.svg` here.
  - State the law. **Hess's law**: if a process can be written as a sequence of steps, its enthalpy change is the sum of the enthalpy changes of the steps.
  - Why it must be so, in three or four sentences: the two routes start with the same substances in the same states and end with the same substance in the same state. Suppose the routes gave different totals. Then you could go from start to end by one route and come back by the other, and end up with exactly what you began with, but with energy gained or lost. Energy is conserved (topic 6.4), so that cannot happen. The enthalpy change between a given start and a given end is one fixed number, whatever happens in between.
  - Then, as its own short paragraph: "**Beyond the exam:** a quantity like enthalpy, whose change depends only on where a process starts and ends and not on the route between, is called a state function."
  - `<KeyIdea>`: the enthalpy change of a process is the sum of the enthalpy changes of its steps. It depends on the start and the end, not on the route.
  - Note for the writer: the steps do not have to be ones that really happen. Say so in one sentence here: any set of steps that adds up to the process will do, real or imagined, which is what makes the law useful.
- **Figure** `6-9-two-routes.svg` (viewBox 480 × 400, font-size 18): an enthalpy diagram to scale, 0.5 units for each kJ.
  - A vertical axis at x = 40 from y = 380 up to y = 30 with an arrowhead at the top, labeled "Enthalpy" (rotated).
  - Top level (0 kJ), a horizontal line from x = 70 to x = 440 at y = 60. Label above it, centered: "2 Na + O₂".
  - Middle level (−414.2 kJ), a horizontal line from x = 270 to x = 440 at y = 267. Label above it, right-aligned at x = 330 so that it sits to the left of the arrows: "Na₂O + ½ O₂".
  - Bottom level (−510.9 kJ), a horizontal line from x = 70 to x = 440 at y = 315. Label under it, centered: "Na₂O₂".
  - Left, the direct route: one solid ink arrow pointing down at x = 130 from the top level to the bottom level. To its right, two lines of text at about y = 180: "one step" and "−510.9 kJ".
  - Right, the two-step route: a dashed accent arrow pointing down at x = 400 from the top level to the middle level, labeled to its left at about y = 160 "−414.2 kJ"; and a second dashed accent arrow pointing down at x = 400 from the middle level to the bottom level, labeled to its left at about y = 297 "−96.7 kJ".
  - The direct arrow is solid; the two step arrows are dashed. No label is longer than 11 characters.
  - Alt: "An enthalpy diagram. At the top is the starting level, 2 sodium and oxygen. At the bottom is sodium peroxide. On the left, one solid arrow labeled one step, minus 510.9 kilojoules, falls from the top level to the bottom level. On the right, two dashed arrows make the same fall in two parts: the first, labeled minus 414.2 kilojoules, ends at a level for sodium oxide and half an oxygen, and the second, labeled minus 96.7 kilojoules, falls from there to the bottom level."
  - Caption: "Two routes from the same start to the same end. The two steps on the right add up to the one step on the left."
- **Check 1**, `<Check numeric="57.7" unit="kJ">`: "Chlorine gas turns iron(II) chloride into iron(III) chloride, a solid that water-treatment plants use to clear muddy water (as a block equation): $\ce{FeCl2(s) + 1/2 Cl2(g) -> FeCl3(s)}$. Data tables give two other values. For $\ce{Fe(s) + 3/2 Cl2(g) -> FeCl3(s)}$, ΔH° = −399.5 kJ/mol_rxn. For $\ce{Fe(s) + Cl2(g) -> FeCl2(s)}$, ΔH° = −341.8 kJ/mol_rxn. Think of the first of these as done in two steps: iron to iron(II) chloride, then iron(II) chloride to iron(III) chloride. How much energy, in kJ, is released when one mole of FeCl₃ forms from FeCl₂ and chlorine?" (Set the two table equations as blocks.) Why: the two steps must add up to the one-step reaction, so −341.8 + ΔH°(step 2) = −399.5, and, as a block, ΔH°(step 2) = −399.5 − (−341.8) = −57.7 kJ/mol_rxn. The reaction releases 57.7 kJ for each mole of FeCl₃. Most of the energy of making FeCl₃ from iron is released in getting as far as FeCl₂.

  Slips (value, from, message):
  - `741.3`, the two values added: "That is the two table values added. Which of the two is the total for both steps, and which is one step of it?"
  - `341.8`, the first step: "That is the step from iron to FeCl₂. The step asked for is what is left of the total after it."
  - `399.5`, the one-step total: "That is the whole change from iron to FeCl₃. Part of it is released before FeCl₂ is reached."
  - `28.9`, halved for the ½ Cl₂: "Did you halve it for the ½ Cl₂? The step as written makes one mole of FeCl₃, so nothing is scaled."

  Note for the writer: the question asks for a magnitude, so the numeric value has no sign. Do not say that iron and chlorine give FeCl₂ when they are reacted directly (they give FeCl₃): the wording "data tables give" and "think of" is deliberate.
- **Section "Three things you may do to an equation":** steps rarely arrive in the form you need. There are three things you may do to a thermochemical equation, and each does something definite to its ΔH. None of this is on the equation sheet. Give each with its reason and one example from the sodium oxides, then the table.
  - **Reverse it: the sign of ΔH changes.** Going back is the same gap crossed the other way. As two blocks: $\ce{Na2O(s) + 1/2 O2(g) -> Na2O2(s)}$, ΔH° = −96.7 kJ/mol_rxn; reversed, $\ce{Na2O2(s) -> Na2O(s) + 1/2 O2(g)}$, ΔH° = +96.7 kJ/mol_rxn. (You met this in topic 6.5: condensing releases what vaporizing takes in.)
  - **Multiply it by a number: ΔH is multiplied by the same number.** ΔH belongs to the equation as written, and twice the amount of reaction is twice the energy (topic 6.6). As two blocks: $\ce{2Na(s) + O2(g) -> Na2O2(s)}$, ΔH° = −510.9 kJ/mol_rxn; doubled, $\ce{4Na(s) + 2O2(g) -> 2Na2O2(s)}$, ΔH° = −1,021.8 kJ/mol_rxn. The number can be a fraction: multiplying by ½ halves everything.
  - **Add it to another: the ΔH values add.** This is Hess's law. A substance that appears on both sides of the sum, in the same state, cancels, as Na₂O did when step 1 and step 2 were added. The same substance on the same side is collected: ½ O₂ and ½ O₂ made O₂.
  - The table (three columns):

    | You do this | To the equation | To ΔH |
    |---|---|---|
    | Reverse | Reactants and products change sides | The sign changes |
    | Multiply by a number | Every coefficient is multiplied | Multiplied by the same number |
    | Add | Cancel what is on both sides | The values are added |

- **Check 2**, `<Check answer={3}>`: "Cyclohexane, a starting material for nylon, is made by adding hydrogen to benzene vapor over a nickel catalyst (as a block equation): $\ce{C6H6(g) + 3H2(g) -> C6H12(g)}$, ΔH° = −206.3 kJ/mol_rxn. At a higher temperature the reaction runs backward and gives the hydrogen back. What is ΔH° for the backward reaction written for one mole of hydrogen (as a block), $\ce{1/3 C6H12(g) -> 1/3 C6H6(g) + H2(g)}$?" Options, in order:
  1. −68.8 kJ, energy released
  2. +206.3 kJ, energy absorbed
  3. +68.8 kJ, energy absorbed
  4. +618.9 kJ, energy absorbed

  Why: the new equation is the given one reversed and multiplied by ⅓. Reversing changes the sign: +206.3 kJ for C₆H₁₂ → C₆H₆ + 3 H₂. Multiplying by ⅓ gives +68.8 kJ for one mole of H₂. The first option takes a third and does not reverse. The second reverses and does not take a third. The fourth multiplies by 3 where it should divide.

  Misses:
  - 1: "This equation runs the other way from the one given. What does turning a reaction around do to its ΔH?"
  - 2: "Compare the coefficient of H₂ in the two equations. ΔH belongs to the equation as written."
  - 4: "Compare the coefficient of H₂ in the two equations. Is the new one a larger amount of reaction or a smaller one?"

  Notes for the writer: the four options are equally long. Both directions are real (benzene is hydrogenated to cyclohexane over nickel; at a higher temperature cyclohexane loses hydrogen over platinum). Give no temperature as a number.
- **Section "Building the equation you want":** most Hess's law questions give two or three equations with their ΔH values and ask for the ΔH of a **target** equation, the one you want. A method, as a numbered list:
  1. Write the target equation.
  2. Take a substance in the target that appears in only one of the given equations. Turn that equation around if the substance is on the wrong side. Multiply it so the substance has the coefficient the target gives it. Do to ΔH what you did to the equation.
  3. Do the same for each given equation.
  4. Add the equations. Cancel what appears on both sides.
  5. Check that what is left is exactly the target. If a substance that is not in the target survives, an equation is the wrong way around or wrongly scaled.
  6. Add the ΔH values.
- **Worked example "The powder that cannot be measured directly":** find ΔH° for the breakdown of potassium hydrogen carbonate, the target, as a block split after the arrow: $\ce{2KHCO3(s) -> K2CO3(s) + H2O(l) + CO2(g)}$. Each solid can be stirred into hydrochloric acid in a calorimeter (topics 6.4 and 6.6), and for dilute acid the values are, as two blocks, each split after the arrow:
  - Equation 1: $\ce{KHCO3(s) + HCl(aq) -> KCl(aq) + H2O(l) + CO2(g)}$, ΔH° = +31.5 kJ/mol_rxn
  - Equation 2: $\ce{K2CO3(s) + 2HCl(aq) -> 2KCl(aq) + H2O(l) + CO2(g)}$, ΔH° = −33.1 kJ/mol_rxn

  1. **Place KHCO₃.** It is in equation 1 only, and on the left, where the target has it. The target needs 2 mol, so double equation 1 and its ΔH: $\ce{2KHCO3(s) + 2HCl(aq) -> 2KCl(aq) + 2H2O(l) + 2CO2(g)}$, ΔH° = 2(+31.5) = +63.0 kJ.
  2. **Place K₂CO₃.** It is in equation 2 only, on the left, but the target has it on the right. Reverse equation 2 and change the sign of its ΔH: $\ce{2KCl(aq) + H2O(l) + CO2(g) -> K2CO3(s) + 2HCl(aq)}$, ΔH° = +33.1 kJ.
  3. **Add, and cancel.** 2 HCl(aq) is on both sides, and so is 2 KCl(aq): they cancel. One H₂O(l) and one CO₂(g) on the right of the first equation cancel against the H₂O(l) and CO₂(g) on the left of the second, leaving one of each on the right. Place figure `6-9-equations-cancel.svg` here.
  4. **Check against the target.** What is left: $\ce{2KHCO3(s) -> K2CO3(s) + H2O(l) + CO2(g)}$. It is the target, with nothing over.
  5. **Add the ΔH values.** As a block: ΔH° = +63.0 + 33.1 = +96.1 kJ/mol_rxn. The breakdown takes energy in.
  6. **What the slips would give.** Equation 2 reversed with its sign left alone: 63.0 − 33.1 = +29.9 kJ. Equation 1 doubled with its ΔH left alone: 31.5 + 33.1 = +64.6 kJ.

  Notes for the writer: hydrochloric acid is a strong acid and potassium chloride is soluble, which is why they are written (aq); do not write the equations as net ionic ones here, because the canceling is clearer with whole formulas. All three operations appear: scale (step 1), reverse (step 2), add (step 3); say so in a closing sentence. The water in the target is liquid, the standard state at 25 °C; do not discuss steam. Do not say that the powder puts out fires by taking in this energy.
- **Figure** `6-9-equations-cancel.svg` (viewBox 480 × 310, font-size 18): the two prepared equations written out, with what cancels struck through, and their sum. State symbols are left out to keep the lines short. Left margin x = 30; ΔH values right-aligned at x = 460.
  - y = 28: heading in the secondary color "Equation 1, doubled"; on the same line, right-aligned, "+63.0 kJ".
  - y = 58: "2 KHCO₃ + 2 HCl →". The "2 HCl" is struck through.
  - y = 84, indented to x = 60: "2 KCl + H₂O + CO₂". All three terms are struck through.
  - y = 110, indented to x = 60: "+ H₂O + CO₂". Not struck through.
  - y = 150: heading "Equation 2, reversed"; right-aligned, "+33.1 kJ".
  - y = 180: "2 KCl + H₂O + CO₂ →". All three terms are struck through.
  - y = 206, indented to x = 60: "K₂CO₃ + 2 HCl". The "2 HCl" is struck through.
  - y = 228: a horizontal rule from x = 30 to x = 460.
  - y = 256: heading "Sum"; right-aligned, in the accent color and bold, "+96.1 kJ".
  - y = 286: "2 KHCO₃ → K₂CO₃ + H₂O + CO₂".
  - Each strike-through is a straight ink line through the middle of the term, and a struck term is also set in the secondary color: it is told apart by the line, not by color alone. The doubled equation's 2 H₂O and 2 CO₂ are written out as one of each on two lines so that one of each can be struck and one kept. Eight terms are struck in all: 2 HCl twice, 2 KCl twice, H₂O twice and CO₂ twice. No line of text is longer than 27 characters.
  - Alt: "Two chemical equations written one above the other, with a line struck through every term that cancels, and their sum below. Equation 1, doubled, plus 63.0 kilojoules: 2 KHCO3 plus 2 HCl gives 2 KCl plus water plus carbon dioxide plus a second water and a second carbon dioxide. Equation 2, reversed, plus 33.1 kilojoules: 2 KCl plus water plus carbon dioxide gives K2CO3 plus 2 HCl. Struck through are 2 HCl and 2 KCl in both equations, and one water and one carbon dioxide in each. The sum, plus 96.1 kilojoules: 2 KHCO3 gives K2CO3 plus water plus carbon dioxide."
  - Caption: "What appears on both sides of the sum cancels. The doubled equation's two waters and two carbon dioxides are written singly, so that one of each cancels and one of each is left. State symbols are left out."
- **Check 3**, `<Check answer={2}>`: "Here are two equations for the oxides of sodium (as two blocks). Equation 1: $\ce{2Na(s) + 1/2 O2(g) -> Na2O(s)}$. Equation 2: $\ce{2Na(s) + O2(g) -> Na2O2(s)}$. Sodium oxide can also be made by warming sodium peroxide with sodium metal (as a block): $\ce{Na2O2(s) + 2Na(s) -> 2Na2O(s)}$. Which plan turns equations 1 and 2 into this target?" Options, in order:
  1. Reverse equation 1, double equation 2, then add them
  2. Double equation 1, reverse equation 2, then add them
  3. Double equation 1, leave equation 2 as it is, then add them
  4. Leave equation 1 as it is, reverse equation 2, then add them

  Why, with the sum as a block: the target has 2 Na₂O on the right. Na₂O is in equation 1 only, on the right, with a coefficient of 1: double it, giving 4 Na + O₂ → 2 Na₂O, ΔH° = −828.4 kJ. The target has Na₂O₂ on the left. It is in equation 2 only, on the right: reverse it, giving Na₂O₂ → 2 Na + O₂, ΔH° = +510.9 kJ. Added, the O₂ cancels and 2 of the 4 Na cancel, which leaves the target, with ΔH° = −828.4 + 510.9 = −317.5 kJ/mol_rxn. The third plan leaves Na₂O₂ on the product side. The fourth makes only one Na₂O and leaves ½ O₂ over. The first puts Na₂O on the left and Na₂O₂ on the right, the opposite of the target.

  Misses:
  - 1: "Find Na₂O₂ in the target, then in equation 2. Is it on the same side in both?"
  - 3: "Add your two equations and see what is left. Which side does Na₂O₂ end up on, and which side does the target have it?"
  - 4: "Count the Na₂O in the target, then in equation 1. Add your two equations and check whether the O₂ cancels."
- **Check 4**, `<Check numeric="-79.3" unit="kJ/mol">`: "Anhydrous copper(II) sulfate is a white powder. It takes up water and turns into the blue solid CuSO₄·5H₂O, which is why it is used as a test for water (the target, as a block split after the arrow): $\ce{CuSO4(s) + 5H2O(l) -> CuSO4*5H2O(s)}$. Each solid can be dissolved in a large amount of water, and data tables give (as two blocks). Equation 1: $\ce{2CuSO4(s) -> 2CuSO4(aq)}$, ΔH° = −146.2 kJ/mol_rxn. Equation 2: $\ce{CuSO4*5H2O(s) -> CuSO4(aq) + 5H2O(l)}$, ΔH° = +6.2 kJ/mol_rxn. Find ΔH° for the target. Give it with its sign." Why, each as a block: the target has 1 mol of CuSO₄(s) on the left, and equation 1 has 2 mol on the left, so multiply equation 1 by ½: CuSO₄(s) → CuSO₄(aq), ΔH° = ½(−146.2) = −73.1 kJ. The blue solid is on the right of the target and on the left of equation 2, so reverse equation 2: CuSO₄(aq) + 5 H₂O(l) → CuSO₄·5H₂O(s), ΔH° = −6.2 kJ. Add them: CuSO₄(aq) cancels and the target is left. ΔH° = −73.1 + (−6.2) = −79.3 kJ/mol_rxn.

  Slips (value, from, message):
  - `79.3`, the sign lost: "Check the sign of each piece after halving and reversing, then add them again."
  - `-152.4`, equation 1 not halved: "Did the ΔH of equation 1 get halved? Count the CuSO₄ in the target: ΔH scales with the equation."
  - `-66.9`, equation 2 not reversed: "Did equation 2 keep its sign? Compare the side the blue solid is on in equation 2 with its side in the target."
  - `-140.0`, neither done: "Check both equations against the target: the amount of CuSO₄, and the side the blue solid is on."
  - `-73.1`, equation 1 halved and equation 2 left out: "That is equation 1 for one mole of CuSO₄. Equation 2 has to come in as well, turned the right way around."

  Notes for the writer: write the hydrate with mhchem's `*` (it sets a centered dot). CuSO₄(aq) stands for the dissolved salt; do not split it into ions here, because the canceling is clearer with whole formulas. The water of equation 2 is liquid, like the target's, so nothing about states needs saying.
- **Check 5**, `<Check numeric="-840.6" unit="kJ/mol">`: "Titanium metal was long made by running liquid titanium(IV) chloride onto sodium in a sealed steel pot (the target, as a block equation split after the arrow): $\ce{TiCl4(l) + 4Na(s) -> Ti(s) + 4NaCl(s)}$. Use these two equations (as blocks). Equation 1: $\ce{Ti(s) + 2Cl2(g) -> TiCl4(l)}$, ΔH° = −804.2 kJ/mol_rxn. Equation 2: $\ce{2Na(s) + Cl2(g) -> 2NaCl(s)}$, ΔH° = −822.4 kJ/mol_rxn. Find ΔH° for the target. Give it with its sign." Why, each as a block: TiCl₄ is on the left of the target and on the right of equation 1, so reverse equation 1: TiCl₄(l) → Ti(s) + 2 Cl₂(g), ΔH° = +804.2 kJ. The target has 4 NaCl, so double equation 2: 4 Na(s) + 2 Cl₂(g) → 4 NaCl(s), ΔH° = 2(−822.4) = −1,644.8 kJ. Add them: the 2 Cl₂ cancels and the target is left. ΔH° = +804.2 + (−1,644.8) = −840.6 kJ/mol_rxn.

  Slips (value, from, message):
  - `840.6`, the sign lost: "Check the sign of each piece after reversing and doubling, then add them again."
  - `-2449.0`, equation 1 not reversed: "Did equation 1 keep its sign? Compare the side TiCl₄ is on in equation 1 with its side in the target."
  - `-18.2`, equation 2 not doubled: "Did the ΔH of equation 2 get doubled? Count the NaCl in the target: ΔH scales with the equation."
  - `-1626.6`, neither done: "Check both equations against the target: the side TiCl₄ is on, and the number of NaCl."
  - `-2485.4`, equation 2 multiplied by 4: "Did equation 2 get multiplied by 4? It already makes 2 NaCl. Compare that with the number of NaCl in the target."
  - `2449.0`, both equations reversed: "Only an equation whose substances are on the wrong sides for the target is turned around. Check NaCl in equation 2."

  Note for the writer: this is the Hunter process; do not name it. The real pot is hot, with the sodium molten; the ΔH° values are for 25 °C with the states written. Say nothing about the temperature.
- **One closing paragraph, with no heading and no table:** the formula of topic 6.8 is Hess's law used once and for all. A formation reaction is one more equation with its ΔH, and "products minus reactants" is what comes out when you reverse the formation reactions of the reactants, keep those of the products, multiply each by its coefficient, and add. Do not add a list or a table of the unit's methods here.
- **Trap:** **Reversing an equation and keeping the sign of ΔH** (a reversed reaction has ΔH of the same size and the opposite sign). **Multiplying the equation and not its ΔH** (ΔH belongs to the equation as written; double one, double the other). **Changing every sign, or every equation** (only an equation whose substances are on the wrong side is reversed). **Canceling a substance against itself in a different state** (H₂O(l) and H₂O(g) are not the same entry and do not cancel). **Not checking the sum** (if a substance that is not in the target is left over, an equation is the wrong way around or wrongly scaled). **Adding the ΔH values as they were given** (add them only after each has been through the same operations as its equation).
- **Key points:** a process can be written as a sequence of steps, each with its own enthalpy change, and the steps may be real or imagined; Hess's law says that the enthalpy change of the process is the sum of the enthalpy changes of its steps, because energy is conserved; the enthalpy change depends only on the substances and states at the start and at the end, not on the route between; reversing an equation changes the sign of its ΔH, and multiplying an equation by a number multiplies its ΔH by that number; when equations are added, substances on both sides in the same state cancel and the ΔH values are added; to reach a target equation, place each of its substances by reversing and scaling the given equations, add, and check that only the target is left.

**Check script:** `scratchpad/unit6/checks/6-9.py`.

**Values**

ΔHf° at 25 °C in kJ/mol, from the CRC Handbook's table (the values for ions in water are the conventional ones, with H⁺(aq) as zero), as remembered; the fact-checker looks each one up. Each ΔH° in the lesson is computed from these by the check script.

| Substance | ΔHf° | Used for |
|---|---|---|
| Na₂O(s) | −414.2 | step 1; with Na₂O₂, step 2 = −96.7 (verify both) |
| Na₂O₂(s) | −510.9 | the direct route, doubled −1,021.8; Check 3 gives −317.5. That industry makes Na₂O₂ by way of Na₂O, and that Na₂O₂ warmed with sodium gives Na₂O (verify both) |
| FeCl₂(s), FeCl₃(s) | −341.8, −399.5 | Check 1: −57.7 |
| C₆H₆(g), C₆H₁₂(g) | +82.9, −123.4 | Check 2: −206.3, and +68.8 for one mole of H₂ (verify both; some tables give −123.1 for cyclohexane, which makes −206.0 and +68.7) |
| CuSO₄(s) | −771.4 | Check 4 (verify) |
| CuSO₄·5H₂O(s) | −2,279.7 | Check 4 (verify) |
| Cu²⁺(aq), SO₄²⁻(aq) | +64.8, −909.3 | Check 4: dissolved CuSO₄ is −844.5, so equation 1 is −146.2 and equation 2 is +6.2 (verify; with unrounded table values equation 2 is +6.0 and the target −79.1) |
| KHCO₃(s) | −963.2 | worked example (verify) |
| K₂CO₃(s) | −1,151.0 | worked example (verify) |
| K⁺(aq) | −252.4 | worked example (verify; some tables give −251.2 or −252.1) |
| Cl⁻(aq), HCl(aq) | −167.2 | worked example; it cancels out of both given equations |
| H₂O(l), CO₂(g) | −285.8, −393.5 | worked example: equation 1 +31.5, equation 2 −33.1, target +96.1 |
| TiCl₄(l) | −804.2 | Check 5 |
| NaCl(s) | −411.2 | Check 5: equation 2 is −822.4, the target −840.6 (the value of lesson 6.8) |

The two calorimeter values of the worked example, +31.5 and −33.1 kJ/mol_rxn, are the standard values for dilute solutions computed from the table; a classroom calorimeter with 1 or 2 M acid gives values a few kJ different (verify that the lesson may present the table values as what the calorimeter "gives").

**Reactions, substances and scenarios used:** potassium hydrogen carbonate, a fire-extinguisher powder, breaking down on heating, found from the reactions of KHCO₃ and K₂CO₃ with hydrochloric acid (opening, worked example, second figure); sodium peroxide for bleaching paper pulp, made from sodium directly or by way of sodium oxide (first section, first figure, the three operations, and Check 3 with Na₂O₂ + 2 Na → 2 Na₂O); iron(II) chloride and chlorine giving iron(III) chloride for water treatment (Check 1); benzene vapor and hydrogen giving cyclohexane over nickel, and the reverse (Check 2); white anhydrous copper(II) sulfate taking up water to become the blue pentahydrate, from the two enthalpies of dissolving (Check 4); titanium from titanium(IV) chloride and sodium (Check 5); the heating curve of topic 6.5, named in one sentence as a process already done in steps. No carbon, carbon monoxide or carbon dioxide formation, no nitrogen oxides, no formation of water, SO₃ or ammonia, no diamond, no hydrazine or diborane, no ozone, no smelter, no magnesium.

**Check script:** `scratchpad/unit6/checks/6-9.py`.

**Steps**

- [ ] Draw the figures and write the lesson from the brief, following "Rules for writing a lesson".
- [ ] The controller's steps of "How a group is carried out": the data file, build and tests, the sweep and a look at each figure, the fact-check, the originality check, fixes and a second check.
- [ ] Commit (`feat(lessons): add 6.9 Hess's Law`).

---

### Task 12: Close out Unit 6's lessons

- [ ] Add an "As built" section to the design and "As carried out" notes to this plan under each group.
- [ ] In the last pull request, list for the teacher: what to verify against the framework, every value a checker could not confirm, and Claude's calls from the design's section 1.

## What this plan delivers against the design

| Design | Plan |
|---|---|
| 2 Nine lessons | Tasks 1 to 3 and 6 to 11 |
| 3 Staying inside the framework | each brief's "Framework" paragraph; the fact-checks |
| 4 Keeping the lessons original | the two inventories; the originality checks of the briefs and of each group |
| 5 Checks that test something | each brief's Checks with their messages and slips; `FEEDBACK_UNITS` (Group B) and `BALANCED_UNITS` (Group D) |
| 6.1 Two interactive diagrams | Tasks 4 and 5 |
| 6.2 Drawn figures | each brief's figures |
| 7 How it is made | "How a group is carried out" |
| 8 Pull requests | Groups B, C and D; this plan and the design are pull request A |
