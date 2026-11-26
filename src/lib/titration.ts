/**
 * Titrating 20.0 mL of a 0.150 M acid with 0.200 M sodium hydroxide, for the
 * titration diagram in lesson 4.6. No DOM here, so it is testable directly.
 *
 * Amounts are kept in whole micromoles, so that every number shown is exact
 * and the numbers a student reads agree with each other. The slider moves in
 * steps of 0.5 mL, which is 100 micromoles of OH⁻, so every amount here is a
 * whole multiple of 100.
 *
 * What is plotted is the acidic protons still to be neutralized. Each OH⁻
 * removes one acidic proton, completely, from the first drop to the last, so
 * that quantity falls in a straight line to zero for either acid. For tartaric
 * acid it is the honest quantity to plot: at 15.0 mL most of its molecules
 * have lost one proton, some none and some both, so "moles of acid left" would
 * mean nothing. No pH and no titration curve are shown: they belong to
 * topic 8.5.
 */

export const ACIDS = {
  lactic: { name: 'lactic acid', protons: 1, label: 'Lactic acid (gives up one proton)' },
  tartaric: { name: 'tartaric acid', protons: 2, label: 'Tartaric acid (gives up two)' },
} as const;

export type AcidId = keyof typeof ACIDS;

const isAcidId = (key: string): key is AcidId => Object.hasOwn(ACIDS, key);

/** The acids by id, in the order the diagram offers them: read from ACIDS, so the two cannot drift apart. */
export const ACID_IDS: readonly AcidId[] = Object.keys(ACIDS).filter(isAcidId);

/** The flask: 20.0 mL of 0.150 M acid is 3.00 mmol of acid, in micromoles. */
export const FLASK = { volumeMl: 20, acidMicromoles: 3000 } as const;

/** 0.200 M sodium hydroxide: 0.200 mmol of OH⁻ in each mL, in micromoles. */
export const BASE_MICROMOLES_PER_ML = 200;

/** The slider, in mL of base added. */
export const VOLUME = { min: 0, max: 40, step: 0.5, start: 10 } as const;

/**
 * The graph's axes: the volume axis is the slider's range, and the amount
 * axis reaches the 6.00 mmol of acidic protons in tartaric acid.
 */
export const AXES = { volumeMax: VOLUME.max, micromolesMax: 6000 } as const;

export const MICROMOLES_PER_MILLIMOLE = 1000;
/** Amounts are shown in hundredths of a millimole, which is 10 micromoles. */
const MICROMOLES_PER_HUNDREDTH = 10;

export type Stage = 'before' | 'at' | 'past';
export type FlaskColor = 'yellow' | 'blue';

export interface TitrationState {
  /** OH⁻ added, in micromoles. */
  readonly added: number;
  /** Acidic protons at the start, in micromoles. */
  readonly start: number;
  /** Acidic protons not yet neutralized, in micromoles. */
  readonly protonsLeft: number;
  /** OH⁻ added beyond the acidic protons, in micromoles. */
  readonly excess: number;
  readonly stage: Stage;
  /**
   * The indicator, bromothymol blue, is yellow in the acid and begins to
   * shade toward green a fraction of a mL before the equivalence point
   * (about 0.1 mL for lactic acid, 0.3 mL for tartaric). The slider's step is
   * 0.5 mL, so the drawn flask is yellow before the equivalence point and
   * blue at it and past it.
   */
  readonly flask: FlaskColor;
}

export interface GraphPoint {
  /** In mL. */
  readonly volume: number;
  /** In micromoles. */
  readonly micromoles: number;
}

function assertAcid(acid: string): asserts acid is AcidId {
  if (!Object.hasOwn(ACIDS, acid)) {
    const offered = Object.keys(ACIDS).join(' or ');
    throw new RangeError(`The acid must be ${offered}, not "${acid}".`);
  }
}

function assertVolume(volume: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = volume >= VOLUME.min && volume <= VOLUME.max;
  const onStep = Number.isInteger(volume / VOLUME.step);
  if (!(inRange && onStep)) {
    throw new RangeError(
      `The volume of base must be from ${VOLUME.min} to ${VOLUME.max} mL in steps of ${VOLUME.step} mL, not ${volume} mL.`,
    );
  }
}

const startMicromoles = (acid: AcidId) => FLASK.acidMicromoles * ACIDS[acid].protons;

/** The volume of base, in mL, that neutralizes every acidic proton. */
export function equivalenceVolume(acid: AcidId): number {
  assertAcid(acid);
  return startMicromoles(acid) / BASE_MICROMOLES_PER_ML;
}

/** The amounts after `volume` mL of base have been added to the flask. */
export function state(acid: AcidId, volume: number): TitrationState {
  assertAcid(acid);
  assertVolume(volume);
  const added = BASE_MICROMOLES_PER_ML * volume;
  const start = startMicromoles(acid);
  const stage: Stage = added < start ? 'before' : added === start ? 'at' : 'past';
  return {
    added,
    start,
    protonsLeft: Math.max(start - added, 0),
    excess: Math.max(added - start, 0),
    stage,
    flask: stage === 'before' ? 'yellow' : 'blue',
  };
}

/**
 * The graph's two lines as their end points: the acidic protons left, from
 * the start down to zero at the equivalence point and on along zero; and the
 * OH⁻ in excess, along zero to the equivalence point and then rising.
 */
export function linePoints(acid: AcidId): {
  readonly protonsLeft: readonly [GraphPoint, GraphPoint, GraphPoint];
  readonly excess: readonly [GraphPoint, GraphPoint, GraphPoint];
} {
  const equivalence = equivalenceVolume(acid);
  const atEnd = state(acid, VOLUME.max);
  return {
    protonsLeft: [
      { volume: VOLUME.min, micromoles: startMicromoles(acid) },
      { volume: equivalence, micromoles: 0 },
      { volume: VOLUME.max, micromoles: 0 },
    ],
    excess: [
      { volume: VOLUME.min, micromoles: 0 },
      { volume: equivalence, micromoles: 0 },
      { volume: VOLUME.max, micromoles: atEnd.excess },
    ],
  };
}

/** An amount in millimoles with two decimal places: 600 micromoles is "0.60". */
export function shown(micromoles: number): string {
  if (!(Number.isInteger(micromoles) && micromoles >= 0 && micromoles % MICROMOLES_PER_HUNDREDTH === 0)) {
    throw new RangeError(
      `An amount to show must be a whole number of micromoles, not below 0 and a multiple of ${MICROMOLES_PER_HUNDREDTH}, not ${micromoles}.`,
    );
  }
  // Integer arithmetic throughout: no floating point to round a tie the wrong way.
  const hundredths = micromoles / MICROMOLES_PER_HUNDREDTH;
  const whole = Math.floor(micromoles / MICROMOLES_PER_MILLIMOLE);
  const fraction = hundredths - whole * (MICROMOLES_PER_MILLIMOLE / MICROMOLES_PER_HUNDREDTH);
  return `${whole}.${String(fraction).padStart(2, '0')}`;
}

/** A volume in mL with one decimal place: "12.0". */
export function shownVolume(volume: number): string {
  assertVolume(volume);
  return volume.toFixed(1);
}

/** The slider's spoken value: "12.0 mL". */
export function volumeText(volume: number): string {
  return `${shownVolume(volume)} mL`;
}

/** What the diagram says about the chosen acid and volume. */
export function readout(acid: AcidId, volume: number): string {
  const { added, start, protonsLeft, excess, stage } = state(acid, volume);
  if (volume === 0) {
    const origin = ACIDS[acid].protons === 1 ? '' : ', two from each molecule of acid';
    return `No base added yet: ${shown(start)} mmol of acidic protons to neutralize${origin}. The flask is yellow.`;
  }
  const volumeMl = shownVolume(volume);
  switch (stage) {
    case 'before':
      return (
        `${volumeMl} mL of base added: ${shown(added)} mmol of OH⁻ have neutralized ${shown(added)} mmol of acidic protons, ` +
        `and ${shown(protonsLeft)} mmol are left. The flask is still yellow.`
      );
    case 'at':
      return (
        `${volumeMl} mL added: ${shown(added)} mmol of OH⁻ have neutralized all ${shown(start)} mmol of acidic protons. ` +
        'This is the equivalence point. The indicator has turned blue: that is the endpoint.'
      );
    case 'past':
      return `${volumeMl} mL added: every acidic proton is gone, and ${shown(excess)} mmol of OH⁻ is in excess. The flask is blue.`;
    default:
      return assertNever(stage);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled stage: ${JSON.stringify(value)}`);
}

/** The flask in words, for its accessible name. */
export function describeFlask(acid: AcidId, volume: number): string {
  const { flask } = state(acid, volume);
  const added = volume === 0 ? 'No base has been added.' : `${shownVolume(volume)} mL of base has been added.`;
  return `A flask of ${ACIDS[acid].name} solution under the tip of a buret. The liquid is ${flask}. ${added}`;
}

/** The graph in words, for its accessible name. */
export function describeGraph(acid: AcidId, volume: number): string {
  const { protonsLeft, excess } = state(acid, volume);
  const { protonsLeft: solid, excess: dashed } = linePoints(acid);
  const equivalence = shownVolume(equivalenceVolume(acid));
  const [first] = solid;
  const [, , last] = dashed;
  return (
    `Graph of amount in millimoles against volume of base added, from ${VOLUME.min} to ${VOLUME.max} mL. ` +
    `A solid line, acidic protons left, falls from ${shown(first.micromoles)} mmol at ${VOLUME.min} mL to ${shown(0)} mmol ` +
    `at the equivalence point, ${equivalence} mL, and stays there. ` +
    `A dashed line, OH⁻ in excess, stays at ${shown(0)} mmol until ${equivalence} mL, then rises to ` +
    `${shown(last.micromoles)} mmol at ${shownVolume(last.volume)} mL. ` +
    'A dotted vertical line marks the equivalence point. ' +
    `A marker at ${shownVolume(volume)} mL shows ${shown(protonsLeft)} mmol of acidic protons left ` +
    `and ${shown(excess)} mmol of OH⁻ in excess.`
  );
}
