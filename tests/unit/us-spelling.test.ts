import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { britishSpellings, checkSpelling } from '../../scripts/us-spelling.mjs';

const words = (text: string) => britishSpellings(text).map((found) => found.word);

describe('britishSpellings', () => {
  it('finds British spellings of each kind the rule lists', () => {
    expect(words('The colour of vapourised caesium')).toEqual(['colour', 'vapourised', 'caesium']);
    expect(words('ionisation, analysed, a labelled centre, 5 litres')).toEqual([
      'ionisation',
      'analysed',
      'labelled',
      'centre',
      'litres',
    ]);
    expect(words('Maths: 50 per cent. Sulphuric acid on aluminium.')).toEqual([
      'maths',
      'per cent',
      'sulphuric',
      'aluminium',
    ]);
  });

  it('finds a phrase that a line break splits', () => {
    expect(words('fifty per\ncent of the full  stop')).toEqual(['per cent', 'full stop']);
  });

  it('finds plurals and the -er forms of the words it lists', () => {
    expect(words('offences, licences, judgements, moulds, travellers, an organiser, an analyser')).toEqual([
      'offences',
      'licences',
      'judgements',
      'moulds',
      'travellers',
      'organiser',
      'analyser',
    ]);
  });

  it('leaves American spellings and look-alikes alone', () => {
    expect(words('analyses made an hour apart; catalysis; synthesis; emphasis')).toEqual([]);
    expect(words('rise, precise, exercise, otherwise, galvanized, burnt sienna')).toEqual([]);
  });

  it('says which line a word is on', () => {
    expect(britishSpellings('one\ntwo colour\nthree')).toEqual([{ word: 'colour', line: 2 }]);
  });
});

describe('the site', () => {
  it('is written in American English', () => {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    const { files, problems } = checkSpelling(root);

    // An empty or misplaced folder would otherwise pass.
    expect(files).toBeGreaterThan(100);
    expect(problems).toEqual([]);
  });

  it('refuses a named file that is not there, rather than check nothing', () => {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    expect(() => checkSpelling(root, ['src/no-such-file.mdx'])).toThrow(/no-such-file\.mdx/);
  });
});
