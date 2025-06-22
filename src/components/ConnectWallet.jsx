import React, { useEffect, useState } from 'react';
import './ConnectWallet.css';
import { useWalletStore } from '@/stores/useWalletStore';

const ConnectWallet = () => {
  const {
    isConnected,
    address,
    isLoading,
    error,
    connect,
    disconnect,
    clearError
  } = useWalletStore();

  const [extensionStatus, setExtensionStatus] = useState('checking');

  // Extension durumunu kontrol et
  useEffect(() => {
    const checkExtension = async () => {
      try {
        // Freighter API'sini test et
        const { isConnected, requestAccess } = await import('@stellar/freighter-api');
        
        // Önce isConnected ile test et
        try {
          await isConnected();
          setExtensionStatus('available');
          return;
        } catch (error) {
          console.log('isConnected test error:', error);
        }
        
        // Sonra requestAccess ile test et
        try {
          await requestAccess();
          setExtensionStatus('available');
          return;
        } catch (error) {
          console.log('requestAccess test error:', error);
        }
        
        // Son çare olarak window.freighterApi kontrolü
        if (window.freighterApi) {
          setExtensionStatus('available');
          return;
        }
        
        setExtensionStatus('unavailable');
      } catch (error) {
        console.log('Extension check error:', error);
        setExtensionStatus('unavailable');
      }
    };

    checkExtension();
  }, []);

  // Cüzdan adresini kısalt
  const shortenAddress = (addr) =>
    addr ? `${addr.slice(0, 5)}...${addr.slice(-5)}` : '';

  const handleConnect = async () => {
    console.log('Connect button clicked');
    if (extensionStatus === 'unavailable') {
      alert('Freighter extension is not installed. Please install it.');
      return;
    }
    await connect();
  };

  const handleDisconnect = () => {
    console.log('Disconnect button clicked');
    disconnect();
  };

  // Extension yüklü değilse farklı mesaj göster
  if (extensionStatus === 'unavailable') {
    return (
      <div className="wallet-widget">
        <button
          className="wallet-button connect"
          disabled={true}
          style={{ backgroundColor: '#dc3545' }}
        >
          Freighter Required
        </button>
        <div className="wallet-error" style={{ position: 'static', marginTop: '8px' }}>
          <span>Freighter extension is not installed. Please install it.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-widget">
      {/* Debug bilgisi - sadece development'ta */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'absolute', 
          top: '-60px', 
          left: '0', 
          background: '#f0f0f0', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '10px',
          border: '1px solid #ccc'
        }}>
          Extension: {extensionStatus === 'available' ? '✅' : extensionStatus === 'checking' ? '⏳' : '❌'}
        </div>
      )}

      {isConnected ? (
        <>
          <span className="connection-indicator" />
          <span className="wallet-address-display" title={address}>
            {shortenAddress(address)}
          </span>
          <button
            onClick={handleDisconnect}
            className="wallet-button disconnect"
            disabled={isLoading}
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="wallet-button connect"
          disabled={isLoading || extensionStatus === 'checking'}
        >
          {isLoading ? 'Connecting...' : 
           extensionStatus === 'checking' ? 'Checking...' : 'Connect Wallet'}
        </button>
      )}

      {error && (
        <div className="wallet-error">
          <span>{error}</span>
          <button onClick={clearError} className="error-dismiss">×</button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
