import { DynamicModule, ForwardReference, Module, Type } from "@nestjs/common"
import { WalletModule } from "./wallet/wallet.module"

function configuredModules(): Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference> {
	const csv_modules_names: string[] = process.env.CHOOSEN_MODULES ? process.env.CHOOSEN_MODULES.split(",") : []
	const modules: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference> = csv_modules_names.length == 0 ? [WalletModule] : []

	csv_modules_names.forEach((module_name: string) => {
		switch (module_name) {
			case "wallet":
				modules.push(WalletModule)
				break
			default:
				throw new Error(`Unknown module name: ${module_name}`)
		}
	})

	return modules
}

@Module({
	imports: [...configuredModules()],
	controllers: [],
	providers: [],
})
export class AppModule {}
