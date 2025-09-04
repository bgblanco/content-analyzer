/**
 * Response Enhancement Engine
 * Enhances AI responses with detailed shoot descriptions and PR outlines
 */

class ResponseEnhancer {
    constructor() {
        this.shootTemplates = this.loadShootTemplates();
        this.prTemplates = this.loadPRTemplates();
    }

    /**
     * Load photography shoot templates
     */
    loadShootTemplates() {
        return {
            lighting: [
                'Golden hour with warm backlighting creating a halo effect',
                'Soft natural light through sheer curtains for ethereal mood',
                'Dramatic side lighting with deep shadows for contrast',
                'Studio setup with key light at 45° and fill light for balance',
                'Blue hour twilight with ambient city lights',
                'High-key lighting for bright, airy feel',
                'Low-key lighting for moody, dramatic atmosphere'
            ],
            angles: [
                'Low angle shot from ground level for heroic perspective',
                'Bird\'s eye view from directly above for unique composition',
                'Dutch angle (tilted) for dynamic energy',
                'Eye-level for natural, relatable perspective',
                'Over-the-shoulder for intimate viewpoint',
                'Worm\'s eye view looking up through elements',
                'Profile shot at 90° for dramatic silhouette'
            ],
            composition: [
                'Rule of thirds with subject at intersection points',
                'Leading lines drawing eye to focal point',
                'Frame within frame using natural elements',
                'Negative space for minimalist impact',
                'Symmetrical balance for harmony',
                'Golden spiral for natural flow',
                'Depth layers with foreground, middle, background'
            ],
            equipment: [
                '85mm lens for flattering portrait compression',
                '24mm wide angle for environmental context',
                '50mm for natural perspective',
                'Reflector to fill shadows',
                'Diffuser for soft light',
                'Tripod for stability',
                'ND filter for motion blur in daylight'
            ]
        };
    }

    /**
     * Load PR campaign templates
     */
    loadPRTemplates() {
        return {
            pressRelease: `
FOR IMMEDIATE RELEASE

[HEADLINE]

[CITY, Date] - [Lead paragraph with who, what, where, when, why]

[Body paragraph 1 - Expand on the news]

[Body paragraph 2 - Include quote from key person]

[Body paragraph 3 - Additional details and context]

About [Company Name]
[Company boilerplate]

Contact:
[Name]
[Title]
[Email]
[Phone]
            `,
            outreachEmail: `
Subject: [Compelling subject line]

Hi [Name],

I noticed you recently covered [relevant topic] and thought you might be interested in [your news].

[Brief pitch - 2-3 sentences]

Key points:
• [Point 1]
• [Point 2]
• [Point 3]

Would you like more information or high-res images?

Best regards,
[Your name]
            `,
            socialPost: `
🚀 [Attention-grabbing opener]

[Main message - 1-2 sentences]

✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

[Call to action]

#[Hashtag1] #[Hashtag2] #[Hashtag3]
            `
        };
    }

    /**
     * Enhance basic response with detailed descriptions
     * @param {object} basicResponse - Basic AI response
     * @returns {object} Enhanced response
     */
    enhanceResponse(basicResponse) {
        if (!basicResponse || !basicResponse.results) {
            return basicResponse;
        }

        const enhanced = {
            ...basicResponse,
            results: basicResponse.results.map(result => this.enhanceResult(result))
        };

        return enhanced;
    }

    /**
     * Enhance individual result
     * @param {object} result - Single result item
     * @returns {object} Enhanced result
     */
    enhanceResult(result) {
        return {
            ...result,
            analysis: {
                ...result.analysis,
                shootIdeas: this.enhanceShootDescriptions(result.analysis?.shootIdeas || []),
                prOutline: this.enhancePROutline(result.analysis?.prOutline || [])
            },
            enhanced: true,
            enhancedAt: new Date().toISOString()
        };
    }

    /**
     * Enhance shoot descriptions with vivid details
     * @param {array} basicIdeas - Basic shoot ideas
     * @returns {array} Enhanced shoot ideas
     */
    enhanceShootDescriptions(basicIdeas) {
        const enhanced = [];
        
        // If we have basic ideas, enhance them
        if (basicIdeas.length > 0) {
            basicIdeas.forEach(idea => {
                enhanced.push(this.createDetailedShootDescription(idea));
            });
        } else {
            // Generate default enhanced ideas
            enhanced.push(...this.generateDefaultShootIdeas());
        }

        return enhanced;
    }

    /**
     * Create detailed shoot description
     * @param {string} basicIdea - Basic idea text
     * @returns {object} Detailed shoot description
     */
    createDetailedShootDescription(basicIdea) {
        const lighting = this.selectRandom(this.shootTemplates.lighting);
        const angle = this.selectRandom(this.shootTemplates.angles);
        const composition = this.selectRandom(this.shootTemplates.composition);
        const equipment = this.selectRandom(this.shootTemplates.equipment, 2);

        return {
            title: this.extractTitle(basicIdea),
            description: `${basicIdea}. Shot with ${lighting}. Camera positioned at ${angle}. Composed using ${composition}.`,
            technical: {
                lighting: lighting,
                angle: angle,
                composition: composition,
                equipment: equipment,
                settings: this.generateCameraSettings()
            },
            references: [
                `https://pinterest.com/search/pins/?q=${encodeURIComponent(basicIdea)}`,
                `https://unsplash.com/s/photos/${encodeURIComponent(this.extractKeyword(basicIdea))}`
            ],
            tips: [
                'Scout location during similar time/weather conditions',
                'Bring backup equipment and batteries',
                'Take test shots to dial in settings',
                'Capture multiple variations of each setup'
            ]
        };
    }

    /**
     * Generate default shoot ideas
     * @returns {array} Default shoot ideas
     */
    generateDefaultShootIdeas() {
        return [
            this.createDetailedShootDescription('Hero product shot with lifestyle context'),
            this.createDetailedShootDescription('Behind-the-scenes documentary style'),
            this.createDetailedShootDescription('User testimonial with authentic emotion')
        ];
    }

    /**
     * Generate camera settings
     * @returns {object} Camera settings
     */
    generateCameraSettings() {
        return {
            aperture: `f/${this.selectRandom(['1.4', '2.8', '4', '5.6', '8'])}`,
            shutterSpeed: `1/${this.selectRandom(['60', '125', '250', '500', '1000'])}`,
            iso: this.selectRandom(['100', '200', '400', '800']),
            whiteBalance: this.selectRandom(['Daylight', 'Cloudy', 'Shade', 'Custom'])
        };
    }

    /**
     * Enhance PR outline with detailed steps
     * @param {array} basicOutline - Basic PR steps
     * @returns {array} Enhanced PR outline
     */
    enhancePROutline(basicOutline) {
        const enhanced = [];
        
        if (basicOutline.length > 0) {
            basicOutline.forEach((step, index) => {
                enhanced.push(this.createDetailedPRStep(step, index + 1));
            });
        } else {
            // Generate default PR campaign
            enhanced.push(...this.generateDefaultPRCampaign());
        }

        return enhanced;
    }

    /**
     * Create detailed PR step
     * @param {string} basicStep - Basic step description
     * @param {number} order - Step order
     * @returns {object} Detailed PR step
     */
    createDetailedPRStep(basicStep, order) {
        const timeline = this.getTimelineForStep(order);
        
        return {
            step: order,
            title: this.extractTitle(basicStep),
            description: basicStep,
            timeline: timeline,
            actions: this.generateActionsForStep(basicStep),
            targets: this.generateTargetsForStep(basicStep),
            templates: this.getTemplatesForStep(basicStep),
            metrics: this.generateMetricsForStep(basicStep)
        };
    }

    /**
     * Generate default PR campaign
     * @returns {array} Default PR campaign steps
     */
    generateDefaultPRCampaign() {
        return [
            {
                step: 1,
                title: 'Draft Press Release',
                description: 'Create compelling press release with key messages',
                timeline: 'Day 1-2',
                actions: [
                    'Write headline and lead paragraph',
                    'Include 2-3 key quotes',
                    'Add company boilerplate',
                    'Prepare high-res images'
                ],
                targets: ['Press release distribution services', 'Company blog'],
                templates: [this.prTemplates.pressRelease],
                metrics: ['Press release views', 'Media pickups']
            },
            {
                step: 2,
                title: 'Media Outreach',
                description: 'Contact relevant journalists and influencers',
                timeline: 'Day 3-5',
                actions: [
                    'Research relevant media contacts',
                    'Personalize pitch emails',
                    'Send initial outreach',
                    'Schedule follow-ups'
                ],
                targets: [
                    '@techcrunch',
                    '@forbes',
                    '@businessinsider',
                    'Industry-specific publications'
                ],
                templates: [this.prTemplates.outreachEmail],
                metrics: ['Email open rate', 'Response rate', 'Meeting scheduled']
            },
            {
                step: 3,
                title: 'Social Media Campaign',
                description: 'Launch coordinated social media push',
                timeline: 'Day 6-14',
                actions: [
                    'Create content calendar',
                    'Design visual assets',
                    'Schedule posts across platforms',
                    'Engage with responses'
                ],
                targets: [
                    'Twitter/X',
                    'LinkedIn',
                    'Instagram',
                    'Facebook'
                ],
                templates: [this.prTemplates.socialPost],
                metrics: ['Reach', 'Engagement rate', 'Click-through rate']
            },
            {
                step: 4,
                title: 'Monitor and Measure',
                description: 'Track results and optimize',
                timeline: 'Day 15-30',
                actions: [
                    'Monitor media mentions',
                    'Track website traffic',
                    'Analyze social metrics',
                    'Prepare campaign report'
                ],
                targets: ['Google Analytics', 'Social media analytics', 'Media monitoring tools'],
                templates: [],
                metrics: ['Total reach', 'Media value', 'Lead generation', 'ROI']
            }
        ];
    }

    /**
     * Generate actions for a PR step
     * @param {string} step - Step description
     * @returns {array} Actions list
     */
    generateActionsForStep(step) {
        const keywords = step.toLowerCase();
        
        if (keywords.includes('press') || keywords.includes('release')) {
            return [
                'Draft compelling headline',
                'Write newsworthy lead',
                'Include relevant quotes',
                'Add multimedia assets'
            ];
        } else if (keywords.includes('social') || keywords.includes('media')) {
            return [
                'Create engaging content',
                'Design eye-catching visuals',
                'Use relevant hashtags',
                'Engage with audience'
            ];
        } else if (keywords.includes('email') || keywords.includes('outreach')) {
            return [
                'Research contact list',
                'Personalize messages',
                'Follow up strategically',
                'Track responses'
            ];
        } else {
            return [
                'Define objectives',
                'Execute plan',
                'Monitor progress',
                'Optimize based on results'
            ];
        }
    }

    /**
     * Generate targets for a PR step
     * @param {string} step - Step description
     * @returns {array} Targets list
     */
    generateTargetsForStep(step) {
        const keywords = step.toLowerCase();
        
        if (keywords.includes('media') || keywords.includes('journalist')) {
            return [
                '@TechCrunch',
                '@TheVerge',
                '@Wired',
                'Industry reporters'
            ];
        } else if (keywords.includes('influencer')) {
            return [
                'Micro-influencers (10K-100K followers)',
                'Industry thought leaders',
                'Brand ambassadors',
                'Content creators'
            ];
        } else if (keywords.includes('social')) {
            return [
                'Twitter/X audience',
                'LinkedIn professionals',
                'Instagram community',
                'Facebook groups'
            ];
        } else {
            return [
                'Target audience segment',
                'Key stakeholders',
                'Industry community'
            ];
        }
    }

    /**
     * Get templates for a PR step
     * @param {string} step - Step description
     * @returns {array} Templates
     */
    getTemplatesForStep(step) {
        const keywords = step.toLowerCase();
        
        if (keywords.includes('press') && keywords.includes('release')) {
            return [this.prTemplates.pressRelease];
        } else if (keywords.includes('email') || keywords.includes('outreach')) {
            return [this.prTemplates.outreachEmail];
        } else if (keywords.includes('social')) {
            return [this.prTemplates.socialPost];
        } else {
            return [];
        }
    }

    /**
     * Generate metrics for a PR step
     * @param {string} step - Step description
     * @returns {array} Metrics list
     */
    generateMetricsForStep(step) {
        const keywords = step.toLowerCase();
        
        if (keywords.includes('press') || keywords.includes('media')) {
            return ['Media mentions', 'Reach', 'Share of voice'];
        } else if (keywords.includes('social')) {
            return ['Engagement rate', 'Follower growth', 'Click-through rate'];
        } else if (keywords.includes('email')) {
            return ['Open rate', 'Response rate', 'Conversion rate'];
        } else {
            return ['Completion rate', 'Quality score', 'ROI'];
        }
    }

    /**
     * Get timeline for step
     * @param {number} order - Step order
     * @returns {string} Timeline
     */
    getTimelineForStep(order) {
        const timelines = [
            'Day 1-2',
            'Day 3-5',
            'Day 6-10',
            'Day 11-14',
            'Day 15-21',
            'Day 22-30'
        ];
        
        return timelines[Math.min(order - 1, timelines.length - 1)];
    }

    /**
     * Extract title from text
     * @param {string} text - Input text
     * @returns {string} Title
     */
    extractTitle(text) {
        // Take first 50 characters or until period
        const endIndex = Math.min(text.indexOf('.'), 50);
        return endIndex > 0 ? text.substring(0, endIndex) : text.substring(0, 50);
    }

    /**
     * Extract keyword from text
     * @param {string} text - Input text
     * @returns {string} Keyword
     */
    extractKeyword(text) {
        // Simple keyword extraction - take first significant word
        const words = text.split(' ').filter(w => w.length > 4);
        return words[0] || 'photography';
    }

    /**
     * Select random items from array
     * @param {array} array - Source array
     * @param {number} count - Number of items to select
     * @returns {array|any} Selected items
     */
    selectRandom(array, count = 1) {
        if (count === 1) {
            return array[Math.floor(Math.random() * array.length)];
        }
        
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseEnhancer;
}