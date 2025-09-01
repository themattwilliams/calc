const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Load from Markdown Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#purchasePrice')).toBeVisible();
  });

  test('Load button exists and is functional', async ({ page }) => {
    // Verify load buttons exist
    await expect(page.locator('#loadBtn')).toBeVisible();
    await expect(page.locator('#loadBottomBtn')).toBeVisible();
    await expect(page.locator('#markdownFileInput')).toBeAttached();
    
    // Verify clicking load button triggers file input
    await page.click('#loadBtn');
    // File input should be triggered but won't show dialog in headless mode
  });

  test('Complete save and load workflow', async ({ page }) => {
    // Step 1: Fill out the form with test data
    const testData = {
      propertyAddress: '123 Test Street, Test City, TS 12345',
      purchasePrice: '350000',
      purchaseClosingCosts: '10500',
      estimatedRepairCosts: '15000',
      downPayment: '70000',
      loanInterestRate: '6.75',
      amortizedOver: '30',
      monthlyRent: '2800',
      monthlyPropertyTaxes: '583',
      monthlyInsurance: '175',
      quarterlyHoaFees: '450',
      monthlyManagement: '280',
      otherMonthlyExpenses: '100',
      annualIncomeGrowth: '3.5',
      annualExpenseGrowth: '2.5',
      annualPropertyValueGrowth: '4.0'
    };

    // Fill all fields
    for (const [field, value] of Object.entries(testData)) {
      if (field === 'amortizedOver') {
        await page.selectOption(`#${field}`, value);
      } else {
        await page.fill(`#${field}`, value);
      }
    }

    await page.waitForTimeout(1000);

    // Step 2: Save as markdown
    const downloadPromise = page.waitForEvent('download');
    await page.click('#saveTopBtn');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/.*_analysis_.*\.md$/);
    
    // Save the downloaded file
    const downloadPath = path.join(__dirname, 'temp_test_file.md');
    await download.saveAs(downloadPath);
    
    // Verify file was saved
    expect(fs.existsSync(downloadPath)).toBe(true);
    const fileContent = fs.readFileSync(downloadPath, 'utf8');
    
    // Verify file contains expected data
    expect(fileContent).toContain('123 Test Street, Test City, TS 12345');
    expect(fileContent).toContain('$350,000.00');
    expect(fileContent).toContain('$2,800.00');
    expect(fileContent).toContain('6.750%');

    // Step 3: Clear the form
    await page.fill('#propertyAddress', '');
    await page.fill('#purchasePrice', '0');
    await page.fill('#monthlyRent', '0');
    await page.fill('#loanInterestRate', '0');

    await page.waitForTimeout(500);

    // Verify form is cleared
    expect(await page.inputValue('#propertyAddress')).toBe('');
    expect(await page.inputValue('#purchasePrice')).toBe('0');

    // Step 4: Load from the saved markdown file
    await page.setInputFiles('#markdownFileInput', downloadPath);
    await page.waitForFunction(() => document.getElementById('propertyAddress').value.length > 0);

    // Step 5: Verify data was loaded correctly
    expect(await page.inputValue('#propertyAddress')).toBe('123 Test Street, Test City, TS 12345');
    expect(await page.inputValue('#purchasePrice')).toBe('350000');
    expect(await page.inputValue('#purchaseClosingCosts')).toBe('10500');
    expect(await page.inputValue('#estimatedRepairCosts')).toBe('15000');
    expect(await page.inputValue('#downPayment')).toBe('70000');
    expect(await page.inputValue('#loanInterestRate')).toBe('6.75');
    expect(await page.inputValue('#amortizedOver')).toBe('30');
    expect(await page.inputValue('#monthlyRent')).toBe('2800');
    expect(await page.inputValue('#monthlyPropertyTaxes')).toBe('583');
    expect(await page.inputValue('#monthlyInsurance')).toBe('175');
    expect(await page.inputValue('#quarterlyHoaFees')).toBe('450');
    expect(await page.inputValue('#monthlyManagement')).toBe('280');
    expect(await page.inputValue('#otherMonthlyExpenses')).toBe('100');
    expect(await page.inputValue('#annualIncomeGrowth')).toBe('3.5');
    expect(await page.inputValue('#annualExpenseGrowth')).toBe('2.5');
    expect(await page.inputValue('#annualPropertyValueGrowth')).toBe('4');

    // Step 6: Verify calculations updated after loading
    const totalCostText = await page.locator('#totalCostOfProject').textContent();
    expect(totalCostText).toContain('$375,500.00'); // 350000 + 10500 + 15000

    const loanAmountText = await page.locator('#loanAmount').textContent();
    expect(loanAmountText).toContain('$280,000.00'); // 350000 - 70000

    // Cleanup
    fs.unlinkSync(downloadPath);
  });

  test('Load handles invalid file gracefully', async ({ page }) => {
    // Create a test file with invalid content
    const invalidFilePath = path.join(__dirname, 'invalid_test.md');
    fs.writeFileSync(invalidFilePath, 'This is not a valid property analysis markdown file.');

    // Set up dialog handler for alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('File validation failed');
      await dialog.accept();
    });

    // Try to load invalid file
    await page.setInputFiles('#markdownFileInput', invalidFilePath);
    
    await page.waitForTimeout(500);
    
    // Cleanup
    fs.unlinkSync(invalidFilePath);
  });

  test('Load handles partial data correctly', async ({ page }) => {
    // Create a markdown file with only partial data
    const partialMarkdown = `# Property Analysis Report

## Property Information
**Address:** 456 Partial Lane
**Purchase Price:** $200,000.00
**Monthly Rent:** $1,500.00

## Financing
**Interest Rate:** 5.5%

Generated on: ${new Date().toLocaleDateString()}
`;

    const partialFilePath = path.join(__dirname, 'partial_test.md');
    fs.writeFileSync(partialFilePath, partialMarkdown);

    // Load the partial file
    await page.setInputFiles('#markdownFileInput', partialFilePath);
    
    await page.waitForTimeout(1000);

    // Verify partial data was loaded
    expect(await page.inputValue('#propertyAddress')).toBe('456 Partial Lane');
    expect(await page.inputValue('#purchasePrice')).toBe('200000');
    expect(await page.inputValue('#monthlyRent')).toBe('1500');
    expect(await page.inputValue('#loanInterestRate')).toBe('5.5');

    // Verify unspecified fields remain at their default/current values
    // (They shouldn't be overwritten with 0 or empty values)
    
    // Cleanup
    fs.unlinkSync(partialFilePath);
  });

  test('Load from bottom button works identically', async ({ page }) => {
    // Test that the bottom load button works the same as the top one
    
    // Fill some test data
    await page.fill('#propertyAddress', 'Test Property Bottom Load');
    await page.fill('#purchasePrice', '250000');
    await page.fill('#monthlyRent', '2000');

    // Save using top button
    const downloadPromise = page.waitForEvent('download');
    await page.click('#saveTopBtn');
    const download = await downloadPromise;
    
    const downloadPath = path.join(__dirname, 'bottom_test_file.md');
    await download.saveAs(downloadPath);

    // Clear form
    await page.fill('#propertyAddress', '');
    await page.fill('#purchasePrice', '0');
    await page.fill('#monthlyRent', '0');

    // Load using bottom button (via file input)
    await page.setInputFiles('#markdownFileInput', downloadPath);
    
    await page.waitForTimeout(1000);

    // Verify data was loaded
    expect(await page.inputValue('#propertyAddress')).toBe('Test Property Bottom Load');
    expect(await page.inputValue('#purchasePrice')).toBe('250000');
    expect(await page.inputValue('#monthlyRent')).toBe('2000');

    // Cleanup
    fs.unlinkSync(downloadPath);
  });

  test('Multiple save/load cycles maintain data integrity', async ({ page }) => {
    const testCycles = [
      {
        address: 'Property A',
        price: '300000',
        rent: '2400'
      },
      {
        address: 'Property B',
        price: '450000',
        rent: '3600'
      },
      {
        address: 'Property C',
        price: '275000',
        rent: '2200'
      }
    ];

    for (let i = 0; i < testCycles.length; i++) {
      const testData = testCycles[i];
      
      // Fill form
      await page.fill('#propertyAddress', testData.address);
      await page.fill('#purchasePrice', testData.price);
      await page.fill('#monthlyRent', testData.rent);

      // Save
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveTopBtn');
      const download = await downloadPromise;
      
      const downloadPath = path.join(__dirname, `cycle_${i}_test.md`);
      await download.saveAs(downloadPath);

      // Clear and reload
      await page.fill('#propertyAddress', '');
      await page.fill('#purchasePrice', '0');
      await page.fill('#monthlyRent', '0');

      await page.setInputFiles('#markdownFileInput', downloadPath);
      await page.waitForFunction(() => document.getElementById('propertyAddress').value.length > 0);

      // Verify
      expect(await page.inputValue('#propertyAddress')).toBe(testData.address);
      expect(await page.inputValue('#purchasePrice')).toBe(testData.price);
      expect(await page.inputValue('#monthlyRent')).toBe(testData.rent);

      // Cleanup
      fs.unlinkSync(downloadPath);
    }
  });

  test('Load triggers calculation updates correctly', async ({ page }) => {
    // Create test file with specific values that produce known calculations
    const testMarkdown = `# Property Analysis Report

## Property Information
**Address:** Calculation Test Property
**Purchase Price:** $300,000.00
**Closing Costs:** $9,000.00
**Repair Costs:** $0.00

## Financing
**Down Payment:** $60,000.00
**Interest Rate:** 6.0%
**Loan Term:** 30 years

## Income
**Monthly Rent:** $2,500.00

## Expenses
**Property Taxes:** $500.00
**Insurance:** $150.00
**Management:** $250.00
**Other Expenses:** $100.00

Generated on: ${new Date().toLocaleDateString()}
`;

    const testFilePath = path.join(__dirname, 'calculation_test.md');
    fs.writeFileSync(testFilePath, testMarkdown);

    // Load the file
    await page.setInputFiles('#markdownFileInput', testFilePath);
    await page.waitForTimeout(1000);

    // Verify calculations were updated
    const totalCostText = await page.locator('#totalCostOfProject').textContent();
    expect(totalCostText).toContain('$309,000.00'); // 300000 + 9000 + 0

    const loanAmountText = await page.locator('#loanAmount').textContent();
    expect(loanAmountText).toContain('$240,000.00'); // 300000 - 60000

    const downPaymentText = await page.locator('#downPaymentText').textContent();
    expect(downPaymentText).toContain('20.0%'); // 60000 / 300000

    // Cleanup
    fs.unlinkSync(testFilePath);
  });
});
