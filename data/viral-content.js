// Niche-specific viral content templates with real examples
const viralContentTemplates = {
  fitness: [
    {
      id: 'fit1',
      title: '75 Hard Challenge Transformation - Day 1 vs Day 75',
      description: 'Incredible mental and physical transformation after completing the 75 Hard challenge. Lost 30lbs and gained unstoppable confidence.',
      platform: 'TikTok',
      contentType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      metrics: {
        views: 2450000,
        likes: 385000,
        comments: 12500,
        shares: 45000
      },
      author: '@fitnessjourneymax',
      sourceUrl: 'https://www.tiktok.com/@example/video/example',
      viralFactors: [
        'Before/after transformation',
        'Relatable struggle story',
        'Trending 75 Hard challenge',
        'Motivational soundtrack'
      ]
    },
    {
      id: 'fit2',
      title: '5-Minute Morning Routine That Changed My Life',
      description: 'Simple morning stretches and breathing exercises that boosted my energy and eliminated back pain. No equipment needed!',
      platform: 'Instagram',
      contentType: 'carousel',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
      metrics: {
        views: 890000,
        likes: 125000,
        comments: 8900,
        shares: 23000
      },
      author: '@wellnesswarrior',
      sourceUrl: 'https://www.instagram.com/p/example',
      viralFactors: [
        'Quick and accessible',
        'No equipment needed',
        'Solves common problem',
        'Step-by-step guide format'
      ]
    },
    {
      id: 'fit3',
      title: 'Gym Anxiety? Watch This First-Timer\'s Journey',
      description: 'From being scared to enter the gym to deadlifting 200lbs in 6 months. If I can do it, so can you!',
      platform: 'YouTube',
      contentType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600',
      metrics: {
        views: 1250000,
        likes: 89000,
        comments: 5600,
        shares: 12000
      },
      author: 'GymBeginnerGuide',
      sourceUrl: 'https://www.youtube.com/watch?v=example',
      viralFactors: [
        'Addresses common fear',
        'Authentic vulnerability',
        'Progressive journey documentation',
        'Beginner-friendly content'
      ]
    },
    {
      id: 'fit4',
      title: 'Meal Prep Sunday: 5 High-Protein Recipes Under $20',
      description: 'Budget-friendly meal prep that helped me lose 15lbs in 2 months. Full recipes and shopping list included!',
      platform: 'Instagram',
      contentType: 'reel',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
      metrics: {
        views: 675000,
        likes: 98000,
        comments: 4300,
        shares: 18000
      },
      author: '@mealprepmasters',
      sourceUrl: 'https://www.instagram.com/reel/example',
      viralFactors: [
        'Budget-conscious content',
        'Practical and actionable',
        'Satisfying time-lapse footage',
        'Saves recipe for later'
      ]
    },
    {
      id: 'fit5',
      title: 'Physical Therapist Ranks Viral Fitness Trends',
      description: 'Licensed PT reviews and rates popular TikTok exercises. Some of these could seriously hurt you!',
      platform: 'TikTok',
      contentType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',
      metrics: {
        views: 3100000,
        likes: 420000,
        comments: 28000,
        shares: 65000
      },
      author: '@ptexplains',
      sourceUrl: 'https://www.tiktok.com/@example/video/example2',
      viralFactors: [
        'Expert credibility',
        'Debunking myths',
        'Educational content',
        'Controversy and debate'
      ]
    }
  ],
  
  photography: [
    {
      id: 'photo1',
      title: 'iPhone vs $10,000 Camera - Can You Tell?',
      description: 'Professional photographer compares iPhone 15 Pro to high-end DSLR. The results will shock you!',
      platform: 'YouTube',
      contentType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',
      metrics: {
        views: 4200000,
        likes: 298000,
        comments: 15600,
        shares: 45000
      },
      author: 'PhotoGearReviews',
      sourceUrl: 'https://www.youtube.com/watch?v=example',
      viralFactors: [
        'David vs Goliath comparison',
        'Surprising results',
        'Accessible to all skill levels',
        'Debunks expensive gear myth'
      ]
    },
    {
      id: 'photo2',
      title: 'Golden Hour Portrait Tricks That Went Viral',
      description: 'Simple techniques using just natural light and a $5 reflector. These portraits got me 10K new followers!',
      platform: 'Instagram',
      contentType: 'carousel',
      thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
      metrics: {
        views: 560000,
        likes: 78000,
        comments: 3200,
        shares: 12000
      },
      author: '@goldenhourmagic',
      sourceUrl: 'https://www.instagram.com/p/example',
      viralFactors: [
        'Budget-friendly tips',
        'Stunning visual results',
        'Step-by-step tutorial',
        'Repeatable technique'
      ]
    },
    {
      id: 'photo3',
      title: 'Abandoned Places Photography - Legal & Safe Guide',
      description: 'How to explore and photograph abandoned locations legally. Plus my scariest encounter!',
      platform: 'TikTok',
      contentType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1515266591878-f93e32bc5937?w=600',
      metrics: {
        views: 2800000,
        likes: 345000,
        comments: 18900,
        shares: 52000
      },
      author: '@urbanexplorer',
      sourceUrl: 'https://www.tiktok.com/@example/video/example',
      viralFactors: [
        'Adventure and danger element',
        'Unique niche content',
        'Educational safety tips',
        'Storytelling with suspense'
      ]
    }
  ],
  
  restaurant: [
    {
      id: 'rest1',
      title: 'We Turned Our Food Truck Into a $2M Restaurant',
      description: 'From serving 50 customers a day to 500. Here\'s exactly how we scaled our small food business.',
      platform: 'LinkedIn',
      contentType: 'article',
      thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      metrics: {
        views: 125000,
        likes: 8900,
        comments: 450,
        shares: 2100
      },
      author: 'Sarah Chen',
      sourceUrl: 'https://www.linkedin.com/pulse/example',
      viralFactors: [
        'Inspiring success story',
        'Specific actionable advice',
        'Relatable small business journey',
        'Data-driven insights'
      ]
    },
    {
      id: 'rest2',
      title: 'Behind the Scenes: Michelin Star Kitchen Rush Hour',
      description: 'POV: You\'re working in a Michelin-starred kitchen during the dinner rush. The coordination is insane!',
      platform: 'TikTok',
      contentType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
      metrics: {
        views: 5600000,
        likes: 890000,
        comments: 34000,
        shares: 125000
      },
      author: '@cheflife',
      sourceUrl: 'https://www.tiktok.com/@example/video/example',
      viralFactors: [
        'Exclusive behind-scenes access',
        'Fast-paced exciting content',
        'Professional excellence',
        'Satisfying coordination'
      ]
    }
  ],
  
  marketing: [
    {
      id: 'mkt1',
      title: '$0 to $100K with Organic Social Media in 90 Days',
      description: 'No ads, no influencers, just strategic content. Here\'s the exact playbook I used.',
      platform: 'LinkedIn',
      contentType: 'document',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
      metrics: {
        views: 340000,
        likes: 45000,
        comments: 2800,
        shares: 12000
      },
      author: 'Digital Marketing Pro',
      sourceUrl: 'https://www.linkedin.com/posts/example',
      viralFactors: [
        'Impressive results claim',
        'Free strategy (no paid ads)',
        'Specific timeline',
        'Downloadable resource'
      ]
    }
  ],
  
  // Default/generic content for unmatched niches
  default: [
    {
      id: 'def1',
      title: 'This Simple Hack Changed Everything',
      description: 'A productivity technique that takes 2 minutes but saves hours every week.',
      platform: 'Instagram',
      contentType: 'reel',
      thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600',
      metrics: {
        views: 780000,
        likes: 92000,
        comments: 3400,
        shares: 15000
      },
      author: '@productivityhacks',
      sourceUrl: 'https://www.instagram.com/reel/example',
      viralFactors: [
        'Quick win promise',
        'Minimal time investment',
        'Universal application',
        'Shareworthy tip'
      ]
    }
  ]
};

// Function to get viral content based on niche
async function getViralContent(niche, platform, timeRange) {
  const nicheLower = niche ? niche.toLowerCase() : 'default';
  
  // Find matching content or use default
  let content = viralContentTemplates[nicheLower] || viralContentTemplates.default;
  
  // If specific platform requested, filter by platform
  if (platform && platform !== 'all') {
    content = content.filter(item => 
      item.platform.toLowerCase() === platform.toLowerCase()
    );
    
    // If no platform matches, return mixed content
    if (content.length === 0) {
      content = viralContentTemplates[nicheLower] || viralContentTemplates.default;
    }
  }
  
  // Add analysis suggestions to each piece of content
  return content.map(item => ({
    ...item,
    analysis: {
      whyViral: item.viralFactors.join('. '),
      shootIdeas: generateShootIdeas(item.contentType, nicheLower),
      prOutline: generatePRStrategy(nicheLower, item.platform),
      keyTakeaways: [
        'Authenticity resonates with audience',
        'Clear value proposition in title',
        'Visual storytelling drives engagement',
        'Platform-specific optimization'
      ]
    },
    engagementRate: calculateEngagementRate(item.metrics)
  }));
}

// Generate shoot ideas based on content type and niche
function generateShootIdeas(contentType, niche) {
  const baseIdeas = {
    video: [
      'Use stabilizer or gimbal for smooth footage',
      'Film during golden hour for best lighting',
      'Capture multiple angles for dynamic editing',
      'Record room tone for better audio',
      'Shoot in 4K for flexibility in post'
    ],
    carousel: [
      'Maintain consistent color grading',
      'Use the same location/background',
      'Create a visual story arc',
      'Include text overlays for context',
      'End with a strong CTA slide'
    ],
    reel: [
      'Hook viewers in first 3 seconds',
      'Use trending audio strategically',
      'Quick cuts to maintain attention',
      'Film vertically for full-screen',
      'Add captions for silent viewing'
    ],
    image: [
      'Rule of thirds composition',
      'Focus on one clear subject',
      'Use negative space effectively',
      'Ensure sharp focus on key element',
      'Color grade for platform aesthetic'
    ]
  };
  
  return baseIdeas[contentType] || baseIdeas.video;
}

// Generate PR strategy based on niche and platform
function generatePRStrategy(niche, platform) {
  return [
    `Identify key ${niche} influencers on ${platform}`,
    'Create press kit with high-res assets',
    'Develop unique angle for media pitch',
    'Build relationships with niche publications',
    'Leverage user testimonials and case studies'
  ];
}

// Calculate engagement rate
function calculateEngagementRate(metrics) {
  const totalEngagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
  const rate = metrics.views ? (totalEngagement / metrics.views * 100) : 0;
  return rate.toFixed(2) + '%';
}

module.exports = {
  getViralContent,
  viralContentTemplates
};