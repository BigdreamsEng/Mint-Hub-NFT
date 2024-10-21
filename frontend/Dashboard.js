const connectButton = document.getElementById('wallet-connection');
const walletAddressDisplay = document.getElementById('wallet-address');
const walletBalanceDisplay = document.getElementById('wallet-balance');

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request wallet connection
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            // Update button text and display wallet address
            connectButton.textContent = 'Wallet Connected';
            walletAddressDisplay.textContent = `Wallet Address: ${account}`;

            // Fetch and display wallet balance
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const balanceEth = ethers.formatEther(balance);
            
            // Display ETH balance
            walletBalanceDisplay.textContent = `${(Math.round(balanceEth * 100) / 100).toFixed(2)} ETH`;

            // Fetch current ETH price in USD and display it
            const ethPrice = await getEthPrice();
            const usdAmount = (balanceEth * ethPrice).toFixed(2);
            walletBalanceDisplay.innerHTML += ` (~$${usdAmount})`;

        } catch (error) {
            console.error('User rejected the connection request:', error);
            alert('Connection request rejected. Please try again.');
        }
    } else {
        alert('MetaMask is not installed. Please install it to connect your wallet.');
    }
}

async function getEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        return data.ethereum.usd;
    } catch (error) {
        console.error("Error fetching ETH price:", error);
        return 0; // Return 0 if there's an error
    }
}

// Event listener for button click
connectButton.addEventListener('click', connectWallet);
