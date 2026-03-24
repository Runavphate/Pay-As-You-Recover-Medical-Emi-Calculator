import React, { useState } from 'react';
import './Mediemi.css';

const Mediemi = () => {
    const [activeTab, setActiveTab] = useState('calculator');
    const [inputs, setInputs] = useState({
        surgeryCost: '',
        monthlyIncome: '',
        currentSavings: '',
        recoveryWeeks: '',
        downPayment: ''
    });
    const [results, setResults] = useState(null);
    const [comparisonOptions, setComparisonOptions] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const calculateRiskScore = (cost, income, recovery, savings) => {
        let score = 0;
        const costToIncomeRatio = cost / income;
        if (costToIncomeRatio > 12) score += 40;
        else if (costToIncomeRatio > 8) score += 30;
        else if (costToIncomeRatio > 4) score += 20;
        else score += 10;
        
        if (recovery > 12) score += 30;
        else if (recovery > 8) score += 20;
        else if (recovery > 4) score += 10;
        else score += 5;
        
        const savingsToLoanRatio = savings / cost;
        if (savingsToLoanRatio < 0.1) score += 30;
        else if (savingsToLoanRatio < 0.2) score += 20;
        else if (savingsToLoanRatio < 0.3) score += 10;
        else score += 5;
        
        return Math.min(score, 100);
    };

    const getRiskLevel = (score) => {
        if (score >= 70) return { level: 'High', color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' };
        if (score >= 40) return { level: 'Medium', color: 'rgb(251, 146, 60)', bg: 'rgba(251, 146, 60, 0.1)' };
        return { level: 'Low', color: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)' };
    };

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    const generateComparisonOptions = (cost, income, savings, recovery) => {
        const options = [];
        let interestRate = 0.12;
        if (recovery <= 4) interestRate = 0.12;
        else if (recovery <= 8) interestRate = 0.14;
        else if (recovery <= 12) interestRate = 0.16;
        else interestRate = 0.18;
        
        const monthlyRate = interestRate / 12;
        const maxAffordableEMI = income * 0.35;
        const gracePeriodMonths = Math.ceil(recovery / 4);

        const downPaymentOptions = [
            { percent: 0, label: 'No Down Payment' },
            { percent: 10, label: '10% Down Payment' },
            { percent: 20, label: '20% Down Payment' },
            { percent: 30, label: '30% Down Payment' }
        ];

        const tenureOptions = [12, 18, 24, 36, 48];

        downPaymentOptions.forEach(dpOption => {
            const downPayment = cost * (dpOption.percent / 100);
            const loanAmount = cost - downPayment;

            tenureOptions.forEach(tenure => {
                const emiAmount = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                                (Math.pow(1 + monthlyRate, tenure) - 1);
                
                if (emiAmount <= maxAffordableEMI) {
                    const totalInterest = (emiAmount * tenure) - loanAmount;
                    const totalRepayment = loanAmount + totalInterest;
                    
                    options.push({
                        downPaymentPercent: dpOption.percent,
                        downPayment: downPayment,
                        downPaymentLabel: dpOption.label,
                        loanAmount: loanAmount,
                        tenure: tenure,
                        emiAmount: emiAmount,
                        totalInterest: totalInterest,
                        totalRepayment: totalRepayment,
                        affordabilityRatio: (emiAmount / income) * 100,
                        gracePeriod: gracePeriodMonths,
                        interestRate: interestRate * 100
                    });
                }
            });
        });

        options.sort((a, b) => a.emiAmount - b.emiAmount);
        return options;
    };

    const calculateEMI = () => {
        const cost = parseFloat(inputs.surgeryCost) || 0;
        const income = parseFloat(inputs.monthlyIncome) || 0;
        const savings = parseFloat(inputs.currentSavings) || 0;
        const recovery = parseInt(inputs.recoveryWeeks) || 0;
        const downPayment = parseFloat(inputs.downPayment) || 0;

        if (cost <= 0 || income <= 0) {
            alert('Please enter valid surgery cost and monthly income');
            return;
        }

        const loanAmount = cost - downPayment;
        const gracePeriodMonths = Math.ceil(recovery / 4);
        const maxAffordableEMI = income * 0.35;
        const repaymentMonths = 24;
        
        let interestRate = 0.12;
        if (recovery <= 4) interestRate = 0.12;
        else if (recovery <= 8) interestRate = 0.14;
        else if (recovery <= 12) interestRate = 0.16;
        else interestRate = 0.18;
        
        const monthlyRate = interestRate / 12;
        
        const emiAmount = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) / 
                        (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
        
        const adjustedEMI = Math.min(emiAmount, maxAffordableEMI);
        
        let finalTenure = repaymentMonths;
        if (adjustedEMI < emiAmount) {
            finalTenure = Math.ceil(
                Math.log(adjustedEMI / (adjustedEMI - loanAmount * monthlyRate)) / 
                Math.log(1 + monthlyRate)
            );
        }
        
        const totalInterest = (adjustedEMI * finalTenure) - loanAmount;
        const totalRepayment = loanAmount + totalInterest;
        const riskScore = calculateRiskScore(cost, income, recovery, savings);
        const affordabilityRatio = (adjustedEMI / income) * 100;
        const firstEMIDate = new Date(Date.now() + gracePeriodMonths * 30 * 24 * 60 * 60 * 1000);

        const calculatedOptions = generateComparisonOptions(cost, income, savings, recovery);

        setResults({
            loanAmount,
            emiAmount: adjustedEMI,
            gracePeriodMonths,
            repaymentMonths: finalTenure,
            totalInterest,
            totalRepayment,
            riskScore,
            affordabilityRatio,
            firstEMIDate,
            interestRate: interestRate * 100
        });
        
        setComparisonOptions(calculatedOptions);
        setActiveTab('results');
    };

    return (
        <div className="container">
            {/* Header */}
            <div className="header">
                <div className="header-title">
                    <svg className="heart-icon" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <h1>Pay-As-You-Recover</h1>
                </div>
                <p>Medical EMI Calculator with Grace Period & Flexible Repayment</p>
            </div>

            {/* Main Card */}
            <div className="card">
                {/* Tabs */}
                <div className="tabs">
                    <button 
                        className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('calculator')}
                    >Calculator</button>
                    <button 
                        className={`tab-button ${activeTab === 'results' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('results')}
                    >Results</button>
                    <button 
                        className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('comparison')}
                    >Compare Options</button>
                    <button 
                        className={`tab-button ${activeTab === 'about' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('about')}
                    >About</button>
                </div>

                {/* Calculator Tab */}
                {activeTab === 'calculator' && (
                    <div className="tab-content">
                        <h2>Calculate Your Repayment Plan</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Surgery/Treatment Cost (₹)</label>
                                <input 
                                    name="surgeryCost"
                                    type="number" 
                                    className="input-field" 
                                    placeholder="500000"
                                    value={inputs.surgeryCost}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Monthly Income (₹)</label>
                                <input 
                                    name="monthlyIncome"
                                    type="number" 
                                    className="input-field" 
                                    placeholder="50000"
                                    value={inputs.monthlyIncome}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Current Savings (₹)</label>
                                <input 
                                    name="currentSavings"
                                    type="number" 
                                    className="input-field" 
                                    placeholder="100000"
                                    value={inputs.currentSavings}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Recovery Period (Weeks)</label>
                                <input 
                                    name="recoveryWeeks"
                                    type="number" 
                                    className="input-field" 
                                    placeholder="8"
                                    value={inputs.recoveryWeeks}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Down Payment (₹)</label>
                                <input 
                                    name="downPayment"
                                    type="number" 
                                    className="input-field" 
                                    placeholder="50000"
                                    value={inputs.downPayment}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="info-box">
                            <p><strong>How it works:</strong> Your EMI is capped at 35% of your monthly income. You get a grace period equal to your recovery time before payments begin. Interest rate varies from 12%-18% based on recovery duration (longer recovery = higher rate to balance risk).</p>
                        </div>

                        <button className="btn-primary" onClick={calculateEMI}>Calculate Repayment Plan</button>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="tab-content">
                        <h2>Your Personalized Repayment Plan</h2>
                        
                        {!results ? (
                            <p style={{ color: '#6b7280' }}>Please run the calculator first to see your results.</p>
                        ) : (
                            <>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <p className="stat-label">Monthly EMI</p>
                                        <p className="stat-value">{formatCurrency(results.emiAmount)}</p>
                                        <div className="info-badge">{results.affordabilityRatio.toFixed(1)}% of income</div>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">Grace Period</p>
                                        <p className="stat-value">{results.gracePeriodMonths} months</p>
                                        <div className="info-badge">First EMI: {formatDate(results.firstEMIDate)}</div>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">Loan Tenure</p>
                                        <p className="stat-value">{results.repaymentMonths} months</p>
                                        <div className="info-badge">After grace period</div>
                                    </div>
                                </div>
                                
                                {(() => {
                                    const riskLevel = getRiskLevel(results.riskScore);
                                    return (
                                        <div className="risk-card" style={{ background: riskLevel.bg, border: `2px solid ${riskLevel.color}` }}>
                                            <h3>Financial Risk Assessment: {riskLevel.level}</h3>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${results.riskScore}%`, background: riskLevel.color }}></div>
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#4b5563' }}>Risk Score: {results.riskScore}/100</p>
                                        </div>
                                    );
                                })()}
                                
                                <div className="summary-box">
                                    <h3 style={{ marginBottom: '20px' }}>Repayment Summary</h3>
                                    <div className="summary-row">
                                        <span style={{ color: '#6b7280', fontSize: '15px' }}>Loan Amount</span>
                                        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '15px' }}>{formatCurrency(results.loanAmount)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span style={{ color: '#6b7280', fontSize: '15px' }}>Interest Rate (Annual)</span>
                                        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '15px' }}>{results.interestRate.toFixed(0)}%</span>
                                    </div>
                                    <div className="summary-row">
                                        <span style={{ color: '#6b7280', fontSize: '15px' }}>Total Interest</span>
                                        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '15px' }}>{formatCurrency(results.totalInterest)}</span>
                                    </div>
                                    <div className="summary-total">
                                        <span style={{ color: '#1f2937', fontSize: '16px', fontWeight: 600 }}>Total Repayment</span>
                                        <span style={{ fontWeight: 700, color: '#667eea', fontSize: '18px' }}>{formatCurrency(results.totalRepayment)}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Comparison Tab */}
                {activeTab === 'comparison' && (
                    <div className="tab-content">
                        <h2>Compare Financing Options</h2>
                        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
                            Explore different financing scenarios to find the lowest EMI that fits your budget. 
                            Each option shows different combinations of down payment and loan tenure.
                        </p>
                        
                        {comparisonOptions.length === 0 ? (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: '#991b1b', fontWeight: 600 }}>No affordable options available with current income. (Or calculator not run yet).</p>
                                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Consider running the calculator with an increased down payment or improved income before taking this loan.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                                    <p style={{ color: '#166534', fontWeight: 600, marginBottom: '4px' }}>✓ {comparisonOptions.length} Affordable Options Found</p>
                                    <p style={{ color: '#4b5563', fontSize: '14px' }}>All options below keep your EMI at or below 35% of your income</p>
                                </div>

                                <table className="comparison-table">
                                    <thead>
                                        <tr>
                                            <th>Option</th>
                                            <th>Down Payment</th>
                                            <th>Loan Amount</th>
                                            <th>Tenure</th>
                                            <th>Monthly EMI</th>
                                            <th>Grace Period</th>
                                            <th>Total Interest</th>
                                            <th>Total Repayment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonOptions.map((opt, index) => {
                                            let badge = '';
                                            let rowClass = '';
                                            
                                            if (index === 0) {
                                                badge = <span className="option-badge badge-best">LOWEST EMI</span>;
                                                rowClass = 'best-option';
                                            } else if (index === 1) {
                                                badge = <span className="option-badge badge-good">Good Option</span>;
                                            } else if (index === 2) {
                                                badge = <span className="option-badge badge-moderate">Alternative</span>;
                                            }

                                            return (
                                                <tr key={index} className={rowClass}>
                                                    <td>{badge}</td>
                                                    <td>{formatCurrency(opt.downPayment)}</td>
                                                    <td>{formatCurrency(opt.loanAmount)}</td>
                                                    <td>{opt.tenure} months</td>
                                                    <td style={{ fontWeight: 600, color: '#1f2937' }}>{formatCurrency(opt.emiAmount)}</td>
                                                    <td>{opt.gracePeriod} months</td>
                                                    <td>{formatCurrency(opt.totalInterest)}</td>
                                                    <td>{formatCurrency(opt.totalRepayment)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="tab-content">
                        <h2>About This Calculator</h2>

                        <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.8 }}>
                            <section style={{ marginBottom: '32px' }}>
                                <h3>The Problem</h3>
                                <p style={{ marginBottom: '12px' }}>
                                    Medical emergencies create sudden financial stress. Traditional EMI systems use fixed monthly 
                                    payments without considering the patient's recovery time or reduced income after surgery. 
                                    This increases financial pressure during a physically and emotionally difficult period.
                                </p>
                            </section>

                            <section style={{ marginBottom: '32px' }}>
                                <h3>Our Solution</h3>
                                <p style={{ marginBottom: '12px' }}>
                                    The Pay-As-You-Recover system provides a flexible repayment plan that:
                                </p>
                                <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                                    <li style={{ marginBottom: '8px' }}>Adjusts EMI based on your income capacity (capped at 35%)</li>
                                    <li style={{ marginBottom: '8px' }}>Provides grace period equal to your recovery time</li>
                                    <li style={{ marginBottom: '8px' }}>Assesses financial risk to help you plan better</li>
                                    <li style={{ marginBottom: '8px' }}>Reduces repayment stress during recovery</li>
                                </ul>
                            </section>

                            <section style={{ marginBottom: '32px' }}>
                                <h3>How It Works</h3>
                                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                                    <p style={{ marginBottom: '16px' }}>
                                        <strong style={{ color: '#1f2937' }}>1. Grace Period:</strong> No payments during recovery. 
                                        Grace period = Recovery weeks ÷ 4 (converted to months)
                                    </p>
                                    <p style={{ marginBottom: '16px' }}>
                                        <strong style={{ color: '#1f2937' }}>2. Affordable EMI:</strong> Maximum EMI is capped at 35% 
                                        of your monthly income based on standard affordability guidelines
                                    </p>
                                    <p style={{ marginBottom: '16px' }}>
                                        <strong style={{ color: '#1f2937' }}>3. Risk Assessment:</strong> Evaluated based on surgery cost vs income, recovery duration, and savings buffer
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="footer">
                <p>Built for Hackathon 2025 | Compassionate Healthcare Finance</p>
            </div>
        </div>
    );
};

export default Mediemi;
