const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("setMaturityAge tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 3, 18)

        await Family.connect(wallet1).mintHuman("Bob", "Alice", "Wellingtone", {
            value: ethers.utils.parseEther("0.05"),
        })
        await Family.connect(wallet1).mintHuman("Charlie", "Ketty", "Soprano", {
            value: ethers.utils.parseEther("0.05"),
        })
    })
    describe("negative tests", function () {
        it("should revert if owner trying to set maturity age lower than 16 y.o", async function () {
            await expect(Family.setMaturityAge(15)).to.be.revertedWith("Needs to be older")
        })
        it("should revert if not the owner trying to set maturity age", async function () {
            await expect(Family.connect(wallet1).setMaturityAge(18)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })
    })
    describe("positive test", function () {
        it("should successfully set a new maximum supply", async function () {
            await Family.setMaturityAge(21)
            expect(await Family.getMaturityAge()).to.equal(21)
        })
        it("should emit an MaturityAgeUpdated event", async () => {
            await expect(Family.setMaturityAge(20)).to.emit(Family, "MaturityAgeUpdated").withArgs(20)
        })
    })
})
