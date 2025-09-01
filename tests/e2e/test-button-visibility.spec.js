import { test, expect } from '@playwright/test';

// Validate the presence and placement of the Tests button in the app

test.describe('UI - Tests Button Visibility and Placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Tests button is visible and fixed at top-right', async ({ page }) => {
    const btn = page.locator('.test-runner-link');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('Tests');

    // Ensure fixed positioning
    const position = await btn.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe('fixed');

    // Validate approximate placement (within ~40px of top/right)
    const box = await btn.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) test.fail();
    const distanceTop = box.y;
    const distanceRight = viewport.width - (box.x + box.width);

    expect(distanceTop).toBeLessThan(60);
    expect(distanceRight).toBeLessThan(60);
  });

  test('Clicking Tests button navigates to test-runner.html', async ({ page }) => {
    const btn = page.locator('.test-runner-link');
    await btn.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/test-runner\.html/);
  });
});
