import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// USDbC (Bridged USDC) on Base Sepolia
export const USDC_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS ||
  '0x036CbD53842c5426634e7929541eC2318f3dCF7e') as `0x${string}`;

// Standard ERC-20 ABI (approve and allowance functions)
const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Hook to check USDC allowance for a spender
 */
export function useTokenAllowance(ownerAddress?: string, spenderAddress?: string) {
  return useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress
      ? [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
      : undefined,
    query: {
      enabled: !!ownerAddress && !!spenderAddress,
    },
  });
}

/**
 * Hook to check USDC balance
 */
export function useTokenBalance(address?: string) {
  return useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook to get token decimals
 */
export function useTokenDecimals() {
  return useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });
}

/**
 * Hook to approve USDC spending
 */
export function useApproveToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spenderAddress: string, amount: string, decimals: number = 6) => {
    writeContract({
      address: USDC_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, parseUnits(amount, decimals)],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Helper to check if approval is needed
 */
export function needsApproval(
  currentAllowance: bigint | undefined,
  requiredAmount: bigint
): boolean {
  if (!currentAllowance) return true;
  return currentAllowance < requiredAmount;
}

export { USDC_TOKEN_ADDRESS as TOKEN_ADDRESS, ERC20_ABI };
