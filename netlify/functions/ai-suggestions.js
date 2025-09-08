const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { goal, apiKeys, provider, context } = JSON.parse(event.body);
    
    if (!goal || goal.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Please provide a goal or description for content generation' 
        }),
      };
    }
    
    // Use provided API keys or environment variables
    const keys = apiKeys || {
      openai: process.env.OPENAI_API_KEY,
      claude: process.env.ANTHROPIC_API_KEY,
      gemini: process.env.GOOGLE_API_KEY,
      grok: process.env.GROK_API_KEY
    };
    
    // Generate suggestions based on provider
    let suggestions;
    const selectedProvider = provider || 'auto';
    
    if (selectedProvider === 'auto' || selectedProvider === 'openai') {
      if (keys.openai) {
        suggestions = await generateWithOpenAI(goal, context, keys.openai);
      }
    }
    
    if (!suggestions && (selectedProvider === 'auto' || selectedProvider === 'claude')) {
      if (keys.claude) {
        suggestions = await generateWithClaude(goal, context, keys.claude);
      }
    }
    
    if (!suggestions && (selectedProvider === 'auto' || selectedProvider === 'gemini')) {
      if (keys.gemini) {
        suggestions = await generateWithGemini(goal, context, keys.gemini);
      }
    }
    
    if (!suggestions) {
      // No API keys available, return fallback suggestions
      suggestions = getFallbackSuggestions(goal);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        goal: goal,
        provider: selectedProvider,
        count: suggestions.length,
        suggestions: suggestions
      }),
    };
    
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate suggestions: ' + error.message 
      }),
    };
  }
};

// Generate with OpenAI
async function generateWithOpenAI(goal, context, apiKey) {
  const openai = new OpenAI({ apiKey });
  
  const prompt = buildPrompt(goal, context);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert viral content strategist. Generate creative, trending content ideas that will drive engagement. Respond with a JSON array only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 3000
  });
  
  return parseAIResponse(response.choices[0].message.content);
}

// Generate with Claude
async function generateWithClaude(goal, context, apiKey) {
  const anthropic = new Anthropic({ apiKey });
  
  const prompt = buildPrompt(goal, context);
  
  const response = await anthropic.messages.create({
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
  
  return parseAIResponse(response.content[0].text);
}

// Generate with Gemini
async function generateWithGemini(goal, context, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = buildPrompt(goal, context);
  const result = await model.generateContent(prompt + '\n\nRespond with a JSON array only.');
  const response = await result.response;
  
  return parseAIResponse(response.text());
}

// Build the prompt
function buildPrompt(goal, context) {
  return `Generate 5 unique, creative content ideas based on this goal: "${goal}"
  
  ${context?.niche ? `Industry/Niche: ${context.niche}` : ''}
  ${context?.platform ? `Target Platform: ${context.platform}` : 'Platforms: TikTok, Instagram, YouTube'}
  
  For each content idea, provide:
  1. title: A catchy, viral-worthy title
  2. description: 2-3 sentences explaining the concept
  3. platform: Best platform (TikTok, Instagram, YouTube, LinkedIn)
  4. contentType: video, photo, carousel, reel, story, article
  5. viralFactors: Array of 3-4 reasons why this will go viral
  6. shootIdeas: Array of 5 specific photography/videography techniques
  7. prStrategy: Array of 3 PR amplification strategies
  8. expectedMetrics: Object with views, engagement, shares
  9. hashtags: Array of 5-7 relevant hashtags
  10. callToAction: What action viewers should take
  
  Format as JSON array. Make each idea unique, actionable, and based on current trends.`;
}

// Parse AI response
function parseAIResponse(response) {
  try {
    let jsonStr = response;
    
    // Extract JSON from markdown if needed
    const jsonMatch = response.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Remove any non-JSON content before/after
    const startIdx = jsonStr.indexOf('[');
    const endIdx = jsonStr.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }
    
    let parsed = JSON.parse(jsonStr);
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }
    
    return parsed.map((item, index) => ({
      id: Date.now() + index,
      title: item.title || `Content Idea ${index + 1}`,
      description: item.description || 'AI-generated content suggestion',
      platform: item.platform || 'Instagram',
      contentType: item.contentType || 'video',
      viralFactors: item.viralFactors || ['Trending topic', 'High engagement', 'Shareable'],
      shootIdeas: item.shootIdeas || ['Natural lighting', 'Multiple angles', 'B-roll footage'],
      prStrategy: item.prStrategy || ['Media outreach', 'Press release', 'Influencer partnerships'],
      expectedMetrics: item.expectedMetrics || { views: '50K-100K', engagement: '8-12%', shares: '500-1000' },
      hashtags: item.hashtags || ['#viral', '#trending', '#content'],
      callToAction: item.callToAction || 'Follow for more'
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return getFallbackSuggestions();
  }
}

// Fallback suggestions
function getFallbackSuggestions(goal = '') {
  return [
    {
      id: Date.now(),
      title: 'Behind-the-Scenes Documentary Series',
      description: `Create an authentic documentary series showing the real work behind ${goal || 'your brand'}. Transparency builds trust and engagement.`,
      platform: 'YouTube',
      contentType: 'video',
      viralFactors: [
        'Authenticity drives engagement',
        'Behind-the-scenes content builds trust',
        'Documentary format keeps viewers watching'
      ],
      shootIdeas: [
        'Use handheld camera for documentary feel',
        'Capture candid team moments',
        'Time-lapse of work processes',
        'Interview-style testimonials',
        'Show failures and successes'
      ],
      prStrategy: [
        'Pitch to industry publications',
        'Create episodic press releases',
        'Partner with industry influencers'
      ],
      expectedMetrics: {
        views: '25K-75K per episode',
        engagement: '8-10%',
        shares: '500-1500'
      },
      hashtags: ['#behindthescenes', '#documentary', '#authentic', '#process', '#realstory'],
      callToAction: 'Subscribe to follow the journey'
    },
    {
      id: Date.now() + 1,
      title: 'User Transformation Challenge',
      description: `Launch a 30-day transformation challenge related to ${goal || 'your product'}. User-generated content and social proof drive viral growth.`,
      platform: 'TikTok',
      contentType: 'video',
      viralFactors: [
        'Challenge format encourages participation',
        'Transformation content performs exceptionally',
        'User-generated content extends reach',
        'Community building increases loyalty'
      ],
      shootIdeas: [
        'Before/after split screens',
        'Daily progress updates',
        'Participant testimonials',
        'Montage of transformations',
        'Live Q&A sessions'
      ],
      prStrategy: [
        'Launch with media announcement',
        'Weekly progress updates to press',
        'Feature success stories in outlets'
      ],
      expectedMetrics: {
        views: '100K-500K total',
        engagement: '12-18%',
        shares: '2000-5000'
      },
      hashtags: ['#30daychallenge', '#transformation', '#beforeafter', '#community', '#results'],
      callToAction: 'Join the challenge - link in bio!'
    }
  ];
}