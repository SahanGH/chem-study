/**
 * Lewis diagrams, laid out at build time. No DOM here, so it is testable
 * directly. src/lib/lewis-parse.ts checks what a lesson wrote (the electron
 * count, the lone pairs, every misspelling); this module works out formal
 * charges and returns every line, letter and dot in drawing units, ready for
 * an SVG.
 */

import {
  SIDE_VECTOR,
  chargeText,
  clearance,
  parse,
  type Atom,
  type LewisInput,
  type Side,
  type Structure,
  type Vec,
} from './lewis-parse';

// Lewis.astro takes its props from here.
export type { LewisInput } from './lewis-parse';

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
export const PAIR_GAP = 5.5;
/** Between a letter and the end of a bond line. */
const BOND_GAP = 4;
const BRACKET_PADDING = 6;
export const BRACKET_ARM = 6;

const CORNERS: readonly Vec[] = [
  { x: 1, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
];

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

/** The distance from a point to the nearest point of the segment a–b. */
function distanceToSegment(point: Vec, a: Vec, b: Vec): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const along = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);
  const t = Math.min(1, Math.max(0, along));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

/**
 * How near to an atom's center a bond line may pass: out past the widest reach
 * of its letter, plus the gap a bond line keeps from a letter at its own ends.
 */
function lineClearance(symbol: string): number {
  return Math.max(symbolHalfWidth(symbol), symbolHalfHeight()) + BOND_GAP;
}

/** A bond is drawn straight between its atoms, so it must not pass over a third one. */
function checkBondsClearOfOtherAtoms({ name, atoms, bonds }: Structure): void {
  for (const { from, to } of bonds) {
    for (const atom of atoms) {
      if (atom === from || atom === to) continue;
      const distance = distanceToSegment(atom, from, to) * BOND_LENGTH;
      const needed = lineClearance(atom.symbol);
      if (distance >= needed) continue;
      throw new Error(
        `${name}: the bond ${from.id}–${to.id} passes too close to the atom "${atom.id}" and would be drawn over its letter ` +
          `(${(distance / BOND_LENGTH).toFixed(2)} bond lengths away; it needs at least ${(needed / BOND_LENGTH).toFixed(2)}). ` +
          `Move the atoms so that no bond passes close to another atom.`,
      );
    }
  }
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
  const structure = parse(input);
  checkBondsClearOfOtherAtoms(structure);
  const { atoms, bonds } = structure;
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
