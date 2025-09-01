import { test, expect } from '@playwright/test';

async function goProd(page){
  try{
    await page.goto('http://localhost:8081/index.html');
    await page.waitForLoadState('networkidle');
    return true;
  }catch(_){
    test.skip();
    return false;
  }
}

test.describe('GitHub Pages Production Build', () => {
  test.beforeEach(async ({ page }) => {
    // This will test the built version in docs/
    await page.goto('http://localhost:8081/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test('GitHub Pages build loads correctly', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle('Rental Property Analysis Calculator');

    // Verify main components are present
    await expect(page.locator('#purchasePrice')).toBeVisible();
    await expect(page.locator('#monthlyRent')).toBeVisible();
    await expect(page.locator('#saveTopBtn')).toBeVisible();
    await expect(page.locator('#loadBtn')).toBeVisible();

    // Verify charts are present
    await expect(page.locator('#incomeExpensesChart')).toBeVisible();
    await expect(page.locator('#equityValueChart')).toBeVisible();
    await expect(page.locator('#amortizationChart')).toBeVisible();

    // Verify test runner link is removed
    const testRunnerLink = await page.locator('a[href="test-runner.html"]').count();
    expect(testRunnerLink).toBe(0);
  });

  test('Core calculations work in production build', async ({ page }) => {
    // Test basic calculation functionality
    await page.fill('#purchasePrice', '300000');
    await page.fill('#purchaseClosingCosts', '0'); // Clear default values
    await page.fill('#estimatedRepairCosts', '0');
    await page.fill('#downPayment', '60000');
    await page.fill('#monthlyRent', '2500');
    await page.fill('#monthlyPropertyTaxes', '500');

    await page.waitForTimeout(500);

    // Verify calculations display
    const downPaymentText = await page.locator('#downPaymentText').textContent();
    expect(downPaymentText).toContain('20.0%');

    const totalCostText = await page.locator('#totalCostOfProject').textContent();
    expect(totalCostText).toContain('$300,000.00');

    const loanAmountText = await page.locator('#loanAmount').textContent();
    expect(loanAmountText).toContain('$240,000.00');
  });

  test('Quick entry buttons work in production', async ({ page }) => {
    await page.fill('#purchasePrice', '250000');
    
    // Test 25% down payment button
    await page.click('button[data-target="downPayment"][data-value="25"]');
    await page.waitForTimeout(300);
    
    const downPaymentValue = await page.inputValue('#downPayment');
    expect(downPaymentValue).toBe('62500.00');
    
    const downPaymentText = await page.locator('#downPaymentText').textContent();
    expect(downPaymentText).toContain('25.0%');
  });

  test('Save as markdown works in production', async ({ page }) => {
    // Fill some data
    await page.fill('#propertyAddress', 'GitHub Pages Test Property');
    await page.fill('#purchasePrice', '275000');
    await page.fill('#monthlyRent', '2200');
    
    await page.waitForTimeout(500);
    
    // Test save functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('#saveTopBtn');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/.*_analysis_.*\.md$/);
  });

  test('Load from markdown works in production', async ({ page }) => {
    // This test would require a pre-created markdown file
    // For now, we'll just verify the load button exists and is functional
    await expect(page.locator('#loadBtn')).toBeVisible();
    await expect(page.locator('#markdownFileInput')).toBeAttached();
    
    // Verify clicking load button triggers file input
    await page.click('#loadBtn');
    // The file input should be triggered (though no file selected in test)
  });

  test('Charts render correctly in production', async ({ page }) => {
    // Fill data to generate charts
    await page.fill('#purchasePrice', '300000');
    await page.fill('#downPayment', '60000');
    await page.fill('#loanInterestRate', '6.5');
    await page.fill('#monthlyRent', '2500');
    await page.fill('#monthlyPropertyTaxes', '500');
    await page.fill('#monthlyInsurance', '150');
    
    await page.waitForTimeout(1000);
    
    // Verify charts are rendered (should have canvas elements)
    const incomeChart = await page.locator('#incomeExpensesChart');
    await expect(incomeChart).toBeVisible();
    
    const equityChart = await page.locator('#equityValueChart');
    await expect(equityChart).toBeVisible();
    
    const amortizationChart = await page.locator('#amortizationChart');
    await expect(amortizationChart).toBeVisible();
  });

  test('Mobile responsiveness in production', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify elements are still visible and functional
    await expect(page.locator('#purchasePrice')).toBeVisible();
    await expect(page.locator('#monthlyRent')).toBeVisible();
    
    // Test quick entry button on mobile
    await page.fill('#purchasePrice', '200000');
    await page.click('button[data-target="downPayment"][data-value="20"]');
    
    const downPaymentValue = await page.inputValue('#downPayment');
    expect(downPaymentValue).toBe('40000.00');
  });

  test('No JavaScript errors in production', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
    });
    
    // Perform typical user actions
    await page.fill('#purchasePrice', '300000');
    await page.click('button[data-target="downPayment"][data-value="25"]');
    await page.fill('#monthlyRent', '2500');
    await page.waitForTimeout(1000);
    
    // Check for errors
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
      expect(errors).toHaveLength(0);
    }
  });

  test('External CDN resources load correctly', async ({ page }) => {
    // Verify Tailwind CSS is loaded
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(bodyBg).toBe('rgb(26, 32, 44)'); // Tailwind gray-900
    
    // Verify Chart.js is loaded
    const chartJsLoaded = await page.evaluate(() => {
      return typeof window.Chart !== 'undefined';
    });
    expect(chartJsLoaded).toBe(true);
    
    // Verify Google Fonts are loaded
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    expect(fontFamily).toContain('Inter');
  });

  test('Performance is acceptable in production', async ({ page }) => {
    const startTime = Date.now();
    
    // Fill out a complete form
    await page.fill('#purchasePrice', '400000');
    await page.fill('#downPayment', '80000');
    await page.fill('#loanInterestRate', '6.75');
    await page.fill('#monthlyRent', '3200');
    await page.fill('#monthlyPropertyTaxes', '667');
    await page.fill('#monthlyInsurance', '200');
    await page.fill('#quarterlyHoaFees', '600');
    
    // Wait for all calculations to complete
    await page.waitForTimeout(1000);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 3 seconds
    expect(totalTime).toBeLessThan(3000);
    
    // Verify calculations completed
    const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
    expect(cashFlowText).toMatch(/[\$-][0-9,]+\.[0-9]{2}/);
  });
});
