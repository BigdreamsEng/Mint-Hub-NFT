// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/NFT.sol";
import "../src/Marketplace.sol";

contract NFTMarketplaceTest is Test {
    NFT public nft;
    Marketplace public marketplace; // Corrected from NFTMarketplace to Marketplace
    address public owner;
    address public buyer;

    function setUp() public {
        owner = vm.addr(1);  // Setting the first account as the owner
        buyer = vm.addr(2);  // Setting the second account as the buyer

        // Deploy the NFT contract and Marketplace contract using the owner account
        vm.prank(owner);  
        nft = new NFT();

        vm.prank(owner);  
        marketplace = new Marketplace(); // Corrected from NFTMarketplace to Marketplace

        // Mint NFT to the owner
        vm.startPrank(owner);  
        nft.mint(owner);
        nft.approve(address(marketplace), 0);  
        marketplace.listNFT(address(nft), 0, 1 ether);  // Ensure correct tokenId
        vm.stopPrank();  
    }

    function testListNFT() public {
        (address seller, uint256 price) = marketplace.listings(address(nft), 0);
        assertEq(seller, owner);
        assertEq(price, 1 ether);
    }

    function testBuyNFT() public {
        // Give buyer some Ether to purchase the NFT
        vm.deal(buyer, 2 ether);

        vm.startPrank(buyer);  
        marketplace.buyNFT{value: 1 ether}(address(nft), 0);
        vm.stopPrank();

        // Verify that the buyer now owns the NFT
        assertEq(nft.ownerOf(0), buyer);
    }

    function testCannotListNFTTwice() public {
        vm.startPrank(owner);
        marketplace.listNFT(address(nft), 0, 1 ether);
        vm.expectRevert("NFT already listed");
        marketplace.listNFT(address(nft), 0, 1 ether);
        vm.stopPrank();
    }

    function testCannotBuySoldNFT() public {
    // Buyer buys the NFT first
    vm.startPrank(buyer);  
    marketplace.buyNFT{value: 1 ether}(address(nft), 0);
    vm.stopPrank();
    
    // Now try to buy it again
    vm.expectRevert("NFT not listed");
    vm.startPrank(buyer);  
    marketplace.buyNFT{value: 1 ether}(address(nft), 0); 
    vm.stopPrank();
    }


    function testCannotListNFTNotOwned() public {
        vm.prank(address(0x1234));  
        vm.expectRevert("Not the owner");
        marketplace.listNFT(address(nft), 0, 1 ether);
    }

    function testSellerReceivesPayment() public {
        vm.startPrank(owner);
        marketplace.listNFT(address(nft), 0, 1 ether);

        // Capture the initial balance of the seller
        uint256 sellerInitialBalance = address(owner).balance; // Ensure you're checking the owner's balance

        vm.stopPrank();

        // Buyer purchases the NFT
        vm.startPrank(buyer);
        vm.deal(buyer, 2 ether);
        marketplace.buyNFT{value: 1 ether}(address(nft), 0);
        vm.stopPrank();

        // Check if the seller's balance increased by the sale amount
        uint256 sellerFinalBalance = address(owner).balance;
        assertEq(sellerFinalBalance, sellerInitialBalance + 1 ether);
    }

    function testCannotBuyWithInsufficientEther() public {
        vm.startPrank(owner);
        marketplace.listNFT(address(nft), 0, 1 ether);

        // Try to buy with insufficient Ether (should revert)
        vm.expectRevert("Insufficient funds");
        marketplace.buyNFT{value: 0.5 ether}(address(nft), 0);
        vm.stopPrank();
    }
}
