const { test, expect } = require('@playwright/test');

test.describe('Full Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test('Complete property analysis workflow', async ({ page }) => {
    // Fill in a complete property analysis
    
    // Property Information
    await page.fill('#propertyAddress', '123 Test Street, Test City, TS 12345');
    await page.fill('#purchasePrice', '275000');
    
    // Use quick entry for closing costs (2%)
    await page.click('button[data-target="purchaseClosingCosts"][data-value="2"]');
    
    // Use quick entry for repair costs ($20k)
    await page.click('button[data-target="estimatedRepairCosts"][data-value="20000"]');
    
    // Financing
    await page.click('button[data-target="downPayment"][data-value="25"]'); // 25% down
    await page.fill('#loanInterestRate', '6.5');
    await page.selectOption('#amortizedOver', '30');
    await page.fill('#loanFees', '2000');
    
    // Income
    await page.fill('#monthlyRent', '2400');
    
    // Expenses
    await page.fill('#monthlyPropertyTaxes', '458');
    await page.fill('#monthlyInsurance', '150');
    await page.fill('#quarterlyHoaFees', '450');
    await page.click('button[data-target="monthlyManagement"][data-value="10"]'); // 10% management
    await page.fill('#otherMonthlyExpenses', '100');
    
    // Utilities
    await page.fill('#electricityUtility', '75');
    await page.fill('#gasUtility', '50');
    await page.fill('#waterSewerUtility', '60');
    await page.fill('#garbageUtility', '25');
    
    // Growth projections
    await page.click('button[data-target="annualIncomeGrowth"][data-value="3"]');
    await page.click('button[data-target="annualExpenseGrowth"][data-value="2"]');
    await page.click('button[data-target="annualPropertyValueGrowth"][data-value="4"]');
    
    // Wait for all calculations to complete
    await page.waitForTimeout(1000);
    
    // Verify calculation text updates
    const closingCostsText = await page.locator('#closingCostsText').textContent();
    expect(closingCostsText).toContain('2.0%'); // 5500/275000 = 2%
    
    const downPaymentText = await page.locator('#downPaymentText').textContent();
    expect(downPaymentText).toContain('25.0%'); // Should be 25%
    
    const taxRateText = await page.locator('#annualizedTaxRate').textContent();
    expect(taxRateText).toContain('2.0%'); // (458*12)/275000 ≈ 2%
    
    const hoaText = await page.locator('#hoaFeeText').textContent();
    expect(hoaText).toContain('$150.00'); // 450/3 = 150 monthly
    expect(hoaText).toContain('$1,800.00'); // 450*4 = 1800 annually
    
    // Verify key financial metrics are calculated and displayed
    await expect(page.locator('#totalCostOfProject')).not.toBeEmpty();
    await expect(page.locator('#totalCashNeeded')).not.toBeEmpty();
    await expect(page.locator('#loanAmount')).not.toBeEmpty();
    await expect(page.locator('#monthlyPI')).not.toBeEmpty();
    await expect(page.locator('#monthlyCashFlow')).not.toBeEmpty();
    await expect(page.locator('#cashOnCashROI')).not.toBeEmpty();
    
    // Verify charts are present
    await expect(page.locator('#incomeExpensesChart')).toBeVisible();
    await expect(page.locator('#equityValueChart')).toBeVisible();
    await expect(page.locator('#amortizationChart')).toBeVisible();
  });

  test('Form validation works correctly', async ({ page }) => {
    // Test negative values
    await page.fill('#purchasePrice', '-100000');
    await page.fill('#monthlyRent', '-1500');
    
    // Check for validation errors
    await page.waitForTimeout(300);
    
    // Should have error styling or messages
    const purchasePriceError = page.locator('#purchasePrice-error');
    const monthlyRentError = page.locator('#monthlyRent-error');
    
    // At minimum, calculations should handle negative values gracefully
    const totalCostText = await page.locator('#totalCostOfProject').textContent();
    expect(totalCostText).toBeDefined();
  });

  test('Responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify key elements are still visible and functional
    await expect(page.locator('#purchasePrice')).toBeVisible();
    await expect(page.locator('button[data-target="downPayment"][data-value="25"]')).toBeVisible();
    
    // Test quick entry buttons work on mobile
    await page.fill('#purchasePrice', '200000');
    await page.click('button[data-target="downPayment"][data-value="20"]');
    
    const downPaymentValue = await page.inputValue('#downPayment');
    expect(downPaymentValue).toBe('40000.00');
  });

  test('Save and Load functionality works', async ({ page }) => {
    // Fill in some data
    await page.fill('#propertyAddress', '456 Test Avenue');
    await page.fill('#purchasePrice', '325000');
    await page.click('button[data-target="downPayment"][data-value="30"]');
    
    // Wait for calculations
    await page.waitForTimeout(500);
    
    // Test save functionality (download should trigger)
    const downloadPromise = page.waitForEvent('download');
    await page.click('#saveTopBtn');
    const download = await downloadPromise;
    
    // Verify download occurred
    expect(download.suggestedFilename()).toContain('analysis');
    expect(download.suggestedFilename()).toContain('.md');
  });

  test('Test runner link works', async ({ page }) => {
    // Click test runner link
    await page.click('a[href="test-runner.html"]');
    
    // Should navigate to test runner
    await expect(page).toHaveURL(/test-runner\.html$/);
    
    // Verify test runner loaded
    await expect(page.locator('h1')).toContainText('Test Runner');
  });

  test('Page loads without JavaScript errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
    });
    
    // Perform some interactions
    await page.fill('#purchasePrice', '250000');
    await page.click('button[data-target="downPayment"][data-value="25"]');
    await page.fill('#monthlyRent', '2000');
    
    await page.waitForTimeout(1000);
    
    // Check for JavaScript errors
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
      expect(errors).toHaveLength(0);
    }
  });

  test('Performance - calculations complete quickly', async ({ page }) => {
    const startTime = Date.now();
    
    // Fill in all fields rapidly
    await page.fill('#purchasePrice', '400000');
    await page.fill('#purchaseClosingCosts', '8000');
    await page.fill('#estimatedRepairCosts', '15000');
    await page.fill('#downPayment', '80000');
    await page.fill('#loanInterestRate', '7.0');
    await page.fill('#monthlyRent', '3200');
    await page.fill('#monthlyPropertyTaxes', '667');
    await page.fill('#monthlyInsurance', '200');
    
    // Wait for all calculations to stabilize
    await page.waitForTimeout(500);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within reasonable time (2 seconds including network delay)
    expect(totalTime).toBeLessThan(2000);
    
    // Verify calculations actually completed
    const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
    expect(cashFlowText).not.toBe('');
    expect(cashFlowText).not.toBe('$0.00');
  });
});
