// Finds British spellings and usage in the site's sources. The rule is in
// CLAUDE.md: everything in this repository is written in American English.
//
//   node scripts/us-spelling.mjs            reads the folders in SCANNED
//   node scripts/us-spelling.mjs <file>...  reads only the files named
//
// It reads and changes nothing. It exits with 1 when it finds anything.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** What is read, from the top of the repository. */
export const SCANNED = ['src', 'public/figures', 'tests', 'scripts', 'README.md', 'docs/DEPLOY.md'];

/** The file types that hold words a person wrote. */
const EXTENSIONS = new Set(['.astro', '.css', '.md', '.mdx', '.mjs', '.svelte', '.svg', '.ts']);

/**
 * Files that name British spellings on purpose: this list and its test. Paths
 * are from the top of the repository, with forward slashes. CLAUDE.md, which
 * states the rule, and docs/superpowers/, whose plans quote the spellings they
 * changed, are not read at all.
 */
export const SKIPPED = new Set(['scripts/us-spelling.mjs', 'tests/unit/us-spelling.test.ts']);

/**
 * A word that must stand, with its reason. Lowercase. Empty today: add to it
 * only when the American spelling would be wrong, never to quiet the check.
 * @type {Map<string, string>}
 */
export const ALLOWED = new Map([]);

// Verbs that end in -ize in American English, by their stem. A general
// "-ise" pattern would catch rise, precise, exercise and otherwise.
const IZE_STEMS = [
  'atom', 'author', 'capital', 'categor', 'central', 'character', 'critic', 'crystall', 'custom', 'delocal',
  'emphas', 'equal', 'familiar', 'final', 'galvan', 'general', 'harmon', 'hybrid', 'initial', 'ion', 'item',
  'local', 'magnet', 'maxim', 'memor', 'minim', 'modern', 'neutral', 'normal', 'optim', 'organ', 'oxid',
  'penal', 'polar', 'pressur', 'priorit', 'random', 'rational', 'real', 'recogn', 'solubil', 'special',
  'stabil', 'standard', 'steril', 'summar', 'symbol', 'synthes', 'util', 'vapor', 'vapour', 'visual',
];

// Verbs that end in -yze in American English. "Analyses" is left out: it is
// the plural of "analysis" on both sides of the Atlantic.
const YZE = ['analyse', 'analysed', 'analysing', 'catalys(?:e|ed|es|ing)', 'electrolys(?:e|ed|es|ing)', 'hydrolys(?:e|ed|es|ing)', 'paralys(?:e|ed|es|ing)'];

const OUR = ['behaviour', 'colour', 'favour', 'flavour', 'harbour', 'honour', 'humour', 'labour', 'neighbour', 'odour', 'rumour', 'tumour', 'vapour', 'vigour'];

const RE = ['calibre', 'centimetre', 'centre', 'fibre', 'kilometre', 'litre', 'metre', 'millilitre', 'millimetre', 'nanometre', 'picometre', 'theatre'];

const DOUBLED = ['cancell', 'channell', 'fuell', 'labell', 'levell', 'modell', 'signall', 'travell'];

const WORDS = [
  'aeroplane', 'ageing', 'aluminium', 'amongst', 'anticlockwise', 'caesium', 'centring', 'cheque',
  'defence', 'dreamt', 'grey', 'judgement', 'learnt', 'licence', 'maths', 'mould', 'offence', 'practise',
  'practised', 'practises', 'practising', 'programme', 'programmes', 'skilful', 'spelt', 'towards', 'tyre',
  'tyres', 'whilst',
];

const PHRASES = ['full stop', 'per cent'];

const PATTERN = new RegExp(
  '\\b(?:' +
    [
      `(?:${IZE_STEMS.join('|')})is(?:e|ed|es|ing|ation|ations|able|ability)`,
      ...YZE,
      `(?:${OUR.join('|')})\\w*`,
      `(?:${RE.join('|')})(?:s|d)?`,
      `(?:${DOUBLED.join('|')})(?:ed|ing)`,
      'sulph\\w+',
      ...WORDS,
      ...PHRASES,
    ].join('|') +
    ')\\b',
  'gi',
);

/**
 * @param {string} text
 * @returns {{ word: string, line: number }[]} every British spelling, in order
 */
export function britishSpellings(text) {
  const found = [];
  for (const match of text.matchAll(PATTERN)) {
    const word = match[0].toLowerCase();
    if (ALLOWED.has(word)) continue;
    const line = text.slice(0, match.index).split('\n').length;
    found.push({ word, line });
  }
  return found;
}

/** @param {string} target a file or a folder @returns {string[]} the files under it that are read */
function filesUnder(target) {
  if (!fs.existsSync(target)) return [];
  if (fs.statSync(target).isFile()) return [target];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(target, entry.name);
      if (entry.isDirectory()) return filesUnder(full);
      return EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
    })
    .sort();
}

/**
 * @param {string} root the top of the repository
 * @param {string[]} [targets] files or folders under it; SCANNED when left out
 * @returns {{ files: number, problems: { file: string, line: number, word: string }[] }}
 */
export function checkSpelling(root, targets = SCANNED) {
  const problems = [];
  let files = 0;
  for (const target of targets) {
    for (const file of filesUnder(path.resolve(root, target))) {
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (SKIPPED.has(relative)) continue;
      files += 1;
      for (const { word, line } of britishSpellings(fs.readFileSync(file, 'utf8'))) {
        problems.push({ file: relative, line, word });
      }
    }
  }
  return { files, problems };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const named = process.argv.slice(2);
  const { files, problems } = checkSpelling(root, named.length > 0 ? named : SCANNED);
  for (const { file, line, word } of problems) console.error(`${file}:${line}: ${word}`);
  console.log(`us-spelling: ${files} files, ${problems.length} British spelling(s)`);
  if (problems.length > 0) process.exit(1);
}

// Real paths on both sides, as in check-dist.mjs: a symlink must not make the
// script check nothing and succeed.
const entryPoint = process.argv[1];
if (entryPoint && fs.realpathSync(entryPoint) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
