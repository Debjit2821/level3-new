import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Stellar SDK
vi.mock('@stellar/stellar-sdk', () => {
  return {
    Address: {
      fromString: vi.fn((addr) => ({
        toString: () => addr,
      })),
    },
    nativeToScVal: vi.fn(),
    xdr: {
      ScVal: {
        scvSymbol: vi.fn(),
      },
    },
    rpc: {
      Server: vi.fn(),
    },
    Contract: vi.fn(),
    TransactionBuilder: vi.fn(),
    Account: vi.fn(),
  };
});

// Mock StellarService module directly
vi.mock('../services/stellar', () => {
  return {
    CONTRACT_ADDRESSES: {
      testnet: {
        core: 'CA4M5OVK7445WJSKKJLYF5UGOVEQVX7OFNCYKWNAD6G7JB774A5CBHCN',
        treasury: 'CDQG5FE7GZNNVLROFBDMJ2K23QWR4UELPK7BWCQXWSQHIDXAKHMEVNXW',
      },
      standalone: {
        core: 'CCWHS3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F',
        treasury: 'CD3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G',
      },
    },
    StellarService: {
      initializeKit: vi.fn(),
      connectWallet: vi.fn().mockResolvedValue('GDT37UGSKAIKDUGC73VHAI6HASL27O5YTCHONKRIIH7AJBMBIQPWRVX3'),
      getExplorerTxUrl: vi.fn((hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`),
      getExplorerContractUrl: vi.fn((address: string) => `https://stellar.expert/explorer/testnet/contract/${address}`),
      submitTransaction: vi.fn().mockResolvedValue('mock-tx-hash-1234567890abcdef'),
    }
  };
});


