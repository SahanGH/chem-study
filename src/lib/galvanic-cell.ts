/**
 * The galvanic cell explorer of lesson 9.9 (placed again in lesson 9.10): two
 * half-cells, each a metal in a solution of its own ion, joined by a wire with
 * a meter and by a salt bridge of potassium nitrate, at 25 °C. No DOM here, so
 * it is testable directly.
 *
 * Exact where it can be: each E° is a whole number of hundredths of a volt,
 * each ion's charge a whole number and each concentration a whole power of
 * ten, so the balanced equation, n, E°cell and log Q are exact whole numbers.
 * E°cell is the cathode's E° minus the anode's, both as the table prints them.
 * A potential is never multiplied by a coefficient anywhere here: the
 * coefficients balance the electrons and set the powers in Q, nothing else.
 *
 * The one irrational step is the Nernst shift, −(RT ln 10 ÷ nF) × log Q at
 * 298.15 K. It is rounded once to 0.001 V and added to the exact E°cell, so the
 * shown E°cell and the shown E can never disagree. The unit tests prove that
 * no shift lies within 10⁻⁹ V of a rounding boundary.
 */

/** The site's equation page: R in J/(mol·K), F in C per mole of electrons, and 25 °C in kelvins. */
export const GAS_CONSTANT = 8.314;
export const FARADAY = 96485;
export const TEMPERATURE = 298.15;
/** RT ln 10 ÷ F, in volts: the change in E for a factor of ten in Q when n = 1 (0.0591563 V). */
export const NERNST_SLOPE = (GAS_CONSTANT * TEMPERATURE * Math.LN10) / FARADAY;

export type MetalId = 'silver' | 'copper' | 'tin' | 'cobalt' | 'cadmium' | 'chromium';
/** A concentration as its power of ten: −3 is 0.0010 M. */
export type Exponent = -3 | -2 | -1 | 0;
export type Side = 'left' | 'right';

export interface HalfCell {
  /** The name in a sentence: "silver". */
  readonly name: string;
  /** The name in the menu: "Silver". */
  readonly label: string;
  readonly symbol: string;
  /** The ion's charge, a whole number. */
  readonly charge: number;
  /** The ion: "Ag⁺". */
  readonly ion: string;
  /** E° in whole hundredths of a volt. */
  readonly hundredths: number;
  /** The half-reaction as a reduction, as the table prints it. */
  readonly halfReaction: string;
}

const CHARGES: Readonly<Record<number, string>> = { 1: '⁺', 2: '²⁺', 3: '³⁺' };
function chargeText(charge: number): string {
  const text = CHARGES[charge];
  if (text === undefined) throw new RangeError(`There is no ion charge ${charge} in this explorer.`);
  return text;
}
/** "e⁻", "2e⁻", "3e⁻". */
const electronsText = (count: number) => `${count === 1 ? '' : count}e⁻`;

function halfCell(name: string, symbol: string, charge: number, hundredths: number): HalfCell {
  const ion = `${symbol}${chargeText(charge)}`;
  const first = name[0];
  if (first === undefined) throw new RangeError('A half-cell needs a name.');
  return {
    name,
    label: `${first.toUpperCase()}${name.slice(1)}`,
    symbol,
    charge,
    ion,
    hundredths,
    halfReaction: `${ion}(aq) + ${electronsText(charge)} → ${symbol}(s)`,
  };
}

/** The six half-cells, top of the ladder first. */
export const METAL_IDS: readonly MetalId[] = ['silver', 'copper', 'tin', 'cobalt', 'cadmium', 'chromium'];
export const METALS: Readonly<Record<MetalId, HalfCell>> = {
  silver: halfCell('silver', 'Ag', 1, 80),
  copper: halfCell('copper', 'Cu', 2, 34),
  tin: halfCell('tin', 'Sn', 2, -14),
  cobalt: halfCell('cobalt', 'Co', 2, -28),
  cadmium: halfCell('cadmium', 'Cd', 2, -40),
  chromium: halfCell('chromium', 'Cr', 3, -74),
};

/** The concentration sliders: four stops, kept as powers of ten. */
export const EXPONENTS: readonly Exponent[] = [-3, -2, -1, 0];
export const CONCENTRATION = { min: -3, max: 0, step: 1 } as const;

export const START = { left: 'tin', leftExponent: 0, right: 'silver', rightExponent: 0 } as const satisfies {
  left: MetalId;
  leftExponent: Exponent;
  right: MetalId;
  rightExponent: Exponent;
};

/** The line for Q, on a scale of powers of ten. */
export const Q_AXIS = { min: -9, max: 9, ticks: [-9, -6, -3, 0, 3, 6, 9] } as const;

/** The words drawn in the diagram and its controls. */
export const LABELS = {
  leftSide: 'Left half-cell',
  rightSide: 'Right half-cell',
  metal: 'Metal',
  concentration: 'Concentration',
  electrons: 'e⁻',
  nitrate: 'NO₃⁻',
  potassium: 'K⁺',
  qName: 'Q',
  qOne: 'Q = 1: E = E°',
  anode: 'anode: oxidation',
  cathode: 'cathode: reduction',
  neither: 'no net reaction',
  losesMass: 'loses mass',
  gainsMass: 'gains mass',
} as const;

const MINUS = '−';
const SUPERSCRIPTS: Readonly<Record<string, string>> = {
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
function superscript(value: number): string {
  return String(value)
    .split('')
    .map((c) => {
      const sup = SUPERSCRIPTS[c];
      if (sup === undefined) throw new RangeError(`There is no superscript for "${c}" in ${value}.`);
      return sup;
    })
    .join('');
}

function assertMetal(id: MetalId): HalfCell {
  if (!(METAL_IDS as readonly string[]).includes(id)) {
    throw new RangeError(`The metal must be one of ${METAL_IDS.join(', ')}, not ${String(id)}.`);
  }
  return METALS[id];
}

function assertExponent(exponent: Exponent): void {
  if (!(EXPONENTS as readonly number[]).includes(exponent)) {
    throw new RangeError(`A concentration must be 10 to the power ${EXPONENTS.join(', ')} M, not 10 to the power ${String(exponent)}.`);
  }
}

const MOLARITY: Readonly<Record<Exponent, string>> = { [-3]: '0.0010', [-2]: '0.010', [-1]: '0.10', 0: '1.0' };
function molarity(exponent: Exponent): string {
  assertExponent(exponent);
  return MOLARITY[exponent];
}

/** A concentration as shown: "0.010 M". */
export function concentrationText(exponent: Exponent): string {
  return `${molarity(exponent)} M`;
}

/** A concentration as spoken: "0.010 molar". */
export function concentrationValueText(exponent: Exponent): string {
  return `${molarity(exponent)} molar`;
}

/** Whole hundredths of a volt as the table prints them: "0.80", "−0.14". */
function hundredthsText(hundredths: number): string {
  const size = Math.abs(hundredths);
  return `${hundredths < 0 ? MINUS : ''}${Math.floor(size / 100)}.${String(size % 100).padStart(2, '0')}`;
}
/** Whole thousandths of a volt: "0.940". */
function thousandthsText(thousandths: number): string {
  const size = Math.abs(thousandths);
  return `${thousandths < 0 ? MINUS : ''}${Math.floor(size / 1000)}.${String(size % 1000).padStart(3, '0')}`;
}

/** A rung of the ladder: "Ag⁺/Ag +0.80 V". */
export function rungText(id: MetalId): string {
  const metal = assertMetal(id);
  const sign = metal.hundredths > 0 ? '+' : '';
  return `${metal.ion}/${metal.symbol} ${sign}${hundredthsText(metal.hundredths)} V`;
}

/** A value on the Q line: "10⁻⁹", "1", "10³". */
export function qTickText(power: number): string {
  if (!Number.isInteger(power)) throw new RangeError(`A value on the Q line must be a whole power of ten, not ${power}.`);
  return power === 0 ? '1' : `10${superscript(power)}`;
}

/** Q as shown: "1.0", "1.0 × 10⁻³". */
function qValueText(logQ: number): string {
  return logQ === 0 ? '1.0' : `1.0 × 10${superscript(logQ)}`;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const coefficientText = (coefficient: number) => (coefficient === 1 ? '' : String(coefficient));
const powerText = (power: number) => (power === 1 ? '' : superscript(power));

export interface Flow {
  /** The side the electrons move toward through the wire, or null when nothing flows. */
  readonly electrons: Side | null;
  /** The side NO₃⁻ moves toward in the salt bridge: the anode's. */
  readonly nitrate: Side | null;
  /** The side K⁺ moves toward in the salt bridge: the cathode's. */
  readonly potassium: Side | null;
}

export interface GalvanicCellState {
  readonly left: MetalId;
  readonly leftExponent: Exponent;
  readonly right: MetalId;
  readonly rightExponent: Exponent;
  /** 'two metals', 'concentration' (one metal, unequal concentrations) or 'equilibrium' (one metal, equal). */
  readonly kind: 'two metals' | 'concentration' | 'equilibrium';
  readonly anode: Side | null;
  readonly cathode: Side | null;
  readonly anodeMetal: MetalId | null;
  readonly cathodeMetal: MetalId | null;
  /** Moles of electrons for each mole of reaction (for one metal, the ion's charge). */
  readonly n: number;
  /** The overall equation in lowest whole numbers; null for one metal. */
  readonly equation: string | null;
  /** E°cell in whole hundredths of a volt. */
  readonly standardHundredths: number;
  /** ΔG° as shown, to the nearest kJ/mol_rxn: "−181", "0". */
  readonly deltaGText: string;
  /** log Q, a whole number. */
  readonly logQ: number;
  readonly qExpression: string;
  readonly qText: string;
  /** The shift from E°cell, unrounded, in volts. */
  readonly exactShift: number;
  /** The shift rounded once, in whole thousandths of a volt, and as shown: "−0.059", "+0.030", "0.000". */
  readonly shiftThousandths: number;
  readonly shiftText: string;
  /** E, unrounded, in volts. */
  readonly exactE: number;
  /** E as shown: E°cell plus the rounded shift, in whole thousandths, and as text: "0.940". */
  readonly eThousandths: number;
  readonly eText: string;
  readonly flow: Flow;
}

const other = (side: Side): Side => (side === 'left' ? 'right' : 'left');

/** The shift −(RT ln 10 ÷ nF) × log Q, unrounded and rounded once to 0.001 V (half away from zero; no state is near a tie). */
function shiftOf(n: number, logQ: number): { exact: number; thousandths: number } {
  if (logQ === 0) return { exact: 0, thousandths: 0 };
  const exact = -(NERNST_SLOPE / n) * logQ;
  const size = Math.floor(Math.abs(exact) * 1000 + 0.5);
  return { exact, thousandths: exact < 0 ? -size : size };
}

export function state(left: MetalId, leftExponent: Exponent, right: MetalId, rightExponent: Exponent): GalvanicCellState {
  const l = assertMetal(left);
  const r = assertMetal(right);
  assertExponent(leftExponent);
  assertExponent(rightExponent);
  const settings = { left, leftExponent, right, rightExponent };

  if (left === right) {
    const z = l.charge;
    if (leftExponent === rightExponent) {
      return {
        ...settings,
        kind: 'equilibrium',
        anode: null,
        cathode: null,
        anodeMetal: null,
        cathodeMetal: null,
        n: z,
        equation: null,
        standardHundredths: 0,
        deltaGText: '0',
        logQ: 0,
        qExpression: `[${l.ion}, dilute]/[${l.ion}, concentrated]`,
        qText: qValueText(0),
        exactShift: 0,
        shiftThousandths: 0,
        shiftText: thousandthsText(0),
        exactE: 0,
        eThousandths: 0,
        eText: thousandthsText(0),
        flow: { electrons: null, nitrate: null, potassium: null },
      };
    }
    // The dilute half-cell is the anode: Q = [dilute] ÷ [concentrated] is below 1, so E is above zero.
    const anode: Side = leftExponent < rightExponent ? 'left' : 'right';
    const logQ = Math.min(leftExponent, rightExponent) - Math.max(leftExponent, rightExponent);
    const shift = shiftOf(z, logQ);
    return {
      ...settings,
      kind: 'concentration',
      anode,
      cathode: other(anode),
      anodeMetal: left,
      cathodeMetal: left,
      n: z,
      equation: null,
      standardHundredths: 0,
      deltaGText: '0',
      logQ,
      qExpression: `[${l.ion}, dilute]/[${l.ion}, concentrated]`,
      qText: qValueText(logQ),
      exactShift: shift.exact,
      shiftThousandths: shift.thousandths,
      shiftText: signedThousandths(shift.thousandths),
      exactE: shift.exact,
      eThousandths: shift.thousandths,
      eText: thousandthsText(shift.thousandths),
      flow: { electrons: other(anode), nitrate: anode, potassium: other(anode) },
    };
  }

  // Two different metals: A, the lower E°, is the anode; C, the higher, the cathode.
  const anode: Side = l.hundredths < r.hundredths ? 'left' : 'right';
  const [anodeMetal, cathodeMetal] = anode === 'left' ? [left, right] : [right, left];
  const [a, c] = [METALS[anodeMetal], METALS[cathodeMetal]];
  const [anodeExponent, cathodeExponent] = anode === 'left' ? [leftExponent, rightExponent] : [rightExponent, leftExponent];
  const n = (a.charge * c.charge) / gcd(a.charge, c.charge);
  const metalCoefficient = n / a.charge;
  const ionCoefficient = n / c.charge;
  const equation =
    `${coefficientText(metalCoefficient)}${a.symbol}(s) + ${coefficientText(ionCoefficient)}${c.ion}(aq) → ` +
    `${coefficientText(metalCoefficient)}${a.ion}(aq) + ${coefficientText(ionCoefficient)}${c.symbol}(s)`;
  const standardHundredths = c.hundredths - a.hundredths;
  // ΔG° = −nFE° exactly, in hundredths of a joule: n × 96,485 × (E° in hundredths of a volt). Shown to
  // the nearest kJ, half up on its size; the tests prove that none is near a half.
  const deltaGHundredthsOfJoule = -n * FARADAY * standardHundredths;
  const kJ = Math.floor(Math.abs(deltaGHundredthsOfJoule) / 100_000 + 0.5);
  const deltaGText = kJ === 0 ? '0' : `${deltaGHundredthsOfJoule < 0 ? MINUS : ''}${kJ}`;
  const logQ = metalCoefficient * anodeExponent - ionCoefficient * cathodeExponent;
  const shift = shiftOf(n, logQ);
  const exactE = standardHundredths / 100 + shift.exact;
  // The cell runs in the direction for which E is positive. For the six metals of this explorer that is
  // always the direction E° gives: the largest shift the sliders can make is smaller than every gap.
  if (!(exactE > 0)) throw new Error(`${a.name} with ${c.name} would run backward at these concentrations, which the brief rules out.`);
  const eThousandths = standardHundredths * 10 + shift.thousandths;
  return {
    ...settings,
    kind: 'two metals',
    anode,
    cathode: other(anode),
    anodeMetal,
    cathodeMetal,
    n,
    equation,
    standardHundredths,
    deltaGText,
    logQ,
    qExpression: `[${a.ion}]${powerText(metalCoefficient)}/[${c.ion}]${powerText(ionCoefficient)}`,
    qText: qValueText(logQ),
    exactShift: shift.exact,
    shiftThousandths: shift.thousandths,
    shiftText: signedThousandths(shift.thousandths),
    exactE,
    eThousandths,
    eText: thousandthsText(eThousandths),
    flow: { electrons: other(anode), nitrate: anode, potassium: other(anode) },
  };
}

/** A shift as shown: "+0.030", "−0.059", "0.000". */
function signedThousandths(thousandths: number): string {
  return thousandths > 0 ? `+${thousandthsText(thousandths)}` : thousandthsText(thousandths);
}

/** "2 mol of electrons pass", "1 mol of electrons passes". */
const electronsPass = (n: number) => `${n} mol of electrons ${n === 1 ? 'passes' : 'pass'} through the wire`;

/** What the diagram says, for the status line. */
export function readout(left: MetalId, leftExponent: Exponent, right: MetalId, rightExponent: Exponent): string {
  const s = state(left, leftExponent, right, rightExponent);
  const metal = METALS[left];
  if (s.kind === 'equilibrium') {
    return (
      `Both half-cells are ${metal.name} at ${concentrationText(leftExponent)}, so nothing sets them apart. ` +
      'Q = 1 and K = 1: the cell is at equilibrium, E = 0 V and no electrons flow.'
    );
  }
  if (s.kind === 'concentration') {
    return (
      `Both half-cells are ${metal.name}, so E°cell = 0 V and ΔG° = 0. ` +
      `The half-cell with the lower concentration, the ${s.anode} one, is the anode. ` +
      `For each mole of ${metal.ion} made there, ${electronsPass(s.n)}. ` +
      `Q = ${s.qExpression} = ${s.qText}. Q is below 1, so E is above zero: ${s.eText} V.`
    );
  }
  if (s.anodeMetal === null || s.cathodeMetal === null) throw new Error('A cell of two metals has an anode and a cathode.');
  const a = METALS[s.anodeMetal].hundredths;
  const c = METALS[s.cathodeMetal].hundredths;
  const anodeValue = a < 0 ? `(${hundredthsText(a)})` : hundredthsText(a);
  let tail: string;
  if (s.logQ === 0 && leftExponent === 0 && rightExponent === 0) tail = `Both solutions are 1.0 M, the standard condition, so E = E°cell: ${s.eText} V.`;
  else if (s.logQ === 0) tail = `Q is 1, so E is equal to E°cell: ${s.eText} V.`;
  else if (s.logQ < 0) tail = `Q is below 1, so E is above E°cell: ${s.eText} V.`;
  else tail = `Q is above 1, so E is below E°cell: ${s.eText} V.`;
  return (
    `${s.equation}. For each mole of reaction, ${electronsPass(s.n)}. ` +
    `E°cell = ${hundredthsText(c)} − ${anodeValue} = ${hundredthsText(s.standardHundredths)} V, and ΔG° = ${s.deltaGText} kJ/mol_rxn. ` +
    `Q = ${s.qExpression} = ${s.qText}. ${tail}`
  );
}

export interface SideLabel {
  /** The metal's symbol, beside its electrode. */
  readonly symbol: string;
  /** The solution: "1.0 M Sn²⁺". */
  readonly solution: string;
  /** Under the beaker: "anode: oxidation", "cathode: reduction" or "no net reaction". */
  readonly role: string;
  /** The half-reaction as it runs there, for one atom or ion. */
  readonly halfReaction: string;
  /** On the electrode: "loses mass", "gains mass", or null when nothing flows. */
  readonly electrode: string | null;
}

function sideLabel(s: GalvanicCellState, side: Side): SideLabel {
  const id = side === 'left' ? s.left : s.right;
  const exponent = side === 'left' ? s.leftExponent : s.rightExponent;
  const metal = METALS[id];
  const base = { symbol: metal.symbol, solution: `${concentrationText(exponent)} ${metal.ion}` };
  const electrons = electronsText(metal.charge);
  if (s.anode === null) {
    return { ...base, role: LABELS.neither, halfReaction: `${metal.ion}(aq) + ${electrons} ⇌ ${metal.symbol}(s)`, electrode: null };
  }
  if (s.anode === side) {
    return { ...base, role: LABELS.anode, halfReaction: `${metal.symbol}(s) → ${metal.ion}(aq) + ${electrons}`, electrode: LABELS.losesMass };
  }
  return { ...base, role: LABELS.cathode, halfReaction: metal.halfReaction, electrode: LABELS.gainsMass };
}

/** The labels of each half-cell in the drawing. */
export function sideLabels(s: GalvanicCellState): { readonly left: SideLabel; readonly right: SideLabel } {
  return { left: sideLabel(s, 'left'), right: sideLabel(s, 'right') };
}

/** The meter's reading: "0.940 V". */
export function meterText(s: GalvanicCellState): string {
  return `${s.eText} V`;
}

/** The label of the gap between the two chosen rungs: "E°cell = 0.94 V", or "E°cell = 0 V" for one metal. */
export function gapText(s: GalvanicCellState): string {
  return s.kind === 'two metals' ? `E°cell = ${hundredthsText(s.standardHundredths)} V` : 'E°cell = 0 V';
}

/** The direction of the electrons and the ions, in words, for every reader. */
export function flowText(s: GalvanicCellState): string {
  if (s.anode === null || s.cathode === null) {
    return 'No electrons flow and no ions move through the salt bridge: neither electrode is an anode or a cathode.';
  }
  const name = (side: Side) => METALS[side === 'left' ? s.left : s.right].name;
  return (
    `Electrons flow through the wire from the ${name(s.anode)} electrode on the ${s.anode}, the anode, ` +
    `to the ${name(s.cathode)} electrode on the ${s.cathode}, the cathode. ` +
    `In the salt bridge, NO₃⁻ ions move toward the ${s.anode} half-cell and K⁺ ions toward the ${s.cathode} half-cell.`
  );
}

/** The cell drawing in words, for its accessible name. */
export function describeCell(s: GalvanicCellState): string {
  const l = METALS[s.left];
  const r = METALS[s.right];
  const opening =
    `A galvanic cell at 25 °C. On the left, a ${l.name} electrode stands in ${concentrationText(s.leftExponent)} ${l.ion}; ` +
    `on the right, a ${r.name} electrode stands in ${concentrationText(s.rightExponent)} ${r.ion}. ` +
    `A wire joins the electrodes through a meter reading ${meterText(s)}, and a salt bridge of potassium nitrate joins the solutions. `;
  if (s.anode === null || s.cathode === null) {
    return `${opening}Both half-cells are the same, so neither is an anode or a cathode: no electrons flow, and no arrows are drawn.`;
  }
  const labels = sideLabels(s);
  const anode = labels[s.anode];
  const cathode = labels[s.cathode];
  return (
    opening +
    `The ${s.anode} half-cell is the anode: oxidation, ${anode.halfReaction}, and its electrode loses mass. ` +
    `The ${s.cathode} half-cell is the cathode: reduction, ${cathode.halfReaction}, and its electrode gains mass. ` +
    `An arrow on the wire shows electrons moving from the ${s.anode} electrode to the ${s.cathode} one. ` +
    `In the salt bridge, an arrow shows NO₃⁻ moving toward the ${s.anode} half-cell and another K⁺ moving toward the ${s.cathode} half-cell.`
  );
}

/** The ladder and the Q line in words, for their accessible name. */
export function describeScales(s: GalvanicCellState): string {
  const top = METAL_IDS[0];
  const bottom = METAL_IDS[METAL_IDS.length - 1];
  if (top === undefined || bottom === undefined) throw new Error('The ladder has no rungs.');
  const rung = (id: MetalId) => {
    const metal = METALS[id];
    return `${metal.ion}/${metal.symbol}, ${metal.hundredths > 0 ? '+' : ''}${hundredthsText(metal.hundredths)} V`;
  };
  let marked: string;
  if (s.left === s.right) {
    marked = `The rung for ${METALS[s.left].name} is marked: both half-cells are ${METALS[s.left].name}, so E°cell = 0 V.`;
  } else {
    // In the ladder's order, top first, so that trading the sides changes nothing here.
    const [higher, lower] = METALS[s.left].hundredths > METALS[s.right].hundredths ? [s.left, s.right] : [s.right, s.left];
    marked = `The rungs for ${METALS[higher].name} and ${METALS[lower].name} are marked, and the gap between them, E°cell, is ${hundredthsText(s.standardHundredths)} V.`;
  }
  return (
    `A ladder of the six standard reduction potentials, from ${rung(top)}, at the top to ${rung(bottom)}, at the bottom. ${marked} ` +
    `Under it, a line for Q on a scale of powers of ten from ${qTickText(Q_AXIS.min)} to ${qTickText(Q_AXIS.max)}, with a mark at Q = 1, where E = E°. ` +
    `A marker stands at Q = ${s.qText}.`
  );
}
