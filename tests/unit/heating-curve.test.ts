import { describe, expect, it } from 'vitest';
import {
  AXES,
  BOX,
  CENTIJOULES_PER_KILOJOULE,
  ENERGY,
  LAYOUT,
  SEGMENT_KINDS,
  START_SUBSTANCE,
  SUBSTANCE_IDS,
  SUBSTANCES,
  curvePoints,
  describeBox,
  describeGraph,
  energyText,
  particles,
  readout,
  segmentEnergy,
  segments,
  shownEnergy,
  shownTemperature,
  slope,
  state,
  type SegmentKind,
  type SubstanceId,
} from '../../src/lib/heating-curve';

const BOTH: SubstanceId[] = ['ethanol', 'iodine'];
// Halves of a kJ: a whole number over 2 is exact in binary, so these are exactly the
// 141 energies the slider reaches, from 0 to 70 kJ in steps of 0.5.
const ALL_ENERGIES: number[] = Array.from({ length: 141 }, (_, i) => i / 2);
const everyState = BOTH.flatMap((id) => ALL_ENERGIES.map((energy) => ({ id, energy })));

// The lesson brief's table, written out: each segment's energy and the running total at its
// end, in joules. The gas segment ends at the end of the slider, 70,000 J.
const BRIEF_SEGMENTS: Record<SubstanceId, { joules: number[]; totals: number[]; kJ: string[] }> = {
  ethanol: {
    joules: [2513, 4930, 21548.8, 38600, 2408.2],
    totals: [2513, 7443, 28991.8, 67591.8, 70000],
    kJ: ['2.5', '4.9', '21.5', '38.6', '2.4'],
  },
  iodine: {
    joules: [4825.28, 15500, 5705.49, 41600, 2369.23],
    totals: [4825.28, 20325.28, 26030.77, 67630.77, 70000],
    kJ: ['4.8', '15.5', '5.7', '41.6', '2.4'],
  },
};

// The brief's worked states: energy in kJ, what is present, the temperature shown, the percent shown.
const WORKED: [SubstanceId, number, SegmentKind, string, string | null][] = [
  ['ethanol', 0, 'solid', '−150.0', null],
  ['ethanol', 1, 'solid', '−135.7', null],
  ['ethanol', 5, 'melting', '−114.1', '50'],
  ['ethanol', 12, 'liquid', '−73.4', null],
  ['ethanol', 26, 'liquid', '51.6', null],
  ['ethanol', 29, 'boiling', '78.3', 'less than 1'],
  ['ethanol', 40, 'boiling', '78.3', '29'],
  ['ethanol', 67.5, 'boiling', '78.3', 'more than 99'],
  ['ethanol', 68, 'gas', '83.7', null],
  ['ethanol', 68.5, 'gas', '90.3', null],
  ['ethanol', 70, 'gas', '110.0', null],
  ['iodine', 0, 'solid', '25.0', null],
  ['iodine', 2.5, 'solid', '71.0', null],
  ['iodine', 12, 'melting', '113.7', '46'],
  ['iodine', 23, 'liquid', '146.8', null],
  ['iodine', 40, 'boiling', '184.4', '34'],
  ['iodine', 68, 'gas', '194.4', null],
  ['iodine', 70, 'gas', '248.6', null],
];

describe('the substances, the slider and the axes', () => {
  it('has ethanol with the values of the lesson brief, in tenths of a degree and tenths of J/(mol·°C)', () => {
    expect(SUBSTANCES.ethanol).toEqual({
      name: 'ethanol',
      title: 'Ethanol',
      label: 'Ethanol, C₂H₅OH',
      startTenths: -1500,
      meltingTenths: -1141,
      boilingTenths: 783,
      fusionJoules: 4930,
      vaporizationJoules: 38600,
      heatCapacityTenths: { solid: 700, liquid: 1120, gas: 760 },
    });
  });

  it('has iodine with the values of the lesson brief', () => {
    expect(SUBSTANCES.iodine).toEqual({
      name: 'iodine',
      title: 'Iodine',
      label: 'Iodine, I₂',
      startTenths: 250,
      meltingTenths: 1137,
      boilingTenths: 1844,
      fusionJoules: 15500,
      vaporizationJoules: 41600,
      heatCapacityTenths: { solid: 544, liquid: 807, gas: 369 },
    });
  });

  it('lists the substances in the order of the radio buttons, and starts on ethanol', () => {
    expect(SUBSTANCE_IDS).toEqual(['ethanol', 'iodine']);
    expect(START_SUBSTANCE).toBe('ethanol');
  });

  it('has a slider from 0 to 70 kJ in steps of 0.5, starting at 5', () => {
    expect(ENERGY).toEqual({ min: 0, max: 70, step: 0.5, start: 5 });
    expect(CENTIJOULES_PER_KILOJOULE).toBe(100_000);
  });

  it('draws one temperature axis for both substances, from −150 to 250 °C, and the energy axis from 0 to 70 kJ', () => {
    expect(AXES).toEqual({
      energyMax: 70,
      temperatureMin: -150,
      temperatureMax: 250,
      energyTicks: [0, 10, 20, 30, 40, 50, 60, 70],
      temperatureTicks: [-150, -100, -50, 0, 50, 100, 150, 200, 250],
    });
  });

  it('names the five kinds of segment in order', () => {
    expect(SEGMENT_KINDS).toEqual(['solid', 'melting', 'liquid', 'boiling', 'gas']);
  });
});

describe('segments', () => {
  for (const id of BOTH) {
    it(`gives the energy of each of ${id}'s segments and the total at its end, as the brief does`, () => {
      const drawn = segments(id);
      expect(drawn.map((segment) => segment.kind)).toEqual(SEGMENT_KINDS);
      const brief = BRIEF_SEGMENTS[id];
      drawn.forEach((segment, index) => {
        expect((segment.endCentijoules - segment.startCentijoules) / 100, `${id} segment ${index + 1}`).toBeCloseTo(brief.joules[index] ?? Number.NaN, 9);
        expect(segment.endCentijoules / 100, `${id} total after segment ${index + 1}`).toBeCloseTo(brief.totals[index] ?? Number.NaN, 9);
        expect(Number.isInteger(segment.startCentijoules) && Number.isInteger(segment.endCentijoules), 'whole centijoules').toBe(true);
      });
      expect(drawn[0]?.startCentijoules).toBe(0);
      for (let i = 1; i < drawn.length; i++) expect(drawn[i]?.startCentijoules).toBe(drawn[i - 1]?.endCentijoules);
    });

    it(`writes each of ${id}'s segment energies in kJ to one decimal, as the readout gives them`, () => {
      expect([0, 1, 2, 3, 4].map((index) => segmentEnergy(id, index))).toEqual(BRIEF_SEGMENTS[id].kJ);
    });
  }

  it('starts and ends each segment at its temperatures', () => {
    const ethanol = segments('ethanol');
    expect(ethanol.map((segment) => [segment.startTenths, segment.endTenths])).toEqual([
      [-1500, -1141],
      [-1141, -1141],
      [-1141, 783],
      [783, 783],
      [783, 783 + 240820 / 760],
    ]);
    const iodine = segments('iodine');
    expect(iodine.map((segment) => [segment.startTenths, segment.endTenths])).toEqual([
      [250, 1137],
      [1137, 1137],
      [1137, 1844],
      [1844, 1844],
      [1844, 1844 + 236923 / 369],
    ]);
  });

  it('throws for a segment that does not exist', () => {
    expect(() => segmentEnergy('ethanol', 5)).toThrow(RangeError);
    expect(() => segmentEnergy('ethanol', -1)).toThrow(/-1/);
  });
});

describe('slopes and the curve', () => {
  it('gives the slope of each sloped part in °C for each kJ, as the brief does', () => {
    const rounded = (id: SubstanceId, phase: 'solid' | 'liquid' | 'gas') => Math.round(slope(id, phase) * 10) / 10;
    expect([rounded('ethanol', 'solid'), rounded('ethanol', 'liquid'), rounded('ethanol', 'gas')]).toEqual([14.3, 8.9, 13.2]);
    expect([rounded('iodine', 'solid'), rounded('iodine', 'liquid'), rounded('iodine', 'gas')]).toEqual([18.4, 12.4, 27.1]);
  });

  it("makes iodine's gas line the steepest and its liquid line the gentlest, as the lesson says", () => {
    expect(slope('iodine', 'gas')).toBeGreaterThan(slope('iodine', 'solid'));
    expect(slope('iodine', 'solid')).toBeGreaterThan(slope('iodine', 'liquid'));
  });

  it('gives the six corners of each curve, in kJ and °C', () => {
    const ethanol = curvePoints('ethanol');
    const expected: [number, number][] = [
      [0, -150],
      [2.513, -114.1],
      [7.443, -114.1],
      [28.9918, 78.3],
      [67.5918, 78.3],
      [70, 78.3 + 240820 / 7600],
    ];
    expect(ethanol).toHaveLength(6);
    ethanol.forEach((point, i) => {
      expect(point.energy).toBeCloseTo(expected[i]?.[0] ?? Number.NaN, 9);
      expect(point.temperature).toBeCloseTo(expected[i]?.[1] ?? Number.NaN, 9);
    });
    const iodine = curvePoints('iodine');
    expect(iodine[5]?.energy).toBe(70);
    expect(iodine[5]?.temperature).toBeCloseTo(248.6, 1);
    expect(iodine[1]?.energy).toBeCloseTo(4.82528, 9);
  });

  it('puts every state on its curve', () => {
    for (const { id, energy } of everyState) {
      const points = curvePoints(id);
      const index = points.findIndex((point, i) => i > 0 && energy <= point.energy);
      const from = points[index - 1];
      const to = points[index];
      if (!from || !to) throw new Error(`No segment for ${id} at ${energy} kJ`);
      const onLine = from.temperature + ((energy - from.energy) / (to.energy - from.energy)) * (to.temperature - from.temperature);
      expect(state(id, energy).temperature, `${id} at ${energy} kJ`).toBeCloseTo(onLine, 9);
    }
  });
});

describe('state', () => {
  it.each(WORKED)('gives %s at %s kJ as %s at %s °C, with %s percent changed', (id, energy, kind, temperature, percent) => {
    const now = state(id, energy);
    expect(now.kind).toBe(kind);
    expect(shownTemperature(now.temperatureTenths)).toBe(temperature);
    expect(now.percentText).toBe(percent);
  });

  it('says less than 1 percent for ethanol at 29.0 kJ, where exactly 0.0212 percent has boiled', () => {
    const now = state('ethanol', 29);
    // 820 cJ into a flat of 3,860,000 cJ.
    expect(now.energyCentijoules - (segments('ethanol')[3]?.startCentijoules ?? 0)).toBe(820);
    expect(now.percent).toBe(0);
    expect(now.percentText).toBe('less than 1');
  });

  it('says more than 99 percent for ethanol at 67.5 kJ, where exactly 99.76 percent has boiled', () => {
    expect(state('ethanol', 67.5).percent).toBe(100);
    expect(state('ethanol', 67.5).percentText).toBe('more than 99');
  });

  it('gives a share from 1 to 99 percent as a whole number, rounded half up: iodine at 5.0 kJ is 1.13 percent', () => {
    expect(state('iodine', 5).percent).toBe(1);
    expect(state('iodine', 5).percentText).toBe('1');
  });

  it('rounds the one exact tie, ethanol at 68.5 kJ (90.25 °C), half up to 90.3 °C', () => {
    expect(state('ethanol', 68.5).temperatureTenths).toBe(903);
  });

  it('gives the energy in whole centijoules and the segment it falls in', () => {
    expect(state('ethanol', 5)).toMatchObject({ substance: 'ethanol', energyCentijoules: 500_000, segment: 1, kind: 'melting' });
    expect(state('iodine', 70)).toMatchObject({ energyCentijoules: 7_000_000, segment: 4, kind: 'gas' });
  });

  it('counts the molecules in the box in each phase: 20 in all, split as the exact share, with at least one of each phase on a flat', () => {
    expect(state('ethanol', 0).counts).toEqual({ solid: 20, liquid: 0, gas: 0 });
    expect(state('ethanol', 5).counts).toEqual({ solid: 10, liquid: 10, gas: 0 });
    expect(state('ethanol', 12).counts).toEqual({ solid: 0, liquid: 20, gas: 0 });
    expect(state('ethanol', 29).counts).toEqual({ solid: 0, liquid: 19, gas: 1 });
    expect(state('ethanol', 40).counts).toEqual({ solid: 0, liquid: 14, gas: 6 });
    expect(state('ethanol', 67.5).counts).toEqual({ solid: 0, liquid: 1, gas: 19 });
    expect(state('ethanol', 70).counts).toEqual({ solid: 0, liquid: 0, gas: 20 });
    expect(state('iodine', 12).counts).toEqual({ solid: 11, liquid: 9, gas: 0 });
    expect(state('iodine', 40).counts).toEqual({ solid: 0, liquid: 13, gas: 7 });
  });

  it.each([
    ['an energy off its step', 'ethanol', 12.3],
    ['an energy above 70 kJ', 'ethanol', 70.5],
    ['an energy below 0 kJ', 'iodine', -0.5],
    ['NaN', 'ethanol', Number.NaN],
    ['an infinite energy', 'iodine', Number.POSITIVE_INFINITY],
  ] as const)('throws for %s', (_what, id, energy) => {
    expect(() => state(id, energy)).toThrow(RangeError);
  });

  it('names the energy and the range in its message', () => {
    expect(() => state('ethanol', 12.3)).toThrow(/12\.3 kJ/);
    expect(() => state('ethanol', 71)).toThrow(/0 to 70 kJ in steps of 0\.5 kJ/);
  });

  it('throws for an unknown substance, and names it and the substances to give instead', () => {
    // @ts-expect-error -- a substance the type forbids, on purpose
    expect(() => state('water', 5)).toThrow(/ethanol or iodine.*"water"/);
    // @ts-expect-error -- a substance the type forbids, on purpose
    expect(() => segments('water')).toThrow(RangeError);
  });
});

describe('over all 282 states the controls reach', () => {
  it('has 282 states', () => {
    expect(everyState).toHaveLength(282);
  });

  it('never lowers the temperature as energy is added', () => {
    for (const id of BOTH) {
      for (let i = 1; i < ALL_ENERGIES.length; i++) {
        const before = state(id, ALL_ENERGIES[i - 1] ?? 0);
        const after = state(id, ALL_ENERGIES[i] ?? 0);
        expect(after.temperature, `${id} at ${ALL_ENERGIES[i]} kJ`).toBeGreaterThanOrEqual(before.temperature);
        expect(after.temperatureTenths).toBeGreaterThanOrEqual(before.temperatureTenths);
      }
    }
  });

  it('holds the temperature at the melting or boiling point on each flat, and shows a percent only there', () => {
    for (const { id, energy } of everyState) {
      const now = state(id, energy);
      const substance = SUBSTANCES[id];
      if (now.kind === 'melting') expect(now.temperatureTenths).toBe(substance.meltingTenths);
      if (now.kind === 'boiling') expect(now.temperatureTenths).toBe(substance.boilingTenths);
      const flat = now.kind === 'melting' || now.kind === 'boiling';
      if (flat) {
        const segment = segments(id)[now.segment];
        if (!segment) throw new Error('No segment');
        // The exact share, from the energy into the flat over its length.
        const exact = (100 * (now.energyCentijoules - segment.startCentijoules)) / (segment.endCentijoules - segment.startCentijoules);
        const expected = exact < 1 ? 'less than 1' : exact > 99 ? 'more than 99' : String(Math.floor(exact + 0.5 + 1e-9));
        expect(now.percentText, `${id} at ${energy} kJ (${exact})`).toBe(expected);
        expect(now.percent, `${id} at ${energy} kJ`).toBe(Math.floor(exact + 0.5 + 1e-9));
      } else {
        expect(now.percent, `${id} at ${energy} kJ`).toBeNull();
        expect(now.percentText, `${id} at ${energy} kJ`).toBeNull();
      }
    }
  });

  it('finds the temperature shown by rounding the exact temperature half up, derived independently', () => {
    for (const { id, energy } of everyState) {
      const now = state(id, energy);
      // The exact temperature in tenths, from joules and J/(mol·°C) as the brief gives them.
      const exactTenths = now.temperature * 10;
      expect(now.temperatureTenths, `${id} at ${energy} kJ`).toBe(Math.floor(exactTenths + 0.5 + 1e-9));
    }
  });

  it('has exactly one exact rounding tie, ethanol at 68.5 kJ', () => {
    const ties = everyState.filter(({ id, energy }) => {
      const now = state(id, energy);
      if (now.kind === 'melting' || now.kind === 'boiling') return false;
      const segment = segments(id)[now.segment];
      if (!segment) throw new Error('No segment');
      const c = SUBSTANCES[id].heatCapacityTenths[now.kind];
      // Tenths of a degree above the segment's start: (energy in) / c, a tie when 2 × energy is an odd multiple of c.
      const into = now.energyCentijoules - segment.startCentijoules;
      return (2 * into) % c === 0 && ((2 * into) / c) % 2 === 1;
    });
    expect(ties).toEqual([{ id: 'ethanol', energy: 68.5 }]);
  });

  it('puts no slider position on a boundary between segments except 0', () => {
    const boundaries = everyState.filter(({ id, energy }) =>
      segments(id).some((segment) => segment.endCentijoules === energy * CENTIJOULES_PER_KILOJOULE && energy < ENERGY.max),
    );
    expect(boundaries).toEqual([]);
  });

  it('always has 20 molecules in the box, in at most two phases, and both phases of a flat present on it', () => {
    for (const { id, energy } of everyState) {
      const { counts, kind } = state(id, energy);
      expect(counts.solid + counts.liquid + counts.gas).toBe(20);
      expect([counts.solid, counts.liquid, counts.gas].filter((count) => count > 0).length).toBeLessThanOrEqual(2);
      if (kind === 'melting') expect(counts.solid > 0 && counts.liquid > 0 && counts.gas === 0).toBe(true);
      if (kind === 'boiling') expect(counts.solid === 0 && counts.liquid > 0 && counts.gas > 0).toBe(true);
      if (kind === 'solid' || kind === 'liquid' || kind === 'gas') expect(counts[kind]).toBe(20);
    }
  });

  it('gives every state a readout that ends with the energy its segment takes', () => {
    for (const { id, energy } of everyState) {
      const now = state(id, energy);
      const sentence = readout(id, energy);
      const kJ = segmentEnergy(id, now.segment);
      const ending = now.kind === 'gas' ? `Up to the end of the slider, this segment takes ${kJ} kJ.` : `This segment takes ${kJ} kJ.`;
      expect(sentence.endsWith(ending), sentence).toBe(true);
      expect(sentence).toContain(`${shownTemperature(now.temperatureTenths)} °C`);
    }
  });
});

describe('shownTemperature, shownEnergy and energyText', () => {
  it.each([
    [-1500, '−150.0'],
    [-734, '−73.4'],
    [-5, '−0.5'],
    [0, '0.0'],
    [5, '0.5'],
    [516, '51.6'],
    [2486, '248.6'],
  ])('shows %s tenths as %s °C, with a true minus sign', (tenths, text) => {
    expect(shownTemperature(tenths)).toBe(text);
  });

  it('refuses a temperature that is not a whole number of tenths', () => {
    expect(() => shownTemperature(73.4)).toThrow(RangeError);
    expect(() => shownTemperature(Number.NaN)).toThrow(RangeError);
  });

  it('shows an energy with one decimal place, and speaks it with its unit', () => {
    expect(shownEnergy(0)).toBe('0.0');
    expect(shownEnergy(5)).toBe('5.0');
    expect(shownEnergy(67.5)).toBe('67.5');
    expect(energyText(12)).toBe('12.0 kJ');
    expect(() => shownEnergy(12.3)).toThrow(RangeError);
  });
});

describe('readout', () => {
  it('words a slope as the brief does: liquid ethanol at 12.0 kJ', () => {
    expect(readout('ethanol', 12)).toBe(
      'Liquid ethanol at −73.4 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 21.5 kJ.',
    );
  });

  it('words a flat as the brief does: ethanol melting at 5.0 kJ, the starting state', () => {
    expect(readout('ethanol', ENERGY.start)).toBe(
      'Ethanol melting at −114.1 °C: 50 percent is liquid. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 4.9 kJ.',
    );
  });

  it('words the solid at 0 kJ', () => {
    expect(readout('ethanol', 0)).toBe(
      'Solid ethanol at −150.0 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 2.5 kJ.',
    );
    expect(readout('iodine', 0)).toBe(
      'Solid iodine at 25.0 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 4.8 kJ.',
    );
  });

  it('words boiling with the percent that is gas', () => {
    expect(readout('ethanol', 40)).toBe(
      'Ethanol boiling at 78.3 °C: 29 percent is gas. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 38.6 kJ.',
    );
    expect(readout('iodine', 40)).toBe(
      'Iodine boiling at 184.4 °C: 34 percent is gas. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 41.6 kJ.',
    );
  });

  it('says less than 1 percent and more than 99 percent at the two ends of a flat', () => {
    expect(readout('ethanol', 29)).toBe(
      'Ethanol boiling at 78.3 °C: less than 1 percent is gas. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 38.6 kJ.',
    );
    expect(readout('ethanol', 67.5)).toBe(
      'Ethanol boiling at 78.3 °C: more than 99 percent is gas. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 38.6 kJ.',
    );
  });

  it('words iodine melting, and liquid iodine', () => {
    expect(readout('iodine', 12)).toBe(
      'Iodine melting at 113.7 °C: 46 percent is liquid. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 15.5 kJ.',
    );
    expect(readout('iodine', 23)).toBe(
      'Liquid iodine at 146.8 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 5.7 kJ.',
    );
  });

  it('words the gas, whose segment runs on past the end of the slider', () => {
    expect(readout('ethanol', 70)).toBe(
      'Ethanol gas at 110.0 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. Up to the end of the slider, this segment takes 2.4 kJ.',
    );
    expect(readout('iodine', 68)).toBe(
      'Iodine gas at 194.4 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. Up to the end of the slider, this segment takes 2.4 kJ.',
    );
  });

  it('throws for an energy the slider cannot reach', () => {
    expect(() => readout('ethanol', 12.3)).toThrow(RangeError);
  });
});

describe('describeGraph', () => {
  it('describes the whole curve and the marker, for ethanol at the start', () => {
    expect(describeGraph('ethanol', 5)).toBe(
      'Graph of temperature, from −150 to 250 °C, against energy added, from 0 to 70 kJ, for one mole of ethanol. ' +
        'The line rises from −150.0 °C at 0 kJ to the melting point, −114.1 °C, at 2.5 kJ; runs flat for 4.9 kJ while the solid melts; ' +
        'rises to the boiling point, 78.3 °C, at 29.0 kJ; runs flat for 38.6 kJ while the liquid boils; and rises to 110.0 °C at 70.0 kJ. ' +
        'Dashed lines mark the melting point and the boiling point. ' +
        'A marker at 5.0 kJ is on the melting flat, at −114.1 °C.',
    );
  });

  it("uses iodine's numbers, and names the slope the marker is on", () => {
    const text = describeGraph('iodine', 23);
    expect(text).toContain('for one mole of iodine.');
    expect(text).toContain('The line rises from 25.0 °C at 0 kJ to the melting point, 113.7 °C, at 4.8 kJ; runs flat for 15.5 kJ');
    expect(text).toContain('rises to the boiling point, 184.4 °C, at 26.0 kJ; runs flat for 41.6 kJ');
    expect(text).toContain('and rises to 248.6 °C at 70.0 kJ.');
    expect(text.endsWith('A marker at 23.0 kJ is on the slope of the liquid, at 146.8 °C.')).toBe(true);
    expect(describeGraph('iodine', 0).endsWith('A marker at 0.0 kJ is on the slope of the solid, at 25.0 °C.')).toBe(true);
    expect(describeGraph('iodine', 69).endsWith('is on the slope of the gas, at 221.5 °C.')).toBe(true);
    expect(describeGraph('iodine', 40).endsWith('A marker at 40.0 kJ is on the boiling flat, at 184.4 °C.')).toBe(true);
  });
});

describe('describeBox', () => {
  it('describes each kind of state', () => {
    expect(describeBox('ethanol', 0)).toBe('A box of 20 molecules of ethanol, in fixed rows: a solid.');
    expect(describeBox('ethanol', 5)).toBe(
      'A box of 20 molecules of ethanol: 10 still in the fixed rows of the solid, and 10 in the liquid, touching but out of order.',
    );
    expect(describeBox('ethanol', 12)).toBe('A box of 20 molecules of ethanol, touching but out of order: a liquid.');
    expect(describeBox('iodine', 40)).toBe(
      'A box of 20 molecules of iodine: 13 in the liquid, touching but out of order, and 7 far apart in the gas.',
    );
    expect(describeBox('iodine', 70)).toBe('A box of 20 molecules of iodine, far apart: a gas.');
  });

  it('says "1 molecule", not "1 molecules"', () => {
    expect(describeBox('ethanol', 29)).toBe(
      'A box of 20 molecules of ethanol: 19 in the liquid, touching but out of order, and 1 far apart in the gas.',
    );
    expect(describeBox('ethanol', 67.5)).toBe(
      'A box of 20 molecules of ethanol: 1 in the liquid, touching but out of order, and 19 far apart in the gas.',
    );
  });
});

describe('the box of molecules', () => {
  type Point = readonly [number, number];
  const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const R = BOX.radius;
  // Positions are written to a tenth of a unit, so a touch may be off by a few hundredths.
  const TOUCH = 0.3;

  it('is 192 by 120 units and holds 20 molecules of radius 7', () => {
    expect(BOX).toEqual({ width: 192, height: 120, radius: 7, count: 20 });
    expect(LAYOUT.solid).toHaveLength(20);
    expect(LAYOUT.liquid).toHaveLength(20);
    expect(LAYOUT.gas).toHaveLength(20);
  });

  it('keeps every molecule inside the box, clear of its frame', () => {
    for (const [phase, points] of Object.entries(LAYOUT)) {
      for (const [x, y] of points) {
        expect(x - R, `${phase} ${x} ${y}`).toBeGreaterThanOrEqual(4);
        expect(x + R, `${phase} ${x} ${y}`).toBeLessThanOrEqual(BOX.width - 4);
        expect(y - R, `${phase} ${x} ${y}`).toBeGreaterThanOrEqual(4);
        expect(y + R, `${phase} ${x} ${y}`).toBeLessThanOrEqual(BOX.height - 4);
      }
    }
  });

  it('puts the solid in fixed rows: five columns of four, each molecule touching its neighbors', () => {
    const xs = new Set(LAYOUT.solid.map(([x]) => x));
    const ys = new Set(LAYOUT.solid.map(([, y]) => y));
    expect(xs.size).toBe(5);
    expect(ys.size).toBe(4);
    for (const p of LAYOUT.solid) {
      const touching = LAYOUT.solid.filter((q) => q !== p && Math.abs(distance(p, q) - 2 * R) < 1e-9);
      expect(touching.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('puts the liquid in a cluster on the floor, every molecule touching another and none overlapping', () => {
    for (const p of LAYOUT.liquid) {
      const others = LAYOUT.liquid.filter((q) => q !== p);
      expect(Math.min(...others.map((q) => distance(p, q))), `${p}`).toBeGreaterThanOrEqual(2 * R - TOUCH);
      expect(Math.min(...others.map((q) => distance(p, q))), `${p} touches another`).toBeLessThanOrEqual(2 * R + TOUCH);
    }
    // Out of order: its molecules are not all in rows.
    expect(new Set(LAYOUT.liquid.map(([, y]) => y)).size).toBeGreaterThan(4);
  });

  it('spreads the gas: no two molecules closer than four radii', () => {
    for (const p of LAYOUT.gas) {
      for (const q of LAYOUT.gas) if (p !== q) expect(distance(p, q), `${p} and ${q}`).toBeGreaterThanOrEqual(4 * R - TOUCH);
    }
  });

  it('never overlaps the solid and the liquid while melting, at any split', () => {
    for (let liquid = 1; liquid < 20; liquid++) {
      const solids = LAYOUT.solid.slice(0, 20 - liquid);
      const liquids = LAYOUT.liquid.slice(0, liquid);
      for (const p of solids) for (const q of liquids) expect(distance(p, q), `${liquid} liquid`).toBeGreaterThanOrEqual(2 * R + 2);
    }
  });

  it('keeps each gas molecule well clear of the liquid while boiling, at any split', () => {
    for (let gas = 1; gas < 20; gas++) {
      const liquids = LAYOUT.liquid.slice(0, 20 - gas);
      const gases = LAYOUT.gas.slice(0, gas);
      for (const p of gases) for (const q of liquids) expect(distance(p, q), `${gas} gas`).toBeGreaterThanOrEqual(4 * R - TOUCH);
    }
  });

  it('places the molecules of a state from the layouts, in the counts of the state', () => {
    expect(particles('ethanol', 5)).toEqual([
      ...LAYOUT.solid.slice(0, 10).map(([x, y]) => ({ phase: 'solid', x, y })),
      ...LAYOUT.liquid.slice(0, 10).map(([x, y]) => ({ phase: 'liquid', x, y })),
    ]);
    expect(particles('iodine', 40)).toEqual([
      ...LAYOUT.liquid.slice(0, 13).map(([x, y]) => ({ phase: 'liquid', x, y })),
      ...LAYOUT.gas.slice(0, 7).map(([x, y]) => ({ phase: 'gas', x, y })),
    ]);
    for (const { id, energy } of everyState) {
      const drawn = particles(id, energy);
      const { counts } = state(id, energy);
      expect(drawn).toHaveLength(20);
      for (const phase of ['solid', 'liquid', 'gas'] as const) expect(drawn.filter((p) => p.phase === phase)).toHaveLength(counts[phase]);
    }
  });
});
