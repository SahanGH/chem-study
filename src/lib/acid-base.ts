/**
 * The pH of one aqueous solution, for all three Unit 8 explorers (the weak
 * acid, the titration curve and the buffer). No DOM here, so it is testable
 * directly, and no explorer changes it.
 *
 * A solution holds any of:
 * - a monoprotic weak acid in both its forms, HA and A⁻, with total
 *   concentration C and constant Ka;
 * - spectator cations, with total charge concentration c₊ (the cation of a
 *   strong base, and the cation that came with a salt of the conjugate base);
 * - spectator anions, with total charge concentration c₋ (the anion of a
 *   strong acid, and the anion that came with a salt of a conjugate acid).
 *
 * All in mol/L. The charges balance:
 *
 *   [H₃O⁺] + c₊ = [OH⁻] + c₋ + [A⁻],  [OH⁻] = Kw/h,  [A⁻] = C Ka/(Ka + h),
 *
 * so [H₃O⁺] is the one positive root of
 *
 *   f(h) = h + c₊ − c₋ − Kw/h − C Ka/(Ka + h),
 *
 * which rises steadily with h. It is found by bisection on the pH, from pH −2
 * to pH 16, in exactly 60 halvings, so that the result is the same on every
 * machine. There is no shortcut and no case split: a strong acid, a strong
 * base or pure water is the same function with C = 0.
 *
 * A weak base B and its conjugate acid HB⁺ use the same function: C is the
 * total of both forms, Ka is that of HB⁺ (Kw/Kb), and the whole of C is added
 * to c₊; the anion that came with a salt of HB⁺ goes into c₋. What is
 * returned as the base form is then [B], and as the acid form [HB⁺].
 *
 * Rounding for display is not done here: each explorer's module rounds.
 */

/** Kw at 25 °C. */
export const KW_25C = 1.0e-14;

/** The bisection: the pH interval it starts from and the fixed number of halvings. */
export const BISECTION = { lowPH: -2, highPH: 16, halvings: 60 } as const;

/** The precision the root is held to, in pH units. The last interval is 18 / 2⁶⁰ wide, far below it. */
export const PRECISION_PH = 1e-9;

/** Concentrations of this much or more are refused: the interval would no longer be sure to hold the root with room to spare. */
const MAX_CONCENTRATION = 10;

export interface Solution {
  /** The weak acid's total concentration, acid form plus base form, in mol/L. 0 when there is none. */
  readonly weakAcid?: number;
  /** The weak acid's Ka. Needed when there is a weak acid, ignored when there is none. */
  readonly ka?: number;
  /** The spectator cations' total charge concentration, in mol/L. */
  readonly cations?: number;
  /** The spectator anions' total charge concentration, in mol/L. */
  readonly anions?: number;
  /** Kw; 1.0 × 10⁻¹⁴ (25 °C) unless given. */
  readonly kw?: number;
}

export interface Equilibrium {
  /** [H₃O⁺], in mol/L: the root of the charge balance. */
  readonly hydronium: number;
  /** −log [H₃O⁺], unrounded. */
  readonly pH: number;
  /** [OH⁻] = Kw/h. */
  readonly hydroxide: number;
  /** [HA] = C h/(Ka + h); for a weak base, [HB⁺]. */
  readonly acidForm: number;
  /** [A⁻] = C Ka/(Ka + h); for a weak base, [B]. */
  readonly baseForm: number;
}

function assertConcentration(what: string, value: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  if (!(value >= 0 && value < MAX_CONCENTRATION)) {
    throw new RangeError(`The concentration of the ${what} must be 0 or more and under ${MAX_CONCENTRATION} M, not ${value} M.`);
  }
}

function assertPositive(what: string, value: number | undefined): asserts value is number {
  if (value === undefined || !(value > 0 && Number.isFinite(value))) {
    throw new RangeError(`${what} must be a positive number, not ${value}.`);
  }
}

interface Checked {
  readonly c: number;
  readonly ka: number;
  readonly cations: number;
  readonly anions: number;
  readonly kw: number;
}

function checked(solution: Solution): Checked {
  const c = solution.weakAcid ?? 0;
  const cations = solution.cations ?? 0;
  const anions = solution.anions ?? 0;
  const kw = solution.kw ?? KW_25C;
  assertConcentration('weak acid', c);
  assertConcentration('spectator cations', cations);
  assertConcentration('spectator anions', anions);
  assertPositive('Kw', kw);
  if (c === 0) return { c, ka: 1, cations, anions, kw };
  assertPositive('Ka', solution.ka);
  return { c, ka: solution.ka, cations, anions, kw };
}

/** [H₃O⁺] of the solution, in mol/L: the root of the charge balance, by 60 halvings of the pH interval. */
export function hydronium(solution: Solution): number {
  const { c, ka, cations, anions, kw } = checked(solution);
  const f = (h: number) => h + cations - anions - kw / h - (c * ka) / (ka + h);
  let low: number = BISECTION.lowPH;
  let high: number = BISECTION.highPH;
  let mid = (low + high) / 2;
  for (let step = 0; step < BISECTION.halvings; step++) {
    mid = (low + high) / 2;
    // f > 0: h is too large, so the root lies at a higher pH.
    if (f(10 ** -mid) > 0) low = mid;
    else high = mid;
  }
  return 10 ** -mid;
}

/** The solution at equilibrium: [H₃O⁺] and the pH, and from them alone [OH⁻] and the two forms of the weak acid. */
export function solve(solution: Solution): Equilibrium {
  const h = hydronium(solution);
  const { c, ka, kw } = checked(solution);
  return {
    hydronium: h,
    pH: -Math.log10(h),
    hydroxide: kw / h,
    acidForm: c === 0 ? 0 : (c * h) / (ka + h),
    baseForm: c === 0 ? 0 : (c * ka) / (ka + h),
  };
}

/** The shortcut a student uses by hand for a weak acid alone: x = √(Ka C), nothing else. */
export function shortcutHydronium(ka: number, concentration: number): number {
  assertPositive('Ka', ka);
  assertConcentration('weak acid', concentration);
  return Math.sqrt(ka * concentration);
}
