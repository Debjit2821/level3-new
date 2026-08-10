import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Stellar Scholarship Distribution System | Soroban Orange Belt Level 3',
  description:
    'Production-grade Stellar Soroban dApp for decentralized scholarship management, automated milestone payouts, and multi-contract security.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        <footer className="border-t border-slate-800 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <p>© 2026 Stellar Scholarship Protocol • Level 3 Orange Belt Certification</p>
        </footer>
      </body>
    </html>
  );
}
