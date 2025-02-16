/**
 * @description Error thrown when a repository is not found
 */
export class RepositoryNotFoundError extends Error {
	constructor(name: string) {
		super(`Repository ${name} not found`)
	}
}
