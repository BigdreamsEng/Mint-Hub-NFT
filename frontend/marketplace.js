// Replace these with your deployed contract addresses and ABI
const marketplaceAddress = "YOUR_MARKETPLACE_CONTRACT_ADDRESS";
const myNFTAddress = "YOUR_MYNFT_CONTRACT_ADDRESS";
const marketplaceABI = [/* Your Marketplace ABI here */];
const myNFTABI = [/* Your MyNFT ABI here */];

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

const marketplaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);
const myNFTContract = new web3.eth.Contract(myNFTABI, myNFTAddress);

document.getElementById("mintForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const recipientAddress = document.getElementById("mintAddress").value;
    const tokenURI = document.getElementById("tokenURI").value;

    const accounts = await web3.eth.getAccounts();

    try {
        const result = await myNFTContract.methods.createNFT(recipientAddress, tokenURI).send({ from: accounts[0] });
        document.getElementById("message").innerText = `NFT minted successfully! Token ID: ${result.events.Transfer.returnValues.tokenId}`;
    } catch (error) {
        document.getElementById("message").innerText = `Error minting NFT: ${error.message}`;
    }
});

document.getElementById("listForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nftAddress = document.getElementById("nftAddress").value;
    const tokenId = document.getElementById("tokenId").value;
    const price = document.getElementById("price").value;

    const accounts = await web3.eth.getAccounts();

    try {
        await marketplaceContract.methods.listItem(nftAddress, tokenId, price).send({ from: accounts[0] });
        document.getElementById("message").innerText = "NFT listed successfully!";
    } catch (error) {
        document.getElementById("message").innerText = `Error listing NFT: ${error.message}`;
    }
});
