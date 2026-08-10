'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletStore } from '../store/walletStore';
import { NetworkType } from '../types';
import {
  GraduationCap,
  Wallet,
  Activity,
  Receipt,
  BarChart3,
  Settings,
  Menu,
  X,
  Globe,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isConnected, publicKey, connect, disconnect, network, setNetwork } = useWalletStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Activity Feed', href: '/activity' },
    { name: 'Tx Center', href: '/transactions' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Settings', href: '/settings' },
  ];

  const formatKey = (key: string) => `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-100 group-hover:text-orange-400 transition-colors">
                StellarScholar
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Orange Belt
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Wallet & Network Control */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Network Selector */}
            <div className="relative">
              <button
                onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span className="capitalize">{network}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {networkDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
                  {(['testnet', 'standalone', 'mainnet'] as NetworkType[]).map((net) => (
                    <button
                      key={net}
                      onClick={() => {
                        setNetwork(net);
                        setNetworkDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium capitalize hover:bg-slate-800 ${
                        network === net ? 'text-orange-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Button */}
            {isConnected && publicKey ? (
              <button
                onClick={disconnect}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-700 text-orange-400 hover:bg-slate-800 transition-all"
              >
                <Wallet className="w-4 h-4 text-orange-400" />
                <span>{formatKey(publicKey)}</span>
              </button>
            ) : (
              <button onClick={connect} className="btn-primary flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-medium ${
                pathname === link.href
                  ? 'bg-slate-800 text-orange-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex flex-col space-y-2">
            {isConnected && publicKey ? (
              <button onClick={disconnect} className="btn-secondary w-full text-center">
                Disconnect ({formatKey(publicKey)})
              </button>
            ) : (
              <button onClick={connect} className="btn-primary w-full text-center">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
