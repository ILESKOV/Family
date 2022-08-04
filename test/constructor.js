const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("tests of constructors data assignment", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 10000, 18)
    })
    describe("negative tests", function () {
        it("should revert if owner set mint price to zero in constructor", async function () {
            await expect(family.deploy(0, 10000, 18)).to.be.revertedWith("Mint price cannot be zero")
        })
        it("should revert if owner set max supply to 0 in constructor", async function () {
            await expect(family.deploy("50000000000000000", 0, 18)).to.be.revertedWith("Max supply cannot be zero")
        })
        it("should revert if owner set maturity age lower than 16 in constructor", async function () {
            await expect(family.deploy("50000000000000000", 10000, 15)).to.be.revertedWith(
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
