// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UserProfile.sol";

contract DeployUserProfile is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        UserProfile userProfile = new UserProfile();

        console.log("UserProfile deployed to:", address(userProfile));

        vm.stopBroadcast();
    }
}
