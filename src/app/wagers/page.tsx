'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useWagerCounter, useWager } from '@/hooks/useP2PWagers';
import { formatEth, formatDate, shortenAddress } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';

function WagerCard({ wagerId }: { wagerId: number }) {
  const { data: wager, isLoading } = useWager(wagerId);
  const { address } = useAccount();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!wager) return null;

  const isExpired = Number(wager.expiryTime) < Date.now() / 1000;
  const isUserA = address?.toLowerCase() === wager.userA.toLowerCase();
  const isUserB = address?.toLowerCase() === wager.userB.toLowerCase();
  const isResolver = address?.toLowerCase() === wager.resolver.toLowerCase();

  const getStatus = () => {
    if (wager.resolved) return { label: 'Resolved', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
    if (!wager.accepted && isExpired) return { label: 'Expired', color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
    if (!wager.accepted) return { label: 'Open', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
    if (wager.accepted && !wager.resolved) return { label: 'Accepted', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
    return { label: 'Unknown', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
  };

  const status = getStatus();

  return (
    <Link href={`/wagers/${wagerId}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                {status.label}
              </span>
              {(isUserA || isUserB) && (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Your Wager
                </span>
              )}
              {isResolver && (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  You're Resolver
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {wager.claim}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {!wager.resolved && !isExpired && (
                <span>Expires {formatDate(wager.expiryTime)}</span>
              )}
              {!wager.resolved && isExpired && (
                <span>Expired {formatDate(wager.expiryTime)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Creator</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {shortenAddress(wager.userA)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Opponent</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {wager.userB !== '0x0000000000000000000000000000000000000000'
                  ? shortenAddress(wager.userB)
                  : 'Waiting...'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Stake:</span>
            <span className="ml-2 font-bold text-gray-900 dark:text-gray-100">
              {formatEth(wager.stakeAmount)} ETH
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Pool:</span>
            <span className="ml-2 font-bold text-green-600 dark:text-green-400">
              {formatEth(wager.stakeAmount * 2n)} ETH
            </span>
          </div>
        </div>

        {wager.resolved && wager.winner !== '0x0000000000000000000000000000000000000000' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Winner:{' '}
              <span className="text-green-600 dark:text-green-400">
                {shortenAddress(wager.winner)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function WagersPage() {
  const { data: wagerCounter, isLoading } = useWagerCounter();
  const [filter, setFilter] = useState<'all' | 'open' | 'accepted' | 'resolved'>('all');

  const totalWagers = wagerCounter ? Number(wagerCounter) : 0;
  const wagerIds = Array.from({ length: totalWagers }, (_, i) => i);
  const filters = ['all', 'open', 'accepted', 'resolved'];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              P2P Wagers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLoading ? 'Loading...' : `${totalWagers} wagers total`}
            </p>
          </div>
          <Link
            href="/wagers/create"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Create Wager
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap capitalize transition-all ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : totalWagers === 0 ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              No Wagers Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to create a peer-to-peer wager!
            </p>
            <Link
              href="/wagers/create"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
            >
              Create First Wager
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wagerIds.reverse().map((id) => (
              <FilteredWagerCard key={id} wagerId={id} filter={filter} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Wrapper component to handle filtering
function FilteredWagerCard({ wagerId, filter }: { wagerId: number; filter: string }) {
  const { data: wager } = useWager(wagerId);

  if (!wager) return null;

  const isExpired = Number(wager.expiryTime) < Date.now() / 1000;

  // Filter logic
  if (filter === 'open' && (wager.accepted || isExpired)) return null;
  if (filter === 'accepted' && (!wager.accepted || wager.resolved)) return null;
  if (filter === 'resolved' && !wager.resolved) return null;

  return <WagerCard wagerId={wagerId} />;
}
