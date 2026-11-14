import { describe, expect, it } from 'vitest';
import {
  BONDS,
  FAMILIES,
  bondById,
  curvePoints,
  distanceAtEnergy,
  distanceReadout,
  potentialEnergy,
  sliderRange,
} from '../../src/lib/bonding';

const ALL_BONDS = Object.values(BONDS);

function bond(id: string) {
  const found = bondById(id);
  if (!found) throw new Error(`no bond ${id}`);
  return found;
}

describe('bond data', () => {
  it('has the typical bond lengths and energies of the carbon-carbon bonds', () => {
    expect(FAMILIES.carbon.bonds.map((b) => [b.name, b.length, b.energy])).toEqual([
      ['C–C', 154, 347],
      ['C=C', 134, 614],
      ['C≡C', 120, 839],
    ]);
  });

  it('has the typical bond lengths and energies of the halogens', () => {
    expect(FAMILIES.halogens.bonds.map((b) => [b.name, b.length, b.energy])).toEqual([
      ['Cl–Cl', 199, 242],
      ['Br–Br', 228, 193],
      ['I–I', 267, 151],
    ]);
  });

  it('finds a bond by its id, and nothing for an unknown id', () => {
    expect(bond('c-double').name).toBe('C=C');
    expect(bondById('x-y')).toBeUndefined();
  });
});

describe('potentialEnergy', () => {
  for (const b of ALL_BONDS) {
    it(`${b.name}: is lowest at the bond length, ${b.energy} kJ/mol below the separate atoms`, () => {
      const atBondLength = potentialEnergy(b, b.length);

      expect(atBondLength).toBeCloseTo(-b.energy, 9);
      expect(potentialEnergy(b, b.length - 1)).toBeGreaterThan(atBondLength);
      expect(potentialEnergy(b, b.length + 1)).toBeGreaterThan(atBondLength);
    });

    it(`${b.name}: climbs above zero and more steeply when the nuclei are pushed closer`, () => {
      const closer = potentialEnergy(b, b.length - 30) - potentialEnergy(b, b.length);
      const farther = potentialEnergy(b, b.length + 30) - potentialEnergy(b, b.length);

      expect(closer).toBeGreaterThan(2 * farther);
      expect(potentialEnergy(b, b.length - 50)).toBeGreaterThan(0);
    });

    it(`${b.name}: approaches zero from below as the atoms separate`, () => {
      for (const extra of [50, 100, 200]) expect(potentialEnergy(b, b.length + extra)).toBeLessThan(0);

      expect(Math.abs(potentialEnergy(b, b.length + 400))).toBeLessThan(0.01 * b.energy);
    });
  }

  it('rejects a distance that is not a positive number', () => {
    expect(() => potentialEnergy(bond('c-single'), 0)).toThrow(/positive/);
    expect(() => potentialEnergy(bond('c-single'), Number.NaN)).toThrow(/positive/);
  });
});

describe('distanceAtEnergy', () => {
  it('finds the distance inside the bond length where the energy reaches a value', () => {
    const b = bond('c-single');

    const r = distanceAtEnergy(b, 300);

    expect(r).toBeLessThan(b.length);
    expect(potentialEnergy(b, r)).toBeCloseTo(300, 6);
  });

  it('rejects an energy below the bottom of the well', () => {
    expect(() => distanceAtEnergy(bond('c-single'), -400)).toThrow(/-347/);
  });
});

describe('curvePoints', () => {
  for (const [name, family] of Object.entries(FAMILIES)) {
    it(`keeps every ${name} curve inside its graph, from the top of the graph out to its right edge`, () => {
      for (const b of family.bonds) {
        const points = curvePoints(b, family.axis);
        const first = points[0];
        const last = points.at(-1);
        if (!first || !last) throw new Error('no points');

        expect(first.energy).toBeCloseTo(family.axis.maxEnergy, 6);
        expect(last.distance).toBe(family.axis.maxDistance);
        for (const p of points) {
          expect(p.energy).toBeLessThanOrEqual(family.axis.maxEnergy + 1e-9);
          expect(p.energy).toBeGreaterThanOrEqual(family.axis.minEnergy);
        }
      }
    });
  }

  it('includes the bottom of the well', () => {
    const b = bond('cl');

    const lowest = Math.min(...curvePoints(b, FAMILIES.halogens.axis).map((p) => p.energy));

    expect(lowest).toBe(-b.energy);
  });
});

describe('sliderRange', () => {
  it('starts where the curve enters the graph and ends at its right edge', () => {
    for (const family of Object.values(FAMILIES)) {
      for (const b of family.bonds) {
        const range = sliderRange(b, family.axis);

        expect(Number.isInteger(range.min)).toBe(true);
        expect(potentialEnergy(b, range.min)).toBeLessThanOrEqual(family.axis.maxEnergy);
        expect(range.min).toBeLessThan(b.length - 15);
        expect(range.max).toBe(family.axis.maxDistance);
      }
    }
  });
});

describe('distanceReadout', () => {
  const single = bond('c-single');
  const JOINER = String.fromCharCode(0x2060);
  // The readout joins "C–C" with invisible word joiners; the sentences below are written without them.
  const distanceReadoutText = (b: typeof single, r: number) => distanceReadout(b, r).replaceAll(JOINER, '');

  it('keeps a bond name with a dash on one line', () => {
    expect(distanceReadout(single, 154)).toContain(`C${JOINER}–${JOINER}C`);
  });

  it('names the bond length and the depth of the well at the bond length', () => {
    expect(distanceReadoutText(single, 154)).toBe(
      'The nuclei are 154 pm apart, the bond length of C–C. The energy is at its lowest: 347 kJ/mol below that of the separate atoms.',
    );
  });

  it('says the energy is close to its lowest within a few pm of the bond length', () => {
    expect(distanceReadoutText(single, 156)).toBe(
      'The nuclei are 156 pm apart, close to the bond length of C–C (154 pm). The energy is close to its lowest value, which is 347 kJ/mol below that of the separate atoms.',
    );
  });

  // Attraction does not stop inside the bond length; repulsion outweighs it.
  it('says repulsion outweighs attraction when the nuclei are closer than the bond length', () => {
    expect(distanceReadoutText(single, 120)).toBe(
      'The nuclei are 120 pm apart, closer than the bond length (154 pm). Repulsion now outweighs attraction, and the closer the nuclei go, the more steeply the energy climbs.',
    );
  });

  it('says the atoms pull back together when they are farther apart', () => {
    expect(distanceReadoutText(single, 250)).toBe(
      'The nuclei are 250 pm apart, farther than the bond length (154 pm). The atoms pull back toward each other; far enough apart they no longer interact and the energy is zero.',
    );
  });

  it('uses the bond it is given', () => {
    expect(distanceReadoutText(bond('i'), 267)).toContain('the bond length of I–I. The energy is at its lowest: 151 kJ/mol');
  });
});
