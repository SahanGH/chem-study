// Post-build checks for defects that leave the build green:
//   - math left as source text (\ce{...} rendered literally) or KaTeX errors
//   - internal links to pages that do not exist
//   - lessons missing one of their required parts
//   - words run together where a link, <em> or <strong> touches a letter
//   - practice questions with no answer, rubrics that do not add up to a
//     question's points, and LaTeX left in view on a practice page
//
//   node scripts/check-dist.mjs        checks ./dist, exits 1 on any problem
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeType, parse } from 'node-html-parser';

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
// \ce matches with nothing required after it: the real failure prints
// "\ceNO2(g)" or "\ce2NO(g)" (the braces are consumed), so a letter or a digit
// may follow. The other commands must not be followed by a letter, so that
// prose like "\textbook" is not mistaken for \text.
const RAW_MATH = /\\ce|\\(?:frac|text|times|Delta|rightarrow)(?![a-zA-Z])|\$\$/;

const WORD_AT_END = /[\p{L}\p{N}]+$/u;
const WORD_AT_START = /^[\p{L}\p{N}]+/u;

/**
 * @param {import('node-html-parser').Node | null | undefined} node
 * @returns {string} the node's text when it is a text node, otherwise ''
 */
const textBeside = (node) => (node?.nodeType === NodeType.TEXT_NODE ? node.text : '');

// Astro's HTML compression drops the space between text and an inline element
// that follows a line break ("share underCC BY-NC-SA"). Reports each place a
// link, <em> or <strong> touches a letter or digit on either side, quoting the
// joined word as a reader would see it. Math output and non-prose are skipped.
//
// Known limit: deliberate mid-word emphasis such as 2<em>x</em> is reported
// too, because it looks the same as the defect. Write such things as math.
/**
 * @param {import('node-html-parser').HTMLElement} root
 * @returns {string[]} one message per place words touch
 */
function runTogether(root) {
  const found = [];
  for (const element of root.querySelectorAll('a, em, strong')) {
    if (element.closest('.katex, annotation, script, style')) continue;
    const text = element.text;
    const leading = textBeside(element.previousSibling).match(WORD_AT_END)?.[0];
    const first = text.match(WORD_AT_START)?.[0];
    if (leading && first) found.push(`words run together: "${leading}${first}"`);
    const last = text.match(WORD_AT_END)?.[0];
    const trailing = textBeside(element.nextSibling).match(WORD_AT_START)?.[0];
    if (last && trailing) found.push(`words run together: "${last}${trailing}"`);
  }
  return found;
}

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
      // The page script grades against the first list only; a list inside the
      // explanation must not add to the count.
      const options = check.querySelector('ul, ol')?.children.length ?? 0;
      if (!(Number.isInteger(answer) && answer >= 1 && answer <= options)) {
        problems.push(
          `lesson ${topic}: a check says the answer is option ${answer} but has only ${options} options`,
        );
      }
    }
  }

  for (const element of root.querySelectorAll('a[href], img[src]')) {
    const target = element.getAttribute('href') ?? element.getAttribute('src') ?? '';
    if (!target.startsWith('/') || target.startsWith('//')) continue;
    // split always yields at least one element; the default only satisfies the checker.
    const [urlPath = ''] = target.split(/[#?]/);
    if (!exists(urlPath)) problems.push(`broken link: ${urlPath}`);
  }

  problems.push(...runTogether(root));

  // MathML annotations legitimately hold the TeX source; scripts and styles
  // are not prose.
  for (const node of root.querySelectorAll('annotation, script, style')) node.remove();
  if (RAW_MATH.test(root.text)) problems.push('unrendered math is visible in the page text');

  const practice = root.querySelector('[data-practice]');
  if (practice) problems.push(...practiceProblems(practice));

  return problems;
}

// Practice was converted from LaTeX, so its marks could survive into a page:
// a command, a math delimiter, a typed dash or quote, a tie. A "~" or a "$"
// typed on purpose in practice prose is reported too, deliberately; write such
// a thing in words.
const LEFTOVER_LATEX = /\\[a-zA-Z]+|\$|---|``|''|~/;

/**
 * @param {import('node-html-parser').HTMLElement} answer
 * @returns {boolean} whether the answer's body has no text
 */
const isEmptyAnswer = (answer) => !answer.querySelector('.answer-body')?.text.trim();

/**
 * What must hold for a practice page: it has questions, every question (or,
 * when it has parts, every part) shows an answer with something in it, a
 * scored question has a rubric that adds up to its points, the page's stated
 * total matches its questions, and nothing of the LaTeX it was converted from
 * is left in view.
 * @param {import('node-html-parser').HTMLElement} practice the page's article,
 *   with MathML annotations already removed
 * @returns {string[]} problems, empty when the page is fine
 */
function practiceProblems(practice) {
  const problems = [];
  const questions = practice.querySelectorAll('[data-part="question"]');
  if (questions.length === 0) problems.push('practice page has no questions');

  let questionPoints = 0;
  questions.forEach((question, index) => {
    const name = question.querySelector('h3')?.text.trim() || `question ${index + 1}`;
    const parts = question.querySelectorAll('[data-part="part"]');
    // A question without parts is answered as a whole.
    const answered = parts.length > 0 ? parts : [question];
    answered.forEach((holder, position) => {
      const where = parts.length > 0 ? `${name}, part ${position + 1},` : name;
      const answers = holder.querySelectorAll('[data-part="answer"]');
      if (answers.length === 0) problems.push(`${where} has no answer`);
      if (answers.some(isEmptyAnswer)) problems.push(`${where} has an empty answer`);
    });
    // With parts, an answer to the whole question sits outside every part and
    // is not reached above. Without parts the loop above has covered it.
    if (parts.length > 0) {
      const wholeAnswers = question
        .querySelectorAll('[data-part="answer"]')
        .filter((answer) => !answer.closest('[data-part="part"]'));
      if (wholeAnswers.some(isEmptyAnswer)) problems.push(`${name} has an empty answer`);
    }

    const lines = question.querySelectorAll('[data-rubric-points]');
    const total = lines.reduce((sum, line) => sum + Number(line.getAttribute('data-rubric-points')), 0);
    const points = question.getAttribute('data-points');
    questionPoints += Number(points ?? 0);
    if (points === undefined) {
      if (lines.length > 0) problems.push(`${name} has a rubric but is not given any points`);
    } else if (lines.length === 0) {
      problems.push(`${name} is worth ${points} points but has no rubric`);
    } else if (total !== Number(points)) {
      problems.push(`${name} is worth ${points} points but its rubric adds up to ${total}`);
    }
  });

  const stated = practice.getAttribute('data-points');
  if (stated !== undefined && Number(stated) !== questionPoints) {
    problems.push(`the page says it is worth ${stated} points but its questions add up to ${questionPoints}`);
  }

  const leftover = LEFTOVER_LATEX.exec(practice.text)?.[0];
  if (leftover) problems.push(`LaTeX left in the page text: "${leftover}"`);

  return problems;
}

/**
 * @param {string} dir
 * @returns {string[]} every built page under dir, skipping the search index
 */
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'pagefind' ? [] : htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

/**
 * @param {string} dist the built site
 * @returns {(urlPath: string) => boolean} whether a site path names a page or
 *   file inside dist
 */
function existsIn(dist) {
  const root = path.resolve(dist);
  return (urlPath) => {
    let decoded;
    try {
      decoded = decodeURIComponent(urlPath);
    } catch (error) {
      // A malformed escape such as "/50%/" names no file, so the link is
      // broken. Only this error is meant: anything else is a real failure.
      if (error instanceof URIError) return false;
      throw error;
    }
    const target = path.resolve(path.join(root, decoded));
    // ".." (written plainly or as %2e%2e) must not reach a file beside dist.
    if (target !== root && !target.startsWith(root + path.sep)) return false;
    // The site uses trailing slashes: a page link must end in "/".
    if (urlPath.endsWith('/')) return fs.existsSync(path.join(target, 'index.html'));
    return fs.existsSync(target) && fs.statSync(target).isFile();
  };
}

/**
 * Checks every built page under a folder.
 * @param {string} dist the built site
 * @returns {{ pages: number, problems: { file: string, problem: string }[] }}
 */
export function checkSite(dist) {
  const exists = existsIn(dist);
  const files = htmlFiles(dist);
  /** @type {{ file: string, problem: string }[]} */
  const problems = [];
  // An empty folder would otherwise pass: nothing to check is not a clean site.
  if (files.length === 0) problems.push({ file: '.', problem: 'no pages were built' });
  for (const file of files) {
    for (const problem of checkPage(fs.readFileSync(file, 'utf8'), exists)) {
      problems.push({ file: path.relative(dist, file), problem });
    }
  }
  return { pages: files.length, problems };
}

function main() {
  const dist = path.resolve('dist');
  if (!fs.existsSync(dist)) {
    console.error('check-dist: there is no dist/ folder. Run the Astro build first.');
    process.exit(1);
  }
  const { pages, problems } = checkSite(dist);
  for (const { file, problem } of problems) console.error(`${file}: ${problem}`);
  console.log(`check-dist: ${pages} pages, ${problems.length} problem(s)`);
  if (problems.length > 0) process.exit(1);
}

// Real paths on both sides: Node resolves links in import.meta.url but not in
// argv[1], so a plain comparison fails when the script is reached through a
// symlink or junction, and the build would then check nothing and succeed.
const entryPoint = process.argv[1];
if (entryPoint && fs.realpathSync(entryPoint) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
