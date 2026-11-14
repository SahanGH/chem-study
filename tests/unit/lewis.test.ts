import { describe, expect, it } from 'vitest';
import {
  BOND_LENGTH,
  DOT_RADIUS,
  LEWIS_MARKER,
  MARGIN,
  PAIR_GAP,
  bondLineOffsets,
  countLewisStructures,
  formalCharges,
  layoutLewis,
  symbolHalfHeight,
  symbolHalfWidth,
  type Label,
  type Line,
  type LewisInput,
} from '../../src/lib/lewis';
import { chargeText, chooseLonePairSides, valenceElectrons } from '../../src/lib/lewis-parse';

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
    expect(() => valenceElectrons('Zz')).toThrow(/Zz.*src\/lib\/lewis-parse\.ts/);
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

// Every way a diagram can be written wrong, one row each. Each message must
// start with the diagram's name (the start of its alt text) so a writer with
// twenty diagrams in a lesson can find the one at fault.
const ALT = 'a test molecule';
const NAMED_PREFIX = `Lewis diagram "${ALT}": `;

/** A diagram typed wrongly on purpose: the checker's input is whatever a writer put in MDX. */
const malformed = (value: unknown): LewisInput => value as LewisInput;

/** Water, renamed, with some of its parts replaced. */
const water = (change: Record<string, unknown>): LewisInput => malformed({ ...WATER, alt: ALT, ...change });

/** Water with one atom's fields changed. */
const waterWithAtom = (id: string, change: Record<string, unknown>): LewisInput =>
  water({ atoms: WATER.atoms.map((atom) => (atom.id === id ? { ...atom, ...change } : atom)) });

function failureOf(input: LewisInput): string {
  try {
    layoutLewis(input);
  } catch (error) {
    if (error instanceof Error) return error.message;
    throw error;
  }
  throw new Error('expected layoutLewis to throw, but it returned a layout');
}

interface FailureRow {
  readonly name: string;
  readonly input: LewisInput;
  readonly message: RegExp;
}

const BONDED_TWICE = [['O', 'H1', 1], ['H1', 'O', 1], ['O', 'H2', 1]];

const FAILURES: readonly FailureRow[] = [
  { name: 'a prop the diagram does not take', input: water({ formalCharge: true }), message: /prop "formalCharge" that a Lewis diagram does not take/ },
  { name: 'formalCharges written as text', input: water({ formalCharges: 'yes' }), message: /formalCharges must be true or false, not "yes"/ },
  { name: 'an empty atom list', input: water({ atoms: [] }), message: /it has no atoms/ },
  { name: 'atoms that are not a list', input: water({ atoms: 'O' }), message: /it has no atoms/ },
  { name: 'bonds that are not a list', input: water({ bonds: 'O-H' }), message: /bonds must be a list/ },
  { name: 'an ion charge of 0', input: water({ ion: 0 }), message: /ion must be a whole number other than 0.*not 0/ },
  { name: 'a fractional ion charge', input: water({ ion: 1.5 }), message: /ion must be a whole number other than 0.*not 1\.5/ },
  { name: 'an atom that is not an object', input: water({ atoms: [...WATER.atoms, null] }), message: /atom 4 is not written as/ },
  { name: 'an atom with no id', input: waterWithAtom('O', { id: '' }), message: /every atom needs an id/ },
  { name: 'an atom whose id is a number', input: waterWithAtom('O', { id: 7 }), message: /every atom needs an id/ },
  { name: 'an atom field it does not take', input: waterWithAtom('O', { lonepairs: 2 }), message: /atom "O" has a field "lonepairs"/ },
  { name: 'two atoms with the same id', input: waterWithAtom('H2', { id: 'H1' }), message: /two atoms have the id "H1"/ },
  { name: 'a symbol that is not an element', input: waterWithAtom('O', { symbol: 'Oo' }), message: /atom "O" has the symbol "Oo"/ },
  { name: 'an x that is not a number', input: waterWithAtom('H1', { x: NaN }), message: /atom "H1" needs numbers for x and y, not NaN and 0/ },
  { name: 'a y that is not finite', input: waterWithAtom('H1', { y: Infinity }), message: /atom "H1" needs numbers for x and y, not -1 and Infinity/ },
  { name: 'two atoms at the same position', input: waterWithAtom('H2', { x: -1, y: 0 }), message: /two atoms sit at x: -1, y: 0/ },
  { name: 'a fractional lone-pair count', input: waterWithAtom('O', { lonePairs: 1.5 }), message: /atom "O" has 1\.5 lone pairs\. An atom can show from 0 to at most 4/ },
  { name: 'a negative lone-pair count', input: waterWithAtom('O', { lonePairs: -1 }), message: /atom "O" has -1 lone pairs/ },
  { name: 'a lone-pair count of 5', input: waterWithAtom('O', { lonePairs: 5 }), message: /atom "O" has 5 lone pairs\. An atom can show from 0 to at most 4/ },
  { name: 'a lone-pair list with a side that does not exist', input: waterWithAtom('O', { lonePairs: ['up'] }), message: /atom "O" lists lone pairs on \["up"\]/ },
  { name: 'lone pairs given as text', input: waterWithAtom('O', { lonePairs: 'top' }), message: /atom "O" lists lone pairs on "top"/ },
  { name: 'more than four listed sides', input: waterWithAtom('O', { lonePairs: ['top', 'right', 'bottom', 'left', 'top'] }), message: /atom "O" has 5 lone pairs\. An atom can show at most 4/ },
  { name: 'an unpaired electron on a side that does not exist', input: waterWithAtom('O', { unpaired: 'up' }), message: /atom "O" has its unpaired electron on "up"/ },
  { name: 'a bond with two parts', input: water({ bonds: [['O', 'H1']] }), message: /a bond is written \["O","H1"\]\. Write it as \[fromId, toId, order\]/ },
  // Three characters long, so a check on length alone would let it through.
  { name: 'a bond that is a three-character string, not a list', input: water({ bonds: ['O-H'] }), message: /a bond is written "O-H"/ },
  { name: 'a bond from an atom that does not exist', input: water({ bonds: [['X', 'H1', 1]] }), message: /a bond names the atom "X", which is not in atoms/ },
  { name: 'a bond to an atom that does not exist', input: water({ bonds: [['O', 'H3', 1]] }), message: /a bond names the atom "H3", which is not in atoms/ },
  { name: 'an atom bonded to itself', input: water({ bonds: [['O', 'O', 1]] }), message: /a bond joins "O" to itself/ },
  { name: 'a bond order of 4', input: water({ bonds: [['O', 'H1', 4], ['O', 'H2', 1]] }), message: /the bond O–H1 has order 4\. A bond order must be 1, 2 or 3/ },
  { name: 'two atoms bonded twice, the second time reversed', input: water({ bonds: BONDED_TWICE }), message: /the atoms "H1" and "O" are bonded twice/ },
  { name: 'an unpaired electron along a bond', input: waterWithAtom('O', { unpaired: 'left' }), message: /atom "O" has its unpaired electron on its left side, which points along a bond/ },
  { name: 'a listed lone pair along a bond', input: waterWithAtom('O', { lonePairs: ['top', 'right'] }), message: /atom "O" has a lone pair on its right side, which points along a bond/ },
  { name: 'two lone pairs on one side', input: waterWithAtom('O', { lonePairs: ['top', 'top'] }), message: /atom "O" has two lone pairs on its top side/ },
  { name: 'a lone pair and an unpaired electron on one side', input: waterWithAtom('O', { lonePairs: ['top', 'bottom'], unpaired: 'top' }), message: /atom "O" has a lone pair and its unpaired electron both on its top side/ },
  {
    name: 'a lone pair counted on an atom with no free side',
    input: malformed({
      ...AMMONIUM,
      alt: ALT,
      atoms: AMMONIUM.atoms.map((atom) => (atom.id === 'N' ? { ...atom, lonePairs: 1 } : atom)),
    }),
    message: /atom "N" has 1 lone pair\(s\) to place, but no side is free of bonds/,
  },
  { name: 'a lone pair too few for the electron count', input: waterWithAtom('O', { lonePairs: 1 }), message: /its atoms have 8 valence electrons \(O 6, H 1, H 1\), so it should show 8, but it shows 6/ },
  { name: 'a positive ion with too many electrons', input: malformed({ ...AMMONIUM, alt: ALT, ion: 2 }), message: /minus 2 for the 2\+ charge\), so it should show 7, but it shows 8/ },
  { name: 'a negative ion with too few electrons', input: malformed({ ...NITRATE, alt: ALT, ion: -2 }), message: /plus 2 for the 2− charge\), so it should show 25, but it shows 24/ },
  { name: 'an odd-electron species given an ion charge', input: malformed({ ...NITROGEN_DIOXIDE, alt: ALT, ion: 1 }), message: /should show 16, but it shows 17 \(6 in bonds, 10 in lone pairs, 1 unpaired\)/ },
];

describe('every way a diagram can be written wrong', () => {
  it.each(FAILURES)('names the diagram and the problem for $name', ({ input, message }) => {
    const failure = failureOf(input);

    expect(failure).toMatch(message);
    expect(failure.startsWith(NAMED_PREFIX)).toBe(true);
  });

  it('does not mention a charge when a neutral molecule has the wrong count', () => {
    const failure = failureOf(waterWithAtom('O', { lonePairs: 1 }));

    expect(failure).not.toMatch(/for the .* charge/);
  });
});

describe('error messages show what was typed', () => {
  it('quotes an x written as text, so "0" is not mistaken for the number 0', () => {
    expect(failureOf(waterWithAtom('H1', { x: '0' }))).toMatch(/atom "H1" needs numbers for x and y, not "0" and 0/);
  });

  it('quotes a y written as text', () => {
    expect(failureOf(waterWithAtom('H1', { y: '1' }))).toMatch(/not -1 and "1"/);
  });

  it('quotes a bond order written as text, so "1" is not mistaken for the number 1', () => {
    expect(failureOf(water({ bonds: [['O', 'H1', '1'], ['O', 'H2', 1]] }))).toMatch(/the bond O–H1 has order "1"/);
  });

  it('quotes an ion charge written as text', () => {
    expect(failureOf(water({ ion: '1' }))).toMatch(/ion must be a whole number other than 0.*not "1"\./);
  });

  it('says undefined for a bond whose order is left out', () => {
    expect(failureOf(water({ bonds: [['O', 'H1', undefined], ['O', 'H2', 1]] }))).toMatch(/has order undefined/);
  });
});

describe('atom ids with spaces', () => {
  // The bonds a b–c and a–b c would both be keyed "a b c" if the ids were joined with a space.
  const SPACED: LewisInput = {
    alt: 'Lewis diagram of two hydrogen molecules with awkward ids',
    atoms: [
      { id: 'a b', symbol: 'H', x: 0, y: 0 },
      { id: 'c', symbol: 'H', x: 1, y: 0 },
      { id: 'a', symbol: 'H', x: 0, y: 2 },
      { id: 'b c', symbol: 'H', x: 1, y: 2 },
    ],
    bonds: [
      ['a b', 'c', 1],
      ['a', 'b c', 1],
    ],
  };

  it('are not confused with one another when checking for a repeated bond', () => {
    expect(() => layoutLewis(SPACED)).not.toThrow();
  });
});

describe('a bond that runs through another atom', () => {
  // H–H with a helium between them, or beside them. Helium keeps its two
  // electrons as one lone pair, so the electron count is right either way.
  const helium = (y: number): LewisInput => ({
    alt: 'two hydrogens and a helium',
    atoms: [
      { id: 'A', symbol: 'H', x: 0, y: 0 },
      { id: 'C', symbol: 'H', x: 2, y: 0 },
      { id: 'B', symbol: 'He', x: 1, y, lonePairs: 1 },
    ],
    bonds: [['A', 'C', 1]],
  });

  it('is rejected when the bond would be drawn over the other atom’s letter', () => {
    expect(failureOf(helium(0))).toMatch(/^Lewis diagram "two hydrogens and a helium": the bond A–C.*the atom "B"/s);
  });

  it('is rejected when the other atom’s letter is only a little too close to the line', () => {
    expect(failureOf(helium(0.3))).toMatch(/the bond A–C.*the atom "B"/s);
  });

  it('is accepted when the other atom is clear of the line', () => {
    expect(() => layoutLewis(helium(0.4))).not.toThrow();
  });

  it('is rejected when the other atom sits just past the end of the bond, on its letter', () => {
    const past: LewisInput = {
      ...helium(0),
      atoms: [
        { id: 'A', symbol: 'H', x: 0, y: 0 },
        { id: 'C', symbol: 'H', x: 2, y: 0 },
        { id: 'B', symbol: 'He', x: 2.2, y: 0, lonePairs: 1 },
      ],
    };

    expect(failureOf(past)).toMatch(/the bond A–C.*the atom "B"/s);
  });

  it('is accepted when the other atom is in line with the bond but beyond its end', () => {
    const inLine: LewisInput = {
      ...helium(0),
      atoms: [
        { id: 'A', symbol: 'H', x: 0, y: 0 },
        { id: 'C', symbol: 'H', x: 1, y: 0 },
        { id: 'B', symbol: 'He', x: 2, y: 0, lonePairs: 1 },
      ],
    };

    expect(() => layoutLewis(inLine)).not.toThrow();
  });
});

describe('naming a diagram in an error', () => {
  it('lists the atoms when the alt text is missing', () => {
    const withoutAlt = { atoms: WATER.atoms, bonds: WATER.bonds };

    expect(failureOf(malformed(withoutAlt))).toMatch(/atoms: O, H, H\) has no alt text/);
  });

  it('says there are no atoms when the alt text and the atom list are both missing', () => {
    expect(failureOf(malformed({ alt: '', bonds: [] }))).toMatch(/atoms: none\) has no alt text/);
  });

  it('marks an atom that is not an object with a question mark when the alt text is missing', () => {
    expect(failureOf(malformed({ alt: ' ', atoms: [null, WATER.atoms[0]], bonds: [] }))).toMatch(/atoms: \?, O\) has no alt text/);
  });

  it('shortens a long alt text to its first 60 characters and an ellipsis', () => {
    const alt = 'x'.repeat(70);

    const failure = failureOf(malformed({ ...WATER, alt, bonds: 'none' }));

    expect(failure.startsWith(`Lewis diagram "${'x'.repeat(60)}…": `)).toBe(true);
  });

  it('ignores spaces around the alt text', () => {
    expect(failureOf(malformed({ ...WATER, alt: '  padded  ', bonds: 'none' })).startsWith('Lewis diagram "padded": ')).toBe(true);
  });
});

// A bond line must stop just outside the letter at each end. The check walks
// the line's end back toward the atom: at the end it is outside the letter's
// box, and 5 units further back (the gap is 4) it is inside.
const insideLetter = (x: number, y: number, letter: Label): boolean =>
  Math.abs(x - letter.x) <= symbolHalfWidth(letter.text) && Math.abs(y - letter.y) <= symbolHalfHeight();

function expectLineEndsJustOutsideLetters(line: Line, from: Label, to: Label): void {
  const length = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
  const dx = (line.x2 - line.x1) / length;
  const dy = (line.y2 - line.y1) / length;
  const back = 5;

  expect(insideLetter(line.x1, line.y1, from)).toBe(false);
  expect(insideLetter(line.x1 - back * dx, line.y1 - back * dy, from)).toBe(true);
  expect(insideLetter(line.x2, line.y2, to)).toBe(false);
  expect(insideLetter(line.x2 + back * dx, line.y2 + back * dy, to)).toBe(true);
}

const STEEP_HYDROGEN: LewisInput = {
  alt: 'Lewis diagram of hydrogen, drawn at a steep angle',
  atoms: [
    { id: 'H1', symbol: 'H', x: 0, y: 0 },
    { id: 'H2', symbol: 'H', x: 0.5, y: 0.87 },
  ],
  bonds: [['H1', 'H2', 1]],
};

describe('where bond lines stop', () => {
  it('stops a vertical bond just outside the letters, above and below', () => {
    const layout = layoutLewis(NITRATE);
    const [nitrogen, topOxygen] = layout.symbols;
    if (!nitrogen || !topOxygen) throw new Error('expected nitrogen and its top oxygen');
    const vertical = layout.lines.filter((line) => Math.abs(line.x1 - line.x2) < 1e-9);

    expect(vertical).toHaveLength(2);
    for (const line of vertical) expectLineEndsJustOutsideLetters(line, nitrogen, topOxygen);
  });

  it('stops a steep diagonal bond just outside the letters, where the height decides', () => {
    const layout = layoutLewis(STEEP_HYDROGEN);
    const [first, second] = layout.symbols;
    const [line] = layout.lines;
    if (!first || !second || !line) throw new Error('expected two hydrogens and a bond');

    expectLineEndsJustOutsideLetters(line, first, second);
  });

  it('stops a shallow diagonal bond just outside the letters, where the width decides', () => {
    const layout = layoutLewis(NITRATE);
    const [nitrogen, , leftOxygen] = layout.symbols;
    const line = layout.lines[2];
    if (!nitrogen || !leftOxygen || !line) throw new Error('expected nitrogen, its lower left oxygen and their bond');

    expectLineEndsJustOutsideLetters(line, nitrogen, leftOxygen);
  });
});

// A hydroxide ion with its hydrogen on a diagonal: the formal charge goes in
// the corner of the oxygen farthest from the bond.
const hydroxide = (hydrogenX: number, hydrogenY: number): LewisInput => ({
  alt: 'Lewis diagram of the hydroxide ion',
  ion: -1,
  formalCharges: true,
  atoms: [
    { id: 'O', symbol: 'O', x: 0, y: 0, lonePairs: 3 },
    { id: 'H', symbol: 'H', x: hydrogenX, y: hydrogenY },
  ],
  bonds: [['O', 'H', 1]],
});

describe('where a formal charge goes', () => {
  it.each([
    { bond: 'lower right', hydrogenX: 0.7, hydrogenY: 0.7, side: 'upper left', sign: { x: -1, y: -1 } },
    { bond: 'upper left', hydrogenX: -0.7, hydrogenY: -0.7, side: 'lower right', sign: { x: 1, y: 1 } },
    { bond: 'lower left', hydrogenX: -0.7, hydrogenY: 0.7, side: 'upper right', sign: { x: 1, y: -1 } },
  ])('puts it at the $side of the letter when the bond leaves to the $bond', ({ hydrogenX, hydrogenY, sign }) => {
    const [charge] = layoutLewis(hydroxide(hydrogenX, hydrogenY)).formalCharges;
    if (!charge) throw new Error('expected a formal charge on the oxygen');

    expect(Math.sign(charge.x)).toBe(sign.x);
    expect(Math.sign(charge.y)).toBe(sign.y);
    expect(charge.text).toBe('−1');
  });

  it('puts it clear of the letter, outside its box on both axes', () => {
    const [charge] = layoutLewis(hydroxide(0.7, 0.7)).formalCharges;
    if (!charge) throw new Error('expected a formal charge on the oxygen');

    expect(Math.abs(charge.x)).toBeGreaterThan(symbolHalfWidth('O'));
    expect(Math.abs(charge.y)).toBeGreaterThan(symbolHalfHeight());
  });

  it('keeps the listed corner order when every corner is equally clear: the upper right', () => {
    const [charge] = layoutLewis({ ...OZONE, formalCharges: true }).formalCharges.filter((c) => c.text === '+1');
    if (!charge) throw new Error('expected a +1 on the central oxygen');

    expect([Math.sign(charge.x), Math.sign(charge.y)]).toEqual([1, -1]);
  });
});

const NITRIC_OXIDE: LewisInput = {
  alt: 'Lewis diagram of nitric oxide, which has an odd number of electrons',
  atoms: [
    { id: 'N', symbol: 'N', x: 0, y: 0, lonePairs: 1, unpaired: 'left' },
    { id: 'O', symbol: 'O', x: 1, y: 0, lonePairs: 2 },
  ],
  bonds: [['N', 'O', 2]],
};

describe('where an unpaired electron goes', () => {
  it('puts the dot just above the letter for the top side', () => {
    const dots = layoutLewis(NITROGEN_DIOXIDE).dots.filter((dot) => Math.abs(dot.cx) < 1e-9 && dot.cy < 0);
    const [dot] = dots;
    if (!dot) throw new Error('expected a dot above the nitrogen');

    expect(dots).toHaveLength(1);
    expect(-dot.cy - DOT_RADIUS - symbolHalfHeight()).toBeCloseTo(PAIR_GAP, 6);
  });

  it('puts the dot just left of the letter, level with it, for the left side', () => {
    const dots = layoutLewis(NITRIC_OXIDE).dots.filter((dot) => Math.abs(dot.cy) < 1e-9 && dot.cx < 0);
    const [dot] = dots;
    if (!dot) throw new Error('expected a dot left of the nitrogen');

    expect(dots).toHaveLength(1);
    expect(-dot.cx - DOT_RADIUS - symbolHalfWidth('N')).toBeCloseTo(PAIR_GAP, 6);
  });
});

describe('countLewisStructures', () => {
  // The root of a diagram as Lewis.astro renders it.
  const root = `<div class="lewis" ${LEWIS_MARKER}><svg class="lewis-drawing"></svg></div>`;

  it('counts none in empty HTML', () => {
    expect(countLewisStructures('')).toBe(0);
  });

  it('counts one diagram', () => {
    expect(countLewisStructures(root)).toBe(1);
  });

  it('counts two diagrams', () => {
    expect(countLewisStructures(root + root)).toBe(2);
  });

  it('does not count an element whose attribute only starts with the marker', () => {
    expect(countLewisStructures(`<div ${LEWIS_MARKER}-foo></div>`)).toBe(0);
  });

  it('counts a marker that has a value', () => {
    expect(countLewisStructures(`<div class="lewis" ${LEWIS_MARKER}="">`)).toBe(1);
  });

  it('does not count the marker on an element that is not a div', () => {
    expect(countLewisStructures(`<span ${LEWIS_MARKER}></span>`)).toBe(0);
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
