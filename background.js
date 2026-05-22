chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Side panel setup error:', error));

// API Configuration
const API_CONFIG = {
  openai: { url: 'https://api.openai.com/v1/chat/completions' },
  anthropic: { url: 'https://api.anthropic.com/v1/messages' },
  gemini: { url: 'https://generativelanguage.googleapis.com/v1beta/models/' },
  openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions' },
  nvidia: { url: 'https://integrate.api.nvidia.com/v1/chat/completions' }
};

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateContent') {
    handleGeneration(request.data).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true; // Async response
  }

  if (request.action === 'testApiConnection') {
    testApiConnection(request.data).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
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

async function handleGeneration(data) {
  const settings = await getSettings();
  const provider = settings.provider || 'openai';
  const apiKey = settings.apiKey;
  const model = settings.model || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('API key not configured. Please add your API key in Settings.');
  }

  const config = API_CONFIG[provider];
  let response;

  if (provider === 'openai') {
    response = await fetchOpenAI(config.url, apiKey, model, data);
  } else if (provider === 'anthropic') {
    response = await fetchAnthropic(config.url, apiKey, model, data);
  } else if (provider === 'gemini') {
    response = await fetchGemini(config.url, apiKey, model, data);
  } else if (provider === 'openrouter') {
    response = await fetchOpenRouter(config.url, apiKey, model, data);
  } else if (provider === 'nvidia') {
    response = await fetchNvidiaNim(config.url, apiKey, model, data);
  }

  return response;
}

async function testApiConnection({ provider, model, apiKey }) {
  if (!apiKey) throw new Error('API key missing');
  
  const config = API_CONFIG[provider];
  const testData = {
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: 'Reply with the word "Connected" and nothing else.'
  };

  let response;
  if (provider === 'openai') {
    response = await fetchOpenAI(config.url, apiKey, model || 'gpt-4o-mini', testData);
  } else if (provider === 'anthropic') {
    response = await fetchAnthropic(config.url, apiKey, model || 'claude-3-haiku-20240307', testData);
  } else if (provider === 'gemini') {
    response = await fetchGemini(config.url, apiKey, model || 'gemini-flash-latest', testData);
  } else if (provider === 'openrouter') {
    response = await fetchOpenRouter(config.url, apiKey, model || 'meta-llama/llama-3.1-8b-instruct:free', testData);
  } else if (provider === 'nvidia') {
    response = await fetchNvidiaNim(config.url, apiKey, model || 'meta/llama-3.1-70b-instruct', testData);
  }

  if (response && response.content) {
    return { success: true };
  }
  throw new Error('Invalid response from API');
}

async function fetchOpenAI(url, apiKey, model, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: data.systemPrompt },
        { role: 'user', content: data.userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 8192,
      top_p: 0.92,
      frequency_penalty: 0.3,
      presence_penalty: 0.4
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const result = await response.json();
  return { content: result.choices[0].message.content };
}

async function fetchAnthropic(url, apiKey, model, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-cors-hack': 'true' // Sometimes needed for extensions
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 8192,
      temperature: 0.85,
      system: data.systemPrompt,
      messages: [
        { role: 'user', content: data.userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const result = await response.json();
  return { content: result.content[0].text };
}

async function fetchGemini(baseUrl, apiKey, model, data) {
  const url = `${baseUrl}${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${data.systemPrompt}\n\n${data.userPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 8192,
        topP: 0.92
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const result = await response.json();
  if (!result.candidates || !result.candidates[0]?.content?.parts) {
     throw new Error('Unexpected Gemini API response format');
  }
  return { content: result.candidates[0].content.parts[0].text };
}

async function fetchOpenRouter(url, apiKey, model, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://vibecontent-pro.local', // Required by OpenRouter
      'X-Title': 'VibeContent Pro' // Required by OpenRouter
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: data.systemPrompt },
        { role: 'user', content: data.userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const result = await response.json();
  return { content: result.choices[0].message.content };
}

async function fetchNvidiaNim(url, apiKey, model, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: data.systemPrompt },
        { role: 'user', content: data.userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 8192,
      top_p: 1
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.error?.message || 'NVIDIA NIM API error');
  }

  const result = await response.json();
  return { content: result.choices[0].message.content };
}

async function handlePageExtraction(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: extractPageData
    });
    return results[0].result;
  } catch (error) {
    throw new Error('Failed to extract page content: ' + error.message);
  }
}

function extractPageData() {
  // Advanced content extraction
  const getMeta = (name) => {
    const el = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"], meta[property="twitter:${name}"]`);
    return el ? el.getAttribute('content') : '';
  };

  // Try to find main content area
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

  // Fallback to body with noise removal
  if (!contentElement) contentElement = document.body;

  // Clean text
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
    .substring(0, 15000); // Limit length

  return {
    title: document.title,
    url: window.location.href,
    description: getMeta('description') || getMeta('description'),
    author: getMeta('author') || getMeta('site_name'),
    publishDate: getMeta('published_time') || getMeta('pubdate'),
    content: text,
    wordCount: text.split(/\s+/).length,
    domain: window.location.hostname
  };
}

async function saveToVault(data) {
  const result = await chrome.storage.local.get(['vault']);
  const vault = result.vault || [];
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...data,
    createdAt: new Date().toISOString()
  };
  vault.unshift(item);
  await chrome.storage.local.set({ vault: vault.slice(0, 500) }); // Max 500 items
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

async function getSettings() {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings || {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: '',
    defaultPersona: 'storyteller',
    defaultPlatform: 'linkedin',
    defaultMode: 'rephrase',
    autoSave: true,
    language: 'en',
    temperature: 0.85
  };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
  return { success: true };
}

async function fetchUrlContent(url) {
  // Note: Direct fetch from service worker may have CORS issues
  // This is a best-effort approach
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();

    // Basic HTML parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Extract text from body
    const body = doc.body;
    const text = body.innerText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000);

    return {
      title,
      url,
      description,
      content: text,
      wordCount: text.split(/\s+/).length
    };
  } catch (error) {
    throw new Error('Cannot fetch URL directly due to CORS. Please open the page in a tab and use "Current Page" mode.');
  }
}

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ 
      vault: [],
      settings: {
        provider: 'openai',
        apiKey: '',
        defaultPersona: 'storyteller',
        defaultPlatform: 'linkedin',
        defaultMode: 'rephrase',
        autoSave: true,
        language: 'en',
        temperature: 0.85
      }
    });
  }
});
