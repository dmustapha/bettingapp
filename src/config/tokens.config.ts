/**
 * Comprehensive Token Configuration for Base Chain
 *
 * Includes contract addresses, Chainlink price feeds, CoinGecko IDs,
 * and metadata for all supported tokens on Base network
 */

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  category: 'Native' | 'Stablecoin' | 'DeFi' | 'Base Ecosystem' | 'Wrapped' | 'Meme';

  // Base Chain addresses
  contractAddress: `0x${string}`;

  // Chainlink Price Feed (if available)
  chainlinkPriceFeed?: `0x${string}`;

  // CoinGecko API
  coingeckoId: string;

  // Display
  color?: string;
  description?: string;

  // Trading info
  minBetAmount?: string; // in ETH
  featured?: boolean; // Show in featured section
}

/**
 * All supported tokens on Base Chain
 */
export const TOKENS: Record<string, TokenConfig> = {
  // ============ NATIVE & WRAPPED ============

  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029',
    category: 'Native',
    contractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH placeholder
    chainlinkPriceFeed: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70', // ETH/USD on Base
    coingeckoId: 'ethereum',
    color: '#627EEA',
    description: 'Native cryptocurrency of Ethereum, used for gas on Base L2',
    minBetAmount: '0.001',
    featured: true,
  },

  cbETH: {
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029',
    category: 'Wrapped',
    contractAddress: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    chainlinkPriceFeed: '0xd7818272B9e248357d13057AAb0B417aF31E817d', // cbETH/USD on Base
    coingeckoId: 'coinbase-wrapped-staked-eth',
    color: '#0052FF',
    description: 'Liquid staking token representing staked ETH on Coinbase',
    minBetAmount: '0.001',
    featured: true,
  },

  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029',
    category: 'Wrapped',
    contractAddress: '0x4200000000000000000000000000000000000006',
    chainlinkPriceFeed: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70', // Same as ETH
    coingeckoId: 'weth',
    color: '#627EEA',
    description: 'ERC-20 wrapped version of ETH',
    minBetAmount: '0.001',
  },

  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029',
    category: 'Wrapped',
    contractAddress: '0x0000000000000000000000000000000000000000', // Placeholder - use cbBTC for actual trading
    chainlinkPriceFeed: '0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298', // BTC/USD on Base Sepolia
    coingeckoId: 'bitcoin',
    color: '#F7931A',
    description: 'The original cryptocurrency - predict BTC price movements',
    minBetAmount: '0.0001',
    featured: true,
  },

  // ============ STABLECOINS ============

  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029',
    category: 'Stablecoin',
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    chainlinkPriceFeed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B', // USDC/USD on Base
    coingeckoId: 'usd-coin',
    color: '#2775CA',
    description: 'Fully reserved stablecoin pegged to USD',
    minBetAmount: '1',
    featured: true,
  },

  USDbC: {
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029',
    category: 'Stablecoin',
    contractAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    chainlinkPriceFeed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B', // Use USDC feed
    coingeckoId: 'bridged-usd-coin-base',
    color: '#2775CA',
    description: 'Bridged USDC on Base (legacy)',
    minBetAmount: '1',
  },

  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=029',
    category: 'Stablecoin',
    contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    chainlinkPriceFeed: '0x591e79239a7d679378eC8c847e5038150364C78F', // DAI/USD on Base
    coingeckoId: 'dai',
    color: '#F5AC37',
    description: 'Decentralized stablecoin pegged to USD',
    minBetAmount: '1',
    featured: true,
  },

  // ============ MAJOR DEFI TOKENS ============

  UNI: {
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=029',
    category: 'DeFi',
    contractAddress: '0xc3De830EA07524a0761646a6a4e4be0e114a3C83',
    coingeckoId: 'uniswap',
    color: '#FF007A',
    description: 'Governance token of Uniswap DEX',
    minBetAmount: '0.1',
    featured: true,
  },

  AAVE: {
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/aave-aave-logo.svg?v=029',
    category: 'DeFi',
    contractAddress: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    coingeckoId: 'aave',
    color: '#B6509E',
    description: 'Governance token of Aave lending protocol',
    minBetAmount: '0.01',
    featured: true,
  },

  SNX: {
    symbol: 'SNX',
    name: 'Synthetix',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/synthetix-snx-logo.svg?v=029',
    category: 'DeFi',
    contractAddress: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66',
    coingeckoId: 'synthetix-network-token',
    color: '#00D1FF',
    description: 'Synthetix Network Token for synthetic assets',
    minBetAmount: '0.5',
  },

  COMP: {
    symbol: 'COMP',
    name: 'Compound',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/compound-comp-logo.svg?v=029',
    category: 'DeFi',
    contractAddress: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
    coingeckoId: 'compound-governance-token',
    color: '#00D395',
    description: 'Governance token of Compound protocol',
    minBetAmount: '0.02',
  },

  cbBTC: {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029',
    category: 'Wrapped',
    contractAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    chainlinkPriceFeed: '0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D', // BTC/USD on Base
    coingeckoId: 'coinbase-wrapped-btc',
    color: '#F7931A',
    description: 'Coinbase wrapped Bitcoin on Base',
    minBetAmount: '0.0001',
    featured: true,
  },

  // ============ BASE ECOSYSTEM TOKENS ============

  BRETT: {
    symbol: 'BRETT',
    name: 'Brett',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/35755/standard/BRETT.png',
    category: 'Base Ecosystem',
    contractAddress: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    coingeckoId: 'brett',
    color: '#4169E1',
    description: 'Based Brett - Popular Base chain meme token',
    minBetAmount: '100',
    featured: true,
  },

  TOSHI: {
    symbol: 'TOSHI',
    name: 'Toshi',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/31792/standard/toshi.png',
    category: 'Base Ecosystem',
    contractAddress: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4',
    coingeckoId: 'toshi',
    color: '#FF6B35',
    description: 'Toshi - Base mascot token',
    minBetAmount: '1000',
    featured: true,
  },

  BALD: {
    symbol: 'BALD',
    name: 'Bald',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/31083/standard/bald.png',
    category: 'Base Ecosystem',
    contractAddress: '0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8',
    coingeckoId: 'bald',
    color: '#FFD700',
    description: 'BALD - Base ecosystem token',
    minBetAmount: '100',
  },

  NORMIE: {
    symbol: 'NORMIE',
    name: 'Normie',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/36560/standard/normie_logo.jpeg',
    category: 'Base Ecosystem',
    contractAddress: '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200',
    coingeckoId: 'normie',
    color: '#00CED1',
    description: 'Normie token on Base',
    minBetAmount: '1000',
  },

  HIGHER: {
    symbol: 'HIGHER',
    name: 'Higher',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/35687/standard/higher.jpeg',
    category: 'Base Ecosystem',
    contractAddress: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
    coingeckoId: 'higher',
    color: '#9370DB',
    description: 'HIGHER - Community-driven Base token',
    minBetAmount: '100',
    featured: true,
  },

  MOCHI: {
    symbol: 'MOCHI',
    name: 'Mochi',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/37074/standard/mochi.jpeg',
    category: 'Base Ecosystem',
    contractAddress: '0xF6e932Ca12afa26665dC4dDE7e27be02A7c02e50',
    coingeckoId: 'mochi-base',
    color: '#FFB6C1',
    description: 'Mochi token on Base',
    minBetAmount: '1000',
  },

  DEGEN: {
    symbol: 'DEGEN',
    name: 'Degen',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/34515/standard/degen200x200.png',
    category: 'Base Ecosystem',
    contractAddress: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    coingeckoId: 'degen-base',
    color: '#8B00FF',
    description: 'DEGEN - Farcaster ecosystem token on Base',
    minBetAmount: '100',
    featured: true,
  },

  AERO: {
    symbol: 'AERO',
    name: 'Aerodrome Finance',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/31745/standard/token.png',
    category: 'DeFi',
    contractAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    coingeckoId: 'aerodrome-finance',
    color: '#0EA5E9',
    description: 'Native token of Aerodrome DEX on Base',
    minBetAmount: '1',
    featured: true,
  },

  ONCHAIN: {
    symbol: 'ONCHAIN',
    name: 'Onchain',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/37479/standard/onchain.png',
    category: 'Base Ecosystem',
    contractAddress: '0x8c0C84b0BDAF4d8e3d3D5F7F3D3e2B3a4a5D6C7e', // Placeholder - needs verification
    coingeckoId: 'onchain-base',
    color: '#10B981',
    description: 'Onchain token on Base',
    minBetAmount: '100',
  },
};

/**
 * Get tokens by category
 */
export function getTokensByCategory(category: TokenConfig['category']): TokenConfig[] {
  return Object.values(TOKENS).filter((token) => token.category === category);
}

/**
 * Tokens with working Chainlink price feeds on Base Sepolia
 * These are used for on-chain betting resolution
 */
export const BASE_SEPOLIA_CHAINLINK_TOKENS = ['ETH', 'BTC', 'cbBTC'];

/**
 * Get featured tokens (tokens marked as featured in config)
 * These use CoinGecko for display prices
 */
export function getFeaturedTokens(): TokenConfig[] {
  return Object.values(TOKENS).filter((token) => token.featured);
}

/**
 * Check if a token has a working Chainlink price feed on Base Sepolia
 */
export function hasChainlinkFeed(symbol: string): boolean {
  return BASE_SEPOLIA_CHAINLINK_TOKENS.includes(symbol);
}

/**
 * Get token by symbol
 */
export function getToken(symbol: string): TokenConfig | undefined {
  return TOKENS[symbol.toUpperCase()];
}

/**
 * Get all token symbols
 */
export function getAllTokenSymbols(): string[] {
  return Object.keys(TOKENS);
}

/**
 * Get tokens with Chainlink price feeds
 */
export function getTokensWithPriceFeeds(): TokenConfig[] {
  return Object.values(TOKENS).filter((token) => token.chainlinkPriceFeed);
}

/**
 * Search tokens by name or symbol
 */
export function searchTokens(query: string): TokenConfig[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(TOKENS).filter(
    (token) =>
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Token categories for filtering
 */
export const TOKEN_CATEGORIES = [
  'All',
  'Featured',
  'Native',
  'Stablecoin',
  'DeFi',
  'Base Ecosystem',
  'Wrapped',
] as const;

export type TokenCategory = typeof TOKEN_CATEGORIES[number];

/**
 * Get tokens for a specific category filter
 */
export function getTokensForCategory(category: TokenCategory): TokenConfig[] {
  if (category === 'All') {
    return Object.values(TOKENS);
  }
  if (category === 'Featured') {
    return getFeaturedTokens();
  }
  return getTokensByCategory(category as TokenConfig['category']);
}

/**
 * Export for use in smart contracts and frontend
 */
export default TOKENS;
