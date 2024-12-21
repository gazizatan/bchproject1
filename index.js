class MerkleTree {
    constructor(items) {
        this.leaves = items.map((item) => MerkleTree.hash(item));
        this.root = this.buildTree(this.leaves);
    }

    static hash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash.toString(16);
    }

    buildTree(leaves) {
        if (leaves.length === 1) return leaves[0];

        const parentNodes = [];
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = leaves[i + 1] || leaves[i];
            const combinedHash = MerkleTree.hash(left + right);
            parentNodes.push(combinedHash);
        }
        return this.buildTree(parentNodes);
    }
}

class Block {
    constructor(index, previousHash, wishlist, timestamp = Date.now()) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.wishlist = wishlist;
        this.merkleRoot = new MerkleTree(wishlist.map(JSON.stringify)).root;
        this.nonce = 0;
        this.hash = this.computeHash();
    }

    computeHash() {
        const data = `${this.index}${this.previousHash}${this.timestamp}${this.merkleRoot}${this.nonce}`;
        return Block.hash(data);
    }

    static hash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    mineBlock(difficulty) {
        while (!this.hash.startsWith("0".repeat(difficulty))) {
            this.nonce++;
            this.hash = this.computeHash();
        }
    }
}

class WishlistBlockchain {
    constructor(difficulty = 4) {
        this.chain = [this.createGenesisBlock()];
        this.pendingWishlist = [];
        this.difficulty = difficulty;
    }

    createGenesisBlock() {
        return new Block(0, "0", []);
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addWishlistItem(item, user) {
        this.pendingWishlist.push({ item, user, timestamp: Date.now() });
    }

    mineWishlistBlock() {
        if (this.pendingWishlist.length === 0) {
            alert("No wishlist items to mine!");
            return;
        }

        const newBlock = new Block(
            this.chain.length,
            this.getLastBlock().hash,
            this.pendingWishlist
        );
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        this.pendingWishlist = [];
        alert("Wishlist block mined successfully!");
    }

    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.computeHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

if (typeof module !== "undefined") {
    module.exports = { WishlistBlockchain, MerkleTree };
}
