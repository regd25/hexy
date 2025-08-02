import { EVENT_TYPES } from '../../utils/events/EventTypes.js';

/**
 * Node renderer that handles node visualization and interactions
 * Follows Single Responsibility Principle for node rendering
 */
export class NodeRenderer {
    constructor(eventBus, notificationManager) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.isInitialized = false;
        this.nodeColors = {
            purpose: '#FF6B6B',
            context: '#4ECDC4',
            authority: '#45B7D1',
            evaluation: '#96CEB4',
            vision: '#FFEAA7',
            policy: '#DDA0DD',
            principle: '#98D8C8',
            guideline: '#F7DC6F',
            concept: '#BB8FCE',
            indicator: '#85C1E9',
            process: '#F8C471',
            procedure: '#82E0AA',
            event: '#F1948A',
            result: '#85C1E9',
            observation: '#F7DC6F',
            actor: '#D7BDE2',
            area: '#A9CCE3'
        };
    }

    /**
     * Initialize the node renderer
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.COMPONENT_INITIALIZED, {
            component: 'NodeRenderer',
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for node interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_SELECTED, this.handleNodeSelected.bind(this));
    }

    /**
     * Handle node creation event
     */
    handleNodeCreated(data) {
        this.renderNode(data.node);
    }

    /**
     * Handle node update event
     */
    handleNodeUpdated(data) {
        this.updateNode(data.node);
    }

    /**
     * Handle node deletion event
     */
    handleNodeDeleted(data) {
        this.removeNode(data.nodeId);
    }

    /**
     * Handle node selection event
     */
    handleNodeSelected(data) {
        this.highlightNode(data.nodeId);
    }

    /**
     * Render a node in the graph
     */
    renderNode(node) {
        const svg = document.getElementById('graph');
        if (!svg) return;

        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'node-group');
        nodeGroup.setAttribute('data-node-id', node.id);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', this.getNodeColor(node.type));
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('class', 'node-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', '0.35em');
        text.setAttribute('class', 'node-text');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#fff');
        text.textContent = this.getNodeLabel(node);

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${node.name} (${node.type})`;

        nodeGroup.appendChild(circle);
        nodeGroup.appendChild(text);
        nodeGroup.appendChild(title);

        this.setupNodeEventListeners(nodeGroup, node);
        svg.appendChild(nodeGroup);

        this.positionNode(nodeGroup, node);
    }

    /**
     * Update an existing node
     */
    updateNode(node) {
        const nodeGroup = document.querySelector(`[data-node-id="${node.id}"]`);
        if (!nodeGroup) return;

        const circle = nodeGroup.querySelector('.node-circle');
        const text = nodeGroup.querySelector('.node-text');
        const title = nodeGroup.querySelector('title');

        if (circle) {
            circle.setAttribute('fill', this.getNodeColor(node.type));
        }

        if (text) {
            text.textContent = this.getNodeLabel(node);
        }

        if (title) {
            title.textContent = `${node.name} (${node.type})`;
        }
    }

    /**
     * Remove a node from the graph
     */
    removeNode(nodeId) {
        const nodeGroup = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeGroup) {
            nodeGroup.remove();
        }
    }

    /**
     * Highlight a selected node
     */
    highlightNode(nodeId) {
        const allNodes = document.querySelectorAll('.node-circle');
        allNodes.forEach(node => {
            node.setAttribute('stroke-width', '2');
            node.setAttribute('stroke', '#333');
        });

        const selectedNode = document.querySelector(`[data-node-id="${nodeId}"] .node-circle`);
        if (selectedNode) {
            selectedNode.setAttribute('stroke-width', '4');
            selectedNode.setAttribute('stroke', '#FFD700');
        }
    }

    /**
     * Setup event listeners for a node
     */
    setupNodeEventListeners(nodeGroup, node) {
        nodeGroup.addEventListener('click', (event) => {
            event.stopPropagation();
            this.eventBus.publish(EVENT_TYPES.NODE_SELECTED, { nodeId: node.id });
        });

        nodeGroup.addEventListener('dblclick', (event) => {
            event.stopPropagation();
            this.eventBus.publish(EVENT_TYPES.NODE_DOUBLE_CLICKED, { node });
        });

        nodeGroup.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.eventBus.publish(EVENT_TYPES.NODE_RIGHT_CLICKED, { event, node });
        });

        nodeGroup.addEventListener('mouseenter', () => {
            nodeGroup.style.cursor = 'pointer';
        });

        nodeGroup.addEventListener('mouseleave', () => {
            nodeGroup.style.cursor = 'default';
        });
    }

    /**
     * Position a node at its coordinates
     */
    positionNode(nodeGroup, node) {
        nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    }

    /**
     * Get color for node type
     */
    getNodeColor(type) {
        return this.nodeColors[type] || '#CCCCCC';
    }

    /**
     * Get label for node display
     */
    getNodeLabel(node) {
        if (node.name.length <= 8) {
            return node.name;
        }
        return node.name.substring(0, 6) + '...';
    }

    /**
     * Update node colors
     */
    updateNodeColors(colors) {
        this.nodeColors = { ...this.nodeColors, ...colors };
        this.refreshAllNodes();
    }

    /**
     * Refresh all nodes with current colors
     */
    refreshAllNodes() {
        const nodeGroups = document.querySelectorAll('.node-group');
        nodeGroups.forEach(group => {
            const nodeId = group.getAttribute('data-node-id');
            const circle = group.querySelector('.node-circle');
            if (circle) {
                const nodeType = this.getNodeTypeFromId(nodeId);
                circle.setAttribute('fill', this.getNodeColor(nodeType));
            }
        });
    }

    /**
     * Get node type from node ID (placeholder implementation)
     */
    getNodeTypeFromId(nodeId) {
        const nodeGroup = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeGroup) {
            const title = nodeGroup.querySelector('title');
            if (title) {
                const match = title.textContent.match(/\(([^)]+)\)/);
                return match ? match[1] : 'purpose';
            }
        }
        return 'purpose';
    }

    /**
     * Get all rendered nodes
     */
    getAllRenderedNodes() {
        const nodeGroups = document.querySelectorAll('.node-group');
        return Array.from(nodeGroups).map(group => ({
            id: group.getAttribute('data-node-id'),
            element: group
        }));
    }

    /**
     * Clear all nodes
     */
    clearAllNodes() {
        const nodeGroups = document.querySelectorAll('.node-group');
        nodeGroups.forEach(group => group.remove());
    }

    /**
     * Destroy the node renderer
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_CREATED, this.handleNodeCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_DELETED, this.handleNodeDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_SELECTED, this.handleNodeSelected.bind(this));

        this.clearAllNodes();
        this.isInitialized = false;
    }
} 