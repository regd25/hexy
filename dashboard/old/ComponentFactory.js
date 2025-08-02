import { NotificationManager } from './utils/notifications/NotificationManager.js';
import { GraphContainer } from './graph/GraphContainer.js';
import { NavigatorContainer } from './navigator/NavigatorContainer.js';
import { NavbarContainer } from './navbar/NavbarContainer.js';
import { MenuManager } from './menu/MenuManager.js';

/**
 * Factory for creating components with proper dependencies
 * Ensures consistent component initialization
 */
export class ComponentFactory {
    constructor(serviceContainer) {
        this.container = serviceContainer;
    }

    /**
     * Create notification manager
     * @returns {NotificationManager} Notification manager instance
     */
    createNotificationManager() {
        return new NotificationManager(this.container.get('EventBus'));
    }

    /**
     * Create graph container
     * @returns {GraphContainer} Graph container instance
     */
    async createGraphContainer() {
        const eventBus = this.container.get('EventBus');
        const notificationManager = this.container.get('NotificationManager');
        const graphService = await this.container.get('GraphService');
        const configService = await this.container.get('ConfigService');

        return new GraphContainer(eventBus, notificationManager, graphService, configService);
    }

    /**
     * Create navigator container
     * @returns {NavigatorContainer} Navigator container instance
     */
    async createNavigatorContainer() {
        const eventBus = this.container.get('EventBus');
        const notificationManager = this.container.get('NotificationManager');
        const artifactParser = await this.container.get('ArtifactParser');
        const semanticService = await this.container.get('SemanticService');

        return new NavigatorContainer(eventBus, notificationManager, artifactParser, semanticService);
    }

    /**
     * Create navbar container
     * @returns {NavbarContainer} Navbar container instance
     */
    async createNavbarContainer() {
        const eventBus = this.container.get('EventBus');
        const notificationManager = this.container.get('NotificationManager');
        const configService = await this.container.get('ConfigService');
        const editorService = await this.container.get('EditorService');

        return new NavbarContainer(eventBus, notificationManager, configService, editorService);
    }

    /**
     * Create menu manager
     * @returns {MenuManager} Menu manager instance
     */
    createMenuManager() {
        const eventBus = this.container.get('EventBus');
        const notificationManager = this.container.get('NotificationManager');

        return new MenuManager(eventBus, notificationManager);
    }
} 