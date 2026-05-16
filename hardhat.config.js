require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    "kite-testnet": {
      url: process.env.KITE_AI_RPC_URL || "https://rpc.kite-testnet.io",
      chainId: parseInt(process.env.KITE_AI_CHAIN_ID || "12345"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY && process.env.DEPLOYER_PRIVATE_KEY !== "0x..." 
        ? [process.env.DEPLOYER_PRIVATE_KEY] 
        : [],
    }
  }
};
