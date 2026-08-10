import { create } from 'zustand';
import { ApplicationStatus, ScholarshipApplication, ScholarshipProgram } from '../types';
import { logger } from '../services/logger';
import { useTxStore } from './txStore';
import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { StellarService, CONTRACT_ADDRESSES } from '../services/stellar';

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
      admin: 'GB74IQB2ON6R7M4Q72MYHFACGZRVHYMDJ6VQF7C73J7LOCRASBNJIHKA',
      title: 'Stellar Orange Belt Web3 Fellowship 2026',
      totalBudget: 5000,
      milestoneCount: 4,
      amountPerMilestone: 1250,
      active: true,
    },
  ],

  applications: [],

  treasuryBalance: 0,
  totalDisbursed: 0,

  createProgram: async (title, totalBudget, milestoneCount, amountPerMilestone, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: 'Simulating...',
      operation: `Create Scholarship Program "${title}"`,
      contract: 'ScholarshipCore',
      status: 'pending',
    });

    try {
      const cleanTitle = title.replace(/\s+/g, '_').substring(0, 30);
      const symbolVal = xdr.ScVal.scvSymbol(cleanTitle || 'Scholarship');
      
      const args = [
        Address.fromString(adminAddr),
        symbolVal,
        nativeToScVal(totalBudget, { type: 'i128' }),
        nativeToScVal(milestoneCount, { type: 'u32' }),
        nativeToScVal(amountPerMilestone, { type: 'i128' }),
      ];

      const hash = await StellarService.submitTransaction(
        CONTRACT_ADDRESSES.testnet.core,
        'create_program',
        args,
        adminAddr
      );

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
      txStore.updateStatus(txId, 'confirmed', undefined, hash);
      logger.info(`Scholarship program created: ${title}`, { newId });
      return newId;
    } catch (err: any) {
      txStore.updateStatus(txId, 'failed', err.message);
      logger.error('Failed to create scholarship program', { error: err.message });
      throw err;
    }
  },

  applyScholarship: async (programId, studentName, studentAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: 'Simulating...',
      operation: `Apply for Program #${programId}`,
      contract: 'ScholarshipCore',
      status: 'pending',
    });

    try {
      const cleanName = studentName.replace(/\s+/g, '_').substring(0, 30);
      const symbolVal = xdr.ScVal.scvSymbol(cleanName || 'Student');

      const args = [
        Address.fromString(studentAddr),
        nativeToScVal(programId, { type: 'u64' }),
        symbolVal,
      ];

      const hash = await StellarService.submitTransaction(
        CONTRACT_ADDRESSES.testnet.core,
        'apply',
        args,
        studentAddr
      );

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
      txStore.updateStatus(txId, 'confirmed', undefined, hash);
      logger.info(`Student applied to program #${programId}`, { newAppId, studentName });
      return newAppId;
    } catch (err: any) {
      txStore.updateStatus(txId, 'failed', err.message);
      logger.error('Failed to apply for scholarship', { error: err.message });
      throw err;
    }
  },

  approveApplication: async (applicationId, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: 'Simulating...',
      operation: `Approve Application #${applicationId}`,
      contract: 'ScholarshipCore',
      status: 'pending',
    });

    try {
      const args = [
        Address.fromString(adminAddr),
        nativeToScVal(applicationId, { type: 'u64' }),
      ];

      const hash = await StellarService.submitTransaction(
        CONTRACT_ADDRESSES.testnet.core,
        'approve_application',
        args,
        adminAddr
      );

      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === applicationId ? { ...app, status: ApplicationStatus.Approved } : app
        ),
      }));

      txStore.updateStatus(txId, 'confirmed', undefined, hash);
      logger.info(`Application #${applicationId} approved`);
    } catch (err: any) {
      txStore.updateStatus(txId, 'failed', err.message);
      logger.error('Failed to approve application', { error: err.message });
      throw err;
    }
  },

  rejectApplication: async (applicationId, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: 'Simulating...',
      operation: `Reject Application #${applicationId}`,
      contract: 'ScholarshipCore',
      status: 'pending',
    });

    try {
      const args = [
        Address.fromString(adminAddr),
        nativeToScVal(applicationId, { type: 'u64' }),
      ];

      const hash = await StellarService.submitTransaction(
        CONTRACT_ADDRESSES.testnet.core,
        'reject_application',
        args,
        adminAddr
      );

      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === applicationId ? { ...app, status: ApplicationStatus.Rejected } : app
        ),
      }));

      txStore.updateStatus(txId, 'confirmed', undefined, hash);
      logger.info(`Application #${applicationId} rejected`);
    } catch (err: any) {
      txStore.updateStatus(txId, 'failed', err.message);
      logger.error('Failed to reject application', { error: err.message });
      throw err;
    }
  },

  triggerMilestonePayout: async (applicationId, adminAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: 'Simulating...',
      operation: `Trigger Milestone Payout (Core -> Treasury)`,
      contract: 'ScholarshipCore -> ScholarshipTreasury',
      status: 'pending',
    });

    try {
      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) throw new Error('Application not found');

      const prog = get().programs.find((p) => p.id === app.programId);
      if (!prog) throw new Error('Program not found');

      const args = [
        Address.fromString(adminAddr),
        nativeToScVal(applicationId, { type: 'u64' }),
      ];

      const hash = await StellarService.submitTransaction(
        CONTRACT_ADDRESSES.testnet.core,
        'trigger_milestone_payout',
        args,
        adminAddr
      );

      const newPaidCount = app.paidMilestones + 1;
      const isCompleted = newPaidCount >= prog.milestoneCount;
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

      txStore.updateStatus(txId, 'confirmed', undefined, hash);
      logger.tx(`Milestone #${newPaidCount} payout executed via Treasury contract`, {
        applicationId,
        amount: payoutAmount,
      });
      return newPaidCount;
    } catch (err: any) {
      txStore.updateStatus(txId, 'failed', err.message);
      logger.error('Failed to trigger milestone payout', { error: err.message });
      throw err;
    }
  },

  fundTreasury: async (amount, fromAddr) => {
    const txStore = useTxStore.getState();
    const txId = txStore.addTransaction({
      hash: 'Simulating...',
      operation: `Fund Treasury Vault with ${amount} XLM`,
      contract: 'ScholarshipTreasury',
      status: 'pending',
    });

    try {
      const args = [
        Address.fromString(fromAddr),
        nativeToScVal(amount, { type: 'i128' }),
      ];

      const hash = await StellarService.submitTransaction(
        CONTRACT_ADDRESSES.testnet.treasury,
        'deposit',
        args,
        fromAddr
      );

      set((state) => ({
        treasuryBalance: state.treasuryBalance + amount,
      }));

      txStore.updateStatus(txId, 'confirmed', undefined, hash);
      logger.info(`Treasury vault funded with ${amount} XLM`);
    } catch (err: any) {
      txStore.updateStatus(txId, 'failed', err.message);
      logger.error('Failed to fund treasury vault', { error: err.message });
      throw err;
    }
  },
}));
