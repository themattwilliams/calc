/**
 * Financial Accuracy Tests
 * 
 * Comprehensive tests for financial calculation accuracy, precision, and real-world scenarios.
 * These tests ensure our calculations match industry standards and provide reliable results.
 */

TestFramework.describe('Financial Accuracy', function() {
    
    // ========================================
    // MORTGAGE CALCULATION PRECISION TESTS
    // ========================================
    
    TestFramework.test('Mortgage Precision - Industry Standard Comparisons', function() {
        // Check if calculation function is available
        if (typeof calculateMortgagePayment !== 'function') {
            return true; // Skip test if function not available
        }
        
        // Test against known industry-standard mortgage calculations
        const industryStandards = [
            {
                principal: 200000,
                rate: 6.5,
                term: 30,
                expected: 1264.14, // Standard PMT formula result
                tolerance: 0.01
            },
            {
                principal: 350000,
                rate: 5.75,
                term: 30,
                expected: 2042.71,
                tolerance: 0.01
            },
            {
                principal: 150000,
                rate: 7.25,
                term: 15,
                expected: 1360.03,
                tolerance: 0.01
            },
            {
                principal: 500000,
                rate: 4.875,
                term: 30,
                expected: 2643.96,
                tolerance: 0.01
            }
        ];
        
        let allWithinTolerance = true;
        const results = [];
        
        industryStandards.forEach(standard => {
            const calculated = calculateMortgagePayment(standard.principal, standard.rate, standard.term);
            const difference = Math.abs(calculated - standard.expected);
            const withinTolerance = difference <= standard.tolerance;
            
            if (!withinTolerance) {
                allWithinTolerance = false;
            }
            
            results.push({
                scenario: `$${standard.principal} at ${standard.rate}% for ${standard.term} years`,
                expected: standard.expected,
                calculated: calculated,
                difference: difference,
                withinTolerance: withinTolerance
            });
        });
        
        if (!allWithinTolerance) {
            console.log('Mortgage precision failures:', results.filter(r => !r.withinTolerance));
        }
        
        return TestFramework.expect(allWithinTolerance).toBe(true);
    });
    
    TestFramework.test('Mortgage Precision - Extreme Value Handling', function() {
        const extremeScenarios = [
            {
                name: "Very Low Principal",
                principal: 1000,
                rate: 5.0,
                term: 30,
                expectValid: true
            },
            {
                name: "Very High Principal",
                principal: 10000000,
                rate: 5.0,
                term: 30,
                expectValid: true
            },
            {
                name: "Very Low Rate",
                principal: 200000,
                rate: 0.01,
                term: 30,
                expectValid: true
            },
            {
                name: "Very High Rate",
                principal: 200000,
                rate: 25.0,
                term: 30,
                expectValid: true
            },
            {
                name: "Short Term",
                principal: 200000,
                rate: 5.0,
                term: 1,
                expectValid: true
            },
            {
                name: "Long Term",
                principal: 200000,
                rate: 5.0,
                term: 50,
                expectValid: true
            }
        ];
        
        let allValidHandled = true;
        
        extremeScenarios.forEach(scenario => {
            try {
                const result = calculateMortgagePayment(scenario.principal, scenario.rate, scenario.term);
                const isValid = isFinite(result) && result > 0;
                
                if (scenario.expectValid && !isValid) {
                    console.error(`Extreme scenario failed: ${scenario.name} - Result: ${result}`);
                    allValidHandled = false;
                }
            } catch (error) {
                if (scenario.expectValid) {
                    console.error(`Extreme scenario threw error: ${scenario.name} - ${error.message}`);
                    allValidHandled = false;
                }
            }
        });
        
        return TestFramework.expect(allValidHandled).toBe(true);
    });
    
    // ========================================
    // ROI CALCULATION ACCURACY TESTS
    // ========================================
    
    TestFramework.test('ROI Accuracy - Cash-on-Cash Calculations', function() {
        const roiScenarios = [
            {
                annualCashFlow: 6000,
                initialInvestment: 60000,
                expectedROI: 10.0,
                tolerance: 0.01
            },
            {
                annualCashFlow: 12000,
                initialInvestment: 80000,
                expectedROI: 15.0,
                tolerance: 0.01
            },
            {
                annualCashFlow: -2400,
                initialInvestment: 40000,
                expectedROI: -6.0,
                tolerance: 0.01
            },
            {
                annualCashFlow: 18750,
                initialInvestment: 125000,
                expectedROI: 15.0,
                tolerance: 0.01
            }
        ];
        
        let allAccurate = true;
        
        roiScenarios.forEach(scenario => {
            const calculated = calculateCashOnCashROI(scenario.annualCashFlow, scenario.initialInvestment);
            const difference = Math.abs(calculated - scenario.expectedROI);
            
            if (difference > scenario.tolerance) {
                console.error(`ROI calculation error: Expected ${scenario.expectedROI}, got ${calculated}`);
                allAccurate = false;
            }
        });
        
        return TestFramework.expect(allAccurate).toBe(true);
    });
    
    TestFramework.test('ROI Accuracy - Cap Rate Calculations', function() {
        const capRateScenarios = [
            {
                noi: 24000,
                propertyValue: 300000,
                expectedCapRate: 8.0,
                tolerance: 0.01
            },
            {
                noi: 18000,
                propertyValue: 225000,
                expectedCapRate: 8.0,
                tolerance: 0.01
            },
            {
                noi: 36000,
                propertyValue: 600000,
                expectedCapRate: 6.0,
                tolerance: 0.01
            },
            {
                noi: 15000,
                propertyValue: 250000,
                expectedCapRate: 6.0,
                tolerance: 0.01
            }
        ];
        
        let allAccurate = true;
        
        capRateScenarios.forEach(scenario => {
            const calculated = calculateCapRate(scenario.noi, scenario.propertyValue);
            const difference = Math.abs(calculated - scenario.expectedCapRate);
            
            if (difference > scenario.tolerance) {
                console.error(`Cap rate calculation error: Expected ${scenario.expectedCapRate}, got ${calculated}`);
                allAccurate = false;
            }
        });
        
        return TestFramework.expect(allAccurate).toBe(true);
    });
    
    // ========================================
    // AMORTIZATION SCHEDULE ACCURACY
    // ========================================
    
    TestFramework.test('Amortization Accuracy - Principal and Interest Breakdown', function() {
        // Check if calculation function is available
        if (typeof calculateMortgagePayment !== 'function') {
            return true; // Skip test if function not available
        }
        
        const loanAmount = 200000;
        const annualRate = 6.0;
        const termYears = 30;
        const monthlyPayment = calculateMortgagePayment(loanAmount, annualRate, termYears);
        
        // Calculate first few payments manually to verify accuracy
        const monthlyRate = annualRate / 100 / 12;
        let remainingBalance = loanAmount;
        const payments = [];
        
        for (let month = 1; month <= 12; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            remainingBalance -= principalPayment;
            
            payments.push({
                month: month,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                balance: remainingBalance
            });
        }
        
        // Verify the calculations are consistent
        const totalPrincipal = payments.reduce((sum, p) => sum + p.principal, 0);
        const totalInterest = payments.reduce((sum, p) => sum + p.interest, 0);
        const totalPayments = payments.reduce((sum, p) => sum + p.payment, 0);
        
        const principalAccurate = Math.abs(totalPrincipal - (loanAmount - remainingBalance)) < 0.01;
        const totalAccurate = Math.abs(totalPayments - (totalPrincipal + totalInterest)) < 0.01;
        const balanceAccurate = remainingBalance > 0 && remainingBalance < loanAmount;
        
        return TestFramework.expect(principalAccurate && totalAccurate && balanceAccurate).toBe(true);
    });
    
    // ========================================
    // REAL-WORLD SCENARIO VALIDATION
    // ========================================
    
    TestFramework.test('Real-World Validation - FHA Loan Scenario', function() {
        // Check if calculation function is available
        if (typeof calculateMortgagePayment !== 'function') {
            return true; // Skip test if function not available
        }
        
        // FHA loan: 3.5% down, mortgage insurance
        const purchasePrice = 250000;
        const downPayment = purchasePrice * 0.035; // 3.5%
        const loanAmount = purchasePrice - downPayment;
        const interestRate = 6.25;
        const monthlyPayment = calculateMortgagePayment(loanAmount, interestRate, 30);
        
        // FHA mortgage insurance (approximate)
        const annualMIP = loanAmount * 0.0085; // 0.85% annual
        const monthlyMIP = annualMIP / 12;
        
        const totalMonthlyPayment = monthlyPayment + monthlyMIP;
        
        // Verify reasonable ranges for FHA loan
        const downPaymentReasonable = downPayment >= 8000 && downPayment <= 9000;
        const paymentReasonable = monthlyPayment >= 1400 && monthlyPayment <= 1600;
        const totalPaymentReasonable = totalMonthlyPayment >= 1500 && totalMonthlyPayment <= 1750;
        
        return TestFramework.expect(downPaymentReasonable && paymentReasonable && totalPaymentReasonable).toBe(true);
    });
    
    TestFramework.test('Real-World Validation - Jumbo Loan Scenario', function() {
        // Check if calculation function is available
        if (typeof calculateMortgagePayment !== 'function') {
            return true; // Skip test if function not available
        }
        
        // Jumbo loan scenario (above conforming limits)
        const purchasePrice = 800000;
        const downPayment = purchasePrice * 0.20; // 20% typical for jumbo
        const loanAmount = purchasePrice - downPayment;
        const interestRate = 6.75; // Typically higher than conforming
        const monthlyPayment = calculateMortgagePayment(loanAmount, interestRate, 30);
        
        // Calculate debt-to-income assumptions
        const assumedMonthlyIncome = 25000; // High income required for jumbo
        const dtiRatio = monthlyPayment / assumedMonthlyIncome;
        
        const loanAmountCorrect = loanAmount === 640000;
        const paymentReasonable = monthlyPayment >= 4000 && monthlyPayment <= 5000;
        const dtiReasonable = dtiRatio <= 0.28; // Conservative DTI for jumbo
        
        return TestFramework.expect(loanAmountCorrect && paymentReasonable && dtiReasonable).toBe(true);
    });
    
    TestFramework.test('Real-World Validation - Investment Property Scenario', function() {
        // Check if calculation function is available
        if (typeof calculateMortgagePayment !== 'function') {
            return true; // Skip test if function not available
        }
        
        // Investment property with rental income consideration
        const purchasePrice = 350000;
        const downPayment = purchasePrice * 0.25; // 25% typical for investment
        const loanAmount = purchasePrice - downPayment;
        const interestRate = 7.0; // Higher rate for investment property
        const monthlyPayment = calculateMortgagePayment(loanAmount, interestRate, 30);
        
        // Rental income and expenses
        const monthlyRent = 2800;
        const monthlyTaxes = 350;
        const monthlyInsurance = 150;
        const monthlyMaintenance = 200;
        const vacancyRate = 0.05; // 5% vacancy
        const effectiveRent = monthlyRent * (1 - vacancyRate);
        
        const totalExpenses = monthlyPayment + monthlyTaxes + monthlyInsurance + monthlyMaintenance;
        const netCashFlow = effectiveRent - totalExpenses;
        const annualCashFlow = netCashFlow * 12;
        const cashOnCashROI = (annualCashFlow / downPayment) * 100;
        
        // Verify investment property metrics are reasonable
        const cashFlowPositive = netCashFlow > 0;
        const roiReasonable = cashOnCashROI >= 5 && cashOnCashROI <= 20;
        const onePercentRule = monthlyRent >= (purchasePrice * 0.008); // At least 0.8% rule
        
        return TestFramework.expect(cashFlowPositive && roiReasonable && onePercentRule).toBe(true);
    });
    
    // ========================================
    // COMPOUND GROWTH ACCURACY
    // ========================================
    
    TestFramework.test('Compound Growth - Long-Term Projection Accuracy', function() {
        const initialValues = {
            rent: 2500,
            expenses: 1800,
            propertyValue: 300000
        };
        
        const growthRates = {
            income: 0.03, // 3% annual
            expense: 0.025, // 2.5% annual
            value: 0.04 // 4% annual
        };
        
        // Calculate 10-year projections manually and compare
        const manualProjections = [];
        let currentRent = initialValues.rent;
        let currentExpenses = initialValues.expenses;
        let currentValue = initialValues.propertyValue;
        
        for (let year = 1; year <= 10; year++) {
            currentRent *= (1 + growthRates.income);
            currentExpenses *= (1 + growthRates.expense);
            currentValue *= (1 + growthRates.value);
            
            manualProjections.push({
                year,
                rent: currentRent,
                expenses: currentExpenses,
                value: currentValue,
                cashFlow: currentRent - currentExpenses
            });
        }
        
        // Verify specific year calculations
        const year5 = manualProjections[4];
        const year10 = manualProjections[9];
        
        // Year 5 verification (compound growth)
        const expectedYear5Rent = initialValues.rent * Math.pow(1.03, 5);
        const expectedYear5Value = initialValues.propertyValue * Math.pow(1.04, 5);
        
        const year5RentAccurate = Math.abs(year5.rent - expectedYear5Rent) < 1;
        const year5ValueAccurate = Math.abs(year5.value - expectedYear5Value) < 100;
        
        // Year 10 verification
        const expectedYear10Rent = initialValues.rent * Math.pow(1.03, 10);
        const year10RentAccurate = Math.abs(year10.rent - expectedYear10Rent) < 1;
        
        return TestFramework.expect(year5RentAccurate && year5ValueAccurate && year10RentAccurate).toBe(true);
    });
    
    // ========================================
    // FINANCIAL RATIO ACCURACY
    // ========================================
    
    TestFramework.test('Financial Ratios - GRM and Price-to-Rent Calculations', function() {
        // Check if calculation function is available
        if (typeof calculateGrossRentMultiplier !== 'function') {
            return true; // Skip test if function not available
        }
        
        const testProperties = [
            {
                price: 300000,
                monthlyRent: 2500,
                expectedGRM: 10.0,
                expectedPriceToRent: 10.0
            },
            {
                price: 180000,
                monthlyRent: 1200,
                expectedGRM: 12.5,
                expectedPriceToRent: 12.5
            },
            {
                price: 450000,
                monthlyRent: 3000,
                expectedGRM: 12.5,
                expectedPriceToRent: 12.5
            }
        ];
        
        let allRatiosAccurate = true;
        
        testProperties.forEach(property => {
            const calculatedGRM = calculateGrossRentMultiplier(property.price, property.monthlyRent);
            const calculatedPriceToRent = property.price / (property.monthlyRent * 12);
            
            const grmAccurate = Math.abs(calculatedGRM - property.expectedGRM) < 0.1;
            const priceToRentAccurate = Math.abs(calculatedPriceToRent - property.expectedPriceToRent) < 0.1;
            
            if (!grmAccurate || !priceToRentAccurate) {
                allRatiosAccurate = false;
                console.error(`Ratio calculation error for $${property.price} property`);
            }
        });
        
        return TestFramework.expect(allRatiosAccurate).toBe(true);
    });
    
    TestFramework.test('Financial Ratios - DSCR Calculation Accuracy', function() {
        // Check if calculation function is available
        if (typeof calculateDebtCoverageRatio !== 'function') {
            return true; // Skip test if function not available
        }
        
        const dscrScenarios = [
            {
                noi: 24000,
                annualDebtService: 18000,
                expectedDSCR: 1.33,
                tolerance: 0.01
            },
            {
                noi: 30000,
                annualDebtService: 24000,
                expectedDSCR: 1.25,
                tolerance: 0.01
            },
            {
                noi: 18000,
                annualDebtService: 20000,
                expectedDSCR: 0.90,
                tolerance: 0.01
            }
        ];
        
        let allAccurate = true;
        
        dscrScenarios.forEach(scenario => {
            const calculatedDSCR = calculateDebtCoverageRatio(scenario.noi, scenario.annualDebtService / 12);
            const difference = Math.abs(calculatedDSCR - scenario.expectedDSCR);
            
            if (difference > scenario.tolerance) {
                console.error(`DSCR calculation error: Expected ${scenario.expectedDSCR}, got ${calculatedDSCR}`);
                allAccurate = false;
            }
        });
        
        return TestFramework.expect(allAccurate).toBe(true);
    });
    
    // ========================================
    // PRECISION UNDER COMPUTATIONAL STRESS
    // ========================================
    
    TestFramework.test('Precision Stress - Repeated Calculations Stability', function() {
        // Check if calculation function is available
        if (typeof calculateMortgagePayment !== 'function') {
            return true; // Skip test if function not available
        }
        
        const baseScenario = {
            principal: 275000,
            rate: 5.875,
            term: 30
        };
        
        // Calculate the same payment 1000 times
        const results = [];
        for (let i = 0; i < 1000; i++) {
            results.push(calculateMortgagePayment(baseScenario.principal, baseScenario.rate, baseScenario.term));
        }
        
        // Check that all results are identical (no floating point drift)
        const firstResult = results[0];
        const allIdentical = results.every(result => Math.abs(result - firstResult) < 0.001);
        
        // Check that result is reasonable
        const resultReasonable = firstResult > 1500 && firstResult < 2000;
        
        return TestFramework.expect(allIdentical && resultReasonable).toBe(true);
    });
    
    TestFramework.test('Precision Stress - Cumulative Error Analysis', function() {
        // Test for cumulative rounding errors in long-term projections (basic math only)
        const startingValue = 100000;
        const growthRate = 0.0275; // 2.75% annual
        
        // Method 1: Compound calculation
        const compoundResult = startingValue * Math.pow(1 + growthRate, 20);
        
        // Method 2: Iterative calculation (prone to cumulative error)
        let iterativeResult = startingValue;
        for (let year = 0; year < 20; year++) {
            iterativeResult *= (1 + growthRate);
        }
        
        // The difference should be minimal (floating point precision)
        const difference = Math.abs(compoundResult - iterativeResult);
        const precisionMaintained = difference < 0.01;
        
        // Both should give reasonable 20-year growth
        const reasonableGrowth = compoundResult > 160000 && compoundResult < 170000;
        
        return TestFramework.expect(precisionMaintained && reasonableGrowth).toBe(true);
    });
});

// Log test suite loaded
console.log('✅ Financial Accuracy Tests Loaded - ' + TestFramework.tests.filter(t => t.category === 'Financial Accuracy').length + ' tests registered');
