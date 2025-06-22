import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getPublicKey } from "@stellar/freighter-api";

const BorrowerDashboard = () => {
  const [vaults, setVaults] = useState([]);
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    const fetchVaults = async () => {
      const pubKey = await getPublicKey();
      setWallet(pubKey);
      const q = query(collection(db, "vaults"), where("borrower", "==", pubKey));
      const querySnapshot = await getDocs(q);
      const result = [];
      querySnapshot.forEach((doc) => result.push({ id: doc.id, ...doc.data() }));
      setVaults(result);
    };
    fetchVaults();
  }, []);

  return (
    <div>
      <h3>Borrower Dashboard</h3>
      <p>Wallet: {wallet}</p>
      {vaults.length === 0 ? (
        <p>No vaults found for this borrower.</p>
      ) : (
        <ul>
          {vaults.map((vault) => (
            <li key={vault.id}>
              <strong>{vault.projectName}</strong> – Raise Target: {vault.totalRaise} XLM – Status: {vault.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BorrowerDashboard; 