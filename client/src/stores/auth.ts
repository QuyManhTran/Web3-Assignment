import { Network } from "@/constants/network";
import { Contract } from "ethers";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { create } from "zustand";

interface AuthFC {
    connect: () => void;
    disconnect: () => void;
    setAddressWallet: (address: string) => void;
    setChainId: (chainId: string) => void;
    setSigner: (signer: JsonRpcSigner) => void;
    setAccessToken: (accessToken: string) => void;
    setProvider: (provider: BrowserProvider) => void;
    setToken: (token: Contract | undefined) => void;
    setERC20Token: (token: Contract | undefined) => void;
    setERC721Token: (token: Contract | undefined) => void;
}

interface AuthState {
    isConnect: boolean;
    addressWallet: string;
    chainId: string;
    signer: undefined | JsonRpcSigner;
    accessToken: string;
    provider: BrowserProvider;
    token: Contract | undefined;
    ERC20Token: Contract | undefined;
    ERC721Token: Contract | undefined;
}

type AuthStore = AuthState & AuthFC;

export const AuthState = create<AuthStore>((set) => ({
    isConnect: localStorage.getItem("isConnect") === "true",
    addressWallet: "",
    chainId: `0x${parseInt(Network.chainId).toString(16)}`,
    signer: undefined,
    accessToken: "",
    provider: new BrowserProvider(window.ethereum),
    token: undefined,
    ERC20Token: undefined,
    ERC721Token: undefined,
    connect: () => {
        localStorage.setItem("isConnect", "true");
        set({ isConnect: true });
    },
    disconnect: () => {
        localStorage.setItem("isConnect", "false");
        set({
            isConnect: false,
            addressWallet: "",
            signer: undefined,
            accessToken: "",
        });
    },
    setAddressWallet: (address: string) => set({ addressWallet: address }),
    setChainId: (chainId: string) => set({ chainId: chainId }),
    setSigner: (signer: JsonRpcSigner) => set({ signer: signer }),
    setAccessToken: (accessToken: string) => set({ accessToken }),
    setProvider: (provider: BrowserProvider) => set({ provider: provider }),
    setToken: (token: Contract | undefined) => set({ token }),
    setERC20Token: (token: Contract | undefined) => set({ ERC20Token: token }),
    setERC721Token: (token: Contract | undefined) =>
        set({ ERC721Token: token }),
}));
