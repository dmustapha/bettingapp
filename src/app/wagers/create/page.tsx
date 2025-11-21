'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCreateWager } from '@/hooks/useP2PWagers';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components';
import Link from 'next/link';

export default function CreateWagerPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createWager, isPending, isConfirming, isSuccess, error } = useCreateWager();

  const [claim, setClaim] = useState('');
  const [resolver, setResolver] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [stakeAmount, setStakeAmount] = useState('0.01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    createWager(claim, resolver, expiryTimeUnix, stakeAmount);
  };

  // Redirect on success
  if (isSuccess) {
    setTimeout(() => {
      router.push('/wagers');
    }, 2000);
  }

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

          <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl shadow-xl p-8">
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
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Stake Amount (ETH) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-purple-900/50 bg-brand-bg-secondary text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-brand-purple-500 transition-all"
                    required
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    The amount you're betting. Your opponent must match this amount.
                  </p>
                </div>

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
                    <li>• Your opponent must match your stake to accept</li>
                    <li>• The resolver decides who wins after the event</li>
                    <li>• Winner takes the full pool (minus 2% platform fee)</li>
                    <li>• If no one accepts before expiry, you can cancel and get your stake back</li>
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

                {isSuccess && (
                  <div className="bg-brand-success/10 border border-brand-success/30 rounded-xl p-4">
                    <p className="text-brand-success text-sm flex items-center gap-2">
                      <span>✅</span>
                      <span>Wager created successfully! Redirecting to wagers...</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Wager...</span>
                    </span>
                  ) : (
                    `🎲 Create Wager (${stakeAmount} ETH)`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
