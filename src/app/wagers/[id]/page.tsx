'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import {
  useWager,
  useAcceptWager,
  useResolveWager,
  useCancelWager,
} from '@/hooks/useP2PWagers';
import { formatEth, formatDate, shortenAddress } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';

export default function WagerDetailPage() {
  const params = useParams();
  const wagerId = Number(params.id);
  const { address, isConnected } = useAccount();

  const { data: wager, isLoading, refetch } = useWager(wagerId);
  const { acceptWager, isPending: isAccepting, isSuccess: acceptSuccess } = useAcceptWager();
  const { resolveWager, isPending: isResolving, isSuccess: resolveSuccess } = useResolveWager();
  const { cancelWager, isPending: isCanceling, isSuccess: cancelSuccess } = useCancelWager();

  const [selectedWinner, setSelectedWinner] = useState<string>('');

  useEffect(() => {
    if (acceptSuccess || resolveSuccess || cancelSuccess) {
      refetch();
    }
  }, [acceptSuccess, resolveSuccess, cancelSuccess, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!wager) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Wager not found</h2>
            <Link href="/wagers" className="text-blue-600 hover:text-blue-700">
              ← Back to Wagers
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isExpired = Number(wager.expiryTime) < Date.now() / 1000;
  const isUserA = address?.toLowerCase() === wager.userA.toLowerCase();
  const isUserB = address?.toLowerCase() === wager.userB.toLowerCase();
  const isResolver = address?.toLowerCase() === wager.resolver.toLowerCase();
  const hasUserB = wager.userB !== '0x0000000000000000000000000000000000000000';

  const canAccept = isConnected && !wager.accepted && !isExpired && !isUserA && !isResolver;
  const canCancel = isUserA && !wager.accepted && isExpired;
  const canResolve = isResolver && wager.accepted && !wager.resolved;

  const getStatus = () => {
    if (wager.resolved) return { label: 'Resolved', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
    if (!wager.accepted && isExpired) return { label: 'Expired', color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
    if (!wager.accepted) return { label: 'Open', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
    if (wager.accepted && !wager.resolved) return { label: 'Accepted - Awaiting Resolution', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
    return { label: 'Unknown', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
  };

  const status = getStatus();

  const handleAccept = () => {
    if (window.confirm(`Accept this wager with stake of ${formatEth(wager.stakeAmount)} ETH?`)) {
      acceptWager(wagerId, formatEth(wager.stakeAmount));
    }
  };

  const handleResolve = () => {
    if (!selectedWinner) {
      alert('Please select a winner');
      return;
    }
    if (window.confirm(`Resolve this wager in favor of ${shortenAddress(selectedWinner as `0x${string}`)}?`)) {
      resolveWager(wagerId, selectedWinner);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Cancel this wager and get your stake back?')) {
      cancelWager(wagerId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/wagers" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              ← Back to Wagers
            </Link>
          </div>

          {/* Wager Info */}
          <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                  {(isUserA || isUserB) && (
                    <span className="px-3 py-1 rounded text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      Your Wager
                    </span>
                  )}
                  {isResolver && (
                    <span className="px-3 py-1 rounded text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      You're the Resolver
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {wager.claim}
                </h1>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-400">
                  <span>Created {formatDate(wager.createdAt)}</span>
                  <span>•</span>
                  <span>Expires {formatDate(wager.expiryTime)}</span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Creator (User A)</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {shortenAddress(wager.userA)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Stake: {formatEth(wager.stakeAmount)} ETH
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                <div className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Opponent (User B)</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                  {hasUserB ? shortenAddress(wager.userB) : 'Waiting...'}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {hasUserB ? `Stake: ${formatEth(wager.stakeAmount)} ETH` : 'Not accepted yet'}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
                <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Resolver</div>
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {shortenAddress(wager.resolver)}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Trusted third party
                </div>
              </div>
            </div>

            {/* Pool Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <div className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
                  Total Pool
                </div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {formatEth(wager.stakeAmount * 2n)} ETH
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Winner takes all (minus 2% platform fee)
                </div>
              </div>
            </div>

            {wager.resolved && wager.winner !== '0x0000000000000000000000000000000000000000' && (
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                    Wager Resolved
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Winner: {shortenAddress(wager.winner)}
                  </div>
                  {(address?.toLowerCase() === wager.winner.toLowerCase()) && (
                    <div className="mt-3 text-lg font-semibold text-green-700 dark:text-green-300">
                      🎉 Congratulations! You won!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Accept Section */}
          {canAccept && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Accept This Wager</h2>
              <p className="text-gray-400 mb-6">
                To accept this wager, you must match the stake amount. If you win, you'll receive the full pool (minus 2% platform fee).
              </p>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? 'Accepting...' : `Accept Wager (Stake ${formatEth(wager.stakeAmount)} ETH)`}
              </button>
              {acceptSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Wager accepted successfully!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resolve Section (for resolvers) */}
          {canResolve && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Resolve Wager</h2>
              <p className="text-gray-400 mb-6">
                As the resolver, you decide who wins this wager. Choose carefully.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedWinner(wager.userA)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedWinner === wager.userA
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="text-lg font-bold text-blue-600">User A Wins</div>
                  <div className="text-sm text-gray-400">{shortenAddress(wager.userA)}</div>
                </button>
                <button
                  onClick={() => setSelectedWinner(wager.userB)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedWinner === wager.userB
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="text-lg font-bold text-green-600">User B Wins</div>
                  <div className="text-sm text-gray-400">{shortenAddress(wager.userB)}</div>
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isResolving || !selectedWinner}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResolving ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
              {resolveSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Wager resolved successfully!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cancel Section */}
          {canCancel && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Cancel Wager</h2>
              <p className="text-gray-400 mb-6">
                This wager has expired without being accepted. You can cancel it to get your stake back.
              </p>
              <button
                onClick={handleCancel}
                disabled={isCanceling}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? 'Canceling...' : 'Cancel Wager & Refund Stake'}
              </button>
              {cancelSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Wager canceled successfully! Your stake has been refunded.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
