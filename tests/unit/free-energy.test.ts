import { describe, expect, it } from 'vitest';
import {
  AXES,
  LABELS,
  REACTION_IDS,
  REACTIONS,
  START,
  TEMPERATURE,
  TEMPERATURES,
  bars,
  describeBars,
  describeGraph,
  favoredRange,
  linePoints,
  readout,
  shownKJ,
  state,
  temperatureText,
  temperatureValueText,
  energyTickText,
  temperatureTickText,
  verdictSentence,
  zeroTemperature,
  zeroTemperatureText,
  type ReactionId,
} from '../../src/lib/free-energy';

// Everything below is written out from lesson 9.3's brief, "Diagram data" (the reactions, the
// slider, the model, the rounding rule and its ties, the limits, the readout sentences and the
// nineteen worked states), apart from the module under test.

const MINUS = '−';

/** The brief's table of reactions, in the order of the control. */
const BRIEF_REACTIONS: [ReactionId, string, string, number, number, string, string][] = [
  ['nitrous-oxide', 'Nitrous oxide breaking down', '2N₂O(g) → 2N₂(g) + O₂(g)', -164_100, 1_484, '−164.1', '+148.4'],
  ['ozone', 'Ozone forming', '3O₂(g) → 2O₃(g)', 285_400, -1_378, '+285.4', '−137.8'],
  ['methane-steam', 'Methane with steam', 'CH₄(g) + H₂O(g) → CO(g) + 3H₂(g)', 205_900, 2_147, '+205.9', '+214.7'],
  ['methanol', 'Methanol from carbon monoxide', 'CO(g) + 2H₂(g) → CH₃OH(g)', -90_500, -2_192, '−90.5', '−219.2'],
];

const NAME_TO_ID: Record<string, ReactionId> = {
  'Methane with steam': 'methane-steam',
  'Methanol from carbon monoxide': 'methanol',
  'Nitrous oxide breaking down': 'nitrous-oxide',
  'Ozone forming': 'ozone',
};

// The brief's worked states: reaction, T (K), ΔH° shown, −TΔS° shown, ΔG° shown, ΔG° exact, verdict.
const WORKED = `
Methane with steam | 300 | +205.9 | −64.4 | +141.5 | +141.49 | unfavored
Methane with steam | 950 | +205.9 | −204.0 | +1.9 | +1.935 | unfavored
Methane with steam | 975 | +205.9 | −209.3 | −3.4 | −3.4325 | favored
Methanol from carbon monoxide | 300 | −90.5 | +65.8 | −24.7 | −24.74 | favored
Methanol from carbon monoxide | 400 | −90.5 | +87.7 | −2.8 | −2.82 | favored
Methanol from carbon monoxide | 425 | −90.5 | +93.2 | +2.7 | +2.66 | unfavored
Nitrous oxide breaking down | 300 | −164.1 | −44.5 | −208.6 | −208.62 | favored
Nitrous oxide breaking down | 1,400 | −164.1 | −207.8 | −371.9 | −371.86 | favored
Ozone forming | 300 | +285.4 | +41.3 | +326.7 | +326.74 | unfavored
Ozone forming | 1,400 | +285.4 | +192.9 | +478.3 | +478.32 | unfavored
Nitrous oxide breaking down | 375 | −164.1 | −55.6 | −219.7 | −219.75 | favored
Ozone forming | 250 | +285.4 | +34.5 | +319.9 | +319.85 | unfavored
Methane with steam | 500 | +205.9 | −107.3 | +98.6 | +98.55 | unfavored
Methane with steam | 200 | +205.9 | −42.9 | +163.0 | +162.96 | unfavored
Methane with steam | 1,400 | +205.9 | −300.6 | −94.7 | −94.68 | favored
Methanol from carbon monoxide | 200 | −90.5 | +43.8 | −46.7 | −46.66 | favored
Methanol from carbon monoxide | 1,400 | −90.5 | +306.9 | +216.4 | +216.38 | unfavored
Nitrous oxide breaking down | 200 | −164.1 | −29.7 | −193.8 | −193.78 | favored
Ozone forming | 200 | +285.4 | +27.6 | +313.0 | +312.96 | unfavored
`;

/** A signed decimal written with a true minus sign, such as "−3.4325", as a plain number. */
const signedNumber = (text: string) => Number(text.replace(MINUS, '-').replace(/,/g, ''));

const WORKED_ROWS = WORKED.trim()
  .split('\n')
  .map((line) => {
    const cells = line.split(' | ');
    if (cells.length !== 7) throw new Error(`A bad row: ${line}`);
    const [name, t, h, s, g, exact, verdict] = cells as [string, string, string, string, string, string, string];
    const id = NAME_TO_ID[name];
    if (!id) throw new Error(`An unknown reaction: ${name}`);
    return { id, temperature: Number(t.replace(/,/g, '')), h, s, g, exact: signedNumber(exact), verdict };
  });

// ---- Independent arithmetic, used only by this file ----
//
// The test works from the lesson's own numbers, ΔH° in kJ and ΔS° in J/K as decimal text
// ("−164.1", "+148.4"), and does the sum in BigInt in units of 0.0001 kJ (that is, 0.1 J). It
// rounds to 0.1 kJ by splitting off the last three digits and looking at them, not by the
// module's add-and-floor.

/** "−164.1" in units of 0.1 (kJ or J/K) as a BigInt: −1641n. */
function tenthsOf(text: string): bigint {
  const match = /^([+−])(\d+)\.(\d)$/.exec(text);
  if (!match) throw new Error(`Not a number to one decimal place: ${text}`);
  const [, sign, whole, tenth] = match as unknown as [string, string, string, string];
  const value = BigInt(whole) * 10n + BigInt(tenth);
  return sign === '−' ? -value : value;
}

interface Independent {
  enthalpy: bigint;
  entropy: bigint;
  free: bigint;
}

/** The three exact terms in units of 0.0001 kJ: ΔH° (0.1 kJ = 1,000 of them) and −T × ΔS° (0.1 J/K × K = 0.0001 kJ). */
function independent(id: ReactionId, temperature: number): Independent {
  const row = BRIEF_REACTIONS.find((r) => r[0] === id);
  if (!row) throw new Error(`No row for ${id}`);
  const enthalpy = tenthsOf(row[5]) * 1000n;
  const entropy = -BigInt(temperature) * tenthsOf(row[6]);
  return { enthalpy, entropy, free: enthalpy + entropy };
}

/** Rounds units of 0.0001 kJ to 0.1 kJ, a tie going to the more positive number, and writes it as the brief does. */
function writeIndependently(value: bigint): string {
  const negative = value < 0n;
  const size = negative ? -value : value;
  let tenths = size / 1000n;
  const rest = size % 1000n;
  // For a positive value, a remainder of 500 or more goes up; for a negative one, only more than
  // 500 goes away from zero, since a tie goes toward the more positive number.
  if (negative ? rest > 500n : rest >= 500n) tenths += 1n;
  if (tenths === 0n) return '0.0';
  const whole = (tenths / 10n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? MINUS : '+'}${whole}.${tenths % 10n}`;
}

/** Shown text back to tenths of a kilojoule, for checking sums. */
function shownTenths(text: string): number {
  if (text === '0.0') return 0;
  const match = /^([+−])([\d,]+)\.(\d)$/.exec(text);
  if (!match) throw new Error(`Not a shown number: ${text}`);
  const [, sign, whole, tenth] = match as unknown as [string, string, string, string];
  const value = Number(whole.replace(/,/g, '')) * 10 + Number(tenth);
  return sign === '−' ? -value : value;
}

const ALL_STATES = REACTION_IDS.flatMap((id) => TEMPERATURES.map((temperature) => ({ id, temperature })));

describe('the constants', () => {
  it('has the brief’s four reactions, in the brief’s order, with ΔH° in whole joules and ΔS° in whole tenths of a joule per kelvin', () => {
    expect(REACTION_IDS).toEqual(BRIEF_REACTIONS.map((r) => r[0]));
    for (const [id, label, equation, enthalpyJ, entropyTenths] of BRIEF_REACTIONS) {
      const reaction = REACTIONS[id];
      expect(reaction.label).toBe(label);
      expect(reaction.equation).toBe(equation);
      expect(reaction.enthalpyJ).toBe(enthalpyJ);
      expect(reaction.entropyTenths).toBe(entropyTenths);
      expect(Number.isInteger(reaction.enthalpyJ) && Number.isInteger(reaction.entropyTenths)).toBe(true);
    }
  });

  it('agrees with the lesson’s kJ and J/K, by the test’s own arithmetic', () => {
    for (const [id, , , , , kJ, perK] of BRIEF_REACTIONS) {
      expect(BigInt(REACTIONS[id].enthalpyJ), `${id}: ΔH°`).toBe(tenthsOf(kJ) * 100n);
      expect(BigInt(REACTIONS[id].entropyTenths), `${id}: ΔS°`).toBe(tenthsOf(perK));
    }
  });

  it('gives each reaction one combination of signs: −+, +−, ++ and −−', () => {
    const signs = REACTION_IDS.map((id) => [Math.sign(REACTIONS[id].enthalpyJ), Math.sign(REACTIONS[id].entropyTenths)]);
    expect(signs).toEqual([
      [-1, 1],
      [1, -1],
      [1, 1],
      [-1, -1],
    ]);
  });

  it('has a temperature slider from 200 K to 1,400 K in steps of 25 K: 49 stops and 196 states', () => {
    expect(TEMPERATURE).toEqual({ min: 200, max: 1400, step: 25 });
    expect(TEMPERATURES).toHaveLength(49);
    expect(TEMPERATURES[0]).toBe(200);
    expect(TEMPERATURES.at(-1)).toBe(1400);
    expect(TEMPERATURES.every((t, i) => t === 200 + 25 * i)).toBe(true);
    expect(ALL_STATES).toHaveLength(196);
  });

  it('starts on the third reaction, methane with steam, at 300 K', () => {
    expect(START).toEqual({ reaction: 'methane-steam', temperature: 300 });
    expect(REACTION_IDS[2]).toBe(START.reaction);
  });

  it('draws the graph from 200 K to 1,400 K and from −400 to +500 kJ/mol', () => {
    expect(AXES.temperatureMin).toBe(200);
    expect(AXES.temperatureMax).toBe(1400);
    expect(AXES.energyMin).toBe(-400);
    expect(AXES.energyMax).toBe(500);
    expect(AXES.temperatureTicks).toEqual([200, 400, 600, 800, 1000, 1200, 1400]);
    expect(AXES.energyTicks).toEqual([-400, -200, 0, 200, 400]);
  });

  it('names the parts of the drawing', () => {
    expect(LABELS.favored).toBe('favored');
    expect(LABELS.slider).toBe('Temperature');
    expect(LABELS.choice).toBe('Reaction');
    expect(LABELS.enthalpyBar).toBe('ΔH°');
    expect(LABELS.entropyBar).toBe('−TΔS°');
    expect(LABELS.freeBar).toBe('ΔG°');
    expect(LABELS.bars).toBe('ΔG° = ΔH° − TΔS°, in kJ/mol');
    expect(LABELS.otherLines).toBe('the other three reactions');
  });
});

describe('the slider’s words', () => {
  it('shows the temperature with its unit and a thousands comma, and speaks it in words', () => {
    expect(temperatureText(300)).toBe('300 K');
    expect(temperatureText(1400)).toBe('1,400 K');
    expect(temperatureText(975)).toBe('975 K');
    expect(temperatureValueText(300)).toBe('300 kelvins');
    expect(temperatureValueText(1400)).toBe('1,400 kelvins');
  });
});

describe('bad input', () => {
  it('throws a RangeError that names a reaction that is not one of the four', () => {
    expect(() => state('steam' as ReactionId, 300)).toThrow(RangeError);
    expect(() => state('steam' as ReactionId, 300)).toThrow(/steam/);
    expect(() => readout('toString' as ReactionId, 300)).toThrow(RangeError);
    expect(() => linePoints('__proto__' as ReactionId)).toThrow(RangeError);
  });

  it('throws a RangeError that names a temperature off the slider’s stops', () => {
    for (const bad of [175, 1425, 310, 300.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => state('ozone', bad), `${bad}`).toThrow(RangeError);
      expect(() => state('ozone', bad), `${bad}`).toThrow(String(bad));
      expect(() => temperatureText(bad), `${bad}`).toThrow(RangeError);
    }
  });

  it('refuses to show an amount that is not a whole number of tenths of a joule', () => {
    expect(() => shownKJ(1.5)).toThrow(RangeError);
    expect(() => shownKJ(1.5)).toThrow('1.5');
    expect(() => shownKJ(Number.NaN)).toThrow(RangeError);
  });
});

describe('the rounding', () => {
  it('rounds half up to 0.1 kJ, a tie going to the more positive number', () => {
    // In tenths of a joule: −219.75 kJ is −2,197,500; +98.55 kJ is 985,500.
    expect(shownKJ(-2_197_500)).toBe('−219.7');
    expect(shownKJ(985_500)).toBe('+98.6');
    expect(shownKJ(-1_073_500)).toBe('−107.3');
    expect(shownKJ(499)).toBe('0.0');
    expect(shownKJ(1_499)).toBe('+0.1');
    expect(shownKJ(1_500)).toBe('+0.2');
    expect(shownKJ(-500)).toBe('0.0');
    expect(shownKJ(-501)).toBe('−0.1');
    expect(shownKJ(0)).toBe('0.0');
    expect(shownKJ(12_345_000)).toBe('+1,234.5');
    expect(shownKJ(-12_345_000)).toBe('−1,234.5');
  });

  it('finds the brief’s nine exact ties of ΔG°, and in each the entropy term is a tie too', () => {
    const ties = ALL_STATES.filter(({ id, temperature }) => state(id, temperature).free % 1000 === 500 || state(id, temperature).free % 1000 === -500);
    expect(ties.map(({ id, temperature }) => `${id} ${temperature}`)).toEqual([
      'nitrous-oxide 375',
      'nitrous-oxide 625',
      'nitrous-oxide 875',
      'nitrous-oxide 1125',
      'nitrous-oxide 1375',
      'ozone 250',
      'ozone 750',
      'ozone 1250',
      'methane-steam 500',
    ]);
    for (const { id, temperature } of ties) expect(Math.abs(state(id, temperature).entropy % 1000), `${id} ${temperature}`).toBe(500);
  });

  it('would break the sum in one state if ties went away from zero, which is why they do not', () => {
    const awayFromZero = (tenthsOfJ: number) => Math.sign(tenthsOfJ) * Math.floor((Math.abs(tenthsOfJ) + 500) / 1000);
    const broken = ALL_STATES.filter(({ id, temperature }) => {
      const s = state(id, temperature);
      return awayFromZero(s.enthalpy) + awayFromZero(s.entropy) !== awayFromZero(s.free);
    });
    expect(broken).toEqual([{ id: 'methane-steam', temperature: 500 }]);
  });
});

describe('the worked states', () => {
  it('lists the brief’s nineteen', () => {
    expect(WORKED_ROWS).toHaveLength(19);
  });

  for (const row of WORKED_ROWS) {
    it(`${row.id} at ${row.temperature} K: ${row.h}, ${row.s}, ${row.g}, ${row.verdict}`, () => {
      const s = state(row.id, row.temperature);
      expect(s.enthalpyText).toBe(row.h);
      expect(s.entropyText).toBe(row.s);
      expect(s.freeText).toBe(row.g);
      // The exact value, in kJ: tenths of a joule over 10,000.
      expect(s.free / 10_000).toBeCloseTo(row.exact, 10);
      expect(s.verdict).toBe(row.verdict);
      expect(s.favored).toBe(row.verdict === 'favored');
    });
  }
});

describe('the model, by the test’s own arithmetic', () => {
  it('in every one of the 196 states, the three exact terms and the three shown numbers are those the test works out from the lesson’s kJ and J/K', () => {
    for (const { id, temperature } of ALL_STATES) {
      const s = state(id, temperature);
      const want = independent(id, temperature);
      const where = `${id} at ${temperature} K`;
      // The module works in tenths of a joule, the test in 0.0001 kJ: the same unit.
      expect(BigInt(s.enthalpy), `${where}: ΔH°`).toBe(want.enthalpy);
      expect(BigInt(s.entropy), `${where}: −TΔS°`).toBe(want.entropy);
      expect(BigInt(s.free), `${where}: ΔG°`).toBe(want.free);
      expect(s.enthalpyText, where).toBe(writeIndependently(want.enthalpy));
      expect(s.entropyText, where).toBe(writeIndependently(want.entropy));
      expect(s.freeText, where).toBe(writeIndependently(want.free));
      expect(s.verdict, where).toBe(want.free < 0n ? 'favored' : 'unfavored');
    }
  });

  it('keeps every exact term a whole number, safely inside floating point', () => {
    for (const { id, temperature } of ALL_STATES) {
      const s = state(id, temperature);
      for (const value of [s.enthalpy, s.entropy, s.free]) expect(Number.isSafeInteger(value)).toBe(true);
    }
  });
});

describe('the readout cannot contradict itself', () => {
  it('in every state, the shown ΔH° plus the shown −TΔS° is the shown ΔG°', () => {
    for (const { id, temperature } of ALL_STATES) {
      const s = state(id, temperature);
      expect(shownTenths(s.enthalpyText) + shownTenths(s.entropyText), `${id} at ${temperature} K`).toBe(shownTenths(s.freeText));
    }
  });

  it('in every state, the sign of the shown ΔG° is the sign of the exact one, and no shown ΔG° or entropy term is 0.0', () => {
    for (const { id, temperature } of ALL_STATES) {
      const s = state(id, temperature);
      expect(Math.sign(shownTenths(s.freeText)), `${id} at ${temperature} K`).toBe(Math.sign(s.free));
      expect(s.freeText).not.toBe('0.0');
      expect(s.entropyText).not.toBe('0.0');
    }
  });

  it('the sentence the readout prints adds up: the three numbers in it are the state’s own and their sum holds', () => {
    const pattern = new RegExp(
      `^(.+) at ([\\d,]+) K: ΔH° = ([+−][\\d,]+\\.\\d) kJ/mol, −TΔS° = ([+−][\\d,]+\\.\\d) kJ/mol, so ΔG° = ([+−][\\d,]+\\.\\d) kJ/mol\\. ` +
        `Thermodynamically (favored|unfavored) at this temperature\\. (.+)$`,
    );
    for (const { id, temperature } of ALL_STATES) {
      const text = readout(id, temperature);
      const match = pattern.exec(text);
      expect(match, text).not.toBeNull();
      if (!match) continue;
      const [, label, t, h, s, g, verdict] = match as unknown as [string, string, string, string, string, string, string];
      expect(label).toBe(REACTIONS[id].label);
      expect(Number(t.replace(/,/g, ''))).toBe(temperature);
      expect(shownTenths(h) + shownTenths(s), text).toBe(shownTenths(g));
      expect(verdict === 'favored', text).toBe(independent(id, temperature).free < 0n);
    }
  });
});

describe('no slider stop has ΔG° exactly zero', () => {
  it('ΔG° is never zero at any of the 196 states; the nearest is methane with steam at 950 K, +1.9', () => {
    let nearest = { id: '' as string, temperature: 0, free: Number.POSITIVE_INFINITY };
    for (const { id, temperature } of ALL_STATES) {
      const s = state(id, temperature);
      expect(s.free, `${id} at ${temperature} K`).not.toBe(0);
      if (Math.abs(s.free) < Math.abs(nearest.free)) nearest = { id, temperature, free: s.free };
    }
    expect(nearest).toEqual({ id: 'methane-steam', temperature: 950, free: 19_350 });
  });

  it('if ΔG° were exactly zero the verdict would say neither direction is favored, and never call it favored or unfavored', () => {
    expect(verdictSentence(0)).toBe('ΔG° is zero at this temperature: neither direction is thermodynamically favored.');
    expect(verdictSentence(-1)).toBe('Thermodynamically favored at this temperature.');
    expect(verdictSentence(1)).toBe('Thermodynamically unfavored at this temperature.');
    expect(() => verdictSentence(Number.NaN)).toThrow(RangeError);
  });
});

describe('the limits over all 196 states', () => {
  it('ΔG° runs from −371.9 (nitrous oxide at 1,400 K) to +478.3 (ozone at 1,400 K)', () => {
    const frees = ALL_STATES.map(({ id, temperature }) => ({ id, temperature, s: state(id, temperature) }));
    const low = frees.reduce((a, b) => (b.s.free < a.s.free ? b : a));
    const high = frees.reduce((a, b) => (b.s.free > a.s.free ? b : a));
    expect([low.id, low.temperature, low.s.freeText]).toEqual(['nitrous-oxide', 1400, '−371.9']);
    expect([high.id, high.temperature, high.s.freeText]).toEqual(['ozone', 1400, '+478.3']);
  });

  it('the entropy bar runs from −300.6 (methane with steam at 1,400 K) to +306.9 (methanol at 1,400 K)', () => {
    const terms = ALL_STATES.map(({ id, temperature }) => ({ id, temperature, s: state(id, temperature) }));
    const low = terms.reduce((a, b) => (b.s.entropy < a.s.entropy ? b : a));
    const high = terms.reduce((a, b) => (b.s.entropy > a.s.entropy ? b : a));
    expect([low.id, low.temperature, low.s.entropyText]).toEqual(['methane-steam', 1400, '−300.6']);
    expect([high.id, high.temperature, high.s.entropyText]).toEqual(['methanol', 1400, '+306.9']);
  });

  it('every exact term lies inside the axis, from −400 to +500 kJ', () => {
    for (const { id, temperature } of ALL_STATES) {
      const s = state(id, temperature);
      for (const value of [s.enthalpy, s.entropy, s.free]) {
        expect(value / 10_000).toBeGreaterThan(AXES.energyMin);
        expect(value / 10_000).toBeLessThan(AXES.energyMax);
      }
    }
  });

  it('the favored stops number 49, 0, 18 and 9: methane with steam from 975 K up and methanol up to 400 K', () => {
    const favoredAt = (id: ReactionId) => TEMPERATURES.filter((t) => state(id, t).favored);
    expect(REACTION_IDS.map((id) => favoredAt(id).length)).toEqual([49, 0, 18, 9]);
    expect(favoredAt('methane-steam')[0]).toBe(975);
    expect(favoredAt('methane-steam').every((t) => t >= 975)).toBe(true);
    expect(favoredAt('methanol').at(-1)).toBe(400);
    expect(favoredAt('methanol').every((t) => t <= 400)).toBe(true);
  });
});

describe('the temperature of ΔG° = 0', () => {
  it('exists only where ΔH° and ΔS° have the same sign: 959 K (959.01) for methane with steam and 413 K (412.86) for methanol', () => {
    expect(zeroTemperature('nitrous-oxide')).toBeNull();
    expect(zeroTemperature('ozone')).toBeNull();
    const methane = zeroTemperature('methane-steam');
    const methanol = zeroTemperature('methanol');
    expect(methane?.shown).toBe(959);
    expect(methane?.exact).toBeCloseTo(2_059_000 / 2_147, 12);
    expect(methane?.exact.toFixed(2)).toBe('959.01');
    expect(methanol?.shown).toBe(413);
    expect(methanol?.exact).toBeCloseTo(905_000 / 2_192, 12);
    expect(methanol?.exact.toFixed(2)).toBe('412.86');
  });

  it('is not a stop of the slider, and the sign changes between the stops on either side of it', () => {
    for (const [id, below, above] of [
      ['methane-steam', 950, 975],
      ['methanol', 400, 425],
    ] as const) {
      const zero = zeroTemperature(id);
      if (!zero) throw new Error(`${id} has no temperature of zero`);
      expect(TEMPERATURES).not.toContain(zero.shown);
      expect(zero.exact).toBeGreaterThan(below);
      expect(zero.exact).toBeLessThan(above);
      expect(Math.sign(state(id, below).free)).toBe(-Math.sign(state(id, above).free));
    }
  });

  it('writes the guide’s value as "959 K" and "413 K", and has none for the other two', () => {
    expect(REACTION_IDS.map(zeroTemperatureText)).toEqual([null, null, '959 K', '413 K']);
  });

  it('says over which temperatures each reaction is favored', () => {
    expect(favoredRange('nitrous-oxide')).toBe('With these values, ΔG° is negative at every temperature.');
    expect(favoredRange('ozone')).toBe('With these values, ΔG° is positive at every temperature.');
    expect(favoredRange('methane-steam')).toBe('ΔG° is negative above 959 K.');
    expect(favoredRange('methanol')).toBe('ΔG° is negative below 413 K.');
  });
});

describe('the readout', () => {
  it('gives the brief’s sentence for the starting state, word for word', () => {
    expect(readout(START.reaction, START.temperature)).toBe(
      'Methane with steam at 300 K: ΔH° = +205.9 kJ/mol, −TΔS° = −64.4 kJ/mol, so ΔG° = +141.5 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative above 959 K.',
    );
  });

  it('gives each reaction its own last sentence', () => {
    expect(readout('nitrous-oxide', 1400)).toBe(
      'Nitrous oxide breaking down at 1,400 K: ΔH° = −164.1 kJ/mol, −TΔS° = −207.8 kJ/mol, so ΔG° = −371.9 kJ/mol. Thermodynamically favored at this temperature. With these values, ΔG° is negative at every temperature.',
    );
    expect(readout('ozone', 300)).toBe(
      'Ozone forming at 300 K: ΔH° = +285.4 kJ/mol, −TΔS° = +41.3 kJ/mol, so ΔG° = +326.7 kJ/mol. Thermodynamically unfavored at this temperature. With these values, ΔG° is positive at every temperature.',
    );
    expect(readout('methanol', 425)).toBe(
      'Methanol from carbon monoxide at 425 K: ΔH° = −90.5 kJ/mol, −TΔS° = +93.2 kJ/mol, so ΔG° = +2.7 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative below 413 K.',
    );
    expect(readout('methane-steam', 975)).toBe(
      'Methane with steam at 975 K: ΔH° = +205.9 kJ/mol, −TΔS° = −209.3 kJ/mol, so ΔG° = −3.4 kJ/mol. Thermodynamically favored at this temperature. ΔG° is negative above 959 K.',
    );
  });

  it('never says "spontaneous" or "favorable", and every minus sign before a number is a true minus', () => {
    for (const { id, temperature } of ALL_STATES) {
      const texts = [readout(id, temperature), describeGraph(id, temperature), describeBars(id, temperature)];
      for (const text of texts) {
        expect(text).not.toMatch(/spontaneous|favorable/i);
        expect(text).not.toMatch(/-\d/);
      }
    }
  });
});

describe('the drawing', () => {
  it('writes the axis values with their signs and a thousands comma', () => {
    expect(AXES.energyTicks.map(energyTickText)).toEqual(['−400', '−200', '0', '+200', '+400']);
    expect(AXES.temperatureTicks.map(temperatureTickText)).toEqual(['200', '400', '600', '800', '1,000', '1,200', '1,400']);
    expect(() => energyTickText(0.5)).toThrow(RangeError);
    expect(() => temperatureTickText(Number.NaN)).toThrow(RangeError);
  });

  it('gives the marker the exact ΔG° in kJ', () => {
    expect(state('methane-steam', 300).freeKJ).toBe(141.49);
    expect(state('methanol', 425).freeKJ).toBe(2.66);
  });

  it('draws each line between its values at 200 K and 1,400 K', () => {
    expect(linePoints('methane-steam')).toEqual([
      { temperature: 200, kJ: 162.96 },
      { temperature: 1400, kJ: -94.68 },
    ]);
    expect(linePoints('methanol')).toEqual([
      { temperature: 200, kJ: -46.66 },
      { temperature: 1400, kJ: 216.38 },
    ]);
    expect(linePoints('nitrous-oxide')).toEqual([
      { temperature: 200, kJ: -193.78 },
      { temperature: 1400, kJ: -371.86 },
    ]);
    expect(linePoints('ozone')).toEqual([
      { temperature: 200, kJ: 312.96 },
      { temperature: 1400, kJ: 478.32 },
    ]);
  });

  it('gives three bars, ΔH°, −TΔS° and ΔG°, each with its exact value in kJ and its shown value', () => {
    expect(bars('methane-steam', 950)).toEqual([
      { id: 'enthalpy', name: 'ΔH°', kJ: 205.9, text: '+205.9' },
      { id: 'entropy', name: '−TΔS°', kJ: -203.965, text: '−204.0' },
      { id: 'free', name: 'ΔG°', kJ: 1.935, text: '+1.9' },
    ]);
  });

  it('describes the graph: the chosen line’s ends, whether and where it crosses zero, and the marker', () => {
    expect(describeGraph('methane-steam', 300)).toBe(
      'Graph of ΔG° against temperature, from 200 K to 1,400 K, on a scale from −400 to +500 kJ/mol. The region below zero is hatched and labeled favored. ' +
        'The line of methane with steam is drawn heavy and the other three faint and dashed. ' +
        'It runs from +163.0 kJ/mol at 200 K to −94.7 kJ/mol at 1,400 K and crosses zero at 959 K. A marker at 300 K is on it at +141.5 kJ/mol.',
    );
    expect(describeGraph('methanol', 400)).toMatch(/It runs from −46\.7 kJ\/mol at 200 K to \+216\.4 kJ\/mol at 1,400 K and crosses zero at 413 K\. A marker at 400 K is on it at −2\.8 kJ\/mol\.$/);
    expect(describeGraph('nitrous-oxide', 200)).toMatch(/It runs from −193\.8 kJ\/mol at 200 K to −371\.9 kJ\/mol at 1,400 K and stays below zero\./);
    expect(describeGraph('ozone', 1400)).toMatch(/It runs from \+313\.0 kJ\/mol at 200 K to \+478\.3 kJ\/mol at 1,400 K and stays above zero\. A marker at 1,400 K is on it at \+478\.3 kJ\/mol\.$/);
  });

  it('describes the bars', () => {
    expect(describeBars('methane-steam', 300)).toBe('Three bars in kJ/mol, rising or falling from a zero line: ΔH°, +205.9; −TΔS°, −64.4; ΔG°, +141.5.');
  });
});
