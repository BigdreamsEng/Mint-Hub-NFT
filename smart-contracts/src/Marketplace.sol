// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // Ensure the path is correct

contract Marketplace {
    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;

    event Listed(address indexed seller, address indexed nft, uint256 indexed tokenId, uint256 price);
    event Bought(address indexed buyer, address indexed nft, uint256 indexed tokenId, uint256 price);
    event Debug(string message, uint256 value);

    // Change visibility to public
    function listNFT(address nft, uint256 tokenId, uint256 price) public {
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(token.getApproved(tokenId) == address(this), "Marketplace not approved");
        

        listings[nft][tokenId] = Listing(msg.sender, price);
        emit Listed(msg.sender, nft, tokenId, price);
    }

    // Remove nonReentrant modifier
    function buyNFT(address nft, uint256 tokenId) public payable {
        Listing memory listing = listings[nft][tokenId];

        // Debugging
        emit Debug("NFT price", listing.price);
        emit Debug("Ether sent", msg.value);

        require(listing.price > 0, "NFT not listed");
        require(msg.value >= listing.price, "Insufficient funds");

        // Remove the listing
        delete listings[nft][tokenId];

        // Transfer the NFT to the buyer
        IERC721 token = IERC721(nft);
        token.safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Transfer the funds to the seller
        payable(listing.seller).transfer(listing.price);

        emit Bought(msg.sender, nft, tokenId, listing.price);
    }

    // Batch list NFTs
    function listNFTsBatch(address[] memory nftAddresses, uint256[] memory tokenIds, uint256[] memory prices) public {
        require(nftAddresses.length == tokenIds.length && nftAddresses.length == prices.length, "Invalid input lengths");
        for (uint256 i = 0; i < nftAddresses.length; i++) {
            listNFT(nftAddresses[i], tokenIds[i], prices[i]);
        }
    }

    // Batch buy NFTs
    function buyNFTsBatch(address[] memory nftAddresses, uint256[] memory tokenIds) public payable {
        require(nftAddresses.length == tokenIds.length, "Invalid input lengths");
        for (uint256 i = 0; i < nftAddresses.length; i++) {
            buyNFT(nftAddresses[i], tokenIds[i]);
        }
    }
}
