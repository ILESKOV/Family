import { ethers, run } from "hardhat"
import dotenv from "dotenv"
import { Family__factory } from "../typechain-types"

dotenv.config()

const { MINT_PRICE, MAX_SUPPLY, MATURITY_AGE } = process.env

async function main() {
    const [signer] = await ethers.getSigners()

    const Family = await new Family__factory(signer).deploy(
        MINT_PRICE !== undefined ? MINT_PRICE : 0,
        MAX_SUPPLY !== undefined ? MAX_SUPPLY : 0,
        MATURITY_AGE !== undefined ? MATURITY_AGE : 0
    )

    await Family.deployed()

    console.log("Family contract deployed to:", Family.address)

    //Wait few block in order to verify successfully in one script
    await new Promise((f) => setTimeout(f, 60000))

    await run("verify:verify", {
        address: Family.address,
        contract: "contracts/Family.sol:Family",
        constructorArguments: [MINT_PRICE, MAX_SUPPLY, MATURITY_AGE],
    })
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
