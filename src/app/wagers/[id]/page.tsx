'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import {
  useWager,
  useJoinWager,
  useResolveWager,
  useRefundWager,
  useParticipants,
  useHasParticipantJoined,
  MULTI_WAGERS_ADDRESS,
} from '@/hooks/useMultiWagers';
import { formatEth, formatUsdc, formatDate, shortenAddress } from '@/lib/utils';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import { TokenApprovalButton } from '@/components/TokenApprovalButton';
import { TestnetUSDCInfo } from '@/components/TestnetUSDCInfo';

export default function WagerDetailPage() {
  const params = useParams();
  const wagerId = Number(params.id);
  const { address, isConnected } = useAccount();

  const { data: wager, isLoading, refetch } = useWager(wagerId);
  const { data: participants } = useParticipants(wagerId);
  const { data: hasJoined } = useHasParticipantJoined(wagerId, address);
  const { joinWager, isPending: isJoining, isSuccess: joinSuccess } = useJoinWager();
  const { resolveWager, isPending: isResolving, isSuccess: resolveSuccess } = useResolveWager();
  const { refundWager, isPending: isRefunding, isSuccess: refundSuccess } = useRefundWager();

  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (joinSuccess || resolveSuccess || refundSuccess) {
      refetch();
    }
  }, [joinSuccess, resolveSuccess, refundSuccess, refetch]);

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
  const isCreator = address?.toLowerCase() === wager.creator.toLowerCase();
  const isResolver = address?.toLowerCase() === wager.resolver.toLowerCase();
  const isParticipant = hasJoined || false;
  const isFull = wager.currentParticipants >= wager.maxParticipants;

  const canJoin = isConnected && !wager.resolved && !isExpired && !isParticipant && !isResolver && !isFull;
  const canRefund = isCreator && !wager.resolved && isExpired && wager.currentParticipants < 2;
  const canResolve = isResolver && wager.currentParticipants >= 2 && !wager.resolved;

  const getStatus = () => {
    if (wager.resolved) return { label: 'Resolved', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
    if (isExpired && wager.currentParticipants < 2) return { label: 'Expired', color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
    if (isFull) return { label: 'Full - Awaiting Resolution', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
    if (wager.currentParticipants >= 2) return { label: `Active (${wager.currentParticipants}/${wager.maxParticipants})`, color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
    return { label: `Open (${wager.currentParticipants}/${wager.maxParticipants})`, color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
  };

  const status = getStatus();

  const handleJoin = () => {
    const stakeDisplay = wager.isEth ? formatEth(wager.stakeAmount) : formatUsdc(wager.stakeAmount);
    const currency = wager.isEth ? 'ETH' : 'USDC';
    if (window.confirm(`Join this wager with stake of ${stakeDisplay} ${currency}?`)) {
      joinWager(wagerId, stakeDisplay);
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

  const handleRefund = () => {
    if (window.confirm('Refund this wager and return stakes to all participants?')) {
      refundWager(wagerId);
    }
  };

  const handleCopyLink = () => {
    const wagerUrl = `${window.location.origin}/wagers/${wagerId}`;
    navigator.clipboard.writeText(wagerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

          {/* Wager Header Card */}
          <div className="bg-gradient-to-br from-brand-purple-900/30 via-brand-bg-card to-brand-pink-900/20 border border-brand-purple-500/30 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-purple-500/20 to-transparent blur-3xl -z-10"></div>

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${status.color} backdrop-blur-sm`}>
                    {status.label}
                  </span>
                  {isParticipant && (
                    <span className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-purple-500/30 text-brand-purple-200 border border-brand-purple-400/50 backdrop-blur-sm">
                      ✨ Your Wager
                    </span>
                  )}
                  {isResolver && (
                    <span className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-warning/30 text-brand-warning border border-brand-warning/50 backdrop-blur-sm">
                      ⚖️ You're the Resolver
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                  {wager.claim}
                </h1>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-brand-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Created {formatDate(wager.createdAt)}</span>
                  </div>
                  <span className="text-brand-purple-400">•</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-brand-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Expires {formatDate(wager.expiryTime)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowShareDialog(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 hover:from-brand-purple-600 hover:to-brand-pink-600 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-glow-purple transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>

            {/* Key Players */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-brand-bg-secondary/80 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5 hover:border-blue-400/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-blue-400">Creator</div>
                  </div>
                  <div className="text-xl font-bold text-white mb-2 font-mono">
                    {shortenAddress(wager.creator)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Stake: <span className="text-blue-400 font-semibold">
                      {wager.isEth ? formatEth(wager.stakeAmount) : formatUsdc(wager.stakeAmount)} {wager.isEth ? 'ETH' : 'USDC'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-brand-bg-secondary/80 backdrop-blur-sm border border-amber-500/30 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-amber-400">Resolver</div>
                  </div>
                  <div className="text-xl font-bold text-white mb-2 font-mono">
                    {shortenAddress(wager.resolver)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Trusted third party
                  </div>
                </div>
              </div>
            </div>

            {/* Participants List */}
            {participants && participants.length > 0 && (
              <div className="relative group mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-brand-bg-secondary/80 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">
                      Participants ({wager.currentParticipants}/{wager.maxParticipants})
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {participants.map((participant: string, index: number) => (
                      <div key={participant} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                        {shortenAddress(participant)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pool Info */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-500 via-brand-pink-500 to-brand-purple-600 opacity-90"></div>
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
              <div className="relative p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  Current Prize Pool
                </div>
                <div className="text-5xl font-black text-white mb-3 tracking-tight">
                  {wager.isEth
                    ? formatEth(wager.stakeAmount * BigInt(wager.currentParticipants))
                    : formatUsdc(wager.stakeAmount * BigInt(wager.currentParticipants))} {wager.isEth ? 'ETH' : 'USDC'}
                </div>
                <div className="text-sm text-white/90 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Winner takes all (minus 2% platform fee)</span>
                  </div>
                  {wager.currentParticipants < wager.maxParticipants && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <span className="text-white/70">Potential max pool: </span>
                      <span className="text-white font-bold">
                        {wager.isEth
                          ? formatEth(wager.stakeAmount * BigInt(wager.maxParticipants))
                          : formatUsdc(wager.stakeAmount * BigInt(wager.maxParticipants))} {wager.isEth ? 'ETH' : 'USDC'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {wager.resolved && wager.winner !== '0x0000000000000000000000000000000000000000' && (
              <div className="mt-6 relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 opacity-90"></div>
                <div className="relative p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                    Wager Resolved
                  </div>
                  <div className="text-3xl font-black text-white mb-2">
                    Winner: {shortenAddress(wager.winner)}
                  </div>
                  {(address?.toLowerCase() === wager.winner.toLowerCase()) && (
                    <div className="mt-4 text-xl font-bold text-white animate-pulse">
                      🎉 Congratulations! You won!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Join Section */}
          {canJoin && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8 mb-6">
              {/* USDC Balance & Info */}
              <TestnetUSDCInfo />

              <h2 className="text-2xl font-bold text-white mb-4">Join This Wager</h2>
              <p className="text-gray-400 mb-4">
                To join this wager, you must match the stake amount. The winner takes the full pool (minus 2% platform fee).
              </p>
              <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Current Participants:</span>
                  <span className="text-lg font-bold text-white">{wager.currentParticipants}/{wager.maxParticipants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Pool if you join:</span>
                  <span className="text-lg font-bold text-brand-success">
                    {wager.isEth
                      ? formatEth(wager.stakeAmount * BigInt(wager.currentParticipants + 1))
                      : formatUsdc(wager.stakeAmount * BigInt(wager.currentParticipants + 1))} {wager.isEth ? 'ETH' : 'USDC'}
                  </span>
                </div>
              </div>

              {wager.isEth ? (
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full py-3 rounded-xl font-semibold !bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : `Join Wager (Stake ${formatEth(wager.stakeAmount)} ETH)`}
                </button>
              ) : (
                <TokenApprovalButton
                  spenderAddress={MULTI_WAGERS_ADDRESS}
                  amount={formatUsdc(wager.stakeAmount)}
                  decimals={6}
                  onPlaceBet={handleJoin}
                  disabled={isJoining}
                  isPending={isJoining}
                  buttonText={`Join Wager (Stake ${formatUsdc(wager.stakeAmount)} USDC)`}
                  className="!bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700"
                />
              )}

              {joinSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Successfully joined the wager!
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
                {participants && participants.map((participant: string, index: number) => (
                  <button
                    key={participant}
                    onClick={() => setSelectedWinner(participant)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedWinner === participant
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                    }`}
                  >
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      Participant {index + 1} Wins
                    </div>
                    <div className="text-sm text-gray-400">{shortenAddress(participant as `0x${string}`)}</div>
                  </button>
                ))}
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

          {/* Refund Section */}
          {canRefund && (
            <div className="bg-brand-bg-card rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Refund Wager</h2>
              <p className="text-gray-400 mb-6">
                This wager has expired without enough participants. You can refund it to return stakes to all participants.
              </p>
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefunding ? 'Refunding...' : 'Refund Wager & Return Stakes'}
              </button>
              {refundSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Wager refunded successfully! Stakes have been returned to all participants.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Share Dialog Modal */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowShareDialog(false)}>
          <div className="bg-brand-bg-card border border-brand-purple-500 rounded-2xl shadow-glow-purple max-w-lg w-full p-8 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Share Wager</h2>
              <button
                onClick={() => setShowShareDialog(false)}
                className="p-2 rounded-lg hover:bg-brand-purple-500/20 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-brand-bg-secondary border border-brand-purple-900/50 rounded-xl p-4 mb-6">
              <div className="text-xs text-gray-400 mb-2">Wager Link</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/wagers/${wagerId}`}
                  className="flex-1 bg-brand-bg-tertiary border border-brand-purple-900/50 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-brand-purple-500 hover:bg-brand-purple-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{wager.isPublic ? '🌍' : '🔒'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-purple-300 mb-1">
                    {wager.isPublic ? 'Public Wager' : 'Private Wager'}
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {wager.isPublic ? (
                      <>
                        <li>• This wager is visible on the landing page</li>
                        <li>• Anyone can join by matching the stake</li>
                        <li>• Up to {wager.maxParticipants} total participants can join</li>
                      </>
                    ) : (
                      <>
                        <li>• Share this link with people you want to challenge</li>
                        <li>• Only people with this link can join</li>
                        <li>• Up to {wager.maxParticipants} total participants can join</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
