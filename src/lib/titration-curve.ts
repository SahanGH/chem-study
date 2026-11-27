/**
 * The titration-curve explorer of lessons 8.5 and 8.7: 20.0 mL of a 0.150 M
 * acid, lactic acid (weak) or hydrobromic acid (strong), titrated with
 * 0.200 M sodium hydroxide. It is the flask of lesson 4.6's diagram
 * (`titration.ts`, which this module reads and does not change). No DOM
 * here, so it is testable directly.
 *
 * Amounts are kept in whole micromoles, as in `titration.ts`: the slider
 * moves in steps of 0.5 mL, which is 100 micromoles of OH⁻, so every amount
 * at a setting is exact. Volumes are in mL and are turned into microliters
 * by multiplying by 1,000; between settings (the curve's points every 0.01
 * mL) a volume is a float, so these microliters are floats too, which
 * changes no pH by as much as 1e-11. The amounts are divided only to form
 * the concentrations the shared solver (`acid-base.ts`) takes, and micromoles
 * over microliters is moles per liter. The solver finds [H₃O⁺] from the one
 * charge balance, water's own ions included, so no stretch of the curve has a
 * formula of its own and there is no seam at the equivalence point.
 *
 * Each shown number is rounded half up from its own unrounded value: a pH to
 * two decimal places, a volume where an indicator changes to 0.01 mL.
 */

import { hydronium } from './acid-base';
import { BASE_MICROMOLES_PER_ML, FLASK, shown } from './titration';

/** Lactic acid's pKa. Its Ka is computed from it, 10^−3.86 exactly; no rounded Ka is held. */
export const LACTIC_PKA = 3.86;
export const LACTIC_KA = 10 ** -LACTIC_PKA;

export interface Acid {
  /** The name in a sentence. */
  readonly name: string;
  /** The radio button's words. */
  readonly label: string;
  readonly strong: boolean;
}

export const ACIDS = {
  lactic: { name: 'lactic acid', label: 'Lactic acid (weak)', strong: false },
  hydrobromic: { name: 'hydrobromic acid', label: 'Hydrobromic acid (strong)', strong: true },
} as const satisfies Record<string, Acid>;

export type AcidId = keyof typeof ACIDS;

const isAcidId = (key: string): key is AcidId => Object.hasOwn(ACIDS, key);

/** The acids by id, in the order the diagram offers them: read from ACIDS, so the two cannot drift apart. */
export const ACID_IDS: readonly AcidId[] = Object.keys(ACIDS).filter(isAcidId);

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

/** One color change of an indicator: below `low` the acid color, from `low` to `high` (both included) the changing color, above `high` the base color. */
export interface Change {
  readonly low: number;
  readonly high: number;
  readonly acidColor: Color;
  readonly changingColor: Color;
  readonly baseColor: Color;
}

export interface Indicator {
  /** The name in a sentence. */
  readonly name: string;
  /** The name at the start of a sentence, and the radio button's words. */
  readonly label: string;
  /** Its changes, from low pH to high. The last is the one drawn as a band and timed on the curve. */
  readonly changes: readonly Change[];
}

export const INDICATORS = {
  bromocresolGreen: {
    name: 'bromocresol green',
    label: 'Bromocresol green',
    changes: [{ low: 3.8, high: 5.4, acidColor: 'yellow', changingColor: 'green', baseColor: 'blue' }],
  },
  bromothymolBlue: {
    name: 'bromothymol blue',
    label: 'Bromothymol blue',
    changes: [{ low: 6.0, high: 7.6, acidColor: 'yellow', changingColor: 'green', baseColor: 'blue' }],
  },
  thymolBlue: {
    name: 'thymol blue',
    label: 'Thymol blue',
    // The first change is not drawn, but without it the readout would call thymol blue
    // yellow in hydrobromic acid at pH 0.82, where it is red.
    changes: [
      { low: 1.2, high: 2.8, acidColor: 'red', changingColor: 'orange', baseColor: 'yellow' },
      { low: 8.0, high: 9.6, acidColor: 'yellow', changingColor: 'green', baseColor: 'blue' },
    ],
  },
} as const satisfies Record<string, Indicator>;

export type IndicatorId = keyof typeof INDICATORS;
export type IndicatorChoice = 'none' | IndicatorId;

const isIndicatorId = (key: string): key is IndicatorId => Object.hasOwn(INDICATORS, key);

/** The choices of indicator, in the order the diagram offers them. */
export const INDICATOR_CHOICES: readonly IndicatorChoice[] = ['none', ...Object.keys(INDICATORS).filter(isIndicatorId)];

/** The radio buttons' words. */
export const INDICATOR_LABELS: Readonly<Record<IndicatorChoice, string>> = {
  none: 'None',
  bromocresolGreen: INDICATORS.bromocresolGreen.label,
  bromothymolBlue: INDICATORS.bromothymolBlue.label,
  thymolBlue: INDICATORS.thymolBlue.label,
};

/** The volume of base, in mL, that neutralizes the acid, and half of it. */
export const EQUIVALENCE_ML = FLASK.acidMicromoles / BASE_MICROMOLES_PER_ML;
export const HALF_EQUIVALENCE_ML = EQUIVALENCE_ML / 2;

const MICROLITERS_PER_ML = 1000;

/** The slider, in mL of base added. */
export const VOLUME = { min: 0, max: 30, step: 0.5 } as const;

/** The slider's 61 settings. */
export const VOLUMES: readonly number[] = Array.from({ length: (VOLUME.max - VOLUME.min) / VOLUME.step + 1 }, (_, i) => VOLUME.min + i * VOLUME.step);

export const START: { readonly acid: AcidId; readonly volume: number; readonly indicator: IndicatorChoice } = {
  acid: 'lactic',
  volume: 0,
  indicator: 'none',
};

/** The graph's axes. */
export const AXES = {
  pHMax: 14,
  pHTicks: [0, 2, 4, 6, 8, 10, 12, 14],
  volumeMax: VOLUME.max,
  volumeTicks: [0, 5, 10, 15, 20, 25, 30],
} as const;

/** The words drawn in the graph and over the bars. */
export const LABELS = {
  pHAxis: 'pH',
  volumeAxis: 'NaOH added (mL)',
  equivalence: 'equivalence point',
  half: 'half-equivalence point',
  bars: 'What is in the flask',
} as const;

/** Whole hundredths of a mL, for a volume shown to 0.01 mL. */
function hundredthsText(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  return `${whole}.${String(hundredths - 100 * whole).padStart(2, '0')}`;
}

/** A pH to two decimal places, rounded half up. A value that rounds to zero is "0.00", never "−0.00". */
export function shownPH(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`A pH to show must be a finite number, not ${value}.`);
  const hundredths = Math.floor(value * 100 + 0.5);
  if (hundredths < 0) return `−${hundredthsText(-hundredths)}`;
  return hundredthsText(hundredths);
}

/** A volume to 0.01 mL, rounded half up: "14.58". */
export function shownVolume(value: number): string {
  if (!(Number.isFinite(value) && value >= 0)) throw new RangeError(`A volume to show must be a finite number, 0 or more, not ${value}.`);
  return hundredthsText(Math.floor(value * 100 + 0.5));
}

/** The buffer region marked on the lactic acid curve: where the two forms stand at 1 to 10 and at 10 to 1. */
export const BUFFER_REGION = {
  from: EQUIVALENCE_ML / 11,
  to: (10 * EQUIVALENCE_ML) / 11,
  fromText: shownVolume(EQUIVALENCE_ML / 11),
  toText: shownVolume((10 * EQUIVALENCE_ML) / 11),
} as const;

function assertAcid(id: string): asserts id is AcidId {
  if (!isAcidId(id)) throw new RangeError(`The acid must be ${ACID_IDS.join(' or ')}, not "${id}".`);
}

function assertIndicator(id: string): asserts id is IndicatorId {
  if (!isIndicatorId(id)) {
    throw new RangeError(`The indicator must be ${Object.keys(INDICATORS).join(', ')}, not "${id}".`);
  }
}

function assertChoice(id: string): asserts id is IndicatorChoice {
  if (id !== 'none') assertIndicator(id);
}

function assertSetting(volume: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = volume >= VOLUME.min && volume <= VOLUME.max;
  if (!(inRange && Number.isInteger(volume / VOLUME.step))) {
    throw new RangeError(`The volume of base must be from ${VOLUME.min} to ${VOLUME.max} mL in steps of ${VOLUME.step} mL, not ${volume} mL.`);
  }
}

/**
 * [H₃O⁺] after `volume` mL of base, from the solver. The concentrations are
 * the amounts in micromoles over the total volume in microliters (the
 * volumes are taken to add): the acid in all its forms, C, which for
 * hydrobromic acid is [Br⁻], and the Na⁺ that came with the OH⁻.
 */
function hydroniumAt(acid: AcidId, volume: number): number {
  const microliters = FLASK.volumeMl * MICROLITERS_PER_ML + MICROLITERS_PER_ML * volume;
  const c = FLASK.acidMicromoles / microliters;
  const sodium = (BASE_MICROMOLES_PER_ML * volume) / microliters;
  return ACIDS[acid].strong ? hydronium({ cations: sodium, anions: c }) : hydronium({ weakAcid: c, ka: LACTIC_KA, cations: sodium });
}

/** The pH at any volume of base from 0 to 30 mL, not only at a setting of the slider. */
export function pHAt(acid: AcidId, volume: number): number {
  assertAcid(acid);
  if (!(volume >= VOLUME.min && volume <= VOLUME.max)) {
    throw new RangeError(`The volume of base must be from ${VOLUME.min} to ${VOLUME.max} mL, not ${volume} mL.`);
  }
  return -Math.log10(hydroniumAt(acid, volume));
}

/**
 * The stretch of the curve a state is on. For lactic acid, "early" when ten
 * times the lactate is less than the acid and "late" when ten times the acid
 * is less than the lactate, on the whole micromoles; "buffer" between.
 */
export type Kind = 'start' | 'early' | 'buffer' | 'half' | 'late' | 'before' | 'equivalence' | 'past';

export interface TitrationCurveState {
  readonly acid: AcidId;
  readonly volume: number;
  /** In micromoles: OH⁻ added, the acid not yet reacted, the acid reacted (lactate formed, or H₃O⁺ neutralized), the OH⁻ in excess. */
  readonly added: number;
  readonly acidLeft: number;
  readonly reacted: number;
  readonly excess: number;
  /** 20.0 mL plus the base added, in microliters. */
  readonly totalMicroliters: number;
  /** From the full equilibrium, unrounded. */
  readonly hydronium: number;
  readonly pH: number;
  readonly kind: Kind;
  /** As shown. */
  readonly pHText: string;
  readonly acidLeftText: string;
  readonly reactedText: string;
  readonly excessText: string;
}

function kindOf(acid: AcidId, acidLeft: number, reacted: number, excess: number): Kind {
  if (reacted === 0) return 'start';
  if (excess > 0) return 'past';
  if (acidLeft === 0) return 'equivalence';
  if (ACIDS[acid].strong) return 'before';
  if (acidLeft === reacted) return 'half';
  if (10 * reacted < acidLeft) return 'early';
  if (10 * acidLeft < reacted) return 'late';
  return 'buffer';
}

/** The flask after `volume` mL of base, its reaction with the acid gone to completion. */
export function state(acid: AcidId, volume: number): TitrationCurveState {
  assertAcid(acid);
  assertSetting(volume);
  const added = BASE_MICROMOLES_PER_ML * volume;
  const acidLeft = Math.max(FLASK.acidMicromoles - added, 0);
  const reacted = Math.min(added, FLASK.acidMicromoles);
  const excess = Math.max(added - FLASK.acidMicromoles, 0);
  const totalMicroliters = FLASK.volumeMl * MICROLITERS_PER_ML + MICROLITERS_PER_ML * volume;
  const h = hydroniumAt(acid, volume);
  const pH = -Math.log10(h);
  return {
    acid,
    volume,
    added,
    acidLeft,
    reacted,
    excess,
    totalMicroliters,
    hydronium: h,
    pH,
    kind: kindOf(acid, acidLeft, reacted, excess),
    pHText: shownPH(pH),
    acidLeftText: shown(acidLeft),
    reactedText: shown(reacted),
    excessText: shown(excess),
  };
}

/** The slider's shown value: "7.5 mL". */
export function volumeText(volume: number): string {
  assertSetting(volume);
  return `${volume.toFixed(1)} mL`;
}

/** The slider's spoken value: "7.5 milliliters of sodium hydroxide added". */
export function volumeValueText(volume: number): string {
  assertSetting(volume);
  return `${volume.toFixed(1)} milliliters of sodium hydroxide added`;
}

export interface IndicatorColor {
  readonly color: Color;
  /** The two colors it is partway between, or null when it shows a plain color. */
  readonly changing: { readonly from: Color; readonly to: Color } | null;
}

/** An indicator's color at a pH, from the unrounded pH. Both ends of a range belong to the range. */
export function indicatorColor(indicator: IndicatorId, pH: number): IndicatorColor {
  assertIndicator(indicator);
  const changes: readonly Change[] = INDICATORS[indicator].changes;
  for (const change of changes) {
    if (pH < change.low) return { color: change.acidColor, changing: null };
    if (pH <= change.high) return { color: change.changingColor, changing: { from: change.acidColor, to: change.baseColor } };
  }
  const last = changes.at(-1);
  if (!last) throw new Error('An indicator has a change.');
  return { color: last.baseColor, changing: null };
}

export interface Band {
  readonly low: number;
  readonly high: number;
  readonly below: Color;
  readonly above: Color;
  /** True for thymol blue, whose band is its second change. */
  readonly second: boolean;
}

/** The range drawn as a hatched band, and timed on the curve: the indicator's last change. */
export function band(indicator: IndicatorId): Band {
  assertIndicator(indicator);
  const changes: readonly Change[] = INDICATORS[indicator].changes;
  const last = changes.at(-1);
  if (!last) throw new Error('An indicator has a change.');
  return { low: last.low, high: last.high, below: last.acidColor, above: last.baseColor, second: changes.length > 1 };
}

/** The bisection on the volume: a fixed number of halvings of 0 to 30 mL, far finer than 0.001 mL. */
const VOLUME_HALVINGS = 50;

/** The volume at which a curve's pH equals `target`, by bisection on the volume as a continuous quantity. */
function volumeAtPH(acid: AcidId, target: number): number {
  let low: number = VOLUME.min;
  let high: number = VOLUME.max;
  if (!(pHAt(acid, low) < target && pHAt(acid, high) > target)) {
    throw new RangeError(`The ${ACIDS[acid].name} curve does not pass pH ${target} between ${low} and ${high} mL.`);
  }
  for (let step = 0; step < VOLUME_HALVINGS; step++) {
    const mid = (low + high) / 2;
    if (pHAt(acid, mid) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export interface ChangeVolumes {
  readonly low: number;
  readonly high: number;
  readonly lowText: string;
  readonly highText: string;
}

const crossings = new Map<string, ChangeVolumes>();

/** The two volumes between which the indicator's drawn range is crossed on this curve, unrounded and to 0.01 mL. */
export function changeVolumes(acid: AcidId, indicator: IndicatorId): ChangeVolumes {
  assertAcid(acid);
  assertIndicator(indicator);
  const key = `${acid} ${indicator}`;
  const known = crossings.get(key);
  if (known) return known;
  const range = band(indicator);
  const low = volumeAtPH(acid, range.low);
  const high = volumeAtPH(acid, range.high);
  const found = { low, high, lowText: shownVolume(low), highText: shownVolume(high) };
  crossings.set(key, found);
  return found;
}

/** The sentence about the indicator, or '' when none is chosen. */
export function indicatorSentence(acid: AcidId, volume: number, indicator: IndicatorChoice): string {
  assertChoice(indicator);
  const s = state(acid, volume);
  if (indicator === 'none') return '';
  const { label } = INDICATORS[indicator];
  const { color, changing } = indicatorColor(indicator, s.pH);
  const here = changing ? `${label} is ${color} here, partway from ${changing.from} to ${changing.to}.` : `${label} is ${color} here.`;
  const v = changeVolumes(acid, indicator);
  const range = band(indicator);
  const when = v.lowText === v.highText ? `within 0.01 mL of ${v.lowText} mL` : `between ${v.lowText} mL and ${v.highText} mL`;
  const timing = range.second
    ? `On this curve its second change, from ${range.below} to ${range.above}, comes ${when}.`
    : `On this curve its color changes ${when}.`;
  return `${here} ${timing}`;
}

function mainSentence(s: TitrationCurveState): string {
  const pH = s.pHText;
  switch (s.kind) {
    case 'start':
      return ACIDS[s.acid].strong
        ? `No base yet. The flask holds ${s.acidLeftText} mmol of H₃O⁺ from hydrobromic acid, a strong acid. pH ${pH}.`
        : `No base yet. The flask holds ${s.acidLeftText} mmol of lactic acid, a weak acid, and nothing else that matters. pH ${pH}.`;
    case 'early':
      return `${s.acidLeftText} mmol of lactic acid and ${s.reactedText} mmol of lactate ion. The acid still outweighs the lactate by more than ten to one. pH ${pH}.`;
    case 'buffer':
      return `Buffer region: ${s.acidLeftText} mmol of lactic acid and ${s.reactedText} mmol of lactate ion, both members of the pair. pH ${pH}.`;
    case 'half':
      return `Half-equivalence point: ${s.acidLeftText} mmol of lactic acid and ${s.reactedText} mmol of lactate ion. Equal amounts, so pH = pKa = ${shownPH(LACTIC_PKA)}.`;
    case 'late':
      return `${s.acidLeftText} mmol of lactic acid and ${s.reactedText} mmol of lactate ion. The lactate now outweighs the acid by more than ten to one. pH ${pH}.`;
    case 'before':
      return `${s.acidLeftText} mmol of H₃O⁺ is left, and it sets the pH: ${pH}.`;
    case 'equivalence':
      return ACIDS[s.acid].strong
        ? `Equivalence point: neither H₃O⁺ nor OH⁻ is left over. The flask holds Na⁺, Br⁻ and water. pH ${pH} at 25 °C.`
        : `Equivalence point: all ${s.reactedText} mmol of the acid has reacted. The flask holds lactate ion alone, a weak base, so the pH is above 7: ${pH}.`;
    case 'past':
      return `Past the equivalence point: ${s.excessText} mmol of OH⁻ is left over, and it sets the pH: ${pH}.`;
    default:
      return assertNever(s.kind);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled kind: ${JSON.stringify(value)}`);
}

/** What the diagram says: the stretch of the curve and what sets the pH there, then the indicator, if one is chosen. */
export function readout(acid: AcidId, volume: number, indicator: IndicatorChoice): string {
  assertChoice(indicator);
  const main = mainSentence(state(acid, volume));
  const extra = indicatorSentence(acid, volume, indicator);
  return extra ? `${main} ${extra}` : main;
}

export interface CurvePoint {
  /** In mL. */
  readonly volume: number;
  readonly pH: number;
}

/** The curve's volumes in hundredths of a mL: every 0.1 mL from 0 to 30, and every 0.01 mL from 14.5 to 15.5. */
const CURVE_HUNDREDTHS: readonly number[] = [
  ...new Set([...Array.from({ length: 301 }, (_, k) => 10 * k), ...Array.from({ length: 101 }, (_, k) => 1450 + k)]),
].sort((a, b) => a - b);

/** One acid's curve: the same function at every point, so the slider's settings are among its vertices. */
export function curve(acid: AcidId): readonly CurvePoint[] {
  assertAcid(acid);
  return CURVE_HUNDREDTHS.map((h) => {
    const volume = h / 100;
    return { volume, pH: pHAt(acid, volume) };
  });
}

/** The buffer region along the lactic acid curve: its two ends and the curve's points between them. */
export function bufferMark(): readonly CurvePoint[] {
  const at = (volume: number): CurvePoint => ({ volume, pH: pHAt('lactic', volume) });
  const inside = curve('lactic').filter((p) => p.volume > BUFFER_REGION.from && p.volume < BUFFER_REGION.to);
  return [at(BUFFER_REGION.from), ...inside, at(BUFFER_REGION.to)];
}

export interface BarRow {
  readonly id: 'acid' | 'base' | 'excess';
  readonly name: string;
  readonly micromoles: number;
  readonly text: string;
}

/** A full bar is the acid in the flask, 3.00 mmol; no amount is larger. */
export const BAR_MAX_MICROMOLES = FLASK.acidMicromoles;

/** The bars of "What is in the flask": three for lactic acid; for hydrobromic acid two, and the spectators named in the middle place. */
export function bars(acid: AcidId, volume: number): { readonly rows: readonly BarRow[]; readonly spectators: string | null } {
  const s = state(acid, volume);
  const row = (id: BarRow['id'], name: string, micromoles: number): BarRow => ({ id, name, micromoles, text: `${shown(micromoles)} mmol` });
  if (ACIDS[acid].strong) {
    return {
      rows: [row('acid', 'H₃O⁺ left', s.acidLeft), row('excess', 'OH⁻ left over', s.excess)],
      spectators: 'Br⁻ and Na⁺ are spectators',
    };
  }
  return {
    rows: [row('acid', 'Lactic acid left', s.acidLeft), row('base', 'Lactate ion formed', s.reacted), row('excess', 'OH⁻ left over', s.excess)],
    spectators: null,
  };
}

/** The bars in words, for their accessible name. */
export function describeBars(acid: AcidId, volume: number): string {
  const { rows, spectators } = bars(acid, volume);
  // A name that starts with a word is lowercased in the sentence; one that starts with a formula ("OH⁻", "H₃O⁺") is not.
  const inSentence = (name: string) => (/^[A-Z][a-z]/.test(name) ? `${name.charAt(0).toLowerCase()}${name.slice(1)}` : name);
  const fixed = rows.map((r) => `${inSentence(r.name)}, ${shown(r.micromoles)}`).join('; ');
  const tail = spectators ? ` ${spectators} and have no bar.` : '';
  return `Bars of what is in the flask, in millimoles, after the base added has reacted completely: ${fixed}.${tail}`;
}

const other = (acid: AcidId): AcidId => (acid === 'lactic' ? 'hydrobromic' : 'lactic');

/** The graph in words, for its accessible name. */
export function describeGraph(acid: AcidId, volume: number, indicator: IndicatorChoice): string {
  assertChoice(indicator);
  const now = state(acid, volume);
  const end = (id: AcidId) => state(id, VOLUME.max).pHText;
  const eq = (id: AcidId) => state(id, EQUIVALENCE_ML).pHText;
  const begin = (id: AcidId) => state(id, VOLUME.min).pHText;
  const eqText = volumeText(EQUIVALENCE_ML);
  const after = volumeText(EQUIVALENCE_ML + VOLUME.step);
  const o = other(acid);
  const chosen = ACIDS[acid].strong
    ? `It starts at pH ${begin(acid)}, rises slowly, then steeply to ${eq(acid)} at the equivalence point, ${eqText}, and ends at ${end(acid)} at ${volumeText(VOLUME.max)}.`
    : `It starts at pH ${begin(acid)}, rises slowly through the buffer region, marked along the curve from ${BUFFER_REGION.fromText} mL to ${BUFFER_REGION.toText} mL, ` +
      `passes pH ${state(acid, HALF_EQUIVALENCE_ML).pHText} at the half-equivalence point, ${volumeText(HALF_EQUIVALENCE_ML)}, ` +
      `rises steeply to ${eq(acid)} at the equivalence point, ${eqText}, and ends at ${end(acid)} at ${volumeText(VOLUME.max)}.`;
  const faint = `It starts at pH ${begin(o)}, rises steeply to ${eq(o)} at ${eqText}, and from ${after} on lies on the curve of ${ACIDS[acid].name}.`;
  const guides = ACIDS[acid].strong
    ? 'A dotted line marks the equivalence point.'
    : 'Dotted lines mark the equivalence point and the half-equivalence point.';
  let bandText = '';
  if (indicator !== 'none') {
    const b = band(indicator);
    const what = b.second ? `${INDICATORS[indicator].name} makes its second change` : `${INDICATORS[indicator].name} changes color`;
    bandText = ` A hatched band lies across the graph from pH ${b.low.toFixed(1)} to ${b.high.toFixed(1)}, where ${what}: ${b.below} below, ${b.above} above.`;
  }
  return (
    `Graph of pH, from 0 to ${AXES.pHMax}, against sodium hydroxide added, from ${VOLUME.min} to ${VOLUME.max} mL. ` +
    `The curve of ${ACIDS[acid].name} is drawn heavy. ${chosen} ` +
    `The curve of ${ACIDS[o].name} is drawn faint and dashed. ${faint} ` +
    `${guides}${bandText} ` +
    `A marker at ${volumeText(volume)} is on the curve of ${ACIDS[acid].name}, at pH ${now.pHText}.`
  );
}

export interface KeyItem {
  readonly kind: 'chosen' | 'other' | 'buffer' | 'band';
  readonly text: string;
}

/** The key under the graph: the two curves, the buffer region for lactic acid, and the chosen indicator's band. */
export function keyItems(acid: AcidId, indicator: IndicatorChoice): readonly KeyItem[] {
  assertAcid(acid);
  assertChoice(indicator);
  const items: KeyItem[] = [
    { kind: 'chosen', text: ACIDS[acid].name },
    { kind: 'other', text: ACIDS[other(acid)].name },
  ];
  if (!ACIDS[acid].strong) items.push({ kind: 'buffer', text: `buffer region, ${BUFFER_REGION.fromText} to ${BUFFER_REGION.toText} mL` });
  if (indicator !== 'none') {
    const b = band(indicator);
    const range = `pH ${b.low.toFixed(1)} to ${b.high.toFixed(1)}`;
    items.push({ kind: 'band', text: b.second ? `${INDICATORS[indicator].name}’s second change, ${range}` : `${INDICATORS[indicator].name} changes, ${range}` });
  }
  return items;
}
