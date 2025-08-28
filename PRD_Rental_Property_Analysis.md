# Product Requirements Document (PRD)
## Rental Property Analysis Calculator

### Document Information
- **Version**: 1.0
- **Date**: December 2024
- **Product**: BiggerPockets-Style Rental Analysis Web Calculator
- **Target Users**: Real estate investors, property analysts, financial advisors

---

## 1. Executive Summary

### 1.1 Product Vision
Create an intuitive, single-page web application that empowers real estate investors to analyze rental property investments with professional-grade calculations and visualizations, based on the proven BiggerPockets analysis framework.

### 1.2 Success Metrics
- **Primary**: Accurate calculation results matching industry standards
- **Secondary**: User completion rate >90% for full analysis
- **Tertiary**: Page load time <2 seconds, mobile compatibility

### 1.3 Target Audience
- **Primary**: Individual real estate investors (beginners to intermediate)
- **Secondary**: Real estate agents providing investment analysis
- **Tertiary**: Financial advisors and investment consultants

---

## 2. Product Overview

### 2.1 Core Value Proposition
Instantly transform complex rental property financial analysis into clear, actionable insights through an easy-to-use web interface that requires no software installation or technical expertise.

### 2.2 Key Differentiators
- **Simplicity**: Single-page application with no login required
- **Completeness**: Full 30-year financial projection analysis
- **Accuracy**: Industry-standard calculations based on BiggerPockets methodology
- **Visualization**: Interactive charts for long-term trend analysis
- **Accessibility**: Works offline, no data collection, completely private

---

## 3. User Stories and Requirements

### 3.1 Epic: Property Analysis Input
**As a real estate investor, I want to input property and financial details so that I can analyze the investment potential.**

#### User Stories:
1. **Property Information Entry**
   - As a user, I want to enter purchase price, closing costs, and repair estimates
   - As a user, I want input validation to prevent calculation errors
   - As a user, I want helpful tooltips explaining each field

2. **Financing Details**
   - As a user, I want to specify down payment and loan terms
   - As a user, I want the system to automatically calculate loan amount
   - As a user, I want to see mortgage payment calculations in real-time

3. **Income and Expense Tracking**
   - As a user, I want to enter all potential income sources
   - As a user, I want to input detailed expense categories
   - As a user, I want to add custom expense items

### 3.2 Epic: Financial Analysis and Calculations
**As a real estate investor, I want to see key financial metrics so that I can evaluate the investment opportunity.**

#### User Stories:
1. **Immediate Metrics Display**
   - As a user, I want to see cash flow calculations instantly
   - As a user, I want to understand Cash-on-Cash ROI
   - As a user, I want to see Cap Rate and NOI calculations

2. **Long-term Projections**
   - As a user, I want to see 30-year financial projections
   - As a user, I want to understand how property value appreciation affects returns
   - As a user, I want to see equity building over time

### 3.3 Epic: Data Visualization
**As a real estate investor, I want visual representations of financial data so that I can better understand long-term trends.**

#### User Stories:
1. **Cash Flow Visualization**
   - As a user, I want to see income, expenses, and cash flow trends over time
   - As a user, I want interactive charts with detailed data points
   - As a user, I want to identify break-even points and growth trends

2. **Equity and Value Growth**
   - As a user, I want to visualize property value appreciation
   - As a user, I want to see mortgage paydown progression
   - As a user, I want to understand total equity accumulation

---

## 4. Functional Requirements

### 4.1 Input Management

#### 4.1.1 Property Information Section
- **Purchase Price**: Currency input, required, range $1,000 - $50,000,000
- **Purchase Closing Costs**: Currency input, optional, default 2% of purchase price
- **Estimated Repair Costs**: Currency input, optional, default $0

#### 4.1.2 Financing Section
- **Down Payment**: Currency or percentage input, required, max = purchase price
- **Loan Amount**: Auto-calculated field (Purchase Price - Down Payment)
- **Loan Interest Rate**: Percentage input, required, range 0.1% - 15%
- **Amortized Over**: Dropdown selection, options: 10, 15, 20, 25, 30 years

#### 4.1.3 Income Section
- **Monthly Rent**: Currency input, required, minimum $1

#### 4.1.4 Expense Section
- **Property Taxes**: Monthly currency input, optional
- **Insurance**: Monthly currency input, optional
- **Management**: Currency or percentage input, optional
- **HOA Fees**: Monthly currency input, optional
- **Utilities**: Individual fields for electricity, gas, water/sewer, garbage
- **Custom Expenses**: Text label + currency input pairs (up to 5)

#### 4.1.5 Growth Projections Section
- **Annual Income Growth**: Percentage input, range 0% - 20%, default 3%
- **Annual Expense Growth**: Percentage input, range 0% - 20%, default 3%
- **Annual Property Value Growth**: Percentage input, range 0% - 20%, default 3%

### 4.2 Calculation Engine

#### 4.2.1 Initial Metrics
- **Total Cost of Project**: Purchase Price + Closing Costs + Repair Costs
- **Monthly Mortgage Payment**: Standard PMT formula calculation
- **Monthly Cash Flow**: Monthly Income - Monthly Expenses
- **Total Cash Needed**: Down Payment + Closing Costs + Repair Costs
- **Cash-on-Cash ROI**: (Annual Cash Flow / Total Cash Needed) × 100
- **NOI**: Annual Income - Annual Operating Expenses (excluding mortgage)
- **Pro Forma Cap Rate**: NOI / Total Cost of Project

#### 4.2.2 30-Year Projections
For each year (1-30):
- **Annual Income**: Previous year × (1 + Income Growth Rate)
- **Annual Expenses**: Previous year × (1 + Expense Growth Rate)
- **Annual Cash Flow**: Annual Income - Annual Expenses
- **Property Value**: Previous year × (1 + Property Value Growth Rate)
- **Loan Balance**: Calculated using amortization schedule
- **Equity**: Property Value - Loan Balance

### 4.3 Visualization Requirements

#### 4.3.1 Chart 1: Cash Flow Analysis
- **Type**: Multi-line chart
- **X-axis**: Years (0-30)
- **Y-axis**: Dollar amounts
- **Lines**: Annual Income (green), Annual Expenses (red), Cash Flow (blue)
- **Features**: Hover tooltips, legend, responsive sizing

#### 4.3.2 Chart 2: Equity and Value Growth
- **Type**: Multi-line chart
- **X-axis**: Years (0-30)
- **Y-axis**: Dollar amounts
- **Lines**: Property Value (green), Loan Balance (red), Equity (blue)
- **Features**: Hover tooltips, legend, responsive sizing

### 4.4 Results Display

#### 4.4.1 Key Metrics Dashboard
- Large, prominent display cards for primary metrics
- Color coding: Green for positive, red for negative, blue for neutral
- Formatting: Currency with proper thousands separators and 2 decimal places

#### 4.4.2 Projection Table
- Sortable table showing year-by-year projections
- Columns: Year, Income, Expenses, Cash Flow, Property Value, Loan Balance, Equity
- Export functionality (print-friendly formatting)

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Page Load Time**: < 2 seconds on 3G connection
- **Calculation Speed**: < 100ms for any input change
- **Chart Rendering**: < 500ms for initial load, < 200ms for updates
- **Memory Usage**: < 50MB total memory footprint

### 5.2 Usability Requirements
- **Learning Curve**: New users can complete analysis within 5 minutes
- **Error Recovery**: Clear error messages with suggested corrections
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile Support**: Fully functional on tablets (768px+ width)

### 5.3 Compatibility Requirements
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Operating Systems**: Windows 10+, macOS 10.15+, iOS 14+, Android 10+
- **Network**: Fully functional offline after initial load

### 5.4 Security Requirements
- **Data Privacy**: No data collection or transmission
- **Input Sanitization**: All inputs validated and sanitized
- **XSS Prevention**: Proper output encoding and escaping

---

## 6. User Experience Design

### 6.1 Layout and Navigation

#### 6.1.1 Page Structure
```
Header
├── BiggerPockets Branding
├── Application Title
└── Brief Description

Main Content
├── Input Form (Left 40%)
│   ├── Property Information
│   ├── Financing
│   ├── Income
│   ├── Expenses
│   └── Projections
├── Results Summary (Right 60%)
│   ├── Key Metrics Cards
│   ├── Charts Section
│   └── Projection Table

Footer
├── Legal Disclaimers
└── Attribution
```

#### 6.1.2 Responsive Behavior
- **Desktop (1200px+)**: Side-by-side layout
- **Tablet (768px-1199px)**: Stacked layout, full-width sections
- **Mobile (<768px)**: Out of scope (desktop/tablet only)

### 6.2 Visual Design

#### 6.2.1 Color Scheme
- **Primary**: BiggerPockets Green (#00A651)
- **Secondary**: Dark Gray (#333333)
- **Accent**: Blue (#007ACC)
- **Success**: Green (#28A745)
- **Warning**: Orange (#FFC107)
- **Danger**: Red (#DC3545)
- **Background**: Light Gray (#F8F9FA)

#### 6.2.2 Typography
- **Headers**: Sans-serif, bold, hierarchical sizing
- **Body Text**: Sans-serif, readable font size (16px minimum)
- **Numbers**: Monospace font for alignment
- **Input Labels**: Clear, descriptive, consistent formatting

#### 6.2.3 Interactive Elements
- **Buttons**: Rounded corners, hover effects, clear call-to-action styling
- **Form Fields**: Clean borders, focus states, validation styling
- **Charts**: Smooth animations, hover interactions, responsive legends

---

## 7. Technical Constraints

### 7.1 Architecture Constraints
- **Single Page Application**: All functionality in one HTML file
- **Client-Side Only**: No backend server or database
- **Local Execution**: Must work without internet connection
- **No Build Process**: Direct HTML/CSS/JS without compilation

### 7.2 Library Constraints
- **Chart Library**: Chart.js (industry standard, MIT license)
- **No Framework Dependencies**: Vanilla JavaScript only
- **CDN Libraries**: External libraries loaded from CDN with fallback
- **File Size Limit**: Total application < 2MB

---

## 8. Legal and Compliance

### 8.1 Required Disclaimers
1. **Investment Disclaimer**: "This tool is for informational purposes only and does not constitute investment advice."
2. **Accuracy Disclaimer**: "Calculations are estimates and should be verified independently."
3. **Risk Warning**: "Real estate investments involve risk and may lose value."
4. **Professional Advice**: "Consult with qualified professionals before making investment decisions."

### 8.2 Attribution Requirements
- BiggerPockets branding and logo display
- Attribution to original template source
- MIT license for open-source components

---

## 9. Success Criteria and Metrics

### 9.1 Launch Criteria
- [ ] All calculations match reference Excel model within 0.01% accuracy
- [ ] Cross-browser testing completed without major issues
- [ ] Performance benchmarks met on target devices
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Legal disclaimer review completed

### 9.2 Post-Launch Metrics
- **Functional Success**: Zero calculation errors reported
- **Performance Success**: <2% of users report performance issues
- **Usability Success**: >90% task completion rate in user testing

---

## 10. Risk Assessment

### 10.1 Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Browser compatibility issues | Medium | High | Extensive cross-browser testing |
| Performance on older devices | Medium | Medium | Performance optimization and testing |
| Chart library limitations | Low | Medium | Fallback to simple tables |
| Calculation accuracy | Low | High | Extensive validation against known tools |

### 10.2 User Experience Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Complex interface confusion | Medium | High | User testing and iterative design |
| Mobile usability issues | Low | Medium | Responsive design testing |
| Input validation frustration | Medium | Medium | Clear error messages and help text |

---

## 11. Future Roadmap (Out of Scope)

### 11.1 Phase 2 Enhancements
- Multi-property comparison tool
- Advanced tax calculation options
- Market data integration
- Scenario analysis (best/worst case)

### 11.2 Phase 3 Enhancements
- PDF export functionality
- Integration with real estate APIs
- Advanced analytics and reporting
- User account system with saved analyses

---

## Conclusion

This PRD defines a comprehensive yet focused rental property analysis tool that provides professional-grade calculations in an accessible format. The single-page approach ensures simplicity while the detailed requirements ensure accuracy and usability for the target audience of real estate investors.
