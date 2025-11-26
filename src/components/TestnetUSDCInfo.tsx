'use client';

import { useState } from 'react';
import { useTokenBalance } from '@/hooks/useTokenApproval';
import { useAccount } from 'wagmi';

export function TestnetUSDCInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { data: balance } = useTokenBalance(address);

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return (Number(balance) / 1e6).toFixed(2);
  };

  return (
    <div className="mb-6">
      {/* Balance Display */}
      {address && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Your USDC Balance</div>
              <div className="text-2xl font-bold text-white">{formatBalance(balance)} USDC</div>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors"
            >
              {Number(balance || 0) === 0 ? 'Get Testnet USDC' : 'Need More?'}
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {isOpen && (
        <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-white">Get Testnet USDC (USDbC)</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <div className="font-semibold text-white mb-2">📍 Contract Address:</div>
              <code className="block bg-brand-bg-secondary p-3 rounded-lg text-xs break-all border border-brand-purple-900/30 text-purple-300">
                0x036CbD53842c5426634e7929541eC2318f3dCF7e
              </code>
            </div>

            <div>
              <div className="font-semibold text-white mb-2">💰 How to Get Testnet USDC:</div>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  <span className="font-medium text-white">Get Base Sepolia ETH</span> from a faucet:
                  <ul className="list-disc list-inside ml-6 mt-1 text-gray-400">
                    <li><a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Alchemy Base Sepolia Faucet</a></li>
                    <li><a href="https://docs.base.org/docs/tools/network-faucets" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Base Official Faucets</a></li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-white">Import USDbC token</span> to your wallet:
                  <ul className="list-disc list-inside ml-6 mt-1 text-gray-400">
                    <li>Open MetaMask or your wallet</li>
                    <li>Click "Import tokens"</li>
                    <li>Paste the contract address above</li>
                    <li>Symbol: USDbC, Decimals: 6</li>
                  </ul>
                </li>
                <li className="text-orange-300 font-medium">
                  ⚠️ Note: You may need to bridge or swap testnet ETH for USDbC on a Base Sepolia DEX, or contact the project team for test tokens.
                </li>
              </ol>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="font-semibold text-purple-300 mb-1">💡 Pro Tip</div>
              <div className="text-xs text-purple-200">
                This is a testnet environment. All tokens have no real value and are only for testing purposes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
