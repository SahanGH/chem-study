/**
 * Potential energy against the distance between two bonded nuclei, for the
 * bond-energy diagram in lesson 2.2. No DOM here, so it is testable directly.
 *
 * Each curve is a Morse potential, E(r) = D[(1 - e^(-a(r - r0)))^2 - 1]: lowest
 * (-D) at the bond length r0, steep when the nuclei are pushed closer, and
 * rising toward zero as the atoms separate. The bond lengths and energies are
 * typical values; the shapes (the width parameter a) are illustrative.
 */

export interface Bond {
  readonly id: string;
  /** "C–C", "C=C", "C≡C": how the bond is written. */
  readonly name: string;
  /** The element on each end, drawn in the picture of the two atoms. */
  readonly symbol: string;
  /** Bond length r0, in pm. */
  readonly length: number;
  /** Bond energy D, in kJ/mol: the depth of the well. */
  readonly energy: number;
  /** Morse width parameter a, in 1/pm. Larger is a narrower, stiffer well. */
  readonly stiffness: number;
}

export interface Axis {
  /** The graph runs from 0 pm to this distance. */
  readonly maxDistance: number;
  /** kJ/mol at the bottom and the top of the graph. */
  readonly minEnergy: number;
  readonly maxEnergy: number;
  readonly distanceTicks: readonly number[];
  readonly energyTicks: readonly number[];
}

export type FamilyId = 'carbon' | 'halogens';

export interface Family {
  readonly label: string;
  readonly bonds: readonly Bond[];
  readonly axis: Axis;
}

// a values follow each bond's stiffness (a = sqrt(k / 2D)) closely enough
// that a stiffer bond draws a narrower well.
export const BONDS = {
  'c-single': { id: 'c-single', name: 'C–C', symbol: 'C', length: 154, energy: 347, stiffness: 0.0198 },
  'c-double': { id: 'c-double', name: 'C=C', symbol: 'C', length: 134, energy: 614, stiffness: 0.0216 },
  'c-triple': { id: 'c-triple', name: 'C≡C', symbol: 'C', length: 120, energy: 839, stiffness: 0.0239 },
  cl: { id: 'cl', name: 'Cl–Cl', symbol: 'Cl', length: 199, energy: 243, stiffness: 0.02 },
  br: { id: 'br', name: 'Br–Br', symbol: 'Br', length: 228, energy: 193, stiffness: 0.0196 },
  i: { id: 'i', name: 'I–I', symbol: 'I', length: 267, energy: 151, stiffness: 0.0185 },
} as const satisfies Record<string, Bond>;

export const FAMILIES: Readonly<Record<FamilyId, Family>> = {
  carbon: {
    label: 'Bond order (carbon–carbon)',
    bonds: [BONDS['c-single'], BONDS['c-double'], BONDS['c-triple']],
    // 300 pm is far enough to see the curves level off, and keeps the three
    // wells wide enough to label.
    axis: {
      maxDistance: 300,
      minEnergy: -960,
      maxEnergy: 200,
      distanceTicks: [100, 200, 300],
      energyTicks: [-800, -400, 0],
    },
  },
  halogens: {
    label: 'Atom size (halogens)',
    bonds: [BONDS.cl, BONDS.br, BONDS.i],
    axis: {
      maxDistance: 500,
      minEnergy: -300,
      maxEnergy: 150,
      distanceTicks: [100, 200, 300, 400, 500],
      energyTicks: [-200, -100, 0, 100],
    },
  },
};

/** Within this many pm of the bond length, the readout says the atoms are at it. */
export const NEAR_BOND_LENGTH = 3;
/** Distance between the points of a drawn curve, in pm. */
const CURVE_STEP = 2;

export function bondById(id: string): Bond | undefined {
  return Object.values(BONDS).find((bond) => bond.id === id);
}

/** Potential energy in kJ/mol, measured from the separate atoms, at a distance r in pm. */
export function potentialEnergy(bond: Bond, r: number): number {
  if (!(Number.isFinite(r) && r > 0)) {
    throw new RangeError(`The distance between the nuclei must be a positive number of pm, not ${r}.`);
  }
  const stretch = 1 - Math.exp(-bond.stiffness * (r - bond.length));
  return bond.energy * (stretch * stretch - 1);
}

/** The distance inside the bond length at which the energy reaches a value: the repulsive wall. */
export function distanceAtEnergy(bond: Bond, energy: number): number {
  if (!(Number.isFinite(energy) && energy >= -bond.energy)) {
    throw new RangeError(
      `${bond.name} never reaches ${energy} kJ/mol: its energy is never below -${bond.energy} kJ/mol.`,
    );
  }
  // Solving E = D[(1 - e^(-a(r - r0)))^2 - 1] on the inner side, where the bracket is negative.
  return bond.length - Math.log(1 + Math.sqrt(1 + energy / bond.energy)) / bond.stiffness;
}

export interface CurvePoint {
  readonly distance: number;
  readonly energy: number;
}

/** Points along a curve, from where it enters the top of its graph out to the right edge. */
export function curvePoints(bond: Bond, axis: Axis): CurvePoint[] {
  const wall = distanceAtEnergy(bond, axis.maxEnergy);
  const distances = [wall];
  for (let r = Math.ceil(wall / CURVE_STEP) * CURVE_STEP; r <= axis.maxDistance; r += CURVE_STEP) {
    if (r > wall) distances.push(r);
  }
  // The bottom of the well is drawn exactly, wherever the steps fall.
  if (!distances.includes(bond.length)) distances.push(bond.length);
  return distances
    .sort((a, b) => a - b)
    .map((distance) => ({
      distance,
      // At the wall the formula's rounding can land a hair above the top.
      energy: distance === wall ? axis.maxEnergy : potentialEnergy(bond, distance),
    }));
}

/** The distances the slider offers for a bond: whole pm from the top of the graph to its right edge. */
export function sliderRange(bond: Bond, axis: Axis): { min: number; max: number } {
  return { min: Math.ceil(distanceAtEnergy(bond, axis.maxEnergy)), max: axis.maxDistance };
}

/** Word joiners keep "C–C" on one line: a line may otherwise break after the dash. */
const WORD_JOINER = String.fromCharCode(0x2060);
const unbroken = (name: string) => name.replaceAll('–', `${WORD_JOINER}–${WORD_JOINER}`);

/** What the diagram says about the atoms at a distance r, in pm. */
export function distanceReadout(bond: Bond, r: number): string {
  const apart = `The nuclei are ${r} pm apart`;
  const depth = `${bond.energy} kJ/mol below that of the separate atoms`;
  const name = unbroken(bond.name);
  if (r === bond.length) {
    return `${apart}, the bond length of ${name}. The energy is at its lowest: ${depth}.`;
  }
  if (Math.abs(r - bond.length) <= NEAR_BOND_LENGTH) {
    return `${apart}, close to the bond length of ${name} (${bond.length} pm). The energy is close to its lowest value, which is ${depth}.`;
  }
  if (r < bond.length) {
    // Attraction does not stop inside the bond length; repulsion outweighs it.
    return `${apart}, closer than the bond length (${bond.length} pm). Repulsion now outweighs attraction, and the closer the nuclei go, the more steeply the energy climbs.`;
  }
  return (
    `${apart}, farther than the bond length (${bond.length} pm). ` +
    'The atoms pull back toward each other; far enough apart they no longer interact and the energy is zero.'
  );
}
