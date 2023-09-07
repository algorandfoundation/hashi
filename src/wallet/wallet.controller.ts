import { Controller, Logger } from "@nestjs/common"
import { WalletService } from "./wallet.service"
import { EncoderFactory } from "../chain/encoder.factory"
import { Crafter } from "../chain/crafter.role"
import { ConfigService } from "@nestjs/config"
import { CrafterFactory } from "../chain/crafter.factory"

@Controller()
export class Wallet {
	constructor(private readonly walletService: WalletService, private readonly configService: ConfigService) {}

	/**
	 *
	 * @param token
	 * @returns
	 */
	async login(token: string): Promise<boolean> {
		return this.walletService.auth(token)
	}

	/**
	 *
	 * @returns
	 */
	async getAddress(encoding: "algorand" = "algorand", index: number = 0): Promise<string> {
		const publicKey: Buffer = await this.walletService.getPublicKey("test")
		return EncoderFactory.getEncoder(encoding).encodeAddress(publicKey)
	}

	/**
	 *
	 */
	async sign(data: Uint8Array): Promise<Uint8Array> {
		//TODO: prompt new auth method

		const string: string = (await this.walletService.rawSign(Buffer.from(data), "test")).toString()

		// split vault specific prefixes vault:${version}:signature
		const signature = string.split(":")[2]

		// vault default base64 decode
		const decoded: Buffer = Buffer.from(signature, "base64")

		// return as Uint8Array
		return new Uint8Array(decoded)
	}

	/**
	 *
	 * @param txn
	 * @returns
	 */
	async submitTransaction(txn: Uint8Array): Promise<string> {
		return this.walletService.submitTransaction(txn)
	}

	/**
	 *
	 * @param chain
	 */
	craft(chain: "algorand" | "other" = "algorand"): Crafter {
		return CrafterFactory.getCrafter(chain, this.configService)
	}

	/**
	 * 
	 * @param chain 
	 * @returns 
	 */
	encoder(chain: "algorand" | "other" = "algorand") {
		return EncoderFactory.getEncoder(chain)
	}
}
