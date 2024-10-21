// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, Ownable {
    uint256 public nextTokenId;

    // Pass msg.sender to the Ownable constructor
    constructor() ERC721('NFT Marketplace Token', 'NMT') Ownable(msg.sender) {
    }

    function mint(address to) external onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.nftmarketplace.com/metadata/";
    }
}
