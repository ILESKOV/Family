const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("mintHuman tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()

        family = await ethers.getContractFactory("Family", owner)
        Family = await family.deploy("50000000000000000", 3, 18)

        mockedFamily = await ethers.getContractFactory("MockedFamily", owner)
        MockedFamily = await mockedFamily.deploy("50000000000000000", 3, 18)

        await Family.connect(wallet1).mintHuman("Bob", "Alice", "Wellingtone", {
            value: ethers.utils.parseEther("0.05"),
        })
        await Family.connect(wallet1).mintHuman("Charlie", "Ketty", "Soprano", {
            value: ethers.utils.parseEther("0.05"),
        })
        await MockedFamily.connect(wallet1).mintHuman("Bob", "Alice", "Wellingtone", {
            value: ethers.utils.parseEther("0.05"),
        })
        await MockedFamily.connect(wallet1).mintHuman("Charlie", "Ketty", "Soprano", {
            value: ethers.utils.parseEther("0.05"),
        })
    })
    describe("negative tests", function () {
        it("should revert if user submit not enough ETH for the mint", async function () {
            await expect(
                Family.connect(wallet1).mintHuman("Bob", "Monica", "Siegal", {
                    value: ethers.utils.parseEther("0.049"),
                })
            ).to.be.revertedWith("Not enough ether for a mint")
        })
        it("should revert if user trying to mint when maxSupply is reached", async function () {
            await Family.connect(wallet1).mintHuman("Michael", "Amanda", "De Santa", {
                value: ethers.utils.parseEther("0.05"),
            })
            await expect(
                Family.connect(wallet1).mintHuman("Derek", "Angela", "Frost", {
                    value: ethers.utils.parseEther("0.05"),
                })
            ).to.be.revertedWith("Collection sold out")
        })
    })
    describe("positive tests", function () {
        it("should assign id properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[0]).to.equal(1)
        })
        it("should assign gender properly to Human object", async function () {
            console.log("      Random gender is:" + (await Family.connect(wallet1).getDataAboutHuman(1))[1])
            console.log("      Mocked gender is:" + (await MockedFamily.connect(wallet1).getDataAboutHuman(1))[1])
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(1))[1]).to.equal(1)
        })
        it("should assign name properly to Human object", async function () {
            console.log("      Random name is:" + (await Family.connect(wallet1).getDataAboutHuman(1))[2])
            console.log("      Mocked name is:" + (await MockedFamily.connect(wallet1).getDataAboutHuman(1))[2])
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(1))[2]).to.equal("Ketty")
        })
        it("should assign lastName properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[3]).to.equal("Soprano")
        })
        it("should assign actualAge properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[4]).to.equal(18)
        })
        it("should assign mintAge properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[5]).to.equal(18)
        })
        it("should assign mintTime properly to Human object", async function () {
            await Family.connect(wallet1).mintHuman("Douglas", "Rosey", "Bruk", {
                value: ethers.utils.parseEther("0.05"),
            })
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[6]).to.equal(timestampAfter - 3)
        })
        it("should assign owner address properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[7]).to.equal(wallet1.address)
        })
        it("should check totalSupply is correct", async function () {
            expect(await Family.connect(wallet1).getTotalSupply()).to.equal(2)
        })
        it("should _ownerHumanCount mapping was updated", async function () {
            await Family.connect(wallet1).mintHuman("Franklin", "Nancy", "Pelosi", {
                value: ethers.utils.parseEther("0.05"),
            })
            expect(await Family.connect(wallet1).getCountOfHumans(wallet1.address)).to.equal(3)
        })
        it("should check _humanToOwner mapping was updated", async function () {
            expect(await Family.getOwnerOfHuman(1)).to.equal(wallet1.address)
            console.log("      New OBJECT is:" + (await Family.connect(wallet1).getDataAboutHuman(1)))
        })
        it("should emit an NewHuman event", async () => {
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            await expect(
                MockedFamily.connect(wallet1).mintHuman("Douglas", "Rosey", "Bruk", {
                    value: ethers.utils.parseEther("0.05"),
                })
            )
                .to.emit(MockedFamily, "NewHuman")
                .withArgs(2, 1, "Rosey", "Bruk", 18, timestampAfter + 1, wallet1.address)
        })
    })
})
