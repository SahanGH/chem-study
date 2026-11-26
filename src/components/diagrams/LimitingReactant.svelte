<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ATOMS,
    BOXES,
    GRID,
    MOLECULES,
    RANGE,
    START,
    controlLabel,
    countText,
    describeBox,
    particles,
    readout,
    table,
    type Particle,
  } from '../../lib/limiting-reactant';

  // Drawing units. Each box is a fixed grid of five columns and three rows,
  // inset from the frame so that no molecule touches it, and holds no text:
  // the boxes are named in HTML above them and the atoms in the key, so no
  // drawn text can fall under 12 px on a phone.
  const CELL = { width: 44, height: 38 };
  const INSET = 6;
  const VIEW = { width: GRID.columns * CELL.width + 2 * INSET, height: GRID.rows * CELL.height + 2 * INSET };
  const FRAME_INSET = 0.75;

  // One size for each atom everywhere, so that atoms can be counted across the
  // boxes: nitrogen is the largest, then oxygen, then fluorine, as their
  // covalent radii run. Touching circles are drawn exactly a radius sum apart.
  const RADIUS = { N: 8, O: 7, F: 6 } as const;
  type Element = keyof typeof RADIUS;
  // The dot at the center of a fluorine atom, which the key shows too.
  const FLUORINE_DOT_RADIUS = 2;
  // The bond angle in nitrosyl fluoride is about 110 degrees, so each outer
  // atom sits 55 degrees from straight up. Nitrogen is lowered by 4 so that
  // the bent molecule is centered in its cell.
  const HALF_BOND_ANGLE = (55 * Math.PI) / 180;
  const NOF_NITROGEN_DROP = 4;

  interface DrawnAtom {
    readonly element: Element;
    readonly x: number;
    readonly y: number;
  }

  const apart = (one: Element, other: Element) => RADIUS[one] + RADIUS[other];
  const NOF_ATOMS: readonly DrawnAtom[] = [
    {
      element: 'O',
      x: -apart('N', 'O') * Math.sin(HALF_BOND_ANGLE),
      y: NOF_NITROGEN_DROP - apart('N', 'O') * Math.cos(HALF_BOND_ANGLE),
    },
    { element: 'N', x: 0, y: NOF_NITROGEN_DROP },
    {
      element: 'F',
      x: apart('N', 'F') * Math.sin(HALF_BOND_ANGLE),
      y: NOF_NITROGEN_DROP - apart('N', 'F') * Math.cos(HALF_BOND_ANGLE),
    },
  ];
  // Each molecule's atoms, relative to the middle of its cell, in drawing order.
  const DRAWN_ATOMS: Record<Particle, readonly DrawnAtom[]> = {
    NO: [
      { element: 'N', x: -apart('N', 'O') / 2, y: 0 },
      { element: 'O', x: apart('N', 'O') / 2, y: 0 },
    ],
    F2: [
      { element: 'F', x: -RADIUS.F, y: 0 },
      { element: 'F', x: RADIUS.F, y: 0 },
    ],
    NOF: NOF_ATOMS,
  };

  let no = $state<number>(START.no);
  let f2 = $state<number>(START.f2);
  let hydrated = $state(false);

  const drawn = $derived(particles(no, f2));
  const rows = $derived(table(no, f2));

  const f = (value: number) => value.toFixed(2);
  const columnOf = (index: number) => index % GRID.columns;
  const rowOf = (index: number) => Math.floor(index / GRID.columns);
  const centerX = (index: number) => INSET + columnOf(index) * CELL.width + CELL.width / 2;
  const centerY = (index: number) => INSET + rowOf(index) * CELL.height + CELL.height / 2;

  onMount(() => {
    hydrated = true;
  });
</script>

<!-- One molecule's atoms, around the point (0, 0). -->
{#snippet molecule(kind: Particle)}
  {#each DRAWN_ATOMS[kind] as atom, index (index)}
    <circle
      class={`molecule-atom is-${atom.element.toLowerCase()}`}
      data-atom={atom.element}
      cx={f(atom.x)}
      cy={f(atom.y)}
      r={RADIUS[atom.element]}
    />
    {#if atom.element === 'F'}
      <circle class="molecule-atom-dot" data-atom-dot="F" cx={f(atom.x)} cy={f(atom.y)} r={FLUORINE_DOT_RADIUS} />
    {/if}
  {/each}
{/snippet}

<div class="diagram-body" data-diagram="limiting-reactant" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-paired">
    {#each BOXES as box (box.name)}
      <figure class="diagram-plot" data-box={box.name}>
        <figcaption class="diagram-panel-title">{box.title}</figcaption>
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={describeBox(box.name, no, f2)}>
          <rect
            class="molecule-box"
            x={FRAME_INSET}
            y={FRAME_INSET}
            width={VIEW.width - 2 * FRAME_INSET}
            height={VIEW.height - 2 * FRAME_INSET}
            rx="10"
          />
          {#each drawn[box.name] as kind, index (index)}
            <g
              data-particle={kind}
              data-column={columnOf(index)}
              data-row={rowOf(index)}
              transform={`translate(${f(centerX(index))} ${f(centerY(index))})`}
            >
              {@render molecule(kind)}
            </g>
          {/each}
        </svg>
      </figure>
    {/each}
  </div>

  <!-- The sliders sit right under the boxes they change, above the readout, whose
       length changes from one line to three: nothing under the boxes moves. -->
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{controlLabel('no')}</span>
        <span class="diagram-slider-value" aria-hidden="true">{no}</span>
      </span>
      <input
        type="range"
        min={RANGE.no.min}
        max={RANGE.no.max}
        step={RANGE.no.step}
        aria-valuetext={countText('no', no)}
        bind:value={no}
      />
    </label>
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>{controlLabel('f2')}</span>
        <span class="diagram-slider-value" aria-hidden="true">{f2}</span>
      </span>
      <input
        type="range"
        min={RANGE.f2.min}
        max={RANGE.f2.max}
        step={RANGE.f2.step}
        aria-valuetext={countText('f2', f2)}
        bind:value={f2}
      />
    </label>
  </div>

  <p class="diagram-readout" role="status">{readout(no, f2)}</p>

  <table class="diagram-table" data-table="amounts">
    <caption>Number of molecules</caption>
    <thead>
      <tr>
        <th scope="col"><span class="visually-hidden">Stage</span></th>
        {#each MOLECULES as column (column.kind)}
          <th scope="col">{column.formula}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.name)}
        <tr data-row={row.name}>
          <th scope="row">{row.name}</th>
          <td>{row.no}</td>
          <td>{row.f2}</td>
          <td>{row.nof}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="molecule-key" data-part="key">
    <ul>
      {#each ATOMS as atom (atom.element)}
        <li data-key-atom>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">
            <circle
              class={`molecule-atom is-${atom.element.toLowerCase()}`}
              data-atom={atom.element}
              cx="0"
              cy="0"
              r={RADIUS[atom.element]}
            />
            {#if atom.element === 'F'}
              <circle class="molecule-atom-dot" data-atom-dot="F" cx="0" cy="0" r={FLUORINE_DOT_RADIUS} />
            {/if}
          </svg>
          <span>{atom.element} {atom.name}</span>
        </li>
      {/each}
    </ul>
    <ul>
      {#each MOLECULES as particle (particle.kind)}
        <li data-key-particle>
          <svg viewBox="-24 -14 48 28" aria-hidden="true">
            {@render molecule(particle.kind)}
          </svg>
          <span>{particle.formula} {particle.name}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
