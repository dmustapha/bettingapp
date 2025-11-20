'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg-primary/80 backdrop-blur-lg border-b border-brand-purple-900/30">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/markets" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center font-bold text-xl text-white shadow-glow-purple">
                B
              </div>
              <span className="text-2xl font-bold text-white">CryptoWager</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/markets"
                className={`font-medium transition-colors ${
                  isActive('/markets')
                    ? 'text-brand-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/wagers"
                className={`font-medium transition-colors ${
                  isActive('/wagers')
                    ? 'text-brand-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                PVP Wagers
              </Link>
              <Link
                href="/crypto"
                className={`font-medium transition-colors ${
                  isActive('/crypto')
                    ? 'text-brand-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Market Betting
              </Link>
            </nav>
          </div>

          <ConnectButton />
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center gap-3 mt-4 overflow-x-auto pb-2">
          <Link
            href="/markets"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              isActive('/markets')
                ? 'bg-gradient-purple text-white shadow-glow-purple'
                : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-bg-tertiary'
            }`}
          >
            Home
          </Link>
          <Link
            href="/wagers"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              isActive('/wagers')
                ? 'bg-gradient-purple text-white shadow-glow-purple'
                : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-bg-tertiary'
            }`}
          >
            PVP Wagers
          </Link>
          <Link
            href="/crypto"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              isActive('/crypto')
                ? 'bg-gradient-purple text-white shadow-glow-purple'
                : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-bg-tertiary'
            }`}
          >
            Market Betting
          </Link>
        </nav>
      </div>
    </header>
  );
}
