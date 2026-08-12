import { logger } from './logger';
import { NetworkType } from '../types';
import { rpc, Contract, TransactionBuilder, Account } from '@stellar/stellar-sdk';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana';

export const CONTRACT_ADDRESSES = {
  testnet: {
    core: 'CA4M5OVK7445WJSKKJLYF5UGOVEQVX7OFNCYKWNAD6G7JB774A5CBHCN',
    treasury: 'CDQG5FE7GZNNVLROFBDMJ2K23QWR4UELPK7BWCQXWSQHIDXAKHMEVNXW',
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

const NETWORK_PASSPHRASE = 'Test SGDG / Testnet ; September 2015';

export interface WalletState {
  publicKey: string | null;
  network: NetworkType;
  isConnected: boolean;
}

export class StellarService {
  private static kitInitialized = false;

  public static initializeKit() {
    if (this.kitInitialized || typeof window === 'undefined') return;
    try {
      StellarWalletsKit.init({
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
          new RabetModule(),
          new HanaModule(),
        ],
        network: Networks.TESTNET,
        authModal: {
          showInstallLabel: true,
          hideUnsupportedWallets: false,
        }
      });
      this.kitInitialized = true;
      logger.info('StellarWalletsKit initialized successfully');
    } catch (err: any) {
      logger.error('Failed to initialize StellarWalletsKit', { error: err.message });
    }
  }

  public static async connectWallet(): Promise<string> {
    logger.info('Attempting wallet connection via StellarWalletsKit...');
    try {
      this.initializeKit();
      const res = await StellarWalletsKit.authModal();
      logger.info('Wallet connected successfully via kit', { publicKey: res.address });
      return res.address;
    } catch (err: any) {
      logger.error('Wallet connection failed', { error: err.message || err });
      throw new Error(err.message || 'Failed to connect wallet');
    }
  }

  public static getExplorerTxUrl(hash: string, network: NetworkType = 'testnet'): string {
    return `https://stellar.expert/explorer/${network}/tx/${hash}`;
  }

  public static getExplorerContractUrl(address: string, network: NetworkType = 'testnet'): string {
    return `https://stellar.expert/explorer/${network}/contract/${address}`;
  }

  /**
   * Invokes a Soroban contract method with arguments on-chain.
   */
  public static async submitTransaction(
    contractAddress: string,
    functionName: string,
    args: any[],
    sourceAddress: string
  ): Promise<string> {
    logger.info(`Preparing on-chain call to ${functionName} on contract ${contractAddress}`);
    const server = new rpc.Server(RPC_SERVERS.testnet);

    // 1. Fetch account sequence details
    let accountResponse;
    try {
      accountResponse = await server.getAccount(sourceAddress);
    } catch (err) {
      throw new Error(`Failed to load source account from Testnet. Ensure your wallet has XLM. Details: ${err}`);
    }

    // 2. Build transaction
    const contract = new Contract(contractAddress);
    const tx = new TransactionBuilder(accountResponse, {
      fee: '100000', // Base fee (max fee)
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(functionName, ...args))
      .setTimeout(30)
      .build();

    // 3. Simulate transaction to estimate resource usage
    let simulated;
    try {
      simulated = await server.simulateTransaction(tx);
      if (rpc.Api.isSimulationError(simulated)) {
        throw new Error(simulated.error);
      }
    } catch (err: any) {
      throw new Error(`Simulation failed: ${err.message || err}`);
    }

    // 4. Assemble simulation results
    const finalTx = rpc.assembleTransaction(tx, simulated);

    // 5. Sign via StellarWalletsKit
    this.initializeKit();
    let signedXdr;
    try {
      const signRes = await StellarWalletsKit.signTransaction((finalTx as any).toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: sourceAddress,
      });
      signedXdr = signRes.signedTxXdr;
    } catch (err: any) {
      throw new Error(`Wallet signing canceled or failed: ${err.message || err}`);
    }

    // 6. Submit signed transaction
    const submission = await server.sendTransaction(
      TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
    );

    if (submission.status === 'ERROR') {
      throw new Error(`Submission rejected by node: ${JSON.stringify(submission.errorResult)}`);
    }

    // 7. Poll transaction status
    const txHash = submission.hash;
    logger.info(`Transaction submitted: ${txHash}. Waiting for ledger consensus...`);

    let pollCount = 0;
    while (pollCount < 15) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusRes = await server.getTransaction(txHash);
      if (statusRes.status === 'SUCCESS') {
        logger.info(`Transaction confirmed successfully: ${txHash}`);
        return txHash;
      } else if (statusRes.status === 'FAILED') {
        throw new Error(`Transaction failed on-chain`);
      }
      pollCount++;
    }

    throw new Error('Transaction execution timed out waiting for consensus');
  }
}
