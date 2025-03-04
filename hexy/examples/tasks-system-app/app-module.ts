import { Module, ModuleDecorator } from 'hexy'
import { TaskModule } from './task'
import { TaskApplicationService } from './task'

/**
 * Main application module
 */
@ModuleDecorator({
	imports: [
		new TaskModule()
	],
	providers: []
})
export class AppModule extends Module {
	constructor() {
		super({
			imports: [
				new TaskModule()
			],
			providers: []
		});
	}
}
