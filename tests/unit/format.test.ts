import { describe, expect, it } from 'vitest';
import { formatQuantity, fromSuperscript, toSuperscript } from '../../src/lib/format';

describe('toSuperscript', () => {
  it('raises every digit', () => {
    expect(toSuperscript('0123456789')).toBe('⁰¹²³⁴⁵⁶⁷⁸⁹');
    expect(toSuperscript('4')).toBe('⁴');
  });

  it('raises a minus sign, typed as a hyphen or as a true minus', () => {
    expect(toSuperscript('-20')).toBe('⁻²⁰');
    expect(toSuperscript('−5')).toBe('⁻⁵');
  });

  it('raises a plus sign', () => {
    expect(toSuperscript('+8')).toBe('⁺⁸');
  });

  it('gives nothing for no text', () => {
    expect(toSuperscript('')).toBe('');
  });

  it('throws for a character that has no superscript here, naming it', () => {
    expect(() => toSuperscript('1.5')).toThrow('No superscript for "." in "1.5"');
    expect(() => toSuperscript('x')).toThrow('No superscript for "x" in "x"');
    expect(() => toSuperscript('²')).toThrow('No superscript for "²"');
  });
});

describe('fromSuperscript', () => {
  it('lowers every raised digit', () => {
    expect(fromSuperscript('⁰¹²³⁴⁵⁶⁷⁸⁹')).toBe('0123456789');
    expect(fromSuperscript('²¹')).toBe('21');
  });

  // A hyphen, not a true minus: the result is for reading as a number.
  it('lowers a raised minus to a hyphen and a raised plus to a plus', () => {
    expect(fromSuperscript('⁻²⁰')).toBe('-20');
    expect(fromSuperscript('⁺⁸')).toBe('+8');
  });

  it('gives nothing for no text', () => {
    expect(fromSuperscript('')).toBe('');
  });

  it('undoes toSuperscript', () => {
    for (const text of ['0', '21', '-20', '+8', '1234567890']) {
      expect(fromSuperscript(toSuperscript(text))).toBe(text);
    }
  });

  it('throws for a character that is not a superscript, naming it', () => {
    expect(() => fromSuperscript('2')).toThrow('"2" in "2" is not a superscript');
    expect(() => fromSuperscript('²a')).toThrow('"a" in "²a" is not a superscript');
    expect(() => fromSuperscript('-²')).toThrow('"-" in "-²" is not a superscript');
  });
});

describe('formatQuantity', () => {
  it('writes an everyday number with two significant figures', () => {
    expect(formatQuantity(0.1)).toBe('0.10');
    expect(formatQuantity(0.032)).toBe('0.032');
    expect(formatQuantity(1.5)).toBe('1.5');
  });

  it('writes a small number as a power of ten', () => {
    expect(formatQuantity(0.0032)).toBe('3.2 × 10⁻³');
    expect(formatQuantity(0.00001)).toBe('1.0 × 10⁻⁵');
  });

  it('writes a large number as a power of ten', () => {
    expect(formatQuantity(120)).toBe('1.2 × 10²');
    expect(formatQuantity(6.02e23)).toBe('6.0 × 10²³');
  });

  it('absorbs floating-point noise', () => {
    expect(formatQuantity(0.1 * 0.25 * 0.2)).toBe('5.0 × 10⁻³');
  });

  it('writes zero as 0', () => {
    expect(formatQuantity(0)).toBe('0');
  });

  it('chooses the notation after rounding, so a number that rounds up to 0.010 is written plainly', () => {
    expect(formatQuantity(0.0099)).toBe('9.9 × 10⁻³');
    expect(formatQuantity(0.00999)).toBe('0.010');
    expect(formatQuantity(0.01)).toBe('0.010');
  });

  it('writes a number that rounds up to 10 as a power of ten', () => {
    expect(formatQuantity(9.94)).toBe('9.9');
    expect(formatQuantity(9.96)).toBe('1.0 × 10¹');
    expect(formatQuantity(10)).toBe('1.0 × 10¹');
  });

  it('keeps the sign of a negative number', () => {
    expect(formatQuantity(-0.02)).toBe('−0.020');
    expect(formatQuantity(-0.0032)).toBe('−3.2 × 10⁻³');
  });

  it('throws for a value that is not a finite number', () => {
    expect(() => formatQuantity(Number.NaN)).toThrow('finite');
    expect(() => formatQuantity(Number.POSITIVE_INFINITY)).toThrow('finite');
  });
});

describe('formatQuantity with a number of significant figures', () => {
  it('writes two figures when it is told two, the same as when it is told nothing', () => {
    for (const value of [0.1, 0.032, 1.5, 0.0032, 120, 6.02e23, 0.00999, 9.96, -0.02, 0]) {
      expect(formatQuantity(value, 2)).toBe(formatQuantity(value));
    }
  });

  it('writes three figures', () => {
    expect(formatQuantity(20000, 3)).toBe('2.00 × 10⁴');
    expect(formatQuantity(4330, 3)).toBe('4.33 × 10³');
    expect(formatQuantity(11, 3)).toBe('1.10 × 10¹');
    expect(formatQuantity(6.71, 3)).toBe('6.71');
    expect(formatQuantity(1.4, 3)).toBe('1.40');
    expect(formatQuantity(0.801, 3)).toBe('0.801');
    expect(formatQuantity(0.0123, 3)).toBe('0.0123');
    expect(formatQuantity(0.00456, 3)).toBe('4.56 × 10⁻³');
  });

  it('rounds a fourth figure away', () => {
    expect(formatQuantity(13.42, 3)).toBe('1.34 × 10¹');
    expect(formatQuantity(1.602, 3)).toBe('1.60');
  });

  it('chooses the notation after rounding to three figures, at 10', () => {
    expect(formatQuantity(9.994, 3)).toBe('9.99');
    expect(formatQuantity(9.996, 3)).toBe('1.00 × 10¹');
    expect(formatQuantity(10, 3)).toBe('1.00 × 10¹');
  });

  it('chooses the notation after rounding to three figures, at 0.01', () => {
    expect(formatQuantity(0.009994, 3)).toBe('9.99 × 10⁻³');
    expect(formatQuantity(0.009996, 3)).toBe('0.0100');
    expect(formatQuantity(0.01, 3)).toBe('0.0100');
  });

  it('keeps the sign of a negative number and writes zero as 0', () => {
    expect(formatQuantity(-0.0201, 3)).toBe('−0.0201');
    expect(formatQuantity(-4330, 3)).toBe('−4.33 × 10³');
    expect(formatQuantity(0, 3)).toBe('0');
  });

  it('writes one figure, and four', () => {
    expect(formatQuantity(0.032, 1)).toBe('0.03');
    expect(formatQuantity(120, 1)).toBe('1 × 10²');
    expect(formatQuantity(2.998e8, 4)).toBe('2.998 × 10⁸');
    expect(formatQuantity(8.314, 4)).toBe('8.314');
  });

  it('throws for a number of figures that is not a whole number from 1 up, naming it', () => {
    for (const figures of [0, -2, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => formatQuantity(0.032, figures), String(figures)).toThrow(RangeError);
    }
    expect(() => formatQuantity(0.032, 0)).toThrow('a whole number from 1 to 100, not 0');
    expect(() => formatQuantity(0.032, 101)).toThrow('a whole number from 1 to 100, not 101');
  });
});
