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
