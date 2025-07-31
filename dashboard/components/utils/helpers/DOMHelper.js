/**
 * DOM helper utility for common DOM operations
 * Follows Single Responsibility Principle for DOM manipulation
 */
export class DOMHelper {
    /**
     * Create SVG element with namespace
     */
    static createSVGElement(tagName, attributes = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    /**
     * Create HTML element with attributes
     */
    static createElement(tagName, attributes = {}, innerHTML = '') {
        const element = document.createElement(tagName);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        if (innerHTML) {
            element.innerHTML = innerHTML;
        }
        return element;
    }

    /**
     * Get element by ID with error handling
     */
    static getElementById(id, context = document) {
        const element = context.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    }

    /**
     * Get element by selector with error handling
     */
    static querySelector(selector, context = document) {
        const element = context.querySelector(selector);
        if (!element) {
            console.warn(`Element with selector '${selector}' not found`);
        }
        return element;
    }

    /**
     * Get all elements by selector
     */
    static querySelectorAll(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    }

    /**
     * Add event listener with error handling
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element) {
            console.warn('Cannot add event listener to null element');
            return;
        }
        element.addEventListener(event, handler, options);
    }

    /**
     * Remove event listener
     */
    static removeEventListener(element, event, handler, options = {}) {
        if (!element) {
            console.warn('Cannot remove event listener from null element');
            return;
        }
        element.removeEventListener(event, handler, options);
    }

    /**
     * Set element attributes
     */
    static setAttributes(element, attributes = {}) {
        if (!element) {
            console.warn('Cannot set attributes on null element');
            return;
        }
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    /**
     * Get element attributes
     */
    static getAttributes(element, attributes = []) {
        if (!element) {
            console.warn('Cannot get attributes from null element');
            return {};
        }
        const result = {};
        attributes.forEach(attr => {
            result[attr] = element.getAttribute(attr);
        });
        return result;
    }

    /**
     * Add CSS classes to element
     */
    static addClasses(element, ...classes) {
        if (!element) {
            console.warn('Cannot add classes to null element');
            return;
        }
        element.classList.add(...classes);
    }

    /**
     * Remove CSS classes from element
     */
    static removeClasses(element, ...classes) {
        if (!element) {
            console.warn('Cannot remove classes from null element');
            return;
        }
        element.classList.remove(...classes);
    }

    /**
     * Toggle CSS class on element
     */
    static toggleClass(element, className, force = null) {
        if (!element) {
            console.warn('Cannot toggle class on null element');
            return;
        }
        element.classList.toggle(className, force);
    }

    /**
     * Check if element has class
     */
    static hasClass(element, className) {
        if (!element) {
            return false;
        }
        return element.classList.contains(className);
    }

    /**
     * Set element style properties
     */
    static setStyles(element, styles = {}) {
        if (!element) {
            console.warn('Cannot set styles on null element');
            return;
        }
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }

    /**
     * Get element position relative to viewport
     */
    static getElementPosition(element) {
        if (!element) {
            return { x: 0, y: 0 };
        }
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Check if element is visible
     */
    static isElementVisible(element) {
        if (!element) {
            return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /**
     * Scroll element into view
     */
    static scrollIntoView(element, options = {}) {
        if (!element) {
            console.warn('Cannot scroll null element into view');
            return;
        }
        element.scrollIntoView(options);
    }

    /**
     * Create and append child element
     */
    static appendChild(parent, child) {
        if (!parent || !child) {
            console.warn('Cannot append null element');
            return;
        }
        parent.appendChild(child);
    }

    /**
     * Remove element from parent
     */
    static removeElement(element) {
        if (!element) {
            console.warn('Cannot remove null element');
            return;
        }
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Replace element with new element
     */
    static replaceElement(oldElement, newElement) {
        if (!oldElement || !newElement) {
            console.warn('Cannot replace null element');
            return;
        }
        if (oldElement.parentNode) {
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }
    }

    /**
     * Insert element before reference element
     */
    static insertBefore(newElement, referenceElement) {
        if (!newElement || !referenceElement) {
            console.warn('Cannot insert null element');
            return;
        }
        if (referenceElement.parentNode) {
            referenceElement.parentNode.insertBefore(newElement, referenceElement);
        }
    }

    /**
     * Insert element after reference element
     */
    static insertAfter(newElement, referenceElement) {
        if (!newElement || !referenceElement) {
            console.warn('Cannot insert null element');
            return;
        }
        if (referenceElement.parentNode) {
            const nextSibling = referenceElement.nextSibling;
            if (nextSibling) {
                referenceElement.parentNode.insertBefore(newElement, nextSibling);
            } else {
                referenceElement.parentNode.appendChild(newElement);
            }
        }
    }

    /**
     * Debounce function execution
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function execution
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate unique ID
     */
    static generateId(prefix = 'element') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Escape HTML string
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Unescape HTML string
     */
    static unescapeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    }
} 