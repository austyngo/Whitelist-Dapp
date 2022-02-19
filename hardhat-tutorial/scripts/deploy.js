const { ethers } = require("hardhat");

async function main() {
    /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
    const whitelistContract = await ethers.getContractFactory("Whitelist");

    //deploy contract
    const deployedWhitelistContract = await whitelistContract.deploy(10);
    // 10 is max WL allowed - pass variable here

    // wait for deploy to finish
    await deployedWhitelistContract.deployed();

    //print address of deployed contract
    console.log(
        "Whitelist Contract Address:",
        deployedWhitelistContract.address
    );
}

// call main function and catch if error
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1)
    });