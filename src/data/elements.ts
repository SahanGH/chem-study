export type Block = 's' | 'p' | 'd' | 'f';

export interface Element {
  /** Atomic number. */
  readonly z: number;
  readonly symbol: string;
  /** IUPAC name, US spelling: Aluminum, Cesium, Sulfur. */
  readonly name: string;
  /** Atomic mass exactly as the AP exam's table prints it, or null where it prints none. Text, so that 4.00 keeps its zeros. */
  readonly mass: string | null;
  /** 1 to 18, or null for the fifteen lanthanoids (57-71) and fifteen actinoids (89-103), which the exam's table sets below. */
  readonly group: number | null;
  /** 1 to 7. */
  readonly period: number;
  readonly block: Block;
}

// The 118 elements as the AP exam's periodic table gives them, generated from
// a reading of the table's picture and checked cell by cell against a second,
// independent reading (tests/unit/fixtures/ap-atomic-masses.json). The exam
// prints no mass for 34 of them.
export const elements: readonly Element[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', mass: '1.008', group: 1, period: 1, block: 's' },
  { z: 2, symbol: 'He', name: 'Helium', mass: '4.00', group: 18, period: 1, block: 's' },
  { z: 3, symbol: 'Li', name: 'Lithium', mass: '6.94', group: 1, period: 2, block: 's' },
  { z: 4, symbol: 'Be', name: 'Beryllium', mass: '9.01', group: 2, period: 2, block: 's' },
  { z: 5, symbol: 'B', name: 'Boron', mass: '10.81', group: 13, period: 2, block: 'p' },
  { z: 6, symbol: 'C', name: 'Carbon', mass: '12.01', group: 14, period: 2, block: 'p' },
  { z: 7, symbol: 'N', name: 'Nitrogen', mass: '14.01', group: 15, period: 2, block: 'p' },
  { z: 8, symbol: 'O', name: 'Oxygen', mass: '16.00', group: 16, period: 2, block: 'p' },
  { z: 9, symbol: 'F', name: 'Fluorine', mass: '19.00', group: 17, period: 2, block: 'p' },
  { z: 10, symbol: 'Ne', name: 'Neon', mass: '20.18', group: 18, period: 2, block: 'p' },
  { z: 11, symbol: 'Na', name: 'Sodium', mass: '22.99', group: 1, period: 3, block: 's' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', mass: '24.30', group: 2, period: 3, block: 's' },
  { z: 13, symbol: 'Al', name: 'Aluminum', mass: '26.98', group: 13, period: 3, block: 'p' },
  { z: 14, symbol: 'Si', name: 'Silicon', mass: '28.09', group: 14, period: 3, block: 'p' },
  { z: 15, symbol: 'P', name: 'Phosphorus', mass: '30.97', group: 15, period: 3, block: 'p' },
  { z: 16, symbol: 'S', name: 'Sulfur', mass: '32.06', group: 16, period: 3, block: 'p' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', mass: '35.45', group: 17, period: 3, block: 'p' },
  { z: 18, symbol: 'Ar', name: 'Argon', mass: '39.95', group: 18, period: 3, block: 'p' },
  { z: 19, symbol: 'K', name: 'Potassium', mass: '39.10', group: 1, period: 4, block: 's' },
  { z: 20, symbol: 'Ca', name: 'Calcium', mass: '40.08', group: 2, period: 4, block: 's' },
  { z: 21, symbol: 'Sc', name: 'Scandium', mass: '44.96', group: 3, period: 4, block: 'd' },
  { z: 22, symbol: 'Ti', name: 'Titanium', mass: '47.87', group: 4, period: 4, block: 'd' },
  { z: 23, symbol: 'V', name: 'Vanadium', mass: '50.94', group: 5, period: 4, block: 'd' },
  { z: 24, symbol: 'Cr', name: 'Chromium', mass: '52.00', group: 6, period: 4, block: 'd' },
  { z: 25, symbol: 'Mn', name: 'Manganese', mass: '54.94', group: 7, period: 4, block: 'd' },
  { z: 26, symbol: 'Fe', name: 'Iron', mass: '55.85', group: 8, period: 4, block: 'd' },
  { z: 27, symbol: 'Co', name: 'Cobalt', mass: '58.93', group: 9, period: 4, block: 'd' },
  { z: 28, symbol: 'Ni', name: 'Nickel', mass: '58.69', group: 10, period: 4, block: 'd' },
  { z: 29, symbol: 'Cu', name: 'Copper', mass: '63.55', group: 11, period: 4, block: 'd' },
  { z: 30, symbol: 'Zn', name: 'Zinc', mass: '65.38', group: 12, period: 4, block: 'd' },
  { z: 31, symbol: 'Ga', name: 'Gallium', mass: '69.72', group: 13, period: 4, block: 'p' },
  { z: 32, symbol: 'Ge', name: 'Germanium', mass: '72.63', group: 14, period: 4, block: 'p' },
  { z: 33, symbol: 'As', name: 'Arsenic', mass: '74.92', group: 15, period: 4, block: 'p' },
  { z: 34, symbol: 'Se', name: 'Selenium', mass: '78.97', group: 16, period: 4, block: 'p' },
  { z: 35, symbol: 'Br', name: 'Bromine', mass: '79.90', group: 17, period: 4, block: 'p' },
  { z: 36, symbol: 'Kr', name: 'Krypton', mass: '83.80', group: 18, period: 4, block: 'p' },
  { z: 37, symbol: 'Rb', name: 'Rubidium', mass: '85.47', group: 1, period: 5, block: 's' },
  { z: 38, symbol: 'Sr', name: 'Strontium', mass: '87.62', group: 2, period: 5, block: 's' },
  { z: 39, symbol: 'Y', name: 'Yttrium', mass: '88.91', group: 3, period: 5, block: 'd' },
  { z: 40, symbol: 'Zr', name: 'Zirconium', mass: '91.22', group: 4, period: 5, block: 'd' },
  { z: 41, symbol: 'Nb', name: 'Niobium', mass: '92.91', group: 5, period: 5, block: 'd' },
  { z: 42, symbol: 'Mo', name: 'Molybdenum', mass: '95.95', group: 6, period: 5, block: 'd' },
  { z: 43, symbol: 'Tc', name: 'Technetium', mass: null, group: 7, period: 5, block: 'd' },
  { z: 44, symbol: 'Ru', name: 'Ruthenium', mass: '101.07', group: 8, period: 5, block: 'd' },
  { z: 45, symbol: 'Rh', name: 'Rhodium', mass: '102.91', group: 9, period: 5, block: 'd' },
  { z: 46, symbol: 'Pd', name: 'Palladium', mass: '106.42', group: 10, period: 5, block: 'd' },
  { z: 47, symbol: 'Ag', name: 'Silver', mass: '107.87', group: 11, period: 5, block: 'd' },
  { z: 48, symbol: 'Cd', name: 'Cadmium', mass: '112.41', group: 12, period: 5, block: 'd' },
  { z: 49, symbol: 'In', name: 'Indium', mass: '114.82', group: 13, period: 5, block: 'p' },
  { z: 50, symbol: 'Sn', name: 'Tin', mass: '118.71', group: 14, period: 5, block: 'p' },
  { z: 51, symbol: 'Sb', name: 'Antimony', mass: '121.76', group: 15, period: 5, block: 'p' },
  { z: 52, symbol: 'Te', name: 'Tellurium', mass: '127.60', group: 16, period: 5, block: 'p' },
  { z: 53, symbol: 'I', name: 'Iodine', mass: '126.90', group: 17, period: 5, block: 'p' },
  { z: 54, symbol: 'Xe', name: 'Xenon', mass: '131.29', group: 18, period: 5, block: 'p' },
  { z: 55, symbol: 'Cs', name: 'Cesium', mass: '132.91', group: 1, period: 6, block: 's' },
  { z: 56, symbol: 'Ba', name: 'Barium', mass: '137.33', group: 2, period: 6, block: 's' },
  { z: 57, symbol: 'La', name: 'Lanthanum', mass: '138.91', group: null, period: 6, block: 'f' },
  { z: 58, symbol: 'Ce', name: 'Cerium', mass: '140.12', group: null, period: 6, block: 'f' },
  { z: 59, symbol: 'Pr', name: 'Praseodymium', mass: '140.91', group: null, period: 6, block: 'f' },
  { z: 60, symbol: 'Nd', name: 'Neodymium', mass: '144.24', group: null, period: 6, block: 'f' },
  { z: 61, symbol: 'Pm', name: 'Promethium', mass: null, group: null, period: 6, block: 'f' },
  { z: 62, symbol: 'Sm', name: 'Samarium', mass: '150.36', group: null, period: 6, block: 'f' },
  { z: 63, symbol: 'Eu', name: 'Europium', mass: '151.97', group: null, period: 6, block: 'f' },
  { z: 64, symbol: 'Gd', name: 'Gadolinium', mass: '157.25', group: null, period: 6, block: 'f' },
  { z: 65, symbol: 'Tb', name: 'Terbium', mass: '158.93', group: null, period: 6, block: 'f' },
  { z: 66, symbol: 'Dy', name: 'Dysprosium', mass: '162.50', group: null, period: 6, block: 'f' },
  { z: 67, symbol: 'Ho', name: 'Holmium', mass: '164.93', group: null, period: 6, block: 'f' },
  { z: 68, symbol: 'Er', name: 'Erbium', mass: '167.26', group: null, period: 6, block: 'f' },
  { z: 69, symbol: 'Tm', name: 'Thulium', mass: '168.93', group: null, period: 6, block: 'f' },
  { z: 70, symbol: 'Yb', name: 'Ytterbium', mass: '173.05', group: null, period: 6, block: 'f' },
  { z: 71, symbol: 'Lu', name: 'Lutetium', mass: '174.97', group: null, period: 6, block: 'f' },
  { z: 72, symbol: 'Hf', name: 'Hafnium', mass: '178.49', group: 4, period: 6, block: 'd' },
  { z: 73, symbol: 'Ta', name: 'Tantalum', mass: '180.95', group: 5, period: 6, block: 'd' },
  { z: 74, symbol: 'W', name: 'Tungsten', mass: '183.84', group: 6, period: 6, block: 'd' },
  { z: 75, symbol: 'Re', name: 'Rhenium', mass: '186.21', group: 7, period: 6, block: 'd' },
  { z: 76, symbol: 'Os', name: 'Osmium', mass: '190.23', group: 8, period: 6, block: 'd' },
  { z: 77, symbol: 'Ir', name: 'Iridium', mass: '192.22', group: 9, period: 6, block: 'd' },
  { z: 78, symbol: 'Pt', name: 'Platinum', mass: '195.08', group: 10, period: 6, block: 'd' },
  { z: 79, symbol: 'Au', name: 'Gold', mass: '196.97', group: 11, period: 6, block: 'd' },
  { z: 80, symbol: 'Hg', name: 'Mercury', mass: '200.59', group: 12, period: 6, block: 'd' },
  { z: 81, symbol: 'Tl', name: 'Thallium', mass: '204.38', group: 13, period: 6, block: 'p' },
  { z: 82, symbol: 'Pb', name: 'Lead', mass: '207.2', group: 14, period: 6, block: 'p' },
  { z: 83, symbol: 'Bi', name: 'Bismuth', mass: '208.98', group: 15, period: 6, block: 'p' },
  { z: 84, symbol: 'Po', name: 'Polonium', mass: null, group: 16, period: 6, block: 'p' },
  { z: 85, symbol: 'At', name: 'Astatine', mass: null, group: 17, period: 6, block: 'p' },
  { z: 86, symbol: 'Rn', name: 'Radon', mass: null, group: 18, period: 6, block: 'p' },
  { z: 87, symbol: 'Fr', name: 'Francium', mass: null, group: 1, period: 7, block: 's' },
  { z: 88, symbol: 'Ra', name: 'Radium', mass: null, group: 2, period: 7, block: 's' },
  { z: 89, symbol: 'Ac', name: 'Actinium', mass: null, group: null, period: 7, block: 'f' },
  { z: 90, symbol: 'Th', name: 'Thorium', mass: '232.04', group: null, period: 7, block: 'f' },
  { z: 91, symbol: 'Pa', name: 'Protactinium', mass: '231.04', group: null, period: 7, block: 'f' },
  { z: 92, symbol: 'U', name: 'Uranium', mass: '238.03', group: null, period: 7, block: 'f' },
  { z: 93, symbol: 'Np', name: 'Neptunium', mass: null, group: null, period: 7, block: 'f' },
  { z: 94, symbol: 'Pu', name: 'Plutonium', mass: null, group: null, period: 7, block: 'f' },
  { z: 95, symbol: 'Am', name: 'Americium', mass: null, group: null, period: 7, block: 'f' },
  { z: 96, symbol: 'Cm', name: 'Curium', mass: null, group: null, period: 7, block: 'f' },
  { z: 97, symbol: 'Bk', name: 'Berkelium', mass: null, group: null, period: 7, block: 'f' },
  { z: 98, symbol: 'Cf', name: 'Californium', mass: null, group: null, period: 7, block: 'f' },
  { z: 99, symbol: 'Es', name: 'Einsteinium', mass: null, group: null, period: 7, block: 'f' },
  { z: 100, symbol: 'Fm', name: 'Fermium', mass: null, group: null, period: 7, block: 'f' },
  { z: 101, symbol: 'Md', name: 'Mendelevium', mass: null, group: null, period: 7, block: 'f' },
  { z: 102, symbol: 'No', name: 'Nobelium', mass: null, group: null, period: 7, block: 'f' },
  { z: 103, symbol: 'Lr', name: 'Lawrencium', mass: null, group: null, period: 7, block: 'f' },
  { z: 104, symbol: 'Rf', name: 'Rutherfordium', mass: null, group: 4, period: 7, block: 'd' },
  { z: 105, symbol: 'Db', name: 'Dubnium', mass: null, group: 5, period: 7, block: 'd' },
  { z: 106, symbol: 'Sg', name: 'Seaborgium', mass: null, group: 6, period: 7, block: 'd' },
  { z: 107, symbol: 'Bh', name: 'Bohrium', mass: null, group: 7, period: 7, block: 'd' },
  { z: 108, symbol: 'Hs', name: 'Hassium', mass: null, group: 8, period: 7, block: 'd' },
  { z: 109, symbol: 'Mt', name: 'Meitnerium', mass: null, group: 9, period: 7, block: 'd' },
  { z: 110, symbol: 'Ds', name: 'Darmstadtium', mass: null, group: 10, period: 7, block: 'd' },
  { z: 111, symbol: 'Rg', name: 'Roentgenium', mass: null, group: 11, period: 7, block: 'd' },
  { z: 112, symbol: 'Cn', name: 'Copernicium', mass: null, group: 12, period: 7, block: 'd' },
  { z: 113, symbol: 'Nh', name: 'Nihonium', mass: null, group: 13, period: 7, block: 'p' },
  { z: 114, symbol: 'Fl', name: 'Flerovium', mass: null, group: 14, period: 7, block: 'p' },
  { z: 115, symbol: 'Mc', name: 'Moscovium', mass: null, group: 15, period: 7, block: 'p' },
  { z: 116, symbol: 'Lv', name: 'Livermorium', mass: null, group: 16, period: 7, block: 'p' },
  { z: 117, symbol: 'Ts', name: 'Tennessine', mass: null, group: 17, period: 7, block: 'p' },
  { z: 118, symbol: 'Og', name: 'Oganesson', mass: null, group: 18, period: 7, block: 'p' },
];

const bySymbol: ReadonlyMap<string, Element> = new Map(elements.map((element) => [element.symbol, element]));

export function elementBySymbol(symbol: string): Element | undefined {
  return bySymbol.get(symbol);
}

// The exam's table sets the lanthanoids and actinoids in two rows below the
// main table, in columns 3 to 17 (fifteen boxes each), with a gap row between.
const LANTHANOIDS = { first: 57, last: 71, row: 9 } as const;
const ACTINOIDS = { first: 89, last: 103, row: 10 } as const;
const SERIES_FIRST_COLUMN = 3;

/** Where the element sits in the exam's layout: rows 1 to 7 for the main table, rows 9 and 10 for the two series below it; columns 1 to 18. */
export function tablePosition(element: Element): { row: number; column: number } {
  if (element.group !== null) return { row: element.period, column: element.group };
  for (const series of [LANTHANOIDS, ACTINOIDS]) {
    if (element.z >= series.first && element.z <= series.last) {
      return { row: series.row, column: SERIES_FIRST_COLUMN + element.z - series.first };
    }
  }
  throw new Error(
    `${element.name} (${element.symbol}, Z = ${element.z}) has no group and is not a lanthanoid (57-71) or an actinoid (89-103), so it has no place in the table.`,
  );
}
