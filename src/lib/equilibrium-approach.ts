/**
 * A made-up reversible reaction, A ⇌ B, in a closed container, for the
 * approach-to-equilibrium diagram in lesson 7.1. No DOM here, so it is
 * testable directly.
 *
 * Each direction is first order, as in topic 5.2: the forward rate is
 * k_f[A] and the reverse rate is k_r[B]. The total concentration is always
 * 1.00 M. Concentrations are in mol/L (M), rates in M/s and rate constants in
 * s⁻¹.
 *
 * Two kinds of number come out of here. The curves are drawn from the exact
 * solution, in floating point. Everything the readout shows comes from
 * `shownState`, in whole numbers (hundredths of M, thousandths of M/s), so
 * that the numbers a student reads agree with each other exactly: [A] + [B] is
 * 1.00 M, and each rate is its constant times the concentration beside it.
 */

export type Direction = 'forward' | 'reverse' | 'equal';

// Each pair sums to 1 s⁻¹, so k_f + k_r, the rate at which the mixture
// settles, is the same for every choice, and every choice settles on the same
// time scale. Only where it settles differs. Lesson 7.1 comes before K is
// defined (topic 7.3), so the student chooses rate constants, not K.
// The ids are read from the table, so a type and a table cannot drift apart.
const PAIR_NUMBERS = [
  { id: 'forward-favored', forward: 0.8, reverse: 0.2 },
  { id: 'even', forward: 0.5, reverse: 0.5 },
  { id: 'reverse-favored', forward: 0.2, reverse: 0.8 },
] as const satisfies readonly { id: string; forward: number; reverse: number }[];

export type RateConstantsId = (typeof PAIR_NUMBERS)[number]['id'];

export interface RateConstantPair {
  readonly id: RateConstantsId;
  /** k_f, in s⁻¹. */
  readonly forward: number;
  /** k_r, in s⁻¹. */
  readonly reverse: number;
  /** How the radio button and the descriptions name the pair, built from the two numbers. */
  readonly label: string;
}

export const RATE_CONSTANTS: readonly RateConstantPair[] = PAIR_NUMBERS.map((pair) => ({
  ...pair,
  label: `forward ${pair.forward}, reverse ${pair.reverse}`,
}));

export const STARTS = [
  /** [A] at 0 s is `initialA`, in M. [B] is the rest of the 1.00 M. */
  { id: 'only-a', label: 'Only A', initialA: 1 },
  { id: 'half', label: 'Half A, half B', initialA: 0.5 },
  { id: 'only-b', label: 'Only B', initialA: 0 },
] as const satisfies readonly { id: string; label: string; initialA: number }[];

export type Start = (typeof STARTS)[number];
export type StartId = Start['id'];

export const STARTING_CHOICES = { rateConstants: 'forward-favored', start: 'only-a' } as const satisfies {
  rateConstants: RateConstantsId;
  start: StartId;
};

/** The times the diagram offers, in s. */
export const TIME = { min: 0, max: 8, step: 0.25, start: 1 } as const;

/**
 * Both graphs' vertical axes run to these. The largest concentration is the
 * whole 1.00 M. The largest rate is 0.8 M/s: forward 0.8 with only A, or
 * reverse 0.8 with only B, at 0 s.
 */
export const AXES = { concentration: { max: 1 }, rate: { max: 0.8 } } as const;

/** The total concentration of A and B, in M, in every state. */
const TOTAL = 1;
/** One hundredth of an M: the unit [A] and [B] are shown in. */
const HUNDREDTHS_PER_M = 100;
/** The rate constants are given to a tenth of a reciprocal second. */
const TENTHS_PER_RECIPROCAL_SECOND = 10;
/** The curves have this many steps across the time axis, so 161 points. */
const CURVE_STEPS = 160;

export interface ShownState {
  /** [A], in hundredths of M. */
  readonly a: number;
  /** [B], in hundredths of M: always 100 − a. */
  readonly b: number;
  /** The forward rate, in thousandths of M/s. */
  readonly forward: number;
  /** The reverse rate, in thousandths of M/s. */
  readonly reverse: number;
  readonly direction: Direction;
}

export interface CurvePoint {
  /** In s. */
  readonly time: number;
  /** [A], in M. */
  readonly a: number;
  /** [B], in M. */
  readonly b: number;
  /** In M/s. */
  readonly forward: number;
  /** In M/s. */
  readonly reverse: number;
}

function rateConstantsFor(id: string): RateConstantPair {
  const found = RATE_CONSTANTS.find((pair) => pair.id === id);
  if (found === undefined) {
    const offered = RATE_CONSTANTS.map((pair) => pair.id);
    throw new RangeError(`The rate constants must be ${listOf(offered)}, not "${id}".`);
  }
  return found;
}

function startFor(id: string): Start {
  const found = STARTS.find((start) => start.id === id);
  if (found === undefined) {
    throw new RangeError(`The start must be ${listOf(STARTS.map((start) => start.id))}, not "${id}".`);
  }
  return found;
}

/** "a, b or c". */
function listOf(items: readonly string[]): string {
  return `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;
}

function assertTime(time: number): void {
  // Every step is a multiple of 0.25, which is exact in binary, so a time on
  // a step divides to a whole number. Written so that NaN fails too.
  const onStep = Number.isInteger((time - TIME.min) / TIME.step);
  if (!(time >= TIME.min && time <= TIME.max && onStep)) {
    throw new RangeError(
      `The time must be from ${TIME.min} s to ${TIME.max} s in steps of ${TIME.step} s, not ${time} s.`,
    );
  }
}

// Far above floating-point noise (0.7 × 10 is 7.000000000000001) and far below
// the gap between two rate constants a tenth apart.
const TENTH_TOLERANCE = 1e-9;

/**
 * The rate constant in tenths of s⁻¹: a whole number, so the rates are exact.
 * The readout uses this and the curves use the constant itself, so a constant
 * that is not a whole number of tenths would make them disagree without a
 * sign. It is refused here instead. Exported so a test can reach the check.
 */
export function inTenths(rateConstant: number): number {
  const tenths = rateConstant * TENTHS_PER_RECIPROCAL_SECOND;
  const whole = Math.round(tenths);
  // Written so that NaN and infinity fail too: their difference is not below anything.
  if (!(Math.abs(tenths - whole) <= TENTH_TOLERANCE)) {
    throw new RangeError(`A rate constant must be a multiple of 0.1 s⁻¹, not ${rateConstant} s⁻¹.`);
  }
  return whole;
}

function exactConcentrationA(pair: RateConstantPair, start: Start, time: number): number {
  const total = pair.forward + pair.reverse;
  const settled = (pair.reverse / total) * TOTAL;
  return settled + (start.initialA - settled) * Math.exp(-total * time);
}

/**
 * [A] in M at a time, from the exact solution
 * [A] = [A]eq + ([A]₀ − [A]eq) e^(−(k_f + k_r)t), where
 * [A]eq = k_r/(k_f + k_r) × 1.00 M. Used to draw the curves.
 */
export function concentrationA(pairId: RateConstantsId, startId: StartId, time: number): number {
  const pair = rateConstantsFor(pairId);
  const start = startFor(startId);
  assertTime(time);
  return exactConcentrationA(pair, start, time);
}

/**
 * [A] rounded half up to a hundredth of an M, as a whole number. Twelve
 * figures keep every real digit and drop the hair by which binary floating
 * point stores a tie, such as 0.5 × 100, below or above it.
 */
function hundredthsOf(concentration: number): number {
  return Math.floor(Number((concentration * HUNDREDTHS_PER_M).toPrecision(12)) + 0.5);
}

/** Everything the readout shows at a time, in whole numbers. */
export function shownState(pairId: RateConstantsId, startId: StartId, time: number): ShownState {
  const pair = rateConstantsFor(pairId);
  const start = startFor(startId);
  assertTime(time);
  const a = hundredthsOf(exactConcentrationA(pair, start, time));
  const b = HUNDREDTHS_PER_M - a;
  const forward = inTenths(pair.forward) * a;
  const reverse = inTenths(pair.reverse) * b;
  let direction: Direction = 'equal';
  if (forward > reverse) direction = 'forward';
  if (forward < reverse) direction = 'reverse';
  return { a, b, forward, reverse, direction };
}

/**
 * The concentrations and the rates across the time axis, for drawing: 161
 * points, one every 0.05 s. The slider's steps of 0.25 s are every fifth
 * point, so the dot at the chosen time is always on a drawn point.
 */
export function curvePoints(pairId: RateConstantsId, startId: StartId): CurvePoint[] {
  const pair = rateConstantsFor(pairId);
  const start = startFor(startId);
  return Array.from({ length: CURVE_STEPS + 1 }, (_, step) => {
    // One division, so each time is the nearest number to its decimal.
    const time = (step * (TIME.max - TIME.min)) / CURVE_STEPS + TIME.min;
    const a = exactConcentrationA(pair, start, time);
    const b = TOTAL - a;
    return { time, a, b, forward: pair.forward * a, reverse: pair.reverse * b };
  });
}

/** A whole number of hundredths or thousandths as a decimal with a leading zero: 49 → "0.49". */
function decimal(wholeNumber: number, places: number): string {
  const unit = 10 ** places;
  return `${Math.floor(wholeNumber / unit)}.${String(wholeNumber % unit).padStart(places, '0')}`;
}

const concentrationText = (hundredths: number) => decimal(hundredths, 2);
const rateText = (thousandths: number) => decimal(thousandths, 3);

const WHAT_IT_MEANS: Record<Direction, string> = {
  forward: 'A is turning into B faster than B turns back.',
  reverse: 'B is turning into A faster than A turns back.',
  equal: 'the rates are equal, so the concentrations have stopped changing. Both reactions are still running.',
};

/** What the diagram says about the chosen time. */
export function readout(pairId: RateConstantsId, startId: StartId, time: number): string {
  const shown = shownState(pairId, startId, time);
  return (
    `At ${time} s: [A] = ${concentrationText(shown.a)} M and [B] = ${concentrationText(shown.b)} M. ` +
    `Forward rate ${rateText(shown.forward)} M/s, reverse rate ${rateText(shown.reverse)} M/s: ${WHAT_IT_MEANS[shown.direction]}`
  );
}

/** The concentration graph in words, for its accessible name. */
export function describeConcentrations(pairId: RateConstantsId, startId: StartId, time: number): string {
  const first = shownState(pairId, startId, TIME.min);
  const last = shownState(pairId, startId, TIME.max);
  const pair = rateConstantsFor(pairId);
  assertTime(time);
  return (
    `Graph of concentration against time, from ${TIME.min} s to ${TIME.max} s, for rate constants ${pair.label} per second. ` +
    '[A] is a solid line and [B] a dashed line. ' +
    `At ${TIME.min} s, [A] is ${concentrationText(first.a)} M and [B] is ${concentrationText(first.b)} M; ` +
    `at ${TIME.max} s, [A] is ${concentrationText(last.a)} M and [B] is ${concentrationText(last.b)} M. ` +
    `A vertical line and a dot on each curve mark the chosen time, ${time} s.`
  );
}

/**
 * The rate graph in words, for its accessible name. At 8 s every state shows
 * equal rates (a test checks all 9), so one number is given for both, and an
 * exception is thrown if a change to the model ever breaks that.
 */
export function describeRates(pairId: RateConstantsId, startId: StartId, time: number): string {
  const first = shownState(pairId, startId, TIME.min);
  const last = shownState(pairId, startId, TIME.max);
  const pair = rateConstantsFor(pairId);
  assertTime(time);
  if (last.direction !== 'equal') {
    throw new Error(
      `Expected equal rates at ${TIME.max} s, to give them as one number, but the forward rate is ${rateText(last.forward)} M/s and the reverse rate ${rateText(last.reverse)} M/s.`,
    );
  }
  return (
    `Graph of rate against time, from ${TIME.min} s to ${TIME.max} s, for rate constants ${pair.label} per second. ` +
    'The forward rate is a solid line and the reverse rate a dashed line. ' +
    `At ${TIME.min} s, the forward rate is ${rateText(first.forward)} M/s and the reverse rate is ${rateText(first.reverse)} M/s; ` +
    `at ${TIME.max} s, both are ${rateText(last.forward)} M/s. ` +
    `A vertical line and a dot on each curve mark the chosen time, ${time} s.`
  );
}
