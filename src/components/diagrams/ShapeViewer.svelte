<script lang="ts">
  import { onMount } from 'svelte';
  import {
    DRAWING,
    MOLECULES,
    depthOrder,
    footprints,
    moleculeById,
    shapeDescription,
    shapeReadout,
    startView,
    type Footprint,
  } from '../../lib/vsepr';

  // Drawing units; the sizes of atoms and bonds are in DRAWING.
  const CENTER = { x: 150, y: 135 };
  const DOT_SPREAD = 3.5;
  const TURN_STEP = 15;
  const MAX_PITCH = 90;
  const DEGREES_PER_PIXEL = 0.6;
  const START_MOLECULE = 'CH4';
  const START = moleculeById(START_MOLECULE);
  if (!START) throw new Error(`The starting molecule ${START_MOLECULE} is not in MOLECULES in src/lib/vsepr.ts.`);

  let moleculeId = $state(START.id);
  let yaw = $state(startView(START).yaw);
  let pitch = $state(startView(START).pitch);
  let hydrated = $state(false);
  // Where the last pointer event of a drag was. Not drawn, so not reactive.
  let drag: { pointerId: number; x: number; y: number } | undefined;

  const molecule = $derived.by(() => {
    const found = moleculeById(moleculeId);
    if (!found) throw new Error(`The molecule "${moleculeId}" is not in MOLECULES in src/lib/vsepr.ts.`);
    return found;
  });

  // The key is stable from one view to the next, so turning moves an atom's
  // drawing rather than handing it to whichever atom is now at that place in
  // the order.
  type Item =
    | { kind: 'central'; key: string; depth: number }
    | { kind: 'atom'; key: string; depth: number; index: number; x: number; y: number; r: number; opacity: number }
    | { kind: 'bond'; key: string; depth: number; x2: number; y2: number; opacity: number }
    | {
        kind: 'pair';
        key: string;
        depth: number;
        x: number;
        y: number;
        rx: number;
        angle: number;
        dots: { x: number; y: number }[];
        opacity: number;
      };

  /** Fails the build when a new kind of item is added and not drawn. */
  function unhandledItem(item: never): never {
    throw new Error(`The shape viewer has no drawing for ${JSON.stringify(item)}. Add a branch for it.`);
  }

  /** Nearer things solid, farther ones fading, so depth reads without a 3D library. */
  const fade = (depth: number) => (depth < 0 ? 0.45 + 0.55 * (1 + depth) : 1);

  /** Fails the build when a new kind of footprint is added and not turned into items. */
  function unhandledFootprint(footprint: never): never {
    throw new Error(`The shape viewer cannot draw the footprint ${JSON.stringify(footprint)}. Add a branch for it.`);
  }

  function itemsFor(footprint: Footprint): Item[] {
    switch (footprint.kind) {
      case 'central':
        return [{ kind: 'central', key: footprint.id, depth: footprint.depth }];
      case 'atom':
        return [
          // A bond is drawn just before the atoms at its ends, so they cover where it meets them.
          {
            kind: 'bond',
            key: `bond-${footprint.index}`,
            depth: Math.min(footprint.depth, 0) - 0.001,
            x2: footprint.x,
            y2: footprint.y,
            opacity: fade(footprint.depth),
          },
          {
            kind: 'atom',
            key: footprint.id,
            depth: footprint.depth,
            index: footprint.index,
            x: footprint.x,
            y: footprint.y,
            r: footprint.r,
            opacity: fade(footprint.depth),
          },
        ];
      case 'pair':
        return [
          {
            kind: 'pair',
            key: footprint.id,
            depth: footprint.depth,
            x: footprint.x,
            y: footprint.y,
            rx: footprint.r,
            angle: footprint.angle,
            dots: [
              { x: footprint.x - footprint.along.y * DOT_SPREAD, y: footprint.y + footprint.along.x * DOT_SPREAD },
              { x: footprint.x + footprint.along.y * DOT_SPREAD, y: footprint.y - footprint.along.x * DOT_SPREAD },
            ],
            opacity: fade(footprint.depth),
          },
        ];
      default:
        return unhandledFootprint(footprint);
    }
  }

  const items = $derived(depthOrder(footprints(molecule, { yaw, pitch }, CENTER).flatMap(itemsFor)));
  const readout = $derived(shapeReadout(molecule));
  const description = $derived(shapeDescription(molecule));
  const f = (value: number) => value.toFixed(1);
  const wrap = (degrees: number) => ((degrees % 360) + 360) % 360;
  // Tipping stops at straight up and straight down: past either, the molecule would turn over.
  const clampPitch = (degrees: number) => Math.min(MAX_PITCH, Math.max(-MAX_PITCH, degrees));

  function turnBy(yawDelta: number, pitchDelta: number) {
    yaw = wrap(yaw + yawDelta);
    pitch = clampPitch(pitch + pitchDelta);
  }

  function onKeydown(event: KeyboardEvent) {
    // Alt+Left is the browser's Back; Ctrl and Meta with an arrow are shortcuts too. Not ours to take.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'ArrowLeft':
        turnBy(-TURN_STEP, 0);
        break;
      case 'ArrowRight':
        turnBy(TURN_STEP, 0);
        break;
      case 'ArrowUp':
        turnBy(0, -TURN_STEP);
        break;
      case 'ArrowDown':
        turnBy(0, TURN_STEP);
        break;
      default:
        return;
    }
    // The arrow keys turn the molecule instead of scrolling the page.
    event.preventDefault();
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    if (event.currentTarget instanceof Element) event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    turnBy((event.clientX - drag.x) * DEGREES_PER_PIXEL, (event.clientY - drag.y) * DEGREES_PER_PIXEL);
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function endDrag(event: PointerEvent) {
    if (drag?.pointerId === event.pointerId) drag = undefined;
  }

  function resetView() {
    const view = startView(molecule);
    yaw = view.yaw;
    pitch = view.pitch;
  }

  // Each molecule opens at its own start view: no one view shows every
  // geometry without atoms covering one another.
  function chooseMolecule(id: string) {
    moleculeId = id;
    resetView();
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="shape-viewer" data-hydrated={hydrated ? 'true' : undefined}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div
    class="shape-stage"
    role={hydrated ? 'group' : undefined}
    tabindex={hydrated ? 0 : undefined}
    aria-roledescription={hydrated ? 'rotatable 3D model' : undefined}
    aria-label={hydrated ? 'Turn the molecule: drag, or use the arrow keys' : undefined}
    onkeydown={onKeydown}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={endDrag}
    onpointercancel={endDrag}
  >
    <svg viewBox="0 0 300 270" role="img" aria-label={description}>
      {#each items as item (item.key)}
        {#if item.kind === 'central'}
          <circle class="shape-atom is-central" data-atom="central" cx={CENTER.x} cy={CENTER.y} r={DRAWING.centralRadius} />
          <text class="shape-atom-label is-central" x={CENTER.x} y={CENTER.y} dy="0.35em">{molecule.central}</text>
        {:else if item.kind === 'bond'}
          <line class="shape-bond" x1={CENTER.x} y1={CENTER.y} x2={f(item.x2)} y2={f(item.y2)} opacity={f(item.opacity)} />
        {:else if item.kind === 'atom'}
          <!-- Faded by its outline and letter only: a see-through atom would show the bond behind it. -->
          <circle
            class="shape-atom"
            data-atom="terminal"
            data-index={item.index}
            cx={f(item.x)}
            cy={f(item.y)}
            r={f(item.r)}
            stroke-opacity={f(item.opacity)}
          />
          <text class="shape-atom-label" x={f(item.x)} y={f(item.y)} dy="0.35em" fill-opacity={f(item.opacity)}>{molecule.terminal}</text>
        {:else if item.kind === 'pair'}
          <g data-lone-pair opacity={f(item.opacity)}>
            <ellipse
              class="shape-pair"
              cx={f(item.x)}
              cy={f(item.y)}
              rx={f(item.rx)}
              ry={DRAWING.lonePairWidth}
              transform={`rotate(${f(item.angle)} ${f(item.x)} ${f(item.y)})`}
            />
            {#each item.dots as dot}
              <circle class="shape-pair-dot" cx={f(dot.x)} cy={f(dot.y)} r="2" />
            {/each}
          </g>
        {:else}
          {@const unhandled = unhandledItem(item)}
          {unhandled}
        {/if}
      {/each}
    </svg>
  </div>
  <p class="diagram-readout" role="status">{readout}</p>
  <div class="diagram-controls">
    <label class="diagram-select">
      <span>Molecule</span>
      <select value={moleculeId} onchange={(event) => chooseMolecule(event.currentTarget.value)}>
        {#each MOLECULES as m (m.id)}
          <option value={m.id}>{m.formula}, {m.name}</option>
        {/each}
      </select>
    </label>
    <div class="diagram-actions">
      <button type="button" class="diagram-button" onclick={resetView}>Reset view</button>
      <p class="diagram-detail">Drag the molecule to turn it, or move to the drawing and use the arrow keys.</p>
    </div>
  </div>
</div>
