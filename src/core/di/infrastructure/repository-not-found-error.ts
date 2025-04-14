/**
 * @description Error thrown when a repository is not found
 */
export class RepositoryNotFoundError extends Error {
	constructor(repositoryName: string) {
		super(`Repository not found: ${repositoryName}`);
		this.name = 'RepositoryNotFoundError';
	}
}
