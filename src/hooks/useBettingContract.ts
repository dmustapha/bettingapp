import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BETTING_MARKET_ABI, BETTING_MARKET_ADDRESS } from '@/lib/contract';
import { parseEther } from 'viem';

// Hook to get total number of markets
export function useMarketCounter() {
  return useReadContract({
    address: BETTING_MARKET_ADDRESS,
    abi: BETTING_MARKET_ABI,
    functionName: 'marketCounter',
  });
}

// Hook to get market details
export function useMarket(marketId: number) {
  return useReadContract({
    address: BETTING_MARKET_ADDRESS,
    abi: BETTING_MARKET_ABI,
    functionName: 'getMarket',
    args: [BigInt(marketId)],
  });
}

// Hook to get market odds
export function useMarketOdds(marketId: number) {
  return useReadContract({
    address: BETTING_MARKET_ADDRESS,
    abi: BETTING_MARKET_ABI,
    functionName: 'getOdds',
    args: [BigInt(marketId)],
  });
}

// Hook to get user bets for a market
export function useUserBets(marketId: number, userAddress?: string) {
  return useReadContract({
    address: BETTING_MARKET_ADDRESS,
    abi: BETTING_MARKET_ABI,
    functionName: 'getUserBets',
    args: userAddress ? [BigInt(marketId), userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook to calculate potential payout
export function useCalculatePayout(marketId: number, betAmount: string, outcome: boolean) {
  return useReadContract({
    address: BETTING_MARKET_ADDRESS,
    abi: BETTING_MARKET_ABI,
    functionName: 'calculatePayout',
    args: [BigInt(marketId), parseEther(betAmount || '0'), outcome],
  });
}

// Hook to get platform fee
export function usePlatformFee() {
  return useReadContract({
    address: BETTING_MARKET_ADDRESS,
    abi: BETTING_MARKET_ABI,
    functionName: 'platformFeePercent',
  });
}

// Hook to create a market
export function useCreateMarket() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = (description: string, category: string, endTime: number, minBet: string) => {
    writeContract({
      address: BETTING_MARKET_ADDRESS,
      abi: BETTING_MARKET_ABI,
      functionName: 'createMarket',
      args: [description, category, BigInt(endTime), parseEther(minBet)],
    });
  };

  return {
    createMarket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to place a bet
export function usePlaceBet() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placeBet = (marketId: number, outcome: boolean, amount: string) => {
    writeContract({
      address: BETTING_MARKET_ADDRESS,
      abi: BETTING_MARKET_ABI,
      functionName: 'placeBet',
      args: [BigInt(marketId), outcome],
      value: parseEther(amount),
    });
  };

  return {
    placeBet,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to resolve a market
export function useResolveMarket() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const resolveMarket = (marketId: number, winningOutcome: boolean) => {
    writeContract({
      address: BETTING_MARKET_ADDRESS,
      abi: BETTING_MARKET_ABI,
      functionName: 'resolveMarket',
      args: [BigInt(marketId), winningOutcome],
    });
  };

  return {
    resolveMarket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to claim winnings
export function useClaimWinnings() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimWinnings = (marketId: number) => {
    writeContract({
      address: BETTING_MARKET_ADDRESS,
      abi: BETTING_MARKET_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(marketId)],
    });
  };

  return {
    claimWinnings,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
