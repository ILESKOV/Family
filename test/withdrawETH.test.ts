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
let provider: any

beforeEach(async () => {
    ;[owner, wallet1, wallet2] = await ethers.getSigners()
    ownerWallet = await owner.getAddress()
    wallet1Wallet = await wallet1.getAddress()
    wallet2Wallet = await wallet2.getAddress()

    contractFactory = await ethers.getContractFactory(contractName, owner)
    Family = await contractFactory.deploy("50000000000000000", 3, 18)

    provider = ethers.getDefaultProvider()

    await Family.connect(wallet1).mintHuman(
        utils.formatBytes32String("Bob"),
        utils.formatBytes32String("Alice"),
        utils.formatBytes32String("Wellingtone"),
        { value: ethers.utils.parseEther("0.05") }
    )
    await Family.connect(wallet1).mintHuman(
        utils.formatBytes32String("Charlie"),
        utils.formatBytes32String("Ketty"),
        utils.formatBytes32String("Soprano"),
        { value: ethers.utils.parseEther("0.05") }
    )
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
                .withArgs(ownerWallet, BigNumber.from("100000000000000000"))
        })
    })
})
