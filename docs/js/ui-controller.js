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
    const loadBtn = document.getElementById('loadBtn');
    const loadBottomBtn = document.getElementById('loadBottomBtn');
    const printBtn = document.getElementById('printBtn');
    const markdownFileInput = document.getElementById('markdownFileInput');
    const quickEntryButtons = document.querySelectorAll('.btn-quick-entry');
    
    // Temporary financing elements
    const useTemporaryFinancingCheckbox = document.getElementById('useTemporaryFinancing');
    const temporaryFinancingFields = document.getElementById('temporaryFinancingFields');
    
    // Property tax dual input elements
    const taxInputToggle = document.getElementById('taxInputToggle');
    const monthlyTaxInput = document.getElementById('monthlyTaxInput');
    const rateTaxInput = document.getElementById('rateTaxInput');
    const monthlyPropertyTaxes = document.getElementById('monthlyPropertyTaxes');
    const annualTaxRate = document.getElementById('annualTaxRate');
    const propertyTaxCalculation = document.getElementById('propertyTaxCalculation');
    
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

    /**
     * Loads data from a markdown file and populates the form
     */
    function loadFromMarkdown(fileContent) {
        try {
            // Parse the markdown content to extract data
            const data = parseMarkdownReport(fileContent);
            
            if (!data) {
                alert('Unable to parse the markdown file. Please ensure it was generated by this calculator.');
                return;
            }
            
            // Populate form fields with the parsed data
            populateFormFromData(data);
            
            // Trigger calculation update
            updateCalculations();
            
            console.log('Successfully loaded data from markdown file');
            
        } catch (error) {
            console.error('Error loading from markdown:', error);
            alert('Error loading the markdown file. Please check the file format and try again.');
        }
    }

    /**
     * Parses a markdown report to extract property data
     */
    function parseMarkdownReport(content) {
        const data = {};
        
        try {
            // Property Information section
            const propertyMatch = content.match(/\*\*Address:\*\* (.+)/);
            if (propertyMatch) data.propertyAddress = propertyMatch[1];
            
            const purchasePriceMatch = content.match(/\*\*Purchase Price:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (purchasePriceMatch) data.purchasePrice = parseFloat(purchasePriceMatch[1].replace(/,/g, ''));
            
            const closingCostsMatch = content.match(/\*\*Closing Costs:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (closingCostsMatch) data.purchaseClosingCosts = parseFloat(closingCostsMatch[1].replace(/,/g, ''));
            
            const repairCostsMatch = content.match(/\*\*Repair Costs:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (repairCostsMatch) data.estimatedRepairCosts = parseFloat(repairCostsMatch[1].replace(/,/g, ''));
            
            // Financing section
            const downPaymentMatch = content.match(/\*\*Down Payment:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (downPaymentMatch) data.downPayment = parseFloat(downPaymentMatch[1].replace(/,/g, ''));
            
            const interestRateMatch = content.match(/\*\*Interest Rate:\*\* ([0-9.]+)%/);
            if (interestRateMatch) data.loanInterestRate = parseFloat(interestRateMatch[1]);
            
            const amortizedMatch = content.match(/\*\*Loan Term:\*\* ([0-9]+) years/);
            if (amortizedMatch) data.amortizedOver = parseInt(amortizedMatch[1]);
            
            // Income section
            const monthlyRentMatch = content.match(/\*\*Monthly Rent:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (monthlyRentMatch) data.monthlyRent = parseFloat(monthlyRentMatch[1].replace(/,/g, ''));
            
            // Expenses section
            const propertyTaxesMatch = content.match(/\*\*Property Taxes:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (propertyTaxesMatch) data.monthlyPropertyTaxes = parseFloat(propertyTaxesMatch[1].replace(/,/g, ''));
            
            const insuranceMatch = content.match(/\*\*Insurance:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (insuranceMatch) data.monthlyInsurance = parseFloat(insuranceMatch[1].replace(/,/g, ''));
            
            const hoaMatch = content.match(/\*\*HOA Fees \(Monthly\):\*\* \$([0-9,]+\.?[0-9]*)/);
            if (hoaMatch) {
                const monthlyHoa = parseFloat(hoaMatch[1].replace(/,/g, ''));
                data.quarterlyHoaFees = monthlyHoa * 3; // Convert monthly to quarterly
            }
            
            const managementMatch = content.match(/\*\*Management:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (managementMatch) data.monthlyManagement = parseFloat(managementMatch[1].replace(/,/g, ''));
            
            const otherExpensesMatch = content.match(/\*\*Other Expenses:\*\* \$([0-9,]+\.?[0-9]*)/);
            if (otherExpensesMatch) data.otherMonthlyExpenses = parseFloat(otherExpensesMatch[1].replace(/,/g, ''));
            
            // Growth projections section
            const incomeGrowthMatch = content.match(/\*\*Annual Income Growth:\*\* ([0-9.]+)%/);
            if (incomeGrowthMatch) data.annualIncomeGrowth = parseFloat(incomeGrowthMatch[1]);
            
            const expenseGrowthMatch = content.match(/\*\*Annual Expense Growth:\*\* ([0-9.]+)%/);
            if (expenseGrowthMatch) data.annualExpenseGrowth = parseFloat(expenseGrowthMatch[1]);
            
            const valueGrowthMatch = content.match(/\*\*Annual Property Value Growth:\*\* ([0-9.]+)%/);
            if (valueGrowthMatch) data.annualPropertyValueGrowth = parseFloat(valueGrowthMatch[1]);
            
            return data;
            
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return null;
        }
    }

    /**
     * Populates form fields from parsed data
     */
    function populateFormFromData(data) {
        // Property Information
        if (data.propertyAddress !== undefined) setInputValue('propertyAddress', data.propertyAddress);
        if (data.purchasePrice !== undefined) setInputValue('purchasePrice', data.purchasePrice);
        if (data.purchaseClosingCosts !== undefined) setInputValue('purchaseClosingCosts', data.purchaseClosingCosts);
        if (data.estimatedRepairCosts !== undefined) setInputValue('estimatedRepairCosts', data.estimatedRepairCosts);
        
        // Financing
        if (data.downPayment !== undefined) setInputValue('downPayment', data.downPayment);
        if (data.loanInterestRate !== undefined) setInputValue('loanInterestRate', data.loanInterestRate);
        if (data.amortizedOver !== undefined) setInputValue('amortizedOver', data.amortizedOver);
        
        // Income
        if (data.monthlyRent !== undefined) setInputValue('monthlyRent', data.monthlyRent);
        
        // Expenses
        if (data.monthlyPropertyTaxes !== undefined) setInputValue('monthlyPropertyTaxes', data.monthlyPropertyTaxes);
        if (data.monthlyInsurance !== undefined) setInputValue('monthlyInsurance', data.monthlyInsurance);
        if (data.quarterlyHoaFees !== undefined) setInputValue('quarterlyHoaFees', data.quarterlyHoaFees);
        if (data.monthlyManagement !== undefined) setInputValue('monthlyManagement', data.monthlyManagement);
        if (data.otherMonthlyExpenses !== undefined) setInputValue('otherMonthlyExpenses', data.otherMonthlyExpenses);
        
        // Growth projections
        if (data.annualIncomeGrowth !== undefined) setInputValue('annualIncomeGrowth', data.annualIncomeGrowth);
        if (data.annualExpenseGrowth !== undefined) setInputValue('annualExpenseGrowth', data.annualExpenseGrowth);
        if (data.annualPropertyValueGrowth !== undefined) setInputValue('annualPropertyValueGrowth', data.annualPropertyValueGrowth);
    }

    /**
     * Helper function to set input value safely
     */
    function setInputValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (element.type === 'text') {
                element.value = value;
            } else if (element.type === 'number') {
                element.value = parseFloat(value) || 0;
            } else if (element.tagName === 'SELECT') {
                element.value = value;
            }
        }
    }

    /**
     * Handles file selection for markdown import
     */
    function handleMarkdownFileSelection(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.txt')) {
            alert('Please select a markdown (.md) or text (.txt) file.');
            return;
        }
        
        // Read the file
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            loadFromMarkdown(content);
        };
        reader.onerror = function(e) {
            console.error('Error reading file:', e);
            alert('Error reading the file. Please try again.');
        };
        reader.readAsText(file);
        
        // Clear the file input for next use
        event.target.value = '';
    }

    /**
     * Updates temporary financing calculations and displays
     */
    function updateTemporaryFinancingCalculations() {
        if (!useTemporaryFinancingCheckbox.checked) {
            return;
        }

        const inputs = collectTemporaryFinancingInputs();
        const analysis = calculateTemporaryFinancingAnalysis(inputs);
        const validation = validateTemporaryFinancingInputs(inputs);

        // Update summary display
        updateTemporaryFinancingSummary(analysis);

        // Show validation warnings/errors
        displayTemporaryFinancingValidation(validation);

        // Update main calculations if temporary financing is enabled
        updateCalculations();
    }

    /**
     * Collects temporary financing input values
     */
    function collectTemporaryFinancingInputs() {
        return {
            initialCashInvestment: parseFloat(document.getElementById('initialCashInvestment')?.value) || 0,
            renovationCosts: parseFloat(document.getElementById('renovationCosts')?.value) || 0,
            tempFinancingAmount: parseFloat(document.getElementById('tempFinancingAmount')?.value) || 0,
            tempInterestRate: parseFloat(document.getElementById('tempInterestRate')?.value) || 0,
            originationPoints: parseFloat(document.getElementById('originationPoints')?.value) || 0,
            tempLoanTermMonths: parseInt(document.getElementById('tempLoanTermMonths')?.value) || 6,
            afterRepairValue: parseFloat(document.getElementById('afterRepairValue')?.value) || 0,
            cashOutLTV: parseFloat(document.getElementById('cashOutLTV')?.value) || 75,
            purchasePrice: parseFloat(document.getElementById('purchasePrice')?.value) || 0
        };
    }

    /**
     * Updates the temporary financing summary display
     */
    function updateTemporaryFinancingSummary(analysis) {
        const elements = {
            totalInitialInvestment: document.getElementById('totalInitialInvestment'),
            tempFinancingCosts: document.getElementById('tempFinancingCosts'),
            cashReturnedAtRefinance: document.getElementById('cashReturnedAtRefinance'),
            finalCashLeftInDeal: document.getElementById('finalCashLeftInDeal'),
            newLoanAmount: document.getElementById('newLoanAmount'),
            analysisStartDate: document.getElementById('analysisStartDate')
        };

        if (elements.totalInitialInvestment) {
            elements.totalInitialInvestment.textContent = formatCurrency(analysis.totalInitialInvestment);
        }
        if (elements.tempFinancingCosts) {
            elements.tempFinancingCosts.textContent = formatCurrency(analysis.tempFinancingCosts.totalCost);
        }
        if (elements.cashReturnedAtRefinance) {
            elements.cashReturnedAtRefinance.textContent = formatCurrency(analysis.refinanceResults.cashReturned);
        }
        if (elements.finalCashLeftInDeal) {
            elements.finalCashLeftInDeal.textContent = formatCurrency(analysis.finalCashLeftInDeal);
        }
        if (elements.newLoanAmount) {
            elements.newLoanAmount.textContent = formatCurrency(analysis.refinanceResults.newLoanAmount);
        }
        if (elements.analysisStartDate) {
            const dateStr = analysis.analysisStartDate.toLocaleDateString();
            elements.analysisStartDate.textContent = dateStr;
        }
    }

    /**
     * Displays temporary financing validation messages
     */
    function displayTemporaryFinancingValidation(validation) {
        // Clear existing validation messages
        const errorContainers = document.querySelectorAll('#temporaryFinancingFields .error-message');
        errorContainers.forEach(container => {
            container.textContent = '';
        });

        // Display errors and warnings
        if (validation.errors.length > 0 || validation.warnings.length > 0) {
            console.log('Temporary Financing Validation:', validation);
            // For now, just log. Later we can add UI elements to display these
        }
    }
    
    // ========================================
    // ========================================
    // PROPERTY TAX DUAL INPUT SYSTEM
    // ========================================
    
    /**
     * Calculate monthly tax amount from annual tax rate
     * @param {number} propertyValue - Property purchase price
     * @param {number} annualTaxRate - Annual tax rate as percentage (e.g., 1.25 for 1.25%)
     * @returns {number} Monthly tax amount
     */
    function calculateMonthlyFromRate(propertyValue, annualTaxRate) {
        if (!propertyValue || !annualTaxRate || propertyValue <= 0) return 0;
        const annualTax = propertyValue * (annualTaxRate / 100);
        return annualTax / 12;
    }
    
    /**
     * Calculate annual tax rate from monthly tax amount
     * @param {number} propertyValue - Property purchase price
     * @param {number} monthlyTaxAmount - Monthly tax amount in dollars
     * @returns {number} Annual tax rate as percentage
     */
    function calculateRateFromMonthly(propertyValue, monthlyTaxAmount) {
        if (!propertyValue || !monthlyTaxAmount || propertyValue <= 0) return 0;
        const annualTax = monthlyTaxAmount * 12;
        return (annualTax / propertyValue) * 100;
    }
    
    /**
     * Handles the tax input toggle between monthly amount and annual rate
     */
    function handleTaxInputToggle() {
        const currentMode = taxInputToggle.getAttribute('data-mode');
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        
        if (currentMode === 'monthly') {
            // Switch to rate mode
            taxInputToggle.setAttribute('data-mode', 'rate');
            taxInputToggle.textContent = 'Annual %';
            
            // Hide monthly input, show rate input
            monthlyTaxInput.classList.add('hidden');
            rateTaxInput.classList.remove('hidden');
            
            // Calculate rate from current monthly amount
            const currentMonthly = parseFloat(monthlyPropertyTaxes.value) || 0;
            if (purchasePrice > 0 && currentMonthly > 0) {
                const calculatedRate = calculateRateFromMonthly(purchasePrice, currentMonthly);
                annualTaxRate.value = calculatedRate.toFixed(2);
            }
        } else {
            // Switch to monthly mode
            taxInputToggle.setAttribute('data-mode', 'monthly');
            taxInputToggle.textContent = 'Monthly $';
            
            // Hide rate input, show monthly input
            rateTaxInput.classList.add('hidden');
            monthlyTaxInput.classList.remove('hidden');
            
            // Calculate monthly from current rate
            const currentRate = parseFloat(annualTaxRate.value) || 0;
            if (purchasePrice > 0 && currentRate > 0) {
                const calculatedMonthly = calculateMonthlyFromRate(purchasePrice, currentRate);
                monthlyPropertyTaxes.value = Math.round(calculatedMonthly);
            }
        }
        
        // Update calculations and display
        updatePropertyTaxCalculation();
        debouncedCalculationUpdate();
    }
    
    /**
     * Updates the property tax calculation display
     */
    function updatePropertyTaxCalculation() {
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const currentMode = taxInputToggle.getAttribute('data-mode');
        
        if (purchasePrice <= 0) {
            propertyTaxCalculation.textContent = 'Enter property purchase price to see tax calculations';
            return;
        }
        
        let displayText = '';
        
        if (currentMode === 'monthly') {
            // Show calculated annual rate
            const monthlyAmount = parseFloat(monthlyPropertyTaxes.value) || 0;
            if (monthlyAmount > 0) {
                const annualAmount = monthlyAmount * 12;
                const taxRate = calculateRateFromMonthly(purchasePrice, monthlyAmount);
                displayText = `Annual: ${formatCurrency(annualAmount)} | Tax Rate: ${taxRate.toFixed(2)}%`;
            } else {
                displayText = 'Enter monthly tax amount';
            }
        } else {
            // Show calculated monthly amount
            const taxRate = parseFloat(annualTaxRate.value) || 0;
            if (taxRate > 0) {
                const monthlyAmount = calculateMonthlyFromRate(purchasePrice, taxRate);
                const annualAmount = monthlyAmount * 12;
                displayText = `Monthly: ${formatCurrency(monthlyAmount)} | Annual: ${formatCurrency(annualAmount)}`;
            } else {
                displayText = 'Enter annual tax rate';
            }
        }
        
        propertyTaxCalculation.textContent = displayText;
    }
    
    /**
     * Handles changes to the monthly property tax input
     */
    function handleMonthlyTaxChange() {
        const currentMode = taxInputToggle.getAttribute('data-mode');
        if (currentMode === 'monthly') {
            updatePropertyTaxCalculation();
            debouncedCalculationUpdate();
        }
    }
    
    /**
     * Handles changes to the annual tax rate input
     */
    function handleAnnualTaxRateChange() {
        const currentMode = taxInputToggle.getAttribute('data-mode');
        if (currentMode === 'rate') {
            // Update the monthly tax field to keep it in sync
            const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
            const taxRate = parseFloat(annualTaxRate.value) || 0;
            
            if (purchasePrice > 0 && taxRate > 0) {
                const calculatedMonthly = calculateMonthlyFromRate(purchasePrice, taxRate);
                monthlyPropertyTaxes.value = Math.round(calculatedMonthly);
            }
            
            updatePropertyTaxCalculation();
            debouncedCalculationUpdate();
        }
    }
    
    /**
     * Handles changes to purchase price that affect tax calculations
     */
    function handlePurchasePriceChangeForTax() {
        // Update tax calculation display when purchase price changes
        updatePropertyTaxCalculation();
    }
    
    // ========================================
    // PRINT FUNCTIONALITY
    // ========================================
    
    /**
     * Prepares the page for printing by optimizing layout and content
     */
    function prepareForPrint() {
        try {
            // Set print date
            const printDateElement = document.getElementById('printReportDate');
            if (printDateElement) {
                printDateElement.textContent = `Generated on: ${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            }
            
            // Optimize charts for print
            optimizeChartsForPrint();
            
            // Add print-specific classes
            document.body.classList.add('print-mode');
            
            // Hide interactive elements
            const elementsToHide = document.querySelectorAll('.btn-quick-entry, .error-message');
            elementsToHide.forEach(el => el.classList.add('no-print'));
            
            // Show print-specific elements
            const printElements = document.querySelectorAll('.print-header, .print-footer');
            printElements.forEach(el => el.style.display = 'block');
            
            return true;
        } catch (error) {
            console.error('Error preparing for print:', error);
            return false;
        }
    }
    
    /**
     * Reverts print optimizations after printing
     */
    function revertPrintOptimizations() {
        try {
            // Remove print-specific classes
            document.body.classList.remove('print-mode');
            
            // Show interactive elements
            const hiddenElements = document.querySelectorAll('.no-print');
            hiddenElements.forEach(el => el.classList.remove('no-print'));
            
            // Hide print-specific elements
            const printElements = document.querySelectorAll('.print-header, .print-footer');
            printElements.forEach(el => el.style.display = 'none');
            
            // Restore chart sizes
            restoreChartsFromPrint();
            
            return true;
        } catch (error) {
            console.error('Error reverting print optimizations:', error);
            return false;
        }
    }
    
    /**
     * Optimizes charts for print layout
     */
    function optimizeChartsForPrint() {
        const chartCanvases = ['incomeExpensesChart', 'equityValueChart', 'amortizationChart'];
        
        chartCanvases.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                // Store original dimensions
                canvas.setAttribute('data-original-width', canvas.style.width);
                canvas.setAttribute('data-original-height', canvas.style.height);
                
                // Set print-friendly dimensions
                canvas.style.width = '100%';
                canvas.style.maxWidth = '600px';
                canvas.style.height = '300px';
                
                // Add print-specific styling
                canvas.parentElement.style.pageBreakInside = 'avoid';
                canvas.parentElement.style.marginBottom = '20px';
            }
        });
    }
    
    /**
     * Restores original chart dimensions after printing
     */
    function restoreChartsFromPrint() {
        const chartCanvases = ['incomeExpensesChart', 'equityValueChart', 'amortizationChart'];
        
        chartCanvases.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                // Restore original dimensions
                const originalWidth = canvas.getAttribute('data-original-width');
                const originalHeight = canvas.getAttribute('data-original-height');
                
                if (originalWidth) canvas.style.width = originalWidth;
                if (originalHeight) canvas.style.height = originalHeight;
                
                // Remove data attributes
                canvas.removeAttribute('data-original-width');
                canvas.removeAttribute('data-original-height');
                
                // Remove print-specific styling
                canvas.parentElement.style.pageBreakInside = '';
                canvas.parentElement.style.marginBottom = '';
            }
        });
    }
    
    /**
     * Handles the print button click
     */
    function handlePrintReport() {
        try {
            // Prepare page for printing
            const prepared = prepareForPrint();
            if (!prepared) {
                throw new Error('Failed to prepare page for printing');
            }
            
            // Small delay to ensure DOM updates are complete
            setTimeout(() => {
                // Trigger browser print dialog
                window.print();
                
                // Revert optimizations after print dialog closes
                // Note: There's no reliable way to detect when print dialog closes,
                // so we'll revert after a reasonable delay
                setTimeout(() => {
                    revertPrintOptimizations();
                }, 1000);
            }, 100);
            
        } catch (error) {
            console.error('Print error:', error);
            alert('An error occurred while preparing the report for printing. Please try again.');
            
            // Ensure we revert optimizations even if there's an error
            revertPrintOptimizations();
        }
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
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
    
    // Temporary financing input listeners
    const tempFinancingInputs = document.querySelectorAll('#temporaryFinancingFields input[type="number"]');
    tempFinancingInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (useTemporaryFinancingCheckbox.checked) {
                updateTemporaryFinancingCalculations();
            }
        });
    });
    
    // Save button listeners
    if (saveTopBtn) {
        saveTopBtn.addEventListener('click', saveAsMarkdown);
    }
    if (saveBottomBtn) {
        saveBottomBtn.addEventListener('click', saveAsMarkdown);
    }
    
    // Load button listeners
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            markdownFileInput.click();
        });
    }
    if (loadBottomBtn) {
        loadBottomBtn.addEventListener('click', function() {
            markdownFileInput.click();
        });
    }
    
    // Print button listener
    if (printBtn) {
        printBtn.addEventListener('click', handlePrintReport);
    }
    
    // Property tax dual input listeners
    if (taxInputToggle) {
        taxInputToggle.addEventListener('click', handleTaxInputToggle);
    }
    if (monthlyPropertyTaxes) {
        monthlyPropertyTaxes.addEventListener('input', handleMonthlyTaxChange);
    }
    if (annualTaxRate) {
        annualTaxRate.addEventListener('input', handleAnnualTaxRateChange);
    }
    // Add listener to purchase price for tax calculations
    const purchasePriceInput = document.getElementById('purchasePrice');
    if (purchasePriceInput) {
        purchasePriceInput.addEventListener('input', handlePurchasePriceChangeForTax);
    }
    
    // File input listener for markdown import
    if (markdownFileInput) {
        markdownFileInput.addEventListener('change', handleMarkdownFileSelection);
    }
    
    // Temporary financing checkbox listener
    if (useTemporaryFinancingCheckbox) {
        useTemporaryFinancingCheckbox.addEventListener('change', function() {
            if (this.checked) {
                temporaryFinancingFields.classList.remove('hidden');
                updateTemporaryFinancingCalculations();
            } else {
                temporaryFinancingFields.classList.add('hidden');
                // Reset temporary financing in calculations
                updateCalculations();
            }
        });
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
        
        // Initialize property tax calculation display
        if (propertyTaxCalculation) {
            updatePropertyTaxCalculation();
        }
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
