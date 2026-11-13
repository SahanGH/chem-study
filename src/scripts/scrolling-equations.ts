/**
 * A display equation or a table too wide for the screen scrolls sideways
 * inside its own box. A box that scrolls must be reachable from the keyboard
 * (WCAG 2.1.1), but KaTeX and Markdown generate the markup, so the page
 * cannot carry the tabindex. This adds it, with a name, to exactly the boxes
 * that overflow now, and removes it again when a wider window or a smaller
 * font stops the overflow. Boxes that fit stay out of the tab order.
 */
export {};

const KINDS = [
  { selector: '.katex-display', label: 'Equation, scrolls sideways' },
  { selector: '.prose table', label: 'Table, scrolls sideways' },
];

const labels = new Map<HTMLElement, string>();
for (const { selector, label } of KINDS) {
  for (const box of document.querySelectorAll<HTMLElement>(selector)) labels.set(box, label);
}

function update(box: HTMLElement): void {
  const label = labels.get(box);
  if (label === undefined) throw new Error('Asked to update a scrolling box that was never registered.');
  if (box.scrollWidth > box.clientWidth) {
    box.tabIndex = 0;
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', label);
  } else {
    box.removeAttribute('tabindex');
    box.removeAttribute('role');
    box.removeAttribute('aria-label');
  }
}

function updateAll(): void {
  for (const box of labels.keys()) update(box);
}

updateAll();

// A box's own size only changes with the window or its container, so this
// catches resizing. The math inside an equation is display: block and as wide
// as its box, so a ResizeObserver on it would never fire when the math fonts
// arrive, even though that is when the content's true width (scrollWidth)
// settles. The font events cover that.
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target instanceof HTMLElement) update(entry.target);
  }
});
for (const box of labels.keys()) observer.observe(box);

void document.fonts.ready.then(updateAll);
document.fonts.addEventListener('loadingdone', updateAll);
