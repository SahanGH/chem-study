/**
 * How much light a solution of a dye absorbs, by the Beer–Lambert law
 * A = εbc, for the absorbance diagram in lesson 3.13. No DOM here, so it is
 * testable directly.
 *
 * Wavelengths are in nm, path lengths in cm, concentrations in mol/L and
 * molar absorptivities in L/(mol·cm). An absorbance has no unit.
 *
 * The range checks are the diagram's ranges, not physical limits: a function
 * here throws for a wavelength, a cell or a concentration the diagram cannot
 * show. A second user of these formulas would need the checks moved out to
 * the diagram first.
 */
import { formatQuantity } from './format';

// The dye is made up for illustration: no real substance is meant. It has a
// single band, ε(λ) = ε_max e^(−(λ − λ_max)²/2σ²), tabulated to three
// significant figures. Because the dye is made up, its values can be chosen,
// and they are chosen so that the numbers a student sees multiply to the
// absorbance shown: the readout gives ε with all three of its figures, and
// every absorbance, slope and drawn point is computed from that same value.
// Computed from the band's unrounded value, many states showed an ε, a b and
// a c whose product was not the absorbance beside them.
export const DYE = {
  /** ε_max, in L/(mol·cm). */
  maxAbsorptivity: 2.0e4,
  /** λ_max, the wavelength of maximum absorbance, in nm. */
  peakWavelength: 520,
  /** σ, in nm: how far from the peak ε has fallen to e^(−1/2) of ε_max, about 61 percent. */
  bandWidth: 40,
} as const;

/** How many significant figures the dye's molar absorptivity is tabulated to, and shown with. */
const ABSORPTIVITY_FIGURES = 3;

/** The wavelengths the diagram offers, in nm: the visible range. */
export const WAVELENGTH = { min: 400, max: 700, step: 5, start: 520 } as const;

/** The range of concentrations the diagram takes, in mol/L. */
export const CONCENTRATION = { min: 0, max: 5.0e-5 } as const;

// The concentration slider counts in units of 10⁻⁵ mol/L. Its values, 0 to 5
// in halves, are exact in binary, and one division turns each into the
// nearest number to its concentration. Adding up steps of 0.000005 drifts
// instead, and a sum a hair above 5.0 × 10⁻⁵ would be out of range. The step
// and the starting concentration are stated here only: 0.5 × 10⁻⁵ and
// 3.0 × 10⁻⁵ mol/L.
export const CONCENTRATION_SLIDER = { min: 0, max: 5, step: 0.5, start: 3 } as const;
const SLIDER_UNITS_PER_MOLE_PER_LITER = 1e5;

/** The cells the diagram offers, by path length in cm. */
export const PATH_LENGTHS = [1, 2] as const;
export type PathLength = (typeof PATH_LENGTHS)[number];
export const PATH_LENGTH_START: PathLength = 1;

// Both graphs share this axis, so the 2 cm cell's steeper line is seen as
// steeper. The largest absorbance the controls reach is exactly this: 520 nm,
// 2 cm, 5.0 × 10⁻⁵ mol/L.
export const ABSORBANCE_AXIS_MAX = 2;

export interface SpectrumPoint {
  /** In nm. */
  readonly wavelength: number;
  readonly absorbance: number;
}

interface Range {
  readonly min: number;
  readonly max: number;
}

function assertInRange(value: number, range: Range, what: string, unit?: string): void {
  const written = (quantity: number) => (unit === undefined ? String(quantity) : `${quantity} ${unit}`);
  // Written so that NaN fails too: every comparison with NaN is false.
  if (!(value >= range.min && value <= range.max)) {
    throw new RangeError(
      `The ${what} must be from ${written(range.min)} to ${written(range.max)}, not ${written(value)}.`,
    );
  }
}

const assertWavelength = (wavelength: number) => assertInRange(wavelength, WAVELENGTH, 'wavelength', 'nm');
const assertConcentration = (concentration: number) =>
  assertInRange(concentration, CONCENTRATION, 'concentration', 'mol/L');

function assertPathLength(pathLength: number): void {
  if (!PATH_LENGTHS.some((offered) => offered === pathLength)) {
    const offered = PATH_LENGTHS.map((length) => `${length} cm`).join(' or ');
    throw new RangeError(`The path length must be ${offered}, not ${pathLength} cm.`);
  }
}

/** The concentration, in mol/L, at a value of the concentration slider. */
export function concentrationFromSlider(value: number): number {
  assertInRange(value, CONCENTRATION_SLIDER, 'concentration slider');
  return value / SLIDER_UNITS_PER_MOLE_PER_LITER;
}

/**
 * Whether a solution has any dye in it. With none, its spectrum lies along
 * the axis, so the drawing and its description name no peak.
 */
export function hasDye(concentration: number): boolean {
  assertConcentration(concentration);
  return concentration > 0;
}

/** ε at a wavelength, in L/(mol·cm): how strongly the dye absorbs light of that wavelength. */
export function molarAbsorptivity(wavelength: number): number {
  assertWavelength(wavelength);
  const fromPeak = wavelength - DYE.peakWavelength;
  const band = DYE.maxAbsorptivity * Math.exp(-(fromPeak * fromPeak) / (2 * DYE.bandWidth * DYE.bandWidth));
  // The tabulated value: see the note on DYE.
  return Number(band.toPrecision(ABSORPTIVITY_FIGURES));
}

/** The slope of the calibration line, εb, in L/mol. */
export function slope(wavelength: number, pathLength: number): number {
  assertPathLength(pathLength);
  return molarAbsorptivity(wavelength) * pathLength;
}

/** The Beer–Lambert law, A = εbc. */
export function absorbance(wavelength: number, pathLength: number, concentration: number): number {
  assertConcentration(concentration);
  return slope(wavelength, pathLength) * concentration;
}

/**
 * The absorption spectrum of one solution in one cell, for drawing: one point
 * for each wavelength the slider offers, 61 of them. The curve passes only
 * through the dye's tabulated values, so the dot at the chosen wavelength is
 * always on a drawn point. A point between two of them would round onto a
 * neighbor (517.5 nm and 522.5 nm both round to the peak's 20000) and level
 * the top of the curve.
 */
export function spectrumPoints(pathLength: number, concentration: number): SpectrumPoint[] {
  const steps = Math.round((WAVELENGTH.max - WAVELENGTH.min) / WAVELENGTH.step);
  return Array.from({ length: steps + 1 }, (_, step) => {
    const wavelength = WAVELENGTH.min + step * WAVELENGTH.step;
    return { wavelength, absorbance: absorbance(wavelength, pathLength, concentration) };
  });
}

/**
 * An absorbance with two decimal places, the way a spectrophotometer shows
 * it, with a tie rounded up, the way a student rounds.
 */
export function formatAbsorbance(value: number): string {
  assertInRange(value, { min: 0, max: ABSORBANCE_AXIS_MAX }, 'absorbance');
  // With ε tabulated, some states the controls reach are exact ties, such as
  // 12100 × 1 × 5.0 × 10⁻⁵ = 0.605. Binary floating point stores some of them
  // a hair under the tie, and toFixed alone would print those one hundredth
  // low. Twelve figures keep every real digit and drop that hair.
  const hundredths = Math.round(Number((value * 100).toPrecision(12)));
  return (hundredths / 100).toFixed(2);
}

/**
 * A molar absorptivity with its three significant figures: "1.65 × 10⁴",
 * and below 10 the number itself, "6.71". A molar absorptivity is above
 * zero, so anything else is refused here; formatQuantity does the writing.
 */
export function formatThreeFigures(value: number): string {
  if (!(Number.isFinite(value) && value > 0)) {
    throw new RangeError(`Three significant figures need a finite number above 0, not ${value}.`);
  }
  return formatQuantity(value, ABSORPTIVITY_FIGURES);
}

/** A concentration with two significant figures: "3.0 × 10⁻⁵ M". */
export function formatConcentration(concentration: number): string {
  assertConcentration(concentration);
  return `${formatQuantity(concentration)} M`;
}

/** What the diagram says about the chosen wavelength, cell and solution. */
export function readout(wavelength: number, pathLength: number, concentration: number): string {
  const reading = formatAbsorbance(absorbance(wavelength, pathLength, concentration));
  return (
    `At ${wavelength} nm in a ${pathLength} cm cell, ε = ${formatThreeFigures(molarAbsorptivity(wavelength))} L/(mol·cm). ` +
    `A ${formatConcentration(concentration)} solution has an absorbance of ${reading}.`
  );
}

/**
 * The absorption spectrum in words, for its accessible name. With no dye the
 * curve is flat, so nothing is said about a peak that is not in the picture.
 */
export function describeSpectrum(wavelength: number, pathLength: number, concentration: number): string {
  assertWavelength(wavelength);
  const peak = DYE.peakWavelength;
  const top = absorbance(peak, pathLength, concentration);
  const graph =
    `Graph of absorbance against wavelength, from ${WAVELENGTH.min} nm to ${WAVELENGTH.max} nm, ` +
    `for a ${formatConcentration(concentration)} solution in a ${pathLength} cm cell.`;
  const chosen = `A vertical line and a dot mark the chosen wavelength, ${wavelength} nm`;
  if (!hasDye(concentration)) {
    return `${graph} With no dye in the solution, the curve lies along the wavelength axis. ${chosen}.`;
  }
  let place = 'at the top of the peak';
  if (wavelength < peak) place = 'to the left of the peak';
  if (wavelength > peak) place = 'to the right of the peak';
  return (
    `${graph} The curve is a single peak. Its top, at ${peak} nm, is labeled as the wavelength of maximum ` +
    `absorbance; the absorbance there is ${formatAbsorbance(top)}. ${chosen}, ${place}.`
  );
}

/**
 * The calibration line in words, for its accessible name. Like the label in
 * the drawing, it states the slope as εb and gives no value: in the 2 cm cell
 * εb can need four figures (6.71 × 2 = 13.42), so a value written like ε,
 * with three, would not always multiply out. The readout gives ε and b.
 */
export function describeCalibration(wavelength: number, pathLength: number, concentration: number): string {
  assertWavelength(wavelength);
  assertPathLength(pathLength);
  const peak = DYE.peakWavelength;
  const steepness =
    wavelength === peak
      ? `The line is at its steepest for this cell, because ${peak} nm is the wavelength of maximum absorbance.`
      : `The line is less steep than at ${peak} nm, the wavelength of maximum absorbance.`;
  return (
    `Graph of absorbance against concentration, from ${formatConcentration(CONCENTRATION.min)} to ` +
    `${formatConcentration(CONCENTRATION.max)}, at ${wavelength} nm in a ${pathLength} cm cell. ` +
    `A straight line starts at the origin; its slope is εb. ${steepness} ` +
    `A dot on the line marks the chosen concentration, ${formatConcentration(concentration)}.`
  );
}
