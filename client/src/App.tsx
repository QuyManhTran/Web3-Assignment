/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./routes";
import "./App.css";
import { AuthState } from "./stores/auth";
import { BrowserProvider, Contract } from "ethers";
import ERC20ContractAddress from "@/contracts/ERC20Token/contract-address.json";
import ERC20Artifact from "@/contracts/ERC20Token/Token.json";
import ERC721ContractAddress from "@/contracts/ERC721Token/contract-address.json";
import ERC721Artifact from "@/contracts/ERC721Token/Token.json";
import APRContractAddress from "@/contracts/APR/contract-address.json";
import APRArtifact from "@/contracts/APR/Token.json";
import { useEffect, useState } from "react";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import {
    useWeb3ModalAccount,
    useWeb3ModalProvider,
} from "@web3modal/ethers/react";

const projectId = import.meta.env.VITE_PROJECT_ID;

// 2. Set chains
const mainnet = {
    chainId: 97,
    name: "Binance Smart Chain Testnet",
    currency: "BNB",
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
};

// 3. Create a metadata object
const metadata = {
    name: "Web3",
    description: "This is a APR dapps",
    url: "https://web3.quymanh.online", // origin must match your domain & subdomain
    icons: ["https://flowbite-react.com/favicon.svg"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
});

// 5. Create a AppKit instance
createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

const App = () => {
    const {
        token,
        provider,
        setAdmin,
        setSigner,
        setToken,
        setERC20Token,
        setERC721Token,
        setAccessToken,
        setProvider,
    } = AuthState();
    const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
    const { walletProvider } = useWeb3ModalProvider();
    const { address, isConnected } = useWeb3ModalAccount();

    const connectContract = async () => {
        if (provider) {
            const signer = await provider.getSigner(address);
            setSigner(signer);
            const _token = new Contract(
                APRContractAddress.Token,
                APRArtifact.abi,
                signer
            );

            if (_token) {
                setToken(_token);
            }

            const _ERC20Token = new Contract(
                ERC20ContractAddress.Token,
                ERC20Artifact.abi,
                signer
            );
            if (_ERC20Token) {
                setERC20Token(_ERC20Token);
            }

            const _ERC721Token = new Contract(
                ERC721ContractAddress.Token,
                ERC721Artifact.abi,
                signer
            );
            if (_ERC721Token) {
                setERC721Token(_ERC721Token);
            }
        }
    };

    const resetState = () => {
        setToken(undefined);
        setERC20Token(undefined);
        setERC721Token(undefined);
    };

    const checkAdmin = async () => {
        if (token) {
            const adminAddress = await token.owner();
            setAdmin(
                address?.toLocaleLowerCase() ===
                    adminAddress.toLocaleLowerCase()
            );
        }
    };

    useEffect(() => {
        if (address && provider && isConnected && !isFirstTime) {
            resetState();
            setAccessToken("");
            connectContract();
        }
    }, [address]);

    useEffect(() => {
        if (address && provider && isFirstTime) {
            connectContract();
            setIsFirstTime(false);
        }
    }, [provider]);

    useEffect(() => {
        checkAdmin();
    }, [token]);

    useEffect(() => {
        if (walletProvider) {
            const _provider = new BrowserProvider(walletProvider as any);
            setProvider(_provider);
        }
    }, [walletProvider]);

    return (
        <Router>
            <AppRouter />
        </Router>
    );
};

export default App;
