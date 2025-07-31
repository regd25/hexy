import { EVENT_TYPES } from '../../utils/events/EventTypes.js';
import { DOMHelper } from '../../utils/helpers/DOMHelper.js';

/**
 * Logo component for the navigation bar
 * Follows Single Responsibility Principle for logo management
 */
export class LogoComponent {
    constructor(eventBus, notificationManager) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.isInitialized = false;
        this.logoElement = null;
        this.logoConfig = {
            title: 'Hexy Framework',
            subtitle: 'Semantic Organizational Framework',
            icon: '🧠',
            version: '1.0.0',
            clickable: true,
            showVersion: false
        };
    }

    /**
     * Initialize the logo component
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.createLogoElement();
        this.setupLogoInteractions();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.COMPONENT_INITIALIZED, {
            component: 'LogoComponent',
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for logo interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.LOGO_CLICKED, this.handleLogoClicked.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.APP_STARTED, this.handleAppStarted.bind(this));
    }

    /**
     * Create the logo element
     */
    createLogoElement() {
        this.logoElement = DOMHelper.createElement('div', {
            id: 'logo',
            class: 'logo-component'
        });

        this.renderLogo();
        this.appendToContainer();
    }

    /**
     * Render the logo with current configuration
     */
    renderLogo() {
        if (!this.logoElement) return;

        this.logoElement.innerHTML = `
            <div class="logo-container ${this.logoConfig.clickable ? 'clickable' : ''}">
                <div class="logo-icon">${this.logoConfig.icon}</div>
                <div class="logo-text">
                    <span class="logo-title">${this.logoConfig.title}</span>
                    <span class="logo-subtitle">${this.logoConfig.subtitle}</span>
                    ${this.logoConfig.showVersion ? `<span class="logo-version">v${this.logoConfig.version}</span>` : ''}
                </div>
            </div>
        `;

        this.applyLogoStyles();
    }

    /**
     * Apply styles to the logo
     */
    applyLogoStyles() {
        if (!this.logoElement) return;

        const logoContainer = this.logoElement.querySelector('.logo-container');
        if (logoContainer) {
            logoContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 16px;
                border-radius: 8px;
                transition: all 0.2s ease;
                cursor: ${this.logoConfig.clickable ? 'pointer' : 'default'};
            `;
        }

        const logoIcon = this.logoElement.querySelector('.logo-icon');
        if (logoIcon) {
            logoIcon.style.cssText = `
                font-size: 24px;
                line-height: 1;
            `;
        }

        const logoText = this.logoElement.querySelector('.logo-text');
        if (logoText) {
            logoText.style.cssText = `
                display: flex;
                flex-direction: column;
                line-height: 1.2;
            `;
        }

        const logoTitle = this.logoElement.querySelector('.logo-title');
        if (logoTitle) {
            logoTitle.style.cssText = `
                font-size: 18px;
                font-weight: bold;
                color: #333;
            `;
        }

        const logoSubtitle = this.logoElement.querySelector('.logo-subtitle');
        if (logoSubtitle) {
            logoSubtitle.style.cssText = `
                font-size: 12px;
                color: #666;
            `;
        }

        const logoVersion = this.logoElement.querySelector('.logo-version');
        if (logoVersion) {
            logoVersion.style.cssText = `
                font-size: 10px;
                color: #999;
                margin-top: 2px;
            `;
        }

        if (this.logoConfig.clickable) {
            this.addHoverEffects();
        }
    }

    /**
     * Add hover effects for clickable logo
     */
    addHoverEffects() {
        const logoContainer = this.logoElement.querySelector('.logo-container');
        if (!logoContainer) return;

        logoContainer.addEventListener('mouseenter', () => {
            logoContainer.style.transform = 'scale(1.05)';
            logoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        });

        logoContainer.addEventListener('mouseleave', () => {
            logoContainer.style.transform = 'scale(1)';
            logoContainer.style.backgroundColor = 'transparent';
        });
    }

    /**
     * Append logo to container
     */
    appendToContainer() {
        const navbar = document.querySelector('.navbar') || 
                      document.querySelector('#navbar') || 
                      document.querySelector('header') ||
                      document.body;

        if (navbar && !navbar.querySelector('#logo')) {
            navbar.insertBefore(this.logoElement, navbar.firstChild);
        }
    }

    /**
     * Setup logo interactions
     */
    setupLogoInteractions() {
        if (!this.logoElement || !this.logoConfig.clickable) return;

        const logoContainer = this.logoElement.querySelector('.logo-container');
        if (logoContainer) {
            DOMHelper.addEventListener(logoContainer, 'click', this.handleLogoClick.bind(this));
            DOMHelper.addEventListener(logoContainer, 'keypress', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleLogoClick(event);
                }
            });
        }
    }

    /**
     * Handle logo click
     */
    handleLogoClick(event) {
        event.preventDefault();
        event.stopPropagation();

        this.eventBus.publish(EVENT_TYPES.LOGO_CLICKED, {
            timestamp: Date.now(),
            config: this.logoConfig
        });

        this.showWelcomeMessage();
    }

    /**
     * Handle logo clicked event
     */
    handleLogoClicked(data) {
        this.notificationManager.showInfo('Welcome to Hexy Framework!');
    }

    /**
     * Handle app started event
     */
    handleAppStarted(data) {
        this.updateLogoState('active');
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const messages = [
            'Welcome to Hexy Framework! 🧠',
            'Ready to model your organization?',
            'Start creating semantic artifacts!',
            'Build your organizational knowledge graph!'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.notificationManager.showInfo(randomMessage);
    }

    /**
     * Update logo configuration
     */
    updateLogoConfig(config) {
        this.logoConfig = { ...this.logoConfig, ...config };
        this.renderLogo();
    }

    /**
     * Update logo state
     */
    updateLogoState(state) {
        const logoContainer = this.logoElement?.querySelector('.logo-container');
        if (!logoContainer) return;

        logoContainer.className = `logo-container ${this.logoConfig.clickable ? 'clickable' : ''} ${state}`;
    }

    /**
     * Set logo title
     */
    setTitle(title) {
        this.logoConfig.title = title;
        this.renderLogo();
    }

    /**
     * Set logo subtitle
     */
    setSubtitle(subtitle) {
        this.logoConfig.subtitle = subtitle;
        this.renderLogo();
    }

    /**
     * Set logo icon
     */
    setIcon(icon) {
        this.logoConfig.icon = icon;
        this.renderLogo();
    }

    /**
     * Set logo version
     */
    setVersion(version) {
        this.logoConfig.version = version;
        this.renderLogo();
    }

    /**
     * Show/hide version
     */
    setShowVersion(show) {
        this.logoConfig.showVersion = show;
        this.renderLogo();
    }

    /**
     * Set clickable state
     */
    setClickable(clickable) {
        this.logoConfig.clickable = clickable;
        this.renderLogo();
        this.setupLogoInteractions();
    }

    /**
     * Get logo element
     */
    getLogoElement() {
        return this.logoElement;
    }

    /**
     * Get logo configuration
     */
    getLogoConfig() {
        return { ...this.logoConfig };
    }

    /**
     * Check if logo is initialized
     */
    isLogoInitialized() {
        return this.isInitialized && this.logoElement !== null;
    }

    /**
     * Animate logo
     */
    animateLogo(animationType = 'pulse') {
        const logoContainer = this.logoElement?.querySelector('.logo-container');
        if (!logoContainer) return;

        const animations = {
            pulse: 'logo-pulse 0.6s ease-in-out',
            bounce: 'logo-bounce 0.6s ease-in-out',
            shake: 'logo-shake 0.6s ease-in-out',
            rotate: 'logo-rotate 0.6s ease-in-out'
        };

        const animation = animations[animationType];
        if (animation) {
            logoContainer.style.animation = animation;
            setTimeout(() => {
                logoContainer.style.animation = '';
            }, 600);
        }
    }

    /**
     * Add custom CSS animations
     */
    addLogoAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes logo-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            @keyframes logo-bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            @keyframes logo-shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            @keyframes logo-rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Destroy the logo component
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.LOGO_CLICKED, this.handleLogoClicked.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.APP_STARTED, this.handleAppStarted.bind(this));

        if (this.logoElement) {
            DOMHelper.removeElement(this.logoElement);
            this.logoElement = null;
        }

        this.isInitialized = false;
    }
} 