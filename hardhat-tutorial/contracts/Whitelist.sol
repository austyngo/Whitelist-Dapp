//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    //max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    // mapping of whitelistedAddresses
    // if address is WL, then set to true, default false for other addresses

    mapping(address => bool) public whitelistedAddresses;

    // keep track of whitelisted addresses
    uint8 public numAddressesWhitelisted;

    // set max number of WL addresses
    // user will set value during deployment

    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    // adds address of sender to WL

    function addAddressToWhitelist() public {
        //check if user is already in WL
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        //check if numWhitelistedAddresses < maxWhitelistedAddresses
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Cannot add more addresses. Max number reached");
        // add the address which called the function to the whitelistedAddresses mapping
        whitelistedAddresses[msg.sender] = true;
        // increase number of WL addresses by 1
        numAddressesWhitelisted += 1;
    }
}