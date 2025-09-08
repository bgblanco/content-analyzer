const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Import data handlers
const { getViralContent } = require('./data/viral-content');
const { getTrendingTopics } = require('./data/trending-topics');
const { getCompetitorData } = require('./data/competitor-data');

// API Routes
app.post('/api/fetch-viral', async (req, res) => {
  try {
    const { niche, platform, timeRange } = req.body;
    const results = await getViralContent(niche, platform, timeRange);
    res.json({
      success: true,
      platform,
      niche,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error fetching viral content:', error);
    res.status(500).json({ error: 'Failed to fetch viral content' });
  }
});

app.post('/api/google-trends', async (req, res) => {
  try {
    const { category, geo, timeframe } = req.body;
    const data = await getTrendingTopics(category, geo, timeframe);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

app.post('/api/competitor-analysis', async (req, res) => {
  try {
    const { username, platform, analysisType } = req.body;
    const data = await getCompetitorData(username, platform, analysisType);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      competitor: username,
      data
    });
  } catch (error) {
    console.error('Error analyzing competitor:', error);
    res.status(500).json({ error: 'Failed to analyze competitor' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { posts, provider, analysisType } = req.body;
    
    // Enhanced analysis for each post
    const results = posts.map(post => ({
      ...post,
      analysis: {
        whyViral: 'High engagement through authentic storytelling and trending audio',
        shootIdeas: [
          'Use natural lighting during golden hour',
          'Capture candid moments and reactions',
          'Include before/after transformation shots',
          'Show behind-the-scenes process',
          'Focus on emotional expressions'
        ],
        prOutline: [
          'Create press release highlighting unique angle',
          'Reach out to niche-specific media outlets',
          'Build social media campaign with hashtag strategy',
          'Partner with micro-influencers in the space'
        ],
        keyTakeaways: [
          'Authenticity drives higher engagement',
          'User-generated content builds trust',
          'Timing with trends is crucial',
          'Visual storytelling is key'
        ]
      }
    }));
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Sentinel Peak Solutions Content Analyzer running on http://localhost:${PORT}`);
  console.log('📊 API endpoints available at /api/*');
});