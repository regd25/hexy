export class ResolveError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ResolveError'
	}
}
