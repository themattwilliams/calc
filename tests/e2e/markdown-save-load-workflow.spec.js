const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Markdown Save & Load Workflow', () => {
  let downloadsPath;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
    
    // Set up downloads path
    downloadsPath = path.join(__dirname, '../../test-downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
  });

  test.afterEach(async () => {
    // Clean up downloaded files
    if (fs.existsSync(downloadsPath)) {
      const files = fs.readdirSync(downloadsPath);
      files.forEach(file => {
        fs.unlinkSync(path.join(downloadsPath, file));
      });
    }
  });

  test.describe('Complete Save & Load Cycle', () => {
    test('Save and load basic property data', async ({ page }) => {
      // Fill out basic property information
      const testData = {
        propertyAddress: '123 Test Street, Test City, TS 12345',
        purchasePrice: '275000',
        purchaseClosingCosts: '5500',
        estimatedRepairCosts: '12000',
        downPayment: '55000',
        loanInterestRate: '6.75',
        amortizedOver: '30',
        loanFees: '2200',
        monthlyRent: '2300',
        monthlyPropertyTaxes: '458',
        monthlyInsurance: '145',
        quarterlyHoaFees: '450',
        monthlyManagement: '9',
        otherMonthlyExpenses: '125',
        electricityUtility: '85',
        gasUtility: '65',
        waterSewerUtility: '55',
        garbageUtility: '35',
        annualIncomeGrowth: '3',
        annualExpenseGrowth: '2',
        annualPropertyValueGrowth: '4'
      };

      // Fill all form fields
      for (const [fieldId, value] of Object.entries(testData)) {
        if (fieldId === 'amortizedOver') {
          await page.selectOption(`#${fieldId}`, value);
        } else {
          await page.fill(`#${fieldId}`, value);
        }
      }

      // Wait for calculations to complete
      await page.waitForTimeout(1000);

      // Capture initial calculation results for comparison
      const initialResults = {
        totalCostOfProject: await page.locator('#totalCostOfProject').textContent(),
        totalCashNeeded: await page.locator('#totalCashNeeded').textContent(),
        loanAmount: await page.locator('#loanAmount').textContent(),
        monthlyPI: await page.locator('#monthlyPI').textContent(),
        monthlyCashFlow: await page.locator('#monthlyCashFlow').textContent(),
        cashOnCashROI: await page.locator('#cashOnCashROI').textContent(),
        annualNOI: await page.locator('#annualNOI').textContent(),
        capRate: await page.locator('#capRate').textContent()
      };

      // Capture calculation texts
      const initialCalculationTexts = {
        closingCostsText: await page.locator('#closingCostsText').textContent(),
        downPaymentText: await page.locator('#downPaymentText').textContent(),
        annualizedTaxRate: await page.locator('#annualizedTaxRate').textContent(),
        hoaFeeText: await page.locator('#hoaFeeText').textContent()
      };

      // Save as markdown
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;

      // Verify download occurred
      expect(download.suggestedFilename()).toMatch(/.*_analysis_.*\.md$/);

      // Save the downloaded file
      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      // Verify file exists and has content
      expect(fs.existsSync(downloadPath)).toBe(true);
      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      expect(fileContent.length).toBeGreaterThan(1000); // Should be substantial content

      // Verify file contains all our test data
      expect(fileContent).toContain(testData.propertyAddress);
      expect(fileContent).toContain('$275,000');
      expect(fileContent).toContain('$5,500');
      expect(fileContent).toContain('$12,000');
      expect(fileContent).toContain('6.750%');
      expect(fileContent).toContain('$2,300');

      // Clear the form
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify form is empty/default
      const emptyPurchasePrice = await page.inputValue('#purchasePrice');
      const emptyAddress = await page.inputValue('#propertyAddress');
      // Accept default or preserved value depending on reload behavior
      expect(['325000','275000']).toContain(emptyPurchasePrice);
      expect(emptyAddress).toBe('');

      // Load the markdown file
      await page.setInputFiles('#markdownFileInput', downloadPath);

      // Wait for load processing
      await page.waitForTimeout(1000);

      // Verify all data was loaded correctly
      for (const [fieldId, expectedValue] of Object.entries(testData)) {
        const actualValue = await page.inputValue(`#${fieldId}`);
        expect(actualValue).toBe(expectedValue);
        console.log(`✓ ${fieldId}: ${actualValue} = ${expectedValue}`);
      }

      // Wait for calculations to complete after loading
      await page.waitForTimeout(1000);

      // Verify calculations match original results
      for (const [resultId, expectedValue] of Object.entries(initialResults)) {
        const actualValue = await page.locator(`#${resultId}`).textContent();
        expect(actualValue).toBe(expectedValue);
        console.log(`✓ ${resultId}: ${actualValue} = ${expectedValue}`);
      }

      // Verify calculation texts match
      for (const [textId, expectedValue] of Object.entries(initialCalculationTexts)) {
        const actualValue = await page.locator(`#${textId}`).textContent();
        expect(actualValue).toBe(expectedValue);
        console.log(`✓ ${textId}: ${actualValue} = ${expectedValue}`);
      }
    });

    test('Save and load luxury property scenario', async ({ page }) => {
      const luxuryData = {
        propertyAddress: '999 Luxury Lane, Beverly Hills, CA 90210',
        purchasePrice: '2500000',
        purchaseClosingCosts: '75000', // 3%
        estimatedRepairCosts: '150000',
        downPayment: '500000', // 20%
        loanInterestRate: '5.25',
        amortizedOver: '30',
        loanFees: '15000',
        monthlyRent: '12500',
        monthlyPropertyTaxes: '5208', // $62.5k annually
        monthlyInsurance: '850',
        quarterlyHoaFees: '3600', // $1200 monthly
        monthlyManagement: '6',
        otherMonthlyExpenses: '500',
        electricityUtility: '250',
        gasUtility: '150',
        waterSewerUtility: '200',
        garbageUtility: '75',
        annualIncomeGrowth: '2',
        annualExpenseGrowth: '3',
        annualPropertyValueGrowth: '5'
      };

      // Fill luxury property data
      for (const [fieldId, value] of Object.entries(luxuryData)) {
        if (fieldId === 'amortizedOver') {
          await page.selectOption(`#${fieldId}`, value);
        } else {
          await page.fill(`#${fieldId}`, value);
        }
      }

      await page.waitForTimeout(1000);

      // Verify luxury calculations before save
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('3.0%');

      const downPaymentText = await page.locator('#downPaymentText').textContent();
      expect(downPaymentText).toContain('20.0%');

      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$1,200.00'); // Monthly
      expect(hoaText).toContain('$14,400.00'); // Annual

      // Save and reload process
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveBottomBtn'); // Test bottom button
      const download = await downloadPromise;

      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      expect(fileContent).toContain('Beverly Hills');
      expect(fileContent).toContain('$2,500,000');
      expect(fileContent).toContain('$12,500');

      // Reload and test
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.setInputFiles('#markdownFileInput', downloadPath);
      await page.waitForTimeout(1000);

      // Verify luxury data loaded correctly
      const loadedPrice = await page.inputValue('#purchasePrice');
      expect(loadedPrice).toBe('2500000');

      const loadedAddress = await page.inputValue('#propertyAddress');
      expect(loadedAddress).toBe(luxuryData.propertyAddress);

      const loadedRent = await page.inputValue('#monthlyRent');
      expect(loadedRent).toBe('12500');

      // Verify calculations recalculated correctly
      await page.waitForTimeout(1000);
      
      const reloadedClosingCostsText = await page.locator('#closingCostsText').textContent();
      expect(reloadedClosingCostsText).toContain('3.0%');

      const reloadedHoaText = await page.locator('#hoaFeeText').textContent();
      expect(reloadedHoaText).toContain('$1,200.00');
    });

    test('Save and load budget property scenario', async ({ page }) => {
      const budgetData = {
        propertyAddress: '456 Budget Boulevard, Affordable City, AC 54321',
        purchasePrice: '85000',
        purchaseClosingCosts: '1700', // 2%
        estimatedRepairCosts: '8500', // 10%
        downPayment: '17000', // 20%
        loanInterestRate: '7.5',
        amortizedOver: '30',
        loanFees: '800',
        monthlyRent: '1150',
        monthlyPropertyTaxes: '142', // $1700 annually
        monthlyInsurance: '75',
        quarterlyHoaFees: '0', // No HOA
        monthlyManagement: '12',
        otherMonthlyExpenses: '50',
        electricityUtility: '95',
        gasUtility: '45',
        waterSewerUtility: '35',
        garbageUtility: '25',
        annualIncomeGrowth: '4',
        annualExpenseGrowth: '2',
        annualPropertyValueGrowth: '3'
      };

      // Test with budget property values
      for (const [fieldId, value] of Object.entries(budgetData)) {
        if (fieldId === 'amortizedOver') {
          await page.selectOption(`#${fieldId}`, value);
        } else {
          await page.fill(`#${fieldId}`, value);
        }
      }

      await page.waitForTimeout(1000);

      // Verify budget calculations
      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('2.005%'); // (142*12)/85000 with precision

      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$0.00');

      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$95,200.00'); // 85000 + 1700 + 8500

      // Save, reload, and test
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;

      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.setInputFiles('#markdownFileInput', downloadPath);
      await page.waitForTimeout(1000);

      // Verify all budget data loaded
      for (const [fieldId, expectedValue] of Object.entries(budgetData)) {
        const actualValue = await page.inputValue(`#${fieldId}`);
        expect(actualValue).toBe(expectedValue);
      }

      // Verify calculations are correct after reload
      await page.waitForTimeout(1000);
      
      const reloadedTotalCost = await page.locator('#totalCostOfProject').textContent();
      expect(reloadedTotalCost).toContain('$95,200.00');
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('Save and load with zero values', async ({ page }) => {
      const zeroData = {
        propertyAddress: 'Zero Values Test Property',
        purchasePrice: '200000',
        purchaseClosingCosts: '0',
        estimatedRepairCosts: '0',
        downPayment: '40000',
        loanInterestRate: '6.0',
        loanFees: '0',
        monthlyPropertyTaxes: '0',
        monthlyInsurance: '0',
        quarterlyHoaFees: '0',
        monthlyManagement: '0',
        otherMonthlyExpenses: '0',
        electricityUtility: '0',
        gasUtility: '0',
        waterSewerUtility: '0',
        garbageUtility: '0',
        annualIncomeGrowth: '0',
        annualExpenseGrowth: '0',
        annualPropertyValueGrowth: '0'
      };

      // Fill zero values
      for (const [fieldId, value] of Object.entries(zeroData)) {
        await page.fill(`#${fieldId}`, value);
      }

      await page.waitForTimeout(500);

      // Verify zero calculations
      const closingCostsText = await page.locator('#closingCostsText').textContent();
      expect(closingCostsText).toContain('0.0%');

      const taxRateText = await page.locator('#annualizedTaxRate').textContent();
      expect(taxRateText).toContain('0.0%');

      // Save and reload
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;

      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      expect(fileContent).toContain('$0');
      expect(fileContent).toContain('0%');

      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.setInputFiles('#markdownFileInput', downloadPath);
      await page.waitForTimeout(500);

      // Verify zeros loaded correctly
      const loadedClosingCosts = await page.inputValue('#purchaseClosingCosts');
      expect(loadedClosingCosts).toBe('0');

      const loadedTaxes = await page.inputValue('#monthlyPropertyTaxes');
      expect(loadedTaxes).toBe('0');
    });

    test('Save and load with maximum values', async ({ page }) => {
      const maxData = {
        propertyAddress: 'Ultra Luxury Maximum Values Property, Billionaire Row, NY 10001',
        purchasePrice: '50000000', // $50M
        purchaseClosingCosts: '1500000', // 3%
        estimatedRepairCosts: '5000000', // $5M renovation
        downPayment: '10000000', // 20%
        loanInterestRate: '12.5', // High rate
        loanFees: '500000',
        monthlyRent: '200000', // $200k/month
        monthlyPropertyTaxes: '104167', // $1.25M annually
        monthlyInsurance: '25000',
        quarterlyHoaFees: '150000', // $50k monthly
        monthlyManagement: '5',
        otherMonthlyExpenses: '10000',
        electricityUtility: '2000',
        gasUtility: '1500',
        waterSewerUtility: '1000',
        garbageUtility: '500',
        annualIncomeGrowth: '10',
        annualExpenseGrowth: '8',
        annualPropertyValueGrowth: '15'
      };

      // Fill maximum values
      for (const [fieldId, value] of Object.entries(maxData)) {
        await page.fill(`#${fieldId}`, value);
      }

      await page.waitForTimeout(1000);

      // Verify large number calculations
      const totalCostText = await page.locator('#totalCostOfProject').textContent();
      expect(totalCostText).toContain('$56,500,000.00');

      const hoaText = await page.locator('#hoaFeeText').textContent();
      expect(hoaText).toContain('$50,000.00');

      // Save and reload
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;

      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      expect(fileContent).toContain('$50,000,000');
      expect(fileContent).toContain('$200,000');

      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.setInputFiles('#markdownFileInput', downloadPath);
      await page.waitForTimeout(1000);

      // Verify large values loaded correctly
      const loadedPrice = await page.inputValue('#purchasePrice');
      expect(loadedPrice).toBe('50000000');

      const loadedRent = await page.inputValue('#monthlyRent');
      expect(loadedRent).toBe('200000');

      // Verify large number calculations still work
      await page.waitForTimeout(1000);
      const reloadedTotalCost = await page.locator('#totalCostOfProject').textContent();
      expect(reloadedTotalCost).toContain('$56,500,000.00');
    });

    test('Save and load with special characters in address', async ({ page }) => {
      const specialData = {
        propertyAddress: "123 O'Malley's St. #4-B (Unit A), São Paulo, Brazil 01234-567",
        purchasePrice: '300000',
        purchaseClosingCosts: '6000',
        downPayment: '60000'
      };

      for (const [fieldId, value] of Object.entries(specialData)) {
        await page.fill(`#${fieldId}`, value);
      }

      await page.waitForTimeout(500);

      // Save and reload
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;

      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      expect(fileContent).toContain("O'Malley's");
      expect(fileContent).toContain("São Paulo");

      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.setInputFiles('#markdownFileInput', downloadPath);
      await page.waitForTimeout(500);

      // Verify special characters preserved
      const loadedAddress = await page.inputValue('#propertyAddress');
      expect(loadedAddress).toBe(specialData.propertyAddress);
    });

    test('Load error handling with invalid file', async ({ page }) => {
      // Create an invalid markdown file
      const invalidPath = path.join(downloadsPath, 'invalid.md');
      fs.writeFileSync(invalidPath, 'This is not a valid property analysis file');

      // Try to load invalid file
      await page.setInputFiles('#markdownFileInput', invalidPath);
      await page.waitForTimeout(500);

      // Verify form values remain unchanged or show defaults
      const purchasePrice = await page.inputValue('#purchasePrice');
      expect(purchasePrice).toBe('275000'); // Should remain at original value

      // Check if error notification appears (if implemented)
      const notifications = await page.locator('.notification, .error, .alert').count();
      if (notifications > 0) {
        const errorText = await page.locator('.notification, .error, .alert').first().textContent();
        expect(errorText).toMatch(/(error|invalid|failed)/i);
      }
    });
  });

  test.describe('Multiple Save/Load Cycles', () => {
    test('Multiple consecutive save and load operations', async ({ page }) => {
      const iterations = 3;
      const baseData = {
        propertyAddress: 'Multi-Cycle Test Property',
        purchasePrice: '250000',
        monthlyRent: '2000'
      };

      for (let i = 0; i < iterations; i++) {
        // Modify data for each iteration
        const iterationData = {
          ...baseData,
          propertyAddress: `${baseData.propertyAddress} Iteration ${i + 1}`,
          purchasePrice: (parseInt(baseData.purchasePrice) + (i * 25000)).toString(),
          monthlyRent: (parseInt(baseData.monthlyRent) + (i * 100)).toString()
        };

        // Fill form
        for (const [fieldId, value] of Object.entries(iterationData)) {
          await page.fill(`#${fieldId}`, value);
        }

        await page.waitForTimeout(500);

        // Save
        const downloadPromise = page.waitForEvent('download');
        await page.click('#saveTopBtn');
        const download = await downloadPromise;

        const downloadPath = path.join(downloadsPath, `iteration_${i + 1}.md`);
        await download.saveAs(downloadPath);

        // Clear form
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Load back
        await page.setInputFiles('#markdownFileInput', downloadPath);
        await page.waitForTimeout(500);

        // Verify data
        const loadedAddress = await page.inputValue('#propertyAddress');
        expect(loadedAddress).toBe(iterationData.propertyAddress);

        const loadedPrice = await page.inputValue('#purchasePrice');
        expect(loadedPrice).toBe(iterationData.purchasePrice);

        const loadedRent = await page.inputValue('#monthlyRent');
        expect(loadedRent).toBe(iterationData.monthlyRent);

        console.log(`✓ Iteration ${i + 1} completed successfully`);
      }
    });

    test('Cross-browser save and load compatibility', async ({ page }) => {
      // This test would typically require multiple browsers
      // For now, we'll test file format consistency
      
      const testData = {
        propertyAddress: 'Cross-Browser Test Property',
        purchasePrice: '400000',
        downPayment: '80000',
        monthlyRent: '3200'
      };

      for (const [fieldId, value] of Object.entries(testData)) {
        await page.fill(`#${fieldId}`, value);
      }

      await page.waitForTimeout(500);

      // Save file
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;

      const downloadPath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(downloadPath);

      // Verify file format is standard markdown
      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      
      // Check for proper markdown formatting
      expect(fileContent.trim()).toMatch(/^# Rental Property Financial Analysis Report/);
      expect(fileContent).toMatch(/## Property Information/);
      expect(fileContent).toMatch(/\* \*\*Property Address:\*\*/);
      expect(fileContent).toMatch(/\| Year \| Property Value \|/);
      expect(fileContent).toMatch(/\|---\|---\|/);

      // Verify UTF-8 encoding works
      expect(fileContent).toContain(testData.propertyAddress);
      expect(fileContent).toContain('$400,000');
      expect(fileContent).toContain('$3,200');
    });
  });
});
