import { task } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
});

// Transfer function
task("transfer", "Sending funds")
    .addParam("to")
    .addParam("value")
    .addParam("tokenAddress")
    .setAction(async (args, hre) => {
        // connect to contract
        const ERC20Factory = (await hre.ethers.getContractFactory("ERC20"))
        const erc20 = ERC20Factory.attach(args.tokenAddress)

        // save balance before transfer
        const balanceBefore = await erc20.balanceOf(args.to);

        // call function transfer
        const tx = await erc20.transfer(args.to, args.value);
        await tx.wait();

        // save balance after transfer
        const balanceAfter = await erc20.balanceOf(args.to);

        console.log("The sending of the funds was successful.")
        console.log(`The balance of the ${args.to} address has changed from ${balanceBefore} to ${balanceAfter}`)
});

// Approve function
task("approve", "Permission to send funds")
    .addParam("spender")
    .addParam("value")
    .addParam("tokenAddress")
    .setAction(async (args, hre) => {
        // подключаемся к контракту
        const ERC20Factory = (await hre.ethers.getContractFactory("ERC20"))
        const erc20 = ERC20Factory.attach(args.tokenAddress);

        // save allownce before approve
        const [account] = await hre.ethers.getSigners();
        const approveBefore = await erc20.allowance(account.address, args.spender);
        
        // call function approve
        const tx = await erc20.approve(args.spender, args.value);
        await tx.wait();

        // save allownce after approve
        const approveAfter = await erc20.allowance(account.address, args.spender);

        console.log("approval successfully changed")
        console.log(`Address ${args.spender} was allowed to spend ${approveBefore} tokens of address ${account.address}.`)
        console.log(`Now address ${args.spender} is allowed to spend ${approveAfter} tokens of address ${account.address}.`)
});

// transferFrom function
task("transferFrom", "Sending funds by permission")
    .addParam("from")
    .addParam("to")
    .addParam("value")
    .addParam("tokenAddress")
    .setAction(async (args, hre) => {
        // connect to contract
        const ERC20Factory = (await hre.ethers.getContractFactory("ERC20"))
        const erc20 = ERC20Factory.attach(args.tokenAddress);

        // save balance before transfer
        const balanceBefore = await erc20.balanceOf(args.to);
        
        // call function transferFrom
        const tx = await erc20.transferFrom(args.from, args.to, args.value);
        await tx.wait();

        // save balance after transfer
        const balanceAfter = await erc20.balanceOf(args.to);

        console.log("The sending of the funds was successful ")
        console.log(`The balance of the ${args.to} address has changed from ${balanceBefore} to ${balanceAfter}`)
});

