let web3;
let accounts;
let contract;
let contractAddress;
const factoryAddress = "0xBD1A9aabA5ecbC036daBd0968AF4F3d50D3a5758"; // Адрес фабрики групп

const abi = [
    {
        "inputs": [],
        "name": "createGroup",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "groupAddress",
                "type": "address"
            }
        ],
        "name": "GroupCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userGroups",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            alert('No accounts found. Please connect your MetaMask wallet.');
            return;
        }

        document.getElementById('connectGroupBtn').addEventListener('click', connectToGroup);
        document.getElementById('createGroupBtn').addEventListener('click', createGroup);
        document.getElementById('joinGroupBtn').addEventListener('click', joinGroup);
        document.getElementById('addGroupItemBtn').addEventListener('click', addItem);

    } else {
        alert('MetaMask is not installed. Please install it and reload the page.');
    }
}

async function connectToGroup() {
    const addressInput = document.getElementById('groupAddress').value;
    if (!web3.utils.isAddress(addressInput)) {
        alert('Invalid contract address.');
        return;
    }

    contractAddress = addressInput;
    contract = new web3.eth.Contract(abi, contractAddress);
    updateWishlist();
}

async function createGroup() {
    const factoryAbi = [
        {
            "inputs": [],
            "name": "createGroup",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const factory = new web3.eth.Contract(factoryAbi, factoryAddress);

    try {
        const receipt = await factory.methods.createGroup().send({ from: accounts[0] });
        const newGroupAddress = receipt.events.GroupCreated.returnValues.groupAddress;
        alert(`New group created at ${newGroupAddress}`);

        document.getElementById('groupAddress').value = newGroupAddress;
        connectToGroup();

    } catch (error) {
        console.error('Error creating group:', error);
        alert('Error creating group.');
    }
}

async function joinGroup() {
    if (!contract) {
        alert('Contract is not initialized. Please reload the page.');
        return;
    }

    try {
        await contract.methods.joinGroup().send({ from: accounts[0] });
        alert('You have successfully joined the group!');
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Error joining group.');
    }
}

async function addItem() {
    if (!contract) {
        alert('Contract is not initialized. Please reload the page.');
        return;
    }

    const item = prompt('Enter the item to add to the group wishlist:');
    if (!item || item.trim() === '') {
        alert('Invalid input. Please enter a valid item.');
        return;
    }

    try {
        const isMember = await contract.methods.groupMembers(accounts[0]).call();
        if (!isMember) {
            alert('You need to join the group first!');
            return;
        }

        await contract.methods.addItem(item).send({ from: accounts[0] });
        alert('Item added to the wishlist!');
        updateWishlist();
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Error adding item.');
    }
}

async function updateWishlist() {
    if (!contract) {
        alert('Contract is not initialized. Please reload the page.');
        return;
    }

    try {
        const wishlist = await contract.methods.getWishlist().call();
        const wishlistElement = document.getElementById('groupWishlist');
        wishlistElement.innerHTML = '';

        wishlist.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry.user}: ${entry.item}`;
            wishlistElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
    }
}

window.addEventListener('load', initWeb3);
