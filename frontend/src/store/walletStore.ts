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
      // Demo mock fallback if extension unavailable
      const mockKey = 'GC7K8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P';
      set({
        publicKey: mockKey,
        isConnected: true,
        isConnecting: false,
        error: null,
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
