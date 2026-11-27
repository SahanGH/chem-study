import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FEEDBACK_UNITS, checkPage, checkSite } from '../../scripts/check-dist.mjs';

const everythingExists = () => true;

const part = (name: string) => `<div data-part="${name}"></div>`;
const choice = (answer: number, options: number) =>
  `<cs-check data-part="check" data-answer="${answer}"><ul>${'<li>x</li>'.repeat(options)}</ul></cs-check>`;
// A unit with no lessons yet, so not on FEEDBACK_UNITS: these lessons test the other rules.
const lesson = (inner: string) => `<main data-topic="0.2">${inner}</main>`;
const fullLesson =
  part('worked') + part('trap') + part('key-points') + part('practice-next') + choice(1, 2).repeat(3);

describe('checkPage', () => {
  describe('feedback on a check', () => {
    const withMisses = (answer: number, options: number, misses: Record<number, string>, quote = "'") =>
      `<cs-check data-part="check" data-answer="${answer}" data-misses=${quote}${
        quote === '"' ? JSON.stringify(misses).replaceAll('"', '&quot;') : JSON.stringify(misses)
      }${quote}><ul>${'<li>x</li>'.repeat(options)}</ul></cs-check>`;
    const numeric = (slips?: Record<string, string>) =>
      `<cs-check data-part="check" data-numeric="5"${slips ? ` data-slips='${JSON.stringify(slips)}'` : ''}></cs-check>`;
    const parts = part('worked') + part('trap') + part('key-points') + part('practice-next');
    const inUnit = (unit: number, checks: string) => `<main data-topic="${unit}.2">${parts}${checks}</main>`;
    const all = { 2: 'Follow the units.', 3: 'Follow the units.', 4: 'Follow the units.' };

    it('reads messages whose quotation marks the build escaped', () => {
      const html = inUnit(0, withMisses(1, 4, { 9: 'Follow the units.' }, '"').repeat(3));
      expect(checkPage(html, everythingExists)).toContainEqual(expect.stringContaining('feedback for option 9'));
    });

    it('reports a message for an option the check does not have, in any unit', () => {
      const html = inUnit(0, withMisses(1, 4, { 5: 'Follow the units.' }).repeat(3));
      expect(checkPage(html, everythingExists)).toContainEqual(
        'lesson 0.2: a check has feedback for option 5 but has only 4 options',
      );
    });

    it('asks nothing of a unit that is not on the list', () => {
      expect(FEEDBACK_UNITS.has('0')).toBe(false);
      expect(checkPage(inUnit(0, choice(1, 4).repeat(3)), everythingExists)).toEqual([]);
    });

    it('in a unit on the list, reports a wrong option with no message', () => {
      const [unit] = [...FEEDBACK_UNITS];
      if (unit === undefined) return; // The list is empty until Unit 1's messages are written (Task 8).
      const html = inUnit(Number(unit), withMisses(1, 4, { 2: 'Follow the units.', 3: 'Follow the units.' }).repeat(3));
      expect(checkPage(html, everythingExists)).toContainEqual(`lesson ${unit}.2: a check says nothing for wrong option 4`);
    });

    it('in a unit on the list, reports a typed-number check that names no slip', () => {
      const [unit] = [...FEEDBACK_UNITS];
      if (unit === undefined) return;
      const html = inUnit(Number(unit), withMisses(1, 4, all).repeat(2) + numeric());
      expect(checkPage(html, everythingExists)).toContainEqual(`lesson ${unit}.2: a typed-number check names no slip`);
    });

    it('in a unit on the list, passes checks that are complete', () => {
      const [unit] = [...FEEDBACK_UNITS];
      if (unit === undefined) return;
      const html = inUnit(Number(unit), withMisses(1, 4, all).repeat(2) + numeric({ '6': 'Count again.' }));
      expect(checkPage(html, everythingExists)).toEqual([]);
    });
  });

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

  it.each([
    ['a formula starting with a capital letter', '\\ceNO2(g)+CO(g)'],
    ['a formula starting with H', '\\ceH2O'],
    ['a formula in brackets', '[\\ceNO]'],
    ['a fraction', '\\frac12'],
    ['text', '\\text{mol}'],
    ['a multiplication sign', '2 \\times 3'],
    ['a capital delta', '\\Delta H'],
    ['an arrow', 'A \\rightarrow B'],
    ['display math delimiters', '$$x$$'],
  ])('reports unrendered math: %s', (_name, source) => {
    const html = `<main><span class="katex-html">${source}</span></main>`;
    expect(checkPage(html, everythingExists)).toContainEqual(expect.stringContaining('unrendered math'));
  });

  it('does not report the words text, times or fraction written without a backslash', () => {
    const html = '<main><p>Read the text three times, then write the fraction.</p></main>';
    expect(checkPage(html, everythingExists)).toEqual([]);
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

  it('reports an image whose file does not exist', () => {
    const html = '<main><img src="/figures/x.svg" alt=""></main>';
    expect(checkPage(html, () => false)).toEqual(['broken link: /figures/x.svg']);
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
    expect(checkPage(html, everythingExists)).toEqual(['lesson 0.2 has 0 "trap", needs at least 1']);
  });

  it('reports a lesson with too few checks', () => {
    const html = lesson(part('worked') + part('trap') + part('key-points') + part('practice-next') + choice(1, 2));
    expect(checkPage(html, everythingExists)).toEqual(['lesson 0.2 has 1 "check", needs at least 3']);
  });

  it('reports a check whose answer points past its last option', () => {
    const html = lesson(fullLesson + choice(5, 4));
    expect(checkPage(html, everythingExists)).toEqual([
      'lesson 0.2: a check says the answer is option 5 but has only 4 options',
    ]);
  });

  describe('a check whose explanation holds a list of its own', () => {
    // The page script grades against the first list, the options; the list
    // inside the closing <details> is part of the explanation.
    const withExplanationList = (answer: string, options: number) =>
      `<cs-check data-part="check" data-answer="${answer}"><div class="check-body"><ul>${'<li>x</li>'.repeat(options)}</ul></div>` +
      `<details class="check-why"><p>Answer: option ${answer}</p><ol><li>a</li><li>b</li><li>c</li></ol></details></cs-check>`;

    it('counts only the options, not the explanation items', () => {
      const html = lesson(fullLesson + withExplanationList('5', 2));
      expect(checkPage(html, everythingExists)).toEqual([
        'lesson 0.2: a check says the answer is option 5 but has only 2 options',
      ]);
    });

    it('accepts an answer that is one of the options', () => {
      const html = lesson(fullLesson + withExplanationList('2', 2));
      expect(checkPage(html, everythingExists)).toEqual([]);
    });

    it('reports an answer that is not a whole number', () => {
      const html = lesson(fullLesson + withExplanationList('1.5', 2));
      expect(checkPage(html, everythingExists)).toEqual([
        'lesson 0.2: a check says the answer is option 1.5 but has only 2 options',
      ]);
    });

    it('takes the first list in the document whether it is ordered or not', () => {
      const html = lesson(
        fullLesson +
          '<cs-check data-part="check" data-answer="3"><div class="check-body"><ol><li>x</li><li>y</li></ol></div>' +
          '<details class="check-why"><ul><li>a</li><li>b</li><li>c</li></ul></details></cs-check>',
      );
      expect(checkPage(html, everythingExists)).toEqual([
        'lesson 0.2: a check says the answer is option 3 but has only 2 options',
      ]);
    });

    it('reports a check that has no list of options at all', () => {
      const html = lesson(fullLesson + '<cs-check data-part="check" data-answer="1"></cs-check>');
      expect(checkPage(html, everythingExists)).toEqual([
        'lesson 0.2: a check says the answer is option 1 but has only 0 options',
      ]);
    });
  });
});

describe('checkPage, words run together', () => {
  const inMain = (inner: string) => `<main>${inner}</main>`;
  const link = (text: string) => `<a href="/about/">${text}</a>`;

  it('reports text jammed against the start of a link', () => {
    const html = inMain(`<p>share under${link('the license')}.</p>`);
    expect(checkPage(html, everythingExists)).toEqual(['words run together: "underthe"']);
  });

  it('reports a link jammed against the text after it', () => {
    const html = inMain(`<p>${link('the license')}applies</p>`);
    expect(checkPage(html, everythingExists)).toEqual(['words run together: "licenseapplies"']);
  });

  it('reports the same for emphasis and strong text', () => {
    const html = inMain('<p>very<em>quiet</em> and <strong>loud</strong>ly</p>');
    expect(checkPage(html, everythingExists)).toEqual([
      'words run together: "veryquiet"',
      'words run together: "loudly"',
    ]);
  });

  it('counts digits as part of a word', () => {
    const html = inMain('<p>step<strong>2</strong></p>');
    expect(checkPage(html, everythingExists)).toEqual(['words run together: "step2"']);
  });

  it('treats letters outside ASCII as letters', () => {
    const html = inMain(`<p>café${link('été')}</p>`);
    expect(checkPage(html, everythingExists)).toEqual(['words run together: "caféété"']);
  });

  it('does not report a space on the correct side', () => {
    const html = inMain(`<p>share under ${link('the license')} and <em>more</em> text</p>`);
    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('does not report punctuation next to the element', () => {
    const html = inMain(`<p>(${link('x')}). ${link('y')}, <em>z</em>; <strong>w</strong>—done</p>`);
    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('does not report an element at the start or end of its parent', () => {
    const html = inMain(`<p>${link('first')}</p><p><em>only</em></p><p><strong>last</strong></p>`);
    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('does not report an element touching another element', () => {
    const html = inMain(`<p><em>a</em><strong>b</strong>${link('c')}</p>`);
    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('ignores annotations, scripts and styles', () => {
    const html = inMain(
      '<annotation>under<em>x</em>over</annotation><script>var s = "under<a>x</a>";</script><style>a{}</style>',
    );
    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('ignores anything inside KaTeX output', () => {
    const html = inMain('<span class="katex"><span class="base">a<em>b</em>c</span></span>');
    expect(checkPage(html, everythingExists)).toEqual([]);
  });
});

describe('checkSite', () => {
  let root: string;
  let dist: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-dist-'));
    dist = path.join(root, 'dist');
    fs.mkdirSync(dist);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  const writePage = (relative: string, html: string) => {
    const file = path.join(dist, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  };
  const goodPage = '<main><h1>About</h1></main>';

  it('reports an existing but empty folder as a site with no pages', () => {
    const { pages, problems } = checkSite(dist);
    expect(pages).toBe(0);
    expect(problems).toContainEqual(expect.objectContaining({ problem: expect.stringContaining('no pages were built') }));
  });

  it('reports nothing for a folder with one good page', () => {
    writePage('index.html', goodPage);
    expect(checkSite(dist)).toEqual({ pages: 1, problems: [] });
  });

  it('names the file, relative to dist, that links to a missing page', () => {
    writePage('index.html', '<main><a href="/missing/">x</a></main>');
    expect(checkSite(dist)).toEqual({
      pages: 1,
      problems: [{ file: 'index.html', problem: 'broken link: /missing/' }],
    });
  });

  it('accepts links to a page and a file that are inside dist', () => {
    writePage('index.html', '<main><a href="/about/">a</a><a href="/favicon.svg">b</a></main>');
    writePage('about/index.html', goodPage);
    fs.writeFileSync(path.join(dist, 'favicon.svg'), '<svg/>');
    expect(checkSite(dist)).toEqual({ pages: 2, problems: [] });
  });

  it.each(['/../outside.txt', '/%2e%2e/outside.txt'])(
    'reports a link that leaves dist, %s, even when the target exists',
    (href) => {
      fs.writeFileSync(path.join(root, 'outside.txt'), 'not part of the site');
      writePage('index.html', `<main><a href="${href}">x</a></main>`);
      expect(checkSite(dist).problems).toEqual([{ file: 'index.html', problem: `broken link: ${href}` }]);
    },
  );

  it('reports a link with a bad percent escape as broken instead of throwing', () => {
    writePage('index.html', '<main><a href="/50%/">x</a></main>');
    expect(checkSite(dist).problems).toEqual([{ file: 'index.html', problem: 'broken link: /50%/' }]);
  });
});
