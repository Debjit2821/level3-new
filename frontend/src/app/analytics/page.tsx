'use client';

import React from 'react';
import { useScholarshipStore } from '../../store/scholarshipStore';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Coins,
  CheckCircle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { treasuryBalance, totalDisbursed, programs, applications } = useScholarshipStore();

  const totalCapacity = treasuryBalance + totalDisbursed;
  const utilizationRate = totalCapacity > 0 ? Math.round((totalDisbursed / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-orange-400" />
          Protocol Analytics & Fund Metrics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics on scholarship fund utilization, disbursement throughput, and program efficiency.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Utilization Rate</span>
            <PieChart className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{utilizationRate}%</p>
          <p className="text-xs text-slate-400">Total Pool Disbursed Ratio</p>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Avg Grant / Student</span>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">1,125 XLM</p>
          <p className="text-xs text-slate-400">Average Milestone Amount</p>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Active Students</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{applications.length}</p>
          <p className="text-xs text-slate-400">Registered Beneficiaries</p>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Contract Reliability</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">100%</p>
          <p className="text-xs text-slate-400">Inter-Contract Auth Verification</p>
        </div>
      </div>

      {/* Program Efficiency Breakdown */}
      <div className="glass-card p-6 border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Scholarship Program Performance
        </h3>
        <div className="space-y-4">
          {programs.map((prog) => (
            <div key={prog.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-200">{prog.title}</span>
                <span className="text-orange-400 font-mono">{prog.totalBudget} XLM Pool</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{prog.milestoneCount} Milestones • {prog.amountPerMilestone} XLM / Milestone</span>
                <span className="text-emerald-400">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
