# WagerX - Decentralized Prediction Markets

![WagerX Banner](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=ethereum)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)

> 🎲 Decentralized prediction markets and P2P betting platform powered by Chainlink oracles on Base L2

## 🌟 Features

### Market Betting
- **Price Predictions**: Bet on crypto price movements (UP/DOWN)
- **Chainlink Oracles**: Automated resolution with real-time price feeds
- **Live Prices**: CoinGecko integration for display prices
- **Flexible Timeframes**: 15s to 24h prediction windows
- **Dual Currency**: Support for ETH and USDC

### P2P Wagers
- **Multi-Participant**: 2-10 players per wager
- **Custom Claims**: Create any type of bet
- **Designated Resolver**: Trusted third-party resolution
- **Public/Private**: Control wager visibility
- **Winner-Takes-All**: Automated payouts

### Platform Features
- **🏆 Leaderboard**: Track wins, losses, and points
- **📊 Real-time Analytics**: Live payout calculator
- **💰 Low Platform Fee**: Only 5% (parimutuel model)
- **🔐 Non-Custodial**: Your keys, your funds
- **⚡ Fast Settlement**: Instant on-chain resolution

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Wallet with Base Sepolia ETH
- [WalletConnect Project ID](https://cloud.walletconnect.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wagerx.git
cd wagerx

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

# Start development server
npm run dev
```

Visit `http://localhost:3000` 🎉

### Get Testnet Tokens
- **ETH**: [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- **USDC**: [Circle Testnet Faucet](https://faucet.circle.com)

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines for AI assistants

## 🏗️ Architecture

```
WagerX
├── Frontend (Next.js 14)
│   ├── Market Betting UI
│   ├── P2P Wagers Interface
│   ├── Leaderboard & Analytics
│   └── Web3 Integration (wagmi v2)
│
├── Smart Contracts (Solidity 0.8.20)
│   ├── CryptoMarketBets.sol     # Price predictions
│   ├── MultiParticipantWagers.sol # P2P betting
│   └── Chainlink Integration
│
└── Infrastructure
    ├── Base Sepolia L2
    ├── Chainlink Price Feeds
    └── CoinGecko API
```

## 💡 How It Works

### Market Betting
1. User selects token (ETH, BTC, etc.)
2. Chooses direction (UP/DOWN) and timeframe
3. Places bet with ETH or USDC
4. Chainlink oracle resolves at timeframe end
5. Winners claim proportional share (minus 5% fee)

### P2P Wagers
1. Creator sets claim, stake, and resolver
2. Participants join by matching stake
3. Resolver determines winner after expiry
4. Winner receives entire pool (minus 5% fee)

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS |
| **Smart Contracts** | Solidity 0.8.20, Foundry |
| **Web3** | wagmi v2, viem, RainbowKit |
| **Oracles** | Chainlink Price Feeds |
| **Network** | Base Sepolia (testnet) |
| **Hosting** | Vercel |

## 📊 Smart Contracts

### Deployed Addresses (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| CryptoMarketBets | `0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34` | Market predictions |
| MultiParticipantWagers | `0xf995a55a170314586eC52399D57d3761A9867599` | P2P wagers |

### Supported Assets (with Chainlink Feeds)
- ETH/USD
- BTC/USD
- cbBTC/USD
- cbETH/USD
- USDC/USD
- DAI/USD

[View on BaseScan](https://sepolia.basescan.org/address/0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34)

## 💰 Revenue Model

**Parimutuel Betting System**
- Users bet against each other (not the house)
- 5% platform fee on all payouts
- Zero risk for platform (no liability)
- Winners split the total pool proportionally

**Example:**
```
Total Bets: 10 ETH
Platform Fee: 0.5 ETH (5%)
Winner Payout: 9.5 ETH
```

## 🛡️ Security

### Current Measures
- ✅ Non-custodial (users control funds)
- ✅ Chainlink oracle integration
- ✅ Platform fee capped at 10%
- ✅ Refund mechanism for expired wagers
- ✅ Separate ETH/USDC accounting

### Before Mainnet
- ⚠️ Professional smart contract audit required
- ⚠️ Add reentrancy guards
- ⚠️ Implement emergency pause
- ⚠️ Multi-sig wallet ownership
- ⚠️ Legal review for gambling regulations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [wagerx.vercel.app](https://wagerx-v2-qzglt30r9-damilolas-projects-fafdf859.vercel.app)
- **Documentation**: [View Docs](./DEPLOYMENT_GUIDE.md)

## ⚠️ Disclaimer

**This is a testnet deployment for demonstration purposes only.**

- Uses Base Sepolia testnet (no real money)
- Smart contracts have NOT been audited
- NOT for production use
- Gambling may be regulated in your jurisdiction
- Use at your own risk

## 🙏 Acknowledgments

- [Chainlink](https://chain.link/) - Decentralized oracle network
- [Base](https://base.org/) - Ethereum L2 by Coinbase
- [Foundry](https://getfoundry.sh/) - Smart contract development
- [wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI

---

**Built with ❤️ on Base**
