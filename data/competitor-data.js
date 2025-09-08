// Competitor analysis data generator
async function getCompetitorData(username, platform, analysisType) {
  const cleanUsername = username.replace('@', '');
  const baseFollowers = Math.floor(Math.random() * 500000) + 50000;
  
  const overview = {
    profile: {
      username: cleanUsername,
      platform: platform || 'instagram',
      verified: Math.random() > 0.3,
      businessAccount: true,
      category: 'Brand/Business'
    },
    metrics: {
      followers: baseFollowers,
      following: Math.floor(baseFollowers * 0.1),
      posts: Math.floor(Math.random() * 2000) + 100,
      avgLikes: Math.floor(baseFollowers * 0.03),
      avgComments: Math.floor(baseFollowers * 0.001),
      engagementRate: ((Math.random() * 5) + 2).toFixed(2) + '%',
      growthRate: `+${Math.floor(Math.random() * 30) + 5}%`,
      reachRate: ((Math.random() * 120) + 80).toFixed(1) + '%'
    },
    recentActivity: {
      last24Hours: Math.floor(Math.random() * 3) + 1,
      last7Days: Math.floor(Math.random() * 15) + 5,
      last30Days: Math.floor(Math.random() * 45) + 20
    }
  };
  
  const contentStrategy = {
    contentMix: [
      { type: 'Photos', percentage: 45, performance: 'High', trend: 'up' },
      { type: 'Videos/Reels', percentage: 35, performance: 'Very High', trend: 'up' },
      { type: 'Carousels', percentage: 15, performance: 'Medium', trend: 'stable' },
      { type: 'Stories', percentage: 5, performance: 'High', trend: 'up' }
    ],
    topHashtags: [
      '#contentcreator', '#socialmedia', '#digitalmarketing',
      '#entrepreneur', '#business', '#growth'
    ].sort(() => Math.random() - 0.5),
    contentThemes: [
      { theme: 'Educational/How-to', frequency: 35, engagement: 'High' },
      { theme: 'Behind the Scenes', frequency: 25, engagement: 'Very High' },
      { theme: 'Product Showcase', frequency: 20, engagement: 'Medium' },
      { theme: 'User Generated', frequency: 15, engagement: 'Very High' },
      { theme: 'Promotional', frequency: 5, engagement: 'Low' }
    ],
    captionLength: {
      average: Math.floor(Math.random() * 100) + 50,
      trend: 'Longer captions (100+ words) showing better engagement'
    },
    visualStyle: {
      primaryColors: ['#4A9B9E', '#FFFFFF', '#2A2A2A'],
      consistency: 'High',
      filters: 'Minimal, natural lighting preferred',
      brandingElements: 'Logo watermark, consistent fonts'
    }
  };
  
  const performanceMetrics = {
    engagement: {
      last7Days: generateTimeSeriesData(7),
      last30Days: generateTimeSeriesData(30),
      bestPerformingDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)],
      bestPerformingTime: '7:00 PM - 9:00 PM'
    },
    reach: {
      organic: 75 + Math.floor(Math.random() * 15),
      paid: 25 - Math.floor(Math.random() * 15),
      viral: Math.floor(Math.random() * 5) + 1
    },
    audience: {
      topLocations: ['United States (35%)', 'United Kingdom (15%)', 'Canada (12%)', 'Australia (8%)'],
      ageGroups: [
        { range: '18-24', percentage: 22 },
        { range: '25-34', percentage: 38 },
        { range: '35-44', percentage: 25 },
        { range: '45+', percentage: 15 }
      ],
      gender: { male: 45, female: 55 }
    }
  };
  
  const postingPatterns = {
    frequency: {
      daily: (Math.random() * 2 + 0.5).toFixed(1),
      weekly: Math.floor(Math.random() * 10) + 5,
      monthly: Math.floor(Math.random() * 20) + 20
    },
    consistency: {
      score: Math.floor(Math.random() * 30) + 70,
      streak: Math.floor(Math.random() * 50) + 10,
      gaps: 'Occasional 1-2 day gaps, mostly consistent'
    },
    postingByDay: generatePostingByDay(),
    optimalTimes: [
      { time: '8:00 AM', engagement: 'High', reason: 'Morning commute' },
      { time: '12:00 PM', engagement: 'Very High', reason: 'Lunch break' },
      { time: '5:00 PM', engagement: 'High', reason: 'End of workday' },
      { time: '8:00 PM', engagement: 'Very High', reason: 'Evening browsing' }
    ],
    seasonality: {
      highSeason: 'Q4 (Oct-Dec)',
      lowSeason: 'Q3 (Jul-Sep)',
      trend: 'Increased activity during product launches and holidays'
    }
  };
  
  const engagementAnalysis = {
    responseTime: {
      average: '2-4 hours',
      rating: 'Good',
      improvement: 'Consider faster response during peak hours'
    },
    communityManagement: {
      repliesToComments: '78%',
      userMentions: 'Responds to 90% within 24 hours',
      userGeneratedContent: 'Regularly features UGC (2-3 times/week)'
    },
    engagementTactics: [
      { tactic: 'Questions in captions', effectiveness: 'High', frequency: '60% of posts' },
      { tactic: 'Polls/Quizzes', effectiveness: 'Very High', frequency: '20% of stories' },
      { tactic: 'Contests/Giveaways', effectiveness: 'Very High', frequency: 'Monthly' },
      { tactic: 'Behind-the-scenes', effectiveness: 'High', frequency: 'Weekly' },
      { tactic: 'User testimonials', effectiveness: 'Medium', frequency: 'Bi-weekly' }
    ],
    topPerformingContent: [
      {
        type: 'Tutorial Video',
        engagement: '8.5%',
        example: 'How-to guide with step-by-step instructions',
        likes: 12500,
        comments: 450,
        shares: 890
      },
      {
        type: 'Before/After',
        engagement: '7.2%',
        example: 'Transformation showcase',
        likes: 9800,
        comments: 320,
        shares: 567
      },
      {
        type: 'Team Introduction',
        engagement: '6.8%',
        example: 'Meet the team behind the brand',
        likes: 8200,
        comments: 280,
        shares: 423
      }
    ]
  };
  
  const recommendations = {
    immediate: [
      {
        priority: 'High',
        action: 'Increase video content to 50% of posts',
        reason: `${cleanUsername} sees 2x engagement on video vs. photos`,
        implementation: 'Start with 2-3 Reels per week, focus on tutorials'
      },
      {
        priority: 'High',
        action: 'Optimize posting times',
        reason: 'Missing peak engagement window at 8 PM',
        implementation: 'Schedule 40% of content for 7-9 PM slot'
      },
      {
        priority: 'Medium',
        action: 'Implement consistent hashtag strategy',
        reason: `${cleanUsername} uses mix of 15-20 targeted hashtags`,
        implementation: 'Create 3 hashtag sets: branded, niche, trending'
      }
    ],
    shortTerm: [
      {
        timeline: '2-4 weeks',
        action: 'Launch user-generated content campaign',
        expectedImpact: '+25% engagement, +15% reach'
      },
      {
        timeline: '1-2 weeks',
        action: 'Implement Stories strategy',
        expectedImpact: '+30% profile visits, +20% DM engagement'
      },
      {
        timeline: '3-4 weeks',
        action: 'Create content series/themes',
        expectedImpact: '+40% repeat visitors, +25% saves'
      }
    ],
    longTerm: [
      {
        timeline: '2-3 months',
        action: 'Develop influencer partnership program',
        expectedImpact: '3x reach, 2x follower growth'
      },
      {
        timeline: '1-2 months',
        action: 'Build community engagement framework',
        expectedImpact: '+50% engagement rate, +35% brand loyalty'
      }
    ],
    contentIdeas: [
      `Study ${cleanUsername}'s top performing "Day in the life" content`,
      'Weekly Q&A sessions (drives 3x normal engagement)',
      'Product tutorials with real customers',
      'Behind-the-scenes of your creative process',
      'Collaboration posts with complementary brands'
    ],
    weaknesses: [
      {
        area: 'Response time',
        opportunity: `${cleanUsername} slow to respond - be faster for competitive advantage`
      },
      {
        area: 'Weekend posting',
        opportunity: 'Low competitor activity on weekends - capture audience'
      },
      {
        area: 'Interactive content',
        opportunity: 'Limited use of polls/quizzes - high engagement opportunity'
      }
    ]
  };
  
  return {
    overview,
    contentStrategy,
    performanceMetrics,
    postingPatterns,
    engagementAnalysis,
    recommendations
  };
}

// Helper function to generate time series data
function generateTimeSeriesData(days) {
  const data = [];
  const baseValue = Math.random() * 1000 + 500;
  
  for (let i = 0; i < days; i++) {
    const variation = (Math.random() - 0.5) * 200;
    const value = Math.max(100, baseValue + variation + (i * 10));
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(value)
    });
  }
  return data;
}

// Helper function to generate posting by day data
function generatePostingByDay() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const result = {};
  
  days.forEach(day => {
    result[day] = {
      posts: Math.floor(Math.random() * 4) + 1,
      avgEngagement: Math.floor(Math.random() * 5000) + 1000
    };
  });
  
  return result;
}

module.exports = {
  getCompetitorData
};