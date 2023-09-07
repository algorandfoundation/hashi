import { INestMicroservice } from "@nestjs/common"
import { NestFactory, repl } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { WalletModule } from "./wallet/wallet.module"

async function bootstrap() {
	await repl(WalletModule)
}
bootstrap()
