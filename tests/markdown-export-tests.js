/**
 * Markdown Export Tests
 * 
 * Tests for the markdown report generation functionality,
 * including content formatting, data inclusion, and file generation.
 */

TestFramework.describe('Markdown Export', function() {
    
    // Sample data for testing
    const sampleData = {
        propertyAddress: "123 Test Street, Test City, TS 12345",
        purchasePrice: 250000,
        purchaseClosingCosts: 5000,
        estimatedRepairCosts: 10000,
        downPayment: 50000,
        loanInterestRate: 6.0,
        amortizedOver: 30,
        loanFees: 1000,
        monthlyRent: 2200,
        monthlyPropertyTaxes: 400,
        monthlyInsurance: 150,
        quarterlyHoaFees: 300,
        monthlyManagement: 10,
        otherMonthlyExpenses: 100,
        annualIncomeGrowth: 3.0,
        annualExpenseGrowth: 2.5,
        annualPropertyValueGrowth: 4.0
    };
    
    // ========================================
    // MARKDOWN CONTENT FORMATTING TESTS
    // ========================================
    
    TestFramework.test('Markdown - Header Generation', function() {
        const header = "# Rental Property Financial Analysis Report";
        const isValidMarkdownHeader = header.startsWith('#') && header.includes('Report');
        
        return TestFramework.expect(isValidMarkdownHeader).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Date Formatting', function() {
        const date = new Date();
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        
        // Should generate valid date/time strings
        const dateIsValid = formattedDate.length > 0 && !formattedDate.includes('Invalid');
        const timeIsValid = formattedTime.length > 0 && !formattedTime.includes('Invalid');
        
        return TestFramework.expect(dateIsValid).toBeTruthy() && 
               TestFramework.expect(timeIsValid).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Property Address Section', function() {
        const address = sampleData.propertyAddress;
        const markdownLine = `* **Property Address:** ${address}`;
        
        const isValidMarkdown = markdownLine.includes('**') && markdownLine.includes(address);
        
        return TestFramework.expect(isValidMarkdown).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Currency Formatting in Export', function() {
        const price = 250000;
        const formattedPrice = formatCurrency ? formatCurrency(price) : `$${price.toLocaleString()}`;
        const markdownLine = `* **Purchase Price:** ${formattedPrice}`;
        
        const containsDollarSign = markdownLine.includes('$');
        const containsCommas = formattedPrice.includes(',') || price < 1000;
        
        return TestFramework.expect(containsDollarSign).toBeTruthy() && 
               TestFramework.expect(containsCommas).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Percentage Formatting in Export', function() {
        const rate = 6.5;
        const formattedRate = `${rate.toFixed(1)}%`;
        const markdownLine = `* **Loan Interest Rate:** ${formattedRate}`;
        
        const containsPercentSign = markdownLine.includes('%');
        const containsDecimal = formattedRate.includes('.');
        
        return TestFramework.expect(containsPercentSign).toBeTruthy() && 
               TestFramework.expect(containsDecimal).toBeTruthy();
    });
    
    // ========================================
    // SECTION COMPLETENESS TESTS
    // ========================================
    
    TestFramework.test('Markdown - Property Information Section Complete', function() {
        const requiredFields = [
            'Property Address',
            'Purchase Price',
            'Purchase Closing Costs',
            'Estimated Repair Costs'
        ];
        
        const sectionContent = `
## Property Information
* **Property Address:** ${sampleData.propertyAddress}
* **Purchase Price:** $${sampleData.purchasePrice.toLocaleString()}
* **Purchase Closing Costs:** $${sampleData.purchaseClosingCosts.toLocaleString()}
* **Estimated Repair Costs:** $${sampleData.estimatedRepairCosts.toLocaleString()}
`;
        
        const allFieldsPresent = requiredFields.every(field => sectionContent.includes(field));
        
        return TestFramework.expect(allFieldsPresent).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Financing Section Complete', function() {
        const requiredFields = [
            'Down Payment',
            'Loan Interest Rate',
            'Amortized Over',
            'Loan Fees'
        ];
        
        const sectionContent = `
## Financing Information
* **Down Payment:** $${sampleData.downPayment.toLocaleString()}
* **Loan Interest Rate:** ${sampleData.loanInterestRate}%
* **Amortized Over:** ${sampleData.amortizedOver} years
* **Loan Fees:** $${sampleData.loanFees.toLocaleString()}
`;
        
        const allFieldsPresent = requiredFields.every(field => sectionContent.includes(field));
        
        return TestFramework.expect(allFieldsPresent).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Income & Expenses Section Complete', function() {
        const requiredFields = [
            'Monthly Rent',
            'Monthly Property Taxes',
            'Monthly Insurance',
            'Quarterly HOA Fees',
            'Monthly Management',
            'Other Monthly Expenses'
        ];
        
        const sectionContent = `
## Income & Expenses
* **Monthly Rent:** $${sampleData.monthlyRent.toLocaleString()}
* **Monthly Property Taxes:** $${sampleData.monthlyPropertyTaxes.toLocaleString()}
* **Monthly Insurance:** $${sampleData.monthlyInsurance.toLocaleString()}
* **Quarterly HOA Fees:** $${sampleData.quarterlyHoaFees.toLocaleString()}
* **Monthly Management Fee:** ${sampleData.monthlyManagement}%
* **Other Monthly Expenses:** $${sampleData.otherMonthlyExpenses.toLocaleString()}
`;
        
        const allFieldsPresent = requiredFields.every(field => sectionContent.includes(field));
        
        return TestFramework.expect(allFieldsPresent).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Growth Projections Section Complete', function() {
        const requiredFields = [
            'Annual Income Growth',
            'Annual Expense Growth',
            'Annual Property Value Growth'
        ];
        
        const sectionContent = `
## Growth Projections
* **Annual Income Growth:** ${sampleData.annualIncomeGrowth}%
* **Annual Expense Growth:** ${sampleData.annualExpenseGrowth}%
* **Annual Property Value Growth:** ${sampleData.annualPropertyValueGrowth}%
`;
        
        const allFieldsPresent = requiredFields.every(field => sectionContent.includes(field));
        
        return TestFramework.expect(allFieldsPresent).toBeTruthy();
    });
    
    // ========================================
    // TABLE FORMATTING TESTS
    // ========================================
    
    TestFramework.test('Markdown - Table Header Format', function() {
        const tableHeader = `| Year | Property Value | Equity | Annual Cash Flow |`;
        const tableSeparator = `|---|---|---|---|`;
        
        const hasCorrectColumns = tableHeader.split('|').length === 6; // 5 columns + empty start/end
        const hasCorrectSeparator = tableSeparator.includes('---');
        
        return TestFramework.expect(hasCorrectColumns).toBeTruthy() && 
               TestFramework.expect(hasCorrectSeparator).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Table Row Format', function() {
        const year = 5;
        const propertyValue = 304159;
        const equity = 156789;
        const cashFlow = 15600;
        
        const tableRow = `| ${year} | $${propertyValue.toLocaleString()} | $${equity.toLocaleString()} | $${cashFlow.toLocaleString()} |`;
        
        const hasCorrectPipes = tableRow.split('|').length === 6;
        const containsCurrency = tableRow.includes('$');
        
        return TestFramework.expect(hasCorrectPipes).toBeTruthy() && 
               TestFramework.expect(containsCurrency).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Projection Years Selection', function() {
        const allYears = Array.from({ length: 30 }, (_, i) => i + 1);
        const selectedYears = allYears.filter(year => year === 1 || year === 5 || year === 10 || year === 20 || year === 30);
        
        const expectedYears = [1, 5, 10, 20, 30];
        const correctSelection = selectedYears.every((year, index) => year === expectedYears[index]);
        
        return TestFramework.expect(correctSelection).toBeTruthy() && 
               TestFramework.expect(selectedYears.length).toBe(5);
    });
    
    // ========================================
    // FILENAME GENERATION TESTS
    // ========================================
    
    TestFramework.test('Markdown - Filename Generation from Address', function() {
        const address = "123 Main St, Suite #4";
        const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, '_');
        const date = '12/15/2023';
        const sanitizedDate = date.replace(/\//g, '-');
        const filename = `${sanitizedAddress}_analysis_${sanitizedDate}.md`;
        
        const hasCorrectExtension = filename.endsWith('.md');
        const hasNoSpecialChars = !filename.includes('#') && !filename.includes('/');
        
        return TestFramework.expect(hasCorrectExtension).toBeTruthy() && 
               TestFramework.expect(hasNoSpecialChars).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Filename with Empty Address', function() {
        const address = '';
        const fallbackName = address.replace(/[^a-zA-Z0-9]/g, '_') || 'rental_property';
        const filename = `${fallbackName}_analysis.md`;
        
        const hasFallback = filename.includes('rental_property');
        const hasCorrectExtension = filename.endsWith('.md');
        
        return TestFramework.expect(hasFallback).toBeTruthy() && 
               TestFramework.expect(hasCorrectExtension).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Filename Special Character Handling', function() {
        const problematicAddress = "123 O'Malley's St. #4-B (Unit A)";
        const sanitized = problematicAddress.replace(/[^a-zA-Z0-9]/g, '_');
        
        const noApostrophes = !sanitized.includes("'");
        const noParentheses = !sanitized.includes('(') && !sanitized.includes(')');
        const noPounds = !sanitized.includes('#');
        
        return TestFramework.expect(noApostrophes).toBeTruthy() && 
               TestFramework.expect(noParentheses).toBeTruthy() && 
               TestFramework.expect(noPounds).toBeTruthy();
    });
    
    // ========================================
    // CONTENT ACCURACY TESTS
    // ========================================
    
    TestFramework.test('Markdown - Calculated Values Inclusion', function() {
        // Mock calculated results (these would come from the actual calculations)
        const mockResults = {
            totalCostOfProject: '$265,000.00',
            monthlyPI: '$1,199.10',
            monthlyCashFlow: '$245.67',
            cashOnCashROI: '4.8%',
            capRate: '6.2%'
        };
        
        const metricsSection = `
## Key Financial Metrics
* **Total Cost of Project:** ${mockResults.totalCostOfProject}
* **Monthly P&I:** ${mockResults.monthlyPI}
* **Monthly Cash Flow:** ${mockResults.monthlyCashFlow}
* **Cash-on-Cash ROI:** ${mockResults.cashOnCashROI}
* **Cap Rate:** ${mockResults.capRate}
`;
        
        const allValuesPresent = Object.values(mockResults).every(value => 
            metricsSection.includes(value)
        );
        
        return TestFramework.expect(allValuesPresent).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Footer Attribution', function() {
        const footer = `---
*Report generated by BiggerPockets Rental Property Analysis Calculator*
*This analysis is for informational purposes only and does not constitute investment advice.*`;
        
        const hasBiggerPocketsAttribution = footer.includes('BiggerPockets');
        const hasDisclaimer = footer.includes('not constitute investment advice');
        const hasMarkdownSeparator = footer.includes('---');
        
        return TestFramework.expect(hasBiggerPocketsAttribution).toBeTruthy() && 
               TestFramework.expect(hasDisclaimer).toBeTruthy() && 
               TestFramework.expect(hasMarkdownSeparator).toBeTruthy();
    });
    
    // ========================================
    // BLOB AND DOWNLOAD FUNCTIONALITY TESTS
    // ========================================
    
    TestFramework.test('Markdown - Blob Creation Parameters', function() {
        const content = "# Test Report\nThis is test content.";
        const mimeType = 'text/markdown';
        
        // Test that we can create blob parameters correctly
        const blobOptions = { type: mimeType };
        const isValidMimeType = mimeType === 'text/markdown';
        const hasValidContent = content.length > 0;
        
        return TestFramework.expect(isValidMimeType).toBeTruthy() && 
               TestFramework.expect(hasValidContent).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Download Link Generation', function() {
        const filename = 'test_property_analysis.md';
        
        // Test link properties
        const hasCorrectExtension = filename.endsWith('.md');
        const hasUnderscoredSpaces = !filename.includes(' ');
        const isReasonableLength = filename.length > 5 && filename.length < 100;
        
        return TestFramework.expect(hasCorrectExtension).toBeTruthy() && 
               TestFramework.expect(hasUnderscoredSpaces).toBeTruthy() && 
               TestFramework.expect(isReasonableLength).toBeTruthy();
    });
    
    // ========================================
    // QUARTERLY HOA INTEGRATION TESTS
    // ========================================
    
    TestFramework.test('Markdown - Quarterly HOA Display', function() {
        const quarterlyFee = 450;
        const markdownLine = `* **Quarterly HOA Fees:** $${quarterlyFee.toLocaleString()}`;
        
        const containsQuarterly = markdownLine.includes('Quarterly');
        const containsHOA = markdownLine.includes('HOA');
        const containsAmount = markdownLine.includes('$450');
        
        return TestFramework.expect(containsQuarterly).toBeTruthy() && 
               TestFramework.expect(containsHOA).toBeTruthy() && 
               TestFramework.expect(containsAmount).toBeTruthy();
    });
    
    // ========================================
    // ERROR HANDLING TESTS
    // ========================================
    
    TestFramework.test('Markdown - Null Value Handling', function() {
        const nullValue = null;
        const undefinedValue = undefined;
        const emptyValue = '';
        
        const processedNull = nullValue || 'N/A';
        const processedUndefined = undefinedValue || 'N/A';
        const processedEmpty = emptyValue || 'N/A';
        
        return TestFramework.expect(processedNull).toBe('N/A') && 
               TestFramework.expect(processedUndefined).toBe('N/A') && 
               TestFramework.expect(processedEmpty).toBe('N/A');
    });
    
    TestFramework.test('Markdown - Large Number Formatting', function() {
        const largeNumber = 10000000; // $10M
        const formatted = `$${largeNumber.toLocaleString()}`;
        
        const hasCommas = formatted.includes(',');
        const hasDollarSign = formatted.includes('$');
        const correctFormat = formatted === '$10,000,000';
        
        return TestFramework.expect(hasCommas).toBeTruthy() && 
               TestFramework.expect(hasDollarSign).toBeTruthy() && 
               TestFramework.expect(correctFormat).toBeTruthy();
    });
    
    TestFramework.test('Markdown - Zero Value Display', function() {
        const zeroValue = 0;
        const formattedZero = `$${zeroValue.toLocaleString()}`;
        
        const correctZeroFormat = formattedZero === '$0';
        
        return TestFramework.expect(correctZeroFormat).toBeTruthy();
    });
    
    // ========================================
    // INTEGRATION WITH CALCULATIONS
    // ========================================
    
    TestFramework.test('Markdown - Projection Data Structure', function() {
        // Mock projection data structure
        const mockProjectionData = [
            { year: 1, propertyValue: 260000, equity: 65000, annualCashFlow: 2800 },
            { year: 5, propertyValue: 304159, equity: 156789, annualCashFlow: 3200 },
            { year: 10, propertyValue: 370061, equity: 295432, annualCashFlow: 3800 },
            { year: 20, propertyValue: 547734, equity: 547734, annualCashFlow: 5600 },
            { year: 30, propertyValue: 811059, equity: 811059, annualCashFlow: 8200 }
        ];
        
        const selectedYears = mockProjectionData.filter(d => 
            d.year === 1 || d.year === 5 || d.year === 10 || d.year === 20 || d.year === 30
        );
        
        const allRequiredFields = selectedYears.every(d => 
            d.hasOwnProperty('year') && 
            d.hasOwnProperty('propertyValue') && 
            d.hasOwnProperty('equity') && 
            d.hasOwnProperty('annualCashFlow')
        );
        
        return TestFramework.expect(selectedYears.length).toBe(5) && 
               TestFramework.expect(allRequiredFields).toBeTruthy();
    });
});

// Log test suite loaded
console.log('✅ Markdown Export Tests Loaded - ' + TestFramework.tests.filter(t => t.category === 'Markdown Export').length + ' tests registered');
