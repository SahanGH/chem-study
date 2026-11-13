<script lang="ts">
  import { onMount } from 'svelte';
  import { formatQuantity } from '../../lib/format';
  import { LINEAR_PLOT, concentrationAt, plotValue, type Order, type PlotKind } from '../../lib/kinetics';

  const INITIAL = 1;
  const END_TIME = 100;
  const SAMPLES = 50;
  // Chosen so each order uses up most of A, and none of it runs out, by the
  // end of the plot: [A] finishes at 0.20 M, 0.14 M and 0.20 M.
  const RATE_CONSTANT: Record<Order, number> = { 0: 0.008, 1: 0.02, 2: 0.04 };
  const ORDERS: Order[] = [0, 1, 2];
  // The sign of the straight plot's slope, and the units of k, for each order.
  const ORDER_INFO: Record<Order, { name: string; sign: string; units: string }> = {
    0: { name: 'zero', sign: '−', units: 'M/s' },
    1: { name: 'first', sign: '−', units: 's⁻¹' },
    2: { name: 'second', sign: '+', units: 'M⁻¹ s⁻¹' },
  };
  const PLOTS: PlotKind[] = ['concentration', 'ln', 'reciprocal'];
  const PLOT_INFO: Record<PlotKind, { axis: string; spoken: string }> = {
    concentration: { axis: '[A]', spoken: 'the concentration of A' },
    ln: { axis: 'ln[A]', spoken: 'the natural log of the concentration of A' },
    reciprocal: { axis: '1/[A]', spoken: 'one over the concentration of A' },
  };
  const BOX = { left: 16, right: 196, top: 26, bottom: 140 };
  /** Share of the ln[A] plot's height left empty under its curve. */
  const LN_MARGIN = 0.15;

  let order = $state<Order>(1);
  let hydrated = $state(false);

  const chosen = $derived(ORDER_INFO[order]);
  // Written from the rate constant the plots are drawn with, so the sentence
  // and the picture cannot disagree.
  const slope = $derived(
    `${chosen.sign}k = ${chosen.sign}${formatQuantity(RATE_CONSTANT[order])} ${chosen.units}`,
  );
  const linear = $derived(PLOT_INFO[LINEAR_PLOT[order]]);

  /** The curve for one plot, scaled to fill its box. */
  function pointsFor(kind: PlotKind, forOrder: Order): string {
    const values = Array.from({ length: SAMPLES + 1 }, (_, index) => {
      const time = (index / SAMPLES) * END_TIME;
      return plotValue(kind, concentrationAt(forOrder, INITIAL, RATE_CONSTANT[forOrder], time));
    });
    const lowest = Math.min(...values);
    const highest = Math.max(...values);
    // [A] and 1/[A] are measured up from zero. Stretching each curve to fill
    // its box would put the end of every [A] curve on the time axis, as if A
    // had run out; it has not. ln[A] is negative here, so its plot starts a
    // little below its lowest value instead.
    const floor = kind === 'ln' ? lowest - LN_MARGIN * (highest - lowest) : 0;
    const span = highest - floor;
    // Cannot happen with the constants above: every curve changes over the
    // run. A rate constant of zero would make it flat and the scale undefined.
    if (!(span > 0)) throw new Error(`The ${kind} plot for order ${forOrder} is flat, so it has no scale.`);
    return values
      .map((value, index) => {
        const x = BOX.left + (index / SAMPLES) * (BOX.right - BOX.left);
        const y = BOX.bottom - ((value - floor) / span) * (BOX.bottom - BOX.top);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="concentration-plots" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-plots">
    {#each PLOTS as kind}
      {@const isLinear = kind === LINEAR_PLOT[order]}
      <figure class="diagram-plot" class:is-linear={isLinear} data-plot={kind}>
        <svg
          viewBox="0 0 210 165"
          role="img"
          aria-label={`Graph of ${PLOT_INFO[kind].spoken} against time for a ${chosen.name}-order reaction: a ${isLinear ? 'straight line' : 'curve'}.`}
        >
          <path class="diagram-axis" d={`M${BOX.left} ${BOX.top - 8}V${BOX.bottom}H${BOX.right + 6}`} />
          <polyline class="diagram-curve" class:is-accent={isLinear} points={pointsFor(kind, order)} />
          <text class="diagram-label" x={BOX.left} y="12">{PLOT_INFO[kind].axis}</text>
          <text class="diagram-label" x={BOX.right + 6} y="157" text-anchor="end">time</text>
        </svg>
        <p class="diagram-plot-note">{isLinear ? 'straight line' : 'curve'}</p>
      </figure>
    {/each}
  </div>
  <p class="diagram-readout" role="status">
    For a {chosen.name}-order reaction, {linear.axis} against time is the straight line. Its slope is {slope}.
  </p>
  <p class="diagram-detail">Every plot starts at [A] = {INITIAL.toFixed(1)} M and runs for {END_TIME} s.</p>
  <div class="diagram-controls">
    <fieldset class="diagram-choice">
      <legend>Order in A</legend>
      {#each ORDERS as option}
        <label>
          <input type="radio" name="concentration-plots-order" value={option} bind:group={order} />{ORDER_INFO[option].name}
        </label>
      {/each}
    </fieldset>
  </div>
</div>
