const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

let owner, Token

beforeEach(async () => {
    ;[owner, wallet1, wallet2] = await ethers.getSigners()
    provider = ethers.getDefaultProvider()

    family = await ethers.getContractFactory("Family", owner)
    Family = await family.deploy("50000000000000000", 3, 18)

    await Family.connect(wallet1).mintHuman("Bob", "Alice", "Wellingtone", { value: ethers.utils.parseEther("0.05") })
    await Family.connect(wallet1).mintHuman("Charlie", "Ketty", "Soprano", { value: ethers.utils.parseEther("0.05") })
})
describe("withdrawETH tests", function () {
    describe("negative tests", function () {
        it("should revert if not owner is caller", async () => {
            await expect(Family.connect(wallet1).withdrawETH(BigNumber.from("1000000000000000000"))).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })
        it("should revert if owner request too much ETH", async () => {
            await expect(Family.withdrawETH(BigNumber.from("10000000000000000000"))).to.be.revertedWith(
                "Not enough ETH"
            )
        })
    })
    describe("positive tests", function () {
        it("should check amount of ether chanched after owner withdrawed ETH", async () => {
            await Family.withdrawETH(BigNumber.from("30000000000000000"))
            expect(await ethers.provider.getBalance(Family.address)).to.equal("70000000000000000")
        })
        it("should emit an WithdrawalOfOwner event", async () => {
            await expect(Family.withdrawETH(BigNumber.from("100000000000000000")))
                .to.emit(Family, "WithdrawalOfOwner")
                .withArgs(owner.address, BigNumber.from("100000000000000000"))
        })
    })
})
