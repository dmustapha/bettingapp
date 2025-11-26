# WagerX Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Production ready"
git push
```

### Step 2: Deploy on Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure environment variables (see below)
6. Click "Deploy"

### Step 3: Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_CRYPTO_MARKET_BETS_CONTRACT_ADDRESS=0x23AEAB74BA6fcD126b5EBe2070d6568a9636D9B1
NEXT_PUBLIC_MULTI_PARTICIPANT_WAGERS_CONTRACT_ADDRESS=0x2A92E519c29fA441b71858398Ef0AB535eC14B7f
NEXT_PUBLIC_CHAIN_ID=84532
```

**Get WalletConnect Project ID:**
- Go to [cloud.walletconnect.com](https://cloud.walletconnect.com/)
- Create a project
- Copy the Project ID

### Step 4: Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `wagerx.io`)
3. Update DNS records as instructed
4. SSL is automatic

---

## 📦 Alternative: Deploy with Docker

### Build and Run
```bash
# Build the Docker image
docker build -t wagerx .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id \
  -e NEXT_PUBLIC_CRYPTO_MARKET_BETS_CONTRACT_ADDRESS=0x23AEAB74BA6fcD126b5EBe2070d6568a9636D9B1 \
  -e NEXT_PUBLIC_MULTI_PARTICIPANT_WAGERS_CONTRACT_ADDRESS=0x2A92E519c29fA441b71858398Ef0AB535eC14B7f \
  -e NEXT_PUBLIC_CHAIN_ID=84532 \
  wagerx
```

### Deploy to Cloud Platforms

**Railway:**
```bash
railway login
railway init
railway up
```

**Render:**
1. Connect your GitHub repo
2. Select "Web Service"
3. Add environment variables
4. Deploy

---

## 🌐 Moving to Mainnet

### 1. Deploy Contracts to Base Mainnet
```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### 2. Update Environment Variables
```
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CRYPTO_MARKET_BETS_CONTRACT_ADDRESS=<new_mainnet_address>
NEXT_PUBLIC_MULTI_PARTICIPANT_WAGERS_CONTRACT_ADDRESS=<new_mainnet_address>
```

### 3. Register Price Feeds
Update `register-price-feeds.sh` with mainnet contract addresses and run:
```bash
./register-price-feeds.sh
```

---

## ✅ Pre-Deployment Checklist

- [ ] All tests pass: `npm run build`
- [ ] Environment variables configured
- [ ] WalletConnect Project ID obtained
- [ ] Contracts deployed to target network
- [ ] Price feeds registered
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics setup (optional)

---

## 🔧 Monitoring & Maintenance

### Check Deployment Status
```bash
# View build logs
vercel logs

# Check deployment URL
vercel domains ls
```

### Update Production
```bash
# Automatic on git push
git push origin main

# Or manual
vercel --prod
```

---

## 📊 Post-Deployment

1. **Test all features:**
   - Wallet connection
   - Market betting (ETH & USDC)
   - Wager creation (ETH & USDC)
   - Price feeds accuracy

2. **Monitor:**
   - Vercel Analytics
   - Error tracking
   - Gas costs

3. **Announce:**
   - Social media
   - Discord/Telegram
   - Product Hunt

---

## 🆘 Troubleshooting

**Build fails:**
- Check Node version (18+)
- Clear cache: `vercel --force`
- Verify environment variables

**Wallet connection issues:**
- Confirm WalletConnect Project ID
- Check network configuration
- Verify RPC endpoints

**Contract errors:**
- Verify contract addresses
- Check network (testnet vs mainnet)
- Ensure price feeds registered

---

## 📝 Notes

- **Current deployment:** Base Sepolia (Testnet)
- **For mainnet:** Update chain ID and redeploy contracts
- **Cost:** Vercel free tier is sufficient for MVP
- **Domain:** Recommended for production (wagerx.io, wagerx.app, etc.)
