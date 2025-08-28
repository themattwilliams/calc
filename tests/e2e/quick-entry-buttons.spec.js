const { test, expect } = require('@playwright/test');

test.describe('Quick Entry Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test.describe('Down Payment Percentage Buttons', () => {
    test('20% down payment button works correctly', async ({ page }) => {
      // Set purchase price first
      await page.fill('#purchasePrice', '250000');
      
      // Click 20% button
      await page.click('button[data-target="downPayment"][data-value="20"]');
      
      // Check input value
      const downPaymentValue = await page.inputValue('#downPayment');
      expect(downPaymentValue).toBe('50000.00'); // 250000 * 0.20
      
      // Check calculation text updates
      await page.waitForTimeout(300);
      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');
    });

    test('25% down payment button works correctly', async ({ page }) => {
      await page.fill('#purchasePrice', '300000');
      await page.click('button[data-target="downPayment"][data-value="25"]');
      
      const downPaymentValue = await page.inputValue('#downPayment');
      expect(downPaymentValue).toBe('75000.00'); // 300000 * 0.25
      
      await page.waitForTimeout(300);
      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('25.0%');
    });

    test('30% down payment button works correctly', async ({ page }) => {
      await page.fill('#purchasePrice', '400000');
      await page.click('button[data-target="downPayment"][data-value="30"]');
      
      const downPaymentValue = await page.inputValue('#downPayment');
      expect(downPaymentValue).toBe('120000.00'); // 400000 * 0.30
      
      await page.waitForTimeout(300);
      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('30.0%');
    });
  });

  test.describe('Closing Costs Percentage Buttons', () => {
    test('2% closing costs button works correctly', async ({ page }) => {
      await page.fill('#purchasePrice', '275000');
      await page.click('button[data-target="purchaseClosingCosts"][data-value="2"]');
      
      const closingCostsValue = await page.inputValue('#purchaseClosingCosts');
      expect(closingCostsValue).toBe('5500.00'); // 275000 * 0.02
      
      await page.waitForTimeout(300);
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('2.0%');
    });

    test('3% closing costs button works correctly', async ({ page }) => {
      await page.fill('#purchasePrice', '350000');
      await page.click('button[data-target="purchaseClosingCosts"][data-value="3"]');
      
      const closingCostsValue = await page.inputValue('#purchaseClosingCosts');
      expect(closingCostsValue).toBe('10500.00'); // 350000 * 0.03
      
      await page.waitForTimeout(300);
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('3.0%');
    });
  });

  test.describe('Repair Costs Fixed Value Buttons', () => {
    test('All repair cost buttons work correctly', async ({ page }) => {
      const repairCostValues = [
        { button: '$5k', value: '5000', expected: '5000' },
        { button: '$10k', value: '10000', expected: '10000' },
        { button: '$20k', value: '20000', expected: '20000' },
        { button: '$30k', value: '30000', expected: '30000' },
        { button: '$40k', value: '40000', expected: '40000' },
        { button: '$50k', value: '50000', expected: '50000' },
        { button: '$60k', value: '60000', expected: '60000' }
      ];

      for (const { button, value, expected } of repairCostValues) {
        await page.click(`button[data-target="estimatedRepairCosts"][data-value="${value}"]`);
        
        const inputValue = await page.inputValue('#estimatedRepairCosts');
        expect(inputValue).toBe(expected);
        
        // Wait a moment before next test
        await page.waitForTimeout(100);
      }
    });
  });

  test.describe('Management Percentage Buttons', () => {
    test('Management percentage buttons work correctly', async ({ page }) => {
      const managementValues = [8, 9, 10, 11, 12];

      for (const value of managementValues) {
        await page.click(`button[data-target="monthlyManagement"][data-value="${value}"]`);
        
        const inputValue = await page.inputValue('#monthlyManagement');
        expect(inputValue).toBe(value.toString());
        
        await page.waitForTimeout(100);
      }
    });
  });

  test.describe('Growth Rate Buttons', () => {
    test('Income growth rate buttons work correctly', async ({ page }) => {
      const growthRates = [1, 2, 3, 4, 5];

      for (const rate of growthRates) {
        await page.click(`button[data-target="annualIncomeGrowth"][data-value="${rate}"]`);
        
        const inputValue = await page.inputValue('#annualIncomeGrowth');
        expect(inputValue).toBe(rate.toString());
        
        await page.waitForTimeout(100);
      }
    });

    test('Expense growth rate buttons work correctly', async ({ page }) => {
      const growthRates = [1, 2, 3, 4, 5];

      for (const rate of growthRates) {
        await page.click(`button[data-target="annualExpenseGrowth"][data-value="${rate}"]`);
        
        const inputValue = await page.inputValue('#annualExpenseGrowth');
        expect(inputValue).toBe(rate.toString());
        
        await page.waitForTimeout(100);
      }
    });

    test('Property value growth rate buttons work correctly', async ({ page }) => {
      const growthRates = [1, 2, 3, 4, 5];

      for (const rate of growthRates) {
        await page.click(`button[data-target="annualPropertyValueGrowth"][data-value="${rate}"]`);
        
        const inputValue = await page.inputValue('#annualPropertyValueGrowth');
        expect(inputValue).toBe(rate.toString());
        
        await page.waitForTimeout(100);
      }
    });
  });

  test.describe('Button Integration with Calculations', () => {
    test('Multiple button clicks update calculation texts correctly', async ({ page }) => {
      // Set purchase price
      await page.fill('#purchasePrice', '300000');
      
      // Click 20% down payment
      await page.click('button[data-target="downPayment"][data-value="20"]');
      await page.waitForTimeout(200);
      
      let downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');
      
      // Click 25% down payment
      await page.click('button[data-target="downPayment"][data-value="25"]');
      await page.waitForTimeout(200);
      
      downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('25.0%');
      
      // Click 30% down payment
      await page.click('button[data-target="downPayment"][data-value="30"]');
      await page.waitForTimeout(200);
      
      downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('30.0%');
    });

    test('Quick entry buttons work with zero purchase price', async ({ page }) => {
      // Set purchase price to 0
      await page.fill('#purchasePrice', '0');
      
      // Click percentage buttons - should set to 0
      await page.click('button[data-target="downPayment"][data-value="25"]');
      await page.click('button[data-target="purchaseClosingCosts"][data-value="2"]');
      
      const downPaymentValue = await page.inputValue('#downPayment');
      const closingCostsValue = await page.inputValue('#purchaseClosingCosts');
      
      expect(downPaymentValue).toBe('0.00');
      expect(closingCostsValue).toBe('0.00');
    });

    test('Quick entry buttons work rapidly (stress test)', async ({ page }) => {
      await page.fill('#purchasePrice', '500000');
      
      // Rapidly click different buttons
      const buttons = [
        'button[data-target="downPayment"][data-value="20"]',
        'button[data-target="downPayment"][data-value="25"]',
        'button[data-target="downPayment"][data-value="30"]',
        'button[data-target="purchaseClosingCosts"][data-value="2"]',
        'button[data-target="purchaseClosingCosts"][data-value="3"]'
      ];

      for (let i = 0; i < 10; i++) {
        for (const buttonSelector of buttons) {
          await page.click(buttonSelector);
          await page.waitForTimeout(50); // Small delay
        }
      }

      // Final verification - should end with last clicked values
      await page.click('button[data-target="downPayment"][data-value="25"]');
      await page.click('button[data-target="purchaseClosingCosts"][data-value="3"]');
      
      await page.waitForTimeout(300);
      
      const downPaymentValue = await page.inputValue('#downPayment');
      const closingCostsValue = await page.inputValue('#purchaseClosingCosts');
      
      expect(downPaymentValue).toBe('125000.00'); // 500000 * 0.25
      expect(closingCostsValue).toBe('15000.00'); // 500000 * 0.03
    });
  });
});
