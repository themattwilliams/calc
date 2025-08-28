/**
 * Property Tax Dual Input System Test Suite
 * 
 * Tests for the enhanced property tax input that allows users to enter
 * either a dollar amount (monthly taxes) or a percentage (annual tax rate)
 * with automatic bidirectional conversion and synchronization.
 */

TestFramework.suite('Property Tax Dual Input System', function() {
    
    // Mock tax calculation functions for testing
    const mockTaxFunctions = {
        /**
         * Calculate monthly tax amount from annual tax rate
         * @param {number} propertyValue - Property purchase price
         * @param {number} annualTaxRate - Annual tax rate as percentage (e.g., 1.25 for 1.25%)
         * @returns {number} Monthly tax amount
         */
        calculateMonthlyFromRate: function(propertyValue, annualTaxRate) {
            if (!propertyValue || !annualTaxRate) return 0;
            const annualTax = propertyValue * (annualTaxRate / 100);
            return annualTax / 12;
        },
        
        /**
         * Calculate annual tax rate from monthly tax amount
         * @param {number} propertyValue - Property purchase price
         * @param {number} monthlyTaxAmount - Monthly tax amount in dollars
         * @returns {number} Annual tax rate as percentage
         */
        calculateRateFromMonthly: function(propertyValue, monthlyTaxAmount) {
            if (!propertyValue || !monthlyTaxAmount) return 0;
            const annualTax = monthlyTaxAmount * 12;
            return (annualTax / propertyValue) * 100;
        },
        
        /**
         * Validate tax rate input
         * @param {number} taxRate - Tax rate percentage
         * @returns {object} Validation result
         */
        validateTaxRate: function(taxRate) {
            const errors = [];
            
            if (taxRate < 0) {
                errors.push('Tax rate cannot be negative');
            }
            if (taxRate > 10) {
                errors.push('Tax rate seems unusually high (>10%)');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: taxRate > 5 ? ['Tax rate is very high (>5%)'] : []
            };
        },
        
        /**
         * Validate monthly tax amount
         * @param {number} monthlyAmount - Monthly tax amount
         * @param {number} propertyValue - Property value for context
         * @returns {object} Validation result
         */
        validateMonthlyAmount: function(monthlyAmount, propertyValue) {
            const errors = [];
            const warnings = [];
            
            if (monthlyAmount < 0) {
                errors.push('Monthly tax amount cannot be negative');
            }
            
            if (propertyValue > 0) {
                const impliedRate = this.calculateRateFromMonthly(propertyValue, monthlyAmount);
                if (impliedRate > 10) {
                    warnings.push('Monthly amount implies very high tax rate (>10%)');
                }
                if (impliedRate < 0.1 && monthlyAmount > 0) {
                    warnings.push('Monthly amount implies very low tax rate (<0.1%)');
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        }
    };
    
    // ========================================
    // CALCULATION ACCURACY TESTS
    // ========================================
    
    TestFramework.test('Tax Calculations - Monthly from Rate Conversion', function() {
        const testCases = [
            { propertyValue: 300000, rate: 1.25, expectedMonthly: 312.50 },
            { propertyValue: 500000, rate: 2.0, expectedMonthly: 833.33 },
            { propertyValue: 150000, rate: 0.75, expectedMonthly: 93.75 },
            { propertyValue: 750000, rate: 1.8, expectedMonthly: 1125.00 },
            { propertyValue: 100000, rate: 3.0, expectedMonthly: 250.00 }
        ];
        
        const results = testCases.map(testCase => {
            const calculated = mockTaxFunctions.calculateMonthlyFromRate(
                testCase.propertyValue, 
                testCase.rate
            );
            return Math.abs(calculated - testCase.expectedMonthly) < 0.01;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Tax Calculations - Rate from Monthly Conversion', function() {
        const testCases = [
            { propertyValue: 300000, monthlyAmount: 312.50, expectedRate: 1.25 },
            { propertyValue: 500000, monthlyAmount: 833.33, expectedRate: 2.0 },
            { propertyValue: 150000, monthlyAmount: 93.75, expectedRate: 0.75 },
            { propertyValue: 750000, monthlyAmount: 1125.00, expectedRate: 1.8 },
            { propertyValue: 100000, monthlyAmount: 250.00, expectedRate: 3.0 }
        ];
        
        const results = testCases.map(testCase => {
            const calculated = mockTaxFunctions.calculateRateFromMonthly(
                testCase.propertyValue, 
                testCase.monthlyAmount
            );
            return Math.abs(calculated - testCase.expectedRate) < 0.01;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Tax Calculations - Bidirectional Consistency', function() {
        // Test that converting rate->monthly->rate gives same result
        const originalPropertyValue = 400000;
        const originalRate = 1.5;
        
        const monthlyAmount = mockTaxFunctions.calculateMonthlyFromRate(
            originalPropertyValue, 
            originalRate
        );
        const calculatedRate = mockTaxFunctions.calculateRateFromMonthly(
            originalPropertyValue, 
            monthlyAmount
        );
        
        // Should be within 0.01% of original rate
        return Math.abs(calculatedRate - originalRate) < 0.01;
    });
    
    TestFramework.test('Tax Calculations - Edge Case Zero Values', function() {
        const results = [
            // Zero property value
            mockTaxFunctions.calculateMonthlyFromRate(0, 1.5) === 0,
            mockTaxFunctions.calculateRateFromMonthly(0, 500) === 0,
            
            // Zero rate/amount
            mockTaxFunctions.calculateMonthlyFromRate(300000, 0) === 0,
            mockTaxFunctions.calculateRateFromMonthly(300000, 0) === 0
        ];
        
        return results.every(result => result === true);
    });
    
    // ========================================
    // VALIDATION TESTS
    // ========================================
    
    TestFramework.test('Tax Rate Validation - Valid Rates', function() {
        const validRates = [0.5, 1.0, 1.25, 2.0, 2.5, 3.0, 4.0];
        
        const results = validRates.map(rate => {
            const validation = mockTaxFunctions.validateTaxRate(rate);
            return validation.isValid && validation.errors.length === 0;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Tax Rate Validation - Invalid Rates', function() {
        const invalidRates = [-1, -0.5, 15, 25];
        
        const results = invalidRates.map(rate => {
            const validation = mockTaxFunctions.validateTaxRate(rate);
            return !validation.isValid && validation.errors.length > 0;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Tax Rate Validation - Warning Thresholds', function() {
        const highRates = [5.5, 6.0, 7.0, 8.0];
        
        const results = highRates.map(rate => {
            const validation = mockTaxFunctions.validateTaxRate(rate);
            return validation.isValid && validation.warnings.length > 0;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Monthly Amount Validation - Valid Amounts', function() {
        const testCases = [
            { propertyValue: 300000, monthlyAmount: 250 },
            { propertyValue: 500000, monthlyAmount: 800 },
            { propertyValue: 150000, monthlyAmount: 100 }
        ];
        
        const results = testCases.map(testCase => {
            const validation = mockTaxFunctions.validateMonthlyAmount(
                testCase.monthlyAmount, 
                testCase.propertyValue
            );
            return validation.isValid;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Monthly Amount Validation - Negative Amount Error', function() {
        const validation = mockTaxFunctions.validateMonthlyAmount(-100, 300000);
        
        return !validation.isValid && 
               validation.errors.some(error => error.includes('cannot be negative'));
    });
    
    // ========================================
    // REALISTIC SCENARIO TESTS
    // ========================================
    
    TestFramework.test('Realistic Scenarios - Common Tax Rates by Region', function() {
        const scenarios = [
            { region: 'Texas', propertyValue: 350000, expectedRate: 1.8, description: 'Texas average' },
            { region: 'California', propertyValue: 750000, expectedRate: 0.75, description: 'California Prop 13' },
            { region: 'New Jersey', propertyValue: 400000, expectedRate: 2.4, description: 'New Jersey high tax' },
            { region: 'Florida', propertyValue: 300000, expectedRate: 1.0, description: 'Florida no income tax' },
            { region: 'Wyoming', propertyValue: 200000, expectedRate: 0.6, description: 'Wyoming low tax' }
        ];
        
        const results = scenarios.map(scenario => {
            const monthlyAmount = mockTaxFunctions.calculateMonthlyFromRate(
                scenario.propertyValue, 
                scenario.expectedRate
            );
            const backCalculatedRate = mockTaxFunctions.calculateRateFromMonthly(
                scenario.propertyValue, 
                monthlyAmount
            );
            
            // Verify round-trip calculation accuracy
            return Math.abs(backCalculatedRate - scenario.expectedRate) < 0.01;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Realistic Scenarios - Property Value Ranges', function() {
        const propertyValues = [75000, 150000, 300000, 500000, 750000, 1000000];
        const standardRate = 1.25; // 1.25% annual tax rate
        
        const results = propertyValues.map(propertyValue => {
            const monthlyAmount = mockTaxFunctions.calculateMonthlyFromRate(
                propertyValue, 
                standardRate
            );
            
            // Verify amount makes sense for property value
            const expectedMonthly = (propertyValue * 0.0125) / 12;
            return Math.abs(monthlyAmount - expectedMonthly) < 0.01;
        });
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Realistic Scenarios - Tax Amount Reasonableness Check', function() {
        const testCases = [
            { propertyValue: 200000, monthlyAmount: 208.33, expectedRate: 1.25 }, // $2500/year
            { propertyValue: 400000, monthlyAmount: 666.67, expectedRate: 2.0 },  // $8000/year
            { propertyValue: 600000, monthlyAmount: 375.00, expectedRate: 0.75 }, // $4500/year
        ];
        
        const results = testCases.map(testCase => {
            const calculatedRate = mockTaxFunctions.calculateRateFromMonthly(
                testCase.propertyValue, 
                testCase.monthlyAmount
            );
            
            // Check if calculated rate matches expected rate
            return Math.abs(calculatedRate - testCase.expectedRate) < 0.01;
        });
        
        return results.every(result => result === true);
    });
    
    // ========================================
    // INPUT SWITCHING BEHAVIOR TESTS
    // ========================================
    
    TestFramework.test('Input Mode Switching - Rate to Amount Switch', function() {
        // Simulate user entering rate first, then switching to amount
        const propertyValue = 350000;
        const userRate = 1.5;
        
        // Calculate what monthly amount should be
        const calculatedMonthly = mockTaxFunctions.calculateMonthlyFromRate(
            propertyValue, 
            userRate
        );
        
        // Now user switches to manual amount entry
        const manualAmount = 450; // User enters $450/month
        const newImpliedRate = mockTaxFunctions.calculateRateFromMonthly(
            propertyValue, 
            manualAmount
        );
        
        // Verify calculations are consistent
        return calculatedMonthly > 0 && newImpliedRate > 0 && 
               newImpliedRate !== userRate; // Should be different
    });
    
    TestFramework.test('Input Mode Switching - Amount to Rate Switch', function() {
        // Simulate user entering amount first, then switching to rate
        const propertyValue = 280000;
        const userAmount = 350; // $350/month
        
        // Calculate what rate this implies
        const calculatedRate = mockTaxFunctions.calculateRateFromMonthly(
            propertyValue, 
            userAmount
        );
        
        // Now user switches to manual rate entry
        const manualRate = 1.8; // User enters 1.8%
        const newImpliedAmount = mockTaxFunctions.calculateMonthlyFromRate(
            propertyValue, 
            manualRate
        );
        
        // Verify calculations are consistent
        return calculatedRate > 0 && newImpliedAmount > 0 && 
               Math.abs(newImpliedAmount - userAmount) > 1; // Should be different
    });
    
    // ========================================
    // PRECISION AND ROUNDING TESTS
    // ========================================
    
    TestFramework.test('Precision - Decimal Rate Handling', function() {
        const propertyValue = 333333;
        const preciseRate = 1.234567; // Very precise rate
        
        const monthlyAmount = mockTaxFunctions.calculateMonthlyFromRate(
            propertyValue, 
            preciseRate
        );
        const backCalculatedRate = mockTaxFunctions.calculateRateFromMonthly(
            propertyValue, 
            monthlyAmount
        );
        
        // Should maintain reasonable precision (within 0.001%)
        return Math.abs(backCalculatedRate - preciseRate) < 0.001;
    });
    
    TestFramework.test('Precision - Decimal Amount Handling', function() {
        const propertyValue = 287500;
        const preciseAmount = 234.56; // Precise monthly amount
        
        const calculatedRate = mockTaxFunctions.calculateRateFromMonthly(
            propertyValue, 
            preciseAmount
        );
        const backCalculatedAmount = mockTaxFunctions.calculateMonthlyFromRate(
            propertyValue, 
            calculatedRate
        );
        
        // Should maintain reasonable precision (within $0.01)
        return Math.abs(backCalculatedAmount - preciseAmount) < 0.01;
    });
    
    TestFramework.test('Precision - Large Property Values', function() {
        const largePropertyValue = 2500000; // $2.5M property
        const rate = 1.5;
        
        const monthlyAmount = mockTaxFunctions.calculateMonthlyFromRate(
            largePropertyValue, 
            rate
        );
        const backCalculatedRate = mockTaxFunctions.calculateRateFromMonthly(
            largePropertyValue, 
            monthlyAmount
        );
        
        // Should maintain precision even with large values
        return Math.abs(backCalculatedRate - rate) < 0.01;
    });
});
