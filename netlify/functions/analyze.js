/**
 * Netlify Function: analyze.js
 * Analyzes viral social media content using AI providers (OpenAI, Claude, Grok)
 * 
 * Testing Instructions:
 * 1. Local testing with Netlify CLI:
 *    - Install: npm install -g netlify-cli
 *    - Create .env file with API keys:
 *      OPENAI_API_KEY=your_key_here
 *      ANTHROPIC_API_KEY=your_key_here
 *      GROK_API_KEY=your_key_here
 *    - Run: netlify dev
 *    - Test endpoint: POST to http://localhost:8888/.netlify/functions/analyze
 * 
 * 2. Test with curl:
 *    curl -X POST http://localhost:8888/.netlify/functions/analyze \
 *      -H "Content-Type: application/json" \
 *      -d '{"posts":[{"id":"1","title":"Test","description":"Test content"}],"provider":"openai"}'
 * 
 * 3. Test with Node.js script:
 *    const fetch = require('node-fetch');
 *    const response = await fetch('http://localhost:8888/.netlify/functions/analyze', {
 *      method: 'POST',
 *      headers: { 'Content-Type': 'application/json' },
 *      body: JSON.stringify({ posts: [...], provider: 'claude' })
 *    });
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fetch = require('node-fetch');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: 5 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Rate limiting by IP
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    await rateLimiter.consume(ip);

    // Parse request body with OpenAI as default provider
    const { posts, provider = 'openai', analysisType = 'full' } = JSON.parse(event.body);

    // Validate required parameters
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid posts array' }),
      };
    }

    // Limit posts to prevent abuse
    const postsToAnalyze = posts.slice(0, 5);
    
    let analysis;

    // Route to appropriate AI provider
    switch (provider.toLowerCase()) {
      case 'openai':
      case 'chatgpt':
      case 'gpt':
        analysis = await analyzeWithOpenAI(postsToAnalyze, analysisType);
        break;
      
      case 'anthropic':
      case 'claude':
        analysis = await analyzeWithClaude(postsToAnalyze, analysisType);
        break;
      
      case 'grok':
      case 'xai':
      case 'x':
        analysis = await analyzeWithGrok(postsToAnalyze, analysisType);
        break;
      
      default:
        // Default to OpenAI if provider not recognized
        analysis = await analyzeWithOpenAI(postsToAnalyze, analysisType);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        provider: provider.toLowerCase(),
        analysisType,
        results: analysis,
      }),
    };

  } catch (error) {
    console.error('Error in analyze:', error);
    
    // Check if rate limit exceeded
    if (error.remainingPoints !== undefined) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

/**
 * OpenAI/ChatGPT Analysis
 * Uses the official OpenAI SDK
 */
async function analyzeWithOpenAI(posts, analysisType) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key is missing. Please configure OPENAI_API_KEY environment variable.');
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const analyses = await Promise.all(posts.map(async (post) => {
      const prompt = createAnalysisPrompt(post, analysisType);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using the efficient model
        messages: [
          {
            role: 'system',
            content: 'You are a social media content analyst specializing in viral content, photography direction, and PR strategy.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      return parseAIResponse(content, post);
    }));

    return analyses;

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
}

/**
 * Claude/Anthropic Analysis
 * Uses the official Anthropic SDK
 */
async function analyzeWithClaude(posts, analysisType) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Anthropic API key not configured');
    throw new Error('Claude API key is missing. Please configure ANTHROPIC_API_KEY environment variable.');
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    
    const analyses = await Promise.all(posts.map(async (post) => {
      const prompt = createAnalysisPrompt(post, analysisType);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      // Claude returns content differently than OpenAI
      const content = response.content[0].text;
      return parseAIResponse(content, post);
    }));

    return analyses;

  } catch (error) {
    console.error('Claude analysis error:', error);
    throw error;
  }
}

/**
 * Grok/xAI Analysis
 * Uses fetch for REST API calls since there's no official SDK
 */
async function analyzeWithGrok(posts, analysisType) {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey) {
    console.error('Grok API key not configured');
    throw new Error('Grok API key is missing. Please configure GROK_API_KEY environment variable.');
  }

  try {
    const apiUrl = 'https://api.x.ai/v1/chat/completions';
    
    const analyses = await Promise.all(posts.map(async (post) => {
      const prompt = createAnalysisPrompt(post, analysisType);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta', // Using Grok's model
          messages: [
            {
              role: 'system',
              content: 'You are a social media content analyst specializing in viral content, photography direction, and PR strategy.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Grok API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return parseAIResponse(content, post);
    }));

    return analyses;

  } catch (error) {
    console.error('Grok analysis error:', error);
    throw error;
  }
}

/**
 * Create analysis prompt based on post content
 */
function createAnalysisPrompt(post, analysisType) {
  const basePrompt = `
Analyze this viral social media post and provide detailed insights:

Title: ${post.title}
Description: ${post.description}
Platform: ${post.platform || 'Unknown'}
Metrics: Views: ${post.metrics?.views || 0}, Likes: ${post.metrics?.likes || 0}, Comments: ${post.metrics?.comments || 0}
Engagement Rate: ${post.engagementRate || '0'}%

Provide the following analysis:

1. WHY IT'S VIRAL (2-3 sentences explaining the viral factors)

2. PHOTOGRAPHY SHOOT IDEAS (5 specific, actionable shoot concepts inspired by this content):
   - Include specific camera angles, lighting, and composition details
   - Mention equipment and settings when relevant
   - Be vivid and descriptive

3. PR CAMPAIGN OUTLINE (Step-by-step PR strategy to amplify similar content):
   - Include specific platforms and influencer targets
   - Provide timeline and metrics to track
   - Include draft templates where applicable

4. KEY TAKEAWAYS (3 bullet points of lessons for content creators)

Format your response in clear sections with headers.`;

  if (analysisType === 'quick') {
    return basePrompt + '\n\nProvide a concise analysis focusing on the key insights.';
  }

  return basePrompt + '\n\nProvide comprehensive, detailed analysis with specific examples and actionable recommendations.';
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(aiContent, originalPost) {
  // Default structure if parsing fails
  const defaultAnalysis = {
    postId: originalPost.id,
    originalPost: {
      title: originalPost.title,
      platform: originalPost.platform,
      metrics: originalPost.metrics,
      engagementRate: originalPost.engagementRate,
    },
    analysis: {
      whyViral: '',
      shootIdeas: [],
      prOutline: [],
      keyTakeaways: [],
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // Parse sections from AI response
    const sections = aiContent.split(/\n(?=[A-Z\s]+:|\d+\.)/);
    
    sections.forEach(section => {
      const lowerSection = section.toLowerCase();
      
      if (lowerSection.includes('why') && lowerSection.includes('viral')) {
        defaultAnalysis.analysis.whyViral = section.replace(/.*?:/, '').trim();
      } 
      else if (lowerSection.includes('photo') || lowerSection.includes('shoot')) {
        const ideas = section.split(/\n[-•*]/).slice(1).map(s => s.trim()).filter(s => s);
        defaultAnalysis.analysis.shootIdeas = ideas.slice(0, 5);
      } 
      else if (lowerSection.includes('pr') || lowerSection.includes('campaign')) {
        const steps = section.split(/\n[-•*]|\n\d+\./).slice(1).map(s => s.trim()).filter(s => s);
        defaultAnalysis.analysis.prOutline = steps;
      } 
      else if (lowerSection.includes('takeaway') || lowerSection.includes('lesson')) {
        const takeaways = section.split(/\n[-•*]/).slice(1).map(s => s.trim()).filter(s => s);
        defaultAnalysis.analysis.keyTakeaways = takeaways.slice(0, 3);
      }
    });

    // If we couldn't parse properly, use the full content
    if (!defaultAnalysis.analysis.whyViral && !defaultAnalysis.analysis.shootIdeas.length) {
      defaultAnalysis.analysis.whyViral = aiContent.substring(0, 200);
      defaultAnalysis.analysis.shootIdeas = ['See full analysis for detailed shoot ideas'];
      defaultAnalysis.analysis.prOutline = ['See full analysis for PR strategy'];
      defaultAnalysis.analysis.keyTakeaways = ['Analysis available in full response'];
      defaultAnalysis.fullResponse = aiContent;
    }

    return defaultAnalysis;

  } catch (error) {
    console.error('Error parsing AI response:', error);
    defaultAnalysis.analysis.whyViral = 'Analysis completed but formatting error occurred';
    defaultAnalysis.fullResponse = aiContent;
    return defaultAnalysis;
  }
}

/**
 * Test function for local development
 * Run with: node -e "require('./analyze.js').testLocally()"
 */
exports.testLocally = async () => {
  const testEvent = {
    httpMethod: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify({
      posts: [
        {
          id: 'test-1',
          title: 'Amazing transformation in 30 days',
          description: 'Watch how this simple change transformed everything',
          platform: 'tiktok',
          metrics: { views: 1000000, likes: 50000, comments: 5000 },
          engagementRate: '5.5'
        }
      ],
      provider: 'openai', // Change to 'claude' or 'grok' to test other providers
      analysisType: 'full'
    })
  };

  const result = await exports.handler(testEvent);
  console.log('Test Result:', JSON.parse(result.body));
};