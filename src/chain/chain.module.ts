import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

@Module({
	imports: [ConfigModule.forRoot()],
	controllers: [],
	providers: [],
	exports: [],
})
export class ChainModule {}
