# Technical Requirements Document (TRD)
## Rental Property Analysis Web Application

### Document Information
- **Version**: 1.0
- **Date**: December 2024
- **Project**: Single-Page Rental Property Analysis Calculator
- **Based on**: BiggerPockets Rental Analysis Template

---

## 1. Project Overview

### 1.1 Objective
Create a single-page web application that replicates the functionality of the BiggerPockets rental analysis PDF template, providing real-time calculations and visualizations for rental property investment analysis.

### 1.2 Scope
- **In Scope**: Interactive web form, real-time calculations, data visualization, 30-year projections
- **Out of Scope**: Backend database, user authentication, data persistence, multi-page navigation

### 1.3 Technical Constraints
- Single HTML file with embedded CSS and JavaScript
- Local execution only (no server required)
- Modern browser compatibility (Chrome 90+, Firefox 88+, Safari 14+)
- Responsive design for desktop and tablet viewing

---

## 2. Architecture Overview

### 2.1 Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Chart.js or D3.js
- **Styling**: CSS Grid/Flexbox, CSS Variables
- **Math Library**: Native JavaScript Math object
- **No external dependencies requiring build process**

### 2.2 File Structure
```
rental-analysis-calculator/
├── index.html              # Main application file
├── css/
│   ├── styles.css          # Main stylesheet
│   └── charts.css          # Chart-specific styles
├── js/
│   ├── calculator.js       # Core calculation logic
│   ├── ui.js              # UI interaction handlers
│   ├── charts.js          # Chart generation and updates
│   └── validators.js      # Input validation
├── assets/
│   ├── biggerpockets-logo.png
│   └── favicon.ico
└── lib/
    └── chart.min.js       # Chart.js library
```

---

## 3. Implementation Phases

### Phase 1: Core Structure and Basic UI
**Estimated Time**: 2-3 hours

#### Implementation Checklist:
- [ ] Create base HTML structure with semantic elements
- [ ] Implement responsive CSS grid layout
- [ ] Create input form sections with proper labeling
- [ ] Add basic CSS styling and typography
- [ ] Implement mobile-responsive design
- [ ] Add BiggerPockets branding elements
- [ ] Validate HTML and CSS for compliance

#### Acceptance Criteria:
- [ ] Page loads without errors in target browsers
- [ ] All input fields are properly labeled and accessible
- [ ] Layout adapts to different screen sizes (min 768px width)
- [ ] Form styling is consistent and professional
- [ ] BiggerPockets logo displays correctly

---

### Phase 2: Input Validation and Form Handling
**Estimated Time**: 2-3 hours

#### Implementation Checklist:
- [ ] Implement real-time input validation
- [ ] Add number formatting for currency fields
- [ ] Create error messaging system
- [ ] Add input constraints (min/max values, decimal places)
- [ ] Implement form reset functionality
- [ ] Add input field tooltips/help text
- [ ] Create accessibility features (ARIA labels, keyboard navigation)

#### Acceptance Criteria:
- [ ] Invalid inputs show clear error messages
- [ ] Currency fields format correctly (e.g., $123,456.78)
- [ ] Percentage fields validate within reasonable ranges (0-100%)
- [ ] Required fields are clearly marked
- [ ] Form can be navigated entirely with keyboard
- [ ] Error states are announced to screen readers

---

### Phase 3: Core Calculation Engine
**Estimated Time**: 4-5 hours

#### Implementation Checklist:
- [ ] Implement mortgage payment calculation (PMT formula)
- [ ] Create loan amortization schedule generator
- [ ] Implement NOI (Net Operating Income) calculations
- [ ] Calculate Cash-on-Cash ROI
- [ ] Implement Pro Forma Cap Rate calculation
- [ ] Create 30-year projection algorithms
- [ ] Add compound growth calculations
- [ ] Implement equity calculation over time
- [ ] Add unit tests for all calculation functions

#### Acceptance Criteria:
- [ ] Mortgage payment calculations match standard PMT formula
- [ ] All financial metrics calculate correctly
- [ ] 30-year projections account for compound growth
- [ ] Calculations update in real-time as inputs change
- [ ] Edge cases handled (zero values, negative numbers)
- [ ] All calculations maintain precision to 2 decimal places

---

### Phase 4: Data Visualization
**Estimated Time**: 3-4 hours

#### Implementation Checklist:
- [ ] Integrate Chart.js library
- [ ] Create Income/Expenses/Cash Flow chart
- [ ] Create Equity/Loan Balance/Property Value chart
- [ ] Implement responsive chart sizing
- [ ] Add chart legends and axis labels
- [ ] Create chart color scheme matching design
- [ ] Add hover tooltips with detailed information
- [ ] Implement chart animation and transitions

#### Acceptance Criteria:
- [ ] Charts display correctly with sample data
- [ ] Charts update dynamically when inputs change
- [ ] Charts are readable on mobile devices
- [ ] Tooltips show formatted currency values
- [ ] Chart legends are clear and informative
- [ ] Charts maintain aspect ratio on resize

---

### Phase 5: Results Display and Summary
**Estimated Time**: 2-3 hours

#### Implementation Checklist:
- [ ] Create results summary section
- [ ] Implement key metrics display cards
- [ ] Add color coding for positive/negative values
- [ ] Create 30-year projection table
- [ ] Add export functionality (print-friendly CSS)
- [ ] Implement results highlighting for key metrics
- [ ] Add contextual help for metric definitions

#### Acceptance Criteria:
- [ ] All calculated values display with proper formatting
- [ ] Negative cash flow is clearly indicated
- [ ] Key metrics are prominently featured
- [ ] Projection table is readable and well-formatted
- [ ] Print version maintains readability
- [ ] Metric definitions are accessible via tooltips/help

---

### Phase 6: Legal Disclaimers and Final Polish
**Estimated Time**: 1-2 hours

#### Implementation Checklist:
- [ ] Add complete BiggerPockets disclaimers
- [ ] Implement proper legal text formatting
- [ ] Add "for informational purposes only" notices
- [ ] Create final visual polish and animations
- [ ] Optimize loading performance
- [ ] Add favicon and meta tags
- [ ] Implement final accessibility audit

#### Acceptance Criteria:
- [ ] All required legal disclaimers are present
- [ ] Page loads within 2 seconds on average connection
- [ ] All accessibility standards met (WCAG 2.1 AA)
- [ ] Cross-browser testing completed
- [ ] No console errors or warnings
- [ ] Professional appearance and smooth interactions

---

## 4. Technical Specifications

### 4.1 Input Field Specifications

| Field Name | Type | Validation | Format |
|------------|------|------------|---------|
| Purchase Price | Currency | > 0, < 10,000,000 | $XXX,XXX.XX |
| Purchase Closing Costs | Currency | >= 0, < 1,000,000 | $XXX,XXX.XX |
| Estimated Repair Costs | Currency | >= 0, < 1,000,000 | $XXX,XXX.XX |
| Down Payment | Currency | >= 0, <= Purchase Price | $XXX,XXX.XX |
| Loan Interest Rate | Percentage | 0.1 - 15.0 | X.XX% |
| Amortized Over | Integer | 1 - 50 years | XX years |
| Monthly Rent | Currency | > 0, < 100,000 | $X,XXX.XX |
| Property Taxes | Currency | >= 0, < 100,000 | $XXX.XX |
| Insurance | Currency | >= 0, < 10,000 | $XXX.XX |
| Management | Currency | >= 0, < 10,000 | $XXX.XX |
| HOA Fees | Currency | >= 0, < 5,000 | $XXX.XX |
| Annual Income Growth | Percentage | 0 - 20 | X.X% |
| Annual Expense Growth | Percentage | 0 - 20 | X.X% |
| Annual Property Value Growth | Percentage | 0 - 20 | X.X% |

### 4.2 Calculation Formulas

#### Monthly Mortgage Payment (PMT)
```javascript
PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
Where:
  P = Loan Principal
  r = Monthly Interest Rate (Annual Rate / 12)
  n = Number of Payments (Years * 12)
```

#### Cash-on-Cash ROI
```javascript
Cash_on_Cash_ROI = (Annual_Cash_Flow / Total_Cash_Invested) * 100
```

#### Net Operating Income (NOI)
```javascript
NOI = Annual_Gross_Income - Annual_Operating_Expenses
Note: Operating expenses exclude mortgage payments
```

#### Pro Forma Cap Rate
```javascript
Cap_Rate = NOI / Total_Cost_of_Project
```

### 4.3 Performance Requirements
- Initial page load: < 2 seconds
- Calculation response time: < 100ms
- Chart rendering: < 500ms
- Memory usage: < 50MB
- File size: Total < 2MB

### 4.4 Browser Compatibility
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers (iOS Safari, Chrome Mobile) ✅

---

## 5. Data Models

### 5.1 Property Input Model
```javascript
PropertyInput = {
  purchasePrice: Number,
  closingCosts: Number,
  repairCosts: Number,
  downPayment: Number,
  interestRate: Number,
  loanTerm: Number,
  monthlyRent: Number,
  propertyTaxes: Number,
  insurance: Number,
  management: Number,
  hoaFees: Number,
  utilities: {
    electricity: Number,
    gas: Number,
    waterSewer: Number,
    garbage: Number
  },
  customExpenses: Number,
  growthRates: {
    income: Number,
    expenses: Number,
    propertyValue: Number
  }
}
```

### 5.2 Calculation Results Model
```javascript
CalculationResults = {
  initialMetrics: {
    totalCost: Number,
    loanAmount: Number,
    monthlyPayment: Number,
    monthlyIncome: Number,
    monthlyExpenses: Number,
    monthlyCashFlow: Number,
    totalCashNeeded: Number,
    cashOnCashROI: Number,
    noi: Number,
    capRate: Number
  },
  projections: Array<{
    year: Number,
    income: Number,
    expenses: Number,
    cashFlow: Number,
    propertyValue: Number,
    loanBalance: Number,
    equity: Number,
    principalPayment: Number
  }>
}
```

---

## 6. Security and Privacy

### 6.1 Data Handling
- All calculations performed client-side
- No data transmission to external servers
- No data persistence beyond browser session
- No cookies or local storage used

### 6.2 Input Sanitization
- All numeric inputs validated and sanitized
- XSS prevention through proper escaping
- Input length limits enforced

---

## 7. Testing Strategy

### 7.1 Unit Testing
- [ ] Test all calculation functions with known inputs/outputs
- [ ] Test edge cases (zero values, maximum values)
- [ ] Test input validation functions

### 7.2 Integration Testing
- [ ] Test complete calculation workflow
- [ ] Test chart integration with calculation updates
- [ ] Test responsive design across devices

### 7.3 User Acceptance Testing
- [ ] Test with sample property scenarios
- [ ] Validate calculations against Excel/other tools
- [ ] Test usability with target users

---

## 8. Deployment

### 8.1 Deployment Process
1. Final testing in target browsers
2. Code minification and optimization
3. Asset optimization (image compression)
4. Final validation of all links and resources
5. Package for local distribution

### 8.2 Distribution
- Single ZIP file containing all assets
- README with setup instructions
- Sample data for testing
- Browser compatibility notes

---

## 9. Future Enhancements (Out of Scope)

- Multi-property comparison
- Data export to Excel/PDF
- Advanced tax calculations
- Market data integration
- Scenario analysis tools
- Backend data persistence
- User account management

---

## 10. Dependencies and Libraries

### 10.1 External Libraries
- **Chart.js** (v3.9+): For data visualization
  - CDN: https://cdn.jsdelivr.net/npm/chart.js
  - Size: ~60KB minified
  - License: MIT

### 10.2 Asset Requirements
- BiggerPockets logo (PNG format, transparent background)
- Favicon (16x16, 32x32, 48x48 sizes)
- Font files (if using custom fonts)

---

## Conclusion

This TRD provides a comprehensive roadmap for implementing the rental property analysis web application. Each phase builds upon the previous one, ensuring a systematic approach to development with clear checkpoints and acceptance criteria.
