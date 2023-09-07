import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
const request = require("supertest")
import { AppModule } from "./../src/app.module"

describe("AppController (e2e)", () => {
	let app: INestApplication

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()
	})

	it("/ (POST) submit attendee list and filter ones within configured radius", (done) => {
		return request(app.getHttpServer())
			.post("/attendees/available")
			.set("Content-Type", "multipart/form-data")
			.attach("file", `${__dirname}/attendee_list`)
			.expect(201)
			.expect((result) => result.body.length == 16)
			.end(done)
	})

	it("/ (POST) fails with 422 if not posting an actual doc", (done) => {
		return request(app.getHttpServer()).post("/attendees/available").expect(422).end(done)
	})

	afterAll(async () => {
		await app.close()
	})
})
