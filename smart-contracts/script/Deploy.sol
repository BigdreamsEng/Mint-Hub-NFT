// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Marketplace.sol";
import "../src/NFT.sol";  // Adjust the path if necessary

contract Deploy is Script {
    function run() external {
        vm.startBroadcast(); // Start transaction broadcast

        NFT nft = new NFT(); // Deploy the NFT contract
        Marketplace marketplace = new Marketplace(); // Deploy the Marketplace contract

        vm.stopBroadcast(); // Stop transaction broadcast
    }
}
