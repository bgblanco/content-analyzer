# Development Stories for Content Analyzer v2.0
## Optimized for Parallel Development with Git Worktrees

### Overview
These stories are designed to be developed in parallel using Git worktrees to prevent merge conflicts. Each story focuses on a specific, isolated area of the codebase.

---

## Story 1.1: API Key Management UI
**Branch:** `story-1.1-api-key-ui`  
**Priority:** High  
**Dependencies:** None  
**Estimated:** 3 hours

### Description
Create the user interface components for managing multiple API keys (OpenAI, Grok, Claude, Gemini).

### Acceptance Criteria
- [ ] Modal UI for API key configuration
- [ ] Input fields for each API provider
- [ ] Password masking for key inputs
- [ ] Save/Cancel buttons
- [ ] Visual indicators for configured keys
- [ ] Form validation for key formats

### Implementation Details
```javascript
// New UI components to add in modal section
const apiProviders = ['OpenAI', 'Grok', 'Claude', 'Gemini'];

// Modal HTML structure
<div class="api-config-modal">
  <div class="api-provider-card">
    <label>Provider Name</label>
    <input type="password" class="api-key-input">
    <span class="status-indicator"></span>
  </div>
</div>
```

### Files to Modify
- `content-analyzer.html` (lines 1123-1136) - Update modal structure
- Add new CSS classes for multi-provider support

---

## Story 1.2: LocalStorage Security Layer
**Branch:** `story-1.2-storage-security`  
**Priority:** High  
**Dependencies:** None  
**Estimated:** 2 hours

### Description
Implement secure storage mechanism for API keys using base64 obfuscation with salt.

### Acceptance Criteria
- [ ] Base64 encoding/decoding functions
- [ ] Salt generation for added security
- [ ] Storage abstraction layer
- [ ] Key retrieval methods
- [ ] Clear storage functionality

### Implementation Details
```javascript
// New security module
class SecureStorage {
  constructor() {
    this.salt = this.generateSalt();
  }
  
  saveKey(provider, key) {
    const encoded = this.encode(key);
    localStorage.setItem(`api_${provider}`, encoded);
  }
  
  getKey(provider) {
    const encoded = localStorage.getItem(`api_${provider}`);
    return encoded ? this.decode(encoded) : null;
  }
  
  encode(data) {
    return btoa(this.salt + data);
  }
  
  decode(encoded) {
    const decoded = atob(encoded);
    return decoded.substring(this.salt.length);
  }
}
```

### Files to Create
- New JavaScript module for security functions

---

## Story 1.3: AI Provider Selector UI
**Branch:** `story-1.3-provider-selector`  
**Priority:** Medium  
**Dependencies:** None  
**Estimated:** 2 hours

### Description
Add dropdown selector in Viral Explorer section for choosing active AI backend.

### Acceptance Criteria
- [ ] Dropdown selector in explorer controls
- [ ] Display available providers only
- [ ] Visual indication of selected provider
- [ ] Remember last selection
- [ ] Disabled state for unconfigured providers

### Implementation Details
```html
<!-- Add to explorer controls section -->
<div class="control-group">
  <label class="control-label">AI Backend</label>
  <select class="control-input" id="aiProviderSelect">
    <option value="openai">OpenAI GPT-4</option>
    <option value="grok">xAI Grok</option>
    <option value="claude">Anthropic Claude</option>
    <option value="gemini">Google Gemini</option>
  </select>
</div>
```

### Files to Modify
- `content-analyzer.html` (lines 928-971) - Add selector to controls

---

## Story 2.1: API Routing Logic
**Branch:** `story-2.1-api-routing`  
**Priority:** High  
**Dependencies:** Story 1.2  
**Estimated:** 4 hours

### Description
Implement routing logic to direct requests to selected AI provider.

### Acceptance Criteria
- [ ] Provider factory pattern
- [ ] Request routing based on selection
- [ ] Provider-specific request formatting
- [ ] Response normalization
- [ ] Error handling per provider

### Implementation Details
```javascript
class APIRouter {
  constructor() {
    this.providers = {
      openai: new OpenAIProvider(),
      grok: new GrokProvider(),
      claude: new ClaudeProvider(),
      gemini: new GeminiProvider()
    };
  }
  
  async analyze(content, provider) {
    const selectedProvider = this.providers[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not configured`);
    }
    return await selectedProvider.analyze(content);
  }
}
```

### Files to Create
- New JavaScript module for API routing

---

## Story 2.2: Provider Adapters
**Branch:** `story-2.2-provider-adapters`  
**Priority:** High  
**Dependencies:** None  
**Estimated:** 4 hours

### Description
Create adapter classes for each AI provider to handle API-specific requirements.

### Acceptance Criteria
- [ ] OpenAI adapter with GPT-4 support
- [ ] Grok adapter implementation
- [ ] Claude adapter with proper headers
- [ ] Gemini adapter with API key auth
- [ ] Common interface for all adapters

### Implementation Details
```javascript
// Base provider class
class AIProvider {
  async analyze(prompt) {
    throw new Error('Must implement analyze method');
  }
  
  normalizeResponse(response) {
    throw new Error('Must implement normalizeResponse');
  }
}

// OpenAI implementation
class OpenAIProvider extends AIProvider {
  async analyze(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{role: 'user', content: prompt}]
      })
    });
    return this.normalizeResponse(await response.json());
  }
}
```

### Files to Create
- Provider adapter modules for each AI service

---

## Story 2.3: Response Enhancement Engine
**Branch:** `story-2.3-response-enhancement`  
**Priority:** Medium  
**Dependencies:** None  
**Estimated:** 3 hours

### Description
Enhance AI responses with detailed shoot descriptions and PR outlines.

### Acceptance Criteria
- [ ] Parse basic AI responses
- [ ] Add vivid shoot angle descriptions
- [ ] Include technical photography details
- [ ] Generate step-by-step PR outlines
- [ ] Add reference URLs and examples

### Implementation Details
```javascript
class ResponseEnhancer {
  enhanceShootDescription(basic) {
    return {
      title: basic.title,
      description: this.generateVividDescription(basic),
      technical: {
        lighting: this.describeLighting(basic),
        angle: this.describeAngle(basic),
        composition: this.describeComposition(basic),
        equipment: this.suggestEquipment(basic)
      },
      references: this.findReferences(basic)
    };
  }
  
  generatePROutline(content) {
    return [
      {
        step: 1,
        title: 'Draft Press Release',
        actions: ['Write 400-500 word release', 'Include quotes'],
        timeline: 'Day 1',
        templates: [this.getPressReleaseTemplate()]
      },
      // More steps...
    ];
  }
}
```

### Files to Create
- Response enhancement module

---

## Story 3.1: Enhanced Result Cards UI
**Branch:** `story-3.1-result-cards-ui`  
**Priority:** Medium  
**Dependencies:** None  
**Estimated:** 3 hours

### Description
Update result card UI to display enhanced shoot descriptions and PR outlines.

### Acceptance Criteria
- [ ] Expandable sections for details
- [ ] Formatted shoot descriptions
- [ ] Step-by-step PR display
- [ ] Reference links
- [ ] Copy-to-clipboard functionality

### Implementation Details
```html
<!-- Enhanced result card structure -->
<div class="result-card enhanced">
  <div class="shoot-section collapsible">
    <h4>Photography Shoot Plan</h4>
    <div class="shoot-details">
      <div class="technical-specs">
        <span class="spec-item">Lighting: Golden hour</span>
        <span class="spec-item">Angle: Low, heroic</span>
      </div>
      <p class="vivid-description">...</p>
    </div>
  </div>
  <div class="pr-section collapsible">
    <h4>PR Campaign Outline</h4>
    <ol class="pr-steps">
      <li class="pr-step">
        <strong>Day 1:</strong> Draft press release
        <ul class="step-actions">...</ul>
      </li>
    </ol>
  </div>
</div>
```

### Files to Modify
- `content-analyzer.html` - Update result card HTML generation
- Add new CSS for enhanced cards

---

## Story 3.2: Error Handling & Fallbacks
**Branch:** `story-3.2-error-handling`  
**Priority:** High  
**Dependencies:** Story 2.1  
**Estimated:** 2 hours

### Description
Implement comprehensive error handling and fallback mechanisms.

### Acceptance Criteria
- [ ] API failure detection
- [ ] Automatic provider fallback
- [ ] User-friendly error messages
- [ ] Rate limit handling
- [ ] Network error recovery

### Implementation Details
```javascript
class ErrorHandler {
  async handleAPIError(error, currentProvider) {
    console.error(`Provider ${currentProvider} failed:`, error);
    
    // Try fallback providers
    const fallbacks = this.getFallbackProviders(currentProvider);
    for (const fallback of fallbacks) {
      try {
        return await this.retryWithProvider(fallback);
      } catch (e) {
        continue;
      }
    }
    
    // All providers failed
    this.showUserError('All AI providers are currently unavailable');
  }
  
  getFallbackProviders(failed) {
    const all = ['openai', 'grok', 'claude', 'gemini'];
    return all.filter(p => p !== failed && this.isConfigured(p));
  }
}
```

### Files to Create
- Error handling module

---

## Story 3.3: Testing & Documentation
**Branch:** `story-3.3-testing`  
**Priority:** Low  
**Dependencies:** All stories  
**Estimated:** 3 hours

### Description
Add tests and update documentation.

### Acceptance Criteria
- [ ] Unit tests for core functions
- [ ] Integration tests for API flow
- [ ] User documentation
- [ ] API configuration guide
- [ ] Troubleshooting guide

### Files to Create
- Test files for each module
- Updated README.md
- User guide documentation

---

## Parallel Development Workflow

### Setting Up Worktrees
```bash
# From main branch
git worktree add -b story-1.1-api-key-ui ../story-1.1
git worktree add -b story-1.2-storage-security ../story-1.2
git worktree add -b story-1.3-provider-selector ../story-1.3
git worktree add -b story-2.1-api-routing ../story-2.1
git worktree add -b story-2.2-provider-adapters ../story-2.2
git worktree add -b story-2.3-response-enhancement ../story-2.3
git worktree add -b story-3.1-result-cards-ui ../story-3.1
git worktree add -b story-3.2-error-handling ../story-3.2
git worktree add -b story-3.3-testing ../story-3.3
```

### Development Process
1. Each developer works in their assigned worktree
2. No conflicts as stories target different code areas
3. Commit and push to story branch
4. Create PR when complete
5. Merge to main after review

### Merge Order
1. **Phase 1** (No dependencies):
   - Story 1.1, 1.2, 1.3, 2.2, 2.3, 3.1
2. **Phase 2** (After Phase 1):
   - Story 2.1 (depends on 1.2)
   - Story 3.2 (depends on 2.1)
3. **Phase 3** (Final):
   - Story 3.3 (depends on all)

---

## Success Metrics

| Story | Success Criteria | Measurement |
|-------|-----------------|-------------|
| 1.1 | UI renders correctly | Visual testing |
| 1.2 | Keys stored securely | Unit tests pass |
| 1.3 | Selector functional | User can select provider |
| 2.1 | Routing works | API calls succeed |
| 2.2 | All providers work | Integration tests pass |
| 2.3 | Enhanced output | Detailed descriptions present |
| 3.1 | Cards display data | UI shows all fields |
| 3.2 | Errors handled | No crashes on failure |
| 3.3 | Tests pass | 80% coverage |

---

*Document Version: 1.0*  
*Last Updated: September 2, 2025*  
*Total Estimated: 28 hours*  
*Parallel Execution: ~8 hours with 3 developers*