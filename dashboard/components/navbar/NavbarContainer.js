import { EVENT_TYPES } from '../utils/events/EventTypes.js';

/**
 * Navbar container that manages logo, management controls and metrics
 * Follows Single Responsibility Principle for navigation bar management
 */
export class NavbarContainer {
    constructor(eventBus, notificationManager, configService, editorService) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.configService = configService;
        this.editorService = editorService;
        this.isInitialized = false;
        this.metrics = {
            totalArtifacts: 0,
            totalLinks: 0,
            artifactTypes: {},
            lastUpdated: null
        };
    }

    /**
     * Initialize the navbar container
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.setupDOMElements();
        this.setupLogoComponent();
        this.setupManagementControls();
        this.setupMetricsDisplay();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.NAVBAR_INITIALIZED, {
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for navbar interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_CREATED, this.handleLinkCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_DELETED, this.handleLinkDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.GRAPH_UPDATED, this.handleGraphUpdated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.CONFIG_CHANGED, this.handleConfigChanged.bind(this));
    }

    /**
     * Setup DOM elements for navbar functionality
     */
    setupDOMElements() {
        this.logoElement = document.getElementById('logo');
        this.managementPanel = document.getElementById('management-panel');
        this.metricsPanel = document.getElementById('metrics-panel');
        this.settingsBtn = document.getElementById('settings-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.exportBtn = document.getElementById('navbar-export-btn');
        this.importBtn = document.getElementById('navbar-import-btn');
        this.clearBtn = document.getElementById('clear-btn');

        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', this.handleSettingsClick.bind(this));
        }

        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', this.handleHelpClick.bind(this));
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', this.handleExportClick.bind(this));
        }

        if (this.importBtn) {
            this.importBtn.addEventListener('click', this.handleImportClick.bind(this));
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', this.handleClearClick.bind(this));
        }
    }

    /**
     * Setup logo component
     */
    setupLogoComponent() {
        if (!this.logoElement) return;

        this.logoElement.innerHTML = `
            <div class="logo-container">
                <div class="logo-icon">🧠</div>
                <div class="logo-text">
                    <span class="logo-title">Hexy</span>
                    <span class="logo-subtitle">Framework</span>
                </div>
            </div>
        `;

        this.logoElement.addEventListener('click', this.handleLogoClick.bind(this));
    }

    /**
     * Setup management controls
     */
    setupManagementControls() {
        if (!this.managementPanel) return;

        this.managementPanel.innerHTML = `
            <div class="management-controls">
                <button id="settings-btn" class="btn-control" title="Settings">
                    <span class="icon">⚙️</span>
                    <span class="label">Settings</span>
                </button>
                <button id="help-btn" class="btn-control" title="Help">
                    <span class="icon">❓</span>
                    <span class="label">Help</span>
                </button>
                <button id="navbar-export-btn" class="btn-control" title="Export">
                    <span class="icon">📤</span>
                    <span class="label">Export</span>
                </button>
                <button id="navbar-import-btn" class="btn-control" title="Import">
                    <span class="icon">📥</span>
                    <span class="label">Import</span>
                </button>
                <button id="clear-btn" class="btn-control btn-danger" title="Clear All">
                    <span class="icon">🗑️</span>
                    <span class="label">Clear</span>
                </button>
            </div>
        `;
    }

    /**
     * Setup metrics display
     */
    setupMetricsDisplay() {
        if (!this.metricsPanel) return;

        this.metricsPanel.innerHTML = `
            <div class="metrics-container">
                <div class="metric-item">
                    <span class="metric-label">Artifacts</span>
                    <span id="total-artifacts" class="metric-value">0</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Links</span>
                    <span id="total-links" class="metric-value">0</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Types</span>
                    <span id="total-types" class="metric-value">0</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Updated</span>
                    <span id="last-updated" class="metric-value">Never</span>
                </div>
            </div>
        `;
    }

    /**
     * Handle node creation event
     */
    handleNodeCreated(data) {
        this.updateMetrics();
    }

    /**
     * Handle node deletion event
     */
    handleNodeDeleted(data) {
        this.updateMetrics();
    }

    /**
     * Handle link creation event
     */
    handleLinkCreated(data) {
        this.updateMetrics();
    }

    /**
     * Handle link deletion event
     */
    handleLinkDeleted(data) {
        this.updateMetrics();
    }

    /**
     * Handle graph update event
     */
    handleGraphUpdated(data) {
        this.updateMetrics();
    }

    /**
     * Handle configuration change event
     */
    handleConfigChanged(data) {
        this.notificationManager.showInfo('Configuration updated');
    }

    /**
     * Handle logo click
     */
    handleLogoClick() {
        this.eventBus.publish(EVENT_TYPES.LOGO_CLICKED, {
            timestamp: Date.now()
        });
        
        this.notificationManager.showInfo('Welcome to Hexy Framework!');
    }

    /**
     * Handle settings button click
     */
    handleSettingsClick() {
        this.showSettingsModal();
    }

    /**
     * Handle help button click
     */
    handleHelpClick() {
        this.showHelpModal();
    }

    /**
     * Handle export button click
     */
    handleExportClick() {
        this.eventBus.publish(EVENT_TYPES.EXPORT_REQUESTED, {
            timestamp: Date.now()
        });
    }

    /**
     * Handle import button click
     */
    handleImportClick() {
        this.eventBus.publish(EVENT_TYPES.IMPORT_REQUESTED, {
            timestamp: Date.now()
        });
    }

    /**
     * Handle clear button click
     */
    handleClearClick() {
        if (confirm('Are you sure you want to clear all artifacts and links? This action cannot be undone.')) {
            this.eventBus.publish(EVENT_TYPES.CLEAR_REQUESTED, {
                timestamp: Date.now()
            });
            
            this.notificationManager.showSuccess('All data cleared successfully');
        }
    }

    /**
     * Show settings modal
     */
    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Settings</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="setting-group">
                        <label>Theme</label>
                        <select id="theme-select">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Auto-save</label>
                        <input type="checkbox" id="auto-save" checked>
                    </div>
                    <div class="setting-group">
                        <label>Show tooltips</label>
                        <input type="checkbox" id="show-tooltips" checked>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancel-settings">Cancel</button>
                    <button class="btn-primary" id="save-settings">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-settings');
        const saveBtn = modal.querySelector('#save-settings');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        saveBtn.addEventListener('click', () => {
            this.saveSettings(modal);
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    /**
     * Show help modal
     */
    showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Help & Shortcuts</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h4>Keyboard Shortcuts</h4>
                        <ul>
                            <li><strong>Ctrl+A:</strong> Select all nodes</li>
                            <li><strong>Ctrl+D:</strong> Deselect all</li>
                            <li><strong>Delete/Backspace:</strong> Delete selected</li>
                            <li><strong>Escape:</strong> Cancel selection</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Mouse Interactions</h4>
                        <ul>
                            <li><strong>Click + Drag:</strong> Move nodes</li>
                            <li><strong>Double-click:</strong> Edit node</li>
                            <li><strong>Ctrl + Click:</strong> Create new node</li>
                            <li><strong>Right-click:</strong> Context menu</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Navigation</h4>
                        <ul>
                            <li><strong>Mouse wheel:</strong> Zoom in/out</li>
                            <li><strong>Shift + Mouse wheel:</strong> Pan</li>
                            <li><strong>Ctrl + Mouse wheel:</strong> Zoom</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" id="close-help">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const closeHelpBtn = modal.querySelector('#close-help');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        closeHelpBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    /**
     * Save settings from modal
     */
    saveSettings(modal) {
        const theme = modal.querySelector('#theme-select').value;
        const autoSave = modal.querySelector('#auto-save').checked;
        const showTooltips = modal.querySelector('#show-tooltips').checked;

        const settings = {
            theme,
            autoSave,
            showTooltips
        };

        localStorage.setItem('hexy-settings', JSON.stringify(settings));
        
        this.eventBus.publish(EVENT_TYPES.SETTINGS_UPDATED, { settings });
        this.notificationManager.showSuccess('Settings saved successfully');
    }

    /**
     * Update metrics display
     */
    updateMetrics() {
        this.eventBus.publish(EVENT_TYPES.METRICS_REQUESTED, {
            timestamp: Date.now()
        });
    }

    /**
     * Set metrics data
     */
    setMetrics(metrics) {
        this.metrics = { ...this.metrics, ...metrics };
        this.renderMetrics();
    }

    /**
     * Render metrics in the DOM
     */
    renderMetrics() {
        const totalArtifactsEl = document.getElementById('total-artifacts');
        const totalLinksEl = document.getElementById('total-links');
        const totalTypesEl = document.getElementById('total-types');
        const lastUpdatedEl = document.getElementById('last-updated');

        if (totalArtifactsEl) {
            totalArtifactsEl.textContent = this.metrics.totalArtifacts;
        }

        if (totalLinksEl) {
            totalLinksEl.textContent = this.metrics.totalLinks;
        }

        if (totalTypesEl) {
            totalTypesEl.textContent = Object.keys(this.metrics.artifactTypes).length;
        }

        if (lastUpdatedEl) {
            const lastUpdated = this.metrics.lastUpdated;
            if (lastUpdated) {
                const date = new Date(lastUpdated);
                lastUpdatedEl.textContent = date.toLocaleTimeString();
            } else {
                lastUpdatedEl.textContent = 'Never';
            }
        }
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return this.metrics;
    }

    /**
     * Show notification in navbar
     */
    showNotification(message, type = 'info') {
        this.notificationManager.show(message, type);
    }

    /**
     * Destroy the navbar container
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_CREATED, this.handleLinkCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_DELETED, this.handleLinkDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.GRAPH_UPDATED, this.handleGraphUpdated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.CONFIG_CHANGED, this.handleConfigChanged.bind(this));

        this.isInitialized = false;
    }
} 