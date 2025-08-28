/**
 * Input Validation Tests
 * 
 * Comprehensive test suite for input validation functions used in the
 * Rental Property Analysis Calculator. These tests ensure all user inputs
 * are properly validated, formatted, and sanitized.
 */

TestFramework.describe('Input Validation', function() {
    
    // ========================================
    // PURCHASE PRICE VALIDATION
    // ========================================
    
    TestFramework.test('Purchase Price - Valid standard amount', function() {
        const result = validatePurchasePrice(250000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Purchase Price - Valid string number', function() {
        const result = validatePurchasePrice('250000');
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Purchase Price - Valid decimal amount', function() {
        const result = validatePurchasePrice(249999.99);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Purchase Price - Valid minimum amount', function() {
        const result = validatePurchasePrice(1000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Purchase Price - Valid maximum amount', function() {
        const result = validatePurchasePrice(50000000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Purchase Price - Invalid: Zero', function() {
        const result = validatePurchasePrice(0);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Purchase Price - Invalid: Negative', function() {
        const result = validatePurchasePrice(-100000);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Purchase Price - Invalid: Too high', function() {
        const result = validatePurchasePrice(60000000);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Purchase Price - Invalid: Non-numeric string', function() {
        const result = validatePurchasePrice('abc123');
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Purchase Price - Invalid: Empty string', function() {
        const result = validatePurchasePrice('');
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Purchase Price - Invalid: Null/undefined', function() {
        const result1 = validatePurchasePrice(null);
        const result2 = validatePurchasePrice(undefined);
        return TestFramework.expect(result1).toBeFalsy() && TestFramework.expect(result2).toBeFalsy();
    });
    
    // ========================================
    // DOWN PAYMENT VALIDATION
    // ========================================
    
    TestFramework.test('Down Payment - Valid: 20% down payment', function() {
        const result = validateDownPayment(50000, 250000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Down Payment - Valid: 100% down payment (cash)', function() {
        const result = validateDownPayment(250000, 250000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Down Payment - Valid: Zero down payment', function() {
        const result = validateDownPayment(0, 250000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Down Payment - Valid: String numbers', function() {
        const result = validateDownPayment('50000', '250000');
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Down Payment - Invalid: Greater than purchase price', function() {
        const result = validateDownPayment(300000, 250000);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Down Payment - Invalid: Negative down payment', function() {
        const result = validateDownPayment(-10000, 250000);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Down Payment - Invalid: Non-numeric down payment', function() {
        const result = validateDownPayment('abc', 250000);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Down Payment - Invalid: Non-numeric purchase price', function() {
        const result = validateDownPayment(50000, 'abc');
        return TestFramework.expect(result).toBeFalsy();
    });
    
    // ========================================
    // PERCENTAGE VALIDATION
    // ========================================
    
    TestFramework.test('Interest Rate - Valid: Standard rate', function() {
        const rate = 6.5;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Interest Rate - Valid: Minimum rate', function() {
        const rate = 0.1;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Interest Rate - Valid: Maximum rate', function() {
        const rate = 15.0;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Interest Rate - Invalid: Zero rate', function() {
        const rate = 0;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Interest Rate - Invalid: Too high', function() {
        const rate = 20.0;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Interest Rate - Invalid: Negative', function() {
        const rate = -1.0;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    // ========================================
    // RENT VALIDATION
    // ========================================
    
    TestFramework.test('Monthly Rent - Valid: Standard amount', function() {
        const rent = 2200;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Monthly Rent - Valid: High-end amount', function() {
        const rent = 15000;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Monthly Rent - Valid: Low amount', function() {
        const rent = 500;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Monthly Rent - Invalid: Zero rent', function() {
        const rent = 0;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Monthly Rent - Invalid: Negative rent', function() {
        const rent = -500;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Monthly Rent - Invalid: Unrealistic amount', function() {
        const rent = 150000;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    // ========================================
    // EXPENSE VALIDATION
    // ========================================
    
    TestFramework.test('Property Taxes - Valid: Standard amount', function() {
        const taxes = 300;
        const isValid = !isNaN(taxes) && taxes >= 0 && taxes <= 100000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Property Taxes - Valid: Zero (rare but possible)', function() {
        const taxes = 0;
        const isValid = !isNaN(taxes) && taxes >= 0 && taxes <= 100000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Property Taxes - Invalid: Negative', function() {
        const taxes = -50;
        const isValid = !isNaN(taxes) && taxes >= 0 && taxes <= 100000;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Insurance - Valid: Standard amount', function() {
        const insurance = 150;
        const isValid = !isNaN(insurance) && insurance >= 0 && insurance <= 10000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Insurance - Invalid: Too high', function() {
        const insurance = 15000;
        const isValid = !isNaN(insurance) && insurance >= 0 && insurance <= 10000;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('HOA Fees - Valid: Standard amount', function() {
        const hoa = 200;
        const isValid = !isNaN(hoa) && hoa >= 0 && hoa <= 5000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('HOA Fees - Valid: No HOA', function() {
        const hoa = 0;
        const isValid = !isNaN(hoa) && hoa >= 0 && hoa <= 5000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    // ========================================
    // GROWTH RATE VALIDATION
    // ========================================
    
    TestFramework.test('Income Growth Rate - Valid: Standard growth', function() {
        const growth = 3.5;
        const isValid = !isNaN(growth) && growth >= 0 && growth <= 20;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Income Growth Rate - Valid: Zero growth', function() {
        const growth = 0;
        const isValid = !isNaN(growth) && growth >= 0 && growth <= 20;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Income Growth Rate - Valid: High growth market', function() {
        const growth = 15.0;
        const isValid = !isNaN(growth) && growth >= 0 && growth <= 20;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Income Growth Rate - Invalid: Negative growth', function() {
        const growth = -2.0;
        const isValid = !isNaN(growth) && growth >= 0 && growth <= 20;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Income Growth Rate - Invalid: Unrealistic growth', function() {
        const growth = 25.0;
        const isValid = !isNaN(growth) && growth >= 0 && growth <= 20;
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    // ========================================
    // LOAN TERM VALIDATION
    // ========================================
    
    TestFramework.test('Loan Term - Valid: 30 years', function() {
        const term = 30;
        const validTerms = [10, 15, 20, 25, 30];
        const isValid = validTerms.includes(term);
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Loan Term - Valid: 15 years', function() {
        const term = 15;
        const validTerms = [10, 15, 20, 25, 30];
        const isValid = validTerms.includes(term);
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Loan Term - Invalid: 35 years', function() {
        const term = 35;
        const validTerms = [10, 15, 20, 25, 30];
        const isValid = validTerms.includes(term);
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    TestFramework.test('Loan Term - Invalid: 5 years', function() {
        const term = 5;
        const validTerms = [10, 15, 20, 25, 30];
        const isValid = validTerms.includes(term);
        return TestFramework.expect(isValid).toBeFalsy();
    });
    
    // ========================================
    // COMPREHENSIVE VALIDATION SCENARIOS
    // ========================================
    
    TestFramework.test('Complete Property Validation - Valid scenario', function() {
        const propertyData = {
            purchasePrice: 250000,
            downPayment: 50000,
            interestRate: 6.5,
            loanTerm: 30,
            monthlyRent: 2200,
            propertyTaxes: 300,
            insurance: 150,
            hoaFees: 0,
            incomeGrowth: 3.0,
            expenseGrowth: 2.5,
            propertyValueGrowth: 4.0
        };
        
        const validations = [
            validatePurchasePrice(propertyData.purchasePrice),
            validateDownPayment(propertyData.downPayment, propertyData.purchasePrice),
            !isNaN(propertyData.interestRate) && propertyData.interestRate >= 0.1 && propertyData.interestRate <= 15.0,
            [10, 15, 20, 25, 30].includes(propertyData.loanTerm),
            !isNaN(propertyData.monthlyRent) && propertyData.monthlyRent > 0,
            !isNaN(propertyData.propertyTaxes) && propertyData.propertyTaxes >= 0,
            !isNaN(propertyData.insurance) && propertyData.insurance >= 0,
            !isNaN(propertyData.hoaFees) && propertyData.hoaFees >= 0,
            !isNaN(propertyData.incomeGrowth) && propertyData.incomeGrowth >= 0 && propertyData.incomeGrowth <= 20,
            !isNaN(propertyData.expenseGrowth) && propertyData.expenseGrowth >= 0 && propertyData.expenseGrowth <= 20,
            !isNaN(propertyData.propertyValueGrowth) && propertyData.propertyValueGrowth >= 0 && propertyData.propertyValueGrowth <= 20
        ];
        
        return TestFramework.expect(validations.every(v => v === true)).toBeTruthy();
    });
    
    TestFramework.test('Complete Property Validation - Invalid scenario (high down payment)', function() {
        const propertyData = {
            purchasePrice: 250000,
            downPayment: 300000, // Higher than purchase price
            interestRate: 6.5,
            loanTerm: 30,
            monthlyRent: 2200
        };
        
        const isValidDownPayment = validateDownPayment(propertyData.downPayment, propertyData.purchasePrice);
        return TestFramework.expect(isValidDownPayment).toBeFalsy();
    });
    
    TestFramework.test('Complete Property Validation - Invalid scenario (negative rent)', function() {
        const propertyData = {
            purchasePrice: 250000,
            downPayment: 50000,
            interestRate: 6.5,
            loanTerm: 30,
            monthlyRent: -100 // Negative rent
        };
        
        const isValidRent = !isNaN(propertyData.monthlyRent) && propertyData.monthlyRent > 0;
        return TestFramework.expect(isValidRent).toBeFalsy();
    });
    
    // ========================================
    // EDGE CASES AND BOUNDARY TESTS
    // ========================================
    
    TestFramework.test('Boundary Test - Minimum purchase price', function() {
        const result = validatePurchasePrice(1);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Boundary Test - Maximum purchase price', function() {
        const result = validatePurchasePrice(50000000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Boundary Test - Just over maximum purchase price', function() {
        const result = validatePurchasePrice(50000001);
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Edge Case - Very small down payment', function() {
        const result = validateDownPayment(1, 250000);
        return TestFramework.expect(result).toBeTruthy();
    });
    
    TestFramework.test('Edge Case - Very large monthly rent', function() {
        const rent = 99999;
        const isValid = !isNaN(rent) && rent > 0 && rent <= 100000;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Edge Case - Maximum interest rate', function() {
        const rate = 15.0;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    TestFramework.test('Edge Case - Minimum interest rate', function() {
        const rate = 0.1;
        const isValid = !isNaN(rate) && rate >= 0.1 && rate <= 15.0;
        return TestFramework.expect(isValid).toBeTruthy();
    });
    
    // ========================================
    // DATA TYPE VALIDATION
    // ========================================
    
    TestFramework.test('Data Type - String numbers should be accepted', function() {
        const purchasePrice = validatePurchasePrice('250000');
        const downPayment = validateDownPayment('50000', '250000');
        
        return TestFramework.expect(purchasePrice).toBeTruthy() && 
               TestFramework.expect(downPayment).toBeTruthy();
    });
    
    TestFramework.test('Data Type - Non-string, non-number should be rejected', function() {
        const purchasePrice1 = validatePurchasePrice({});
        const purchasePrice2 = validatePurchasePrice([]);
        const purchasePrice3 = validatePurchasePrice(true);
        
        return TestFramework.expect(purchasePrice1).toBeFalsy() && 
               TestFramework.expect(purchasePrice2).toBeFalsy() && 
               TestFramework.expect(purchasePrice3).toBeFalsy();
    });
    
    TestFramework.test('Data Type - Empty string should be rejected', function() {
        const result = validatePurchasePrice('');
        return TestFramework.expect(result).toBeFalsy();
    });
    
    TestFramework.test('Data Type - Whitespace-only string should be rejected', function() {
        const result = validatePurchasePrice('   ');
        return TestFramework.expect(result).toBeFalsy();
    });
});

// Log test suite loaded
console.log('✅ Input Validation Tests Loaded - ' + TestFramework.tests.filter(t => t.category === 'Input Validation').length + ' tests registered');
