<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BONDS,
    FAMILIES,
    curvePoints,
    distanceReadout,
    potentialEnergy,
    sliderRange,
    type Bond,
    type FamilyId,
  } from '../../lib/bonding';

  // Drawing units. The picture of the two atoms sits above the graph, with
  // the left nucleus over the 0 pm end of the axis and the right one over the
  // distance set, so the gap between them is the distance read on the axis.
  const PLOT = { left: 52, right: 306, top: 84, bottom: 284 };
  const ATOMS_Y = 36;
  /**
   * Drawing units per pm for the atom circles: a circle's radius is half the
   * bond length times this. It is a picture scale of its own, not the graph's
   * axis scale (which is about 0.85 units per pm), so atoms stay small enough
   * to sit above the graph.
   */
  const ATOM_SCALE = 0.2;
  // The right atom follows the slider out to the graph's right edge, so the
  // drawing reserves room beyond it for the biggest atom (the largest bond
  // length of either family), plus its outline.
  const OUTLINE_ROOM = 2;
  const LARGEST_ATOM_RADIUS = (Math.max(...Object.values(BONDS).map((b) => b.length)) / 2) * ATOM_SCALE;
  const VIEW = { width: Math.ceil(PLOT.right + LARGEST_ATOM_RADIUS) + OUTLINE_ROOM, height: 326 };
  const FAMILY_IDS: FamilyId[] = ['carbon', 'halogens'];
  // Where each curve's name sits, from the bottom of its well, in drawing
  // units. The curves cross, so each name is placed by hand where no curve
  // passes; a browser test checks that none touches a curve.
  const LABEL_OFFSET: Record<keyof typeof BONDS, { dx: number; dy: number; anchor: 'middle' | 'start' }> = {
    'c-single': { dx: -4, dy: 14, anchor: 'middle' },
    'c-double': { dx: -8.5, dy: 14, anchor: 'middle' },
    'c-triple': { dx: 0, dy: 14, anchor: 'middle' },
    cl: { dx: 12, dy: 4, anchor: 'start' },
    br: { dx: 12, dy: 4, anchor: 'start' },
    i: { dx: 14, dy: 4, anchor: 'start' },
  };
  const START: Bond = BONDS['c-single'];

  let familyId = $state<FamilyId>('carbon');
  let bondId = $state<string>(START.id);
  let distance = $state<number>(START.length);
  let hydrated = $state(false);

  const family = $derived(FAMILIES[familyId]);
  const axis = $derived(family.axis);
  const bond = $derived.by(() => {
    const found = family.bonds.find((b) => b.id === bondId);
    if (!found) throw new Error(`The bond "${bondId}" is not one of the ${family.label} bonds.`);
    return found;
  });
  const range = $derived(sliderRange(bond, axis));

  const xFor = (r: number) => PLOT.left + (r / axis.maxDistance) * (PLOT.right - PLOT.left);
  const yFor = (energy: number) =>
    PLOT.top + ((axis.maxEnergy - energy) / (axis.maxEnergy - axis.minEnergy)) * (PLOT.bottom - PLOT.top);
  const f = (value: number) => value.toFixed(1);
  /** A minus sign, not a hyphen, on negative tick labels. */
  const tickText = (value: number) => (value < 0 ? `−${Math.abs(value)}` : String(value));

  function pathFor(b: Bond): string {
    return curvePoints(b, axis)
      .map((p, index) => `${index === 0 ? 'M' : 'L'}${f(xFor(p.distance))} ${f(yFor(p.energy))}`)
      .join('');
  }

  function labelFor(b: Bond): { x: number; y: number; anchor: 'middle' | 'start' } {
    const offset = Object.entries(LABEL_OFFSET).find(([id]) => id === b.id)?.[1];
    if (!offset) throw new Error(`No label position for the bond ${b.id}. Add one to LABEL_OFFSET.`);
    return { x: xFor(b.length) + offset.dx, y: yFor(-b.energy) + offset.dy, anchor: offset.anchor };
  }

  const markerX = $derived(xFor(distance));
  const markerY = $derived(yFor(potentialEnergy(bond, distance)));
  const atomRadius = $derived((bond.length / 2) * ATOM_SCALE);
  const readout = $derived(distanceReadout(bond, distance));
  const drawing = $derived(
    `Graph of potential energy against the distance between the nuclei, with one curve each for ` +
      `${family.bonds.map((b) => b.name).join(', ')}. Each curve dips to its lowest point at the bond length, ` +
      `climbs steeply when the nuclei are closer and levels off at zero when they are far apart. ` +
      `The ${bond.name} curve is drawn darker, with a dot at the distance set below. ` +
      `Above the graph, two ${bond.symbol} atoms are drawn that far apart.`,
  );

  function chooseFamily(id: FamilyId) {
    familyId = id;
    const first = FAMILIES[id].bonds[0];
    if (!first) throw new Error(`The ${FAMILIES[id].label} family has no bonds.`);
    bondId = first.id;
    distance = first.length;
  }

  function chooseBond(id: string) {
    bondId = id;
    // The distance stays where it was, so the same distance can be compared
    // across bonds, unless the new curve is off the top of the graph there.
    distance = Math.min(range.max, Math.max(range.min, distance));
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="bond-energy-curve" data-hydrated={hydrated ? 'true' : undefined}>
  <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={drawing}>
    <circle class="diagram-atom" data-atom="left" cx={f(xFor(0))} cy={ATOMS_Y} r={f(atomRadius)} />
    <circle class="diagram-atom" data-atom="right" cx={f(markerX)} cy={ATOMS_Y} r={f(atomRadius)} />
    <text class="diagram-atom-label" x={f(xFor(0))} y={ATOMS_Y} dy="0.35em" text-anchor="middle">{bond.symbol}</text>
    <text class="diagram-atom-label" x={f(markerX)} y={ATOMS_Y} dy="0.35em" text-anchor="middle">{bond.symbol}</text>
    <line class="diagram-guide" x1={f(markerX)} y1={f(ATOMS_Y + atomRadius)} x2={f(markerX)} y2={f(markerY)} />

    <path class="diagram-axis" d={`M${PLOT.left} ${PLOT.top - 4}V${PLOT.bottom}H${PLOT.right + 4}`} />
    {#each axis.distanceTicks as tick (tick)}
      <line class="diagram-axis" data-tick-distance={tick} x1={f(xFor(tick))} y1={PLOT.bottom} x2={f(xFor(tick))} y2={PLOT.bottom + 4} />
      <text class="diagram-label" x={f(xFor(tick))} y={PLOT.bottom + 15} text-anchor="middle">{tick}</text>
    {/each}
    {#each axis.energyTicks as tick (tick)}
      <line class="diagram-axis" x1={PLOT.left - 4} y1={f(yFor(tick))} x2={PLOT.left} y2={f(yFor(tick))} />
      <text class="diagram-label" x={PLOT.left - 6} y={f(yFor(tick))} dy="0.35em" text-anchor="end">{tickText(tick)}</text>
    {/each}
    <text class="diagram-label" x={PLOT.right} y={PLOT.bottom + 33} text-anchor="end">distance between nuclei (pm)</text>
    <text
      class="diagram-label"
      x="0"
      y="0"
      text-anchor="middle"
      transform={`translate(11 ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`}>potential energy (kJ/mol)</text
    >

    <line class="diagram-zero" x1={PLOT.left} y1={f(yFor(0))} x2={PLOT.right} y2={f(yFor(0))} />
    <text class="diagram-label" x={PLOT.right} y={f(yFor(0) - 5)} text-anchor="end">0: separate atoms</text>

    {#each family.bonds as b, index (b.id)}
      {#if b.id !== bond.id}
        <path class={`diagram-curve is-faint is-pattern-${index}`} data-curve={b.id} d={pathFor(b)} />
      {/if}
    {/each}
    {#each family.bonds as b, index (b.id)}
      {#if b.id === bond.id}
        <path class={`diagram-curve is-accent is-pattern-${index}`} data-curve={b.id} data-selected d={pathFor(b)} />
      {/if}
    {/each}
    {#each family.bonds as b (b.id)}
      {@const label = labelFor(b)}
      <text
        class={b.id === bond.id ? 'diagram-label is-selected' : 'diagram-label'}
        data-curve-label={b.id}
        x={f(label.x)}
        y={f(label.y)}
        text-anchor={label.anchor}>{b.name}</text
      >
    {/each}
    <circle class="diagram-marker" data-marker cx={f(markerX)} cy={f(markerY)} r="5" />
  </svg>
  <p class="diagram-readout" role="status">{readout}</p>
  <div class="diagram-controls">
    <fieldset class="diagram-choice">
      <legend>Compare</legend>
      {#each FAMILY_IDS as id (id)}
        <label>
          <input type="radio" name="bond-energy-family" value={id} checked={familyId === id} onchange={() => chooseFamily(id)} />
          {FAMILIES[id].label}
        </label>
      {/each}
    </fieldset>
    <fieldset class="diagram-choice">
      <legend>Bond</legend>
      {#each family.bonds as b (b.id)}
        <label>
          <input type="radio" name="bond-energy-bond" value={b.id} checked={bondId === b.id} onchange={() => chooseBond(b.id)} />
          {b.name}
        </label>
      {/each}
    </fieldset>
    <label class="diagram-slider">
      <span>Distance between the nuclei</span>
      <input type="range" min={range.min} max={range.max} step="1" aria-valuetext={`${distance} pm`} bind:value={distance} />
    </label>
  </div>
</div>
