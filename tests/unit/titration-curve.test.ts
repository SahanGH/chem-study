import { describe, expect, it } from 'vitest';
import { hydronium } from '../../src/lib/acid-base';
import { BASE_MICROMOLES_PER_ML, FLASK } from '../../src/lib/titration';
import {
  ACID_IDS,
  ACIDS,
  AXES,
  BUFFER_REGION,
  EQUIVALENCE_ML,
  HALF_EQUIVALENCE_ML,
  INDICATOR_CHOICES,
  INDICATORS,
  LACTIC_KA,
  LACTIC_PKA,
  START,
  VOLUME,
  VOLUMES,
  band,
  bars,
  bufferMark,
  changeVolumes,
  curve,
  describeBars,
  describeGraph,
  indicatorColor,
  indicatorSentence,
  keyItems,
  pHAt,
  readout,
  shownPH,
  shownVolume,
  state,
  volumeText,
  volumeValueText,
  type AcidId,
  type IndicatorChoice,
  type IndicatorId,
} from '../../src/lib/titration-curve';

// Everything below is written out from lesson 8.5's brief, "Diagram data" (the constants, the
// controls, the model, the readout sentences, every state's pH, the indicators over the two curves,
// the limits and the worked states), apart from the module under test.

// The brief's table "Every state's pH": base added (mL), lactic acid, hydrobromic acid.
const PH_TABLE = `
0.0 2.35 0.82
0.5 2.59 0.85
1.0 2.79 0.88
1.5 2.94 0.90
2.0 3.07 0.93
2.5 3.18 0.95
3.0 3.27 0.98
3.5 3.35 1.01
4.0 3.43 1.04
4.5 3.50 1.07
5.0 3.56 1.10
5.5 3.63 1.13
6.0 3.69 1.16
6.5 3.75 1.19
7.0 3.80 1.23
7.5 3.86 1.26
8.0 3.92 1.30
8.5 3.98 1.34
9.0 4.04 1.38
9.5 4.10 1.43
10.0 4.16 1.48
10.5 4.23 1.53
11.0 4.30 1.59
11.5 4.38 1.65
12.0 4.46 1.73
12.5 4.56 1.81
13.0 4.67 1.92
13.5 4.82 2.05
14.0 5.01 2.23
14.5 5.32 2.54
15.0 8.40 7.00
15.5 11.45 11.45
16.0 11.74 11.74
16.5 11.91 11.91
17.0 12.03 12.03
17.5 12.12 12.12
18.0 12.20 12.20
18.5 12.26 12.26
19.0 12.31 12.31
19.5 12.36 12.36
20.0 12.40 12.40
20.5 12.43 12.43
21.0 12.47 12.47
21.5 12.50 12.50
22.0 12.52 12.52
22.5 12.55 12.55
23.0 12.57 12.57
23.5 12.59 12.59
24.0 12.61 12.61
24.5 12.63 12.63
25.0 12.65 12.65
25.5 12.66 12.66
26.0 12.68 12.68
26.5 12.69 12.69
27.0 12.71 12.71
27.5 12.72 12.72
28.0 12.73 12.73
28.5 12.75 12.75
29.0 12.76 12.76
29.5 12.77 12.77
30.0 12.78 12.78
`;

const PH_ROWS = PH_TABLE.trim()
  .split('\n')
  .map((line) => {
    const [mL, lactic, hydrobromic] = line.split(' ');
    if (!mL || !lactic || !hydrobromic) throw new Error(`A bad row: ${line}`);
    return { volume: Number(mL), mL, lactic, hydrobromic };
  });

// The brief's worked states: acid, base (mL), indicator, pH, acid left, reacted, OH⁻ in excess, kind, color.
const WORKED = `
lactic | 0.0 | none | 2.35 | 3.00 | 0.00 | 0.00 | start | —
lactic | 7.5 | none | 3.86 | 1.50 | 1.50 | 0.00 | half | —
lactic | 5.0 | none | 3.56 | 2.00 | 1.00 | 0.00 | buffer | —
lactic | 10.0 | none | 4.16 | 1.00 | 2.00 | 0.00 | buffer | —
lactic | 14.5 | none | 5.32 | 0.10 | 2.90 | 0.00 | late | —
lactic | 15.0 | none | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | —
lactic | 15.5 | none | 11.45 | 0.00 | 3.00 | 0.10 | past | —
hydrobromic | 0.0 | none | 0.82 | 3.00 | 0.00 | 0.00 | start | —
hydrobromic | 7.5 | none | 1.26 | 1.50 | 1.50 | 0.00 | before | —
hydrobromic | 14.5 | none | 2.54 | 0.10 | 2.90 | 0.00 | before | —
hydrobromic | 15.0 | none | 7.00 | 0.00 | 3.00 | 0.00 | equivalence | —
hydrobromic | 15.5 | none | 11.45 | 0.00 | 3.00 | 0.10 | past | —
lactic | 7.0 | bromocresol green | 3.80 | 1.60 | 1.40 | 0.00 | buffer | green
lactic | 6.5 | bromocresol green | 3.75 | 1.70 | 1.30 | 0.00 | buffer | yellow
lactic | 15.0 | bromocresol green | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | blue
lactic | 15.0 | thymol blue | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | green
lactic | 0.0 | thymol blue | 2.35 | 3.00 | 0.00 | 0.00 | start | orange
hydrobromic | 0.0 | thymol blue | 0.82 | 3.00 | 0.00 | 0.00 | start | red
hydrobromic | 15.0 | bromothymol blue | 7.00 | 0.00 | 3.00 | 0.00 | equivalence | green
lactic | 15.0 | bromothymol blue | 8.40 | 0.00 | 3.00 | 0.00 | equivalence | blue
lactic | 0.5 | none | 2.59 | 2.90 | 0.10 | 0.00 | early | —
lactic | 1.5 | none | 2.94 | 2.70 | 0.30 | 0.00 | buffer | —
lactic | 13.5 | none | 4.82 | 0.30 | 2.70 | 0.00 | buffer | —
lactic | 14.0 | none | 5.01 | 0.20 | 2.80 | 0.00 | late | —
lactic | 18.0 | none | 12.20 | 0.00 | 3.00 | 0.60 | past | —
lactic | 17.5 | none | 12.12 | 0.00 | 3.00 | 0.50 | past | —
hydrobromic | 17.5 | none | 12.12 | 0.00 | 3.00 | 0.50 | past | —
hydrobromic | 30.0 | none | 12.78 | 0.00 | 3.00 | 3.00 | past | —
lactic | 30.0 | none | 12.78 | 0.00 | 3.00 | 3.00 | past | —
hydrobromic | 1.0 | none | 0.88 | 2.80 | 0.20 | 0.00 | before | —
`;

const INDICATOR_ID: Record<string, IndicatorChoice> = {
  none: 'none',
  'bromocresol green': 'bromocresolGreen',
  'bromothymol blue': 'bromothymolBlue',
  'thymol blue': 'thymolBlue',
};

const WORKED_ROWS = WORKED.trim()
  .split('\n')
  .map((line) => {
    const [acid, mL, indicator, pH, left, reacted, excess, kind, color] = line.split(' | ');
    if (!acid || !mL || !indicator || !pH || !left || !reacted || !excess || !kind || !color) throw new Error(`A bad row: ${line}`);
    const id = INDICATOR_ID[indicator];
    if (!id) throw new Error(`An unknown indicator: ${indicator}`);
    return { acid: acid as AcidId, volume: Number(mL), mL, indicator: id, pH, left, reacted, excess, kind, color };
  });

// The brief's table "Indicators over the two curves".
const INDICATOR_TABLE: { indicator: IndicatorId; acid: AcidId; colors: [string, number, number][]; between: [string, string] }[] = [
  { indicator: 'bromocresolGreen', acid: 'lactic', colors: [['yellow', 0, 6.5], ['green', 7, 14.5], ['blue', 15, 30]], between: ['6.96', '14.58'] },
  { indicator: 'bromocresolGreen', acid: 'hydrobromic', colors: [['yellow', 0, 14.5], ['blue', 15, 30]], between: ['14.97', '15.00'] },
  { indicator: 'bromothymolBlue', acid: 'lactic', colors: [['yellow', 0, 14.5], ['blue', 15, 30]], between: ['14.89', '15.00'] },
  { indicator: 'bromothymolBlue', acid: 'hydrobromic', colors: [['yellow', 0, 14.5], ['green', 15, 15], ['blue', 15.5, 30]], between: ['15.00', '15.00'] },
  { indicator: 'thymolBlue', acid: 'lactic', colors: [['orange', 0, 1], ['yellow', 1.5, 14.5], ['green', 15, 15], ['blue', 15.5, 30]], between: ['15.00', '15.01'] },
  { indicator: 'thymolBlue', acid: 'hydrobromic', colors: [['red', 0, 6.5], ['orange', 7, 14.5], ['yellow', 15, 15], ['blue', 15.5, 30]], between: ['15.00', '15.01'] },
];

// The unrounded volumes the brief gives, to four places.
const UNROUNDED: Record<string, [string, string]> = {
  'bromocresolGreen lactic': ['6.9614', '14.5788'],
  'bromocresolGreen hydrobromic': ['14.9723', '14.9993'],
  'bromothymolBlue lactic': ['14.8919', '14.9973'],
  'bromothymolBlue hydrobromic': ['14.9998', '15.0001'],
  'thymolBlue lactic': ['14.9991', '15.0069'],
  'thymolBlue hydrobromic': ['15.0002', '15.0070'],
};

const TITLE: Record<IndicatorId, string> = {
  bromocresolGreen: 'Bromocresol green',
  bromothymolBlue: 'Bromothymol blue',
  thymolBlue: 'Thymol blue',
};

/** The main sentence, assembled from a worked row as the brief's table words each kind. */
function mainSentence(row: { acid: AcidId; pH: string; left: string; reacted: string; excess: string; kind: string }): string {
  switch (`${row.acid} ${row.kind}`) {
    case 'lactic start':
      return `No base yet. The flask holds ${row.left} mmol of lactic acid, a weak acid, and nothing else that matters. pH ${row.pH}.`;
    case 'lactic early':
      return `${row.left} mmol of lactic acid and ${row.reacted} mmol of lactate ion. The acid still outweighs the lactate by more than ten to one. pH ${row.pH}.`;
    case 'lactic buffer':
      return `Buffer region: ${row.left} mmol of lactic acid and ${row.reacted} mmol of lactate ion, both members of the pair. pH ${row.pH}.`;
    case 'lactic half':
      return `Half-equivalence point: ${row.left} mmol of lactic acid and ${row.reacted} mmol of lactate ion. Equal amounts, so pH = pKa = 3.86.`;
    case 'lactic late':
      return `${row.left} mmol of lactic acid and ${row.reacted} mmol of lactate ion. The lactate now outweighs the acid by more than ten to one. pH ${row.pH}.`;
    case 'lactic equivalence':
      return `Equivalence point: all 3.00 mmol of the acid has reacted. The flask holds lactate ion alone, a weak base, so the pH is above 7: ${row.pH}.`;
    case 'hydrobromic start':
      return `No base yet. The flask holds ${row.left} mmol of H₃O⁺ from hydrobromic acid, a strong acid. pH ${row.pH}.`;
    case 'hydrobromic before':
      return `${row.left} mmol of H₃O⁺ is left, and it sets the pH: ${row.pH}.`;
    case 'hydrobromic equivalence':
      return `Equivalence point: neither H₃O⁺ nor OH⁻ is left over. The flask holds Na⁺, Br⁻ and water. pH ${row.pH} at 25 °C.`;
    case 'lactic past':
    case 'hydrobromic past':
      return `Past the equivalence point: ${row.excess} mmol of OH⁻ is left over, and it sets the pH: ${row.pH}.`;
    default:
      throw new Error(`No sentence for ${row.acid} ${row.kind}`);
  }
}

const everyState = ACID_IDS.flatMap((acid) => VOLUMES.map((volume) => ({ acid, volume })));
const realIndicators = INDICATOR_CHOICES.filter((c): c is IndicatorId => c !== 'none');

describe('the constants', () => {
  it('titrates the flask of lesson 4.6: 3,000 micromoles of acid in 20.0 mL, with 200 micromoles of OH⁻ in each mL', () => {
    expect(FLASK).toEqual({ volumeMl: 20, acidMicromoles: 3000 });
    expect(BASE_MICROMOLES_PER_ML).toBe(200);
    expect(EQUIVALENCE_ML).toBe(15);
    expect(HALF_EQUIVALENCE_ML).toBe(7.5);
  });

  it('offers lactic acid (weak) and hydrobromic acid (strong), in that order', () => {
    expect(ACID_IDS).toEqual(['lactic', 'hydrobromic']);
    expect(ACIDS.lactic.label).toBe('Lactic acid (weak)');
    expect(ACIDS.hydrobromic.label).toBe('Hydrobromic acid (strong)');
    expect(ACIDS.lactic.strong).toBe(false);
    expect(ACIDS.hydrobromic.strong).toBe(true);
  });

  it('gives lactic acid a Ka of 10^−3.86 exactly, computed from the pKa', () => {
    expect(LACTIC_PKA).toBe(3.86);
    expect(LACTIC_KA).toBe(10 ** -3.86);
    expect(LACTIC_KA.toPrecision(5)).toBe('0.00013804');
    expect(LACTIC_KA).not.toBe(1.4e-4);
    expect(LACTIC_KA).not.toBe(1.38e-4);
  });

  it('offers no indicator and the three indicators, in the brief’s order, with their ranges and colors', () => {
    expect(INDICATOR_CHOICES).toEqual(['none', 'bromocresolGreen', 'bromothymolBlue', 'thymolBlue']);
    expect(INDICATORS.bromocresolGreen.label).toBe('Bromocresol green');
    expect(INDICATORS.bromothymolBlue.label).toBe('Bromothymol blue');
    expect(INDICATORS.thymolBlue.label).toBe('Thymol blue');
    expect(INDICATORS.bromocresolGreen.changes).toEqual([{ low: 3.8, high: 5.4, acidColor: 'yellow', changingColor: 'green', baseColor: 'blue' }]);
    expect(INDICATORS.bromothymolBlue.changes).toEqual([{ low: 6.0, high: 7.6, acidColor: 'yellow', changingColor: 'green', baseColor: 'blue' }]);
    expect(INDICATORS.thymolBlue.changes).toEqual([
      { low: 1.2, high: 2.8, acidColor: 'red', changingColor: 'orange', baseColor: 'yellow' },
      { low: 8.0, high: 9.6, acidColor: 'yellow', changingColor: 'green', baseColor: 'blue' },
    ]);
  });

  it('has a slider from 0.0 to 30.0 mL in steps of 0.5 mL, starting at lactic acid, 0.0 mL and no indicator: 488 states', () => {
    expect(VOLUME).toEqual({ min: 0, max: 30, step: 0.5 });
    expect(VOLUMES).toHaveLength(61);
    expect(VOLUMES[0]).toBe(0);
    expect(VOLUMES.at(-1)).toBe(30);
    expect(VOLUMES).toContain(EQUIVALENCE_ML);
    expect(VOLUMES).toContain(HALF_EQUIVALENCE_ML);
    expect(START).toEqual({ acid: 'lactic', volume: 0, indicator: 'none' });
    expect(VOLUMES.length * ACID_IDS.length * INDICATOR_CHOICES.length).toBe(488);
  });

  it('plots pH 0 to 14 against 0 to 30 mL', () => {
    expect(AXES.pHMax).toBe(14);
    expect(AXES.pHTicks).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
    expect(AXES.volumeMax).toBe(30);
    expect(AXES.volumeTicks).toEqual([0, 5, 10, 15, 20, 25, 30]);
  });

  it('marks the buffer region from 15/11 mL to 150/11 mL, where the two forms stand at 1 to 10 and 10 to 1', () => {
    expect(BUFFER_REGION.from).toBe(15 / 11);
    expect(BUFFER_REGION.to).toBe(150 / 11);
    expect(BUFFER_REGION.fromText).toBe('1.36');
    expect(BUFFER_REGION.toText).toBe('13.64');
    const reactedAt = (mL: number) => mL * BASE_MICROMOLES_PER_ML;
    expect(reactedAt(BUFFER_REGION.from) / (3000 - reactedAt(BUFFER_REGION.from))).toBeCloseTo(0.1, 12);
    expect(reactedAt(BUFFER_REGION.to) / (3000 - reactedAt(BUFFER_REGION.to))).toBeCloseTo(10, 10);
  });

  it('speaks and shows the slider’s value', () => {
    expect(volumeText(0)).toBe('0.0 mL');
    expect(volumeText(7.5)).toBe('7.5 mL');
    expect(volumeText(30)).toBe('30.0 mL');
    expect(volumeValueText(7.5)).toBe('7.5 milliliters of sodium hydroxide added');
    expect(volumeValueText(0)).toBe('0.0 milliliters of sodium hydroxide added');
  });
});

describe('every state’s pH', () => {
  it('lists the 61 settings of the slider', () => {
    expect(PH_ROWS.map((r) => r.volume)).toEqual([...VOLUMES]);
  });

  for (const row of PH_ROWS) {
    it(`at ${row.mL} mL: lactic acid ${row.lactic}, hydrobromic acid ${row.hydrobromic}`, () => {
      expect(state('lactic', row.volume).pHText).toBe(row.lactic);
      expect(state('hydrobromic', row.volume).pHText).toBe(row.hydrobromic);
    });
  }
});

describe('the worked states', () => {
  it('lists the brief’s thirty', () => {
    expect(WORKED_ROWS).toHaveLength(30);
  });

  for (const row of WORKED_ROWS) {
    const where = `${row.acid} acid at ${row.mL} mL${row.indicator === 'none' ? '' : ` with ${row.indicator}`}`;
    it(`${where}: pH ${row.pH}, ${row.left} left, ${row.reacted} reacted, ${row.excess} in excess, ${row.kind}${row.color === '—' ? '' : `, ${row.color}`}`, () => {
      const s = state(row.acid, row.volume);
      expect(s.pHText).toBe(row.pH);
      expect(s.acidLeftText).toBe(row.left);
      expect(s.reactedText).toBe(row.reacted);
      expect(s.excessText).toBe(row.excess);
      expect(s.kind).toBe(row.kind);
      if (row.indicator === 'none') {
        expect(indicatorSentence(row.acid, row.volume, row.indicator)).toBe('');
      } else {
        expect(indicatorColor(row.indicator, s.pH).color).toBe(row.color);
      }
    });

    it(`${where}: the readout is the brief's sentence`, () => {
      const main = mainSentence(row);
      const text = readout(row.acid, row.volume, row.indicator);
      expect(text.startsWith(main)).toBe(true);
      if (row.indicator === 'none') expect(text).toBe(main);
    });
  }

  it('gives the brief’s starting readout word for word', () => {
    expect(readout('lactic', 0, 'none')).toBe(
      'No base yet. The flask holds 3.00 mmol of lactic acid, a weak acid, and nothing else that matters. pH 2.35.',
    );
  });

  it('gives each sentence of the brief’s table word for word', () => {
    expect(readout('lactic', 0.5, 'none')).toBe(
      '2.90 mmol of lactic acid and 0.10 mmol of lactate ion. The acid still outweighs the lactate by more than ten to one. pH 2.59.',
    );
    expect(readout('lactic', 5, 'none')).toBe(
      'Buffer region: 2.00 mmol of lactic acid and 1.00 mmol of lactate ion, both members of the pair. pH 3.56.',
    );
    expect(readout('lactic', 7.5, 'none')).toBe(
      'Half-equivalence point: 1.50 mmol of lactic acid and 1.50 mmol of lactate ion. Equal amounts, so pH = pKa = 3.86.',
    );
    expect(readout('lactic', 14.5, 'none')).toBe(
      '0.10 mmol of lactic acid and 2.90 mmol of lactate ion. The lactate now outweighs the acid by more than ten to one. pH 5.32.',
    );
    expect(readout('lactic', 15, 'none')).toBe(
      'Equivalence point: all 3.00 mmol of the acid has reacted. The flask holds lactate ion alone, a weak base, so the pH is above 7: 8.40.',
    );
    expect(readout('hydrobromic', 0, 'none')).toBe('No base yet. The flask holds 3.00 mmol of H₃O⁺ from hydrobromic acid, a strong acid. pH 0.82.');
    expect(readout('hydrobromic', 7.5, 'none')).toBe('1.50 mmol of H₃O⁺ is left, and it sets the pH: 1.26.');
    expect(readout('hydrobromic', 15, 'none')).toBe(
      'Equivalence point: neither H₃O⁺ nor OH⁻ is left over. The flask holds Na⁺, Br⁻ and water. pH 7.00 at 25 °C.',
    );
    expect(readout('lactic', 15.5, 'none')).toBe('Past the equivalence point: 0.10 mmol of OH⁻ is left over, and it sets the pH: 11.45.');
    expect(readout('hydrobromic', 15.5, 'none')).toBe('Past the equivalence point: 0.10 mmol of OH⁻ is left over, and it sets the pH: 11.45.');
  });

  it('gives the brief’s four forms of the indicator sentence', () => {
    expect(indicatorSentence('lactic', 6.5, 'bromocresolGreen')).toBe(
      'Bromocresol green is yellow here. On this curve its color changes between 6.96 mL and 14.58 mL.',
    );
    expect(indicatorSentence('lactic', 7, 'bromocresolGreen')).toBe(
      'Bromocresol green is green here, partway from yellow to blue. On this curve its color changes between 6.96 mL and 14.58 mL.',
    );
    expect(indicatorSentence('hydrobromic', 15, 'bromothymolBlue')).toBe(
      'Bromothymol blue is green here, partway from yellow to blue. On this curve its color changes within 0.01 mL of 15.00 mL.',
    );
    expect(indicatorSentence('hydrobromic', 0, 'thymolBlue')).toBe(
      'Thymol blue is red here. On this curve its second change, from yellow to blue, comes between 15.00 mL and 15.01 mL.',
    );
    expect(indicatorSentence('lactic', 0, 'thymolBlue')).toBe(
      'Thymol blue is orange here, partway from red to yellow. On this curve its second change, from yellow to blue, comes between 15.00 mL and 15.01 mL.',
    );
    expect(indicatorSentence('lactic', 15, 'thymolBlue')).toBe(
      'Thymol blue is green here, partway from yellow to blue. On this curve its second change, from yellow to blue, comes between 15.00 mL and 15.01 mL.',
    );
  });

  it('puts the indicator sentence after the main one, with one space', () => {
    expect(readout('lactic', 7, 'bromocresolGreen')).toBe(
      'Buffer region: 1.60 mmol of lactic acid and 1.40 mmol of lactate ion, both members of the pair. pH 3.80. ' +
        'Bromocresol green is green here, partway from yellow to blue. On this curve its color changes between 6.96 mL and 14.58 mL.',
    );
  });

  it('the half-equivalence sentence prints the pKa, and the pH there shows as the same 3.86 (3.8622)', () => {
    const s = state('lactic', 7.5);
    expect(s.pH.toFixed(4)).toBe('3.8622');
    expect(s.pHText).toBe(shownPH(LACTIC_PKA));
    expect(readout('lactic', 7.5, 'none')).toContain(`pH = pKa = ${s.pHText}.`);
  });

  it('every readout states the pH as shown in the state, and no shown number is negative', () => {
    for (const { acid, volume } of everyState) {
      for (const indicator of INDICATOR_CHOICES) {
        const text = readout(acid, volume, indicator);
        expect(text).toContain(state(acid, volume).pHText);
        expect(text).not.toMatch(/-\d|−\d/);
      }
    }
  });
});

describe('the amounts, in whole micromoles', () => {
  it('follows the brief’s arithmetic at every setting', () => {
    for (const { acid, volume } of everyState) {
      const s = state(acid, volume);
      const added = 200 * volume;
      expect(Number.isInteger(s.added)).toBe(true);
      expect(s.added).toBe(added);
      expect(s.acidLeft).toBe(Math.max(3000 - added, 0));
      expect(s.reacted).toBe(Math.min(added, 3000));
      expect(s.excess).toBe(Math.max(added - 3000, 0));
      expect(s.totalMicroliters).toBe(20_000 + 1000 * volume);
    }
  });

  it('acid left plus acid reacted is 3.00 mmol in every state, and acid left and OH⁻ in excess are never both above zero', () => {
    for (const { acid, volume } of everyState) {
      const s = state(acid, volume);
      expect(s.acidLeft + s.reacted).toBe(3000);
      expect(s.acidLeft > 0 && s.excess > 0).toBe(false);
    }
  });

  it('shows amounts in mmol to two places, exactly', () => {
    const s = state('lactic', 14.5);
    expect([s.acidLeftText, s.reactedText, s.excessText]).toEqual(['0.10', '2.90', '0.00']);
    const t = state('hydrobromic', 30);
    expect([t.acidLeftText, t.reactedText, t.excessText]).toEqual(['0.00', '3.00', '3.00']);
  });
});

describe('the model', () => {
  it('calls the solver with the concentrations in the total volume: C, Ka and Na⁺ for lactic acid; Br⁻ and Na⁺ for hydrobromic acid', () => {
    for (const volume of VOLUMES) {
      const total = 20_000 + 1000 * volume;
      const c = 3000 / total;
      const na = (200 * volume) / total;
      expect(state('lactic', volume).hydronium).toBe(hydronium({ weakAcid: c, ka: LACTIC_KA, cations: na }));
      expect(state('hydrobromic', volume).hydronium).toBe(hydronium({ cations: na, anions: c }));
      for (const acid of ACID_IDS) expect(state(acid, volume).pH).toBe(-Math.log10(state(acid, volume).hydronium));
    }
  });

  it('pHAt gives the same pH as the state at every setting, and is continuous between settings', () => {
    for (const { acid, volume } of everyState) expect(pHAt(acid, volume)).toBe(state(acid, volume).pH);
    expect(pHAt('lactic', 7.25)).toBeGreaterThan(state('lactic', 7).pH);
    expect(pHAt('lactic', 7.25)).toBeLessThan(state('lactic', 7.5).pH);
  });

  it('the kind of state follows the whole micromoles: early when ten times the lactate is less than the acid, late when ten times the acid is less than the lactate', () => {
    const kinds = VOLUMES.map((v) => state('lactic', v).kind);
    const at = (v: number) => kinds[VOLUMES.indexOf(v)];
    expect(at(0)).toBe('start');
    expect([at(0.5), at(1)]).toEqual(['early', 'early']);
    for (const v of VOLUMES.filter((v) => v >= 1.5 && v <= 13.5 && v !== 7.5)) expect(at(v), `${v} mL`).toBe('buffer');
    expect(at(7.5)).toBe('half');
    expect([at(14), at(14.5)]).toEqual(['late', 'late']);
    expect(at(15)).toBe('equivalence');
    for (const v of VOLUMES.filter((v) => v > 15)) expect(at(v)).toBe('past');
    const hbr = VOLUMES.map((v) => state('hydrobromic', v).kind);
    expect(hbr[0]).toBe('start');
    expect(hbr.slice(1, 30).every((k) => k === 'before')).toBe(true);
    expect(hbr[30]).toBe('equivalence');
    expect(hbr.slice(31).every((k) => k === 'past')).toBe(true);
  });

  it('the buffer-region states stand between 1 to 9 and 9 to 1; the early and late ones outside 1 to 10 and 10 to 1', () => {
    for (const v of VOLUMES) {
      const s = state('lactic', v);
      const ratio = s.reacted / s.acidLeft;
      if (s.kind === 'buffer' || s.kind === 'half') {
        expect(ratio).toBeGreaterThanOrEqual(1 / 9 - 1e-12);
        expect(ratio).toBeLessThanOrEqual(9 + 1e-12);
      }
      if (s.kind === 'early') expect(ratio).toBeLessThan(1 / 10);
      if (s.kind === 'late') expect(ratio).toBeGreaterThan(10);
    }
  });
});

describe('the limits, over all states', () => {
  it('the pH rises at every step of the slider, for both acids', () => {
    for (const acid of ACID_IDS) {
      for (let i = 1; i < VOLUMES.length; i++) {
        expect(state(acid, VOLUMES[i] ?? 0).pH).toBeGreaterThan(state(acid, VOLUMES[i - 1] ?? 0).pH);
      }
    }
  });

  it('the lowest pH is 0.82 (hydrobromic acid, 0.0 mL) and the highest 12.78 (30.0 mL, either acid), inside the axis', () => {
    const states = everyState.map(({ acid, volume }) => state(acid, volume));
    const low = states.reduce((a, b) => (b.pH < a.pH ? b : a));
    const high = states.reduce((a, b) => (b.pH > a.pH ? b : a));
    expect([low.acid, low.volume, low.pHText]).toEqual(['hydrobromic', 0, '0.82']);
    expect([high.volume, high.pHText]).toEqual([30, '12.78']);
    expect(low.pH).toBeGreaterThan(0);
    expect(high.pH).toBeLessThan(AXES.pHMax);
    expect(state('lactic', 0).pHText).toBe('2.35');
  });

  it('the lactic acid curve lies above the hydrobromic acid curve up to 15.0 mL; from 15.5 mL the two agree to under 0.000001', () => {
    for (const volume of VOLUMES) {
      const lactic = state('lactic', volume);
      const hbr = state('hydrobromic', volume);
      if (volume <= 15) expect(lactic.pH).toBeGreaterThan(hbr.pH);
      else {
        expect(Math.abs(lactic.pH - hbr.pH)).toBeLessThan(1e-6);
        expect(lactic.pHText).toBe(hbr.pHText);
      }
    }
  });

  it('the largest step is at the equivalence point: from 14.5 to 15.5 mL the pH rises by 6.13 for lactic acid and 8.91 for hydrobromic acid', () => {
    for (const acid of ACID_IDS) {
      const steps = VOLUMES.slice(1).map((v, i) => state(acid, v).pH - state(acid, VOLUMES[i] ?? 0).pH);
      const biggest = steps.indexOf(Math.max(...steps));
      expect([VOLUMES[biggest], VOLUMES[biggest + 1]]).toContain(15);
    }
    const rise = (acid: AcidId) => Math.round(100 * (Number(state(acid, 15.5).pHText) - Number(state(acid, 14.5).pHText)));
    expect(rise('lactic')).toBe(613);
    expect(rise('hydrobromic')).toBe(891);
  });

  it('no state’s pH lies on an end of an indicator’s range, and the shown pH is on the same side of each end as the unrounded one', () => {
    const ends = realIndicators.flatMap((id) => INDICATORS[id].changes.flatMap((c) => [c.low, c.high]));
    for (const { acid, volume } of everyState) {
      const s = state(acid, volume);
      const shown = Number(s.pHText);
      for (const end of ends) {
        expect(s.pH).not.toBe(end);
        expect(Math.sign(shown - end) === Math.sign(s.pH - end) || shown === end, `${acid} at ${volume} mL, end ${end}`).toBe(true);
        if (shown === end) {
          // Shown on the end itself: the color is then the changing one, as the pH is inside the range.
          expect(s.pH).toBeGreaterThan(end);
        }
      }
    }
    // The nearest case: lactic acid at 7.0 mL with bromocresol green, 3.8045 shown as 3.80, green.
    const s = state('lactic', 7);
    expect(s.pH.toFixed(4)).toBe('3.8045');
    expect(s.pHText).toBe('3.80');
    expect(indicatorColor('bromocresolGreen', s.pH).color).toBe('green');
  });
});

describe('rounding, half up from the unrounded value', () => {
  it('pins the three states next to a rounding tie: 12.12494, 0.87506 and 4.81507', () => {
    for (const acid of ACID_IDS) {
      const s = state(acid, 17.5);
      expect(s.pH.toFixed(5)).toBe('12.12494');
      expect(s.pHText).toBe('12.12');
    }
    const hbr = state('hydrobromic', 1);
    expect(hbr.pH.toFixed(5)).toBe('0.87506');
    expect(hbr.pHText).toBe('0.88');
    const lactic = state('lactic', 13.5);
    expect(lactic.pH.toFixed(5)).toBe('4.81507');
    expect(lactic.pHText).toBe('4.82');
  });

  it('no other state is within 0.0001 of a tie; 16.0 and 16.5 mL are within 0.0003', () => {
    const fromTie = (x: number) => Math.abs(x * 100 - Math.floor(x * 100) - 0.5) / 100;
    const near = new Set(['lactic 17.5', 'hydrobromic 17.5', 'hydrobromic 1', 'lactic 13.5']);
    for (const { acid, volume } of everyState) {
      const d = fromTie(state(acid, volume).pH);
      expect(d).toBeGreaterThan(1e-9);
      if (near.has(`${acid} ${volume}`)) {
        expect(d).toBeGreaterThan(0.00005);
        expect(d).toBeLessThan(0.00008);
      } else {
        expect(d, `${acid} at ${volume} mL`).toBeGreaterThan(0.0001);
      }
    }
    expect(state('lactic', 16).pH.toFixed(5)).toBe('11.74473');
    expect(state('lactic', 16.5).pH.toFixed(5)).toBe('11.91483');
  });

  it('formats a pH and a volume half up', () => {
    expect(shownPH(2.3456)).toBe('2.35');
    expect(shownPH(12.12494)).toBe('12.12');
    expect(shownPH(0.87506)).toBe('0.88');
    expect(shownPH(7)).toBe('7.00');
    expect(shownPH(0.125)).toBe('0.13');
    expect(shownVolume(14.5788)).toBe('14.58');
    expect(shownVolume(14.9998)).toBe('15.00');
    expect(shownVolume(6.9614)).toBe('6.96');
    // An exact tie (14.125 is exact in binary) rounds up.
    expect(shownVolume(14.125)).toBe('14.13');
  });
});

describe('the indicators', () => {
  it('names the color from the unrounded pH: the acid color below, the changing color from end to end with both included, the base color above', () => {
    expect(indicatorColor('bromocresolGreen', 3.79).color).toBe('yellow');
    expect(indicatorColor('bromocresolGreen', 3.8).color).toBe('green');
    expect(indicatorColor('bromocresolGreen', 5.4).color).toBe('green');
    expect(indicatorColor('bromocresolGreen', 5.41).color).toBe('blue');
    expect(indicatorColor('bromocresolGreen', 4).changing).toEqual({ from: 'yellow', to: 'blue' });
    expect(indicatorColor('bromocresolGreen', 3).changing).toBeNull();
    expect(indicatorColor('thymolBlue', 1.19).color).toBe('red');
    expect(indicatorColor('thymolBlue', 1.2).color).toBe('orange');
    expect(indicatorColor('thymolBlue', 2.8).color).toBe('orange');
    expect(indicatorColor('thymolBlue', 2.81).color).toBe('yellow');
    expect(indicatorColor('thymolBlue', 7.99).color).toBe('yellow');
    expect(indicatorColor('thymolBlue', 8).color).toBe('green');
    expect(indicatorColor('thymolBlue', 9.6).color).toBe('green');
    expect(indicatorColor('thymolBlue', 9.61).color).toBe('blue');
    expect(indicatorColor('thymolBlue', 2).changing).toEqual({ from: 'red', to: 'yellow' });
  });

  for (const row of INDICATOR_TABLE) {
    it(`${row.indicator} on the ${row.acid} acid curve: ${row.colors.map(([c, a, b]) => `${c} ${a} to ${b}`).join('; ')}`, () => {
      for (const volume of VOLUMES) {
        const band = row.colors.find(([, from, to]) => volume >= from && volume <= to);
        expect(band, `${volume} mL is in the table`).toBeDefined();
        expect(indicatorColor(row.indicator, state(row.acid, volume).pH).color, `${volume} mL`).toBe(band?.[0]);
      }
    });

    it(`${row.indicator} on the ${row.acid} acid curve changes between ${row.between[0]} and ${row.between[1]} mL`, () => {
      const v = changeVolumes(row.acid, row.indicator);
      expect([v.lowText, v.highText]).toEqual(row.between);
      expect([v.low.toFixed(4), v.high.toFixed(4)]).toEqual(UNROUNDED[`${row.indicator} ${row.acid}`]);
      // Each is where the curve's pH meets an end of the drawn range, to better than 0.001 mL.
      const change = band(row.indicator);
      expect(pHAt(row.acid, v.low - 0.001)).toBeLessThan(change.low);
      expect(pHAt(row.acid, v.low + 0.001)).toBeGreaterThan(change.low);
      expect(pHAt(row.acid, v.high - 0.001)).toBeLessThan(change.high);
      expect(pHAt(row.acid, v.high + 0.001)).toBeGreaterThan(change.high);
      expect(Math.abs(pHAt(row.acid, v.low) - change.low)).toBeLessThan(1e-6);
      expect(Math.abs(pHAt(row.acid, v.high) - change.high)).toBeLessThan(1e-6);
    });
  }

  it('no crossing volume is on a rounding tie at 0.01 mL', () => {
    for (const acid of ACID_IDS) {
      for (const indicator of realIndicators) {
        const v = changeVolumes(acid, indicator);
        for (const x of [v.low, v.high]) expect(Math.abs(x * 100 - Math.floor(x * 100) - 0.5)).toBeGreaterThan(0.001);
      }
    }
  });

  it('draws thymol blue’s second range as its band, and the others’ one range; each labeled yellow below and blue above', () => {
    expect(band('bromocresolGreen')).toMatchObject({ low: 3.8, high: 5.4, below: 'yellow', above: 'blue' });
    expect(band('bromothymolBlue')).toMatchObject({ low: 6.0, high: 7.6, below: 'yellow', above: 'blue' });
    expect(band('thymolBlue')).toMatchObject({ low: 8.0, high: 9.6, below: 'yellow', above: 'blue' });
  });

  it('thymol blue’s first change spans 6.61 mL to 14.72 mL on the hydrobromic acid curve, and the lactic acid curve starts inside it', () => {
    const first = INDICATORS.thymolBlue.changes[0];
    if (!first) throw new Error('Thymol blue has a first change.');
    const crossing = (target: number) => VOLUMES.find((v) => state('hydrobromic', v).pH >= target);
    expect(crossing(first.low)).toBe(7);
    expect(crossing(first.high)).toBe(15);
    expect(state('lactic', 0).pH).toBeGreaterThan(first.low);
    expect(state('lactic', 0).pH).toBeLessThan(first.high);
    expect(state('lactic', 1).pH).toBeLessThan(first.high);
    expect(state('lactic', 1.5).pH).toBeGreaterThan(first.high);
  });

  it('every readout with an indicator names a color the pH it shows agrees with, and the two volumes of the drawn range', () => {
    for (const { acid, volume } of everyState) {
      for (const indicator of realIndicators) {
        const s = state(acid, volume);
        const { color } = indicatorColor(indicator, s.pH);
        const text = readout(acid, volume, indicator);
        expect(text).toContain(`${TITLE[indicator]} is ${color} here`);
        const v = changeVolumes(acid, indicator);
        if (v.lowText === v.highText) expect(text).toContain(`within 0.01 mL of ${v.lowText} mL.`);
        else expect(text).toContain(`between ${v.lowText} mL and ${v.highText} mL.`);
      }
    }
  });

  it('says "within 0.01 mL" only for bromothymol blue on hydrobromic acid', () => {
    const within = ACID_IDS.flatMap((acid) => realIndicators.filter((id) => indicatorSentence(acid, 0, id).includes('within')).map((id) => `${id} ${acid}`));
    expect(within).toEqual(['bromothymolBlue hydrobromic']);
  });
});

describe('the graph', () => {
  it('draws each curve at every 0.1 mL from 0.0 to 30.0 mL and every 0.01 mL from 14.5 to 15.5 mL: 391 points', () => {
    for (const acid of ACID_IDS) {
      const points = curve(acid);
      expect(points).toHaveLength(391);
      expect(points[0]?.volume).toBe(0);
      expect(points.at(-1)?.volume).toBe(30);
      for (let i = 1; i < points.length; i++) {
        expect(points[i]?.volume ?? 0).toBeGreaterThan(points[i - 1]?.volume ?? 0);
        expect(points[i]?.pH ?? 0).toBeGreaterThan(points[i - 1]?.pH ?? 0);
      }
      for (let k = 0; k <= 300; k++) expect(points.some((p) => Math.abs(p.volume - k / 10) < 1e-9)).toBe(true);
      for (let k = 1450; k <= 1550; k++) expect(points.some((p) => Math.abs(p.volume - k / 100) < 1e-9)).toBe(true);
    }
  });

  it('puts the marker’s value on a vertex of the curve at every slider setting', () => {
    for (const { acid, volume } of everyState) {
      const point = curve(acid).find((p) => p.volume === volume);
      expect(point, `${acid} at ${volume} mL`).toBeDefined();
      expect(point?.pH).toBe(state(acid, volume).pH);
    }
  });

  it('marks the buffer region along the lactic acid curve, from 1.36 mL to 13.64 mL', () => {
    const mark = bufferMark();
    expect(mark[0]?.volume).toBe(15 / 11);
    expect(mark.at(-1)?.volume).toBe(150 / 11);
    for (const p of mark) expect(p.pH).toBe(pHAt('lactic', p.volume));
    // Every curve point inside the region is on the mark.
    const inside = curve('lactic').filter((p) => p.volume > 15 / 11 && p.volume < 150 / 11);
    expect(mark).toHaveLength(inside.length + 2);
    // Near pKa − 1 and pKa + 1 at the two ends (the brief gives no pH there; these are the module's
    // values, 2.90 and 4.86, a little off 2.86 and 4.86 where the acid's own ionization counts).
    expect(shownPH(mark[0]?.pH ?? 0)).toBe('2.90');
    expect(shownPH(mark.at(-1)?.pH ?? 0)).toBe('4.86');
    expect(Math.abs((mark[0]?.pH ?? 0) - (LACTIC_PKA - 1))).toBeLessThan(0.05);
    expect(Math.abs((mark.at(-1)?.pH ?? 0) - (LACTIC_PKA + 1))).toBeLessThan(0.05);
  });

  it('describes the graph in words', () => {
    expect(describeGraph('lactic', 0, 'none')).toBe(
      'Graph of pH, from 0 to 14, against sodium hydroxide added, from 0 to 30 mL. ' +
        'The curve of lactic acid is drawn heavy. It starts at pH 2.35, rises slowly through the buffer region, marked along the curve from 1.36 mL to 13.64 mL, ' +
        'passes pH 3.86 at the half-equivalence point, 7.5 mL, rises steeply to 8.40 at the equivalence point, 15.0 mL, and ends at 12.78 at 30.0 mL. ' +
        'The curve of hydrobromic acid is drawn faint and dashed. It starts at pH 0.82, rises steeply to 7.00 at 15.0 mL, and from 15.5 mL on lies on the curve of lactic acid. ' +
        'Dotted lines mark the equivalence point and the half-equivalence point. ' +
        'A marker at 0.0 mL is on the curve of lactic acid, at pH 2.35.',
    );
    expect(describeGraph('hydrobromic', 15, 'bromothymolBlue')).toBe(
      'Graph of pH, from 0 to 14, against sodium hydroxide added, from 0 to 30 mL. ' +
        'The curve of hydrobromic acid is drawn heavy. It starts at pH 0.82, rises slowly, then steeply to 7.00 at the equivalence point, 15.0 mL, and ends at 12.78 at 30.0 mL. ' +
        'The curve of lactic acid is drawn faint and dashed. It starts at pH 2.35, rises steeply to 8.40 at 15.0 mL, and from 15.5 mL on lies on the curve of hydrobromic acid. ' +
        'A dotted line marks the equivalence point. ' +
        'A hatched band lies across the graph from pH 6.0 to 7.6, where bromothymol blue changes color: yellow below, blue above. ' +
        'A marker at 15.0 mL is on the curve of hydrobromic acid, at pH 7.00.',
    );
    expect(describeGraph('lactic', 7.5, 'thymolBlue')).toContain(
      'A hatched band lies across the graph from pH 8.0 to 9.6, where thymol blue makes its second change: yellow below, blue above. ',
    );
  });
});

describe('the bars, "What is in the flask"', () => {
  it('has three bars for lactic acid', () => {
    expect(bars('lactic', 5)).toEqual({
      rows: [
        { id: 'acid', name: 'Lactic acid left', micromoles: 2000, text: '2.00 mmol' },
        { id: 'base', name: 'Lactate ion formed', micromoles: 1000, text: '1.00 mmol' },
        { id: 'excess', name: 'OH⁻ left over', micromoles: 0, text: '0.00 mmol' },
      ],
      spectators: null,
    });
  });

  it('has two bars for hydrobromic acid, and in the middle place the words "Br⁻ and Na⁺ are spectators" and no bar', () => {
    expect(bars('hydrobromic', 16)).toEqual({
      rows: [
        { id: 'acid', name: 'H₃O⁺ left', micromoles: 0, text: '0.00 mmol' },
        { id: 'excess', name: 'OH⁻ left over', micromoles: 200, text: '0.20 mmol' },
      ],
      spectators: 'Br⁻ and Na⁺ are spectators',
    });
  });

  it('never runs past 3.00 mmol, the length of a full bar', () => {
    for (const { acid, volume } of everyState) for (const row of bars(acid, volume).rows) expect(row.micromoles).toBeLessThanOrEqual(3000);
  });

  it('describes the bars in words', () => {
    expect(describeBars('lactic', 0)).toBe(
      'Bars of what is in the flask, in millimoles, after the base added has reacted completely: lactic acid left, 3.00; lactate ion formed, 0.00; OH⁻ left over, 0.00.',
    );
    expect(describeBars('hydrobromic', 15.5)).toBe(
      'Bars of what is in the flask, in millimoles, after the base added has reacted completely: H₃O⁺ left, 0.00; OH⁻ left over, 0.10. Br⁻ and Na⁺ are spectators and have no bar.',
    );
  });
});

describe('the key under the graph', () => {
  it('names the two curves, the buffer region for lactic acid and the chosen indicator’s band', () => {
    expect(keyItems('lactic', 'none')).toEqual([
      { kind: 'chosen', text: 'lactic acid' },
      { kind: 'other', text: 'hydrobromic acid' },
      { kind: 'buffer', text: 'buffer region, 1.36 to 13.64 mL' },
    ]);
    expect(keyItems('hydrobromic', 'bromocresolGreen')).toEqual([
      { kind: 'chosen', text: 'hydrobromic acid' },
      { kind: 'other', text: 'lactic acid' },
      { kind: 'band', text: 'bromocresol green changes, pH 3.8 to 5.4' },
    ]);
    expect(keyItems('lactic', 'thymolBlue').at(-1)).toEqual({ kind: 'band', text: 'thymol blue’s second change, pH 8.0 to 9.6' });
  });
});

describe('bad input', () => {
  it('throws a RangeError that names an unknown acid', () => {
    expect(() => state('acetic' as AcidId, 0)).toThrow(RangeError);
    expect(() => state('acetic' as AcidId, 0)).toThrow(/"acetic"/);
    expect(() => curve('tartaric' as AcidId)).toThrow(/"tartaric"/);
  });

  it('throws a RangeError that names an unknown indicator', () => {
    expect(() => readout('lactic', 0, 'litmus' as IndicatorChoice)).toThrow(RangeError);
    expect(() => readout('lactic', 0, 'litmus' as IndicatorChoice)).toThrow(/"litmus"/);
    expect(() => changeVolumes('lactic', 'none' as IndicatorId)).toThrow(/"none"/);
  });

  for (const volume of [-0.5, 30.5, 7.25, Number.NaN]) {
    it(`throws a RangeError that names the volume ${volume}`, () => {
      expect(() => state('lactic', volume)).toThrow(RangeError);
      expect(() => state('lactic', volume)).toThrow(new RegExp(String(volume).replace('.', '\\.')));
      expect(() => volumeText(volume)).toThrow(RangeError);
    });
  }

  it('pHAt refuses a volume outside 0 to 30 mL', () => {
    expect(() => pHAt('lactic', -0.1)).toThrow(/-0\.1/);
    expect(() => pHAt('lactic', 30.1)).toThrow(/30\.1/);
    expect(() => pHAt('lactic', Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('refuses to show a number that is not finite', () => {
    expect(() => shownPH(Number.NaN)).toThrow(/NaN/);
    expect(() => shownVolume(Number.POSITIVE_INFINITY)).toThrow(/Infinity/);
  });
});
