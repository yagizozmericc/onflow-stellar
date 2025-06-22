import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import './VaultPage.css';
import { getPublicKey, signTransaction } from "@stellar/freighter-api";
import { Server, Address, Operation, TransactionBuilder, scVal, xdr } from "@stellar/stellar-sdk";
import { useWalletStore } from '../stores/useWalletStore';
import CreditReportModal from '../components/CreditReportModal';

const HORIZON_URL = "https://horizon-testnet.stellar.org";

const InfoCard = ({ title, value }) => (
  <div className="info-card">
    <span className="info-card-title">{title}</span>
    <span className="info-card-value">{value || '-'}</span>
  </div>
);

const VaultPage = () => {
  const { vaultId } = useParams();
  const { address: walletAddress, isConnected } = useWalletStore();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoSlide, setInfoSlide] = useState(0);

  // State for deposit functionality
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreditReport, setShowCreditReport] = useState(false);

  useEffect(() => {
    const fetchVault = async () => {
      setLoading(true);
      const docRef = doc(db, 'vaults', vaultId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVault({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };
    fetchVault();
  }, [vaultId]);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
        setError("Please enter a valid amount to deposit.");
        return;
    }
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    if (!isConnected) {
        setError("Freighter wallet is not connected.");
        setIsSubmitting(false);
        return;
    }
    
    if (!vault?.contractAddress) {
        setError("This vault's on-chain contract address is not set. Cannot proceed.");
        setIsSubmitting(false);
        return;
    }

    try {
        const server = new Server(HORIZON_URL);
        const investorPublicKey = await getPublicKey();
        const sourceAccount = await server.loadAccount(investorPublicKey);
        
        // Stroops conversion (1 XLM = 10,000,000 stroops)
        const amountInStroops = BigInt(Number(amount) * 10000000);

        const contractArgs = [
            new Address(investorPublicKey).toScVal(),
            scVal.i128(amountInStroops),
        ];

        const tx = new TransactionBuilder(sourceAccount, {
                fee: "100000",
                networkPassphrase: "Test SDF Network ; September 2015",
            })
            .addOperation(
                Operation.invokeContract({
                    contract: vault.contractAddress,
                    function: "deposit",
                    args: contractArgs,
                })
            )
            .setTimeout(30)
            .build();
        
        const signedTx = await signTransaction(tx.toXDR(), { network: "TESTNET" });
        const txResult = await server.submitTransaction(xdr.Transaction.fromXDR(signedTx, "base64"));
        
        setResult(txResult);
        setAmount('');

    } catch (err) {
        console.error("Transaction Error:", err);
        setError(err.message || "An unknown error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="vault-page-container"><h2>Loading...</h2></div>;
  }

  if (!vault) {
    return <div className="vault-page-container"><h2>Vault not found</h2></div>;
  }
  
  const fundedPercentage = (vault.raisedSoFar / vault.totalRaise) * 100;

  const infoSlides = [
    [
      { title: 'Interest rate', value: vault.interestRate ? `${vault.interestRate}%` : null },
      { title: 'Project rating', value: vault.projectRating },
      { title: 'Loan duration', value: vault.loanDuration }
    ],
    [
      { title: 'Loan To Value (LTV)', value: vault.ltv ? `${vault.ltv}%` : null },
      { title: 'Collaterals', value: vault.collaterals }
    ],
    [
      { title: 'Security measures', value: vault.securityMeasures },
      { title: 'Financing purpose', value: vault.financingPurpose }
    ]
  ];

  const nextSlide = () => setInfoSlide((prev) => (prev + 1) % infoSlides.length);
  const prevSlide = () => setInfoSlide((prev) => (prev - 1 + infoSlides.length) % infoSlides.length);

  return (
    <div className="vault-page-container">
      <div className="main-content">
        <div className="project-details">
          <h1>{vault.projectName}</h1>
          {vault.location && <p className="location"><MapPin size={16} /> {vault.location}</p>}
          
          <div className="funding-progress">
            <div className="progress-info">
              <span>Supplied: {vault.raisedSoFar.toLocaleString()} USDC</span>
              <span>Pool Target: {vault.totalRaise.toLocaleString()} USDC</span>
            </div>
            <div className="progress-bar-background">
              <div className="progress-bar-foreground" style={{ width: `${fundedPercentage}%` }}></div>
            </div>
            <span className="funded-percentage">{fundedPercentage.toFixed(2)}% funded</span>
          </div>
        </div>
        <div className="investment-section">
          <img src={vault.imageUrl || 'https://via.placeholder.com/400x300'} alt={vault.projectName} className="project-image" />
          <input 
            type="number" 
            placeholder="Enter amount to supply" 
            className="investment-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="button-group">
            <button 
              className="invest-button"
              onClick={handleDeposit}
              disabled={isSubmitting || !isConnected}
            >
              {isSubmitting ? 'Supplying...' : 'Supply Funds'}
            </button>
            <button className="credit-report-button" onClick={() => setShowCreditReport(true)}>View Credit Report</button>
          </div>
          <div className="feedback-section">
            {!isConnected && (
                  <div className="warning-box">
                      Connect your wallet to supply funds.
                  </div>
              )}
            {result && (
                  <div className="result-box success">
                      <strong>Success!</strong> Tx: 
                      <a href={`${HORIZON_URL}/transactions/${result.hash}`} target="_blank" rel="noreferrer">
                          {result.hash.substring(0,10)}...
                      </a>
                  </div>
              )}
            {error && <div className="result-box error"><strong>Error:</strong> {error}</div>}
          </div>
        </div>
      </div>

      <div className="investment-info-section">
        <h2>Pool Details</h2>
        <div className="info-carousel">
          <button onClick={prevSlide} className="carousel-arrow"><ArrowLeft /></button>
          <div className="info-cards-container">
            {infoSlides[infoSlide].map(card => <InfoCard key={card.title} title={card.title} value={card.value} />)}
          </div>
          <button onClick={nextSlide} className="carousel-arrow"><ArrowRight /></button>
        </div>
      </div>

      <CreditReportModal 
        vault={vault}
        isOpen={showCreditReport}
        onClose={() => setShowCreditReport(false)}
      />
    </div>
  );
};

export default VaultPage; 