import { create } from 'zustand';
import { TransactionRecord } from '../types';
import { logger } from '../services/logger';

interface TxStoreState {
  transactions: TransactionRecord[];
  addTransaction: (tx: Omit<TransactionRecord, 'id' | 'timestamp'>) => string;
  updateStatus: (
    id: string,
    status: TransactionRecord['status'],
    error?: string,
    hash?: string
  ) => void;
  retryTransaction: (id: string) => Promise<void>;
  clearHistory: () => void;
}

export const useTxStore = create<TxStoreState>((set, get) => ({
  transactions: [
    {
      id: 'tx-init-1',
      hash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef',
      operation: 'Initialize Treasury Contract',
      contract: 'ScholarshipTreasury (CT3H...F7G)',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    },
    {
      id: 'tx-init-2',
      hash: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12',
      operation: 'Initialize Core Contract',
      contract: 'ScholarshipCore (CBWH...E6F)',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3000000).toLocaleTimeString(),
    },
  ],

  addTransaction: (txData) => {
    const id = `tx-${Date.now()}`;
    const newTx: TransactionRecord = {
      ...txData,
      id,
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({ transactions: [newTx, ...state.transactions] }));
    logger.tx(`Transaction submitted: ${txData.operation}`, { id, status: txData.status });
    return id;
  },

  updateStatus: (id, status, error, hash) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, status, error: error ?? t.error, hash: hash ?? t.hash } : t
      ),
    }));
    logger.tx(`Transaction status updated`, { id, status, error, hash });
  },

  retryTransaction: async (id) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx) return;

    get().updateStatus(id, 'processing');
    logger.info(`Retrying transaction: ${tx.operation}`, { id });

    setTimeout(() => {
      get().updateStatus(
        id,
        'confirmed',
        undefined,
        `retry-${Math.random().toString(36).substring(2, 12)}`
      );
    }, 2500);
  },

  clearHistory: () => {
    set({ transactions: [] });
  },
}));
