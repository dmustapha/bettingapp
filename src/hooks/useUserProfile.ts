'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { USER_PROFILE_ABI, USER_PROFILE_CONTRACT_ADDRESS } from '@/contracts/userProfileABI';

export interface UserProfile {
  username: string;
  totalWagers: bigint;
  totalWon: bigint;
  totalLost: bigint;
  lastActive: bigint;
  exists: boolean;
  winRate: number; // Percentage (0-100)
}

/**
 * Hook to fetch and manage user profile data
 */
export function useUserProfile() {
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Read user profile from contract
  const { data: profileData, isError, isLoading: isProfileLoading, refetch } = useReadContract({
    address: USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
    abi: USER_PROFILE_ABI,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read win rate
  const { data: winRateData } = useReadContract({
    address: USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
    abi: USER_PROFILE_ABI,
    functionName: 'getWinRate',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Update profile when data changes
  useEffect(() => {
    if (profileData && Array.isArray(profileData)) {
      const [username, totalWagers, totalWon, totalLost, lastActive, exists] = profileData;
      const winRate = winRateData ? Number(winRateData) / 100 : 0; // Convert basis points to percentage

      setProfile({
        username: username as string,
        totalWagers: totalWagers as bigint,
        totalWon: totalWon as bigint,
        totalLost: totalLost as bigint,
        lastActive: lastActive as bigint,
        exists: exists as boolean,
        winRate,
      });
    } else if (isConnected && !isProfileLoading && !isError) {
      // User connected but no profile exists
      setProfile({
        username: '',
        totalWagers: BigInt(0),
        totalWon: BigInt(0),
        totalLost: BigInt(0),
        lastActive: BigInt(0),
        exists: false,
        winRate: 0,
      });
    }
  }, [profileData, winRateData, isConnected, isProfileLoading, isError]);

  // Clear profile when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setProfile(null);
    }
  }, [isConnected]);

  return {
    profile,
    isLoading: isProfileLoading,
    isError,
    refetch,
    hasProfile: profile?.exists || false,
  };
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateProfile = async (username: string) => {
    try {
      const result = await writeContractAsync({
        address: USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
        abi: USER_PROFILE_ABI,
        functionName: 'setProfile',
        args: [username],
      });
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    updateProfile,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

/**
 * Hook to record wager results
 */
export function useRecordWager() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const recordWager = async (amount: bigint, won: boolean) => {
    try {
      const result = await writeContractAsync({
        address: USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
        abi: USER_PROFILE_ABI,
        functionName: 'recordWager',
        args: [amount, won],
      });
      return result;
    } catch (error) {
      console.error('Error recording wager:', error);
      throw error;
    }
  };

  return {
    recordWager,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
