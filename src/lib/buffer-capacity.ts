/**
 * The buffer explorer of lesson 8.10: one liter of a buffer of propanoic acid
 * (pKa 4.87) and propanoate ion beside one liter of pure water, with the same
 * strong acid or strong base added to both. No DOM here, so it is testable
 * directly.
 *
 * The amounts are whole millimoles: the sliders move in steps of 10 mmol and
 * 5 mmol, and the added acid or base reacts to completion first, in a table of
 * moles, so every amount after the reaction is exact. They are divided by
 * 1,000 only to form the concentrations, in mol/L for the fixed 1.00 L, that
 * the shared solver (`acid-base.ts`) takes. The solver finds [H₃O⁺] from the
 * one charge balance with Kw included, so no state uses a shortcut and there
 * is no seam where a member of the buffer runs out.
 *
 * Each shown number is rounded half up from its own unrounded value: a pH to
 * two decimal places, the ratio of base form to acid form to three
 * significant figures, by whole-number arithmetic on the two amounts.
 */

import { hydronium, KW_25C } from './acid-base';

/** Propanoic acid's pKa at 25 °C. Its Ka is computed from it, 10^−4.87 exactly; no rounded Ka is held. */
export const PKA = 4.87;
export const KA = 10 ** -PKA;
export const KW = KW_25C;

/** The buffer and the water are 1.00 L, before and after an addition. */
const MMOL_PER_MOL = 1000;

/** The two sliders of the buffer's members, in mmol. */
export const AMOUNT = { min: 10, max: 200, step: 10 } as const;
export const AMOUNTS: readonly number[] = Array.from({ length: (AMOUNT.max - AMOUNT.min) / AMOUNT.step + 1 }, (_, i) => AMOUNT.min + i * AMOUNT.step);

/** The slider of what is added, in mmol: negative for H₃O⁺, positive for OH⁻. */
export const ADDED = { min: -50, max: 50, step: 5 } as const;
export const ADDED_STEPS: readonly number[] = Array.from({ length: (ADDED.max - ADDED.min) / ADDED.step + 1 }, (_, i) => ADDED.min + i * ADDED.step);

export const START = { acid: 100, base: 100, added: 0 } as const;

/** The two pH scales. */
export const SCALE = { pHMax: 14, ticks: [0, 2, 4, 6, 8, 10, 12, 14] } as const;

/** The bars hold the most there can be: 200 mmol of one form and 50 mmol more from the other. */
export const BAR_MAX_MMOL = AMOUNT.max + ADDED.max;

/** The words drawn in the diagram, its key and its controls. */
export const LABELS = {
  scales: 'pH of the buffer and of the water',
  buffer: 'Buffer',
  water: 'Water',
  bars: 'In the buffer, in millimoles',
  acidBar: 'Acid form',
  baseBar: 'Base form',
  leftBar: 'Left over',
  keyBefore: 'before the addition',
  keyAfter: 'after it',
  keyOutline: 'amount before',
  acidSlider: 'Propanoic acid (acid form)',
  baseSlider: 'Propanoate ion (base form)',
  addedSlider: 'Added to both',
} as const;

export type Form = 'acid' | 'base';

const FORM_NAME: Readonly<Record<Form, string>> = { acid: 'propanoic acid', base: 'propanoate ion' };

export type Ion = 'OH⁻' | 'H₃O⁺';

/**
 * The seven kinds of state: nothing added; OH⁻ added with both members left,
 * with the acid form exactly used up, or with more OH⁻ than acid form; and the
 * same three for H₃O⁺ and the base form.
 */
export type Kind = 'nothing' | 'ohBoth' | 'ohUsedUp' | 'ohOverrun' | 'h3oBoth' | 'h3oUsedUp' | 'h3oOverrun';

function assertAmount(what: string, value: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = value >= AMOUNT.min && value <= AMOUNT.max;
  if (!(inRange && Number.isInteger(value / AMOUNT.step))) {
    throw new RangeError(`The ${what} must be from ${AMOUNT.min} to ${AMOUNT.max} mmol in steps of ${AMOUNT.step} mmol, not ${value} mmol.`);
  }
}

function assertAdded(value: number): void {
  const inRange = value >= ADDED.min && value <= ADDED.max;
  if (!(inRange && Number.isInteger(value / ADDED.step))) {
    throw new RangeError(
      `The amount added must be from ${ADDED.min} (H₃O⁺) to ${ADDED.max} (OH⁻) mmol in steps of ${ADDED.step} mmol, not ${value} mmol.`,
    );
  }
}

function assertSettings(acid: number, base: number, added: number): void {
  assertAmount('propanoic acid', acid);
  assertAmount('propanoate ion', base);
  assertAdded(added);
}

/** Whole hundredths as text: 487 is "4.87". */
function hundredthsText(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  return `${whole}.${String(hundredths - 100 * whole).padStart(2, '0')}`;
}

/** A pH to two decimal places, rounded half up from the unrounded value. */
export function shownPH(value: number): string {
  if (!(Number.isFinite(value) && value >= 0)) throw new RangeError(`A pH to show must be a finite number, 0 or more, not ${value}.`);
  return hundredthsText(Math.floor(value * 100 + 0.5));
}

/**
 * The ratio of base form to acid form, two positive whole numbers of mmol, to
 * three significant figures, rounded half up. The quotient is never formed in
 * floating point: base × 10^k over acid is brought to between 100 and 1,000
 * and rounded with whole-number division, so an exact tie such as 90 ÷ 80 =
 * 1.125 goes up to 1.13.
 */
export function shownRatio(base: number, acid: number): string {
  for (const [what, value] of [
    ['base form', base],
    ['acid form', acid],
  ] as const) {
    if (!(Number.isInteger(value) && value > 0)) throw new RangeError(`A ratio needs a whole number of mmol above 0 for the ${what}, not ${value}.`);
  }
  let k = 0;
  while (base * 10 ** k < 100 * acid) k += 1;
  while (k > 0 && base * 10 ** (k - 1) >= 100 * acid) k -= 1;
  const twice = 2 * base * 10 ** k + acid;
  let digits = (twice - (twice % (2 * acid))) / (2 * acid);
  if (digits >= 1000) {
    digits /= 10;
    k -= 1;
  }
  if (k < 0) throw new RangeError(`A ratio of ${base} to ${acid} is too large to show.`);
  if (k === 0) return String(digits);
  const padded = String(digits).padStart(k + 1, '0');
  return `${padded.slice(0, padded.length - k)}.${padded.slice(-k)}`;
}

/** The pH of the buffer, from the analytical concentrations: the pair's total, the Na⁺, and the strong acid's anion. */
function bufferPH(acid: number, base: number, hydroxideAdded: number, hydroniumAdded: number): number {
  return -Math.log10(
    hydronium({
      weakAcid: (acid + base) / MMOL_PER_MOL,
      ka: KA,
      cations: (base + hydroxideAdded) / MMOL_PER_MOL,
      anions: hydroniumAdded / MMOL_PER_MOL,
      kw: KW,
    }),
  );
}

/** The pH of the water: the same call with no weak acid. */
function waterPH(hydroxideAdded: number, hydroniumAdded: number): number {
  return -Math.log10(hydronium({ cations: hydroxideAdded / MMOL_PER_MOL, anions: hydroniumAdded / MMOL_PER_MOL, kw: KW }));
}

export interface BufferCapacityState {
  /** The settings, in mmol; `added` is negative for H₃O⁺ and positive for OH⁻. */
  readonly acid: number;
  readonly base: number;
  readonly added: number;
  /** In whole mmol, after the added acid or base has reacted to completion. */
  readonly reacted: number;
  readonly acidAfter: number;
  readonly baseAfter: number;
  readonly leftOver: number;
  /** The ion left over, or null when none is. */
  readonly leftOverIon: Ion | null;
  readonly kind: Kind;
  /** From the full equilibrium, unrounded. */
  readonly bufferBefore: number;
  readonly bufferAfter: number;
  readonly waterBefore: number;
  readonly waterAfter: number;
  /** As shown. The ratio after is null when a member has run out. */
  readonly bufferBeforeText: string;
  readonly bufferAfterText: string;
  readonly waterBeforeText: string;
  readonly waterAfterText: string;
  readonly ratioBeforeText: string;
  readonly ratioAfterText: string | null;
}

function kindOf(added: number, acid: number, base: number): Kind {
  const n = Math.abs(added);
  if (added === 0) return 'nothing';
  if (added > 0) {
    if (n < acid) return 'ohBoth';
    return n === acid ? 'ohUsedUp' : 'ohOverrun';
  }
  if (n < base) return 'h3oBoth';
  return n === base ? 'h3oUsedUp' : 'h3oOverrun';
}

/** The buffer and the water after `added` mmol of OH⁻ (positive) or H₃O⁺ (negative). */
export function state(acid: number, base: number, added: number): BufferCapacityState {
  assertSettings(acid, base, added);
  const n = Math.abs(added);
  const hydroxideAdded = added > 0 ? n : 0;
  const hydroniumAdded = added < 0 ? n : 0;
  const reacted = added > 0 ? Math.min(n, acid) : added < 0 ? Math.min(n, base) : 0;
  const acidAfter = added > 0 ? acid - reacted : acid + reacted;
  const baseAfter = added > 0 ? base + reacted : base - reacted;
  const leftOver = n - reacted;
  const leftOverIon: Ion | null = leftOver === 0 ? null : added > 0 ? 'OH⁻' : 'H₃O⁺';
  const bufferBefore = bufferPH(acid, base, 0, 0);
  const bufferAfter = bufferPH(acid, base, hydroxideAdded, hydroniumAdded);
  const waterBefore = waterPH(0, 0);
  const waterAfter = waterPH(hydroxideAdded, hydroniumAdded);
  return {
    acid,
    base,
    added,
    reacted,
    acidAfter,
    baseAfter,
    leftOver,
    leftOverIon,
    kind: kindOf(added, acid, base),
    bufferBefore,
    bufferAfter,
    waterBefore,
    waterAfter,
    bufferBeforeText: shownPH(bufferBefore),
    bufferAfterText: shownPH(bufferAfter),
    waterBeforeText: shownPH(waterBefore),
    waterAfterText: shownPH(waterAfter),
    ratioBeforeText: shownRatio(base, acid),
    ratioAfterText: acidAfter > 0 && baseAfter > 0 ? shownRatio(baseAfter, acidAfter) : null,
  };
}

/** A member slider's shown value: "100 mmol". */
export function amountText(mmol: number): string {
  assertAmount('amount', mmol);
  return `${mmol} mmol`;
}

/** A member slider's spoken value: "100 millimoles of propanoic acid". */
export function amountValueText(mmol: number, form: Form): string {
  assertAmount(FORM_NAME[form], mmol);
  return `${mmol} millimoles of ${FORM_NAME[form]}`;
}

/** The addition slider's spoken value: "15 mmol of OH⁻", "15 mmol of H₃O⁺" or "nothing added", never a signed number. */
export function addedValueText(added: number): string {
  assertAdded(added);
  if (added === 0) return 'nothing added';
  return `${Math.abs(added)} mmol of ${added > 0 ? 'OH⁻' : 'H₃O⁺'}`;
}

/** The addition slider's shown value: the same words. */
export function addedText(added: number): string {
  return addedValueText(added);
}

/** What the diagram says: what reacted with what, the ratio and the buffer's pH before and after, and the water's. */
export function readout(acid: number, base: number, added: number): string {
  const s = state(acid, base, added);
  const n = Math.abs(added);
  const water = `The same ${n} mmol took the water from pH ${s.waterBeforeText} to ${s.waterAfterText}.`;
  // Only the two "both members remain" kinds say a ratio after; a missing one there is a bug, not an empty string.
  const ratio = () => {
    if (s.ratioAfterText === null) throw new Error(`No ratio after for ${acid}, ${base} and ${added} mmol, but both members remain.`);
    return `The ratio of base form to acid form went from ${s.ratioBeforeText} to ${s.ratioAfterText}, and the buffer's pH from ${s.bufferBeforeText} to ${s.bufferAfterText}.`;
  };
  switch (s.kind) {
    case 'nothing':
      return (
        `The buffer holds ${acid} mmol of propanoic acid and ${base} mmol of propanoate ion: a ratio of base form to acid form of ${s.ratioBeforeText}. ` +
        `Its pH is ${s.bufferBeforeText}. The water's pH is ${s.waterBeforeText}. Nothing has been added yet.`
      );
    case 'ohBoth':
      return `${n} mmol of OH⁻ reacted with ${n} mmol of propanoic acid and made ${n} mmol of propanoate ion. ${ratio()} ${water}`;
    case 'h3oBoth':
      return `${n} mmol of H₃O⁺ reacted with ${n} mmol of propanoate ion and made ${n} mmol of propanoic acid. ${ratio()} ${water}`;
    case 'ohUsedUp':
      return (
        `${n} mmol of OH⁻ reacted with all ${acid} mmol of the propanoic acid. The acid form is used up, so this is no longer a buffer. ` +
        `What is left is propanoate ion, a weak base, and the pH has jumped from ${s.bufferBeforeText} to ${s.bufferAfterText}. ${water}`
      );
    case 'h3oUsedUp':
      return (
        `${n} mmol of H₃O⁺ reacted with all ${base} mmol of the propanoate ion. The base form is used up, so this is no longer a buffer. ` +
        `What is left is propanoic acid, a weak acid, and the pH has dropped from ${s.bufferBeforeText} to ${s.bufferAfterText}. ${water}`
      );
    case 'ohOverrun':
      return (
        `Only ${s.reacted} mmol of the ${n} mmol of OH⁻ found propanoic acid to react with. The acid form is used up, ` +
        `and the ${s.leftOver} mmol of OH⁻ left over now sets the pH, which has jumped from ${s.bufferBeforeText} to ${s.bufferAfterText}. ${water}`
      );
    case 'h3oOverrun':
      return (
        `Only ${s.reacted} mmol of the ${n} mmol of H₃O⁺ found propanoate ion to react with. The base form is used up, ` +
        `and the ${s.leftOver} mmol of H₃O⁺ left over now sets the pH, which has dropped from ${s.bufferBeforeText} to ${s.bufferAfterText}. ${water}`
      );
    default:
      return assertNever(s.kind);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled kind: ${JSON.stringify(value)}`);
}

export interface BarRow {
  readonly id: 'acid' | 'base' | 'left';
  readonly name: string;
  /** In mmol, after the reaction. */
  readonly after: number;
  /** In mmol, before the addition; null for the left-over bar, which has no outline. */
  readonly before: number | null;
  /** The amount written over the bar. */
  readonly text: string;
}

/** The three bars: the acid form and the base form after the reaction, with their amounts before, and what is left over. */
export function bars(acid: number, base: number, added: number): readonly BarRow[] {
  const s = state(acid, base, added);
  const leftName = added > 0 ? 'OH⁻ left over' : added < 0 ? 'H₃O⁺ left over' : LABELS.leftBar;
  return [
    { id: 'acid', name: LABELS.acidBar, after: s.acidAfter, before: acid, text: String(s.acidAfter) },
    { id: 'base', name: LABELS.baseBar, after: s.baseAfter, before: base, text: String(s.baseAfter) },
    { id: 'left', name: leftName, after: s.leftOver, before: null, text: String(s.leftOver) },
  ];
}

/** The scales in words, for their accessible name. */
export function describeScales(acid: number, base: number, added: number): string {
  const s = state(acid, base, added);
  if (s.kind === 'nothing') return `Two pH scales from 0 to ${SCALE.pHMax}, with nothing added yet. Buffer: ${s.bufferBeforeText}. Water: ${s.waterBeforeText}.`;
  return (
    `Two pH scales from 0 to ${SCALE.pHMax}. Buffer: ${s.bufferBeforeText} before, ${s.bufferAfterText} after. ` +
    `Water: ${s.waterBeforeText} before, ${s.waterAfterText} after.`
  );
}

/** The bars in words, for their accessible name. */
export function describeBars(acid: number, base: number, added: number): string {
  const s = state(acid, base, added);
  const left = s.leftOverIon ? `Left over: ${s.leftOver} of ${s.leftOverIon}.` : 'Left over: none.';
  if (s.kind === 'nothing') return `Bars in millimoles, with nothing added yet. Acid form: ${acid}. Base form: ${base}. ${left}`;
  const change = (after: number, before: number) => {
    // A reacting addition moves each bar by 5 mmol or more, so a bar never stays put here.
    if (after === before) throw new Error(`A bar did not move (${before} mmol) in a state with something added.`);
    return `${after}, ${after > before ? 'up' : 'down'} from ${before}`;
  };
  return `Bars in millimoles. Acid form: ${change(s.acidAfter, acid)}. Base form: ${change(s.baseAfter, base)}. ${left}`;
}
