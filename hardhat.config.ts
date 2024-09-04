import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks/faucet.js";
import "./tasks/task.js";
import dotenv from "dotenv";
dotenv.config();
const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        tBSC: {
            url: process.env.BSC_CHAIN_URL,
            accounts: [`0x${process.env.BSC_PRIVATE_KEY}`],
            chainId: 97,
        },
    },
};

export default config;
