import { Outlet } from "react-router-dom";
import HeaderLayout from "./header";
import { useMemo } from "react";
import {
    useSwitchNetwork,
    useWeb3Modal,
    useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { Network } from "@/constants/network";
import { Button } from "flowbite-react";
import metamask from "@/assets/images/metamask.svg";
import cat from "@/assets/images/cat.png";
import { AuthState } from "@/stores/auth";
const DefaultLayout = () => {
    const { accessToken } = AuthState();
    const { open } = useWeb3Modal();
    const { chainId, isConnected } = useWeb3ModalAccount();
    const { switchNetwork } = useSwitchNetwork();
    const isRightNetwork: boolean = useMemo(() => {
        console.log("chainId-------", chainId);
        if (!chainId) return false;
        return (chainId as number).toString() === Network.chainId;
    }, [chainId]);
    return (
        <div className="flex flex-col h-screen w-screen overflow-x-hidden">
            <HeaderLayout />
            <div className="mt-[62px] flex-1 flex flex-row gap-8 py-4 px-6 w-screen bg-slate-100">
                {(!isRightNetwork || !isConnected || !accessToken) && (
                    <div className="flex flex-col w-full h-full items-center">
                        <img src={cat} className="object-cover pt-2" />
                        <Button
                            color={"yellow"}
                            onClick={() => {
                                if (!isConnected) return open();
                                if (!isRightNetwork)
                                    return switchNetwork(
                                        parseInt(Network.chainId)
                                    );
                            }}
                        >
                            <img
                                src={metamask}
                                alt="metamask-icon"
                                className="w-6 h-5 mr-2"
                            />
                            {!isConnected
                                ? "Please connect to wallet"
                                : !isRightNetwork
                                ? "Switch to Binance Smart Chain"
                                : "Please sign to continue"}
                        </Button>
                    </div>
                )}
                {isRightNetwork && isConnected && accessToken && <Outlet />}
            </div>
        </div>
    );
};

export default DefaultLayout;
