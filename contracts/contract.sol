// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PersonalWishlist {
    mapping(address => string[]) private wishlists;

    event ItemAdded(address indexed user, string item);

    function addItem(string memory item) public {
        wishlists[msg.sender].push(item);
        emit ItemAdded(msg.sender, item);
    }

    function getWishlist() public view returns (string[] memory) {
        return wishlists[msg.sender];
    }
}

contract GroupWishlist {
    address public owner;
    mapping(address => bool) public groupMembers;
    string[] public wishlist;

    event ItemAdded(string item);
    event GroupJoined(address member);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyMember() {
        require(groupMembers[msg.sender], "Only members can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Join the group
    function joinGroup() public {
        require(!groupMembers[msg.sender], "Already a member");
        groupMembers[msg.sender] = true;
        emit GroupJoined(msg.sender);
    }

    // Add item to the wishlist
    function addItem(string memory item) public onlyMember {
        wishlist.push(item);
        emit ItemAdded(item);
    }

    // Get all items in the wishlist
    function getWishlist() public view returns (string[] memory) {
        return wishlist;
    }
}
