const { test, expect } = require('@playwright/test');

test.describe('Temporary Financing - Comprehensive E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test('Temporary financing checkbox toggles fields visibility', async ({ page }) => {
    // Verify checkbox exists and fields are initially hidden
    await expect(page.locator('#useTemporaryFinancing')).toBeVisible();
    await expect(page.locator('#temporaryFinancingFields')).toHaveClass(/hidden/);

    // Enable temporary financing
    await page.check('#useTemporaryFinancing');
    await expect(page.locator('#temporaryFinancingFields')).not.toHaveClass(/hidden/);

    // Verify all input fields are visible
    await expect(page.locator('#initialCashInvestment')).toBeVisible();
    await expect(page.locator('#renovationCosts')).toBeVisible();
    await expect(page.locator('#tempFinancingAmount')).toBeVisible();
    await expect(page.locator('#tempInterestRate')).toBeVisible();
    await expect(page.locator('#originationPoints')).toBeVisible();
    await expect(page.locator('#tempLoanTermMonths')).toBeVisible();
    await expect(page.locator('#afterRepairValue')).toBeVisible();
    await expect(page.locator('#cashOutLTV')).toBeVisible();

    // Disable temporary financing
    await page.uncheck('#useTemporaryFinancing');
    await expect(page.locator('#temporaryFinancingFields')).toHaveClass(/hidden/);
  });

  test('Perfect BRRRR scenario - all cash, full recovery', async ({ page }) => {
    // Enable temporary financing
    await page.check('#useTemporaryFinancing');
    
    // Set up perfect BRRRR scenario
    await page.fill('#initialCashInvestment', '250000');
    await page.fill('#renovationCosts', '50000');
    await page.fill('#tempFinancingAmount', '0'); // All cash
    await page.fill('#tempInterestRate', '0');
    await page.fill('#originationPoints', '0');
    await page.fill('#tempLoanTermMonths', '6');
    await page.fill('#afterRepairValue', '400000');
    await page.fill('#cashOutLTV', '75');

    await page.waitForTimeout(1000);

    // Verify calculations
    await expect(page.locator('#totalInitialInvestment')).toContainText('$300,000.00');
    await expect(page.locator('#tempFinancingCosts')).toContainText('$0.00');
    await expect(page.locator('#newLoanAmount')).toContainText('$300,000.00');
    await expect(page.locator('#cashReturnedAtRefinance')).toContainText('$300,000.00');
    await expect(page.locator('#finalCashLeftInDeal')).toContainText('$0.00');
  });

  test('Hard money loan scenario with calculations', async ({ page }) => {
    // Enable temporary financing
    await page.check('#useTemporaryFinancing');
    
    // Set up hard money scenario
    await page.fill('#initialCashInvestment', '100000');
    await page.fill('#renovationCosts', '40000');
    await page.fill('#tempFinancingAmount', '200000');
    await page.fill('#tempInterestRate', '12');
    await page.fill('#originationPoints', '2');
    await page.fill('#tempLoanTermMonths', '9');
    await page.fill('#afterRepairValue', '450000');
    await page.fill('#cashOutLTV', '70');

    await page.waitForTimeout(1000);

    // Calculate expected values
    // Temp costs: $200k * 12% * 0.75 years + $200k * 2% = $18k + $4k = $22k
    // Total investment: $100k + $40k + $22k = $162k
    // New loan: $450k * 70% = $315k
    // Cash returned: $315k - $200k = $115k
    // Final cash: $162k - $115k = $47k

    await expect(page.locator('#totalInitialInvestment')).toContainText('$162,000.00');
    await expect(page.locator('#tempFinancingCosts')).toContainText('$22,000.00');
    await expect(page.locator('#newLoanAmount')).toContainText('$315,000.00');
    await expect(page.locator('#cashReturnedAtRefinance')).toContainText('$115,000.00');
    await expect(page.locator('#finalCashLeftInDeal')).toContainText('$47,000.00');
  });

  test('Quick entry buttons work in temporary financing', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    // Test interest rate quick entries
    await page.click('button[data-target="tempInterestRate"][data-value="12"]');
    expect(await page.inputValue('#tempInterestRate')).toBe('12');
    
    await page.click('button[data-target="tempInterestRate"][data-value="15"]');
    expect(await page.inputValue('#tempInterestRate')).toBe('15');

    // Test origination points quick entries
    await page.click('button[data-target="originationPoints"][data-value="2"]');
    expect(await page.inputValue('#originationPoints')).toBe('2');
    
    await page.click('button[data-target="originationPoints"][data-value="3"]');
    expect(await page.inputValue('#originationPoints')).toBe('3');

    // Test loan term quick entries
    await page.click('button[data-target="tempLoanTermMonths"][data-value="6"]');
    expect(await page.inputValue('#tempLoanTermMonths')).toBe('6');
    
    await page.click('button[data-target="tempLoanTermMonths"][data-value="12"]');
    expect(await page.inputValue('#tempLoanTermMonths')).toBe('12');

    // Test LTV quick entries
    await page.click('button[data-target="cashOutLTV"][data-value="75"]');
    expect(await page.inputValue('#cashOutLTV')).toBe('75');
    
    await page.click('button[data-target="cashOutLTV"][data-value="65"]');
    expect(await page.inputValue('#cashOutLTV')).toBe('65');
  });

  test('Real-time calculation updates', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    // Start with base values
    await page.fill('#initialCashInvestment', '100000');
    await page.fill('#renovationCosts', '30000');
    await page.fill('#afterRepairValue', '300000');
    await page.fill('#cashOutLTV', '70');
    
    await page.waitForTimeout(500);
    
    // Check initial state
    await expect(page.locator('#totalInitialInvestment')).toContainText('$130,000.00');
    await expect(page.locator('#newLoanAmount')).toContainText('$210,000.00');
    
    // Change financing amount and verify updates
    await page.fill('#tempFinancingAmount', '150000');
    await page.fill('#tempInterestRate', '10');
    await page.fill('#originationPoints', '1');
    await page.fill('#tempLoanTermMonths', '6');
    
    await page.waitForTimeout(500);
    
    // Temp costs: $150k * 10% * 0.5 + $150k * 1% = $7.5k + $1.5k = $9k
    // Total investment: $100k + $30k + $9k = $139k
    // Cash returned: $210k - $150k = $60k
    // Final cash: $139k - $60k = $79k
    
    await expect(page.locator('#totalInitialInvestment')).toContainText('$139,000.00');
    await expect(page.locator('#tempFinancingCosts')).toContainText('$9,000.00');
    await expect(page.locator('#cashReturnedAtRefinance')).toContainText('$60,000.00');
    await expect(page.locator('#finalCashLeftInDeal')).toContainText('$79,000.00');
  });

  test('Edge case: Insufficient refinance coverage', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    // Set up scenario where refinance doesn't cover temp financing
    await page.fill('#tempFinancingAmount', '200000');
    await page.fill('#afterRepairValue', '250000'); // Low ARV
    await page.fill('#cashOutLTV', '60'); // Conservative LTV
    
    await page.waitForTimeout(500);
    
    // New loan: $250k * 60% = $150k
    // But temp financing is $200k, so can't cover it
    await expect(page.locator('#newLoanAmount')).toContainText('$150,000.00');
    await expect(page.locator('#cashReturnedAtRefinance')).toContainText('$0.00'); // Can't return negative
  });

  test('Zero interest rate (own cash) scenario', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    await page.fill('#initialCashInvestment', '200000');
    await page.fill('#renovationCosts', '25000');
    await page.fill('#tempFinancingAmount', '0'); // No temp financing, all own cash
    await page.fill('#tempInterestRate', '0'); // Own cash
    await page.fill('#originationPoints', '0');
    await page.fill('#tempLoanTermMonths', '12');
    await page.fill('#afterRepairValue', '400000');
    await page.fill('#cashOutLTV', '75');
    
    await page.waitForTimeout(500);
    
    // No financing costs since it's own money and no temp financing
    await expect(page.locator('#tempFinancingCosts')).toContainText('$0.00');
    await expect(page.locator('#totalInitialInvestment')).toContainText('$225,000.00'); // $200k + $25k + $0 = $225k
    
    // New loan: $400k * 75% = $300k
    // Cash returned: $300k - $0 = $300k (no temp financing to pay off)
    // Final cash: $225k - $300k = $0 (can't get more than invested, so $0 left)
    await expect(page.locator('#newLoanAmount')).toContainText('$300,000.00');
    await expect(page.locator('#cashReturnedAtRefinance')).toContainText('$300,000.00');
    await expect(page.locator('#finalCashLeftInDeal')).toContainText('$0.00'); // Perfect BRRRR - infinite ROI
  });

  test('High interest rate scenario', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    await page.fill('#tempFinancingAmount', '180000');
    await page.fill('#tempInterestRate', '18'); // High rate
    await page.fill('#originationPoints', '3'); // High points
    await page.fill('#tempLoanTermMonths', '12'); // Full year
    
    await page.waitForTimeout(500);
    
    // Temp costs: $180k * 18% * 1 + $180k * 3% = $32.4k + $5.4k = $37.8k
    await expect(page.locator('#tempFinancingCosts')).toContainText('$37,800.00');
  });

  test('Analysis start date calculation', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    await page.fill('#tempLoanTermMonths', '6');
    
    await page.waitForTimeout(500);
    
    // Should show a date 7 months from now (6 months + 1 month processing)
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 7);
    const expectedDateStr = futureDate.toLocaleDateString();
    
    await expect(page.locator('#analysisStartDate')).toContainText(expectedDateStr);
  });

  test('Conservative vs aggressive LTV comparison', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    // Set base scenario
    await page.fill('#initialCashInvestment', '150000');
    await page.fill('#renovationCosts', '35000');
    await page.fill('#afterRepairValue', '350000');
    
    // Test conservative 65% LTV
    await page.fill('#cashOutLTV', '65');
    await page.waitForTimeout(300);
    
    await expect(page.locator('#newLoanAmount')).toContainText('$227,500.00');
    
    // Test aggressive 80% LTV
    await page.fill('#cashOutLTV', '80');
    await page.waitForTimeout(300);
    
    await expect(page.locator('#newLoanAmount')).toContainText('$280,000.00');
  });

  test('Short vs long term financing comparison', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    await page.fill('#tempFinancingAmount', '200000');
    await page.fill('#tempInterestRate', '12');
    await page.fill('#originationPoints', '2');
    
    // Test 3-month term
    await page.fill('#tempLoanTermMonths', '3');
    await page.waitForTimeout(300);
    
    // Costs: $200k * 12% * 0.25 + $200k * 2% = $6k + $4k = $10k
    await expect(page.locator('#tempFinancingCosts')).toContainText('$10,000.00');
    
    // Test 12-month term
    await page.fill('#tempLoanTermMonths', '12');
    await page.waitForTimeout(300);
    
    // Costs: $200k * 12% * 1 + $200k * 2% = $24k + $4k = $28k
    await expect(page.locator('#tempFinancingCosts')).toContainText('$28,000.00');
  });

  test('Integration with regular property calculations', async ({ page }) => {
    // First, set up regular property without temp financing
    await page.fill('#purchasePrice', '300000');
    await page.fill('#downPayment', '60000');
    await page.fill('#monthlyRent', '2500');
    
    await page.waitForTimeout(500);
    
    // Verify regular calculations work
    await expect(page.locator('#loanAmount')).toContainText('$240,000.00');
    
    // Now enable temporary financing
    await page.check('#useTemporaryFinancing');
    
    await page.fill('#initialCashInvestment', '300000'); // All cash purchase
    await page.fill('#renovationCosts', '40000');
    await page.fill('#afterRepairValue', '450000');
    await page.fill('#cashOutLTV', '70');
    
    await page.waitForTimeout(500);
    
    // Verify temp financing calculations don't break regular ones
    await expect(page.locator('#purchasePrice')).toHaveValue('300000');
    await expect(page.locator('#totalInitialInvestment')).toContainText('$340,000.00');
    await expect(page.locator('#newLoanAmount')).toContainText('$315,000.00');
  });

  test('Validate all input fields accept values correctly', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    // Test all input fields accept values
    const testValues = {
      'initialCashInvestment': '175000',
      'renovationCosts': '45000',
      'tempFinancingAmount': '220000',
      'tempInterestRate': '13.5',
      'originationPoints': '2.5',
      'tempLoanTermMonths': '8',
      'afterRepairValue': '425000',
      'cashOutLTV': '72'
    };
    
    for (const [field, value] of Object.entries(testValues)) {
      await page.fill(`#${field}`, value);
      expect(await page.inputValue(`#${field}`)).toBe(value);
    }
    
    await page.waitForTimeout(500);
    
    // Verify calculations updated with new values
    await expect(page.locator('#totalInitialInvestment')).not.toContainText('$0.00');
    await expect(page.locator('#newLoanAmount')).not.toContainText('$0.00');
  });

  test('Form validation and error handling', async ({ page }) => {
    await page.check('#useTemporaryFinancing');
    
    // Need to set temp financing amount for costs to be calculated
    await page.fill('#tempFinancingAmount', '100000');
    await page.fill('#tempInterestRate', '25'); // Very high rate
    await page.fill('#originationPoints', '5'); // High points
    await page.fill('#tempLoanTermMonths', '24'); // Long term
    await page.fill('#cashOutLTV', '85'); // High LTV
    
    await page.waitForTimeout(500);
    
    // Should calculate costs with the temp financing amount
    await expect(page.locator('#tempFinancingCosts')).not.toContainText('$0.00');
  });

  test('Mobile responsiveness of temporary financing section', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.check('#useTemporaryFinancing');
    
    // Verify all elements are still visible and functional on mobile
    await expect(page.locator('#temporaryFinancingFields')).toBeVisible();
    await expect(page.locator('#initialCashInvestment')).toBeVisible();
    await expect(page.locator('#tempInterestRate')).toBeVisible();
    
    // Test quick entry buttons work on mobile
    await page.click('button[data-target="tempInterestRate"][data-value="12"]');
    expect(await page.inputValue('#tempInterestRate')).toBe('12');
    
    // Test that summary section is visible
    await expect(page.locator('#totalInitialInvestment')).toBeVisible();
  });

  test('Complex multi-step scenario workflow', async ({ page }) => {
    // Step 1: Enable temporary financing
    await page.check('#useTemporaryFinancing');
    
    // Step 2: Set up initial purchase
    await page.fill('#initialCashInvestment', '200000');
    await page.fill('#renovationCosts', '50000');
    
    // Step 3: Add hard money loan
    await page.fill('#tempFinancingAmount', '180000');
    await page.click('button[data-target="tempInterestRate"][data-value="15"]');
    await page.click('button[data-target="originationPoints"][data-value="2"]');
    await page.click('button[data-target="tempLoanTermMonths"][data-value="6"]');
    
    // Step 4: Set ARV and refinance terms
    await page.fill('#afterRepairValue', '500000');
    await page.click('button[data-target="cashOutLTV"][data-value="75"]');
    
    await page.waitForTimeout(1000);
    
    // Step 5: Verify final calculations
    // Temp costs: $180k * 15% * 0.5 + $180k * 2% = $13.5k + $3.6k = $17.1k
    // Total investment: $200k + $50k + $17.1k = $267.1k
    // New loan: $500k * 75% = $375k
    // Cash returned: $375k - $180k = $195k
    // Final cash: $267.1k - $195k = $72.1k
    
    await expect(page.locator('#tempFinancingCosts')).toContainText('$17,100.00');
    await expect(page.locator('#totalInitialInvestment')).toContainText('$267,100.00');
    await expect(page.locator('#newLoanAmount')).toContainText('$375,000.00');
    await expect(page.locator('#cashReturnedAtRefinance')).toContainText('$195,000.00');
    await expect(page.locator('#finalCashLeftInDeal')).toContainText('$72,100.00');
  });
});
