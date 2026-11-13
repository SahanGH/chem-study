<script lang="ts">
  import { onMount } from 'svelte';

  // Energies in kJ/mol, measured from the reactants.
  const UNCATALYZED_EA = 120;
  const ENERGY_RELEASED = 50;
  // What the slider offers for the catalyzed activation energy.
  const LOWEST_CATALYZED_EA = 40;
  const HIGHEST_CATALYZED_EA = 100;
  const CATALYZED_EA_STEP = 10;
  const STARTING_CATALYZED_EA = 80;
  const REACTANTS_Y = 150;
  const Y_PER_KJ = 0.9;

  // A catalyzed hill at or above the original, or no hill at all, would draw
  // the opposite of what the lesson teaches, with a sentence to match.
  if (!(LOWEST_CATALYZED_EA > 0 && HIGHEST_CATALYZED_EA < UNCATALYZED_EA)) {
    throw new Error(
      `The catalyzed activation energy must stay above 0 and below ${UNCATALYZED_EA} kJ/mol, ` +
        `not run from ${LOWEST_CATALYZED_EA} to ${HIGHEST_CATALYZED_EA}.`,
    );
  }
  if (
    STARTING_CATALYZED_EA < LOWEST_CATALYZED_EA ||
    STARTING_CATALYZED_EA > HIGHEST_CATALYZED_EA ||
    (STARTING_CATALYZED_EA - LOWEST_CATALYZED_EA) % CATALYZED_EA_STEP !== 0
  ) {
    throw new Error(`The starting value ${STARTING_CATALYZED_EA} kJ/mol is not one of the slider's settings.`);
  }

  let catalyzed = $state(false);
  let catalyzedEa = $state(STARTING_CATALYZED_EA);
  let hydrated = $state(false);

  const yFor = (energy: number) => REACTANTS_Y - energy * Y_PER_KJ;
  const productsY = yFor(-ENERGY_RELEASED);

  /** Reactants on a flat stretch, one smooth hill of the given height, products on a flat stretch. */
  function profile(activationEnergy: number): string {
    const peakY = yFor(activationEnergy);
    return `M34 ${REACTANTS_Y}H90C128 ${REACTANTS_Y} 132 ${peakY} 165 ${peakY}S202 ${productsY} 240 ${productsY}H306`;
  }

  const readout = $derived(
    catalyzed
      ? // Two routes, not one hill made lower: the original path is still there.
        `The catalyzed route (dashed curve) has an activation energy of ${catalyzedEa} kJ/mol. The original route's is ${UNCATALYZED_EA} kJ/mol. The reaction still releases ${ENERGY_RELEASED} kJ/mol.`
      : `Without a catalyst the activation energy is ${UNCATALYZED_EA} kJ/mol. The reaction releases ${ENERGY_RELEASED} kJ/mol.`,
  );
  // The drawing's name says what is drawn. The numbers are in the sentence
  // below it, which is announced when it changes; repeating them here would
  // have a screen reader say everything twice.
  const drawing = $derived(
    'Energy profile: a curve from the reactants up over one hill and down to the products, which are lower.' +
      (catalyzed
        ? ' A dashed curve shows the catalyzed route: a lower hill between the same reactants and products.'
        : ''),
  );
  const sliderLabel = $derived(
    catalyzed
      ? `Activation energy with the catalyst: ${catalyzedEa} kJ/mol`
      : 'Add a catalyst to set its activation energy',
  );

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="catalyst-profile" data-hydrated={hydrated ? 'true' : undefined}>
  <svg viewBox="0 0 320 225" role="img" aria-label={drawing}>
    <path class="diagram-axis" d="M24 14V208H312" />
    <text class="diagram-label" x="30" y="20">energy</text>
    <text class="diagram-label" x="312" y="221" text-anchor="end">reaction progress</text>
    <path class="diagram-curve" data-curve="plain" d={profile(UNCATALYZED_EA)} />
    {#if catalyzed}
      <path class="diagram-curve is-dashed" data-curve="catalyzed" d={profile(catalyzedEa)} />
    {/if}
    <text class="diagram-label" x="36" y={REACTANTS_Y - 8}>reactants</text>
    <text class="diagram-label" x="306" y={productsY - 8} text-anchor="end">products</text>
  </svg>
  <p class="diagram-readout" role="status">{readout}</p>
  <div class="diagram-controls">
    <label class="diagram-toggle">
      <input type="checkbox" bind:checked={catalyzed} />Add a catalyst
    </label>
    <label class="diagram-slider">
      <span>{sliderLabel}</span>
      <input
        type="range"
        min={LOWEST_CATALYZED_EA}
        max={HIGHEST_CATALYZED_EA}
        step={CATALYZED_EA_STEP}
        bind:value={catalyzedEa}
        disabled={!catalyzed}
      />
    </label>
  </div>
</div>
