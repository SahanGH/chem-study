/**
 * A hot piece of metal in cooler water in an insulated cup, for the
 * calorimetry explorer in lesson 6.4. No DOM here, so it is testable directly.
 *
 * The model: with C_m = (mass of metal)(its c) and C_w = (mass of water)(4.18),
 * the final temperature is (C_m T_m + C_w 20.0) / (C_m + C_w) and the energy
 * moved is C_m C_w (T_m − 20.0) / (C_m + C_w). No energy passes to the cup or
 * the room.
 *
 * Everything is worked in whole units, so the arithmetic is exact: specific
 * heat capacities in mJ/(g·°C) (523, 228, 132 and 4,180), heat capacities in
 * mJ/°C, temperatures in tenths of a degree. Only the shown numbers are
 * rounded, each half up: the final temperature to 0.1 °C and the energy to the
 * nearest joule. The energy comes from the exact expression, never from the
 * rounded final temperature, so the two bars are always the same number.
 *
 * The readout shows each temperature change to 0.01 °C, from the exact final
 * temperature, so that a student who multiplies a shown heat capacity by a
 * shown change gets the shown energy to within display rounding in every state.
 * A change taken from the final temperature rounded to 0.1 °C would not: 0.2 °C
 * for 794 J/°C of water is 159 J, against 196 J moved.
 */

export const METALS = {
  titanium: { name: 'titanium', label: 'Titanium (0.523 J/(g·°C))', specificHeat: 523 },
  tin: { name: 'tin', label: 'Tin (0.228 J/(g·°C))', specificHeat: 228 },
  tungsten: { name: 'tungsten', label: 'Tungsten (0.132 J/(g·°C))', specificHeat: 132 },
} as const;

export type MetalId = keyof typeof METALS;

const isMetalId = (key: string): key is MetalId => Object.hasOwn(METALS, key);

/** The metals by id, in the order the diagram offers them: read from METALS, so the two cannot drift apart. */
export const METAL_IDS: readonly MetalId[] = Object.keys(METALS).filter(isMetalId);

/** Water: 4.18 J/(g·°C), in mJ/(g·°C), starting at 20.0 °C, in tenths of a degree. */
export const WATER = { specificHeat: 4180, startTenths: 200 } as const;

/** The sliders: masses in g, the metal's starting temperature in °C. */
export const METAL_MASS = { min: 50, max: 200, step: 10, start: 100 } as const;
export const METAL_TEMPERATURE = { min: 50, max: 100, step: 5, start: 80 } as const;
export const WATER_MASS = { min: 50, max: 200, step: 10, start: 100 } as const;

/**
 * The bar chart's axis, in J. The largest energy any state moves is 7,437 J
 * (200 g of titanium at 100 °C into 200 g of water).
 */
export const ENERGY_AXIS = { max: 8000, step: 2000 } as const;

export interface Settings {
  readonly metal: MetalId;
  /** In g. */
  readonly metalMass: number;
  /** In °C. */
  readonly metalTemperature: number;
  /** In g. */
  readonly waterMass: number;
}

export const START: Settings = {
  metal: 'titanium',
  metalMass: METAL_MASS.start,
  metalTemperature: METAL_TEMPERATURE.start,
  waterMass: WATER_MASS.start,
};

export interface CalorimetryState {
  /** Mass times specific heat capacity, in mJ/°C. */
  readonly metalHeatCapacity: number;
  readonly waterHeatCapacity: number;
  /** In tenths of a degree. */
  readonly metalStartTenths: number;
  readonly waterStartTenths: number;
  /** The shared final temperature, rounded half up to a tenth of a degree. */
  readonly finalTenths: number;
  /** The energy the metal lost and the water gained, rounded half up to a joule. */
  readonly energy: number;
  /** How far each temperature moved, from the shown final temperature, in tenths of a degree. */
  readonly metalChangeTenths: number;
  readonly waterChangeTenths: number;
  /**
   * How far each temperature moved, from the exact final temperature, rounded half up to
   * hundredths of a degree. These are what the readout shows.
   */
  readonly metalChangeHundredths: number;
  readonly waterChangeHundredths: number;
}

const MILLIJOULES_PER_JOULE = 1000;
const TENTHS_PER_DEGREE = 10;

function assertMetal(metal: string): asserts metal is MetalId {
  if (!isMetalId(metal)) {
    throw new RangeError(`The metal must be titanium, tin or tungsten, not "${metal}".`);
  }
}

function assertSlider(
  value: number,
  slider: { readonly min: number; readonly max: number; readonly step: number },
  what: string,
  unit: string,
): void {
  // Written so that NaN fails too: every comparison with NaN is false.
  const inRange = value >= slider.min && value <= slider.max;
  const onStep = Number.isInteger((value - slider.min) / slider.step);
  if (!(inRange && onStep)) {
    throw new RangeError(
      `The ${what} must be from ${slider.min} to ${slider.max} ${unit} in steps of ${slider.step} ${unit}, not ${value} ${unit}.`,
    );
  }
}

function assertSettings(settings: Settings): void {
  assertMetal(settings.metal);
  assertSlider(settings.metalMass, METAL_MASS, 'mass of metal', 'g');
  assertSlider(settings.metalTemperature, METAL_TEMPERATURE, 'starting temperature of the metal', '°C');
  assertSlider(settings.waterMass, WATER_MASS, 'mass of water', 'g');
}

/** numerator / denominator, both positive whole numbers, rounded half up, by integer arithmetic only. */
function divideHalfUp(numerator: number, denominator: number): number {
  const doubled = 2 * numerator + denominator;
  const twice = 2 * denominator;
  return (doubled - (doubled % twice)) / twice;
}

/** The temperatures and the energy once the metal and the water have come to the same temperature. */
export function state(settings: Settings): CalorimetryState {
  assertSettings(settings);
  const metalHeatCapacity = settings.metalMass * METALS[settings.metal].specificHeat;
  const waterHeatCapacity = settings.waterMass * WATER.specificHeat;
  const metalStartTenths = settings.metalTemperature * TENTHS_PER_DEGREE;
  const waterStartTenths = WATER.startTenths;
  const total = metalHeatCapacity + waterHeatCapacity;
  // Every product here is below 2^53 (the largest is about 1.4 × 10^14), so it is exact.
  const finalTenthsTimesTotal = metalHeatCapacity * metalStartTenths + waterHeatCapacity * waterStartTenths;
  const finalTenths = divideHalfUp(finalTenthsTimesTotal, total);
  // mJ/°C × mJ/°C / (mJ/°C) × tenths of a degree is 0.1 mJ: 10,000 of them to a joule.
  const energy = divideHalfUp(
    metalHeatCapacity * waterHeatCapacity * (metalStartTenths - waterStartTenths),
    total * TENTHS_PER_DEGREE * MILLIJOULES_PER_JOULE,
  );
  return {
    metalHeatCapacity,
    waterHeatCapacity,
    metalStartTenths,
    waterStartTenths,
    finalTenths,
    energy,
    metalChangeTenths: metalStartTenths - finalTenths,
    waterChangeTenths: finalTenths - waterStartTenths,
    // In hundredths, the exact final temperature is 10 × finalTenthsTimesTotal / total.
    waterChangeHundredths: divideHalfUp(10 * (finalTenthsTimesTotal - waterStartTenths * total), total),
    metalChangeHundredths: divideHalfUp(10 * (metalStartTenths * total - finalTenthsTimesTotal), total),
  };
}

function assertWhole(value: number, what: string, least = 0): void {
  if (!(Number.isInteger(value) && value >= least)) {
    throw new RangeError(`${what} must be a whole number, not below ${least}, not ${value}.`);
  }
}

/** Tenths of a degree with one decimal place: 267 is "26.7". */
export function shownTemperature(tenths: number): string {
  assertWhole(tenths, 'A temperature in tenths of a degree');
  return `${Math.floor(tenths / TENTHS_PER_DEGREE)}.${tenths % TENTHS_PER_DEGREE}`;
}

/** Hundredths of a degree with two decimal places: 667 is "6.67", 23 is "0.23". */
export function shownChange(hundredths: number): string {
  assertWhole(hundredths, 'A temperature change in hundredths of a degree');
  return `${Math.floor(hundredths / 100)}.${String(hundredths % 100).padStart(2, '0')}`;
}

/** A whole number with a comma for thousands: 2789 is "2,789". */
export function shownEnergy(joules: number): string {
  assertWhole(joules, 'An energy in joules');
  return String(joules).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * A heat capacity given in mJ/°C, shown in J/°C to three figures, rounded half
 * up: 52300 is "52.3", 104600 is "105", 6600 is "6.60".
 */
export function shownHeatCapacity(millijoules: number): string {
  // From 0.100 J/°C up, so that three figures never need more than two decimal places.
  assertWhole(millijoules, 'A heat capacity in mJ/°C', 100);
  const unit = 10 ** (String(millijoules).length - 3);
  const rounded = divideHalfUp(millijoules, unit) * unit;
  const whole = Math.floor(rounded / MILLIJOULES_PER_JOULE);
  const decimals = Math.max(0, 3 - String(whole).length);
  if (decimals === 0) return String(whole);
  const fraction = (rounded % MILLIJOULES_PER_JOULE) / 10 ** (3 - decimals);
  return `${whole}.${String(fraction).padStart(decimals, '0')}`;
}

/** A mass slider's spoken value: "100 g". */
export function massText(grams: number): string {
  return `${grams} g`;
}

/** The temperature slider's spoken value: "80 °C". */
export function temperatureText(degrees: number): string {
  return `${degrees} °C`;
}

/** What the diagram says about the chosen settings. */
export function readout(settings: Settings): string {
  const s = state(settings);
  const name = METALS[settings.metal].name;
  const energy = shownEnergy(s.energy);
  return (
    `Both end at ${shownTemperature(s.finalTenths)} °C. The ${name} lost ${energy} J and the water gained ${energy} J. ` +
    `The water's temperature changed less, by ${shownChange(s.waterChangeHundredths)} °C against ` +
    `${shownChange(s.metalChangeHundredths)} °C (to 0.01 °C), because its heat capacity is larger: ` +
    `${shownHeatCapacity(s.waterHeatCapacity)} J/°C against ${shownHeatCapacity(s.metalHeatCapacity)} J/°C.`
  );
}

/** The thermometer readings drawn under the two cups. */
export function cupReadings(settings: Settings): { readonly before: readonly [string, string]; readonly after: string } {
  const s = state(settings);
  return {
    before: [`${METALS[settings.metal].name} at ${shownTemperature(s.metalStartTenths)} °C`, `water at ${shownTemperature(s.waterStartTenths)} °C`],
    after: `both at ${shownTemperature(s.finalTenths)} °C`,
  };
}

/** The names drawn under the two bars. */
export function barNames(metal: MetalId): { readonly metal: string; readonly water: string } {
  assertMetal(metal);
  return { metal: `${METALS[metal].name} lost`, water: 'water gained' };
}

/** The cup in words, for its accessible name. */
export function describeCup(settings: Settings): string {
  const s = state(settings);
  const name = METALS[settings.metal].name;
  return (
    `Two drawings of an insulated cup of water. Before: ${massText(settings.metalMass)} of ${name} at ` +
    `${shownTemperature(s.metalStartTenths)} °C hangs above ${massText(settings.waterMass)} of water at ` +
    `${shownTemperature(s.waterStartTenths)} °C. At equilibrium: the ${name} lies in the water, and both are at ` +
    `${shownTemperature(s.finalTenths)} °C.`
  );
}

/** The bars in words, for their accessible name. */
export function describeBars(settings: Settings): string {
  const s = state(settings);
  return (
    `Bar chart of energy in joules, from 0 to ${shownEnergy(ENERGY_AXIS.max)} J. A hatched bar, the energy the ` +
    `${METALS[settings.metal].name} lost, and a plain bar, the energy the water gained, are the same height: ` +
    `${shownEnergy(s.energy)} J each.`
  );
}
