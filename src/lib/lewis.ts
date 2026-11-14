/**
 * Lewis diagrams, checked and laid out at build time. No DOM here, so it is
 * testable directly. A lesson writes atoms on a grid (1 = one bond length,
 * y grows downward) and bonds between them; this module checks the electron
 * count, places the lone pairs, works out formal charges and returns every
 * line, letter and dot in drawing units, ready for an SVG.
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

export interface Line {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface Label {
  readonly x: number;
  readonly y: number;
  readonly text: string;
}

export interface Dot {
  readonly cx: number;
  readonly cy: number;
}

export interface Brackets {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  /** x is where the text starts; y is its vertical middle. */
  readonly charge: Label;
}

export interface LewisLayout {
  readonly viewBox: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  /** Centered on (x, y). */
  readonly symbols: readonly Label[];
  readonly lines: readonly Line[];
  readonly dots: readonly Dot[];
  /** Centered on (x, y). */
  readonly formalCharges: readonly Label[];
  readonly brackets: Brackets | undefined;
}

// Drawing units: one unit is one CSS pixel when the drawing is at its natural size.
export const BOND_LENGTH = 50;
export const MARGIN = 4;
export const SYMBOL_FONT_SIZE = 22;
export const CHARGE_FONT_SIZE = 13;
export const DOT_RADIUS = 2;
/** Between the centers of the two dots of a pair. */
const DOT_SPACING = 7;
/** Between a letter and the dots beside it: closer, and two dots above an O read as "Ö". */
const PAIR_GAP = 5.5;
/** Between a letter and the end of a bond line. */
const BOND_GAP = 4;
const BRACKET_PADDING = 6;
export const BRACKET_ARM = 6;

/** Sides closer than this to a bond would put dots on the bond line. */
const ALONG_BOND = Math.PI / 4 - 1e-9;
const SAME_ANGLE = 1e-9;

const SIDE_VECTOR: Record<Side, Vec> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};
/** Classic Lewis order when two sides are equally clear of bonds. */
const TIE_ORDER: readonly Side[] = ['top', 'bottom', 'left', 'right'];

const CORNERS: readonly Vec[] = [
  { x: 1, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
];

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
        `or add the element to VALENCE in src/lib/lewis.ts.`,
    );
  }
  return count;
}

/** Half the width of an element symbol as drawn: an estimate from its letters. */
export function symbolHalfWidth(symbol: string): number {
  let ems = 0;
  for (const letter of symbol) {
    if (letter === 'l' || letter === 'i') ems += 0.25;
    else ems += letter === letter.toUpperCase() ? 0.66 : 0.5;
  }
  return (ems * SYMBOL_FONT_SIZE) / 2;
}

/** Half the height of a capital letter as drawn. */
export function symbolHalfHeight(): number {
  return 0.36 * SYMBOL_FONT_SIZE;
}

/** "+", "2−" for an ion; "+1", "−1" for a formal charge. */
export function chargeText(charge: number, kind: 'ion' | 'formal'): string {
  const sign = charge > 0 ? '+' : '−';
  const size = Math.abs(charge);
  if (kind === 'formal') return `${sign}${size}`;
  return size === 1 ? sign : `${size}${sign}`;
}

/** The two lines of a double bond sit this far either side of the line between the atoms. */
export function bondLineOffsets(order: 1 | 2 | 3): number[] {
  switch (order) {
    case 1:
      return [0];
    case 2:
      return [-3, 3];
    case 3:
      return [-5, 0, 5];
    default: {
      const unhandled: never = order;
      throw new Error(`No drawing for a bond of order ${String(unhandled)}.`);
    }
  }
}

function angleBetween(a: Vec, b: Vec): number {
  const cos = (a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y));
  return Math.acos(Math.min(1, Math.max(-1, cos)));
}

/** The angle from a direction to the nearest bond; a half-turn when there are no bonds. */
function clearance(direction: Vec, bondDirections: readonly Vec[]): number {
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

type BondOrder = 1 | 2 | 3;

interface Atom {
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

interface Bond {
  readonly from: Atom;
  readonly to: Atom;
  readonly order: BondOrder;
}

interface Structure {
  readonly atoms: readonly Atom[];
  readonly bonds: readonly Bond[];
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

/** Checks a diagram as a writer typed it and resolves where every lone pair goes. */
function parse(input: LewisInput): Structure {
  const name = diagramName(input);
  // A declaration, not an arrow: only a declared function returning never narrows the code after a call.
  function fail(problem: string): never {
    throw new Error(`${name}: ${problem}`);
  }

  const strayProp = unknownKey(input, INPUT_KEYS);
  if (strayProp !== undefined) fail(`it has a prop "${strayProp}" that a Lewis diagram does not take. Its props are ${INPUT_KEYS.join(', ')}.`);
  if (input.formalCharges !== undefined && typeof input.formalCharges !== 'boolean') {
    fail(`formalCharges must be true or false, not ${JSON.stringify(input.formalCharges)}. Write formalCharges on its own to turn them on.`);
  }

  if (!Array.isArray(input.atoms) || input.atoms.length === 0) fail('it has no atoms. Give it atoms={[...]}.');
  if (!Array.isArray(input.bonds)) fail('bonds must be a list such as [["O", "H1", 1]].');
  if (input.ion !== undefined && !(Number.isInteger(input.ion) && input.ion !== 0)) {
    fail(`ion must be a whole number other than 0, such as -1 or 2, not ${String(input.ion)}. Leave it out for a neutral molecule.`);
  }

  const raw = new Map<string, LewisAtom>();
  const positions = new Set<string>();
  for (const [index, atom] of input.atoms.entries()) {
    if (typeof atom !== 'object' || atom === null) fail(`atom ${index + 1} is not written as { id, symbol, x, y }.`);
    if (typeof atom.id !== 'string' || !atom.id) fail('every atom needs an id, such as id: "O1".');
    const strayField = unknownKey(atom, ATOM_KEYS);
    if (strayField !== undefined) {
      fail(`atom "${atom.id}" has a field "${strayField}" that an atom does not take. Its fields are ${ATOM_KEYS.join(', ')}.`);
    }
    if (raw.has(atom.id)) fail(`two atoms have the id "${atom.id}". Give each atom its own id.`);
    if (!isElement(atom.symbol)) {
      fail(`atom "${atom.id}" has the symbol "${String(atom.symbol)}", which is not an element this diagram knows. ` +
        `Check its spelling and case, or add it to VALENCE in src/lib/lewis.ts.`);
    }
    if (!(Number.isFinite(atom.x) && Number.isFinite(atom.y))) {
      fail(`atom "${atom.id}" needs numbers for x and y, not ${String(atom.x)} and ${String(atom.y)}.`);
    }
    const position = `${atom.x},${atom.y}`;
    if (positions.has(position)) fail(`two atoms sit at x: ${atom.x}, y: ${atom.y}. Move one.`);
    positions.add(position);
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
    raw.set(atom.id, atom);
  }

  const directions = new Map<string, Vec[]>([...raw.keys()].map((id) => [id, []]));
  const bonded = new Map<string, number>([...raw.keys()].map((id) => [id, 0]));
  const pairs = new Set<string>();
  const checkedBonds: { from: string; to: string; order: BondOrder }[] = [];
  for (const bond of input.bonds) {
    if (!Array.isArray(bond) || bond.length !== 3) fail(`a bond is written ${JSON.stringify(bond)}. Write it as [fromId, toId, order].`);
    const [from, to, order] = bond;
    const a = raw.get(from);
    const b = raw.get(to);
    if (!a) fail(`a bond names the atom "${from}", which is not in atoms.`);
    if (!b) fail(`a bond names the atom "${to}", which is not in atoms.`);
    if (from === to) fail(`a bond joins "${from}" to itself.`);
    if (!isBondOrder(order)) fail(`the bond ${from}–${to} has order ${String(order)}. A bond order must be 1, 2 or 3.`);
    const key = [from, to].sort().join(' ');
    if (pairs.has(key)) fail(`the atoms "${from}" and "${to}" are bonded twice. Write one bond with the right order.`);
    pairs.add(key);
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    directions.get(from)?.push({ x: (b.x - a.x) / length, y: (b.y - a.y) / length });
    directions.get(to)?.push({ x: (a.x - b.x) / length, y: (a.y - b.y) / length });
    bonded.set(from, (bonded.get(from) ?? 0) + order);
    bonded.set(to, (bonded.get(to) ?? 0) + order);
    checkedBonds.push({ from, to, order });
  }

  const atoms = new Map<string, Atom>();
  for (const atom of raw.values()) {
    const bondDirections = directions.get(atom.id) ?? [];
    const where = `${name}: atom "${atom.id}"`;
    if (atom.unpaired !== undefined && clearance(SIDE_VECTOR[atom.unpaired], bondDirections) < ALONG_BOND) {
      fail(`atom "${atom.id}" has its unpaired electron on its ${atom.unpaired} side, which points along a bond. Choose another side.`);
    }
    let pairSides: readonly Side[];
    // A count (or nothing) is placed automatically; a list is checked and used as written.
    if (atom.lonePairs === undefined || typeof atom.lonePairs === 'number') {
      pairSides = chooseLonePairSides(atom.lonePairs ?? 0, bondDirections, atom.unpaired, where);
    } else {
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
      pairSides = listed;
    }
    atoms.set(atom.id, {
      id: atom.id,
      symbol: atom.symbol,
      x: atom.x,
      y: atom.y,
      valence: valenceElectrons(atom.symbol),
      pairSides,
      unpaired: atom.unpaired,
      bonded: bonded.get(atom.id) ?? 0,
      bondDirections,
    });
  }

  const bonds = checkedBonds.map(({ from, to, order }) => {
    const a = atoms.get(from);
    const b = atoms.get(to);
    if (!a || !b) throw new Error(`${name}: lost track of the bond ${from}–${to}. This is a bug in src/lib/lewis.ts.`);
    return { from: a, to: b, order };
  });

  checkElectronCount(name, [...atoms.values()], input.ion ?? 0);
  return { atoms: [...atoms.values()], bonds };
}

function checkElectronCount(name: string, atoms: readonly Atom[], ion: number): void {
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

function formalChargeOf(atom: Atom): number {
  return atom.valence - 2 * atom.pairSides.length - (atom.unpaired ? 1 : 0) - atom.bonded;
}

/** Each atom's formal charge, by id: valence electrons minus lone electrons minus bonds. */
export function formalCharges(input: LewisInput): Map<string, number> {
  return new Map(parse(input).atoms.map((atom) => [atom.id, formalChargeOf(atom)]));
}

interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function grow(box: Box, x: number, y: number, halfWidth = 0, halfHeight = 0): void {
  box.minX = Math.min(box.minX, x - halfWidth);
  box.maxX = Math.max(box.maxX, x + halfWidth);
  box.minY = Math.min(box.minY, y - halfHeight);
  box.maxY = Math.max(box.maxY, y + halfHeight);
}

/** How far from an atom's center, along a direction, a line must start to clear the letters. */
function letterClearance(symbol: string, direction: Vec): number {
  const across = Math.abs(direction.x) > 1e-9 ? symbolHalfWidth(symbol) / Math.abs(direction.x) : Infinity;
  const down = Math.abs(direction.y) > 1e-9 ? symbolHalfHeight() / Math.abs(direction.y) : Infinity;
  return Math.min(across, down) + BOND_GAP;
}

/** Where the dots for one side of an atom go: two for a pair, one for an unpaired electron. */
function sideDots(atom: Atom, side: Side, count: 1 | 2): Dot[] {
  const v = SIDE_VECTOR[side];
  const reach = (v.x !== 0 ? symbolHalfWidth(atom.symbol) : symbolHalfHeight()) + PAIR_GAP + DOT_RADIUS;
  const cx = atom.x * BOND_LENGTH + v.x * reach;
  const cy = atom.y * BOND_LENGTH + v.y * reach;
  if (count === 1) return [{ cx, cy }];
  // Side by side, across the direction the side faces.
  const half = DOT_SPACING / 2;
  return [
    { cx: cx - v.y * half, cy: cy - v.x * half },
    { cx: cx + v.y * half, cy: cy + v.x * half },
  ];
}

const chargeHalfWidth = (text: string, fontSize: number) => (text.length * 0.6 * fontSize) / 2;
const chargeHalfHeight = (fontSize: number) => 0.36 * fontSize;

/** Checks a diagram and returns everything to draw, in drawing units. Throws on any mistake in it. */
export function layoutLewis(input: LewisInput): LewisLayout {
  const { atoms, bonds } = parse(input);
  const box: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  const symbols = atoms.map((atom) => {
    const x = atom.x * BOND_LENGTH;
    const y = atom.y * BOND_LENGTH;
    grow(box, x, y, symbolHalfWidth(atom.symbol), symbolHalfHeight());
    return { x, y, text: atom.symbol };
  });

  const lines = bonds.flatMap(({ from, to, order }) => {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const dx = (to.x - from.x) / length;
    const dy = (to.y - from.y) / length;
    const start = letterClearance(from.symbol, { x: dx, y: dy });
    const end = letterClearance(to.symbol, { x: dx, y: dy });
    return bondLineOffsets(order).map((offset) => ({
      x1: from.x * BOND_LENGTH + dx * start - dy * offset,
      y1: from.y * BOND_LENGTH + dy * start + dx * offset,
      x2: to.x * BOND_LENGTH - dx * end - dy * offset,
      y2: to.y * BOND_LENGTH - dy * end + dx * offset,
    }));
  });

  const dots = atoms.flatMap((atom) => [
    ...atom.pairSides.flatMap((side) => sideDots(atom, side, 2)),
    ...(atom.unpaired ? sideDots(atom, atom.unpaired, 1) : []),
  ]);
  for (const dot of dots) grow(box, dot.cx, dot.cy, DOT_RADIUS, DOT_RADIUS);

  const formal: Label[] = [];
  if (input.formalCharges) {
    for (const atom of atoms) {
      const charge = formalChargeOf(atom);
      if (charge === 0) continue;
      const text = chargeText(charge, 'formal');
      // The corner farthest from the atom's bonds; sort is stable, so ties keep the listed order.
      const corner = [...CORNERS].sort(
        (a, b) => clearance(b, atom.bondDirections) - clearance(a, atom.bondDirections),
      )[0];
      if (!corner) throw new Error('No corner to put a formal charge in. This is a bug in src/lib/lewis.ts.');
      const halfWidth = chargeHalfWidth(text, CHARGE_FONT_SIZE);
      // Out past the corner of the letter, clear of the dots on either side of it.
      const x = atom.x * BOND_LENGTH + corner.x * (symbolHalfWidth(atom.symbol) + 4 + halfWidth);
      const y = atom.y * BOND_LENGTH + corner.y * (symbolHalfHeight() + 6);
      grow(box, x, y, halfWidth, chargeHalfHeight(CHARGE_FONT_SIZE));
      formal.push({ x, y, text });
    }
  }

  let brackets: Brackets | undefined;
  if (input.ion !== undefined) {
    const left = box.minX - BRACKET_PADDING;
    const right = box.maxX + BRACKET_PADDING;
    const top = box.minY - BRACKET_PADDING;
    const bottom = box.maxY + BRACKET_PADDING;
    const text = chargeText(input.ion, 'ion');
    const charge = { x: right + 3, y: top + 3, text };
    grow(box, left, top);
    grow(box, right, bottom);
    const halfWidth = chargeHalfWidth(text, CHARGE_FONT_SIZE);
    grow(box, charge.x + halfWidth, charge.y, halfWidth, chargeHalfHeight(CHARGE_FONT_SIZE));
    brackets = { left, right, top, bottom, charge };
  }

  return {
    viewBox: {
      x: box.minX - MARGIN,
      y: box.minY - MARGIN,
      width: box.maxX - box.minX + 2 * MARGIN,
      height: box.maxY - box.minY + 2 * MARGIN,
    },
    symbols,
    lines,
    dots,
    formalCharges: formal,
    brackets,
  };
}
