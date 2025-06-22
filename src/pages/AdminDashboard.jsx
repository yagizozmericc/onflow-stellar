import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import InitializeVault from "../components/admin/InitializeVault";
import './AdminDashboard.css'; // Create this file for styling

const CreateVaultForm = () => {
  const [form, setForm] = useState({
    projectName: "",
    location: "",
    imageUrl: "",
    interestRate: "",
    projectRating: "A",
    loanDuration: "",
    ltv: "",
    collaterals: "",
    securityMeasures: "",
    financingPurpose: "",
    totalRaise: "",
    status: "active",
    borrower: "",
    contractAddress: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectName || !form.totalRaise) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await addDoc(collection(db, "vaults"), {
        ...form,
        totalRaise: Number(form.totalRaise),
        ltv: Number(form.ltv),
        interestRate: Number(form.interestRate),
        raisedSoFar: 0,
        createdAt: Timestamp.now(),
      });
      alert("Vault successfully created!");
      // Reset form
      setForm({
        projectName: "", location: "", imageUrl: "", interestRate: "",
        projectRating: "A", loanDuration: "", ltv: "", collaterals: "",
        securityMeasures: "", financingPurpose: "", totalRaise: "",
        status: "active", borrower: "", contractAddress: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("An error occurred while creating the vault.");
    }
  };

  const inputStyle = { display: 'block', marginBottom: 14, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #444', background: '#2c3344', color: '#fff' };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 500, color: '#ccc' };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#1f2533', padding: '2rem', borderRadius: '12px' }}>
      <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '1rem', marginBottom: '2rem' }}>Create New Vault</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <label style={labelStyle}>Project Name</label>
          <input name="projectName" placeholder="e.g., Solarveil" onChange={handleChange} value={form.projectName} required style={inputStyle} />

          <label style={labelStyle}>Location</label>
          <input name="location" placeholder="e.g., Espoo, Finland" onChange={handleChange} value={form.location} style={inputStyle} />
          
          <label style={labelStyle}>Image URL</label>
          <input name="imageUrl" placeholder="https://example.com/image.png" onChange={handleChange} value={form.imageUrl} style={inputStyle} />
          
          <label style={labelStyle}>Interest Rate (%)</label>
          <input name="interestRate" type="number" placeholder="e.g., 8.5" onChange={handleChange} value={form.interestRate} style={inputStyle} />

          <label style={labelStyle}>Project Rating</label>
          <select name="projectRating" onChange={handleChange} value={form.projectRating} style={inputStyle}>
            <option>A</option> <option>B</option> <option>C</option> <option>D</option>
          </select>

          <label style={labelStyle}>Loan Duration</label>
          <input name="loanDuration" placeholder="e.g., 18 months" onChange={handleChange} value={form.loanDuration} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Loan To Value (LTV) (%)</label>
          <input name="ltv" type="number" placeholder="e.g., 68" onChange={handleChange} value={form.ltv} style={inputStyle} />
          
          <label style={labelStyle}>Collaterals</label>
          <input name="collaterals" placeholder="e.g., No issued collateral yet" onChange={handleChange} value={form.collaterals} style={inputStyle} />

          <label style={labelStyle}>Security Measures</label>
          <input name="securityMeasures" placeholder="e.g., Panel inventory collateral" onChange={handleChange} value={form.securityMeasures} style={inputStyle} />

          <label style={labelStyle}>Financing Purpose</label>
          <textarea name="financingPurpose" placeholder="Describe the purpose of the financing" rows="3" onChange={handleChange} value={form.financingPurpose} style={{...inputStyle, height: 'auto'}} />
          
          <label style={labelStyle}>Contract Address (Soroban)</label>
          <input name="contractAddress" placeholder="C..." onChange={handleChange} value={form.contractAddress} required style={inputStyle} />

          <label style={labelStyle}>Total Raise Target (USDC)</label>
          <input name="totalRaise" placeholder="e.g., 150000" type="number" onChange={handleChange} value={form.totalRaise} required style={inputStyle} />
        </div>
      </div>

      <button type="submit" style={{ padding: '12px 24px', width: '100%', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, marginTop: '2rem', cursor: 'pointer' }}>Create Vault</button>
    </form>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create Vault
        </button>
        <button
          className={`tab-button ${activeTab === "init" ? "active" : ""}`}
          onClick={() => setActiveTab("init")}
        >
          Initialize Contract
        </button>
      </div>
      <div className="admin-tab-content">
        {activeTab === "create" && <CreateVaultForm />}
        {activeTab === "init" && <InitializeVault />}
      </div>
    </div>
  );
};

export default AdminDashboard;
