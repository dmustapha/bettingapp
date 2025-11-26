/**
 * Points & Rewards System
 * Gamification layer for VibeCoding betting platform
 */

export interface BetPoints {
  predictionId: number;
  userAddress: string;
  betAmount: number; // in USD value
  timeframeSeconds: number;
  direction: 'up' | 'down';
  won: boolean;
  pointsEarned: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  address: string;
  totalPoints: number;
  wins: number;
  losses: number;
  totalBets: number;
  rank?: number;
}

/**
 * Calculate timeframe multiplier
 */
export function getTimeframeMultiplier(timeframeSeconds: number): number {
  if (timeframeSeconds <= 15) return 1;
  if (timeframeSeconds <= 30) return 1.5;
  if (timeframeSeconds <= 60) return 2;
  if (timeframeSeconds <= 300) return 3;      // 5 min
  if (timeframeSeconds <= 900) return 5;      // 15 min
  if (timeframeSeconds <= 3600) return 10;    // 1 hour
  if (timeframeSeconds <= 14400) return 20;   // 4 hours
  if (timeframeSeconds <= 86400) return 50;   // 24 hours
  return 100; // 1 day+
}

/**
 * Calculate amount tier multiplier (based on USD value)
 */
export function getAmountTierMultiplier(amountUSD: number): number {
  if (amountUSD < 10) return 1;
  if (amountUSD < 50) return 1.5;
  if (amountUSD < 100) return 2;
  return 3;
}

/**
 * Calculate points for a bet outcome
 */
export function calculatePoints(
  betAmountUSD: number,
  timeframeSeconds: number,
  won: boolean
): number {
  const basePoints = 100;
  const timeframeBonus = getTimeframeMultiplier(timeframeSeconds);
  const amountTier = getAmountTierMultiplier(betAmountUSD);

  const winPoints = Math.floor(basePoints * timeframeBonus * amountTier);

  // Consolation points for losing (25% of winning points)
  return won ? winPoints : Math.floor(winPoints / 4);
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

/**
 * Get rank badge emoji
 */
export function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🏆';
  if (rank <= 50) return '⭐';
  return '🎯';
}

/**
 * Get rank color
 */
export function getRankColor(rank: number): string {
  if (rank === 1) return 'from-yellow-400 to-yellow-600';
  if (rank === 2) return 'from-gray-300 to-gray-500';
  if (rank === 3) return 'from-orange-400 to-orange-600';
  if (rank <= 10) return 'from-purple-400 to-purple-600';
  return 'from-blue-400 to-blue-600';
}
