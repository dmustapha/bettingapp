// DexScreener API integration for Base chain token search
// https://docs.dexscreener.com/api/reference

export interface DexToken {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  priceChange?: {
    h24?: number;
  };
  volume24h: number;
  liquidity: {
    usd: number;
  };
  fdv: number;
  marketCap: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  address: string;
  priceUsd: string;
  priceChange24h?: string;
  volume24h: number;
  liquidity: number;
  icon?: string;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const BASE_CHAIN_ID = 'base';

// Search for tokens on Base chain
export async function searchBaseTokens(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    // Search by token symbol/name
    const response = await fetch(`${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      console.error('DexScreener API error:', response.status);
      return [];
    }

    const data = await response.json();
    const pairs = data.pairs || [];

    // Filter for Base chain tokens and remove duplicates by symbol
    const baseTokens = pairs
      .filter((pair: DexToken) => pair.chainId === BASE_CHAIN_ID)
      .map((pair: DexToken) => ({
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        address: pair.baseToken.address,
        priceUsd: pair.priceUsd || '0',
        priceChange24h: pair.priceChange?.h24?.toString(),
        volume24h: pair.volume24h || 0,
        liquidity: pair.liquidity?.usd || 0,
      }))
      .filter((token: SearchResult, index: number, self: SearchResult[]) =>
        // Remove duplicates by symbol (keep highest liquidity)
        index === self.findIndex(t => t.symbol === token.symbol)
      )
      .sort((a: SearchResult, b: SearchResult) => b.liquidity - a.liquidity)
      .slice(0, 20); // Limit to top 20 results

    return baseTokens;
  } catch (error) {
    console.error('Error searching Base tokens:', error);
    return [];
  }
}

// Get token info by address
export async function getTokenByAddress(address: string): Promise<SearchResult | null> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/tokens/${address}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const pairs = data.pairs || [];

    // Find Base chain pair
    const basePair = pairs.find((pair: DexToken) => pair.chainId === BASE_CHAIN_ID);

    if (!basePair) return null;

    return {
      symbol: basePair.baseToken.symbol,
      name: basePair.baseToken.name,
      address: basePair.baseToken.address,
      priceUsd: basePair.priceUsd || '0',
      priceChange24h: basePair.priceChange?.h24?.toString(),
      volume24h: basePair.volume24h || 0,
      liquidity: basePair.liquidity?.usd || 0,
    };
  } catch (error) {
    console.error('Error fetching token by address:', error);
    return null;
  }
}

// Popular Base tokens (fallback/quick access)
export const POPULAR_BASE_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x4200000000000000000000000000000000000006' },
  { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006' },
  { symbol: 'DEGEN', name: 'Degen', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' },
  { symbol: 'BRETT', name: 'Brett', address: '0x532f27101965dd16442E59d40670FaF5eBB142E4' },
  { symbol: 'TOSHI', name: 'Toshi', address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4' },
];
