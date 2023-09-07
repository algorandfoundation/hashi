import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { AlgorandEncoder } from "./algorand/algorand.encoder"
import { AlgorandTransactionCrafter } from "./algorand/algorand.transaction.crafter"
import { ConfigModule } from "@nestjs/config"

@Module({
	imports: [ConfigModule.forRoot()],
	controllers: [],
	providers: [AlgorandEncoder, AlgorandTransactionCrafter],
	exports: [AlgorandEncoder, AlgorandTransactionCrafter],
})
export class ChainModule {}
