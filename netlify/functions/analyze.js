const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

    switch (provider) {
      case 'openai':
        analysis = await analyzeWithOpenAI(postsToAnalyze, analysisType);
        break;
      
      case 'anthropic':
      case 'claude':
        analysis = await analyzeWithAnthropic(postsToAnalyze, analysisType);
        break;
      
      case 'gemini':
      case 'google':
        analysis = await analyzeWithGemini(postsToAnalyze, analysisType);
        break;
      
      case 'grok':
      case 'xai':
        analysis = await analyzeWithGrok(postsToAnalyze, analysisType);
        break;
      
      default:
        analysis = await generateAIAnalysis(postsToAnalyze, analysisType);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        provider,
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
      body: JSON.stringify({ error: 'Analysis failed. Please try again.' }),
    };
  }
};

// OpenAI Analysis
async function analyzeWithOpenAI(posts, analysisType) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    return generateAIAnalysis(posts, analysisType);
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const analyses = await Promise.all(posts.map(async (post) => {
      const prompt = createAnalysisPrompt(post, analysisType);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
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
    return generateAIAnalysis(posts, analysisType);
  }
}

// Anthropic/Claude Analysis
async function analyzeWithAnthropic(posts, analysisType) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Anthropic API key not configured');
    return generateAIAnalysis(posts, analysisType);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    
    const analyses = await Promise.all(posts.map(async (post) => {
      const prompt = createAnalysisPrompt(post, analysisType);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const content = response.content[0].text;
      return parseAIResponse(content, post);
    }));

    return analyses;

  } catch (error) {
    console.error('Anthropic analysis error:', error);
    return generateAIAnalysis(posts, analysisType);
  }
}

// Google Gemini Analysis
async function analyzeWithGemini(posts, analysisType) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('Gemini API key not configured');
    return generateAIAnalysis(posts, analysisType);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const analyses = await Promise.all(posts.map(async (post) => {
      const prompt = createAnalysisPrompt(post, analysisType);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      return parseAIResponse(content, post);
    }));

    return analyses;

  } catch (error) {
    console.error('Gemini analysis error:', error);
    return generateAIAnalysis(posts, analysisType);
  }
}

// xAI Grok Analysis
async function analyzeWithGrok(posts, analysisType) {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey) {
    console.error('Grok API key not configured');
    return generateAIAnalysis(posts, analysisType);
  }

  try {
    // Grok API endpoint (this is hypothetical as the actual endpoint may differ)
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
          model: 'grok-1',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return parseAIResponse(content, post);
    }));

    return analyses;

  } catch (error) {
    console.error('Grok analysis error:', error);
    return generateAIAnalysis(posts, analysisType);
  }
}

// Create analysis prompt based on post content
function createAnalysisPrompt(post, analysisType) {
  const basePrompt = `
Analyze this viral social media post and provide detailed insights:

Title: ${post.title}
Description: ${post.description}
Platform: ${post.platform}
Metrics: Views: ${post.metrics?.views || 0}, Likes: ${post.metrics?.likes || 0}, Comments: ${post.metrics?.comments || 0}
Engagement Rate: ${post.engagementRate}%

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

// Parse AI response into structured format
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

// Generate AI analysis when providers are not configured
function generateAIAnalysis(posts, analysisType) {
  return posts.map(post => ({
    postId: post.id,
    originalPost: {
      title: post.title,
      platform: post.platform,
      metrics: post.metrics,
      engagementRate: post.engagementRate,
    },
    analysis: {
      whyViral: `This content leverages emotional storytelling, trend-jacking, and platform-specific optimization. The hook creates curiosity while the value proposition is immediately clear, driving high engagement through shareability and relatability.`,
      shootIdeas: [
        'Hero Shot: Low-angle perspective with subject against dramatic sky, shot during golden hour with 85mm lens at f/1.8 for beautiful bokeh. Position subject off-center using rule of thirds.',
        'Behind-the-Scenes Documentary: Handheld camera following the process, using natural light with occasional LED panel fill. Capture candid moments and reactions at 24fps for cinematic feel.',
        'Before/After Transformation: Consistent lighting setup with two softboxes at 45-degree angles. Use tripod for exact framing match. Shoot at f/8 for sharp details throughout.',
        'Lifestyle Integration: Environmental portrait showing product/service in real use. Mix of wide establishing shots (24mm) and intimate close-ups (50mm). Natural light supplemented with reflector.',
        'Motion Sequence: Capture dynamic action using 1/1000 shutter speed to freeze motion or 1/15 for intentional blur. Use continuous AF tracking and burst mode for best moments.',
      ],
      prOutline: [
        'Day 1-2: Draft compelling press release highlighting the unique angle and newsworthiness. Include statistics and expert quotes.',
        'Day 3-5: Research and compile media list of 50+ relevant journalists, bloggers, and influencers in the niche. Personalize pitches.',
        'Day 6-7: Launch coordinated social media campaign across all platforms. Use scheduling tools for optimal timing.',
        'Day 8-10: Conduct targeted outreach to media contacts. Follow up with non-responders. Offer exclusive angles to top-tier media.',
        'Day 11-14: Amplify coverage through paid promotion. Engage with all comments and shares. Document metrics for case study.',
      ],
      keyTakeaways: [
        'Emotional resonance drives virality more than production value - focus on authentic storytelling',
        'Platform-specific optimization is crucial - what works on TikTok won\'t necessarily work on LinkedIn',
        'Timing and consistency matter - post when your audience is most active and maintain regular cadence',
      ],
    },
    timestamp: new Date().toISOString(),
  }));
}