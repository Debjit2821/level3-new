'use client';

import React from 'react';
import { useTxStore } from '../../store/txStore';
import { StellarService } from '../../services/stellar';
import { useWalletStore } from '../../store/walletStore';
import {
  Receipt,
  ExternalLink,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function TransactionCenterPage() {
  const { transactions, retryTransaction, clearHistory } = useTxStore();
  const { network } = useWalletStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-orange-400" />
            Transaction Management Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Production lifecycle tracking for Soroban contract transactions with retry handlers & block explorer links.
          </p>
        </div>

        {transactions.length > 0 && (
          <button onClick={clearHistory} className="btn-secondary text-xs py-2 flex items-center space-x-1.5 self-start sm:self-auto">
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Transaction List Table */}
      <div className="glass-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Operation</th>
                <th className="px-6 py-4">Contract Involved</th>
                <th className="px-6 py-4">Transaction Hash</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Explorer / Retry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-slate-100">{tx.operation}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{tx.contract}</td>
                  <td className="px-6 py-4 font-mono text-xs text-orange-400">
                    {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{tx.timestamp}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {tx.status === 'failed' && (
                      <button
                        onClick={() => retryTransaction(tx.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 inline-flex items-center space-x-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}

                    <a
                      href={StellarService.getExplorerTxUrl(tx.hash, network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 inline-flex items-center space-x-1"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
