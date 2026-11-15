<script lang="ts">
  import { onMount } from 'svelte';
  import {
    AXES,
    DISTURBANCES,
    STARTING_ID,
    describeGraph,
    disturbanceFor,
    newEquilibrium,
    pathPoints,
    readout,
    shiftTable,
    type DisturbanceId,
    type PathPoint,
  } from '../../lib/equilibrium-shift';

  // Drawing units. The drawing is 320 wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). Shown narrower, it is smaller in proportion.
  const VIEW = { width: 320, height: 200 };
  const PLOT = { left: 46, right: 306, top: 12, bottom: 172 };
  const CONCENTRATION_TICKS = [0, 0.1, 0.2, 0.3, 0.4];
  // A curve is named at its right end, above it, so the two names never meet:
  // the curves end at least 33 units apart in every case. The name's baseline
  // is 10 above the curve, which clears the curve and its stroke.
  const NAME = { right: PLOT.right - 8, above: 10 };
  // What was done is written at the top of the dotted line, to its right. The
  // highest curve right of the line reaches 32 (halving the volume), below
  // the label's descenders at about 27.
  const MARK = { gap: 5, baseline: PLOT.top + 12 };

  let disturbanceId = $state<DisturbanceId>(STARTING_ID);
  let hydrated = $state(false);

  const disturbance = $derived(disturbanceFor(disturbanceId));
  const points = $derived(pathPoints(disturbanceId));
  const table = $derived(shiftTable(disturbanceId));
  // The curves end on the new equilibrium, so the names stand there.
  const fresh = $derived(newEquilibrium(disturbanceId));

  const f = (value: number) => value.toFixed(1);
  const xFor = (time: number) => PLOT.left + (time / AXES.time.max) * (PLOT.right - PLOT.left);
  const yFor = (concentration: number) =>
    PLOT.bottom - (concentration / AXES.concentration.max) * (PLOT.bottom - PLOT.top);
  const tickText = (tick: number) => (tick === 0 ? '0' : tick.toFixed(1));
  const disturbanceX = xFor(AXES.time.disturbance);

  const pathOf = (value: (point: PathPoint) => number) =>
    `M${points.map((point) => `${f(xFor(point.time))} ${f(yFor(value(point)))}`).join('L')}`;
  const pathN2o4 = $derived(pathOf((point) => point.n2o4));
  const pathNo2 = $derived(pathOf((point) => point.no2));

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="equilibrium-shift" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="concentrations">
      <figcaption class="diagram-panel-title">Concentrations</figcaption>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={describeGraph(disturbanceId)}>
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top}V${PLOT.bottom}H${PLOT.right}`} />
        {#each CONCENTRATION_TICKS as tick (tick)}
          <line class="diagram-axis" data-tick-y={tick} x1={PLOT.left - 4} y1={f(yFor(tick))} x2={PLOT.left} y2={f(yFor(tick))} />
          <text class="diagram-label" x={PLOT.left - 7} y={f(yFor(tick))} dy="0.35em" text-anchor="end">{tickText(tick)}</text>
        {/each}
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(14 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>concentration (M)</text
        >
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 18} text-anchor="middle"
          >time</text
        >
        <line
          class="diagram-guide is-dotted"
          data-disturbance
          x1={f(disturbanceX)}
          y1={PLOT.top}
          x2={f(disturbanceX)}
          y2={PLOT.bottom}
        />
        <text class="diagram-label" data-disturbance-label x={f(disturbanceX + MARK.gap)} y={MARK.baseline}>{disturbance.mark}</text>
        <path class="diagram-curve" data-curve="n2o4" d={pathN2o4} />
        <path class="diagram-curve is-dashed" data-curve="no2" d={pathNo2} />
        <text
          class="diagram-label diagram-curve-name is-ink"
          data-curve-name="n2o4"
          x={NAME.right}
          y={f(yFor(fresh.n2o4) - NAME.above)}
          text-anchor="end">[N₂O₄]</text
        >
        <text
          class="diagram-label diagram-curve-name is-selected"
          data-curve-name="no2"
          x={NAME.right}
          y={f(yFor(fresh.no2) - NAME.above)}
          text-anchor="end">[NO₂]</text
        >
      </svg>
    </figure>
  </div>

  <table class="diagram-table" data-table="shift">
    <caption>{table.caption}</caption>
    <thead>
      <tr>
        <th scope="col"><span class="visually-hidden">Quantity</span></th>
        {#each table.columns as column (column)}
          <th scope="col">{column}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each table.rows as row (row.name)}
        <tr data-row={row.name}>
          <th scope="row">{row.name}</th>
          {#each row.cells as cell, column (column)}
            <td>{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <p class="diagram-readout" role="status">{readout(disturbanceId)}</p>
  <div class="diagram-controls">
    <fieldset class="diagram-choice is-wide">
      <legend>Disturbance</legend>
      {#each DISTURBANCES as option (option.id)}
        <label><input type="radio" name="equilibrium-shift-disturbance" value={option.id} bind:group={disturbanceId} />{option.label}</label>
      {/each}
    </fieldset>
  </div>
</div>
