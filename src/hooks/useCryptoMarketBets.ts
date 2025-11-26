import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import TOKENS, { getFeaturedTokens, getAllTokenSymbols } from '@/config/tokens.config';

// Deployed on Base Sepolia - ERC-20 USDC + ETH version with flexible timeframes
// Original contract with user's bets
const CRYPTO_MARKET_BETS_ADDRESS = (process.env.NEXT_PUBLIC_CRYPTO_MARKET_BETS_CONTRACT_ADDRESS ||
  '0x6BA9aA2B3582faB1CeB7923c5D20A0531F722161') as `0x${string}`;

const CRYPTO_MARKET_BETS_ABI = [
  {
    inputs: [],
    name: 'predictionCounter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'predictionId', type: 'uint256' }],
    name: 'getPrediction',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'tokenSymbol', type: 'string' },
          { internalType: 'address', name: 'priceFeed', type: 'address' },
          { internalType: 'uint256', name: 'timeframe', type: 'uint256' },
          { internalType: 'int256', name: 'startPrice', type: 'int256' },
          { internalType: 'int256', name: 'endPrice', type: 'int256' },
          { internalType: 'uint256', name: 'totalUpBets', type: 'uint256' },
          { internalType: 'uint256', name: 'totalDownBets', type: 'uint256' },
          { internalType: 'uint256', name: 'totalUpBetsEth', type: 'uint256' },
          { internalType: 'uint256', name: 'totalDownBetsEth', type: 'uint256' },
          { internalType: 'bool', name: 'resolved', type: 'bool' },
          { internalType: 'bool', name: 'priceWentUp', type: 'bool' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
        ],
        internalType: 'struct CryptoMarketBets.Prediction',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'tokenSymbol', type: 'string' }],
    name: 'getCurrentPrice',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'predictionId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'getUserBets',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'predictionId', type: 'uint256' },
          { internalType: 'address', name: 'bettor', type: 'address' },
          { internalType: 'bool', name: 'direction', type: 'bool' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'bool', name: 'claimed', type: 'bool' },
          { internalType: 'bool', name: 'isEth', type: 'bool' },
        ],
        internalType: 'struct CryptoMarketBets.CryptoBet[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'predictionId', type: 'uint256' }],
    name: 'getOdds',
    outputs: [
      { internalType: 'uint256', name: 'upOdds', type: 'uint256' },
      { internalType: 'uint256', name: 'downOdds', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'tokenSymbol', type: 'string' },
      { internalType: 'uint256', name: 'timeframe', type: 'uint256' },
    ],
    name: 'createPrediction',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'predictionId', type: 'uint256' },
      { internalType: 'bool', name: 'direction', type: 'bool' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'placePrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'predictionId', type: 'uint256' },
      { internalType: 'bool', name: 'direction', type: 'bool' },
    ],
    name: 'placePredictionWithEth',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'predictionId', type: 'uint256' }],
    name: 'autoResolvePrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'predictionId', type: 'uint256' }],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'predictionId', type: 'uint256' },
      { internalType: 'uint256', name: 'betAmount', type: 'uint256' },
      { internalType: 'bool', name: 'direction', type: 'bool' },
    ],
    name: 'calculatePayout',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Hook to get total number of predictions
export function usePredictionCounter() {
  return useReadContract({
    address: CRYPTO_MARKET_BETS_ADDRESS,
    abi: CRYPTO_MARKET_BETS_ABI,
    functionName: 'predictionCounter',
  });
}

// Hook to get prediction details
export function usePrediction(predictionId: number) {
  return useReadContract({
    address: CRYPTO_MARKET_BETS_ADDRESS,
    abi: CRYPTO_MARKET_BETS_ABI,
    functionName: 'getPrediction',
    args: [BigInt(predictionId)],
  });
}

// Hook to get current price for a token
export function useCurrentPrice(tokenSymbol: string) {
  return useReadContract({
    address: CRYPTO_MARKET_BETS_ADDRESS,
    abi: CRYPTO_MARKET_BETS_ABI,
    functionName: 'getCurrentPrice',
    args: [tokenSymbol],
    chainId: 84532, // Base Sepolia
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: 3,
    },
  });
}

// Hook to get user bets for a prediction
export function useUserPredictionBets(predictionId: number, userAddress?: string) {
  return useReadContract({
    address: CRYPTO_MARKET_BETS_ADDRESS,
    abi: CRYPTO_MARKET_BETS_ABI,
    functionName: 'getUserBets',
    args: userAddress ? [BigInt(predictionId), userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook to get odds for a prediction
export function usePredictionOdds(predictionId: number) {
  return useReadContract({
    address: CRYPTO_MARKET_BETS_ADDRESS,
    abi: CRYPTO_MARKET_BETS_ABI,
    functionName: 'getOdds',
    args: [BigInt(predictionId)],
  });
}

// Hook to create a prediction
export function useCreatePrediction() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPrediction = (tokenSymbol: string, timeframe: number) => {
    writeContract({
      address: CRYPTO_MARKET_BETS_ADDRESS,
      abi: CRYPTO_MARKET_BETS_ABI,
      functionName: 'createPrediction',
      args: [tokenSymbol, BigInt(timeframe)],
    });
  };

  return {
    createPrediction,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to place a prediction bet (USDC or ETH)
export function usePlacePredictionBet() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placePredictionBet = (predictionId: number, direction: boolean, amount: string, paymentMethod: 'USDC' | 'ETH' = 'USDC') => {
    if (paymentMethod === 'ETH') {
      // ETH bet - send value with transaction
      writeContract({
        address: CRYPTO_MARKET_BETS_ADDRESS,
        abi: CRYPTO_MARKET_BETS_ABI,
        functionName: 'placePredictionWithEth',
        args: [BigInt(predictionId), direction],
        value: parseEther(amount),
      });
    } else {
      // USDC bet - 6 decimals
      const amountInUnits = BigInt(Math.floor(parseFloat(amount) * 1e6));
      writeContract({
        address: CRYPTO_MARKET_BETS_ADDRESS,
        abi: CRYPTO_MARKET_BETS_ABI,
        functionName: 'placePrediction',
        args: [BigInt(predictionId), direction, amountInUnits],
      });
    }
  };

  return {
    placePredictionBet,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to auto-resolve a prediction
export function useAutoResolvePrediction() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const autoResolvePrediction = (predictionId: number) => {
    writeContract({
      address: CRYPTO_MARKET_BETS_ADDRESS,
      abi: CRYPTO_MARKET_BETS_ABI,
      functionName: 'autoResolvePrediction',
      args: [BigInt(predictionId)],
    });
  };

  return {
    autoResolvePrediction,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to claim winnings from a prediction
export function useClaimPredictionWinnings() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPredictionWinnings = (predictionId: number) => {
    writeContract({
      address: CRYPTO_MARKET_BETS_ADDRESS,
      abi: CRYPTO_MARKET_BETS_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(predictionId)],
    });
  };

  return {
    claimPredictionWinnings,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Calculate potential payout
export function useCalculatePredictionPayout(predictionId: number, betAmount: string, direction: boolean) {
  return useReadContract({
    address: CRYPTO_MARKET_BETS_ADDRESS,
    abi: CRYPTO_MARKET_BETS_ABI,
    functionName: 'calculatePayout',
    args: [BigInt(predictionId), parseEther(betAmount || '0'), direction],
  });
}

// All supported tokens from configuration
export const SUPPORTED_TOKENS = Object.values(TOKENS);

// Featured tokens for quick access
export const FEATURED_TOKENS = getFeaturedTokens();

// All token symbols
export const ALL_TOKEN_SYMBOLS = getAllTokenSymbols();

// Timeframes in seconds
export const TIMEFRAMES = {
  '1h': 3600,
  '4h': 14400,
  '24h': 86400,
  '7d': 604800,
};

export { CRYPTO_MARKET_BETS_ADDRESS, CRYPTO_MARKET_BETS_ABI };
