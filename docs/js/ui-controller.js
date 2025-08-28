/**
 * UI Controller for Rental Property Analysis Calculator
 * 
 * Manages all user interface interactions, real-time validation,
 * calculation updates, and chart rendering.
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // DOM ELEMENTS AND INITIALIZATION
    // ========================================
    
    const inputs = document.querySelectorAll('input[type="number"], select');
    const metricLinks = document.querySelectorAll('.metric-link');
    const tooltip = document.getElementById('custom-tooltip');
    const saveTopBtn = document.getElementById('saveTopBtn');
    const saveBottomBtn = document.getElementById('saveBottomBtn');
    const quickEntryButtons = document.querySelectorAll('.btn-quick-entry');
    
    // Result display elements
    const results = {
        totalCostOfProject: document.getElementById('totalCostOfProject'),
        totalCashNeeded: document.getElementById('totalCashNeeded'),
        loanAmount: document.getElementById('loanAmount'),
        monthlyPI: document.getElementById('monthlyPI'),
        totalMonthlyExpenses: document.getElementById('totalMonthlyExpenses'),
        monthlyCashFlow: document.getElementById('monthlyCashFlow'),
        cashOnCashROI: document.getElementById('cashOnCashROI'),
        annualNOI: document.getElementById('annualNOI'),
        capRate: document.getElementById('capRate'),
        grossRentMultiplier: document.getElementById('grossRentMultiplier'),
        debtCoverageRatio: document.getElementById('debtCoverageRatio'),
        returnOnEquity: document.getElementById('returnOnEquity')
    };
    
    // Chart instances
    const charts = {
        incomeExpensesChart: null,
        equityValueChart: null,
        amortizationChart: null
    };
    
    // Store calculation data for tooltips and charts
    let calculationData = {};
    let projectionData = [];
    
    // ========================================
    // INPUT VALIDATION FUNCTIONS
    // ========================================
    
    /**
     * Validates a single input field and shows/hides error messages
     * @param {HTMLElement} input - The input element to validate
     * @returns {boolean} True if valid
     */
    function validateInput(input) {
        const value = parseFloat(input.value);
        const fieldName = input.id;
        const errorElement = document.getElementById(`${fieldName}-error`);
        let isValid = true;
        let errorMessage = '';
        
        // Remove previous validation classes
        input.classList.remove('input-error', 'input-valid');
        
        switch (fieldName) {
            case 'purchasePrice':
                isValid = validatePurchasePrice(value);
                errorMessage = isValid ? '' : 'Purchase price must be between $1,000 and $50,000,000';
                break;
                
            case 'downPayment':
                const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
                isValid = validateDownPayment(value, purchasePrice);
                errorMessage = isValid ? '' : 'Down payment cannot exceed purchase price';
                break;
                
            case 'loanInterestRate':
                isValid = validateInterestRate(value);
                errorMessage = isValid ? '' : 'Interest rate must be between 0.1% and 15.0%';
                break;
                
            case 'monthlyRent':
                isValid = validateMonthlyRent(value);
                errorMessage = isValid ? '' : 'Monthly rent must be greater than $0';
                break;
                
            case 'annualIncomeGrowth':
            case 'annualExpenseGrowth':
            case 'annualPropertyValueGrowth':
                isValid = validateGrowthRate(value);
                errorMessage = isValid ? '' : 'Growth rate must be between 0% and 20%';
                break;
                
            default:
                // For other numeric fields, just check if it's a valid positive number or zero
                isValid = !isNaN(value) && value >= 0;
                errorMessage = isValid ? '' : 'Please enter a valid number';
        }
        
        // Update UI based on validation result
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.toggle('show', !isValid);
        }
        
        input.classList.add(isValid ? 'input-valid' : 'input-error');
        
        return isValid;
    }
    
    /**
     * Validates all inputs and returns overall validity
     * @returns {boolean} True if all inputs are valid
     */
    function validateAllInputs() {
        let allValid = true;
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                if (!validateInput(input)) {
                    allValid = false;
                }
            }
        });
        
        return allValid;
    }
    
    // ========================================
    // CALCULATION AND UPDATE FUNCTIONS
    // ========================================
    
    /**
     * Performs all calculations and updates the UI
     * Debounced to prevent excessive calculations during rapid input
     */
    function updateCalculations() {
        // Show calculating state
        Object.values(results).forEach(element => {
            element.parentElement.classList.add('calculating');
        });
        
        try {
            // Collect all input values
            const inputs = collectInputValues();
            
            // Validate inputs before calculating
            if (!validateAllInputs()) {
                // If validation fails, still update with current values but show warnings
                console.warn('Some inputs are invalid, calculations may be inaccurate');
            }
            
            // Perform initial calculations
            const initialMetrics = calculateInitialMetrics(inputs);
            
            // Generate 30-year projections
            const projections = generateProjections(inputs, initialMetrics);
            
            // Update results display
            updateResultsDisplay(initialMetrics);
            
            // Update charts
            updateCharts(projections);
            
            // Store data for tooltips
            calculationData = { ...inputs, ...initialMetrics };
            projectionData = projections;
            
        } catch (error) {
            console.error('Calculation error:', error);
            // Handle calculation errors gracefully
            displayCalculationError();
        } finally {
            // Remove calculating state
            setTimeout(() => {
                Object.values(results).forEach(element => {
                    element.parentElement.classList.remove('calculating');
                });
            }, 100);
        }
    }
    
    /**
     * Collects all input values from the form
     * @returns {object} Object containing all input values
     */
    function collectInputValues() {
        return {
            propertyAddress: document.getElementById('propertyAddress').value || '',
            purchasePrice: parseNumericInput(document.getElementById('purchasePrice').value),
            purchaseClosingCosts: parseNumericInput(document.getElementById('purchaseClosingCosts').value),
            estimatedRepairCosts: parseNumericInput(document.getElementById('estimatedRepairCosts').value),
            downPayment: parseNumericInput(document.getElementById('downPayment').value),
            loanInterestRate: parseNumericInput(document.getElementById('loanInterestRate').value),
            amortizedOver: parseNumericInput(document.getElementById('amortizedOver').value),
            loanFees: parseNumericInput(document.getElementById('loanFees').value),
            monthlyRent: parseNumericInput(document.getElementById('monthlyRent').value),
            monthlyPropertyTaxes: parseNumericInput(document.getElementById('monthlyPropertyTaxes').value),
            monthlyInsurance: parseNumericInput(document.getElementById('monthlyInsurance').value),
            monthlyManagement: parseNumericInput(document.getElementById('monthlyManagement').value),
            quarterlyHoaFees: parseNumericInput(document.getElementById('quarterlyHoaFees').value),
            electricityUtility: parseNumericInput(document.getElementById('electricityUtility').value),
            gasUtility: parseNumericInput(document.getElementById('gasUtility').value),
            waterSewerUtility: parseNumericInput(document.getElementById('waterSewerUtility').value),
            garbageUtility: parseNumericInput(document.getElementById('garbageUtility').value),
            otherMonthlyExpenses: parseNumericInput(document.getElementById('otherMonthlyExpenses').value),
            annualIncomeGrowth: parseNumericInput(document.getElementById('annualIncomeGrowth').value),
            annualExpenseGrowth: parseNumericInput(document.getElementById('annualExpenseGrowth').value),
            annualPropertyValueGrowth: parseNumericInput(document.getElementById('annualPropertyValueGrowth').value)
        };
    }
    
    /**
     * Calculates all initial metrics
     * @param {object} inputs - Input values
     * @returns {object} Calculated metrics
     */
    function calculateInitialMetrics(inputs) {
        // Basic project costs
        const totalCostOfProject = calculateTotalCostOfProject(
            inputs.purchasePrice, 
            inputs.purchaseClosingCosts, 
            inputs.estimatedRepairCosts
        );
        
        const totalCashNeeded = calculateTotalCashNeeded(
            inputs.downPayment, 
            inputs.purchaseClosingCosts, 
            inputs.estimatedRepairCosts, 
            inputs.loanFees
        );
        
        const loanAmount = calculateLoanAmount(inputs.purchasePrice, inputs.downPayment);
        
        // Mortgage calculations
        const monthlyPayment = calculateMortgagePayment(
            loanAmount, 
            inputs.loanInterestRate / 100, 
            inputs.amortizedOver
        );
        
        // Expense calculations
        const monthlyManagementFee = calculateManagementFee(
            inputs.monthlyRent, 
            inputs.monthlyManagement / 100
        );
        
        const monthlyHoaFees = inputs.quarterlyHoaFees / 3; // Convert quarterly to monthly
        
        const utilities = {
            electricity: inputs.electricityUtility,
            gas: inputs.gasUtility,
            waterSewer: inputs.waterSewerUtility,
            garbage: inputs.garbageUtility
        };
        
        const totalMonthlyExpenses = calculateTotalMonthlyExpenses({
            mortgagePayment: monthlyPayment,
            propertyTaxes: inputs.monthlyPropertyTaxes,
            insurance: inputs.monthlyInsurance,
            hoaFees: monthlyHoaFees,
            management: monthlyManagementFee,
            utilities: utilities,
            customExpenses: inputs.otherMonthlyExpenses
        });
        
        // Cash flow and ROI
        const monthlyCashFlow = calculateMonthlyCashFlow(inputs.monthlyRent, totalMonthlyExpenses);
        const annualCashFlow = monthlyCashFlow * 12;
        const cashOnCashROI = totalCashNeeded > 0 ? calculateCashOnCashROI(annualCashFlow, totalCashNeeded) : 0;
        
        // Operating metrics
        const annualIncome = inputs.monthlyRent * 12;
        const annualOperatingExpenses = (totalMonthlyExpenses - monthlyPayment) * 12; // Exclude mortgage from NOI
        const annualNOI = calculateNOI(annualIncome, annualOperatingExpenses);
        const capRate = totalCostOfProject > 0 ? calculateCapRate(annualNOI, totalCostOfProject) : 0;
        
        // Additional metrics
        const grossRentMultiplier = calculateGrossRentMultiplier(inputs.purchasePrice, annualIncome);
        const annualDebtService = monthlyPayment * 12;
        const debtCoverageRatio = calculateDebtCoverageRatio(annualNOI, annualDebtService);
        
        return {
            totalCostOfProject,
            totalCashNeeded,
            loanAmount,
            monthlyPayment,
            totalMonthlyExpenses,
            monthlyCashFlow,
            annualCashFlow,
            cashOnCashROI,
            annualNOI,
            capRate,
            grossRentMultiplier,
            debtCoverageRatio,
            monthlyManagementFee,
            utilities,
            annualIncome,
            annualOperatingExpenses,
            annualDebtService
        };
    }
    
    /**
     * Generates 30-year projections
     * @param {object} inputs - Input values
     * @param {object} initialMetrics - Calculated initial metrics
     * @returns {Array} Array of yearly projections
     */
    function generateProjections(inputs, initialMetrics) {
        const projectionInputs = {
            loanAmount: initialMetrics.loanAmount,
            monthlyRate: (inputs.loanInterestRate / 100) / 12,
            totalPayments: inputs.amortizedOver * 12,
            monthlyPayment: initialMetrics.monthlyPayment,
            monthlyIncome: inputs.monthlyRent,
            monthlyOperatingExpenses: initialMetrics.totalMonthlyExpenses - initialMetrics.monthlyPayment,
            purchasePrice: inputs.purchasePrice,
            incomeGrowthRate: inputs.annualIncomeGrowth,
            expenseGrowthRate: inputs.annualExpenseGrowth,
            propertyValueGrowthRate: inputs.annualPropertyValueGrowth
        };
        
        const projections = generate30YearProjections(projectionInputs);
        
        // Calculate first year return on equity for display
        if (projections.length > 0) {
            const firstYear = projections[0];
            const appreciation = inputs.purchasePrice * (inputs.annualPropertyValueGrowth / 100);
            const totalReturn = firstYear.annualCashFlow + firstYear.principalPayment + appreciation;
            const initialEquity = inputs.downPayment + inputs.estimatedRepairCosts;
            const returnOnEquity = initialEquity > 0 ? (totalReturn / initialEquity) * 100 : 0;
            
            // Store for display
            calculationData.returnOnEquity = returnOnEquity;
        }
        
        return projections;
    }
    
    /**
     * Updates the results display with calculated values
     * @param {object} metrics - Calculated metrics
     */
    function updateResultsDisplay(metrics) {
        results.totalCostOfProject.textContent = formatCurrency(metrics.totalCostOfProject);
        results.totalCashNeeded.textContent = formatCurrency(metrics.totalCashNeeded);
        results.loanAmount.textContent = formatCurrency(metrics.loanAmount);
        results.monthlyPI.textContent = formatCurrency(metrics.monthlyPayment);
        results.totalMonthlyExpenses.textContent = formatCurrency(metrics.totalMonthlyExpenses);
        results.monthlyCashFlow.textContent = formatCurrency(metrics.monthlyCashFlow);
        results.cashOnCashROI.textContent = formatPercentage(metrics.cashOnCashROI);
        results.annualNOI.textContent = formatCurrency(metrics.annualNOI);
        results.capRate.textContent = formatPercentage(metrics.capRate);
        results.grossRentMultiplier.textContent = formatNumber(metrics.grossRentMultiplier, 2);
        results.debtCoverageRatio.textContent = formatNumber(metrics.debtCoverageRatio, 2);
        results.returnOnEquity.textContent = formatPercentage(calculationData.returnOnEquity || 0);
        
        // Update calculation text displays
        updateCalculationTexts();
    }
    
    /**
     * Helper function to format percentage values
     * @param {number} value - The percentage value to format
     * @returns {string} Formatted percentage string
     */
    function formatPercentage(value) {
        if (isNaN(value) || value === null || value === undefined) {
            return '0.0%';
        }
        return `${value.toFixed(1)}%`;
    }
    
    /**
     * Helper function to format currency values
     * @param {number} value - The currency value to format
     * @returns {string} Formatted currency string
     */
    function formatCurrency(value) {
        if (isNaN(value) || value === null || value === undefined) {
            return '$0.00';
        }
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    /**
     * Helper function to format number values
     * @param {number} value - The number value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    function formatNumber(value, decimals = 2) {
        if (isNaN(value) || value === null || value === undefined) {
            return '0.00';
        }
        return value.toFixed(decimals);
    }
    
    /**
     * Updates the additional calculation text displays
     * Always reads current DOM values to ensure accuracy
     */
    function updateCalculationTexts() {
        // Get current values directly from DOM elements
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const monthlyPropertyTaxes = parseFloat(document.getElementById('monthlyPropertyTaxes').value) || 0;
        const quarterlyHoaFees = parseFloat(document.getElementById('quarterlyHoaFees').value) || 0;
        const purchaseClosingCosts = parseFloat(document.getElementById('purchaseClosingCosts').value) || 0;
        const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
        
        // Debug logging (can be removed later)
        console.log('updateCalculationTexts values:', {
            purchasePrice,
            monthlyPropertyTaxes,
            quarterlyHoaFees,
            purchaseClosingCosts,
            downPayment
        });
        
        // Tax rate calculation (use absolute value to handle negative inputs)
        const annualizedTaxRate = (purchasePrice > 0 && monthlyPropertyTaxes !== 0) ? 
            (Math.abs(monthlyPropertyTaxes) * 12 / purchasePrice) * 100 : 0;
        const taxRateElement = document.getElementById('annualizedTaxRate');
        if (taxRateElement) {
            console.log('Tax calculation:', {
                monthlyPropertyTaxes,
                purchasePrice,
                annualTaxes: Math.abs(monthlyPropertyTaxes) * 12,
                rate: annualizedTaxRate
            });
            taxRateElement.textContent = `Annualized tax rate: ${formatPercentage(annualizedTaxRate)}`;
        }
        
        // HOA fee text
        const hoaTextElement = document.getElementById('hoaFeeText');
        if (hoaTextElement) {
            const monthlyHoa = quarterlyHoaFees / 3;
            hoaTextElement.textContent = `Monthly: ${formatCurrency(monthlyHoa)} | Annually: ${formatCurrency(quarterlyHoaFees * 4)}`;
        }
        
        // Closing costs percentage
        const closingCostsElement = document.getElementById('closingCostsText');
        if (closingCostsElement) {
            const percentage = purchasePrice > 0 ? 
                (purchaseClosingCosts / purchasePrice) * 100 : 0;
            closingCostsElement.textContent = `Equivalent to: ${formatPercentage(percentage)} of purchase price`;
        }
        
        // Down payment percentage
        const downPaymentElement = document.getElementById('downPaymentText');
        if (downPaymentElement) {
            const percentage = purchasePrice > 0 ? 
                (downPayment / purchasePrice) * 100 : 0;
            downPaymentElement.textContent = `Equivalent to: ${formatPercentage(percentage)} of purchase price`;
        }
    }
    
    /**
     * Displays an error message when calculations fail
     */
    function displayCalculationError() {
        Object.values(results).forEach(element => {
            element.textContent = 'Error';
            element.style.color = '#f56565';
        });
    }
    
    // ========================================
    // CHART MANAGEMENT
    // ========================================
    
    /**
     * Updates all charts with new projection data
     * @param {Array} projections - 30-year projection data
     */
    function updateCharts(projections) {
        const years = projections.map(p => p.year);
        
        // Common chart configuration
        const chartConfig = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Years',
                        color: '#e2e8f0'
                    },
                    ticks: { color: '#a0aec0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount ($)',
                        color: '#e2e8f0'
                    },
                    ticks: {
                        color: '#a0aec0',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        };
        
        // Chart 1: Income, Expenses, Cash Flow
        updateIncomeExpensesChart(years, projections, chartConfig);
        
        // Chart 2: Equity & Property Value
        updateEquityValueChart(years, projections, chartConfig);
        
        // Chart 3: Loan Amortization
        updateAmortizationChart(years, projections, chartConfig);
    }
    
    /**
     * Updates the income/expenses/cash flow chart
     */
    function updateIncomeExpensesChart(years, projections, baseConfig) {
        if (charts.incomeExpensesChart) {
            charts.incomeExpensesChart.destroy();
        }
        
        const ctx = document.getElementById('incomeExpensesChart').getContext('2d');
        charts.incomeExpensesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Annual Income',
                        data: projections.map(p => p.annualIncome),
                        borderColor: '#48bb78',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Annual Expenses',
                        data: projections.map(p => p.annualExpenses),
                        borderColor: '#f56565',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Annual Cash Flow',
                        data: projections.map(p => p.annualCashFlow),
                        borderColor: '#4299e1',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1
                    }
                ]
            },
            options: baseConfig
        });
    }
    
    /**
     * Updates the equity/property value chart
     */
    function updateEquityValueChart(years, projections, baseConfig) {
        if (charts.equityValueChart) {
            charts.equityValueChart.destroy();
        }
        
        const ctx = document.getElementById('equityValueChart').getContext('2d');
        charts.equityValueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Property Value',
                        data: projections.map(p => p.propertyValue),
                        borderColor: '#ed8936',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Equity',
                        data: projections.map(p => p.equity),
                        borderColor: '#ecc94b',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Loan Balance',
                        data: projections.map(p => p.loanBalance),
                        borderColor: '#f56565',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1
                    }
                ]
            },
            options: baseConfig
        });
    }
    
    /**
     * Updates the loan amortization chart
     */
    function updateAmortizationChart(years, projections, baseConfig) {
        if (charts.amortizationChart) {
            charts.amortizationChart.destroy();
        }
        
        const ctx = document.getElementById('amortizationChart').getContext('2d');
        
        // Modify config for stacked bar chart
        const stackedConfig = {
            ...baseConfig,
            scales: {
                ...baseConfig.scales,
                x: {
                    ...baseConfig.scales.x,
                    stacked: true
                },
                y: {
                    ...baseConfig.scales.y,
                    stacked: true
                }
            }
        };
        
        charts.amortizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Interest Payment',
                        data: projections.map(p => p.interestPayment),
                        backgroundColor: '#f56565',
                        borderWidth: 0
                    },
                    {
                        label: 'Principal Payment',
                        data: projections.map(p => p.principalPayment),
                        backgroundColor: '#48bb78',
                        borderWidth: 0
                    }
                ]
            },
            options: stackedConfig
        });
    }
    
    // ========================================
    // TOOLTIP FUNCTIONALITY
    // ========================================
    
    /**
     * Shows tooltip with calculation breakdown
     * @param {Event} e - Mouse event
     * @param {string} content - Tooltip content
     */
    function showTooltip(e, content) {
        tooltip.innerHTML = content;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
    }
    
    /**
     * Hides the tooltip
     */
    function hideTooltip() {
        tooltip.style.opacity = '0';
    }
    
    /**
     * Generates tooltip content based on metric ID
     * @param {string} id - Tooltip identifier
     * @returns {string} HTML content for tooltip
     */
    function generateTooltipContent(id) {
        if (!calculationData) return 'Calculation data not available';
        
        const d = calculationData;
        
        switch(id) {
            case 'totalCost':
                return `Purchase Price: ${formatCurrency(d.purchasePrice)}
+ Closing Costs: ${formatCurrency(d.purchaseClosingCosts)}
+ Repair Costs: ${formatCurrency(d.estimatedRepairCosts)}
= Total: ${formatCurrency(d.totalCostOfProject)}`;
                
            case 'cashNeeded':
                return `Down Payment: ${formatCurrency(d.downPayment)}
+ Closing Costs: ${formatCurrency(d.purchaseClosingCosts)}
+ Repair Costs: ${formatCurrency(d.estimatedRepairCosts)}
+ Loan Fees: ${formatCurrency(d.loanFees)}
= Total: ${formatCurrency(d.totalCashNeeded)}`;
                
            case 'loanAmount':
                return `Purchase Price: ${formatCurrency(d.purchasePrice)}
- Down Payment: ${formatCurrency(d.downPayment)}
= Loan Amount: ${formatCurrency(d.loanAmount)}`;
                
            case 'monthlyPI':
                return `Loan Amount: ${formatCurrency(d.loanAmount)}
Interest Rate: ${d.loanInterestRate}%
Term: ${d.amortizedOver} years
= Monthly P&I: ${formatCurrency(d.monthlyPayment)}`;
                
            case 'monthlyExpenses':
                const utilTotal = Object.values(d.utilities || {}).reduce((sum, val) => sum + val, 0);
                const monthlyHoa = d.quarterlyHoaFees / 3;
                return `Mortgage P&I: ${formatCurrency(d.monthlyPayment)}
+ Property Taxes: ${formatCurrency(d.monthlyPropertyTaxes)}
+ Insurance: ${formatCurrency(d.monthlyInsurance)}
+ Management: ${formatCurrency(d.monthlyManagementFee)}
+ HOA Fees: ${formatCurrency(monthlyHoa)}
+ Utilities: ${formatCurrency(utilTotal)}
+ Other: ${formatCurrency(d.otherMonthlyExpenses)}
= Total: ${formatCurrency(d.totalMonthlyExpenses)}`;
                
            case 'cashFlow':
                return `Monthly Rent: ${formatCurrency(d.monthlyRent)}
- Total Expenses: ${formatCurrency(d.totalMonthlyExpenses)}
= Cash Flow: ${formatCurrency(d.monthlyCashFlow)}`;
                
            case 'cashROI':
                return `Annual Cash Flow: ${formatCurrency(d.annualCashFlow)}
÷ Total Cash Needed: ${formatCurrency(d.totalCashNeeded)}
= Cash-on-Cash ROI: ${formatPercentage(d.cashOnCashROI)}`;
                
            case 'annualNOI':
                return `Annual Income: ${formatCurrency(d.annualIncome)}
- Operating Expenses: ${formatCurrency(d.annualOperatingExpenses)}
= NOI: ${formatCurrency(d.annualNOI)}`;
                
            case 'capRate':
                return `Annual NOI: ${formatCurrency(d.annualNOI)}
÷ Total Cost: ${formatCurrency(d.totalCostOfProject)}
= Cap Rate: ${formatPercentage(d.capRate)}`;
                
            case 'grm':
                return `Purchase Price: ${formatCurrency(d.purchasePrice)}
÷ Annual Income: ${formatCurrency(d.annualIncome)}
= GRM: ${formatNumber(d.grossRentMultiplier, 2)}`;
                
            case 'dcr':
                return `Annual NOI: ${formatCurrency(d.annualNOI)}
÷ Annual Debt Service: ${formatCurrency(d.annualDebtService)}
= DCR: ${formatNumber(d.debtCoverageRatio, 2)}`;
                
            case 'roe':
                return `(Cash Flow + Principal + Appreciation) ÷ Equity
First Year ROE: ${formatPercentage(d.returnOnEquity || 0)}`;
                
            default:
                return 'Calculation details not available';
        }
    }
    
    // ========================================
    // SAVE AS MARKDOWN FUNCTIONALITY
    // ========================================
    
    /**
     * Generates a Markdown report from the current data and triggers a download
     */
    function saveAsMarkdown() {
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        
        const inputs = calculationData;
        const propertyAddress = inputs.propertyAddress || "N/A";
        
        const reportContent = `
# Rental Property Financial Analysis Report
*Generated on: ${date} at ${time}*

## Property Information
* **Property Address:** ${propertyAddress}
* **Purchase Price:** ${formatCurrency(inputs.purchasePrice)}
* **Purchase Closing Costs:** ${formatCurrency(inputs.purchaseClosingCosts)}
* **Estimated Repair Costs:** ${formatCurrency(inputs.estimatedRepairCosts)}

## Financing Information
* **Down Payment:** ${formatCurrency(inputs.downPayment)}
* **Loan Interest Rate:** ${formatPercentage(inputs.loanInterestRate)}
* **Amortized Over:** ${inputs.amortizedOver} years
* **Loan Fees:** ${formatCurrency(inputs.loanFees)}

## Income & Expenses
* **Monthly Rent:** ${formatCurrency(inputs.monthlyRent)}
* **Monthly Property Taxes:** ${formatCurrency(inputs.monthlyPropertyTaxes)}
* **Monthly Insurance:** ${formatCurrency(inputs.monthlyInsurance)}
* **Quarterly HOA Fees:** ${formatCurrency(inputs.quarterlyHoaFees)}
* **Monthly Management Fee:** ${formatPercentage(inputs.monthlyManagement)}
* **Other Monthly Expenses:** ${formatCurrency(inputs.otherMonthlyExpenses)}

## Growth Projections
* **Annual Income Growth:** ${formatPercentage(inputs.annualIncomeGrowth)}
* **Annual Expense Growth:** ${formatPercentage(inputs.annualExpenseGrowth)}
* **Annual Property Value Growth:** ${formatPercentage(inputs.annualPropertyValueGrowth)}

## Key Financial Metrics
* **Total Cost of Project:** ${results.totalCostOfProject.textContent}
* **Total Cash Needed:** ${results.totalCashNeeded.textContent}
* **Loan Amount:** ${results.loanAmount.textContent}
* **Monthly P&I:** ${results.monthlyPI.textContent}
* **Total Monthly Expenses:** ${results.totalMonthlyExpenses.textContent}
* **Monthly Cash Flow:** ${results.monthlyCashFlow.textContent}
* **Cash-on-Cash ROI:** ${results.cashOnCashROI.textContent}
* **Annual NOI:** ${results.annualNOI.textContent}
* **Pro Forma Cap Rate:** ${results.capRate.textContent}
* **Gross Rent Multiplier (GRM):** ${results.grossRentMultiplier.textContent}
* **Debt Coverage Ratio (DCR):** ${results.debtCoverageRatio.textContent}
* **Return on Equity (ROE) (Year 1):** ${results.returnOnEquity.textContent}

## 30-Year Projections (Selected Years)
| Year | Property Value | Equity | Annual Cash Flow |
|---|---|---|---|
${projectionData.filter(d => d.year === 1 || d.year === 5 || d.year === 10 || d.year === 20 || d.year === 30)
    .map(d => `| ${d.year} | ${formatCurrency(d.propertyValue)} | ${formatCurrency(d.equity)} | ${formatCurrency(d.annualCashFlow)} |`).join('\n')}

---
*Report generated by Rental Property Analysis Calculator*
*This analysis is for informational purposes only and does not constitute investment advice.*
`;

        // Create and download the file
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = propertyAddress.replace(/[^a-zA-Z0-9]/g, '_') || 'rental_property';
        a.download = `${filename}_analysis_${date.replace(/\//g, '-')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    // Debounced calculation update
    let calculationTimeout;
    function debouncedCalculationUpdate() {
        clearTimeout(calculationTimeout);
        calculationTimeout = setTimeout(updateCalculations, 150);
    }
    
    // Input change listeners
    inputs.forEach(input => {
        // Real-time validation on input
        input.addEventListener('input', function() {
            if (this.type === 'number') {
                validateInput(this);
            }
            
            // Update calculation texts for relevant fields
            const relevantFields = ['purchasePrice', 'downPayment', 'purchaseClosingCosts', 'monthlyPropertyTaxes', 'quarterlyHoaFees'];
            if (relevantFields.includes(this.id)) {
                updateCalculationTexts();
            }
            
            debouncedCalculationUpdate();
        });
        
        // Validation on blur for better UX
        input.addEventListener('blur', function() {
            if (this.type === 'number') {
                validateInput(this);
            }
        });
    });
    
    // Text input listeners (for property address)
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('input', debouncedCalculationUpdate);
    });
    
    // Save button listeners
    if (saveTopBtn) {
        saveTopBtn.addEventListener('click', saveAsMarkdown);
    }
    if (saveBottomBtn) {
        saveBottomBtn.addEventListener('click', saveAsMarkdown);
    }
    
    // Quick entry button listeners
    quickEntryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const targetId = this.getAttribute('data-target');
            const valueType = this.getAttribute('data-type');
            const value = parseFloat(this.getAttribute('data-value'));
            const targetInput = document.getElementById(targetId);
            
            let newValue;
            if (valueType === 'percent') {
                const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
                newValue = (purchasePrice * value / 100);
                targetInput.value = newValue.toFixed(2);
            } else {
                newValue = value;
                targetInput.value = value;
            }
            
            // Trigger validation and calculation update
            if (targetInput.type === 'number') {
                validateInput(targetInput);
            }
            
            // Immediately update calculation texts 
            // This ensures the subtext updates right after the input value changes
            updateCalculationTexts();
            
            debouncedCalculationUpdate();
        });
    });
    
    // Tooltip event listeners
    metricLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            const tooltipId = this.getAttribute('data-tooltip-id');
            const content = generateTooltipContent(tooltipId);
            showTooltip(e, content);
        });
        
        link.addEventListener('mouseleave', hideTooltip);
        
        link.addEventListener('mousemove', function(e) {
            if (tooltip.style.opacity === '1') {
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            }
        });
    });
    
    // Prevent default link behavior
    metricLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Initial calculation on page load
    setTimeout(() => {
        updateCalculations();
    }, 100);
    
    // Performance monitoring (development only)
    if (window.console && window.performance) {
        const originalUpdateCalculations = updateCalculations;
        updateCalculations = function() {
            const start = performance.now();
            originalUpdateCalculations();
            const end = performance.now();
            console.log(`Calculation time: ${(end - start).toFixed(2)}ms`);
        };
    }
    
    console.log('✅ Rental Property Analysis Calculator initialized');
});
