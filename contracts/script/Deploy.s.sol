// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BettingMarket.sol";
import "../src/P2PWagers.sol";
import "../src/CryptoMarketBets.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy BettingMarket
        BettingMarket bettingMarket = new BettingMarket();
        console.log("BettingMarket deployed to:", address(bettingMarket));

        // Deploy P2PWagers
        P2PWagers p2pWagers = new P2PWagers();
        console.log("P2PWagers deployed to:", address(p2pWagers));

        // Deploy CryptoMarketBets
        CryptoMarketBets cryptoMarketBets = new CryptoMarketBets();
        console.log("CryptoMarketBets deployed to:", address(cryptoMarketBets));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("BettingMarket:", address(bettingMarket));
        console.log("P2PWagers:", address(p2pWagers));
        console.log("CryptoMarketBets:", address(cryptoMarketBets));
    }
}
