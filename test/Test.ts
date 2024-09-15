import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
describe("Test", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        // Deploy ERC20Token contract
        const ERC20TokenFactory = await ethers.getContractFactory("ERC20Token");
        const ERC20Token = await ERC20TokenFactory.deploy(100000000);
        const ERC20Address = await ERC20Token.getAddress();

        // Deploy ERC721Token contract
        const ERC721TokenFactory = await ethers.getContractFactory(
            "ERC721Token"
        );
        const ERC721Token = await ERC721TokenFactory.deploy();
        const ERC721Address = await ERC721Token.getAddress();

        // Deploy APR contract
        const APRFactory = await ethers.getContractFactory("APR");
        const APR = await APRFactory.deploy(ERC20Address, ERC721Address);
        const APRAddress = await APR.getAddress();
        // Approve for APR contract
        await ERC20Token.approveForTransfer(APRAddress);
        await ERC721Token.approveForMint(APRAddress);

        // Fixtures can return anything you consider useful for your tests
        return {
            ERC20Token,
            ERC721Token,
            APR,
            ERC20Address,
            ERC721Address,
            APRAddress,
            owner,
            addr1,
            addr2,
        };
    }

    it("Should faucet", async function () {
        const { APR, ERC20Token, owner, addr1 } = await loadFixture(
            deployTokenFixture
        );
        await ERC20Token.connect(addr1).faucet(1000000);
        expect(await APR.getErc20Balance()).to.equal(
            ethers.parseEther("99000000")
        );
        expect(await APR.connect(addr1).getErc20Balance()).to.equal(
            ethers.parseEther("1000000")
        );
    });

    it("Should deposit", async function () {
        const { ERC20Token, APR, APRAddress } = await loadFixture(
            deployTokenFixture
        );
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        expect(await APR.getErc20Balance()).to.equal(
            ethers.parseEther("99000000")
        );
    });

    it("Should withdraw", async function () {
        const { ERC20Token, APR, APRAddress } = await loadFixture(
            deployTokenFixture
        );
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        await time.increase(40);
        await APR.withdraw();
        expect(await APR.getErc20Balance()).to.equal(
            ethers.parseEther("100000000")
        );
    });

    it("Shouldn't withdraw", async function () {
        const { ERC20Token, APR, APRAddress } = await loadFixture(
            deployTokenFixture
        );
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        await time.increase(20);
        await expect(APR.withdraw()).to.be.revertedWith(
            "APR: Withdraw interval is not passed"
        );
    });

    it("Should claimreward", async function () {
        const { ERC20Token, APR, APRAddress, addr1 } = await loadFixture(
            deployTokenFixture
        );
        await ERC20Token.connect(addr1).faucet(1000000);
        await ERC20Token.connect(addr1).approve(
            APRAddress,
            ethers.parseEther("1000000")
        );
        await APR.connect(addr1).deposit(1000000);
        await time.increase(40);
        await APR.connect(addr1).claimReward();
        expect(await APR.getErc20Balance()).to.greaterThan(
            ethers.parseEther("0")
        );
    });

    it("Shouldn't claimreward", async function () {
        const { ERC20Token, APR, APRAddress, addr1 } = await loadFixture(
            deployTokenFixture
        );
        await ERC20Token.connect(addr1).faucet(1000000);
        await ERC20Token.connect(addr1).approve(
            APRAddress,
            ethers.parseEther("1000000")
        );
        await APR.connect(addr1).deposit(1000000);
        await time.increase(20);
        await expect(APR.connect(addr1).claimReward()).to.be.revertedWith(
            "APR: Claim interval is not passed"
        );
    });

    it("Should get APR", async function () {
        const { ERC20Token, APR, APRAddress, owner } = await loadFixture(
            deployTokenFixture
        );
        expect(await APR.getAPR(owner.address)).to.equal(8);
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        await time.increase(40);
        expect(await APR.getAPR(owner.address)).to.equal(8);
    });

    it("Should deposit ERC721", async function () {
        const { ERC20Token, APR, APRAddress } = await loadFixture(
            deployTokenFixture
        );
        expect((await APR.getErc721Balance()).length).to.equal(0);
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        expect((await APR.getErc721Balance()).length).to.equal(1);
    });

    it("Should get APR 10%", async function () {
        const { ERC20Token, APR, ERC721Token, APRAddress, owner } =
            await loadFixture(deployTokenFixture);
        expect(await APR.getAPR(owner.address)).to.equal(8);
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        await time.increase(100);
        await ERC721Token.approve(APRAddress, 0);
        await APR.depositERC721(0);
        expect(await APR.getAPR(owner.address)).to.equal(10);
        expect((await APR.getErc721Balance()).length).to.equal(0);
        expect((await APR.getDepositNftCount()).length).to.equal(1);
    });

    it("Should get APR 8%", async function () {
        const { ERC20Token, APR, ERC721Token, APRAddress, owner } =
            await loadFixture(deployTokenFixture);
        await ERC20Token.approve(APRAddress, ethers.parseEther("1000000"));
        await APR.deposit(1000000);
        await time.increase(100);
        await ERC721Token.approve(APRAddress, 0);
        await APR.depositERC721(0);
        await time.increase(40);
        await APR.withdrawERC721(0);
        expect(await APR.getAPR(owner.address)).to.equal(8);
        expect((await APR.getErc721Balance()).length).to.equal(1);
        expect((await APR.getDepositNftCount()).length).to.equal(0);
    });
});
