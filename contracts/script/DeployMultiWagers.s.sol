// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MultiParticipantWagers.sol";

contract DeployMultiWagersScript is Script {
    function run() external {
        // USDbC (Bridged USDC) on Base Sepolia
        address usdcToken = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

        vm.startBroadcast();

        // Deploy MultiParticipantWagers contract with USDC token
        MultiParticipantWagers wagers = new MultiParticipantWagers(usdcToken);

        console.log("MultiParticipantWagers deployed to:", address(wagers));
        console.log("Using USDC Token:", usdcToken);

        vm.stopBroadcast();
    }
}
