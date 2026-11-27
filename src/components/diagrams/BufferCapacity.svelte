<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ADDED,
    AMOUNT,
    BAR_MAX_MMOL,
    LABELS,
    SCALE,
    START,
    addedText,
    addedValueText,
    amountText,
    amountValueText,
    bars,
    describeBars,
    describeScales,
    readout,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as bufferCapacityState,
  } from '../../lib/buffer-capacity';

  // Both drawings are 320 units wide and their text is 12, so the text is
  // 12 px when a drawing itself is shown 320 px wide: the ratio of the site's
  // figures (18 on 480). They are stacked at every width, as in the
  // titration-curve explorer.
  //
  // The scales: two horizontal lines from pH 0 to 14, the buffer's above the
  // water's. Each is titled above its left end and ticked below, and its
  // markers sit on the line: a hollow ring at the pH before the addition and
  // a filled dot, smaller, at the pH after, so that the dot shows inside the
  // ring when the two are close. The titles are far enough above the line and
  // the tick labels far enough below it that a marker at any pH meets neither.
  // A browser test sweeps the settings to check it.
  const SCALES = { width: 320, height: 154 };
  const AXIS = { left: 20, right: 300 };
  const ROWS = [
    { id: 'buffer', title: LABELS.buffer, titleY: 22, lineY: 44 },
    { id: 'water', title: LABELS.water, titleY: 100, lineY: 122 },
  ] as const;
  const TICK_LENGTH = 5;
  const TICK_LABEL_GAP = 24;
  const RING_RADIUS = 7;
  const DOT_RADIUS = 4.5;

  // The bars: upright, on one baseline, half a unit for each mmol, so that the
  // most there can be (250 mmol) stands 125 units tall. Each amount is written
  // above the higher of its bar and its dashed outline; the names are under
  // the baseline.
  const BARS = { width: 320, height: 198 };
  const BAR = { baseline: 170, maxHeight: 125, width: 60, valueGap: 6, nameY: 188, centers: [62, 160, 258] as const };

  // The ids are unique to this instance, so that two explorers on one page
  // cannot share a hatching. $props.id() gives the same id when the page is
  // built and when the script takes over.
  const uid = $props.id();
  const HATCH_ID = `buffer-capacity-${uid}-hatch`;
  const KEY_HATCH_ID = `buffer-capacity-${uid}-key-hatch`;

  let acid = $state<number>(START.acid);
  let base = $state<number>(START.base);
  let added = $state<number>(START.added);
  let hydrated = $state(false);

  const current = $derived(bufferCapacityState(acid, base, added));
  const rows = $derived(bars(acid, base, added));
  const markers = $derived([
    { id: 'buffer', before: current.bufferBefore, after: current.bufferAfter },
    { id: 'water', before: current.waterBefore, after: current.waterAfter },
  ]);

  const f = (value: number) => value.toFixed(1);
  const xFor = (pH: number) => AXIS.left + (pH / SCALE.pHMax) * (AXIS.right - AXIS.left);
  const heightFor = (mmol: number) => (mmol / BAR_MAX_MMOL) * BAR.maxHeight;

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet hatch(id: string)}
  <pattern {id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line class="buffer-capacity-hatch-line" x1="0" y1="0" x2="0" y2="6" />
  </pattern>
{/snippet}

<div class="diagram-body" data-diagram="buffer-capacity" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="scales">
      <svg viewBox={`0 0 ${SCALES.width} ${SCALES.height}`} role="img" aria-label={describeScales(acid, base, added)}>
        {#each ROWS as row (row.id)}
          {@const marker = markers.find((m) => m.id === row.id)}
          <g data-scale={row.id}>
            <text class="diagram-label buffer-capacity-title" data-scale-title={row.id} x={AXIS.left} y={row.titleY}>{row.title}</text>
            <line class="buffer-capacity-scale" x1={AXIS.left} y1={row.lineY} x2={AXIS.right} y2={row.lineY} />
            {#each SCALE.ticks as tick (tick)}
              {@const x = f(xFor(tick))}
              <line class="diagram-axis" data-tick-x={tick} x1={x} y1={row.lineY} x2={x} y2={row.lineY + TICK_LENGTH} />
              <text class="diagram-label" {x} y={row.lineY + TICK_LABEL_GAP} text-anchor="middle">{tick}</text>
            {/each}
            {#if marker}
              <circle class="buffer-capacity-before" data-marker="before" cx={f(xFor(marker.before))} cy={row.lineY} r={RING_RADIUS} />
              {#if added !== 0}
                <circle class="diagram-marker buffer-capacity-after" data-marker="after" cx={f(xFor(marker.after))} cy={row.lineY} r={DOT_RADIUS} />
              {/if}
            {/if}
          </g>
        {/each}
      </svg>
      <div class="molecule-key buffer-capacity-key">
        <ul>
          <li data-key="before">
            <svg viewBox="0 0 18 18" aria-hidden="true"><circle class="buffer-capacity-before" cx="9" cy="9" r={RING_RADIUS} /></svg>{LABELS.keyBefore}
          </li>
          <li data-key="after">
            <svg viewBox="0 0 18 18" aria-hidden="true"><circle class="diagram-marker buffer-capacity-after" cx="9" cy="9" r={DOT_RADIUS} /></svg>{LABELS.keyAfter}
          </li>
        </ul>
      </div>
    </figure>

    <figure class="diagram-plot" data-panel="bars">
      <figcaption class="diagram-panel-title">{LABELS.bars}</figcaption>
      <svg viewBox={`0 0 ${BARS.width} ${BARS.height}`} role="img" aria-label={describeBars(acid, base, added)}>
        <defs>{@render hatch(HATCH_ID)}</defs>
        {#each rows as row, i (row.id)}
          {@const center = BAR.centers[i] ?? 0}
          {@const left = center - BAR.width / 2}
          {@const height = heightFor(row.after)}
          {@const top = BAR.baseline - Math.max(height, row.before === null ? 0 : heightFor(row.before))}
          <rect
            class={row.id === 'acid' ? 'buffer-capacity-acid' : row.id === 'base' ? 'buffer-capacity-base' : 'diagram-bar buffer-capacity-left'}
            data-bar={row.id}
            x={left}
            y={f(BAR.baseline - height)}
            width={BAR.width}
            height={f(height)}
            fill={row.id === 'acid' ? `url(#${HATCH_ID})` : undefined}
          />
          {#if row.before !== null}
            <rect
              class="buffer-capacity-outline"
              data-bar-before={row.id}
              x={left}
              y={f(BAR.baseline - heightFor(row.before))}
              width={BAR.width}
              height={f(heightFor(row.before))}
            />
          {/if}
          <text class="diagram-label buffer-capacity-value" data-bar-value={row.id} x={center} y={f(top - BAR.valueGap)} text-anchor="middle"
            >{row.text}</text
          >
          <text class="diagram-label buffer-capacity-bar-name" data-bar-name={row.id} x={center} y={BAR.nameY} text-anchor="middle">{row.name}</text>
        {/each}
        <line class="diagram-axis buffer-capacity-baseline" data-baseline x1="16" y1={BAR.baseline} x2="304" y2={BAR.baseline} />
      </svg>
      <div class="molecule-key buffer-capacity-key">
        <ul>
          <li data-key="outline">
            <svg viewBox="0 0 24 16" aria-hidden="true"><rect class="buffer-capacity-outline" x="2" y="2" width="20" height="12" /></svg>{LABELS.keyOutline}
          </li>
        </ul>
      </div>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes. The addition comes first, so that on a small phone
       it is on the screen with the scales while it moves. -->
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{LABELS.addedSlider}</span>
        <span class="diagram-slider-value" aria-hidden="true">{addedText(added)}</span>
      </span>
      <input type="range" min={ADDED.min} max={ADDED.max} step={ADDED.step} aria-valuetext={addedValueText(added)} bind:value={added} />
    </label>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{LABELS.acidSlider}</span>
        <span class="diagram-slider-value" aria-hidden="true">{amountText(acid)}</span>
      </span>
      <input type="range" min={AMOUNT.min} max={AMOUNT.max} step={AMOUNT.step} aria-valuetext={amountValueText(acid, 'acid')} bind:value={acid} />
    </label>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{LABELS.baseSlider}</span>
        <span class="diagram-slider-value" aria-hidden="true">{amountText(base)}</span>
      </span>
      <input type="range" min={AMOUNT.min} max={AMOUNT.max} step={AMOUNT.step} aria-valuetext={amountValueText(base, 'base')} bind:value={base} />
    </label>
  </div>

  <p class="diagram-readout" role="status">{readout(acid, base, added)}</p>
</div>
