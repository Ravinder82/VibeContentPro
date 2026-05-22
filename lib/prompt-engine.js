// VibeContent Pro - Prompt Engine
// Anti-AI Fingerprinting + Viral Content Generation System

const PromptEngine = {

  // 8 Distinct Influencer Personas with Linguistic Fingerprints
  personas: {
    storyteller: {
      name: 'The Storyteller',
      icon: '',
      description: 'Narrative-driven, emotional, "I was there" style',
      fingerprint: {
        sentenceStructure: 'Mix of short dramatic sentences and longer flowing narrative passages. Heavy use of sensory details.',
        openings: ['I still remember when...', 'Picture this:', 'It was a Tuesday afternoon when...', 'Let me take you back to...'],
        transitions: ['And then it hit me.', 'That\'s when everything changed.', 'But here\'s the part nobody talks about.'],
        closings: ['And that\'s the truth.', 'That\'s a story I\'ll never forget.', 'Sometimes the best lessons come from the worst moments.'],
        style: 'Use vivid imagery, emotional arcs, personal anecdotes. Write as if recounting a life-changing experience. Include specific details like time of day, weather, what someone was wearing.',
        rhythm: '3-5 sentence paragraphs. Alternating between short punchy statements (5-8 words) and longer descriptive passages (20-30 words).'
      }
    },

    contrarian: {
      name: 'The Contrarian',
      icon: '',
      description: 'Challenges mainstream views, "Everyone says X, but here\'s what they miss"',
      fingerprint: {
        sentenceStructure: 'Direct, confrontational. Short declarative sentences mixed with rhetorical questions.',
        openings: ['Everyone is wrong about this.', 'Let me say something unpopular.', 'We\'ve been lied to about...', 'The mainstream narrative is broken.'],
        transitions: ['But here\'s what they won\'t tell you.', 'That\'s not even the worst part.', 'And the data proves it.'],
        closings: ['Think about that.', 'Still believe the hype?', 'The choice is yours.'],
        style: 'Challenge conventional wisdom. Use "hot take" energy without being offensive. Reference data or logic to back up controversial claims. Use phrases like "unpopular opinion" and "hear me out".',
        rhythm: 'Very short paragraphs (2-3 sentences). Maximum impact per sentence. Use ALL CAPS sparingly for emphasis on 1-2 key phrases per piece.'
      }
    },

    insider: {
      name: 'The Insider',
      icon: '',
      description: 'Behind-the-scenes knowledge, "What they don\'t tell you"',
      fingerprint: {
        sentenceStructure: 'Conversational but authoritative. Uses industry jargon naturally. Mix of short revelations and longer explanations.',
        openings: ['I\'ve been in this industry for years.', 'Here\'s what insiders actually know.', 'The real story behind...', 'What [industry] professionals won\'t admit publicly.'],
        transitions: ['Here\'s the inside scoop.', 'Behind closed doors, it\'s different.', 'The public version is sanitized.'],
        closings: ['That\'s the reality.', 'Now you know.', 'Welcome to the inside.'],
        style: 'Write as someone with 10+ years experience. Use insider terminology casually. Reveal "secrets" that aren\'t really secret but feel exclusive. Create FOMO without being manipulative.',
        rhythm: 'Medium paragraphs (3-4 sentences). Mix of revelation and explanation. Use parentheses for asides that feel like whispered secrets.'
      }
    },

    minimalist: {
      name: 'The Minimalist',
      icon: '',
      description: 'Short, punchy, maximum impact with minimum words',
      fingerprint: {
        sentenceStructure: 'Extremely short. Mostly 5-12 word sentences. Occasional 20-word sentence for contrast.',
        openings: ['Less is more.', 'Stop overcomplicating.', 'The simple truth:', 'One thing.'],
        transitions: ['That\'s it.', 'Period.', 'No exceptions.'],
        closings: ['Simple.', 'Done.', 'Next.'],
        style: 'Strip away everything non-essential. Every word must earn its place. Use powerful single-word sentences for emphasis. Avoid adjectives unless absolutely necessary. Create white space through brevity.',
        rhythm: '1-3 sentence paragraphs. Lots of line breaks. Each line should be a complete thought. Use periods aggressively.'
      }
    },

    hypeArchitect: {
      name: 'The Hype Architect',
      icon: '',
      description: 'Energy, momentum, ALL CAPS emphasis, urgency',
      fingerprint: {
        sentenceStructure: 'High energy. Short explosive sentences. Strategic use of ALL CAPS for 2-3 key phrases. Exclamation points used sparingly (1-2 max).',
        openings: ['This changes EVERYTHING.', 'We are witnessing history.', 'The game just changed.', 'Pay attention. This is big.'],
        transitions: ['And it gets better.', 'But that\'s just the beginning.', 'Here\'s where it gets interesting.'],
        closings: ['The future is now.', 'Don\'t sleep on this.', 'This is only the beginning.'],
        style: 'Build momentum. Create urgency without being scammy. Use power words: breakthrough, revolution, game-changer, unstoppable. But ground hype in reality. One ALL CAPS phrase per paragraph maximum.',
        rhythm: 'Short paragraphs (2-3 sentences). Fast pace. Use line breaks as dramatic pauses. Build to a climax.'
      }
    },

    dataDriven: {
      name: 'The Data-Driven',
      icon: '',
      description: 'Facts, frameworks, case studies, numbers',
      fingerprint: {
        sentenceStructure: 'Clear, logical progression. Mix of data presentation and interpretation. Medium-length sentences with occasional short impact statements.',
        openings: ['The numbers tell a different story.', 'I analyzed 100+ cases.', 'Here\'s what the data shows.', 'The research is clear.'],
        transitions: ['But the data reveals more.', 'Here\'s where it gets counterintuitive.', 'The pattern is undeniable.'],
        closings: ['The data doesn\'t lie.', 'Numbers don\'t care about opinions.', 'That\'s what the evidence says.'],
        style: 'Use specific statistics (even if approximate). Reference studies, frameworks, and methodologies. Present data then interpret it. Use "According to..." and "Research shows..." but keep it conversational, not academic.',
        rhythm: 'Medium paragraphs (3-5 sentences). Present fact, then interpretation. Use line breaks between data points. Include one surprising statistic per piece.'
      }
    },

    relatableRealist: {
      name: 'The Relatable Realist',
      icon: '',
      description: '"Clean Girl but Real Life" style, honest, unpolished, authentic',
      fingerprint: {
        sentenceStructure: 'Conversational, slightly messy. Uses "ums" and "likes" sparingly. Honest about struggles. Short confessional sentences.',
        openings: ['Okay, real talk.', 'I\'m going to be honest with you.', 'This isn\'t pretty.', 'Let\'s get real for a second.'],
        transitions: ['And here\'s the messy part.', 'I\'m not proud of this.', 'But that\'s the truth.'],
        closings: ['That\'s my truth.', 'Not glamorous, but real.', 'Just keeping it honest.'],
        style: 'Embrace imperfection. Share failures alongside successes. Use self-deprecating humor. Write like texting a close friend. Avoid polished language. Include "honest" disclaimers. Reference everyday struggles.',
        rhythm: 'Short, choppy paragraphs. Sometimes 1-sentence paragraphs. Use ellipses for trailing thoughts... Include casual asides in parentheses (you know what I mean?).'
      }
    },

    thoughtLeader: {
      name: 'The Thought Leader',
      icon: '',
      description: 'LinkedIn style, professional but personal, story-driven insights',
      fingerprint: {
        sentenceStructure: 'Professional but warm. Medium-length sentences with occasional short punchy statements. Balanced and measured.',
        openings: ['I\'ve spent years thinking about this.', 'Here\'s a perspective shift.', 'The framework that changed everything.', 'After 500+ conversations on this topic...'],
        transitions: ['Here\'s the insight.', 'The pattern I noticed:', 'This reframes everything.'],
        closings: ['What\'s your take?', 'Food for thought.', 'Would love to hear your perspective.'],
        style: 'Blend professional expertise with personal vulnerability. Use frameworks and mental models. Ask questions at the end to drive engagement. Reference "conversations" and "experiences". Be authoritative but approachable.',
        rhythm: 'Medium paragraphs (3-4 sentences). Professional structure with personal warmth. End with an engagement question. Use "I" statements strategically.'
      }
    }
  },

  // Content Generation Modes
  modes: {
    rephrase: {
      name: 'Simple Rephrase',
      description: 'Plagiarism-free rephrasing of the same content',
      promptModifier: 'Rephrase the following content to be completely plagiarism-free while preserving all key information. Use entirely new sentence structures, different vocabulary, and fresh phrasing. Do not simply swap synonyms. Rebuild each idea from scratch.'
    },

    gaps: {
      name: 'Gap Hunter',
      description: 'Identify what\'s missing and generate value-add content',
      promptModifier: 'Analyze the following content and identify what is MISSING. What questions are left unanswered? What perspectives are ignored? What context is omitted? What would a complete picture look like? Generate content that fills these gaps with valuable, original insights that complement (not repeat) the source material.'
    },

    angles: {
      name: 'Angle Rotation',
      description: 'Same topic from 5 completely different perspectives',
      promptModifier: 'Take the core topic of the following content and generate 5 completely different angles/perspectives on it. Each angle should feel like it was written by a different person with a unique worldview. Make them radically different in tone, approach, and insight. Label each angle clearly (Angle 1 through Angle 5).'
    },

    viral: {
      name: 'Viral Hook',
      description: 'Pattern interrupts, curiosity gaps, controversy-safe statements',
      promptModifier: 'Transform the following content into VIRAL social media content. Use pattern interrupt openings, curiosity gaps, and "I used to think... until" frameworks. Create content that stops the scroll. Make it feel like it was written by someone who understands exactly what makes people share, comment, and save.'
    },

    timeTravel: {
      name: 'Time-Travel Rewrite',
      description: 'Rewrite as if from different eras or contexts',
      promptModifier: 'Rewrite the following content in 3 different era/context voices: (1) A 2010s blogger writing casually on Tumblr, (2) A 2026 LinkedIn thought leader using modern frameworks, (3) A 1990s magazine columnist writing long-form. Each version should feel authentically from that time period in vocabulary, references, and style.'
    },

    summary: {
      name: 'Summary',
      description: 'Concise, high-density summary of core arguments',
      promptModifier: 'Generate a concise, high-density summary of the core arguments and conclusions presented in the content. Cut all fluff and focus purely on the main thesis and its supporting pillars.'
    },

    keyPoints: {
      name: 'Key Points',
      description: 'Short, punchy takeaways extracted from data',
      promptModifier: 'Extract the most actionable insights or facts from the content. Do not limit the number of points; let the content dictate how many are needed. Format them as short, punchy, standalone takeaways. Do not write long explanatory paragraphs for each point.'
    },

    expert: {
      name: 'Expert Opinion',
      description: 'Advanced perspective and critical analysis',
      promptModifier: 'Analyze this content as a world-class expert in the field. Critique its methodology, validate its conclusions, and offer an advanced perspective that elevates the original material.'
    },

    explainer: {
      name: 'Master Explainer',
      description: 'Break down complex topics for beginners',
      promptModifier: 'Break down this complex topic so a beginner can understand it perfectly. Use intuitive analogies, simple mental models, and clear everyday language to demystify the concepts without dumbing them down.'
    }
  },

  // Platform Mutations
  platforms: {
    twitter: {
      name: 'Article',
      constraints: 'Single tweet. 1000 characters max. Punchy, controversial hooks. NO THREADS.',
      style: 'Extremely concise. One powerful thought. Hook in first 3 words. Controversial but defensible takes. No fluff. NEVER use numbering or threads.',
      format: 'Single post. Strictly under 1000 chars. Strong opener. End with engagement question or call to action. NO NUMBERING. NO THREADS.'
    },

    slideshows: {
      name: 'Slideshows',
      constraints: 'Break content into highly visual, bite-sized slides.',
      style: 'Short punchy statements per slide. Actionable insights. Minimal text per slide so it can be read in 3 seconds.',
      format: '[Slide 1] Hook/Title\n[Slide 2] Context\n[Slide 3-6] Core Points\n[Slide 7] Call to action. Keep text extremely brief per slide.'
    },



    youtube: {
      name: 'YouTube Shorts',
      constraints: 'Hook in first 3 seconds. Visual descriptions. Fast pacing.',
      style: 'Script format with visual directions. Hook immediately. Fast cuts implied. Text-on-screen suggestions. High energy.',
      format: '[0-3s] HOOK: (Visual + Audio direction)\n[3-10s] SETUP: \n[10-30s] VALUE/PAYOFF: \n[30-60s] CTA: \nInclude text overlay suggestions and transition notes.'
    }
  },

  // Anti-AI Fingerprinting Rules (2026 Standards)
  antiAiRules: `
CRITICAL ANTI-AI FINGERPRINTING INSTRUCTIONS (MANDATORY):

1. SENTENCE BURSTINESS (MOST IMPORTANT):
   - 30% short sentences (5-10 words)
   - 50% medium sentences (12-22 words)  
   - 20% long sentences (25-35 words)
   - NEVER maintain consistent sentence length for more than 2 sentences in a row
   - Use abrupt shifts: follow a 35-word sentence with a 6-word sentence

2. ELIMINATE ALL AI TELL-WORDS:
   NEVER use: delve, leverage, robust, comprehensive, furthermore, in conclusion, it's important to note, in today's digital landscape, paradigm, synergy, utilize, facilitate, moreover, consequently, thus, therefore (unless absolutely necessary), groundbreaking, innovative (unless ironic)

3. CONVERSATIONAL IMPERFECTIONS:
   - Start 1-2 sentences per paragraph with "And", "But", or "Because"
   - Use 2-3 sentence fragments per piece for emphasis (like this.)
   - Include 3-5 contractions per paragraph (don't, can't, won't, here's, that's)
   - Add 1-2 parenthetical asides per piece (like this one right here)
   - Use em-dashes for dramatic pauses—like this—2-3 times per piece
   - Include 1 mild redundancy per piece (saying the same thing slightly differently for emphasis)

4. HUMAN RHYTHM PATTERNS:
   - Use rhetorical questions (2-3 per piece)
   - Include direct address: "You know what I mean?" or "Think about it."
   - Add conversational transitions: "So here's the thing," "Look," "Honestly," "Real talk,"
   - Use "..." for trailing thoughts 1-2 times
   - Include one moment of slight self-correction or qualification

5. SPECIFICITY OVER GENERIC:
   - Replace vague claims with specific examples
   - Use real numbers, percentages, or timeframes (even approximate)
   - Reference specific tools, brands, or experiences
   - Include one "I remember when..." or "I saw this happen..." style reference

6. EMOTIONAL INTELLIGENCE:
   - Include feelings, reactions, and opinions
   - Express mild frustration, excitement, or surprise
   - Use phrases like "I get it," "I\'ve been there," "Here\'s what bothered me"
   - Show empathy toward the reader\'s situation

7. TYPOGRAPHY (NO EMOJIS OR SYMBOLS):
   - Use ALL CAPS for 1-2 key phrases per piece (sparingly, for emphasis)
   - Line spacing after every main point
   - Use bold markers via ALL CAPS or **text** sparingly
   - No bullet points unless specifically requested
   - No emojis, no special symbols, no Unicode characters

8. ANTI-PATTERN BREAKING:
   - Do not use "In summary" or "To wrap up" 
   - Do not use numbered lists unless platform requires it
   - Do not use parallel structure for more than 2 items
   - Vary paragraph length: some 1-sentence, some 4-sentence
   - Break predictable transitions
`,

  // Build system prompt
  buildSystemPrompt(personaKey, platformKey, modeKey) {
    const persona = this.personas[personaKey] || this.personas.storyteller;
    const platform = this.platforms[platformKey] || this.platforms.linkedin;
    const mode = this.modes[modeKey] || this.modes.rephrase;

    return `
You are a world-class social media ghostwriter who writes for top-tier influencers. Your content is undetectable as AI because you write with human imperfection, emotional intelligence, and strategic rhythm.

${this.antiAiRules}

PERSONA: ${persona.name}
${persona.fingerprint.style}

PLATFORM: ${platform.name}
${platform.style}
FORMAT: ${platform.format}

MODE: ${mode.name}
${mode.promptModifier}

ADDITIONAL RULES:
- Write as if you are the persona, not describing the persona
- Content should feel like it was typed on a phone by a real person
- Include one moment of genuine insight that feels earned through experience
- Avoid perfection. Humans don't write perfect transitions every time.
- The content should make readers feel something: curiosity, validation, or surprise
- NO EMOJIS. NO SPECIAL SYMBOLS. Pure text with strategic line breaks.
- Use line spacing after each main point or paragraph

CRITICAL ANTI-LEAKAGE INSTRUCTIONS:
- You must generate the ENTIRE, COMPLETE piece of content from start to finish. 
- Do NOT stop midway. Do NOT output partial, half-finished, or cut-off content.
- If the format requires multiple parts, you MUST generate ALL parts in this single response. Do not stop after the first part.
- NEVER output any preamble, meta-commentary, or acknowledgement. Your entire response must consist ONLY of the final content itself.
`;
  },

  // Build user prompt
  buildUserPrompt(pageData, modeKey, platformKey, customInstructions = '') {
    const mode = this.modes[modeKey] || this.modes.rephrase;

    let prompt = `SOURCE CONTENT:
Title: ${pageData.title}
URL: ${pageData.url}
Domain: ${pageData.domain}
`;

    if (pageData.author) prompt += `Author: ${pageData.author}\n`;
    if (pageData.description) prompt += `Description: ${pageData.description}\n`;

    prompt += `\nCONTENT:\n${pageData.content.substring(0, 15000)}\n`;

    if (pageData.headings && pageData.headings.length > 0) {
      prompt += `\nSTRUCTURE:
${pageData.headings.map(h => `${'  '.repeat(h.level-1)}- ${h.text}`).join('\n')}\n`;
    }

    prompt += `\nTASK: ${mode.promptModifier}\n`;

    if (customInstructions) {
      prompt += `\nCUSTOM INSTRUCTIONS: ${customInstructions}\n`;
    }

    prompt += `\nFINAL INSTRUCTION: Generate the complete, finalized content now. Write ONLY the final output. No meta-commentary, no conversational filler, and no "Here is the content:" prefixes. Do not stop midway. Generate the entire piece from start to finish. Just the content itself.`;

    return prompt;
  },

  // Generate multiple variations
  buildBatchPrompt(pageData, modeKey, platformKey, count = 5) {
    const mode = this.modes[modeKey];
    const platform = this.platforms[platformKey];

    return `Generate ${count} completely different versions of ${mode.name.toLowerCase()} content based on this source, optimized for ${platform.name}.

Each version must use a different psychological hook and structural approach:
1. Pattern Interrupt Version (starts with something unexpected)
2. Curiosity Gap Version (reveals a gap in knowledge)
3. "I Used to Think" Version (classic viral framework)
4. Contrarian Version (challenges the source's premise)
5. Micro-Story Version (opens with a 2-sentence personal story)

${this.antiAiRules}

SOURCE: ${pageData.title} - ${pageData.content.substring(0, 15000)}

Label each version clearly and separate with "---" lines.`;
  },

  // Humanization score estimator (client-side heuristic)
  estimateHumanScore(text) {
    let score = 50;

    // Check sentence length variation (burstiness)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
    const burstiness = Math.sqrt(variance);

    if (burstiness > 8) score += 15;
    else if (burstiness > 5) score += 10;
    else score -= 10;

    // Check for AI tell-words
    const aiTells = ['delve', 'leverage', 'robust', 'comprehensive', 'furthermore', 
      'in conclusion', 'it\'s important to note', 'in today\'s', 'paradigm', 'synergy',
      'utilize', 'facilitate', 'moreover', 'consequently', 'groundbreaking'];
    const tellCount = aiTells.reduce((count, word) => {
      const regex = new RegExp(word, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    score -= tellCount * 5;

    // Check for contractions
    const contractions = (text.match(/\b(don\'t|can\'t|won\'t|here\'s|that\'s|it\'s|I\'m|you\'re|we\'re|they\'re|isn\'t|aren\'t|wasn\'t|weren\'t|haven\'t|hasn\'t|hadn\'t|wouldn\'t|couldn\'t|shouldn\'t|let\'s|there\'s|what\'s|who\'s|how\'s)\b/gi) || []).length;
    if (contractions > 5) score += 10;
    else if (contractions > 2) score += 5;
    else score -= 5;

    // Check for sentence fragments
    const fragments = (text.match(/\. [A-Z][a-z]{1,8}\./g) || []).length;
    if (fragments > 0) score += 5;

    // Check for personal pronouns
    const personal = (text.match(/\b(I|me|my|mine|myself|we|us|our|ours)/gi) || []).length;
    if (personal > 3) score += 10;

    // Check for rhetorical questions
    const rhetorical = (text.match(/\?/g) || []).length;
    if (rhetorical > 1) score += 5;

    // Check for em-dashes and parentheticals
    const dashes = (text.match(/—/g) || []).length;
    const parens = (text.match(/\([^)]+\)/g) || []).length;
    if (dashes + parens > 1) score += 5;

    // Check for ALL CAPS emphasis (but not shouting)
    const caps = (text.match(/\b[A-Z]{3,8}\b/g) || []).length;
    if (caps > 0 && caps < 5) score += 5;
    else if (caps >= 5) score -= 5;

    // Penalize perfect grammar indicators
    if (text.includes('In summary') || text.includes('To conclude') || text.includes('In conclusion')) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  },

  // Get all personas list
  getPersonasList() {
    return Object.entries(this.personas).map(([key, val]) => ({
      key,
      name: val.name,
      icon: val.icon,
      description: val.description
    }));
  },

  // Get all modes list
  getModesList() {
    return Object.entries(this.modes).map(([key, val]) => ({
      key,
      name: val.name,
      description: val.description
    }));
  },

  // Get all platforms list
  getPlatformsList() {
    return Object.entries(this.platforms).map(([key, val]) => ({
      key,
      name: val.name,
      description: val.constraints
    }));
  }
};

// Export for use in sidepanel
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
}
