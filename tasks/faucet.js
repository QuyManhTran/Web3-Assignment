const fs = require("fs");

task("faucet", "Sends 1 ETH to an address")
    .addPositionalParam("receiver", "The address that will receive them")
    .setAction(async ({ receiver }, { ethers }) => {
        if (network.name === "hardhat") {
            console.warn(
                "You are running the faucet task with Hardhat network, which" +
                    "gets automatically created and destroyed every time. Use the Hardhat" +
                    " option '--network localhost'"
            );
        }

        // const addressesFile =
        //     __dirname + "/../client/src/contracts/contract-address.json";

        // if (!fs.existsSync(addressesFile)) {
        //     console.error("You need to deploy your contract first");
        //     return;
        // }

        // const addressJson = fs.readFileSync(addressesFile);
        // const address = JSON.parse(addressJson);

        // if ((await ethers.provider.getCode(address.Token)) === "0x") {
        //     console.error("You need to deploy your contract first");
        //     return;
        // }

        // const token = await ethers.getContractAt("Token", address.Token);
        const [sender] = await ethers.getSigners();

        const tx2 = await sender.sendTransaction({
            to: receiver,
            value: ethers.parseEther("1"),
        });
        await tx2.wait();

        console.log(`Transferred 1 ETH to ${receiver}`);
    });
