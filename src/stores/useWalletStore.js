import { create } from 'zustand';
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
  getNetworkDetails,
  WatchWalletChanges,
} from '@stellar/freighter-api';

let walletWatcher = null;

// Freighter extension'ını algılamak için güvenilir yöntem
const checkFreighterExtension = async () => {
  try {
    // Yöntem 1: Freighter API'sinin kendisini kullanarak kontrol
    const connectionResult = await isConnected();
    console.log('Freighter API test result:', connectionResult);
    
    // Eğer API çalışıyorsa extension yüklü demektir
    if (connectionResult !== undefined) {
      return true;
    }
  } catch (error) {
    console.log('Freighter API test error:', error);
  }
  
  try {
    // Yöntem 2: requestAccess ile test et
    const accessResult = await requestAccess();
    console.log('Freighter access test result:', accessResult);
    
    if (accessResult !== undefined) {
      return true;
    }
  } catch (error) {
    console.log('Freighter access test error:', error);
  }
  
  // Yöntem 3: window.freighterApi kontrolü
  if (window.freighterApi) {
    console.log('window.freighterApi found');
    return true;
  }
  
  // Yöntem 4: document.querySelector ile extension element kontrolü
  if (document.querySelector('freighter-extension')) {
    console.log('freighter-extension element found');
    return true;
  }
  
  // Yöntem 5: Chrome extension API kontrolü
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    console.log('Chrome extension API found');
    return true;
  }
  
  console.log('Freighter extension not found');
  return false;
};

export const useWalletStore = create((set, get) => ({
  isConnected: false,
  address: null,
  publicKey: null,
  balance: '0',
  network: 'testnet',
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  connect: async () => {
    console.log('Connect function called');
    set({ isLoading: true, error: null });
    try {
      if (typeof window === 'undefined') {
        throw new Error('Browser environment required');
      }

      console.log('Checking Freighter extension...');
      
      // Freighter extension'ının yüklü olup olmadığını kontrol et
      const extensionAvailable = await checkFreighterExtension();
      if (!extensionAvailable) {
        throw new Error('Freighter extension is not installed. Please install it and refresh the page.');
      }

      console.log('Freighter extension found, connection check...');

      const connectionResult = await isConnected();
      console.log('Connection result:', connectionResult);
      
      if (connectionResult.error) {
        throw new Error(`Freighter connection error: ${connectionResult.error}`);
      }
      
      if (!connectionResult.isConnected) {
        console.log('Freighter is not connected, requesting access...');
      }

      console.log('Access isteniyor...');
      const accessResult = await requestAccess();
      console.log('Access result:', accessResult);
      
      if (accessResult.error) {
        throw new Error(`Access error: ${accessResult.error}`);
      }

      console.log('Network detayları alınıyor...');
      const networkResult = await getNetworkDetails();
      console.log('Network result:', networkResult);
      
      if (networkResult.error) {
        throw new Error(`Network error: ${networkResult.error}`);
      }

      const networkMap = {
        TESTNET: 'testnet',
        PUBLIC: 'mainnet',
        FUTURENET: 'testnet',
        STANDALONE: 'testnet',
      };
      const mappedNetwork = networkMap[networkResult.network] || 'testnet';

      console.log('Connection successful!', {
        address: accessResult.address,
        network: mappedNetwork
      });

      set({
        isConnected: true,
        address: accessResult.address,
        publicKey: accessResult.address,
        balance: '100.0000000', // mock
        network: mappedNetwork,
        isLoading: false,
        error: null,
      });

      get().startWalletWatcher();
    } catch (err) {
      console.error('Connect error:', err);
      set({
        isConnected: false,
        address: null,
        publicKey: null,
        balance: '0',
        isLoading: false,
        error: err.message || 'Connection failed',
      });
    }
  },

  disconnect: () => {
    if (walletWatcher) walletWatcher.stop();
    walletWatcher = null;
    set({
      isConnected: false,
      address: null,
      publicKey: null,
      balance: '0',
      error: null,
    });
  },

  switchNetwork: async (network) => {
    set({ isLoading: true, error: null });
    try {
      const networkResult = await getNetwork();
      const current = networkResult.network === 'PUBLIC' ? 'mainnet' : 'testnet';
      if (current === network) return set({ isLoading: false });

      const message = network === 'mainnet'
        ? 'Mainnet (PUBLIC)'
        : 'Testnet';
      throw new Error(`Switch to ${message} manually in Freighter.`);
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  refreshBalance: async () => {
    const { isConnected, address } = get();
    if (!isConnected || !address) return;
    try {
      set({ balance: '100.0000000' }); // mock
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  },

  checkConnection: async () => {
    try {
      if (typeof window === 'undefined') return;
      const connectionResult = await isConnected();
      if (!connectionResult.isConnected) return get().disconnect();

      const { isConnected: storeConnected, address } = get();
      if (storeConnected && !address) {
        const result = await getAddress();
        if (!result.address) return get().disconnect();
        set({ address: result.address, publicKey: result.address });
      }
    } catch (err) {
      get().disconnect();
    }
  },

  startWalletWatcher: () => {
    if (walletWatcher) walletWatcher.stop();
    walletWatcher = new WatchWalletChanges(3000);
    walletWatcher.watch((changes) => {
      const { address: currAddr, network: currNet } = get();
      if (changes.address !== currAddr) {
        if (changes.address) {
          set({ address: changes.address, publicKey: changes.address, isConnected: true });
        } else {
          get().disconnect();
        }
      }
      const mappedNet = changes.network === 'PUBLIC' ? 'mainnet' : 'testnet';
      if (mappedNet !== currNet) {
        set({ network: mappedNet });
      }
    });
  },
}));
