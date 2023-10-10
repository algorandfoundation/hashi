import { ConfigService } from "@nestjs/config"
import { Crafter } from "./crafter.role"
import { AlgorandTransactionCrafter } from '@algorandfoundation/algo-models'

export class CrafterFactory {
	static getCrafter(chain, configService: ConfigService): Crafter {
		switch (chain) {
			case "algorand":
				const genesisId: string = configService.get<string>("GENESIS_ID")
				const genesisHash: string = configService.get<string>("GENESIS_HASH")
				return new AlgorandTransactionCrafter(genesisId, genesisHash)
			default:
				throw new Error("Chain not supported")
		}
	}
}
