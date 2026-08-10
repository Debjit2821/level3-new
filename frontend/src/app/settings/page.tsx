'use client';

import React, { useState } from 'react';
import { useWalletStore } from '../../store/walletStore';
import { CONTRACT_ADDRESSES, RPC_SERVERS } from '../../services/stellar';
import { NetworkType } from '../../types';
import { logger } from '../../services/logger';
import {
  Settings,
  Globe,
  Sliders,
  Terminal,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { network, setNetwork, publicKey } = useWalletStore();
  const [coreAddress, setCoreAddress] = useState(CONTRACT_ADDRESSES.testnet.core);
  const [treasuryAddress, setTreasuryAddress] = useState(CONTRACT_ADDRESSES.testnet.treasury);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    logger.info('Settings updated', { network, coreAddress, treasuryAddress });
    setTimeout(() => setSaved(false), 3000);
  };

  const logs = logger.getLogs();

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-7 h-7 text-orange-400" />
          System Settings & Soroban RPC Config
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure active network environment, Soroban RPC server endpoints, custom contract deployments, and observability logs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="glass-card p-6 border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-400" />
            Network & RPC Target
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as NetworkType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:border-orange-500 outline-none capitalize"
              >
                <option value="testnet">Stellar Testnet (RPC)</option>
                <option value="standalone">Standalone Local Docker (localhost:8000)</option>
                <option value="mainnet">Stellar Mainnet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Soroban RPC Server URL</label>
              <input
                type="text"
                readOnly
                value={RPC_SERVERS[network]}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-400 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">ScholarshipCore Contract ID</label>
              <input
                type="text"
                value={coreAddress}
                onChange={(e) => setCoreAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono text-xs focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">ScholarshipTreasury Contract ID</label>
              <input
                type="text"
                value={treasuryAddress}
                onChange={(e) => setTreasuryAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono text-xs focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Config Saved Successfully
              </span>
            ) : <span />}

            <button type="submit" className="btn-primary text-xs flex items-center space-x-1.5">
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>

        {/* Observability Log Viewer */}
        <div className="glass-card p-6 border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-orange-400" />
              Observability & Client Diagnostic Logs
            </h3>
            <p className="text-xs text-slate-400">
              Live client-side log trace capturing RPC errors, state updates, and transaction events.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs space-y-2 h-72 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-500">No logs captured yet.</p>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="text-slate-300 border-b border-slate-900 pb-1">
                  <span className="text-slate-500">[{l.timestamp.substring(11, 19)}]</span>{' '}
                  <span
                    className={
                      l.level === 'ERROR'
                        ? 'text-rose-400 font-bold'
                        : l.level === 'TX'
                        ? 'text-amber-400 font-bold'
                        : 'text-emerald-400'
                    }
                  >
                    [{l.level}]
                  </span>{' '}
                  {l.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
