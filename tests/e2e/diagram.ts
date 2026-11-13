import { expect, type Locator, type Page } from '@playwright/test';

/** Opens a lesson and returns one of its diagrams once its script has taken over. */
export async function openDiagram(page: Page, path: string, name: string): Promise<Locator> {
  await page.goto(path);
  const diagram = page.locator(`[data-diagram="${name}"]`);
  // A diagram's script loads only when the diagram scrolls into view.
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toHaveAttribute('data-hydrated', 'true');
  return diagram;
}

/** With JavaScript off: the drawing and its starting values show, the controls do not. */
export async function expectStaticDiagram(page: Page, path: string, name: string, readout: string) {
  await page.goto(path);
  const diagram = page.locator(`[data-diagram="${name}"]`);
  await expect(diagram.locator('svg').first()).toBeVisible();
  await expect(diagram.getByRole('status')).toHaveText(readout);
  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('.diagram-note')).toBeVisible();
}
