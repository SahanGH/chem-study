import { describe, expect, it } from 'vitest';
import apMasses from './fixtures/ap-atomic-masses.json';
import { elementBySymbol, elements, tablePosition, type Element } from '../../src/data/elements';

// A second reader's list of the exam's 118 cells, made without looking at the
// module's own source data, so a misread cell shows up as a difference.
const apMassBySymbol = new Map<string, string | null>(Object.entries(apMasses));

function requireElement(symbol: string): Element {
  const found = elementBySymbol(symbol);
  if (!found) throw new Error(`Test setup: no element ${symbol}`);
  return found;
}

describe('the element list', () => {
  it('has 118 elements with atomic numbers 1 to 118 in order', () => {
    expect(elements).toHaveLength(118);
    expect(elements.map((e) => e.z)).toEqual(Array.from({ length: 118 }, (_, i) => i + 1));
  });

  it('gives every element a unique symbol and name', () => {
    expect(new Set(elements.map((e) => e.symbol)).size).toBe(118);
    expect(new Set(elements.map((e) => e.name)).size).toBe(118);
  });

  it('writes every symbol as one capital letter and at most one lowercase letter', () => {
    for (const e of elements) expect(e.symbol, `Z=${e.z}`).toMatch(/^[A-Z][a-z]?$/);
  });
});

describe('atomic masses as the exam prints them', () => {
  it('has 84 masses and 34 elements with none', () => {
    expect(elements.filter((e) => e.mass !== null)).toHaveLength(84);
    expect(elements.filter((e) => e.mass === null)).toHaveLength(34);
  });

  it('writes every mass as digits, a point and digits', () => {
    for (const e of elements) {
      if (e.mass !== null) expect(e.mass, e.symbol).toMatch(/^\d+\.\d+$/);
    }
  });

  it('keeps two decimal places except for hydrogen and lead', () => {
    for (const e of elements) {
      if (e.mass === null || e.symbol === 'H' || e.symbol === 'Pb') continue;
      expect(e.mass, e.symbol).toMatch(/^\d+\.\d{2}$/);
    }
    expect(requireElement('H').mass).toBe('1.008');
    expect(requireElement('Pb').mass).toBe('207.2');
  });

  it('equals the second reader of the exam table for every element', () => {
    expect(apMassBySymbol.size).toBe(118);
    for (const e of elements) {
      expect(apMassBySymbol.has(e.symbol), `${e.symbol} is in the fixture`).toBe(true);
      expect(e.mass, e.symbol).toBe(apMassBySymbol.get(e.symbol));
    }
  });

  it.each([
    ['He', '4.00'],
    ['C', '12.01'],
    ['O', '16.00'],
    ['S', '32.06'],
    ['Cl', '35.45'],
    ['Cu', '63.55'],
    ['Zn', '65.38'],
    ['Te', '127.60'],
    ['I', '126.90'],
    ['U', '238.03'],
  ])('gives %s the mass %s', (symbol, mass) => {
    expect(requireElement(symbol).mass).toBe(mass);
  });

  it.each(['Tc', 'Pm', 'Po', 'Rn', 'Ac', 'Np', 'Lr', 'Rf', 'Og'])('prints no mass for %s', (symbol) => {
    expect(requireElement(symbol).mass).toBeNull();
  });

  it.each(['Th', 'Pa', 'U'])('prints a mass for %s', (symbol) => {
    expect(requireElement(symbol).mass).not.toBeNull();
  });
});

describe('names', () => {
  it.each([
    ['Al', 'Aluminum'],
    ['Cs', 'Cesium'],
    ['S', 'Sulfur'],
    ['W', 'Tungsten'],
    ['Og', 'Oganesson'],
  ])('names %s %s', (symbol, name) => {
    expect(requireElement(symbol).name).toBe(name);
  });
});

describe('blocks, periods and groups', () => {
  it('has 14 s, 36 p, 38 d and 30 f elements', () => {
    const count = (block: string) => elements.filter((e) => e.block === block).length;
    expect([count('s'), count('p'), count('d'), count('f')]).toEqual([14, 36, 38, 30]);
  });

  it('puts helium in the s block', () => {
    expect(requireElement('He').block).toBe('s');
  });

  it('has 2, 8, 8, 18, 18, 32 and 32 elements in periods 1 to 7', () => {
    const sizes = [1, 2, 3, 4, 5, 6, 7].map((period) => elements.filter((e) => e.period === period).length);
    expect(sizes).toEqual([2, 8, 8, 18, 18, 32, 32]);
  });

  it('counts the elements of groups 1, 2, 3 and 18', () => {
    const inGroup = (group: number) => elements.filter((e) => e.group === group);
    expect(inGroup(1)).toHaveLength(7);
    expect(inGroup(2)).toHaveLength(6);
    expect(inGroup(3).map((e) => e.symbol)).toEqual(['Sc', 'Y']);
    expect(inGroup(18)).toHaveLength(7);
  });

  it('gives the thirty lanthanoids and actinoids no group', () => {
    const withoutGroup = elements.filter((e) => e.group === null);
    expect(withoutGroup).toHaveLength(30);
    for (const e of withoutGroup) {
      expect(e.block, e.symbol).toBe('f');
      expect((e.z >= 57 && e.z <= 71) || (e.z >= 89 && e.z <= 103), e.symbol).toBe(true);
    }
  });
});

describe('tablePosition', () => {
  it.each([
    ['H', 1, 1],
    ['He', 1, 18],
    ['B', 2, 13],
    ['Sc', 4, 3],
    ['Hf', 6, 4],
    ['Og', 7, 18],
    ['La', 9, 3],
    ['Lu', 9, 17],
    ['Ac', 10, 3],
    ['Lr', 10, 17],
  ])('puts %s at row %i, column %i', (symbol, row, column) => {
    expect(tablePosition(requireElement(symbol))).toEqual({ row, column });
  });

  it('gives all 118 elements different positions', () => {
    const spots = new Set(elements.map((e) => JSON.stringify(tablePosition(e))));
    expect(spots.size).toBe(118);
  });

  it('leaves (6, 3) and (7, 3) free for the placeholders of the two series', () => {
    const spots = elements.map(tablePosition);
    expect(spots.some((p) => p.row === 6 && p.column === 3)).toBe(false);
    expect(spots.some((p) => p.row === 7 && p.column === 3)).toBe(false);
  });

  it('keeps every element inside rows 1-7 and 9-10 and columns 1-18, never in row 8', () => {
    for (const p of elements.map(tablePosition)) {
      expect(p.row === 8 || p.row < 1 || p.row > 10).toBe(false);
      expect(p.column).toBeGreaterThanOrEqual(1);
      expect(p.column).toBeLessThanOrEqual(18);
    }
  });

  it.each([
    ['just below the lanthanoids', 56],
    ['just above the lanthanoids', 72],
    ['just below the actinoids', 88],
    ['just above the actinoids', 104],
    ['the first element', 1],
  ])('throws, naming the element, for an element with no group %s (Z = %i)', (_where, z) => {
    const stray: Element = { z, symbol: 'Xx', name: 'Strayium', mass: null, group: null, period: 6, block: 'f' };

    expect(() => tablePosition(stray)).toThrow(/Strayium/);
  });
});

describe('elementBySymbol', () => {
  it('finds iron', () => {
    const iron = elementBySymbol('Fe');
    expect(iron?.name).toBe('Iron');
    expect(iron?.z).toBe(26);
  });

  it('returns undefined for a symbol that is not an element', () => {
    expect(elementBySymbol('Xx')).toBeUndefined();
  });

  it('is case sensitive: "fe" is not iron', () => {
    expect(elementBySymbol('fe')).toBeUndefined();
  });
});
