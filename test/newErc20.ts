import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20, ERC20__factory } from "../typechain-types";

describe("Testing ERC20",  function () {

    async function deployErc20() {
        const name = "TestToken"
        const symbol = "TT"
        const decimals = 18
        const [owner, account_1, account_2, hacker] = await ethers.getSigners()
    
        const ERC20 = await ethers.getContractFactory("ERC20")
        const erc20 = await ERC20.deploy(name, symbol, decimals)
    
        return { erc20, name, symbol, decimals, owner, account_1, account_2, hacker }
    }

    describe("Deployment", function () {

        it("Check that the token name is set correctly", async function () {
            const { erc20, name } = await loadFixture(deployErc20)

            expect(await erc20.name()).to.equal(name);
        })

        it("Check that the token symbol is set correctly", async function () {
            const { erc20, symbol} = await loadFixture(deployErc20)

            expect(await erc20.symbol()).to.equal(symbol);
        })

        it("Check that the token decimals is set correctly", async function () {
            const { erc20, decimals} = await loadFixture(deployErc20)

            expect(await erc20.decimals()).to.equal(decimals);
        })

        it("Check that the token totalSupply is set correctly", async function () {
            const { erc20 } = await loadFixture(deployErc20)

            expect(await erc20.totalSupply()).to.equal(0);
        })
    })

    describe("Mint", function () {
        describe("Require", function () {
            it("Check that only the contract owner can do token emission", async function () {
                const { erc20, hacker, decimals} = await loadFixture(deployErc20)
    
                await expect(
                    erc20.connect(hacker).mint(hacker.address, BigNumber.from(10).pow(decimals))
                ).to.be.revertedWith("ERC20: You are not owner");
            })
        })

        describe("Mint", function () {
            it("Check that token emission correctly changes the balance of the account", async function () {
                const { erc20, account_1, decimals} = await loadFixture(deployErc20)
    
                const balanceBeforeMint = await erc20.balanceOf(account_1.address)
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                const tx = await erc20.mint(account_1.address, tokenEmission)
                await tx.wait()
    
                expect(await erc20.balanceOf(account_1.address))
                .to.equal(balanceBeforeMint.add(tokenEmission))
            })
    
            it("Check that token emission correctly changes the totalSupply", async function () {
                const { erc20, account_1, decimals} = await loadFixture(deployErc20)
    
                const totalSupplyBeforeMint = await erc20.totalSupply()
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                const tx = await erc20.mint(account_1.address, tokenEmission)
                await tx.wait()
    
                expect(await erc20.totalSupply())
                .to.equal(totalSupplyBeforeMint.add(tokenEmission))
            })
        })

        describe("Event", function () {
            it("Check emit an event on Transfer", async function () {
                const { erc20, account_1, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
                const zeroAddress = "0x0000000000000000000000000000000000000000"

                await expect(erc20.mint(account_1.address, tokenEmission))
                    .to.emit(erc20, "Transfer")
                    .withArgs(zeroAddress, account_1.address, tokenEmission)
            })
        })
    })

    describe("Approve", function () {

        describe("Approve", function () {
            it("Check that the function approve works correctly", async function () {
                const { erc20, decimals, owner, account_1} = await loadFixture(deployErc20)
    
                const allowanceBeforeApprove = await erc20.allowance(owner.address, account_1.address)
                const tokenApprove = BigNumber.from(10).pow(decimals)
    
                const tx = await erc20.approve(account_1.address, tokenApprove)
                await tx.wait()
    
                expect(await erc20.allowance(owner.address, account_1.address))
                .to.equal(allowanceBeforeApprove.add(tokenApprove))
            })
    
        })

        describe("Event", function () {
            it("Check emit an event on Approval", async function () {
                const { erc20, owner, account_1, decimals} = await loadFixture(deployErc20)
    
                const tokenApprove = BigNumber.from(10).pow(decimals)

                await expect(erc20.approve(account_1.address, tokenApprove))
                    .to.emit(erc20, "Approval")
                    .withArgs(owner.address, account_1.address, tokenApprove)
            })
        })
    })

    describe("Transfer", function () {
        describe("Require", function () {
            it("Check that there are enough tokens on the balance for the transfer", async function () {
                const { erc20, owner, hacker, decimals } = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                const tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                await expect(
                    erc20.transfer(hacker.address, ownerBalance.add(1))
                ).to.be.revertedWith("ERC20: not enough tokens");
            })
        })

        describe("Transfer", function () {
            it("Check that the function transfer works correctly", async function () {
                const { erc20, owner, account_1, account_2, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                const tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                await expect(erc20.transfer(account_1.address, ownerBalance)).to.changeTokenBalances(
                    erc20,
                    [owner.address, account_1.address],
                    [ownerBalance.mul(-1), ownerBalance]
                )
            })
        })

        describe("Event", function () {
            it("Check emit an event on Transfer", async function () {
                const { erc20, owner, account_1, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)

                const tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                await expect(erc20.transfer(account_1.address, ownerBalance))
                    .to.emit(erc20, "Transfer")
                    .withArgs(owner.address, account_1.address, ownerBalance)
            })
        })
    })

    describe("TransferFrom", function () {
        describe("Requires", function () {
            it("Check that there are enough tokens on the balance for the transfer", async function () {
                const { erc20, owner, hacker, decimals } = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                const tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                await expect(
                    erc20.connect(hacker).transferFrom(owner.address, owner.address, ownerBalance.add(1))
                ).to.be.revertedWith("ERC20: not enough tokens");
            })

            it("Check for approval to transfer the required number of tokens", async function () {
                const { erc20, owner, hacker, decimals } = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                let tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                tx = await erc20.approve(hacker.address, ownerBalance.sub(2))
                await tx.wait()

                await expect(
                    erc20.connect(hacker).transferFrom(owner.address, owner.address, ownerBalance)
                ).to.be.revertedWith("ERC20: no permission to spend");
            })
        })

        describe("TransferFrom", function () {
            it("Check that the balances of accounts in the transfer are changed correctly", async function () {
                const { erc20, owner, account_1, account_2, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                let tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                tx = await erc20.approve(account_1.address, ownerBalance)
                await tx.wait()

                await expect(erc20.connect(account_1).transferFrom(owner.address, account_1.address, ownerBalance))
                .to.changeTokenBalances(
                    erc20,
                    [owner.address, account_1.address],
                    [ownerBalance.mul(-1), ownerBalance]
                )
            })

            it("Check that the allowance of accounts in the transfer are changed correctly", async function () {
                const { erc20, owner, account_1, account_2, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                let tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                tx = await erc20.approve(account_1.address, ownerBalance)
                await tx.wait()

                const allowanceBeforeTransfer = await erc20.allowance(owner.address, account_1.address)

                tx = await erc20.connect(account_1).transferFrom(owner.address, account_1.address, ownerBalance)
                await tx.wait()

                expect(await erc20.allowance(owner.address, account_1.address))
                .to.equal(allowanceBeforeTransfer.sub(ownerBalance))
            })
        })

        describe("Event", function () {
            it("Check emit an event on Transfer", async function () {
                const { erc20, owner, account_1, account_2, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                let tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                tx = await erc20.approve(account_1.address, ownerBalance)
                await tx.wait()

                await expect(erc20.connect(account_1).transferFrom(owner.address, account_1.address, ownerBalance))
                    .to.emit(erc20, "Transfer")
                    .withArgs(owner.address, account_1.address, ownerBalance)
            })

            it("Check emit an event on Approval", async function () {
                const { erc20, owner, account_1, account_2, decimals} = await loadFixture(deployErc20)
    
                const tokenEmission = BigNumber.from(10).pow(decimals)
    
                let tx = await erc20.mint(owner.address, tokenEmission)
                await tx.wait()

                const ownerBalance = await erc20.balanceOf(owner.address)

                tx = await erc20.approve(account_1.address, ownerBalance)
                await tx.wait()

                const allowanceBeforeTransfer = await erc20.allowance(owner.address, account_1.address)

                await expect(erc20.connect(account_1).transferFrom(owner.address, account_1.address, ownerBalance))
                    .to.emit(erc20, "Approval")
                    .withArgs(owner.address, account_1.address, allowanceBeforeTransfer.sub(ownerBalance))
            })
        })
    })
})
