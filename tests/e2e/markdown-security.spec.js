import { test, expect } from '@playwright/test';

test.describe('Markdown Import Security - E2E Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('prevents XSS through malicious markdown import', async ({ page }) => {
        // Create malicious markdown content with script injection
        const maliciousMarkdown = `# Property Analysis Report

**Property Address:** 123 Main St <script>window.xssTriggered = true; alert('XSS Attack!')</script>
**Purchase Price:** $300,000
**Monthly Rent:** <img src=x onerror="window.xssTriggered = true">
**Management:** 5% <svg onload="window.xssTriggered = true">
**Custom Field:** <iframe src="javascript:window.xssTriggered = true"></iframe>

## Financial Metrics
**Cash on Cash ROI:** 8.5%
**Pro Forma Cap Rate:** 6.2%`;

        // Create a file with malicious content
        const fileContent = new Blob([maliciousMarkdown], { type: 'text/markdown' });
        
        // Set up file input
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'malicious.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(maliciousMarkdown)
        });

        // Click load button
        await page.click('#loadMarkdownBtn');

        // Wait for processing
        await page.waitForTimeout(1000);

        // Verify XSS was prevented
        const xssTriggered = await page.evaluate(() => window.xssTriggered);
        expect(xssTriggered).toBeFalsy();

        // Check that script tags are not in the DOM
        const scriptTags = await page.locator('script').count();
        const initialScriptCount = await page.evaluate(() => document.querySelectorAll('script').length);
        
        // Should not have added new script tags
        expect(scriptTags).toBeLessThanOrEqual(initialScriptCount);

        // Verify legitimate content was still loaded (sanitized)
        expect(await page.inputValue('#propertyAddress')).toContain('123 Main St');
        expect(await page.inputValue('#propertyAddress')).not.toContain('<script>');
        
        expect(await page.inputValue('#purchasePrice')).toBe('300000');
    });

    test('handles iframe injection attempts', async ({ page }) => {
        const iframeAttackMarkdown = `# Property Report
**Property Address:** <iframe src="data:text/html,<script>parent.postMessage('pwned','*')</script>"></iframe>
**Purchase Price:** $250,000`;

        const fileContent = new Blob([iframeAttackMarkdown], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'iframe_attack.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(iframeAttackMarkdown)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Check no iframes were created
        const iframes = await page.locator('iframe').count();
        expect(iframes).toBe(0);

        // Verify content was sanitized but preserved
        const address = await page.inputValue('#propertyAddress');
        expect(address).not.toContain('<iframe');
        expect(address).not.toContain('script');
    });

    test('prevents event handler injection', async ({ page }) => {
        const eventHandlerMarkdown = `# Property Report
**Property Address:** <div onclick="alert('clicked')" onmouseover="console.log('hovered')">123 Oak St</div>
**Purchase Price:** $400,000`;

        const fileContent = new Blob([eventHandlerMarkdown], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'event_handlers.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(eventHandlerMarkdown)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Check address was sanitized
        const address = await page.inputValue('#propertyAddress');
        expect(address).toContain('123 Oak St');
        expect(address).not.toContain('onclick');
        expect(address).not.toContain('onmouseover');
        expect(address).not.toContain('alert');
    });

    test('validates file size limits', async ({ page }) => {
        // Create oversized markdown (simulate 5MB file)
        const hugeContent = `# Huge Property Report\n${'x'.repeat(5000000)}`;
        
        const fileContent = new Blob([hugeContent], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'huge_file.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(hugeContent)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Should show error message for file too large
        const errorMessages = page.locator('.error, .alert, [role="alert"]');
        await expect(errorMessages.first()).toBeVisible();
        
        const errorText = await errorMessages.first().textContent();
        expect(errorText).toMatch(/size|large|limit/i);
    });

    test('rejects non-markdown file types', async ({ page }) => {
        // Try to upload an HTML file as markdown
        const htmlContent = `<html><body><script>alert('HTML injection')</script></body></html>`;
        
        const fileContent = new Blob([htmlContent], { type: 'text/html' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'malicious.html',
            mimeType: 'text/html',
            buffer: Buffer.from(htmlContent)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Should reject non-markdown content
        const errorMessages = page.locator('.error, .alert, [role="alert"]');
        await expect(errorMessages.first()).toBeVisible();
        
        const errorText = await errorMessages.first().textContent();
        expect(errorText).toMatch(/format|markdown|invalid/i);
    });

    test('preserves legitimate special characters and formatting', async ({ page }) => {
        const legitimateMarkdown = `# Property Analysis Report

**Property Address:** 123 Café Street, Apt #4B (Corner Unit)
**Purchase Price:** $300,000.50
**Monthly Rent:** €2,500.75
**Management:** 3.5% of gross income
**Custom Expense - Décor:** $500.00

## Notes
Property has *excellent* **curb appeal** and good ~investment potential~.
- Great location
- Recently renovated
- Near schools & shopping`;

        const fileContent = new Blob([legitimateMarkdown], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'legitimate.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(legitimateMarkdown)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Verify all legitimate content was preserved
        expect(await page.inputValue('#propertyAddress')).toContain('123 Café Street, Apt #4B (Corner Unit)');
        expect(await page.inputValue('#purchasePrice')).toBe('300000.50');
        expect(await page.inputValue('#monthlyRent')).toBe('2500.75');
        
        // Check management percentage was parsed correctly
        const managementValue = await page.inputValue('#management');
        expect(managementValue).toContain('3.5');
    });

    test('handles binary and special character attempts', async ({ page }) => {
        // Create content with null bytes and control characters
        const binaryContent = `# Property Report\n\x00\x01\x02**Address:** 123 Main\x00St\n**Price:** $300,000`;
        
        const fileContent = new Blob([binaryContent], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'binary_content.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(binaryContent)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Should show error for invalid characters
        const errorMessages = page.locator('.error, .alert, [role="alert"]');
        await expect(errorMessages.first()).toBeVisible();
        
        const errorText = await errorMessages.first().textContent();
        expect(errorText).toMatch(/invalid|character|format/i);
    });

    test('prevents CSV injection through property fields', async ({ page }) => {
        const csvInjectionMarkdown = `# Property Report
**Property Address:** =cmd|'/c calc'!A0
**Purchase Price:** =1+1+cmd|'/c notepad'!A0
**Monthly Rent:** @SUM(1+1)*cmd|'/c calc'!A0`;

        const fileContent = new Blob([csvInjectionMarkdown], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'csv_injection.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(csvInjectionMarkdown)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Check that formula injection was sanitized
        const address = await page.inputValue('#propertyAddress');
        expect(address).not.toContain('=cmd');
        expect(address).not.toContain('calc');
        expect(address).not.toContain('notepad');
        
        const price = await page.inputValue('#purchasePrice');
        expect(price).not.toContain('=');
        expect(price).not.toContain('cmd');
        
        const rent = await page.inputValue('#monthlyRent');
        expect(rent).not.toContain('@SUM');
        expect(rent).not.toContain('cmd');
    });

    test('maintains form state integrity after failed import', async ({ page }) => {
        // Fill form with legitimate data first
        await page.fill('#propertyAddress', 'Original Address');
        await page.fill('#purchasePrice', '250000');
        await page.fill('#monthlyRent', '2000');
        
        // Try to import malicious content
        const maliciousMarkdown = `<script>alert('xss')</script>Invalid content`;
        
        const fileContent = new Blob([maliciousMarkdown], { type: 'text/markdown' });
        
        const fileInput = page.locator('#markdownFileInput');
        await fileInput.setInputFiles({
            name: 'malicious.md',
            mimeType: 'text/markdown',
            buffer: Buffer.from(maliciousMarkdown)
        });

        await page.click('#loadMarkdownBtn');
        await page.waitForTimeout(1000);

        // Form should maintain original data if import fails
        const address = await page.inputValue('#propertyAddress');
        const price = await page.inputValue('#purchasePrice');
        const rent = await page.inputValue('#monthlyRent');
        
        // Either preserved original values or properly sanitized/cleared
        expect(address).not.toContain('<script>');
        expect(price).not.toContain('alert');
        expect(rent).not.toContain('xss');
        
        // Should show error message
        const errorMessages = page.locator('.error, .alert, [role="alert"]');
        await expect(errorMessages.first()).toBeVisible();
    });
});
