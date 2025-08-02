import { EVENT_TYPES } from '../../utils/events/EventTypes.js';
import { DOMHelper } from '../../utils/helpers/DOMHelper.js';

/**
 * Search component that handles advanced search functionality
 * Follows Single Responsibility Principle for search management
 */
export class SearchComponent {
    constructor(eventBus, notificationManager, semanticService) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.semanticService = semanticService;
        this.isInitialized = false;
        this.searchHistory = [];
        this.searchFilters = {
            name: '',
            type: 'all',
            description: '',
            weight: 'all',
            dateRange: null
        };
        this.searchResults = [];
        this.isSearching = false;
    }

    /**
     * Initialize the search component
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.setupDOMElements();
        this.setupSearchInterface();
        this.loadSearchHistory();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.COMPONENT_INITIALIZED, {
            component: 'SearchComponent',
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for search interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.SEARCH_CHANGED, this.handleSearchChanged.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.FILTER_CHANGED, this.handleFilterChanged.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.GRAPH_UPDATED, this.handleGraphUpdated.bind(this));
    }

    /**
     * Setup DOM elements for search functionality
     */
    setupDOMElements() {
        this.searchContainer = document.getElementById('search-container');
        this.searchInput = document.getElementById('search-input');
        this.searchFiltersPanel = document.getElementById('search-filters');
        this.searchResultsContainer = document.getElementById('search-results');
        this.searchButton = document.getElementById('search-button');
        this.clearButton = document.getElementById('clear-search-button');
        this.advancedToggle = document.getElementById('advanced-search-toggle');

        if (!this.searchContainer) {
            this.createSearchContainer();
        }
    }

    /**
     * Create search container if it doesn't exist
     */
    createSearchContainer() {
        this.searchContainer = DOMHelper.createElement('div', {
            id: 'search-container',
            class: 'search-container'
        });

        const searchSection = document.querySelector('.search-section') || document.body;
        searchSection.appendChild(this.searchContainer);
    }

    /**
     * Setup search interface
     */
    setupSearchInterface() {
        if (!this.searchContainer) return;

        this.searchContainer.innerHTML = `
            <div class="search-header">
                <h4>Advanced Search</h4>
                <button id="advanced-search-toggle" class="btn-toggle">⚙️</button>
            </div>
            <div class="search-input-group">
                <input type="text" id="search-input" placeholder="Search artifacts..." class="search-input">
                <button id="search-button" class="btn-search">🔍</button>
                <button id="clear-search-button" class="btn-clear">✕</button>
            </div>
            <div id="search-filters" class="search-filters" style="display: none;">
                <div class="filter-group">
                    <label>Type:</label>
                    <select id="type-filter" class="filter-select">
                        <option value="all">All Types</option>
                        <option value="purpose">Purpose</option>
                        <option value="context">Context</option>
                        <option value="authority">Authority</option>
                        <option value="evaluation">Evaluation</option>
                        <option value="vision">Vision</option>
                        <option value="policy">Policy</option>
                        <option value="principle">Principle</option>
                        <option value="guideline">Guideline</option>
                        <option value="concept">Concept</option>
                        <option value="indicator">Indicator</option>
                        <option value="process">Process</option>
                        <option value="procedure">Procedure</option>
                        <option value="event">Event</option>
                        <option value="result">Result</option>
                        <option value="observation">Observation</option>
                        <option value="actor">Actor</option>
                        <option value="area">Area</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Weight:</label>
                    <select id="weight-filter" class="filter-select">
                        <option value="all">All Weights</option>
                        <option value="weak">Weak (1-3)</option>
                        <option value="medium">Medium (4-7)</option>
                        <option value="strong">Strong (8-10)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Description:</label>
                    <input type="text" id="description-filter" placeholder="Search in descriptions..." class="filter-input">
                </div>
            </div>
            <div id="search-results" class="search-results"></div>
        `;

        this.setupSearchEventListeners();
    }

    /**
     * Setup search event listeners
     */
    setupSearchEventListeners() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.clearButton = document.getElementById('clear-search-button');
        this.advancedToggle = document.getElementById('advanced-search-toggle');
        this.searchFiltersPanel = document.getElementById('search-filters');
        this.searchResultsContainer = document.getElementById('search-results');

        if (this.searchInput) {
            DOMHelper.addEventListener(this.searchInput, 'input', DOMHelper.debounce(this.handleSearchInput.bind(this), 300));
            DOMHelper.addEventListener(this.searchInput, 'keypress', (event) => {
                if (event.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (this.searchButton) {
            DOMHelper.addEventListener(this.searchButton, 'click', this.performSearch.bind(this));
        }

        if (this.clearButton) {
            DOMHelper.addEventListener(this.clearButton, 'click', this.clearSearch.bind(this));
        }

        if (this.advancedToggle) {
            DOMHelper.addEventListener(this.advancedToggle, 'click', this.toggleAdvancedSearch.bind(this));
        }

        this.setupFilterEventListeners();
    }

    /**
     * Setup filter event listeners
     */
    setupFilterEventListeners() {
        const typeFilter = document.getElementById('type-filter');
        const weightFilter = document.getElementById('weight-filter');
        const descriptionFilter = document.getElementById('description-filter');

        if (typeFilter) {
            DOMHelper.addEventListener(typeFilter, 'change', this.handleFilterChange.bind(this));
        }

        if (weightFilter) {
            DOMHelper.addEventListener(weightFilter, 'change', this.handleFilterChange.bind(this));
        }

        if (descriptionFilter) {
            DOMHelper.addEventListener(descriptionFilter, 'input', DOMHelper.debounce(this.handleFilterChange.bind(this), 300));
        }
    }

    /**
     * Handle search input
     */
    handleSearchInput(event) {
        const query = event.target.value;
        this.searchFilters.name = query;
        
        if (query.length >= 2) {
            this.performSearch();
        } else if (query.length === 0) {
            this.clearSearchResults();
        }
    }

    /**
     * Handle filter change
     */
    handleFilterChange(event) {
        const filterType = event.target.id.replace('-filter', '');
        this.searchFilters[filterType] = event.target.value;
        this.performSearch();
    }

    /**
     * Handle search changed event
     */
    handleSearchChanged(data) {
        this.updateSearchResults(data.results);
    }

    /**
     * Handle filter changed event
     */
    handleFilterChanged(data) {
        this.searchFilters = { ...this.searchFilters, ...data.filters };
        this.performSearch();
    }

    /**
     * Handle graph updated event
     */
    handleGraphUpdated(data) {
        if (this.searchFilters.name || this.hasActiveFilters()) {
            this.performSearch();
        }
    }

    /**
     * Perform search with current filters
     */
    async performSearch() {
        if (this.isSearching) return;

        this.isSearching = true;
        this.updateSearchButtonState();

        try {
            const query = this.buildSearchQuery();
            const results = await this.executeSearch(query);
            
            this.searchResults = results;
            this.updateSearchResults(results);
            this.addToSearchHistory(query);
            
            this.eventBus.publish(EVENT_TYPES.SEARCH_CHANGED, {
                query,
                results,
                filters: this.searchFilters
            });

        } catch (error) {
            console.error('Search error:', error);
            this.notificationManager.showError('Search failed');
        } finally {
            this.isSearching = false;
            this.updateSearchButtonState();
        }
    }

    /**
     * Build search query from filters
     */
    buildSearchQuery() {
        const query = {
            name: this.searchFilters.name,
            type: this.searchFilters.type,
            description: this.searchFilters.description,
            weight: this.searchFilters.weight,
            semantic: this.searchFilters.name.length > 2
        };

        return query;
    }

    /**
     * Execute search with query
     */
    async executeSearch(query) {
        const allArtifacts = this.getAllArtifacts();
        let results = allArtifacts;

        if (query.name) {
            results = results.filter(artifact => 
                artifact.name.toLowerCase().includes(query.name.toLowerCase())
            );
        }

        if (query.type && query.type !== 'all') {
            results = results.filter(artifact => 
                artifact.type === query.type
            );
        }

        if (query.description) {
            results = results.filter(artifact => 
                artifact.description && 
                artifact.description.toLowerCase().includes(query.description.toLowerCase())
            );
        }

        if (query.weight && query.weight !== 'all') {
            results = results.filter(artifact => {
                const weight = artifact.weight || 1;
                switch (query.weight) {
                    case 'weak': return weight <= 3;
                    case 'medium': return weight >= 4 && weight <= 7;
                    case 'strong': return weight >= 8;
                    default: return true;
                }
            });
        }

        if (query.semantic && this.semanticService) {
            try {
                const semanticResults = await this.semanticService.searchSimilar(query.name);
                results = this.mergeSemanticResults(results, semanticResults);
            } catch (error) {
                console.warn('Semantic search failed:', error);
            }
        }

        return results;
    }

    /**
     * Merge semantic search results with regular results
     */
    mergeSemanticResults(regularResults, semanticResults) {
        const regularIds = new Set(regularResults.map(r => r.id));
        const semanticFiltered = semanticResults.filter(r => !regularIds.has(r.id));
        
        return [...regularResults, ...semanticFiltered];
    }

    /**
     * Get all artifacts from the graph
     */
    getAllArtifacts() {
        const nodeGroups = document.querySelectorAll('.node-group');
        return Array.from(nodeGroups).map(group => {
            const nodeId = group.getAttribute('data-node-id');
            const title = group.querySelector('title');
            const transform = group.getAttribute('transform');
            
            const titleMatch = title?.textContent.match(/(.+) \((.+)\)/);
            const transformMatch = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/);
            
            return {
                id: nodeId,
                name: titleMatch ? titleMatch[1] : 'Unknown',
                type: titleMatch ? titleMatch[2] : 'purpose',
                x: transformMatch ? parseFloat(transformMatch[1]) : 0,
                y: transformMatch ? parseFloat(transformMatch[2]) : 0,
                description: '',
                weight: 1
            };
        });
    }

    /**
     * Update search results display
     */
    updateSearchResults(results) {
        if (!this.searchResultsContainer) return;

        if (results.length === 0) {
            this.searchResultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const resultsHtml = results.map(artifact => `
            <div class="search-result-item" data-artifact-id="${artifact.id}">
                <div class="result-header">
                    <span class="result-type">${artifact.type}</span>
                    <span class="result-name">${artifact.name}</span>
                </div>
                <div class="result-description">${artifact.description || 'No description'}</div>
                <div class="result-actions">
                    <button class="btn-highlight" onclick="this.highlightArtifact('${artifact.id}')">Highlight</button>
                    <button class="btn-edit" onclick="this.editArtifact('${artifact.id}')">Edit</button>
                </div>
            </div>
        `).join('');

        this.searchResultsContainer.innerHTML = `
            <div class="search-results-header">
                <span>${results.length} result(s) found</span>
            </div>
            <div class="search-results-list">
                ${resultsHtml}
            </div>
        `;

        this.setupResultEventListeners();
    }

    /**
     * Setup result event listeners
     */
    setupResultEventListeners() {
        const resultItems = this.searchResultsContainer.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            const highlightBtn = item.querySelector('.btn-highlight');
            const editBtn = item.querySelector('.btn-edit');

            if (highlightBtn) {
                DOMHelper.addEventListener(highlightBtn, 'click', (event) => {
                    event.stopPropagation();
                    const artifactId = item.getAttribute('data-artifact-id');
                    this.highlightArtifact(artifactId);
                });
            }

            if (editBtn) {
                DOMHelper.addEventListener(editBtn, 'click', (event) => {
                    event.stopPropagation();
                    const artifactId = item.getAttribute('data-artifact-id');
                    this.editArtifact(artifactId);
                });
            }
        });
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        if (this.searchResultsContainer) {
            this.searchResultsContainer.innerHTML = '';
        }
        this.searchResults = [];
    }

    /**
     * Clear search
     */
    clearSearch() {
        this.searchFilters = {
            name: '',
            type: 'all',
            description: '',
            weight: 'all',
            dateRange: null
        };

        if (this.searchInput) {
            this.searchInput.value = '';
        }

        this.clearSearchResults();
        this.resetFilters();
    }

    /**
     * Reset filters to default values
     */
    resetFilters() {
        const typeFilter = document.getElementById('type-filter');
        const weightFilter = document.getElementById('weight-filter');
        const descriptionFilter = document.getElementById('description-filter');

        if (typeFilter) typeFilter.value = 'all';
        if (weightFilter) weightFilter.value = 'all';
        if (descriptionFilter) descriptionFilter.value = '';
    }

    /**
     * Toggle advanced search panel
     */
    toggleAdvancedSearch() {
        if (!this.searchFiltersPanel) return;

        const isVisible = this.searchFiltersPanel.style.display !== 'none';
        this.searchFiltersPanel.style.display = isVisible ? 'none' : 'block';
        
        if (this.advancedToggle) {
            this.advancedToggle.textContent = isVisible ? '⚙️' : '▼';
        }
    }

    /**
     * Update search button state
     */
    updateSearchButtonState() {
        if (this.searchButton) {
            this.searchButton.disabled = this.isSearching;
            this.searchButton.textContent = this.isSearching ? '⏳' : '🔍';
        }
    }

    /**
     * Highlight artifact in graph
     */
    highlightArtifact(artifactId) {
        this.eventBus.publish(EVENT_TYPES.NODE_SELECTED, { nodeId: artifactId });
        this.notificationManager.showInfo('Artifact highlighted');
    }

    /**
     * Edit artifact
     */
    editArtifact(artifactId) {
        const artifact = this.searchResults.find(r => r.id === artifactId);
        if (artifact) {
            this.eventBus.publish(EVENT_TYPES.NODE_EDIT_REQUESTED, { node: artifact });
        }
    }

    /**
     * Add query to search history
     */
    addToSearchHistory(query) {
        const historyItem = {
            query: query.name || 'Advanced search',
            timestamp: Date.now(),
            filters: { ...this.searchFilters }
        };

        this.searchHistory.unshift(historyItem);
        this.searchHistory = this.searchHistory.slice(0, 10);
        this.saveSearchHistory();
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('hexy-search-history');
            if (history) {
                this.searchHistory = JSON.parse(history);
            }
        } catch (error) {
            console.warn('Failed to load search history:', error);
        }
    }

    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('hexy-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }

    /**
     * Check if there are active filters
     */
    hasActiveFilters() {
        return this.searchFilters.type !== 'all' || 
               this.searchFilters.weight !== 'all' || 
               this.searchFilters.description !== '';
    }

    /**
     * Get search results
     */
    getSearchResults() {
        return this.searchResults;
    }

    /**
     * Get search filters
     */
    getSearchFilters() {
        return { ...this.searchFilters };
    }

    /**
     * Get search history
     */
    getSearchHistory() {
        return [...this.searchHistory];
    }

    /**
     * Destroy the search component
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.SEARCH_CHANGED, this.handleSearchChanged.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.FILTER_CHANGED, this.handleFilterChanged.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.GRAPH_UPDATED, this.handleGraphUpdated.bind(this));

        this.clearSearchResults();
        this.searchHistory = [];
        this.isInitialized = false;
    }
} 