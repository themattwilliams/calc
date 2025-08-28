# Testing Framework Documentation
## Rental Property Analysis Calculator

### Overview
This document provides comprehensive documentation for the lightweight vanilla JavaScript testing framework implemented for the Rental Property Analysis Calculator. The framework provides robust testing capabilities without external dependencies.

---

## 🚀 Quick Start

### Running Tests
1. Open `test-runner.html` in your browser
2. Click "Run All Tests" to execute the complete test suite
3. Use category buttons to run specific test groups:
   - **🧮 Calculation Tests**: Financial calculation accuracy
   - **✅ Validation Tests**: Input validation and error handling
   - **⚡ Performance Tests**: Speed and efficiency benchmarks

### Test Results
- **Green indicators**: Tests passed successfully
- **Red indicators**: Tests failed (with detailed error messages)
- **Performance metrics**: Execution time and benchmark results

---

## 🏗️ Framework Architecture

### Core Components

#### 1. Test Framework (`js/test-framework.js`)
The main testing engine providing:
- Test registration and execution
- Assertion methods
- Result reporting and visualization
- Performance benchmarking
- DOM integration

#### 2. Test Runner (`test-runner.html`)
Interactive web interface for:
- Running tests individually or in groups
- Displaying results with visual feedback
- Performance monitoring
- Error reporting and debugging

#### 3. Test Suites
- **`tests/calculation-tests.js`**: Financial calculation validation
- **`tests/validation-tests.js`**: Input validation testing
- **`tests/performance-tests.js`**: Performance benchmarks
- **`tests/e2e-stubs.js`**: End-to-end testing stubs (future implementation)

---

## 📖 API Reference

### TestFramework Object

#### Methods

##### `test(description, testFunction)`
Register a new test case.

```javascript
TestFramework.test('Mortgage Payment Calculation', function() {
    const result = calculateMortgagePayment(200000, 0.06, 30);
    return TestFramework.expect(result).toBeCloseTo(1199.10, 2);
});
```

**Parameters:**
- `description` (string): Human-readable test description
- `testFunction` (function): Function that returns boolean or throws on failure

##### `describe(category, setupFunction)`
Group tests into categories.

```javascript
TestFramework.describe('Financial Calculations', function() {
    // Tests in this category will be grouped together
    TestFramework.test('Test 1', () => { /* ... */ });
    TestFramework.test('Test 2', () => { /* ... */ });
});
```

##### `expect(actual)`
Create assertion object for testing values.

```javascript
const result = TestFramework.expect(actualValue);
// Chain with assertion methods
```

##### `runAll(displayResults = true)`
Execute all registered tests.

```javascript
const results = TestFramework.runAll();
console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
```

##### `benchmark(description, fn, iterations = 1000)`
Performance benchmark helper.

```javascript
TestFramework.benchmark('Calculation Speed', () => {
    calculateMortgagePayment(200000, 0.06, 30);
}, 1000);
```

### Assertion Methods

#### `toBe(expected)`
Exact equality comparison (===).

```javascript
TestFramework.expect(5).toBe(5); // ✅ Pass
TestFramework.expect('5').toBe(5); // ❌ Fail
```

#### `toBeCloseTo(expected, precision = 2)`
Floating-point comparison with tolerance.

```javascript
TestFramework.expect(1199.101).toBeCloseTo(1199.10, 2); // ✅ Pass
TestFramework.expect(1199.15).toBeCloseTo(1199.10, 2); // ❌ Fail
```

#### `toBeTruthy()` / `toBeFalsy()`
Boolean truthiness testing.

```javascript
TestFramework.expect(1).toBeTruthy(); // ✅ Pass
TestFramework.expect(0).toBeFalsy(); // ✅ Pass
TestFramework.expect('').toBeFalsy(); // ✅ Pass
```

#### `toThrow()`
Exception testing.

```javascript
TestFramework.expect(() => {
    calculateCashOnCashROI(5000, 0); // Division by zero
}).toThrow(); // ✅ Pass if function throws
```

#### `toContain(expected)`
String/array containment testing.

```javascript
TestFramework.expect('$1,234.56').toContain('$'); // ✅ Pass
TestFramework.expect([1, 2, 3]).toContain(2); // ✅ Pass
```

#### `toBeGreaterThan(expected)` / `toBeLessThan(expected)`
Numerical comparison.

```javascript
TestFramework.expect(10).toBeGreaterThan(5); // ✅ Pass
TestFramework.expect(0.1).toBeLessThan(1.0); // ✅ Pass
```

---

## 🧪 Test Categories

### Financial Calculations Tests

**Purpose**: Validate accuracy of all financial calculations

**Key Test Areas:**
- PMT (Payment) formula verification
- Cash-on-Cash ROI calculations
- Net Operating Income (NOI)
- Capitalization rate calculations
- Currency and percentage formatting

**Example Tests:**
```javascript
// Standard mortgage payment test
TestFramework.test('PMT Formula - Standard 30-year loan', function() {
    const result = calculateMortgagePayment(200000, 0.06, 30);
    return TestFramework.expect(result).toBeCloseTo(1199.10, 2);
});

// Cash-on-Cash ROI test
TestFramework.test('Cash-on-Cash ROI - Standard property', function() {
    const result = calculateCashOnCashROI(5000, 100000);
    return TestFramework.expect(result).toBeCloseTo(5.0, 1);
});
```

**Test Data Sets:**
- Standard property scenarios
- High-end property scenarios  
- Cash purchase scenarios
- Edge cases and boundary conditions

### Input Validation Tests

**Purpose**: Ensure robust input validation and error handling

**Key Test Areas:**
- Purchase price validation (range, type checking)
- Down payment validation (not exceeding purchase price)
- Interest rate validation (reasonable ranges)
- Monthly rent validation (positive values)
- Growth rate validation (0-20% range)

**Example Tests:**
```javascript
// Valid input test
TestFramework.test('Purchase Price - Valid standard amount', function() {
    const result = validatePurchasePrice(250000);
    return TestFramework.expect(result).toBeTruthy();
});

// Invalid input test
TestFramework.test('Purchase Price - Invalid: Negative', function() {
    const result = validatePurchasePrice(-100000);
    return TestFramework.expect(result).toBeFalsy();
});
```

### Performance Tests

**Purpose**: Ensure calculations are fast enough for real-time updates

**Key Test Areas:**
- Individual calculation speed benchmarks
- Complete analysis performance
- Memory usage validation
- Precision maintenance under load
- Cross-browser performance consistency

**Example Tests:**
```javascript
// Performance benchmark
TestFramework.test('BENCHMARK: Mortgage Payment Speed', function() {
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        calculateMortgagePayment(200000, 0.06, 30);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    return TestFramework.expect(avgTime).toBeLessThan(0.1); // < 0.1ms
});
```

**Performance Targets:**
- Mortgage calculations: < 0.1ms average
- ROI calculations: < 0.05ms average
- Complete analysis: < 5ms average
- Input validation: < 0.01ms average

---

## 🔧 Writing Custom Tests

### Basic Test Structure

```javascript
TestFramework.describe('Your Test Category', function() {
    
    TestFramework.test('Your test description', function() {
        // Arrange: Set up test data
        const input = 250000;
        const expected = 1199.10;
        
        // Act: Execute the function
        const result = calculateMortgagePayment(input, 0.06, 30);
        
        // Assert: Verify the result
        return TestFramework.expect(result).toBeCloseTo(expected, 2);
    });
    
});
```

### Test Data Organization

Create reusable test data sets:

```javascript
const TEST_SCENARIOS = {
    standardProperty: {
        purchasePrice: 250000,
        downPayment: 50000,
        interestRate: 0.06,
        loanTerm: 30,
        expectedPayment: 1199.10
    },
    
    cashPurchase: {
        purchasePrice: 150000,
        downPayment: 150000,
        interestRate: 0,
        loanTerm: 30,
        expectedPayment: 0
    }
};
```

### Error Testing Patterns

```javascript
// Test for expected exceptions
TestFramework.test('Function should throw on invalid input', function() {
    return TestFramework.expect(() => {
        calculateCashOnCashROI(5000, 0); // Division by zero
    }).toThrow();
});

// Test for graceful error handling
TestFramework.test('Function should handle edge case gracefully', function() {
    const result = validatePurchasePrice('invalid');
    return TestFramework.expect(result).toBeFalsy();
});
```

### Performance Testing Patterns

```javascript
// Simple performance test
TestFramework.test('Function performance check', function() {
    const startTime = performance.now();
    
    // Execute function many times
    for (let i = 0; i < 1000; i++) {
        yourFunction(testInput);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / 1000;
    
    return TestFramework.expect(avgTime).toBeLessThan(0.1);
});
```

---

## 📊 Test Results and Reporting

### Console Output
All test results are logged to the browser console with:
- ✅ Passed test count
- ❌ Failed test count  
- 📊 Total test count
- ⏱️ Execution duration
- 📋 Category breakdown
- Detailed failure information

### DOM Display
Results are also displayed in the test runner interface with:
- Visual status indicators (green/red)
- Execution time metrics
- Category-based organization
- Expandable failure details
- Performance benchmark results

### Result Object Structure
```javascript
{
    passed: 45,
    failed: 2,
    total: 47,
    totalDuration: 234.56,
    categories: {
        'Financial Calculations': { passed: 20, failed: 0, total: 20 },
        'Input Validation': { passed: 15, failed: 1, total: 16 },
        'Performance': { passed: 10, failed: 1, total: 11 }
    },
    failures: [
        {
            description: 'Test description',
            category: 'Category name',
            error: 'Error message',
            passed: false
        }
    ]
}
```

---

## 🐛 Debugging Failed Tests

### Common Failure Patterns

#### 1. Precision Issues
```javascript
// ❌ Problem: Floating-point precision
TestFramework.expect(1199.1000001).toBe(1199.10);

// ✅ Solution: Use toBeCloseTo with appropriate precision
TestFramework.expect(1199.1000001).toBeCloseTo(1199.10, 2);
```

#### 2. Type Mismatches
```javascript
// ❌ Problem: String vs. number comparison
TestFramework.expect('5').toBe(5);

// ✅ Solution: Convert types or use appropriate assertion
TestFramework.expect(parseFloat('5')).toBe(5);
```

#### 3. Async Operations
```javascript
// ❌ Problem: Testing asynchronous code
TestFramework.test('Async test', function() {
    setTimeout(() => {
        // This won't work as expected
        return TestFramework.expect(result).toBe(expected);
    }, 100);
});

// ✅ Solution: Use promises or callbacks appropriately
TestFramework.test('Async test', function() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(TestFramework.expect(result).toBe(expected));
        }, 100);
    });
});
```

### Debugging Tips

1. **Use Console Logging**: Add console.log statements to understand data flow
2. **Check Test Data**: Verify input data matches expected formats
3. **Isolate Issues**: Run individual tests to isolate problems
4. **Verify Functions**: Ensure the functions being tested are loaded correctly
5. **Check Expectations**: Verify expected values are correct

---

## ⚡ Performance Optimization

### Test Execution Optimization

1. **Group Related Tests**: Use `describe()` to organize tests logically
2. **Minimize Setup**: Avoid expensive operations in test setup
3. **Use Appropriate Iterations**: Balance thoroughness with execution time
4. **Cache Test Data**: Reuse test data objects instead of recreating

### Framework Performance

- Tests execute in sequence for reliable results
- Results are cached to avoid recalculation
- DOM updates are batched for better performance
- Memory usage is monitored to prevent leaks

---

## 🔮 Future Enhancements

### End-to-End Testing Integration

The framework includes stubs for future E2E testing with:
- **Playwright Integration**: Real browser testing
- **Visual Regression Testing**: Screenshot comparison
- **Cross-Browser Testing**: Automated browser compatibility
- **Performance Monitoring**: Real-world performance metrics

### Planned Features

1. **Test Coverage Reporting**: Track which functions are tested
2. **Automated Test Generation**: Generate tests from function signatures
3. **Continuous Integration**: GitHub Actions integration
4. **Visual Test Reports**: HTML/PDF report generation
5. **Test Data Validation**: Automatic test data verification

---

## 🤝 Contributing to Tests

### Adding New Tests

1. **Identify Test Category**: Determine which test file is appropriate
2. **Follow Naming Conventions**: Use descriptive test names
3. **Include Edge Cases**: Test boundary conditions and error cases
4. **Document Expected Results**: Comment complex calculations
5. **Update Documentation**: Add examples to this documentation

### Test Quality Guidelines

- **Clarity**: Tests should be self-documenting
- **Independence**: Tests should not depend on other tests
- **Determinism**: Tests should produce consistent results
- **Completeness**: Cover both success and failure scenarios
- **Performance**: Tests should execute quickly

### Example Contribution

```javascript
// Good test example
TestFramework.test('Cap Rate - Commercial property scenario', function() {
    // Test data based on realistic commercial property
    const noi = 75000; // $75k annual NOI
    const totalCost = 1000000; // $1M total investment
    const expectedCapRate = 7.5; // 7.5% cap rate
    
    const result = calculateCapRate(noi, totalCost);
    
    // Verify result is within reasonable range for commercial properties
    return TestFramework.expect(result).toBeCloseTo(expectedCapRate, 1);
});
```

---

## 📞 Support and Troubleshooting

### Common Issues

1. **Tests Not Loading**: Check that all script tags are properly included
2. **Function Not Defined**: Ensure calculator functions are loaded before tests
3. **Unexpected Results**: Verify test data and expected values
4. **Performance Issues**: Check for infinite loops or expensive operations

### Getting Help

- Review the console output for detailed error messages
- Check the test runner interface for visual indicators
- Examine individual test implementations for patterns
- Verify that stub functions match actual implementation requirements

This testing framework provides a solid foundation for ensuring the reliability and accuracy of the Rental Property Analysis Calculator while maintaining simplicity and avoiding external dependencies.
