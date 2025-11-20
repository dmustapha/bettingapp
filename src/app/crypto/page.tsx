'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
  usePredictionCounter,
  usePrediction,
  FEATURED_TOKENS,
  SUPPORTED_TOKENS,
  TIMEFRAMES,
} from '@/hooks/useCryptoMarketBets';
import { formatEth, formatDate, getTimeRemaining } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { TokenPriceCard } from '@/components/crypto/TokenPriceCard';
import { TokenSearch } from '@/components/crypto/TokenSearch';
import { TokenCategory, getTokensForCategory } from '@/config/tokens.config';

function PredictionCard({ predictionId }: { predictionId: number }) {
  const { data: prediction, isLoading } = usePrediction(predictionId);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!prediction) return null;

  const isEnded = Number(prediction.endTime) < Date.now() / 1000;
  const totalPool = prediction.totalUpBets + prediction.totalDownBets;
  const upPercentage = totalPool > 0n ? Number((prediction.totalUpBets * 100n) / totalPool) : 50;
  const downPercentage = totalPool > 0n ? Number((prediction.totalDownBets * 100n) / totalPool) : 50;

  const getTimeframeLabel = (seconds: number) => {
    if (seconds === 3600) return '1h';
    if (seconds === 14400) return '4h';
    if (seconds === 86400) return '24h';
    if (seconds === 604800) return '7d';
    return `${seconds}s`;
  };

  const formatPrice = (price: bigint) => {
    const priceNum = Number(price) / 1e8; // Chainlink uses 8 decimals
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Link href={`/crypto/${predictionId}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{SUPPORTED_TOKENS.find(t => t.symbol === prediction.tokenSymbol)?.icon}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {prediction.tokenSymbol}
              </h3>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {getTimeframeLabel(Number(prediction.timeframe))}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                prediction.resolved
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  : isEnded
                  ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {prediction.resolved ? 'Resolved' : isEnded ? 'Ended' : 'Active'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Start: ${formatPrice(prediction.startPrice)}
            </div>
            {!prediction.resolved && !isEnded && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ends in {getTimeRemaining(prediction.endTime)}
              </div>
            )}
            {prediction.resolved && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                End: ${formatPrice(prediction.endPrice)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-sm text-green-800 dark:text-green-200 font-semibold mb-1">UP ↑</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{upPercentage}%</div>
            <div className="text-xs text-green-700 dark:text-green-300">{formatEth(prediction.totalUpBets)} ETH</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-sm text-red-800 dark:text-red-200 font-semibold mb-1">DOWN ↓</div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{downPercentage}%</div>
            <div className="text-xs text-red-700 dark:text-red-300">{formatEth(prediction.totalDownBets)} ETH</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>Total Pool: {formatEth(totalPool)} ETH</span>
          {prediction.resolved && (
            <span className={prediction.priceWentUp ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {prediction.priceWentUp ? 'Price went UP ↑' : 'Price went DOWN ↓'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}


export default function CryptoPredictionsPage() {
  const router = useRouter();
  const { data: predictionCounter, isLoading } = usePredictionCounter();
  const [selectedToken, setSelectedToken] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [tokenCategory, setTokenCategory] = useState<TokenCategory>('Featured');
  const [showSearch, setShowSearch] = useState(false);

  const totalPredictions = predictionCounter ? Number(predictionCounter) : 0;
  const predictionIds = Array.from({ length: totalPredictions }, (_, i) => i);
  const displayTokens = getTokensForCategory(tokenCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Crypto Price Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${totalPredictions} predictions total`}
          </p>
        </div>

        {/* Token Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-4xl w-full mt-20 mb-20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Browse All Tokens
                </h2>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TokenSearch
                onTokenSelect={(token) => {
                  router.push(`/crypto/token/${token.symbol.toLowerCase()}`);
                  setShowSearch(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Live Prices */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Live Prices · Auto-refreshes every 30s
            </h2>
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search All Tokens</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {(['Featured', 'All', 'DeFi', 'Base Ecosystem', 'Stablecoin', 'Wrapped'] as TokenCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setTokenCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  tokenCategory === category
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {displayTokens.map((token) => (
              <TokenPriceCard
                key={token.symbol}
                symbol={token.symbol}
                name={token.name}
                icon={token.icon}
                href={`/crypto/token/${token.symbol.toLowerCase()}`}
                showDetails={true}
              />
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {displayTokens.length} {tokenCategory !== 'All' ? tokenCategory : ''} tokens · Click any token to view detailed charts
            </p>
          </div>
        </div>

        {/* Create Prediction Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Create Your Prediction</h2>
              <p className="opacity-90">
                Choose a token and timeframe to predict price movement
              </p>
            </div>
            <Link
              href="/crypto/create"
              className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              + Create Prediction
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Token</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedToken('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedToken === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All Tokens
              </button>
              {SUPPORTED_TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token.symbol)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedToken === token.symbol
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{token.icon}</span>
                  {token.symbol}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Timeframe</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedTimeframe('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedTimeframe === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All Timeframes
              </button>
              {Object.keys(TIMEFRAMES).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Predictions Grid */}
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
        ) : totalPredictions === 0 ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              No Predictions Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to create a crypto price prediction!
            </p>
            <Link
              href="/crypto/create"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
            >
              Create First Prediction
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictionIds.reverse().map((id) => (
              <FilteredPredictionCard
                key={id}
                predictionId={id}
                selectedToken={selectedToken}
                selectedTimeframe={selectedTimeframe}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Wrapper component to handle filtering
function FilteredPredictionCard({
  predictionId,
  selectedToken,
  selectedTimeframe,
}: {
  predictionId: number;
  selectedToken: string;
  selectedTimeframe: string;
}) {
  const { data: prediction } = usePrediction(predictionId);

  if (!prediction) return null;

  // Filter by token
  if (selectedToken !== 'all' && prediction.tokenSymbol !== selectedToken) return null;

  // Filter by timeframe
  if (selectedTimeframe !== 'all') {
    const timeframeSeconds = TIMEFRAMES[selectedTimeframe as keyof typeof TIMEFRAMES];
    if (Number(prediction.timeframe) !== timeframeSeconds) return null;
  }

  return <PredictionCard predictionId={predictionId} />;
}
