import { describe, expect, it } from 'vitest';
import { hydronium, KW_25C } from '../../src/lib/acid-base';
import {
  ADDED,
  ADDED_STEPS,
  AMOUNT,
  AMOUNTS,
  BAR_MAX_MMOL,
  KA,
  KW,
  LABELS,
  PKA,
  SCALE,
  START,
  addedText,
  addedValueText,
  amountText,
  amountValueText,
  bars,
  describeBars,
  describeScales,
  readout,
  shownPH,
  shownRatio,
  state,
  type Kind,
} from '../../src/lib/buffer-capacity';

// Everything below is written out from lesson 8.10's brief, "Diagram data" (the constants, the
// controls, the model, the readout sentences, the descriptions, the limits, the rounding ties and
// the worked states), apart from the module under test.

// The brief's worked states: acid, base, added, acid after, base after, left over, ratio before,
// ratio after, buffer pH before, buffer pH after, water pH after.
const WORKED = `
100 | 100 | nothing | 100 | 100 | 0 | 1.00 | 1.00 | 4.87 | 4.87 | 7.00
100 | 100 | 15 OH⁻ | 85 | 115 | 0 | 1.00 | 1.35 | 4.87 | 5.00 | 12.18
100 | 100 | 15 H₃O⁺ | 115 | 85 | 0 | 1.00 | 0.739 | 4.87 | 4.74 | 1.82
20 | 20 | 15 OH⁻ | 5 | 35 | 0 | 1.00 | 7.00 | 4.87 | 5.72 | 12.18
20 | 20 | 20 OH⁻ | 0 | 40 | 0 | 1.00 | none | 4.87 | 8.74 | 12.30
20 | 20 | 25 OH⁻ | 0 | 40 | 5 OH⁻ | 1.00 | none | 4.87 | 11.70 | 12.40
200 | 200 | 15 OH⁻ | 185 | 215 | 0 | 1.00 | 1.16 | 4.87 | 4.94 | 12.18
200 | 200 | 50 OH⁻ | 150 | 250 | 0 | 1.00 | 1.67 | 4.87 | 5.09 | 12.70
150 | 50 | 40 OH⁻ | 110 | 90 | 0 | 0.333 | 0.818 | 4.39 | 4.78 | 12.60
150 | 50 | 40 H₃O⁺ | 190 | 10 | 0 | 0.333 | 0.0526 | 4.39 | 3.60 | 1.40
150 | 50 | 50 H₃O⁺ | 200 | 0 | 0 | 0.333 | none | 4.39 | 2.79 | 1.30
50 | 150 | nothing | 50 | 150 | 0 | 3.00 | 3.00 | 5.35 | 5.35 | 7.00
200 | 10 | 50 H₃O⁺ | 210 | 0 | 40 H₃O⁺ | 0.0500 | none | 3.58 | 1.40 | 1.30
10 | 200 | 50 OH⁻ | 0 | 210 | 40 OH⁻ | 20.0 | none | 6.17 | 12.60 | 12.70
10 | 200 | 10 OH⁻ | 0 | 210 | 0 | 20.0 | none | 6.17 | 9.10 | 12.00
200 | 10 | 10 H₃O⁺ | 210 | 0 | 0 | 0.0500 | none | 3.58 | 2.78 | 2.00
50 | 10 | 45 OH⁻ | 5 | 55 | 0 | 0.200 | 11.0 | 4.17 | 5.91 | 12.65
200 | 200 | 5 H₃O⁺ | 205 | 195 | 0 | 1.00 | 0.951 | 4.87 | 4.85 | 2.30
70 | 100 | nothing | 70 | 100 | 0 | 1.43 | 1.43 | 5.03 | 5.03 | 7.00
120 | 50 | 50 OH⁻ | 70 | 100 | 0 | 0.417 | 1.43 | 4.49 | 5.03 | 12.70
100 | 70 | 10 H₃O⁺ | 110 | 60 | 0 | 0.700 | 0.545 | 4.72 | 4.61 | 2.00
70 | 100 | 10 H₃O⁺ | 80 | 90 | 0 | 1.43 | 1.13 | 5.03 | 4.92 | 2.00
150 | 190 | 10 H₃O⁺ | 160 | 180 | 0 | 1.27 | 1.13 | 4.97 | 4.92 | 2.00
`;

/** "15 OH⁻" is +15, "15 H₃O⁺" is −15, "nothing" is 0. */
function signed(text: string): number {
  if (text === 'nothing' || text === '0') return 0;
  const [n, ion] = text.split(' ');
  if (ion === 'OH⁻') return Number(n);
  if (ion === 'H₃O⁺') return -Number(n);
  throw new Error(`An unknown addition: ${text}`);
}

const WORKED_ROWS = WORKED.trim()
  .split('\n')
  .map((line) => {
    const cells = line.split(' | ');
    if (cells.length !== 11) throw new Error(`A bad row: ${line}`);
    const [acid, base, added, acidAfter, baseAfter, left, ratioBefore, ratioAfter, before, after, water] = cells as [
      string, string, string, string, string, string, string, string, string, string, string,
    ];
    return {
      acid: Number(acid),
      base: Number(base),
      added: signed(added),
      addedWords: added,
      acidAfter: Number(acidAfter),
      baseAfter: Number(baseAfter),
      leftOver: Math.abs(signed(left)),
      ratioBefore,
      ratioAfter: ratioAfter === 'none' ? null : ratioAfter,
      before,
      after,
      water,
    };
  });

const EVERY_STATE = AMOUNTS.flatMap((acid) => AMOUNTS.flatMap((base) => ADDED_STEPS.map((added) => ({ acid, base, added }))));

const hundredths = (text: string) => Math.round(Number(text) * 100);

describe('the constants', () => {
  it('is propanoic acid, pKa 4.87, with Ka = 10^−4.87 computed from it, and Kw 1.0 × 10⁻¹⁴', () => {
    expect(PKA).toBe(4.87);
    expect(KA).toBe(10 ** -4.87);
    expect(KA.toExponential(4)).toBe('1.3490e-5');
    expect(KA).not.toBe(1.3e-5);
    expect(KA).not.toBe(1.35e-5);
    expect(KW).toBe(1.0e-14);
    expect(KW).toBe(KW_25C);
  });

  it('has two sliders of 10 to 200 mmol in steps of 10 and one from 50 mmol of H₃O⁺ to 50 mmol of OH⁻ in steps of 5: 8,400 states', () => {
    expect(AMOUNT).toEqual({ min: 10, max: 200, step: 10 });
    expect(AMOUNTS).toHaveLength(20);
    expect(AMOUNTS[0]).toBe(10);
    expect(AMOUNTS.at(-1)).toBe(200);
    expect(ADDED).toEqual({ min: -50, max: 50, step: 5 });
    expect(ADDED_STEPS).toHaveLength(21);
    expect(ADDED_STEPS[0]).toBe(-50);
    expect(ADDED_STEPS[10]).toBe(0);
    expect(ADDED_STEPS.at(-1)).toBe(50);
    expect(EVERY_STATE).toHaveLength(8400);
  });

  it('starts at 100 mmol of each form with nothing added', () => {
    expect(START).toEqual({ acid: 100, base: 100, added: 0 });
  });

  it('draws pH scales from 0 to 14 and bars that hold 250 mmol', () => {
    expect(SCALE.pHMax).toBe(14);
    expect(SCALE.ticks).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
    expect(BAR_MAX_MMOL).toBe(250);
    expect(LABELS.buffer).toBe('Buffer');
    expect(LABELS.water).toBe('Water');
  });
});

describe('the sliders’ words', () => {
  it('shows and speaks the amounts', () => {
    expect(amountText(100)).toBe('100 mmol');
    expect(amountText(10)).toBe('10 mmol');
    expect(amountValueText(100, 'acid')).toBe('100 millimoles of propanoic acid');
    expect(amountValueText(20, 'base')).toBe('20 millimoles of propanoate ion');
  });

  it('speaks the addition as the brief words it, never as a signed number', () => {
    expect(addedValueText(15)).toBe('15 mmol of OH⁻');
    expect(addedValueText(-15)).toBe('15 mmol of H₃O⁺');
    expect(addedValueText(0)).toBe('nothing added');
    expect(addedText(50)).toBe('50 mmol of OH⁻');
    expect(addedText(-5)).toBe('5 mmol of H₃O⁺');
    expect(addedText(0)).toBe('nothing added');
    for (const added of ADDED_STEPS) expect(addedValueText(added)).not.toMatch(/[-−+]\d/);
  });
});

describe('bad input', () => {
  it('throws a RangeError naming a value that is not on a slider’s steps', () => {
    expect(() => state(5, 100, 0)).toThrow(RangeError);
    expect(() => state(5, 100, 0)).toThrow(/5/);
    expect(() => state(100, 210, 0)).toThrow(/210/);
    expect(() => state(100, 105, 0)).toThrow(/105/);
    expect(() => state(100, 100, 7)).toThrow(/7/);
    expect(() => state(100, 100, 55)).toThrow(/55/);
    expect(() => state(100, 100, -55)).toThrow(/-55/);
    expect(() => state(Number.NaN, 100, 0)).toThrow(/NaN/);
    expect(() => amountValueText(15, 'acid')).toThrow(RangeError);
    expect(() => addedValueText(3)).toThrow(RangeError);
    expect(() => readout(100, 100, 2.5)).toThrow(RangeError);
  });

  it('refuses a pH or a ratio it cannot show', () => {
    expect(() => shownPH(Number.NaN)).toThrow(RangeError);
    expect(() => shownRatio(0, 10)).toThrow(RangeError);
    expect(() => shownRatio(10, 0)).toThrow(RangeError);
    expect(() => shownRatio(2.5, 10)).toThrow(RangeError);
  });
});

describe('the rounding', () => {
  it('rounds a pH half up to two places', () => {
    expect(shownPH(4.87)).toBe('4.87');
    expect(shownPH(5.0250015)).toBe('5.03');
    expect(shownPH(4.99499)).toBe('4.99');
    expect(shownPH(12.6)).toBe('12.60');
    expect(shownPH(7)).toBe('7.00');
  });

  it('shows the ratio to three significant figures, rounded half up by whole-number arithmetic', () => {
    expect(shownRatio(100, 100)).toBe('1.00');
    expect(shownRatio(115, 85)).toBe('1.35');
    expect(shownRatio(50, 150)).toBe('0.333');
    expect(shownRatio(200, 10)).toBe('20.0');
    expect(shownRatio(10, 200)).toBe('0.0500');
    expect(shownRatio(245, 5)).toBe('49.0');
    expect(shownRatio(250, 5)).toBe('50.0');
    expect(shownRatio(5, 250)).toBe('0.0200');
    expect(shownRatio(10, 190)).toBe('0.0526');
    expect(shownRatio(55, 5)).toBe('11.0');
    // Exact ties: 1.125, 0.1875 and 3.125 go up.
    expect(shownRatio(90, 80)).toBe('1.13');
    expect(shownRatio(30, 160)).toBe('0.188');
    expect(shownRatio(250, 80)).toBe('3.13');
    // 999.5 thousandths rounds up to the next decade: 199.9 / 200.
    expect(shownRatio(1999, 2000)).toBe('1.00');
  });

  it('counts the exact ties in the ratio: 133 after an addition with both members left, and 14 starting buffers', () => {
    const tie = (base: number, acid: number) => {
      // base / acid × 10^k lands in [100, 1000); a tie is a remainder of exactly one half.
      let k = 0;
      while (base * 10 ** k < 100 * acid) k += 1;
      const num = base * 10 ** k;
      return (2 * num) % (2 * acid) === acid;
    };
    let after = 0;
    let starting = 0;
    for (const { acid, base, added } of EVERY_STATE) {
      const s = state(acid, base, added);
      if (added === 0 && tie(base, acid)) starting += 1;
      if (added !== 0 && s.acidAfter > 0 && s.baseAfter > 0 && tie(s.baseAfter, s.acidAfter)) after += 1;
    }
    expect(after).toBe(133);
    expect(starting).toBe(14);
  });

  // The brief's table "Rounding ties": unrounded pH, shown, the number of states, and what they end with.
  const TIES: [string, string, number, number, number][] = [
    ['5.0250015', '5.03', 11, 70, 100],
    ['4.9850027', '4.99', 3, 165, 215],
    ['4.9950028', '5.00', 10, 120, 160],
    ['6.0650028', '6.07', 2, 15, 235],
    ['4.9949900', '4.99', 6, 150, 200],
    ['8.9350106', '8.94', 5, 0, 100],
    ['5.2850149', '5.29', 6, 75, 195],
  ];
  for (const [unrounded, shown, count, acidAfter, baseAfter] of TIES) {
    it(`the ${count} states ending with ${acidAfter} and ${baseAfter} mmol: pH ${unrounded}, shown as ${shown}`, () => {
      const found = EVERY_STATE.map(({ acid, base, added }) => state(acid, base, added)).filter(
        (s) => s.acidAfter === acidAfter && s.baseAfter === baseAfter && s.leftOver === 0,
      );
      expect(found).toHaveLength(count);
      for (const s of found) {
        expect(s.bufferAfter.toFixed(7)).toBe(unrounded);
        expect(s.bufferAfterText).toBe(shown);
      }
    });
  }

  it('43 states come within 0.00002 of a tie in the second decimal place', () => {
    let near = 0;
    for (const { acid, base, added } of EVERY_STATE) {
      const pH = state(acid, base, added).bufferAfter;
      const fraction = pH * 100 - Math.floor(pH * 100);
      if (Math.abs(fraction - 0.5) < 0.002) near += 1;
    }
    expect(near).toBe(43);
  });

  it('the eleven at 5.0250015 run from (20, 150, 50 mmol of H₃O⁺) through (70, 100, nothing) to (120, 50, 50 mmol of OH⁻)', () => {
    expect(state(20, 150, -50).bufferAfterText).toBe('5.03');
    expect(state(70, 100, 0).bufferAfterText).toBe('5.03');
    expect(state(120, 50, 50).bufferAfterText).toBe('5.03');
    // The Henderson–Hasselbalch equation gives 5.0249 there.
    expect((PKA + Math.log10(100 / 70)).toFixed(4)).toBe('5.0249');
  });
});

describe('the worked states', () => {
  it('lists the brief’s twenty-three', () => {
    expect(WORKED_ROWS).toHaveLength(23);
  });

  for (const row of WORKED_ROWS) {
    const where = `${row.acid} mmol of acid form, ${row.base} of base form, ${row.addedWords} added`;
    it(`${where}: ${row.acidAfter} and ${row.baseAfter} after, ${row.leftOver} left over, ratio ${row.ratioBefore} to ${row.ratioAfter ?? 'none'}, pH ${row.before} to ${row.after}, water ${row.water}`, () => {
      const s = state(row.acid, row.base, row.added);
      expect(s.acidAfter).toBe(row.acidAfter);
      expect(s.baseAfter).toBe(row.baseAfter);
      expect(s.leftOver).toBe(row.leftOver);
      expect(s.ratioBeforeText).toBe(row.ratioBefore);
      expect(s.ratioAfterText).toBe(row.ratioAfter);
      expect(s.bufferBeforeText).toBe(row.before);
      expect(s.bufferAfterText).toBe(row.after);
      expect(s.waterBeforeText).toBe('7.00');
      expect(s.waterAfterText).toBe(row.water);
    });
  }

  it('the tie rows: 5.0250015 shown as 5.03, and 1.125 shown as 1.13', () => {
    expect(state(70, 100, 0).bufferAfter.toFixed(7)).toBe('5.0250015');
    expect(state(120, 50, 50).bufferAfter.toFixed(7)).toBe('5.0250015');
    expect(state(70, 100, -10).baseAfter / state(70, 100, -10).acidAfter).toBe(1.125);
    expect(state(150, 190, -10).baseAfter / state(150, 190, -10).acidAfter).toBe(1.125);
  });
});

describe('the readout', () => {
  it('gives the brief’s sentence for each of the seven kinds, word for word', () => {
    expect(readout(100, 100, 0)).toBe(
      "The buffer holds 100 mmol of propanoic acid and 100 mmol of propanoate ion: a ratio of base form to acid form of 1.00. Its pH is 4.87. The water's pH is 7.00. Nothing has been added yet.",
    );
    expect(readout(100, 100, 15)).toBe(
      "15 mmol of OH⁻ reacted with 15 mmol of propanoic acid and made 15 mmol of propanoate ion. The ratio of base form to acid form went from 1.00 to 1.35, and the buffer's pH from 4.87 to 5.00. The same 15 mmol took the water from pH 7.00 to 12.18.",
    );
    expect(readout(100, 100, -15)).toBe(
      "15 mmol of H₃O⁺ reacted with 15 mmol of propanoate ion and made 15 mmol of propanoic acid. The ratio of base form to acid form went from 1.00 to 0.739, and the buffer's pH from 4.87 to 4.74. The same 15 mmol took the water from pH 7.00 to 1.82.",
    );
    expect(readout(20, 20, 20)).toBe(
      '20 mmol of OH⁻ reacted with all 20 mmol of the propanoic acid. The acid form is used up, so this is no longer a buffer. What is left is propanoate ion, a weak base, and the pH has jumped from 4.87 to 8.74. The same 20 mmol took the water from pH 7.00 to 12.30.',
    );
    expect(readout(20, 20, 25)).toBe(
      'Only 20 mmol of the 25 mmol of OH⁻ found propanoic acid to react with. The acid form is used up, and the 5 mmol of OH⁻ left over now sets the pH, which has jumped from 4.87 to 11.70. The same 25 mmol took the water from pH 7.00 to 12.40.',
    );
    expect(readout(150, 50, -50)).toBe(
      '50 mmol of H₃O⁺ reacted with all 50 mmol of the propanoate ion. The base form is used up, so this is no longer a buffer. What is left is propanoic acid, a weak acid, and the pH has dropped from 4.39 to 2.79. The same 50 mmol took the water from pH 7.00 to 1.30.',
    );
    expect(readout(200, 10, -50)).toBe(
      'Only 10 mmol of the 50 mmol of H₃O⁺ found propanoate ion to react with. The base form is used up, and the 40 mmol of H₃O⁺ left over now sets the pH, which has dropped from 3.58 to 1.40. The same 50 mmol took the water from pH 7.00 to 1.30.',
    );
  });

  it('in every state, the sentence holds the state’s own shown numbers, has no signed number, and never says the buffer moved less', () => {
    for (const { acid, base, added } of EVERY_STATE) {
      const s = state(acid, base, added);
      const text = readout(acid, base, added);
      const n = Math.abs(added);
      // The water's sentence is the same, with its own numbers, in every state with something added.
      if (s.kind !== 'nothing') expect(text).toContain(`The same ${n} mmol took the water from pH ${s.waterBeforeText} to ${s.waterAfterText}.`);
      else expect(text).toContain(`The water's pH is ${s.waterBeforeText}. Nothing has been added yet.`);
      if (s.kind === 'nothing') {
        expect(text).toContain(`: a ratio of base form to acid form of ${s.ratioBeforeText}. Its pH is ${s.bufferBeforeText}. `);
      } else if (s.kind === 'ohBoth' || s.kind === 'h3oBoth') {
        expect(s.ratioAfterText).not.toBeNull();
        expect(text).toContain(
          `The ratio of base form to acid form went from ${s.ratioBeforeText} to ${s.ratioAfterText}, and the buffer's pH from ${s.bufferBeforeText} to ${s.bufferAfterText}. `,
        );
      } else {
        expect(s.ratioAfterText).toBeNull();
        expect(text).not.toMatch(/ratio/);
        const verb = s.kind === 'ohUsedUp' || s.kind === 'ohOverrun' ? 'jumped' : 'dropped';
        expect(text).toContain(`${s.kind.endsWith('Overrun') ? 'which' : 'the pH'} has ${verb} from ${s.bufferBeforeText} to ${s.bufferAfterText}. The same`);
      }
      expect(text).not.toMatch(/[-−]\d/);
      expect(text).not.toMatch(/less than the water/);
      if (s.kind === 'ohUsedUp') expect(text).toContain(`${n} mmol of OH⁻ reacted with all ${acid} mmol of the propanoic acid. The acid form is used up, so this is no longer a buffer.`);
      if (s.kind === 'h3oUsedUp') expect(text).toContain(`${n} mmol of H₃O⁺ reacted with all ${base} mmol of the propanoate ion. The base form is used up, so this is no longer a buffer.`);
      if (s.kind === 'ohOverrun') {
        expect(text).toContain(`Only ${s.reacted} mmol of the ${n} mmol of OH⁻ found propanoic acid to react with. The acid form is used up, and the ${s.leftOver} mmol of OH⁻ left over now sets the pH, which has jumped from `);
      }
      if (s.kind === 'h3oOverrun') {
        expect(text).toContain(`Only ${s.reacted} mmol of the ${n} mmol of H₃O⁺ found propanoate ion to react with. The base form is used up, and the ${s.leftOver} mmol of H₃O⁺ left over now sets the pH, which has dropped from `);
      }
    }
  });

  it('a larger ratio after never has a smaller pH after: across the states with both members left, the unrounded pH follows the exact ratio', () => {
    const rows = EVERY_STATE.map(({ acid, base, added }) => state(acid, base, added)).filter((s) => s.acidAfter > 0 && s.baseAfter > 0);
    expect(rows.length).toBeGreaterThan(7000);
    // Order by base / acid with whole-number cross-multiplication, then walk the groups of equal ratio.
    rows.sort((a, b) => a.baseAfter * b.acidAfter - b.baseAfter * a.acidAfter);
    let previous: { base: number; acid: number; highest: number } | null = null;
    let index = 0;
    while (index < rows.length) {
      const first = rows[index] as (typeof rows)[number];
      let lowest = first.bufferAfter;
      let highest = first.bufferAfter;
      let end = index + 1;
      while (end < rows.length) {
        const row = rows[end] as (typeof rows)[number];
        if (row.baseAfter * first.acidAfter !== first.baseAfter * row.acidAfter) break;
        lowest = Math.min(lowest, row.bufferAfter);
        highest = Math.max(highest, row.bufferAfter);
        end += 1;
      }
      if (previous) expect(lowest, `${first.baseAfter}/${first.acidAfter} after ${previous.base}/${previous.acid}`).toBeGreaterThanOrEqual(previous.highest);
      previous = { base: first.baseAfter, acid: first.acidAfter, highest };
      index = end;
    }
    // And at 1: equal amounts show a ratio of 1.00.
    for (const s of rows) if (s.baseAfter === s.acidAfter) expect(s.ratioAfterText).toBe('1.00');
  });
});

describe('the model, step 1: the reaction in whole millimoles', () => {
  it('follows the brief’s arithmetic in every state', () => {
    for (const { acid, base, added } of EVERY_STATE) {
      const s = state(acid, base, added);
      const n = Math.abs(added);
      if (added > 0) {
        const reacted = Math.min(n, acid);
        expect([s.reacted, s.acidAfter, s.baseAfter, s.leftOver]).toEqual([reacted, acid - reacted, base + reacted, n - reacted]);
        expect(s.leftOverIon).toBe(n > reacted ? 'OH⁻' : null);
      } else if (added < 0) {
        const reacted = Math.min(n, base);
        expect([s.reacted, s.acidAfter, s.baseAfter, s.leftOver]).toEqual([reacted, acid + reacted, base - reacted, n - reacted]);
        expect(s.leftOverIon).toBe(n > reacted ? 'H₃O⁺' : null);
      } else {
        expect([s.reacted, s.acidAfter, s.baseAfter, s.leftOver]).toEqual([0, acid, base, 0]);
      }
      expect(s.acidAfter + s.baseAfter).toBe(acid + base);
      for (const amount of [s.reacted, s.acidAfter, s.baseAfter, s.leftOver]) expect(Number.isInteger(amount)).toBe(true);
    }
  });

  it('counts the seven kinds as the brief’s table does', () => {
    const counts: Record<Kind, number> = { nothing: 0, ohBoth: 0, ohUsedUp: 0, ohOverrun: 0, h3oBoth: 0, h3oUsedUp: 0, h3oOverrun: 0 };
    for (const { acid, base, added } of EVERY_STATE) counts[state(acid, base, added).kind] += 1;
    expect(counts).toEqual({ nothing: 400, ohBoth: 3500, ohUsedUp: 100, ohOverrun: 400, h3oBoth: 3500, h3oUsedUp: 100, h3oOverrun: 400 });
  });

  it('leaves something over only in the 800 overrun states, so the left-over bar is empty in the other 7,600', () => {
    const left = EVERY_STATE.filter(({ acid, base, added }) => state(acid, base, added).leftOver > 0);
    expect(left).toHaveLength(800);
    expect(EVERY_STATE.length - left.length).toBe(7600);
  });
});

describe('the model, step 2: the pH from the shared solver', () => {
  it('passes the analytical concentrations, in mol/L for 1.00 L, to the solver', () => {
    for (const [acid, base, added] of [
      [100, 100, 15],
      [20, 20, 25],
      [150, 50, -50],
      [200, 10, -50],
    ] as const) {
      const oh = Math.max(added, 0);
      const h3o = Math.max(-added, 0);
      const h = hydronium({ weakAcid: (acid + base) / 1000, ka: 10 ** -4.87, cations: (base + oh) / 1000, anions: h3o / 1000 });
      const water = hydronium({ cations: oh / 1000, anions: h3o / 1000 });
      const s = state(acid, base, added);
      expect(s.bufferAfter).toBe(-Math.log10(h));
      expect(s.waterAfter).toBe(-Math.log10(water));
    }
  });

  it('the buffer’s pH before is the same call with nothing added, and the water starts at 7.00', () => {
    for (const acid of AMOUNTS) {
      for (const base of AMOUNTS) {
        const start = state(acid, base, 0);
        for (const added of ADDED_STEPS) {
          const s = state(acid, base, added);
          expect(s.bufferBefore).toBe(start.bufferAfter);
          expect(s.waterBefore).toBe(start.waterAfter);
          expect(s.waterBeforeText).toBe('7.00');
        }
      }
    }
  });
});

describe('the model, step 2, checked apart from the module', () => {
  // Written here from the brief's constants, with a plain long bisection in pH on the charge balance
  // [H3O+] + [cations] = [anions] + Kw / [H3O+] + C·Ka / (Ka + [H3O+]); nothing from acid-base.ts.
  const KA_BRIEF = 10 ** -4.87;
  const KW_BRIEF = 1.0e-14;
  function bisectPH(weakAcid: number, cations: number, anions: number): number {
    const residual = (pH: number) => {
      const h = 10 ** -pH;
      return h + cations - anions - KW_BRIEF / h - (weakAcid * KA_BRIEF) / (KA_BRIEF + h);
    };
    // The residual falls as pH rises, from positive (acidic) to negative (basic).
    let low = -2;
    let high = 16;
    for (let i = 0; i < 200; i += 1) {
      const middle = (low + high) / 2;
      if (residual(middle) > 0) low = middle;
      else high = middle;
    }
    return (low + high) / 2;
  }

  it('gives the buffer’s pH before and after, and the water’s, to 1e-6 in all 8,400 states, every kind among them', () => {
    const kinds = new Set<Kind>();
    for (const { acid, base, added } of EVERY_STATE) {
      const s = state(acid, base, added);
      kinds.add(s.kind);
      const oh = added > 0 ? added : 0;
      const h3o = added < 0 ? -added : 0;
      const where = `${acid}, ${base}, ${added}`;
      expect(Math.abs(s.bufferBefore - bisectPH(((acid + base) / 1000), base / 1000, 0)), `${where}: buffer before`).toBeLessThan(1e-6);
      expect(Math.abs(s.bufferAfter - bisectPH((acid + base) / 1000, (base + oh) / 1000, h3o / 1000)), `${where}: buffer after`).toBeLessThan(1e-6);
      expect(s.waterBefore, `${where}: water before`).toBeCloseTo(7, 6);
      // The water, in closed form: only the strong base (pOH = −log10 of its molarity) or only the strong acid is there.
      const expectedWater = added > 0 ? 14 + Math.log10(oh / 1000) : added < 0 ? -Math.log10(h3o / 1000) : 7;
      expect(Math.abs(s.waterAfter - expectedWater), `${where}: water after`).toBeLessThan(1e-6);
    }
    expect([...kinds].sort()).toEqual(['h3oBoth', 'h3oOverrun', 'h3oUsedUp', 'nothing', 'ohBoth', 'ohOverrun', 'ohUsedUp']);
  });
});

describe('the limits over all 8,400 states', () => {
  const all = EVERY_STATE.map(({ acid, base, added }) => ({ acid, base, added, s: state(acid, base, added) }));

  it('with nothing added the buffer runs from 3.58 (200 and 10) to 6.17 (10 and 200), and equal amounts show 4.87', () => {
    const starts = all.filter((r) => r.added === 0);
    const shown = starts.map((r) => hundredths(r.s.bufferAfterText));
    expect(Math.min(...shown)).toBe(358);
    expect(Math.max(...shown)).toBe(617);
    expect(state(200, 10, 0).bufferAfterText).toBe('3.58');
    expect(state(10, 200, 0).bufferAfterText).toBe('6.17');
    const equal = starts.filter((r) => r.acid === r.base);
    expect(equal).toHaveLength(20);
    for (const r of equal) expect(r.s.bufferAfterText).toBe('4.87');
  });

  it('with both members left, the buffer moves the right way, never shows the same pH twice, by 0.02 to 1.74, and less than the water, which moves 4.70 or more', () => {
    const both = all.filter((r) => r.s.kind === 'ohBoth' || r.s.kind === 'h3oBoth');
    expect(both).toHaveLength(7000);
    const changes: number[] = [];
    for (const { s } of both) {
      if (s.added > 0) expect(s.bufferAfter).toBeGreaterThan(s.bufferBefore);
      else expect(s.bufferAfter).toBeLessThan(s.bufferBefore);
      expect(s.bufferAfterText).not.toBe(s.bufferBeforeText);
      const change = Math.abs(hundredths(s.bufferAfterText) - hundredths(s.bufferBeforeText));
      const water = Math.abs(hundredths(s.waterAfterText) - hundredths(s.waterBeforeText));
      changes.push(change);
      expect(water).toBeGreaterThanOrEqual(470);
      expect(change).toBeLessThan(water);
    }
    expect(Math.min(...changes)).toBe(2);
    expect(Math.max(...changes)).toBe(174);
    expect([state(200, 200, 5).bufferAfterText, state(200, 200, -5).bufferAfterText]).toEqual(['4.89', '4.85']);
    const largest = state(50, 10, 45);
    expect([largest.bufferBeforeText, largest.bufferAfterText]).toEqual(['4.17', '5.91']);
  });

  it('with a member exactly used up, the pH after is 8.59 to 9.13 or 2.74 to 3.29', () => {
    const oh = all.filter((r) => r.s.kind === 'ohUsedUp').map((r) => hundredths(r.s.bufferAfterText));
    const h3o = all.filter((r) => r.s.kind === 'h3oUsedUp').map((r) => hundredths(r.s.bufferAfterText));
    expect([Math.min(...oh), Math.max(...oh)]).toEqual([859, 913]);
    expect([Math.min(...h3o), Math.max(...h3o)]).toEqual([274, 329]);
  });

  it('with a member overrun, 5 to 40 mmol is left over and the pH after is 11.70 to 12.60 or 1.40 to 2.30', () => {
    const over = all.filter((r) => r.s.kind === 'ohOverrun' || r.s.kind === 'h3oOverrun');
    const left = over.map((r) => r.s.leftOver);
    expect([Math.min(...left), Math.max(...left)]).toEqual([5, 40]);
    const oh = over.filter((r) => r.s.kind === 'ohOverrun').map((r) => hundredths(r.s.bufferAfterText));
    const h3o = over.filter((r) => r.s.kind === 'h3oOverrun').map((r) => hundredths(r.s.bufferAfterText));
    expect([Math.min(...oh), Math.max(...oh)]).toEqual([1170, 1260]);
    expect([Math.min(...h3o), Math.max(...h3o)]).toEqual([140, 230]);
    // The buffer can move further than the water here: 10, 10 and 50 mmol of OH⁻.
    const s = state(10, 10, 50);
    expect([s.bufferBeforeText, s.bufferAfterText, s.waterAfterText]).toEqual(['4.87', '12.60', '12.70']);
  });

  it('with an addition, the buffer ends below the water for OH⁻ and above it for H₃O⁺', () => {
    for (const { s } of all) {
      if (s.added > 0) expect(s.bufferAfter).toBeLessThan(s.waterAfter);
      if (s.added < 0) expect(s.bufferAfter).toBeGreaterThan(s.waterAfter);
    }
  });

  it('the buffer lies between 1.40 and 12.60 and the water between 1.30 and 12.70, so a scale of 0 to 14 holds every marker', () => {
    const buffer = all.flatMap((r) => [hundredths(r.s.bufferBeforeText), hundredths(r.s.bufferAfterText)]);
    const water = all.flatMap((r) => [hundredths(r.s.waterBeforeText), hundredths(r.s.waterAfterText)]);
    expect([Math.min(...buffer), Math.max(...buffer)]).toEqual([140, 1260]);
    expect([Math.min(...water), Math.max(...water)]).toEqual([130, 1270]);
  });

  it('with both members present, the shown pH differs from the Henderson–Hasselbalch value in 385 states: by 0.01 in 298', () => {
    let differ = 0;
    let byOne = 0;
    let most = 0;
    for (const { s } of all) {
      if (!(s.acidAfter > 0 && s.baseAfter > 0)) continue;
      const hh = shownPH(PKA + Math.log10(s.baseAfter / s.acidAfter));
      const gap = Math.abs(hundredths(hh) - hundredths(s.bufferAfterText));
      if (gap > 0) differ += 1;
      if (gap === 1) byOne += 1;
      if (gap > 1) expect(Math.min(s.acidAfter, s.baseAfter)).toBeLessThanOrEqual(10);
      most = Math.max(most, gap);
    }
    expect(differ).toBe(385);
    expect(byOne).toBe(298);
    expect(most).toBe(5);
  });

  it('starting buffers with the same ratio show the same pH, but for the two pairs the brief names', () => {
    expect(state(30, 10, 0).bufferAfterText).toBe('4.40');
    expect(state(150, 50, 0).bufferAfterText).toBe('4.39');
    expect(state(120, 160, 0).bufferAfterText).toBe('5.00');
    expect(state(150, 200, 0).bufferAfterText).toBe('4.99');
    const groups = new Map<string, Set<string>>();
    for (const acid of AMOUNTS) {
      for (const base of AMOUNTS) {
        const g = gcd(acid, base);
        const key = `${base / g}/${acid / g}`;
        const shown = groups.get(key) ?? new Set<string>();
        shown.add(state(acid, base, 0).bufferAfterText);
        groups.set(key, shown);
      }
    }
    expect(groups.size).toBe(255);
    // Six ratios whose buffers do not all show one pH, each split between two values 0.01 apart.
    const mixed = [...groups.values()].filter((set) => set.size > 1);
    expect(mixed).toHaveLength(6);
    for (const set of mixed) {
      const [one, two] = [...set].map(hundredths);
      expect(Math.abs((one ?? 0) - (two ?? 0))).toBe(1);
    }
  });
});

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

describe('the bars', () => {
  it('are the acid form and the base form after the reaction, each with its amount before, and what is left over', () => {
    expect(bars(100, 100, 15)).toEqual([
      { id: 'acid', name: 'Acid form', after: 85, before: 100, text: '85' },
      { id: 'base', name: 'Base form', after: 115, before: 100, text: '115' },
      { id: 'left', name: 'OH⁻ left over', after: 0, before: null, text: '0' },
    ]);
    expect(bars(20, 20, 25)[2]).toEqual({ id: 'left', name: 'OH⁻ left over', after: 5, before: null, text: '5' });
    expect(bars(200, 10, -50)[2]).toEqual({ id: 'left', name: 'H₃O⁺ left over', after: 40, before: null, text: '40' });
    expect(bars(100, 100, 0)[2]).toEqual({ id: 'left', name: 'Left over', after: 0, before: null, text: '0' });
  });

  it('never needs more than 250 mmol', () => {
    let most = 0;
    for (const { acid, base, added } of EVERY_STATE) for (const row of bars(acid, base, added)) most = Math.max(most, row.after, row.before ?? 0);
    expect(most).toBe(BAR_MAX_MMOL);
  });
});

describe('the descriptions', () => {
  it('describe the scales and the bars as the brief words them', () => {
    expect(describeScales(100, 100, 15)).toBe('Two pH scales from 0 to 14. Buffer: 4.87 before, 5.00 after. Water: 7.00 before, 12.18 after.');
    expect(describeBars(100, 100, 15)).toBe('Bars in millimoles. Acid form: 85, down from 100. Base form: 115, up from 100. Left over: none.');
    expect(describeBars(20, 20, 25)).toBe('Bars in millimoles. Acid form: 0, down from 20. Base form: 40, up from 20. Left over: 5 of OH⁻.');
    expect(describeBars(200, 10, -50)).toBe('Bars in millimoles. Acid form: 210, up from 200. Base form: 0, down from 10. Left over: 40 of H₃O⁺.');
  });

  it('say there is one marker on each scale when nothing is added', () => {
    expect(describeScales(100, 100, 0)).toBe('Two pH scales from 0 to 14, with nothing added yet. Buffer: 4.87. Water: 7.00.');
    expect(describeBars(100, 100, 0)).toBe('Bars in millimoles, with nothing added yet. Acid form: 100. Base form: 100. Left over: none.');
  });
});
