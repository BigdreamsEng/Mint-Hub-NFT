// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Importing Script and console from forge-std
import {Script, console} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";  // Assuming Counter.sol is in the src folder

contract CounterScript is Script {
    Counter public counter;

    function setUp() public {
        // Optional setup logic, if needed
    }

    function run() public {
        vm.startBroadcast();

        // Deploy a new instance of the Counter contract
        counter = new Counter();

        vm.stopBroadcast();
    }
}
