import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useWalletStore } from "../stores/useWalletStore";
import "./SdpDisbursementDemo.css";

const SdpDisbursementDemo = () => {
  const { userRole } = useWalletStore();
  const [vaults, setVaults] = useState([]);
  const [loadingVaults, setLoadingVaults] = useState(true);
  const [selectedVaultId, setSelectedVaultId] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [disbursementAmount, setDisbursementAmount] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchVaults = async () => {
      setLoadingVaults(true);
      const querySnapshot = await getDocs(collection(db, "vaults"));
      const vaultsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVaults(vaultsData);
      setLoadingVaults(false);
    };
    fetchVaults();
  }, []);

  const selectedVault = useMemo(() => {
    return vaults.find((v) => v.id === selectedVaultId);
  }, [vaults, selectedVaultId]);

  const handleAddRecipient = async (e) => {
    e.preventDefault();
    if (!newRecipient || !selectedVault) return;

    setIsProcessing(true);
    setStatus({ type: 'loading', message: 'Adding recipient...' });
    const vaultRef = doc(db, "vaults", selectedVaultId);

    try {
      // Basic validation for Stellar address
      if (!/^G[A-Z0-9]{55}$/.test(newRecipient)) {
          throw new Error("Invalid Stellar public key format.");
      }

      await updateDoc(vaultRef, {
        recipients: arrayUnion(newRecipient),
      });

      // Update state locally for immediate feedback
      setVaults(
        vaults.map((v) =>
          v.id === selectedVaultId
            ? { ...v, recipients: [...(v.recipients || []), newRecipient] }
            : v
        )
      );
      setNewRecipient("");
      setStatus({ type: 'success', message: 'Recipient added successfully!' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Failed to add recipient.' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRemoveRecipient = async (recipientAddress) => {
    if (!selectedVault) return;
    
    setIsProcessing(true);
    setStatus({ type: 'loading', message: 'Removing recipient...' });
    const vaultRef = doc(db, "vaults", selectedVaultId);

    try {
      await updateDoc(vaultRef, {
        recipients: arrayRemove(recipientAddress),
      });
      
      setVaults(
        vaults.map((v) =>
          v.id === selectedVaultId
            ? { ...v, recipients: v.recipients.filter(r => r !== recipientAddress) }
            : v
        )
      );
      setStatus({ type: 'success', message: 'Recipient removed.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to remove recipient.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedVault || !selectedVault.recipients || selectedVault.recipients.length === 0) {
      setStatus({ type: 'error', message: 'No recipients to disburse to.' });
      return;
    }
    if (!disbursementAmount || Number(disbursementAmount) <= 0) {
        setStatus({ type: 'error', message: 'Please enter a valid amount.' });
        return;
    }

    setIsProcessing(true);
    setStatus({ type: 'loading', message: `Disbursing ${disbursementAmount} USDC to ${selectedVault.recipients.length} recipients...` });

    const promises = selectedVault.recipients.map(recipient => 
        fetch("http://localhost:5000/mock-sdp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination: recipient, amount: disbursementAmount }),
        }).then(res => res.json())
    );

    try {
        const results = await Promise.allSettled(promises);
        const successfulDisbursements = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
        const failedDisbursements = results.length - successfulDisbursements;
        
        let message = `${successfulDisbursements} disbursements were successful.`;
        if (failedDisbursements > 0) {
            message += ` ${failedDisbursements} failed.`;
        }
        setStatus({ type: 'success', message });

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'A critical error occurred. Is the mock backend running?' });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="sdp-demo-container">
      <h2>Stellar Disbursement Platform Management Console</h2>

      {loadingVaults ? (
        <p>Loading vaults...</p>
      ) : (
        <div className="sdp-section">
          <h3>1. Select a Vault</h3>
          <div className="form-group">
            <label htmlFor="vault-select">Choose a vault to manage its disbursement list.</label>
            <select
              id="vault-select"
              className="sdp-select"
              value={selectedVaultId}
              onChange={(e) => {
                setSelectedVaultId(e.target.value);
                setStatus({ type: '', message: '' });
              }}
            >
              <option value="">-- Select a Vault --</option>
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.projectName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedVault && (
        <>
          <div className="sdp-section">
            <h3>2. Manage Recipients</h3>
            <div className="vault-details">
                <p><strong>Project:</strong> {selectedVault.projectName}</p>
                <p><strong>Recipients Count:</strong> {selectedVault.recipients?.length || 0}</p>
            </div>
            
            <h4 style={{marginTop: '2rem'}}>Add New Recipient</h4>
            <form onSubmit={handleAddRecipient} className="add-recipient-form">
              <input
                className="sdp-input"
                placeholder="Enter new Stellar wallet address (G...)"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                disabled={isProcessing}
              />
              <button type="submit" className="sdp-btn" disabled={isProcessing}>
                Add
              </button>
            </form>

            <h4 style={{marginTop: '2rem'}}>Current Recipient List</h4>
            <ul className="recipient-list">
              {selectedVault.recipients && selectedVault.recipients.length > 0 ? (
                selectedVault.recipients.map((recipient) => (
                  <li key={recipient} className="recipient-item">
                    <span>{`${recipient.substring(0, 8)}...${recipient.substring(48)}`}</span>
                    <button 
                        onClick={() => handleRemoveRecipient(recipient)} 
                        className="sdp-btn sdp-btn-remove"
                        disabled={isProcessing}>
                      Remove
                    </button>
                  </li>
                ))
              ) : (
                <p>No recipients added for this vault yet.</p>
              )}
            </ul>
          </div>

          <div className="sdp-section">
            <h3>3. Initiate Disbursement</h3>
            <p style={{color: '#ccc', marginBottom: '1.5rem'}}>
                This will send the specified amount to ALL recipients in the list above via the mock SDP.
            </p>
            <div className="form-group">
                <label htmlFor="disbursement-amount">Amount per Recipient (USDC)</label>
                <input
                    id="disbursement-amount"
                    className="sdp-input"
                    type="number"
                    placeholder="e.g., 1000"
                    value={disbursementAmount}
                    onChange={(e) => setDisbursementAmount(e.target.value)}
                    disabled={isProcessing}
                />
            </div>
            <button onClick={handleDisburse} className="sdp-btn" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Disburse to ${selectedVault.recipients?.length || 0} Recipients`}
            </button>
          </div>
        </>
      )}

    {status.message && (
        <div className={`status-message status-${status.type}`}>
            {status.message}
        </div>
    )}

    </div>
  );
};

export default SdpDisbursementDemo; 