<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ENERGY_AXIS,
    METAL_IDS,
    METAL_MASS,
    METAL_TEMPERATURE,
    METALS,
    START,
    WATER_MASS,
    barNames,
    cupReadings,
    describeBars,
    describeCup,
    massText,
    readout,
    shownEnergy,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as calorimetryState,
    temperatureText,
    type MetalId,
    type Settings,
  } from '../../lib/calorimetry';

  // Both drawings are 320 units wide and their text is 12, so the text is
  // 12 px when a drawing itself is shown 320 px wide: the ratio of the site's
  // figures (18 on 480). Shown narrower, it is smaller in proportion. The two
  // are stacked at every width, as in the absorbance explorer: side by side,
  // each would be under 320 px wide in the lesson's column.

  // The cup drawing: two scenes, "Before" and "At equilibrium", each 160 wide.
  // Every piece of text sits in a band of its own (the titles at the top, the
  // readings under the cups), so no text can meet another or a part of the
  // drawing at any setting. A browser test sweeps the settings to check it.
  const CUP_VIEW = { width: 320, height: 244 };
  const SCENES = [
    { id: 'before', title: 'Before', cx: 80 },
    { id: 'after', title: 'At equilibrium', cx: 240 },
  ] as const;
  const TITLE_Y = 16;
  // The foam cup: an outer and an inner outline, wider at the top.
  const CUP = { top: 100, bottom: 196, topHalf: 46, bottomHalf: 36, wall: 6 };
  const INNER_BOTTOM = CUP.bottom - CUP.wall;
  const INNER_TOP_HALF = CUP.topHalf - CUP.wall;
  const INNER_BOTTOM_HALF =
    INNER_TOP_HALF - ((CUP.topHalf - CUP.bottomHalf) * (INNER_BOTTOM - CUP.top)) / (CUP.bottom - CUP.top);
  // The water's depth grows with its mass: 29 units for 50 g, 74 for 200 g.
  // Even the least water covers the block, which is 16 units tall.
  const waterDepth = (grams: number) => 14 + 0.3 * grams;
  // The block of metal: the same size for every metal and mass, hung on a
  // thread above the cup before and lying on the bottom at equilibrium.
  const BLOCK = { width: 28, height: 16, offset: -12, beforeTop: 56 };
  const THREAD_TOP = 26;
  // A digital probe in the water: a tube through the open top, its bulb low in the cup.
  const PROBE = { offset: 18, width: 6, top: 34, bulbY: 182, bulbR: 5 };
  const READING_Y = [216, 233] as const;

  // The bar chart.
  const BAR_VIEW = { width: 320, height: 200 };
  // The left margin holds the tick labels ("8,000" is about 32 units) and,
  // clear of them, the axis label turned on its side.
  const PLOT = { left: 70, right: 304, top: 28, bottom: 172 };
  const BAR = { width: 64, metalX: 140, waterX: 244 };
  const VALUE_ABOVE_BAR = 7;
  const NAME_BELOW_AXIS = 18;
  const ENERGY_TICKS = Array.from({ length: ENERGY_AXIS.max / ENERGY_AXIS.step + 1 }, (_, i) => i * ENERGY_AXIS.step);

  // The ids of the clip paths and the hatching are unique to this instance, so
  // that two explorers on one page cannot take each other's. $props.id() gives
  // the same id when the page is built and when the script takes over.
  const uid = $props.id();
  const CLIP_ID = `calorimetry-${uid}-inner-clip`;
  const HATCH_CUP = `calorimetry-${uid}-hatch-cup`;
  const HATCH_BAR = `calorimetry-${uid}-hatch-bar`;

  let metal = $state<MetalId>(START.metal);
  let metalMass = $state<number>(START.metalMass);
  let metalTemperature = $state<number>(START.metalTemperature);
  let waterMass = $state<number>(START.waterMass);
  let hydrated = $state(false);

  const settings = $derived<Settings>({ metal, metalMass, metalTemperature, waterMass });
  const current = $derived(calorimetryState(settings));
  const readings = $derived(cupReadings(settings));
  const names = $derived(barNames(metal));

  const f = (value: number) => value.toFixed(1);
  const outerOutline = (cx: number) =>
    `M${cx - CUP.topHalf} ${CUP.top}L${cx - CUP.bottomHalf} ${CUP.bottom}H${cx + CUP.bottomHalf}L${cx + CUP.topHalf} ${CUP.top}Z`;
  const innerOutline = (cx: number) =>
    `M${f(cx - INNER_TOP_HALF)} ${CUP.top}L${f(cx - INNER_BOTTOM_HALF)} ${INNER_BOTTOM}H${f(cx + INNER_BOTTOM_HALF)}L${f(cx + INNER_TOP_HALF)} ${CUP.top}Z`;
  const waterTop = $derived(INNER_BOTTOM - waterDepth(waterMass));
  // The inner cup's half-width at a height, for the water's surface line.
  const halfWidthAt = (y: number) =>
    INNER_BOTTOM_HALF + ((INNER_TOP_HALF - INNER_BOTTOM_HALF) * (INNER_BOTTOM - y)) / (INNER_BOTTOM - CUP.top);
  const blockTop = (scene: 'before' | 'after') => (scene === 'before' ? BLOCK.beforeTop : INNER_BOTTOM - BLOCK.height);

  const yFor = (joules: number) => PLOT.bottom - (joules / ENERGY_AXIS.max) * (PLOT.bottom - PLOT.top);
  const barTop = $derived(yFor(current.energy));

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet hatch(id: string)}
  <pattern {id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line class="calorimetry-hatch-line" x1="0" y1="0" x2="0" y2="6" />
  </pattern>
{/snippet}

<div class="diagram-body" data-diagram="calorimetry" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="cup">
      <svg viewBox={`0 0 ${CUP_VIEW.width} ${CUP_VIEW.height}`} role="img" aria-label={describeCup(settings)}>
        <defs>
          {@render hatch(HATCH_CUP)}
          {#each SCENES as scene (scene.id)}
            <clipPath id={`${CLIP_ID}-${scene.id}`}><path d={innerOutline(scene.cx)} /></clipPath>
          {/each}
        </defs>
        {#each SCENES as scene (scene.id)}
          {@const top = blockTop(scene.id)}
          {@const blockX = scene.cx + BLOCK.offset - BLOCK.width / 2}
          <g data-scene={scene.id}>
            <text class="diagram-label calorimetry-scene-title" data-scene-title x={scene.cx} y={TITLE_Y} text-anchor="middle"
              >{scene.title}</text
            >
            <path class="calorimetry-foam" d={outerOutline(scene.cx)} />
            <path class="calorimetry-cup-inner" d={innerOutline(scene.cx)} />
            <rect
              class="calorimetry-water"
              data-water
              x={scene.cx - CUP.topHalf}
              y={f(waterTop)}
              width={2 * CUP.topHalf}
              height={f(INNER_BOTTOM - waterTop)}
              clip-path={`url(#${CLIP_ID}-${scene.id})`}
            />
            <line
              class="calorimetry-water-surface"
              x1={f(scene.cx - halfWidthAt(waterTop))}
              y1={f(waterTop)}
              x2={f(scene.cx + halfWidthAt(waterTop))}
              y2={f(waterTop)}
            />
            <path class="calorimetry-outline" data-inner-outline fill="none" d={innerOutline(scene.cx)} />
            <line class="calorimetry-thread" x1={scene.cx + BLOCK.offset} y1={THREAD_TOP} x2={scene.cx + BLOCK.offset} y2={top} />
            <rect class="calorimetry-block-base" x={blockX} y={top} width={BLOCK.width} height={BLOCK.height} />
            <rect
              class="calorimetry-outline"
              data-block
              x={blockX}
              y={top}
              width={BLOCK.width}
              height={BLOCK.height}
              fill={`url(#${HATCH_CUP})`}
            />
            <rect
              class="calorimetry-probe"
              data-probe
              x={scene.cx + PROBE.offset}
              y={PROBE.top}
              width={PROBE.width}
              height={PROBE.bulbY - PROBE.top}
              rx="3"
            />
            <circle class="calorimetry-probe" cx={scene.cx + PROBE.offset + PROBE.width / 2} cy={PROBE.bulbY} r={PROBE.bulbR} />
            {#if scene.id === 'before'}
              <text class="diagram-label calorimetry-reading" data-reading="metal" x={scene.cx} y={READING_Y[0]} text-anchor="middle"
                >{readings.before[0]}</text
              >
              <text class="diagram-label calorimetry-reading" data-reading="water" x={scene.cx} y={READING_Y[1]} text-anchor="middle"
                >{readings.before[1]}</text
              >
            {:else}
              <text class="diagram-label calorimetry-reading" data-reading="after" x={scene.cx} y={READING_Y[0]} text-anchor="middle"
                >{readings.after}</text
              >
            {/if}
          </g>
        {/each}
      </svg>
    </figure>

    <figure class="diagram-plot" data-panel="bars">
      <svg viewBox={`0 0 ${BAR_VIEW.width} ${BAR_VIEW.height}`} role="img" aria-label={describeBars(settings)}>
        <defs>{@render hatch(HATCH_BAR)}</defs>
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each ENERGY_TICKS as tick (tick)}
          {@const y = f(yFor(tick))}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} />
          <text class="diagram-label" x={PLOT.left - 7} {y} dy="0.35em" text-anchor="end">{shownEnergy(tick)}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(12 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>energy (J)</text
        >

        <!-- The metal's bar is hatched like the block, the water's plain like the water,
             so the two differ by pattern as well as by color. -->
        <rect
          class="calorimetry-block-base"
          x={BAR.metalX - BAR.width / 2}
          y={f(barTop)}
          width={BAR.width}
          height={f(PLOT.bottom - barTop)}
        />
        <rect
          class="calorimetry-outline"
          data-bar="metal"
          x={BAR.metalX - BAR.width / 2}
          y={f(barTop)}
          width={BAR.width}
          height={f(PLOT.bottom - barTop)}
          fill={`url(#${HATCH_BAR})`}
        />
        <rect
          class="calorimetry-bar-water"
          data-bar="water"
          x={BAR.waterX - BAR.width / 2}
          y={f(barTop)}
          width={BAR.width}
          height={f(PLOT.bottom - barTop)}
        />
        <text class="diagram-label calorimetry-bar-value" data-bar-value="metal" x={BAR.metalX} y={f(barTop - VALUE_ABOVE_BAR)} text-anchor="middle"
          >{shownEnergy(current.energy)} J</text
        >
        <text class="diagram-label calorimetry-bar-value" data-bar-value="water" x={BAR.waterX} y={f(barTop - VALUE_ABOVE_BAR)} text-anchor="middle"
          >{shownEnergy(current.energy)} J</text
        >
        <text class="diagram-label calorimetry-bar-name" data-bar-name="metal" x={BAR.metalX} y={PLOT.bottom + NAME_BELOW_AXIS} text-anchor="middle"
          >{names.metal}</text
        >
        <text class="diagram-label calorimetry-bar-name" data-bar-name="water" x={BAR.waterX} y={PLOT.bottom + NAME_BELOW_AXIS} text-anchor="middle"
          >{names.water}</text
        >
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes: the student sees the cups and the bars change while a slider moves. -->
  <div class="diagram-controls">
    <fieldset class="diagram-choice is-wide">
      <legend>Metal</legend>
      {#each METAL_IDS as id (id)}
        <label><input type="radio" name="calorimetry-metal" value={id} bind:group={metal} />{METALS[id].label}</label>
      {/each}
    </fieldset>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Mass of metal</span>
        <span class="diagram-slider-value" aria-hidden="true">{massText(metalMass)}</span>
      </span>
      <input
        type="range"
        min={METAL_MASS.min}
        max={METAL_MASS.max}
        step={METAL_MASS.step}
        aria-valuetext={massText(metalMass)}
        bind:value={metalMass}
      />
    </label>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Starting temperature of the metal</span>
        <span class="diagram-slider-value" aria-hidden="true">{temperatureText(metalTemperature)}</span>
      </span>
      <input
        type="range"
        min={METAL_TEMPERATURE.min}
        max={METAL_TEMPERATURE.max}
        step={METAL_TEMPERATURE.step}
        aria-valuetext={temperatureText(metalTemperature)}
        bind:value={metalTemperature}
      />
    </label>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Mass of water</span>
        <span class="diagram-slider-value" aria-hidden="true">{massText(waterMass)}</span>
      </span>
      <input
        type="range"
        min={WATER_MASS.min}
        max={WATER_MASS.max}
        step={WATER_MASS.step}
        aria-valuetext={massText(waterMass)}
        bind:value={waterMass}
      />
    </label>
  </div>

  <p class="diagram-readout" role="status">{readout(settings)}</p>
</div>
