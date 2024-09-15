import { Button, Modal, Navbar, TextInput } from "flowbite-react";
import { AuthState } from "@/stores/auth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, refresh, register, verify } from "@/services/auth";
import { toast } from "react-toastify";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

const HeaderLayout = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const {
        isAdmin,
        signer,
        accessToken,
        token,
        setAccessToken,
        setDefaultApr,
        setApr: setStoreAPR,
    } = AuthState();
    const [apr, setApr] = useState<number>(8);
    const [isHome, setIsHome] = useState<boolean>(true);
    const { address } = useWeb3ModalAccount();
    const { pathname } = useLocation();

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

    const onCloseModal = () => {
        setOpenModal(false);
    };

    const onSetAPR = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const txn = await token.setDefaultAPR(apr);
            await toast.promise(txn.wait(), {
                pending: "Setting default APR...",
                success: "Set APR successfully!",
                error: "Set APR failed!",
            });
            const _apr = await token.getAPR(address);
            setStoreAPR(parseInt(_apr.toString()));

            const _defaultApr = await token.DEFAULT_APR();
            setDefaultApr(parseInt(_defaultApr.toString()));

            setOpenModal(false);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("signer", signer);
        if (address && signer && !accessToken) {
            console.log("onLogin-------------------", address);
            onRefreshToken(address);
        }
    }, [signer]);

    useEffect(() => {
        if (pathname === "/") {
            setIsHome(true);
        }
        if (pathname === "/explorer") {
            setIsHome(false);
        }
    }, [pathname]);

    return (
        <>
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
                <div className="flex md:order-2 flex-row gap-2 items-center">
                    {isAdmin && (
                        <Button
                            type="button"
                            onClick={() => setOpenModal(true)}
                        >
                            Set APR
                        </Button>
                    )}
                    <w3m-button loadingLabel="Connecting..." balance="hide" />
                </div>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Navbar.Link
                        onClick={navigateHome}
                        active={isHome}
                        className="cursor-pointer"
                    >
                        Home
                    </Navbar.Link>
                    <Navbar.Link
                        onClick={navigateExplorer}
                        className="cursor-pointer"
                        active={!isHome}
                    >
                        Explorer
                    </Navbar.Link>
                    <Navbar.Link className="cursor-pointer">
                        Features
                    </Navbar.Link>
                    <Navbar.Link className="cursor-pointer">
                        Pricing
                    </Navbar.Link>
                    <Navbar.Link className="cursor-pointer">
                        Contact
                    </Navbar.Link>
                </Navbar.Collapse>
            </Navbar>
            <Modal
                show={openModal}
                size="md"
                onClose={onCloseModal}
                popup
                className="z-[1000]"
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            Set default APR
                        </h3>
                        <div>
                            <TextInput
                                id="apr"
                                required
                                type="number"
                                min="0"
                                max="100"
                                value={apr}
                                onChange={(e) => setApr(Number(e.target.value))}
                            />
                        </div>

                        <div className="flex flex-row gap-2 w-full justify-end">
                            <Button
                                color={"failure"}
                                outline
                                type="button"
                                onClick={onCloseModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="w-[80px]"
                                type="button"
                                onClick={onSetAPR}
                                isProcessing={loading}
                                disabled={loading}
                            >
                                Set
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default HeaderLayout;
