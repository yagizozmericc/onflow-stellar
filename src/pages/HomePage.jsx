// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import './HomePage.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import VaultCard from '../components/VaultCard';

const HomePage = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVaults = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'vaults'));
      const vaultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVaults(vaultsData);
      setLoading(false);
    };
    fetchVaults();
  }, []);

  return (
    <div className="homepage-container">
      <h1 className="page-title">Pools of Real-World Assets</h1>
      <p className="page-subtitle">
        Supply liquidity to diversified and credit-assessed real-world asset pools to earn yield.
      </p>
      <div className="vaults-grid">
        {loading ? (
          <p>Loading pools...</p>
        ) : vaults.length > 0 ? (
          vaults.map((vault) => <VaultCard key={vault.id} vault={vault} />)
        ) : (
          <p style={{ color: '#aaa', fontSize: 18 }}>
            No active vaults. New vaults can be created from the admin panel.
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
