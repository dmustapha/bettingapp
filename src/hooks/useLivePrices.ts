'use client';

import { useState, useEffect } from 'react';
import { fetchMultipleTokenPrices, TokenPrice } from '@/lib/priceApi';

export interface LivePriceData {
  prices: Record<string, TokenPrice>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Hook to fetch and auto-update live cryptocurrency prices
 * @param symbols Array of token symbols to fetch (e.g., ['cbBTC', 'ETH', 'USDC'])
 * @param refreshInterval Refresh interval in milliseconds (default: 30000 = 30 seconds)
 */
export function useLivePrices(
  symbols: string[],
  refreshInterval: number = 30000
): LivePriceData {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchPrices = async () => {
      try {
        setError(null);
        const newPrices = await fetchMultipleTokenPrices(symbols);

        if (isMounted) {
          setPrices(newPrices);
          setLastUpdated(Date.now());
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch prices');
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchPrices();

    // Set up interval for periodic updates
    intervalId = setInterval(fetchPrices, refreshInterval);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [symbols.join(','), refreshInterval]);

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
  };
}

/**
 * Hook to fetch a single token's live price
 */
export function useLivePrice(symbol: string, refreshInterval: number = 30000) {
  const { prices, isLoading, error, lastUpdated } = useLivePrices([symbol], refreshInterval);

  return {
    price: prices[symbol] || null,
    isLoading,
    error,
    lastUpdated,
  };
}
