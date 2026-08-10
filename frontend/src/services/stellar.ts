import { logger } from './logger';
import { NetworkType } from '../types';

export const CONTRACT_ADDRESSES = {
  testnet: {
    core: 'CBWHS3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F',
    treasury: 'CT3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G',
  },
  standalone: {
    core: 'CCWHS3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F',
    treasury: 'CD3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G',
  },
};

export const RPC_SERVERS = {
  testnet: 'https://soroban-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
  standalone: 'http://localhost:8000/soroban/rpc',
};

export interface WalletState {
  publicKey: string | null;
  network: NetworkType;
  isConnected: boolean;
}

export class StellarService {
  public static async isFreighterAvailable(): Promise<boolean> {
    try {
      const freighter = await import('@stellar/freighter-api');
      const res: any = await freighter.isConnected();
      return !!(typeof res === 'boolean' ? res : res?.isConnected);
    } catch {
      return false;
    }
  }

  public static async connectWallet(): Promise<string> {
    logger.info('Attempting wallet connection...');
    try {
      const freighter = await import('@stellar/freighter-api');
      const isConnectedRes: any = await freighter.isConnected();
      const isConnected = !!(typeof isConnectedRes === 'boolean' ? isConnectedRes : isConnectedRes?.isConnected);
      if (!isConnected) {
        throw new Error('Freighter extension is not installed or locked.');
      }
      const getKeyFn = (freighter as any).getPublicKey || (freighter as any).getAddress;
      const resKey = await getKeyFn();
      const publicKey = typeof resKey === 'string' ? resKey : resKey?.address || resKey?.publicKey;
      logger.info('Wallet connected successfully', { publicKey });
      return publicKey;
    } catch (err: any) {
      logger.error('Wallet connection failed', { error: err.message });
      throw new Error(err.message || 'Failed to connect wallet');
    }
  }

  public static getExplorerTxUrl(hash: string, network: NetworkType = 'testnet'): string {
    return `https://stellar.expert/explorer/${network}/tx/${hash}`;
  }

  public static getExplorerContractUrl(address: string, network: NetworkType = 'testnet'): string {
    return `https://stellar.expert/explorer/${network}/contract/${address}`;
  }
}
