import { describe, expect, it } from 'vitest';
import {
  AXES,
  BOX,
  FREE_ENERGIES,
  FREE_ENERGY,
  GAS_CONSTANT,
  LABELS,
  PARTICLES,
  START,
  TEMPERATURES,
  describeBox,
  describeGraph,
  freeEnergyText,
  freeEnergyValueText,
  freeTickText,
  linePoints,
  logTickText,
  mixtureSentence,
  particles,
  rankOf,
  readout,
  shownK,
  shownTwoFigures,
  state,
  temperatureText,
  type Kelvins,
} from '../../src/lib/gibbs-and-k';

// Everything below is written out from lesson 9.5's brief, "Diagram data" (the constant, the
// controls, the model, the rounding rules, the readout sentences, the limits and the twenty-one
// worked states), apart from the module under test.

const MINUS = '−';
const BRIEF_TEMPERATURES: Kelvins[] = [298, 500, 1000];
const ALL_STATES = BRIEF_TEMPERATURES.flatMap((temperature) =>
  Array.from({ length: 81 }, (_, i) => ({ g: i - 40, temperature })),
);
const where = (g: number, temperature: number) => `${g} kJ at ${temperature} K`;

/** An item of a list that must be there: a missing one is an error, never a default. */
function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`The list has no item ${index}; it has ${list.length}.`);
  return item;
}

// ---- Independent arithmetic, used only by this file ----
//
// The module takes K = e^x with x = −1,000g ÷ (8.314T) and rounds by scaling and flooring. The test
// takes K as a power of ten, 10^(log K) with log K = −g ÷ (0.008314 × T × ln 10), rounds K with the
// language's own toPrecision (which rounds the exact binary value, half up), and takes the share of
// B as 100K ÷ (1 + K), the other form of the brief's formula.

function independentK(g: number, temperature: number): number {
  const logK = -g / (0.008314 * temperature * Math.LN10);
  return Math.pow(10, logK);
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

/** Two significant figures, written as the brief writes them, from toPrecision's digits. */
function writeKIndependently(k: number): string {
  // toExponential(1) gives "7.5e+0", "1.0e+7", "9.7e-8": two figures, rounded half up.
  const [mantissa, exponentText] = k.toExponential(1).split('e') as [string, string];
  const exponent = Number(exponentText);
  const digits = mantissa.replace('.', '');
  if (exponent >= -2 && exponent <= 3) {
    // A plain number: shift the decimal point and add a thousands comma.
    if (exponent === 3) return `${digits[0]},${digits[1]}00`;
    if (exponent === 2) return `${digits}0`;
    if (exponent === 1) return digits;
    if (exponent === 0) return mantissa;
    if (exponent === -1) return `0.${digits}`;
    return `0.0${digits}`;
  }
  const power = String(exponent)
    .split('')
    .map((c) => {
      const sup = SUPERSCRIPT[c];
      if (sup === undefined) throw new Error(`No superscript for ${c}`);
      return sup;
    })
    .join('');
  return `${mantissa} × 10${power}`;
}

/** The shown number back to a value, for checking it against K. */
function valueOfShown(text: string): number {
  const power = /^(\d\.\d) × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/.exec(text);
  if (power) {
    const [, mantissa, exponent] = power as unknown as [string, string, string];
    const plain = exponent
      .split('')
      .map((c) => {
        const found = Object.entries(SUPERSCRIPT).find(([, s]) => s === c);
        if (!found) throw new Error(`Not a superscript: ${c}`);
        return found[0];
      })
      .join('');
    return Number(`${mantissa}e${plain}`);
  }
  if (!/^[\d,]+(\.\d+)?$/.test(text)) throw new Error(`Not a shown K: ${text}`);
  return Number(text.replace(/,/g, ''));
}

function independentCount(g: number, temperature: number): number {
  const k = independentK(g, temperature);
  return Math.round((100 * k) / (1 + k));
}

/** How far a value sits from the nearest rounding boundary, relative to its size, when it is rounded to two figures. */
function relativeGapTwoFigures(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const scaled = value / Math.pow(10, exponent - 1);
  return Math.abs(scaled - (Math.floor(scaled) + 0.5)) / scaled;
}

/** The same for rounding a share in percent to a whole number. */
function relativeGapWhole(value: number): number {
  return Math.abs(value - (Math.floor(value) + 0.5)) / Math.max(value, 1e-300);
}

/** The brief's last sentence of the readout, from n_B. */
function lastSentence(countB: number): string {
  if (countB === 100) return 'At equilibrium fewer than 1 in 100 particles is A.';
  if (countB === 0) return 'At equilibrium fewer than 1 in 100 particles is B.';
  if (countB === 1) return 'At equilibrium about 1 of every 100 particles is B.';
  return `At equilibrium about ${countB} of every 100 particles are B.`;
}

// The brief's worked states: ΔG° (kJ), T (K), multiple of RT, K shown, share of B (%), n_B, last sentence.
const WORKED = `
−5 | 298 | 2.0 | 7.5 | 88.27 | 88 | about 88 of every 100 particles are B
0 | 298 | | 1.0 | 50.00 | 50 | about 50 of every 100 particles are B
+5 | 298 | 2.0 | 0.13 | 11.73 | 12 | about 12 of every 100 particles are B
−6 | 298 | 2.4 | 11 | 91.85 | 92 | about 92 of every 100 particles are B
−11 | 298 | 4.4 | 85 | 98.83 | 99 | about 99 of every 100 particles are B
−17 | 298 | 6.9 | 950 | 99.90 | 100 | fewer than 1 in 100 particles is A
−40 | 298 | 16 | 1.0 × 10⁷ | 100.00 | 100 | fewer than 1 in 100 particles is A
−40 | 500 | 9.6 | 1.5 × 10⁴ | 99.99 | 100 | fewer than 1 in 100 particles is A
−40 | 1,000 | 4.8 | 120 | 99.19 | 99 | about 99 of every 100 particles are B
+40 | 298 | 16 | 9.7 × 10⁻⁸ | 0.00 | 0 | fewer than 1 in 100 particles is B
+13 | 298 | 5.2 | 5.3 × 10⁻³ | 0.52 | 1 | about 1 of every 100 particles is B
+14 | 298 | 5.7 | 3.5 × 10⁻³ | 0.35 | 0 | fewer than 1 in 100 particles is B
+22 | 500 | 5.3 | 5.0 × 10⁻³ | 0.50 | 1 | about 1 of every 100 particles is B
+23 | 500 | 5.5 | 4.0 × 10⁻³ | 0.39 | 0 | fewer than 1 in 100 particles is B
+11 | 298 | 4.4 | 0.012 | 1.17 | 1 | about 1 of every 100 particles is B
+12 | 298 | 4.8 | 7.9 × 10⁻³ | 0.78 | 1 | about 1 of every 100 particles is B
−22 | 298 | 8.9 | 7,200 | 99.99 | 100 | fewer than 1 in 100 particles is A
−23 | 298 | 9.3 | 1.1 × 10⁴ | 99.99 | 100 | fewer than 1 in 100 particles is A
−1 | 298 | 0.40 | 1.5 | 59.96 | 60 | about 60 of every 100 particles are B
+1 | 1,000 | 0.12 | 0.89 | 47.00 | 47 | about 47 of every 100 particles are B
+40 | 1,000 | 4.8 | 8.1 × 10⁻³ | 0.81 | 1 | about 1 of every 100 particles is B
`;

const WORKED_ROWS = WORKED.trim()
  .split('\n')
  .map((line) => {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length !== 7) throw new Error(`A bad row: ${line}`);
    const [g, t, multiple, k, share, n, sentence] = cells as [string, string, string, string, string, string, string];
    return {
      g: Number(g.replace(MINUS, '-').replace('+', '')),
      temperature: Number(t.replace(/,/g, '')) as Kelvins,
      multiple: multiple === '' ? null : multiple,
      k,
      share: Number(share),
      countB: Number(n),
      sentence,
    };
  });

describe('the constants', () => {
  it('uses R = 8.314 J/(mol·K) and no other constant', () => {
    expect(GAS_CONSTANT).toBe(8.314);
  });

  it('has a slider of ΔG° from −40 to +40 kJ/mol in steps of 1, three temperatures, and 243 states', () => {
    expect(FREE_ENERGY).toEqual({ min: -40, max: 40, step: 1 });
    expect(FREE_ENERGIES).toHaveLength(81);
    expect(FREE_ENERGIES.every((g, i) => g === -40 + i)).toBe(true);
    expect(TEMPERATURES).toEqual([298, 500, 1000]);
    expect(FREE_ENERGIES.length * TEMPERATURES.length).toBe(243);
  });

  it('starts at −5 kJ/mol and 298 K', () => {
    expect(START).toEqual({ freeEnergy: -5, temperature: 298 });
  });

  it('draws log K from −8 to +8, labeled every 3, against ΔG° from −40 to +40, labeled every 20', () => {
    expect(AXES).toEqual({
      freeMin: -40,
      freeMax: 40,
      freeTicks: [-40, -20, 0, 20, 40],
      logMin: -8,
      logMax: 8,
      logTicks: [-6, -3, 0, 3, 6],
    });
    expect(AXES.logTicks.map(logTickText)).toEqual(['10⁻⁶', '10⁻³', '1', '10³', '10⁶']);
    expect(AXES.freeTicks.map(freeTickText)).toEqual(['−40', '−20', '0', '+20', '+40']);
    expect(() => logTickText(1.5)).toThrow(RangeError);
    expect(() => freeTickText(Number.NaN)).toThrow(RangeError);
  });

  it('names the parts of the drawing and the controls', () => {
    expect(LABELS.slider).toBe('ΔG°');
    expect(LABELS.choice).toBe('Temperature');
    expect(LABELS.freeAxis).toBe('ΔG° (kJ/mol)');
    expect(LABELS.logAxis).toBe('K (log scale)');
    expect(LABELS.kOne).toBe('K = 1');
    expect(LABELS.box).toBe('At equilibrium');
    expect(LABELS.keyA).toBe('A');
    expect(LABELS.keyB).toBe('B');
  });
});

describe('the controls’ words', () => {
  it('shows ΔG° as the slider’s whole number with its sign, and speaks it in words', () => {
    expect(freeEnergyText(-5)).toBe('−5');
    expect(freeEnergyText(0)).toBe('0');
    expect(freeEnergyText(5)).toBe('+5');
    expect(freeEnergyText(-40)).toBe('−40');
    expect(freeEnergyValueText(-5)).toBe('minus 5 kilojoules per mole');
    expect(freeEnergyValueText(0)).toBe('0 kilojoules per mole');
    expect(freeEnergyValueText(40)).toBe('plus 40 kilojoules per mole');
    expect(freeEnergyValueText(-1)).toBe('minus 1 kilojoule per mole');
    expect(freeEnergyValueText(1)).toBe('plus 1 kilojoule per mole');
  });

  it('writes each temperature with a thousands comma', () => {
    expect(TEMPERATURES.map(temperatureText)).toEqual(['298 K', '500 K', '1,000 K']);
  });
});

describe('bad input', () => {
  it('throws a RangeError that names a ΔG° off the slider’s stops', () => {
    for (const bad of [-41, 41, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => state(bad, 298), `${bad}`).toThrow(RangeError);
      expect(() => state(bad, 298), `${bad}`).toThrow(String(bad));
      expect(() => freeEnergyText(bad), `${bad}`).toThrow(RangeError);
      expect(() => readout(bad, 298), `${bad}`).toThrow(RangeError);
    }
  });

  it('throws a RangeError that names a temperature that is not one of the three', () => {
    for (const bad of [300, 0, 1000.5, Number.NaN]) {
      expect(() => state(0, bad as Kelvins), `${bad}`).toThrow(RangeError);
      expect(() => state(0, bad as Kelvins), `${bad}`).toThrow(String(bad));
      expect(() => temperatureText(bad as Kelvins), `${bad}`).toThrow(RangeError);
      expect(() => linePoints(bad as Kelvins), `${bad}`).toThrow(RangeError);
    }
  });

  it('refuses to round a K that is not a positive finite number, and a count off 0 to 100', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(() => shownK(bad), `${bad}`).toThrow(RangeError);
    for (const bad of [-1, 101, 2.5, Number.NaN]) expect(() => mixtureSentence(bad), `${bad}`).toThrow(RangeError);
  });

  it('refuses a cell of the box that is not one of the 100', () => {
    for (const bad of [-1, 100, 1.5, Number.NaN]) {
      expect(() => rankOf(bad), `${bad}`).toThrow(RangeError);
      expect(() => rankOf(bad), `${bad}`).toThrow(String(bad));
    }
  });
});

describe('the rounding', () => {
  it('rounds K to two figures, half up, plain from 0.010 to 9,900 and a power of ten outside it', () => {
    expect(shownK(7.4999)).toBe('7.5');
    expect(shownK(7.45)).toBe('7.5');
    expect(shownK(7.4499)).toBe('7.4');
    expect(shownK(1)).toBe('1.0');
    expect(shownK(0.0123)).toBe('0.012');
    expect(shownK(0.00999)).toBe('0.010');
    expect(shownK(0.009949)).toBe('9.9 × 10⁻³');
    expect(shownK(9_949)).toBe('9,900');
    expect(shownK(9_950)).toBe('1.0 × 10⁴');
    expect(shownK(99.5)).toBe('100');
    expect(shownK(0.996)).toBe('1.0');
    expect(shownK(1.04e7)).toBe('1.0 × 10⁷');
    expect(shownK(9.7e-8)).toBe('9.7 × 10⁻⁸');
    expect(shownK(123)).toBe('120');
    expect(shownK(7_249)).toBe('7,200');
  });

  it('rounds the multiple of RT to two figures, half up', () => {
    expect(shownTwoFigures(5 / 2.477572)).toBe('2.0');
    expect(shownTwoFigures(40 / 2.477572)).toBe('16');
    expect(shownTwoFigures(1 / 8.314)).toBe('0.12');
    expect(shownTwoFigures(0.395)).toBe('0.40');
    expect(shownTwoFigures(9.951)).toBe('10');
    expect(() => shownTwoFigures(0)).toThrow(RangeError);
  });
});

describe('RT', () => {
  it('is exactly 2.477572, 4.157 and 8.314 kJ/mol, shown to three figures as 2.48, 4.16 and 8.31', () => {
    expect(state(0, 298).rtKJ).toBeCloseTo(2.477572, 12);
    expect(state(0, 500).rtKJ).toBeCloseTo(4.157, 12);
    expect(state(0, 1000).rtKJ).toBeCloseTo(8.314, 12);
    expect(TEMPERATURES.map((t) => state(0, t).rtText)).toEqual(['2.48', '4.16', '8.31']);
  });
});

describe('the worked states', () => {
  it('lists the brief’s twenty-one', () => {
    expect(WORKED_ROWS).toHaveLength(21);
  });

  for (const row of WORKED_ROWS) {
    it(`${where(row.g, row.temperature)}: ${row.multiple ?? 'no'} times RT, K = ${row.k}, ${row.countB} of 100 are B`, () => {
      const s = state(row.g, row.temperature);
      expect(s.multipleText).toBe(row.multiple);
      expect(s.kText).toBe(row.k);
      expect(s.shareB).toBeCloseTo(row.share, 2);
      expect(s.countB).toBe(row.countB);
      expect(s.countA).toBe(100 - row.countB);
      expect(readout(row.g, row.temperature).endsWith(`At equilibrium ${row.sentence}.`)).toBe(true);
    });
  }
});

describe('the model, by the test’s own arithmetic', () => {
  it('in every one of the 243 states the shown K and the count of B are those the test works out', () => {
    expect(ALL_STATES).toHaveLength(243);
    for (const { g, temperature } of ALL_STATES) {
      const s = state(g, temperature);
      expect(s.kText, where(g, temperature)).toBe(writeKIndependently(independentK(g, temperature)));
      expect(s.countB, where(g, temperature)).toBe(independentCount(g, temperature));
      expect(s.k / independentK(g, temperature), where(g, temperature)).toBeCloseTo(1, 12);
      expect(s.logK * Math.LN10, where(g, temperature)).toBeCloseTo(s.lnK, 12);
      expect(s.lnK, where(g, temperature)).toBeCloseTo((-1000 * g) / (8.314 * temperature), 12);
      expect(s.shareB, where(g, temperature)).toBeCloseTo((100 * s.k) / (1 + s.k), 10);
    }
  });

  it('in every state the multiple of RT is |ΔG°| ÷ RT to two figures, and there is none at zero', () => {
    for (const { g, temperature } of ALL_STATES) {
      const s = state(g, temperature);
      if (g === 0) {
        expect(s.multipleText).toBeNull();
        continue;
      }
      const multiple = Math.abs(g) / ((8.314 * temperature) / 1000);
      const [mantissa, exponentText] = multiple.toExponential(1).split('e') as [string, string];
      const exponent = Number(exponentText);
      const want = exponent === 1 ? mantissa.replace('.', '') : exponent === 0 ? mantissa : `0.${mantissa.replace('.', '')}`;
      expect(exponent >= -1 && exponent <= 1, where(g, temperature)).toBe(true);
      expect(s.multipleText, where(g, temperature)).toBe(want);
    }
  });

  it('no shown number in any state lies within 10⁻⁹ of a rounding boundary; the nearest call is the share at ±22 kJ and 500 K', () => {
    let nearest = { g: 0, temperature: 0, gap: Number.POSITIVE_INFINITY };
    for (const { g, temperature } of ALL_STATES) {
      const s = state(g, temperature);
      const gaps = [relativeGapTwoFigures(s.k), relativeGapWhole(s.shareB)];
      if (g !== 0) gaps.push(relativeGapTwoFigures(Math.abs(g) / s.rtKJ));
      for (const gap of gaps) {
        expect(gap, where(g, temperature)).toBeGreaterThan(1e-9);
      }
      const shareGap = relativeGapWhole(s.shareB) * s.shareB;
      if (shareGap < nearest.gap) nearest = { g, temperature, gap: shareGap };
    }
    expect(Math.abs(nearest.g)).toBe(22);
    expect(nearest.temperature).toBe(500);
    expect(state(22, 500).shareB).toBeCloseTo(0.5005, 4);
    expect(state(-22, 500).shareB).toBeCloseTo(99.4995, 4);
    // And RT itself: 2.477572, 4.157 and 8.314 are far from 2.475, 4.155 and 8.315.
    for (const t of TEMPERATURES) expect(Math.abs(state(0, t).rtKJ * 100 - Math.floor(state(0, t).rtKJ * 100) - 0.5)).toBeGreaterThan(1e-6);
  });

  it('every shown K is K to two figures: it lies within half a unit of its second figure', () => {
    for (const { g, temperature } of ALL_STATES) {
      const s = state(g, temperature);
      const shown = valueOfShown(s.kText);
      const unit = Math.pow(10, Math.floor(Math.log10(shown)) - 1);
      expect(Math.abs(shown - s.k), where(g, temperature)).toBeLessThanOrEqual(unit / 2);
    }
  });
});

describe('−ΔG° gives 1/K', () => {
  it('K(−g) × K(g) = 1, the shown K(−g) is 1/K(g) to two figures, and the counts add to 100, at every g and T', () => {
    for (const { g, temperature } of ALL_STATES) {
      const s = state(g, temperature);
      const mirror = state(-g, temperature);
      expect(s.k * mirror.k, where(g, temperature)).toBeCloseTo(1, 12);
      expect(mirror.kText, where(g, temperature)).toBe(writeKIndependently(1 / independentK(g, temperature)));
      expect(s.countB + mirror.countB, where(g, temperature)).toBe(100);
    }
  });

  it('the mixtures at −5 and +5 kJ and 298 K are 88 and 12, with K = 7.5 and 0.13', () => {
    expect([state(-5, 298).countB, state(5, 298).countB]).toEqual([88, 12]);
    expect([state(-5, 298).kText, state(5, 298).kText]).toEqual(['7.5', '0.13']);
  });
});

describe('the limits over all 243 states', () => {
  it('K runs from 9.7 × 10⁻⁸ (+40 at 298 K) to 1.0 × 10⁷ (−40 at 298 K), and log K stays within 7.02 of zero', () => {
    const all = ALL_STATES.map(({ g, temperature }) => ({ g, temperature, s: state(g, temperature) }));
    const low = all.reduce((a, b) => (b.s.k < a.s.k ? b : a));
    const high = all.reduce((a, b) => (b.s.k > a.s.k ? b : a));
    expect([low.g, low.temperature, low.s.kText]).toEqual([40, 298, '9.7 × 10⁻⁸']);
    expect([high.g, high.temperature, high.s.kText]).toEqual([-40, 298, '1.0 × 10⁷']);
    for (const { s } of all) {
      expect(Math.abs(s.logK)).toBeLessThan(7.02);
      expect(s.logK).toBeGreaterThan(AXES.logMin);
      expect(s.logK).toBeLessThan(AXES.logMax);
    }
  });

  it('K falls as ΔG° rises at each temperature; below zero it falls as T rises, above zero it rises', () => {
    for (const t of TEMPERATURES) {
      for (let g = -40; g < 40; g++) expect(state(g, t).k, where(g, t)).toBeGreaterThan(state(g + 1, t).k);
    }
    for (let g = -40; g <= 40; g++) {
      const [a, b, c] = TEMPERATURES.map((t) => state(g, t).k) as [number, number, number];
      if (g < 0) expect(a > b && b > c, `${g} kJ`).toBe(true);
      else if (g > 0) expect(a < b && b < c, `${g} kJ`).toBe(true);
      else expect([a, b, c]).toEqual([1, 1, 1]);
    }
  });

  it('n_B is 0 at 298 K from +14 to +40, at 500 K from +23 to +40, never at 1,000 K, and 100 in the 45 mirror states', () => {
    const zeroAt = (t: Kelvins) => FREE_ENERGIES.filter((g) => state(g, t).countB === 0);
    const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
    expect(zeroAt(298)).toEqual(range(14, 40));
    expect(zeroAt(500)).toEqual(range(23, 40));
    expect(zeroAt(1000)).toEqual([]);
    expect(Math.min(...FREE_ENERGIES.map((g) => state(g, 1000).countB))).toBe(1);
    const all = ALL_STATES.map(({ g, temperature }) => state(g, temperature).countB);
    expect(all.filter((n) => n === 0)).toHaveLength(45);
    expect(all.filter((n) => n === 100)).toHaveLength(45);
  });

  it('the line of each temperature passes through the brief’s points', () => {
    const table: [Kelvins, number[]][] = [
      [298, [7.012, 3.506, 0, -3.506, -7.012]],
      [500, [4.179, 2.089, 0, -2.089, -4.179]],
      [1000, [2.089, 1.045, 0, -1.045, -2.089]],
    ];
    for (const [t, values] of table) {
      [-40, -20, 0, 20, 40].forEach((g, i) => expect(state(g, t).logK, where(g, t)).toBeCloseTo(at(values, i), 3));
      const ends = linePoints(t);
      expect(ends.map((p) => p.freeEnergy)).toEqual([-40, 40]);
      expect(at(ends, 0).logK).toBeCloseTo(at(values, 0), 3);
      expect(at(ends, 1).logK).toBeCloseTo(at(values, 4), 3);
    }
  });
});

describe('the readout', () => {
  it('gives the brief’s sentences word for word', () => {
    expect(readout(-5, 298)).toBe(
      'ΔG° = −5 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.0 times RT below zero. K = 7.5. At equilibrium about 88 of every 100 particles are B.',
    );
    expect(readout(5, 298)).toBe(
      'ΔG° = +5 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.0 times RT above zero. K = 0.13. At equilibrium about 12 of every 100 particles are B.',
    );
    expect(readout(0, 298)).toBe('ΔG° = 0 kJ/mol at 298 K. RT is 2.48 kJ/mol. K = 1.0. At equilibrium about 50 of every 100 particles are B.');
    expect(readout(0, 1000)).toBe('ΔG° = 0 kJ/mol at 1,000 K. RT is 8.31 kJ/mol. K = 1.0. At equilibrium about 50 of every 100 particles are B.');
    expect(readout(-40, 298)).toBe(
      'ΔG° = −40 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 16 times RT below zero. K = 1.0 × 10⁷. At equilibrium fewer than 1 in 100 particles is A.',
    );
    expect(readout(40, 298)).toBe(
      'ΔG° = +40 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 16 times RT above zero. K = 9.7 × 10⁻⁸. At equilibrium fewer than 1 in 100 particles is B.',
    );
    expect(readout(-40, 500)).toBe(
      'ΔG° = −40 kJ/mol at 500 K. RT is 4.16 kJ/mol, so ΔG° is 9.6 times RT below zero. K = 1.5 × 10⁴. At equilibrium fewer than 1 in 100 particles is A.',
    );
    expect(readout(-40, 1000)).toBe(
      'ΔG° = −40 kJ/mol at 1,000 K. RT is 8.31 kJ/mol, so ΔG° is 4.8 times RT below zero. K = 120. At equilibrium about 99 of every 100 particles are B.',
    );
  });

  it('words the mixture by n_B, never saying 0 or 100, with a singular verb for 1', () => {
    expect(mixtureSentence(100)).toBe('At equilibrium fewer than 1 in 100 particles is A.');
    expect(mixtureSentence(0)).toBe('At equilibrium fewer than 1 in 100 particles is B.');
    expect(mixtureSentence(1)).toBe('At equilibrium about 1 of every 100 particles is B.');
    expect(mixtureSentence(99)).toBe('At equilibrium about 99 of every 100 particles are B.');
    expect(mixtureSentence(50)).toBe('At equilibrium about 50 of every 100 particles are B.');
  });

  it('in every state reads back as consistent: its ΔG°, RT, multiple, K and count are the state’s own, and the count agrees with K', () => {
    const pattern =
      /^ΔG° = (0|[+−]\d+) kJ\/mol at ([\d,]+) K\. RT is (\d\.\d\d) kJ\/mol(?:, so ΔG° is ([\d.]+) times RT (below|above) zero)?\. K = ([^.]+(?:\.\d+)?(?: × 10[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)?)\. (At equilibrium .+)$/;
    for (const { g, temperature } of ALL_STATES) {
      const text = readout(g, temperature);
      const match = pattern.exec(text);
      expect(match, text).not.toBeNull();
      if (!match) continue;
      const [, shownG, t, rt, multiple, side, k, last] = match as unknown as (string | undefined)[];
      const s = state(g, temperature);
      expect(shownG).toBe(g === 0 ? '0' : `${g > 0 ? '+' : MINUS}${Math.abs(g)}`);
      if (t === undefined || k === undefined) throw new Error(`A readout without its numbers: ${text}`);
      expect(Number(t.replace(/,/g, ''))).toBe(temperature);
      expect(rt).toBe(s.rtText);
      expect(multiple ?? null).toBe(s.multipleText);
      expect(side ?? null).toBe(g < 0 ? 'below' : g > 0 ? 'above' : null);
      expect(k).toBe(writeKIndependently(independentK(g, temperature)));
      expect(last).toBe(lastSentence(independentCount(g, temperature)));
      // The shown K and the shown count cannot be checked against each other and found wrong:
      // the count is the share 100K/(1 + K) of the unrounded K, and the share of the shown K
      // rounds to the same count or to a neighbor, never to the other side of 1.
      const shownValue = valueOfShown(k);
      const fromShown = (100 * shownValue) / (1 + shownValue);
      expect(Math.abs(fromShown - s.countB), text).toBeLessThan(1.5);
      expect(shownValue > 1, text).toBe(s.k > 1 + 1e-12);
    }
  });

  it('never says "0 of", "100 of", "percent", "spontaneous" or "favorable", and every minus sign before a number is a true minus', () => {
    for (const { g, temperature } of ALL_STATES) {
      for (const text of [readout(g, temperature), describeGraph(g, temperature), describeBox(g, temperature)]) {
        expect(text).not.toMatch(/\b(0|100) of every|percent|spontaneous|favorable/i);
        expect(text).not.toMatch(/-\d/);
      }
    }
  });
});

describe('the box', () => {
  it('ranks the cells by (37i + 11) mod 100, each rank once', () => {
    expect(rankOf(0)).toBe(11);
    expect(rankOf(1)).toBe(48);
    expect(rankOf(99)).toBe((37 * 99 + 11) % 100);
    const ranks = Array.from({ length: 100 }, (_, i) => rankOf(i));
    expect([...ranks].sort((a, b) => a - b)).toEqual(Array.from({ length: 100 }, (_, i) => i));
  });

  it('draws 100 particles in ten rows of ten, exactly n_B of them B, each B a cell whose rank is below n_B', () => {
    expect(PARTICLES).toBe(100);
    for (const { g, temperature } of ALL_STATES) {
      const drawn = particles(g, temperature);
      const s = state(g, temperature);
      expect(drawn).toHaveLength(100);
      expect(drawn.filter((p) => p.kind === 'B'), where(g, temperature)).toHaveLength(s.countB);
      drawn.forEach((p, i) => {
        expect(p.kind).toBe((37 * i + 11) % 100 < s.countB ? 'B' : 'A');
        expect(p.x).toBeCloseTo(BOX.first + BOX.cell * (i % 10), 9);
        expect(p.y).toBeCloseTo(BOX.first + BOX.cell * Math.floor(i / 10), 9);
      });
    }
  });

  it('keeps every particle inside the box, clear of its frame', () => {
    const reach = Math.max(BOX.circleRadius, BOX.squareSide / 2);
    expect(BOX.first - reach).toBeGreaterThan(2);
    expect(BOX.first + 9 * BOX.cell + reach).toBeLessThan(BOX.size - 2);
    // Neighbors do not touch.
    expect(BOX.cell - 2 * reach).toBeGreaterThanOrEqual(4);
  });

  it('moving the slider by one step changes only cells whose rank lies between the two counts, and never rearranges the rest', () => {
    for (const t of TEMPERATURES) {
      for (let g = -40; g < 40; g++) {
        const before = particles(g, t);
        const after = particles(g + 1, t);
        const [lo, hi] = [state(g + 1, t).countB, state(g, t).countB];
        before.forEach((p, i) => {
          const changed = p.kind !== at(after, i).kind;
          const rank = (37 * i + 11) % 100;
          expect(changed, `${where(g, t)}, cell ${i}`).toBe(rank >= lo && rank < hi);
        });
      }
    }
  });

  it('describes the box in words', () => {
    expect(describeBox(-5, 298)).toBe('A box of 100 particles at equilibrium: 88 are B, drawn as filled squares, and 12 are A, drawn as open circles.');
    expect(describeBox(-17, 298)).toBe('A box of 100 particles at equilibrium, all drawn as B, filled squares: fewer than 1 in 100 is A.');
    expect(describeBox(40, 298)).toBe('A box of 100 particles at equilibrium, all drawn as A, open circles: fewer than 1 in 100 is B.');
    expect(describeBox(13, 298)).toBe('A box of 100 particles at equilibrium: 1 is B, drawn as a filled square, and 99 are A, drawn as open circles.');
    expect(describeBox(-13, 298)).toBe('A box of 100 particles at equilibrium: 99 are B, drawn as filled squares, and 1 is A, drawn as an open circle.');
  });
});

describe('the graph', () => {
  it('describes the graph: its scales, the K = 1 line, the heavy line’s ends and the marker', () => {
    expect(describeGraph(-5, 298)).toBe(
      'Graph of K, on a scale of powers of ten from 10⁻⁸ to 10⁸, against ΔG° from −40 to +40 kJ/mol. A firm line marks K = 1. ' +
        'The line for 298 K is drawn heavy and those for 500 K and 1,000 K faint and dashed. ' +
        'It runs from K = 1.0 × 10⁷ at −40 kJ/mol to K = 9.7 × 10⁻⁸ at +40 kJ/mol. A marker at −5 kJ/mol is on it at K = 7.5.',
    );
    expect(describeGraph(0, 1000)).toMatch(
      /The line for 1,000 K is drawn heavy and those for 298 K and 500 K faint and dashed\. It runs from K = 120 at −40 kJ\/mol to K = 8\.1 × 10⁻³ at \+40 kJ\/mol\. A marker at 0 kJ\/mol is on it at K = 1\.0\.$/,
    );
  });

  it('gives the marker the unrounded log K', () => {
    expect(state(-5, 298).logK).toBeCloseTo(5000 / (8.314 * 298 * Math.LN10), 12);
    expect(state(0, 500).logK).toBe(0);
  });
});
