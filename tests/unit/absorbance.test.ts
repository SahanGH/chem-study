import { describe, expect, it } from 'vitest';
import {
  ABSORBANCE_AXIS_MAX,
  CONCENTRATION,
  CONCENTRATION_SLIDER,
  DYE,
  PATH_LENGTHS,
  PATH_LENGTH_START,
  WAVELENGTH,
  absorbance,
  concentrationFromSlider,
  describeCalibration,
  describeSpectrum,
  formatAbsorbance,
  formatConcentration,
  formatThreeFigures,
  hasDye,
  molarAbsorptivity,
  readout,
  slope,
  spectrumPoints,
} from '../../src/lib/absorbance';

const ALL_WAVELENGTHS: number[] = [];
for (let w = WAVELENGTH.min; w <= WAVELENGTH.max; w += WAVELENGTH.step) ALL_WAVELENGTHS.push(w);
// Written out, not computed: the concentrations the slider must reach, exactly.
const ALL_CONCENTRATIONS = [0, 0.5e-5, 1.0e-5, 1.5e-5, 2.0e-5, 2.5e-5, 3.0e-5, 3.5e-5, 4.0e-5, 4.5e-5, 5.0e-5];
const ALL_SLIDER_VALUES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const NOT_NUMBERS = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

/** The expected values each come with a tolerance; toBeCloseTo only takes a number of digits. */
function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(Math.abs(actual - expected), `${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(
    tolerance,
  );
}

/** Every state the controls can reach: 61 wavelengths, 2 cells, 11 concentrations. */
function everyState(): { wavelength: number; pathLength: number; concentration: number }[] {
  return ALL_WAVELENGTHS.flatMap((wavelength) =>
    PATH_LENGTHS.flatMap((pathLength) =>
      ALL_CONCENTRATIONS.map((concentration) => ({ wavelength, pathLength, concentration })),
    ),
  );
}

describe('the dye and the ranges', () => {
  it('has one band: 2.0 × 10⁴ L/(mol·cm) at 520 nm, 40 nm wide', () => {
    expect(DYE).toEqual({ maxAbsorptivity: 2.0e4, peakWavelength: 520, bandWidth: 40 });
  });

  it('offers 400 nm to 700 nm in steps of 5 nm, starting at 520 nm', () => {
    expect(WAVELENGTH).toEqual({ min: 400, max: 700, step: 5, start: 520 });
    expect(ALL_WAVELENGTHS).toHaveLength(61);
  });

  // The steps and the start are the slider's, stated once: see "concentrationFromSlider".
  it('takes concentrations from 0 to 5.0 × 10⁻⁵ mol/L', () => {
    expect(CONCENTRATION).toEqual({ min: 0, max: 5.0e-5 });
  });

  it('offers a 1 cm and a 2 cm cell, starting with 1 cm', () => {
    expect(PATH_LENGTHS).toEqual([1, 2]);
    expect(PATH_LENGTH_START).toBe(1);
  });

  it('runs the absorbance axis to 2.0', () => {
    expect(ABSORBANCE_AXIS_MAX).toBe(2);
  });

  it('fits every state on the absorbance axis, and the top of the axis is reached', () => {
    const all = everyState().map((s) => absorbance(s.wavelength, s.pathLength, s.concentration));

    expect(all).toHaveLength(1342);
    for (const value of all) expect(value).toBeLessThanOrEqual(ABSORBANCE_AXIS_MAX);
    expect(Math.max(...all)).toBe(2);
  });
});

describe('molarAbsorptivity', () => {
  // The dye's values are tabulated to three significant figures, so each is exact.
  it.each([
    [520, 20000],
    [515, 19800],
    [525, 19800],
    [450, 4330],
    [600, 2710],
    [400, 222],
    [480, 12100],
    [560, 12100],
    [495, 16500],
    [500, 17600],
    [675, 11],
    [680, 6.71],
    [695, 1.4],
    [700, 0.801],
  ])('at %d nm: exactly %d L/(mol·cm)', (wavelength, expected) => {
    expect(molarAbsorptivity(wavelength)).toBe(expected);
  });

  it('has three significant figures at every wavelength the slider offers', () => {
    for (const wavelength of ALL_WAVELENGTHS) {
      const value = molarAbsorptivity(wavelength);

      expect(Number(value.toPrecision(3)), `${wavelength} nm`).toBe(value);
    }
  });

  // The band itself, written out here from the dye's three constants.
  it('stays within half a percent of the band ε_max e^(−(λ − λ_max)²/2σ²) at every wavelength the slider offers', () => {
    for (const wavelength of ALL_WAVELENGTHS) {
      const band = 2.0e4 * Math.exp(-((wavelength - 520) ** 2) / (2 * 40 ** 2));

      const value = molarAbsorptivity(wavelength);

      expect(Math.abs(value - band) / band, `${wavelength} nm`).toBeLessThan(0.005);
    }
  });

  it('is exactly the largest value at 520 nm', () => {
    expect(molarAbsorptivity(520)).toBe(20000);
  });

  it('is the same at equal distances either side of 520 nm', () => {
    for (let distance = 5; distance <= 120; distance += 5) {
      expect(molarAbsorptivity(520 - distance), `${distance} nm away`).toBe(molarAbsorptivity(520 + distance));
    }
  });

  it('falls steadily on both sides of 520 nm', () => {
    for (const wavelength of ALL_WAVELENGTHS) {
      if (wavelength === 520) continue;
      const nearer = wavelength < 520 ? wavelength + WAVELENGTH.step : wavelength - WAVELENGTH.step;

      expect(molarAbsorptivity(wavelength), `${wavelength} nm`).toBeLessThan(molarAbsorptivity(nearer));
    }
  });

  it('is never zero or negative: the band thins out but does not end', () => {
    for (const wavelength of ALL_WAVELENGTHS) expect(molarAbsorptivity(wavelength)).toBeGreaterThan(0);
  });

  // The range check is on the range, not on the slider's steps. 19960.98 on
  // the band is 20000 to three significant figures.
  it('takes any wavelength in the range, not only the steps of the slider', () => {
    expect(molarAbsorptivity(522.5)).toBe(20000);
  });

  it('rejects a wavelength outside 400 nm to 700 nm, naming the value and the range', () => {
    for (const wavelength of [399, 701, 0, -520, ...NOT_NUMBERS]) {
      expect(() => molarAbsorptivity(wavelength), String(wavelength)).toThrow(RangeError);
    }
    expect(() => molarAbsorptivity(399)).toThrow('from 400 nm to 700 nm, not 399 nm');
    expect(() => molarAbsorptivity(701)).toThrow('from 400 nm to 700 nm, not 701 nm');
    expect(() => molarAbsorptivity(Number.NaN)).toThrow('from 400 nm to 700 nm, not NaN nm');
  });
});

describe('absorbance', () => {
  // Each is the tabulated ε times b times c, an exact decimal; the tolerance
  // is for binary floating point only.
  it.each([
    { wavelength: 520, pathLength: 1, concentration: 3.0e-5, expected: 0.6 },
    { wavelength: 520, pathLength: 2, concentration: 3.0e-5, expected: 1.2 },
    { wavelength: 450, pathLength: 1, concentration: 3.0e-5, expected: 0.1299 },
    { wavelength: 450, pathLength: 2, concentration: 3.0e-5, expected: 0.2598 },
    { wavelength: 450, pathLength: 1, concentration: 1.5e-5, expected: 0.06495 },
    { wavelength: 600, pathLength: 2, concentration: 5.0e-5, expected: 0.271 },
    { wavelength: 560, pathLength: 1, concentration: 3.0e-5, expected: 0.363 },
    { wavelength: 560, pathLength: 2, concentration: 3.0e-5, expected: 0.726 },
    { wavelength: 520, pathLength: 1, concentration: 4.0e-5, expected: 0.8 },
    { wavelength: 495, pathLength: 2, concentration: 5.0e-5, expected: 1.65 },
    { wavelength: 400, pathLength: 2, concentration: 5.0e-5, expected: 0.0222 },
    { wavelength: 700, pathLength: 2, concentration: 5.0e-5, expected: 0.0000801 },
  ])(
    'at $wavelength nm in a $pathLength cm cell, $concentration mol/L: $expected',
    ({ wavelength, pathLength, concentration, expected }) => {
      expectWithin(absorbance(wavelength, pathLength, concentration), expected, 1e-12);
    },
  );

  it('is proportional to concentration: doubling it doubles the absorbance', () => {
    for (const wavelength of [400, 450, 520, 600, 700]) {
      for (const pathLength of PATH_LENGTHS) {
        for (const concentration of [0.5e-5, 1.0e-5, 2.5e-5]) {
          const single = absorbance(wavelength, pathLength, concentration);

          const doubled = absorbance(wavelength, pathLength, 2 * concentration);

          expect(doubled / single, `${wavelength} nm, ${pathLength} cm, ${concentration} mol/L`).toBeCloseTo(2, 12);
        }
      }
    }
  });

  it('is proportional to path length: the 2 cm cell doubles the absorbance', () => {
    for (const wavelength of ALL_WAVELENGTHS) {
      const thin = absorbance(wavelength, 1, 3.0e-5);

      const thick = absorbance(wavelength, 2, 3.0e-5);

      expect(thick / thin, `${wavelength} nm`).toBeCloseTo(2, 12);
    }
  });

  it('is exactly zero at zero concentration, at every wavelength and in both cells', () => {
    for (const wavelength of ALL_WAVELENGTHS) {
      for (const pathLength of PATH_LENGTHS) expect(absorbance(wavelength, pathLength, 0)).toBe(0);
    }
  });

  it('rejects a wavelength outside 400 nm to 700 nm', () => {
    expect(() => absorbance(395, 1, 3.0e-5)).toThrow('from 400 nm to 700 nm, not 395 nm');
    expect(() => absorbance(705, 1, 3.0e-5)).toThrow('from 400 nm to 700 nm, not 705 nm');
  });

  it('rejects a path length that is not 1 cm or 2 cm, naming the value and the choices', () => {
    for (const pathLength of [0, 1.5, 3, -1, ...NOT_NUMBERS]) {
      expect(() => absorbance(520, pathLength, 3.0e-5), String(pathLength)).toThrow(RangeError);
    }
    expect(() => absorbance(520, 3, 3.0e-5)).toThrow('must be 1 cm or 2 cm, not 3 cm');
    expect(() => absorbance(520, 0, 3.0e-5)).toThrow('must be 1 cm or 2 cm, not 0 cm');
  });

  it('rejects a concentration outside 0 to 5.0 × 10⁻⁵ mol/L, naming the value and the range', () => {
    for (const concentration of [-0.5e-5, 5.5e-5, 1, ...NOT_NUMBERS]) {
      expect(() => absorbance(520, 1, concentration), String(concentration)).toThrow(RangeError);
    }
    expect(() => absorbance(520, 1, 6.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not 0.00006 mol/L');
    expect(() => absorbance(520, 1, -1.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not -0.00001 mol/L');
  });
});

describe('slope', () => {
  it('is largest at 520 nm, of every wavelength the slider offers, in either cell', () => {
    for (const pathLength of PATH_LENGTHS) {
      const slopes = ALL_WAVELENGTHS.map((wavelength) => slope(wavelength, pathLength));

      expect(slope(520, pathLength)).toBe(Math.max(...slopes));
      expect(slopes.filter((value) => value === slope(520, pathLength))).toHaveLength(1);
    }
  });

  it.each([
    [520, 1, 20000],
    [520, 2, 40000],
    [450, 1, 4330],
    [450, 2, 8660],
    [600, 1, 2710],
    [560, 2, 24200],
    [400, 2, 444],
    [680, 2, 13.42],
    [700, 2, 1.602],
  ])('at %d nm in a %d cm cell: %d L/mol', (wavelength, pathLength, expected) => {
    expectWithin(slope(wavelength, pathLength), expected, 1e-9);
  });

  it('is the molar absorptivity times the path length', () => {
    expect(slope(450, 1)).toBe(molarAbsorptivity(450));
    expect(slope(450, 2)).toBe(2 * molarAbsorptivity(450));
  });

  it('rejects a wavelength or a path length outside its range', () => {
    expect(() => slope(710, 1)).toThrow('from 400 nm to 700 nm, not 710 nm');
    expect(() => slope(520, 4)).toThrow('must be 1 cm or 2 cm, not 4 cm');
    expect(() => slope(Number.NaN, 1)).toThrow(RangeError);
    expect(() => slope(520, Number.NaN)).toThrow(RangeError);
  });
});

describe('concentrationFromSlider', () => {
  it('counts the slider in units of 10⁻⁵ mol/L: 0 to 5 in steps of 0.5, starting at 3', () => {
    expect(CONCENTRATION_SLIDER).toEqual({ min: 0, max: 5, step: 0.5, start: 3 });
  });

  // Exactly, with toBe: a concentration a hair above 5.0 × 10⁻⁵ would be out of range.
  it('gives each offered concentration exactly, with no floating-point drift', () => {
    expect(ALL_SLIDER_VALUES.map(concentrationFromSlider)).toEqual(ALL_CONCENTRATIONS);
  });

  it("reaches both ends of the concentration range at the slider's ends", () => {
    expect(concentrationFromSlider(CONCENTRATION_SLIDER.min)).toBe(CONCENTRATION.min);
    expect(concentrationFromSlider(CONCENTRATION_SLIDER.max)).toBe(CONCENTRATION.max);
  });

  it('starts at 3.0 × 10⁻⁵ mol/L and moves in steps of 0.5 × 10⁻⁵ mol/L', () => {
    expect(concentrationFromSlider(CONCENTRATION_SLIDER.start)).toBe(3.0e-5);
    expect(concentrationFromSlider(CONCENTRATION_SLIDER.step)).toBe(0.5e-5);
  });

  it('rejects a slider value outside 0 to 5, naming the value and the range', () => {
    for (const value of [-0.5, 5.5, 30, ...NOT_NUMBERS]) {
      expect(() => concentrationFromSlider(value), String(value)).toThrow(RangeError);
    }
    expect(() => concentrationFromSlider(5.5)).toThrow('from 0 to 5, not 5.5');
    expect(() => concentrationFromSlider(-0.5)).toThrow('from 0 to 5, not -0.5');
  });
});

describe('spectrumPoints', () => {
  // The curve passes only through the dye's tabulated values. A point between
  // two of them would round onto a neighbor (517.5 nm and 522.5 nm both round
  // to the peak's 20000) and level the top of the curve.
  it('gives one point for each wavelength the slider offers, in order: 61 of them, 400 nm to 700 nm every 5 nm', () => {
    const points = spectrumPoints(1, 3.0e-5);

    expect(points).toHaveLength(61);
    expect(points.map((p) => p.wavelength)).toEqual(ALL_WAVELENGTHS);
    expect(points.map((p) => p.wavelength)).toEqual(Array.from({ length: 61 }, (_, i) => 400 + 5 * i));
  });

  // The tabulated ε times 2 cm times 4.5 × 10⁻⁵ mol/L, worked out apart from the module.
  it.each([
    [400, 0.01998],
    [450, 0.3897],
    [520, 1.8],
    [600, 0.2439],
    [700, 0.00007209],
  ])('puts the point at %d nm at an absorbance of %d, for a 4.5 × 10⁻⁵ mol/L solution in the 2 cm cell', (wavelength, expected) => {
    const point = spectrumPoints(2, 4.5e-5).find((p) => p.wavelength === wavelength);

    if (!point) throw new Error(`no point at ${wavelength} nm`);
    expectWithin(point.absorbance, expected, 1e-12);
  });

  it('is highest at 520 nm, and nowhere else as high: 0.60 for the starting solution and cell', () => {
    const points = spectrumPoints(1, 3.0e-5);
    const first = points[0];
    if (!first) throw new Error('no points');

    const top = points.reduce((best, p) => (p.absorbance > best.absorbance ? p : best), first);

    expect(top.wavelength).toBe(520);
    expectWithin(top.absorbance, 0.6, 1e-12);
    expect(points.filter((p) => p.absorbance === top.absorbance)).toHaveLength(1);
  });

  it('rises all the way to 520 nm and falls all the way from it, with no level stretch, in both cells', () => {
    for (const pathLength of PATH_LENGTHS) {
      const points = spectrumPoints(pathLength, 5.0e-5);

      for (let i = 1; i < points.length; i++) {
        const before = points[i - 1];
        const point = points[i];
        if (!before || !point) throw new Error('missing a point');
        if (point.wavelength <= 520) expect(point.absorbance, `${point.wavelength} nm`).toBeGreaterThan(before.absorbance);
        else expect(point.absorbance, `${point.wavelength} nm`).toBeLessThan(before.absorbance);
      }
    }
  });

  it('lies along the axis at zero concentration', () => {
    const points = spectrumPoints(2, 0);

    expect(points).toHaveLength(61);
    expect(points.every((p) => p.absorbance === 0)).toBe(true);
  });

  it('rejects a path length or a concentration outside its range', () => {
    expect(() => spectrumPoints(5, 3.0e-5)).toThrow('must be 1 cm or 2 cm, not 5 cm');
    expect(() => spectrumPoints(1, 7.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not 0.00007 mol/L');
  });
});

describe('formatAbsorbance', () => {
  it.each([
    [0.6, '0.60'],
    [1.2, '1.20'],
    [0.129759, '0.13'],
    [0.06488, '0.06'],
    [0.363918, '0.36'],
    [0, '0.00'],
    [2, '2.00'],
  ])('writes %d with two decimal places: %s', (value, expected) => {
    expect(formatAbsorbance(value)).toBe(expected);
  });

  it.each([
    [0.0049, '0.00'],
    [0.0051, '0.01'],
    [0.5949, '0.59'],
    [0.5951, '0.60'],
    [0.9949, '0.99'],
    [0.9951, '1.00'],
    [1.9949, '1.99'],
    [1.9951, '2.00'],
  ])('rounds %d to the nearest hundredth: %s', (value, expected) => {
    expect(formatAbsorbance(value)).toBe(expected);
  });

  // 0.125 and 0.375 are exact in binary, so these are true ties.
  it('rounds a tie up', () => {
    expect(formatAbsorbance(0.125)).toBe('0.13');
    expect(formatAbsorbance(0.375)).toBe('0.38');
  });

  // 0.605, 0.495, 1.155 and 1.005 are not exact in binary: each is stored a
  // hair under the tie, and would print one hundredth low.
  it('rounds a tie up even where binary floating point stores it just under the tie', () => {
    expect(formatAbsorbance(0.605)).toBe('0.61');
    expect(formatAbsorbance(0.495)).toBe('0.50');
    expect(formatAbsorbance(1.155)).toBe('1.16');
    expect(formatAbsorbance(1.005)).toBe('1.01');
  });

  // With ε tabulated to three figures, some states the controls reach are
  // exact ties. A student who multiplies the numbers shown and rounds half
  // up must get what the readout says.
  it.each([
    { wavelength: 480, pathLength: 1, concentration: 5.0e-5, exact: '0.605', expected: '0.61' },
    { wavelength: 480, pathLength: 2, concentration: 2.5e-5, exact: '0.605', expected: '0.61' },
    { wavelength: 545, pathLength: 1, concentration: 3.0e-5, exact: '0.495', expected: '0.50' },
    { wavelength: 495, pathLength: 2, concentration: 3.5e-5, exact: '1.155', expected: '1.16' },
    { wavelength: 445, pathLength: 2, concentration: 5.0e-5, exact: '0.345', expected: '0.35' },
    { wavelength: 475, pathLength: 1, concentration: 2.5e-5, exact: '0.265', expected: '0.27' },
  ])(
    'rounds the tie at $wavelength nm, $pathLength cm, $concentration mol/L ($exact) up: $expected',
    ({ wavelength, pathLength, concentration, expected }) => {
      expect(formatAbsorbance(absorbance(wavelength, pathLength, concentration))).toBe(expected);
    },
  );

  it('writes the top of the peak as a round number at every concentration, whatever the floating-point noise', () => {
    const thin = ALL_CONCENTRATIONS.map((c) => formatAbsorbance(absorbance(520, 1, c)));
    const thick = ALL_CONCENTRATIONS.map((c) => formatAbsorbance(absorbance(520, 2, c)));

    expect(thin).toEqual(['0.00', '0.10', '0.20', '0.30', '0.40', '0.50', '0.60', '0.70', '0.80', '0.90', '1.00']);
    expect(thick).toEqual(['0.00', '0.20', '0.40', '0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00']);
  });

  it('rejects an absorbance outside 0 to 2, naming the value and the range', () => {
    for (const value of [-0.01, 2.01, ...NOT_NUMBERS]) {
      expect(() => formatAbsorbance(value), String(value)).toThrow(RangeError);
    }
    expect(() => formatAbsorbance(2.5)).toThrow('from 0 to 2, not 2.5');
    expect(() => formatAbsorbance(-0.1)).toThrow('from 0 to 2, not -0.1');
  });
});

describe('hasDye', () => {
  it('is false for a solution with no dye in it', () => {
    expect(hasDye(0)).toBe(false);
  });

  it('is true for every other concentration the slider offers', () => {
    for (const concentration of ALL_CONCENTRATIONS.slice(1)) expect(hasDye(concentration), String(concentration)).toBe(true);
  });

  // The two things that follow from "no dye" agree with it: a flat spectrum and no peak in its description.
  it('is false exactly when the spectrum is flat and its description names no peak', () => {
    for (const concentration of ALL_CONCENTRATIONS) {
      const flat = spectrumPoints(1, concentration).every((p) => p.absorbance === 0);
      const namesPeak = describeSpectrum(520, 1, concentration).includes('peak');

      expect(hasDye(concentration), String(concentration)).toBe(!flat);
      expect(hasDye(concentration), String(concentration)).toBe(namesPeak);
    }
  });

  it('rejects a concentration outside its range', () => {
    expect(() => hasDye(-1.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not -0.00001 mol/L');
    expect(() => hasDye(6.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not 0.00006 mol/L');
    expect(() => hasDye(Number.NaN)).toThrow(RangeError);
  });
});

describe('formatThreeFigures', () => {
  it.each([
    [20000, '2.00 × 10⁴'],
    [19800, '1.98 × 10⁴'],
    [4330, '4.33 × 10³'],
    [222, '2.22 × 10²'],
    [11, '1.10 × 10¹'],
    [6.71, '6.71'],
    [1.4, '1.40'],
    [0.801, '0.801'],
  ])('writes %d as %s', (value, expected) => {
    expect(formatThreeFigures(value)).toBe(expected);
  });

  it('rounds a fourth figure away', () => {
    expect(formatThreeFigures(13.42)).toBe('1.34 × 10¹');
    expect(formatThreeFigures(1.602)).toBe('1.60');
    expect(formatThreeFigures(24261.2)).toBe('2.43 × 10⁴');
  });

  it('chooses the notation after rounding: 9.994 is written plainly, 9.996 as a power of ten', () => {
    expect(formatThreeFigures(9.994)).toBe('9.99');
    expect(formatThreeFigures(9.996)).toBe('1.00 × 10¹');
    expect(formatThreeFigures(10)).toBe('1.00 × 10¹');
  });

  it('writes a number below 0.01 as a power of ten, with a true minus sign', () => {
    expect(formatThreeFigures(0.0123)).toBe('0.0123');
    expect(formatThreeFigures(0.00456)).toBe('4.56 × 10⁻³');
    expect(formatThreeFigures(0.00456)).toContain('⁻');
  });

  it('rejects a number that is not above zero, naming it', () => {
    for (const value of [0, -1, ...NOT_NUMBERS]) {
      expect(() => formatThreeFigures(value), String(value)).toThrow(RangeError);
    }
    expect(() => formatThreeFigures(0)).toThrow('a finite number above 0, not 0');
    expect(() => formatThreeFigures(-20000)).toThrow('a finite number above 0, not -20000');
  });
});

describe('formatConcentration', () => {
  it('writes each offered concentration with two significant figures, as a power of ten', () => {
    expect(ALL_CONCENTRATIONS.map(formatConcentration)).toEqual([
      '0 M',
      '5.0 × 10⁻⁶ M',
      '1.0 × 10⁻⁵ M',
      '1.5 × 10⁻⁵ M',
      '2.0 × 10⁻⁵ M',
      '2.5 × 10⁻⁵ M',
      '3.0 × 10⁻⁵ M',
      '3.5 × 10⁻⁵ M',
      '4.0 × 10⁻⁵ M',
      '4.5 × 10⁻⁵ M',
      '5.0 × 10⁻⁵ M',
    ]);
  });

  it('uses a true multiplication sign and a superscript minus, never a letter x or a hyphen', () => {
    const text = formatConcentration(3.0e-5);

    expect(text).toContain('×');
    expect(text).toContain('⁻⁵');
    expect(text).not.toMatch(/[x*^-]|e-/);
  });

  it('writes what the slider gives, at every one of its values', () => {
    expect(formatConcentration(concentrationFromSlider(3))).toBe('3.0 × 10⁻⁵ M');
    expect(formatConcentration(concentrationFromSlider(3.5))).toBe('3.5 × 10⁻⁵ M');
    expect(formatConcentration(concentrationFromSlider(0.5))).toBe('5.0 × 10⁻⁶ M');
  });

  it('rejects a concentration outside its range', () => {
    expect(() => formatConcentration(5.5e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not 0.000055 mol/L');
    expect(() => formatConcentration(Number.NaN)).toThrow(RangeError);
  });
});

describe('readout', () => {
  it('gives the wavelength, the cell, the molar absorptivity, the concentration and the absorbance for the starting state', () => {
    expect(readout(520, 1, 3.0e-5)).toBe(
      'At 520 nm in a 1 cm cell, ε = 2.00 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.60.',
    );
  });

  it.each([
    [520, 2, 3.0e-5, 'At 520 nm in a 2 cm cell, ε = 2.00 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 1.20.'],
    [560, 1, 3.0e-5, 'At 560 nm in a 1 cm cell, ε = 1.21 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.36.'],
    [480, 1, 3.0e-5, 'At 480 nm in a 1 cm cell, ε = 1.21 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.36.'],
    [520, 1, 4.0e-5, 'At 520 nm in a 1 cm cell, ε = 2.00 × 10⁴ L/(mol·cm). A 4.0 × 10⁻⁵ M solution has an absorbance of 0.80.'],
    [450, 2, 1.5e-5, 'At 450 nm in a 2 cm cell, ε = 4.33 × 10³ L/(mol·cm). A 1.5 × 10⁻⁵ M solution has an absorbance of 0.13.'],
    [600, 2, 5.0e-5, 'At 600 nm in a 2 cm cell, ε = 2.71 × 10³ L/(mol·cm). A 5.0 × 10⁻⁵ M solution has an absorbance of 0.27.'],
    [545, 1, 3.0e-5, 'At 545 nm in a 1 cm cell, ε = 1.65 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.50.'],
    [500, 1, 3.0e-5, 'At 500 nm in a 1 cm cell, ε = 1.76 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.53.'],
    [495, 2, 5.0e-5, 'At 495 nm in a 2 cm cell, ε = 1.65 × 10⁴ L/(mol·cm). A 5.0 × 10⁻⁵ M solution has an absorbance of 1.65.'],
    [505, 2, 4.5e-5, 'At 505 nm in a 2 cm cell, ε = 1.86 × 10⁴ L/(mol·cm). A 4.5 × 10⁻⁵ M solution has an absorbance of 1.67.'],
  ])('uses the wavelength, the cell and the concentration it is given: %d nm, %d cm, %d mol/L', (wavelength, pathLength, concentration, expected) => {
    expect(readout(wavelength, pathLength, concentration)).toBe(expected);
  });

  it('writes the ends of the range: 400 nm, 700 nm, no dye and the top of the axis', () => {
    expect(readout(400, 1, 3.0e-5)).toBe(
      'At 400 nm in a 1 cm cell, ε = 2.22 × 10² L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.01.',
    );
    expect(readout(700, 1, 3.0e-5)).toBe(
      'At 700 nm in a 1 cm cell, ε = 0.801 L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.00.',
    );
    expect(readout(520, 1, 0)).toBe(
      'At 520 nm in a 1 cm cell, ε = 2.00 × 10⁴ L/(mol·cm). A 0 M solution has an absorbance of 0.00.',
    );
    expect(readout(520, 2, 5.0e-5)).toBe(
      'At 520 nm in a 2 cm cell, ε = 2.00 × 10⁴ L/(mol·cm). A 5.0 × 10⁻⁵ M solution has an absorbance of 2.00.',
    );
  });

  it('writes a concentration below 1.0 × 10⁻⁵ with its own power of ten', () => {
    expect(readout(520, 1, 0.5e-5)).toBe(
      'At 520 nm in a 1 cm cell, ε = 2.00 × 10⁴ L/(mol·cm). A 5.0 × 10⁻⁶ M solution has an absorbance of 0.10.',
    );
  });

  // From 10 up a molar absorptivity is a power of ten; below 10 a lesson
  // writes the number itself, not "6.71 × 10⁰". The change falls between
  // 675 nm (11.0) and 680 nm (6.71).
  it('writes a molar absorptivity below 10 as a plain number, still with three significant figures', () => {
    expect(readout(675, 1, 3.0e-5)).toBe(
      'At 675 nm in a 1 cm cell, ε = 1.10 × 10¹ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.00.',
    );
    expect(readout(680, 1, 3.0e-5)).toBe(
      'At 680 nm in a 1 cm cell, ε = 6.71 L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.00.',
    );
    expect(readout(695, 2, 5.0e-5)).toBe(
      'At 695 nm in a 2 cm cell, ε = 1.40 L/(mol·cm). A 5.0 × 10⁻⁵ M solution has an absorbance of 0.00.',
    );
  });

  it('changes one step either side of the peak, by the same amount on both sides', () => {
    expect(readout(525, 1, 3.0e-5)).toBe(
      'At 525 nm in a 1 cm cell, ε = 1.98 × 10⁴ L/(mol·cm). A 3.0 × 10⁻⁵ M solution has an absorbance of 0.59.',
    );
    expect(readout(515, 1, 3.0e-5)).toBe(readout(525, 1, 3.0e-5).replace('525', '515'));
  });

  it('never prints NaN, Infinity or an e-notation number in any state the controls can reach', () => {
    for (const { wavelength, pathLength, concentration } of everyState()) {
      const text = readout(wavelength, pathLength, concentration);

      expect(text).toMatch(
        /^At \d{3} nm in a [12] cm cell, ε = (\d\.\d\d × 10[¹²³⁴]|\d\.\d\d|0\.\d{3}) L\/\(mol·cm\)\. A (0|\d\.\d × 10⁻[⁵⁶]) M solution has an absorbance of [012]\.\d\d\.$/,
      );
    }
  });

  // The diagram teaches A = εbc, so the three numbers a student reads must
  // multiply to the absorbance beside them. The product is worked out here in
  // whole numbers, so that nothing depends on the module's own arithmetic or
  // on binary floating point: ε in thousandths of L/(mol·cm), c in millionths
  // of mol/L, and so A in billionths.
  it('shows numbers that multiply out: in every state, the ε shown times b times c, rounded half up to two places, is the absorbance shown', () => {
    const POWERS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const SHOWN =
      /^At \d+ nm in a (\d) cm cell, ε = (\d+)(?:\.(\d+))?(?: × 10([⁰¹²³⁴⁵⁶⁷⁸⁹]))? L\/\(mol·cm\)\. A \S+(?: × 10\S+)? M solution has an absorbance of (\d)\.(\d\d)\.$/;
    const states = everyState();
    const mismatches: string[] = [];

    for (const { wavelength, pathLength, concentration } of states) {
      const text = readout(wavelength, pathLength, concentration);
      const [, cell, whole, decimals = '', power, units, hundredths] = SHOWN.exec(text) ?? [];
      if (cell === undefined || whole === undefined || units === undefined || hundredths === undefined) {
        throw new Error(`The readout is not written as expected: "${text}"`);
      }
      const exponent = power === undefined ? 0 : POWERS.indexOf(power);
      // "1.65" and ⁴ are 165 × 10^(4 − 2); in thousandths, 165 × 10^(4 − 2 + 3).
      const absorptivityInThousandths = Number(whole + decimals) * 10 ** (exponent - decimals.length + 3);
      const concentrationInMillionths = Math.round(concentration * 1e6);
      const productInBillionths = absorptivityInThousandths * Number(cell) * concentrationInMillionths;
      const roundedHalfUp = Math.floor((productInBillionths + 5e6) / 1e7);
      const shown = Number(units + hundredths);

      expect(Number.isInteger(absorptivityInThousandths), text).toBe(true);
      expect(Number(cell)).toBe(pathLength);
      expect(concentrationInMillionths / 1e6).toBe(concentration);
      if (roundedHalfUp !== shown) mismatches.push(`${text} (the numbers shown give ${(roundedHalfUp / 100).toFixed(2)})`);
    }

    expect(states).toHaveLength(1342);
    expect(mismatches, `${mismatches.length} of ${states.length} states do not multiply out`).toEqual([]);
  });

  it('rejects a wavelength, a path length or a concentration outside its range', () => {
    expect(() => readout(800, 1, 3.0e-5)).toThrow('from 400 nm to 700 nm, not 800 nm');
    expect(() => readout(520, 10, 3.0e-5)).toThrow('must be 1 cm or 2 cm, not 10 cm');
    expect(() => readout(520, 1, 3.0e-4)).toThrow('from 0 mol/L to 0.00005 mol/L, not 0.0003 mol/L');
  });
});

describe('describeSpectrum', () => {
  const START =
    'Graph of absorbance against wavelength, from 400 nm to 700 nm, for a 3.0 × 10⁻⁵ M solution in a 1 cm cell. ' +
    'The curve is a single peak. Its top, at 520 nm, is labeled as the wavelength of maximum absorbance; ' +
    'the absorbance there is 0.60. ';

  it('says the chosen wavelength is at the top of the peak for the starting state', () => {
    expect(describeSpectrum(520, 1, 3.0e-5)).toBe(
      `${START}A vertical line and a dot mark the chosen wavelength, 520 nm, at the top of the peak.`,
    );
  });

  it('says which side of the peak the chosen wavelength is on', () => {
    expect(describeSpectrum(560, 1, 3.0e-5)).toBe(
      `${START}A vertical line and a dot mark the chosen wavelength, 560 nm, to the right of the peak.`,
    );
    expect(describeSpectrum(515, 1, 3.0e-5)).toBe(
      `${START}A vertical line and a dot mark the chosen wavelength, 515 nm, to the left of the peak.`,
    );
  });

  it('gives the height of the peak for the solution and the cell chosen', () => {
    expect(describeSpectrum(520, 2, 4.5e-5)).toContain('for a 4.5 × 10⁻⁵ M solution in a 2 cm cell. ');
    expect(describeSpectrum(520, 2, 4.5e-5)).toContain('the absorbance there is 1.80. ');
  });

  // With no dye there is no peak to be on the left or the right of.
  it('says the curve lies along the axis when there is no dye, and names no peak', () => {
    expect(describeSpectrum(560, 1, 0)).toBe(
      'Graph of absorbance against wavelength, from 400 nm to 700 nm, for a 0 M solution in a 1 cm cell. ' +
        'With no dye in the solution, the curve lies along the wavelength axis. ' +
        'A vertical line and a dot mark the chosen wavelength, 560 nm.',
    );
    expect(describeSpectrum(520, 2, 0)).not.toContain('peak');
  });

  it('rejects a wavelength, a path length or a concentration outside its range', () => {
    expect(() => describeSpectrum(300, 1, 3.0e-5)).toThrow('from 400 nm to 700 nm, not 300 nm');
    expect(() => describeSpectrum(520, 3, 3.0e-5)).toThrow('must be 1 cm or 2 cm, not 3 cm');
    expect(() => describeSpectrum(520, 1, -3.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not -0.00003 mol/L');
  });
});

describe('describeCalibration', () => {
  it('says the line is at its steepest at 520 nm, for the starting state', () => {
    expect(describeCalibration(520, 1, 3.0e-5)).toBe(
      'Graph of absorbance against concentration, from 0 M to 5.0 × 10⁻⁵ M, at 520 nm in a 1 cm cell. ' +
        'A straight line starts at the origin; its slope is εb. ' +
        'The line is at its steepest for this cell, because 520 nm is the wavelength of maximum absorbance. ' +
        'A dot on the line marks the chosen concentration, 3.0 × 10⁻⁵ M.',
    );
  });

  it('says the line is less steep away from 520 nm', () => {
    expect(describeCalibration(450, 2, 1.5e-5)).toBe(
      'Graph of absorbance against concentration, from 0 M to 5.0 × 10⁻⁵ M, at 450 nm in a 2 cm cell. ' +
        'A straight line starts at the origin; its slope is εb. ' +
        'The line is less steep than at 520 nm, the wavelength of maximum absorbance. ' +
        'A dot on the line marks the chosen concentration, 1.5 × 10⁻⁵ M.',
    );
    expect(describeCalibration(525, 1, 3.0e-5)).toContain('The line is less steep than at 520 nm');
  });

  // In the 2 cm cell εb can need four figures (6.71 × 2 = 13.42), so a
  // three-figure value would not multiply out. The readout gives ε and b.
  it('names the cell and states the slope as εb, with no value, as the drawing does', () => {
    for (const { wavelength, pathLength, concentration } of everyState()) {
      const text = describeCalibration(wavelength, pathLength, concentration);

      expect(text).toContain(`at ${wavelength} nm in a ${pathLength} cm cell. `);
      expect(text).toContain('its slope is εb. ');
      expect(text).not.toContain('L/mol');
    }
  });

  it('puts the dot at 0 M when there is no dye', () => {
    expect(describeCalibration(520, 1, 0)).toContain('A dot on the line marks the chosen concentration, 0 M.');
  });

  it('rejects a wavelength, a path length or a concentration outside its range', () => {
    expect(() => describeCalibration(750, 1, 3.0e-5)).toThrow('from 400 nm to 700 nm, not 750 nm');
    expect(() => describeCalibration(520, 6, 3.0e-5)).toThrow('must be 1 cm or 2 cm, not 6 cm');
    expect(() => describeCalibration(520, 1, 9.0e-5)).toThrow('from 0 mol/L to 0.00005 mol/L, not 0.00009 mol/L');
  });
});
