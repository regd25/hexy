import { EVENT_TYPES } from '../utils/events/EventTypes.js';

/**
 * Navigator container that manages artifact list and search functionality
 * Follows Single Responsibility Principle for navigation management
 */
export class NavigatorContainer {
    constructor(eventBus, notificationManager, artifactParser, semanticService) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.artifactParser = artifactParser;
        this.semanticService = semanticService;
        this.isInitialized = false;
        this.artifacts = [];
        this.filteredArtifacts = [];
        this.searchTerm = '';
        this.selectedType = 'all';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
    }

    /**
     * Initialize the navigator container
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.setupDOMElements();
        this.setupSearchFunctionality();
        this.setupFilterFunctionality();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.NAVIGATOR_INITIALIZED, {
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for navigator interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.GRAPH_UPDATED, this.handleGraphUpdated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_SELECTED, this.handleArtifactSelected.bind(this));
    }

    /**
     * Setup DOM elements for navigator functionality
     */
    setupDOMElements() {
        this.searchInput = document.getElementById('search-input');
        this.artifactList = document.getElementById('artifact-list');
        this.typeFilter = document.getElementById('type-filter');
        this.sortSelect = document.getElementById('sort-select');
        this.exportBtn = document.getElementById('export-btn');
        this.importBtn = document.getElementById('import-btn');

        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
        }

        if (this.typeFilter) {
            this.typeFilter.addEventListener('change', this.handleTypeFilter.bind(this));
        }

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', this.handleExport.bind(this));
        }

        if (this.importBtn) {
            this.importBtn.addEventListener('click', this.handleImport.bind(this));
        }
    }

    /**
     * Setup search functionality
     */
    setupSearchFunctionality() {
        if (!this.searchInput) return;

        this.searchInput.placeholder = 'Search artifacts...';
        this.searchInput.setAttribute('aria-label', 'Search artifacts');
    }

    /**
     * Setup filter functionality
     */
    setupFilterFunctionality() {
        if (!this.typeFilter) return;

        const artifactTypes = [
            'all',
            'purpose',
            'context',
            'authority',
            'evaluation',
            'vision',
            'policy',
            'principle',
            'guideline',
            'concept',
            'indicator',
            'process',
            'procedure',
            'event',
            'result',
            'observation',
            'actor',
            'area'
        ];

        this.typeFilter.innerHTML = artifactTypes
            .map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`)
            .join('');
    }

    /**
     * Handle node creation event
     */
    handleNodeCreated(data) {
        if (data.node) {
            this.addArtifact(data.node);
        }
    }

    /**
     * Handle node update event
     */
    handleNodeUpdated(data) {
        if (data.node) {
            this.updateArtifact(data.node);
        }
    }

    /**
     * Handle node deletion event
     */
    handleNodeDeleted(data) {
        if (data.nodeId) {
            this.removeArtifact(data.nodeId);
        }
    }

    /**
     * Handle graph update event
     */
    handleGraphUpdated(data) {
        if (data.nodes) {
            this.updateArtifactsList(data.nodes);
        }
    }

    /**
     * Handle artifact selection event
     */
    handleArtifactSelected(data) {
        this.highlightArtifact(data.artifactId);
    }

    /**
     * Handle search input
     */
    handleSearchInput(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.filterAndRenderArtifacts();
    }

    /**
     * Handle type filter change
     */
    handleTypeFilter(event) {
        this.selectedType = event.target.value;
        this.filterAndRenderArtifacts();
    }

    /**
     * Handle sort change
     */
    handleSortChange(event) {
        const [field, order] = event.target.value.split('-');
        this.sortBy = field;
        this.sortOrder = order;
        this.filterAndRenderArtifacts();
    }

    /**
     * Handle export button click
     */
    handleExport() {
        const data = this.getArtifactsData();
        const jsonData = JSON.stringify(data, null, 2);

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'artifacts-export.json';
        a.click();

        URL.revokeObjectURL(url);
        this.notificationManager.showSuccess('Artifacts exported successfully');
    }

    /**
     * Handle import button click
     */
    handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.importArtifacts(data);
                    } catch (error) {
                        this.notificationManager.showError('Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        };

        input.click();
    }

    /**
     * Add artifact to the list
     */
    addArtifact(artifact) {
        const existingIndex = this.artifacts.findIndex(a => a.id === artifact.id);
        if (existingIndex >= 0) {
            this.artifacts[existingIndex] = artifact;
        } else {
            this.artifacts.push(artifact);
        }

        this.filterAndRenderArtifacts();
        this.notificationManager.showInfo(`Artifact "${artifact.name}" added`);
    }

    /**
     * Update artifact in the list
     */
    updateArtifact(artifact) {
        const index = this.artifacts.findIndex(a => a.id === artifact.id);
        if (index >= 0) {
            this.artifacts[index] = artifact;
            this.filterAndRenderArtifacts();
        }
    }

    /**
     * Remove artifact from the list
     */
    removeArtifact(artifactId) {
        this.artifacts = this.artifacts.filter(a => a.id !== artifactId);
        this.filterAndRenderArtifacts();
    }

    /**
     * Update artifacts list from graph data
     */
    updateArtifactsList(nodes) {
        this.artifacts = nodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            description: node.description,
            x: node.x,
            y: node.y
        }));

        this.filterAndRenderArtifacts();
    }

    /**
     * Filter and render artifacts based on current filters
     */
    filterAndRenderArtifacts() {
        this.filteredArtifacts = this.artifacts.filter(artifact => {
            const matchesSearch = !this.searchTerm ||
                artifact.name.toLowerCase().includes(this.searchTerm) ||
                artifact.description.toLowerCase().includes(this.searchTerm);

            const matchesType = this.selectedType === 'all' || artifact.type === this.selectedType;

            return matchesSearch && matchesType;
        });

        this.sortArtifacts();
        this.renderArtifactsList();
        this.updateArtifactCount();
    }

    /**
     * Sort artifacts based on current sort settings
     */
    sortArtifacts() {
        this.filteredArtifacts.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return this.sortOrder === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    /**
     * Render artifacts list in the DOM
     */
    renderArtifactsList() {
        if (!this.artifactList) return;

        this.artifactList.innerHTML = this.filteredArtifacts.map(artifact => `
            <div class="artifact-item" data-artifact-id="${artifact.id}">
                <div class="artifact-header">
                    <span class="artifact-type">${artifact.type}</span>
                    <span class="artifact-name">${artifact.name}</span>
                </div>
                <div class="artifact-description">${artifact.description || 'No description'}</div>
                <div class="artifact-actions">
                    <button class="btn-edit" onclick="this.selectArtifact('${artifact.id}')">Edit</button>
                    <button class="btn-delete" onclick="this.deleteArtifact('${artifact.id}')">Delete</button>
                </div>
            </div>
        `).join('');

        this.setupArtifactItemListeners();
    }

    /**
     * Setup event listeners for artifact items
     */
    setupArtifactItemListeners() {
        const artifactItems = this.artifactList.querySelectorAll('.artifact-item');
        artifactItems.forEach(item => {
            item.addEventListener('click', (event) => {
                if (!event.target.classList.contains('btn-edit') && !event.target.classList.contains('btn-delete')) {
                    const artifactId = item.dataset.artifactId;
                    this.selectArtifact(artifactId);
                }
            });
        });
    }

    /**
     * Select artifact and highlight it
     */
    selectArtifact(artifactId) {
        this.eventBus.publish(EVENT_TYPES.ARTIFACT_SELECTED, { artifactId });
        this.highlightArtifact(artifactId);
    }

    /**
     * Highlight selected artifact
     */
    highlightArtifact(artifactId) {
        const items = this.artifactList.querySelectorAll('.artifact-item');
        items.forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.artifactId === artifactId) {
                item.classList.add('selected');
            }
        });
    }

    /**
     * Delete artifact
     */
    deleteArtifact(artifactId) {
        if (confirm('Are you sure you want to delete this artifact?')) {
            this.eventBus.publish(EVENT_TYPES.NODE_DELETED, { nodeId: artifactId });
        }
    }

    /**
     * Update artifact count display
     */
    updateArtifactCount() {
        const countElement = document.getElementById('artifact-count');
        if (countElement) {
            countElement.textContent = `${this.filteredArtifacts.length} of ${this.artifacts.length} artifacts`;
        }
    }

    /**
     * Get artifacts data for export
     */
    getArtifactsData() {
        return {
            artifacts: this.artifacts,
            filters: {
                searchTerm: this.searchTerm,
                selectedType: this.selectedType,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            },
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import artifacts from data
     */
    importArtifacts(data) {
        if (data.artifacts && Array.isArray(data.artifacts)) {
            this.artifacts = data.artifacts;
            this.filterAndRenderArtifacts();
            this.notificationManager.showSuccess('Artifacts imported successfully');
        } else {
            this.notificationManager.showError('Invalid artifacts data');
        }
    }

    /**
     * Get current artifacts list
     */
    getArtifacts() {
        return this.artifacts;
    }

    /**
     * Get filtered artifacts list
     */
    getFilteredArtifacts() {
        return this.filteredArtifacts;
    }

    /**
     * Destroy the navigator container
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.GRAPH_UPDATED, this.handleGraphUpdated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.ARTIFACT_SELECTED, this.handleArtifactSelected.bind(this));

        this.artifacts = [];
        this.filteredArtifacts = [];
        this.isInitialized = false;
    }
} 