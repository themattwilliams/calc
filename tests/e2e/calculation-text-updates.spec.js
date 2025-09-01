const { test, expect } = require('@playwright/test');

test.describe('Calculation Text Updates', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for the calculator to be ready
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test('Purchase closing costs percentage updates correctly', async ({ page }) => {
    // Set purchase price
    await page.fill('#purchasePrice', '185000');
    
    // Set closing costs
    await page.fill('#purchaseClosingCosts', '6000');
    
    // Wait a moment for calculations to update
    await page.waitForTimeout(500);
    
    // Check that the percentage text is correct
    const closingCostsText = await page.locator('#closingCostsText').textContent();
    
    // 6000 / 185000 * 100 = 3.24%
    expect(closingCostsText).toContain('3.243%');
    expect(closingCostsText).toContain('of purchase price');
  });

  test('Down payment percentage updates correctly', async ({ page }) => {
    // Set purchase price
    await page.fill('#purchasePrice', '250000');
    
    // Set down payment
    await page.fill('#downPayment', '62500');
    
    // Wait for calculations to update
    await page.waitForTimeout(500);
    
    // Check that the percentage text is correct
    const downPaymentText = await page.locator('#downPaymentText').textContent();
    
    // 62500 / 250000 * 100 = 25%
    expect(downPaymentText).toContain('25.0%');
    expect(downPaymentText).toContain('of purchase price');
  });

  test('Tax rate calculation updates correctly', async ({ page }) => {
    // Set purchase price
    await page.fill('#purchasePrice', '185000');
    
    // Set monthly property taxes
    await page.fill('#monthlyPropertyTaxes', '200');
    
    // Wait for calculations to update
    await page.waitForTimeout(500);
    
    // Check that the tax rate text is correct
    const taxRateText = await page.locator('#annualizedTaxRate').textContent();
    
    // (200 * 12) / 185000 * 100 = 1.297% ≈ 1.3%
    expect(taxRateText).toContain('1.297%');
    expect(taxRateText).toContain('Annualized tax rate');
  });

  test('HOA fees display updates correctly', async ({ page }) => {
    // Set quarterly HOA fees
    await page.fill('#quarterlyHoaFees', '600');
    
    // Wait for calculations to update
    await page.waitForTimeout(500);
    
    // Check that the HOA text is correct
    const hoaText = await page.locator('#hoaFeeText').textContent();
    
    // Monthly: 600/3 = 200, Annually: 600*4 = 2400
    expect(hoaText).toContain('$200.00');
    expect(hoaText).toContain('$2,400.00');
    expect(hoaText).toContain('Monthly:');
    expect(hoaText).toContain('Annually:');
  });

  test('Calculation texts update when typing in fields', async ({ page }) => {
    // Test real-time updates as user types
    
    // Start with empty fields and type purchase price
    await page.fill('#purchasePrice', '');
    await page.type('#purchasePrice', '300000');
    
    // Set closing costs
    await page.fill('#purchaseClosingCosts', '9000');
    
    // Wait for debounced update
    await page.waitForTimeout(300);
    
    // Check closing costs percentage
    const closingCostsText = await page.locator('#closingCostsText').textContent();
    expect(closingCostsText).toContain('3.0%');
    
    // Now change purchase price and verify percentage updates
    await page.fill('#purchasePrice', '450000');
    await page.waitForTimeout(300);
    
    const updatedClosingCostsText = await page.locator('#closingCostsText').textContent();
    expect(updatedClosingCostsText).toContain('2.0%'); // 9000/450000 = 2%
  });

  test('Handles zero purchase price gracefully', async ({ page }) => {
    // Set purchase price to zero
    await page.fill('#purchasePrice', '0');
    await page.fill('#purchaseClosingCosts', '5000');
    await page.fill('#downPayment', '10000');
    
    await page.waitForTimeout(300);
    
    // Should show 0.0% for percentage calculations
    const closingCostsText = await page.locator('#closingCostsText').textContent();
    const downPaymentText = await page.locator('#downPaymentText').textContent();
    
    expect(closingCostsText).toContain('0.0%');
    expect(downPaymentText).toContain('0.0%');
  });

  test('Handles negative values correctly', async ({ page }) => {
    // Test with negative property taxes (as seen in screenshot)
    await page.fill('#purchasePrice', '185000');
    await page.fill('#monthlyPropertyTaxes', '-200');
    
    await page.waitForTimeout(500);
    
    // Should use absolute value for calculation
    const taxRateText = await page.locator('#annualizedTaxRate').textContent();
    expect(taxRateText).toContain('1.297%'); // Should still calculate correctly with absolute value
  });

  test('All calculation texts are present on page load', async ({ page }) => {
    // Verify all calculation text elements exist
    await expect(page.locator('#closingCostsText')).toBeVisible();
    await expect(page.locator('#downPaymentText')).toBeVisible();
    await expect(page.locator('#annualizedTaxRate')).toBeVisible();
    await expect(page.locator('#hoaFeeText')).toBeVisible();
  });
});
