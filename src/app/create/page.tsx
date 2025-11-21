'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCreateMarket } from '@/hooks/useBettingContract';
import { isContractDeployed } from '@/lib/contract';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import Link from 'next/link';
import { TokenToggle } from '@/components/TokenSelector';
import { BASE_SEPOLIA_TOKENS, TokenInfo } from '@/config/tokens.base';

export default function CreateMarketPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { createMarket, isPending, isConfirming, isSuccess, error } = useCreateMarket();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sports');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [minBet, setMinBet] = useState('0.01');
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(BASE_SEPOLIA_TOKENS.ETH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !category || !endDate || !endTime || !minBet) {
      alert('Please fill in all fields');
      return;
    }

    // Combine date and time
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const endTimeUnix = Math.floor(endDateTime.getTime() / 1000);

    // Validate end time is in the future
    if (endTimeUnix <= Date.now() / 1000) {
      alert('End time must be in the future');
      return;
    }

    createMarket(description, category, endTimeUnix, minBet);
  };

  // Redirect on success
  if (isSuccess) {
    setTimeout(() => {
      router.push('/markets');
    }, 2000);
  }

  if (!isContractDeployed()) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Smart Contract Not Deployed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The betting smart contract has not been deployed yet. Please deploy the contract first.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/markets" className="text-brand-purple-400 hover:text-brand-purple-300 transition-colors flex items-center gap-2">
              <span>←</span>
              <span>Back to Markets</span>
            </Link>
          </div>

          <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl shadow-lg">
                📊
              </div>
              <h1 className="text-3xl font-bold">
                Create Betting Market
              </h1>
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Please connect your wallet to create a market
                </p>
                <ConnectButton />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Market Question *
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Will ETH reach $5000 by end of 2025?"
                    className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                    required
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Be clear and specific. This should be a YES/NO question.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                    required
                  >
                    <option value="Sports">Sports</option>
                    <option value="Politics">Politics</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    Choose the category that best fits your market
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Token Selector */}
                <TokenToggle
                  selectedToken={selectedToken}
                  onTokenChange={setSelectedToken}
                  chainId={chainId}
                />

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Minimum Bet ({selectedToken.symbol}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={minBet}
                      onChange={(e) => setMinBet(e.target.value)}
                      className="w-full px-4 py-3 pr-16 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-xl">{selectedToken.icon}</span>
                      <span className="font-semibold text-gray-400">{selectedToken.symbol}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Minimum amount users must bet (recommended: 0.01 {selectedToken.symbol})
                  </p>
                </div>

                <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-brand-purple-300 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    <span>Important Notes:</span>
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• You will be the market creator and can resolve it after the end time</li>
                    <li>• A 2% platform fee will be deducted from the winning pool</li>
                    <li>• Make sure the question has a clear YES/NO outcome</li>
                    <li>• You cannot modify the market after creation</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-brand-error/10 border border-brand-error/30 rounded-xl p-4">
                    <p className="text-brand-error text-sm flex items-center gap-2">
                      <span>❌</span>
                      <span>Error: {error.message}</span>
                    </p>
                  </div>
                )}

                {isSuccess && (
                  <div className="bg-brand-success/10 border border-brand-success/30 rounded-xl p-4">
                    <p className="text-brand-success text-sm flex items-center gap-2">
                      <span>✅</span>
                      <span>Market created successfully! Redirecting to markets...</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Market...</span>
                    </span>
                  ) : (
                    '📊 Create Market'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
