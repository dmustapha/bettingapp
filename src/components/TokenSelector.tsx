'use client';

import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { TokenInfo, getAllTokens } from '@/config/tokens.base';

interface TokenSelectorProps {
  selectedToken: TokenInfo;
  onTokenChange: (token: TokenInfo) => void;
  chainId?: number;
}

export function TokenSelector({ selectedToken, onTokenChange, chainId = 84532 }: TokenSelectorProps) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  // CRITICAL: Base Sepolia only has ETH/USD Chainlink price feed
  // Filter to only ETH on testnet (84532), all tokens on mainnet (8453)
  const allTokens = getAllTokens(chainId);
  const tokens = chainId === 84532
    ? allTokens.filter(token => token.symbol === 'ETH')
    : allTokens;

  return (
    <div className="relative">
      <label className="block text-sm font-semibold mb-2 text-gray-300">
        Select Token * {chainId === 84532 && <span className="text-xs text-yellow-400">(Only ETH on Sepolia)</span>}
      </label>

      {/* Selected Token Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white hover:border-brand-purple-500 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedToken.icon}</span>
          <div className="text-left">
            <div className="font-semibold">{selectedToken.symbol}</div>
            <div className="text-xs text-gray-400">{selectedToken.name}</div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Token Balance */}
      {address && selectedToken.address === 'native' && (
        <TokenBalance address={address} token={selectedToken} />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-brand-bg-card border border-brand-purple-900/50 rounded-xl shadow-xl overflow-hidden">
          {tokens.map((token) => (
            <button
              key={token.symbol}
              type="button"
              onClick={() => {
                if (!token.comingSoon) {
                  onTokenChange(token);
                  setIsOpen(false);
                }
              }}
              disabled={token.comingSoon}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-brand-bg-secondary transition-all ${
                token.comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${selectedToken.symbol === token.symbol ? 'bg-brand-purple-500/10' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{token.icon}</span>
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    {token.symbol}
                    {token.comingSoon && (
                      <span className="text-xs px-2 py-0.5 bg-brand-warning/20 text-brand-warning rounded-full border border-brand-warning/30">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
              {selectedToken.symbol === token.symbol && !token.comingSoon && (
                <svg className="w-5 h-5 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedToken.comingSoon && (
        <p className="text-xs text-brand-warning mt-1 flex items-center gap-1">
          <span>⚠️</span>
          <span>Multi-token support coming soon. ETH is currently available.</span>
        </p>
      )}
    </div>
  );
}

// Token Balance Display Component
function TokenBalance({ address, token }: { address: `0x${string}`; token: TokenInfo }) {
  const { data: balance } = useBalance({
    address,
  });

  if (!balance) return null;

  return (
    <div className="mt-2 text-sm text-gray-400 flex items-center justify-between">
      <span>Your Balance:</span>
      <span className="font-semibold text-white">
        {parseFloat(formatUnits(balance.value, token.decimals)).toFixed(4)} {token.symbol}
      </span>
    </div>
  );
}

// Compact Token Toggle (Alternative design)
export function TokenToggle({ selectedToken, onTokenChange, chainId = 84532 }: TokenSelectorProps) {
  // CRITICAL: Base Sepolia only has ETH/USD Chainlink price feed
  // Filter to only ETH on testnet (84532), all tokens on mainnet (8453)
  const allTokens = getAllTokens(chainId);
  const tokens = chainId === 84532
    ? allTokens.filter(token => token.symbol === 'ETH')
    : allTokens;

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-300">
        Select Token * {chainId === 84532 && <span className="text-xs text-yellow-400">(Only ETH on Sepolia)</span>}
      </label>
      <div className="flex gap-2 flex-wrap">
        {tokens.map((token) => (
          <button
            key={token.symbol}
            type="button"
            onClick={() => !token.comingSoon && onTokenChange(token)}
            disabled={token.comingSoon}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedToken.symbol === token.symbol
                ? 'bg-gradient-primary text-white shadow-glow-primary'
                : token.comingSoon
                ? 'bg-brand-bg-secondary/50 border border-brand-purple-900/30 text-gray-500 cursor-not-allowed'
                : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-white hover:border-brand-purple-500'
            }`}
          >
            <span className="text-xl">{token.icon}</span>
            <span>{token.symbol}</span>
            {token.comingSoon && (
              <span className="text-xs px-1.5 py-0.5 bg-brand-warning/20 text-brand-warning rounded">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
