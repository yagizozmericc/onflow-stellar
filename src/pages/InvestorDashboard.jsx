import React from 'react';
import './InvestorDashboard.css';
import InvestorVaultCard from '../components/InvestorVaultCard';
import StatsCard from '../components/StatsCard';
import { Wallet, BarChart2, CheckCircle } from 'lucide-react'; // Örnek ikonlar

// Mock Data - Gerçek uygulamada API'den veya state'ten gelecek
const investorData = {
  name: "Efe",
  walletAddress: "GABCD...WXYZ"
};

const statsData = [
  { title: "Total Deposited", value: "$15,250.75", icon: <BarChart2 size={24} /> },
  { title: "Total Claimed", value: "$1,830.20", icon: <CheckCircle size={24} /> },
  { title: "Active Vaults", value: "4", icon: <Wallet size={24} /> }
];

const vaultsData = [
  {
    name: "Stellar SME Growth Fund",
    token: "USDC",
    state: "Repayment",
    amountInvested: "5,000 USDC",
    claimableAmount: "0 USDC",
    repaymentProgress: 70,
  },
  {
    name: "Soroban Real Estate Dev",
    token: "XLM",
    state: "Claimable",
    amountInvested: "10,000 XLM",
    claimableAmount: "1,250 XLM",
    repaymentProgress: 100,
  },
  {
    name: "Aqua Agri-Tech EU",
    token: "EURC",
    state: "Funding",
    amountInvested: "2,500 EURC",
    claimableAmount: "0 EURC",
    repaymentProgress: 0,
  },
  {
    name: "OnFlow Carbon Credits",
    token: "USDC",
    state: "Closed",
    amountInvested: "3,000 USDC",
    claimableAmount: "0 USDC",
    repaymentProgress: 100,
  }
];

const InvestorDashboard = () => {
  return (
    <div className="investor-dashboard">
      <header className="dashboard-header">
        <div className="welcome-message">
          <h1>Hello, {investorData.name}</h1>
          <p className="wallet-address">{investorData.walletAddress}</p>
        </div>
      </header>

      <section className="stats-summary">
        {statsData.map((stat, index) => (
          <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </section>

      <section className="vaults-section">
        <div className="vaults-header">
          <h2>Your Vaults</h2>
          {/* Bonus: Filtreleme ve sıralama burada yer alabilir */}
        </div>
        <div className="investor-vaults-grid">
          {vaultsData.map((vault, index) => (
            <InvestorVaultCard key={index} vault={vault} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default InvestorDashboard; 