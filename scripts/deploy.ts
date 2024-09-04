// npx hardhat run scripts/deploy.ts --network tBSC
import { ethers, artifacts } from "hardhat";
import path from "path";

async function main() {
    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("Deploying the contracts with the account:", deployerAddress);

    console.log(
        "Account balance:",
        (await deployer.provider.getBalance(deployer.address)).toString()
    );
    // deploy ERC20Token contract
    const ERC20TokenFactory = await ethers.getContractFactory("ERC20Token");
    const ERC20Token = await ERC20TokenFactory.deploy(100000000);
    await ERC20Token.waitForDeployment();
    const ERC20Address = await ERC20Token.getAddress();
    const ERC20Receipt = await ERC20Token.deploymentTransaction()?.wait();
    const ERC20BlockNumber = ERC20Receipt?.blockNumber;
    console.log(
        "ERC20Token contract deployment transaction hash:",
        ERC20BlockNumber
    );
    console.log("ERC20Token contract deployed to:", ERC20Address);

    // deploy ERC721Token contract
    const ERC721TokenFactory = await ethers.getContractFactory("ERC721Token");
    const ERC721Token = await ERC721TokenFactory.deploy();
    await ERC721Token.waitForDeployment();
    const ERC721Address = await ERC721Token.getAddress();
    const ERC721Receipt = await ERC721Token.deploymentTransaction()?.wait();
    const ERC721BlockNumber = ERC721Receipt?.blockNumber;
    console.log(
        "ERC721Token contract deployment transaction hash:",
        ERC721BlockNumber
    );
    console.log("ERC721Token contract deployed to:", ERC721Address);

    // deploy APR contract
    const APRFactory = await ethers.getContractFactory("APR");
    const APR = await APRFactory.deploy(ERC20Address, ERC721Address);
    await APR.waitForDeployment();
    const APRAddress = await APR.getAddress();
    const APRReceipt = await APR.deploymentTransaction()?.wait();
    const APRBlockNumber = APRReceipt?.blockNumber;
    console.log("APR contract deployment transaction hash:", APRBlockNumber);
    console.log("APR contract deployed to:", APRAddress);

    // We also save the contract's artifacts and address in the frontend directory
    saveServerFiles(ERC20Address, "ERC20Token", ERC20BlockNumber as number);
    saveServerFiles(ERC721Address, "ERC721Token", ERC721BlockNumber as number);
    saveServerFiles(APRAddress, "APR", APRBlockNumber as number);
    saveServerFiles(
        ERC20Address,
        "ERC20Token",
        ERC20BlockNumber as number,
        true
    );
    saveServerFiles(
        ERC721Address,
        "ERC721Token",
        ERC721BlockNumber as number,
        true
    );
    saveServerFiles(
        APRAddress,
        "APR",
        APRBlockNumber as number,
        true,
        deployerAddress
    );

    await ERC20Token.connect(deployer).approveForTransfer(APRAddress);
    await ERC721Token.connect(deployer).approveForMint(APRAddress);
}

function saveServerFiles(
    address: string,
    contractName: string,
    blockNumber: number,
    isServer: boolean = false,
    ownerAddress?: string
) {
    const fs = require("fs");
    const contractsDir = isServer
        ? path.join(__dirname, "..", "server", "contracts", contractName)
        : path.join(
              __dirname,
              "..",
              "client",
              "src",
              "contracts",
              contractName
          );

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify(
            contractName === "APR" && isServer
                ? { Token: address, BlockNumber: blockNumber, ownerAddress }
                : { Token: address, BlockNumber: blockNumber },
            undefined,
            2
        )
    );

    const TokenArtifact = artifacts.readArtifactSync(contractName);

    fs.writeFileSync(
        path.join(contractsDir, "Token.json"),
        JSON.stringify(TokenArtifact, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
