import { describe, it, expect } from 'vitest';
import { useTxStore } from '../store/txStore';

describe('Transaction Lifecycle Management', () => {
  it('should record new transaction and update status', () => {
    const txId = useTxStore.getState().addTransaction({
      hash: '0x1234567890abcdef',
      operation: 'Deploy Contract',
      contract: 'ScholarshipCore',
      status: 'pending',
    });

    expect(txId).toBeDefined();
    let tx = useTxStore.getState().transactions.find((t) => t.id === txId);
    expect(tx?.status).toBe('pending');

    useTxStore.getState().updateStatus(txId, 'confirmed');
    tx = useTxStore.getState().transactions.find((t) => t.id === txId);
    expect(tx?.status).toBe('confirmed');
  });
});
