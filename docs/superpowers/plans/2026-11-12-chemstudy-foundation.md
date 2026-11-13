# ChemStudy Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new `chem-study` repository as a working, tested, deployable ChemStudy site — brand, every page type, the lesson building blocks, progress, search and CI/CD — proven with one real lesson (5.2 Introduction to Rate Law).

**Architecture:** An Astro 7 static site. Lessons are MDX files validated by a schema; lesson building blocks are Astro components supplied to every lesson by the lesson page, so lesson files contain no imports. Interactivity is one custom element (`cs-check`) plus small scripts; all state lives behind a `progress` module backed by `localStorage`. A post-build script (`check-dist`) fails the build on unrendered math, broken links or incomplete lessons.

**Tech Stack:** Astro 7, MDX, KaTeX 0.16 + mhchem (build-time), Pagefind, plain CSS with custom properties, Vitest, Playwright + axe, GitHub Actions, SiteGround over SSH.

**Spec:** `docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md`

**This is Plan 1 of 3 for Stage 1.** Plan 2 writes the other ten Unit 5 lessons and three interactive diagrams. Plan 3 converts Unit 5 practice. Neither is started here.

**One deliberate difference from the spec:** the spec puts each unit's color in the units data file. Here colors live only in `src/styles/tokens.css`, selected by a `data-unit` attribute, so each color is defined once and the light and dark variants sit together. The data file carries number, title, slug, blurb and topics.

---

## Facts verified before writing (do not rediscover)

These were established by building a throwaway Astro 7.4.11 project on 2026-11-12. Each one fails **silently or confusingly** if ignored.

1. **Astro 7 no longer installs the remark/rehype Markdown processor.** `markdown.remarkPlugins` needs `@astrojs/markdown-remark` installed, or the build stops with "no longer installed by default now that Sätteri is the default".
2. **There must be exactly one copy of `katex`.** `rehype-katex@7` depends on `katex@^0.16`. If the project installs `katex@0.19`, `import 'katex/contrib/mhchem'` registers `\ce` on the wrong copy and every chemical equation renders as literal text such as `\ce2NO(g)+O2(g)−>` **with no build error**. Install `katex@^0.16.47` and confirm `npm ls katex` shows one version, deduped.
3. **Content collections:** config lives at `src/content.config.ts`; use `glob` from `astro/loaders`, `z` from `astro/zod`, `defineCollection`/`getCollection`/`render` from `astro:content`. An entry's `id` is its path without extension, for example `unit-5/5-2-rate-law`.
4. **`<Content components={{ KeyIdea, Check }} />` works**, so MDX lessons use the building blocks with no `import` lines.
5. **Inside an MDX component, blank-line-separated children are Markdown** (paragraphs, lists, math), and `<div slot="why">…</div>` fills a named slot.
6. **Pagefind 1.6** still ships the classic `pagefind-ui.js` / `pagefind-ui.css`, and indexes only pages that contain `data-pagefind-body`.
7. **Fonts:** `@fontsource-variable/fraunces` and `/newsreader` provide `opsz.css` and `opsz-italic.css`; family names are `'Fraunces Variable'`, `'Newsreader Variable'`, `'Inter Variable'`.
8. **Server:** `rsync` exists on SiteGround (`/bin/rsync`), SSH is on port 18765, and `site-tools-client domain-all list` prints each site's `id=` for the cache flush.
9. **Shell:** on this Windows machine use Git Bash with forward-slash paths. Bash heredocs mangle backslashes — create files with the editor's Write tool, never `cat <<EOF`.

## Conventions for every task

- Work in `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study` (Git Bash: `/c/Users/sahan/Downloads/Chemistry_Resources/chem-study`). Never write inside the sibling folders (`Tro_Reference`, `ChemistrySlides`, the textbook PDFs) and never copy from them.
- After Task 1, all work is on the branch `topic/foundation`.
- Commit messages are conventional commits. **No AI-attribution trailer** (no `Co-Authored-By`, no "Generated with"); a hook blocks them.
- US spelling in code, comments and prose.
- Never swallow an error: handle it or let it propagate. Where a fallback is genuinely correct (for example storage blocked in private mode), a comment says why.

## File structure

```
chem-study/
  .github/workflows/deploy.yml     test on PR, deploy on main
  docs/DEPLOY.md                   deploy runbook
  docs/superpowers/{specs,plans}/  the spec and this plan
  public/
    favicon.svg  robots.txt  .htaccess  .chemstudy-site
    figures/5-2-order-and-rate.svg
  scripts/check-dist.mjs           post-build checks (exported + CLI)
  src/
    content.config.ts              lesson schema
    data/units.ts                  the 9 units and 91 topics; lookups
    lib/progress.ts                on-device progress behind one interface
    lib/check.ts                   grading for Check questions
    lib/lessons.ts                 lesson lookups (needs astro:content)
    scripts/progress-ui.ts         paints progress into any page
    styles/tokens.css base.css prose.css print.css
    layouts/Base.astro LessonLayout.astro
    components/Logo.astro Header.astro Footer.astro ThemeToggle.astro Search.astro
    components/lesson/KeyIdea.astro Worked.astro Trap.astro KeyPoints.astro
                      PracticeNext.astro Figure.astro Check.astro
    content/lessons/unit-5/5-2-rate-law.mdx
    pages/index.astro about.astro 404.astro
          [unit]/index.astro [unit]/[topic].astro
  tests/unit/units.test.ts progress.test.ts check.test.ts check-dist.test.ts
  tests/e2e/home.spec.ts lesson.spec.ts theme.spec.ts search.spec.ts
            a11y.spec.ts nojs.spec.ts
  astro.config.mjs  vitest.config.ts  playwright.config.ts  tsconfig.json
  package.json  .gitignore  .nvmrc  LICENSE  README.md
```

Each file has one job. `lib/` modules are plain TypeScript with no Astro imports (except `lessons.ts`), so Vitest can test them directly.

---

### Task 1: Create the repository

**Files:**
- Create: `README.md`, `.gitignore`, `.nvmrc`, `LICENSE`, `docs/superpowers/specs/…-design.md`, `docs/superpowers/plans/…-foundation.md`, `CLAUDE.md` (local only)

- [x] **Step 1: Confirm the target folder does not exist yet**

Run: `ls "/c/Users/sahan/Downloads/Chemistry_Resources"`
Expected: the two Tro PDFs, `ChemistrySlides`, possibly `Tro_Reference` — and **no** `chem-study`. If `chem-study` exists, stop and ask.

- [x] **Step 2: Create the folder and initialize git**

```bash
mkdir "/c/Users/sahan/Downloads/Chemistry_Resources/chem-study"
cd "/c/Users/sahan/Downloads/Chemistry_Resources/chem-study"
git init -b main
```

- [x] **Step 3: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
test-results/
playwright-report/
*.log
.DS_Store
Thumbs.db

# Reference books and slides live beside this repository, never inside it.
*.pdf
*.pptx
*.ppt
*.key
```

- [x] **Step 4: Write `.nvmrc`**

```
24
```

- [x] **Step 5: Write `README.md`**

```markdown
# ChemStudy

A free, self-contained AP® Chemistry resource: a lesson for every topic,
with worked examples, check-yourself questions and practice.
Live at <https://chem-study.com>.

## Develop

    npm install
    npm run dev        # local preview
    npm test           # unit tests
    npm run build      # build, index for search, check the output
    npm run test:e2e   # browser tests against the built site

Lessons are MDX files in `src/content/lessons/`. See
`docs/superpowers/specs/` for the design and `docs/DEPLOY.md` for deploys.

## License

Content and code: [CC BY-NC-SA 4.0](LICENSE).

AP® is a trademark registered by the College Board, which is not
affiliated with, and does not endorse, this site.
```

- [x] **Step 6: Copy the license, the spec and this plan from AP_Chem_Prep**

```bash
cp /d/AP_Chem_Prep/LICENSE LICENSE
mkdir -p docs/superpowers/specs docs/superpowers/plans
cd /d/AP_Chem_Prep
git show topic/chemstudy-design:docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md \
  > "/c/Users/sahan/Downloads/Chemistry_Resources/chem-study/docs/superpowers/specs/2026-11-12-chemstudy-redesign-design.md"
git show topic/chemstudy-design:docs/superpowers/plans/2026-11-12-chemstudy-foundation.md \
  > "/c/Users/sahan/Downloads/Chemistry_Resources/chem-study/docs/superpowers/plans/2026-11-12-chemstudy-foundation.md"
cd "/c/Users/sahan/Downloads/Chemistry_Resources/chem-study"
head -1 LICENSE
```

Expected: `Attribution-NonCommercial-ShareAlike 4.0 International`

- [x] **Step 7: Write `CLAUDE.md` and keep it out of the public repository**

```markdown
# ChemStudy — project guide

Public AP® Chemistry site at chem-study.com. Astro 7 static site.
Design: `docs/superpowers/specs/`. Deploy runbook: `docs/DEPLOY.md`.

## Rules

- `main` is protected: work on `topic/<name>`, land by pull request, the
  "Build and test" check must pass. Merging deploys automatically.
- No LaTeX toolchain here. Math is KaTeX notation inside `$…$`.
- The sibling folders in `Chemistry_Resources` (textbooks, slides,
  `Tro_Reference`) are copyrighted reference. Never copy them into this
  repository and never reuse their wording in a lesson.
- Lessons: one MDX file per AP topic, seven parts, no imports. The page
  supplies `KeyIdea`, `Worked`, `Check`, `Trap`, `KeyPoints`,
  `PracticeNext`, `Figure`.
- Every lesson is fact-checked before it is merged.

## Gotchas already paid for

- Exactly ONE copy of `katex` (0.16, matching rehype-katex). Two copies
  make every `\ce{}` render as literal text with no build error.
  `scripts/check-dist.mjs` fails the build if that happens.
- `@astrojs/markdown-remark` must stay installed; Astro 7 does not bring it.
- Run `npm run build` before `npm run test:e2e` conclusions: the browser
  tests run against the built site, not the dev server.
```

```bash
printf 'CLAUDE.md\n.claude/\n.superpowers/\n' >> .git/info/exclude
git status --short
```

Expected: `CLAUDE.md` is **not** listed.

- [x] **Step 8: Commit and create the GitHub repository**

```bash
git add .gitignore .nvmrc README.md LICENSE docs
git commit -m "chore: start the ChemStudy repository"
gh repo create SahanGH/chem-study --public --source . --remote origin --push \
  --description "ChemStudy: a free AP Chemistry resource (chem-study.com)"
git checkout -b topic/foundation
```

Expected: the repository URL is printed and the branch is `topic/foundation`.

---

### Task 2: Scaffold Astro and prove math renders

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "chem-study",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install astro @astrojs/mdx @astrojs/markdown-remark remark-math rehype-katex "katex@^0.16.47" \
  @fontsource-variable/fraunces @fontsource-variable/newsreader @fontsource-variable/inter
npm install -D pagefind vitest @playwright/test @axe-core/playwright node-html-parser
npx astro telemetry disable
```

- [ ] **Step 3: Verify there is one copy of katex**

Run: `npm ls katex`
Expected: every line shows `katex@0.16.x`, with the nested ones marked `deduped`. If any line shows a different version, run `npm install "katex@^0.16.47"` again and re-check. Do not continue until this holds.

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Write `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
// Registers \ce{...} on KaTeX. This works only while node_modules holds ONE
// copy of katex: rehype-katex depends on katex 0.16, so package.json pins
// the same range. With two copies \ce renders as literal text and the build
// still succeeds; scripts/check-dist.mjs fails the build if that happens.
import 'katex/contrib/mhchem';

export default defineConfig({
  site: 'https://chem-study.com',
  trailingSlash: 'always',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```

- [ ] **Step 6: Write a temporary `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head><meta charset="utf-8" /><title>ChemStudy</title></head>
  <body><h1>ChemStudy</h1></body>
</html>
```

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: `1 page(s) built` and `Complete!`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src
git commit -m "build: scaffold Astro 7 with MDX and build-time KaTeX"
```

---

### Task 3: The units and topics data

**Files:**
- Create: `vitest.config.ts`, `src/data/units.ts`
- Test: `tests/unit/units.test.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // tests/e2e holds Playwright specs, which Vitest must not pick up.
    include: ['tests/unit/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing test `tests/unit/units.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { topicByCode, unitBySlug, units } from '../../src/data/units';

describe('units data', () => {
  it('has the nine AP units in order', () => {
    expect(units.map((u) => u.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('has the topic count of the 2024 course framework for each unit', () => {
    expect(units.map((u) => u.topics.length)).toEqual([8, 7, 13, 9, 11, 9, 12, 11, 11]);
  });

  it('numbers topics consecutively within each unit', () => {
    for (const unit of units) {
      const expected = unit.topics.map((_, i) => `${unit.number}.${i + 1}`);
      expect(unit.topics.map((t) => t.code)).toEqual(expected);
    }
  });

  it('gives every unit a unique slug that starts with its number', () => {
    const slugs = units.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(9);
    for (const unit of units) expect(unit.slug.startsWith(`unit-${unit.number}-`)).toBe(true);
  });

  it('finds a topic and its unit by code', () => {
    const found = topicByCode('5.2');
    expect(found?.unit.number).toBe(5);
    expect(found?.topic.title).toBe('Introduction to Rate Law');
  });

  it('returns undefined for an unknown topic code or slug', () => {
    expect(topicByCode('5.99')).toBeUndefined();
    expect(unitBySlug('unit-12-nope')).toBeUndefined();
  });

  it('finds a unit by slug', () => {
    expect(unitBySlug('unit-5-kinetics')?.title).toBe('Kinetics');
  });
});
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../../src/data/units`.

- [ ] **Step 4: Write `src/data/units.ts`**

```ts
export interface Topic {
  /** AP topic code, for example "5.2". */
  code: string;
  title: string;
}

export interface Unit {
  number: number;
  title: string;
  /** URL segment, for example "unit-5-kinetics". */
  slug: string;
  /** One sentence shown at the top of the unit page. */
  blurb: string;
  topics: Topic[];
}

function unit(number: number, title: string, slug: string, blurb: string, titles: string[]): Unit {
  return {
    number,
    title,
    slug: `unit-${number}-${slug}`,
    blurb,
    topics: titles.map((t, i) => ({ code: `${number}.${i + 1}`, title: t })),
  };
}

// Topic titles follow the 2024 AP Chemistry Course and Exam Description.
export const units: Unit[] = [
  unit(1, 'Atomic Structure and Properties', 'atomic-structure',
    'What atoms are made of, how we count them, and why the periodic table is shaped the way it is.', [
      'Moles and Molar Mass',
      'Mass Spectra of Elements',
      'Elemental Composition of Pure Substances',
      'Composition of Mixtures',
      'Atomic Structure and Electron Configuration',
      'Photoelectron Spectroscopy',
      'Periodic Trends',
      'Valence Electrons and Ionic Compounds',
    ]),
  unit(2, 'Compound Structure and Properties', 'compound-structure',
    'How atoms bond, and how the shape of a molecule follows from its electrons.', [
      'Types of Chemical Bonds',
      'Intramolecular Force and Potential Energy',
      'Structure of Ionic Solids',
      'Structure of Metals and Alloys',
      'Lewis Diagrams',
      'Resonance and Formal Charge',
      'VSEPR and Hybridization',
    ]),
  unit(3, 'Properties of Substances and Mixtures', 'substances-and-mixtures',
    'Why substances melt, boil, dissolve and absorb light the way they do: forces between particles.', [
      'Intermolecular and Interparticle Forces',
      'Properties of Solids',
      'Solids, Liquids, and Gases',
      'Ideal Gas Law',
      'Kinetic Molecular Theory',
      'Deviation from Ideal Gas Law',
      'Solutions and Mixtures',
      'Representations of Solutions',
      'Separation of Solutions and Mixtures',
      'Solubility',
      'Spectroscopy and the Electromagnetic Spectrum',
      'Properties of Photons',
      'Beer–Lambert Law',
    ]),
  unit(4, 'Chemical Reactions', 'chemical-reactions',
    'Writing, balancing and classifying reactions, and using them to calculate amounts.', [
      'Introduction for Reactions',
      'Net Ionic Equations',
      'Representations of Reactions',
      'Physical and Chemical Changes',
      'Stoichiometry',
      'Introduction to Titration',
      'Types of Chemical Reactions',
      'Introduction to Acid–Base Reactions',
      'Oxidation–Reduction (Redox) Reactions',
    ]),
  unit(5, 'Kinetics', 'kinetics',
    'How fast reactions go, what controls the speed, and what the speed reveals about the steps in between.', [
      'Reaction Rates',
      'Introduction to Rate Law',
      'Concentration Changes over Time',
      'Elementary Reactions',
      'Collision Model',
      'Reaction Energy Profile',
      'Introduction to Reaction Mechanisms',
      'Reaction Mechanism and Rate Law',
      'Pre-Equilibrium Approximation',
      'Multistep Reaction Energy Profile',
      'Catalysis',
    ]),
  unit(6, 'Thermochemistry', 'thermochemistry',
    'Where the energy of a reaction comes from, where it goes, and how to measure it.', [
      'Endothermic and Exothermic Processes',
      'Energy Diagrams',
      'Heat Transfer and Thermal Equilibrium',
      'Heat Capacity and Calorimetry',
      'Energy of Phase Changes',
      'Introduction to Enthalpy of Reaction',
      'Bond Enthalpies',
      'Enthalpy of Formation',
      "Hess's Law",
    ]),
  unit(7, 'Equilibrium', 'equilibrium',
    'Reactions that run both ways, where they settle, and how they respond when disturbed.', [
      'Introduction to Equilibrium',
      'Direction of Reversible Reactions',
      'Reaction Quotient and Equilibrium Constant',
      'Calculating the Equilibrium Constant',
      'Magnitude of the Equilibrium Constant',
      'Properties of the Equilibrium Constant',
      'Calculating Equilibrium Concentrations',
      'Representations of Equilibrium',
      "Introduction to Le Châtelier's Principle",
      "Reaction Quotient and Le Châtelier's Principle",
      'Introduction to Solubility Equilibria',
      'Common-Ion Effect',
    ]),
  unit(8, 'Acids and Bases', 'acids-and-bases',
    'pH, weak and strong acids, titrations and buffers: equilibrium applied to proton transfer.', [
      'Introduction to Acids and Bases',
      'pH and pOH of Strong Acids and Bases',
      'Weak Acid and Base Equilibria',
      'Acid–Base Reactions and Buffers',
      'Acid–Base Titrations',
      'Molecular Structure of Acids and Bases',
      'pH and pKa',
      'Properties of Buffers',
      'Henderson–Hasselbalch Equation',
      'Buffer Capacity',
      'pH and Solubility',
    ]),
  unit(9, 'Thermodynamics and Electrochemistry', 'thermodynamics',
    'Why some reactions happen on their own, and how to turn that tendency into electricity.', [
      'Introduction to Entropy',
      'Absolute Entropy and Entropy Change',
      'Gibbs Free Energy and Thermodynamic Favorability',
      'Thermodynamic and Kinetic Control',
      'Free Energy and Equilibrium',
      'Free Energy of Dissolution',
      'Coupled Reactions',
      'Galvanic (Voltaic) and Electrolytic Cells',
      'Cell Potential and Free Energy',
      'Cell Potential Under Nonstandard Conditions',
      "Electrolysis and Faraday's Law",
    ]),
];

export function unitBySlug(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}

export function topicByCode(code: string): { unit: Unit; topic: Topic } | undefined {
  for (const unit of units) {
    const topic = unit.topics.find((t) => t.code === code);
    if (topic) return { unit, topic };
  }
  return undefined;
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npm test`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/data/units.ts tests/unit/units.test.ts
git commit -m "feat: add the nine units and their topics"
```

---

### Task 4: The progress module

**Files:**
- Create: `src/lib/progress.ts`
- Test: `tests/unit/progress.test.ts`

- [ ] **Step 1: Write the failing test `tests/unit/progress.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { createProgress, type KeyValueStore } from '../../src/lib/progress';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe('progress', () => {
  it('reports nothing done on a fresh device', () => {
    const progress = createProgress(memoryStore());
    expect(progress.isDone('5.2')).toBe(false);
    expect(progress.lastVisited()).toBeNull();
    expect(progress.unitProgress(['5.1', '5.2'])).toEqual({ done: 0, total: 2 });
  });

  it('marks a topic done only when every check has been answered', () => {
    const progress = createProgress(memoryStore());
    expect(progress.recordAnswer('5.2', 0, 3)).toBe(false);
    expect(progress.recordAnswer('5.2', 1, 3)).toBe(false);
    expect(progress.isDone('5.2')).toBe(false);
    expect(progress.recordAnswer('5.2', 2, 3)).toBe(true);
    expect(progress.isDone('5.2')).toBe(true);
  });

  it('does not count the same check twice', () => {
    const progress = createProgress(memoryStore());
    progress.recordAnswer('5.2', 0, 2);
    progress.recordAnswer('5.2', 0, 2);
    expect(progress.isDone('5.2')).toBe(false);
  });

  it('marks a topic done directly', () => {
    const progress = createProgress(memoryStore());
    progress.markDone('5.1');
    expect(progress.isDone('5.1')).toBe(true);
    expect(progress.unitProgress(['5.1', '5.2'])).toEqual({ done: 1, total: 2 });
  });

  it('remembers progress in the store across instances', () => {
    const store = memoryStore();
    createProgress(store).markDone('5.1');
    createProgress(store).setLastVisited({ path: '/unit-5-kinetics/5-2-rate-law/', title: 'Introduction to Rate Law' });
    const later = createProgress(store);
    expect(later.isDone('5.1')).toBe(true);
    expect(later.lastVisited()).toEqual({ path: '/unit-5-kinetics/5-2-rate-law/', title: 'Introduction to Rate Law' });
  });

  it('starts fresh when the stored value is not valid JSON', () => {
    const progress = createProgress(memoryStore({ 'chemstudy:progress:v1': '{not json' }));
    expect(progress.isDone('5.2')).toBe(false);
    progress.markDone('5.2');
    expect(progress.isDone('5.2')).toBe(true);
  });

  it('works for the current page when there is no store at all', () => {
    const progress = createProgress(null);
    progress.markDone('5.2');
    expect(progress.isDone('5.2')).toBe(true);
  });

  it('keeps working when the store refuses writes', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const progress = createProgress(store);
    expect(() => progress.markDone('5.2')).not.toThrow();
    expect(progress.isDone('5.2')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../../src/lib/progress`.

- [ ] **Step 3: Write `src/lib/progress.ts`**

```ts
/**
 * On-device progress. Pages use only the Progress interface, so a version
 * backed by an account can replace this one later without touching them.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LastVisited {
  path: string;
  title: string;
}

export interface Progress {
  /** Records one answered check. Returns true if the topic is now done. */
  recordAnswer(topic: string, checkIndex: number, totalChecks: number): boolean;
  markDone(topic: string): void;
  isDone(topic: string): boolean;
  unitProgress(topicCodes: string[]): { done: number; total: number };
  setLastVisited(page: LastVisited): void;
  lastVisited(): LastVisited | null;
}

interface State {
  answered: Record<string, number[]>;
  done: string[];
  last: LastVisited | null;
}

const KEY = 'chemstudy:progress:v1';
const empty = (): State => ({ answered: {}, done: [], last: null });

export function createProgress(store: KeyValueStore | null): Progress {
  // Used when there is no store, or after the store refuses a write.
  let memory: State | null = null;

  function read(): State {
    if (memory) return memory;
    if (!store) return (memory = empty());
    const raw = store.getItem(KEY);
    if (raw === null) return empty();
    try {
      return { ...empty(), ...(JSON.parse(raw) as Partial<State>) };
    } catch {
      // A corrupt value cannot be repaired; the student starts fresh and
      // the next write replaces it.
      return empty();
    }
  }

  function write(state: State): void {
    if (!store) {
      memory = state;
      return;
    }
    try {
      store.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode). Progress still works for
      // the rest of this page view; it just will not survive a reload.
      memory = state;
    }
  }

  function markDone(topic: string): void {
    const state = read();
    if (!state.done.includes(topic)) {
      state.done.push(topic);
      write(state);
    }
  }

  return {
    recordAnswer(topic, checkIndex, totalChecks) {
      const state = read();
      const answered = new Set(state.answered[topic] ?? []);
      answered.add(checkIndex);
      state.answered[topic] = [...answered];
      write(state);
      if (answered.size >= totalChecks) {
        markDone(topic);
        return true;
      }
      return false;
    },
    markDone,
    isDone: (topic) => read().done.includes(topic),
    unitProgress(topicCodes) {
      const done = read().done;
      return { done: topicCodes.filter((c) => done.includes(c)).length, total: topicCodes.length };
    },
    setLastVisited(page) {
      const state = read();
      state.last = page;
      write(state);
    },
    lastVisited: () => read().last,
  };
}

let shared: Progress | null = null;

/** The one Progress instance for the current page. */
export function browserProgress(): Progress {
  if (shared) return shared;
  let store: KeyValueStore | null = null;
  try {
    // Merely touching localStorage throws when the browser blocks storage.
    store = window.localStorage;
    store.getItem(KEY);
  } catch {
    store = null;
  }
  return (shared = createProgress(store));
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npm test`
Expected: PASS, 15 tests (7 units + 8 progress).

- [ ] **Step 5: Commit**

```bash
git add src/lib/progress.ts tests/unit/progress.test.ts
git commit -m "feat: add on-device progress behind one interface"
```

---

### Task 5: Grading logic for Check questions

**Files:**
- Create: `src/lib/check.ts`
- Test: `tests/unit/check.test.ts`

- [ ] **Step 1: Write the failing test `tests/unit/check.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { gradeChoice, gradeNumeric, parseNumber } from '../../src/lib/check';

describe('gradeChoice', () => {
  it('accepts the option whose 1-based number matches the answer', () => {
    expect(gradeChoice(3, 3)).toBe(true);
    expect(gradeChoice(1, 3)).toBe(false);
  });
});

describe('parseNumber', () => {
  it.each([
    ['0.020', 0.02],
    ['  2.5 ', 2.5],
    ['-3', -3],
    ['2.5e-3', 0.0025],
    ['2.5E3', 2500],
    ['2.5×10^-3', 0.0025],
    ['2.5 x 10^-3', 0.0025],
    ['2.5*10^3', 2500],
    ['1,200', 1200],
  ])('reads %s', (text, value) => {
    expect(parseNumber(text)).toBeCloseTo(value, 12);
  });

  it.each(['', 'abc', '2..5', '1e', '10^3'])('rejects %s', (text) => {
    expect(parseNumber(text)).toBeNull();
  });
});

describe('gradeNumeric', () => {
  it('accepts an answer within 2 percent', () => {
    expect(gradeNumeric('0.020', 0.02)).toBe('correct');
    expect(gradeNumeric('0.0204', 0.02)).toBe('correct');
    expect(gradeNumeric('2.0e-2', 0.02)).toBe('correct');
  });

  it('rejects an answer outside 2 percent', () => {
    expect(gradeNumeric('0.021', 0.02)).toBe('incorrect');
    expect(gradeNumeric('0.2', 0.02)).toBe('incorrect');
  });

  it('rejects the right size with the wrong sign', () => {
    expect(gradeNumeric('-0.02', 0.02)).toBe('incorrect');
  });

  it('reports text that is not a number', () => {
    expect(gradeNumeric('about two', 0.02)).toBe('invalid');
    expect(gradeNumeric('', 0.02)).toBe('invalid');
  });

  it('compares against zero with an absolute tolerance', () => {
    expect(gradeNumeric('0', 0)).toBe('correct');
    expect(gradeNumeric('0.5', 0)).toBe('incorrect');
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../../src/lib/check`.

- [ ] **Step 3: Write `src/lib/check.ts`**

```ts
/** Grading for Check questions. No DOM here, so it is testable directly. */

export type NumericGrade = 'correct' | 'incorrect' | 'invalid';

/** Fraction of the expected value a numeric answer may differ by. */
const TOLERANCE = 0.02;

export function gradeChoice(selected: number, answer: number): boolean {
  return selected === answer;
}

/**
 * Reads what a student types for a number: plain decimals, e-notation
 * ("2.5e-3") and the handwritten form ("2.5×10^-3", "2.5 x 10^-3").
 * Returns null when the text is not a number.
 */
export function parseNumber(text: string): number | null {
  const compact = text.trim().replace(/,/g, '').replace(/\s+/g, '');
  const normalized = compact.replace(/[×x*]10\^/i, 'e');
  if (!/^[+-]?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(normalized)) return null;
  return Number(normalized);
}

export function gradeNumeric(text: string, answer: number): NumericGrade {
  const value = parseNumber(text);
  if (value === null) return 'invalid';
  const allowed = answer === 0 ? 1e-9 : Math.abs(answer) * TOLERANCE;
  return Math.abs(value - answer) <= allowed ? 'correct' : 'incorrect';
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npm test`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/check.ts tests/unit/check.test.ts
git commit -m "feat: add grading for choice and numeric check questions"
```

---

### Task 6: Design tokens, base styles and the page shell

**Files:**
- Create: `playwright.config.ts`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/print.css`, `src/components/Logo.astro`, `src/components/ThemeToggle.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/Base.astro`, `public/favicon.svg`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4321' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  // The tests run against the BUILT site, so they see what ships: rendered
  // math, the search index, hashed assets. Always rebuild; a reused server
  // would serve stale pages.
  webServer: {
    command: 'npm run build && npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Install the browser**

Run: `npx playwright install chromium`
Expected: Chromium downloads (or "is already installed").

- [ ] **Step 3: Write the failing test `tests/e2e/theme.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('the page shell has a header, main content and a footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'ChemStudy home' })).toBeVisible();
  await expect(page.locator('main#main')).toBeVisible();
  await expect(page.locator('footer')).toContainText('AP® is a trademark');
});

test('the theme follows the device, can be switched, and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Switch between light and dark theme' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('a device set to dark starts dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
```

- [ ] **Step 4: Run it and watch it fail**

Run: `npm run test:e2e -- theme`
Expected: FAIL — no link named "ChemStudy home".

- [ ] **Step 5: Write `src/styles/tokens.css`**

Every `--u-ink` below was computed to give at least 4.6:1 against both the page background and that unit's `--u-tint`, in both themes. Do not adjust one by eye.

```css
:root {
  color-scheme: light;
  --paper: #fdfcf9;
  --card: #ffffff;
  --line: #ebe6dc;
  --ink: #26231f;
  --muted: #6b655d;
  --ok: #3f6b3a;
  --ok-bg: #f1f6ee;
  --no: #9a4a3f;
  --no-bg: #faf0ee;

  /* Unit accent. Neutral until an element carries data-unit. */
  --u: #6b655d;
  --u-ink: #26231f;
  --u-tint: #f4f1ea;

  --font-head: 'Fraunces Variable', Georgia, 'Times New Roman', serif;
  --font-text: 'Newsreader Variable', Georgia, 'Times New Roman', serif;
  --font-ui: 'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --step--1: clamp(0.81rem, 0.79rem + 0.1vw, 0.88rem);
  --step-0: clamp(1.06rem, 1.02rem + 0.2vw, 1.19rem);
  --step-1: clamp(1.25rem, 1.17rem + 0.4vw, 1.5rem);
  --step-2: clamp(1.6rem, 1.4rem + 1vw, 2.25rem);
  --step-3: clamp(2rem, 1.6rem + 2vw, 3rem);

  --space: clamp(1.25rem, 1rem + 1.5vw, 2.5rem);
  --measure: 40rem;
  --radius: 12px;
}

[data-theme='dark'] {
  color-scheme: dark;
  --paper: #1b1916;
  --card: #24211d;
  --line: #38342e;
  --ink: #ede8df;
  --muted: #a8a196;
  --ok: #a9cda2;
  --ok-bg: #232b21;
  --no: #e3a69c;
  --no-bg: #2e211f;
  --u: #a8a196;
  --u-ink: #ede8df;
  --u-tint: #24211d;
}

[data-unit='1'] { --u: #b9736b; --u-ink: #9e534b; --u-tint: #f3e9e5; }
[data-unit='2'] { --u: #c08a5a; --u-ink: #8f6037; --u-tint: #f4ece3; }
[data-unit='3'] { --u: #a8924c; --u-ink: #796937; --u-tint: #f1ede1; }
[data-unit='4'] { --u: #7f9c70; --u-ink: #5a714e; --u-tint: #ebefe6; }
[data-unit='5'] { --u: #6f9a94; --u-ink: #4f706c; --u-tint: #e9eeeb; }
[data-unit='6'] { --u: #7590b3; --u-ink: #4f6b8f; --u-tint: #eaedef; }
[data-unit='7'] { --u: #8e86b5; --u-ink: #6b609d; --u-tint: #edebef; }
[data-unit='8'] { --u: #a97f9e; --u-ink: #885b7c; --u-tint: #f1ebec; }
[data-unit='9'] { --u: #b97a88; --u-ink: #9c5263; --u-tint: #f3eae9; }

[data-theme='dark'] [data-unit='1'] { --u-ink: #c48882; --u-tint: #3b2b27; }
[data-theme='dark'] [data-unit='2'] { --u-ink: #c49163; --u-tint: #3c3024; }
[data-theme='dark'] [data-unit='3'] { --u-ink: #b09951; --u-tint: #373121; }
[data-theme='dark'] [data-unit='4'] { --u-ink: #88a37b; --u-tint: #2f3328; }
[data-theme='dark'] [data-unit='5'] { --u-ink: #7ba29d; --u-tint: #2c332f; }
[data-theme='dark'] [data-unit='6'] { --u-ink: #849cbb; --u-tint: #2d3135; }
[data-theme='dark'] [data-unit='7'] { --u-ink: #9b94be; --u-tint: #322f36; }
[data-theme='dark'] [data-unit='8'] { --u-ink: #b38eaa; --u-tint: #372d31; }
[data-theme='dark'] [data-unit='9'] { --u-ink: #c28b97; --u-tint: #3b2c2d; }
```

- [ ] **Step 6: Write `src/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-padding-top: 5rem;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-text);
  font-size: var(--step-0);
  line-height: 1.65;
}

/* A soft cross-fade between pages, in browsers that support it. */
@view-transition {
  navigation: auto;
}
@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
}

a {
  color: inherit;
  text-decoration-color: var(--u);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}
a:hover {
  text-decoration-thickness: 2px;
}

:focus-visible {
  outline: 2px solid var(--u-ink);
  outline-offset: 3px;
  border-radius: 4px;
}

h1,
h2,
h3 {
  font-family: var(--font-head);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.015em;
  margin: 0;
}
h1 { font-size: var(--step-3); }
h2 { font-size: var(--step-2); }
h3 { font-size: var(--step-1); }

.eyebrow,
.kicker,
.label {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0;
}
.kicker {
  color: var(--u-ink);
}

.lede {
  font-size: var(--step-1);
  line-height: 1.5;
  color: var(--muted);
  max-width: 36rem;
  margin: 1rem 0 0;
}

.skip-link {
  position: absolute;
  left: -999rem;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
  z-index: 10;
  background: var(--card);
  padding: 0.5rem 1rem;
}

.site-header,
main,
.site-footer {
  width: min(100% - 2 * var(--space), 72rem);
  margin-inline: auto;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.1rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-head);
  font-size: var(--step-1);
  font-weight: 500;
  text-decoration: none;
}
.logo-tile text {
  fill: currentColor;
  font-family: var(--font-head);
}
.logo-tile .logo-z {
  font-family: var(--font-ui);
}
.site-header nav {
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 2vw, 1.5rem);
  font-family: var(--font-ui);
  font-size: var(--step--1);
}
.site-header nav a {
  color: var(--muted);
  text-decoration: none;
  padding-block: 0.6rem;
}
.site-header nav a:hover {
  color: var(--ink);
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}
.icon-btn:hover {
  background: var(--card);
}

.button {
  display: inline-block;
  font-family: var(--font-ui);
  font-size: var(--step--1);
  font-weight: 500;
  padding: 0.8rem 1.4rem;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  text-decoration: none;
  border: 0;
  cursor: pointer;
}

main {
  padding-block: var(--space) calc(var(--space) * 2);
}

.site-footer {
  border-top: 1px solid var(--line);
  padding-block: 1.5rem 2.5rem;
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
}
.site-footer p {
  margin: 0.3rem 0;
  max-width: 44rem;
}
```

- [ ] **Step 7: Write `src/styles/print.css`**

```css
@media print {
  .site-header,
  .site-footer,
  .topic-nav,
  .section-nav,
  .prev-next,
  .skip-link,
  dialog {
    display: none !important;
  }
  body {
    background: #fff;
    color: #000;
    font-size: 11pt;
  }
  main {
    width: 100%;
    padding: 0;
  }
  a {
    text-decoration: none;
  }
  /* On paper there is nothing to click, so every answer is shown. */
  .check-why > summary {
    display: none;
  }
  [data-part] {
    break-inside: avoid;
  }
}
```

- [ ] **Step 8: Write `src/components/Logo.astro`**

```astro
---
interface Props {
  /** Width in pixels; height keeps the tile's 46:52 shape. */
  size?: number;
}
const { size = 30 } = Astro.props;
---

<svg
  class="logo-tile"
  width={size}
  height={Math.round((size * 52) / 46)}
  viewBox="0 0 46 52"
  aria-hidden="true"
>
  <rect x="1" y="1" width="44" height="50" rx="7" fill="none" stroke="currentColor" stroke-width="2"></rect>
  <text class="logo-z" x="6" y="14" font-size="9" font-weight="600">55</text>
  <text x="23" y="39" text-anchor="middle" font-size="25" font-weight="600">Cs</text>
</svg>
```

- [ ] **Step 9: Write `src/components/ThemeToggle.astro`**

```astro
<button
  class="icon-btn"
  type="button"
  data-theme-toggle
  aria-label="Switch between light and dark theme"
>
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r="7.2" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
    <path d="M9 1.8a7.2 7.2 0 0 1 0 14.4z" fill="currentColor"></path>
  </svg>
</button>

<script>
  const KEY = 'chemstudy:theme';
  for (const button of document.querySelectorAll('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // Storage blocked (private mode): the theme still switches for
        // this page, it just is not remembered.
      }
    });
  }
</script>
```

- [ ] **Step 10: Write `src/components/Header.astro`**

```astro
---
import Logo from './Logo.astro';
import ThemeToggle from './ThemeToggle.astro';
---

<header class="site-header">
  <a class="brand" href="/" aria-label="ChemStudy home">
    <Logo />
    <span>ChemStudy</span>
  </a>
  <nav aria-label="Main">
    <a href="/#units">Units</a>
    <a href="/about/">About</a>
    <ThemeToggle />
  </nav>
</header>
```

- [ ] **Step 11: Write `src/components/Footer.astro`**

```astro
<footer class="site-footer">
  <p>
    ChemStudy is free to use and share under
    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.
  </p>
  <p>
    AP® is a trademark registered by the College Board, which is not affiliated with, and does
    not endorse, this site.
  </p>
</footer>
```

- [ ] **Step 12: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 52">
  <rect x="1" y="1" width="44" height="50" rx="7" fill="#FDFCF9" stroke="#26231F" stroke-width="2"/>
  <text x="6" y="14" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#4F706C">55</text>
  <text x="23" y="39" text-anchor="middle" font-family="Georgia, serif" font-size="25" font-weight="700" fill="#26231F">Cs</text>
</svg>
```

- [ ] **Step 13: Write `src/layouts/Base.astro`**

```astro
---
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource-variable/inter';
import 'katex/dist/katex.min.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/print.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  /** Unit number: sets the page's accent color. */
  unit?: number;
  /** Topic code, on lesson pages only. */
  topic?: string;
}
const { title, description, unit, topic } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script is:inline>
      // Runs before first paint so the page never flashes the wrong theme.
      (function () {
        var theme = null;
        try {
          theme = localStorage.getItem('chemstudy:theme');
        } catch (e) {
          // Storage blocked: fall through to the device setting.
        }
        if (theme !== 'light' && theme !== 'dark') {
          theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.dataset.theme = theme;
      })();
    </script>
  </head>
  <body data-unit={unit}>
    <a class="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main" data-topic={topic}>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 14: Replace `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base
  title="ChemStudy: AP® Chemistry, explained"
  description="Clear lessons, worked examples and practice for every AP Chemistry topic. Free."
>
  <h1>AP® Chemistry, explained so it <em>finally clicks</em>.</h1>
</Base>
```

- [ ] **Step 15: Run the test and watch it pass**

Run: `npm run test:e2e -- theme`
Expected: PASS, 6 tests (3 tests × 2 projects).

- [ ] **Step 16: Commit**

```bash
git add playwright.config.ts src public tests/e2e/theme.spec.ts
git commit -m "feat: add the brand tokens, page shell and theme switch"
```

---

### Task 7: Lesson schema and the static building blocks

**Files:**
- Create: `src/content.config.ts`, `src/lib/lessons.ts`, `src/styles/prose.css`, `src/components/lesson/KeyIdea.astro`, `Worked.astro`, `Trap.astro`, `KeyPoints.astro`, `PracticeNext.astro`, `Figure.astro`
- Modify: `src/layouts/Base.astro` (import `prose.css`)

These components are checked by the browser tests in Task 9, once a lesson page exists to render them.

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { topicByCode } from './data/units';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    // The title and unit come from src/data/units.ts, looked up by this code.
    topic: z
      .string()
      .regex(/^[1-9]\.\d{1,2}$/, 'topic must look like "5.2"')
      .refine((code) => topicByCode(code) !== undefined, {
        message: 'topic is not one of the AP topics in src/data/units.ts',
      }),
    minutes: z.number().int().min(1).max(60),
    summary: z.string().min(20).max(200),
  }),
});

export const collections = { lessons };
```

- [ ] **Step 2: Write `src/lib/lessons.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

export type Lesson = CollectionEntry<'lessons'>;

/** "unit-5/5-2-rate-law" -> "5-2-rate-law": the last URL segment. */
export function lessonSlug(lesson: Lesson): string {
  const slug = lesson.id.split('/').pop();
  if (!slug) throw new Error(`Lesson has an empty id: ${JSON.stringify(lesson.id)}`);
  return slug;
}

export function lessonPath(unitSlug: string, lesson: Lesson): string {
  return `/${unitSlug}/${lessonSlug(lesson)}/`;
}

/** Every published lesson, keyed by topic code. Two lessons for one topic is an error. */
export async function lessonsByTopic(): Promise<Map<string, Lesson>> {
  const byTopic = new Map<string, Lesson>();
  for (const lesson of await getCollection('lessons')) {
    const existing = byTopic.get(lesson.data.topic);
    if (existing) {
      throw new Error(
        `Two lessons claim topic ${lesson.data.topic}: ${existing.id} and ${lesson.id}. Keep one.`,
      );
    }
    byTopic.set(lesson.data.topic, lesson);
  }
  return byTopic;
}
```

- [ ] **Step 3: Write `src/components/lesson/KeyIdea.astro`**

```astro
<aside class="key-idea" data-part="key-idea">
  <p class="label">Key idea</p>
  <slot />
</aside>
```

- [ ] **Step 4: Write `src/components/lesson/Worked.astro`**

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<section class="worked" data-part="worked">
  <p class="label">Worked example</p>
  <h3>{title}</h3>
  <slot />
</section>
```

- [ ] **Step 5: Write `src/components/lesson/Trap.astro`**

```astro
<aside class="trap" data-part="trap">
  <p class="label">Common mistake</p>
  <slot />
</aside>
```

- [ ] **Step 6: Write `src/components/lesson/KeyPoints.astro`**

```astro
<section class="key-points" data-part="key-points">
  <h2 id="key-points">Key points</h2>
  <slot />
</section>
```

- [ ] **Step 7: Write `src/components/lesson/PracticeNext.astro`**

```astro
---
interface Props {
  /** Practice for this topic. Empty until the practice layer exists. */
  items?: { title: string; href: string }[];
}
const { items = [] } = Astro.props;
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

- [ ] **Step 8: Write `src/components/lesson/Figure.astro`**

```astro
---
interface Props {
  src: string;
  /** What the figure shows, for someone who cannot see it. Required. */
  alt: string;
  caption: string;
}
const { src, alt, caption } = Astro.props;
if (!alt.trim()) throw new Error(`Figure ${src} needs alt text that describes it.`);
---

<figure class="figure" data-part="figure">
  <img src={src} alt={alt} loading="lazy" decoding="async" />
  <figcaption>{caption}</figcaption>
</figure>
```

- [ ] **Step 9: Write `src/styles/prose.css`**

```css
.prose {
  max-width: var(--measure);
}
.prose > * + * {
  margin-top: 1.1em;
}
.prose p {
  margin: 0;
}
.prose h1 {
  margin-top: 0.4rem;
}
.prose h2 {
  margin-top: 2.2em;
}
.prose h3 {
  margin-top: 0.3rem;
}
.prose ul,
.prose ol {
  margin-block: 0;
  padding-left: 1.3em;
}
.prose li + li {
  margin-top: 0.35em;
}
.prose strong {
  font-weight: 600;
}

.prose table {
  border-collapse: collapse;
  font-family: var(--font-ui);
  font-size: var(--step--1);
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
.prose th,
.prose td {
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--line);
  text-align: left;
}
.prose th {
  font-weight: 600;
  color: var(--muted);
}

/* Wide equations scroll inside themselves; the page never scrolls sideways. */
.katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 0.3rem;
  margin-block: 1.2em;
}

.key-idea {
  background: var(--u-tint);
  border-left: 4px solid var(--u);
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 1rem 1.25rem;
}
.key-idea .label {
  color: var(--u-ink);
}
.key-idea > * + * {
  margin-top: 0.4em;
}

.worked,
.trap,
cs-check {
  display: block;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.1rem 1.25rem 1.25rem;
}
.worked > * + *,
.trap > * + *,
.check-body > * + * {
  margin-top: 0.8em;
}
.trap {
  border-left: 4px solid var(--no);
}
.trap .label {
  color: var(--no);
}

.key-points {
  border-top: 1px solid var(--line);
  padding-top: 0.2rem;
}
.key-points > * + *,
.practice-next > * + * {
  margin-top: 0.9em;
}

.figure {
  margin-inline: 0;
}
/* Diagrams are drawn for a light page, so they keep a paper card in both themes. */
.figure img {
  display: block;
  max-width: 100%;
  height: auto;
  background: #fdfcf9;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.figure figcaption {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
  margin-top: 0.5rem;
}
```

- [ ] **Step 10: Import `prose.css` in `src/layouts/Base.astro`**

Add one line after `import '../styles/base.css';`:

```astro
import '../styles/prose.css';
```

- [ ] **Step 11: Build**

Run: `npm run build`
Expected: `Complete!` with no schema errors. (The lessons folder is empty; Astro may warn that the collection has no entries — that is expected until Task 9.)

- [ ] **Step 12: Commit**

```bash
git add src/content.config.ts src/lib/lessons.ts src/components/lesson src/styles/prose.css src/layouts/Base.astro
git commit -m "feat: add the lesson schema and static lesson building blocks"
```

---

### Task 8: The Check question

**Files:**
- Create: `src/components/lesson/Check.astro`
- Modify: `src/styles/prose.css`

A Check is written in a lesson like this. `answer` is the **1-based** number of the correct option:

```mdx
<Check answer={3}>
Doubling $[\ce{A}]$ makes the rate four times faster. What is the order in A?

- 0
- 1
- 2
- 4

<div slot="why">Rate is proportional to $[\ce{A}]^m$, and $2^m = 4$ gives $m = 2$.</div>
</Check>
```

or, for a number, `<Check numeric={0.020} unit="M/s">…</Check>` with no list.

Without JavaScript the options are a plain list and the answer sits behind a "Show answer" disclosure. With JavaScript the list becomes buttons with instant feedback.

- [ ] **Step 1: Write `src/components/lesson/Check.astro`**

```astro
---
interface Props {
  /** 1-based number of the correct option in the list. */
  answer?: number;
  /** The correct value, for a question answered with a number. */
  numeric?: number;
  /** Unit shown beside the numeric input, for example "M/s". */
  unit?: string;
}
const { answer, numeric, unit } = Astro.props;
if ((answer === undefined) === (numeric === undefined)) {
  throw new Error('A Check needs exactly one of `answer` (option number) or `numeric` (a value).');
}
const shown = numeric !== undefined ? `${numeric}${unit ? ` ${unit}` : ''}` : `option ${answer}`;
---

<cs-check data-part="check" data-answer={answer} data-numeric={numeric} data-unit={unit}>
  <p class="label">Check yourself</p>
  <div class="check-body"><slot /></div>
  <p class="check-feedback" role="status"></p>
  <details class="check-why">
    <summary>Show answer</summary>
    <p class="check-answer">Answer: {shown}</p>
    <slot name="why" />
  </details>
</cs-check>

<script>
  import { gradeChoice, gradeNumeric } from '../../lib/check';
  import { browserProgress } from '../../lib/progress';

  class CsCheck extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = 'true';

      const body = this.querySelector<HTMLElement>('.check-body');
      const feedback = this.querySelector<HTMLElement>('.check-feedback');
      const why = this.querySelector<HTMLDetailsElement>('.check-why');
      if (!body || !feedback || !why) throw new Error('cs-check is missing part of its markup.');

      const say = (text: string, state: 'ok' | 'no') => {
        feedback.textContent = text;
        feedback.dataset.state = state;
      };
      const finish = () => {
        say('Correct.', 'ok');
        why.open = true;
        this.record();
      };

      if (this.dataset.numeric !== undefined) {
        this.enhanceNumeric(body, Number(this.dataset.numeric), say, finish);
      } else {
        this.enhanceChoice(body, Number(this.dataset.answer), say, finish);
      }
      // Only now hide the "Show answer" disclosure: if anything above threw,
      // the student still has the no-JavaScript version.
      this.classList.add('is-enhanced');
    }

    enhanceChoice(
      body: HTMLElement,
      answer: number,
      say: (text: string, state: 'ok' | 'no') => void,
      finish: () => void,
    ) {
      const list = body.querySelector('ul, ol');
      if (!list) throw new Error('A choice Check needs a list of options.');
      const buttons: HTMLButtonElement[] = [];
      Array.from(list.children).forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'check-option';
        button.append(...Array.from(item.childNodes));
        item.append(button);
        buttons.push(button);
        button.addEventListener('click', () => {
          if (gradeChoice(index + 1, answer)) {
            button.classList.add('is-correct');
            for (const other of buttons) other.disabled = true;
            finish();
          } else {
            button.classList.add('is-wrong');
            button.disabled = true;
            say('Not quite. Try another.', 'no');
          }
        });
      });
      list.classList.add('check-options');
    }

    enhanceNumeric(
      body: HTMLElement,
      answer: number,
      say: (text: string, state: 'ok' | 'no') => void,
      finish: () => void,
    ) {
      const form = document.createElement('form');
      form.className = 'check-numeric';
      const label = document.createElement('label');
      label.textContent = 'Your answer ';
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.autocomplete = 'off';
      label.append(input);
      if (this.dataset.unit) label.append(` ${this.dataset.unit}`);
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'button';
      submit.textContent = 'Check';
      form.append(label, submit);
      body.append(form);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const grade = gradeNumeric(input.value, answer);
        if (grade === 'invalid') {
          say('Enter a number, for example 0.25 or 2.5e-3.', 'no');
        } else if (grade === 'incorrect') {
          say('Not quite. Check your setup and try again.', 'no');
        } else {
          input.disabled = true;
          submit.disabled = true;
          finish();
        }
      });
    }

    record() {
      const main = this.closest<HTMLElement>('main[data-topic]');
      const topic = main?.dataset.topic;
      if (!main || !topic) return; // A Check outside a lesson has no topic to credit.
      const checks = Array.from(main.querySelectorAll('cs-check'));
      browserProgress().recordAnswer(topic, checks.indexOf(this), checks.length);
      document.dispatchEvent(new CustomEvent('chemstudy:progress'));
    }
  }

  customElements.define('cs-check', CsCheck);
</script>
```

- [ ] **Step 2: Append the Check styles to `src/styles/prose.css`**

```css
.check-options {
  list-style: none;
  padding-left: 0;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
}
.prose .check-options li + li {
  margin-top: 0;
}
.check-option {
  width: 100%;
  min-height: 2.75rem;
  text-align: left;
  font: inherit;
  color: inherit;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
}
.check-option:hover:not(:disabled) {
  border-color: var(--u-ink);
}
.check-option.is-correct {
  background: var(--ok-bg);
  border-color: var(--ok);
  color: var(--ok);
}
.check-option.is-wrong {
  background: var(--no-bg);
  border-color: var(--no);
  color: var(--no);
}

.check-numeric {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-ui);
  font-size: var(--step--1);
}
.check-numeric input {
  font: inherit;
  width: 8rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.7rem;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--muted);
  border-radius: 8px;
}

.check-feedback {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  font-weight: 500;
  min-height: 1.6em;
  margin-top: 0.8rem;
}
.check-feedback[data-state='ok'] {
  color: var(--ok);
}
.check-feedback[data-state='no'] {
  color: var(--no);
}

.check-why {
  margin-top: 0.6rem;
}
.check-why > summary {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  cursor: pointer;
  color: var(--muted);
}
.check-why > * + * {
  margin-top: 0.5em;
}
/* With JavaScript the answer opens by itself once the question is right. */
cs-check.is-enhanced .check-why > summary,
cs-check.is-enhanced .check-answer {
  display: none;
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/components/lesson/Check.astro src/styles/prose.css
git commit -m "feat: add the Check question with instant feedback"
```

---

### Task 9: The lesson page and the first lesson

**Files:**
- Create: `src/scripts/progress-ui.ts`, `src/layouts/LessonLayout.astro`, `src/pages/[unit]/[topic].astro`, `src/content/lessons/unit-5/5-2-rate-law.mdx`, `public/figures/5-2-order-and-rate.svg`
- Modify: `src/layouts/Base.astro`, `src/styles/base.css`
- Test: `tests/e2e/lesson.spec.ts`, `tests/e2e/nojs.spec.ts`

- [ ] **Step 1: Write the failing test `tests/e2e/lesson.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

const LESSON = '/unit-5-kinetics/5-2-rate-law/';

test('a lesson shows its topic, title and all its building blocks', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.getByRole('heading', { level: 1, name: 'Introduction to Rate Law' })).toBeVisible();
  await expect(page.locator('.kicker')).toContainText('Topic 5.2');
  for (const part of ['key-idea', 'worked', 'trap', 'key-points', 'practice-next', 'figure']) {
    await expect(page.locator(`[data-part="${part}"]`).first()).toBeVisible();
  }
  expect(await page.locator('cs-check').count()).toBeGreaterThanOrEqual(3);
});

test('chemical equations are typeset, not left as source text', async ({ page }) => {
  await page.goto(LESSON);
  const visible = await page.locator('article .katex-html').allInnerTexts();
  expect(visible.length).toBeGreaterThan(5);
  expect(visible.join(' ')).not.toContain('\\ce');
  expect(await page.locator('.katex-error').count()).toBe(0);
});

test('a wrong answer says so, a right answer explains itself, and the keyboard works', async ({ page }) => {
  await page.goto(LESSON);
  const first = page.locator('cs-check').first();
  const feedback = first.locator('.check-feedback');
  const options = first.locator('.check-option');

  await options.nth(0).click();
  await expect(feedback).toHaveText('Not quite. Try another.');
  await expect(first.locator('.check-why')).not.toHaveAttribute('open', '');

  await options.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(feedback).toHaveText('Correct.');
  await expect(first.locator('.check-why')).toHaveAttribute('open', '');
});

test('answering every check completes the topic, and the device remembers', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.locator('[data-complete]')).toBeHidden();

  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();
  await checks.nth(2).locator('input').fill('0.020');
  await checks.nth(2).locator('input').press('Enter');
  await expect(checks.nth(2).locator('.check-feedback')).toHaveText('Correct.');
  await expect(page.locator('[data-complete]')).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-complete]')).toBeVisible();
});

test('a numeric check rejects text that is not a number', async ({ page }) => {
  await page.goto(LESSON);
  const numeric = page.locator('cs-check[data-numeric]').first();
  await numeric.locator('input').fill('lots');
  await numeric.locator('input').press('Enter');
  await expect(numeric.locator('.check-feedback')).toContainText('Enter a number');
});

test('the lesson fits a phone screen without sideways scrolling', async ({ page }) => {
  await page.goto(LESSON);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 2: Write the failing test `tests/e2e/nojs.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('without JavaScript a lesson is fully readable and answers can be opened', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Introduction to Rate Law');
  const first = page.locator('cs-check').first();
  await expect(first.locator('li').first()).toBeVisible();
  await first.locator('summary').click();
  await expect(first.locator('.check-answer')).toHaveText('Answer: option 3');
});
```

- [ ] **Step 3: Run them and watch them fail**

Run: `npm run test:e2e -- lesson nojs`
Expected: FAIL — the lesson URL returns 404.

- [ ] **Step 4: Write `src/scripts/progress-ui.ts`**

```ts
import { browserProgress } from '../lib/progress';

/**
 * Paints stored progress into whatever the current page offers:
 *   [data-topic-link="5.2"]            gets .is-done
 *   [data-unit-topics="5.1,5.2"]       its [data-unit-progress] child gets "1 of 2 done"
 *   [data-continue]                    is shown with a link to the last lesson
 *   [data-complete]                    is shown on a finished lesson
 */
const progress = browserProgress();
const main = document.querySelector<HTMLElement>('main[data-topic]');

if (main) {
  const heading = document.querySelector('h1');
  progress.setLastVisited({ path: location.pathname, title: heading?.textContent?.trim() ?? '' });
}

function paint(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-topic-link]')) {
    el.classList.toggle('is-done', progress.isDone(el.dataset.topicLink ?? ''));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-unit-topics]')) {
    const codes = (el.dataset.unitTopics ?? '').split(',').filter(Boolean);
    const { done, total } = progress.unitProgress(codes);
    const out = el.querySelector('[data-unit-progress]');
    if (out && done > 0) out.textContent = `${done} of ${total} done`;
  }

  const last = progress.lastVisited();
  const resume = document.querySelector<HTMLElement>('[data-continue]');
  const link = resume?.querySelector('a');
  if (resume && link && last && last.title) {
    link.href = last.path;
    link.textContent = last.title;
    resume.hidden = false;
  }

  const badge = document.querySelector<HTMLElement>('[data-complete]');
  if (badge && main) badge.hidden = !progress.isDone(main.dataset.topic ?? '');
}

paint();
document.addEventListener('chemstudy:progress', paint);
```

- [ ] **Step 5: Load it from `src/layouts/Base.astro`**

Add immediately before `</body>`:

```astro
    <script>
      import '../scripts/progress-ui';
    </script>
```

- [ ] **Step 6: Write `src/layouts/LessonLayout.astro`**

```astro
---
import type { MarkdownHeading } from 'astro';
import Base from './Base.astro';
import { topicByCode } from '../data/units';
import { lessonPath, lessonsByTopic, type Lesson } from '../lib/lessons';

interface Props {
  lesson: Lesson;
  headings: MarkdownHeading[];
}
const { lesson, headings } = Astro.props;

const found = topicByCode(lesson.data.topic);
if (!found) {
  throw new Error(`Lesson ${lesson.id} has topic ${lesson.data.topic}, which is not in src/data/units.ts.`);
}
const { unit, topic } = found;

const lessons = await lessonsByTopic();
const published = unit.topics.filter((t) => lessons.has(t.code));
const position = published.findIndex((t) => t.code === topic.code);
const prev = published[position - 1];
const next = published[position + 1];
const pathFor = (code: string) => lessonPath(unit.slug, lessons.get(code)!);
const sections = headings.filter((h) => h.depth === 2);
---

<Base
  title={`${topic.code} ${topic.title} | ChemStudy`}
  description={lesson.data.summary}
  unit={unit.number}
  topic={topic.code}
>
  <div class="lesson-grid">
    <article class="lesson prose" data-pagefind-body>
      <p class="kicker">Topic {topic.code} · {lesson.data.minutes} min</p>
      <h1>{topic.title}</h1>
      <slot />
      <p class="complete" data-complete data-pagefind-ignore hidden>Topic complete. Nice work.</p>
      <nav class="prev-next" aria-label="Previous and next topic" data-pagefind-ignore>
        {prev ? <a rel="prev" href={pathFor(prev.code)}>← {prev.code} {prev.title}</a> : <span />}
        {
          next ? (
            <a rel="next" href={pathFor(next.code)}>{next.code} {next.title} →</a>
          ) : (
            <a href={`/${unit.slug}/`}>Back to Unit {unit.number} →</a>
          )
        }
      </nav>
    </article>

    <nav class="topic-nav" aria-label={`Unit ${unit.number} topics`}>
      <p class="eyebrow"><a href={`/${unit.slug}/`}>Unit {unit.number} · {unit.title}</a></p>
      <ol>
        {
          unit.topics.map((t) => (
            <li data-topic-link={t.code} class:list={{ current: t.code === topic.code }}>
              {lessons.has(t.code) ? (
                <a href={pathFor(t.code)} aria-current={t.code === topic.code ? 'page' : undefined}>
                  {t.code} {t.title}
                </a>
              ) : (
                <span>{t.code} {t.title}</span>
              )}
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

- [ ] **Step 7: Append the lesson layout styles to `src/styles/base.css`**

```css
/* Lesson page. One column on a phone (lesson, then the unit's topics);
   topics move to the left at 60rem; "on this page" appears at 78rem. */
.lesson-grid {
  display: grid;
  gap: calc(var(--space) * 1.5);
  grid-template-columns: minmax(0, 1fr);
}
.section-nav {
  display: none;
}
@media (min-width: 60rem) {
  .lesson-grid {
    grid-template-columns: 15rem minmax(0, 1fr);
    align-items: start;
  }
  .topic-nav {
    grid-column: 1;
    grid-row: 1;
    position: sticky;
    top: 1.5rem;
  }
  .lesson {
    grid-column: 2;
    grid-row: 1;
  }
}
@media (min-width: 78rem) {
  .lesson-grid {
    grid-template-columns: 15rem minmax(0, 1fr) 13rem;
  }
  .section-nav {
    display: block;
    grid-column: 3;
    grid-row: 1;
    position: sticky;
    top: 1.5rem;
  }
}

.topic-nav,
.section-nav {
  font-family: var(--font-ui);
  font-size: var(--step--1);
}
.topic-nav ol,
.section-nav ul {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
}
.topic-nav li,
.section-nav li {
  padding-block: 0.3rem;
  color: var(--muted);
}
.topic-nav a,
.section-nav a {
  color: var(--muted);
  text-decoration: none;
}
.topic-nav a:hover,
.section-nav a:hover {
  color: var(--ink);
}
.topic-nav .eyebrow a {
  color: inherit;
}
.topic-nav li.current a {
  color: var(--u-ink);
  font-weight: 600;
}
.topic-nav li.is-done::after {
  content: ' ✓';
  color: var(--ok);
}

.complete {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  font-weight: 500;
  color: var(--ok);
  background: var(--ok-bg);
  border-radius: var(--radius);
  padding: 0.8rem 1.1rem;
}
.prev-next {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  font-family: var(--font-ui);
  font-size: var(--step--1);
  border-top: 1px solid var(--line);
  padding-top: 1.2rem;
  margin-top: 2.5rem;
}
```

- [ ] **Step 8: Write `src/pages/[unit]/[topic].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import LessonLayout from '../../layouts/LessonLayout.astro';
import Check from '../../components/lesson/Check.astro';
import Figure from '../../components/lesson/Figure.astro';
import KeyIdea from '../../components/lesson/KeyIdea.astro';
import KeyPoints from '../../components/lesson/KeyPoints.astro';
import PracticeNext from '../../components/lesson/PracticeNext.astro';
import Trap from '../../components/lesson/Trap.astro';
import Worked from '../../components/lesson/Worked.astro';
import { topicByCode } from '../../data/units';
import { lessonSlug, type Lesson } from '../../lib/lessons';

export async function getStaticPaths() {
  const lessons = await getCollection('lessons');
  return lessons.map((lesson) => {
    const found = topicByCode(lesson.data.topic);
    if (!found) throw new Error(`Lesson ${lesson.id} has an unknown topic ${lesson.data.topic}.`);
    return { params: { unit: found.unit.slug, topic: lessonSlug(lesson) }, props: { lesson } };
  });
}

interface Props {
  lesson: Lesson;
}
const { lesson } = Astro.props;
const { Content, headings } = await render(lesson);
// Supplied to every lesson, so lesson files need no imports.
const blocks = { Check, Figure, KeyIdea, KeyPoints, PracticeNext, Trap, Worked };
---

<LessonLayout lesson={lesson} headings={headings}>
  <Content components={blocks} />
</LessonLayout>
```

- [ ] **Step 9: Write `public/figures/5-2-order-and-rate.svg`**

The second-order curve is an exact parabola: a quadratic Bézier from (60,250) with control point (250,250) to (440,30) traces y = 250 − 220t² for x = 60 + 380t.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="system-ui, sans-serif" font-size="14">
  <rect width="480" height="300" fill="#FDFCF9"/>
  <path d="M60 20V250H450" fill="none" stroke="#26231F" stroke-width="1.5"/>
  <text x="255" y="284" text-anchor="middle" fill="#26231F">concentration of A</text>
  <text x="26" y="135" text-anchor="middle" fill="#26231F" transform="rotate(-90 26 135)">rate</text>

  <path d="M60 170H440" fill="none" stroke="#6B655D" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
  <path d="M60 250L440 70" fill="none" stroke="#4F706C" stroke-width="3" stroke-dasharray="11 6"/>
  <path d="M60 250Q250 250 440 30" fill="none" stroke="#26231F" stroke-width="3"/>

  <path d="M80 42H118" fill="none" stroke="#26231F" stroke-width="3"/>
  <text x="128" y="47" fill="#26231F">second order</text>
  <path d="M80 66H118" fill="none" stroke="#4F706C" stroke-width="3" stroke-dasharray="11 6"/>
  <text x="128" y="71" fill="#26231F">first order</text>
  <path d="M80 90H118" fill="none" stroke="#6B655D" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
  <text x="128" y="95" fill="#26231F">zero order</text>
</svg>
```

- [ ] **Step 10: Write `src/content/lessons/unit-5/5-2-rate-law.mdx`**

The rate data in the worked example are illustrative values, chosen to satisfy rate = k[NO]²[H₂] with k = 250 M⁻²s⁻¹: 250 × (0.0050)² × 0.0020 = 1.25×10⁻⁵; 250 × (0.010)² × 0.0020 = 5.0×10⁻⁵; 250 × (0.010)² × 0.0040 = 1.0×10⁻⁴.

```mdx
---
topic: "5.2"
minutes: 12
summary: How the rate of a reaction depends on the concentration of each reactant, and how to find that dependence from experiments.
---

Double the amount of a reactant and a reaction usually speeds up. The surprise is *by how much*. Sometimes the rate doubles. Sometimes it quadruples. Sometimes nothing happens at all. A **rate law** is the equation that records which.

## What a rate law says

For a reaction with reactants A and B, the rate law has this form:

$$
\text{rate} = k[\ce{A}]^m[\ce{B}]^n
$$

Each piece has a job:

- $[\ce{A}]$ and $[\ce{B}]$ are the concentrations of the reactants, in mol/L (M).
- $m$ and $n$ are the **orders** of the reaction in A and in B. They say how strongly the rate responds to each concentration.
- $k$ is the **rate constant**. It is a fixed number for a given reaction at a given temperature.

Adding the orders gives the **overall order**, $m + n$.

## Orders come from experiment

It is tempting to copy the exponents from the balanced equation. Sometimes that even gives the right answer. For this reaction it happens to:

$$
\ce{2NO(g) + O2(g) -> 2NO2(g)} \qquad \text{rate} = k[\ce{NO}]^2[\ce{O2}]
$$

But for this one it does not:

$$
\ce{NO2(g) + CO(g) -> NO(g) + CO2(g)} \qquad \text{rate} = k[\ce{NO2}]^2
$$

At low temperature the rate depends on the square of $[\ce{NO2}]$ and not on $[\ce{CO}]$ at all, even though one of each appears in the equation. The balanced equation tells you what is used up and what is made. It does not tell you how fast.

<KeyIdea>
The orders in a rate law are found by measuring rates. You cannot read them off the balanced equation.
</KeyIdea>

## What each order does to the rate

The order tells you what happens to the rate when you change one concentration and hold everything else fixed.

| Order in A | If you double $[\ce{A}]$, the rate | The rate depends on |
|---|---|---|
| 0 | does not change | nothing: $[\ce{A}]^0 = 1$ |
| 1 | doubles | $[\ce{A}]$ |
| 2 | quadruples | $[\ce{A}]^2$ |

<Figure
  src="/figures/5-2-order-and-rate.svg"
  alt="Graph of rate against concentration of A. For zero order the rate is a flat horizontal line. For first order it is a straight line rising from the origin. For second order it is a curve that starts flat and rises ever more steeply."
  caption="How rate changes with concentration for a reaction that is zero, first or second order in A."
/>

<Check answer={3}>
Doubling $[\ce{A}]$ makes a reaction four times faster. What is the order in A?

- 0
- 1
- 2
- 4

<div slot="why">The rate is proportional to $[\ce{A}]^m$. Doubling the concentration multiplies the rate by $2^m$, and $2^m = 4$ gives $m = 2$.</div>
</Check>

## Finding the orders: the method of initial rates

To find an order, run the reaction several times. Change **one** concentration between runs and measure the rate right at the start, before the concentrations have had time to change. Comparing two runs that differ in only one reactant isolates that reactant's effect.

<Worked title="A rate law from three experiments">

Nitrogen monoxide reacts with hydrogen:

$$
\ce{2NO(g) + 2H2(g) -> N2(g) + 2H2O(g)}
$$

| Experiment | $[\ce{NO}]$ (M) | $[\ce{H2}]$ (M) | Initial rate (M/s) |
|---|---|---|---|
| 1 | 0.0050 | 0.0020 | $1.25 \times 10^{-5}$ |
| 2 | 0.010 | 0.0020 | $5.0 \times 10^{-5}$ |
| 3 | 0.010 | 0.0040 | $1.0 \times 10^{-4}$ |

Find the rate law and the value of $k$.

1. **Order in NO.** Compare experiments 1 and 2: $[\ce{H2}]$ is the same and $[\ce{NO}]$ doubles. The rate goes from $1.25 \times 10^{-5}$ to $5.0 \times 10^{-5}$, which is 4 times faster. Since $2^m = 4$, the order in NO is 2.

2. **Order in $\ce{H2}$.** Compare experiments 2 and 3: $[\ce{NO}]$ is the same and $[\ce{H2}]$ doubles. The rate goes from $5.0 \times 10^{-5}$ to $1.0 \times 10^{-4}$, which is 2 times faster. Since $2^n = 2$, the order in $\ce{H2}$ is 1.

3. **Write the rate law.**

   $$
   \text{rate} = k[\ce{NO}]^2[\ce{H2}]
   $$

4. **Solve for $k$** with the numbers from any one experiment. Using experiment 2:

   $$
   k = \frac{\text{rate}}{[\ce{NO}]^2[\ce{H2}]} = \frac{5.0 \times 10^{-5}\ \text{M/s}}{(0.010\ \text{M})^2(0.0020\ \text{M})} = 2.5 \times 10^{2}\ \text{M}^{-2}\,\text{s}^{-1}
   $$

The equation has a 2 in front of $\ce{H2}$, but the order in $\ce{H2}$ is 1. The data decide, not the coefficients.

</Worked>

## The units of k

The rate is always in M/s. For the two sides of the rate law to match, the units of $k$ have to make up the difference, so they depend on the overall order.

| Overall order | Rate law | Units of $k$ |
|---|---|---|
| 0 | $\text{rate} = k$ | $\text{M}\,\text{s}^{-1}$ |
| 1 | $\text{rate} = k[\ce{A}]$ | $\text{s}^{-1}$ |
| 2 | $\text{rate} = k[\ce{A}]^2$ | $\text{M}^{-1}\,\text{s}^{-1}$ |
| 3 | $\text{rate} = k[\ce{A}]^2[\ce{B}]$ | $\text{M}^{-2}\,\text{s}^{-1}$ |

This works in reverse too. If you are told that $k$ has units of $\text{s}^{-1}$, the reaction must be first order overall.

<Check answer={2}>
A rate law is $\text{rate} = k[\ce{A}][\ce{B}]$. What are the units of $k$?

- $\text{s}^{-1}$
- $\text{M}^{-1}\,\text{s}^{-1}$
- $\text{M}^{-2}\,\text{s}^{-1}$
- $\text{M}\,\text{s}^{-1}$

<div slot="why">The overall order is $1 + 1 = 2$. Dividing M/s by $\text{M}^2$ leaves $\text{M}^{-1}\,\text{s}^{-1}$.</div>
</Check>

<Trap>

Three mistakes cost the most points on this topic:

- **Copying coefficients as orders.** The orders come from rate data, never from the balanced equation.
- **Thinking $k$ changes with concentration.** Changing a concentration changes the *rate*. The rate constant stays the same unless the temperature changes.
- **Leaving the units off $k$.** A rate constant without units is incomplete, and the units depend on the overall order.

</Trap>

<Check numeric={0.020} unit="M/s">
A reaction has the rate law $\text{rate} = k[\ce{A}]^2$ with $k = 0.50\ \text{M}^{-1}\,\text{s}^{-1}$. What is the rate when $[\ce{A}] = 0.20\ \text{M}$?

<div slot="why">$\text{rate} = (0.50\ \text{M}^{-1}\,\text{s}^{-1})(0.20\ \text{M})^2 = 0.020\ \text{M/s}$.</div>
</Check>

<KeyPoints>

- A rate law has the form $\text{rate} = k[\ce{A}]^m[\ce{B}]^n$.
- The orders $m$ and $n$ are found from experiment, not from the balanced equation.
- Zero order: the rate ignores that concentration. First order: the rate doubles when it doubles. Second order: the rate quadruples.
- The method of initial rates compares two experiments that differ in one concentration.
- $k$ is constant at a given temperature. Its units depend on the overall order, so that the rate comes out in M/s.

</KeyPoints>

<PracticeNext />
```

- [ ] **Step 11: Run the tests and watch them pass**

Run: `npm run test:e2e -- lesson nojs`
Expected: PASS, 14 tests (6 lesson + 1 no-JavaScript, × 2 projects).

If "chemical equations are typeset" fails with `\ce` in the visible text, there are two copies of katex: go back to Task 2, Step 3.

- [ ] **Step 12: Commit**

```bash
git add src public/figures tests/e2e/lesson.spec.ts tests/e2e/nojs.spec.ts
git commit -m "feat: add the lesson page and the first lesson, 5.2 Rate Law"
```

---

### Task 10: Home page and unit page

**Files:**
- Create: `src/pages/[unit]/index.astro`
- Modify: `src/pages/index.astro`, `src/styles/base.css`
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write the failing test `tests/e2e/home.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('the home page lists all nine units and is honest about what exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('finally clicks');
  const rows = page.locator('.unit-row');
  await expect(rows).toHaveCount(9);
  await expect(rows.filter({ hasText: 'Coming soon' })).toHaveCount(8);
  await expect(page.getByRole('link', { name: 'Kinetics', exact: true })).toHaveAttribute(
    'href',
    '/unit-5-kinetics/',
  );
});

test('the unit page lists every topic and links the ones that have lessons', async ({ page }) => {
  await page.goto('/unit-5-kinetics/');
  await expect(page.getByRole('heading', { level: 1, name: 'Kinetics' })).toBeVisible();
  await expect(page.locator('.topic-list > li')).toHaveCount(11);
  await page.getByRole('link', { name: 'Introduction to Rate Law' }).click();
  await expect(page).toHaveURL(/\/unit-5-kinetics\/5-2-rate-law\/$/);
});

test('a finished topic shows as done on the unit page and the home page offers to continue', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-continue]')).toBeHidden();

  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();
  await checks.nth(2).locator('input').fill('0.020');
  await checks.nth(2).locator('input').press('Enter');
  await expect(page.locator('[data-complete]')).toBeVisible();

  await page.goto('/unit-5-kinetics/');
  await expect(page.locator('[data-topic-link="5.2"]')).toHaveClass(/is-done/);

  await page.goto('/');
  await expect(page.locator('[data-continue] a')).toHaveText('Introduction to Rate Law');
  await expect(page.locator('.unit-row[data-unit="5"] [data-unit-progress]')).toHaveText('1 of 1 done');
});

test('the home and unit pages fit a phone screen without sideways scrolling', async ({ page }) => {
  for (const path of ['/', '/unit-5-kinetics/']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test:e2e -- home`
Expected: FAIL — no `.unit-row` elements.

- [ ] **Step 3: Replace `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { units } from '../data/units';
import { lessonsByTopic } from '../lib/lessons';

const lessons = await lessonsByTopic();
const rows = units.map((unit) => ({
  unit,
  ready: unit.topics.filter((t) => lessons.has(t.code)).map((t) => t.code),
}));
const first = rows.find((row) => row.ready.length > 0);

function status(ready: number, total: number): string {
  if (ready === 0) return 'Coming soon';
  return ready === total ? `${total} lessons` : `${ready} of ${total} lessons`;
}
---

<Base
  title="ChemStudy: AP® Chemistry, explained"
  description="Clear lessons, worked examples and practice for every AP Chemistry topic. Free, and written by a chemistry teacher."
>
  <section class="hero">
    <h1>AP® Chemistry, explained so it <em>finally clicks</em>.</h1>
    <p class="lede">
      Every topic as a clear, careful lesson, with worked examples and practice to make it stick.
      Free, and written by a chemistry teacher.
    </p>
    <p class="hero-actions">
      {
        first && (
          <a class="button" href={`/${first.unit.slug}/`}>
            Start with Unit {first.unit.number}
          </a>
        )
      }
      <a href="#units">See all nine units</a>
    </p>
    <p class="continue" data-continue hidden>Continue where you left off: <a href="/">your last lesson</a></p>
  </section>

  <section id="units" aria-labelledby="units-heading">
    <h2 id="units-heading" class="eyebrow">The nine units</h2>
    <ul class="unit-list">
      {
        rows.map(({ unit, ready }) => (
          <li class="unit-row" data-unit={unit.number} data-unit-topics={ready.join(',')}>
            <span class="dot" aria-hidden="true" />
            <span class="unit-num">Unit {unit.number}</span>
            {ready.length > 0 ? (
              <a class="unit-title" href={`/${unit.slug}/`}>
                {unit.title}
              </a>
            ) : (
              <span class="unit-title">{unit.title}</span>
            )}
            <span class="unit-meta" data-unit-progress>
              {status(ready.length, unit.topics.length)}
            </span>
          </li>
        ))
      }
    </ul>
  </section>
</Base>
```

- [ ] **Step 4: Write `src/pages/[unit]/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import { units, type Unit } from '../../data/units';
import { lessonPath, lessonsByTopic } from '../../lib/lessons';

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
  </article>
</Base>
```

- [ ] **Step 5: Append the home and unit page styles to `src/styles/base.css`**

```css
.hero {
  padding-block: clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem);
  max-width: 46rem;
}
.hero h1 em {
  font-style: italic;
  color: var(--muted);
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin: 1.75rem 0 0;
  font-family: var(--font-ui);
  font-size: var(--step--1);
}
.continue {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
  margin: 1.5rem 0 0;
}

.unit-list,
.topic-list {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
}
.unit-row,
.topic-list > li {
  display: grid;
  align-items: baseline;
  gap: 0.2rem 1rem;
  padding-block: 1rem;
  border-top: 1px solid var(--line);
}
.unit-row:last-child,
.topic-list > li:last-child {
  border-bottom: 1px solid var(--line);
}
.unit-row {
  grid-template-columns: 0.75rem 4.5rem minmax(0, 1fr);
}
.dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--u);
  align-self: center;
}
.unit-num,
.unit-meta,
.topic-code,
.topic-meta {
  font-family: var(--font-ui);
  font-size: var(--step--1);
  color: var(--muted);
}
.unit-num {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.unit-title {
  font-family: var(--font-head);
  font-size: var(--step-1);
  text-decoration: none;
}
a.unit-title:hover {
  text-decoration: underline;
}
/* On a phone the status drops under the title; from 40rem it sits at the right. */
.unit-meta {
  grid-column: 3;
}
@media (min-width: 40rem) {
  .unit-row {
    grid-template-columns: 0.75rem 4.5rem minmax(0, 1fr) auto;
  }
  .unit-meta {
    grid-column: 4;
  }
}

.unit-page {
  max-width: 46rem;
}
.unit-page h1 {
  margin-top: 0.4rem;
}
.topic-list {
  margin-top: 2.5rem;
}
.topic-list > li {
  grid-template-columns: 2.5rem minmax(0, 1fr);
}
.topic-list a {
  font-family: var(--font-head);
  font-size: var(--step-1);
  text-decoration: none;
}
.topic-list a:hover {
  text-decoration: underline;
}
.topic-list > li > span:nth-child(2) {
  font-family: var(--font-head);
  font-size: var(--step-1);
  color: var(--muted);
}
.topic-meta {
  grid-column: 2;
}
.done-mark {
  display: none;
  color: var(--ok);
  font-weight: 500;
}
.is-done .done-mark {
  display: inline;
}
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npm run test:e2e -- home`
Expected: PASS, 8 tests (4 × 2 projects).

- [ ] **Step 7: Commit**

```bash
git add src tests/e2e/home.spec.ts
git commit -m "feat: add the home page and unit page with on-device progress"
```

---

### Task 11: About, 404 and server files

**Files:**
- Create: `src/pages/about.astro`, `src/pages/404.astro`, `public/robots.txt`, `public/.htaccess`, `public/.chemstudy-site`
- Modify: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Append failing tests to `tests/e2e/home.spec.ts`**

```ts
test('the About page says who wrote the site, how it is checked, and the license', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: 'About ChemStudy' })).toBeVisible();
  await expect(page.locator('main')).toContainText('fact-checked');
  await expect(page.locator('main')).toContainText('CC BY-NC-SA 4.0');
  await expect(page.locator('main')).toContainText('College Board');
});

test('an address that does not exist gets a helpful page and a 404 status', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'the nine units' })).toHaveAttribute('href', '/#units');
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npm run test:e2e -- home`
Expected: FAIL — `/about/` is a 404 and there is no "Page not found" heading.

- [ ] **Step 3: Write `src/pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base
  title="About ChemStudy"
  description="Who writes ChemStudy, how every lesson is checked, and how you may use it."
>
  <article class="prose">
    <h1>About ChemStudy</h1>
    <p>
      ChemStudy is a free resource for students taking AP® Chemistry. It has a lesson for each
      topic in the course, with worked examples, questions to check yourself, and practice.
    </p>

    <h2>Who writes it</h2>
    <p>
      The lessons are written by a chemistry teacher, for students learning the material for the
      first time and for students reviewing before the exam.
    </p>

    <h2>How it is checked</h2>
    <p>
      Every lesson is fact-checked before it is published: each number is recalculated
      independently, and each claim is checked against the AP Chemistry course framework. If you
      find a mistake, please report it so it can be fixed.
    </p>

    <h2>How you may use it</h2>
    <p>
      Everything here is free to use, share and adapt for non-commercial purposes under the
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> license,
      as long as you give credit and share your version under the same license.
    </p>

    <h2>Your privacy</h2>
    <p>
      ChemStudy has no accounts, no advertising and no tracking. Your progress is saved in your
      own browser and never leaves your device.
    </p>

    <h2>AP® and the College Board</h2>
    <p>
      AP® is a trademark registered by the College Board, which is not affiliated with, and does
      not endorse, this site.
    </p>
  </article>
</Base>
```

- [ ] **Step 4: Write `src/pages/404.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="Page not found | ChemStudy" description="That page does not exist on ChemStudy.">
  <article class="prose">
    <h1>Page not found</h1>
    <p>
      There is nothing at this address. It may have moved, or the link may be mistyped.
    </p>
    <p>
      Start again from <a href="/#units">the nine units</a>, or go to the <a href="/">home page</a>.
    </p>
  </article>
</Base>
```

- [ ] **Step 5: Write `public/robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 6: Write `public/.htaccess`**

```apache
# Serve the site's own page for addresses that do not exist.
ErrorDocument 404 /404.html

# Files under /_astro/ carry a content hash in their name, so they can be
# cached for a year: a changed file always gets a new name.
<IfModule mod_headers.c>
  <FilesMatch "\.(css|js|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

- [ ] **Step 7: Write `public/.chemstudy-site`**

```
ChemStudy site root. The deploy refuses to write into a folder without this file.
```

- [ ] **Step 8: Run the tests and watch them pass**

Run: `npm run test:e2e -- home`
Expected: PASS, 12 tests (6 × 2 projects).

- [ ] **Step 9: Commit**

```bash
git add src/pages/about.astro src/pages/404.astro public tests/e2e/home.spec.ts
git commit -m "feat: add the About and not-found pages and server files"
```

---

### Task 12: Search

**Files:**
- Create: `src/components/Search.astro`
- Modify: `package.json` (build script), `src/components/Header.astro`, `src/styles/base.css`
- Test: `tests/e2e/search.spec.ts`

- [ ] **Step 1: Write the failing test `tests/e2e/search.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('search finds a lesson by words in it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('method of initial rates');
  const result = page.locator('.pagefind-ui__result-link').first();
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute('href', /\/unit-5-kinetics\/5-2-rate-law\//);
});

test('the slash key opens search and Escape closes it', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('/');
  await expect(page.locator('[data-search-dialog]')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-search-dialog]')).not.toHaveAttribute('open', '');
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test:e2e -- search`
Expected: FAIL — no button named "Search".

- [ ] **Step 3: Index the site as part of the build**

In `package.json`, change the `build` script to:

```json
    "build": "astro build && pagefind --site dist",
```

- [ ] **Step 4: Write `src/components/Search.astro`**

```astro
<button class="icon-btn" type="button" data-search-open aria-label="Search">
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
    <path d="M11.6 11.6 16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
  </svg>
</button>

<dialog class="search-dialog" data-search-dialog aria-label="Search ChemStudy">
  <form method="dialog">
    <button class="search-close" type="submit">Close</button>
  </form>
  <div id="search-ui"></div>
  <p class="search-note" data-search-note hidden>
    Search could not load. It is built with the published site, so it is unavailable in local
    development until you run a build.
  </p>
</dialog>

<script>
  const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
  const note = document.querySelector<HTMLElement>('[data-search-note]');
  let started = false;

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.append(script);
    });
  }

  // The search index and its UI are fetched the first time search is opened,
  // so pages that never search never pay for them.
  async function start(): Promise<void> {
    if (started) return;
    started = true;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/pagefind/pagefind-ui.css';
    document.head.append(css);
    try {
      await loadScript('/pagefind/pagefind-ui.js');
      const PagefindUI = (window as unknown as { PagefindUI: new (options: object) => unknown })
        .PagefindUI;
      new PagefindUI({ element: '#search-ui', showImages: false, showSubResults: true });
      dialog?.querySelector<HTMLInputElement>('.pagefind-ui__search-input')?.focus();
    } catch (error) {
      console.error(error);
      if (note) note.hidden = false;
    }
  }

  function open(): void {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    void start().then(() => dialog.querySelector<HTMLInputElement>('.pagefind-ui__search-input')?.focus());
  }

  for (const button of document.querySelectorAll('[data-search-open]')) {
    button.addEventListener('click', open);
  }

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);
    if (event.key === '/' && !typing) {
      event.preventDefault();
      open();
    }
  });
</script>
```

- [ ] **Step 5: Add Search to `src/components/Header.astro`**

Add the import and place `<Search />` before `<ThemeToggle />`:

```astro
---
import Logo from './Logo.astro';
import Search from './Search.astro';
import ThemeToggle from './ThemeToggle.astro';
---

<header class="site-header">
  <a class="brand" href="/" aria-label="ChemStudy home">
    <Logo />
    <span>ChemStudy</span>
  </a>
  <nav aria-label="Main">
    <a href="/#units">Units</a>
    <a href="/about/">About</a>
    <Search />
    <ThemeToggle />
  </nav>
</header>
```

- [ ] **Step 6: Append the search styles to `src/styles/base.css`**

```css
.search-dialog {
  width: min(100% - 2rem, 40rem);
  max-height: min(100% - 4rem, 44rem);
  margin-top: 4rem;
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-ui);
  /* Pagefind's UI reads these. */
  --pagefind-ui-primary: var(--ink);
  --pagefind-ui-text: var(--ink);
  --pagefind-ui-background: var(--card);
  --pagefind-ui-border: var(--line);
  --pagefind-ui-tag: var(--line);
  --pagefind-ui-font: var(--font-ui);
}
.search-dialog::backdrop {
  background: rgb(38 35 31 / 0.45);
}
.search-dialog form {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}
.search-close {
  font: inherit;
  font-size: var(--step--1);
  color: var(--muted);
  background: none;
  border: 0;
  padding: 0.5rem;
  cursor: pointer;
}
.search-note {
  font-size: var(--step--1);
  color: var(--muted);
}
```

- [ ] **Step 7: Run the test and watch it pass**

Run: `npm run test:e2e -- search`
Expected: PASS, 4 tests (2 × 2 projects).

- [ ] **Step 8: Commit**

```bash
git add package.json src tests/e2e/search.spec.ts
git commit -m "feat: add site search with Pagefind"
```

---

### Task 13: Fail the build on silent defects

**Files:**
- Create: `scripts/check-dist.mjs`
- Modify: `package.json` (build script)
- Test: `tests/unit/check-dist.test.ts`

This is the guard against the failure class verified at the top of this plan: output that is wrong while the build succeeds.

- [ ] **Step 1: Write the failing test `tests/unit/check-dist.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { checkPage } from '../../scripts/check-dist.mjs';

const everythingExists = () => true;

const part = (name: string) => `<div data-part="${name}"></div>`;
const choice = (answer: number, options: number) =>
  `<cs-check data-part="check" data-answer="${answer}"><ul>${'<li>x</li>'.repeat(options)}</ul></cs-check>`;
const lesson = (inner: string) => `<main data-topic="5.2">${inner}</main>`;
const fullLesson =
  part('worked') + part('trap') + part('key-points') + part('practice-next') + choice(1, 2).repeat(3);

describe('checkPage', () => {
  it('passes a complete lesson', () => {
    expect(checkPage(lesson(fullLesson), everythingExists)).toEqual([]);
  });

  it('passes a page that is not a lesson without asking for lesson parts', () => {
    expect(checkPage('<main><h1>About</h1></main>', everythingExists)).toEqual([]);
  });

  it('reports a chemical equation left as source text', () => {
    const html = '<main><span class="katex-html">\\ce2NO(g)</span></main>';
    expect(checkPage(html, everythingExists)).toContainEqual(expect.stringContaining('unrendered math'));
  });

  it('ignores math source inside MathML annotations, where it belongs', () => {
    const html = '<main><annotation encoding="application/x-tex">\\ce{H2O}</annotation></main>';
    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('reports a KaTeX error', () => {
    const html = '<main><span class="katex-error" title="ParseError">x</span></main>';
    expect(checkPage(html, everythingExists)).toContainEqual(expect.stringContaining('KaTeX error'));
  });

  it('reports a link to a page that does not exist', () => {
    const html = '<main><a href="/unit-5-kinetics/5-3-missing/">next</a></main>';
    const problems = checkPage(html, (path) => path !== '/unit-5-kinetics/5-3-missing/');
    expect(problems).toEqual(['broken link: /unit-5-kinetics/5-3-missing/']);
  });

  it('checks the path of a link, not its fragment, and skips external links', () => {
    const html = '<main><a href="/about/#privacy">a</a><a href="https://example.com/x">b</a><a href="#top">c</a></main>';
    const seen: string[] = [];
    checkPage(html, (path) => {
      seen.push(path);
      return true;
    });
    expect(seen).toEqual(['/about/']);
  });

  it('reports a lesson that is missing a required part', () => {
    const html = lesson(fullLesson.replace(part('trap'), ''));
    expect(checkPage(html, everythingExists)).toEqual(['lesson 5.2 has 0 "trap", needs at least 1']);
  });

  it('reports a lesson with too few checks', () => {
    const html = lesson(part('worked') + part('trap') + part('key-points') + part('practice-next') + choice(1, 2));
    expect(checkPage(html, everythingExists)).toEqual(['lesson 5.2 has 1 "check", needs at least 3']);
  });

  it('reports a check whose answer points past its last option', () => {
    const html = lesson(fullLesson + choice(5, 4));
    expect(checkPage(html, everythingExists)).toEqual([
      'lesson 5.2: a check says the answer is option 5 but has only 4 options',
    ]);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../../scripts/check-dist.mjs`.

- [ ] **Step 3: Write `scripts/check-dist.mjs`**

```js
// Post-build checks for defects that leave the build green:
//   - math left as source text (\ce{...} rendered literally) or KaTeX errors
//   - internal links to pages that do not exist
//   - lessons missing one of their required parts
//
//   node scripts/check-dist.mjs        checks ./dist, exits 1 on any problem
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

/** Minimum number of each building block a lesson must contain. */
export const REQUIRED_PARTS = {
  worked: 1,
  check: 3,
  trap: 1,
  'key-points': 1,
  'practice-next': 1,
};

// TeX that should never reach a reader. If any of these is visible, math was
// not rendered -- typically two copies of katex, so mhchem is not registered.
// No \b after the name: the real failure prints "\ce2NO(g)" (the braces are
// consumed), and "e2" has no word boundary in it.
const RAW_MATH = /\\(?:ce|frac|text|times|Delta|rightarrow)(?![a-zA-Z])|\$\$/;

/**
 * @param {string} html one built page
 * @param {(urlPath: string) => boolean} exists whether an internal path resolves
 * @returns {string[]} problems, empty when the page is fine
 */
export function checkPage(html, exists) {
  const problems = [];
  const root = parse(html);

  if (root.querySelector('.katex-error')) problems.push('KaTeX error in the page');

  // Lesson parts are counted before any nodes are removed below.
  const main = root.querySelector('main[data-topic]');
  if (main) {
    const topic = main.getAttribute('data-topic');
    for (const [name, minimum] of Object.entries(REQUIRED_PARTS)) {
      const count = main.querySelectorAll(`[data-part="${name}"]`).length;
      if (count < minimum) {
        problems.push(`lesson ${topic} has ${count} "${name}", needs at least ${minimum}`);
      }
    }
    for (const check of main.querySelectorAll('cs-check[data-answer]')) {
      const answer = Number(check.getAttribute('data-answer'));
      const options = check.querySelectorAll('li').length;
      if (!(answer >= 1 && answer <= options)) {
        problems.push(
          `lesson ${topic}: a check says the answer is option ${answer} but has only ${options} options`,
        );
      }
    }
  }

  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const urlPath = href.split('#')[0].split('?')[0];
    if (!exists(urlPath)) problems.push(`broken link: ${urlPath}`);
  }

  // MathML annotations legitimately hold the TeX source; scripts and styles
  // are not prose.
  for (const node of root.querySelectorAll('annotation, script, style')) node.remove();
  if (RAW_MATH.test(root.text)) problems.push('unrendered math is visible in the page text');

  return problems;
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'pagefind' ? [] : htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

function existsIn(dist) {
  return (urlPath) => {
    const target = path.join(dist, decodeURIComponent(urlPath));
    // The site uses trailing slashes: a page link must end in "/".
    if (urlPath.endsWith('/')) return fs.existsSync(path.join(target, 'index.html'));
    return fs.existsSync(target) && fs.statSync(target).isFile();
  };
}

function main() {
  const dist = path.resolve('dist');
  if (!fs.existsSync(dist)) {
    console.error('check-dist: there is no dist/ folder. Run the Astro build first.');
    process.exit(1);
  }
  const exists = existsIn(dist);
  let failures = 0;
  const files = htmlFiles(dist);
  for (const file of files) {
    for (const problem of checkPage(fs.readFileSync(file, 'utf8'), exists)) {
      failures += 1;
      console.error(`${path.relative(dist, file)}: ${problem}`);
    }
  }
  console.log(`check-dist: ${files.length} pages, ${failures} problem(s)`);
  if (failures > 0) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npm test`
Expected: PASS, all tests.

- [ ] **Step 5: Run it as the last step of every build**

In `package.json`, change the `build` script to:

```json
    "build": "astro build && pagefind --site dist && node scripts/check-dist.mjs",
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: last line `check-dist: 5 pages, 0 problem(s)` (home, unit, lesson, about, 404).

- [ ] **Step 7: Prove the guard catches a real break**

Temporarily change `<Check answer={3}>` to `<Check answer={7}>` in `src/content/lessons/unit-5/5-2-rate-law.mdx`.

Run: `npm run build`
Expected: FAIL with `unit-5-kinetics/5-2-rate-law/index.html: lesson 5.2: a check says the answer is option 7 but has only 4 options`.

Restore `answer={3}`, run `npm run build` again, expected `0 problem(s)`.

- [ ] **Step 8: Commit**

```bash
git add scripts/check-dist.mjs tests/unit/check-dist.test.ts package.json
git commit -m "build: fail on unrendered math, broken links and incomplete lessons"
```

---

### Task 14: Accessibility in both themes

**Files:**
- Test: `tests/e2e/a11y.spec.ts`

- [ ] **Step 1: Write the test `tests/e2e/a11y.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/unit-5-kinetics/', '/unit-5-kinetics/5-2-rate-law/', '/about/'];

for (const theme of ['light', 'dark'] as const) {
  for (const path of PAGES) {
    test(`${path} has no accessibility violations in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
    });
  }
}

test('an answered check still passes in both of its states', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  const first = page.locator('cs-check').first();
  await first.locator('.check-option').nth(0).click();
  await first.locator('.check-option').nth(2).click();
  const results = await new AxeBuilder({ page })
    .include('cs-check')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
```

- [ ] **Step 2: Run it**

Run: `npm run test:e2e -- a11y`
Expected: PASS, 18 tests (9 × 2 projects).

If a violation is reported, fix the cause — do not exclude the rule. The two most likely:
- `color-contrast` on some text: the element is using a color that is not one of the checked pairs. Use `--ink`, `--muted` or `--u-ink` for text; never `--u`, which is for fills only.
- `scrollable-region-focusable` on `.katex-display` or a table: add `tabindex="0"` is not possible on generated math, so instead narrow the content or let it wrap; for tables, wrap is already allowed.

Re-run until it passes.

- [ ] **Step 3: Run the whole suite**

Run: `npm test && npm run test:e2e`
Expected: all unit tests pass; all browser tests pass in both projects.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/a11y.spec.ts src
git commit -m "test: check every page type for accessibility in both themes"
```

---

### Task 15: Fact-check the lesson

**Files:**
- Modify (only if a finding is confirmed): `src/content/lessons/unit-5/5-2-rate-law.mdx`

No lesson is merged without this. The checker must be independent: it reads the lesson, not this plan's notes.

- [ ] **Step 1: Dispatch an independent fact-check**

Dispatch a general-purpose agent with this brief:

> Fact-check an AP Chemistry lesson before it is published. File: `C:\Users\sahan\Downloads\Chemistry_Resources\chem-study\src\content\lessons\unit-5\5-2-rate-law.mdx`. It teaches AP topic 5.2, Introduction to Rate Law.
>
> 1. Recompute every number in Python from the lesson's own stated values: the three rates in the worked-example table from the rate law and k it derives; each ratio it quotes ("4 times faster", "2 times faster"); the value and units of k; the answer to the numeric question. Report any that do not match.
> 2. Check every chemistry claim. In particular: is the experimental rate law for 2NO + O₂ → 2NO₂ really rate = k[NO]²[O₂]; is the low-temperature rate law for NO₂ + CO → NO + CO₂ really rate = k[NO₂]²; is the rate law for 2NO + 2H₂ → N₂ + 2H₂O really rate = k[NO]²[H₂]; are the units of k for each overall order right.
> 3. Check each "Check yourself" question: is the marked option actually correct (answer is the 1-based position in the list), and is every other option actually wrong?
> 4. Check scope against AP topic 5.2 of the 2024 Course and Exam Description: does the lesson teach anything the framework excludes, or omit anything topic 5.2 requires (rate law expression, reaction order, rate constant and its units, method of initial rates)?
> 5. You may consult `C:\Users\sahan\Downloads\Chemistry_Resources\Tro_Reference\` to check facts. Flag any sentence in the lesson that closely follows a textbook's wording.
>
> Report only problems, each with the line, what the lesson says, what is correct, and how you know. Say plainly if you found none. Do not edit the file.

- [ ] **Step 2: Verify each finding before acting on it**

For every reported problem, recompute or re-read it yourself. Fix confirmed errors in the lesson. Where a finding is wrong, leave the lesson as it is and note why in the commit message.

- [ ] **Step 3: Re-run the checks**

Run: `npm run build && npm run test:e2e -- lesson`
Expected: `0 problem(s)`; lesson tests pass. (If the numeric answer or an option order changed, update the matching line in `tests/e2e/lesson.spec.ts` and `tests/e2e/home.spec.ts`.)

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons tests/e2e
git commit -m "docs: fact-check lesson 5.2"
```

If nothing needed changing, skip the commit and record "fact-check: no findings" in the pull request description in Task 16.

---

### Task 16: Continuous integration and the protected main branch

**Files:**
- Create: `.github/workflows/deploy.yml`

This task sets up testing on every pull request and protects `main`. The deploy job is included but stays inert until Task 17 supplies its secrets: it runs only on a push to `main`, and its first step fails with a clear message if the secrets are missing.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Test and deploy

# Every pull request into main is built and tested. Every push to main is
# built and tested again and, if that passes, deployed to chem-study.com.
# Setup, secrets and recovery steps: docs/DEPLOY.md.

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  test:
    name: Build and test
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24
          cache: npm

      # Reference textbooks and slides live beside this repository on the
      # author's machine. They are copyrighted and must never be committed.
      - name: Refuse reference books and slides
        run: |
          bad=$(git ls-files | grep -iE '\.(pdf|pptx?|key)$|(^|/)Tro_Reference/|(^|/)ChemistrySlides/' || true)
          if [ -n "$bad" ]; then
            echo "::error::These files must not be in the repository:"
            echo "$bad"
            exit 1
          fi

      - name: Install dependencies
        run: npm ci

      # Two copies of katex make every \ce{} render as literal text.
      - name: Require a single copy of katex
        run: |
          copies=$(find node_modules -type d -name katex | grep -E 'node_modules/katex$' || true)
          echo "$copies"
          if [ "$(echo "$copies" | grep -c .)" -ne 1 ]; then
            echo "::error::Expected exactly one node_modules/katex, found the folders above. See astro.config.mjs."
            exit 1
          fi

      - name: Unit tests
        run: npm test

      - name: Install the test browser
        run: npx playwright install --with-deps chromium

      # Builds the site (including search index and check-dist), then runs
      # the browser tests against the built pages.
      - name: Build and browser tests
        run: npm run test:e2e

  deploy:
    name: Deploy to SiteGround
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    # The deploy secrets live in this environment, which only main may use,
    # so a pull request -- including one from a fork of this public
    # repository -- can never read the SSH key.
    environment: production
    concurrency:
      group: deploy-production
      cancel-in-progress: false
    env:
      SG_HOST: ${{ secrets.SG_HOST }}
      SG_USER: ${{ secrets.SG_USER }}
      SG_PATH: ${{ secrets.SG_PATH }}
      SG_SITE_ID: ${{ vars.SG_SITE_ID }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24
          cache: npm

      - name: Check the deploy settings
        env:
          SG_SSH_KEY: ${{ secrets.SG_SSH_KEY }}
          SG_KNOWN_HOSTS: ${{ secrets.SG_KNOWN_HOSTS }}
        run: |
          missing=""
          for name in SG_HOST SG_USER SG_PATH SG_SSH_KEY SG_KNOWN_HOSTS; do
            [ -n "${!name}" ] || missing="$missing $name"
          done
          if [ -n "$missing" ]; then
            echo "::error::Missing secrets in the production environment:$missing. See docs/DEPLOY.md."
            exit 1
          fi
          # Plain names and paths only: they go into ssh and rsync unquoted.
          [[ "$SG_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || { echo "::error::SG_HOST must be a bare hostname."; exit 1; }
          [[ "$SG_USER" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "::error::SG_USER must be the SSH username alone."; exit 1; }
          if [[ ! "$SG_PATH" =~ ^/[A-Za-z0-9._/-]+$ || "$SG_PATH" =~ (^|/)\.\.(/|$) ]]; then
            echo "::error::SG_PATH must be an absolute path without '..'."
            exit 1
          fi
          if [[ -n "$SG_SITE_ID" && ! "$SG_SITE_ID" =~ ^[0-9]+$ ]]; then
            echo "::error::The SG_SITE_ID variable must be a number."
            exit 1
          fi

      - name: Build the site
        run: |
          npm ci
          npm run build

      - name: Set up SSH
        env:
          SG_SSH_KEY: ${{ secrets.SG_SSH_KEY }}
          SG_KNOWN_HOSTS: ${{ secrets.SG_KNOWN_HOSTS }}
        run: |
          install -m 700 -d ~/.ssh
          printf '%s\n' "$SG_SSH_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          # The server's host key, pinned: a host answering with a different
          # key fails the connection instead of being trusted.
          printf '%s\n' "$SG_KNOWN_HOSTS" > ~/.ssh/known_hosts
          cat > ~/.ssh/config <<EOF
          Host siteground
            HostName $SG_HOST
            User $SG_USER
            Port 18765
            IdentityFile ~/.ssh/deploy_key
            IdentitiesOnly yes
            StrictHostKeyChecking yes
            BatchMode yes
          EOF

      # rsync --delete removes whatever else is in the target, so refuse a
      # folder that has not been marked as this site's root (a wrong SG_PATH,
      # or the one-time setup in docs/DEPLOY.md not done yet).
      - name: Confirm the target is the ChemStudy site root
        run: |
          ssh siteground "test -f '$SG_PATH/.chemstudy-site'" || {
            echo "::error::$SG_PATH has no .chemstudy-site marker. See docs/DEPLOY.md, 'One-time server setup'."
            exit 1
          }

      # .well-known holds the certificate challenge files SiteGround manages.
      - name: Upload the site
        run: rsync -az --delete --exclude '.well-known/' dist/ "siteground:$SG_PATH/"

      # Checksums over SSH, never HTTP: repeated automated HTTP requests trip
      # SiteGround's bot protection for the whole address.
      - name: Verify the upload
        run: |
          for f in index.html 404.html .chemstudy-site; do
            here=$(md5sum "dist/$f" | cut -d' ' -f1)
            there=$(ssh siteground "md5sum '$SG_PATH/$f'" | cut -d' ' -f1)
            if [ "$here" != "$there" ]; then
              echo "::error::$f on the server does not match the build ($here vs $there)."
              exit 1
            fi
            echo "$f ok ($here)"
          done

      - name: Flush the SiteGround cache
        if: env.SG_SITE_ID != ''
        run: ssh siteground "site-tools-client domain-all update id=$SG_SITE_ID flush_cache=1"
```

- [ ] **Step 2: Commit, push and open the pull request**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: build and test every pull request, deploy main to SiteGround"
git push -u origin topic/foundation
gh pr create --base main --head topic/foundation \
  --title "feat: ChemStudy foundation" \
  --body "Brand, page shell, lesson building blocks, progress, search and CI, proven with lesson 5.2. Plan: docs/superpowers/plans/2026-11-12-chemstudy-foundation.md. Fact-check of 5.2: <findings or 'no findings'>."
```

Replace `<findings or 'no findings'>` with the real outcome of Task 15 before running.

- [ ] **Step 3: Watch the check**

Run: `gh pr checks --watch --interval 20`
Expected: `Build and test  pass`. (`Deploy to SiteGround` shows as skipped on a pull request.)

If it fails, read the log with `gh run view --log-failed`, fix the cause on the branch, push, and watch again. Do not weaken a test to get green.

- [ ] **Step 4: Protect `main`**

Write this to a file named `ruleset.json` in your scratch folder (not in the repository):

```json
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "allowed_merge_methods": ["merge", "squash", "rebase"],
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_approving_review_count": 0,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [{ "context": "Build and test", "integration_id": 15368 }]
      }
    }
  ]
}
```

```bash
gh api -X POST repos/SahanGH/chem-study/rulesets --input <path-to>/ruleset.json \
  --jq '"\(.id) \(.name) enforcement=\(.enforcement)"'
```

Expected: `<id> Protect main enforcement=active`. (`15368` is the GitHub Actions app, the same value the AP_Chem_Prep and gbv-signups rulesets use.)

- [ ] **Step 5: Do not merge yet**

Merging pushes to `main`, which runs the deploy job. Until Task 17 is done that job fails at "Check the deploy settings". Leave the pull request open and go to Task 17. If the domain is not ready and the foundation should land anyway, merging is safe — the deploy fails before touching anything — but tell the user the red deploy is expected.

---

### Task 17: Deploy to chem-study.com

**Files:**
- Create: `docs/DEPLOY.md`

**Needs the user first.** Stop and ask for these if they are not done:
1. `chem-study.com` is registered.
2. In SiteGround, it has been added as a website on the GrowBig plan, with SSL (Let's Encrypt) issued and HTTPS Enforce on.
3. The user can open Site Tools for that site → Devs → SSH Keys Manager.

- [ ] **Step 1: Write `docs/DEPLOY.md`**

```markdown
# Deploying ChemStudy

`chem-study.com` is served by SiteGround. A merge to `main` builds the site
on GitHub and uploads `dist/` over SSH. Nothing is deployed by hand.

## How it flows

1. Work on `topic/<name>`. Preview with `npm run dev`.
2. Before pushing: `npm test` and `npm run test:e2e`.
3. Open a pull request into `main`. The **Build and test** check must pass.
4. Merge. The push to `main` reruns the check, then **Deploy to SiteGround**
   builds, uploads with `rsync --delete`, verifies three files by checksum
   over SSH and flushes the cache.

`main` is protected by the **Protect main** ruleset: pull request required,
check required, no force-push or deletion, no bypass.

## GitHub settings

Secrets, in the **production** environment (deployment branches: `main`
only):

| Secret | Value |
|---|---|
| `SG_HOST` | SSH hostname from Site Tools → Devs → SSH Keys Manager → SSH Credentials |
| `SG_USER` | SSH username from the same panel |
| `SG_PATH` | Absolute path of the site's `public_html` |
| `SG_SSH_KEY` | Private half of the deploy key |
| `SG_KNOWN_HOSTS` | The server's host-key lines |

Variable, in the same environment:

| Variable | Value |
|---|---|
| `SG_SITE_ID` | The `id=` of chem-study.com from `site-tools-client domain-all list`. If unset, the cache flush is skipped. |

## The deploy key

CI has its own RSA key (SiteGround's importer rejects ed25519), imported in
Site Tools → Devs → SSH Keys Manager with the name
`github-actions-chemstudy-deploy`. Import it there rather than editing
`~/.ssh/authorized_keys2` by hand: Site Tools rewrites that file.

To rotate: generate a new key, import it, update `SG_SSH_KEY`, delete the
old key in Site Tools.

## One-time server setup

The deploy refuses to write into a folder that is not marked as this site's
root, because `rsync --delete` removes everything else there. Once, over
SSH:

    touch <SG_PATH>/.chemstudy-site

## When a deploy fails

- **Missing secrets** — the "Check the deploy settings" step names them.
- **No `.chemstudy-site` marker** — `SG_PATH` is wrong, or the one-time
  setup above was not done.
- **Host key mismatch** — SiteGround moved the server. Read the new key
  over a connection you trust and update `SG_KNOWN_HOSTS`. Do not disable
  the check.
- **Verify step fails** — the upload was interrupted. Re-run the job.
```

- [ ] **Step 2: Get the SSH details from the user**

Ask the user for the **hostname** and **username** shown under SSH Credentials for the chem-study.com site. Do not guess them from the AP_Chem_Prep site: a separate website has its own.

- [ ] **Step 3: Generate the deploy key and have the user import it**

```bash
ssh-keygen -q -t rsa -b 4096 -N "" -C "github-actions-chemstudy-deploy" -f "<scratch>/chemstudy_ci_deploy"
cat "<scratch>/chemstudy_ci_deploy.pub"
```

Give the user the printed public key and ask them to import it in Site Tools → Devs → SSH Keys Manager → Import, named `github-actions-chemstudy-deploy`. Wait for them to confirm.

- [ ] **Step 4: Confirm the key works and find the paths**

```bash
ssh -i "<scratch>/chemstudy_ci_deploy" -o IdentitiesOnly=yes -p 18765 <user>@<host> \
  "pwd; ls ~/www/; site-tools-client domain-all list | grep -o 'id=[0-9]* name=[^ ]*'"
```

Expected: a home directory, a `www/chem-study.com` folder, and a line such as `id=1 name=chem-study.com`. Record `SG_PATH` as `<home>/www/chem-study.com/public_html` and `SG_SITE_ID` as that id. On first connection, check the host-key fingerprint shown against Site Tools before accepting it.

- [ ] **Step 5: Mark the site root**

```bash
ssh -i "<scratch>/chemstudy_ci_deploy" -o IdentitiesOnly=yes -p 18765 <user>@<host> \
  "ls -la <SG_PATH>; touch <SG_PATH>/.chemstudy-site"
```

Look at the listing first. Expected: only SiteGround's default placeholder page (and possibly `.well-known`). If there is anything else, stop and ask the user — the first deploy deletes it.

- [ ] **Step 6: Create the environment and its settings**

Write `{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}` to `<scratch>/env.json`, then:

```bash
R=SahanGH/chem-study
gh api -X PUT repos/$R/environments/production --input "<scratch>/env.json" --jq .name
gh api -X POST repos/$R/environments/production/deployment-branch-policies -f name=main -f type=branch --jq .name
gh secret set SG_HOST --env production -R $R --body "<host>"
gh secret set SG_USER --env production -R $R --body "<user>"
gh secret set SG_PATH --env production -R $R --body "<SG_PATH>"
gh secret set SG_SSH_KEY --env production -R $R < "<scratch>/chemstudy_ci_deploy"
ssh-keygen -F "[<host>]:18765" -f ~/.ssh/known_hosts | grep -v '^#' > "<scratch>/kh.txt"
gh secret set SG_KNOWN_HOSTS --env production -R $R < "<scratch>/kh.txt"
gh variable set SG_SITE_ID --env production -R $R --body "<id>"
gh secret list --env production -R $R
rm "<scratch>/kh.txt" "<scratch>/chemstudy_ci_deploy" "<scratch>/chemstudy_ci_deploy.pub"
```

Expected: five secrets listed. The private key now exists only in the GitHub secret.

- [ ] **Step 7: Commit the runbook and merge**

```bash
git add docs/DEPLOY.md
git commit -m "docs: add the deploy runbook"
git push
gh pr checks --watch --interval 20
gh pr merge --merge
```

Expected: the check passes, then the merge succeeds.

- [ ] **Step 8: Watch the first deploy**

```bash
gh run watch "$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Expected: `Build and test` passes, then `Deploy to SiteGround` passes, with `index.html ok`, `404.html ok` and `.chemstudy-site ok` in the verify step.

- [ ] **Step 9: Look at the live site**

Ask the user to open `https://chem-study.com` and confirm: the home page shows nine units with Unit 5 linked, the lesson renders its equations, search finds "initial rates", and the theme switch works. One look by a person, not repeated automated requests.

- [ ] **Step 10: Return to `main`**

```bash
git checkout main && git pull --ff-only && git branch -d topic/foundation
```

---

## What this plan delivers against the spec

| Stage 1 "done when" item | Where |
|---|---|
| 1. chem-study.com serves the new site over HTTPS | Task 17 |
| 2. Home, unit, lesson, About, 404 in light and dark, phone to desktop | Tasks 6, 9, 10, 11; Task 14 checks both themes |
| 2/3. All 11 Unit 5 lessons | **Lesson 5.2 only here.** The other ten are Plan 2. |
| 2. Unit 5 practice | **Not here.** Plan 3. |
| 3. Lessons have all seven parts and pass fact-check | Parts enforced by Task 13; fact-check in Task 15 |
| 4. Three interactive diagrams | **Not here.** Plan 2. |
| 5. Search | Task 12 |
| 6. Progress remembered on the device | Tasks 4, 9, 10 |
| 7. Merge builds, tests and deploys with no manual step | Tasks 16, 17 |
| 8. Other units marked "coming soon" | Task 10 |
