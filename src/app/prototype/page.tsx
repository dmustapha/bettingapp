'use client';

import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { formatEth, formatDate, shortenAddress } from '@/lib/utils';

export default function PrototypePage() {
  const currentUserAddress = '0x1234567890123456789012345678901234567890';

  // Mock data for WINNING market bet
  const mockPredictionWin = {
    id: 0,
    tokenSymbol: 'BTC',
    description: 'BTC will reach $95,000 in 24 hours',
    startPrice: 9245000000000n, // $92,450
    endPrice: 9580000000000n, // $95,800
    totalYesPool: 250000000000000000n, // 0.25 ETH
    totalNoPool: 150000000000000000n, // 0.15 ETH
    resolved: true,
    winningOutcome: true, // YES won
    endTime: Math.floor(Date.now() / 1000),
    userBetDirection: true, // User bet UP (YES) - WON
  };

  // Mock data for LOSING market bet
  const mockPredictionLoss = {
    id: 1,
    tokenSymbol: 'ETH',
    description: 'ETH will break $4,000 resistance in 4 hours',
    startPrice: 3850000000000n, // $38,500
    endPrice: 3780000000000n, // $37,800
    totalYesPool: 180000000000000000n, // 0.18 ETH
    totalNoPool: 320000000000000000n, // 0.32 ETH
    resolved: true,
    winningOutcome: false, // NO won
    endTime: Math.floor(Date.now() / 1000),
    userBetDirection: true, // User bet UP (YES) - LOST
  };

  // Mock data for WINNING wager
  const mockWagerWin = {
    id: 1,
    claim: 'Arsenal to win the Premier League 2025',
    creator: currentUserAddress as `0x${string}`,
    resolver: '0x0987654321098765432109876543210987654321' as `0x${string}`,
    stakeAmount: 100000000000000000n, // 0.1 ETH
    currentParticipants: 2,
    maxParticipants: 2,
    participants: [
      currentUserAddress,
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    ],
    resolved: true,
    winner: currentUserAddress as `0x${string}`,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
    expiryTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    isPublic: true,
  };

  // Mock data for LOSING wager
  const mockWagerLoss = {
    id: 2,
    claim: 'Manchester City will win the Champions League',
    creator: currentUserAddress as `0x${string}`,
    resolver: '0x0987654321098765432109876543210987654321' as `0x${string}`,
    stakeAmount: 50000000000000000n, // 0.05 ETH
    currentParticipants: 3,
    maxParticipants: 5,
    participants: [
      currentUserAddress,
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      '0x9999999999999999999999999999999999999999',
    ],
    resolved: true,
    winner: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 14, // 14 days ago
    expiryTime: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    isPublic: false,
  };

  const formatPrice = (price: bigint) => {
    const priceNum = Number(price) / 1e8;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderMarketBet = (prediction: typeof mockPredictionWin, userWon: boolean) => {
    const totalPool = prediction.totalYesPool + prediction.totalNoPool;

    return (
      <div className="bg-brand-bg-card rounded-xl shadow-lg p-6 border-2 border-brand-purple-900/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                Resolved
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {prediction.tokenSymbol}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                prediction.winningOutcome
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {prediction.winningOutcome ? '🐂 BULL Won' : '🐻 BEAR Won'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {prediction.description}
            </h3>
            <div className="text-sm text-gray-400">
              Ended {formatDate(prediction.endTime)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-lg p-4 border ${
            prediction.winningOutcome
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              UP Pool {prediction.winningOutcome && '👑'}
            </div>
            <div className={`text-xl font-bold ${
              prediction.winningOutcome
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {formatEth(prediction.totalYesPool)} ETH
            </div>
          </div>

          <div className={`rounded-lg p-4 border ${
            !prediction.winningOutcome
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              DOWN Pool {!prediction.winningOutcome && '👑'}
            </div>
            <div className={`text-xl font-bold ${
              !prediction.winningOutcome
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {formatEth(prediction.totalNoPool)} ETH
            </div>
          </div>
        </div>

        <div className="bg-brand-bg-secondary rounded-lg p-4 border border-brand-purple-900/30 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Start Price</div>
              <div className="text-white font-semibold">${formatPrice(prediction.startPrice)}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">End Price</div>
              <div className={`font-semibold ${
                prediction.endPrice > prediction.startPrice ? 'text-green-400' : 'text-red-400'
              }`}>
                ${formatPrice(prediction.endPrice)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Pool</div>
            <div className="text-2xl font-bold text-white">
              {formatEth(totalPool)} ETH
            </div>
          </div>
        </div>

        {/* Win/Loss message */}
        {userWon ? (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-center">
              <div className="text-green-400 font-semibold text-sm mb-1">🎉 You predicted correctly!</div>
              <div className="text-white text-sm">
                Your payout: <span className="font-bold text-green-400">0.12 ETH</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-center">
              <div className="text-red-400 font-semibold text-sm mb-1">😔 You predicted incorrectly</div>
              <div className="text-gray-400 text-sm">
                You lost your stake of <span className="font-bold text-red-400">0.05 ETH</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWager = (wager: typeof mockWagerWin, userWon: boolean) => {
    const isUserWinner = wager.winner.toLowerCase() === currentUserAddress.toLowerCase();

    return (
      <div className="bg-gradient-to-br from-brand-purple-900/30 via-brand-bg-card to-brand-pink-900/20 border border-brand-purple-500/30 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-purple-500/20 to-transparent blur-3xl -z-10"></div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-500/20 text-gray-300 border border-gray-500/30 backdrop-blur-sm">
              Resolved
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-purple-500/30 text-brand-purple-200 border border-brand-purple-400/50 backdrop-blur-sm">
              ✨ Your Wager
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
            {wager.claim}
          </h1>
          <div className="flex items-center gap-3 flex-wrap text-sm text-gray-300">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Created {formatDate(wager.createdAt)}</span>
            </div>
            <span className="text-brand-purple-400">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expired {formatDate(wager.expiryTime)}</span>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-brand-bg-secondary/80 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-emerald-400">
                Participants ({wager.currentParticipants}/{wager.maxParticipants})
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {wager.participants.map((participant: string, index: number) => (
                <div key={participant} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm font-mono text-emerald-300">
                  {shortenAddress(participant as `0x${string}`)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="relative overflow-hidden rounded-2xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-500 via-brand-pink-500 to-brand-purple-600 opacity-90"></div>
          <div className="relative p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-white/80 mb-1 uppercase tracking-wider">
              Prize Pool
            </div>
            <div className="text-3xl font-black text-white mb-2 tracking-tight">
              {formatEth(wager.stakeAmount * BigInt(wager.currentParticipants))} ETH
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {isUserWinner ? (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 opacity-90"></div>
            <div className="relative p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-white/80 mb-1 uppercase tracking-wider">
                Wager Resolved
              </div>
              <div className="text-2xl font-black text-white mb-2">
                Winner: You
              </div>
              <div className="mt-2 text-lg font-bold text-white animate-pulse">
                🎉 Congratulations!
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 opacity-90"></div>
            <div className="relative p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-xs font-bold text-white/80 mb-1 uppercase tracking-wider">
                Wager Resolved
              </div>
              <div className="text-xl font-black text-white mb-2">
                Winner: {shortenAddress(wager.winner)}
              </div>
              <div className="mt-2 text-lg font-bold text-white">
                😔 You lost this wager
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">UI Prototypes</h1>
          <p className="text-gray-400 mb-12">Preview of resolved market bets and wagers (winning & losing states)</p>

          {/* Market Bets Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>📊</span>
              <span>Market Bets</span>
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-400">Winning Bet</h3>
                {renderMarketBet(mockPredictionWin, true)}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-400">Losing Bet</h3>
                {renderMarketBet(mockPredictionLoss, false)}
              </div>
            </div>
          </div>

          {/* P2P Wagers Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>🤝</span>
              <span>P2P Wagers</span>
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-400">Winning Wager</h3>
                {renderWager(mockWagerWin, true)}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-400">Losing Wager</h3>
                {renderWager(mockWagerLoss, false)}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
