// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BorrowerDashboard from "./pages/BorrowerDashboard";
import AddVaultManually from "./components/admin/AddVaultManually";
import InvestorDashboard from "./pages/InvestorDashboard";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import VaultPage from "./pages/VaultPage";
import SdpDisbursementDemo from "./pages/SdpDisbursementDemo";
import './App.css';

function App() {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem('user');
  };

  // This function will be passed to LoginPage to ensure localStorage is updated
  const handleSetUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <Router>
      {!user ? (
        <LoginPage setUser={handleSetUser} />
      ) : (
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vault/:vaultId" element={<VaultPage />} />
              <Route path="/dashboard" element={<InvestorDashboard />} />
              <Route path="/borrow" element={<BorrowerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/sdp-demo" element={<SdpDisbursementDemo />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
