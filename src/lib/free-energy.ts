/**
 * The free-energy explorer of lesson 9.3: ΔG° = ΔH° − TΔS° for four real
 * reactions, one for each combination of signs of ΔH° and ΔS°, over a slider
 * of temperature. No DOM here, so it is testable directly.
 *
 * The arithmetic is exact. ΔH° is kept in whole joules, ΔS° in whole tenths of
 * a joule per kelvin and T in whole kelvins, so every term is a whole number
 * of tenths of a joule:
 * - the enthalpy term is 10 × ΔH°;
 * - the entropy term, −TΔS°, is −T × ΔS° in tenths;
 * - ΔG° is their sum.
 * Only the shown numbers are rounded, each from its own exact value, half up
 * to 0.1 kJ (a tie goes to the more positive number). Every ΔH° is a whole
 * number of tenths of a kilojoule, so with that rule the shown ΔH° plus the
 * shown −TΔS° is always the shown ΔG°; `state` checks it and throws if it
 * ever were not. The verdict comes from the sign of the exact ΔG°.
 */

export type ReactionId = 'nitrous-oxide' | 'ozone' | 'methane-steam' | 'methanol';

/** The choice control, in the brief's order. */
export const REACTION_IDS: readonly ReactionId[] = ['nitrous-oxide', 'ozone', 'methane-steam', 'methanol'];

export interface Reaction {
  readonly id: ReactionId;
  /** The name on the control, and at the start of the readout. */
  readonly label: string;
  /** The name inside a sentence. */
  readonly name: string;
  readonly equation: string;
  /** ΔH° for one mole of reaction, in whole joules. */
  readonly enthalpyJ: number;
  /** ΔS° for one mole of reaction, in whole tenths of a joule per kelvin. */
  readonly entropyTenths: number;
}

/** From the unit's table of enthalpies of formation and standard entropies at 25 °C, products minus reactants. */
export const REACTIONS: Readonly<Record<ReactionId, Reaction>> = {
  'nitrous-oxide': {
    id: 'nitrous-oxide',
    label: 'Nitrous oxide breaking down',
    name: 'nitrous oxide breaking down',
    equation: '2N₂O(g) → 2N₂(g) + O₂(g)',
    enthalpyJ: -164_100,
    entropyTenths: 1_484,
  },
  ozone: {
    id: 'ozone',
    label: 'Ozone forming',
    name: 'ozone forming',
    equation: '3O₂(g) → 2O₃(g)',
    enthalpyJ: 285_400,
    entropyTenths: -1_378,
  },
  'methane-steam': {
    id: 'methane-steam',
    label: 'Methane with steam',
    name: 'methane with steam',
    equation: 'CH₄(g) + H₂O(g) → CO(g) + 3H₂(g)',
    enthalpyJ: 205_900,
    entropyTenths: 2_147,
  },
  methanol: {
    id: 'methanol',
    label: 'Methanol from carbon monoxide',
    name: 'methanol from carbon monoxide',
    equation: 'CO(g) + 2H₂(g) → CH₃OH(g)',
    enthalpyJ: -90_500,
    entropyTenths: -2_192,
  },
};

/** The temperature slider, in kelvins. */
export const TEMPERATURE = { min: 200, max: 1400, step: 25 } as const;
export const TEMPERATURES: readonly number[] = Array.from(
  { length: (TEMPERATURE.max - TEMPERATURE.min) / TEMPERATURE.step + 1 },
  (_, i) => TEMPERATURE.min + i * TEMPERATURE.step,
);

export const START = { reaction: 'methane-steam', temperature: 300 } as const satisfies { reaction: ReactionId; temperature: number };

/** The graph's axes, and the bars' vertical scale, which is the same. */
export const AXES = {
  temperatureMin: TEMPERATURE.min,
  temperatureMax: TEMPERATURE.max,
  temperatureTicks: [200, 400, 600, 800, 1000, 1200, 1400],
  energyMin: -400,
  energyMax: 500,
  energyTicks: [-400, -200, 0, 200, 400],
} as const;

/** The words drawn in the diagram, its key and its controls. */
export const LABELS = {
  favored: 'favored',
  slider: 'Temperature',
  choice: 'Reaction',
  temperatureAxis: 'temperature (K)',
  energyAxis: 'ΔG° (kJ/mol)',
  bars: 'ΔG° = ΔH° − TΔS°, in kJ/mol',
  enthalpyBar: 'ΔH°',
  entropyBar: '−TΔS°',
  freeBar: 'ΔG°',
  otherLines: 'the other three reactions',
} as const;

const MINUS = '−';
/** Tenths of a joule in 0.1 kJ, the unit every number is shown in. */
const PER_SHOWN_TENTH = 1000;
/** Tenths of a joule in 1 kJ. */
const PER_KJ = 10_000;

function reactionOf(id: ReactionId): Reaction {
  // Own properties only: "toString" or "__proto__" must not pass for a reaction.
  if (typeof id !== 'string' || !Object.prototype.hasOwnProperty.call(REACTIONS, id)) {
    throw new RangeError(`There is no reaction "${String(id)}"; the reactions are ${REACTION_IDS.join(', ')}.`);
  }
  return REACTIONS[id];
}

function assertTemperature(temperature: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = temperature >= TEMPERATURE.min && temperature <= TEMPERATURE.max;
  if (!(inRange && Number.isInteger((temperature - TEMPERATURE.min) / TEMPERATURE.step))) {
    throw new RangeError(
      `The temperature must be from ${TEMPERATURE.min} K to ${TEMPERATURE.max} K in steps of ${TEMPERATURE.step} K, not ${temperature} K.`,
    );
  }
}

/** A whole number with a thousands comma: 1400 is "1,400". */
function withCommas(whole: number): string {
  return String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Whole tenths of a kilojoule, from whole tenths of a joule: half up, a tie to the more positive number. */
function roundedTenthsOfKJ(tenthsOfJ: number): number {
  return Math.floor((tenthsOfJ + PER_SHOWN_TENTH / 2) / PER_SHOWN_TENTH);
}

/** Whole tenths of a kilojoule as shown: "+205.9", "−64.4", "0.0". */
function tenthsOfKJText(tenths: number): string {
  if (tenths === 0) return '0.0';
  const size = Math.abs(tenths);
  return `${tenths > 0 ? '+' : MINUS}${withCommas(Math.floor(size / 10))}.${size % 10}`;
}

/** An exact amount in whole tenths of a joule, shown to 0.1 kJ with its sign. */
export function shownKJ(tenthsOfJ: number): string {
  if (!Number.isSafeInteger(tenthsOfJ)) throw new RangeError(`An amount to show must be a whole number of tenths of a joule, not ${tenthsOfJ}.`);
  return tenthsOfKJText(roundedTenthsOfKJ(tenthsOfJ));
}

/** The slider's shown value: "300 K", "1,400 K". */
export function temperatureText(temperature: number): string {
  assertTemperature(temperature);
  return `${withCommas(temperature)} K`;
}

/** The slider's spoken value: "300 kelvins". */
export function temperatureValueText(temperature: number): string {
  assertTemperature(temperature);
  return `${withCommas(temperature)} kelvins`;
}

export type Verdict = 'favored' | 'unfavored' | 'neither';

function verdictOf(freeTenths: number): Verdict {
  if (Number.isNaN(freeTenths)) throw new RangeError(`A verdict needs a number for ΔG°, not ${freeTenths}.`);
  if (freeTenths < 0) return 'favored';
  return freeTenths > 0 ? 'unfavored' : 'neither';
}

/**
 * The verdict sentence, from the sign of the exact ΔG°. No stop of the slider
 * has ΔG° exactly zero (a unit test proves it), but if one did the sentence
 * would say so rather than call it favored or unfavored.
 */
export function verdictSentence(freeTenths: number): string {
  const verdict = verdictOf(freeTenths);
  if (verdict === 'neither') return 'ΔG° is zero at this temperature: neither direction is thermodynamically favored.';
  return `Thermodynamically ${verdict} at this temperature.`;
}

export interface FreeEnergyState {
  readonly reaction: ReactionId;
  readonly temperature: number;
  /** Exact, in whole tenths of a joule for one mole of reaction. */
  readonly enthalpy: number;
  readonly entropy: number;
  readonly free: number;
  /** As shown, to 0.1 kJ. */
  readonly enthalpyText: string;
  readonly entropyText: string;
  readonly freeText: string;
  /** The exact ΔG° in kJ, for the marker's height. */
  readonly freeKJ: number;
  readonly verdict: Verdict;
  readonly favored: boolean;
}

export function state(id: ReactionId, temperature: number): FreeEnergyState {
  const reaction = reactionOf(id);
  assertTemperature(temperature);
  const enthalpy = 10 * reaction.enthalpyJ;
  const entropy = -temperature * reaction.entropyTenths;
  const free = enthalpy + entropy;
  const [h, s, g] = [enthalpy, entropy, free].map(roundedTenthsOfKJ) as [number, number, number];
  // Each shown number comes from its own exact value. With these reactions the three always add
  // up as shown; if a change to the data ever broke that, the readout would print a sum a student
  // could check and find wrong, so it is an error, not a drawing.
  if (h + s !== g) {
    throw new Error(`${reaction.label} at ${temperature} K: the shown terms ${tenthsOfKJText(h)} and ${tenthsOfKJText(s)} do not add to the shown ${tenthsOfKJText(g)}.`);
  }
  const verdict = verdictOf(free);
  return {
    reaction: id,
    temperature,
    enthalpy,
    entropy,
    free,
    enthalpyText: tenthsOfKJText(h),
    entropyText: tenthsOfKJText(s),
    freeText: tenthsOfKJText(g),
    freeKJ: free / PER_KJ,
    verdict,
    favored: verdict === 'favored',
  };
}

export interface ZeroTemperature {
  /** ΔH° / ΔS°, in kelvins, unrounded. */
  readonly exact: number;
  /** To the nearest kelvin, half up. */
  readonly shown: number;
}

/** The temperature of ΔG° = 0, which exists only where ΔH° and ΔS° have the same sign. */
export function zeroTemperature(id: ReactionId): ZeroTemperature | null {
  const { enthalpyJ, entropyTenths } = reactionOf(id);
  if (enthalpyJ === 0 || entropyTenths === 0 || Math.sign(enthalpyJ) !== Math.sign(entropyTenths)) return null;
  const numerator = Math.abs(10 * enthalpyJ);
  const denominator = Math.abs(entropyTenths);
  return { exact: numerator / denominator, shown: Math.floor((2 * numerator + denominator) / (2 * denominator)) };
}

/** The value written on the guide at the temperature of ΔG° = 0: "959 K"; null where there is none. */
export function zeroTemperatureText(id: ReactionId): string | null {
  const zero = zeroTemperature(id);
  return zero ? `${withCommas(zero.shown)} K` : null;
}

/** The last sentence of the readout: over which temperatures ΔG° is negative. */
export function favoredRange(id: ReactionId): string {
  const { enthalpyJ, entropyTenths } = reactionOf(id);
  const zero = zeroTemperature(id);
  if (zero) return `ΔG° is negative ${entropyTenths > 0 ? 'above' : 'below'} ${zeroTemperatureText(id)}.`;
  if (enthalpyJ < 0 && entropyTenths > 0) return 'With these values, ΔG° is negative at every temperature.';
  if (enthalpyJ > 0 && entropyTenths < 0) return 'With these values, ΔG° is positive at every temperature.';
  throw new RangeError(`${REACTIONS[id].label} has a ΔH° or a ΔS° of zero, which this explorer does not show.`);
}

/** What the diagram says, for the status line. */
export function readout(id: ReactionId, temperature: number): string {
  const reaction = reactionOf(id);
  const s = state(id, temperature);
  return (
    `${reaction.label} at ${temperatureText(temperature)}: ΔH° = ${s.enthalpyText} kJ/mol, ${LABELS.entropyBar} = ${s.entropyText} kJ/mol, ` +
    `so ΔG° = ${s.freeText} kJ/mol. ${verdictSentence(s.free)} ${favoredRange(id)}`
  );
}

export interface LinePoint {
  readonly temperature: number;
  /** ΔG° in kJ, exact to the tenth of a joule. */
  readonly kJ: number;
}

/** A reaction's line on the graph: straight, between its values at the two ends of the axis. */
export function linePoints(id: ReactionId): readonly LinePoint[] {
  reactionOf(id);
  return [AXES.temperatureMin, AXES.temperatureMax].map((temperature) => ({ temperature, kJ: state(id, temperature).freeKJ }));
}

export interface BarRow {
  readonly id: 'enthalpy' | 'entropy' | 'free';
  readonly name: string;
  /** Exact, in kJ, for the bar's length. */
  readonly kJ: number;
  /** As shown. */
  readonly text: string;
}

/** The three bars: ΔH°, −TΔS° and their sum, ΔG°. */
export function bars(id: ReactionId, temperature: number): readonly BarRow[] {
  const s = state(id, temperature);
  return [
    { id: 'enthalpy', name: LABELS.enthalpyBar, kJ: s.enthalpy / PER_KJ, text: s.enthalpyText },
    { id: 'entropy', name: LABELS.entropyBar, kJ: s.entropy / PER_KJ, text: s.entropyText },
    { id: 'free', name: LABELS.freeBar, kJ: s.free / PER_KJ, text: s.freeText },
  ];
}

/** An axis value as drawn: "−400", "0", "+200". */
export function energyTickText(kJ: number): string {
  if (!Number.isInteger(kJ)) throw new RangeError(`An axis value must be a whole number of kJ, not ${kJ}.`);
  if (kJ === 0) return '0';
  return `${kJ > 0 ? '+' : MINUS}${withCommas(Math.abs(kJ))}`;
}

/** A temperature on the axis: "200", "1,400". */
export function temperatureTickText(kelvins: number): string {
  if (!Number.isInteger(kelvins)) throw new RangeError(`An axis temperature must be a whole number of kelvins, not ${kelvins}.`);
  return withCommas(kelvins);
}

/** The graph in words, for its accessible name. */
export function describeGraph(id: ReactionId, temperature: number): string {
  const reaction = reactionOf(id);
  const s = state(id, temperature);
  const start = state(id, AXES.temperatureMin);
  const end = state(id, AXES.temperatureMax);
  const zero = zeroTemperature(id);
  const course = zero
    ? `crosses zero at ${zeroTemperatureText(id)}`
    : `stays ${start.free < 0 ? 'below' : 'above'} zero`;
  return (
    `Graph of ΔG° against temperature, from ${temperatureText(AXES.temperatureMin)} to ${temperatureText(AXES.temperatureMax)}, ` +
    `on a scale from ${energyTickText(AXES.energyMin)} to ${energyTickText(AXES.energyMax)} kJ/mol. The region below zero is hatched and labeled ${LABELS.favored}. ` +
    `The line of ${reaction.name} is drawn heavy and the other three faint and dashed. ` +
    `It runs from ${start.freeText} kJ/mol at ${temperatureText(AXES.temperatureMin)} to ${end.freeText} kJ/mol at ${temperatureText(AXES.temperatureMax)} and ${course}. ` +
    `A marker at ${temperatureText(temperature)} is on it at ${s.freeText} kJ/mol.`
  );
}

/** The bars in words, for their accessible name. */
export function describeBars(id: ReactionId, temperature: number): string {
  const rows = bars(id, temperature);
  return `Three bars in kJ/mol, rising or falling from a zero line: ${rows.map((r) => `${r.name}, ${r.text}`).join('; ')}.`;
}
