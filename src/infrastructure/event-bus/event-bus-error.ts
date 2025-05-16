export class EventBusError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'EventBusError'
	}
}
