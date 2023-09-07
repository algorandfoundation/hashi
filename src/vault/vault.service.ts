import { HttpService } from "@nestjs/axios"
import { Injectable, Logger } from "@nestjs/common"
import { AxiosResponse } from "axios"

export type KeyType = "ed25519" | "ecdsa-p256"
export type HashAlgorithm = "sha2-256" | "sha2-512"

@Injectable()
export class VaultService {
	private latestToken: string

	constructor(private readonly httpService: HttpService) {}

	async auth(token: string): Promise<boolean> {
		const res: AxiosResponse = await this.httpService.axiosRef.get("http://localhost:8200/v1/sys/auth", {
			headers: {
				"X-Vault-Token": token,
			},
		})

		const isOkay = res.status === 200
		if (isOkay) this.latestToken = token

		return isOkay
	}

	/**
	 *
	 * @param keyName
	 * @returns
	 */
	async keyGen(keyName: string, keyType: KeyType): Promise<Buffer> {
		// fetch root token
		// const token: string = JSON.parse(fs.readFileSync("vault-seal-keys.json").toString()).root_token
		// const sampleKey: string = crypto.randomUUID()
		const res = await this.httpService.axiosRef.post(
			`http://localhost:8200/v1/transit/keys/${keyName}`,
			{
				type: keyType,
				derived: false,
				allow_deletion: true,
			},
			{
				headers: {
					"X-Vault-Token": this.latestToken,
				},
			}
		)

		const publicKey: Buffer = Buffer.from(res.data.data.keys["1"].public_key, "base64")

		// log key created
		Logger.debug(publicKey.toString("base64"), `VaultService.keyGen`)
		return publicKey
	}

	/**
	 *
	 * @param data
	 * @param hashAlgorithm
	 * @returns
	 */
	async sign(keyName: string, data: Buffer, hashAlgorithm: HashAlgorithm, permissionedToken?: string): Promise<Buffer> {
		const result: AxiosResponse = await this.httpService.axiosRef.post(
			`http://localhost:8200/v1/transit/sign/${keyName}`,
			{
				input: data.toString("base64"),
			},
			{
				headers: {
					"X-Vault-Token": permissionedToken || this.latestToken,
				},
			}
		)

		return result.data.data.signature
	}
}
