// VibeContent Pro - Service Worker
// Version 1.1.0

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Side panel setup error:', error));

// ─── Provider Defaults ──────────────────────────────────────────────────────
const FALLBACK_URLS = {
  openai:     'https://api.openai.com/v1/chat/completions',
  anthropic:  'https://api.anthropic.com/v1/messages',
  gemini:     'https://generativelanguage.googleapis.com/v1beta/models/',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  nvidia:     'https://integrate.api.nvidia.com/v1/chat/completions'
};

const DEFAULT_MODELS = {
  openai:     'gpt-4o-mini',
  anthropic:  'claude-haiku-4-5',
  gemini:     'gemini-2.5-flash',
  openrouter: 'google/gemini-2.0-flash-exp:free',
  nvidia:     'meta/llama-3.3-70b-instruct'
};

// Used as Referer for OpenRouter; must be consistent across the extension.
const OPENROUTER_REFERER = 'https://vibecontent.pro';
const OPENROUTER_APP_TITLE = 'VibeContent Pro';

try {
  importScripts('lib/news-feed.js');
} catch (e) {
  console.error('Failed to import news-feed.js:', e);
}

// ─── Message Router ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchTrendingNews') {
    handleFetchTrendingNews(request.params).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  if (request.action === 'generateContent') {
    handleGeneration(request.data).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  if (request.action === 'testApiConnection') {
    testApiConnection(request.data).then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.action === 'extractPageContent') {
    handlePageExtraction(sender.tab.id).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  if (request.action === 'saveToVault') {
    saveToVault(request.data).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  if (request.action === 'getVault') {
    getVault().then(sendResponse);
    return true;
  }

  if (request.action === 'deleteFromVault') {
    deleteFromVault(request.id).then(sendResponse);
    return true;
  }

  if (request.action === 'getSettings') {
    getSettings().then(sendResponse);
    return true;
  }

  if (request.action === 'saveSettings') {
    saveSettings(request.data).then(sendResponse);
    return true;
  }

  if (request.action === 'fetchUrlContent') {
    fetchUrlContent(request.url).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }
});

// ─── Generation Core ───────────────────────────────────────────────────────
async function handleGeneration(data) {
  const settings = await getSettings();
  const provider = settings.provider || 'openai';

  // Support legacy single-key format
  const config = settings.providersConfig
    ? (settings.providersConfig[provider] || {})
    : { key: settings.apiKey, model: settings.model, url: getFallbackUrl(provider) };

  const apiKey = config.key;
  const model  = config.model || DEFAULT_MODELS[provider] || 'gpt-4o-mini';
  const url    = config.url   || getFallbackUrl(provider);
  const temperature = typeof settings.temperature === 'number' ? settings.temperature : 0.85;

  if (!apiKey) {
    throw new Error('API key not configured. Open Settings, paste your key, then click Save.');
  }
  if (!url || !url.startsWith('https://')) {
    throw new Error('Security Error: Base URL must use HTTPS.');
  }

  return callProvider(provider, { url, apiKey, model, data, temperature });
}

function getFallbackUrl(provider) {
  return FALLBACK_URLS[provider];
}

async function callProvider(provider, opts) {
  switch (provider) {
    case 'openai':     return fetchOpenAI(opts);
    case 'anthropic':  return fetchAnthropic(opts);
    case 'gemini':     return fetchGemini(opts);
    case 'openrouter': return fetchOpenRouter(opts);
    case 'nvidia':     return fetchNvidiaNim(opts);
    default: throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ─── Connection Test ────────────────────────────────────────────────────────
async function testApiConnection({ provider, url, model, apiKey }) {
  if (!apiKey) throw new Error('API key missing');
  if (!url || !url.startsWith('https://')) throw new Error('Secure Base URL missing (https:// required)');

  const data = {
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: 'Reply with the word "Connected" and nothing else.'
  };

  const effectiveModel = model || DEFAULT_MODELS[provider];
  const response = await callProvider(provider, {
    url,
    apiKey,
    model: effectiveModel,
    data,
    temperature: 0.2
  });

  if (response && typeof response.content === 'string' && response.content.length > 0) {
    return { success: true, sample: response.content.slice(0, 80) };
  }
  throw new Error('Invalid or empty response from API');
}

// ─── Error Helpers ──────────────────────────────────────────────────────────
async function parseErrorBody(response) {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

function extractErrorMessage(parsed, fallback) {
  if (!parsed) return fallback;
  // OpenAI / OpenRouter / NVIDIA shape
  if (parsed.error?.message) return parsed.error.message;
  // Anthropic shape
  if (parsed.error?.type && parsed.error?.message) return `${parsed.error.type}: ${parsed.error.message}`;
  // Gemini shape
  if (parsed.error?.status && parsed.error?.message) return `${parsed.error.status}: ${parsed.error.message}`;
  // NVIDIA detail
  if (parsed.detail) return typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
  // Raw text body
  if (parsed.rawText) return parsed.rawText.slice(0, 300);
  return fallback;
}

// ─── Provider Adapters ─────────────────────────────────────────────────────
async function fetchOpenAI({ url, apiKey, model, data, temperature }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: data.systemPrompt },
        { role: 'user',   content: data.userPrompt }
      ],
      temperature,
      max_tokens: 2500,
      top_p: 0.92,
      frequency_penalty: 0.3,
      presence_penalty: 0.4
    })
  });

  if (!response.ok) {
    const parsed = await parseErrorBody(response);
    throw new Error(extractErrorMessage(parsed, `OpenAI API error (${response.status})`));
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  const finishReason = result?.choices?.[0]?.finish_reason;

  if (finishReason && finishReason !== 'stop') {
    throw new Error(`OpenAI stopped unexpectedly mid-generation (Reason: ${finishReason})`);
  }

  if (!content) throw new Error('OpenAI returned no content');
  return { content };
}

async function fetchAnthropic({ url, apiKey, model, data, temperature }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for direct browser/extension calls; without this, Anthropic blocks CORS.
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2500,
      temperature,
      system: data.systemPrompt,
      messages: [
        { role: 'user', content: data.userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const parsed = await parseErrorBody(response);
    throw new Error(extractErrorMessage(parsed, `Anthropic API error (${response.status})`));
  }

  const result = await response.json();
  const block = result?.content?.find(b => b.type === 'text') || result?.content?.[0];
  const content = block?.text;
  const stopReason = result?.stop_reason;

  if (stopReason && stopReason !== 'end_turn' && stopReason !== 'stop_sequence') {
    throw new Error(`Anthropic stopped unexpectedly mid-generation (Reason: ${stopReason})`);
  }

  if (!content) throw new Error('Anthropic returned no text content');
  return { content };
}

async function fetchGemini({ url: baseUrl, apiKey, model, data, temperature }) {
  let endpoint = baseUrl;
  if (!endpoint || endpoint === FALLBACK_URLS.gemini) {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${data.systemPrompt}\n\n${data.userPrompt}` }] }
      ],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 2500,
        topP: 0.92
      }
    })
  });

  if (!response.ok) {
    const parsed = await parseErrorBody(response);
    throw new Error(extractErrorMessage(parsed, `Gemini API error (${response.status})`));
  }

  const result = await response.json();
  const parts = result?.candidates?.[0]?.content?.parts;
  const finishReason = result?.candidates?.[0]?.finishReason;
  
  if (!parts || !parts.length) {
    // Most common case: blocked by safety filter
    const reason = finishReason || result?.promptFeedback?.blockReason;
    throw new Error(reason ? `Gemini blocked response: ${reason}` : 'Unexpected Gemini response format');
  }
  
  // If the generation stopped due to SAFETY or other reasons before finishing naturally
  if (finishReason && finishReason !== 'STOP') {
    throw new Error(`Gemini stopped unexpectedly mid-generation (Reason: ${finishReason})`);
  }

  const content = parts.map(p => p.text || '').join('').trim();
  if (!content) throw new Error('Gemini returned empty content');
  return { content };
}

async function fetchOpenRouter({ url, apiKey, model, data, temperature }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': OPENROUTER_REFERER,
      'X-Title': OPENROUTER_APP_TITLE
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: data.systemPrompt },
        { role: 'user',   content: data.userPrompt }
      ],
      temperature,
      max_tokens: 2500
    })
  });

  if (!response.ok) {
    const parsed = await parseErrorBody(response);
    throw new Error(extractErrorMessage(parsed, `OpenRouter API error (${response.status})`));
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  const finishReason = result?.choices?.[0]?.finish_reason;

  if (finishReason && finishReason !== 'stop') {
    throw new Error(`OpenRouter stopped unexpectedly mid-generation (Reason: ${finishReason})`);
  }

  if (!content) throw new Error('OpenRouter returned no content');
  return { content };
}

async function fetchNvidiaNim({ url, apiKey, model, data, temperature }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: data.systemPrompt },
        { role: 'user',   content: data.userPrompt }
      ],
      temperature,
      max_tokens: 2500,
      top_p: 1,
      stream: false
    })
  });

  if (!response.ok) {
    const parsed = await parseErrorBody(response);
    throw new Error(extractErrorMessage(parsed, `NVIDIA NIM API error (${response.status})`));
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  const finishReason = result?.choices?.[0]?.finish_reason;

  if (finishReason && finishReason !== 'stop') {
    throw new Error(`NVIDIA NIM stopped unexpectedly mid-generation (Reason: ${finishReason})`);
  }

  if (!content) throw new Error('NVIDIA NIM returned no content');
  return { content };
}

// ─── Page Extraction ───────────────────────────────────────────────────────
async function handlePageExtraction(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractPageData
    });
    return results[0].result;
  } catch (error) {
    throw new Error('Failed to extract page content: ' + error.message);
  }
}

function extractPageData() {
  const getMeta = (name) => {
    const el = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"], meta[property="twitter:${name}"]`);
    return el ? el.getAttribute('content') : '';
  };

  const contentSelectors = [
    'article', '[role="main"]', '.post-content', '.entry-content',
    '.article-content', '.content', 'main', '#content', '.post',
    '[itemprop="articleBody"]'
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.length > 200) {
      contentElement = el;
      break;
    }
  }

  if (!contentElement) contentElement = document.body;

  const clone = contentElement.cloneNode(true);
  const removeSelectors = ['nav', 'header', 'footer', 'aside', '.sidebar',
    '.comments', '.advertisement', '.ad', 'script', 'style', 'noscript',
    '.social-share', '.related-posts', 'iframe', 'form'];

  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove());
  });

  const text = clone.innerText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
    .substring(0, 6000);

  return {
    title: document.title,
    url: window.location.href,
    description: getMeta('description'),
    author: getMeta('author') || getMeta('site_name'),
    publishDate: getMeta('published_time') || getMeta('pubdate'),
    content: text,
    wordCount: text.split(/\s+/).length,
    domain: window.location.hostname
  };
}

// ─── Vault ──────────────────────────────────────────────────────────────────
async function saveToVault(data) {
  const result = await chrome.storage.local.get(['vault']);
  const vault = result.vault || [];
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...data,
    createdAt: new Date().toISOString()
  };
  vault.unshift(item);
  await chrome.storage.local.set({ vault: vault.slice(0, 500) });
  return { success: true, item };
}

async function getVault() {
  const result = await chrome.storage.local.get(['vault']);
  return result.vault || [];
}

async function deleteFromVault(id) {
  const result = await chrome.storage.local.get(['vault']);
  const vault = (result.vault || []).filter(item => item.id !== id);
  await chrome.storage.local.set({ vault });
  return { success: true };
}

// ─── Settings ───────────────────────────────────────────────────────────────
function buildDefaultSettings() {
  return {
    provider: 'gemini',
    providersConfig: {
      openai:     { url: FALLBACK_URLS.openai,     key: '', model: DEFAULT_MODELS.openai },
      anthropic:  { url: FALLBACK_URLS.anthropic,  key: '', model: DEFAULT_MODELS.anthropic },
      gemini:     { url: FALLBACK_URLS.gemini,     key: '', model: DEFAULT_MODELS.gemini },
      openrouter: { url: FALLBACK_URLS.openrouter, key: '', model: DEFAULT_MODELS.openrouter },
      nvidia:     { url: FALLBACK_URLS.nvidia,     key: '', model: DEFAULT_MODELS.nvidia }
    },
    // Persona/mode are auto-suggested per platform in the side panel.
    defaultPersona: '',
    defaultPlatform: 'twitter',
    defaultMode: '',
    autoSave: true,
    language: 'en',
    temperature: 0.85
  };
}

async function getSettings() {
  const result = await chrome.storage.local.get(['settings']);
  if (result.settings) return result.settings;
  return buildDefaultSettings();
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
  return { success: true };
}

async function fetchUrlContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // DOMParser-created documents have no layout; use textContent, not innerText
    const text = (doc.body?.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 6000);

    return {
      title,
      url,
      description,
      content: text,
      wordCount: text.split(/\s+/).length
    };
  } catch (error) {
    throw new Error('Cannot fetch URL directly due to CORS. Open the page in a tab and use "Current Page" mode.');
  }
}

// ─── News Feed Handler ──────────────────────────────────────────────────────
async function handleFetchTrendingNews(params = {}) {
  if (params.topic === 'TRENDING_SEARCHES') {
    const trends = await fetchGoogleTrends(params);
    return { articles: trends };
  } else {
    const articles = await fetchGoogleNews(params);
    return { articles };
  }
}

// ─── Install Hook ──────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      vault: [],
      settings: buildDefaultSettings()
    });
  }
});
