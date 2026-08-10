import { create } from 'zustand';
import { ApplicationStatus, ScholarshipApplication, ScholarshipProgram } from '../types';
import { logger } from '../services/logger';
import { useTxStore } from './txStore';

interface ScholarshipStoreState {
  programs: ScholarshipProgram[];
  applications: ScholarshipApplication[];
  treasuryBalance: number;
  totalDisbursed: number;

  createProgram: (
    title: string,
    totalBudget: number,
    milestoneCount: number,
    amountPerMilestone: number,
    adminAddr: string
  ) => Promise<number>;

  applyScholarship: (programId: number, studentName: string, studentAddr: string) => Promise<number>;
  approveApplication: (applicationId: number, adminAddr: string) => Promise<void>;
  rejectApplication: (applicationId: number, adminAddr: string) => Promise<void>;
  triggerMilestonePayout: (applicationId: number, adminAddr: string) => Promise<number>;
  fundTreasury: (amount: number, fromAddr: string) => Promise<void>;
}

export const useScholarshipStore = create<ScholarshipStoreState>((set, get) => ({
  programs: [
    {
      id: 1,
      admin: 'GBXN...4K90',
      title: 'Stellar Orange Belt Web3 Fellowship 2026',
      totalBudget: 5000,
      milestoneCount: 4,
      amountPerMilestone: 1250,
      active: true,
    },
    {
      id: 2,
      admin: 'GBXN...4K90',
      title: 'Soroban Smart Contract Research Grant',
      totalBudget: 3000,
      milestoneCount: 3,
      amountPerMilestone: 1000,
      active: true,
    },
  ],

  applications: [
    {
      id: 1,
      programId: 1,
      student: 'GC7K8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P',
      studentName: 'Alex Mercer',
      status: ApplicationStatus.Approved,
      paidMilestones: 1,
    },
    {
      id: 2,
      programId: 2,
      student: 'GBCX...9K2L',
      studentName: 'Elena Rostova',
      status: ApplicationStatus.Pending,
      paidMilestones: 0,
    },
  ],

  treasuryBalance: 8750,
  totalDisbursed: 1250,

  createProgram: async (title, totalBudget, milestoneCount, amountPerMilestone, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      operation: `Create Scholarship Program "${title}"`,
      contract: 'ScholarshipCore',
      status: 'pending',
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    txStore.updateStatus(txId, 'processing');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newId = get().programs.length + 1;
    const newProg: ScholarshipProgram = {
      id: newId,
      admin: adminAddr,
      title,
      totalBudget,
      milestoneCount,
      amountPerMilestone,
      active: true,
    };

    set((state) => ({ programs: [...state.programs, newProg] }));
    txStore.updateStatus(txId, 'confirmed');
    logger.info(`Scholarship program created: ${title}`, { newId });
    return newId;
  },

  applyScholarship: async (programId, studentName, studentAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      operation: `Apply for Program #${programId}`,
      contract: 'ScholarshipCore',
      status: 'processing',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newAppId = get().applications.length + 1;
    const newApp: ScholarshipApplication = {
      id: newAppId,
      programId,
      student: studentAddr,
      studentName,
      status: ApplicationStatus.Pending,
      paidMilestones: 0,
    };

    set((state) => ({ applications: [...state.applications, newApp] }));
    txStore.updateStatus(txId, 'confirmed');
    logger.info(`Student applied to program #${programId}`, { newAppId, studentName });
    return newAppId;
  },

  approveApplication: async (applicationId, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      operation: `Approve Application #${applicationId}`,
      contract: 'ScholarshipCore',
      status: 'processing',
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === applicationId ? { ...app, status: ApplicationStatus.Approved } : app
      ),
    }));

    txStore.updateStatus(txId, 'confirmed');
    logger.info(`Application #${applicationId} approved`);
  },

  rejectApplication: async (applicationId, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      operation: `Reject Application #${applicationId}`,
      contract: 'ScholarshipCore',
      status: 'processing',
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === applicationId ? { ...app, status: ApplicationStatus.Rejected } : app
      ),
    }));

    txStore.updateStatus(txId, 'confirmed');
    logger.info(`Application #${applicationId} rejected`);
  },

  triggerMilestonePayout: async (applicationId, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      operation: `Trigger Milestone Payout (Inter-Contract Call: Core -> Treasury)`,
      contract: 'ScholarshipCore -> ScholarshipTreasury',
      status: 'processing',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const app = get().applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const prog = get().programs.find((p) => p.id === app.programId);
    if (!prog) throw new Error('Program not found');

    const newPaidCount = app.paidMilestones + 1;
    const isCompleted = newPaidCount >= prog.milestone_count;
    const payoutAmount = prog.amountPerMilestone;

    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              paidMilestones: newPaidCount,
              status: isCompleted ? ApplicationStatus.Completed : ApplicationStatus.Approved,
            }
          : a
      ),
      treasuryBalance: state.treasuryBalance - payoutAmount,
      totalDisbursed: state.totalDisbursed + payoutAmount,
    }));

    txStore.updateStatus(txId, 'confirmed');
    logger.tx(`Milestone #${newPaidCount} payout executed via Treasury contract`, {
      applicationId,
      amount: payoutAmount,
    });
    return newPaidCount;
  },

  fundTreasury: async (amount, fromAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      operation: `Fund Treasury Vault with ${amount} XLM`,
      contract: 'ScholarshipTreasury',
      status: 'processing',
    });

    await new Promise((resolve) => setTimeout(resolve, 1800));

    set((state) => ({
      treasuryBalance: state.treasuryBalance + amount,
    }));

    txStore.updateStatus(txId, 'confirmed');
    logger.info(`Treasury vault funded with ${amount} XLM`);
  },
}));
