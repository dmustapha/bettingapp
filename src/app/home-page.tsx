'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Decentralized Betting
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-100">on Base Chain</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Three powerful ways to bet: Prediction Markets, Peer-to-Peer Wagers, and Crypto Price Predictions.
            All trustless, transparent, and secure.
          </p>
          {!isConnected && (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Three Sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Section 1: Betting Markets */}
          <Link href="/markets">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1 h-full">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Prediction Markets
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create or bet on binary outcomes for any event. Sports, politics, entertainment, crypto - you decide!
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Create custom markets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Real-time odds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Community resolution</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                  Explore Markets
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Section 2: P2P Wagers */}
          <Link href="/wagers">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1 h-full">
              <div className="text-5xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                P2P Wagers
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bet directly with a friend on personal arguments. Set your stakes, choose a resolver, winner takes all!
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>1-on-1 betting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Choose your resolver</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Winner takes all</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                  Create Wager
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Section 3: Crypto Predictions */}
          <Link href="/crypto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500 transform hover:-translate-y-1 h-full">
              <div className="text-5xl mb-4">📈</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Crypto Predictions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Predict crypto price movements. UP or DOWN? 1h to 7d timeframes. Powered by Chainlink oracles.
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Major crypto tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Multiple timeframes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Auto-resolve via oracle</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">
                  Start Predicting
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Why Choose Base Betting?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Trustless</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart contracts ensure fair play. No intermediaries needed.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Fast & Cheap</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Built on Base L2 for instant transactions and low fees.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Transparent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All bets and outcomes verified on-chain. Fully auditable.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Fair Odds</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dynamic odds based on real betting activity. No house edge.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isConnected && (
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-xl mb-8 opacity-90">
              Connect your wallet and explore three ways to bet on-chain
            </p>
            <ConnectButton />
          </div>
        )}

        {isConnected && (
          <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">You're Connected!</h2>
            <p className="text-xl mb-8 opacity-90">
              Choose a section above to start betting
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/markets"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                📊 Markets
              </Link>
              <Link
                href="/wagers"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                🤝 Wagers
              </Link>
              <Link
                href="/crypto"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                📈 Crypto
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
