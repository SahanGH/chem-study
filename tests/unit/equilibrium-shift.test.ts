import { describe, expect, it } from 'vitest';
import {
  AXES,
  DISTURBANCES,
  K_START,
  START,
  STARTING_ID,
  describeGraph,
  direction,
  disturbanceFor,
  formatConcentration,
  formatConstant,
  justAfter,
  newEquilibrium,
  pathPoints,
  reactionQuotient,
  readout,
  shiftTable,
  stepAt,
  type DisturbanceId,
} from '../../src/lib/equilibrium-shift';

const IDS: DisturbanceId[] = ['add-no2', 'add-n2o4', 'halve-volume', 'double-volume', 'warm'];
const TOLERANCE = 1e-9;

// Written out apart from the module, from the plan's table (scratchpad/unit7/explorer-values.py, exact fractions).
const VALUES = [
  { id: 'add-no2', after: [0.0625, 0.265], k: 0.49, q: '1.12', fresh: [0.09, 0.21], direction: 'toward-n2o4' },
  { id: 'add-n2o4', after: [0.1075, 0.175], k: 0.49, q: '0.285', fresh: [0.09, 0.21], direction: 'toward-no2' },
  { id: 'halve-volume', after: [0.125, 0.35], k: 0.49, q: '0.980', fresh: [0.16, 0.28], direction: 'toward-n2o4' },
  { id: 'double-volume', after: [0.03125, 0.0875], k: 0.49, q: '0.245', fresh: [0.0225, 0.105], direction: 'toward-no2' },
  { id: 'warm', after: [0.0625, 0.175], k: 0.867, q: '0.490', fresh: [0.048, 0.204], direction: 'toward-no2' },
] as const;

function expectWithin(actual: number, expected: number, tolerance: number, what = '') {
  expect(Math.abs(actual - expected), `${what} ${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

const nitrogen = (c: { n2o4: number; no2: number }) => 2 * c.n2o4 + c.no2;

describe('the choices and the ranges', () => {
  it('offers five disturbances in order, each with a label for its radio button', () => {
    expect(DISTURBANCES.map((d) => d.id)).toEqual(IDS);
    expect(DISTURBANCES.map((d) => d.label)).toEqual([
      'Add NO₂',
      'Add N₂O₄',
      'Halve the volume',
      'Double the volume',
      'Warm the mixture',
    ]);
  });

  it('names what was done on the dotted line', () => {
    expect(DISTURBANCES.map((d) => d.mark)).toEqual(['NO₂ added', 'N₂O₄ added', 'volume halved', 'volume doubled', 'warmed']);
  });

  it('starts with adding NO₂, lesson 7.10 first worked example', () => {
    expect(STARTING_ID).toBe('add-no2');
  });

  it('starts at equilibrium at K = 0.490, with [N₂O₄] = 0.0625 M and [NO₂] = 0.175 M', () => {
    expect(K_START).toBe(0.49);
    expect(START).toEqual({ n2o4: 0.0625, no2: 0.175 });
    expectWithin(reactionQuotient(START), K_START, TOLERANCE);
  });

  it('runs the concentration axis to 0.40 M and the time axis from 0 to 8, with the disturbance at 2', () => {
    expect(AXES).toEqual({ concentration: { max: 0.4 }, time: { max: 8, disturbance: 2 } });
  });
});

describe('disturbanceFor', () => {
  it('finds a disturbance by its id', () => {
    expect(disturbanceFor('warm').label).toBe('Warm the mixture');
  });

  it('rejects an id it does not offer, naming it and listing the ids', () => {
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => disturbanceFor('cool')).toThrow(
      'The disturbance must be add-no2, add-n2o4, halve-volume, double-volume or warm, not "cool".',
    );
  });
});

describe('justAfter', () => {
  it.each(VALUES)('$id: the concentrations and K right after', ({ id, after, k }) => {
    const result = justAfter(id);

    expectWithin(result.n2o4, after[0], TOLERANCE, '[N₂O₄]');
    expectWithin(result.no2, after[1], TOLERANCE, '[NO₂]');
    expect(result.k).toBe(k);
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => justAfter('cool')).toThrow('not "cool"');
  });
});

describe('newEquilibrium', () => {
  it.each(VALUES)('$id: the new equilibrium, to 1e-9, at the K that applies', ({ id, fresh, k }) => {
    const result = newEquilibrium(id);

    expectWithin(result.n2o4, fresh[0], TOLERANCE, '[N₂O₄]');
    expectWithin(result.no2, fresh[1], TOLERANCE, '[NO₂]');
    expect(result.k).toBe(k);
  });

  it('keeps the nitrogen atoms: 2[N₂O₄] + [NO₂] is the same just after and at the new equilibrium', () => {
    for (const id of IDS) {
      expectWithin(nitrogen(newEquilibrium(id)), nitrogen(justAfter(id)), TOLERANCE, id);
    }
  });

  it('changes the nitrogen per liter only when the volume changes: 0.300 M, doubled to 0.600 M, halved to 0.150 M', () => {
    expectWithin(nitrogen(START), 0.3, TOLERANCE);
    expectWithin(nitrogen(justAfter('halve-volume')), 0.6, TOLERANCE);
    expectWithin(nitrogen(justAfter('double-volume')), 0.15, TOLERANCE);
    expectWithin(nitrogen(justAfter('warm')), 0.3, TOLERANCE);
  });

  it('has Q equal to the K that applies, to the shown concentrations, in all five cases', () => {
    for (const id of IDS) {
      const { k } = newEquilibrium(id);
      const q = reactionQuotient(newEquilibrium(id));

      expect(formatConstant(q), id).toBe(formatConstant(k));
      expectWithin(q, k, TOLERANCE * 10, id);
    }
  });

  it('undoes only part of the change: after adding NO₂ the new [NO₂] is above its start and below just-after', () => {
    const fresh = newEquilibrium('add-no2').no2;

    expect(fresh).toBeGreaterThan(START.no2);
    expect(fresh).toBeLessThan(justAfter('add-no2').no2);
  });

  it('undoes only part of the change in the other three cases too', () => {
    // The new value lies strictly between the starting value and the value just after.
    const isBetween = (fresh: number, start: number, after: number) => (fresh - start) * (after - fresh) > 0;

    expect(isBetween(newEquilibrium('add-n2o4').n2o4, START.n2o4, justAfter('add-n2o4').n2o4)).toBe(true);
    expect(isBetween(newEquilibrium('halve-volume').no2, START.no2, justAfter('halve-volume').no2)).toBe(true);
    expect(isBetween(newEquilibrium('double-volume').no2, START.no2, justAfter('double-volume').no2)).toBe(true);
  });

  it('ends adding NO₂ and adding N₂O₄ at the same mixture, with the same nitrogen per liter', () => {
    const a = newEquilibrium('add-no2');
    const b = newEquilibrium('add-n2o4');

    expectWithin(a.n2o4, b.n2o4, TOLERANCE);
    expectWithin(a.no2, b.no2, TOLERANCE);
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => newEquilibrium('cool')).toThrow('not "cool"');
  });
});

describe('reactionQuotient', () => {
  it('is [NO₂]² over [N₂O₄]', () => {
    expectWithin(reactionQuotient({ n2o4: 0.0625, no2: 0.265 }), 1.1236, 1e-9);
    expectWithin(reactionQuotient({ n2o4: 0.1075, no2: 0.175 }), 0.284884, 1e-6);
    expectWithin(reactionQuotient({ n2o4: 0.5, no2: 1 }), 2, 1e-12);
  });

  it('refuses a zero, negative or non-finite [N₂O₄], naming it', () => {
    for (const n2o4 of [0, -0.1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => reactionQuotient({ n2o4, no2: 0.1 }), String(n2o4)).toThrow(RangeError);
    }
    expect(() => reactionQuotient({ n2o4: 0, no2: 0.1 })).toThrow('[N₂O₄] must be a number above zero, not 0 M');
  });
});

describe('formatConcentration', () => {
  it.each([
    [0.0625, '0.0625'],
    [0.175, '0.175'],
    [0.09, '0.0900'],
    [0.21, '0.210'],
    [0.265, '0.265'],
    [0.35, '0.350'],
    [0.0875, '0.0875'],
    [0.0225, '0.0225'],
    [0.048, '0.0480'],
    [0.204, '0.204'],
    [0.125, '0.125'],
    [0.16, '0.160'],
  ])('writes %d as %s, with three significant figures', (value, expected) => {
    expect(formatConcentration(value)).toBe(expected);
  });

  it.each([
    [0.1075, '0.1075'],
    [0.03125, '0.03125'],
  ])('writes %d as %s, with four, because the exact value needs them', (value, expected) => {
    expect(formatConcentration(value)).toBe(expected);
  });

  it('ignores floating-point noise: 0.0625 + 0.045 is written 0.1075, and 0.1 + 0.2 as 0.300', () => {
    expect(formatConcentration(0.0625 + 0.045)).toBe('0.1075');
    expect(formatConcentration(0.1 + 0.2)).toBe('0.300');
  });

  it('writes zero as 0.00', () => {
    expect(formatConcentration(0)).toBe('0.00');
  });

  it('refuses a value that would need more than four significant figures, naming it', () => {
    expect(() => formatConcentration(0.12345)).toThrow(
      'The concentration 0.12345 M needs more than four significant figures, so it cannot be shown exactly.',
    );
    expect(() => formatConcentration(1 / 3)).toThrow(RangeError);
  });

  it('refuses a value that is negative or not a finite number, naming it', () => {
    for (const value of [-0.1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => formatConcentration(value), String(value)).toThrow(RangeError);
    }
    expect(() => formatConcentration(-0.1)).toThrow('The concentration must be a finite number, zero or more, not -0.1 M.');
    expect(() => formatConcentration(Number.NaN)).toThrow('not NaN M');
  });
});

describe('formatConstant', () => {
  it.each([
    [0.49, '0.490'],
    [1.1236, '1.12'],
    [0.284884, '0.285'],
    [0.98, '0.980'],
    [0.245, '0.245'],
    [0.867, '0.867'],
  ])('writes %d as %s, with three significant figures', (value, expected) => {
    expect(formatConstant(value)).toBe(expected);
  });

  it('refuses a value that is negative or not a finite number, naming it', () => {
    for (const value of [-1, Number.NaN, Number.NEGATIVE_INFINITY]) {
      expect(() => formatConstant(value), String(value)).toThrow(RangeError);
    }
    expect(() => formatConstant(-1)).toThrow('The constant or quotient must be a finite number, zero or more, not -1.');
  });
});

describe('direction', () => {
  it.each(VALUES)('$id: $direction', ({ id, direction: expected }) => {
    expect(direction(id)).toBe(expected);
  });

  it('runs toward N₂O₄ exactly when Q just after is greater than K', () => {
    for (const id of IDS) {
      const after = justAfter(id);
      const expected = reactionQuotient(after) > after.k ? 'toward-n2o4' : 'toward-no2';

      expect(direction(id), id).toBe(expected);
    }
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => direction('cool')).toThrow('not "cool"');
  });
});

describe('pathPoints', () => {
  it('runs from 0 to 8 in steps of 0.05, with two points at 2, the step', () => {
    const points = pathPoints('add-no2');

    expect(points).toHaveLength(162);
    expect(points[0]?.time).toBe(0);
    expect(points.at(-1)?.time).toBe(8);
    expect(points.filter((p) => p.time === 2)).toHaveLength(2);
    expect(points.map((p) => p.time)).toEqual([...points.map((p) => p.time)].sort((a, b) => a - b));
  });

  it('is flat at the starting equilibrium until 2', () => {
    for (const id of IDS) {
      for (const point of pathPoints(id).filter((p) => p.time <= 2).slice(0, -1)) {
        expect(point, id).toEqual({ time: point.time, ...START });
      }
    }
  });

  it('jumps straight up or down at 2, from the starting values to the values just after', () => {
    for (const id of IDS) {
      const atTwo = pathPoints(id).filter((p) => p.time === 2);
      const after = justAfter(id);

      expect(atTwo[0], id).toEqual({ time: 2, ...START });
      expect(atTwo[1]?.time, id).toBe(2);
      expectWithin(atTwo[1]?.n2o4 ?? Number.NaN, after.n2o4, TOLERANCE, `${id} [N₂O₄]`);
      expectWithin(atTwo[1]?.no2 ?? Number.NaN, after.no2, TOLERANCE, `${id} [NO₂]`);
    }
  });

  it('follows c_new + (c_after − c_new)e^(−(t − 2)) after the disturbance, to the same factor for both', () => {
    const after = justAfter('add-no2');
    const fresh = newEquilibrium('add-no2');
    const point = pathPoints('add-no2').find((p) => p.time === 3);
    const factor = Math.exp(-1);

    expectWithin(point?.n2o4 ?? Number.NaN, fresh.n2o4 + (after.n2o4 - fresh.n2o4) * factor, 1e-12);
    expectWithin(point?.no2 ?? Number.NaN, fresh.no2 + (after.no2 - fresh.no2) * factor, 1e-12);
  });

  it('keeps 2[N₂O₄] + [NO₂] constant after the disturbance, so the nitrogen atoms are conserved', () => {
    for (const id of IDS) {
      const total = nitrogen(justAfter(id));

      for (const point of pathPoints(id).filter((p) => p.time >= 2).slice(1)) {
        expectWithin(nitrogen(point), total, 1e-12, `${id} at ${point.time}`);
      }
    }
  });

  it('ends within 0.0003 M of the new equilibrium, at 8', () => {
    for (const id of IDS) {
      const last = pathPoints(id).at(-1);
      const fresh = newEquilibrium(id);

      expectWithin(last?.n2o4 ?? Number.NaN, fresh.n2o4, 3e-4, `${id} [N₂O₄]`);
      expectWithin(last?.no2 ?? Number.NaN, fresh.no2, 3e-4, `${id} [NO₂]`);
    }
  });

  it('stays on the axis, from 0 to 0.40 M, in every case', () => {
    for (const id of IDS) {
      for (const point of pathPoints(id)) {
        for (const value of [point.n2o4, point.no2]) {
          expect(value, id).toBeGreaterThanOrEqual(0);
          expect(value, id).toBeLessThanOrEqual(AXES.concentration.max);
        }
      }
    }
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => pathPoints('cool')).toThrow('not "cool"');
  });
});

describe('stepAt', () => {
  it('gives the step of the path that a time falls on: 2 of 8, in 160 steps, is step 40', () => {
    expect(stepAt(2, 8, 160)).toBe(40);
    expect(stepAt(0, 8, 160)).toBe(0);
    expect(stepAt(8, 8, 160)).toBe(160);
  });

  it('refuses a time that falls between two steps, so the vertical step cannot be dropped in silence', () => {
    // 2.0625 is exact in binary, so the step it falls on, 41.25, is written without noise.
    expect(() => stepAt(2.0625, 8, 160)).toThrow(
      'The disturbance at 2.0625 must fall exactly on a step of the path (160 steps across 8), but it falls on step 41.25.',
    );
    expect(() => stepAt(Number.NaN, 8, 160)).toThrow(RangeError);
  });
});

describe('shiftTable', () => {
  const COLUMNS = ['Before', 'Just after', 'New equilibrium'];
  const NAMES = ['[N₂O₄]', '[NO₂]', 'Q', 'K', 'Compare'];

  it('has the same label column and three columns in every case, with a caption that gives the unit', () => {
    for (const id of IDS) {
      const table = shiftTable(id);

      expect(table.caption, id).toBe('Before and after the disturbance. Concentrations in M.');
      expect(table.columns, id).toEqual(COLUMNS);
      expect(
        table.rows.map((row) => row.name),
        id,
      ).toEqual(NAMES);
      for (const row of table.rows) expect(row.cells, `${id} ${row.name}`).toHaveLength(3);
    }
  });

  it.each([
    ['add-no2', [['0.0625', '0.0625', '0.0900'], ['0.175', '0.265', '0.210'], ['0.490', '1.12', '0.490'], ['0.490', '0.490', '0.490'], ['Q = K', 'Q > K', 'Q = K']]],
    ['add-n2o4', [['0.0625', '0.1075', '0.0900'], ['0.175', '0.175', '0.210'], ['0.490', '0.285', '0.490'], ['0.490', '0.490', '0.490'], ['Q = K', 'Q < K', 'Q = K']]],
    ['halve-volume', [['0.0625', '0.125', '0.160'], ['0.175', '0.350', '0.280'], ['0.490', '0.980', '0.490'], ['0.490', '0.490', '0.490'], ['Q = K', 'Q > K', 'Q = K']]],
    ['double-volume', [['0.0625', '0.03125', '0.0225'], ['0.175', '0.0875', '0.105'], ['0.490', '0.245', '0.490'], ['0.490', '0.490', '0.490'], ['Q = K', 'Q < K', 'Q = K']]],
    ['warm', [['0.0625', '0.0625', '0.0480'], ['0.175', '0.175', '0.204'], ['0.490', '0.490', '0.867'], ['0.490', '0.867', '0.867'], ['Q = K', 'Q < K', 'Q = K']]],
  ] as const)('%s: every cell', (id, cells) => {
    expect(shiftTable(id).rows.map((row) => row.cells)).toEqual(cells);
  });

  it('shows a Q that equals Q computed from the concentrations shown, in every cell of every case', () => {
    for (const id of IDS) {
      const [n2o4, no2, q] = shiftTable(id).rows;

      for (let column = 0; column < 3; column++) {
        const shown = reactionQuotient({ n2o4: Number(n2o4?.cells[column]), no2: Number(no2?.cells[column]) });

        expect(q?.cells[column], `${id}, column ${column}`).toBe(formatConstant(shown));
      }
    }
  });

  it('shows, at the new equilibrium, a Q equal to the K that applies, in all five cases', () => {
    for (const id of IDS) {
      const [, , q, k, compare] = shiftTable(id).rows;

      expect(q?.cells[2], id).toBe(k?.cells[2]);
      expect(compare?.cells[2], id).toBe('Q = K');
    }
  });

  it('compares the shown Q with the shown K, in every cell', () => {
    for (const id of IDS) {
      const [, , q, k, compare] = shiftTable(id).rows;

      for (let column = 0; column < 3; column++) {
        const qShown = Number(q?.cells[column]);
        const kShown = Number(k?.cells[column]);
        const expected = qShown === kShown ? 'Q = K' : qShown > kShown ? 'Q > K' : 'Q < K';

        expect(compare?.cells[column], `${id}, column ${column}`).toBe(expected);
      }
    }
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => shiftTable('cool')).toThrow('not "cool"');
  });
});

describe('readout', () => {
  it.each([
    [
      'add-no2',
      'Adding NO₂ raises Q from 0.490 to 1.12. Q is now greater than K (0.490), so the reaction runs toward N₂O₄ until Q equals K again. New equilibrium: [N₂O₄] = 0.0900 M and [NO₂] = 0.210 M.',
    ],
    [
      'add-n2o4',
      'Adding N₂O₄ lowers Q from 0.490 to 0.285. Q is now less than K (0.490), so the reaction runs toward NO₂ until Q equals K again. New equilibrium: [N₂O₄] = 0.0900 M and [NO₂] = 0.210 M.',
    ],
    [
      'halve-volume',
      'Halving the volume doubles both concentrations, which raises Q from 0.490 to 0.980. Q is now greater than K (0.490), so the reaction runs toward N₂O₄ until Q equals K again. New equilibrium: [N₂O₄] = 0.160 M and [NO₂] = 0.280 M.',
    ],
    [
      'double-volume',
      'Doubling the volume halves both concentrations, which lowers Q from 0.490 to 0.245. Q is now less than K (0.490), so the reaction runs toward NO₂ until Q equals K again. New equilibrium: [N₂O₄] = 0.0225 M and [NO₂] = 0.105 M.',
    ],
    [
      'warm',
      'Warming the mixture changes K, from 0.490 to 0.867. Q is still 0.490, now less than K, so the reaction runs toward NO₂ until Q equals the new K. New equilibrium: [N₂O₄] = 0.0480 M and [NO₂] = 0.204 M.',
    ],
  ] as const)('%s: the sentences, word for word', (id, expected) => {
    expect(readout(id)).toBe(expected);
  });

  it('agrees with the direction and the table in every case', () => {
    for (const id of IDS) {
      const text = readout(id);
      const target = direction(id) === 'toward-n2o4' ? 'toward N₂O₄' : 'toward NO₂';
      const [n2o4, no2] = shiftTable(id).rows;

      expect(text, id).toContain(`the reaction runs ${target} until`);
      expect(text, id).toContain(`[N₂O₄] = ${n2o4?.cells[2]} M and [NO₂] = ${no2?.cells[2]} M.`);
    }
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => readout('cool')).toThrow('not "cool"');
  });
});

describe('describeGraph', () => {
  it('says what the graph shows, for the starting state', () => {
    expect(describeGraph('add-no2')).toBe(
      'Graph of concentration against time for N₂O₄(g) ⇌ 2 NO₂(g). [N₂O₄] is a solid line and [NO₂] a dashed line. ' +
        'Before the disturbance, [N₂O₄] is 0.0625 M and [NO₂] is 0.175 M. ' +
        'The dotted line marks the disturbance (NO₂ added). Just after it, [N₂O₄] is 0.0625 M and [NO₂] is 0.265 M. ' +
        'At the new equilibrium, [N₂O₄] is 0.0900 M and [NO₂] is 0.210 M.',
    );
  });

  it('follows the choice', () => {
    const text = describeGraph('warm');

    expect(text).toContain('(warmed)');
    expect(text).toContain('At the new equilibrium, [N₂O₄] is 0.0480 M and [NO₂] is 0.204 M.');
  });

  it('rejects an unknown id', () => {
    // @ts-expect-error: as above.
    expect(() => describeGraph('cool')).toThrow('not "cool"');
  });
});
