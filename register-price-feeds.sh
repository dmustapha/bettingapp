#!/bin/bash

# Script to register Chainlink price feeds in the CryptoMarketBets contract
# Base Sepolia Network

CONTRACT_ADDRESS="0x65328b5E7151d2AA62703756bcD2CC0Bd4960E34"
RPC_URL="https://base-sepolia-rpc.publicnode.com"
PRIVATE_KEY="0x7b6dd9c73418c0f950ab2559a44f1c77751e9cd59dcc7a97287e6b3a40b0befc"

echo "Registering Price Feeds for CryptoMarketBets Contract..."
echo "==========================================================="

# ETH/USD Price Feed
echo "Registering ETH price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "ETH" "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# BTC/USD Price Feed
echo "Registering BTC price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "BTC" "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# cbETH/USD Price Feed
echo "Registering cbETH price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "cbETH" "0xd7818272B9e248357d13057AAb0B417aF31E817d" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# USDC/USD Price Feed
echo "Registering USDC price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "USDC" "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# DAI/USD Price Feed
echo "Registering DAI price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "DAI" "0x591e79239a7d679378eC8c847e5038150364C78F" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# WETH uses same feed as ETH
echo "Registering WETH price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "WETH" "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# USDbC uses same feed as USDC
echo "Registering USDbC price feed..."
cast send $CONTRACT_ADDRESS \
  "addPriceFeed(string,address)" \
  "USDbC" "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

echo ""
echo "==========================================================="
echo "✓ Price feed registration complete!"
echo "You can now place bets on: ETH, BTC, cbETH, cbBTC, WETH, USDC, USDbC, DAI"
