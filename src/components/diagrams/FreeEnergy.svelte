<script lang="ts">
  import { onMount } from 'svelte';
  import {
    AXES,
    LABELS,
    REACTION_IDS,
    REACTIONS,
    START,
    TEMPERATURE,
    bars,
    describeBars,
    describeGraph,
    energyTickText,
    linePoints,
    readout,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as freeEnergyState,
    temperatureText,
    temperatureTickText,
    temperatureValueText,
    zeroTemperature,
    zeroTemperatureText,
    type ReactionId,
  } from '../../lib/free-energy';

  // Both drawings are 320 units wide and their text is 12, so the text is
  // 12 px when a drawing itself is shown 320 px wide: the ratio of the site's
  // figures (18 on 480). They are stacked at every width, as in the
  // titration-curve explorer.
  //
  // The graph and the bars share one vertical scale: 0.18 unit for each kJ,
  // so the 900 kJ from −400 to +500 are 162 units in both. That keeps the
  // graph, the bars and the slider on a 320 × 568 screen together.
  const GRAPH = { width: 320, height: 238 };
  const PLOT = { left: 56, right: 304, top: 30, bottom: 192 };
  // The temperatures sit 21 units under the plot, so that "200" clears "−400"
  // at the corner where the two axes meet.
  const TEMPERATURE_LABEL_GAP = 21;
  const TEMPERATURE_TITLE_GAP = 39;
  const UNITS_PER_KJ = (PLOT.bottom - PLOT.top) / (AXES.energyMax - AXES.energyMin);

  // Where the labels stand, clear of every line and of the marker at every
  // setting:
  // - "favored" sits in the bottom left corner of the hatched half, below the
  //   lowest line there (nitrous oxide, at most −233 kJ up to 470 K, about
  //   12 units above the label) and left of any guide;
  // - the guide at the temperature of ΔG° = 0 runs from the top of the plot
  //   down to the zero line only, and its value is written above the plot,
  //   where no line and no marker goes;
  // - the lines are named in the key under the graph.
  // A browser test sweeps every setting to check it.
  const FAVORED_LABEL = { x: PLOT.left + 6, baseline: PLOT.bottom - 6 };
  const GUIDE_LABEL_Y = PLOT.top - 8;
  // A card-colored backing behind "favored", so that the hatching does not run
  // through its letters. Sized from the glyphs (capitals 0.73 em, descenders
  // 0.21 em of 12) and a generous 6.6 units for each character.
  const BACKING = { charWidth: 6.6, ascent: 9, descent: 3, padX: 3, padY: 1.5 };

  // The bars: on a zero line, rising for a positive term and falling for a
  // negative one. Each value is written beyond its bar's end, above a rising
  // bar and below a falling one; the names are in a row under the lowest a bar
  // can reach (−400 kJ).
  const BARS = { width: 320, height: 218, top: 20 };
  const BAR = { width: 56, centers: [104, 188, 272] as const, valueAbove: 6, valueBelow: 14, nameY: 210, lineLeft: 64, lineRight: 304 };
  /** The x of a bar's center; a bar that does not exist is an error, never a bar drawn at 0. */
  function barCenter(index: number): number {
    const x = BAR.centers[index];
    if (x === undefined) throw new RangeError(`The bars have no place ${index}; they have ${BAR.centers.length}.`);
    return x;
  }

  // The ids are unique to this instance, so that two explorers on one page
  // cannot share a hatching or a group of radio buttons. $props.id() gives the
  // same id when the page is built and when the script takes over.
  const uid = $props.id();
  const FAVORED_HATCH_ID = `free-energy-${uid}-favored-hatch`;
  const ENTHALPY_HATCH_ID = `free-energy-${uid}-enthalpy-hatch`;
  const REACTION_NAME = `free-energy-${uid}-reaction`;

  let reaction = $state<ReactionId>(START.reaction);
  let temperature = $state<number>(START.temperature);
  let hydrated = $state(false);

  const current = $derived(freeEnergyState(reaction, temperature));
  const rows = $derived(bars(reaction, temperature));
  const zero = $derived(zeroTemperature(reaction));

  const f = (value: number) => value.toFixed(1);
  const xFor = (kelvins: number) =>
    PLOT.left + ((kelvins - AXES.temperatureMin) / (AXES.temperatureMax - AXES.temperatureMin)) * (PLOT.right - PLOT.left);
  const yFor = (kJ: number) => PLOT.top + (AXES.energyMax - kJ) * UNITS_PER_KJ;
  const barY = (kJ: number) => BARS.top + (AXES.energyMax - kJ) * UNITS_PER_KJ;
  const ZERO_Y = yFor(0);
  const BAR_ZERO_Y = barY(0);

  // The four lines are fixed: drawn once from the module's values.
  const LINES = REACTION_IDS.map((id) => {
    const points = linePoints(id);
    return { id, d: `M${points.map((p, i) => `${i === 0 ? '' : 'L'}${f(xFor(p.temperature))} ${f(yFor(p.kJ))}`).join('')}` };
  });
  const others = $derived(LINES.filter((line) => line.id !== reaction));
  const chosen = $derived(LINES.find((line) => line.id === reaction));

  const favoredBacking = {
    x: FAVORED_LABEL.x - BACKING.padX,
    y: FAVORED_LABEL.baseline - BACKING.ascent - BACKING.padY,
    width: LABELS.favored.length * BACKING.charWidth + 2 * BACKING.padX,
    height: BACKING.ascent + BACKING.descent + 2 * BACKING.padY,
  };

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet hatch(id: string, lineClass: string)}
  <pattern {id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line class={lineClass} x1="3" y1="0" x2="3" y2="6" />
  </pattern>
{/snippet}

<div class="diagram-body" data-diagram="free-energy" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="graph">
      <figcaption class="diagram-panel-title" data-equation>{REACTIONS[reaction].equation}</figcaption>
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label={describeGraph(reaction, temperature)}>
        <defs>{@render hatch(FAVORED_HATCH_ID, 'free-energy-favored-hatch-line')}</defs>

        <!-- The favored half: below the zero line, hatched as well as tinted. -->
        <rect
          class="free-energy-favored"
          data-favored-region
          x={PLOT.left}
          y={f(ZERO_Y)}
          width={PLOT.right - PLOT.left}
          height={f(PLOT.bottom - ZERO_Y)}
          fill={`url(#${FAVORED_HATCH_ID})`}
        />

        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each AXES.energyTicks as tick (tick)}
          {@const y = f(yFor(tick))}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} />
          <text class="diagram-label" x={PLOT.left - 7} {y} dy="0.35em" text-anchor="end">{energyTickText(tick)}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(13 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>{LABELS.energyAxis}</text
        >
        {#each AXES.temperatureTicks as tick (tick)}
          {@const x = f(xFor(tick))}
          <line class="diagram-axis" data-tick-x={tick} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" {x} y={PLOT.bottom + TEMPERATURE_LABEL_GAP} text-anchor="middle">{temperatureTickText(tick)}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + TEMPERATURE_TITLE_GAP} text-anchor="middle"
          >{LABELS.temperatureAxis}</text
        >

        <line class="free-energy-zero" data-zero x1={PLOT.left} y1={f(ZERO_Y)} x2={PLOT.right} y2={f(ZERO_Y)} />

        <rect
          class="diagram-name-backing"
          data-name-backing="favored"
          x={f(favoredBacking.x)}
          y={f(favoredBacking.y)}
          width={f(favoredBacking.width)}
          height={f(favoredBacking.height)}
        />
        <text class="diagram-label free-energy-favored-label" data-favored-label x={FAVORED_LABEL.x} y={FAVORED_LABEL.baseline}>{LABELS.favored}</text>

        {#if zero}
          <line class="diagram-guide" data-guide x1={f(xFor(zero.exact))} y1={PLOT.top} x2={f(xFor(zero.exact))} y2={f(ZERO_Y)} />
          <text class="diagram-label free-energy-guide-name" data-guide-name x={f(xFor(zero.exact))} y={GUIDE_LABEL_Y} text-anchor="middle"
            >{zeroTemperatureText(reaction)}</text
          >
        {/if}

        {#each others as other (other.id)}
          <path class="diagram-curve is-faint is-pattern-1" data-line={other.id} d={other.d} />
        {/each}
        {#if chosen}
          <path class="diagram-curve is-accent" data-line={chosen.id} data-chosen-line d={chosen.d} />
        {/if}

        <circle class="diagram-marker" data-dot cx={f(xFor(temperature))} cy={f(yFor(current.freeKJ))} r="4" />
      </svg>
      <div class="molecule-key free-energy-key">
        <ul>
          <li data-key="chosen">
            <svg viewBox="0 0 36 14" aria-hidden="true"><line class="diagram-curve is-accent" x1="2" y1="7" x2="34" y2="7" /></svg>{REACTIONS[reaction].name}
          </li>
          <li data-key="other">
            <svg viewBox="0 0 36 14" aria-hidden="true"><line class="diagram-curve is-faint is-pattern-1" x1="2" y1="7" x2="34" y2="7" /></svg>{LABELS.otherLines}
          </li>
        </ul>
      </div>
    </figure>

    <figure class="diagram-plot" data-panel="bars">
      <figcaption class="diagram-panel-title">{LABELS.bars}</figcaption>
      <svg viewBox={`0 0 ${BARS.width} ${BARS.height}`} role="img" aria-label={describeBars(reaction, temperature)}>
        <defs>{@render hatch(ENTHALPY_HATCH_ID, 'free-energy-enthalpy-hatch-line')}</defs>
        {#each rows as row, i (row.id)}
          {@const center = barCenter(i)}
          {@const end = barY(row.kJ)}
          {@const top = Math.min(end, BAR_ZERO_Y)}
          <rect
            class={`free-energy-bar is-${row.id}`}
            data-bar={row.id}
            x={center - BAR.width / 2}
            y={f(top)}
            width={BAR.width}
            height={f(Math.abs(end - BAR_ZERO_Y))}
            fill={row.id === 'enthalpy' ? `url(#${ENTHALPY_HATCH_ID})` : undefined}
          />
          <text
            class="diagram-label free-energy-bar-value"
            data-bar-value={row.id}
            x={center}
            y={f(row.kJ >= 0 ? end - BAR.valueAbove : end + BAR.valueBelow)}
            text-anchor="middle">{row.text}</text
          >
          <text class="diagram-label free-energy-bar-name" data-bar-name={row.id} x={center} y={BAR.nameY} text-anchor="middle">{row.name}</text>
        {/each}
        <line class="free-energy-zero" data-bar-zero x1={BAR.lineLeft} y1={f(BAR_ZERO_Y)} x2={BAR.lineRight} y2={f(BAR_ZERO_Y)} />
        <text class="diagram-label" data-bar-zero-label x={BAR.lineLeft - 6} y={f(BAR_ZERO_Y)} dy="0.35em" text-anchor="end">0</text>
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes. The slider comes first, so that on a small phone it
       is on the screen with the graph while it moves. -->
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{LABELS.slider}</span>
        <span class="diagram-slider-value" aria-hidden="true">{temperatureText(temperature)}</span>
      </span>
      <input
        type="range"
        min={TEMPERATURE.min}
        max={TEMPERATURE.max}
        step={TEMPERATURE.step}
        aria-valuetext={temperatureValueText(temperature)}
        bind:value={temperature}
      />
    </label>
    <fieldset class="diagram-choice is-wide">
      <legend>{LABELS.choice}</legend>
      {#each REACTION_IDS as id (id)}
        <label><input type="radio" name={REACTION_NAME} value={id} bind:group={reaction} />{REACTIONS[id].label}</label>
      {/each}
    </fieldset>
  </div>

  <p class="diagram-readout" role="status">{readout(reaction, temperature)}</p>
</div>
