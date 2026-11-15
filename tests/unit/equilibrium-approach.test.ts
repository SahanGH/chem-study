import { describe, expect, it } from 'vitest';
import {
  AXES,
  RATE_CONSTANTS,
  STARTING_CHOICES,
  STARTS,
  TIME,
  concentrationA,
  curvePoints,
  describeConcentrations,
  describeRates,
  inTenths,
  readout,
  shownState,
  type RateConstantsId,
  type StartId,
} from '../../src/lib/equilibrium-approach';

const PAIRS: RateConstantsId[] = ['forward-favored', 'even', 'reverse-favored'];
const START_IDS: StartId[] = ['only-a', 'half', 'only-b'];
// Written out, not computed: 33 times from 0 s to 8 s in steps of 0.25 s (exact in binary).
const ALL_TIMES = Array.from({ length: 33 }, (_, step) => step * 0.25);
const NOT_NUMBERS = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
// k_f and k_r in tenths of a reciprocal second, written out apart from the module.
const TENTHS: Record<RateConstantsId, { forward: number; reverse: number }> = {
  'forward-favored': { forward: 8, reverse: 2 },
  even: { forward: 5, reverse: 5 },
  'reverse-favored': { forward: 2, reverse: 8 },
};
// The mixture each pair settles on, in hundredths of a mole per liter.
const SETTLED: Record<RateConstantsId, number> = { 'forward-favored': 20, even: 50, 'reverse-favored': 80 };

interface State {
  pair: RateConstantsId;
  start: StartId;
  time: number;
}

/** Every state the controls can reach: 3 pairs, 3 starts, 33 times. */
function everyState(): State[] {
  return PAIRS.flatMap((pair) => START_IDS.flatMap((start) => ALL_TIMES.map((time) => ({ pair, start, time }))));
}

function expectWithin(actual: number, expected: number, tolerance: number) {
  expect(Math.abs(actual - expected), `${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

describe('the choices and the ranges', () => {
  it('offers three pairs of rate constants, each summing to 1 per second', () => {
    expect(RATE_CONSTANTS.map((pair) => pair.id)).toEqual(PAIRS);
    expect(RATE_CONSTANTS.map((pair) => [pair.forward, pair.reverse])).toEqual([
      [0.8, 0.2],
      [0.5, 0.5],
      [0.2, 0.8],
    ]);
    for (const pair of RATE_CONSTANTS) expect(Math.round((pair.forward + pair.reverse) * 10), pair.id).toBe(10);
  });

  it('labels each pair the way its radio button reads', () => {
    expect(RATE_CONSTANTS.map((pair) => pair.label)).toEqual([
      'forward 0.8, reverse 0.2',
      'forward 0.5, reverse 0.5',
      'forward 0.2, reverse 0.8',
    ]);
  });

  it('offers three starts: only A, half of each, only B', () => {
    expect(STARTS.map((start) => start.id)).toEqual(START_IDS);
    expect(STARTS.map((start) => start.initialA)).toEqual([1, 0.5, 0]);
    expect(STARTS.map((start) => start.label)).toEqual(['Only A', 'Half A, half B', 'Only B']);
  });

  it('runs time from 0 s to 8 s in steps of 0.25 s, starting at 1 s', () => {
    expect(TIME).toEqual({ min: 0, max: 8, step: 0.25, start: 1 });
  });

  it('starts with only A, forward 0.8 and reverse 0.2', () => {
    expect(STARTING_CHOICES).toEqual({ rateConstants: 'forward-favored', start: 'only-a' });
  });

  it('runs the concentration axis to 1.0 M and the rate axis to 0.8 M/s', () => {
    expect(AXES).toEqual({ concentration: { max: 1 }, rate: { max: 0.8 } });
  });
});

describe('concentrationA', () => {
  it.each([
    ['forward-favored', 'only-a', 1, 0.494304],
    ['forward-favored', 'only-a', 2, 0.308268],
  ] as const)('%s, %s, at %d s: %d M', (pair, start, time, expected) => {
    expectWithin(concentrationA(pair, start, time), expected, 1e-6);
  });

  it('begins at the starting concentration of A', () => {
    for (const pair of PAIRS) {
      expect(concentrationA(pair, 'only-a', 0), pair).toBe(1);
      expect(concentrationA(pair, 'half', 0), pair).toBe(0.5);
      expect(concentrationA(pair, 'only-b', 0), pair).toBe(0);
    }
  });

  it('settles on k_r/(k_f + k_r) of the 1.00 M, from every start', () => {
    for (const pair of PAIRS) {
      for (const start of START_IDS) {
        expectWithin(concentrationA(pair, start, 8), SETTLED[pair] / 100, 3e-4);
      }
    }
  });

  it('is the exact solution, written out here from the formula, at a time on the slider', () => {
    expectWithin(concentrationA('forward-favored', 'only-a', 0.25), 0.2 + 0.8 * Math.exp(-0.25), 1e-12);
    expectWithin(concentrationA('reverse-favored', 'only-b', 0.75), 0.8 - 0.8 * Math.exp(-0.75), 1e-12);
  });

  it('rejects a time outside 0 s to 8 s, or off the slider steps, naming the value and the range', () => {
    for (const time of [-0.25, 8.25, 9, -1, 0.1, 1.3, ...NOT_NUMBERS]) {
      expect(() => concentrationA('even', 'only-a', time), String(time)).toThrow(RangeError);
    }
    expect(() => concentrationA('even', 'only-a', 9)).toThrow('from 0 s to 8 s in steps of 0.25 s, not 9 s');
    expect(() => concentrationA('even', 'only-a', -0.25)).toThrow('from 0 s to 8 s in steps of 0.25 s, not -0.25 s');
    expect(() => concentrationA('even', 'only-a', 0.1)).toThrow('from 0 s to 8 s in steps of 0.25 s, not 0.1 s');
    expect(() => concentrationA('even', 'only-a', Number.NaN)).toThrow('not NaN s');
  });

  it('rejects a pair or a start it does not offer, naming the value and the choices', () => {
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => concentrationA('fast', 'only-a', 1)).toThrow('must be forward-favored, even or reverse-favored, not "fast"');
    // @ts-expect-error: as above.
    expect(() => concentrationA('even', 'all-b', 1)).toThrow('must be only-a, half or only-b, not "all-b"');
  });
});

describe('shownState', () => {
  it.each([
    ['forward-favored', 'only-a', 0, 100, 0, 800, 0, 'forward'],
    ['forward-favored', 'only-a', 0.5, 69, 31, 552, 62, 'forward'],
    ['forward-favored', 'only-a', 1, 49, 51, 392, 102, 'forward'],
    ['forward-favored', 'only-a', 4, 21, 79, 168, 158, 'forward'],
    ['forward-favored', 'only-a', 8, 20, 80, 160, 160, 'equal'],
    ['forward-favored', 'only-b', 0, 0, 100, 0, 200, 'reverse'],
    ['forward-favored', 'only-b', 1, 13, 87, 104, 174, 'reverse'],
    ['forward-favored', 'half', 0.5, 38, 62, 304, 124, 'forward'],
    ['even', 'only-a', 2, 57, 43, 285, 215, 'forward'],
    ['reverse-favored', 'only-a', 0.5, 92, 8, 184, 64, 'forward'],
    ['reverse-favored', 'only-b', 1, 51, 49, 102, 392, 'reverse'],
    ['reverse-favored', 'half', 8, 80, 20, 160, 160, 'equal'],
  ] as const)('%s, %s, at %d s', (pair, start, time, a, b, forward, reverse, direction) => {
    expect(shownState(pair, start, time)).toEqual({ a, b, forward, reverse, direction });
  });

  it('shows 50/50 and equal rates at every time for even rate constants and half of each', () => {
    for (const time of ALL_TIMES) {
      expect(shownState('even', 'half', time), `${time} s`).toEqual({ a: 50, b: 50, forward: 250, reverse: 250, direction: 'equal' });
    }
  });

  // The first step at which the shown rates are equal, found by looking at each step in turn.
  it.each([
    ['forward-favored', 'only-a', 5.25],
    ['forward-favored', 'half', 4.25],
    ['forward-favored', 'only-b', 3.75],
    ['even', 'only-a', 4.75],
    ['even', 'only-b', 4.75],
    ['even', 'half', 0],
  ] as const)('first shows equal rates, for %s and %s, at %d s', (pair, start, expected) => {
    const first = ALL_TIMES.find((time) => shownState(pair, start, time).direction === 'equal');

    expect(first).toBe(expected);
  });

  it('keeps [A] and [B] adding to exactly 1.00 M in every state', () => {
    for (const { pair, start, time } of everyState()) {
      const shown = shownState(pair, start, time);

      expect(shown.a + shown.b, `${pair}, ${start}, ${time} s`).toBe(100);
    }
  });

  it('gives each rate as the rate constant times the concentration shown, in whole thousandths', () => {
    for (const { pair, start, time } of everyState()) {
      const shown = shownState(pair, start, time);

      expect(shown.forward, `${pair}, ${start}, ${time} s`).toBe(TENTHS[pair].forward * shown.a);
      expect(shown.reverse, `${pair}, ${start}, ${time} s`).toBe(TENTHS[pair].reverse * shown.b);
      expect(Number.isInteger(shown.a) && Number.isInteger(shown.b)).toBe(true);
    }
  });

  it('names the larger rate, and says equal only when the shown rates are equal', () => {
    for (const { pair, start, time } of everyState()) {
      const { forward, reverse, direction } = shownState(pair, start, time);
      const expected = forward > reverse ? 'forward' : forward < reverse ? 'reverse' : 'equal';

      expect(direction, `${pair}, ${start}, ${time} s`).toBe(expected);
    }
  });

  it('shows equal rates exactly when the mixture is the one the pair settles on', () => {
    for (const { pair, start, time } of everyState()) {
      const shown = shownState(pair, start, time);

      expect(shown.direction === 'equal', `${pair}, ${start}, ${time} s`).toBe(shown.a === SETTLED[pair]);
    }
  });

  it('keeps the rates equal at every later time, once they are equal', () => {
    for (const pair of PAIRS) {
      for (const start of START_IDS) {
        const directions = ALL_TIMES.map((time) => shownState(pair, start, time).direction);
        const first = directions.indexOf('equal');

        expect(first, `${pair}, ${start} reaches equal`).toBeGreaterThanOrEqual(0);
        expect(directions.slice(first).every((direction) => direction === 'equal'), `${pair}, ${start}`).toBe(true);
      }
    }
  });

  it('shows the settled mixture at 8 s in every state, the same from all three starts', () => {
    for (const pair of PAIRS) {
      const mixtures = START_IDS.map((start) => shownState(pair, start, 8));

      for (const shown of mixtures) {
        expect(shown.a, pair).toBe(SETTLED[pair]);
        expect(shown.b, pair).toBe(100 - SETTLED[pair]);
        expect(shown.direction, pair).toBe('equal');
      }
    }
  });

  it('rejects a time outside 0 s to 8 s, or off the slider steps', () => {
    expect(() => shownState('even', 'half', 8.25)).toThrow('from 0 s to 8 s in steps of 0.25 s, not 8.25 s');
    expect(() => shownState('even', 'half', 0.3)).toThrow('in steps of 0.25 s, not 0.3 s');
    expect(() => shownState('even', 'half', Number.NaN)).toThrow(RangeError);
  });

  it('rejects a pair or a start it does not offer', () => {
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => shownState('slow', 'half', 1)).toThrow('not "slow"');
    // @ts-expect-error: as above.
    expect(() => shownState('even', 'none', 1)).toThrow('not "none"');
  });
});

describe('inTenths', () => {
  it('gives each rate constant of the table as a whole number of tenths of a reciprocal second', () => {
    expect(RATE_CONSTANTS.flatMap((pair) => [inTenths(pair.forward), inTenths(pair.reverse)])).toEqual([8, 2, 5, 5, 2, 8]);
  });

  it('allows for floating point: 0.7 × 10 is 7.000000000000001, and is still 7', () => {
    expect(inTenths(0.7)).toBe(7);
    expect(inTenths(0.3)).toBe(3);
  });

  // A constant of 0.25 would make the readout (rounded to tenths) disagree with the drawing (unrounded).
  it('rejects a rate constant that is not a whole number of tenths, naming the value', () => {
    for (const value of [0.25, 0.05, 0.35, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => inTenths(value), String(value)).toThrow(RangeError);
    }
    expect(() => inTenths(0.25)).toThrow('must be a multiple of 0.1 s⁻¹, not 0.25 s⁻¹');
  });
});

describe('curvePoints', () => {
  it('gives 161 points, 0 s to 8 s every 0.05 s', () => {
    const points = curvePoints('forward-favored', 'only-a');

    expect(points).toHaveLength(161);
    expect(points[0]?.time).toBe(0);
    expect(points[160]?.time).toBe(8);
    expect(points.map((p) => p.time)).toEqual(Array.from({ length: 161 }, (_, i) => i / 20));
  });

  it('passes exactly through the model at every time the slider offers', () => {
    for (const pair of PAIRS) {
      for (const start of START_IDS) {
        const points = curvePoints(pair, start);

        for (const time of ALL_TIMES) {
          const point = points.find((p) => p.time === time);
          if (!point) throw new Error(`no point at ${time} s`);
          expect(point.a, `${pair}, ${start}, ${time} s`).toBe(concentrationA(pair, start, time));
        }
      }
    }
  });

  it('gives [B] as 1.00 M less [A], and each rate as its rate constant times its concentration', () => {
    const pair = RATE_CONSTANTS[0];
    if (!pair) throw new Error('no rate constants');

    for (const point of curvePoints('forward-favored', 'only-b')) {
      expectWithin(point.a + point.b, 1, 1e-12);
      expectWithin(point.forward, pair.forward * point.a, 1e-12);
      expectWithin(point.reverse, pair.reverse * point.b, 1e-12);
    }
  });

  it('stays on both axes in every state: concentrations from 0 to 1.0 M, rates from 0 to 0.8 M/s', () => {
    let highestRate = 0;
    for (const pair of PAIRS) {
      for (const start of START_IDS) {
        for (const point of curvePoints(pair, start)) {
          for (const value of [point.a, point.b]) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(AXES.concentration.max);
          }
          for (const value of [point.forward, point.reverse]) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(AXES.rate.max);
            highestRate = Math.max(highestRate, value);
          }
        }
      }
    }
    expect(highestRate).toBeCloseTo(0.8, 12);
  });

  it('draws the two curves on top of each other for even rate constants and half of each', () => {
    for (const point of curvePoints('even', 'half')) {
      expect(point.a).toBe(0.5);
      expect(point.b).toBe(0.5);
      expect(point.forward).toBe(point.reverse);
    }
  });

  it('rejects a pair or a start it does not offer', () => {
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => curvePoints('slow', 'half')).toThrow('not "slow"');
    // @ts-expect-error: as above.
    expect(() => curvePoints('even', 'none')).toThrow('not "none"');
  });
});

describe('readout', () => {
  it('says the forward reaction is faster, for the starting state', () => {
    expect(readout('forward-favored', 'only-a', 1)).toBe(
      'At 1 s: [A] = 0.49 M and [B] = 0.51 M. Forward rate 0.392 M/s, reverse rate 0.102 M/s: A is turning into B faster than B turns back.',
    );
  });

  it('says the reverse reaction is faster', () => {
    expect(readout('forward-favored', 'only-b', 1)).toBe(
      'At 1 s: [A] = 0.13 M and [B] = 0.87 M. Forward rate 0.104 M/s, reverse rate 0.174 M/s: B is turning into A faster than A turns back.',
    );
  });

  it('says the rates are equal, and that both reactions are still running', () => {
    expect(readout('forward-favored', 'only-a', 8)).toBe(
      'At 8 s: [A] = 0.20 M and [B] = 0.80 M. Forward rate 0.160 M/s, reverse rate 0.160 M/s: the rates are equal, so the concentrations have stopped changing. Both reactions are still running.',
    );
  });

  it('writes whole and zero values with their decimals: 1.00 M, 0.00 M and 0.000 M/s', () => {
    expect(readout('forward-favored', 'only-a', 0)).toBe(
      'At 0 s: [A] = 1.00 M and [B] = 0.00 M. Forward rate 0.800 M/s, reverse rate 0.000 M/s: A is turning into B faster than B turns back.',
    );
    expect(readout('forward-favored', 'only-b', 0)).toBe(
      'At 0 s: [A] = 0.00 M and [B] = 1.00 M. Forward rate 0.000 M/s, reverse rate 0.200 M/s: B is turning into A faster than A turns back.',
    );
  });

  it('is equal from the first moment for even rate constants and half of each', () => {
    expect(readout('even', 'half', 0)).toBe(
      'At 0 s: [A] = 0.50 M and [B] = 0.50 M. Forward rate 0.250 M/s, reverse rate 0.250 M/s: the rates are equal, so the concentrations have stopped changing. Both reactions are still running.',
    );
  });

  it('writes the time without trailing zeros: 0 s, 0.25 s, 1 s, 2.5 s', () => {
    const timeIn = (time: number) => /^At (\S+ s):/.exec(readout('even', 'only-a', time))?.[1];

    expect([0, 0.25, 1, 2.5, 7.75, 8].map(timeIn)).toEqual(['0 s', '0.25 s', '1 s', '2.5 s', '7.75 s', '8 s']);
  });

  it('is written in the same form in every state the controls can reach, with no minus sign and no e-notation', () => {
    const form =
      /^At (0|\d(\.\d+)?) s: \[A\] = \d\.\d\d M and \[B\] = \d\.\d\d M\. Forward rate \d\.\d{3} M\/s, reverse rate \d\.\d{3} M\/s: (A is turning into B faster than B turns back\.|B is turning into A faster than A turns back\.|the rates are equal, so the concentrations have stopped changing\. Both reactions are still running\.)$/;

    for (const { pair, start, time } of everyState()) {
      const text = readout(pair, start, time);

      expect(text, `${pair}, ${start}, ${time} s`).toMatch(form);
      expect(text).not.toMatch(/NaN|Infinity|−|e[-+]\d/);
    }
  });

  // What a student reads must agree with itself: [A] + [B] = 1.00 M, each
  // rate is its constant times its concentration, and the sentence names the
  // larger rate. Checked here from the numbers in the text, in whole numbers.
  it('shows numbers that agree with each other in every state', () => {
    const SHOWN = /\[A\] = (\d)\.(\d\d) M and \[B\] = (\d)\.(\d\d) M\. Forward rate (\d)\.(\d{3}) M\/s, reverse rate (\d)\.(\d{3}) M\/s: (.*)$/;
    const wholeNumber = (text: string | undefined, decimals: string | undefined): number => {
      if (text === undefined || decimals === undefined) throw new Error('The readout is not written as expected.');
      return Number(text + decimals);
    };

    for (const { pair, start, time } of everyState()) {
      const text = readout(pair, start, time);
      const parts = SHOWN.exec(text);
      if (!parts) throw new Error(`The readout is not written as expected: "${text}"`);
      const [, aWhole, aDecimals, bWhole, bDecimals, fWhole, fDecimals, rWhole, rDecimals, sentence] = parts;
      const a = wholeNumber(aWhole, aDecimals);
      const b = wholeNumber(bWhole, bDecimals);
      const forward = wholeNumber(fWhole, fDecimals);
      const reverse = wholeNumber(rWhole, rDecimals);
      const label = `${pair}, ${start}, ${time} s: ${text}`;

      expect(a + b, label).toBe(100);
      expect(forward, label).toBe(TENTHS[pair].forward * a);
      expect(reverse, label).toBe(TENTHS[pair].reverse * b);
      const named = forward > reverse ? 'A is turning into B' : forward < reverse ? 'B is turning into A' : 'the rates are equal';
      expect(sentence, label).toContain(named);
    }
  });

  it('rejects a time or a choice it does not offer', () => {
    expect(() => readout('even', 'only-a', 8.5)).toThrow('from 0 s to 8 s in steps of 0.25 s, not 8.5 s');
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => readout('slow', 'only-a', 1)).toThrow('not "slow"');
    // @ts-expect-error: as above.
    expect(() => readout('even', 'none', 1)).toThrow('not "none"');
  });
});

describe('describeConcentrations', () => {
  it('says what the graph shows, from the start to the settled mixture, for the starting state', () => {
    expect(describeConcentrations('forward-favored', 'only-a', 1)).toBe(
      'Graph of concentration against time, from 0 s to 8 s, for rate constants forward 0.8, reverse 0.2 per second. ' +
        '[A] is a solid line and [B] a dashed line. ' +
        'At 0 s, [A] is 1.00 M and [B] is 0.00 M; at 8 s, [A] is 0.20 M and [B] is 0.80 M. ' +
        'A vertical line and a dot on each curve mark the chosen time, 1 s.',
    );
  });

  it('follows the choices: the start, the pair and the time', () => {
    const text = describeConcentrations('reverse-favored', 'only-b', 2.5);

    expect(text).toContain('forward 0.2, reverse 0.8 per second');
    expect(text).toContain('At 0 s, [A] is 0.00 M and [B] is 1.00 M; at 8 s, [A] is 0.80 M and [B] is 0.20 M.');
    expect(text).toContain('the chosen time, 2.5 s.');
  });

  it('rejects a time or a choice it does not offer', () => {
    expect(() => describeConcentrations('even', 'half', 12)).toThrow('not 12 s');
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => describeConcentrations('slow', 'half', 1)).toThrow('not "slow"');
  });
});

describe('describeRates', () => {
  it('says what the graph shows, for the starting state', () => {
    expect(describeRates('forward-favored', 'only-a', 1)).toBe(
      'Graph of rate against time, from 0 s to 8 s, for rate constants forward 0.8, reverse 0.2 per second. ' +
        'The forward rate is a solid line and the reverse rate a dashed line. ' +
        'At 0 s, the forward rate is 0.800 M/s and the reverse rate is 0.000 M/s; at 8 s, both are 0.160 M/s. ' +
        'A vertical line and a dot on each curve mark the chosen time, 1 s.',
    );
  });

  it('gives the equal rates at 8 s for every pair and start', () => {
    const settled = { 'forward-favored': '0.160', even: '0.250', 'reverse-favored': '0.160' };

    for (const pair of PAIRS) {
      for (const start of START_IDS) {
        expect(describeRates(pair, start, 4), `${pair}, ${start}`).toContain(`at 8 s, both are ${settled[pair]} M/s.`);
      }
    }
  });

  it('rejects a time or a choice it does not offer', () => {
    expect(() => describeRates('even', 'half', -1)).toThrow('not -1 s');
    // @ts-expect-error: a value from the page is not trusted to be one of the ids.
    expect(() => describeRates('even', 'none', 1)).toThrow('not "none"');
  });
});
