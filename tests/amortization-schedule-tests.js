/**
 * Amortization Schedule - TDD Unit Tests
 */

TestFramework.describe('Amortization Schedule - Core', () => {
    TestFramework.test('generates full schedule of term*12 months', () => {
        const loan = 300000;
        const rate = 0.06;
        const years = 30;
        const schedule = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, {});
        TestFramework.expect(Array.isArray(schedule)).toBe(true);
        // Allow early payoff due to rounding by <=1 month tolerance
        TestFramework.expect(schedule.length >= years * 12 - 1).toBe(true);
        TestFramework.expect(schedule.length <= years * 12).toBe(true);
    });

    TestFramework.test('principal sums approximately to original loan', () => {
        const loan = 200000;
        const rate = 0.05;
        const years = 30;
        const schedule = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, {});
        const totalPrincipal = schedule.reduce((s, m) => s + (m.principal + (m.extraPrincipal || 0)), 0);
        TestFramework.expect(Math.abs(totalPrincipal - loan) < 2).toBe(true); // within $2 rounding
    });

    TestFramework.test('ending balance is near zero', () => {
        const loan = 150000;
        const rate = 0.045;
        const years = 15;
        const schedule = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, {});
        const last = schedule[schedule.length - 1];
        TestFramework.expect(Math.abs(last.balance) < 1).toBe(true);
    });
});

TestFramework.describe('Amortization Schedule - Extra Payments', () => {
    TestFramework.test('extra monthly principal reduces total interest and term', () => {
        const loan = 250000;
        const rate = 0.055;
        const years = 30;
        const base = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, {});
        const withExtra = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, { extraMonthlyPrincipal: 200 });
        const interestBase = base.reduce((s, m) => s + m.interest, 0);
        const interestExtra = withExtra.reduce((s, m) => s + m.interest, 0);
        TestFramework.expect(interestExtra < interestBase).toBe(true);
        TestFramework.expect(withExtra.length < base.length).toBe(true);
    });

    TestFramework.test('lump-sum payment reduces remaining interest', () => {
        const loan = 180000;
        const rate = 0.05;
        const years = 30;
        const base = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, {});
        const withLump = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, { lumpSumPayments: { 12: 5000 } });
        const interestBase = base.reduce((s, m) => s + m.interest, 0);
        const interestLump = withLump.reduce((s, m) => s + m.interest, 0);
        TestFramework.expect(interestLump < interestBase).toBe(true);
    });
});

TestFramework.describe('Amortization Schedule - Edge Cases', () => {
    TestFramework.test('zero interest rate splits principal evenly', () => {
        const loan = 120000;
        const rate = 0;
        const years = 10;
        const schedule = window.CalculatorFunctions.generateAmortizationSchedule(loan, rate, years, {});
        const expectedMonthly = loan / (years * 12);
        TestFramework.expect(Math.abs(schedule[0].principal - expectedMonthly) < 0.01).toBe(true);
        TestFramework.expect(Math.abs(schedule[0].interest - 0) < 0.0001).toBe(true);
    });
});


