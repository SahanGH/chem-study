<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ABSORBANCE_AXIS_MAX,
    CONCENTRATION,
    CONCENTRATION_SLIDER,
    DYE,
    PATH_LENGTHS,
    PATH_LENGTH_START,
    WAVELENGTH,
    absorbance,
    concentrationFromSlider,
    describeCalibration,
    describeSpectrum,
    formatConcentration,
    hasDye,
    readout,
    spectrumPoints,
    type PathLength,
  } from '../../lib/absorbance';

  // Drawing units, the same for both graphs. Each drawing is 320 wide and its
  // text is 12, so the text is 12 px when a drawing itself is shown 320 px
  // wide: the ratio of the site's figures (18 on 480). Shown narrower, it is
  // smaller in proportion.
  const VIEW = { width: 320, height: 216 };
  // The room above the plot holds the name of the peak, clear of the tallest
  // curve and its dot, which reach the top of the axis.
  const PLOT = { left: 46, right: 306, top: 30, bottom: 172 };
  // The baseline of the peak's name. Its subscript hangs 3 below, and the
  // dot at the top of the axis reaches 5 above it.
  const PEAK_LABEL_Y = PLOT.top - 14;
  const SUBSCRIPT_DROP = 3;
  const ABSORBANCE_TICKS = [0, 0.5, 1, 1.5, 2];
  const WAVELENGTH_TICKS = [400, 500, 600, 700];
  // In the slider's units of 10⁻⁵ mol/L, which the axis is labeled in.
  const CONCENTRATION_TICKS = [0, 1, 2, 3, 4, 5];
  // The slope is named in the upper left of the calibration graph. No line
  // reaches it: the steepest line the controls give runs from the origin to
  // the upper right corner. A browser test checks that. It carries no value:
  // in the 2 cm cell εb can need four figures, so a value written with ε's
  // three would not always multiply out, and the readout gives ε and b.
  const SLOPE_LABEL = { x: PLOT.left + 8, y: PLOT.top + 14, text: 'slope = εb' };

  let wavelength = $state<number>(WAVELENGTH.start);
  // In the slider's own units; see CONCENTRATION_SLIDER.
  let concentrationSetting = $state<number>(CONCENTRATION_SLIDER.start);
  let pathLength = $state<PathLength>(PATH_LENGTH_START);
  let hydrated = $state(false);

  const concentration = $derived(concentrationFromSlider(concentrationSetting));
  const chosenAbsorbance = $derived(absorbance(wavelength, pathLength, concentration));
  // With no dye the spectrum is flat, so there is no peak to name.
  const hasPeak = $derived(hasDye(concentration));

  const f = (value: number) => value.toFixed(1);
  const xForWavelength = (value: number) =>
    PLOT.left + ((value - WAVELENGTH.min) / (WAVELENGTH.max - WAVELENGTH.min)) * (PLOT.right - PLOT.left);
  const xForConcentration = (value: number) =>
    PLOT.left + ((value - CONCENTRATION.min) / (CONCENTRATION.max - CONCENTRATION.min)) * (PLOT.right - PLOT.left);
  const yFor = (value: number) => PLOT.bottom - (value / ABSORBANCE_AXIS_MAX) * (PLOT.bottom - PLOT.top);

  const spectrumPath = $derived(
    `M${spectrumPoints(pathLength, concentration)
      .map((point) => `${f(xForWavelength(point.wavelength))} ${f(yFor(point.absorbance))}`)
      .join('L')}`,
  );
  // The calibration line runs from no dye to the largest concentration offered.
  const lineEnd = $derived(absorbance(wavelength, pathLength, CONCENTRATION.max));

  onMount(() => {
    hydrated = true;
  });
</script>

<!-- The parts both graphs share: the two axes and the absorbance scale. -->
{#snippet absorbanceAxis()}
  <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
  {#each ABSORBANCE_TICKS as tick (tick)}
    <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={f(yFor(tick))} x2={PLOT.left} y2={f(yFor(tick))} />
    <text class="diagram-label" x={PLOT.left - 7} y={f(yFor(tick))} dy="0.35em" text-anchor="end"
      >{tick === 0 ? '0' : tick.toFixed(1)}</text
    >
  {/each}
  <text
    class="diagram-label"
    data-axis-label="y"
    x="0"
    y="0"
    text-anchor="middle"
    transform={`translate(14 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>absorbance</text
  >
{/snippet}

<div class="diagram-body" data-diagram="absorbance" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="spectrum">
      <figcaption class="diagram-panel-title">Absorption spectrum</figcaption>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={describeSpectrum(wavelength, pathLength, concentration)}
      >
        {@render absorbanceAxis()}
        {#each WAVELENGTH_TICKS as tick (tick)}
          <line class="diagram-axis" data-tick-x={tick} x1={f(xForWavelength(tick))} y1={PLOT.bottom} x2={f(xForWavelength(tick))} y2={PLOT.bottom + 4} />
          <text class="diagram-label" x={f(xForWavelength(tick))} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >wavelength (nm)</text
        >

        {#if hasPeak}
          <line
            class="diagram-guide"
            data-peak-guide
            x1={f(xForWavelength(DYE.peakWavelength))}
            y1={PLOT.top}
            x2={f(xForWavelength(DYE.peakWavelength))}
            y2={PLOT.bottom}
          />
          <!-- The subscript is the same size as the rest, only lower: smaller
               text would be too small to read on a phone. -->
          <text class="diagram-label" data-peak-label x={f(xForWavelength(DYE.peakWavelength))} y={PEAK_LABEL_Y} text-anchor="middle"
            >λ<tspan dy={SUBSCRIPT_DROP}>max</tspan><tspan dy={-SUBSCRIPT_DROP}>{' '}= {DYE.peakWavelength} nm</tspan></text
          >
        {/if}
        <path class="diagram-curve is-accent" data-curve d={spectrumPath} />
        <line
          class="diagram-chosen"
          data-chosen
          x1={f(xForWavelength(wavelength))}
          y1={PLOT.bottom + 4}
          x2={f(xForWavelength(wavelength))}
          y2={PLOT.top}
        />
        <circle class="diagram-marker" data-dot cx={f(xForWavelength(wavelength))} cy={f(yFor(chosenAbsorbance))} r="4" />
      </svg>
    </figure>

    <figure class="diagram-plot" data-panel="calibration">
      <figcaption class="diagram-panel-title">Calibration line</figcaption>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={describeCalibration(wavelength, pathLength, concentration)}
      >
        {@render absorbanceAxis()}
        {#each CONCENTRATION_TICKS as tick (tick)}
          {@const x = f(xForConcentration(concentrationFromSlider(tick)))}
          <line class="diagram-axis" data-tick-x={tick} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" {x} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >concentration (× 10⁻⁵ M)</text
        >

        <line
          class="diagram-guide"
          data-dot-guide
          x1={f(xForConcentration(concentration))}
          y1={f(yFor(chosenAbsorbance))}
          x2={f(xForConcentration(concentration))}
          y2={PLOT.bottom}
        />
        <line
          class="diagram-curve is-accent"
          data-line
          x1={f(xForConcentration(CONCENTRATION.min))}
          y1={f(yFor(0))}
          x2={f(xForConcentration(CONCENTRATION.max))}
          y2={f(yFor(lineEnd))}
        />
        <circle class="diagram-marker" data-dot cx={f(xForConcentration(concentration))} cy={f(yFor(chosenAbsorbance))} r="4" />
        <text class="diagram-label is-selected" data-slope-label x={SLOPE_LABEL.x} y={SLOPE_LABEL.y}
          >{SLOPE_LABEL.text}</text
        >
      </svg>
    </figure>
  </div>
  <p class="diagram-readout" role="status">{readout(wavelength, pathLength, concentration)}</p>
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span>Wavelength</span>
      <input
        type="range"
        min={WAVELENGTH.min}
        max={WAVELENGTH.max}
        step={WAVELENGTH.step}
        aria-valuetext={`${wavelength} nm`}
        bind:value={wavelength}
      />
    </label>
    <label class="diagram-slider">
      <span>Concentration</span>
      <input
        type="range"
        min={CONCENTRATION_SLIDER.min}
        max={CONCENTRATION_SLIDER.max}
        step={CONCENTRATION_SLIDER.step}
        aria-valuetext={formatConcentration(concentration)}
        bind:value={concentrationSetting}
      />
    </label>
    <fieldset class="diagram-choice is-wide">
      <legend>Path length</legend>
      {#each PATH_LENGTHS as option (option)}
        <label><input type="radio" name="absorbance-path-length" value={option} bind:group={pathLength} />{option} cm</label>
      {/each}
    </fieldset>
  </div>
</div>
