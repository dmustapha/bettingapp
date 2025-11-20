'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMarketCounter, useMarket, useMarketOdds } from '@/hooks/useBettingContract';
import { isContractDeployed } from '@/lib/contract';
import { formatEth, formatDate, getTimeRemaining, hasMarketEnded } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';

function MarketCard({ marketId }: { marketId: number }) {
  const { data: market, isLoading } = useMarket(marketId);
  const { data: odds } = useMarketOdds(marketId);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!market) return null;

  const totalPool = market.totalYesBets + market.totalNoBets;
  const ended = hasMarketEnded(market.endTime);
  const yesOdds = odds ? Number(odds[0]) : 50;
  const noOdds = odds ? Number(odds[1]) : 50;

  // Category badge colors
  const categoryColors: Record<string, string> = {
    Sports: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Politics: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    Entertainment: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    Crypto: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    Custom: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <Link href={`/markets/${marketId}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryColors[market.category] || categoryColors.Custom}`}>
                {market.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                market.resolved
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  : ended
                  ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {market.resolved ? 'Resolved' : ended ? 'Ended' : 'Active'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {market.description}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {!market.resolved && (
                <span>
                  {ended ? `Ended ${formatDate(market.endTime)}` : `Ends in ${getTimeRemaining(market.endTime)}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-sm text-green-800 dark:text-green-200 font-semibold mb-1">YES</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{yesOdds}%</div>
            <div className="text-xs text-green-700 dark:text-green-300">{formatEth(market.totalYesBets)} ETH</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-sm text-red-800 dark:text-red-200 font-semibold mb-1">NO</div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{noOdds}%</div>
            <div className="text-xs text-red-700 dark:text-red-300">{formatEth(market.totalNoBets)} ETH</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>Total Pool: {formatEth(totalPool)} ETH</span>
          <span>Min Bet: {formatEth(market.minBet)} ETH</span>
        </div>

        {market.resolved && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Winning Outcome:{' '}
              <span className={market.winningOutcome ? 'text-green-600' : 'text-red-600'}>
                {market.winningOutcome ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function MarketsPage() {
  const { data: marketCounter, isLoading } = useMarketCounter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const totalMarkets = marketCounter ? Number(marketCounter) : 0;
  const marketIds = Array.from({ length: totalMarkets }, (_, i) => i);
  const categories = ['All', 'Sports', 'Politics', 'Entertainment', 'Crypto', 'Custom'];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Prediction Markets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLoading ? 'Loading...' : `${totalMarkets} markets available`}
            </p>
          </div>
          <Link
            href="/create"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Create Market
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : totalMarkets === 0 ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              No Markets Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to create a prediction market!
            </p>
            <Link
              href="/create"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
            >
              Create First Market
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketIds.reverse().map((id) => (
              <FilteredMarketCard key={id} marketId={id} selectedCategory={selectedCategory} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Wrapper component to handle filtering
function FilteredMarketCard({ marketId, selectedCategory }: { marketId: number; selectedCategory: string }) {
  const { data: market } = useMarket(marketId);

  // Filter logic
  if (!market) return null;
  if (selectedCategory !== 'All' && market.category !== selectedCategory) return null;

  return <MarketCard marketId={marketId} />;
}
