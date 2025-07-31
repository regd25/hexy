import { EVENT_TYPES } from '../../utils/events/EventTypes.js';
import { DOMHelper } from '../../utils/helpers/DOMHelper.js';

/**
 * Link renderer that handles link visualization and interactions
 * Follows Single Responsibility Principle for link rendering
 */
export class LinkRenderer {
    constructor(eventBus, notificationManager) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.isInitialized = false;
        this.linkColors = {
            default: '#666',
            highlighted: '#FFD700',
            selected: '#FF6B6B',
            weak: '#999',
            strong: '#333'
        };
        this.linkWidths = {
            default: 2,
            highlighted: 4,
            selected: 3,
            weak: 1,
            strong: 5
        };
    }

    /**
     * Initialize the link renderer
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.COMPONENT_INITIALIZED, {
            component: 'LinkRenderer',
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for link interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.LINK_CREATED, this.handleLinkCreated.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_DELETED, this.handleLinkDeleted.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_SELECTED, this.handleLinkSelected.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_WEIGHT_CHANGED, this.handleLinkWeightChanged.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));
    }

    /**
     * Handle link creation event
     */
    handleLinkCreated(data) {
        this.renderLink(data.link);
    }

    /**
     * Handle link deletion event
     */
    handleLinkDeleted(data) {
        this.removeLink(data.linkId);
    }

    /**
     * Handle link selection event
     */
    handleLinkSelected(data) {
        this.highlightLink(data.linkId);
    }

    /**
     * Handle link weight change event
     */
    handleLinkWeightChanged(data) {
        this.updateLinkWeight(data.link, data.weight);
    }

    /**
     * Handle node update event (to update link positions)
     */
    handleNodeUpdated(data) {
        this.updateLinkPositions(data.node);
    }

    /**
     * Render a link in the graph
     */
    renderLink(link) {
        const svg = document.getElementById('graph');
        if (!svg) return;

        const linkGroup = DOMHelper.createElement('g', {
            class: 'link-group',
            'data-link-id': link.id
        });

        const line = DOMHelper.createSVGElement('line', {
            class: 'link-line',
            stroke: this.getLinkColor(link),
            'stroke-width': this.getLinkWidth(link),
            'stroke-dasharray': link.type === 'dashed' ? '5,5' : 'none'
        });

        const label = DOMHelper.createSVGElement('text', {
            class: 'link-label',
            'text-anchor': 'middle',
            'font-size': '10',
            fill: '#333',
            'pointer-events': 'none'
        });

        const title = DOMHelper.createSVGElement('title');
        title.textContent = `${link.source.name} → ${link.target.name} (Weight: ${link.weight || 1})`;

        linkGroup.appendChild(line);
        linkGroup.appendChild(label);
        linkGroup.appendChild(title);

        this.setupLinkEventListeners(linkGroup, link);
        svg.appendChild(linkGroup);

        this.positionLink(linkGroup, link);
    }

    /**
     * Update an existing link
     */
    updateLink(link) {
        const linkGroup = document.querySelector(`[data-link-id="${link.id}"]`);
        if (!linkGroup) return;

        const line = linkGroup.querySelector('.link-line');
        const label = linkGroup.querySelector('.link-label');
        const title = linkGroup.querySelector('title');

        if (line) {
            line.setAttribute('stroke', this.getLinkColor(link));
            line.setAttribute('stroke-width', this.getLinkWidth(link));
            line.setAttribute('stroke-dasharray', link.type === 'dashed' ? '5,5' : 'none');
        }

        if (label) {
            label.textContent = link.label || '';
        }

        if (title) {
            title.textContent = `${link.source.name} → ${link.target.name} (Weight: ${link.weight || 1})`;
        }

        this.positionLink(linkGroup, link);
    }

    /**
     * Remove a link from the graph
     */
    removeLink(linkId) {
        const linkGroup = document.querySelector(`[data-link-id="${linkId}"]`);
        if (linkGroup) {
            DOMHelper.removeElement(linkGroup);
        }
    }

    /**
     * Highlight a selected link
     */
    highlightLink(linkId) {
        const allLinks = document.querySelectorAll('.link-line');
        allLinks.forEach(link => {
            link.setAttribute('stroke', this.linkColors.default);
            link.setAttribute('stroke-width', this.linkWidths.default);
        });

        const selectedLink = document.querySelector(`[data-link-id="${linkId}"] .link-line`);
        if (selectedLink) {
            selectedLink.setAttribute('stroke', this.linkColors.selected);
            selectedLink.setAttribute('stroke-width', this.linkWidths.selected);
        }
    }

    /**
     * Update link weight
     */
    updateLinkWeight(link, weight) {
        const linkGroup = document.querySelector(`[data-link-id="${link.id}"]`);
        if (!linkGroup) return;

        const line = linkGroup.querySelector('.link-line');
        if (line) {
            line.setAttribute('stroke-width', this.getLinkWidth({ ...link, weight }));
        }

        const title = linkGroup.querySelector('title');
        if (title) {
            title.textContent = `${link.source.name} → ${link.target.name} (Weight: ${weight})`;
        }
    }

    /**
     * Update link positions when nodes move
     */
    updateLinkPositions(node) {
        const links = document.querySelectorAll('.link-group');
        links.forEach(linkGroup => {
            const linkId = linkGroup.getAttribute('data-link-id');
            const link = this.getLinkData(linkId);

            if (link && (link.source.id === node.id || link.target.id === node.id)) {
                this.positionLink(linkGroup, link);
            }
        });
    }

    /**
     * Setup event listeners for a link
     */
    setupLinkEventListeners(linkGroup, link) {
        const line = linkGroup.querySelector('.link-line');

        DOMHelper.addEventListener(line, 'click', (event) => {
            event.stopPropagation();
            this.eventBus.publish(EVENT_TYPES.LINK_SELECTED, { linkId: link.id });
        });

        DOMHelper.addEventListener(line, 'contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.eventBus.publish(EVENT_TYPES.LINK_RIGHT_CLICKED, { event, link });
        });

        DOMHelper.addEventListener(line, 'mouseenter', () => {
            line.style.cursor = 'pointer';
            line.setAttribute('stroke', this.linkColors.highlighted);
            line.setAttribute('stroke-width', this.linkWidths.highlighted);
        });

        DOMHelper.addEventListener(line, 'mouseleave', () => {
            line.style.cursor = 'default';
            line.setAttribute('stroke', this.getLinkColor(link));
            line.setAttribute('stroke-width', this.getLinkWidth(link));
        });
    }

    /**
     * Position a link between its source and target nodes
     */
    positionLink(linkGroup, link) {
        const sourceNode = document.querySelector(`[data-node-id="${link.source.id}"]`);
        const targetNode = document.querySelector(`[data-node-id="${link.target.id}"]`);

        if (!sourceNode || !targetNode) return;

        const sourceTransform = sourceNode.getAttribute('transform');
        const targetTransform = targetNode.getAttribute('transform');

        const sourceMatch = sourceTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const targetMatch = targetTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);

        if (!sourceMatch || !targetMatch) return;

        const sourceX = parseFloat(sourceMatch[1]);
        const sourceY = parseFloat(sourceMatch[2]);
        const targetX = parseFloat(targetMatch[1]);
        const targetY = parseFloat(targetMatch[2]);

        const line = linkGroup.querySelector('.link-line');
        const label = linkGroup.querySelector('.link-label');

        if (line) {
            line.setAttribute('x1', sourceX);
            line.setAttribute('y1', sourceY);
            line.setAttribute('x2', targetX);
            line.setAttribute('y2', targetY);
        }

        if (label) {
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            label.setAttribute('x', midX);
            label.setAttribute('y', midY);
        }
    }

    /**
     * Get color for link based on weight and type
     */
    getLinkColor(link) {
        const weight = link.weight || 1;

        if (weight <= 2) return this.linkColors.weak;
        if (weight >= 8) return this.linkColors.strong;

        return this.linkColors.default;
    }

    /**
     * Get width for link based on weight
     */
    getLinkWidth(link) {
        const weight = link.weight || 1;

        if (weight <= 2) return this.linkWidths.weak;
        if (weight >= 8) return this.linkWidths.strong;

        return this.linkWidths.default;
    }

    /**
     * Get link data from DOM (placeholder implementation)
     */
    getLinkData(linkId) {
        const linkGroup = document.querySelector(`[data-link-id="${linkId}"]`);
        if (!linkGroup) return null;

        const title = linkGroup.querySelector('title');
        if (!title) return null;

        const titleText = title.textContent;
        const match = titleText.match(/(.+) → (.+) \(Weight: (\d+)\)/);

        if (match) {
            return {
                id: linkId,
                source: { name: match[1] },
                target: { name: match[2] },
                weight: parseInt(match[3])
            };
        }

        return null;
    }

    /**
     * Update link colors
     */
    updateLinkColors(colors) {
        this.linkColors = { ...this.linkColors, ...colors };
        this.refreshAllLinks();
    }

    /**
     * Update link widths
     */
    updateLinkWidths(widths) {
        this.linkWidths = { ...this.linkWidths, ...widths };
        this.refreshAllLinks();
    }

    /**
     * Refresh all links with current colors and widths
     */
    refreshAllLinks() {
        const linkGroups = document.querySelectorAll('.link-group');
        linkGroups.forEach(group => {
            const linkId = group.getAttribute('data-link-id');
            const link = this.getLinkData(linkId);
            if (link) {
                this.updateLink(link);
            }
        });
    }

    /**
     * Get all rendered links
     */
    getAllRenderedLinks() {
        const linkGroups = document.querySelectorAll('.link-group');
        return Array.from(linkGroups).map(group => ({
            id: group.getAttribute('data-link-id'),
            element: group
        }));
    }

    /**
     * Clear all links
     */
    clearAllLinks() {
        const linkGroups = document.querySelectorAll('.link-group');
        linkGroups.forEach(group => DOMHelper.removeElement(group));
    }

    /**
     * Create link between two nodes
     */
    createLink(sourceNode, targetNode, weight = 1, type = 'solid') {
        const link = {
            id: DOMHelper.generateId('link'),
            source: sourceNode,
            target: targetNode,
            weight: weight,
            type: type,
            label: ''
        };

        this.renderLink(link);
        return link;
    }

    /**
     * Destroy the link renderer
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_CREATED, this.handleLinkCreated.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_DELETED, this.handleLinkDeleted.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_SELECTED, this.handleLinkSelected.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_WEIGHT_CHANGED, this.handleLinkWeightChanged.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_UPDATED, this.handleNodeUpdated.bind(this));

        this.clearAllLinks();
        this.isInitialized = false;
    }
} 