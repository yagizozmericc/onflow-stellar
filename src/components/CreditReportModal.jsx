import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Shield, BarChart3 } from 'lucide-react';
import './CreditReportModal.css';

const CreditReportModal = ({ vault, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Generate random but realistic risk analysis data
  const generateRiskData = () => {
    const baseScore = 65 + Math.floor(Math.random() * 30); // 65-95 range
    const riskLevel = baseScore >= 80 ? 'Low' : baseScore >= 65 ? 'Medium' : 'High';
    const riskColor = riskLevel === 'Low' ? '#10b981' : riskLevel === 'Medium' ? '#f59e0b' : '#ef4444';
    
    return {
      creditScore: baseScore,
      riskLevel,
      riskColor,
      riskFactors: [
        { name: 'Collateral Coverage', score: 85 + Math.floor(Math.random() * 15), weight: 0.3 },
        { name: 'Cash Flow Stability', score: 70 + Math.floor(Math.random() * 25), weight: 0.25 },
        { name: 'Market Position', score: 75 + Math.floor(Math.random() * 20), weight: 0.2 },
        { name: 'Management Quality', score: 80 + Math.floor(Math.random() * 15), weight: 0.15 },
        { name: 'Industry Risk', score: 60 + Math.floor(Math.random() * 30), weight: 0.1 }
      ],
      financialMetrics: {
        debtToEquity: (0.3 + Math.random() * 0.4).toFixed(2),
        currentRatio: (1.2 + Math.random() * 0.8).toFixed(2),
        operatingMargin: (8 + Math.random() * 12).toFixed(1),
        assetTurnover: (0.8 + Math.random() * 0.4).toFixed(2)
      },
      paymentHistory: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        status: Math.random() > 0.1 ? 'On Time' : 'Late',
        amount: Math.floor(50000 + Math.random() * 100000)
      })),
      stressTestResults: {
        scenario1: { name: 'Economic Downturn', impact: 'Low', probability: '15%' },
        scenario2: { name: 'Interest Rate Hike', impact: 'Medium', probability: '25%' },
        scenario3: { name: 'Market Volatility', impact: 'Low', probability: '30%' }
      }
    };
  };

  const [riskData] = useState(generateRiskData());

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (status) => {
    return status === 'On Time' ? <CheckCircle size={16} color="#10b981" /> : <AlertTriangle size={16} color="#ef4444" />;
  };

  if (!isOpen) return null;

  return (
    <div className="credit-report-overlay" onClick={onClose}>
      <div className="credit-report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Credit Risk Analysis Report</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="project-info">
          <h3>{vault.projectName}</h3>
          <p className="project-location">{vault.location}</p>
          <div className="project-rating">
            <span className="rating-badge">Rating: {vault.projectRating}</span>
          </div>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} />
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'financials' ? 'active' : ''}`}
            onClick={() => setActiveTab('financials')}
          >
            <DollarSign size={16} />
            Financial Metrics
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={16} />
            Payment History
          </button>
          <button 
            className={`tab-button ${activeTab === 'stress' ? 'active' : ''}`}
            onClick={() => setActiveTab('stress')}
          >
            <Shield size={16} />
            Stress Tests
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="risk-score-section">
                <div className="score-circle" style={{ borderColor: riskData.riskColor }}>
                  <div className="score-number" style={{ color: riskData.riskColor }}>
                    {riskData.creditScore}
                  </div>
                  <div className="score-label">Credit Score</div>
                </div>
                <div className="risk-level">
                  <h4>Risk Level: <span style={{ color: riskData.riskColor }}>{riskData.riskLevel}</span></h4>
                  <p>Based on comprehensive analysis of financial health, market position, and operational efficiency.</p>
                </div>
              </div>

              <div className="risk-factors">
                <h4>Risk Factor Analysis</h4>
                <div className="factors-grid">
                  {riskData.riskFactors.map((factor, index) => (
                    <div key={index} className="factor-card">
                      <div className="factor-header">
                        <span className="factor-name">{factor.name}</span>
                        <span className="factor-score" style={{ color: getScoreColor(factor.score) }}>
                          {factor.score}
                        </span>
                      </div>
                      <div className="factor-bar">
                        <div 
                          className="factor-progress" 
                          style={{ 
                            width: `${factor.score}%`, 
                            backgroundColor: getScoreColor(factor.score) 
                          }}
                        />
                      </div>
                      <div className="factor-weight">Weight: {(factor.weight * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recommendation">
                <h4>Investment Recommendation</h4>
                <div className="recommendation-content">
                  {riskData.creditScore >= 80 ? (
                    <div className="recommendation-positive">
                      <CheckCircle size={20} color="#10b981" />
                      <span>Strong investment opportunity with favorable risk-return profile.</span>
                    </div>
                  ) : riskData.creditScore >= 65 ? (
                    <div className="recommendation-neutral">
                      <AlertTriangle size={20} color="#f59e0b" />
                      <span>Moderate risk investment. Consider portfolio diversification.</span>
                    </div>
                  ) : (
                    <div className="recommendation-negative">
                      <TrendingDown size={20} color="#ef4444" />
                      <span>Higher risk investment. Requires careful consideration.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="financials-tab">
              <div className="metrics-grid">
                <div className="metric-card">
                  <h5>Debt-to-Equity Ratio</h5>
                  <div className="metric-value">{riskData.financialMetrics.debtToEquity}</div>
                  <div className="metric-description">Lower is better</div>
                </div>
                <div className="metric-card">
                  <h5>Current Ratio</h5>
                  <div className="metric-value">{riskData.financialMetrics.currentRatio}</div>
                  <div className="metric-description">Above 1.0 is healthy</div>
                </div>
                <div className="metric-card">
                  <h5>Operating Margin</h5>
                  <div className="metric-value">{riskData.financialMetrics.operatingMargin}%</div>
                  <div className="metric-description">Profitability indicator</div>
                </div>
                <div className="metric-card">
                  <h5>Asset Turnover</h5>
                  <div className="metric-value">{riskData.financialMetrics.assetTurnover}</div>
                  <div className="metric-description">Efficiency measure</div>
                </div>
              </div>

              <div className="financial-summary">
                <h4>Financial Health Summary</h4>
                <p>The company demonstrates solid financial fundamentals with healthy liquidity ratios and consistent profitability. The debt-to-equity ratio indicates moderate leverage, while the current ratio shows adequate short-term financial flexibility.</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <div className="payment-history">
                <h4>Payment History (Last 12 Months)</h4>
                <div className="history-table">
                  <div className="table-header">
                    <span>Month</span>
                    <span>Status</span>
                    <span>Amount</span>
                  </div>
                  {riskData.paymentHistory.map((payment, index) => (
                    <div key={index} className="table-row">
                      <span>{payment.month}</span>
                      <span className="status-cell">
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                      <span>${payment.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="history-summary">
                  <p>Payment reliability: <strong>{(riskData.paymentHistory.filter(p => p.status === 'On Time').length / riskData.paymentHistory.length * 100).toFixed(0)}%</strong></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stress' && (
            <div className="stress-tab">
              <div className="stress-scenarios">
                <h4>Stress Test Scenarios</h4>
                <div className="scenarios-grid">
                  {Object.entries(riskData.stressTestResults).map(([key, scenario]) => (
                    <div key={key} className="scenario-card">
                      <h5>{scenario.name}</h5>
                      <div className="scenario-details">
                        <div className="scenario-impact">
                          <span>Impact: </span>
                          <span className={`impact-${scenario.impact.toLowerCase()}`}>{scenario.impact}</span>
                        </div>
                        <div className="scenario-probability">
                          <span>Probability: {scenario.probability}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stress-summary">
                <h4>Stress Test Summary</h4>
                <p>The project shows resilience under various stress scenarios. The low to medium impact levels across different economic conditions suggest a well-structured financing arrangement with adequate risk mitigation measures in place.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditReportModal; 