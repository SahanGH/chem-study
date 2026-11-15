/**
 * N₂O₄(g) ⇌ 2 NO₂(g) in a closed container, disturbed, for the
 * disturbed-equilibrium diagram in lesson 7.10. No DOM here, so it is
 * testable directly.
 *
 * The reaction starts at equilibrium at a temperature where K = 0.490, with
 * Q = [NO₂]²/[N₂O₄]. Each disturbance changes the concentrations (or K) at one
 * instant, and the mixture then settles on a new equilibrium. The numbers were
 * chosen so that every concentration the diagram shows is an exact decimal:
 * nothing is rounded in silence, and Q worked out from the concentrations a
 * student reads is the Q the diagram prints, to three significant figures
 * (1.1236 prints as 1.12). Concentrations are in mol/L (M).
 */

import { formatQuantity } from './format';

export const K_START = 0.49;
const K_WARM = 0.867;

/** The mixture at equilibrium before any disturbance, in M. */
export const START = { n2o4: 0.0625, no2: 0.175 } as const;

// Every disturbance in one table: the number it changes and the words that
// name it. The ids are read from the table, so a type and a table cannot
// drift apart. A disturbance multiplies both concentrations by
// `concentrationFactor` (a change of volume), then adds `addedN2o4` and
// `addedNo2` (in M), and leaves K at `k`.
export const DISTURBANCES = [
  {
    id: 'add-no2',
    label: 'Add NO₂',
    mark: 'NO₂ added',
    // `action` starts a clause that `readout` finishes ("... raises Q from ..."), so it must read as one.
    action: 'Adding NO₂',
    addedN2o4: 0,
    addedNo2: 0.09,
    concentrationFactor: 1,
    k: K_START,
  },
  {
    id: 'add-n2o4',
    label: 'Add N₂O₄',
    mark: 'N₂O₄ added',
    action: 'Adding N₂O₄',
    addedN2o4: 0.045,
    addedNo2: 0,
    concentrationFactor: 1,
    k: K_START,
  },
  {
    id: 'halve-volume',
    label: 'Halve the volume',
    mark: 'volume halved',
    action: 'Halving the volume doubles both concentrations, which',
    addedN2o4: 0,
    addedNo2: 0,
    concentrationFactor: 2,
    k: K_START,
  },
  {
    id: 'double-volume',
    label: 'Double the volume',
    mark: 'volume doubled',
    action: 'Doubling the volume halves both concentrations, which',
    addedN2o4: 0,
    addedNo2: 0,
    concentrationFactor: 0.5,
    k: K_START,
  },
  {
    // The forward reaction is endothermic, so warming raises K. The
    // concentrations do not change at the instant of warming.
    id: 'warm',
    label: 'Warm the mixture',
    mark: 'warmed',
    action: 'Warming the mixture',
    addedN2o4: 0,
    addedNo2: 0,
    concentrationFactor: 1,
    k: K_WARM,
  },
] as const satisfies readonly {
  id: string;
  label: string;
  mark: string;
  action: string;
  addedN2o4: number;
  addedNo2: number;
  concentrationFactor: number;
  k: number;
}[];

type Disturbance = (typeof DISTURBANCES)[number];
export type DisturbanceId = Disturbance['id'];

export const STARTING_ID = 'add-no2' as const satisfies DisturbanceId;

/**
 * The concentration axis runs to 0.40 M, above the highest value any case
 * reaches (0.350 M, halving the volume). Time is in arbitrary units: the
 * path is illustrative, not a rate.
 */
export const AXES = { concentration: { max: 0.4 }, time: { max: 8, disturbance: 2 } } as const;

interface Mixture {
  /** [N₂O₄], in M. */
  readonly n2o4: number;
  /** [NO₂], in M. */
  readonly no2: number;
}

interface Conditions extends Mixture {
  /** The equilibrium constant that applies to this mixture. */
  readonly k: number;
}

export interface PathPoint extends Mixture {
  readonly time: number;
}

type Direction = 'toward-no2' | 'toward-n2o4';

interface ShiftTable {
  readonly caption: string;
  readonly columns: readonly string[];
  readonly rows: readonly { readonly name: string; readonly cells: readonly string[] }[];
}

/**
 * Two numbers that are meant to be equal are within this of each other, in
 * M for a concentration and relative to K for a quotient. Far above the
 * floating-point noise of the arithmetic here (about 1e-16), far below the
 * gap between any two different values the diagram shows.
 */
const EXACT_TOLERANCE = 1e-9;
/** The path has this many steps across the time axis, so 161 points and one more for the jump. */
const PATH_STEPS = 160;

export function disturbanceFor(id: DisturbanceId): Disturbance {
  const found = DISTURBANCES.find((disturbance) => disturbance.id === id);
  if (found === undefined) {
    const ids = DISTURBANCES.map((disturbance) => disturbance.id);
    throw new RangeError(`The disturbance must be ${ids.slice(0, -1).join(', ')} or ${ids.at(-1)}, not "${id}".`);
  }
  return found;
}

/** The concentrations and K right after the disturbance, before the mixture has moved. */
export function justAfter(id: DisturbanceId): Conditions {
  const disturbance = disturbanceFor(id);
  return {
    n2o4: START.n2o4 * disturbance.concentrationFactor + disturbance.addedN2o4,
    no2: START.no2 * disturbance.concentrationFactor + disturbance.addedNo2,
    k: disturbance.k,
  };
}

/**
 * The new equilibrium. The nitrogen atoms are conserved, so
 * T = 2[N₂O₄] + [NO₂] is the same just after and at the new equilibrium.
 * With [N₂O₄] = [NO₂]²/K at the new K, [NO₂] is the positive root of
 * [NO₂]² + (K/2)[NO₂] − KT/2 = 0, which is K(−1 + √(1 + 8T/K))/4.
 */
export function newEquilibrium(id: DisturbanceId): Conditions {
  const after = justAfter(id);
  const nitrogen = 2 * after.n2o4 + after.no2;
  const no2 = (after.k * (-1 + Math.sqrt(1 + (8 * nitrogen) / after.k))) / 4;
  return { n2o4: (no2 * no2) / after.k, no2, k: after.k };
}

export function reactionQuotient(mixture: Mixture): number {
  if (!(Number.isFinite(mixture.n2o4) && mixture.n2o4 > 0)) {
    throw new RangeError(`[N₂O₄] must be a number above zero, not ${mixture.n2o4} M. Q = [NO₂]²/[N₂O₄] is undefined otherwise.`);
  }
  return (mixture.no2 * mixture.no2) / mixture.n2o4;
}

type Comparison = 'less' | 'equal' | 'greater';

/** Q against K. Equal means equal to within the arithmetic, not to the digits shown. */
function compareToK(quotient: number, k: number): Comparison {
  if (Math.abs(quotient - k) <= EXACT_TOLERANCE * k) return 'equal';
  return quotient < k ? 'less' : 'greater';
}

/** The way the reaction runs just after the disturbance: toward the side Q says has too much. */
export function direction(id: DisturbanceId): Direction {
  const after = justAfter(id);
  const comparison = compareToK(reactionQuotient(after), after.k);
  // None of the five disturbances reaches this. It guards a future edit of the table: a disturbance that leaves Q at K has no direction.
  if (comparison === 'equal') {
    throw new Error(`Expected Q to differ from K just after "${id}", so that the mixture has somewhere to go.`);
  }
  return comparison === 'greater' ? 'toward-n2o4' : 'toward-no2';
}

/**
 * A concentration as a decimal with three significant figures, or four when
 * the exact value needs them ("0.0625", "0.0900", "0.1075"). It refuses a
 * value that needs more: a student must never read a rounded concentration.
 */
export function formatConcentration(value: number): string {
  if (!(Number.isFinite(value) && value >= 0)) {
    throw new RangeError(`The concentration must be a finite number, zero or more, not ${value} M.`);
  }
  for (const figures of [3, 4]) {
    const text = value.toPrecision(figures);
    if (Math.abs(Number(text) - value) <= EXACT_TOLERANCE) return text;
  }
  throw new RangeError(`The concentration ${value} M needs more than four significant figures, so it cannot be shown exactly.`);
}

/** A constant or a quotient to three significant figures. These are rounded, and said to be. */
export function formatConstant(value: number): string {
  if (!(Number.isFinite(value) && value >= 0)) {
    throw new RangeError(`The constant or quotient must be a finite number, zero or more, not ${value}.`);
  }
  return formatQuantity(value, 3);
}

/**
 * The step of a path of `steps` steps across 0 to `max` that a time falls on.
 * The vertical step of the curve is drawn at one of the path's own steps, so a
 * time between two steps would lose it without a sign: it is refused instead.
 */
export function stepAt(time: number, max: number, steps: number): number {
  const step = (time * steps) / max;
  if (!Number.isInteger(step)) {
    throw new RangeError(
      `The disturbance at ${time} must fall exactly on a step of the path (${steps} steps across ${max}), but it falls on step ${step}.`,
    );
  }
  return step;
}

/**
 * The two concentrations from 0 to 8, for drawing: flat at the start until the
 * disturbance at 2, a vertical step at 2 (two points with the same time), then
 * each concentration moves as c_new + (c_after − c_new)e^(−(t − 2)). Both
 * follow the same factor, so the nitrogen atoms stay conserved along the path.
 * The shape is illustrative: it shows the direction of the change, not its
 * true speed.
 */
export function pathPoints(id: DisturbanceId): PathPoint[] {
  const after = justAfter(id);
  const fresh = newEquilibrium(id);
  const { max, disturbance } = AXES.time;
  const disturbanceStep = stepAt(disturbance, max, PATH_STEPS);
  return Array.from({ length: PATH_STEPS + 1 }, (_, step): PathPoint[] => {
    // One division, so each time is the nearest number to its decimal.
    const time = (step * max) / PATH_STEPS;
    if (step < disturbanceStep) return [{ time, ...START }];
    const factor = Math.exp(-(time - disturbance));
    const moved = {
      time,
      n2o4: fresh.n2o4 + (after.n2o4 - fresh.n2o4) * factor,
      no2: fresh.no2 + (after.no2 - fresh.no2) * factor,
    };
    // At the disturbance the curve stands at its start, then steps to the values just after.
    return step === disturbanceStep ? [{ time, ...START }, moved] : [moved];
  }).flat();
}

const COMPARISON_TEXT: Record<Comparison, string> = { less: 'Q < K', equal: 'Q = K', greater: 'Q > K' };
const TABLE_COLUMNS = ['Before', 'Just after', 'New equilibrium'] as const;

/** The table below the graph, every cell as the student reads it. */
export function shiftTable(id: DisturbanceId): ShiftTable {
  const columns: Conditions[] = [{ ...START, k: K_START }, justAfter(id), newEquilibrium(id)];
  return {
    caption: 'Before and after the disturbance. Concentrations in M.',
    columns: TABLE_COLUMNS,
    rows: [
      { name: '[N₂O₄]', cells: columns.map((c) => formatConcentration(c.n2o4)) },
      { name: '[NO₂]', cells: columns.map((c) => formatConcentration(c.no2)) },
      { name: 'Q', cells: columns.map((c) => formatConstant(reactionQuotient(c))) },
      { name: 'K', cells: columns.map((c) => formatConstant(c.k)) },
      { name: 'Compare', cells: columns.map((c) => COMPARISON_TEXT[compareToK(reactionQuotient(c), c.k)]) },
    ],
  };
}

/** What the diagram says about the chosen disturbance. */
export function readout(id: DisturbanceId): string {
  const disturbance = disturbanceFor(id);
  const after = justAfter(id);
  const fresh = newEquilibrium(id);
  const quotientBefore = reactionQuotient(START);
  const quotientAfter = reactionQuotient(after);
  const toward = direction(id) === 'toward-n2o4' ? 'N₂O₄' : 'NO₂';
  const relation = direction(id) === 'toward-n2o4' ? 'greater' : 'less';
  const newMixture = `New equilibrium: [N₂O₄] = ${formatConcentration(fresh.n2o4)} M and [NO₂] = ${formatConcentration(fresh.no2)} M.`;
  // Decided from the table, not from two computed numbers: a disturbance that carries its own K changes K.
  if (disturbance.k !== K_START) {
    return (
      `${disturbance.action} changes K, from ${formatConstant(K_START)} to ${formatConstant(after.k)}. ` +
      `Q is still ${formatConstant(quotientAfter)}, now ${relation} than K, so the reaction runs toward ${toward} until Q equals the new K. ` +
      newMixture
    );
  }
  const verb = quotientAfter > quotientBefore ? 'raises' : 'lowers';
  return (
    `${disturbance.action} ${verb} Q from ${formatConstant(quotientBefore)} to ${formatConstant(quotientAfter)}. ` +
    `Q is now ${relation} than K (${formatConstant(after.k)}), so the reaction runs toward ${toward} until Q equals K again. ` +
    newMixture
  );
}

/** The graph in words, for its accessible name. */
export function describeGraph(id: DisturbanceId): string {
  const disturbance = disturbanceFor(id);
  const after = justAfter(id);
  const fresh = newEquilibrium(id);
  const pair = (mixture: Mixture) =>
    `[N₂O₄] is ${formatConcentration(mixture.n2o4)} M and [NO₂] is ${formatConcentration(mixture.no2)} M`;
  return (
    'Graph of concentration against time for N₂O₄(g) ⇌ 2 NO₂(g). [N₂O₄] is a solid line and [NO₂] a dashed line. ' +
    `Before the disturbance, ${pair(START)}. ` +
    `The dotted line marks the disturbance (${disturbance.mark}). Just after it, ${pair(after)}. ` +
    `At the new equilibrium, ${pair(fresh)}.`
  );
}
