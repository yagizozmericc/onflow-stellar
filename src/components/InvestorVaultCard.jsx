import React from 'react';
import './InvestorVaultCard.css';

const VaultStateTag = ({ state }) => {
  const stateClass = `state-tag state-${state.toLowerCase()}`;
  return <span className={stateClass}>{state}</span>;
};

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const InvestorVaultCard = ({ vault }) => {
  const { name, token, state, amountInvested, claimableAmount, repaymentProgress } = vault;

  return (
    <div className="investor-vault-card">
      <div className="card-header">
        <h3 className="vault-name">{name}</h3>
        <VaultStateTag state={state} />
      </div>

      <div className="card-body">
        <div className="info-row">
          <span>Amount Invested</span>
          <strong>{amountInvested}</strong>
        </div>
        {state === 'Claimable' && (
          <div className="info-row claimable">
            <span>Claimable Amount</span>
            <strong>{claimableAmount}</strong>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="repayment-progress">
          <span>Repayment Progress</span>
          <ProgressBar progress={repaymentProgress} />
          <span>{repaymentProgress}%</span>
        </div>
        {state === 'Claimable' && (
          <button className="claim-now-btn">
            Claim Now
          </button>
        )}
      </div>
    </div>
  );
};

export default InvestorVaultCard; 