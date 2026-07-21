// VibeContent Pro - Prompt Engine v3 (Multi-Agent System)
// Handles agent system prompts, user context building, and auto agent detection

const PromptEngine = {

  // Auto detect best agent based on content source and context
  detectBestAgent(pageData) {
    if (!pageData) return 'tweet_synthesizer';

    const url = (pageData.url || '').toLowerCase();
    const domain = (pageData.domain || '').toLowerCase();
    const wordCount = pageData.wordCount || 0;

    // 1. Twitter / X content -> Reply & Quote Guy Agent
    if (domain.includes('twitter.com') || domain.includes('x.com') || url.includes('twitter.com') || url.includes('x.com')) {
      return 'reply_guy';
    }

    // 2. Long form articles (> 800 words) -> 5-Slide Carousel Agent
    if (wordCount > 800) {
      return 'carousel_5slide';
    }

    // 3. Default for news, blog posts, general webpages -> Tweet Synthesizer Agent
    return 'tweet_synthesizer';
  },

  // Build system prompt based on active agent
  buildSystemPrompt(config = {}) {
    if (config.isChatBot) {
      return `You are a helpful, expert AI assistant. Your job is to answer the user's questions specifically based on the provided SOURCE CONTENT of the webpage they are viewing. Be concise and direct.`;
    }

    const agent = config.agent || 'tweet_synthesizer';

    if (agent === 'reply_guy') {
      return `You are "The Reply Guy", a viral social media growth expert. Your goal is to write ultra-engaging, witty, insightful, or provocative Twitter/X replies and quote-tweets based on the provided source content.

RULES:
- Length MUST be strictly between 40 and 90 words.
- Write like a real human Twitter user. Never sound like a corporate bot.
- Vary sentence structures. Use short punchy lines.
- ABSOLUTELY FORBIDDEN WORDS: delve, leverage, tapestry, robust, pivotal, seamless, testament, realm, multifaceted, paramount, demystify.
- NEVER use generic phrases like "Great post!" or "In conclusion".
- Make it conversational, sharp, and value-packed.`;
    }

    if (agent === 'carousel_5slide') {
      return `You are a viral Visual Content Creator specializing in 5-Slide Twitter/LinkedIn Carousels. Your goal is to extract the core insights from the source article and convert them into exactly 5 visual slides.

OUTPUT FORMAT REQUIREMENTS:
Output must be structured as 5 distinct slides formatted cleanly as follows:

[SLIDE 1: THE HOOK]
Title: <Punchy, curiosity-inducing headline>
Content: <2-line hook setting up the problem or massive insight>

[SLIDE 2: KEY INSIGHT 1]
Title: <Sub-headline>
Content: <2-3 bullet points or key takeaway>

[SLIDE 3: KEY INSIGHT 2]
Title: <Sub-headline>
Content: <2-3 bullet points or key takeaway>

[SLIDE 4: KEY INSIGHT 3]
Title: <Sub-headline>
Content: <2-3 bullet points or key takeaway>

[SLIDE 5: THE TAKEAWAY / CTA]
Title: <Summary Headline>
Content: <Actionable advice or call to action>

RULES:
- Keep text concise and visually scannable for design graphics.
- ABSOLUTELY FORBIDDEN WORDS: delve, leverage, tapestry, robust, pivotal, seamless, testament.`;
    }

    if (agent === 'custom_prompt') {
      return `You are an expert AI content creator. Execute the user's custom instructions precisely based on the source content. Maintain high engagement and natural human writing style.`;
    }

    // Default: Tweet Synthesizer Agent (100 - 150 words)
    return `You are a Master Twitter/X Content Synthesizer. Your goal is to turn any article, webpage, or news story into a high-performing viral Tweet/Post.

STRICT CONSTRAINTS:
- Output length MUST be strictly between 100 and 150 words.
- Structure: 
  1. A powerful pattern-interrupt Hook line.
  2. 2-3 concise bullet points summarizing key AI / tech / news insights.
  3. A punchy closing question or takeaway to drive comments.
- Tone: High-vibe, authentic, human, anti-AI fingerprinting.
- ABSOLUTELY FORBIDDEN WORDS: delve, leverage, tapestry, robust, pivotal, seamless, testament, realm, multifaceted, paramount, demystify.
- DO NOT use generic hashtags or corporate speak.`;
  },

  // Build the user prompt
  buildUserPrompt(pageData, config = {}) {
    let prompt = `SOURCE CONTENT:\n`;
    if (pageData.title) prompt += `Title: ${pageData.title}\n`;
    if (pageData.url) prompt += `URL: ${pageData.url}\n`;
    prompt += `\nCONTENT:\n${(pageData.content || '').substring(0, 8000)}\n\n`;

    if (config.isChatBot) {
      prompt += `USER QUERY: ${config.query}\n`;
    } else if (config.agent === 'custom_prompt' && config.customPromptText) {
      prompt += `CUSTOM INSTRUCTIONS:\n${config.customPromptText}\n`;
    } else {
      prompt += `INSTRUCTION: Create viral Twitter/X content according to your system prompt constraints.\n`;
    }

    return prompt;
  },

  // ─── Humanization score estimator ───────────────────────────────────────
  estimateHumanScore(text) {
    if (!text || typeof text !== 'string') return 0;
    let score = 60;

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const lengths = sentences.map(s => s.split(/\s+/).length);
    if (lengths.length) {
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
      const burstiness = Math.sqrt(variance);
      if (burstiness > 8) score += 15;
      else if (burstiness > 5) score += 10;
      else score -= 10;
    }

    const aiTells = ['delve','leverage','robust','comprehensive','furthermore',
      "in conclusion","it's important to note","in today's",'paradigm','synergy',
      'utilize','facilitate','moreover','consequently','groundbreaking','tapestry','realm','navigate',
      'testament','beacon','landscape','pivotal','seamless','dynamic','tailored','multifaceted','paramount','demystify'];
    const tellCount = aiTells.reduce((count, word) => {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    score -= tellCount * 6;

    const contractions = (text.match(/\b(don't|can't|won't|here's|that's|it's|I'm|you're|we're|they're|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|couldn't|shouldn't|let's|there's|what's|who's|how's)\b/gi) || []).length;
    if (contractions > 5) score += 10;
    else if (contractions > 2) score += 5;

    return Math.min(98, Math.max(20, score));
  }
};

// Export for use in sidepanel (and Node tests if any)
if (typeof window !== 'undefined') {
  window.PromptEngine = PromptEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
}
