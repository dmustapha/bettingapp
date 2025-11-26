'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId } from 'wagmi';
import {
  usePredictionCounter,
  usePrediction,
  useCurrentPrice,
  useCreatePrediction,
  usePlacePredictionBet,
  useUserPredictionBets,
  useClaimPredictionWinnings,
  FEATURED_TOKENS,
  TIMEFRAMES,
} from '@/hooks/useCryptoMarketBets';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { TokenToggle } from '@/components/TokenSelector';
import { BASE_SEPOLIA_TOKENS, TokenInfo } from '@/config/tokens.base';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TokenChart } from '@/components/crypto/TokenChart';
import { formatEth, formatDate } from '@/lib/utils';
import { searchBaseTokens, POPULAR_BASE_TOKENS, type SearchResult } from '@/lib/dexscreener';
import { usePoints } from '@/hooks/usePoints';
import { calculatePoints } from '@/lib/points';

// Token Details Modal
function TokenDetailsModal({
  symbol,
  name,
  icon,
  onClose
}: {
  symbol: string;
  name: string;
  icon: string;
  onClose: () => void;
}) {
  const { data: price } = useCurrentPrice(symbol);

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const tokenDescriptions: Record<string, string> = {
    ETH: 'The world\'s programmable blockchain',
    BTC: 'The first and most valuable cryptocurrency',
    SOL: 'High-performance blockchain for decentralized apps',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-bg-card border-b border-brand-purple-900/30 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-3xl">
              {icon.startsWith('http') ? (
                <img src={icon} alt={symbol} className="w-8 h-8 rounded-full" />
              ) : (
                icon
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{name}</h2>
              <p className="text-gray-400 text-sm">{symbol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-brand-purple-500/20 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Info */}
          <div className="bg-brand-bg-secondary rounded-xl p-6 border border-brand-purple-900/30">
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-4xl font-bold text-white">${formatPrice(price)}</div>
            <div className="text-sm text-gray-400 mt-2">{tokenDescriptions[symbol] || 'Digital asset'}</div>
          </div>

          {/* Chart */}
          <div className="bg-brand-bg-secondary rounded-xl p-6 border border-brand-purple-900/30">
            <h3 className="text-lg font-semibold text-white mb-4">Price Chart</h3>
            <TokenChart
              symbol={symbol}
              height={400}
              showTimeframeSelector={true}
              chartType="area"
            />
          </div>

          {/* Token Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-brand-bg-secondary rounded-xl p-4 border border-brand-purple-900/30">
              <div className="text-sm text-gray-400 mb-1">Symbol</div>
              <div className="text-lg font-semibold text-white">{symbol}</div>
            </div>
            <div className="bg-brand-bg-secondary rounded-xl p-4 border border-brand-purple-900/30">
              <div className="text-sm text-gray-400 mb-1">Network</div>
              <div className="text-lg font-semibold text-white">Base Sepolia</div>
            </div>
            <div className="bg-brand-bg-secondary rounded-xl p-4 border border-brand-purple-900/30">
              <div className="text-sm text-gray-400 mb-1">Oracle</div>
              <div className="text-lg font-semibold text-white">Chainlink</div>
            </div>
            <div className="bg-brand-bg-secondary rounded-xl p-4 border border-brand-purple-900/30">
              <div className="text-sm text-gray-400 mb-1">Price Feed</div>
              <div className="text-lg font-semibold text-white">Live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Market Betting Card Component
function QuickBetCard({ token, onViewDetails }: { token: typeof FEATURED_TOKENS[0]; onViewDetails: () => void }) {
  const { isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState('0.01');
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '24h' | 'custom'>('1h');
  const [customTime, setCustomTime] = useState('1');
  const [customTimeUnit, setCustomTimeUnit] = useState<'s' | 'm' | 'h'>('m');
  const [showBetConfig, setShowBetConfig] = useState(false);
  const { data: currentPrice } = useCurrentPrice(token.symbol);
  const { createPrediction, isPending: isCreatingPrediction, isSuccess: isCreateSuccess } = useCreatePrediction();
  const { placePredictionBet, isPending: isPlacingBet, isSuccess: isPlaceSuccess } = usePlacePredictionBet();
  const { data: predictionCounter, refetch: refetchCounter } = usePredictionCounter();
  const [createdPredictionId, setCreatedPredictionId] = useState<number | null>(null);
  const [counterBeforeCreate, setCounterBeforeCreate] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTimeframeSeconds = () => {
    if (selectedTimeframe === 'custom') {
      const time = parseInt(customTime) || 1;
      switch (customTimeUnit) {
        case 's': return time;
        case 'm': return time * 60;
        case 'h': return time * 3600;
        default: return 60;
      }
    }

    switch (selectedTimeframe) {
      case '15s': return 15;
      case '30s': return 30;
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '1h': return 3600;
      case '4h': return 14400;
      case '24h': return 86400;
      default: return 3600;
    }
  };

  const handleDirectionSelect = (direction: 'up' | 'down') => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedDirection(direction);
    setShowBetConfig(true);
  };

  // Auto-place bet after prediction creation
  useEffect(() => {
    if (isCreateSuccess && counterBeforeCreate !== null && createdPredictionId === null) {
      // The new prediction ID is the counter value we stored BEFORE creation
      const newPredictionId = counterBeforeCreate;
      setCreatedPredictionId(newPredictionId);

      // Refetch counter to get updated value
      refetchCounter();

      // Place the bet on the newly created prediction
      if (selectedDirection) {
        const direction = selectedDirection === 'up'; // true for up, false for down
        placePredictionBet(newPredictionId, direction, betAmount);
      }
    }
  }, [isCreateSuccess, counterBeforeCreate, createdPredictionId, selectedDirection, betAmount, placePredictionBet, refetchCounter]);

  // Show success message and auto-scroll after bet is placed
  useEffect(() => {
    if (isPlaceSuccess && createdPredictionId !== null) {
      // Show success message
      setShowSuccessMessage(true);

      // Reset state and scroll after delay
      setTimeout(() => {
        setShowBetConfig(false);
        setSelectedDirection(null);
        setCreatedPredictionId(null);
        setCounterBeforeCreate(null);
        setShowSuccessMessage(false);

        // Scroll to active predictions
        const activePredictionsSection = document.getElementById('active-predictions');
        if (activePredictionsSection) {
          activePredictionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 2000);
    }
  }, [isPlaceSuccess, createdPredictionId]);

  const handlePlaceBet = () => {
    if (!selectedDirection || !isConnected) return;

    // Store the current counter value BEFORE creating the prediction
    if (predictionCounter) {
      setCounterBeforeCreate(Number(predictionCounter));
    }

    const timeframeSeconds = getTimeframeSeconds();
    createPrediction(token.symbol, timeframeSeconds);
  };

  const handleCancel = () => {
    setShowBetConfig(false);
    setSelectedDirection(null);
  };

  return (
    <div className="relative group bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-lg p-6 hover:shadow-glow-purple hover:border-brand-purple-500 transition-all">
      {/* View Details Button */}
      {!showBetConfig && (
        <button
          onClick={onViewDetails}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-brand-purple-500/20 hover:bg-brand-purple-500/30 text-gray-300 hover:text-white z-10"
          title="View chart & details"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-2xl shadow-lg">
            {token.icon.startsWith('http') ? (
              <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
            ) : (
              token.icon
            )}
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
          onClick={() => handleDirectionSelect('up')}
          disabled={!isConnected || showBetConfig}
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
          onClick={() => handleDirectionSelect('down')}
          disabled={!isConnected || showBetConfig}
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

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Bet placed successfully! Check active markets below ⬇️</span>
          </div>
        </div>
      )}

      {/* Expandable Bet Configuration */}
      {showBetConfig && !showSuccessMessage && (
        <div className="border-t border-brand-purple-900/30 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Timeframe Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Timeframe
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(['15s', '30s', '1m', '5m', '15m', '1h', '4h', '24h'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`py-2 px-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedTimeframe === timeframe
                      ? 'bg-brand-purple-600 text-white'
                      : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-purple-900/30'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>

            {/* Custom Timer Option */}
            <button
              onClick={() => setSelectedTimeframe('custom')}
              className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all mb-2 ${
                selectedTimeframe === 'custom'
                  ? 'bg-brand-purple-600 text-white'
                  : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-purple-900/30'
              }`}
            >
              Custom Timer
            </button>

            {/* Custom Timer Inputs */}
            {selectedTimeframe === 'custom' && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min="1"
                  className="flex-1 px-3 py-2 rounded-lg border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                  placeholder="Time"
                />
                <select
                  value={customTimeUnit}
                  onChange={(e) => setCustomTimeUnit(e.target.value as 's' | 'm' | 'h')}
                  className="px-3 py-2 rounded-lg border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  <option value="s">Seconds</option>
                  <option value="m">Minutes</option>
                  <option value="h">Hours</option>
                </select>
              </div>
            )}
          </div>

          {/* Bet Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Bet Amount (ETH)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2 rounded-lg border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
              placeholder="0.01"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCancel}
              className="py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={isCreatingPrediction || isPlacingBet}
              className={`py-3 rounded-lg font-semibold transition-all ${
                selectedDirection === 'up'
                  ? 'bg-brand-success hover:bg-brand-success/90 text-white'
                  : 'bg-brand-error hover:bg-brand-error/90 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCreatingPrediction || isPlacingBet ? 'Processing...' : 'Place Bet'}
            </button>
          </div>
        </div>
      )}

      {!showBetConfig && (
        <div className="text-xs text-center text-gray-400">
          {isConnected ? 'Click Bull or Bear to start!' : 'Connect wallet to start'}
        </div>
      )}
    </div>
  );
}

// Custom Token Search Subsection
function CustomTokenSearch({ onViewDetails }: { onViewDetails: (token: { symbol: string; name: string; icon: string }) => void }) {
  const { isConnected } = useAccount();
  const { createPrediction, isPending: isCreatingPrediction, isSuccess: isCreateSuccess, hash: createHash } = useCreatePrediction();
  const { placePredictionBet, isPending: isPlacingBet, isSuccess: isPlaceSuccess } = usePlacePredictionBet();
  const { data: predictionCounter, refetch: refetchCounter } = usePredictionCounter();

  // Token search state
  const [tokenSearch, setTokenSearch] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('ETH');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { data: currentPrice } = useCurrentPrice(selectedToken);

  // Timeframe state
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '24h' | 'custom'>('15s');
  const [customTime, setCustomTime] = useState('1');
  const [customTimeUnit, setCustomTimeUnit] = useState<'s' | 'm' | 'h'>('m');

  // Betting state
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [betAmount, setBetAmount] = useState('0.01');
  const [createdPredictionId, setCreatedPredictionId] = useState<number | null>(null);
  const [counterBeforeCreate, setCounterBeforeCreate] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate timeframe in seconds
  const getTimeframeSeconds = () => {
    switch (selectedTimeframe) {
      case '1h': return 3600;     // 1 hour
      case '4h': return 14400;    // 4 hours
      case '24h': return 86400;   // 24 hours
      case '7d': return 604800;   // 7 days
      default: return 3600;
    }
  };

  // Search for tokens using DexScreener API
  useEffect(() => {
    const searchTokens = async () => {
      if (tokenSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const results = await searchBaseTokens(tokenSearch);
      setSearchResults(results);
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(searchTokens, 500);
    return () => clearTimeout(debounceTimer);
  }, [tokenSearch]);

  // Display tokens: search results or popular tokens
  const displayTokens = tokenSearch.length >= 2 ? searchResults : POPULAR_BASE_TOKENS;

  // Auto-place bet after prediction creation
  useEffect(() => {
    if (isCreateSuccess && counterBeforeCreate !== null && createdPredictionId === null) {
      // The new prediction ID is the counter value we stored BEFORE creation
      const newPredictionId = counterBeforeCreate;
      setCreatedPredictionId(newPredictionId);

      // Refetch counter to get updated value
      refetchCounter();

      // Place the bet on the newly created prediction
      if (selectedDirection) {
        const direction = selectedDirection === 'up'; // true for up, false for down
        placePredictionBet(newPredictionId, direction, betAmount);
      }
    }
  }, [isCreateSuccess, counterBeforeCreate, createdPredictionId, selectedDirection, betAmount, placePredictionBet, refetchCounter]);

  // Show success message and auto-scroll after bet is placed
  useEffect(() => {
    if (isPlaceSuccess && createdPredictionId !== null) {
      // Show success message
      setShowSuccessMessage(true);

      // Reset state and scroll after delay
      setTimeout(() => {
        setSelectedDirection(null);
        setCreatedPredictionId(null);
        setCounterBeforeCreate(null);
        setShowSuccessMessage(false);

        // Scroll to active predictions
        const activePredictionsSection = document.getElementById('active-predictions');
        if (activePredictionsSection) {
          activePredictionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 2000);
    }
  }, [isPlaceSuccess, createdPredictionId]);

  const handlePlaceBet = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (!selectedDirection) {
      alert('Please select UP or DOWN');
      return;
    }

    // Store the current counter value BEFORE creating the prediction
    if (predictionCounter) {
      setCounterBeforeCreate(Number(predictionCounter));
    }

    const timeframeSeconds = getTimeframeSeconds();
    createPrediction(selectedToken, timeframeSeconds);
  };

  return (
    <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-xl">
            🔍
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Custom Token Search</h3>
            <p className="text-sm text-gray-400">
              Search for any token and create custom predictions with flexible timeframes
            </p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to start trading</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Token Search */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Search Base Chain Tokens
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                placeholder="Search by symbol, name, or paste contract address..."
                className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-brand-purple-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Token Selection Grid */}
            <div className="mt-3">
              {tokenSearch.length < 2 && (
                <p className="text-xs text-gray-400 mb-2">Popular Base Tokens:</p>
              )}
              {tokenSearch.length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-sm text-gray-400 py-4 text-center">No tokens found. Try a different search term.</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {displayTokens.map((token: any) => (
                  <div
                    key={token.symbol + (token.address || '')}
                    className={`relative group rounded-lg transition-all ${
                      selectedToken === token.symbol
                        ? 'bg-gradient-primary text-white shadow-glow-primary'
                        : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
                    }`}
                  >
                    {/* Chart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails({
                          symbol: token.symbol,
                          name: token.name,
                          icon: token.icon || '📈'
                        });
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-brand-purple-500/20 hover:bg-brand-purple-500/40 text-gray-300 hover:text-white z-10"
                      title="View chart"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToken(token.symbol);
                        setTokenSearch('');
                        setSearchResults([]);
                      }}
                      className="w-full py-3 px-3 text-left"
                    >
                      <div className="font-semibold text-sm">{token.symbol}</div>
                      <div className="text-xs opacity-70 truncate">{token.name}</div>
                      {token.priceUsd && (
                        <div className="text-xs opacity-60 mt-1">${parseFloat(token.priceUsd).toFixed(6)}</div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Token Info */}
          <div className="bg-brand-bg-secondary border border-brand-purple-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Selected Token</div>
                <div className="text-2xl font-bold text-white">{selectedToken}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-2xl font-bold text-white">${formatPrice(currentPrice)}</div>
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Prediction Timeframe
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 mb-3">
              {(['15s', '30s', '1m', '5m', '15m', '1h', '4h', '24h'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-gradient-primary text-white shadow-glow-primary'
                      : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Custom Timer Option */}
            <button
              onClick={() => setSelectedTimeframe('custom')}
              className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all mb-3 ${
                selectedTimeframe === 'custom'
                  ? 'bg-gradient-primary text-white shadow-glow-primary'
                  : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
              }`}
            >
              Custom Timer
            </button>

            {/* Custom Timer Inputs */}
            {selectedTimeframe === 'custom' && (
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min="1"
                  className="flex-1 px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                  placeholder="Time"
                />
                <select
                  value={customTimeUnit}
                  onChange={(e) => setCustomTimeUnit(e.target.value as 's' | 'm' | 'h')}
                  className="px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  <option value="s">Seconds</option>
                  <option value="m">Minutes</option>
                  <option value="h">Hours</option>
                </select>
              </div>
            )}
          </div>

          {/* Bet Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Bet Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 transition-all"
            />
          </div>

          {/* Bull/Bear Buttons */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Your Prediction
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedDirection('up')}
                className={`py-6 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 ${
                  selectedDirection === 'up'
                    ? 'bg-brand-success border-2 border-brand-success text-white shadow-lg scale-105'
                    : 'bg-brand-success/20 border-2 border-brand-success hover:bg-brand-success/30 text-brand-success'
                }`}
              >
                <div className="text-3xl mb-2">🐂</div>
                <div>BULL (UP)</div>
              </button>
              <button
                onClick={() => setSelectedDirection('down')}
                className={`py-6 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 ${
                  selectedDirection === 'down'
                    ? 'bg-brand-error border-2 border-brand-error text-white shadow-lg scale-105'
                    : 'bg-brand-error/20 border-2 border-brand-error hover:bg-brand-error/30 text-brand-error'
                }`}
              >
                <div className="text-3xl mb-2">🐻</div>
                <div>BEAR (DOWN)</div>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Bet placed successfully! Check active markets below ⬇️</span>
              </div>
            </div>
          )}

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!selectedDirection || isCreatingPrediction || isPlacingBet || showSuccessMessage}
            className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isCreatingPrediction || isPlacingBet ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Placing Bet...</span>
              </span>
            ) : (
              `⚡ Place ${selectedDirection ? selectedDirection.toUpperCase() : ''} Bet (${betAmount} ETH)`
            )}
          </button>

          {/* Info */}
          <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-300">
              💡 Your prediction will be created on-chain and resolved automatically using Chainlink price feeds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// History Prediction Card Component (for resolved predictions)
function HistoryPredictionCard({ predictionId }: { predictionId: number }) {
  const { address } = useAccount();
  const { data: prediction } = usePrediction(predictionId);
  const { data: userBets, refetch: refetchBets } = useUserPredictionBets(predictionId, address);
  const { claimPredictionWinnings, isPending, isConfirming, isSuccess } = useClaimPredictionWinnings();
  const { addBetPoints } = usePoints();

  // Extract data
  // Contract returns: id, tokenSymbol, priceFeed, timeframe, startPrice, endPrice, totalUpBets, totalDownBets, totalUpBetsEth, totalDownBetsEth, resolved, priceWentUp, startTime, endTime
  let id: any, tokenSymbol: any, priceFeed: any, timeframe: any, startPrice: any, endPrice: any, totalUpBets: any, totalDownBets: any, totalUpBetsEth: any, totalDownBetsEth: any, resolved: any, winningOutcome: any, startTime: any, endTime: any;

  if (prediction) {
    if (Array.isArray(prediction)) {
      [id, tokenSymbol, priceFeed, timeframe, startPrice, endPrice, totalUpBets, totalDownBets, totalUpBetsEth, totalDownBetsEth, resolved, winningOutcome, startTime, endTime] = prediction;
    } else {
      ({ id, tokenSymbol, priceFeed, timeframe, startPrice, endPrice, totalUpBets, totalDownBets, totalUpBetsEth, totalDownBetsEth, resolved, winningOutcome, startTime, endTime } = prediction as any);
    }
  }

  // Only show resolved predictions
  if (!prediction || !resolved) return null;

  // Check if user has winning unclaimed bets
  const hasWinningUnclaimedBets = userBets && Array.isArray(userBets) && userBets.some((bet: any) => {
    const betDirection = Array.isArray(bet) ? bet[2] : bet.direction;
    const claimed = Array.isArray(bet) ? bet[5] : bet.claimed;
    return betDirection === winningOutcome && !claimed;
  });

  // Check if user participated
  const userParticipated = userBets && Array.isArray(userBets) && userBets.length > 0;

  // Check if user won (has any bets on winning side)
  const userWon = userBets && Array.isArray(userBets) && userBets.some((bet: any) => {
    const betDirection = Array.isArray(bet) ? bet[2] : bet.direction;
    return betDirection === winningOutcome;
  });

  // Check if all winning bets are claimed
  const allClaimed = userBets && Array.isArray(userBets) && userBets.every((bet: any) => {
    const betDirection = Array.isArray(bet) ? bet[2] : bet.direction;
    const claimed = Array.isArray(bet) ? bet[5] : bet.claimed;
    return betDirection !== winningOutcome || claimed;
  });

  // Refetch bets after successful claim
  useEffect(() => {
    if (isSuccess) {
      refetchBets();
    }
  }, [isSuccess, refetchBets]);

  // Award points for resolved predictions (only once per prediction)
  useEffect(() => {
    if (!prediction || !address || !userBets || !Array.isArray(userBets) || userBets.length === 0) return;
    if (!resolved) return;

    // Check if points already awarded for this prediction
    const awardedKey = `points_awarded_${predictionId}_${address.toLowerCase()}`;
    if (localStorage.getItem(awardedKey)) return;

    // Calculate total bet amount in USD (approximate: 1 ETH = $3000, 1 USDC = $1)
    let totalBetAmountUSD = 0;
    let userWon = false;
    let userDirection: 'up' | 'down' = 'up';

    userBets.forEach((bet: any) => {
      const betDirection = Array.isArray(bet) ? bet[2] : bet.direction;
      const betAmountUsdc = Array.isArray(bet) ? bet[3] : bet.amountUsdc;
      const betAmountEth = Array.isArray(bet) ? bet[4] : bet.amountEth;

      // Convert to USD (approximate)
      totalBetAmountUSD += Number(betAmountUsdc) / 1e6; // USDC has 6 decimals
      totalBetAmountUSD += (Number(betAmountEth) / 1e18) * 3000; // ETH to USD

      // Check if user won
      if (betDirection === winningOutcome) {
        userWon = true;
      }
      userDirection = betDirection ? 'up' : 'down';
    });

    if (totalBetAmountUSD > 0 && timeframe) {
      // Award points
      addBetPoints(
        predictionId,
        totalBetAmountUSD,
        Number(timeframe),
        userDirection,
        userWon
      );

      // Mark as awarded
      localStorage.setItem(awardedKey, 'true');
    }
  }, [prediction, address, userBets, predictionId, resolved, winningOutcome, timeframe, addBetPoints]);

  const totalPool = (totalUpBets || 0n) + (totalDownBets || 0n) + (totalUpBetsEth || 0n) + (totalDownBetsEth || 0n);
  const winningPool = winningOutcome ? (totalUpBets || 0n) + (totalUpBetsEth || 0n) : (totalDownBets || 0n) + (totalDownBetsEth || 0n);
  const losingPool = winningOutcome ? (totalDownBets || 0n) + (totalDownBetsEth || 0n) : (totalUpBets || 0n) + (totalUpBetsEth || 0n);

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleClaim = () => {
    if (predictionId !== undefined) {
      claimPredictionWinnings(predictionId);
    }
  };

  // Calculate points earned for display
  let pointsEarned = 0;
  if (userBets && Array.isArray(userBets) && userBets.length > 0 && timeframe) {
    let totalBetAmountUSD = 0;
    userBets.forEach((bet: any) => {
      const betAmountUsdc = Array.isArray(bet) ? bet[3] : bet.amountUsdc;
      const betAmountEth = Array.isArray(bet) ? bet[4] : bet.amountEth;
      totalBetAmountUSD += Number(betAmountUsdc) / 1e6;
      totalBetAmountUSD += (Number(betAmountEth) / 1e18) * 3000;
    });
    if (totalBetAmountUSD > 0) {
      pointsEarned = calculatePoints(totalBetAmountUSD, Number(timeframe), userWon);
    }
  }

  return (
    <div className="bg-brand-bg-card rounded-xl shadow-lg p-6 border-2 border-brand-purple-900/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              Resolved
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              {tokenSymbol}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              winningOutcome
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {winningOutcome ? '🐂 BULL Won' : '🐻 BEAR Won'}
            </span>
            {userParticipated && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                userWon
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {userWon ? '✅ You Won' : '❌ You Lost'}
              </span>
            )}
            {pointsEarned > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-400 border border-yellow-400/50">
                🎯 +{pointsEarned.toLocaleString()} pts
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            Ended {formatDate(endTime)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`rounded-lg p-4 border ${
          winningOutcome
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">UP Pool {winningOutcome && '👑'}</div>
          <div className={`space-y-0.5 ${winningOutcome ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {totalUpBetsEth && totalUpBetsEth > 0n && (
              <div className="text-lg font-bold">
                {formatEth(totalUpBetsEth)} ETH
              </div>
            )}
            {totalUpBets && totalUpBets > 0n && (
              <div className="text-lg font-bold">
                {(Number(totalUpBets) / 1e6).toFixed(2)} USDC
              </div>
            )}
            {(!totalUpBetsEth || totalUpBetsEth === 0n) && (!totalUpBets || totalUpBets === 0n) && (
              <div className="text-lg font-bold">0</div>
            )}
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${
          !winningOutcome
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">DOWN Pool {!winningOutcome && '👑'}</div>
          <div className={`space-y-0.5 ${!winningOutcome ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {totalDownBetsEth && totalDownBetsEth > 0n && (
              <div className="text-lg font-bold">
                {formatEth(totalDownBetsEth)} ETH
              </div>
            )}
            {totalDownBets && totalDownBets > 0n && (
              <div className="text-lg font-bold">
                {(Number(totalDownBets) / 1e6).toFixed(2)} USDC
              </div>
            )}
            {(!totalDownBetsEth || totalDownBetsEth === 0n) && (!totalDownBets || totalDownBets === 0n) && (
              <div className="text-lg font-bold">0</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-brand-bg-secondary rounded-lg p-4 border border-brand-purple-900/30 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Start Price</div>
            <div className="text-white font-semibold">${formatPrice(startPrice)}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">End Price</div>
            <div className="text-white font-semibold">${formatPrice(endPrice)}</div>
          </div>
        </div>
      </div>

      <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Total Pool</div>
          <div className="text-2xl font-bold text-white">
            {formatEth(totalPool)} ETH
          </div>
        </div>
      </div>

      {/* Claim Winnings Button */}
      {hasWinningUnclaimedBets && (
        <button
          onClick={handleClaim}
          disabled={isPending || isConfirming}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-glow-green disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isPending ? 'Confirm in Wallet...' : 'Claiming...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Claim Your Winnings
            </span>
          )}
        </button>
      )}

      {/* Already Claimed Message */}
      {userWon && allClaimed && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="text-center text-green-400 font-semibold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Winnings Already Claimed
          </div>
        </div>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="text-center text-green-400 font-semibold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Winnings Claimed Successfully!
          </div>
        </div>
      )}
    </div>
  );
}

// Active Prediction Card Component
function ActivePredictionCard({ predictionId }: { predictionId: number }) {
  const { data: prediction, refetch } = usePrediction(predictionId);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Extract data before any conditional returns
  let id, tokenSymbol, description, startPrice, endTime, totalYesPool, totalNoPool, resolved, winningOutcome, actualEndPrice, creator;

  if (prediction) {
    if (Array.isArray(prediction)) {
      [id, tokenSymbol, description, startPrice, endTime, totalYesPool, totalNoPool, resolved, winningOutcome, actualEndPrice, creator] = prediction;
    } else {
      // Object format
      ({ id, tokenSymbol, description, startPrice, endTime, totalYesPool, totalNoPool, resolved, winningOutcome, actualEndPrice, creator } = prediction as any);
    }
  }

  const isExpired = endTime ? Number(endTime) < Date.now() / 1000 : false;
  const totalPool = (totalYesPool || 0n) + (totalNoPool || 0n);

  // Countdown timer for active predictions - must be called before any conditional returns
  useEffect(() => {
    if (prediction && endTime && !resolved && !isExpired) {
      const interval = setInterval(() => {
        const remaining = Number(endTime) - Math.floor(Date.now() / 1000);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          // Refetch prediction data to check if it's been resolved
          refetch();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [prediction, resolved, isExpired, endTime, refetch]);

  // Now we can do conditional returns AFTER all hooks
  if (!prediction) return null;

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 0) return 'Expired';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatus = () => {
    if (resolved) return { label: 'Resolved', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
    if (isExpired && !resolved) return { label: 'Awaiting Resolution', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' };
    return { label: 'Active', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
  };

  const status = getStatus();

  return (
    <div className="bg-brand-bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-brand-purple-900/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
              {status.label}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              {tokenSymbol}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {description}
          </h3>
          <div className="text-sm text-gray-400">
            {!resolved && !isExpired ? (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-semibold">⏱️ {formatTimeRemaining(timeRemaining)}</span>
                <span className="text-gray-500">remaining</span>
              </div>
            ) : (
              <span>Ended {formatDate(endTime)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">YES Pool</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatEth(totalYesPool)} ETH
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">NO Pool</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatEth(totalNoPool)} ETH
          </div>
        </div>
      </div>

      <div className="bg-brand-bg-secondary rounded-lg p-4 border border-brand-purple-900/30">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Total Pool</div>
          <div className="text-2xl font-bold text-white">
            {formatEth(totalPool)} ETH
          </div>
        </div>
      </div>

      {resolved && (
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-center">
            <div className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
              Winner: {winningOutcome ? 'YES' : 'NO'}
            </div>
            <div className="text-xs text-gray-400">
              End Price: ${Number(actualEndPrice) / 1e8}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CryptoPredictionsPage() {
  const router = useRouter();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { createPrediction, isPending: isCreating, isSuccess: isCreateSuccess } = useCreatePrediction();
  const { data: predictionCounter } = usePredictionCounter();

  const [selectedToken, setSelectedToken] = useState<TokenInfo>(BASE_SEPOLIA_TOKENS.ETH);
  const [customDescription, setCustomDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<keyof typeof TIMEFRAMES>('1h');
  const [betAmount, setBetAmount] = useState('0.01');
  const [showTokenDetails, setShowTokenDetails] = useState<{symbol: string; name: string; icon: string} | null>(null);
  const [showCustomSearch, setShowCustomSearch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleCreateCustomPrediction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customDescription) {
      alert('Please describe what you\'re betting on');
      return;
    }

    const timeframeSeconds = TIMEFRAMES[selectedTimeframe];
    createPrediction(selectedToken.symbol, timeframeSeconds);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      {/* Token Details Modal */}
      {showTokenDetails && (
        <TokenDetailsModal
          symbol={showTokenDetails.symbol}
          name={showTokenDetails.name}
          icon={showTokenDetails.icon}
          onClose={() => setShowTokenDetails(null)}
        />
      )}

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
              Quick UP or DOWN bets on major crypto assets with live prices. Hover over cards to view detailed charts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {FEATURED_TOKENS.map((token) => (
              <QuickBetCard
                key={token.symbol}
                token={token}
                onViewDetails={() => setShowTokenDetails({ symbol: token.symbol, name: token.name, icon: token.icon })}
              />
            ))}
          </div>

          {/* Custom Token Search Toggle Button */}
          <div className="mt-12 text-center">
            {!showCustomSearch ? (
              <button
                onClick={() => setShowCustomSearch(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-purple-600 to-brand-pink-600 hover:from-brand-purple-700 hover:to-brand-pink-700 rounded-xl shadow-lg hover:shadow-glow-purple transition-all text-white font-semibold text-lg"
              >
                <span className="text-2xl">🔍</span>
                <span>Search Custom Tokens</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setShowCustomSearch(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-bg-card border border-brand-purple-800 hover:border-brand-purple-600 rounded-xl transition-all text-gray-300 hover:text-white font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span>Hide Custom Search</span>
              </button>
            )}
          </div>

          {/* Custom Token Search Subsection */}
          {showCustomSearch && (
            <div className="mt-8">
              <CustomTokenSearch
                onViewDetails={(token) => setShowTokenDetails(token)}
              />
            </div>
          )}
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

          {/* Active Predictions List */}
          {predictionCounter && Number(predictionCounter) > 0 && (
            <div id="active-predictions" className="mt-12 scroll-mt-24">
              <h3 className="text-2xl font-bold text-white mb-6">Active Predictions</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Number(predictionCounter) }, (_, i) => i).reverse().map((id) => (
                  <ActivePredictionCard key={id} predictionId={id} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-brand-purple-900/30 my-16"></div>

        {/* Bet History Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-bg-card border-2 border-brand-purple-800 hover:border-brand-purple-600 rounded-xl shadow-lg hover:shadow-glow-purple transition-all text-white font-semibold text-lg"
            >
              <span className="text-2xl">📜</span>
              <span>{showHistory ? 'Hide' : 'View'} Bet History</span>
              <svg
                className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showHistory && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">Past Predictions</h3>
                <p className="text-gray-400">View all resolved predictions and their outcomes</p>
              </div>

              {predictionCounter && Number(predictionCounter) > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: Number(predictionCounter) }, (_, i) => i).reverse().map((id) => (
                    <HistoryPredictionCard key={id} predictionId={id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
                  <p className="text-gray-400">Place your first bet to start building your prediction history!</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
