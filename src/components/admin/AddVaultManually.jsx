import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const AddVaultManually = () => {
  const [form, setForm] = useState({
    contractAddress: "",
    borrower: "",
    projectName: "",
    totalRaise: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "vaults"), {
      ...form,
      totalRaise: Number(form.totalRaise),
      raisedSoFar: 0,
      status: "active",
      createdAt: Timestamp.now(),
    });
    alert("Vault added successfully!");
    setForm({ contractAddress: "", borrower: "", projectName: "", totalRaise: "" });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <h3>Add New Vault</h3>
      <input name="contractAddress" placeholder="Contract Address" onChange={handleChange} value={form.contractAddress} required />
      <input name="borrower" placeholder="Borrower Public Key" onChange={handleChange} value={form.borrower} required />
      <input name="projectName" placeholder="Project Name" onChange={handleChange} value={form.projectName} required />
      <input name="totalRaise" placeholder="Total Raise" type="number" onChange={handleChange} value={form.totalRaise} required />
      <button type="submit">Submit Vault</button>
    </form>
  );
};

export default AddVaultManually; 