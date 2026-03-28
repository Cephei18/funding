// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Funding {
    address public immutable owner;
    uint256 public totalFunded;

    event Funded(address indexed funder, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function fund() external payable {
        require(msg.value > 0, "Send ETH to fund");
        totalFunded += msg.value;
        emit Funded(msg.sender, msg.value);
    }

    // Compatibility-safe alias with clearer semantics for frontend and docs.
    function lifetimeFunded() external view returns (uint256) {
        return totalFunded;
    }

    function withdraw(address payable to) external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(to != address(0), "Invalid recipient");

        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw");

        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");

        emit Withdrawn(to, amount);
    }
}
