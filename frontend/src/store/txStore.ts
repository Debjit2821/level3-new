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
      hash: '43bde87e6905fd0e9671a621da3eb4a42dbe8700af615dc0368475b50d2b3265',
      operation: 'Initialize Treasury Contract',
      contract: 'ScholarshipTreasury (CDO3...NIDQ)',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    },
    {
      id: 'tx-init-2',
      hash: '215508503a244dcb562a5c7df864a5383498423a6352b0357fb4001c5acdaa30',
      operation: 'Initialize Core Contract',
      contract: 'ScholarshipCore (CAK7...SP5Q)',
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
