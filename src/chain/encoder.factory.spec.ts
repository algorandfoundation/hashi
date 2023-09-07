import { EncoderFactory } from "./encoder.factory"

describe("Encoder Factory", () => {
	it("(FAIL) requested encoder from unsupported chain", async () => {
		expect(() => EncoderFactory.getEncoder("unsupported")).toThrowError("Chain not supported")
	})
})
