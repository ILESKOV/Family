const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("breeding tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 7, 18)

        mockedFamily = await ethers.getContractFactory("MockedFamily", owner)
        MockedFamily = await mockedFamily.deploy("50000000000000000", 7, 18)

        await Family.connect(wallet1).mintHuman("Franklin", "Nancy", "Pelosi", {
            value: ethers.utils.parseEther("0.05"),
        })
        await Family.connect(wallet2).mintHuman("Bob", "Alice", "Wellingtone", {
            value: ethers.utils.parseEther("0.05"),
        })
        await Family.connect(wallet2).mintHuman("Charlie", "Ketty", "Soprano", {
            value: ethers.utils.parseEther("0.05"),
        })
        await Family.connect(wallet2).mintHuman("Jason", "Abigail", "Schwarz", {
            value: ethers.utils.parseEther("0.05"),
        })
        await MockedFamily.connect(wallet1).mintHuman("Franklin", "Nancy", "Pelosi", {
            value: ethers.utils.parseEther("0.05"),
        })
        await MockedFamily.connect(wallet2).mintHuman("Bob", "Alice", "Wellingtone", {
            value: ethers.utils.parseEther("0.05"),
        })
        await MockedFamily.connect(wallet2).mintHuman("Charlie", "Ketty", "Soprano", {
            value: ethers.utils.parseEther("0.05"),
        })
        await MockedFamily.connect(wallet2).mintHuman("Jason", "Abigail", "Schwarz", {
            value: ethers.utils.parseEther("0.05"),
        })
    })
    describe("negative tests", function () {
        it("should revert if user trying to mint when maxSupply is reached", async function () {
            await Family.connect(wallet1).mintHuman("Michael", "Amanda", "De Santa", {
                value: ethers.utils.parseEther("0.05"),
            })
            await Family.connect(wallet2).mintHuman("Alexandro", "Joanna", "Rohas", {
                value: ethers.utils.parseEther("0.05"),
            })
            await Family.connect(wallet2).mintHuman("Richard", "Olivia", "White", {
                value: ethers.utils.parseEther("0.05"),
            })
            await expect(Family.connect(wallet2).breeding(1, 2, "Derek", "Angel")).to.be.revertedWith(
                "Collection sold out"
            )
        })
        it("should revert if user past one parent as 2 parents as parameters", async function () {
            await expect(Family.connect(wallet1).breeding(1, 1, "Derek", "Angel")).to.be.revertedWith(
                "One parent cannot reproduce alone"
            )
        })
        it("should revert if the user tries to breed a new token using a token owned by another user ", async function () {
            await expect(Family.connect(wallet2).breeding(0, 3, "Derek", "Angel")).to.be.revertedWith(
                "You are not the owner of one or more NFTs"
            )
        })
        it("should revert if the user tries to breed two tokens with the same gender", async function () {
            await expect(MockedFamily.connect(wallet2).breeding(2, 3, "Derek", "Angel")).to.be.revertedWith(
                "Tokens share the same gender and cannot reproduce themselves"
            )
        })
    })
    describe("positive tests", function () {
        it("should assign id properly to KID_GIRL object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[0]).to.equal(4)
        })
        it("should assign gender properly to KID_GIRL object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[1]).to.equal(3)
        })
        it("should assign name properly to KID_GIRL object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[2]).to.equal("Angel")
        })
        it("should assign lastName properly to KID_GIRL object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[3]).to.equal("Wellingtone")
        })
        it("should assign id properly to KID_BOY object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            await MockedFamily.connect(wallet2).breeding(1, 3, "Thomas", "Eva")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(5))[0]).to.equal(5)
        })
        it("should assign gender properly to KID_BOY object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            await MockedFamily.connect(wallet2).breeding(1, 3, "Thomas", "Eva")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(5))[1]).to.equal(2)
        })
        it("should assign name properly to KID_BOY object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            await MockedFamily.connect(wallet2).breeding(1, 3, "Thomas", "Eva")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(5))[2]).to.equal("Thomas")
        })
        it("should assign lastName properly to KID_BOY object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            await MockedFamily.connect(wallet2).breeding(2, 1, "Thomas", "Eva")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(5))[3]).to.equal("Soprano")
        })
        it("should assign actualAge properly to Human object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[4]).to.equal(0)
        })
        it("should assign mintAge properly to Human object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[5]).to.equal(0)
        })
        it("should assign mintTime properly to Human object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[6]).to.equal(timestampAfter)
        })
        it("should assign owner address properly to Human object", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(4))[7]).to.equal(wallet2.address)
        })
        it("should check totalSupply is correct", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect(await MockedFamily.connect(wallet1).getTotalSupply()).to.equal(5)
        })
        it("should _ownerHumanCount mapping was updated", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect(await MockedFamily.connect(wallet1).getCountOfHumans(wallet2.address)).to.equal(4)
        })
        it("should check _humanToOwner mapping was updated", async function () {
            await MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel")
            expect(await MockedFamily.getOwnerOfHuman(4)).to.equal(wallet2.address)
            console.log("      New OBJECT is:" + (await MockedFamily.connect(wallet1).getDataAboutHuman(4)))
        })
        it("should emit an NewHuman event", async () => {
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            await expect(MockedFamily.connect(wallet2).breeding(1, 3, "Derek", "Angel"))
                .to.emit(MockedFamily, "NewHuman")
                .withArgs(4, 3, "Angel", "Wellingtone", 0, timestampAfter + 1, wallet2.address)
        })
    })
})
