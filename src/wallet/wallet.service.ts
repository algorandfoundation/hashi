import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { VaultService } from "../vault/vault.service"
import { sha512_256 } from "js-sha512"
import base32 from "hi-base32"
import { HttpService } from "@nestjs/axios"
import { ConfigService } from "@nestjs/config"
import { AxiosResponse } from "axios"

@Injectable()
export class WalletService implements OnModuleInit {
	constructor(private readonly vaultService: VaultService, private readonly httpService: HttpService, private readonly configService: ConfigService) {}

	/**
	 *
	 */
	async onModuleInit() {
		await this.auth(this.configService.get<string>("VAULT_TOKEN"))
	}

	/**
	 *
	 * @param token
	 * @returns
	 */
	async auth(token: string): Promise<boolean> {
		let isOkay: boolean = false

		try {
			isOkay = await this.vaultService.auth(token)
		} catch (error) {
			Logger.error("Failed to auth to vault", "WalletService.auth")
		}

		return isOkay
	}

	/**
	 *
	 * @param txn
	 */
	async submitTransaction(txn: Uint8Array): Promise<string> {
		const nodeHttpScheme: string = this.configService.get<string>("NODE_HTTP_SCHEME")
		const nodeHost: string = this.configService.get<string>("NODE_HOST")
		const nodePort: string = this.configService.get<string>("NODE_PORT")
		const token: string = this.configService.get<string>("NODE_TOKEN")

		// Log txn string
		Logger.debug(txn.toString(), "WalletService.submitTransaction")

		const result: AxiosResponse<any> = await this.httpService.axiosRef.post(
			`${nodeHttpScheme}://${nodeHost}:${nodePort}/v2/transactions`,
			Buffer.from(txn),
			{
				headers: {
					"Content-Type": "application/x-binary",
					"X-Algo-API-Token": token,
				},
			}
		)

		return result.data.txId
	}

	/**
	 *
	 * @param keyName
	 * @param keyType
	 * @returns
	 */
	async getPublicKey(keyName: string, keyType: "ed25519" | "ecdsa-p256" = "ed25519"): Promise<Buffer> {
		return this.vaultService.keyGen(keyName, keyType)
	}

	/**
	 *
	 * @param data
	 * @param keyName
	 * @returns
	 */
	async rawSign(data: Buffer, keyName: string): Promise<Buffer> {
		const signature: Buffer = await this.vaultService.sign(keyName, data, "sha2-512")
		// log signature
		Logger.debug(signature, "WalletService.rawSign")

		return signature
	}
}
