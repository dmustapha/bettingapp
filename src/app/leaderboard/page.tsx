'use client';

import { useAccount } from 'wagmi';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { formatPoints, getRankBadge, getRankColor } from '@/lib/points';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

// Dummy leaderboard data
const DUMMY_LEADERBOARD = [
  {
    address: '0x1234567890123456789012345678901234567890',
    totalPoints: 15420,
    wins: 45,
    losses: 23,
    totalBets: 68,
    rank: 1,
  },
  {
    address: '0x2345678901234567890123456789012345678901',
    totalPoints: 12850,
    wins: 38,
    losses: 19,
    totalBets: 57,
    rank: 2,
  },
  {
    address: '0x3456789012345678901234567890123456789012',
    totalPoints: 10300,
    wins: 32,
    losses: 21,
    totalBets: 53,
    rank: 3,
  },
  {
    address: '0x4567890123456789012345678901234567890123',
    totalPoints: 8920,
    wins: 28,
    losses: 18,
    totalBets: 46,
    rank: 4,
  },
  {
    address: '0x5678901234567890123456789012345678901234',
    totalPoints: 7650,
    wins: 24,
    losses: 16,
    totalBets: 40,
    rank: 5,
  },
  {
    address: '0x6789012345678901234567890123456789012345',
    totalPoints: 6540,
    wins: 21,
    losses: 14,
    totalBets: 35,
    rank: 6,
  },
  {
    address: '0x7890123456789012345678901234567890123456',
    totalPoints: 5420,
    wins: 18,
    losses: 12,
    totalBets: 30,
    rank: 7,
  },
  {
    address: '0x8901234567890123456789012345678901234567',
    totalPoints: 4380,
    wins: 15,
    losses: 10,
    totalBets: 25,
    rank: 8,
  },
  {
    address: '0x9012345678901234567890123456789012345678',
    totalPoints: 3290,
    wins: 12,
    losses: 8,
    totalBets: 20,
    rank: 9,
  },
  {
    address: '0xabcdef0123456789012345678901234567890123',
    totalPoints: 2150,
    wins: 9,
    losses: 6,
    totalBets: 15,
    rank: 10,
  },
];

export default function LeaderboardPage() {
  const { address } = useAccount();

  // Use dummy data for now
  const leaderboard = DUMMY_LEADERBOARD;
  const loading = false;

  // Find user's rank
  const userRank = leaderboard.findIndex(
    (entry) => entry.address.toLowerCase() === address?.toLowerCase()
  ) + 1;

  const userStats = address
    ? leaderboard.find((entry) => entry.address.toLowerCase() === address.toLowerCase())
    : null;

  // If connected user not in dummy data, add them with sample stats
  const displayUserStats = userStats || (address ? {
    address,
    totalPoints: 1250,
    wins: 8,
    losses: 5,
    totalBets: 13,
    rank: leaderboard.length + 1,
  } : null);

  const displayUserRank = userRank > 0 ? userRank : leaderboard.length + 1;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bg-card border border-brand-purple-800 mb-4">
            <span className="text-sm">🏆 Global Rankings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-purple-400 to-brand-pink-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compete with traders worldwide. Earn points for every bet - win or lose!
          </p>
        </motion.div>

        {/* User Stats Card */}
        {address && displayUserStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="bg-gradient-to-br from-brand-purple-500/20 to-brand-pink-500/20 border-2 border-brand-purple-500/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getRankBadge(displayUserRank)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Stats</h2>
                    <p className="text-sm text-gray-400">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Global Rank</div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${getRankColor(displayUserRank)} bg-clip-text text-transparent`}>
                    #{displayUserRank}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand-bg-card rounded-xl p-4 border border-brand-purple-900/30">
                  <div className="text-sm text-gray-400 mb-1">Total Points</div>
                  <div className="text-2xl font-bold text-brand-purple-300">
                    {formatPoints(displayUserStats.totalPoints)}
                  </div>
                </div>
                <div className="bg-brand-bg-card rounded-xl p-4 border border-brand-purple-900/30">
                  <div className="text-sm text-gray-400 mb-1">Total Bets</div>
                  <div className="text-2xl font-bold text-white">
                    {displayUserStats.totalBets}
                  </div>
                </div>
                <div className="bg-brand-bg-card rounded-xl p-4 border border-brand-purple-900/30">
                  <div className="text-sm text-gray-400 mb-1">Wins</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {displayUserStats.wins}
                  </div>
                </div>
                <div className="bg-brand-bg-card rounded-xl p-4 border border-brand-purple-900/30">
                  <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {displayUserStats.totalBets > 0
                      ? `${Math.round((displayUserStats.wins / displayUserStats.totalBets) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Points Earning Info */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-6">
            <h3 className="font-semibold text-brand-purple-300 mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>How Points Work:</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <div className="font-semibold text-emerald-400 mb-2">Win Points = 100 × Time × Amount</div>
                <ul className="space-y-1 text-xs">
                  <li>• 15s = 1x, 1m = 2x, 5m = 3x, 1h = 10x, 24h = 50x</li>
                  <li>• &lt;$10 = 1x, $10-50 = 1.5x, $50-100 = 2x, $100+ = 3x</li>
                  <li>• Example: $20 bet on 5m = <span className="text-white font-semibold">450 points</span></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-yellow-400 mb-2">Lose Points = Win Points ÷ 4</div>
                <ul className="space-y-1 text-xs">
                  <li>• You get 25% consolation points even when you lose!</li>
                  <li>• Example: Lost $20 on 5m = <span className="text-white font-semibold">112 points</span></li>
                  <li>• Keep betting to climb the leaderboard!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-brand-purple-600 to-brand-pink-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🏆</span>
                <span>Top Traders</span>
              </h2>
            </div>

            {!address ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to see the leaderboard</p>
                <ConnectButton />
              </div>
            ) : loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-500"></div>
                <p className="text-gray-400 mt-4">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
                <p className="text-gray-400">Be the first to earn points! Start betting now.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-purple-900/30">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.address.toLowerCase() === address?.toLowerCase();
                  const winRate = entry.totalBets > 0
                    ? Math.round((entry.wins / entry.totalBets) * 100)
                    : 0;

                  return (
                    <div
                      key={entry.address}
                      className={`p-4 transition-colors ${
                        isCurrentUser
                          ? 'bg-brand-purple-500/20 border-l-4 border-brand-purple-500'
                          : 'hover:bg-brand-bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Rank */}
                          <div className="w-16 text-center">
                            <div className="text-2xl mb-1">{getRankBadge(entry.rank)}</div>
                            <div className={`text-sm font-bold bg-gradient-to-r ${getRankColor(entry.rank)} bg-clip-text text-transparent`}>
                              #{entry.rank}
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-white truncate">
                                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs px-2 py-0.5 bg-brand-purple-500/30 text-brand-purple-300 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {entry.wins}W - {entry.losses}L • {winRate}% Win Rate
                            </div>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-brand-purple-300">
                            {formatPoints(entry.totalPoints)}
                          </div>
                          <div className="text-xs text-gray-400">{entry.totalBets} bets</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
