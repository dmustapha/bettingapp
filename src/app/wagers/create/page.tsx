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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MainNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/wagers" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              ← Back to Wagers
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Create P2P Wager
            </h1>

            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please connect your wallet to create a wager
                </p>
                <ConnectButton />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Wager Claim *
                  </label>
                  <textarea
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., Team A will beat Team B in tomorrow's match"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Describe what you're betting on. Be specific and clear.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Resolver Address *
                  </label>
                  <input
                    type="text"
                    value={resolver}
                    onChange={(e) => setResolver(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Address of the trusted third party who will resolve this wager
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Stake Amount (ETH) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    The amount you're betting. Your opponent must match this amount.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Expiry Time *
                    </label>
                    <input
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
                  When this wager expires if no one accepts it
                </p>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                    How it works:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• Your opponent must match your stake to accept</li>
                    <li>• The resolver decides who wins after the event</li>
                    <li>• Winner takes the full pool (minus 2% platform fee)</li>
                    <li>• If no one accepts before expiry, you can cancel and get your stake back</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      Error: {error.message}
                    </p>
                  </div>
                )}

                {isSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      Wager created successfully! Redirecting to wagers...
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? 'Creating Wager...' : `Create Wager (${stakeAmount} ETH)`}
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
