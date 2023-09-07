import { Injectable, Logger } from "@nestjs/common"
import { Crafter } from "../crafter.role"
import { AlgorandEncoder } from "./algorand.encoder"
import { IPayTxBuilder, PayTxBuilder } from "./algorand.transaction.pay"
import { ConfigService } from "@nestjs/config"
import * as msgpack from "algo-msgpack-with-bigint"

@Injectable()
export class AlgorandTransactionCrafter extends Crafter {
	private genesisId: string
	private genesisHash: string

	constructor(private readonly configService: ConfigService) {
		super()
		this.genesisId = this.configService.get<string>("GENESIS_ID")
		this.genesisHash = this.configService.get<string>("GENESIS_HASH")
	}

	/**
	 *
	 * @param amount
	 * @param from
	 * @param to
	 * @returns
	 */
	pay(amount: number, from: string, to: string): IPayTxBuilder {
		return new PayTxBuilder(this.genesisId, this.genesisHash).addAmount(amount).addSender(from).addReceiver(to)
	}

	/**
	 *
	 * @param encodedTransaction
	 * @param signature
	 * @returns
	 */
	addSignature(encodedTransaction: Uint8Array, signature: Uint8Array): Uint8Array {
		// remove TAG prefix
		const txObj = new AlgorandEncoder().decodeTransaction(encodedTransaction)

		const signedTx = {
			sig: signature,
			txn: txObj,
		}

		// Encode without TAG
		return msgpack.encode(signedTx, { sortKeys: true })
	}
}
