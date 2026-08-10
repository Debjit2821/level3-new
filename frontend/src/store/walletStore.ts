import { create } from 'zustand';
import { NetworkType } from '../types';
import { StellarService } from '../services/stellar';

interface WalletStoreState {
  publicKey: string | null;
  network: NetworkType;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: NetworkType) => void;
}

export const useWalletStore = create<WalletStoreState>((set) => ({
  publicKey: null,
  network: 'testnet',
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const pubKey = await StellarService.connectWallet();
      set({ publicKey: pubKey, isConnected: true, isConnecting: false });
    } catch (err: any) {
      set({
        publicKey: null,
        isConnected: false,
        isConnecting: false,
        error: err.message || 'Failed to connect wallet',
      });
    }
  },

  disconnect: () => {
    set({ publicKey: null, isConnected: false, error: null });
  },

  setNetwork: (network: NetworkType) => {
    set({ network });
  },
}));
