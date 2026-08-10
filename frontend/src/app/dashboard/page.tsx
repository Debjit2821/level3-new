'use client';

import React, { useState } from 'react';
import { useScholarshipStore } from '../../store/scholarshipStore';
import { useWalletStore } from '../../store/walletStore';
import { ApplicationStatus } from '../../types';
import {
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  UserCheck,
  Building2,
  User,
  Zap,
  Clock,
  Layers,
  Coins,
} from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, publicKey, connect } = useWalletStore();
  const {
    programs,
    applications,
    treasuryBalance,
    totalDisbursed,
    createProgram,
    applyScholarship,
    approveApplication,
    rejectApplication,
    triggerMilestonePayout,
    fundTreasury,
  } = useScholarshipStore();

  const [roleMode, setRoleMode] = useState<'admin' | 'student'>('admin');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  // Form states
  const [progTitle, setProgTitle] = useState('');
  const [progBudget, setProgBudget] = useState('2000');
  const [progMilestones, setProgMilestones] = useState('2');
  const [progAmountPerMs, setProgAmountPerMs] = useState('1000');

  const [studentName, setStudentName] = useState('');
  const [fundAmount, setFundAmount] = useState('1000');

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progTitle) return;
    await createProgram(
      progTitle,
      Number(progBudget),
      Number(progMilestones),
      Number(progAmountPerMs),
      publicKey || 'GBXN...4K90'
    );
    setProgTitle('');
    setShowCreateModal(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !studentName) return;
    await applyScholarship(
      selectedProgramId,
      studentName,
      publicKey || 'GC7K8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P'
    );
    setStudentName('');
    setShowApplyModal(false);
  };

  const handleFundVault = async () => {
    if (!fundAmount || Number(fundAmount) <= 0) return;
    await fundTreasury(Number(fundAmount), publicKey || 'GBXN...4K90');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending Approval</span>;
      case ApplicationStatus.Approved:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Approved & Active</span>;
      case ApplicationStatus.Rejected:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejected</span>;
      case ApplicationStatus.Completed:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar & Role Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-orange-400" />
            Scholarship Control Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage scholarship pools, student eligibility, applications, and inter-contract milestone payouts.
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setRoleMode('admin')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              roleMode === 'admin'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Administrator View</span>
          </button>
          <button
            onClick={() => setRoleMode('student')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              roleMode === 'student'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student View</span>
          </button>
        </div>
      </div>

      {!isConnected && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm flex items-center justify-between">
          <span>Connect your Stellar wallet to submit applications or authorize administrative actions.</span>
          <button onClick={connect} className="btn-primary text-xs py-1.5">Connect Wallet</button>
        </div>
      )}

      {/* ADMIN VIEW */}
      {roleMode === 'admin' && (
        <div className="space-y-8">
          {/* Admin Overview Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Treasury Pool</span>
                <Coins className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-black text-slate-100">{treasuryBalance.toLocaleString()} XLM</p>
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5"
                  placeholder="XLM"
                />
                <button onClick={handleFundVault} className="btn-secondary text-xs py-1.5">
                  Deposit Funds
                </button>
              </div>
            </div>

            <div className="glass-card p-6 border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Disbursed Funds</span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-slate-100">{totalDisbursed.toLocaleString()} XLM</p>
              <span className="text-xs text-slate-400">Cross-contract release count</span>
            </div>

            <div className="glass-card p-6 border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Actions</span>
                <PlusCircle className="w-5 h-5 text-blue-400" />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary text-xs py-2.5 w-full flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Scholarship Program</span>
              </button>
            </div>
          </div>

          {/* Active Programs Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Active Scholarship Programs
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {programs.map((prog) => (
                <div key={prog.id} className="glass-card p-6 border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-orange-400">Program #{prog.id}</span>
                      <h3 className="text-lg font-bold text-slate-100">{prog.title}</h3>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold">Active</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <div>
                      <p className="text-slate-500">Total Budget</p>
                      <p className="font-bold text-slate-200">{prog.totalBudget} XLM</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Milestones</p>
                      <p className="font-bold text-slate-200">{prog.milestoneCount}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Per Milestone</p>
                      <p className="font-bold text-slate-200">{prog.amountPerMilestone} XLM</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Applicants Management Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-400" />
              Student Application & Milestone Management
            </h2>

            <div className="glass-card overflow-hidden border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">App ID</th>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Program</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Milestones Paid</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {applications.map((app) => {
                      const prog = programs.find((p) => p.id === app.programId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-900/40">
                          <td className="px-6 py-4 font-mono text-xs text-orange-400">#{app.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-100">{app.studentName}</p>
                            <p className="text-xs font-mono text-slate-500">{app.student.substring(0, 6)}...{app.student.substring(app.student.length - 4)}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-200">{prog?.title || `Program #${app.programId}`}</td>
                          <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {app.paidMilestones} / {prog?.milestoneCount || '?'}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {app.status === ApplicationStatus.Pending && (
                              <>
                                <button
                                  onClick={() => approveApplication(app.id, publicKey || 'GBXN...')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectApplication(app.id, publicKey || 'GBXN...')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === ApplicationStatus.Approved && app.paidMilestones < (prog?.milestoneCount || 0) && (
                              <button
                                onClick={() => triggerMilestonePayout(app.id, publicKey || 'GBXN...')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-600 hover:to-amber-600 flex items-center space-x-1 ml-auto"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Pay Milestone #{app.paidMilestones + 1}</span>
                              </button>
                            )}

                            {app.status === ApplicationStatus.Completed && (
                              <span className="text-xs font-semibold text-slate-500">Fully Paid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT VIEW */}
      {roleMode === 'student' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Available Scholarship Programs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {programs.map((prog) => (
                <div key={prog.id} className="glass-card p-6 border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-orange-400">Program #{prog.id}</span>
                    <h3 className="text-xl font-bold text-slate-100">{prog.title}</h3>
                    <p className="text-xs text-slate-400">
                      Offers milestone payouts of <strong>{prog.amountPerMilestone} XLM</strong> per semester across <strong>{prog.milestoneCount} milestones</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProgramId(prog.id);
                      setShowApplyModal(true);
                    }}
                    className="btn-primary text-xs py-2.5 w-full flex items-center justify-center space-x-1.5 mt-4"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Apply for Scholarship</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Applications Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100">My Application & Payout Status</h2>

            <div className="glass-card p-6 border-slate-800 space-y-6">
              {applications.map((app) => {
                const prog = programs.find((p) => p.id === app.programId);
                const progressPct = prog ? Math.round((app.paidMilestones / prog.milestoneCount) * 100) : 0;

                return (
                  <div key={app.id} className="bg-slate-950 p-6 rounded-xl border border-slate-900 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-4">
                      <div>
                        <h4 className="font-bold text-slate-100 text-base">{prog?.title}</h4>
                        <p className="text-xs text-slate-400 font-mono">Applicant: {app.studentName}</p>
                      </div>
                      <div>{getStatusBadge(app.status)}</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Milestone Progress ({app.paidMilestones} / {prog?.milestoneCount} Paid)</span>
                        <span className="font-bold text-orange-400">{progressPct}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROGRAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 space-y-6 border-slate-700">
            <h3 className="text-xl font-bold text-slate-100">Create Scholarship Program</h3>
            <form onSubmit={handleCreateProgram} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  value={progTitle}
                  onChange={(e) => setProgTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:border-orange-500 outline-none"
                  placeholder="e.g. Stellar Developer Grant 2026"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Total Budget (XLM)</label>
                  <input
                    type="number"
                    required
                    value={progBudget}
                    onChange={(e) => setProgBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Milestones</label>
                  <input
                    type="number"
                    required
                    value={progMilestones}
                    onChange={(e) => setProgMilestones(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Per Milestone</label>
                  <input
                    type="number"
                    required
                    value={progAmountPerMs}
                    onChange={(e) => setProgAmountPerMs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Deploy Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY SCHOLARSHIP MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 space-y-6 border-slate-700">
            <h3 className="text-xl font-bold text-slate-100">Submit Student Application</h3>
            <form onSubmit={handleApply} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:border-orange-500 outline-none"
                  placeholder="e.g. Alex Mercer"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
