<script lang="ts">
  import { onMount } from 'svelte';
  import {
    GROUPS,
    PERIODS,
    PROPERTIES,
    PROPERTY_NAMES,
    TREND_ELEMENTS,
    describeSeries,
    elementOf,
    orderTitle,
    parseDirection,
    parseProperty,
    readout,
    series,
    seriesHeading,
    shadeLevel,
    shownValue,
    valueText,
    type TrendDirection,
    type TrendElement,
    type TrendProperty,
  } from '../../lib/periodic-trends';

  // Drawing units. The drawing is 320 wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). Shown narrower, it is smaller in proportion.
  const VIEW = { width: 320, height: 240 };
  // Room on the left for four-digit tick labels, and above the plot for the
  // axis title and for the value over the highest point.
  const PLOT = { left: 40, right: 312, top: 46, bottom: 196 };
  const MARKER = { radius: 4.5, chosenRadius: 6 };
  // From the top of a marker up to the baseline of its value.
  const VALUE_GAP = 4;
  const TICK_LENGTH = 4;
  // Under the axis: the symbols, then the title of the axis.
  const SYMBOL_Y = PLOT.bottom + 17;
  const ORDER_TITLE_Y = PLOT.bottom + 36;

  // The readout has room for its longest sentence at any width, so that
  // nothing below it moves when the sentence changes. The longest is a noble
  // gas's; its copy is drawn, unseen, in the same box.
  const LONGEST_READOUT = TREND_ELEMENTS.map((atom) => readout(atom.symbol)).reduce((longest, text) =>
    text.length > longest.length ? text : longest,
  );

  let property = $state<TrendProperty>('ie1');
  let symbol = $state('S');
  let direction = $state<TrendDirection>('period');
  let hydrated = $state(false);

  const info = $derived(PROPERTIES[property]);
  const plotted = $derived(series(symbol, property, direction));
  const tableTitle = $derived(info.unit === null ? info.label : `${info.label} (${info.unit})`);

  const f = (value: number) => value.toFixed(1);
  const xFor = (index: number) => PLOT.left + ((index + 0.5) / plotted.length) * (PLOT.right - PLOT.left);
  const yFor = (value: number) =>
    PLOT.bottom - ((value - info.axis.min) / (info.axis.max - info.axis.min)) * (PLOT.bottom - PLOT.top);

  /** The line through every point; drawn only with two or more. */
  const linePath = $derived(
    plotted.length < 2 ? '' : plotted.map((point, index) => `${index === 0 ? 'M' : 'L'}${f(xFor(index))} ${f(yFor(point.value))}`).join(''),
  );

  /** "16 S, sulfur". */
  const elementLabel = (atom: TrendElement) => `${atom.z} ${atom.symbol}, ${atom.name.toLowerCase()}`;

  /** The element in a cell of the table, if there is one: period 1 has only two. */
  const elementAt = (period: number, group: number) =>
    TREND_ELEMENTS.find((atom) => atom.period === period && atom.group === group);

  function chooseElement(value: string) {
    // elementOf throws, naming the symbol, for a value that is not one of the 34.
    symbol = elementOf(value).symbol;
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="periodic-trends" data-hydrated={hydrated ? 'true' : undefined}>
  <!-- The parts come in the order a student uses them on a phone: the choice
       of property, the table it shades, and, directly under the table, the
       sentence about the cell just pressed. The menu and the trend choice
       follow it, then the graph they change. -->
  <div class="diagram-controls" data-block="property">
    <fieldset class="diagram-choice is-wide">
      <legend>Property</legend>
      {#each PROPERTY_NAMES as name (name)}
        <label
          ><input
            type="radio"
            name="periodic-trends-property"
            value={name}
            checked={property === name}
            onchange={(event) => (property = parseProperty(event.currentTarget.value))}
          />{PROPERTIES[name].label}</label
        >
      {/each}
    </fieldset>
  </div>

  <div class="diagram-panels" data-block="table">
    <figure class="diagram-plot trend-panel" data-panel="table">
      <figcaption class="diagram-panel-title" data-title="table">{tableTitle}</figcaption>
      <table class="trend-table" data-table="trends">
        <caption class="visually-hidden">
          {info.label} of the main-group elements of periods 1 to 5, set out as in the periodic table. Press an element to choose it.
        </caption>
        <thead>
          <tr>
            {#each GROUPS as group (group)}
              <th scope="col"><span class="visually-hidden">Group{' '}</span>{group}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each PERIODS as period (period)}
            <tr>
              {#each GROUPS as group (group)}
                {@const atom = elementAt(period, group)}
                <td>
                  {#if atom}
                    {@const text = valueText(atom.symbol, property)}
                    {@const level = shadeLevel(atom.symbol, property)}
                    <!-- Out of the tab order: the menu is the keyboard's way to choose, and the two stay in step.
                         Disabled until the script has taken over: before that a press would do nothing. -->
                    <button
                      type="button"
                      tabindex="-1"
                      disabled={!hydrated}
                      class={['trend-cell', level === null ? 'trend-no-value' : `trend-shade-${level}`]}
                      data-element={atom.symbol}
                      aria-current={atom.symbol === symbol ? 'true' : undefined}
                      onclick={() => chooseElement(atom.symbol)}
                    >
                      <span class="trend-symbol">{atom.symbol}</span>
                      {' '}
                      <span class="trend-value">{#if text === null}<span aria-hidden="true">—</span>{:else}{text}{/if}</span>
                      <span class="visually-hidden">{' '}({atom.name.toLowerCase()}, {shownValue(atom.symbol, property)})</span>
                    </button>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </figure>
  </div>

  <div class="trend-readout" data-block="readout">
    <p class="diagram-readout" role="status">{readout(symbol)}</p>
    <p class="diagram-readout trend-readout-sizer" aria-hidden="true">{LONGEST_READOUT}</p>
  </div>

  <div class="diagram-controls" data-block="choices">
    <label class="diagram-select">
      <span>Element</span>
      <select value={symbol} onchange={(event) => chooseElement(event.currentTarget.value)}>
        {#each TREND_ELEMENTS as option (option.symbol)}
          <option value={option.symbol}>{elementLabel(option)}</option>
        {/each}
      </select>
    </label>
    <fieldset class="diagram-choice is-wide">
      <legend>Show the trend</legend>
      <label
        ><input
          type="radio"
          name="periodic-trends-direction"
          value="period"
          checked={direction === 'period'}
          onchange={(event) => (direction = parseDirection(event.currentTarget.value))}
        />Across its period</label
      >
      <label
        ><input
          type="radio"
          name="periodic-trends-direction"
          value="group"
          checked={direction === 'group'}
          onchange={(event) => (direction = parseDirection(event.currentTarget.value))}
        />Down its group</label
      >
    </fieldset>
  </div>

  <div class="diagram-panels" data-block="graph">
    <figure class="diagram-plot" data-panel="graph">
      <!-- Two lines are kept for the title on a phone, and it breaks evenly. -->
      <figcaption class="diagram-panel-title trend-title" data-title="graph">{seriesHeading(symbol, property, direction)}</figcaption>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={describeSeries(symbol, property, direction)}>
        {#each info.ticks as tick (tick)}
          <line class="diagram-gridline" data-gridline={tick} x1={PLOT.left} y1={f(yFor(tick))} x2={PLOT.right} y2={f(yFor(tick))} />
          <text class="diagram-label" data-tick-label-y x={PLOT.left - 6} y={f(yFor(tick))} dy="0.35em" text-anchor="end">{tick}</text>
        {/each}
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top - 6}V${PLOT.bottom}H${PLOT.right + 4}`} />
        <text class="diagram-label" data-axis-label="y" x="4" y="14">{info.axisTitle}</text>
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={ORDER_TITLE_Y} text-anchor="middle"
          >{orderTitle(direction)}</text
        >

        {#if plotted.length === 0}
          <text class="diagram-label diagram-point-label" data-no-values x={(PLOT.left + PLOT.right) / 2} y={(PLOT.top + PLOT.bottom) / 2} text-anchor="middle"
            >No values to plot</text
          >
        {/if}
        {#if linePath !== ''}
          <path class="diagram-curve is-accent" data-series-line d={linePath} />
        {/if}
        {#each plotted as point, index (point.symbol)}
          {@const chosen = point.symbol === symbol}
          <line class="diagram-axis" x1={f(xFor(index))} y1={PLOT.bottom} x2={f(xFor(index))} y2={PLOT.bottom + TICK_LENGTH} />
          <circle
            class="diagram-marker"
            data-point={point.symbol}
            data-chosen={chosen ? 'true' : undefined}
            cx={f(xFor(index))}
            cy={f(yFor(point.value))}
            r={chosen ? MARKER.chosenRadius : MARKER.radius}
          />
        {/each}
        <!-- The labels come after the line and the markers, so they are drawn over them. -->
        {#each plotted as point, index (point.symbol)}
          {@const chosen = point.symbol === symbol}
          <text
            class={['diagram-label', 'diagram-point-label', chosen && 'is-selected']}
            data-value-label={point.symbol}
            x={f(xFor(index))}
            y={f(yFor(point.value) - (chosen ? MARKER.chosenRadius : MARKER.radius) - VALUE_GAP)}
            text-anchor="middle">{valueText(point.symbol, property)}</text
          >
          <text
            class={['diagram-label', 'diagram-point-label', chosen && 'is-selected']}
            data-symbol-label={point.symbol}
            x={f(xFor(index))}
            y={SYMBOL_Y}
            text-anchor="middle">{point.symbol}</text
          >
        {/each}
      </svg>
    </figure>
  </div>
</div>
