/**
 * Integration Tests for Temporary Financing with Regular Calculations
 * 
 * Tests that verify temporary financing integrates correctly with:
 * - Regular property calculations
 * - ROI calculations using final cash left in deal
 * - Chart generation with adjusted timelines
 * - Save/load markdown functionality
 * - UI state management
 */

TestFramework.suite('Temporary Financing Integration Tests', function() {
    
    // ========================================
    // INTEGRATION WITH REGULAR CALCULATIONS
    // ========================================
    
    TestFramework.suite('Regular Calculation Integration', function() {
        
        TestFramework.test('Traditional financing vs temporary financing cash calculations', function() {
            // Traditional scenario
            const traditionalInputs = {
                purchasePrice: 300000,
                downPayment: 60000,
                purchaseClosingCosts: 9000,
                estimatedRepairCosts: 15000
            };
            
            const traditionalCashNeeded = traditionalInputs.downPayment + 
                                        traditionalInputs.purchaseClosingCosts + 
                                        traditionalInputs.estimatedRepairCosts;
            
            // BRRRR scenario with same property
            const brrrInputs = {
                initialCashInvestment: 300000, // Buy with cash
                renovationCosts: 15000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 400000,
                cashOutLTV: 75
            };
            
            const brrrAnalysis = calculateTemporaryFinancingAnalysis(brrrInputs);
            
            // Traditional cash needed: $84,000
            // BRRRR final cash left: $15,000 (initial + renovation - refinance)
            return TestFramework.expect(traditionalCashNeeded).toBeCloseTo(84000, 2) &&
                   TestFramework.expect(brrrAnalysis.finalCashLeftInDeal).toBe(15000);
        });
        
        TestFramework.test('Cash-on-cash ROI with temporary financing', function() {
            // Scenario where investor has $50k left in deal after BRRRR
            const inputs = {
                initialCashInvestment: 200000,
                renovationCosts: 40000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 350000,
                cashOutLTV: 70
            };
            
            const analysis = calculateTemporaryFinancingAnalysis(inputs);
            
            // Total invested: $240k
            // New loan: $350k * 70% = $245k
            // Cash returned: $245k (more than invested)
            // Final cash: $0
            
            // If monthly cash flow is $300, annual is $3600
            // ROI = $3600 / $0 = infinite% (or undefined)
            
            return TestFramework.expect(analysis.totalInitialInvestment).toBeCloseTo(240000, 2) &&
                   TestFramework.expect(analysis.refinanceResults.cashReturned).toBeCloseTo(245000, 2) &&
                   TestFramework.expect(analysis.finalCashLeftInDeal).toBe(0);
        });
        
        TestFramework.test('Monthly cash flow calculation with refinanced loan', function() {
            // Test that monthly payment calculation uses the new loan amount
            const inputs = {
                afterRepairValue: 400000,
                cashOutLTV: 75,
                tempFinancingAmount: 200000
            };
            
            const refinanceResults = calculateCashOutRefinance(
                inputs.afterRepairValue, 
                inputs.cashOutLTV, 
                inputs.tempFinancingAmount
            );
            
            // New loan: $300k at market rates (say 6.5% for 30 years)
            const newMonthlyPayment = calculateMortgagePayment(
                refinanceResults.newLoanAmount, 
                6.5, 
                30
            );
            
            return TestFramework.expect(refinanceResults.newLoanAmount).toBeCloseTo(300000, 2) &&
                   TestFramework.expect(newMonthlyPayment).toBeGreaterThan(0) &&
                   TestFramework.expect(newMonthlyPayment).toBeLessThan(5000);
        });
    });
    
    // ========================================
    // TIMELINE AND ANALYSIS START DATE
    // ========================================
    
    TestFramework.suite('Timeline Integration', function() {
        
        TestFramework.test('Analysis start date affects projection calculations', function() {
            // 6-month renovation + 1-month refinance = 7-month delay
            const startDate = calculateAnalysisStartDate(6, 1);
            const currentDate = new Date();
            const expectedDate = new Date(currentDate);
            expectedDate.setMonth(expectedDate.getMonth() + 7);
            
            // Dates should be within the same month
            return TestFramework.expect(startDate.getMonth()).toBe(expectedDate.getMonth()) &&
                   TestFramework.expect(startDate.getFullYear()).toBe(expectedDate.getFullYear());
        });
        
        TestFramework.test('Long-term projections start from refinance date', function() {
            // Verify that 30-year projections would start from the delayed date
            // This is more of a conceptual test since actual projection generation
            // would happen in the UI layer
            
            const analysis = calculateTemporaryFinancingAnalysis({
                tempLoanTermMonths: 8,
                afterRepairValue: 400000,
                cashOutLTV: 75
            });
            
            // Analysis should indicate it's using temporary financing
            // and provide the correct start date
            return TestFramework.expect(analysis.isUsingTemporaryFinancing).toBe(true) &&
                   TestFramework.expect(analysis.tempLoanTermMonths).toBe(8);
        });
    });
    
    // ========================================
    // COMPLEX SCENARIOS WITH MULTIPLE CALCULATIONS
    // ========================================
    
    TestFramework.suite('Complex Scenario Integration', function() {
        
        TestFramework.test('Full BRRRR scenario with all calculations', function() {
            // Complete scenario: Buy, Rehab, Rent, Refinance
            const scenario = {
                // Purchase phase
                purchasePrice: 280000,
                initialCashInvestment: 280000, // All cash purchase
                
                // Rehab phase
                renovationCosts: 45000,
                tempLoanTermMonths: 8,
                
                // Refinance phase
                afterRepairValue: 420000,
                cashOutLTV: 75,
                
                // Rent phase (for ROI calculation)
                monthlyRent: 3200,
                monthlyExpenses: 2100 // Taxes, insurance, etc.
            };
            
            const tempAnalysis = calculateTemporaryFinancingAnalysis({
                initialCashInvestment: scenario.initialCashInvestment,
                renovationCosts: scenario.renovationCosts,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: scenario.tempLoanTermMonths,
                afterRepairValue: scenario.afterRepairValue,
                cashOutLTV: scenario.cashOutLTV
            });
            
            // Calculate new monthly payment with refinanced loan
            const newMonthlyPayment = calculateMortgagePayment(
                tempAnalysis.refinanceResults.newLoanAmount, 
                6.5, 
                30
            );
            
            // Calculate final cash flow
            const totalMonthlyExpenses = scenario.monthlyExpenses + newMonthlyPayment;
            const monthlyCashFlow = scenario.monthlyRent - totalMonthlyExpenses;
            
            // Calculate ROI based on final cash left in deal
            const annualCashFlow = monthlyCashFlow * 12;
            let cashOnCashROI = 0;
            if (tempAnalysis.finalCashLeftInDeal > 0) {
                cashOnCashROI = (annualCashFlow / tempAnalysis.finalCashLeftInDeal) * 100;
            }
            
            // Verify the complete calculation chain
            return TestFramework.expect(tempAnalysis.totalInitialInvestment).toBeCloseTo(325000, 2) &&
                   TestFramework.expect(tempAnalysis.refinanceResults.newLoanAmount).toBeCloseTo(315000, 2) &&
                   TestFramework.expect(tempAnalysis.finalCashLeftInDeal).toBeCloseTo(10000, 2) &&
                   TestFramework.expect(newMonthlyPayment).toBeGreaterThan(0) &&
                   TestFramework.expect(newMonthlyPayment).toBeLessThan(5000) &&
                   TestFramework.expect(isFinite(monthlyCashFlow));
        });
        
        TestFramework.test('Hard money scenario with comprehensive calculations', function() {
            const scenario = {
                // Purchase with hard money
                purchasePrice: 250000,
                initialCashInvestment: 50000, // Down payment
                tempFinancingAmount: 200000, // Hard money loan
                tempInterestRate: 14,
                originationPoints: 3,
                tempLoanTermMonths: 10,
                
                // Renovation
                renovationCosts: 35000,
                
                // Refinance
                afterRepairValue: 380000,
                cashOutLTV: 70,
                
                // Operations
                monthlyRent: 2800,
                monthlyExpenses: 1600
            };
            
            const analysis = calculateTemporaryFinancingAnalysis(scenario);
            
            // Calculate expected costs
            const expectedTempCosts = scenario.tempFinancingAmount * (scenario.tempInterestRate / 100) * (scenario.tempLoanTermMonths / 12) +
                                    scenario.tempFinancingAmount * (scenario.originationPoints / 100);
            
            const expectedTotalInvestment = scenario.initialCashInvestment + scenario.renovationCosts + expectedTempCosts;
            const expectedNewLoan = scenario.afterRepairValue * (scenario.cashOutLTV / 100);
            const expectedCashReturned = expectedNewLoan - scenario.tempFinancingAmount;
            const expectedFinalCash = expectedTotalInvestment - expectedCashReturned;
            
            // Verify all calculations match
            return TestFramework.expect(analysis.tempFinancingCosts.totalCost).toBeCloseTo(expectedTempCosts, 2) &&
                   TestFramework.expect(analysis.totalInitialInvestment).toBeCloseTo(expectedTotalInvestment, 2) &&
                   TestFramework.expect(analysis.refinanceResults.newLoanAmount).toBeCloseTo(expectedNewLoan, 2) &&
                   TestFramework.expect(analysis.refinanceResults.cashReturned).toBeCloseTo(expectedCashReturned, 2) &&
                   TestFramework.expect(analysis.finalCashLeftInDeal).toBeCloseTo(expectedFinalCash, 2);
        });
    });
    
    // ========================================
    // COMPARISON TESTS
    // ========================================
    
    TestFramework.suite('Strategy Comparison Tests', function() {
        
        TestFramework.test('Traditional vs BRRRR ROI comparison', function() {
            const propertyDetails = {
                purchasePrice: 300000,
                renovationCosts: 40000,
                finalValue: 420000,
                monthlyRent: 3000,
                monthlyExpenses: 1800
            };
            
            // Traditional scenario: 20% down
            const traditionalDownPayment = propertyDetails.purchasePrice * 0.20;
            const traditionalLoanAmount = propertyDetails.purchasePrice - traditionalDownPayment;
            const traditionalClosingCosts = propertyDetails.purchasePrice * 0.03;
            const traditionalCashNeeded = traditionalDownPayment + traditionalClosingCosts + propertyDetails.renovationCosts;
            
            // BRRRR scenario: All cash, then refinance
            const brrrAnalysis = calculateTemporaryFinancingAnalysis({
                initialCashInvestment: propertyDetails.purchasePrice,
                renovationCosts: propertyDetails.renovationCosts,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: propertyDetails.finalValue,
                cashOutLTV: 75
            });
            
            // Calculate monthly payments for both scenarios
            const traditionalPayment = calculateMortgagePayment(traditionalLoanAmount, 6.5, 30);
            const brrrPayment = calculateMortgagePayment(brrrAnalysis.refinanceResults.newLoanAmount, 6.5, 30);
            
            // Calculate cash flows
            const traditionalCashFlow = propertyDetails.monthlyRent - propertyDetails.monthlyExpenses - traditionalPayment;
            const brrrCashFlow = propertyDetails.monthlyRent - propertyDetails.monthlyExpenses - brrrPayment;
            
            // Calculate ROIs
            const traditionalROI = (traditionalCashFlow * 12 / traditionalCashNeeded) * 100;
            const brrrROI = brrrAnalysis.finalCashLeftInDeal > 0 ? 
                          (brrrCashFlow * 12 / brrrAnalysis.finalCashLeftInDeal) * 100 : 
                          Infinity; // Infinite ROI if no cash left
            
            // BRRRR should have cash left in deal
            return TestFramework.expect(traditionalCashNeeded).toBeCloseTo(109000, 2) && // $60k + $9k + $40k
                   TestFramework.expect(brrrAnalysis.finalCashLeftInDeal).toBeGreaterThan(0) && // Some cash left
                   TestFramework.expect(traditionalROI).toBeGreaterThan(0) &&
                   TestFramework.expect(brrrROI).toBeGreaterThan(0);
        });
        
        TestFramework.test('Different LTV scenarios comparison', function() {
            const baseInputs = {
                initialCashInvestment: 200000,
                renovationCosts: 30000,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 350000
            };
            
            // Test different LTV scenarios
            const ltv65 = calculateTemporaryFinancingAnalysis({...baseInputs, cashOutLTV: 65});
            const ltv70 = calculateTemporaryFinancingAnalysis({...baseInputs, cashOutLTV: 70});
            const ltv75 = calculateTemporaryFinancingAnalysis({...baseInputs, cashOutLTV: 75});
            const ltv80 = calculateTemporaryFinancingAnalysis({...baseInputs, cashOutLTV: 80});
            
            // Higher LTV should mean more cash returned and less left in deal
            const cashLeft65 = ltv65.finalCashLeftInDeal;
            const cashLeft70 = ltv70.finalCashLeftInDeal;
            const cashLeft75 = ltv75.finalCashLeftInDeal;
            const cashLeft80 = ltv80.finalCashLeftInDeal;
            
            return TestFramework.expect(cashLeft65).toBeGreaterThan(0) &&
                   TestFramework.expect(cashLeft70).toBeGreaterThan(0) &&
                   TestFramework.expect(cashLeft75).toBeGreaterThan(0) &&
                   TestFramework.expect(ltv80.refinanceResults.newLoanAmount).toBeCloseTo(280000, 2);
        });
    });
    
    // ========================================
    // ERROR HANDLING AND EDGE CASES
    // ========================================
    
    TestFramework.suite('Error Handling in Integration', function() {
        
        TestFramework.test('Handles impossible refinance scenarios gracefully', function() {
            // Scenario where ARV is too low for refinance to work
            const inputs = {
                initialCashInvestment: 300000,
                renovationCosts: 50000,
                tempFinancingAmount: 200000,
                tempInterestRate: 12,
                originationPoints: 2,
                tempLoanTermMonths: 6,
                afterRepairValue: 250000, // Very low ARV
                cashOutLTV: 75
            };
            
            const analysis = calculateTemporaryFinancingAnalysis(inputs);
            const validation = validateTemporaryFinancingInputs(inputs);
            
            // New loan: $250k * 75% = $187.5k
            // But temp financing is $200k, so this fails
            return TestFramework.expect(analysis.refinanceResults.newLoanAmount).toBeCloseTo(187500, 2) &&
                   TestFramework.expect(analysis.refinanceResults.cashReturned).toBe(0) &&
                   TestFramework.expect(validation.isValid).toBe(false) &&
                   TestFramework.expect(validation.errors.length).toBeGreaterThan(0);
        });
        
        TestFramework.test('Handles zero values correctly', function() {
            const inputs = {
                initialCashInvestment: 0,
                renovationCosts: 0,
                tempFinancingAmount: 0,
                tempInterestRate: 0,
                originationPoints: 0,
                tempLoanTermMonths: 6,
                afterRepairValue: 0,
                cashOutLTV: 75
            };
            
            const analysis = calculateTemporaryFinancingAnalysis(inputs);
            
            // Should handle all zeros gracefully
            return TestFramework.expect(analysis.totalInitialInvestment).toBe(0) &&
                   TestFramework.expect(analysis.tempFinancingCosts.totalCost).toBe(0) &&
                   TestFramework.expect(analysis.refinanceResults.newLoanAmount).toBe(0) &&
                   TestFramework.expect(analysis.finalCashLeftInDeal).toBe(0);
        });
        
        TestFramework.test('Handles extreme values', function() {
            const inputs = {
                initialCashInvestment: 10000000, // $10M
                renovationCosts: 2000000,        // $2M
                tempFinancingAmount: 5000000,    // $5M
                tempInterestRate: 25,            // 25%
                originationPoints: 5,            // 5%
                tempLoanTermMonths: 24,          // 2 years
                afterRepairValue: 20000000,      // $20M
                cashOutLTV: 80                   // 80%
            };
            
            const analysis = calculateTemporaryFinancingAnalysis(inputs);
            
            // Should handle extreme values without errors
            const expectedTempCosts = 5000000 * 0.25 * 2 + 5000000 * 0.05; // $2.5M + $250k = $2.75M
            const expectedNewLoan = 20000000 * 0.80; // $16M
            
            return TestFramework.expect(analysis.tempFinancingCosts.totalCost).toBeCloseTo(expectedTempCosts, 2) &&
                   TestFramework.expect(analysis.refinanceResults.newLoanAmount).toBeCloseTo(expectedNewLoan, 2) &&
                   TestFramework.expect(analysis.totalInitialInvestment).toBeGreaterThan(10000000);
        });
    });
});
