import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Shield, Calendar, DollarSign, AlertCircle, CheckCircle, Info } from 'lucide-react';

const MedicalEMICalculator = () => {
  const [formData, setFormData] = useState({
    surgeryCost: '',
    monthlyIncome: '',
    currentSavings: '',
    recoveryWeeks: '',
    downPayment: ''
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator');

  const calculateEMI = () => {
    const cost = parseFloat(formData.surgeryCost) || 0;
    const income = parseFloat(formData.monthlyIncome) || 0;
    const savings = parseFloat(formData.currentSavings) || 0;
    const recovery = parseInt(formData.recoveryWeeks) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;

    if (cost <= 0 || income <= 0) {
      alert('Please enter valid surgery cost and monthly income');
      return;
    }

    // Calculate loan amount after down payment
    const loanAmount = cost - downPayment;
    
    // Grace period calculation (recovery time converted to months)
    const gracePeriodMonths = Math.ceil(recovery / 4);
    
    // Maximum affordable EMI (35% of monthly income)
    const maxAffordableEMI = income * 0.35;
    
    // Standard loan tenure (24 months after grace period)
    const repaymentMonths = 24;
    
    // Dynamic interest rate based on recovery period
    // Base rate: 12%, increases with longer recovery to balance risk
    let interestRate = 0.12; // 12% base annual rate
    
    if (recovery <= 4) {
      interestRate = 0.12; // 12% for quick recovery (0-4 weeks)
    } else if (recovery <= 8) {
      interestRate = 0.14; // 14% for moderate recovery (5-8 weeks)
    } else if (recovery <= 12) {
      interestRate = 0.16; // 16% for longer recovery (9-12 weeks)
    } else {
      interestRate = 0.18; // 18% for extended recovery (12+ weeks)
    }
    
    const monthlyRate = interestRate / 12;
    
    // EMI calculation using reducing balance method
    const emiAmount = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) / 
                      (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
    
    // Adjusted EMI (capped at affordable amount)
    const adjustedEMI = Math.min(emiAmount, maxAffordableEMI);
    
    // Recalculate tenure if EMI is adjusted
    let finalTenure = repaymentMonths;
    if (adjustedEMI < emiAmount) {
      finalTenure = Math.ceil(
        Math.log(adjustedEMI / (adjustedEMI - loanAmount * monthlyRate)) / 
        Math.log(1 + monthlyRate)
      );
    }
    
    // Total repayment calculation
    const totalInterest = (adjustedEMI * finalTenure) - loanAmount;
    const totalRepayment = loanAmount + totalInterest;
    
    // Risk Assessment
    const riskScore = calculateRiskScore(cost, income, recovery, savings);
    
    // Affordability ratio
    const affordabilityRatio = (adjustedEMI / income) * 100;
    
    setResults({
      loanAmount,
      emiAmount: adjustedEMI,
      gracePeriodMonths,
      repaymentMonths: finalTenure,
      totalInterest,
      totalRepayment,
      maxAffordableEMI,
      riskScore,
      affordabilityRatio,
      interestRate: interestRate * 100, // Store as percentage
      firstEMIDate: new Date(Date.now() + gracePeriodMonths * 30 * 24 * 60 * 60 * 1000)
    });
    
    setActiveTab('results');
  };

  const calculateRiskScore = (cost, income, recovery, savings) => {
    let score = 0;
    
    // Cost to income ratio (max 40 points)
    const costToIncomeRatio = cost / income;
    if (costToIncomeRatio > 12) score += 40;
    else if (costToIncomeRatio > 8) score += 30;
    else if (costToIncomeRatio > 4) score += 20;
    else score += 10;
    
    // Recovery duration (max 30 points)
    if (recovery > 12) score += 30;
    else if (recovery > 8) score += 20;
    else if (recovery > 4) score += 10;
    else score += 5;
    
    // Savings buffer (max 30 points)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header-title {
          font-family: 'Playfair Display', serif;
        }
        
        .card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .input-field {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }
        
        .tab-button {
          background: transparent;
          border: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: #6b7280;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }
        
        .tab-button.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
        
        .progress-bar {
          background: #e5e7eb;
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease forwards;
        }
        
        .info-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }} className="fade-in">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Heart size={40} color="white" fill="white" />
            <h1 className="header-title" style={{ 
              fontSize: '48px', 
              color: 'white',
              fontWeight: '700'
            }}>
              Pay-As-You-Recover
            </h1>
          </div>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Medical EMI Calculator with Grace Period & Flexible Repayment
          </p>
        </div>

        {/* Main Card */}
        <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Tabs */}
          <div style={{ 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px',
            padding: '0 24px'
          }}>
            <button 
              className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} />
                Calculator
              </div>
            </button>
            <button 
              className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
              disabled={!results}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} />
                Results
              </div>
            </button>
            <button 
              className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} />
                About
              </div>
            </button>
          </div>

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div style={{ padding: '40px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '24px',
                color: '#1f2937',
                fontWeight: '700'
              }}>
                Calculate Your Repayment Plan
              </h2>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Surgery/Treatment Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="surgeryCost"
                    value={formData.surgeryCost}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Current Savings (₹)
                  </label>
                  <input
                    type="number"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Recovery Period (Weeks)
                  </label>
                  <input
                    type="number"
                    name="recoveryWeeks"
                    value={formData.recoveryWeeks}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Down Payment (₹)
                  </label>
                  <input
                    type="number"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <Info size={20} color="#667eea" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                      <strong>How it works:</strong> Your EMI is capped at 35% of your monthly income. 
                      You get a grace period equal to your recovery time before payments begin. 
                      Interest rate varies from 12%-18% based on recovery duration (longer recovery = higher rate to balance risk).
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={calculateEMI} className="btn-primary">
                Calculate Repayment Plan
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && results && (
            <div style={{ padding: '40px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '32px',
                color: '#1f2937',
                fontWeight: '700'
              }}>
                Your Personalized Repayment Plan
              </h2>

              {/* Key Metrics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex'
                    }}>
                      <DollarSign size={24} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Monthly EMI</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {formatCurrency(results.emiAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="info-badge">
                    {results.affordabilityRatio.toFixed(1)}% of income
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex'
                    }}>
                      <Calendar size={24} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Grace Period</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {results.gracePeriodMonths} months
                      </p>
                    </div>
                  </div>
                  <div className="info-badge">
                    First EMI: {formatDate(results.firstEMIDate)}
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex'
                    }}>
                      <TrendingUp size={24} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Loan Tenure</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {results.repaymentMonths} months
                      </p>
                    </div>
                  </div>
                  <div className="info-badge">
                    After grace period
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div style={{ 
                background: getRiskLevel(results.riskScore).bg,
                border: `2px solid ${getRiskLevel(results.riskScore).color}`,
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Shield size={24} color={getRiskLevel(results.riskScore).color} />
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                    Financial Risk Assessment
                  </h3>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Risk Level: {getRiskLevel(results.riskScore).level}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: getRiskLevel(results.riskScore).color }}>
                      {results.riskScore}/100
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${results.riskScore}%`,
                        background: getRiskLevel(results.riskScore).color
                      }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                  {results.riskScore >= 70 && 
                    "Higher risk detected. Consider increasing down payment or extending loan tenure for lower EMI. Building emergency savings is recommended."}
                  {results.riskScore >= 40 && results.riskScore < 70 && 
                    "Moderate risk level. Your repayment plan is manageable but maintain emergency savings and avoid additional debt during recovery."}
                  {results.riskScore < 40 && 
                    "Low risk profile. Your income comfortably supports this loan. Continue building savings for future healthcare needs."}
                </p>
              </div>

              {/* Repayment Summary */}
              <div style={{ 
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
                  Repayment Summary
                </h3>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: '15px' }}>Loan Amount</span>
                    <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>
                      {formatCurrency(results.loanAmount)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: '15px' }}>Interest Rate (Annual)</span>
                    <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>
                      {results.interestRate.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: '15px' }}>Total Interest</span>
                    <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>
                      {formatCurrency(results.totalInterest)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <span style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Total Repayment</span>
                    <span style={{ fontWeight: '700', color: '#667eea', fontSize: '18px' }}>
                      {formatCurrency(results.totalRepayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div style={{
                marginTop: '32px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle size={24} color="rgb(34, 197, 94)" />
                <p style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>
                  Your repayment plan has been calculated. Focus on recovery - payments begin after your grace period.
                </p>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div style={{ padding: '40px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '24px',
                color: '#1f2937',
                fontWeight: '700'
              }}>
                About This Calculator
              </h2>

              <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8' }}>
                <section style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                    The Problem
                  </h3>
                  <p style={{ marginBottom: '12px' }}>
                    Medical emergencies create sudden financial stress. Traditional EMI systems use fixed monthly 
                    payments without considering the patient's recovery time or reduced income after surgery. 
                    This increases financial pressure during a physically and emotionally difficult period.
                  </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                    Our Solution
                  </h3>
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
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                    How It Works
                  </h3>
                  <div style={{ 
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#1f2937' }}>1. Grace Period:</strong> No payments during recovery. 
                      Grace period = Recovery weeks ÷ 4 (converted to months)
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#1f2937' }}>2. Affordable EMI:</strong> Maximum EMI is capped at 35% 
                      of your monthly income based on standard affordability guidelines
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#1f2937' }}>3. Risk Assessment:</strong> Evaluated based on:
                    </p>
                    <ul style={{ paddingLeft: '24px' }}>
                      <li>Surgery cost vs income ratio</li>
                      <li>Recovery duration impact</li>
                      <li>Savings buffer availability</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                    Project Vision
                  </h3>
                  <p style={{ marginBottom: '12px' }}>
                    This hackathon project demonstrates innovation in healthcare finance by providing a humane 
                    and flexible financial solution for medical emergencies. While the current version uses 
                    rule-based calculations, future iterations can integrate advanced AI models for:
                  </p>
                  <ul style={{ paddingLeft: '24px' }}>
                    <li style={{ marginBottom: '8px' }}>Dynamic EMI adjustment based on recovery progress</li>
                    <li style={{ marginBottom: '8px' }}>Personalized financial recommendations</li>
                    <li style={{ marginBottom: '8px' }}>Predictive risk modeling using machine learning</li>
                    <li style={{ marginBottom: '8px' }}>Integration with health insurance and provider networks</li>
                  </ul>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px'
        }}>
          <p>Built for Hackathon 2025 | Compassionate Healthcare Finance</p>
        </div>
      </div>
    </div>
  );
};

export default MedicalEMICalculator;
