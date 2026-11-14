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

  it('keeps a sign that follows a word, after a space', () => {
    expect(numberTokens('The enthalpy change is -92 kJ')).toEqual(['-92']);
    expect(numberTokens('a charge of +2')).toEqual(['+2']);
  });

  it('writes an exponent typed with a capital E or a plus sign the same way', () => {
    expect(numberTokens('1.2E-3 and 3.0e+2')).toEqual(['1.2e-3', '3.0e2']);
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

  // A drawing is the site's own addition, and its description may contain ">".
  it('reads no numbers or formulas from a Lewis drawing', () => {
    const body = [
      '<Question number={1} topic="2.5">',
      '',
      'Draw water.',
      '',
      '<Answer>',
      '',
      'Two lone pairs on O.',
      '',
      '<Lewis',
      '  alt="Lewis diagram of water: oxygen in the middle with 2 lone pairs, an H-O-H angle > 90 degrees, formal charge 0 on every atom."',
      '  atoms={[',
      "    { id: 'O', symbol: 'O', x: 0, y: 0, lonePairs: 2 },",
      "    { id: 'H1', symbol: 'H', x: -1, y: 0 },",
      "    { id: 'H2', symbol: 'H', x: 1, y: 0 },",
      '  ]}',
      "  bonds={[['O', 'H1', 1], ['O', 'H2', 1]]}",
      '/>',
      '',
      '</Answer>',
      '',
      '</Question>',
    ].join('\n');

    const [, question] = siteFacts(mdx(body));

    expect(question?.numbers).toEqual(['2.5']);
    expect(question?.formulas).toEqual([]);
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

  it('reads a kind written in quotes', () => {
    expect(pieceOf('---\ntitle: "Skill ladders"\nkind: "ladders"\n---\n\nText.\n')).toBe('section');
    expect(pieceOf("---\ntitle: 'Skill ladders'\nkind: 'ladders'\n---\n\nText.\n")).toBe('section');
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

  it('reports a minus sign lost in a sentence', () => {
    const source = String.raw`\problem[]{The enthalpy change is \SI{-92}{\kilo\joule}. \answerlines[2]{It is exothermic.}}`;
    const site = '<Question number={1}>\n\nThe enthalpy change is 92 kJ.\n\n<Answer>\n\nIt is exothermic.\n\n</Answer>\n\n</Question>';

    expect(differences(tex(source), mdx(site))).toEqual([
      'question 1: number only in the source: -92',
      'question 1: number only on the site: 92',
    ]);
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
