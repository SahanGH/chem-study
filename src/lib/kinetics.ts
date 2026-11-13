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
  // Without these the formulas return NaN, Infinity or a negative
  // concentration, and a diagram would draw it.
  if (!(Number.isFinite(initial) && initial > 0)) {
    throw new RangeError(`The starting concentration must be a positive number, not ${initial}.`);
  }
  if (!(Number.isFinite(k) && k >= 0)) throw new RangeError(`The rate constant must be zero or more, not ${k}.`);
  if (!(Number.isFinite(time) && time >= 0)) throw new RangeError(`The time must be zero or more, not ${time}.`);
  switch (order) {
    case 0:
      return Math.max(0, initial - k * time);
    case 1:
      return initial * Math.exp(-k * time);
    case 2:
      return 1 / (1 / initial + k * time);
    default: {
      const unhandled: never = order;
      throw new Error(`No integrated rate law for order ${String(unhandled)}.`);
    }
  }
}

export type PlotKind = 'concentration' | 'ln' | 'reciprocal';

/** What each of the three plots puts on its vertical axis: [A], ln[A] or 1/[A]. */
export function plotValue(kind: PlotKind, concentration: number): number {
  if (!Number.isFinite(concentration)) {
    throw new RangeError(`A concentration must be a finite number, not ${concentration}.`);
  }
  if (kind === 'concentration') return concentration;
  if (concentration <= 0) {
    throw new RangeError(`ln[A] and 1/[A] need a concentration greater than zero, not ${concentration}.`);
  }
  return kind === 'ln' ? Math.log(concentration) : 1 / concentration;
}

/** The plot that is a straight line for each order. */
export const LINEAR_PLOT: Record<Order, PlotKind> = { 0: 'concentration', 1: 'ln', 2: 'reciprocal' };
