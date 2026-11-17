/**
 * Photoelectron spectra of the atoms hydrogen to calcium, for the explorer in
 * lesson 1.6. No DOM here, so it is testable directly.
 *
 * A peak is one subshell: how many electrons it holds, and the energy needed
 * to remove one of them, in MJ/mol. Energies are text, so that 84.0 and 0.90
 * keep the figures the table gives them; a number would lose the zero.
 *
 * The values are those of the table used to teach photoelectron spectroscopy.
 * Each valence value equals the element's first ionization energy; those of
 * inner electrons are approximate.
 */
import { elementBySymbol } from '../data/elements';
import { toSuperscript } from './format';

export type Subshell = '1s' | '2s' | '2p' | '3s' | '3p' | '4s';

export interface Peak {
  readonly subshell: Subshell;
  readonly electrons: number;
  /** In MJ/mol, as text. */
  readonly energy: string;
}

export interface PesElement {
  readonly z: number;
  readonly symbol: string;
  /** From the element data: US spelling, capitalized. */
  readonly name: string;
  /** From the highest binding energy to the lowest, which is the filling order. */
  readonly peaks: readonly Peak[];
}

type RawPeak = readonly [subshell: Subshell, electrons: number, energy: string];

const RAW: readonly { readonly symbol: string; readonly peaks: readonly RawPeak[] }[] = [
  { symbol: 'H', peaks: [['1s', 1, '1.31']] },
  { symbol: 'He', peaks: [['1s', 2, '2.37']] },
  { symbol: 'Li', peaks: [['1s', 2, '6.26'], ['2s', 1, '0.52']] },
  { symbol: 'Be', peaks: [['1s', 2, '11.5'], ['2s', 2, '0.90']] },
  { symbol: 'B', peaks: [['1s', 2, '19.3'], ['2s', 2, '1.36'], ['2p', 1, '0.80']] },
  { symbol: 'C', peaks: [['1s', 2, '28.6'], ['2s', 2, '1.72'], ['2p', 2, '1.09']] },
  { symbol: 'N', peaks: [['1s', 2, '39.6'], ['2s', 2, '2.45'], ['2p', 3, '1.40']] },
  { symbol: 'O', peaks: [['1s', 2, '52.6'], ['2s', 2, '3.12'], ['2p', 4, '1.31']] },
  { symbol: 'F', peaks: [['1s', 2, '67.2'], ['2s', 2, '3.88'], ['2p', 5, '1.68']] },
  { symbol: 'Ne', peaks: [['1s', 2, '84.0'], ['2s', 2, '4.68'], ['2p', 6, '2.08']] },
  { symbol: 'Na', peaks: [['1s', 2, '104'], ['2s', 2, '6.84'], ['2p', 6, '3.67'], ['3s', 1, '0.50']] },
  { symbol: 'Mg', peaks: [['1s', 2, '126'], ['2s', 2, '9.07'], ['2p', 6, '5.31'], ['3s', 2, '0.74']] },
  { symbol: 'Al', peaks: [['1s', 2, '151'], ['2s', 2, '12.1'], ['2p', 6, '7.79'], ['3s', 2, '1.09'], ['3p', 1, '0.58']] },
  { symbol: 'Si', peaks: [['1s', 2, '178'], ['2s', 2, '15.1'], ['2p', 6, '10.3'], ['3s', 2, '1.46'], ['3p', 2, '0.79']] },
  { symbol: 'P', peaks: [['1s', 2, '208'], ['2s', 2, '18.7'], ['2p', 6, '13.5'], ['3s', 2, '1.95'], ['3p', 3, '1.01']] },
  { symbol: 'S', peaks: [['1s', 2, '239'], ['2s', 2, '22.7'], ['2p', 6, '16.5'], ['3s', 2, '2.05'], ['3p', 4, '1.00']] },
  { symbol: 'Cl', peaks: [['1s', 2, '273'], ['2s', 2, '26.8'], ['2p', 6, '20.2'], ['3s', 2, '2.44'], ['3p', 5, '1.25']] },
  { symbol: 'Ar', peaks: [['1s', 2, '309'], ['2s', 2, '31.5'], ['2p', 6, '24.1'], ['3s', 2, '2.82'], ['3p', 6, '1.52']] },
  {
    symbol: 'K',
    peaks: [['1s', 2, '347'], ['2s', 2, '37.1'], ['2p', 6, '29.1'], ['3s', 2, '3.93'], ['3p', 6, '2.38'], ['4s', 1, '0.42']],
  },
  {
    symbol: 'Ca',
    peaks: [['1s', 2, '390'], ['2s', 2, '42.7'], ['2p', 6, '34.0'], ['3s', 2, '4.65'], ['3p', 6, '2.90'], ['4s', 2, '0.59']],
  },
];

function buildElement(raw: (typeof RAW)[number]): PesElement {
  const element = elementBySymbol(raw.symbol);
  if (!element) {
    throw new Error(
      `The photoelectron data names "${raw.symbol}", which is not in the element data (src/data/elements.ts): fix the symbol.`,
    );
  }
  return {
    z: element.z,
    symbol: raw.symbol,
    name: element.name,
    peaks: raw.peaks.map(([subshell, electrons, energy]) => ({ subshell, electrons, energy })),
  };
}

export const PES_ELEMENTS: readonly PesElement[] = RAW.map(buildElement);

/** The binding-energy axis, in MJ/mol. It is logarithmic, with the larger values at the left. */
export const AXIS = { min: 0.1, max: 1000 } as const;

/** The most electrons any peak here holds: a full 2p, 3p. A peak's height is its electrons over this. */
const MOST_ELECTRONS = 6;

// The labels are 12 units wide at most, and the axis is about 260 units wide,
// so a label reaches about 0.05 of the axis from its peak. Two peaks closer
// than this can have labels that meet.
const LABEL_CLEARANCE = 0.06;

const COUNT_WORDS = ['one', 'two', 'three', 'four', 'five', 'six'] as const;

/** The data for one of the twenty atoms. */
export function elementOf(symbol: string): PesElement {
  const found = PES_ELEMENTS.find((element) => element.symbol === symbol);
  if (!found) {
    throw new Error(`There is no photoelectron data for "${symbol}": give a symbol from H to Ca, such as "Si".`);
  }
  return found;
}

/** Two different atoms, for a comparison. */
function pairOf(symbol: string, otherSymbol: string): { first: PesElement; second: PesElement } {
  const first = elementOf(symbol);
  const second = elementOf(otherSymbol);
  if (first === second) {
    throw new Error(`Cannot compare ${first.name.toLowerCase()} with itself: give a different atom to compare with.`);
  }
  return { first, second };
}

function peakOf(element: PesElement, subshell: string): Peak | undefined {
  return element.peaks.find((peak) => peak.subshell === subshell);
}

const lowerName = (element: PesElement) => element.name.toLowerCase();

function countWord(count: number): string {
  const word = COUNT_WORDS[count - 1];
  if (word === undefined) throw new RangeError(`There is no count word for ${count}: give a number from 1 to 6.`);
  return word;
}

/** "1s", "1s and 2s", "1s, 2s and 2p". */
function listOf(items: readonly string[]): string {
  const last = items[items.length - 1];
  if (last === undefined) throw new Error('A list needs at least one item.');
  return items.length === 1 ? last : `${items.slice(0, -1).join(', ')} and ${last}`;
}

/**
 * Where a binding energy falls along the axis: 0 at the left edge, 1000 MJ/mol,
 * and 1 at the right edge, 0.1 MJ/mol.
 */
export function energyFraction(energy: string): number {
  const value = energy.trim() === '' ? Number.NaN : Number(energy);
  if (Number.isNaN(value)) {
    throw new RangeError(`The binding energy must be a number in MJ/mol, such as "1.31", not "${energy}".`);
  }
  // Written so that a value outside fails: every comparison with NaN is false too.
  if (!(value >= AXIS.min && value <= AXIS.max)) {
    throw new RangeError(`The binding energy must be from ${AXIS.min} to ${AXIS.max} MJ/mol, not ${energy} MJ/mol.`);
  }
  const decades = Math.log10(AXIS.max) - Math.log10(AXIS.min);
  return (Math.log10(AXIS.max) - Math.log10(value)) / decades;
}

/** How tall a peak is, as a fraction of the tallest: its electrons over six. */
export function heightFraction(electrons: number): number {
  if (!(Number.isInteger(electrons) && electrons >= 1 && electrons <= MOST_ELECTRONS)) {
    throw new RangeError(
      `The number of electrons in a peak must be a whole number from 1 to ${MOST_ELECTRONS}, not ${electrons}.`,
    );
  }
  return electrons / MOST_ELECTRONS;
}

/** The electron configuration in plain text with raised digits: "1s² 2s² 2p⁶ 3s¹". */
export function configuration(symbol: string): string {
  return elementOf(symbol)
    .peaks.map((peak) => `${peak.subshell}${toSuperscript(String(peak.electrons))}`)
    .join(' ');
}

/**
 * Where a peak's label sits, so that no label meets a neighboring peak or its
 * label. 'middle' puts it over the peak. A label can meet a neighbor that is
 * at least as tall (a shorter one is below the label), and only when it is
 * close: then the label moves away from it, so it 'end's at the peak's center
 * (and reaches left, toward higher energies) when the neighbor is on the
 * lower-energy side, and 'start's there when the neighbor is on the
 * higher-energy side.
 */
export function labelAnchor(symbol: string, subshell: string): 'start' | 'middle' | 'end' {
  const element = elementOf(symbol);
  const peak = peakOf(element, subshell);
  if (!peak) {
    const have = element.peaks.map((each) => each.subshell).join(', ');
    throw new Error(`The photoelectron spectrum of ${lowerName(element)} has no ${subshell} peak: give one of ${have}.`);
  }
  const place = energyFraction(peak.energy);
  const neighbor = element.peaks.find(
    (other) =>
      other !== peak &&
      other.electrons >= peak.electrons &&
      Math.abs(energyFraction(other.energy) - place) <= LABEL_CLEARANCE,
  );
  if (!neighbor) return 'middle';
  // A larger fraction is a lower binding energy, and lies to the right.
  return energyFraction(neighbor.energy) > place ? 'end' : 'start';
}

export interface Comparison {
  /** Subshells both atoms have, at a higher binding energy in the first atom. */
  readonly higher: string[];
  readonly lower: string[];
  readonly same: string[];
}

/** For the subshells both atoms have: which lie at a higher binding energy in the first atom, which lower, which the same. */
export function compare(symbol: string, otherSymbol: string): Comparison {
  const first = elementOf(symbol);
  const second = elementOf(otherSymbol);
  const result: Comparison = { higher: [], lower: [], same: [] };
  for (const peak of first.peaks) {
    const match = peakOf(second, peak.subshell);
    if (!match) continue;
    const difference = Number(peak.energy) - Number(match.energy);
    if (difference > 0) result.higher.push(peak.subshell);
    else if (difference < 0) result.lower.push(peak.subshell);
    else result.same.push(peak.subshell);
  }
  return result;
}

/** What the diagram says about one atom: its configuration and its two extreme peaks. */
export function readout(symbol: string): string {
  const element = elementOf(symbol);
  const { peaks } = element;
  const innermost = peaks[0];
  const outermost = peaks[peaks.length - 1];
  if (!innermost || !outermost) throw new Error(`${element.name} has no peaks in the data.`);
  const opening = `${element.name}, ${configuration(symbol)}: `;
  if (peaks.length === 1) return `${opening}${countWord(1)} peak, at ${innermost.energy} MJ/mol.`;
  // The innermost subshell of an atom with more than one peak is a full 1s.
  const outer = outermost.electrons === 1 ? 'electron is' : 'electrons are';
  return (
    `${opening}${countWord(peaks.length)} peaks. ` +
    `The ${innermost.subshell} electrons are held most strongly, at ${innermost.energy} MJ/mol. ` +
    `The ${outermost.subshell} ${outer} the easiest to remove, at ${outermost.energy} MJ/mol.`
  );
}

const protons = (element: PesElement) => `${element.z} proton${element.z === 1 ? '' : 's'}`;

/**
 * What the diagram says when one atom is compared with another. Among these
 * twenty atoms a comparison is all higher, all lower, or one exception among
 * the rest (nitrogen and oxygen, phosphorus and sulfur), which topic 1.7
 * explains; there is no tie.
 */
export function comparisonReadout(symbol: string, otherSymbol: string): string {
  const { first, second } = pairOf(symbol, otherSymbol);
  const { higher, lower, same } = compare(symbol, otherSymbol);
  const mine = lowerName(first);
  const theirs = lowerName(second);
  const nuclei = `${protons(first)} to ${theirs}'s ${second.z}`;

  if (same.length === 0 && lower.length === 0) {
    return `Every peak ${mine} shares with ${theirs} lies at a higher binding energy in ${mine}, whose nucleus has ${nuclei}.`;
  }
  if (same.length === 0 && higher.length === 0) {
    return `Every peak ${mine} shares with ${theirs} lies at a lower binding energy in ${mine}, whose nucleus has ${nuclei}.`;
  }

  const oddIsHigher = higher.length < lower.length;
  const odd = oddIsHigher ? higher : lower;
  const rest = oddIsHigher ? lower : higher;
  const oddSubshell = odd[0];
  const oddPeak = oddSubshell === undefined ? undefined : peakOf(first, oddSubshell);
  const oddMatch = oddSubshell === undefined ? undefined : peakOf(second, oddSubshell);
  if (same.length > 0 || odd.length !== 1 || rest.length < 2 || !oddPeak || !oddMatch) {
    throw new Error(
      `There is no sentence for comparing ${mine} with ${theirs}: they have a tie, or no single exception among their shared peaks.`,
    );
  }
  return (
    `${first.name} has ${nuclei}, and its ${listOf(rest)} peaks lie at ${oddIsHigher ? 'lower' : 'higher'} binding energies. ` +
    `Its ${oddSubshell} peak is ${oddIsHigher ? 'higher' : 'lower'}, ${oddPeak.energy} against ${oddMatch.energy} MJ/mol: ` +
    'topic 1.7 explains why.'
  );
}

export interface TableRow {
  readonly subshell: Subshell;
  readonly electrons: number;
  readonly energy: string;
  /**
   * The other atom's binding energy for this subshell. Left out when no atom
   * is compared with; null when one is and it has no such subshell.
   */
  readonly other?: string | null;
}

/** The table under the graph: one row for each peak of the chosen atom, with a column for the compared atom if there is one. */
export function energyTable(symbol: string, otherSymbol?: string): TableRow[] {
  const element = elementOf(symbol);
  const second = otherSymbol === undefined ? undefined : pairOf(symbol, otherSymbol).second;
  return element.peaks.map((peak) => {
    const row = { subshell: peak.subshell, electrons: peak.electrons, energy: peak.energy };
    if (!second) return row;
    return { ...row, other: peakOf(second, peak.subshell)?.energy ?? null };
  });
}

/** The graph in words, for its accessible name. The table under the graph gives the energies. */
export function describeSpectrum(symbol: string, otherSymbol?: string): string {
  const element = elementOf(symbol);
  const second = otherSymbol === undefined ? undefined : pairOf(symbol, otherSymbol).second;
  const { peaks } = element;
  const first = peaks[0];
  if (!first) throw new Error(`${element.name} has no peaks in the data.`);
  const heights = listOf(peaks.map((peak) => String(peak.electrons)));
  const spectrum =
    peaks.length === 1
      ? `Photoelectron spectrum of ${lowerName(element)}: ${countWord(1)} peak, ${first.subshell}, at ${first.energy} MJ/mol. ` +
        `The height of the peak is its number of electrons: ${heights}.`
      : `Photoelectron spectrum of ${lowerName(element)}: ${countWord(peaks.length)} peaks, ${listOf(peaks.map((peak) => peak.subshell))}, ` +
        'from the highest binding energy at the left to the lowest at the right. ' +
        `The height of each peak is its number of electrons: ${heights}.`;
  if (!second) return spectrum;
  return `${spectrum} Dashed outlines behind the peaks show ${lowerName(second)}'s peaks, for comparison.`;
}
