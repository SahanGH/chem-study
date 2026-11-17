/**
 * Atomic radius, first ionization energy and electronegativity of the 34
 * main-group elements of periods 1 to 5, for the explorer in lesson 1.7. No
 * DOM here, so it is testable directly.
 *
 * Radii are covalent radii in pm (Cordero and others, 2008; carbon's is the
 * value for single bonds). Ionization energies are NIST's, in kJ/mol, rounded
 * to a whole number. Electronegativities are Pauling's, shown to one decimal
 * place and rounded half up, as lesson 2.1 states them; they are text, so
 * that 1.0 and 4.0 keep their zero.
 *
 * No radius and no electronegativity is held for a noble gas: both describe
 * an atom in a bond, and the radii the source lists for neon and argon are
 * larger than fluorine's and chlorine's, which would only mislead here. A
 * value that is not shown is `null`, everywhere in this module.
 */
import { elementBySymbol } from '../data/elements';

export const PROPERTY_NAMES = ['radius', 'ie1', 'en'] as const;
export const DIRECTIONS = ['period', 'group'] as const;

export type TrendProperty = (typeof PROPERTY_NAMES)[number];
export type TrendDirection = (typeof DIRECTIONS)[number];

export interface TrendElement {
  readonly z: number;
  readonly symbol: string;
  /** From the element data: US spelling, capitalized. */
  readonly name: string;
  readonly group: number;
  readonly period: number;
  /** In pm, or null for a noble gas. */
  readonly radius: number | null;
  /** In kJ/mol. */
  readonly ie1: number;
  /** Pauling, as text with one decimal place, or null for a noble gas. */
  readonly en: string | null;
}

type RawElement = readonly [symbol: string, radius: number | null, ie1: number, en: string | null];

const RAW: readonly RawElement[] = [
  ['H', 31, 1312, '2.2'],
  ['He', null, 2372, null],
  ['Li', 128, 520, '1.0'],
  ['Be', 96, 900, '1.6'],
  ['B', 84, 801, '2.0'],
  ['C', 76, 1086, '2.6'],
  ['N', 71, 1402, '3.0'],
  ['O', 66, 1314, '3.4'],
  ['F', 57, 1681, '4.0'],
  ['Ne', null, 2081, null],
  ['Na', 166, 496, '0.9'],
  ['Mg', 141, 738, '1.3'],
  ['Al', 121, 578, '1.6'],
  ['Si', 111, 787, '1.9'],
  ['P', 107, 1012, '2.2'],
  ['S', 105, 1000, '2.6'],
  ['Cl', 102, 1251, '3.2'],
  ['Ar', null, 1521, null],
  ['K', 203, 419, '0.8'],
  ['Ca', 176, 590, '1.0'],
  ['Ga', 122, 579, '1.8'],
  ['Ge', 120, 762, '2.0'],
  ['As', 119, 944, '2.2'],
  ['Se', 120, 941, '2.6'],
  ['Br', 120, 1140, '3.0'],
  ['Kr', null, 1351, null],
  ['Rb', 220, 403, '0.8'],
  ['Sr', 195, 549, '1.0'],
  ['In', 142, 558, '1.8'],
  ['Sn', 139, 709, '2.0'],
  ['Sb', 139, 831, '2.1'],
  ['Te', 138, 869, '2.1'],
  ['I', 139, 1008, '2.7'],
  ['Xe', null, 1170, null],
];

function buildElement([symbol, radius, ie1, en]: RawElement): TrendElement {
  const source = elementBySymbol(symbol);
  if (!source) {
    throw new Error(
      `The periodic trends data names "${symbol}", which is not in the element data (src/data/elements.ts): fix the symbol.`,
    );
  }
  if (source.group === null) {
    throw new Error(`The periodic trends data names ${source.name} (${symbol}), which has no group: give a main-group element.`);
  }
  return { z: source.z, symbol, name: source.name, group: source.group, period: source.period, radius, ie1, en };
}

/**
 * The 34 elements in order of atomic number. Within a period that is also the
 * order of group, and within a group the order of period, which `series`
 * relies on.
 */
export const TREND_ELEMENTS: readonly TrendElement[] = RAW.map(buildElement);

/** The columns of the table: groups 1, 2 and 13 to 18. */
export const GROUPS: readonly number[] = [1, 2, 13, 14, 15, 16, 17, 18];
/** The rows of the table. */
export const PERIODS: readonly number[] = [1, 2, 3, 4, 5];

interface PropertyInfo {
  readonly label: string;
  /** Null where the property has no unit. */
  readonly unit: string | null;
  /** The vertical axis of the graph: it starts at 0 and does not change with the series. */
  readonly axis: { readonly min: number; readonly max: number };
  readonly ticks: readonly number[];
  /** Lowercase words, with the unit in brackets: the title of the vertical axis. */
  readonly axisTitle: string;
}

export const PROPERTIES: Readonly<Record<TrendProperty, PropertyInfo>> = {
  radius: {
    label: 'Atomic radius',
    unit: 'pm',
    axis: { min: 0, max: 250 },
    ticks: [0, 50, 100, 150, 200, 250],
    axisTitle: 'atomic radius (pm)',
  },
  ie1: {
    label: 'First ionization energy',
    unit: 'kJ/mol',
    axis: { min: 0, max: 2500 },
    ticks: [0, 500, 1000, 1500, 2000, 2500],
    axisTitle: 'first ionization energy (kJ/mol)',
  },
  en: {
    label: 'Electronegativity',
    unit: null,
    axis: { min: 0, max: 4 },
    ticks: [0, 1, 2, 3, 4],
    axisTitle: 'electronegativity',
  },
};

/** A value from a control, or from anywhere untyped, as a property: it throws for one the module does not have. */
export function parseProperty(value: string): TrendProperty {
  const found = PROPERTY_NAMES.find((name) => name === value);
  if (found === undefined) {
    throw new Error(`There is no property "${value}": give one of ${PROPERTY_NAMES.join(', ')}.`);
  }
  return found;
}

/** A value from a control, or from anywhere untyped, as a direction: it throws for one the module does not have. */
export function parseDirection(value: string): TrendDirection {
  const found = DIRECTIONS.find((name) => name === value);
  if (found === undefined) {
    throw new Error(`There is no direction "${value}": give one of ${DIRECTIONS.join(', ')}.`);
  }
  return found;
}

/** The data for one of the 34 elements. */
export function elementOf(symbol: string): TrendElement {
  const found = TREND_ELEMENTS.find((element) => element.symbol === symbol);
  if (!found) {
    throw new Error(`There is no periodic trends data for "${symbol}": give a main-group symbol from H to Xe, such as "S".`);
  }
  return found;
}

/** The value as text without its unit, or null where none is shown. */
export function valueText(symbol: string, property: TrendProperty): string | null {
  parseProperty(property);
  const element = elementOf(symbol);
  if (property === 'en') return element.en;
  const value = property === 'radius' ? element.radius : element.ie1;
  return value === null ? null : String(value);
}

/** The value as a number, or null where none is shown. */
export function valueOf(symbol: string, property: TrendProperty): number | null {
  const text = valueText(symbol, property);
  return text === null ? null : Number(text);
}

/** "107 pm", "1012 kJ/mol", "2.2", or "no value". */
export function shownValue(symbol: string, property: TrendProperty): string {
  const text = valueText(symbol, property);
  if (text === null) return 'no value';
  const { unit } = PROPERTIES[property];
  return unit === null ? text : `${text} ${unit}`;
}

/** The smallest and the largest value shown for each property. */
const SHOWN_RANGE: Readonly<Record<TrendProperty, { readonly min: number; readonly max: number }>> = {
  radius: rangeOf('radius'),
  ie1: rangeOf('ie1'),
  en: rangeOf('en'),
};

function rangeOf(property: TrendProperty): { min: number; max: number } {
  const values = TREND_ELEMENTS.flatMap((element) => {
    const value = valueOf(element.symbol, property);
    return value === null ? [] : [value];
  });
  return { min: Math.min(...values), max: Math.max(...values) };
}

const SHADE_BANDS = 5;

/**
 * Which of five equal bands, 0 to 4, the value falls in between the smallest
 * and the largest value shown for the property (the largest is in band 4), or
 * null where there is no value.
 */
export function shadeLevel(symbol: string, property: TrendProperty): number | null {
  const value = valueOf(symbol, property);
  if (value === null) return null;
  const { min, max } = SHOWN_RANGE[property];
  return Math.min(Math.floor(((value - min) / (max - min)) * SHADE_BANDS), SHADE_BANDS - 1);
}

export interface SeriesPoint {
  readonly symbol: string;
  readonly value: number;
}

/**
 * The values to plot. Across 'period': the elements of the element's period
 * in order of group. Down 'group': the elements of its group in order of
 * period. An element with no value is left out.
 */
export function series(symbol: string, property: TrendProperty, direction: TrendDirection): readonly SeriesPoint[] {
  parseProperty(property);
  parseDirection(direction);
  const start = elementOf(symbol);
  return TREND_ELEMENTS.filter((element) =>
    direction === 'period' ? element.period === start.period : element.group === start.group,
  ).flatMap((element) => {
    const value = valueOf(element.symbol, property);
    return value === null ? [] : [{ symbol: element.symbol, value }];
  });
}

/** What the diagram says about one element. */
export function readout(symbol: string): string {
  const element = elementOf(symbol);
  const ie1 = `first ionization energy ${shownValue(symbol, 'ie1')}`;
  // A noble gas is the only kind of element here with no radius and no electronegativity.
  if (element.group === 18) {
    return `${element.name}: ${ie1}. No atomic radius or electronegativity is shown for a noble gas: both describe an atom in a bond.`;
  }
  return (
    `${element.name}: atomic radius ${shownValue(symbol, 'radius')}, ${ie1}, ` +
    `electronegativity ${shownValue(symbol, 'en')}.`
  );
}

/** "First ionization energy across period 3", "Atomic radius down group 16". */
export function seriesHeading(symbol: string, property: TrendProperty, direction: TrendDirection): string {
  parseProperty(property);
  parseDirection(direction);
  const element = elementOf(symbol);
  const where = direction === 'period' ? `across period ${element.period}` : `down group ${element.group}`;
  return `${PROPERTIES[property].label} ${where}`;
}

/** The title of the graph's horizontal axis, in lowercase. */
export function orderTitle(direction: TrendDirection): string {
  parseDirection(direction);
  return direction === 'period' ? 'left to right in the table' : 'top to bottom in the table';
}

/** The graph in words, for its accessible name: every plotted value, in order. */
export function describeSeries(symbol: string, property: TrendProperty, direction: TrendDirection): string {
  const heading = seriesHeading(symbol, property, direction);
  const points = series(symbol, property, direction);
  if (points.length === 0) {
    // Only a noble gas has no radius and no electronegativity, so an empty series is always a noble gas's group.
    return `${heading}: no values to plot, because none is shown for a noble gas.`;
  }
  const { unit } = PROPERTIES[property];
  const inUnit = unit === null ? '' : `, in ${unit}`;
  const values = points.map((point) => `${point.symbol} ${valueText(point.symbol, property)}`).join(', ');
  return `${heading}${inUnit}: ${values}.`;
}
