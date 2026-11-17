<script lang="ts">
  import { onMount } from 'svelte';
  import {
    PES_ELEMENTS,
    comparisonReadout,
    describeSpectrum,
    elementOf,
    energyFraction,
    energyTable,
    heightFraction,
    labelAnchor,
    readout,
    type PesElement,
  } from '../../lib/pes';

  // Drawing units. The drawing is 320 wide and its text is 12, so the text is
  // 12 px when the drawing itself is shown 320 px wide: the ratio of the
  // site's figures (18 on 480). Shown narrower, it is smaller in proportion.
  const VIEW = { width: 320, height: 244 };
  // A peak of six electrons, the tallest, reaches the top of the plot; its
  // label sits in the room above.
  const PLOT = { left: 46, right: 306, top: 30, bottom: 180 };
  // Each peak is this wide. The closest two peaks of any atom (calcium 2s and
  // 2p) are 6.4 apart, so the widest peaks that stay apart are about 5.
  const PEAK_WIDTH = 5;
  // From the top of a peak up to the baseline of its label.
  const LABEL_GAP = 5;
  const ENERGY_TICKS = ['1000', '100', '10', '1', '0.1'] as const;
  const ELECTRON_TICKS = [2, 4, 6] as const;
  // The legend sits under the energy axis: the chosen atom, then the compared one.
  const LEGEND = { y: PLOT.bottom + 58, chosenX: PLOT.left, comparedX: PLOT.left + 130, swatch: { width: 16, height: 10 } };

  let symbol = $state('Si');
  // The empty string is "nothing": no atom is compared.
  let otherSymbol = $state('');
  let hydrated = $state(false);

  const element = $derived(elementOf(symbol));
  const other = $derived(otherSymbol === '' ? undefined : elementOf(otherSymbol));
  // The menu leaves out the chosen atom: it is never compared with itself.
  const comparable = $derived(PES_ELEMENTS.filter((atom) => atom.symbol !== symbol));
  const rows = $derived(energyTable(symbol, other ? otherSymbol : undefined));
  const readoutText = $derived(
    other ? `${readout(symbol)} ${comparisonReadout(symbol, otherSymbol)}` : readout(symbol),
  );

  const f = (value: number) => value.toFixed(1);
  const xFor = (energy: string) => PLOT.left + energyFraction(energy) * (PLOT.right - PLOT.left);
  const yFor = (electrons: number) => PLOT.bottom - heightFraction(electrons) * (PLOT.bottom - PLOT.top);

  /** A narrow bell: level at the foot and at the top, so the peak's top is exactly its height. */
  function peakPath(energy: string, electrons: number): string {
    const x = xFor(energy);
    const top = yFor(electrons);
    const half = PEAK_WIDTH / 2;
    return (
      `M${f(x - half)} ${PLOT.bottom}C${f(x - half / 2)} ${PLOT.bottom} ${f(x - half / 2)} ${f(top)} ${f(x)} ${f(top)}` +
      `C${f(x + half / 2)} ${f(top)} ${f(x + half / 2)} ${PLOT.bottom} ${f(x + half)} ${PLOT.bottom}Z`
    );
  }

  /** "14 Si, silicon". */
  const atomLabel = (atom: PesElement) => `${atom.z} ${atom.symbol}, ${atom.name.toLowerCase()}`;

  function chooseElement(value: string) {
    // elementOf throws, naming the symbol, for a value that is not one of the twenty.
    symbol = elementOf(value).symbol;
    // An atom is never compared with itself.
    if (otherSymbol === symbol) otherSymbol = '';
  }

  function chooseComparison(value: string) {
    if (value === '') {
      otherSymbol = '';
      return;
    }
    if (value === symbol) {
      throw new Error(`Cannot compare ${symbol} with itself: choose a different atom, or "Nothing".`);
    }
    otherSymbol = elementOf(value).symbol;
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="photoelectron-spectrum" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels">
    <figure class="diagram-plot" data-panel="spectrum">
      <figcaption class="diagram-panel-title">Photoelectron spectrum</figcaption>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={describeSpectrum(symbol, other ? otherSymbol : undefined)}>
        {#each ELECTRON_TICKS as tick (tick)}
          <line class="diagram-gridline" data-gridline={tick} x1={PLOT.left} y1={f(yFor(tick))} x2={PLOT.right} y2={f(yFor(tick))} />
          <text class="diagram-label" data-tick-label-y x={PLOT.left - 7} y={f(yFor(tick))} dy="0.35em" text-anchor="end">{tick}</text>
        {/each}
        <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top - 4}V${PLOT.bottom}H${PLOT.right + 4}`} />
        {#each ENERGY_TICKS as tick (tick)}
          <line class="diagram-axis" data-tick-x={tick} x1={f(xFor(tick))} y1={PLOT.bottom} x2={f(xFor(tick))} y2={PLOT.bottom + 4} />
          <text class="diagram-label" data-tick-label-x x={f(xFor(tick))} y={PLOT.bottom + 17} text-anchor="middle">{tick}</text>
        {/each}
        <text class="diagram-label" data-axis-label="x" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 35} text-anchor="middle"
          >binding energy (MJ/mol)</text
        >
        <!-- Two lines: on one line the name is longer than the axis is tall. -->
        <text
          class="diagram-label"
          data-axis-label="y"
          x="0"
          y="0"
          text-anchor="middle"
          transform={`translate(12 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}
          ><tspan x="0">Relative number{' '}</tspan><tspan x="0" dy="14">of electrons</tspan></text
        >

        {#if other}
          {#each other.peaks as peak (peak.subshell)}
            <path class="diagram-peak is-compared" data-compared-peak={peak.subshell} d={peakPath(peak.energy, peak.electrons)} />
          {/each}
        {/if}
        {#each element.peaks as peak (peak.subshell)}
          <path class="diagram-peak" data-peak={peak.subshell} d={peakPath(peak.energy, peak.electrons)} />
        {/each}
        {#each element.peaks as peak (peak.subshell)}
          <text
            class="diagram-label diagram-peak-label"
            data-peak-label={peak.subshell}
            x={f(xFor(peak.energy))}
            y={f(yFor(peak.electrons) - LABEL_GAP)}
            text-anchor={labelAnchor(symbol, peak.subshell)}>{peak.subshell}</text
          >
        {/each}

        <g data-legend="chosen">
          <rect class="diagram-peak" x={LEGEND.chosenX} y={LEGEND.y - LEGEND.swatch.height} width={LEGEND.swatch.width} height={LEGEND.swatch.height} />
          <text class="diagram-label" x={LEGEND.chosenX + LEGEND.swatch.width + 6} y={LEGEND.y}>{element.name} ({element.symbol})</text>
        </g>
        {#if other}
          <g data-legend="compared">
            <rect
              class="diagram-peak is-compared"
              x={LEGEND.comparedX}
              y={LEGEND.y - LEGEND.swatch.height}
              width={LEGEND.swatch.width}
              height={LEGEND.swatch.height}
            />
            <text class="diagram-label" x={LEGEND.comparedX + LEGEND.swatch.width + 6} y={LEGEND.y}>{other.name} ({other.symbol})</text>
          </g>
        {/if}
      </svg>
    </figure>
  </div>

  <p class="diagram-readout" role="status">{readoutText}</p>
  <div class="diagram-controls">
    <label class="diagram-select">
      <span>Element</span>
      <select value={symbol} onchange={(event) => chooseElement(event.currentTarget.value)}>
        {#each PES_ELEMENTS as option (option.symbol)}
          <option value={option.symbol}>{atomLabel(option)}</option>
        {/each}
      </select>
    </label>
    <label class="diagram-select">
      <span>Compare with</span>
      <select value={otherSymbol} onchange={(event) => chooseComparison(event.currentTarget.value)}>
        <option value="">Nothing</option>
        {#each comparable as option (option.symbol)}
          <option value={option.symbol}>{atomLabel(option)}</option>
        {/each}
      </select>
    </label>
  </div>

  <table class="diagram-table" data-table="peaks">
    <caption>
      {#if other}
        Electrons in each subshell of {element.name.toLowerCase()}, and the binding energies of {element.name.toLowerCase()}
        ({element.symbol}) and {other.name.toLowerCase()} ({other.symbol}), in MJ/mol
      {:else}
        {element.name}: the electrons in each subshell and their binding energies
      {/if}
    </caption>
    <thead>
      <tr>
        <th scope="col">Subshell</th>
        <th scope="col">Electrons</th>
        {#if other}
          <!-- Symbols, not names: at 320 px four columns with "Phosphorus" and
               "Magnesium" are wider than the diagram. The caption and the legend give the names. -->
          <th scope="col">{element.symbol}<span class="visually-hidden">{' '}({element.name.toLowerCase()}, MJ/mol)</span></th>
          <th scope="col">{other.symbol}<span class="visually-hidden">{' '}({other.name.toLowerCase()}, MJ/mol)</span></th>
        {:else}
          <th scope="col">Binding energy (MJ/mol)</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.subshell)}
        <tr data-row={row.subshell}>
          <th scope="row">{row.subshell}</th>
          <td>{row.electrons}</td>
          <td>{row.energy}</td>
          {#if other}
            <td>
              {#if row.other}
                {row.other}
              {:else}
                <span aria-hidden="true">—</span><span class="visually-hidden">no {row.subshell} peak</span>
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
