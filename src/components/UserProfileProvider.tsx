'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { useAccount } from 'wagmi';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  hasProfile: boolean;
  refetch: () => void;
}

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  isLoading: false,
  hasProfile: false,
  refetch: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { profile, isLoading, hasProfile, refetch } = useUserProfile();

  // Auto-load profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet connected:', address);
      console.log('Loading user profile from blockchain...');
      refetch();

      if (profile) {
        console.log('User profile loaded:', {
          username: profile.username || 'Anonymous',
          totalWagers: profile.totalWagers.toString(),
          winRate: `${profile.winRate}%`,
          lastActive: new Date(Number(profile.lastActive) * 1000).toLocaleString(),
        });
      }
    }
  }, [isConnected, address, refetch, profile]);

  // Log when user disconnects
  useEffect(() => {
    if (!isConnected) {
      console.log('Wallet disconnected. User profile cleared.');
    }
  }, [isConnected]);

  return (
    <UserProfileContext.Provider value={{ profile, isLoading, hasProfile, refetch }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfileContext must be used within UserProfileProvider');
  }
  return context;
}
