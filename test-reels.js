const fetch = require('node-fetch');

async function testInstagramReels() {
  console.log('Testing Instagram Reels API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/.netlify/functions/instagram-reels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: 'natgeo',
        limit: 5,
        includeSharesCount: false,
        filterAIContent: false
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Retrieved', data.count, 'reels');
      console.log('\nFirst reel details:');
      if (data.reels && data.reels[0]) {
        const reel = data.reels[0];
        console.log('- Username:', reel.username);
        console.log('- Caption:', reel.caption?.substring(0, 100) + '...');
        console.log('- Likes:', reel.metrics.likes);
        console.log('- Views:', reel.metrics.views);
        console.log('- Video URL:', reel.videoUrl ? 'Available' : 'Not available');
      }
      console.log('\nIs Demo:', data.isDemo || false);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('Failed to test:', error.message);
  }
}

testInstagramReels();