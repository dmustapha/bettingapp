'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WagerXLogo } from '@/components/Logo';

export function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  const navItems = [
    { href: '/markets', label: 'Home', icon: '🏠' },
    { href: '/wagers', label: 'PVP Wagers', icon: '⚔️' },
    { href: '/crypto', label: 'Market Betting', icon: '📈' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient accent line at top */}
      <div className="h-1 bg-gradient-to-r from-brand-purple-600 via-brand-magenta-500 to-brand-purple-600" />

      {/* Main navbar */}
      <div className="bg-brand-bg-primary/90 backdrop-blur-xl border-b border-brand-purple-500/20 shadow-lg shadow-brand-purple-500/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-10">
              <Link href="/markets" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-brand-purple-500 to-brand-magenta-500 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-300" />
                  <WagerXLogo className="w-10 h-10 relative transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-white via-brand-purple-200 to-white bg-clip-text text-transparent">
                    WagerX
                  </span>
                  <span className="text-[10px] text-brand-purple-400 font-medium tracking-wider uppercase -mt-1">
                    Prediction Markets
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 group flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {/* Active background */}
                    {isActive(item.href) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple-600/80 to-brand-magenta-600/80 rounded-xl" />
                    )}
                    {/* Hover background */}
                    <div className={`absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${isActive(item.href) ? 'hidden' : ''}`} />

                    <span className="relative text-base">{item.icon}</span>
                    <span className="relative">{item.label}</span>

                    {/* Active indicator dot */}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-magenta-400 rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Live indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-400">Live</span>
              </div>

              {/* Connect Button with custom wrapper */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple-500 to-brand-magenta-500 rounded-xl opacity-50 group-hover:opacity-75 blur transition-all duration-300" />
                <div className="relative">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-brand-bg-primary/95 backdrop-blur-xl border-b border-brand-purple-500/20">
        <nav className="container mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-brand-purple-600 to-brand-magenta-600 text-white shadow-lg shadow-brand-purple-500/25'
                  : 'bg-brand-bg-secondary/80 text-gray-400 hover:bg-brand-bg-tertiary hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
