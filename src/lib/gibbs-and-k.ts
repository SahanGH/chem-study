/**
 * The explorer of ΔG° and K of lesson 9.5, for a made-up reaction A(g) ⇌ B(g):
 * K = e^(−ΔG°/RT) with R = 8.314 J/(mol·K), and the mixture at equilibrium as
 * 100 particles. No DOM here, so it is testable directly.
 *
 * This one cannot be exact: it takes an exponential. ΔG° is a whole number of
 * kilojoules and T a whole number of kelvins, so the exponent is one division
 * of two whole numbers, ln K = −1,000,000g ÷ (8,314T), and K = e^(ln K) is
 * computed in floating point. Only the shown numbers are rounded, each from
 * its own unrounded value, half up. The unit tests pin every state's shown K
 * and shown count against values worked out another way, and prove that no
 * state lies within 10⁻⁹ of a rounding boundary.
 */

/** The gas constant of the site's equation page, in J/(mol·K). */
export const GAS_CONSTANT = 8.314;
/** The same, in whole thousandths, so that RT is a whole number of millijoules. */
const GAS_CONSTANT_THOUSANDTHS = 8314;

/** The slider of ΔG°, in whole kJ/mol. */
export const FREE_ENERGY = { min: -40, max: 40, step: 1 } as const;
export const FREE_ENERGIES: readonly number[] = Array.from(
  { length: (FREE_ENERGY.max - FREE_ENERGY.min) / FREE_ENERGY.step + 1 },
  (_, i) => FREE_ENERGY.min + i * FREE_ENERGY.step,
);

export type Kelvins = 298 | 500 | 1000;
/** The choice of temperature, in the brief's order. */
export const TEMPERATURES: readonly Kelvins[] = [298, 500, 1000];

export const START = { freeEnergy: -5, temperature: 298 } as const satisfies { freeEnergy: number; temperature: Kelvins };

/** The graph: log K against ΔG°. */
export const AXES = {
  freeMin: FREE_ENERGY.min,
  freeMax: FREE_ENERGY.max,
  freeTicks: [-40, -20, 0, 20, 40],
  logMin: -8,
  logMax: 8,
  logTicks: [-6, -3, 0, 3, 6],
} as const;

/** The words drawn in the diagram, its key and its controls. */
export const LABELS = {
  slider: 'ΔG°',
  choice: 'Temperature',
  freeAxis: 'ΔG° (kJ/mol)',
  logAxis: 'K (log scale)',
  kOne: 'K = 1',
  box: 'At equilibrium',
  keyA: 'A',
  keyB: 'B',
} as const;

export const PARTICLES = 100;

/** The box, in its own drawing units: ten rows of ten cells. */
export const BOX = {
  size: 200,
  cell: 19,
  /** The center of the first row and column. */
  first: 14.5,
  /** A: an open circle. */
  circleRadius: 6.5,
  /** B: a filled square. */
  squareSide: 12,
} as const;

const MINUS = '−';
const SUPERSCRIPTS: Readonly<Record<string, string>> = {
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

function assertFreeEnergy(g: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = g >= FREE_ENERGY.min && g <= FREE_ENERGY.max;
  if (!(inRange && Number.isInteger((g - FREE_ENERGY.min) / FREE_ENERGY.step))) {
    throw new RangeError(
      `ΔG° must be a whole number of kJ/mol from ${FREE_ENERGY.min} to +${FREE_ENERGY.max}, not ${g}.`,
    );
  }
}

function assertTemperature(temperature: Kelvins): void {
  if (!TEMPERATURES.includes(temperature)) {
    throw new RangeError(`The temperature must be one of ${TEMPERATURES.join(', ')} K, not ${temperature} K.`);
  }
}

/** A whole number with a thousands comma: 7200 is "7,200". */
function withCommas(whole: number): string {
  return String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** A whole exponent in superscript digits: −3 is "⁻³". */
function superscript(exponent: number): string {
  return String(exponent)
    .split('')
    .map((c) => {
      const sup = SUPERSCRIPTS[c];
      if (sup === undefined) throw new RangeError(`There is no superscript for "${c}" in ${exponent}.`);
      return sup;
    })
    .join('');
}

interface TwoFigures {
  /** The two figures as a whole number from 10 to 99. */
  readonly digits: number;
  /** The power of ten of the first figure: the value is digits × 10^(exponent − 1). */
  readonly exponent: number;
}

/** A positive number to two significant figures, half up. */
function twoFigures(value: number): TwoFigures {
  if (!(value > 0 && Number.isFinite(value))) throw new RangeError(`Only a positive finite number can be rounded to two figures, not ${value}.`);
  let exponent = Math.floor(Math.log10(value));
  // log10 can land a hair on the wrong side of a power of ten; the scaled value says which.
  let scaled = value / Math.pow(10, exponent - 1);
  if (scaled >= 100) {
    exponent += 1;
    scaled = value / Math.pow(10, exponent - 1);
  } else if (scaled < 10) {
    exponent -= 1;
    scaled = value / Math.pow(10, exponent - 1);
  }
  let digits = Math.floor(scaled + 0.5);
  if (digits === 100) {
    digits = 10;
    exponent += 1;
  }
  return { digits, exponent };
}

/** Two figures as a plain number: "0.012", "0.13", "7.5", "85", "950", "7,200". */
function plainText({ digits, exponent }: TwoFigures): string {
  const text = String(digits);
  if (exponent >= 1) return withCommas(digits * Math.pow(10, exponent - 1));
  if (exponent === 0) return `${text[0]}.${text[1]}`;
  return `0.${'0'.repeat(-exponent - 1)}${text}`;
}

/** A positive number to two significant figures, half up, as a plain number: "2.0", "16", "0.12". */
export function shownTwoFigures(value: number): string {
  return plainText(twoFigures(value));
}

/** K as shown: two figures, a plain number from 0.010 to 9,900 and a power of ten outside that range. */
export function shownK(k: number): string {
  const rounded = twoFigures(k);
  if (rounded.exponent >= -2 && rounded.exponent <= 3) return plainText(rounded);
  const text = String(rounded.digits);
  return `${text[0]}.${text[1]} × 10${superscript(rounded.exponent)}`;
}

/** The slider's shown value: "−5", "0", "+5". */
export function freeEnergyText(g: number): string {
  assertFreeEnergy(g);
  if (g === 0) return '0';
  return `${g > 0 ? '+' : MINUS}${Math.abs(g)}`;
}

/** The slider's spoken value: "minus 5 kilojoules per mole". */
export function freeEnergyValueText(g: number): string {
  assertFreeEnergy(g);
  const size = Math.abs(g);
  const unit = size === 1 ? 'kilojoule per mole' : 'kilojoules per mole';
  if (g === 0) return `0 ${unit}`;
  return `${g > 0 ? 'plus' : 'minus'} ${size} ${unit}`;
}

/** A temperature as shown: "298 K", "1,000 K". */
export function temperatureText(temperature: Kelvins): string {
  assertTemperature(temperature);
  return `${withCommas(temperature)} K`;
}

/** The last sentence of the readout, from the count of B. It never says 0 or 100. */
export function mixtureSentence(countB: number): string {
  if (!(Number.isInteger(countB) && countB >= 0 && countB <= PARTICLES)) {
    throw new RangeError(`A count of particles must be a whole number from 0 to ${PARTICLES}, not ${countB}.`);
  }
  if (countB === PARTICLES) return 'At equilibrium fewer than 1 in 100 particles is A.';
  if (countB === 0) return 'At equilibrium fewer than 1 in 100 particles is B.';
  if (countB === 1) return 'At equilibrium about 1 of every 100 particles is B.';
  return `At equilibrium about ${countB} of every 100 particles are B.`;
}

export interface GibbsAndKState {
  readonly freeEnergy: number;
  readonly temperature: Kelvins;
  /** RT in kJ/mol, unrounded. */
  readonly rtKJ: number;
  /** RT as shown, to three figures: "2.48". */
  readonly rtText: string;
  /** |ΔG°| ÷ RT as shown, to two figures; null when ΔG° is zero. */
  readonly multipleText: string | null;
  /** The unrounded ln K, log K and K. */
  readonly lnK: number;
  readonly logK: number;
  readonly k: number;
  readonly kText: string;
  /** The unrounded share of B, in percent. */
  readonly shareB: number;
  /** The particles of 100 drawn as B and as A. */
  readonly countB: number;
  readonly countA: number;
}

export function state(g: number, temperature: Kelvins): GibbsAndKState {
  assertFreeEnergy(g);
  assertTemperature(temperature);
  // RT in whole millijoules per mole: 8,314 × T. Shown to 0.01 kJ (three figures, since
  // every RT here is from 1 to 10 kJ), half up, in whole arithmetic.
  const rtMillijoules = GAS_CONSTANT_THOUSANDTHS * temperature;
  if (!(rtMillijoules >= 1_000_000 && rtMillijoules < 10_000_000)) throw new RangeError(`RT at ${temperature} K is not from 1 to 10 kJ/mol.`);
  const rtHundredths = Math.floor((rtMillijoules + 5_000) / 10_000);
  const rtText = `${Math.floor(rtHundredths / 100)}.${String(rtHundredths % 100).padStart(2, '0')}`;
  const rtKJ = rtMillijoules / 1_000_000;
  // ln K = −ΔG°/RT = −(1,000g J) ÷ (8.314T J) = −1,000,000g ÷ (8,314T): one division, correctly rounded.
  const lnK = g === 0 ? 0 : (-1_000_000 * g) / rtMillijoules;
  const k = Math.exp(lnK);
  const shareB = 100 / (1 + Math.exp(-lnK));
  const countB = Math.floor(shareB + 0.5);
  return {
    freeEnergy: g,
    temperature,
    rtKJ,
    rtText,
    multipleText: g === 0 ? null : shownTwoFigures((1_000_000 * Math.abs(g)) / rtMillijoules),
    lnK,
    logK: lnK / Math.LN10,
    k,
    kText: shownK(k),
    shareB,
    countB,
    countA: PARTICLES - countB,
  };
}

/** What the diagram says, for the status line. */
export function readout(g: number, temperature: Kelvins): string {
  const s = state(g, temperature);
  const rt = `RT is ${s.rtText} kJ/mol`;
  const size = s.multipleText === null ? `${rt}.` : `${rt}, so ΔG° is ${s.multipleText} times RT ${g < 0 ? 'below' : 'above'} zero.`;
  return `ΔG° = ${freeEnergyText(g)} kJ/mol at ${temperatureText(temperature)}. ${size} K = ${s.kText}. ${mixtureSentence(s.countB)}`;
}

/** The rank of a cell of the box, numbered 0 to 99 in reading order: (37i + 11) mod 100, each rank once. */
export function rankOf(cell: number): number {
  if (!(Number.isInteger(cell) && cell >= 0 && cell < PARTICLES)) throw new RangeError(`The box has cells 0 to ${PARTICLES - 1}, not ${cell}.`);
  return (37 * cell + 11) % PARTICLES;
}

export interface Particle {
  /** The center of its cell, in the box's units. */
  readonly x: number;
  readonly y: number;
  readonly kind: 'A' | 'B';
}

/**
 * The 100 particles, cell by cell across each row from the top left. A cell is
 * B when its rank is below the count of B, so the B particles are scattered
 * through the box, and one step of the slider changes only the few cells whose
 * rank lies between the two counts.
 */
export function particles(g: number, temperature: Kelvins): readonly Particle[] {
  const { countB } = state(g, temperature);
  return Array.from({ length: PARTICLES }, (_, cell) => ({
    x: BOX.first + BOX.cell * (cell % 10),
    y: BOX.first + BOX.cell * Math.floor(cell / 10),
    kind: rankOf(cell) < countB ? 'B' : 'A',
  }));
}

export interface LinePoint {
  readonly freeEnergy: number;
  readonly logK: number;
}

/** A temperature's line on the graph: straight through the origin, between its values at the two ends of the axis. */
export function linePoints(temperature: Kelvins): readonly LinePoint[] {
  assertTemperature(temperature);
  return [AXES.freeMin, AXES.freeMax].map((g) => ({ freeEnergy: g, logK: state(g, temperature).logK }));
}

/** A value on the K axis: "10⁻⁶", "1", "10³". */
export function logTickText(power: number): string {
  if (!Number.isInteger(power)) throw new RangeError(`A K axis value must be a whole power of ten, not ${power}.`);
  return power === 0 ? '1' : `10${superscript(power)}`;
}

/** A value on the ΔG° axis: "−40", "0", "+20". */
export function freeTickText(g: number): string {
  if (!Number.isInteger(g)) throw new RangeError(`A ΔG° axis value must be a whole number of kJ, not ${g}.`);
  if (g === 0) return '0';
  return `${g > 0 ? '+' : MINUS}${Math.abs(g)}`;
}

/** The graph in words, for its accessible name. */
export function describeGraph(g: number, temperature: Kelvins): string {
  const s = state(g, temperature);
  const [start, end] = [state(AXES.freeMin, temperature), state(AXES.freeMax, temperature)];
  const others = TEMPERATURES.filter((t) => t !== temperature).map(temperatureText);
  return (
    `Graph of K, on a scale of powers of ten from ${logTickText(AXES.logMin)} to ${logTickText(AXES.logMax)}, ` +
    `against ΔG° from ${freeTickText(AXES.freeMin)} to ${freeTickText(AXES.freeMax)} kJ/mol. A firm line marks ${LABELS.kOne}. ` +
    `The line for ${temperatureText(temperature)} is drawn heavy and those for ${others.join(' and ')} faint and dashed. ` +
    `It runs from K = ${start.kText} at ${freeTickText(AXES.freeMin)} kJ/mol to K = ${end.kText} at ${freeTickText(AXES.freeMax)} kJ/mol. ` +
    `A marker at ${freeEnergyText(g)} kJ/mol is on it at K = ${s.kText}.`
  );
}

/** The box in words, for its accessible name. */
export function describeBox(g: number, temperature: Kelvins): string {
  const { countA, countB } = state(g, temperature);
  const opening = `A box of ${PARTICLES} particles at equilibrium`;
  if (countB === PARTICLES) return `${opening}, all drawn as B, filled squares: fewer than 1 in 100 is A.`;
  if (countB === 0) return `${opening}, all drawn as A, open circles: fewer than 1 in 100 is B.`;
  const b = countB === 1 ? '1 is B, drawn as a filled square' : `${countB} are B, drawn as filled squares`;
  const a = countA === 1 ? '1 is A, drawn as an open circle' : `${countA} are A, drawn as open circles`;
  return `${opening}: ${b}, and ${a}.`;
}
