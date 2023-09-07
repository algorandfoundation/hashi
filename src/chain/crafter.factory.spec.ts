import { CrafterFactory } from "./crafter.factory"

describe("Crafter Factory", () => {
	it("(FAIL) requested crafter from unsupported chain", async () => {
		expect(() => CrafterFactory.getCrafter("unsupported", null)).toThrowError("Chain not supported")
	})
})
