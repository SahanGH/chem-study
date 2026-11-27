<script lang="ts">
  import { onMount } from 'svelte';
  import {
    AXES,
    BOX,
    FREE_ENERGY,
    LABELS,
    START,
    TEMPERATURES,
    describeBox,
    describeGraph,
    freeEnergyText,
    freeEnergyValueText,
    freeTickText,
    linePoints,
    logTickText,
    particles,
    readout,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as gibbsState,
    temperatureText,
    type Kelvins,
  } from '../../lib/gibbs-and-k';

  // The graph is drawn 320 units wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480).
  //
  // Heights are budgeted for a 320 × 568 phone, where the box stands above
  // the graph: the box's title (about 24 px), the box (160 px), its key
  // (about 24 px), the graph (214 units, at most 214 px) and the slider row
  // (about 50 px), with the gaps between them, come to about 505 px.
  const GRAPH = { width: 320, height: 214 };
  // Ten units for each power of ten, 2.6 for each kJ. The plot stops 56 units
  // short of the right edge: the three lines and the K = 1 line are named
  // there, past their right-hand ends, where the marker never goes.
  const PLOT = { left: 56, right: 264, top: 10, bottom: 170 };
  const NAME_GAP = 10;
  // The ΔG° values 17 units under the axis and its name 20 units under them:
  // two 12-unit lines (about 14.5 units each, ascent and descent) 5.5 apart.
  const TICK_LABEL_GAP = 17;
  const AXIS_TITLE_GAP = 37;

  // Where the labels stand, clear of every line and of the marker at every
  // setting:
  // - the values of K left of the plot and the values of ΔG° under it; the
  //   lowest K value ("10⁻⁶") is 20 units above the axis, so it clears "−40"
  //   at the corner;
  // - the names at the right, at the height of each line's end: K = 1 at 0,
  //   1,000 K at −2.09, 500 K at −4.18 and 298 K at −7.01 powers of ten, at
  //   least 20.9 units apart, so their 12-unit text never meets.
  // A browser test sweeps every setting to check it.

  // Each line keeps its own dash pattern when it is not chosen, so the two
  // faint lines differ from each other by more than position; the chosen one
  // is solid and heavy.
  const PATTERN: Record<Kelvins, string> = {
    298: 'is-pattern-1',
    500: 'is-pattern-2',
    1000: 'gibbs-and-k-pattern-3',
  };

  // The ids are unique to this instance, so that two explorers on one page
  // cannot share a group of radio buttons. $props.id() gives the same id when
  // the page is built and when the script takes over.
  const uid = $props.id();
  const RADIO_NAME = `gibbs-and-k-${uid}-temperature`;

  // The box's frame sits just inside the drawing.
  const FRAME_INSET = 0.75;

  let freeEnergy = $state<number>(START.freeEnergy);
  let temperature = $state<Kelvins>(START.temperature);
  let hydrated = $state(false);

  const current = $derived(gibbsState(freeEnergy, temperature));
  const drawn = $derived(particles(freeEnergy, temperature));

  const f = (value: number) => value.toFixed(1);
  const xFor = (kJ: number) => PLOT.left + ((kJ - AXES.freeMin) / (AXES.freeMax - AXES.freeMin)) * (PLOT.right - PLOT.left);
  const yFor = (logK: number) => PLOT.top + ((AXES.logMax - logK) / (AXES.logMax - AXES.logMin)) * (PLOT.bottom - PLOT.top);
  const ONE_Y = yFor(0);

  // The three lines are fixed: drawn once from the module's values.
  const LINES = TEMPERATURES.map((t) => {
    const points = linePoints(t);
    const end = points.at(-1);
    if (!end) throw new Error(`The line for ${t} K has no points.`);
    return {
      temperature: t,
      d: `M${points.map((p, i) => `${i === 0 ? '' : 'L'}${f(xFor(p.freeEnergy))} ${f(yFor(p.logK))}`).join('')}`,
      nameY: yFor(end.logK),
    };
  });
  const others = $derived(LINES.filter((line) => line.temperature !== temperature));
  const chosen = $derived(LINES.find((line) => line.temperature === temperature));

  const HALF_SQUARE = BOX.squareSide / 2;

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet particleA(x: number, y: number)}
  <circle class="gibbs-and-k-a" data-particle="A" cx={x} cy={y} r={BOX.circleRadius} />
{/snippet}

{#snippet particleB(x: number, y: number)}
  <rect class="gibbs-and-k-b" data-particle="B" x={x - HALF_SQUARE} y={y - HALF_SQUARE} width={BOX.squareSide} height={BOX.squareSide} />
{/snippet}

<div class="diagram-body" data-diagram="gibbs-and-k" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-beside">
    <figure class="diagram-plot gibbs-and-k-box" data-panel="box">
      <figcaption class="diagram-panel-title">{LABELS.box}</figcaption>
      <svg viewBox={`0 0 ${BOX.size} ${BOX.size}`} role="img" aria-label={describeBox(freeEnergy, temperature)}>
        <rect
          class="molecule-box"
          x={FRAME_INSET}
          y={FRAME_INSET}
          width={BOX.size - 2 * FRAME_INSET}
          height={BOX.size - 2 * FRAME_INSET}
          rx="8"
        />
        {#each drawn as particle, cell (cell)}
          {#if particle.kind === 'B'}
            {@render particleB(particle.x, particle.y)}
          {:else}
            {@render particleA(particle.x, particle.y)}
          {/if}
        {/each}
      </svg>
      <div class="molecule-key gibbs-and-k-key">
        <ul>
          <li data-key-particle="A">
            <svg viewBox="-8 -8 16 16" aria-hidden="true">{@render particleA(0, 0)}</svg>{LABELS.keyA}
          </li>
          <li data-key-particle="B">
            <svg viewBox="-8 -8 16 16" aria-hidden="true">{@render particleB(0, 0)}</svg>{LABELS.keyB}
          </li>
        </ul>
      </div>
    </figure>

    <figure class="diagram-plot" data-panel="graph">
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label={describeGraph(freeEnergy, temperature)}>
        {#each AXES.logTicks.filter((tick) => tick !== 0) as tick (tick)}
          <line class="diagram-gridline" data-gridline={tick} x1={PLOT.left} y1={f(yFor(tick))} x2={PLOT.right} y2={f(yFor(tick))} />
        {/each}

        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each AXES.logTicks as tick (tick)}
          {@const y = f(yFor(tick))}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} />
          <text class="diagram-label" data-tick-label-y={tick} x={PLOT.left - 7} {y} dy="0.35em" text-anchor="end">{logTickText(tick)}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(13 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>{LABELS.logAxis}</text
        >
        {#each AXES.freeTicks as tick (tick)}
          {@const x = f(xFor(tick))}
          <line class="diagram-axis" data-tick-x={tick} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" data-tick-label-x={tick} {x} y={PLOT.bottom + TICK_LABEL_GAP} text-anchor="middle">{freeTickText(tick)}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + AXIS_TITLE_GAP} text-anchor="middle"
          >{LABELS.freeAxis}</text
        >

        <!-- K = 1: drawn firmly, solid, and named at its right-hand end. -->
        <line class="gibbs-and-k-one" data-k-one x1={PLOT.left} y1={f(ONE_Y)} x2={PLOT.right} y2={f(ONE_Y)} />
        <text class="diagram-label gibbs-and-k-one-name" data-k-one-name x={PLOT.right + NAME_GAP} y={f(ONE_Y)} dy="0.35em">{LABELS.kOne}</text>

        {#each others as other (other.temperature)}
          <path class={`diagram-curve is-faint ${PATTERN[other.temperature]}`} data-line={other.temperature} d={other.d} />
        {/each}
        {#if chosen}
          <path class="diagram-curve is-accent" data-line={chosen.temperature} data-chosen-line d={chosen.d} />
        {/if}

        <circle class="diagram-marker" data-dot cx={f(xFor(freeEnergy))} cy={f(yFor(current.logK))} r="4" />

        {#each LINES as named (named.temperature)}
          <text
            class={`diagram-label${named.temperature === temperature ? ' is-selected' : ''}`}
            data-line-name={named.temperature}
            x={PLOT.right + NAME_GAP}
            y={f(named.nameY)}
            dy="0.35em">{temperatureText(named.temperature)}</text
          >
        {/each}
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes. The slider comes first, so that on a small phone it
       is on the screen with the box and the graph while it moves. -->
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{LABELS.slider}</span>
        <span class="diagram-slider-value" aria-hidden="true">{freeEnergyText(freeEnergy)} kJ/mol</span>
      </span>
      <input
        type="range"
        min={FREE_ENERGY.min}
        max={FREE_ENERGY.max}
        step={FREE_ENERGY.step}
        aria-valuetext={freeEnergyValueText(freeEnergy)}
        bind:value={freeEnergy}
      />
    </label>
    <fieldset class="diagram-choice">
      <legend>{LABELS.choice}</legend>
      {#each TEMPERATURES as t (t)}
        <label><input type="radio" name={RADIO_NAME} value={t} bind:group={temperature} />{temperatureText(t)}</label>
      {/each}
    </fieldset>
  </div>

  <p class="diagram-readout" role="status">{readout(freeEnergy, temperature)}</p>
</div>
