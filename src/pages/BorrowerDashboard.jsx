import React, { useState, useMemo } from 'react';
import './BorrowerDashboard.css';

// --- Loan Details Configuration ---
const LOAN_DETAILS = {
  companyName: 'AgriFarm Innovations',
  principal: 50000,
  annualInterestRate: 12.5,
  termInMonths: 18,
  installmentsPaid: 3, // Simulate that 3 payments have been made
};

// --- Data Generation ---
const generateRepaymentSchedule = () => {
  const { principal, annualInterestRate, termInMonths, installmentsPaid } = LOAN_DETAILS;
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // Calculate monthly payment (annuity formula)
  const monthlyPayment =
    principal *
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termInMonths)) /
    (Math.pow(1 + monthlyInterestRate, termInMonths) - 1);

  const schedule = [];
  const startDate = new Date();
  
  for (let i = 1; i <= termInMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);
    
    let status = 'Upcoming';
    if (i < installmentsPaid) {
      status = 'Paid';
    } else if (i === installmentsPaid) {
      status = 'Pending';
    }

    schedule.push({
      id: i,
      installment: i,
      dueDate: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      amount: parseFloat(monthlyPayment.toFixed(2)),
      status: status,
    });
  }
  return schedule;
};

const BorrowerDashboard = () => {
  const [repayments, setRepayments] = useState(() => generateRepaymentSchedule());

  // Use useMemo to avoid recalculating on every render
  const summaryStats = useMemo(() => {
    const totalLoan = repayments.reduce((acc, p) => acc + p.amount, 0);
    const totalPaid = repayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
    const nextPayment = repayments.find(p => p.status !== 'Paid');
    return { totalLoan, totalPaid, nextPayment };
  }, [repayments]);

  const handleRepay = (id) => {
    console.log(`Repay button clicked for installment ID: ${id}`);
    alert(`Repaying installment ${id} for AgriFarm. (This is a placeholder action)`);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-upcoming';
    }
  };

  return (
    <div className="borrower-dashboard">
      <h1 className="page-title">{LOAN_DETAILS.companyName} Loan</h1>
      <p className="page-subtitle">Welcome back! Here's an overview of your loan repayment schedule.</p>

      {/* Loan Details Card */}
      <div className="loan-details-card">
        <div className="detail-item">
          <span className="detail-label">Total Loan</span>
          <span className="detail-value">${LOAN_DETAILS.principal.toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Interest Rate</span>
          <span className="detail-value">{LOAN_DETAILS.annualInterestRate}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Loan Term</span>
          <span className="detail-value">{LOAN_DETAILS.termInMonths} Months</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Repayable</h3>
          <p>${summaryStats.totalLoan.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Amount Repaid</h3>
          <p>${summaryStats.totalPaid.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Next Payment Due</h3>
          <p>{summaryStats.nextPayment ? summaryStats.nextPayment.dueDate : 'N/A'}</p>
        </div>
         <div className="summary-card">
          <h3>Next Payment Amount</h3>
          <p>${summaryStats.nextPayment ? summaryStats.nextPayment.amount.toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {/* Repayment Schedule Table */}
      <div className="repayment-scheme">
        <h2 className="table-title">Repayment Schedule</h2>
        <div className="repayment-table">
          <div className="table-header">
            <div className="header-cell">Installment</div>
            <div className="header-cell">Due Date</div>
            <div className="header-cell">Amount</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Action</div>
          </div>
          <div className="table-body">
            {repayments.map((payment) => (
              <div className="table-row" key={payment.id}>
                <div className="table-cell" data-label="Installment">#{payment.installment}</div>
                <div className="table-cell" data-label="Due Date">{payment.dueDate}</div>
                <div className="table-cell" data-label="Amount">${payment.amount.toFixed(2)}</div>
                <div className="table-cell" data-label="Status">
                  <span className={`status-badge ${getStatusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="table-cell" data-label="Action">
                  <button 
                    className="repay-btn"
                    onClick={() => handleRepay(payment.id)}
                    disabled={payment.status === 'Paid'}
                  >
                    {payment.status === 'Paid' ? 'Paid' : 'Repay Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard; 