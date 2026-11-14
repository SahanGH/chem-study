/**
 * Lewis diagrams, checked. A lesson writes atoms on a grid (1 = one bond
 * length, y grows downward) and bonds between them; this module rejects any
 * mistake in that description with a message naming the diagram, checks the
 * electron count and places the lone pairs. It knows nothing about drawing:
 * src/lib/lewis.ts turns the checked structure into lines, letters and dots.
 */

export const SIDES = ['top', 'right', 'bottom', 'left'] as const;
export type Side = (typeof SIDES)[number];

export interface Vec {
  readonly x: number;
  readonly y: number;
}

export interface LewisAtom {
  readonly id: string;
  /** Element symbol, written as on the periodic table: "Cl", not "CL". */
  readonly symbol: string;
  /** Grid position: 1 = one bond length. Halves are fine. */
  readonly x: number;
  /** Grid position, growing downward. */
  readonly y: number;
  /** A count (placed automatically) or the sides to draw them on. */
  readonly lonePairs?: number | readonly Side[];
  /** The side carrying a single unpaired electron, for odd-electron species. */
  readonly unpaired?: Side;
}

/** [from id, to id, bond order 1, 2 or 3] */
export type LewisBond = readonly [from: string, to: string, order: number];

export interface LewisInput {
  readonly alt: string;
  readonly atoms: readonly LewisAtom[];
  readonly bonds: readonly LewisBond[];
  /** The charge of an ion: brackets are drawn around it, with the charge at the upper right. */
  readonly ion?: number;
  /** Show every non-zero formal charge next to its atom. */
  readonly formalCharges?: boolean;
}

export type BondOrder = 1 | 2 | 3;

export interface Atom {
  readonly id: string;
  readonly symbol: string;
  readonly x: number;
  readonly y: number;
  readonly valence: number;
  readonly pairSides: readonly Side[];
  readonly unpaired: Side | undefined;
  /** Sum of the orders of the atom's bonds. */
  readonly bonded: number;
  /** Unit vectors toward each bonded neighbor. */
  readonly bondDirections: readonly Vec[];
}

export interface Bond {
  readonly from: Atom;
  readonly to: Atom;
  readonly order: BondOrder;
}

/** A diagram that has passed every check. */
export interface Structure {
  /** How the diagram is named in an error. */
  readonly name: string;
  readonly atoms: readonly Atom[];
  readonly bonds: readonly Bond[];
}

/** Sides closer than this to a bond would put dots on the bond line. */
const ALONG_BOND = Math.PI / 4 - 1e-9;
const SAME_ANGLE = 1e-9;

export const SIDE_VECTOR: Record<Side, Vec> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};
/** Classic Lewis order when two sides are equally clear of bonds. */
const TIE_ORDER: readonly Side[] = ['top', 'bottom', 'left', 'right'];

// Main-group valence electrons. Add an element here before a lesson draws it.
const VALENCE: Readonly<Record<string, number>> = {
  H: 1, He: 2,
  Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, As: 5, Se: 6, Br: 7, Kr: 8,
  I: 7, Xe: 8,
};

function isElement(symbol: string): boolean {
  return Object.hasOwn(VALENCE, symbol);
}

export function valenceElectrons(symbol: string): number {
  const count = isElement(symbol) ? VALENCE[symbol] : undefined;
  if (count === undefined) {
    throw new Error(
      `No valence-electron count for the element "${symbol}". Check the symbol's spelling and case ("Cl", not "CL"), ` +
        `or add the element to VALENCE in src/lib/lewis-parse.ts.`,
    );
  }
  return count;
}

/** "+", "2−" for an ion; "+1", "−1" for a formal charge. */
export function chargeText(charge: number, kind: 'ion' | 'formal'): string {
  const sign = charge > 0 ? '+' : '−';
  const size = Math.abs(charge);
  if (kind === 'formal') return `${sign}${size}`;
  return size === 1 ? sign : `${size}${sign}`;
}

function angleBetween(a: Vec, b: Vec): number {
  const cos = (a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y));
  return Math.acos(Math.min(1, Math.max(-1, cos)));
}

/** The angle from a direction to the nearest bond; a half-turn when there are no bonds. */
export function clearance(direction: Vec, bondDirections: readonly Vec[]): number {
  return Math.min(Math.PI, ...bondDirections.map((bond) => angleBetween(direction, bond)));
}

/**
 * The sides for a number of lone pairs: farthest from the nearest bond first,
 * ties broken top, bottom, left, right. A side along a bond is never used.
 */
export function chooseLonePairSides(
  count: number,
  bondDirections: readonly Vec[],
  taken?: Side,
  where = 'An atom',
): Side[] {
  const ranked = TIE_ORDER.filter((side) => side !== taken)
    .map((side) => ({ side, angle: clearance(SIDE_VECTOR[side], bondDirections) }))
    .filter(({ angle }) => angle >= ALONG_BOND)
    // sort is stable, so equal angles keep the tie order.
    .sort((a, b) => (Math.abs(b.angle - a.angle) < SAME_ANGLE ? 0 : b.angle - a.angle));
  if (ranked.length < count) {
    const free = ranked.length === 0 ? 'no side is free of bonds' : `only ${ranked.length} side(s) are free of bonds`;
    throw new Error(
      `${where} has ${count} lone pair(s) to place, but ${free}. ` +
        `List the sides yourself (lonePairs: ['top', 'left']) or move the atoms so a side is clear.`,
    );
  }
  return ranked.slice(0, count).map(({ side }) => side);
}

const isSide = (value: unknown): value is Side => SIDES.some((side) => side === value);
const isBondOrder = (value: unknown): value is BondOrder => value === 1 || value === 2 || value === 3;

// The props a writer may give. MDX does not check them, so a misspelled one
// (formalCharge, lonepairs) would otherwise be ignored without a word.
const INPUT_KEYS: readonly string[] = ['alt', 'atoms', 'bonds', 'ion', 'formalCharges'];
const ATOM_KEYS: readonly string[] = ['id', 'symbol', 'x', 'y', 'lonePairs', 'unpaired'];

function unknownKey(value: object, allowed: readonly string[]): string | undefined {
  return Object.keys(value).find((key) => !allowed.includes(key));
}

/** A value as the writer typed it: text is quoted, so the string "0" is not mistaken for the number 0. */
function typed(value: unknown): string {
  // JSON.stringify returns undefined, not a string, for undefined and functions; String() makes that readable.
  return typeof value === 'number' ? String(value) : String(JSON.stringify(value));
}

/** How a diagram is named in an error: by the start of its alt text. */
function diagramName(input: LewisInput): string {
  const alt = typeof input.alt === 'string' ? input.alt.trim() : '';
  if (!alt) {
    const symbols = Array.isArray(input.atoms)
      ? input.atoms.map((atom) => (typeof atom === 'object' && atom !== null ? String(atom.symbol) : '?')).join(', ')
      : 'none';
    throw new Error(
      `A Lewis diagram (atoms: ${symbols}) has no alt text. Write alt="..." describing the structure for someone who cannot see it.`,
    );
  }
  const short = alt.length > 60 ? `${alt.slice(0, 60).trimEnd()}…` : alt;
  return `Lewis diagram "${short}"`;
}

/** Reports a problem in the diagram being checked. A declared type, so that a call narrows the code after it. */
type Fail = (problem: string) => never;

/** The diagram's own props: no stray ones, a list of atoms and of bonds, a sensible ion charge. */
function checkInputShape(input: LewisInput, fail: Fail): void {
  const strayProp = unknownKey(input, INPUT_KEYS);
  if (strayProp !== undefined) fail(`it has a prop "${strayProp}" that a Lewis diagram does not take. Its props are ${INPUT_KEYS.join(', ')}.`);
  if (input.formalCharges !== undefined && typeof input.formalCharges !== 'boolean') {
    fail(`formalCharges must be true or false, not ${JSON.stringify(input.formalCharges)}. Write formalCharges on its own to turn them on.`);
  }
  if (!Array.isArray(input.atoms) || input.atoms.length === 0) fail('it has no atoms. Give it atoms={[...]}.');
  if (!Array.isArray(input.bonds)) fail('bonds must be a list such as [["O", "H1", 1]].');
  if (input.ion !== undefined && !(Number.isInteger(input.ion) && input.ion !== 0)) {
    fail(`ion must be a whole number other than 0, such as -1 or 2, not ${typed(input.ion)}. Leave it out for a neutral molecule.`);
  }
}

/** An atom is an object with an id of its own and no fields an atom does not take. */
function checkAtomIdentity(atom: LewisAtom, index: number, known: ReadonlyMap<string, LewisAtom>, fail: Fail): void {
  if (typeof atom !== 'object' || atom === null) fail(`atom ${index + 1} is not written as { id, symbol, x, y }.`);
  if (typeof atom.id !== 'string' || !atom.id) fail('every atom needs an id, such as id: "O1".');
  const strayField = unknownKey(atom, ATOM_KEYS);
  if (strayField !== undefined) {
    fail(`atom "${atom.id}" has a field "${strayField}" that an atom does not take. Its fields are ${ATOM_KEYS.join(', ')}.`);
  }
  if (known.has(atom.id)) fail(`two atoms have the id "${atom.id}". Give each atom its own id.`);
}

/** An atom is a known element at a position no other atom has. Records the position. */
function checkAtomPlace(atom: LewisAtom, positions: Set<string>, fail: Fail): void {
  if (!isElement(atom.symbol)) {
    fail(`atom "${atom.id}" has the symbol "${String(atom.symbol)}", which is not an element this diagram knows. ` +
      `Check its spelling and case, or add it to VALENCE in src/lib/lewis-parse.ts.`);
  }
  if (!(Number.isFinite(atom.x) && Number.isFinite(atom.y))) {
    fail(`atom "${atom.id}" needs numbers for x and y, not ${typed(atom.x)} and ${typed(atom.y)}.`);
  }
  const position = `${atom.x},${atom.y}`;
  if (positions.has(position)) fail(`two atoms sit at x: ${atom.x}, y: ${atom.y}. Move one.`);
  positions.add(position);
}

/** An atom's lone pairs are a count of 0 to 4 or a list of up to 4 sides; its unpaired electron is on a side. */
function checkAtomElectrons(atom: LewisAtom, fail: Fail): void {
  const pairs = atom.lonePairs;
  if (typeof pairs === 'number') {
    if (!Number.isInteger(pairs) || pairs < 0 || pairs > 4) {
      fail(`atom "${atom.id}" has ${pairs} lone pairs. An atom can show from 0 to at most 4.`);
    }
  } else if (pairs !== undefined) {
    if (!Array.isArray(pairs) || !pairs.every(isSide)) {
      fail(`atom "${atom.id}" lists lone pairs on ${JSON.stringify(pairs)}. Use a count, or sides from ${SIDES.join(', ')}.`);
    }
    if (pairs.length > 4) fail(`atom "${atom.id}" has ${pairs.length} lone pairs. An atom can show at most 4.`);
  }
  if (atom.unpaired !== undefined && !isSide(atom.unpaired)) {
    fail(`atom "${atom.id}" has its unpaired electron on "${String(atom.unpaired)}". Use one of ${SIDES.join(', ')}.`);
  }
}

/** Checks every atom as written, returning them by id. */
function validateAtoms(atoms: readonly LewisAtom[], fail: Fail): Map<string, LewisAtom> {
  const byId = new Map<string, LewisAtom>();
  const positions = new Set<string>();
  for (const [index, atom] of atoms.entries()) {
    checkAtomIdentity(atom, index, byId, fail);
    checkAtomPlace(atom, positions, fail);
    checkAtomElectrons(atom, fail);
    byId.set(atom.id, atom);
  }
  return byId;
}

interface CheckedBond {
  readonly from: LewisAtom;
  readonly to: LewisAtom;
  readonly order: BondOrder;
}

/** A bond is [fromId, toId, order] between two different atoms in the list, of order 1, 2 or 3. */
function checkBond(bond: LewisBond, atoms: ReadonlyMap<string, LewisAtom>, fail: Fail): CheckedBond {
  if (!Array.isArray(bond) || bond.length !== 3) fail(`a bond is written ${JSON.stringify(bond)}. Write it as [fromId, toId, order].`);
  const [fromId, toId, order] = bond;
  const from = atoms.get(fromId);
  const to = atoms.get(toId);
  if (!from) fail(`a bond names the atom "${fromId}", which is not in atoms.`);
  if (!to) fail(`a bond names the atom "${toId}", which is not in atoms.`);
  if (fromId === toId) fail(`a bond joins "${fromId}" to itself.`);
  if (!isBondOrder(order)) fail(`the bond ${fromId}–${toId} has order ${typed(order)}. A bond order must be 1, 2 or 3.`);
  return { from, to, order };
}

interface CheckedBonds {
  readonly bonds: readonly CheckedBond[];
  /** Unit vectors from each atom toward its bonded neighbors, by atom id. */
  readonly directions: ReadonlyMap<string, readonly Vec[]>;
  /** Sum of the orders of each atom's bonds, by atom id. */
  readonly bonded: ReadonlyMap<string, number>;
}

/** Checks every bond as written, and works out each atom's bond directions and bond count. */
function validateBonds(bonds: readonly LewisBond[], atoms: ReadonlyMap<string, LewisAtom>, fail: Fail): CheckedBonds {
  const directions = new Map<string, Vec[]>([...atoms.keys()].map((id) => [id, []]));
  const bonded = new Map<string, number>([...atoms.keys()].map((id) => [id, 0]));
  const joined = new Set<string>();
  const checked: CheckedBond[] = [];
  for (const bond of bonds) {
    const { from, to, order } = checkBond(bond, atoms, fail);
    // JSON, not a joined string: ids may contain spaces, and "a b"+"c" must not equal "a"+"b c".
    const key = JSON.stringify([from.id, to.id].sort());
    if (joined.has(key)) fail(`the atoms "${from.id}" and "${to.id}" are bonded twice. Write one bond with the right order.`);
    joined.add(key);
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    directions.get(from.id)?.push({ x: (to.x - from.x) / length, y: (to.y - from.y) / length });
    directions.get(to.id)?.push({ x: (from.x - to.x) / length, y: (from.y - to.y) / length });
    bonded.set(from.id, (bonded.get(from.id) ?? 0) + order);
    bonded.set(to.id, (bonded.get(to.id) ?? 0) + order);
    checked.push({ from, to, order });
  }
  return { bonds: checked, directions, bonded };
}

/** The sides an atom's lone pairs go on: placed automatically for a count, checked and used as written for a list. */
function resolveLonePairs(atom: LewisAtom, bondDirections: readonly Vec[], name: string, fail: Fail): readonly Side[] {
  if (atom.lonePairs === undefined || typeof atom.lonePairs === 'number') {
    return chooseLonePairSides(atom.lonePairs ?? 0, bondDirections, atom.unpaired, `${name}: atom "${atom.id}"`);
  }
  const listed: readonly Side[] = atom.lonePairs;
  const seen = new Set<Side>();
  for (const side of listed) {
    if (seen.has(side)) fail(`atom "${atom.id}" has two lone pairs on its ${side} side. Give each pair its own side.`);
    seen.add(side);
    if (side === atom.unpaired) fail(`atom "${atom.id}" has a lone pair and its unpaired electron both on its ${side} side.`);
    if (clearance(SIDE_VECTOR[side], bondDirections) < ALONG_BOND) {
      fail(`atom "${atom.id}" has a lone pair on its ${side} side, which points along a bond. Choose another side.`);
    }
  }
  return listed;
}

/** One atom with its bonds known: its unpaired electron is clear of them and its lone pairs have sides. */
function resolveAtom(atom: LewisAtom, bonds: CheckedBonds, name: string, fail: Fail): Atom {
  const bondDirections = bonds.directions.get(atom.id) ?? [];
  if (atom.unpaired !== undefined && clearance(SIDE_VECTOR[atom.unpaired], bondDirections) < ALONG_BOND) {
    fail(`atom "${atom.id}" has its unpaired electron on its ${atom.unpaired} side, which points along a bond. Choose another side.`);
  }
  return {
    id: atom.id,
    symbol: atom.symbol,
    x: atom.x,
    y: atom.y,
    valence: valenceElectrons(atom.symbol),
    pairSides: resolveLonePairs(atom, bondDirections, name, fail),
    unpaired: atom.unpaired,
    bonded: bonds.bonded.get(atom.id) ?? 0,
    bondDirections,
  };
}

function resolveAtoms(atoms: ReadonlyMap<string, LewisAtom>, bonds: CheckedBonds, name: string, fail: Fail): Map<string, Atom> {
  return new Map([...atoms.values()].map((atom): [string, Atom] => [atom.id, resolveAtom(atom, bonds, name, fail)]));
}

/** The bonds again, joining the resolved atoms rather than the ones as written. */
function linkBonds(bonds: readonly CheckedBond[], atoms: ReadonlyMap<string, Atom>, name: string): Bond[] {
  return bonds.map(({ from, to, order }) => {
    const a = atoms.get(from.id);
    const b = atoms.get(to.id);
    if (!a || !b) throw new Error(`${name}: lost track of the bond ${from.id}–${to.id}. This is a bug in src/lib/lewis-parse.ts.`);
    return { from: a, to: b, order };
  });
}

/** Checks a diagram as a writer typed it and resolves where every lone pair goes. */
export function parse(input: LewisInput): Structure {
  const name = diagramName(input);
  // A declaration, not an arrow: only a declared function returning never narrows the code after a call.
  function fail(problem: string): never {
    throw new Error(`${name}: ${problem}`);
  }

  checkInputShape(input, fail);
  const written = validateAtoms(input.atoms, fail);
  const bonds = validateBonds(input.bonds, written, fail);
  const atoms = resolveAtoms(written, bonds, name, fail);
  const structure: Structure = { name, atoms: [...atoms.values()], bonds: linkBonds(bonds.bonds, atoms, name) };

  checkElectronCount(name, structure.atoms, input.ion ?? 0);
  return structure;
}

export function checkElectronCount(name: string, atoms: readonly Atom[], ion: number): void {
  const valence = atoms.reduce((sum, atom) => sum + atom.valence, 0);
  const expected = valence - ion;
  // Each bond is counted from both ends, so each end holds half its electrons.
  const inBonds = atoms.reduce((sum, atom) => sum + atom.bonded, 0);
  const inPairs = atoms.reduce((sum, atom) => sum + 2 * atom.pairSides.length, 0);
  const unpaired = atoms.filter((atom) => atom.unpaired !== undefined).length;
  const shown = inBonds + inPairs + unpaired;
  if (shown === expected) return;
  const charge = ion === 0 ? '' : `, ${ion > 0 ? 'minus' : 'plus'} ${Math.abs(ion)} for the ${chargeText(ion, 'ion')} charge`;
  throw new Error(
    `${name}: its atoms have ${valence} valence electrons (${atoms.map((a) => `${a.symbol} ${a.valence}`).join(', ')}${charge}), ` +
      `so it should show ${expected}, but it shows ${shown} (${inBonds} in bonds, ${inPairs} in lone pairs, ${unpaired} unpaired). ` +
      `Add or remove bonds or lone pairs until the counts agree.`,
  );
}
