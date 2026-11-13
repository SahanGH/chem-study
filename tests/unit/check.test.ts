import { describe, expect, it } from 'vitest';
import { gradeChoice, gradeNumeric, parseNumber } from '../../src/lib/check';

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
});
