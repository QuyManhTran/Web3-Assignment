import { Navbar } from "flowbite-react";
import { AuthState } from "@/stores/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, refresh, register, verify } from "@/services/auth";
import { toast } from "react-toastify";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

const HeaderLayout = () => {
    const { signer, accessToken, setAccessToken } = AuthState();

    const { address } = useWeb3ModalAccount();

    const navigate = useNavigate();

    const navigateExplorer = () => {
        navigate("/explorer");
    };

    const navigateHome = () => {
        navigate("/");
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
            const response = await verify(signature, address || "");
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

    useEffect(() => {
        console.log("signer", signer);
        if (address && signer && !accessToken) {
            console.log("onLogin-------------------", address);
            onRefreshToken(address);
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
                {/* {(!isConnected || !accessToken) && (
                    <Button color={"purple"} onClick={connectWallet}>
                        <img
                            src={metamask}
                            alt="metamask-icon"
                            className="w-6 h-5 mr-2"
                        />
                        Connect to metamask
                    </Button>
                )}
                {isConnected && accessToken && (
                    <Dropdown
                        color={"purple"}
                        label={
                            <>
                                <img
                                    src={metamask}
                                    alt="metamask-icon"
                                    className="w-6 h-5 mr-2"
                                />
                                {address ? truncateWallet : "Connecting..."}
                            </>
                        }
                    >
                        <Dropdown.Item onClick={disconnect} icon={LogoutIcon}>
                            Disconnect
                        </Dropdown.Item>
                    </Dropdown>
                )} */}
                <w3m-button loadingLabel="Loading..." balance="hide" />
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
                <Navbar.Link className="cursor-pointer">Features</Navbar.Link>
                <Navbar.Link className="cursor-pointer">Pricing</Navbar.Link>
                <Navbar.Link className="cursor-pointer">Contact</Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default HeaderLayout;
