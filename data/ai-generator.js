const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Content Generator with multi-provider support
class AIContentGenerator {
  constructor() {
    this.providers = {
      openai: null,
      claude: null,
      gemini: null,
      grok: null
    };
  }

  // Initialize providers based on available API keys
  async initialize(apiKeys) {
    if (apiKeys.openai) {
      try {
        this.providers.openai = new OpenAI({ apiKey: apiKeys.openai });
      } catch (e) {
        console.log('OpenAI initialization failed:', e.message);
      }
    }
    
    if (apiKeys.claude) {
      try {
        this.providers.claude = new Anthropic({ apiKey: apiKeys.claude });
      } catch (e) {
        console.log('Claude initialization failed:', e.message);
      }
    }
    
    if (apiKeys.gemini) {
      try {
        this.providers.gemini = new GoogleGenerativeAI(apiKeys.gemini);
      } catch (e) {
        console.log('Gemini initialization failed:', e.message);
      }
    }
    
    // Grok would be initialized here when API becomes available
    if (apiKeys.grok) {
      // Placeholder for Grok API when available
      console.log('Grok API configured but not yet implemented');
    }
  }

  // Generate content suggestions based on user's goal
  async generateSuggestions(goal, provider = 'auto', context = {}) {
    const prompt = this.buildPrompt(goal, context);
    
    // Auto-select provider if not specified
    if (provider === 'auto') {
      if (this.providers.openai) provider = 'openai';
      else if (this.providers.claude) provider = 'claude';
      else if (this.providers.gemini) provider = 'gemini';
      else throw new Error('No AI provider configured. Please add an API key.');
    }

    let response;
    
    switch (provider) {
      case 'openai':
        response = await this.generateWithOpenAI(prompt);
        break;
      case 'claude':
        response = await this.generateWithClaude(prompt);
        break;
      case 'gemini':
        response = await this.generateWithGemini(prompt);
        break;
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
    
    return this.parseAIResponse(response);
  }

  // Build the prompt for AI
  buildPrompt(goal, context) {
    return `You are a viral content strategist for Sentinel Peak Solutions, a marketing and photography company. 
    Generate 5 unique, creative content ideas based on this goal: "${goal}"
    
    ${context.niche ? `Industry/Niche: ${context.niche}` : ''}
    ${context.platform ? `Target Platform: ${context.platform}` : 'Platforms: TikTok, Instagram, YouTube'}
    
    For each content idea, provide:
    1. Title: A catchy, viral-worthy title
    2. Description: 2-3 sentences explaining the concept
    3. Platform: Best platform for this content (TikTok, Instagram, YouTube, LinkedIn)
    4. Content Type: video, photo, carousel, reel, story, article
    5. Viral Factors: 3-4 reasons why this will go viral
    6. Shoot Ideas: 5 specific photography/videography techniques
    7. PR Strategy: 3 ways to amplify reach through PR
    8. Expected Metrics: Realistic engagement predictions
    9. Hashtags: 5-7 relevant hashtags
    10. Call to Action: What action should viewers take
    
    Format as a JSON array with these exact field names. Make each idea unique and actionable.
    Focus on current trends and what's working NOW in social media.`;
  }

  // Generate with OpenAI
  async generateWithOpenAI(prompt) {
    if (!this.providers.openai) throw new Error('OpenAI not configured');
    
    try {
      const response = await this.providers.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert viral content strategist. Generate creative, trending content ideas that will drive engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error('Failed to generate with OpenAI: ' + error.message);
    }
  }

  // Generate with Claude
  async generateWithClaude(prompt) {
    if (!this.providers.claude) throw new Error('Claude not configured');
    
    try {
      const response = await this.providers.claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 3000,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nRespond with a JSON array only.'
          }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error('Claude generation error:', error);
      throw new Error('Failed to generate with Claude: ' + error.message);
    }
  }

  // Generate with Gemini
  async generateWithGemini(prompt) {
    if (!this.providers.gemini) throw new Error('Gemini not configured');
    
    try {
      const model = this.providers.gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt + '\n\nRespond with a JSON array only.');
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error('Failed to generate with Gemini: ' + error.message);
    }
  }

  // Parse AI response and ensure proper format
  parseAIResponse(response) {
    try {
      // Try to extract JSON from the response
      let jsonStr = response;
      
      // If response contains markdown code blocks, extract the JSON
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // Parse the JSON
      let parsed = JSON.parse(jsonStr);
      
      // Ensure it's an array
      if (!Array.isArray(parsed)) {
        if (parsed.suggestions) parsed = parsed.suggestions;
        else if (parsed.ideas) parsed = parsed.ideas;
        else if (parsed.content) parsed = parsed.content;
        else parsed = [parsed];
      }
      
      // Validate and format each suggestion
      return parsed.map((item, index) => ({
        id: Date.now() + index,
        title: item.title || item.Title || `Content Idea ${index + 1}`,
        description: item.description || item.Description || 'AI-generated content suggestion',
        platform: item.platform || item.Platform || 'Instagram',
        contentType: item.contentType || item.content_type || 'video',
        viralFactors: item.viralFactors || item.viral_factors || ['Trending topic', 'High engagement potential', 'Shareable content'],
        shootIdeas: item.shootIdeas || item.shoot_ideas || [
          'Use natural lighting',
          'Capture multiple angles',
          'Include b-roll footage',
          'Focus on details',
          'Show the process'
        ],
        prStrategy: item.prStrategy || item.pr_strategy || [
          'Reach out to niche media',
          'Create press release',
          'Partner with influencers'
        ],
        expectedMetrics: item.expectedMetrics || item.expected_metrics || {
          views: '50K-100K',
          engagement: '8-12%',
          shares: '500-1000'
        },
        hashtags: item.hashtags || ['#contentcreator', '#viral', '#trending'],
        callToAction: item.callToAction || item.call_to_action || 'Follow for more content'
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Return fallback suggestions if parsing fails
      return this.getFallbackSuggestions();
    }
  }

  // Fallback suggestions if AI fails
  getFallbackSuggestions() {
    return [
      {
        id: Date.now(),
        title: 'Behind-the-Scenes Content Series',
        description: 'Show your audience the real work that goes into creating your product or service. Authenticity drives engagement.',
        platform: 'Instagram',
        contentType: 'reel',
        viralFactors: [
          'Authenticity resonates with audiences',
          'Behind-the-scenes content builds trust',
          'Process videos are highly shareable'
        ],
        shootIdeas: [
          'Time-lapse of your work process',
          'Close-up shots of details',
          'Team member interviews',
          'Before and after reveals',
          'Equipment and tool showcases'
        ],
        prStrategy: [
          'Pitch to industry publications',
          'Create a press kit with BTS content',
          'Partner with industry influencers'
        ],
        expectedMetrics: {
          views: '25K-50K',
          engagement: '6-8%',
          shares: '200-500'
        },
        hashtags: ['#behindthescenes', '#process', '#authentic', '#creator'],
        callToAction: 'What would you like to see next?'
      },
      {
        id: Date.now() + 1,
        title: 'User Transformation Stories',
        description: 'Feature real customers and their journey with your product. Social proof is powerful for conversions.',
        platform: 'TikTok',
        contentType: 'video',
        viralFactors: [
          'Transformation content performs well',
          'User stories build credibility',
          'Emotional connection drives shares'
        ],
        shootIdeas: [
          'Before/after comparisons',
          'Customer testimonial interviews',
          'Day-in-the-life footage',
          'Results showcase',
          'Emotional reaction captures'
        ],
        prStrategy: [
          'Submit to success story outlets',
          'Create case study for media',
          'Leverage customer as brand ambassador'
        ],
        expectedMetrics: {
          views: '75K-150K',
          engagement: '10-15%',
          shares: '1000-2000'
        },
        hashtags: ['#transformation', '#customersstory', '#results', '#testimonial'],
        callToAction: 'Share your transformation below!'
      }
    ];
  }
}

// Export for use in server
module.exports = { AIContentGenerator };