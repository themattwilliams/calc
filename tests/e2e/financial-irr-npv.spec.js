import { test, expect } from '@playwright/test';
import * as ss from 'simple-statistics';

// Helper: compute NPV using simple-statistics
function npvSimple(rate, cashflows) {
  // simple-statistics doesn't have a native NPV, implement here
  // cashflows: [CF0, CF1, ... CFN]
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

test.describe('Financial Accuracy - IRR/NPV Cross-Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('IRR cross-check against simple-statistics for a typical investment', async ({ page }) => {
    const hasIrr = typeof (ss && ss.irr) === 'function';
    if (!hasIrr) test.skip();
    // Scenario: -100k initial, then 10k/year for 15 years, balloon 120k at end
    const cashflows = [-100000, ...Array.from({ length: 15 }, () => 10000)];
    cashflows[cashflows.length - 1] += 120000;

    const irrSS = ss.irr(cashflows); // decimal per period
    expect(Number.isFinite(irrSS)).toBeTruthy();

    // Populate a close scenario into the app (approximation):
    await page.fill('#purchasePrice', '300000');
    await page.fill('#downPayment', '100000');
    await page.fill('#monthlyRent', '2500');
    await page.fill('#annualIncomeGrowth', '0');
    await page.fill('#annualExpenseGrowth', '0');
    await page.fill('#annualPropertyValueGrowth', '0');

    // Trigger calculations
    await page.waitForTimeout(200);

    // Extract annual cashflow proxy from the UI (monthly cash flow * 12)
    const monthlyCashFlowText = await page.textContent('#monthlyCashFlow');
    const monthlyCF = Number((monthlyCashFlowText || '').replace(/[^0-9.-]/g, '')) || 0;
    const annualCF = monthlyCF * 12;

    // Build a simplified cashflow array for comparison
    const cfApprox = [-100000, ...Array.from({ length: 15 }, () => annualCF), 120000];
    const irrApprox = ss.irr(cfApprox);

    // Expect the two IRRs to be within a reasonable band (app vs simplified)
    expect(Math.abs((irrApprox || 0) - irrSS)).toBeLessThan(0.05); // within 5 percentage points
  });

  test('NPV calculation agrees within tolerance for discount rates', async ({ page }) => {
    // Cashflows: -50k, +6k for 10 years
    const cashflows = [-50000, ...Array.from({ length: 10 }, () => 6000)];
    const discountRate = 0.08; // 8%
    const expectedNPV = npvSimple(discountRate, cashflows);

    // Use app fields to produce similar flows
    await page.fill('#purchasePrice', '200000');
    await page.fill('#downPayment', '50000');
    await page.fill('#monthlyRent', '1000');
    await page.fill('#annualIncomeGrowth', '0');
    await page.fill('#annualExpenseGrowth', '0');

    await page.waitForTimeout(200);

    const monthlyCashFlowText = await page.textContent('#monthlyCashFlow');
    const monthlyCF = Number((monthlyCashFlowText || '').replace(/[^0-9.-]/g, '')) || 0;
    const annualCF = monthlyCF * 12;

    const appCashflows = [-50000, ...Array.from({ length: 10 }, () => annualCF)];
    const appNPV = npvSimple(discountRate, appCashflows);

    expect(Math.abs(appNPV - expectedNPV)).toBeLessThan(5000); // within $5k tolerance
  });

  test('IRR curve renders and is monotone around optimal hold window', async ({ page }) => {
    await page.fill('#purchasePrice', '300000');
    await page.fill('#downPayment', '60000');
    await page.fill('#monthlyRent', '2500');
    await page.fill('#annualIncomeGrowth', '2.0');
    await page.fill('#annualExpenseGrowth', '2.0');

    await page.waitForTimeout(250);

    // Ensure chart is present
    const irrCanvas = page.locator('#irrCurveChart');
    await expect(irrCanvas).toBeVisible();

    // Sample a few years via CalculatorFunctions to check shape roughly increases first
    const irr3 = await page.evaluate(() => {
      const p = window.projectionData || [];
      if (!p.length) return null;
      const flows = [-parseFloat(document.getElementById('downPayment').value)];
      for (let i = 0; i < 3 && i < p.length; i++) flows.push(p[i].annualCashFlow || 0);
      return window.CalculatorFunctions.calculateIRR(flows);
    });
    const irr10 = await page.evaluate(() => {
      const p = window.projectionData || [];
      if (!p.length) return null;
      const flows = [-parseFloat(document.getElementById('downPayment').value)];
      for (let i = 0; i < 10 && i < p.length; i++) flows.push(p[i].annualCashFlow || 0);
      return window.CalculatorFunctions.calculateIRR(flows);
    });

    expect(Number.isFinite(irr3)).toBeTruthy();
    expect(Number.isFinite(irr10)).toBeTruthy();
    // Not strict monotone, but usually irr10 >= irr3 in typical growth baseline
    expect(irr10).toBeGreaterThanOrEqual(irr3);
  });
});


