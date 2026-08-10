export type NetworkType = 'testnet' | 'mainnet' | 'standalone';

export enum ApplicationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Completed = 3,
}

export interface ScholarshipProgram {
  id: number;
  admin: string;
  title: string;
  totalBudget: number;
  milestoneCount: number;
  amountPerMilestone: number;
  active: boolean;
}

export interface ScholarshipApplication {
  id: number;
  programId: number;
  student: string;
  studentName: string;
  status: ApplicationStatus;
  paidMilestones: number;
}

export interface ContractEvent {
  id: string;
  topic: string;
  type: 'created' | 'applied' | 'approved' | 'rejected' | 'payout' | 'deposit' | 'released';
  contractId: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface TransactionRecord {
  id: string;
  hash: string;
  operation: string;
  contract: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  timestamp: string;
  error?: string;
}
