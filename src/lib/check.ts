/** Grading for Check questions. No DOM here, so it is testable directly. */

export type NumericGrade = 'correct' | 'incorrect' | 'invalid';

/** Fraction of the expected value a numeric answer may differ by. */
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

/**
 * Reads what a student types for a number: plain decimals ("0.05", ".05",
 * "5."), e-notation ("2.5e-3") and the handwritten form ("2.5×10^-3",
 * "2.5 x 10^-3"). Commas are accepted only as thousands separators in the
 * integer part ("1,234,567.5"). The Unicode minus sign and en dash count as
 * a minus, in the number and in the exponent. Returns null when the text is
 * not a number, or is too large to be finite.
 */
export function parseNumber(text: string): number | null {
  const normalized = text
    .replace(/\s+/g, '')
    .replace(/[−–]/g, '-')
    .replace(/[×x*]10\^/i, 'e');
  if (!NUMBER_PATTERN.test(normalized)) return null;
  const value = Number(normalized.replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

export function gradeNumeric(text: string, answer: number): NumericGrade {
  const value = parseNumber(text);
  if (value === null) return 'invalid';
  const allowed = answer === 0 ? ZERO_ANSWER_TOLERANCE : Math.abs(answer) * TOLERANCE;
  // The slack absorbs floating-point error: 0.0204 is exactly 2% from 0.02,
  // yet |0.0204 - 0.02| computes to slightly more than 0.02 * 0.02.
  return Math.abs(value - answer) <= allowed * (1 + FLOAT_SLACK) ? 'correct' : 'incorrect';
}
