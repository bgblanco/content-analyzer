/**
 * API Router Module
 * Routes requests to selected AI provider
 */

class APIRouter {
    constructor() {
        this.providers = {};
        this.activeProvider = null;
        this.initializeProviders();
    }

    /**
     * Initialize provider instances
     */
    initializeProviders() {
        // Providers will be registered dynamically
        // This allows for lazy loading of provider modules
    }

    /**
     * Register a provider
     * @param {string} name - Provider name
     * @param {object} provider - Provider instance
     */
    registerProvider(name, provider) {
        this.providers[name] = provider;
    }

    /**
     * Set active provider
     * @param {string} name - Provider name
     */
    setActiveProvider(name) {
        if (!this.providers[name]) {
            throw new Error(`Provider ${name} not registered`);
        }
        this.activeProvider = name;
    }

    /**
     * Analyze content using active provider
     * @param {object} params - Analysis parameters
     * @returns {Promise<object>} Analysis results
     */
    async analyze(params) {
        if (!this.activeProvider) {
            throw new Error('No active provider selected');
        }

        const provider = this.providers[this.activeProvider];
        if (!provider) {
            throw new Error(`Provider ${this.activeProvider} not available`);
        }

        try {
            // Build prompt based on parameters
            const prompt = this.buildPrompt(params);
            
            // Route to provider
            const response = await provider.analyze(prompt);
            
            // Normalize response
            return this.normalizeResponse(response, this.activeProvider);
        } catch (error) {
            console.error(`Provider ${this.activeProvider} failed:`, error);
            
            // Try fallback providers
            return await this.tryFallback(params, this.activeProvider);
        }
    }

    /**
     * Build analysis prompt
     * @param {object} params - Analysis parameters
     * @returns {string} Formatted prompt
     */
    buildPrompt(params) {
        const { niche, platform, filters } = params;
        
        let prompt = `Analyze viral social media content for the ${niche} industry.\n\n`;
        
        if (platform && platform !== 'demo') {
            prompt += `Platform: ${platform}\n`;
        }
        
        if (filters) {
            if (filters.minLikes) prompt += `Minimum likes: ${filters.minLikes}\n`;
            if (filters.timeRange) prompt += `Time range: ${filters.timeRange}\n`;
            if (filters.contentType) prompt += `Content type: ${filters.contentType}\n`;
        }
        
        prompt += `\nProvide the following for each viral post:\n`;
        prompt += `1. Post content and metrics\n`;
        prompt += `2. Why it went viral (specific factors)\n`;
        prompt += `3. Photography shoot ideas with vivid descriptions including:\n`;
        prompt += `   - Lighting conditions (e.g., golden hour, studio setup)\n`;
        prompt += `   - Camera angles (e.g., low angle, bird's eye view)\n`;
        prompt += `   - Composition (e.g., rule of thirds, leading lines)\n`;
        prompt += `   - Props and styling\n`;
        prompt += `   - Reference examples\n`;
        prompt += `4. Step-by-step PR campaign outline including:\n`;
        prompt += `   - Day-by-day action items\n`;
        prompt += `   - Specific media targets with handles\n`;
        prompt += `   - Template drafts\n`;
        prompt += `   - Success metrics\n`;
        prompt += `\nFormat the response as JSON with clear structure.`;
        
        return prompt;
    }

    /**
     * Normalize provider response
     * @param {object} response - Raw provider response
     * @param {string} provider - Provider name
     * @returns {object} Normalized response
     */
    normalizeResponse(response, provider) {
        // Each provider returns data differently
        // Normalize to common format
        
        let normalized = {
            provider: provider,
            results: [],
            timestamp: new Date().toISOString()
        };
        
        try {
            // Extract content based on provider format
            let content = '';
            
            switch (provider) {
                case 'openai':
                    content = response.choices?.[0]?.message?.content || '';
                    break;
                case 'grok':
                    content = response.choices?.[0]?.message?.content || '';
                    break;
                case 'claude':
                    content = response.content?.[0]?.text || '';
                    break;
                case 'gemini':
                    content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    break;
                default:
                    content = JSON.stringify(response);
            }
            
            // Parse JSON if possible
            try {
                const parsed = JSON.parse(content);
                normalized.results = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                // If not JSON, create structured response
                normalized.results = [{
                    text: content,
                    metrics: { likes: 0, shares: 0 },
                    analysis: {
                        whyViral: 'Analysis pending',
                        shootIdeas: [],
                        prOutline: []
                    }
                }];
            }
        } catch (error) {
            console.error('Failed to normalize response:', error);
            normalized.error = error.message;
        }
        
        return normalized;
    }

    /**
     * Try fallback providers
     * @param {object} params - Analysis parameters
     * @param {string} failedProvider - Provider that failed
     * @returns {Promise<object>} Analysis results
     */
    async tryFallback(params, failedProvider) {
        const fallbackOrder = ['openai', 'grok', 'claude', 'gemini'].filter(
            p => p !== failedProvider && this.providers[p]
        );
        
        for (const provider of fallbackOrder) {
            try {
                console.log(`Trying fallback provider: ${provider}`);
                this.activeProvider = provider;
                const prompt = this.buildPrompt(params);
                const response = await this.providers[provider].analyze(prompt);
                return this.normalizeResponse(response, provider);
            } catch (error) {
                console.error(`Fallback provider ${provider} also failed:`, error);
                continue;
            }
        }
        
        throw new Error('All providers failed. Please check your API configurations.');
    }

    /**
     * Test provider connectivity
     * @param {string} provider - Provider name
     * @returns {Promise<boolean>} True if provider is working
     */
    async testProvider(provider) {
        if (!this.providers[provider]) {
            return false;
        }
        
        try {
            const testPrompt = 'Test connectivity. Respond with "OK"';
            const response = await this.providers[provider].analyze(testPrompt);
            return response !== null;
        } catch {
            return false;
        }
    }

    /**
     * Get provider status
     * @returns {object} Status of all providers
     */
    getProviderStatus() {
        const status = {};
        
        for (const name in this.providers) {
            status[name] = {
                registered: true,
                active: name === this.activeProvider,
                configured: this.providers[name].isConfigured()
            };
        }
        
        return status;
    }

    /**
     * Route to specific provider endpoint
     * @param {string} provider - Provider name
     * @param {string} prompt - The prompt to send
     * @param {string} apiKey - API key for authentication
     * @returns {Promise<object>} Provider response
     */
    async routeToProvider(provider, prompt, apiKey) {
        const endpoints = {
            openai: 'https://api.openai.com/v1/chat/completions',
            grok: 'https://api.x.ai/v1/chat/completions',
            claude: 'https://api.anthropic.com/v1/messages',
            gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        };

        const endpoint = endpoints[provider];
        if (!endpoint) {
            throw new Error(`Unknown provider: ${provider}`);
        }

        // Build request based on provider
        let requestBody, headers;

        switch (provider) {
            case 'openai':
            case 'grok':
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    model: provider === 'openai' ? 'gpt-4' : 'grok-beta',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 2000
                };
                break;

            case 'claude':
                headers = {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    model: 'claude-3-opus-20240229',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000
                };
                break;

            case 'gemini':
                // Gemini uses API key in URL
                const geminiEndpoint = `${endpoint}?key=${apiKey}`;
                headers = {
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                };
                endpoint = geminiEndpoint;
                break;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Provider ${provider} request failed:`, error);
            throw error;
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIRouter;
}