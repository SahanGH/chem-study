/**
 * Nitrogen monoxide and fluorine combining into nitrosyl fluoride,
 * 2 NO + F₂ → 2 NOF, for the limiting reactant diagram in lesson 4.5. No DOM
 * here, so it is testable directly.
 *
 * Everything is a whole number of molecules. Nitrogen monoxide goes in by
 * twos, so that it can always react completely: with 2 NO per F₂ in the
 * equation, an odd number would always strand one molecule whatever the
 * amount of fluorine, and the diagram would show a leftover that is not about
 * the ratio at all.
 *
 * The diagram leaves out that nitrosyl fluoride can react further with
 * fluorine to a small extent, and says so in its caption.
 */

/** The three kinds of particle a box holds. */
export type Particle = 'NO' | 'F2' | 'NOF';

/** Which reactant, for the two controls. */
export type Reactant = 'no' | 'f2';

/** Which of the two boxes. */
export type BoxName = 'before' | 'after';

/** The two reactants' ranges: both start at none, and NO goes by twos. */
export const RANGE = {
  no: { min: 0, max: 10, step: 2 },
  f2: { min: 0, max: 5, step: 1 },
} as const;

/** The starting state: fluorine runs out first. */
export const START = { no: 6, f2: 2 } as const;

/** Particles sit on a fixed grid, so a box holds at most 15. */
export const GRID = { columns: 5, rows: 3 } as const;

/** The most particles a box can show. */
const BOX_CAPACITY = GRID.columns * GRID.rows;

/** How many NO react with each F₂, from the equation. */
const NO_PER_F2 = 2;

/** The typographic minus sign, which lines up with the digits; a hyphen does not. */
const MINUS = '−';

const REACTANT_NAMES: Record<Reactant, { readonly plain: string; readonly formula: string }> = {
  no: { plain: 'nitrogen monoxide', formula: 'NO' },
  f2: { plain: 'fluorine', formula: 'F₂' },
};

/** The two boxes, in drawing order. */
export const BOXES = [
  { name: 'before', title: 'Before' },
  { name: 'after', title: 'After' },
] as const satisfies readonly { name: BoxName; title: string }[];

/** The atoms the key names. */
export const ATOMS = [
  { element: 'N', name: 'nitrogen' },
  { element: 'O', name: 'oxygen' },
  { element: 'F', name: 'fluorine' },
] as const;

// F₂ is "fluorine molecule" here, so that the key's two rows, "F fluorine" for
// the atom and this one, differ in words as well as in the drawing.
/** The molecules the key names, which are also the table's columns. */
export const MOLECULES = [
  { kind: 'NO', formula: 'NO', name: 'nitrogen monoxide' },
  { kind: 'F2', formula: 'F₂', name: 'fluorine molecule' },
  { kind: 'NOF', formula: 'NOF', name: 'nitrosyl fluoride' },
] as const satisfies readonly { kind: Particle; formula: string; name: string }[];

/** A slider's name: "Nitrogen monoxide, NO". */
export function controlLabel(reactant: Reactant): string {
  const { plain, formula } = REACTANT_NAMES[reactant];
  return `${plain.charAt(0).toUpperCase()}${plain.slice(1)}, ${formula}`;
}

export type Limiting = 'no' | 'f2' | 'neither' | 'none';

export interface Outcome {
  /** How many times the reaction happens. */
  readonly events: number;
  /** Molecules of NOF formed. */
  readonly nof: number;
  readonly noLeft: number;
  readonly f2Left: number;
  /**
   * The reactant that runs out first. 'neither' when both are used up
   * exactly, and 'none' when one of them is absent, so that nothing reacts.
   */
  readonly limiting: Limiting;
}

export interface TableRow {
  readonly name: 'Before' | 'Change' | 'After';
  readonly no: string;
  readonly f2: string;
  readonly nof: string;
}

function assertAmount(value: number, reactant: Reactant): void {
  const { min, max, step } = RANGE[reactant];
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = value >= min && value <= max;
  const onStep = Number.isInteger((value - min) / step);
  if (!(inRange && onStep)) {
    throw new RangeError(
      `The number of ${REACTANT_NAMES[reactant].formula} molecules must be a whole number from ${min} to ${max} ` +
        `in steps of ${step}, not ${value}.`,
    );
  }
}

function assertAmounts(no: number, f2: number): void {
  assertAmount(no, 'no');
  assertAmount(f2, 'f2');
}

function limitingReactant(no: number, f2: number, events: number): Limiting {
  if (no === 0 || f2 === 0) return 'none';
  if (no === NO_PER_F2 * f2) return 'neither';
  // The reaction happens as many times as the smaller of no / 2 and f2, so
  // `events` equals f2 exactly when the F₂ is the one that ran out.
  return events === f2 ? 'f2' : 'no';
}

/** What happens when `no` molecules of NO meet `f2` molecules of F₂. */
export function outcome(no: number, f2: number): Outcome {
  assertAmounts(no, f2);
  const events = Math.min(no / NO_PER_F2, f2);
  return {
    events,
    nof: NO_PER_F2 * events,
    noLeft: no - NO_PER_F2 * events,
    f2Left: f2 - events,
    limiting: limitingReactant(no, f2, events),
  };
}

/** A change in an amount, with a true minus sign or a plus sign; none is a plain 0. */
function signed(amount: number): string {
  if (amount === 0) return '0';
  return amount < 0 ? `${MINUS}${-amount}` : `+${amount}`;
}

/** The table under the boxes: amounts before, the change, and amounts after. */
export function table(no: number, f2: number): readonly TableRow[] {
  const { events, nof, noLeft, f2Left } = outcome(no, f2);
  return [
    { name: 'Before', no: String(no), f2: String(f2), nof: '0' },
    { name: 'Change', no: signed(-NO_PER_F2 * events), f2: signed(-events), nof: signed(nof) },
    { name: 'After', no: String(noLeft), f2: String(f2Left), nof: String(nof) },
  ];
}

const repeat = (kind: Particle, times: number): Particle[] => Array.from({ length: times }, () => kind);

/**
 * The two boxes' contents in drawing order. Before: the NO, then the F₂.
 * After: the NOF, then any NO left over, then any F₂ left over. A box never
 * holds more than 15, the size of the grid.
 */
export function particles(no: number, f2: number): { readonly before: readonly Particle[]; readonly after: readonly Particle[] } {
  const { nof, noLeft, f2Left } = outcome(no, f2);
  const before = [...repeat('NO', no), ...repeat('F2', f2)];
  const after = [...repeat('NOF', nof), ...repeat('NO', noLeft), ...repeat('F2', f2Left)];
  // The ranges make this impossible (the largest box is 10 + 5); the check
  // is here so that a change to a range cannot silently draw off the grid.
  if (before.length > BOX_CAPACITY || after.length > BOX_CAPACITY) {
    throw new RangeError(`A box holds at most ${BOX_CAPACITY} particles, but ${no} NO and ${f2} F₂ would need more.`);
  }
  return { before, after };
}

/** "1 F₂ is left over", "2 NO are left over". */
const leftOver = (amount: number, reactant: Reactant) =>
  `${amount} ${REACTANT_NAMES[reactant].formula} ${amount === 1 ? 'is' : 'are'} left over`;

/** What the diagram says about the chosen amounts. */
export function readout(no: number, f2: number): string {
  const { events, nof, noLeft, f2Left, limiting } = outcome(no, f2);
  if (no === 0 && f2 === 0) return 'Nothing has been put in.';
  const amounts = `${no} NO and ${f2} F₂`;
  switch (limiting) {
    case 'f2':
      return (
        `${amounts}: fluorine is the limiting reactant. ${f2} F₂ can react with only ${NO_PER_F2 * f2} NO, ` +
        `so ${nof} NOF form and ${leftOver(noLeft, 'no')}.`
      );
    case 'no':
      return (
        `${amounts}: nitrogen monoxide is the limiting reactant. ${no} NO can react with only ${events} F₂, ` +
        `so ${nof} NOF form and ${leftOver(f2Left, 'f2')}.`
      );
    case 'neither':
      return `${amounts}: neither is left over. They are in the ratio of the equation, ${NO_PER_F2} to 1, so ${nof} NOF form.`;
    case 'none': {
      const [missing, other] = no === 0 ? (['no', 'f2'] as const) : (['f2', 'no'] as const);
      return `${amounts}: with no ${REACTANT_NAMES[missing].plain} there is nothing for the ${REACTANT_NAMES[other].plain} to react with.`;
    }
    default:
      return assertNever(limiting);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled limiting reactant: ${JSON.stringify(value)}`);
}

/** A count with its molecule name, for a slider's spoken value: "6 NO molecules". */
export function countText(reactant: Reactant, amount: number): string {
  assertAmount(amount, reactant);
  return `${amount} ${REACTANT_NAMES[reactant].formula} ${amount === 1 ? 'molecule' : 'molecules'}`;
}

/** One box in words, for its accessible name. */
export function describeBox(box: BoxName, no: number, f2: number): string {
  const drawn = particles(no, f2)[box];
  const title = BOXES.find((entry) => entry.name === box)?.title;
  if (title === undefined) throw new RangeError(`The box must be before or after, not "${box}".`);
  // Each kind in the order it is drawn: the NOF first in the After box.
  const order: readonly Particle[] = box === 'before' ? ['NO', 'F2'] : ['NOF', 'NO', 'F2'];
  const present = order.flatMap((kind) => {
    const amount = drawn.filter((particle) => particle === kind).length;
    const formula = MOLECULES.find((molecule) => molecule.kind === kind)?.formula;
    return amount > 0 ? [`${amount} ${formula} ${amount === 1 ? 'molecule' : 'molecules'}`] : [];
  });
  if (present.length === 0) return `The ${title} box is empty.`;
  return `The ${title} box holds ${present.join(' and ')}.`;
}
