// script.js

// Initialize Web3Modal
const providerOptions = {
    /* See Provider Options Section */
};
  
const web3Modal = new window.Web3Modal.default({
  cacheProvider: false, // optional
  providerOptions, // required
});
  
let provider;
let signer;
let userAddress;
let jwtToken;
  
const connectWalletButton = document.getElementById('connectWallet');
const userInfoDiv = document.getElementById('userInfo');
const userAddressSpan = document.getElementById('userAddress');
const fetchDataButton = document.getElementById('fetchData');
const logoutButton = document.getElementById('logout');
const protectedDataP = document.getElementById('protectedData');
const errorP = document.getElementById('error');
  
connectWalletButton.addEventListener('click', connectWallet);
fetchDataButton.addEventListener('click', fetchProtectedData);
logoutButton.addEventListener('click', logout);
  
async function connectWallet() {
  console.log('Connect Wallet button clicked.');
  try {
    provider = await web3Modal.connect();
    console.log('Wallet connected:', provider);

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
    console.log('User address:', userAddress);

    userAddressSpan.innerText = userAddress;
    userInfoDiv.classList.remove('hidden');

    // Sign a message for authentication
    const message = "Authenticate with NFT Marketplace";
    console.log('Signing message:', message);
    const signature = await signer.signMessage(message);
    console.log('Signature obtained:', signature);

    // Send signature to backend for verification
    console.log('Sending authentication request to backend.');
    const response = await axios.post('http://localhost:4000/authenticate', {
      address: userAddress,
      signature: signature,
      message: message
    });
    console.log('Backend response:', response.data);

    if (response.data.success) {
      jwtToken = response.data.token;
      console.log('JWT Token received:', jwtToken);
      errorP.innerText = '';
    } else {
      console.log('Authentication failed on backend.');
      errorP.innerText = 'Authentication failed.';
    }

    // Listen for accounts change
    provider.on("accountsChanged", (accounts) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        logout();
      } else {
        userAddress = accounts[0];
        userAddressSpan.innerText = userAddress;
      }
    });

    // Listen for chainId change
    provider.on("chainChanged", (chainId) => {
      console.log('Chain changed to:', chainId);
      // Reload the page to avoid any inconsistent state
      window.location.reload();
    });

  } catch (err) {
    console.error('Error in connectWallet:', err);
    errorP.innerText = 'Wallet connection or authentication failed.';
  }
}
  
async function fetchProtectedData() {
  console.log('Fetch Protected Data button clicked.');
  try {
    const response = await axios.get('http://localhost:4000/protected', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    console.log('Protected data response:', response.data);
    protectedDataP.innerText = response.data.message;
    errorP.innerText = '';
  } catch (err) {
    console.error('Error fetching protected data:', err);
    errorP.innerText = 'Failed to fetch protected data.';
  }
}
  
function logout() {
  console.log('Logout button clicked.');
  userAddress = null;
  jwtToken = null;
  userInfoDiv.classList.add('hidden');
  userAddressSpan.innerText = '';
  protectedDataP.innerText = '';
  errorP.innerText = '';
  web3Modal.clearCachedProvider();
}


// Authenticate and store token
function authenticate(address, signature, message) {
    axios.post('http://localhost:4000/authenticate', { address, signature, message })
        .then(response => {
            if (response.data.success) {
                localStorage.setItem('jwtToken', response.data.token);
                console.log('JWT Token received:', response.data.token);
            } else {
                console.error('Authentication failed:', response.data.message);
            }
        })
        .catch(error => {
            console.error('Error during authentication:', error);
        });
}

// Fetch protected data
function fetchProtectedData() {
    const token = localStorage.getItem('jwtToken');
    
    axios.get('http://localhost:4000/protected', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Protected data:', response.data);
    })
    .catch(error => {
        console.error('Error fetching protected data:', error);
    });
}

// Logout function
function logout() {
    localStorage.removeItem('jwtToken');
    console.log('Logged out successfully');
}

// Example usage
// Call authenticate with valid address, signature, and message
// authenticate(userAddress, userSignature, 'Authenticate with NFT Marketplace');
// Call fetchProtectedData to access protected routes
// fetchProtectedData();
// Call logout to log out
// logout();
