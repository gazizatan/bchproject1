class Block {
    constructor(index, previousHash, wishlist, timestamp = Date.now()) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.wishlist = wishlist;
        this.nonce = 0;
        this.hash = this.computeHash();
    }

    computeHash() {
        const data = `${this.index}${this.previousHash}${this.timestamp}${JSON.stringify(this.wishlist)}${this.nonce}`;
        return Block.hash(data);
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
        return new Block(0, "0", "Genesis Wishlist");
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

    getChain() {
        return this.chain;
    }
}

if (typeof module !== "undefined") {
    module.exports = WishlistBlockchain;
}
