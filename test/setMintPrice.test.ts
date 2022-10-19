import { expect } from "chai"
import { ethers } from "hardhat"
import { ContractFactory, Contract, Signer, BigNumber } from "ethers"

const utils = ethers.utils
const contractName = "Family"
let contractFactory: ContractFactory
let Family: Contract
let owner: Signer
let wallet1: Signer
let wallet2: Signer
let ownerWallet: string
let wallet1Wallet: string
let wallet2Wallet: string

describe("setMintPrice() tests", function () {
    beforeEach(async function () {
        ;[owner, wallet1, wallet2] = await ethers.getSigners()
        ownerWallet = await owner.getAddress()
        wallet1Wallet = await wallet1.getAddress()
        wallet2Wallet = await wallet2.getAddress()

        contractFactory = await ethers.getContractFactory(contractName, owner)
        Family = await contractFactory.deploy("50000000000000000", 7, 18)

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
