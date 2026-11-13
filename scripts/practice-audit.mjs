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
