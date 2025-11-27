# WagerX Deployment Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Live Deployment](#live-deployment)
3. [Smart Contracts](#smart-contracts)
4. [Revenue System](#revenue-system)
5. [Architecture](#architecture)
6. [Deployment History](#deployment-history)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**WagerX** is a decentralized prediction market and P2P betting platform built on Base Sepolia (testnet). Users can:
- **Market Betting**: Predict crypto price movements (UP/DOWN) using Chainlink oracles
- **P2P Wagers**: Create multi-participant peer-to-peer wagers with custom claims
- **Leaderboard**: Track wins, losses, and points across the platform
- **Dual Currency**: Support for both ETH and USDC betting

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Smart Contracts**: Solidity 0.8.20, Foundry
- **Web3**: wagmi v2, RainbowKit, viem
- **Hosting**: Vercel (frontend), Base Sepolia (contracts)
- **Price Data**: Chainlink (on-chain), CoinGecko (display)

---

## 🌐 Live Deployment

### Production URLs
- **Website**: https://wagerx-v2-qzglt30r9-damilolas-projects-fafdf859.vercel.app
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **RPC**: https://base-sepolia-rpc.publicnode.com

### Quick Links
- **Base Sepolia Block Explorer**: https://sepolia.basescan.org
- **Faucets**:
  - ETH: https://www.alchemy.com/faucets/base-sepolia
  - USDC: https://faucet.circle.com

---

## 📜 Smart Contracts

### Deployed Contracts (Base Sepolia)

#### 1. CryptoMarketBets (Market Betting)
**Address**: `0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34`

**Features**:
- Create time-based price predictions for crypto assets
- Parimutuel betting model (users bet against each other)
- Chainlink price feeds for automatic resolution
- Support for ETH and USDC
- 5% platform fee

**Supported Assets** (with Chainlink feeds):
- ETH/USD: `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`
- BTC/USD: `0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298`
- cbBTC/USD: `0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D`
- cbETH/USD: `0xd7818272B9e248357d13057AAb0B417aF31E817d`
- USDC/USD: `0x7e860098F58bBFC8648a4311b374B1D669a2bc6B`
- DAI/USD: `0x591e79239a7d679378eC8c847e5038150364C78F`

**Key Functions**:
```solidity
createPrediction(tokenSymbol, timeframe) → predictionId
placePrediction(predictionId, direction, amount)
placePredictionWithEth(predictionId, direction) payable
autoResolvePrediction(predictionId)
claimWinnings(predictionId)
```

#### 2. MultiParticipantWagers (P2P Wagers)
**Address**: `0xf995a55a170314586eC52399D57d3761A9867599`

**Features**:
- Multi-participant peer-to-peer betting (2-10 players)
- Custom claims/arguments
- Designated resolver for outcome determination
- Public and private wagers
- Support for ETH and USDC
- 5% platform fee

**Key Functions**:
```solidity
createWager(claim, resolver, expiryTime, isPublic, maxParticipants, stakeAmount) → wagerId
createWagerWithEth(claim, resolver, expiryTime, isPublic, maxParticipants) payable → wagerId
joinWager(wagerId)
joinWagerWithEth(wagerId) payable
resolveWager(wagerId, winner)
refundWager(wagerId)
```

---

## 💰 Revenue System

### Platform Fee Structure
- **Current Fee**: 5% (updated from 2%)
- **Applied On**: All bets and wagers
- **Fee Type**: Deducted from winner's payout
- **Model**: Low-risk parimutuel (no house liability)

### Revenue Calculation Examples

#### Market Betting Example
```
Total UP bets:   10 ETH (5 users)
Total DOWN bets: 10 ETH (5 users)
Price goes UP

Platform Revenue: (20 ETH × 5%) = 1 ETH
Winner Payout:    19 ETH (distributed to UP bettors)
Loser Loss:       10 ETH (goes to winners)
```

#### P2P Wager Example
```
4-player wager at 1 ETH each
Total pot: 4 ETH
Winner selected by resolver

Platform Revenue: (4 ETH × 5%) = 0.2 ETH
Winner Payout:    3.8 ETH
```

### Fee Withdrawal
```bash
# Withdraw USDC fees (Market Betting)
cast send 0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34 "withdrawFees()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY

# Withdraw ETH fees (Market Betting)
cast send 0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34 "withdrawEthFees()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY

# Withdraw USDC fees (Wagers)
cast send 0xf995a55a170314586eC52399D57d3761A9867599 "withdrawFees()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY

# Withdraw ETH fees (Wagers)
cast send 0xf995a55a170314586eC52399D57d3761A9867599 "withdrawEthFees()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY
```

---

## 🏗️ Architecture

### Frontend Structure
```
src/
├── app/
│   ├── crypto/          # Market Betting page
│   ├── wagers/          # P2P Wagers page
│   ├── markets/         # Legacy betting (deprecated)
│   ├── leaderboard/     # User rankings
│   └── my-bets/         # User bet history
├── components/
│   ├── layout/          # MainNav, Footer
│   └── crypto/          # TokenChart, betting UI
├── hooks/
│   ├── useCryptoMarketBets.ts    # Market Betting hooks
│   ├── useMultiWagers.ts         # P2P Wagers hooks
│   ├── useCoinGeckoPrice.ts      # Display prices
│   └── usePoints.ts              # Points system
├── lib/
│   ├── wagmi.ts         # Web3 configuration
│   ├── priceApi.ts      # CoinGecko integration
│   └── points.ts        # Points calculation
└── config/
    └── tokens.config.ts # Token metadata & Chainlink feeds
```

### Key Features

#### 1. Dual Price System
- **CoinGecko**: Display prices (all tokens, free API)
- **Chainlink**: On-chain oracle prices (betting resolution)
- Only tokens with Chainlink feeds can be bet on

#### 2. Points System
```typescript
// Points awarded for activities
WIN_POINTS = 100
LOSE_POINTS = 10
CREATE_MARKET_POINTS = 50
PLACE_BET_POINTS = 20
RESOLVE_MARKET_POINTS = 30
```

#### 3. Potential Payout Calculator
Real-time profit estimation shown to users before betting:
```typescript
// Example: 0.1 ETH bet at 50/50 odds
Potential Win:   0.19 ETH  (0.1 × 2 × 0.95)
Potential Profit: +0.09 ETH
Platform Fee:     5%
```

---

## 📅 Deployment History

### Major Updates

#### November 27, 2025 - Critical Bug Fixes
1. **Price Feed Filter** (9fca31f)
   - Fixed "execution reverted: Price feed not registered" error
   - Created `getFeaturedTokensWithPriceFeeds()` function
   - Now only shows bettable tokens (ETH, BTC, cbBTC, cbETH, USDC, DAI)

2. **Revenue Enhancement** (5b83a95)
   - Increased platform fee from 2% to 5%
   - Added real-time potential payout calculator
   - Updated both contracts on-chain

3. **Faucet Integration** (85a1371)
   - Added faucet dropdown in navigation
   - Links to ETH and USDC Base Sepolia faucets
   - Mobile and desktop responsive

4. **Bet History Filter** (d4a98b9)
   - Moved ended predictions to Bet History section
   - Added "Awaiting Resolution" status badge
   - Improved color scheme for prediction states

#### November 26, 2025 - Live Deployment
- Deployed contracts to Base Sepolia
- Registered Chainlink price feeds
- Fixed USDC decimal formatting (6 vs 18 decimals)
- Resolved contract address migration issues

---

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env.local, .env.production)
```bash
# WalletConnect (required)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_CRYPTO_MARKET_BETS_CONTRACT_ADDRESS=0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34
NEXT_PUBLIC_MULTI_PARTICIPANT_WAGERS_CONTRACT_ADDRESS=0xf995a55a170314586eC52399D57d3761A9867599

# Network
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia
```

#### Vercel Dashboard
**Important**: Vercel environment variables override local .env files!

Update these in Vercel dashboard after contract changes:
1. Go to: https://vercel.com/damilolas-projects-fafdf859/wagerx-v2/settings/environment-variables
2. Update `NEXT_PUBLIC_CRYPTO_MARKET_BETS_CONTRACT_ADDRESS`
3. Update `NEXT_PUBLIC_MULTI_PARTICIPANT_WAGERS_CONTRACT_ADDRESS`
4. Redeploy

### Smart Contract Configuration

#### Update Platform Fee (0-10%)
```bash
# Market Betting
cast send 0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34 \
  "updatePlatformFee(uint256)" 5 \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY

# Wagers
cast send 0xf995a55a170314586eC52399D57d3761A9867599 \
  "updatePlatformFee(uint256)" 5 \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY
```

#### Add New Price Feed
```bash
cast send 0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34 \
  "addPriceFeed(string,address)" "SOL" "0x..." \
  --rpc-url https://base-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "execution reverted: Price feed not registered"
**Cause**: Token doesn't have a Chainlink price feed registered
**Solution**: Only bet on tokens shown in the Market Betting UI (they're pre-filtered)

#### 2. "execution reverted" on bet placement
**Possible causes**:
- Insufficient ETH/USDC balance
- Haven't approved USDC spending
- Betting on expired prediction
- Contract paused

**Fix**:
```bash
# Check if you need to approve USDC
# USDC contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e (Base Sepolia)
```

#### 3. Wagers showing 0.0000 USDC
**Cause**: Using formatEth() on USDC amounts (wrong decimal precision)
**Fixed in**: Version with proper formatUsdc() function

#### 4. Live prices not showing
**Cause**: CoinGecko API rate limiting or import errors
**Check**: src/lib/priceApi.ts - ensure `import { TOKENS }` not `import TOKENS`

#### 5. Transactions not going through on Vercel
**Cause**: Vercel using old contract address from environment variables
**Fix**: Update environment variables in Vercel dashboard and redeploy

---

## 🚀 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
```

### Smart Contracts
```bash
cd contracts
forge build          # Compile contracts
forge test           # Run tests
forge test -vvv      # Verbose test output

# Deploy contracts
forge script script/DeployMarketBets.s.sol:DeployScript \
  --rpc-url base_sepolia \
  --broadcast \
  --verify
```

---

## 📊 Analytics & Monitoring

### Track Platform Metrics
```bash
# Get total predictions
cast call 0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34 "predictionCounter()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com

# Get total wagers
cast call 0xf995a55a170314586eC52399D57d3761A9867599 "wagerCounter()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com

# Get current platform fee
cast call 0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34 "platformFeePercent()" \
  --rpc-url https://base-sepolia-rpc.publicnode.com
```

### Check User Stats
```bash
cast call 0xf995a55a170314586eC52399D57d3761A9867599 \
  "getUserStats(address)" "0xYourAddress" \
  --rpc-url https://base-sepolia-rpc.publicnode.com
```

---

## 🔐 Security Considerations

### Current Security Measures
- Platform fee capped at 10% in smart contracts
- Resolver cannot join wagers they're resolving
- Refund mechanism for expired wagers
- Separate ETH and USDC accounting

### Before Mainnet Deployment
1. ✅ Professional smart contract audit required
2. ✅ Add reentrancy guards (OpenZeppelin ReentrancyGuard)
3. ✅ Implement emergency pause mechanism
4. ✅ Multi-sig wallet for contract ownership
5. ✅ Legal review for gambling regulations
6. ✅ Implement rate limiting on contract interactions
7. ✅ Add circuit breakers for unusual activity

---

## 📝 License
MIT License - See LICENSE file for details

---

**Built with ❤️ on Base**
