# Content Analyzer - Viral Content Analysis & Shoot Planning Tool

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/content-analyzer/deploys)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive social media content analysis platform that helps businesses and content creators identify viral content patterns, generate photography shoot ideas, and develop PR strategies.

![Content Analyzer](assets/screenshot.png)

## 🚀 Features

### Multi-Platform Content Analysis
- **YouTube** - Analyze viral videos and trends
- **TikTok** - Discover trending content and challenges
- **Instagram** - Track popular posts and reels (coming soon)
- **LinkedIn** - Monitor professional content engagement (coming soon)
- **Multi-Platform Support** - Aggregate content from all major platforms

### AI-Powered Analysis
- **Multiple AI Providers**: OpenAI, Anthropic Claude, Google Gemini, xAI Grok
- **Viral Pattern Detection**: Understand why content goes viral
- **Shoot Recommendations**: Detailed photography and videography suggestions
- **PR Strategy Generation**: Step-by-step campaign outlines

### Enhanced Features
- **Lottie Animations**: Visual previews of shoot techniques
- **Response Enhancement**: Detailed technical specifications for shoots
- **Export Functionality**: Download shoot plans and PR strategies
- **Save & Organize**: Build your content inspiration library

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Netlify CLI (optional, for local development)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/bgblanco/content-analyzer.git
cd content-analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Run locally**
```bash
npm start
# or
netlify dev
```

The app will be available at `http://localhost:8888`

## 🔑 API Configuration

### Required API Keys

#### Social Media Platforms
- **YouTube**: [Get API Key](https://developers.google.com/youtube/v3/getting-started)
- **TikTok**: [RapidAPI Key](https://rapidapi.com/tikapi-tikapi-default/api/tiktok-api6)
- **Instagram**: [Graph API Access](https://developers.facebook.com/docs/instagram-api)
- **LinkedIn**: [Developer Access](https://www.linkedin.com/developers/)

#### AI Providers
- **OpenAI**: [API Keys](https://platform.openai.com/api-keys)
- **Anthropic**: [Console](https://console.anthropic.com/)
- **Google Gemini**: [AI Studio](https://makersuite.google.com/app/apikey)
- **xAI Grok**: [Developer Portal](https://x.ai/api)

### Setting Environment Variables

#### Local Development
Create a `.env` file in the root directory:
```env
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
# Add other keys as needed
```

#### Netlify Production
1. Go to your Netlify dashboard
2. Navigate to Site Settings → Environment Variables
3. Add each API key as a new variable
4. Redeploy your site

## 🚀 Deployment

### Deploy to Netlify

#### Option 1: One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/bgblanco/content-analyzer)

#### Option 2: Manual Deploy
1. Fork this repository
2. Connect to Netlify:
   - Log in to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your forked repository
   - Configure build settings (automatic)
   - Add environment variables
   - Deploy!

#### Option 3: CLI Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Custom Domain
1. In Netlify dashboard, go to Domain Settings
2. Add your custom domain
3. Configure DNS settings
4. Enable HTTPS (automatic)

## 📁 Project Structure

```
content-analyzer/
├── index.html              # Main application HTML
├── css/
│   └── styles.css         # Enhanced styling
├── js/
│   ├── app.js            # Main application logic
│   └── enhancer.js       # Response enhancement engine
├── netlify/
│   └── functions/
│       ├── fetch-viral.js # Viral content fetching
│       └── analyze.js     # AI analysis endpoint
├── assets/
│   ├── animations/       # Lottie animation files
│   └── placeholder.svg   # Fallback images
├── package.json          # Dependencies
├── netlify.toml          # Netlify configuration
├── .env.example          # Environment template
└── README.md            # Documentation
```

## 🎯 Usage Guide

### Basic Workflow

1. **Enter Your Niche**
   - Type your industry or content topic
   - Select platform (YouTube, TikTok, etc.)
   - Choose time range and filters

2. **Analyze Content**
   - Click "Analyze Viral Content"
   - Wait for AI analysis
   - Review results

3. **Review Insights**
   - **Why It's Viral**: Understand viral factors
   - **Shoot Ideas**: Get 5 detailed shoot concepts
   - **PR Strategy**: Follow step-by-step campaign

4. **Export & Save**
   - Save ideas to your library
   - Export shoot plans as text files
   - Share with your team

### Advanced Features

#### AI Provider Selection
Choose your preferred AI provider in settings:
- OpenAI GPT-4 (recommended for quality)
- Anthropic Claude (best for creative ideas)
- Google Gemini (fast and efficient)
- xAI Grok (good for trending topics)

#### Animation Previews
Click "Preview Animation" on shoot ideas to see:
- Professional camera movements
- Composition techniques
- Lighting setups

## 🛠 Development

### Local Development
```bash
# Start development server
npm start

# Run with Netlify CLI
netlify dev

# Build for production
npm run build
```

### Adding New Features

#### Add a New Social Platform
1. Create fetcher in `netlify/functions/fetch-viral.js`
2. Add platform option in HTML
3. Update `fetchViralContent()` in `app.js`

#### Add a New AI Provider
1. Add integration in `netlify/functions/analyze.js`
2. Update provider selector in UI
3. Add API key to environment variables

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lottie](https://lottiefiles.com/) for animations
- [Netlify](https://www.netlify.com/) for hosting
- All API providers for their services

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/bgblanco/content-analyzer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bgblanco/content-analyzer/discussions)
- **Email**: support@sentinelpeaksolutions.com

## 🗺 Roadmap

- [ ] Instagram Reels integration
- [ ] LinkedIn native API
- [ ] Batch analysis mode
- [ ] Team collaboration features
- [ ] Analytics dashboard
- [ ] Chrome extension
- [ ] Mobile app

---

Built with ❤️ by [Sentinel Peak Solutions](https://sentinelpeaksolutions.com)