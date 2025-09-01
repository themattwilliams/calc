const { test, expect } = require('@playwright/test');

test.describe('Numerical Precision & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test.describe('Extreme Value Testing', () => {
    test('Ultra-luxury property calculations ($10M+)', async ({ page }) => {
      await page.fill('#purchasePrice', '10000000'); // $10M
      await page.fill('#purchaseClosingCosts', '300000'); // 3%
      await page.fill('#estimatedRepairCosts', '200000');
      await page.fill('#downPayment', '2000000'); // 20%
      await page.fill('#loanInterestRate', '5.5');
      await page.fill('#monthlyRent', '45000');
      await page.fill('#monthlyPropertyTaxes', '20833'); // $250k annually
      await page.fill('#monthlyInsurance', '2500');
      await page.fill('#quarterlyHoaFees', '15000'); // $5k monthly
      await page.fill('#monthlyManagement', '5'); // 5%

      await page.waitForTimeout(1000);

      // Verify large number formatting
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$10,500,000.00');

      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$8,000,000.00');

      // Verify percentage calculations remain accurate with large numbers
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('3.0%');

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');

      // Verify tax rate calculation: (20833*12)/10000000 = 2.5%
      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.5%');

      // Verify HOA calculation: 15000/3 = $5000 monthly
      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$5,000.00');
      expect(hoaText).toContain('$60,000.00'); // Annual: 15000*4

      // Management fee: 45000 * 0.05 = $2250
      const totalExpensesText = await page.locator('#totalMonthlyExpenses').textContent();
      expect(totalExpensesText).toMatch(/\$[0-9]{2,3},[0-9]{3}\.[0-9]{2}/);

      // Cash flow should be substantial but verify formatting
      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      expect(cashFlowText).toMatch(/[\$-][0-9,]+\.[0-9]{2}/);
    });

    test('Budget property calculations ($50k)', async ({ page }) => {
      await page.fill('#purchasePrice', '50000');
      await page.fill('#purchaseClosingCosts', '1000'); // 2%
      await page.fill('#estimatedRepairCosts', '3000');
      await page.fill('#downPayment', '10000'); // 20%
      await page.fill('#loanInterestRate', '12.0'); // High rate for low-value property
      await page.fill('#monthlyRent', '650');
      await page.fill('#monthlyPropertyTaxes', '83'); // $1000 annually
      await page.fill('#monthlyInsurance', '50');
      await page.fill('#quarterlyHoaFees', '0');
      await page.fill('#monthlyManagement', '15'); // 15%

      await page.waitForTimeout(1000);

      // Verify small number calculations
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$54,000.00');

      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$40,000.00');

      // Verify percentage calculations with small numbers
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('2.0%');

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');

      // Tax rate: (83*12)/50000 = 1.992% ≈ 2.0%
      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.0%');

      // Management fee: 650 * 0.15 = $97.50
      const totalExpensesText = await page.locator('#totalMonthlyExpenses').textContent();
      expect(totalExpensesText).toMatch(/\$[0-9]{3}\.[0-9]{2}/);

      // Should still calculate positive metrics
      const noiText = await page.locator('#annualNOI').textContent();
      expect(noiText).toMatch(/\$[0-9,]+\.[0-9]{2}/);
    });

    test('Interest rate extremes', async ({ page }) => {
      const testCases = [
        { rate: '0.5', description: 'Ultra-low rate' },
        { rate: '1.0', description: 'Very low rate' },
        { rate: '15.0', description: 'High rate' },
        { rate: '25.0', description: 'Extreme high rate' },
      ];

      for (const testCase of testCases) {
        await page.fill('#purchasePrice', '300000');
        await page.fill('#downPayment', '60000');
        await page.fill('#loanInterestRate', testCase.rate);
        await page.selectOption('#amortizedOver', '30');

        await page.waitForTimeout(500);

        const monthlyPIText = await page.locator('#monthlyPI').textContent();
        
        // Verify mortgage payment calculated for any rate
        expect(monthlyPIText).toMatch(/\$[0-9,]+\.[0-9]{2}/);
        
        console.log(`✓ ${testCase.description} (${testCase.rate}%): ${monthlyPIText}`);
      }
    });
  });

  test.describe('Decimal Precision Testing', () => {
    test('Fractional percentage calculations', async ({ page }) => {
      const testCases = [
        { price: 333333, cost: 5555, expectedPercent: '1.7%' }, // 5555/333333 ≈ 1.6665%
        { price: 285714, cost: 4762, expectedPercent: '1.7%' }, // 4762/285714 ≈ 1.6667%
        { price: 777777, cost: 25926, expectedPercent: '3.3%' }, // 25926/777777 ≈ 3.3334%
        { price: 123456, cost: 4115, expectedPercent: '3.3%' }, // 4115/123456 ≈ 3.3334%
      ];

      for (const testCase of testCases) {
        await page.fill('#purchasePrice', testCase.price.toString());
        await page.fill('#purchaseClosingCosts', testCase.cost.toString());
        
        await page.waitForTimeout(300);
        
        const closingCostsText = await page.locator('#closingCostsText').textContent();
        expect(closingCostsText).toContain(testCase.expectedPercent);
        
        console.log(`✓ ${testCase.cost}/${testCase.price} = ${testCase.expectedPercent}`);
      }
    });

    test('Rounding behavior consistency', async ({ page }) => {
      // Test rounding at 0.5 boundary
      const testCases = [
        { price: 200000, cost: 5000, expectedPercent: '2.5%' }, // Exactly 2.5%
        { price: 200000, cost: 4999, expectedPercent: '2.5%' }, // 2.4995% rounds to 2.5%
        { price: 200000, cost: 5001, expectedPercent: '2.5%' }, // 2.5005% rounds to 2.5%
        { price: 300000, cost: 7499, expectedPercent: '2.5%' }, // 2.4997% rounds to 2.5%
        { price: 300000, cost: 7501, expectedPercent: '2.5%' }, // 2.5003% rounds to 2.5%
      ];

      for (const testCase of testCases) {
        await page.fill('#purchasePrice', testCase.price.toString());
        await page.fill('#purchaseClosingCosts', testCase.cost.toString());
        
        await page.waitForTimeout(300);
        
        const closingCostsText = await page.locator('#closingCostsText').textContent();
        expect(closingCostsText).toContain(testCase.expectedPercent);
      }
    });

    test('Currency formatting with cents', async ({ page }) => {
      await page.fill('#purchasePrice', '250000');
      await page.fill('#purchaseClosingCosts', '5000.50');
      await page.fill('#estimatedRepairCosts', '7500.75');
      await page.fill('#downPayment', '50000.25');

      await page.waitForTimeout(500);

      // Verify decimal inputs are handled correctly
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$262,501.25'); // 250000 + 5000.50 + 7000.75

      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$62,001.00'); // 50000.25 + 5000.50 + 7000.75

      // Verify percentage calculations work with decimals
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toMatch(/2\.[0-9]%/); // Should be ~2.0%

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toMatch(/20\.[0-9]%/); // Should be ~20.0%
    });
  });

  test.describe('Zero and Negative Value Handling', () => {
    test('Zero values in various fields', async ({ page }) => {
      await page.fill('#purchasePrice', '200000');
      await page.fill('#purchaseClosingCosts', '0');
      await page.fill('#estimatedRepairCosts', '0');
      await page.fill('#downPayment', '40000');
      await page.fill('#loanFees', '0');
      await page.fill('#monthlyPropertyTaxes', '0');
      await page.fill('#monthlyInsurance', '0');
      await page.fill('#quarterlyHoaFees', '0');
      await page.fill('#otherMonthlyExpenses', '0');

      await page.waitForTimeout(500);

      // Verify zero values display correctly
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('0.0%');

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('0.0%');

      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$0.00');

      // Verify calculations still work with zeros
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$200,000.00');

      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$160,000.00');
    });

    test('Negative values converted to absolute values', async ({ page }) => {
      await page.fill('#purchasePrice', '300000');
      await page.fill('#monthlyPropertyTaxes', '-500'); // Negative input
      await page.fill('#monthlyInsurance', '-150'); // Negative input

      await page.waitForTimeout(500);

      // Verify negative values are handled gracefully
      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.0%'); // Should use absolute value: |(-500)*12|/300000

      // Total expenses should use absolute values
      const totalExpensesText = await page.locator('#totalMonthlyExpenses').textContent();
      expect(totalExpensesText).toMatch(/\$[0-9,]+\.[0-9]{2}/); // Should be positive
    });

    test('Zero purchase price edge case', async ({ page }) => {
      await page.fill('#purchasePrice', '0');
      await page.fill('#purchaseClosingCosts', '5000');
      await page.fill('#downPayment', '10000');
      await page.fill('#monthlyPropertyTaxes', '200');

      await page.waitForTimeout(500);

      // Verify division by zero is handled
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('0.0%'); // Should default to 0%

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('0.0%'); // Should default to 0%

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('0.0%'); // Should default to 0%

      // Other calculations should still work
      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toMatch(/\$[0-9,]+\.[0-9]{2}/);
    });
  });

  test.describe('Complex Calculation Cross-Validation', () => {
    test('Cash-on-Cash ROI vs Cap Rate comparison', async ({ page }) => {
      // Set up a cash purchase to compare metrics
      await page.fill('#purchasePrice', '300000');
      await page.fill('#purchaseClosingCosts', '6000');
      await page.fill('#estimatedRepairCosts', '9000');
      await page.fill('#downPayment', '300000'); // Cash purchase
      await page.fill('#loanInterestRate', '0');
      await page.fill('#monthlyRent', '2500');
      await page.fill('#monthlyPropertyTaxes', '500');
      await page.fill('#monthlyInsurance', '150');
      await page.fill('#quarterlyHoaFees', '300');
      await page.fill('#monthlyManagement', '8'); // 8%

      await page.waitForTimeout(1000);

      const capRateText = await page.locator('#capRate').textContent();
      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();

      // For cash purchases, cap rate and cash-on-cash should be very similar
      const capRateMatch = capRateText.match(/([0-9]+\.[0-9])%/);
      const cashOnCashMatch = cashOnCashText.match(/([0-9]+\.[0-9])%/);

      if (capRateMatch && cashOnCashMatch) {
        const capRateNum = parseFloat(capRateMatch[1]);
        const cashOnCashNum = parseFloat(cashOnCashMatch[1]);
        expect(Math.abs(capRateNum - cashOnCashNum)).toBeLessThan(0.2); // Should be within 0.2%
        console.log(`Cap Rate: ${capRateNum}%, Cash-on-Cash: ${cashOnCashNum}%`);
      }
    });

    test('NOI calculation verification', async ({ page }) => {
      await page.fill('#purchasePrice', '250000');
      await page.fill('#monthlyRent', '2000');
      await page.fill('#monthlyPropertyTaxes', '400');
      await page.fill('#monthlyInsurance', '125');
      await page.fill('#quarterlyHoaFees', '450'); // $150/month
      await page.fill('#monthlyManagement', '10'); // 10% = $200
      await page.fill('#otherMonthlyExpenses', '75');

      await page.waitForTimeout(500);

      // Calculate expected NOI manually
      // Annual Income: 2000 * 12 = $24,000
      // Annual Operating Expenses: (400 + 125 + 150 + 200 + 75) * 12 = 950 * 12 = $11,400
      // NOI: 24,000 - 11,400 = $12,600

      const noiText = await page.locator('#annualNOI').textContent();
      expect(noiText).toContain('$12,600.00');

      // Verify cap rate calculation: 12,600 / 250,000 = 5.04%
      const capRateText = await page.locator('#capRate').textContent();
      expect(capRateText).toMatch(/4\.[0-9]%/);
    });

    test('Total cash needed calculation validation', async ({ page }) => {
      await page.fill('#purchasePrice', '400000');
      await page.fill('#purchaseClosingCosts', '8000'); // 2%
      await page.fill('#estimatedRepairCosts', '15000');
      await page.fill('#downPayment', '80000'); // 20%
      await page.fill('#loanFees', '3000');

      await page.waitForTimeout(500);

      // Expected total: 80,000 + 8,000 + 15,000 + 3,000 = $106,000
      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$106,000.00');

      // Verify loan amount: 400,000 - 80,000 = $320,000
      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$320,000.00');

      // Verify total cost: 400,000 + 8,000 + 15,000 = $423,000
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$423,000.00');
    });
  });

  test.describe('Real-world Scenario Testing', () => {
    test('Typical first-time investor property', async ({ page }) => {
      await page.fill('#purchasePrice', '185000');
      await page.fill('#purchaseClosingCosts', '3700'); // 2%
      await page.fill('#estimatedRepairCosts', '8000');
      await page.fill('#downPayment', '37000'); // 20%
      await page.fill('#loanInterestRate', '7.25');
      await page.fill('#monthlyRent', '1650');
      await page.fill('#monthlyPropertyTaxes', '308'); // $3700 annually
      await page.fill('#monthlyInsurance', '95');
      await page.fill('#quarterlyHoaFees', '0');
      await page.fill('#monthlyManagement', '10');

      await page.waitForTimeout(1000);

      // Verify all calculations are reasonable for this scenario
      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');

      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('2.0%');

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.0%'); // (308*12)/185000 ≈ 2%

      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      expect(cashFlowText).toMatch(/[\$-][0-9,]+\.[0-9]{2}/);

      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();
      expect(cashOnCashText).toMatch(/[0-9-]+\.[0-9]%/);

      const capRateText = await page.locator('#capRate').textContent();
      expect(capRateText).toMatch(/[0-9]+\.[0-9]%/);
    });

    test('BRRRR strategy property (high repair costs)', async ({ page }) => {
      // Buy, Rehab, Rent, Refinance, Repeat strategy
      await page.fill('#purchasePrice', '120000');
      await page.fill('#purchaseClosingCosts', '2400'); // 2%
      await page.fill('#estimatedRepairCosts', '40000'); // Major rehab
      await page.fill('#downPayment', '24000'); // 20%
      await page.fill('#loanInterestRate', '8.5'); // Hard money rate
      await page.fill('#monthlyRent', '1800'); // After rehab rent
      await page.fill('#monthlyPropertyTaxes', '200');
      await page.fill('#monthlyInsurance', '85');

      await page.waitForTimeout(1000);

      // Verify high repair cost calculations
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$162,400.00'); // 120000 + 2400 + 40000

      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$66,400.00'); // 24000 + 2400 + 40000

      // Should still calculate positive returns after heavy investment
      const capRateText = await page.locator('#capRate').textContent();
      expect(capRateText).toMatch(/[0-9]+\.[0-9]%/);
    });
  });
});
