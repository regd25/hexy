import { EVENT_TYPES } from '../../utils/events/EventTypes.js';
import { DOMHelper } from '../../utils/helpers/DOMHelper.js';

/**
 * Tooltip manager that handles contextual information on hover
 * Follows Single Responsibility Principle for tooltip management
 */
export class TooltipManager {
    constructor(eventBus, notificationManager) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.isInitialized = false;
        this.activeTooltip = null;
        this.tooltipElement = null;
        this.showDelay = 300;
        this.hideDelay = 100;
        this.showTimeout = null;
        this.hideTimeout = null;
    }

    /**
     * Initialize the tooltip manager
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.createTooltipElement();
        this.setupEventListeners();
        this.setupGlobalEventListeners();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.COMPONENT_INITIALIZED, {
            component: 'TooltipManager',
            timestamp: Date.now()
        });
    }

    /**
     * Create the tooltip element
     */
    createTooltipElement() {
        this.tooltipElement = DOMHelper.createElement('div', {
            id: 'tooltip',
            class: 'tooltip',
            style: `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.2s ease;
                max-width: 300px;
                word-wrap: break-word;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `
        });

        document.body.appendChild(this.tooltipElement);
    }

    /**
     * Setup event listeners for tooltip interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.TOOLTIP_SHOWN, this.handleTooltipShown.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.TOOLTIP_HIDDEN, this.handleTooltipHidden.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_SELECTED, this.handleNodeSelected.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_SELECTED, this.handleLinkSelected.bind(this));
    }

    /**
     * Setup global event listeners for tooltip behavior
     */
    setupGlobalEventListeners() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('scroll', this.handleScroll.bind(this));
        document.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Handle tooltip shown event
     */
    handleTooltipShown(data) {
        this.showTooltip(data.content, data.position);
    }

    /**
     * Handle tooltip hidden event
     */
    handleTooltipHidden() {
        this.hideTooltip();
    }

    /**
     * Handle node selection event
     */
    handleNodeSelected(data) {
        const node = this.getNodeData(data.nodeId);
        if (node) {
            this.showNodeTooltip(node);
        }
    }

    /**
     * Handle link selection event
     */
    handleLinkSelected(data) {
        const link = this.getLinkData(data.linkId);
        if (link) {
            this.showLinkTooltip(link);
        }
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        if (this.activeTooltip) {
            this.updateTooltipPosition(event.clientX, event.clientY);
        }
    }

    /**
     * Handle scroll event
     */
    handleScroll() {
        if (this.activeTooltip) {
            this.hideTooltip();
        }
    }

    /**
     * Handle resize event
     */
    handleResize() {
        if (this.activeTooltip) {
            this.hideTooltip();
        }
    }

    /**
     * Show tooltip with content and position
     */
    showTooltip(content, position = null) {
        if (!this.tooltipElement) return;

        this.tooltipElement.innerHTML = content;
        this.tooltipElement.style.opacity = '1';

        if (position) {
            this.updateTooltipPosition(position.x, position.y);
        }

        this.activeTooltip = { content, position };
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (!this.tooltipElement) return;

        this.tooltipElement.style.opacity = '0';
        this.activeTooltip = null;
    }

    /**
     * Update tooltip position
     */
    updateTooltipPosition(x, y) {
        if (!this.tooltipElement) return;

        const offset = 10;
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x + offset;
        let top = y + offset;

        if (left + tooltipRect.width > viewportWidth) {
            left = x - tooltipRect.width - offset;
        }

        if (top + tooltipRect.height > viewportHeight) {
            top = y - tooltipRect.height - offset;
        }

        this.tooltipElement.style.left = `${left}px`;
        this.tooltipElement.style.top = `${top}px`;
    }

    /**
     * Show tooltip for node
     */
    showNodeTooltip(node) {
        const content = this.createNodeTooltipContent(node);
        this.showTooltip(content);
    }

    /**
     * Show tooltip for link
     */
    showLinkTooltip(link) {
        const content = this.createLinkTooltipContent(link);
        this.showTooltip(content);
    }

    /**
     * Create tooltip content for node
     */
    createNodeTooltipContent(node) {
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <strong>${node.name}</strong>
                    <span class="tooltip-type">${node.type}</span>
                </div>
                <div class="tooltip-description">
                    ${node.description || 'No description available'}
                </div>
                <div class="tooltip-meta">
                    <small>ID: ${node.id}</small>
                    <small>Position: (${Math.round(node.x)}, ${Math.round(node.y)})</small>
                </div>
            </div>
        `;
    }

    /**
     * Create tooltip content for link
     */
    createLinkTooltipContent(link) {
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <strong>Connection</strong>
                </div>
                <div class="tooltip-description">
                    <strong>${link.source.name}</strong> → <strong>${link.target.name}</strong>
                </div>
                <div class="tooltip-meta">
                    <small>Weight: ${link.weight || 1}</small>
                    <small>Type: ${link.type || 'solid'}</small>
                </div>
            </div>
        `;
    }

    /**
     * Show tooltip with delay
     */
    showTooltipWithDelay(content, position = null, delay = this.showDelay) {
        this.clearTimeouts();
        
        this.showTimeout = setTimeout(() => {
            this.showTooltip(content, position);
        }, delay);
    }

    /**
     * Hide tooltip with delay
     */
    hideTooltipWithDelay(delay = this.hideDelay) {
        this.clearTimeouts();
        
        this.hideTimeout = setTimeout(() => {
            this.hideTooltip();
        }, delay);
    }

    /**
     * Clear all timeouts
     */
    clearTimeouts() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    /**
     * Get node data from DOM
     */
    getNodeData(nodeId) {
        const nodeGroup = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (!nodeGroup) return null;

        const title = nodeGroup.querySelector('title');
        if (!title) return null;

        const titleText = title.textContent;
        const match = titleText.match(/(.+) \((.+)\)/);
        
        if (match) {
            const transform = nodeGroup.getAttribute('transform');
            const transformMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            
            return {
                id: nodeId,
                name: match[1],
                type: match[2],
                x: transformMatch ? parseFloat(transformMatch[1]) : 0,
                y: transformMatch ? parseFloat(transformMatch[2]) : 0,
                description: ''
            };
        }

        return null;
    }

    /**
     * Get link data from DOM
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
                weight: parseInt(match[3]),
                type: 'solid'
            };
        }

        return null;
    }

    /**
     * Set tooltip delays
     */
    setDelays(showDelay, hideDelay) {
        this.showDelay = showDelay;
        this.hideDelay = hideDelay;
    }

    /**
     * Update tooltip styles
     */
    updateTooltipStyles(styles) {
        if (!this.tooltipElement) return;

        Object.entries(styles).forEach(([property, value]) => {
            this.tooltipElement.style[property] = value;
        });
    }

    /**
     * Check if tooltip is active
     */
    isTooltipActive() {
        return this.activeTooltip !== null;
    }

    /**
     * Get active tooltip data
     */
    getActiveTooltip() {
        return this.activeTooltip;
    }

    /**
     * Force hide tooltip
     */
    forceHideTooltip() {
        this.clearTimeouts();
        this.hideTooltip();
    }

    /**
     * Destroy the tooltip manager
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.TOOLTIP_SHOWN, this.handleTooltipShown.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.TOOLTIP_HIDDEN, this.handleTooltipHidden.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_SELECTED, this.handleNodeSelected.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_SELECTED, this.handleLinkSelected.bind(this));

        this.clearTimeouts();
        
        if (this.tooltipElement) {
            DOMHelper.removeElement(this.tooltipElement);
            this.tooltipElement = null;
        }

        this.isInitialized = false;
    }
} 