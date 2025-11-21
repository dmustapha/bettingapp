'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useMarketCounter, useMarket, useUserBets } from '@/hooks/useBettingContract';
import { isContractDeployed } from '@/lib/contract';
import { formatEth, formatDate, shortenAddress } from '@/lib/utils';

function UserMarketBets({ marketId, userAddress }: { marketId: number; userAddress: string }) {
  const { data: market } = useMarket(marketId);
  const { data: userBets } = useUserBets(marketId, userAddress);

  if (!userBets || userBets.length === 0) return null;

  const totalBet = userBets.reduce((sum, bet) => sum + bet.amount, 0n);
  const hasWinningBets = market?.resolved && userBets.some(bet => bet.outcome === market.winningOutcome && !bet.claimed);
  const hasClaimedBets = userBets.some(bet => bet.claimed);

  return (
    <Link href={`/markets/${marketId}`}>
      <div className="bg-brand-bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-brand-purple-500">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {market?.description || `Market #${marketId}`}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              market?.resolved
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            }`}>
              {market?.resolved ? 'Resolved' : 'Active'}
            </span>
            {market?.resolved && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                market.winningOutcome
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {market.winningOutcome ? 'YES' : 'NO'} Won
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {userBets.map((bet, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  bet.outcome
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {bet.outcome ? 'YES' : 'NO'}
                </span>
                <span className="text-white font-semibold">
                  {formatEth(bet.amount)} ETH
                </span>
              </div>
              <span className="text-gray-400 text-xs">
                {formatDate(bet.timestamp)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-purple-900/30 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Bet:</span>
            <span className="text-lg font-bold text-white">
              {formatEth(totalBet)} ETH
            </span>
          </div>

          {hasWinningBets && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
                💰 Winnings Available to Claim
              </span>
            </div>
          )}

          {hasClaimedBets && !hasWinningBets && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                ✓ Claimed
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MyBetsPage() {
  const { address, isConnected } = useAccount();
  const { data: marketCounter } = useMarketCounter();

  if (!isContractDeployed()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="border-b border-brand-purple-900/30 bg-brand-bg-primary/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VibeCoding Betting
              </Link>
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-brand-bg-card rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Smart Contract Not Deployed
            </h2>
            <p className="text-gray-400 mb-6">
              The betting smart contract has not been deployed yet. Please deploy the contract first.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="border-b border-brand-purple-900/30 bg-brand-bg-primary/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VibeCoding Betting
              </Link>
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-brand-bg-card rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to view your betting history
            </p>
            <ConnectButton />
          </div>
        </main>
      </div>
    );
  }

  const totalMarkets = marketCounter ? Number(marketCounter) : 0;
  const marketIds = Array.from({ length: totalMarkets }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b border-brand-purple-900/30 bg-brand-bg-primary/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              VibeCoding Betting
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Bets
              </h1>
              <p className="text-gray-400">
                Wallet: {shortenAddress(address || '')}
              </p>
            </div>
            <Link
              href="/markets"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              Browse Markets
            </Link>
          </div>

          <div className="space-y-6">
            {marketIds.length === 0 ? (
              <div className="bg-brand-bg-card rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold mb-4 text-white">
                  No Markets Available
                </h2>
                <p className="text-gray-400 mb-6">
                  There are no markets yet. Be the first to create one!
                </p>
                <Link
                  href="/create"
                  className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
                >
                  Create First Market
                </Link>
              </div>
            ) : (
              <>
                {marketIds.map((id) => (
                  <UserMarketBets key={id} marketId={id} userAddress={address} />
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
