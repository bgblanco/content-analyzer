// Trending topics data based on category and region
const trendingData = {
  marketing: {
    trendingTopics: [
      { topic: 'AI Content Creation', interest: 95, change: '+125%', spark: [45, 52, 58, 65, 72, 85, 95] },
      { topic: 'Short-form Video Strategy', interest: 88, change: '+85%', spark: [55, 60, 62, 68, 75, 82, 88] },
      { topic: 'Influencer Partnerships', interest: 82, change: '+45%', spark: [60, 62, 65, 70, 75, 78, 82] },
      { topic: 'User-Generated Content', interest: 79, change: '+38%', spark: [58, 60, 65, 68, 72, 75, 79] },
      { topic: 'Live Commerce', interest: 76, change: '+92%', spark: [40, 45, 52, 58, 65, 70, 76] },
      { topic: 'Sustainable Marketing', interest: 71, change: '+28%', spark: [55, 58, 60, 62, 65, 68, 71] }
    ],
    relatedQueries: [
      'how to go viral on tiktok 2024',
      'best time to post on instagram',
      'social media calendar template',
      'influencer marketing roi calculator',
      'content creation tools free',
      'brand storytelling examples'
    ],
    risingSearches: [
      { term: 'AI copywriting tools', growth: 'Breakout', volume: '12K' },
      { term: 'TikTok SEO optimization', growth: '+850%', volume: '8.5K' },
      { term: 'LinkedIn creator mode', growth: '+420%', volume: '5.2K' },
      { term: 'Instagram Threads marketing', growth: '+750%', volume: '9.1K' },
      { term: 'Voice search optimization', growth: '+380%', volume: '3.7K' }
    ]
  },
  
  photography: {
    trendingTopics: [
      { topic: 'Drone Photography Laws 2024', interest: 92, change: '+110%', spark: [45, 55, 65, 72, 78, 85, 92] },
      { topic: 'AI Photo Enhancement', interest: 89, change: '+195%', spark: [35, 45, 55, 65, 75, 82, 89] },
      { topic: 'Virtual Photoshoots', interest: 84, change: '+78%', spark: [48, 52, 58, 65, 72, 78, 84] },
      { topic: '360° Photography', interest: 77, change: '+52%', spark: [50, 55, 58, 62, 68, 72, 77] },
      { topic: 'Photography NFTs', interest: 73, change: '+340%', spark: [20, 30, 40, 50, 60, 68, 73] },
      { topic: 'Cinematic Photography', interest: 69, change: '+41%', spark: [48, 52, 55, 58, 62, 65, 69] }
    ],
    relatedQueries: [
      'best camera settings for portraits',
      'photography lighting techniques',
      'photo editing apps 2024',
      'how to shoot product photography',
      'drone photography tips',
      'photography pricing calculator'
    ],
    risingSearches: [
      { term: 'AI image generation midjourney', growth: 'Breakout', volume: '45K' },
      { term: 'Mirrorless vs DSLR 2024', growth: '+290%', volume: '7.8K' },
      { term: 'Photography NFT marketplace', growth: '+680%', volume: '4.3K' },
      { term: 'Virtual reality photography', growth: '+450%', volume: '2.9K' },
      { term: 'Smartphone photography course', growth: '+320%', volume: '11K' }
    ]
  },
  
  fitness: {
    trendingTopics: [
      { topic: 'Home Workout Equipment', interest: 94, change: '+68%', spark: [65, 70, 75, 80, 85, 90, 94] },
      { topic: 'Virtual Fitness Classes', interest: 87, change: '+145%', spark: [45, 55, 60, 68, 75, 82, 87] },
      { topic: 'Fitness Wearables 2024', interest: 85, change: '+52%', spark: [60, 62, 68, 72, 78, 82, 85] },
      { topic: 'Recovery Tools', interest: 81, change: '+73%', spark: [50, 55, 60, 65, 72, 78, 81] },
      { topic: 'Outdoor Fitness Trends', interest: 78, change: '+91%', spark: [42, 48, 55, 62, 68, 74, 78] },
      { topic: 'Mindful Movement', interest: 74, change: '+65%', spark: [45, 50, 55, 60, 65, 70, 74] }
    ],
    relatedQueries: [
      'home gym setup ideas 2024',
      'best workout apps free',
      'how to track fitness progress',
      'protein calculator for muscle gain',
      'yoga for beginners at home',
      'recovery day workout routine'
    ],
    risingSearches: [
      { term: 'Hybrid fitness model', growth: 'Breakout', volume: '6.7K' },
      { term: 'Fitness metaverse', growth: '+920%', volume: '3.2K' },
      { term: 'AI personal trainer app', growth: '+580%', volume: '8.9K' },
      { term: 'Biohacking supplements', growth: '+410%', volume: '15K' },
      { term: 'Functional fitness equipment', growth: '+350%', volume: '9.4K' }
    ]
  },
  
  restaurant: {
    trendingTopics: [
      { topic: 'Ghost Kitchens', interest: 91, change: '+180%', spark: [40, 50, 60, 70, 78, 85, 91] },
      { topic: 'Plant-Based Menus', interest: 88, change: '+95%', spark: [55, 60, 65, 72, 78, 84, 88] },
      { topic: 'QR Code Ordering', interest: 86, change: '+240%', spark: [35, 45, 55, 65, 75, 82, 86] },
      { topic: 'Local Sourcing', interest: 83, change: '+67%', spark: [58, 62, 68, 72, 76, 80, 83] },
      { topic: 'Meal Subscriptions', interest: 79, change: '+112%', spark: [45, 50, 58, 65, 70, 75, 79] },
      { topic: 'Instagram-worthy Dishes', interest: 75, change: '+58%', spark: [52, 55, 60, 65, 68, 72, 75] }
    ],
    relatedQueries: [
      'restaurant marketing ideas 2024',
      'how to increase restaurant sales',
      'food photography tips',
      'restaurant social media strategy',
      'menu design trends 2024',
      'customer retention strategies restaurant'
    ],
    risingSearches: [
      { term: 'Robot food delivery', growth: 'Breakout', volume: '7.3K' },
      { term: 'Sustainable packaging restaurants', growth: '+480%', volume: '12K' },
      { term: 'Virtual restaurant concept', growth: '+720%', volume: '4.8K' },
      { term: 'Restaurant NFT membership', growth: '+1100%', volume: '2.1K' },
      { term: 'AI menu optimization', growth: '+390%', volume: '3.6K' }
    ]
  }
};

// Seasonal trends data
const seasonalTrends = {
  winter: {
    currentSeason: 'winter',
    peak: 'December - February',
    topics: ['Holiday marketing', 'New Year resolutions', 'Winter sports', 'Valentine\'s Day'],
    opportunity: 'Capitalize on holiday seasons and resolution-setting',
    upcomingTrends: ['Spring fashion', 'Outdoor reopening', 'Easter campaigns']
  },
  spring: {
    currentSeason: 'spring',
    peak: 'March - May',
    topics: ['Spring cleaning', 'Outdoor activities', 'Easter marketing', 'Graduation photos'],
    opportunity: 'Focus on renewal, fresh starts, and outdoor content',
    upcomingTrends: ['Summer travel', 'Beach content', 'Festival season']
  },
  summer: {
    currentSeason: 'summer',
    peak: 'June - August',
    topics: ['Summer travel', 'Beach photography', 'Outdoor dining', 'Festival season'],
    opportunity: 'Leverage vacation content and outdoor experiences',
    upcomingTrends: ['Back to school', 'Fall fashion', 'Halloween prep']
  },
  fall: {
    currentSeason: 'fall',
    peak: 'September - November',
    topics: ['Back to school', 'Fall fashion', 'Halloween content', 'Black Friday prep'],
    opportunity: 'Target seasonal transitions and holiday preparations',
    upcomingTrends: ['Holiday campaigns', 'Year-end reviews', 'New Year planning']
  }
};

// Get current season based on month
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// Main function to get trending topics
async function getTrendingTopics(category, geo, timeframe) {
  const categoryLower = category ? category.toLowerCase() : 'marketing';
  const currentSeason = getCurrentSeason();
  
  // Get base data for category or use marketing as default
  const categoryData = trendingData[categoryLower] || trendingData.marketing;
  
  // Adjust data based on geographic region
  let adjustedData = { ...categoryData };
  
  if (geo && geo !== 'US') {
    // Slightly modify interest scores for different regions
    adjustedData.trendingTopics = adjustedData.trendingTopics.map(topic => ({
      ...topic,
      interest: Math.max(20, topic.interest - Math.floor(Math.random() * 10))
    }));
  }
  
  // Add real-time variations based on timeframe
  if (timeframe === 'now' || timeframe === 'today') {
    // Add some randomization to simulate real-time changes
    adjustedData.trendingTopics = adjustedData.trendingTopics.map(topic => ({
      ...topic,
      interest: Math.min(100, topic.interest + Math.floor(Math.random() * 5 - 2))
    }));
  }
  
  return {
    trendingTopics: adjustedData.trendingTopics,
    relatedQueries: adjustedData.relatedQueries,
    risingSearches: adjustedData.risingSearches,
    seasonalTrends: seasonalTrends[currentSeason]
  };
}

module.exports = {
  getTrendingTopics,
  trendingData,
  seasonalTrends
};