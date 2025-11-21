'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId } from 'wagmi';
import {
  usePredictionCounter,
  useCurrentPrice,
  useCreatePrediction,
  usePlacePredictionBet,
  FEATURED_TOKENS,
  TIMEFRAMES,
} from '@/hooks/useCryptoMarketBets';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { TokenToggle } from '@/components/TokenSelector';
import { BASE_SEPOLIA_TOKENS, TokenInfo } from '@/config/tokens.base';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Quick Market Betting Card Component
function QuickBetCard({ token }: { token: typeof FEATURED_TOKENS[0] }) {
  const { isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState('0.01');
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const { data: currentPrice } = useCurrentPrice(token.symbol);
  const { placePredictionBet, isPending, isSuccess } = usePlacePredictionBet();

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleQuickBet = (direction: 'up' | 'down') => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedDirection(direction);
    // TODO: This would create a quick 1h prediction and place bet in one transaction
    // For now, just show selection
  };

  return (
    <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-lg p-6 hover:shadow-glow-purple hover:border-brand-purple-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-2xl shadow-lg">
            {token.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{token.symbol}</h3>
            <p className="text-sm text-gray-400">{token.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">${formatPrice(currentPrice)}</div>
          <div className="text-xs text-gray-400">Current Price</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => handleQuickBet('up')}
          disabled={!isConnected || isPending}
          className={`py-4 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 ${
            selectedDirection === 'up'
              ? 'bg-brand-success border-2 border-brand-success text-white shadow-lg'
              : 'bg-brand-success/20 border-2 border-brand-success hover:bg-brand-success/30 text-brand-success'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="text-2xl mb-1">🐂</div>
          <div>BULL (UP)</div>
        </button>
        <button
          onClick={() => handleQuickBet('down')}
          disabled={!isConnected || isPending}
          className={`py-4 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 ${
            selectedDirection === 'down'
              ? 'bg-brand-error border-2 border-brand-error text-white shadow-lg'
              : 'bg-brand-error/20 border-2 border-brand-error hover:bg-brand-error/30 text-brand-error'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="text-2xl mb-1">🐻</div>
          <div>BEAR (DOWN)</div>
        </button>
      </div>

      <div className="text-xs text-center text-gray-400">
        {isConnected ? 'Quick 1h prediction - Click to bet!' : 'Connect wallet to start'}
      </div>
    </div>
  );
}

export default function CryptoPredictionsPage() {
  const router = useRouter();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { createPrediction, isPending: isCreating, isSuccess: isCreateSuccess } = useCreatePrediction();

  const [selectedToken, setSelectedToken] = useState<TokenInfo>(BASE_SEPOLIA_TOKENS.ETH);
  const [customDescription, setCustomDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<keyof typeof TIMEFRAMES>('1h');
  const [betAmount, setBetAmount] = useState('0.01');

  const handleCreateCustomPrediction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customDescription) {
      alert('Please describe what you\'re betting on');
      return;
    }

    // For now, we'll use the token from the selector
    // In future, this could be expanded to support custom assets
    const timeframeSeconds = TIMEFRAMES[selectedTimeframe];
    createPrediction(selectedToken.symbol, timeframeSeconds);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {/* SECTION 1: QUICK MARKET BETTING */}
        <section className="mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bg-card border border-brand-purple-800 mb-4">
              <span className="text-sm">⚡ Quick Betting</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Market Predictions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Quick UP or DOWN bets on major crypto assets. Will the price go up or down in the next hour?
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_TOKENS.map((token) => (
              <QuickBetCard key={token.symbol} token={token} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              💡 Quick bets are 1-hour predictions. For custom timeframes, use the form below.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-brand-purple-900/30 my-16"></div>

        {/* SECTION 2: CUSTOM PREDICTIONS */}
        <section>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bg-card border border-brand-purple-800 mb-4">
              <span className="text-sm">✨ Custom Predictions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Create Your Own Prediction
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl">
              Create a custom prediction with your own description and timeframe. Be specific about what you're betting on!
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl shadow-lg">
                  📈
                </div>
                <h3 className="text-2xl font-bold">Custom Prediction</h3>
              </div>

              {!isConnected ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    Connect your wallet to create custom predictions
                  </p>
                  <ConnectButton />
                </div>
              ) : (
                <form onSubmit={handleCreateCustomPrediction} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      What are you betting on? *
                    </label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="e.g., ETH will reach $3,000 by end of week, BTC will break $90k resistance, etc."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Describe your prediction clearly so others understand what you're betting on
                    </p>
                  </div>

                  {/* Token Selector */}
                  <TokenToggle
                    selectedToken={selectedToken}
                    onTokenChange={setSelectedToken}
                    chainId={chainId}
                  />

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Prediction Timeframe *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(Object.keys(TIMEFRAMES) as Array<keyof typeof TIMEFRAMES>).map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                            selectedTimeframe === tf
                              ? 'bg-gradient-primary text-white shadow-glow-primary'
                              : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Longer timeframes = Higher potential returns
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Initial Bet Amount ({selectedToken.symbol}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full px-4 py-3 pr-16 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-xl">{selectedToken.icon}</span>
                        <span className="font-semibold text-gray-400">{selectedToken.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-brand-purple-300 mb-2 flex items-center gap-2">
                      <span>💡</span>
                      <span>How Custom Predictions Work:</span>
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Your prediction will be visible to all users</li>
                      <li>• Others can bet YES (price will go UP) or NO (price will go DOWN)</li>
                      <li>• Prediction auto-resolves using Chainlink oracles at the end of timeframe</li>
                      <li>• Winners share the pot proportionally (minus 2% platform fee)</li>
                    </ul>
                  </div>

                  {isCreateSuccess && (
                    <div className="bg-brand-success/10 border border-brand-success/30 rounded-xl p-4">
                      <p className="text-brand-success text-sm flex items-center gap-2">
                        <span>✅</span>
                        <span>Prediction created successfully! Check active markets above.</span>
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isCreating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Creating Prediction...</span>
                      </span>
                    ) : (
                      '📈 Create Custom Prediction'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/crypto" className="text-brand-purple-400 hover:text-brand-purple-300 font-semibold">
              View All Active Predictions →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
