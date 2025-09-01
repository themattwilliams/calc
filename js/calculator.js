/**
 * Rental Property Analysis Calculator
 * 
 * Core calculation functions for rental property investment analysis.
 * These functions are designed to be testable and match the BiggerPockets
 * rental analysis template methodology.
 * 
 * All functions follow the TDD approach with comprehensive test coverage.
 */

// ========================================
// MORTGAGE CALCULATION FUNCTIONS
// ========================================

/**
 * Calculates monthly mortgage payment using PMT formula
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as decimal, e.g., 0.06 for 6%)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment amount
 */
function calculateMortgagePayment(principal, annualRate, years) {
    // Handle edge cases
    if (principal <= 0 || years <= 0) {
        return 0;
    }
    
    // Handle zero interest rate (cash equivalent)
    if (annualRate === 0) {
        return principal / (years * 12);
    }
    
    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;
    
    // PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const payment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(payment * 100) / 100; // Round to 2 decimal places
}
/**
 * Generates a full amortization schedule with optional extra payments
 * @param {number} loanAmount
 * @param {number} annualRate - decimal (e.g., 0.06)
 * @param {number} years
 * @param {object} options - { extraMonthlyPrincipal?: number, lumpSumPayments?: Record<monthIndex, number> }
 * @returns {Array<{month:number, payment:number, interest:number, principal:number, extraPrincipal:number, balance:number}>}
 */
function generateAmortizationSchedule(loanAmount, annualRate, years, options = {}) {
    const schedule = [];
    const n = Math.max(1, Math.floor(years * 12));
    const monthlyRate = (annualRate || 0) / 12;
    const extraMonthly = Math.max(0, options.extraMonthlyPrincipal || 0);
    const lump = options.lumpSumPayments || {};

    const basePayment = monthlyRate === 0
        ? loanAmount / n
        : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

    let balance = loanAmount;
    for (let month = 1; month <= n && balance > 0.01; month++) {
        const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
        let principal = basePayment - interest;
        let extra = extraMonthly;
        if (lump[month]) extra += Math.max(0, lump[month]);

        // Cap final payment to avoid negative balance due to rounding
        if (principal + extra > balance) {
            principal = balance;
            extra = 0;
        }

        const payment = principal + interest + extra;
        balance = Math.max(0, balance - principal - extra);
        schedule.push({ month, payment, interest: Math.round(interest * 100) / 100, principal: Math.round(principal * 100) / 100, extraPrincipal: Math.round(extra * 100) / 100, balance: Math.round(balance * 100) / 100 });
    }
    return schedule;
}

/**
 * Calculates remaining loan balance at a specific point in time
 * @param {number} loanAmount - Initial loan amount
 * @param {number} monthlyRate - Monthly interest rate (as decimal)
 * @param {number} totalPayments - Total number of payments in loan term
 * @param {number} paymentsMade - Number of payments already made
 * @returns {number} Remaining loan balance
 */
function calculateLoanBalance(loanAmount, monthlyRate, totalPayments, paymentsMade) {
    if (loanAmount <= 0 || paymentsMade >= totalPayments) {
        return 0;
    }
    
    if (monthlyRate === 0) {
        const principalPerPayment = loanAmount / totalPayments;
        return loanAmount - (principalPerPayment * paymentsMade);
    }
    
    const numerator = Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade);
    const denominator = Math.pow(1 + monthlyRate, totalPayments) - 1;
    
    return loanAmount * (numerator / denominator);
}

// ========================================
// INVESTMENT METRIC CALCULATIONS
// ========================================

/**
 * Calculates Cash-on-Cash Return on Investment
 * @param {number} annualCashFlow - Annual cash flow after all expenses
 * @param {number} totalCashInvested - Total cash invested (down payment + closing costs + repairs)
 * @returns {number} Cash-on-Cash ROI as percentage
 */
function calculateCashOnCashROI(annualCashFlow, totalCashInvested) {
    if (totalCashInvested === 0) {
        throw new Error('Total cash invested cannot be zero');
    }
    
    return (annualCashFlow / totalCashInvested) * 100;
}

/**
 * Calculates Net Operating Income (NOI)
 * @param {number} annualIncome - Total annual rental income
 * @param {number} annualOperatingExpenses - Annual operating expenses (excluding mortgage)
 * @returns {number} Net Operating Income
 */
function calculateNOI(annualIncome, annualOperatingExpenses) {
    return annualIncome - annualOperatingExpenses;
}

/**
 * Calculates Capitalization Rate (Cap Rate)
 * @param {number} noi - Net Operating Income
 * @param {number} totalCostOfProject - Total cost including purchase price, closing costs, repairs
 * @returns {number} Cap Rate as percentage
 */
function calculateCapRate(noi, totalCostOfProject) {
    if (totalCostOfProject === 0) {
        throw new Error('Total cost cannot be zero');
    }
    
    return (noi / totalCostOfProject) * 100;
}

/**
 * Calculates Gross Rent Multiplier (GRM)
 * @param {number} purchasePrice - Property purchase price
 * @param {number} annualIncome - Total annual rental income
 * @returns {number} Gross Rent Multiplier
 */
function calculateGrossRentMultiplier(purchasePrice, annualIncome) {
    if (annualIncome === 0) {
        return 0;
    }
    
    return purchasePrice / annualIncome;
}

/**
 * Calculates Debt Coverage Ratio (DCR)
 * @param {number} noi - Net Operating Income
 * @param {number} annualDebtService - Annual debt service (mortgage payments)
 * @returns {number} Debt Coverage Ratio
 */
function calculateDebtCoverageRatio(noi, annualDebtService) {
    if (annualDebtService === 0) {
        return 0;
    }
    
    return noi / annualDebtService;
}

// ========================================
// PROJECT COST CALCULATIONS
// ========================================

/**
 * Calculates total cost of project
 * @param {number} purchasePrice - Property purchase price
 * @param {number} closingCosts - Purchase closing costs
 * @param {number} repairCosts - Estimated repair costs
 * @returns {number} Total cost of project
 */
function calculateTotalCostOfProject(purchasePrice, closingCosts, repairCosts) {
    return purchasePrice + closingCosts + repairCosts;
}

/**
 * Calculates total cash needed for investment
 * @param {number} downPayment - Down payment amount
 * @param {number} closingCosts - Purchase closing costs
 * @param {number} repairCosts - Estimated repair costs
 * @param {number} loanFees - Loan origination fees
 * @returns {number} Total cash needed
 */
function calculateTotalCashNeeded(downPayment, closingCosts, repairCosts, loanFees = 0) {
    return downPayment + closingCosts + repairCosts + loanFees;
}

/**
 * Calculates loan amount
 * @param {number} purchasePrice - Property purchase price
 * @param {number} downPayment - Down payment amount
 * @returns {number} Loan amount
 */
function calculateLoanAmount(purchasePrice, downPayment) {
    return Math.max(0, purchasePrice - downPayment);
}

// ========================================
// EXPENSE CALCULATIONS
// ========================================

/**
 * Calculates monthly management fee based on percentage or fixed amount
 * @param {number} monthlyRent - Monthly rental income
 * @param {number} managementInput - Management fee (percentage if < 1, dollar amount if >= 1)
 * @returns {number} Monthly management fee
 */
function calculateManagementFee(monthlyRent, managementInput) {
    if (managementInput < 1) {
        // Treat as percentage (decimal)
        return monthlyRent * managementInput;
    } else if (managementInput <= 100) {
        // Treat as percentage (whole number)
        return monthlyRent * (managementInput / 100);
    } else {
        // Treat as dollar amount
        return managementInput;
    }
}

/**
 * Calculates total monthly expenses
 * @param {object} expenses - Object containing all expense categories
 * @returns {number} Total monthly expenses
 */
function calculateTotalMonthlyExpenses(expenses) {
    const {
        mortgagePayment = 0,
        propertyTaxes = 0,
        insurance = 0,
        hoaFees = 0,
        management = 0,
        utilities = {},
        customExpenses = 0
    } = expenses;
    
    // Calculate utilities total
    const utilitiesTotal = Object.values(utilities).reduce((sum, amount) => sum + (amount || 0), 0);
    
    return mortgagePayment + propertyTaxes + insurance + hoaFees + management + utilitiesTotal + customExpenses;
}

/**
 * Calculates monthly cash flow
 * @param {number} monthlyIncome - Total monthly rental income
 * @param {number} totalMonthlyExpenses - Total monthly expenses
 * @returns {number} Monthly cash flow
 */
function calculateMonthlyCashFlow(monthlyIncome, totalMonthlyExpenses) {
    return monthlyIncome - totalMonthlyExpenses;
}

// ========================================
// GROWTH PROJECTION CALCULATIONS
// ========================================

/**
 * Applies compound growth to a value
 * @param {number} initialValue - Starting value
 * @param {number} growthRate - Annual growth rate as percentage
 * @param {number} years - Number of years
 * @returns {number} Value after growth
 */
function applyCompoundGrowth(initialValue, growthRate, years) {
    return initialValue * Math.pow(1 + (growthRate / 100), years);
}

/**
 * Generates 30-year financial projections
 * @param {object} inputs - All input parameters for projections
 * @returns {Array} Array of yearly projection data
 */
function generate30YearProjections(inputs) {
    const {
        loanAmount,
        monthlyRate,
        totalPayments,
        monthlyPayment,
        monthlyIncome,
        monthlyOperatingExpenses,
        purchasePrice,
        incomeGrowthRate,
        expenseGrowthRate,
        propertyValueGrowthRate
    } = inputs;
    
    const projections = [];
    let currentAnnualIncome = monthlyIncome * 12;
    let currentAnnualExpenses = monthlyOperatingExpenses * 12;
    let currentPropertyValue = purchasePrice;
    
    for (let year = 1; year <= 30; year++) {
        // Apply growth rates
        currentAnnualIncome = currentAnnualIncome * (1 + incomeGrowthRate / 100);
        currentAnnualExpenses = currentAnnualExpenses * (1 + expenseGrowthRate / 100);
        currentPropertyValue = currentPropertyValue * (1 + propertyValueGrowthRate / 100);
        
        // Calculate loan balance and payments
        const remainingBalance = calculateLoanBalance(loanAmount, monthlyRate, totalPayments, year * 12);
        const previousBalance = year === 1 ? loanAmount : 
            calculateLoanBalance(loanAmount, monthlyRate, totalPayments, (year - 1) * 12);
        const annualPrincipalPayment = previousBalance - remainingBalance;
        const annualInterestPayment = (monthlyPayment * 12) - annualPrincipalPayment;
        
        // Calculate cash flow and equity
        const annualCashFlow = currentAnnualIncome - currentAnnualExpenses - (monthlyPayment * 12);
        const equity = currentPropertyValue - remainingBalance;
        
        const appreciation = currentPropertyValue - (year === 1 ? purchasePrice : projections[year - 2].propertyValue);
        projections.push({
            year,
            annualIncome: currentAnnualIncome,
            annualExpenses: currentAnnualExpenses,
            annualCashFlow,
            propertyValue: currentPropertyValue,
            loanBalance: remainingBalance,
            equity,
            principalPayment: annualPrincipalPayment,
            interestPayment: annualInterestPayment,
            appreciation
        });
    }
    
    return projections;
}

// ========================================
// DISCOUNTED CASH FLOW HELPERS (NPV / IRR)
// ========================================

/**
 * Calculates Net Present Value (NPV) for a series of cashflows
 * @param {number} discountRate - Discount rate as decimal (e.g., 0.1 for 10%)
 * @param {number[]} cashflows - Array of cashflows [CF0, CF1, ... CFN]
 * @returns {number} NPV value
 */
function calculateNPV(discountRate, cashflows) {
    if (!Array.isArray(cashflows) || cashflows.length === 0) return 0;
    const r = 1 + (discountRate || 0);
    return cashflows.reduce((sum, cf, t) => sum + (cf / Math.pow(r, t)), 0);
}

/**
 * Calculates Internal Rate of Return (IRR) via secant method with fallbacks
 * @param {number[]} cashflows - Array of cashflows [CF0, CF1, ... CFN]
 * @param {number} guess - Initial guess (decimal), default 0.1
 * @returns {number} IRR as decimal, or NaN if not found
 */
function calculateIRR(cashflows, guess = 0.1) {
    if (!Array.isArray(cashflows) || cashflows.length < 2) return NaN;
    // Secant method
    let r0 = guess;
    let r1 = guess + 0.05;
    const maxIter = 100;
    const tol = 1e-7;

    const npv = (rate) => calculateNPV(rate, cashflows);

    for (let i = 0; i < maxIter; i++) {
        const f0 = npv(r0);
        const f1 = npv(r1);
        const denom = (f1 - f0);
        if (Math.abs(denom) < 1e-12) break;
        const r2 = r1 - f1 * (r1 - r0) / denom;
        if (!isFinite(r2)) break;
        if (Math.abs(r2 - r1) < tol) return r2;
        r0 = r1;
        r1 = r2;
    }

    // Fallback: bisection over a reasonable range [-0.99, 1.0]
    let lo = -0.99;
    let hi = 1.0;
    let nlo = npv(lo);
    let nhi = npv(hi);
    if (isNaN(nlo) || isNaN(nhi)) return NaN;
    // Ensure sign change; if not, try expanding hi
    if (nlo * nhi > 0) {
        for (let h = 1.5; h <= 10; h += 0.5) {
            hi = h;
            nhi = npv(hi);
            if (nlo * nhi <= 0) break;
        }
        if (nlo * nhi > 0) return NaN;
    }
    for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        const nmid = npv(mid);
        if (Math.abs(nmid) < tol) return mid;
        if (nlo * nmid <= 0) {
            hi = mid; nhi = nmid;
        } else {
            lo = mid; nlo = nmid;
        }
    }
    return (lo + hi) / 2;
}

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validates purchase price input
 * @param {number|string} value - Purchase price value
 * @returns {boolean} True if valid
 */
function validatePurchasePrice(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && num <= 50000000;
}

/**
 * Validates down payment relative to purchase price
 * @param {number|string} downPayment - Down payment amount
 * @param {number|string} purchasePrice - Purchase price amount
 * @returns {boolean} True if valid
 */
function validateDownPayment(downPayment, purchasePrice) {
    const dp = parseFloat(downPayment);
    const pp = parseFloat(purchasePrice);
    return !isNaN(dp) && !isNaN(pp) && dp >= 0 && dp <= pp;
}

/**
 * Validates interest rate input
 * @param {number|string} value - Interest rate value
 * @returns {boolean} True if valid
 */
function validateInterestRate(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0.1 && num <= 15.0;
}

/**
 * Validates monthly rent input
 * @param {number|string} value - Monthly rent value
 * @returns {boolean} True if valid
 */
function validateMonthlyRent(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && num <= 100000;
}

/**
 * Validates growth rate input
 * @param {number|string} value - Growth rate value
 * @returns {boolean} True if valid
 */
function validateGrowthRate(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 20;
}

// ========================================
// FORMATTING FUNCTIONS
// ========================================

/**
 * Formats a number as currency
 * @param {number} value - Numeric value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
}

/**
 * Formats a number as percentage
 * @param {number} value - Numeric value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 1) {
    return (value || 0).toFixed(decimals) + '%';
}

/**
 * Formats a number with commas for thousands separator
 * @param {number} value - Numeric value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value || 0);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Safely parses a numeric input with fallback
 * @param {string|number} value - Value to parse
 * @param {number} fallback - Fallback value if parsing fails (default: 0)
 * @returns {number} Parsed numeric value
 */
function parseNumericInput(value, fallback = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

/**
 * Clamps a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ========================================
// EXPORT FOR TESTING
// ========================================

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    // Browser environment - attach to window
    window.CalculatorFunctions = {
        calculateMortgagePayment,
        calculateLoanBalance,
        calculateCashOnCashROI,
        calculateNOI,
        calculateCapRate,
        calculateGrossRentMultiplier,
        calculateDebtCoverageRatio,
        calculateTotalCostOfProject,
        calculateTotalCashNeeded,
        calculateLoanAmount,
        calculateManagementFee,
        calculateTotalMonthlyExpenses,
        calculateMonthlyCashFlow,
        generateAmortizationSchedule,
        applyCompoundGrowth,
        generate30YearProjections,
        calculateNPV,
        calculateIRR,
        validatePurchasePrice,
        validateDownPayment,
        validateInterestRate,
        validateMonthlyRent,
        validateGrowthRate,
        formatCurrency,
        formatPercentage,
        formatNumber,
        parseNumericInput,
        clampValue
    };
}

// Export for Node.js environments (for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMortgagePayment,
        calculateLoanBalance,
        calculateCashOnCashROI,
        calculateNOI,
        calculateCapRate,
        calculateGrossRentMultiplier,
        calculateDebtCoverageRatio,
        calculateTotalCostOfProject,
        calculateTotalCashNeeded,
        calculateLoanAmount,
        calculateManagementFee,
        calculateTotalMonthlyExpenses,
        calculateMonthlyCashFlow,
        generateAmortizationSchedule,
        applyCompoundGrowth,
        generate30YearProjections,
        calculateNPV,
        calculateIRR,
        validatePurchasePrice,
        validateDownPayment,
        validateInterestRate,
        validateMonthlyRent,
        validateGrowthRate,
        formatCurrency,
        formatPercentage,
        formatNumber,
        parseNumericInput,
        clampValue
    };
}
