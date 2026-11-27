<script lang="ts">
  import { onMount } from 'svelte';
  import {
    CONCENTRATION,
    LABELS,
    METAL_IDS,
    METALS,
    Q_AXIS,
    START,
    concentrationText,
    concentrationValueText,
    describeCell,
    describeScales,
    flowText,
    gapText,
    meterText,
    qTickText,
    readout,
    rungText,
    sideLabels,
    // Imported under another name: a variable called `state` makes Svelte read
    // the `$state` rune as a store subscription to it.
    state as cellState,
    type Exponent,
    type MetalId,
    type Side,
  } from '../../lib/galvanic-cell';

  // Both drawings are 320 units wide and their text is 12, so the text is
  // 12 px when a drawing itself is shown 320 px wide: the ratio of the site's
  // figures (18 on 480). They are stacked at every width.
  //
  // Heights are budgeted for a 320 × 568 phone: the cell (234 units, at most
  // 234 px), the ladder and the Q line (176), the gaps, the legend of the left
  // half-cell and its menu of metals (about 70 px) come to about 520 px.
  const CELL = { width: 320, height: 234 };
  const SCALES = { width: 320, height: 176 };

  // ---- The cell. Every x below is for the left half-cell; the right one is
  // its mirror image, so when the metals are traded the labels change sides.
  //
  // Where the labels stand, at least 4 units apart and clear of every line at
  // every setting, for every pair of half-cells:
  // - the meter's reading inside the meter, at the top in the middle;
  // - "e⁻" under its arrow, on the anode's side of the wire, left of the
  //   meter's column, above the metal's symbol;
  // - "NO₃⁻" and "K⁺", each with its arrow, in two rows between the meter and
  //   the salt bridge, in the middle column (x from 124 to 196);
  // - the metal's symbol beside its electrode, above the beaker;
  // - "loses mass" or "gains mass" and the solution inside the beaker, between
  //   the electrode and the leg of the salt bridge;
  // - the role and the half-reaction in two rows under each beaker, centered
  //   on it, each at most about 150 units wide.
  // A browser test sweeps every pair both ways round to check it.
  const BEAKER = { left: 8, right: 152, top: 104, bottom: 192, corner: 8, liquidTop: 118 };
  const ELECTRODE = { left: 24, right: 36, top: 60, bottom: 178 };
  const ELECTRODE_MIDDLE = (ELECTRODE.left + ELECTRODE.right) / 2;
  const WIRE_Y = 20;
  const METER = { left: 118, right: 202, top: 6, bottom: 34 };
  const ELECTRON_ARROW = { from: 50, to: 100, y: 30 };
  const ELECTRON_LABEL = { x: 75, baseline: 50 };
  const SYMBOL = { x: 42, baseline: 76 };
  const BRIDGE = { outerLeft: 132, innerLeft: 144, top: 79, inner: 91, bottom: 150 };
  const ION_ROWS = { nitrate: 52, potassium: 71 };
  const ION_ARROW = { near: 156, far: 128, textGap: 6 };
  const INSIDE = { x: 42, electrode: 138, solution: 168 };
  const UNDER = { x: (BEAKER.left + BEAKER.right) / 2, role: 208, halfReaction: 227 };
  const HEAD = { length: 7, half: 4 };

  const mirror = (side: Side, x: number) => (side === 'left' ? x : CELL.width - x);
  const anchor = (side: Side) => (side === 'left' ? 'start' : 'end');
  const SIDES: readonly Side[] = ['left', 'right'];

  /** A straight arrow from x1 to x2 at height y, its head at x2. */
  function arrowHead(x2: number, y: number, pointsRight: boolean): string {
    const back = pointsRight ? x2 - HEAD.length : x2 + HEAD.length;
    return `${x2},${y} ${back},${y - HEAD.half} ${back},${y + HEAD.half}`;
  }

  /** A row in the salt bridge: the ion's name and an arrow toward the side it moves to. */
  function ionRow(toward: Side | null) {
    const middle = CELL.width / 2;
    if (toward === null) return { text: { x: middle, anchor: 'middle' as const }, arrow: null };
    if (toward === 'left') {
      return {
        text: { x: middle + ION_ARROW.textGap / 2 + 2, anchor: 'start' as const },
        arrow: { x1: middle - 4, x2: ION_ARROW.far, right: false },
      };
    }
    return {
      text: { x: middle - ION_ARROW.textGap / 2 - 2, anchor: 'end' as const },
      arrow: { x1: middle + 4, x2: CELL.width - ION_ARROW.far, right: true },
    };
  }

  const BEAKER_OUTLINE = `M${BEAKER.left} ${BEAKER.top} V${BEAKER.bottom - BEAKER.corner} Q${BEAKER.left} ${BEAKER.bottom} ${BEAKER.left + BEAKER.corner} ${BEAKER.bottom} H${BEAKER.right - BEAKER.corner} Q${BEAKER.right} ${BEAKER.bottom} ${BEAKER.right} ${BEAKER.bottom - BEAKER.corner} V${BEAKER.top}`;
  const RIGHT_BEAKER_OUTLINE = `M${mirror('right', BEAKER.right)} ${BEAKER.top} V${BEAKER.bottom - BEAKER.corner} Q${mirror('right', BEAKER.right)} ${BEAKER.bottom} ${mirror('right', BEAKER.right) + BEAKER.corner} ${BEAKER.bottom} H${mirror('right', BEAKER.left) - BEAKER.corner} Q${mirror('right', BEAKER.left)} ${BEAKER.bottom} ${mirror('right', BEAKER.left)} ${BEAKER.bottom - BEAKER.corner} V${BEAKER.top}`;
  const BRIDGE_OUTLINE = `M${BRIDGE.outerLeft} ${BRIDGE.bottom} V${BRIDGE.top} H${CELL.width - BRIDGE.outerLeft} V${BRIDGE.bottom} H${CELL.width - BRIDGE.innerLeft} V${BRIDGE.inner} H${BRIDGE.innerLeft} V${BRIDGE.bottom} Z`;

  // ---- The ladder and the Q line.
  //
  // The rungs stand at their true potentials, 95 units for the 1.54 V from
  // silver to chromium. Their names are evenly spaced, 19 units apart, at the
  // left, each joined to its rung by a short leader, since cobalt, tin and
  // cadmium are too close for 12-unit names at their own heights. The gap
  // between the chosen rungs is bracketed at the right and labeled there,
  // where nothing else stands. The Q line runs under the ladder.
  const LADDER = { top: 14, span: 95, nameX: 112, leaderFrom: 116, railLeft: 136, railRight: 176, railTop: 8, railBottom: 115 };
  const NAME_STEP = 19;
  const BRACKET = { from: 182, to: 190, labelX: 196 };
  const TOP_HUNDREDTHS = 80;
  const SPAN_HUNDREDTHS = 154;
  const rungY = (hundredths: number) => LADDER.top + ((TOP_HUNDREDTHS - hundredths) / SPAN_HUNDREDTHS) * LADDER.span;
  const RUNGS = METAL_IDS.map((id, index) => ({
    id,
    text: rungText(id),
    y: rungY(METALS[id].hundredths),
    nameY: LADDER.top + index * NAME_STEP,
  }));

  const Q_LINE = { y: 148, middle: 170, perDecade: 14, tick: 4, oneAbove: 9, oneLabelAbove: 15, tickLabelBelow: 22, nameX: 24 };
  const xForLog = (logQ: number) => Q_LINE.middle + logQ * Q_LINE.perDecade;
  const MARKER_RADIUS = 5;

  // The drawings hold no ids at all (the arrowheads are drawn as shapes, not
  // markers), and every control is named by the label around it, so two
  // explorers on one page share nothing.

  let left = $state<MetalId>(START.left);
  let leftExponent = $state<Exponent>(START.leftExponent);
  let right = $state<MetalId>(START.right);
  let rightExponent = $state<Exponent>(START.rightExponent);
  let hydrated = $state(false);

  const current = $derived(cellState(left, leftExponent, right, rightExponent));
  const anodeSide = $derived(current.anode);
  const labels = $derived(sideLabels(current));
  const nitrate = $derived(ionRow(current.flow.nitrate));
  const potassium = $derived(ionRow(current.flow.potassium));
  const chosenRungs = $derived(RUNGS.filter((rung) => rung.id === left || rung.id === right));
  const gap = $derived.by(() => {
    const ys = chosenRungs.map((rung) => rung.y);
    return { high: Math.min(...ys), low: Math.max(...ys) };
  });

  const f = (value: number) => value.toFixed(1);

  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet arrow(x1: number, x2: number, y: number, pointsRight: boolean, name: string)}
  <line class="galvanic-cell-arrow" data-arrow={name} x1={x1} y1={y} x2={pointsRight ? x2 - HEAD.length + 1 : x2 + HEAD.length - 1} y2={y} />
  <polygon class="galvanic-cell-arrowhead" data-arrowhead={name} data-points={pointsRight ? 'right' : 'left'} points={arrowHead(x2, y, pointsRight)} />
{/snippet}

<div class="diagram-body" data-diagram="galvanic-cell" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="cell">
      <svg viewBox={`0 0 ${CELL.width} ${CELL.height}`} role="img" aria-label={describeCell(current)}>
        <!-- The two solutions, then the glass over them. -->
        {#each SIDES as side (side)}
          {@const x0 = side === 'left' ? BEAKER.left : mirror('right', BEAKER.right)}
          <rect
            class="galvanic-cell-solution"
            data-solution={side}
            x={x0 + 1}
            y={BEAKER.liquidTop}
            width={BEAKER.right - BEAKER.left - 2}
            height={BEAKER.bottom - BEAKER.liquidTop - 1}
            rx="6"
          />
        {/each}
        <path class="galvanic-cell-glass" data-beaker="left" d={BEAKER_OUTLINE} />
        <path class="galvanic-cell-glass" data-beaker="right" d={RIGHT_BEAKER_OUTLINE} />

        <!-- The salt bridge of potassium nitrate: an upturned U, one leg in each solution. -->
        <path class="galvanic-cell-bridge" data-bridge d={BRIDGE_OUTLINE} />

        <!-- The wire and the meter. -->
        <path
          class="galvanic-cell-wire"
          data-wire="left"
          d={`M${ELECTRODE_MIDDLE} ${ELECTRODE.top} V${WIRE_Y} H${METER.left}`}
        />
        <path
          class="galvanic-cell-wire"
          data-wire="right"
          d={`M${mirror('right', ELECTRODE_MIDDLE)} ${ELECTRODE.top} V${WIRE_Y} H${METER.right}`}
        />
        <rect
          class="galvanic-cell-meter"
          data-meter
          x={METER.left}
          y={METER.top}
          width={METER.right - METER.left}
          height={METER.bottom - METER.top}
          rx="6"
        />
        <text
          class="diagram-label galvanic-cell-meter-text"
          data-label="meter"
          x={CELL.width / 2}
          y={(METER.top + METER.bottom) / 2}
          dy="0.35em"
          text-anchor="middle">{meterText(current)}</text
        >

        <!-- The electrodes, with their symbols. No electrode carries a sign. -->
        {#each SIDES as side (side)}
          {@const x0 = side === 'left' ? ELECTRODE.left : mirror('right', ELECTRODE.right)}
          <rect
            class="galvanic-cell-electrode"
            data-electrode={side}
            x={x0}
            y={ELECTRODE.top}
            width={ELECTRODE.right - ELECTRODE.left}
            height={ELECTRODE.bottom - ELECTRODE.top}
          />
          <text class="diagram-label galvanic-cell-symbol" data-label={`symbol-${side}`} x={mirror(side, SYMBOL.x)} y={SYMBOL.baseline} text-anchor={anchor(side)}
            >{labels[side].symbol}</text
          >
          {#if labels[side].electrode !== null}
            <text
              class="diagram-label galvanic-cell-on-solution"
              data-label={`electrode-${side}`}
              x={mirror(side, INSIDE.x)}
              y={INSIDE.electrode}
              text-anchor={anchor(side)}>{labels[side].electrode}</text
            >
          {/if}
          <text
            class="diagram-label galvanic-cell-on-solution"
            data-label={`solution-${side}`}
            x={mirror(side, INSIDE.x)}
            y={INSIDE.solution}
            text-anchor={anchor(side)}>{labels[side].solution}</text
          >
          <text class="diagram-label galvanic-cell-role" data-label={`role-${side}`} x={mirror(side, UNDER.x)} y={UNDER.role} text-anchor="middle"
            >{labels[side].role}</text
          >
          <text
            class="diagram-label galvanic-cell-half"
            data-label={`half-reaction-${side}`}
            x={mirror(side, UNDER.x)}
            y={UNDER.halfReaction}
            text-anchor="middle">{labels[side].halfReaction}</text
          >
        {/each}

        <!-- The electrons, on the anode's side of the wire, toward the cathode. -->
        {#if anodeSide !== null}
          {@render arrow(mirror(anodeSide, ELECTRON_ARROW.from), mirror(anodeSide, ELECTRON_ARROW.to), ELECTRON_ARROW.y, anodeSide === 'left', 'electrons')}
          <text
            class="diagram-label galvanic-cell-ion"
            data-label="electrons"
            x={mirror(anodeSide, ELECTRON_LABEL.x)}
            y={ELECTRON_LABEL.baseline}
            text-anchor="middle">{LABELS.electrons}</text
          >
        {/if}

        <!-- The ions of the salt bridge: NO₃⁻ toward the anode, K⁺ toward the cathode. -->
        <text class="diagram-label galvanic-cell-ion" data-label="nitrate" x={nitrate.text.x} y={ION_ROWS.nitrate} text-anchor={nitrate.text.anchor}
          >{LABELS.nitrate}</text
        >
        {#if nitrate.arrow}
          {@render arrow(nitrate.arrow.x1, nitrate.arrow.x2, ION_ROWS.nitrate - 4, nitrate.arrow.right, 'nitrate')}
        {/if}
        <text class="diagram-label galvanic-cell-ion" data-label="potassium" x={potassium.text.x} y={ION_ROWS.potassium} text-anchor={potassium.text.anchor}
          >{LABELS.potassium}</text
        >
        {#if potassium.arrow}
          {@render arrow(potassium.arrow.x1, potassium.arrow.x2, ION_ROWS.potassium - 4, potassium.arrow.right, 'potassium')}
        {/if}
      </svg>
    </figure>

    <figure class="diagram-plot" data-panel="scales">
      <svg viewBox={`0 0 ${SCALES.width} ${SCALES.height}`} role="img" aria-label={describeScales(current)}>
        <!-- The ladder: two rails, a rung at each potential, each named at the left. -->
        <line class="galvanic-cell-rail" x1={LADDER.railLeft} y1={LADDER.railTop} x2={LADDER.railLeft} y2={LADDER.railBottom} />
        <line class="galvanic-cell-rail" x1={LADDER.railRight} y1={LADDER.railTop} x2={LADDER.railRight} y2={LADDER.railBottom} />
        {#each RUNGS as rung (rung.id)}
          {@const chosen = rung.id === left || rung.id === right}
          <line class="galvanic-cell-leader" data-leader={rung.id} x1={LADDER.leaderFrom} y1={f(rung.nameY)} x2={LADDER.railLeft} y2={f(rung.y)} />
          <line
            class={`galvanic-cell-rung${chosen ? ' is-chosen' : ''}`}
            data-rung={rung.id}
            data-chosen={chosen ? 'true' : undefined}
            x1={LADDER.railLeft}
            y1={f(rung.y)}
            x2={LADDER.railRight}
            y2={f(rung.y)}
          />
          <text
            class={`diagram-label galvanic-cell-rung-name${chosen ? ' is-selected' : ''}`}
            data-rung-name={rung.id}
            x={LADDER.nameX}
            y={f(rung.nameY)}
            dy="0.35em"
            text-anchor="end">{rung.text}</text
          >
        {/each}
        {#if left !== right}
          <path
            class="galvanic-cell-bracket"
            data-bracket
            d={`M${BRACKET.from} ${f(gap.high)} H${BRACKET.to} V${f(gap.low)} H${BRACKET.from}`}
          />
        {/if}
        <text class="diagram-label galvanic-cell-gap" data-gap x={BRACKET.labelX} y={f((gap.high + gap.low) / 2)} dy="0.35em">{gapText(current)}</text>

        <!-- The line for Q, on a scale of powers of ten, with Q = 1 marked. -->
        <text class="diagram-label galvanic-cell-q-name" data-label="q-name" x={Q_LINE.nameX} y={Q_LINE.y} dy="0.35em" text-anchor="end">{LABELS.qName}</text>
        <line class="galvanic-cell-q-line" data-q-line x1={xForLog(Q_AXIS.min)} y1={Q_LINE.y} x2={xForLog(Q_AXIS.max)} y2={Q_LINE.y} />
        {#each Q_AXIS.ticks as tick (tick)}
          <line class="diagram-axis" data-q-tick={tick} x1={xForLog(tick)} y1={Q_LINE.y - Q_LINE.tick} x2={xForLog(tick)} y2={Q_LINE.y + Q_LINE.tick} />
          <text class="diagram-label" data-q-tick-label={tick} x={xForLog(tick)} y={Q_LINE.y + Q_LINE.tickLabelBelow} text-anchor="middle">{qTickText(tick)}</text>
        {/each}
        <line class="galvanic-cell-q-one" data-q-one x1={xForLog(0)} y1={Q_LINE.y - Q_LINE.oneAbove} x2={xForLog(0)} y2={Q_LINE.y + Q_LINE.tick} />
        <text class="diagram-label galvanic-cell-q-one-name" data-label="q-one" x={xForLog(0)} y={Q_LINE.y - Q_LINE.oneLabelAbove} text-anchor="middle">{LABELS.qOne}</text>
        <circle class="diagram-marker" data-q-marker cx={xForLog(current.logQ)} cy={Q_LINE.y} r={MARKER_RADIUS} />
      </svg>
    </figure>
  </div>

  <!-- The controls sit right under the drawings they change, above the readout,
       whose length changes: the left half-cell's, then the right one's, each a
       menu of metals and a slider of its ion's concentration. Menus, not six
       radio buttons each: twelve radios would not fit a 320 px phone under the
       drawings. -->
  <div class="diagram-controls galvanic-cell-controls">
    {#each SIDES as side (side)}
      <fieldset class="galvanic-cell-side" data-side={side}>
        <legend>{side === 'left' ? LABELS.leftSide : LABELS.rightSide}</legend>
        <label class="diagram-select galvanic-cell-metal">
          <span>{LABELS.metal}</span>
          {#if side === 'left'}
            <select bind:value={left} aria-label={`${LABELS.leftSide} ${LABELS.metal.toLowerCase()}`}>
              {#each METAL_IDS as id (id)}
                <option value={id}>{METALS[id].label}</option>
              {/each}
            </select>
          {:else}
            <select bind:value={right} aria-label={`${LABELS.rightSide} ${LABELS.metal.toLowerCase()}`}>
              {#each METAL_IDS as id (id)}
                <option value={id}>{METALS[id].label}</option>
              {/each}
            </select>
          {/if}
        </label>
        <label class="diagram-slider galvanic-cell-slider">
          <span class="diagram-slider-head">
            <span>{LABELS.concentration}</span>
            <span class="diagram-slider-value" aria-hidden="true">{concentrationText(side === 'left' ? leftExponent : rightExponent)}</span>
          </span>
          {#if side === 'left'}
            <input
              type="range"
              min={CONCENTRATION.min}
              max={CONCENTRATION.max}
              step={CONCENTRATION.step}
              aria-label={`${LABELS.leftSide} ${LABELS.concentration.toLowerCase()}`}
              aria-valuetext={concentrationValueText(leftExponent)}
              bind:value={leftExponent}
            />
          {:else}
            <input
              type="range"
              min={CONCENTRATION.min}
              max={CONCENTRATION.max}
              step={CONCENTRATION.step}
              aria-label={`${LABELS.rightSide} ${LABELS.concentration.toLowerCase()}`}
              aria-valuetext={concentrationValueText(rightExponent)}
              bind:value={rightExponent}
            />
          {/if}
        </label>
      </fieldset>
    {/each}
  </div>

  <p class="diagram-readout" role="status">{readout(left, leftExponent, right, rightExponent)}</p>
  <p class="diagram-detail galvanic-cell-flow" data-flow aria-live="polite">{flowText(current)}</p>
</div>
