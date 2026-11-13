/** Number formatting for the interactive diagrams. */

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/** The typographic minus sign, which lines up with the digits; a hyphen does not. */
const MINUS = '−';

/**
 * A quantity with two significant figures, the way a lesson writes it:
 * 0.032 stays "0.032", and 0.0032 becomes "3.2 × 10⁻³". Numbers below 0.01
 * or from 10 up are written as a power of ten.
 */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`Cannot format ${value}: it is not a finite number.`);
  if (value === 0) return '0';
  const sign = value < 0 ? MINUS : '';
  const size = Math.abs(value);
  // Rounding first keeps 0.00999 from being written as "0.010" by one rule
  // and "1.0 × 10⁻²" by the other.
  const rounded = Number(size.toPrecision(2));
  if (rounded >= 0.01 && rounded < 10) return sign + rounded.toPrecision(2);
  const exponential = rounded.toExponential(1);
  const [mantissa, exponent] = exponential.split('e');
  // toExponential always gives "d.de±n" for a finite number, so neither
  // throw below can happen today. They are here so that a change to the
  // lines above fails loudly instead of printing a wrong exponent.
  if (mantissa === undefined || exponent === undefined) {
    throw new Error(`Expected a number written like 3.2e-3, not "${exponential}".`);
  }
  const power = Array.from(exponent.replace('+', ''), (character) => {
    const raised = SUPERSCRIPT[character];
    if (raised === undefined) throw new Error(`No superscript for "${character}" in the exponent of ${exponential}.`);
    return raised;
  }).join('');
  return `${sign}${mantissa} × 10${power}`;
}
