<script lang="ts">
  import { onMount } from 'svelte';
  import { formatQuantity } from '../../lib/format';
  import { rateLawRate, type Order } from '../../lib/kinetics';

  // The units of k depend on the overall order, so the diagram gives k as a
  // bare number and reports only the rate, which is always in M/s.
  const K = 0.1;
  const ORDERS: Order[] = [0, 1, 2];
  // Every concentration tops out at 1.0 M, where the rate is k whatever the orders.
  const LARGEST_RATE = K;
  const TRACK = { x: 0, y: 4, width: 300, height: 22 };

  let a = $state(0.4);
  let b = $state(0.2);
  let orderA = $state<Order>(2);
  let orderB = $state<Order>(1);
  let hydrated = $state(false);

  const rate = $derived(rateLawRate(K, a, orderA, b, orderB));
  const law = $derived(`rate = k${term('A', orderA)}${term('B', orderB)}`);
  const barWidth = $derived(Math.max(1, (rate / LARGEST_RATE) * TRACK.width));

  function term(name: string, order: Order): string {
    if (order === 0) return '';
    return order === 1 ? `[${name}]` : `[${name}]²`;
  }

  function effectOfDoubling(order: Order): string {
    if (order === 0) return 'leaves the rate unchanged';
    return order === 1 ? 'doubles the rate' : 'multiplies the rate by 4';
  }

  onMount(() => {
    hydrated = true;
  });
</script>

<div class="diagram-body" data-diagram="rate-law-explorer" data-hydrated={hydrated ? 'true' : undefined}>
  <p class="diagram-readout" role="status">{law} = {formatQuantity(rate)} M/s</p>
  <svg
    viewBox="0 0 300 30"
    role="img"
    aria-label={`Bar showing the rate, ${formatQuantity(rate)} M/s, against the largest rate this diagram can reach, ${formatQuantity(LARGEST_RATE)} M/s.`}
  >
    <rect class="diagram-track" x={TRACK.x} y={TRACK.y} width={TRACK.width} height={TRACK.height} rx="4" />
    <rect class="diagram-bar" x={TRACK.x} y={TRACK.y} width={barWidth} height={TRACK.height} rx="4" />
  </svg>
  <p class="diagram-detail">
    Here k = {formatQuantity(K)}. Doubling [A] {effectOfDoubling(orderA)}. Doubling [B] {effectOfDoubling(orderB)}.
  </p>
  <div class="diagram-controls">
    <label class="diagram-slider">
      <span>[A] = {a.toFixed(2)} M</span>
      <input type="range" min="0.1" max="1" step="0.1" bind:value={a} />
    </label>
    <label class="diagram-slider">
      <span>[B] = {b.toFixed(2)} M</span>
      <input type="range" min="0.1" max="1" step="0.1" bind:value={b} />
    </label>
    <fieldset class="diagram-choice">
      <legend>Order in A</legend>
      {#each ORDERS as option}
        <label><input type="radio" name="rate-law-order-a" value={option} bind:group={orderA} />{option}</label>
      {/each}
    </fieldset>
    <fieldset class="diagram-choice">
      <legend>Order in B</legend>
      {#each ORDERS as option}
        <label><input type="radio" name="rate-law-order-b" value={option} bind:group={orderB} />{option}</label>
      {/each}
    </fieldset>
  </div>
</div>
