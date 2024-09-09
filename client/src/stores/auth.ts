import { Network } from "@/constants/network";
import { Contract } from "ethers";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { create } from "zustand";

interface AuthFC {
    setAdmin: (isAdmin: boolean) => void;
    setSigner: (signer: JsonRpcSigner) => void;
    setAccessToken: (accessToken: string) => void;
    setProvider: (provider: BrowserProvider) => void;
    setToken: (token: Contract | undefined) => void;
    setERC20Token: (token: Contract | undefined) => void;
    setERC721Token: (token: Contract | undefined) => void;
    setApr: (apr: number) => void;
    setDefaultApr: (defaultApr: number) => void;
}

interface AuthState {
    isAdmin: boolean;
    signer: undefined | JsonRpcSigner;
    accessToken: string;
    provider: BrowserProvider | undefined;
    token: Contract | undefined;
    ERC20Token: Contract | undefined;
    ERC721Token: Contract | undefined;
    apr: number;
    defaultApr: number;
}

type AuthStore = AuthState & AuthFC;

export const AuthState = create<AuthStore>((set) => ({
    isAdmin: false,
    isConnect: localStorage.getItem("isConnect") === "true",
    addressWallet: "",
    chainId: `0x${parseInt(Network.chainId).toString(16)}`,
    signer: undefined,
    accessToken: "",
    provider: undefined,
    token: undefined,
    ERC20Token: undefined,
    ERC721Token: undefined,
    apr: 8,
    defaultApr: 8,
    setAdmin: (isAdmin: boolean) => set({ isAdmin }),
    setSigner: (signer: JsonRpcSigner) => set({ signer: signer }),
    setAccessToken: (accessToken: string) => set({ accessToken }),
    setProvider: (provider: BrowserProvider | undefined) =>
        set({ provider: provider }),
    setToken: (token: Contract | undefined) => set({ token }),
    setERC20Token: (token: Contract | undefined) => set({ ERC20Token: token }),
    setERC721Token: (token: Contract | undefined) =>
        set({ ERC721Token: token }),
    setApr: (apr: number) => set({ apr }),
    setDefaultApr: (defaultApr: number) => set({ defaultApr }),
}));
