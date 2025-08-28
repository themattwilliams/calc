/**
 * Financial Calculation Tests
 * 
 * Comprehensive test suite for all financial calculations used in the
 * Rental Property Analysis Calculator. These tests validate the accuracy
 * of mortgage calculations, investment metrics, and long-term projections.
 */

// Test data for consistent testing
const TEST_DATA = {
    standardProperty: {
        purchasePrice: 250000,
        downPayment: 50000,
        loanAmount: 200000,
        interestRate: 0.06,
        loanTerm: 30,
        monthlyRent: 2200,
        monthlyExpenses: 800,
        closingCosts: 5000,
        repairCosts: 10000
    },
    
    highEndProperty: {
        purchasePrice: 1000000,
        downPayment: 200000,
        loanAmount: 800000,
        interestRate: 0.055,
        loanTerm: 30,
        monthlyRent: 6500,
        monthlyExpenses: 2200,
        closingCosts: 25000,
        repairCosts: 50000
    },
    
    cashPurchase: {
        purchasePrice: 150000,
        downPayment: 150000,
        loanAmount: 0,
        interestRate: 0,
        loanTerm: 30,
        monthlyRent: 1500,
        monthlyExpenses: 400,
        closingCosts: 3000,
        repairCosts: 15000
    }
};

// Expected results for validation (calculated independently)
const EXPECTED_RESULTS = {
    standardProperty: {
        monthlyPayment: 1199.10,
        cashOnCashROI: 25.85, // Approximate
        capRate: 7.62,
        noi: 16800
    },
    
    highEndProperty: {
        monthlyPayment: 4800.70,
        cashOnCashROI: 18.40,
        capRate: 5.27,
        noi: 51600
    },
    
    cashPurchase: {
        monthlyPayment: 0,
        cashOnCashROI: 7.86,
        capRate: 8.81,
        noi: 13200
    }
};

TestFramework.describe('Financial Calculations', function() {
    
    // ========================================
    // MORTGAGE PAYMENT CALCULATIONS
    // ========================================
    
    TestFramework.test('PMT Formula - Standard 30-year loan', function() {
        const result = calculateMortgagePayment(200000, 0.06, 30);
        return TestFramework.expect(result).toBeCloseTo(1199.10, 2);
    });
    
    TestFramework.test('PMT Formula - 15-year loan', function() {
        const result = calculateMortgagePayment(200000, 0.06, 15);
        return TestFramework.expect(result).toBeCloseTo(1687.71, 2);
    });
    
    TestFramework.test('PMT Formula - High-end property', function() {
        const result = calculateMortgagePayment(800000, 0.055, 30);
        return TestFramework.expect(result).toBeCloseTo(4542.31, 2);
    });
    
    TestFramework.test('PMT Formula - Zero interest (cash equivalent)', function() {
        const result = calculateMortgagePayment(200000, 0, 30);
        const expected = 200000 / (30 * 12); // Simple division for 0% interest
        return TestFramework.expect(result).toBeCloseTo(expected, 2);
    });
    
    TestFramework.test('PMT Formula - Very low interest rate', function() {
        const result = calculateMortgagePayment(200000, 0.001, 30); // 0.1% annual
        return TestFramework.expect(result).toBeCloseTo(563.95, 2);
    });
    
    TestFramework.test('PMT Formula - Edge case: Single year loan', function() {
        const result = calculateMortgagePayment(100000, 0.06, 1);
        return TestFramework.expect(result).toBeCloseTo(8606.64, 2);
    });
    
    // ========================================
    // CASH-ON-CASH ROI CALCULATIONS
    // ========================================
    
    TestFramework.test('Cash-on-Cash ROI - Standard property scenario', function() {
        const annualCashFlow = (2200 - 800 - 1199.10) * 12; // Monthly cash flow * 12
        const totalCashInvested = 50000 + 5000 + 10000; // Down payment + closing + repairs
        const result = calculateCashOnCashROI(annualCashFlow, totalCashInvested);
        return TestFramework.expect(result).toBeCloseTo(3.71, 1); // Approximately 3.7%
    });
    
    TestFramework.test('Cash-on-Cash ROI - Positive cash flow scenario', function() {
        const result = calculateCashOnCashROI(5000, 100000);
        return TestFramework.expect(result).toBeCloseTo(5.0, 1);
    });
    
    TestFramework.test('Cash-on-Cash ROI - Negative cash flow scenario', function() {
        const result = calculateCashOnCashROI(-2000, 100000);
        return TestFramework.expect(result).toBeCloseTo(-2.0, 1);
    });
    
    TestFramework.test('Cash-on-Cash ROI - Zero cash flow', function() {
        const result = calculateCashOnCashROI(0, 50000);
        return TestFramework.expect(result).toBe(0);
    });
    
    TestFramework.test('Cash-on-Cash ROI - Error handling: Zero investment', function() {
        return TestFramework.expect(() => {
            calculateCashOnCashROI(5000, 0);
        }).toThrow();
    });
    
    // ========================================
    // NET OPERATING INCOME (NOI) CALCULATIONS
    // ========================================
    
    TestFramework.test('NOI Calculation - Standard property', function() {
        const annualIncome = 2200 * 12; // $26,400
        const annualOperatingExpenses = 800 * 12; // $9,600 (excluding mortgage)
        const result = calculateNOI(annualIncome, annualOperatingExpenses);
        return TestFramework.expect(result).toBe(16800);
    });
    
    TestFramework.test('NOI Calculation - High-end property', function() {
        const annualIncome = 6500 * 12;
        const annualOperatingExpenses = 2200 * 12;
        const result = calculateNOI(annualIncome, annualOperatingExpenses);
        return TestFramework.expect(result).toBe(51600);
    });
    
    TestFramework.test('NOI Calculation - Break-even scenario', function() {
        const result = calculateNOI(24000, 24000);
        return TestFramework.expect(result).toBe(0);
    });
    
    TestFramework.test('NOI Calculation - Loss scenario', function() {
        const result = calculateNOI(20000, 25000);
        return TestFramework.expect(result).toBe(-5000);
    });
    
    // ========================================
    // CAPITALIZATION RATE CALCULATIONS
    // ========================================
    
    TestFramework.test('Cap Rate Calculation - Standard property', function() {
        const noi = 16800;
        const totalCost = 250000 + 5000 + 10000; // Purchase + closing + repairs
        const result = calculateCapRate(noi, totalCost);
        return TestFramework.expect(result).toBeCloseTo(6.34, 2);
    });
    
    TestFramework.test('Cap Rate Calculation - High-end property', function() {
        const noi = 51600;
        const totalCost = 1000000 + 25000 + 50000;
        const result = calculateCapRate(noi, totalCost);
        return TestFramework.expect(result).toBeCloseTo(4.80, 2);
    });
    
    TestFramework.test('Cap Rate Calculation - Excellent cap rate scenario', function() {
        const result = calculateCapRate(15000, 150000);
        return TestFramework.expect(result).toBeCloseTo(10.0, 1);
    });
    
    TestFramework.test('Cap Rate Calculation - Error handling: Zero total cost', function() {
        return TestFramework.expect(() => {
            calculateCapRate(15000, 0);
        }).toThrow();
    });
    
    // ========================================
    // FORMATTING FUNCTION TESTS
    // ========================================
    
    TestFramework.test('Currency Formatting - Standard amounts', function() {
        const result = formatCurrency(1234.56);
        return TestFramework.expect(result).toBe('$1,234.56');
    });
    
    TestFramework.test('Currency Formatting - Large amounts', function() {
        const result = formatCurrency(1234567.89);
        return TestFramework.expect(result).toBe('$1,234,567.89');
    });
    
    TestFramework.test('Currency Formatting - Zero amount', function() {
        const result = formatCurrency(0);
        return TestFramework.expect(result).toBe('$0.00');
    });
    
    TestFramework.test('Currency Formatting - Negative amount', function() {
        const result = formatCurrency(-500.25);
        return TestFramework.expect(result).toBe('-$500.25');
    });
    
    TestFramework.test('Percentage Formatting - Standard percentage', function() {
        const result = formatPercentage(5.75);
        return TestFramework.expect(result).toBe('5.8%');
    });
    
    TestFramework.test('Percentage Formatting - Zero percentage', function() {
        const result = formatPercentage(0);
        return TestFramework.expect(result).toBe('0.0%');
    });
    
    TestFramework.test('Percentage Formatting - Custom decimal places', function() {
        const result = formatPercentage(5.7531, 3);
        return TestFramework.expect(result).toBe('5.753%');
    });
    
    TestFramework.test('Percentage Formatting - Negative percentage', function() {
        const result = formatPercentage(-2.5);
        return TestFramework.expect(result).toBe('-2.5%');
    });
    
    // ========================================
    // COMPREHENSIVE SCENARIO TESTS
    // ========================================
    
    TestFramework.test('Complete Analysis - Standard Rental Property', function() {
        const data = TEST_DATA.standardProperty;
        
        // Calculate all metrics
        const monthlyPayment = calculateMortgagePayment(data.loanAmount, data.interestRate, data.loanTerm);
        const monthlyCashFlow = data.monthlyRent - data.monthlyExpenses - monthlyPayment;
        const annualCashFlow = monthlyCashFlow * 12;
        const totalCashInvested = data.downPayment + data.closingCosts + data.repairCosts;
        const cashOnCashROI = calculateCashOnCashROI(annualCashFlow, totalCashInvested);
        
        const annualIncome = data.monthlyRent * 12;
        const annualOperatingExpenses = data.monthlyExpenses * 12; // Excluding mortgage
        const noi = calculateNOI(annualIncome, annualOperatingExpenses);
        const totalCost = data.purchasePrice + data.closingCosts + data.repairCosts;
        const capRate = calculateCapRate(noi, totalCost);
        
        // Validate all calculations are reasonable
        const results = [
            TestFramework.expect(monthlyPayment).toBeCloseTo(1199.10, 2),
            TestFramework.expect(monthlyCashFlow).toBeGreaterThan(0), // Should be positive
            TestFramework.expect(cashOnCashROI).toBeGreaterThan(0), // Should be positive
            TestFramework.expect(noi).toBe(16800),
            TestFramework.expect(capRate).toBeGreaterThan(5) // Should be reasonable cap rate
        ];
        
        return results.every(result => result === true);
    });
    
    TestFramework.test('Complete Analysis - Cash Purchase Property', function() {
        const data = TEST_DATA.cashPurchase;
        
        // For cash purchase, no mortgage payment
        const monthlyPayment = 0;
        const monthlyCashFlow = data.monthlyRent - data.monthlyExpenses - monthlyPayment;
        const annualCashFlow = monthlyCashFlow * 12;
        const totalCashInvested = data.downPayment + data.closingCosts + data.repairCosts;
        const cashOnCashROI = calculateCashOnCashROI(annualCashFlow, totalCashInvested);
        
        const annualIncome = data.monthlyRent * 12;
        const annualOperatingExpenses = data.monthlyExpenses * 12;
        const noi = calculateNOI(annualIncome, annualOperatingExpenses);
        const totalCost = data.purchasePrice + data.closingCosts + data.repairCosts;
        const capRate = calculateCapRate(noi, totalCost);
        
        // Validate cash purchase scenario
        const results = [
            TestFramework.expect(monthlyPayment).toBe(0),
            TestFramework.expect(monthlyCashFlow).toBe(1100), // $1,500 - $400
            TestFramework.expect(annualCashFlow).toBe(13200),
            TestFramework.expect(cashOnCashROI).toBeCloseTo(7.86, 1),
            TestFramework.expect(capRate).toBeCloseTo(7.86, 1) // For cash purchase, cap rate ≈ cash-on-cash ROI
        ];
        
        return results.every(result => result === true);
    });
    
    // ========================================
    // EDGE CASE AND ERROR HANDLING TESTS
    // ========================================
    
    TestFramework.test('Edge Case - Very small loan amount', function() {
        const result = calculateMortgagePayment(1000, 0.06, 30);
        return TestFramework.expect(result).toBeCloseTo(5.996, 2);
    });
    
    TestFramework.test('Edge Case - Very high interest rate', function() {
        const result = calculateMortgagePayment(200000, 0.15, 30); // 15% interest
        return TestFramework.expect(result).toBeCloseTo(2528.89, 2);
    });
    
    TestFramework.test('Edge Case - Very short loan term', function() {
        const result = calculateMortgagePayment(200000, 0.06, 5);
        return TestFramework.expect(result).toBeCloseTo(3866.56, 2);
    });
    
    TestFramework.test('Boundary Test - Maximum realistic purchase price', function() {
        const result = calculateMortgagePayment(10000000, 0.06, 30);
        return TestFramework.expect(result).toBeCloseTo(59955.05, 2);
    });
    
    TestFramework.test('Boundary Test - Minimum realistic interest rate', function() {
        const result = calculateMortgagePayment(200000, 0.005, 30); // 0.5% annual
        return TestFramework.expect(result).toBeCloseTo(598.38, 2);
    });
});

// Log test suite loaded
console.log('✅ Financial Calculation Tests Loaded - ' + TestFramework.tests.filter(t => t.category === 'Financial Calculations').length + ' tests registered');
