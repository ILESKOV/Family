const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("setMintPrice tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 7, 18)

        await Family.connect(wallet1).mintHuman("Bob", "Alice", "Wellingtone", {
            value: ethers.utils.parseEther("0.05"),
        })
        await Family.connect(wallet1).mintHuman("Charlie", "Ketty", "Soprano", {
            value: ethers.utils.parseEther("0.05"),
        })
    })
    describe("negative test", function () {
        it("should revert if not the owner trying to set max supply", async function () {
            await expect(Family.connect(wallet1).setMintPrice("10")).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })
    })
    describe("positive test", function () {
        it("should successfully set a new maximum supply", async function () {
            await Family.setMintPrice("1000000000000000000")
            expect(await Family.getMintPrice()).to.equal("1000000000000000000")
        })
        it("should emit an MintPriceUpdated event", async () => {
            await expect(Family.setMintPrice("1000000000000000000"))
                .to.emit(Family, "MintPriceUpdated")
                .withArgs("1000000000000000000")
        })
    })
})
