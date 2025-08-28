/**
 * Print Functionality Test Suite
 * 
 * Tests for print preparation, layout optimization, and chart handling
 * for creating professional printable rental property analysis reports.
 */

TestFramework.suite('Print Functionality', function() {
    
    // Mock print preparation functions for testing
    const mockPrintFunctions = {
        optimizeForPrint: function() {
            // Simulate print optimization
            const body = document.body;
            body.classList.add('print-optimized');
            
            // Hide non-essential elements
            const elementsToHide = ['.quick-entry-btn', '.load-btn', '.save-btn'];
            elementsToHide.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.style.display = 'none');
            });
            
            // Optimize chart containers
            const chartContainers = document.querySelectorAll('.chart-container');
            chartContainers.forEach(container => {
                container.style.pageBreakInside = 'avoid';
                container.style.marginBottom = '20px';
            });
            
            return true;
        },
        
        revertPrintOptimization: function() {
            const body = document.body;
            body.classList.remove('print-optimized');
            
            // Restore hidden elements
            const hiddenElements = document.querySelectorAll('[style*="display: none"]');
            hiddenElements.forEach(el => el.style.display = '');
            
            return true;
        },
        
        generatePrintSummary: function() {
            return {
                propertyAddress: document.getElementById('propertyAddress')?.value || 'Not specified',
                purchasePrice: document.getElementById('purchasePrice')?.value || '0',
                monthlyRent: document.getElementById('monthlyRent')?.value || '0',
                monthlyCashFlow: document.getElementById('monthlyCashFlow')?.textContent || '$0',
                cashOnCashROI: document.getElementById('cashOnCashROI')?.textContent || '0%',
                generatedDate: new Date().toLocaleDateString()
            };
        },
        
        resizeChartsForPrint: function() {
            const charts = ['incomeExpensesChart', 'equityValueChart', 'amortizationChart'];
            const resizedCharts = [];
            
            charts.forEach(chartId => {
                const canvas = document.getElementById(chartId);
                if (canvas) {
                    // Store original dimensions
                    const originalWidth = canvas.style.width;
                    const originalHeight = canvas.style.height;
                    
                    // Set print-friendly dimensions
                    canvas.style.width = '100%';
                    canvas.style.maxWidth = '600px';
                    canvas.style.height = '300px';
                    
                    resizedCharts.push({
                        id: chartId,
                        originalWidth,
                        originalHeight,
                        newWidth: canvas.style.width,
                        newHeight: canvas.style.height
                    });
                }
            });
            
            return resizedCharts;
        }
    };
    
    // ========================================
    // PRINT OPTIMIZATION TESTS
    // ========================================
    
    TestFramework.test('Print Optimization - Hide Non-Essential Elements', function() {
        // Setup: Add some test elements
        const testButton = document.createElement('button');
        testButton.className = 'quick-entry-btn';
        testButton.textContent = 'Test Button';
        document.body.appendChild(testButton);
        
        const testSaveBtn = document.createElement('button');
        testSaveBtn.className = 'save-btn';
        testSaveBtn.textContent = 'Save';
        document.body.appendChild(testSaveBtn);
        
        // Test print optimization
        const result = mockPrintFunctions.optimizeForPrint();
        
        // Verify elements are hidden
        const hiddenButton = document.querySelector('.quick-entry-btn');
        const hiddenSaveBtn = document.querySelector('.save-btn');
        
        const success = result && 
                       hiddenButton.style.display === 'none' && 
                       hiddenSaveBtn.style.display === 'none' &&
                       document.body.classList.contains('print-optimized');
        
        // Cleanup
        document.body.removeChild(testButton);
        document.body.removeChild(testSaveBtn);
        mockPrintFunctions.revertPrintOptimization();
        
        return success;
    });
    
    TestFramework.test('Print Optimization - Chart Container Preparation', function() {
        // Setup: Create test chart containers
        const chartContainer1 = document.createElement('div');
        chartContainer1.className = 'chart-container';
        document.body.appendChild(chartContainer1);
        
        const chartContainer2 = document.createElement('div');
        chartContainer2.className = 'chart-container';
        document.body.appendChild(chartContainer2);
        
        // Test optimization
        mockPrintFunctions.optimizeForPrint();
        
        // Verify chart containers are optimized
        const containers = document.querySelectorAll('.chart-container');
        let allOptimized = true;
        
        containers.forEach(container => {
            if (container.style.pageBreakInside !== 'avoid' || 
                container.style.marginBottom !== '20px') {
                allOptimized = false;
            }
        });
        
        // Cleanup
        document.body.removeChild(chartContainer1);
        document.body.removeChild(chartContainer2);
        mockPrintFunctions.revertPrintOptimization();
        
        return allOptimized;
    });
    
    TestFramework.test('Print Optimization - Revert Functionality', function() {
        // Setup: Add test elements
        const testElement = document.createElement('div');
        testElement.className = 'quick-entry-btn';
        document.body.appendChild(testElement);
        
        // Apply optimization
        mockPrintFunctions.optimizeForPrint();
        const isOptimized = document.body.classList.contains('print-optimized') && 
                           testElement.style.display === 'none';
        
        // Revert optimization
        const revertResult = mockPrintFunctions.revertPrintOptimization();
        const isReverted = !document.body.classList.contains('print-optimized') && 
                          testElement.style.display === '';
        
        // Cleanup
        document.body.removeChild(testElement);
        
        return isOptimized && revertResult && isReverted;
    });
    
    // ========================================
    // CHART PRINT PREPARATION TESTS
    // ========================================
    
    TestFramework.test('Chart Resizing - Canvas Dimension Adjustment', function() {
        // Setup: Create test canvas elements
        const canvas1 = document.createElement('canvas');
        canvas1.id = 'incomeExpensesChart';
        canvas1.style.width = '800px';
        canvas1.style.height = '400px';
        document.body.appendChild(canvas1);
        
        const canvas2 = document.createElement('canvas');
        canvas2.id = 'equityValueChart';
        canvas2.style.width = '800px';
        canvas2.style.height = '400px';
        document.body.appendChild(canvas2);
        
        // Test chart resizing
        const resizeResults = mockPrintFunctions.resizeChartsForPrint();
        
        // Verify results
        const success = resizeResults.length === 2 &&
                       resizeResults[0].id === 'incomeExpensesChart' &&
                       resizeResults[1].id === 'equityValueChart' &&
                       canvas1.style.width === '100%' &&
                       canvas1.style.height === '300px' &&
                       canvas2.style.width === '100%' &&
                       canvas2.style.height === '300px';
        
        // Cleanup
        document.body.removeChild(canvas1);
        document.body.removeChild(canvas2);
        
        return success;
    });
    
    TestFramework.test('Chart Resizing - Handle Missing Charts Gracefully', function() {
        // Test with no charts present
        const resizeResults = mockPrintFunctions.resizeChartsForPrint();
        
        // Should return empty array without errors
        return Array.isArray(resizeResults) && resizeResults.length === 0;
    });
    
    TestFramework.test('Chart Resizing - Preserve Original Dimensions Data', function() {
        // Setup: Create test canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'amortizationChart';
        canvas.style.width = '900px';
        canvas.style.height = '450px';
        document.body.appendChild(canvas);
        
        // Test resizing
        const resizeResults = mockPrintFunctions.resizeChartsForPrint();
        
        // Verify original dimensions are preserved
        const success = resizeResults.length === 1 &&
                       resizeResults[0].originalWidth === '900px' &&
                       resizeResults[0].originalHeight === '450px' &&
                       resizeResults[0].newWidth === '100%' &&
                       resizeResults[0].newHeight === '300px';
        
        // Cleanup
        document.body.removeChild(canvas);
        
        return success;
    });
    
    // ========================================
    // PRINT SUMMARY GENERATION TESTS
    // ========================================
    
    TestFramework.test('Print Summary - Generate Report Metadata', function() {
        // Setup: Create test input elements
        const addressInput = document.createElement('input');
        addressInput.id = 'propertyAddress';
        addressInput.value = '123 Test Street, Test City, TS 12345';
        document.body.appendChild(addressInput);
        
        const priceInput = document.createElement('input');
        priceInput.id = 'purchasePrice';
        priceInput.value = '350000';
        document.body.appendChild(priceInput);
        
        const rentInput = document.createElement('input');
        rentInput.id = 'monthlyRent';
        rentInput.value = '2800';
        document.body.appendChild(rentInput);
        
        // Test summary generation
        const summary = mockPrintFunctions.generatePrintSummary();
        
        // Verify summary content
        const success = summary.propertyAddress === '123 Test Street, Test City, TS 12345' &&
                       summary.purchasePrice === '350000' &&
                       summary.monthlyRent === '2800' &&
                       typeof summary.generatedDate === 'string' &&
                       summary.generatedDate.length > 0;
        
        // Cleanup
        document.body.removeChild(addressInput);
        document.body.removeChild(priceInput);
        document.body.removeChild(rentInput);
        
        return success;
    });
    
    TestFramework.test('Print Summary - Handle Missing Input Elements', function() {
        // Test with no input elements present
        const summary = mockPrintFunctions.generatePrintSummary();
        
        // Should provide default values
        return summary.propertyAddress === 'Not specified' &&
               summary.purchasePrice === '0' &&
               summary.monthlyRent === '0' &&
               typeof summary.generatedDate === 'string';
    });
    
    TestFramework.test('Print Summary - Include Calculated Metrics', function() {
        // Setup: Create test result elements
        const cashFlowDiv = document.createElement('div');
        cashFlowDiv.id = 'monthlyCashFlow';
        cashFlowDiv.textContent = '$485.23';
        document.body.appendChild(cashFlowDiv);
        
        const roiDiv = document.createElement('div');
        roiDiv.id = 'cashOnCashROI';
        roiDiv.textContent = '7.2%';
        document.body.appendChild(roiDiv);
        
        // Test summary generation
        const summary = mockPrintFunctions.generatePrintSummary();
        
        // Verify calculated metrics are included
        const success = summary.monthlyCashFlow === '$485.23' &&
                       summary.cashOnCashROI === '7.2%';
        
        // Cleanup
        document.body.removeChild(cashFlowDiv);
        document.body.removeChild(roiDiv);
        
        return success;
    });
    
    // ========================================
    // PRINT WORKFLOW INTEGRATION TESTS
    // ========================================
    
    TestFramework.test('Print Workflow - Complete Preparation Sequence', function() {
        // Setup: Create test environment
        const testButton = document.createElement('button');
        testButton.className = 'quick-entry-btn';
        document.body.appendChild(testButton);
        
        const testCanvas = document.createElement('canvas');
        testCanvas.id = 'incomeExpensesChart';
        testCanvas.style.width = '800px';
        testCanvas.style.height = '400px';
        document.body.appendChild(testCanvas);
        
        const testInput = document.createElement('input');
        testInput.id = 'propertyAddress';
        testInput.value = 'Test Property';
        document.body.appendChild(testInput);
        
        // Execute complete workflow
        const step1 = mockPrintFunctions.optimizeForPrint();
        const step2 = mockPrintFunctions.resizeChartsForPrint();
        const step3 = mockPrintFunctions.generatePrintSummary();
        const step4 = mockPrintFunctions.revertPrintOptimization();
        
        // Verify all steps completed successfully
        const success = step1 && 
                       Array.isArray(step2) && 
                       typeof step3 === 'object' && 
                       step4 &&
                       step3.propertyAddress === 'Test Property' &&
                       step2.length === 1;
        
        // Cleanup
        document.body.removeChild(testButton);
        document.body.removeChild(testCanvas);
        document.body.removeChild(testInput);
        
        return success;
    });
    
    TestFramework.test('Print Workflow - Error Handling for Missing Elements', function() {
        // Test workflow with minimal DOM elements
        let errorOccurred = false;
        
        try {
            mockPrintFunctions.optimizeForPrint();
            mockPrintFunctions.resizeChartsForPrint();
            mockPrintFunctions.generatePrintSummary();
            mockPrintFunctions.revertPrintOptimization();
        } catch (error) {
            errorOccurred = true;
        }
        
        // Should not throw errors even with missing elements
        return !errorOccurred;
    });
    
    // ========================================
    // PRINT CSS AND LAYOUT TESTS
    // ========================================
    
    TestFramework.test('Print CSS - Media Query Detection', function() {
        // Test CSS media query support detection
        const hasPrintMediaSupport = window.matchMedia && window.matchMedia('print').media === 'print';
        
        return hasPrintMediaSupport;
    });
    
    TestFramework.test('Print CSS - Page Break Styles Applied', function() {
        // Setup: Create test element
        const testElement = document.createElement('div');
        testElement.className = 'chart-container';
        document.body.appendChild(testElement);
        
        // Apply print optimization
        mockPrintFunctions.optimizeForPrint();
        
        // Test page break style
        const hasPageBreakStyle = testElement.style.pageBreakInside === 'avoid';
        
        // Cleanup
        mockPrintFunctions.revertPrintOptimization();
        document.body.removeChild(testElement);
        
        return hasPageBreakStyle;
    });
    
    TestFramework.test('Print Layout - Responsive Chart Sizing', function() {
        // Setup: Create multiple chart containers
        const charts = ['incomeExpensesChart', 'equityValueChart', 'amortizationChart'];
        const createdElements = [];
        
        charts.forEach(chartId => {
            const canvas = document.createElement('canvas');
            canvas.id = chartId;
            canvas.style.width = '1000px'; // Large initial size
            canvas.style.height = '500px';
            document.body.appendChild(canvas);
            createdElements.push(canvas);
        });
        
        // Test resizing
        const resizeResults = mockPrintFunctions.resizeChartsForPrint();
        
        // Verify all charts are resized appropriately
        let allResizedCorrectly = true;
        createdElements.forEach(canvas => {
            if (canvas.style.width !== '100%' || canvas.style.height !== '300px') {
                allResizedCorrectly = false;
            }
        });
        
        // Cleanup
        createdElements.forEach(el => document.body.removeChild(el));
        
        return resizeResults.length === 3 && allResizedCorrectly;
    });
});
