'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Activity,
  Award,
  Wallet,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { useScholarshipStore } from '../store/scholarshipStore';

export default function LandingPage() {
  const { treasuryBalance, totalDisbursed, programs, applications } = useScholarshipStore();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden glass-card p-8 sm:p-12 border-orange-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>Stellar Soroban Level 3 (Orange Belt) Production Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Decentralized <span className="gradient-text">Scholarship Payout</span> Protocol
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            Empower universities and institutions to create transparent scholarship pools on Stellar. 
            Features dual-contract treasury isolation, automated milestone payout execution, and real-time event streaming.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard" className="btn-primary flex items-center space-x-2 text-base px-6 py-3">
              <span>Launch Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/activity" className="btn-secondary flex items-center space-x-2 text-base px-6 py-3">
              <Activity className="w-5 h-5 text-orange-400" />
              <span>Live Activity Stream</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Vault Balance</span>
            <Coins className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{treasuryBalance.toLocaleString()} XLM</p>
          <span className="text-xs text-slate-400 mt-1">Secured in Treasury Contract</span>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Disbursed</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{totalDisbursed.toLocaleString()} XLM</p>
          <span className="text-xs text-slate-400 mt-1">Milestone Payouts Executed</span>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Active Programs</span>
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{programs.length}</p>
          <span className="text-xs text-slate-400 mt-1">On-chain Scholarship Pools</span>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Applications</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{applications.length}</p>
          <span className="text-xs text-slate-400 mt-1">Student Registrations</span>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-100">Enterprise Soroban Smart Contract Design</h2>
          <p className="text-slate-400 text-sm">
            Architected specifically to meet and exceed Stellar Level 3 (Orange Belt) production requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-3 border-slate-800 hover:border-orange-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Inter-Contract Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Decoupled business logic (`ScholarshipCore`) and funds security (`ScholarshipTreasury`). Core invokes Treasury via authenticated cross-contract calls.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3 border-slate-800 hover:border-orange-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Real-Time Event Streaming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Soroban RPC event monitoring propagates contract events (`ScholarshipCreated`, `Applied`, `Approved`, `Payout`) live to the UI feed without reloading.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3 border-slate-800 hover:border-orange-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Multi-Wallet Infrastructure</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Supports Freighter wallet integration, session persistence, automatic transaction tracking, and human-readable failure diagnostics.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Bullet List */}
      <section className="glass-card p-8 border-slate-800 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-100">Why On-Chain Scholarship Distribution?</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Guaranteed Milestone Release:</strong> Funds are locked in escrow and paid out instantly upon administrator milestone approval.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Immutable Auditability:</strong> Every applicant state transition and disbursement emits verifiable Soroban events.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Role-Based Security:</strong> Strict access control ensures only verified institution admins can authorize student grants.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>SMART CONTRACT ARCHITECTURE</span>
            <span className="text-orange-400 font-mono">soroban-sdk v21.4</span>
          </div>
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <div className="text-emerald-400">// Inter-contract milestone payout invocation</div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto text-slate-300">
              {`let treasury = ScholarshipTreasuryClient::new(&env, &treasury_addr);
treasury.release_funds(&app.student, &program.amount_per_milestone);`}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
