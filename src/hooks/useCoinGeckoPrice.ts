import { useState, useEffect } from 'react';
import { fetchTokenPrice, fetchMultipleTokenPrices, TokenPrice } from '@/lib/priceApi';

/**
 * Hook to fetch a single token's price from CoinGecko
 */
export function useCoinGeckoPrice(symbol: string) {
  const [data, setData] = useState<TokenPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        const price = await fetchTokenPrice(symbol);
        if (mounted) {
          setData(price);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch price'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPrice();

    // Refetch every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return { data, isLoading, error };
}

/**
 * Hook to fetch multiple token prices from CoinGecko
 */
export function useCoinGeckoPrices(symbols: string[]) {
  const [data, setData] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        const prices = await fetchMultipleTokenPrices(symbols);
        if (mounted) {
          setData(prices);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch prices'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    if (symbols.length > 0) {
      fetchPrices();

      // Refetch every 30 seconds
      const interval = setInterval(fetchPrices, 30000);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [symbols.join(',')]);

  return { data, isLoading, error };
}
