import { expect } from "chai"
import { ethers } from "hardhat"
import { ContractFactory, Contract, Signer, BigNumber } from "ethers"

const utils = ethers.utils
const contractName = "Family"
const mockName = "MockedFamily"
let contractFactory: ContractFactory
let mockedContractFactory: ContractFactory
let Family: Contract
let MockedFamily: Contract
let owner: Signer
let wallet1: Signer
let wallet2: Signer
let ownerWallet: string
let wallet1Wallet: string
let wallet2Wallet: string
let blockNumAfter: number
let timestampAfter: number
let blockAfter: any

describe("mintHuman tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()
        ownerWallet = await owner.getAddress()
        wallet1Wallet = await wallet1.getAddress()
        wallet2Wallet = await wallet2.getAddress()

        contractFactory = await ethers.getContractFactory(contractName, owner)
        Family = await contractFactory.deploy("50000000000000000", 3, 18)

        mockedContractFactory = await ethers.getContractFactory(mockName, owner)
        MockedFamily = await mockedContractFactory.deploy("50000000000000000", 3, 18)

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
        await MockedFamily.connect(wallet1).mintHuman(
            utils.formatBytes32String("Bob"),
            utils.formatBytes32String("Alice"),
            utils.formatBytes32String("Wellingtone"),
            {
                value: ethers.utils.parseEther("0.05"),
            }
        )
        await MockedFamily.connect(wallet1).mintHuman(
            utils.formatBytes32String("Charlie"),
            utils.formatBytes32String("Ketty"),
            utils.formatBytes32String("Soprano"),
            {
                value: ethers.utils.parseEther("0.05"),
            }
        )
    })
    describe("negative tests", function () {
        it("should revert if user submit not enough ETH for the mint", async function () {
            await expect(
                Family.connect(wallet1).mintHuman(
                    utils.formatBytes32String("Bob"),
                    utils.formatBytes32String("Monica"),
                    utils.formatBytes32String("Siegal"),
                    {
                        value: ethers.utils.parseEther("0.049"),
                    }
                )
            ).to.be.revertedWith("Not enough ether for a mint")
        })
        it("should revert if user trying to mint when maxSupply is reached", async function () {
            await Family.connect(wallet2).mintHuman(
                utils.formatBytes32String("Chris"),
                utils.formatBytes32String("Jessy"),
                utils.formatBytes32String("Rock"),
                {
                    value: ethers.utils.parseEther("0.05"),
                }
            )
            await Family.connect(wallet1).mintHuman(
                utils.formatBytes32String("Michael"),
                utils.formatBytes32String("Amanda"),
                utils.formatBytes32String("De Santa"),
                {
                    value: ethers.utils.parseEther("0.05"),
                }
            )
            await expect(
                Family.connect(wallet1).mintHuman(
                    utils.formatBytes32String("Derek"),
                    utils.formatBytes32String("Angela"),
                    utils.formatBytes32String("Frost"),
                    {
                        value: ethers.utils.parseEther("0.05"),
                    }
                )
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
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(1))[2]).to.equal(
                utils.formatBytes32String("Ketty")
            )
        })
        it("should assign lastName properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[3]).to.equal(
                utils.formatBytes32String("Soprano")
            )
        })
        it("should assign actualAge properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[4]).to.equal(18)
        })
        it("should assign mintAge properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[5]).to.equal(18)
        })
        it("should assign mintTime properly to Human object", async function () {
            await Family.connect(wallet1).mintHuman(
                utils.formatBytes32String("Douglas"),
                utils.formatBytes32String("Rosey"),
                utils.formatBytes32String("Bruk"),
                {
                    value: ethers.utils.parseEther("0.05"),
                }
            )
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[6]).to.equal(timestampAfter - 3)
        })
        it("should assign owner address properly to Human object", async function () {
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[7]).to.equal(wallet1Wallet)
        })
        it("should check totalSupply is correct", async function () {
            expect(await Family.connect(wallet1).getTotalSupply()).to.equal(2)
        })
        it("should _ownerHumanCount mapping was updated", async function () {
            await Family.connect(wallet1).mintHuman(
                utils.formatBytes32String("Franklin"),
                utils.formatBytes32String("Nancy"),
                utils.formatBytes32String("Pelosi"),
                {
                    value: ethers.utils.parseEther("0.05"),
                }
            )
            expect(await Family.connect(wallet1).getCountOfHumans(wallet1Wallet)).to.equal(3)
        })
        it("should check _humanToOwner mapping was updated", async function () {
            expect(await Family.getOwnerOfHuman(1)).to.equal(wallet1Wallet)
            console.log("      New OBJECT is:" + (await Family.connect(wallet1).getDataAboutHuman(1)))
        })
        it("should emit an NewHuman event", async () => {
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            await expect(
                MockedFamily.connect(wallet1).mintHuman(
                    utils.formatBytes32String("Douglas"),
                    utils.formatBytes32String("Rosey"),
                    utils.formatBytes32String("Bruk"),
                    {
                        value: ethers.utils.parseEther("0.05"),
                    }
                )
            )
                .to.emit(MockedFamily, "NewHuman")
                .withArgs(
                    2,
                    1,
                    utils.formatBytes32String("Rosey"),
                    utils.formatBytes32String("Bruk"),
                    18,
                    timestampAfter + 1,
                    wallet1Wallet
                )
        })
    })
})
