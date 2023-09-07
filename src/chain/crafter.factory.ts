import { ConfigService } from "@nestjs/config"
import { AlgorandTransactionCrafter } from "./algorand/algorand.transaction.crafter"
import { Crafter } from "./crafter.role"

export class CrafterFactory {
	static getCrafter(chain, configService: ConfigService): Crafter {
		switch (chain) {
			case "algorand":
				return new AlgorandTransactionCrafter(configService)
			default:
				throw new Error("Chain not supported")
		}
	}
}
