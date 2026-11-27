import { describe, expect, it } from 'vitest';
import {
  BISECTION,
  KW_25C,
  PRECISION_PH,
  fractionIonized,
  hydronium,
  shortcutHydronium,
  solve,
  weakBaseSolution,
  type Solution,
} from '../../src/lib/acid-base';

// Every pH below is written out from lesson 8.3's brief, "Diagram data: the shared solver": the root
// of the full charge balance to six decimal places, found by the brief's own script with its own
// bisection. The closed forms are written out here, apart from the module under test.

const pH = (solution: Solution) => -Math.log10(hydronium(solution));

/** The positive root of x² + bx − c = 0. */
const positiveRoot = (b: number, c: number) => (-b + Math.sqrt(b * b + 4 * c)) / 2;

/** A strong acid or base alone at concentration c: the larger ion is ½(c + √(c² + 4Kw)). */
const strongIon = (c: number, kw = KW_25C) => (c + Math.sqrt(c * c + 4 * kw)) / 2;

const LACTIC_KA = 10 ** -3.86;
const ETHANOLAMINE_KB = 3.2e-5;

interface Row {
  label: string;
  solution: Solution;
  pH: string;
  /** The closed form's [H₃O⁺], where one exists. */
  closed?: number;
  /** A value worked by hand, to the places it is given: it agrees only that far. */
  byHand?: string;
}

const ROWS: Row[] = [
  { label: 'pure water', solution: {}, pH: '7.000000', closed: Math.sqrt(KW_25C) },
  { label: 'a strong acid at 0.010 M', solution: { anions: 0.01 }, pH: '2.000000', closed: strongIon(0.01) },
  { label: 'a strong acid at 1.0 × 10⁻⁸ M', solution: { anions: 1.0e-8 }, pH: '6.978294', closed: strongIon(1.0e-8) },
  { label: 'a strong base at 0.010 M', solution: { cations: 0.01 }, pH: '12.000000', closed: KW_25C / strongIon(0.01) },
  { label: '0.0037 M Sr(OH)₂', solution: { cations: 0.0074 }, pH: '11.869232', closed: KW_25C / strongIon(0.0074) },
  { label: 'pure water at 10 °C', solution: { kw: 2.9e-15 }, pH: '7.268801', closed: Math.sqrt(2.9e-15) },
  {
    label: 'a weak acid: 0.10 M formic acid',
    solution: { weakAcid: 0.1, ka: 1.8e-4 },
    pH: '2.381576',
    closed: positiveRoot(1.8e-4, 1.8e-4 * 0.1),
  },
  {
    label: 'a weak acid: 0.30 M glycolic acid',
    solution: { weakAcid: 0.3, ka: 1.5e-4 },
    pH: '2.178249',
    closed: positiveRoot(1.5e-4, 1.5e-4 * 0.3),
  },
  {
    label: 'a weak acid: 0.10 M iodic acid',
    solution: { weakAcid: 0.1, ka: 0.17 },
    pH: '1.150926',
    closed: positiveRoot(0.17, 0.17 * 0.1),
  },
  {
    label: 'a buffer: 0.10 M formic acid with 0.10 M sodium formate',
    solution: { weakAcid: 0.2, ka: 1.8e-4, cations: 0.1 },
    pH: '3.746285',
    // h² + (c_b + Ka)h − Ka c_a = 0, with c_a = c_b = 0.10.
    closed: positiveRoot(0.1 + 1.8e-4, 1.8e-4 * 0.1),
  },
  {
    label: 'half-equivalence: 1.50 mmol each of lactic acid and lactate in 27.5 mL',
    solution: { weakAcid: 3.0 / 27.5, ka: LACTIC_KA, cations: 1.5 / 27.5 },
    pH: '3.862187',
    closed: positiveRoot(1.5 / 27.5 + LACTIC_KA, LACTIC_KA * (1.5 / 27.5)),
  },
  {
    label: 'the equivalence point: 3.00 mmol of sodium lactate in 35.0 mL',
    solution: { weakAcid: 3.0 / 35.0, ka: LACTIC_KA, cations: 3.0 / 35.0 },
    pH: '8.396870',
    byHand: '8.3965',
  },
  {
    label: 'excess base: 3.00 mmol of lactate and 0.60 mmol of OH⁻ in 38.0 mL',
    solution: { weakAcid: 3.0 / 38.0, ka: LACTIC_KA, cations: 3.6 / 38.0 },
    pH: '12.198368',
    byHand: '12.1984',
  },
  {
    label: 'a weak base: 0.25 M ethanolamine',
    solution: { weakAcid: 0.25, ka: 3.125e-10, cations: 0.25 },
    pH: '11.449088',
    // [OH⁻] = ½(−Kb + √(Kb² + 4 Kb C)).
    closed: KW_25C / positiveRoot(ETHANOLAMINE_KB, ETHANOLAMINE_KB * 0.25),
  },
  {
    label: 'a base buffer: 0.10 M ethanolamine with 0.10 M of its chloride salt',
    solution: { weakAcid: 0.2, ka: 3.125e-10, cations: 0.2, anions: 0.1 },
    pH: '9.504872',
    // [OH⁻]² + (c_a + Kb)[OH⁻] − Kb c_b = 0, with c_a = c_b = 0.10.
    closed: KW_25C / positiveRoot(0.1 + ETHANOLAMINE_KB, ETHANOLAMINE_KB * 0.1),
  },
];

describe('the solver against the brief', () => {
  it('has the constants the brief states: 60 halvings from pH −2 to pH 16, a precision of 1e-9 in pH, Kw = 1.0e-14', () => {
    expect(BISECTION).toEqual({ lowPH: -2, highPH: 16, halvings: 60 });
    expect(PRECISION_PH).toBe(1e-9);
    expect(KW_25C).toBe(1.0e-14);
    // The last interval is 18 / 2⁶⁰ pH units wide, far below the stated precision.
    expect((BISECTION.highPH - BISECTION.lowPH) / 2 ** BISECTION.halvings).toBeLessThan(PRECISION_PH);
  });

  for (const row of ROWS) {
    it(`gives the brief's pH for ${row.label}: ${row.pH}`, () => {
      const value = pH(row.solution);
      // Six decimal places, rounded: the root lies within half a millionth of the printed value.
      expect(value.toFixed(6)).toBe(row.pH);
      expect(Math.abs(value - Number(row.pH))).toBeLessThanOrEqual(5e-7);
    });

    if (row.closed !== undefined) {
      const closed = row.closed;
      it(`agrees with the closed form for ${row.label} to better than 1e-8 in pH`, () => {
        expect(Math.abs(pH(row.solution) + Math.log10(closed))).toBeLessThan(1e-8);
      });
    }

    if (row.byHand !== undefined) {
      const byHand = row.byHand;
      // No closed form is exact here: the hand value leaves something out (the weak acid formed
      // back, or water's own ions), so it agrees to a thousandth of a pH unit, not to its last place.
      it(`agrees with the value worked by hand for ${row.label}, ${byHand}, to 0.001`, () => {
        expect(Math.abs(pH(row.solution) - Number(byHand))).toBeLessThan(0.001);
      });
    }

    it(`balances the charges at the root for ${row.label}`, () => {
      const s = solve(row.solution);
      const cations = row.solution.cations ?? 0;
      const anions = row.solution.anions ?? 0;
      const positive = s.hydronium + cations;
      const negative = s.hydroxide + anions + s.baseForm;
      expect(Math.abs(positive - negative)).toBeLessThanOrEqual(1e-8 * Math.max(positive, negative));
    });
  }

  it('the strong acid at 1.0 × 10⁻⁸ M is a little below 7, not 8: water’s own ions count', () => {
    expect(pH({ anions: 1.0e-8 })).toBeLessThan(7);
    expect(pH({ anions: 1.0e-8 })).toBeGreaterThan(6.9);
  });

  it('for a weak base the mapping is the whole of C in the cations; with only the base put in as cations it comes out acidic, near 5.10', () => {
    // The wrong mapping, written out so that no one returns to it.
    expect(pH({ weakAcid: 0.2, ka: KW_25C / ETHANOLAMINE_KB, cations: 0.1, anions: 0.1 }).toFixed(2)).toBe('5.10');
    // The base buffer sits at the pKa of the conjugate acid, 9.505.
    expect(Math.abs(pH({ weakAcid: 0.2, ka: KW_25C / ETHANOLAMINE_KB, cations: 0.2, anions: 0.1 }) + Math.log10(KW_25C / ETHANOLAMINE_KB))).toBeLessThan(
      0.001,
    );
  });

  it('a weak base alone takes the same inputs as a salt of the weak acid alone', () => {
    const base = solve({ weakAcid: 0.25, ka: 3.125e-10, cations: 0.25 });
    // What it returns as the base form is [B] and as the acid form [HB⁺]; [HB⁺] = [OH⁻] nearly.
    expect(Math.abs(base.acidForm - base.hydroxide) / base.hydroxide).toBeLessThan(1e-6);
    expect(base.baseForm + base.acidForm).toBeCloseTo(0.25, 12);
  });
});

describe('what the solver returns besides [H₃O⁺]', () => {
  it('gives [OH⁻] = Kw/h, [A⁻] = C Ka/(Ka + h) and [HA] = C h/(Ka + h), and the pH, from the root alone', () => {
    const solution = { weakAcid: 0.3, ka: 1.5e-4 };
    const s = solve(solution);
    const h = hydronium(solution);
    expect(s.hydronium).toBe(h);
    expect(s.pH).toBe(-Math.log10(h));
    expect(s.hydroxide).toBe(KW_25C / h);
    expect(s.baseForm).toBe((0.3 * 1.5e-4) / (1.5e-4 + h));
    expect(s.acidForm).toBe((0.3 * h) / (1.5e-4 + h));
    expect(s.acidForm + s.baseForm).toBeCloseTo(0.3, 14);
  });

  it('gives no acid or base form when there is no weak acid', () => {
    const s = solve({ anions: 0.01 });
    expect(s.acidForm).toBe(0);
    expect(s.baseForm).toBe(0);
  });

  it('uses the Kw it is given', () => {
    const s = solve({ kw: 2.9e-15 });
    expect(s.hydroxide).toBe(2.9e-15 / s.hydronium);
  });

  it('gives a pinned root, to well beyond 1e-9 in pH, and the same root when the defaults are written out', () => {
    expect(hydronium({ weakAcid: 0.1, ka: 1.8e-4 })).toBeCloseTo(4.153595e-3, 9);
    expect(hydronium({ weakAcid: 0.1, ka: 1.8e-4, cations: 0, anions: 0, kw: KW_25C })).toBe(hydronium({ weakAcid: 0.1, ka: 1.8e-4 }));
  });

  it('finds the root for a very dilute solution, 1e-300 M, at pH 7', () => {
    expect(pH({ anions: 1e-300 })).toBeCloseTo(7, 9);
    expect(pH({ weakAcid: 1e-300, ka: 1e-5 })).toBeCloseTo(7, 9);
  });

  it('finds the root with a weak acid, cations and anions together, just under 10 M', () => {
    const solution = { weakAcid: 9.99, ka: 1e-5, cations: 9.99, anions: 9.99 };
    const s = solve(solution);
    const positive = s.hydronium + 9.99;
    const negative = s.hydroxide + 9.99 + s.baseForm;
    expect(Math.abs(positive - negative)).toBeLessThanOrEqual(1e-8 * Math.max(positive, negative));
    expect(s.pH).toBeGreaterThan(BISECTION.lowPH);
    expect(s.pH).toBeLessThan(BISECTION.highPH);
  });

  it('does not overflow for a Ka near the largest number', () => {
    expect(pH({ weakAcid: 2, ka: Number.MAX_VALUE })).toBeCloseTo(pH({ anions: 0, cations: 0, weakAcid: 2, ka: 1e100 }), 6);
  });

  it('ignores Ka when there is no weak acid, whatever it is, and needs none', () => {
    expect(hydronium({ weakAcid: 0, ka: 0.5, anions: 0.01 })).toBe(hydronium({ anions: 0.01 }));
    for (const ka of [-1, 0, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(hydronium({ weakAcid: 0, ka, anions: 0.01 })).toBe(hydronium({ anions: 0.01 }));
    }
    expect(hydronium({ weakAcid: 0, anions: 0.01 })).toBe(hydronium({ anions: 0.01 }));
  });

  it('finds a root inside the interval for the strongest solutions it takes', () => {
    const acid = pH({ anions: 9.9 });
    const base = pH({ cations: 9.9 });
    expect(acid).toBeGreaterThan(BISECTION.lowPH);
    expect(base).toBeLessThan(BISECTION.highPH);
    expect(Math.abs(acid + Math.log10(strongIon(9.9)))).toBeLessThan(1e-9);
  });

  it('raises the pH steadily as a weak acid is diluted, with no seam', () => {
    const values = Array.from({ length: 61 }, (_, k) => pH({ weakAcid: 10 ** (-k / 20), ka: 1.8e-4 }));
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1] ?? Number.NaN);
  });
});

describe('the shortcut', () => {
  it('is √(Ka C) and nothing else', () => {
    expect(shortcutHydronium(1.5e-4, 0.3)).toBe(Math.sqrt(1.5e-4 * 0.3));
    expect(shortcutHydronium(1.8e-4, 0.1)).toBe(Math.sqrt(1.8e-4 * 0.1));
    // The brief's worked example: x = 6.708 × 10⁻³ for 0.30 M glycolic acid, pH 2.1734.
    expect(shortcutHydronium(1.5e-4, 0.3).toPrecision(4)).toBe('0.006708');
    expect((-Math.log10(shortcutHydronium(1.5e-4, 0.3))).toFixed(4)).toBe('2.1734');
  });

  it('can give more hydronium than there is acid, as for 0.10 M iodic acid (0.13 M)', () => {
    expect(shortcutHydronium(0.17, 0.1).toFixed(2)).toBe('0.13');
  });

  it('refuses a Ka that is not positive and a negative concentration', () => {
    expect(() => shortcutHydronium(0, 0.1)).toThrow(RangeError);
    expect(() => shortcutHydronium(0, 0.1)).toThrow(/0/);
    expect(() => shortcutHydronium(1e-4, -0.1)).toThrow(/-0\.1/);
  });

  it('refuses a concentration that is not a number, and a concentration of zero', () => {
    expect(() => shortcutHydronium(1e-4, Number.NaN)).toThrow(RangeError);
    expect(() => shortcutHydronium(1e-4, Number.NaN)).toThrow(/NaN/);
    expect(() => shortcutHydronium(1e-4, 0)).toThrow(RangeError);
    expect(() => shortcutHydronium(1e-4, 0)).toThrow(/concentration/);
  });
});

describe('bad input', () => {
  const cases: [string, Solution, RegExp][] = [
    ['a negative weak acid concentration', { weakAcid: -0.1, ka: 1e-4 }, /weak acid.*-0\.1/],
    ['a negative cation concentration', { cations: -0.01 }, /cations.*-0\.01/],
    ['a negative anion concentration', { anions: -0.02 }, /anions.*-0\.02/],
    ['a Ka of zero', { weakAcid: 0.1, ka: 0 }, /Ka.*\b0\b/],
    ['a negative Ka', { weakAcid: 0.1, ka: -1e-5 }, /Ka.*-0\.00001/],
    ['a weak acid with no Ka', { weakAcid: 0.1 }, /Ka.*undefined/],
    ['a Kw of zero', { kw: 0 }, /Kw.*\b0\b/],
    ['a negative Kw', { kw: -1e-14 }, /Kw.*-1e-14/],
    ['a concentration that is not a number', { anions: Number.NaN }, /anions.*NaN/],
    ['an infinite concentration', { cations: Number.POSITIVE_INFINITY }, /cations.*Infinity/],
    ['an infinite Ka', { weakAcid: 0.1, ka: Number.POSITIVE_INFINITY }, /Ka.*Infinity/],
    ['a Kw that is not a number', { kw: Number.NaN }, /Kw.*NaN/],
    ['an infinite Kw', { kw: Number.POSITIVE_INFINITY }, /Kw.*Infinity/],
    ['a concentration of 10 M', { anions: 10 }, /anions.*10\b/],
    ['a weak acid at 12 M', { weakAcid: 12, ka: 1e-5 }, /weak acid.*12\b/],
  ];
  for (const [what, solution, message] of cases) {
    it(`throws a RangeError that names the value for ${what}`, () => {
      expect(() => hydronium(solution)).toThrow(RangeError);
      expect(() => hydronium(solution)).toThrow(message);
      expect(() => solve(solution)).toThrow(RangeError);
    });
  }

  it('throws a RangeError that names Kw when the root lies outside the pH interval', () => {
    expect(() => hydronium({ kw: 1e10 })).toThrow(RangeError);
    expect(() => hydronium({ kw: 1e10 })).toThrow(/Kw = 10000000000\b/);
    expect(() => solve({ kw: 1e10 })).toThrow(RangeError);
    expect(() => hydronium({ kw: 1e-40 })).toThrow(RangeError);
    expect(() => hydronium({ kw: 1e-40 })).toThrow(/Kw = 1e-40/);
    expect(() => hydronium({ weakAcid: 0.1, ka: 1e-5, kw: 1e10 })).toThrow(/Kw/);
  });

  it('takes a concentration just under 10 M', () => {
    expect(() => hydronium({ anions: 9.99 })).not.toThrow();
  });
});

describe('fractionIonized', () => {
  it('is Ka/(Ka + h)', () => {
    expect(fractionIonized(1.8e-4, 1.8e-4)).toBe(0.5);
    const h = hydronium({ weakAcid: 0.1, ka: 1.8e-4 });
    expect(fractionIonized(1.8e-4, h)).toBe(1.8e-4 / (1.8e-4 + h));
    // About h/C, the shortcut's own fraction, since water's ions add only a little.
    expect(fractionIonized(1.8e-4, h)).toBeCloseTo(h / 0.1, 6);
  });

  it('refuses a Ka or an [H₃O⁺] that is not positive', () => {
    expect(() => fractionIonized(0, 1e-3)).toThrow(/Ka/);
    expect(() => fractionIonized(1e-4, 0)).toThrow(RangeError);
    expect(() => fractionIonized(1e-4, Number.NaN)).toThrow(/NaN/);
  });
});

describe('weakBaseSolution', () => {
  it('maps a base with its conjugate acid: weak acid = B + HB⁺, Ka = Kw/Kb, cations = B + HB⁺, anions = HB⁺', () => {
    const solution = weakBaseSolution({ base: 0.1, conjugateAcid: 0.1, kb: ETHANOLAMINE_KB });
    expect(solution.weakAcid).toBeCloseTo(0.2, 15);
    expect(solution.ka).toBe(KW_25C / ETHANOLAMINE_KB);
    expect(solution.cations).toBeCloseTo(0.2, 15);
    expect(solution.anions).toBe(0.1);
    expect(solution.kw).toBe(KW_25C);
  });

  it('adds other cations and anions to the right sides, and uses the Kw it is given', () => {
    const solution = weakBaseSolution({ base: 0.1, conjugateAcid: 0.05, kb: 1e-5, cations: 0.02, anions: 0.03, kw: 2.9e-15 });
    expect(solution.weakAcid).toBeCloseTo(0.15, 15);
    expect(solution.ka).toBe(2.9e-15 / 1e-5);
    expect(solution.cations).toBeCloseTo(0.17, 15);
    expect(solution.anions).toBeCloseTo(0.08, 15);
    expect(solution.kw).toBe(2.9e-15);
  });

  it('gives the base buffer at pH 9.504872, the pKa of the conjugate acid, not the 5.10 of the wrong mapping', () => {
    const solution = weakBaseSolution({ base: 0.1, conjugateAcid: 0.1, kb: ETHANOLAMINE_KB });
    expect(pH(solution).toFixed(6)).toBe('9.504872');
    expect(pH(solution)).toBeCloseTo(pH({ weakAcid: 0.2, ka: 3.125e-10, cations: 0.2, anions: 0.1 }), 9);
    const [b, hb] = [solve(solution).baseForm, solve(solution).acidForm];
    expect(b).toBeCloseTo(0.1, 3);
    expect(hb).toBeCloseTo(0.1, 3);
  });

  it('gives a plain weak base, 0.25 M ethanolamine, at pH 11.449088', () => {
    const solution = weakBaseSolution({ base: 0.25, kb: ETHANOLAMINE_KB });
    expect(solution.anions).toBe(0);
    expect(pH(solution).toFixed(6)).toBe('11.449088');
    const s = solve(solution);
    // [HB⁺] = [OH⁻] nearly, and B + HB⁺ is the whole 0.25 M.
    expect(Math.abs(s.acidForm - s.hydroxide) / s.hydroxide).toBeLessThan(1e-6);
    expect(s.acidForm + s.baseForm).toBeCloseTo(0.25, 12);
  });

  it('throws a RangeError that names the value for a bad Kb, Kw or concentration', () => {
    expect(() => weakBaseSolution({ base: 0.1, kb: 0 })).toThrow(/Kb.*\b0\b/);
    expect(() => weakBaseSolution({ base: 0.1, kb: Number.NaN })).toThrow(/Kb.*NaN/);
    expect(() => weakBaseSolution({ base: 0.1, kb: 1e-5, kw: -1 })).toThrow(/Kw.*-1/);
    expect(() => weakBaseSolution({ base: -0.1, kb: 1e-5 })).toThrow(/weak base.*-0\.1/);
    expect(() => weakBaseSolution({ base: 0.1, conjugateAcid: -0.2, kb: 1e-5 })).toThrow(/conjugate acid.*-0\.2/);
  });

  it('refuses a total of cations that reaches 10 M, since the base itself counts among them', () => {
    expect(() => hydronium(weakBaseSolution({ base: 6, kb: 1e-5, cations: 5 }))).toThrow(/cations.*11/);
  });
});
