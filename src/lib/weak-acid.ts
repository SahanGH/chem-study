/**
 * A weak acid alone in water at a chosen starting concentration, for the
 * weak-acid explorer in lesson 8.3. No DOM here, so it is testable directly.
 *
 * Every number comes from the shared solver (`acid-base.ts`), which finds
 * [H₃O⁺] from the full charge balance, water's own ions included. The
 * shortcut a student uses by hand, x = √(Ka C), is shown beside it with its
 * 5 percent check, and so is the pH of a strong acid at the same
 * concentration.
 *
 * Concentrations are kept as whole ten-thousandths of a mole per liter and
 * divided only to call the solver. Each shown number is rounded half up from
 * its own unrounded value, never from another shown number: a pH to two
 * decimal places, a concentration to two significant figures, a percentage
 * to two significant figures under 10 and to a whole number from 10 up.
 */

import { hydronium, shortcutHydronium } from './acid-base';

export interface Acid {
  /** The name in a sentence. */
  readonly name: string;
  /** The name at the start of a sentence. */
  readonly title: string;
  /** The name at the end of its curve. */
  readonly shortName: string;
  /** The radio button's words. */
  readonly label: string;
  readonly ka: number;
  /** Its conjugate base, for the box's description. */
  readonly conjugateBase: string;
}

export const ACIDS = {
  chloroacetic: {
    name: 'chloroacetic acid',
    title: 'Chloroacetic acid',
    shortName: 'chloroacetic',
    label: 'Chloroacetic acid, HC₂H₂ClO₂',
    ka: 1.4e-3,
    conjugateBase: 'chloroacetate ion',
  },
  formic: {
    name: 'formic acid',
    title: 'Formic acid',
    shortName: 'formic',
    label: 'Formic acid, HCHO₂',
    ka: 1.8e-4,
    conjugateBase: 'formate ion',
  },
  butanoic: {
    name: 'butanoic acid',
    title: 'Butanoic acid',
    shortName: 'butanoic',
    label: 'Butanoic acid, HC₄H₇O₂',
    ka: 1.5e-5,
    conjugateBase: 'butanoate ion',
  },
} as const satisfies Record<string, Acid>;

export type AcidId = keyof typeof ACIDS;

const isAcidId = (key: string): key is AcidId => Object.hasOwn(ACIDS, key);

/** The acids by id, in the order the diagram offers them: read from ACIDS, so the two cannot drift apart. */
export const ACID_IDS: readonly AcidId[] = Object.keys(ACIDS).filter(isAcidId);

/** Concentrations are whole ten-thousandths of a mole per liter. */
export const UNITS_PER_MOLAR = 10_000;

/** The slider's ten concentrations, most concentrated at the left: 1.0, 0.50, 0.20, 0.10, … 0.0010 M. */
export const CONCENTRATION_UNITS: readonly number[] = [10_000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10];

/** The slider moves through the ten concentrations by position. */
export const SLIDER = { min: 0, max: CONCENTRATION_UNITS.length - 1, step: 1 } as const;

export const START: { readonly acid: AcidId; readonly position: number } = { acid: 'formic', position: 3 };

/** The shortcut passes its check when x is under this percent of the starting concentration. */
export const CHECK_LIMIT = 5;

/** The dashed guide on the graph, in percent. */
export const GUIDE_PERCENT = 5;

/** The particles in the box. */
export const PARTICLES = 100;

/** The graph's axes: percent ionized upward, log C from 0 (1 M) at the left to −3 (0.001 M) at the right. */
export const AXES = {
  percentMax: 70,
  percentTicks: [0, 10, 20, 30, 40, 50, 60, 70],
  logLeft: 0,
  logRight: -3,
  concentrationTicks: [
    { log: 0, text: '1' },
    { log: -1, text: '0.1' },
    { log: -2, text: '0.01' },
    { log: -3, text: '0.001' },
  ],
} as const;

/** The curves are drawn through the module's values at every 0.05 in log C, and at the slider's concentrations. */
const CURVE_STEPS_PER_DECADE = 20;

export interface WeakAcidState {
  readonly acid: AcidId;
  readonly position: number;
  /** The starting concentration, in mol/L, and its logarithm. */
  readonly concentration: number;
  readonly logConcentration: number;
  readonly concentrationText: string;
  /** From the full equilibrium, unrounded. */
  readonly hydronium: number;
  readonly pH: number;
  /** 100 × [A⁻]/C. */
  readonly percent: number;
  /** The particles of 100 drawn as ions: the percent rounded half up. */
  readonly ions: number;
  /** The shortcut: x = √(Ka C), its pH, and its check, 100 x/C. */
  readonly shortcutHydronium: number;
  readonly shortcutPH: number;
  readonly check: number;
  readonly shortcutPasses: boolean;
  /** A strong acid at the same concentration. */
  readonly strongPH: number;
  /** As shown. */
  readonly hydroniumText: string;
  readonly pHText: string;
  readonly percentText: string;
  readonly shortcutPHText: string;
  readonly checkText: string;
  readonly strongPHText: string;
}

function assertAcid(id: string): asserts id is AcidId {
  if (!isAcidId(id)) {
    throw new RangeError(`The acid must be ${ACID_IDS.join(', ')}, not "${id}".`);
  }
}

function unitsAt(position: number): number {
  const units = Number.isInteger(position) ? CONCENTRATION_UNITS[position] : undefined;
  if (units === undefined) {
    throw new RangeError(`The slider position must be a whole number from ${SLIDER.min} to ${SLIDER.max}, not ${position}.`);
  }
  return units;
}

/** A whole number with `decimals` digits after the point: 238 with 2 is "2.38", 5 with 2 is "0.05". */
function withPoint(whole: number, decimals: number): string {
  const sign = whole < 0 ? '−' : '';
  const digits = String(Math.abs(whole)).padStart(decimals + 1, '0');
  return decimals === 0 ? `${sign}${digits}` : `${sign}${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
}

/** A pH to two decimal places, rounded half up. A value that rounds to zero is "0.00", never "−0.00". */
export function shownPH(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`A pH to show must be a finite number, not ${value}.`);
  const hundredths = Math.floor(value * 100 + 0.5);
  return withPoint(hundredths === 0 ? 0 : hundredths, 2);
}

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};
const superscript = (n: number) => [...String(n)].map((ch) => SUPERSCRIPT[ch] ?? ch).join('');

/** Two significant figures, rounded half up: the mantissa in tenths (10 to 99) and the power of ten. */
function twoFigures(value: number): { tenths: number; power: number } {
  if (!(value > 0 && Number.isFinite(value))) throw new RangeError(`A value to show must be a positive number, not ${value}.`);
  let power = Math.floor(Math.log10(value));
  let tenths = Math.floor((value / 10 ** power) * 10 + 0.5);
  if (tenths >= 100) {
    tenths = 10;
    power += 1;
  }
  return { tenths, power };
}

/** A concentration to two significant figures, in the form "4.2 × 10⁻³". */
export function shownConcentration(value: number): string {
  const { tenths, power } = twoFigures(value);
  return `${withPoint(tenths, 1)} × 10${superscript(power)}`;
}

/** A percentage: to two significant figures under 10 ("0.39", "4.2"), to a whole number from 10 up ("34", "118"). */
export function shownPercent(value: number): string {
  if (!(value > 0 && Number.isFinite(value))) throw new RangeError(`A percentage to show must be a positive number, not ${value}.`);
  if (value >= 10) return String(Math.floor(value + 0.5));
  const { tenths, power } = twoFigures(value);
  // 9.97 rounds to 10 at two figures, which is shown as a whole number.
  return power >= 1 ? String(tenths * 10 ** (power - 1)) : withPoint(tenths, 1 - power);
}

/** The starting concentration at a slider position, to two significant figures: "0.10". */
export function concentrationText(position: number): string {
  const units = unitsAt(position);
  const { tenths, power } = twoFigures(units / UNITS_PER_MOLAR);
  return withPoint(tenths, 1 - power);
}

/** The slider's spoken value: "0.10 molar". */
export function concentrationValueText(position: number): string {
  return `${concentrationText(position)} molar`;
}

const percentIonized = (ka: number, h: number) => (100 * ka) / (ka + h);

/** The solution at a setting: the full equilibrium, the shortcut and its check, and the strong acid. */
export function state(acid: AcidId, position: number): WeakAcidState {
  assertAcid(acid);
  const units = unitsAt(position);
  const { ka } = ACIDS[acid];
  const c = units / UNITS_PER_MOLAR;
  const h = hydronium({ weakAcid: c, ka });
  const percent = percentIonized(ka, h);
  const x = shortcutHydronium(ka, c);
  const check = (100 * x) / c;
  const pH = -Math.log10(h);
  const shortcutPH = -Math.log10(x);
  const strongPH = -Math.log10(hydronium({ anions: c }));
  return {
    acid,
    position,
    concentration: c,
    logConcentration: Math.log10(c),
    concentrationText: concentrationText(position),
    hydronium: h,
    pH,
    percent,
    ions: Math.floor(percent + 0.5),
    shortcutHydronium: x,
    shortcutPH,
    check,
    shortcutPasses: check < CHECK_LIMIT,
    strongPH,
    hydroniumText: shownConcentration(h),
    pHText: shownPH(pH),
    percentText: shownPercent(percent),
    shortcutPHText: shownPH(shortcutPH),
    checkText: shownPercent(check),
    strongPHText: shownPH(strongPH),
  };
}

/** What the diagram says about the chosen acid and concentration. */
export function readout(acid: AcidId, position: number): string {
  const s = state(acid, position);
  const c = s.concentrationText;
  const few = s.ions === 0 ? ', fewer than 1 molecule in 100' : '';
  let verdict: string;
  if (s.shortcutPasses) {
    verdict = `and its check comes to ${s.checkText} percent, under ${CHECK_LIMIT}, so it passes`;
  } else if (s.check > 100) {
    verdict = `but its check comes to ${s.checkText} percent, more acid than there is, so it fails here`;
  } else {
    verdict = `but its check comes to ${s.checkText} percent, over ${CHECK_LIMIT}, so it fails here`;
  }
  return (
    `${ACIDS[acid].title} at ${c} M: [H₃O⁺] = ${s.hydroniumText} M and the pH is ${s.pHText}. ` +
    `Of the acid, ${s.percentText} percent is ionized${few}. ` +
    `The shortcut gives a pH of ${s.shortcutPHText}, ${verdict}. ` +
    `A strong acid at ${c} M would have a pH of ${s.strongPHText}.`
  );
}

/** The line under the box: "4 of 100 ionized", or "fewer than 1 of 100 ionized" when none is drawn. */
export function countText(acid: AcidId, position: number): string {
  const { ions } = state(acid, position);
  return ions === 0 ? `fewer than 1 of ${PARTICLES} ionized` : `${ions} of ${PARTICLES} ionized`;
}

/** The key under the box. */
export const KEY = { whole: 'whole molecule, HA', pair: 'ions, H₃O⁺ and A⁻' } as const;

/** The box, in its own drawing units: ten rows of ten cells. */
export const BOX = {
  size: 200,
  cell: 19,
  /** The center of the first row and column. */
  first: 14.5,
  wholeRadius: 7.5,
  /** The ion pair: a small dark circle for H₃O⁺ at the left, a hollow circle for A⁻ at the right, touching. */
  hydroniumOffset: -4.5,
  hydroniumRadius: 4,
  anionOffset: 3.5,
  anionRadius: 5.5,
  /** How far the pair reaches from its cell's center. */
  pairReach: 9,
  /** Half the length of each stroke of the plus and of the minus. */
  plusArm: 2.2,
  minusArm: 2.8,
} as const;

/**
 * The cells, numbered across each row from the top left, in the order they
 * ionize: each new cell is as far as it can be from those before it (ties
 * broken by a fixed shuffle), so a few ions are spread through the box and
 * moving the slider adds or removes ions without rearranging the rest.
 */
export const IONIZATION_ORDER: readonly number[] = [
  44, 99, 90, 9, 0, 58, 85, 40, 5, 72, 22, 27, 39, 66, 93, 20, 60, 24, 64, 79, 97, 2, 52, 46, 7, 31, 13, 16, 33, 11, 55, 35, 77, 88,
  18, 81, 63, 86, 74, 59, 49, 47, 61, 32, 6, 96, 82, 67, 15, 53, 65, 92, 1, 43, 23, 25, 34, 54, 89, 51, 56, 28, 29, 76, 37, 21, 69, 80,
  95, 83, 70, 75, 14, 48, 87, 78, 62, 98, 4, 91, 50, 73, 8, 10, 38, 17, 12, 68, 42, 30, 19, 45, 71, 41, 84, 26, 57, 36, 94, 3,
];

export interface Particle {
  /** The center of its cell, in the box's units. */
  readonly x: number;
  readonly y: number;
  readonly ionized: boolean;
}

/** The 100 particles, cell by cell across each row from the top left. */
export function particles(acid: AcidId, position: number): readonly Particle[] {
  const { ions } = state(acid, position);
  const ionized = new Set(IONIZATION_ORDER.slice(0, ions));
  return Array.from({ length: PARTICLES }, (_, cell) => ({
    x: BOX.first + BOX.cell * (cell % 10),
    y: BOX.first + BOX.cell * Math.floor(cell / 10),
    ionized: ionized.has(cell),
  }));
}

/** The box in words, for its accessible name. */
export function describeBox(acid: AcidId, position: number): string {
  const { ions } = state(acid, position);
  const a = ACIDS[acid];
  if (ions === 0) {
    return `A box of ${PARTICLES} particles of ${a.name}, all drawn as whole molecules, filled circles: fewer than 1 in 100 is ionized.`;
  }
  const each = ions === 1 ? 'drawn' : 'each drawn';
  return (
    `A box of ${PARTICLES} particles of ${a.name}: ${PARTICLES - ions} whole molecules, drawn as filled circles, ` +
    `and ${ions} ionized, ${each} as a hydronium ion, a small dark circle marked plus, beside a ${a.conjugateBase}, a hollow circle marked minus.`
  );
}

export interface CurvePoint {
  readonly logConcentration: number;
  readonly percent: number;
}

/** One acid's curve, from 1 M to 0.001 M: every 0.05 in log C, with the slider's concentrations in their places. */
export function curve(acid: AcidId): readonly CurvePoint[] {
  assertAcid(acid);
  const { ka } = ACIDS[acid];
  const at = (c: number): CurvePoint => ({ logConcentration: Math.log10(c), percent: percentIonized(ka, hydronium({ weakAcid: c, ka })) });
  const slider = CONCENTRATION_UNITS.map((units) => at(units / UNITS_PER_MOLAR));
  const decades = AXES.logLeft - AXES.logRight;
  const grid = Array.from({ length: decades * CURVE_STEPS_PER_DECADE + 1 }, (_, k) => -k / CURVE_STEPS_PER_DECADE)
    // A slider concentration takes the place of a grid point it falls on (1, 0.1, 0.01 and 0.001 M).
    .filter((log) => !slider.some((p) => Math.abs(p.logConcentration - log) < 1e-12))
    .map((log) => at(10 ** log));
  return [...slider, ...grid].sort((p, q) => q.logConcentration - p.logConcentration);
}

/** The graph in words, for its accessible name. */
export function describeGraph(acid: AcidId, position: number): string {
  const now = state(acid, position);
  const last = SLIDER.max;
  const [first, ...rest] = ACID_IDS.map((id) => ({ id, from: state(id, 0), to: state(id, last) }));
  if (!first) throw new Error('There are three acids.');
  const others = rest.map(({ id, from, to }) => `${ACIDS[id].name} from ${from.percentText} to ${to.percentText} percent`);
  const curves =
    `${ACIDS[first.id].name} from ${first.from.percentText} percent at ${first.from.concentrationText} M ` +
    `to ${first.to.percentText} percent at ${first.to.concentrationText} M, ` +
    `${others.slice(0, -1).join(', ')}${others.length > 1 ? ', and ' : ''}${others.at(-1) ?? ''}`;
  return (
    `Graph of percent ionized, from 0 to ${AXES.percentMax} percent, against starting concentration on a logarithmic scale, ` +
    `from 1 M at the left to 0.001 M at the right. One curve for each acid, each rising as the solution is diluted: ${curves}. ` +
    `The curve of ${ACIDS[acid].name} is drawn heavy and the other two faint and dashed. A dashed line marks ${GUIDE_PERCENT} percent. ` +
    `A marker at ${now.concentrationText} M is on the curve of ${ACIDS[acid].name}, at ${now.percentText} percent.`
  );
}
