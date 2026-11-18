import { afterEach, describe, expect, it, vi } from 'vitest';
import { elementBySymbol } from '../../src/data/elements';
import {
  AXIS,
  PES_ELEMENTS,
  compare,
  comparisonReadout,
  configuration,
  describeSpectrum,
  energyFraction,
  energyTable,
  heightFraction,
  labelAnchor,
  opening,
  readout,
  tableCaption,
} from '../../src/lib/pes';

const NOT_NUMBERS = [Number.NaN, Number.POSITIVE_INFINITY];

// Written out apart from the module, from the plan's table: the energy of each
// subshell in MJ/mol, as text, in the order 1s 2s 2p 3s 3p 4s.
const TABLE: Record<string, readonly string[]> = {
  H: ['1.31'],
  He: ['2.37'],
  Li: ['6.26', '0.52'],
  Be: ['11.5', '0.90'],
  B: ['19.3', '1.36', '0.80'],
  C: ['28.6', '1.72', '1.09'],
  N: ['39.6', '2.45', '1.40'],
  O: ['52.6', '3.12', '1.31'],
  F: ['67.2', '3.88', '1.68'],
  Ne: ['84.0', '4.68', '2.08'],
  Na: ['104', '6.84', '3.67', '0.50'],
  Mg: ['126', '9.07', '5.31', '0.74'],
  Al: ['151', '12.1', '7.79', '1.09', '0.58'],
  Si: ['178', '15.1', '10.3', '1.46', '0.79'],
  P: ['208', '18.7', '13.5', '1.95', '1.01'],
  S: ['239', '22.7', '16.5', '2.05', '1.00'],
  Cl: ['273', '26.8', '20.2', '2.44', '1.25'],
  Ar: ['309', '31.5', '24.1', '2.82', '1.52'],
  K: ['347', '37.1', '29.1', '3.93', '2.38', '0.42'],
  Ca: ['390', '42.7', '34.0', '4.65', '2.90', '0.59'],
};
const FILLING_ORDER = ['1s', '2s', '2p', '3s', '3p', '4s'];
const CAPACITY: Record<string, number> = { s: 2, p: 6 };
const SYMBOLS = Object.keys(TABLE);

/** The expected values each come with a tolerance; toBeCloseTo only takes a number of digits. */
function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(Math.abs(actual - expected), `${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(
    tolerance,
  );
}

function elementOf(symbol: string) {
  const found = PES_ELEMENTS.find((element) => element.symbol === symbol);
  if (!found) throw new Error(`The test table names ${symbol}, which PES_ELEMENTS lacks.`);
  return found;
}

describe('PES_ELEMENTS', () => {
  it('holds the twenty elements, hydrogen to calcium, with z from 1 to 20 in order', () => {
    expect(PES_ELEMENTS).toHaveLength(20);
    expect(PES_ELEMENTS.map((element) => element.z)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(PES_ELEMENTS.map((element) => element.symbol)).toEqual(SYMBOLS);
  });

  it('takes each name from the element data, in US spelling', () => {
    for (const element of PES_ELEMENTS) expect(element.name, element.symbol).toBe(elementBySymbol(element.symbol)?.name);
    expect(elementOf('Al').name).toBe('Aluminum');
    expect(elementOf('S').name).toBe('Sulfur');
  });

  it("has electrons that add up to the atom's atomic number", () => {
    for (const element of PES_ELEMENTS) {
      const total = element.peaks.reduce((sum, peak) => sum + peak.electrons, 0);

      expect(total, element.symbol).toBe(element.z);
    }
  });

  it('lists the peaks in the filling order, from the highest binding energy to the lowest', () => {
    for (const element of PES_ELEMENTS) {
      const names = element.peaks.map((peak) => peak.subshell);
      expect(names, element.symbol).toEqual(FILLING_ORDER.slice(0, names.length));

      const energies = element.peaks.map((peak) => Number(peak.energy));
      for (let i = 1; i < energies.length; i++) {
        expect(energies[i], `${element.symbol} ${names[i]}`).toBeLessThan(energies[i - 1] ?? Number.NEGATIVE_INFINITY);
      }
    }
  });

  it('never holds more electrons in a subshell than it can, and only the last subshell may be partly filled', () => {
    for (const element of PES_ELEMENTS) {
      element.peaks.forEach((peak, index) => {
        const capacity = CAPACITY[peak.subshell.slice(1)];
        const isLast = index === element.peaks.length - 1;

        expect(peak.electrons, `${element.symbol} ${peak.subshell}`).toBeLessThanOrEqual(capacity ?? 0);
        expect(peak.electrons, `${element.symbol} ${peak.subshell}`).toBeGreaterThanOrEqual(1);
        if (!isLast) expect(peak.electrons, `${element.symbol} ${peak.subshell} is full`).toBe(capacity);
      });
    }
  });

  it('gives every binding energy as the text of the table, so 84.0 and 0.90 keep their figures: 74 values', () => {
    let count = 0;
    for (const element of PES_ELEMENTS) {
      const expected = TABLE[element.symbol] ?? [];

      expect(
        element.peaks.map((peak) => peak.energy),
        element.symbol,
      ).toEqual(expected);
      count += element.peaks.length;
    }
    expect(count).toBe(74);
    expect(elementOf('Ne').peaks[0]?.energy).toBe('84.0');
    expect(elementOf('Be').peaks[1]?.energy).toBe('0.90');
  });

  it('keeps every binding energy on the axis', () => {
    for (const element of PES_ELEMENTS) {
      for (const peak of element.peaks) {
        const energy = Number(peak.energy);
        expect(energy, `${element.symbol} ${peak.subshell}`).toBeGreaterThanOrEqual(AXIS.min);
        expect(energy, `${element.symbol} ${peak.subshell}`).toBeLessThanOrEqual(AXIS.max);
      }
    }
  });
});

describe('loading the module', () => {
  afterEach(() => {
    vi.doUnmock('../../src/data/elements');
    vi.resetModules();
  });

  it('throws, naming the symbol, if an element is missing from the element data', async () => {
    vi.resetModules();
    vi.doMock('../../src/data/elements', () => ({ elementBySymbol: () => undefined }));

    await expect(import('../../src/lib/pes')).rejects.toThrow('"H"');
  });
});

describe('AXIS', () => {
  it('runs from 0.1 to 1000 MJ/mol', () => {
    expect(AXIS).toEqual({ min: 0.1, max: 1000 });
  });
});

describe('energyFraction', () => {
  it('puts each tick of the axis at its place: 1000 at the left edge, 0.1 at the right', () => {
    expect(
      ['1000', '100', '10', '1', '0.1'].map((energy) => energyFraction(energy)),
    ).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('puts silicon 1s, 178 MJ/mol, at 0.187395', () => {
    expectWithin(energyFraction('178'), 0.187395, 1e-6);
  });

  it('puts silicon 3p, 0.79 MJ/mol, at 0.775593', () => {
    expectWithin(energyFraction('0.79'), 0.775593, 1e-6);
  });

  it('puts a larger energy to the left of a smaller one', () => {
    expect(energyFraction('84.0')).toBeLessThan(energyFraction('4.68'));
  });

  it('rejects an energy outside the axis, naming the value and the range', () => {
    expect(() => energyFraction('0.05')).toThrow(RangeError);
    expect(() => energyFraction('2000')).toThrow(RangeError);
    expect(() => energyFraction('0.05')).toThrow('from 0.1 to 1000 MJ/mol, not 0.05 MJ/mol');
    expect(() => energyFraction('2000')).toThrow('from 0.1 to 1000 MJ/mol, not 2000 MJ/mol');
  });

  it('rejects text that is not a number, naming it', () => {
    for (const text of ['', 'high', 'NaN', 'Infinity']) {
      expect(() => energyFraction(text), JSON.stringify(text)).toThrow(RangeError);
    }
    expect(() => energyFraction('high')).toThrow('not "high"');
  });
});

describe('heightFraction', () => {
  it('is the number of electrons over six, the most any peak here holds', () => {
    expect(heightFraction(6)).toBe(1);
    expectWithin(heightFraction(2), 0.333333, 1e-6);
    expectWithin(heightFraction(1), 0.166667, 1e-6);
  });

  it('rejects a count that is not a whole number from 1 to 6, naming it', () => {
    for (const electrons of [0, 7, -1, 1.5, ...NOT_NUMBERS]) {
      expect(() => heightFraction(electrons), String(electrons)).toThrow(RangeError);
    }
    expect(() => heightFraction(7)).toThrow('from 1 to 6, not 7');
    expect(() => heightFraction(0)).toThrow('from 1 to 6, not 0');
  });
});

describe('configuration', () => {
  it.each([
    ['H', '1s¹'],
    ['He', '1s²'],
    ['Na', '1s² 2s² 2p⁶ 3s¹'],
    ['Si', '1s² 2s² 2p⁶ 3s² 3p²'],
    ['Ca', '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²'],
  ])('writes %s as %s', (symbol, expected) => {
    expect(configuration(symbol)).toBe(expected);
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => configuration('Xx')).toThrow('"Xx"');
    expect(() => configuration('Sc')).toThrow('"Sc"');
    expect(() => configuration('')).toThrow(Error);
  });
});

describe('compare', () => {
  it('puts every shared peak of silicon higher than aluminum, with none lower or the same', () => {
    expect(compare('Si', 'Al')).toEqual({ higher: ['1s', '2s', '2p', '3s', '3p'], lower: [], same: [] });
  });

  it('puts every shared peak of aluminum lower than silicon', () => {
    expect(compare('Al', 'Si')).toEqual({ higher: [], lower: ['1s', '2s', '2p', '3s', '3p'], same: [] });
  });

  it("finds oxygen's 2p lower than nitrogen's, though its nucleus is larger", () => {
    expect(compare('O', 'N')).toEqual({ higher: ['1s', '2s'], lower: ['2p'], same: [] });
  });

  it("finds nitrogen's 2p higher than oxygen's", () => {
    expect(compare('N', 'O')).toEqual({ higher: ['2p'], lower: ['1s', '2s'], same: [] });
  });

  it("finds sulfur's 3p lower than phosphorus's, the other exception", () => {
    expect(compare('S', 'P')).toEqual({ higher: ['1s', '2s', '2p', '3s'], lower: ['3p'], same: [] });
    expect(compare('P', 'S')).toEqual({ higher: ['3p'], lower: ['1s', '2s', '2p', '3s'], same: [] });
  });

  it("leaves out a subshell that only one atom has: sodium's 3s is not neon's", () => {
    expect(compare('Na', 'Ne')).toEqual({ higher: ['1s', '2s', '2p'], lower: [], same: [] });
  });

  it('compares the one shared peak of hydrogen and calcium', () => {
    expect(compare('H', 'Ca')).toEqual({ higher: [], lower: ['1s'], same: [] });
  });

  it('puts every peak of an atom the same as its own', () => {
    expect(compare('Si', 'Si')).toEqual({ higher: [], lower: [], same: ['1s', '2s', '2p', '3s', '3p'] });
  });

  it('has no tie between two different atoms, so the readouts never need a sentence for one', () => {
    for (const a of SYMBOLS) {
      for (const b of SYMBOLS) {
        if (a !== b) expect(compare(a, b).same, `${a} and ${b}`).toEqual([]);
      }
    }
  });

  // The comparison readout describes a mixed result by one odd peak against
  // the rest. These are the only four mixed pairs among the twenty atoms.
  it('has a mixed result only for N and O, and S and P, and then with one odd peak', () => {
    const mixed: string[] = [];
    for (const a of SYMBOLS) {
      for (const b of SYMBOLS) {
        const { higher, lower } = compare(a, b);
        if (higher.length > 0 && lower.length > 0) {
          mixed.push(`${a}/${b}`);
          expect(Math.min(higher.length, lower.length), `${a}/${b}`).toBe(1);
        }
      }
    }
    expect(mixed.sort()).toEqual(['N/O', 'O/N', 'P/S', 'S/P']);
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => compare('Xx', 'Si')).toThrow('"Xx"');
    expect(() => compare('Si', 'Zz')).toThrow('"Zz"');
  });
});

describe('readout', () => {
  it('gives the single peak of hydrogen', () => {
    expect(readout('H')).toBe('Hydrogen, 1s¹: one peak, at 1.31 MJ/mol.');
  });

  it('gives the single peak of helium with its two electrons', () => {
    expect(readout('He')).toBe('Helium, 1s²: one peak, at 2.37 MJ/mol.');
  });

  it('names the most strongly and the least strongly held electrons of silicon', () => {
    expect(readout('Si')).toBe(
      'Silicon, 1s² 2s² 2p⁶ 3s² 3p²: five peaks. The 1s electrons are held most strongly, at 178 MJ/mol. ' +
        'The 3p electrons are the easiest to remove, at 0.79 MJ/mol.',
    );
  });

  it('says "electron" and "is" when the outermost subshell holds one', () => {
    expect(readout('Na')).toBe(
      'Sodium, 1s² 2s² 2p⁶ 3s¹: four peaks. The 1s electrons are held most strongly, at 104 MJ/mol. ' +
        'The 3s electron is the easiest to remove, at 0.50 MJ/mol.',
    );
  });

  it('counts the peaks in words from one to six', () => {
    const words = ['one', 'two', 'three', 'four', 'five', 'six'];
    const seen = new Set<number>();
    for (const element of PES_ELEMENTS) {
      const count = element.peaks.length;
      seen.add(count);

      expect(readout(element.symbol), element.symbol).toContain(`: ${words[count - 1]} peak${count === 1 ? ',' : 's.'}`);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('keeps the figures of an energy written with a trailing zero', () => {
    expect(readout('Ne')).toContain('at 84.0 MJ/mol');
    expect(readout('Be')).toContain('at 0.90 MJ/mol');
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => readout('Xx')).toThrow('"Xx"');
  });
});

describe('comparisonReadout', () => {
  it('says every shared peak is higher when the first atom has more protons and no exception applies', () => {
    expect(comparisonReadout('Si', 'Al')).toBe(
      "Every peak silicon shares with aluminum lies at a higher binding energy in silicon, whose nucleus has 14 protons to aluminum's 13.",
    );
  });

  it('says every shared peak is lower when the first atom has fewer protons', () => {
    expect(comparisonReadout('Al', 'Si')).toBe(
      "Every peak aluminum shares with silicon lies at a lower binding energy in aluminum, whose nucleus has 13 protons to silicon's 14.",
    );
  });

  it('points out the exception: oxygen against nitrogen', () => {
    expect(comparisonReadout('O', 'N')).toBe(
      "Oxygen has 8 protons to nitrogen's 7, and its 1s and 2s peaks lie at higher binding energies. " +
        'Its 2p peak is lower, 1.31 against 1.40 MJ/mol: topic 1.7 explains why.',
    );
  });

  it('points out the exception the other way round: nitrogen against oxygen', () => {
    expect(comparisonReadout('N', 'O')).toBe(
      "Nitrogen has 7 protons to oxygen's 8, and its 1s and 2s peaks lie at lower binding energies. " +
        'Its 2p peak is higher, 1.40 against 1.31 MJ/mol: topic 1.7 explains why.',
    );
  });

  it('points out the exception for sulfur and phosphorus, listing four peaks', () => {
    expect(comparisonReadout('S', 'P')).toBe(
      "Sulfur has 16 protons to phosphorus's 15, and its 1s, 2s, 2p and 3s peaks lie at higher binding energies. " +
        'Its 3p peak is lower, 1.00 against 1.01 MJ/mol: topic 1.7 explains why.',
    );
    expect(comparisonReadout('P', 'S')).toBe(
      "Phosphorus has 15 protons to sulfur's 16, and its 1s, 2s, 2p and 3s peaks lie at lower binding energies. " +
        'Its 3p peak is higher, 1.01 against 1.00 MJ/mol: topic 1.7 explains why.',
    );
  });

  it('writes "1 proton", not "1 protons", for hydrogen', () => {
    expect(comparisonReadout('H', 'Ca')).toBe(
      "Every peak hydrogen shares with calcium lies at a lower binding energy in hydrogen, whose nucleus has 1 proton to calcium's 20.",
    );
    expect(comparisonReadout('Ca', 'H')).toBe(
      "Every peak calcium shares with hydrogen lies at a higher binding energy in calcium, whose nucleus has 20 protons to hydrogen's 1.",
    );
  });

  it('writes a sentence for every pair of different atoms, in which both names appear and no number is left unwritten', () => {
    for (const a of PES_ELEMENTS) {
      for (const b of PES_ELEMENTS) {
        if (a === b) continue;

        const text = comparisonReadout(a.symbol, b.symbol);

        expect(text, `${a.symbol}/${b.symbol}`).toMatch(/[.]$/);
        expect(text.toLowerCase(), `${a.symbol}/${b.symbol}`).toContain(a.name.toLowerCase());
        expect(text.toLowerCase(), `${a.symbol}/${b.symbol}`).toContain(b.name.toLowerCase());
        expect(text, `${a.symbol}/${b.symbol}`).not.toMatch(/undefined|NaN|\[object/);
      }
    }
  });

  it('rejects comparing an atom with itself, and says what to give instead', () => {
    expect(() => comparisonReadout('Si', 'Si')).toThrow('different');
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => comparisonReadout('Xx', 'Si')).toThrow('"Xx"');
    expect(() => comparisonReadout('Si', 'Zz')).toThrow('"Zz"');
  });
});

describe('labelAnchor', () => {
  // 2s and 2p of calcium are 0.0247 of the axis apart, the closest pair of
  // all; 2p is the taller, so only 2s moves its label.
  it('moves the label of calcium 2s away from the taller 2p, and leaves the 2p label over its peak', () => {
    expect(labelAnchor('Ca', '2s')).toBe('end');
    expect(labelAnchor('Ca', '2p')).toBe('middle');
  });

  it('splits carbon 2s and 2p, which are as tall as each other, to the two sides', () => {
    expect(labelAnchor('C', '2s')).toBe('end');
    expect(labelAnchor('C', '2p')).toBe('start');
  });

  it('moves the label when the taller neighbor is 0.0581 away (magnesium) and not when it is 0.0676 away (sodium)', () => {
    expect(labelAnchor('Mg', '2s')).toBe('end');
    expect(labelAnchor('Na', '2s')).toBe('middle');
  });

  it('leaves a label over its peak when no taller neighbor is near', () => {
    expect(labelAnchor('Si', '3s')).toBe('middle');
    expect(labelAnchor('H', '1s')).toBe('middle');
  });

  it('never has a taller neighbor close on both sides of a peak, which no anchor could fix', () => {
    for (const element of PES_ELEMENTS) {
      for (const peak of element.peaks) {
        const near = element.peaks.filter(
          (other) =>
            other !== peak &&
            other.electrons >= peak.electrons &&
            Math.abs(energyFraction(other.energy) - energyFraction(peak.energy)) <= 0.06,
        );
        const sides = new Set(near.map((other) => Math.sign(energyFraction(other.energy) - energyFraction(peak.energy))));

        expect(sides.size, `${element.symbol} ${peak.subshell}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('rejects an atom or a subshell it does not have, naming it', () => {
    expect(() => labelAnchor('Xx', '1s')).toThrow('"Xx"');
    expect(() => labelAnchor('Si', '4s')).toThrow('4s');
    expect(() => labelAnchor('Si', '4s')).toThrow('silicon');
  });
});

describe('layout', () => {
  it('keeps every two peaks of one atom at least 0.024 of the axis apart', () => {
    let closest = Number.POSITIVE_INFINITY;
    for (const element of PES_ELEMENTS) {
      const places = element.peaks.map((peak) => energyFraction(peak.energy));
      for (let i = 1; i < places.length; i++) closest = Math.min(closest, Math.abs((places[i] ?? 0) - (places[i - 1] ?? 0)));
    }

    expect(closest).toBeGreaterThanOrEqual(0.024);
    expectWithin(closest, 0.0247, 0.0001);
  });
});

describe('energyTable', () => {
  const FILLING_ORDER = ['1s', '2s', '2p', '3s', '3p', '4s'];

  it('lists the subshell, the electrons and the energy of each peak of the chosen atom, tagged as not compared', () => {
    const table = energyTable('Si');

    expect(table.compared).toBe(false);
    expect(table.rows).toEqual([
      { subshell: '1s', electrons: 2, energy: '178' },
      { subshell: '2s', electrons: 2, energy: '15.1' },
      { subshell: '2p', electrons: 6, energy: '10.3' },
      { subshell: '3s', electrons: 2, energy: '1.46' },
      { subshell: '3p', electrons: 2, energy: '0.79' },
    ]);
  });

  it('has no "other" field at all in a table that is not compared', () => {
    for (const row of energyTable('Si').rows) expect(Object.hasOwn(row, 'other'), row.subshell).toBe(false);
  });

  it('adds the other atom, tagged as compared, with undefined for a subshell it lacks', () => {
    const table = energyTable('Na', 'Ne');

    expect(table.compared).toBe(true);
    expect(table.rows).toEqual([
      { subshell: '1s', electrons: 2, energy: '104', other: '84.0' },
      { subshell: '2s', electrons: 2, energy: '6.84', other: '4.68' },
      { subshell: '2p', electrons: 6, energy: '3.67', other: '2.08' },
      { subshell: '3s', electrons: 1, energy: '0.50', other: undefined },
    ]);
    const last = table.rows[3];
    expect(Object.hasOwn(last ?? {}, 'other'), 'the field is there, with no value').toBe(true);
  });

  // Hydrogen against calcium: five of calcium's six peaks are drawn, so the table lists them.
  it('lists every subshell either atom has: hydrogen against calcium has six rows', () => {
    const table = energyTable('H', 'Ca');

    expect(table.rows).toEqual([
      { subshell: '1s', electrons: 1, energy: '1.31', other: '390' },
      { subshell: '2s', electrons: undefined, energy: undefined, other: '42.7' },
      { subshell: '2p', electrons: undefined, energy: undefined, other: '34.0' },
      { subshell: '3s', electrons: undefined, energy: undefined, other: '4.65' },
      { subshell: '3p', electrons: undefined, energy: undefined, other: '2.90' },
      { subshell: '4s', electrons: undefined, energy: undefined, other: '0.59' },
    ]);
    for (const row of table.rows.slice(1)) {
      expect(Object.hasOwn(row, 'electrons'), row.subshell).toBe(true);
      expect(Object.hasOwn(row, 'energy'), row.subshell).toBe(true);
    }
  });

  it('lists every subshell either atom has: calcium against hydrogen has six rows, the other atom lacking five', () => {
    expect(energyTable('Ca', 'H').rows).toEqual([
      { subshell: '1s', electrons: 2, energy: '390', other: '1.31' },
      { subshell: '2s', electrons: 2, energy: '42.7', other: undefined },
      { subshell: '2p', electrons: 6, energy: '34.0', other: undefined },
      { subshell: '3s', electrons: 2, energy: '4.65', other: undefined },
      { subshell: '3p', electrons: 6, energy: '2.90', other: undefined },
      { subshell: '4s', electrons: 2, energy: '0.59', other: undefined },
    ]);
  });

  it('lists oxygen against nitrogen as three rows with both energies', () => {
    expect(energyTable('O', 'N').rows).toEqual([
      { subshell: '1s', electrons: 2, energy: '52.6', other: '39.6' },
      { subshell: '2s', electrons: 2, energy: '3.12', other: '2.45' },
      { subshell: '2p', electrons: 4, energy: '1.31', other: '1.40' },
    ]);
  });

  it('has one row for each peak of an atom that is not compared, for every atom', () => {
    for (const element of PES_ELEMENTS) expect(energyTable(element.symbol).rows, element.symbol).toHaveLength(element.peaks.length);
  });

  it('has, for every pair, one row for each subshell either has, in filling order, each with some energy', () => {
    for (const a of PES_ELEMENTS) {
      for (const b of PES_ELEMENTS) {
        if (a === b) continue;
        const wanted = FILLING_ORDER.filter((name) => [...a.peaks, ...b.peaks].some((peak) => peak.subshell === name));

        const rows = energyTable(a.symbol, b.symbol).rows;

        expect(rows.map((row) => row.subshell), `${a.symbol}/${b.symbol}`).toEqual(wanted);
        for (const row of rows) {
          const compared = row as { energy?: string; other?: string };
          expect(compared.energy !== undefined || compared.other !== undefined, `${a.symbol}/${b.symbol} ${row.subshell}`).toBe(true);
        }
      }
    }
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => energyTable('Xx')).toThrow('"Xx"');
    expect(() => energyTable('Si', 'Zz')).toThrow('"Zz"');
  });

  it('rejects comparing an atom with itself', () => {
    expect(() => energyTable('Si', 'Si')).toThrow('different');
  });
});

describe('opening', () => {
  it('is the first sentence of the readout: the atom, its configuration and the number of peaks', () => {
    expect(opening('O')).toBe('Oxygen, 1s² 2s² 2p⁴: three peaks.');
    expect(opening('Si')).toBe('Silicon, 1s² 2s² 2p⁶ 3s² 3p²: five peaks.');
    expect(opening('Ca')).toBe('Calcium, 1s² 2s² 2p⁶ 3s² 3p⁶ 4s²: six peaks.');
  });

  it('says "one peak" for hydrogen and helium', () => {
    expect(opening('H')).toBe('Hydrogen, 1s¹: one peak.');
    expect(opening('He')).toBe('Helium, 1s²: one peak.');
  });

  it('begins the readout of every atom with more than one peak', () => {
    for (const element of PES_ELEMENTS) {
      if (element.peaks.length > 1) expect(readout(element.symbol).startsWith(opening(element.symbol)), element.symbol).toBe(true);
    }
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => opening('Xx')).toThrow('"Xx"');
  });
});

describe('tableCaption', () => {
  it('names the atom when nothing is compared', () => {
    expect(tableCaption('Si')).toBe('Silicon: the electrons in each subshell and their binding energies');
  });

  // The compared atom's electron counts are in no column, so the caption gives its configuration.
  it('names both atoms and gives the compared atom\'s configuration', () => {
    expect(tableCaption('O', 'N')).toBe(
      "Oxygen (O) and nitrogen (N), binding energies in MJ/mol. The electron counts are oxygen's; nitrogen's configuration is 1s² 2s² 2p³.",
    );
    expect(tableCaption('H', 'Ca')).toContain("calcium's configuration is 1s² 2s² 2p⁶ 3s² 3p⁶ 4s².");
  });

  it('rejects a symbol that is not one of the twenty, and an atom compared with itself', () => {
    expect(() => tableCaption('Xx')).toThrow('"Xx"');
    expect(() => tableCaption('Si', 'Zz')).toThrow('"Zz"');
    expect(() => tableCaption('Si', 'Si')).toThrow('different');
  });
});

describe('describeSpectrum', () => {
  it('describes the starting drawing: five peaks and their heights', () => {
    expect(describeSpectrum('Si')).toBe(
      'Photoelectron spectrum of silicon: five peaks, 1s, 2s, 2p, 3s and 3p, from the highest binding energy at the left to the lowest at the right. ' +
        'The height of each peak is its number of electrons: 2, 2, 6, 2 and 2.',
    );
  });

  it('describes one peak without a list', () => {
    expect(describeSpectrum('H')).toBe(
      'Photoelectron spectrum of hydrogen: one peak, 1s, at 1.31 MJ/mol. The height of the peak is its number of electrons: 1.',
    );
  });

  // Its heights are drawn but described nowhere else, so the configuration carries them.
  it("adds the dashed outlines of the atom compared with, and that atom's configuration", () => {
    expect(describeSpectrum('O', 'N')).toContain(
      "Dashed outlines behind the peaks show nitrogen's peaks, for comparison. Nitrogen's configuration is 1s² 2s² 2p³.",
    );
    expect(describeSpectrum('H', 'Ca')).toContain("Calcium's configuration is 1s² 2s² 2p⁶ 3s² 3p⁶ 4s².");
    expect(describeSpectrum('O')).not.toContain('Dashed');
  });

  it('rejects a symbol that is not one of the twenty, naming it', () => {
    expect(() => describeSpectrum('Xx')).toThrow('"Xx"');
    expect(() => describeSpectrum('Si', 'Zz')).toThrow('"Zz"');
  });
});
