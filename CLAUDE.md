# ChemStudy: rules for every session

This file is read at the start of every Claude Code session in this
repository. The rules below hold for every file, in every unit, whoever
writes it: a writer, a fixer, a checker or a builder.

## 1. American English, everywhere

Everything written in this repository is in American English: lessons,
practice, figures and their text alternatives, interface text, code
comments, test names, commit messages, pull request text, and the designs
and plans in `docs/`.

**Spelling**

| Write | Not |
|---|---|
| color, vapor, behavior, favor, neighbor | colour, vapour, behaviour, favour, neighbour |
| ionize, ionization, neutralize, crystallize, vaporize, polarize, analyze, catalyze, hydrolyze, organize, recognize, summarize | the same words with -ise, -isation or -yse |
| center, liter, milliliter, meter, fiber | centre, litre, millilitre, metre, fibre |
| labeled, labeling, modeled, modeling, canceled, canceling | labelled, labelling, modelled, modelling, cancelled, cancelling |
| aluminum, sulfur, sulfate, sulfide, cesium | aluminium, sulphur, sulphate, sulphide, caesium |
| gray, toward, while, among, program, practice (noun and verb) | grey, towards, whilst, amongst, programme, practise |
| learned, spelled, dreamed | learnt, spelt, dreamt |

"Analyses" as the plural of "analysis" is American English and stays.

**Usage**

- "math", not "maths". A question is worth "points", not "marks". A student
  is in a "grade", not a "year". The mark that ends a sentence is a "period".
- "Percent" is one word. A percent sign is set against its number: 90.1%.
- A date a student reads is written month first: November 26, 2026. File
  names, designs and plans keep the form 2026-11-26.
- Double quotation marks first, single inside them.
- Numbers use a period for the decimal and a comma for thousands: 1,234.5.

**Sources that are not American.** A source, a skill or a tool may hand back
British spelling or terms (the Education Skills Library does). Recast it
before it goes into any file. A British spelling may stand only where it is
itself the subject, for example in a list of spellings to change, and never
on a page a student reads.

**The check.** `npm test` runs `tests/unit/us-spelling.test.ts`, which reads
`src/`, `public/figures/`, `tests/`, `scripts/`, `README.md` and
`docs/DEPLOY.md` and fails on any word in the list in
`scripts/us-spelling.mjs`. A word that must stand is added to that file's
allow list with its reason. A British spelling found in review that the list
missed is added to the list in the pull request that fixes it. The check does
not read `docs/superpowers/`, so the rule there is kept by the writer.

## 2. Where the other rules are

- The main design: `docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md`.
- Each piece of work has a design in `docs/superpowers/specs/` and a plan in
  `docs/superpowers/plans/`. Read both before changing anything they cover.
- Deployment: `docs/DEPLOY.md`.
- **The teacher merges.** A pull request waits for the teacher's word unless
  the teacher's message said to merge.
