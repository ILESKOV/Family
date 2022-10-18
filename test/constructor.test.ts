import { expect } from "chai"
import { ethers } from "hardhat"
import { ContractFactory, Contract, Signer, BigNumber } from "ethers"

const contractName = "Family"
let contractFactory: ContractFactory
let Family: Contract
let owner: Signer
let wallet1: Signer
let wallet2: Signer
let ownerWallet: string
let wallet1Wallet: string
let wallet2Wallet: string

describe("tests of constructors data assignment", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()
        ownerWallet = await owner.getAddress()
        wallet1Wallet = await wallet1.getAddress()
        wallet2Wallet = await wallet2.getAddress()

        contractFactory = await ethers.getContractFactory(contractName, owner)
        Family = await contractFactory.deploy("50000000000000000", 10000, 18)
    })
    describe("negative tests", function () {
        it("should revert if owner set mint price to zero in constructor", async function () {
            await expect(contractFactory.deploy(0, 10000, 18)).to.be.revertedWith("Mint price cannot be zero")
        })
        it("should revert if owner set max supply to 0 in constructor", async function () {
            await expect(contractFactory.deploy("50000000000000000", 0, 18)).to.be.revertedWith(
                "Max supply cannot be zero"
            )
        })
        it("should revert if owner set maturity age lower than 16 in constructor", async function () {
            await expect(contractFactory.deploy("50000000000000000", 10000, 15)).to.be.revertedWith(
                "Maturity age must be higher than 16"
            )
        })
    })
    describe("positive tests", function () {
        it("should assign mint price properly", async function () {
            expect(await Family.connect(wallet1).getMintPrice()).to.equal("50000000000000000")
        })
        it("should assign max supply properly", async function () {
            expect(await Family.connect(wallet1).getMaxSupply()).to.equal(10000)
        })
        it("should assign initial maturity age properly", async function () {
            expect(await Family.connect(wallet1).getMaturityAge()).to.equal(18)
        })
    })
})
