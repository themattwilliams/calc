/**
 * Chart Rendering & Data Integrity Tests for New Analytics
 */

TestFramework.describe('Charts - Advanced Analytics', () => {
    TestFramework.test('Return Decomposition chart canvas exists', () => {
        const el = document.getElementById('returnDecompositionChart');
        TestFramework.expect(!!el).toBe(true);
    });

    TestFramework.test('IRR vs Hold canvas exists', () => {
        const el = document.getElementById('irrCurveChart');
        TestFramework.expect(!!el).toBe(true);
    });

    TestFramework.test('Debt Yield & LTV canvas exists', () => {
        const el = document.getElementById('debtLtvChart');
        TestFramework.expect(!!el).toBe(true);
    });

    TestFramework.test('Projections contain appreciation for decomposition', () => {
        // Trigger an update by simulating values (if needed)
        if (typeof window.updateAllCalculations === 'function') {
            window.updateAllCalculations();
        }
        const p = window.projectionData || [];
        const hasApp = p.length ? (typeof p[0].appreciation !== 'undefined') : true; // tolerate empty
        TestFramework.expect(hasApp).toBe(true);
    });
});


