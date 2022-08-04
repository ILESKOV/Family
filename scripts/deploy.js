const hre = require("hardhat")
require("dotenv").config()
const { MINT_PRICE, MAX_SUPPLY, MATURITY_AGE } = process.env

async function main() {
    const family = await hre.ethers.getContractFactory("Family")
    const Family = await family.deploy(MINT_PRICE, MAX_SUPPLY, MATURITY_AGE)

    console.log("Family deployed to:", Family.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
