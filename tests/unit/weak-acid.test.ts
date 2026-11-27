import { describe, expect, it } from 'vitest';
import { hydronium } from '../../src/lib/acid-base';
import {
  ACID_IDS,
  ACIDS,
  AXES,
  BOX,
  CHECK_LIMIT,
  CONCENTRATION_UNITS,
  GUIDE_PERCENT,
  IONIZATION_ORDER,
  KEY,
  PARTICLES,
  SLIDER,
  START,
  UNITS_PER_MOLAR,
  concentrationText,
  concentrationValueText,
  countText,
  curve,
  describeBox,
  describeGraph,
  particles,
  readout,
  shownConcentration,
  shownPercent,
  shownPH,
  state,
  type AcidId,
} from '../../src/lib/weak-acid';

// Everything below is written out from lesson 8.3's brief, "Diagram data: the weak-acid explorer",
// apart from the module under test: the acids, the ten concentrations, the thirty worked states,
// the limits and the readout sentences.

const TITLE: Record<AcidId, string> = { chloroacetic: 'Chloroacetic', formic: 'Formic', butanoic: 'Butanoic' };
const ID: Record<string, AcidId> = { Chloroacetic: 'chloroacetic', Formic: 'formic', Butanoic: 'butanoic' };
const CONCENTRATIONS = ['1.0', '0.50', '0.20', '0.10', '0.050', '0.020', '0.010', '0.0050', '0.0020', '0.0010'];
const positionOf = (c: string) => CONCENTRATIONS.indexOf(c);

// The brief's table: acid, C, [H₃O⁺], pH, percent, ions, shortcut pH, check, shortcut, strong pH.
const TABLE = `
Formic | 0.10 | 4.2 × 10⁻³ | 2.38 | 4.2 | 4 | 2.37 | 4.2 | passes | 1.00
Formic | 0.0010 | 3.4 × 10⁻⁴ | 3.46 | 34 | 34 | 3.37 | 42 | fails | 3.00
Butanoic | 0.10 | 1.2 × 10⁻³ | 2.91 | 1.2 | 1 | 2.91 | 1.2 | passes | 1.00
Chloroacetic | 0.10 | 1.1 × 10⁻² | 1.95 | 11 | 11 | 1.93 | 12 | fails | 1.00
Chloroacetic | 1.0 | 3.7 × 10⁻² | 1.44 | 3.7 | 4 | 1.43 | 3.7 | passes | 0.00
Chloroacetic | 0.50 | 2.6 × 10⁻² | 1.59 | 5.2 | 5 | 1.58 | 5.3 | fails | 0.30
Chloroacetic | 0.20 | 1.6 × 10⁻² | 1.79 | 8.0 | 8 | 1.78 | 8.4 | fails | 0.70
Chloroacetic | 0.050 | 7.7 × 10⁻³ | 2.11 | 15 | 15 | 2.08 | 17 | fails | 1.30
Chloroacetic | 0.020 | 4.6 × 10⁻³ | 2.33 | 23 | 23 | 2.28 | 26 | fails | 1.70
Chloroacetic | 0.010 | 3.1 × 10⁻³ | 2.51 | 31 | 31 | 2.43 | 37 | fails | 2.00
Chloroacetic | 0.0050 | 2.0 × 10⁻³ | 2.69 | 41 | 41 | 2.58 | 53 | fails | 2.30
Chloroacetic | 0.0020 | 1.1 × 10⁻³ | 2.95 | 56 | 56 | 2.78 | 84 | fails | 2.70
Chloroacetic | 0.0010 | 6.7 × 10⁻⁴ | 3.17 | 67 | 67 | 2.93 | 118 | fails | 3.00
Formic | 1.0 | 1.3 × 10⁻² | 1.88 | 1.3 | 1 | 1.87 | 1.3 | passes | 0.00
Formic | 0.50 | 9.4 × 10⁻³ | 2.03 | 1.9 | 2 | 2.02 | 1.9 | passes | 0.30
Formic | 0.20 | 5.9 × 10⁻³ | 2.23 | 3.0 | 3 | 2.22 | 3.0 | passes | 0.70
Formic | 0.050 | 2.9 × 10⁻³ | 2.54 | 5.8 | 6 | 2.52 | 6.0 | fails | 1.30
Formic | 0.020 | 1.8 × 10⁻³ | 2.74 | 9.0 | 9 | 2.72 | 9.5 | fails | 1.70
Formic | 0.010 | 1.3 × 10⁻³ | 2.90 | 13 | 13 | 2.87 | 13 | fails | 2.00
Formic | 0.0050 | 8.6 × 10⁻⁴ | 3.06 | 17 | 17 | 3.02 | 19 | fails | 2.30
Formic | 0.0020 | 5.2 × 10⁻⁴ | 3.29 | 26 | 26 | 3.22 | 30 | fails | 2.70
Butanoic | 1.0 | 3.9 × 10⁻³ | 2.41 | 0.39 | 0 | 2.41 | 0.39 | passes | 0.00
Butanoic | 0.50 | 2.7 × 10⁻³ | 2.56 | 0.55 | 1 | 2.56 | 0.55 | passes | 0.30
Butanoic | 0.20 | 1.7 × 10⁻³ | 2.76 | 0.86 | 1 | 2.76 | 0.87 | passes | 0.70
Butanoic | 0.050 | 8.6 × 10⁻⁴ | 3.07 | 1.7 | 2 | 3.06 | 1.7 | passes | 1.30
Butanoic | 0.020 | 5.4 × 10⁻⁴ | 3.27 | 2.7 | 3 | 3.26 | 2.7 | passes | 1.70
Butanoic | 0.010 | 3.8 × 10⁻⁴ | 3.42 | 3.8 | 4 | 3.41 | 3.9 | passes | 2.00
Butanoic | 0.0050 | 2.7 × 10⁻⁴ | 3.57 | 5.3 | 5 | 3.56 | 5.5 | fails | 2.30
Butanoic | 0.0020 | 1.7 × 10⁻⁴ | 3.78 | 8.3 | 8 | 3.76 | 8.7 | fails | 2.70
Butanoic | 0.0010 | 1.2 × 10⁻⁴ | 3.94 | 12 | 12 | 3.91 | 12 | fails | 3.00
`;

interface Row {
  acid: AcidId;
  c: string;
  position: number;
  h: string;
  pH: string;
  percent: string;
  ions: number;
  shortcutPH: string;
  check: string;
  passes: boolean;
  strongPH: string;
}

const ROWS: Row[] = TABLE.trim()
  .split('\n')
  .map((line) => {
    const [acid, c, h, pH, percent, ions, shortcutPH, check, verdict, strongPH] = line.split(' | ');
    if (!acid || !c || !h || !pH || !percent || !ions || !shortcutPH || !check || !verdict || !strongPH) throw new Error(`A bad row: ${line}`);
    const id = ID[acid];
    if (!id) throw new Error(`An unknown acid: ${acid}`);
    return { acid: id, c, position: positionOf(c), h, pH, percent, ions: Number(ions), shortcutPH, check, passes: verdict === 'passes', strongPH };
  });

/** The readout, assembled from the brief's own row as its three sentence patterns word it. */
function sentence(row: Row): string {
  const opening = `${TITLE[row.acid]} acid at ${row.c} M: [H₃O⁺] = ${row.h} M and the pH is ${row.pH}. Of the acid, ${row.percent} percent is ionized`;
  const few = row.ions === 0 ? ', fewer than 1 molecule in 100. ' : '. ';
  const shortcut = row.passes
    ? `The shortcut gives a pH of ${row.shortcutPH}, and its check comes to ${row.check} percent, under 5, so it passes. `
    : Number(row.check) > 100
      ? `The shortcut gives a pH of ${row.shortcutPH}, but its check comes to ${row.check} percent, more acid than there is, so it fails here. `
      : `The shortcut gives a pH of ${row.shortcutPH}, but its check comes to ${row.check} percent, over 5, so it fails here. `;
  return `${opening}${few}${shortcut}A strong acid at ${row.c} M would have a pH of ${row.strongPH}.`;
}

const every = ACID_IDS.flatMap((acid) => CONCENTRATIONS.map((_, position) => ({ acid, position })));

describe('the constants', () => {
  it('offers chloroacetic, formic and butanoic acid, in that order, with the brief’s Ka values', () => {
    expect(ACID_IDS).toEqual(['chloroacetic', 'formic', 'butanoic']);
    expect(ACIDS.chloroacetic.ka).toBe(1.4e-3);
    expect(ACIDS.formic.ka).toBe(1.8e-4);
    expect(ACIDS.butanoic.ka).toBe(1.5e-5);
    expect(ACIDS.chloroacetic.label).toBe('Chloroacetic acid, HC₂H₂ClO₂');
    expect(ACIDS.formic.label).toBe('Formic acid, HCHO₂');
    expect(ACIDS.butanoic.label).toBe('Butanoic acid, HC₄H₇O₂');
    // About 93 : 12 : 1.
    expect(ACIDS.chloroacetic.ka / ACIDS.butanoic.ka).toBeCloseTo(93.3, 1);
    expect(ACIDS.formic.ka / ACIDS.butanoic.ka).toBeCloseTo(12, 10);
  });

  it('has ten concentrations in whole ten-thousandths of a mole per liter, from 1.0 M down to 0.0010 M', () => {
    expect(UNITS_PER_MOLAR).toBe(10_000);
    expect(CONCENTRATION_UNITS).toEqual([10_000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10]);
    expect(CONCENTRATION_UNITS.map((_, i) => concentrationText(i))).toEqual(CONCENTRATIONS);
    expect(SLIDER).toEqual({ min: 0, max: 9, step: 1 });
  });

  it('starts at formic acid, 0.10 M, the fourth position', () => {
    expect(START).toEqual({ acid: 'formic', position: 3 });
    expect(concentrationText(START.position)).toBe('0.10');
  });

  it('speaks the slider’s value as a concentration in words', () => {
    expect(concentrationValueText(3)).toBe('0.10 molar');
    expect(concentrationValueText(0)).toBe('1.0 molar');
    expect(concentrationValueText(9)).toBe('0.0010 molar');
  });

  it('checks the shortcut against 5 percent, draws 100 particles and plots up to 70 percent', () => {
    expect(CHECK_LIMIT).toBe(5);
    expect(GUIDE_PERCENT).toBe(5);
    expect(PARTICLES).toBe(100);
    expect(AXES.percentMax).toBe(70);
    expect(AXES.percentTicks).toEqual([0, 10, 20, 30, 40, 50, 60, 70]);
    expect(AXES.concentrationTicks.map((t) => [t.log, t.text])).toEqual([
      [0, '1'],
      [-1, '0.1'],
      [-2, '0.01'],
      [-3, '0.001'],
    ]);
    expect([AXES.logLeft, AXES.logRight]).toEqual([0, -3]);
  });
});

describe('the thirty worked states', () => {
  it('lists every state once', () => {
    expect(ROWS).toHaveLength(30);
    expect(new Set(ROWS.map((r) => `${r.acid} ${r.c}`)).size).toBe(30);
    for (const row of ROWS) expect(row.position).toBeGreaterThanOrEqual(0);
  });

  for (const row of ROWS) {
    const where = `${row.acid} acid at ${row.c} M`;
    it(`${where}: ${row.h} M, pH ${row.pH}, ${row.percent} percent, ${row.ions} ions, shortcut ${row.shortcutPH} at ${row.check} percent (${row.passes ? 'passes' : 'fails'}), strong ${row.strongPH}`, () => {
      const s = state(row.acid, row.position);
      expect(s.concentrationText).toBe(row.c);
      expect(s.hydroniumText).toBe(row.h);
      expect(s.pHText).toBe(row.pH);
      expect(s.percentText).toBe(row.percent);
      expect(s.ions).toBe(row.ions);
      expect(s.shortcutPHText).toBe(row.shortcutPH);
      expect(s.checkText).toBe(row.check);
      expect(s.shortcutPasses).toBe(row.passes);
      expect(s.strongPHText).toBe(row.strongPH);
    });

    it(`${where}: the readout is the brief's sentence`, () => {
      expect(readout(row.acid, row.position)).toBe(sentence(row));
    });
  }

  it('gives the brief’s three readout sentences word for word', () => {
    expect(readout('formic', 3)).toBe(
      'Formic acid at 0.10 M: [H₃O⁺] = 4.2 × 10⁻³ M and the pH is 2.38. Of the acid, 4.2 percent is ionized. The shortcut gives a pH of 2.37, and its check comes to 4.2 percent, under 5, so it passes. A strong acid at 0.10 M would have a pH of 1.00.',
    );
    expect(readout('formic', 9)).toBe(
      'Formic acid at 0.0010 M: [H₃O⁺] = 3.4 × 10⁻⁴ M and the pH is 3.46. Of the acid, 34 percent is ionized. The shortcut gives a pH of 3.37, but its check comes to 42 percent, over 5, so it fails here. A strong acid at 0.0010 M would have a pH of 3.00.',
    );
    expect(readout('butanoic', 0)).toBe(
      'Butanoic acid at 1.0 M: [H₃O⁺] = 3.9 × 10⁻³ M and the pH is 2.41. Of the acid, 0.39 percent is ionized, fewer than 1 molecule in 100. The shortcut gives a pH of 2.41, and its check comes to 0.39 percent, under 5, so it passes. A strong acid at 1.0 M would have a pH of 0.00.',
    );
  });

  it('says "more acid than there is" where the check is over 100 percent, chloroacetic acid at 0.0010 M, and only there', () => {
    expect(readout('chloroacetic', 9)).toContain('but its check comes to 118 percent, more acid than there is, so it fails here');
    expect(readout('chloroacetic', 9)).not.toContain('118 percent, over 5');
    const over = every.filter(({ acid, position }) => readout(acid, position).includes('more acid than there is'));
    expect(over).toEqual([{ acid: 'chloroacetic', position: 9 }]);
    // There the shortcut's pH, 2.93, is below the strong acid's 3.00.
    const s = state('chloroacetic', 9);
    expect(s.shortcutPHText).toBe('2.93');
    expect(s.strongPHText).toBe('3.00');
  });

  it('never says 0 percent or 100 percent, and never prints −0.00', () => {
    for (const { acid, position } of every) {
      const text = readout(acid, position);
      // A number standing alone: "8.0 percent" is not "0 percent".
      expect(text).not.toMatch(/(?<![\d.])0 percent|(?<![\d.])100 percent|-0\.00|−0\.00/);
    }
  });
});

describe('rounding, half up from the unrounded value', () => {
  it('pins the nearest rounding boundary: chloroacetic acid at 1.0 M has a pH of 1.43506, shown as 1.44', () => {
    const s = state('chloroacetic', 0);
    expect(s.pH.toFixed(5)).toBe('1.43506');
    expect(s.pH - 1.435).toBeGreaterThan(0.00005);
    expect(s.pH - 1.435).toBeLessThan(0.00007);
    expect(s.pHText).toBe('1.44');
  });

  it('pins the starting percent: 4.1536, shown as 4.2', () => {
    const s = state('formic', 3);
    expect(s.percent.toFixed(4)).toBe('4.1536');
    expect(s.percentText).toBe('4.2');
  });

  it('pins the two states whose shown numbers do not divide, each rounded from its own value', () => {
    const a = state('chloroacetic', 7);
    expect(a.hydronium.toPrecision(5)).toBe('0.0020368');
    expect(a.percent.toFixed(2)).toBe('40.74');
    expect([a.hydroniumText, a.percentText]).toEqual(['2.0 × 10⁻³', '41']);
    const b = state('chloroacetic', 8);
    expect(b.hydronium.toPrecision(5)).toBe('0.0011138');
    expect(b.percent.toFixed(2)).toBe('55.69');
    expect([b.hydroniumText, b.percentText]).toEqual(['1.1 × 10⁻³', '56']);
  });

  it('has no shown number within 1e-9 of a rounding boundary in any state', () => {
    // The distance of x from the nearest tie at a given number of decimal places.
    const fromTie = (x: number, places: number) => {
      const scaled = x * 10 ** places;
      return Math.abs(scaled - Math.floor(scaled) - 0.5) / 10 ** places;
    };
    const placesOfPercent = (p: number) => (p >= 10 ? 0 : p >= 1 ? 1 : 2);
    for (const { acid, position } of every) {
      const s = state(acid, position);
      const e = Math.floor(Math.log10(s.hydronium));
      const distances = [
        fromTie(s.pH, 2),
        fromTie(s.shortcutPH, 2),
        fromTie(s.strongPH, 2),
        fromTie(s.hydronium / 10 ** e, 1),
        fromTie(s.percent, placesOfPercent(s.percent)),
        fromTie(s.percent, 0),
        fromTie(s.check, placesOfPercent(s.check)),
      ];
      for (const d of distances) expect(d, `${acid} at position ${position}`).toBeGreaterThan(1e-9);
    }
  });

  it('formats shown numbers as the brief prints them', () => {
    expect(shownPH(2.3815)).toBe('2.38');
    expect(shownPH(1.43506)).toBe('1.44');
    expect(shownPH(-4e-15)).toBe('0.00');
    expect(shownPH(3)).toBe('3.00');
    expect(shownConcentration(4.153595e-3)).toBe('4.2 × 10⁻³');
    expect(shownConcentration(3.4e-4)).toBe('3.4 × 10⁻⁴');
    expect(shownConcentration(1.1e-2)).toBe('1.1 × 10⁻²');
    // A mantissa that rounds up to 10 moves to the next power.
    expect(shownConcentration(9.96e-3)).toBe('1.0 × 10⁻²');
    expect(shownPercent(0.3872)).toBe('0.39');
    expect(shownPercent(4.1536)).toBe('4.2');
    expect(shownPercent(8.0)).toBe('8.0');
    expect(shownPercent(34.4)).toBe('34');
    expect(shownPercent(118.3)).toBe('118');
    expect(shownPercent(9.97)).toBe('10');
    expect(shownPercent(0.996)).toBe('1.0');
  });

  it('rounds exact ties half up', () => {
    expect(shownPercent(9.95)).toBe('10');
    expect(shownPH(-0.005)).toBe('0.00');
    expect(shownPercent(99.5)).toBe('100');
  });
});

describe('the model', () => {
  it('calls the solver with C, Ka and no spectator ions, and the strong acid with C as the anion', () => {
    for (const { acid, position } of every) {
      const s = state(acid, position);
      const c = (CONCENTRATION_UNITS[position] ?? Number.NaN) / UNITS_PER_MOLAR;
      const ka = ACIDS[acid].ka;
      expect(s.concentration).toBe(c);
      expect(s.hydronium).toBe(hydronium({ weakAcid: c, ka }));
      expect(s.pH).toBe(-Math.log10(s.hydronium));
      // 100 × Ka/(Ka + h), which can differ from (100 Ka)/(Ka + h) in the last place.
      expect(s.percent).toBeCloseTo((100 * ka) / (ka + s.hydronium), 12);
      expect(s.ions).toBe(Math.floor(s.percent + 0.5));
      expect(s.shortcutHydronium).toBe(Math.sqrt(ka * c));
      expect(s.shortcutPH).toBe(-Math.log10(s.shortcutHydronium));
      expect(s.check).toBe((100 * s.shortcutHydronium) / c);
      expect(s.shortcutPasses).toBe(s.check < 5);
      expect(s.strongPH).toBe(-Math.log10(hydronium({ anions: c })));
    }
  });

  it('the percent ionized runs from 0.39 (butanoic, 1.0 M) to 67 (chloroacetic, 0.0010 M), never reaches 100, and draws no ion in exactly one state', () => {
    const states = every.map(({ acid, position }) => state(acid, position));
    const low = states.reduce((a, b) => (b.percent < a.percent ? b : a));
    const high = states.reduce((a, b) => (b.percent > a.percent ? b : a));
    expect([low.acid, low.position, low.percentText]).toEqual(['butanoic', 0, '0.39']);
    expect([high.acid, high.position, high.percentText]).toEqual(['chloroacetic', 9, '67']);
    expect(high.percent).toBeLessThan(AXES.percentMax);
    expect(states.filter((s) => s.ions === 0).map((s) => [s.acid, s.position])).toEqual([['butanoic', 0]]);
    expect(Math.max(...states.map((s) => s.ions))).toBeLessThan(100);
  });

  it('the pH runs from 1.44 (chloroacetic, 1.0 M) to 3.94 (butanoic, 0.0010 M)', () => {
    const states = every.map(({ acid, position }) => state(acid, position));
    const low = states.reduce((a, b) => (b.pH < a.pH ? b : a));
    const high = states.reduce((a, b) => (b.pH > a.pH ? b : a));
    expect([low.acid, low.position, low.pHText]).toEqual(['chloroacetic', 0, '1.44']);
    expect([high.acid, high.position, high.pHText]).toEqual(['butanoic', 9, '3.94']);
  });

  it('for each acid, each step toward a more dilute solution raises the percent, lowers [H₃O⁺] and raises the pH', () => {
    for (const acid of ACID_IDS) {
      for (let position = 1; position < CONCENTRATIONS.length; position++) {
        const before = state(acid, position - 1);
        const after = state(acid, position);
        expect(after.percent).toBeGreaterThan(before.percent);
        expect(after.hydronium).toBeLessThan(before.hydronium);
        expect(after.pH).toBeGreaterThan(before.pH);
      }
    }
  });

  it('at each concentration the larger Ka has the larger percent and the lower pH', () => {
    for (let position = 0; position < CONCENTRATIONS.length; position++) {
      const [a, b, c] = ACID_IDS.map((acid) => state(acid, position));
      if (!a || !b || !c) throw new Error('Three acids.');
      expect(a.percent).toBeGreaterThan(b.percent);
      expect(b.percent).toBeGreaterThan(c.percent);
      expect(a.pH).toBeLessThan(b.pH);
      expect(b.pH).toBeLessThan(c.pH);
    }
  });

  it('the weak acid’s pH is above the strong acid’s in every state; the smallest gap as shown is 0.17, chloroacetic acid at 0.0010 M', () => {
    const gaps = every.map(({ acid, position }) => {
      const s = state(acid, position);
      return { acid, position, gap: Math.round(100 * (Number(s.pHText) - Number(s.strongPHText))) };
    });
    for (const g of gaps) expect(g.gap).toBeGreaterThan(0);
    const smallest = gaps.reduce((a, b) => (b.gap < a.gap ? b : a));
    expect(smallest).toEqual({ acid: 'chloroacetic', position: 9, gap: 17 });
  });

  it('the shortcut’s pH is never above the full pH as shown: within 0.01 where it passes, 0.01 to 0.24 where it fails', () => {
    const gaps = every.map(({ acid, position }) => {
      const s = state(acid, position);
      return { passes: s.shortcutPasses, gap: Math.round(100 * (Number(s.pHText) - Number(s.shortcutPHText))) };
    });
    for (const g of gaps) expect(g.gap).toBeGreaterThanOrEqual(0);
    const passing = gaps.filter((g) => g.passes).map((g) => g.gap);
    const failing = gaps.filter((g) => !g.passes).map((g) => g.gap);
    expect(passing).toHaveLength(12);
    expect(failing).toHaveLength(18);
    expect(Math.max(...passing)).toBeLessThanOrEqual(1);
    expect(Math.min(...failing)).toBe(1);
    expect(Math.max(...failing)).toBe(24);
  });

  it('the shortcut passes in the 12 states the brief lists, and fails first at 0.50, 0.050 and 0.0050 M', () => {
    const passing = every.filter(({ acid, position }) => state(acid, position).shortcutPasses);
    expect(passing.map(({ acid, position }) => `${acid} ${CONCENTRATIONS[position]}`)).toEqual([
      'chloroacetic 1.0',
      'formic 1.0',
      'formic 0.50',
      'formic 0.20',
      'formic 0.10',
      'butanoic 1.0',
      'butanoic 0.50',
      'butanoic 0.20',
      'butanoic 0.10',
      'butanoic 0.050',
      'butanoic 0.020',
      'butanoic 0.010',
    ]);
    const firstFailure = (acid: AcidId) => CONCENTRATIONS[CONCENTRATIONS.findIndex((_, p) => !state(acid, p).shortcutPasses)];
    expect(ACID_IDS.map(firstFailure)).toEqual(['0.50', '0.050', '0.0050']);
  });

  it('no unrounded check lies between 4.3 and 5.2, and the check is above the percent ionized in every state', () => {
    for (const { acid, position } of every) {
      const s = state(acid, position);
      expect(s.check < 4.3 || s.check > 5.2).toBe(true);
      expect(s.check).toBeGreaterThan(s.percent);
    }
  });
});

describe('the box of particles', () => {
  it('orders the 100 cells once each, for the ions to fill in a fixed order', () => {
    expect(IONIZATION_ORDER).toHaveLength(100);
    expect([...IONIZATION_ORDER].sort((a, b) => a - b)).toEqual(Array.from({ length: 100 }, (_, i) => i));
  });

  it('draws ten rows of ten, with the state’s count of ions in the first cells of the order', () => {
    for (const { acid, position } of every) {
      const drawn = particles(acid, position);
      const { ions } = state(acid, position);
      expect(drawn).toHaveLength(100);
      expect(drawn.filter((p) => p.ionized)).toHaveLength(ions);
      const ionized = new Set(IONIZATION_ORDER.slice(0, ions));
      drawn.forEach((p, cell) => {
        expect(p.ionized).toBe(ionized.has(cell));
        expect(p.x).toBe(BOX.first + BOX.cell * (cell % 10));
        expect(p.y).toBe(BOX.first + BOX.cell * Math.floor(cell / 10));
      });
    }
  });

  it('adds or removes ions without moving the rest as the slider moves', () => {
    for (const acid of ACID_IDS) {
      for (let position = 1; position < CONCENTRATIONS.length; position++) {
        const before = particles(acid, position - 1);
        const after = particles(acid, position);
        before.forEach((p, cell) => {
          if (p.ionized) expect(after[cell]?.ionized).toBe(true);
        });
      }
    }
  });

  it('keeps every particle inside the box and clear of its neighbors', () => {
    const reach = Math.max(BOX.wholeRadius, BOX.pairReach);
    expect(BOX.first - reach).toBeGreaterThan(0);
    expect(BOX.first + 9 * BOX.cell + reach).toBeLessThan(BOX.size);
    expect(2 * reach).toBeLessThan(BOX.cell);
    // The ion pair's two circles touch or overlap: one pair, not two particles.
    const gap = BOX.anionOffset - BOX.hydroniumOffset - BOX.anionRadius - BOX.hydroniumRadius;
    expect(gap).toBeLessThanOrEqual(0);
  });

  it('says how many of 100 are ionized, and "fewer than 1" when none is drawn', () => {
    expect(countText('formic', 3)).toBe('4 of 100 ionized');
    expect(countText('formic', 9)).toBe('34 of 100 ionized');
    expect(countText('butanoic', 0)).toBe('fewer than 1 of 100 ionized');
    expect(countText('butanoic', 1)).toBe('1 of 100 ionized');
  });

  it('names the two kinds of particle in its key', () => {
    expect(KEY).toEqual({ whole: 'whole molecule, HA', pair: 'ions, H₃O⁺ and A⁻' });
  });

  it('describes the box in words', () => {
    expect(describeBox('formic', 3)).toBe(
      'A box of 100 particles of formic acid: 96 whole molecules, drawn as filled circles, and 4 ionized, each drawn as a hydronium ion, a small dark circle marked plus, beside a formate ion, a hollow circle marked minus.',
    );
    expect(describeBox('butanoic', 1)).toBe(
      'A box of 100 particles of butanoic acid: 99 whole molecules, drawn as filled circles, and 1 ionized, drawn as a hydronium ion, a small dark circle marked plus, beside a butanoate ion, a hollow circle marked minus.',
    );
    expect(describeBox('butanoic', 0)).toBe(
      'A box of 100 particles of butanoic acid, all drawn as whole molecules, filled circles: fewer than 1 in 100 is ionized.',
    );
    expect(describeBox('chloroacetic', 9)).toContain('33 whole molecules');
    expect(describeBox('chloroacetic', 9)).toContain('67 ionized, each drawn as a hydronium ion');
    expect(describeBox('chloroacetic', 9)).toContain('chloroacetate ion');
  });
});

describe('the graph', () => {
  const sliderLogs = CONCENTRATION_UNITS.map((u) => Math.log10(u / UNITS_PER_MOLAR));

  it('runs each curve through every 0.05 in log C and the ten slider concentrations, from 1 M to 0.001 M', () => {
    for (const acid of ACID_IDS) {
      const points = curve(acid);
      // 61 points of the grid, of which four (1, 0.1, 0.01 and 0.001 M) are slider concentrations, and six more.
      expect(points).toHaveLength(67);
      expect(points[0]?.logConcentration).toBe(0);
      expect(points.at(-1)?.logConcentration).toBe(-3);
      for (let i = 1; i < points.length; i++) {
        expect(points[i]?.logConcentration ?? 0).toBeLessThan(points[i - 1]?.logConcentration ?? 0);
        expect(points[i]?.percent ?? 0).toBeGreaterThan(points[i - 1]?.percent ?? 0);
      }
      for (let k = 0; k <= 60; k++) {
        const log = -k / 20;
        expect(points.some((p) => Math.abs(p.logConcentration - log) < 1e-12), `${acid} at log C ${log}`).toBe(true);
      }
    }
  });

  it('puts the marker’s value on a vertex of the curve at every slider setting', () => {
    for (const { acid, position } of every) {
      const point = curve(acid).find((p) => p.logConcentration === sliderLogs[position]);
      expect(point, `${acid} at position ${position}`).toBeDefined();
      expect(point?.percent).toBe(state(acid, position).percent);
      expect(state(acid, position).logConcentration).toBe(sliderLogs[position]);
    }
  });

  it('computes the grid points with the solver', () => {
    const point = curve('formic').find((p) => Math.abs(p.logConcentration + 0.25) < 1e-12);
    const c = 10 ** -0.25;
    const h = hydronium({ weakAcid: c, ka: ACIDS.formic.ka });
    expect(point?.percent).toBe((100 * ACIDS.formic.ka) / (ACIDS.formic.ka + h));
  });

  it('describes the graph in words', () => {
    expect(describeGraph('formic', 3)).toBe(
      'Graph of percent ionized, from 0 to 70 percent, against starting concentration on a logarithmic scale, from 1 M at the left to 0.001 M at the right. ' +
        'One curve for each acid, each rising as the solution is diluted: chloroacetic acid from 3.7 percent at 1.0 M to 67 percent at 0.0010 M, ' +
        'formic acid from 1.3 to 34 percent, and butanoic acid from 0.39 to 12 percent. ' +
        'The curve of formic acid is drawn heavy and the other two faint and dashed. A dashed line marks 5 percent. ' +
        'A marker at 0.10 M is on the curve of formic acid, at 4.2 percent.',
    );
    expect(describeGraph('butanoic', 0)).toMatch(/The curve of butanoic acid is drawn heavy.*A marker at 1\.0 M is on the curve of butanoic acid, at 0\.39 percent\.$/);
  });
});

describe('bad input', () => {
  it('throws a RangeError that names an unknown acid', () => {
    expect(() => state('acetic' as AcidId, 3)).toThrow(RangeError);
    expect(() => state('acetic' as AcidId, 3)).toThrow(/"acetic"/);
    expect(() => curve('hydrochloric' as AcidId)).toThrow(/"hydrochloric"/);
  });

  for (const position of [-1, 10, 2.5, Number.NaN]) {
    it(`throws a RangeError that names the slider position ${position}`, () => {
      expect(() => state('formic', position)).toThrow(RangeError);
      expect(() => state('formic', position)).toThrow(new RegExp(String(position).replace('.', '\\.')));
      expect(() => concentrationText(position)).toThrow(RangeError);
    });
  }

  it('refuses to show a number that is not finite or not positive where it must be', () => {
    expect(() => shownConcentration(0)).toThrow(RangeError);
    expect(() => shownPercent(-1)).toThrow(/-1/);
    expect(() => shownPH(Number.NaN)).toThrow(/NaN/);
  });
});
