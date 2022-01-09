// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.0 <0.9.0;

contract SimpleAccountKVStorage {
    mapping(address => string) public accounts;

    function set(string memory data) public {
        accounts[msg.sender] = data;
    }

    function get() public view returns (string memory) {
        return accounts[msg.sender];
    }
}
