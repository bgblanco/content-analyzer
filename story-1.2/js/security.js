/**
 * Security Module for API Key Management
 * Provides base64 encoding with salt for API key storage
 */

class SecureStorage {
    constructor() {
        // Generate or retrieve persistent salt
        this.salt = this.getOrCreateSalt();
    }

    /**
     * Get existing salt or create a new one
     */
    getOrCreateSalt() {
        let salt = localStorage.getItem('_app_salt');
        if (!salt) {
            salt = this.generateSalt();
            localStorage.setItem('_app_salt', salt);
        }
        return salt;
    }

    /**
     * Generate a random salt string
     */
    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Save an API key securely
     * @param {string} provider - The API provider name
     * @param {string} key - The API key to store
     */
    saveKey(provider, key) {
        if (!key) {
            this.removeKey(provider);
            return;
        }
        
        const encoded = this.encode(key);
        localStorage.setItem(`api_${provider}_secure`, encoded);
    }

    /**
     * Retrieve an API key
     * @param {string} provider - The API provider name
     * @returns {string|null} The decoded API key or null if not found
     */
    getKey(provider) {
        const encoded = localStorage.getItem(`api_${provider}_secure`);
        if (!encoded) {
            // Check for legacy storage
            const legacy = localStorage.getItem(`${provider}ApiKey`);
            if (legacy) {
                // Migrate to secure storage
                this.saveKey(provider, legacy);
                localStorage.removeItem(`${provider}ApiKey`);
                return legacy;
            }
            return null;
        }
        
        try {
            return this.decode(encoded);
        } catch (error) {
            console.error(`Failed to decode key for ${provider}:`, error);
            return null;
        }
    }

    /**
     * Remove an API key
     * @param {string} provider - The API provider name
     */
    removeKey(provider) {
        localStorage.removeItem(`api_${provider}_secure`);
        // Also remove legacy key if exists
        localStorage.removeItem(`${provider}ApiKey`);
    }

    /**
     * Encode data with salt
     * @param {string} data - The data to encode
     * @returns {string} Base64 encoded string
     */
    encode(data) {
        // Combine salt with data
        const salted = this.salt + data;
        // Convert to base64
        return btoa(salted);
    }

    /**
     * Decode data and remove salt
     * @param {string} encoded - The encoded string
     * @returns {string} The original data
     */
    decode(encoded) {
        // Decode from base64
        const decoded = atob(encoded);
        // Remove salt
        return decoded.substring(this.salt.length);
    }

    /**
     * Check if a provider has a configured key
     * @param {string} provider - The API provider name
     * @returns {boolean} True if key exists
     */
    hasKey(provider) {
        return this.getKey(provider) !== null;
    }

    /**
     * Get all configured providers
     * @returns {string[]} Array of provider names with configured keys
     */
    getConfiguredProviders() {
        const providers = ['openai', 'grok', 'claude', 'gemini'];
        return providers.filter(provider => this.hasKey(provider));
    }

    /**
     * Clear all stored API keys
     * @param {boolean} confirmClear - Safety flag to prevent accidental clearing
     */
    clearAllKeys(confirmClear = false) {
        if (!confirmClear) {
            console.warn('clearAllKeys called without confirmation');
            return false;
        }
        
        const providers = ['openai', 'grok', 'claude', 'gemini'];
        providers.forEach(provider => this.removeKey(provider));
        return true;
    }

    /**
     * Validate API key format
     * @param {string} provider - The API provider name
     * @param {string} key - The API key to validate
     * @returns {boolean} True if key format is valid
     */
    validateKeyFormat(provider, key) {
        const patterns = {
            openai: /^sk-[a-zA-Z0-9]{48}$/,
            grok: /^xai-[a-zA-Z0-9]{48}$/,
            claude: /^sk-ant-[a-zA-Z0-9]{48}$/,
            gemini: /^AIza[a-zA-Z0-9\-_]{35}$/
        };
        
        const pattern = patterns[provider];
        if (!pattern) {
            console.warn(`No validation pattern for provider: ${provider}`);
            return true; // Allow unknown providers
        }
        
        return pattern.test(key);
    }

    /**
     * Export configuration (without sensitive data)
     * @returns {object} Configuration object
     */
    exportConfig() {
        const providers = ['openai', 'grok', 'claude', 'gemini'];
        const config = {
            configured: {},
            activeProvider: localStorage.getItem('activeProvider') || 'grok'
        };
        
        providers.forEach(provider => {
            config.configured[provider] = this.hasKey(provider);
        });
        
        return config;
    }

    /**
     * Get obfuscated key for display (shows only first and last few characters)
     * @param {string} provider - The API provider name
     * @returns {string|null} Obfuscated key or null
     */
    getObfuscatedKey(provider) {
        const key = this.getKey(provider);
        if (!key) return null;
        
        if (key.length <= 8) {
            return '*'.repeat(key.length);
        }
        
        const start = key.substring(0, 4);
        const end = key.substring(key.length - 4);
        const middle = '*'.repeat(Math.min(20, key.length - 8));
        
        return `${start}${middle}${end}`;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorage;
}