'use client';

import { useTokenPrice } from '@/hooks/useTokenPrice';
import Link from 'next/link';

interface TokenPriceCardProps {
  symbol: string;
  name: string;
  icon: string;
  href?: string;
  refreshInterval?: number;
  showDetails?: boolean;
}

export function TokenPriceCard({
  symbol,
  name,
  icon,
  href,
  refreshInterval = 30000,
  showDetails = false,
}: TokenPriceCardProps) {
  const { price, loading, error } = useTokenPrice(symbol, refreshInterval);

  const formatPrice = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    });
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeBg = (value: number) => {
    if (value > 0) return 'bg-green-100 dark:bg-green-900/30';
    if (value < 0) return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  const CardContent = () => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-2 border-gray-200 dark:border-gray-700 transition-all ${
        href ? 'hover:shadow-lg hover:border-purple-500 cursor-pointer' : ''
      }`}
    >
      {loading && !price ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 text-sm">
          Error loading price
        </div>
      ) : price ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">{symbol}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(price.currentPrice)}
              </div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded ${getChangeBg(
                  price.priceChangePercentage24h
                )} ${getChangeColor(price.priceChangePercentage24h)}`}
              >
                {formatPercent(price.priceChangePercentage24h)}
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">24h High</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatPrice(price.high24h)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">24h Low</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatPrice(price.low24h)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">24h Volume</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatNumber(price.volume24h)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatNumber(price.marketCap)}
                </span>
              </div>
            </div>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Live Price</span>
          </div>
        </>
      ) : (
        <div className="text-gray-600 dark:text-gray-400 text-sm">No data available</div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
