<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ACID_IDS,
    ACIDS,
    AXES,
    BOX,
    GUIDE_PERCENT,
    KEY,
    SLIDER,
    START,
    concentrationText,
    concentrationValueText,
    countText,
    curve,
    describeBox,
    describeGraph,
    particles,
    readout,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as weakAcidState,
    type AcidId,
  } from '../../lib/weak-acid';

  // The graph is drawn 320 units wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480).
  const GRAPH = { width: 320, height: 236 };
  // The plot stops well short of the right edge: the three curves are named
  // there, past their right-hand ends, and so is the 5 percent line. The
  // marker never goes right of the plot, so it can meet none of those names;
  // and the ends lie far apart (67, 34 and 12 percent, with the line at 5).
  // A browser test sweeps all thirty settings to check it.
  const PLOT = { left: 50, right: 232, top: 16, bottom: 196 };
  const NAME_GAP = 8;

  // Each curve not chosen keeps its own dash pattern, so the two faint curves
  // differ from each other by more than position; the chosen one is solid and heavy.
  const PATTERN: Record<AcidId, string> = {
    chloroacetic: 'is-pattern-1',
    formic: 'is-pattern-2',
    butanoic: 'weak-acid-pattern-3',
  };

  // The ids are unique to this instance, so that two explorers on one page
  // cannot share a group of radio buttons. $props.id() gives the same id when
  // the page is built and when the script takes over.
  const uid = $props.id();
  const RADIO_NAME = `weak-acid-${uid}-acid`;

  // The box's frame sits just inside the drawing.
  const FRAME_INSET = 0.75;

  let acid = $state<AcidId>(START.acid);
  let position = $state<number>(START.position);
  let hydrated = $state(false);

  const current = $derived(weakAcidState(acid, position));
  const drawn = $derived(particles(acid, position));

  const f = (value: number) => value.toFixed(1);
  const xFor = (log: number) => PLOT.left + ((AXES.logLeft - log) / (AXES.logLeft - AXES.logRight)) * (PLOT.right - PLOT.left);
  const yFor = (percent: number) => PLOT.bottom - (percent / AXES.percentMax) * (PLOT.bottom - PLOT.top);

  // The three curves are fixed: drawn once from the module's values.
  const CURVES = ACID_IDS.map((id) => {
    const points = curve(id);
    const end = points.at(-1);
    if (!end) throw new Error('A curve has points.');
    return {
      id,
      d: `M${points.map((p, i) => `${i === 0 ? '' : 'L'}${f(xFor(p.logConcentration))} ${f(yFor(p.percent))}`).join('')}`,
      nameY: yFor(end.percent),
    };
  });
  const others = $derived(CURVES.filter((c) => c.id !== acid));
  const chosen = $derived(CURVES.find((c) => c.id === acid));

  const plusPath = (x: number, y: number) =>
    `M${f(x - BOX.plusArm)} ${f(y)}H${f(x + BOX.plusArm)}M${f(x)} ${f(y - BOX.plusArm)}V${f(y + BOX.plusArm)}`;
  const minusPath = (x: number, y: number) => `M${f(x - BOX.minusArm)} ${f(y)}H${f(x + BOX.minusArm)}`;

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet wholeMolecule(x: number, y: number)}
  <circle class="diagram-atom" data-particle="whole" cx={x} cy={y} r={BOX.wholeRadius} />
{/snippet}

{#snippet ionPair(x: number, y: number)}
  <g data-particle="pair">
    <circle class="weak-acid-hydronium" cx={x + BOX.hydroniumOffset} cy={y} r={BOX.hydroniumRadius} />
    <path class="weak-acid-plus" d={plusPath(x + BOX.hydroniumOffset, y)} />
    <circle class="weak-acid-anion" cx={x + BOX.anionOffset} cy={y} r={BOX.anionRadius} />
    <path class="weak-acid-minus" d={minusPath(x + BOX.anionOffset, y)} />
  </g>
{/snippet}

<div class="diagram-body" data-diagram="weak-acid" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-beside">
    <figure class="diagram-plot weak-acid-box" data-panel="box">
      <svg viewBox={`0 0 ${BOX.size} ${BOX.size}`} role="img" aria-label={describeBox(acid, position)}>
        <rect
          class="molecule-box"
          x={FRAME_INSET}
          y={FRAME_INSET}
          width={BOX.size - 2 * FRAME_INSET}
          height={BOX.size - 2 * FRAME_INSET}
          rx="8"
        />
        {#each drawn as particle, cell (cell)}
          {#if particle.ionized}
            {@render ionPair(particle.x, particle.y)}
          {:else}
            {@render wholeMolecule(particle.x, particle.y)}
          {/if}
        {/each}
      </svg>
      <p class="weak-acid-count" data-count>{countText(acid, position)}</p>
      <div class="molecule-key weak-acid-key">
        <ul>
          <li data-key-particle="whole">
            <svg viewBox="-12 -10 24 20" aria-hidden="true">{@render wholeMolecule(0, 0)}</svg>{KEY.whole}
          </li>
          <li data-key-particle="pair">
            <svg viewBox="-12 -10 24 20" aria-hidden="true">{@render ionPair(0, 0)}</svg>{KEY.pair}
          </li>
        </ul>
      </div>
    </figure>

    <figure class="diagram-plot" data-panel="graph">
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} role="img" aria-label={describeGraph(acid, position)}>
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each AXES.percentTicks as tick (tick)}
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
          transform={`translate(13 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>percent ionized</text
        >
        {#each AXES.concentrationTicks as tick (tick.log)}
          {@const x = f(xFor(tick.log))}
          <line class="diagram-axis" data-tick-x={tick.text} x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} />
          <text class="diagram-label" {x} y={PLOT.bottom + 17} text-anchor="middle">{tick.text}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >starting concentration (M)</text
        >

        <line
          class="diagram-guide"
          data-guide="check"
          x1={PLOT.left}
          y1={f(yFor(GUIDE_PERCENT))}
          x2={PLOT.right}
          y2={f(yFor(GUIDE_PERCENT))}
        />
        {#each others as other (other.id)}
          <path class={`diagram-curve is-faint ${PATTERN[other.id]}`} data-curve={other.id} d={other.d} />
        {/each}
        {#if chosen}
          <path class="diagram-curve is-accent" data-curve={chosen.id} data-chosen-curve d={chosen.d} />
        {/if}

        <!-- The marker line stops at the axis, clear of the concentration labels under it. -->
        <line
          class="diagram-chosen"
          data-chosen
          x1={f(xFor(current.logConcentration))}
          y1={PLOT.bottom}
          x2={f(xFor(current.logConcentration))}
          y2={PLOT.top}
        />
        <circle class="diagram-marker" data-dot cx={f(xFor(current.logConcentration))} cy={f(yFor(current.percent))} r="4" />

        {#each CURVES as named (named.id)}
          <text
            class={`diagram-label diagram-curve-name${named.id === acid ? ' is-selected' : ''}`}
            data-curve-name={named.id}
            x={PLOT.right + NAME_GAP}
            y={f(named.nameY)}
            dy="0.35em">{ACIDS[named.id].shortName}</text
          >
        {/each}
        <text class="diagram-label" data-guide-name="check" x={PLOT.right + NAME_GAP} y={f(yFor(GUIDE_PERCENT))} dy="0.35em"
          >{GUIDE_PERCENT} percent</text
        >
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes. The slider comes first, so that on a small phone it
       is on the screen with the box and the graph while it moves. -->
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Starting concentration</span>
        <span class="diagram-slider-value" aria-hidden="true">{concentrationText(position)} M</span>
      </span>
      <input
        type="range"
        min={SLIDER.min}
        max={SLIDER.max}
        step={SLIDER.step}
        aria-valuetext={concentrationValueText(position)}
        bind:value={position}
      />
    </label>
    <fieldset class="diagram-choice is-wide">
      <legend>Acid</legend>
      {#each ACID_IDS as id (id)}
        <label><input type="radio" name={RADIO_NAME} value={id} bind:group={acid} />{ACIDS[id].label}</label>
      {/each}
    </fieldset>
  </div>

  <p class="diagram-readout" role="status">{readout(acid, position)}</p>
</div>
