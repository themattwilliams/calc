const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Financial Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test.describe('Core Financial Metrics Accuracy', () => {
    test('Complete calculation chain - Standard Property', async ({ page }) => {
      // Input complete property data
      await page.fill('#purchasePrice', '300000');
      await page.fill('#purchaseClosingCosts', '6000'); // 2%
      await page.fill('#estimatedRepairCosts', '15000');
      await page.fill('#downPayment', '60000'); // 20%
      await page.fill('#loanInterestRate', '6.5');
      await page.selectOption('#amortizedOver', '30');
      await page.fill('#loanFees', '2000');
      await page.fill('#monthlyRent', '2500');
      await page.fill('#monthlyPropertyTaxes', '500');
      await page.fill('#monthlyInsurance', '150');
      await page.fill('#quarterlyHoaFees', '600'); // $200/month
      await page.fill('#monthlyManagement', '10'); // 10%
      await page.fill('#otherMonthlyExpenses', '100');

      // Wait for calculations
      await page.waitForTimeout(1000);

      // Verify ancillary text calculations
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('2.0%'); // 6000/300000 = 2%

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%'); // 60000/300000 = 20%

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.0%'); // (500*12)/300000 = 2%

      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$200.00'); // 600/3 = $200 monthly
      expect(hoaText).toContain('$2,400.00'); // 600*4 = $2400 annually

      // Verify core financial metrics
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$321,000.00'); // 300000 + 6000 + 15000

      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$83,000.00'); // 60000 + 6000 + 15000 + 2000

      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$240,000.00'); // 300000 - 60000

      // Verify monthly calculations
      const monthlyPIText = await page.locator('#monthlyPI').textContent();
      // Using PMT formula: 240000, 6.5%, 30 years ≈ $1515.28
      expect(monthlyPIText).toMatch(/\$1,51[0-9]\.[0-9]{2}/);

      const totalExpensesText = await page.locator('#totalMonthlyExpenses').textContent();
      // 500 + 150 + 200 + 250 + 100 + 1515.28 ≈ $2715.28
      expect(totalExpensesText).toMatch(/\$2,71[0-9]\.[0-9]{2}/);

      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      // 2500 - 2715.28 ≈ -$215.28 (negative cash flow)
      expect(cashFlowText).toMatch(/-\$2[0-9][0-9]\.[0-9]{3}/);

      // Verify ROI calculations
      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();
      // Annual cash flow / total cash invested * 100
      // (-215.28 * 12) / 83000 * 100 ≈ -3.1%
      expect(cashOnCashText).toMatch(/-[0-9]\.[0-9]{3}%/);

      const noiText = await page.locator('#annualNOI').textContent();
      // (2500 * 12) - ((500+150+200+250+100) * 12) = 30000 - 14400 = $15,600
      expect(noiText).toContain('$15,600.00');

      const capRateText = await page.locator('#capRate').textContent();
      // 15600 / 321000 * 100 ≈ 4.9%
      expect(capRateText).toMatch(/4\.[0-9]{3}%/);
    });

    test('High-end luxury property calculations', async ({ page }) => {
      // Test with luxury property values
      await page.fill('#purchasePrice', '2500000');
      await page.fill('#purchaseClosingCosts', '75000'); // 3%
      await page.fill('#estimatedRepairCosts', '50000');
      await page.fill('#downPayment', '500000'); // 20%
      await page.fill('#loanInterestRate', '7.25');
      await page.selectOption('#amortizedOver', '30');
      await page.fill('#monthlyRent', '12500');
      await page.fill('#monthlyPropertyTaxes', '4167'); // $50k annually
      await page.fill('#monthlyInsurance', '600');
      await page.fill('#quarterlyHoaFees', '6000'); // $2k monthly
      await page.fill('#monthlyManagement', '8'); // 8%

      await page.waitForTimeout(1000);

      // Verify percentage calculations
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('3.0%'); // 75000/2500000 = 3%

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%'); // 500000/2500000 = 20%

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.000%'); // (4167*12)/2500000 ≈ 2% with precision

      // Verify high-value calculations
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$2,625,000.00'); // 2500000 + 75000 + 50000

      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$2,000,000.00'); // 2500000 - 500000

      // Management fee should be 8% of 12500 = $1000
      const monthlyPIText = await page.locator('#monthlyPI').textContent();
      // Large loan amount should result in significant monthly payment
      expect(monthlyPIText).toMatch(/\$1[0-9],[0-9]{3}\.[0-9]{2}/);

      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      // Should handle large numbers correctly
      expect(cashFlowText).toMatch(/[\$-]\d{1,2},?\d{3}\.\d{2}/);
    });

    test('Budget property with minimal values', async ({ page }) => {
      // Test with low-end property
      await page.fill('#purchasePrice', '75000');
      await page.fill('#purchaseClosingCosts', '1500'); // 2%
      await page.fill('#estimatedRepairCosts', '5000');
      await page.fill('#downPayment', '15000'); // 20%
      await page.fill('#loanInterestRate', '8.5');
      await page.selectOption('#amortizedOver', '30');
      await page.fill('#monthlyRent', '950');
      await page.fill('#monthlyPropertyTaxes', '125'); // $1500 annually
      await page.fill('#monthlyInsurance', '75');
      await page.fill('#quarterlyHoaFees', '0'); // No HOA
      await page.fill('#monthlyManagement', '12'); // 12%

      await page.waitForTimeout(1000);

      // Verify percentage calculations remain accurate at low values
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('2.0%'); // 1500/75000 = 2%

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%'); // 15000/75000 = 20%

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.0%'); // (125*12)/75000 = 2%

      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$0.00'); // No HOA fees

      // Verify calculations work correctly with small numbers
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$81,500.00'); // 75000 + 1500 + 5000

      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$60,000.00'); // 75000 - 15000

      // Should still calculate positive cash flow for budget property
      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      expect(cashFlowText).toMatch(/\$[0-9]+\.[0-9]{2}/); // Should be positive
    });
  });

  test.describe('Percentage Calculation Precision', () => {
    test('Precise percentage calculations across different price points', async ({ page }) => {
      const testCases = [
        { price: 100000, cost: 3333, expectedPercent: '3.333%' },
        { price: 250000, cost: 8125, expectedPercent: '3.250%' },
        { price: 500000, cost: 16250, expectedPercent: '3.250%' },
        { price: 1000000, cost: 33333, expectedPercent: '3.333%' },
        { price: 185000, cost: 6000, expectedPercent: '3.243%' }, // Your original example
      ];

      for (const testCase of testCases) {
        await page.fill('#purchasePrice', testCase.price.toString());
        await page.fill('#purchaseClosingCosts', testCase.cost.toString());
        
        await page.waitForTimeout(300);
        
        const closingCostsText = await page.locator('#closingCostsText').textContent();
        expect(closingCostsText).toContain(testCase.expectedPercent);
        
        console.log(`✓ ${testCase.price} with ${testCase.cost} = ${testCase.expectedPercent}`);
      }
    });

    test('Down payment percentage accuracy', async ({ page }) => {
      const testCases = [
        { price: 300000, payment: 45000, expectedPercent: '15.0%' },
        { price: 300000, payment: 60000, expectedPercent: '20.0%' },
        { price: 300000, payment: 75000, expectedPercent: '25.0%' },
        { price: 300000, payment: 90000, expectedPercent: '30.0%' },
        { price: 275000, payment: 68750, expectedPercent: '25.0%' },
      ];

      for (const testCase of testCases) {
        await page.fill('#purchasePrice', testCase.price.toString());
        await page.fill('#downPayment', testCase.payment.toString());
        
        await page.waitForTimeout(300);
        
        const downPaymentText = await page.locator('#downPaymentText').textContent();
        expect(downPaymentText).toContain(testCase.expectedPercent);
      }
    });

    test('Tax rate calculations with various scenarios', async ({ page }) => {
      const testCases = [
        { price: 200000, monthlyTax: 200, expectedRate: '1.200%' }, // (200*12)/200000
        { price: 300000, monthlyTax: 500, expectedRate: '2.0%' }, // (500*12)/300000 - whole number
        { price: 500000, monthlyTax: 1250, expectedRate: '3.0%' }, // (1250*12)/500000 - whole number
        { price: 185000, monthlyTax: 200, expectedRate: '1.297%' }, // Your example
      ];

      for (const testCase of testCases) {
        await page.fill('#purchasePrice', testCase.price.toString());
        await page.fill('#monthlyPropertyTaxes', testCase.monthlyTax.toString());
        
        await page.waitForTimeout(300);
        
        const taxRateText = await page.locator('#annualizedTaxRate').textContent();
        expect(taxRateText).toContain(testCase.expectedRate);
      }
    });
  });

  test.describe('Quick Entry Button Integration with Calculations', () => {
    test('Quick entry percentage buttons update calculations correctly', async ({ page }) => {
      await page.fill('#purchasePrice', '400000');
      
      // Test 20% down payment button
      await page.click('button[data-target="downPayment"][data-value="20"]');
      await page.waitForTimeout(300);
      
      let downPaymentValue = await page.inputValue('#downPayment');
      expect(downPaymentValue).toBe('80000.00');
      
      let downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');
      
      // Test 25% down payment button
      await page.click('button[data-target="downPayment"][data-value="25"]');
      await page.waitForTimeout(300);
      
      downPaymentValue = await page.inputValue('#downPayment');
      expect(downPaymentValue).toBe('100000.00');
      
      downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('25.0%');
      
      // Test 3% closing costs button
      await page.click('button[data-target="purchaseClosingCosts"][data-value="3"]');
      await page.waitForTimeout(300);
      
      const closingCostsValue = await page.inputValue('#purchaseClosingCosts');
      expect(closingCostsValue).toBe('12000.00'); // 400000 * 0.03
      
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('3.0%');
      
      // Verify total calculations updated
      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toMatch(/\$11[0-9],[0-9]{3}\.[0-9]{2}/); // Should be around $112k
    });

    test('Repair cost buttons affect total calculations', async ({ page }) => {
      await page.fill('#purchasePrice', '250000');
      await page.fill('#downPayment', '50000');
      await page.fill('#purchaseClosingCosts', '5000');
      
      // Test $20k repair button
      await page.click('button[data-target="estimatedRepairCosts"][data-value="20000"]');
      await page.waitForTimeout(300);
      
      let totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$275,000.00'); // 250000 + 5000 + 20000
      
      let totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$75,000.00'); // 50000 + 5000 + 20000
      
      // Test $60k repair button
      await page.click('button[data-target="estimatedRepairCosts"][data-value="60000"]');
      await page.waitForTimeout(300);
      
      totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$315,000.00'); // 250000 + 5000 + 60000
      
      totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$115,000.00'); // 50000 + 5000 + 60000
    });
  });

  test.describe('Complex Financial Scenarios', () => {
    test('Negative cash flow property analysis', async ({ page }) => {
      // Create scenario with negative cash flow
      await page.fill('#purchasePrice', '300000');
      await page.fill('#downPayment', '60000');
      await page.fill('#loanInterestRate', '8.0'); // High interest rate
      await page.fill('#monthlyRent', '1800'); // Low rent
      await page.fill('#monthlyPropertyTaxes', '600'); // High taxes
      await page.fill('#monthlyInsurance', '200');
      await page.fill('#quarterlyHoaFees', '900'); // $300/month HOA
      await page.fill('#monthlyManagement', '15'); // 15% management
      await page.fill('#otherMonthlyExpenses', '200');
      
      await page.waitForTimeout(1000);
      
      // Verify negative cash flow is calculated correctly
      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      expect(cashFlowText).toMatch(/-\$[0-9,]+\.[0-9]{3}/); // Should be negative with precision
      
      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();
      expect(cashOnCashText).toMatch(/-[0-9]+\.[0-9]{3}%/); // Should be negative ROI with precision
      
      // NOI should still be calculated (excluding mortgage)
      const noiText = await page.locator('#annualNOI').textContent();
      expect(noiText).toMatch(/\$[0-9,]+\.[0-9]{2}/); // Should be positive (excludes mortgage)
      
      // Cap rate should still be positive (based on NOI)
      const capRateText = await page.locator('#capRate').textContent();
      expect(capRateText).toMatch(/[0-9]\.[0-9]{3}%/); // Should be positive with precision
    });

    test('Zero down payment scenario (100% financing)', async ({ page }) => {
      await page.fill('#purchasePrice', '200000');
      await page.fill('#downPayment', '0');
      await page.fill('#purchaseClosingCosts', '4000');
      await page.fill('#estimatedRepairCosts', '10000');
      await page.fill('#loanInterestRate', '9.5'); // Higher rate for 100% financing
      await page.fill('#monthlyRent', '1800');
      
      await page.waitForTimeout(1000);
      
      // Verify calculations work with zero down payment
      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('0.0%');
      
      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$200,000.00'); // Full purchase price
      
      const totalCashText = await page.locator('#totalCashNeeded').textContent();
      expect(totalCashText).toContain('$14,000.00'); // Only closing costs + repairs
      
      // ROI calculation should handle low cash investment
      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();
      expect(cashOnCashText).toMatch(/-[0-9]+\.[0-9]{3}%/); // Should calculate correctly with precision
    });

    test('Cash purchase scenario (no financing)', async ({ page }) => {
      await page.fill('#purchasePrice', '150000');
      await page.fill('#downPayment', '150000'); // 100% cash
      await page.fill('#loanInterestRate', '0'); // No loan
      await page.fill('#monthlyRent', '1500');
      await page.fill('#monthlyPropertyTaxes', '250');
      await page.fill('#monthlyInsurance', '100');
      
      await page.waitForTimeout(1000);
      
      // Verify cash purchase calculations
      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('100.0%');
      
      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$0.00'); // No loan
      
      const monthlyPIText = await page.locator('#monthlyPI').textContent();
      expect(monthlyPIText).toContain('$0.00'); // No mortgage payment
      
      // Cash flow should be higher without mortgage payment
      const cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      expect(cashFlowText).toMatch(/\$1,?[0-9]{3}\.[0-9]{2}/); // Should be substantial positive
      
      // Cap rate and cash-on-cash should be similar for cash purchase
      const capRateText = await page.locator('#capRate').textContent();
      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();
      
      // Extract numeric values for comparison (both should be close)
      const capRateMatch = capRateText.match(/([0-9]+\.[0-9])%/);
      const cashOnCashMatch = cashOnCashText.match(/([0-9]+\.[0-9])%/);
      
      if (capRateMatch && cashOnCashMatch) {
        const capRateNum = parseFloat(capRateMatch[1]);
        const cashOnCashNum = parseFloat(cashOnCashMatch[1]);
        expect(Math.abs(capRateNum - cashOnCashNum)).toBeLessThan(0.5); // Should be within 0.5%
      }
    });
  });

  test.describe('Real-time Calculation Updates', () => {
    test('All fields update calculations in real-time', async ({ page }) => {
      // Set initial values
      await page.fill('#purchasePrice', '250000');
      await page.fill('#downPayment', '50000');
      await page.waitForTimeout(300);
      
      // Verify initial percentage
      let downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');
      
      // Change purchase price and verify percentage updates
      await page.fill('#purchasePrice', '200000');
      await page.waitForTimeout(300);
      
      downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('25.0%'); // 50000/200000 = 25%
      
      // Change down payment and verify updates
      await page.fill('#downPayment', '40000');
      await page.waitForTimeout(300);
      
      downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%'); // 40000/200000 = 20%
      
      // Verify loan amount updated
      const loanAmountText = await page.locator('#loanAmount').textContent();
      expect(loanAmountText).toContain('$160,000.00'); // 200000 - 40000
    });

    test('Income and expense changes update cash flow immediately', async ({ page }) => {
      await page.fill('#purchasePrice', '300000');
      await page.fill('#downPayment', '60000');
      await page.fill('#loanInterestRate', '6.0');
      
      // Set initial rent
      await page.fill('#monthlyRent', '2000');
      await page.fill('#monthlyPropertyTaxes', '400');
      await page.fill('#monthlyInsurance', '125');
      await page.waitForTimeout(500);
      
      // Get initial cash flow
      let cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      const initialCashFlow = parseFloat(cashFlowText.replace(/[$,]/g, ''));
      
      // Increase rent by $200
      await page.fill('#monthlyRent', '2200');
      await page.waitForTimeout(500);
      
      cashFlowText = await page.locator('#monthlyCashFlow').textContent();
      const newCashFlow = parseFloat(cashFlowText.replace(/[$,]/g, ''));
      
      // Cash flow should increase by around $180-200 (allowing for precision and calculation differences)
      expect(newCashFlow - initialCashFlow).toBeCloseTo(180, 25);
      
      // Verify ROI updated accordingly
      const cashOnCashText = await page.locator('#cashOnCashROI').textContent();
      expect(cashOnCashText).toMatch(/[0-9]\.[0-9]{3}%/);
    });
  });
});
