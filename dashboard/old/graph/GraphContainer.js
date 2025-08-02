import { EVENT_TYPES } from '../utils/events/EventTypes.js';

/**
 * Main graph container that orchestrates graph visualization and interactions
 * Follows Single Responsibility Principle for graph management
 */
export class GraphContainer {
    constructor(eventBus, notificationManager, graphService, configService) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.graphService = graphService;
        this.configService = configService;
        this.isInitialized = false;
        this.selectedNodes = new Set();
        this.selectedLinks = new Set();
    }

    /**
     * Initialize the graph container
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupMouseInteractions();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.GRAPH_CONTAINER_INITIALIZED, {
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for graph interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_CREATED, this.handleLinkCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_DELETED, this.handleLinkDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.CONFIG_CHANGED, this.handleConfigChanged.bind(this));
    }

    /**
     * Setup keyboard shortcuts for graph interactions
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key) {
                case 'a':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.selectAllNodes();
                    }
                    break;
                case 'd':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.deselectAll();
                    }
                    break;
                case 'Delete':
                case 'Backspace':
                    this.deleteSelected();
                    break;
                case 'Escape':
                    this.deselectAll();
                    break;
            }
        });
    }

    /**
     * Setup mouse interactions for graph canvas
     */
    setupMouseInteractions() {
        const canvas = document.getElementById('graph');
        if (!canvas) return;

        canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        canvas.addEventListener('dblclick', this.handleCanvasDoubleClick.bind(this));
        canvas.addEventListener('wheel', this.handleCanvasWheel.bind(this));
    }

    /**
     * Handle node creation event
     */
    handleNodeCreated(data) {
        this.graphService.addNode(data.node);
        this.notificationManager.showSuccess('Node created successfully');
    }

    /**
     * Handle node update event
     */
    handleNodeUpdated(data) {
        this.graphService.updateNode(data.node);
        this.notificationManager.showInfo('Node updated');
    }

    /**
     * Handle node deletion event
     */
    handleNodeDeleted(data) {
        this.graphService.removeNode(data.nodeId);
        this.selectedNodes.delete(data.nodeId);
        this.notificationManager.showSuccess('Node deleted');
    }

    /**
     * Handle link creation event
     */
    handleLinkCreated(data) {
        this.graphService.addLink(data.link);
        this.notificationManager.showSuccess('Link created successfully');
    }

    /**
     * Handle link deletion event
     */
    handleLinkDeleted(data) {
        this.graphService.removeLink(data.linkId);
        this.selectedLinks.delete(data.linkId);
        this.notificationManager.showSuccess('Link deleted');
    }

    /**
     * Handle configuration changes
     */
    handleConfigChanged(data) {
        this.graphService.updateColors(data.colors);
        this.notificationManager.showInfo('Graph configuration updated');
    }

    /**
     * Handle canvas click for node creation
     */
    handleCanvasClick(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (event.altKey || event.ctrlKey || event.metaKey) {
            this.eventBus.publish(EVENT_TYPES.CANVAS_CLICKED, { x, y, modifiers: { alt: event.altKey, ctrl: event.ctrlKey, meta: event.metaKey } });
        }
    }

    /**
     * Handle canvas double click for quick node creation
     */
    handleCanvasDoubleClick(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.eventBus.publish(EVENT_TYPES.CANVAS_DOUBLE_CLICKED, { x, y });
    }

    /**
     * Handle canvas wheel for zoom and navigation
     */
    handleCanvasWheel(event) {
        event.preventDefault();
        
        if (event.ctrlKey || event.metaKey) {
            const delta = event.deltaY > 0 ? 0.9 : 1.1;
            this.graphService.zoom(delta);
        } else if (event.shiftKey) {
            this.graphService.pan(event.deltaX, event.deltaY);
        }
    }

    /**
     * Select all nodes
     */
    selectAllNodes() {
        const allNodes = this.graphService.getAllNodes();
        allNodes.forEach(node => this.selectedNodes.add(node.id));
        this.graphService.highlightNodes(Array.from(this.selectedNodes));
        this.notificationManager.showInfo(`${allNodes.length} nodes selected`);
    }

    /**
     * Deselect all nodes and links
     */
    deselectAll() {
        this.selectedNodes.clear();
        this.selectedLinks.clear();
        this.graphService.clearHighlights();
    }

    /**
     * Delete selected nodes and links
     */
    deleteSelected() {
        if (this.selectedNodes.size === 0 && this.selectedLinks.size === 0) {
            return;
        }

        this.selectedNodes.forEach(nodeId => {
            this.eventBus.publish(EVENT_TYPES.NODE_DELETED, { nodeId });
        });

        this.selectedLinks.forEach(linkId => {
            this.eventBus.publish(EVENT_TYPES.LINK_DELETED, { linkId });
        });

        this.deselectAll();
    }

    /**
     * Update graph with new data
     */
    updateGraph(nodes, links) {
        this.graphService.updateGraph(nodes, links);
        this.eventBus.publish(EVENT_TYPES.GRAPH_UPDATED, { nodes, links });
    }

    /**
     * Get current graph data
     */
    getGraphData() {
        return {
            nodes: this.graphService.getAllNodes(),
            links: this.graphService.getAllLinks()
        };
    }

    /**
     * Export graph data
     */
    exportGraph() {
        const data = this.getGraphData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import graph data
     */
    importGraph(data) {
        try {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            this.updateGraph(parsedData.nodes || [], parsedData.links || []);
            this.notificationManager.showSuccess('Graph imported successfully');
        } catch (error) {
            this.notificationManager.showError('Failed to import graph data');
        }
    }

    /**
     * Destroy the graph container
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_CREATED, this.handleLinkCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_DELETED, this.handleLinkDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.CONFIG_CHANGED, this.handleConfigChanged.bind(this));

        this.selectedNodes.clear();
        this.selectedLinks.clear();
        this.isInitialized = false;
    }
} 