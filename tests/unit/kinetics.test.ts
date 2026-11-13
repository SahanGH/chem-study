import { describe, expect, it } from 'vitest';
import { LINEAR_PLOT, concentrationAt, plotValue, rateLawRate } from '../../src/lib/kinetics';

describe('rateLawRate', () => {
  it('multiplies k by each concentration raised to its order', () => {
    expect(rateLawRate(0.1, 0.4, 2, 0.2, 1)).toBeCloseTo(0.0032, 10);
  });

  it('ignores a reactant that is zero order', () => {
    expect(rateLawRate(0.1, 0.4, 0, 0.2, 0)).toBe(0.1);
  });

  it('quadruples when a second-order concentration doubles', () => {
    const before = rateLawRate(0.1, 0.2, 2, 0.5, 1);

    const after = rateLawRate(0.1, 0.4, 2, 0.5, 1);

    expect(after / before).toBeCloseTo(4, 10);
  });
});

describe('concentrationAt', () => {
  it('starts at the initial concentration for every order', () => {
    expect(concentrationAt(0, 1, 0.008, 0)).toBe(1);
    expect(concentrationAt(1, 1, 0.02, 0)).toBe(1);
    expect(concentrationAt(2, 1, 0.04, 0)).toBe(1);
  });

  it('falls in a straight line for zero order', () => {
    expect(concentrationAt(0, 1, 0.008, 50)).toBeCloseTo(0.6, 10);
    expect(concentrationAt(0, 1, 0.008, 100)).toBeCloseTo(0.2, 10);
  });

  it('never goes below zero for zero order', () => {
    expect(concentrationAt(0, 1, 0.008, 1000)).toBe(0);
  });

  it('halves every half-life for first order', () => {
    const halfLife = Math.LN2 / 0.02;

    expect(concentrationAt(1, 1, 0.02, halfLife)).toBeCloseTo(0.5, 10);
    expect(concentrationAt(1, 1, 0.02, 2 * halfLife)).toBeCloseTo(0.25, 10);
  });

  it('follows 1/[A] = 1/[A]0 + kt for second order', () => {
    expect(concentrationAt(2, 0.5, 0.04, 50)).toBeCloseTo(0.25, 10);
  });
});

describe('plotValue', () => {
  it('gives the concentration, its natural log, or its reciprocal', () => {
    expect(plotValue('concentration', 0.5)).toBe(0.5);
    expect(plotValue('ln', 0.5)).toBeCloseTo(-0.6931, 4);
    expect(plotValue('reciprocal', 0.5)).toBe(2);
  });

  it.each(['ln', 'reciprocal'] as const)('throws for %s of a concentration of zero', (kind) => {
    expect(() => plotValue(kind, 0)).toThrow('greater than zero');
  });

  it('allows a concentration of zero on the plain plot', () => {
    expect(plotValue('concentration', 0)).toBe(0);
  });
});

describe('LINEAR_PLOT', () => {
  it.each([
    [0, 'concentration'],
    [1, 'ln'],
    [2, 'reciprocal'],
  ] as const)('order %i is a straight line on the %s plot', (order, kind) => {
    const k = { 0: 0.008, 1: 0.02, 2: 0.04 }[order];
    const at = (time: number) => plotValue(kind, concentrationAt(order, 1, k, time));

    const firstStep = at(10) - at(0);
    const laterStep = at(90) - at(80);

    expect(LINEAR_PLOT[order]).toBe(kind);
    expect(laterStep).toBeCloseTo(firstStep, 10);
  });
});
