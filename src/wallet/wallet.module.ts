import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { Wallet } from "./wallet.controller"
import { WalletService } from "./wallet.service"
import { VaultModule } from "src/vault/vault.module"
import { VaultService } from "src/vault/vault.service"
import { ChainModule } from "src/chain/chain.module"
import { AlgorandEncoder } from "src/chain/algorand/algorand.encoder"
import { ConfigModule } from "@nestjs/config"

@Module({
	imports: [HttpModule, VaultModule, ChainModule, ConfigModule.forRoot()],
	controllers: [Wallet],
	providers: [WalletService, VaultService, AlgorandEncoder],
})
export class WalletModule {}
