/**
 * Content Analyzer - Main Application Logic
 * Connects to Netlify Functions for real API integration
 */

// Import the response enhancer
import('./enhancer.js').then(module => {
    window.ResponseEnhancer = module.default || module.ResponseEnhancer;
}).catch(err => {
    console.log('ResponseEnhancer not available, using basic mode');
});

// Global State Management
const AppState = {
    apiKeys: {},
    currentProvider: localStorage.getItem('aiProvider') || 'openai',
    savedIdeas: JSON.parse(localStorage.getItem('savedIdeas') || '[]'),
    stats: JSON.parse(localStorage.getItem('stats') || '{"analyzed": 0, "saved": 0, "shoots": 0, "avgEngagement": 0}'),
    isLoading: false,
    currentPlatform: 'demo',
    recentAnalysis: [],
    animationCache: new Map(),
};

// API Configuration
const API_ENDPOINTS = {
    fetchViral: '/api/fetch-viral',
    analyze: '/api/analyze',
    saveData: '/api/save-data',
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadAnimations();
});

function initializeApp() {
    updateStats();
    updateSavedCount();
    loadSavedIdeas();
    checkAPIConfiguration();
    initializeLottie();
}

// Check if running locally or on Netlify
function checkAPIConfiguration() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
        console.log('Running in local development mode');
        // Show notification to user
        showNotification('Running in demo mode. Deploy to Netlify for full functionality.', 'info');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeContent);
    }

    // Platform selector
    const platformSelect = document.getElementById('platformSelect');
    if (platformSelect) {
        platformSelect.addEventListener('change', (e) => {
            AppState.currentPlatform = e.target.value;
            updatePlatformUI(e.target.value);
        });
    }

    // AI Provider selector
    const aiProviderSelect = document.getElementById('aiProviderSelect');
    if (aiProviderSelect) {
        aiProviderSelect.addEventListener('change', (e) => {
            AppState.currentProvider = e.target.value;
            localStorage.setItem('aiProvider', e.target.value);
        });
    }

    // Export buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('export-btn')) {
            exportShootPlan(e.target.dataset.postId);
        }
        if (e.target.classList.contains('save-btn')) {
            saveIdea(e.target.dataset.postId);
        }
        if (e.target.classList.contains('preview-animation')) {
            showAnimationPreview(e.target.dataset.animation);
        }
    });
}

// Main Analysis Function
async function analyzeContent() {
    const niche = document.getElementById('nicheInput').value.trim();
    if (!niche) {
        showNotification('Please enter a niche or client industry', 'error');
        return;
    }

    const btn = document.getElementById('analyzeBtn');
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('resultsGrid');
    const emptyState = document.getElementById('emptyState');
    
    // UI State Updates
    setLoadingState(true);
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-small"></span> Analyzing...';
    
    try {
        // Step 1: Fetch viral content
        const viralContent = await fetchViralContent(niche);
        
        if (!viralContent || viralContent.length === 0) {
            showNotification('No viral content found. Try a different niche.', 'warning');
            setLoadingState(false);
            return;
        }

        // Step 2: Analyze content with AI
        const analysis = await analyzeWithAI(viralContent);
        
        // Step 3: Enhance results if enhancer is available
        const enhancedResults = window.ResponseEnhancer 
            ? new window.ResponseEnhancer().enhanceResponse({ results: analysis }).results
            : analysis;

        // Step 4: Display results
        displayResults(enhancedResults);
        
        // Update statistics
        AppState.stats.analyzed += enhancedResults.length;
        updateStats();
        
        // Cache recent analysis
        AppState.recentAnalysis = enhancedResults;
        
        showNotification(`Analysis complete! Found ${enhancedResults.length} viral posts.`, 'success');

    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Analysis failed. Please try again.', 'error');
        
        // Fallback to demo content
        if (AppState.currentPlatform === 'demo') {
            const demoResults = generateDemoResults(niche);
            displayResults(demoResults);
        }
    } finally {
        setLoadingState(false);
        btn.disabled = false;
        btn.innerHTML = '🚀 Analyze Viral Content';
    }
}

// Fetch Viral Content from API
async function fetchViralContent(niche) {
    const timeRange = document.getElementById('timeRange')?.value || '7d';
    const minLikes = document.getElementById('minLikes')?.value || 1000;
    const contentType = document.getElementById('contentType')?.value || 'all';
    
    try {
        const response = await fetch(API_ENDPOINTS.fetchViral, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                niche,
                platform: AppState.currentPlatform,
                timeRange,
                contentType,
                minEngagement: minLikes,
            }),
        });

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results || [];

    } catch (error) {
        console.error('Error fetching viral content:', error);
        
        // Fallback to demo content
        if (AppState.currentPlatform === 'demo') {
            return generateDemoContent(niche);
        }
        
        throw error;
    }
}

// Analyze Content with AI
async function analyzeWithAI(posts) {
    try {
        const response = await fetch(API_ENDPOINTS.analyze, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                posts: posts.slice(0, 5), // Limit to 5 posts
                provider: AppState.currentProvider,
                analysisType: 'full',
            }),
        });

        if (!response.ok) {
            throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results || [];

    } catch (error) {
        console.error('Error analyzing content:', error);
        
        // Fallback to enhanced demo analysis
        return posts.map(post => ({
            postId: post.id,
            originalPost: post,
            analysis: generateDemoAnalysis(post),
            timestamp: new Date().toISOString(),
        }));
    }
}

// Display Results in Grid
function displayResults(results) {
    const grid = document.getElementById('resultsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!results || results.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    results.forEach(result => {
        const card = createResultCard(result);
        grid.appendChild(card);
    });
    
    // Add animation to cards
    animateCards();
}

// Create Result Card
function createResultCard(data) {
    const card = document.createElement('div');
    card.className = 'result-card fade-in';
    card.dataset.postId = data.postId || data.id;
    
    const post = data.originalPost || data;
    const analysis = data.analysis || {};
    
    // Create media preview if available
    const mediaHtml = post.thumbnail ? 
        `<div class="result-media">
            <img src="${post.thumbnail}" alt="${post.title}" onerror="this.src='assets/placeholder.jpg'">
            ${post.platform === 'youtube' || post.platform === 'tiktok' ? 
                '<div class="play-button">▶</div>' : ''}
        </div>` : '';
    
    card.innerHTML = `
        ${mediaHtml}
        <div class="result-content">
            <div class="result-header">
                <span class="platform-badge platform-${post.platform}">${post.platform}</span>
                <span class="engagement-rate">📊 ${post.engagementRate || '0'}% engagement</span>
            </div>
            
            <h3 class="result-title">${post.title}</h3>
            <p class="result-description">${post.description || ''}</p>
            
            <div class="result-metrics">
                <span class="metric">👁 ${formatNumber(post.metrics?.views || 0)}</span>
                <span class="metric">❤️ ${formatNumber(post.metrics?.likes || 0)}</span>
                <span class="metric">💬 ${formatNumber(post.metrics?.comments || 0)}</span>
            </div>
            
            ${analysis.whyViral ? `
                <div class="analysis-section viral-analysis">
                    <h4>📈 Why It's Viral</h4>
                    <p>${analysis.whyViral}</p>
                </div>
            ` : ''}
            
            ${analysis.shootIdeas && analysis.shootIdeas.length > 0 ? `
                <div class="analysis-section shoot-ideas">
                    <h4>📸 Photography Shoot Ideas</h4>
                    <ul class="shoot-list">
                        ${analysis.shootIdeas.slice(0, 5).map((idea, index) => `
                            <li class="shoot-item">
                                <span class="shoot-number">${index + 1}</span>
                                <div class="shoot-content">
                                    <p>${typeof idea === 'object' ? idea.description : idea}</p>
                                    ${typeof idea === 'object' && idea.technical ? `
                                        <button class="preview-animation" data-animation="${idea.technical.composition}">
                                            🎬 Preview Animation
                                        </button>
                                    ` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${analysis.prOutline && analysis.prOutline.length > 0 ? `
                <div class="analysis-section pr-outline">
                    <h4>📢 PR Campaign Strategy</h4>
                    <div class="pr-steps">
                        ${analysis.prOutline.slice(0, 4).map((step, index) => `
                            <div class="pr-step">
                                <span class="pr-step-number">${index + 1}</span>
                                <p>${typeof step === 'object' ? step.description : step}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="card-actions">
                <button class="action-btn save-btn" data-post-id="${data.postId || data.id}">
                    💾 Save Idea
                </button>
                <button class="action-btn export-btn" data-post-id="${data.postId || data.id}">
                    📋 Export Plan
                </button>
                ${post.url && post.url !== '#' ? `
                    <a href="${post.url}" target="_blank" class="action-btn view-btn">
                        🔗 View Original
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Initialize Lottie Animations
function initializeLottie() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
    document.head.appendChild(script);
}

// Load Animation Assets
async function loadAnimations() {
    // Pre-load common animation types
    const animationTypes = [
        'pan-shot',
        'zoom-in',
        'tracking-shot',
        'timelapse',
        'slow-motion',
        'dolly-zoom',
        'aerial-shot',
    ];
    
    animationTypes.forEach(type => {
        AppState.animationCache.set(type, `/assets/animations/${type}.json`);
    });
}

// Show Animation Preview Modal
function showAnimationPreview(animationType) {
    const modal = document.createElement('div');
    modal.className = 'animation-modal';
    
    const animationUrl = AppState.animationCache.get(animationType) || 
                         `/assets/animations/default.json`;
    
    modal.innerHTML = `
        <div class="animation-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            <h3>Shot Preview: ${animationType}</h3>
            <lottie-player
                src="${animationUrl}"
                background="transparent"
                speed="1"
                style="width: 400px; height: 400px;"
                loop
                autoplay>
            </lottie-player>
            <p class="animation-description">
                This animation demonstrates the ${animationType} technique.
                Use this as inspiration for your shoot.
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Save Idea Function
function saveIdea(postId) {
    const post = AppState.recentAnalysis.find(r => r.postId === postId || r.id === postId);
    
    if (!post) {
        showNotification('Could not find post to save', 'error');
        return;
    }
    
    if (AppState.savedIdeas.find(idea => idea.postId === postId)) {
        showNotification('This idea is already saved', 'info');
        return;
    }
    
    AppState.savedIdeas.push({
        ...post,
        savedAt: new Date().toISOString(),
    });
    
    localStorage.setItem('savedIdeas', JSON.stringify(AppState.savedIdeas));
    AppState.stats.saved++;
    updateStats();
    updateSavedCount();
    
    showNotification('Idea saved successfully!', 'success');
    
    // Update button state
    const btn = document.querySelector(`.save-btn[data-post-id="${postId}"]`);
    if (btn) {
        btn.textContent = '✓ Saved';
        btn.disabled = true;
    }
}

// Export Shoot Plan
function exportShootPlan(postId) {
    const result = AppState.recentAnalysis.find(r => r.postId === postId || r.id === postId);
    
    if (!result) {
        showNotification('Could not find analysis to export', 'error');
        return;
    }
    
    const post = result.originalPost || result;
    const analysis = result.analysis || {};
    
    const planContent = `
CONTENT ANALYZER - PHOTOGRAPHY SHOOT PLAN
==========================================
Generated: ${new Date().toLocaleDateString()}
Platform: ${post.platform}
Niche: ${document.getElementById('nicheInput')?.value || 'General'}

VIRAL CONTENT REFERENCE
-----------------------
Title: ${post.title}
Engagement Rate: ${post.engagementRate}%
Metrics: ${post.metrics?.views || 0} views, ${post.metrics?.likes || 0} likes

WHY IT'S VIRAL
--------------
${analysis.whyViral || 'Analysis not available'}

PHOTOGRAPHY SHOOT IDEAS
-----------------------
${(analysis.shootIdeas || []).map((idea, i) => 
    `${i + 1}. ${typeof idea === 'object' ? idea.description : idea}`
).join('\n\n')}

PR CAMPAIGN STRATEGY
--------------------
${(analysis.prOutline || []).map((step, i) => 
    `Step ${i + 1}: ${typeof step === 'object' ? step.description : step}`
).join('\n\n')}

KEY TAKEAWAYS
-------------
${(analysis.keyTakeaways || []).map((takeaway, i) => 
    `• ${takeaway}`
).join('\n')}

NOTES
-----
[Add your production notes here]

---
Generated by Content Analyzer
https://content-analyzer.netlify.app
    `;
    
    // Create and download file
    const blob = new Blob([planContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shoot-plan-${postId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update stats
    AppState.stats.shoots++;
    updateStats();
    
    showNotification('Shoot plan exported successfully!', 'success');
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function setLoadingState(isLoading) {
    AppState.isLoading = isLoading;
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.toggle('active', isLoading);
    }
}

function updateStats() {
    document.getElementById('analyzedCount').textContent = AppState.stats.analyzed;
    document.getElementById('savedIdeasCount').textContent = AppState.stats.saved;
    document.getElementById('shootPlansCount').textContent = AppState.stats.shoots;
    document.getElementById('engagementAvg').textContent = AppState.stats.avgEngagement + '%';
    localStorage.setItem('stats', JSON.stringify(AppState.stats));
}

function updateSavedCount() {
    const badge = document.getElementById('savedCount');
    if (badge) {
        badge.textContent = AppState.savedIdeas.length;
    }
}

function loadSavedIdeas() {
    const grid = document.getElementById('savedGrid');
    if (grid && AppState.savedIdeas.length > 0) {
        grid.innerHTML = '';
        AppState.savedIdeas.forEach(idea => {
            const card = createResultCard(idea);
            grid.appendChild(card);
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updatePlatformUI(platform) {
    const badge = document.querySelector('.platform-indicator');
    if (badge) {
        badge.textContent = platform.toUpperCase();
        badge.className = `platform-indicator platform-${platform}`;
    }
}

function animateCards() {
    const cards = document.querySelectorAll('.result-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 100);
    });
}

// Generate Demo Content (Fallback)
function generateDemoContent(niche) {
    return Array.from({ length: 5 }, (_, i) => ({
        id: `demo-${Date.now()}-${i}`,
        platform: 'demo',
        title: `Amazing ${niche} content that went viral`,
        description: `Discover the secrets behind this ${niche} success story...`,
        thumbnail: `https://picsum.photos/640/360?random=${i}`,
        metrics: {
            views: Math.floor(Math.random() * 100000) + 10000,
            likes: Math.floor(Math.random() * 10000) + 1000,
            comments: Math.floor(Math.random() * 1000) + 100,
        },
        engagementRate: (Math.random() * 15 + 5).toFixed(2),
        url: '#',
    }));
}

function generateDemoAnalysis(post) {
    return {
        whyViral: 'This content resonates through authentic storytelling and perfect timing.',
        shootIdeas: [
            'Golden hour portrait with natural backlighting',
            'Dynamic action shot with motion blur',
            'Minimalist product photography with negative space',
            'Behind-the-scenes documentary style',
            'Dramatic low-key lighting setup',
        ],
        prOutline: [
            'Create compelling press release',
            'Reach out to relevant media contacts',
            'Launch social media campaign',
            'Track and measure results',
        ],
        keyTakeaways: [
            'Authenticity drives engagement',
            'Visual storytelling is key',
            'Timing matters for viral reach',
        ],
    };
}

// Export functions for external use
window.ContentAnalyzer = {
    analyzeContent,
    saveIdea,
    exportShootPlan,
    showAnimationPreview,
    AppState,
};