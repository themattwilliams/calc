/**
 * NPV/IRR Unit Tests (Calculator Functions)
 */

TestFramework.describe('Financial Accuracy - NPV/IRR Helpers', () => {
    TestFramework.test('calculateNPV - simple series at 10%', () => {
        const cf = [-1000, 500, 500, 500];
        const npv = window.CalculatorFunctions.calculateNPV(0.10, cf);
        // Manual expectation ~ -1000 + 500/1.1 + 500/1.21 + 500/1.331
        const expected = -1000 + (500/1.1) + (500/1.21) + (500/1.331);
        TestFramework.expect(Math.abs(npv - expected) < 0.01).toBe(true);
    });

    TestFramework.test('calculateIRR - two-period exact solution', () => {
        const cf = [-1000, 1300];
        const irr = window.CalculatorFunctions.calculateIRR(cf);
        // -1000 + 1300/(1+r) = 0 -> r = 0.3
        TestFramework.expect(Math.abs(irr - 0.30) < 1e-6).toBe(true);
    });

    TestFramework.test('calculateIRR - multi-period approximate', () => {
        const cf = [-1000, 0, 0, 1500];
        const irr = window.CalculatorFunctions.calculateIRR(cf);
        // r ~ (1500/1000)^(1/3) - 1 ≈ 0.1447
        TestFramework.expect(Math.abs(irr - 0.1447) < 0.005).toBe(true);
    });

    TestFramework.test('calculateIRR - invalid series returns NaN', () => {
        const cf = [0, 0, 0];
        const irr = window.CalculatorFunctions.calculateIRR(cf);
        TestFramework.expect(Number.isNaN(irr)).toBe(true);
    });
});


