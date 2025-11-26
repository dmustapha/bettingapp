'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WagerXLogo } from '@/components/Logo';
import { useState } from 'react';

export function MainNav() {
  const pathname = usePathname();
  const [showFaucetDropdown, setShowFaucetDropdown] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg-primary/80 backdrop-blur-lg border-b border-brand-purple-900/30">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/markets" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <WagerXLogo className="w-10 h-10 transition-transform group-hover:scale-110" />
              <span className="text-2xl font-bold text-white">WagerX</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
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
              <Link
                href="/leaderboard"
                className={`font-medium transition-colors ${
                  isActive('/leaderboard')
                    ? 'text-brand-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Leaderboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Faucet Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFaucetDropdown(!showFaucetDropdown)}
                onBlur={() => setTimeout(() => setShowFaucetDropdown(false), 200)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-bg-secondary border border-brand-purple-900/50 rounded-xl text-sm font-medium text-gray-300 hover:bg-brand-bg-tertiary hover:border-brand-purple-500/50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Faucet
                <svg className={`w-4 h-4 transition-transform ${showFaucetDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFaucetDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-brand-bg-card border border-brand-purple-900/50 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 bg-brand-bg-secondary border-b border-brand-purple-900/30">
                    <h3 className="text-sm font-semibold text-white">Get Testnet Tokens</h3>
                    <p className="text-xs text-gray-400 mt-1">Base Sepolia Faucets</p>
                  </div>
                  <div className="p-2">
                    <a
                      href="https://www.alchemy.com/faucets/base-sepolia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-brand-bg-secondary transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        ETH
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">ETH Faucet</div>
                        <div className="text-xs text-gray-500">Alchemy</div>
                      </div>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href="https://faucet.circle.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-brand-bg-secondary transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        USDC
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">USDC Faucet</div>
                        <div className="text-xs text-gray-500">Circle</div>
                      </div>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <ConnectButton />
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center gap-3 mt-4 overflow-x-auto pb-2">
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
          <Link
            href="/leaderboard"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              isActive('/leaderboard')
                ? 'bg-gradient-purple text-white shadow-glow-purple'
                : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-bg-tertiary'
            }`}
          >
            Leaderboard
          </Link>

          {/* Mobile Faucet Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFaucetDropdown(!showFaucetDropdown)}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap bg-brand-bg-secondary text-gray-300 hover:bg-brand-bg-tertiary transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Faucet
            </button>

            {showFaucetDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-brand-bg-card border border-brand-purple-900/50 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-3 bg-brand-bg-secondary border-b border-brand-purple-900/30">
                  <h3 className="text-sm font-semibold text-white">Get Testnet Tokens</h3>
                  <p className="text-xs text-gray-400 mt-1">Base Sepolia Faucets</p>
                </div>
                <div className="p-2">
                  <a
                    href="https://www.alchemy.com/faucets/base-sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-brand-bg-secondary transition-colors"
                    onClick={() => setShowFaucetDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      ETH
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">ETH Faucet</div>
                      <div className="text-xs text-gray-500">Alchemy</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-brand-bg-secondary transition-colors"
                    onClick={() => setShowFaucetDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      USDC
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">USDC Faucet</div>
                      <div className="text-xs text-gray-500">Circle</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
