import { describe, expect, it } from 'vitest';
import {
  ENERGY_AXIS,
  METAL_IDS,
  METAL_MASS,
  METAL_TEMPERATURE,
  METALS,
  START,
  WATER,
  WATER_MASS,
  barNames,
  cupReadings,
  describeBars,
  describeCup,
  massText,
  readout,
  shownEnergy,
  shownChange,
  shownHeatCapacity,
  shownTemperature,
  state,
  temperatureText,
  type MetalId,
  type Settings,
} from '../../src/lib/calorimetry';

const range = (min: number, max: number, step: number) => Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step);

const MASSES = range(50, 200, 10);
const TEMPERATURES = range(50, 100, 5);
const ALL_METALS: MetalId[] = ['titanium', 'tin', 'tungsten'];

const everyState: Settings[] = ALL_METALS.flatMap((metal) =>
  MASSES.flatMap((metalMass) =>
    TEMPERATURES.flatMap((metalTemperature) => MASSES.map((waterMass) => ({ metal, metalMass, metalTemperature, waterMass }))),
  ),
);

const settings = (metal: MetalId, metalMass: number, metalTemperature: number, waterMass: number): Settings => ({
  metal,
  metalMass,
  metalTemperature,
  waterMass,
});

// An independent exact model, in BigInt: specific heat capacities in mJ/(g·°C), temperatures in °C.
const C_MJ: Record<MetalId, bigint> = { titanium: 523n, tin: 228n, tungsten: 132n };
const WATER_MJ = 4180n;
function exact({ metal, metalMass, metalTemperature, waterMass }: Settings) {
  const cm = BigInt(metalMass) * C_MJ[metal];
  const cw = BigInt(waterMass) * WATER_MJ;
  const tm = BigInt(metalTemperature);
  // The final temperature in tenths of a degree, as a fraction; the energy in joules, as a fraction.
  const finalTenths = { n: 10n * (cm * tm + cw * 20n), d: cm + cw };
  const energy = { n: cm * cw * (tm - 20n), d: (cm + cw) * 1000n };
  return { cm, cw, finalTenths, energy };
}
const roundHalfUp = ({ n, d }: { n: bigint; d: bigint }) => Number((2n * n + d) / (2n * d));
const isTie = ({ n, d }: { n: bigint; d: bigint }) => n % d !== 0n && (2n * n) % d === 0n;

describe('the metals, the water and the sliders', () => {
  it('offers titanium, tin and tungsten, in that order', () => {
    expect(METAL_IDS).toEqual(['titanium', 'tin', 'tungsten']);
  });

  it('gives each metal its name, its label and its specific heat capacity in mJ/(g·°C)', () => {
    expect(METALS.titanium).toEqual({ name: 'titanium', label: 'Titanium (0.523 J/(g·°C))', specificHeat: 523 });
    expect(METALS.tin).toEqual({ name: 'tin', label: 'Tin (0.228 J/(g·°C))', specificHeat: 228 });
    expect(METALS.tungsten).toEqual({ name: 'tungsten', label: 'Tungsten (0.132 J/(g·°C))', specificHeat: 132 });
  });

  it('has water at 4.18 J/(g·°C), starting at 20.0 °C', () => {
    expect(WATER).toEqual({ specificHeat: 4180, startTenths: 200 });
  });

  it('has the three sliders of the brief', () => {
    expect(METAL_MASS).toEqual({ min: 50, max: 200, step: 10, start: 100 });
    expect(METAL_TEMPERATURE).toEqual({ min: 50, max: 100, step: 5, start: 80 });
    expect(WATER_MASS).toEqual({ min: 50, max: 200, step: 10, start: 100 });
  });

  it('starts with 100 g of titanium at 80 °C in 100 g of water', () => {
    expect(START).toEqual({ metal: 'titanium', metalMass: 100, metalTemperature: 80, waterMass: 100 });
  });

  it('draws the energy axis from 0 to 8,000 J in steps of 2,000', () => {
    expect(ENERGY_AXIS).toEqual({ max: 8000, step: 2000 });
  });

  it('reaches 8,448 states', () => {
    expect(everyState).toHaveLength(8448);
  });
});

describe('state, at the worked states of the brief', () => {
  it.each([
    ['titanium', 100, 80, 100, 267, 2789],
    ['tungsten', 100, 80, 100, 218, 768],
    ['tin', 100, 80, 100, 231, 1297],
    ['titanium', 100, 80, 200, 235, 2953],
    ['titanium', 200, 100, 50, 467, 5577],
    ['tungsten', 50, 50, 200, 202, 196],
    ['tin', 150, 65, 80, 242, 1396],
    ['tungsten', 200, 100, 50, 290, 1875],
    ['titanium', 50, 50, 200, 209, 761],
    ['tin', 50, 100, 150, 214, 896],
    ['tin', 50, 80, 70, 223, 658],
    ['tin', 60, 90, 180, 213, 941],
  ] as const)('%s, %s g at %s °C into %s g of water: %s tenths of a degree and %s J', (metal, mm, tm, mw, finalTenths, energy) => {
    const result = state(settings(metal, mm, tm, mw));
    expect(result.finalTenths).toBe(finalTenths);
    expect(result.energy).toBe(energy);
  });

  it('gives every part of the starting state', () => {
    expect(state(START)).toEqual({
      metalHeatCapacity: 52300,
      waterHeatCapacity: 418000,
      metalStartTenths: 800,
      waterStartTenths: 200,
      finalTenths: 267,
      energy: 2789,
      metalChangeTenths: 533,
      waterChangeTenths: 67,
      metalChangeHundredths: 5333,
      waterChangeHundredths: 667,
    });
  });

  it('rounds the two exact ties of the table half up: 22.25 °C to 22.3 and 940.5 J to 941', () => {
    const tie = exact(settings('tin', 50, 80, 70));
    expect(tie.finalTenths.n * 10n).toBe(2225n * tie.finalTenths.d);
    expect(state(settings('tin', 50, 80, 70)).finalTenths).toBe(223);

    const both = exact(settings('tin', 60, 90, 180));
    expect(both.finalTenths.n * 10n).toBe(2125n * both.finalTenths.d);
    expect(both.energy.n * 2n).toBe(1881n * both.energy.d);
    expect(state(settings('tin', 60, 90, 180))).toMatchObject({ finalTenths: 213, energy: 941 });
  });

  it.each([
    ['a metal mass off its step', settings('titanium', 55, 80, 100), /55 g/],
    ['a metal mass below its range', settings('titanium', 40, 80, 100), /50 to 200 g/],
    ['a metal mass above its range', settings('tin', 210, 80, 100), /210 g/],
    ['a temperature off its step', settings('titanium', 100, 82, 100), /82 °C/],
    ['a temperature above its range', settings('titanium', 100, 105, 100), /50 to 100 °C/],
    ['a temperature below its range', settings('titanium', 100, 45, 100), /45 °C/],
    ['a water mass off its step', settings('titanium', 100, 80, 101), /101 g/],
    ['a water mass above its range', settings('titanium', 100, 80, 250), /250 g/],
    ['NaN', settings('titanium', Number.NaN, 80, 100), /NaN/],
    ['an infinite mass', settings('titanium', 100, 80, Number.POSITIVE_INFINITY), /Infinity/],
  ])('throws a RangeError that names %s', (_what, input, message) => {
    expect(() => state(input)).toThrow(RangeError);
    expect(() => state(input)).toThrow(message);
  });

  it('names which slider is wrong', () => {
    expect(() => state(settings('titanium', 55, 80, 100))).toThrow(/mass of metal/);
    expect(() => state(settings('titanium', 100, 82, 100))).toThrow(/starting temperature of the metal/);
    expect(() => state(settings('titanium', 100, 80, 101))).toThrow(/mass of water/);
  });

  it('throws for an unknown metal, and names it and the metals to give instead', () => {
    // @ts-expect-error -- a metal the type forbids, on purpose
    expect(() => state({ ...START, metal: 'copper' })).toThrow(RangeError);
    // @ts-expect-error -- a metal the type forbids, on purpose
    expect(() => state({ ...START, metal: 'copper' })).toThrow(/titanium, tin or tungsten.*"copper"/);
  });
});

describe('over all 8,448 states', () => {
  it('gives the final temperature and the energy of the exact model, each rounded half up', () => {
    for (const input of everyState) {
      const result = state(input);
      const model = exact(input);
      expect(result.finalTenths, JSON.stringify(input)).toBe(roundHalfUp(model.finalTenths));
      expect(result.energy, JSON.stringify(input)).toBe(roundHalfUp(model.energy));
    }
  });

  it('moves exactly the energy the water gains and the metal loses, before rounding', () => {
    for (const input of everyState) {
      const { cm, cw, finalTenths, energy } = exact(input);
      const tm = BigInt(input.metalTemperature);
      // Energy in mJ times tenths: C_w (T_f − 20.0) and C_m (T_m − T_f) both equal q.
      const qTimes = energy.n * 10000n;
      const gained = cw * (finalTenths.n - 200n * finalTenths.d);
      const lost = cm * (10n * tm * finalTenths.d - finalTenths.n);
      expect(gained * energy.d, JSON.stringify(input)).toBe(qTimes * finalTenths.d);
      expect(lost * energy.d, JSON.stringify(input)).toBe(qTimes * finalTenths.d);
    }
  });

  it('takes the two temperature changes from the displayed final temperature', () => {
    for (const input of everyState) {
      const result = state(input);
      expect(result.metalChangeTenths).toBe(10 * input.metalTemperature - result.finalTenths);
      expect(result.waterChangeTenths).toBe(result.finalTenths - 200);
    }
  });

  it('gives each change in hundredths of a degree from the exact final temperature, rounded half up', () => {
    for (const input of everyState) {
      const result = state(input);
      const { finalTenths } = exact(input);
      const tm = BigInt(input.metalTemperature);
      // In hundredths: T_f is 10 n / d, so the water rose 10 n / d − 2000 and the metal fell 100 T_m − 10 n / d.
      const water = roundHalfUp({ n: 10n * finalTenths.n - 2000n * finalTenths.d, d: finalTenths.d });
      const metal = roundHalfUp({ n: 100n * tm * finalTenths.d - 10n * finalTenths.n, d: finalTenths.d });
      expect(result.waterChangeHundredths, JSON.stringify(input)).toBe(water);
      expect(result.metalChangeHundredths, JSON.stringify(input)).toBe(metal);
    }
  });

  // The check a student makes: heat capacity × temperature change = energy, with each number as the
  // readout shows it. Each shown number is off from the exact one by at most half its last digit:
  // the heat capacity by u/2 (u is its last shown figure: 1, 0.1 or 0.01 J/°C), the change by
  // 0.005 °C and the energy by 0.5 J. So |C_shown × ΔT_shown − E_shown| can be at most
  // (u/2) × ΔT_shown + C_shown × 0.005 + (u/2) × 0.005 + 0.5 J, and the test holds every state to
  // exactly that bound, for the water and for the metal.
  it('lets heat capacity × change, as shown, give the shown energy to within display rounding, in every state', () => {
    let worstWater = 0;
    let worstMetal = 0;
    for (const input of everyState) {
      const result = state(input);
      const shownEnergyJ = result.energy;
      for (const side of ['water', 'metal'] as const) {
        const capacityText = shownHeatCapacity(side === 'water' ? result.waterHeatCapacity : result.metalHeatCapacity);
        const capacity = Number(capacityText);
        const decimals = capacityText.includes('.') ? (capacityText.split('.')[1] ?? '').length : 0;
        const halfUnit = 0.5 * 10 ** -decimals;
        const change = Number(shownChange(side === 'water' ? result.waterChangeHundredths : result.metalChangeHundredths));
        const bound = halfUnit * change + capacity * 0.005 + halfUnit * 0.005 + 0.5;
        const miss = Math.abs(capacity * change - shownEnergyJ);
        expect(miss, `${side}, ${JSON.stringify(input)}: ${capacityText} × ${change} against ${shownEnergyJ} J`).toBeLessThanOrEqual(bound + 1e-9);
        const relative = miss / shownEnergyJ;
        if (side === 'water') worstWater = Math.max(worstWater, relative);
        else worstMetal = Math.max(worstMetal, relative);
      }
    }
    // As a fraction of the energy: the water's side is never off by more than 2.2 percent (a change of
    // about 0.23 °C read to 0.01 °C), the metal's by more than 0.6 percent.
    expect(worstWater).toBeLessThan(0.022);
    expect(worstMetal).toBeLessThan(0.006);
  });

  it('is never hotter than 46.7 °C nor cooler than 20.2 °C, at the states the brief names', () => {
    const finals = everyState.map((input) => state(input).finalTenths);
    expect(Math.max(...finals)).toBe(467);
    expect(Math.min(...finals)).toBe(202);
    expect(state(settings('titanium', 200, 100, 50)).finalTenths).toBe(467);
    expect(state(settings('tungsten', 50, 50, 200)).finalTenths).toBe(202);
  });

  it('has water with the larger heat capacity, and a water change smaller than the metal change, in every state', () => {
    for (const input of everyState) {
      const result = state(input);
      expect(result.waterHeatCapacity > result.metalHeatCapacity, JSON.stringify(input)).toBe(true);
      expect(result.waterChangeTenths < result.metalChangeTenths, JSON.stringify(input)).toBe(true);
      expect(result.waterChangeTenths > 0, JSON.stringify(input)).toBe(true);
      expect(result.waterChangeHundredths < result.metalChangeHundredths, JSON.stringify(input)).toBe(true);
      expect(result.waterChangeHundredths > 0, JSON.stringify(input)).toBe(true);
    }
  });

  it('has the largest metal heat capacity 104.6 J/°C and the smallest water heat capacity 209 J/°C', () => {
    expect(Math.max(...everyState.map((input) => state(input).metalHeatCapacity))).toBe(104600);
    expect(Math.min(...everyState.map((input) => state(input).waterHeatCapacity))).toBe(209000);
  });

  it('has 62 states that are exact rounding ties in the temperature, the energy or both', () => {
    const ties = everyState.filter((input) => {
      const { finalTenths, energy } = exact(input);
      return isTie(finalTenths) || isTie(energy);
    });
    expect(ties).toHaveLength(62);
  });

  it('keeps every energy on the axis: the most is 7,437 J and the least 192 J', () => {
    const energies = everyState.map((input) => state(input).energy);
    expect(Math.max(...energies)).toBe(7437);
    expect(Math.min(...energies)).toBe(192);
    expect(state(settings('titanium', 200, 100, 200)).energy).toBe(7437);
    expect(Math.max(...energies)).toBeLessThanOrEqual(ENERGY_AXIS.max);
  });

  it('gives every state a readout whose numbers agree with its state', () => {
    for (const input of everyState) {
      const result = state(input);
      const sentence = readout(input);
      const name = METALS[input.metal].name;
      expect(sentence.startsWith(`Both end at ${shownTemperature(result.finalTenths)} °C. The ${name} lost ${shownEnergy(result.energy)} J and the water gained ${shownEnergy(result.energy)} J.`), sentence).toBe(true);
      expect(sentence).toContain(
        `by ${shownChange(result.waterChangeHundredths)} °C against ${shownChange(result.metalChangeHundredths)} °C (to 0.01 °C)`,
      );
    }
  });
});

describe('shown numbers', () => {
  it.each([
    [267, '26.7'],
    [200, '20.0'],
    [1000, '100.0'],
    [67, '6.7'],
    [5, '0.5'],
  ])('shows %s tenths of a degree as %s', (tenths, text) => {
    expect(shownTemperature(tenths)).toBe(text);
  });

  it.each([
    [2789, '2,789'],
    [768, '768'],
    [5577, '5,577'],
    [0, '0'],
    [6000, '6,000'],
    [1234567, '1,234,567'],
  ])('shows %s J as %s', (joules, text) => {
    expect(shownEnergy(joules)).toBe(text);
  });

  it.each([
    [418000, '418'],
    [52300, '52.3'],
    [104600, '105'],
    [6600, '6.60'],
    [26150, '26.2'],
    [78450, '78.5'],
    [250800, '251'],
    [836000, '836'],
    [10560, '10.6'],
    [99950, '100'],
  ])('shows a heat capacity of %s mJ/°C to three figures, as %s', (millijoules, text) => {
    expect(shownHeatCapacity(millijoules)).toBe(text);
  });

  it('refuses a number it cannot show', () => {
    expect(() => shownTemperature(2.5)).toThrow(RangeError);
    expect(() => shownEnergy(-1)).toThrow(RangeError);
    expect(() => shownHeatCapacity(Number.NaN)).toThrow(RangeError);
    expect(() => shownHeatCapacity(99)).toThrow(RangeError);
  });

  it.each([
    [667, '6.67'],
    [5333, '53.33'],
    [310, '3.10'],
    [23, '0.23'],
    [5, '0.05'],
    [8000, '80.00'],
  ])('shows a change of %s hundredths of a degree as %s', (hundredths, text) => {
    expect(shownChange(hundredths)).toBe(text);
  });

  it('refuses a change it cannot show', () => {
    expect(() => shownChange(-1)).toThrow(RangeError);
    expect(() => shownChange(1.5)).toThrow(RangeError);
  });

  it('writes the sliders as spoken', () => {
    expect(massText(100)).toBe('100 g');
    expect(temperatureText(80)).toBe('80 °C');
  });
});

describe('readout', () => {
  it('says the starting state in the words of the brief', () => {
    expect(readout(START)).toBe(
      'Both end at 26.7 °C. The titanium lost 2,789 J and the water gained 2,789 J. ' +
        "The water's temperature changed less, by 6.67 °C against 53.33 °C (to 0.01 °C), because its heat capacity is larger: 418 J/°C against 52.3 J/°C.",
    );
  });

  it('says the three other states the lesson walks through', () => {
    expect(readout(settings('tungsten', 100, 80, 100))).toBe(
      'Both end at 21.8 °C. The tungsten lost 768 J and the water gained 768 J. ' +
        "The water's temperature changed less, by 1.84 °C against 58.16 °C (to 0.01 °C), because its heat capacity is larger: 418 J/°C against 13.2 J/°C.",
    );
    expect(readout(settings('tin', 100, 80, 100))).toBe(
      'Both end at 23.1 °C. The tin lost 1,297 J and the water gained 1,297 J. ' +
        "The water's temperature changed less, by 3.10 °C against 56.90 °C (to 0.01 °C), because its heat capacity is larger: 418 J/°C against 22.8 J/°C.",
    );
    expect(readout(settings('titanium', 100, 80, 200))).toBe(
      'Both end at 23.5 °C. The titanium lost 2,953 J and the water gained 2,953 J. ' +
        "The water's temperature changed less, by 3.53 °C against 56.47 °C (to 0.01 °C), because its heat capacity is larger: 836 J/°C against 52.3 J/°C.",
    );
  });

  it('makes the water side add up where a rounded final temperature would not: 794 J/°C × 0.25 °C is near 196 J', () => {
    expect(readout(settings('tungsten', 50, 50, 190))).toBe(
      'Both end at 20.2 °C. The tungsten lost 196 J and the water gained 196 J. ' +
        "The water's temperature changed less, by 0.25 °C against 29.75 °C (to 0.01 °C), because its heat capacity is larger: 794 J/°C against 6.60 J/°C.",
    );
  });

  it('shows a small heat capacity with three figures', () => {
    expect(readout(settings('tungsten', 50, 50, 200))).toBe(
      'Both end at 20.2 °C. The tungsten lost 196 J and the water gained 196 J. ' +
        "The water's temperature changed less, by 0.23 °C against 29.77 °C (to 0.01 °C), because its heat capacity is larger: 836 J/°C against 6.60 J/°C.",
    );
  });

  it('throws for a setting the sliders cannot reach', () => {
    expect(() => readout(settings('tin', 100, 81, 100))).toThrow(RangeError);
  });
});

describe('what the drawings show', () => {
  it('gives the readings under the two cups', () => {
    expect(cupReadings(START)).toEqual({ before: ['titanium at 80.0 °C', 'water at 20.0 °C'], after: 'both at 26.7 °C' });
    expect(cupReadings(settings('tungsten', 200, 100, 50))).toEqual({
      before: ['tungsten at 100.0 °C', 'water at 20.0 °C'],
      after: 'both at 29.0 °C',
    });
  });

  it('names the two bars', () => {
    expect(barNames('titanium')).toEqual({ metal: 'titanium lost', water: 'water gained' });
    expect(barNames('tungsten')).toEqual({ metal: 'tungsten lost', water: 'water gained' });
  });

  it('describes the cup for a screen reader', () => {
    expect(describeCup(START)).toBe(
      'Two drawings of an insulated cup of water. Before: 100 g of titanium at 80.0 °C hangs above 100 g of water at 20.0 °C. ' +
        'At equilibrium: the titanium lies in the water, and both are at 26.7 °C.',
    );
  });

  it('describes the bars for a screen reader', () => {
    expect(describeBars(START)).toBe(
      'Bar chart of energy in joules, from 0 to 8,000 J. A hatched bar, the energy the titanium lost, ' +
        'and a plain bar, the energy the water gained, are the same height: 2,789 J each.',
    );
    expect(describeBars(settings('tin', 60, 90, 180))).toContain('the energy the tin lost');
    expect(describeBars(settings('tin', 60, 90, 180))).toContain('941 J each.');
  });
});
