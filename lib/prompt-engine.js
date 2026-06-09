// VibeContent Pro - Prompt Engine v3 (Redesigned)
// Configuration and generation system

const PromptEngine = {
  // New configuration system will be built here

  // Build the system prompt for the model
  buildSystemPrompt(config) {
    if (config.isChatBot) {
      return `You are a helpful, expert AI assistant. Your job is to answer the user's questions specifically based on the provided SOURCE CONTENT of the webpage they are viewing. Be concise and direct.`;
    }
    
    let prompt = `You are an expert, highly-paid viral social media content creator. Your goal is to write engaging, algorithm-friendly posts based on the user's custom instructions.\n\n`;
    
    // Humanization Rules
    if (config.humanization !== undefined) {
      if (config.humanization > 75) {
        prompt += `[HUMANIZATION: UNHINGED]\n- WRITE LIKE A REAL HUMAN ON THE INTERNET. Do not use formal corporate speak.\n- Use extreme burstiness: Mix 2-word fragments with long, winding sentences.\n- Use conversational filler, em-dashes, and start sentences with conjunctions (And, But).\n- ABSOLUTELY FORBIDDEN WORDS: delve, leverage, tapestry, robust, pivotal, seamless, testament, realm, multifaceted, paramount, demystify.\n- NEVER use "In conclusion" or summarize.\n- DO NOT bold random phrases.\n`;
      } else if (config.humanization > 30) {
        prompt += `[HUMANIZATION: CONVERSATIONAL]\n- Write naturally and conversationally. Avoid stiff AI language.\n- Vary your sentence length to keep it engaging.\n- ABSOLUTELY FORBIDDEN WORDS: delve, leverage, tapestry, robust, pivotal, seamless, testament.\n- Do not over-format with bolding.\n`;
      } else {
        prompt += `[HUMANIZATION: STANDARD]\n- Write in a clean, standard professional format.\n`;
      }
    }

    // Tone Rules
    if (config.tone !== undefined) {
      if (config.tone > 75) {
        prompt += `\n[TONE: HIGHLY HUMOROUS/FUNNY]\n- Use sharp wit, sarcasm, or highly entertaining humor.\n`;
      } else if (config.tone < 25) {
        prompt += `\n[TONE: HIGHLY SERIOUS/PROFESSIONAL]\n- Maintain a strictly professional, authoritative, and serious tone.\n`;
      }
    }

    // Length Rules
    if (config.length !== undefined) {
      if (config.length > 75) {
        prompt += `\n[LENGTH: LONG]\n- Write a deep, detailed, and expansive post.\n`;
      } else if (config.length < 25) {
        prompt += `\n[LENGTH: SHORT]\n- Keep the output extremely brief, punchy, and to the point.\n`;
      }
    }

    return prompt;
  },

  // Build the user prompt
  buildUserPrompt(pageData, config) {
    let prompt = `SOURCE CONTENT:\n`;
    if (pageData.title) prompt += `Title: ${pageData.title}\n`;
    if (pageData.url) prompt += `URL: ${pageData.url}\n`;
    prompt += `\nCONTENT:\n${(pageData.content || '').substring(0, 8000)}\n\n`;

    if (config.isChatBot) {
      prompt += `USER QUERY: ${config.query}\n`;
    } else {
      prompt += `CUSTOM INSTRUCTIONS:\n${config.customPromptText}\n`;
    }

    return prompt;
  },

  // Multi-variation batch generation
  buildBatchPrompt(pageData, config, count = 5) {
    // To be implemented
    return `Generate ${count} variations.`;
  },

  // ─── Humanization score estimator ───────────────────────────────────────
  estimateHumanScore(text) {
    // Keeping the human score estimator intact as it's useful
    if (!text || typeof text !== 'string') return 0;
    let score = 50;

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
    else score -= 5;

    const fragments = (text.match(/\. [A-Z][a-z]{1,8}\./g) || []).length;
    if (fragments > 0) score += 5;

    const personal = (text.match(/\b(I|me|my|mine|myself|we|us|our|ours)\b/gi) || []).length;
    if (personal > 3) score += 10;

    const rhetorical = (text.match(/\?/g) || []).length;
    if (rhetorical > 1) score += 5;

    const dashes = (text.match(/—/g) || []).length;
    const parens = (text.match(/\([^)]+\)/g) || []).length;
    if (dashes + parens > 1) score += 5;

    const caps = (text.match(/\b[A-Z]{3,8}\b/g) || []).length;
    if (caps > 0 && caps < 5) score += 5;
    else if (caps >= 5) score -= 5;

    // AI Bolding penalty (but lists are allowed)
    const boldCount = (text.match(/\*\*[^*]+\*\*/g) || []).length;
    if (boldCount > 3) score -= 15;

    if (text.includes('In summary') || text.includes('To conclude') || text.includes('In conclusion')) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }
};

// Export for use in sidepanel (and Node tests if any)
if (typeof window !== 'undefined') {
  window.PromptEngine = PromptEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
}
