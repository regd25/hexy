/**
 * @description Abstract class for a service
 */
export abstract class Service {
	constructor(
		readonly name: string,
		readonly dependencies: Record<string, Service>,
	) {}

	/**
	 * @description Executes the service
	 */
	abstract execute(): Promise<void>
}
