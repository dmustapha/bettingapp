import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Deployed on Base Sepolia - ERC-20 USDC version
const P2P_WAGERS_ADDRESS = (process.env.NEXT_PUBLIC_P2P_WAGERS_CONTRACT_ADDRESS ||
  '0x196A4bC0255D0703D8B8dCF9a8285B011DFcff7a') as `0x${string}`;

const P2P_WAGERS_ABI = [
  {
    inputs: [],
    name: 'wagerCounter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'wagers',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'address', name: 'userA', type: 'address' },
      { internalType: 'address', name: 'userB', type: 'address' },
      { internalType: 'uint256', name: 'stakeAmount', type: 'uint256' },
      { internalType: 'string', name: 'claim', type: 'string' },
      { internalType: 'address', name: 'resolver', type: 'address' },
      { internalType: 'bool', name: 'resolved', type: 'bool' },
      { internalType: 'address', name: 'winner', type: 'address' },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
      { internalType: 'uint256', name: 'expiryTime', type: 'uint256' },
      { internalType: 'bool', name: 'accepted', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'wagerId', type: 'uint256' }],
    name: 'getWager',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'userA', type: 'address' },
          { internalType: 'address', name: 'userB', type: 'address' },
          { internalType: 'uint256', name: 'stakeAmount', type: 'uint256' },
          { internalType: 'string', name: 'claim', type: 'string' },
          { internalType: 'address', name: 'resolver', type: 'address' },
          { internalType: 'bool', name: 'resolved', type: 'bool' },
          { internalType: 'address', name: 'winner', type: 'address' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'uint256', name: 'expiryTime', type: 'uint256' },
          { internalType: 'bool', name: 'accepted', type: 'bool' },
        ],
        internalType: 'struct P2PWagers.Wager',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'claim', type: 'string' },
      { internalType: 'address', name: 'resolver', type: 'address' },
      { internalType: 'uint256', name: 'expiryTime', type: 'uint256' },
      { internalType: 'uint256', name: 'stakeAmount', type: 'uint256' },
    ],
    name: 'createWager',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'wagerId', type: 'uint256' }],
    name: 'acceptWager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'wagerId', type: 'uint256' },
      { internalType: 'address', name: 'winner', type: 'address' },
    ],
    name: 'resolveWager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'wagerId', type: 'uint256' }],
    name: 'cancelWager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserStats',
    outputs: [
      { internalType: 'uint256', name: 'wins', type: 'uint256' },
      { internalType: 'uint256', name: 'losses', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Hook to get total number of wagers
export function useWagerCounter() {
  return useReadContract({
    address: P2P_WAGERS_ADDRESS,
    abi: P2P_WAGERS_ABI,
    functionName: 'wagerCounter',
  });
}

// Hook to get wager details
export function useWager(wagerId: number) {
  return useReadContract({
    address: P2P_WAGERS_ADDRESS,
    abi: P2P_WAGERS_ABI,
    functionName: 'getWager',
    args: [BigInt(wagerId)],
  });
}

// Hook to get user stats
export function useUserStats(userAddress?: string) {
  return useReadContract({
    address: P2P_WAGERS_ADDRESS,
    abi: P2P_WAGERS_ABI,
    functionName: 'getUserStats',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook to create a wager
export function useCreateWager() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createWager = (claim: string, resolver: string, expiryTime: number, stakeAmount: string) => {
    writeContract({
      address: P2P_WAGERS_ADDRESS,
      abi: P2P_WAGERS_ABI,
      functionName: 'createWager',
      args: [claim, resolver as `0x${string}`, BigInt(expiryTime), parseEther(stakeAmount)],
    });
  };

  return {
    createWager,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to accept a wager
export function useAcceptWager() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const acceptWager = (wagerId: number, stakeAmount: string) => {
    // Note: stakeAmount is not passed to the contract - it reads from the wager
    writeContract({
      address: P2P_WAGERS_ADDRESS,
      abi: P2P_WAGERS_ABI,
      functionName: 'acceptWager',
      args: [BigInt(wagerId)],
    });
  };

  return {
    acceptWager,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to resolve a wager
export function useResolveWager() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const resolveWager = (wagerId: number, winner: string) => {
    writeContract({
      address: P2P_WAGERS_ADDRESS,
      abi: P2P_WAGERS_ABI,
      functionName: 'resolveWager',
      args: [BigInt(wagerId), winner as `0x${string}`],
    });
  };

  return {
    resolveWager,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to cancel a wager
export function useCancelWager() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelWager = (wagerId: number) => {
    writeContract({
      address: P2P_WAGERS_ADDRESS,
      abi: P2P_WAGERS_ABI,
      functionName: 'cancelWager',
      args: [BigInt(wagerId)],
    });
  };

  return {
    cancelWager,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export { P2P_WAGERS_ADDRESS, P2P_WAGERS_ABI };
