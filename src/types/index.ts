// ============ SECTION 1: BETTING MARKETS ============

export interface Market {
  id: number;
  creator: string;
  description: string;
  category: string;
  endTime: bigint;
  totalYesBets: bigint;
  totalNoBets: bigint;
  minBet: bigint;
  resolved: boolean;
  winningOutcome: boolean | null;
  createdAt: bigint;
}

export interface Bet {
  marketId: number;
  bettor: string;
  outcome: boolean; // true = YES, false = NO
  amount: bigint;
  timestamp: bigint;
  claimed: boolean;
}

export interface UserBet extends Bet {
  marketDescription: string;
  marketResolved: boolean;
  marketWinningOutcome: boolean | null;
}

export interface MarketStats {
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: bigint;
  totalBettors: number;
}

export type BetOutcome = 'YES' | 'NO';

export type MarketCategory =
  | 'Sports'
  | 'Politics'
  | 'Entertainment'
  | 'Crypto'
  | 'Custom';

// ============ SECTION 2: P2P WAGERS ============

export interface Wager {
  id: number;
  userA: string;
  userB: string | null;
  stakeAmount: bigint;
  claim: string;
  resolver: string;
  resolved: boolean;
  winner: string | null;
  createdAt: bigint;
  expiryTime: bigint;
  accepted: boolean;
}

export interface WagerStats {
  totalWagers: number;
  activeWagers: number;
  totalVolume: bigint;
  userWins: number;
  userLosses: number;
}

export type WagerStatus = 'Open' | 'Accepted' | 'Resolved' | 'Expired' | 'Cancelled';

// ============ SECTION 3: CRYPTO MARKET PREDICTIONS ============

export interface CryptoPrediction {
  id: number;
  token: string;
  tokenSymbol: string;
  timeframe: number; // in seconds
  startPrice: bigint;
  endPrice: bigint;
  totalUpBets: bigint;
  totalDownBets: bigint;
  resolved: boolean;
  priceWentUp: boolean | null;
  startTime: bigint;
  endTime: bigint;
}

export interface CryptoBet {
  predictionId: number;
  bettor: string;
  direction: boolean; // true = UP, false = DOWN
  amount: bigint;
  timestamp: bigint;
  claimed: boolean;
}

export interface CryptoStats {
  totalPredictions: number;
  activePredictions: number;
  totalVolume: bigint;
  userAccuracy: number; // percentage
}

export type PredictionDirection = 'UP' | 'DOWN';

export type PredictionTimeframe =
  | '1h'
  | '4h'
  | '24h'
  | '7d';

export interface SupportedToken {
  symbol: string;
  name: string;
  address: string;
  priceFeedAddress: string;
  icon?: string;
}

// ============ SHARED TYPES ============

export interface PlatformStats {
  markets: MarketStats;
  wagers: WagerStats;
  crypto: CryptoStats;
  totalUsers: number;
  totalVolumeAllSections: bigint;
}
