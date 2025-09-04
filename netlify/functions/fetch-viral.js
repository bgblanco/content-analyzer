const fetch = require('node-fetch');
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

    const { niche, platform, timeRange, contentType, minEngagement } = JSON.parse(event.body);

    // Validate required parameters
    if (!niche || !platform) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: niche and platform' }),
      };
    }

    let results = [];

    switch (platform) {
      case 'youtube':
        results = await fetchYouTubeContent(niche, timeRange, minEngagement);
        break;
      
      case 'tiktok':
        results = await fetchTikTokContent(niche, timeRange, minEngagement);
        break;
      
      case 'instagram':
        results = await fetchInstagramContent(niche, timeRange, minEngagement);
        break;
      
      case 'linkedin':
        results = await fetchLinkedInContent(niche, timeRange, minEngagement);
        break;
      
      case 'demo':
        results = generateDemoContent(niche);
        break;
      
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unsupported platform' }),
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        platform,
        niche,
        count: results.length,
        results,
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
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// YouTube API Integration
async function fetchYouTubeContent(niche, timeRange, minEngagement) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.error('YouTube API key not configured');
    return generateDemoContent(niche);
  }

  const publishedAfter = getTimeRangeDate(timeRange);
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(niche)}&` +
      `type=video&` +
      `order=viewCount&` +
      `publishedAfter=${publishedAfter}&` +
      `maxResults=10&` +
      `key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Get video statistics for engagement data
    const videoIds = data.items.map(item => item.id.videoId).join(',');
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics&` +
      `id=${videoIds}&` +
      `key=${apiKey}`;

    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    // Combine snippet and statistics data
    return data.items.map((item, index) => {
      const stats = statsData.items[index]?.statistics || {};
      return {
        id: item.id.videoId,
        platform: 'youtube',
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        metrics: {
          views: parseInt(stats.viewCount || 0),
          likes: parseInt(stats.likeCount || 0),
          comments: parseInt(stats.commentCount || 0),
        },
        engagementRate: calculateEngagementRate(stats),
      };
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return generateDemoContent(niche);
  }
}

// TikTok API Integration (via RapidAPI)
async function fetchTikTokContent(niche, timeRange, minEngagement) {
  const apiKey = process.env.TIKTOK_RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.error('TikTok API key not configured');
    return generateDemoContent(niche);
  }

  try {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'tiktok-api6.p.rapidapi.com'
      }
    };

    const url = `https://tiktok-api6.p.rapidapi.com/search?keywords=${encodeURIComponent(niche)}&count=10`;
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`TikTok API error: ${data.message || 'Unknown error'}`);
    }

    return (data.videos || []).map(video => ({
      id: video.id,
      platform: 'tiktok',
      title: video.desc,
      description: video.desc,
      thumbnail: video.cover,
      author: video.author?.nickname || 'Unknown',
      publishedAt: new Date(video.createTime * 1000).toISOString(),
      url: video.webVideoUrl,
      metrics: {
        views: video.stats?.playCount || 0,
        likes: video.stats?.diggCount || 0,
        shares: video.stats?.shareCount || 0,
        comments: video.stats?.commentCount || 0,
      },
      engagementRate: calculateTikTokEngagement(video.stats),
    }));

  } catch (error) {
    console.error('TikTok API error:', error);
    return generateDemoContent(niche);
  }
}

// Instagram API Integration
async function fetchInstagramContent(niche, timeRange, minEngagement) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('Instagram access token not configured');
    return generateDemoContent(niche);
  }

  // Note: Instagram's API is limited for content discovery
  // This is a placeholder for Instagram Graph API or Instagram Basic Display API
  // You would need proper OAuth setup and user permissions
  
  return generateDemoContent(niche);
}

// LinkedIn API Integration
async function fetchLinkedInContent(niche, timeRange, minEngagement) {
  const apiKey = process.env.LINKEDIN_API_KEY;
  
  if (!apiKey) {
    console.error('LinkedIn API key not configured');
    return generateDemoContent(niche);
  }

  // LinkedIn API requires OAuth 2.0 and organization access
  // This is a placeholder implementation
  
  return generateDemoContent(niche);
}

// Generate demo content when APIs are not configured
function generateDemoContent(niche) {
  const demoTemplates = [
    {
      title: `Revolutionary ${niche} technique that's changing the industry`,
      description: `Discover how this simple ${niche} approach is transforming businesses worldwide. Thread 🧵`,
      metrics: { views: 125000, likes: 8500, shares: 2100, comments: 450 },
    },
    {
      title: `POV: You're mastering ${niche} in 2025`,
      description: `The exact steps I took to go from beginner to expert in ${niche}. Save this for later!`,
      metrics: { views: 89000, likes: 6200, shares: 1800, comments: 320 },
    },
    {
      title: `The ${niche} mistake 90% of people make`,
      description: `After analyzing 1000+ ${niche} cases, here's what separates success from failure...`,
      metrics: { views: 156000, likes: 12300, shares: 3400, comments: 890 },
    },
    {
      title: `${niche} transformation in just 30 days`,
      description: `Before and after results that will blow your mind. Here's exactly how we did it:`,
      metrics: { views: 203000, likes: 15600, shares: 4200, comments: 1100 },
    },
    {
      title: `Why ${niche} experts are switching to this method`,
      description: `The traditional approach is dead. Here's what's replacing it in 2025...`,
      metrics: { views: 98000, likes: 7800, shares: 2300, comments: 560 },
    },
  ];

  return demoTemplates.map((template, index) => ({
    id: `demo-${Date.now()}-${index}`,
    platform: 'demo',
    title: template.title,
    description: template.description,
    thumbnail: `https://via.placeholder.com/640x360?text=${encodeURIComponent(niche)}`,
    author: 'Demo Creator',
    publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    url: '#',
    metrics: template.metrics,
    engagementRate: calculateEngagementRate(template.metrics),
  }));
}

// Utility functions
function getTimeRangeDate(timeRange) {
  const now = new Date();
  
  switch (timeRange) {
    case '24h':
      now.setDate(now.getDate() - 1);
      break;
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    default:
      now.setDate(now.getDate() - 7);
  }
  
  return now.toISOString();
}

function calculateEngagementRate(stats) {
  const views = parseInt(stats.viewCount || stats.views || 0);
  const likes = parseInt(stats.likeCount || stats.likes || 0);
  const comments = parseInt(stats.commentCount || stats.comments || 0);
  
  if (views === 0) return 0;
  
  const engagement = ((likes + comments * 2) / views) * 100;
  return Math.min(engagement, 100).toFixed(2);
}

function calculateTikTokEngagement(stats) {
  const views = stats?.playCount || 0;
  const likes = stats?.diggCount || 0;
  const shares = stats?.shareCount || 0;
  const comments = stats?.commentCount || 0;
  
  if (views === 0) return 0;
  
  const engagement = ((likes + shares * 2 + comments * 3) / views) * 100;
  return Math.min(engagement, 100).toFixed(2);
}