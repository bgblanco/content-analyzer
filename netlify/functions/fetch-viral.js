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

    const { niche, platform, timeRange, contentType, minEngagement, limit = 10 } = JSON.parse(event.body);

    // Validate required parameters
    if (!platform) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameter: platform' }),
      };
    }

    // Get Apify configuration from environment
    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    
    if (!APIFY_TOKEN) {
      console.error('APIFY_TOKEN not configured');
      return {
        statusCode: 503,
        body: JSON.stringify({ 
          error: 'Apify integration not configured', 
          message: 'Please configure APIFY_TOKEN in environment variables',
          requiresSetup: true 
        }),
      };
    }

    // For now, return demo content with clear indication it's demo data
    // Until Apify is properly configured with correct actor IDs
    const demoResults = generateDemoContent(platform, niche, limit);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        platform,
        niche,
        count: demoResults.length,
        results: demoResults,
        isDemo: true,
        message: 'Using demo data. Configure Apify actors for real content.'
      }),
    };

  } catch (error) {
    console.error('Error in fetch-viral:', error);
    
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

// Generate demo content with clear indication it's demo
function generateDemoContent(platform, niche, limit) {
  const demoData = [];
  const nicheTerm = niche || 'trending';
  
  // Platform-specific demo templates
  const templates = {
    tiktok: {
      titles: [
        `How to ${nicheTerm} in 2024 - Must Watch!`,
        `${nicheTerm} Transformation That Shocked Everyone`,
        `The ${nicheTerm} Hack Nobody Talks About`,
        `POV: You Finally Mastered ${nicheTerm}`,
        `${nicheTerm} Challenge Gone Viral`
      ],
      authors: ['@trendsetter', '@viralking', '@contentqueen', '@creator123', '@dailyvibes'],
      viewRanges: [100000, 5000000],
      likeRanges: [10000, 500000]
    },
    instagram: {
      titles: [
        `Amazing ${nicheTerm} Journey`,
        `${nicheTerm} Goals Achieved`,
        `Transform Your ${nicheTerm} Game`,
        `${nicheTerm} Inspiration Daily`,
        `The Perfect ${nicheTerm} Setup`
      ],
      authors: ['lifestyle.guru', 'daily.inspire', 'content.hub', 'viral.posts', 'trending.now'],
      viewRanges: [50000, 2000000],
      likeRanges: [5000, 200000]
    },
    youtube: {
      titles: [
        `${nicheTerm} Complete Guide - Everything You Need`,
        `I Tried ${nicheTerm} for 30 Days - Here's What Happened`,
        `${nicheTerm} Tips That Actually Work`,
        `The Truth About ${nicheTerm} Nobody Tells You`,
        `${nicheTerm} for Beginners - Start Here`
      ],
      authors: ['TechMaster', 'LifeGuru', 'ContentKing', 'DailyVlogs', 'ProTips'],
      viewRanges: [100000, 10000000],
      likeRanges: [5000, 500000]
    }
  };

  const template = templates[platform] || templates.tiktok;
  
  for (let i = 0; i < Math.min(limit, 5); i++) {
    const views = Math.floor(Math.random() * (template.viewRanges[1] - template.viewRanges[0]) + template.viewRanges[0]);
    const likes = Math.floor(Math.random() * (template.likeRanges[1] - template.likeRanges[0]) + template.likeRanges[0]);
    const comments = Math.floor(likes * 0.1);
    const shares = Math.floor(likes * 0.05);
    
    demoData.push({
      id: `demo-${platform}-${Date.now()}-${i}`,
      platform: platform,
      url: '#demo-content',
      author: template.authors[i % template.authors.length],
      title: template.titles[i % template.titles.length],
      description: `[DEMO] This is sample content for ${nicheTerm} on ${platform}. Configure Apify for real viral content.`,
      thumbnail: `https://via.placeholder.com/640x360/4A9B9E/FFFFFF?text=${platform}+Demo`,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        views: views,
        likes: likes,
        comments: comments,
        shares: shares,
        saves: Math.floor(shares * 0.8)
      },
      hashtags: [`#${nicheTerm}`, `#${platform}`, '#viral', '#trending', '#demo'],
      engagementScore: Math.floor((likes + comments * 2 + shares * 3) / views * 10000),
      contentType: 'video',
      isDemo: true
    });
  }
  
  return demoData.sort((a, b) => b.engagementScore - a.engagementScore);
}

// NOTE: Apify integration disabled until proper actor IDs are configured
// To enable real Apify integration:
// 1. Get correct actor IDs from Apify Store
// 2. Ensure token has proper permissions
// 3. Test with free tier actors first
// 4. Uncomment and update the fetchFromApify function below

/*
async function fetchFromApify(platform, niche, timeRange, limit, token) {
  // Free tier actors available on Apify:
  const platformConfig = {
    tiktok: {
      // Use free scrapers or your own actors
      actorId: 'your-tiktok-actor-id',
      inputOverrides: {
        // Actor-specific input
      }
    },
    instagram: {
      // Instagram scrapers may require authentication
      actorId: 'your-instagram-actor-id',
      inputOverrides: {
        // Actor-specific input
      }
    },
    youtube: {
      // YouTube scrapers are generally more available
      actorId: 'your-youtube-actor-id',
      inputOverrides: {
        searchTerm: niche,
        maxResults: limit
      }
    }
  };
  
  // Implementation here...
}
*/