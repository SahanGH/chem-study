/**
 * How the speeds and the kinetic energies of gas molecules are spread out,
 * for the Maxwell–Boltzmann diagram in lesson 3.5. No DOM here, so it is
 * testable directly.
 *
 * Speeds are in m/s, temperatures in K, molar masses in g/mol and molar
 * kinetic energies in kJ/mol. A density is a fraction of the molecules per
 * m/s or per kJ/mol, so the area under a whole curve is 1.
 *
 * The range checks are the diagram's ranges, not physical limits: a function
 * here throws for a temperature, a speed or an energy the diagram cannot
 * show. A second user of these formulas would need the checks moved out to
 * the diagram first.
 */

export type GasId = 'ch4' | 'n2' | 'co2';

export interface Gas {
  readonly id: GasId;
  /** "CH₄", "N₂", "CO₂": how the gas is written. */
  readonly name: string;
  /** In g/mol. */
  readonly molarMass: number;
}

/** The gas constant in J/(mol·K), as the AP equation sheet gives it. */
export const R = 8.314;

// A light, a middling and a heavy gas whose curves, with the temperatures
// below, all fit one graph on which nitrogen at 300 K is easy to read. A gas
// as light as helium needs an axis so long that it squeezes the others
// against the left edge.
export const GASES = {
  ch4: { id: 'ch4', name: 'CH₄', molarMass: 16.043 },
  n2: { id: 'n2', name: 'N₂', molarMass: 28.014 },
  co2: { id: 'co2', name: 'CO₂', molarMass: 44.009 },
} as const satisfies Record<GasId, Gas>;

/** The temperatures the diagram offers, in K. */
export const TEMPERATURE = { min: 200, max: 600, step: 50, start: 300 } as const;

/** The curve every other curve is compared with. */
export const REFERENCE = { gas: 'n2', temperature: 300 } as const;

// Beyond these, no offered curve has as much as 1 percent of its molecules:
// methane at 600 K has 0.49 percent past 2000 m/s, and any gas at 600 K has
// 0.73 percent past 30 kJ/mol.
export const SPEED_AXIS_MAX = 2000;
export const ENERGY_AXIS_MAX = 30;

// A curve is drawn with a point every curveStep, about 200 of them. The step
// divides the threshold's step, so the shaded region starts on a drawn point.
export const AXES = {
  speed: { max: SPEED_AXIS_MAX, ticks: [0, 500, 1000, 1500, 2000], thresholdStep: 50, thresholdStart: 600, curveStep: 10 },
  energy: { max: ENERGY_AXIS_MAX, ticks: [0, 10, 20, 30], thresholdStep: 1, thresholdStart: 10, curveStep: 0.125 },
} as const;

/** What a curve is drawn for. An energy curve has no gas: at one temperature, every gas has the same one. */
export type Curve =
  | { readonly kind: 'speed'; readonly gas: Gas; readonly temperature: number }
  | { readonly kind: 'energy'; readonly temperature: number };

export interface CurvePoint {
  /** A speed in m/s or a kinetic energy in kJ/mol. */
  readonly x: number;
  readonly density: number;
}

/** The comparison curve as a speed curve or as an energy curve. */
export function referenceCurve(kind: Curve['kind']): Curve {
  const temperature = REFERENCE.temperature;
  return kind === 'speed' ? { kind, gas: GASES[REFERENCE.gas], temperature } : { kind, temperature };
}

const SQRT_PI = Math.sqrt(Math.PI);

function assertInRange(value: number, min: number, max: number, what: string, unit: string): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  if (!(value >= min && value <= max)) {
    throw new RangeError(`The ${what} must be from ${min} ${unit} to ${max} ${unit}, not ${value} ${unit}.`);
  }
}

const assertTemperature = (temperature: number) =>
  assertInRange(temperature, TEMPERATURE.min, TEMPERATURE.max, 'temperature', 'K');
const assertSpeed = (speed: number) => assertInRange(speed, 0, SPEED_AXIS_MAX, 'speed', 'm/s');
const assertEnergy = (energy: number) => assertInRange(energy, 0, ENERGY_AXIS_MAX, 'kinetic energy', 'kJ/mol');

/** A gas's molar mass in kg/mol, the unit that goes with R in J/(mol·K). */
function kilogramsPerMole(gas: Gas): number {
  if (!(Number.isFinite(gas.molarMass) && gas.molarMass > 0)) {
    throw new RangeError(`The molar mass of ${gas.name} must be above 0 g/mol, not ${gas.molarMass} g/mol.`);
  }
  return gas.molarMass / 1000;
}

/** RT in kJ/mol. */
function thermalEnergy(temperature: number): number {
  assertTemperature(temperature);
  return (R * temperature) / 1000;
}

/**
 * The complementary error function, which JavaScript does not have.
 * Abramowitz and Stegun, Handbook of Mathematical Functions, formula 7.1.26:
 * the absolute error is under 1.5 × 10⁻⁷.
 */
export function erfc(x: number): number {
  if (!Number.isFinite(x)) throw new RangeError(`erfc needs a finite number, not ${x}.`);
  // The formula holds from zero up; erfc(-x) = 2 - erfc(x) gives the rest.
  if (x < 0) return 2 - erfc(-x);
  const t = 1 / (1 + 0.3275911 * x);
  const series = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return series * Math.exp(-x * x);
}

/** The speed at the peak of a gas's speed curve, √(2RT/M), in m/s. */
export function mostProbableSpeed(gas: Gas, temperature: number): number {
  assertTemperature(temperature);
  return Math.sqrt((2 * R * temperature) / kilogramsPerMole(gas));
}

/** The Maxwell–Boltzmann distribution of speeds, 4π(M/2πRT)^(3/2) v² e^(−Mv²/2RT), per m/s. */
export function speedDensity(gas: Gas, temperature: number, speed: number): number {
  assertTemperature(temperature);
  assertSpeed(speed);
  const a = kilogramsPerMole(gas) / (2 * R * temperature);
  return 4 * Math.PI * (a / Math.PI) ** 1.5 * speed * speed * Math.exp(-a * speed * speed);
}

/** The distribution of molar kinetic energies, (2/√π)(RT)^(−3/2) √E e^(−E/RT), per kJ/mol. */
export function energyDensity(temperature: number, energy: number): number {
  const rt = thermalEnergy(temperature);
  assertEnergy(energy);
  return (2 / SQRT_PI) * rt ** -1.5 * Math.sqrt(energy) * Math.exp(-energy / rt);
}

/** The fraction of a gas's molecules that move faster than a speed. */
export function fractionFaster(gas: Gas, temperature: number, speed: number): number {
  assertSpeed(speed);
  const x = speed / mostProbableSpeed(gas, temperature);
  return erfc(x) + ((2 * x) / SQRT_PI) * Math.exp(-x * x);
}

/** The fraction of the molecules of any gas that have more than a kinetic energy. */
export function fractionAbove(temperature: number, energy: number): number {
  assertEnergy(energy);
  const y = energy / thermalEnergy(temperature);
  return erfc(Math.sqrt(y)) + 2 * Math.sqrt(y / Math.PI) * Math.exp(-y);
}

/** The height of a curve at a speed in m/s or, for an energy curve, a kinetic energy in kJ/mol. */
export function densityAt(curve: Curve, x: number): number {
  return curve.kind === 'speed' ? speedDensity(curve.gas, curve.temperature, x) : energyDensity(curve.temperature, x);
}

/** The top of a curve: the most probable speed, or half of RT for an energy curve. */
export function peakOf(curve: Curve): CurvePoint {
  const x =
    curve.kind === 'speed' ? mostProbableSpeed(curve.gas, curve.temperature) : thermalEnergy(curve.temperature) / 2;
  return { x, density: densityAt(curve, x) };
}

/**
 * The height of the tallest curve the diagram offers, which its fixed
 * vertical axis has to fit. A curve is tallest when it is narrowest: at the
 * lowest temperature and, for speeds, for the heaviest gas.
 */
export function tallestPeak(kind: Curve['kind']): number {
  const temperature = TEMPERATURE.min;
  if (kind === 'energy') return peakOf({ kind, temperature }).density;
  return Math.max(...Object.values(GASES).map((gas) => peakOf({ kind, gas, temperature }).density));
}

/** Points along a curve for drawing, from zero to the end of its axis. */
export function curvePoints(curve: Curve): CurvePoint[] {
  const { max, curveStep } = AXES[curve.kind];
  const xs = Array.from({ length: Math.round(max / curveStep) + 1 }, (_, step) => step * curveStep);
  // The peak is drawn exactly, wherever the steps fall.
  const peak = peakOf(curve);
  if (!xs.includes(peak.x)) xs.push(peak.x);
  return xs.sort((a, b) => a - b).map((x) => ({ x, density: densityAt(curve, x) }));
}

/**
 * A fraction of the molecules as a percentage with two significant figures.
 * It never reads "0%" or "100%": the tails of a distribution thin out but
 * do not end, so some molecules are always beyond any threshold.
 */
export function formatPercent(fraction: number): string {
  if (!(fraction >= 0 && fraction <= 1)) {
    throw new RangeError(`A fraction of the molecules must be from 0 to 1, not ${fraction}.`);
  }
  const percent = fraction * 100;
  if (percent < 0.1) return 'fewer than 0.1%';
  if (percent > 99.9) return 'more than 99.9%';
  const rounded = Number(percent.toPrecision(2));
  // From 99.5 up, two figures would read "100%", so one decimal place is kept.
  if (rounded >= 100) return `${percent.toFixed(1)}%`;
  if (rounded >= 10) return `${rounded.toFixed(0)}%`;
  return `${rounded.toFixed(rounded >= 1 ? 1 : 2)}%`;
}

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** What the diagram says about a gas's speeds and the molecules faster than a threshold. */
export function speedReadout(gas: Gas, temperature: number, speed: number): string {
  const peak = Math.round(mostProbableSpeed(gas, temperature));
  const share = capitalized(formatPercent(fractionFaster(gas, temperature, speed)));
  return (
    `${gas.name} at ${temperature} K: the most probable speed is ${peak} m/s. ` +
    `${share} of the molecules are faster than ${speed} m/s.`
  );
}

/** What the diagram says about kinetic energies and the molecules above a threshold. */
export function energyReadout(temperature: number, energy: number): string {
  const share = capitalized(formatPercent(fractionAbove(temperature, energy)));
  return (
    `At ${temperature} K, every gas has the same spread of kinetic energies. ` +
    `${share} of the molecules have more than ${energy} kJ/mol.`
  );
}

/**
 * How a curve is named beside it in the drawing. An energy curve is the same
 * for every gas, so naming the gas chosen would suggest that it matters.
 */
export function curveLabel(curve: Curve): string {
  return `${curve.kind === 'speed' ? curve.gas.name : 'any gas'}, ${curve.temperature} K`;
}

/** How the comparison curve is named in the drawing. */
export function referenceLabel(kind: Curve['kind']): string {
  return `${curveLabel(referenceCurve(kind))}, to compare`;
}

/**
 * The drawing in words, for its accessible name. It says what is drawn and
 * how the chosen curve compares with the dashed one. The numbers are in the
 * readout, which is announced when it changes; repeating them here would
 * have a screen reader say everything twice.
 */
export function describeDrawing(curve: Curve): string {
  const reference = referenceCurve(curve.kind);
  const dashed =
    'the dashed comparison curve for ' +
    (curve.kind === 'speed' ? `${GASES[REFERENCE.gas].name} at ${REFERENCE.temperature} K` : `${REFERENCE.temperature} K`);
  const shape =
    curve.kind === 'speed'
      ? 'Graph of the fraction of molecules against molecular speed. ' +
        `The solid curve, for ${curve.gas.name} at ${curve.temperature} K, rises from zero to a peak at the ` +
        'most probable speed, marked with a dot, and trails off in a long tail toward high speeds.'
      : 'Graph of the fraction of molecules against kinetic energy. ' +
        `The solid curve, for any gas at ${curve.temperature} K, rises steeply to a peak at low energy ` +
        'and trails off in a long tail toward high energies.';
  // The area under every curve is the same, so a peak farther right is also lower.
  const shift = peakOf(curve).x - peakOf(reference).x;
  let comparison: string;
  if (shift === 0) {
    comparison = `It lies on ${dashed}.`;
  } else {
    const change = shift > 0 ? 'lower and broader, with its peak farther right' : 'taller and narrower, with its peak farther left';
    comparison = `Compared with ${dashed}, it is ${change}.`;
  }
  return `${shape} ${comparison} The area under the solid curve to the right of the threshold is shaded.`;
}
