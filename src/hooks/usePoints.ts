'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import {
  BetPoints,
  LeaderboardEntry,
  calculatePoints,
} from '@/lib/points';

const STORAGE_KEY = 'vibecoding_points';
const LEADERBOARD_KEY = 'vibecoding_leaderboard';

/**
 * Hook to track and manage user points
 */
export function usePoints() {
  const { address } = useAccount();
  const [userPoints, setUserPoints] = useState<BetPoints[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load user points from localStorage
  useEffect(() => {
    if (!address) {
      setUserPoints([]);
      setTotalPoints(0);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allPoints: Record<string, BetPoints[]> = JSON.parse(stored);
        const userBets = allPoints[address.toLowerCase()] || [];
        setUserPoints(userBets);
        setTotalPoints(userBets.reduce((sum, bet) => sum + bet.pointsEarned, 0));
      }
    } catch (error) {
      console.error('Failed to load points:', error);
    }
    setLoading(false);
  }, [address]);

  /**
   * Add points for a bet outcome
   */
  const addBetPoints = useCallback(
    (
      predictionId: number,
      betAmountUSD: number,
      timeframeSeconds: number,
      direction: 'up' | 'down',
      won: boolean
    ) => {
      if (!address) return;

      const pointsEarned = calculatePoints(betAmountUSD, timeframeSeconds, won);

      const newBet: BetPoints = {
        predictionId,
        userAddress: address.toLowerCase(),
        betAmount: betAmountUSD,
        timeframeSeconds,
        direction,
        won,
        pointsEarned,
        timestamp: Date.now(),
      };

      try {
        // Load all points
        const stored = localStorage.getItem(STORAGE_KEY);
        const allPoints: Record<string, BetPoints[]> = stored ? JSON.parse(stored) : {};

        // Add new bet to user's points
        const userKey = address.toLowerCase();
        if (!allPoints[userKey]) {
          allPoints[userKey] = [];
        }
        allPoints[userKey].push(newBet);

        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPoints));

        // Update state
        setUserPoints(allPoints[userKey]);
        setTotalPoints(allPoints[userKey].reduce((sum, bet) => sum + bet.pointsEarned, 0));

        // Update leaderboard
        updateLeaderboard(userKey, pointsEarned, won);
      } catch (error) {
        console.error('Failed to save points:', error);
      }
    },
    [address]
  );

  /**
   * Update leaderboard with new points
   */
  const updateLeaderboard = (userAddress: string, points: number, won: boolean) => {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      const leaderboard: Record<string, Omit<LeaderboardEntry, 'rank'>> = stored ? JSON.parse(stored) : {};

      if (!leaderboard[userAddress]) {
        leaderboard[userAddress] = {
          address: userAddress,
          totalPoints: 0,
          wins: 0,
          losses: 0,
          totalBets: 0,
        };
      }

      leaderboard[userAddress].totalPoints += points;
      leaderboard[userAddress].totalBets += 1;
      if (won) {
        leaderboard[userAddress].wins += 1;
      } else {
        leaderboard[userAddress].losses += 1;
      }

      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  };

  return {
    userPoints,
    totalPoints,
    loading,
    addBetPoints,
  };
}

/**
 * Hook to get leaderboard data
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      if (stored) {
        const data: Record<string, Omit<LeaderboardEntry, 'rank'>> = JSON.parse(stored);

        // Convert to array and sort by total points
        const sorted = Object.values(data)
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setLeaderboard(sorted);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
    setLoading(false);
  }, []);

  const refetch = useCallback(() => {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      if (stored) {
        const data: Record<string, Omit<LeaderboardEntry, 'rank'>> = JSON.parse(stored);

        const sorted = Object.values(data)
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setLeaderboard(sorted);
      }
    } catch (error) {
      console.error('Failed to refetch leaderboard:', error);
    }
  }, []);

  return {
    leaderboard,
    loading,
    refetch,
  };
}
