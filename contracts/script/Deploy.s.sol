// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BettingMarket.sol";
import "../src/P2PWagers.sol";
import "../src/CryptoMarketBets.sol";

contract DeployScript is Script {
    function run() external {
        // USDbC (Bridged USDC) on Base Sepolia
        address usdcToken = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

        vm.startBroadcast();

        // Deploy BettingMarket (Note: This contract doesn't use ERC-20 yet)
        BettingMarket bettingMarket = new BettingMarket();
        console.log("BettingMarket deployed to:", address(bettingMarket));

        // Deploy P2PWagers with USDC token
        P2PWagers p2pWagers = new P2PWagers(usdcToken);
        console.log("P2PWagers deployed to:", address(p2pWagers));

        // Deploy CryptoMarketBets with USDC token
        CryptoMarketBets cryptoMarketBets = new CryptoMarketBets(usdcToken);
        console.log("CryptoMarketBets deployed to:", address(cryptoMarketBets));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("BettingMarket:", address(bettingMarket));
        console.log("P2PWagers:", address(p2pWagers));
        console.log("CryptoMarketBets:", address(cryptoMarketBets));
        console.log("Using USDC Token:", usdcToken);
    }
}
