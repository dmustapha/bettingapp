'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { TokenPriceCard } from '@/components/crypto/TokenPriceCard';
import { TokenChart } from '@/components/crypto/TokenChart';
import { SUPPORTED_TOKENS } from '@/hooks/useCryptoMarketBets';

export default function TokenDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Token not found</h2>
            <Link href="/crypto" className="text-purple-600 hover:text-purple-700">
              ← Back to Crypto Predictions
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
        <div className="mb-6">
          <Link href="/crypto" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
            ← Back to Crypto Predictions
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{token.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {token.name}
              </h1>
              <p className="text-xl text-gray-400">{symbol}</p>
            </div>
          </div>
        </div>

        {/* Price Card */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <TokenPriceCard
              symbol={symbol}
              name={token.name}
              icon={token.icon}
              showDetails={true}
            />
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-brand-bg-card rounded-xl shadow-lg p-6 border border-brand-purple-900/30">
            <h2 className="text-xl font-bold text-white mb-4">
              About {token.name}
            </h2>
            {token.description && (
              <p className="text-gray-400 mb-4">{token.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-gray-400 mb-1">Platform</div>
                <div className="font-semibold text-white">Base Chain</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-gray-400 mb-1">Category</div>
                <div className="font-semibold text-white">
                  {token.category}
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-gray-400 mb-1">Oracle Support</div>
                <div className="font-semibold text-white">
                  {token.chainlinkPriceFeed ? 'Chainlink' : 'CoinGecko'}
                </div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-gray-400 mb-1">Min Bet</div>
                <div className="font-semibold text-white">
                  {token.minBetAmount || '0.01'} ETH
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <TokenChart symbol={symbol} height={500} showTimeframeSelector={true} chartType="area" />
        </div>

        {/* Create Prediction CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Predict?</h2>
          <p className="text-lg mb-6 opacity-90">
            Create a prediction for {token.name} price movement
          </p>
          <Link
            href={`/crypto/create?token=${symbol}`}
            className="inline-block bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create {symbol} Prediction
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
