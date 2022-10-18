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

describe("checkAgeChanging tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()
        ownerWallet = await owner.getAddress()
        wallet1Wallet = await wallet1.getAddress()
        wallet2Wallet = await wallet2.getAddress()

        contractFactory = await ethers.getContractFactory(contractName, owner)
        Family = await contractFactory.deploy("50000000000000000", 3, 18)

        mockedContractFactory = await ethers.getContractFactory(mockName, owner)
        MockedFamily = await mockedContractFactory.deploy("50000000000000000", 4, 18)

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
        it("should revert if not the owner of token trying to checkAgeChanging", async function () {
            await expect(Family.connect(wallet2).checkAgeChanging(1)).to.be.revertedWith(
                "You are not the owner of this NFT"
            )
        })
    })
    describe("positive test", function () {
        it("should not validate and update age for mature token if checkAgeChanging was not called", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 18])
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[4]).to.equal(18)
        })
        it("should successfully validate and update age for mature token if checkAgeChanging was called", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 18])
            await Family.connect(wallet1).checkAgeChanging(1)
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[4]).to.equal(36)
        })
        it("should check mintAge doesnt changed after checkAgeChanging was called", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 18])
            await Family.connect(wallet1).checkAgeChanging(1)
            expect((await Family.connect(wallet1).getDataAboutHuman(1))[5]).to.equal(18)
        })
        it("should successfully validate and update age for mature token", async function () {
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 18])
            await MockedFamily.connect(wallet1).checkAgeChanging(2)
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(2))[4]).to.equal(18)
        })
        it("should check gender is KID_BOY before token reached maturity", async function () {
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await MockedFamily.connect(wallet1).checkAgeChanging(2)
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(2))[1]).to.equal(2)
        })
        it("should successfully validate and update the gender to MAN when the token KID_BOY has become mature", async function () {
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 18])
            await MockedFamily.connect(wallet1).checkAgeChanging(2)
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(2))[1]).to.equal(0)
        })
        it("should check gender is KID_GIRL before token reached maturity", async function () {
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Thomas"),
                utils.formatBytes32String("Eva")
            )
            await MockedFamily.connect(wallet1).checkAgeChanging(3)
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(3))[1]).to.equal(3)
        })
        it("should successfully validate and update the gender to WOMAN when the token KID_GIRL has become mature", async function () {
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Thomas"),
                utils.formatBytes32String("Eva")
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 18])
            await MockedFamily.connect(wallet1).checkAgeChanging(3)
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(3))[1]).to.equal(1)
        })
        it("should validate and update age if checkAgeChanging called multiple times in MAN token", async function () {
            await Family.connect(wallet1).mintHuman(
                utils.formatBytes32String("Constantine"),
                utils.formatBytes32String("Merry"),
                utils.formatBytes32String("Brownie"),
                {
                    value: ethers.utils.parseEther("0.05"),
                }
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 2])
            await Family.connect(wallet1).checkAgeChanging(2)
            await ethers.provider.send("evm_increaseTime", [86400 * 12])
            await Family.connect(wallet1).checkAgeChanging(2)
            await ethers.provider.send("evm_increaseTime", [86400 * 12])
            await Family.connect(wallet1).checkAgeChanging(2)
            expect((await Family.connect(wallet1).getDataAboutHuman(2))[4]).to.equal(44)
        })
        it("should validate and update age if checkAgeChanging called multiple times in WOMEN token", async function () {
            await Family.connect(wallet1).mintHuman(
                utils.formatBytes32String("Constantine"),
                utils.formatBytes32String("Merry"),
                utils.formatBytes32String("Brownie"),
                {
                    value: ethers.utils.parseEther("0.05"),
                }
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 3])
            await Family.connect(wallet1).checkAgeChanging(2)
            await ethers.provider.send("evm_increaseTime", [86400 * 5])
            await Family.connect(wallet1).checkAgeChanging(2)
            await ethers.provider.send("evm_increaseTime", [86400 * 7])
            await Family.connect(wallet1).checkAgeChanging(2)
            expect((await Family.connect(wallet1).getDataAboutHuman(2))[4]).to.equal(33)
        })
        it("should validate and update age if checkAgeChanging called multiple times in KID token", async function () {
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 2])
            await MockedFamily.connect(wallet1).checkAgeChanging(2)
            await ethers.provider.send("evm_increaseTime", [86400 * 5])
            await MockedFamily.connect(wallet1).checkAgeChanging(2)
            await ethers.provider.send("evm_increaseTime", [86400 * 7])
            await MockedFamily.connect(wallet1).checkAgeChanging(2)
            expect((await MockedFamily.connect(wallet1).getDataAboutHuman(2))[4]).to.equal(14)
        })
        it("should emit an AgeUpdated event", async () => {
            blockNumAfter = await ethers.provider.getBlockNumber()
            blockAfter = await ethers.provider.getBlock(blockNumAfter)
            timestampAfter = blockAfter.timestamp
            await MockedFamily.connect(wallet1).breeding(
                0,
                1,
                utils.formatBytes32String("Derek"),
                utils.formatBytes32String("Angel")
            )
            await ethers.provider.send("evm_increaseTime", [86400 * 17])
            await expect(MockedFamily.connect(wallet1).checkAgeChanging(2))
                .to.emit(MockedFamily, "AgeUpdated")
                .withArgs(
                    2,
                    2,
                    utils.formatBytes32String("Derek"),
                    utils.formatBytes32String("Wellingtone"),
                    17,
                    0,
                    timestampAfter + 1,
                    wallet1Wallet
                )
        })
    })
})
