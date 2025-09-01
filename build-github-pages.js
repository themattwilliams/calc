/**
 * Build script for GitHub Pages deployment
 * Creates a clean, static version of the app without Node.js dependencies
 */

const fs = require('fs');
const path = require('path');

// Configuration
const sourceDir = '.';
const buildDir = 'docs'; // GitHub Pages serves from /docs or /root
const filesToCopy = [
    'index.html',
    'js/calculator.js',
    'js/ui-controller.js',
    'js/temporary-financing.js',
    'js/security-utils.js',
    'assets/favicon.ico'
];

const directoriesToCopy = [
    'assets'
];

// Files to exclude from GitHub Pages
const excludePatterns = [
    'node_modules',
    'tests',
    'test-runner.html',
    'package.json',
    'package-lock.json',
    'playwright.config.js',
    '.playwright',
    'test-results',
    'playwright-report',
    '.git',
    '.gitignore',
    'build-github-pages.js',
    '*.md' // Documentation files
];

function createBuildDirectory() {
    if (fs.existsSync(buildDir)) {
        // For Windows, try multiple times to handle file locking
        let attempts = 3;
        while (attempts > 0) {
            try {
                fs.rmSync(buildDir, { recursive: true, force: true });
                break;
            } catch (rmError) {
                attempts--;
                if (attempts === 0) {
                    // If we can't remove it, just continue and overwrite files
                    console.warn(`⚠️ Could not remove ${buildDir}, continuing with overwrite...`);
                    break;
                } else {
                    // Wait a bit and try again
                    console.log(`⚠️ Retrying directory removal... (${attempts} attempts left)`);
                    require('child_process').execSync('timeout /t 1 /nobreak 2>nul || ping 127.0.0.1 -n 2 >nul', { stdio: 'ignore' });
                }
            }
        }
    }
    
    // Ensure the directory exists
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }
    console.log(`✓ Build directory ready: ${buildDir}`);
}

function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${src} → ${dest}`);
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`⚠ Directory not found: ${src}`);
        return;
    }
    
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
    console.log(`✓ Copied directory: ${src} → ${dest}`);
}

function createGitHubPagesHTML() {
    const sourceHTML = fs.readFileSync('index.html', 'utf8');
    
    // Remove test runner link for production
    const cleanHTML = sourceHTML.replace(
        /<a href="test-runner\.html"[^>]*>.*?<\/a>/s,
        ''
    );
    
    // Update title for GitHub Pages
    const updatedHTML = cleanHTML.replace(
        /<title>.*?<\/title>/,
        '<title>Rental Property Analysis Calculator</title>'
    );
    
    // Add GitHub Pages specific meta tags
    const metaTags = `
    <!-- GitHub Pages Meta Tags -->
    <meta name="description" content="Professional rental property investment analysis calculator with real-time calculations, financial projections, and comprehensive reporting.">
    <meta name="keywords" content="real estate, rental property, investment calculator, cash flow, ROI, cap rate, property analysis">
    <meta name="author" content="Rental Property Analysis Calculator">
    <meta property="og:title" content="Rental Property Analysis Calculator">
    <meta property="og:description" content="Professional rental property investment analysis with real-time calculations and comprehensive reporting.">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    `;
    
    const finalHTML = updatedHTML.replace('</head>', `${metaTags}</head>`);
    
    const destPath = path.join(buildDir, 'index.html');
    fs.writeFileSync(destPath, finalHTML);
    console.log(`✓ Created GitHub Pages HTML: ${destPath}`);
}

function createREADME() {
    const readmeContent = `# Rental Property Analysis Calculator

A professional rental property investment analysis tool with real-time calculations, financial projections, and comprehensive reporting.

## Features

- **Real-time Calculations**: Instant updates as you input data
- **Financial Metrics**: Cash flow, ROI, cap rate, NOI, and more
- **30-Year Projections**: Visual charts showing long-term investment performance
- **Quick Entry Buttons**: Fast input for common percentages and values
- **Save/Load**: Export analysis to Markdown and import previously saved analyses
- **Mobile Responsive**: Works perfectly on all devices

## How to Use

1. **Property Information**: Enter purchase price, closing costs, and repair estimates
2. **Financing**: Input down payment, interest rate, and loan terms
3. **Income & Expenses**: Add rental income and all operating expenses
4. **Growth Projections**: Set annual growth rates for income, expenses, and property value
5. **Review Results**: View instant calculations and 30-year projections
6. **Save Analysis**: Export your analysis to Markdown format

## Calculations Included

### Key Metrics
- Monthly Cash Flow
- Cash-on-Cash ROI
- Cap Rate (Capitalization Rate)
- Net Operating Income (NOI)
- Gross Rent Multiplier (GRM)
- Debt Coverage Ratio (DCR)
- Return on Equity (ROE)

### 30-Year Projections
- Income vs Expenses vs Cash Flow
- Property Value vs Equity Growth
- Loan Amortization Schedule

## Technology

Built with modern web technologies:
- **HTML5 & CSS3**: Responsive design with Tailwind CSS
- **Vanilla JavaScript**: Fast, lightweight calculations
- **Chart.js**: Interactive financial charts
- **Progressive Web App**: Works offline and can be installed

## Getting Started

Simply open the calculator in your web browser. No installation required!

## License

Open source - feel free to use and modify for your real estate investment analysis needs.
`;

    const destPath = path.join(buildDir, 'README.md');
    fs.writeFileSync(destPath, readmeContent);
    console.log(`✓ Created README.md for GitHub Pages`);
}

function createGitHubWorkflow() {
    const workflowDir = path.join(buildDir, '.github', 'workflows');
    fs.mkdirSync(workflowDir, { recursive: true });
    
    const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './docs'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
`;

    const workflowPath = path.join(workflowDir, 'deploy.yml');
    fs.writeFileSync(workflowPath, workflowContent);
    console.log(`✓ Created GitHub Actions workflow`);
}

function validateBuild() {
    console.log('\n🔍 Validating build...');
    
    // Check required files exist
    const requiredFiles = ['index.html', 'js/calculator.js', 'js/ui-controller.js'];
    const missing = requiredFiles.filter(file => !fs.existsSync(path.join(buildDir, file)));
    
    if (missing.length > 0) {
        console.error(`❌ Missing required files: ${missing.join(', ')}`);
        return false;
    }
    
    // Check HTML file size (should be reasonable)
    const htmlPath = path.join(buildDir, 'index.html');
    const htmlSize = fs.statSync(htmlPath).size;
    if (htmlSize < 10000) {
        console.error(`❌ HTML file seems too small: ${htmlSize} bytes`);
        return false;
    }
    
    // Check JavaScript files
    const jsFiles = ['js/calculator.js', 'js/ui-controller.js'];
    for (const jsFile of jsFiles) {
        const jsPath = path.join(buildDir, jsFile);
        if (!fs.existsSync(jsPath)) {
            console.error(`❌ Missing JavaScript file: ${jsFile}`);
            return false;
        }
        
        const jsSize = fs.statSync(jsPath).size;
        if (jsSize < 1000) {
            console.error(`❌ JavaScript file seems too small: ${jsFile} (${jsSize} bytes)`);
            return false;
        }
    }
    
    console.log('✅ Build validation passed');
    return true;
}

function main() {
    console.log('🚀 Building GitHub Pages deployment...\n');
    
    try {
        // Create build directory
        createBuildDirectory();
        
        // Copy required files
        filesToCopy.forEach(file => {
            if (fs.existsSync(file)) {
                copyFile(file, path.join(buildDir, file));
            } else {
                console.log(`⚠ File not found: ${file}`);
            }
        });
        
        // Copy directories
        directoriesToCopy.forEach(dir => {
            if (fs.existsSync(dir)) {
                copyDirectory(dir, path.join(buildDir, dir));
            } else {
                console.log(`⚠ Directory not found: ${dir}`);
            }
        });
        
        // Create optimized HTML for GitHub Pages
        createGitHubPagesHTML();
        
        // Create documentation
        createREADME();
        
        // Create GitHub Actions workflow
        createGitHubWorkflow();
        
        // Validate the build
        if (validateBuild()) {
            console.log('\n🎉 GitHub Pages build completed successfully!');
            console.log(`📁 Build output: ${buildDir}/`);
            console.log('\n📋 Next steps:');
            console.log('1. Commit the docs/ folder to your repository');
            console.log('2. Go to Settings → Pages in your GitHub repository');
            console.log('3. Set source to "Deploy from a branch"');
            console.log('4. Select "main" branch and "/docs" folder');
            console.log('5. Save and wait for deployment');
            console.log('\n🌐 Your app will be available at: https://[username].github.io/[repository-name]');
        } else {
            console.error('\n❌ Build validation failed');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run the build
main();
