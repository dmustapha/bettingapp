'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import {
  useTokenAllowance,
  useApproveToken,
  needsApproval,
  USDC_TOKEN_ADDRESS,
} from '@/hooks/useTokenApproval';

interface TokenApprovalButtonProps {
  spenderAddress: string;
  amount: string; // Amount in token units (e.g., "10" for 10 USDC)
  decimals?: number; // Token decimals (default 6 for USDC)
  onApproved?: () => void;
  onPlaceBet: () => void;
  disabled?: boolean;
  isPending?: boolean;
  buttonText?: string;
  className?: string;
}

export function TokenApprovalButton({
  spenderAddress,
  amount,
  decimals = 6,
  onApproved,
  onPlaceBet,
  disabled = false,
  isPending = false,
  buttonText = 'Place Bet',
  className = '',
}: TokenApprovalButtonProps) {
  const { address: userAddress } = useAccount();
  const [isApprovalComplete, setIsApprovalComplete] = useState(false);

  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useTokenAllowance(
    userAddress,
    spenderAddress
  );

  // Approve hook
  const {
    approve,
    isPending: isApproving,
    isConfirming: isConfirmingApproval,
    isSuccess: isApprovalSuccess,
  } = useApproveToken();

  // Calculate required amount
  const requiredAmount = amount ? parseUnits(amount, decimals) : BigInt(0);

  // Check if approval is needed
  const requiresApproval = needsApproval(currentAllowance, requiredAmount);

  // Handle successful approval
  useEffect(() => {
    if (isApprovalSuccess && !isApprovalComplete) {
      setIsApprovalComplete(true);
      refetchAllowance();
      if (onApproved) {
        onApproved();
      }
    }
  }, [isApprovalSuccess, isApprovalComplete, refetchAllowance, onApproved]);

  // Reset approval state when amount changes
  useEffect(() => {
    setIsApprovalComplete(false);
  }, [amount, spenderAddress]);

  const handleApprove = () => {
    if (!amount || disabled) return;
    approve(spenderAddress, amount, decimals);
  };

  const handlePlaceBet = () => {
    if (disabled || isPending) return;
    onPlaceBet();
  };

  // Show approve button if approval is needed
  if (requiresApproval && !isApprovalComplete) {
    return (
      <div className="space-y-3">
        {/* Info message */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium mb-1">Approve USDC First</div>
              <div className="text-xs text-blue-200/80">
                You need to approve the contract to spend your USDC tokens. This is a one-time action.
              </div>
            </div>
          </div>
        </div>

        {/* Approve button */}
        <button
          onClick={handleApprove}
          disabled={isApproving || isConfirmingApproval || disabled}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
            isApproving || isConfirmingApproval
              ? 'bg-brand-purple-500/50 cursor-not-allowed'
              : 'bg-brand-purple-600 hover:bg-brand-purple-700 hover:shadow-glow-purple'
          } text-white ${className}`}
        >
          {isApproving && 'Waiting for wallet...'}
          {isConfirmingApproval && 'Confirming approval...'}
          {!isApproving && !isConfirmingApproval && `Approve ${amount} USDC`}
        </button>
      </div>
    );
  }

  // Show place bet button once approved or if approval not needed
  return (
    <button
      onClick={handlePlaceBet}
      disabled={disabled || isPending}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
        disabled || isPending
          ? 'bg-brand-purple-500/50 cursor-not-allowed'
          : 'bg-brand-purple-600 hover:bg-brand-purple-700 hover:shadow-glow-purple'
      } text-white ${className}`}
    >
      {isPending ? 'Processing...' : buttonText}
    </button>
  );
}
