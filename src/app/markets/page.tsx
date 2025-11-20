'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BitcoinLogo, EthereumLogo, SolanaLogo } from '@/components/crypto/CryptoIcons';
import { ChartPreview, MiniChart } from '@/components/crypto/ChartPreview';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg-primary/80 backdrop-blur-lg border-b border-brand-purple-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/markets" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center font-bold text-xl">
                B
              </div>
              <span className="text-2xl font-bold">CryptoWager</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/wagers" className="hover:text-brand-purple-500 transition-colors">
                PVP Wagers
              </Link>
              <Link href="/crypto" className="hover:text-brand-purple-500 transition-colors">
                Market Betting
              </Link>
              <Link href="#features" className="hover:text-brand-purple-500 transition-colors">
                Features
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <button className="hidden md:block hover:text-brand-purple-500 transition-colors">
                Sign In
              </button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-magenta-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-block px-4 py-2 rounded-full bg-brand-bg-card border border-brand-purple-800 mb-6">
                <span className="text-sm">🔥 Decentralized Betting Platform</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Bet Smart,
                <span className="block bg-gradient-purple bg-clip-text text-transparent">
                  Win Big
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                The ultimate crypto betting platform. Challenge opponents in PVP wagers or predict market movements. Transparent, secure, and built on blockchain technology.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/crypto"
                  className="px-8 py-4 bg-gradient-primary rounded-xl font-semibold hover:shadow-glow-primary transition-all transform hover:-translate-y-1"
                >
                  Start Betting →
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all backdrop-blur-sm"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-brand-purple-500">50K+</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand-purple-500">$10M+</div>
                  <div className="text-sm text-gray-400">Total Wagered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand-purple-500">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand-purple-500">100%</div>
                  <div className="text-sm text-gray-400">Secure Transactions</div>
                </div>
              </div>
            </div>

            {/* Right side - Floating stat cards */}
            <div className="hidden lg:block relative">
              <div className="space-y-4">
                {/* BTC Card */}
                <div className="bg-brand-bg-card/80 backdrop-blur-sm border border-brand-purple-900/50 rounded-2xl p-6 hover:border-brand-purple-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <BitcoinLogo className="w-12 h-12" />
                      <div>
                        <div className="font-semibold text-gray-300">Bitcoin</div>
                        <div className="text-2xl font-bold">$45,234</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-brand-success font-semibold text-lg">+2.5%</div>
                      <div className="text-sm text-gray-400">24h</div>
                    </div>
                  </div>
                  <ChartPreview trend="up" className="w-full h-12" />
                </div>

                {/* ETH Card */}
                <div className="bg-brand-bg-card/80 backdrop-blur-sm border border-brand-purple-900/50 rounded-2xl p-6 hover:border-brand-purple-500 transition-all ml-12">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <EthereumLogo className="w-12 h-12" />
                      <div>
                        <div className="font-semibold text-gray-300">Ethereum</div>
                        <div className="text-2xl font-bold">$2,344</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-brand-error font-semibold text-lg">-1.2%</div>
                      <div className="text-sm text-gray-400">24h</div>
                    </div>
                  </div>
                  <ChartPreview trend="down" className="w-full h-12" />
                </div>

                {/* SOL Card */}
                <div className="bg-brand-bg-card/80 backdrop-blur-sm border border-brand-purple-900/50 rounded-2xl p-6 hover:border-brand-purple-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <SolanaLogo className="w-12 h-12" />
                      <div>
                        <div className="font-semibold text-gray-300">Solana</div>
                        <div className="text-2xl font-bold">$98.45</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-brand-error font-semibold text-lg">-2.1%</div>
                      <div className="text-sm text-gray-400">24h</div>
                    </div>
                  </div>
                  <ChartPreview trend="down" className="w-full h-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-brand-bg-secondary/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📊', value: '$50M+', label: 'Total Wagered', color: 'from-orange-500 to-yellow-500' },
              { icon: '🎮', value: '100K+', label: 'Wagers Settled', color: 'from-pink-500 to-purple-500' },
              { icon: '⚡', value: '<5s', label: 'Avg Settlement Time', color: 'from-cyan-500 to-blue-500' },
              { icon: '🔒', value: '100%', label: 'Secure Transactions', color: 'from-green-500 to-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl p-6 hover:border-brand-purple-500 transition-all">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PVP Wagers Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bg-card border border-brand-purple-800 mb-4">
              <span className="text-sm">🎯 Player vs Player</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              PVP Wagers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Challenge other players directly. Create or join wagers and prove your prediction skills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '🪙', name: 'Coin Flip', desc: 'Simple 50/50 chance. Winner takes all.', color: 'from-orange-500 to-yellow-500' },
              { icon: '🎲', name: 'Dice Roll', desc: 'Roll the dice, higher number wins.', color: 'from-pink-500 to-red-500' },
              { icon: '⚔️', name: 'Price Battle', desc: 'Predict if crypto goes up or down.', color: 'from-green-500 to-emerald-500' },
              { icon: '✨', name: 'Custom Wager', desc: 'Create your own betting challenge.', color: 'from-purple-500 to-pink-500' },
            ].map((game, i) => (
              <Link key={i} href="/wagers" className="group">
                <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl p-6 hover:border-brand-purple-500 transition-all h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{game.desc}</p>
                  <div className="flex items-center text-brand-purple-500 font-semibold">
                    <span>Play Now</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/wagers" className="inline-block px-8 py-4 bg-gradient-purple rounded-xl font-semibold hover:shadow-glow-purple transition-all">
              View All Wagers
            </Link>
          </div>
        </div>
      </section>

      {/* Crypto Market Betting Section */}
      <section className="py-20 px-6 bg-brand-bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bg-card border border-brand-purple-800 mb-4">
              <span className="text-sm">📈 Market Predictions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Crypto Market Betting
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Predict market movements and earn rewards. Will the price go up or down? Place your bet and watch the action unfold!
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <BitcoinLogo className="w-16 h-16 shadow-lg" />
                  <div>
                    <div className="text-xl font-semibold text-gray-300">Bitcoin</div>
                    <div className="text-3xl font-bold">$45,234.50</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-brand-success text-2xl font-bold">+2.5%</div>
                  <div className="text-sm text-gray-400">Expires in 2h 15m</div>
                </div>
              </div>

              {/* Chart Preview */}
              <div className="mb-6 bg-brand-bg-secondary/50 rounded-xl p-4">
                <ChartPreview trend="up" className="w-full h-24" />
              </div>

              {/* Bull vs Bear Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-brand-success flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3l7 7-7 7V3z"/></svg>
                    Bull 65%
                  </span>
                  <span className="text-brand-error flex items-center gap-1">
                    Bear 35%
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 17l-7-7 7-7v14z"/></svg>
                  </span>
                </div>
                <div className="h-4 bg-brand-bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-success to-green-400" style={{ width: '65%' }}></div>
                </div>
              </div>

              {/* Bet Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Link href="/crypto" className="py-4 bg-brand-success/20 border-2 border-brand-success rounded-xl font-bold text-center hover:bg-brand-success/30 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Bet Bull
                </Link>
                <Link href="/crypto" className="py-4 bg-brand-error/20 border-2 border-brand-error rounded-xl font-bold text-center hover:bg-brand-error/30 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                  Bet Bear
                </Link>
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                24h Volume: $2.3B
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/crypto" className="inline-block px-8 py-4 bg-gradient-purple rounded-xl font-semibold hover:shadow-glow-purple transition-all">
              View All Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose CryptoWager?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built on blockchain technology for maximum security, transparency, and fairness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                title: 'Provably Fair',
                desc: 'All outcomes are verifiable on-chain. Smart contracts ensure complete transparency and fairness.',
                gradient: 'bg-gradient-green'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                title: 'Instant Settlements',
                desc: 'Winners receive payouts immediately. No waiting, no delays, just instant crypto rewards.',
                gradient: 'bg-gradient-orange'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                title: 'Secure & Trustless',
                desc: 'Your funds are protected by battle-tested smart contracts. Non-custodial, always in your control.',
                gradient: 'bg-gradient-blue'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
                title: 'Low Fees',
                desc: 'Only 2% platform fee on winnings. Keep more of your profits with transparent pricing.',
                gradient: 'bg-gradient-pink'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                title: 'Community Driven',
                desc: 'Join thousands of bettors worldwide. Chat, compete, and build your reputation on-chain.',
                gradient: 'bg-gradient-red'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
                title: 'Rewards Program',
                desc: 'Earn loyalty points with every bet. Unlock exclusive perks and cashback rewards.',
                gradient: 'bg-gradient-violet'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-brand-bg-card border border-brand-purple-900/50 rounded-2xl p-6 hover:border-brand-purple-500 transition-all">
                <div className={`w-16 h-16 rounded-2xl ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-gradient-cta rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Start Winning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of players already making profits on CryptoWager. Connect your wallet and start betting in seconds.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-primary rounded-xl font-bold hover:shadow-glow-primary transition-all transform hover:-translate-y-0.5">
                Connect Wallet
              </button>
              <Link href="#features" className="px-8 py-4 border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-bg-secondary border-t border-brand-purple-900/30 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center font-bold text-xl">
                  B
                </div>
                <span className="text-xl font-bold">CryptoWager</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The future of decentralized betting. Fair, transparent, and secure.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-brand-purple-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-brand-purple-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-brand-purple-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/wagers" className="hover:text-brand-purple-500">PVP Wagers</Link></li>
                <li><Link href="/crypto" className="hover:text-brand-purple-500">Market Betting</Link></li>
                <li><a href="#" className="hover:text-brand-purple-500">Leaderboard</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">Rewards</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-brand-purple-500">Documentation</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">API</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-brand-purple-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">Responsible Gaming</a></li>
                <li><a href="#" className="hover:text-brand-purple-500">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-purple-900/30 pt-8 text-center text-sm text-gray-400">
            © 2025 CryptoWager. All rights reserved. Built on Ethereum • Powered by Smart Contracts
          </div>
        </div>
      </footer>
    </div>
  );
}
