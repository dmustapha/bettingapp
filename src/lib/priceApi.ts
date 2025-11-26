/**
 * CoinGecko API Integration for Real-Time Crypto Prices
 * Free tier: 10-30 calls/minute
 */

import { TOKENS } from '@/config/tokens.config';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Mapping of token symbols to CoinGecko IDs (auto-generated from tokens config)
export const TOKEN_COINGECKO_IDS: Record<string, string> = Object.entries(TOKENS).reduce(
  (acc, [symbol, config]) => {
    acc[symbol] = config.coingeckoId;
    return acc;
  },
  {} as Record<string, string>
);

export interface TokenPrice {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

export interface PriceHistoryPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Fetch current price data for a single token
 */
export async function fetchTokenPrice(symbol: string): Promise<TokenPrice | null> {
  try {
    const coinId = TOKEN_COINGECKO_IDS[symbol];
    if (!coinId) {
      console.error(`No CoinGecko ID found for ${symbol}`);
      return null;
    }

    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const coin = data[0];

    return {
      symbol,
      name: coin.name,
      currentPrice: coin.current_price,
      priceChange24h: coin.price_change_24h || 0,
      priceChangePercentage24h: coin.price_change_percentage_24h || 0,
      high24h: coin.high_24h || 0,
      low24h: coin.low_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch current prices for multiple tokens
 */
export async function fetchMultipleTokenPrices(symbols: string[]): Promise<Record<string, TokenPrice>> {
  const prices: Record<string, TokenPrice> = {};

  try {
    const coinIds = symbols
      .map((symbol) => TOKEN_COINGECKO_IDS[symbol])
      .filter(Boolean)
      .join(',');

    if (!coinIds) {
      return prices;
    }

    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=${symbols.length}&page=1&sparkline=false&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    data.forEach((coin: any) => {
      // Find the symbol from the coin ID
      const symbol = Object.entries(TOKEN_COINGECKO_IDS).find(
        ([_, id]) => id === coin.id
      )?.[0];

      if (symbol) {
        prices[symbol] = {
          symbol,
          name: coin.name,
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_24h || 0,
          priceChangePercentage24h: coin.price_change_percentage_24h || 0,
          high24h: coin.high_24h || 0,
          low24h: coin.low_24h || 0,
          volume24h: coin.total_volume || 0,
          marketCap: coin.market_cap || 0,
          lastUpdated: Date.now(),
        };
      }
    });
  } catch (error) {
    console.error('Error fetching multiple token prices:', error);
  }

  return prices;
}

/**
 * Fetch historical price data for charting
 * @param symbol Token symbol
 * @param days Number of days of history (1, 7, 30, 90, 365, max)
 */
export async function fetchPriceHistory(
  symbol: string,
  days: number = 7
): Promise<PriceHistoryPoint[]> {
  try {
    const coinId = TOKEN_COINGECKO_IDS[symbol];
    if (!coinId) {
      console.error(`No CoinGecko ID found for ${symbol}`);
      return [];
    }

    console.log(`Fetching price history for ${symbol} (${coinId}) - ${days} days`);

    // For detailed OHLC data, we need the /ohlc endpoint (limited to 1, 7, 14, 30, 90, 180, 365 days)
    // For simplicity, we'll use the market_chart endpoint and create OHLC approximations
    const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`;
    console.log(`Fetching from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(`Received ${data.prices?.length || 0} price points`);

    if (!data.prices || data.prices.length === 0) {
      console.warn('No price data returned from CoinGecko');
      return [];
    }

    // Convert to OHLC format (approximate since we only have prices)
    const priceHistory: PriceHistoryPoint[] = [];
    const prices = data.prices;
    const volumes = data.total_volumes || [];

    // Group prices by time interval for OHLC
    const interval = days <= 1 ? 3600000 : 86400000; // 1 hour or 1 day in ms

    for (let i = 0; i < prices.length; i++) {
      const [timestamp, price] = prices[i];
      const timeSlot = Math.floor(timestamp / interval) * interval;

      // Find existing point or create new
      let point = priceHistory.find((p) => p.time === timeSlot / 1000);

      if (!point) {
        point = {
          time: timeSlot / 1000,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0,
        };
        priceHistory.push(point);
      } else {
        point.high = Math.max(point.high, price);
        point.low = Math.min(point.low, price);
        point.close = price;
      }

      // Add volume if available
      if (volumes[i]) {
        point.volume = volumes[i][1];
      }
    }

    const sortedHistory = priceHistory.sort((a, b) => a.time - b.time);
    console.log(`Processed ${sortedHistory.length} OHLC data points`);
    return sortedHistory;
  } catch (error) {
    console.error(`Error fetching price history for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch OHLC data for candlestick charts
 * Available for 1, 7, 14, 30, 90, 180, 365 days
 */
export async function fetchOHLCData(
  symbol: string,
  days: number = 7
): Promise<PriceHistoryPoint[]> {
  try {
    const coinId = TOKEN_COINGECKO_IDS[symbol];
    if (!coinId) {
      console.error(`No CoinGecko ID found for ${symbol}`);
      return [];
    }

    // Validate days parameter
    const validDays = [1, 7, 14, 30, 90, 180, 365];
    const closestValidDays = validDays.reduce((prev, curr) =>
      Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
    );

    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${closestValidDays}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      // Fallback to market_chart if OHLC not available
      return fetchPriceHistory(symbol, days);
    }

    // Convert OHLC data to our format
    return data.map((candle: number[]) => ({
      time: candle[0] / 1000, // Convert to seconds
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
    }));
  } catch (error) {
    console.error(`Error fetching OHLC data for ${symbol}:`, error);
    // Fallback to regular price history
    return fetchPriceHistory(symbol, days);
  }
}

/**
 * Simple price data for sparklines (7 days)
 */
export async function fetchSparklineData(symbol: string): Promise<number[]> {
  try {
    const coinId = TOKEN_COINGECKO_IDS[symbol];
    if (!coinId) {
      return [];
    }

    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.prices?.map((p: number[]) => p[1]) || [];
  } catch (error) {
    console.error(`Error fetching sparkline for ${symbol}:`, error);
    return [];
  }
}
