<script lang="ts">
  import { onMount } from 'svelte';
  import {
    AXES,
    RATE_CONSTANTS,
    STARTING_CHOICES,
    STARTS,
    TIME,
    curvePoints,
    describeConcentrations,
    describeRates,
    readout,
    type CurvePoint,
    type RateConstantsId,
    type StartId,
  } from '../../lib/equilibrium-approach';

  // Drawing units, the same for both graphs. Each drawing is 320 wide and its
  // text is 12, so the text is 12 px when a drawing itself is shown 320 px
  // wide: the ratio of the site's figures (18 on 480). Shown narrower, it is
  // smaller in proportion.
  const VIEW = { width: 320, height: 216 };
  const PLOT = { left: 46, right: 306, top: 12, bottom: 172 };
  const TIME_TICKS = [0, 2, 4, 6, 8];
  const CONCENTRATION_TICKS = [0, 0.5, 1];
  const RATE_TICKS = [0, 0.2, 0.4, 0.6, 0.8];
  // A curve is named at its right end. The curve that ends higher is named
  // above it and the other below it, so the two names never meet, even
  // where the curves lie on top of each other. The names are clear of the
  // dot, which is 5 units from its center at most. Text stands on its
  // baseline, so a name below a curve needs its baseline lower by the height
  // of the letters.
  const NAME = { right: PLOT.right - 8, above: 10, below: 19 };

  let rateConstantsId = $state<RateConstantsId>(STARTING_CHOICES.rateConstants);
  let startId = $state<StartId>(STARTING_CHOICES.start);
  let time = $state<number>(TIME.start);
  let hydrated = $state(false);

  const points = $derived(curvePoints(rateConstantsId, startId));
  const chosen = $derived.by((): CurvePoint => {
    const found = points.find((point) => point.time === time);
    if (found === undefined) throw new Error(`No drawn point at ${time} s: the curves have one at every step of the slider.`);
    return found;
  });
  const last = $derived.by((): CurvePoint => {
    const end = points.at(-1);
    if (end === undefined) throw new Error('The curves have no points.');
    return end;
  });

  const f = (value: number) => value.toFixed(1);
  const xFor = (value: number) => PLOT.left + ((value - TIME.min) / (TIME.max - TIME.min)) * (PLOT.right - PLOT.left);
  const yForConcentration = (value: number) => PLOT.bottom - (value / AXES.concentration.max) * (PLOT.bottom - PLOT.top);
  const yForRate = (value: number) => PLOT.bottom - (value / AXES.rate.max) * (PLOT.bottom - PLOT.top);
  const tickText = (tick: number) => (tick === 0 ? '0' : tick.toFixed(1));

  const pathOf = (value: (point: CurvePoint) => number, yFor: (value: number) => number) =>
    `M${points.map((point) => `${f(xFor(point.time))} ${f(yFor(value(point)))}`).join('L')}`;
  const pathA = $derived(pathOf((point) => point.a, yForConcentration));
  const pathB = $derived(pathOf((point) => point.b, yForConcentration));
  const pathForward = $derived(pathOf((point) => point.forward, yForRate));
  const pathReverse = $derived(pathOf((point) => point.reverse, yForRate));

  /**
   * The baseline of a curve's name: above the curve if it ends higher, else
   * below it. When the two curves end level, the one that wins the tie is
   * named above and the other below, so the two names never meet.
   */
  const nameY = (yEnd: number, otherYEnd: number, winsTie: boolean) => {
    const isHigher = winsTie ? yEnd <= otherYEnd : yEnd < otherYEnd;
    return f(isHigher ? yEnd - NAME.above : yEnd + NAME.below);
  };
  // [A] and the forward rate win ties; [B] and the reverse rate do not.
  const nameA = $derived(nameY(yForConcentration(last.a), yForConcentration(last.b), true));
  const nameB = $derived(nameY(yForConcentration(last.b), yForConcentration(last.a), false));
  const nameForward = $derived(nameY(yForRate(last.forward), yForRate(last.reverse), true));
  const nameReverse = $derived(nameY(yForRate(last.reverse), yForRate(last.forward), false));

  onMount(() => {
    hydrated = true;
  });
</script>

<!-- The parts both graphs share: the axes, the time scale, the chosen time. -->
{#snippet axes(yTicks: number[], yFor: (value: number) => number, yName: string)}
  <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
  {#each yTicks as tick (tick)}
    <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={f(yFor(tick))} x2={PLOT.left} y2={f(yFor(tick))} />
    <text class="diagram-label" x={PLOT.left - 7} y={f(yFor(tick))} dy="0.35em" text-anchor="end">{tickText(tick)}</text>
  {/each}
  <text
    class="diagram-label"
    data-axis-label="y"
    x="0"
    y="0"
    text-anchor="middle"
    transform={`translate(14 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>{yName}</text
  >
  {#each TIME_TICKS as tick (tick)}
    <line class="diagram-axis" data-tick-x={tick} x1={f(xFor(tick))} y1={PLOT.bottom} x2={f(xFor(tick))} y2={PLOT.bottom + 4} />
    <text class="diagram-label" x={f(xFor(tick))} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
  {/each}
  <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
    >time (s)</text
  >
  <line
    class="diagram-chosen"
    data-chosen
    x1={f(xFor(time))}
    y1={PLOT.bottom + 4}
    x2={f(xFor(time))}
    y2={PLOT.top}
  />
{/snippet}

<div class="diagram-body" data-diagram="equilibrium-approach" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="concentrations">
      <figcaption class="diagram-panel-title">Concentrations</figcaption>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={describeConcentrations(rateConstantsId, startId, time)}
      >
        {@render axes(CONCENTRATION_TICKS, yForConcentration, 'concentration (M)')}
        <path class="diagram-curve" data-curve="a" d={pathA} />
        <path class="diagram-curve is-dashed" data-curve="b" d={pathB} />
        <circle class="diagram-marker is-ink" data-dot="a" cx={f(xFor(chosen.time))} cy={f(yForConcentration(chosen.a))} r="4" />
        <circle class="diagram-marker" data-dot="b" cx={f(xFor(chosen.time))} cy={f(yForConcentration(chosen.b))} r="4" />
        <text class="diagram-label diagram-curve-name is-ink" data-curve-name="a" x={NAME.right} y={nameA} text-anchor="end">[A]</text>
        <text class="diagram-label diagram-curve-name is-selected" data-curve-name="b" x={NAME.right} y={nameB} text-anchor="end"
          >[B]</text
        >
      </svg>
    </figure>

    <figure class="diagram-plot" data-panel="rates">
      <figcaption class="diagram-panel-title">Rates</figcaption>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={describeRates(rateConstantsId, startId, time)}
      >
        {@render axes(RATE_TICKS, yForRate, 'rate (M/s)')}
        <path class="diagram-curve" data-curve="forward" d={pathForward} />
        <path class="diagram-curve is-dashed" data-curve="reverse" d={pathReverse} />
        <circle class="diagram-marker is-ink" data-dot="forward" cx={f(xFor(chosen.time))} cy={f(yForRate(chosen.forward))} r="4" />
        <circle class="diagram-marker" data-dot="reverse" cx={f(xFor(chosen.time))} cy={f(yForRate(chosen.reverse))} r="4" />
        <text class="diagram-label diagram-curve-name is-ink" data-curve-name="forward" x={NAME.right} y={nameForward} text-anchor="end"
          >forward rate</text
        >
        <text class="diagram-label diagram-curve-name is-selected" data-curve-name="reverse" x={NAME.right} y={nameReverse} text-anchor="end"
          >reverse rate</text
        >
      </svg>
    </figure>
  </div>
  <p class="diagram-readout" role="status">{readout(rateConstantsId, startId, time)}</p>
  <div class="diagram-controls">
    <fieldset class="diagram-choice is-wide">
      <legend>Start with</legend>
      {#each STARTS as option (option.id)}
        <label><input type="radio" name="equilibrium-approach-start" value={option.id} bind:group={startId} />{option.label}</label>
      {/each}
    </fieldset>
    <fieldset class="diagram-choice is-wide">
      <legend>Rate constants (per second)</legend>
      {#each RATE_CONSTANTS as option (option.id)}
        <label
          ><input type="radio" name="equilibrium-approach-rate-constants" value={option.id} bind:group={rateConstantsId} />{option.label}</label
        >
      {/each}
    </fieldset>
    <label class="diagram-slider">
      <span>Time</span>
      <input
        type="range"
        min={TIME.min}
        max={TIME.max}
        step={TIME.step}
        aria-valuetext={`${time} s`}
        bind:value={time}
      />
    </label>
  </div>
</div>
