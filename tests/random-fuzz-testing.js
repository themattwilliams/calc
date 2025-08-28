/**
 * Random/Fuzz Testing Suite
 * 
 * Generates random test inputs across realistic and edge case ranges
 * to discover potential calculation errors, validation issues, or
 * unexpected behavior that manual test cases might miss.
 */

TestFramework.suite('Random Fuzz Testing', function() {
    
    // ========================================
    // RANDOM VALUE GENERATORS
    // ========================================
    
    /**
     * Generate random integer between min and max (inclusive)
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Generate random float between min and max with specified decimals
     */
    function randomFloat(min, max, decimals = 2) {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }
    
    /**
     * Generate random property price based on market segments
     */
    function randomPropertyPrice() {
        const segments = [
            { min: 50000, max: 150000, weight: 15 },   // Budget properties
            { min: 150000, max: 300000, weight: 35 },  // Starter homes
            { min: 300000, max: 500000, weight: 25 },  // Mid-range
            { min: 500000, max: 800000, weight: 15 },  // Upper-mid
            { min: 800000, max: 1500000, weight: 8 },  // Luxury
            { min: 1500000, max: 5000000, weight: 2 }  // Ultra-luxury
        ];
        
        const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const segment of segments) {
            if (random <= segment.weight) {
                return randomInt(segment.min, segment.max);
            }
            random -= segment.weight;
        }
        
        return randomInt(200000, 400000); // Fallback
    }
    
    /**
     * Generate random test scenario with realistic parameters
     */
    function generateRandomScenario() {
        const purchasePrice = randomPropertyPrice();
        
        return {
            // Property basics
            purchasePrice: purchasePrice,
            purchaseClosingCosts: randomFloat(purchasePrice * 0.01, purchasePrice * 0.05),
            estimatedRepairCosts: randomInt(0, Math.min(100000, purchasePrice * 0.3)),
            
            // Financing
            downPayment: randomFloat(purchasePrice * 0.05, purchasePrice * 0.5),
            loanInterestRate: randomFloat(3.0, 10.0, 3),
            amortizedOver: [15, 20, 25, 30][randomInt(0, 3)],
            loanFees: randomFloat(0, purchasePrice * 0.02),
            
            // Income
            monthlyRent: randomFloat(purchasePrice * 0.004, purchasePrice * 0.015),
            
            // Expenses
            monthlyPropertyTaxes: randomFloat(purchasePrice * 0.0005, purchasePrice * 0.003),
            monthlyInsurance: randomFloat(50, Math.max(50, purchasePrice * 0.001)),
            quarterlyHoaFees: randomFloat(0, 2000),
            monthlyManagement: randomFloat(0, 500),
            otherMonthlyExpenses: randomFloat(0, 300),
            
            // Growth rates
            annualIncomeGrowth: randomFloat(0, 8.0, 1),
            annualExpenseGrowth: randomFloat(0, 6.0, 1),
            annualPropertyValueGrowth: randomFloat(0, 10.0, 1)
        };
    }
    
    /**
     * Generate random temporary financing scenario
     */
    function generateRandomTempFinancingScenario() {
        const purchasePrice = randomPropertyPrice();
        const renovationCosts = randomInt(10000, purchasePrice * 0.4);
        const afterRepairValue = randomFloat(purchasePrice + renovationCosts, (purchasePrice + renovationCosts) * 1.5);
        
        return {
            initialCashInvestment: randomFloat(0, purchasePrice),
            renovationCosts: renovationCosts,
            tempFinancingAmount: randomFloat(0, purchasePrice * 0.8),
            tempInterestRate: randomFloat(0, 20, 2),
            originationPoints: randomFloat(0, 5, 2),
            tempLoanTermMonths: randomInt(1, 24),
            afterRepairValue: afterRepairValue,
            cashOutLTV: randomInt(60, 85),
            purchasePrice: purchasePrice
        };
    }
    
    /**
     * Generate edge case scenario with extreme values
     */
    function generateEdgeCaseScenario() {
        const scenarioType = randomInt(1, 8);
        
        switch (scenarioType) {
            case 1: // Minimum values
                return {
                    purchasePrice: 1000,
                    downPayment: 100,
                    monthlyRent: 10,
                    loanInterestRate: 0.01,
                    monthlyPropertyTaxes: 1,
                    monthlyInsurance: 1
                };
                
            case 2: // Maximum realistic values
                return {
                    purchasePrice: 10000000,
                    downPayment: 2000000,
                    monthlyRent: 50000,
                    loanInterestRate: 15.0,
                    monthlyPropertyTaxes: 8333,
                    monthlyInsurance: 2000
                };
                
            case 3: // Zero values (edge case)
                return {
                    purchasePrice: 100000,
                    downPayment: 0,
                    monthlyRent: 1000,
                    loanInterestRate: 0,
                    monthlyPropertyTaxes: 0,
                    monthlyInsurance: 0,
                    quarterlyHoaFees: 0,
                    monthlyManagement: 0,
                    otherMonthlyExpenses: 0
                };
                
            case 4: // High expense scenario (negative cash flow)
                return {
                    purchasePrice: 300000,
                    downPayment: 60000,
                    monthlyRent: 800, // Very low rent
                    loanInterestRate: 8.0,
                    monthlyPropertyTaxes: 800,
                    monthlyInsurance: 400,
                    quarterlyHoaFees: 600,
                    monthlyManagement: 200,
                    otherMonthlyExpenses: 300
                };
                
            case 5: // Decimal precision edge case
                return {
                    purchasePrice: 333333.33,
                    downPayment: 66666.666,
                    monthlyRent: 2777.777,
                    loanInterestRate: 6.666,
                    monthlyPropertyTaxes: 555.555,
                    monthlyInsurance: 166.666
                };
                
            case 6: // Very short loan term
                return {
                    purchasePrice: 200000,
                    downPayment: 40000,
                    loanInterestRate: 5.0,
                    amortizedOver: 1, // 1 year loan
                    monthlyRent: 2000
                };
                
            case 7: // 100% financing scenario
                return {
                    purchasePrice: 250000,
                    downPayment: 0,
                    loanInterestRate: 7.0,
                    monthlyRent: 2200,
                    loanFees: 5000 // High loan fees to compensate
                };
                
            case 8: // All cash scenario
                return {
                    purchasePrice: 400000,
                    downPayment: 400000, // All cash
                    loanInterestRate: 0,
                    monthlyRent: 3500,
                    amortizedOver: 30 // Irrelevant but set
                };
                
            default:
                return generateRandomScenario();
        }
    }
    
    // ========================================
    // RANDOM CALCULATION TESTS
    // ========================================
    
    TestFramework.test('Random Scenario Generation - 50 Random Property Scenarios', function() {
        let allPassed = true;
        const failures = [];
        
        for (let i = 0; i < 50; i++) {
            try {
                const scenario = generateRandomScenario();
                
                // Validate scenario makes basic sense
                const validationChecks = [
                    scenario.purchasePrice > 0,
                    scenario.downPayment >= 0,
                    scenario.downPayment <= scenario.purchasePrice,
                    scenario.monthlyRent > 0,
                    scenario.loanInterestRate >= 0,
                    scenario.loanInterestRate <= 20,
                    scenario.monthlyPropertyTaxes >= 0,
                    scenario.monthlyInsurance >= 0
                ];
                
                if (!validationChecks.every(check => check)) {
                    failures.push(`Scenario ${i}: Invalid generated values`);
                    allPassed = false;
                    continue;
                }
                
                // Test calculations don't throw errors
                const loanAmount = scenario.purchasePrice - scenario.downPayment;
                if (loanAmount > 0) {
                    const monthlyPayment = calculateMortgagePayment(
                        loanAmount, 
                        scenario.loanInterestRate, 
                        scenario.amortizedOver
                    );
                    
                    if (isNaN(monthlyPayment) || monthlyPayment < 0) {
                        failures.push(`Scenario ${i}: Invalid mortgage payment calculation`);
                        allPassed = false;
                    }
                }
                
                // Test cash flow calculation
                const totalExpenses = scenario.monthlyPropertyTaxes + 
                                    scenario.monthlyInsurance + 
                                    (scenario.quarterlyHoaFees / 3) + 
                                    scenario.monthlyManagement + 
                                    scenario.otherMonthlyExpenses;
                
                if (isNaN(totalExpenses) || totalExpenses < 0) {
                    failures.push(`Scenario ${i}: Invalid expense calculation`);
                    allPassed = false;
                }
                
            } catch (error) {
                failures.push(`Scenario ${i}: ${error.message}`);
                allPassed = false;
            }
        }
        
        if (!allPassed) {
            console.log('Random scenario failures:', failures.slice(0, 5)); // Log first 5 failures
        }
        
        return allPassed;
    });
    
    TestFramework.test('Edge Case Scenarios - 20 Extreme Value Tests', function() {
        let allPassed = true;
        const failures = [];
        
        for (let i = 0; i < 20; i++) {
            try {
                const scenario = generateEdgeCaseScenario();
                
                // Test that calculations handle edge cases gracefully
                const loanAmount = Math.max(0, scenario.purchasePrice - scenario.downPayment);
                
                if (loanAmount > 0 && scenario.loanInterestRate > 0) {
                    const monthlyPayment = calculateMortgagePayment(
                        loanAmount,
                        scenario.loanInterestRate,
                        scenario.amortizedOver || 30
                    );
                    
                    // Should not be NaN, Infinity, or negative
                    if (!isFinite(monthlyPayment) || monthlyPayment < 0) {
                        failures.push(`Edge case ${i}: Invalid payment: ${monthlyPayment}`);
                        allPassed = false;
                    }
                }
                
                // Test cash flow calculations
                const monthlyExpenses = (scenario.monthlyPropertyTaxes || 0) +
                                      (scenario.monthlyInsurance || 0) +
                                      (scenario.quarterlyHoaFees || 0) / 3 +
                                      (scenario.monthlyManagement || 0) +
                                      (scenario.otherMonthlyExpenses || 0);
                
                const cashFlow = scenario.monthlyRent - monthlyExpenses;
                
                if (!isFinite(cashFlow)) {
                    failures.push(`Edge case ${i}: Invalid cash flow: ${cashFlow}`);
                    allPassed = false;
                }
                
            } catch (error) {
                failures.push(`Edge case ${i}: ${error.message}`);
                allPassed = false;
            }
        }
        
        if (!allPassed) {
            console.log('Edge case failures:', failures.slice(0, 5));
        }
        
        return allPassed;
    });
    
    TestFramework.test('Random Temporary Financing Scenarios - 30 BRRRR Tests', function() {
        let allPassed = true;
        const failures = [];
        
        for (let i = 0; i < 30; i++) {
            try {
                const scenario = generateRandomTempFinancingScenario();
                
                // Test temporary financing calculations
                const tempCosts = calculateTemporaryFinancingCosts(
                    scenario.tempFinancingAmount,
                    scenario.tempInterestRate,
                    scenario.tempLoanTermMonths,
                    scenario.originationPoints
                );
                
                // Validate temp costs
                if (!isFinite(tempCosts.totalCost) || tempCosts.totalCost < 0) {
                    failures.push(`BRRRR ${i}: Invalid temp costs: ${tempCosts.totalCost}`);
                    allPassed = false;
                    continue;
                }
                
                // Test refinance calculations
                const refinanceResults = calculateCashOutRefinance(
                    scenario.afterRepairValue,
                    scenario.cashOutLTV,
                    scenario.tempFinancingAmount
                );
                
                if (!isFinite(refinanceResults.newLoanAmount) || refinanceResults.newLoanAmount < 0) {
                    failures.push(`BRRRR ${i}: Invalid refinance amount: ${refinanceResults.newLoanAmount}`);
                    allPassed = false;
                    continue;
                }
                
                // Test total investment calculation
                const totalInvestment = calculateTotalInitialInvestment(
                    scenario.initialCashInvestment,
                    scenario.renovationCosts,
                    tempCosts.totalCost
                );
                
                if (!isFinite(totalInvestment) || totalInvestment < 0) {
                    failures.push(`BRRRR ${i}: Invalid total investment: ${totalInvestment}`);
                    allPassed = false;
                    continue;
                }
                
                // Test final cash calculation
                const finalCash = calculateFinalCashLeftInDeal(
                    totalInvestment,
                    refinanceResults.cashReturned
                );
                
                if (!isFinite(finalCash) || finalCash < 0) {
                    failures.push(`BRRRR ${i}: Invalid final cash: ${finalCash}`);
                    allPassed = false;
                }
                
            } catch (error) {
                failures.push(`BRRRR ${i}: ${error.message}`);
                allPassed = false;
            }
        }
        
        if (!allPassed) {
            console.log('BRRRR scenario failures:', failures.slice(0, 5));
        }
        
        return allPassed;
    });
    
    TestFramework.test('Stress Test - Calculation Performance with Random Values', function() {
        const startTime = performance.now();
        let calculationCount = 0;
        
        // Run calculations for 100ms to test performance
        while (performance.now() - startTime < 100) {
            const scenario = generateRandomScenario();
            
            // Perform multiple calculations
            const loanAmount = scenario.purchasePrice - scenario.downPayment;
            if (loanAmount > 0) {
                calculateMortgagePayment(loanAmount, scenario.loanInterestRate, scenario.amortizedOver);
            }
            
            // Simulate projection calculations
            for (let year = 1; year <= 30; year++) {
                const projectedIncome = scenario.monthlyRent * 12 * 
                    Math.pow(1 + scenario.annualIncomeGrowth / 100, year);
                const projectedExpenses = (scenario.monthlyPropertyTaxes * 12) * 
                    Math.pow(1 + scenario.annualExpenseGrowth / 100, year);
            }
            
            calculationCount++;
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const calculationsPerSecond = (calculationCount / duration) * 1000;
        
        // Should be able to perform at least 100 calculations per second
        const performanceOk = calculationsPerSecond >= 100;
        
        if (!performanceOk) {
            console.log(`Performance issue: ${calculationsPerSecond} calc/sec`);
        }
        
        return performanceOk;
    });
    
    TestFramework.test('Boundary Value Discovery - Mathematical Edge Cases', function() {
        let allPassed = true;
        const failures = [];
        
        // Test specific mathematical boundaries
        const boundaryTests = [
            // Interest rate boundaries
            { loanAmount: 100000, rate: 0.001, years: 30, desc: 'Very low interest' },
            { loanAmount: 100000, rate: 99.999, years: 30, desc: 'Very high interest' },
            
            // Loan amount boundaries
            { loanAmount: 1, rate: 5.0, years: 30, desc: 'Minimum loan' },
            { loanAmount: 100000000, rate: 5.0, years: 30, desc: 'Maximum loan' },
            
            // Term boundaries
            { loanAmount: 100000, rate: 5.0, years: 1, desc: 'Minimum term' },
            { loanAmount: 100000, rate: 5.0, years: 50, desc: 'Maximum term' },
            
            // Compound interest edge cases
            { loanAmount: 100000, rate: 0, years: 30, desc: 'Zero interest' },
            { loanAmount: 0, rate: 5.0, years: 30, desc: 'Zero principal' }
        ];
        
        boundaryTests.forEach((test, i) => {
            try {
                const payment = calculateMortgagePayment(test.loanAmount, test.rate, test.years);
                
                // Check for mathematical validity
                if (test.loanAmount === 0) {
                    if (payment !== 0) {
                        failures.push(`${test.desc}: Expected 0 payment for 0 loan`);
                        allPassed = false;
                    }
                } else if (test.rate === 0) {
                    const expectedPayment = test.loanAmount / (test.years * 12);
                    if (Math.abs(payment - expectedPayment) > 0.01) {
                        failures.push(`${test.desc}: Zero interest calculation incorrect`);
                        allPassed = false;
                    }
                } else if (!isFinite(payment) || payment < 0) {
                    failures.push(`${test.desc}: Invalid payment result: ${payment}`);
                    allPassed = false;
                }
                
            } catch (error) {
                failures.push(`${test.desc}: ${error.message}`);
                allPassed = false;
            }
        });
        
        if (!allPassed) {
            console.log('Boundary test failures:', failures);
        }
        
        return allPassed;
    });
    
    TestFramework.test('Random Input Validation - Stress Test Input Validation', function() {
        let allPassed = true;
        const failures = [];
        
        // Generate 100 random scenarios and test validation
        for (let i = 0; i < 100; i++) {
            const scenario = generateRandomScenario();
            
            try {
                // Test validation functions don't crash
                validatePurchasePrice(scenario.purchasePrice);
                validateDownPayment(scenario.downPayment, scenario.purchasePrice);
                validateInterestRate(scenario.loanInterestRate);
                validateMonthlyRent(scenario.monthlyRent);
                validateGrowthRate(scenario.annualIncomeGrowth);
                validateGrowthRate(scenario.annualExpenseGrowth);
                validateGrowthRate(scenario.annualPropertyValueGrowth);
                
            } catch (error) {
                failures.push(`Validation ${i}: ${error.message}`);
                allPassed = false;
            }
        }
        
        if (!allPassed) {
            console.log('Validation failures:', failures.slice(0, 3));
        }
        
        return allPassed;
    });
    
    TestFramework.test('Chaos Test - Random Operations Sequence', function() {
        let allPassed = true;
        const failures = [];
        
        // Perform random sequences of operations
        for (let i = 0; i < 20; i++) {
            try {
                const scenario = generateRandomScenario();
                const tempScenario = generateRandomTempFinancingScenario();
                
                // Random sequence of calculations
                const operations = [
                    () => calculateMortgagePayment(scenario.purchasePrice - scenario.downPayment, scenario.loanInterestRate, scenario.amortizedOver),
                    () => calculateTemporaryFinancingCosts(tempScenario.tempFinancingAmount, tempScenario.tempInterestRate, tempScenario.tempLoanTermMonths, tempScenario.originationPoints),
                    () => calculateCashOutRefinance(tempScenario.afterRepairValue, tempScenario.cashOutLTV, tempScenario.tempFinancingAmount),
                    () => calculateProjections(scenario.monthlyRent * 12, scenario.annualIncomeGrowth, 30),
                    () => formatCurrency(scenario.purchasePrice),
                    () => formatPercentage(scenario.loanInterestRate),
                    () => parseNumericInput(scenario.monthlyRent.toString())
                ];
                
                // Execute random operations
                const numOperations = randomInt(3, 7);
                for (let j = 0; j < numOperations; j++) {
                    const operation = operations[randomInt(0, operations.length - 1)];
                    const result = operation();
                    
                    // Basic sanity check
                    if (result === null || result === undefined) {
                        throw new Error(`Operation ${j} returned null/undefined`);
                    }
                }
                
            } catch (error) {
                failures.push(`Chaos ${i}: ${error.message}`);
                allPassed = false;
            }
        }
        
        if (!allPassed) {
            console.log('Chaos test failures:', failures.slice(0, 3));
        }
        
        return allPassed;
    });
});
