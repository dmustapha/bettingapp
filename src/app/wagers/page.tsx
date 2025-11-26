'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useWagerCounter, useWager } from '@/hooks/useMultiWagers';
import { formatEth, formatDate, shortenAddress } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { motion } from 'framer-motion';

function WagerCard({ wagerId }: { wagerId: number }) {
  const { data: wager, isLoading } = useWager(wagerId);
  const { address } = useAccount();

  if (isLoading) {
    return (
      <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-brand-bg-tertiary rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-brand-bg-tertiary rounded w-1/2"></div>
      </div>
    );
  }

  if (!wager) return null;

  const isExpired = Number(wager.expiryTime) < Date.now() / 1000;
  const isCreator = address?.toLowerCase() === wager.creator.toLowerCase();
  const isParticipant = wager.participants?.some((p: string) => p.toLowerCase() === address?.toLowerCase());
  const isResolver = address?.toLowerCase() === wager.resolver.toLowerCase();

  const getStatus = () => {
    if (wager.resolved) return { label: 'Resolved', color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' };
    if (isExpired && wager.currentParticipants < 2) return { label: 'Expired', color: 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30' };
    if (wager.currentParticipants >= wager.maxParticipants) return { label: 'Full', color: 'bg-brand-info/20 text-brand-info border border-brand-info/30' };
    if (wager.currentParticipants >= 2) return { label: `Active (${wager.currentParticipants}/${wager.maxParticipants})`, color: 'bg-brand-info/20 text-brand-info border border-brand-info/30' };
    return { label: `Open (${wager.currentParticipants}/${wager.maxParticipants})`, color: 'bg-brand-success/20 text-brand-success border border-brand-success/30' };
  };

  const status = getStatus();

  return (
    <Link href={`/wagers/${wagerId}`}>
      <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-lg p-6 hover:shadow-glow-purple hover:border-brand-purple-500 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${status.color}`}>
                {status.label}
              </span>
              {(isCreator || isParticipant) && (
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-purple-500/20 text-brand-purple-300 border border-brand-purple-500/30">
                  Your Wager
                </span>
              )}
              {isResolver && (
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-warning/20 text-brand-warning border border-brand-warning/30">
                  You're Resolver
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {wager.claim}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {!wager.resolved && !isExpired && (
                <span>Expires {formatDate(wager.expiryTime)}</span>
              )}
              {!wager.resolved && isExpired && (
                <span>Expired {formatDate(wager.expiryTime)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-brand-bg-secondary/50 border border-brand-purple-900/30 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Creator</div>
              <div className="text-sm font-semibold text-white">
                {shortenAddress(wager.creator)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Participants</div>
              <div className="text-sm font-semibold text-white">
                {wager.currentParticipants}/{wager.maxParticipants}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-400">Stake:</span>
            <span className="ml-2 font-bold text-white">
              {formatEth(wager.stakeAmount)} {wager.isEth ? 'ETH' : 'USDC'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Current Pool:</span>
            <span className="ml-2 font-bold text-brand-success">
              {formatEth(wager.stakeAmount * BigInt(wager.currentParticipants))} {wager.isEth ? 'ETH' : 'USDC'}
            </span>
          </div>
        </div>

        {wager.resolved && wager.winner !== '0x0000000000000000000000000000000000000000' && (
          <div className="mt-4 pt-4 border-t border-brand-purple-900/50">
            <div className="text-sm font-semibold text-gray-300">
              Winner:{' '}
              <span className="text-brand-success">
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
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              P2P Wagers
            </h1>
            <p className="text-gray-400">
              {isLoading ? 'Loading...' : `${totalWagers} active wagers`}
            </p>
          </div>
          <Link
            href="/wagers/create"
            className="bg-gradient-purple hover:shadow-glow-purple text-white font-semibold py-3 px-8 rounded-xl transition-all"
          >
            + Create Wager
          </Link>
        </motion.div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-purple text-white shadow-glow-purple'
                  : 'bg-brand-bg-secondary border border-brand-purple-900/50 text-gray-300 hover:bg-brand-bg-tertiary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-brand-bg-tertiary rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-brand-bg-tertiary rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-brand-bg-tertiary rounded"></div>
              </div>
            ))}
          </div>
        ) : totalWagers === 0 ? (
          <div className="max-w-2xl mx-auto bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-glow-purple p-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              No Wagers Yet
            </h2>
            <p className="text-gray-400 mb-6">
              Be the first to create a peer-to-peer wager!
            </p>
            <Link
              href="/wagers/create"
              className="inline-block bg-gradient-purple hover:shadow-glow-purple text-white font-semibold py-3 px-8 rounded-xl transition-all"
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
  const { data: wager, isLoading, error } = useWager(wagerId);

  // Don't show loading or error states
  if (isLoading || error || !wager) return null;

  const isExpired = Number(wager.expiryTime) < Date.now() / 1000;
  const isFull = wager.currentParticipants >= wager.maxParticipants;

  // Filter logic
  if (filter === 'open' && (wager.currentParticipants >= 2 || isExpired || wager.resolved)) return null;
  if (filter === 'accepted' && (wager.currentParticipants < 2 || wager.resolved)) return null;
  if (filter === 'resolved' && !wager.resolved) return null;

  return <WagerCard wagerId={wagerId} />;
}
