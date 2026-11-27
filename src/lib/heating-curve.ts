/**
 * One mole of ethanol or of iodine, heated at 1 atm from a solid to a gas, for
 * the heating curve explorer in lesson 6.5. No DOM here, so it is testable
 * directly.
 *
 * The arithmetic is exact. Energies are kept in whole centijoules (hundredths
 * of a joule), temperatures in tenths of a degree and heat capacities in
 * tenths of J/(mol·°C). Then warming a phase through ΔT tenths of a degree
 * takes ΔT × C centijoules, a whole number, and on a sloped segment the rise
 * in tenths of a degree is the energy put in, in centijoules, over C. Numbers
 * are rounded only to be shown, half up.
 *
 * Each sloped segment is a straight line, because each heat capacity is held
 * constant over its segment; each flat is as long as the molar enthalpy of
 * its change. The value for solid ethanol's heat capacity is approximate, and
 * the diagram's caption says so.
 */

export interface HeatCapacities {
  readonly solid: number;
  readonly liquid: number;
  readonly gas: number;
}

export interface Substance {
  readonly name: string;
  /** The name at the start of a sentence. */
  readonly title: string;
  /** The radio button's words. */
  readonly label: string;
  /** Temperatures in tenths of a degree Celsius. */
  readonly startTenths: number;
  readonly meltingTenths: number;
  readonly boilingTenths: number;
  /** Molar enthalpies, in joules for one mole. */
  readonly fusionJoules: number;
  readonly vaporizationJoules: number;
  /** Molar heat capacities, in tenths of J/(mol·°C). */
  readonly heatCapacityTenths: HeatCapacities;
}

export const SUBSTANCES = {
  ethanol: {
    name: 'ethanol',
    title: 'Ethanol',
    label: 'Ethanol, C₂H₅OH',
    startTenths: -1500,
    meltingTenths: -1141,
    boilingTenths: 783,
    fusionJoules: 4930,
    vaporizationJoules: 38600,
    heatCapacityTenths: { solid: 700, liquid: 1120, gas: 760 },
  },
  iodine: {
    name: 'iodine',
    title: 'Iodine',
    label: 'Iodine, I₂',
    startTenths: 250,
    meltingTenths: 1137,
    boilingTenths: 1844,
    fusionJoules: 15500,
    vaporizationJoules: 41600,
    heatCapacityTenths: { solid: 544, liquid: 807, gas: 369 },
  },
} as const satisfies Record<string, Substance>;

export type SubstanceId = keyof typeof SUBSTANCES;

const isSubstanceId = (key: string): key is SubstanceId => Object.hasOwn(SUBSTANCES, key);

/** The substances by id, in the order the diagram offers them: read from SUBSTANCES, so the two cannot drift apart. */
export const SUBSTANCE_IDS: readonly SubstanceId[] = Object.keys(SUBSTANCES).filter(isSubstanceId);

export const START_SUBSTANCE: SubstanceId = 'ethanol';

/** The slider, in kJ of energy added. */
export const ENERGY = { min: 0, max: 70, step: 0.5, start: 5 } as const;

export const CENTIJOULES_PER_KILOJOULE = 100_000;
const CENTIJOULES_PER_JOULE = 100;
/** A tenth of a kJ, the unit a segment's energy is shown in. */
const CENTIJOULES_PER_TENTH_KILOJOULE = 10_000;

/**
 * One temperature axis for both substances, so that switching between them
 * shows where each one's flats are: ethanol starts at −150 °C and iodine ends
 * at 248.6 °C.
 */
export const AXES = {
  energyMax: ENERGY.max,
  temperatureMin: -150,
  temperatureMax: 250,
  energyTicks: [0, 10, 20, 30, 40, 50, 60, 70],
  temperatureTicks: [-150, -100, -50, 0, 50, 100, 150, 200, 250],
} as const;

export const SEGMENT_KINDS = ['solid', 'melting', 'liquid', 'boiling', 'gas'] as const;
export type SegmentKind = (typeof SEGMENT_KINDS)[number];
export type Phase = 'solid' | 'liquid' | 'gas';

export interface Segment {
  readonly kind: SegmentKind;
  /** The energy added at its start and its end, in centijoules. The gas segment ends at the end of the slider. */
  readonly startCentijoules: number;
  readonly endCentijoules: number;
  /** Its temperatures, in tenths of a degree; the gas segment's end is exact, not rounded. */
  readonly startTenths: number;
  readonly endTenths: number;
}

export interface CurvePoint {
  /** In kJ. */
  readonly energy: number;
  /** In °C. */
  readonly temperature: number;
}

export interface PhaseCounts {
  readonly solid: number;
  readonly liquid: number;
  readonly gas: number;
}

export interface HeatingState {
  readonly substance: SubstanceId;
  /** The energy added, in centijoules. */
  readonly energyCentijoules: number;
  /** The segment it falls in: 0 to 4. */
  readonly segment: number;
  readonly kind: SegmentKind;
  /** The temperature shown, in tenths of a degree, rounded half up. */
  readonly temperatureTenths: number;
  /** The exact temperature in °C, to place the marker on the line. */
  readonly temperature: number;
  /** On a flat, the percent that has changed phase, held between 1 and 99; null on a slope. */
  readonly percent: number | null;
  /** The molecules drawn in the box, in each phase. */
  readonly counts: PhaseCounts;
}

function assertSubstance(id: string): asserts id is SubstanceId {
  if (!isSubstanceId(id)) {
    const offered = Object.keys(SUBSTANCES).join(' or ');
    throw new RangeError(`The substance must be ${offered}, not "${id}".`);
  }
}

function assertEnergy(energy: number): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = energy >= ENERGY.min && energy <= ENERGY.max;
  const onStep = Number.isInteger(energy / ENERGY.step);
  if (!(inRange && onStep)) {
    throw new RangeError(
      `The energy added must be from ${ENERGY.min} to ${ENERGY.max} kJ in steps of ${ENERGY.step} kJ, not ${energy} kJ.`,
    );
  }
}

/** A whole number over a positive whole number, rounded half up. */
const roundHalfUp = (numerator: number, denominator: number) => Math.floor((2 * numerator + denominator) / (2 * denominator));

const SLIDER_END = ENERGY.max * CENTIJOULES_PER_KILOJOULE;

/** The five segments of a substance's curve, from 0 kJ to the end of the slider. */
export function segments(id: SubstanceId): readonly Segment[] {
  assertSubstance(id);
  const s: Substance = SUBSTANCES[id];
  const c = s.heatCapacityTenths;
  const solidEnd = (s.meltingTenths - s.startTenths) * c.solid;
  const meltedEnd = solidEnd + s.fusionJoules * CENTIJOULES_PER_JOULE;
  const liquidEnd = meltedEnd + (s.boilingTenths - s.meltingTenths) * c.liquid;
  const boiledEnd = liquidEnd + s.vaporizationJoules * CENTIJOULES_PER_JOULE;
  return [
    { kind: 'solid', startCentijoules: 0, endCentijoules: solidEnd, startTenths: s.startTenths, endTenths: s.meltingTenths },
    { kind: 'melting', startCentijoules: solidEnd, endCentijoules: meltedEnd, startTenths: s.meltingTenths, endTenths: s.meltingTenths },
    { kind: 'liquid', startCentijoules: meltedEnd, endCentijoules: liquidEnd, startTenths: s.meltingTenths, endTenths: s.boilingTenths },
    { kind: 'boiling', startCentijoules: liquidEnd, endCentijoules: boiledEnd, startTenths: s.boilingTenths, endTenths: s.boilingTenths },
    {
      kind: 'gas',
      startCentijoules: boiledEnd,
      endCentijoules: SLIDER_END,
      startTenths: s.boilingTenths,
      endTenths: s.boilingTenths + (SLIDER_END - boiledEnd) / c.gas,
    },
  ];
}

const isFlat = (kind: SegmentKind): kind is 'melting' | 'boiling' => kind === 'melting' || kind === 'boiling';

/** The energy a segment takes, in kJ to one decimal, rounded half up: "21.5". The gas segment's runs to the end of the slider. */
export function segmentEnergy(id: SubstanceId, index: number): string {
  const segment = segments(id)[index];
  if (!segment || !Number.isInteger(index)) {
    throw new RangeError(`A segment is numbered from 0 to 4, not ${index}.`);
  }
  const tenths = roundHalfUp(segment.endCentijoules - segment.startCentijoules, CENTIJOULES_PER_TENTH_KILOJOULE);
  return `${Math.floor(tenths / 10)}.${tenths % 10}`;
}

/** How steeply a phase's line climbs, in °C for each kJ: 1000 over its molar heat capacity. */
export function slope(id: SubstanceId, phase: Phase): number {
  assertSubstance(id);
  return 10_000 / SUBSTANCES[id].heatCapacityTenths[phase];
}

/** The six corners of the curve, in kJ and °C: the ends of its five segments. */
export function curvePoints(id: SubstanceId): readonly CurvePoint[] {
  const all = segments(id);
  const first = all[0];
  if (!first) throw new Error('A curve has five segments.');
  const point = (centijoules: number, tenths: number): CurvePoint => ({
    energy: centijoules / CENTIJOULES_PER_KILOJOULE,
    temperature: tenths / 10,
  });
  return [point(first.startCentijoules, first.startTenths), ...all.map((segment) => point(segment.endCentijoules, segment.endTenths))];
}

/** The number of molecules drawn in the box. */
const MOLECULES = 20;

/**
 * Where the energy falls. A sloped segment holds both its ends, so that at an
 * energy exactly between two segments the state is a single phase at the
 * melting or boiling point; a flat holds only what lies strictly inside it.
 * No slider position but 0 falls on a boundary.
 */
function segmentAt(all: readonly Segment[], energyCentijoules: number): number {
  const index = all.findIndex((segment) =>
    isFlat(segment.kind) ? energyCentijoules < segment.endCentijoules : energyCentijoules <= segment.endCentijoules,
  );
  return index === -1 ? all.length - 1 : index;
}

/** What is in the sample after `energy` kJ have been added to one mole of the solid. */
export function state(id: SubstanceId, energy: number): HeatingState {
  assertSubstance(id);
  assertEnergy(energy);
  const s: Substance = SUBSTANCES[id];
  const all = segments(id);
  // Each step of the slider is 0.5 kJ, 50,000 centijoules: a whole number of steps keeps this whole.
  const energyCentijoules = (energy / ENERGY.step) * (ENERGY.step * CENTIJOULES_PER_KILOJOULE);
  const index = segmentAt(all, energyCentijoules);
  const segment = all[index];
  if (!segment) throw new Error('Every energy falls in a segment.');
  const into = energyCentijoules - segment.startCentijoules;
  const { kind } = segment;

  if (isFlat(kind)) {
    const length = segment.endCentijoules - segment.startCentijoules;
    const percent = Math.min(99, Math.max(1, roundHalfUp(100 * into, length)));
    // The molecules that have changed phase, in proportion to the percent shown, with at least one of each phase.
    const changed = Math.min(MOLECULES - 1, Math.max(1, roundHalfUp(percent * MOLECULES, 100)));
    const counts =
      kind === 'melting'
        ? { solid: MOLECULES - changed, liquid: changed, gas: 0 }
        : { solid: 0, liquid: MOLECULES - changed, gas: changed };
    return {
      substance: id,
      energyCentijoules,
      segment: index,
      kind,
      temperatureTenths: segment.startTenths,
      temperature: segment.startTenths / 10,
      percent,
      counts,
    };
  }

  const c = s.heatCapacityTenths[kind];
  return {
    substance: id,
    energyCentijoules,
    segment: index,
    kind,
    temperatureTenths: segment.startTenths + roundHalfUp(into, c),
    temperature: (segment.startTenths + into / c) / 10,
    percent: null,
    counts: { solid: 0, liquid: 0, gas: 0, [kind]: MOLECULES },
  };
}

/** A temperature in °C with one decimal place and a true minus sign: −734 tenths is "−73.4". */
export function shownTemperature(tenths: number): string {
  if (!Number.isInteger(tenths)) {
    throw new RangeError(`A temperature to show must be a whole number of tenths of a degree, not ${tenths}.`);
  }
  const size = Math.abs(tenths);
  const sign = tenths < 0 ? '−' : '';
  return `${sign}${Math.floor(size / 10)}.${size % 10}`;
}

/** An energy in kJ with one decimal place: "12.0". */
export function shownEnergy(energy: number): string {
  assertEnergy(energy);
  return energy.toFixed(1);
}

/** The slider's spoken value: "12.0 kJ". */
export function energyText(energy: number): string {
  return `${shownEnergy(energy)} kJ`;
}

const PHASE_OF_FLAT = { melting: 'liquid', boiling: 'gas' } as const;

/** The phase or phases present, as a sentence opens: "Liquid ethanol", "Ethanol gas", "Ethanol melting". */
function present(substance: Substance, kind: SegmentKind): string {
  switch (kind) {
    case 'solid':
      return `Solid ${substance.name}`;
    case 'liquid':
      return `Liquid ${substance.name}`;
    case 'gas':
      return `${substance.title} gas`;
    case 'melting':
    case 'boiling':
      return `${substance.title} ${kind}`;
    default:
      return assertNever(kind);
  }
}

/** What the diagram says about the chosen substance and energy. */
export function readout(id: SubstanceId, energy: number): string {
  const now = state(id, energy);
  const substance: Substance = SUBSTANCES[id];
  const at = `${present(substance, now.kind)} at ${shownTemperature(now.temperatureTenths)} °C`;
  const takes = segmentEnergy(id, now.segment);
  if (isFlat(now.kind)) {
    return (
      `${at}: ${now.percent} percent is ${PHASE_OF_FLAT[now.kind]}. ` +
      'The energy going in is separating molecules, not speeding them up, so the temperature holds. ' +
      `This segment takes ${takes} kJ.`
    );
  }
  const segmentSentence =
    now.kind === 'gas' ? `Up to the end of the slider, this segment takes ${takes} kJ.` : `This segment takes ${takes} kJ.`;
  return `${at}. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. ${segmentSentence}`;
}

function assertNever(value: never): never {
  throw new Error(`Unhandled segment: ${JSON.stringify(value)}`);
}

/** An energy in kJ, at one decimal, rounded half up from centijoules. */
const kilojoulesText = (centijoules: number) => {
  const tenths = roundHalfUp(centijoules, CENTIJOULES_PER_TENTH_KILOJOULE);
  return `${Math.floor(tenths / 10)}.${tenths % 10}`;
};

const WHERE_ON_GRAPH: Record<SegmentKind, string> = {
  solid: 'on the slope of the solid',
  melting: 'on the melting flat',
  liquid: 'on the slope of the liquid',
  boiling: 'on the boiling flat',
  gas: 'on the slope of the gas',
};

/** A whole number with a true minus sign, for the axes: "−150". */
export const shownWhole = (value: number) => (value < 0 ? `−${-value}` : `${value}`);

/** The graph in words, for its accessible name. */
export function describeGraph(id: SubstanceId, energy: number): string {
  const now = state(id, energy);
  const [solid, melting, liquid, boiling, gas] = segments(id);
  if (!solid || !melting || !liquid || !boiling || !gas) throw new Error('A curve has five segments.');
  const end = state(id, ENERGY.max);
  const t = (tenths: number) => `${shownTemperature(tenths)} °C`;
  return (
    `Graph of temperature, from ${shownWhole(AXES.temperatureMin)} to ${shownWhole(AXES.temperatureMax)} °C, against energy added, ` +
    `from ${ENERGY.min} to ${ENERGY.max} kJ, for one mole of ${SUBSTANCES[id].name}. ` +
    `The line rises from ${t(solid.startTenths)} at 0 kJ to the melting point, ${t(solid.endTenths)}, ` +
    `at ${kilojoulesText(solid.endCentijoules)} kJ; runs flat for ${segmentEnergy(id, 1)} kJ while the solid melts; ` +
    `rises to the boiling point, ${t(liquid.endTenths)}, at ${kilojoulesText(liquid.endCentijoules)} kJ; ` +
    `runs flat for ${segmentEnergy(id, 3)} kJ while the liquid boils; ` +
    `and rises to ${t(end.temperatureTenths)} at ${shownEnergy(ENERGY.max)} kJ. ` +
    'Dashed lines mark the melting point and the boiling point. ' +
    `A marker at ${shownEnergy(energy)} kJ is ${WHERE_ON_GRAPH[now.kind]}, at ${t(now.temperatureTenths)}.`
  );
}

/** The box in words, for its accessible name. */
export function describeBox(id: SubstanceId, energy: number): string {
  const { kind, counts } = state(id, energy);
  const opening = `A box of ${MOLECULES} molecules of ${SUBSTANCES[id].name}`;
  switch (kind) {
    case 'solid':
      return `${opening}, in fixed rows: a solid.`;
    case 'liquid':
      return `${opening}, touching but out of order: a liquid.`;
    case 'gas':
      return `${opening}, far apart: a gas.`;
    case 'melting':
      return (
        `${opening}: ${counts.solid} still in the fixed rows of the solid, ` +
        `and ${counts.liquid} in the liquid, touching but out of order.`
      );
    case 'boiling':
      return (
        `${opening}: ${counts.liquid} in the liquid, touching but out of order, ` +
        `and ${counts.gas} far apart in the gas.`
      );
    default:
      return assertNever(kind);
  }
}

/** The box, in its own drawing units: 20 molecules, each a circle of radius 7. */
export const BOX = { width: 192, height: 120, radius: 7, count: MOLECULES } as const;

type Spot = readonly [number, number];

/**
 * Where the molecules sit in the box, by phase, in the order they are used.
 * The solid is five columns of four touching molecules at the left, used
 * column by column from the left, so that while it melts what is left is one
 * piece. The liquid is a cluster on the floor in which every molecule touches
 * another and the rows are broken, used from the right wall leftward, so that
 * it never reaches what is left of the solid. The gas is spread through the
 * box, at least four radii apart, used from the top down, so that while the
 * liquid boils each gas molecule is well clear of the liquid left. Unit tests
 * check all three at every split.
 */
export const LAYOUT: { readonly solid: readonly Spot[]; readonly liquid: readonly Spot[]; readonly gas: readonly Spot[] } = {
  solid: [
    [13, 109], [13, 95], [13, 81], [13, 67],
    [27, 109], [27, 95], [27, 81], [27, 67],
    [41, 109], [41, 95], [41, 81], [41, 67],
    [55, 109], [55, 95], [55, 81], [55, 67],
    [69, 109], [69, 95], [69, 81], [69, 67],
  ],
  liquid: [
    [180, 109], [178.4, 84], [172.9, 96.9], [165.9, 109], [164.5, 85.8],
    [157.4, 97.8], [148.9, 109], [140, 98.2], [131, 109], [123.6, 97.2],
    [116.1, 109], [106.8, 98.5], [97.5, 109], [90.5, 96.9], [83.5, 109],
    [76.5, 96.9], [69.5, 109], [55.5, 109], [41.5, 109], [27.5, 109],
  ],
  gas: [
    [119.6, 12.1], [32.6, 12.4], [179.9, 14.8], [76.8, 51.4], [71.7, 12.1],
    [144.4, 66.1], [13, 68.5], [149.2, 12.6], [96.1, 29.5], [96.4, 107],
    [13.8, 36.3], [177.2, 51.1], [47.1, 39.2], [134.5, 36.9], [53.4, 91.4],
    [110.7, 60.2], [146.6, 107.1], [85.6, 78.9], [173.8, 81.4], [18.7, 106.9],
  ],
};

export interface PlacedMolecule {
  readonly phase: Phase;
  readonly x: number;
  readonly y: number;
}

/** The molecules to draw in the box: the solid's, then the liquid's, then the gas's. */
export function particles(id: SubstanceId, energy: number): readonly PlacedMolecule[] {
  const { counts } = state(id, energy);
  const phases: readonly Phase[] = ['solid', 'liquid', 'gas'];
  return phases.flatMap((phase) => LAYOUT[phase].slice(0, counts[phase]).map(([x, y]) => ({ phase, x, y })));
}
