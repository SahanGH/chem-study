import { describe, expect, it } from 'vitest';
import { formatQuantity } from '../../src/lib/format';

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
