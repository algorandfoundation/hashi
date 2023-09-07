import createMockInstance from "jest-create-mock-instance"
import { VaultService } from "../vault/vault.service"
import { WalletService } from "./wallet.service"
import { HttpService } from "@nestjs/axios"
import { ConfigService } from "@nestjs/config"
import { Axios, AxiosInstance } from "axios"
import { randomBytes } from "crypto"

describe("Wallet Service", () => {
	let walletService: WalletService
	let vaultServiceMock: jest.Mocked<VaultService>
	let httpServiceMock: jest.Mocked<HttpService>
	let configServiceMock: jest.Mocked<ConfigService>
	let axiosRefMock: jest.Mocked<Axios>
	beforeEach(async () => {
		vaultServiceMock = createMockInstance(VaultService)
		httpServiceMock = createMockInstance(HttpService)
		configServiceMock = createMockInstance(ConfigService)
		axiosRefMock = createMockInstance(Axios)
		walletService = new WalletService(vaultServiceMock, httpServiceMock, configServiceMock)
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("(OK) onModuleInit()", async () => {
		const token: string = "test"
		vaultServiceMock.auth.mockResolvedValueOnce(true)
		configServiceMock.get.mockReturnValueOnce(token)
		await walletService.onModuleInit()
		expect(vaultServiceMock.auth).toBeCalledTimes(1)
		expect(vaultServiceMock.auth).toBeCalledWith(token)
	})

	it("(OK) auth()", async () => {
		const token: string = "test"
		vaultServiceMock.auth.mockResolvedValueOnce(true)
		const result: boolean = await walletService.auth(token)
		expect(result).toBe(true)
		expect(vaultServiceMock.auth).toBeCalledTimes(1)
		expect(vaultServiceMock.auth).toBeCalledWith(token)
	})

	it("(FAIL) auth()", async () => {
		const token: string = "test"
		vaultServiceMock.auth.mockRejectedValueOnce(false)
		const result: boolean = await walletService.auth(token)
		expect(result).toBe(false)
		expect(vaultServiceMock.auth).toBeCalledTimes(1)
		expect(vaultServiceMock.auth).toBeCalledWith(token)
	})

	it("(OK) getPublicKey()", async () => {
		const publicKey: Buffer = Buffer.from(randomBytes(32))
		vaultServiceMock.keyGen.mockResolvedValueOnce(publicKey)
		const result: Uint8Array = await walletService.getPublicKey("test")
		expect(result).toBe(publicKey)
		expect(vaultServiceMock.keyGen).toBeCalledTimes(1)
		expect(vaultServiceMock.keyGen).toBeCalledWith("test", "ed25519")
	})

	it("(OK) rawSign()", async () => {
		const keyName: string = "test"
		const message: Buffer = Buffer.from(randomBytes(32))
		const signature: Buffer = Buffer.from(randomBytes(32))
		vaultServiceMock.sign.mockResolvedValueOnce(signature)
		const result: Uint8Array = await walletService.rawSign(message, keyName)
		expect(result).toBe(signature)
		expect(vaultServiceMock.sign).toBeCalledTimes(1)
		expect(vaultServiceMock.sign).toBeCalledWith(keyName, message, "sha2-512")
	})

	it("(OK) submitTransaction()", async () => {
		const txn: Uint8Array = Buffer.from("test")
		const txId: string = "test"
		const nodeHttpScheme: string = "http"
		const nodeHost: string = "localhost"
		const nodePort: string = "4001"
		const token: string = "test"
		configServiceMock.get.mockReturnValueOnce(nodeHttpScheme)
		configServiceMock.get.mockReturnValueOnce(nodeHost)
		configServiceMock.get.mockReturnValueOnce(nodePort)
		configServiceMock.get.mockReturnValueOnce(token)

		axiosRefMock.post.mockResolvedValueOnce({
			data: {
				txId: txId,
			},
		})

		Object.defineProperty(httpServiceMock, "axiosRef", {
			value: axiosRefMock,
		})

		const result: string = await walletService.submitTransaction(txn)
		expect(result).toBe(txId)
		expect(httpServiceMock.axiosRef.post).toBeCalledTimes(1)
		expect(httpServiceMock.axiosRef.post).toBeCalledWith(`${nodeHttpScheme}://${nodeHost}:${nodePort}/v2/transactions`, Buffer.from(txn), {
			headers: {
				"Content-Type": "application/x-binary",
				"X-Algo-API-Token": token,
			},
		})
	})
})
