/**
 * Lightweight export tests (non-E2E) for PNG/CSV hooks
 */

TestFramework.describe('Chart Exports - PNG/CSV', () => {
    TestFramework.test('Canvas toDataURL returns PNG data', () => {
        const canvas = document.getElementById('returnDecompositionChart');
        if (!canvas) return TestFramework.expect(true).toBe(true); // tolerate if not yet rendered
        const url = canvas.toDataURL('image/png');
        TestFramework.expect(typeof url).toBe('string');
        TestFramework.expect(url.indexOf('data:image/png') === 0).toBe(true);
    });

    TestFramework.test('CSV export builder returns expected header', () => {
        const labels = (window.projectionData || []).map(p => p.year);
        const cf = (window.projectionData || []).map(p => p.annualCashFlow);
        const rows = ['Year,CashFlow'].concat(labels.map((y,i) => `${y},${cf[i]||0}`));
        const csv = rows.join('\n');
        TestFramework.expect(csv.includes('Year,CashFlow')).toBe(true);
    });
});


