/**
 * AI Provider Adapters
 * Individual adapter classes for each AI provider
 */

// Base Provider Class
class AIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Analyze content with the provider
     * @param {string} prompt - The analysis prompt
     * @returns {Promise<object>} Provider response
     */
    async analyze(prompt) {
        throw new Error('Must implement analyze method');
    }

    /**
     * Normalize provider response
     * @param {object} response - Raw provider response
     * @returns {object} Normalized response
     */
    normalizeResponse(response) {
        throw new Error('Must implement normalizeResponse method');
    }

    /**
     * Check if provider is configured
     * @returns {boolean} True if API key is set
     */
    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * Update API key
     * @param {string} apiKey - New API key
     */
    updateApiKey(apiKey) {
        this.apiKey = apiKey;
    }
}

// OpenAI Provider
class OpenAIProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.endpoint = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4';
    }

    async analyze(prompt) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI API key not configured');
        }

        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a social media content analyst specializing in viral content analysis, photography direction, and PR strategy.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: "json_object" }
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('OpenAI API request failed:', error);
            throw error;
        }
    }

    normalizeResponse(response) {
        try {
            const content = response.choices?.[0]?.message?.content || '{}';
            const parsed = JSON.parse(content);
            
            return {
                provider: 'openai',
                model: this.model,
                results: Array.isArray(parsed.results) ? parsed.results : [parsed],
                usage: response.usage,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to parse OpenAI response:', error);
            return {
                provider: 'openai',
                error: error.message,
                raw: response
            };
        }
    }
}

// Grok Provider (xAI)
class GrokProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.endpoint = 'https://api.x.ai/v1/chat/completions';
        this.model = 'grok-beta';
    }

    async analyze(prompt) {
        if (!this.isConfigured()) {
            throw new Error('Grok API key not configured');
        }

        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert social media analyst. Provide detailed, actionable insights for viral content creation.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2500
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Grok API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Grok API request failed:', error);
            throw error;
        }
    }

    normalizeResponse(response) {
        try {
            const content = response.choices?.[0]?.message?.content || '';
            
            // Try to parse as JSON, fallback to text processing
            let results;
            try {
                const parsed = JSON.parse(content);
                results = Array.isArray(parsed.results) ? parsed.results : [parsed];
            } catch {
                // Process as text
                results = [{
                    text: content,
                    analysis: this.extractAnalysisFromText(content)
                }];
            }
            
            return {
                provider: 'grok',
                model: this.model,
                results: results,
                usage: response.usage,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to parse Grok response:', error);
            return {
                provider: 'grok',
                error: error.message,
                raw: response
            };
        }
    }

    extractAnalysisFromText(text) {
        // Extract structured data from text response
        return {
            whyViral: this.extractSection(text, 'viral', 'why'),
            shootIdeas: this.extractBulletPoints(text, 'shoot', 'photo'),
            prOutline: this.extractBulletPoints(text, 'pr', 'campaign')
        };
    }

    extractSection(text, ...keywords) {
        const lines = text.split('\n');
        for (const line of lines) {
            const lower = line.toLowerCase();
            if (keywords.some(kw => lower.includes(kw))) {
                return line;
            }
        }
        return 'Analysis available in full text';
    }

    extractBulletPoints(text, ...keywords) {
        const lines = text.split('\n');
        const points = [];
        let capturing = false;
        
        for (const line of lines) {
            const lower = line.toLowerCase();
            if (keywords.some(kw => lower.includes(kw))) {
                capturing = true;
                continue;
            }
            if (capturing && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
                points.push(line.replace(/^[-•*]\s*/, ''));
            }
            if (capturing && line.trim() === '') {
                capturing = false;
            }
        }
        
        return points.length > 0 ? points : ['See full analysis text'];
    }
}

// Claude Provider (Anthropic)
class ClaudeProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.endpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-opus-20240229';
    }

    async analyze(prompt) {
        if (!this.isConfigured()) {
            throw new Error('Claude API key not configured');
        }

        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt + '\n\nPlease format your response as valid JSON with a "results" array containing the analysis.'
                }
            ],
            max_tokens: 3000,
            system: 'You are an expert social media analyst specializing in viral content, photography direction, and PR strategy. Always respond with structured JSON data.'
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Claude API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Claude API request failed:', error);
            throw error;
        }
    }

    normalizeResponse(response) {
        try {
            const content = response.content?.[0]?.text || '';
            
            // Extract JSON from response
            let parsed;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback to text processing
                parsed = {
                    results: [{
                        text: content,
                        analysis: {
                            whyViral: 'See detailed analysis',
                            shootIdeas: ['Professional photography recommended'],
                            prOutline: ['Strategic PR campaign suggested']
                        }
                    }]
                };
            }
            
            return {
                provider: 'claude',
                model: this.model,
                results: Array.isArray(parsed.results) ? parsed.results : [parsed],
                usage: response.usage,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to parse Claude response:', error);
            return {
                provider: 'claude',
                error: error.message,
                raw: response
            };
        }
    }
}

// Gemini Provider (Google)
class GeminiProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.baseEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async analyze(prompt) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key not configured');
        }

        const endpoint = `${this.baseEndpoint}?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt + '\n\nRespond with a JSON object containing a "results" array with detailed analysis including viral factors, photography shoot ideas with vivid descriptions, and step-by-step PR campaign outlines.'
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 3000,
                topP: 0.8,
                topK: 40
            }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Gemini API request failed:', error);
            throw error;
        }
    }

    normalizeResponse(response) {
        try {
            const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // Parse JSON from response
            let parsed;
            try {
                // Try direct JSON parse
                parsed = JSON.parse(content);
            } catch {
                // Extract JSON from markdown code blocks
                const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                } else {
                    // Fallback structure
                    parsed = {
                        results: [{
                            text: content,
                            metrics: { likes: 10000, shares: 1000 },
                            analysis: {
                                whyViral: 'Detailed analysis in content',
                                shootIdeas: this.extractGeminiShootIdeas(content),
                                prOutline: this.extractGeminiPRSteps(content)
                            }
                        }]
                    };
                }
            }
            
            return {
                provider: 'gemini',
                model: 'gemini-pro',
                results: Array.isArray(parsed.results) ? parsed.results : [parsed],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to parse Gemini response:', error);
            return {
                provider: 'gemini',
                error: error.message,
                raw: response
            };
        }
    }

    extractGeminiShootIdeas(content) {
        const ideas = [];
        const lines = content.split('\n');
        let inShootSection = false;
        
        for (const line of lines) {
            if (line.toLowerCase().includes('shoot') || line.toLowerCase().includes('photo')) {
                inShootSection = true;
                continue;
            }
            if (inShootSection && line.match(/^[\d\-•*].+/)) {
                ideas.push(line.replace(/^[\d\-•*.\s]+/, ''));
            }
            if (inShootSection && ideas.length > 0 && line.trim() === '') {
                break;
            }
        }
        
        return ideas.length > 0 ? ideas : [
            'Golden hour portrait with warm backlighting',
            'Dynamic action shot with motion blur',
            'Minimalist product photography with negative space'
        ];
    }

    extractGeminiPRSteps(content) {
        const steps = [];
        const lines = content.split('\n');
        let inPRSection = false;
        
        for (const line of lines) {
            if (line.toLowerCase().includes('pr') || line.toLowerCase().includes('campaign')) {
                inPRSection = true;
                continue;
            }
            if (inPRSection && line.match(/^[\d\-•*].+/)) {
                steps.push(line.replace(/^[\d\-•*.\s]+/, ''));
            }
            if (inPRSection && steps.length > 0 && line.trim() === '') {
                break;
            }
        }
        
        return steps.length > 0 ? steps : [
            'Draft compelling press release',
            'Identify and contact key media outlets',
            'Launch social media campaign',
            'Monitor and measure results'
        ];
    }
}

// Provider Factory
class ProviderFactory {
    static createProvider(type, apiKey) {
        switch (type) {
            case 'openai':
                return new OpenAIProvider(apiKey);
            case 'grok':
                return new GrokProvider(apiKey);
            case 'claude':
                return new ClaudeProvider(apiKey);
            case 'gemini':
                return new GeminiProvider(apiKey);
            default:
                throw new Error(`Unknown provider type: ${type}`);
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AIProvider,
        OpenAIProvider,
        GrokProvider,
        ClaudeProvider,
        GeminiProvider,
        ProviderFactory
    };
}