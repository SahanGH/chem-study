/** Grading for Check questions. No DOM here, so it is testable directly. */
import { fromSuperscript, toSuperscript } from './format';

export type NumericGrade = 'correct' | 'incorrect' | 'invalid';

/** Fraction of the expected value a numeric answer may differ by, unless the Check sets its own. */
const TOLERANCE = 0.02;

export function gradeChoice(selected: number, answer: number): boolean {
  return selected === answer;
}

/** How far a numeric answer may be from an expected answer of exactly zero. */
const ZERO_ANSWER_TOLERANCE = 1e-9;

/** Relative slack on the allowed difference, to absorb floating-point error. */
const FLOAT_SLACK = 1e-9;

// Digits, with commas allowed only as thousands separators ("1,200"). A
// lone "0,5" or "1,2" is how much of the world writes a decimal, so it is
// rejected rather than read as 5 or 12. A leading zero group ("0,500") is
// rejected for the same reason. The fraction may be empty ("5.") and the
// integer part may be absent (".05").
const NUMBER_PATTERN = /^[+-]?(?:(?:[1-9]\d{0,2}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

// A power of ten written the way the answer line shows one: "× 10" and then
// a raised exponent, to the end of the text. Raised characters anywhere else
// ("5²", "10²^3") are left alone, so the number pattern rejects them.
const RAISED_POWER_OF_TEN = /[×x*]10([⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/i;

/**
 * Reads what a student types for a number: plain decimals ("0.05", ".05",
 * "5."), e-notation ("2.5e-3"), the handwritten form ("2.5×10^-3",
 * "2.5 x 10^-3") and the form the answer line shows ("2.5 × 10⁻³"). Commas
 * are accepted only as thousands separators in the integer part
 * ("1,234,567.5"). The Unicode minus sign and en dash count as a minus, in
 * the number and in the exponent. Returns null when the text is not a
 * number, or is too large to be finite.
 */
export function parseNumber(text: string): number | null {
  const normalized = text
    .replace(/\s+/g, '')
    .replace(/[−–]/g, '-')
    .replace(RAISED_POWER_OF_TEN, (_whole, exponent: string) => `e${fromSuperscript(exponent)}`)
    .replace(/[×x*]10\^/i, 'e');
  if (!NUMBER_PATTERN.test(normalized)) return null;
  const value = Number(normalized.replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

export interface CheckAnswer {
  /** 1-based number of the correct option in the list. */
  answer?: number;
  /**
   * The correct value, for a question answered with a number. It is written
   * as text ("0.020") so its trailing zeros, which are significant figures,
   * are shown: the number 0.020 would be shown as 0.02.
   */
  numeric?: string;
  /** Unit shown beside the numeric input and the answer, for example "M/s". */
  unit?: string;
}

/** The text of a Check's "Answer:" line. Throws when the lesson gave no usable answer. */
export function shownAnswer({ answer, numeric, unit }: CheckAnswer): string {
  if ((answer === undefined) === (numeric === undefined)) {
    throw new Error('A Check needs exactly one of `answer` (option number) or `numeric` (a value).');
  }
  if (numeric === undefined) {
    if (unit !== undefined) throw new Error('A Check with `answer` (an option number) cannot have a `unit`.');
    return `option ${answer}`;
  }
  // Lessons are MDX, which is not type-checked, so numeric={0.020} can arrive here.
  if (typeof numeric !== 'string') {
    throw new Error(
      `Write a Check's numeric answer as text, numeric="0.020", not numeric={${String(numeric)}}: ` +
        'a number loses its trailing zeros.',
    );
  }
  if (parseNumber(numeric) === null) {
    throw new Error(
      `A Check's numeric answer must be a number such as "0.020" or "2.5e-3", not ${JSON.stringify(numeric)}. ` +
        'Put the unit in the `unit` attribute.',
    );
  }
  const shown = asPowerOfTen(numeric);
  if (!unit) return shown;
  // A percent sign is set against its number in US usage; every other unit takes a space.
  return unit === '%' ? `${shown}%` : `${shown} ${unit}`;
}

/**
 * A lesson writes a very large or very small answer in e-notation
 * ("5.86e-20"), which is what the grader reads. Students write it as a power
 * of ten, so that is how the answer line shows it: "5.86 × 10⁻²⁰". The digits
 * before the e are left as written, sign included, so their significant
 * figures survive. An answer with no e is shown as written.
 */
function asPowerOfTen(numeric: string): string {
  return numeric.trim().replace(/^(.+)e([+-]?)0*(\d+)$/i, (_whole, mantissa: string, sign: string, digits: string) => {
    const coefficient = mantissa.trim();
    // Leading zeros are dropped by the pattern, so "0" is an exponent of zero.
    // Ten to the power zero is 1: "× 10⁰" would say nothing.
    if (digits === '0') return coefficient;
    return `${coefficient} × 10${toSuperscript((sign === '-' ? '-' : '') + digits)}`;
  });
}

/**
 * `tolerance` is the fraction of the answer a typed value may differ by. It
 * is the page's 2 percent unless the Check set its own (readTolerance).
 */
export function gradeNumeric(text: string, answer: number, tolerance: number = TOLERANCE): NumericGrade {
  const value = parseNumber(text);
  if (value === null) return 'invalid';
  const allowed = answer === 0 ? ZERO_ANSWER_TOLERANCE : Math.abs(answer) * tolerance;
  // The slack absorbs floating-point error: 0.0204 is exactly 2% from 0.02,
  // yet |0.0204 - 0.02| computes to slightly more than 0.02 * 0.02.
  return Math.abs(value - answer) <= allowed * (1 + FLOAT_SLACK) ? 'correct' : 'incorrect';
}

/** How near a typed answer must be to a slip's value, as a fraction of that value, to be given its message. */
const SLIP_WINDOW = 0.01;

/** The longest feedback message, in characters: about four lines on a 320 px phone. */
export const FEEDBACK_LIMIT = 180;

/** A wrong numeric answer a known mistake gives, and what to say about it. */
export interface Slip {
  value: number;
  message: string;
}

/**
 * Why a feedback message cannot be used, or null when it can. A message is
 * plain text shown after "Not quite.", so it carries no math, no markup and
 * no opening of its own.
 */
export function feedbackProblem(message: unknown): string | null {
  if (typeof message !== 'string' || message.trim() === '') return 'is empty';
  if (message !== message.trim()) return 'has a space at its start or end';
  if (message.length > FEEDBACK_LIMIT) return `is ${message.length} characters long; the limit is ${FEEDBACK_LIMIT}`;
  if (/[$<>\\]/.test(message)) return 'has math or markup in it; write formulas as the prose does (H₂, 10²³)';
  if (/^not quite/i.test(message)) return 'starts with "Not quite", which the page adds';
  if (!/[.?]$/.test(message)) return 'does not end with a period or a question mark';
  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A Check's own tolerance, written in percent (`tolerance={0.5}`), as a
 * fraction. A Check may tighten the page's 2 percent, never loosen it: a
 * looser one would mark wrong methods correct.
 */
export function readTolerance(percent: unknown, numeric: string | undefined): number {
  if (percent === undefined) return TOLERANCE;
  if (numeric === undefined) throw new Error('A Check with `answer` (an option number) cannot have a `tolerance`.');
  if (typeof percent !== 'number' || !(percent > 0) || percent > TOLERANCE * 100) {
    throw new Error(
      `A Check's tolerance is a percent above 0 and at most ${TOLERANCE * 100}, such as tolerance={0.5}, ` +
        `not ${JSON.stringify(percent)}.`,
    );
  }
  return percent / 100;
}

/**
 * The messages for a choice Check's wrong options, keyed by option number
 * from 1. Throws when the lesson's `misses` cannot be used. Whether each
 * number names an option the Check has is checked on the built page
 * (scripts/check-dist.mjs), which is where the options are.
 */
export function readMisses(misses: unknown, answer: number | undefined): Record<string, string> | undefined {
  if (misses === undefined) return undefined;
  if (answer === undefined) throw new Error('A Check with `numeric` takes `slips`, not `misses`.');
  if (!isPlainObject(misses)) throw new Error('Write misses as option numbers and messages: misses={{ 1: "…", 3: "…" }}.');
  const read: Record<string, string> = {};
  for (const [key, message] of Object.entries(misses)) {
    const option = Number(key);
    if (!Number.isInteger(option) || option < 1) throw new Error(`A miss is keyed by an option number from 1, not ${JSON.stringify(key)}.`);
    if (option === answer) throw new Error(`Option ${option} is the answer, so it cannot have a miss.`);
    const problem = feedbackProblem(message);
    if (problem) throw new Error(`The miss for option ${option} ${problem}.`);
    read[String(option)] = message as string;
  }
  return read;
}

/**
 * The messages for a numeric Check's known wrong answers, keyed by the value
 * as the lesson wrote it. Throws when a slip cannot be used, and when one lies
 * inside the tolerance: the page would mark that mistake correct.
 */
export function readSlips(
  slips: unknown,
  numeric: string | undefined,
  tolerance: number,
): Record<string, string> | undefined {
  if (slips === undefined) return undefined;
  if (numeric === undefined) throw new Error('A Check with `answer` (an option number) takes `misses`, not `slips`.');
  if (!isPlainObject(slips)) throw new Error('Write slips as values and messages: slips={{ "0.0400": "…" }}.');
  const answer = parseNumber(numeric);
  if (answer === null) throw new Error(`A Check's numeric answer must be a number, not ${JSON.stringify(numeric)}.`);
  const seen = new Set<number>();
  const read: Record<string, string> = {};
  for (const [key, message] of Object.entries(slips)) {
    const value = parseNumber(key);
    if (value === null) throw new Error(`A slip is keyed by a number such as "0.0400" or "1.31e25", not ${JSON.stringify(key)}.`);
    if (seen.has(value)) throw new Error(`The slip ${key} is listed twice.`);
    seen.add(value);
    if (gradeNumeric(key, answer, tolerance) === 'correct') {
      throw new Error(
        `The slip ${key} is within ${tolerance * 100} percent of the answer ${numeric}, so the page would mark it correct. ` +
          'Give the Check a smaller `tolerance`, or drop the slip.',
      );
    }
    const problem = feedbackProblem(message);
    if (problem) throw new Error(`The message for the slip ${key} ${problem}.`);
    read[key] = message as string;
  }
  return read;
}

/**
 * The slip a typed value most likely is: the nearest one, when the value is
 * within 1 percent of it. Null when no slip is that near. A slip of exactly
 * zero is matched only by zero.
 */
export function nearestSlip(value: number, slips: Slip[]): Slip | null {
  let nearest: Slip | null = null;
  let nearestDistance = Infinity;
  for (const slip of slips) {
    const distance = Math.abs(value - slip.value);
    const window = slip.value === 0 ? ZERO_ANSWER_TOLERANCE : Math.abs(slip.value) * SLIP_WINDOW;
    if (distance <= window * (1 + FLOAT_SLACK) && distance < nearestDistance) {
      nearest = slip;
      nearestDistance = distance;
    }
  }
  return nearest;
}

/**
 * The messages a Check carries in a data attribute, as written by
 * Check.astro. Throws when the attribute is not a set of messages: a page
 * built from a lesson cannot carry anything else.
 */
export function messagesFrom(json: string | undefined): Record<string, string> {
  if (json === undefined) return {};
  const parsed: unknown = JSON.parse(json);
  if (!isPlainObject(parsed) || !Object.values(parsed).every((message) => typeof message === 'string')) {
    throw new Error('A Check carries feedback that is not a set of messages.');
  }
  return parsed as Record<string, string>;
}

/** The slips a Check carries, each value read the way a typed answer is. */
export function slipsFrom(json: string | undefined): Slip[] {
  return Object.entries(messagesFrom(json)).map(([key, message]) => {
    const value = parseNumber(key);
    if (value === null) throw new Error(`A Check has a slip that is not a number: ${key}`);
    return { value, message };
  });
}
