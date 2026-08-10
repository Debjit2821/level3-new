'use client';

import React, { useState, useEffect } from 'react';
import { eventStreamer } from '../../services/events';
import { ContractEvent } from '../../types';
import {
  Activity,
  Play,
  Pause,
  Filter,
  Code,
  Zap,
  CheckCircle2,
  Coins,
  Layers,
  GraduationCap,
} from 'lucide-react';

export default function ActivityFeedPage() {
  const [events, setEvents] = useState<ContractEvent[]>([
    {
      id: 'evt-101',
      topic: 'scholar',
      type: 'payout',
      contractId: 'CBWHS3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F',
      data: { application_id: 1, student: 'GC7K8X9Y...', milestone_paid: 1, amount: 1250 },
      timestamp: '14:22:05',
    },
    {
      id: 'evt-102',
      topic: 'scholar',
      type: 'approved',
      contractId: 'CBWHS3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F',
      data: { application_id: 1, student: 'GC7K8X9Y...', program_id: 1 },
      timestamp: '14:15:30',
    },
    {
      id: 'evt-103',
      topic: 'treasury',
      type: 'deposit',
      contractId: 'CT3H2J4N5YQ6K7L8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G',
      data: { from: 'GBXN...4K90', amount: 5000, new_balance: 8750 },
      timestamp: '13:50:10',
    },
  ]);

  const [isLive, setIsLive] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<ContractEvent | null>(null);

  useEffect(() => {
    if (!isLive) return;

    eventStreamer.startStreaming();
    const unsubscribe = eventStreamer.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
    });

    return () => {
      unsubscribe();
      eventStreamer.stopStreaming();
    };
  }, [isLive]);

  const filteredEvents = events.filter((e) => filterType === 'all' || e.type === filterType);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'payout':
      case 'released':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'applied':
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'deposit':
        return <Coins className="w-5 h-5 text-orange-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-7 h-7 text-orange-400" />
              Soroban Real-Time Event Stream
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isLive ? 'Streaming Live' : 'Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Soroban RPC WebSocket event subscription monitoring smart contract state updates.
          </p>
        </div>

        {/* Streaming Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`btn-secondary text-xs py-2 flex items-center space-x-1.5 ${
              isLive ? 'border-amber-500/40 text-amber-400' : ''
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isLive ? 'Pause Stream' : 'Resume Live Stream'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
        <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
        {['all', 'payout', 'approved', 'applied', 'deposit'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
              filterType === type
                ? 'bg-slate-800 text-orange-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Event Cards Feed */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="glass-card p-5 border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                {getEventIcon(evt.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">{evt.type}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-mono text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {evt.type === 'payout' && `Milestone Payout of ${evt.data.amount} XLM executed to ${evt.data.student}`}
                  {evt.type === 'approved' && `Student application #${evt.data.application_id} approved by admin`}
                  {evt.type === 'applied' && `New student application registered for Program #${evt.data.programId}`}
                  {evt.type === 'deposit' && `Treasury vault funded with ${evt.data.amount} XLM`}
                </p>
                <p className="text-xs font-mono text-slate-500">Contract: {evt.contractId.substring(0, 16)}...</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(evt)}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center space-x-1 self-start sm:self-auto"
            >
              <Code className="w-3.5 h-3.5 text-slate-400" />
              <span>Inspect Event XDR</span>
            </button>
          </div>
        ))}
      </div>

      {/* RAW JSON EVENT INSPECTOR MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-orange-400" />
                Raw Soroban Event Payload
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 max-h-80">
              {JSON.stringify(selectedEvent, null, 2)}
            </pre>
            <div className="text-right">
              <button onClick={() => setSelectedEvent(null)} className="btn-secondary text-xs">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
