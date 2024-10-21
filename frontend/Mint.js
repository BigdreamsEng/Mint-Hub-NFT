// Load the ABI for the NFT contract
let NFTABI;

// Fetch the ABI from the JSON file
async function loadABI() {
    const response = await fetch('./abis/NFT.json'); // Adjust path if needed
    NFTABI = await response.json();
}

async function connectWallet() {
    // Using Infura RPC URL for Base Sepolia
    const provider = new JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/Q2ldFoHnZD34Uh4oas6J-Qp-X5jZhua_");
    
    await provider.send("eth_requestAccounts", []); // Prompt user to connect wallet
    const signer = provider.getSigner();
    return signer;
}


// Minting function
async function mintNFT(name, description, imageFile) {
    const signer = await connectWallet();
    const NFT_CONTRACT_ADDRESS = "0xb20DD3d033c39A3b335744E7DE65a7265B6Bc6c6"; // Replace with your NFT contract address
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTABI, signer);
    
    try {
        // Convert image file to base64 or upload to IPFS to get the URL
        const imageUrl = await uploadImage(imageFile); // Implement this function to get the URL

        // Create metadata JSON
        const metadata = {
            name: name,
            description: description,
            image: imageUrl
        };

        // Convert metadata to a JSON string and upload to IPFS or any storage to get the URL
        const metadataUrl = await uploadMetadata(metadata); // Implement this function to upload metadata

        // Call the mint function from the smart contract
        const tx = await nftContract.mint(metadataUrl);
        console.log("Transaction submitted, hash:", tx.hash);

        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log("NFT minted successfully!");
    } catch (error) {
        console.error("Minting failed:", error);
    }
}

// Implementing the file upload functionality
async function uploadImage(file) {
    // Your logic to upload the image and return the URL (e.g., to IPFS)
    const url = "https://ipfs.io/ipfs/YOUR_IMAGE_HASH"; // Replace with actual upload logic
    return url;
}

// Upload metadata function
async function uploadMetadata(metadata) {
    // Your logic to upload the metadata and return the URL
    const metadataUrl = "https://ipfs.io/ipfs/YOUR_METADATA_HASH"; // Replace with actual upload logic
    return metadataUrl;
}

// On form submission
document.getElementById('mintForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from submitting traditionally

    const nftName = document.getElementById('nftName').value;
    const nftDescription = document.getElementById('nftDescription').value;
    const nftImage = document.getElementById('nftImage').files[0]; // Get the file

    await mintNFT(nftName, nftDescription, nftImage);
});

// Load ABI when the script runs
loadABI();
