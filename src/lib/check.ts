/** Grading for Check questions. No DOM here, so it is testable directly. */

export type NumericGrade = 'correct' | 'incorrect' | 'invalid';

/** Fraction of the expected value a numeric answer may differ by. */
const TOLERANCE = 0.02;

export function gradeChoice(selected: number, answer: number): boolean {
  return selected === answer;
}

/**
 * Reads what a student types for a number: plain decimals, e-notation
 * ("2.5e-3") and the handwritten form ("2.5×10^-3", "2.5 x 10^-3").
 * Returns null when the text is not a number.
 */
export function parseNumber(text: string): number | null {
  const compact = text.trim().replace(/,/g, '').replace(/\s+/g, '');
  const normalized = compact.replace(/[×x*]10\^/i, 'e');
  if (!/^[+-]?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(normalized)) return null;
  return Number(normalized);
}

export function gradeNumeric(text: string, answer: number): NumericGrade {
  const value = parseNumber(text);
  if (value === null) return 'invalid';
  const allowed = answer === 0 ? 1e-9 : Math.abs(answer) * TOLERANCE;
  // The slack absorbs floating-point error: 0.0204 is exactly 2% from 0.02,
  // yet |0.0204 - 0.02| computes to slightly more than 0.02 * 0.02.
  return Math.abs(value - answer) <= allowed * (1 + 1e-9) ? 'correct' : 'incorrect';
}
