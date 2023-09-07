import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { VaultService } from "./vault.service"

@Module({
	imports: [HttpModule],
	controllers: [],
	providers: [VaultService],
	exports: [VaultService],
})
export class VaultModule {}
