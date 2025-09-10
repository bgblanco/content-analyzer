# Content Analyzer Production Setup Guide

## Current Status

The application has been upgraded with the following features:
- ✅ Apify integration structure (requires configuration)
- ✅ Enhanced AI suggestions with detailed prompts
- ✅ Animations library with real Lottie files
- ✅ Error handling and demo mode
- ⚠️ Apify actors need proper IDs/permissions
- ⚠️ AI providers need API keys

## Required Setup

### 1. Apify Configuration

Your current Apify token appears to have permission issues. You need to:

#### Option A: Use Free Apify Actors
1. Go to [Apify Store](https://apify.com/store)
2. Find free actors for:
   - TikTok: Search for "TikTok Scraper" 
   - Instagram: Search for "Instagram Scraper"
   - YouTube: Search for "YouTube Scraper"
3. Get the actor IDs (format: `username~actor-name`)
4. Update `netlify/functions/fetch-viral.js` with correct actor IDs

#### Option B: Create Your Own Actors
1. Build custom actors on Apify platform
2. Use your actor IDs in the configuration
3. Ensure your token has permissions for these actors

#### Option C: Upgrade Apify Plan
1. Check if your current plan supports the actors you're trying to use
2. Consider upgrading for more API calls and actor access

### 2. Environment Variables

Create a `.env` file with:
```env
# Apify (Required for real viral content)
APIFY_TOKEN=your_token_here

# Optional: Specific task IDs for better performance
APIFY_TIKTOK_TASK_ID=your_task_id
APIFY_INSTAGRAM_TASK_ID=your_task_id  
APIFY_YOUTUBE_TASK_ID=your_task_id

# AI Providers (At least one required)
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_API_KEY=your_key  # For Gemini
GROK_API_KEY=your_key
```

### 3. Netlify Deployment

Set environment variables in Netlify dashboard:
1. Go to Site Settings > Environment Variables
2. Add all the keys from `.env`
3. Deploy the site

## Known Issues & Solutions

### Issue 1: Apify "insufficient-permissions" Error
**Cause**: Token doesn't have access to the specified actors
**Solution**: 
- Use free/public actors instead
- Create your own actors
- Upgrade Apify plan

### Issue 2: AI Suggestions "Unexpected token '<'" Error  
**Cause**: API endpoint returning HTML instead of JSON
**Solution**: 
- Ensure Netlify functions are deployed
- Check that AI API keys are configured
- Verify endpoint URLs are correct

### Issue 3: Generic Content Instead of Real Data
**Cause**: Apify integration failing, falling back to demo
**Solution**: 
- Configure proper Apify actors
- The app now shows "[DEMO]" tag when using fallback data

## How to Enable Real Apify Integration

1. **Find Working Actors**:
   ```javascript
   // In netlify/functions/fetch-viral.js
   const platformConfig = {
     tiktok: {
       actorId: 'clockworks~tiktok-scraper', // Replace with working actor
       // ...
     }
   }
   ```

2. **Test with Apify Console**:
   - Go to https://console.apify.com
   - Test your token with different actors
   - Find actors that work with your plan

3. **Update Configuration**:
   - Use actor IDs that work with your token
   - Or create custom tasks and use task IDs

## Running Locally

```bash
# Install dependencies
npm install

# Create .env file with your keys
cp .env.example .env
# Edit .env with your actual keys

# Run with Netlify Dev
npm run netlify-dev

# Access at http://localhost:8888
```

## Demo Mode

Currently, the app runs in demo mode:
- Shows sample viral content with "[DEMO]" tags
- Animations work with real Lottie files
- AI suggestions require at least one AI API key

## Next Steps

1. **Configure Apify Properly**:
   - Find actors compatible with your token
   - Or upgrade to a plan that supports needed actors

2. **Add AI API Keys**:
   - Get at least one AI provider key
   - OpenAI is recommended for best results

3. **Test Each Feature**:
   - Viral Explorer: Should show real data when Apify works
   - AI Suggestions: Needs AI API keys
   - Animations: Should work immediately

## Support

For Apify issues:
- Check actor documentation
- Verify token permissions
- Consider using Apify's support

For deployment issues:
- Check Netlify function logs
- Verify environment variables
- Ensure all dependencies are installed