import { Artifact } from '../models/Artifact.js';
import { EVENT_TYPES } from '../../components/utils/events/EventTypes.js';

/**
 * Service for managing artifacts with event-driven architecture
 */
export class ArtifactService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.artifacts = [];
        this.selectedArtifact = null;
        this.semanticRelations = [];

        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for artifact creation requests
        this.eventBus.subscribe(EVENT_TYPES.ARTIFACT_CREATE_REQUEST, (data) => {
            this.createArtifact(data.artifactData);
        });

        // Listen for artifact deletion requests
        this.eventBus.subscribe(EVENT_TYPES.ARTIFACT_DELETE_REQUEST, (data) => {
            this.deleteArtifact(data.artifactId);
        });

        // Listen for artifact update requests
        this.eventBus.subscribe(EVENT_TYPES.ARTIFACT_UPDATE_REQUEST, (data) => {
            this.updateArtifact(data.artifactId, data.updates);
        });
    }

    /**
     * Create a new artifact
     * @param {Object} artifactData - Artifact data
     * @returns {Artifact} Created artifact
     */
    createArtifact(artifactData) {
        const { name, type, description, x, y } = artifactData;

        const artifact = new Artifact(
            this.generateId(name),
            name,
            type,
            description,
            x,
            y
        );

        this.artifacts.push(artifact);

        // Publish event
        this.eventBus.publish(EVENT_TYPES.ARTIFACT_CREATED, {
            artifact
        });

        return artifact;
    }

    /**
     * Update an existing artifact
     * @param {string} artifactId - Artifact ID
     * @param {Object} updates - Updates to apply
     * @returns {Artifact|null} Updated artifact
     */
    updateArtifact(artifactId, updates) {
        const artifact = this.artifacts.find(a => a.id === artifactId);
        if (!artifact) {
            return null;
        }

        const oldArtifact = { ...artifact };

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(artifact, key)) {
                artifact[key] = updates[key];
            }
        });

        // Publish event
        this.eventBus.publish(EVENT_TYPES.ARTIFACT_UPDATED, {
            artifact,
            oldArtifact,
            updates
        });

        return artifact;
    }

    /**
     * Delete an artifact
     * @param {string} artifactId - Artifact ID
     * @returns {boolean} Success status
     */
    deleteArtifact(artifactId) {
        const index = this.artifacts.findIndex(a => a.id === artifactId);
        if (index === -1) {
            return false;
        }

        const artifact = this.artifacts[index];
        this.artifacts.splice(index, 1);

        // Clear selection if this was the selected artifact
        if (this.selectedArtifact && this.selectedArtifact.id === artifactId) {
            this.selectedArtifact = null;
        }

        // Publish event
        this.eventBus.publish(EVENT_TYPES.ARTIFACT_DELETED, {
            artifact
        });

        return true;
    }

    /**
     * Select an artifact
     * @param {string} artifactId - Artifact ID
     * @returns {Artifact|null} Selected artifact
     */
    selectArtifact(artifactId) {
        const artifact = this.artifacts.find(a => a.id === artifactId);
        if (!artifact) {
            return null;
        }

        this.selectedArtifact = artifact;

        // Publish event
        this.eventBus.publish(EVENT_TYPES.ARTIFACT_SELECTED, {
            artifact
        });

        return artifact;
    }

    /**
     * Get all artifacts
     * @returns {Artifact[]} Array of artifacts
     */
    getArtifacts() {
        return [...this.artifacts];
    }

    /**
     * Get selected artifact
     * @returns {Artifact|null} Selected artifact
     */
    getSelectedArtifact() {
        return this.selectedArtifact;
    }

    /**
     * Filter artifacts by search query
     * @param {string} query - Search query
     * @returns {Artifact[]} Filtered artifacts
     */
    filterArtifacts(query) {
        if (!query || query.trim() === '') {
            return this.getArtifacts();
        }

        const lowerQuery = query.toLowerCase();
        return this.artifacts.filter(artifact =>
            artifact.name.toLowerCase().includes(lowerQuery) ||
            artifact.description.toLowerCase().includes(lowerQuery) ||
            artifact.type.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Add semantic relation
     * @param {Object} semanticLink - Semantic link data
     */
    addSemanticRelation(semanticLink) {
        this.semanticRelations.push(semanticLink);

        // Publish event
        this.eventBus.publish(EVENT_TYPES.LINK_CREATED, {
            semanticLink
        });
    }

    /**
     * Get semantic relations
     * @returns {Array} Array of semantic relations
     */
    getSemanticRelations() {
        return [...this.semanticRelations];
    }

    /**
     * Export data
     * @returns {Object} Export data
     */
    exportData() {
        return {
            artifacts: this.artifacts.map(a => a.toJSON()),
            semanticRelations: this.semanticRelations,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import data
     * @param {Object} data - Import data
     */
    importData(data) {
        if (data.artifacts && Array.isArray(data.artifacts)) {
            this.artifacts = data.artifacts.map(a =>
                new Artifact(a.id, a.name, a.type, a.description, a.x, a.y)
            );
        }

        if (data.semanticRelations && Array.isArray(data.semanticRelations)) {
            this.semanticRelations = data.semanticRelations;
        }

        // Publish event
        this.eventBus.publish(EVENT_TYPES.DATA_IMPORTED, {
            data
        });
    }

    /**
     * Generate unique ID for artifact
     * @param {string} name - Artifact name
     * @returns {string} Generated ID
     */
    generateId(name) {
        const baseId = name.toLowerCase().replace(/\s+/g, '-');
        let id = baseId;
        let counter = 1;

        while (this.artifacts.some(a => a.id === id)) {
            id = `${baseId}-${counter}`;
            counter++;
        }

        return id;
    }

    /**
     * Get artifact count
     * @returns {number} Number of artifacts
     */
    getArtifactCount() {
        return this.artifacts.length;
    }

    /**
     * Clear all data
     */
    clear() {
        this.artifacts = [];
        this.selectedArtifact = null;
        this.semanticRelations = [];

        // Publish event
        this.eventBus.publish(EVENT_TYPES.DATA_CLEARED);
    }
} 