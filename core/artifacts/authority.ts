/**
 * Represents an authority role for validation and governance within the SOL framework
 * Encapsulates permissions, capabilities, and governance responsibilities
 */
export class Authority {
	public readonly id: string;
	public readonly name: string;
	public readonly domain: string;
	public readonly role: AuthorityRole;
	public readonly permissions: Set<string>;
	public readonly capabilities: string[];
	public readonly jurisdiction: string[];
	public readonly isActive: boolean;
	public readonly validUntil?: Date;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(
		id: string,
		name: string,
		domain: string,
		role: AuthorityRole,
		permissions: string[] = [],
		capabilities: string[] = [],
		jurisdiction: string[] = [],
		isActive: boolean = true,
		validUntil?: Date,
		createdAt: Date = new Date(),
		updatedAt: Date = new Date()
	) {
		if (!id || id.trim().length === 0) {
			throw new Error('Authority ID cannot be empty');
		}
		if (!name || name.trim().length === 0) {
			throw new Error('Authority name cannot be empty');
		}
		if (!domain || domain.trim().length === 0) {
			throw new Error('Authority domain cannot be empty');
		}
		if (validUntil && validUntil <= new Date()) {
			throw new Error('Valid until date must be in the future');
		}

		this.id = id;
		this.name = name;
		this.domain = domain;
		this.role = role;
		this.permissions = new Set(permissions);
		this.capabilities = [...capabilities];
		this.jurisdiction = [...jurisdiction];
		this.isActive = isActive;
		this.validUntil = validUntil;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	/**
	 * Checks if the authority has a specific permission
	 */
	public hasPermission(permission: string): boolean {
		return this.permissions.has(permission);
	}

	/**
	 * Checks if the authority has a specific capability
	 */
	public hasCapability(capability: string): boolean {
		return this.capabilities.includes(capability);
	}

	/**
	 * Checks if the authority has jurisdiction over a specific area
	 */
	public hasJurisdiction(area: string): boolean {
		return this.jurisdiction.includes(area) || this.jurisdiction.includes('*');
	}

	/**
	 * Validates if the authority is currently valid and active
	 */
	public isValid(): boolean {
		if (!this.isActive) return false;
		if (this.validUntil && this.validUntil <= new Date()) return false;
		return true;
	}

	/**
	 * Grants additional permissions to the authority
	 */
	public grantPermissions(newPermissions: string[]): Authority {
		const combinedPermissions = Array.from(new Set([...this.permissions, ...newPermissions]));
		
		return new Authority(
			this.id,
			this.name,
			this.domain,
			this.role,
			combinedPermissions,
			this.capabilities,
			this.jurisdiction,
			this.isActive,
			this.validUntil,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Revokes specific permissions from the authority
	 */
	public revokePermissions(permissionsToRevoke: string[]): Authority {
		const updatedPermissions = Array.from(this.permissions).filter(
			permission => !permissionsToRevoke.includes(permission)
		);
		
		return new Authority(
			this.id,
			this.name,
			this.domain,
			this.role,
			updatedPermissions,
			this.capabilities,
			this.jurisdiction,
			this.isActive,
			this.validUntil,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Extends the authority's jurisdiction
	 */
	public extendJurisdiction(newAreas: string[]): Authority {
		const combinedJurisdiction = Array.from(new Set([...this.jurisdiction, ...newAreas]));
		
		return new Authority(
			this.id,
			this.name,
			this.domain,
			this.role,
			Array.from(this.permissions),
			this.capabilities,
			combinedJurisdiction,
			this.isActive,
			this.validUntil,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Deactivates the authority
	 */
	public deactivate(): Authority {
		return new Authority(
			this.id,
			this.name,
			this.domain,
			this.role,
			Array.from(this.permissions),
			this.capabilities,
			this.jurisdiction,
			false,
			this.validUntil,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Validates an action against this authority's permissions and jurisdiction
	 */
	public canAuthorize(action: string, context: string): boolean {
		if (!this.isValid()) return false;
		if (!this.hasJurisdiction(context)) return false;
		return this.hasPermission(action) || this.hasPermission('*');
	}

	/**
	 * Gets the authority level based on role
	 */
	public getAuthorityLevel(): number {
		switch (this.role) {
			case AuthorityRole.OBSERVER: return 1;
			case AuthorityRole.VALIDATOR: return 2;
			case AuthorityRole.MODERATOR: return 3;
			case AuthorityRole.ADMINISTRATOR: return 4;
			case AuthorityRole.SUPERVISOR: return 5;
			default: return 0;
		}
	}

	/**
	 * Returns a string representation of the authority
	 */
	public toString(): string {
		return `Authority(${this.name} - ${this.role} in ${this.domain})`;
	}
}

/**
 * Role enumeration for authorities
 */
export enum AuthorityRole {
	OBSERVER = 'OBSERVER',
	VALIDATOR = 'VALIDATOR',
	MODERATOR = 'MODERATOR',
	ADMINISTRATOR = 'ADMINISTRATOR',
	SUPERVISOR = 'SUPERVISOR'
} 