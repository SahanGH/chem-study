<script lang="ts">
  import { onMount } from 'svelte';
  import {
    GRID,
    RANGE,
    START,
    countText,
    describeBox,
    particles,
    readout,
    table,
    type BoxName,
    type Particle,
  } from '../../lib/limiting-reactant';

  // Drawing units. Each box is a fixed grid of five columns and three rows,
  // and holds no text: the boxes are named in HTML above them and the atoms
  // in the key below, so no drawn text can fall under 12 px on a phone.
  const CELL = { width: 44, height: 38 };
  const VIEW = { width: GRID.columns * CELL.width, height: GRID.rows * CELL.height };
  const FRAME_INSET = 0.75;

  // One size for each atom everywhere, so that atoms can be counted across the
  // boxes: nitrogen is the largest, then oxygen, then fluorine, as their
  // covalent radii run. Touching circles are drawn exactly a radius sum apart.
  const RADIUS = { N: 8, O: 7, F: 6 } as const;
  // The bond angle in nitrosyl fluoride is about 110 degrees, so each outer
  // atom sits 55 degrees from straight up. Nitrogen is lowered by 4 so that
  // the bent molecule is centered in its cell.
  const HALF_BOND_ANGLE = (55 * Math.PI) / 180;
  const NOF_NITROGEN_DROP = 4;

  interface DrawnAtom {
    readonly element: keyof typeof RADIUS;
    readonly x: number;
    readonly y: number;
  }

  const apart = (one: keyof typeof RADIUS, other: keyof typeof RADIUS) => RADIUS[one] + RADIUS[other];
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
  const ATOMS: Record<Particle, readonly DrawnAtom[]> = {
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

  const BOXES: readonly { readonly name: BoxName; readonly title: string }[] = [
    { name: 'before', title: 'Before' },
    { name: 'after', title: 'After' },
  ];

  const KEY_ATOMS = [
    { element: 'N', name: 'nitrogen' },
    { element: 'O', name: 'oxygen' },
    { element: 'F', name: 'fluorine' },
  ] as const;
  const KEY_PARTICLES = [
    { kind: 'NO', formula: 'NO', name: 'nitrogen monoxide' },
    { kind: 'F2', formula: 'F₂', name: 'fluorine' },
    { kind: 'NOF', formula: 'NOF', name: 'nitrosyl fluoride' },
  ] as const;

  let no = $state<number>(START.no);
  let f2 = $state<number>(START.f2);
  let hydrated = $state(false);

  const drawn = $derived(particles(no, f2));
  const rows = $derived(table(no, f2));

  const f = (value: number) => value.toFixed(2);
  const columnOf = (index: number) => index % GRID.columns;
  const rowOf = (index: number) => Math.floor(index / GRID.columns);
  const centerX = (index: number) => columnOf(index) * CELL.width + CELL.width / 2;
  const centerY = (index: number) => rowOf(index) * CELL.height + CELL.height / 2;

  onMount(() => {
    hydrated = true;
  });
</script>

<!-- One molecule's atoms, around the point (0, 0). -->
{#snippet molecule(kind: Particle)}
  {#each ATOMS[kind] as atom, index (index)}
    <circle
      class={`molecule-atom is-${atom.element.toLowerCase()}`}
      data-atom={atom.element}
      cx={f(atom.x)}
      cy={f(atom.y)}
      r={RADIUS[atom.element]}
    />
  {/each}
{/snippet}

<div class="diagram-body" data-diagram="limiting-reactant" data-hydrated={hydrated ? 'true' : undefined}>
  <div class="diagram-panels is-paired">
    {#each BOXES as box (box.name)}
      <figure class="diagram-plot" data-box={box.name}>
        <figcaption class="diagram-panel-title">{box.title}</figcaption>
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={describeBox(box.name, no, f2)}>
          <rect
            class="diagram-track"
            x={FRAME_INSET}
            y={FRAME_INSET}
            width={VIEW.width - 2 * FRAME_INSET}
            height={VIEW.height - 2 * FRAME_INSET}
            rx="6"
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

  <div class="molecule-key" data-part="key">
    <ul>
      {#each KEY_ATOMS as atom (atom.element)}
        <li data-key-atom>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">
            <circle
              class={`molecule-atom is-${atom.element.toLowerCase()}`}
              data-atom={atom.element}
              cx="0"
              cy="0"
              r={RADIUS[atom.element]}
            />
          </svg>
          <span>{atom.element} {atom.name}</span>
        </li>
      {/each}
    </ul>
    <ul>
      {#each KEY_PARTICLES as particle (particle.kind)}
        <li data-key-particle>
          <svg viewBox="-24 -14 48 28" aria-hidden="true">
            {@render molecule(particle.kind)}
          </svg>
          <span>{particle.formula} {particle.name}</span>
        </li>
      {/each}
    </ul>
  </div>

  <table class="diagram-table" data-table="amounts">
    <caption>Number of molecules</caption>
    <thead>
      <tr>
        <th scope="col"><span class="visually-hidden">Stage</span></th>
        <th scope="col">NO</th>
        <th scope="col">F₂</th>
        <th scope="col">NOF</th>
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

  <p class="diagram-readout" role="status">{readout(no, f2)}</p>
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span class="diagram-slider-head">
        <span>Nitrogen monoxide, NO</span>
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
        <span>Fluorine, F₂</span>
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
</div>
