const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("tests of constructors data assignment", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 10000, 18)
    })
    it("should assign mint price properly", async function () {
        expect(await Family.connect(wallet1).getMintPrice()).to.equal("50000000000000000")
    })
    it("should assign max supply properly", async function () {
        expect(await Family.connect(wallet1).getMaxSupply()).to.equal(10000)
    })
    it("should assign initial maturity age properly", async function () {
        expect(await Family.connect(wallet1).getInitialMaturityAge()).to.equal(18)
    })
})
