// Post-build checks for defects that leave the build green:
//   - math left as source text (\ce{...} rendered literally) or KaTeX errors
//   - internal links to pages that do not exist
//   - lessons missing one of their required parts
//   - words run together where a link, <em> or <strong> touches a letter
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
// No \b after the name: the real failure prints "\ce2NO(g)" (the braces are
// consumed), and "e2" has no word boundary in it.
const RAW_MATH = /\\(?:ce|frac|text|times|Delta|rightarrow)(?![a-zA-Z])|\$\$/;

const WORD_AT_END = /[\p{L}\p{N}]+$/u;
const WORD_AT_START = /^[\p{L}\p{N}]+/u;

const textBeside = (node) => (node?.nodeType === NodeType.TEXT_NODE ? node.text : '');

// Astro's HTML compression drops the space between text and an inline element
// that follows a line break ("share underCC BY-NC-SA"). Reports each place a
// link, <em> or <strong> touches a letter or digit on either side, quoting the
// joined word as a reader would see it. Math output and non-prose are skipped.
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

  problems.push(...runTogether(root));

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
