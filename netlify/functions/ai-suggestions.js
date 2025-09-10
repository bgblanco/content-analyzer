const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { goal, apiKeys, provider, context, selectedPosts } = JSON.parse(event.body);
    
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
        suggestions = await generateWithOpenAI(goal, context, selectedPosts, keys.openai);
      }
    }
    
    if (!suggestions && (selectedProvider === 'auto' || selectedProvider === 'claude')) {
      if (keys.claude) {
        suggestions = await generateWithClaude(goal, context, selectedPosts, keys.claude);
      }
    }
    
    if (!suggestions && (selectedProvider === 'auto' || selectedProvider === 'gemini')) {
      if (keys.gemini) {
        suggestions = await generateWithGemini(goal, context, selectedPosts, keys.gemini);
      }
    }
    
    if (!suggestions && (selectedProvider === 'auto' || selectedProvider === 'grok')) {
      if (keys.grok) {
        suggestions = await generateWithGrok(goal, context, selectedPosts, keys.grok);
      }
    }
    
    if (!suggestions) {
      return {
        statusCode: 503,
        body: JSON.stringify({ 
          error: 'No AI providers available. Please configure at least one API key.' 
        }),
      };
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
async function generateWithOpenAI(goal, context, selectedPosts, apiKey) {
  const openai = new OpenAI({ apiKey });
  
  const prompt = buildDetailedPrompt(goal, context, selectedPosts);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert content strategist, photographer, and PR specialist. Generate highly specific, actionable content ideas with concrete technical specifications. Be extremely detailed about camera settings, lighting setups, and PR strategies. Respond with a JSON array only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 4000
  });
  
  return parseAIResponse(response.choices[0].message.content);
}

// Generate with Claude
async function generateWithClaude(goal, context, selectedPosts, apiKey) {
  const anthropic = new Anthropic({ apiKey });
  
  const prompt = buildDetailedPrompt(goal, context, selectedPosts);
  
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000,
    temperature: 0.8,
    messages: [
      {
        role: 'user',
        content: prompt + '\n\nYou are an expert content strategist, photographer, and PR specialist. Respond with a JSON array only, with highly specific technical details.'
      }
    ]
  });
  
  return parseAIResponse(response.content[0].text);
}

// Generate with Gemini
async function generateWithGemini(goal, context, selectedPosts, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = buildDetailedPrompt(goal, context, selectedPosts);
  const result = await model.generateContent(prompt + '\n\nRespond with a JSON array only.');
  const response = await result.response;
  
  return parseAIResponse(response.text());
}

// Generate with Grok
async function generateWithGrok(goal, context, selectedPosts, apiKey) {
  // Grok API integration
  const grokUrl = 'https://api.x.ai/v1/chat/completions';
  
  const prompt = buildDetailedPrompt(goal, context, selectedPosts);
  
  const response = await fetch(grokUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist specializing in viral content, photography techniques, and PR strategies. Generate highly specific, actionable content ideas with concrete technical specifications.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json();
  return parseAIResponse(data.choices[0].message.content);
}

// Build detailed prompt with full context
function buildDetailedPrompt(goal, context, selectedPosts) {
  let prompt = `Generate 5 unique, creative content ideas based on this goal: "${goal}"`;
  
  // Add context information
  if (context) {
    prompt += `\n\nContext:`;
    if (context.niche) prompt += `\nIndustry/Niche: ${context.niche}`;
    if (context.platform) prompt += `\nTarget Platform: ${context.platform}`;
    if (context.location) prompt += `\nLocation: ${context.location} (consider local trends and Fresno-specific opportunities)`;
    if (context.audience) prompt += `\nTarget Audience: ${context.audience}`;
  }
  
  // Add selected posts for inspiration (with full context)
  if (selectedPosts && selectedPosts.length > 0) {
    prompt += `\n\nAnalyze these viral posts for inspiration and patterns:\n`;
    
    selectedPosts.forEach((post, index) => {
      prompt += `\nPost ${index + 1}:`;
      prompt += `\n- Title: ${post.title}`;
      prompt += `\n- Author: ${post.author}`;
      prompt += `\n- Platform: ${post.platform}`;
      prompt += `\n- Description: ${post.description || 'N/A'}`;
      prompt += `\n- Published: ${post.publishedAt}`;
      prompt += `\n- Metrics: Views: ${post.metrics?.views || 0}, Likes: ${post.metrics?.likes || 0}, Comments: ${post.metrics?.comments || 0}, Shares: ${post.metrics?.shares || 0}`;
      prompt += `\n- Hashtags: ${post.hashtags?.join(', ') || 'None'}`;
      prompt += `\n- Content Type: ${post.contentType || 'Unknown'}`;
      prompt += `\n- Engagement Score: ${post.engagementScore || 0}`;
    });
  }
  
  prompt += `\n\nFor each content idea, provide EXTREMELY DETAILED specifications:

1. title: A catchy, viral-worthy title
2. description: 3-4 sentences explaining the concept in detail
3. platform: Best platform (TikTok, Instagram, YouTube, LinkedIn)
4. contentType: video, photo, carousel, reel, story, article
5. viralFactors: Array of 4-5 specific reasons why this will go viral
6. shootSpecs: Object with:
   - camera: Specific camera model recommendation
   - lens: Exact lens focal length and aperture (e.g., "24-70mm f/2.8")
   - aperture: Specific f-stop (e.g., "f/1.4")
   - shutterSpeed: Exact shutter speed (e.g., "1/125s")
   - iso: Specific ISO value (e.g., "ISO 400")
   - lighting: Detailed lighting setup (e.g., "Key light: Softbox 45° left, Fill: Reflector right, Rim: LED panel behind")
   - movement: Camera movement technique (e.g., "Dolly zoom", "Handheld with stabilizer", "Slider shot")
   - colorGrading: Color grading approach (e.g., "Teal and orange, lifted blacks, crushed highlights")
7. prStrategy: Array of 4-5 SPECIFIC PR tactics including:
   - Exact media outlets to pitch
   - Specific influencers to collaborate with
   - Press release angles
   - Local Fresno media opportunities if applicable
   - Event tie-ins or seasonal hooks
8. expectedMetrics: Object with specific numbers:
   - views: Range (e.g., "50K-100K")
   - engagement: Percentage (e.g., "12-15%")
   - shares: Range (e.g., "500-1500")
   - conversionRate: Expected conversion (e.g., "3-5%")
9. hashtags: Array of 7-10 highly specific, researched hashtags
10. callToAction: Specific CTA with exact wording
11. productionTimeline: Object with:
    - preProduction: Days needed
    - shooting: Hours needed
    - postProduction: Days needed
    - totalDays: Total timeline
12. budget: Estimated production budget range

Format as JSON array. Make each idea unique, actionable, and based on current trends and the analyzed viral posts.`;
  
  return prompt;
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
      viralFactors: item.viralFactors || ['Trending topic', 'High engagement potential', 'Shareable content', 'Algorithm-friendly'],
      shootSpecs: item.shootSpecs || {
        camera: 'Canon R5 or Sony A7S III',
        lens: '24-70mm f/2.8',
        aperture: 'f/2.8',
        shutterSpeed: '1/125s',
        iso: 'ISO 400',
        lighting: 'Natural light with reflector',
        movement: 'Handheld with stabilizer',
        colorGrading: 'Natural with slight warm tone'
      },
      prStrategy: item.prStrategy || [
        'Pitch to TechCrunch and The Verge',
        'Partner with micro-influencers in niche',
        'Create press release for PR Newswire',
        'Submit to Product Hunt',
        'Local Fresno media outreach'
      ],
      expectedMetrics: item.expectedMetrics || { 
        views: '25K-75K', 
        engagement: '8-12%', 
        shares: '500-1500',
        conversionRate: '2-4%'
      },
      hashtags: item.hashtags || ['#viral', '#trending', '#content', '#creative', '#marketing'],
      callToAction: item.callToAction || 'Follow for more content like this',
      productionTimeline: item.productionTimeline || {
        preProduction: 2,
        shooting: 4,
        postProduction: 3,
        totalDays: 5
      },
      budget: item.budget || '$500-$2000'
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse AI response');
  }
}