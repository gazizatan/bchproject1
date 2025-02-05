const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wishlist Contracts", function () {
    let PersonalWishlist, personalWishlist, GroupWishlist, groupWishlist, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Деплой контракта PersonalWishlist
        PersonalWishlist = await ethers.getContractFactory("PersonalWishlist");
        personalWishlist = await PersonalWishlist.deploy(); // Это уже развернутый контракт, без .deployed()

        // Деплой контракта GroupWishlist
        GroupWishlist = await ethers.getContractFactory("GroupWishlist");
        groupWishlist = await GroupWishlist.deploy(); // Это уже развернутый контракт, без .deployed()
    });

    describe("Personal Wishlist", function () {
        it("Should allow a user to add an item", async function () {
            await personalWishlist.connect(addr1).addItem("New Laptop");
            const wishlist = await personalWishlist.connect(addr1).getWishlist();
            expect(wishlist).to.deep.equal(["New Laptop"]);
        });

        it("Should retrieve an empty wishlist for new users", async function () {
            const wishlist = await personalWishlist.connect(addr2).getWishlist();
            expect(wishlist).to.deep.equal([]);
        });
    });

    describe("Group Wishlist", function () {
        it("Should allow a user to join a group", async function () {
            await groupWishlist.connect(addr1).joinGroup();
            expect(await groupWishlist.groupMembers(addr1.address)).to.be.true;
        });

        it("Should prevent non-members from adding items", async function () {
            await expect(
                groupWishlist.connect(addr1).addItem("Game Console")
            ).to.be.revertedWith("Only members can perform this action");
        });

        it("Should allow members to add items", async function () {
            await groupWishlist.connect(addr1).joinGroup();
            await groupWishlist.connect(addr1).addItem("Game Console");

            const wishlist = await groupWishlist.getWishlist();
            expect(wishlist).to.deep.equal(["Game Console"]);
        });

        it("Should retrieve an empty group wishlist initially", async function () {
            const wishlist = await groupWishlist.getWishlist();
            expect(wishlist).to.deep.equal([]);
        });
    });
});
