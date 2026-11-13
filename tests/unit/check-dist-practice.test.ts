import { describe, expect, it } from 'vitest';
import { checkPage } from '../../scripts/check-dist.mjs';

const everythingExists = () => true;

const answer = (text = 'first order') =>
  `<details data-part="answer"><summary>Show answer</summary><div class="answer-body">${text}</div></details>`;
const part = (inner: string) => `<div data-part="part"><p>(a)</p><div>${inner}</div></div>`;
const rubric = (...points: number[]) =>
  `<details data-part="rubric"><ul>${points.map((p) => `<li data-rubric-points="${p}">credit</li>`).join('')}</ul></details>`;
// An empty heading leaves the <h3> out, so the check has to name the question by its place.
const question = (inner: string, attributes = '', heading = 'Question 1') =>
  `<section data-part="question"${attributes}>${heading ? `<h3>${heading}</h3>` : ''}${inner}</section>`;
const practice = (inner: string, attributes = '') =>
  `<main><article data-practice="worksheet"${attributes}>${inner}</article></main>`;

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

  it('reports an empty answer in a part', () => {
    const html = practice(question(part(answer('  '))));

    expect(checkPage(html, everythingExists)).toEqual(['Question 1, part 1, has an empty answer']);
  });

  it('reports an empty answer to the whole question that follows its parts', () => {
    const html = practice(question(part(answer()) + answer('  ')));

    expect(checkPage(html, everythingExists)).toEqual(['Question 1 has an empty answer']);
  });

  it('names a question that has no heading by its place on the page', () => {
    const html = practice(question('<p>Why?</p>', '', ''));

    expect(checkPage(html, everythingExists)).toEqual(['question 1 has no answer']);
  });

  it('names the question that lacks an answer when another has one', () => {
    const html = practice(question(answer()) + question('<p>Why?</p>', '', 'Question 2'));

    expect(checkPage(html, everythingExists)).toEqual(['Question 2 has no answer']);
  });

  it('passes a page whose stated points are the sum of its questions', () => {
    const html = practice(
      question(answer() + rubric(6, 4), ' data-points="10"') +
        question(answer() + rubric(2, 2), ' data-points="4"', 'Question 2'),
      ' data-points="14"',
    );

    expect(checkPage(html, everythingExists)).toEqual([]);
  });

  it('reports a page whose stated points are not the sum of its questions', () => {
    const html = practice(
      question(answer() + rubric(6, 4), ' data-points="10"') +
        question(answer() + rubric(2, 2), ' data-points="4"', 'Question 2'),
      ' data-points="15"',
    );

    expect(checkPage(html, everythingExists)).toEqual([
      'the page says it is worth 15 points but its questions add up to 14',
    ]);
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
