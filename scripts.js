// Initialize Web3 and contract
let web3;
let accounts;
let contract;
const contractAddress = '0x8f8fF6939eFC3AFAf79b6F6c2eF23f4D8B25D09d'; // Replace with your contract address
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

// Initialize Web3 and set up contract instance
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum); // Initialize Web3 with MetaMask's provider
        await window.ethereum.enable(); // Request access to accounts
        accounts = await web3.eth.getAccounts(); // Get user account
        contract = new web3.eth.Contract(abi, contractAddress); // Create contract instance
    } else {
        alert('Please install MetaMask!');
    }
}

// Function to join the group
async function joinGroup() {
    try {
        await initWeb3(); // Initialize Web3 when the user clicks the button

        // Call the contract's joinGroup method
        contract.methods.joinGroup().send({ from: accounts[0] })
            .on('transactionHash', function (hash) {
                console.log('Transaction Hash:', hash); // Log the hash for easy debugging
                alert('Transaction sent. Waiting for confirmation...');
            })
            .on('receipt', function (receipt) {
                console.log('Receipt:', receipt); // Log receipt to see if transaction was successful
                alert('You have successfully joined the group!');
            })
            .on('error', function (error) {
                console.error('Error:', error); // Log any errors that occur
                alert('Error joining the group.');
            });
    } catch (error) {
        console.error('Error initializing Web3:', error);
        alert('Error initializing Web3 or MetaMask.');
    }
}

// Function to add an item to the group wishlist
async function addItem() {
    try {
        const item = prompt('Enter the item to add to the group wishlist:');
        if (item) {
            await initWeb3(); // Initialize Web3 when the user clicks the button

            // Call the contract's addItem method
            contract.methods.addItem(item).send({ from: accounts[0] })
                .on('transactionHash', function (hash) {
                    console.log('Transaction Hash:', hash); // Log the hash for easy debugging
                    alert('Transaction sent. Waiting for confirmation...');
                })
                .on('receipt', function (receipt) {
                    console.log('Receipt:', receipt); // Log receipt to see if transaction was successful
                    alert('Item added to the wishlist!');
                    updateWishlist(); // Refresh the displayed wishlist
                })
                .on('error', function (error) {
                    console.error('Error:', error); // Log any errors that occur
                    alert('Error adding item.');
                });
        }
    } catch (error) {
        console.error('Error initializing Web3:', error);
        alert('Error interacting with MetaMask or contract.');
    }
}

// Function to update the wishlist display
async function updateWishlist() {
    try {
        const wishlist = await contract.methods.getWishlist().call();
        groupWishlistElement.innerHTML = ''; // Clear the current list

        // Populate the list with items from the contract
        wishlist.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            groupWishlistElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        alert('Error fetching wishlist.');
    }
}

// Event listeners for button clicks
joinGroupBtn.addEventListener('click', joinGroup);
addGroupItemBtn.addEventListener('click', addItem);

// Call the updateWishlist function when the page loads to display current items
window.addEventListener('load', updateWishlist);
