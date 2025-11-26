'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import {
  useMarket,
  useMarketOdds,
  usePlaceBet,
  useUserBets,
  useResolveMarket,
  useClaimWinnings,
} from '@/hooks/useBettingContract';
import { formatEth, formatDate, getTimeRemaining, hasMarketEnded, shortenAddress } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = Number(params.id);
  const { address, isConnected } = useAccount();

  const { data: market, isLoading, refetch: refetchMarket } = useMarket(marketId);
  const { data: odds } = useMarketOdds(marketId);
  const { data: userBets, refetch: refetchUserBets } = useUserBets(marketId, address);

  const { placeBet, isPending: isBetting, isConfirming: isConfirmingBet, isSuccess: betSuccess } = usePlaceBet();
  const { resolveMarket, isPending: isResolving, isSuccess: resolveSuccess } = useResolveMarket();
  const { claimWinnings, isPending: isClaiming, isSuccess: claimSuccess } = useClaimWinnings();

  const [betAmount, setBetAmount] = useState('0.01');
  const [selectedOutcome, setSelectedOutcome] = useState<boolean>(true);

  useEffect(() => {
    if (betSuccess || resolveSuccess || claimSuccess) {
      refetchMarket();
      refetchUserBets();
    }
  }, [betSuccess, resolveSuccess, claimSuccess, refetchMarket, refetchUserBets]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Market not found</h2>
            <Link href="/markets" className="text-blue-600 hover:text-blue-700">
              ← Back to Markets
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPool = market.totalYesBets + market.totalNoBets;
  const ended = hasMarketEnded(market.endTime);
  const yesOdds = odds ? Number(odds[0]) : 50;
  const noOdds = odds ? Number(odds[1]) : 50;
  const isCreator = address?.toLowerCase() === market.creator.toLowerCase();

  const canResolve = isCreator && ended && !market.resolved;
  const canBet = isConnected && !ended && !market.resolved;

  // Category badge colors
  const categoryColors: Record<string, string> = {
    Sports: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Politics: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    Entertainment: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    Crypto: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    Custom: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  const userTotalBets = userBets?.reduce((sum, bet) => sum + bet.amount, 0n) || 0n;
  const hasWinningBets = userBets?.some(bet => bet.outcome === market.winningOutcome && !bet.claimed) || false;

  const handlePlaceBet = () => {
    if (!betAmount || parseFloat(betAmount) < parseFloat(formatEth(market.minBet))) {
      alert(`Minimum bet is ${formatEth(market.minBet)} ETH`);
      return;
    }
    placeBet(marketId, selectedOutcome, betAmount);
  };

  const handleResolve = (outcome: boolean) => {
    if (window.confirm(`Resolve market with outcome: ${outcome ? 'YES' : 'NO'}?`)) {
      resolveMarket(marketId, outcome);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/markets" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              ← Back to Markets
            </Link>
          </div>

          {/* Market Info */}
          <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    market.resolved
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : ended
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {market.resolved ? 'Resolved' : ended ? 'Ended' : 'Active'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {market.description}
                </h1>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-400">
                  <span>Created {formatDate(market.createdAt)}</span>
                  <span>•</span>
                  <span>Creator: {shortenAddress(market.creator)}</span>
                </div>
              </div>
            </div>

            {/* Odds Display */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                <div className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">YES</div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{yesOdds}%</div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Pool: {formatEth(market.totalYesBets)} ETH
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                <div className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">NO</div>
                <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{noOdds}%</div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Pool: {formatEth(market.totalNoBets)} ETH
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-purple-900/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatEth(totalPool)} ETH</div>
                <div className="text-sm text-gray-400">Total Pool</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatEth(market.minBet)} ETH</div>
                <div className="text-sm text-gray-400">Min Bet</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {ended ? 'Ended' : getTimeRemaining(market.endTime)}
                </div>
                <div className="text-sm text-gray-400">
                  {ended ? formatDate(market.endTime) : 'Time Left'}
                </div>
              </div>
            </div>

            {market.resolved && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Market Resolved
                  </div>
                  <div className="text-2xl font-bold">
                    <span className={market.winningOutcome ? 'text-green-600' : 'text-red-600'}>
                      {market.winningOutcome ? 'YES' : 'NO'} WON
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Betting Section */}
          {canBet && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Place Your Bet</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Select Outcome
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedOutcome(true)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedOutcome
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-xl font-bold text-green-600">YES</div>
                      <div className="text-sm text-gray-400">{yesOdds}% probability</div>
                    </button>
                    <button
                      onClick={() => setSelectedOutcome(false)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        !selectedOutcome
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-xl font-bold text-red-600">NO</div>
                      <div className="text-sm text-gray-400">{noOdds}% probability</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Bet Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min={formatEth(market.minBet)}
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Minimum: {formatEth(market.minBet)} ETH
                  </p>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={isBetting || isConfirmingBet}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBetting || isConfirmingBet ? 'Placing Bet...' : `Bet ${betAmount} ETH on ${selectedOutcome ? 'YES' : 'NO'}`}
                </button>

                {betSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                      Bet placed successfully!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolve Section (for creators) */}
          {canResolve && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Resolve Market</h2>
              <p className="text-gray-400 mb-6">
                As the market creator, you can now resolve this market and determine the winning outcome.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleResolve(true)}
                  disabled={isResolving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  Resolve as YES
                </button>
                <button
                  onClick={() => handleResolve(false)}
                  disabled={isResolving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  Resolve as NO
                </button>
              </div>
            </div>
          )}

          {/* User Bets & Claim Section */}
          {isConnected && userBets && userBets.length > 0 && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Your Bets</h2>

              <div className="space-y-4 mb-6">
                {userBets.map((bet, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        bet.outcome ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {bet.outcome ? 'YES' : 'NO'}
                      </span>
                      <span className="ml-3 text-white font-semibold">
                        {formatEth(bet.amount)} ETH
                      </span>
                      <span className="ml-3 text-sm text-gray-400">
                        {formatDate(bet.timestamp)}
                      </span>
                    </div>
                    {bet.claimed && (
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Claimed</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-purple-900/30 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 dark:text-gray-300">Total Bet:</span>
                  <span className="text-xl font-bold text-white">
                    {formatEth(userTotalBets)} ETH
                  </span>
                </div>

                {market.resolved && hasWinningBets && (
                  <button
                    onClick={() => claimWinnings(marketId)}
                    disabled={isClaiming}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim Winnings'}
                  </button>
                )}

                {claimSuccess && (
                  <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                      Winnings claimed successfully!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
