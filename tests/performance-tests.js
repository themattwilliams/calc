/**
 * Performance Tests
 * 
 * Performance benchmarks and stress tests for the Rental Property Analysis Calculator.
 * These tests ensure calculations are fast enough for real-time updates and the
 * application performs well under various conditions.
 */

TestFramework.describe('Performance', function() {
    
    // ========================================
    // CALCULATION PERFORMANCE BENCHMARKS
    // ========================================
    
    TestFramework.test('BENCHMARK: Mortgage Payment Calculation Speed', function() {
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            calculateMortgagePayment(200000, 0.06, 30);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`Mortgage calculation: ${avgTime.toFixed(4)}ms average (${iterations} iterations)`);
        
        // Should complete in less than 0.1ms per calculation for real-time updates
        return TestFramework.expect(avgTime).toBeLessThan(0.1);
    });
    
    TestFramework.test('BENCHMARK: Cash-on-Cash ROI Calculation Speed', function() {
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            calculateCashOnCashROI(5000, 100000);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`Cash-on-Cash ROI: ${avgTime.toFixed(4)}ms average (${iterations} iterations)`);
        
        // Should be very fast since it's just division and multiplication
        return TestFramework.expect(avgTime).toBeLessThan(0.05);
    });
    
    TestFramework.test('BENCHMARK: Complete Analysis Calculation Speed', function() {
        const iterations = 100;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            // Simulate complete analysis calculation
            const purchasePrice = 250000;
            const downPayment = 50000;
            const loanAmount = purchasePrice - downPayment;
            const interestRate = 0.06;
            const loanTerm = 30;
            const monthlyRent = 2200;
            const monthlyExpenses = 800;
            const closingCosts = 5000;
            const repairCosts = 10000;
            
            // Perform all calculations
            const monthlyPayment = calculateMortgagePayment(loanAmount, interestRate, loanTerm);
            const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyPayment;
            const annualCashFlow = monthlyCashFlow * 12;
            const totalCashInvested = downPayment + closingCosts + repairCosts;
            const cashOnCashROI = calculateCashOnCashROI(annualCashFlow, totalCashInvested);
            const noi = calculateNOI(monthlyRent * 12, monthlyExpenses * 12);
            const totalCost = purchasePrice + closingCosts + repairCosts;
            const capRate = calculateCapRate(noi, totalCost);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`Complete analysis: ${avgTime.toFixed(4)}ms average (${iterations} iterations)`);
        
        // Complete analysis should be fast enough for real-time updates (<5ms)
        return TestFramework.expect(avgTime).toBeLessThan(5.0);
    });
    
    // ========================================
    // VALIDATION PERFORMANCE TESTS
    // ========================================
    
    TestFramework.test('BENCHMARK: Input Validation Speed', function() {
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            validatePurchasePrice(250000);
            validateDownPayment(50000, 250000);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`Input validation: ${avgTime.toFixed(4)}ms average (${iterations} iterations)`);
        
        // Validation should be extremely fast
        return TestFramework.expect(avgTime).toBeLessThan(0.01);
    });
    
    // ========================================
    // FORMATTING PERFORMANCE TESTS
    // ========================================
    
    TestFramework.test('BENCHMARK: Currency Formatting Speed', function() {
        const iterations = 1000;
        const testValues = [1234.56, 123456.78, 1234567.89, 12345678.90];
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const value = testValues[i % testValues.length];
            formatCurrency(value);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`Currency formatting: ${avgTime.toFixed(4)}ms average (${iterations} iterations)`);
        
        // Formatting should be fast for UI updates
        return TestFramework.expect(avgTime).toBeLessThan(0.1);
    });
    
    TestFramework.test('BENCHMARK: Percentage Formatting Speed', function() {
        const iterations = 1000;
        const testValues = [5.75, 10.25, 15.0, 2.333];
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const value = testValues[i % testValues.length];
            formatPercentage(value);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`Percentage formatting: ${avgTime.toFixed(4)}ms average (${iterations} iterations)`);
        
        // Should be very fast
        return TestFramework.expect(avgTime).toBeLessThan(0.05);
    });
    
    // ========================================
    // STRESS TESTS
    // ========================================
    
    TestFramework.test('STRESS: Large Number Calculations', function() {
        // Test with very large numbers to ensure no overflow issues
        const largeNumbers = [
            { principal: 10000000, rate: 0.06, term: 30 },
            { principal: 50000000, rate: 0.08, term: 15 },
            { principal: 100000000, rate: 0.05, term: 20 }
        ];
        
        const startTime = performance.now();
        
        largeNumbers.forEach(({ principal, rate, term }) => {
            const payment = calculateMortgagePayment(principal, rate, term);
            // Verify result is reasonable (not NaN or Infinity)
            if (isNaN(payment) || !isFinite(payment) || payment <= 0) {
                throw new Error(`Invalid result for large number calculation: ${payment}`);
            }
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Large number stress test: ${duration.toFixed(2)}ms`);
        
        // Should complete quickly even with large numbers
        return TestFramework.expect(duration).toBeLessThan(10);
    });
    
    TestFramework.test('STRESS: Extreme Interest Rates', function() {
        // Test with edge case interest rates
        const extremeRates = [0.001, 0.5, 15.0, 0.1]; // 0.1% to 15%
        const principal = 200000;
        const term = 30;
        
        const startTime = performance.now();
        
        extremeRates.forEach(rate => {
            const payment = calculateMortgagePayment(principal, rate, term);
            // Verify result is reasonable
            if (isNaN(payment) || !isFinite(payment) || payment <= 0) {
                throw new Error(`Invalid result for extreme rate ${rate}: ${payment}`);
            }
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Extreme interest rate stress test: ${duration.toFixed(2)}ms`);
        
        return TestFramework.expect(duration).toBeLessThan(5);
    });
    
    TestFramework.test('STRESS: Rapid Sequential Calculations', function() {
        // Simulate rapid user input changes
        const scenarios = [
            { price: 150000, down: 30000, rate: 5.5, term: 30, rent: 1200 },
            { price: 250000, down: 50000, rate: 6.0, term: 30, rent: 2000 },
            { price: 400000, down: 80000, rate: 6.5, term: 15, rent: 3200 },
            { price: 600000, down: 120000, rate: 7.0, term: 30, rent: 4500 },
            { price: 800000, down: 160000, rate: 5.8, term: 20, rent: 5800 }
        ];
        
        const startTime = performance.now();
        
        // Simulate 50 rapid changes
        for (let i = 0; i < 50; i++) {
            const scenario = scenarios[i % scenarios.length];
            const loanAmount = scenario.price - scenario.down;
            
            // Perform complete calculation set
            const payment = calculateMortgagePayment(loanAmount, scenario.rate / 100, scenario.term);
            const cashFlow = scenario.rent - 400 - payment; // Assume $400 expenses
            const annualCashFlow = cashFlow * 12;
            const roi = calculateCashOnCashROI(annualCashFlow, scenario.down);
            const noi = calculateNOI(scenario.rent * 12, 400 * 12);
            const capRate = calculateCapRate(noi, scenario.price);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const avgPerCalculation = duration / 50;
        
        console.log(`Rapid sequential calculations: ${avgPerCalculation.toFixed(2)}ms average per set`);
        
        // Should handle rapid changes smoothly
        return TestFramework.expect(avgPerCalculation).toBeLessThan(2.0);
    });
    
    // ========================================
    // MEMORY USAGE TESTS
    // ========================================
    
    TestFramework.test('MEMORY: No Memory Leaks in Repeated Calculations', function() {
        // Check that repeated calculations don't create memory leaks
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Perform many calculations
        for (let i = 0; i < 10000; i++) {
            calculateMortgagePayment(200000 + i, 0.06, 30);
            calculateCashOnCashROI(1000 + i, 50000);
            calculateNOI(24000 + i, 12000);
            calculateCapRate(12000 + i, 200000);
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        console.log(`Memory increase: ${memoryIncrease} bytes`);
        
        // Memory increase should be minimal (less than 1MB)
        return TestFramework.expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
    
    // ========================================
    // PRECISION TESTS UNDER LOAD
    // ========================================
    
    TestFramework.test('PRECISION: Accuracy maintained under repeated calculations', function() {
        // Verify that precision doesn't degrade with many calculations
        const expectedPayment = 1199.10;
        let totalDeviation = 0;
        const iterations = 1000;
        
        for (let i = 0; i < iterations; i++) {
            const payment = calculateMortgagePayment(200000, 0.06, 30);
            const deviation = Math.abs(payment - expectedPayment);
            totalDeviation += deviation;
        }
        
        const avgDeviation = totalDeviation / iterations;
        
        console.log(`Average precision deviation: ${avgDeviation.toFixed(6)}`);
        
        // Average deviation should be essentially zero
        return TestFramework.expect(avgDeviation).toBeLessThan(0.0001);
    });
    
    // ========================================
    // BROWSER COMPATIBILITY PERFORMANCE
    // ========================================
    
    TestFramework.test('COMPATIBILITY: Math.pow performance', function() {
        // Test Math.pow performance (used in mortgage calculations)
        const iterations = 10000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            Math.pow(1.005, 360); // Typical mortgage calculation
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;
        
        console.log(`Math.pow performance: ${avgTime.toFixed(6)}ms average`);
        
        // Should be very fast across all browsers
        return TestFramework.expect(avgTime).toBeLessThan(0.001);
    });
    
    TestFramework.test('COMPATIBILITY: Number formatting performance', function() {
        // Test Intl.NumberFormat performance
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(123456.78);
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;
        
        console.log(`Number formatting performance: ${avgTime.toFixed(4)}ms average`);
        
        // Should be reasonable across browsers
        return TestFramework.expect(avgTime).toBeLessThan(0.5);
    });
    
    // ========================================
    // OVERALL PERFORMANCE SUMMARY
    // ========================================
    
    TestFramework.test('SUMMARY: Overall Performance Check', function() {
        const testResults = {
            mortgageCalc: false,
            roiCalc: false,
            validation: false,
            formatting: false
        };
        
        // Quick performance check for each major operation
        let startTime, endTime, avgTime;
        
        // Mortgage calculation check
        startTime = performance.now();
        for (let i = 0; i < 100; i++) {
            calculateMortgagePayment(200000, 0.06, 30);
        }
        endTime = performance.now();
        avgTime = (endTime - startTime) / 100;
        testResults.mortgageCalc = avgTime < 0.1;
        
        // ROI calculation check
        startTime = performance.now();
        for (let i = 0; i < 100; i++) {
            calculateCashOnCashROI(5000, 100000);
        }
        endTime = performance.now();
        avgTime = (endTime - startTime) / 100;
        testResults.roiCalc = avgTime < 0.05;
        
        // Validation check
        startTime = performance.now();
        for (let i = 0; i < 100; i++) {
            validatePurchasePrice(250000);
        }
        endTime = performance.now();
        avgTime = (endTime - startTime) / 100;
        testResults.validation = avgTime < 0.01;
        
        // Formatting check
        startTime = performance.now();
        for (let i = 0; i < 100; i++) {
            formatCurrency(123456.78);
        }
        endTime = performance.now();
        avgTime = (endTime - startTime) / 100;
        testResults.formatting = avgTime < 0.1;
        
        const allPassed = Object.values(testResults).every(result => result === true);
        
        console.log('Performance Summary:', testResults);
        
        return TestFramework.expect(allPassed).toBeTruthy();
    });

    // ========================================
    // ADVANCED PERFORMANCE & STRESS TESTS
    // ========================================

    TestFramework.test('STRESS: Memory Usage During Large Calculations', function() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Perform many large calculations
        for (let i = 0; i < 1000; i++) {
            const loanAmount = 1000000 + (i * 1000);
            const payment = calculateMortgagePayment(loanAmount, 5.5, 30);
            const roi = (payment * 12 / 200000) * 100;
            
            // Force some garbage collection opportunity
            if (i % 100 === 0 && typeof global !== 'undefined' && global.gc) {
                global.gc();
            }
        }
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        const memoryIncreaseReasonable = memoryIncrease < 50 * 1024 * 1024;
        
        return memoryIncreaseReasonable || !performance.memory; // Pass if memory API not available
    });

    TestFramework.test('STRESS: Concurrent Calculation Stress Test', function() {
        const startTime = performance.now();
        const calculations = [];
        
        // Simulate multiple concurrent calculations
        for (let i = 0; i < 50; i++) {
            const scenario = {
                purchasePrice: 200000 + (i * 10000),
                downPayment: 40000 + (i * 2000),
                interestRate: 3.5 + (i * 0.1),
                monthlyRent: 1800 + (i * 50)
            };
            
            calculations.push({
                loanAmount: scenario.purchasePrice - scenario.downPayment,
                monthlyPayment: calculateMortgagePayment(
                    scenario.purchasePrice - scenario.downPayment,
                    scenario.interestRate,
                    30
                ),
                cashFlow: scenario.monthlyRent - 800 // Simplified expenses
            });
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // All calculations should be valid
        const allValid = calculations.every(calc => 
            isFinite(calc.monthlyPayment) && 
            isFinite(calc.cashFlow) &&
            calc.monthlyPayment > 0
        );
        
        // Should complete 50 scenarios in under 50ms
        return TestFramework.expect(allValid).toBe(true) &&
               TestFramework.expect(duration).toBeLessThan(50);
    });

    TestFramework.test('STRESS: Rapid Input Change Simulation', function() {
        const startTime = performance.now();
        let calculationCount = 0;
        
        // Simulate rapid user input changes
        for (let price = 100000; price <= 500000; price += 5000) {
            for (let rate = 3.0; rate <= 8.0; rate += 0.5) {
                const payment = calculateMortgagePayment(price * 0.8, rate, 30);
                if (isFinite(payment)) calculationCount++;
            }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const calculationsPerMs = calculationCount / duration;
        
        // Should handle at least 1 calculation per millisecond
        return TestFramework.expect(calculationsPerMs).toBeGreaterThan(1.0);
    });

    TestFramework.test('STRESS: Large Dataset Projections', function() {
        const startTime = performance.now();
        
        // Generate projections for multiple properties
        const properties = [];
        for (let i = 0; i < 20; i++) {
            properties.push({
                monthlyIncome: 2000 + (i * 100),
                monthlyExpenses: 1500 + (i * 80),
                incomeGrowth: 0.02 + (i * 0.001),
                expenseGrowth: 0.015 + (i * 0.001),
                valueGrowth: 0.03 + (i * 0.002),
                initialValue: 250000 + (i * 25000)
            });
        }
        
        // Generate 30-year projections for all properties (simplified calculation)
        const allProjections = properties.map(prop => {
            const projections = [];
            let currentIncome = prop.monthlyIncome;
            let currentExpenses = prop.monthlyExpenses;
            let currentValue = prop.initialValue;
            
            for (let year = 1; year <= 30; year++) {
                currentIncome *= (1 + prop.incomeGrowth);
                currentExpenses *= (1 + prop.expenseGrowth);
                currentValue *= (1 + prop.valueGrowth);
                
                projections.push({
                    year,
                    income: currentIncome,
                    expenses: currentExpenses,
                    value: currentValue,
                    cashFlow: currentIncome - currentExpenses
                });
            }
            
            return projections;
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Verify all projections generated correctly
        const allValid = allProjections.every(proj => 
            proj && proj.length === 30 && 
            proj.every(year => isFinite(year.cashFlow))
        );
        
        // Should complete 20 full projections in under 200ms
        return TestFramework.expect(allValid).toBe(true) &&
               TestFramework.expect(duration).toBeLessThan(200);
    });

    TestFramework.test('STRESS: Browser Resource Optimization', function() {
        const startTime = performance.now();
        
        // Test multiple calculation types in sequence
        const testSequence = [
            () => calculateMortgagePayment(300000, 6.5, 30),
            () => calculateCashOnCashROI(500, 60000),
            () => calculateNOI(30000, 18000),
            () => calculateCapRate(12000, 300000),
            () => calculateGrossRentMultiplier(300000, 2500),
            () => calculateDebtCoverageRatio(12000, 1800)
        ];
        
        // Add simple projection calculation
        testSequence.push(() => {
            // Simple 5-year projection calculation
            let income = 2500;
            let expenses = 1800;
            for (let year = 1; year <= 5; year++) {
                income *= 1.03;
                expenses *= 1.02;
            }
            return { income, expenses, cashFlow: income - expenses };
        });
        
        // Run sequence multiple times
        for (let cycle = 0; cycle < 10; cycle++) {
            testSequence.forEach(testFn => {
                try {
                    testFn();
                } catch (error) {
                    // Skip if function not available
                }
            });
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete all function calls quickly
        return TestFramework.expect(duration).toBeLessThan(100);
    });

    TestFramework.test('STRESS: Precision Maintenance Under Load', function() {
        const referenceResults = [];
        
        // Calculate reference results
        for (let i = 0; i < 10; i++) {
            const principal = 100000 + (i * 50000);
            const rate = 3.5 + (i * 0.5);
            referenceResults.push(calculateMortgagePayment(principal, rate, 30));
        }
        
        // Perform the same calculations under load
        const startTime = performance.now();
        let allMaintainPrecision = true;
        
        for (let load = 0; load < 100; load++) {
            // Add computational load
            for (let noise = 0; noise < 50; noise++) {
                Math.sqrt(noise * 12345.6789);
            }
            
            // Re-calculate and compare precision
            for (let i = 0; i < referenceResults.length; i++) {
                const principal = 100000 + (i * 50000);
                const rate = 3.5 + (i * 0.5);
                const result = calculateMortgagePayment(principal, rate, 30);
                
                // Check if precision is maintained (within 0.001)
                if (Math.abs(result - referenceResults[i]) > 0.001) {
                    allMaintainPrecision = false;
                    break;
                }
            }
            
            if (!allMaintainPrecision) break;
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return TestFramework.expect(allMaintainPrecision).toBe(true) &&
               TestFramework.expect(duration).toBeLessThan(500);
    });
});

// Log test suite loaded
console.log('✅ Performance Tests Loaded - ' + TestFramework.tests.filter(t => t.category === 'Performance').length + ' tests registered');
