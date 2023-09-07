import { AlgorandEncoder } from "./algorand/algorand.encoder"
import { Encoder } from "./encoder.role"

export class EncoderFactory {
	// choose encoder based on chain
	static getEncoder(chain: string): Encoder {
		switch (chain) {
			case "algorand":
				return new AlgorandEncoder()
			default:
				throw new Error("Chain not supported")
		}
	}
}
