# Pay-As-You-Recover Medical EMI Calculator

A compassionate and innovative React application that provides flexible medical loan repayment plans aligned with patient recovery periods.

## 🎯 Project Overview

This hackathon project addresses the financial stress of medical emergencies by creating a recovery-based EMI calculator that considers the patient's healing time and income capacity, rather than imposing rigid payment schedules during difficult recovery periods.

### Key Features

- **Grace Period System**: Automatic grace period equal to recovery time before EMI payments begin
- **Income-Based EMI**: EMI capped at 35% of monthly income for affordability
- **Risk Assessment**: Intelligent financial risk scoring based on multiple factors
- **Interactive Dashboard**: Clean, professional UI with real-time calculations
- **Detailed Breakdown**: Complete repayment summary with interest and total cost

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Create a new React project:
```bash
npx create-react-app medical-emi-calculator
cd medical-emi-calculator
```

2. Install required dependencies:
```bash
npm install lucide-react
```

3. Replace the contents of `src/App.js` with the code from `medical-emi-calculator.jsx`

4. Start the development server:
```bash
npm start
```

5. Open your browser to `http://localhost:3000`

## 💡 How It Works

### 1. Grace Period Calculation
- Recovery weeks are converted to months (recovery_weeks ÷ 4)
- No EMI payments during this grace period
- Gives patients time to recover without financial pressure

### 2. Affordable EMI Calculation
- Maximum EMI = 35% of monthly income
- Uses reducing balance method for interest calculation
- Annual interest rate: 12%
- Standard tenure: 24 months (can be extended if needed)

### 3. Risk Assessment Scoring

The system evaluates financial risk on a scale of 0-100 based on:

**Cost-to-Income Ratio (40 points max)**
- Very High: Surgery cost > 12× monthly income (40 points)
- High: 8-12× monthly income (30 points)
- Medium: 4-8× monthly income (20 points)
- Low: <4× monthly income (10 points)

**Recovery Duration (30 points max)**
- Extended: >12 weeks (30 points)
- Long: 8-12 weeks (20 points)
- Moderate: 4-8 weeks (10 points)
- Short: <4 weeks (5 points)

**Savings Buffer (30 points max)**
- Critical: <10% of surgery cost (30 points)
- Low: 10-20% of surgery cost (20 points)
- Moderate: 20-30% of surgery cost (10 points)
- Good: >30% of surgery cost (5 points)

**Risk Levels:**
- **Low Risk (0-39)**: Green - Comfortable repayment capacity
- **Medium Risk (40-69)**: Orange - Manageable but requires caution
- **High Risk (70-100)**: Red - Significant financial strain

## 📊 Usage Example

### Sample Calculation

**Input:**
- Surgery Cost: ₹5,00,000
- Monthly Income: ₹50,000
- Current Savings: ₹1,00,000
- Recovery Period: 8 weeks
- Down Payment: ₹50,000

**Output:**
- Loan Amount: ₹4,50,000
- Grace Period: 2 months
- Monthly EMI: ₹17,500 (35% of income)
- Loan Tenure: 24 months
- Total Interest: ~₹1,20,000
- Risk Score: Medium (45-50)
- First EMI Date: 2 months from now

## 🎨 Design Philosophy

The application features:
- **Professional gradient background** (purple to violet) for trust and calmness
- **Clean card-based layout** for easy navigation
- **Playfair Display** serif font for headings (elegance)
- **Inter** sans-serif font for body text (readability)
- **Smooth animations** for better user experience
- **Color-coded risk indicators** for instant understanding
- **Responsive design** for all screen sizes

## 🔧 Technical Architecture

### Components Structure

```
MedicalEMICalculator (Main Component)
├── State Management
│   ├── formData (user inputs)
│   └── results (calculated outputs)
├── Calculator Tab
│   ├── Input Form
│   └── Information Banner
├── Results Tab
│   ├── Key Metrics Cards
│   ├── Risk Assessment Section
│   ├── Repayment Summary
│   └── Success Message
└── About Tab
    └── Documentation
```

### Key Functions

- `calculateEMI()`: Main calculation logic for EMI and loan details
- `calculateRiskScore()`: Risk assessment algorithm
- `getRiskLevel()`: Maps risk score to color-coded levels
- `formatCurrency()`: Indian Rupee formatting
- `formatDate()`: Date formatting for First EMI date

## 📈 Future Enhancements

### Planned AI Integration

1. **Machine Learning Risk Prediction**
   - Historical data analysis
   - Personalized risk assessment
   - Recovery time prediction

2. **Dynamic EMI Adjustment**
   - Real-time income tracking
   - Automatic payment schedule optimization
   - Seasonal income variations

3. **Smart Recommendations**
   - Personalized savings goals
   - Insurance plan suggestions
   - Alternative financing options

4. **Integration Capabilities**
   - Health insurance APIs
   - Hospital billing systems
   - Digital payment gateways
   - Credit bureau integration

## 🏥 Use Cases

1. **Planned Surgeries**: Calculate and plan repayment before procedure
2. **Emergency Medical Care**: Quick assessment of financial impact
3. **Chronic Treatment**: Long-term care financial planning
4. **Multiple Procedures**: Combined cost evaluation
5. **Family Medical Planning**: Household medical budget planning

## 🔒 Privacy & Security Considerations

For production deployment:
- No data is stored (client-side only calculation)
- No personal information collected
- No backend server required
- All calculations happen in browser
- Consider adding encryption for saved plans
- Implement HTTPS for deployment

## 📱 Responsive Design

The application is fully responsive:
- Desktop: Full multi-column layout
- Tablet: Adaptive grid system
- Mobile: Single-column stacked layout
- Touch-friendly buttons and inputs

## 🤝 Contributing

This is a hackathon project. Suggestions for improvements:

1. Add loan tenure customization
2. Include multiple interest rate options
3. Support for co-applicants
4. Export PDF reports
5. Save calculation history
6. Multi-language support
7. Insurance integration
8. EMI payment reminders

## 📝 License

This project is created for hackathon purposes. Feel free to use and modify.

## 👥 Team

Built for Hackathon 2025 - Compassionate Healthcare Finance Initiative

## 🙏 Acknowledgments

- Standard EMI calculation formulas
- Healthcare finance research
- User experience design principles
- Financial inclusion best practices

## 📞 Support

For questions or feedback about this project, please create an issue in the repository.

---

**Note**: This calculator provides estimates only. Actual loan terms may vary based on lender policies, credit scores, and other factors. Always consult with financial advisors for major healthcare financing decisions.
