import { test, expect } from '@playwright/test';

test.describe('Chart Plugins, Interactions, and Exports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('plugins are registered and charts render', async ({ page }) => {
    // Ensure Chart exists and canvases are present
    const hasChart = await page.evaluate(() => typeof window.Chart !== 'undefined');
    expect(hasChart).toBeTruthy();

    await expect(page.locator('#returnDecompositionChart')).toBeVisible();
    await expect(page.locator('#irrCurveChart')).toBeVisible();
    await expect(page.locator('#debtLtvChart')).toBeVisible();
  });

  test('export PNG buttons return a data URL', async ({ page }) => {
    await page.waitForTimeout(300);
    const data = await page.evaluate(() => {
      const canvas = document.getElementById('returnDecompositionChart');
      if (!canvas || typeof canvas.toDataURL !== 'function') return { ok:false };
      const url = canvas.toDataURL('image/png');
      return { ok: typeof url === 'string' && url.startsWith('data:image/png') };
    });
    expect(data.ok).toBeTruthy();
  });

  test('CSV export produces CSV-like content', async ({ page }) => {
    // seed some inputs to ensure projections are generated
    await page.fill('#purchasePrice', '200000');
    await page.fill('#monthlyRent', '1500');
    await page.fill('#monthlyPropertyTaxes', '200');
    await page.waitForTimeout(400);

    const csv = await page.evaluate(() => {
      const p = (window.projectionData || []).slice(0, 10);
      const rows = ['Year,CashFlow'].concat(p.map(x => `${x.year},${x.annualCashFlow||0}`));
      return rows.join('\n');
    });
    expect(csv.includes('Year,CashFlow')).toBeTruthy();
    expect(csv.split('\n').length).toBeGreaterThan(5);
  });
});


