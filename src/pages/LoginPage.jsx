// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginPage.css';

const LoginPage = ({ setUser }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("investor");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    const userData = { name, role };
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    // Set user in App's state
    setUser(userData);
    navigate("/");
  };

  return (
    <div className="login-page-container">
      <div className="background-shapes">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
        <div className="shape shape4"></div>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Welcome to OnFlow</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <div className="input-group">
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="login-select"
          >
            <option value="investor">Investor</option>
            <option value="borrower">Borrower</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="login-button">
          Enter Platform
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
