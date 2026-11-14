import { describe, expect, it } from 'vitest';
import {
  DRAWING,
  MOLECULES,
  depthOrder,
  domainCount,
  domainVectors,
  electronGeometry,
  footprints,
  moleculeById,
  placeDomains,
  project,
  rotate,
  shapeDescription,
  shapeReadout,
  startView,
  type Vec3,
} from '../../src/lib/vsepr';

const length = (v: Vec3) => Math.hypot(v.x, v.y, v.z);
const angle = (a: Vec3, b: Vec3) =>
  (Math.acos(Math.min(1, Math.max(-1, (a.x * b.x + a.y * b.y + a.z * b.z) / (length(a) * length(b))))) * 180) / Math.PI;

/** Every angle between two different vectors, rounded to a tenth of a degree. */
function angles(vectors: readonly Vec3[]): number[] {
  const found: number[] = [];
  vectors.forEach((a, i) => vectors.slice(i + 1).forEach((b) => found.push(Math.round(angle(a, b) * 10) / 10)));
  return found;
}

function molecule(id: string) {
  const found = moleculeById(id);
  if (!found) throw new Error(`no molecule ${id}`);
  return found;
}

describe('domainVectors', () => {
  for (const count of [2, 3, 4, 5, 6] as const) {
    it(`gives ${count} unit vectors for ${count} domains`, () => {
      const vectors = domainVectors(count);

      expect(vectors).toHaveLength(count);
      for (const v of vectors) expect(length(v)).toBeCloseTo(1, 9);
    });
  }

  it('puts two domains 180° apart', () => {
    expect(angles(domainVectors(2))).toEqual([180]);
  });

  it('puts three domains 120° apart in a plane', () => {
    const vectors = domainVectors(3);

    expect(angles(vectors)).toEqual([120, 120, 120]);
    expect(vectors.map((v) => v.z)).toEqual([0, 0, 0]);
  });

  it('puts four domains 109.5° apart', () => {
    expect(new Set(angles(domainVectors(4)))).toEqual(new Set([109.5]));
  });

  it('puts five domains at 90°, 120° and 180°: three around the middle and two on the axis', () => {
    const found = angles(domainVectors(5)).sort((a, b) => a - b);

    expect(found).toEqual([90, 90, 90, 90, 90, 90, 120, 120, 120, 180]);
  });

  it('puts six domains at 90° and 180°', () => {
    const found = angles(domainVectors(6));

    expect(found.filter((a) => a === 90)).toHaveLength(12);
    expect(found.filter((a) => a === 180)).toHaveLength(3);
  });
});

describe('placeDomains', () => {
  const isEquatorial = (v: Vec3) => Math.abs(v.y) < 1e-9;

  it('puts the lone pair of a seesaw molecule in the middle, not on the axis', () => {
    const { lonePairs, bonds } = placeDomains(5, 1);

    expect(lonePairs).toHaveLength(1);
    expect(lonePairs.every(isEquatorial)).toBe(true);
    expect(bonds).toHaveLength(4);
  });

  it('puts both lone pairs of a T-shaped molecule in the middle', () => {
    expect(placeDomains(5, 2).lonePairs.every(isEquatorial)).toBe(true);
  });

  it('leaves a linear molecule when three lone pairs fill the middle of five domains', () => {
    const { lonePairs, bonds } = placeDomains(5, 3);

    expect(lonePairs.every(isEquatorial)).toBe(true);
    expect(angles(bonds)).toEqual([180]);
  });

  it('puts two lone pairs of six domains opposite each other', () => {
    const { lonePairs, bonds } = placeDomains(6, 2);

    expect(angles(lonePairs)).toEqual([180]);
    expect(new Set(angles(bonds))).toEqual(new Set([90, 180]));
  });

  it('puts the bonds of a square pyramid all on one side of the lone pair or around it', () => {
    const { lonePairs, bonds } = placeDomains(6, 1);
    const [pair] = lonePairs;
    if (!pair) throw new Error('no lone pair');

    expect(bonds.map((b) => Math.round(angle(pair, b))).sort((a, b) => a - b)).toEqual([90, 90, 90, 90, 180]);
  });

  it('rejects more lone pairs than domains less one bond, saying how many are allowed', () => {
    expect(() => placeDomains(4, 4)).toThrow(RangeError);
    expect(() => placeDomains(4, 4)).toThrow(/needs 0 to 3 lone pairs \(at least one bond\)/);
  });

  it('rejects a negative number of lone pairs', () => {
    expect(() => placeDomains(4, -1)).toThrow(RangeError);
  });

  it('rejects a number of lone pairs that is not whole', () => {
    expect(() => placeDomains(4, 1.5)).toThrow(RangeError);
  });

  it('accepts none and the most it allows, domains less one', () => {
    expect(placeDomains(4, 0).lonePairs).toHaveLength(0);
    expect(placeDomains(4, 3).bonds).toHaveLength(1);
  });
});

describe('rotate and project', () => {
  it('leaves a vector alone with no turn', () => {
    expect(rotate({ x: 0.3, y: -0.4, z: 0.5 }, 0, 0)).toEqual({ x: 0.3, y: -0.4, z: 0.5 });
  });

  it('turning right moves the front of the molecule to the right', () => {
    const turned = rotate({ x: 0, y: 0, z: 1 }, 15, 0);

    expect(turned.x).toBeGreaterThan(0);
    expect(turned.y).toBeCloseTo(0, 9);
  });

  it('tipping down moves the front of the molecule down the screen', () => {
    const tipped = rotate({ x: 0, y: 0, z: 1 }, 0, 15);
    const onScreen = project(tipped, 100, { x: 150, y: 130 });

    expect(onScreen.y).toBeGreaterThan(130);
  });

  it('keeps lengths and angles', () => {
    const [a, b] = domainVectors(4).map((v) => rotate(v, 40, -25));
    if (!a || !b) throw new Error('missing vectors');

    expect(length(a)).toBeCloseTo(1, 9);
    expect(angle(a, b)).toBeCloseTo(109.47, 1);
  });

  it('draws x to the right and y up, and keeps how near each point is', () => {
    expect(project({ x: 0.5, y: 0.5, z: -0.2 }, 100, { x: 150, y: 130 })).toEqual({ x: 200, y: 80, depth: -0.2 });
  });

  it('orders things from farthest to nearest, so nearer ones are drawn on top', () => {
    const order = depthOrder([
      { name: 'front', depth: 0.9 },
      { name: 'back', depth: -0.8 },
      { name: 'middle', depth: 0 },
    ]);

    expect(order.map((item) => item.name)).toEqual(['back', 'middle', 'front']);
  });
});

describe('molecules', () => {
  const expected: [string, number, number, string, string][] = [
    ['CO2', 2, 0, 'linear', 'linear'],
    ['BF3', 3, 0, 'trigonal planar', 'trigonal planar'],
    ['SO2', 2, 1, 'trigonal planar', 'bent'],
    ['CH4', 4, 0, 'tetrahedral', 'tetrahedral'],
    ['NH3', 3, 1, 'tetrahedral', 'trigonal pyramidal'],
    ['H2O', 2, 2, 'tetrahedral', 'bent'],
    ['PCl5', 5, 0, 'trigonal bipyramidal', 'trigonal bipyramidal'],
    ['SF4', 4, 1, 'trigonal bipyramidal', 'seesaw'],
    ['ClF3', 3, 2, 'trigonal bipyramidal', 'T-shaped'],
    ['XeF2', 2, 3, 'trigonal bipyramidal', 'linear'],
    ['SF6', 6, 0, 'octahedral', 'octahedral'],
    ['BrF5', 5, 1, 'octahedral', 'square pyramidal'],
    ['XeF4', 4, 2, 'octahedral', 'square planar'],
  ];

  it('lists the thirteen molecules in order of their domains', () => {
    expect(MOLECULES.map((m) => m.id)).toEqual(expected.map(([id]) => id));
  });

  for (const [id, bonds, lonePairs, geometry, shape] of expected) {
    it(`${id}: ${bonds} bonds and ${lonePairs} lone pairs, ${geometry} domains, ${shape}`, () => {
      const m = molecule(id);

      expect([m.bonds, m.lonePairs, electronGeometry(m), m.shape]).toEqual([bonds, lonePairs, geometry, shape]);
    });
  }

  it('finds nothing for an unknown id', () => {
    expect(moleculeById('XY9')).toBeUndefined();
  });
});

describe('domainCount', () => {
  const withDomains = (bonds: number, lonePairs: number) => ({ ...molecule('CH4'), bonds, lonePairs });

  it('adds the bonds and the lone pairs', () => {
    expect(domainCount(molecule('SF4'))).toBe(5);
  });

  it('accepts the fewest and the most domains the viewer draws', () => {
    expect(domainCount(withDomains(2, 0))).toBe(2);
    expect(domainCount(withDomains(3, 3))).toBe(6);
  });

  it('rejects one domain', () => {
    expect(() => domainCount(withDomains(1, 0))).toThrow(RangeError);
  });

  it('rejects seven domains', () => {
    expect(() => domainCount(withDomains(6, 1))).toThrow(RangeError);
  });
});

describe('footprints', () => {
  const center = { x: 150, y: 135 };
  const faceOn = { yaw: 0, pitch: 0 };
  const only = <K extends 'central' | 'atom' | 'pair'>(shapes: ReturnType<typeof footprints>, kind: K) =>
    shapes.filter((s): s is Extract<(typeof shapes)[number], { kind: K }> => s.kind === kind);

  it('draws the central atom at the center, at its own size', () => {
    const [middle] = only(footprints(molecule('CH4'), faceOn, center), 'central');

    expect(middle).toMatchObject({ x: 150, y: 135, r: DRAWING.centralRadius, depth: 0 });
  });

  it('draws one atom per bond, numbered in the order of its bond', () => {
    const atoms = only(footprints(molecule('SF4'), faceOn, center), 'atom');

    expect(atoms.map((a) => a.index)).toEqual([0, 1, 2, 3]);
  });

  it('draws a hydrogen at the hydrogen size, bigger when nearer the viewer', () => {
    const [top, , near] = only(footprints(molecule('CH4'), faceOn, center), 'atom');
    if (!top || !near) throw new Error('missing atoms');

    // Methane's first bond lies in the screen plane, straight up; its third points toward the viewer.
    expect(top.x).toBeCloseTo(150, 9);
    expect(top.y).toBeCloseTo(135 - DRAWING.bondLength, 9);
    expect(top.r).toBeCloseTo(DRAWING.hydrogenRadius, 9);
    expect(near.depth).toBeGreaterThan(0.8);
    expect(near.r).toBeCloseTo(DRAWING.hydrogenRadius * (1 + DRAWING.depthScale * near.depth), 9);
  });

  it('draws any other terminal atom at the terminal size', () => {
    const [first] = only(footprints(molecule('SF6'), faceOn, center), 'atom');

    expect(first?.r).toBeCloseTo(DRAWING.terminalRadius, 9);
  });

  it('draws a lone pair as a lobe part of the way out its direction, as long as it lies across the screen', () => {
    const [lobe] = only(footprints(molecule('H2O'), faceOn, center), 'pair');

    // Water's first lone pair points straight up the screen.
    expect(lobe).toMatchObject({ kind: 'pair', width: DRAWING.lonePairWidth });
    expect(lobe?.x).toBeCloseTo(150, 9);
    expect(lobe?.y).toBeCloseTo(135 - DRAWING.bondLength * DRAWING.lonePairReach, 9);
    expect(lobe?.r).toBeCloseTo(DRAWING.lonePairWidth + DRAWING.lonePairStretch, 9);
    expect(lobe?.angle).toBeCloseTo(-90, 9);
  });

  it('draws a lobe pointing at the viewer as a circle, with its dots set side by side', () => {
    const [lobe] = only(footprints(molecule('H2O'), { yaw: 0, pitch: 90 }, center), 'pair');

    expect(lobe?.r).toBeCloseTo(DRAWING.lonePairWidth, 6);
    expect(lobe?.along).toEqual({ x: 1, y: 0 });
    expect(lobe?.angle).toBe(0);
  });

  it('has one lobe for each lone pair and none for a molecule without', () => {
    expect(only(footprints(molecule('XeF2'), faceOn, center), 'pair')).toHaveLength(3);
    expect(only(footprints(molecule('CH4'), faceOn, center), 'pair')).toHaveLength(0);
  });

  it('gives every footprint its own id', () => {
    const ids = footprints(molecule('ClF3'), faceOn, center).map((s) => s.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('startView', () => {
  for (const m of MOLECULES) {
    it(`${m.id}: in its start view no atom or lone pair covers another`, () => {
      // Every drawn circle at its size in that view; a lobe counts at its full length.
      const drawn = footprints(m, startView(m), { x: 0, y: 0 });

      drawn.forEach((a, i) =>
        drawn.slice(i + 1).forEach((b) => expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(a.r + b.r)),
      );
    });
  }

  it('starts methane at 25° of yaw and 20° of pitch', () => {
    expect(startView(molecule('CH4'))).toEqual({ yaw: 25, pitch: 20 });
  });
});

describe('shapeReadout', () => {
  it('describes a molecule with a lone pair in full', () => {
    expect(shapeReadout(molecule('SF4'))).toBe(
      'SF₄: 5 electron domains around S (4 bonds, 1 lone pair). Electron geometry: trigonal bipyramidal. ' +
        'Molecular shape: seesaw. Angles: ideally 90°, 120° and 180°; the lone pair squeezes them, closing the 120° angle to about 102°.',
    );
  });

  // Lone pairs on five and six domains squeeze the angles a lot (SF4's 120° closes to about 102°), so
  // "slightly" would mislead.
  it.each([
    ['ClF3', 'ideally 90° and 180°; the lone pairs squeeze them, the 90° angles to about 87.5°.'],
    // Only the angles to the top F close up; the angles between neighboring base F atoms stay near 90°.
    ['BrF5', 'ideally 90° and 180°; the lone pair pushes the four lower F atoms up, closing their angles to the top F to about 85°.'],
  ])('gives the squeezed angle for %s', (formula, angles) => {
    expect(shapeReadout(molecule(formula))).toContain(`Angles: ${angles}`);
  });

  it('describes methane, the starting molecule', () => {
    expect(shapeReadout(molecule('CH4'))).toBe(
      'CH₄: 4 electron domains around C (4 bonds, no lone pairs). Electron geometry: tetrahedral. ' +
        'Molecular shape: tetrahedral. Angles: 109.5°.',
    );
  });

  it('says how much the lone pairs of water close the angle', () => {
    expect(shapeReadout(molecule('H2O'))).toContain('Angles: a little less than 109.5° (about 104.5°)');
  });

  it('says a double bond counts as one domain', () => {
    expect(shapeReadout(molecule('CO2'))).toContain('(2 bonds, no lone pairs). Each double bond counts as one domain.');
  });
});

describe('shapeDescription', () => {
  it('names the shape, the bonds and the lone pairs for the drawing', () => {
    expect(shapeDescription(molecule('NH3'))).toBe(
      '3D model of NH₃: N in the middle with 3 bonds to H atoms and 1 lone pair, a trigonal pyramidal shape.',
    );
  });

  it('says "an" before a shape that starts with a vowel', () => {
    expect(shapeDescription(molecule('SF6'))).toContain(', an octahedral shape.');
  });
});
