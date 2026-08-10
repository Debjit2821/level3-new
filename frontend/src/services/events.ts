import { ContractEvent } from '../types';
import { logger } from './logger';

export class EventStreamingService {
  private listeners: ((event: ContractEvent) => void)[] = [];
  private isPolling = false;
  private timerId: any = null;

  public subscribe(callback: (event: ContractEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public startStreaming() {
    if (this.isPolling) return;
    this.isPolling = true;
    logger.info('Started real-time event streaming worker');

    // Simulate real-time Soroban RPC event polling
    this.timerId = setInterval(() => {
      this.simulateIncomingEvent();
    }, 12000);
  }

  public stopStreaming() {
    this.isPolling = false;
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  public emitMockEvent(event: ContractEvent) {
    logger.info('New contract event emitted', { eventId: event.id, type: event.type });
    this.listeners.forEach((listener) => listener(event));
  }

  private simulateIncomingEvent() {
    const eventTypes = ['payout', 'applied', 'approved', 'deposit'] as const;
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const newEvent: ContractEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topic: 'scholar',
      type: randomType,
      contractId: 'CBWHS3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F',
      data: {
        amount: Math.floor(Math.random() * 500) + 100,
        programId: 1,
        student: 'GBCX...9K2L',
      },
      timestamp: new Date().toLocaleTimeString(),
    };

    this.emitMockEvent(newEvent);
  }
}

export const eventStreamer = new EventStreamingService();
