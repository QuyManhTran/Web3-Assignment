/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./routes";
import "./App.css";
import { AuthState } from "./stores/auth";
import { Contract } from "ethers";
import ERC20ContractAddress from "@/contracts/ERC20Token/contract-address.json";
import ERC20Artifact from "@/contracts/ERC20Token/Token.json";
import ERC721ContractAddress from "@/contracts/ERC721Token/contract-address.json";
import ERC721Artifact from "@/contracts/ERC721Token/Token.json";
import APRContractAddress from "@/contracts/APR/contract-address.json";
import APRArtifact from "@/contracts/APR/Token.json";
import { useEffect } from "react";
const App = () => {
    const {
        addressWallet,
        provider,
        setAddressWallet,
        setSigner,
        setToken,
        setERC20Token,
        setERC721Token,
        setAccessToken,
    } = AuthState();

    const connectContract = async () => {
        if (provider) {
            const signer = await provider.getSigner(0);
            setSigner(signer);
            const _token = new Contract(
                APRContractAddress.Token,
                APRArtifact.abi,
                signer
            );

            if (_token) {
                console.log("Token contract", _token);
                setToken(_token);
            }

            const _ERC20Token = new Contract(
                ERC20ContractAddress.Token,
                ERC20Artifact.abi,
                signer
            );
            if (_ERC20Token) {
                console.log("ERC20Token contract", _ERC20Token);
                setERC20Token(_ERC20Token);
            }

            const _ERC721Token = new Contract(
                ERC721ContractAddress.Token,
                ERC721Artifact.abi,
                signer
            );
            if (_ERC721Token) {
                console.log("ERC721Token contract", _ERC721Token);
                setERC721Token(_ERC721Token);
            }
        }
    };

    const resetState = () => {
        setToken(undefined);
        setERC20Token(undefined);
        setERC721Token(undefined);
    };

    useEffect(() => {
        (window.ethereum as any).on(
            "accountsChanged",
            ([newAddress]: string[]) => {
                if (newAddress) {
                    resetState();
                    setAddressWallet(newAddress);
                    setAccessToken("");
                }
            }
        );
    }, []);

    useEffect(() => {
        if (addressWallet && provider) {
            connectContract();
        }
    }, [addressWallet]);

    return (
        <Router>
            <AppRouter />
        </Router>
    );
};

export default App;
