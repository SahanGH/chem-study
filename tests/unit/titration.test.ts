import { describe, expect, it } from 'vitest';
import {
  ACID_IDS,
  ACIDS,
  AXES,
  BASE_MICROMOLES_PER_ML,
  FLASK,
  MICROMOLES_PER_MILLIMOLE,
  VOLUME,
  describeFlask,
  describeGraph,
  equivalenceVolume,
  linePoints,
  readout,
  shown,
  shownVolume,
  state,
  volumeText,
  type AcidId,
  type GraphPoint,
} from '../../src/lib/titration';

const BOTH_ACIDS: AcidId[] = ['lactic', 'tartaric'];
// Computed as halves of a mL: a whole number over 2 is exact in binary, so these are exactly the
// 81 volumes the slider reaches, from 0 to 40 mL in steps of 0.5.
const ALL_VOLUMES: number[] = Array.from({ length: 81 }, (_, i) => i / 2);

const everyState = BOTH_ACIDS.flatMap((acid) => ALL_VOLUMES.map((volume) => ({ acid, volume })));

describe('the acids, the flask and the slider', () => {
  it('has lactic acid with one proton and tartaric acid with two', () => {
    expect(ACIDS.lactic).toMatchObject({ name: 'lactic acid', protons: 1 });
    expect(ACIDS.tartaric).toMatchObject({ name: 'tartaric acid', protons: 2 });
  });

  it('words the two radio buttons', () => {
    expect(ACIDS.lactic.label).toBe('Lactic acid (gives up one proton)');
    expect(ACIDS.tartaric.label).toBe('Tartaric acid (gives up two)');
  });

  it('lists the acids by id, in the order of the radio buttons', () => {
    expect(ACID_IDS).toEqual(['lactic', 'tartaric']);
  });

  it('has 1000 micromoles in a millimole', () => {
    expect(MICROMOLES_PER_MILLIMOLE).toBe(1000);
  });

  it('has 20 mL of acid holding 3000 micromoles, and 200 micromoles of OH⁻ in each mL of base', () => {
    expect(FLASK).toEqual({ volumeMl: 20, acidMicromoles: 3000 });
    expect(BASE_MICROMOLES_PER_ML).toBe(200);
  });

  it('has a slider from 0 to 40 mL in steps of 0.5, starting at 10', () => {
    expect(VOLUME).toEqual({ min: 0, max: 40, step: 0.5, start: 10 });
  });

  it('draws the amount axis from 0 to 6000 micromoles and the volume axis from 0 to 40 mL', () => {
    expect(AXES).toEqual({ volumeMax: 40, micromolesMax: 6000 });
  });
});

describe('state', () => {
  it.each([
    ['lactic', 0, { added: 0, start: 3000, protonsLeft: 3000, excess: 0, stage: 'before', flask: 'yellow' }],
    ['lactic', 10, { added: 2000, start: 3000, protonsLeft: 1000, excess: 0, stage: 'before', flask: 'yellow' }],
    ['lactic', 12, { added: 2400, start: 3000, protonsLeft: 600, excess: 0, stage: 'before', flask: 'yellow' }],
    ['lactic', 14.5, { added: 2900, start: 3000, protonsLeft: 100, excess: 0, stage: 'before', flask: 'yellow' }],
    ['lactic', 15, { added: 3000, start: 3000, protonsLeft: 0, excess: 0, stage: 'at', flask: 'blue' }],
    ['lactic', 15.5, { added: 3100, start: 3000, protonsLeft: 0, excess: 100, stage: 'past', flask: 'blue' }],
    ['lactic', 40, { added: 8000, start: 3000, protonsLeft: 0, excess: 5000, stage: 'past', flask: 'blue' }],
    ['tartaric', 15, { added: 3000, start: 6000, protonsLeft: 3000, excess: 0, stage: 'before', flask: 'yellow' }],
    ['tartaric', 29.5, { added: 5900, start: 6000, protonsLeft: 100, excess: 0, stage: 'before', flask: 'yellow' }],
    ['tartaric', 30, { added: 6000, start: 6000, protonsLeft: 0, excess: 0, stage: 'at', flask: 'blue' }],
    ['tartaric', 40, { added: 8000, start: 6000, protonsLeft: 0, excess: 2000, stage: 'past', flask: 'blue' }],
  ] as const)('gives the right state for %s acid at %s mL', (acid, volume, expected) => {
    expect(state(acid, volume)).toEqual(expected);
  });

  it.each([
    ['a volume off its step', 'lactic', 12.3],
    ['a volume above 40 mL', 'lactic', 41],
    ['a volume below 0 mL', 'lactic', -0.5],
    ['NaN', 'lactic', Number.NaN],
    ['an infinite volume', 'tartaric', Number.POSITIVE_INFINITY],
  ] as const)('throws for %s', (_what, acid, volume) => {
    expect(() => state(acid, volume)).toThrow(RangeError);
  });

  it('throws for an unknown acid, and names it and the acids to give instead', () => {
    // @ts-expect-error -- an acid the type forbids, on purpose
    expect(() => state('citric', 5)).toThrow(/lactic or tartaric.*"citric"/);
  });

  it('names the volume and the range in its message', () => {
    expect(() => state('lactic', 12.3)).toThrow(/12\.3 mL/);
    expect(() => state('lactic', 41)).toThrow(/0 to 40 mL/);
  });
});

describe('equivalenceVolume', () => {
  it('is 15 mL for lactic acid and 30 mL for tartaric acid', () => {
    expect(equivalenceVolume('lactic')).toBe(15);
    expect(equivalenceVolume('tartaric')).toBe(30);
  });

  it('throws for an unknown acid', () => {
    // @ts-expect-error -- an acid the type forbids, on purpose
    expect(() => equivalenceVolume('citric')).toThrow(/citric/);
  });
});

describe('linePoints', () => {
  it('gives the end points of the two lines for tartaric acid', () => {
    expect(linePoints('tartaric')).toEqual({
      protonsLeft: [
        { volume: 0, micromoles: 6000 },
        { volume: 30, micromoles: 0 },
        { volume: 40, micromoles: 0 },
      ],
      excess: [
        { volume: 0, micromoles: 0 },
        { volume: 30, micromoles: 0 },
        { volume: 40, micromoles: 2000 },
      ],
    });
  });

  it('gives the end points of the two lines for lactic acid', () => {
    expect(linePoints('lactic')).toEqual({
      protonsLeft: [
        { volume: 0, micromoles: 3000 },
        { volume: 15, micromoles: 0 },
        { volume: 40, micromoles: 0 },
      ],
      excess: [
        { volume: 0, micromoles: 0 },
        { volume: 15, micromoles: 0 },
        { volume: 40, micromoles: 5000 },
      ],
    });
  });

  it('puts every chosen state on its lines', () => {
    for (const { acid, volume } of everyState) {
      const { protonsLeft, excess } = linePoints(acid);
      const { protonsLeft: left, excess: over } = state(acid, volume);
      const at = (points: readonly [GraphPoint, GraphPoint, GraphPoint]) => {
        const [first, corner, last] = points;
        const [from, to] = volume <= corner.volume ? [first, corner] : [corner, last];
        return from.micromoles + ((volume - from.volume) / (to.volume - from.volume)) * (to.micromoles - from.micromoles);
      };
      expect(at(protonsLeft), `protons left, ${acid} at ${volume} mL`).toBeCloseTo(left, 6);
      expect(at(excess), `excess, ${acid} at ${volume} mL`).toBeCloseTo(over, 6);
    }
  });
});

describe('shown and shownVolume', () => {
  it.each([
    [600, '0.60'],
    [3000, '3.00'],
    [2400, '2.40'],
    [0, '0.00'],
    [100, '0.10'],
    [5000, '5.00'],
  ])('shows %s micromoles as %s millimoles', (micromoles, text) => {
    expect(shown(micromoles)).toBe(text);
  });

  it('refuses an amount it cannot show exactly in hundredths of a millimole', () => {
    expect(() => shown(605)).toThrow(RangeError);
    expect(() => shown(-100)).toThrow(RangeError);
    expect(() => shown(Number.NaN)).toThrow(RangeError);
  });

  it('shows a volume with one decimal place', () => {
    expect(shownVolume(12)).toBe('12.0');
    expect(shownVolume(14.5)).toBe('14.5');
    expect(shownVolume(0)).toBe('0.0');
    expect(shownVolume(40)).toBe('40.0');
  });

  it('refuses a volume the slider cannot reach', () => {
    expect(() => shownVolume(12.3)).toThrow(RangeError);
  });

  it('writes the slider value as spoken: 12.0 mL', () => {
    expect(volumeText(12)).toBe('12.0 mL');
  });
});

describe('over all 162 states the controls reach', () => {
  it('has 162 states', () => {
    expect(everyState).toHaveLength(162);
  });

  it('never has protons left and base in excess together', () => {
    for (const { acid, volume } of everyState) {
      const { protonsLeft, excess } = state(acid, volume);
      expect(protonsLeft > 0 && excess > 0, `${acid} at ${volume} mL`).toBe(false);
    }
  });

  it('accounts for all the base added: it neutralizes protons or is in excess', () => {
    for (const { acid, volume } of everyState) {
      const { added, start, protonsLeft, excess } = state(acid, volume);
      expect(added, `${acid} at ${volume} mL`).toBe(start - protonsLeft + excess);
    }
  });

  it('is at the equivalence point at exactly one volume for each acid', () => {
    for (const acid of BOTH_ACIDS) {
      const volumes = ALL_VOLUMES.filter((volume) => state(acid, volume).stage === 'at');
      expect(volumes, acid).toEqual([equivalenceVolume(acid)]);
    }
  });

  it('has a yellow flask below the equivalence volume and a blue one from it on', () => {
    for (const { acid, volume } of everyState) {
      const expected = volume < equivalenceVolume(acid) ? 'yellow' : 'blue';
      expect(state(acid, volume).flask, `${acid} at ${volume} mL`).toBe(expected);
    }
  });

  it('calls the stage "before" below the equivalence volume and "past" above it', () => {
    for (const { acid, volume } of everyState) {
      const equivalence = equivalenceVolume(acid);
      const expected = volume < equivalence ? 'before' : volume === equivalence ? 'at' : 'past';
      expect(state(acid, volume).stage, `${acid} at ${volume} mL`).toBe(expected);
    }
  });

  it('has tartaric acid reach equivalence at exactly twice the volume of lactic acid', () => {
    expect(equivalenceVolume('tartaric')).toBe(2 * equivalenceVolume('lactic'));
  });

  it('gives every state a readout that opens with its own volume, or says no base has been added', () => {
    for (const { acid, volume } of everyState) {
      const sentence = readout(acid, volume);
      if (volume === 0) expect(sentence.startsWith('No base added yet: '), sentence).toBe(true);
      else expect(sentence.startsWith(`${shownVolume(volume)} mL`), sentence).toBe(true);
    }
  });

  it('gives every state a readout that ends by naming the flask color', () => {
    for (const { acid, volume } of everyState) {
      const { flask, stage } = state(acid, volume);
      const sentence = readout(acid, volume);
      if (stage === 'at') expect(sentence.endsWith('that is the endpoint.'), sentence).toBe(true);
      else expect(sentence.endsWith(`The flask is ${stage === 'before' && volume > 0 ? 'still ' : ''}${flask}.`), sentence).toBe(true);
    }
  });
});

describe('the numbers in the readout, derived independently at every volume', () => {
  // Hundredths of a millimole as text, by integer arithmetic only: 5 hundredths is "0.05".
  const hundredthsText = (hundredths: number) => `${Math.floor(hundredths / 100)}.${String(hundredths % 100).padStart(2, '0')}`;

  it('shows, in order, the amounts that the volume and the acid imply', () => {
    let checked = 0;
    for (const acid of BOTH_ACIDS) {
      for (let halves = 0; halves <= 80; halves++) {
        // Each half mL of 0.200 M base is 0.100 mmol of OH⁻: 10 hundredths of a millimole.
        const added = 10 * halves;
        const start = 300 * ACIDS[acid].protons;
        const left = Math.max(start - added, 0);
        const excess = Math.max(added - start, 0);
        let expected: string[];
        if (halves === 0) expected = [start];
        else if (added < start) expected = [added, added, left];
        else if (added === start) expected = [added, start];
        else expected = [excess];

        const sentence = readout(acid, halves / 2);
        const numbers = [...sentence.matchAll(/(\d+\.\d\d) mmol/g)].map((match) => match[1]);
        const label = `${acid} at ${halves / 2} mL: ${sentence}`;
        expect(numbers, label).toEqual(expected.map((hundredths) => hundredthsText(hundredths)));
        expect(sentence.startsWith(halves === 0 ? 'No base' : `${Math.floor(halves / 2)}.${halves % 2 === 0 ? 0 : 5} mL`), label).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBe(162);
  });
});

describe('readout', () => {
  it('says nothing has been added, for lactic acid', () => {
    expect(readout('lactic', 0)).toBe('No base added yet: 3.00 mmol of acidic protons to neutralize. The flask is yellow.');
  });

  it('says nothing has been added, for tartaric acid, with two protons from each molecule', () => {
    expect(readout('tartaric', 0)).toBe(
      'No base added yet: 6.00 mmol of acidic protons to neutralize, two from each molecule of acid. The flask is yellow.',
    );
  });

  it('says how much has been neutralized and how much is left before the equivalence point', () => {
    expect(readout('lactic', 12)).toBe(
      '12.0 mL of base added: 2.40 mmol of OH⁻ have neutralized 2.40 mmol of acidic protons, and 0.60 mmol are left. The flask is still yellow.',
    );
  });

  it('says 3.00 mmol are left for tartaric acid at 15.0 mL, with the flask still yellow', () => {
    expect(readout('tartaric', 15)).toBe(
      '15.0 mL of base added: 3.00 mmol of OH⁻ have neutralized 3.00 mmol of acidic protons, and 3.00 mmol are left. The flask is still yellow.',
    );
  });

  it('names the equivalence point and the endpoint for lactic acid at 15.0 mL', () => {
    expect(readout('lactic', 15)).toBe(
      '15.0 mL added: 3.00 mmol of OH⁻ have neutralized all 3.00 mmol of acidic protons. This is the equivalence point. The indicator has turned blue: that is the endpoint.',
    );
  });

  it('names the equivalence point for tartaric acid at 30.0 mL, with its own amount', () => {
    expect(readout('tartaric', 30)).toBe(
      '30.0 mL added: 6.00 mmol of OH⁻ have neutralized all 6.00 mmol of acidic protons. This is the equivalence point. The indicator has turned blue: that is the endpoint.',
    );
  });

  it('says how much base is in excess past the equivalence point', () => {
    expect(readout('lactic', 20)).toBe(
      '20.0 mL added: every acidic proton is gone, and 1.00 mmol of OH⁻ is in excess. The flask is blue.',
    );
    expect(readout('lactic', 40)).toBe(
      '40.0 mL added: every acidic proton is gone, and 5.00 mmol of OH⁻ is in excess. The flask is blue.',
    );
    expect(readout('tartaric', 40)).toBe(
      '40.0 mL added: every acidic proton is gone, and 2.00 mmol of OH⁻ is in excess. The flask is blue.',
    );
  });

  it('throws for a volume the slider cannot reach', () => {
    expect(() => readout('lactic', 12.3)).toThrow(RangeError);
  });
});

describe('describeFlask', () => {
  it('names the acid, the color of the liquid and the volume added', () => {
    expect(describeFlask('lactic', 12)).toBe(
      'A flask of lactic acid solution under the tip of a buret. The liquid is yellow. 12.0 mL of base has been added.',
    );
    expect(describeFlask('tartaric', 30)).toBe(
      'A flask of tartaric acid solution under the tip of a buret. The liquid is blue. 30.0 mL of base has been added.',
    );
  });

  it('says no base has been added at 0 mL', () => {
    expect(describeFlask('lactic', 0)).toBe(
      'A flask of lactic acid solution under the tip of a buret. The liquid is yellow. No base has been added.',
    );
  });
});

describe('describeGraph', () => {
  it('describes both lines, the equivalence point and the marker, for lactic acid at 12.0 mL', () => {
    expect(describeGraph('lactic', 12)).toBe(
      'Graph of amount in millimoles against volume of base added, from 0 to 40 mL. ' +
        'A solid line, acidic protons left, falls from 3.00 mmol at 0 mL to 0.00 mmol at the equivalence point, 15.0 mL, and stays there. ' +
        'A dashed line, OH⁻ in excess, stays at 0.00 mmol until 15.0 mL, then rises to 5.00 mmol at 40.0 mL. ' +
        'A dotted vertical line marks the equivalence point. ' +
        'A marker at 12.0 mL shows 0.60 mmol of acidic protons left and 0.00 mmol of OH⁻ in excess.',
    );
  });

  it('uses the tartaric acid numbers for tartaric acid', () => {
    const text = describeGraph('tartaric', 36);
    expect(text).toContain('falls from 6.00 mmol at 0 mL');
    expect(text).toContain('the equivalence point, 30.0 mL');
    expect(text).toContain('rises to 2.00 mmol at 40.0 mL');
    expect(text).toContain('A marker at 36.0 mL shows 0.00 mmol of acidic protons left and 1.20 mmol of OH⁻ in excess.');
  });
});
