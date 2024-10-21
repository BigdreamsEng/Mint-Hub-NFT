//Code for Minting NFTs

document.getElementById('mintForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nftName = document.getElementById('nftName').value;
    const nftDescription = document.getElementById('nftDescription').value;
    const nftImage = document.getElementById('nftImage').files[0];

    // You can implement your minting logic here, such as:
    // 1. Uploading the image to IPFS or your preferred storage.
    // 2. Interacting with the smart contract to mint the NFT.

    alert(`Minting NFT:\nName: ${nftName}\nDescription: ${nftDescription}\nImage: ${nftImage.name}`);
    // Reset the form after minting
    document.getElementById('mintForm').reset();
});


// Selling NFTs and its Key Functionalies and making API calls to my backend
document.getElementById("sell-nft-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("nft-title").value;
    const description = document.getElementById("nft-description").value;
    const price = document.getElementById("nft-price").value;
    const royalties = document.getElementById("nft-royalties").value;
    const listingType = document.getElementById("nft-listing-type").value;

    // API call to store the NFT listing
    try {
        const response = await fetch('http://localhost:5000/api/nfts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                price,
                royalties,
                listingType
            })
        });

        const newListing = await response.json();
        const listingHTML = `
            <div class="listing">
                <h3>${newListing.title}</h3>
                <p>${newListing.description}</p>
                <p>Price: $${newListing.price} | Royalties: ${newListing.royalties}% | Type: ${newListing.listingType}</p>
                <button onclick="removeListing(this)">Remove Listing</button>
            </div>
        `;
        document.getElementById("listing-management").insertAdjacentHTML("beforeend", listingHTML);
        this.reset();
    } catch (error) {
        console.error('Error adding NFT listing:', error);
    }
});

// Function to remove a listing
function removeListing(button) {
    button.parentElement.remove();
}


//Fetchng Existing NFT

async function fetchListings() {
    try {
        const response = await fetch('http://localhost:5000/api/nfts');
        const nfts = await response.json();
        const listingsContainer = document.getElementById("listings-container");
        listingsContainer.innerHTML = ''; // Clear existing listings
        
        nfts.forEach(nft => {
            const listingHTML = `
                <div class="listing" data-id="${nft._id}">
                    <h3>${nft.title}</h3>
                    <p>${nft.description}</p>
                    <p>Price: $${nft.price} | Royalties: ${nft.royalties}% | Type: ${nft.listingType}</p>
                    <button onclick="editListing('${nft._id}')">Edit</button>
                    <button onclick="removeListing('${nft._id}', this)">Remove</button>
                </div>
            `;
            listingsContainer.insertAdjacentHTML("beforeend", listingHTML);
        });
    } catch (error) {
        console.error('Error fetching NFT listings:', error);
    }
}

// Call fetchListings on page load
fetchListings();


//Functions to edit and Remove a listing

// Function to edit a listing
async function editListing(id) {
    const response = await fetch(`http://localhost:5000/api/nfts/${id}`);
    const nft = await response.json();

    // Populate the form with the existing NFT data
    document.getElementById("nft-title").value = nft.title;
    document.getElementById("nft-description").value = nft.description;
    document.getElementById("nft-price").value = nft.price;
    document.getElementById("nft-royalties").value = nft.royalties;
    document.getElementById("nft-listing-type").value = nft.listingType;

    // Change the form to update instead of create
    const sellNftForm = document.getElementById("sell-nft-form");
    sellNftForm.onsubmit = async function(event) {
        event.preventDefault();

        // Prepare updated NFT data
        const updatedNft = {
            title: document.getElementById("nft-title").value,
            description: document.getElementById("nft-description").value,
            price: document.getElementById("nft-price").value,
            royalties: document.getElementById("nft-royalties").value,
            listingType: document.getElementById("nft-listing-type").value,
        };

        try {
            const response = await fetch(`http://localhost:5000/api/nfts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedNft)
            });

            const updatedListing = await response.json();
            alert('NFT updated successfully!');
            fetchListings(); // Refresh listings
            sellNftForm.reset();
        } catch (error) {
            console.error('Error updating NFT:', error);
        }
    };
}

// Function to remove a listing
async function removeListing(id, button) {
    try {
        await fetch(`http://localhost:5000/api/nfts/${id}`, {
            method: 'DELETE',
        });
        button.parentElement.remove(); // Remove listing from the UI
        alert('NFT deleted successfully!');
    } catch (error) {
        console.error('Error deleting NFT:', error);
    }
}


//Fetch search, filter, loading NFTs

// Sample function to fetch NFTs from backend
async function fetchNFTs() {
    try {
      const response = await fetch('/api/nfts'); // Assume this endpoint provides the list of NFTs
      const nfts = await response.json();
      displayNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  }
  
  // Function to display NFTs on the grid
  function displayNFTs(nfts) {
    const nftGrid = document.querySelector('.nft-grid');
    nftGrid.innerHTML = ''; // Clear existing content
  
    nfts.forEach(nft => {
      const nftCard = document.createElement('div');
      nftCard.classList.add('nft-card');
  
      nftCard.innerHTML = `
        <img src="${nft.image}" alt="NFT Image" class="nft-image">
        <div class="nft-info">
          <h2 class="nft-title">${nft.title}</h2>
          <p class="nft-price">Price: ${nft.price} ETH</p>
          <a href="#" class="buy-button">Buy Now</a>
          <a href="#" class="view-button">View Details</a>
        </div>
      `;
  
      nftGrid.appendChild(nftCard);
    });
  }
  
  // Function to filter NFTs based on category or price
  function filterNFTs(nfts, category, priceRange) {
    return nfts.filter(nft => {
      let categoryMatch = category ? nft.category === category : true;
      let priceMatch = true;
  
      if (priceRange === 'low-to-high') {
        priceMatch = nfts.sort((a, b) => a.price - b.price);
      } else if (priceRange === 'high-to-low') {
        priceMatch = nfts.sort((a, b) => b.price - a.price);
      }
  
      return categoryMatch && priceMatch;
    });
  }
  
  // Event listener for search bar
  document.querySelector('.search-bar').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    fetchNFTs().then(nfts => {
      const filteredNFTs = nfts.filter(nft => nft.title.toLowerCase().includes(searchTerm));
      displayNFTs(filteredNFTs);
    });
  });
  
  // Event listeners for filters
  document.querySelectorAll('.filters select').forEach(filter => {
    filter.addEventListener('change', () => {
      const category = document.querySelector('.filters select:nth-child(1)').value;
      const priceRange = document.querySelector('.filters select:nth-child(2)').value;
  
      fetchNFTs().then(nfts => {
        const filteredNFTs = filterNFTs(nfts, category, priceRange);
        displayNFTs(filteredNFTs);
      });
    });
  });
  
  // Initial loading of NFTs
  fetchNFTs();
  

  document.addEventListener('DOMContentLoaded', () => {
    let isWalletConnected = false; // Update this dynamically when the wallet is connected
  
    const buyButtons = document.querySelectorAll('.buy-button');
  
    buyButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
  
        if (!isWalletConnected) {
          alert("Please connect your wallet to proceed with the purchase.");
          connectWallet();
        } else {
          const nftCard = event.target.closest('.nft-card');
          handleBuy(nftCard);
        }
      });
    });
  });
  
  // Example function to connect the wallet
  function connectWallet() {
    console.log("Wallet connected.");
    isWalletConnected = true;
  }
  
  // Handling the buy process
  async function handleBuy(nftCard) {
    const nftTitle = nftCard.querySelector('.nft-title').innerText;
    const nftPrice = nftCard.querySelector('.nft-price').innerText.replace('Price: ', '');
    alert(`Buying ${nftTitle} for ${nftPrice} ETH`);
  
    try {
      // 1. Check wallet balance
      const walletBalance = await getWalletBalance(); // Implement this function to get wallet balance
  
      if (walletBalance < nftPrice) {
        alert('Insufficient funds in wallet.');
        return;
      }
  
      // 2. Trigger blockchain transaction to transfer NFT
      const transactionHash = await buyNftOnBlockchain(nftPrice); // Function to handle the smart contract transaction
  
      if (transactionHash) {
        // 3. Update backend with the purchase (mark the NFT as sold)
        const nftId = nftCard.getAttribute('data-id');
        await updateBackendWithPurchase(nftId, transactionHash);
        
        alert('NFT purchased successfully!');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      alert('There was an issue with the purchase.');
    }
  }
  
  // Example function to get wallet balance (pseudo-code, replace with actual implementation)
  async function getWalletBalance() {
    // Replace with actual logic to fetch wallet balance
    return 10; // Assume the user has 10 ETH for now
  }
  
  // Example function to handle blockchain transaction (pseudo-code, replace with actual smart contract interaction)
  async function buyNftOnBlockchain(nftPrice) {
    // Trigger the smart contract transaction
    console.log(`Sending transaction to buy NFT for ${nftPrice} ETH...`);
    
    // Simulate a transaction hash return
    return "0x12345abcde67890fghijklmnop"; // Replace with actual transaction hash from the blockchain
  }
  
  // Example function to update the backend with the purchase details (pseudo-code)
  async function updateBackendWithPurchase(nftId, transactionHash) {
    const response = await fetch(`/api/nfts/buy/${nftId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionHash })
    });
  
    if (!response.ok) {
      throw new Error('Failed to update backend with purchase');
    }
  
    return response.json();
  }
  