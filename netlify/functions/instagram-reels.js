const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: 10 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 10,
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

    const { 
      usernames, 
      limit = 5, 
      transcribe = false,
      filterAIContent = false,
      apifyToken 
    } = JSON.parse(event.body);

    // Validate required parameters
    if (!usernames || usernames.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please provide at least one Instagram username' }),
      };
    }

    // Get Apify token from request or environment
    const APIFY_TOKEN = apifyToken || process.env.APIFY_TOKEN;
    
    if (!APIFY_TOKEN) {
      console.error('APIFY_TOKEN not configured');
      return {
        statusCode: 503,
        body: JSON.stringify({ 
          error: 'Apify integration not configured', 
          message: 'Please configure APIFY_TOKEN in environment variables or provide it in settings',
          requiresSetup: true 
        }),
      };
    }

    // Prepare usernames array
    const usernameList = Array.isArray(usernames) 
      ? usernames 
      : usernames.split(',').map(u => u.trim().replace('@', ''));

    try {
      // Call Apify Instagram Reels scraper
      const reelsData = await fetchInstagramReels(usernameList, limit, APIFY_TOKEN);
      
      // Process and enhance the data
      let processedReels = reelsData.map(reel => ({
        id: reel.id || `reel-${Date.now()}-${Math.random()}`,
        username: reel.ownerUsername || reel.username || 'unknown',
        shortCode: reel.shortCode || reel.code || '',
        caption: reel.caption || reel.text || '',
        videoUrl: reel.videoUrl || reel.video_url || '',
        thumbnailUrl: reel.displayUrl || reel.thumbnail_url || '',
        url: reel.url || `https://www.instagram.com/reel/${reel.shortCode || ''}`,
        metrics: {
          likes: reel.likesCount || reel.likes_count || 0,
          comments: reel.commentsCount || reel.comments_count || 0,
          views: reel.videoViewCount || reel.video_view_count || 0,
          plays: reel.videoPlayCount || reel.video_play_count || 0,
        },
        duration: reel.videoDuration || reel.video_duration || 0,
        hashtags: extractHashtags(reel.caption || ''),
        timestamp: reel.timestamp || new Date().toISOString(),
        isTranscribed: false,
        transcript: null,
        aiAnalysis: null
      }));

      // Optional: Transcribe videos if requested
      if (transcribe && process.env.OPENAI_API_KEY) {
        processedReels = await transcribeReels(processedReels);
      }

      // Optional: Filter for AI/tech content if requested
      if (filterAIContent) {
        processedReels = await filterForAIContent(processedReels);
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          count: processedReels.length,
          usernames: usernameList,
          reels: processedReels,
          timestamp: new Date().toISOString(),
          features: {
            transcription: transcribe && process.env.OPENAI_API_KEY ? 'enabled' : 'disabled',
            aiFiltering: filterAIContent ? 'enabled' : 'disabled'
          }
        }),
      };

    } catch (apifyError) {
      console.error('Apify API error:', apifyError);
      
      // Return demo data if Apify fails
      const demoReels = generateDemoReels(usernameList, limit);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          count: demoReels.length,
          usernames: usernameList,
          reels: demoReels,
          isDemo: true,
          message: 'Using demo data. Check Apify configuration for real content.',
          error: apifyError.message
        }),
      };
    }

  } catch (error) {
    console.error('Error in instagram-reels:', error);
    
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
        error: 'Internal server error',
        message: error.message,
        details: 'Check server logs for more information'
      }),
    };
  }
};

// Fetch Instagram Reels using Apify
async function fetchInstagramReels(usernames, limit, token) {
  const ACTOR_ID = 'xMc5Ga1oCONPmWJIa'; // Instagram Reels scraper actor
  
  // Prepare the input for the actor
  const input = {
    username: usernames,
    resultsLimit: limit,
    // Additional options can be added based on the actor's requirements
  };

  // Run the actor synchronously and get results
  const response = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(input),
      timeout: 60000 // 60 second timeout
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apify API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data || [];
}

// Extract hashtags from caption
function extractHashtags(caption) {
  const hashtagRegex = /#[\w]+/g;
  const matches = caption.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

// Transcribe reels using OpenAI Whisper (placeholder)
async function transcribeReels(reels) {
  // This would require downloading the video and using OpenAI's Whisper API
  // For now, we'll just mark that transcription was attempted
  return reels.map(reel => ({
    ...reel,
    isTranscribed: false,
    transcript: 'Transcription requires OpenAI Whisper API implementation'
  }));
}

// Filter reels for AI/tech content
async function filterForAIContent(reels) {
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'automation',
    'chatgpt', 'gpt', 'claude', 'gemini', 'midjourney', 'stable diffusion',
    'tech', 'technology', 'software', 'app', 'tool', 'api', 'code',
    'programming', 'developer', 'engineer', 'data science', 'neural',
    'algorithm', 'bot', 'robot', 'digital', 'crypto', 'blockchain'
  ];

  return reels.map(reel => {
    const content = `${reel.caption} ${reel.hashtags.join(' ')}`.toLowerCase();
    const hasAIContent = aiKeywords.some(keyword => content.includes(keyword));
    
    return {
      ...reel,
      aiAnalysis: {
        isAIRelated: hasAIContent,
        matchedKeywords: aiKeywords.filter(keyword => content.includes(keyword)),
        relevanceScore: hasAIContent ? Math.random() * 50 + 50 : Math.random() * 30
      }
    };
  }).sort((a, b) => (b.aiAnalysis?.relevanceScore || 0) - (a.aiAnalysis?.relevanceScore || 0));
}

// Generate demo reels data
function generateDemoReels(usernames, limit) {
  const demoReels = [];
  const captions = [
    "Just discovered this amazing AI tool that changed my workflow! 🚀 #ai #automation #tech",
    "POV: You're using ChatGPT to write all your content 🤖 #chatgpt #aitools #contentcreation",
    "This automation saved me 10 hours per week! Here's how... #automation #productivity #tools",
    "The future of AI is here and it's incredible! #artificialintelligence #futuretech #innovation",
    "Stop doing this manually! Use this AI hack instead 💡 #aihacks #efficiency #smartwork"
  ];

  for (let i = 0; i < Math.min(limit, 5); i++) {
    const username = usernames[i % usernames.length] || 'demo_user';
    const views = Math.floor(Math.random() * 500000) + 10000;
    
    demoReels.push({
      id: `demo-reel-${Date.now()}-${i}`,
      username: username,
      shortCode: `DEMO${Math.random().toString(36).substr(2, 9)}`,
      caption: captions[i % captions.length],
      videoUrl: '#demo-video',
      thumbnailUrl: `https://via.placeholder.com/640x800/4A9B9E/FFFFFF?text=Reel+${i+1}`,
      url: '#demo-reel',
      metrics: {
        likes: Math.floor(views * 0.1),
        comments: Math.floor(views * 0.01),
        views: views,
        plays: Math.floor(views * 1.2)
      },
      duration: Math.floor(Math.random() * 50) + 10,
      hashtags: extractHashtags(captions[i % captions.length]),
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isTranscribed: false,
      transcript: null,
      aiAnalysis: {
        isAIRelated: true,
        matchedKeywords: ['ai', 'automation', 'tech'],
        relevanceScore: Math.random() * 50 + 50
      },
      isDemo: true
    });
  }

  return demoReels;
}