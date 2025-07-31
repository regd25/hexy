/**
 * Centralized event type definitions
 * Ensures consistency across the application
 */
export const EVENT_TYPES = {
    // Graph Events
    NODE_CREATED: 'node:created',
    NODE_UPDATED: 'node:updated',
    NODE_DELETED: 'node:deleted',
    NODE_SELECTED: 'node:selected',
    NODE_DRAGGED: 'node:dragged',
    NODE_DOUBLE_CLICKED: 'node:double_clicked',
    NODE_RIGHT_CLICKED: 'node:right_clicked',
    NODE_EDIT_REQUESTED: 'node:edit:requested',
    NODE_DUPLICATE_REQUESTED: 'node:duplicate:requested',
    NODE_CONNECT_REQUESTED: 'node:connect:requested',
    NODE_HIGHLIGHT_REQUESTED: 'node:highlight:requested',
    NODE_EXPORT_REQUESTED: 'node:export:requested',
    NODE_DELETE_REQUESTED: 'node:delete:requested',
    NODE_CREATE_REQUESTED: 'node:create:requested',

    // Link Events
    LINK_CREATED: 'link:created',
    LINK_DELETED: 'link:deleted',
    LINK_SELECTED: 'link:selected',
    LINK_RIGHT_CLICKED: 'link:right_clicked',
    LINK_EDIT_REQUESTED: 'link:edit:requested',
    LINK_HIGHLIGHT_REQUESTED: 'link:highlight:requested',
    LINK_DELETE_REQUESTED: 'link:delete:requested',
    LINK_WEIGHT_CHANGED: 'link:weight:changed',

    // Canvas Events
    CANVAS_CLICKED: 'canvas:clicked',
    CANVAS_DOUBLE_CLICKED: 'canvas:double_clicked',
    CANVAS_DRAGGED: 'canvas:dragged',
    CANVAS_ZOOMED: 'canvas:zoomed',
    CANVAS_RIGHT_CLICKED: 'canvas:right_clicked',

    // UI Events
    SEARCH_CHANGED: 'search:changed',
    FILTER_CHANGED: 'filter:changed',
    MODAL_OPENED: 'modal:opened',
    MODAL_CLOSED: 'modal:closed',
    TOOLTIP_SHOWN: 'tooltip:shown',
    TOOLTIP_HIDDEN: 'tooltip:hidden',

    // Data Events
    DATA_EXPORTED: 'data:exported',
    DATA_IMPORTED: 'data:imported',
    CONFIG_CHANGED: 'config:changed',

    GRAPH_UPDATED: 'graph:updated',
    EXPORT_REQUESTED: 'export:requested',
    IMPORT_REQUESTED: 'import:requested',
    CLEAR_REQUESTED: 'clear:requested',

    // Menu Events
    MENU_ACTION_TRIGGERED: 'menu:action:triggered',
    MENU_ACTION_EXECUTED: 'menu:action:executed',

    // Navigation Events
    SELECT_ALL_REQUESTED: 'select:all:requested',
    DESELECT_ALL_REQUESTED: 'deselect:all:requested',
    ZOOM_FIT_REQUESTED: 'zoom:fit:requested',
    RESET_VIEW_REQUESTED: 'reset:view:requested',
    PASTE_REQUESTED: 'paste:requested',

    // Semantic Events
    SEMANTIC_RELATION_CREATED: 'semantic:relation:created',
    SEMANTIC_VALIDATION_REQUESTED: 'semantic:validation:requested',

    // System Events
    ERROR_OCCURRED: 'error:occurred',
    WARNING_SHOWN: 'warning:shown',
    INFO_SHOWN: 'info:shown',
    SUCCESS_SHOWN: 'success:shown',

    // Application Events
    APP_STARTED: 'app:started',
    APP_DESTROYED: 'app:destroyed',
    APP_READY: 'app:ready',
    COMPONENT_INITIALIZED: 'component:initialized',
    COMPONENT_DESTROYED: 'component:destroyed',

    // Container Events
    GRAPH_CONTAINER_INITIALIZED: 'graph:container:initialized',
    NAVIGATOR_INITIALIZED: 'navigator:initialized',
    NAVBAR_INITIALIZED: 'navbar:initialized',
    MENU_MANAGER_INITIALIZED: 'menu:manager:initialized',

    // Logo Events
    LOGO_CLICKED: 'logo:clicked',

    // Settings Events
    SETTINGS_UPDATED: 'settings:updated',

    // Metrics Events
    METRICS_REQUESTED: 'metrics:requested',
}; 