import { EVENT_TYPES } from '../events/EventTypes.js';
import Toastify from 'toastify-js';

/**
 * Enhanced notification management using Toastify-js
 * Provides better animations and more reliable notifications
 */
export class NotificationManager {

    /**
     * Constructor
     * @param {import('../events/EventBus.js').EventBus} eventBus - Event bus instance
     */
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.ERROR_OCCURRED, (data) => {
            this.show(data.message, 'error', data.duration);
        });

        this.eventBus.subscribe(EVENT_TYPES.WARNING_SHOWN, (data) => {
            this.show(data.message, 'warning', data.duration);
        });

        this.eventBus.subscribe(EVENT_TYPES.INFO_SHOWN, (data) => {
            this.show(data.message, 'info', data.duration);
        });

        this.eventBus.subscribe(EVENT_TYPES.SUCCESS_SHOWN, (data) => {
            this.show(data.message, 'success', data.duration);
        });
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 for manual close)
     * @returns {Object} Toastify instance
     */
    show(message, type = 'info', duration = 3000) {
        return Toastify({
            text: message,
            duration: duration,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            close: true,
            offset: {
                x: 20,
                y: 20
            },
            style: {
                background: this.getColor(type),
                color: "white",
                fontWeight: "500",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                fontSize: "14px",
                padding: "12px 20px",
                maxWidth: "400px",
                wordWrap: "break-word"
            }
        }).showToast();
    }



    /**
     * Get configuration for notification type
     * @param {string} type - Notification type
     * @param {number} duration - Duration
     * @returns {Object} Configuration object
     */
    getConfig(type, duration) {
        const configs = {
            success: {
                style: {
                    background: "linear-gradient(to right, #059669, #10b981)",
                    color: "white",
                    fontWeight: "500",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    fontSize: "14px",
                    padding: "12px 20px"
                }
            },
            error: {
                style: {
                    background: "linear-gradient(to right, #dc2626, #ef4444)",
                    color: "white",
                    fontWeight: "500",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    fontSize: "14px",
                    padding: "12px 20px"
                }
            },
            warning: {
                style: {
                    background: "linear-gradient(to right, #d97706, #f59e0b)",
                    color: "white",
                    fontWeight: "500",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    fontSize: "14px",
                    padding: "12px 20px"
                }
            },
            info: {
                style: {
                    background: "linear-gradient(to right, #3b82f6, #60a5fa)",
                    color: "white",
                    fontWeight: "500",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    fontSize: "14px",
                    padding: "12px 20px"
                }
            }
        };

        return configs[type] || configs.info;
    }

    /**
     * Show notification with custom style
     * @param {string} message - Notification message
     * @param {Object} customStyle - Custom CSS styles
     * @param {number} duration - Duration in milliseconds
     */
    custom(message, customStyle = {}, duration = 3000) {
        return Toastify({
            text: message,
            duration: duration,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            close: true,
            offset: {
                x: 20,
                y: 20
            },
            style: {
                background: "linear-gradient(to right, #6b7280, #9ca3af)",
                color: "white",
                fontWeight: "500",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                fontSize: "14px",
                padding: "12px 20px",
                ...customStyle
            },
            className: "notification-custom"
        }).showToast();
    }

    /**
     * Show persistent notification (no auto-close)
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    persistent(message, type = 'info') {
        return this.show(message, type, 0);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        // Toastify doesn't have a built-in clear all method
        // We can hide them by clicking the close button programmatically
        const notifications = document.querySelectorAll('.toastify');
        notifications.forEach(notification => {
            const closeButton = notification.querySelector('.toast-close');
            if (closeButton) {
                closeButton.click();
            }
        });
    }

    /**
     * Get color for notification type
     * @param {string} type - Notification type
     * @returns {string} Color value
     */
    getColor(type) {
        const colors = {
            success: "linear-gradient(to right, #059669, #10b981)",
            error: "linear-gradient(to right, #dc2626, #ef4444)",
            warning: "linear-gradient(to right, #d97706, #f59e0b)",
            info: "linear-gradient(to right, #3b82f6, #60a5fa)"
        };
        return colors[type] || colors.info;
    }

    /**
     * Show success notification (alias for show with success type)
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showSuccess(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error notification (alias for show with error type)
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showError(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning notification (alias for show with warning type)
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showWarning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info notification (alias for show with info type)
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showInfo(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Destroy the notification manager
     */
    destroy() {
        this.clearAll();
    }
} 