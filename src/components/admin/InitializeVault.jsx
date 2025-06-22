import React, { useState } from 'react';
import './InitializeVault.css';
import { getPublicKey, signTransaction } from "@stellar/freighter-api";
import { Server, Address, Operation, TransactionBuilder, scVal, xdr } from "@stellar/stellar-sdk";
import { useWalletStore } from '../../stores/useWalletStore';

const HORIZON_URL = "https://horizon-testnet.stellar.org";

const InitializeVault = () => {
    const { isConnected, address, connect } = useWalletStore();
    
    const [formData, setFormData] = useState({
        borrower: '',
        token: '',
        shareToken: '',
        cap: '',
        fundingDuration: '',
        installmentDates: '',
        installmentAmounts: '',
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConnectWallet = async () => {
        await connect();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);
        setError(null);

        if (!isConnected) {
            setError("Wallet is not connected. Please connect your wallet first.");
            setIsSubmitting(false);
            return;
        }

        try {
            const server = new Server(HORIZON_URL);
            const adminPublicKey = await getPublicKey();
            const sourceAccount = await server.loadAccount(adminPublicKey);

            // Parse inputs
            const installmentDatesParsed = formData.installmentDates.split(',').map(d => BigInt(d.trim()));
            const installmentAmountsParsed = formData.installmentAmounts.split(',').map(a => BigInt(a.trim()));
            const capParsed = BigInt(formData.cap);
            const fundingDurationParsed = BigInt(formData.fundingDuration);

            // Create ScVal arguments
            const contractArgs = [
                new Address(adminPublicKey).toScVal(),
                new Address(formData.borrower).toScVal(),
                new Address(formData.token).toScVal(),
                new Address(formData.shareToken).toScVal(),
                scVal.i128(capParsed),
                scVal.vec(installmentDatesParsed.map(d => scVal.u64(d))),
                scVal.vec(installmentAmountsParsed.map(a => scVal.i128(a))),
                scVal.u64(fundingDurationParsed),
            ];

            const tx = new TransactionBuilder(sourceAccount, {
                fee: "10000", // A standard fee
                networkPassphrase: "Test SDF Network ; September 2015",
            })
                .addOperation(
                    Operation.invokeContract({
                        contract: "CBH4BB55IEP7O23T627DXH5EY53ALLFSWS72WTH3JM56GQLYPQB55ILM", // TODO: Replace with your actual contract ID
                        function: "initialize",
                        args: contractArgs,
                    })
                )
                .setTimeout(30)
                .build();
            
            const signedTx = await signTransaction(tx.toXDR(), { network: "TESTNET" });
            const txResult = await server.submitTransaction(xdr.Transaction.fromXDR(signedTx, "base64"));
            
            setResult(txResult);

        } catch (err) {
            console.error(err);
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="init-vault-container">
            <h1>Initialize Vault</h1>
            
            {!isConnected && (
                <div className="warning-box">
                    <p>Wallet not connected. Please connect your wallet first.</p>
                    <button 
                        onClick={handleConnectWallet}
                        className="connect-wallet-btn"
                    >
                        Connect Wallet
                    </button>
                </div>
            )}

            {isConnected && (
                <div className="success-box">
                    ✅ Wallet connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="init-vault-form">
                <input name="borrower" value={formData.borrower} onChange={handleChange} placeholder="Borrower Address" required />
                <input name="token" value={formData.token} onChange={handleChange} placeholder="Token Contract Address" required />
                <input name="shareToken" value={formData.shareToken} onChange={handleChange} placeholder="Vault Share Token Contract Address" required />
                <input name="cap" value={formData.cap} onChange={handleChange} placeholder="Vault Cap (e.g., 1000000)" type="number" required />
                <input name="fundingDuration" value={formData.fundingDuration} onChange={handleChange} placeholder="Funding Duration (seconds)" type="number" required />
                <textarea name="installmentDates" value={formData.installmentDates} onChange={handleChange} placeholder="Installment Dates (comma-separated UNIX timestamps)" required />
                <textarea name="installmentAmounts" value={formData.installmentAmounts} onChange={handleChange} placeholder="Installment Amounts (comma-separated integers)" required />

                <button type="submit" disabled={isSubmitting || !isConnected}>
                    {isSubmitting ? 'Initializing...' : 'Initialize Vault'}
                </button>
            </form>

            {result && <div className="result-box success"><strong>Success!</strong> Transaction Hash: <a href={`${HORIZON_URL}/transactions/${result.hash}`} target="_blank" rel="noreferrer">{result.hash}</a></div>}
            {error && <div className="result-box error"><strong>Error:</strong> {error}</div>}
        </div>
    );
};

export default InitializeVault; 