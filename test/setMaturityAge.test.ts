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

describe("setMaturityAge tests", function () {
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
