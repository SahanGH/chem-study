import { describe, expect, it } from 'vitest';
import { gradeChoice, gradeNumeric, parseNumber, shownAnswer, type CheckAnswer } from '../../src/lib/check';

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
    ['1,234,567.5', 1234567.5],
    ['-1,200', -1200],
    ['.05', 0.05],
    ['5.', 5],
    ['-.5', -0.5],
    ['−3', -3],
    ['–3', -3],
    ['2.5×10^−3', 0.0025],
    ['2.5e−3', 0.0025],
    ['2.5e–3', 0.0025],
  ])('reads %s', (text, value) => {
    expect(parseNumber(text)).toBeCloseTo(value, 12);
  });

  // The answer line shows a power of ten with a raised exponent, so a student
  // may type or paste one back.
  it.each([
    ['5.12 × 10²¹', 5.12e21],
    ['5.86×10⁻²⁰', 5.86e-20],
    ['2.998 x 10⁸', 2.998e8],
    ['2.998 X 10⁸', 2.998e8],
    ['2.5*10⁻³', 0.0025],
    ['2.5 * 10⁻³', 0.0025],
    ['1 × 10⁺²', 100],
    ['-1.60 × 10⁻¹⁹', -1.6e-19],
    ['−1.60 × 10⁻¹⁹', -1.6e-19],
    ['3 × 10⁰', 3],
    ['1,200 × 10³', 1.2e6],
    ['.5×10¹', 5],
  ])('reads %s, with its exponent raised', (text, value) => {
    expect(parseNumber(text)).toBe(value);
  });

  it.each([
    '',
    'abc',
    '2..5',
    '1e',
    '10^3',
    '0,5',
    '1,2',
    '1,,2',
    '12,34',
    '1,2000',
    ',5',
    '1.2,345',
    '0,500',
    '.',
    '-',
    '.e3',
    '1e999',
  ])('rejects %s', (text) => {
    expect(parseNumber(text)).toBeNull();
  });

  // A raised exponent counts only straight after "× 10", and only to the end.
  it.each([
    '5 × 10²^3',
    '5 × 10^²',
    '5 × 10²1',
    '5 × 10²¹ J',
    '5²',
    '5e²¹',
    '10²',
    '× 10²',
    '5 × 10⁻',
    '5 × 10²⁻',
    '5 × 10⁻⁺²',
    '5 × 10',
    '5 × 100²',
    '5 × ²',
    '0,5 × 10²',
    '1 × 10⁹⁹⁹',
  ])('rejects %s', (text) => {
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

  it('accepts the edge of the tolerance and rejects just beyond it', () => {
    expect(gradeNumeric('0.0196', 0.02)).toBe('correct');
    expect(gradeNumeric('0.0195', 0.02)).toBe('incorrect');
    expect(gradeNumeric('0.0205', 0.02)).toBe('incorrect');
  });

  it('applies the tolerance to a negative answer', () => {
    expect(gradeNumeric('-0.0204', -0.02)).toBe('correct');
    expect(gradeNumeric('0.02', -0.02)).toBe('incorrect');
  });

  it('applies the tolerance to a very large answer', () => {
    expect(gradeNumeric('6.02e23', 6.022e23)).toBe('correct');
  });

  it('reports text that is not a number', () => {
    expect(gradeNumeric('about two', 0.02)).toBe('invalid');
    expect(gradeNumeric('', 0.02)).toBe('invalid');
  });

  it('compares against zero with an absolute tolerance', () => {
    expect(gradeNumeric('0', 0)).toBe('correct');
    expect(gradeNumeric('0.5', 0)).toBe('incorrect');
  });

  it('accepts an answer typed as a power of ten with a raised exponent', () => {
    expect(gradeNumeric('5.12 × 10²¹', 5.12e21)).toBe('correct');
    expect(gradeNumeric('5.9 × 10⁻²⁰', 5.86e-20)).toBe('correct');
    expect(gradeNumeric('5.86 × 10⁻¹⁹', 5.86e-20)).toBe('incorrect');
    expect(gradeNumeric('5.86 × 10²⁰', 5.86e-20)).toBe('incorrect');
  });

  // What the answer line prints, a student can type or paste back. The first
  // two are the e-notation answers the lessons use (3.7 and 3.12).
  it.each([
    { numeric: '5.12e21', unit: undefined },
    { numeric: '5.86e-20', unit: 'J' },
    { numeric: '2.998E+08', unit: 'm/s' },
    { numeric: '-1.60e-19', unit: 'C' },
    { numeric: '1e-05', unit: 'M' },
    { numeric: '3e0', unit: 'mol' },
    { numeric: '0.020', unit: 'M/s' },
  ])('grades the answer line of $numeric as correct when it is typed back', ({ numeric, unit }) => {
    const shown = shownAnswer({ numeric, unit });
    const typedBack = unit === undefined ? shown : shown.slice(0, -` ${unit}`.length);

    expect(shown.endsWith(unit === undefined ? typedBack : ` ${unit}`)).toBe(true);
    expect(gradeNumeric(typedBack, Number(numeric))).toBe('correct');
  });
});

describe('shownAnswer', () => {
  it('names the correct option of a choice question', () => {
    expect(shownAnswer({ answer: 3 })).toBe('option 3');
  });

  it('keeps the trailing zeros of a numeric answer written as text', () => {
    expect(shownAnswer({ numeric: '0.020' })).toBe('0.020');
  });

  it('puts the unit after a numeric answer', () => {
    expect(shownAnswer({ numeric: '0.020', unit: 'M/s' })).toBe('0.020 M/s');
  });

  it('throws when the numeric answer arrives as a number, which would lose its trailing zeros', () => {
    // MDX is not type-checked, so a lesson can pass numeric={0.020}.
    const fromMdx: unknown = { numeric: 0.02 };

    expect(() => shownAnswer(fromMdx as CheckAnswer)).toThrow('as text');
  });

  it('shows a tiny answer written in e-notation as a power of ten', () => {
    expect(shownAnswer({ numeric: '5.86e-20', unit: 'J' })).toBe('5.86 × 10⁻²⁰ J');
  });

  it('shows a large answer written in e-notation without a plus sign', () => {
    expect(shownAnswer({ numeric: '5.12e21' })).toBe('5.12 × 10²¹');
  });

  it('accepts a capital E, an explicit plus and a padded exponent', () => {
    expect(shownAnswer({ numeric: '2.998E+08', unit: 'm/s' })).toBe('2.998 × 10⁸ m/s');
  });

  it('leaves the digits before the e exactly as written', () => {
    expect(shownAnswer({ numeric: '-1.60e-19', unit: 'C' })).toBe('-1.60 × 10⁻¹⁹ C');
  });

  it('drops the padding of an exponent written with leading zeros', () => {
    expect(shownAnswer({ numeric: '1e-05' })).toBe('1 × 10⁻⁵');
  });

  // Ten to the power zero is 1, so "× 10⁰" would say nothing.
  it.each([
    ['3e0', '3'],
    ['1.5e+00', '1.5'],
    ['1e-0', '1'],
    ['2.50E0', '2.50'],
  ])('shows %s, whose exponent is zero, as just %s', (numeric, expected) => {
    expect(shownAnswer({ numeric })).toBe(expected);
    expect(shownAnswer({ numeric, unit: 'mol' })).toBe(`${expected} mol`);
  });

  it('leaves no stray space where the digits before the e were followed by one', () => {
    expect(shownAnswer({ numeric: '5.86 e-20', unit: 'J' })).toBe('5.86 × 10⁻²⁰ J');
  });

  it('shows a number written with spaces around it without them', () => {
    expect(shownAnswer({ numeric: ' 5.86e-20 ', unit: 'J' })).toBe('5.86 × 10⁻²⁰ J');
    expect(shownAnswer({ numeric: ' 0.020 ', unit: 'M/s' })).toBe('0.020 M/s');
  });

  it('passes a plain number through unchanged', () => {
    expect(shownAnswer({ numeric: '0.020' })).toBe('0.020');
    expect(shownAnswer({ numeric: '1200' })).toBe('1200');
  });

  it('throws when a choice question is given a unit', () => {
    expect(() => shownAnswer({ answer: 3, unit: 'M' })).toThrow('cannot have a `unit`');
  });

  it('throws when a check has neither an option nor a value', () => {
    expect(() => shownAnswer({})).toThrow('exactly one');
  });

  it('throws when a check has both an option and a value', () => {
    expect(() => shownAnswer({ answer: 1, numeric: '2' })).toThrow('exactly one');
  });

  it.each(['', 'about two', '0.020 M/s', '1/2'])('throws when the numeric answer is not a number: %j', (text) => {
    expect(() => shownAnswer({ numeric: text })).toThrow('must be a number');
  });

  it('throws when the numeric answer is too large to be a finite number', () => {
    expect(() => shownAnswer({ numeric: '1e999' })).toThrow('must be a number');
  });
});
