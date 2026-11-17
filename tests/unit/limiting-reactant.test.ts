import { describe, expect, it } from 'vitest';
import {
  ATOMS,
  BOXES,
  GRID,
  MOLECULES,
  RANGE,
  START,
  controlLabel,
  countText,
  describeBox,
  outcome,
  particles,
  readout,
  table,
  type Particle,
} from '../../src/lib/limiting-reactant';

// Written out, not computed: the amounts the sliders must reach, exactly.
const ALL_NO = [0, 2, 4, 6, 8, 10];
const ALL_F2 = [0, 1, 2, 3, 4, 5];

/** Every state the controls can reach: 6 amounts of NO times 6 of F₂. */
const everyState = ALL_NO.flatMap((no) => ALL_F2.map((f2) => ({ no, f2 })));

const count = (list: readonly Particle[], kind: Particle) => list.filter((particle) => particle === kind).length;

describe('the ranges and the starting state', () => {
  it('has NO from 0 to 10 in twos and F₂ from 0 to 5 in ones', () => {
    expect(RANGE).toEqual({ no: { min: 0, max: 10, step: 2 }, f2: { min: 0, max: 5, step: 1 } });
  });

  it('starts at 6 NO and 2 F₂', () => {
    expect(START).toEqual({ no: 6, f2: 2 });
  });

  it('has a grid of five columns and three rows', () => {
    expect(GRID).toEqual({ columns: 5, rows: 3 });
  });
});

describe('the words the diagram shows', () => {
  it('names the two boxes, Before then After', () => {
    expect(BOXES).toEqual([
      { name: 'before', title: 'Before' },
      { name: 'after', title: 'After' },
    ]);
  });

  it('names the three atoms of the key', () => {
    expect(ATOMS).toEqual([
      { element: 'N', name: 'nitrogen' },
      { element: 'O', name: 'oxygen' },
      { element: 'F', name: 'fluorine' },
    ]);
  });

  it('names the three molecules of the key, with F₂ told from the atom F in words', () => {
    expect(MOLECULES).toEqual([
      { kind: 'NO', formula: 'NO', name: 'nitrogen monoxide' },
      { kind: 'F2', formula: 'F₂', name: 'fluorine molecule' },
      { kind: 'NOF', formula: 'NOF', name: 'nitrosyl fluoride' },
    ]);
  });

  it('labels the two sliders', () => {
    expect(controlLabel('no')).toBe('Nitrogen monoxide, NO');
    expect(controlLabel('f2')).toBe('Fluorine, F₂');
  });
});

describe('outcome', () => {
  it.each([
    { no: 6, f2: 2, events: 2, nof: 4, noLeft: 2, f2Left: 0, limiting: 'f2' },
    { no: 4, f2: 5, events: 2, nof: 4, noLeft: 0, f2Left: 3, limiting: 'no' },
    { no: 6, f2: 3, events: 3, nof: 6, noLeft: 0, f2Left: 0, limiting: 'neither' },
    { no: 10, f2: 5, events: 5, nof: 10, noLeft: 0, f2Left: 0, limiting: 'neither' },
    { no: 10, f2: 1, events: 1, nof: 2, noLeft: 8, f2Left: 0, limiting: 'f2' },
    { no: 2, f2: 5, events: 1, nof: 2, noLeft: 0, f2Left: 4, limiting: 'no' },
    { no: 0, f2: 3, events: 0, nof: 0, noLeft: 0, f2Left: 3, limiting: 'none' },
    { no: 4, f2: 0, events: 0, nof: 0, noLeft: 4, f2Left: 0, limiting: 'none' },
    { no: 0, f2: 0, events: 0, nof: 0, noLeft: 0, f2Left: 0, limiting: 'none' },
  ] as const)('gives the right result for $no NO and $f2 F₂', ({ no, f2, ...expected }) => {
    expect(outcome(no, f2)).toEqual(expected);
  });

  it.each([
    ['5 NO, which is off its step of 2', 5, 2],
    ['12 NO, which is above 10', 12, 2],
    ['6 F₂, which is above 5', 6, 6],
    ['1.5 F₂, which is off its step of 1', 6, 1.5],
    ['a negative amount of NO', -2, 2],
    ['a negative amount of F₂', 6, -1],
    ['NaN NO', Number.NaN, 2],
    ['NaN F₂', 6, Number.NaN],
    ['an infinite amount of F₂', 6, Number.POSITIVE_INFINITY],
  ])('throws for %s', (_what, no, f2) => {
    expect(() => outcome(no, f2)).toThrow(RangeError);
  });

  it('names the value and the range in its message', () => {
    expect(() => outcome(5, 2)).toThrow(/NO.*0 to 10.*steps of 2.*not 5/);
    expect(() => outcome(6, 1.5)).toThrow(/F₂.*0 to 5.*steps of 1.*not 1\.5/);
  });
});

describe('over every state the controls reach', () => {
  it('covers 36 states', () => {
    expect(everyState).toHaveLength(36);
  });

  it('conserves nitrogen and oxygen atoms between the boxes', () => {
    for (const { no, f2 } of everyState) {
      const { nof, noLeft } = outcome(no, f2);
      expect(no, `${no} NO and ${f2} F₂`).toBe(nof + noLeft);
    }
  });

  it('conserves fluorine atoms between the boxes', () => {
    for (const { no, f2 } of everyState) {
      const { nof, f2Left } = outcome(no, f2);
      expect(2 * f2, `${no} NO and ${f2} F₂`).toBe(nof + 2 * f2Left);
    }
  });

  it('never raises the number of particles', () => {
    for (const { no, f2 } of everyState) {
      const { before, after } = particles(no, f2);
      expect(after.length, `${no} NO and ${f2} F₂`).toBeLessThanOrEqual(before.length);
    }
  });

  it('leaves at most one reactant over', () => {
    for (const { no, f2 } of everyState) {
      const { noLeft, f2Left } = outcome(no, f2);
      expect(noLeft > 0 && f2Left > 0, `${no} NO and ${f2} F₂`).toBe(false);
    }
  });

  it('never puts more than 15 particles in a box, the size of the grid', () => {
    for (const { no, f2 } of everyState) {
      const { before, after } = particles(no, f2);
      expect(before.length, `before: ${no} NO and ${f2} F₂`).toBeLessThanOrEqual(GRID.columns * GRID.rows);
      expect(after.length, `after: ${no} NO and ${f2} F₂`).toBeLessThanOrEqual(GRID.columns * GRID.rows);
    }
  });

  it('calls F₂ limiting exactly when F₂ is short of half the NO and both are present', () => {
    for (const { no, f2 } of everyState) {
      const expected = f2 < no / 2 && no > 0 && f2 > 0;
      expect(outcome(no, f2).limiting === 'f2', `${no} NO and ${f2} F₂`).toBe(expected);
    }
  });

  it('calls NO limiting exactly when NO is short of twice the F₂ and both are present', () => {
    for (const { no, f2 } of everyState) {
      const expected = no < 2 * f2 && no > 0 && f2 > 0;
      expect(outcome(no, f2).limiting === 'no', `${no} NO and ${f2} F₂`).toBe(expected);
    }
  });

  it('draws as many particles of each kind as the table says', () => {
    for (const { no, f2 } of everyState) {
      const { before, after } = particles(no, f2);
      const { nof, noLeft, f2Left } = outcome(no, f2);
      expect([count(before, 'NO'), count(before, 'F2'), count(before, 'NOF')], `before: ${no}, ${f2}`).toEqual([no, f2, 0]);
      expect([count(after, 'NO'), count(after, 'F2'), count(after, 'NOF')], `after: ${no}, ${f2}`).toEqual([noLeft, f2Left, nof]);
    }
  });

  it('gives every state a readout that opens with its own amounts, or says nothing was put in', () => {
    for (const { no, f2 } of everyState) {
      const sentence = readout(no, f2);
      if (no === 0 && f2 === 0) expect(sentence).toBe('Nothing has been put in.');
      else expect(sentence.startsWith(`${no} NO and ${f2} F₂: `), sentence).toBe(true);
    }
  });
});

describe('table', () => {
  it('has Before, Change and After rows for 6 NO and 2 F₂', () => {
    expect(table(6, 2)).toEqual([
      { name: 'Before', no: '6', f2: '2', nof: '0' },
      { name: 'Change', no: '−4', f2: '−2', nof: '+4' },
      { name: 'After', no: '2', f2: '0', nof: '4' },
    ]);
  });

  it('writes 0 as 0, with no sign, when nothing reacts', () => {
    expect(table(0, 3)).toEqual([
      { name: 'Before', no: '0', f2: '3', nof: '0' },
      { name: 'Change', no: '0', f2: '0', nof: '0' },
      { name: 'After', no: '0', f2: '3', nof: '0' },
    ]);
  });

  it('uses a true minus sign, not a hyphen', () => {
    const change = table(10, 5)[1];
    expect(change?.no).toBe('−10');
    expect(change?.no).not.toContain('-');
  });

  it('throws for an amount outside the ranges', () => {
    expect(() => table(5, 2)).toThrow(RangeError);
  });
});

describe('particles', () => {
  it('draws 6 NO then 2 F₂ before, and 4 NOF then 2 NO after, for 6 NO and 2 F₂', () => {
    expect(particles(6, 2)).toEqual({
      before: ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'F2', 'F2'],
      after: ['NOF', 'NOF', 'NOF', 'NOF', 'NO', 'NO'],
    });
  });

  it('draws 4 NOF then 3 F₂ after, for 4 NO and 5 F₂', () => {
    expect(particles(4, 5).after).toEqual(['NOF', 'NOF', 'NOF', 'NOF', 'F2', 'F2', 'F2']);
  });

  it('draws nothing for an empty flask', () => {
    expect(particles(0, 0)).toEqual({ before: [], after: [] });
  });

  it('fills a box exactly at its largest, 10 NO and 5 F₂ before', () => {
    expect(particles(10, 5).before).toHaveLength(15);
  });

  it('throws for an amount outside the ranges', () => {
    expect(() => particles(6, 6)).toThrow(RangeError);
  });
});

describe('readout', () => {
  it('says fluorine is limiting for 6 NO and 2 F₂', () => {
    expect(readout(6, 2)).toBe(
      '6 NO and 2 F₂: fluorine is the limiting reactant. 2 F₂ can react with only 4 NO, so 4 NOF form and 2 NO are left over.',
    );
  });

  it('says nitrogen monoxide is limiting for 4 NO and 5 F₂', () => {
    expect(readout(4, 5)).toBe(
      '4 NO and 5 F₂: nitrogen monoxide is the limiting reactant. 4 NO can react with only 2 F₂, so 4 NOF form and 3 F₂ are left over.',
    );
  });

  it('says neither is left over for 6 NO and 3 F₂', () => {
    expect(readout(6, 3)).toBe(
      '6 NO and 3 F₂: neither is left over. They are in the ratio of the equation, 2 to 1, so 6 NOF form.',
    );
  });

  it('says there is nothing for the fluorine to react with when there is no NO', () => {
    expect(readout(0, 3)).toBe(
      '0 NO and 3 F₂: with no nitrogen monoxide there is nothing for the fluorine to react with.',
    );
  });

  it('says there is nothing for the NO to react with when there is no F₂', () => {
    expect(readout(4, 0)).toBe(
      '4 NO and 0 F₂: with no fluorine there is nothing for the nitrogen monoxide to react with.',
    );
  });

  it('says nothing has been put in when both are absent', () => {
    expect(readout(0, 0)).toBe('Nothing has been put in.');
  });

  it('says "is left over" for one molecule', () => {
    expect(readout(2, 2)).toBe(
      '2 NO and 2 F₂: nitrogen monoxide is the limiting reactant. 2 NO can react with only 1 F₂, so 2 NOF form and 1 F₂ is left over.',
    );
  });

  it('says "are left over" for eight molecules, with one F₂ reacting', () => {
    expect(readout(10, 1)).toBe(
      '10 NO and 1 F₂: fluorine is the limiting reactant. 1 F₂ can react with only 2 NO, so 2 NOF form and 8 NO are left over.',
    );
  });

  it('throws for an amount outside the ranges', () => {
    expect(() => readout(12, 2)).toThrow(RangeError);
  });
});

describe('countText', () => {
  it('writes the count with its molecule name, for a slider', () => {
    expect(countText('no', 6)).toBe('6 NO molecules');
    expect(countText('f2', 2)).toBe('2 F₂ molecules');
  });

  it('writes one molecule in the singular and none in the plural', () => {
    expect(countText('f2', 1)).toBe('1 F₂ molecule');
    expect(countText('f2', 0)).toBe('0 F₂ molecules');
  });
});

describe('describeBox', () => {
  it('names the box and counts each kind of particle in the starting state', () => {
    expect(describeBox('before', 6, 2)).toBe(
      'The Before box holds 6 NO molecules and 2 F₂ molecules.',
    );
    expect(describeBox('after', 6, 2)).toBe(
      'The After box holds 4 NOF molecules and 2 NO molecules.',
    );
  });

  it('says a box is empty when it holds nothing', () => {
    expect(describeBox('before', 0, 0)).toBe('The Before box is empty.');
    expect(describeBox('after', 0, 0)).toBe('The After box is empty.');
  });

  it('leaves out a kind that is absent', () => {
    expect(describeBox('after', 6, 3)).toBe(
      'The After box holds 6 NOF molecules.',
    );
  });
});
