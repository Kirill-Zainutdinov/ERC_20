import { BigNumber } from "ethers"
import { ethers } from "hardhat"

async function main() {
    const [owner] = await ethers.getSigners()

    // deploy token
    const ERC20 = await ethers.getContractFactory("ERC20")
    
    let name = "TestToken"
    let symbol = "TT"
    let decimals = 18
    let tokenA = await ERC20.deploy(name, symbol, decimals)
    await tokenA.deployed()
    console.log(`TokenA deployed at the address ${tokenA.address}`)

    // mint token
    const tokenEmissionA = BigNumber.from(10).pow(decimals)
    let tx  = await tokenA.mint(owner.address, tokenEmissionA)
    await tx.wait()
    console.log(`Token balance is ${await tokenA.balanceOf(owner.address)}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
