import { Address } from 'viem';

// Contract ABI for BettingMarket
export const BETTING_MARKET_ABI = [
  {
    type: 'function',
    name: 'createMarket',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'description', type: 'string' },
      { name: 'endTime', type: 'uint256' },
      { name: 'minBet', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'placeBet',
    stateMutability: 'payable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'outcome', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'resolveMarket',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'winningOutcome', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimWinnings',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getMarket',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'description', type: 'string' },
          { name: 'endTime', type: 'uint256' },
          { name: 'totalYesBets', type: 'uint256' },
          { name: 'totalNoBets', type: 'uint256' },
          { name: 'minBet', type: 'uint256' },
          { name: 'resolved', type: 'bool' },
          { name: 'winningOutcome', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getOdds',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [
      { name: 'yesOdds', type: 'uint256' },
      { name: 'noOdds', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getUserBets',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'marketId', type: 'uint256' },
          { name: 'bettor', type: 'address' },
          { name: 'outcome', type: 'bool' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'calculatePayout',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'betAmount', type: 'uint256' },
      { name: 'outcome', type: 'bool' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'marketCounter',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'platformFeePercent',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'MarketCreated',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'description', type: 'string', indexed: false },
      { name: 'endTime', type: 'uint256', indexed: false },
      { name: 'minBet', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BetPlaced',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true },
      { name: 'bettor', type: 'address', indexed: true },
      { name: 'outcome', type: 'bool', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'MarketResolved',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true },
      { name: 'winningOutcome', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WinningsClaimed',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true },
      { name: 'claimer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;

// Contract address - Deployed on Base Sepolia
export const BETTING_MARKET_ADDRESS = (process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS ||
  '0x6593e48F29E3eC721869D7a98d63D0aD83EFA7b3') as Address;

// Check if contract is deployed
export const isContractDeployed = () => {
  return BETTING_MARKET_ADDRESS !== '0x0000000000000000000000000000000000000000';
};
