import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../store/walletStore';

describe('WalletStore Integration', () => {
  beforeEach(() => {
    useWalletStore.setState({
      publicKey: null,
      network: 'testnet',
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  });

  it('should initialize with disconnected status', () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.publicKey).toBeNull();
  });

  it('should update network state', () => {
    useWalletStore.getState().setNetwork('standalone');
    expect(useWalletStore.getState().network).toBe('standalone');
  });

  it('should update state upon wallet connection', async () => {
    await useWalletStore.getState().connect();
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.publicKey).not.toBeNull();
  });

  it('should reset state upon disconnect', async () => {
    await useWalletStore.getState().connect();
    useWalletStore.getState().disconnect();
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.publicKey).toBeNull();
  });
});
