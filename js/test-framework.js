/**
 * Lightweight Vanilla JavaScript Testing Framework
 * 
 * A simple, dependency-free testing framework designed specifically
 * for the Rental Property Analysis Calculator application.
 * 
 * Usage:
 *   TestFramework.test('description', () => {
 *     const result = someFunction();
 *     return TestFramework.expect(result).toBe(expectedValue);
 *   });
 * 
 *   TestFramework.runAll();
 */

const TestFramework = {
    tests: [],
    results: {
        passed: 0,
        failed: 0,
        total: 0,
        failures: []
    },
    
    /**
     * Register a new test
     * @param {string} description - Test description
     * @param {function} testFunction - Function that returns boolean or throws
     */
    test(description, testFunction) {
        this.tests.push({
            description,
            testFunction,
            category: this.currentCategory || 'General'
        });
    },
    
    /**
     * Set category for subsequent tests
     * @param {string} category - Category name for grouping tests
     */
    describe(category, setupFunction) {
        this.currentCategory = category;
        if (setupFunction && typeof setupFunction === 'function') {
            setupFunction();
        }
        this.currentCategory = null;
    },
    
    /**
     * Expectation functions for assertions
     * @param {*} actual - The actual value to test
     */
    expect(actual) {
        return {
            toBe: (expected) => {
                const passed = actual === expected;
                if (!passed) {
                    throw new Error(`Expected ${actual} to be ${expected}`);
                }
                return passed;
            },
            
            toBeCloseTo: (expected, precision = 2) => {
                const tolerance = Math.pow(10, -precision);
                const passed = Math.abs(actual - expected) < tolerance;
                if (!passed) {
                    throw new Error(`Expected ${actual} to be close to ${expected} (precision: ${precision})`);
                }
                return passed;
            },
            
            toBeTruthy: () => {
                const passed = !!actual;
                if (!passed) {
                    throw new Error(`Expected ${actual} to be truthy`);
                }
                return passed;
            },
            
            toBeFalsy: () => {
                const passed = !actual;
                if (!passed) {
                    throw new Error(`Expected ${actual} to be falsy`);
                }
                return passed;
            },
            
            toThrow: () => {
                let threw = false;
                try {
                    if (typeof actual === 'function') {
                        actual();
                    }
                } catch (e) {
                    threw = true;
                }
                if (!threw) {
                    throw new Error(`Expected function to throw an error`);
                }
                return threw;
            },
            
            toContain: (expected) => {
                const passed = actual && actual.toString().includes(expected);
                if (!passed) {
                    throw new Error(`Expected ${actual} to contain ${expected}`);
                }
                return passed;
            },
            
            toBeGreaterThan: (expected) => {
                const passed = actual > expected;
                if (!passed) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
                return passed;
            },
            
            toBeLessThan: (expected) => {
                const passed = actual < expected;
                if (!passed) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
                return passed;
            }
        };
    },
    
    /**
     * Run a single test
     * @param {object} test - Test object with description and testFunction
     */
    runSingleTest(test) {
        try {
            const startTime = performance.now();
            const result = test.testFunction();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // If testFunction returns a boolean, use that result
            // If it doesn't throw and doesn't return false, consider it passed
            const passed = result !== false;
            
            return {
                passed,
                duration,
                error: null,
                description: test.description,
                category: test.category
            };
        } catch (error) {
            return {
                passed: false,
                duration: 0,
                error: error.message,
                description: test.description,
                category: test.category
            };
        }
    },
    
    /**
     * Run all registered tests
     * @param {boolean} displayResults - Whether to display results in console/DOM
     */
    runAll(displayResults = true) {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            failures: [],
            categories: {}
        };
        
        const startTime = performance.now();
        
        this.tests.forEach(test => {
            const result = this.runSingleTest(test);
            this.results.total++;
            
            // Track by category
            if (!this.results.categories[result.category]) {
                this.results.categories[result.category] = {
                    passed: 0,
                    failed: 0,
                    total: 0
                };
            }
            
            if (result.passed) {
                this.results.passed++;
                this.results.categories[result.category].passed++;
            } else {
                this.results.failed++;
                this.results.categories[result.category].failed++;
                this.results.failures.push(result);
            }
            
            this.results.categories[result.category].total++;
        });
        
        const endTime = performance.now();
        this.results.totalDuration = endTime - startTime;
        
        if (displayResults) {
            this.displayResults();
        }
        
        return this.results;
    },
    
    /**
     * Display test results in console and DOM (if available)
     */
    displayResults() {
        const { passed, failed, total, failures, totalDuration, categories } = this.results;
        
        // Console output
        console.group('🧪 Test Results');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${total}`);
        console.log(`⏱️ Duration: ${totalDuration.toFixed(2)}ms`);
        
        // Category breakdown
        console.group('📋 By Category');
        Object.entries(categories).forEach(([category, stats]) => {
            console.log(`${category}: ${stats.passed}/${stats.total} passed`);
        });
        console.groupEnd();
        
        // Failures
        if (failures.length > 0) {
            console.group('❌ Failures');
            failures.forEach(failure => {
                console.error(`${failure.category}: ${failure.description}`);
                console.error(`  Error: ${failure.error}`);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        
        // DOM output (if test results container exists)
        this.displayResultsInDOM();
    },
    
    /**
     * Display results in DOM if test results container is available
     */
    displayResultsInDOM() {
        const container = document.getElementById('test-results');
        if (!container) return;
        
        const { passed, failed, total, failures, totalDuration, categories } = this.results;
        
        container.innerHTML = `
            <div class="test-summary">
                <h3>Test Results</h3>
                <div class="test-stats">
                    <div class="stat passed">✅ Passed: ${passed}</div>
                    <div class="stat failed">❌ Failed: ${failed}</div>
                    <div class="stat total">📊 Total: ${total}</div>
                    <div class="stat duration">⏱️ Duration: ${totalDuration.toFixed(2)}ms</div>
                </div>
            </div>
            
            <div class="test-categories">
                <h4>By Category</h4>
                ${Object.entries(categories).map(([category, stats]) => `
                    <div class="category ${stats.failed > 0 ? 'has-failures' : 'all-passed'}">
                        <span class="category-name">${category}</span>
                        <span class="category-stats">${stats.passed}/${stats.total}</span>
                    </div>
                `).join('')}
            </div>
            
            ${failures.length > 0 ? `
                <div class="test-failures">
                    <h4>Failures</h4>
                    ${failures.map(failure => `
                        <div class="failure">
                            <div class="failure-title">${failure.category}: ${failure.description}</div>
                            <div class="failure-error">${failure.error}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    },
    
    /**
     * Clear all tests (useful for test organization)
     */
    clear() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            failures: []
        };
    },
    
    /**
     * Performance benchmark helper
     * @param {string} description - Benchmark description
     * @param {function} fn - Function to benchmark
     * @param {number} iterations - Number of iterations (default: 1000)
     */
    benchmark(description, fn, iterations = 1000) {
        this.test(`BENCHMARK: ${description}`, () => {
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                fn();
            }
            
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / iterations;
            
            console.log(`Benchmark ${description}: ${avgTime.toFixed(4)}ms average over ${iterations} iterations`);
            
            // Consider it passed if average time is reasonable (< 1ms for calculations)
            return avgTime < 1.0;
        });
    }
};

// Make it globally available
if (typeof window !== 'undefined') {
    window.TestFramework = TestFramework;
}

// Export for Node.js environments (future compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestFramework;
}
