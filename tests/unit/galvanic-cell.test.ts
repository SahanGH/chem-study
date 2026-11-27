import { describe, expect, it } from 'vitest';
import {
  CONCENTRATION,
  EXPONENTS,
  FARADAY,
  GAS_CONSTANT,
  LABELS,
  METAL_IDS,
  METALS,
  NERNST_SLOPE,
  Q_AXIS,
  START,
  TEMPERATURE,
  concentrationText,
  concentrationValueText,
  describeCell,
  describeScales,
  flowText,
  gapText,
  meterText,
  qTickText,
  readout,
  rungText,
  sideLabels,
  state,
  type Exponent,
  type MetalId,
} from '../../src/lib/galvanic-cell';

// Everything below is written out from lesson 9.9's brief, "Diagram data" (the constants, the six
// half-cells, the controls, the model, the readout sentences, the fifteen pairings, the six
// concentration cells, the limits and the thirty-one worked states), apart from the module under test.

const MINUS = '−';

/** An item of a list that must be there: a missing one is an error, never a default. */
function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`The list has no item ${index}; it has ${list.length}.`);
  return item;
}

/** A value of a record that must be there. */
function get<V>(record: Readonly<Record<string, V>>, key: string): V {
  const value = record[key];
  if (value === undefined) throw new Error(`There is no "${key}".`);
  return value;
}

// ---- The brief's half-cells, as the test's own data ----

interface BriefHalfCell {
  name: string;
  symbol: string;
  charge: number;
  /** E° as the table prints it, in volts. */
  volts: number;
  halfReaction: string;
}
const BRIEF: Record<MetalId, BriefHalfCell> = {
  silver: { name: 'silver', symbol: 'Ag', charge: 1, volts: 0.8, halfReaction: 'Ag⁺(aq) + e⁻ → Ag(s)' },
  copper: { name: 'copper', symbol: 'Cu', charge: 2, volts: 0.34, halfReaction: 'Cu²⁺(aq) + 2e⁻ → Cu(s)' },
  tin: { name: 'tin', symbol: 'Sn', charge: 2, volts: -0.14, halfReaction: 'Sn²⁺(aq) + 2e⁻ → Sn(s)' },
  cobalt: { name: 'cobalt', symbol: 'Co', charge: 2, volts: -0.28, halfReaction: 'Co²⁺(aq) + 2e⁻ → Co(s)' },
  cadmium: { name: 'cadmium', symbol: 'Cd', charge: 2, volts: -0.4, halfReaction: 'Cd²⁺(aq) + 2e⁻ → Cd(s)' },
  chromium: { name: 'chromium', symbol: 'Cr', charge: 3, volts: -0.74, halfReaction: 'Cr³⁺(aq) + 3e⁻ → Cr(s)' },
};
const BRIEF_ORDER: MetalId[] = ['silver', 'copper', 'tin', 'cobalt', 'cadmium', 'chromium'];
const BRIEF_EXPONENTS: Exponent[] = [-3, -2, -1, 0];
/** The brief's molarities, as the worked states print them. */
const MOLAR: Record<string, Exponent> = { '1.0': 0, '0.10': -1, '0.010': -2, '0.0010': -3 };
const exponentOf = (molar: string) => get(MOLAR, molar);

interface Setting {
  left: MetalId;
  leftExponent: Exponent;
  right: MetalId;
  rightExponent: Exponent;
}
const ALL: Setting[] = BRIEF_ORDER.flatMap((left) =>
  BRIEF_EXPONENTS.flatMap((leftExponent) =>
    BRIEF_ORDER.flatMap((right) => BRIEF_EXPONENTS.map((rightExponent) => ({ left, leftExponent, right, rightExponent }))),
  ),
);
const of = (s: Setting) => state(s.left, s.leftExponent, s.right, s.rightExponent);
const where = (s: Setting) => `${s.left} 10^${s.leftExponent} M | ${s.right} 10^${s.rightExponent} M`;
const swapped = (s: Setting): Setting => ({ left: s.right, leftExponent: s.rightExponent, right: s.left, rightExponent: s.leftExponent });

// ---- Independent arithmetic, used only by this file ----
//
// The module keeps E° in whole hundredths of a volt, log Q as a whole number and RT ln 10 ÷ F as one
// constant. The test works in volts as decimals, takes n from a greatest common divisor, builds Q as a
// number from the molarities themselves, and takes the natural logarithm of it: E = E° − (RT/nF) ln Q.

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

interface Independent {
  anode: 'left' | 'right' | 'none';
  n: number;
  /** E°cell in volts, rounded to 0.01 V as the brief shows it. */
  standard: number;
  /** ΔG° in kJ/mol_rxn, rounded to the nearest whole number. */
  deltaG: number;
  /** log Q as the brief counts it. */
  logQ: number;
  /** The shift, rounded once to 0.001 V. */
  shift: number;
  /** E as shown: E°cell plus the rounded shift. */
  e: number;
  /** E, unrounded. */
  exact: number;
}

function independent(s: Setting): Independent {
  const l = BRIEF[s.left];
  const r = BRIEF[s.right];
  const molarLeft = Math.pow(10, s.leftExponent);
  const molarRight = Math.pow(10, s.rightExponent);
  const rtOverF = (8.314 * 298.15) / 96485;
  if (s.left === s.right) {
    const z = l.charge;
    if (s.leftExponent === s.rightExponent) return { anode: 'none', n: z, standard: 0, deltaG: 0, logQ: 0, shift: 0, e: 0, exact: 0 };
    const dilute = Math.min(molarLeft, molarRight);
    const concentrated = Math.max(molarLeft, molarRight);
    const q = dilute / concentrated;
    const exact = -(rtOverF / z) * Math.log(q);
    const shift = Math.round(exact * 1000) / 1000;
    return {
      anode: molarLeft < molarRight ? 'left' : 'right',
      n: z,
      standard: 0,
      deltaG: 0,
      logQ: Math.round(Math.log10(q)) + 0,
      shift,
      e: shift,
      exact,
    };
  }
  const anodeSide = l.volts < r.volts ? 'left' : 'right';
  const [a, c] = anodeSide === 'left' ? [l, r] : [r, l];
  const [molarA, molarC] = anodeSide === 'left' ? [molarLeft, molarRight] : [molarRight, molarLeft];
  const n = (a.charge * c.charge) / gcd(a.charge, c.charge);
  const standard = Math.round((c.volts - a.volts) * 100) / 100;
  const deltaG = Math.round((-n * 96485 * standard) / 1000);
  const q = Math.pow(molarA, n / a.charge) / Math.pow(molarC, n / c.charge);
  const exactShift = -(rtOverF / n) * Math.log(q);
  const shift = Math.round(exactShift * 1000) / 1000;
  return {
    anode: anodeSide,
    n,
    standard,
    deltaG,
    // + 0 turns a rounded −0 into 0.
    logQ: Math.round(Math.log10(q)) + 0,
    shift,
    e: Math.round((standard + shift) * 1000) / 1000,
    exact: standard + exactShift,
  };
}

/** The numbers of a state as the brief's tables print them. */
const volts2 = (hundredths: number) => (hundredths / 100).toFixed(2);
const volts3 = (thousandths: number) => (thousandths / 1000).toFixed(3);

// ---- Constants ----

describe('the constants', () => {
  it('are the equation page’s R and F at 298.15 K, with RT ln 10 ÷ F = 0.0591563 V to six figures', () => {
    expect(GAS_CONSTANT).toBe(8.314);
    expect(FARADAY).toBe(96485);
    expect(TEMPERATURE).toBe(298.15);
    expect(Math.abs(NERNST_SLOPE - 0.0591563)).toBeLessThan(5e-8);
  });

  it('are the six half-cells of the brief, in its order, top of the ladder first', () => {
    expect(METAL_IDS).toEqual(BRIEF_ORDER);
    for (const id of BRIEF_ORDER) {
      const brief = BRIEF[id];
      const metal = METALS[id];
      expect(metal.name, id).toBe(brief.name);
      expect(metal.symbol, id).toBe(brief.symbol);
      expect(metal.charge, id).toBe(brief.charge);
      expect(metal.hundredths, id).toBe(Math.round(brief.volts * 100));
      expect(Number.isInteger(metal.hundredths), id).toBe(true);
      expect(metal.halfReaction, id).toBe(brief.halfReaction);
    }
  });

  it('are the four concentrations, kept as powers of ten, and the start: tin and silver, both 1.0 M', () => {
    expect(EXPONENTS).toEqual(BRIEF_EXPONENTS);
    expect(CONCENTRATION).toEqual({ min: -3, max: 0, step: 1 });
    expect(START).toEqual({ left: 'tin', leftExponent: 0, right: 'silver', rightExponent: 0 });
    expect(Q_AXIS).toEqual({ min: -9, max: 9, ticks: [-9, -6, -3, 0, 3, 6, 9] });
  });

  it('shows and speaks each concentration', () => {
    expect(EXPONENTS.map(concentrationText)).toEqual(['0.0010 M', '0.010 M', '0.10 M', '1.0 M']);
    expect(EXPONENTS.map(concentrationValueText)).toEqual(['0.0010 molar', '0.010 molar', '0.10 molar', '1.0 molar']);
  });

  it('labels the rungs, the gap, the Q line and the meter', () => {
    expect(BRIEF_ORDER.map(rungText)).toEqual([
      'Ag⁺/Ag +0.80 V',
      'Cu²⁺/Cu +0.34 V',
      `Sn²⁺/Sn ${MINUS}0.14 V`,
      `Co²⁺/Co ${MINUS}0.28 V`,
      `Cd²⁺/Cd ${MINUS}0.40 V`,
      `Cr³⁺/Cr ${MINUS}0.74 V`,
    ]);
    expect(Q_AXIS.ticks.map(qTickText)).toEqual(['10⁻⁹', '10⁻⁶', '10⁻³', '1', '10³', '10⁶', '10⁹']);
    expect(LABELS.qOne).toBe('Q = 1: E = E°');
    expect(LABELS.electrons).toBe('e⁻');
    expect(LABELS.nitrate).toBe('NO₃⁻');
    expect(LABELS.potassium).toBe('K⁺');
    expect(gapText(state('tin', 0, 'silver', 0))).toBe('E°cell = 0.94 V');
    expect(gapText(state('cobalt', 0, 'cobalt', -3))).toBe('E°cell = 0 V');
    expect(meterText(state('tin', 0, 'silver', 0))).toBe('0.940 V');
    expect(meterText(state('cobalt', 0, 'cobalt', 0))).toBe('0.000 V');
  });
});

// ---- Bad input ----

describe('bad input', () => {
  it('throws a RangeError that names the value', () => {
    expect(() => state('zinc' as MetalId, 0, 'silver', 0)).toThrow(RangeError);
    expect(() => state('zinc' as MetalId, 0, 'silver', 0)).toThrow(/zinc/);
    expect(() => state('tin', 0, 'lead' as MetalId, 0)).toThrow(/lead/);
    for (const bad of [1, -4, -0.5, Number.NaN, 0.1]) {
      expect(() => state('tin', bad as Exponent, 'silver', 0), String(bad)).toThrow(RangeError);
      expect(() => state('tin', 0, 'silver', bad as Exponent), String(bad)).toThrow(RangeError);
      expect(() => concentrationText(bad as Exponent), String(bad)).toThrow(RangeError);
      expect(() => concentrationValueText(bad as Exponent), String(bad)).toThrow(RangeError);
    }
    expect(() => state('tin', 1 as Exponent, 'silver', 0)).toThrow(/\b1\b/);
    expect(() => qTickText(1.5)).toThrow(RangeError);
    expect(() => rungText('iron' as MetalId)).toThrow(/iron/);
  });
});

// ---- The thirty-one worked states ----

// [#, left, left M, right, right M, anode, cathode, n, E°cell, ΔG°, log Q, shift, E]
const WORKED: [number, MetalId, string, MetalId, string, string, string, number, string, string, number, string, string][] = [
  [1, 'tin', '1.0', 'silver', '1.0', 'left', 'right', 2, '0.94', '−181', 0, '0.000', '0.940'],
  [2, 'silver', '1.0', 'tin', '1.0', 'right', 'left', 2, '0.94', '−181', 0, '0.000', '0.940'],
  [3, 'cadmium', '1.0', 'silver', '1.0', 'left', 'right', 2, '1.20', '−232', 0, '0.000', '1.200'],
  [4, 'cobalt', '1.0', 'silver', '1.0', 'left', 'right', 2, '1.08', '−208', 0, '0.000', '1.080'],
  [5, 'chromium', '1.0', 'copper', '1.0', 'left', 'right', 6, '1.08', '−625', 0, '0.000', '1.080'],
  [6, 'tin', '1.0', 'silver', '0.10', 'left', 'right', 2, '0.94', '−181', 2, '−0.059', '0.881'],
  [7, 'tin', '1.0', 'silver', '0.010', 'left', 'right', 2, '0.94', '−181', 4, '−0.118', '0.822'],
  [8, 'tin', '0.10', 'silver', '1.0', 'left', 'right', 2, '0.94', '−181', -1, '+0.030', '0.970'],
  [9, 'tin', '0.0010', 'silver', '1.0', 'left', 'right', 2, '0.94', '−181', -3, '+0.089', '1.029'],
  [10, 'tin', '0.010', 'silver', '0.10', 'left', 'right', 2, '0.94', '−181', 0, '0.000', '0.940'],
  [11, 'cobalt', '1.0', 'cobalt', '1.0', 'none', 'none', 2, '0.00', '0', 0, '0.000', '0.000'],
  [12, 'cobalt', '0.0010', 'cobalt', '1.0', 'left', 'right', 2, '0.00', '0', -3, '+0.089', '0.089'],
  [13, 'cobalt', '1.0', 'cobalt', '0.0010', 'right', 'left', 2, '0.00', '0', -3, '+0.089', '0.089'],
  [14, 'cadmium', '1.0', 'cobalt', '0.0010', 'left', 'right', 2, '0.12', '−23', 3, '−0.089', '0.031'],
  [15, 'chromium', '1.0', 'silver', '0.0010', 'left', 'right', 3, '1.54', '−446', 9, '−0.177', '1.363'],
  [16, 'chromium', '0.0010', 'copper', '1.0', 'left', 'right', 6, '1.08', '−625', -6, '+0.059', '1.139'],
  [17, 'silver', '0.10', 'silver', '0.0010', 'right', 'left', 1, '0.00', '0', -2, '+0.118', '0.118'],
  [18, 'chromium', '0.010', 'chromium', '1.0', 'left', 'right', 3, '0.00', '0', -2, '+0.039', '0.039'],
  [19, 'copper', '0.010', 'tin', '0.10', 'right', 'left', 2, '0.48', '−93', 1, '−0.030', '0.450'],
  [20, 'cadmium', '1.0', 'copper', '1.0', 'left', 'right', 2, '0.74', '−143', 0, '0.000', '0.740'],
  [21, 'chromium', '0.0010', 'chromium', '0.0010', 'none', 'none', 3, '0.00', '0', 0, '0.000', '0.000'],
  [22, 'silver', '0.0010', 'chromium', '1.0', 'right', 'left', 3, '1.54', '−446', 9, '−0.177', '1.363'],
  [23, 'chromium', '0.0010', 'silver', '1.0', 'left', 'right', 3, '1.54', '−446', -3, '+0.059', '1.599'],
  [24, 'silver', '1.0', 'silver', '0.0010', 'right', 'left', 1, '0.00', '0', -3, '+0.177', '0.177'],
  [25, 'cadmium', '1.0', 'silver', '0.0010', 'left', 'right', 2, '1.20', '−232', 6, '−0.177', '1.023'],
  [26, 'chromium', '0.10', 'copper', '0.10', 'left', 'right', 6, '1.08', '−625', 1, '−0.010', '1.070'],
  [27, 'cadmium', '1.0', 'silver', '0.10', 'left', 'right', 2, '1.20', '−232', 2, '−0.059', '1.141'],
  [28, 'tin', '1.0', 'silver', '0.0010', 'left', 'right', 2, '0.94', '−181', 6, '−0.177', '0.763'],
  [29, 'cobalt', '0.10', 'silver', '1.0', 'left', 'right', 2, '1.08', '−208', -1, '+0.030', '1.110'],
  [30, 'cobalt', '0.0010', 'silver', '0.010', 'left', 'right', 2, '1.08', '−208', 1, '−0.030', '1.050'],
  [31, 'cobalt', '0.010', 'silver', '0.10', 'left', 'right', 2, '1.08', '−208', 0, '0.000', '1.080'],
];

describe('the thirty-one worked states', () => {
  it('has thirty-one rows, numbered in order', () => {
    expect(WORKED.map((row) => row[0])).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  for (const [number, left, leftM, right, rightM, anode, cathode, n, standard, deltaG, logQ, shift, e] of WORKED) {
    it(`state ${number}: ${left} ${leftM} M with ${right} ${rightM} M`, () => {
      const s = state(left, exponentOf(leftM), right, exponentOf(rightM));
      expect(s.anode ?? 'none').toBe(anode);
      expect(s.cathode ?? 'none').toBe(cathode);
      expect(s.n).toBe(n);
      expect(volts2(s.standardHundredths)).toBe(standard);
      expect(s.deltaGText).toBe(deltaG);
      expect(s.logQ).toBe(logQ);
      expect(s.shiftText).toBe(shift);
      expect(s.eText).toBe(e);
      // The shown E is the shown E°cell plus the shown shift, in whole thousandths.
      expect(s.eThousandths).toBe(s.standardHundredths * 10 + s.shiftThousandths);
      // And the independent arithmetic agrees.
      const check = independent({ left, leftExponent: exponentOf(leftM), right, rightExponent: exponentOf(rightM) });
      expect(check.anode).toBe(anode);
      expect(check.n).toBe(n);
      expect(check.standard.toFixed(2)).toBe(standard);
      expect(check.logQ).toBe(logQ);
      expect(check.e.toFixed(3)).toBe(e);
    });
  }
});

// ---- The readout sentences ----

describe('the readout', () => {
  it('reads as the brief writes it at the start', () => {
    expect(readout('tin', 0, 'silver', 0)).toBe(
      'Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s). For each mole of reaction, 2 mol of electrons pass through the wire. ' +
        'E°cell = 0.80 − (−0.14) = 0.94 V, and ΔG° = −181 kJ/mol_rxn. Q = [Sn²⁺]/[Ag⁺]² = 1.0. ' +
        'Both solutions are 1.0 M, the standard condition, so E = E°cell: 0.940 V.',
    );
  });

  const HEAD =
    'Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s). For each mole of reaction, 2 mol of electrons pass through the wire. ' +
    'E°cell = 0.80 − (−0.14) = 0.94 V, and ΔG° = −181 kJ/mol_rxn. ';

  it('says Q is 1 away from standard conditions, without calling them standard', () => {
    const text = readout('tin', -2, 'silver', -1);
    expect(text).toBe(`${HEAD}Q = [Sn²⁺]/[Ag⁺]² = 1.0. Q is 1, so E is equal to E°cell: 0.940 V.`);
    expect(text).not.toMatch(/standard condition/);
  });

  it('says Q is below 1 and E above E°cell', () => {
    expect(readout('tin', -3, 'silver', 0)).toBe(`${HEAD}Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10⁻³. Q is below 1, so E is above E°cell: 1.029 V.`);
  });

  it('says Q is above 1 and E below E°cell', () => {
    expect(readout('tin', 0, 'silver', -2)).toBe(`${HEAD}Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10⁴. Q is above 1, so E is below E°cell: 0.822 V.`);
  });

  it('is the same, word for word, with the two sides traded', () => {
    expect(readout('silver', 0, 'tin', 0)).toBe(readout('tin', 0, 'silver', 0));
  });

  it('writes a negative cathode value plainly and a positive anode value without parentheses', () => {
    expect(readout('cobalt', 0, 'tin', 0)).toMatch(/^Co\(s\) \+ Sn²⁺\(aq\) → Co²⁺\(aq\) \+ Sn\(s\)\. .* E°cell = −0\.14 − \(−0\.28\) = 0\.14 V, and ΔG° = −27 kJ\/mol_rxn\./);
    expect(readout('copper', 0, 'silver', 0)).toMatch(/E°cell = 0\.80 − 0\.34 = 0\.46 V, and ΔG° = −89 kJ\/mol_rxn\./);
    expect(readout('chromium', 0, 'copper', 0)).toMatch(
      /^2Cr\(s\) \+ 3Cu²⁺\(aq\) → 2Cr³⁺\(aq\) \+ 3Cu\(s\)\. For each mole of reaction, 6 mol of electrons pass through the wire\. E°cell = 0\.34 − \(−0\.74\) = 1\.08 V, and ΔG° = −625 kJ\/mol_rxn\. Q = \[Cr³⁺\]²\/\[Cu²⁺\]³ = 1\.0\./,
    );
  });

  it('reads as the brief writes it for a concentration cell with unequal concentrations', () => {
    expect(readout('cobalt', -3, 'cobalt', 0)).toBe(
      'Both half-cells are cobalt, so E°cell = 0 V and ΔG° = 0. The half-cell with the lower concentration, the left one, is the anode. ' +
        'For each mole of Co²⁺ made there, 2 mol of electrons pass through the wire. ' +
        'Q = [Co²⁺, dilute]/[Co²⁺, concentrated] = 1.0 × 10⁻³. Q is below 1, so E is above zero: 0.089 V.',
    );
    expect(readout('cobalt', 0, 'cobalt', -3)).toBe(
      'Both half-cells are cobalt, so E°cell = 0 V and ΔG° = 0. The half-cell with the lower concentration, the right one, is the anode. ' +
        'For each mole of Co²⁺ made there, 2 mol of electrons pass through the wire. ' +
        'Q = [Co²⁺, dilute]/[Co²⁺, concentrated] = 1.0 × 10⁻³. Q is below 1, so E is above zero: 0.089 V.',
    );
  });

  it('agrees in number: 1 mol of electrons passes for silver', () => {
    expect(readout('silver', -1, 'silver', -3)).toBe(
      'Both half-cells are silver, so E°cell = 0 V and ΔG° = 0. The half-cell with the lower concentration, the right one, is the anode. ' +
        'For each mole of Ag⁺ made there, 1 mol of electrons passes through the wire. ' +
        'Q = [Ag⁺, dilute]/[Ag⁺, concentrated] = 1.0 × 10⁻². Q is below 1, so E is above zero: 0.118 V.',
    );
  });

  it('reads as the brief writes it for a concentration cell with equal concentrations, with the state’s own metal and molarity', () => {
    expect(readout('cobalt', 0, 'cobalt', 0)).toBe(
      'Both half-cells are cobalt at 1.0 M, so nothing sets them apart. Q = 1 and K = 1: the cell is at equilibrium, E = 0 V and no electrons flow.',
    );
    expect(readout('chromium', -3, 'chromium', -3)).toBe(
      'Both half-cells are chromium at 0.0010 M, so nothing sets them apart. Q = 1 and K = 1: the cell is at equilibrium, E = 0 V and no electrons flow.',
    );
  });

  it('never contradicts itself, at any of the 576 states', () => {
    const TWO = /^(.+)\. For each mole of reaction, (\d) mol of electrons (pass|passes) through the wire\. E°cell = (−?\d\.\d\d) − (\(−\d\.\d\d\)|\d\.\d\d) = (\d\.\d\d) V, and ΔG° = −(\d+) kJ\/mol_rxn\. Q = (\S+) = (1\.0(?: × 10[⁻¹²³⁴⁵⁶⁷⁸⁹]+)?)\. (.+)$/;
    const number = (text: string) => Number(text.replace('(', '').replace(')', '').replace(MINUS, '-'));
    const SUPER: Record<string, string> = { '⁻': '-', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
    const logOf = (q: string) => (q === '1.0' ? 0 : Number([...q.replace('1.0 × 10', '')].map((c) => get(SUPER, c)).join('')));
    for (const setting of ALL) {
      const s = of(setting);
      const text = readout(setting.left, setting.leftExponent, setting.right, setting.rightExponent);
      const w = where(setting);
      if (setting.left !== setting.right) {
        const m = TWO.exec(text);
        if (!m) throw new Error(`${w}: the readout does not have the brief's form: ${text}`);
        const part = (i: number) => {
          const text = m[i];
          if (text === undefined) throw new Error(`${w}: the readout has no part ${i}.`);
          return text;
        };
        const [n, verb, cathode, anode, standard, deltaG, q, tail] = [2, 3, 4, 5, 6, 7, 9, 10].map(part) as [string, string, string, string, string, string, string, string];
        expect(Number(n), w).toBe(s.n);
        expect(verb, w).toBe(Number(n) === 1 ? 'passes' : 'pass');
        // The subtraction is right as printed, in whole hundredths.
        expect(Math.round(number(cathode) * 100) - Math.round(number(anode) * 100), w).toBe(Math.round(number(standard) * 100));
        // ΔG° is −nFE° from the printed E°cell and n, to the nearest kJ.
        expect(Number(deltaG), w).toBe(Math.round((Number(n) * 96485 * number(standard)) / 1000));
        const logQ = logOf(q);
        const shownE = /: (\d\.\d{3}) V\.$/.exec(tail);
        if (!shownE) throw new Error(`${w}: the readout ends without E: ${text}`);
        const e = Number(shownE[1]);
        const shownStandard = number(standard);
        if (logQ === 0) {
          expect(tail, w).toMatch(/so E (= E°cell|is equal to E°cell)/);
          expect(e, w).toBe(shownStandard);
        } else if (logQ < 0) {
          expect(tail, w).toMatch(/^Q is below 1, so E is above E°cell: /);
          expect(e, w).toBeGreaterThan(shownStandard);
        } else {
          expect(tail, w).toMatch(/^Q is above 1, so E is below E°cell: /);
          expect(e, w).toBeLessThan(shownStandard);
        }
        expect(tail, w).toContain(setting.leftExponent === 0 && setting.rightExponent === 0 ? 'the standard condition' : '');
        if (!(setting.leftExponent === 0 && setting.rightExponent === 0)) expect(tail, w).not.toContain('standard');
      } else if (setting.leftExponent === setting.rightExponent) {
        expect(text, w).toMatch(/E = 0 V and no electrons flow\.$/);
      } else {
        const shownE = /so E is above zero: (\d\.\d{3}) V\.$/.exec(text);
        if (!shownE) throw new Error(`${w}: the readout ends without E: ${text}`);
        const e = Number(shownE[1]);
        expect(e, w).toBeGreaterThan(0);
        expect(e, w).toBe(s.eThousandths / 1000);
      }
    }
  });
});

// ---- The fifteen pairings ----

// [anode, cathode, equation, n, E°cell, ΔG°, Q, log Q lowest, log Q highest, largest shift]
const PAIRS: [MetalId, MetalId, string, number, string, string, string, number, number, string][] = [
  ['copper', 'silver', 'Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)', 2, '0.46', '−89', '[Cu²⁺]/[Ag⁺]²', -3, 6, '0.177'],
  ['tin', 'silver', 'Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s)', 2, '0.94', '−181', '[Sn²⁺]/[Ag⁺]²', -3, 6, '0.177'],
  ['tin', 'copper', 'Sn(s) + Cu²⁺(aq) → Sn²⁺(aq) + Cu(s)', 2, '0.48', '−93', '[Sn²⁺]/[Cu²⁺]', -3, 3, '0.089'],
  ['cobalt', 'silver', 'Co(s) + 2Ag⁺(aq) → Co²⁺(aq) + 2Ag(s)', 2, '1.08', '−208', '[Co²⁺]/[Ag⁺]²', -3, 6, '0.177'],
  ['cobalt', 'copper', 'Co(s) + Cu²⁺(aq) → Co²⁺(aq) + Cu(s)', 2, '0.62', '−120', '[Co²⁺]/[Cu²⁺]', -3, 3, '0.089'],
  ['cobalt', 'tin', 'Co(s) + Sn²⁺(aq) → Co²⁺(aq) + Sn(s)', 2, '0.14', '−27', '[Co²⁺]/[Sn²⁺]', -3, 3, '0.089'],
  ['cadmium', 'silver', 'Cd(s) + 2Ag⁺(aq) → Cd²⁺(aq) + 2Ag(s)', 2, '1.20', '−232', '[Cd²⁺]/[Ag⁺]²', -3, 6, '0.177'],
  ['cadmium', 'copper', 'Cd(s) + Cu²⁺(aq) → Cd²⁺(aq) + Cu(s)', 2, '0.74', '−143', '[Cd²⁺]/[Cu²⁺]', -3, 3, '0.089'],
  ['cadmium', 'tin', 'Cd(s) + Sn²⁺(aq) → Cd²⁺(aq) + Sn(s)', 2, '0.26', '−50', '[Cd²⁺]/[Sn²⁺]', -3, 3, '0.089'],
  ['cadmium', 'cobalt', 'Cd(s) + Co²⁺(aq) → Cd²⁺(aq) + Co(s)', 2, '0.12', '−23', '[Cd²⁺]/[Co²⁺]', -3, 3, '0.089'],
  ['chromium', 'silver', 'Cr(s) + 3Ag⁺(aq) → Cr³⁺(aq) + 3Ag(s)', 3, '1.54', '−446', '[Cr³⁺]/[Ag⁺]³', -3, 9, '0.177'],
  ['chromium', 'copper', '2Cr(s) + 3Cu²⁺(aq) → 2Cr³⁺(aq) + 3Cu(s)', 6, '1.08', '−625', '[Cr³⁺]²/[Cu²⁺]³', -6, 9, '0.089'],
  ['chromium', 'tin', '2Cr(s) + 3Sn²⁺(aq) → 2Cr³⁺(aq) + 3Sn(s)', 6, '0.60', '−347', '[Cr³⁺]²/[Sn²⁺]³', -6, 9, '0.089'],
  ['chromium', 'cobalt', '2Cr(s) + 3Co²⁺(aq) → 2Cr³⁺(aq) + 3Co(s)', 6, '0.46', '−266', '[Cr³⁺]²/[Co²⁺]³', -6, 9, '0.089'],
  ['chromium', 'cadmium', '2Cr(s) + 3Cd²⁺(aq) → 2Cr³⁺(aq) + 3Cd(s)', 6, '0.34', '−197', '[Cr³⁺]²/[Cd²⁺]³', -6, 9, '0.089'],
];

describe('the fifteen pairings of two different metals', () => {
  it('are fifteen, each pair once', () => {
    const keys = new Set(PAIRS.map(([a, c]) => [a, c].sort().join('+')));
    expect(keys.size).toBe(15);
  });

  for (const [anode, cathode, equation, n, standard, deltaG, q, lowest, highest, largest] of PAIRS) {
    it(`${anode} with ${cathode}, either way round, at every concentration`, () => {
      const logs: number[] = [];
      let biggest = 0;
      for (const anodeExponent of BRIEF_EXPONENTS) {
        for (const cathodeExponent of BRIEF_EXPONENTS) {
          const asLeft = state(anode, anodeExponent, cathode, cathodeExponent);
          const asRight = state(cathode, cathodeExponent, anode, anodeExponent);
          for (const [s, anodeSide] of [
            [asLeft, 'left'],
            [asRight, 'right'],
          ] as const) {
            expect(s.anode).toBe(anodeSide);
            expect(s.anodeMetal).toBe(anode);
            expect(s.cathodeMetal).toBe(cathode);
            expect(s.equation).toBe(equation);
            expect(s.n).toBe(n);
            expect(volts2(s.standardHundredths)).toBe(standard);
            expect(s.deltaGText).toBe(deltaG);
            expect(s.qExpression).toBe(q);
            expect(s.eThousandths).toBeGreaterThan(0);
          }
          logs.push(asLeft.logQ);
          biggest = Math.max(biggest, Math.abs(asLeft.shiftThousandths));
        }
      }
      expect(Math.min(...logs)).toBe(lowest);
      expect(Math.max(...logs)).toBe(highest);
      expect(volts3(biggest)).toBe(largest);
    });
  }
});

describe('the six concentration cells', () => {
  // E for a ratio of 10, 100 and 1,000 between the two concentrations.
  const CELLS: [MetalId, string, string, string][] = [
    ['silver', '0.059', '0.118', '0.177'],
    ['copper', '0.030', '0.059', '0.089'],
    ['tin', '0.030', '0.059', '0.089'],
    ['cobalt', '0.030', '0.059', '0.089'],
    ['cadmium', '0.030', '0.059', '0.089'],
    ['chromium', '0.020', '0.039', '0.059'],
  ];
  for (const [metal, ten, hundred, thousand] of CELLS) {
    it(`${metal}: ${ten}, ${hundred} and ${thousand} V, whichever side is dilute`, () => {
      for (const [ratio, e] of [
        [1, ten],
        [2, hundred],
        [3, thousand],
      ] as const) {
        for (let high = 0; high >= -3 + ratio; high--) {
          const low = (high - ratio) as Exponent;
          const h = high as Exponent;
          expect(state(metal, low, metal, h).eText).toBe(e);
          expect(state(metal, h, metal, low).eText).toBe(e);
          expect(state(metal, low, metal, h).anode).toBe('left');
          expect(state(metal, h, metal, low).anode).toBe('right');
          expect(state(metal, low, metal, h).n).toBe(BRIEF[metal].charge);
        }
      }
    });
  }
});

// ---- Every one of the 576 states ----

describe('all 576 states', () => {
  it('are 576', () => {
    expect(ALL).toHaveLength(576);
  });

  it('match the independent arithmetic: E° from the two half-cells, n, ΔG° = −nFE°, log Q and the Nernst potential', () => {
    for (const setting of ALL) {
      const s = of(setting);
      const check = independent(setting);
      const w = where(setting);
      expect(s.anode ?? 'none', w).toBe(check.anode);
      expect(s.n, w).toBe(check.n);
      expect(s.standardHundredths / 100, w).toBeCloseTo(check.standard, 10);
      expect(Number(s.deltaGText.replace(MINUS, '-')), w).toBe(check.deltaG === 0 ? 0 : check.deltaG);
      expect(s.logQ, w).toBe(check.logQ);
      expect(s.shiftThousandths / 1000, w).toBeCloseTo(check.shift, 10);
      expect(Number(s.eText), w).toBeCloseTo(check.e, 10);
      expect(Math.abs(s.exactE - check.exact), w).toBeLessThan(1e-12);
    }
  });

  it('keep E°cell in whole hundredths, log Q whole, and show E as E°cell plus the shift rounded once', () => {
    for (const setting of ALL) {
      const s = of(setting);
      const w = where(setting);
      expect(Number.isInteger(s.standardHundredths), w).toBe(true);
      expect(Number.isInteger(s.logQ), w).toBe(true);
      expect(Number.isInteger(s.shiftThousandths), w).toBe(true);
      expect(s.eThousandths, w).toBe(s.standardHundredths * 10 + s.shiftThousandths);
      expect(s.eText, w).toBe(volts3(s.eThousandths));
      // E° cathode minus E° anode, both as the table prints them.
      if (s.anodeMetal !== null && s.cathodeMetal !== null && setting.left !== setting.right) {
        expect(s.standardHundredths, w).toBe(METALS[s.cathodeMetal].hundredths - METALS[s.anodeMetal].hundredths);
      }
      // The shift is never shown as zero for a Q that is not 1.
      if (s.logQ !== 0) expect(s.shiftThousandths, w).not.toBe(0);
    }
  });

  it('run, for two different metals, in the direction E° gives at every concentration: the higher rung is the cathode', () => {
    let lowest = { e: Infinity, w: '' };
    let count = 0;
    for (const setting of ALL) {
      if (setting.left === setting.right) continue;
      count += 1;
      const s = of(setting);
      const w = where(setting);
      const higher = BRIEF[setting.left].volts > BRIEF[setting.right].volts ? 'left' : 'right';
      expect(s.cathode, w).toBe(higher);
      expect(s.exactE, w).toBeGreaterThan(0);
      if (s.exactE < lowest.e) lowest = { e: s.exactE, w };
    }
    expect(count).toBe(480);
    expect(lowest.e.toFixed(3)).toBe('0.031');
    expect([where({ left: 'cadmium', leftExponent: 0, right: 'cobalt', rightExponent: -3 }), where({ left: 'cobalt', leftExponent: -3, right: 'cadmium', rightExponent: 0 })]).toContain(lowest.w);
  });

  it('with one metal: 24 at equilibrium with no direction, and 72 with E from 0.020 to 0.177 V, the dilute side the anode', () => {
    let equal = 0;
    const es: number[] = [];
    for (const setting of ALL) {
      if (setting.left !== setting.right) continue;
      const s = of(setting);
      const w = where(setting);
      expect(s.standardHundredths, w).toBe(0);
      expect(s.deltaGText, w).toBe('0');
      if (setting.leftExponent === setting.rightExponent) {
        equal += 1;
        expect(s.anode, w).toBeNull();
        expect(s.cathode, w).toBeNull();
        expect(s.eThousandths, w).toBe(0);
        expect(s.logQ, w).toBe(0);
        expect(s.flow, w).toEqual({ electrons: null, nitrate: null, potassium: null });
      } else {
        es.push(s.eThousandths);
        expect(s.anode, w).toBe(setting.leftExponent < setting.rightExponent ? 'left' : 'right');
        expect(s.logQ, w).toBe(Math.min(setting.leftExponent, setting.rightExponent) - Math.max(setting.leftExponent, setting.rightExponent));
      }
    }
    expect(equal).toBe(24);
    expect(es).toHaveLength(72);
    expect(volts3(Math.min(...es))).toBe('0.020');
    expect(volts3(Math.max(...es))).toBe('0.177');
  });

  it('reach their highest E, 1.599 V, at chromium 0.0010 M with silver 1.0 M, and log Q runs from −6 to 9', () => {
    const all = ALL.map(of);
    expect(volts3(Math.max(...all.map((s) => s.eThousandths)))).toBe('1.599');
    expect(state('chromium', -3, 'silver', 0).eText).toBe('1.599');
    expect(Math.min(...all.map((s) => s.logQ))).toBe(-6);
    expect(Math.max(...all.map((s) => s.logQ))).toBe(9);
    for (const s of all) {
      expect(s.logQ).toBeGreaterThanOrEqual(Q_AXIS.min);
      expect(s.logQ).toBeLessThanOrEqual(Q_AXIS.max);
    }
  });

  it('sit on no rounding tie: the nearest shift is 0.17747 V, 0.00003 V from 0.1775, and no ΔG° is within 0.06 kJ of a half', () => {
    let nearest = { distance: Infinity, shift: 0 };
    for (const setting of ALL) {
      const s = of(setting);
      const thousandths = Math.abs(s.exactShift) * 1000;
      const distance = Math.abs(thousandths - Math.floor(thousandths) - 0.5) / 1000;
      expect(distance, where(setting)).toBeGreaterThan(1e-9);
      if (distance < nearest.distance) nearest = { distance, shift: Math.abs(s.exactShift) };
    }
    expect(nearest.shift.toFixed(5)).toBe('0.17747');
    expect(nearest.distance.toFixed(5)).toBe('0.00003');
    for (const s of [state('chromium', 0, 'silver', -3), state('silver', -3, 'chromium', 0), state('silver', 0, 'silver', -3)]) {
      expect(Math.abs(s.exactShift).toFixed(5)).toBe('0.17747');
      expect(s.shiftText.slice(1)).toBe('0.177');
    }
    for (const metal of ['copper', 'tin', 'cobalt', 'cadmium'] as const) {
      const s = state(metal, 0, 'silver', -3);
      expect(s.logQ).toBe(6);
      expect(Math.abs(s.exactShift).toFixed(5)).toBe('0.17747');
    }
    // ΔG° in exact hundredths of a joule: n × 96,485 × (E° in hundredths of a volt).
    let nearestG = { distance: Infinity, pair: '' };
    for (const [anode, cathode, , n] of PAIRS) {
      const hundredths = Math.round((BRIEF[cathode].volts - BRIEF[anode].volts) * 100);
      const kJ = (n * 96485 * hundredths) / 100000;
      const distance = Math.abs(kJ - Math.floor(kJ) - 0.5);
      if (distance < nearestG.distance) nearestG = { distance, pair: `${anode}+${cathode}` };
    }
    expect(nearestG.distance).toBeGreaterThanOrEqual(0.06);
    expect(nearestG.pair).toBe('cadmium+silver');
  });

  it('change no number when the sides are traded, and trade the labels', () => {
    for (const setting of ALL) {
      const s = of(setting);
      const t = of(swapped(setting));
      const w = where(setting);
      for (const key of ['n', 'standardHundredths', 'deltaGText', 'logQ', 'shiftThousandths', 'eThousandths', 'eText', 'qText', 'qExpression', 'equation', 'anodeMetal', 'cathodeMetal'] as const) {
        expect(t[key], `${w}: ${key}`).toEqual(s[key]);
      }
      const flip = (side: 'left' | 'right' | null) => (side === null ? null : side === 'left' ? 'right' : 'left');
      expect(t.anode, w).toBe(flip(s.anode));
      expect(t.cathode, w).toBe(flip(s.cathode));
      expect(t.flow, w).toEqual({ electrons: flip(s.flow.electrons), nitrate: flip(s.flow.nitrate), potassium: flip(s.flow.potassium) });
      const ls = sideLabels(s);
      const lt = sideLabels(t);
      expect(lt.left, w).toEqual(ls.right);
      expect(lt.right, w).toEqual(ls.left);
      if (setting.left !== setting.right) {
        expect(readout(swapped(setting).left, swapped(setting).leftExponent, swapped(setting).right, swapped(setting).rightExponent), w).toBe(
          readout(setting.left, setting.leftExponent, setting.right, setting.rightExponent),
        );
      }
      expect(describeScales(t), w).toBe(describeScales(s));
      expect(gapText(t), w).toBe(gapText(s));
    }
  });

  it('send electrons from the anode to the cathode, NO₃⁻ toward the anode and K⁺ toward the cathode', () => {
    for (const setting of ALL) {
      const s = of(setting);
      const w = where(setting);
      expect(s.flow.electrons, w).toBe(s.cathode);
      expect(s.flow.potassium, w).toBe(s.cathode);
      expect(s.flow.nitrate, w).toBe(s.anode);
    }
  });
});

// ---- The balanced equations ----

interface Species {
  coefficient: number;
  symbol: string;
  charge: number;
  phase: string;
}
const SUPERSCRIPT_DIGITS: Record<string, number> = { '¹': 1, '²': 2, '³': 3 };
function parseSide(side: string): Species[] {
  return side.split(' + ').map((term) => {
    const m = /^(\d*)([A-Z][a-z]?)([²³]?)(⁺?)\((s|aq)\)$/.exec(term);
    if (!m) throw new Error(`Not a species: "${term}"`);
    const [, coefficient, symbol, digit, plus] = m as unknown as [string, string, string, string, string, string];
    const charge = plus === '⁺' ? (digit === '' ? 1 : get(SUPERSCRIPT_DIGITS, digit)) : 0;
    return { coefficient: coefficient === '' ? 1 : Number(coefficient), symbol, charge, phase: at(m, 5) };
  });
}
function tally(species: Species[]) {
  const atoms: Record<string, number> = {};
  let charge = 0;
  for (const s of species) {
    atoms[s.symbol] = (s.symbol in atoms ? get(atoms, s.symbol) : 0) + s.coefficient;
    charge += s.coefficient * s.charge;
  }
  return { atoms, charge };
}

describe('every overall equation', () => {
  it('balances in atoms and charge, in lowest whole numbers, with n the least common multiple of the two charges', () => {
    let checked = 0;
    for (const setting of ALL) {
      if (setting.left === setting.right) {
        expect(of(setting).equation, where(setting)).toBeNull();
        continue;
      }
      const s = of(setting);
      const w = where(setting);
      if (s.equation === null) throw new Error(`${w}: no equation`);
      const [reactants, products] = s.equation.split(' → ') as [string, string];
      const left = parseSide(reactants);
      const right = parseSide(products);
      expect(tally(left), w).toEqual(tally(right));
      const coefficients = [...left, ...right].map((x) => x.coefficient);
      expect(coefficients.reduce(gcd), w).toBe(1);
      // The electrons: the metal that is oxidized gives up n in all.
      const metal = left.find((x) => x.phase === 's');
      if (!metal) throw new Error(`${w}: no metal on the left`);
      const ion = right.find((x) => x.symbol === metal.symbol);
      if (!ion) throw new Error(`${w}: no ion of the metal on the right`);
      expect(metal.coefficient * ion.charge, w).toBe(s.n);
      const a = BRIEF[s.anodeMetal ?? 'silver'].charge;
      const c = BRIEF[s.cathodeMetal ?? 'silver'].charge;
      expect(s.n, w).toBe((a * c) / gcd(a, c));
      checked += 1;
    }
    expect(checked).toBe(480);
  });
});

// ---- The labels of the drawing ----

describe('the labels of the drawing', () => {
  it('name the anode and the cathode under their beakers, with the half-reaction as it runs there', () => {
    const start = sideLabels(state('tin', 0, 'silver', 0));
    expect(start.left).toEqual({
      symbol: 'Sn',
      solution: '1.0 M Sn²⁺',
      role: 'anode: oxidation',
      halfReaction: 'Sn(s) → Sn²⁺(aq) + 2e⁻',
      electrode: 'loses mass',
    });
    expect(start.right).toEqual({
      symbol: 'Ag',
      solution: '1.0 M Ag⁺',
      role: 'cathode: reduction',
      halfReaction: 'Ag⁺(aq) + e⁻ → Ag(s)',
      electrode: 'gains mass',
    });
    const traded = sideLabels(state('silver', 0, 'tin', 0));
    expect(traded.left.role).toBe('cathode: reduction');
    expect(traded.right.role).toBe('anode: oxidation');
    expect(sideLabels(state('chromium', -3, 'copper', 0)).left.halfReaction).toBe('Cr(s) → Cr³⁺(aq) + 3e⁻');
    expect(sideLabels(state('chromium', -3, 'copper', 0)).left.solution).toBe('0.0010 M Cr³⁺');
  });

  it('in a concentration cell, name the dilute side the anode', () => {
    const labels = sideLabels(state('cobalt', -3, 'cobalt', 0));
    expect(labels.left.role).toBe('anode: oxidation');
    expect(labels.left.halfReaction).toBe('Co(s) → Co²⁺(aq) + 2e⁻');
    expect(labels.left.electrode).toBe('loses mass');
    expect(labels.right.role).toBe('cathode: reduction');
    expect(labels.right.halfReaction).toBe('Co²⁺(aq) + 2e⁻ → Co(s)');
    expect(labels.right.electrode).toBe('gains mass');
  });

  it('at equilibrium, name neither and say nothing of mass', () => {
    const labels = sideLabels(state('cobalt', 0, 'cobalt', 0));
    for (const side of [labels.left, labels.right]) {
      expect(side.role).toBe('no net reaction');
      expect(side.halfReaction).toBe('Co²⁺(aq) + 2e⁻ ⇌ Co(s)');
      expect(side.electrode).toBeNull();
    }
  });

  it('are said in words too: the flow sentence', () => {
    expect(flowText(state('tin', 0, 'silver', 0))).toBe(
      'Electrons flow through the wire from the tin electrode on the left, the anode, to the silver electrode on the right, the cathode. ' +
        'In the salt bridge, NO₃⁻ ions move toward the left half-cell and K⁺ ions toward the right half-cell.',
    );
    expect(flowText(state('silver', 0, 'tin', 0))).toBe(
      'Electrons flow through the wire from the tin electrode on the right, the anode, to the silver electrode on the left, the cathode. ' +
        'In the salt bridge, NO₃⁻ ions move toward the right half-cell and K⁺ ions toward the left half-cell.',
    );
    expect(flowText(state('cobalt', -3, 'cobalt', 0))).toBe(
      'Electrons flow through the wire from the cobalt electrode on the left, the anode, to the cobalt electrode on the right, the cathode. ' +
        'In the salt bridge, NO₃⁻ ions move toward the left half-cell and K⁺ ions toward the right half-cell.',
    );
    expect(flowText(state('cobalt', 0, 'cobalt', 0))).toBe(
      'No electrons flow and no ions move through the salt bridge: neither electrode is an anode or a cathode.',
    );
  });
});

describe('the names of the drawings', () => {
  it('describe the cell at the start', () => {
    expect(describeCell(state('tin', 0, 'silver', 0))).toBe(
      'A galvanic cell at 25 °C. On the left, a tin electrode stands in 1.0 M Sn²⁺; on the right, a silver electrode stands in 1.0 M Ag⁺. ' +
        'A wire joins the electrodes through a meter reading 0.940 V, and a salt bridge of potassium nitrate joins the solutions. ' +
        'The left half-cell is the anode: oxidation, Sn(s) → Sn²⁺(aq) + 2e⁻, and its electrode loses mass. ' +
        'The right half-cell is the cathode: reduction, Ag⁺(aq) + e⁻ → Ag(s), and its electrode gains mass. ' +
        'An arrow on the wire shows electrons moving from the left electrode to the right one. ' +
        'In the salt bridge, an arrow shows NO₃⁻ moving toward the left half-cell, and an arrow shows K⁺ moving toward the right half-cell.',
    );
  });

  it('describe the cell at equilibrium', () => {
    expect(describeCell(state('cobalt', 0, 'cobalt', 0))).toBe(
      'A galvanic cell at 25 °C. On the left, a cobalt electrode stands in 1.0 M Co²⁺; on the right, a cobalt electrode stands in 1.0 M Co²⁺. ' +
        'A wire joins the electrodes through a meter reading 0.000 V, and a salt bridge of potassium nitrate joins the solutions. ' +
        'Both half-cells are the same, so neither is an anode or a cathode: no electrons flow, and no arrows are drawn.',
    );
  });

  it('describe the ladder and the Q line', () => {
    expect(describeScales(state('tin', 0, 'silver', 0))).toBe(
      'A ladder of the six standard reduction potentials, from Ag⁺/Ag, +0.80 V, at the top to Cr³⁺/Cr, −0.74 V, at the bottom. ' +
        'The rungs for silver and tin are marked, and the gap between them, E°cell, is 0.94 V. ' +
        'Under it, a line for Q on a scale of powers of ten from 10⁻⁹ to 10⁹, with a mark at Q = 1, where E = E°. ' +
        'A marker stands at Q = 1.0.',
    );
    expect(describeScales(state('cobalt', -3, 'cobalt', 0))).toBe(
      'A ladder of the six standard reduction potentials, from Ag⁺/Ag, +0.80 V, at the top to Cr³⁺/Cr, −0.74 V, at the bottom. ' +
        'The rung for cobalt is marked: both half-cells are cobalt, so E°cell = 0 V. ' +
        'Under it, a line for Q on a scale of powers of ten from 10⁻⁹ to 10⁹, with a mark at Q = 1, where E = E°. ' +
        'A marker stands at Q = 1.0 × 10⁻³.',
    );
  });

  it('are true at every state: they name the state’s metals, sides, concentrations, meter reading and Q', () => {
    for (const setting of ALL) {
      const s = of(setting);
      const w = where(setting);
      const cell = describeCell(s);
      expect(cell, w).toContain(`On the left, a ${setting.left} electrode stands in ${concentrationText(setting.leftExponent)} `);
      expect(cell, w).toContain(`on the right, a ${setting.right} electrode stands in ${concentrationText(setting.rightExponent)} `);
      expect(cell, w).toContain(`a meter reading ${s.eText} V`);
      if (s.anode === null) {
        expect(cell, w).toContain('no electrons flow');
        expect(cell, w).not.toMatch(/anode: oxidation|cathode: reduction|loses mass|gains mass/);
      } else {
        expect(cell, w).toContain(`The ${s.anode} half-cell is the anode`);
        expect(cell, w).toContain(`The ${s.cathode} half-cell is the cathode`);
        expect(cell, w).toContain(`electrons moving from the ${s.anode} electrode to the ${s.cathode} one`);
        expect(cell, w).toContain(`NO₃⁻ moving toward the ${s.anode} half-cell`);
        expect(cell, w).toContain(`K⁺ moving toward the ${s.cathode} half-cell`);
      }
      expect(describeScales(s), w).toContain(`A marker stands at Q = ${s.qText}.`);
    }
  });
});

// ---- Words ----

/** Every string the module can produce, over every state. */
function everyString(): string[] {
  const strings: string[] = [...Object.values(LABELS), ...METAL_IDS.map(rungText), ...Q_AXIS.ticks.map(qTickText)];
  for (const id of METAL_IDS) strings.push(METALS[id].label, METALS[id].name, METALS[id].halfReaction, METALS[id].ion);
  for (const e of EXPONENTS) strings.push(concentrationText(e), concentrationValueText(e));
  for (const setting of ALL) {
    const s = of(setting);
    const labels = sideLabels(s);
    strings.push(
      readout(setting.left, setting.leftExponent, setting.right, setting.rightExponent),
      describeCell(s),
      describeScales(s),
      flowText(s),
      gapText(s),
      meterText(s),
      s.qText,
      s.qExpression,
      s.eText,
      s.shiftText,
      s.deltaGText,
      ...Object.values(labels.left).filter((x): x is string => x !== null),
      ...Object.values(labels.right).filter((x): x is string => x !== null),
    );
    if (s.equation !== null) strings.push(s.equation);
  }
  return strings;
}

// A sign after the word ("anode: +", "cathode (−)", "electrode, -") or before it ("+ electrode", "(−) cathode").
const SIGN_AFTER = /(electrode|anode|cathode)s?[\s:,;(]*[+−-]/i;
const SIGN_BEFORE = /[+−-][\s)]*(electrode|anode|cathode)/i;

describe('the words', () => {
  const strings = everyString();

  it('never give an electrode a sign', () => {
    for (const text of strings) {
      expect(text, text).not.toMatch(/\b(positive|negative)\b/i);
      expect(text, text).not.toMatch(/terminal/i);
      // No "+" or "−" (or a hyphen) beside an electrode, an anode or a cathode.
      expect(text, text).not.toMatch(SIGN_AFTER);
      expect(text, text).not.toMatch(SIGN_BEFORE);
    }
  });

  it('use sign patterns that can fail: they match deliberately bad strings', () => {
    for (const bad of ['anode: +', 'cathode (−)', 'the cathode, − side', 'cathode (-)', 'electrode +', '+ electrode', '(−) cathode', 'anode +']) {
      expect(bad, bad).toMatch(new RegExp(`${SIGN_AFTER.source}|${SIGN_BEFORE.source}`, 'i'));
    }
    expect('the anode, Sn(s) → Sn²⁺(aq) + 2e⁻', 'a sign far from the word is not a sign on it').not.toMatch(SIGN_AFTER);
    expect('a cathode', 'no sign').not.toMatch(SIGN_AFTER);
  });

  it('never say "spontaneous", "favorable", "oxidizing agent" or "reducing agent", and use the true minus sign', () => {
    for (const text of strings) {
      expect(text, text).not.toMatch(/spontaneous|favorable|oxidizing agent|reducing agent/i);
      // A hyphen only inside words ("half-cell", "half-cells"), never as a minus.
      expect(text.replace(/[a-z]-[a-z]/gi, ''), text).not.toMatch(/-/);
    }
  });
});
