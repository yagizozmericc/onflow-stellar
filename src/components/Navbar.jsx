import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';
import ConnectWallet from './ConnectWallet';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isBorrower = user?.role === 'borrower';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar sticky-top">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          OnFlow
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" className="nav-item" onClick={toggleMenu}>Earn</NavLink>
          <NavLink to="/dashboard" className="nav-item" onClick={toggleMenu}>Dashboard</NavLink>
          {isBorrower && (
            <NavLink to="/borrow" className="nav-item" onClick={toggleMenu}>Borrow</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="nav-item" onClick={toggleMenu}>Admin</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/sdp-demo" className="nav-item" onClick={toggleMenu}>Stellar Disbursement Platform</NavLink>
          )}
        </div>

        <div className="wallet-section">
          <ConnectWallet />
          <button onClick={onLogout} className="profile-select-btn">
            Logout
          </button>
        </div>

        <div className="navbar-links">
          {/* This space is now available for future links if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
