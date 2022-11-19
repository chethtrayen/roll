import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

const MUMBAI_API = "IJH86NT21AIUJ66AMI2GEEBVZ1DU7R2IFU"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      live: false,
      chainId: 31337,
      saveDeployments: true,
      tags: ["mocks"]
    },
    mumbai: {
      url: "https://rpc-mumbai.matic.today",
      live: false,
      chainId: 80001,
      saveDeployments: true,
      accounts: ["0x64bba70919aedb8c92d3b288f66a23ee936fde8160662c87853805a6e60a3654"]
    }
  },
  solidity: "0.8.17",
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0
    },
    player: {
      default: 1
    }
  },
  etherscan: {
    apiKey: MUMBAI_API
  }
};

export default config;
