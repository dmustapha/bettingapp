import { useState, useEffect, useCallback } from 'react';
import { fetchTokenPrice, fetchMultipleTokenPrices, TokenPrice } from '@/lib/priceApi';

/**
 * Hook to fetch and auto-refresh a single token price
 * @param symbol Token symbol (ETH, BTC, etc.)
 * @param refreshInterval Refresh interval in milliseconds (default: 30000 = 30 seconds)
 */
export function useTokenPrice(symbol: string, refreshInterval: number = 30000) {
  const [price, setPrice] = useState<TokenPrice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const priceData = await fetchTokenPrice(symbol);

      if (priceData) {
        setPrice(priceData);
      } else {
        setError('Failed to fetch price data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    // Initial fetch
    fetchPrice();

    // Set up auto-refresh
    const interval = setInterval(fetchPrice, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval]);

  return { price, loading, error, refetch: fetchPrice };
}

/**
 * Hook to fetch and auto-refresh multiple token prices
 * @param symbols Array of token symbols
 * @param refreshInterval Refresh interval in milliseconds (default: 30000 = 30 seconds)
 */
export function useMultipleTokenPrices(symbols: string[], refreshInterval: number = 30000) {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const priceData = await fetchMultipleTokenPrices(symbols);
      setPrices(priceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchPrices();

    // Set up auto-refresh
    const interval = setInterval(fetchPrices, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval, symbols.length]);

  return { prices, loading, error, refetch: fetchPrices };
}

/**
 * Hook to get a specific token price from multiple prices
 */
export function useTokenPriceFromMultiple(
  symbol: string,
  prices: Record<string, TokenPrice>
): TokenPrice | null {
  return prices[symbol] || null;
}
