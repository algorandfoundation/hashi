import createMockInstance from "jest-create-mock-instance"
import { VaultService } from "../vault/vault.service"
import { HttpService } from "@nestjs/axios"
import { Axios } from "axios"
import { randomBytes } from "crypto"

describe("Wallet Service", () => {
	let vaultService: VaultService
	let httpServiceMock: jest.Mocked<HttpService>
	let axiosRefMock: jest.Mocked<Axios>

	beforeEach(async () => {
		axiosRefMock = createMockInstance(Axios)
		httpServiceMock = createMockInstance(HttpService)
		vaultService = new VaultService(httpServiceMock)
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("(OK) auth()", async () => {
		const token: string = randomBytes(32).toString("base64")
		axiosRefMock.get.mockResolvedValueOnce({
			status: 200,
		})

		Object.defineProperty(httpServiceMock, "axiosRef", {
			value: axiosRefMock,
		})

		expect(vaultService.auth(token)).resolves.toEqual(true)
	})

	it("(OK) keyGen()", async () => {
		const publicKey: Buffer = Buffer.from(randomBytes(32))
		axiosRefMock.post.mockResolvedValueOnce({
			data: {
				data: {
					keys: {
						"1": {
							public_key: publicKey.toString("base64"),
						},
					},
				},
			},
		})

		Object.defineProperty(httpServiceMock, "axiosRef", {
			value: axiosRefMock,
		})

		expect(vaultService.keyGen("test", "ed25519")).resolves.toEqual(publicKey)
	})

	it("(OK) sign", async () => {
		// sign
		const data: Buffer = Buffer.from(randomBytes(32))
		const signature: Buffer = Buffer.from(randomBytes(32))
		axiosRefMock.post.mockResolvedValueOnce({
			data: {
				data: {
					signature: signature,
				},
			},
		})

		Object.defineProperty(httpServiceMock, "axiosRef", {
			value: axiosRefMock,
		})

		// call sign
		expect(vaultService.sign("test", data, "sha2-512")).resolves.toEqual(signature)
	})
})
