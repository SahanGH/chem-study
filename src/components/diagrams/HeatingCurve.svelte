<script lang="ts">
  import { onMount } from 'svelte';
  import {
    AXES,
    BOX,
    ENERGY,
    START_SUBSTANCE,
    SUBSTANCE_IDS,
    SUBSTANCES,
    curvePoints,
    describeBox,
    describeGraph,
    energyText,
    particles,
    readout,
    shownEnergy,
    shownWhole,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as heatingState,
    type SubstanceId,
  } from '../../lib/heating-curve';

  // The graph is drawn 320 units wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). One temperature axis serves both substances.
  const GRAPH = { width: 320, height: 236 };
  const PLOT = { left: 50, right: 306, top: 16, bottom: 196 };

  // The two dashed guides are named just above their lines, each at the end
  // where the curve is far from it, for both substances and at every energy:
  // - "boiling point" at the left end, where the curve is still below the
  //   boiling point (it reaches it only past 26 kJ, right of the name);
  // - "melting point" at the right end, where the curve is on or above the
  //   boiling point, at least 70 °C higher.
  // The marker's dot reaches only flats and slopes clear of both names. A
  // browser test sweeps both substances over all 141 energies to check it.
  const GUIDE_NAMES = { boiling: 'boiling point', melting: 'melting point' } as const;
  const NAME_ABOVE_GUIDE = 6;
  const NAME_INSET = 4;

  // Each name has a card-colored backing behind it, so that the marker line is
  // broken cleanly where it crosses a name; the name's own outline stays too.
  // Sized from the glyphs (capitals 0.73 em, descenders 0.21 em of 12) and a
  // generous 6.2 units for each character.
  const BACKING = { charWidth: 6.2, ascent: 9, descent: 3, padX: 2, padY: 1 };
  const backingFor = (text: string, x: number, baseline: number, anchor: 'start' | 'end') => {
    const width = text.length * BACKING.charWidth;
    return {
      x: (anchor === 'start' ? x : x - width) - BACKING.padX,
      y: baseline - BACKING.ascent - BACKING.padY,
      width: width + 2 * BACKING.padX,
      height: BACKING.ascent + BACKING.descent + 2 * BACKING.padY,
    };
  };

  // The box of molecules holds no text, so it can be small: its frame sits
  // just inside the drawing.
  const FRAME_INSET = 0.75;

  let substanceId = $state<SubstanceId>(START_SUBSTANCE);
  let energy = $state<number>(ENERGY.start);
  let hydrated = $state(false);

  const substance = $derived(SUBSTANCES[substanceId]);
  const current = $derived(heatingState(substanceId, energy));
  const points = $derived(curvePoints(substanceId));
  const molecules = $derived(particles(substanceId, energy));

  const f = (value: number) => value.toFixed(1);
  const xFor = (kJ: number) => PLOT.left + (kJ / AXES.energyMax) * (PLOT.right - PLOT.left);
  const yFor = (celsius: number) =>
    PLOT.bottom - ((celsius - AXES.temperatureMin) / (AXES.temperatureMax - AXES.temperatureMin)) * (PLOT.bottom - PLOT.top);
  const curvePath = $derived(`M${points.map((point, index) => `${index === 0 ? '' : 'L'}${f(xFor(point.energy))} ${f(yFor(point.temperature))}`).join('')}`);

  const meltingY = $derived(yFor(substance.meltingTenths / 10));
  const boilingY = $derived(yFor(substance.boilingTenths / 10));
  const boilingNameX = PLOT.left + NAME_INSET;
  const meltingNameX = PLOT.right - NAME_INSET;
  const boilingBaseline = $derived(boilingY - NAME_ABOVE_GUIDE);
  const meltingBaseline = $derived(meltingY - NAME_ABOVE_GUIDE);
  const boilingBacking = $derived(backingFor(GUIDE_NAMES.boiling, boilingNameX, boilingBaseline, 'start'));
  const meltingBacking = $derived(backingFor(GUIDE_NAMES.melting, meltingNameX, meltingBaseline, 'end'));

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="heating-curve" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-beside">
    <figure class="diagram-plot heating-curve-box" data-panel="box">
      <svg viewBox={`0 0 ${BOX.width} ${BOX.height}`} role="img" aria-label={describeBox(substanceId, energy)}>
        <rect
          class="molecule-box"
          x={FRAME_INSET}
          y={FRAME_INSET}
          width={BOX.width - 2 * FRAME_INSET}
          height={BOX.height - 2 * FRAME_INSET}
          rx="10"
        />
        {#each molecules as molecule, index (index)}
          <circle class="diagram-atom" data-molecule={molecule.phase} cx={molecule.x} cy={molecule.y} r={BOX.radius} />
        {/each}
      </svg>
    </figure>

    <figure class="diagram-plot" data-panel="graph">
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label={describeGraph(substanceId, energy)}>
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each AXES.temperatureTicks as tick (tick)}
          {@const y = f(yFor(tick))}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} />
          <text class="diagram-label" x={PLOT.left - 7} {y} dy="0.35em" text-anchor="end">{shownWhole(tick)}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(13 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>temperature (°C)</text
        >
        {#each AXES.energyTicks as tick (tick)}
          {@const x = f(xFor(tick))}
          <line class="diagram-axis" data-tick-x={tick} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" {x} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >energy added (kJ)</text
        >

        <line class="diagram-guide" data-guide="melting" x1={PLOT.left} y1={f(meltingY)} x2={PLOT.right} y2={f(meltingY)} />
        <line class="diagram-guide" data-guide="boiling" x1={PLOT.left} y1={f(boilingY)} x2={PLOT.right} y2={f(boilingY)} />
        <path class="diagram-curve is-accent" data-curve d={curvePath} />

        <line class="diagram-chosen" data-chosen x1={f(xFor(energy))} y1={PLOT.bottom + 4} x2={f(xFor(energy))} y2={PLOT.top} />
        <circle class="diagram-marker" data-dot cx={f(xFor(energy))} cy={f(yFor(current.temperature))} r="4" />
        <!-- The names come last, each over its card-colored backing, so that the marker
             line is broken cleanly where it crosses one. -->
        <rect
          class="diagram-name-backing"
          data-name-backing="boiling"
          x={f(boilingBacking.x)}
          y={f(boilingBacking.y)}
          width={f(boilingBacking.width)}
          height={f(boilingBacking.height)}
        />
        <text class="diagram-label diagram-curve-name" data-guide-name="boiling" x={boilingNameX} y={f(boilingBaseline)}
          >{GUIDE_NAMES.boiling}</text
        >
        <rect
          class="diagram-name-backing"
          data-name-backing="melting"
          x={f(meltingBacking.x)}
          y={f(meltingBacking.y)}
          width={f(meltingBacking.width)}
          height={f(meltingBacking.height)}
        />
        <text
          class="diagram-label diagram-curve-name"
          data-guide-name="melting"
          x={meltingNameX}
          y={f(meltingBaseline)}
          text-anchor="end">{GUIDE_NAMES.melting}</text
        >
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes: the student sees the box and the marker move with the slider. -->
  <div class="diagram-controls">
    <fieldset class="diagram-choice is-wide">
      <legend>Substance</legend>
      {#each SUBSTANCE_IDS as id (id)}
        <label><input type="radio" name="heating-curve-substance" value={id} bind:group={substanceId} />{SUBSTANCES[id].label}</label>
      {/each}
    </fieldset>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Energy added</span>
        <span class="diagram-slider-value" aria-hidden="true">{shownEnergy(energy)} kJ</span>
      </span>
      <input
        type="range"
        min={ENERGY.min}
        max={ENERGY.max}
        step={ENERGY.step}
        aria-valuetext={energyText(energy)}
        bind:value={energy}
      />
    </label>
  </div>

  <p class="diagram-readout" role="status">{readout(substanceId, energy)}</p>
</div>
