/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthState } from "@/stores/auth";
import { formatEther, parseEther } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { toast } from "react-toastify";
import metamask from "@/assets/images/metamask.svg";
import APRContractAddress from "@/contracts/APR/contract-address.json";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import CountDown from "@/components/countdown";
const HomePage = () => {
    const {
        apr,
        defaultApr,
        provider,
        token,
        ERC20Token,
        ERC721Token,
        setApr,
        setDefaultApr,
    } = AuthState();
    const { address, isConnected } = useWeb3ModalAccount();
    const [balanceERC20, setBalanceERC20] = useState<string>("");
    const [balanceERC721, setBalanceERC721] = useState<string>("");
    const [walletBalance, setWalletBalance] = useState<string>("");
    const [ERC721Data, setERC721Data] = useState<string[]>([]);
    const [depositedERC721, setDepositedERC721] = useState<string[]>([]);
    const pollDataInterval: { current: NodeJS.Timeout | null } = useRef(null);
    const [claimRewardTime, setClaimRewardTime] = useState<number>(0);
    const [withdrawERC20Time, setWithdrawERC20Time] = useState<number>(0);
    const [isLoadingFaucet, setIsLoadingFaucet] = useState<boolean>(false);
    const [isLoadingDeposit, setIsLoadingDeposit] = useState<boolean>(false);
    const [isLoadingDepositNft, setIsLoadingDepositNft] =
        useState<boolean>(false);
    const [isLoadingWithdrawNft, setIsLoadingWithdrawNft] =
        useState<boolean>(false);

    const getInfor = async () => {
        console.log("getInfor");
        if (!provider || !token) return;
        const _walletBalance = await provider.getBalance(address as string);
        setWalletBalance(formatEther(_walletBalance));

        const _claimRewardTimeInUTC = await token.getClaimTime();
        const _claimRewardTime =
            parseInt(_claimRewardTimeInUTC.toString()) -
                Math.floor(Date.now() / 1000) >
            0
                ? parseInt(_claimRewardTimeInUTC.toString()) -
                  Math.floor(Date.now() / 1000)
                : 0;
        setClaimRewardTime(_claimRewardTime);

        const _withdrawERC20TimeInUTC = await token.getWithdrawTime();
        const _withdrawERC20Time =
            parseInt(_withdrawERC20TimeInUTC.toString()) -
                Math.floor(Date.now() / 1000) >
            0
                ? parseInt(_withdrawERC20TimeInUTC.toString()) -
                  Math.floor(Date.now() / 1000)
                : 0;
        console.log(_withdrawERC20Time);
        setWithdrawERC20Time(_withdrawERC20Time);

        const _apr = await token.getAPR(address);
        setApr(parseInt(_apr.toString()));

        const _defaultApr = await token.DEFAULT_APR();
        setDefaultApr(parseInt(_defaultApr.toString()));

        const ERC20Balance = await token.getErc20Balance();
        setBalanceERC20(formatEther(ERC20Balance.toString()));

        const ERC721Balance = await token.getErc721Balance();
        setBalanceERC721(ERC721Balance.length);
        if (ERC721Balance.length === 0) {
            setERC721Data([]);
        } else {
            setERC721Data(ERC721Balance.map((item: any) => item.toString()));
        }

        const depositedERC721 = await token.getDepositNftCount();
        if (depositedERC721.length === 0) {
            setDepositedERC721([]);
        } else {
            setDepositedERC721(
                depositedERC721.map((item: any) => item.toString())
            );
        }
    };

    const pollingIntervalData = () => {
        pollDataInterval.current = setInterval(() => {
            // getInfor();
        }, 10000);
    };

    const resetState = () => {
        setBalanceERC20("");
        setBalanceERC721("");
        setWalletBalance("");
    };

    const stopPolling = () => {
        clearInterval(pollDataInterval.current as NodeJS.Timeout);
    };

    const faucet = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isConnected) return toast.error("Please connect wallet first !");
        if (!ERC20Token) return;
        try {
            const formData = new FormData(event.target as HTMLFormElement);
            const amount = formData.get("faucet") as string;
            if (amount === "" || parseInt(amount) <= 0) {
                toast.error("Amount must be greater than 0 !");
                return;
            }
            setIsLoadingFaucet(true);
            const tx = await ERC20Token.faucet(parseInt(amount));
            await toast.promise(tx.wait(), {
                pending: "Faucet...",
                success: "Faucet success",
                error: "Faucet error",
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingFaucet(false);
            await getInfor();
        }
    };

    const deposit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isConnected) return toast.error("Please connect wallet first !");
        if (!token || !ERC20Token) return;
        try {
            const formData = new FormData(event.target as HTMLFormElement);
            const amount = formData.get("deposit") as string;
            setIsLoadingDeposit(true);
            if (amount === "" || parseInt(amount) <= 0) {
                toast.error("Amount must be greater than 0 !", {
                    position: "top-right",
                });
                return;
            }
            const txnApprove = await ERC20Token.approve(
                APRContractAddress.Token,
                parseEther(amount)
            );
            await toast.promise(txnApprove.wait(), {
                pending: "Approving...",
                success: "Approve success",
                error: "Approve error",
            });

            const tx = await token.deposit(parseInt(amount));
            await toast.promise(tx.wait(), {
                pending: "Depositing...",
                success: "Deposit success",
                error: "Deposit error",
            });
        } catch (error) {
            console.log(error);
            toast.error("Deposit error");
        } finally {
            setIsLoadingDeposit(false);
            await getInfor();
        }
    };

    const withdraw = useCallback(async () => {
        if (!token) return;
        const tx = await token.withdraw();
        await toast.promise(tx.wait(), {
            pending: "Withdrawing...",
            success: "Withdraw success",
            error: "Withdraw error",
        });
        await getInfor();
    }, [token]);

    const claimReward = useCallback(async () => {
        if (!token) return;
        const tx = await token.claimReward();
        await toast.promise(tx.wait(), {
            pending: "Claiming...",
            success: "Claim success",
            error: "Claim error",
        });
        await getInfor();
    }, [token]);

    const depositERC721 = async (tokenId: string) => {
        if (!token || !ERC721Token) return;
        try {
            setIsLoadingDepositNft(true);
            const txnApprove = await ERC721Token.approve(
                APRContractAddress.Token,
                parseInt(tokenId)
            );

            await toast.promise(txnApprove.wait(), {
                pending: "Approving...",
                success: "Approve success",
                error: "Approve error",
            });
            const tx = await token.depositERC721(parseInt(tokenId));
            await toast.promise(tx.wait(), {
                pending: "Depositing NFT...",
                success: "Deposit NTF success",
                error: "Deposit NFT error",
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingDepositNft(false);
            await getInfor();
        }
    };

    const withdrawERC721 = async (tokenId: string) => {
        if (!token || !ERC721Token) return;
        try {
            setIsLoadingWithdrawNft(true);
            const tx = await token.withdrawERC721(parseInt(tokenId));
            await toast.promise(tx.wait(), {
                pending: "Withdraw NFT...",
                success: "Withdraw NFT success",
                error: "Withdraw NFT error",
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingWithdrawNft(false);
            await getInfor();
        }
    };

    useEffect(() => {
        (window.ethereum as any).on(
            "accountsChanged",
            ([newAddress]: string[]) => {
                stopPolling();
                console.log(newAddress);
                if (newAddress) {
                    resetState();
                }
            }
        );
        return () => stopPolling();
    }, []);

    useEffect(() => {
        if (token) {
            getInfor();
            pollingIntervalData();
        }
    }, [token]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 w-full gap-4">
            <div className="col-span-4 shadow-md bg-white rounded-lg px-4 py-4 flex flex-col gap-6">
                <form
                    className="flex flex-row justify-start items-center gap-4"
                    onSubmit={faucet}
                >
                    <Label
                        htmlFor="faucet"
                        value="Faucet Token: "
                        className="text-xl"
                    />
                    <TextInput
                        id="faucet"
                        type="number"
                        name="faucet"
                        min={0}
                        max={1000000}
                        step={1}
                        defaultValue={0}
                        className="w-[200px]"
                    />
                    <Button
                        gradientMonochrome={"lime"}
                        type="submit"
                        disabled={isLoadingFaucet}
                    >
                        Faucet
                    </Button>
                </form>
                <form
                    className="flex flex-row justify-start items-center gap-4"
                    onSubmit={deposit}
                >
                    <Label
                        htmlFor="deposit"
                        value="Deposit ERCToken: "
                        className="text-xl"
                    />
                    <TextInput
                        id="deposit"
                        type="number"
                        name="deposit"
                        min={0}
                        step={1}
                        defaultValue={0}
                        className="w-[200px]"
                    />
                    <Button
                        gradientMonochrome={"pink"}
                        type="submit"
                        disabled={isLoadingDeposit}
                    >
                        Deposit
                    </Button>
                </form>
                <div className="flex flex-row justify-start items-center gap-4">
                    <Label
                        htmlFor="withdraw"
                        value="Withdraw ERCToken: "
                        className="text-xl"
                    />
                    <CountDown
                        timeInSeconds={withdrawERC20Time}
                        title="Withdraw"
                        action={withdraw}
                    />
                </div>
                <div className="flex flex-row justify-start items-center gap-4">
                    <Label
                        htmlFor="claim"
                        value="Claim ERCToken: "
                        className="text-xl"
                    />
                    <CountDown
                        timeInSeconds={claimRewardTime}
                        title="Claim reward"
                        action={claimReward}
                    />
                </div>
                <div>
                    <h1 className="font-semibold text-xl">Nft:</h1>
                    <div className="flex flex-row gap-4 justify-start w-full overflow-x-auto mt-2">
                        {ERC721Data.length > 0 &&
                            ERC721Data.map((item) => (
                                <Button
                                    key={item}
                                    gradientMonochrome={"success"}
                                    type="button"
                                    onClick={() => depositERC721(item)}
                                    className="group"
                                    disabled={isLoadingDepositNft}
                                >
                                    <img
                                        src={metamask}
                                        alt="icon"
                                        className="w-6 h-5 object-cover mr-2 group-hover:rotate-180 duration-1000"
                                    />
                                    Deposit token {item}
                                </Button>
                            ))}
                        {ERC721Data.length === 0 && (
                            <Button color={"light"} disabled>
                                <img
                                    src={metamask}
                                    alt="icon"
                                    className="w-6 h-5 object-cover mr-2 group-hover:rotate-180 duration-1000"
                                />
                                No token
                            </Button>
                        )}
                    </div>
                </div>
                <div>
                    <h1 className="font-semibold text-xl">Deposited Nft:</h1>
                    <div className="flex flex-row gap-4 justify-start w-full overflow-x-auto mt-2">
                        {depositedERC721.map((item) => (
                            <Button
                                key={item}
                                gradientMonochrome={"success"}
                                type="button"
                                onClick={() => withdrawERC721(item)}
                                className="group"
                                disabled={isLoadingWithdrawNft}
                            >
                                <img
                                    src={metamask}
                                    alt="icon"
                                    className="w-6 h-5 object-cover mr-2 group-hover:rotate-180 duration-1000"
                                />
                                Withdraw token {item}
                            </Button>
                        ))}
                        {depositedERC721.length === 0 && (
                            <Button color={"light"} disabled>
                                <img
                                    src={metamask}
                                    alt="icon"
                                    className="w-6 h-5 object-cover mr-2 group-hover:rotate-180 duration-1000"
                                />
                                No token deposited
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-span-2 shadow-md bg-white rounded-lg px-4 py-2">
                <h1 className="text-2xl font-semibold pb-2">
                    Contract Information
                </h1>
                <div className="flex flex-col gap-2">
                    <span>WalletBalance: {walletBalance} GO</span>
                    <span>Default APR: {defaultApr}%</span>
                    <span>APR: {apr}%</span>
                    <span>BalanceERC20: {balanceERC20}</span>
                    <span>BalanceERC721: {balanceERC721}</span>
                    <span>DepositedERC721: {depositedERC721.length}</span>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
