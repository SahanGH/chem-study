import { describe, expect, it } from 'vitest';
import {
  BOND_LENGTH,
  MARGIN,
  bondLineOffsets,
  chargeText,
  chooseLonePairSides,
  formalCharges,
  layoutLewis,
  symbolHalfHeight,
  symbolHalfWidth,
  valenceElectrons,
  type LewisInput,
} from '../../src/lib/lewis';

// Molecules drawn the way a lesson would write them. Grid units: 1 = one bond
// length, y grows downward.
const WATER: LewisInput = {
  alt: 'Lewis diagram of water: two O–H single bonds and two lone pairs on oxygen.',
  atoms: [
    { id: 'O', symbol: 'O', x: 0, y: 0, lonePairs: 2 },
    { id: 'H1', symbol: 'H', x: -1, y: 0 },
    { id: 'H2', symbol: 'H', x: 1, y: 0 },
  ],
  bonds: [
    ['O', 'H1', 1],
    ['O', 'H2', 1],
  ],
};

const CO2: LewisInput = {
  alt: 'Lewis diagram of carbon dioxide',
  atoms: [
    { id: 'C', symbol: 'C', x: 0, y: 0 },
    { id: 'O1', symbol: 'O', x: -1, y: 0, lonePairs: 2 },
    { id: 'O2', symbol: 'O', x: 1, y: 0, lonePairs: 2 },
  ],
  bonds: [
    ['C', 'O1', 2],
    ['C', 'O2', 2],
  ],
};

const OZONE: LewisInput = {
  alt: 'Lewis diagram of ozone',
  atoms: [
    { id: 'Oc', symbol: 'O', x: 0, y: 0, lonePairs: 1 },
    { id: 'Od', symbol: 'O', x: -1, y: 0, lonePairs: 2 },
    { id: 'Os', symbol: 'O', x: 1, y: 0, lonePairs: 3 },
  ],
  bonds: [
    ['Oc', 'Od', 2],
    ['Oc', 'Os', 1],
  ],
};

const AMMONIUM: LewisInput = {
  alt: 'Lewis diagram of the ammonium ion',
  ion: 1,
  atoms: [
    { id: 'N', symbol: 'N', x: 0, y: 0 },
    { id: 'H1', symbol: 'H', x: 0, y: -1 },
    { id: 'H2', symbol: 'H', x: 1, y: 0 },
    { id: 'H3', symbol: 'H', x: 0, y: 1 },
    { id: 'H4', symbol: 'H', x: -1, y: 0 },
  ],
  bonds: [
    ['N', 'H1', 1],
    ['N', 'H2', 1],
    ['N', 'H3', 1],
    ['N', 'H4', 1],
  ],
};

const NITRATE: LewisInput = {
  alt: 'Lewis diagram of the nitrate ion',
  ion: -1,
  atoms: [
    { id: 'N', symbol: 'N', x: 0, y: 0 },
    { id: 'O1', symbol: 'O', x: 0, y: -1, lonePairs: 2 },
    { id: 'O2', symbol: 'O', x: -0.87, y: 0.5, lonePairs: 3 },
    { id: 'O3', symbol: 'O', x: 0.87, y: 0.5, lonePairs: 3 },
  ],
  bonds: [
    ['N', 'O1', 2],
    ['N', 'O2', 1],
    ['N', 'O3', 1],
  ],
};

const NITROGEN_DIOXIDE: LewisInput = {
  alt: 'Lewis diagram of nitrogen dioxide, which has an odd number of electrons',
  atoms: [
    { id: 'N', symbol: 'N', x: 0, y: 0, unpaired: 'top' },
    { id: 'O1', symbol: 'O', x: -0.87, y: 0.5, lonePairs: 2 },
    { id: 'O2', symbol: 'O', x: 0.87, y: 0.5, lonePairs: 3 },
  ],
  bonds: [
    ['N', 'O1', 2],
    ['N', 'O2', 1],
  ],
};

const UP = { x: 0, y: -1 };
const RIGHT = { x: 1, y: 0 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };

describe('valenceElectrons', () => {
  it('knows the main-group elements a lesson draws', () => {
    expect(['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Xe'].map(valenceElectrons)).toEqual([1, 4, 5, 6, 7, 5, 6, 7, 8]);
  });

  it('throws on a symbol it does not know, saying how to fix it', () => {
    expect(() => valenceElectrons('Zz')).toThrow(/Zz.*src\/lib\/lewis\.ts/);
  });

  it('does not accept a symbol in the wrong case', () => {
    expect(() => valenceElectrons('CL')).toThrow(/CL/);
  });
});

describe('formalCharges', () => {
  it('gives ozone +1 on the central oxygen and -1 on the single-bonded one', () => {
    const charges = formalCharges(OZONE);

    expect(Object.fromEntries(charges)).toEqual({ Oc: 1, Od: 0, Os: -1 });
  });

  it('gives every atom of carbon dioxide a formal charge of zero', () => {
    const charges = formalCharges(CO2);

    expect([...charges.values()]).toEqual([0, 0, 0]);
  });

  it('gives the nitrogen of ammonium +1', () => {
    const charges = formalCharges(AMMONIUM);

    expect(charges.get('N')).toBe(1);
  });

  it('counts an unpaired electron as the atom’s own', () => {
    const charges = formalCharges(NITROGEN_DIOXIDE);

    expect(Object.fromEntries(charges)).toEqual({ N: 1, O1: 0, O2: -1 });
  });
});

describe('the electron count', () => {
  for (const molecule of [WATER, CO2, AMMONIUM, NITRATE, NITROGEN_DIOXIDE, OZONE]) {
    it(`accepts a correct drawing: ${molecule.alt}`, () => {
      expect(() => layoutLewis(molecule)).not.toThrow();
    });
  }

  it('rejects a drawing with a lone pair missing, naming the diagram and both counts', () => {
    const missingPair: LewisInput = {
      ...WATER,
      atoms: WATER.atoms.map((atom) => (atom.id === 'O' ? { ...atom, lonePairs: 1 } : atom)),
    };

    expect(() => layoutLewis(missingPair)).toThrow(
      /Lewis diagram of water.*8 valence electrons.*shows 6/s,
    );
  });

  it('takes an ion’s charge into account', () => {
    const neutralNitrate = { ...NITRATE, ion: undefined };

    expect(() => layoutLewis(neutralNitrate)).toThrow(/23 valence electrons.*shows 24/s);
  });
});

describe('validation', () => {
  const broken = (change: Partial<LewisInput>): LewisInput => ({ ...WATER, ...change });

  it('requires alt text', () => {
    expect(() => layoutLewis(broken({ alt: '  ' }))).toThrow(/alt text/);
  });

  it('rejects two atoms with the same id', () => {
    const atoms = [...WATER.atoms, { id: 'H1', symbol: 'H', x: 0, y: 1 }];

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/Lewis diagram of water.*id "H1"/s);
  });

  it('rejects a bond to an atom that does not exist', () => {
    const bonds: LewisInput['bonds'] = [['O', 'H1', 1], ['O', 'H3', 1]];

    expect(() => layoutLewis(broken({ bonds }))).toThrow(/"H3"/);
  });

  it('rejects a bond order other than 1, 2 or 3', () => {
    const bonds: LewisInput['bonds'] = [['O', 'H1', 4], ['O', 'H2', 1]];

    expect(() => layoutLewis(broken({ bonds }))).toThrow(/order 4.*1, 2 or 3/s);
  });

  it('rejects more than four lone pairs', () => {
    const atoms = WATER.atoms.map((atom) => (atom.id === 'O' ? { ...atom, lonePairs: 5 } : atom));

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/5 lone pairs.*at most 4/s);
  });

  it('rejects an unknown element, naming the diagram', () => {
    const atoms = WATER.atoms.map((atom) => (atom.id === 'O' ? { ...atom, symbol: 'Oo' } : atom));

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/Lewis diagram of water.*"Oo"/s);
  });

  it('rejects a listed lone-pair side that points along a bond', () => {
    const atoms = WATER.atoms.map((atom) =>
      atom.id === 'O' ? { ...atom, lonePairs: ['top', 'right'] as const } : atom,
    );

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/right.*along a bond/s);
  });

  it('rejects two lone pairs listed on the same side', () => {
    const atoms = WATER.atoms.map((atom) =>
      atom.id === 'O' ? { ...atom, lonePairs: ['top', 'top'] as const } : atom,
    );

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/two lone pairs on its top side/);
  });

  it('rejects a misspelled prop, naming the props it knows', () => {
    const typo = { ...WATER, formalCharge: true };

    expect(() => layoutLewis(typo)).toThrow(/Lewis diagram of water.*"formalCharge".*formalCharges/s);
  });

  it('rejects a misspelled atom field', () => {
    const atoms = WATER.atoms.map((atom) => (atom.id === 'O' ? { ...atom, lonepairs: 2 } : atom));

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/atom "O".*"lonepairs".*lonePairs/s);
  });

  it('rejects formalCharges written as text', () => {
    expect(() => layoutLewis({ ...WATER, formalCharges: 'false' as unknown as boolean })).toThrow(
      /formalCharges must be true or false/,
    );
  });

  it('rejects an atom that is not an object, naming the diagram', () => {
    const atoms = [...WATER.atoms, null] as unknown as LewisInput['atoms'];

    expect(() => layoutLewis(broken({ atoms }))).toThrow(/Lewis diagram of water.*atom 4 is not/s);
  });

  it('rejects an ion charge that is not a whole number', () => {
    expect(() => layoutLewis({ ...AMMONIUM, ion: 0.5 })).toThrow(/whole number/);
  });
});

describe('chooseLonePairSides', () => {
  it('puts two pairs above and below an atom bonded left and right', () => {
    expect(chooseLonePairSides(2, [LEFT, RIGHT])).toEqual(['top', 'bottom']);
  });

  it('puts the first pair opposite a single bond, then breaks ties top before bottom', () => {
    expect(chooseLonePairSides(3, [RIGHT])).toEqual(['left', 'top', 'bottom']);
  });

  it('fills all four sides of a lone atom, top, bottom, left, right', () => {
    expect(chooseLonePairSides(4, [])).toEqual(['top', 'bottom', 'left', 'right']);
  });

  it('leaves out a side that is already taken', () => {
    expect(chooseLonePairSides(2, [DOWN], 'top')).toEqual(['left', 'right']);
  });

  it('throws when there are more pairs than sides free of bonds', () => {
    expect(() => chooseLonePairSides(1, [UP, RIGHT, DOWN, LEFT])).toThrow(/no side is free/);
  });
});

describe('bondLineOffsets', () => {
  it('draws a single bond as one line through the atoms', () => {
    expect(bondLineOffsets(1)).toEqual([0]);
  });

  it('draws a double bond as two lines either side', () => {
    expect(bondLineOffsets(2)).toEqual([-3, 3]);
  });

  it('draws a triple bond as three lines', () => {
    expect(bondLineOffsets(3)).toEqual([-5, 0, 5]);
  });
});

describe('layoutLewis', () => {
  it('draws one line per unit of bond order', () => {
    const layout = layoutLewis(CO2);

    expect(layout.lines).toHaveLength(4);
  });

  it('draws the two lines of a double bond parallel and 6 apart', () => {
    const [first, second] = layoutLewis(CO2).lines;
    if (!first || !second) throw new Error('expected two lines');

    expect(Math.abs(first.y1 - second.y1)).toBeCloseTo(6, 6);
    expect(first.y1).toBeCloseTo(first.y2, 6);
  });

  it('stops each bond line short of the letters', () => {
    const layout = layoutLewis(WATER);
    const oxygen = layout.symbols.find((s) => s.text === 'O');
    if (!oxygen) throw new Error('no oxygen drawn');

    for (const line of layout.lines) {
      const nearEnd = Math.min(Math.abs(line.x1 - oxygen.x), Math.abs(line.x2 - oxygen.x));
      expect(nearEnd).toBeGreaterThan(symbolHalfWidth('O'));
    }
  });

  it('draws two dots for each lone pair and one for an unpaired electron', () => {
    expect(layoutLewis(WATER).dots).toHaveLength(4);
    expect(layoutLewis(NITROGEN_DIOXIDE).dots).toHaveLength(2 * 5 + 1);
  });

  it('puts water’s lone pairs above and below the oxygen', () => {
    const dots = layoutLewis(WATER).dots;

    expect(dots.filter((d) => d.cy < 0)).toHaveLength(2);
    expect(dots.filter((d) => d.cy > 0)).toHaveLength(2);
    for (const dot of dots) expect(Math.abs(dot.cx)).toBeLessThan(symbolHalfWidth('O'));
  });

  it('fits the view box to the drawing with a small margin on every side', () => {
    const hydrogen: LewisInput = {
      alt: 'Lewis diagram of hydrogen',
      atoms: [
        { id: 'H1', symbol: 'H', x: 0, y: 0 },
        { id: 'H2', symbol: 'H', x: 1, y: 0 },
      ],
      bonds: [['H1', 'H2', 1]],
    };

    const { viewBox } = layoutLewis(hydrogen);

    expect(viewBox.x).toBeCloseTo(-symbolHalfWidth('H') - MARGIN, 6);
    expect(viewBox.width).toBeCloseTo(BOND_LENGTH + 2 * symbolHalfWidth('H') + 2 * MARGIN, 6);
    expect(viewBox.y).toBeCloseTo(-symbolHalfHeight() - MARGIN, 6);
    expect(viewBox.height).toBeCloseTo(2 * symbolHalfHeight() + 2 * MARGIN, 6);
  });

  it('keeps every dot inside the view box', () => {
    const { viewBox, dots } = layoutLewis(NITRATE);

    for (const dot of dots) {
      expect(dot.cx).toBeGreaterThan(viewBox.x);
      expect(dot.cx).toBeLessThan(viewBox.x + viewBox.width);
      expect(dot.cy).toBeGreaterThan(viewBox.y);
      expect(dot.cy).toBeLessThan(viewBox.y + viewBox.height);
    }
  });

  it('shows no formal charges unless asked', () => {
    expect(layoutLewis(OZONE).formalCharges).toEqual([]);
  });

  it('shows each non-zero formal charge when asked', () => {
    const layout = layoutLewis({ ...OZONE, formalCharges: true });

    expect(layout.formalCharges.map((c) => c.text).sort()).toEqual(['+1', '−1']);
  });

  it('shows nothing for a molecule whose formal charges are all zero', () => {
    expect(layoutLewis({ ...CO2, formalCharges: true }).formalCharges).toEqual([]);
  });

  it('draws no brackets around a neutral molecule', () => {
    expect(layoutLewis(WATER).brackets).toBeUndefined();
  });

  it('draws brackets around an ion with its charge at the upper right', () => {
    const layout = layoutLewis(AMMONIUM);
    const brackets = layout.brackets;
    if (!brackets) throw new Error('no brackets drawn');

    expect(brackets.charge.text).toBe('+');
    const xs = layout.symbols.map((s) => s.x);
    const ys = layout.symbols.map((s) => s.y);
    expect(brackets.left).toBeLessThan(Math.min(...xs));
    expect(brackets.right).toBeGreaterThan(Math.max(...xs));
    expect(brackets.top).toBeLessThan(Math.min(...ys));
    expect(brackets.charge.x).toBeGreaterThan(brackets.right);
    expect(brackets.charge.y).toBeLessThan(brackets.top + 10);
    expect(layout.viewBox.x + layout.viewBox.width).toBeGreaterThan(brackets.charge.x);
  });
});

describe('chargeText', () => {
  it('writes an ion charge the way chemists do', () => {
    expect([1, -1, 2, -2, 3].map((n) => chargeText(n, 'ion'))).toEqual(['+', '−', '2+', '2−', '3+']);
  });

  it('writes a formal charge with its sign first', () => {
    expect([1, -1, 2, -2].map((n) => chargeText(n, 'formal'))).toEqual(['+1', '−1', '+2', '−2']);
  });
});
