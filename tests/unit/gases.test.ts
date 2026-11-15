import { describe, expect, it } from 'vitest';
import {
  AXES,
  ENERGY_AXIS_MAX,
  GASES,
  R,
  REFERENCE,
  SPEED_AXIS_MAX,
  TEMPERATURE,
  curveLabel,
  curvePoints,
  densityAt,
  describeDrawing,
  energyDensity,
  energyReadout,
  erfc,
  formatPercent,
  fractionAbove,
  fractionFaster,
  mostProbableSpeed,
  peakOf,
  referenceCurve,
  referenceLabel,
  speedDensity,
  speedReadout,
  tallestPeak,
  type CurvePoint,
  type Gas,
} from '../../src/lib/gases';

const { ch4, n2, co2 } = GASES;
const ALL_GASES: readonly Gas[] = Object.values(GASES);
const ALL_TEMPERATURES: number[] = [];
for (let t = TEMPERATURE.min; t <= TEMPERATURE.max; t += TEMPERATURE.step) ALL_TEMPERATURES.push(t);

/** The expected values each come with a tolerance; toBeCloseTo only takes a number of digits. */
function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(Math.abs(actual - expected), `${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(
    tolerance,
  );
}

/** Area under a curve by the trapezoid rule. */
function areaUnder(density: (x: number) => number, from: number, to: number, steps: number): number {
  const width = (to - from) / steps;
  let area = (density(from) + density(to)) / 2;
  for (let i = 1; i < steps; i++) area += density(from + i * width);
  return area * width;
}

function highest(points: readonly CurvePoint[]): CurvePoint {
  const first = points[0];
  if (!first) throw new Error('no points');
  return points.reduce((best, p) => (p.density > best.density ? p : best), first);
}

/** The molar kinetic energy, in kJ/mol, of molecules of a gas moving at v m/s: ½Mv². */
const kineticEnergy = (gas: Gas, v: number) => ((gas.molarMass / 1000) * v * v) / 2 / 1000;

describe('gas data and ranges', () => {
  it('has methane, nitrogen and carbon dioxide with their molar masses in g/mol', () => {
    expect(ALL_GASES.map((g) => [g.id, g.name, g.molarMass])).toEqual([
      ['ch4', 'CH₄', 16.043],
      ['n2', 'N₂', 28.014],
      ['co2', 'CO₂', 44.009],
    ]);
  });

  it("uses the equation sheet's gas constant", () => {
    expect(R).toBe(8.314);
  });

  it('offers 200 K to 600 K in steps of 50 K, starting at 300 K', () => {
    expect(TEMPERATURE).toEqual({ min: 200, max: 600, step: 50, start: 300 });
  });

  it('compares every curve with nitrogen at 300 K', () => {
    expect(REFERENCE).toEqual({ gas: 'n2', temperature: 300 });
  });

  it('runs the speed axis to 2000 m/s, with a threshold in steps of 50 that starts at 600 m/s', () => {
    expect(SPEED_AXIS_MAX).toBe(2000);
    expect(AXES.speed).toEqual({
      max: 2000,
      ticks: [0, 500, 1000, 1500, 2000],
      thresholdStep: 50,
      thresholdStart: 600,
      curveStep: 10,
    });
  });

  it('runs the energy axis to 30 kJ/mol, with a threshold in steps of 1 that starts at 10 kJ/mol', () => {
    expect(ENERGY_AXIS_MAX).toBe(30);
    expect(AXES.energy).toEqual({
      max: 30,
      ticks: [0, 10, 20, 30],
      thresholdStep: 1,
      thresholdStart: 10,
      curveStep: 0.125,
    });
  });

  it('leaves under 1 percent of the molecules of every offered curve beyond the ends of the axes', () => {
    for (const temperature of ALL_TEMPERATURES) {
      for (const gas of ALL_GASES) {
        expect(fractionFaster(gas, temperature, SPEED_AXIS_MAX), `${gas.name} at ${temperature} K`).toBeLessThan(0.01);
      }

      expect(fractionAbove(temperature, ENERGY_AXIS_MAX), `${temperature} K`).toBeLessThan(0.01);
    }
  });
});

describe('erfc', () => {
  it.each([
    [0.5, 0.4795001],
    [1.0, 0.1572992],
    [2.0, 0.0046777],
  ])('erfc(%d) is %d', (x, expected) => {
    expectWithin(erfc(x), expected, 2e-7);
  });

  it('is 1 at zero', () => {
    expectWithin(erfc(0), 1, 2e-7);
  });

  // An independent value: 1 minus the Taylor series of erf,
  // (2/√π) Σ (−1)ⁿ x²ⁿ⁺¹ / (n! (2n+1)). Sixty terms are far more than 3 needs.
  it('stays within 1.5e-7 of the true value from 0 to 3, the accuracy its formula promises', () => {
    const erfBySeries = (x: number) => {
      let power = x;
      let factorial = 1;
      let sum = x;
      for (let n = 1; n < 60; n++) {
        power *= -x * x;
        factorial *= n;
        sum += power / (factorial * (2 * n + 1));
      }
      return (2 / Math.sqrt(Math.PI)) * sum;
    };
    expectWithin(1 - erfBySeries(0.5), 0.4795001222, 1e-10);

    for (let step = 0; step <= 60; step++) {
      const x = step * 0.05;
      expectWithin(erfc(x), 1 - erfBySeries(x), 1.5e-7);
    }
  });

  it('mirrors about 1 for a negative number: erfc(-x) = 2 - erfc(x)', () => {
    expectWithin(erfc(-0.5), 2 - 0.4795001, 2e-7);
  });

  it('rejects a number that is not finite, naming it', () => {
    expect(() => erfc(Number.NaN)).toThrow(/finite.*NaN/);
    expect(() => erfc(Number.POSITIVE_INFINITY)).toThrow(/finite.*Infinity/);
  });
});

describe('mostProbableSpeed', () => {
  it.each([
    { gas: n2, temperature: 300, expected: 421.98 },
    { gas: ch4, temperature: 600, expected: 788.59 },
    { gas: co2, temperature: 200, expected: 274.89 },
  ])('$gas.name at $temperature K: $expected m/s', ({ gas, temperature, expected }) => {
    expectWithin(mostProbableSpeed(gas, temperature), expected, 0.01);
  });

  it('is 558, 422 and 337 m/s, to the nearest m/s, for methane, nitrogen and carbon dioxide at 300 K', () => {
    expect(ALL_GASES.map((gas) => Math.round(mostProbableSpeed(gas, 300)))).toEqual([558, 422, 337]);
  });

  it('rejects a temperature outside 200 K to 600 K, naming the value and the range', () => {
    for (const temperature of [199, 601, 0, -300, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => mostProbableSpeed(n2, temperature), String(temperature)).toThrow(RangeError);
    }
    expect(() => mostProbableSpeed(n2, 199)).toThrow('from 200 K to 600 K, not 199 K');
    expect(() => mostProbableSpeed(n2, 601)).toThrow('from 200 K to 600 K, not 601 K');
  });

  it('rejects a gas whose molar mass is not a positive number, naming it', () => {
    expect(() => mostProbableSpeed({ ...ch4, molarMass: 0 }, 300)).toThrow('above 0 g/mol, not 0 g/mol');
    expect(() => mostProbableSpeed({ ...ch4, molarMass: Number.NaN }, 300)).toThrow(RangeError);
  });
});

describe('speedDensity', () => {
  it('gives the height of the nitrogen curve at its peak at 300 K', () => {
    expectWithin(speedDensity(n2, 300, 421.98), 1.967422e-3, 1e-8);
  });

  it('has an area of 1 under the whole curve: all the molecules', () => {
    const area = areaUnder((v) => speedDensity(n2, 300, v), 0, SPEED_AXIS_MAX, 2000);

    expectWithin(area, 1.0, 1e-4);
  });

  it('is zero at zero speed', () => {
    expect(speedDensity(n2, 300, 0)).toBe(0);
  });

  it('is highest at the most probable speed', () => {
    for (const gas of ALL_GASES) {
      const peak = mostProbableSpeed(gas, 300);

      expect(speedDensity(gas, 300, peak)).toBeGreaterThan(speedDensity(gas, 300, peak - 1));
      expect(speedDensity(gas, 300, peak)).toBeGreaterThan(speedDensity(gas, 300, peak + 1));
    }
  });

  it('rejects a speed outside 0 to 2000 m/s, naming the value and the range', () => {
    for (const speed of [-1, 2001, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => speedDensity(n2, 300, speed), String(speed)).toThrow(RangeError);
    }
    expect(() => speedDensity(n2, 300, -1)).toThrow('from 0 m/s to 2000 m/s, not -1 m/s');
    expect(() => speedDensity(n2, 300, 2001)).toThrow('from 0 m/s to 2000 m/s, not 2001 m/s');
  });

  it('rejects a temperature outside its range and a molar mass that is not positive', () => {
    expect(() => speedDensity(n2, 50, 600)).toThrow('from 200 K to 600 K, not 50 K');
    expect(() => speedDensity({ ...n2, molarMass: -28 }, 300, 600)).toThrow('above 0 g/mol, not -28 g/mol');
  });
});

describe('the speed curve', () => {
  it('moves its peak right and lower as the temperature rises', () => {
    const peaks = [200, 300, 450, 600].map((temperature) =>
      highest(curvePoints({ kind: 'speed', gas: n2, temperature })),
    );

    for (let i = 1; i < peaks.length; i++) {
      const cooler = peaks[i - 1];
      const warmer = peaks[i];
      if (!cooler || !warmer) throw new Error('missing a peak');
      expect(warmer.x).toBeGreaterThan(cooler.x);
      expect(warmer.density).toBeLessThan(cooler.density);
    }
  });

  it('moves its peak left and higher as the molar mass grows', () => {
    const [light, middle, heavy] = [ch4, n2, co2].map((gas) => highest(curvePoints({ kind: 'speed', gas, temperature: 300 })));
    if (!light || !middle || !heavy) throw new Error('missing a peak');

    expect(middle.x).toBeLessThan(light.x);
    expect(heavy.x).toBeLessThan(middle.x);
    expect(middle.density).toBeGreaterThan(light.density);
    expect(heavy.density).toBeGreaterThan(middle.density);
  });
});

describe('energyDensity', () => {
  it('peaks at half of RT: 1.2471 kJ/mol at 300 K', () => {
    let peak = { energy: 0, density: 0 };
    for (let energy = 0; energy <= 5; energy += 0.0005) {
      const density = energyDensity(300, energy);
      if (density > peak.density) peak = { energy, density };
    }

    expectWithin(peak.energy, 1.2471, 0.001);
    expectWithin((R * 300) / 1000 / 2, 1.2471, 0.00001);
  });

  it('has an area of 1 under the whole curve', () => {
    const area = areaUnder((energy) => energyDensity(300, energy), 0, ENERGY_AXIS_MAX, 30_000);

    expectWithin(area, 1.0, 1e-4);
  });

  it('is zero at zero energy', () => {
    expect(energyDensity(300, 0)).toBe(0);
  });

  // The function takes no gas. This checks that it should not: the speed
  // curve of each gas, redrawn against kinetic energy (E = ½Mv², so
  // dE = Mv dv), is this one curve.
  it('is the same curve for every gas: each speed curve, redrawn against kinetic energy, lands on it', () => {
    for (const gas of ALL_GASES) {
      for (const temperature of [200, 300, 600]) {
        for (const fraction of [0.3, 1, 1.7]) {
          const v = fraction * mostProbableSpeed(gas, temperature);
          const perKilojoule = speedDensity(gas, temperature, v) / (((gas.molarMass / 1000) * v) / 1000);

          const density = energyDensity(temperature, kineticEnergy(gas, v));

          expect(density / perKilojoule, `${gas.name} at ${temperature} K, ${v} m/s`).toBeCloseTo(1, 9);
        }
      }
    }
  });

  it('moves its peak right and lower as the temperature rises', () => {
    const cool = highest(curvePoints({ kind: 'energy', temperature: 300 }));
    const warm = highest(curvePoints({ kind: 'energy', temperature: 600 }));

    expect(warm.x).toBeGreaterThan(cool.x);
    expect(warm.density).toBeLessThan(cool.density);
  });

  it('rejects an energy outside 0 to 30 kJ/mol, naming the value and the range', () => {
    for (const energy of [-1, 30.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => energyDensity(300, energy), String(energy)).toThrow(RangeError);
    }
    expect(() => energyDensity(300, -1)).toThrow('from 0 kJ/mol to 30 kJ/mol, not -1 kJ/mol');
    expect(() => energyDensity(300, 30.5)).toThrow('from 0 kJ/mol to 30 kJ/mol, not 30.5 kJ/mol');
  });

  it('rejects a temperature outside its range', () => {
    expect(() => energyDensity(1050, 10)).toThrow('from 200 K to 600 K, not 1050 K');
  });
});

describe('fractionFaster', () => {
  it.each([
    { gas: n2, temperature: 300, speed: 600, expected: 0.256816 },
    { gas: n2, temperature: 600, speed: 600, expected: 0.567915 },
    { gas: co2, temperature: 300, speed: 600, expected: 0.095684 },
    { gas: ch4, temperature: 300, speed: 600, expected: 0.509546 },
    { gas: ch4, temperature: 600, speed: 2000, expected: 0.00494 },
  ])('$gas.name at $temperature K, faster than $speed m/s: $expected', ({ gas, temperature, speed, expected }) => {
    expectWithin(fractionFaster(gas, temperature, speed), expected, 1e-6);
  });

  it('is the area under the speed curve beyond the threshold', () => {
    const area = areaUnder((v) => speedDensity(n2, 300, v), 600, SPEED_AXIS_MAX, 1400);

    expectWithin(fractionFaster(n2, 300, 600), area, 1e-5);
  });

  it('is every molecule at a threshold of zero', () => {
    expectWithin(fractionFaster(n2, 300, 0), 1, 2e-7);
  });

  // The approximation of erfc is off by up to 1.5e-7 either way, which must
  // not carry a fraction past all of the molecules.
  it('never exceeds 1 and never increases as the threshold rises', () => {
    for (const gas of ALL_GASES) {
      for (const temperature of [200, 300, 600]) {
        let previous = 1;
        for (let speed = 0; speed <= SPEED_AXIS_MAX; speed += 10) {
          const fraction = fractionFaster(gas, temperature, speed);

          expect(fraction, `${gas.name} at ${temperature} K, ${speed} m/s`).toBeLessThanOrEqual(previous);
          expect(fraction).toBeGreaterThanOrEqual(0);
          previous = fraction;
        }
      }
    }
  });

  it('rejects a speed, a temperature or a molar mass outside its range', () => {
    expect(() => fractionFaster(n2, 300, 2050)).toThrow('from 0 m/s to 2000 m/s, not 2050 m/s');
    expect(() => fractionFaster(n2, 300, -50)).toThrow('from 0 m/s to 2000 m/s, not -50 m/s');
    expect(() => fractionFaster(n2, 1100, 600)).toThrow('from 200 K to 600 K, not 1100 K');
    expect(() => fractionFaster({ ...n2, molarMass: 0 }, 300, 600)).toThrow('above 0 g/mol, not 0 g/mol');
  });
});

describe('fractionAbove', () => {
  it.each([
    [300, 10, 0.045629],
    [600, 10, 0.260461],
    [600, 30, 0.007288],
  ])('at %d K, more than %d kJ/mol: %d', (temperature, energy, expected) => {
    expectWithin(fractionAbove(temperature, energy), expected, 1e-6);
  });

  // The energy axis stops at 30 kJ/mol, where the curve at 300 K has not
  // quite run out, so the area is taken between two thresholds.
  it('differs between two thresholds by the area under the energy curve between them', () => {
    const area = areaUnder((energy) => energyDensity(300, energy), 10, ENERGY_AXIS_MAX, 20_000);

    expectWithin(fractionAbove(300, 10) - fractionAbove(300, ENERGY_AXIS_MAX), area, 1e-5);
  });

  it('is the same for every gas: the molecules faster than v are the ones with more than ½Mv²', () => {
    for (const gas of ALL_GASES) {
      const v = 1.3 * mostProbableSpeed(gas, 300);

      const above = fractionAbove(300, kineticEnergy(gas, v));

      expect(above, gas.name).toBeCloseTo(fractionFaster(gas, 300, v), 9);
    }
  });

  it('is every molecule at a threshold of zero, and never more', () => {
    expectWithin(fractionAbove(300, 0), 1, 2e-7);
    for (let energy = 0; energy <= 1; energy += 0.001) expect(fractionAbove(600, energy)).toBeLessThanOrEqual(1);
  });

  it('rejects an energy or a temperature outside its range', () => {
    expect(() => fractionAbove(300, 51)).toThrow('from 0 kJ/mol to 30 kJ/mol, not 51 kJ/mol');
    expect(() => fractionAbove(300, -1)).toThrow('from 0 kJ/mol to 30 kJ/mol, not -1 kJ/mol');
    expect(() => fractionAbove(Number.NaN, 10)).toThrow('from 200 K to 600 K, not NaN K');
  });
});

describe('peakOf', () => {
  it('is at the most probable speed for a speed curve', () => {
    const peak = peakOf({ kind: 'speed', gas: n2, temperature: 300 });

    expectWithin(peak.x, 421.98, 0.01);
    expectWithin(peak.density, 1.967422e-3, 1e-8);
  });

  it('is at half of RT for an energy curve', () => {
    const peak = peakOf({ kind: 'energy', temperature: 300 });

    expectWithin(peak.x, 1.2471, 0.00001);
    expect(peak.density).toBe(energyDensity(300, peak.x));
  });
});

describe('densityAt', () => {
  it('is the speed density of the gas for a speed curve', () => {
    expect(densityAt({ kind: 'speed', gas: ch4, temperature: 600 }, 1000)).toBe(speedDensity(ch4, 600, 1000));
  });

  it('is the energy density for an energy curve', () => {
    expect(densityAt({ kind: 'energy', temperature: 500 }, 10)).toBe(energyDensity(500, 10));
  });

  it('rejects a point beyond the end of the axis', () => {
    expect(() => densityAt({ kind: 'energy', temperature: 500 }, 600)).toThrow('from 0 kJ/mol to 30 kJ/mol, not 600 kJ/mol');
  });
});

describe('curveLabel', () => {
  it('names the gas and the temperature of a speed curve', () => {
    expect(curveLabel({ kind: 'speed', gas: co2, temperature: 450 })).toBe('CO₂, 450 K');
  });

  // The energy curve is the same for every gas, so its name must not single one out.
  it('says "any gas" for an energy curve', () => {
    expect(curveLabel({ kind: 'energy', temperature: 450 })).toBe('any gas, 450 K');
  });
});

describe('referenceLabel', () => {
  it('names nitrogen at 300 K in the speed view', () => {
    expect(referenceLabel('speed')).toBe('N₂, 300 K, to compare');
  });

  it('says "any gas" at 300 K in the energy view', () => {
    expect(referenceLabel('energy')).toBe('any gas, 300 K, to compare');
  });
});

describe('referenceCurve', () => {
  it('is the speed curve of nitrogen at 300 K', () => {
    expect(referenceCurve('speed')).toEqual({ kind: 'speed', gas: n2, temperature: 300 });
  });

  it('is the energy curve at 300 K, which has no gas', () => {
    expect(referenceCurve('energy')).toEqual({ kind: 'energy', temperature: 300 });
  });
});

describe('tallestPeak', () => {
  it('is the peak of carbon dioxide at 200 K for the speed curves, and no offered curve is higher', () => {
    const tallest = tallestPeak('speed');

    expectWithin(tallest, 3.020135e-3, 1e-8);
    for (const gas of ALL_GASES) {
      for (const temperature of ALL_TEMPERATURES) {
        const top = highest(curvePoints({ kind: 'speed', gas, temperature })).density;
        expect(top, `${gas.name} at ${temperature} K`).toBeLessThanOrEqual(tallest);
      }
    }
  });

  it('is the peak at 200 K for the energy curves, and no offered curve is higher', () => {
    const tallest = tallestPeak('energy');

    expectWithin(tallest, 0.29104, 1e-5);
    for (const temperature of ALL_TEMPERATURES) {
      const top = highest(curvePoints({ kind: 'energy', temperature })).density;
      expect(top, `${temperature} K`).toBeLessThanOrEqual(tallest);
    }
  });
});

describe('curvePoints', () => {
  const curves = [
    { name: 'speed', curve: { kind: 'speed', gas: n2, temperature: 300 }, max: SPEED_AXIS_MAX },
    { name: 'energy', curve: { kind: 'energy', temperature: 300 }, max: ENERGY_AXIS_MAX },
  ] as const;

  for (const { name, curve, max } of curves) {
    it(`gives about 200 points of the ${name} curve, in order, from zero to the end of the axis`, () => {
      const points = curvePoints(curve);

      expect(points.length).toBeGreaterThanOrEqual(200);
      expect(points.length).toBeLessThanOrEqual(245);
      expect(points[0]).toEqual({ x: 0, density: 0 });
      expect(points.at(-1)?.x).toBe(max);
      for (let i = 1; i < points.length; i++) {
        const before = points[i - 1];
        const point = points[i];
        if (!before || !point) throw new Error('missing a point');
        expect(point.x).toBeGreaterThan(before.x);
      }
    });

    // The peak is drawn exactly, wherever the steps fall.
    it(`includes the peak of the ${name} curve`, () => {
      const peak = peakOf(curve);

      expect(highest(curvePoints(curve))).toEqual(peak);
    });

    // So the shaded region starts on a drawn point of the curve.
    it(`includes every threshold the ${name} slider offers`, () => {
      const drawn = new Set(curvePoints(curve).map((p) => p.x));

      for (let threshold = 0; threshold <= max; threshold += AXES[name].thresholdStep) {
        expect(drawn.has(threshold), String(threshold)).toBe(true);
      }
    });
  }

  it('follows the gas and the temperature it is given', () => {
    const points = curvePoints({ kind: 'speed', gas: ch4, temperature: 600 });

    const at1000 = points.find((p) => p.x === 1000);

    expect(at1000?.density).toBe(speedDensity(ch4, 600, 1000));
  });

  it('rejects a temperature outside its range', () => {
    expect(() => curvePoints({ kind: 'speed', gas: n2, temperature: 1200 })).toThrow('from 200 K to 600 K, not 1200 K');
    expect(() => curvePoints({ kind: 'energy', temperature: 0 })).toThrow('from 200 K to 600 K, not 0 K');
  });
});

describe('formatPercent', () => {
  it.each([
    [0.256816, '26%'],
    [0.901501, '90%'],
    [0.045629, '4.6%'],
    [0.04, '4.0%'],
    [0.007258, '0.73%'],
    [0.0011, '0.11%'],
    [0.9903, '99%'],
    // Beside the places where the number of decimals changes.
    [0.00995, '1.0%'],
    [0.00996, '1.0%'],
    [0.00999, '1.0%'],
    [0.0996, '10%'],
    [0.9949, '99%'],
  ])('writes %d with two significant figures: %s', (fraction, expected) => {
    expect(formatPercent(fraction)).toBe(expected);
  });

  it('says "fewer than 0.1%" below 0.1 percent, never "0%"', () => {
    expect(formatPercent(0.00099)).toBe('fewer than 0.1%');
    expect(formatPercent(0)).toBe('fewer than 0.1%');
  });

  it('says "more than 99.9%" above 99.9 percent, never "100%"', () => {
    expect(formatPercent(0.99911)).toBe('more than 99.9%');
    expect(formatPercent(1)).toBe('more than 99.9%');
  });

  it('draws the lower line at 0.1 percent: 0.0999 percent is below it, 0.1 percent is not', () => {
    expect(formatPercent(0.000999)).toBe('fewer than 0.1%');
    expect(formatPercent(0.001)).toBe('0.10%');
    expect(formatPercent(0.001001)).toBe('0.10%');
  });

  it('draws the upper line at 99.9 percent: 99.9 percent is not above it, 99.901 percent is', () => {
    expect(formatPercent(0.999)).toBe('99.9%');
    expect(formatPercent(0.99901)).toBe('more than 99.9%');
  });

  // Two significant figures would round these to "100%".
  it('keeps one decimal place from 99.5 to 99.9 percent', () => {
    expect(formatPercent(0.995)).toBe('99.5%');
    expect(formatPercent(0.9951)).toBe('99.5%');
    expect(formatPercent(0.9976)).toBe('99.8%');
    expect(formatPercent(0.9989)).toBe('99.9%');
  });

  it('rejects a fraction outside 0 to 1, naming it', () => {
    expect(() => formatPercent(1.01)).toThrow('from 0 to 1, not 1.01');
    expect(() => formatPercent(-0.2)).toThrow('from 0 to 1, not -0.2');
    expect(() => formatPercent(Number.NaN)).toThrow(RangeError);
  });
});

describe('speedReadout', () => {
  it('gives the most probable speed and the share of faster molecules for the starting state', () => {
    expect(speedReadout(n2, 300, 600)).toBe(
      'N₂ at 300 K: the most probable speed is 422 m/s. 26% of the molecules are faster than 600 m/s.',
    );
  });

  it('uses the gas, the temperature and the threshold it is given', () => {
    expect(speedReadout(ch4, 600, 600)).toBe(
      'CH₄ at 600 K: the most probable speed is 789 m/s. 76% of the molecules are faster than 600 m/s.',
    );
    expect(speedReadout(co2, 300, 600)).toBe(
      'CO₂ at 300 K: the most probable speed is 337 m/s. 9.6% of the molecules are faster than 600 m/s.',
    );
  });

  it('says "Fewer than 0.1%" when almost no molecule is that fast', () => {
    expect(speedReadout(n2, 300, 1400)).toBe(
      'N₂ at 300 K: the most probable speed is 422 m/s. Fewer than 0.1% of the molecules are faster than 1400 m/s.',
    );
  });

  it('says "More than 99.9%" when almost every molecule is that fast', () => {
    expect(speedReadout(ch4, 600, 50)).toBe(
      'CH₄ at 600 K: the most probable speed is 789 m/s. More than 99.9% of the molecules are faster than 50 m/s.',
    );
    expect(speedReadout(n2, 300, 0)).toContain('More than 99.9% of the molecules are faster than 0 m/s.');
  });

  it('never says "100%" just under the upper limit', () => {
    expect(speedReadout(ch4, 600, 100)).toContain('99.8% of the molecules are faster than 100 m/s.');
  });

  it('rejects a speed or a temperature outside its range', () => {
    expect(() => speedReadout(n2, 300, 6000)).toThrow('from 0 m/s to 2000 m/s, not 6000 m/s');
    expect(() => speedReadout(n2, 2000, 600)).toThrow('from 200 K to 600 K, not 2000 K');
  });
});

describe('energyReadout', () => {
  it('says every gas has the same spread, and the share of molecules above the threshold, for the starting state', () => {
    expect(energyReadout(300, 10)).toBe(
      'At 300 K, every gas has the same spread of kinetic energies. 4.6% of the molecules have more than 10 kJ/mol.',
    );
  });

  it('uses the temperature and the threshold it is given', () => {
    expect(energyReadout(600, 10)).toBe(
      'At 600 K, every gas has the same spread of kinetic energies. 26% of the molecules have more than 10 kJ/mol.',
    );
    expect(energyReadout(300, 20)).toContain('0.11% of the molecules have more than 20 kJ/mol.');
  });

  it('says "Fewer than 0.1%" when almost no molecule has that much energy', () => {
    expect(energyReadout(300, 30)).toBe(
      'At 300 K, every gas has the same spread of kinetic energies. Fewer than 0.1% of the molecules have more than 30 kJ/mol.',
    );
  });

  it('says "More than 99.9%" when almost every molecule has that much energy', () => {
    expect(energyReadout(300, 0)).toBe(
      'At 300 K, every gas has the same spread of kinetic energies. More than 99.9% of the molecules have more than 0 kJ/mol.',
    );
  });

  it('rejects an energy or a temperature outside its range', () => {
    expect(() => energyReadout(300, 60)).toThrow('from 0 kJ/mol to 30 kJ/mol, not 60 kJ/mol');
    expect(() => energyReadout(50, 10)).toThrow('from 200 K to 600 K, not 50 K');
  });
});

describe('describeDrawing', () => {
  const SPEED_START =
    'Graph of the fraction of molecules against molecular speed. The solid curve, for N₂ at 300 K, rises from zero ' +
    'to a peak at the most probable speed, marked with a dot, and trails off in a long tail toward high speeds. ';
  const SHADED = ' The area under the solid curve to the right of the threshold is shaded.';

  it('says the chosen speed curve lies on the comparison curve when both are nitrogen at 300 K', () => {
    expect(describeDrawing({ kind: 'speed', gas: n2, temperature: 300 })).toBe(
      `${SPEED_START}It lies on the dashed comparison curve for N₂ at 300 K.${SHADED}`,
    );
  });

  it('says a faster speed curve is lower and broader, with its peak farther right', () => {
    const lowerAndRight = 'Compared with the dashed comparison curve for N₂ at 300 K, it is lower and broader, with its peak farther right.';

    expect(describeDrawing({ kind: 'speed', gas: n2, temperature: 500 })).toBe(
      `${SPEED_START.replace('300 K', '500 K')}${lowerAndRight}${SHADED}`,
    );
    expect(describeDrawing({ kind: 'speed', gas: ch4, temperature: 300 })).toContain(`for CH₄ at 300 K, rises`);
    expect(describeDrawing({ kind: 'speed', gas: ch4, temperature: 300 })).toContain(lowerAndRight);
  });

  it('says a slower speed curve is taller and narrower, with its peak farther left', () => {
    const tallerAndLeft = 'Compared with the dashed comparison curve for N₂ at 300 K, it is taller and narrower, with its peak farther left.';

    expect(describeDrawing({ kind: 'speed', gas: n2, temperature: 200 })).toContain(tallerAndLeft);
    expect(describeDrawing({ kind: 'speed', gas: co2, temperature: 300 })).toContain(tallerAndLeft);
  });

  it('describes an energy curve as the curve of any gas, compared with 300 K', () => {
    const start = (temperature: number) =>
      'Graph of the fraction of molecules against kinetic energy. ' +
      `The solid curve, for any gas at ${temperature} K, rises steeply to a peak at low energy ` +
      'and trails off in a long tail toward high energies. ';

    expect(describeDrawing({ kind: 'energy', temperature: 300 })).toBe(
      `${start(300)}It lies on the dashed comparison curve for 300 K.${SHADED}`,
    );
    expect(describeDrawing({ kind: 'energy', temperature: 600 })).toBe(
      `${start(600)}Compared with the dashed comparison curve for 300 K, it is lower and broader, with its peak farther right.${SHADED}`,
    );
    expect(describeDrawing({ kind: 'energy', temperature: 200 })).toBe(
      `${start(200)}Compared with the dashed comparison curve for 300 K, it is taller and narrower, with its peak farther left.${SHADED}`,
    );
  });

  it('rejects a temperature outside its range', () => {
    expect(() => describeDrawing({ kind: 'energy', temperature: 5000 })).toThrow('from 200 K to 600 K, not 5000 K');
  });
});
