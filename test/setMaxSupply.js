const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")
const utils = ethers.utils

describe("setMaxSupply tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 3, 18)

        await Family.connect(wallet1).mintHuman(
            utils.formatBytes32String("Bob"),
            utils.formatBytes32String("Alice"),
            utils.formatBytes32String("Wellingtone"),
            {
                value: ethers.utils.parseEther("0.05"),
            }
        )
        await Family.connect(wallet1).mintHuman(
            utils.formatBytes32String("Charlie"),
            utils.formatBytes32String("Ketty"),
            utils.formatBytes32String("Soprano"),
            {
                value: ethers.utils.parseEther("0.05"),
            }
        )
    })
    describe("negative tests", function () {
        it("should revert if owner trying to set max supply lower than total supply", async function () {
            await expect(Family.setMaxSupply(0)).to.be.revertedWith("Max supply cannot be lower than total supply")
        })
        it("should revert if not the owner trying to set max supply", async function () {
            await expect(Family.connect(wallet1).setMaxSupply(4)).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
    describe("positive test", function () {
        it("should successfully set a new maximum supply", async function () {
            await Family.setMaxSupply(50)
            expect(await Family.getMaxSupply()).to.equal(50)
        })
        it("should emit an MaxSupplyUpdated event", async () => {
            await expect(Family.setMaxSupply(100)).to.emit(Family, "MaxSupplyUpdated").withArgs(100)
        })
    })
})
