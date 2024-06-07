import { Wallet } from "./wallet.controller"
import createMockInstance from "jest-create-mock-instance"
import * as bip39 from "bip39"
import algosdk from "algosdk"
import { WalletService } from "./wallet.service"
import { ConfigService } from "@nestjs/config"
import { randomBytes } from "crypto"
import { AlgorandTransactionCrafter, AlgorandEncoder } from "@algorandfoundation/algo-models"

describe("Wallet Controller", () => {
	let controller: Wallet
	let walletServiceMock: jest.Mocked<WalletService>
	let configServiceMock: jest.Mocked<ConfigService>

	beforeAll(async () => {
		walletServiceMock = createMockInstance(WalletService)
		configServiceMock = createMockInstance(ConfigService)
		controller = new Wallet(walletServiceMock, configServiceMock)
	})

	afterEach(() => {})

	it.only(`\(OK) BIP39 generation`, () => {
		// ### 25 words ###
		const acc = algosdk.generateAccount()
		const passphrase = algosdk.secretKeyToMnemonic(acc.sk)
		console.log(`My passphrase: ${passphrase}`)

		const seed: Uint8Array = algosdk.seedFromMnemonic(passphrase)
		console.log("seed: ", Buffer.from(seed).toString("hex"))

		const algo25Mnemonic: string = algosdk.mnemonicFromSeed(seed)
		console.log("mnemonic: ", algo25Mnemonic)

		// algo25 => seed => algo25 again
		expect(algo25Mnemonic).toBe(passphrase)

		// ##### BIP39 ####
		const bip39Mnemonic: string = bip39.entropyToMnemonic(Buffer.from(seed).toString("hex"))
		console.log("bip39Mnemonic: ", bip39Mnemonic)

		// different words from both standards
		expect(bip39Mnemonic).not.toBe(algo25Mnemonic)

		const entropy: string = bip39.mnemonicToEntropy(bip39Mnemonic)

		// same seed from bip39 as from algo25
		expect(entropy).toBe(Buffer.from(seed).toString("hex"))
	})

	it("(OK) login()", async () => {
		const token: string = "test"
		walletServiceMock.auth.mockResolvedValueOnce(true)
		const result: boolean = await controller.login(token)
		expect(result).toBe(true)
		expect(walletServiceMock.auth).toBeCalledTimes(1)
		expect(walletServiceMock.auth).toBeCalledWith(token)
	})

	it("(OK) submitTransaction()", async () => {
		const txn: Uint8Array = randomBytes(32)
		const txId: string = "test"
		walletServiceMock.submitTransaction.mockResolvedValueOnce(txId)
		const result: string = await controller.submitTransaction(txn)
		expect(result).toBe(txId)
		expect(walletServiceMock.submitTransaction).toBeCalledTimes(1)
		expect(walletServiceMock.submitTransaction).toBeCalledWith(txn)
	})

	it("(OK) craft()", async () => {
		const crafter = controller.craft()
		expect(crafter).toBeDefined()
		expect(crafter).not.toBeNull()
		expect(crafter).toBeInstanceOf(AlgorandTransactionCrafter)
	})

	/**
	 *
	 */
	it("(OK) getAddress()", async () => {
		const bytes = randomBytes(32)
		walletServiceMock.getPublicKey.mockResolvedValueOnce(Buffer.from(bytes))
		const addr: string = await controller.getAddress()
		expect(addr.length).toBe(58)
		expect(addr).toBe(new AlgorandEncoder().encodeAddress(Buffer.from(bytes)))
	})

	/**
	 *
	 */
	it("(OK) sign()", async () => {
		const signature: Uint8Array = randomBytes(64)
		const data: Uint8Array = randomBytes(32)

		const vaultSignature: Buffer = Buffer.from(`vault:v1:${Buffer.from(signature).toString("base64")}`)

		walletServiceMock.rawSign.mockResolvedValueOnce(vaultSignature)
		const result: Uint8Array = await controller.sign(data)
		expect(result.length).toBe(64)
		expect(result).toEqual(new Uint8Array(signature))
	})

	/**
	 * 
	 */
	it("(OK) encoder()", async () => {
		const encoder = controller.encoder()
		expect(encoder).toBeDefined()
		expect(encoder).not.toBeNull()
		expect(encoder).toBeInstanceOf(AlgorandEncoder)
	})
})
