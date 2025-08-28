# 🚀 Deployment Guide
## GitHub Pages Setup for Rental Property Analysis Calculator

This guide explains how to deploy the Rental Property Analysis Calculator to GitHub Pages for public access.

---

## 📋 **Quick Deployment Steps**

### **1. Build for GitHub Pages**
```bash
# Build the production version
npm run build

# Or clean build (removes existing docs folder first)
npm run build:clean
```

### **2. Commit and Push**
```bash
# Add all files including the docs folder
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### **3. Configure GitHub Pages**
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Set **Source** to "Deploy from a branch"
4. Select **Branch**: `main`
5. Select **Folder**: `/docs`
6. Click **Save**

### **4. Access Your Site**
Your calculator will be available at:
```
https://[your-username].github.io/[repository-name]
```

---

## 🔧 **Build Process Details**

### **What Gets Included**
The GitHub Pages build includes only essential files:
- `index.html` (optimized for production)
- `js/calculator.js` (core calculation logic)
- `js/ui-controller.js` (UI interactions)
- `assets/` (images, favicon)
- `README.md` (GitHub Pages documentation)

### **What Gets Excluded**
Development and testing files are excluded:
- `node_modules/`
- `tests/` (all test files)
- `test-runner.html`
- `package.json` and `package-lock.json`
- `playwright.config.js`
- `.playwright/` and `test-results/`
- All `.md` documentation files

### **Optimizations Applied**
- Test runner links removed from HTML
- GitHub Pages specific meta tags added
- Clean, production-ready file structure
- Validation checks ensure all required files exist

---

## 🧪 **Testing Your Deployment**

### **Local Preview**
```bash
# Build and serve locally to test
npm run deploy:preview

# Visit http://localhost:8080 to test the production version
```

### **Production Validation**
```bash
# Run production-specific tests
npm run deploy:validate
```

### **Manual Testing Checklist**
- [ ] Calculator loads without errors
- [ ] All input fields work correctly
- [ ] Quick entry buttons function properly
- [ ] Calculations update in real-time
- [ ] Charts render correctly
- [ ] Save/Load markdown functionality works
- [ ] Mobile responsive design functions
- [ ] No JavaScript console errors

---

## 🔄 **Automated Deployment**

The repository includes GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that:

1. **Triggers on**: Push to `main` branch or manual workflow dispatch
2. **Builds**: Runs `node build-github-pages.js`
3. **Deploys**: Automatically publishes to GitHub Pages
4. **Validates**: Ensures build completion

### **Workflow Status**
Check deployment status in your repository's **Actions** tab.

---

## 📁 **File Structure**

### **Source Files (Development)**
```
residential_rental_analysis_calc/
├── index.html                 # Main application
├── js/
│   ├── calculator.js          # Core calculations
│   └── ui-controller.js       # UI logic
├── assets/                    # Images and assets
├── tests/                     # All test files
├── package.json               # Node.js dependencies
└── playwright.config.js       # Test configuration
```

### **Built Files (Production)**
```
docs/                          # GitHub Pages deployment
├── index.html                 # Production HTML (optimized)
├── js/
│   ├── calculator.js          # Core calculations
│   └── ui-controller.js       # UI logic
├── assets/                    # Images and assets
└── README.md                  # User documentation
```

---

## 🌐 **CDN Dependencies**

The application uses these external CDNs (no local files needed):
- **Tailwind CSS**: `https://cdn.tailwindcss.com`
- **Chart.js**: `https://cdn.jsdelivr.net/npm/chart.js`
- **Google Fonts**: Inter font family

All CDN resources are production-ready and have high availability.

---

## 🔍 **Troubleshooting**

### **Build Issues**
```bash
# If build fails, check file permissions and paths
ls -la index.html js/calculator.js js/ui-controller.js

# Verify all source files exist
npm run build
```

### **Deployment Issues**
1. **404 Error**: Ensure `/docs` folder is selected in GitHub Pages settings
2. **Blank Page**: Check browser console for JavaScript errors
3. **CSS Missing**: Verify Tailwind CSS CDN is accessible
4. **Charts Not Loading**: Confirm Chart.js CDN is loading

### **Testing Issues**
```bash
# If tests fail, verify the docs build
cd docs && python -m http.server 8080

# Run specific production tests
npx playwright test tests/e2e/github-pages-production.spec.js --headed
```

---

## 📊 **Performance Considerations**

### **Loading Speed**
- **HTML**: ~50KB (optimized)
- **JavaScript**: ~100KB total (calculator + UI)
- **CSS**: Loaded via CDN (cached)
- **Total Initial Load**: <200KB

### **Runtime Performance**
- **Calculations**: <50ms for complex scenarios
- **Chart Updates**: <100ms for 30-year projections
- **Form Interactions**: <10ms response time

---

## 🔒 **Security & Privacy**

### **Data Handling**
- **No Server**: All calculations run client-side
- **No Tracking**: No analytics or user data collection
- **Local Storage**: Save/load uses browser's file system only
- **HTTPS**: Served securely via GitHub Pages

### **External Dependencies**
- Tailwind CSS and Chart.js are loaded from trusted CDNs
- No user data is sent to external services
- All calculations are performed locally in the browser

---

## 📈 **Monitoring Deployment**

### **GitHub Actions Dashboard**
Monitor deployments at: `https://github.com/[username]/[repo]/actions`

### **GitHub Pages Dashboard**
Check status at: `https://github.com/[username]/[repo]/settings/pages`

### **Site Analytics**
GitHub Pages provides basic traffic analytics in the repository insights.

---

## 🎯 **Best Practices**

### **Before Deploying**
1. Test locally with `npm run deploy:preview`
2. Run full test suite with `npm test`
3. Validate build with `npm run deploy:validate`
4. Review changes in `docs/` folder

### **Ongoing Maintenance**
1. Rebuild after any source code changes
2. Test production build before committing
3. Monitor GitHub Actions for deployment status
4. Keep CDN dependencies up to date

---

## 🆘 **Support**

If you encounter deployment issues:

1. **Check Build Logs**: Review `npm run build` output
2. **Verify Files**: Ensure all required files exist in `docs/`
3. **Test Locally**: Use `npm run deploy:preview` to test
4. **GitHub Actions**: Check workflow logs for errors
5. **Browser Console**: Look for JavaScript errors on deployed site

Your calculator should be live and accessible to users worldwide! 🌍
