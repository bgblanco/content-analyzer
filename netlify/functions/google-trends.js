const fetch = require('node-fetch');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: 20 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

// Google Trends data generator (simulated for production showcase)
// In production, this would connect to Google Trends API
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

    const { category, geo, timeframe } = JSON.parse(event.body);

    // Generate trending topics based on category and location
    const trendingTopics = await generateTrendingTopics(category, geo, timeframe);
    const relatedQueries = await generateRelatedQueries(category);
    const risingSearches = await generateRisingSearches(category);
    const seasonalTrends = await generateSeasonalTrends(category);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          trendingTopics,
          relatedQueries,
          risingSearches,
          seasonalTrends,
          geo: geo || 'US',
          category: category || 'all'
        }
      }),
    };

  } catch (error) {
    console.error('Error in google-trends:', error);
    
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

// Generate trending topics relevant to the category
async function generateTrendingTopics(category, geo, timeframe) {
  const baseTopics = {
    'marketing': [
      { topic: 'AI Content Generation', interest: 95, change: '+125%', spark: getTrendSparkline() },
      { topic: 'Short-form Video Marketing', interest: 88, change: '+85%', spark: getTrendSparkline() },
      { topic: 'Influencer Partnerships', interest: 82, change: '+45%', spark: getTrendSparkline() },
      { topic: 'User-Generated Content', interest: 79, change: '+38%', spark: getTrendSparkline() },
      { topic: 'Live Commerce', interest: 76, change: '+92%', spark: getTrendSparkline() },
      { topic: 'Sustainable Marketing', interest: 71, change: '+28%', spark: getTrendSparkline() }
    ],
    'photography': [
      { topic: 'Drone Photography', interest: 92, change: '+110%', spark: getTrendSparkline() },
      { topic: 'AI Photo Editing', interest: 89, change: '+195%', spark: getTrendSparkline() },
      { topic: 'Virtual Photoshoots', interest: 84, change: '+78%', spark: getTrendSparkline() },
      { topic: '360° Photography', interest: 77, change: '+52%', spark: getTrendSparkline() },
      { topic: 'NFT Photography', interest: 73, change: '+340%', spark: getTrendSparkline() },
      { topic: 'Cinematic Photography', interest: 69, change: '+41%', spark: getTrendSparkline() }
    ],
    'fitness': [
      { topic: 'Home Workout Equipment', interest: 94, change: '+68%', spark: getTrendSparkline() },
      { topic: 'Virtual Fitness Classes', interest: 87, change: '+145%', spark: getTrendSparkline() },
      { topic: 'Wearable Tech', interest: 85, change: '+52%', spark: getTrendSparkline() },
      { topic: 'Recovery Tools', interest: 81, change: '+73%', spark: getTrendSparkline() },
      { topic: 'Outdoor Fitness', interest: 78, change: '+91%', spark: getTrendSparkline() },
      { topic: 'Mindful Movement', interest: 74, change: '+65%', spark: getTrendSparkline() }
    ],
    'restaurant': [
      { topic: 'Ghost Kitchens', interest: 91, change: '+180%', spark: getTrendSparkline() },
      { topic: 'Plant-Based Menus', interest: 88, change: '+95%', spark: getTrendSparkline() },
      { topic: 'QR Code Menus', interest: 86, change: '+240%', spark: getTrendSparkline() },
      { topic: 'Local Sourcing', interest: 83, change: '+67%', spark: getTrendSparkline() },
      { topic: 'Meal Subscriptions', interest: 79, change: '+112%', spark: getTrendSparkline() },
      { topic: 'Instagram-worthy Dishes', interest: 75, change: '+58%', spark: getTrendSparkline() }
    ],
    'default': [
      { topic: 'Artificial Intelligence', interest: 96, change: '+185%', spark: getTrendSparkline() },
      { topic: 'Sustainability', interest: 89, change: '+72%', spark: getTrendSparkline() },
      { topic: 'Remote Work', interest: 84, change: '+45%', spark: getTrendSparkline() },
      { topic: 'Mental Health', interest: 81, change: '+93%', spark: getTrendSparkline() },
      { topic: 'Cryptocurrency', interest: 77, change: '+210%', spark: getTrendSparkline() },
      { topic: 'Creator Economy', interest: 74, change: '+156%', spark: getTrendSparkline() }
    ]
  };

  // Get topics based on category or default
  let topics = baseTopics[category?.toLowerCase()] || baseTopics['default'];
  
  // Add location-specific modifier if geo is provided
  if (geo && geo !== 'US') {
    topics = topics.map(t => ({
      ...t,
      interest: Math.max(20, t.interest - Math.floor(Math.random() * 15))
    }));
  }

  // Add time-based variations
  const now = new Date();
  const hour = now.getHours();
  
  // Boost certain topics based on time of day
  if (hour >= 6 && hour <= 9) {
    // Morning boost for productivity topics
    topics = topics.map(t => ({
      ...t,
      interest: t.topic.includes('Workout') || t.topic.includes('Mental') ? 
        Math.min(100, t.interest + 10) : t.interest
    }));
  } else if (hour >= 18 && hour <= 22) {
    // Evening boost for entertainment topics
    topics = topics.map(t => ({
      ...t,
      interest: t.topic.includes('Video') || t.topic.includes('Content') ? 
        Math.min(100, t.interest + 8) : t.interest
    }));
  }

  return topics.sort((a, b) => b.interest - a.interest);
}

// Generate related queries
async function generateRelatedQueries(category) {
  const queries = {
    'marketing': [
      'how to go viral on tiktok',
      'best time to post on instagram',
      'social media calendar template',
      'influencer marketing roi',
      'content creation tools',
      'brand storytelling examples'
    ],
    'photography': [
      'best camera settings for portraits',
      'photography lighting techniques',
      'photo editing apps 2025',
      'how to shoot product photography',
      'drone photography laws',
      'photography pricing guide'
    ],
    'fitness': [
      'home gym setup ideas',
      'best workout apps 2025',
      'how to track fitness progress',
      'nutrition for muscle gain',
      'yoga for beginners',
      'recovery day activities'
    ],
    'restaurant': [
      'restaurant marketing ideas',
      'how to increase restaurant sales',
      'food photography tips',
      'restaurant social media strategy',
      'menu design trends',
      'customer retention strategies'
    ],
    'default': [
      'trending on social media',
      'viral content ideas',
      'how to grow followers',
      'content strategy template',
      'social media analytics',
      'engagement rate calculator'
    ]
  };

  return queries[category?.toLowerCase()] || queries['default'];
}

// Generate rising searches
async function generateRisingSearches(category) {
  const risingTerms = {
    'marketing': [
      { term: 'AI copywriting tools', growth: 'Breakout', volume: '12K' },
      { term: 'TikTok SEO', growth: '+850%', volume: '8.5K' },
      { term: 'LinkedIn creator mode', growth: '+420%', volume: '5.2K' },
      { term: 'Instagram Threads marketing', growth: '+750%', volume: '9.1K' },
      { term: 'Voice search optimization', growth: '+380%', volume: '3.7K' }
    ],
    'photography': [
      { term: 'AI image generation', growth: 'Breakout', volume: '45K' },
      { term: 'Mirrorless vs DSLR 2025', growth: '+290%', volume: '7.8K' },
      { term: 'Photography NFT marketplace', growth: '+680%', volume: '4.3K' },
      { term: 'Virtual reality photography', growth: '+450%', volume: '2.9K' },
      { term: 'Smartphone photography course', growth: '+320%', volume: '11K' }
    ],
    'fitness': [
      { term: 'Hybrid fitness model', growth: 'Breakout', volume: '6.7K' },
      { term: 'Fitness metaverse', growth: '+920%', volume: '3.2K' },
      { term: 'AI personal trainer', growth: '+580%', volume: '8.9K' },
      { term: 'Biohacking supplements', growth: '+410%', volume: '15K' },
      { term: 'Functional fitness equipment', growth: '+350%', volume: '9.4K' }
    ],
    'restaurant': [
      { term: 'Robot food delivery', growth: 'Breakout', volume: '7.3K' },
      { term: 'Sustainable packaging', growth: '+480%', volume: '12K' },
      { term: 'Virtual restaurant concept', growth: '+720%', volume: '4.8K' },
      { term: 'Food NFT', growth: '+1100%', volume: '2.1K' },
      { term: 'AI menu optimization', growth: '+390%', volume: '3.6K' }
    ],
    'default': [
      { term: 'ChatGPT alternatives', growth: 'Breakout', volume: '89K' },
      { term: 'Threads app', growth: '+2400%', volume: '156K' },
      { term: 'AI art generator', growth: '+850%', volume: '67K' },
      { term: 'Sustainable living', growth: '+340%', volume: '34K' },
      { term: 'Side hustle ideas 2025', growth: '+290%', volume: '28K' }
    ]
  };

  return risingTerms[category?.toLowerCase()] || risingTerms['default'];
}

// Generate seasonal trends
async function generateSeasonalTrends(category) {
  const month = new Date().getMonth();
  const season = month >= 2 && month <= 4 ? 'spring' :
                 month >= 5 && month <= 7 ? 'summer' :
                 month >= 8 && month <= 10 ? 'fall' : 'winter';
  
  const seasonalData = {
    'spring': {
      peak: 'March - May',
      topics: ['Spring cleaning', 'Outdoor activities', 'Easter marketing', 'Graduation photos'],
      opportunity: 'Focus on renewal, fresh starts, and outdoor content'
    },
    'summer': {
      peak: 'June - August',
      topics: ['Summer travel', 'Beach photography', 'Outdoor dining', 'Festival season'],
      opportunity: 'Leverage vacation content and outdoor experiences'
    },
    'fall': {
      peak: 'September - November',
      topics: ['Back to school', 'Fall fashion', 'Halloween content', 'Black Friday prep'],
      opportunity: 'Target seasonal transitions and holiday preparations'
    },
    'winter': {
      peak: 'December - February',
      topics: ['Holiday marketing', 'New Year goals', 'Winter sports', 'Valentine\'s Day'],
      opportunity: 'Capitalize on holiday seasons and resolution-setting'
    }
  };

  return {
    currentSeason: season,
    ...seasonalData[season],
    upcomingTrends: getUpcomingTrends(season)
  };
}

// Helper function to generate sparkline data
function getTrendSparkline() {
  const points = [];
  let value = Math.random() * 30 + 20;
  
  for (let i = 0; i < 7; i++) {
    value += (Math.random() - 0.3) * 15;
    value = Math.max(10, Math.min(100, value));
    points.push(Math.round(value));
  }
  
  // Ensure upward trend for last 2 points
  points[5] = Math.max(points[5], points[4] + 5);
  points[6] = Math.max(points[6], points[5] + 8);
  
  return points;
}

// Get upcoming trends based on season
function getUpcomingTrends(currentSeason) {
  const nextSeason = {
    'spring': 'summer',
    'summer': 'fall',
    'fall': 'winter',
    'winter': 'spring'
  };
  
  const upcomingTopics = {
    'summer': ['Beach content', 'Travel photography', 'Outdoor events'],
    'fall': ['Cozy content', 'Thanksgiving prep', 'Black Friday'],
    'winter': ['Holiday campaigns', 'Year-end reviews', 'New Year planning'],
    'spring': ['Spring fashion', 'Outdoor reopening', 'Easter campaigns']
  };
  
  return upcomingTopics[nextSeason[currentSeason]];
}