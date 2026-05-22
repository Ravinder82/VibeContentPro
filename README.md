# VibeContent Pro

VibeContent Pro is a powerful, AI-driven Chrome extension designed for social media content creation. It extracts content from web pages and transforms it into engaging, platform-specific posts using various influencer personas and psychological frameworks.

## Features

### Content Sources
- **Current Page**: Extract content from any open webpage with smart DOM parsing
- **URL Link**: Fetch and analyze content from any URL
- **Paste Text**: Manual text input for custom content

### 8 Influencer Personas
Each with unique linguistic fingerprints:
1. **The Storyteller** - Narrative-driven, emotional, sensory details
2. **The Contrarian** - Challenges mainstream views, hot takes
3. **The Insider** - Behind-the-scenes knowledge, industry secrets
4. **The Minimalist** - Maximum impact with minimum words
5. **The Hype Architect** - Energy, momentum, strategic ALL CAPS
6. **The Data-Driven** - Facts, frameworks, case studies
7. **The Relatable Realist** - "Clean Girl but Real Life" authentic style
8. **The Thought Leader** - LinkedIn-style professional insights

### 6 Generation Modes
- **Simple Rephrase** - Plagiarism-free rephrasing
- **Shadow Content** - Extract implied subtext and hidden meanings
- **Gap Hunter** - Identify missing information and fill gaps
- **Angle Rotation** - 5 completely different perspectives
- **Viral Hook** - Pattern interrupts and curiosity gaps
- **Time-Travel Rewrite** - Different era/context voices

### Platform Mutations
- Twitter/X (thread format, 280 char limits)
- LinkedIn (professional story-driven)
- Instagram (visual-first captions)
- TikTok (script format with hooks)
- Threads (casual conversational)
- YouTube Shorts (script with visual cues)

### Anti-AI Fingerprinting
- Sentence burstiness (variable length patterns)
- Elimination of AI tell-words
- Conversational imperfections (fragments, contractions)
- Human rhythm patterns (rhetorical questions, asides)
- Specificity over generic claims
- Emotional intelligence markers
- Typography-based emphasis (NO emojis)

### Additional Features
- **Human Score** - Real-time AI-detection resistance scoring
- **Content Vault** - Save, delete, copy, and reload generated content
- **Batch Generation** - Generate up to 10 variations at once
- **Live Editing** - Edit generated content directly in the output
- **Multi-Provider Support** - OpenAI, Anthropic, Google Gemini
- **Glassmorphism UI** - 2026 design trends with neon accents

## Installation

### Developer Mode (Current)
1. Download and extract the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extracted folder
5. The extension icon will appear in your toolbar
6. Click the icon or use the side panel to open Shadow Engine

### Chrome Web Store (Future)
Coming soon to the Chrome Web Store for one-click installation.

## Setup

1. Click the settings (gear) icon in the extension
2. Choose your AI provider (OpenAI, Anthropic, or Google)
3. Enter your API key (stored locally, never leaves your browser)
4. Set your default persona, platform, and mode preferences
5. Save settings

### Getting API Keys
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google Gemini**: https://aistudio.google.com/app/apikey

## Usage

1. **Extract Content**: Click "Extract Page Content" to read the current webpage, or paste text manually
2. **Configure**: Select your desired persona, platform, and generation mode
3. **Customize**: Add optional custom instructions (e.g., "Focus on environmental impact")
4. **Generate**: Click "Generate Viral Content" and watch the magic happen
5. **Review**: Check the Human Score to ensure AI-detection resistance
6. **Edit**: Click directly in the output to modify the content
7. **Save/Copy**: Use the action buttons to save to vault or copy to clipboard

## Architecture

```
shadow-engine-pro/
├── manifest.json          # Chrome Extension V3 manifest
├── background.js          # Service worker + API proxy
├── content.js             # DOM reader + smart extraction
├── sidepanel/
│   ├── sidepanel.html     # Main UI
│   ├── sidepanel.css      # Glassmorphism dark theme
│   └── sidepanel.js       # UI controller
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings logic
├── lib/
│   └── prompt-engine.js   # Anti-AI fingerprinting engine
└── icons/
    └── icon*.svg          # Extension icons
```

## Anti-AI Fingerprinting Technology

The extension uses a sophisticated prompt engineering system to create content that bypasses AI detection tools:

1. **Sentence Burstiness**: Dramatic variation in sentence length (5-35 words)
2. **AI Tell-Word Elimination**: Bans words like "delve", "leverage", "robust", "furthermore"
3. **Conversational Imperfections**: Fragments, contractions, parenthetical asides
4. **Human Rhythm**: Rhetorical questions, direct address, trailing thoughts
5. **Specificity**: Real numbers, brands, and experiences instead of generic claims
6. **Emotional Markers**: Feelings, reactions, and opinions woven naturally
7. **Typography Emphasis**: ALL CAPS and line spacing instead of emojis

## Privacy

- All content is processed locally in your browser
- API keys are stored in Chrome's local storage only
- No data is sent to any server except your chosen AI provider
- No tracking, analytics, or telemetry

## License

MIT License - Free for personal and commercial use.

## Credits

Built with deep research into:
- 2026 Chrome Extension best practices (Manifest V3, Side Panel API)
- Anti-AI detection techniques and humanization science
- Viral social media psychology and copywriting frameworks
- Glassmorphism UI/UX design trends

---

**Shadow Engine Pro** - Write like a human, think like a machine.
