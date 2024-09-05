/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Dropdown, Navbar } from "flowbite-react";
import metamask from "@/assets/images/metamask.svg";
import { AuthState } from "@/stores/auth";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@/components/icons/Logout";
import { Network } from "@/constants/network";
import { login, refresh, register, verify } from "@/services/auth";
import { toast } from "react-toastify";

const HeaderLayout = () => {
    const {
        chainId,
        isConnect,
        addressWallet,
        signer,
        accessToken,
        disconnect,
        connect,
        setChainId,
        setAddressWallet,
        setAccessToken,
    } = AuthState();

    const navigate = useNavigate();

    const navigateExplorer = () => {
        navigate("/explorer");
    };

    const navigateHome = () => {
        navigate("/");
    };

    const truncateWallet = useMemo(() => {
        if (addressWallet) {
            return `${addressWallet.slice(0, 4)}...${addressWallet.slice(-4)}`;
        }
        return "";
    }, [addressWallet]);

    const switchToHardHat = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                    { chainId: `0x${parseInt(Network.chainId).toString(16)}` },
                ],
            });
            if (!isConnect) connect();
        } catch (error) {
            console.log(error);
        }
    };

    const checkNetwork = async () => {
        if ((window.ethereum as any).networkVersion !== Network.chainId) {
            console.log(
                "Please switch to HardHat network",
                (window.ethereum as any).networkVersion
            );
            return switchToHardHat();
        }
        if (!isConnect) connect();
    };

    const connectWallet = async () => {
        const [address] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        if (addressWallet === address && !accessToken) {
            return onRefreshToken(addressWallet);
        }
        if (address) {
            setAddressWallet(address);
            checkNetwork();
        }
    };

    const onRefreshToken = async (addressWallet: string) => {
        try {
            const response = await refresh(addressWallet);
            console.log(response.data);
            if (response.data.result) {
                setAccessToken(response.data.data?.accessToken || "");
                toast.success("Login successfully!");
            }
        } catch (error) {
            console.log(error);
            onLogin(addressWallet);
        }
    };

    const onLogin = async (addressWallet: string) => {
        try {
            const response = await login(addressWallet);
            console.log(response.data);
            if (!response.data.result) {
                return onRegister(addressWallet);
            }
            onSignMessage(response.data.data?.nonce || "");
        } catch (error) {
            console.log(error);
        }
    };

    const onRegister = async (addressWallet: string) => {
        try {
            const response = await register(addressWallet);
            console.log(response.data);
            if (response.data.result)
                onSignMessage(response.data.data?.nonce || "");
        } catch (error) {
            console.log(error);
        }
    };

    const onSignMessage = async (nonce: string) => {
        if (signer) {
            const messageTemplate = import.meta.env.VITE_SIGNATURE_MESSAGE;
            console.log(`${messageTemplate}${nonce}`);
            try {
                const signature = await signer.signMessage(
                    `${messageTemplate}${nonce}`
                );
                console.log(signature);
                onVerify(signature);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const onVerify = async (signature: string) => {
        try {
            const response = await verify(signature, addressWallet);
            console.log(response.data);
            if (response.data.result) {
                setAccessToken(response.data.data?.accessToken || "");
                toast.success("Login successfully!");
            }
        } catch (error) {
            console.log(error);
            toast.error("Login failed!");
        }
    };

    const getChainId = async () => {
        try {
            const chainId = await window.ethereum.request({
                method: "net_version",
            });
            console.log("chainId", chainId);
            setChainId(`0x${parseInt(chainId).toString(16)}`);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getChainId();
        if (isConnect) connectWallet();

        (window.ethereum as any).on("chainChanged", (chainId: any) => {
            console.log("chainChanged", chainId);
            setChainId(chainId);
        });
    }, []);

    useEffect(() => {
        if (chainId && !addressWallet) connectWallet();
    }, [chainId]);

    useEffect(() => {
        if (addressWallet && signer && !accessToken) {
            console.log("onLogin-------------------", addressWallet);
            onRefreshToken(addressWallet);
        }
    }, [signer]);

    return (
        <Navbar fluid rounded className="fixed shadow-md w-full z-[999]">
            <Navbar.Brand href="/">
                <img
                    src="https://flowbite-react.com/favicon.svg"
                    className="mr-3 h-6 sm:h-9"
                    alt="Flowbite React Logo"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                    Market place
                </span>
            </Navbar.Brand>
            <div className="flex md:order-2">
                {(!isConnect || !accessToken) && (
                    <Button color={"purple"} onClick={connectWallet}>
                        <img
                            src={metamask}
                            alt="metamask-icon"
                            className="w-6 h-5 mr-2"
                        />
                        Connect to metamask
                    </Button>
                )}
                {isConnect && accessToken && (
                    <Dropdown
                        color={"purple"}
                        label={
                            <>
                                <img
                                    src={metamask}
                                    alt="metamask-icon"
                                    className="w-6 h-5 mr-2"
                                />
                                {addressWallet
                                    ? truncateWallet
                                    : "Connecting..."}
                            </>
                        }
                    >
                        {/* <Dropdown.Header>
                            <span className="block truncate text-sm font-medium">
                                {truncateWallet}
                            </span>
                        </Dropdown.Header>
                        <Dropdown.Divider /> */}
                        <Dropdown.Item onClick={disconnect} icon={LogoutIcon}>
                            Disconnect
                        </Dropdown.Item>
                    </Dropdown>
                )}
            </div>
            <Navbar.Toggle />
            <Navbar.Collapse>
                <Navbar.Link
                    onClick={navigateHome}
                    active
                    className="cursor-pointer"
                >
                    Home
                </Navbar.Link>
                <Navbar.Link
                    onClick={navigateExplorer}
                    className="cursor-pointer"
                >
                    Explorer
                </Navbar.Link>
                <Navbar.Link className="cursor-pointer">Services</Navbar.Link>
                <Navbar.Link className="cursor-pointer">Pricing</Navbar.Link>
                <Navbar.Link className="cursor-pointer">Contact</Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default HeaderLayout;
