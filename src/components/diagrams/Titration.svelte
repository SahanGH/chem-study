<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ACID_IDS,
    ACIDS,
    AXES,
    MICROMOLES_PER_MILLIMOLE,
    VOLUME,
    describeFlask,
    describeGraph,
    equivalenceVolume,
    linePoints,
    readout,
    shownVolume,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as titrationState,
    volumeText,
    type AcidId,
    type GraphPoint,
  } from '../../lib/titration';

  // The graph is drawn 320 units wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). Shown narrower, it is smaller in proportion.
  const GRAPH = { width: 320, height: 222 };
  // The room above the plot holds the equivalence point's label and, for
  // tartaric acid, the first line of the protons line's name, with the
  // glyphs' height to spare.
  const PLOT = { left: 46, right: 306, top: 36, bottom: 178 };
  const MILLIMOLE_TICKS = [0, 1, 2, 3, 4, 5, 6];
  const VOLUME_TICKS = [0, 10, 20, 30, 40];

  // Each line is named where it cannot meet the other lines, the dotted line
  // at the equivalence point or the other name, for both acids:
  // - "acidic protons left" sits just above the start of the solid line, in
  //   two lines, left of the equivalence line even for lactic acid (15 mL);
  // - "OH⁻ in excess" sits above the end of the dashed line, in two lines,
  //   right of the equivalence line even for tartaric acid (30 mL).
  // The marker's dot is clear of both names at every volume: that is why the
  // protons name is 12 units above its line, not fewer. A browser test sweeps
  // both acids over all 81 volumes to check it.
  const PROTONS_NAME = ['acidic', 'protons left'] as const;
  const EXCESS_NAME = ['OH⁻', 'in excess'] as const;
  const LINE_HEIGHT = 13;
  const NAME_GAP = 12;
  const PROTONS_NAME_INSET = 8;
  const EXCESS_NAME_INSET = 3;
  const EXCESS_NAME_ABOVE_END = 2 * LINE_HEIGHT;
  const EQUIVALENCE_LABEL_ABOVE_PLOT = 10;

  // Each name has a card-colored backing behind it, so that the marker line is
  // broken cleanly where it crosses a name; the name's own outline stays too.
  // The backing is sized from the longer line and from the glyphs' height
  // (capitals 0.73 em, descenders 0.21 em of 12). Inter bold at 12 measures
  // 5.7 to 6.1 per character here ("protons left" 68.3, "in excess" 54.9), so
  // 6.2 covers it; it cannot be more generous, or the excess name's backing
  // would reach tartaric acid's equivalence line.
  const BACKING = { charWidth: 6.2, ascent: 9, descent: 3, padX: 2, padY: 1 };
  const backingFor = (lines: readonly [string, string], left: number, firstBaseline: number, anchor: 'start' | 'end') => {
    const longest = Math.max(...lines.map((line) => line.length)) * BACKING.charWidth;
    return {
      x: (anchor === 'start' ? left : left - longest) - BACKING.padX,
      y: firstBaseline - BACKING.ascent - BACKING.padY,
      width: longest + 2 * BACKING.padX,
      height: BACKING.ascent + LINE_HEIGHT + BACKING.descent + 2 * BACKING.padY,
    };
  };

  // The flask drawing, in its own units. It holds no text: its color word is
  // HTML beside it, so that the drawing can be small. The liquid is a plain
  // rectangle clipped by the glass's own outline, so the two cannot drift apart.
  const FLASK_DRAWING = { width: 160, height: 216, liquidTop: 170 };
  const GLASS_OUTLINE = 'M66 100 V130 L20 200 Q15 210 30 210 H130 Q145 210 140 200 L94 130 V100';
  const CLIP_ID = 'titration-flask-clip';

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
    const mL = (PROTONS_NAME_INSET / (PLOT.right - PLOT.left)) * AXES.volumeMax;
    return lines.protonsLeft[0].micromoles * (1 - mL / equivalence);
  });
  const protonsFirstBaseline = $derived(yFor(protonsLineAtName) - NAME_GAP - LINE_HEIGHT);
  const excessFirstBaseline = $derived(yFor(lines.excess[2].micromoles) - EXCESS_NAME_ABOVE_END);
  const protonsX = PLOT.left + PROTONS_NAME_INSET;
  const excessX = PLOT.right - EXCESS_NAME_INSET;
  const protonsBacking = $derived(backingFor(PROTONS_NAME, protonsX, protonsFirstBaseline, 'start'));
  const excessBacking = $derived(backingFor(EXCESS_NAME, excessX, excessFirstBaseline, 'end'));

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="titration" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-beside">
    <figure class="diagram-plot is-flask" data-panel="flask">
      <div class="titration-flask">
        <svg
          viewBox={`0 0 ${FLASK_DRAWING.width} ${FLASK_DRAWING.height}`}
          role="img"
          aria-label={describeFlask(acidId, volume)}
        >
          <defs>
            <clipPath id={CLIP_ID}><path d={GLASS_OUTLINE} /></clipPath>
          </defs>
          <!-- The buret: a tube, a stopcock and a tip over the flask. -->
          <rect class="titration-glass" x="71" y="4" width="18" height="62" rx="2" />
          <rect class="titration-glass" x="66" y="62" width="28" height="5" rx="1" />
          <path class="titration-glass" d="M76 67 L84 67 L81 80 L79 80 Z" />
          <rect
            class={`titration-liquid is-${current.flask}`}
            data-liquid
            data-color={current.flask}
            x="0"
            y={FLASK_DRAWING.liquidTop}
            width={FLASK_DRAWING.width}
            height={FLASK_DRAWING.height - FLASK_DRAWING.liquidTop}
            clip-path={`url(#${CLIP_ID})`}
          />
          <path class="titration-glass is-open" data-glass-outline d={GLASS_OUTLINE} />
          <path class="titration-glass is-open" d="M60 100 H100" />
        </svg>
        <!-- The word beside the flask, so that the shade never carries the color alone. -->
        <p class="titration-flask-word" data-flask-label>{current.flask}</p>
      </div>
    </figure>

    <figure class="diagram-plot" data-panel="graph">
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
        <!-- The names come last, each over its card-colored backing, so that the marker
             line is broken cleanly where it crosses one. -->
        <rect
          class="diagram-name-backing"
          data-name-backing="protons"
          x={f(protonsBacking.x)}
          y={f(protonsBacking.y)}
          width={f(protonsBacking.width)}
          height={f(protonsBacking.height)}
        />
        <text
          class="diagram-label diagram-curve-name is-selected"
          data-line-name="protons"
          x={protonsX}
          y={f(protonsFirstBaseline)}
          >{PROTONS_NAME[0]} <tspan x={protonsX} dy={LINE_HEIGHT}>{PROTONS_NAME[1]}</tspan></text
        >
        <rect
          class="diagram-name-backing"
          data-name-backing="excess"
          x={f(excessBacking.x)}
          y={f(excessBacking.y)}
          width={f(excessBacking.width)}
          height={f(excessBacking.height)}
        />
        <text
          class="diagram-label diagram-curve-name is-ink"
          data-line-name="excess"
          x={excessX}
          y={f(excessFirstBaseline)}
          text-anchor="end"
          >{EXCESS_NAME[0]} <tspan x={excessX} dy={LINE_HEIGHT}>{EXCESS_NAME[1]}</tspan></text
        >
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes: the student sees the flask change while the slider is moved. -->
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

  <p class="diagram-readout" role="status">{readout(acidId, volume)}</p>
</div>
