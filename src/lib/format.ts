/** Number formatting for the interactive diagrams and the Check questions. */

const SUPERSCRIPT: Record<string, string> = {
  '+': '⁺',
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

const FROM_SUPERSCRIPT: Record<string, string> = Object.fromEntries(
  Object.entries(SUPERSCRIPT).map(([plain, raised]) => [raised, plain]),
);

/** The typographic minus sign, which lines up with the digits; a hyphen does not. */
const MINUS = '−';

/**
 * An exponent as raised characters: "-20" becomes "⁻²⁰". It takes digits, a
 * plus sign and a minus sign, typed as a hyphen or as a true minus, and
 * throws for anything else.
 */
export function toSuperscript(text: string): string {
  return Array.from(text, (character) => {
    const raised = SUPERSCRIPT[character === MINUS ? '-' : character];
    if (raised === undefined) throw new Error(`No superscript for "${character}" in "${text}".`);
    return raised;
  }).join('');
}

/**
 * A raised exponent as plain characters a number can be read from: "⁻²⁰"
 * becomes "-20", with a hyphen. It throws for a character that is not a
 * raised digit or sign.
 */
export function fromSuperscript(text: string): string {
  return Array.from(text, (character) => {
    const plain = FROM_SUPERSCRIPT[character];
    if (plain === undefined) throw new Error(`"${character}" in "${text}" is not a superscript digit or sign.`);
    return plain;
  }).join('');
}

/**
 * A quantity with a number of significant figures, two unless told
 * otherwise, the way a lesson writes it: 0.032 stays "0.032", and 0.0032
 * becomes "3.2 × 10⁻³". Numbers below 0.01 or from 10 up are written as a
 * power of ten.
 */
export function formatQuantity(value: number, significantFigures = 2): string {
  if (!Number.isFinite(value)) throw new RangeError(`Cannot format ${value}: it is not a finite number.`);
  // The limits of toPrecision and toExponential, checked here so the message says what was asked for.
  if (!(Number.isInteger(significantFigures) && significantFigures >= 1 && significantFigures <= 100)) {
    throw new RangeError(
      `The number of significant figures must be a whole number from 1 to 100, not ${significantFigures}.`,
    );
  }
  if (value === 0) return '0';
  const sign = value < 0 ? MINUS : '';
  const size = Math.abs(value);
  // Rounding first keeps 0.00999 from being written as "0.010" by one rule
  // and "1.0 × 10⁻²" by the other.
  const rounded = Number(size.toPrecision(significantFigures));
  if (rounded >= 0.01 && rounded < 10) return sign + rounded.toPrecision(significantFigures);
  const exponential = rounded.toExponential(significantFigures - 1);
  const [mantissa, exponent] = exponential.split('e');
  // toExponential always gives "d.de±n" for a finite number, so this cannot
  // happen today. It is here so that a change to the lines above fails
  // loudly instead of printing a wrong exponent.
  if (mantissa === undefined || exponent === undefined) {
    throw new Error(`Expected a number written like 3.2e-3, not "${exponential}".`);
  }
  return `${sign}${mantissa} × 10${toSuperscript(exponent.replace('+', ''))}`;
}
