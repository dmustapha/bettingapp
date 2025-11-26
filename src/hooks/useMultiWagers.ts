import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Deployed on Base Sepolia - with ETH support
const MULTI_WAGERS_ADDRESS = (process.env.NEXT_PUBLIC_MULTI_PARTICIPANT_WAGERS_CONTRACT_ADDRESS ||
  '0x2A92E519c29fA441b71858398Ef0AB535eC14B7f') as `0x${string}`;

const MULTI_WAGERS_ABI = [
  {
    inputs: [],
    name: 'wagerCounter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'stakeAmount', type: 'uint256' },
          { internalType: 'string', name: 'claim', type: 'string' },
          { internalType: 'address', name: 'resolver', type: 'address' },
          { internalType: 'bool', name: 'resolved', type: 'bool' },
          { internalType: 'address', name: 'winner', type: 'address' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'uint256', name: 'expiryTime', type: 'uint256' },
          { internalType: 'bool', name: 'isPublic', type: 'bool' },
          { internalType: 'uint8', name: 'maxParticipants', type: 'uint8' },
          { internalType: 'uint8', name: 'currentParticipants', type: 'uint8' },
          { internalType: 'address[]', name: 'participants', type: 'address[]' },
          { internalType: 'bool', name: 'isEth', type: 'bool' },
        ],
        internalType: 'struct MultiParticipantWagers.Wager',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'wagerId', type: 'uint256' }],
    name: 'getParticipants',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'wagerId', type: 'uint256' },
      { internalType: 'address', name: 'participant', type: 'address' },
    ],
    name: 'hasParticipantJoined',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'claim', type: 'string' },
      { internalType: 'address', name: 'resolver', type: 'address' },
      { internalType: 'uint256', name: 'expiryTime', type: 'uint256' },
      { internalType: 'bool', name: 'isPublic', type: 'bool' },
      { internalType: 'uint8', name: 'maxParticipants', type: 'uint8' },
      { internalType: 'uint256', name: 'stakeAmount', type: 'uint256' },
    ],
    name: 'createWager',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'claim', type: 'string' },
      { internalType: 'address', name: 'resolver', type: 'address' },
      { internalType: 'uint256', name: 'expiryTime', type: 'uint256' },
      { internalType: 'bool', name: 'isPublic', type: 'bool' },
      { internalType: 'uint8', name: 'maxParticipants', type: 'uint8' },
    ],
    name: 'createWagerWithEth',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'wagerId', type: 'uint256' }],
    name: 'joinWager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'wagerId', type: 'uint256' }],
    name: 'joinWagerWithEth',
    outputs: [],
    stateMutability: 'payable',
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
    name: 'refundWager',
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
    address: MULTI_WAGERS_ADDRESS,
    abi: MULTI_WAGERS_ABI,
    functionName: 'wagerCounter',
  });
}

// Hook to get wager details
export function useWager(wagerId: number) {
  return useReadContract({
    address: MULTI_WAGERS_ADDRESS,
    abi: MULTI_WAGERS_ABI,
    functionName: 'getWager',
    args: [BigInt(wagerId)],
  });
}

// Hook to get participants
export function useParticipants(wagerId: number) {
  return useReadContract({
    address: MULTI_WAGERS_ADDRESS,
    abi: MULTI_WAGERS_ABI,
    functionName: 'getParticipants',
    args: [BigInt(wagerId)],
  });
}

// Hook to check if participant joined
export function useHasParticipantJoined(wagerId: number, participant?: string) {
  return useReadContract({
    address: MULTI_WAGERS_ADDRESS,
    abi: MULTI_WAGERS_ABI,
    functionName: 'hasParticipantJoined',
    args: participant ? [BigInt(wagerId), participant as `0x${string}`] : undefined,
    query: {
      enabled: !!participant,
    },
  });
}

// Hook to get user stats
export function useUserStats(userAddress?: string) {
  return useReadContract({
    address: MULTI_WAGERS_ADDRESS,
    abi: MULTI_WAGERS_ABI,
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

  const createWager = (
    claim: string,
    resolver: string,
    expiryTime: number,
    isPublic: boolean,
    maxParticipants: number,
    stakeAmount: string,
    paymentMethod: 'USDC' | 'ETH' = 'USDC'
  ) => {
    if (paymentMethod === 'ETH') {
      // ETH wager
      writeContract({
        address: MULTI_WAGERS_ADDRESS,
        abi: MULTI_WAGERS_ABI,
        functionName: 'createWagerWithEth',
        args: [claim, resolver as `0x${string}`, BigInt(expiryTime), isPublic, maxParticipants],
        value: parseEther(stakeAmount),
      });
    } else {
      // USDC wager - 6 decimals
      const amountInUnits = BigInt(Math.floor(parseFloat(stakeAmount) * 1e6));
      writeContract({
        address: MULTI_WAGERS_ADDRESS,
        abi: MULTI_WAGERS_ABI,
        functionName: 'createWager',
        args: [claim, resolver as `0x${string}`, BigInt(expiryTime), isPublic, maxParticipants, amountInUnits],
      });
    }
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

// Hook to join a wager
export function useJoinWager() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const joinWager = (wagerId: number, stakeAmount: string, paymentMethod: 'USDC' | 'ETH' = 'USDC') => {
    if (paymentMethod === 'ETH') {
      // ETH wager
      writeContract({
        address: MULTI_WAGERS_ADDRESS,
        abi: MULTI_WAGERS_ABI,
        functionName: 'joinWagerWithEth',
        args: [BigInt(wagerId)],
        value: parseEther(stakeAmount),
      });
    } else {
      // USDC wager
      writeContract({
        address: MULTI_WAGERS_ADDRESS,
        abi: MULTI_WAGERS_ABI,
        functionName: 'joinWager',
        args: [BigInt(wagerId)],
      });
    }
  };

  return {
    joinWager,
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
      address: MULTI_WAGERS_ADDRESS,
      abi: MULTI_WAGERS_ABI,
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

// Hook to refund a wager
export function useRefundWager() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const refundWager = (wagerId: number) => {
    writeContract({
      address: MULTI_WAGERS_ADDRESS,
      abi: MULTI_WAGERS_ABI,
      functionName: 'refundWager',
      args: [BigInt(wagerId)],
    });
  };

  return {
    refundWager,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export { MULTI_WAGERS_ADDRESS, MULTI_WAGERS_ABI };
