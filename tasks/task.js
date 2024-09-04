const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const fs = require("fs");

task("task", "Run task to implement all function in one task").setAction(
    async () => {
        if (network.name === "hardhat") {
            console.warn(
                "You are running the faucet task with Hardhat network, which" +
                    "gets automatically created and destroyed every time. Use the Hardhat" +
                    " option '--network localhost'"
            );
        }

        const ERC20AddressFile =
            __dirname + "/../server/contracts/ERC20Token/contract-address.json";

        if (!fs.existsSync(ERC20AddressFile)) {
            console.error("You need to deploy your contract first");
            return;
        }

        const ERC20AddressJson = fs.readFileSync(ERC20AddressFile);
        const ERC20Address = JSON.parse(ERC20AddressJson).Token;

        const ERC721AddressFile =
            __dirname +
            "/../server/contracts/ERC721Token/contract-address.json";
        const ERC721AddressJson = fs.readFileSync(ERC721AddressFile);
        const ERC721Address = JSON.parse(ERC721AddressJson).Token;

        const APRAddressFile =
            __dirname + "/../server/contracts/APR/contract-address.json";
        const APRAddressJson = fs.readFileSync(APRAddressFile);
        const APRAddress = JSON.parse(APRAddressJson).Token;

        if ((await ethers.provider.getCode(ERC721Address)) === "0x") {
            console.error("You need to deploy your contract first");
            return;
        }

        const ERC20Token = await ethers.getContractAt(
            "ERC20Token",
            ERC20Address
        );

        const ERC721Token = await ethers.getContractAt(
            "ERC721Token",
            ERC721Address
        );
        const [owner, user1] = await ethers.getSigners();
        const APR = await ethers.getContractAt("APR", APRAddress);

        console.log(owner.address, user1.address);
        await ERC20Token.approveForTransfer(APRAddress);
        await ERC721Token.approveForMint(APRAddress);
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        await time.increase(30);
        await APR.claimReward();
        await time.increase(100);
        await ERC721Token.approve(APRAddress, 0);
        await APR.depositERC721(0);
        await time.increase(20);
        await APR.withdrawERC721(0);
        console.log("apr: ", await APR.getAPR(owner.address));
        console.log("erc20: ", await APR.getErc20Balance());
        console.log("erc721: ", await APR.getErc721Balance());
    }
);
