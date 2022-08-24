const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { GBC_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  // Address of the Crypto Devs NFT contract that you deployed in the previous module
  const GbcNFTContract = GBC_NFT_CONTRACT_ADDRESS;

  /*
    A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
    so GbcTokenContract here is a factory for instances of our CryptoDevToken contract.
    */
  const GbcTokenContract = await ethers.getContractFactory(
    "GBCToken"
  );

  // deploy the contract
  const deployedGbcTokenContract = await GbcTokenContract.deploy(
    GbcNFTContract
  );

  // print the address of the deployed contract
  console.log(
    "GBCToken Contract Address:",
    deployedGbcTokenContract.address
  );
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });