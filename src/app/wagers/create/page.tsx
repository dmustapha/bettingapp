'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCreateWager, useWagerCounter, MULTI_WAGERS_ADDRESS } from '@/hooks/useMultiWagers';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import Link from 'next/link';
import { TokenApprovalButton } from '@/components/TokenApprovalButton';
import { TestnetUSDCInfo } from '@/components/TestnetUSDCInfo';
import { motion } from 'framer-motion';

export default function CreateWagerPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createWager, isPending, isConfirming, isSuccess, error } = useCreateWager();
  const { data: wagerCounter, refetch: refetchCounter } = useWagerCounter();

  const [claim, setClaim] = useState('');
  const [resolver, setResolver] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [stakeAmount, setStakeAmount] = useState('10');
  const [createdWagerId, setCreatedWagerId] = useState<number | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState<'USDC' | 'ETH'>('USDC');

  // When switching to private, reset max participants to 2
  useEffect(() => {
    if (!isPublic) {
      setMaxParticipants('2');
    }
  }, [isPublic]);

  // Update stake amount when payment method changes
  useEffect(() => {
    if (paymentMethod === 'ETH' && stakeAmount === '10') {
      setStakeAmount('0.01');
    } else if (paymentMethod === 'USDC' && stakeAmount === '0.01') {
      setStakeAmount('10');
    }
  }, [paymentMethod]);

  const handleSubmit = () => {
    if (!claim || !resolver || !expiryDate || !expiryTime || !stakeAmount) {
      alert('Please fill in all fields');
      return;
    }

    // Validate resolver address
    if (!/^0x[a-fA-F0-9]{40}$/.test(resolver)) {
      alert('Invalid resolver address');
      return;
    }

    if (resolver.toLowerCase() === address?.toLowerCase()) {
      alert('You cannot be your own resolver');
      return;
    }

    // Combine date and time
    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
    const expiryTimeUnix = Math.floor(expiryDateTime.getTime() / 1000);

    // Validate expiry time is in the future
    if (expiryTimeUnix <= Date.now() / 1000) {
      alert('Expiry time must be in the future');
      return;
    }

    // Store the current wager counter before creating
    if (wagerCounter !== undefined) {
      setCreatedWagerId(Number(wagerCounter));
    }

    createWager(claim, resolver, expiryTimeUnix, isPublic, parseInt(maxParticipants), stakeAmount, paymentMethod);
  };

  // Show share dialog on success
  useEffect(() => {
    if (isSuccess && createdWagerId !== null) {
      refetchCounter();
      setShowShareDialog(true);
    }
  }, [isSuccess, createdWagerId, refetchCounter]);

  const handleCopyLink = () => {
    const wagerUrl = `${window.location.origin}/wagers/${createdWagerId}`;
    navigator.clipboard.writeText(wagerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewWager = () => {
    router.push(`/wagers/${createdWagerId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark text-white">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/wagers" className="text-brand-purple-400 hover:text-brand-purple-300 transition-colors flex items-center gap-2">
              <span>←</span>
              <span>Back to Wagers</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl shadow-lg">
                🤝
              </div>
              <h1 className="text-3xl font-bold">
                Create P2P Wager
              </h1>
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Please connect your wallet to create a wager
                </p>
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-6">
                {/* USDC Balance & Info */}
                <TestnetUSDCInfo />

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Wager Claim *
                  </label>
                  <textarea
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., Team A will beat Team B in tomorrow's match"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                    required
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Describe what you're betting on. Be specific and clear.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Resolver Address *
                  </label>
                  <input
                    type="text"
                    value={resolver}
                    onChange={(e) => setResolver(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all font-mono"
                    required
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Address of the trusted third party who will resolve this wager
                  </p>
                </div>

                {/* Payment Method Toggle */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('USDC')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'USDC'
                          ? 'border-brand-purple-500 bg-brand-purple-500/20'
                          : 'border-brand-purple-900/50 bg-brand-bg-secondary hover:border-brand-purple-700'
                      }`}
                    >
                      <div className="text-xl mb-1">💵</div>
                      <div className="font-semibold text-white">USDC</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Stablecoin
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ETH')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'ETH'
                          ? 'border-brand-purple-500 bg-brand-purple-500/20'
                          : 'border-brand-purple-900/50 bg-brand-bg-secondary hover:border-brand-purple-700'
                      }`}
                    >
                      <div className="text-xl mb-1">⟠</div>
                      <div className="font-semibold text-white">ETH</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Native token
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Stake Amount ({paymentMethod}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={paymentMethod === 'ETH' ? '0.001' : '1'}
                      min={paymentMethod === 'ETH' ? '0.001' : '1'}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full px-4 py-3 pr-16 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-xl">{paymentMethod === 'ETH' ? '⟠' : '💵'}</span>
                      <span className="font-semibold text-gray-400">{paymentMethod}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    The amount each participant must stake to join.
                  </p>
                </div>

                {/* Visibility Toggle */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Wager Visibility *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isPublic
                          ? 'border-brand-purple-500 bg-brand-purple-500/20'
                          : 'border-brand-purple-900/50 bg-brand-bg-secondary hover:border-brand-purple-700'
                      }`}
                    >
                      <div className="text-xl mb-1">🌍</div>
                      <div className="font-semibold text-white">Public</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Shows on landing page, anyone can join
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        !isPublic
                          ? 'border-brand-purple-500 bg-brand-purple-500/20'
                          : 'border-brand-purple-900/50 bg-brand-bg-secondary hover:border-brand-purple-700'
                      }`}
                    >
                      <div className="text-xl mb-1">🔒</div>
                      <div className="font-semibold text-white">Private</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Only via shared link
                      </div>
                    </button>
                  </div>
                </div>

                {/* Max Participants - Only show if public */}
                {isPublic && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Maximum Participants *
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {['2', '3', '5', '10'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxParticipants(num)}
                          className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                            maxParticipants === num
                              ? 'border-brand-purple-500 bg-brand-purple-500/20 text-white'
                              : 'border-brand-purple-900/50 bg-brand-bg-secondary text-gray-400 hover:border-brand-purple-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Total number of participants (including you). Winner takes all!
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Expiry Time *
                    </label>
                    <input
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 -mt-4">
                  When this wager expires if no one accepts it
                </p>

                <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-brand-purple-300 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    <span>How it works:</span>
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• {isPublic ? 'Anyone can join this wager from the landing page' : 'Only people with your link can join this wager'}</li>
                    <li>• Up to {maxParticipants} participants can join (each stakes {stakeAmount} {paymentMethod})</li>
                    <li>• The resolver decides who wins after the event</li>
                    <li>• Winner takes the full pool (minus 2% platform fee)</li>
                    <li>• If no one joins before expiry, you can cancel and get your stake back</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-brand-error/10 border border-brand-error/30 rounded-xl p-4">
                    <p className="text-brand-error text-sm flex items-center gap-2">
                      <span>❌</span>
                      <span>Error: {error.message}</span>
                    </p>
                  </div>
                )}

                {isSuccess && !showShareDialog && (
                  <div className="bg-brand-success/10 border border-brand-success/30 rounded-xl p-4">
                    <p className="text-brand-success text-sm flex items-center gap-2">
                      <span>✅</span>
                      <span>Wager created successfully!</span>
                    </p>
                  </div>
                )}

                {paymentMethod === 'USDC' ? (
                  <TokenApprovalButton
                    spenderAddress={MULTI_WAGERS_ADDRESS}
                    amount={stakeAmount}
                    decimals={6}
                    onPlaceBet={handleSubmit}
                    disabled={isPending || isConfirming || !claim || !resolver || !expiryDate || !expiryTime}
                    isPending={isPending || isConfirming}
                    buttonText={`🎲 Create Wager (${stakeAmount} USDC)`}
                  />
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming || !claim || !resolver || !expiryDate || !expiryTime}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-primary text-white hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending || isConfirming ? 'Creating Wager...' : `🎲 Create Wager (${stakeAmount} ETH)`}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Share Dialog Modal */}
      {showShareDialog && createdWagerId !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-bg-card border border-brand-purple-500 rounded-2xl shadow-glow-purple max-w-lg w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow-primary">
                🎉
              </div>
              <h2 className="text-2xl font-bold mb-2">Wager Created!</h2>
              <p className="text-gray-300">Share this wager with others to accept the challenge</p>
            </div>

            <div className="bg-brand-bg-secondary border border-brand-purple-900/50 rounded-xl p-4 mb-6">
              <div className="text-xs text-gray-400 mb-2">Wager Link</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/wagers/${createdWagerId}`}
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

            <div className="bg-brand-purple-500/10 border border-brand-purple-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{isPublic ? '🌍' : '🔒'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-purple-300 mb-1">
                    {isPublic ? 'Public Wager Created!' : 'Private Wager Created!'}
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {isPublic ? (
                      <>
                        <li>• Your wager is now visible on the landing page</li>
                        <li>• Anyone can join by matching your stake ({stakeAmount} USDC)</li>
                        <li>• Up to {maxParticipants} total participants can join - winner takes all!</li>
                      </>
                    ) : (
                      <>
                        <li>• Share this link with people you want to challenge</li>
                        <li>• Only people with this link can join your wager</li>
                        <li>• Up to {maxParticipants} total participants - winner takes all!</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/wagers')}
                className="flex-1 bg-brand-bg-secondary border border-brand-purple-900/50 hover:bg-brand-bg-tertiary text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Back to Wagers
              </button>
              <button
                onClick={handleViewWager}
                className="flex-1 bg-gradient-primary hover:shadow-glow-primary text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                View Wager
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
