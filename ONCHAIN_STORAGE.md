# On-Chain User Profile Storage

This document explains the on-chain data storage system for CryptoWager, which remembers users and their activity when they reconnect their wallets.

## Overview

User data is stored directly on the blockchain using a smart contract. When users connect their wallet, their profile is automatically loaded from the blockchain, showing their:
- Username
- Total wagers placed
- Total amount won
- Total amount lost
- Win rate percentage
- Last activity timestamp

## Smart Contract

### UserProfile.sol

The `UserProfile` contract stores all user data on-chain. Key features:

- **setProfile(username)**: Create or update username
- **recordWager(amount, won)**: Record wager results automatically
- **getProfile(address)**: Retrieve full user profile
- **getWinRate(address)**: Calculate win rate percentage

## How It Works

### 1. Automatic Profile Loading

When a user connects their wallet:
```typescript
// Automatically triggered by UserProfileProvider
useEffect(() => {
  if (isConnected && address) {
    console.log('Loading user profile from blockchain...');
    // Profile data is fetched from smart contract
    refetch();
  }
}, [isConnected, address]);
```

### 2. Using User Profile in Components

```typescript
import { useUserProfileContext } from '@/components/UserProfileProvider';

function MyComponent() {
  const { profile, hasProfile, isLoading } = useUserProfileContext();

  if (isLoading) return <div>Loading profile...</div>;

  if (hasProfile) {
    return (
      <div>
        <h2>Welcome back, {profile.username}!</h2>
        <p>Win Rate: {profile.winRate}%</p>
        <p>Total Wagers: {profile.totalWagers.toString()}</p>
      </div>
    );
  }

  return <div>Create your profile!</div>;
}
```

### 3. Recording Wager Results

```typescript
import { useRecordWager } from '@/hooks/useUserProfile';

function WagerComponent() {
  const { recordWager, isPending } = useRecordWager();

  const handleWagerComplete = async (amount: bigint, won: boolean) => {
    try {
      const hash = await recordWager(amount, won);
      console.log('Wager recorded on-chain:', hash);
    } catch (error) {
      console.error('Failed to record wager:', error);
    }
  };
}
```

## Deployment

### Step 1: Set up environment

Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

### Step 2: Deploy to Base Sepolia (Testnet)

```bash
source ~/.zshenv
forge script script/DeployUserProfile.s.sol:DeployUserProfile \\
  --rpc-url $BASE_SEPOLIA_RPC \\
  --broadcast \\
  --verify
```

### Step 3: Update Contract Address

After deployment, update the contract address in:
```typescript
// src/contracts/userProfileABI.ts
export const USER_PROFILE_CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

### Step 4: Deploy to Base Mainnet (Production)

```bash
forge script script/DeployUserProfile.s.sol:DeployUserProfile \\
  --rpc-url https://mainnet.base.org \\
  --broadcast \\
  --verify
```

## Available Hooks

### useUserProfile()

Fetches and monitors user profile data automatically.

Returns:
- `profile`: User profile object or null
- `isLoading`: Loading state
- `hasProfile`: Boolean indicating if profile exists
- `refetch`: Function to manually refresh profile

### useUpdateProfile()

Updates user's profile information.

```typescript
const { updateProfile, isPending, isSuccess } = useUpdateProfile();

await updateProfile("MyUsername");
```

### useRecordWager()

Records wager results on-chain.

```typescript
const { recordWager, isPending, isSuccess } = useRecordWager();

// Record a win
await recordWager(parseEther("0.1"), true);

// Record a loss
await recordWager(parseEther("0.1"), false);
```

## Benefits

✅ **Decentralized**: No central database, all data on blockchain
✅ **Persistent**: Data survives across sessions and devices
✅ **Transparent**: All activity is publicly verifiable
✅ **Ownership**: Users own their data via their wallet
✅ **Automatic**: Profile loads immediately when wallet connects

## Gas Costs

Approximate gas costs on Base:
- Create profile: ~50,000 gas (~$0.01-0.05)
- Update username: ~30,000 gas
- Record wager: ~35,000 gas

## Security

- Only the wallet owner can modify their profile
- All data is publicly readable
- Wager results are recorded immutably
- No admin or centralized control

## Future Enhancements

- [ ] Profile avatars (IPFS integration)
- [ ] Achievement NFTs
- [ ] Friend lists and social features
- [ ] Reputation scores
- [ ] Betting history with detailed records
