/**
 * Temporary Financing Calculations for BRRRR Strategy
 * 
 * Handles all calculations related to temporary financing including:
 * - Hard money loans
 * - Bridge financing
 * - Cash-out refinancing
 * - Timeline adjustments for analysis
 */

/**
 * Calculates temporary financing costs including interest and points
 * @param {number} amount - Temporary financing amount
 * @param {number} interestRate - Annual interest rate (percentage)
 * @param {number} termMonths - Loan term in months
 * @param {number} points - Origination points (percentage)
 * @returns {object} Breakdown of temporary financing costs
 */
function calculateTemporaryFinancingCosts(amount, interestRate, termMonths, points) {
    if (amount <= 0) {
        return {
            interestCost: 0,
            pointsCost: 0,
            totalCost: 0
        };
    }
    
    const annualRate = interestRate / 100;
    const interestCost = amount * annualRate * (termMonths / 12);
    const pointsCost = amount * (points / 100);
    const totalCost = interestCost + pointsCost;
    
    return {
        interestCost: interestCost,
        pointsCost: pointsCost,
        totalCost: totalCost
    };
}

/**
 * Calculates cash-out refinance results
 * @param {number} afterRepairValue - Property value after renovation
 * @param {number} refinanceLTV - Loan-to-value percentage for refinance
 * @param {number} tempLoanBalance - Remaining balance on temporary loan
 * @returns {object} Refinance calculations
 */
function calculateCashOutRefinance(afterRepairValue, refinanceLTV, tempLoanBalance) {
    const newLoanAmount = afterRepairValue * (refinanceLTV / 100);
    const cashReturned = Math.max(0, newLoanAmount - tempLoanBalance);
    
    return {
        newLoanAmount: newLoanAmount,
        cashReturned: cashReturned,
        loanToValueUsed: refinanceLTV
    };
}

/**
 * Calculates total initial investment for temporary financing strategy
 * @param {number} initialCash - Initial cash investment
 * @param {number} renovationCosts - Cost of renovations
 * @param {number} tempFinancingCosts - Total temporary financing costs
 * @returns {number} Total initial investment
 */
function calculateTotalInitialInvestment(initialCash, renovationCosts, tempFinancingCosts) {
    return initialCash + renovationCosts + tempFinancingCosts;
}

/**
 * Calculates final cash left in deal after refinance
 * @param {number} totalInitialInvestment - Total money invested initially
 * @param {number} cashReturnedAtRefinance - Cash returned from refinance
 * @returns {number} Net cash remaining in the investment
 */
function calculateFinalCashLeftInDeal(totalInitialInvestment, cashReturnedAtRefinance) {
    return Math.max(0, totalInitialInvestment - cashReturnedAtRefinance);
}

/**
 * Calculates the start date for long-term analysis based on temporary financing timeline
 * @param {number} renovationMonths - Months for renovation
 * @param {number} refinanceProcessMonths - Months for refinance process (default 1)
 * @returns {Date} Start date for long-term rental analysis
 */
function calculateAnalysisStartDate(renovationMonths, refinanceProcessMonths = 1) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + renovationMonths + refinanceProcessMonths);
    return startDate;
}

/**
 * Comprehensive temporary financing analysis
 * @param {object} inputs - All temporary financing inputs
 * @returns {object} Complete temporary financing analysis
 */
function calculateTemporaryFinancingAnalysis(inputs) {
    const {
        initialCashInvestment = 0,
        renovationCosts = 0,
        tempFinancingAmount = 0,
        tempInterestRate = 0,
        originationPoints = 0,
        tempLoanTermMonths = 6,
        afterRepairValue = 0,
        cashOutLTV = 75
    } = inputs;
    
    // Calculate temporary financing costs
    const tempCosts = calculateTemporaryFinancingCosts(
        tempFinancingAmount, 
        tempInterestRate, 
        tempLoanTermMonths, 
        originationPoints
    );
    
    // Calculate total initial investment
    const totalInitialInvestment = calculateTotalInitialInvestment(
        initialCashInvestment,
        renovationCosts,
        tempCosts.totalCost
    );
    
    // Calculate refinance results
    const refinanceResults = calculateCashOutRefinance(
        afterRepairValue,
        cashOutLTV,
        tempFinancingAmount // Assuming temp loan is paid off with refinance
    );
    
    // Calculate final cash left in deal
    const finalCashLeftInDeal = calculateFinalCashLeftInDeal(
        totalInitialInvestment,
        refinanceResults.cashReturned
    );
    
    // Calculate analysis start date
    const analysisStartDate = calculateAnalysisStartDate(tempLoanTermMonths);
    
    return {
        tempFinancingCosts: tempCosts,
        totalInitialInvestment: totalInitialInvestment,
        refinanceResults: refinanceResults,
        finalCashLeftInDeal: finalCashLeftInDeal,
        analysisStartDate: analysisStartDate,
        tempLoanTermMonths: tempLoanTermMonths,
        isUsingTemporaryFinancing: true
    };
}

/**
 * Validates temporary financing inputs for business logic
 * @param {object} inputs - Temporary financing inputs
 * @returns {object} Validation results with errors if any
 */
function validateTemporaryFinancingInputs(inputs) {
    const errors = [];
    const warnings = [];
    
    const {
        initialCashInvestment = 0,
        renovationCosts = 0,
        tempFinancingAmount = 0,
        tempInterestRate = 0,
        tempLoanTermMonths = 6,
        afterRepairValue = 0,
        cashOutLTV = 75,
        purchasePrice = 0
    } = inputs;
    
    // Business logic validations
    if (afterRepairValue > 0 && afterRepairValue <= purchasePrice + renovationCosts) {
        warnings.push('ARV should typically be higher than purchase price + renovation costs');
    }
    
    if (cashOutLTV > 80) {
        warnings.push('Cash-out refinance LTV above 80% may be difficult to obtain');
    }
    
    if (tempInterestRate > 20) {
        warnings.push('Temporary interest rate above 20% is very expensive');
    }
    
    if (tempLoanTermMonths > 12) {
        warnings.push('Temporary financing terms longer than 12 months are uncommon');
    }
    
    // Calculate if refinance will cover temporary financing
    if (afterRepairValue > 0 && tempFinancingAmount > 0) {
        const maxRefinanceAmount = afterRepairValue * (cashOutLTV / 100);
        if (maxRefinanceAmount < tempFinancingAmount) {
            errors.push('Refinance loan amount may not cover temporary financing balance');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}
