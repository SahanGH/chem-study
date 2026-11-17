import { describe, expect, it } from 'vitest';
import { elementBySymbol } from '../../src/data/elements';
import {
  DIRECTIONS,
  GROUPS,
  PERIODS,
  PROPERTIES,
  TREND_ELEMENTS,
  describeSeries,
  elementOf,
  orderTitle,
  readout,
  series,
  seriesHeading,
  shadeLevel,
  shownValue,
  valueOf,
  valueText,
} from '../../src/lib/periodic-trends';

// Written out apart from the module, from the plan's table: symbol, group,
// radius in pm (null for a noble gas), first ionization energy in kJ/mol and
// electronegativity as text (null for a noble gas), in order of atomic number.
const TABLE: readonly (readonly [string, number, number | null, number, string | null])[] = [
  ['H', 1, 31, 1312, '2.2'],
  ['He', 18, null, 2372, null],
  ['Li', 1, 128, 520, '1.0'],
  ['Be', 2, 96, 900, '1.6'],
  ['B', 13, 84, 801, '2.0'],
  ['C', 14, 76, 1086, '2.6'],
  ['N', 15, 71, 1402, '3.0'],
  ['O', 16, 66, 1314, '3.4'],
  ['F', 17, 57, 1681, '4.0'],
  ['Ne', 18, null, 2081, null],
  ['Na', 1, 166, 496, '0.9'],
  ['Mg', 2, 141, 738, '1.3'],
  ['Al', 13, 121, 578, '1.6'],
  ['Si', 14, 111, 787, '1.9'],
  ['P', 15, 107, 1012, '2.2'],
  ['S', 16, 105, 1000, '2.6'],
  ['Cl', 17, 102, 1251, '3.2'],
  ['Ar', 18, null, 1521, null],
  ['K', 1, 203, 419, '0.8'],
  ['Ca', 2, 176, 590, '1.0'],
  ['Ga', 13, 122, 579, '1.8'],
  ['Ge', 14, 120, 762, '2.0'],
  ['As', 15, 119, 944, '2.2'],
  ['Se', 16, 120, 941, '2.6'],
  ['Br', 17, 120, 1140, '3.0'],
  ['Kr', 18, null, 1351, null],
  ['Rb', 1, 220, 403, '0.8'],
  ['Sr', 2, 195, 549, '1.0'],
  ['In', 13, 142, 558, '1.8'],
  ['Sn', 14, 139, 709, '2.0'],
  ['Sb', 15, 139, 831, '2.1'],
  ['Te', 16, 138, 869, '2.1'],
  ['I', 17, 139, 1008, '2.7'],
  ['Xe', 18, null, 1170, null],
];
const NOBLE_GASES = ['He', 'Ne', 'Ar', 'Kr', 'Xe'];

const asPairs = (items: readonly { readonly symbol: string; readonly value: number }[]) =>
  items.map((item) => [item.symbol, item.value]);

describe('TREND_ELEMENTS', () => {
  it('holds the 34 main-group elements of periods 1 to 5, in order of atomic number', () => {
    expect(TREND_ELEMENTS).toHaveLength(34);
    expect(TREND_ELEMENTS.map((element) => element.symbol)).toEqual(TABLE.map(([symbol]) => symbol));
    const zs = TREND_ELEMENTS.map((element) => element.z);
    expect(zs).toEqual([...zs].sort((a, b) => a - b));
  });

  it('holds 2, 8, 8, 8 and 8 elements in periods 1 to 5', () => {
    const counts = [1, 2, 3, 4, 5].map((period) => TREND_ELEMENTS.filter((element) => element.period === period).length);

    expect(counts).toEqual([2, 8, 8, 8, 8]);
  });

  it('takes each name, group and period from the element data', () => {
    for (const element of TREND_ELEMENTS) {
      const source = elementBySymbol(element.symbol);

      expect(element.name, element.symbol).toBe(source?.name);
      expect(element.group, element.symbol).toBe(source?.group);
      expect(element.period, element.symbol).toBe(source?.period);
      expect(element.z, element.symbol).toBe(source?.z);
    }
    expect(elementOf('S').name).toBe('Sulfur');
  });

  it("gives every group as the table does and every value as the plan's table does", () => {
    TABLE.forEach(([symbol, group, radius, ie1, en]) => {
      const element = elementOf(symbol);

      expect(element.group, symbol).toBe(group);
      expect(element.radius, symbol).toBe(radius);
      expect(element.ie1, symbol).toBe(ie1);
      expect(element.en, symbol).toBe(en);
    });
  });

  it('holds 34 ionization energies, 29 radii and 29 electronegativities, the five nulls all in group 18', () => {
    const withRadius = TREND_ELEMENTS.filter((element) => element.radius !== null);
    const withEn = TREND_ELEMENTS.filter((element) => element.en !== null);
    const noRadius = TREND_ELEMENTS.filter((element) => element.radius === null);
    const noEn = TREND_ELEMENTS.filter((element) => element.en === null);

    expect(TREND_ELEMENTS.filter((element) => Number.isFinite(element.ie1))).toHaveLength(34);
    expect(withRadius).toHaveLength(29);
    expect(withEn).toHaveLength(29);
    expect(noRadius.map((element) => element.symbol)).toEqual(NOBLE_GASES);
    expect(noEn.map((element) => element.symbol)).toEqual(NOBLE_GASES);
    for (const element of [...noRadius, ...noEn]) expect(element.group, element.symbol).toBe(18);
  });

  it('keeps electronegativity as text with one decimal place, so 1.0 and 4.0 keep their zero', () => {
    for (const element of TREND_ELEMENTS) {
      if (element.en !== null) expect(element.en, element.symbol).toMatch(/^\d\.\d$/);
    }
    expect(elementOf('Li').en).toBe('1.0');
    expect(elementOf('F').en).toBe('4.0');
  });

  it('is the same list of elements that GROUPS and PERIODS describe', () => {
    expect(GROUPS).toEqual([1, 2, 13, 14, 15, 16, 17, 18]);
    expect(PERIODS).toEqual([1, 2, 3, 4, 5]);
    for (const element of TREND_ELEMENTS) {
      expect(GROUPS, element.symbol).toContain(element.group);
      expect(PERIODS, element.symbol).toContain(element.period);
    }
  });
});

describe('PROPERTIES', () => {
  it('names the three properties, with their units and fixed axes starting at 0', () => {
    expect(PROPERTIES.radius).toMatchObject({ label: 'Atomic radius', unit: 'pm', axis: { min: 0, max: 250 } });
    expect(PROPERTIES.ie1).toMatchObject({ label: 'First ionization energy', unit: 'kJ/mol', axis: { min: 0, max: 2500 } });
    expect(PROPERTIES.en).toMatchObject({ label: 'Electronegativity', unit: null, axis: { min: 0, max: 4 } });
  });

  it('puts every shown value on its property axis, and gives ticks that start at the axis minimum and end at its maximum', () => {
    for (const [name, property] of Object.entries(PROPERTIES)) {
      expect(property.ticks[0], name).toBe(property.axis.min);
      expect(property.ticks[property.ticks.length - 1], name).toBe(property.axis.max);
    }
    for (const element of TREND_ELEMENTS) {
      for (const name of ['radius', 'ie1', 'en'] as const) {
        const value = valueOf(element.symbol, name);
        if (value === null) continue;
        expect(value, `${element.symbol} ${name}`).toBeGreaterThanOrEqual(PROPERTIES[name].axis.min);
        expect(value, `${element.symbol} ${name}`).toBeLessThanOrEqual(PROPERTIES[name].axis.max);
      }
    }
  });

  it('gives each axis title in lowercase words, with the unit in its own letters, in brackets', () => {
    for (const [name, property] of Object.entries(PROPERTIES)) {
      const words = property.unit === null ? property.axisTitle : property.axisTitle.replace(property.unit, '');

      expect(property.axisTitle, name).not.toBe('');
      expect(words, name).toBe(words.toLowerCase());
      if (property.unit !== null) expect(property.axisTitle.endsWith(`(${property.unit})`), name).toBe(true);
    }
    expect(PROPERTIES.ie1.axisTitle).toBe('first ionization energy (kJ/mol)');
    expect(PROPERTIES.en.axisTitle).toBe('electronegativity');
  });
});

describe('valueOf', () => {
  it('gives sulfur’s ionization energy, radius and electronegativity as numbers', () => {
    expect(valueOf('S', 'ie1')).toBe(1000);
    expect(valueOf('S', 'radius')).toBe(105);
    expect(valueOf('S', 'en')).toBe(2.6);
  });

  it('gives null where none is shown for a noble gas', () => {
    expect(valueOf('Ar', 'radius')).toBeNull();
    expect(valueOf('Ar', 'en')).toBeNull();
    expect(valueOf('Ar', 'ie1')).toBe(1521);
  });

  it('throws, naming the symbol, for one that is not among the 34', () => {
    expect(() => valueOf('Zz', 'ie1')).toThrowError(/"Zz"/);
    expect(() => valueOf('Fe', 'ie1')).toThrowError(/"Fe"/);
    expect(() => valueOf('', 'ie1')).toThrowError(/""/);
  });

  it('throws, naming the property, for one that is not offered', () => {
    // @ts-expect-error a property the module does not have
    expect(() => valueOf('S', 'mass')).toThrowError(/"mass"/);
  });
});

describe('shownValue and valueText', () => {
  it('writes the value with its unit, or "no value"', () => {
    expect(shownValue('P', 'radius')).toBe('107 pm');
    expect(shownValue('P', 'ie1')).toBe('1012 kJ/mol');
    expect(shownValue('P', 'en')).toBe('2.2');
    expect(shownValue('Ne', 'en')).toBe('no value');
    expect(shownValue('Ne', 'radius')).toBe('no value');
  });

  it('keeps the zero of an electronegativity written to one decimal place', () => {
    expect(shownValue('Li', 'en')).toBe('1.0');
    expect(shownValue('F', 'en')).toBe('4.0');
  });

  it('gives the bare value without its unit, or null where none is shown', () => {
    expect(valueText('P', 'radius')).toBe('107');
    expect(valueText('P', 'ie1')).toBe('1012');
    expect(valueText('F', 'en')).toBe('4.0');
    expect(valueText('Xe', 'radius')).toBeNull();
    expect(valueText('Xe', 'en')).toBeNull();
  });

  it('throws, naming the symbol or the property, for an unknown one', () => {
    expect(() => shownValue('Q', 'ie1')).toThrowError(/"Q"/);
    expect(() => valueText('Q', 'ie1')).toThrowError(/"Q"/);
    // @ts-expect-error a property the module does not have
    expect(() => shownValue('S', 'density')).toThrowError(/"density"/);
  });
});

describe('shadeLevel', () => {
  it('puts the largest value in band 4 and the smallest in band 0', () => {
    expect(shadeLevel('He', 'ie1')).toBe(4);
    expect(shadeLevel('Rb', 'ie1')).toBe(0);
    expect(shadeLevel('Rb', 'radius')).toBe(4);
    expect(shadeLevel('H', 'radius')).toBe(0);
    expect(shadeLevel('F', 'en')).toBe(4);
    expect(shadeLevel('K', 'en')).toBe(0);
    expect(shadeLevel('Rb', 'en')).toBe(0);
  });

  it('puts sulfur in band 1: 1000 is 30.3 percent of the way from 403 to 2372', () => {
    expect(shadeLevel('S', 'ie1')).toBe(1);
  });

  it('gives null where there is no value', () => {
    expect(shadeLevel('Ne', 'radius')).toBeNull();
    expect(shadeLevel('Ne', 'en')).toBeNull();
    // Neon's ionization energy is shown, and 2081 is 85.2 percent of the way up.
    expect(shadeLevel('Ne', 'ie1')).toBe(4);
  });

  it('places values in the middle bands as the percentage of the range says', () => {
    // radius: 31 to 220 (189 wide); electronegativity: 0.8 to 4.0 (3.2 wide).
    expect(shadeLevel('Cl', 'radius')).toBe(1); // 37.6 percent
    expect(shadeLevel('Mg', 'radius')).toBe(2); // 58.2 percent
    expect(shadeLevel('Na', 'radius')).toBe(3); // 71.4 percent
    expect(shadeLevel('K', 'radius')).toBe(4); // 91.0 percent
    expect(shadeLevel('Li', 'en')).toBe(0); // 6.3 percent
    expect(shadeLevel('Al', 'en')).toBe(1); // 25.0 percent
    expect(shadeLevel('C', 'en')).toBe(2); // 56.3 percent
    expect(shadeLevel('N', 'en')).toBe(3); // 68.8 percent
    expect(shadeLevel('O', 'en')).toBe(4); // 81.3 percent
  });

  it('never gives a larger value a lower band, and uses all five bands, for every property', () => {
    for (const name of ['radius', 'ie1', 'en'] as const) {
      const shown = TREND_ELEMENTS.map((element) => ({
        symbol: element.symbol,
        value: valueOf(element.symbol, name),
        level: shadeLevel(element.symbol, name),
      })).filter((item) => item.value !== null);

      expect(shown.length, name).toBeGreaterThanOrEqual(29);
      for (const a of shown) {
        for (const b of shown) {
          if ((a.value ?? 0) > (b.value ?? 0)) {
            expect(a.level ?? -1, `${name}: ${a.symbol} against ${b.symbol}`).toBeGreaterThanOrEqual(b.level ?? 99);
          }
        }
      }
      expect(new Set(shown.map((item) => item.level)), name).toEqual(new Set([0, 1, 2, 3, 4]));
    }
  });

  it('throws, naming the symbol, for an unknown one', () => {
    expect(() => shadeLevel('Zz', 'ie1')).toThrowError(/"Zz"/);
  });
});

describe('series', () => {
  it('across a period: the elements of the period in order of group', () => {
    expect(asPairs(series('S', 'ie1', 'period'))).toEqual([
      ['Na', 496],
      ['Mg', 738],
      ['Al', 578],
      ['Si', 787],
      ['P', 1012],
      ['S', 1000],
      ['Cl', 1251],
      ['Ar', 1521],
    ]);
  });

  it('down a group: the elements of the group in order of period', () => {
    expect(asPairs(series('S', 'ie1', 'group'))).toEqual([
      ['O', 1314],
      ['S', 1000],
      ['Se', 941],
      ['Te', 869],
    ]);
  });

  it('leaves out an element that has no value, so there is no argon in the radii of period 3', () => {
    expect(asPairs(series('S', 'radius', 'period'))).toEqual([
      ['Na', 166],
      ['Mg', 141],
      ['Al', 121],
      ['Si', 111],
      ['P', 107],
      ['S', 105],
      ['Cl', 102],
    ]);
  });

  it('puts hydrogen and helium alone in period 1, and hydrogen in group 1 with the alkali metals', () => {
    expect(asPairs(series('H', 'ie1', 'period'))).toEqual([
      ['H', 1312],
      ['He', 2372],
    ]);
    expect(asPairs(series('H', 'radius', 'group'))).toEqual([
      ['H', 31],
      ['Li', 128],
      ['Na', 166],
      ['K', 203],
      ['Rb', 220],
    ]);
  });

  it('is empty for the electronegativity of a noble gas down its group', () => {
    expect(series('Ar', 'en', 'group')).toEqual([]);
    expect(series('He', 'radius', 'group')).toEqual([]);
  });

  it('gives electronegativity as numbers: halogens down group 17', () => {
    expect(asPairs(series('Br', 'en', 'group'))).toEqual([
      ['F', 4.0],
      ['Cl', 3.2],
      ['Br', 3.0],
      ['I', 2.7],
    ]);
  });

  it('gives the same series from any element of the period or group', () => {
    expect(series('Na', 'ie1', 'period')).toEqual(series('Ar', 'ie1', 'period'));
    expect(series('O', 'ie1', 'group')).toEqual(series('Te', 'ie1', 'group'));
  });

  it('holds eight values across each period from 2 to 5 (ionization energy), and only 2 in period 1', () => {
    expect(series('H', 'ie1', 'period')).toHaveLength(2);
    for (const symbol of ['Li', 'Na', 'K', 'Rb']) expect(series(symbol, 'ie1', 'period'), symbol).toHaveLength(8);
  });

  it('falls from group 2 to group 13 and from group 15 to group 16 in the first three periods, but not in period 5', () => {
    const valueAt = (symbol: string, group: number) => {
      const found = series(symbol, 'ie1', 'period').find((item) => elementOf(item.symbol).group === group);
      if (!found) throw new Error(`No value at group ${group} in the period of ${symbol}.`);
      return found.value;
    };

    // Periods 2, 3 and 4, then period 5: 549 to 558 and 831 to 869 rise.
    for (const symbol of ['Li', 'Na', 'K']) {
      expect(valueAt(symbol, 13), `${symbol}: group 2 to 13`).toBeLessThan(valueAt(symbol, 2));
      expect(valueAt(symbol, 16), `${symbol}: group 15 to 16`).toBeLessThan(valueAt(symbol, 15));
    }
    expect(valueAt('Rb', 13)).toBeGreaterThan(valueAt('Rb', 2));
    expect(valueAt('Rb', 16)).toBeGreaterThan(valueAt('Rb', 15));
  });

  it('throws, naming what was wrong, for an unknown symbol, property or direction', () => {
    expect(() => series('Zz', 'ie1', 'period')).toThrowError(/"Zz"/);
    // @ts-expect-error a property the module does not have
    expect(() => series('S', 'mass', 'period')).toThrowError(/"mass"/);
    // @ts-expect-error a direction the module does not have
    expect(() => series('S', 'ie1', 'diagonal')).toThrowError(/"diagonal"/);
    expect(DIRECTIONS).toEqual(['period', 'group']);
  });
});

describe('readout', () => {
  it('gives the three properties of an element that has them', () => {
    expect(readout('S')).toBe(
      'Sulfur: atomic radius 105 pm, first ionization energy 1000 kJ/mol, electronegativity 2.6.',
    );
  });

  it('gives only the ionization energy of a noble gas, and says why the others are missing', () => {
    expect(readout('Ar')).toBe(
      'Argon: first ionization energy 1521 kJ/mol. No atomic radius or electronegativity is shown for a noble gas: both describe an atom in a bond.',
    );
  });

  it('keeps the zero of a one-decimal electronegativity and the plain wording for hydrogen', () => {
    expect(readout('F')).toBe('Fluorine: atomic radius 57 pm, first ionization energy 1681 kJ/mol, electronegativity 4.0.');
    expect(readout('H')).toBe('Hydrogen: atomic radius 31 pm, first ionization energy 1312 kJ/mol, electronegativity 2.2.');
  });

  it('is one of the two sentences for every element', () => {
    for (const element of TREND_ELEMENTS) {
      const text = readout(element.symbol);

      expect(text.startsWith(`${element.name}: `), element.symbol).toBe(true);
      expect(text.includes('No atomic radius'), element.symbol).toBe(NOBLE_GASES.includes(element.symbol));
    }
  });

  it('throws, naming the symbol, for an unknown one', () => {
    expect(() => readout('Zz')).toThrowError(/"Zz"/);
  });
});

describe('seriesHeading and describeSeries', () => {
  it('names the property and the direction, with the period or group of the element', () => {
    expect(seriesHeading('S', 'ie1', 'period')).toBe('First ionization energy across period 3');
    expect(seriesHeading('S', 'radius', 'group')).toBe('Atomic radius down group 16');
    expect(seriesHeading('H', 'en', 'period')).toBe('Electronegativity across period 1');
  });

  it('lists every plotted value in words, with units where the property has one', () => {
    expect(describeSeries('S', 'ie1', 'period')).toBe(
      'First ionization energy across period 3, in kJ/mol: Na 496, Mg 738, Al 578, Si 787, P 1012, S 1000, Cl 1251, Ar 1521.',
    );
    expect(describeSeries('Br', 'en', 'group')).toBe('Electronegativity down group 17: F 4.0, Cl 3.2, Br 3.0, I 2.7.');
  });

  it('says there is nothing to plot, and why, for a noble gas down its group', () => {
    expect(describeSeries('Ar', 'en', 'group')).toBe(
      'Electronegativity down group 18: no values to plot, because none is shown for a noble gas.',
    );
  });

  it('throws, naming what was wrong, for an unknown symbol or direction', () => {
    expect(() => seriesHeading('Zz', 'ie1', 'period')).toThrowError(/"Zz"/);
    expect(() => describeSeries('Zz', 'ie1', 'period')).toThrowError(/"Zz"/);
  });
});

describe('orderTitle', () => {
  it('names the order the graph runs in, in lowercase, as an axis title', () => {
    expect(orderTitle('period')).toBe('in order of group');
    expect(orderTitle('group')).toBe('in order of period');
  });

  it('throws, naming the direction, for an unknown one', () => {
    // @ts-expect-error a direction the module does not have
    expect(() => orderTitle('diagonal')).toThrowError(/"diagonal"/);
  });
});
