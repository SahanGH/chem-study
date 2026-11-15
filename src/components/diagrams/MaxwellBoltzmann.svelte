<script lang="ts">
  import { onMount } from 'svelte';
  import {
    AXES,
    GASES,
    REFERENCE,
    TEMPERATURE,
    curveLabel,
    curvePoints,
    densityAt,
    describeDrawing,
    energyReadout,
    peakOf,
    referenceCurve,
    referenceLabel,
    speedReadout,
    tallestPeak,
    type Curve,
    type CurvePoint,
    type GasId,
  } from '../../lib/gases';

  type Kind = Curve['kind'];

  // Drawing units. The drawing is 320 wide and its text is 12, so the text
  // is 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). Shown narrower, it is smaller in proportion.
  const VIEW = { width: 320, height: 238 };
  const PLOT = { left: 30, right: 300, top: 6, bottom: 194 };
  // Room above the tallest curve for the label of its peak.
  const HEADROOM = 24;
  // The two curves are named in the upper right of the graph. No offered
  // curve reaches it: a curve that runs that far right is a low, broad one.
  // A browser test checks that no curve touches either name.
  const KEY = { sample: 22, gap: 6, chosenY: 14, referenceY: 30 };
  // Where the key starts. The energy view's names are longer ("any gas"),
  // and it has no label at a peak to keep clear of, so its key starts
  // farther left.
  const KEY_X: Record<Kind, number> = { speed: 158, energy: 116 };
  // The line at the threshold stays this tall where the curve has dropped to
  // nothing, so the threshold can still be found.
  const SHORTEST_THRESHOLD_LINE = 14;
  const KINDS: Kind[] = ['speed', 'energy'];
  const KIND_NAME: Record<Kind, string> = { speed: 'Speed', energy: 'Kinetic energy' };
  const AXIS_NAME: Record<Kind, string> = { speed: 'molecular speed (m/s)', energy: 'kinetic energy (kJ/mol)' };
  const GAS_LIST = Object.values(GASES);

  let gasId = $state<GasId>(REFERENCE.gas);
  let temperature = $state<number>(TEMPERATURE.start);
  let kind = $state<Kind>('speed');
  // Each view keeps its own threshold: 600 m/s means nothing in kJ/mol.
  let speedThreshold = $state<number>(AXES.speed.thresholdStart);
  let energyThreshold = $state<number>(AXES.energy.thresholdStart);
  let hydrated = $state(false);

  const gas = $derived(GASES[gasId]);
  const curve = $derived<Curve>(kind === 'speed' ? { kind: 'speed', gas, temperature } : { kind: 'energy', temperature });
  const reference = $derived(referenceCurve(kind));
  const axis = $derived(AXES[kind]);
  const keyX = $derived(KEY_X[kind]);
  const threshold = $derived(kind === 'speed' ? speedThreshold : energyThreshold);
  // The vertical axis is fixed for each view, so curves can be compared as
  // they change: it fits the tallest curve the controls can reach.
  const tallest = $derived(tallestPeak(kind));

  const xFor = (x: number) => PLOT.left + (x / axis.max) * (PLOT.right - PLOT.left);
  const yFor = (density: number) => PLOT.bottom - (density / tallest) * (PLOT.bottom - PLOT.top - HEADROOM);
  const f = (value: number) => value.toFixed(1);
  const at = (x: number, density: number) => `${f(xFor(x))} ${f(yFor(density))}`;

  /** Straight lines from each point to the next, as the middle of a path. */
  const lineThrough = (points: readonly CurvePoint[]) => points.map((p) => at(p.x, p.density)).join('L');

  const chosenPoints = $derived(curvePoints(curve));
  const chosenPath = $derived(`M${lineThrough(chosenPoints)}`);
  const referencePath = $derived(`M${lineThrough(curvePoints(reference))}`);
  /** The area under the chosen curve from the threshold to the end of the axis. */
  const shadePath = $derived(
    `M${at(threshold, 0)}L${lineThrough(chosenPoints.filter((p) => p.x >= threshold))}L${at(axis.max, 0)}Z`,
  );
  const thresholdTop = $derived(Math.min(yFor(densityAt(curve, threshold)), PLOT.bottom - SHORTEST_THRESHOLD_LINE));
  const peak = $derived(peakOf(curve));
  const readout = $derived(
    kind === 'speed' ? speedReadout(gas, temperature, speedThreshold) : energyReadout(temperature, energyThreshold),
  );

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="maxwell-boltzmann" data-hydrated={hydrated ? 'true' : undefined}>
  <svg class="distribution" viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={describeDrawing(curve)}>
    <path class="distribution-shade" data-shade d={shadePath} />

    <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right + 4}`} />
    {#each axis.ticks as tick (tick)}
      <line class="diagram-axis" data-tick={tick} x1={f(xFor(tick))} y1={PLOT.bottom} x2={f(xFor(tick))} y2={PLOT.bottom + 4} />
      <text class="diagram-label" x={f(xFor(tick))} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
    {/each}
    <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
      >{AXIS_NAME[kind]}</text
    >
    <text
      class="diagram-label"
      data-axis-label="y"
      x="0"
      y="0"
      text-anchor="middle"
      transform={`translate(14 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>fraction of molecules</text
    >

    <path class="diagram-curve is-faint is-pattern-1" data-curve="reference" d={referencePath} />
    <path class="diagram-curve is-accent" data-curve="chosen" d={chosenPath} />
    <line
      class="distribution-threshold"
      data-threshold
      x1={f(xFor(threshold))}
      y1={PLOT.bottom + 4}
      x2={f(xFor(threshold))}
      y2={f(thresholdTop)}
    />
    {#if kind === 'speed'}
      <line class="diagram-guide" x1={f(xFor(peak.x))} y1={f(yFor(peak.density))} x2={f(xFor(peak.x))} y2={PLOT.bottom} />
      <circle class="diagram-marker" data-marker cx={f(xFor(peak.x))} cy={f(yFor(peak.density))} r="4" />
      <text
        class="diagram-label is-selected distribution-peak-label"
        data-peak-label
        x={f(xFor(peak.x) - 6)}
        y={f(yFor(peak.density) - 9)}>{Math.round(peak.x)} m/s</text
      >
    {/if}

    <line class="diagram-curve is-accent" x1={keyX} y1={KEY.chosenY} x2={keyX + KEY.sample} y2={KEY.chosenY} />
    <text class="diagram-label is-selected" data-curve-label="chosen" x={keyX + KEY.sample + KEY.gap} y={KEY.chosenY} dy="0.35em"
      >{curveLabel(curve)}</text
    >
    <line class="diagram-curve is-faint is-pattern-1" x1={keyX} y1={KEY.referenceY} x2={keyX + KEY.sample} y2={KEY.referenceY} />
    <text class="diagram-label" data-curve-label="reference" x={keyX + KEY.sample + KEY.gap} y={KEY.referenceY} dy="0.35em"
      >{referenceLabel(kind)}</text
    >
  </svg>
  <p class="diagram-readout" role="status">{readout}</p>
  <div class="diagram-controls">
    <!-- Each row of choices takes the full width, with the two sliders side
         by side between them: in half the width, "Kinetic energy" wraps. -->
    <fieldset class="diagram-choice is-wide">
      <legend>Gas</legend>
      {#each GAS_LIST as option (option.id)}
        <label><input type="radio" name="maxwell-boltzmann-gas" value={option.id} bind:group={gasId} />{option.name}</label>
      {/each}
    </fieldset>
    <label class="diagram-slider">
      <span>Temperature</span>
      <input
        type="range"
        min={TEMPERATURE.min}
        max={TEMPERATURE.max}
        step={TEMPERATURE.step}
        aria-valuetext={`${temperature} K`}
        bind:value={temperature}
      />
    </label>
    <!-- Two sliders, not one whose range changes: a browser clamps a slider's
         value to the old range when the value and the range change together. -->
    {#if kind === 'speed'}
      <label class="diagram-slider">
        <span>Faster than</span>
        <input
          type="range"
          min="0"
          max={AXES.speed.max}
          step={AXES.speed.thresholdStep}
          aria-valuetext={`${speedThreshold} m/s`}
          bind:value={speedThreshold}
        />
      </label>
    {:else}
      <label class="diagram-slider">
        <span>More energy than</span>
        <input
          type="range"
          min="0"
          max={AXES.energy.max}
          step={AXES.energy.thresholdStep}
          aria-valuetext={`${energyThreshold} kJ/mol`}
          bind:value={energyThreshold}
        />
      </label>
    {/if}
    <fieldset class="diagram-choice is-wide">
      <legend>Show</legend>
      {#each KINDS as option (option)}
        <label><input type="radio" name="maxwell-boltzmann-show" value={option} bind:group={kind} />{KIND_NAME[option]}</label>
      {/each}
    </fieldset>
  </div>
</div>
