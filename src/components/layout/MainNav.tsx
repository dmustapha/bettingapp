'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Base Betting
              </h1>
              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                Base
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/markets"
                className={`font-medium transition-colors ${
                  isActive('/markets')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                🏠 Home
              </Link>
            </nav>
          </div>

          <ConnectButton />
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center gap-4 mt-4 overflow-x-auto">
          <Link
            href="/markets"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              isActive('/markets')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            🏠 Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
