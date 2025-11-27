import { useState, useEffect, useCallback } from 'react';
import { fetchPriceHistory, fetchOHLCData, PriceHistoryPoint } from '@/lib/priceApi';

export type TimeframeOption = '1H' | '4H' | '1D' | '7D' | '30D';

const TIMEFRAME_TO_DAYS: Record<TimeframeOption, number> = {
  '1H': 0.042, // 1 hour
  '4H': 0.167, // 4 hours
  '1D': 1,
  '7D': 7,
  '30D': 30,
};

/**
 * Hook to fetch historical price data for charts
 * @param symbol Token symbol
 * @param timeframe Timeframe option
 * @param useOHLC Whether to use OHLC data (better for candlesticks)
 */
export function usePriceHistory(
  symbol: string,
  timeframe: TimeframeOption = '7D',
  useOHLC: boolean = false
) {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const days = TIMEFRAME_TO_DAYS[timeframe];

      let historyData: PriceHistoryPoint[];

      if (useOHLC && days >= 1) {
        // Use OHLC data for candlestick charts (only available for >= 1 day)
        historyData = await fetchOHLCData(symbol, days);
      } else {
        // Use regular price history
        historyData = await fetchPriceHistory(symbol, days);
      }

      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, useOHLC]);

  useEffect(() => {
    let mounted = true;

    // Initial fetch
    fetchHistory();

    // Refetch every 30 seconds to keep chart data live
    const interval = setInterval(() => {
      if (mounted) {
        fetchHistory();
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}

/**
 * Hook to get the latest price from history
 */
export function useLatestPriceFromHistory(history: PriceHistoryPoint[]): number | null {
  if (history.length === 0) return null;
  return history[history.length - 1]?.close || null;
}

/**
 * Hook to calculate price change from history
 */
export function usePriceChangeFromHistory(history: PriceHistoryPoint[]): {
  change: number;
  changePercent: number;
} {
  if (history.length < 2) {
    return { change: 0, changePercent: 0 };
  }

  const firstPrice = history[0].close;
  const lastPrice = history[history.length - 1].close;

  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  return { change, changePercent };
}
