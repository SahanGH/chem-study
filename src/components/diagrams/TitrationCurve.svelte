<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ACID_IDS,
    ACIDS,
    AXES,
    BAR_MAX_MICROMOLES,
    EQUIVALENCE_ML,
    HALF_EQUIVALENCE_ML,
    INDICATOR_CHOICES,
    INDICATOR_LABELS,
    LABELS,
    START,
    VOLUME,
    band,
    bars,
    bufferMark,
    curve,
    describeBars,
    describeGraph,
    keyItems,
    readout,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as titrationCurveState,
    volumeText,
    volumeValueText,
    type AcidId,
    type CurvePoint,
    type IndicatorChoice,
  } from '../../lib/titration-curve';

  // Both drawings are 320 units wide and their text is 12, so the text is
  // 12 px when a drawing itself is shown 320 px wide: the ratio of the site's
  // figures (18 on 480). They are stacked at every width, as in the
  // calorimetry explorer.
  const GRAPH = { width: 320, height: 262 };
  // No text stands inside the plot, so the marker line and its dot, which
  // move over the whole plot, can meet no label:
  // - the two guides are named above the plot, each centered on its line, on
  //   two rows, "half-equivalence point" (lactic acid only) above
  //   "equivalence point";
  // - an indicator's band is named right of the plot, where the marker never
  //   goes: its base color just above the band, its acid color just below;
  // - the curves and the buffer region are named in the key under the graph.
  // A browser test sweeps every setting to check it.
  const PLOT = { left: 44, right: 272, top: 40, bottom: 222 };
  const HALF_LABEL_Y = 14;
  const EQUIVALENCE_LABEL_Y = 30;
  const BAND_NAME_GAP = 6;
  const BAND_NAME_ABOVE = 4;
  const BAND_NAME_BELOW = 12;

  // The bars: a name at the left, the bar, and its amount at its end. A full
  // bar is 3.00 mmol, the most there can be.
  const BARS = { width: 320, height: 108 };
  const BAR = { nameRight: 120, left: 128, maxWidth: 120, height: 20, valueGap: 6, rows: [18, 54, 90] as const };

  // The ids are unique to this instance, so that two explorers on one page
  // cannot share a hatching or a group of radio buttons. $props.id() gives the
  // same id when the page is built and when the script takes over.
  const uid = $props.id();
  const HATCH_ID = `titration-curve-${uid}-hatch`;
  const KEY_HATCH_ID = `titration-curve-${uid}-key-hatch`;
  const ACID_NAME = `titration-curve-${uid}-acid`;
  const INDICATOR_NAME = `titration-curve-${uid}-indicator`;

  let acid = $state<AcidId>(START.acid);
  let volume = $state<number>(START.volume);
  let indicator = $state<IndicatorChoice>(START.indicator);
  let hydrated = $state(false);

  const current = $derived(titrationCurveState(acid, volume));
  const flask = $derived(bars(acid, volume));
  const drawnBand = $derived(indicator === 'none' ? null : band(indicator));
  const key = $derived(keyItems(acid, indicator));

  const f = (value: number) => value.toFixed(1);
  const xFor = (mL: number) => PLOT.left + (mL / AXES.volumeMax) * (PLOT.right - PLOT.left);
  const yFor = (pH: number) => PLOT.bottom - (pH / AXES.pHMax) * (PLOT.bottom - PLOT.top);
  const pathOf = (points: readonly CurvePoint[]) =>
    `M${points.map((p, i) => `${i === 0 ? '' : 'L'}${f(xFor(p.volume))} ${f(yFor(p.pH))}`).join('')}`;
  const barWidth = (micromoles: number) => (micromoles / BAR_MAX_MICROMOLES) * BAR.maxWidth;

  // The curves and the buffer mark are fixed: drawn once from the module's values.
  const CURVES = ACID_IDS.map((id) => ({ id, d: pathOf(curve(id)) }));
  const BUFFER_PATH = pathOf(bufferMark());
  const others = $derived(CURVES.filter((c) => c.id !== acid));
  const chosen = $derived(CURVES.find((c) => c.id === acid));

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet hatch(id: string)}
  <pattern {id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line class="titration-curve-hatch-line" x1="0" y1="0" x2="0" y2="6" />
  </pattern>
{/snippet}

<div class="diagram-body" data-diagram="titration-curve" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="graph">
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label={describeGraph(acid, volume, indicator)}>
        <defs>{@render hatch(HATCH_ID)}</defs>

        {#if drawnBand}
          <rect
            class="titration-curve-band"
            data-band={indicator}
            x={PLOT.left}
            y={f(yFor(drawnBand.high))}
            width={PLOT.right - PLOT.left}
            height={f(yFor(drawnBand.low) - yFor(drawnBand.high))}
            fill={`url(#${HATCH_ID})`}
          />
        {/if}

        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each AXES.pHTicks as tick (tick)}
          {@const y = f(yFor(tick))}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} />
          <text class="diagram-label" x={PLOT.left - 7} {y} dy="0.35em" text-anchor="end">{tick}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(14 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>{LABELS.pHAxis}</text
        >
        {#each AXES.volumeTicks as tick (tick)}
          {@const x = f(xFor(tick))}
          <line class="diagram-axis" data-tick-x={tick} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" {x} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >{LABELS.volumeAxis}</text
        >

        {#if !ACIDS[acid].strong}
          <!-- The buffer region, a broad untextured stroke along the curve: told from an indicator's band by its lack of hatching. -->
          <path class="titration-curve-buffer" data-buffer d={BUFFER_PATH} />
          <line
            class="diagram-guide is-dotted"
            data-guide="half"
            x1={f(xFor(HALF_EQUIVALENCE_ML))}
            y1={PLOT.top}
            x2={f(xFor(HALF_EQUIVALENCE_ML))}
            y2={PLOT.bottom}
          />
          <text class="diagram-label" data-guide-name="half" x={f(xFor(HALF_EQUIVALENCE_ML))} y={HALF_LABEL_Y} text-anchor="middle"
            >{LABELS.half}</text
          >
        {/if}
        <line
          class="diagram-guide is-dotted"
          data-guide="equivalence"
          x1={f(xFor(EQUIVALENCE_ML))}
          y1={PLOT.top}
          x2={f(xFor(EQUIVALENCE_ML))}
          y2={PLOT.bottom}
        />
        <text class="diagram-label" data-guide-name="equivalence" x={f(xFor(EQUIVALENCE_ML))} y={EQUIVALENCE_LABEL_Y} text-anchor="middle"
          >{LABELS.equivalence}</text
        >

        {#each others as other (other.id)}
          <path class="diagram-curve is-faint is-pattern-1" data-curve={other.id} d={other.d} />
        {/each}
        {#if chosen}
          <path class="diagram-curve is-accent" data-curve={chosen.id} data-chosen-curve d={chosen.d} />
        {/if}

        <line class="diagram-chosen" data-chosen x1={f(xFor(volume))} y1={PLOT.bottom} x2={f(xFor(volume))} y2={PLOT.top} />
        <circle class="diagram-marker" data-dot cx={f(xFor(volume))} cy={f(yFor(current.pH))} r="4" />

        {#if drawnBand}
          <text
            class="diagram-label titration-curve-band-name"
            data-band-name="above"
            x={PLOT.right + BAND_NAME_GAP}
            y={f(yFor(drawnBand.high) - BAND_NAME_ABOVE)}>{drawnBand.above}</text
          >
          <text
            class="diagram-label titration-curve-band-name"
            data-band-name="below"
            x={PLOT.right + BAND_NAME_GAP}
            y={f(yFor(drawnBand.low) + BAND_NAME_BELOW)}>{drawnBand.below}</text
          >
        {/if}
      </svg>
      <div class="molecule-key titration-curve-key">
        <ul>
          {#each key as item (item.kind)}
            <li data-key={item.kind}>
              <svg viewBox="0 0 36 14" aria-hidden="true">
                {#if item.kind === 'chosen'}
                  <line class="diagram-curve is-accent" x1="2" y1="7" x2="34" y2="7" />
                {:else if item.kind === 'other'}
                  <line class="diagram-curve is-faint is-pattern-1" x1="2" y1="7" x2="34" y2="7" />
                {:else if item.kind === 'buffer'}
                  <line class="titration-curve-buffer" x1="6" y1="7" x2="30" y2="7" />
                {:else}
                  <defs>{@render hatch(KEY_HATCH_ID)}</defs>
                  <rect class="titration-curve-band" x="1" y="1" width="34" height="12" fill={`url(#${KEY_HATCH_ID})`} />
                {/if}
              </svg>{item.text}
            </li>
          {/each}
        </ul>
      </div>
    </figure>

    <figure class="diagram-plot" data-panel="bars">
      <figcaption class="diagram-panel-title">{LABELS.bars}</figcaption>
      <svg viewBox={`0 0 ${BARS.width} ${BARS.height}`} role="img" aria-label={describeBars(acid, volume)}>
        <line class="diagram-axis" x1={BAR.left} y1="4" x2={BAR.left} y2={BARS.height - 4} />
        {#each flask.rows as row, i (row.id)}
          <!-- Hydrobromic acid's OH⁻ bar keeps the third place, so that it lines up with lactic acid's. -->
          {@const y = BAR.rows[row.id === 'excess' ? 2 : i] ?? 0}
          {@const width = barWidth(row.micromoles)}
          <text class="diagram-label titration-curve-bar-name" data-bar-name={row.id} x={BAR.nameRight} {y} dy="0.35em" text-anchor="end"
            >{row.name}</text
          >
          <rect class="diagram-bar" data-bar={row.id} x={BAR.left} y={y - BAR.height / 2} width={f(width)} height={BAR.height} />
          <text class="diagram-label titration-curve-bar-value" data-bar-value={row.id} x={f(BAR.left + width + BAR.valueGap)} {y} dy="0.35em"
            >{row.text}</text
          >
        {/each}
        {#if flask.spectators}
          <text class="diagram-label" data-spectators x={BAR.left + BAR.valueGap} y={BAR.rows[1]} dy="0.35em">{flask.spectators}</text>
        {/if}
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes. The slider comes first, so that on a small phone it
       is on the screen with the graph while it moves. -->
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>NaOH added</span>
        <span class="diagram-slider-value" aria-hidden="true">{volumeText(volume)}</span>
      </span>
      <input
        type="range"
        min={VOLUME.min}
        max={VOLUME.max}
        step={VOLUME.step}
        aria-valuetext={volumeValueText(volume)}
        bind:value={volume}
      />
    </label>
    <fieldset class="diagram-choice is-wide">
      <legend>Acid in the flask</legend>
      {#each ACID_IDS as id (id)}
        <label><input type="radio" name={ACID_NAME} value={id} bind:group={acid} />{ACIDS[id].label}</label>
      {/each}
    </fieldset>
    <fieldset class="diagram-choice is-wide">
      <legend>Indicator</legend>
      {#each INDICATOR_CHOICES as id (id)}
        <label><input type="radio" name={INDICATOR_NAME} value={id} bind:group={indicator} />{INDICATOR_LABELS[id]}</label>
      {/each}
    </fieldset>
  </div>

  <p class="diagram-readout" role="status">{readout(acid, volume, indicator)}</p>
</div>
