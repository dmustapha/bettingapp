// Token addresses and configuration for Base Sepolia and Base Mainnet

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: `0x${string}` | 'native';
  icon: string;
  comingSoon?: boolean;
}

export const BASE_SEPOLIA_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: 'native',
    icon: '⟠',
    comingSoon: false,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    icon: '💵',
    comingSoon: true, // Coming soon - requires contract upgrade
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x0000000000000000000000000000000000000000', // Placeholder
    icon: '💲',
    comingSoon: true, // Coming soon - requires contract upgrade
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    address: '0x4200000000000000000000000000000000000006',
    icon: '⟠',
    comingSoon: true, // Coming soon - requires contract upgrade
  },
};

export const BASE_MAINNET_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: 'native',
    icon: '⟠',
    comingSoon: false,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    icon: '💵',
    comingSoon: true,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    icon: '💲',
    comingSoon: true,
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    address: '0x4200000000000000000000000000000000000006',
    icon: '⟠',
    comingSoon: true,
  },
};

// Get tokens based on chain ID
export function getTokensByChainId(chainId: number): Record<string, TokenInfo> {
  if (chainId === 84532) {
    return BASE_SEPOLIA_TOKENS;
  } else if (chainId === 8453) {
    return BASE_MAINNET_TOKENS;
  }
  return BASE_SEPOLIA_TOKENS; // Default to testnet
}

// Get available tokens (not coming soon)
export function getAvailableTokens(chainId: number): TokenInfo[] {
  const tokens = getTokensByChainId(chainId);
  return Object.values(tokens).filter(token => !token.comingSoon);
}

// Get all tokens including coming soon
export function getAllTokens(chainId: number): TokenInfo[] {
  const tokens = getTokensByChainId(chainId);
  return Object.values(tokens);
}
