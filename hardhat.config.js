require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("hardhat-gas-reporter");
require("solidity-coverage"); //yarn hardhat coverage
require("hardhat-deploy");

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "spare address";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    // solidity: "0.8.18",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.8.18" }],
    },
    defaultNetwork: "hardhat", // default yarn hardhat run <script> --network hardhat

    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            chainId: 11155111,
            accounts: [SEPOLIA_PRIVATE_KEY],
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    // managing multiple account in one project
    namedAccounts: {
        deployer: {
            default: 0, // default order
        },
        someuser: {
            default: 1,
            11155111: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        // outputFile: "gas-report.txt",
        noColors: true,
        currency: "RUB",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "FTM", // defines network
    },
};
