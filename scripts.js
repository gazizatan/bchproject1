// Initialize Web3 and contract
let web3;
let accounts;
let contract;
const contractAddress = '0xdaC9207627D002dC20D3B36c97d22124c67166c8'; // Replace with your contract address
const abi = [
    {
        "inputs": [],
        "name": "joinGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "item",
                "type": "string"
            }
        ],
        "name": "addItem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWishlist",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Elements for UI interaction
const joinGroupBtn = document.getElementById('joinGroupBtn');
const addGroupItemBtn = document.getElementById('addGroupItemBtn');
const groupWishlistElement = document.getElementById('groupWishlist');

// Initialize Web3 and contract instance once
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(abi, contractAddress);
    } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
        throw new Error('MetaMask not installed');
    }
}

// Utility function to handle transactions
async function handleTransaction(txPromise, successMessage) {
    try {
        const receipt = await txPromise;
        console.log('Transaction receipt:', receipt);
        alert(successMessage);
        return receipt;
    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed. Please check the console for details.');
    }
}

// Function to join the group
async function joinGroup() {
    try {
        joinGroupBtn.disabled = true; // Disable button to prevent multiple clicks
        await handleTransaction(
            contract.methods.joinGroup().send({ from: accounts[0] }),
            'You have successfully joined the group!'
        );
    } catch (error) {
        console.error('Error joining group:', error);
    } finally {
        joinGroupBtn.disabled = false; // Re-enable button
    }
}

// Function to add an item to the group wishlist
async function addItem() {
    try {
        const item = prompt('Enter the item to add to the group wishlist:');
        if (!item || item.trim() === '') {
            alert('Invalid input. Please enter a valid item.');
            return;
        }

        addGroupItemBtn.disabled = true; // Disable button to prevent multiple clicks
        await handleTransaction(
            contract.methods.addItem(item).send({ from: accounts[0] }),
            'Item added to the wishlist!'
        );
        updateWishlist(); // Refresh the wishlist display
    } catch (error) {
        console.error('Error adding item:', error);
    } finally {
        addGroupItemBtn.disabled = false; // Re-enable button
    }
}

// Function to update the wishlist display
async function updateWishlist() {
    try {
        const wishlist = await contract.methods.getWishlist().call();
        groupWishlistElement.innerHTML = ''; // Clear the current list

        if (wishlist.length === 0) {
            groupWishlistElement.textContent = 'The wishlist is empty.';
            return;
        }

        wishlist.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            groupWishlistElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        alert('Error fetching the wishlist. Please check the console for details.');
    }
}

// Detect account and network changes in MetaMask
function setupMetaMaskListeners() {
    window.ethereum.on('accountsChanged', async () => {
        accounts = await web3.eth.getAccounts();
        alert('Account changed. Current account: ' + accounts[0]);
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload the page on network change
    });
}

// Initialize the app
async function initApp() {
    try {
        await initWeb3();
        setupMetaMaskListeners();
        updateWishlist(); // Load the wishlist on page load
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Event listeners for button clicks
joinGroupBtn.addEventListener('click', joinGroup);
addGroupItemBtn.addEventListener('click', addItem);

// Initialize the app when the page loads
window.addEventListener('load', initApp);
