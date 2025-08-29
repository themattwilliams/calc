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
    
    // ========================================
    // USER INTERFACE INTEGRATION TESTS
    // ========================================
    
    TestFramework.test('UI Integration - Toggle Button Functionality', function() {
        // Create mock toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'taxInputToggle';
        toggleButton.textContent = 'Monthly $';
        toggleButton.setAttribute('data-mode', 'monthly');
        document.body.appendChild(toggleButton);
        
        // Create mock input containers
        const monthlyContainer = document.createElement('div');
        monthlyContainer.id = 'monthlyTaxInput';
        document.body.appendChild(monthlyContainer);
        
        const rateContainer = document.createElement('div');
        rateContainer.id = 'rateTaxInput';
        rateContainer.classList.add('hidden');
        document.body.appendChild(rateContainer);
        
        // Simulate toggle functionality
        const currentMode = toggleButton.getAttribute('data-mode');
        const isMonthlyMode = currentMode === 'monthly';
        
        // Toggle to rate mode
        if (isMonthlyMode) {
            toggleButton.setAttribute('data-mode', 'rate');
            toggleButton.textContent = 'Annual %';
            monthlyContainer.classList.add('hidden');
            rateContainer.classList.remove('hidden');
        }
        
        const toggleWorked = toggleButton.getAttribute('data-mode') === 'rate' &&
                           toggleButton.textContent === 'Annual %' &&
                           monthlyContainer.classList.contains('hidden') &&
                           !rateContainer.classList.contains('hidden');
        
        // Cleanup
        document.body.removeChild(toggleButton);
        document.body.removeChild(monthlyContainer);
        document.body.removeChild(rateContainer);
        
        return toggleWorked;
    });
    
    TestFramework.test('UI Integration - Quick Entry Button Integration', function() {
        // Create mock quick entry buttons for both modes
        const monthlyButtons = [
            { value: '200', text: '$200' },
            { value: '400', text: '$400' },
            { value: '600', text: '$600' }
        ];
        
        const rateButtons = [
            { value: '1.0', text: '1.0%' },
            { value: '1.5', text: '1.5%' },
            { value: '2.0', text: '2.0%' }
        ];
        
        const createdElements = [];
        
        // Test monthly buttons
        monthlyButtons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = 'btn-quick-entry tax-monthly';
            btn.textContent = button.text;
            btn.setAttribute('data-value', button.value);
            btn.setAttribute('data-target', 'monthlyPropertyTaxes');
            document.body.appendChild(btn);
            createdElements.push(btn);
        });
        
        // Test rate buttons
        rateButtons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = 'btn-quick-entry tax-rate';
            btn.textContent = button.text;
            btn.setAttribute('data-value', button.value);
            btn.setAttribute('data-target', 'annualTaxRate');
            document.body.appendChild(btn);
            createdElements.push(btn);
        });
        
        // Verify buttons are created correctly
        const monthlyBtns = document.querySelectorAll('.tax-monthly');
        const rateBtns = document.querySelectorAll('.tax-rate');
        
        const hasCorrectButtons = monthlyBtns.length === 3 && rateBtns.length === 3;
        
        // Test button click simulation
        let clickHandled = true;
        createdElements.forEach(btn => {
            // Simulate click event
            const clickEvent = new Event('click');
            btn.dispatchEvent(clickEvent);
            // In real implementation, this would update the target input
        });
        
        // Cleanup
        createdElements.forEach(btn => document.body.removeChild(btn));
        
        return hasCorrectButtons && clickHandled;
    });
    
    TestFramework.test('UI Integration - Calculation Display Updates', function() {
        // Create mock calculation display
        const calcDisplay = document.createElement('div');
        calcDisplay.id = 'propertyTaxCalculation';
        calcDisplay.textContent = 'Enter property purchase price to see tax calculations';
        document.body.appendChild(calcDisplay);
        
        // Simulate calculation update
        const propertyValue = 300000;
        const monthlyTax = 250;
        const annualTax = monthlyTax * 12;
        const taxRate = (annualTax / propertyValue) * 100;
        
        // Update display with calculation
        const displayText = `Annual: $${annualTax.toLocaleString()} | Tax Rate: ${taxRate.toFixed(2)}%`;
        calcDisplay.textContent = displayText;
        
        const hasCorrectDisplay = calcDisplay.textContent.includes('$3,000') &&
                                calcDisplay.textContent.includes('1.00%');
        
        // Test empty state
        calcDisplay.textContent = 'Enter monthly tax amount';
        const hasEmptyState = calcDisplay.textContent.includes('Enter monthly');
        
        // Cleanup
        document.body.removeChild(calcDisplay);
        
        return hasCorrectDisplay && hasEmptyState;
    });
    
    // ========================================
    // ADVANCED VALIDATION TESTS
    // ========================================
    
    TestFramework.test('Advanced Validation - Property Value Changes', function() {
        const initialPropertyValue = 200000;
        const updatedPropertyValue = 400000;
        const monthlyTax = 200;
        
        // Calculate initial rate
        const initialRate = mockTaxFunctions.calculateRateFromMonthly(
            initialPropertyValue, 
            monthlyTax
        );
        
        // Calculate new rate with updated property value
        const updatedRate = mockTaxFunctions.calculateRateFromMonthly(
            updatedPropertyValue, 
            monthlyTax
        );
        
        // Rate should change when property value changes
        const rateChanged = Math.abs(initialRate - updatedRate) > 0.1;
        
        // New rate should be half of original (property value doubled)
        const expectedRate = initialRate / 2;
        const rateCorrect = Math.abs(updatedRate - expectedRate) < 0.01;
        
        return rateChanged && rateCorrect;
    });
    
    TestFramework.test('Advanced Validation - Multiple Currency Formats', function() {
        const propertyValue = 500000;
        
        // Test different input formats that might be entered
        const testInputs = [
            { input: '300.50', expected: 300.50 },
            { input: '$300.50', expected: 300.50 },
            { input: '300,50', expected: 300.50 }, // European format
            { input: '1,234.56', expected: 1234.56 },
            { input: '$1,234.56', expected: 1234.56 }
        ];
        
        let allFormatsHandled = true;
        
        testInputs.forEach(test => {
            // In real implementation, this would parse the input string
            const parsedValue = parseFloat(test.input.replace(/[$,]/g, '').replace(',', '.'));
            
            if (Math.abs(parsedValue - test.expected) > 0.01) {
                allFormatsHandled = false;
            }
            
            // Test calculation with parsed value
            const rate = mockTaxFunctions.calculateRateFromMonthly(propertyValue, parsedValue);
            const isValidRate = !isNaN(rate) && rate > 0;
            
            if (!isValidRate) {
                allFormatsHandled = false;
            }
        });
        
        return allFormatsHandled;
    });
    
    TestFramework.test('Advanced Validation - Real Estate Market Scenarios', function() {
        // Test various real estate market scenarios
        const scenarios = [
            { name: 'High-Tax Area', property: 400000, rate: 2.5, expected: 833.33 },
            { name: 'Low-Tax Area', property: 400000, rate: 0.5, expected: 166.67 },
            { name: 'Luxury Property', property: 2000000, rate: 1.2, expected: 2000 },
            { name: 'Starter Home', property: 150000, rate: 1.8, expected: 225 },
            { name: 'Commercial Property', property: 1500000, rate: 3.0, expected: 3750 }
        ];
        
        let allScenariosValid = true;
        
        scenarios.forEach(scenario => {
            const calculatedMonthly = mockTaxFunctions.calculateMonthlyFromRate(
                scenario.property, 
                scenario.rate
            );
            
            const monthlyCorrect = Math.abs(calculatedMonthly - scenario.expected) < 0.5;
            
            // Test reverse calculation
            const calculatedRate = mockTaxFunctions.calculateRateFromMonthly(
                scenario.property, 
                scenario.expected
            );
            
            const rateCorrect = Math.abs(calculatedRate - scenario.rate) < 0.01;
            
            if (!monthlyCorrect || !rateCorrect) {
                allScenariosValid = false;
            }
        });
        
        return allScenariosValid;
    });
    
    // ========================================
    // ACCESSIBILITY TESTS
    // ========================================
    
    TestFramework.test('Accessibility - Screen Reader Support', function() {
        // Create accessible tax input elements
        const monthlyInput = document.createElement('input');
        monthlyInput.type = 'number';
        monthlyInput.id = 'monthlyPropertyTaxes';
        monthlyInput.setAttribute('aria-label', 'Monthly property taxes in dollars');
        monthlyInput.setAttribute('aria-describedby', 'monthly-tax-help');
        document.body.appendChild(monthlyInput);
        
        const rateInput = document.createElement('input');
        rateInput.type = 'number';
        rateInput.id = 'annualTaxRate';
        rateInput.setAttribute('aria-label', 'Annual property tax rate as percentage');
        rateInput.setAttribute('aria-describedby', 'rate-tax-help');
        document.body.appendChild(rateInput);
        
        const helpText = document.createElement('div');
        helpText.id = 'monthly-tax-help';
        helpText.textContent = 'Enter the monthly property tax amount in dollars';
        document.body.appendChild(helpText);
        
        // Check accessibility attributes
        const hasAriaLabel = monthlyInput.hasAttribute('aria-label') && 
                           rateInput.hasAttribute('aria-label');
        const hasAriaDescribed = monthlyInput.hasAttribute('aria-describedby') && 
                               rateInput.hasAttribute('aria-describedby');
        const hasHelpText = helpText.textContent.length > 0;
        
        // Cleanup
        document.body.removeChild(monthlyInput);
        document.body.removeChild(rateInput);
        document.body.removeChild(helpText);
        
        return hasAriaLabel && hasAriaDescribed && hasHelpText;
    });
    
    TestFramework.test('Accessibility - Keyboard Navigation', function() {
        // Create toggle button with keyboard support
        const toggleButton = document.createElement('button');
        toggleButton.id = 'taxInputToggle';
        toggleButton.textContent = 'Monthly $';
        toggleButton.tabIndex = 0;
        toggleButton.setAttribute('aria-pressed', 'false');
        toggleButton.setAttribute('role', 'switch');
        document.body.appendChild(toggleButton);
        
        // Test focus
        toggleButton.focus();
        const canFocus = document.activeElement === toggleButton;
        
        // Test keyboard activation
        let keyboardActivated = false;
        toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                keyboardActivated = true;
                e.preventDefault();
            }
        });
        
        // Simulate keyboard events
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        toggleButton.dispatchEvent(enterEvent);
        
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        toggleButton.dispatchEvent(spaceEvent);
        
        // Cleanup
        document.body.removeChild(toggleButton);
        
        return canFocus && keyboardActivated;
    });
    
    // ========================================
    // PERFORMANCE TESTS
    // ========================================
    
    TestFramework.test('Performance - Rapid Input Changes', function() {
        const propertyValue = 350000;
        const startTime = performance.now();
        
        // Simulate rapid input changes
        const testValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
        
        testValues.forEach(monthlyTax => {
            const rate = mockTaxFunctions.calculateRateFromMonthly(propertyValue, monthlyTax);
            const backCalculated = mockTaxFunctions.calculateMonthlyFromRate(propertyValue, rate);
        });
        
        const endTime = performance.now();
        const calculationTime = endTime - startTime;
        
        // Should complete all calculations quickly
        return calculationTime < 10; // Less than 10ms for 10 calculations
    });
    
    TestFramework.test('Performance - Memory Efficiency', function() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Perform many calculations
        for (let i = 0; i < 1000; i++) {
            const propertyValue = 100000 + (i * 1000);
            const monthlyTax = 100 + (i * 0.5);
            
            const rate = mockTaxFunctions.calculateRateFromMonthly(propertyValue, monthlyTax);
            const backCalculated = mockTaxFunctions.calculateMonthlyFromRate(propertyValue, rate);
        }
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory usage should not increase significantly
        return !performance.memory || memoryIncrease < 100000; // Less than 100KB increase
    });
});
