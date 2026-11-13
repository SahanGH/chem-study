/** Kinetics formulas for the interactive diagrams. No DOM here, so it is testable directly. */

export type Order = 0 | 1 | 2;

/** rate = k[A]^m[B]^n */
export function rateLawRate(k: number, a: number, orderA: Order, b: number, orderB: Order): number {
  return k * a ** orderA * b ** orderB;
}

/**
 * [A] at a given time, from the integrated rate law of a reaction that is
 * zero, first or second order in A. A zero-order reaction stops when A runs
 * out, so its concentration never goes below zero.
 */
export function concentrationAt(order: Order, initial: number, k: number, time: number): number {
  if (order === 0) return Math.max(0, initial - k * time);
  if (order === 1) return initial * Math.exp(-k * time);
  return 1 / (1 / initial + k * time);
}

export type PlotKind = 'concentration' | 'ln' | 'reciprocal';

/** What each of the three plots puts on its vertical axis: [A], ln[A] or 1/[A]. */
export function plotValue(kind: PlotKind, concentration: number): number {
  if (kind === 'concentration') return concentration;
  if (concentration <= 0) {
    throw new RangeError(`ln[A] and 1/[A] need a concentration greater than zero, not ${concentration}.`);
  }
  return kind === 'ln' ? Math.log(concentration) : 1 / concentration;
}

/** The plot that is a straight line for each order. */
export const LINEAR_PLOT: Record<Order, PlotKind> = { 0: 'concentration', 1: 'ln', 2: 'reciprocal' };
