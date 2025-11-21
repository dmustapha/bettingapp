'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId } from 'wagmi';
import {
  usePredictionCounter,
  usePrediction,
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
import { TokenChart } from '@/components/crypto/TokenChart';
import { formatEth, formatDate } from '@/lib/utils';

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
              {icon}
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15s' | '30s' | '1m' | '5m' | '30m' | 'custom'>('1m');
  const [customHours, setCustomHours] = useState('1');
  const [showBetConfig, setShowBetConfig] = useState(false);
  const { data: currentPrice } = useCurrentPrice(token.symbol);
  const { createPrediction, isPending: isCreatingPrediction } = useCreatePrediction();
  const { placePredictionBet, isPending: isPlacingBet, isSuccess } = usePlacePredictionBet();

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTimeframeSeconds = () => {
    switch (selectedTimeframe) {
      case '15s': return 15;
      case '30s': return 30;
      case '1m': return 60;
      case '5m': return 300;
      case '30m': return 1800;
      case 'custom': return parseInt(customHours) * 3600;
      default: return 60;
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

  const handlePlaceBet = async () => {
    if (!selectedDirection || !isConnected) return;

    try {
      // Create prediction and place bet
      const predictionOutcome = selectedDirection === 'up';
      const description = `${token.symbol} will go ${selectedDirection.toUpperCase()} in ${selectedTimeframe}`;

      // This would need to be integrated with your contract logic
      alert(`Placing ${selectedDirection.toUpperCase()} bet on ${token.symbol} for ${betAmount} ETH (${selectedTimeframe})`);

      // Reset after successful bet
      setShowBetConfig(false);
      setSelectedDirection(null);
    } catch (error) {
      console.error('Error placing bet:', error);
    }
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

      {/* Expandable Bet Configuration */}
      {showBetConfig && (
        <div className="border-t border-brand-purple-900/30 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Timeframe Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Timeframe
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['15s', '30s', '1m', '5m', '30m', 'custom'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    selectedTimeframe === timeframe
                      ? 'bg-brand-purple-600 text-white'
                      : 'bg-brand-bg-secondary text-gray-300 hover:bg-brand-purple-900/30'
                  }`}
                >
                  {timeframe === 'custom' ? 'Custom' : timeframe}
                </button>
              ))}
            </div>
            {selectedTimeframe === 'custom' && (
              <div className="mt-2">
                <label className="block text-xs text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 rounded-lg border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 text-sm"
                  placeholder="Enter hours"
                />
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
function CustomTokenSearch() {
  const { isConnected } = useAccount();
  const { createPrediction, isPending: isCreatingPrediction } = useCreatePrediction();
  const { placePredictionBet, isPending: isPlacingBet } = usePlacePredictionBet();

  // Token search state
  const [tokenSearch, setTokenSearch] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('ETH');
  const { data: currentPrice } = useCurrentPrice(selectedToken);

  // Timeframe state
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15s' | '30s' | '1m' | '5m' | '30m' | 'custom'>('1m');
  const [customHours, setCustomHours] = useState('1');

  // Betting state
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [betAmount, setBetAmount] = useState('0.01');

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '---';
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate timeframe in seconds
  const getTimeframeSeconds = () => {
    switch (selectedTimeframe) {
      case '15s': return 15;
      case '30s': return 30;
      case '1m': return 60;
      case '5m': return 300;
      case '30m': return 1800;
      case 'custom': return parseInt(customHours) * 3600;
      default: return 60;
    }
  };

  // Available tokens (you can expand this list)
  const availableTokens = ['ETH', 'BTC', 'SOL', 'USDC', 'USDT', 'WETH'];
  const filteredTokens = tokenSearch
    ? availableTokens.filter(t => t.toLowerCase().includes(tokenSearch.toLowerCase()))
    : availableTokens;

  const handlePlaceBet = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (!selectedDirection) {
      alert('Please select UP or DOWN');
      return;
    }

    try {
      const timeframeSeconds = getTimeframeSeconds();
      await createPrediction(selectedToken, timeframeSeconds);
      alert(`Prediction created! Direction: ${selectedDirection.toUpperCase()}, Timeframe: ${selectedTimeframe === 'custom' ? customHours + 'h' : selectedTimeframe}`);
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    }
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
              Search Token
            </label>
            <input
              type="text"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              placeholder="Enter token symbol or address..."
              className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 transition-all"
            />

            {/* Token Selection Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              {filteredTokens.map((token) => (
                <button
                  key={token}
                  onClick={() => {
                    setSelectedToken(token);
                    setTokenSearch('');
                  }}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    selectedToken === token
                      ? 'bg-gradient-primary text-white shadow-glow-primary'
                      : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
                  }`}
                >
                  {token}
                </button>
              ))}
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {(['15s', '30s', '1m', '5m', '30m'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-gradient-primary text-white shadow-glow-primary'
                      : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
                  }`}
                >
                  {tf}
                </button>
              ))}
              <button
                onClick={() => setSelectedTimeframe('custom')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  selectedTimeframe === 'custom'
                    ? 'bg-gradient-primary text-white shadow-glow-primary'
                    : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:border-brand-purple-500'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Hours Input */}
            {selectedTimeframe === 'custom' && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1 text-gray-400">
                  Enter Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="e.g., 2"
                  className="w-full px-4 py-2 rounded-lg border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Max: 168 hours (7 days)</p>
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

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!selectedDirection || isCreatingPrediction || isPlacingBet}
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

// Active Prediction Card Component
function ActivePredictionCard({ predictionId }: { predictionId: number }) {
  const { data: prediction } = usePrediction(predictionId);

  if (!prediction) return null;

  const [
    id,
    tokenSymbol,
    description,
    startPrice,
    endTime,
    totalYesPool,
    totalNoPool,
    resolved,
    winningOutcome,
    actualEndPrice,
    creator,
  ] = prediction as any[];

  const isExpired = Number(endTime) < Date.now() / 1000;
  const totalPool = totalYesPool + totalNoPool;

  const getStatus = () => {
    if (resolved) return { label: 'Resolved', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
    if (isExpired && !resolved) return { label: 'Awaiting Resolution', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' };
    return { label: 'Active', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
  };

  const status = getStatus();

  return (
    <Link href={`/crypto/predictions/${predictionId}`}>
      <div className="bg-brand-bg-card rounded-xl shadow-lg p-6 hover:shadow-xl hover:border-brand-purple-500 transition-all border-2 border-transparent cursor-pointer">
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
              <span>Ends {formatDate(endTime)}</span>
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
    </Link>
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
              <CustomTokenSearch />
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
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6">Active Predictions</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Number(predictionCounter) }, (_, i) => i).reverse().map((id) => (
                  <ActivePredictionCard key={id} predictionId={id} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
