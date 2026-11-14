/**
 * Molecular shapes for the shape viewer in lesson 2.7: where VSEPR puts the
 * electron domains around a central atom, which of them the lone pairs take,
 * and how to turn and flatten the result onto the screen. No DOM here, so it
 * is testable directly.
 *
 * Coordinates: x to the right, y up, z toward the viewer.
 */

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type DomainCount = 2 | 3 | 4 | 5 | 6;

const GEOMETRY: Record<DomainCount, string> = {
  2: 'linear',
  3: 'trigonal planar',
  4: 'tetrahedral',
  5: 'trigonal bipyramidal',
  6: 'octahedral',
};

const isDomainCount = (n: number): n is DomainCount => n === 2 || n === 3 || n === 4 || n === 5 || n === 6;

const TETRAHEDRAL_RING = Math.sqrt(8) / 3;
const around = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * The ideal directions for each number of domains, listed in the order lone
 * pairs take them: in a trigonal bipyramid the three equatorial positions
 * come first (a lone pair there has the most room); in an octahedron the
 * first two are opposite each other, so two lone pairs stay as far apart as
 * they can.
 */
const DOMAINS: Record<DomainCount, readonly Vec3[]> = {
  2: [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
  ],
  3: [0, 120, 240].map((d) => ({ x: Math.sin(around(d)), y: Math.cos(around(d)), z: 0 })),
  4: [
    { x: 0, y: 1, z: 0 },
    ...[0, 120, 240].map((d) => ({
      x: TETRAHEDRAL_RING * Math.cos(around(d)),
      y: -1 / 3,
      z: TETRAHEDRAL_RING * Math.sin(around(d)),
    })),
  ],
  5: [
    ...[0, 120, 240].map((d) => ({ x: Math.cos(around(d)), y: 0, z: Math.sin(around(d)) })),
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
  ],
  6: [
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
  ],
};

export function domainVectors(count: DomainCount): readonly Vec3[] {
  return DOMAINS[count];
}

/** Splits the ideal directions into lone pairs (placed first, by the rule above) and bonds. */
export function placeDomains(count: DomainCount, lonePairs: number): { bonds: Vec3[]; lonePairs: Vec3[] } {
  if (!(Number.isInteger(lonePairs) && lonePairs >= 0 && lonePairs < count)) {
    throw new RangeError(
      `${lonePairs} lone pairs cannot share ${count} domains: a molecule with ${count} domains needs 0 to ${count - 1} lone pairs (at least one bond).`,
    );
  }
  const vectors = DOMAINS[count];
  return { lonePairs: vectors.slice(0, lonePairs), bonds: vectors.slice(lonePairs) };
}

/**
 * Turns a vector by a yaw (about the vertical axis; positive moves the front
 * to the right) and then a pitch (about the horizontal axis; positive tips
 * the front down), both in degrees.
 */
export function rotate(v: Vec3, yawDegrees: number, pitchDegrees: number): Vec3 {
  const yaw = around(yawDegrees);
  const pitch = around(pitchDegrees);
  const x = v.x * Math.cos(yaw) + v.z * Math.sin(yaw);
  const z1 = -v.x * Math.sin(yaw) + v.z * Math.cos(yaw);
  return {
    x,
    y: v.y * Math.cos(pitch) - z1 * Math.sin(pitch),
    z: v.y * Math.sin(pitch) + z1 * Math.cos(pitch),
  };
}

export interface Projected {
  readonly x: number;
  readonly y: number;
  /** Larger is nearer the viewer. */
  readonly depth: number;
}

/** Flattens a point onto the screen, looking straight down z: SVG's y grows downward, so it flips. */
export function project(v: Vec3, scale: number, center: { x: number; y: number }): Projected {
  return { x: center.x + scale * v.x, y: center.y - scale * v.y, depth: v.z };
}

/** Farthest first, so drawing in this order leaves nearer things on top. */
export function depthOrder<T extends { readonly depth: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.depth - b.depth);
}

export interface Molecule {
  readonly id: string;
  /** With subscripts, as the reader sees it: "CH₄". */
  readonly formula: string;
  readonly name: string;
  readonly central: string;
  readonly terminal: string;
  /** Bonding domains: a double or triple bond counts once. */
  readonly bonds: number;
  readonly lonePairs: number;
  readonly shape: string;
  /** Completes "Angles: ...", ending with a period. */
  readonly angles: string;
  /** A sentence about counting domains, where it helps. */
  readonly note?: string;
}

const SQUEEZED_FOUR = 'a little less than 109.5°';

export const MOLECULES: readonly Molecule[] = [
  { id: 'CO2', formula: 'CO₂', name: 'carbon dioxide', central: 'C', terminal: 'O', bonds: 2, lonePairs: 0,
    shape: 'linear', angles: '180°.', note: 'Each double bond counts as one domain.' },
  { id: 'BF3', formula: 'BF₃', name: 'boron trifluoride', central: 'B', terminal: 'F', bonds: 3, lonePairs: 0,
    shape: 'trigonal planar', angles: '120°.' },
  { id: 'SO2', formula: 'SO₂', name: 'sulfur dioxide', central: 'S', terminal: 'O', bonds: 2, lonePairs: 1,
    shape: 'bent', angles: 'a little less than 120°: the lone pair pushes the bonds closer together.',
    note: 'A double bond counts as one domain.' },
  { id: 'CH4', formula: 'CH₄', name: 'methane', central: 'C', terminal: 'H', bonds: 4, lonePairs: 0,
    shape: 'tetrahedral', angles: '109.5°.' },
  { id: 'NH3', formula: 'NH₃', name: 'ammonia', central: 'N', terminal: 'H', bonds: 3, lonePairs: 1,
    shape: 'trigonal pyramidal', angles: `${SQUEEZED_FOUR} (about 107°): the lone pair pushes the bonds closer together.` },
  { id: 'H2O', formula: 'H₂O', name: 'water', central: 'O', terminal: 'H', bonds: 2, lonePairs: 2,
    shape: 'bent', angles: `${SQUEEZED_FOUR} (about 104.5°): the two lone pairs push the bonds closer together.` },
  { id: 'PCl5', formula: 'PCl₅', name: 'phosphorus pentachloride', central: 'P', terminal: 'Cl', bonds: 5, lonePairs: 0,
    shape: 'trigonal bipyramidal', angles: '90° between the axial and equatorial bonds, 120° between the equatorial bonds, 180° between the two axial bonds.' },
  { id: 'SF4', formula: 'SF₄', name: 'sulfur tetrafluoride', central: 'S', terminal: 'F', bonds: 4, lonePairs: 1,
    shape: 'seesaw', angles: 'ideally 90°, 120° and 180°; the lone pair squeezes them, closing the 120° angle to about 102°.' },
  { id: 'ClF3', formula: 'ClF₃', name: 'chlorine trifluoride', central: 'Cl', terminal: 'F', bonds: 3, lonePairs: 2,
    shape: 'T-shaped', angles: 'ideally 90° and 180°; the lone pairs squeeze them, the 90° angles to about 87.5°.' },
  { id: 'XeF2', formula: 'XeF₂', name: 'xenon difluoride', central: 'Xe', terminal: 'F', bonds: 2, lonePairs: 3,
    shape: 'linear', angles: '180°: the three lone pairs sit evenly around the middle.' },
  { id: 'SF6', formula: 'SF₆', name: 'sulfur hexafluoride', central: 'S', terminal: 'F', bonds: 6, lonePairs: 0,
    shape: 'octahedral', angles: '90° and 180°.' },
  { id: 'BrF5', formula: 'BrF₅', name: 'bromine pentafluoride', central: 'Br', terminal: 'F', bonds: 5, lonePairs: 1,
    shape: 'square pyramidal', angles: 'ideally 90° and 180°; the lone pair pushes the four lower F atoms up, closing their angles to the top F to about 85°.' },
  { id: 'XeF4', formula: 'XeF₄', name: 'xenon tetrafluoride', central: 'Xe', terminal: 'F', bonds: 4, lonePairs: 2,
    shape: 'square planar', angles: '90° and 180°: the two lone pairs sit opposite each other.' },
];

export function moleculeById(id: string): Molecule | undefined {
  return MOLECULES.find((m) => m.id === id);
}

export function domainCount(m: Molecule): DomainCount {
  const count = m.bonds + m.lonePairs;
  if (!isDomainCount(count)) {
    throw new RangeError(`${m.id} has ${count} electron domains; the viewer draws 2 to 6. Fix its entry in src/lib/vsepr.ts.`);
  }
  return count;
}

export function electronGeometry(m: Molecule): string {
  return GEOMETRY[domainCount(m)];
}

/** Sizes in drawing units, shared by the viewer and the test that its start views are clear. */
export const DRAWING = {
  bondLength: 95,
  centralRadius: 21,
  terminalRadius: 15,
  hydrogenRadius: 12,
  /** How far out a lone pair's lobe sits, as a share of a bond length. */
  lonePairReach: 0.55,
  /** Half the width of a lone pair's lobe. */
  lonePairWidth: 9,
  /** A lobe lying flat across the screen is this much longer than it is wide. */
  lonePairStretch: 7,
  /** A terminal atom straight in front is drawn this much larger, one straight behind this much smaller. */
  depthScale: 0.12,
} as const;

export interface View {
  /** Degrees about the vertical axis. */
  readonly yaw: number;
  /** Degrees about the horizontal axis. */
  readonly pitch: number;
}

// One view per geometry, found by searching for the yaw and pitch that keep
// every atom and lone pair of that geometry's molecules apart on screen. No
// single view does that for all five: at any tilt that suits the tetrahedron,
// a trigonal bipyramid's atoms cover one another.
const START_VIEWS: Record<DomainCount, View> = {
  2: { yaw: 25, pitch: 20 },
  3: { yaw: 25, pitch: 20 },
  4: { yaw: 25, pitch: 20 },
  5: { yaw: -60, pitch: 40 },
  6: { yaw: -60, pitch: 20 },
};

/** The view a molecule is first shown at, and returns to on "Reset view". */
export function startView(m: Molecule): View {
  return START_VIEWS[domainCount(m)];
}

/** What the viewer draws, as a circle (the lobe of a lone pair counts at its full half-length). */
interface FootprintBase {
  /** Stable from one view to the next, so a drawing can keep its elements. */
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  /** Larger is nearer the viewer. */
  readonly depth: number;
}

export type Footprint =
  | (FootprintBase & { readonly kind: 'central' })
  | (FootprintBase & {
      readonly kind: 'atom';
      /** Which bond it ends, in the order of placeDomains. */
      readonly index: number;
    })
  | (FootprintBase & {
      readonly kind: 'pair';
      /** Half the width of the lobe, across its length. */
      readonly width: number;
      /** Which way the lobe lies on the screen, in degrees (SVG's: y grows downward). */
      readonly angle: number;
      /** The same direction as a unit vector. */
      readonly along: { readonly x: number; readonly y: number };
    });

/**
 * Where, and how big, the viewer draws the central atom, each terminal atom and
 * each lone pair for a molecule seen from a view. The component draws from
 * this and the start-view test measures it, so the two cannot disagree.
 */
export function footprints(m: Molecule, view: View, center: { x: number; y: number }): Footprint[] {
  const { bonds, lonePairs } = placeDomains(domainCount(m), m.lonePairs);
  const size = m.terminal === 'H' ? DRAWING.hydrogenRadius : DRAWING.terminalRadius;
  return [
    { kind: 'central', id: 'central', x: center.x, y: center.y, r: DRAWING.centralRadius, depth: 0 },
    ...bonds.map((direction, index): Footprint => {
      const end = project(rotate(direction, view.yaw, view.pitch), DRAWING.bondLength, center);
      return { kind: 'atom', id: `atom-${index}`, index, x: end.x, y: end.y, r: size * (1 + DRAWING.depthScale * end.depth), depth: end.depth };
    }),
    ...lonePairs.map((direction, index): Footprint => {
      const turned = rotate(direction, view.yaw, view.pitch);
      const at = project(turned, DRAWING.bondLength * DRAWING.lonePairReach, center);
      const across = Math.hypot(turned.x, turned.y);
      // A lobe pointing straight at the viewer is a circle with no "across"
      // direction, so its two dots are simply set side by side.
      const along = across > 0.05 ? { x: turned.x / across, y: -turned.y / across } : { x: 1, y: 0 };
      return {
        kind: 'pair',
        id: `pair-${index}`,
        x: at.x,
        y: at.y,
        r: DRAWING.lonePairWidth + DRAWING.lonePairStretch * across,
        width: DRAWING.lonePairWidth,
        angle: (Math.atan2(along.y, along.x) * 180) / Math.PI,
        along,
        depth: at.depth,
      };
    }),
  ];
}

function lonePairText(count: number): string {
  if (count === 0) return 'no lone pairs';
  return count === 1 ? '1 lone pair' : `${count} lone pairs`;
}

/** The sentence under the drawing. */
export function shapeReadout(m: Molecule): string {
  const domains = `${m.formula}: ${domainCount(m)} electron domains around ${m.central} (${m.bonds} bonds, ${lonePairText(m.lonePairs)}).`;
  return [
    domains,
    ...(m.note ? [m.note] : []),
    `Electron geometry: ${electronGeometry(m)}.`,
    `Molecular shape: ${m.shape}.`,
    `Angles: ${m.angles}`,
  ].join(' ');
}

/** The drawing's accessible name. */
export function shapeDescription(m: Molecule): string {
  return (
    `3D model of ${m.formula}: ${m.central} in the middle with ${m.bonds} bonds to ${m.terminal} atoms ` +
    `and ${lonePairText(m.lonePairs)}, ${/^[aeiou]/i.test(m.shape) ? 'an' : 'a'} ${m.shape} shape.`
  );
}
