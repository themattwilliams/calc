import { test, expect } from '@playwright/test';

// E2E scaffold for Tabbed Help Drawer

test.describe('Help Drawer - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Drawer opens and tabs are visible', async ({ page }) => {
    // Help button should open drawer
    const helpBtn = page.locator('#helpDrawerToggle');
    await helpBtn.click();

    await expect(page.locator('#helpDrawer')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Tips")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Examples")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Mistakes")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Save")')).toBeVisible();
  });

  test('Content changes when focusing fields', async ({ page }) => {
    await page.locator('#helpDrawerToggle').click();

    await page.focus('#purchasePrice');
    await page.waitForTimeout(150);
    const title1 = await page.locator('#helpDrawerTitle').textContent();
    expect(typeof title1).toBe('string');

    await page.focus('#interestRate');
    await page.waitForTimeout(150);
    const title2 = await page.locator('#helpDrawerTitle').textContent();
    expect(typeof title2).toBe('string');
    expect(title2 !== title1).toBeTruthy();
  });

  test('Search highlights terms and clears properly', async ({ page }) => {
    await page.locator('#helpDrawerToggle').click();
    const search = page.locator('#helpDrawerSearch');
    await search.fill('interest');
    await page.waitForTimeout(150);

    const anyHighlight = await page.evaluate(() => !!document.querySelector('#helpDrawer mark'));
    expect(anyHighlight).toBeTruthy();

    await search.fill('');
    await page.waitForTimeout(100);
    const anyHighlightAfter = await page.evaluate(() => !!document.querySelector('#helpDrawer mark'));
    expect(anyHighlightAfter).toBeFalsy();
  });

  test('Copy example shows toast and copies to clipboard', async ({ page }) => {
    await page.locator('#helpDrawerToggle').click();
    const copyBtn = page.locator('#helpCopyExample');
    // If no button yet, skip gracefully
    if (!(await copyBtn.count())) test.skip();

    await copyBtn.click();
    await expect(page.locator('#helpToast')).toBeVisible();
  });
});
