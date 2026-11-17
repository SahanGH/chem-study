<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ACIDS,
    AXES,
    VOLUME,
    describeFlask,
    describeGraph,
    equivalenceVolume,
    linePoints,
    readout,
    shownVolume,
    state as titrationState,
    volumeText,
    type AcidId,
    type GraphPoint,
  } from '../../lib/titration';

  // The module's `state` is imported under another name: a variable called
  // `state` makes Svelte read the `$state` rune as a store subscription to it.
  const ACID_IDS: readonly AcidId[] = ['lactic', 'tartaric'];

  // The graph is drawn 320 units wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). Shown narrower, it is smaller in proportion.
  const GRAPH = { width: 320, height: 216 };
  // The room above the plot holds the equivalence point's label and, for
  // tartaric acid, the first line of the protons line's name.
  const PLOT = { left: 46, right: 306, top: 30, bottom: 172 };
  const MILLIMOLE_TICKS = [0, 1, 2, 3, 4, 5, 6];
  const VOLUME_TICKS = [0, 10, 20, 30, 40];
  const MICROMOLES_PER_MILLIMOLE = 1000;

  // Each line is named where it cannot meet the other lines, the dotted line
  // at the equivalence point or the other name, for both acids:
  // - "acidic protons left" sits just above the start of the solid line, in
  //   two lines, left of the equivalence line even for lactic acid (15 mL);
  // - "OH⁻ in excess" sits above the end of the dashed line, in two lines,
  //   right of the equivalence line even for tartaric acid (30 mL).
  // A browser test measures that for both acids.
  const LINE_HEIGHT = 13;
  const NAME_GAP = 8;
  const PROTONS_NAME_INSET = 8;
  const EXCESS_NAME_INSET = 6;
  const EXCESS_NAME_ABOVE_END = 2 * LINE_HEIGHT;
  const EQUIVALENCE_LABEL_ABOVE_PLOT = 10;

  // The flask drawing, in its own units (160 wide, with its text at 12).
  const FLASK = { width: 160, height: 240, center: 80, labelY: 232 };

  let acidId = $state<AcidId>('lactic');
  let volume = $state<number>(VOLUME.start);
  let hydrated = $state(false);

  const current = $derived(titrationState(acidId, volume));
  const lines = $derived(linePoints(acidId));
  const equivalence = $derived(equivalenceVolume(acidId));

  const f = (value: number) => value.toFixed(1);
  const xFor = (mL: number) => PLOT.left + (mL / AXES.volumeMax) * (PLOT.right - PLOT.left);
  const yFor = (micromoles: number) => PLOT.bottom - (micromoles / AXES.micromolesMax) * (PLOT.bottom - PLOT.top);
  const pathOf = (points: readonly GraphPoint[]) =>
    `M${points.map((point, index) => `${index === 0 ? '' : 'L'}${f(xFor(point.volume))} ${f(yFor(point.micromoles))}`).join('')}`;

  // Where the solid line is, in micromoles, a few units in from its start.
  const protonsLineAtName = $derived.by(() => {
    const mL = ((PROTONS_NAME_INSET / (PLOT.right - PLOT.left)) * AXES.volumeMax);
    return current.start * (1 - mL / equivalence);
  });
  const protonsNameY = $derived(yFor(protonsLineAtName) - NAME_GAP);
  const excessNameY = $derived(yFor(titrationState(acidId, VOLUME.max).excess) - EXCESS_NAME_ABOVE_END);

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="titration" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-beside">
    <figure class="diagram-plot is-flask" data-panel="flask">
      <figcaption class="diagram-panel-title">Flask</figcaption>
      <svg
        viewBox={`0 0 ${FLASK.width} ${FLASK.height}`}
        role="img"
        aria-label={describeFlask(acidId, volume)}
      >
        <!-- The buret: a tube, a stopcock and a tip over the flask. -->
        <rect class="titration-glass" x="71" y="4" width="18" height="62" rx="2" />
        <rect class="titration-glass" x="66" y="62" width="28" height="5" rx="1" />
        <path class="titration-glass" d="M76 67 L84 67 L81 80 L79 80 Z" />
        <text class="diagram-label" x="96" y="36">buret</text>
        <path
          class={`titration-liquid is-${current.flask}`}
          data-liquid
          data-color={current.flask}
          d="M39.7 170 L120.3 170 L140 200 Q145 210 130 210 L30 210 Q15 210 20 200 Z"
        />
        <path class="titration-glass is-open" d="M66 100 V130 L20 200 Q15 210 30 210 H130 Q145 210 140 200 L94 130 V100" />
        <path class="titration-glass is-open" d="M60 100 H100" />
        <!-- The word is drawn under the flask, so that the shade alone never carries the color. -->
        <text class="diagram-label is-selected" data-flask-label x={FLASK.center} y={FLASK.labelY} text-anchor="middle"
          >{current.flask}</text
        >
      </svg>
    </figure>

    <figure class="diagram-plot" data-panel="graph">
      <figcaption class="diagram-panel-title">Amounts</figcaption>
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label={describeGraph(acidId, volume)}>
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each MILLIMOLE_TICKS as tick (tick)}
          {@const y = f(yFor(tick * MICROMOLES_PER_MILLIMOLE))}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} />
          <text class="diagram-label" x={PLOT.left - 7} {y} dy="0.35em" text-anchor="end">{tick}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(14 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>amount (mmol)</text
        >
        {#each VOLUME_TICKS as tick (tick)}
          {@const x = f(xFor(tick))}
          <line class="diagram-axis" data-tick-x={tick} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" {x} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >base added (mL)</text
        >

        <line
          class="diagram-guide is-dotted"
          data-equivalence
          x1={f(xFor(equivalence))}
          y1={PLOT.top}
          x2={f(xFor(equivalence))}
          y2={PLOT.bottom}
        />
        <text
          class="diagram-label"
          data-equivalence-label
          x={f(xFor(equivalence))}
          y={PLOT.top - EQUIVALENCE_LABEL_ABOVE_PLOT}
          text-anchor="middle">equivalence point</text
        >
        <path class="diagram-curve is-accent" data-line="protons" d={pathOf(lines.protonsLeft)} />
        <path class="diagram-curve is-dashed" data-line="excess" d={pathOf(lines.excess)} />
        <line
          class="diagram-chosen"
          data-chosen
          x1={f(xFor(volume))}
          y1={PLOT.bottom + 4}
          x2={f(xFor(volume))}
          y2={PLOT.top}
        />
        <circle class="diagram-marker is-ink" data-dot="excess" cx={f(xFor(volume))} cy={f(yFor(current.excess))} r="4" />
        <circle class="diagram-marker" data-dot="protons" cx={f(xFor(volume))} cy={f(yFor(current.protonsLeft))} r="4" />
        <!-- Drawn last, so that the outline around each name hides the marker line where it crosses one. -->
        <text
          class="diagram-label diagram-curve-name is-selected"
          data-line-name="protons"
          x={PLOT.left + PROTONS_NAME_INSET}
          y={f(protonsNameY - LINE_HEIGHT)}
          >acidic <tspan x={PLOT.left + PROTONS_NAME_INSET} dy={LINE_HEIGHT}>protons left</tspan></text
        >
        <text
          class="diagram-label diagram-curve-name is-ink"
          data-line-name="excess"
          x={PLOT.right - EXCESS_NAME_INSET}
          y={f(excessNameY)}
          text-anchor="end"
          >OH⁻ <tspan x={PLOT.right - EXCESS_NAME_INSET} dy={LINE_HEIGHT}>in excess</tspan></text
        >
      </svg>
    </figure>
  </div>

  <p class="diagram-readout" role="status">{readout(acidId, volume)}</p>
  <div class="diagram-controls">
    <fieldset class="diagram-choice is-wide">
      <legend>Acid in the flask</legend>
      {#each ACID_IDS as id (id)}
        <label><input type="radio" name="titration-acid" value={id} bind:group={acidId} />{ACIDS[id].label}</label>
      {/each}
    </fieldset>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Base added</span>
        <span class="diagram-slider-value" aria-hidden="true">{shownVolume(volume)} mL</span>
      </span>
      <input
        type="range"
        min={VOLUME.min}
        max={VOLUME.max}
        step={VOLUME.step}
        aria-valuetext={volumeText(volume)}
        bind:value={volume}
      />
    </label>
  </div>
</div>
