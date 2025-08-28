/**
 * Comprehensive Test Suite for Temporary Financing Calculations
 * 
 * Tests all temporary financing calculation functions with various scenarios:
 * - Basic calculations (interest, points, totals)
 * - BRRRR strategy scenarios
 * - Hard money loan scenarios
 * - Cash-out refinance scenarios
 * - Edge cases and boundary conditions
 * - Integration with regular financing
 */

TestFramework.suite('Temporary Financing Calculations', function() {
    
    // ========================================
    // BASIC CALCULATION TESTS
    // ========================================
    
    TestFramework.suite('Basic Temporary Financing Costs', function() {
        
        TestFramework.test('Calculate interest cost only (no points)', function() {
            const result = calculateTemporaryFinancingCosts(100000, 12, 6, 0);
            return TestFramework.expect(result.interestCost).toBeCloseTo(6000, 2) &&
                   TestFramework.expect(result.pointsCost).toBe(0) &&
                   TestFramework.expect(result.totalCost).toBeCloseTo(6000, 2);
        });
        
        TestFramework.test('Calculate points cost only (no interest)', function() {
            const result = calculateTemporaryFinancingCosts(100000, 0, 6, 2);
            return TestFramework.expect(result.interestCost).toBe(0) &&
                   TestFramework.expect(result.pointsCost).toBeCloseTo(2000, 2) &&
                   TestFramework.expect(result.totalCost).toBeCloseTo(2000, 2);
        });
        
        TestFramework.test('Calculate combined interest and points', function() {
            const result = calculateTemporaryFinancingCosts(200000, 15, 12, 3);
            return TestFramework.expect(result.interestCost).toBeCloseTo(30000, 2) &&
                   TestFramework.expect(result.pointsCost).toBeCloseTo(6000, 2) &&
                   TestFramework.expect(result.totalCost).toBeCloseTo(36000, 2);
        });
        
        TestFramework.test('Zero amount returns zero costs', function() {
            const result = calculateTemporaryFinancingCosts(0, 12, 6, 2);
            return TestFramework.expect(result.interestCost).toBe(0) &&
                   TestFramework.expect(result.pointsCost).toBe(0) &&
                   TestFramework.expect(result.totalCost).toBe(0);
        });
        
        TestFramework.test('High interest rate calculation', function() {
            const result = calculateTemporaryFinancingCosts(150000, 18, 9, 1.5);
            const expectedInterest = 150000 * 0.18 * (9/12); // $20,250
            const expectedPoints = 150000 * 0.015; // $2,250
            return TestFramework.expect(result.interestCost).toBeCloseTo(expectedInterest, 2) &&
                   TestFramework.expect(result.pointsCost).toBeCloseTo(expectedPoints, 2) &&
                   TestFramework.expect(result.totalCost).toBeCloseTo(22500, 2);
        });
    });
    
    // ========================================
    // CASH-OUT REFINANCE TESTS
    // ========================================
    
    TestFramework.suite('Cash-Out Refinance Calculations', function() {
        
        TestFramework.test('Standard 75% LTV refinance', function() {
            const result = calculateCashOutRefinance(400000, 75, 200000);
            return TestFramework.expect(result.newLoanAmount).toBeCloseTo(300000, 2) &&
                   TestFramework.expect(result.cashReturned).toBeCloseTo(100000, 2) &&
                   TestFramework.expect(result.loanToValueUsed).toBe(75);
        });
        
        TestFramework.test('Conservative 65% LTV refinance', function() {
            const result = calculateCashOutRefinance(350000, 65, 150000);
            return TestFramework.expect(result.newLoanAmount).toBeCloseTo(227500, 2) &&
                   TestFramework.expect(result.cashReturned).toBeCloseTo(77500, 2);
        });
        
        TestFramework.test('Aggressive 80% LTV refinance', function() {
            const result = calculateCashOutRefinance(500000, 80, 300000);
            return TestFramework.expect(result.newLoanAmount).toBeCloseTo(400000, 2) &&
                   TestFramework.expect(result.cashReturned).toBeCloseTo(100000, 2);
        });
        
        TestFramework.test('Refinance amount less than temp loan balance', function() {
            const result = calculateCashOutRefinance(300000, 70, 250000);
            const expectedLoan = 300000 * 0.70; // $210,000
            return TestFramework.expect(result.newLoanAmount).toBeCloseTo(210000, 2) &&
                   TestFramework.expect(result.cashReturned).toBe(0); // Can't get cash back
        });
        
        TestFramework.test('Exact refinance amount equals temp loan', function() {
            const result = calculateCashOutRefinance(400000, 75, 300000);
            return TestFramework.expect(result.newLoanAmount).toBeCloseTo(300000, 2) &&
                   TestFramework.expect(result.cashReturned).toBe(0);
        });
    });
    
    // ========================================
    // TOTAL INVESTMENT CALCULATIONS
    // ========================================
    
    TestFramework.suite('Total Investment Calculations', function() {
        
        TestFramework.test('Calculate total initial investment', function() {
            const result = calculateTotalInitialInvestment(50000, 30000, 8000);
            return TestFramework.expect(result).toBeCloseTo(88000, 2);
        });
        
        TestFramework.test('Zero cash investment (all financed)', function() {
            const result = calculateTotalInitialInvestment(0, 25000, 12000);
            return TestFramework.expect(result).toBeCloseTo(37000, 2);
        });
        
        TestFramework.test('No financing costs (all cash)', function() {
            const result = calculateTotalInitialInvestment(100000, 40000, 0);
            return TestFramework.expect(result).toBeCloseTo(140000, 2);
        });
    });
    
    // ========================================
    // FINAL CASH LEFT IN DEAL
    // ========================================
    
    TestFramework.suite('Final Cash Left in Deal', function() {
        
        TestFramework.test('Positive cash remaining', function() {
            const result = calculateFinalCashLeftInDeal(100000, 60000);
            return TestFramework.expect(result).toBeCloseTo(40000, 2);
        });
        
        TestFramework.test('Zero cash remaining (perfect refinance)', function() {
            const result = calculateFinalCashLeftInDeal(80000, 80000);
            return TestFramework.expect(result).toBe(0);
        });
        
        TestFramework.test('Negative should return zero', function() {
            const result = calculateFinalCashLeftInDeal(70000, 90000);
            return TestFramework.expect(result).toBe(0);
        });
    });
    
    // ========================================
    // COMPREHENSIVE ANALYSIS TESTS
    // ========================================
    
    TestFramework.suite('Comprehensive Temporary Financing Analysis', function() {
        
        TestFramework.test('BRRRR Strategy - Successful scenario', function() {
            const inputs = {
                initialCashInvestment: 250000,
                renovationCosts: 50000,
                tempFinancingAmount: 0, // All cash
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 400000,
                cashOutLTV: 75
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            return TestFramework.expect(result.totalInitialInvestment).toBeCloseTo(300000, 2) &&
                   TestFramework.expect(result.refinanceResults.newLoanAmount).toBeCloseTo(300000, 2) &&
                   TestFramework.expect(result.refinanceResults.cashReturned).toBeCloseTo(300000, 2) &&
                   TestFramework.expect(result.finalCashLeftInDeal).toBe(0) &&
                   TestFramework.expect(result.isUsingTemporaryFinancing).toBe(true);
        });
        
        TestFramework.test('Hard Money + Renovation scenario', function() {
            const inputs = {
                initialCashInvestment: 100000,
                renovationCosts: 40000,
                tempFinancingAmount: 200000,
                tempInterestRate: 12,
                originationPoints: 2,
                tempLoanTermMonths: 9,
                afterRepairValue: 450000,
                cashOutLTV: 70
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            // Calculate expected temp costs: $200k * 12% * 0.75 years + $200k * 2% = $18k + $4k = $22k
            const expectedTempCosts = 200000 * 0.12 * 0.75 + 200000 * 0.02;
            const expectedTotalInvestment = 100000 + 40000 + expectedTempCosts;
            const expectedNewLoan = 450000 * 0.70;
            const expectedCashReturned = expectedNewLoan - 200000;
            const expectedFinalCash = expectedTotalInvestment - expectedCashReturned;
            
            return TestFramework.expect(result.tempFinancingCosts.totalCost).toBeCloseTo(expectedTempCosts, 2) &&
                   TestFramework.expect(result.totalInitialInvestment).toBeCloseTo(expectedTotalInvestment, 2) &&
                   TestFramework.expect(result.refinanceResults.newLoanAmount).toBeCloseTo(expectedNewLoan, 2) &&
                   TestFramework.expect(result.refinanceResults.cashReturned).toBeCloseTo(expectedCashReturned, 2) &&
                   TestFramework.expect(result.finalCashLeftInDeal).toBeCloseTo(expectedFinalCash, 2);
        });
        
        TestFramework.test('Conservative financing scenario', function() {
            const inputs = {
                initialCashInvestment: 150000,
                renovationCosts: 25000,
                tempFinancingAmount: 100000,
                tempInterestRate: 8,
                originationPoints: 1,
                tempLoanTermMonths: 12,
                afterRepairValue: 350000,
                cashOutLTV: 65
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            // Temp costs: $100k * 8% * 1 year + $100k * 1% = $8k + $1k = $9k
            const expectedTempCosts = 9000;
            const expectedTotalInvestment = 150000 + 25000 + 9000; // $184k
            const expectedNewLoan = 350000 * 0.65; // $227.5k
            const expectedCashReturned = 227500 - 100000; // $127.5k
            const expectedFinalCash = 184000 - 127500; // $56.5k
            
            return TestFramework.expect(result.tempFinancingCosts.totalCost).toBeCloseTo(expectedTempCosts, 2) &&
                   TestFramework.expect(result.finalCashLeftInDeal).toBeCloseTo(expectedFinalCash, 2);
        });
    });
    
    // ========================================
    // VALIDATION TESTS
    // ========================================
    
    TestFramework.suite('Input Validation', function() {
        
        TestFramework.test('Valid inputs pass validation', function() {
            const inputs = {
                initialCashInvestment: 100000,
                renovationCosts: 30000,
                tempFinancingAmount: 150000,
                tempInterestRate: 12,
                tempLoanTermMonths: 6,
                afterRepairValue: 350000,
                cashOutLTV: 75,
                purchasePrice: 250000
            };
            
            const result = validateTemporaryFinancingInputs(inputs);
            return TestFramework.expect(result.isValid).toBe(true) &&
                   TestFramework.expect(result.errors.length).toBe(0);
        });
        
        TestFramework.test('ARV too low generates warning', function() {
            const inputs = {
                afterRepairValue: 200000,
                purchasePrice: 180000,
                renovationCosts: 30000,
                cashOutLTV: 75
            };
            
            const result = validateTemporaryFinancingInputs(inputs);
            return TestFramework.expect(result.warnings.length).toBeGreaterThan(0) &&
                   TestFramework.expect(result.warnings[0]).toContain('ARV should typically be higher');
        });
        
        TestFramework.test('High LTV generates warning', function() {
            const inputs = {
                cashOutLTV: 85,
                afterRepairValue: 400000,
                tempFinancingAmount: 200000
            };
            
            const result = validateTemporaryFinancingInputs(inputs);
            return TestFramework.expect(result.warnings.some(w => w.includes('LTV above 80%'))).toBe(true);
        });
        
        TestFramework.test('High interest rate generates warning', function() {
            const inputs = {
                tempInterestRate: 25,
                afterRepairValue: 400000,
                tempFinancingAmount: 200000
            };
            
            const result = validateTemporaryFinancingInputs(inputs);
            return TestFramework.expect(result.warnings.some(w => w.includes('above 20%'))).toBe(true);
        });
        
        TestFramework.test('Insufficient refinance amount generates error', function() {
            const inputs = {
                afterRepairValue: 300000,
                cashOutLTV: 60, // $180k loan
                tempFinancingAmount: 200000, // Need $200k to pay off
                purchasePrice: 250000,
                renovationCosts: 25000
            };
            
            const result = validateTemporaryFinancingInputs(inputs);
            return TestFramework.expect(result.isValid).toBe(false) &&
                   TestFramework.expect(result.errors.some(e => e.includes('may not cover'))).toBe(true);
        });
    });
    
    // ========================================
    // EDGE CASES AND BOUNDARY CONDITIONS
    // ========================================
    
    TestFramework.suite('Edge Cases', function() {
        
        TestFramework.test('Minimum values', function() {
            const result = calculateTemporaryFinancingCosts(1, 0.1, 1, 0.1);
            return TestFramework.expect(result.interestCost).toBeCloseTo(0.000833, 6) &&
                   TestFramework.expect(result.pointsCost).toBeCloseTo(0.001, 6);
        });
        
        TestFramework.test('Maximum realistic values', function() {
            const result = calculateTemporaryFinancingCosts(5000000, 20, 24, 5);
            const expectedInterest = 5000000 * 0.20 * 2; // $2M
            const expectedPoints = 5000000 * 0.05; // $250k
            return TestFramework.expect(result.interestCost).toBeCloseTo(expectedInterest, 2) &&
                   TestFramework.expect(result.pointsCost).toBeCloseTo(expectedPoints, 2);
        });
        
        TestFramework.test('Very short term (1 month)', function() {
            const result = calculateTemporaryFinancingCosts(100000, 12, 1, 2);
            const expectedInterest = 100000 * 0.12 * (1/12); // $1,000
            return TestFramework.expect(result.interestCost).toBeCloseTo(expectedInterest, 2);
        });
        
        TestFramework.test('Very long term (24 months)', function() {
            const result = calculateTemporaryFinancingCosts(100000, 12, 24, 2);
            const expectedInterest = 100000 * 0.12 * 2; // $24,000
            return TestFramework.expect(result.interestCost).toBeCloseTo(expectedInterest, 2);
        });
    });
    
    // ========================================
    // INTEGRATION WITH REGULAR CALCULATIONS
    // ========================================
    
    TestFramework.suite('Integration with Regular Financing', function() {
        
        TestFramework.test('Temporary financing affects cash needed calculation', function() {
            // This test verifies that when temporary financing is used,
            // the final cash left in deal is used for ROI calculations
            // instead of the traditional down payment + closing costs
            
            const tempAnalysis = calculateTemporaryFinancingAnalysis({
                initialCashInvestment: 200000,
                renovationCosts: 40000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 400000,
                cashOutLTV: 75
            });
            
            // Should have $0 left in deal after refinance
            return TestFramework.expect(tempAnalysis.finalCashLeftInDeal).toBe(0);
        });
        
        TestFramework.test('Analysis start date calculation', function() {
            const currentDate = new Date();
            const startDate = calculateAnalysisStartDate(6, 1);
            const expectedDate = new Date(currentDate);
            expectedDate.setMonth(expectedDate.getMonth() + 7);
            
            // Check if dates are within same month (accounting for potential day differences)
            return TestFramework.expect(startDate.getMonth()).toBe(expectedDate.getMonth()) &&
                   TestFramework.expect(startDate.getFullYear()).toBe(expectedDate.getFullYear());
        });
    });
    
    // ========================================
    // REAL-WORLD SCENARIOS
    // ========================================
    
    TestFramework.suite('Real-World BRRRR Scenarios', function() {
        
        TestFramework.test('Scenario 1: Perfect BRRRR (infinite ROI)', function() {
            const inputs = {
                initialCashInvestment: 250000,
                renovationCosts: 50000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 400000,
                cashOutLTV: 75
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            // Total invested: $300k, Cash returned: $300k, Net: $0
            return TestFramework.expect(result.finalCashLeftInDeal).toBe(0);
        });
        
        TestFramework.test('Scenario 2: Typical BRRRR with some cash left', function() {
            const inputs = {
                initialCashInvestment: 180000,
                renovationCosts: 45000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 350000,
                cashOutLTV: 70
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            // Total invested: $225k, Cash returned: $245k, Net: $0 (can't get more than invested)
            // Actually: ARV $350k * 70% = $245k loan, so $245k returned
            // But total invested was $225k, so extra $20k returned
            return TestFramework.expect(result.refinanceResults.cashReturned).toBeCloseTo(245000, 2) &&
                   TestFramework.expect(result.finalCashLeftInDeal).toBe(0);
        });
        
        TestFramework.test('Scenario 3: Hard money bridge loan', function() {
            const inputs = {
                initialCashInvestment: 50000,
                renovationCosts: 30000,
                tempFinancingAmount: 180000,
                tempInterestRate: 15,
                originationPoints: 3,
                tempLoanTermMonths: 8,
                afterRepairValue: 320000,
                cashOutLTV: 75
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            // Temp costs: $180k * 15% * (8/12) + $180k * 3% = $18k + $5.4k = $23.4k
            // Total invested: $50k + $30k + $23.4k = $103.4k
            // New loan: $320k * 75% = $240k
            // Cash returned: $240k - $180k = $60k
            // Final cash: $103.4k - $60k = $43.4k
            
            const expectedTempCosts = 180000 * 0.15 * (8/12) + 180000 * 0.03;
            const expectedFinalCash = (50000 + 30000 + expectedTempCosts) - 60000;
            
            return TestFramework.expect(result.tempFinancingCosts.totalCost).toBeCloseTo(expectedTempCosts, 2) &&
                   TestFramework.expect(result.finalCashLeftInDeal).toBeCloseTo(expectedFinalCash, 2);
        });
        
        TestFramework.test('Scenario 4: Failed BRRRR (insufficient refinance)', function() {
            const inputs = {
                initialCashInvestment: 200000,
                renovationCosts: 60000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 280000, // Low ARV
                cashOutLTV: 70
            };
            
            const result = calculateTemporaryFinancingAnalysis(inputs);
            
            // Total invested: $260k
            // New loan: $280k * 70% = $196k
            // Cash returned: $196k
            // Final cash: $260k - $196k = $64k left in deal
            
            return TestFramework.expect(result.finalCashLeftInDeal).toBeCloseTo(64000, 2);
        });
    });
});
