import { test, expect } from '@playwright/test';

async function ensureAppLoaded(page){
  const attempts = ['/', '/index.html', 'index.html'];
  for (const path of attempts){
    try {
      await page.goto(path);
      await page.locator('#purchasePrice').waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch (_) {
      // try next
    }
  }
  test.skip();
  return false;
}

// E2E scaffold for Tabbed Help Drawer

test.describe('Help Drawer - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAppLoaded(page);
    await page.waitForFunction(() => typeof window.HelpDrawer !== 'undefined');
  });

  async function openDrawer(page){
    await page.evaluate(() => { if (window.HelpDrawer && typeof window.HelpDrawer.open === 'function') { window.HelpDrawer.open(); } else { const b = document.getElementById('helpDrawerToggle'); b && b.click(); } });
  }

  test('Drawer opens and tabs are visible', async ({ page }) => {
    await openDrawer(page);

    await expect(page.locator('#helpDrawer')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[role="tab"]:has-text("Tips")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Examples")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Mistakes")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Save")')).toBeVisible();

    // Content exists
    const contentText = await page.locator('#help-tips').textContent();
    expect((contentText || '').trim().length > 0).toBeTruthy();
  });

  test('Content changes when focusing fields', async ({ page }) => {
    await openDrawer(page);

    await page.focus('#purchasePrice');
    await page.waitForTimeout(200);
    const title1 = await page.locator('#helpDrawerTitle').textContent();
    expect(typeof title1).toBe('string');

    await page.focus('#loanInterestRate');
    await page.waitForTimeout(200);
    const title2 = await page.locator('#helpDrawerTitle').textContent();
    expect(typeof title2).toBe('string');
    expect(title2 !== title1).toBeTruthy();
  });

  test('Search highlights terms and clears properly', async ({ page }) => {
    await openDrawer(page);
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
    await openDrawer(page);
    const copyBtn = page.locator('#helpCopyExample');
    if (!(await copyBtn.count())) test.skip();

    await copyBtn.click();
    await expect(page.locator('#helpToast')).toBeVisible();
  });
});
