// src/components/VaultCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VaultCard.css';

const VaultCard = ({ vault }) => {
  const navigate = useNavigate();

  const handleViewVault = () => {
    navigate(`/vault/${vault.id}`);
  };

  const fundedPercentage = vault.totalRaise > 0 ? (vault.raisedSoFar / vault.totalRaise) * 100 : 0;

  return (
    <div className="vault-card" onClick={handleViewVault}>
      <img 
        src={vault.imageUrl || 'https://via.placeholder.com/400x200.png?text=OnFlow'} 
        alt={vault.projectName} 
        className="vault-image" 
      />
      <div className="vault-content">
        <div className="card-header">
          <h3 className="vault-name">{vault.projectName}</h3>
          <span className={`vault-status ${vault.status === 'active' ? 'open' : 'closed'}`}>
            {vault.status === 'active' ? 'Open' : 'Closed'}
          </span>
        </div>
        
        <div className="funding-progress">
            <div className="progress-bar-background">
              <div className="progress-bar-foreground" style={{ width: `${fundedPercentage}%` }}></div>
            </div>
            <div className="progress-info">
              <span>{fundedPercentage.toFixed(2)}% funded</span>
              <span>Target: ${vault.totalRaise ? vault.totalRaise.toLocaleString() : 'N/A'}</span>
            </div>
        </div>

        <div className="vault-info">
          <div className="info-item">
            <strong>Term:</strong>
            <span>{vault.loanDuration || '-'}</span>
          </div>
          <div className="info-item">
            <strong>Est. APY:</strong>
            <span>{vault.interestRate ? `${vault.interestRate}%` : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;